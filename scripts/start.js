const { exec } = require('child_process');
const { spawn } = require('child_process');

// Check DATABASE_URL
if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable is not set!');
  console.error('Please set DATABASE_URL in your environment variables.');
  console.error('Expected format: postgresql://username:password@svc.sel3.cloudtype.app:30255/database_name');
  process.exit(1);
}

// Mask password in URL for logging
const url = process.env.DATABASE_URL;
const maskedUrl = url.replace(/:[^:@]+@/, ':****@');
console.log('DATABASE_URL (masked):', maskedUrl);

// Check if URL contains the expected host
if (!url.includes('svc.sel3.cloudtype.app') && !url.includes('localhost') && !url.includes('127.0.0.1') && !url.includes('postgresql')) {
  console.warn('WARNING: DATABASE_URL does not contain expected CloudType host');
  console.warn('Expected formats:');
  console.warn('  - External: svc.sel3.cloudtype.app:30255');
  console.warn('  - Internal: postgresql:5432');
}

// Check for password encoding issues
if (url.includes('!@') && !url.includes('%21%40')) {
  console.error('ERROR: Password contains unencoded special characters (!@)');
  console.error('Please URL-encode the password: ! → %21, @ → %40');
  console.error('Example: z456qwe12!@ → z456qwe12%21%40');
}

// Test database connection first
console.log('Testing database connection...');
exec('node scripts/test-db.js', { timeout: 10000 }, (testError, testStdout, testStderr) => {
  if (testError) {
    console.error('Database connection test failed!');
    if (testStdout) console.log(testStdout);
    if (testStderr) console.error(testStderr);
    console.error('Server will start anyway, but database operations may fail.');
  } else {
    console.log('✓ Database connection test passed!');
    if (testStdout) console.log(testStdout);
  }

  // Try to run database migration/push, but continue even if it fails
  console.log('Attempting to sync database schema...');
  exec('npx prisma db push --accept-data-loss', { timeout: 30000 }, (error, stdout, stderr) => {
    if (error) {
      console.log('Database sync skipped or failed:', error.message);
      if (stderr) console.log('Stderr:', stderr);
      console.log('Continuing with server start...');
    } else {
      console.log('Database schema synced successfully');
      if (stdout) console.log(stdout);
    }

    // Start the server regardless of migration result
    console.log('Starting Next.js server...');

    // Force UTF-8 encoding and ensure client_encoding is set
    const env = {
      ...process.env,
      LANG: 'C.UTF-8',
      LC_ALL: 'C.UTF-8',
    };

    // Add client_encoding to DATABASE_URL if missing
    if (env.DATABASE_URL && !env.DATABASE_URL.includes('client_encoding')) {
      const separator = env.DATABASE_URL.includes('?') ? '&' : '?';
      env.DATABASE_URL = `${env.DATABASE_URL}${separator}client_encoding=utf8`;
      console.log('Added client_encoding=utf8 to DATABASE_URL');
    }

    const server = spawn('next', ['start', '-H', '0.0.0.0'], {
      stdio: 'inherit',
      shell: true,
      env: env
    });

    server.on('error', (err) => {
      console.error('Failed to start server:', err);
      process.exit(1);
    });

    server.on('exit', (code) => {
      if (code !== 0) {
        console.error(`Server exited with code ${code}`);
        process.exit(code);
      }
    });
  });
});


const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  console.log('Testing database connection...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'NOT SET');
  
  if (!process.env.DATABASE_URL) {
    console.error('ERROR: DATABASE_URL is not set!');
    process.exit(1);
  }

  // Mask password in URL for logging
  const url = process.env.DATABASE_URL;
  const maskedUrl = url.replace(/:[^:@]+@/, ':****@');
  console.log('DATABASE_URL (masked):', maskedUrl);
  
  // Check for special characters in password that need URL encoding
  const urlMatch = url.match(/postgresql:\/\/([^:]+):([^@]+)@(.+)/);
  if (urlMatch) {
    const [, username, password, rest] = urlMatch;
    if (password.includes('!') || password.includes('@') || password.includes('#') || 
        password.includes('$') || password.includes('%') || password.includes('&')) {
      console.warn('WARNING: Password contains special characters that may need URL encoding!');
      console.warn('Special characters in passwords should be URL-encoded:');
      console.warn('  ! → %21');
      console.warn('  @ → %40');
      console.warn('  # → %23');
      console.warn('  $ → %24');
      console.warn('  % → %25');
      console.warn('  & → %26');
    }
  }

  const prisma = new PrismaClient({
    log: ['error', 'warn'],
  });

  try {
    console.log('Attempting to connect...');
    await prisma.$connect();
    console.log('✓ Database connection successful!');
    
    // Test a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✓ Database query test successful!');
    
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('✗ Database connection failed!');
    console.error('Error:', error.message);
    console.error('Error code:', error.code);
    
    if (error.code === 'P1001') {
      console.error('\nPossible issues:');
      console.error('1. Database server is not running');
      console.error('2. DATABASE_URL is incorrect');
      console.error('3. Network/firewall blocking connection');
      console.error('4. Database credentials are wrong');
    }
    
    await prisma.$disconnect().catch(() => {});
    process.exit(1);
  }
}

testConnection();


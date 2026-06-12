import { spawn } from 'child_process';
import { Client } from 'ssh2';
import * as fs from 'fs';
import * as path from 'path';

// Load .env file manually
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf-8');
    envFile.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        }
        process.env[key] = value;
      }
    });
  }
}

loadEnv();

const dbUrl = process.env.DATABASE_URL || '';
const regex = /postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/;
const match = dbUrl.match(regex);
if (!match) {
  console.error('❌ DATABASE_URL is not set or in an invalid format in .env');
  process.exit(1);
}

const [, localUser, localPasswordEncoded, localHost, localPort, localDbnameRaw] = match;
const localPassword = decodeURIComponent(localPasswordEncoded);
const localDbname = localDbnameRaw.split('?')[0];

const configPath = path.join(process.cwd(), 'ssh-config.json');
if (!fs.existsSync(configPath)) {
  console.error('❌ ssh-config.json not found!');
  process.exit(1);
}
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

const LOCAL_PG_BIN = 'D:\\Gemini\\pg_bin\\pgsql\\bin';
const pgDumpPath = fs.existsSync(path.join(LOCAL_PG_BIN, 'pg_dump.exe'))
  ? path.join(LOCAL_PG_BIN, 'pg_dump.exe')
  : 'pg_dump';

console.log(`📡 Connecting to SSH remote server (${config.host}:${config.port})...`);
const conn = new Client();

conn.on('ready', () => {
  console.log('✅ SSH Connection established.');
  console.log('📤 Exporting local database and streaming to remote DB...');

  const safePassword = config.dbPassword.replace(/'/g, "'\\''");
  const psqlCmd = `export PGPASSWORD='${safePassword}'; psql -h localhost -U ${config.dbUser} -d ${config.dbName}`;

  conn.exec(psqlCmd, (err, stream) => {
    if (err) {
      console.error('❌ Failed to execute remote psql command:', err.message);
      conn.end();
      process.exit(1);
    }

    // Spawn pg_dump locally
    const pgDump = spawn(pgDumpPath, [
      '-h', localHost,
      '-p', localPort,
      '-U', localUser,
      '-d', localDbname,
      '--clean',       // Drop database objects before recreating
      '--if-exists',   // Use IF EXISTS when dropping objects
      '--no-owner',    // Skip setting ownership of objects
      '--no-privileges' // Skip restoring access privileges
    ], {
      env: { ...process.env, PGPASSWORD: localPassword }
    });

    // Pipe pg_dump stdout to remote psql stdin
    pgDump.stdout.pipe(stream);

    pgDump.stderr.on('data', (data) => {
      console.error(`[Local pg_dump error] ${data.toString().trim()}`);
    });

    stream.on('data', (data: any) => {
      process.stdout.write(data.toString());
    });

    stream.stderr.on('data', (data: any) => {
      process.stderr.write(data.toString());
    });

    pgDump.on('close', (code) => {
      console.log(`\n📦 Local pg_dump finished (Exit Code: ${code})`);
      if (code !== 0) {
        console.error('❌ Local dump failed. Closing SSH connection.');
        conn.end();
        process.exit(code || 1);
      }
    });

    stream.on('close', (code: number) => {
      console.log(`📥 Remote psql finished (Exit Code: ${code})`);
      conn.end();
      if (code === 0) {
        console.log('✅ Database synchronized successfully (Local -> Remote)!');
        process.exit(0);
      } else {
        console.error('❌ Database restore failed on remote server.');
        process.exit(code);
      }
    });
  });
}).on('error', (err) => {
  console.error('❌ SSH Error:', err.message);
  process.exit(1);
}).connect({
  host: config.host,
  port: config.port,
  username: config.username,
  password: config.password,
  readyTimeout: 30000
});

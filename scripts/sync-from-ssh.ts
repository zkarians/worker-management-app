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
const psqlPath = fs.existsSync(path.join(LOCAL_PG_BIN, 'psql.exe'))
  ? path.join(LOCAL_PG_BIN, 'psql.exe')
  : 'psql';

console.log(`📡 Connecting to SSH remote server (${config.host}:${config.port})...`);
const conn = new Client();

conn.on('ready', () => {
  console.log('✅ SSH Connection established.');
  console.log('📥 Exporting remote database and streaming to local DB...');

  const safePassword = config.dbPassword.replace(/'/g, "'\\''");
  // Run pg_dump on remote SSH host
  const pgDumpCmd = `export PGPASSWORD='${safePassword}'; pg_dump -h localhost -U ${config.dbUser} -d ${config.dbName} --clean --if-exists --no-owner --no-privileges`;

  conn.exec(pgDumpCmd, (err, stream) => {
    if (err) {
      console.error('❌ Failed to execute remote pg_dump command:', err.message);
      conn.end();
      process.exit(1);
    }

    // Spawn local psql command
    const psql = spawn(psqlPath, [
      '-h', localHost,
      '-p', localPort,
      '-U', localUser,
      '-d', localDbname
    ], {
      env: { ...process.env, PGPASSWORD: localPassword }
    });

    // Pipe remote pg_dump stdout to local psql stdin
    stream.pipe(psql.stdin);

    psql.stdout.on('data', (data) => {
      process.stdout.write(data.toString());
    });

    psql.stderr.on('data', (data) => {
      console.error(`[Local psql error] ${data.toString().trim()}`);
    });

    stream.stderr.on('data', (data: any) => {
      console.error(`[Remote pg_dump error] ${data.toString().trim()}`);
    });

    psql.on('close', (code) => {
      console.log(`\n📦 Local psql finished (Exit Code: ${code})`);
      if (code === 0) {
        console.log('✅ Database synchronized successfully (Remote -> Local)!');
        conn.end();
        process.exit(0);
      } else {
        console.error('❌ Local restore failed. Closing SSH connection.');
        conn.end();
        process.exit(code || 1);
      }
    });

    stream.on('close', (code: number) => {
      console.log(`📤 Remote pg_dump finished (Exit Code: ${code})`);
      if (code !== 0) {
        console.error('❌ Remote dump failed.');
        conn.end();
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

const { Client } = require('ssh2');

const host = '192.168.0.21';
const port = 9022;
const username = 'aidlux';
const password = 'z456qwe12!@';

const conn = new Client();
conn.on('ready', () => {
    console.log('✅ SSH Ready.');
    const sql = "SHOW password_encryption; SELECT rolname, CASE WHEN rolpassword LIKE 'SCRAM-SHA-256%' THEN 'SCRAM' WHEN rolpassword LIKE 'md5%' THEN 'MD5' ELSE 'OTHER' END as method FROM pg_authid WHERE rolname = 'aidlux';";
    const cmd = `export PGPASSWORD='${password}'; psql -U postgres -tAc "${sql}"`;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', (data) => process.stdout.write(data.toString()));
        stream.stderr.on('data', (data) => process.stderr.write(data.toString()));
        stream.on('close', () => {
            conn.end();
            process.exit(0);
        });
    });
}).on('error', (err) => {
    console.error('❌ SSH Error:', err.message);
    process.exit(1);
}).connect({ host, port, username, password });

const { Client } = require('ssh2');

const host = '192.168.0.21';
const port = 9022;
const username = 'aidlux';
const password = 'z456qwe12!@';
const dbname = 'work';

const conn = new Client();
conn.on('ready', () => {
    // ONLY check tablenames
    const cmd = `export PGPASSWORD='${password}'; psql -U aidlux -d ${dbname} -c "SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public' ORDER BY tablename;"`;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;
        stream.on('data', (data) => {
            process.stdout.write(data.toString());
        });
        stream.stderr.on('data', (data) => {
            process.stderr.write(data.toString());
        });
        stream.on('close', (code) => {
            conn.end();
            process.exit(code);
        });
    });
}).on('error', (err) => {
    console.error('❌ SSH Error:', err.message);
    process.exit(1);
}).connect({ host, port, username, password });

const { Client } = require('ssh2');

const host = '192.168.0.24';
const port = 9022;
const username = 'aidlux';
const password = 'z456qwe12!@';

const conn = new Client();
conn.on('ready', () => {
    const query = `export PGPASSWORD='${password}'; psql -U aidlux -d postgres -t -c "SELECT datname FROM pg_database WHERE datistemplate = false"`;

    conn.exec(query, (err, stream) => {
        if (err) throw err;
        stream.on('data', (data) => console.log('Databases:', data.toString().trim()));
        stream.stderr.on('data', (data) => console.error('STDERR:', data.toString()));
        stream.on('close', () => {
            conn.end();
            process.exit(0);
        });
    });
}).on('error', (err) => {
    console.error('❌ SSH Error:', err.message);
    process.exit(1);
}).connect({ host, port, username, password });

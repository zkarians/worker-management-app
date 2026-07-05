const { Client } = require('ssh2');

const host = '192.168.0.24';
const port = 9022;
const username = 'aidlux';
const password = 'z456qwe12!@';
const dbname = 'work';

const conn = new Client();
conn.on('ready', () => {
    console.log('✅ SSH Connection Ready for Verification.');

    // Simpler queries, run one by one if needed, but here we just escape carefully.
    // Using a heredoc or separate commands is cleaner.
    const query = `
      export PGPASSWORD='${password}';
      psql -U aidlux -d ${dbname} -t -c "SELECT count(*) FROM \\"Worker\\";"
    `;

    conn.exec(query, (err, stream) => {
        if (err) throw err;
        stream.on('data', (data) => console.log('Worker count:', data.toString().trim()));
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

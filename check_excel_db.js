const { Client } = require('ssh2');

const host = '192.168.0.24';
const port = 9022;
const username = 'aidlux';
const password = 'z456qwe12!@';
const dbname = 'excel';

const conn = new Client();
conn.on('ready', () => {
    console.log(`✅ SSH Connection Ready for checking "${dbname}"...`);

    // First check if DB exists by connecting to postgres and listing dbs
    // Then list tables in excel
    const query = `
      export PGPASSWORD='${password}';
      psql -U aidlux -d postgres -t -c "SELECT 1 FROM pg_database WHERE datname='${dbname}'" | grep 1 || echo "DB_NOT_FOUND";
      psql -U aidlux -d ${dbname} -t -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'" || echo "ERROR_CONNECTING";
    `;

    conn.exec(query, (err, stream) => {
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

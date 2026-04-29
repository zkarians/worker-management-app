const fs = require('fs');
const { Client } = require('ssh2');

const host = '192.168.0.21';
const port = 9022;
const username = 'aidlux';
const password = 'z456qwe12!@';
const sqlFilePath = 'D:\\Downloads\\worker_db_dump_work_2026-03-26.sql';
const dbname = 'work';

console.log(`📡 Attempting direct VERBOSE binary streaming of ${sqlFilePath} to db "${dbname}"...`);

const conn = new Client();
conn.on('ready', () => {
    console.log('✅ SSH Connection Ready.');
    // Enable -a (echo-all) and -v (variable set) to see commands being executed
    const cmd = `export PGPASSWORD='${password}'; psql -U aidlux -d ${dbname} -a`;
    conn.exec(cmd, (err, stream) => {
        if (err) throw err;

        const fileStream = fs.createReadStream(sqlFilePath);
        fileStream.pipe(stream);

        // LOG EVERYTHING from stdout and stderr
        stream.on('data', (data) => {
            process.stdout.write(data.toString());
        });
        stream.stderr.on('data', (data) => {
            process.stderr.write(data.toString());
        });

        stream.on('close', (code) => {
            console.log(`\n✅ FINAL RESTORE STATUS: ${code}`);
            conn.end();
            process.exit(code);
        });
    });
}).on('error', (err) => {
    console.error('❌ SSH Error:', err.message);
    process.exit(1);
}).connect({ host, port, username, password, readyTimeout: 60000 });

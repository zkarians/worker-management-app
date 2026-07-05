const fs = require('fs');
const { Client } = require('ssh2');

const host = '192.168.0.24';
const port = 9022;
const username = 'aidlux';
const password = 'z456qwe12!@';
const sqlFilePath = 'D:\\Downloads\\worker_db_dump_work_2026-04-12.sql';
const dbname = 'work';

console.log(`📡 Attempting direct binary streaming of ${sqlFilePath} to db "${dbname}" on ${host}...`);

const conn = new Client();
conn.on('ready', () => {
    console.log('✅ SSH Connection Ready.');

    // Step 1: Ensure database exists
    const createDbCmd = `export PGPASSWORD='${password}'; psql -U aidlux -d postgres -c "CREATE DATABASE ${dbname};" || echo "DB already exists or failed to create"`;

    conn.exec(createDbCmd, (err, stream) => {
        if (err) {
            console.error('❌ Creation Exec Error:', err.message);
            conn.end();
            process.exit(1);
        }

        stream.on('close', (code) => {
            console.log(`📡 Database status checked/created (Code: ${code}). Proceeding to restore...`);

            // Step 2: Restore
            const restoreCmd = `export PGPASSWORD='${password}'; psql -U aidlux -d ${dbname} -a`;
            conn.exec(restoreCmd, (err, rStream) => {
                if (err) {
                    console.error('❌ Restore Exec Error:', err.message);
                    conn.end();
                    process.exit(1);
                }

                const fileStream = fs.createReadStream(sqlFilePath);
                fileStream.pipe(rStream);

                rStream.on('data', (data) => {
                    process.stdout.write(data.toString());
                });
                rStream.stderr.on('data', (data) => {
                    process.stderr.write(data.toString());
                });

                rStream.on('close', (rCode) => {
                    console.log(`\n✅ FINAL RESTORE STATUS: ${rCode}`);
                    conn.end();
                    process.exit(rCode);
                });
            });
        });

        stream.on('data', (data) => console.log('STDOUT:', data.toString()));
        stream.stderr.on('data', (data) => console.error('STDERR:', data.toString()));
    });
}).on('error', (err) => {
    console.error('❌ SSH Connection Error:', err.message);
    process.exit(1);
}).connect({ host, port, username, password, readyTimeout: 60000 });

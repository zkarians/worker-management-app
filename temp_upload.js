const fs = require('fs');
const { Client } = require('ssh2');

const host = '192.168.0.21';
const port = 9022;
const username = 'aidlux';
const password = 'z456qwe12!@';
const localFile = 'D:\\Downloads\\worker_db_dump_work_2026-03-26.sql';
const remoteFile = '/tmp/worker_db_dump_work_2026-03-26.sql';

console.log(`📡 Start direct SSH upload for ${localFile}...`);

const conn = new Client();
conn.on('ready', () => {
    // We use cat to write the file via stdin pipe
    conn.exec(`cat > "${remoteFile}"`, (err, stream) => {
        if (err) throw err;

        const readStream = fs.createReadStream(localFile);
        readStream.pipe(stream);

        stream.on('close', (code) => {
            console.log(`✅ Upload Finished (Exit Code: ${code})`);
            conn.end();
            process.exit(0);
        });
    });
}).on('error', (err) => {
    console.error('❌ SSH Error:', err.message);
    process.exit(1);
}).connect({ host, port, username, password });

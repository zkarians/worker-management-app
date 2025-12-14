const fs = require('fs');
const path = require('path');

const APP_URL = 'https://port-0-node-express-mikozlgaf4d4aa53.sel3.cloudtype.app';
const BACKUP_SECRET = 'my-secure-backup-key-2024';

async function downloadBackup() {
    const url = `${APP_URL}/api/admin/backup`;
    console.log(`Downloading from: ${url}`);

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${BACKUP_SECRET}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `cloudtype-backup-${timestamp}.json`;
        const filepath = path.join(__dirname, '..', 'backup', filename);

        fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
        console.log(`✅ Backup saved to: ${filepath}`);
    } catch (error) {
        console.error('❌ Download failed:', error.message);
        process.exit(1);
    }
}

downloadBackup();

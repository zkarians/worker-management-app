const { Client } = require('pg');

async function checkDatabase() {
    const connectionString = 'postgresql://Administrator@localhost:5432/postgres';
    const client = new Client({ connectionString });

    console.log('--- Database Check ---');
    console.log('Connecting to PostgreSQL (postgres database)...');

    try {
        await client.connect();
        console.log('✓ PostgreSQL is RUNNING.');

        const res = await client.query("SELECT datname FROM pg_database WHERE datname = 'work'");
        if (res.rows.length > 0) {
            console.log('✓ Database "work" EXISTS.');
        } else {
            console.log('✗ Database "work" DOES NOT EXIST.');
        }

        await client.end();
    } catch (err) {
        console.log('✗ PostgreSQL connection FAILED.');
        console.log('Error:', err.message);
        
        console.log('\nChecking if running on port 5433 (docker config hint)...');
        const dockerClient = new Client({ connectionString: 'postgresql://user:password@localhost:5433/postgres' });
        try {
            await dockerClient.connect();
            console.log('✓ PostgreSQL is RUNNING (on port 5433).');
            const res = await dockerClient.query("SELECT datname FROM pg_database WHERE datname = 'work' OR datname = 'worker_db'");
            console.log('Found databases:', res.rows.map(r => r.datname).join(', '));
            await dockerClient.end();
        } catch (dockerErr) {
            console.log('✗ PostgreSQL connection on 5433 also FAILED.');
        }
    }
}

checkDatabase();

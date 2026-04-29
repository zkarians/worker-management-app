
const { Client } = require('pg');

async function testVariation(name, config) {
    console.log(`Testing: ${name}...`);
    const client = new Client(config);
    try {
        await client.connect();
        console.log(`  ✓ ${name} SUCCESS!`);
        await client.end();
        return true;
    } catch (err) {
        console.log(`  ✗ ${name} FAILED: ${err.message}`);
        return false;
    }
}

async function runTests() {
    console.log('--- Multi-Variation DB Check ---');

    const baseConfig = {
        user: 'u0_a286',
        password: 'z456qwe12!@',
        host: 'maizen.iptime.org',
        port: 5432,
        connectionTimeoutMillis: 5000,
    };

    // Variations
    await testVariation('Standard (defaultdb)', { ...baseConfig, database: 'defaultdb' });
    await testVariation('Standard (postgres)', { ...baseConfig, database: 'postgres' });
    await testVariation('SSL (defaultdb)', { ...baseConfig, database: 'defaultdb', ssl: { rejectUnauthorized: false } });
    await testVariation('URL-Encoded Password (worker_db)', { ...baseConfig, database: 'worker_db', password: encodeURIComponent('z456qwe12!@') });
}

runTests();

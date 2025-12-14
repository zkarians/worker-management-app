const { Client } = require('pg');

const connectionString = 'postgresql://postgres@127.0.0.1:5432/postgres';

console.log('Testing connection to:', connectionString);

const client = new Client({
    user: 'postgres',
    host: '127.0.0.1',
    database: 'postgres',
    password: null,
    port: 5432,
});

async function testConnection() {
    try {
        await client.connect();
        console.log('Successfully connected to the database!');
        const res = await client.query('SELECT NOW()');
        console.log('Current time from DB:', res.rows[0]);
        await client.end();
        process.exit(0);
    } catch (err) {
        console.error('Connection error:', err);
        process.exit(1);
    }
}

testConnection();

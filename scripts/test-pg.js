const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function test() {
    try {
        await client.connect();
        console.log('Connected successfully');
        const res = await client.query('SELECT $1::text as message', ['Hello world!']);
        console.log(res.rows[0].message);
        await client.end();
    } catch (err) {
        console.error('Connection error', err.stack);
    }
}

test();

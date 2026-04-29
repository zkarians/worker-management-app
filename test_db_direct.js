const { Client } = require('pg');

const connectionString = "postgresql://aidlux:z456qwe12!@maizen.iptime.org:5432/work?sslmode=disable";

async function check() {
    const client = new Client({ connectionString });
    try {
        console.log("📡 Connecting to DB via maizen.iptime.org:5432...");
        await client.connect();
        console.log("✅ Connection SUCCESS.");

        const res = await client.query("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'");
        console.log("📊 Tables found:", res.rows.map(r => r.tablename).join(', '));

        const userRes = await client.query("SELECT COUNT(*) FROM \"User\"").catch(() => null);
        if (userRes) {
            console.log("👤 Users in Table:", userRes.rows[0].count);
        } else {
            console.log("⚠️ No 'User' table found.");
        }
    } catch (err) {
        console.error("❌ Connection FAILED:", err.message);
    } finally {
        await client.end();
    }
}

check();

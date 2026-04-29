const { SignJWT } = require('jose');
const fetch = require('node-fetch');

// Hardcoded secret for testing (matches development fallback)
const SECRET = 'your-secret-key-12345';
const KEY = new TextEncoder().encode(SECRET);

async function signToken(payload) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(KEY);
}

async function test() {
    try {
        const payload = {
            id: '719db27f-f349-4d22-a036-b9c1c1fcb753',
            username: 'admin',
            role: 'MANAGER'
        };
        const token = await signToken(payload);
        
        const attendanceRecord = {
            userId: "dc1d84f1-e264-42ab-84d2-13e671058c0e",
            date: "2026-04-21",
            status: "OFF_DAY",
            workHours: 0,
            overtimeHours: 0
        };
        
        console.log('Sending POST request to /api/attendance...');
        const response = await fetch('http://localhost:3001/api/attendance', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': `token=${token}`
            },
            body: JSON.stringify(attendanceRecord)
        });
        
        const result = await response.json();
        console.log('API Response:', JSON.stringify(result, null, 2));
        
        if (response.ok && result.attendance.workHours === 0) {
            console.log('SUCCESS: API correctly handled workHours: 0');
        } else {
            console.log('FAILURE: API did not return expected workHours: 0');
        }
        
    } catch (error) {
        console.error('ERROR:', error);
    }
}

test();

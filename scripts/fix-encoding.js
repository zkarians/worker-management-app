const fs = require('fs');
const path = require('path');

// CP1252 to Byte mapping for 0x80-0x9F
const cp1252Map = {
    0x20AC: 0x80, // €
    0x201A: 0x82, // ‚
    0x0192: 0x83, // ƒ
    0x201E: 0x84, // „
    0x2026: 0x85, // …
    0x2020: 0x86, // †
    0x2021: 0x87, // ‡
    0x02C6: 0x88, // ˆ
    0x2030: 0x89, // ‰
    0x0160: 0x8A, // Š
    0x2039: 0x8B, // ‹
    0x0152: 0x8C, // Œ
    0x017D: 0x8E, // Ž
    0x2018: 0x91, // ‘
    0x2019: 0x92, // ’
    0x201C: 0x93, // “
    0x201D: 0x94, // ”
    0x2022: 0x95, // •
    0x2013: 0x96, // –
    0x2014: 0x97, // —
    0x02DC: 0x98, // ˜
    0x2122: 0x99, // ™
    0x0161: 0x9A, // š
    0x203A: 0x9B, // ›
    0x0153: 0x9C, // œ
    0x017E: 0x9E, // ž
    0x0178: 0x9F, // Ÿ
};

function stringToCp1252Buffer(str) {
    const len = str.length;
    const buf = Buffer.alloc(len);
    for (let i = 0; i < len; i++) {
        const code = str.charCodeAt(i);
        if (code < 0x80) {
            buf[i] = code;
        } else if (cp1252Map[code]) {
            buf[i] = cp1252Map[code];
        } else if (code >= 0xA0 && code <= 0xFF) {
            buf[i] = code;
        } else {
            // Fallback: use lower 8 bits (same as 'latin1')
            buf[i] = code & 0xFF;
        }
    }
    return buf;
}

// Function to fix string encoding
function fixString(str) {
    if (typeof str !== 'string') return str;
    try {
        // Convert string (interpreted as CP1252) back to bytes
        const buf = stringToCp1252Buffer(str);
        // Decode bytes as UTF-8
        return buf.toString('utf8');
    } catch (e) {
        return str;
    }
}

// Recursive function to traverse and fix object
function fixObject(obj) {
    if (Array.isArray(obj)) {
        return obj.map(fixObject);
    } else if (typeof obj === 'object' && obj !== null) {
        const newObj = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                newObj[key] = fixObject(obj[key]);
            }
        }
        return newObj;
    } else if (typeof obj === 'string') {
        // CRITICAL: We must ONLY fix strings that look like Latin-1/CP1252.
        // If the string contains characters > 255 that are NOT in the CP1252 map,
        // it implies it might be a valid Unicode string already (e.g. "한글").

        let isLikelyMojibake = true;
        for (let i = 0; i < obj.length; i++) {
            const code = obj.charCodeAt(i);
            if (code > 0xFF && !cp1252Map[code]) {
                isLikelyMojibake = false;
                break;
            }
        }

        if (isLikelyMojibake) {
            return fixString(obj);
        }
        return obj;
    }
    return obj;
}

// Main function
function main() {
    const backupDir = path.join(__dirname, '..', 'backup');

    // Find the latest backup file (excluding the fixed one)
    const files = fs.readdirSync(backupDir)
        .filter(file => file.startsWith('cloudtype-backup-') && file.endsWith('.json'))
        .sort()
        .reverse();

    if (files.length === 0) {
        console.error('No backup file found.');
        process.exit(1);
    }

    const inputFile = path.join(backupDir, files[0]);
    const outputFile = path.join(backupDir, 'utf8-fixed-backup.json');

    console.log(`Reading from: ${inputFile}`);
    const data = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

    console.log('Fixing encoding...');
    const fixedData = fixObject(data);

    console.log(`Writing to: ${outputFile}`);
    fs.writeFileSync(outputFile, JSON.stringify(fixedData, null, 2), 'utf8');

    console.log('✅ Encoding fix completed!');
}

main();

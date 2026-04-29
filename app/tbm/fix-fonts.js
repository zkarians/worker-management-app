const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'tbm-content-clean.ts');
let lines = fs.readFileSync(filePath, 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
    // Only apply to rows after section 1 header (which happens around line 299)
    if (i > 300) {
        if (lines[i].includes('2. 사업주 및 근로자 준수사항') || lines[i].includes('재해형태')) {
            continue; // Skip section headers
        }
        // Inject a class to identify these cells
        lines[i] = lines[i].replace(/<td /g, '<td class="safety-rule-item" ');
    }
}

fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
console.log('Successfully injected safety-rule-item class');

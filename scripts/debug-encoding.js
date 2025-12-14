const str = "(ì£¼)ë³´ëžŒê´€ë¦¬";

console.log('Original:', str);
console.log('Codes:', str.split('').map(c => c.charCodeAt(0).toString(16)).join(' '));

const buf = Buffer.from(str, 'latin1');
console.log('Buffer (latin1):', buf);

const fixed = buf.toString('utf8');
console.log('Fixed (utf8):', fixed);
console.log('Fixed Codes:', fixed.split('').map(c => c.charCodeAt(0).toString(16)).join(' '));

// Check if it matches expected "(주)보람관리"
const expected = "(주)보람관리";
console.log('Expected:', expected);
console.log('Match?', fixed === expected);

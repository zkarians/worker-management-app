// Helper script to fix DATABASE_URL with special characters in password

const originalUrl = process.env.DATABASE_URL || 'postgresql://root:z456qwe12!@@svc.sel3.cloudtype.app:30255/postgres';

console.log('Original DATABASE_URL:', originalUrl.replace(/:[^:@]+@/, ':****@'));

// Parse the URL
const match = originalUrl.match(/postgresql:\/\/([^:]+):([^@]+)@(.+)/);

if (!match) {
  console.error('Invalid DATABASE_URL format!');
  process.exit(1);
}

const [, username, password, rest] = match;

console.log('Username:', username);
console.log('Password (masked):', '*'.repeat(password.length));
console.log('Host/Database:', rest);

// URL encode special characters in password
const encodedPassword = encodeURIComponent(password);

// Reconstruct the URL
const fixedUrl = `postgresql://${username}:${encodedPassword}@${rest}`;

console.log('\nFixed DATABASE_URL:', fixedUrl.replace(/:[^:@]+@/, ':****@'));
console.log('\nUse this in your environment variables:');
console.log(fixedUrl);

// Test the fixed URL
if (originalUrl.includes('!@')) {
  console.log('\n⚠️  Your password contains "!@" which needs to be encoded as "%21%40"');
  console.log('Example:');
  console.log('  Original: postgresql://root:z456qwe12!@@host/db');
  console.log('  Fixed:    postgresql://root:z456qwe12%21%40@host/db');
}




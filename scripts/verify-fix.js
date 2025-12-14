const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Verifying company names...');
    const companies = await prisma.company.findMany();

    console.log('Found companies:', companies.length);
    companies.forEach(c => {
        console.log(`- ${c.name}`);
    });

    // Check for specific known company
    const boram = companies.find(c => c.name.includes('보람관리'));
    if (boram) {
        console.log('✅ Found "(주)보람관리" correctly!');
    } else {
        console.log('❌ Could not find "(주)보람관리". Encoding might still be broken.');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());

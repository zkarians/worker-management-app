import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function importData(filename: string) {
    console.log('📥 Importing data to database...')
    console.log(`📁 Reading from: ${filename}`)

    try {
        let fileContent = fs.readFileSync(filename, 'utf-8')
        // Strip BOM if present
        if (fileContent.charCodeAt(0) === 0xFEFF) {
            fileContent = fileContent.slice(1)
        }

        const parsedData = JSON.parse(fileContent)
        const data = parsedData.data || parsedData

        console.log('🔄 Starting transaction...');

        // Use interactive transaction to ensure atomicity
        await prisma.$transaction(async (tx) => {
            console.log('🗑️  Clearing existing data (within transaction)...');

            // Delete in reverse order
            const models = [
                'rosterAssignment', 'roster', 'attendance', 'leaveRequest',
                'dailyLog', 'announcement', 'product', 'category',
                'passwordResetToken', 'safetyEducation', 'schedule',
                'user', 'team', 'company', 'systemConfig'
            ];

            const modelToKeyMap: Record<string, string> = {
                company: 'companies',
                team: 'teams',
                user: 'users',
                attendance: 'attendances',
                leaveRequest: 'leaveRequests',
                roster: 'rosters',
                rosterAssignment: 'rosterAssignments',
                dailyLog: 'dailyLogs',
                announcement: 'announcements',
                category: 'categories',
                product: 'products',
                schedule: 'schedules',
                safetyEducation: 'safetyEducations',
                systemConfig: 'systemConfig',
                passwordResetToken: 'users',
            };

            for (const model of models) {
                const key = modelToKeyMap[model] || model;
                const hasKey = data[key] !== undefined || 
                    (model === 'safetyEducation' && data['safetyEducation'] !== undefined);

                // @ts-ignore
                if (tx[model] && hasKey) {
                    console.log(`  🗑️  Clearing ${model}...`);
                    // @ts-ignore
                    await tx[model].deleteMany();
                }
            }
            console.log('✅ Existing data cleared');

            console.log('📝 Importing new data (within transaction)...');

            const importOrder = [
                { key: 'systemConfig', model: 'systemConfig' },
                { key: 'companies', model: 'company' },
                { key: 'teams', model: 'team' },
                { key: 'users', model: 'user' },
                { key: 'categories', model: 'category' },
                { key: 'products', model: 'product' },
                { key: 'attendances', model: 'attendance' },
                { key: 'leaveRequests', model: 'leaveRequest' },
                { key: 'rosters', model: 'roster' },
                { key: 'rosterAssignments', model: 'rosterAssignment' },
                { key: 'dailyLogs', model: 'dailyLog' },
                { key: 'announcements', model: 'announcement' },
                { key: 'schedules', model: 'schedule' },
                { key: 'safetyEducations', model: 'safetyEducation' },
                { key: 'safetyEducation', model: 'safetyEducation' }
            ];

            for (const { key, model } of importOrder) {
                const items = data[key];
                if (items && items.length > 0) {
                    // Pre-process dates
                    const processedItems = items.map((item: any) => {
                        const newItem = { ...item };
                        for (const k in newItem) {
                            if (typeof newItem[k] === 'string' &&
                                /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(newItem[k])) {
                                newItem[k] = new Date(newItem[k]);
                            }
                        }
                        return newItem;
                    });

                    // Use createMany if possible, but inside transaction
                    try {
                        // @ts-ignore
                        await tx[model].createMany({
                            data: processedItems,
                            skipDuplicates: true
                        });
                        console.log(`  ✓ Imported ${items.length} ${key}`);
                    } catch (e) {
                        console.log(`  ⚠️ Batch import failed for ${key}, trying individually...`);
                        for (const item of processedItems) {
                            // @ts-ignore
                            await tx[model].create({ data: item });
                        }
                        console.log(`  ✓ Imported ${items.length} ${key} (Individual fallback)`);
                    }
                }
            }
        }, {
            maxWait: 60000, // default: 2000
            timeout: 600000  // default: 5000 (Set to 10 minutes for large data)
        });

        console.log('\n✅ Data imported successfully! (Transaction committed)');

    } catch (error) {
        console.error('\n❌ Error importing data (Transaction ROLLED BACK):');
        console.error(error);
        process.exit(1);
    } finally {
        await prisma.$disconnect()
    }
}

const filename = process.argv[2]

if (!filename) {
    console.error('❌ Please provide a filename as an argument')
    process.exit(1)
}

const fullPath = path.isAbsolute(filename)
    ? filename
    : path.join(process.cwd(), filename)

if (!fs.existsSync(fullPath)) {
    console.error(`❌ File not found: ${fullPath}`)
    process.exit(1)
}

importData(fullPath)
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })

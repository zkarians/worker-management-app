import { prisma } from './prisma';

export async function getAllData(p: any = prisma, includeProducts: boolean = false) {
    const data: any = {
        companies: await p.company.findMany(),
        teams: await p.team.findMany(),
        users: await p.user.findMany(),
        attendances: await p.attendance.findMany(),
        leaveRequests: await p.leaveRequest.findMany(),
        rosters: await p.roster.findMany(),
        rosterAssignments: await p.rosterAssignment.findMany(),
        dailyLogs: await p.dailyLog.findMany(),
        announcements: await p.announcement.findMany(),
        categories: await p.category.findMany(),
        schedules: await p.schedule.findMany(),
        safetyEducation: await p.safetyEducation.findMany(),
        systemConfig: await p.systemConfig.findMany(),
    };
    if (includeProducts) {
        data.products = await p.product.findMany();
    }
    return data;
}

export async function restoreAllData(data: any, p: any = prisma) {
    return await p.$transaction(async (tx: any) => {
        // Delete in reverse order of dependencies
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
            safetyEducation: 'safetyEducation',
            systemConfig: 'systemConfig',
            passwordResetToken: 'users',
        };

        for (const model of models) {
            const key = modelToKeyMap[model] || model;
            const hasKey = data[key] !== undefined || (model === 'safetyEducation' && data['safetyEducations'] !== undefined);

            // @ts-ignore
            if (tx[model] && hasKey) {
                // @ts-ignore
                await tx[model].deleteMany();
            }
        }

        // Import in order of dependencies
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
            { key: 'safetyEducation', model: 'safetyEducation' },
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

                // @ts-ignore
                if (tx[model]) {
                    try {
                        // @ts-ignore
                        await tx[model].createMany({
                            data: processedItems,
                            skipDuplicates: true
                        });
                    } catch (e) {
                        console.log(`Batch import failed for ${key}, trying individually...`);
                        for (const item of processedItems) {
                            // @ts-ignore
                            await tx[model].create({ data: item });
                        }
                    }
                }
            }
        }
        return { success: true };
    }, {
        maxWait: 20000,
        timeout: 120000 // 2 minutes for large datasets
    });
}

export async function generateSqlBackup(p: any = prisma): Promise<string> {
    const data = await getAllData(p);
    let sql = `-- Backup generated on ${new Date().toISOString()}\n`;
    sql += `-- Version independent format (Custom SQL Exporter)\n\n`;
    sql += `BEGIN;\n\n`;

    // 1. Clear all data first
    const tables = [
        { name: 'RosterAssignment', key: 'rosterAssignments' },
        { name: 'Roster', key: 'rosters' },
        { name: 'Attendance', key: 'attendances' },
        { name: 'LeaveRequest', key: 'leaveRequests' },
        { name: 'DailyLog', key: 'dailyLogs' },
        { name: 'Announcement', key: 'announcements' },
        { name: 'Product', key: 'products' },
        { name: 'PasswordResetToken', key: 'users' },
        { name: 'User', key: 'users' },
        { name: 'Company', key: 'companies' },
        { name: 'Team', key: 'teams' },
        { name: 'Category', key: 'categories' },
        { name: 'Schedule', key: 'schedules' },
        { name: 'SystemConfig', key: 'systemConfig' },
        { name: 'SafetyEducation', key: 'safetyEducation' }
    ];

    for (const table of tables) {
        if ((data as any)[table.key] !== undefined || table.name === 'PasswordResetToken') {
            sql += `TRUNCATE TABLE "${table.name}" CASCADE;\n`;
        }
    }
    sql += `\n`;

    // Helper to format values
    const formatValue = (val: any) => {
        if (val === null || val === undefined) return 'NULL';
        if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
        if (val instanceof Date) return `'${val.toISOString()}'`;
        if (Array.isArray(val) || (typeof val === 'object' && val !== null)) return `'${JSON.stringify(val)}'`;
        if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
        return val;
    };

    // 2. Insert data in correct dependency order
    const insertInto = (tableName: string, rows: any[]) => {
        if (!rows || rows.length === 0) return '';
        let chunk = `-- Data for ${tableName}\n`;
        const columns = Object.keys(rows[0]);
        const colString = columns.map(c => `"${c}"`).join(', ');

        for (const row of rows) {
            const values = columns.map(col => formatValue(row[col])).join(', ');
            chunk += `INSERT INTO "${tableName}" (${colString}) VALUES (${values});\n`;
        }
        return chunk + '\n';
    };

    // Correct order for foreign keys
    sql += insertInto('Company', (data as any).companies);
    sql += insertInto('Team', (data as any).teams);
    sql += insertInto('Category', (data as any).categories);
    sql += insertInto('User', (data as any).users);
    sql += insertInto('Attendance', (data as any).attendances);
    sql += insertInto('LeaveRequest', (data as any).leaveRequests);
    sql += insertInto('DailyLog', (data as any).dailyLogs);
    sql += insertInto('Announcement', (data as any).announcements);
    sql += insertInto('Product', (data as any).products);
    sql += insertInto('Roster', (data as any).rosters);
    sql += insertInto('RosterAssignment', (data as any).rosterAssignments);
    sql += insertInto('Schedule', (data as any).schedules);
    sql += insertInto('SystemConfig', (data as any).systemConfig);
    sql += insertInto('SafetyEducation', (data as any).safetyEducation);

    sql += `COMMIT;\n`;
    return sql;
}

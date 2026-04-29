import { PrismaClient } from '@prisma/client';

export function getPrismaClient(databaseUrl: string) {
    return new PrismaClient({
        datasources: {
            db: {
                url: databaseUrl,
            },
        },
    });
}

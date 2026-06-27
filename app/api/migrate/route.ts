import { execSync } from 'child_process';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        console.log("Running migration...");
        const out = execSync('npx prisma db push', { encoding: 'utf-8' });
        return NextResponse.json({ success: true, output: out });
    } catch (e: any) {
        return NextResponse.json({ 
            success: false, 
            error: e.message, 
            stdout: e.stdout,
            stderr: e.stderr 
        });
    }
}

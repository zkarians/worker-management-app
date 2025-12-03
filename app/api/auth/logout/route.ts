import { NextResponse } from 'next/server';
import { logout } from '@/app/lib/auth';

export async function POST() {
    await logout();
    return NextResponse.json({ message: 'Logged out' });
}

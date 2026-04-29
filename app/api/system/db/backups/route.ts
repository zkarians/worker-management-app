import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/auth';
import { Client } from 'ssh2';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'MANAGER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);

        // Database URL parsing
        const dbUrl = process.env.DATABASE_URL || '';
        const regex = /postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/;
        const match = dbUrl.match(regex) || [];

        const host = searchParams.get('host') || match[3];
        const user = searchParams.get('user') || match[1];
        const password = searchParams.get('password') || decodeURIComponent(match[2] || '');
        const sshPort = parseInt(searchParams.get('sshPort') || '9022');
        const decodedPassword = password.includes('%') ? decodeURIComponent(password) : password;

        if (!host || !user || !decodedPassword) {
            throw new Error('Connection settings are incomplete');
        }

        return new Promise<NextResponse>((resolve) => {
            const conn = new Client();
            conn.on('ready', () => {
                // List files in backup folder, sorted by modification time (newest first)
                // -1: one file per line, -t: sort by time, -r: reverse (if needed, but we want newest first, so -t is enough)
                const cmd = `mkdir -p backup && ls -1t backup/`;
                conn.exec(cmd, (err, stream) => {
                    if (err) {
                        conn.end();
                        resolve(NextResponse.json({ error: '목록 조회 실패', details: err.message }, { status: 500 }));
                        return;
                    }

                    let output = '';
                    stream.on('data', (data: any) => {
                        output += data.toString();
                    });

                    stream.on('close', (code: number) => {
                        conn.end();
                        const files = output.split('\n')
                            .map(f => f.trim())
                            .filter(f => f.endsWith('.sql'));
                        resolve(NextResponse.json({ files }));
                    });
                });
            }).on('error', (err) => {
                resolve(NextResponse.json({ error: 'SSH 접속 실패', details: err.message }, { status: 500 }));
            }).connect({
                host,
                port: sshPort,
                username: user,
                password: decodedPassword,
                tryKeyboard: true,
                readyTimeout: 30000
            });
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'MANAGER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const filename = searchParams.get('filename');
        if (!filename) {
            return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
        }

        // Database URL parsing
        const dbUrl = process.env.DATABASE_URL || '';
        const regex = /postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/;
        const match = dbUrl.match(regex) || [];

        const host = searchParams.get('host') || match[3];
        const user = searchParams.get('user') || match[1];
        const password = searchParams.get('password') || decodeURIComponent(match[2] || '');
        const sshPort = parseInt(searchParams.get('sshPort') || '9022');
        const decodedPassword = password.includes('%') ? decodeURIComponent(password) : password;

        if (!host || !user || !decodedPassword) {
            throw new Error('Connection settings are incomplete');
        }

        return new Promise<NextResponse>((resolve) => {
            const conn = new Client();
            conn.on('ready', () => {
                // Sanitize filename: only allow .sql files from backup/ folder
                if (filename.includes('/') || filename.includes('\\') || !filename.endsWith('.sql')) {
                    conn.end();
                    resolve(NextResponse.json({ error: 'Invalid filename' }, { status: 400 }));
                    return;
                }

                const cmd = `rm "backup/${filename}"`;
                conn.exec(cmd, (err, stream) => {
                    if (err) {
                        conn.end();
                        resolve(NextResponse.json({ error: '삭제 실패', details: err.message }, { status: 500 }));
                        return;
                    }

                    stream.on('close', (code: number) => {
                        conn.end();
                        if (code === 0) {
                            resolve(NextResponse.json({ success: true, message: '파일이 삭제되었습니다.' }));
                        } else {
                            resolve(NextResponse.json({ error: '삭제 실패', details: `Shell exited with code ${code}` }, { status: 500 }));
                        }
                    });
                });
            }).on('error', (err) => {
                resolve(NextResponse.json({ error: 'SSH 접속 실패', details: err.message }, { status: 500 }));
            }).connect({
                host,
                port: sshPort,
                username: user,
                password: decodedPassword,
                tryKeyboard: true,
                readyTimeout: 30000
            });
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

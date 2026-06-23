import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/auth';
import { Client } from 'ssh2';
import fs from 'fs';
import path from 'path';

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
        const sshPort = parseInt(searchParams.get('sshPort') || '22');
        const sshUser = searchParams.get('sshUser') || user;
        const sshPasswordRaw = searchParams.get('sshPassword') || password;
        const decodedPassword = password.includes('%') ? decodeURIComponent(password) : password;

        const localMode = searchParams.get('localMode') === 'true' || 
                         host === 'localhost' || 
                         host === '127.0.0.1';

        if (!host || !user || !decodedPassword) {
            throw new Error('Connection settings are incomplete');
        }

        if (localMode) {
            const isVercel = process.env.VERCEL === '1' || process.env.NOW_BUILDER === '1';
            const baseDir = isVercel ? '/tmp' : process.cwd();
            const backupDir = path.join(baseDir, 'backup');
            if (!fs.existsSync(backupDir)) {
                fs.mkdirSync(backupDir, { recursive: true });
            }

            const files = fs.readdirSync(backupDir)
                .filter(f => f.endsWith('.sql'))
                .map(f => ({
                    name: f,
                    mtime: fs.statSync(path.join(backupDir, f)).mtime.getTime()
                }))
                .sort((a, b) => b.mtime - a.mtime)
                .map(f => f.name);

            return NextResponse.json({ files });
        }

        return new Promise<NextResponse>((resolve) => {
            const conn = new Client();
            conn.on('ready', () => {
                // Detect remote OS
                conn.exec('uname', (detectErr, detectStream) => {
                    let isLinux = false;
                    let detectOutput = '';
                    
                    if (!detectErr) {
                        detectStream.on('data', (data: any) => {
                            detectOutput += data.toString();
                        });
                        detectStream.on('close', () => {
                            isLinux = detectOutput.toLowerCase().includes('linux') || 
                                      detectOutput.toLowerCase().includes('darwin');
                            runList();
                        });
                        detectStream.stderr.on('data', () => {});
                    } else {
                        runList();
                    }

                    function runList() {
                        const cmd = isLinux
                            ? `mkdir -p backup && ls -1t backup/`
                            : `cmd.exe /c "(if not exist backup mkdir backup) & dir /B /O:-D /A:-D backup\\*.sql 2>nul"`;

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
                    }
                });
            }).on('error', (err) => {
                resolve(NextResponse.json({ error: 'SSH 접속 실패', details: err.message }, { status: 500 }));
            }).connect({
                host,
                port: sshPort,
                username: sshUser,
                password: sshPasswordRaw.includes('%') ? decodeURIComponent(sshPasswordRaw) : sshPasswordRaw,
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
        const sshPort = parseInt(searchParams.get('sshPort') || '22');
        const sshUser = searchParams.get('sshUser') || user;
        const sshPasswordRaw = searchParams.get('sshPassword') || password;
        const decodedPassword = password.includes('%') ? decodeURIComponent(password) : password;

        const localMode = searchParams.get('localMode') === 'true' || 
                         host === 'localhost' || 
                         host === '127.0.0.1';

        if (!host || !user || !decodedPassword) {
            throw new Error('Connection settings are incomplete');
        }

        // Sanitize filename
        if (filename.includes('/') || filename.includes('\\') || !filename.endsWith('.sql')) {
            return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
        }

        if (localMode) {
            const isVercel = process.env.VERCEL === '1' || process.env.NOW_BUILDER === '1';
            const baseDir = isVercel ? '/tmp' : process.cwd();
            const filePath = path.join(baseDir, 'backup', filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                return NextResponse.json({ success: true, message: '파일이 삭제되었습니다.' });
            } else {
                return NextResponse.json({ error: '파일을 찾을 수 없습니다.' }, { status: 404 });
            }
        }

        return new Promise<NextResponse>((resolve) => {
            const conn = new Client();
            conn.on('ready', () => {
                // Detect remote OS
                conn.exec('uname', (detectErr, detectStream) => {
                    let isLinux = false;
                    let detectOutput = '';
                    
                    if (!detectErr) {
                        detectStream.on('data', (data: any) => {
                            detectOutput += data.toString();
                        });
                        detectStream.on('close', () => {
                            isLinux = detectOutput.toLowerCase().includes('linux') || 
                                      detectOutput.toLowerCase().includes('darwin');
                            runDelete();
                        });
                        detectStream.stderr.on('data', () => {});
                    } else {
                        runDelete();
                    }

                    function runDelete() {
                        const cmd = isLinux
                            ? `rm "backup/${filename}"`
                            : `cmd.exe /c "del /Q /F \\"backup\\\\${filename}\\""`;

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
                    }
                });
            }).on('error', (err) => {
                resolve(NextResponse.json({ error: 'SSH 접속 실패', details: err.message }, { status: 500 }));
            }).connect({
                host,
                port: sshPort,
                username: sshUser,
                password: sshPasswordRaw.includes('%') ? decodeURIComponent(sshPasswordRaw) : sshPasswordRaw,
                tryKeyboard: true,
                readyTimeout: 30000
            });
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

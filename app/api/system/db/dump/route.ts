import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/auth';
import { Client } from 'ssh2';
import { addLog } from '@/app/lib/ssh-utils';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execPromise = promisify(exec);

export const dynamic = 'force-dynamic';

// Portable PG bin path from POSTGRES_INFO.md
const LOCAL_PG_BIN = 'D:\\Gemini\\pg_bin\\pgsql\\bin';

export async function GET(request: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'MANAGER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);

        // Use custom settings if provided, otherwise fallback to .env
        const dbUrl = process.env.DATABASE_URL || '';
        const regex = /postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/;
        const match = dbUrl.match(regex) || [];

        const host = searchParams.get('host') || match[3];
        const user = searchParams.get('user') || match[1];
        const password = searchParams.get('password') || decodeURIComponent(match[2] || '');
        const dbname = searchParams.get('dbname') || (match[5] ? match[5].split('?')[0] : '');
        const port = searchParams.get('port') || match[4] || '5432';
        const sshPort = parseInt(searchParams.get('sshPort') || '9022');
        const sshUser = searchParams.get('sshUser') || user;
        const sshPasswordRaw = searchParams.get('sshPassword') || password;
        const localMode = searchParams.get('localMode') === 'true' || 
                         host === 'localhost' || 
                         host === '127.0.0.1';

        const saveTo = searchParams.get('saveTo') || 'both'; // 'pc', 'phone', 'both'

        if (!host || !user || !password || !dbname) {
            throw new Error('Connection settings are incomplete');
        }

        const decodedPassword = password.includes('%') ? decodeURIComponent(password) : password;
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `db_dump_${dbname}_${timestamp}.sql`;

        if (localMode) {
            const localBackupPath = path.join(process.cwd(), 'backup', filename);

            // Ensure backup directory exists
            if (!fs.existsSync(path.join(process.cwd(), 'backup'))) {
                fs.mkdirSync(path.join(process.cwd(), 'backup'), { recursive: true });
            }
            console.log(`📡 [Local] DB Dump starting (${saveTo}): ${dbname}...`);
            addLog(`[로컬] DB 백업 시작 (대상: ${saveTo})...`);

            // Use portable path if exists, otherwise assume pg_dump is in PATH
            const pgDumpPath = fs.existsSync(path.join(LOCAL_PG_BIN, 'pg_dump.exe'))
                ? path.join(LOCAL_PG_BIN, 'pg_dump.exe')
                : 'pg_dump';

            const pgDumpCmd = `"${pgDumpPath}" -U ${user} -h localhost -p ${port} ${dbname}`;
            
            // Build command based on saveTo
            let fullCmd = '';
            if (saveTo === 'phone' || saveTo === 'both') {
                // In local mode, 'phone' means the local backup folder
                fullCmd = `${pgDumpCmd} > "${localBackupPath}"`;
            } else {
                // Just streaming to PC
                fullCmd = pgDumpCmd;
            }

            return new Promise<Response>((resolve) => {
                const processEnv = { ...process.env, PGPASSWORD: decodedPassword };
                
                if (saveTo === 'phone') {
                    exec(fullCmd, { env: processEnv }, (err, stdout, stderr) => {
                        if (err) {
                            addLog(`❌ 로컬 백업 실패: ${err.message}`);
                            resolve(NextResponse.json({ error: '로컬 백업 실패', details: err.message }, { status: 500 }));
                        } else {
                            addLog(`✅ 로컬 백업 완료: backup/${filename}`);
                            resolve(NextResponse.json({ success: true, message: '로컬 서버에 백업 파일이 생성되었습니다.', path: `backup/${filename}` }));
                        }
                    });
                } else {
                    // PC download or both
                    // For 'both', we need to run it once and then read the file, or use tee-like behavior
                    // Simplest for now: if 'both', create file first then stream it.
                    
                    const runAndStream = async () => {
                        try {
                            if (saveTo === 'both') {
                                await execPromise(fullCmd, { env: processEnv });
                                addLog(`✅ 로컬 파일 생성 완료: backup/${filename}`);
                                const content = fs.readFileSync(localBackupPath);
                                const headers = new Headers();
                                headers.set('Content-Type', 'application/sql');
                                headers.set('Content-Disposition', `attachment; filename="${filename}"`);
                                resolve(new Response(content, { headers }));
                            } else {
                                // Just 'pc' - stream directly
                                const { stdout, stderr } = await execPromise(fullCmd, { env: processEnv, encoding: 'buffer' });
                                const headers = new Headers();
                                headers.set('Content-Type', 'application/sql');
                                headers.set('Content-Disposition', `attachment; filename="${filename}"`);
                                resolve(new Response(stdout, { headers }));
                            }
                        } catch (err: any) {
                            addLog(`❌ 로컬 백업 오류: ${err.message}`);
                            resolve(NextResponse.json({ error: '로컬 백업 실패', details: err.message }, { status: 500 }));
                        }
                    };
                    runAndStream();
                }
            });
        }

        // --- Original SSH Logic ---
        const remotePath = `backup/${filename}`;
        const pgDumpCmd = `PGPASSWORD='${decodedPassword}' pg_dump -U ${user} -h localhost -p 5432 ${dbname}`;

        // Build command based on saveTo
        let dumpCmd = '';
        if (saveTo === 'phone') {
            dumpCmd = `mkdir -p backup && ${pgDumpCmd} > "${remotePath}"`;
        } else if (saveTo === 'pc') {
            dumpCmd = pgDumpCmd;
        } else {
            // both
            dumpCmd = `mkdir -p backup && ${pgDumpCmd} | tee "${remotePath}"`;
        }

        console.log(`📡 [ssh2] DB Dump starting (${saveTo}): ${host}:${sshPort} for ${dbname}...`);
        addLog(`DB 백업 시작 (대상: ${saveTo})...`);

        return new Promise<Response>((resolve) => {
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
                            runDump();
                        });
                        detectStream.stderr.on('data', () => {});
                    } else {
                        runDump();
                    }

                    function runDump() {
                        let finalDumpCmd = '';
                        if (isLinux) {
                            finalDumpCmd = dumpCmd;
                        } else {
                            // Windows SSH Server Command
                            const escapedPassword = decodedPassword.replace(/"/g, '\\"');
                            const winPgDump = `\"D:\\\\Gemini\\\\pg_bin\\\\pgsql\\\\bin\\\\pg_dump.exe\"`;
                            const pgDumpWinCmd = `if exist ${winPgDump} (${winPgDump} -U ${user} -h localhost -p 5432 ${dbname}) else (pg_dump -U ${user} -h localhost -p 5432 ${dbname})`;
                            
                            if (saveTo === 'phone') {
                                finalDumpCmd = `cmd.exe /c "mkdir backup 2>nul & set PGPASSWORD=${escapedPassword}&& ${pgDumpWinCmd} > \\"backup\\\\${filename}\\""`;
                            } else if (saveTo === 'pc') {
                                finalDumpCmd = `cmd.exe /c "set PGPASSWORD=${escapedPassword}&& ${pgDumpWinCmd}"`;
                            } else {
                                // both (save to file and print to stdout)
                                finalDumpCmd = `cmd.exe /c "mkdir backup 2>nul & set PGPASSWORD=${escapedPassword}&& ${pgDumpWinCmd} > \\"backup\\\\${filename}\\" & type \\"backup\\\\${filename}\\""`;
                            }
                        }

                        console.log(`Executing remote DB dump command: ${finalDumpCmd}`);

                        conn.exec(finalDumpCmd, (err: Error | undefined, stream: any) => {
                            if (err) {
                                conn.end();
                                addLog(`에러: ${err.message}`);
                                resolve(NextResponse.json({ error: '백업 명령 실행 실패', details: err.message }, { status: 500 }));
                                return;
                            }

                            if (saveTo === 'phone') {
                                // For 'phone' only, we don't stream back a file, we return JSON success after closure
                                stream.on('close', (code: number) => {
                                    conn.end();
                                    if (code === 0) {
                                        addLog(`서버 백업 완료: ${remotePath}`);
                                        resolve(NextResponse.json({ success: true, message: '서버에 백업 파일이 생성되었습니다.', path: remotePath }));
                                    } else {
                                        resolve(NextResponse.json({ error: '서버 백업 실패' }, { status: 500 }));
                                    }
                                });
                                // Drain the stream even if we don't use it to ensure closure
                                stream.on('data', () => { });
                            } else {
                                // For 'pc' or 'both', we stream to the response
                                const headers = new Headers();
                                headers.set('Content-Type', 'application/sql');
                                headers.set('Content-Disposition', `attachment; filename="${filename}"`);

                                const responseStream = new ReadableStream({
                                    start(controller) {
                                        stream.on('data', (data: any) => controller.enqueue(data));
                                        stream.on('close', () => {
                                            conn.end();
                                            addLog('백업 완료 및 전송 완료.');
                                            controller.close();
                                        });
                                        stream.stderr.on('data', (data: any) => {
                                            console.error('pg_dump error:', data.toString());
                                        });
                                    }
                                });

                                resolve(new Response(responseStream, { headers }));
                            }
                        });
                    }
                });
            }).on('error', (err: Error) => {
                addLog(`SSH 접속 실패: ${err.message}`);
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
        console.error('Failed to dump database:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

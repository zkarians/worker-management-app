import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/auth';
import { Client } from 'ssh2';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { exec } from 'child_process';
import { addLog, clearLogs } from '@/app/lib/ssh-utils';

export const dynamic = 'force-dynamic';

const LOCAL_PG_BIN = 'D:\\Gemini\\pg_bin\\pgsql\\bin';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'MANAGER') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);

        // Configuration
        const dbUrl = process.env.DATABASE_URL || '';
        const regex = /postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/;
        const match = dbUrl.match(regex) || [];

        const host = searchParams.get('host') || match[3];
        const user = searchParams.get('user') || match[1];
        const password = searchParams.get('password') || decodeURIComponent(match[2] || '');
        const dbname = searchParams.get('dbname') || (match[5] ? match[5].split('?')[0] : '');
        const port = searchParams.get('port') || match[4] || '5432';
        const sshPort = parseInt(searchParams.get('sshPort') || '22');
        const sshUser = searchParams.get('sshUser') || user;
        const sshPasswordRaw = searchParams.get('sshPassword') || password;
        const decodedPassword = password.includes('%') ? decodeURIComponent(password) : password;

        const localMode = searchParams.get('localMode') === 'true' || 
                         host === 'localhost' || 
                         host === '127.0.0.1';

        if (!host || !user || !decodedPassword || !dbname) {
            throw new Error('Connection settings are incomplete');
        }

        const remoteFilename = searchParams.get('remotePath');
        let tempFilePath = '';

        clearLogs();
        addLog(`SQL 복구 작업을 시작합니다 (${localMode ? '로컬' : '원격'}, ${remoteFilename ? '기본 파일' : '로컬 업로드'})...`);

        if (!remoteFilename) {
            const formData = await request.formData();
            const file = formData.get('file') as File;
            if (!file) {
                return NextResponse.json({ error: '파일이 필요합니다 (Local Restore 시)' }, { status: 400 });
            }

            addLog('📦 업로드된 파일을 임시 저장 중...');
            tempFilePath = path.join(os.tmpdir(), `restore_sql_${Date.now()}.sql`);
            const buffer = Buffer.from(await file.arrayBuffer());
            fs.writeFileSync(tempFilePath, buffer);
            addLog(`✅ 파일 임시 저장 완료 (${(buffer.length / 1024 / 1024).toFixed(2)} MB).`);
        }

        if (localMode) {
            addLog(`🚀 [로컬] DB 복구 명령을 준비합니다... (대상: ${dbname})`);
            
            const psqlPath = fs.existsSync(path.join(LOCAL_PG_BIN, 'psql.exe'))
                ? path.join(LOCAL_PG_BIN, 'psql.exe')
                : 'psql';

            const sourceFile = remoteFilename 
                ? path.join(process.cwd(), 'backup', remoteFilename)
                : tempFilePath;

            if (!fs.existsSync(sourceFile)) {
                throw new Error(`복구할 파일을 찾을 수 없습니다: ${sourceFile}`);
            }

            const psqlCmd = `"${psqlPath}" -h localhost -p ${port} -U ${user} -d ${dbname} < "${sourceFile}"`;
            
            return new Promise<NextResponse>((resolve) => {
                const processEnv = { ...process.env, PGPASSWORD: decodedPassword };
                exec(psqlCmd, { env: processEnv }, (err, stdout, stderr) => {
                    if (tempFilePath && fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
                    
                    if (err) {
                        addLog(`❌ 로컬 복구 실패: ${err.message}`);
                        addLog(`[Error Details] ${stderr}`);
                        resolve(NextResponse.json({ error: '로컬 복구 실패', details: stderr || err.message }, { status: 500 }));
                    } else {
                        addLog('✅ 로컬 DB 복구가 성공적으로 완료되었습니다.');
                        resolve(NextResponse.json({ success: true }));
                    }
                });
            });
        }

        // --- Original SSH Logic ---
        addLog(`📡 원격 서버(${host}:${sshPort}) 접속 시도 중...`);

        return new Promise<NextResponse>((resolve) => {
            const conn = new Client();
            let stderr = '';

            conn.on('ready', () => {
                addLog('✅ SSH 연결 성공. 원격 운영체제 확인 중...');

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
                            runRestore();
                        });
                        detectStream.stderr.on('data', () => {});
                    } else {
                        runRestore();
                    }

                    function runRestore() {
                        try {
                            let finalRestoreCmd = '';
                            if (isLinux) {
                                const safePassword = decodedPassword.replace(/'/g, "'\\''");
                                const psqlCmd = `export PGPASSWORD='${safePassword}'; psql -h localhost -U ${user} -d ${dbname}`;
                                finalRestoreCmd = remoteFilename
                                    ? `${psqlCmd} < "backup/${remoteFilename}"`
                                    : psqlCmd;
                            } else {
                                // Windows SSH Server Command
                                const escapedPassword = decodedPassword.replace(/"/g, '\\"');
                                const winPsql = `D:\\\\Gemini\\\\pg_bin\\\\pgsql\\\\bin\\\\psql.exe`;
                                const psqlWinCmd = `if exist ${winPsql} (${winPsql} -h localhost -U ${user} -d ${dbname}) else (psql -h localhost -U ${user} -d ${dbname})`;
                                
                                finalRestoreCmd = remoteFilename
                                    ? `cmd.exe /c "set PGPASSWORD=${escapedPassword}&& ${psqlWinCmd} < backup\\${remoteFilename}"`
                                    : `cmd.exe /c "set PGPASSWORD=${escapedPassword}&& ${psqlWinCmd}"`;
                            }

                            addLog(`실행 명령어 준비 완료. (대상: ${dbname})`);
                            console.log(`Executing remote DB restore command: ${finalRestoreCmd}`);

                            conn.exec(finalRestoreCmd, (err: Error | undefined, stream: any) => {
                                if (err) {
                                    addLog(`❌ SSH 실행 오류: ${err.message}`);
                                    conn.end();
                                    resolve(NextResponse.json({ error: '명령 실행 실패', details: err.message }, { status: 500 }));
                                    return;
                                }

                                if (!remoteFilename) {
                                    addLog('📤 로컬 데이터를 서버로 전송하는 중 (Streaming)...');
                                    const fileStream = fs.createReadStream(tempFilePath);
                                    fileStream.on('error', (fsErr) => {
                                        addLog(`❌ 파일 읽기 오류: ${fsErr.message}`);
                                    });
                                    fileStream.pipe(stream);
                                } else {
                                    addLog(`서버 내부 파일(${remoteFilename})을 사용하여 직접 복구 중...`);
                                }

                                stream.on('close', (code: number) => {
                                    addLog(`🚪 스트림 종료 (코드: ${code})`);
                                    conn.end();
                                    if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
                                    if (code === 0) {
                                        addLog('✅ DB 복구가 성공적으로 완료되었습니다.');
                                        resolve(NextResponse.json({ success: true }));
                                    } else {
                                        addLog(`❌ 복원 실패 (코드: ${code})`);
                                        resolve(NextResponse.json({ error: '복원 실패', details: stderr }, { status: 500 }));
                                    }
                                }).on('data', (data: any) => {
                                    // psql stdout
                                }).stderr.on('data', (data: any) => {
                                    const msg = data.toString();
                                    stderr += msg;
                                    // Log first few errors to UI
                                    if (stderr.length < 1000) addLog(`[DB-MSG] ${msg.trim()}`);
                                });
                            });
                        } catch (internalErr: any) {
                            addLog(`❌ 내부 처리 오류: ${internalErr.message}`);
                            conn.end();
                            if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
                            resolve(NextResponse.json({ error: '내부 처리 오류', details: internalErr.message }, { status: 500 }));
                        }
                    }
                });
            }).on('error', (err: Error) => {
                addLog(`❌ SSH 연결 오류: ${err.message}`);
                if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
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
        console.error('Failed to restore database from SQL dump:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

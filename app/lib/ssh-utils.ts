import { Client } from 'ssh2';

// Global log storage for the current session's SSH task
const g = global as any;
if (!g.sshLogs) g.sshLogs = [];

export function getLatestLogs() { return g.sshLogs; }
export function clearLogs() { g.sshLogs = []; }
export function addLog(msg: string) {
    if (!g.sshLogs) g.sshLogs = [];
    g.sshLogs.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
    if (g.sshLogs.length > 50) g.sshLogs.shift();
    console.log(`[SSH-LOG] ${msg}`);
}

export async function runRemoteCommand(
    host: string,
    port: number,
    user: string,
    password: string,
    command: string
): Promise<string> {
    clearLogs();
    addLog(`서버(${host}:${port}) 접속 시도 중 (Using SSH2 Engine)...`);

    return new Promise((resolve, reject) => {
        const conn = new Client();
        let stdout = '';
        let stderr = '';

        conn.on('ready', () => {
            addLog(`✅ SSH 연결 성공! 작업을 시작합니다...`);
            conn.exec(command, (err: Error | undefined, stream: any) => {
                if (err) {
                    addLog(`❌ 실행 오류: ${err.message}`);
                    return reject(err);
                }

                stream.on('close', (code: number) => {
                    addLog(`🚪 작업 종료 (코드: ${code})`);
                    conn.end();
                    if (code === 0) {
                        resolve(stdout);
                    } else {
                        reject(new Error(`Command failed with code ${code}: ${stderr}`));
                    }
                }).on('data', (data: any) => {
                    const output = data.toString();
                    stdout += output;
                    // Note: Don't log to addLog here as it's the large SQL content
                }).stderr.on('data', (data: any) => {
                    const output = data.toString();
                    stderr += output;
                    addLog(`[SSH-MSG] ${output.trim()}`);
                });
            });
        }).on('error', (err: Error) => {
            addLog(`❌ 접속 오류: ${err.message}`);
            reject(err);
        }).connect({
            host,
            port,
            username: user,
            password,
            // These properties match the behavior we want
            tryKeyboard: true,
            readyTimeout: 30000
        });
    });
}

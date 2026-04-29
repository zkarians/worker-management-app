import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execPromise = promisify(exec);

const COMMON_PATHS = [
    'C:\\Program Files\\PostgreSQL\\16\\bin',
    'C:\\Program Files\\PostgreSQL\\15\\bin',
    'C:\\Program Files\\PostgreSQL\\14\\bin',
    'C:\\Program Files\\PostgreSQL\\13\\bin',
];

export async function getPgBinPath(command: 'pg_dump' | 'psql'): Promise<string> {
    // 1. Try system PATH first
    try {
        await execPromise(`${command} --version`);
        return command; // Already in PATH
    } catch (e) {
        // Not in PATH
    }

    // 2. Try common installation paths
    for (const binPath of COMMON_PATHS) {
        const fullPath = path.join(binPath, `${command}.exe`);
        if (fs.existsSync(fullPath)) {
            return `"${fullPath}"`;
        }
    }

    // 3. Last resort: where command (Windows)
    try {
        const { stdout } = await execPromise(`where ${command}`);
        if (stdout.trim()) {
            return `"${stdout.split('\n')[0].trim()}"`;
        }
    } catch (e) { }

    return command; // Fail back to default and let it show the error
}

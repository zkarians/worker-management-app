import XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

type Row = Record<string, any>;
type DiffCell = { key: string; column: string; a: any; b: any };
type DiffResult = {
    added: Row[];
    removed: Row[];
    modified: DiffCell[];
};

function parseArgs(argv: string[]) {
    const args: Record<string, string> = {};
    for (let i = 2; i < argv.length; i++) {
        const token = argv[i];
        if (token.startsWith('--')) {
            const [k, v] = token.replace(/^--/, '').split('=');
            if (k) args[k] = v ?? 'true';
        } else if (!args['a']) {
            args['a'] = token;
        } else if (!args['b']) {
            args['b'] = token;
        }
    }
    return args;
}

function readSheet(filePath: string, sheet?: string): Row[] {
    const wb = XLSX.readFile(filePath);
    const sheetName = sheet || wb.SheetNames[0];
    const ws = wb.Sheets[sheetName];
    if (!ws) return [];
    const rows = XLSX.utils.sheet_to_json(ws, { defval: '' }) as Row[];
    return rows;
}

function ensureOutputDir(dir: string) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function getKeyColumn(rows: Row[], key?: string) {
    if (key) return key;
    if (rows.length === 0) return '';
    const first = rows[0];
    const headers = Object.keys(first);
    return headers[0] || '';
}

function indexByKey(rows: Row[], key: string) {
    const map = new Map<string, Row>();
    for (const r of rows) {
        const k = String(r[key] ?? '');
        if (k) map.set(k, r);
    }
    return map;
}

function diffRows(aRows: Row[], bRows: Row[], key: string, cols?: string[]): DiffResult {
    const aMap = indexByKey(aRows, key);
    const bMap = indexByKey(bRows, key);
    const added: Row[] = [];
    const removed: Row[] = [];
    const modified: DiffCell[] = [];
    const commonKeys = new Set<string>([...aMap.keys()].filter(k => bMap.has(k)));
    const aOnly = [...aMap.keys()].filter(k => !bMap.has(k));
    const bOnly = [...bMap.keys()].filter(k => !aMap.has(k));
    for (const k of bOnly) added.push(bMap.get(k)!);
    for (const k of aOnly) removed.push(aMap.get(k)!);
    const columns = cols && cols.length > 0 ? cols : inferColumns(aRows, bRows, key);
    for (const k of commonKeys) {
        const ar = aMap.get(k)!;
        const br = bMap.get(k)!;
        for (const c of columns) {
            const va = normalize(ar[c]);
            const vb = normalize(br[c]);
            if (!isEqual(va, vb)) {
                modified.push({ key: k, column: c, a: ar[c], b: br[c] });
            }
        }
    }
    return { added, removed, modified };
}

function inferColumns(aRows: Row[], bRows: Row[], key: string) {
    const aHeaders = new Set<string>(aRows.length ? Object.keys(aRows[0]) : []);
    const bHeaders = new Set<string>(bRows.length ? Object.keys(bRows[0]) : []);
    const all = new Set<string>([...aHeaders, ...bHeaders]);
    all.delete(key);
    return [...all];
}

function normalize(v: any) {
    if (v === null || v === undefined) return '';
    if (typeof v === 'number' && Number.isNaN(v)) return '';
    if (v instanceof Date) return v.toISOString();
    return String(v).trim();
}

function isEqual(a: any, b: any) {
    return normalize(a) === normalize(b);
}

function writeDiff(result: DiffResult, outDir: string, baseName: string) {
    ensureOutputDir(outDir);
    const wb = XLSX.utils.book_new();
    const addedSheet = XLSX.utils.json_to_sheet(result.added.length ? result.added : [{}]);
    const removedSheet = XLSX.utils.json_to_sheet(result.removed.length ? result.removed : [{}]);
    const modifiedSheet = XLSX.utils.json_to_sheet(
        result.modified.length
            ? result.modified.map(m => ({ key: m.key, column: m.column, a: m.a, b: m.b }))
            : [{}]
    );
    XLSX.utils.book_append_sheet(wb, addedSheet, 'ADDED');
    XLSX.utils.book_append_sheet(wb, removedSheet, 'REMOVED');
    XLSX.utils.book_append_sheet(wb, modifiedSheet, 'MODIFIED');
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const outPath = path.join(outDir, `diff-${baseName}-${ts}.xlsx`);
    XLSX.writeFile(wb, outPath);
    return outPath;
}

function main() {
    const args = parseArgs(process.argv);
    const fileA = args['a'];
    const fileB = args['b'];
    const sheet = args['sheet'];
    const key = args['key'];
    const colsArg = args['cols'];
    const outDir = args['out'] || path.join(process.cwd(), 'diff-output');
    if (!fileA || !fileB) {
        const usage = [
            'Usage: tsx scripts/excel-compare.ts <fileA> <fileB> [--sheet=Sheet1] [--key=ID] [--cols=Name,Qty] [--out=path]',
            'Example: tsx scripts/excel-compare.ts C:\\A.xlsx C:\\B.xlsx --sheet=Data --key=Code --cols=Name,Price,Qty'
        ].join('\n');
        console.log(usage);
        process.exit(1);
    }
    const aRows = readSheet(fileA, sheet);
    const bRows = readSheet(fileB, sheet);
    const keyCol = getKeyColumn(aRows.length ? aRows : bRows, key);
    if (!keyCol) {
        console.log('Key column could not be determined. Provide with --key=');
        process.exit(1);
    }
    const cols = colsArg ? colsArg.split(',').map(s => s.trim()).filter(Boolean) : undefined;
    const result = diffRows(aRows, bRows, keyCol, cols);
    const baseName = path.basename(fileA, path.extname(fileA)) + '_vs_' + path.basename(fileB, path.extname(fileB));
    const outPath = writeDiff(result, outDir, baseName);
    console.log(`Diff written: ${outPath}`);
    console.log(`Added: ${result.added.length}, Removed: ${result.removed.length}, Modified cells: ${result.modified.length}`);
}

main();

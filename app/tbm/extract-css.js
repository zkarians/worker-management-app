const fs = require('fs');
const htmlPath = 'D:\\.gemini\\antigravity\\scratch\\TBM\\TBM.files\\daily_plan_refined.html';
const outPath = 'D:\\.gemini\\antigravity\\scratch\\worker-management-app\\app\\tbm\\tbm-styles.ts';
let html = fs.readFileSync(htmlPath, 'utf8');
if (!html.includes('</style>')) html = fs.readFileSync(htmlPath, 'utf16le');
const matches = html.match(/<style[^>]*>([\s\S]*?)<\/style>/g);
if (matches) {
    let css = matches.map(m => m.replace(/<style[^>]*>|<\/style>/g, '')).join('\n');
    css = css.replace(/(border[^:]*:\s*[^;}]+)/g, '$1 !important');
    css = css.replace(/(white-space:\s*normal)\b/g, 'white-space: nowrap !important');
    css = 'td { empty-cells: show !important; white-space: nowrap !important; overflow: hidden; }\n' + css;
    const outStr = "export const tbmStyles = `" + css.replace(/`/g, '\\`') + "`;\n";
    fs.writeFileSync(outPath, outStr, 'utf8');
    console.log('Successfully wrote CSS from all blocks to tbm-styles.ts!');
}

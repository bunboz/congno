// Gộp dist/index.html + JS thành cong-no.html (một file, mở bằng double-click, không cần server).
import { readFileSync, writeFileSync } from 'node:fs';

let html = readFileSync('dist/index.html', 'utf8');
const m = html.match(/<script type="module"[^>]*src="([^"]+)"[^>]*><\/script>/);
if (!m) throw new Error('Không thấy thẻ script trong dist/index.html');
const js = readFileSync(`dist/${m[1].replace(/^\.\//, '')}`, 'utf8').replace(/<\/script/g, '<\\/script');
html = html.replace(m[0], '').replace('</body>', () => `<script>${js}</script>\n</body>`);
writeFileSync('cong-no.html', html);
console.log(`cong-no.html: ${(html.length / 1024).toFixed(0)} KB`);

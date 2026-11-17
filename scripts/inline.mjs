// Gộp dist/app.html + JS thành cong-no.html và index.html (một file, mở bằng double-click, không cần server).
import { readFileSync, writeFileSync } from 'node:fs';

let html = readFileSync('dist/app.html', 'utf8');
const m = html.match(/<script type="module"[^>]*src="([^"]+)"[^>]*><\/script>/);
if (!m) throw new Error('Không thấy thẻ script trong dist/app.html');
const js = readFileSync(`dist/${m[1].replace(/^\.\//, '')}`, 'utf8').replace(/<\/script/g, '<\\/script');
html = html.replace(m[0], '').replace('</body>', () => `<script>${js}</script>\n</body>`);
writeFileSync('cong-no.html', html);
writeFileSync('index.html', html); // GitHub Pages phục vụ index.html ở gốc
console.log(`cong-no.html: ${(html.length / 1024).toFixed(0)} KB`);

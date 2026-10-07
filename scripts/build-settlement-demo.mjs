import { copyFile, mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
const out = path.resolve(process.argv[2] ?? 'tests/artifacts/public-demo');
const pack = JSON.parse(await readFile(path.join(out, 'demo-pack.json'), 'utf8'));
if (pack.entries.length !== 93 || pack.entries.some(r => r.generation.status !== 'ready' || !r.generation.prose || !r.generation.imageUrl)) throw Error('Export all 93 completed pages before building the public demo.');
await mkdir(out, { recursive: true });
for (const file of ['index.html', 'demo.css', 'demo.js']) await copyFile(new URL('../demo/' + file, import.meta.url), path.join(out, file));
for (const file of ['book.js', 'book.css']) await copyFile(new URL('../src/settlements/' + file, import.meta.url), path.join(out, file));
console.log(`Built a read-only demonstration with ${pack.entries.length} preserved prose-and-image pairs in ${out}`);

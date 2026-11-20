// Renders the screenshots in shots.json with Chrome Headless Shell, then
// converts each to a JPEG that fits the gate (long side <= 1280, short side
// >= 480, <= 256 KiB). The app must be served first: `node serve.ts`
// (http://localhost:8080). Usage: `node tools/render_shots.mjs`.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('..', import.meta.url));
const CHROME = process.env.CHROME_HEADLESS_SHELL
  ?? join(process.env.HOME, '.cache/ms-playwright/chromium_headless_shell-1255/chrome-headless-shell-linux64/chrome-headless-shell');
const shots = JSON.parse(readFileSync(join(here, 'shots.json'), 'utf8'));
const outDir = join(here, 'screenshots');
mkdirSync(outDir, { recursive: true });

const PIL = `
import sys
from PIL import Image
src, dst, w, h = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4])
im = Image.open(src).convert('RGB')
if im.size != (w, h):
    im = im.resize((w, h), Image.LANCZOS)
for q in (88, 80, 72, 64):
    im.save(dst, 'JPEG', quality=q)
    import os
    if os.path.getsize(dst) <= 262144:
        break
print(dst, im.size, os.path.getsize(dst))
`;

for (const shot of shots) {
  const url = `http://localhost:8080/${shot.query}`;
  const tmpPng = join('/tmp', `av-shot-${shot.name}.png`);
  const dst = join(outDir, shot.name);
  console.log('shot', shot.name, shot.w + 'x' + shot.h, url);
  execFileSync(CHROME, [
    '--headless', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
    `--window-size=${shot.w},${shot.h}`,
    '--virtual-time-budget=9000',
    `--screenshot=${tmpPng}`,
    url,
  ], { stdio: 'inherit' });
  const py = join('/tmp', 'av-pil-convert.py');
  writeFileSync(py, PIL);
  execFileSync('python3', [py, tmpPng, dst, String(shot.w), String(shot.h)], { stdio: 'inherit' });
  if (!existsSync(dst)) throw new Error(`missing ${dst}`);
}
console.log('done:', shots.map((s) => s.name).join(', '));

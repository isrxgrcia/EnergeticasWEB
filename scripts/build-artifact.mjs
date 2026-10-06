// Genera una versión de un solo archivo para publicarla como Artifact de claude.ai.
// Uso: npm run build:artifact  →  dist-artifact/energy-showcase.html
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const out = 'dist-artifact';
execSync('npx vite build', { stdio: 'inherit', env: { ...process.env, SINGLE_FILE: '1' } });

let html = readFileSync(join(out, 'index.html'), 'utf8');
const read = (href) => readFileSync(join(out, href.replace(/^\.\//, '')), 'utf8');

const css = [...html.matchAll(/<link rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g)];
const js = [...html.matchAll(/<script type="module"[^>]*src="([^"]+)"[^>]*><\/script>/g)];
if (css.length === 0 || js.length === 0) throw new Error('No se encontraron los recursos del build');
for (const [tag] of [...css, ...js]) html = html.replace(tag, '');

const head = html.match(/<head>([\s\S]*?)<\/head>/)[1]
  .replace(/<meta charset[^>]*>/, '')
  .replace(/<meta name="viewport"[^>]*>/, '')
  .replace(/<title>[\s\S]*?<\/title>/, '');
const body = html.match(/<body>([\s\S]*?)<\/body>/)[1];

const page = [
  '<title>Energy Showcase</title>',
  head.trim(),
  ...css.map(([, href]) => `<style>${read(href)}</style>`),
  body.trim(),
  // El código no contiene «</script>»; se comprueba por seguridad.
  ...js.map(([, src]) => {
    const code = read(src);
    if (code.includes('</script')) throw new Error('El JS contiene </script>');
    return `<script type="module">${code}</script>`;
  }),
].join('\n');

const file = join(out, 'energy-showcase.html');
writeFileSync(file, page);
console.log(`${file}: ${(page.length / 1024).toFixed(1)} kB`);

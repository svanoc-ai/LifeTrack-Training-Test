const fs = require('node:fs');
const path = require('node:path');
const root = process.cwd();
const app = fs.readFileSync(path.join(root, 'src/version.ts'), 'utf8');
const appMatches = [...app.matchAll(/^export const APP_VERSION = '([^']+)';$/gm)];
if (appMatches.length !== 1 || !/^2-[A-Z]\.\d+\.\d+$/.test(appMatches[0][1])) throw new Error('APP_VERSION invalide ou absente');
const version = appMatches[0][1];
const swPath = path.join(root, process.argv.includes('--dist') ? 'dist/sw.js' : 'public/sw.js');
let sw = fs.readFileSync(swPath, 'utf8');
const pattern = /^const VERSION = '([^']+)';$/gm;
const matches = [...sw.matchAll(pattern)];
if (matches.length !== 1) throw new Error('Déclaration VERSION du service worker invalide ou absente');
if (matches[0][1] !== version && process.argv.includes('--sync') && !process.argv.includes('--dist')) {
  console.log('Synchronisation automatique du cache :', matches[0][1], '→', version);
  sw = sw.replace(pattern, `const VERSION = '${version}';`);
  fs.writeFileSync(swPath, sw, 'utf8');
}
const actual = [...fs.readFileSync(swPath, 'utf8').matchAll(pattern)][0][1];
if (version !== actual) { console.error('Version mismatch:', version, actual); process.exit(1); }
console.log('Version synchronized:', version, process.argv.includes('--dist') ? '(dist)' : '(source)');

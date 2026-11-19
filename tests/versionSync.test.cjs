const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lt-version-'));
const script = path.resolve(__dirname, '../scripts/check-version.cjs');
const run = (...args) => spawnSync(process.execPath, [script, ...args], {cwd:root,encoding:'utf8'});
try {
  for (const dir of ['src','public','dist']) fs.mkdirSync(path.join(root,dir));
  fs.writeFileSync(path.join(root,'src/version.ts'), "export const APP_VERSION = '2-F.1.1';\n");
  const sw = path.join(root,'public/sw.js');
  fs.writeFileSync(sw, "const VERSION = '2-F.0.1';\nconst PREFIX = 'test-';\n");
  assert.notEqual(run().status,0,'strict control must reject mismatch');
  assert.equal(run('--sync').status,0,'build sync must repair mismatch');
  assert.equal(fs.readFileSync(sw,'utf8'),"const VERSION = '2-F.1.1';\nconst PREFIX = 'test-';\n");
  assert.equal(run().status,0);
  fs.copyFileSync(sw,path.join(root,'dist/sw.js'));
  assert.equal(run('--dist').status,0);
  fs.writeFileSync(path.join(root,'dist/sw.js'),"const VERSION = '2-F.0.1';\n");
  assert.notEqual(run('--dist').status,0,'published artifact must not be stale');
  fs.writeFileSync(sw,'// missing version');
  assert.notEqual(run('--sync').status,0,'missing version must fail');
  fs.writeFileSync(sw,"const VERSION = '2-F.0.1';\n");
  fs.writeFileSync(path.join(root,'src/version.ts'),"export const APP_VERSION = 'invalid';\n");
  assert.notEqual(run('--sync').status,0,'invalid source must fail');
  console.log('PASS: version sync — 8 assertions, including exact reported mismatch and dist verification');
} finally {fs.rmSync(root,{recursive:true,force:true});}

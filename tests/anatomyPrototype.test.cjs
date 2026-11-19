const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const load=(name)=>{const exports={};const js=ts.transpileModule(fs.readFileSync('src/'+name,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;vm.runInNewContext(js,{exports,Math,Object,Array,Set,Map,Number});return exports;};
const {MUSCLE_GROUPS}=load('muscleRegistry.ts');
const {rotate,clampZoom,makePrototype,projectFaces,pickGroup}=load('anatomyPrototypeGeometry.ts');
const mesh=makePrototype();
assert.ok(mesh.length>0&&mesh.length<20000);
assert.deepEqual([...new Set(mesh.map(f=>f.group).filter(Boolean))].sort(),Object.keys(MUSCLE_GROUPS).sort());
assert.ok(mesh.every(f=>Math.abs(Math.hypot(...f.normal)-1)<1e-6));
assert.ok(Math.abs(rotate([1,0,0],Math.PI)[0]+1)<1e-6);
assert.equal(clampZoom(.1),1);assert.equal(clampZoom(5),2.4);
const front=projectFaces(mesh,0,1,320,420),back=projectFaces(mesh,Math.PI,1,320,420),zoomed=projectFaces(mesh,0,2,320,420);
assert.ok(front.length>0&&back.length>0);
assert.ok(front.every((f,i)=>i===0||front[i-1].depth<=f.depth));
assert.ok(front.every(f=>f.points.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)&&Number.isFinite(p.z))));
assert.ok(Math.abs(zoomed[0].points[0].x-160)>Math.abs(front[0].points[0].x-160));
assert.equal(pickGroup(front,0,0),null);
assert.ok(front.some(f=>f.group==='pectoraux'&&pickGroup(front,...centroid(f))==='pectoraux'));
assert.ok(back.some(f=>f.group==='dos'&&pickGroup(back,...centroid(f))==='dos'));
// Every region is selectable in at least one of the four orientations.
const reachable=new Set();for(const angle of [0,Math.PI/2,Math.PI,3*Math.PI/2]){const faces=projectFaces(mesh,angle,1,320,420);for(const f of faces){if(f.group&&!reachable.has(f.group)&&pickGroup(faces,...centroid(f))===f.group)reachable.add(f.group);}}
assert.deepEqual([...reachable].sort(),Object.keys(MUSCLE_GROUPS).sort());
function centroid(f){return [f.points.reduce((n,p)=>n+p.x,0)/3,f.points.reduce((n,p)=>n+p.y,0)/3];}
console.log('PASS: geometry prototype — 14 checks, 12 selectable regions');

// Build-time only. No network access from the PWA at runtime.
const fs=require('node:fs');const path=require('node:path');const crypto=require('node:crypto');const {execFileSync}=require('node:child_process');
const rules=require('../src/anatomyModelRules.json').map(([g,r])=>[g,new RegExp(r,'i')]);
const proxyRule=require('../src/anatomyProxyRule.json');const proxyPattern=new RegExp(proxyRule.pattern,'i');
function inspectGlb(buf){
 if(buf.length<20||buf.toString('ascii',0,4)!=='glTF'||buf.readUInt32LE(4)!==2||buf.readUInt32LE(8)!==buf.length)throw Error('GLB invalide');
 const n=buf.readUInt32LE(12);if(n>buf.length-20||buf.toString('ascii',16,20)!=='JSON')throw Error('JSON GLB invalide');
 const doc=JSON.parse(buf.toString('utf8',20,20+n));
 const counts=Object.fromEntries(rules.map(([g])=>[g,0]));let unknown=0;
 const proxies=[];const sourceLabels=[];
 for(const node of doc.nodes??[]){if(!Number.isInteger(node.mesh)||!doc.meshes?.[node.mesh]?.primitives?.length)continue;const d=node.extras??{};if(d.kind!=='muscle'||typeof d.label!=='string')continue;const label=d.label.replace(/[_-]/g,' ').trim();const matches=rules.filter(([,r])=>r.test(label));if(matches.length===1)counts[matches[0][0]]++;else if(matches.length===0&&proxyPattern.test(label))proxies.push(d.label);else unknown++;if(/fasci|glute|iliotib|abduct/i.test(label))sourceLabels.push(d.label);}
 const proxyGroups={};
 if(!counts[proxyRule.group]&&proxies.length){counts[proxyRule.group]=proxies.length;proxyGroups[proxyRule.group]={label:proxyRule.label,meshes:proxies};}else unknown+=proxies.length;
 const missing=Object.keys(counts).filter(g=>!counts[g]);if(missing.length)throw Error('Groupes anatomiques sans maillage ni repère autorisé: '+missing.join(', ')+' ; libellés de hanche disponibles: '+sourceLabels.join(' | '));
 if(!(doc.extensionsUsed??[]).includes('KHR_draco_mesh_compression'))throw Error('Format Draco attendu');
 if((doc.buffers??[]).some(b=>b.uri)||(doc.images??[]).some(b=>b.uri))throw Error('Ressources externes non autorisées');
 return {counts,unknown,proxyGroups};
}
async function download(url){const r=await fetch(url,{signal:AbortSignal.timeout(60000)});if(!r.ok)throw Error('Téléchargement '+r.status+' : '+url);return Buffer.from(await r.arrayBuffer());}
async function main(){
 const repo='https://github.com/tiralonghipol/free-muscles';
 const revision=process.env.ANATOMY_REVISION||execFileSync('git',['ls-remote',repo+'.git','refs/heads/main'],{encoding:'utf8',timeout:30000}).trim().split(/\s+/)[0];
 if(!/^[a-f0-9]{40}$/.test(revision))throw Error('Révision anatomique Git invalide');
 const root=`https://raw.githubusercontent.com/tiralonghipol/free-muscles/${revision}/`;
 const [buf,license]=await Promise.all([download(root+'public/anatomy.glb'),download(root+'LICENSE')]);
 if(buf.length>12*1024*1024)throw Error('Budget taille GLB dépassé');
 const audit=inspectGlb(buf);if(!license.toString().includes('Attribution-ShareAlike 4.0'))throw Error('Licence amont inattendue');
 const dest=path.resolve('public/anatomy');fs.mkdirSync(dest,{recursive:true});
 fs.writeFileSync(path.join(dest,'model.glb'),buf);fs.writeFileSync(path.join(dest,'UPSTREAM-LICENSE.txt'),license);
 fs.writeFileSync(path.join(dest,'provenance.json'),JSON.stringify({repository:repo,revision,sha256:crypto.createHash('sha256').update(buf).digest('hex'),bytes:buf.length,license:'CC-BY-SA-4.0',...audit},null,2));
 const decoder=path.resolve('node_modules/three/examples/jsm/libs/draco/gltf');
 for(const name of ['draco_decoder.js','draco_decoder.wasm','draco_wasm_wrapper.js'])fs.copyFileSync(path.join(decoder,name),path.join(dest,name));
 fs.copyFileSync(path.resolve('node_modules/three/LICENSE'),path.join(dest,'THREE-LICENSE.txt'));
 fs.writeFileSync(path.join(dest,'NOTICE.txt'),'Free Muscle (tiralonghipol), derived from Z-Anatomy and BodyParts3D © DBCLS, CC BY-SA 4.0. Original model unchanged. Three.js MIT; Draco decoder © Google, Apache License 2.0: https://www.apache.org/licenses/LICENSE-2.0 . See UPSTREAM-LICENSE.txt and THREE-LICENSE.txt.\n');
 console.log('Anatomy GLB verified:',revision,audit);
}
module.exports={inspectGlb};if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1;});

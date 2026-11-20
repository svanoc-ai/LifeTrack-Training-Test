import {useEffect,useRef,type RefObject} from 'react';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {DRACOLoader} from 'three/addons/loaders/DRACOLoader.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {modelGroup} from './anatomyModelMapping';
import {MUSCLE_GROUPS,type MuscleGroup} from './muscleRegistry';
import {VOLUME_PALETTE,groupVolume} from './anatomyGroupVolume';
type Pose={yaw:number;zoom:number;panY:number};
type Props={pose:Pose;size:{w:number;h:number};volume:ReturnType<typeof groupVolume>;display:'anatomie'|'volume'|'selection';selected:MuscleGroup|null;onStatus:(s:'loading'|'ready'|'fallback')=>void;onProxy:(active:boolean)=>void;pick:RefObject<((x:number,y:number)=>MuscleGroup|null)|null>};
type Part={mesh:THREE.Mesh<THREE.BufferGeometry,THREE.MeshStandardMaterial>;group:MuscleGroup|null};
type View={renderer:THREE.WebGLRenderer;scene:THREE.Scene;camera:THREE.OrthographicCamera;body:THREE.Group;parts:Part[]};
const base=import.meta.env.BASE_URL+'anatomy/';
function disposeSource(root:THREE.Object3D){root.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();}});}
// glTF extras may be on the parent node when a mesh has multiple primitives.
function partMetadata(o:THREE.Object3D):{kind?:unknown;label?:unknown}{
 for(let node:THREE.Object3D|null=o;node;node=node.parent){if(typeof node.userData.kind==='string'&&typeof node.userData.label==='string')return node.userData;}
 return {};
}
function makeParts(root:THREE.Object3D){
 root.updateMatrixWorld(true);const bins=new Map<string,THREE.BufferGeometry[]>();
 const parts:Part[]=[];const seen=new Set<MuscleGroup>();
 let hasDirectAbductors=false;root.traverse(o=>{if(o instanceof THREE.Mesh&&modelGroup(partMetadata(o))==='abducteurs')hasDirectAbductors=true;});
 const useProxy=!hasDirectAbductors;
 try{
 root.traverse(o=>{if(!(o instanceof THREE.Mesh))return;const data=partMetadata(o);const group=modelGroup(data,useProxy);const label=typeof data.label==='string'?data.label:'unclassified';const key=(group??'neutral')+'::'+label;if(group)seen.add(group);
  let g=o.geometry.clone();if(g.index){const non=g.toNonIndexed();g.dispose();g=non;}g.applyMatrix4(o.matrixWorld);
  for(const attr of Object.keys(g.attributes))if(attr!=='position'&&attr!=='normal')g.deleteAttribute(attr);
  if(!g.getAttribute('normal'))g.computeVertexNormals();
  // GLTFLoader returns typed BufferAttributes; normalize representation for merging.
  const plain=new THREE.BufferGeometry();for(const name of ['position','normal']){const a=g.getAttribute(name);const values=new Float32Array(a.count*3);for(let i=0;i<a.count;i++){values[3*i]=a.getX(i);values[3*i+1]=a.getY(i);values[3*i+2]=a.getZ(i);}plain.setAttribute(name,new THREE.BufferAttribute(values,3));}g.dispose();
  const list=bins.get(key)??[];list.push(plain);bins.set(key,list);
 });
 if(seen.size!==Object.keys(MUSCLE_GROUPS).length)throw Error('Correspondance anatomique incomplète');
 for(const [key,list] of bins){const g=mergeGeometries(list);if(!g)throw Error('Fusion anatomique impossible');g.computeBoundingSphere();const mesh=new THREE.Mesh(g,new THREE.MeshStandardMaterial({color:0xb14b4f,roughness:.94,metalness:0,side:THREE.FrontSide,flatShading:false}));const groupKey=key.split('::')[0];mesh.userData.anatomyKind=groupKey==='neutral'?'neutral':'muscle';parts.push({mesh,group:groupKey in MUSCLE_GROUPS?groupKey as MuscleGroup:null});}
 return {parts,useProxy};
 }catch(e){for(const p of parts){p.mesh.geometry.dispose();p.mesh.material.dispose();}throw e;}finally{for(const list of bins.values())for(const g of list)g.dispose();disposeSource(root);}
}
export default function AnatomyRealCanvas(props:Props){
 const canvas=useRef<HTMLCanvasElement>(null);const view=useRef<View|null>(null);const latest=useRef(props);latest.current=props;
 const render=()=>{const v=view.current;if(!v)return;const p=latest.current;if(!p.size.w||!p.size.h)return;const aspect=p.size.w/p.size.h;const half=Math.max(1.15,.65/aspect)/p.pose.zoom;
 v.camera.left=-half*aspect;v.camera.right=half*aspect;v.camera.top=half;v.camera.bottom=-half;v.camera.position.y=p.pose.panY*2*half/p.size.h;v.camera.updateProjectionMatrix();v.camera.updateMatrixWorld();v.body.rotation.y=p.pose.yaw;v.body.updateMatrixWorld(true);
 const current=v.renderer.getSize(new THREE.Vector2());if(current.x!==p.size.w||current.y!==p.size.h)v.renderer.setSize(p.size.w,p.size.h,false);
 for(const {mesh,group} of v.parts){mesh.visible=p.display!=='anatomie'||mesh.userData.anatomyKind==='muscle';const colors=group?(p.display==='volume'?VOLUME_PALETTE[p.volume.groups[group].band]:group===p.selected?[41,233,204]:p.display==='anatomie'?[178,66,72]:[166,89,87]):p.display==='anatomie'?[147,70,72]:[100,116,128];mesh.material.color.setRGB(colors[0]/255,colors[1]/255,colors[2]/255,THREE.SRGBColorSpace);}
 v.renderer.render(v.scene,v.camera);
 };
 useEffect(()=>{const el=canvas.current;if(!el)return;let cancelled=false;let renderer:THREE.WebGLRenderer|undefined;let draco:DRACOLoader|undefined;
 const fail=()=>{if(!cancelled){latest.current.pick.current=null;latest.current.onStatus('fallback');}};
 const lost=(e:Event)=>{e.preventDefault();fail();};el.addEventListener('webglcontextlost',lost);
 latest.current.onProxy(false);latest.current.onStatus('loading');
 try{renderer=new THREE.WebGLRenderer({canvas:el,alpha:true,antialias:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));renderer.setClearColor(0x000000,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
 draco=new DRACOLoader().setDecoderPath(base).setWorkerLimit(2);const loader=new GLTFLoader().setDRACOLoader(draco);const r=renderer;
 loader.loadAsync(base+'model.glb').then(gltf=>{if(cancelled){disposeSource(gltf.scene);return;}const {parts,useProxy}=makeParts(gltf.scene);const body=new THREE.Group();for(const p of parts)body.add(p.mesh);const box=new THREE.Box3().setFromObject(body);const size=box.getSize(new THREE.Vector3());if(!Number.isFinite(size.y)||size.y<=0){for(const p of parts){p.mesh.geometry.dispose();p.mesh.material.dispose();}throw Error('Dimensions invalides');}
 const scale=2/size.y;const center=box.getCenter(new THREE.Vector3());for(const p of parts){p.mesh.geometry.translate(-center.x,-center.y,-center.z);p.mesh.geometry.scale(scale,scale,scale);p.mesh.geometry.computeBoundingSphere();}
 const scene=new THREE.Scene();scene.add(body);scene.add(new THREE.HemisphereLight(0xffffff,0x51484b,1.55));for(const x of [-4,4]){const key=new THREE.DirectionalLight(0xfff3ee,1.45);key.position.set(x,5,6);scene.add(key);}const fill=new THREE.DirectionalLight(0xffffff,.45);fill.position.set(0,-2,5);scene.add(fill);const back=new THREE.DirectionalLight(0xffffff,.65);back.position.set(0,3,-5);scene.add(back);
 const camera=new THREE.OrthographicCamera(-1,1,1,-1,.1,30);camera.position.set(0,0,6);camera.updateMatrixWorld();view.current={renderer:r,scene,camera,body,parts};
 latest.current.pick.current=(x,y)=>{const v=view.current,p=latest.current;if(!v||!p.size.w||!p.size.h)return null;const caster=new THREE.Raycaster();caster.setFromCamera(new THREE.Vector2(x/p.size.w*2-1,1-y/p.size.h*2),v.camera);const first=caster.intersectObjects(v.parts.map(p=>p.mesh),false)[0];return v.parts.find(p=>p.mesh===first?.object)?.group??null;};
 render();latest.current.onProxy(useProxy);latest.current.onStatus('ready');}).catch(fail);
 }catch{fail();}
 return()=>{cancelled=true;el.removeEventListener('webglcontextlost',lost);latest.current.pick.current=null;for(const p of view.current?.parts??[]){p.mesh.geometry.dispose();p.mesh.material.dispose();}view.current=null;draco?.dispose();renderer?.dispose();};
 // The renderer is created once per mount. Props are read through latest.
 },[]);
 useEffect(()=>{try{render();}catch{props.pick.current=null;props.onStatus('fallback');}},[props.pose,props.size,props.volume,props.display,props.selected]);
 return <canvas ref={canvas} className="lt-anatomy-real-canvas" aria-hidden="true"/>;
}

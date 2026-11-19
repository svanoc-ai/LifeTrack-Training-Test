import {useEffect,useRef,useState,type PointerEvent as ReactPointerEvent} from 'react';
import {MUSCLE_GROUPS,type MuscleGroup} from './muscleRegistry';
import {clampZoom,makePrototype,pickGroup,projectFaces,type ProjectedFace} from './anatomyPrototypeGeometry';

const LABELS:Record<MuscleGroup,string>={pectoraux:'Pectoraux',dos:'Dos',epaules:'Épaules',biceps:'Biceps',triceps:'Triceps',abdominaux:'Abdominaux',fessiers:'Fessiers',quadriceps:'Quadriceps',ischio_jambiers:'Ischio-jambiers',adducteurs:'Adducteurs',abducteurs:'Abducteurs',mollets:'Mollets'};
const geometry=makePrototype();
type Pose={yaw:number;zoom:number;panY:number};
type Touch={x:number;y:number};
const initialPose:Pose={yaw:0,zoom:1,panY:0};
const dist=(a:Touch,b:Touch)=>Math.hypot(a.x-b.x,a.y-b.y);
const boundPan=(p:number,z:number,h:number)=>Math.max(-h*(z-1)/2,Math.min(h*(z-1)/2,p));
const rgb=(base:number[],light:number)=>`rgb(${base.map(c=>Math.round(c*light)).join(',')})`;
export default function AnatomyPrototype(){
 const canvas=useRef<HTMLCanvasElement|null>(null);
 const projected=useRef<ProjectedFace[]>([]);
 const pointers=useRef(new Map<number,Touch>());
 const gesture=useRef<{start:Touch;dragged:boolean}|null>(null);
 const [pose,setPose]=useState<Pose>(initialPose);
 const [selected,setSelected]=useState<MuscleGroup|null>(null);
 const [size,setSize]=useState({w:0,h:0});
 const [unsupported,setUnsupported]=useState(false);
 const [renderMs,setRenderMs]=useState<number|null>(null);
 useEffect(()=>{const el=canvas.current;if(!el)return;const update=()=>{const r=el.getBoundingClientRect();setSize({w:Math.round(r.width),h:Math.round(r.height)});};update();if(typeof ResizeObserver!=='undefined'){const observer=new ResizeObserver(update);observer.observe(el);return()=>observer.disconnect();}window.addEventListener('resize',update);return()=>window.removeEventListener('resize',update);},[]);
 useEffect(()=>{const el=canvas.current;if(!el||!size.w||!size.h)return;const ctx=el.getContext('2d');if(!ctx){setUnsupported(true);return;}const id=requestAnimationFrame(()=>{const begin=performance.now();const dpr=Math.min(2,window.devicePixelRatio||1);const w=Math.round(size.w*dpr),h=Math.round(size.h*dpr);if(el.width!==w||el.height!==h){el.width=w;el.height=h;}ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,size.w,size.h);
  const faces=projectFaces(geometry,pose.yaw,pose.zoom,size.w,size.h,pose.panY);projected.current=faces;
  for(const f of faces){const [a,b,c]=f.points;const base=f.group===null?[119,139,149]:f.group===selected?[41,233,204]:[164,116,105];const color=rgb(base,f.light);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.lineTo(c.x,c.y);ctx.closePath();ctx.fillStyle=color;ctx.fill();ctx.strokeStyle=color;ctx.lineWidth=.45;ctx.stroke();}
  setRenderMs(Math.round(performance.now()-begin));});return()=>cancelAnimationFrame(id);},[pose,selected,size]);
 const local=(e:ReactPointerEvent<HTMLCanvasElement>):Touch=>{const r=e.currentTarget.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top};};
 const down=(e:ReactPointerEvent<HTMLCanvasElement>)=>{if(e.pointerType==='mouse'&&e.button!==0)return;const p=local(e);pointers.current.set(e.pointerId,p);if(pointers.current.size===1)gesture.current={start:p,dragged:false};else if(gesture.current)gesture.current.dragged=true;try{e.currentTarget.setPointerCapture(e.pointerId);}catch{/* pointer may have ended */}};
 const move=(e:ReactPointerEvent<HTMLCanvasElement>)=>{const previous=pointers.current.get(e.pointerId);if(!previous)return;const p=local(e),g=gesture.current;const other=[...pointers.current.entries()].find(([id])=>id!==e.pointerId)?.[1];pointers.current.set(e.pointerId,p);
  if(other){if(g)g.dragged=true;const factor=dist(p,other)/Math.max(1,dist(previous,other));setPose(v=>{const zoom=clampZoom(v.zoom*factor);return {...v,zoom,panY:boundPan(v.panY+(p.y-previous.y)/2,zoom,size.h)};});return;}
  if(!g)return;if(!g.dragged&&dist(p,g.start)<7)return;g.dragged=true;setPose(v=>({...v,yaw:v.yaw+(p.x-previous.x)*.013,panY:boundPan(v.panY+p.y-previous.y,v.zoom,size.h)}));};
 const end=(e:ReactPointerEvent<HTMLCanvasElement>,cancel=false)=>{if(!pointers.current.has(e.pointerId))return;const p=local(e),g=gesture.current;if(!cancel&&pointers.current.size===1&&g&&!g.dragged&&dist(p,g.start)<7){setSelected(pickGroup(projected.current,p.x,p.y));}pointers.current.delete(e.pointerId);if(pointers.current.size===0)gesture.current=null;};
 const zoomBy=(delta:number)=>setPose(v=>{const zoom=clampZoom(v.zoom+delta);return {...v,zoom,panY:boundPan(v.panY,zoom,size.h)};});
 return <section className="panel lt-anatomy-prototype" aria-label="Prototype de carte musculaire 3D">
  <h2>Carte musculaire 3D</h2><p className="muted small">Prototype technique · Silhouette schématique, non médicale. Les couleurs ne représentent pas encore tes statistiques.</p>
  <div className="lt-anatomy-stage"><canvas ref={canvas} aria-label="Silhouette 3D interactive. Utilise les boutons ou la liste de groupes musculaires si nécessaire." onPointerDown={down} onPointerMove={move} onPointerUp={e=>end(e)} onPointerCancel={e=>end(e,true)} onLostPointerCapture={e=>end(e,true)}/>{unsupported&&<p role="status">Affichage indisponible. La liste des groupes reste accessible.</p>}</div>
  <p className="muted small">Glisse horizontalement pour tourner · pince pour zoomer · touche un muscle pour le sélectionner.</p>
  <div className="lt-anatomy-controls"><button type="button" onClick={()=>setPose(v=>({...v,yaw:0}))}>Face</button><button type="button" onClick={()=>setPose(v=>({...v,yaw:Math.PI}))}>Dos</button><button type="button" aria-label="Tourner à gauche" onClick={()=>setPose(v=>({...v,yaw:v.yaw-Math.PI/6}))}>↶</button><button type="button" aria-label="Tourner à droite" onClick={()=>setPose(v=>({...v,yaw:v.yaw+Math.PI/6}))}>↷</button></div>
  <div className="lt-anatomy-controls"><button type="button" aria-label="Réduire le zoom" disabled={pose.zoom<=1} onClick={()=>zoomBy(-.25)}>−</button><span>{Math.round(pose.zoom*100)} %</span><button type="button" aria-label="Augmenter le zoom" disabled={pose.zoom>=2.4} onClick={()=>zoomBy(.25)}>+</button><button type="button" onClick={()=>{setPose(initialPose);setSelected(null);}}>Réinitialiser</button></div>
  <label className="field-label" htmlFor="lt-anatomy-group">Groupe musculaire</label><select className="profile-input" id="lt-anatomy-group" value={selected??''} onChange={e=>setSelected(e.target.value?e.target.value as MuscleGroup:null)}><option value="">Aucun groupe sélectionné</option>{(Object.keys(MUSCLE_GROUPS) as MuscleGroup[]).map(g=><option key={g} value={g}>{LABELS[g]}</option>)}</select>
  <p aria-live="polite" className="lt-anatomy-selection">{selected?`${LABELS[selected]} · ${MUSCLE_GROUPS[selected].length} muscles référencés dans LifeTrack`:'Sélectionne un groupe sur la silhouette ou dans la liste.'}</p>
  {renderMs!==null&&<p className="muted small">Dernier rendu local : {renderMs} ms (indicatif, hors affichage écran).</p>}
 </section>;
}

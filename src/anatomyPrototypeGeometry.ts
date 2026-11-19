/** Original procedural geometry for the technical prototype, not a medical model. */
import type {MuscleGroup} from './muscleRegistry';
export type Vec3=[number,number,number];
export type Face={a:Vec3;b:Vec3;c:Vec3;normal:Vec3;group:MuscleGroup|null};
export type Point={x:number;y:number;z:number};
export type ProjectedFace={points:[Point,Point,Point];depth:number;light:number;group:MuscleGroup|null};
const TAU=2*Math.PI;
const add=(a:Vec3,b:Vec3):Vec3=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
const sub=(a:Vec3,b:Vec3):Vec3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const cross=(a:Vec3,b:Vec3):Vec3=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const unit=(a:Vec3):Vec3=>{const d=Math.hypot(...a)||1;return [a[0]/d,a[1]/d,a[2]/d];};
const dot=(a:Vec3,b:Vec3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
export function rotate(v:Vec3,yaw:number):Vec3 {const c=Math.cos(yaw),s=Math.sin(yaw);return [v[0]*c+v[2]*s,v[1],-v[0]*s+v[2]*c];}
export const clampZoom=(n:number)=>Math.max(1,Math.min(2.4,n));
function ellipsoid(out:Face[],center:Vec3,radius:Vec3,group:MuscleGroup|null,tilt=0){
 const cs=Math.cos(tilt),sn=Math.sin(tilt),rings=10,sides=16;
 const point=(i:number,j:number):Vec3=>{const t=i*Math.PI/rings,p=j*TAU/sides;const x=radius[0]*Math.sin(t)*Math.cos(p),y=radius[1]*Math.cos(t);return add(center,[x*cs-y*sn,x*sn+y*cs,radius[2]*Math.sin(t)*Math.sin(p)]);};
 const triangle=(a:Vec3,b:Vec3,c:Vec3)=>{let normal=unit(cross(sub(b,a),sub(c,a)));if(dot(normal,sub(a,center))<0){[b,c]=[c,b];normal=unit(cross(sub(b,a),sub(c,a)));}if(Math.hypot(...normal)>.5)out.push({a,b,c,normal,group});};
 for(let i=0;i<rings;i++)for(let j=0;j<sides;j++){const a=point(i,j),b=point(i+1,j),c=point(i+1,j+1),d=point(i,j+1);if(i<rings-1)triangle(a,b,c);if(i>0)triangle(a,c,d);}
}
export function makePrototype():Face[]{
 const f:Face[]=[];const e=(c:Vec3,r:Vec3,g:MuscleGroup|null=null,t=0)=>ellipsoid(f,c,r,g,t);
 // Neutral body volumes: head, neck, rib cage, waist, pelvis and joints.
 e([0,3.0,0],[.35,.45,.32]);e([0,2.53,0],[.20,.26,.20]);e([0,1.87,0],[.72,.78,.36]);e([0,1.10,0],[.47,.66,.29]);e([0,.58,0],[.59,.44,.34]);
 for(const s of [-1,1]){
  const p=(x:number,y:number,z:number):Vec3=>[s*x,y,z];
  e(p(.78,1.90,0),[.28,.66,.25],null,s*.30);e(p(1.05,1.12,0),[.20,.49,.19],null,s*.28);e(p(1.20,.58,0),[.14,.24,.12]);
  e(p(.32,-.20,0),[.32,.88,.31],null,-s*.04);e(p(.35,-1.02,0),[.22,.24,.23]);e(p(.36,-1.66,0),[.23,.66,.23]);e(p(.38,-2.30,.13),[.21,.17,.37]);
  // Superficial group proxies, deliberately simplified.
  e(p(.35,1.98,.30),[.36,.30,.20],'pectoraux',s*.12);
  e(p(.75,2.07,.02),[.30,.33,.28],'epaules',s*.25);
  e(p(.86,1.55,.15),[.21,.40,.19],'biceps',s*.30);
  e(p(.86,1.55,-.16),[.22,.43,.19],'triceps',s*.30);
  e(p(.43,1.66,-.25),[.31,.55,.18],'dos',-s*.22);
  e(p(.23,2.15,-.24),[.34,.37,.17],'dos',s*.37);
  for(const y of [1.46,1.17,.88])e(p(.15,y,.30),[.15,.17,.10],'abdominaux');
  e(p(.39,1.19,.20),[.16,.43,.13],'abdominaux',s*.14);
  e(p(.33,.54,-.28),[.31,.36,.22],'fessiers');
  e(p(.55,.45,.02),[.15,.34,.22],'abducteurs',-s*.13);
  e(p(.33,-.19,.22),[.24,.72,.19],'quadriceps',-s*.06);
  e(p(.12,-.12,.11),[.14,.53,.19],'adducteurs',s*.09);
  e(p(.32,-.22,-.23),[.25,.70,.18],'ischio_jambiers');
  e(p(.36,-1.52,-.17),[.24,.43,.20],'mollets');
 }
 return f;
}
export function projectFaces(faces:readonly Face[],yaw:number,zoom:number,width:number,height:number,panY=0):ProjectedFace[]{
 const scale=Math.min(width/3.15,height/6.35)*clampZoom(zoom);
 const project=(v:Vec3):Point=>{const [x,y,z]=rotate(v,yaw);return {x:width/2+x*scale,y:height/2-(y-.52)*scale+panY,z};};
 const out:ProjectedFace[]=[];const lightDirection=unit([-.35,.65,1]);
 for(const f of faces){const n=rotate(f.normal,yaw);if(n[2]<=0)continue;const points:[Point,Point,Point]=[project(f.a),project(f.b),project(f.c)];out.push({points,depth:(points[0].z+points[1].z+points[2].z)/3,light:Math.max(.24,dot(n,lightDirection)*.76+.24),group:f.group});}
 return out.sort((a,b)=>a.depth-b.depth);
}
function contains(x:number,y:number,p:[Point,Point,Point]){const edge=(a:Point,b:Point)=>(x-b.x)*(a.y-b.y)-(a.x-b.x)*(y-b.y);if(Math.abs((p[1].x-p[0].x)*(p[2].y-p[0].y)-(p[1].y-p[0].y)*(p[2].x-p[0].x))<1e-6)return false;const u=edge(p[0],p[1]),v=edge(p[1],p[2]),w=edge(p[2],p[0]);return !((u<0||v<0||w<0)&&(u>0||v>0||w>0));}
export function pickGroup(faces:readonly ProjectedFace[],x:number,y:number):MuscleGroup|null {for(let i=faces.length-1;i>=0;i--){if(contains(x,y,faces[i].points))return faces[i].group;}return null;}

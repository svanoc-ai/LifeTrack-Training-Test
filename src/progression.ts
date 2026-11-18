import type {Execution, SetResult} from './SessionExecution';

export type ProgressionPoint={sessionId:string;date:string;loadKg:number|null;minReps:number|null;complete:boolean;success:boolean;pending:boolean;confirmed:boolean};
const dateOf=(s:Execution)=>new Date(s.endedAt||s.updatedAt||s.startedAt);
const validated=(s:SetResult)=>s.validated===true;
export function progressionPoints(history:Execution[],exerciseId:string):ProgressionPoint[]{
 const ordered=history.filter(s=>(s.status==='completed'||s.status==='partial')&&Number.isFinite(dateOf(s).getTime())).slice().sort((a,b)=>dateOf(a).getTime()-dateOf(b).getTime());
 const rows:ProgressionPoint[]=[];
 for(const session of ordered){
  session.targets.forEach((target,index)=>{
   if(target.exerciseId!==exerciseId||!target.sets||target.sets<1||target.durationSeconds!==undefined)return;
   const result=session.exerciseResults?.find(r=>r.index===index);
   const originals=Array.from({length:target.sets},(_,i)=>result?.sets.find(x=>x.set===i+1));
   const complete=originals.every(x=>x!==undefined&&validated(x));
   const sets=originals.filter((x):x is SetResult=>x!==undefined&&validated(x));
   const success=complete&&sets.every(x=>(target.reps===undefined||x.reps>=target.reps)&&(target.rir===undefined||(x.rir!==null&&x.rir>=target.rir)));
   const loadKg=sets.length&&sets.every(x=>Number.isFinite(x.loadKg)&&x.loadKg===sets[0].loadKg)?sets[0].loadKg:null;
   const minReps=complete&&sets.every(x=>Number.isFinite(x.reps))?Math.min(...sets.map(x=>x.reps)):null;
   // An exceptional early 3x12 is a candidate, never immediately confirmed.
   const pending=complete&&target.sets===3&&sets.length===3&&sets.every(x=>Number.isFinite(x.reps)&&x.reps>=12)&&target.reps!==undefined&&target.reps<12&&loadKg!==null;
   rows.push({sessionId:session.id,date:dateOf(session).toISOString(),loadKg,minReps,complete,success,pending,confirmed:false});
  });
 }
 for(let i=0;i<rows.length;i++){
  const p=rows[i];if(!p.pending)continue;
  const later=rows.slice(i+1).find(x=>x.sessionId!==p.sessionId&&x.complete&&x.loadKg===p.loadKg&&x.minReps!==null&&x.minReps>=12);
  if(later){p.pending=false;p.confirmed=true;}
 }
 return rows;
}
export type Grouping='session'|'week'|'month';
export function groupPoints(points:ProgressionPoint[],grouping:Grouping){
 if(grouping==='session')return points;
 const groups=new Map<string,ProgressionPoint[]>();
 for(const p of points){const d=new Date(p.date);if(!Number.isFinite(d.getTime()))continue;let key='';if(grouping==='month')key=`${d.getFullYear()}-${d.getMonth()}`;else {const monday=new Date(d.getFullYear(),d.getMonth(),d.getDate());monday.setDate(monday.getDate()-(monday.getDay()+6)%7);key=monday.toISOString().slice(0,10)}groups.set(key,[...(groups.get(key)||[]),p]);}
 // Only the last COMPLETE session of each grouping is a representative.
 return [...groups.values()].map(rows=>rows.filter(x=>x.complete).at(-1)).filter((p):p is ProgressionPoint=>p!==undefined);
}

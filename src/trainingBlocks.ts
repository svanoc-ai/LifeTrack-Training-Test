/** Ordering and rest rules for contiguous exercise blocks. Pure functions; no React dependency. */
export type BlockTarget={supersetId?:string;sets?:number;restSeconds?:number;blockRestBetweenExercisesSeconds?:number;blockRestBetweenRoundsSeconds?:number};
export type BlockSet={index:number;set:number};
export type BlockStep=BlockSet&{restSeconds:number;restKind:'series'|'exercise';blockLabel?:string;round?:number};
const count=(t:BlockTarget)=>Math.max(1,Math.min(30,Math.floor(t.sets||1)));
export function blockMembers(targets:BlockTarget[],index:number):number[]{
 const id=targets[index]?.supersetId;
 if(!id)return [index];
 const members=targets.map((t,i)=>t.supersetId===id?i:-1).filter(i=>i>=0);
 return members.length>=2?members:[index];
}
/** An exercise block is a contiguous group, with identical series counts. */
export function validBlocks(targets:BlockTarget[]):string|null{
 const ids=[...new Set(targets.map(t=>t.supersetId).filter((v):v is string=>!!v))];
 for(const id of ids){
  const indexes=targets.map((t,i)=>t.supersetId===id?i:-1).filter(i=>i>=0);
  if(indexes.length<2)return `Le bloc ${id} doit contenir au moins deux exercices.`;
  if(indexes[indexes.length-1]-indexes[0]+1!==indexes.length)return `Les exercices du bloc ${id} doivent se suivre.`;
  if(indexes.some(i=>count(targets[i])!==count(targets[indexes[0]])))return `Les exercices du bloc ${id} doivent avoir le même nombre de tours.`;
 }
 return null;
}
/** Build the logical execution order, preserving individual exercise indexes for storage. */
export function blockOrder(targets:BlockTarget[]):BlockSet[]{
 const order:BlockSet[]=[];
 for(let i=0;i<targets.length;){
  const members=blockMembers(targets,i);
  if(members.length>1&&members[0]===i){
   for(let round=1;round<=count(targets[i]);round++)for(const index of members)order.push({index,set:round});
   i=members[members.length-1]+1;
  }else{for(let set=1;set<=count(targets[i]);set++)order.push({index:i,set});i++}
 }
 return order;
}
export function nextBlockStep(targets:BlockTarget[],done:(index:number,set:number)=>boolean,currentIndex:number,currentSet:number):BlockStep|null{
 const order=blockOrder(targets);
 const currentPos=order.findIndex(s=>s.index===currentIndex&&s.set===currentSet);
 const next=order.slice(Math.max(0,currentPos+1)).find(s=>!done(s.index,s.set))??order.find(s=>!done(s.index,s.set));
 if(!next)return null;
 const members=blockMembers(targets,currentIndex);
 const inSameBlock=members.length>1&&members.includes(next.index);
 const endOfRound=inSameBlock&&next.set!==currentSet;
 const settings=targets[members[0]];
 const seconds=inSameBlock
  ?endOfRound?(settings.blockRestBetweenRoundsSeconds??90):(settings.blockRestBetweenExercisesSeconds??0)
  :next.index===currentIndex?(targets[currentIndex].restSeconds??90):120;
 return {...next,restSeconds:Math.max(0,Math.min(3600,seconds)),restKind:next.index===currentIndex?'series':'exercise',blockLabel:inSameBlock?targets[currentIndex].supersetId:undefined,round:inSameBlock?next.set:undefined};
}

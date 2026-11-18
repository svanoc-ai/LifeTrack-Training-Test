export type TimedSet = {index:number;set:number;elapsedMs:number;startedAt:string|null};
export function timedElapsed(t:TimedSet,now:number):number {
 const delta=t.startedAt===null?0:Math.max(0,now-Date.parse(t.startedAt));
 return Math.max(0,t.elapsedMs+delta);
}
export function freezeTimed(t:TimedSet|null|undefined,now:number):TimedSet|null {
 return t?{...t,elapsedMs:timedElapsed(t,now),startedAt:null}:null;
}
export function startTimed(t:TimedSet|null|undefined,index:number,set:number,now:number):TimedSet {
 if(t?.index===index&&t.set===set)return {...t,startedAt:t.startedAt??new Date(now).toISOString()};
 return {index,set,elapsedMs:0,startedAt:new Date(now).toISOString()};
}
export function timedResult(t:TimedSet,now:number,targetSeconds:number):number {
 return Math.min(targetSeconds,Math.max(0,Math.floor(timedElapsed(t,now)/1000)));
}

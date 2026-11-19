import type {Execution} from './SessionExecution';
import {MUSCLE_GROUPS,setContributions,type MuscleGroup,type MuscleId,type MuscleMapping} from './muscleRegistry';
import type {StatsPeriod} from './statsEngine';
export type MuscleStats={groups:Record<MuscleGroup,{primary:number;secondary:number;total:number}>;anatomy:Record<string,number>;unknownSets:number;classifiedSets:number;exerciseDetails:Record<MuscleGroup,Record<string,number>>};
const day=(iso:string)=>{const d=new Date(iso);return Number.isFinite(d.getTime())?`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`:null};
export function calculateMuscleStats(sessions:readonly Execution[],period:StatsPeriod):MuscleStats{
 const groups=Object.fromEntries(Object.keys(MUSCLE_GROUPS).map(k=>[k,{primary:0,secondary:0,total:0}])) as MuscleStats['groups'];
 const anatomy:Record<string,number>={};const exerciseDetails=Object.fromEntries(Object.keys(MUSCLE_GROUPS).map(k=>[k,{}])) as MuscleStats['exerciseDetails'];
 let unknownSets=0,classifiedSets=0;
 for(const session of sessions){if(session.status!=='completed'&&session.status!=='partial')continue;const d=day(session.endedAt||session.updatedAt||session.startedAt);if(!d||d<period.start||d>period.end)continue;
  for(const [index,t] of session.targets.entries()){
   const result=session.exerciseResults?.find(r=>r.index===index);const count=(result?.sets??[]).filter(s=>s.validated!==false).length;if(!count)continue;
   // Historical records without a saved mapping remain unknown; never infer a variant.
   const snapshot=t.muscleSnapshot;if(!snapshot||snapshot.exerciseId!==t.exerciseId){unknownSets+=count;continue;}
   const mapping=snapshot.mapping as MuscleMapping;let contributions:Record<MuscleGroup,number>;
   try{contributions=setContributions(mapping)}catch{unknownSets+=count;continue;}
   classifiedSets+=count;
   for(const [group,weight] of Object.entries(contributions) as [MuscleGroup,number][]){if(weight===0)continue;const amount=count*weight;groups[group].total+=amount;if(weight===1)groups[group].primary+=count;else groups[group].secondary+=amount;exerciseDetails[group][t.exerciseId]=(exerciseDetails[group][t.exerciseId]??0)+amount;}
   for(const muscle of mapping.primary as MuscleId[])anatomy[muscle]=(anatomy[muscle]??0)+count;
   for(const muscle of mapping.secondary as MuscleId[])anatomy[muscle]=(anatomy[muscle]??0)+count*.25;
  }
 }
 return {groups,anatomy,unknownSets,classifiedSets,exerciseDetails};
}

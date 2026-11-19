import type {Execution,SetResult,Target} from './SessionExecution';

/** Read-only performance analysis. A missing value is never interpreted as zero. */
export type Reliability='direct'|'qualified'|'separate';
export type ProgressionRecord={sessionId:string;date:string;exerciseId:string;variantId:string|null;index:number;status:'completed'|'partial';plannedSets:number;validatedSets:number;complete:boolean;loadKg:number|null;reps:number[];minimumReps:number|null;durationSeconds:number[];minimumDurationSeconds:number|null;rirMinimum:number|null;quality:'maitrisee'|'correcte'|'ameliorer'|null;targetReps:number|null;targetRir:number|null;targetDurationSeconds:number|null;configuration:string|null};
export type Comparison={reliability:Reliability;reasons:string[]};
export type Recommendation={kind:'increase-resistance'|'increase-repetitions'|'increase-duration'|'hold'|'review';message:string;requiresApproval:true};
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const same=(a:unknown,b:unknown)=>a===b;
function config(t:Target){return t.muscleSnapshot?.variantId??t.variantId??null;}
function getValidated(sets:SetResult[],planned:number){return Array.from({length:planned},(_,i)=>sets.find(s=>s.set===i+1&&s.validated===true)).filter((s):s is SetResult=>s!==undefined);}
export function progressionRecords(history:Execution[],exerciseId?:string):ProgressionRecord[]{
 const records:ProgressionRecord[]=[];
 for(const session of history){
  if(session.status!=='completed'&&session.status!=='partial')continue;
  const date=session.endedAt||session.updatedAt||session.startedAt;
  if(!Number.isFinite(Date.parse(date)))continue;
  session.targets.forEach((t,index)=>{
   if(exerciseId&&t.exerciseId!==exerciseId)return;
   if(session.exerciseKinds?.[index]==='cardio')return;
   const planned=Math.max(0,Math.floor(t.sets??0));if(!planned)return;
   const result=session.exerciseResults?.find(r=>r.index===index);
   const valid=getValidated(result?.sets??[],planned);
   if(!valid.length)return;
   const loads=valid.map(s=>s.loadKg);
   const loadKg=loads.every(finite)&&loads.every(n=>n===loads[0])?loads[0]:null;
   const reps=valid.filter(s=>finite(s.reps)).map(s=>s.reps);
   const durations=valid.filter(s=>finite(s.durationSeconds)&&s.durationSeconds!>=0).map(s=>s.durationSeconds!);
   const rirs=valid.map(s=>s.rir).filter(finite);
   records.push({sessionId:session.id,date,exerciseId:t.exerciseId,variantId:t.variantId??null,index,status:session.status as 'completed'|'partial',plannedSets:planned,validatedSets:valid.length,complete:valid.length===planned,loadKg, reps,minimumReps:reps.length===valid.length?Math.min(...reps):null,durationSeconds:durations,minimumDurationSeconds:durations.length===valid.length?Math.min(...durations):null,rirMinimum:rirs.length===valid.length?Math.min(...rirs):null,quality:result?.quality??null,targetReps:finite(t.repMax)?t.repMax:finite(t.reps)?t.reps:null,targetRir:finite(t.rir)?t.rir:null,targetDurationSeconds:finite(t.durationSeconds)?t.durationSeconds:null,configuration:config(t)});
  });
 }
 return records.sort((a,b)=>Date.parse(a.date)-Date.parse(b.date));
}
export function compareProgression(a:ProgressionRecord,b:ProgressionRecord):Comparison{
 const reasons:string[]=[];
 if(a.exerciseId!==b.exerciseId)return {reliability:'separate',reasons:['Exercices différents']};
 if(!a.variantId||!b.variantId)return {reliability:'separate',reasons:['Variante non identifiée']};
 if(a.variantId!==b.variantId)return {reliability:'separate',reasons:['Variantes différentes']};
 if(a.configuration!==b.configuration)reasons.push('Configuration de variante différente');
 if(!same(a.loadKg,b.loadKg)||a.loadKg===null)reasons.push('Résistance nominale différente ou inconnue');
 if(a.plannedSets!==b.plannedSets)reasons.push('Nombre de séries différent');
 if(a.status==='partial'||b.status==='partial'||!a.complete||!b.complete)reasons.push('Séance ou exercice partiel');
 if((a.minimumDurationSeconds===null)!==(b.minimumDurationSeconds===null)||(a.minimumDurationSeconds!==null&&b.minimumDurationSeconds!==null&&(a.minimumReps!==null&&a.minimumReps>0)!==(b.minimumReps!==null&&b.minimumReps>0)))reasons.push('Protocoles de réalisation différents');
 return {reliability:reasons.length?'qualified':'direct',reasons};
}
/** Never applies a change automatically. An unrecorded RIR/quality requires review. */
export function suggestProgression(r:ProgressionRecord,options:{upperReps?:number;lowerReps?:number;rirTarget?:number;upperSeconds?:number}={}):Recommendation{
 const out=(kind:Recommendation['kind'],message:string):Recommendation=>({kind,message,requiresApproval:true});
 if(!r.complete||r.status==='partial')return out('hold','Séance partielle : conserver la performance, sans valider le palier.');
 if(r.quality===null||r.rirMinimum===null)return out('review','RIR ou qualité technique manquant : progression à confirmer manuellement.');
 if(r.quality==='ameliorer')return out('hold','Qualité technique à améliorer avant toute progression.');
 const rirTarget=options.rirTarget??r.targetRir;
 if(rirTarget===null)return out('review','RIR cible non défini : progression à confirmer manuellement.');
 if(r.rirMinimum<rirTarget)return out('hold','RIR inférieur à la cible : maintenir le palier.');
 if(r.minimumDurationSeconds!==null){
  const goal=options.upperSeconds??r.targetDurationSeconds;
  if(goal===null)return out('review','Durée cible non définie.');
  return r.minimumDurationSeconds>=goal?out('review','Palier de durée atteint : envisager une variante plus difficile après validation.'):out('increase-duration','Augmenter progressivement la durée des maintiens, après validation.');
 }
 if(r.minimumReps===null)return out('review','Répétitions incomplètes ou non renseignées.');
 const upper=options.upperReps??r.targetReps;
 if(upper===null)return out('review','Borne haute de répétitions non définie.');
 if(r.minimumReps>=upper)return out('increase-resistance',`Palier atteint : envisager une hausse de résistance puis un retour vers ${options.lowerReps??8} répétitions, après validation.`);
 return out('increase-repetitions','Poursuivre la progression des répétitions à résistance constante, après validation.');
}

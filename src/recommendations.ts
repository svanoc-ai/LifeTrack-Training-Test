import type {Execution,SetResult} from './SessionExecution';

export type Recommendation={kind:'insufficient'|'repeat'|'increase-reps'|'increase-load'|'review';title:string;detail:string;previousSessionId?:string};
const completed=(s:Execution)=>s.status==='completed'||s.status==='partial';
const date=(s:Execution)=>Date.parse(s.endedAt||s.updatedAt||s.startedAt);
export const REP_STEPS=[6,8,10,12,15] as const;
const valid=(set:SetResult)=>set.validated===true&&Number.isFinite(set.reps)&&Number.isFinite(set.loadKg);
/** Advisory only. No template, load or history record is changed automatically. */
export function recommendProgression(history:Execution[],exerciseId:string):Recommendation{
 const matches=history.filter(completed).flatMap(s=>s.targets.map((t,i)=>({s,t,i})))
  .filter(x=>x.t.exerciseId===exerciseId&&x.t.durationSeconds===undefined&&(x.t.sets??0)>=1&&x.t.reps!==undefined&&Number.isFinite(date(x.s)))
  .sort((a,b)=>date(b.s)-date(a.s));
 if(!matches.length)return {kind:'insufficient',title:'Données insuffisantes',detail:'Aucune séance comparable avec des séries classiques.'};
 const {s,t,i}=matches[0];
 const count=Math.floor(t.sets??0);
 const sets=Array.from({length:count},(_,n)=>s.exerciseResults?.find(r=>r.index===i)?.sets.find(v=>v.set===n+1));
 if(sets.some(v=>!v||!valid(v)))return {kind:'insufficient',title:'Séance incomplète',detail:'Toutes les séries prévues doivent être validées pour proposer une progression.',previousSessionId:s.id};
 const actual=sets as SetResult[];
 const uniform=actual.every(v=>v.loadKg===actual[0].loadKg);
 if(!uniform)return {kind:'review',title:'Charges différentes',detail:'Comparer manuellement les séries : la progression automatique suppose une charge identique.',previousSessionId:s.id};
 const min=Math.min(...actual.map(v=>v.reps));
 const rirOk=t.rir===undefined||actual.every(v=>v.rir!==null&&v.rir>=t.rir!);
 const target=Number(t.reps);
 const steps=REP_STEPS.filter(v=>v>=target);
 const next=steps.find(v=>v>target);
 const maxStep=15;
 const kg=actual[0].loadKg;
 if(min<target||!rirOk)return {kind:'repeat',title:'Consolider le palier',detail:`Reprendre ${target} répétitions à ${kg} kg nominaux sur ${count} séries, avec technique maîtrisée et RIR conforme.`,previousSessionId:s.id};
 if(target>=maxStep){
  const confirmations=matches.filter(x=>x.s.id!==s.id&&x.t.loadKg===kg&&x.t.sets===count).some(x=>{
   const r=x.s.exerciseResults?.find(v=>v.index===x.i);
   return Array.from({length:count},(_,n)=>n+1).every(n=>{const v=r?.sets.find(z=>z.set===n);return v&&valid(v)&&v.loadKg===kg&&v.reps>=maxStep&&(x.t.rir===undefined||(v.rir!==null&&v.rir>=x.t.rir));});
  });
  return confirmations?{kind:'increase-load',title:'Augmentation de charge envisageable',detail:`Palier ${count} × ${maxStep} confirmé à ${kg} kg nominaux. Augmenter manuellement la charge, puis revenir à ${count} × 8 (ou ${count} × 6 si le saut est important).`,previousSessionId:s.id}:{kind:'repeat',title:'Confirmer le palier maximal',detail:`${count} × ${maxStep} atteint à ${kg} kg nominaux. Confirmer lors d'une autre séance comparable avant d'augmenter la charge.`,previousSessionId:s.id};
 }
 return {kind:'increase-reps',title:'Palier suivant proposé',detail:`Passer de ${count} × ${target} à ${count} × ${next??maxStep} à ${kg} kg nominaux, sous réserve d'une technique maîtrisée.`,previousSessionId:s.id};
}

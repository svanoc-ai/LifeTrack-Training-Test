/** LifeTrack Training 2-E.3.1 — anatomical reference and immutable session snapshots.
 * The mapping describes tracking conventions, not measured muscle activation.
 * Legacy sessions without an identifiable variant are deliberately unclassified.
 */
export const MUSCLE_GROUPS = {
  pectoraux: ['pectoralis_clavicular','pectoralis_sternocostal'],
  dos: ['latissimus','rhomboids','trapezius','teres_major','spinal_erectors'],
  epaules: ['deltoid_anterior','deltoid_lateral','deltoid_posterior'],
  biceps: ['biceps_brachii','brachialis','brachioradialis'],
  triceps: ['triceps_long','triceps_lateral','triceps_medial'],
  abdominaux: ['rectus_abdominis','transversus','obliques','quadratus_lumborum'],
  fessiers: ['gluteus_maximus','gluteus_medius','gluteus_minimus'],
  quadriceps: ['rectus_femoris','vastus_medialis','vastus_lateralis','vastus_intermedius'],
  ischio_jambiers: ['biceps_femoris','semitendinosus','semimembranosus'],
  adducteurs: ['adductor_magnus','adductor_longus','adductor_brevis','gracilis'],
  abducteurs: ['tensor_fasciae_latae'],
  mollets: ['gastrocnemius','soleus'],
} as const;
export type MuscleGroup = keyof typeof MUSCLE_GROUPS;
export type MuscleId = (typeof MUSCLE_GROUPS)[MuscleGroup][number];
export type MuscleMapping = {primary:MuscleId[];secondary:MuscleId[]};
export type ExerciseVariant = {id:string;exerciseId:string;label:string;mapping:MuscleMapping};
const v=(exerciseId:string,slug:string,label:string,primary:MuscleId[],secondary:MuscleId[]=[]):ExerciseVariant=>({id:`variant:${exerciseId.slice(4)}:${slug}`,exerciseId,label,mapping:{primary,secondary}});
export const STANDARD_VARIANTS: readonly ExerciseVariant[] = [
 v('std:curl-biceps','standard','Curl biceps', ['biceps_brachii','brachialis'],['brachioradialis']),
 v('std:developpe-debout','militaire','Développé militaire',['deltoid_anterior','deltoid_lateral'],['triceps_long','trapezius']),
 v('std:developpe-debout','pectoral','Développé pectoral debout',['pectoralis_sternocostal'],['triceps_long','deltoid_anterior']),
 v('std:tirage-horizontal','serre','Tirage horizontal — prise serrée',['latissimus','rhomboids'],['biceps_brachii','deltoid_posterior']),
 v('std:tirage-horizontal','large','Tirage horizontal — prise large',['rhomboids','trapezius','deltoid_posterior'],['biceps_brachii']),
 v('std:rowing','serre','Rowing — coudes proches',['latissimus','rhomboids'],['biceps_brachii','deltoid_posterior']),
 v('std:rowing','large','Rowing — coudes écartés',['rhomboids','trapezius','deltoid_posterior'],['biceps_brachii']),
 v('std:pull-over','standard','Pull-over',['latissimus'],['pectoralis_sternocostal','teres_major']),
 v('std:elevations-laterales','standard','Élévations latérales',['deltoid_lateral'],['trapezius']),
 v('std:extensions-triceps','standard','Extensions triceps',['triceps_long','triceps_lateral','triceps_medial']),
 v('std:ecartes-pectoraux','standard','Écartés pectoraux',['pectoralis_sternocostal'],['deltoid_anterior']),
 v('std:souleve-de-terre','classique','Soulevé de terre classique',['gluteus_maximus','biceps_femoris','semitendinosus'],['rectus_femoris','spinal_erectors']),
 v('std:souleve-de-terre','roumain','Soulevé de terre roumain',['gluteus_maximus','biceps_femoris','semitendinosus'],['spinal_erectors']),
 v('std:hip-thrust','standard','Hip thrust',['gluteus_maximus'],['biceps_femoris']),
 v('std:abduction-hanche','standard','Abduction de hanche',['gluteus_medius','gluteus_minimus'],['tensor_fasciae_latae']),
 v('std:pont-fessier','standard','Pont fessier',['gluteus_maximus'],['biceps_femoris']),
 v('std:gainage','ventral','Gainage ventral',['rectus_abdominis','transversus','obliques'],['gluteus_maximus']),
 v('std:gainage','lateral','Gainage latéral',['obliques','quadratus_lumborum'],['gluteus_medius']),
 v('std:bird-dog','standard','Bird-dog',['transversus','spinal_erectors'],['gluteus_maximus','deltoid_posterior']),
];
const groupFor=new Map<MuscleId,MuscleGroup>();
for(const [group,muscles] of Object.entries(MUSCLE_GROUPS) as [MuscleGroup,readonly MuscleId[]][]) for(const muscle of muscles) groupFor.set(muscle,group);
export function validateMapping(mapping:MuscleMapping):MuscleMapping {
 if(!mapping||!Array.isArray(mapping.primary)||!Array.isArray(mapping.secondary))throw new Error('Classification invalide');
 const p=[...new Set(mapping.primary)],s=[...new Set(mapping.secondary)];
 if(p.length+s.length>40||p.length===0||[...p,...s].some(x=>!groupFor.has(x))||p.some(x=>s.includes(x)))throw new Error('Muscles inconnus ou classifications contradictoires');
 return {primary:p,secondary:s};
}
export function customizeVariant(variant:ExerciseVariant,mapping:MuscleMapping):ExerciseVariant {return {...variant,mapping:validateMapping(mapping)};}
export type MuscleSnapshot={variantId:string;exerciseId:string;mapping:MuscleMapping;capturedAt:string};
export function captureMapping(variant:ExerciseVariant,at:string):MuscleSnapshot {
 if(!Number.isFinite(Date.parse(at)))throw new Error('Date invalide');
 return {variantId:variant.id,exerciseId:variant.exerciseId,mapping:validateMapping(variant.mapping),capturedAt:at};
}
export function classifyLegacy(exerciseId:string,variantId?:string):MuscleSnapshot|null {
 if(!variantId)return null;
 const variant=STANDARD_VARIANTS.find(x=>x.exerciseId===exerciseId&&x.id===variantId);
 return variant?captureMapping(variant,'1970-01-01T00:00:00.000Z'):null;
}
export function latestVariant(exerciseId:string,history:readonly {exerciseId:string;variantId?:string;date:string}[]):ExerciseVariant|null {
 const available=STANDARD_VARIANTS.filter(x=>x.exerciseId===exerciseId);
 const last=[...history].filter(x=>x.exerciseId===exerciseId&&Number.isFinite(Date.parse(x.date))).sort((a,b)=>Date.parse(b.date)-Date.parse(a.date)).find(x=>available.some(v=>v.id===x.variantId));
 return available.find(x=>x.id===last?.variantId)??available[0]??null;
}
/** One validated bilateral-equivalent set contributes at most 1 per group.
 * Primary overrides secondary within the same group. Anatomy-level figures are not additive.
 */
export function setContributions(mapping:MuscleMapping):Record<MuscleGroup,number> {
 const valid=validateMapping(mapping);const out=Object.fromEntries(Object.keys(MUSCLE_GROUPS).map(g=>[g,0])) as Record<MuscleGroup,number>;
 for(const m of valid.secondary)out[groupFor.get(m)!]=Math.max(out[groupFor.get(m)!],0.25);
 for(const m of valid.primary)out[groupFor.get(m)!]=1;
 return out;
}
export function summarizeMuscleSets(rows:readonly {snapshot:MuscleSnapshot|null;validatedSets:number}[]):Record<MuscleGroup,number>{
 const total=Object.fromEntries(Object.keys(MUSCLE_GROUPS).map(g=>[g,0])) as Record<MuscleGroup,number>;
 for(const row of rows){if(!row.snapshot||!Number.isInteger(row.validatedSets)||row.validatedSets<0)continue;const c=setContributions(row.snapshot.mapping);for(const g of Object.keys(total) as MuscleGroup[])total[g]+=c[g]*row.validatedSets;}
 return total;
}

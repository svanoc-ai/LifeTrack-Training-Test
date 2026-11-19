/** 2-F.0 — Adaptateur de données pour une future visualisation anatomique 3D.
 * Ne charge aucun modèle externe et ne modifie pas les calculs validés de Stats.
 * Les valeurs représentent des séries pondérées, PAS une activation musculaire mesurée.
 */
import {MUSCLE_GROUPS,type MuscleGroup,type MuscleId} from './muscleRegistry';
import type {MuscleStats} from './muscleStats';

export type AnatomyDatum = {id:MuscleId;group:MuscleGroup;weightedSets:number;intensity:number;hasData:boolean};
export type AnatomyPayload = {muscles:AnatomyDatum[];maxWeightedSets:number;classifiedSets:number;unknownSets:number};
export type MeshBinding = {muscleId:MuscleId;meshNames:readonly string[]};

/** Produces deterministic, normalized display data without mutating the source. */
export function anatomyPayload(stats:MuscleStats):AnatomyPayload {
 const entries=Object.entries(MUSCLE_GROUPS) as [MuscleGroup,readonly MuscleId[]][];
 const maxWeightedSets=Math.max(0,...entries.flatMap(([,ids])=>ids.map(id=>Math.max(0,stats.anatomy[id]??0))));
 const muscles=entries.flatMap(([group,ids])=>ids.map(id=>{
  const raw=stats.anatomy[id]??0;
  const weightedSets=Number.isFinite(raw)?Math.max(0,raw):0;
  return {id,group,weightedSets,intensity:maxWeightedSets>0?weightedSets/maxWeightedSets:0,hasData:weightedSets>0};
 }));
 return {muscles,maxWeightedSets,classifiedSets:stats.classifiedSets,unknownSets:stats.unknownSets};
}

/** Audit the mesh naming supplied by a future licensed 3D model. */
export function auditMeshBindings(bindings:readonly MeshBinding[],availableMeshes:readonly string[]){
 const known=new Set(Object.values(MUSCLE_GROUPS).flat());
 const meshes=new Set(availableMeshes);
 const covered=new Set<MuscleId>();
 const unknownMuscles:string[]=[];
 const missingMeshes:string[]=[];
 const duplicates:string[]=[];
 const meshOwners=new Map<string,string>();
 for(const binding of bindings){
  if(!known.has(binding.muscleId)){unknownMuscles.push(binding.muscleId);continue;}
  if(!binding.meshNames.length)continue;
  for(const mesh of binding.meshNames){
   if(!meshes.has(mesh)){missingMeshes.push(mesh);continue;}
   const owner=meshOwners.get(mesh);
   if(owner&&owner!==binding.muscleId){duplicates.push(mesh);continue;}
   meshOwners.set(mesh,binding.muscleId);covered.add(binding.muscleId);
  }
 }
 return {coveredMuscles:covered.size,totalMuscles:known.size,unmappedMuscles:[...known].filter(id=>!covered.has(id)),unknownMuscles,missingMeshes,duplicates};
}

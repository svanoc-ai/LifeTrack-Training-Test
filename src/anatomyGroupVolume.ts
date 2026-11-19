import {MUSCLE_GROUPS,type MuscleGroup} from './muscleRegistry';
import type {MuscleStats} from './muscleStats';
export const VOLUME_PALETTE:readonly (readonly [number,number,number])[]=[[100,116,128],[89,156,205],[56,192,166],[239,183,85],[240,102,105]];
export const VOLUME_LABELS=['0','> 0 – 25 %','> 25 – 50 %','> 50 – 75 %','> 75 – 100 %'] as const;
export function volumeBand(value:number,max:number):number {
 if(!Number.isFinite(value)||!Number.isFinite(max)||value<=0||max<=0)return 0;
 return Math.min(4,Math.max(1,Math.ceil(4*value/max)));
}
export function groupVolume(stats:MuscleStats|null){
 const keys=Object.keys(MUSCLE_GROUPS) as MuscleGroup[];
 const max=Math.max(0,...keys.map(g=>stats?.groups[g]?.total??0));
 const groups=Object.fromEntries(keys.map(g=>{const row=stats?.groups[g];return [g,{total:row?.total??0,primary:row?.primary??0,secondary:row?.secondary??0,band:volumeBand(row?.total??0,max)}];})) as Record<MuscleGroup,{total:number;primary:number;secondary:number;band:number}>;
 return {max,groups,classifiedSets:stats?.classifiedSets??0,unknownSets:stats?.unknownSets??0,available:stats!==null};
}

import rules from './anatomyModelRules.json';
import type {MuscleGroup} from './muscleRegistry';
const patterns=rules.map(([group,pattern])=>[group as MuscleGroup,new RegExp(pattern,'i')] as const);
export function modelGroup(data:{kind?:unknown;label?:unknown}):MuscleGroup|null {
 if(data.kind!=='muscle'||typeof data.label!=='string')return null;
 const label=data.label.replace(/[_-]/g,' ').trim();
 const matches=patterns.filter(([,rx])=>rx.test(label));
 return matches.length===1?matches[0][0]:null;
}

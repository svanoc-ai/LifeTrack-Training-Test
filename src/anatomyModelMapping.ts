import rules from './anatomyModelRules.json';
import proxyRule from './anatomyProxyRule.json';
import type {MuscleGroup} from './muscleRegistry';
const patterns=rules.map(([group,pattern])=>[group as MuscleGroup,new RegExp(pattern,'i')] as const);
const proxyPattern=new RegExp(proxyRule.pattern,'i');
export function modelGroup(data:{kind?:unknown;label?:unknown},allowProxy=false):MuscleGroup|null {
 if(data.kind!=='muscle'||typeof data.label!=='string')return null;
 const label=data.label.replace(/[_-]/g,' ').trim();
 const matches=patterns.filter(([,rx])=>rx.test(label));
 if(matches.length===1)return matches[0][0];
 if(matches.length===0&&allowProxy&&proxyPattern.test(label))return proxyRule.group as MuscleGroup;
 return null;
}

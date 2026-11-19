import {useMemo,useState} from 'react';
import type {Execution} from './SessionExecution';
import type {StatsPeriod} from './statsEngine';
import {compareProgression,progressionRecords,suggestProgression,type ProgressionRecord} from './progressionAnalysis';

const num=(n:number|null,unit='')=>n===null?'—':`${new Intl.NumberFormat('fr-FR',{maximumFractionDigits:1}).format(n)}${unit}`;
const label=(s:string)=>new Date(s).toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'});
const names:Record<string,string>={'direct':'Comparable','qualified':'Avec réserve','separate':'Non directement comparable'};
const between=(d:string,p:StatsPeriod)=>{const day=d.slice(0,10);return day>=p.start&&day<=p.end;};
function graph(rows:ProgressionRecord[],metric:'load'|'reps'|'duration'){
 const get=(r:ProgressionRecord)=>metric==='load'?r.loadKg:metric==='reps'?r.minimumReps:r.minimumDurationSeconds;
 const data=rows.map((r,i)=>({r,i,value:get(r)})).filter((p):p is typeof p&{value:number}=>p.value!==null&&Number.isFinite(p.value));
 if(!data.length)return <p className="muted small">Aucune mesure disponible pour cet indicateur.</p>;
 const values=data.map(p=>p.value),lo=Math.min(...values),hi=Math.max(...values),span=Math.max(1,hi-lo),w=320,h=150;
 const x=(i:number)=>30+(rows.length===1?130:i*270/(rows.length-1));
 const y=(v:number)=>h-25-(v-lo)/span*105;
 return <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Évolution des performances" style={{width:'100%',maxHeight:230,overflow:'visible'}}><line x1="30" y1="125" x2="310" y2="125" stroke="#607787"/>{data.length>1&&<polyline points={data.map(p=>`${x(p.i)},${y(p.value)}`).join(' ')} fill="none" stroke="#36d7c6" strokeWidth="2.5"/>}{data.map(p=><g key={`${p.r.sessionId}-${p.r.index}`}><circle cx={x(p.i)} cy={y(p.value)} r="5" fill={p.r.status==='partial'?'#f3c477':'#36d7c6'}/><title>{`${label(p.r.date)} : ${p.value}`}</title></g>)}<text x="0" y="20" fontSize="10" fill="#b5c7d3">{num(hi)}</text><text x="0" y="128" fontSize="10" fill="#b5c7d3">{num(lo)}</text></svg>;
}
export default function StatsProgression({executions,period}:{executions:Execution[];period:StatsPeriod}){
 const all=useMemo(()=>progressionRecords(executions).filter(r=>between(r.date,period)),[executions,period]);
 const ids=useMemo(()=>[...new Set(all.map(r=>r.exerciseId))].sort((a,b)=>a.localeCompare(b,'fr')),[all]);
 const [exercise,setExercise]=useState('');const [metric,setMetric]=useState<'load'|'reps'|'duration'>('reps');
 const chosen=ids.includes(exercise)?exercise:ids[0];
 const rows=all.filter(r=>r.exerciseId===chosen);
 const last=rows.at(-1);const previous=rows.length>1?rows.at(-2):undefined;
 const comparison=last&&previous?compareProgression(previous,last):null;
 const recommendation=last?suggestProgression(last):null;
 return <div className="lt-stats-progression">
 <div className="panel"><h2>Progression des performances</h2><p className="muted small">Séries validées uniquement. Les résistances élastiques sont nominales et ne représentent pas une force mesurée.</p>
 {!ids.length?<p>Aucune performance de musculation enregistrée sur cette période.</p>:<><label className="field-label" htmlFor="lt-prog-exercise">Exercice</label><select className="profile-input" id="lt-prog-exercise" value={chosen} onChange={e=>setExercise(e.target.value)}>{ids.map(id=><option key={id} value={id}>{id.replace(/^std:/,'').replaceAll('-',' ')}</option>)}</select><label className="field-label" htmlFor="lt-prog-metric">Indicateur</label><select className="profile-input" id="lt-prog-metric" value={metric} onChange={e=>setMetric(e.target.value as typeof metric)}><option value="reps">Répétitions minimales</option><option value="load">Résistance nominale (kg)</option><option value="duration">Maintien minimal (secondes)</option></select>{graph(rows,metric)}</>}
 </div>
 {last&&<div className="panel"><h2>Dernière performance</h2><div className="lt-stats-facts"><div>Date <strong>{label(last.date)}</strong></div><div>Séries validées <strong>{last.validatedSets} / {last.plannedSets}</strong></div><div>Résistance nominale <strong>{num(last.loadKg,' kg')}</strong></div><div>Répétitions minimales <strong>{num(last.minimumReps)}</strong></div><div>Maintien minimal <strong>{num(last.minimumDurationSeconds,' s')}</strong></div><div>RIR minimal <strong>{num(last.rirMinimum)}</strong></div><div>Qualité <strong>{last.quality??'Non renseignée'}</strong></div><div>Statut <strong>{last.status==='partial'?'Partielle':'Terminée'}</strong></div></div>{comparison?<p className="muted small">Comparabilité avec la précédente : <strong>{names[comparison.reliability]}</strong>{comparison.reasons.length?` — ${comparison.reasons.join(' ; ')}`:''}</p>:<p className="muted small">Aucune séance précédente sur la période.</p>}</div>}
 {recommendation&&<div className="panel"><h2>Suggestion de progression</h2><p>{recommendation.message}</p><p className="muted small">Suggestion informative uniquement : aucun changement automatique des objectifs ou des charges. Validation manuelle nécessaire.</p></div>}
 {!!rows.length&&<div className="panel"><h2>Historique détaillé</h2><div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',fontSize:'.85rem',textAlign:'left'}}><thead><tr><th>Date</th><th>Variante</th><th>Séries</th><th>Kg nom.</th><th>Rép. min.</th><th>RIR</th><th>Comparabilité</th></tr></thead><tbody>{[...rows].reverse().map((r,i)=>{const earlier=rows[rows.length-2-i];const c=earlier?compareProgression(earlier,r):null;return <tr key={`${r.sessionId}-${r.index}`} style={{borderTop:'1px solid #375063'}}><td>{label(r.date)}{r.status==='partial'?' · Partielle':''}</td><td>{r.variantId??'Inconnue'}</td><td>{r.validatedSets}/{r.plannedSets}</td><td>{num(r.loadKg)}</td><td>{num(r.minimumReps)}</td><td>{num(r.rirMinimum)}</td><td title={c?.reasons.join('; ')}>{c?names[c.reliability]:'—'}</td></tr>;})}</tbody></table></div></div>}
 </div>;
}

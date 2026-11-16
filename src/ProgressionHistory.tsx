import {useMemo,useState} from 'react';
import type {Execution} from './SessionExecution';
import {groupPoints,progressionPoints} from './progression';
import type {Grouping,ProgressionPoint} from './progression';
const MODE_KEY='lifetrack-progression-mode-v1';
type Mode='charge'|'reps';
const dateLabel=(date:string)=>new Intl.DateTimeFormat('fr-FR',{day:'numeric',month:'short',year:'numeric'}).format(new Date(date));
export default function ProgressionHistory({history,exerciseId,onOpenSession}:{history:Execution[];exerciseId:string;onOpenSession:(id:string)=>void}){
 const [mode,setMode]=useState<Mode>(()=>{try{return localStorage.getItem(MODE_KEY)==='reps'?'reps':'charge'}catch{return 'charge'}});
 const [months,setMonths]=useState(3);
 const [override,setOverride]=useState<Grouping|null>(null);
 const [selected,setSelected]=useState<string|null>(null);
 const raw=useMemo(()=>progressionPoints(history,exerciseId),[history,exerciseId]);
 const start=new Date();start.setMonth(start.getMonth()-months);
 const filtered=raw.filter(p=>new Date(p.date)>=start);
 const grouping:Grouping=override||(months<=1?'session':months<=6?'week':'month');
 const points=groupPoints(filtered,grouping);
 const chosen=points.find(p=>p.sessionId===selected)||points.at(-1);
 const values=points.map(p=>mode==='charge'?p.loadKg:p.minReps);
 const valid=values.filter((v):v is number=>v!==null&&Number.isFinite(v));
 const low=valid.length?Math.min(...valid):0,high=valid.length?Math.max(...valid):1;
 const min=low===high?Math.max(0,low-1):Math.max(0,low-(high-low)*.12);
 const max=low===high?high+1:high+(high-low)*.12;
 const plot=(p:ProgressionPoint,i:number)=>{const v=mode==='charge'?p.loadKg:p.minReps;return {x:points.length<2?50:8+84*i/(points.length-1),y:v===null?50:88-(v-min)/(max-min)*76,v};};
 const switchMode=(next:Mode)=>{setMode(next);try{localStorage.setItem(MODE_KEY,next)}catch{}};
 return <div className="lt-progress-panel"><h4>Progression de l'exercice</h4><div className="lt-progress-controls"><label>Indicateur<select value={mode} onChange={e=>switchMode(e.target.value as Mode)}><option value="charge">Charge nominale (kg)</option><option value="reps">Répétitions minimales</option></select></label><label>Période<select value={months} onChange={e=>{setMonths(Number(e.target.value));setOverride(null);setSelected(null)}}><option value={1}>1 mois</option><option value={3}>3 mois</option><option value={6}>6 mois</option><option value={12}>12 mois</option><option value={24}>24 mois</option></select></label><label>Regroupement<select value={grouping} onChange={e=>{setOverride(e.target.value as Grouping);setSelected(null)}}><option value="session">Par séance</option><option value="week">Par semaine</option><option value="month">Par mois</option></select></label></div>
 {points.length===0?<p className="muted small">Aucune série originale validée sur cette période.</p>:<><svg className="lt-progress-chart" viewBox="0 0 340 150" role="img" aria-label={`Progression ${mode==='charge'?'de la charge nominale':'des répétitions minimales'}`}><line x1="26" y1="132" x2="325" y2="132" stroke="#375063"/>{[0,1,2,3,4].map(i=><g key={i}><line x1="26" y1={12+i*30} x2="325" y2={12+i*30} stroke="#375063" opacity=".35"/><text x="2" y={16+i*30} fontSize="9" fill="#A7BCCB">{(max-(max-min)*i/4).toFixed(0)}</text></g>)}{points.length>1&&points.slice(1).map((p,i)=>{const prev=points[i];const a=plot(prev,i),b=plot(p,i+1);return a.v!==null&&b.v!==null?<line key={p.sessionId} x1={26+a.x*2.9} y1={a.y*1.3} x2={26+b.x*2.9} y2={b.y*1.3} stroke="#36D7C6" strokeWidth="2"/>:null})}{points.map((p,i)=>{const q=plot(p,i),x=26+q.x*2.9,y=q.y*1.3;return <g key={p.sessionId}><circle cx={x} cy={y} r={selected===p.sessionId?8:6} fill={p.complete?(p.success?'#36D7C6':'#F3C477'):'#0B1420'} stroke={p.pending?'#65A8FF':p.confirmed?'#36D7C6':p.complete?'#36D7C6':'#A7BCCB'} strokeWidth={p.pending||p.confirmed?3:1.5}/><title>{`${dateLabel(p.date)} : ${q.v??'non renseigné'}`}</title></g>})}</svg><div className="lt-progress-navigation"><button type="button" disabled={!chosen||points.indexOf(chosen)===0} onClick={()=>setSelected(points[Math.max(0,points.indexOf(chosen)-1)].sessionId)}>← Précédent</button><span>{chosen?dateLabel(chosen.date):''}</span><button type="button" disabled={!chosen||points.indexOf(chosen)===points.length-1} onClick={()=>setSelected(points[Math.min(points.length-1,points.indexOf(chosen)+1)].sessionId)}>Suivant →</button></div>{chosen&&<p className="muted small">{mode==='charge'?`${chosen.loadKg??'—'} kg nominaux`:`${chosen.minReps??'—'} répétitions minimales`} · {chosen.complete?(chosen.success?'Objectif atteint':'Objectif non atteint'):'Séries incomplètes'}{chosen.pending?' · Palier en attente':''}{chosen.confirmed?' · Palier confirmé':''} <button type="button" className="lt-progress-open" onClick={()=>onOpenSession(chosen.sessionId)}>Voir la séance</button></p>}{points.length===1&&<p className="muted small">Une seule séance représentative sur la période.</p>}</>}
 <p className="muted small">Seules les séries originales validées contribuent aux résultats. Regroupement : dernière séance complète, jamais la moyenne.</p></div>;
}

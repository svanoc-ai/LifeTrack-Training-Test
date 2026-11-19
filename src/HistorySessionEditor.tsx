import {useEffect,useState} from 'react';
import type {Execution,SetResult} from './SessionExecution';

type Props={session:Execution;exerciseNames:Record<string,string>;mode:'edit'|'delete';onSave:(session:Execution)=>Promise<void>;onDelete:(id:string)=>Promise<void>;onClose:()=>void};
const numeric=(value:string,max:number)=>Math.max(0,Math.min(max,Number(value)||0));
export default function HistorySessionEditor({session,exerciseNames,mode,onSave,onDelete,onClose}:Props){
 const [draft,setDraft]=useState<Execution>(()=>structuredClone(session));
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 useEffect(()=>{setDraft(structuredClone(session));setError('')},[session.id]);
 const changeSet=(index:number,setNumber:number,field:keyof SetResult,value:number|boolean|null)=>{
  setDraft(prev=>({...prev,exerciseResults:(prev.exerciseResults||[]).map(r=>r.index!==index?r:{...r,sets:r.sets.map(s=>s.set!==setNumber?s:{...s,[field]:value})})}));
 };
 const save=async()=>{setBusy(true);setError('');try{await onSave({...draft,updatedAt:new Date().toISOString()});onClose()}catch(e){setError(String(e))}finally{setBusy(false)}};
 const remove=async()=>{setBusy(true);setError('');try{await onDelete(session.id);onClose()}catch(e){setError(String(e))}finally{setBusy(false)}};
 const sessionDate=new Date(session.endedAt||session.updatedAt||session.startedAt);
 const dateLabel=Number.isNaN(sessionDate.getTime())?'Date inconnue':new Intl.DateTimeFormat('fr-FR',{dateStyle:'full'}).format(sessionDate);
 if(mode==='delete')return <div className="lt-history-editor lt-history-delete" role="region" aria-label="Confirmer la suppression de la séance">
  <h3>Supprimer cette séance ?</h3>
  <p><strong>{session.name?.trim()||'Séance d’entraînement'}</strong></p>
  <p className="muted">{dateLabel}</p>
  <p role="alert">Cette suppression est irréversible et retire cette séance des statistiques et des recommandations.</p>
  {error&&<p role="alert">{error}</p>}
  <div className="lt-history-editor-actions"><button type="button" className="lt-delete-confirm" disabled={busy} onClick={()=>void remove()}>{busy?'Suppression…':'Confirmer définitivement la suppression'}</button><button type="button" className="secondary-button" disabled={busy} onClick={onClose}>Conserver la séance</button></div>
 </div>;
 return <div className="lt-history-editor" role="region" aria-label="Modifier la séance enregistrée">
  <h3>Modifier la séance</h3><p className="muted small">Les corrections remplacent les valeurs enregistrées. Les objectifs de la séance type restent inchangés.</p>
  <label className="field-label">Commentaire<textarea className="profile-input" value={draft.comment||''} onChange={e=>setDraft(v=>({...v,comment:e.target.value}))}/></label>
  <div className="lt-history-editor-grid"><label>Forme après séance (1–10)<input className="profile-input" type="number" min="1" max="10" value={draft.formAfter??''} onChange={e=>setDraft(v=>({...v,formAfter:Math.max(1,numeric(e.target.value,10))}))}/></label><label>Difficulté (1–10)<input className="profile-input" type="number" min="1" max="10" value={draft.difficulty??''} onChange={e=>setDraft(v=>({...v,difficulty:Math.max(1,numeric(e.target.value,10))}))}/></label></div>
  {draft.exerciseResults?.map(r=><div key={r.index} className="lt-history-editor-exercise"><strong>{r.index+1}. {exerciseNames[draft.targets[r.index]?.exerciseId]||draft.targets[r.index]?.exerciseId||'Exercice inconnu'}</strong>{r.sets.map(s=><div key={s.set} className="lt-history-editor-set"><strong>Série {s.set}</strong><label>Rép.<input className="profile-input" type="number" min="0" max="999" value={s.reps} onChange={e=>changeSet(r.index,s.set,'reps',numeric(e.target.value,999))}/></label><label>Charge (kg)<input className="profile-input" type="number" min="0" max="2000" step="0.5" value={s.loadKg} onChange={e=>changeSet(r.index,s.set,'loadKg',numeric(e.target.value,2000))}/></label><label>RIR<select className="profile-input" value={s.rir===null?'':s.rir} onChange={e=>changeSet(r.index,s.set,'rir',e.target.value===''?null:Number(e.target.value))}><option value="">—</option>{[0,1,2,3,4,5,6].map(n=><option key={n} value={n}>{n===6?'5+':n}</option>)}</select></label><label className="lt-history-editor-check"><input type="checkbox" checked={s.validated!==false} onChange={e=>changeSet(r.index,s.set,'validated',e.target.checked)}/> Validée</label></div>)}</div>)}
  {error&&<p role="alert">{error}</p>}
  <div className="lt-history-editor-actions"><button className="primary-button" disabled={busy} onClick={()=>void save()}>Enregistrer les corrections</button><button className="secondary-button" disabled={busy} onClick={onClose}>Annuler</button></div>
 </div>
}

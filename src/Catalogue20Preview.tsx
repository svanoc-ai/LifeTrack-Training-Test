import React, {useMemo, useState} from 'react';
import proposals from './catalogue20-propositions.json';

type Proposal = {candidateId:string;name:string;equipment:string;movementFamily:string;primaryGroups:string;secondaryGroups:string;precaution:string;integrationDecision:string;biomechanicalStatus:string;catalogStatus:string;proposedExerciseId:string};
const items = proposals as Proposal[];
const splitGroups = (value:string) => value.split(',').map(v=>v.trim()).filter(Boolean);
export default function Catalogue20Preview() {
  const [open,setOpen] = useState(false);
  const [search,setSearch] = useState('');
  const [group,setGroup] = useState('');
  const [decision,setDecision] = useState('');
  const groups = useMemo(()=>Array.from(new Set(items.flatMap(p=>[...splitGroups(p.primaryGroups),...splitGroups(p.secondaryGroups)]))).sort((a,b)=>a.localeCompare(b,'fr')),[]);
  const results = useMemo(()=>items.filter(p=>{
    const term = search.trim().toLocaleLowerCase('fr');
    return (!term || [p.name,p.equipment,p.movementFamily,p.primaryGroups,p.secondaryGroups].some(v=>v.toLocaleLowerCase('fr').includes(term)))
      && (!group || [...splitGroups(p.primaryGroups),...splitGroups(p.secondaryGroups)].includes(group))
      && (!decision || p.integrationDecision===decision);
  }),[search,group,decision]);
  return <div className="panel lt20-preview" aria-label="Catalogue 20 groupes en préparation">
    <div className="lt20-preview-heading"><div><p className="kicker">LOT 12 · APERÇU SANS IMPORT</p><h2>Catalogue 20 groupes — propositions</h2><p className="muted small">{items.length} fiches en revue · Aucun exercice ajouté à ta bibliothèque · Aucun historique modifié</p></div><button type="button" className="secondary-button" onClick={()=>setOpen(v=>!v)} aria-expanded={open}>{open?'Masquer':'Consulter'}</button></div>
    {open&&<><p className="muted small">Fiches non validées biomécaniquement. Cette consultation ne permet ni l'ajout, ni la modification, ni la suppression d'exercices.</p>
      <div className="lt20-filters"><label>Recherche<input className="profile-input" type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Nom, matériel, muscle…"/></label><label>Groupe musculaire<select className="profile-input" value={group} onChange={e=>setGroup(e.target.value)}><option value="">Tous les groupes</option>{groups.map(g=><option key={g} value={g}>{g}</option>)}</select></label><label>Décision proposée<select className="profile-input" value={decision} onChange={e=>setDecision(e.target.value)}><option value="">Toutes</option>{Array.from(new Set(items.map(p=>p.integrationDecision))).sort().map(d=><option key={d} value={d}>{d==='NEW_EXERCISE_CANDIDATE'?'Nouvel exercice candidat':d==='MATCH_EXISTING_VARIANT'?'Correspondance existante':d==='REVIEW_VARIANT'?'Variante à examiner':d}</option>)}</select></label></div>
      <p className="muted small" role="status">{results.length} proposition(s) affichée(s)</p>
      <div className="lt20-results">{results.map(p=><article className="lt20-result" key={p.candidateId}><strong>{p.name}</strong><p className="muted small">Principal : {p.primaryGroups||'À déterminer'} · Secondaire : {p.secondaryGroups||'Non renseigné'}</p><p className="muted small">Matériel : {p.equipment||'À déterminer'} · {p.movementFamily||'Famille non renseignée'}</p>{p.precaution&&<p className="muted small">Précaution : {p.precaution}</p>}<small>Proposition non validée · {p.integrationDecision}</small></article>)}{results.length===0&&<p className="muted">Aucune proposition ne correspond aux filtres.</p>}</div>
    </>}
  </div>;
}

import StatsDashboard from './StatsDashboard';
import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './style.css';
import WorkoutEditor from './WorkoutEditor';
import ProgramEditor from './ProgramEditor';
import ProgramWizard from './ProgramWizard';
import PlanningCalendar from './PlanningCalendar';
import SessionExecution, {type Execution} from './SessionExecution';

type Tab = 'Accueil' | 'Séance' | 'Historique' | 'Programmes' | 'Stats' | 'Plus';
const tabs: { label: Tab; shortLabel: string; icon: string }[] = [
  { label: 'Accueil', shortLabel: 'Accueil', icon: 'home' },
  { label: 'Séance', shortLabel: 'Séance', icon: 'dumbbell' },
  { label: 'Programmes', shortLabel: 'Prog', icon: 'calendar' },
  { label: 'Historique', shortLabel: 'Historique', icon: 'history' },
  { label: 'Stats', shortLabel: 'Stats', icon: 'chart' },
  { label: 'Plus', shortLabel: 'Plus', icon: 'menu' },
];
function NavIcon({name}: {name:string}) {
  const common = {fill:'none',stroke:'currentColor',strokeWidth:2.2,strokeLinecap:'round' as const,strokeLinejoin:'round' as const};
  const shapes: Record<string,React.ReactNode> = {
    home:<><path d="M3 10.5 12 3l9 7.5V21h-7v-7h-4v7H3z"/></>,
    dumbbell:<><rect x="3" y="7" width="3" height="10" rx="1"/><rect x="18" y="7" width="3" height="10" rx="1"/><path d="M6 12h12"/><path d="M9 6v12M15 6v12"/></>,
    calendar:<><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/><circle cx="8" cy="14" r=".7" fill="currentColor" stroke="none"/><circle cx="12" cy="14" r=".7" fill="currentColor" stroke="none"/><circle cx="16" cy="14" r=".7" fill="currentColor" stroke="none"/><circle cx="8" cy="18" r=".7" fill="currentColor" stroke="none"/><circle cx="12" cy="18" r=".7" fill="currentColor" stroke="none"/></>,
    history:<><path d="M3 11a9 9 0 1 1 2.2 6"/><path d="M3 4v7h7"/><path d="M12 7v5l4 2"/></>,
    chart:<><rect x="3" y="14" width="4" height="7" rx="1"/><rect x="10" y="4" width="4" height="17" rx="1"/><rect x="17" y="9" width="4" height="12" rx="1"/></>,
    menu:<><path d="M4 6h16M4 12h16M4 18h16"/></>
  };
  return <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true" {...common}>{shapes[name]}</svg>;
}

// Lot 2-A.2 — Référentiel standard immuable ; personnalisations futures en IndexedDB.
type ExerciseKind = 'musculation' | 'cardio';
type Exercise = { id: string; name: string; kind: ExerciseKind; muscles: string[]; equipment: string[]; measurement: 'series-repetitions' | 'duree-distance'; origin: 'standard' | 'custom'; archived: boolean; };
const STANDARD_EXERCISES: Exercise[] = [
  ['curl-biceps','Curl biceps','musculation',['Biceps'],['SmartWorkout']],
  ['developpe-debout','Développé debout','musculation',['Pectoraux','Triceps','Épaules'],['SmartPress']],
  ['tirage-horizontal','Tirage horizontal','musculation',['Dos','Biceps'],['SmartPress']],
  ['rowing','Rowing','musculation',['Dos','Biceps'],['SmartWorkout']],
  ['pull-over','Pull-over','musculation',['Dos','Pectoraux'],['SmartWorkout']],
  ['elevations-laterales','Élévations latérales','musculation',['Épaules'],['SmartWorkout']],
  ['extensions-triceps','Extensions triceps','musculation',['Triceps'],['SmartWorkout']],
  ['ecartes-pectoraux','Écartés pectoraux','musculation',['Pectoraux'],['SmartWorkout']],
  ['souleve-de-terre','Soulevé de terre','musculation',['Dos','Ischio-jambiers','Fessiers'],['SmartWorkout']],
  ['hip-thrust','Hip thrust','musculation',['Fessiers'],['Bandes élastiques']],
  ['abduction-hanche','Abduction de hanche','musculation',['Fessiers'],['Bandes élastiques']],
  ['pont-fessier','Pont fessier','musculation',['Fessiers'],['Poids du corps']],
  ['gainage','Gainage','musculation',['Abdominaux'],['Poids du corps']],
  ['bird-dog','Bird-dog','musculation',['Abdominaux','Dos'],['Poids du corps']],
  ['marche-tapis','Marche sur tapis','cardio',['Cardio'],['Tapis Sole F63']],
  ['course-tapis','Course sur tapis','cardio',['Cardio'],['Tapis Sole F63']],
  ['velo-appartement','Vélo d’appartement','cardio',['Cardio'],['Vélo Merach S36L']],
  ['marche-exterieure','Marche extérieure','cardio',['Cardio'],['Sans matériel']],
  ['randonnee','Randonnée','cardio',['Cardio'],['Sans matériel']],
  ['course-exterieure','Course extérieure','cardio',['Cardio'],['Sans matériel']],
].map(([id,name,kind,muscles,equipment]) => ({ id: 'std:'+id, name: name as string, kind: kind as ExerciseKind, muscles: muscles as string[], equipment: equipment as string[], measurement: kind === 'cardio' ? 'duree-distance' : 'series-repetitions', origin: 'standard', archived: false }));
function readCustomExercises(db: IDBDatabase): Promise<Exercise[]> {
  return new Promise((resolve,reject) => {
    try { const tx=db.transaction('customExercises','readonly'); let result: Exercise[]=[];
      tx.objectStore('customExercises').getAll().onsuccess=e=>{result=(e.target as IDBRequest<Exercise[]>).result;};
      tx.oncomplete=()=>resolve(result); tx.onerror=()=>reject(tx.error || new Error('Lecture exercices impossible.'));
      tx.onabort=()=>reject(tx.error || new Error('Lecture exercices interrompue.'));
    } catch(e){reject(e);}
  });
}
function persistExercise(db: IDBDatabase, exercise: Exercise): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction('customExercises', 'readwrite');
      tx.objectStore('customExercises').put(exercise);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error || new Error('Enregistrement de l’exercice impossible.'));
      tx.onabort = () => reject(tx.error || new Error('Enregistrement interrompu.'));
    } catch (error) { reject(error); }
  });
}
function validExercise(x: unknown): x is Exercise {
  if(!x || typeof x!=='object' || Array.isArray(x)) return false;
  const e=x as Partial<Exercise>;
  return typeof e.id==='string' && e.id.startsWith('custom:') && e.id.length<=128 &&
    typeof e.name==='string' && !!e.name.trim() && e.name.length<=100 &&
    (e.kind==='musculation'||e.kind==='cardio') && e.origin==='custom' && typeof e.archived==='boolean' &&
    (e.measurement === (e.kind === 'cardio' ? 'duree-distance' : 'series-repetitions')) &&
    Array.isArray(e.muscles) && e.muscles.length<=20 && e.muscles.every(v=>typeof v==='string'&&v.length<=60) &&
    Array.isArray(e.equipment) && e.equipment.length<=20 && e.equipment.every(v=>typeof v==='string'&&v.length<=60);
}

// Lot 2-B.2 — Modèles séparés des séances, programmes et affectations datées.
// Les objectifs sont des prescriptions, jamais des performances réalisées.
type WorkoutTarget = {
  executionMode?:'repetitions'|'maintien'|'effort-chronometre';
  exerciseId: string; order: number; sets?: number; reps?: number;
  loadKg?: number; restSeconds?: number; rir?: number;
  durationSeconds?: number; durationMinutes?: number; distanceKm?: number; supersetId?: string; blockRestBetweenExercisesSeconds?:number;blockRestBetweenRoundsSeconds?:number;
};
type WorkoutTemplate = {
  id: string; name: string; description: string; targets: WorkoutTarget[];
  archived: boolean; createdAt: string; updatedAt: string;
};
type TrainingProgram = {
  id: string; name: string; description: string; templateIds: string[];
  archived: boolean; createdAt: string; updatedAt: string;
};
type PlannedWorkout = {
  id: string; date: string; templateId: string; programId: string | null;
  status: 'planned' | 'cancelled' | 'completed' | 'partial' | 'abandoned'; createdAt: string; updatedAt: string;
};
const MAX_PLANNING_RECORDS = 1000;
function validIsoDate(v: unknown): v is string {
  return typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) &&
    !Number.isNaN(Date.parse(v)) && new Date(v + 'T12:00:00Z').toISOString().slice(0,10) === v;
}
function validTarget(x: unknown): x is WorkoutTarget {
  if (!x || typeof x !== 'object' || Array.isArray(x)) return false;
  const t = x as WorkoutTarget;
  const numberField = (v: unknown, max: number) => v === undefined || (typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= max);
  return (t.executionMode===undefined||['repetitions','maintien','effort-chronometre'].includes(t.executionMode)) && typeof t.exerciseId === 'string' && t.exerciseId.length > 0 && t.exerciseId.length <= 128 &&
    Number.isInteger(t.order) && t.order >= 0 && t.order <= 200 &&
    numberField(t.sets, 100) && numberField(t.reps, 1000) && numberField(t.loadKg, 10000) &&
    numberField(t.restSeconds, 3600) && numberField(t.rir, 20) &&
    (t.durationSeconds===undefined||(Number.isInteger(t.durationSeconds)&&t.durationSeconds>=1&&t.durationSeconds<=3600&&Number.isInteger(t.sets)&&t.sets!>=1&&t.sets!<=30)) && numberField(t.durationMinutes, 1440) && numberField(t.distanceKm, 1000) &&
    (t.supersetId === undefined || (typeof t.supersetId === 'string' && t.supersetId.length <= 128)) && numberField(t.blockRestBetweenExercisesSeconds,3600) && numberField(t.blockRestBetweenRoundsSeconds,3600);
}
function validTemplate(x: unknown): x is WorkoutTemplate {
  if (!x || typeof x !== 'object' || Array.isArray(x)) return false;
  const t = x as WorkoutTemplate;
  return typeof t.id === 'string' && t.id.length > 0 && t.id.length <= 128 &&
    typeof t.name === 'string' && !!t.name.trim() && t.name.length <= 100 &&
    typeof t.description === 'string' && t.description.length <= 1000 &&
    typeof t.archived === 'boolean' && validDate(t.createdAt) && validDate(t.updatedAt) &&
    Array.isArray(t.targets) && t.targets.length <= 200 && t.targets.every(validTarget);
}
function validProgram(x: unknown): x is TrainingProgram {
  if (!x || typeof x !== 'object' || Array.isArray(x)) return false;
  const p = x as TrainingProgram;
  return typeof p.id === 'string' && p.id.length > 0 && p.id.length <= 128 &&
    typeof p.name === 'string' && !!p.name.trim() && p.name.length <= 100 &&
    typeof p.description === 'string' && p.description.length <= 1000 &&
    typeof p.archived === 'boolean' && validDate(p.createdAt) && validDate(p.updatedAt) &&
    Array.isArray(p.templateIds) && p.templateIds.length <= 200 &&
    p.templateIds.every(id => typeof id === 'string' && id.length > 0 && id.length <= 128);
}
function validPlanned(x: unknown): x is PlannedWorkout {
  if (!x || typeof x !== 'object' || Array.isArray(x)) return false;
  const p = x as PlannedWorkout;
  return typeof p.id === 'string' && p.id.length > 0 && p.id.length <= 128 &&
    validIsoDate(p.date) && typeof p.templateId === 'string' && !!p.templateId && p.templateId.length <= 128 &&
    (p.programId === null || (typeof p.programId === 'string' && p.programId.length > 0 && p.programId.length <= 128)) &&
    (['planned','cancelled','completed','partial','abandoned'].includes(p.status)) && validDate(p.createdAt) && validDate(p.updatedAt);
}
function validPlanning(templates: unknown, programs: unknown, planned: unknown): boolean {
  if (!Array.isArray(templates) || !Array.isArray(programs) || !Array.isArray(planned) ||
    templates.length > MAX_PLANNING_RECORDS || programs.length > MAX_PLANNING_RECORDS || planned.length > MAX_PLANNING_RECORDS ||
    !templates.every(validTemplate) || !programs.every(validProgram) || !planned.every(validPlanned)) return false;
  const unique = (items: {id:string}[]) => new Set(items.map(x=>x.id)).size === items.length;
  if (!unique(templates) || !unique(programs) || !unique(planned)) return false;
  const tids = new Set(templates.map(x=>x.id));
  const pids = new Set(programs.map(x=>x.id));
  return programs.every(x=>x.templateIds.every((id:string)=>tids.has(id))) &&
    planned.every(x=>tids.has(x.templateId) && (x.programId === null || pids.has(x.programId)));
}
function readAll<T>(db: IDBDatabase, storeName: string): Promise<T[]> {
  return new Promise((resolve,reject)=>{
    try { const tx=db.transaction(storeName,'readonly'); let items:T[]=[];
      tx.objectStore(storeName).getAll().onsuccess=e=>{items=(e.target as IDBRequest<T[]>).result;};
      tx.oncomplete=()=>resolve(items);
      tx.onerror=()=>reject(tx.error || new Error('Lecture du planning impossible.'));
      tx.onabort=()=>reject(tx.error || new Error('Lecture du planning interrompue.'));
    } catch(e) { reject(e); }
  });
}
async function readPlanning(db: IDBDatabase) {
  const [templates, programs, planned] = await Promise.all([
    readAll<WorkoutTemplate>(db,'workoutTemplates'),
    readAll<TrainingProgram>(db,'trainingPrograms'),
    readAll<PlannedWorkout>(db,'plannedWorkouts'),
  ]);
  if (!validPlanning(templates,programs,planned)) throw new Error('Données de planification incohérentes.');
  return {templates,programs,planned};
}

// Lot 1-C : profil unique actif, stockage local IndexedDB versionné.
// Le profil est créé uniquement si la base ne contient encore aucun profil.
type Theme = 'dark' | 'light' | 'system';
type LocalProfile = { id: string; name: string; createdAt: string; updatedAt: string };
type LocalSettings = { id: string; profileId: string; theme: Theme; updatedAt: string };
const DB_NAME = 'lifetrack-training';
const DB_VERSION = 5;
const DATA_SCHEMA_VERSION = 4; // Format logique des données, indépendant de la version IndexedDB.
type SchemaMetadata = { id: 'schema'; version: number; updatedAt: string };
const SETTINGS_KEY = 'preferences';
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) { reject(new Error('IndexedDB indisponible sur ce navigateur.')); return; }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('profiles')) db.createObjectStore('profiles', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('settings')) db.createObjectStore('settings', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('customExercises')) db.createObjectStore('customExercises', { keyPath: 'id' });
      for (const store of ['workoutTemplates','trainingPrograms','plannedWorkouts','executions']) {
        if (!db.objectStoreNames.contains(store)) db.createObjectStore(store, { keyPath: 'id' });
      }
      // Migration additive : aucun effacement des profils ni des préférences existants.
      const meta = db.objectStoreNames.contains('metadata')
        ? request.transaction!.objectStore('metadata')
        : db.createObjectStore('metadata', { keyPath: 'id' });
      meta.put({ id: 'schema', version: DATA_SCHEMA_VERSION, updatedAt: new Date().toISOString() } satisfies SchemaMetadata);
    };
    request.onsuccess = () => {
      const db = request.result;
      db.onversionchange = () => {
        db.close();
        window.dispatchEvent(new Event('lifetrack-database-versionchange'));
      };
      resolve(db);
    };
    request.onerror = () => reject(request.error || new Error('Ouverture de la base impossible.'));
    request.onblocked = () => reject(new Error('Base bloquée par un autre onglet. Ferme les autres onglets puis réessaie.'));
  });
}
function readRecord<T>(db: IDBDatabase, storeName: string, key: string): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    let value: T | undefined;
    let tx: IDBTransaction;
    try {
      tx = db.transaction(storeName, 'readonly');
      const request = tx.objectStore(storeName).get(key);
      request.onsuccess = () => { value = request.result as T | undefined; };
      tx.oncomplete = () => resolve(value);
      tx.onerror = () => reject(tx.error || new Error('Lecture locale impossible.'));
      tx.onabort = () => reject(tx.error || new Error('Lecture interrompue.'));
    } catch (error) { reject(error); }
  });
}
function readProfiles(db: IDBDatabase): Promise<LocalProfile[]> {
  return new Promise((resolve, reject) => {
    let profiles: LocalProfile[] = [];
    try {
      const tx = db.transaction('profiles', 'readonly');
      const request = tx.objectStore('profiles').getAll();
      request.onsuccess = () => { profiles = request.result as LocalProfile[]; };
      tx.oncomplete = () => resolve(profiles);
      tx.onerror = () => reject(tx.error || new Error('Lecture du profil impossible.'));
      tx.onabort = () => reject(tx.error || new Error('Lecture interrompue.'));
    } catch (error) { reject(error); }
  });
}
function writeRecord(db: IDBDatabase, storeName: string, record: LocalProfile | LocalSettings): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).put(record);
    tx.oncomplete = () => resolve(); // Seul le commit de transaction confirme la sauvegarde.
    tx.onerror = () => reject(tx.error || new Error('Écriture impossible.'));
    tx.onabort = () => reject(tx.error || new Error('Écriture annulée.'));
  });
}
function makeId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}
async function loadLocalData(): Promise<{ db: IDBDatabase; profile: LocalProfile; settings: LocalSettings }> {
  const db = await openDatabase();
  try {
    const metadata = await readRecord<SchemaMetadata>(db, 'metadata', 'schema');
    if (!metadata || metadata.version !== DATA_SCHEMA_VERSION) {
      throw new Error('Version du schéma local non reconnue. Aucune donnée n’a été modifiée.');
    }
    const profiles = await readProfiles(db);
    if (profiles.length > 1) throw new Error('Plusieurs profils détectés : sélection multiprofil non disponible en V0.1.');
    let profile = profiles[0];
    if (!profile) {
      const now = new Date().toISOString();
      profile = { id: makeId(), name: 'Sportif', createdAt: now, updatedAt: now };
      await writeRecord(db, 'profiles', profile);
    }
    let settings = await readRecord<LocalSettings>(db, 'settings', SETTINGS_KEY);
    if (!settings) {
      settings = { id: SETTINGS_KEY, profileId: profile.id, theme: 'dark', updatedAt: new Date().toISOString() };
      await writeRecord(db, 'settings', settings);
    }
    if (settings.profileId !== profile.id || !['dark','light','system'].includes(settings.theme)) {
      throw new Error('Préférences locales incohérentes. Aucune donnée n’a été écrasée.');
    }
    return { db, profile, settings };
  } catch (error) { db.close(); throw error; }
}
// Lot 1-E.2 : sauvegarde portable et restauration transactionnelle.
const BACKUP_FORMAT = 'lifetrack-training-backup';
const BACKUP_VERSION = 4;
type BackupDocument = {
  format: typeof BACKUP_FORMAT;
  version: number;
  exportedAt: string;
  dataSchemaVersion: number;
  profile: LocalProfile;
  settings: LocalSettings;
  customExercises?: Exercise[];
  workoutTemplates?: WorkoutTemplate[];
  trainingPrograms?: TrainingProgram[];
  plannedWorkouts?: PlannedWorkout[];
  executions?: Execution[];
};
function validDate(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}
function validExecution(v: unknown): v is Execution {
 if (!v || typeof v!=='object' || Array.isArray(v)) return false;
 const x=v as Execution;
 return typeof x.id==='string' && x.id.startsWith('execution:') && x.id.length<=128 &&
 typeof x.templateId==='string' && typeof x.name==='string' && x.name.length<=100 &&
 (x.plannedId===null||typeof x.plannedId==='string') && Array.isArray(x.targets) && x.targets.length<=200 && x.targets.every(validTarget) &&
 validDate(x.startedAt)&&validDate(x.updatedAt)&&validDate(x.lastTick)&&(x.endedAt===null||validDate(x.endedAt)) &&
 ['active','paused','completed','partial','abandoned'].includes(x.status) &&
 [x.activeMs,x.pauseMs].every(n=>Number.isFinite(n)&&n>=0&&n<=864000000) &&
 (x.timedSet==null||(typeof x.timedSet==='object'&&Number.isInteger(x.timedSet.index)&&x.timedSet.index>=0&&x.timedSet.index<x.targets.length&&Number.isInteger(x.timedSet.set)&&x.timedSet.set>=1&&x.timedSet.set<=30&&Number.isFinite(x.timedSet.elapsedMs)&&x.timedSet.elapsedMs>=0&&(x.timedSet.startedAt===null||validDate(x.timedSet.startedAt)))) &&
 Array.isArray(x.completedIndexes) && x.completedIndexes.every(i=>Number.isInteger(i)&&i>=0&&i<x.targets.length) &&
 new Set(x.completedIndexes).size===x.completedIndexes.length && typeof x.manualDuration==='boolean' &&
 (x.exerciseKinds===undefined || (typeof x.exerciseKinds==='object' && x.exerciseKinds!==null && Object.entries(x.exerciseKinds).every(([k,v])=>Number.isInteger(Number(k))&&Number(k)>=0&&Number(k)<x.targets.length&&['musculation','cardio'].includes(v)))) &&
 (x.cardioResults===undefined || (Array.isArray(x.cardioResults) && x.cardioResults.length<=x.targets.length && x.cardioResults.every(r=>Number.isInteger(r.index)&&r.index>=0&&r.index<x.targets.length&&(['durationMinutes','distanceKm','caloriesKcal','heartRateAvg','heartRateMin','heartRateMax','speedKmh','ascentM','descentM','cadenceRpm','resistance','inclineAvgPct','inclineMaxPct'] as const).every(k=>r[k]===undefined||typeof r[k]==='number'&&Number.isFinite(r[k])&&r[k]>=0&&r[k]<=1000000)) && new Set(x.cardioResults.map(r=>r.index)).size===x.cardioResults.length)) &&
 (x.exerciseResults===undefined || (Array.isArray(x.exerciseResults) && x.exerciseResults.length<=x.targets.length &&
 x.exerciseResults.every(r=>Number.isInteger(r.index)&&r.index>=0&&r.index<x.targets.length&&Array.isArray(r.sets)&&r.sets.length<=30&&
 (r.quality===undefined||['maitrisee','correcte','ameliorer'].includes(r.quality))&&
 r.sets.every(t=>Number.isInteger(t.set)&&t.set>=1&&t.set<=30&&Number.isInteger(t.reps)&&t.reps>=0&&t.reps<=999&&(t.durationSeconds===undefined||(Number.isInteger(t.durationSeconds)&&t.durationSeconds>=0&&t.durationSeconds<=3600))&&Number.isFinite(t.loadKg)&&t.loadKg>=0&&t.loadKg<=2000&&(t.rir===null||Number.isInteger(t.rir)&&t.rir>=0&&t.rir<=6))&&
 new Set(r.sets.map(t=>t.set)).size===r.sets.length)&&new Set(x.exerciseResults.map(r=>r.index)).size===x.exerciseResults.length));
}
function validateBackup(value: unknown): BackupDocument {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Fichier JSON invalide.');
  const raw = value as Record<string, unknown>;
  if (raw.format !== BACKUP_FORMAT || ![1, 2, 3, BACKUP_VERSION].includes(Number(raw.version)) || ![1, 2, 3, DATA_SCHEMA_VERSION].includes(Number(raw.dataSchemaVersion))) {
    throw new Error('Format ou version de sauvegarde incompatible. Aucune donnée modifiée.');
  }
  if (!validDate(raw.exportedAt)) throw new Error('Date d’export invalide.');
  const p = raw.profile as Record<string, unknown> | null;
  const pref = raw.settings as Record<string, unknown> | null;
  if (!p || typeof p !== 'object' || Array.isArray(p) ||
      typeof p.id !== 'string' || p.id.length < 8 || p.id.length > 128 ||
      typeof p.name !== 'string' || !p.name.trim() || p.name.length > 60 ||
      !validDate(p.createdAt) || !validDate(p.updatedAt)) {
    throw new Error('Profil de sauvegarde invalide.');
  }
  if (!pref || typeof pref !== 'object' || Array.isArray(pref) ||
      pref.id !== SETTINGS_KEY || pref.profileId !== p.id ||
      !['dark', 'light', 'system'].includes(String(pref.theme)) || !validDate(pref.updatedAt)) {
    throw new Error('Préférences de sauvegarde invalides.');
  }
  if ((Number(raw.version) >= 2) && (raw.dataSchemaVersion !== raw.version || !Array.isArray(raw.customExercises) ||
      raw.customExercises.length > 500 || !raw.customExercises.every(validExercise) ||
      new Set((raw.customExercises as Exercise[]).map(e=>e.id)).size !== raw.customExercises.length)) {
    throw new Error('Bibliothèque personnalisée de sauvegarde invalide.');
  }
  if (Number(raw.version) >= 3 && !validPlanning(raw.workoutTemplates,raw.trainingPrograms,raw.plannedWorkouts)) {
    throw new Error('Données de programmes de sauvegarde invalides.');
  }
  if (raw.version === 4 && (!Array.isArray(raw.executions) || raw.executions.length > 3000 || !raw.executions.every(validExecution))) throw new Error('Historique des séances invalide.');
  if (raw.version === 1 && raw.dataSchemaVersion !== 1) throw new Error('Ancien schéma JSON incompatible.');
  return raw as unknown as BackupDocument;
}
function restoreBackup(db: IDBDatabase, backup: BackupDocument): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // Une seule transaction : aucun état partiellement restauré en cas d'échec.
      const tx = db.transaction(['profiles', 'settings', 'customExercises', 'workoutTemplates', 'trainingPrograms', 'plannedWorkouts', 'executions'], 'readwrite');
      const profiles = tx.objectStore('profiles');
      const settings = tx.objectStore('settings');
      profiles.clear();
      profiles.put(backup.profile);
      settings.put(backup.settings);
      // Ancien JSON : ne jamais effacer les exercices créés depuis son export.
      if (backup.version >= 2) {
        const exercises = tx.objectStore('customExercises'); exercises.clear();
        for (const exercise of backup.customExercises || []) exercises.put(exercise);
      }
      // Les anciennes sauvegardes conservent le planning local actuel.
      if (backup.version >= 3) {
        for (const [store, items] of [
          ['workoutTemplates', backup.workoutTemplates || []],
          ['trainingPrograms', backup.trainingPrograms || []],
          ['plannedWorkouts', backup.plannedWorkouts || []],
        ] as const) {
          const target = tx.objectStore(store); target.clear();
          for (const item of items) target.put(item);
        }
      }
      if (backup.version === 4) { const target=tx.objectStore('executions'); target.clear(); for(const item of backup.executions||[])target.put(item); }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error || new Error('Restauration impossible.'));
      tx.onabort = () => reject(tx.error || new Error('Restauration annulée.'));
    } catch (error) { reject(error); }
  });
}
function describeError(error: unknown): string {
  return error instanceof Error ? error.message : 'Une erreur de stockage est survenue.';
}

function App() {
  const [tab, setTab] = useState<Tab>('Accueil');
  const [requestedPlan,setRequestedPlan] = useState<string|null>(null);
  const [showLibrary, setShowLibrary] = useState(false);
  const [customExercises, setCustomExercises] = useState<Exercise[]>([]);
  const [planningCounts, setPlanningCounts] = useState({templates:0, programs:0, planned:0});
  const [librarySearch, setLibrarySearch] = useState('');
  const [libraryKind, setLibraryKind] = useState('all');
  const [libraryMuscle, setLibraryMuscle] = useState('all');
  const [libraryEquipment, setLibraryEquipment] = useState('all');
  const [libraryOrigin, setLibraryOrigin] = useState('all');
  const [libraryArchived, setLibraryArchived] = useState(false);
  const allLibraryExercises = [...STANDARD_EXERCISES, ...customExercises];
  const libraryMuscles = [...new Set(allLibraryExercises.flatMap(e => e.muscles))].sort((a,b)=>a.localeCompare(b,'fr'));
  const libraryEquipmentOptions = [...new Set(allLibraryExercises.flatMap(e => e.equipment))].sort((a,b)=>a.localeCompare(b,'fr'));
  const filteredLibrary = allLibraryExercises.filter(e =>
    (libraryArchived ? e.archived : !e.archived) &&
    (libraryKind === 'all' || e.kind === libraryKind) &&
    (libraryMuscle === 'all' || e.muscles.includes(libraryMuscle)) &&
    (libraryEquipment === 'all' || e.equipment.includes(libraryEquipment)) &&
    (libraryOrigin === 'all' || e.origin === libraryOrigin) &&
    (!librarySearch.trim() || [e.name, ...e.muscles, ...e.equipment].join(' ').toLocaleLowerCase('fr').includes(librarySearch.trim().toLocaleLowerCase('fr')))
  );
  const [libraryError, setLibraryError] = useState('');
  const [libraryMessage, setLibraryMessage] = useState('');
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  const [exerciseName, setExerciseName] = useState('');
  const [exerciseKind, setExerciseKind] = useState<ExerciseKind>('musculation');
  const [exerciseMuscles, setExerciseMuscles] = useState('');
  const [exerciseEquipment, setExerciseEquipment] = useState('');
  const [exerciseBusy, setExerciseBusy] = useState(false);
  const startExerciseEditor = (exercise?: Exercise) => {
    setEditingExerciseId(exercise?.origin === 'custom' ? exercise.id : 'new');
    setExerciseName(exercise?.name || '');
    setExerciseKind(exercise?.kind || 'musculation');
    setExerciseMuscles(exercise?.muscles.join(', ') || '');
    setExerciseEquipment(exercise?.equipment.join(', ') || '');
    setLibraryError(''); setLibraryMessage('');
  };
  const saveExercise = async () => {
    if (!dbRef.current || storageStatus !== 'ready' || exerciseBusy) return;
    const name = exerciseName.trim();
    const muscles = exerciseMuscles.split(',').map(x => x.trim()).filter(Boolean);
    const equipment = exerciseEquipment.split(',').map(x => x.trim()).filter(Boolean);
    if (!name || name.length > 100 || !muscles.length || !equipment.length ||
        muscles.length > 20 || equipment.length > 20 ||
        [...muscles, ...equipment].some(x => x.length > 60)) {
      setLibraryError('Renseigne un nom (100 caractères max), au moins un muscle et un matériel (60 caractères max par élément).'); return;
    }
    const previousExercise = customExercises.find(e => e.id === editingExerciseId);
    const id = editingExerciseId && editingExerciseId !== 'new' ? editingExerciseId : 'custom:' + crypto.randomUUID();
    const exercise: Exercise = { id, name, kind: exerciseKind, muscles, equipment,
      measurement: exerciseKind === 'cardio' ? 'duree-distance' : 'series-repetitions', origin: 'custom', archived: previousExercise?.archived ?? false };
    setExerciseBusy(true); setLibraryError('');
    try {
      await persistExercise(dbRef.current, exercise);
      setCustomExercises(await readCustomExercises(dbRef.current));
      setEditingExerciseId(null); setLibraryMessage('Exercice enregistré localement.');
    } catch (error) { setLibraryError(describeError(error)); }
    finally { setExerciseBusy(false); }
  };
  const toggleExerciseArchive = async (exercise: Exercise) => {
    if (!dbRef.current || storageStatus !== 'ready' || exerciseBusy || exercise.origin !== 'custom') return;
    setExerciseBusy(true); setLibraryError('');
    try {
      await persistExercise(dbRef.current, { ...exercise, archived: !exercise.archived });
      setCustomExercises(await readCustomExercises(dbRef.current));
      setLibraryMessage(exercise.archived ? 'Exercice réactivé.' : 'Exercice archivé (non supprimé).');
      if (editingExerciseId === exercise.id) setEditingExerciseId(null);
    } catch (error) { setLibraryError(describeError(error)); }
    finally { setExerciseBusy(false); }
  };
  const [pwaStatus, setPwaStatus] = useState('Initialisation PWA…');
  const [updateWaiting, setUpdateWaiting] = useState<ServiceWorker | null>(null);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const checkUpdateManually = async () => {
    if (!('serviceWorker' in navigator)) { setPwaStatus('Service worker non disponible'); return; }
    if (!navigator.onLine) { setPwaStatus('Hors ligne : vérification impossible'); return; }
    setCheckingUpdate(true);
    setPwaStatus('Recherche de mise à jour en cours…');
    try {
      const reg = await navigator.serviceWorker.getRegistration(import.meta.env.BASE_URL);
      if (!reg) { setPwaStatus('Service worker non enregistré'); return; }
      await reg.update();
      if (reg.waiting && navigator.serviceWorker.controller) {
        setUpdateWaiting(reg.waiting);
        setPwaStatus('Nouvelle version prête à installer');
      } else if (reg.installing) {
        setPwaStatus('Téléchargement de la nouvelle version en cours…');
      } else {
        setUpdateWaiting(null);
        setPwaStatus('Vérification terminée : aucune mise à jour en attente (une activation automatique reste possible).');
      }
    } catch (error) {
      setPwaStatus('Échec de vérification : ' + describeError(error));
    } finally { setCheckingUpdate(false); }
  };
  React.useEffect(() => {
    if (!('serviceWorker' in navigator)) { setPwaStatus('PWA indisponible sur ce navigateur'); return; }
    let live = true;
    let refreshing = false;
    let registration: ServiceWorkerRegistration | null = null;
    let installingWorker: ServiceWorker | null = null;
    const onControllerChange = () => {
      setUpdateWaiting(null);
      if (!live || refreshing) return;
      refreshing = true;
      window.location.reload();
    };
    const onWorkerStateChange = () => {
      if (!live || installingWorker?.state !== 'installed') return;
      if (navigator.serviceWorker.controller && installingWorker && installingWorker !== navigator.serviceWorker.controller) {
        setUpdateWaiting(installingWorker);
        setPwaStatus('Nouvelle version prête à installer');
      }
    };
    const onUpdateFound = () => {
      installingWorker?.removeEventListener('statechange', onWorkerStateChange);
      installingWorker = registration?.installing || null;
      installingWorker?.addEventListener('statechange', onWorkerStateChange);
      onWorkerStateChange();
    };
    const checkForUpdates = () => {
      if (!live || !navigator.onLine || !registration) return;
      registration.update().catch(() => { /* Une erreur réseau ne bloque pas l’application. */ });
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') checkForUpdates();
    };
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('online', checkForUpdates);
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, {scope: import.meta.env.BASE_URL})
      .then(reg => {
        if (!live) return;
        registration = reg;
        setPwaStatus('PWA installée · vérification des mises à jour active');
        if (reg.waiting && reg.waiting.state === 'installed' && navigator.serviceWorker.controller && reg.waiting !== navigator.serviceWorker.controller) {
          setUpdateWaiting(reg.waiting);
          setPwaStatus('Nouvelle version prête à installer');
        }
        reg.addEventListener('updatefound', onUpdateFound);
        onUpdateFound();
        checkForUpdates();
      }).catch(error => { if (live) setPwaStatus('PWA non installée : ' + describeError(error)); });
    return () => {
      live = false;
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('online', checkForUpdates);
      registration?.removeEventListener('updatefound', onUpdateFound);
      installingWorker?.removeEventListener('statechange', onWorkerStateChange);
    };
  }, []);

  const [theme, setTheme] = useState<Theme>('dark');
  const [profile, setProfile] = useState<LocalProfile | null>(null);
  const [profileName, setProfileName] = useState('');
  const [storageStatus, setStorageStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [storageError, setStorageError] = useState('');
  const [saving, setSaving] = useState(false);
  const dbRef = React.useRef<IDBDatabase | null>(null);
  React.useEffect(() => {
    const onVersionChange = () => {
      dbRef.current = null;
      setStorageStatus('error');
      setStorageError('La base locale a changé dans un autre onglet. Recharge cette page avant toute modification.');
    };
    window.addEventListener('lifetrack-database-versionchange', onVersionChange);
    return () => window.removeEventListener('lifetrack-database-versionchange', onVersionChange);
  }, []);
  const [storageDetail, setStorageDetail] = useState('');
  React.useEffect(() => {
    let cancelled = false;
    loadLocalData().then(({ db, profile: storedProfile, settings }) => {
      if (cancelled) { db.close(); return; }
      dbRef.current = db;
      setProfile(storedProfile);
      setProfileName(storedProfile.name);
      setTheme(settings.theme);
      readPlanning(db).then(data => { if (!cancelled) setPlanningCounts({templates:data.templates.length,programs:data.programs.length,planned:data.planned.length}); })
        .catch(error => { if (!cancelled) setStorageError('Planning : ' + describeError(error)); });
      readCustomExercises(db).then(items => { if (!cancelled) setCustomExercises(items); })
        .catch(error => { if (!cancelled) setLibraryError(describeError(error)); });
      setStorageStatus('ready');
      setStorageDetail('Schéma ' + DATA_SCHEMA_VERSION + ' vérifié · profil ' + storedProfile.id.slice(0, 8));
    }).catch(error => {
      if (!cancelled) { setStorageError(describeError(error)); setStorageStatus('error'); }
    });
    return () => { cancelled = true; dbRef.current?.close(); dbRef.current = null; };
  }, []);
  const saveProfile = async () => {
    if (!profile || !dbRef.current || saving) return;
    const name = profileName.trim();
    if (!name || name.length > 60) { setStorageError('Le nom doit contenir entre 1 et 60 caractères.'); return; }
    setSaving(true); setStorageError('');
    const updated = { ...profile, name, updatedAt: new Date().toISOString() };
    try {
      await writeRecord(dbRef.current, 'profiles', updated);
      const verified = await readRecord<LocalProfile>(dbRef.current, 'profiles', updated.id);
      if (!verified || verified.name !== updated.name) throw new Error('La relecture du nom ne correspond pas à la valeur enregistrée.');
      setProfile(verified);
      setStorageDetail('Nom enregistré et relu avec succès · ' + new Date().toLocaleTimeString('fr-FR'));
    }
    catch (error) { setStorageError('Profil non enregistré : ' + describeError(error)); }
    finally { setSaving(false); }
  };
  const saveTheme = async (next: Theme) => {
    if (!profile || !dbRef.current || saving) return;
    setSaving(true); setStorageError('');
    try {
      await writeRecord(dbRef.current, 'settings', { id: SETTINGS_KEY, profileId: profile.id, theme: next, updatedAt: new Date().toISOString() });
      const verified = await readRecord<LocalSettings>(dbRef.current, 'settings', SETTINGS_KEY);
      if (!verified || verified.theme !== next || verified.profileId !== profile.id) throw new Error('La relecture du thème ne correspond pas à la valeur enregistrée.');
      setTheme(verified.theme);
      setStorageDetail('Thème enregistré et relu avec succès · ' + new Date().toLocaleTimeString('fr-FR'));
    } catch (error) { setStorageError('Thème non enregistré : ' + describeError(error)); }
    finally { setSaving(false); }
  };
  const backupInputRef = React.useRef<HTMLInputElement | null>(null);
  const [backupBusy, setBackupBusy] = useState(false);
  const [backupMessage, setBackupMessage] = useState('');
  const exportBackup = async () => {
    if (!dbRef.current || storageStatus !== 'ready' || backupBusy || saving) return;
    setBackupBusy(true); setBackupMessage('');
    try {
      const profiles = await readProfiles(dbRef.current);
      const storedSettings = await readRecord<LocalSettings>(dbRef.current, 'settings', SETTINGS_KEY);
      if (profiles.length !== 1 || !storedSettings || storedSettings.profileId !== profiles[0].id) {
        throw new Error('Données locales incohérentes : export interrompu.');
      }
      const exercisesToExport = await readCustomExercises(dbRef.current);
      if (exercisesToExport.length > 500 || exercisesToExport.some(e => !validExercise(e))) {
        throw new Error('Bibliothèque locale incohérente : export interrompu.');
      }
      const planning = await readPlanning(dbRef.current);
      const backup: BackupDocument = {
        format: BACKUP_FORMAT, version: BACKUP_VERSION,
        exportedAt: new Date().toISOString(), dataSchemaVersion: DATA_SCHEMA_VERSION,
        profile: profiles[0], settings: storedSettings, customExercises: exercisesToExport,
        workoutTemplates: planning.templates, trainingPrograms: planning.programs, plannedWorkouts: planning.planned, executions: await readAll<Execution>(dbRef.current,'executions'),
      };
      validateBackup(backup);
      const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' }));
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `lifetrack-training-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 30000);
      setBackupMessage('Export préparé. Vérifie que le fichier JSON a bien été enregistré dans Fichiers/Téléchargements.');
    } catch (error) { setBackupMessage('Export impossible : ' + describeError(error)); }
    finally { setBackupBusy(false); }
  };
  const importBackup = async (file: File | undefined) => {
    if (!file || !dbRef.current || storageStatus !== 'ready' || backupBusy || saving) return;
    setBackupBusy(true); setBackupMessage('');
    try {
      if (file.size > 1024 * 1024) throw new Error('Fichier trop volumineux (maximum 1 Mo).');
      const backup = validateBackup(JSON.parse(await file.text()) as unknown);
      const libraryWarning = backup.version >= 2
        ? `La bibliothèque personnalisée actuelle sera remplacée par ${backup.customExercises?.length ?? 0} exercice(s) du fichier.`
        : 'Ancienne sauvegarde : les exercices personnalisés actuels seront conservés.';
      const planningWarning = backup.version >= 3
        ? 'Les séances types, programmes et affectations locales seront remplacés.'
        : 'Les séances types, programmes et affectations locales seront conservés.';
      if (!window.confirm(`Restaurer le profil « ${backup.profile.name} » et son thème ?\n\n${libraryWarning}\n${planningWarning}\n\nExporte une sauvegarde de l’état actuel avant de continuer.`)) {
        setBackupMessage('Restauration annulée : aucune donnée modifiée.');
        return;
      }
      await restoreBackup(dbRef.current, backup);
      const profiles = await readProfiles(dbRef.current);
      const settings = await readRecord<LocalSettings>(dbRef.current, 'settings', SETTINGS_KEY);
      if (profiles.length !== 1 || profiles[0].id !== backup.profile.id ||
          profiles[0].name !== backup.profile.name || settings?.theme !== backup.settings.theme ||
          settings?.profileId !== backup.profile.id) {
        throw new Error('Contrôle de relecture après restauration non conforme.');
      }
      setProfile(profiles[0]);
      setProfileName(profiles[0].name);
      setTheme(settings.theme);
      const restoredExercises = await readCustomExercises(dbRef.current);
      if (backup.version >= 2 && (restoredExercises.length !== backup.customExercises?.length ||
        !restoredExercises.every(e => backup.customExercises?.some(expected => JSON.stringify(expected) === JSON.stringify(e))))) {
        throw new Error('Contrôle de relecture de la bibliothèque non conforme.');
      }
      setCustomExercises(restoredExercises);
      const verifiedPlanning = await readPlanning(dbRef.current);
      if (backup.version >= 3 && (JSON.stringify(verifiedPlanning.templates) !== JSON.stringify(backup.workoutTemplates) ||
          JSON.stringify(verifiedPlanning.programs) !== JSON.stringify(backup.trainingPrograms) ||
          JSON.stringify(verifiedPlanning.planned) !== JSON.stringify(backup.plannedWorkouts))) {
        throw new Error('Contrôle de relecture du planning non conforme.');
      }
      setPlanningCounts({templates:verifiedPlanning.templates.length,programs:verifiedPlanning.programs.length,planned:verifiedPlanning.planned.length});
      setStorageDetail('Restauration contrôlée · ' + new Date().toLocaleTimeString('fr-FR'));
      setBackupMessage('Restauration réussie : profil et thème relus depuis IndexedDB.');
    } catch (error) { setBackupMessage('Restauration refusée : ' + describeError(error)); }
    finally { setBackupBusy(false); if (backupInputRef.current) backupInputRef.current.value = ''; }
  };
  const [showProfile, setShowProfile] = useState(false);
  const effectiveTheme = theme === 'system' ? 'system' : theme;

  const navigate = (next: Tab) => { setTab(next); setShowProfile(false); setShowLibrary(false); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  return (
    <div className={`shell theme-${effectiveTheme}`}>
      <aside className="sidebar" aria-label="Navigation principale">
        <div className="brand"><span className="brand-icon">LT</span><span><strong>LifeTrack</strong><small>TRAINING</small></span></div>
        <nav>{tabs.map(item => <button key={item.label} type="button" className={`side-link ${tab === item.label && !showProfile && !showLibrary ? 'active' : ''}`} onClick={() => navigate(item.label)}><NavIcon name={item.icon}/>{item.shortLabel}</button>)}</nav>
        <div className="sidebar-foot">V0.1 · Lot 2-C.2.1<br/>PWA · Hors ligne</div>
      </aside>
      <div className="main-column">
        <header className="topbar">
          <div className="mobile-brand"><span className="brand-icon">LT</span><span>TRAINING</span></div>
          <div className="desktop-heading">TRAIN SMART. <span>PROGRESS STRONG.</span></div>
          <button type="button" className="avatar" aria-label="Afficher le profil" onClick={() => setShowProfile(!showProfile)}>{profile?.name.trim().charAt(0).toUpperCase() || "S"}</button>
        </header>
        <main id="main" className="content">
          <div className="demo-note"><span className="demo-dot"/> Démonstration sportive · {storageStatus === 'ready' ? 'Profil et préférences enregistrés localement' : storageStatus === 'loading' ? 'Initialisation du stockage…' : 'Stockage indisponible'}</div>
          {updateWaiting && <div className="pwa-update" role="status"><span>Nouvelle version disponible.</span><button type="button" className="primary-button" onClick={() => updateWaiting.postMessage({type:'SKIP_WAITING'})}>Mettre à jour</button></div>}
          {storageError && <div className="storage-error" role="alert">{storageError}</div>}
          {storageStatus === 'ready' && <p className="muted small" style={{margin:'4px 0 10px'}}>Diagnostic L1-C.1 : {storageDetail}</p>}
          {showLibrary && !showProfile && <section>
            <div className="section-head"><p className="kicker">RÉFÉRENTIEL · LOT 2-A.4</p><h1>Bibliothèque d’exercices</h1><p className="muted">{STANDARD_EXERCISES.length} standards · {customExercises.filter(e=>!e.archived).length} personnalisés actifs · {customExercises.filter(e=>e.archived).length} archivés.</p></div>
            {libraryError && <p className="storage-error" role="alert">{libraryError}</p>}
            {libraryMessage && <p className="muted small" role="status">{libraryMessage}</p>}
            <button type="button" className="primary-button" disabled={storageStatus!=='ready'||exerciseBusy} onClick={()=>startExerciseEditor()}>Créer un exercice personnalisé <span>＋</span></button>
            {editingExerciseId && <div className="panel exercise-editor"><h2>{editingExerciseId==='new'?'Nouvel exercice':'Modifier l’exercice'}</h2>
              <label className="field-label" htmlFor="exercise-name">Nom</label><input id="exercise-name" className="profile-input" maxLength={100} value={exerciseName} onChange={e=>setExerciseName(e.target.value)}/>
              <label className="field-label" htmlFor="exercise-kind">Catégorie</label><select id="exercise-kind" className="profile-input" value={exerciseKind} onChange={e=>setExerciseKind(e.target.value as ExerciseKind)}><option value="musculation">Musculation</option><option value="cardio">Cardio</option></select>
              <label className="field-label" htmlFor="exercise-muscles">Groupes musculaires (séparés par une virgule)</label><input id="exercise-muscles" className="profile-input" value={exerciseMuscles} onChange={e=>setExerciseMuscles(e.target.value)} placeholder="Biceps, Avant-bras"/>
              <label className="field-label" htmlFor="exercise-equipment">Matériel (séparé par une virgule)</label><input id="exercise-equipment" className="profile-input" value={exerciseEquipment} onChange={e=>setExerciseEquipment(e.target.value)} placeholder="SmartWorkout"/>
              <p className="muted small">La mesure est automatiquement adaptée à la catégorie. Les exercices standards peuvent être dupliqués, mais pas modifiés directement.</p>
              <div className="profile-actions"><button className="primary-button save-button" disabled={exerciseBusy||storageStatus!=='ready'} onClick={()=>void saveExercise()}>{exerciseBusy?'Enregistrement…':'Enregistrer'}</button><button className="secondary-button" onClick={()=>setEditingExerciseId(null)}>Annuler</button></div>
            </div>}
            <div className="panel library-filters">
              <h2>Rechercher et filtrer</h2>
              <label className="field-label" htmlFor="library-search">Recherche (nom, muscle ou matériel)</label>
              <input id="library-search" type="search" className="profile-input" placeholder="Ex. curl, dos, SmartPress" value={librarySearch} onChange={e=>setLibrarySearch(e.target.value)}/>
              <div className="library-filter-grid">
                <div><label className="field-label" htmlFor="library-kind">Catégorie</label><select id="library-kind" className="profile-input" value={libraryKind} onChange={e=>setLibraryKind(e.target.value)}><option value="all">Toutes</option><option value="musculation">Musculation</option><option value="cardio">Cardio</option></select></div>
                <div><label className="field-label" htmlFor="library-muscle">Groupe musculaire</label><select id="library-muscle" className="profile-input" value={libraryMuscle} onChange={e=>setLibraryMuscle(e.target.value)}><option value="all">Tous</option>{libraryMuscles.map(v=><option key={v} value={v}>{v}</option>)}</select></div>
                <div><label className="field-label" htmlFor="library-equipment">Matériel</label><select id="library-equipment" className="profile-input" value={libraryEquipment} onChange={e=>setLibraryEquipment(e.target.value)}><option value="all">Tous</option>{libraryEquipmentOptions.map(v=><option key={v} value={v}>{v}</option>)}</select></div>
                <div><label className="field-label" htmlFor="library-origin">Origine</label><select id="library-origin" className="profile-input" value={libraryOrigin} onChange={e=>setLibraryOrigin(e.target.value)}><option value="all">Toutes</option><option value="standard">Standards</option><option value="custom">Personnalisés</option></select></div>
              </div>
              <label className="library-archived-toggle"><input type="checkbox" checked={libraryArchived} onChange={e=>setLibraryArchived(e.target.checked)}/> Afficher les exercices archivés uniquement</label>
              <div className="library-filter-footer"><span role="status">{filteredLibrary.length} exercice(s) trouvé(s)</span><button type="button" className="text-button" onClick={()=>{setLibrarySearch('');setLibraryKind('all');setLibraryMuscle('all');setLibraryEquipment('all');setLibraryOrigin('all');setLibraryArchived(false);}}>Réinitialiser les filtres</button></div>
            </div>
            {filteredLibrary.length===0 && <div className="panel"><p className="muted">Aucun exercice ne correspond aux critères sélectionnés.</p></div>}
            {(['musculation','cardio'] as const).filter(kind=>filteredLibrary.some(e=>e.kind===kind)).map(kind => <div className="panel" key={kind}><h2>{kind==='musculation'?'Musculation':'Cardio et endurance'}</h2>
              {filteredLibrary.filter(e=>e.kind===kind).map(e=><div className="library-exercise" key={e.id}><strong>{e.name}</strong><p className="muted small">{e.muscles.join(' · ')} · {e.equipment.join(', ')}</p><small>{e.origin==='standard'?'Standard':'Personnalisé'} · {e.measurement==='series-repetitions'?'Séries / répétitions':'Durée / distance'}</small>
                <div className="library-actions">{e.origin==='standard'?<button type="button" className="text-button" onClick={()=>startExerciseEditor(e)}>Dupliquer</button>:<><button type="button" className="text-button" onClick={()=>startExerciseEditor(e)}>Modifier</button><button type="button" className="text-button" disabled={exerciseBusy} onClick={()=>void toggleExerciseArchive(e)}>{e.archived?'Réactiver':'Archiver'}</button></>}</div></div>)}
            </div>)}
            <button className="secondary-button" onClick={()=>{setShowLibrary(false);setEditingExerciseId(null);}}>Retour à Plus</button>
          </section>}
          {showProfile ? <section><div className="section-head"><div><p className="kicker">COMPTE LOCAL</p><h1>Profil</h1></div></div><div className="panel"><h2>Profil personnel</h2><p className="muted">Un seul profil local actif en V0.1. Les données sont associées à un identifiant stable, sans compte ni serveur.</p><label className="field-label" htmlFor="profile-name">Nom affiché</label><input className="profile-input" id="profile-name" type="text" maxLength={60} value={profileName} disabled={storageStatus !== 'ready' || saving} onChange={event => setProfileName(event.target.value)} /><div className="profile-actions"><button className="primary-button save-button" disabled={storageStatus !== 'ready' || saving || !profileName.trim() || profileName.trim() === profile?.name} onClick={saveProfile}>{saving ? 'Enregistrement…' : 'Enregistrer le nom'}</button><button className="secondary-button" onClick={() => setShowProfile(false)}>Retour</button></div><p className="muted small">Les informations corporelles et les objectifs sportifs seront ajoutés dans un lot ultérieur.</p></div></section> : null}
          {!showProfile && !showLibrary && tab === 'Accueil' && <section>
            <div className="section-head"><div><p className="kicker">TABLEAU DE BORD</p><h1>Bonjour 👋</h1><p className="muted">Ton entraînement, en un coup d'œil.</p></div></div>
            <div className="hero-card"><div className="hero-top"><span className="pill">PROCHAINE SÉANCE · EXEMPLE</span><span className="hero-time">~ 55 min</span></div><p className="hero-label">Aujourd'hui</p><h2>Haut du corps</h2><p>6 exercices · Pectoraux, dos, épaules</p><button className="primary-button" onClick={() => navigate('Séance')}>Voir la séance <span>→</span></button></div>
            <div className="section-title"><h2>Cette semaine</h2><span className="muted">Données fictives</span></div>
            <div className="metrics"><div className="metric"><span>Séances</span><strong>3<span>/4</span></strong><small>prévues</small></div><div className="metric"><span>Durée</span><strong>2h 35</strong><small>entraînement</small></div><div className="metric"><span>Séries</span><strong>42</strong><small>validées</small></div></div>
            <div className="panel"><div className="panel-heading"><h2>Programme</h2><button className="text-button" onClick={() => navigate('Programmes')}>Calendrier →</button></div><div className="timeline"><span className="timeline-dot"/><div><strong>Demain · Cardio</strong><p>Vélo · 40 min · séance planifiée</p></div></div><div className="timeline"><span className="timeline-dot lime"/><div><strong>Samedi · Full body</strong><p>Musculation · 60 min</p></div></div></div>
          </section>}
          {!showProfile && !showLibrary && (tab === 'Séance' || tab === 'Historique') && <section><div className="section-head"><div><p className="kicker">{tab === 'Historique' ? 'SUIVI ET ANALYSE' : 'ENTRAÎNEMENT'}</p><h1>{tab === 'Historique' ? 'Historique' : 'Exécution'}</h1><p className="muted">{tab === 'Historique' ? 'Bilans, séances passées et progression.' : 'Prépare et réalise tes entraînements.'}</p></div></div>{tab === 'Séance' && <div className="panel highlighted"><span className="pill">SÉANCE DU JOUR · EXEMPLE</span><h2>Haut du corps</h2><p className="muted">6 exercices · 18 séries · repos personnalisés</p><div className="exercise-list"><div><span>01</span> Développé debout <small>3 × 10</small></div><div><span>02</span> Tirage horizontal <small>3 × 10</small></div><div><span>03</span> Curl biceps <small>3 × 12</small></div></div><p className="muted small">Choisis une séance type ou une planification ci-dessous.</p></div>}<SessionExecution db={storageStatus === 'ready' ? dbRef.current : null} exercises={allLibraryExercises} onBonusExerciseCreated={exercise=>setCustomExercises(prev=>[...prev.filter(e=>e.id!==exercise.id),exercise])} requestedPlan={requestedPlan} onPlanConsumed={()=>setRequestedPlan(null)} mode={tab === 'Historique' ? 'history' : 'execution'}/>{tab === 'Séance' && <div className="panel"><h2>Séance libre</h2><p className="muted">Musculation, cardio ou copie d'une séance existante.</p><div className="disabled-action">Création disponible dans un prochain lot</div></div>}</section>}
          {!showProfile && !showLibrary && tab === 'Programmes' && <section><div className="section-head"><div><p className="kicker">PLANIFICATION</p><h1>Programmes</h1><p className="muted">Calendrier global et cycles multisemaines.</p></div></div><PlanningCalendar onStart={id=>{setRequestedPlan(id);navigate('Séance')}} db={storageStatus === 'ready' ? dbRef.current : null} onChange={()=>{if(dbRef.current)void readPlanning(dbRef.current).then(data=>setPlanningCounts({templates:data.templates.length,programs:data.programs.length,planned:data.planned.length})).catch(error=>setStorageError(describeError(error)))}}/><WorkoutEditor db={storageStatus === 'ready' ? dbRef.current : null} exercises={allLibraryExercises} onChange={()=>{if(dbRef.current)void readPlanning(dbRef.current).then(data=>setPlanningCounts({templates:data.templates.length,programs:data.programs.length,planned:data.planned.length})).catch(error=>setStorageError(describeError(error)))}}/><ProgramWizard db={storageStatus === 'ready' ? dbRef.current : null} onChange={()=>{if(dbRef.current)void readPlanning(dbRef.current).then(data=>setPlanningCounts({templates:data.templates.length,programs:data.programs.length,planned:data.planned.length})).catch(error=>setStorageError(describeError(error)))}}/><ProgramEditor exercises={allLibraryExercises} db={storageStatus === 'ready' ? dbRef.current : null} onChange={()=>{if(dbRef.current)void readPlanning(dbRef.current).then(data=>setPlanningCounts({templates:data.templates.length,programs:data.programs.length,planned:data.planned.length})).catch(error=>setStorageError(describeError(error)))}}/><div className="panel"><p className="muted small">Fondations 2-B.1 : {planningCounts.templates} séance(s) type(s) · {planningCounts.programs} programme(s) · {planningCounts.planned} affectation(s) datée(s) enregistrées.</p></div></section>}
          {!showProfile && !showLibrary && tab === 'Stats' && <StatsDashboard db={storageStatus === 'ready' ? dbRef.current : null}/>}
          {!showProfile && !showLibrary && tab === 'Plus' && <section><div className="section-head"><div><p className="kicker">PERSONNALISATION</p><h1>Plus</h1><p className="muted">Bibliothèques, matériel et réglages.</p></div></div><div className="panel menu-panel"><button className="menu-item menu-button" onClick={()=>setShowLibrary(true)}><div><strong>Bibliothèque d’exercices</strong><p className="muted">{STANDARD_EXERCISES.length} exercices préchargés · Création et édition</p></div><span>→</span></button>{[['Matériel','Inventaire et configurations'],['Séances types','Modèles réutilisables']].map(([name, description]) => <div className="menu-item" key={name}><div><strong>{name}</strong><p className="muted">{description}</p></div><span>À venir</span></div>)}<button className="menu-item menu-button" onClick={() => setShowProfile(true)}><div><strong>Profil</strong><p className="muted">Profil local actif</p></div><span>→</span></button></div><div className="panel"><h2>Apparence</h2><div className="theme-choices" role="group" aria-label="Thème de l'application">{(['dark','light','system'] as const).map(value => <button key={value} className={theme === value ? 'selected' : ''} disabled={storageStatus !== 'ready' || saving} onClick={() => saveTheme(value)}>{value === 'dark' ? 'Sombre' : value === 'light' ? 'Clair' : 'Système'}</button>)}</div><p className="muted small">Thème enregistré dans IndexedDB et restauré à la prochaine ouverture.</p></div><div className="panel"><h2>Sauvegarde et restauration</h2><p className="muted small">Sauvegarde JSON locale du profil, du thème et des exercices personnalisés. Aucun transfert vers un serveur. Enregistre une copie du fichier dans Fichiers ou sur un autre support.</p><div className="profile-actions"><button type="button" className="secondary-button" disabled={storageStatus !== 'ready' || saving || backupBusy} onClick={exportBackup}>Exporter JSON</button><button type="button" className="secondary-button" disabled={storageStatus !== 'ready' || saving || backupBusy} onClick={() => backupInputRef.current?.click()}>Restaurer un JSON</button><input ref={backupInputRef} type="file" accept=".json,application/json" style={{display:'none'}} onChange={event => { void importBackup(event.target.files?.[0]); }} aria-label="Choisir un fichier de sauvegarde JSON" /></div><p className="muted small" role="status">{backupBusy ? 'Traitement en cours…' : backupMessage || 'Avant toute restauration, exporte une sauvegarde de l’état actuel.'}</p></div><div className="panel"><h2>À propos</h2><p><strong>LifeTrack Training</strong> · V0.1 — Lot 2-C.2.1</p><p className="muted small">{pwaStatus}</p><button type="button" className="secondary-button" disabled={checkingUpdate} onClick={() => void checkUpdateManually()}>{checkingUpdate ? "Vérification…" : "Rechercher une mise à jour"}</button><p className="muted small">Pour installer sur iPhone : Safari → Partager → Sur l’écran d’accueil. Ouvre une première fois en ligne avant le test hors ligne.</p></div></section>}
        </main>
        <nav className="bottom-nav" aria-label="Navigation mobile">{tabs.map(item => <button type="button" key={item.label} className={tab === item.label && !showProfile && !showLibrary ? 'active' : ''} onClick={() => navigate(item.label)}><NavIcon name={item.icon}/><small>{item.shortLabel}</small></button>)}</nav>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);

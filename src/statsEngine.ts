/** LifeTrack Training 2-E.2.1 — pure, read-only statistics over 2-D records. */
import type {Execution} from './SessionExecution';

export type PlannedStatsRecord={id:string;date:string;status:'planned'|'cancelled'|'completed'|'partial'|'abandoned';templateId?:string};
export type StatsPeriod={start:string;end:string};
export type StatsActivity='Musculation'|'Tapis'|'Vélo'|'Randonnée'|'Autre';
export type StatsSummary={
 period:StatsPeriod; sessions:number; completeSessions:number; partialSessions:number;
 strengthSets:number; nominalVolumeKgReps:number; isometricSeconds:number;
 elapsedMs:number|null; recordedActiveMs:number|null; recordedPauseMs:number|null; restMs:null;
 durationsRecorded:number; cardioDurationMinutes:number|null; cardioDistanceKm:number|null; cardioAscentM:number|null;
 plannedDue:number; plannedFulfilled:number; adherencePct:number|null;
 sessionsPerWeek:number; byWeek:{week:string;sessions:number}[];
 activitySessions:Record<StatsActivity,number>; activityMinutes:Record<StatsActivity,number>;
};
const finiteNonnegative=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v)&&v>=0;
const validDay=(day:string)=>/^\d{4}-\d{2}-\d{2}$/.test(day)&&!Number.isNaN(Date.parse(day+'T12:00:00Z'))&&new Date(day+'T12:00:00Z').toISOString().slice(0,10)===day;
const localDay=(iso:string):string|null=>{const d=new Date(iso);if(!Number.isFinite(d.getTime()))return null;return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
const dayIndex=(day:string)=>Math.floor(Date.parse(day+'T12:00:00Z')/86400000);
const monday=(day:string)=>{const d=new Date(day+'T12:00:00Z');const offset=(d.getUTCDay()+6)%7;d.setUTCDate(d.getUTCDate()-offset);return d.toISOString().slice(0,10);};
const zeroActivity=():Record<StatsActivity,number>=>({Musculation:0,Tapis:0,Vélo:0,Randonnée:0,Autre:0});
const activity=(id:string,kind:'musculation'|'cardio'):StatsActivity=>{if(kind==='musculation')return 'Musculation';if(id.includes('tapis'))return 'Tapis';if(id.includes('velo')||id.includes('vélo'))return 'Vélo';if(id.includes('randonnee')||id.includes('randonnée'))return 'Randonnée';return 'Autre';};
const validated=(set:{validated?:boolean})=>set.validated!==false; // Legacy 2-D saves omitted the flag.
function workPresent(s:Execution):boolean {
 if(s.exerciseResults?.some(r=>r.sets.some(validated)))return true;
 return !!s.cardioResults?.some(r=>finiteNonnegative(r.durationMinutes)&&r.durationMinutes>0||finiteNonnegative(r.distanceKm)&&r.distanceKm>0);
}
/** The period is inclusive and is interpreted in local calendar days. */
export function calculateStats(executions:readonly Execution[],planned:readonly PlannedStatsRecord[],period:StatsPeriod,asOf=new Date()):StatsSummary {
 if(!validDay(period.start)||!validDay(period.end)||period.start>period.end)throw new Error('Période statistique invalide.');
 const today=localDay(asOf.toISOString());if(!today)throw new Error('Date de référence invalide.');
 const activitySessions=zeroActivity(),activityMinutes=zeroActivity();
 const weekCounts=new Map<string,number>();
 let sessions=0,completeSessions=0,partialSessions=0,strengthSets=0,nominalVolumeKgReps=0,isometricSeconds=0;
 let elapsedMs=0,recordedActiveMs=0,recordedPauseMs=0,durationsRecorded=0,cardioDurationMinutes=0,cardioDistanceKm=0,cardioAscentM=0;
 let cardioDurationKnown=false,cardioDistanceKnown=false,cardioAscentKnown=false;
 const fulfilled=new Set<string>();
 for(const s of executions){
  if(s.status!=='completed'&&s.status!=='partial')continue;
  const day=localDay(s.endedAt||s.updatedAt||s.startedAt);if(!day||day<period.start||day>period.end||!workPresent(s))continue;
  sessions++;if(s.status==='partial')partialSessions++;else completeSessions++;
  if(s.plannedId)fulfilled.add(s.plannedId);
  const week=monday(day);weekCounts.set(week,(weekCounts.get(week)||0)+1);
  if(finiteNonnegative(s.activeMs)&&finiteNonnegative(s.pauseMs)){
   recordedActiveMs+=s.activeMs;recordedPauseMs+=s.pauseMs;elapsedMs+=s.activeMs+s.pauseMs;durationsRecorded++;
  }
  const used=new Set<StatsActivity>();
  s.targets.forEach((t,i)=>{
   const kind=s.exerciseKinds?.[i]||((s.cardioResults||[]).some(r=>r.index===i)?'cardio':'musculation');
   const category=activity(t.exerciseId,kind);const result=s.exerciseResults?.find(r=>r.index===i);
   const sets=kind==='musculation'?(result?.sets||[]).filter(validated):[];
   if(sets.length){used.add(category);strengthSets+=sets.length;
    for(const set of sets){if(finiteNonnegative(set.durationSeconds))isometricSeconds+=set.durationSeconds;
     if(finiteNonnegative(set.reps)&&finiteNonnegative(set.loadKg))nominalVolumeKgReps+=set.reps*set.loadKg;
    }
   }
   const cardio=kind==='cardio'?s.cardioResults?.find(r=>r.index===i):undefined;
   if(cardio){let hasCardio=false;
    if(finiteNonnegative(cardio.durationMinutes)){cardioDurationKnown=true;cardioDurationMinutes+=cardio.durationMinutes;activityMinutes[category]+=cardio.durationMinutes;hasCardio=hasCardio||cardio.durationMinutes>0;}
    if(finiteNonnegative(cardio.distanceKm)){cardioDistanceKnown=true;cardioDistanceKm+=cardio.distanceKm;hasCardio=hasCardio||cardio.distanceKm>0;}
    if(finiteNonnegative(cardio.ascentM)){cardioAscentKnown=true;cardioAscentM+=cardio.ascentM;}
    if(hasCardio)used.add(category);
   }
  });
  // One session may contain several activities; each category is counted at most once.
  for(const category of used)activitySessions[category]++;
 }
 let plannedDue=0,plannedFulfilled=0;
 const seen=new Set<string>();
 for(const p of planned){if(seen.has(p.id)||!validDay(p.date)||p.date<period.start||p.date>period.end||p.date>today||p.status==='cancelled')continue;
  seen.add(p.id);plannedDue++;if(fulfilled.has(p.id))plannedFulfilled++;
 }
 const days=dayIndex(period.end)-dayIndex(period.start)+1;
 return {period,sessions,completeSessions,partialSessions,strengthSets,nominalVolumeKgReps,isometricSeconds,
  elapsedMs:durationsRecorded?elapsedMs:null,recordedActiveMs:durationsRecorded?recordedActiveMs:null,recordedPauseMs:durationsRecorded?recordedPauseMs:null,restMs:null,
  durationsRecorded,cardioDurationMinutes:cardioDurationKnown?cardioDurationMinutes:null,cardioDistanceKm:cardioDistanceKnown?cardioDistanceKm:null,cardioAscentM:cardioAscentKnown?cardioAscentM:null,
  plannedDue,plannedFulfilled,adherencePct:plannedDue?100*plannedFulfilled/plannedDue:null,
  sessionsPerWeek:sessions*7/days,byWeek:[...weekCounts].sort(([a],[b])=>a.localeCompare(b)).map(([week,count])=>({week,sessions:count})),activitySessions,activityMinutes};
}
export function rollingPeriod(days:7|28|56|84,asOf=new Date()):StatsPeriod {
 const end=localDay(asOf.toISOString());if(!end)throw new Error('Date de référence invalide.');
 const d=new Date(end+'T12:00:00Z');d.setUTCDate(d.getUTCDate()-(days-1));return {start:d.toISOString().slice(0,10),end};
}

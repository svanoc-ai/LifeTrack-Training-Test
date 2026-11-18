import { test, expect } from '@playwright/test';

// These checks execute the actual recommendation module in the Vite-served browser.
// They use fabricated completed sessions, never the user's IndexedDB or production URL.
type Scenario = { count:number; target:number; actual:number[]; rir:number[]; load?:number; goalRir?:number };
async function recommendation(page: import('@playwright/test').Page, scenarios:Scenario[]) {
  await page.goto('/');
  return page.evaluate(async (scenarios) => {
    const {recommendProgression} = await import('/src/recommendations.ts');
    const history = scenarios.map((s,i) => {
      const time = new Date(Date.UTC(2026,10,1+i)).toISOString();
      return {
        id:`auto-${i}`,templateId:'auto',plannedId:null,name:'Test automatique',
        targets:[{exerciseId:'auto-exercise',order:0,sets:s.count,reps:s.target,loadKg:s.load??40,rir:s.goalRir??2}],
        startedAt:time,updatedAt:time,endedAt:time,status:'completed' as const,
        activeMs:1000,pauseMs:0,lastTick:time,completedIndexes:[0],manualDuration:false,
        exerciseResults:[{index:0,sets:s.actual.map((reps,n)=>({set:n+1,reps,loadKg:s.load??40,rir:s.rir[n],validated:true}))}]
      };
    });
    return recommendProgression(history,'auto-exercise');
  },scenarios);
}
const example=(count:number,target:number,actual:number[]=Array(count).fill(target)):Scenario=>({count,target,actual,rir:Array(count).fill(3)});

test('AUTO-04 : deux séries conservées dans la recommandation',async ({page})=>{
  const r=await recommendation(page,[example(2,6)]);
  expect(r.kind).toBe('increase-reps');
  expect(r.detail).toContain('2 × 8');
  expect(r.detail).not.toContain('3 × 8');
});

test('AUTO-05 : palier deux fois huit vers deux fois dix',async ({page})=>{
  const r=await recommendation(page,[example(2,8)]);
  expect(r.kind).toBe('increase-reps');
  expect(r.detail).toContain('2 × 10');
});

test('AUTO-06 : palier trois fois dix vers trois fois douze',async ({page})=>{
  const r=await recommendation(page,[example(3,10)]);
  expect(r.kind).toBe('increase-reps');
  expect(r.detail).toContain('3 × 12');
});

test('AUTO-07 : quatre séries incomplètes imposent consolidation',async ({page})=>{
  const r=await recommendation(page,[example(4,10,[10,10,9,8])]);
  expect(r.kind).toBe('repeat');
  expect(r.detail).toContain('4 séries');
});

test('AUTO-08 : palier maximal confirmé sur deux séances avant augmentation',async ({page})=>{
  const once=await recommendation(page,[example(2,15)]);
  expect(once.kind).toBe('repeat');
  expect(once.title).toContain('Confirmer');
  const twice=await recommendation(page,[example(2,15),example(2,15)]);
  expect(twice.kind).toBe('increase-load');
  expect(twice.detail).toContain('2 × 15');
});

test('AUTO-09 : RIR insuffisant bloque le palier suivant',async ({page})=>{
  const s=example(3,12);s.rir=[3,1,3];
  const r=await recommendation(page,[s]);
  expect(r.kind).toBe('repeat');
  expect(r.title).toContain('Consolider');
});

test('AUTO-10 : le champ de repos accepte la saisie sans zéro initial',async ({page})=>{
  await page.goto('/');
  await page.locator('.bottom-nav').getByRole('button',{name:'Prog',exact:true}).click();
  const templates=page.locator('.panel').filter({has:page.getByRole('heading',{name:'Séances types',exact:true})});
  await templates.getByRole('button',{name:/Créer/}).click();
  const picker=templates.getByRole('combobox',{name:'Exercice à ajouter'});
  const choices=await picker.locator('option').evaluateAll(options=>options.map(o=>({value:(o as HTMLOptionElement).value,text:o.textContent||''})).filter(o=>o.value));
  expect(choices.length).toBeGreaterThan(0);
  await picker.selectOption(choices[0].value);
  await templates.getByRole('button',{name:'Ajouter',exact:true}).click();
  await picker.selectOption(choices[0].value);
  await templates.getByRole('button',{name:'Ajouter',exact:true}).click();
  const blocks=templates.getByLabel('Organisation');
  await blocks.nth(0).selectOption('A');
  await blocks.nth(1).selectOption('A');
  const rest=templates.getByLabel('Repos entre exercices (s)').first();
  await rest.fill('15');
  await expect(rest).toHaveValue('15');
  await rest.fill('0');
  await expect(rest).toHaveValue('0');
});

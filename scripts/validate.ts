/* Data checks + engine smoke tests. Run with: npm run validate */
import { RECIPES } from '../src/data/recipes';
import { INGREDIENT_BY_ID, SAMPLE_FRIDGE } from '../src/data/ingredients';
import { SEASONINGS, DEFAULT_OWNED } from '../src/data/seasonings';
import { recommend, evaluate } from '../src/domain/recommend';
import { scaleText } from '../src/domain/scale';
import type { InventoryItem } from '../src/domain/types';

const errors: string[] = [];
const seasonIds = new Set(SEASONINGS.map((s) => s.id));
const ids = new Set<string>();
const counts: Record<string, number> = {};

for (const r of RECIPES) {
  if (ids.has(r.id)) errors.push(`duplicate id ${r.id}`);
  ids.add(r.id);
  counts[r.cuisine] = (counts[r.cuisine] ?? 0) + 1;
  if (!r.steps.length) errors.push(`${r.id}: no steps`);
  if (!r.ingredients.some((x) => !x.optional)) errors.push(`${r.id}: no required ingredients`);
  for (const ing of r.ingredients) {
    const cat = INGREDIENT_BY_ID[ing.ingredientId];
    if (!cat) { errors.push(`${r.id}: unknown ingredient ${ing.ingredientId}`); continue; }
    if (cat.unit !== ing.unit) errors.push(`${r.id}: ${ing.ingredientId} unit ${ing.unit} != ${cat.unit}`);
    if (!(ing.quantity > 0)) errors.push(`${r.id}: ${ing.ingredientId} quantity`);
    for (const a of ing.alt ?? []) {
      const alt = INGREDIENT_BY_ID[a];
      if (!alt) errors.push(`${r.id}: unknown alt ${a}`);
      else if (alt.unit !== cat.unit && !(alt.gramsPerUnit && cat.gramsPerUnit)) errors.push(`${r.id}: alt ${a} not convertible`);
    }
  }
  for (const s of r.seasonings) if (!seasonIds.has(s.seasoningId)) errors.push(`${r.id}: unknown seasoning ${s.seasoningId}`);
  const stepMin = r.steps.reduce((a, s) => a + (s.minutes ?? 0), 0);
  if (Math.abs(stepMin - r.minutes) > Math.max(6, r.minutes * 0.35)) errors.push(`${r.id}: minutes ${r.minutes} vs steps ${stepMin}`);
  for (const s of r.steps) {
    if ((s.temperatureC == null) !== (s.temperatureF == null)) errors.push(`${r.id}: half temperature in ${s.title}`);
    if (/cook until ready/i.test(s.text)) errors.push(`${r.id}: vague step`);
    if (/\{\{/.test(scaleText(s.text, 2))) errors.push(`${r.id}: unparsed template`);
  }
}

console.log('recipes', RECIPES.length, counts);
const want = { Chinese: 15, Japanese: 12, Korean: 10, Thai: 10, Western: 13 };
for (const [k, v] of Object.entries(want)) if (counts[k] !== v) errors.push(`cuisine ${k}: ${counts[k]} != ${v}`);

// Engine smoke tests
const now = new Date().toISOString();
const fridge: InventoryItem[] = SAMPLE_FRIDGE.map(([id, q]) => ({ ingredientId: id, quantity: q, unit: INGREDIENT_BY_ID[id].unit, updatedAt: now }));
const owned = Object.fromEntries(SEASONINGS.map((s) => [s.id, DEFAULT_OWNED.includes(s.id)]));
const f = { cuisine: 'all' as const, flavor: 'any' as const };

const a = recommend(RECIPES, fridge, owned, 1, ['tomato', 'egg'], f);
const show = (label: string, list: ReturnType<typeof evaluate>[]) =>
  console.log(label, list.map((e) => `${e.recipe.name} [${e.score.toFixed(2)} miss:${e.missing.length} short:${e.short.length} ms:${e.missingSeasonings.length} pick:${e.pickedUsed.length}]`));
console.log('\n-- picked tomato + egg, sample fridge, default seasonings');
show('use it up', a.useItUp); show('best', a.best); show('different', a.different);
if (a.useItUp[0]?.recipe.id !== 'tomato-egg-stir-fry') errors.push('tomato+egg should lead Use It Up');

const b = recommend(RECIPES, fridge, owned, 1, [], f);
console.log('\n-- nothing picked'); show('best', b.best); show('different', b.different);

// Quantity awareness: 1 egg must not give full credit to a 3-egg omelette.
const oneEgg = evaluate(RECIPES.find((r) => r.id === 'tamagoyaki')!, [{ ingredientId: 'egg', quantity: 1, unit: 'pc', updatedAt: now }], owned, 1);
console.log('\ntamagoyaki with 1 egg coverage', oneEgg.coverage.toFixed(2), oneEgg.lines[0].status);
if (oneEgg.coverage > 0.34 || oneEgg.lines[0].status !== 'short') errors.push('quantity awareness broken');

// Servings scale need
const two = evaluate(RECIPES[0], fridge, owned, 2);
console.log('tomato egg x2 needs', two.lines.map((l) => `${l.req.ingredientId}:${l.need} have ${l.have} ${l.status}`));

// Missing seasonings penalised less than missing ingredients
const r = RECIPES.find((x) => x.id === 'garlic-bok-choy')!;
const inv = [{ ingredientId: 'bok-choy', quantity: 1, unit: 'bunch' as const, updatedAt: now }];
const noGarlic = evaluate(r, inv, { ...owned, garlic: false }, 1).score;
const noBokChoy = evaluate(r, [], owned, 1).score;
console.log('missing garlic score', noGarlic.toFixed(2), 'missing bok choy score', noBokChoy.toFixed(2));
if (!(noGarlic > noBokChoy)) errors.push('seasoning penalty should be smaller');

console.log(scaleText('Add {{120 ml}} water and {{2 tbsp}} soy', 3));

if (errors.length) { console.error('\nERRORS\n' + errors.join('\n')); process.exit(1); }
console.log('\nAll checks passed.');

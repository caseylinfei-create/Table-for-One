import { INGREDIENT_BY_ID } from '../data/ingredients';
import { SEASONINGS } from '../data/seasonings';
import type { Filters, InventoryItem, Recipe, RecipeIngredient, RecipeSeasoning } from './types';

/**
 * Recommendation engine. Pure functions over recipe data and the user's kitchen,
 * so it can move to a server later unchanged.
 *
 * Score (0..1) uses the spec's starting weights:
 *   ingredient coverage 35%, picked-ingredient use 30%, missing-ingredient penalty 20%,
 *   seasoning availability 10%, variety 5% (applied while assembling sections).
 * With nothing picked, the 30% is shared out to coverage and the missing penalty.
 */
export const WEIGHTS = { coverage: 0.35, picked: 0.3, missing: 0.2, seasoning: 0.1, variety: 0.05 };

export type LineStatus = 'have' | 'short' | 'missing';

export type IngredientLine = {
  req: RecipeIngredient;
  need: number;        // scaled, in req.unit
  have: number;        // in req.unit, alternatives converted by weight
  status: LineStatus;
  /** Which of the primary/alternative ingredients the user actually has the most of. */
  usingId: string;
};

export type SeasoningLine = { req: RecipeSeasoning; have: boolean };

export type Evaluation = {
  recipe: Recipe;
  lines: IngredientLine[];
  seasonings: SeasoningLine[];
  coverage: number;
  missing: IngredientLine[];        // required, none on hand
  short: IngredientLine[];          // required, some but not enough
  missingSeasonings: SeasoningLine[]; // required only
  pickedUsed: string[];             // picked ingredient ids this recipe uses
  score: number;
  everything: boolean;
};

const SEASONING_IDS = new Set(SEASONINGS.map((s) => s.id));

function qtyOf(inv: Map<string, number>, id: string) {
  return inv.get(id) ?? 0;
}

/** Amount on hand expressed in the primary ingredient's unit. */
function onHand(req: RecipeIngredient, inv: Map<string, number>): { have: number; usingId: string } {
  const primary = INGREDIENT_BY_ID[req.ingredientId];
  let have = qtyOf(inv, req.ingredientId);
  let usingId = req.ingredientId;
  let best = have;
  for (const altId of req.alt ?? []) {
    const alt = INGREDIENT_BY_ID[altId];
    const q = qtyOf(inv, altId);
    if (!alt || q <= 0) continue;
    let converted = 0;
    if (alt.unit === primary.unit) converted = q;
    else if (alt.gramsPerUnit && primary.gramsPerUnit) converted = (q * alt.gramsPerUnit) / primary.gramsPerUnit;
    have += converted;
    if (converted > best) { best = converted; usingId = altId; }
  }
  return { have, usingId };
}

export function evaluate(
  recipe: Recipe,
  inventory: InventoryItem[],
  seasonings: Record<string, boolean>,
  servings: number,
  picked: string[] = [],
): Evaluation {
  const inv = new Map(inventory.filter((i) => i.quantity > 0).map((i) => [i.ingredientId, i.quantity]));

  const lines: IngredientLine[] = recipe.ingredients.map((req) => {
    const need = req.quantity * servings;
    const { have, usingId } = onHand(req, inv);
    const status: LineStatus = have <= 0 ? 'missing' : have + 1e-6 >= need ? 'have' : 'short';
    return { req, need, have, status, usingId };
  });
  const required = lines.filter((l) => !l.req.optional);
  const coverage = required.length
    ? required.reduce((sum, l) => sum + Math.min(1, l.have / l.need), 0) / required.length
    : 1;
  const missing = required.filter((l) => l.status === 'missing');
  const short = required.filter((l) => l.status === 'short');

  const seasonLines: SeasoningLine[] = recipe.seasonings.map((req) => ({ req, have: !!seasonings[req.seasoningId] }));
  const reqSeason = seasonLines.filter((s) => !s.req.optional);
  const missingSeasonings = reqSeason.filter((s) => !s.have);
  const seasonScore = reqSeason.length ? (reqSeason.length - missingSeasonings.length) / reqSeason.length : 1;

  // An ingredient counts as "used" when it or one of its alternatives appears in the recipe.
  const uses = new Set(recipe.ingredients.flatMap((r) => [r.ingredientId, ...(r.alt ?? [])]));
  const pickedUsed = picked.filter((id) => uses.has(id));

  // Each fully missing ingredient costs 40% of the penalty band.
  const missingScore = Math.max(0, 1 - 0.4 * missing.length);

  let score: number;
  if (picked.length) {
    const pickedScore = pickedUsed.length / picked.length;
    score =
      WEIGHTS.coverage * coverage +
      WEIGHTS.picked * pickedScore +
      WEIGHTS.missing * missingScore +
      WEIGHTS.seasoning * seasonScore;
  } else {
    // Redistribute the picked weight in proportion to coverage and missing.
    const c = WEIGHTS.coverage + WEIGHTS.picked * (WEIGHTS.coverage / (WEIGHTS.coverage + WEIGHTS.missing));
    const m = WEIGHTS.missing + WEIGHTS.picked * (WEIGHTS.missing / (WEIGHTS.coverage + WEIGHTS.missing));
    score = c * coverage + m * missingScore + WEIGHTS.seasoning * seasonScore;
  }

  return {
    recipe,
    lines,
    seasonings: seasonLines,
    coverage,
    missing,
    short,
    missingSeasonings,
    pickedUsed,
    score,
    everything: missing.length === 0 && short.length === 0 && missingSeasonings.length === 0,
  };
}

export function matchesFilters(r: Recipe, f: Filters) {
  return (f.cuisine === 'all' || r.cuisine === f.cuisine) && (f.flavor === 'any' || r.flavor === f.flavor);
}

export type Sections = {
  useItUp: Evaluation[];
  best: Evaluation[];
  different: Evaluation[];
  all: Evaluation[];
};

/**
 * Builds the three result groups, about 10-12 recipes in total.
 * Families are never repeated across groups, and each additional recipe from an
 * already-shown cuisine loses a little score (the 5% variety weight).
 */
export function recommend(
  recipes: Recipe[],
  inventory: InventoryItem[],
  seasonings: Record<string, boolean>,
  servings: number,
  picked: string[],
  filters: Filters,
): Sections {
  const all = recipes
    .filter((r) => matchesFilters(r, filters))
    .map((r) => evaluate(r, inventory, seasonings, servings, picked))
    .sort((a, b) => b.score - a.score);

  const shownFamilies = new Set<string>();
  const cuisineCount = new Map<string, number>();
  const take = (pool: Evaluation[], n: number, key: (e: Evaluation) => number) => {
    const out: Evaluation[] = [];
    const remaining = pool.filter((e) => !shownFamilies.has(e.recipe.family));
    while (out.length < n && remaining.length) {
      remaining.sort((a, b) => adjusted(b) - adjusted(a));
      const next = remaining.shift()!;
      if (shownFamilies.has(next.recipe.family)) continue;
      out.push(next);
      shownFamilies.add(next.recipe.family);
      cuisineCount.set(next.recipe.cuisine, (cuisineCount.get(next.recipe.cuisine) ?? 0) + 1);
    }
    return out;
    function adjusted(e: Evaluation) {
      const seen = cuisineCount.get(e.recipe.cuisine) ?? 0;
      return key(e) - WEIGHTS.variety * Math.min(1, seen / 3);
    }
  };

  // Use It Up: recipes that use the most picked ingredients.
  const useItUp = picked.length
    ? take(all.filter((e) => e.pickedUsed.length > 0), 4, (e) => e.pickedUsed.length / picked.length * 0.6 + e.score * 0.4)
    : [];

  // Best Matches: fewest things to buy, then score.
  const best = take(all, picked.length ? 4 : 6, (e) => e.score - 0.12 * (e.missing.length + 0.5 * e.short.length) - 0.03 * e.missingSeasonings.length);

  // Something Different: achievable (at most 2 missing) and from cuisines not yet featured much.
  const featured = new Set([...useItUp, ...best].map((e) => e.recipe.cuisine));
  const diffPool = all.filter((e) => e.missing.length <= 2);
  const different = take(
    diffPool,
    3,
    (e) => e.score + (featured.has(e.recipe.cuisine) ? 0 : 0.15),
  );

  return { useItUp, best, different, all };
}

/** Recipe ids referenced by data are checked against catalogs in scripts/validate. */
export function isSeasoningId(id: string) {
  return SEASONING_IDS.has(id);
}

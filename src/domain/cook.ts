import { INGREDIENT_BY_ID } from '../data/ingredients';
import { evaluate } from './recommend';
import type { InventoryItem, Recipe, RecipeStep, TimerState } from './types';

/* ---------------------------------------------------------------- timers */

export function remainingMs(t: TimerState | undefined, now: number): number {
  if (!t) return 0;
  if (t.endsAt != null) return Math.max(0, t.endsAt - now);
  return t.remainingMs;
}
export const isRunning = (t: TimerState | undefined, now: number) => !!t && t.endsAt != null && t.endsAt > now;
export const isFinished = (t: TimerState | undefined, now: number) =>
  !!t && ((t.endsAt != null && t.endsAt <= now) || (t.endsAt == null && t.remainingMs <= 0));

export function startTimer(t: TimerState | undefined, durationMs: number, now: number): TimerState {
  const base = t && t.remainingMs > 0 ? t : { durationMs, remainingMs: durationMs };
  return { ...base, endsAt: now + base.remainingMs };
}
export function pauseTimer(t: TimerState, now: number): TimerState {
  return { durationMs: t.durationMs, remainingMs: remainingMs(t, now) };
}
export function resetTimer(durationMs: number): TimerState {
  return { durationMs, remainingMs: durationMs };
}

export function formatClock(ms: number): string {
  const total = Math.ceil(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = h ? String(m).padStart(2, '0') : String(m);
  return `${h ? `${h}:` : ''}${mm}:${String(s).padStart(2, '0')}`;
}

/* ----------------------------------------------------------------- usage */

export type UsageRow = {
  ingredientId: string;     // the item actually in the fridge (may be an alternative)
  recipeIngredientId: string;
  before: number;
  estimate: number;
  optional: boolean;
};

/**
 * What the recipe probably used from the fridge, in each fridge item's own unit.
 * Never more than is on hand. Alternatives are converted by estimated weight.
 */
export function estimateUsage(recipe: Recipe, inventory: InventoryItem[], seasonings: Record<string, boolean>, servings: number) {
  const e = evaluate(recipe, inventory, seasonings, servings);
  const rows: UsageRow[] = [];
  const notInFridge: string[] = [];
  for (const l of e.lines) {
    const item = inventory.find((i) => i.ingredientId === l.usingId && i.quantity > 0);
    if (!item) {
      if (!l.req.optional) notInFridge.push(l.req.ingredientId);
      continue;
    }
    const primary = INGREDIENT_BY_ID[l.req.ingredientId];
    const using = INGREDIENT_BY_ID[l.usingId];
    let need = l.need;
    if (using.unit !== primary.unit && using.gramsPerUnit && primary.gramsPerUnit) {
      need = (l.need * primary.gramsPerUnit) / using.gramsPerUnit;
    }
    const stepped = Math.round(need / using.step) * using.step || using.step;
    rows.push({
      ingredientId: l.usingId,
      recipeIngredientId: l.req.ingredientId,
      before: item.quantity,
      estimate: Math.min(item.quantity, round(stepped)),
      optional: !!l.req.optional,
    });
  }
  return { rows, notInFridge };
}

const round = (n: number) => Math.round(n * 100) / 100;

/* -------------------------------------------------------------- dialogue */

export function cookLine(step: RecipeStep, index: number, total: number, timerDone: boolean, chefLines: string[]): string {
  if (timerDone) return 'Ding! That’s time.';
  if (index === 0) return 'Prep first. Then greatness.';
  if (index === total - 1) return 'Last step. Smells great already.';
  if (step.tempLabel?.toLowerCase().includes('internal')) return 'Check the temperature. Better safe than sorry.';
  if (step.heat === 'High') return 'High heat. Keep it moving.';
  if (step.heat === 'Low' || step.heat === 'Medium-low') return 'Low and slow. No rush.';
  if (step.heat === 'Off') return 'Heat off. The finishing touch.';
  return chefLines[index % chefLines.length];
}

export function weekday(d = new Date()) {
  return d.toLocaleDateString('en-US', { weekday: 'long' });
}

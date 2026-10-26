import type { Ingredient, Unit } from './types';

const FRACTIONS: Record<string, string> = { '0.13': '⅛', '0.25': '¼', '0.33': '⅓', '0.38': '⅜', '0.5': '½', '0.63': '⅝', '0.67': '⅔', '0.75': '¾', '0.88': '⅞' };

/** 1.5 → "1½", 0.25 → "¼", 3 → "3" */
export function formatQty(q: number): string {
  const whole = Math.floor(q + 1e-9);
  const frac = Math.round((q - whole) * 100) / 100;
  const f = FRACTIONS[String(frac)];
  if (frac === 0) return String(whole);
  if (f) return whole === 0 ? f : `${whole}${f}`;
  return String(Math.round(q * 100) / 100);
}

const PLURAL: Partial<Record<Unit, string>> = {
  handful: 'handfuls', bunch: 'bunches', stalk: 'stalks', slice: 'slices', bowl: 'bowls',
  pack: 'packs', can: 'cans', serving: 'servings', head: 'heads', cup: 'cups', sheet: 'sheets',
};

export function formatUnit(unit: Unit, q: number): string {
  if (unit === 'pc') return 'pc';
  return q > 1 ? PLURAL[unit] ?? unit : unit;
}

export function stepUp(ing: Ingredient, q: number): number {
  return round(q + ing.step);
}

export function stepDown(ing: Ingredient, q: number): number {
  return Math.max(0, round(q - ing.step));
}

function round(n: number) {
  return Math.round(n * 100) / 100;
}

/** Estimated grams for a quantity. Returns null when no estimate exists. */
export function estimateGrams(ing: Ingredient, q: number): number | null {
  return ing.gramsPerUnit ? Math.round(ing.gramsPerUnit * q) : null;
}

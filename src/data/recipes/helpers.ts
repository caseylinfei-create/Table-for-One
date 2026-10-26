import { INGREDIENT_BY_ID } from '../ingredients';
import type { Heat, Recipe, RecipeIngredient, RecipeSeasoning, RecipeStep, SeasUnit } from '../../domain/types';

/** Required ingredient, per one serving. The unit is always the catalog unit, so matching is direct. */
export const i = (ingredientId: string, quantity: number, o: { alt?: string[] } = {}): RecipeIngredient => ({
  ingredientId,
  quantity,
  unit: INGREDIENT_BY_ID[ingredientId]?.unit ?? 'pc',
  ...o,
});
/** Optional ingredient. */
export const io = (ingredientId: string, quantity: number, o: { alt?: string[] } = {}): RecipeIngredient => ({
  ...i(ingredientId, quantity, o),
  optional: true,
});

export const s = (seasoningId: string, amount?: number, unit?: SeasUnit): RecipeSeasoning => ({ seasoningId, amount, unit });
export const so = (seasoningId: string, amount?: number, unit?: SeasUnit): RecipeSeasoning => ({ ...s(seasoningId, amount, unit), optional: true });

type StepOpts = { heat?: Heat; min?: number; c?: number; f?: number; label?: string; note?: string };
export const st = (title: string, text: string, o: StepOpts = {}): RecipeStep => ({
  title,
  text,
  heat: o.heat,
  minutes: o.min,
  temperatureC: o.c,
  temperatureF: o.f,
  tempLabel: o.label,
  note: o.note,
});

/* Food-safety temperatures (USDA guidance) */
export const CHICKEN = { c: 74, f: 165, label: 'Chicken, internal' };
export const FISH = { c: 63, f: 145, label: 'Fish, internal' };
export const GROUND = { c: 71, f: 160, label: 'Ground meat, internal' };
export const PORK = { c: 63, f: 145, label: 'Pork, internal' };

export const recipe = (r: Omit<Recipe, 'image'> & { image?: string }): Recipe => ({ image: '', ...r });

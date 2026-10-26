import type { Cuisine, Recipe } from '../../domain/types';
import { CHINESE } from './chinese';
import { JAPANESE } from './japanese';
import { KOREAN } from './korean';
import { THAI } from './thai';
import { WESTERN } from './western';

export const RECIPES: Recipe[] = [...CHINESE, ...JAPANESE, ...KOREAN, ...THAI, ...WESTERN];
export const RECIPE_BY_ID: Record<string, Recipe> = Object.fromEntries(RECIPES.map((r) => [r.id, r]));
export const CUISINES: Cuisine[] = ['Chinese', 'Japanese', 'Korean', 'Thai', 'Western'];

export type Unit =
  | 'pc' | 'handful' | 'bunch' | 'stalk' | 'slice' | 'bowl'
  | 'pack' | 'can' | 'serving' | 'head' | 'cup' | 'sheet';

export type CategoryId =
  | 'vegetables' | 'fruits' | 'meat' | 'seafood' | 'eggs-dairy'
  | 'grains' | 'tofu-beans' | 'frozen' | 'other';

/** Shape keys used by the small ingredient icon renderer. */
export type IconShape =
  | 'round' | 'leafy' | 'root' | 'stalk' | 'head' | 'long' | 'egg' | 'carton'
  | 'meat' | 'fish' | 'shrimp' | 'grain' | 'block' | 'can' | 'bag' | 'mushroom'
  | 'noodle' | 'slice' | 'bowl' | 'beans' | 'citrus' | 'banana';

export type Ingredient = {
  id: string;
  name: string;
  category: CategoryId;
  unit: Unit;
  /** Increment used by the − / + controls. */
  step: number;
  /** Quantity added when the item is first put in the fridge. */
  defaultQty: number;
  /** Rough weight of one unit in grams. An estimate for recipe math, never shown as exact. */
  gramsPerUnit?: number;
  icon: IconShape;
  color: string;
  aliases?: string[];
};

export type InventoryItem = {
  ingredientId: string;
  quantity: number;
  unit: Unit;
  updatedAt: string;
};

export type SeasoningGroup = 'basics' | 'fresh' | 'asian' | 'western';

export type ContainerShape =
  | 'bottle' | 'tall-bottle' | 'shaker' | 'jar' | 'squeeze' | 'bulb'
  | 'root' | 'block' | 'tub' | 'pouch' | 'grinder' | 'chili';

export type Seasoning = {
  id: string;
  name: string;
  group: SeasoningGroup;
  shape: ContainerShape;
  color: string;
  /** Label/cap accent */
  accent: string;
};

export type ChefId =
  | 'wok' | 'market' | 'line' | 'whisk' | 'noodle'
  | 'shortcake' | 'simmer' | 'piper' | 'herb' | 'bakery';
export type Pet = 'none' | 'cat' | 'dog';
export type Servings = 1 | 2 | 3;

export type Profile = {
  chefId: ChefId;
  surname: string;
  pet: Pet;
};

/* ------------------------------------------------------------- recipes */

export type Cuisine = 'Chinese' | 'Japanese' | 'Korean' | 'Thai' | 'Western';
export type Flavor = 'light' | 'bold';
export type Heat = 'Off' | 'Low' | 'Medium-low' | 'Medium' | 'Medium-high' | 'High' | 'Oven';
export type SeasUnit = 'tsp' | 'tbsp' | 'clove' | 'slice' | 'pinch' | 'pc';

export type RecipeIngredient = {
  ingredientId: string;
  /** Per one serving, in the ingredient's own catalog unit. */
  quantity: number;
  unit: Unit;
  optional?: boolean;
  /** Interchangeable ingredients (e.g. firm tofu for silken). Matched by estimated weight. */
  alt?: string[];
};

export type RecipeSeasoning = {
  seasoningId: string;
  /** Per one serving. */
  amount?: number;
  unit?: SeasUnit;
  optional?: boolean;
};

export type RecipeStep = {
  title: string;
  /** May contain scalable amounts written as {{120 ml}} or {{2 tbsp}}. */
  text: string;
  heat?: Heat;
  temperatureC?: number;
  temperatureF?: number;
  /** What the temperature refers to: oil, oven, internal, doneness. */
  tempLabel?: string;
  minutes?: number;
  note?: string;
};

export type DishVessel = 'plate' | 'bowl' | 'soup' | 'pan' | 'noodles';

export type Recipe = {
  id: string;
  name: string;
  cuisine: Cuisine;
  flavor: Flavor;
  minutes: number;
  /** Real photo path. Empty until licensed photography is added; UI falls back to an illustrated plate. */
  image: string;
  /** Near-identical dishes share a family so results never show two of them. */
  family: string;
  blurb: string;
  /** Drives the illustrated placeholder. */
  look: { vessel: DishVessel; colors: string[] };
  ingredients: RecipeIngredient[];
  seasonings: RecipeSeasoning[];
  steps: RecipeStep[];
  note?: string;
};

/* ------------------------------------------------------------ shopping */

export type ShoppingItem = {
  id: string;
  kind: 'ingredient' | 'seasoning';
  refId: string;
  quantity?: number;
  unit?: Unit;
  purchased: boolean;
  /** How much was put into the fridge when checked, so unchecking can undo it exactly once. */
  addedQty?: number;
  fromRecipes: string[];
  createdAt: string;
};

export type Filters = { cuisine: Cuisine | 'all'; flavor: Flavor | 'any' };

/* ---------------------------------------------------------- cook mode */

/** Timers store an end timestamp while running, so they stay correct across reloads and backgrounding. */
export type TimerState = {
  durationMs: number;
  /** Remaining time when paused or not started. */
  remainingMs: number;
  /** Epoch ms when it will hit zero; set only while running. */
  endsAt?: number;
};

export type CookSession = {
  id: string;
  recipeId: string;
  servings: Servings;
  step: number;
  timers: Record<number, TimerState>;
  startedAt: string;
  phase: 'cooking' | 'confirm' | 'done';
  /** Set once inventory has been deducted. Guarantees a single deduction per session. */
  deductedAt?: string;
  /** What was actually subtracted, for the Enjoy screen. */
  usage?: { ingredientId: string; before: number; used: number }[];
};

export type AppData = {
  version: 1;
  profile: Profile | null;
  inventory: InventoryItem[];
  /** seasoningId → true when the user has it */
  seasonings: Record<string, boolean>;
  servings: Servings;
  shopping: ShoppingItem[];
  filters: Filters;
  cook: CookSession | null;
  saved: string[];
  /** Look of the app. 'auto' follows the phone clock: Diner by day, Night Kitchen in the evening. */
  palette: 'auto' | 'diner' | 'night';
  /** Simple cooking log, newest first. */
  history: { recipeId: string; at: string }[];
};

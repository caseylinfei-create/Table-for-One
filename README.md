# Table for One · Phase 4

Cozy kitchen, working fridge inventory, seasoning rack. Mobile-first React + TypeScript.

## Run it

```bash
npm install
npm run dev          # opens on your network, so you can test on your phone
npm run build        # production build in dist/
npm run build:single # one self-contained HTML file in dist-single/
npm run validate     # checks all recipe data and runs engine tests
```

Requires Node 18+.

## What works in Phase 1

| Feature | Status |
| --- | --- |
| First-launch setup (chef, surname, pet) on one screen | Working |
| Ten chefs (5 male, 5 female), All / Female / Male filter; change later in Profile | Working |
| Kitchen home with open fridge, parallax layers, ambient motion | Working |
| Fridge reflects inventory (eggs, tomatoes, milk, etc. appear on shelves) | Working |
| Fridge mode: search, categories, pick ingredients, − / + quantities | Working |
| Add groceries from 90+ ingredient catalog | Working |
| Sample fridge for a quick start | Working |
| Seasoning rack, 29 seasonings, Have it / Need it toggle | Working |
| Serving size (Just me / 2 / 3), remembered | Working |
| localStorage persistence behind a swappable StorageAdapter | Working |
| Reduced-motion support, labeled controls | Working |
| Landscape / tablet split layout | Working |
| Picked ingredients | Kept in memory only for now, by decision |

## What works in Phase 2

| Feature | Status |
| --- | --- |
| 60 recipes (Chinese 15, Japanese 12, Korean 10, Thai 10, Western 13) in `src/data/recipes/` | Working |
| Steps with heat, °C/°F, durations, food-safety notes; amounts scale with servings | Working |
| Recommendation engine: quantity-aware coverage, picked-ingredient priority, seasoning-aware, alternatives by weight | Working |
| Result groups: Use It Up, Best Matches, Something Different; no near-duplicate dishes | Working |
| Cuisine and flavor filters (saved, default All / Any) | Working |
| Recipe detail: 1/2/3 servings, Have / Short / Missing per ingredient, seasonings, step preview | Working |
| Add Missing Items to shopping list, merges duplicates | Working |
| Shopping list: checking adds to fridge or shelf once; unchecking undoes it | Working |
| Surprise Me from the kitchen | Working |
| Recipes tab: all 60, searchable, ranked by fit | Working |
| Food photography | Placeholder: labeled illustrations. Set `image` on a recipe to show a photo |

## What works in Phase 3

| Feature | Status |
| --- | --- |
| Cook Mode: one step per screen, progress bar, tap any segment to jump | Working |
| Heat level with dial, °C / °F temperature with label (oil, oven, internal, doneness) | Working |
| Timers: start, pause, resume, reset; based on end timestamps so they stay right after backgrounding or reload | Working |
| Alarm at zero: chime, vibration where supported, visual pulse; other steps' timers shown in a strip | Working |
| Screen kept awake while cooking where the browser allows | Working |
| Leave and resume: session saved, "On the stove" banner in the kitchen | Working |
| Ingredients drawer scaled to the session's servings | Working |
| Finish: Before / Used / After per fridge item, adjustable, nothing changes until confirmed | Working |
| Deduction happens once per session (guarded by `deductedAt`) | Working |
| Enjoy screen with dish, chef, pet, fridge changes; Save Recipe; Saved filter in Recipes | Working |

## What changed in Phase 4

| Area | What's new |
| --- | --- |
| Chef | Idle sway and breathing, squash-and-stretch on tap, a nod each time you pick an ingredient, a nod per cook step, a cheer when a timer ends and on the Enjoy screen |
| Pets | Tap to pet: hop or wiggle, hearts, a short line. Awake with open eyes by day; asleep with floating Zzz in Night Kitchen, and a tap wakes them for a few seconds |
| Kitchen art | Wall clock showing the real time; sun and drifting clouds by day, moon and twinkling stars at night; checkered floor in Diner; stronger fridge glow at night |
| Transitions | Forward slides in from the right, Back from the left, tabs fade; kitchen to fridge leans into the fridge; cook mode rises in |
| Shopping list | Add any ingredient or seasoning by search, edit quantities, "−" becomes delete at the minimum, Undo after removing, progress bar, Bought everything, Copy list |
| Layout | Landscape phones get a slim tab bar and scaled speech bubbles; upright tablets get a centered single column; side-by-side splits only on wide screens |
| Accessibility | axe scan clean on every main screen in both looks (WCAG 2 A/AA + best practices); one h1 and main landmark per screen; focus moves to the new screen's heading; 44 px controls; speech bubbles no longer block taps |
| Performance | Parallax limited to one update per frame; off-screen recipe cards skip layout and paint; fonts self-hosted, latin subset only |

Not done, needs new art: full-body poses (chef turning around, stirring a pot, holding coffee). The cutouts are single poses, so motion is limited to transforms.

## Looks: Diner and Night Kitchen

The app has two looks. **Auto** (default) follows the phone clock: Diner from 6 am, Night Kitchen from 6 pm.
It re-checks every minute and when the app returns to the foreground, and crossfades if it changes while open.
Users can pin either look in Profile → Look. Switch hours are `DAY_STARTS` / `NIGHT_STARTS` in `src/art/themes.ts`.

- UI colors and fonts: `:root[data-palette="diner"]` and `:root[data-palette="night"]` in `src/index.css`.
- Kitchen illustration colors: `SCENES` in `src/art/themes.ts`.
- Fonts are self-hosted (Lilita One, Baloo 2, Nunito) via `src/fonts.css`; no font CDN.
- Motion: keyframes per section in `src/index.css`; tokens `--dur`, `--dur-fast`, `--ease-out`, `--ease-pop`. Reduced-motion users get no animation.

### Scoring

`src/domain/recommend.ts`. Weights: coverage 35%, picked use 30%, missing-ingredient penalty 20%, seasonings 10%, variety 5%.
Coverage is min(1, have / need) per required ingredient, so 1 egg gives a third of the credit for a 3-egg dish.
With nothing picked, the 30% is shared between coverage and the missing penalty.

### Adding photos

Put licensed photos in `public/recipes/` and set `image: '/recipes/<id>.jpg'` on the recipe. Cards apply a light warm grade automatically.

## Structure

```
src/
  domain/      types, quantities, scaling, recommendation engine, cook timers + usage, chef dialogue
  data/        ingredients.ts, seasonings.ts, chefs.ts, recipes/  (data only, no UI)
  storage/     StorageAdapter interface + LocalStorageAdapter (swap for Supabase later)
  state/       reducer + context
  art/         KitchenScene (layered SVG), ingredient icons, seasoning containers, pets
  components/  buttons, sheet, segmented control, chef and pet pickers
  screens/     Setup, Kitchen, Fridge, Seasonings, Results, RecipeDetail, Library, Shopping, Cook, Profile
scripts/       validate.ts (data checks + engine tests)
  assets/chefs cut-out chef images (webp, 620px tall)
assets-source/ full-resolution transparent PNG cutouts of the ten chefs (legacy-v1 holds the first four)
```

## Notes

- Ingredient gram weights (`gramsPerUnit`) are household estimates for recipe matching, shown as "about".
- The kitchen is drawn in code as layers sharing one 400 × 440 space. Any layer can be swapped for painted PNGs later.
- Chef art: original images supplied by the owner.

## 3D chefs

`src/avatar/` holds the customizable chef: `avatar.ts` (options and defaults), `model.ts` (a procedural clay-style three.js model with a small joint rig and seven code-driven moves), and `Chef3D.tsx` (the live canvas plus cached still portraits for small spots, so only one WebGL canvas runs at a time). `ChefStudio` is the customizer used in Setup and Profile. A hand-modeled `.glb` can replace `buildChef` later as long as it keeps the same `{ root, update, dispose }` shape.

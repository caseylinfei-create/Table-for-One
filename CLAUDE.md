# Table for One: working notes for Claude

A cozy cooking companion for people who cook for one. You tell it what is in your fridge and on your seasoning shelf, and a clay-style chef in a little kitchen suggests dishes, scales them, walks you through cooking, and deducts what you used.

Owner: Casey. Talk to Casey in Chinese; the app UI and all code, comments and recipe text are in English. No em-dashes in anything user-facing.

## Commands

```bash
npm install
npm run dev           # local dev server, also reachable from a phone on the same network
npm run validate      # recipe data checks + recommendation engine smoke tests. Run after any data change.
npx tsc --noEmit -p . # type check
npm run build:single  # one self-contained HTML file in dist-single/ (used for the shareable demo)
```

## Stack

Vite 5, React 18, TypeScript 5.6, Tailwind 3 plus hand-written CSS in `src/index.css`. Fonts self-hosted via @fontsource (Lilita, Baloo 2, Nunito). No backend yet: everything persists to localStorage behind `StorageAdapter` (`src/storage/adapter.ts`, key `tfo:v1:data`, with a `migrate()` for older shapes). Keep that boundary so Supabase or a native store can replace it later.

## Map of the code

- `src/domain/`: pure logic. `types.ts` (all data shapes), `recommend.ts` (scoring), `scale.ts` (servings and `{{120 ml}}` text templates), `cook.ts` (timers, usage estimate), `quantity.ts`, `dialogue.ts` (chef lines).
- `src/data/`: catalogs. `ingredients.ts` (~95), `seasonings.ts` (35), `chefs.ts` (10 chefs, images in `src/assets/chefs`), `photos.ts` (dish photos with source and license), `recipes/` (one file per cuisine plus `chinese-home.ts`).
- `src/state/store.tsx`: reducer and actions; provides `{ data, dispatch, look }`.
- `src/art/`: `KitchenScene.tsx` (layered SVG kitchen with parallax, live fridge contents, seasoning cabinet, wall clock, pet), `themes.ts` (Diner and Night Kitchen palettes, `lookFor(hour)`), icons, dish illustrations.
- `src/screens/`: Setup, Kitchen, Fridge, Seasonings, Results, RecipeDetail, Library, Shopping, Cook, Profile.
- `scripts/validate.ts`: data validator.

## Product decisions already made (do not reopen without asking)

- Chefs: the 10 clay chef images Casey supplied. A procedural three.js 3D chef was tried (commit `c51cef2`) and reverted because it looked worse than the clay art. Revisit only with a real modeled `.glb` (Meshy, Tripo, or a 3D artist); the reverted code shows the intended interface (`buildChef` returning `{ root, update, dispose }`).
- Look: `palette: 'auto'` follows the phone clock. Diner 6:00 to 18:00, Night Kitchen 18:00 to 6:00. Users can pin either.
- Picked (highlighted) ingredients are not persisted.
- Dish images are real photos only (a game-illustration style was rejected). Dishes without a photo show a labeled illustration placeholder.
- Ingredient list on the recipe page is a diner "order ticket": groups On hand / To get / If you have it, dotted leaders, seasonings on the same ticket. Avoid generic rounded cards with status pills.
- Fridge in the scene shows the real inventory, newest first; produce in the crisper. The cabinet on the left shows owned seasonings and opens the seasoning screen.
- Repo is public.

## Recipe data rules

- Quantities are per one serving, in the ingredient's own catalog unit. Use the helpers in `src/data/recipes/helpers.ts`: `i`, `io` (optional), `s`, `so`, `st`, `recipe`.
- Alternatives (`alt`) must share a unit or both have `gramsPerUnit`.
- Step text can hold scalable amounts like `{{120 ml}}`.
- Every cooking step gets heat and minutes; meat and seafood steps get the safety temperature constants (CHICKEN 74°C/165°F, GROUND 71/160, PORK 63/145, FISH 63/145). Total `minutes` must roughly match the step sum.
- Near-identical dishes share a `family` so results never show two of them.
- Cuisine minimums: Chinese 15, Japanese 12, Korean 10, Thai 10, Western 13 (validator enforces).
- Adapted recipes carry `source: { name, url, license }`.

## Licensing (matters if this goes commercial)

- HowToCook (github.com/Anduin2017/HowToCook): Unlicense, public domain. Fine for recipes and photos.
- USDA FoodKeeper: CC0. Planned for expiry reminders.
- RecipeNLG: non-commercial only. Do not import.
- Unsplash and Pexels: free commercial use, but no bulk copying or building a collection. Pick photos one by one.
- Every photo needs an entry in `src/data/photos.ts` with source, license, url and date.
- Casey must hold commercial rights to the chef art before launch.

## Photo pipeline

Crop to 4:3, resize to 800×600, color boost 1.05, save webp quality 80 to `src/assets/photos/{recipe-id}.webp`, then add the entry in `photos.ts`. 19 of 70 recipes have photos.

## Backlog (Phase 5)

1. FoodKeeper expiry reminders (download the dataset, map to our ingredient ids).
2. Grow to 150 to 200 recipes; more photos for Japanese, Korean, Thai and Western dishes.
3. Deploy (Vercel or similar). Any live API (Pexels, Spoonacular) needs a serverless proxy so keys stay out of this public repo.
4. Later: accounts and sync, iOS app.

Monetization ideas discussed (not decided): cosmetic items (chef outfits, kitchen themes, pets), a Pro subscription (expiry reminders, meal plans), grocery affiliate links. No ads.

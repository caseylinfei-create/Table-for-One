import { useMemo, useState } from 'react';
import { useApp } from '../state/store';
import { RECIPE_BY_ID } from '../data/recipes';
import { INGREDIENT_BY_ID } from '../data/ingredients';
import { SEASONINGS } from '../data/seasonings';
import { CHEF_BY_ID } from '../data/chefs';
import { evaluate, type IngredientLine } from '../domain/recommend';
import { formatQty, formatUnit } from '../domain/quantity';
import { formatSeasoningAmount, scaleText } from '../domain/scale';
import { chefLine } from '../domain/dialogue';
import { DishPhoto } from '../art/DishArt';
import { Showcase } from '../components/Showcase';
import { IngredientIcon } from '../art/IngredientIcon';
import { Btn, Icon, Segmented, Sheet } from '../components/ui';
import type { NewShoppingItem } from '../state/store';
import type { Servings } from '../domain/types';
import type { Nav } from '../App';

const SEASON = Object.fromEntries(SEASONINGS.map((s) => [s.id, s]));

/** Round a shortfall up to the ingredient's own step so the list reads naturally. */
function toBuy(l: IngredientLine) {
  const step = INGREDIENT_BY_ID[l.req.ingredientId].step;
  return Math.ceil((l.need - l.have) / step - 1e-6) * step;
}

export function RecipeDetail({ recipeId, onBack, toast, nav }: { recipeId: string; onBack: () => void; toast: (t: string) => void; nav: Nav }) {
  const { data, dispatch } = useApp();
  const recipe = RECIPE_BY_ID[recipeId];
  const [servings, setServings] = useState<Servings>(data.servings);
  const [clashOpen, setClashOpen] = useState(false);
  const saved = data.saved.includes(recipe.id);
  const active = data.cook && data.cook.phase !== 'done' ? data.cook : null;
  const activeRecipe = active ? RECIPE_BY_ID[active.recipeId] : null;
  const start = () => {
    dispatch({ type: 'startCook', recipeId: recipe.id, servings });
    nav('cook');
  };
  const onStart = () => {
    if (active && active.recipeId === recipe.id) return nav('cook');
    if (active) return setClashOpen(true);
    start();
  };
  const e = useMemo(() => evaluate(recipe, data.inventory, data.seasonings, servings), [recipe, data.inventory, data.seasonings, servings]);
  const chef = CHEF_BY_ID[data.profile!.chefId];
  const line = useMemo(
    () => chefLine({ kind: 'recipe', everything: e.everything, missingCount: e.missing.length + e.missingSeasonings.length, minutes: recipe.minutes }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [recipeId],
  );

  const buyLines = e.lines.filter((l) => !l.req.optional && l.status !== 'have');
  const buyCount = buyLines.length + e.missingSeasonings.length;

  const addMissing = () => {
    const items: NewShoppingItem[] = [
      ...buyLines.map((l) => ({
        kind: 'ingredient' as const, refId: l.req.ingredientId, quantity: toBuy(l), unit: l.req.unit, fromRecipes: [recipe.id],
      })),
      ...e.missingSeasonings.map((s) => ({ kind: 'seasoning' as const, refId: s.req.seasoningId, fromRecipes: [recipe.id] })),
    ];
    const already = data.shopping.filter((s) => !s.purchased && s.fromRecipes.includes(recipe.id)).length;
    dispatch({ type: 'addShopping', items });
    toast(already ? 'Already on your shopping list' : `Added ${items.length} ${items.length === 1 ? 'item' : 'items'} to Shopping`);
  };

  return (
    <div className="detail">
      <div className="detail-hero">
        {data.dishStyle === 'game' ? <Showcase recipe={recipe} lines={e.lines} className="detail-photo detail-show" /> : <DishPhoto recipe={recipe} className="detail-photo" />}
        <button type="button" className="back-btn back-btn--icon" onClick={onBack} aria-label="Back">
          <Icon name="back" size={22} />
        </button>
        <button
          type="button"
          className={`save-btn ${saved ? 'is-on' : ''}`}
          onClick={() => { dispatch({ type: 'toggleSaved', id: recipe.id }); toast(saved ? 'Removed from saved' : 'Saved to your recipes'); }}
          aria-pressed={saved}
          aria-label={saved ? 'Saved. Tap to remove.' : 'Save recipe'}
        >
          <Icon name={saved ? 'bookmark-on' : 'bookmark'} size={22} />
        </button>
      </div>

      <div className="detail-body">
        <p className="rcard-meta">
          <span>{recipe.cuisine}</span><span aria-hidden="true">·</span>
          <span>{recipe.flavor === 'bold' ? 'Bold' : 'Light'}</span><span aria-hidden="true">·</span>
          <span>{recipe.minutes} min</span>
        </p>
        <h1 className="font-display text-[32px] font-semibold leading-[1.05]">{recipe.name}</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">{recipe.blurb}</p>

        <div className="detail-chef">
          <img src={chef.img} alt="" />
          <p>“{line}”</p>
        </div>

        <div className="serv-row">
          <span className="text-[13px] font-bold uppercase tracking-[0.08em] text-muted">Servings</span>
          <Segmented<Servings>
            id="detail-servings"
            label="Servings"
            value={servings}
            onChange={setServings}
            options={[{ value: 1, label: '1' }, { value: 2, label: '2' }, { value: 3, label: '3' }]}
          />
        </div>

        <section className="detail-sec" aria-labelledby="ing-h">
          <div className="section-head">
            <h2 id="ing-h" className="section-h">Ingredients</h2>
            <span className="text-[13px] text-muted">for {servings}</span>
          </div>
          <ul className="need-list">
            {e.lines.map((l) => {
              const ing = INGREDIENT_BY_ID[l.req.ingredientId];
              const using = l.usingId !== l.req.ingredientId && l.have > 0 ? INGREDIENT_BY_ID[l.usingId] : null;
              const alts = (l.req.alt ?? []).map((a) => INGREDIENT_BY_ID[a]?.name).filter(Boolean);
              return (
                <li key={l.req.ingredientId} className={`need need--${l.status}`}>
                  <IngredientIcon ing={ing} size={32} />
                  <div className="min-w-0 flex-1">
                    <p className="need-name">
                      {ing.name}
                      {l.req.optional && <span className="opt">optional</span>}
                    </p>
                    <p className="need-sub">
                      {formatQty(l.need)} {formatUnit(ing.unit, l.need)}
                      {using ? ` · using ${using.name}` : alts.length ? ` · or ${alts.join(', ')}` : ''}
                    </p>
                  </div>
                  <StatusPill l={l} />
                </li>
              );
            })}
          </ul>
        </section>

        <section className="detail-sec" aria-labelledby="sea-h">
          <h2 id="sea-h" className="section-h">Seasonings</h2>
          <ul className="sea-list">
            {e.seasonings.map(({ req, have }) => (
              <li key={req.seasoningId} className={`sea ${have ? 'sea--have' : req.optional ? 'sea--opt' : 'sea--need'}`}>
                <span className="sea-mark" aria-hidden="true">{have ? <Icon name="check" size={13} /> : null}</span>
                <span className="sea-name">{SEASON[req.seasoningId]?.name}</span>
                <span className="sea-amt">{formatSeasoningAmount(req.amount, req.unit, servings)}</span>
                <span className="sr-only">{have ? 'you have it' : req.optional ? 'optional, not on your shelf' : 'missing'}</span>
                {!have && <span className="sea-tag">{req.optional ? 'optional' : 'need'}</span>}
              </li>
            ))}
          </ul>
        </section>

        <section className="detail-sec" aria-labelledby="steps-h">
          <div className="section-head">
            <h2 id="steps-h" className="section-h">Steps</h2>
            <span className="text-[13px] text-muted">{recipe.steps.length} steps · preview</span>
          </div>
          <ol className="steps">
            {recipe.steps.map((s, k) => (
              <li key={k} className="stepx">
                <span className="stepx-n" aria-hidden="true">{k + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="stepx-t">{s.title}</p>
                  <p className="stepx-x">{scaleText(s.text, servings)}</p>
                  <p className="stepx-tags">
                    {s.heat && <span className="tag tag--heat">{s.heat === 'Oven' ? 'Oven' : `${s.heat} heat`}</span>}
                    {s.temperatureC != null && (
                      <span className="tag tag--temp">{s.tempLabel ? `${s.tempLabel}: ` : ''}{s.temperatureC}°C / {s.temperatureF}°F</span>
                    )}
                    {s.minutes != null && <span className="tag">{s.minutes} min</span>}
                  </p>
                  {s.note && <p className="stepx-note">{s.note}</p>}
                </div>
              </li>
            ))}
          </ol>
          {recipe.note && <p className="recipe-note">{recipe.note}</p>}
        </section>
      </div>

      <div className="detail-foot">
        <Btn variant="soft" onClick={addMissing} disabled={buyCount === 0}>
          {buyCount === 0 ? <><Icon name="check" size={18} /> All in stock</> : <><Icon name="basket" size={18} /> Add Missing Items ({buyCount})</>}
        </Btn>
        <Btn onClick={onStart}>{active?.recipeId === recipe.id ? 'Resume Cooking' : 'Start Cooking'}</Btn>
      </div>

      <Sheet
        open={clashOpen}
        onClose={() => setClashOpen(false)}
        title="Already cooking"
        footer={
          <div className="grid grid-cols-2 gap-2">
            <Btn variant="soft" onClick={() => { setClashOpen(false); nav('cook'); }}>Resume that</Btn>
            <Btn onClick={() => { setClashOpen(false); start(); }}>Start this one</Btn>
          </div>
        }
      >
        <p className="text-[15px] leading-relaxed">
          You’re on step {(active?.step ?? 0) + 1} of {activeRecipe?.name}. Starting {recipe.name} ends that session without touching your fridge.
        </p>
      </Sheet>
    </div>
  );
}

function StatusPill({ l }: { l: IngredientLine }) {
  if (l.status === 'have') return <span className="pill pill--have"><Icon name="check" size={13} /> Have</span>;
  if (l.status === 'short') {
    return <span className="pill pill--short">Short · have {formatQty(Math.round(l.have * 100) / 100)}</span>;
  }
  return <span className={`pill ${l.req.optional ? 'pill--opt' : 'pill--miss'}`}>{l.req.optional ? 'Skip ok' : 'Missing'}</span>;
}

import { useMemo, useState } from 'react';
import { chefName, useApp } from '../state/store';
import { RECIPES } from '../data/recipes';
import { INGREDIENT_BY_ID } from '../data/ingredients';
import { CHEF_BY_ID } from '../data/chefs';
import { recommend, type Evaluation } from '../domain/recommend';
import { chefLine } from '../domain/dialogue';
import { RecipeCard } from '../components/RecipeCard';
import { RecipeFilters } from '../components/RecipeFilters';
import { Btn, Icon } from '../components/ui';
import type { Nav } from '../App';

export function Results({ nav, picked, surprise, onBack }: { nav: Nav; picked: string[]; surprise?: boolean; onBack: () => void }) {
  const { data } = useApp();
  const name = chefName(data.profile!.surname);
  const chef = CHEF_BY_ID[data.profile!.chefId];
  const usePicked = surprise ? [] : picked;

  const sections = useMemo(
    () => recommend(RECIPES, data.inventory, data.seasonings, data.servings, usePicked, data.filters),
    [data.inventory, data.seasonings, data.servings, usePicked, data.filters],
  );
  const shown = [...sections.useItUp, ...sections.best, ...sections.different];
  const ready = shown.filter((e) => e.everything).length;

  // Surprise Me: one pick from the strongest few, chosen once per visit.
  const [featured] = useState<Evaluation | null>(() => {
    if (!surprise) return null;
    const pool = sections.best.slice(0, 4);
    return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
  });
  const line = useMemo(
    () => chefLine({ kind: 'results', name, picked: usePicked, total: shown.length, ready, surprise }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [shown.length, ready, surprise],
  );
  const open = (id: string) => nav('recipe', { recipeId: id });

  return (
    <div className="results">
      <header className="results-head">
        <button type="button" className="back-btn back-btn--inline" onClick={onBack}>
          <Icon name="back" size={20} /> <span>{surprise ? 'Kitchen' : 'Fridge'}</span>
        </button>
        <div className="results-hero">
          <div className="min-w-0 flex-1">
            <p className="eyebrow">{surprise ? 'Surprise me' : 'Tonight’s ideas'}</p>
            <h1 className="font-display text-[30px] font-semibold leading-[1.05]">
              {surprise ? 'Chef’s choice' : usePicked.length ? 'Using what you picked' : 'From your fridge'}
            </h1>
            {usePicked.length > 0 && (
              <p className="picked-row">
                {usePicked.map((id) => <span key={id} className="picked-chip">{INGREDIENT_BY_ID[id]?.name}</span>)}
              </p>
            )}
            <p className="results-quip">“{line}”</p>
          </div>
          <img src={chef.img} alt="" className="results-chef" />
        </div>
        <RecipeFilters idPrefix="results" />
        <p className="text-[13px] text-muted">
          Amounts for {data.servings === 1 ? 'one' : data.servings}. Change it on the fridge screen or in a recipe.
        </p>
      </header>

      {shown.length === 0 ? (
        <div className="empty">
          <p className="font-display text-[20px] font-semibold">No recipes match these filters</p>
          <p className="text-[14px] text-muted">Try All cuisines or Any flavor.</p>
        </div>
      ) : (
        <div className="sections">
          {featured && (
            <section aria-labelledby="sec-feat" className="section">
              <h2 id="sec-feat" className="section-h">Tonight’s pick</h2>
              <RecipeCard e={featured} onOpen={() => open(featured.recipe.id)} />
            </section>
          )}
          {sections.useItUp.length > 0 && (
            <Section id="use" title="Use It Up" note="Built around what you picked" list={sections.useItUp} open={open} />
          )}
          <Section id="best" title="Best Matches" note="Fewest things to buy" list={sections.best.filter((e) => e !== featured)} open={open} />
          <Section id="diff" title="Something Different" note="Still doable, a change of scene" list={sections.different.filter((e) => e !== featured)} open={open} />
          <div className="px-1 pb-6">
            <Btn variant="ghost" className="w-full" onClick={() => nav('recipes')}>Browse all {RECIPES.length} recipes</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ id, title, note, list, open }: { id: string; title: string; note: string; list: Evaluation[]; open: (id: string) => void }) {
  if (!list.length) return null;
  return (
    <section aria-labelledby={`sec-${id}`} className="section">
      <div className="section-head">
        <h2 id={`sec-${id}`} className="section-h">{title}</h2>
        <span className="text-[13px] text-muted">{note}</span>
      </div>
      <div className="card-grid">
        {list.map((e) => <RecipeCard key={e.recipe.id} e={e} onOpen={() => open(e.recipe.id)} />)}
      </div>
    </section>
  );
}

import { useMemo, useState } from 'react';
import { useApp } from '../state/store';
import { RECIPES } from '../data/recipes';
import { evaluate, matchesFilters } from '../domain/recommend';
import { RecipeCard } from '../components/RecipeCard';
import { RecipeFilters } from '../components/RecipeFilters';
import { Icon } from '../components/ui';
import type { Nav } from '../App';

/** Every recipe, ranked against the current fridge. */
export function Library({ nav }: { nav: Nav }) {
  const { data } = useApp();
  const [q, setQ] = useState('');
  const [onlySaved, setOnlySaved] = useState(false);
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return RECIPES.filter((r) => matchesFilters(r, data.filters))
      .filter((r) => !onlySaved || data.saved.includes(r.id))
      .filter((r) => !s || r.name.toLowerCase().includes(s) || r.cuisine.toLowerCase().includes(s) || r.blurb.toLowerCase().includes(s))
      .map((r) => evaluate(r, data.inventory, data.seasonings, data.servings))
      .sort((a, b) => b.score - a.score);
  }, [q, onlySaved, data.saved, data.filters, data.inventory, data.seasonings, data.servings]);

  return (
    <div className="page">
      <p className="eyebrow">Recipes</p>
      <h1 className="font-display text-[30px] font-semibold leading-tight">The recipe box</h1>
      <p className="mt-1 text-[14px] text-muted">{RECIPES.length} dishes, best fit for your fridge first.</p>
      <div className="mt-4 flex flex-col gap-3">
        <div className="search">
          <Icon name="search" size={18} />
          <label htmlFor="lib-search" className="sr-only">Search recipes</label>
          <input id="lib-search" placeholder="Search recipes" value={q} onChange={(e) => setQ(e.target.value)} autoComplete="off" />
        </div>
        <RecipeFilters idPrefix="lib" />
        <button type="button" className={`chip self-start ${onlySaved ? 'is-on' : ''}`} aria-pressed={onlySaved} onClick={() => setOnlySaved((v) => !v)}>
          <Icon name={onlySaved ? 'bookmark-on' : 'bookmark'} size={16} /> Saved <span className="chip-n">{data.saved.length}</span>
        </button>
      </div>
      <h2 className="mt-4 mb-2 text-[13px] font-bold text-muted">{list.length} {list.length === 1 ? 'recipe' : 'recipes'}</h2>
      <div className="lib-list">
        {list.map((e) => <RecipeCard key={e.recipe.id} e={e} compact onOpen={() => nav('recipe', { recipeId: e.recipe.id })} />)}
      </div>
      {list.length === 0 && <p className="py-8 text-center text-[14px] text-muted">No recipes match.</p>}
    </div>
  );
}

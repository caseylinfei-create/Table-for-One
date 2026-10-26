import { CUISINES } from '../data/recipes';
import type { Filters } from '../domain/types';
import { useApp } from '../state/store';
import { Segmented } from './ui';

/** Cuisine chips + flavor toggle. Saved, defaults to All / Any. */
export function RecipeFilters({ idPrefix }: { idPrefix: string }) {
  const { data, dispatch } = useApp();
  const f = data.filters;
  const set = (p: Partial<Filters>) => dispatch({ type: 'setFilters', filters: p });
  return (
    <div className="filters">
      <div className="chips" role="radiogroup" aria-label="Cuisine">
        {(['all', ...CUISINES] as const).map((c) => (
          <button
            key={c}
            type="button"
            role="radio"
            aria-checked={f.cuisine === c}
            className={`chip ${f.cuisine === c ? 'is-on' : ''}`}
            onClick={() => set({ cuisine: c })}
          >
            {c === 'all' ? 'All cuisines' : c}
          </button>
        ))}
      </div>
      <Segmented
        id={`${idPrefix}-flavor`}
        label="Flavor"
        value={f.flavor}
        onChange={(v) => set({ flavor: v })}
        options={[{ value: 'any', label: 'Any flavor' }, { value: 'light', label: 'Light' }, { value: 'bold', label: 'Bold' }]}
      />
    </div>
  );
}

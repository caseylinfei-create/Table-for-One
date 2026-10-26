import { memo } from 'react';
import { INGREDIENT_BY_ID } from '../data/ingredients';
import { SEASONINGS } from '../data/seasonings';
import { DishPhoto } from '../art/DishArt';
import type { Evaluation } from '../domain/recommend';
import { Icon } from './ui';

const SEASON_NAME = Object.fromEntries(SEASONINGS.map((s) => [s.id, s.name]));

export function missingNames(e: Evaluation) {
  return [
    ...e.missing.map((l) => INGREDIENT_BY_ID[l.req.ingredientId].name),
    ...e.missingSeasonings.map((s) => SEASON_NAME[s.req.seasoningId]),
  ];
}

/** Segment meter: one notch per required ingredient, filled by status. */
export function Availability({ e }: { e: Evaluation }) {
  const req = e.lines.filter((l) => !l.req.optional);
  const haveN = req.filter((l) => l.status === 'have').length;
  return (
    <div className="avail" aria-label={`${haveN} of ${req.length} ingredients on hand`}>
      <div className="avail-bar" aria-hidden="true">
        {req.map((l, k) => <span key={k} className={`notch notch--${l.status}`} />)}
      </div>
      <span className="avail-n">{haveN}/{req.length}</span>
    </div>
  );
}

export function StatusLine({ e }: { e: Evaluation }) {
  if (e.everything) {
    return (
      <p className="status status--ok"><Icon name="check" size={15} /> You have everything!</p>
    );
  }
  const miss = missingNames(e);
  const short = e.short.map((l) => INGREDIENT_BY_ID[l.req.ingredientId].name);
  return (
    <div className="status-stack">
      {miss.length > 0 && (
        <p className="status status--miss"><span className="status-k">Missing:</span> {miss.join(', ')}</p>
      )}
      {short.length > 0 && (
        <p className="status status--short"><span className="status-k">Need more:</span> {short.join(', ')}</p>
      )}
    </div>
  );
}

export const RecipeCard = memo(function RecipeCard({ e, onOpen, compact }: { e: Evaluation; onOpen: () => void; compact?: boolean }) {
  const r = e.recipe;
  return (
    <article className={`rcard ${compact ? 'rcard--compact' : ''}`}>
      <button type="button" className="rcard-hit" onClick={onOpen} aria-label={`View recipe: ${r.name}`}>
        <DishPhoto recipe={r} className="rcard-photo" label={!compact} />
        <div className="rcard-body">
          <p className="rcard-meta">
            <span>{r.cuisine}</span><span aria-hidden="true">·</span>
            <span>{r.flavor === 'bold' ? 'Bold' : 'Light'}</span><span aria-hidden="true">·</span>
            <span>{r.minutes} min</span>
          </p>
          <h3 className="rcard-title">{r.name}</h3>
          <Availability e={e} />
          <StatusLine e={e} />
          {!compact && <span className="rcard-cta">View Recipe <Icon name="chev-r" size={16} /></span>}
        </div>
      </button>
    </article>
  );
});

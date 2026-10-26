import { useEffect, useMemo, useState } from 'react';
import { chefName, useApp } from '../state/store';
import { KitchenScene } from '../art/KitchenScene';
import { SpeechBubble } from '../components/SpeechBubble';
import { chefLine } from '../domain/dialogue';
import { Btn, Icon } from '../components/ui';
import type { Nav } from '../App';
import { RECIPE_BY_ID } from '../data/recipes';

export function Kitchen({ nav }: { nav: Nav }) {
  const { data, dispatch } = useApp();
  const name = chefName(data.profile!.surname);
  const [line, setLine] = useState(() => chefLine({ kind: 'kitchen', name, data }));
  const stocked = data.inventory.filter((i) => i.quantity > 0).length;
  const cook = data.cook && data.cook.phase !== 'done' && RECIPE_BY_ID[data.cook.recipeId] ? data.cook : null;
  // A finished session has nothing left to resume.
  useEffect(() => {
    if (data.cook?.phase === 'done') dispatch({ type: 'endCook' });
  }, [data.cook?.phase, dispatch]);
  const owned = useMemo(() => Object.values(data.seasonings).filter(Boolean).length, [data.seasonings]);

  return (
    <div className="kitchen">
      <KitchenScene
        data={data}
        mode="home"
        onFridge={() => nav('fridge')}
        onSeasoning={() => nav('seasoning')}
        onChef={() => setLine((l) => chefLine({ kind: 'poke', chefId: data.profile!.chefId }, l))}
        bubble={<SpeechBubble text={line} sub={stocked ? 'Tap the fridge to start.' : undefined} />}
      />
      <section className="home-panel" aria-label="Kitchen actions">
        <div className="home-meta">
          <div className="flex items-center justify-between gap-2">
            <h1 className="eyebrow">{name}’s kitchen</h1>
            {stocked > 0 && (
              <button type="button" className="surprise" onClick={() => nav('results', { surprise: true })}>
                <Icon name="spark" size={15} /> Surprise me
              </button>
            )}
          </div>
          <p className="home-stats">
            <span><b>{stocked}</b> in the fridge</span>
            <span aria-hidden="true" className="dot" />
            <span><b>{owned}</b> seasonings</span>
            <span aria-hidden="true" className="dot" />
            <span>for {data.servings === 1 ? 'one' : data.servings}</span>
          </p>
        </div>
        {cook && (
          <button type="button" className="resume" onClick={() => nav('cook')}>
            <span className="resume-dot" aria-hidden="true" />
            <span className="min-w-0 flex-1 text-left">
              <span className="block text-[12px] font-extrabold uppercase tracking-[0.08em] text-[color:var(--walnut)]">On the stove</span>
              <span className="block truncate font-extrabold">{RECIPE_BY_ID[cook.recipeId].name}</span>
            </span>
            <span className="resume-step">{cook.phase === 'confirm' ? 'Finish up' : `Step ${cook.step + 1}/${RECIPE_BY_ID[cook.recipeId].steps.length}`}</span>
            <Icon name="chev-r" size={18} />
          </button>
        )}
        <Btn onClick={() => nav('fridge')} className="w-full btn--lg">
          Find Something to Cook
        </Btn>
        <div className="grid grid-cols-2 gap-2.5">
          <Btn variant="soft" onClick={() => nav('fridge', { add: true })}>
            <Icon name="plus" size={18} /> Add Groceries
          </Btn>
          <Btn variant="soft" onClick={() => nav('seasoning')}>
            <SaltIcon /> Seasonings
          </Btn>
        </div>
      </section>
    </div>
  );
}

function SaltIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M8 9h8l1 11H7z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M8 9c0-3 1.8-5 4-5s4 2 4 5" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="11" cy="6.5" r="0.9" fill="currentColor" /><circle cx="13.5" cy="6.5" r="0.9" fill="currentColor" />
    </svg>
  );
}

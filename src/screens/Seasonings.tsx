import { useState } from 'react';
import { useApp } from '../state/store';
import { SEASONINGS, SEASONING_GROUPS } from '../data/seasonings';
import { SeasoningArt } from '../art/SeasoningArt';
import { Icon, Segmented } from '../components/ui';
import { chefLine } from '../domain/dialogue';
import { CHEF_BY_ID } from '../data/chefs';
import type { Nav } from '../App';

type Show = 'all' | 'have' | 'need';

export function Seasonings({ nav }: { nav: Nav }) {
  const { data, dispatch } = useApp();
  const [show, setShow] = useState<Show>('all');
  const [bounced, setBounced] = useState<string | null>(null);
  const owned = SEASONINGS.filter((s) => data.seasonings[s.id]).length;
  const chef = CHEF_BY_ID[data.profile!.chefId];
  const line = chefLine({ kind: 'seasoning', owned, total: SEASONINGS.length });

  return (
    <div className="rack-screen">
      <header className="rack-head">
        <button type="button" className="back-btn back-btn--inline" onClick={() => nav('kitchen')} aria-label="Back to kitchen">
          <Icon name="back" size={20} /> <span>Kitchen</span>
        </button>
        <div className="rack-hero">
          <div className="min-w-0 flex-1">
            <p className="eyebrow">Seasoning station</p>
            <h1 className="font-display text-[30px] font-semibold leading-none">The spice shelf</h1>
            <p className="mt-2 text-[14px] text-muted">
              <b className="text-ink">{owned}</b> of {SEASONINGS.length} on hand. Tap a bottle to switch between Have it and Need it.
            </p>
          </div>
          <div className="rack-chef" aria-hidden="true">
            <img src={chef.img} alt="" />
          </div>
        </div>
        <p className="rack-quip">“{line}”</p>
        <Segmented<Show>
          id="rack-filter"
          label="Show seasonings"
          value={show}
          onChange={setShow}
          options={[{ value: 'all', label: 'All' }, { value: 'have', label: 'Have it' }, { value: 'need', label: 'Need it' }]}
        />
      </header>

      <div className="shelves">
        {SEASONING_GROUPS.map((g) => {
          const list = SEASONINGS.filter((s) => s.group === g.id).filter((s) =>
            show === 'all' ? true : show === 'have' ? data.seasonings[s.id] : !data.seasonings[s.id],
          );
          if (!list.length) return null;
          return (
            <section key={g.id} className="shelf" aria-labelledby={`g-${g.id}`}>
              <div className="shelf-label">
                <h2 id={`g-${g.id}`} className="font-display text-[19px] font-semibold">{g.label}</h2>
                <span className="text-[13px] text-muted">{g.note}</span>
              </div>
              {chunk(list, 4).map((row, ri) => (
              <div className="shelf-tier" key={ri}>
              <div className="shelf-row">
                {row.map((s) => {
                  const have = !!data.seasonings[s.id];
                  return (
                    <button
                      key={s.id}
                      type="button"
                      className={`jar ${have ? 'is-have' : 'is-need'} ${bounced === s.id ? 'bounce' : ''}`}
                      aria-pressed={have}
                      aria-label={`${s.name}: ${have ? 'have it' : 'need it'}`}
                      onClick={() => {
                        dispatch({ type: 'toggleSeasoning', id: s.id });
                        setBounced(s.id);
                        window.setTimeout(() => setBounced((b) => (b === s.id ? null : b)), 420);
                      }}
                    >
                      <svg viewBox="0 0 48 72" className="jar-art" aria-hidden="true"><SeasoningArt s={s} /></svg>
                      <span className="jar-name">{s.name}</span>
                      <span className="jar-state">
                        {have ? <><Icon name="check" size={12} /> Have it</> : 'Need it'}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="plank" aria-hidden="true" />
              </div>
              ))}
            </section>
          );
        })}
      </div>
    </div>
  );
}

function chunk<T>(arr: T[], n: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

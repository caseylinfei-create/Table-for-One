import { useMemo, useState } from 'react';
import { CHEFS } from '../data/chefs';
import type { ChefId } from '../domain/types';
import { Icon, Segmented } from './ui';

type Filter = 'all' | 'female' | 'male';

/** Swipe-free carousel: arrows, thumbnails and a gender filter. */
export function ChefPicker({ value, onChange }: { value: ChefId; onChange: (id: ChefId) => void }) {
  const [filter, setFilter] = useState<Filter>('all');
  const list = useMemo(() => CHEFS.filter((c) => filter === 'all' || c.gender === filter), [filter]);
  const current = CHEFS.find((c) => c.id === value)!;
  const idx = Math.max(0, list.findIndex((c) => c.id === value));

  const go = (d: number) => {
    const next = list[(idx + d + list.length) % list.length];
    onChange(next.id);
  };
  const setF = (f: Filter) => {
    setFilter(f);
    const l = CHEFS.filter((c) => f === 'all' || c.gender === f);
    if (!l.some((c) => c.id === value)) onChange(l[0].id);
  };

  return (
    <div className="picker">
      <Segmented
        id="chef-filter"
        label="Filter chefs"
        value={filter}
        onChange={setF}
        options={[{ value: 'all', label: 'All' }, { value: 'female', label: 'Female' }, { value: 'male', label: 'Male' }]}
      />
      <div className="picker-stage">
        <button type="button" className="picker-arrow" onClick={() => go(-1)} aria-label="Previous chef" disabled={list.length < 2}>
          <Icon name="chev-l" />
        </button>
        <div className="picker-spot" key={current.id}>
          <img src={current.img} alt={`${current.title} chef`} className="picker-img" draggable={false} />
        </div>
        <button type="button" className="picker-arrow" onClick={() => go(1)} aria-label="Next chef" disabled={list.length < 2}>
          <Icon name="chev-r" />
        </button>
      </div>
      <div className="text-center">
        <p className="font-display text-[22px] font-semibold">{current.title}</p>
        <p className="mx-auto mt-1 max-w-[32ch] text-[14px] text-muted">{current.vibe}</p>
      </div>
      <div className="picker-thumbs" role="radiogroup" aria-label="Choose your chef">
        {list.map((c) => (
          <button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={c.id === value}
            aria-label={c.title}
            className={`thumb ${c.id === value ? 'is-on' : ''}`}
            onClick={() => onChange(c.id)}
          >
            <img src={c.img} alt="" draggable={false} />
          </button>
        ))}
      </div>
    </div>
  );
}

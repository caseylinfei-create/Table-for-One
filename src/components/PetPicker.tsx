import type { Pet } from '../domain/types';
import { PetBadge } from '../art/Pets';

export function PetPicker({ value, onChange }: { value: Pet; onChange: (p: Pet) => void }) {
  const opts: { v: Pet; label: string }[] = [
    { v: 'none', label: 'Just us' },
    { v: 'cat', label: 'Cat' },
    { v: 'dog', label: 'Dog' },
  ];
  return (
    <div className="pet-row" role="radiogroup" aria-label="Kitchen pet">
      {opts.map((o) => (
        <button
          key={o.v}
          type="button"
          role="radio"
          aria-checked={value === o.v}
          className={`pet-opt ${value === o.v ? 'is-on' : ''}`}
          onClick={() => onChange(o.v)}
        >
          <span className="pet-art">
            {o.v === 'none' ? <span className="pet-none" aria-hidden="true" /> : <PetBadge kind={o.v} />}
          </span>
          <span>{o.label}</span>
        </button>
      ))}
    </div>
  );
}

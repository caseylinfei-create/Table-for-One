import { useState } from 'react';
import { Chef3D } from '../avatar/Chef3D';
import {
  ACTIONS, APRONS, DEFAULT_AVATAR, HAIRS, HAIR_STYLES, HATS, JACKETS, SKINS, randomAvatar,
  type Action, type Avatar, type BodyBase,
} from '../avatar/avatar';
import { useApp } from '../state/store';
import { Icon, Segmented } from './ui';

type Tab = 'look' | 'hair' | 'outfit' | 'move';

/** Build-your-chef: live 3D preview you can spin, with every option one tap away. */
export function ChefStudio({ value, onChange }: { value: Avatar; onChange: (a: Avatar) => void }) {
  const { look } = useApp();
  const [tab, setTab] = useState<Tab>('look');
  const [react, setReact] = useState(0);
  const set = (patch: Partial<Avatar>) => onChange({ ...value, ...patch });
  const setBody = (body: BodyBase) => {
    if (body === value.body) return;
    const d = DEFAULT_AVATAR[body];
    // Keep the colors they picked; swap only what reads as the base's default style.
    onChange({ ...value, body, hairStyle: d.hairStyle, hat: d.hat });
    setReact((k) => k + 1);
  };

  return (
    <div className="studio">
      <div className="studio-stage">
        <Chef3D avatar={value} mood={look === 'night' ? 'night' : 'day'} reactKey={react} spin turn={0.2} />
        <p className="studio-hint" aria-hidden="true"><Icon name="swap" size={14} /> Drag to turn</p>
        <button type="button" className="studio-dice" onClick={() => { onChange(randomAvatar(value.body)); setReact((k) => k + 1); }} aria-label="Surprise me with a random look">
          <Icon name="dice" size={20} />
        </button>
      </div>

      <Segmented<BodyBase>
        id="studio-body"
        label="Chef base"
        value={value.body}
        onChange={setBody}
        options={[{ value: 'fem', label: 'Her' }, { value: 'masc', label: 'Him' }]}
      />

      <div className="studio-tabs" role="tablist" aria-label="Customize">
        {(['look', 'hair', 'outfit', 'move'] as Tab[]).map((t) => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} className={`studio-tab ${tab === t ? 'is-on' : ''}`} onClick={() => setTab(t)}>
            {{ look: 'Skin', hair: 'Hair', outfit: 'Outfit', move: 'Move' }[t]}
          </button>
        ))}
      </div>

      <div className="studio-panel" role="tabpanel">
        {tab === 'look' && (
          <Swatches label="Skin tone" colors={SKINS} value={value.skin} onPick={(skin) => set({ skin })} />
        )}
        {tab === 'hair' && (
          <>
            <Swatches label="Hair color" colors={HAIRS} value={value.hair} onPick={(hair) => set({ hair })} />
            <Choice label="Hairstyle" options={HAIR_STYLES} value={value.hairStyle} onPick={(hairStyle) => set({ hairStyle })} />
          </>
        )}
        {tab === 'outfit' && (
          <>
            <Choice label="Hat" options={HATS} value={value.hat} onPick={(hat) => set({ hat })} />
            <Swatches label="Jacket" colors={JACKETS} value={value.jacket} onPick={(jacket) => set({ jacket })} />
            <Swatches label="Apron" colors={APRONS} value={value.apron} onPick={(apron) => set({ apron })} />
          </>
        )}
        {tab === 'move' && (
          <div className="moves" role="radiogroup" aria-label="Signature move">
            {ACTIONS.map((a) => (
              <button
                key={a.id}
                type="button"
                role="radio"
                aria-checked={value.action === a.id}
                className={`move ${value.action === a.id ? 'is-on' : ''}`}
                onClick={() => set({ action: a.id as Action })}
              >
                <span className="move-name">{a.label}</span>
                <span className="move-note">{a.note}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Swatches({ label, colors, value, onPick }: { label: string; colors: string[]; value: string; onPick: (c: string) => void }) {
  return (
    <fieldset className="studio-row">
      <legend className="studio-label">{label}</legend>
      <div className="swatches">
        {colors.map((c, i) => (
          <button
            key={c}
            type="button"
            className={`swatch ${value === c ? 'is-on' : ''}`}
            style={{ background: c }}
            aria-label={`${label} ${i + 1}`}
            aria-pressed={value === c}
            onClick={() => onPick(c)}
          />
        ))}
      </div>
    </fieldset>
  );
}

function Choice<T extends string>({ label, options, value, onPick }: { label: string; options: { id: T; label: string }[]; value: T; onPick: (v: T) => void }) {
  return (
    <fieldset className="studio-row">
      <legend className="studio-label">{label}</legend>
      <div className="chips chips--wrap">
        {options.map((o) => (
          <button key={o.id} type="button" className={`chip ${value === o.id ? 'is-on' : ''}`} aria-pressed={value === o.id} onClick={() => onPick(o.id)}>
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

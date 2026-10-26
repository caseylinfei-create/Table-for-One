import { useState } from 'react';
import { chefName, useApp } from '../state/store';
import { CHEF_BY_ID } from '../data/chefs';
import { ChefPicker } from '../components/ChefPicker';
import { PetPicker } from '../components/PetPicker';
import { Btn, Segmented, Sheet } from '../components/ui';
import type { Servings } from '../domain/types';
import { LOOK_OPTIONS } from '../art/themes';

export function Profile({ toast }: { toast: (t: string) => void }) {
  const { data, dispatch, look } = useApp();
  const p = data.profile!;
  const chef = CHEF_BY_ID[p.chefId];
  const [picking, setPicking] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="page">
      <p className="eyebrow">Profile</p>
      <h1 className="font-display text-[30px] font-semibold leading-tight">{chefName(p.surname)}</h1>

      <section className="setup-card mt-4 flex items-center gap-4">
        <img src={chef.img} alt="" className="h-28 w-auto drop-shadow-md" />
        <div className="min-w-0 flex-1">
          <p className="text-[13px] text-muted">Your chef</p>
          <p className="font-display text-[20px] font-semibold">{chef.title}</p>
          <Btn variant="soft" className="btn--sm mt-2" onClick={() => setPicking(true)}>Change chef</Btn>
        </div>
      </section>

      <section className="setup-card mt-3">
        <label htmlFor="p-surname" className="setup-h">Surname</label>
        <input
          id="p-surname"
          className="field"
          value={p.surname}
          maxLength={24}
          onChange={(e) => dispatch({ type: 'updateProfile', patch: { surname: e.target.value } })}
          onBlur={(e) => !e.target.value.trim() && dispatch({ type: 'updateProfile', patch: { surname: 'Chef' } })}
        />
      </section>

      <section className="setup-card mt-3">
        <h2 className="setup-h">Kitchen pet</h2>
        <PetPicker value={p.pet} onChange={(pet) => dispatch({ type: 'updateProfile', patch: { pet } })} />
      </section>

      <section className="setup-card mt-3">
        <h2 className="setup-h">Usually cooking for</h2>
        <Segmented<Servings>
          id="p-servings"
          label="Usually cooking for"
          value={data.servings}
          onChange={(v) => dispatch({ type: 'setServings', servings: v })}
          options={[{ value: 1, label: 'Just me' }, { value: 2, label: '2' }, { value: 3, label: '3' }]}
        />
      </section>

      <section className="setup-card mt-3">
        <h2 className="setup-h">Look</h2>
        <p className="-mt-1 mb-3 text-[13px] text-muted">Right now: {look === 'night' ? 'Night Kitchen' : 'Diner'}</p>
        <div className="looks" role="radiogroup" aria-label="Look">
          {LOOK_OPTIONS.map((pl) => (
            <button
              key={pl.id}
              type="button"
              role="radio"
              aria-checked={data.palette === pl.id}
              className={`look look--${pl.id} ${data.palette === pl.id ? 'is-on' : ''}`}
              onClick={() => dispatch({ type: 'setPalette', palette: pl.id })}
            >
              <span className="look-sw" aria-hidden="true"><i /><i /><i /></span>
              <span className="look-name">{pl.name}</span>
              <span className="look-note">{pl.note}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="setup-card mt-3">
        <h2 className="setup-h">Dish pictures</h2>
        <p className="-mt-1 mb-3 text-[13px] text-muted">Preview both styles. Only three dishes have photos so far.</p>
        <Segmented<'game' | 'photo'>
          id="p-dishstyle"
          label="Dish pictures"
          value={data.dishStyle}
          onChange={(v) => dispatch({ type: 'setDishStyle', dishStyle: v })}
          options={[{ value: 'game', label: 'Illustrated' }, { value: 'photo', label: 'Photos' }]}
        />
      </section>

      <section className="mt-6">
        {confirmReset ? (
          <div className="setup-card">
            <p className="font-semibold">Clear everything on this device?</p>
            <p className="mt-1 text-[14px] text-muted">Your fridge, seasonings and chef will be reset. This can’t be undone.</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Btn variant="soft" onClick={() => setConfirmReset(false)}>Keep it</Btn>
              <Btn variant="danger" onClick={() => dispatch({ type: 'reset' })}>Clear all</Btn>
            </div>
          </div>
        ) : (
          <Btn variant="ghost" className="w-full" onClick={() => setConfirmReset(true)}>Reset app data</Btn>
        )}
        <p className="mt-3 text-center text-[12px] text-muted">Saved on this device only. Accounts and sync come later.</p>
      </section>

      <Sheet open={picking} onClose={() => setPicking(false)} title="Choose your chef" footer={<Btn className="w-full" onClick={() => { setPicking(false); toast('Chef updated'); }}>Done</Btn>}>
        <ChefPicker value={p.chefId} onChange={(id) => dispatch({ type: 'updateProfile', patch: { chefId: id } })} />
      </Sheet>
    </div>
  );
}

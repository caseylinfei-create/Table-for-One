import { useState } from 'react';
import { CHEFS } from '../data/chefs';
import type { ChefId, Pet } from '../domain/types';
import { chefName, useApp } from '../state/store';
import { ChefPicker } from '../components/ChefPicker';
import { PetPicker } from '../components/PetPicker';
import { Btn } from '../components/ui';

/** One screen, shown only on first launch: chef, name, pet. */
export function Setup() {
  const { dispatch } = useApp();
  const [chefId, setChefId] = useState<ChefId>(() => CHEFS[Math.floor(Math.random() * CHEFS.length)].id);
  const [surname, setSurname] = useState('');
  const [pet, setPet] = useState<Pet>('none');
  const ready = surname.trim().length > 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ready) return;
    dispatch({ type: 'setProfile', profile: { chefId, surname: surname.trim(), pet } });
  };

  return (
    <main>
    <form className="setup" onSubmit={submit}>
      <header className="setup-head">
        <p className="eyebrow">A little kitchen, a little company</p>
        <h1 className="wordmark">Table for One</h1>
      </header>

      <section aria-labelledby="pick-h" className="setup-card">
        <h2 id="pick-h" className="setup-h">Who’s cooking with you?</h2>
        <ChefPicker value={chefId} onChange={setChefId} />
      </section>

      <section className="setup-card" aria-labelledby="name-h">
        <h2 id="name-h" className="setup-h">Your surname</h2>
        <label htmlFor="surname" className="sr-only">Surname</label>
        <input
          id="surname"
          className="field"
          placeholder="e.g. Yu"
          autoComplete="family-name"
          maxLength={24}
          value={surname}
          onChange={(e) => setSurname(e.target.value)}
        />
        <p className="mt-2 text-[14px] text-muted">
          In this kitchen you’re <span className="font-bold text-ink">{ready ? chefName(surname) : 'Chef …'}</span>
        </p>
      </section>

      <section className="setup-card" aria-labelledby="pet-h">
        <h2 id="pet-h" className="setup-h">Anyone else in the kitchen?</h2>
        <PetPicker value={pet} onChange={setPet} />
      </section>

      <div className="setup-foot">
        <Btn type="submit" disabled={!ready} className="w-full">Open my kitchen</Btn>
        {!ready && <p className="mt-2 text-center text-[13px] text-muted">Add your surname to continue</p>}
      </div>
    </form>
    </main>
  );
}

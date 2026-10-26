import { useEffect, useMemo, useRef, useState } from 'react';
import { chefName, useApp } from '../state/store';
import { RECIPE_BY_ID } from '../data/recipes';
import { INGREDIENT_BY_ID } from '../data/ingredients';
import { SEASONINGS } from '../data/seasonings';
import { Chef3D, usePortrait } from '../avatar/Chef3D';
import { CHEF_BY_ID } from '../data/chefs';
import { cookLine, estimateUsage, formatClock, isFinished, isRunning, remainingMs, weekday } from '../domain/cook';
import { formatQty, formatUnit, stepDown, stepUp } from '../domain/quantity';
import { formatSeasoningAmount, scaleText } from '../domain/scale';
import { DishPhoto } from '../art/DishArt';
import { IngredientIcon } from '../art/IngredientIcon';
import { PetArt } from '../art/Pets';
import { Btn, Icon, Sheet } from '../components/ui';
import type { CookSession, Recipe } from '../domain/types';
import type { Nav } from '../App';

const SEASON = Object.fromEntries(SEASONINGS.map((s) => [s.id, s]));

export function Cook({ nav, toast }: { nav: Nav; toast: (t: string) => void }) {
  const { data } = useApp();
  const c = data.cook;
  if (!c || !RECIPE_BY_ID[c.recipeId]) {
    return (
      <div className="page empty">
        <p className="font-display text-[20px] font-semibold">Nothing on the stove</p>
        <Btn onClick={() => nav('kitchen')}>Back to the kitchen</Btn>
      </div>
    );
  }
  const recipe = RECIPE_BY_ID[c.recipeId];
  if (c.phase === 'confirm') return <Confirm c={c} recipe={recipe} />;
  if (c.phase === 'done') return <Enjoy c={c} recipe={recipe} nav={nav} toast={toast} />;
  return <Steps c={c} recipe={recipe} nav={nav} />;
}

/* ------------------------------------------------------------- alarm */

let audio: AudioContext | null = null;
function primeAudio() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!audio && Ctx) audio = new Ctx();
    void audio?.resume();
  } catch { /* sound is optional */ }
}
function chime() {
  try {
    if (!audio) return;
    const t0 = audio.currentTime;
    [0, 0.28, 0.56].forEach((d, k) => {
      const o = audio!.createOscillator();
      const g = audio!.createGain();
      o.type = 'sine';
      o.frequency.value = k === 2 ? 1046 : 880;
      g.gain.setValueAtTime(0.0001, t0 + d);
      g.gain.exponentialRampToValueAtTime(0.25, t0 + d + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + d + 0.24);
      o.connect(g).connect(audio!.destination);
      o.start(t0 + d);
      o.stop(t0 + d + 0.26);
    });
  } catch { /* ignore */ }
  try { navigator.vibrate?.([200, 100, 200]); } catch { /* ignore */ }
}

/** Keeps the screen awake while cooking, where the browser allows it. */
function useWakeLock() {
  useEffect(() => {
    let lock: { release: () => Promise<void> } | null = null;
    const req = async () => {
      try {
        const wl = (navigator as unknown as { wakeLock?: { request: (t: 'screen') => Promise<{ release: () => Promise<void> }> } }).wakeLock;
        lock = (await wl?.request('screen')) ?? null;
      } catch { lock = null; }
    };
    void req();
    const onVis = () => document.visibilityState === 'visible' && void req();
    document.addEventListener('visibilitychange', onVis);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      void lock?.release().catch(() => undefined);
    };
  }, []);
}

/* ------------------------------------------------------------- steps */

function Steps({ c, recipe, nav }: { c: CookSession; recipe: Recipe; nav: Nav }) {
  const { data, dispatch } = useApp();
  const step = recipe.steps[c.step];
  const total = recipe.steps.length;
  const last = c.step === total - 1;
  const stirImg = usePortrait(data.profile!.avatar, 'stir');
  const cheerImg = usePortrait(data.profile!.avatar, 'cheer');
  const [now, setNow] = useState(() => Date.now());
  const [listOpen, setListOpen] = useState(false);
  const alarmed = useRef<Set<number>>(new Set());
  useWakeLock();

  // Tick only while something is running.
  const anyRunning = Object.values(c.timers).some((t) => isRunning(t, now));
  useEffect(() => {
    if (!anyRunning) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [anyRunning]);
  useEffect(() => {
    const onVis = () => setNow(Date.now());
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  // Fire the alarm once per timer when it crosses zero.
  useEffect(() => {
    for (const [k, t] of Object.entries(c.timers)) {
      const idx = Number(k);
      if (t.endsAt != null && t.endsAt <= now && !alarmed.current.has(idx)) {
        alarmed.current.add(idx);
        chime();
      }
      if (t.endsAt == null || t.endsAt > now) alarmed.current.delete(idx);
    }
  }, [now, c.timers]);

  const timer = c.timers[c.step];
  const durationMs = (step.minutes ?? 0) * 60_000;
  const timerDone = !!step.minutes && isFinished(timer, now) && timer?.endsAt != null;
  const others = Object.entries(c.timers)
    .map(([k, t]) => ({ k: Number(k), t }))
    .filter(({ k, t }) => k !== c.step && (isRunning(t, now) || (t.endsAt != null && t.endsAt <= now)));
  const line = cookLine(step, c.step, total, timerDone, CHEF_BY_ID[data.profile!.chefId].lines);
  const go = (n: number) => { dispatch({ type: 'cookStep', step: n }); window.scrollTo({ top: 0 }); };

  return (
    <div className="cook">
      <header className="cook-head">
        <button type="button" className="icon-btn" onClick={() => nav('kitchen')} aria-label="Pause cooking and leave. You can resume from the kitchen.">
          <Icon name="close" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="cook-recipe">{recipe.name}</p>
          <div className="progress" role="group" aria-label={`Steps, on ${c.step + 1} of ${total}`}>
            {recipe.steps.map((_, k) => (
              <button
                key={k}
                type="button"
                className={`progress-seg ${k < c.step ? 'is-done' : k === c.step ? 'is-now' : ''}`}
                onClick={() => go(k)}
                aria-label={`Go to step ${k + 1}`}
                aria-current={k === c.step ? 'step' : undefined}
              />
            ))}
          </div>
        </div>
        <button type="button" className="icon-btn" onClick={() => setListOpen(true)} aria-label="Ingredients for this recipe">
          <Icon name="list" />
        </button>
      </header>

      {others.length > 0 && (
        <div className="other-timers">
          {others.map(({ k, t }) => (
            <button key={k} type="button" className={`ot ${t.endsAt != null && t.endsAt <= now ? 'is-done' : ''}`} onClick={() => go(k)}>
              <Icon name="clock" size={16} /> Step {k + 1} · {t.endsAt != null && t.endsAt <= now ? 'Time’s up' : formatClock(remainingMs(t, now))}
            </button>
          ))}
        </div>
      )}

      <div className="cook-body" key={c.step}>
        <p className="cook-count">Step {c.step + 1} of {total}</p>
        <h1 className="cook-title">{step.title}</h1>
        <p className="cook-text">{scaleText(step.text, c.servings)}</p>

        {(step.heat || step.temperatureC != null) && (
          <div className="cook-facts">
            {step.heat && (
              <div className={`fact fact--heat heat-${step.heat.toLowerCase().replace(/\s|-/g, '')}`}>
                <Icon name={step.heat === 'Oven' ? 'pan' : 'flame'} size={20} />
                <div>
                  <p className="fact-k">Heat</p>
                  <p className="fact-v">{step.heat}</p>
                </div>
                {step.heat !== 'Oven' && step.heat !== 'Off' && <HeatDial heat={step.heat} />}
              </div>
            )}
            {step.temperatureC != null && (
              <div className="fact fact--temp">
                <Icon name="thermo" size={20} />
                <div>
                  <p className="fact-k">{step.tempLabel ?? 'Temperature'}</p>
                  <p className="fact-v">{step.temperatureC}°C <span className="fact-f">{step.temperatureF}°F</span></p>
                </div>
              </div>
            )}
          </div>
        )}

        {step.minutes != null && step.minutes > 0 && (
          <TimerCard
            timer={timer}
            now={now}
            durationMs={durationMs}
            onStart={() => { primeAudio(); dispatch({ type: 'timerStart', step: c.step, durationMs, now: Date.now() }); }}
            onPause={() => dispatch({ type: 'timerPause', step: c.step, now: Date.now() })}
            onReset={() => dispatch({ type: 'timerReset', step: c.step, durationMs })}
          />
        )}

        {step.note && <p className="cook-note">{step.note}</p>}

        <div className="cook-chef">
          <img key={`${c.step}:${timerDone}`} src={timerDone ? cheerImg : stirImg} alt="" className={timerDone ? 'is-cheer' : 'is-react'} />
          <p className="cook-bubble" key={line}>{line}</p>
        </div>
      </div>

      <footer className="cook-foot">
        <Btn variant="soft" onClick={() => go(c.step - 1)} disabled={c.step === 0} aria-label="Previous step">
          <Icon name="chev-l" /> Back
        </Btn>
        {last ? (
          <Btn onClick={() => { dispatch({ type: 'cookPhase', phase: 'confirm' }); window.scrollTo({ top: 0 }); }}>
            Finish <Icon name="check" />
          </Btn>
        ) : (
          <Btn onClick={() => go(c.step + 1)}>Next <Icon name="chev-r" /></Btn>
        )}
      </footer>

      <Sheet open={listOpen} onClose={() => setListOpen(false)} title={`For ${c.servings === 1 ? 'one' : c.servings}`}>
        <ul className="mini-list">
          {recipe.ingredients.map((r) => {
            const ing = INGREDIENT_BY_ID[r.ingredientId];
            const q = r.quantity * c.servings;
            return (
              <li key={r.ingredientId}>
                <IngredientIcon ing={ing} size={28} />
                <span className="flex-1 font-bold">{ing.name}{r.optional && <span className="opt ml-1.5">optional</span>}</span>
                <span className="text-muted font-bold">{formatQty(q)} {formatUnit(ing.unit, q)}</span>
              </li>
            );
          })}
        </ul>
        <ul className="mini-list">
          {recipe.seasonings.map((s) => (
            <li key={s.seasoningId}>
              <span className="mini-dot" style={{ background: SEASON[s.seasoningId]?.color }} aria-hidden="true" />
              <span className="flex-1 font-bold">{SEASON[s.seasoningId]?.name}{s.optional && <span className="opt ml-1.5">optional</span>}</span>
              <span className="text-muted font-bold">{formatSeasoningAmount(s.amount, s.unit, c.servings)}</span>
            </li>
          ))}
        </ul>
      </Sheet>
    </div>
  );
}

const HEAT_LEVEL: Record<string, number> = { Low: 1, 'Medium-low': 2, Medium: 3, 'Medium-high': 4, High: 5 };
function HeatDial({ heat }: { heat: string }) {
  const n = HEAT_LEVEL[heat] ?? 0;
  return (
    <div className="dial" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((k) => <span key={k} className={k <= n ? 'on' : ''} style={{ height: 6 + k * 3 }} />)}
    </div>
  );
}

function TimerCard({ timer, now, durationMs, onStart, onPause, onReset }: {
  timer: CookSession['timers'][number] | undefined; now: number; durationMs: number;
  onStart: () => void; onPause: () => void; onReset: () => void;
}) {
  const running = isRunning(timer, now);
  const left = timer ? remainingMs(timer, now) : durationMs;
  const done = !!timer && left <= 0;
  const started = !!timer && (running || left < durationMs);
  const frac = durationMs ? 1 - left / durationMs : 0;
  const R = 52, C = 2 * Math.PI * R;
  return (
    <section className={`timer ${done ? 'is-done' : running ? 'is-running' : ''}`} aria-label="Step timer">
      <div className="timer-ring">
        <svg viewBox="0 0 120 120" aria-hidden="true">
          <circle cx="60" cy="60" r={R} className="ring-bg" />
          <circle cx="60" cy="60" r={R} className="ring-fg" strokeDasharray={C} strokeDashoffset={C * (1 - Math.min(1, frac))} transform="rotate(-90 60 60)" />
        </svg>
        <div className="timer-read">
          <span className="timer-clock" role="timer" aria-live={done ? 'assertive' : 'off'}>{done ? 'Done!' : formatClock(left)}</span>
          <span className="timer-sub">{done ? 'Time’s up' : running ? 'running' : started ? 'paused' : `${Math.round(durationMs / 60000)} min`}</span>
        </div>
      </div>
      <div className="timer-btns">
        {done ? (
          <Btn variant="soft" onClick={onReset}><Icon name="reset" size={18} /> Reset</Btn>
        ) : running ? (
          <Btn variant="soft" onClick={onPause}><Icon name="pause" size={18} /> Pause</Btn>
        ) : (
          <Btn onClick={onStart}><Icon name="play" size={18} /> {started ? 'Resume' : 'Start timer'}</Btn>
        )}
        {started && !done && (
          <Btn variant="ghost" onClick={onReset} aria-label="Reset timer"><Icon name="reset" size={18} /></Btn>
        )}
      </div>
    </section>
  );
}

/* ----------------------------------------------------------- confirm */

function Confirm({ c, recipe }: { c: CookSession; recipe: Recipe }) {
  const { data, dispatch } = useApp();
  const chefImg = usePortrait(data.profile!.avatar, 'think');
  const { rows, notInFridge } = useMemo(
    () => estimateUsage(recipe, data.inventory, data.seasonings, c.servings),
    // Estimate once, from the fridge as it was when cooking finished.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [recipe.id],
  );
  const [used, setUsed] = useState<Record<string, number>>(() => Object.fromEntries(rows.map((r) => [r.ingredientId, r.estimate])));
  const set = (id: string, v: number, max: number) => setUsed((u) => ({ ...u, [id]: Math.max(0, Math.min(max, Math.round(v * 100) / 100)) }));

  return (
    <div className="confirm">
      <header className="confirm-head">
        <img src={chefImg} alt="" className="confirm-chef" />
        <div className="min-w-0">
          <p className="eyebrow">{recipe.name}</p>
          <h1 className="font-display text-[30px] font-semibold leading-[1.05]">Almost done, {chefName(data.profile!.surname)}!</h1>
          <p className="mt-1 font-display italic text-[17px] text-[color:var(--walnut)]">“Let’s update your fridge.”</p>
        </div>
      </header>

      <p className="confirm-help">These are estimates for {c.servings === 1 ? 'one serving' : `${c.servings} servings`}. Adjust anything you used more or less of. Nothing changes until you confirm.</p>

      {rows.length === 0 ? (
        <p className="confirm-empty">None of this recipe’s ingredients are tracked in your fridge, so there’s nothing to update.</p>
      ) : (
        <ul className="usage">
          <li className="usage-headrow" aria-hidden="true">
            <span /> <span>Before</span><span className="text-center">Used</span><span className="text-right">After</span>
          </li>
          {rows.map((r) => {
            const ing = INGREDIENT_BY_ID[r.ingredientId];
            const u = used[r.ingredientId] ?? 0;
            const after = Math.round((r.before - u) * 100) / 100;
            return (
              <li key={r.ingredientId} className="usage-row">
                <div className="usage-name">
                  <IngredientIcon ing={ing} size={30} />
                  <span className="min-w-0">
                    <b className="block truncate">{ing.name}</b>
                    <span className="usage-unit">{formatUnit(ing.unit, 2)}{r.optional ? ' · optional' : ''}</span>
                  </span>
                </div>
                <span className="usage-num" aria-label={`Before ${formatQty(r.before)}`}>{formatQty(r.before)}</span>
                <div className="usage-step">
                  <button type="button" className="step" onClick={() => set(r.ingredientId, stepDown(ing, u), r.before)} aria-label={`Used less ${ing.name}`}><Icon name="minus" size={16} /></button>
                  <b className="usage-used" aria-live="polite">{formatQty(u)}</b>
                  <button type="button" className="step" onClick={() => set(r.ingredientId, stepUp(ing, u), r.before)} aria-label={`Used more ${ing.name}`} disabled={u >= r.before}><Icon name="plus" size={16} /></button>
                </div>
                <span className={`usage-num usage-after ${after <= 0 ? 'is-zero' : ''}`} aria-label={`After ${formatQty(after)}`}>{formatQty(after)}</span>
              </li>
            );
          })}
        </ul>
      )}
      {notInFridge.length > 0 && (
        <p className="confirm-note">Not tracked: {notInFridge.map((id) => INGREDIENT_BY_ID[id].name).join(', ')}. They weren’t in your fridge list.</p>
      )}

      <div className="confirm-foot">
        <Btn className="w-full btn--lg" onClick={() => dispatch({ type: 'confirmCook', used })}>
          {rows.length ? 'Update my fridge' : 'Finish'}
        </Btn>
        <div className="grid grid-cols-2 gap-2">
          <Btn variant="ghost" onClick={() => dispatch({ type: 'cookPhase', phase: 'cooking' })}><Icon name="chev-l" size={18} /> Steps</Btn>
          {rows.length > 0 && <Btn variant="ghost" onClick={() => dispatch({ type: 'confirmCook', used: {} })}>Don’t update</Btn>}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- enjoy */

function Enjoy({ c, recipe, nav, toast }: { c: CookSession; recipe: Recipe; nav: Nav; toast: (t: string) => void }) {
  const { data, dispatch } = useApp();
  const p = data.profile!;
  const saved = data.saved.includes(recipe.id);
  const [quip] = useState(() => {
    const day = weekday(new Date(c.deductedAt ?? Date.now()));
    const pool = [`Not bad for a ${day}, ${chefName(p.surname)}.`, 'Table for one, served with style.', 'You cooked. That counts for a lot.'];
    return pool[Math.floor(Math.random() * pool.length)];
  });
  const usage = (c.usage ?? []).filter((u) => u.used > 0);

  return (
    <div className="enjoy">
      <div className="enjoy-stage">
        <div className="enjoy-glow" aria-hidden="true" />
        <DishPhoto recipe={recipe} className="enjoy-dish" label={false} />
        <Chef3D avatar={p.avatar} action="cheer" className="enjoy-chef" />
        {p.pet !== 'none' && (
          <svg className={`enjoy-pet enjoy-pet--${p.pet}`} viewBox={p.pet === 'cat' ? '-4 -2 52 90' : '-2 18 104 52'} aria-hidden="true">
            <PetArt kind={p.pet} asleep={false} />
          </svg>
        )}
      </div>
      <div className="enjoy-body">
        <p className="eyebrow">{recipe.name}</p>
        <h1 className="font-display text-[38px] font-semibold leading-none">Dinner is served!</h1>
        <p className="mt-2 font-display italic text-[18px] text-[color:var(--walnut)]">“{quip}”</p>

        {usage.length > 0 ? (
          <section className="enjoy-fridge" aria-label="Fridge updated">
            <p className="eyebrow mb-2"><Icon name="check" size={14} /> Fridge updated</p>
            <ul>
              {usage.map((u) => {
                const ing = INGREDIENT_BY_ID[u.ingredientId];
                const after = Math.round((u.before - u.used) * 100) / 100;
                return (
                  <li key={u.ingredientId}>
                    <span className="flex-1 font-bold">{ing.name}</span>
                    <span className="text-muted">{formatQty(u.before)} → </span>
                    <b className={after <= 0 ? 'text-[color:var(--bad)]' : ''}>{after <= 0 ? 'out' : `${formatQty(after)} ${formatUnit(ing.unit, after)}`}</b>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : (
          <p className="mt-4 text-[14px] text-muted">Fridge left as it was.</p>
        )}

        <div className="enjoy-actions">
          <Btn className="w-full btn--lg" onClick={() => { dispatch({ type: 'endCook' }); nav('kitchen'); }}>Back to Kitchen</Btn>
          <div className="grid grid-cols-2 gap-2">
            <Btn variant="soft" onClick={() => { dispatch({ type: 'endCook' }); nav('kitchen'); nav('fridge'); }}>Cook Something Else</Btn>
            <Btn variant="soft" onClick={() => { dispatch({ type: 'toggleSaved', id: recipe.id }); toast(saved ? 'Removed from saved' : 'Saved to your recipes'); }} aria-pressed={saved}>
              <Icon name={saved ? 'bookmark-on' : 'bookmark'} size={18} /> {saved ? 'Saved' : 'Save Recipe'}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

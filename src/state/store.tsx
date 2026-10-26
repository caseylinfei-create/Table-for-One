import type { Avatar } from '../avatar/avatar';
import { voiceFor } from '../avatar/avatar';
import { createContext, useContext, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react';
import type { AppData, Filters, Pet, Profile, Servings, ChefId, ShoppingItem } from '../domain/types';
import { pauseTimer, resetTimer, startTimer } from '../domain/cook';
import { lookFor, type LookId } from '../art/themes';
import { INGREDIENT_BY_ID, SAMPLE_FRIDGE } from '../data/ingredients';
import { defaultData, storage } from '../storage/adapter';

export type NewShoppingItem = Omit<ShoppingItem, 'id' | 'purchased' | 'addedQty' | 'createdAt'>;

type Action =
  | { type: 'setProfile'; profile: Profile }
  | { type: 'updateProfile'; patch: Partial<{ chefId: ChefId; surname: string; pet: Pet; avatar: Avatar }> }
  | { type: 'setQty'; id: string; qty: number }
  | { type: 'addItem'; id: string; qty?: number }
  | { type: 'removeItem'; id: string }
  | { type: 'loadSample' }
  | { type: 'toggleSeasoning'; id: string }
  | { type: 'setServings'; servings: Servings }
  | { type: 'setFilters'; filters: Partial<Filters> }
  | { type: 'addShopping'; items: NewShoppingItem[] }
  | { type: 'toggleShopping'; id: string }
  | { type: 'removeShopping'; id: string }
  | { type: 'clearPurchased' }
  | { type: 'setShoppingQty'; id: string; qty: number }
  | { type: 'restoreShopping'; item: ShoppingItem; index: number }
  | { type: 'purchaseAll' }
  | { type: 'startCook'; recipeId: string; servings: Servings }
  | { type: 'cookStep'; step: number }
  | { type: 'cookPhase'; phase: 'cooking' | 'confirm' }
  | { type: 'timerStart'; step: number; durationMs: number; now: number }
  | { type: 'timerPause'; step: number; now: number }
  | { type: 'timerReset'; step: number; durationMs: number }
  | { type: 'confirmCook'; used: Record<string, number> }
  | { type: 'endCook' }
  | { type: 'toggleSaved'; id: string }
  | { type: 'setPalette'; palette: AppData['palette'] }
  | { type: 'reset' };

const now = () => new Date().toISOString();
const r2 = (n: number) => Math.round(n * 100) / 100;

function addQty(state: AppData, id: string, qty: number): AppData {
  const ing = INGREDIENT_BY_ID[id];
  if (!ing) return state;
  const existing = state.inventory.find((it) => it.ingredientId === id);
  if (existing) {
    return {
      ...state,
      inventory: state.inventory.map((it) =>
        it.ingredientId === id ? { ...it, quantity: Math.max(0, r2(it.quantity + qty)), updatedAt: now() } : it,
      ),
    };
  }
  if (qty <= 0) return state;
  return { ...state, inventory: [{ ingredientId: id, quantity: r2(qty), unit: ing.unit, updatedAt: now() }, ...state.inventory] };
}

function reducer(state: AppData, a: Action): AppData {
  switch (a.type) {
    case 'setProfile':
      return { ...state, profile: a.profile };
    case 'updateProfile':
      if (!state.profile) return state;
      return { ...state, profile: { ...state.profile, ...a.patch, ...(a.patch.avatar ? { chefId: voiceFor(a.patch.avatar) } : {}) } };
    case 'setQty':
      return {
        ...state,
        inventory: state.inventory.map((it) =>
          it.ingredientId === a.id ? { ...it, quantity: Math.max(0, r2(a.qty)), updatedAt: now() } : it,
        ),
      };
    case 'addItem': {
      const ing = INGREDIENT_BY_ID[a.id];
      return ing ? addQty(state, a.id, a.qty ?? ing.defaultQty) : state;
    }
    case 'removeItem':
      return { ...state, inventory: state.inventory.filter((it) => it.ingredientId !== a.id) };
    case 'loadSample':
      return {
        ...state,
        inventory: SAMPLE_FRIDGE.map(([id, q]) => ({
          ingredientId: id, quantity: q, unit: INGREDIENT_BY_ID[id].unit, updatedAt: now(),
        })),
      };
    case 'toggleSeasoning':
      return { ...state, seasonings: { ...state.seasonings, [a.id]: !state.seasonings[a.id] } };
    case 'setServings':
      return { ...state, servings: a.servings };
    case 'setFilters':
      return { ...state, filters: { ...state.filters, ...a.filters } };

    case 'addShopping': {
      let shopping = [...state.shopping];
      for (const item of a.items) {
        const open = shopping.find((s) => !s.purchased && s.kind === item.kind && s.refId === item.refId);
        if (!open) {
          shopping.push({ ...item, id: `${item.kind}:${item.refId}:${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`, purchased: false, createdAt: now() });
          continue;
        }
        const recipe = item.fromRecipes[0];
        if (recipe && open.fromRecipes.includes(recipe)) continue; // same recipe added twice: no change
        shopping = shopping.map((s) =>
          s.id === open.id
            ? { ...s, quantity: s.quantity != null && item.quantity != null ? r2(s.quantity + item.quantity) : s.quantity, fromRecipes: [...s.fromRecipes, ...item.fromRecipes] }
            : s,
        );
      }
      return { ...state, shopping };
    }
    case 'toggleShopping': {
      const item = state.shopping.find((s) => s.id === a.id);
      if (!item) return state;
      let next: AppData = state;
      let addedQty = item.addedQty;
      if (item.kind === 'ingredient') {
        if (!item.purchased) {
          // Check: put it in the fridge once and remember how much.
          const q = item.quantity ?? INGREDIENT_BY_ID[item.refId]?.defaultQty ?? 1;
          next = addQty(next, item.refId, q);
          addedQty = q;
        } else if (item.addedQty) {
          // Uncheck: take back exactly what checking added.
          next = addQty(next, item.refId, -item.addedQty);
          addedQty = 0;
        }
      } else {
        next = { ...next, seasonings: { ...next.seasonings, [item.refId]: !item.purchased } };
      }
      return {
        ...next,
        shopping: next.shopping.map((s) => (s.id === a.id ? { ...s, purchased: !s.purchased, addedQty } : s)),
      };
    }
    case 'removeShopping':
      return { ...state, shopping: state.shopping.filter((s) => s.id !== a.id) };
    case 'setShoppingQty':
      return { ...state, shopping: state.shopping.map((s) => (s.id === a.id && !s.purchased ? { ...s, quantity: Math.max(0, r2(a.qty)) } : s)) };
    case 'restoreShopping': {
      const list = [...state.shopping];
      list.splice(Math.min(a.index, list.length), 0, a.item);
      return { ...state, shopping: list };
    }
    case 'purchaseAll':
      return state.shopping.filter((s) => !s.purchased).reduce((st, s) => reducer(st, { type: 'toggleShopping', id: s.id }), state);
    case 'clearPurchased':
      return { ...state, shopping: state.shopping.filter((s) => !s.purchased) };
    case 'startCook':
      return {
        ...state,
        cook: {
          id: `${a.recipeId}:${Date.now().toString(36)}`,
          recipeId: a.recipeId, servings: a.servings, step: 0, timers: {},
          startedAt: now(), phase: 'cooking',
        },
      };
    case 'cookStep':
      return state.cook ? { ...state, cook: { ...state.cook, step: a.step } } : state;
    case 'cookPhase':
      return state.cook && !state.cook.deductedAt ? { ...state, cook: { ...state.cook, phase: a.phase } } : state;
    case 'timerStart': {
      if (!state.cook) return state;
      const t = startTimer(state.cook.timers[a.step], a.durationMs, a.now);
      return { ...state, cook: { ...state.cook, timers: { ...state.cook.timers, [a.step]: t } } };
    }
    case 'timerPause': {
      const t = state.cook?.timers[a.step];
      if (!state.cook || !t) return state;
      return { ...state, cook: { ...state.cook, timers: { ...state.cook.timers, [a.step]: pauseTimer(t, a.now) } } };
    }
    case 'timerReset':
      if (!state.cook) return state;
      return { ...state, cook: { ...state.cook, timers: { ...state.cook.timers, [a.step]: resetTimer(a.durationMs) } } };
    case 'confirmCook': {
      const c = state.cook;
      if (!c) return state;
      // Deduct exactly once per session, however many times this screen is confirmed.
      if (c.deductedAt) return { ...state, cook: { ...c, phase: 'done' } };
      let next: AppData = state;
      const usage: NonNullable<typeof c.usage> = [];
      for (const [id, used] of Object.entries(a.used)) {
        const item = next.inventory.find((i) => i.ingredientId === id);
        if (!item || used <= 0) continue;
        const u = Math.min(item.quantity, used);
        usage.push({ ingredientId: id, before: item.quantity, used: u });
        next = { ...next, inventory: next.inventory.map((i) => (i.ingredientId === id ? { ...i, quantity: r2(i.quantity - u), updatedAt: now() } : i)) };
      }
      return {
        ...next,
        cook: { ...c, phase: 'done', deductedAt: now(), usage },
        history: [{ recipeId: c.recipeId, at: now() }, ...next.history].slice(0, 100),
      };
    }
    case 'endCook':
      return { ...state, cook: null };
    case 'toggleSaved':
      return { ...state, saved: state.saved.includes(a.id) ? state.saved.filter((x) => x !== a.id) : [a.id, ...state.saved] };
    case 'setPalette':
      return { ...state, palette: a.palette };
    case 'reset':
      return defaultData();
  }
}

const Ctx = createContext<{ data: AppData; dispatch: (a: Action) => void; look: LookId } | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, dispatch] = useReducer(reducer, undefined, () => storage.load() ?? defaultData());
  useEffect(() => storage.save(data), [data]);
  // Resolve Auto against the clock now, every minute, and whenever the app comes back to the foreground.
  const [look, setLook] = useState<LookId>(() => lookFor(data.palette));
  useEffect(() => {
    const check = () => setLook(lookFor(data.palette));
    check();
    const id = window.setInterval(check, 60_000);
    document.addEventListener('visibilitychange', check);
    window.addEventListener('focus', check);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', check);
      window.removeEventListener('focus', check);
    };
  }, [data.palette]);
  const firstLook = useRef(true);
  useEffect(() => {
    const root = document.documentElement;
    if (!firstLook.current && root.dataset.palette !== look) {
      // Soft crossfade when the look changes while the app is open.
      root.classList.add('look-shift');
      window.setTimeout(() => root.classList.remove('look-shift'), 900);
    }
    firstLook.current = false;
    root.dataset.palette = look;
    const bg = getComputedStyle(root).getPropertyValue('--cream').trim();
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', bg);
  }, [look]);
  const value = useMemo(() => ({ data, dispatch, look }), [data, look]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp outside AppProvider');
  return v;
}

export function chefName(surname: string) {
  const s = surname.trim();
  return s ? `Chef ${s.charAt(0).toUpperCase()}${s.slice(1)}` : 'Chef';
}

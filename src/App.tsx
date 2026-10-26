import { useCallback, useEffect, useRef, useState } from 'react';
import { AppProvider, useApp } from './state/store';
import { Setup } from './screens/Setup';
import { Kitchen } from './screens/Kitchen';
import { Fridge } from './screens/Fridge';
import { Seasonings } from './screens/Seasonings';
import { Profile } from './screens/Profile';
import { Results } from './screens/Results';
import { RecipeDetail } from './screens/RecipeDetail';
import { Library } from './screens/Library';
import { Shopping } from './screens/Shopping';
import { Cook } from './screens/Cook';
import { Icon, Toast, type ToastAction } from './components/ui';

export type Screen = 'kitchen' | 'fridge' | 'seasoning' | 'results' | 'recipe' | 'recipes' | 'shopping' | 'profile' | 'cook';
export type NavOpts = { add?: boolean; recipeId?: string; surprise?: boolean };
export type Nav = (s: Screen, opts?: NavOpts) => void;
type Route = { screen: Screen; opts: NavOpts };

const TABS: Screen[] = ['kitchen', 'recipes', 'shopping', 'profile'];

function Shell() {
  const { data } = useApp();
  // A small history stack so Back returns to wherever you came from.
  const [stack, setStack] = useState<Route[]>([{ screen: 'kitchen', opts: {} }]);
  const route = stack[stack.length - 1];
  const [picked, setPicked] = useState<string[]>([]);
  // Direction of the last move, for the screen transition.
  const [dir, setDir] = useState<'forward' | 'back' | 'tab' | 'none'>('none');
  const mainRef = useRef<HTMLElement>(null);
  const [toastText, setToastText] = useState<string | null>(null);
  const timer = useRef<number>();

  const [toastAction, setToastAction] = useState<ToastAction | null>(null);
  const toast = useCallback((t: string, action?: ToastAction) => {
    setToastText(t);
    setToastAction(action ? { label: action.label, onClick: () => { action.onClick(); setToastText(null); setToastAction(null); } } : null);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => { setToastText(null); setToastAction(null); }, action ? 4500 : 1800);
  }, []);

  const nav: Nav = useCallback((s, opts = {}) => {
    setStack((st) => {
      const earlier = st.slice(0, -1).some((r) => r.screen === s);
      setDir(earlier ? 'back' : TABS.includes(s) ? 'tab' : 'forward');
      return TABS.includes(s) ? [{ screen: s, opts }] : [...st, { screen: s, opts }];
    });
    window.scrollTo({ top: 0 });
  }, []);
  const back = useCallback(() => {
    setDir('back');
    setStack((st) => (st.length > 1 ? st.slice(0, -1) : [{ screen: 'kitchen', opts: {} }]));
    window.scrollTo({ top: 0 });
  }, []);

  // Move focus to the new screen's heading so screen readers announce it.
  useEffect(() => {
    if (dir === 'none') return;
    const h = mainRef.current?.querySelector<HTMLElement>('h1');
    if (h) {
      h.setAttribute('tabindex', '-1');
      h.focus({ preventScroll: true });
    }
  }, [stack, dir]);

  useEffect(() => {
    if (!data.profile) setStack([{ screen: 'kitchen', opts: {} }]);
  }, [data.profile]);

  // Drop picks for ingredients that left the fridge.
  useEffect(() => {
    setPicked((p) => p.filter((id) => data.inventory.some((i) => i.ingredientId === id && i.quantity > 0)));
  }, [data.inventory]);

  if (!data.profile) return <Setup />;

  const screen = route.screen;
  const tabOf: Record<Screen, Screen> = {
    kitchen: 'kitchen', fridge: 'kitchen', seasoning: 'kitchen', results: 'kitchen',
    recipe: stack.some((r) => r.screen === 'recipes') ? 'recipes' : stack.some((r) => r.screen === 'shopping') ? 'shopping' : 'kitchen',
    recipes: 'recipes', shopping: 'shopping', profile: 'profile', cook: 'kitchen',
  };
  const tab = tabOf[screen];
  const toBuy = data.shopping.filter((s) => !s.purchased).length;
  const hideTabs = screen === 'fridge' || screen === 'recipe' || screen === 'cook';

  return (
    <div className={`shell shell--${screen}`}>
      <main ref={mainRef} className={`shell-main nav-${dir}`} key={`${screen}:${route.opts.recipeId ?? ''}:${stack.length}`}>
        {screen === 'kitchen' && <Kitchen nav={nav} />}
        {screen === 'fridge' && (
          <Fridge nav={nav} startAdding={route.opts.add} toast={toast} selected={picked} setSelected={setPicked} />
        )}
        {screen === 'seasoning' && <Seasonings nav={nav} />}
        {screen === 'results' && <Results nav={nav} picked={picked} surprise={route.opts.surprise} onBack={back} />}
        {screen === 'recipe' && route.opts.recipeId && <RecipeDetail recipeId={route.opts.recipeId} onBack={back} toast={toast} nav={nav} />}
        {screen === 'recipes' && <Library nav={nav} />}
        {screen === 'shopping' && <Shopping nav={nav} toast={toast} />}
        {screen === 'profile' && <Profile toast={toast} />}
        {screen === 'cook' && <Cook nav={nav} toast={toast} />}
      </main>
      {!hideTabs && (
        <nav className="tabbar" aria-label="Main">
          {([
            ['kitchen', 'Kitchen', 'kitchen'],
            ['recipes', 'Recipes', 'book'],
            ['shopping', 'Shopping', 'basket'],
            ['profile', 'Profile', 'person'],
          ] as const).map(([id, label, icon]) => (
            <button
              key={id}
              type="button"
              className={`tab ${tab === id ? 'is-on' : ''}`}
              aria-current={tab === id ? 'page' : undefined}
              onClick={() => nav(id)}
            >
              <span className="tab-icon">
                <Icon name={icon} size={22} />
                {id === 'shopping' && toBuy > 0 && <span className="badge" aria-label={`${toBuy} to buy`}>{toBuy}</span>}
              </span>
              <span>{label}</span>
            </button>
          ))}
        </nav>
      )}
      <Toast text={toastText} action={toastAction} />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}

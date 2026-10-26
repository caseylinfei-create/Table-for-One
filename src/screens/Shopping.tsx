import { useMemo, useState } from 'react';
import { useApp } from '../state/store';
import { CATEGORIES, INGREDIENTS, INGREDIENT_BY_ID } from '../data/ingredients';
import { SEASONINGS } from '../data/seasonings';
import { RECIPE_BY_ID } from '../data/recipes';
import { IngredientIcon } from '../art/IngredientIcon';
import { formatQty, formatUnit, stepDown, stepUp } from '../domain/quantity';
import { Btn, Icon, type ToastAction } from '../components/ui';
import type { ShoppingItem } from '../domain/types';
import type { Nav } from '../App';

const SEASON = Object.fromEntries(SEASONINGS.map((s) => [s.id, s]));

type Hit = { kind: 'ingredient' | 'seasoning'; id: string; name: string };

function nameOf(s: ShoppingItem) {
  return s.kind === 'ingredient' ? INGREDIENT_BY_ID[s.refId]?.name : SEASON[s.refId]?.name;
}

/** Plain-text version of the list for pasting into a message or notes app. */
function listAsText(items: ShoppingItem[]) {
  const open = items.filter((s) => !s.purchased);
  return ['Shopping list (Table for One)', ...open.map((s) => {
    const ing = s.kind === 'ingredient' ? INGREDIENT_BY_ID[s.refId] : null;
    return `• ${ing && s.quantity != null ? `${formatQty(s.quantity)} ${formatUnit(ing.unit, s.quantity)} ` : ''}${nameOf(s)}`;
  })].join('\n');
}

export function Shopping({ nav, toast }: { nav: Nav; toast: (t: string, action?: ToastAction) => void }) {
  const { data, dispatch } = useApp();
  const items = data.shopping;
  const open = items.filter((s) => !s.purchased).length;
  const done = items.length - open;
  const [q, setQ] = useState('');
  const [copied, setCopied] = useState(false);

  const hits = useMemo<Hit[]>(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    const onList = new Set(items.filter((i) => !i.purchased).map((i) => `${i.kind}:${i.refId}`));
    const ing: Hit[] = INGREDIENTS.filter((i) => i.name.toLowerCase().includes(s) || (i.aliases ?? []).some((a) => a.includes(s)))
      .map((i) => ({ kind: 'ingredient', id: i.id, name: i.name }));
    const sea: Hit[] = SEASONINGS.filter((x) => x.name.toLowerCase().includes(s)).map((x) => ({ kind: 'seasoning', id: x.id, name: x.name }));
    return [...ing, ...sea].filter((h) => !onList.has(`${h.kind}:${h.id}`)).slice(0, 6);
  }, [q, items]);

  const add = (h: Hit) => {
    const ing = h.kind === 'ingredient' ? INGREDIENT_BY_ID[h.id] : null;
    dispatch({ type: 'addShopping', items: [{ kind: h.kind, refId: h.id, quantity: ing?.defaultQty, unit: ing?.unit, fromRecipes: [] }] });
    setQ('');
    toast(`Added ${h.name}`);
  };

  const remove = (s: ShoppingItem) => {
    const index = items.findIndex((x) => x.id === s.id);
    dispatch({ type: 'removeShopping', id: s.id });
    toast(`Removed ${nameOf(s)}`, { label: 'Undo', onClick: () => dispatch({ type: 'restoreShopping', item: s, index }) });
  };

  const copy = async () => {
    const text = listAsText(items);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast('List copied');
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast('Couldn’t copy. Long-press the list to select it.');
    }
  };

  const groups: { label: string; list: ShoppingItem[] }[] = [
    ...CATEGORIES.filter((c) => c.id !== 'all').map((c) => ({
      label: c.label,
      list: items.filter((s) => s.kind === 'ingredient' && INGREDIENT_BY_ID[s.refId]?.category === c.id),
    })),
    { label: 'Seasonings', list: items.filter((s) => s.kind === 'seasoning') },
  ]
    .map((g) => ({ ...g, list: [...g.list].sort((a, b) => Number(a.purchased) - Number(b.purchased)) }))
    .filter((g) => g.list.length);

  return (
    <div className="page shop-page">
      <p className="eyebrow">Shopping list</p>
      <h1 className="font-display text-[30px] leading-tight">To pick up</h1>

      {items.length > 0 && (
        <div className="shop-progress" aria-label={`${done} of ${items.length} in the basket`}>
          <div className="shop-bar"><span style={{ width: `${(done / items.length) * 100}%` }} /></div>
          <p><b>{done}</b> of {items.length} in the basket</p>
        </div>
      )}

      <div className="search mt-3">
        <Icon name="plus" size={18} />
        <label htmlFor="shop-add" className="sr-only">Add an item</label>
        <input
          id="shop-add"
          placeholder="Add an item, e.g. milk, garlic"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && hits[0]) add(hits[0]); }}
          autoComplete="off"
        />
      </div>
      {hits.length > 0 && (
        <ul className="shop-hits" aria-label="Suggestions">
          {hits.map((h) => (
            <li key={`${h.kind}:${h.id}`}>
              <button type="button" className="add-row" onClick={() => add(h)}>
                {h.kind === 'ingredient'
                  ? <IngredientIcon ing={INGREDIENT_BY_ID[h.id]} size={28} />
                  : <span className="shop-dot" style={{ background: SEASON[h.id]?.color }} aria-hidden="true" />}
                <span className="flex-1 text-left font-bold">{h.name}</span>
                <span className="text-[12px] text-muted">{h.kind === 'seasoning' ? 'seasoning' : `+${formatQty(INGREDIENT_BY_ID[h.id].defaultQty)} ${formatUnit(INGREDIENT_BY_ID[h.id].unit, INGREDIENT_BY_ID[h.id].defaultQty)}`}</span>
                <span className="add-plus"><Icon name="plus" size={16} /></span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {q.trim() && hits.length === 0 && <p className="mt-2 text-[13px] text-muted">Nothing new matches “{q}”.</p>}

      {items.length === 0 ? (
        <div className="empty">
          <p className="font-display text-[20px]">Nothing on the list</p>
          <p className="max-w-[30ch] text-[14px] text-muted">Add items above, or open a recipe and tap Add Missing Items.</p>
          <Btn variant="soft" onClick={() => nav('recipes')}>Browse recipes</Btn>
        </div>
      ) : (
        <>
          <div className="shop-tools">
            <Btn variant="soft" className="btn--sm" onClick={copy} disabled={open === 0}>
              <Icon name={copied ? 'check' : 'list'} size={16} /> {copied ? 'Copied' : 'Copy list'}
            </Btn>
            <Btn variant="soft" className="btn--sm" onClick={() => { dispatch({ type: 'purchaseAll' }); toast('All in the fridge'); }} disabled={open === 0}>
              <Icon name="check" size={16} /> Bought everything
            </Btn>
          </div>
          <p className="text-[13px] text-muted">Checking an item puts it in your fridge. Unchecking takes it back out.</p>
          <div className="mt-3 flex flex-col gap-5">
            {groups.map((g) => (
              <section key={g.label} aria-label={g.label}>
                <h2 className="eyebrow mb-2">{g.label}</h2>
                <ul className="shop-list">
                  {g.list.map((s) => (
                    <Row
                      key={s.id}
                      s={s}
                      onToggle={() => {
                        dispatch({ type: 'toggleShopping', id: s.id });
                        const nm = nameOf(s);
                        toast(s.purchased ? `Took ${nm} back out` : s.kind === 'ingredient' ? `${nm} is in the fridge` : `${nm} is on the shelf`);
                      }}
                      onQty={(qty) => dispatch({ type: 'setShoppingQty', id: s.id, qty })}
                      onRemove={() => remove(s)}
                    />
                  ))}
                </ul>
              </section>
            ))}
            {done > 0 && (
              <Btn variant="ghost" className="w-full" onClick={() => dispatch({ type: 'clearPurchased' })}>
                Clear {done} checked {done === 1 ? 'item' : 'items'}
              </Btn>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function Row({ s, onToggle, onQty, onRemove }: { s: ShoppingItem; onToggle: () => void; onQty: (q: number) => void; onRemove: () => void }) {
  const ing = s.kind === 'ingredient' ? INGREDIENT_BY_ID[s.refId] : null;
  const name = nameOf(s);
  const from = s.fromRecipes.map((id) => RECIPE_BY_ID[id]?.name).filter(Boolean);
  const q = s.quantity ?? 0;
  return (
    <li className={`shop ${s.purchased ? 'is-done' : ''}`}>
      <button type="button" className="shop-main" onClick={onToggle} aria-pressed={s.purchased} aria-label={`${name}${s.purchased ? ', in the basket' : ''}`}>
        <span className="shop-box" aria-hidden="true">{s.purchased && <Icon name="check" size={16} />}</span>
        {ing ? <IngredientIcon ing={ing} size={30} /> : <span className="shop-dot" style={{ background: SEASON[s.refId]?.color }} aria-hidden="true" />}
        <span className="min-w-0 flex-1 text-left">
          <span className="shop-name">{name}</span>
          <span className="shop-from">{from.length ? `for ${from.join(', ')}` : ing ? 'added by you' : 'seasoning'}</span>
        </span>
      </button>
      {ing && !s.purchased ? (
        <div className="stepper stepper--sm">
          {q <= ing.step ? (
            <button type="button" className="step step--quiet" onClick={onRemove} aria-label={`Remove ${name}`}><Icon name="trash" size={16} /></button>
          ) : (
            <button type="button" className="step" onClick={() => onQty(stepDown(ing, q))} aria-label={`Less ${name}`}><Icon name="minus" size={16} /></button>
          )}
          <span className="qty"><b>{formatQty(q)}</b><small>{formatUnit(ing.unit, q)}</small></span>
          <button type="button" className="step" onClick={() => onQty(stepUp(ing, q))} aria-label={`More ${name}`}><Icon name="plus" size={16} /></button>
        </div>
      ) : ing && s.quantity != null ? (
        <span className="shop-qty-done">{formatQty(q)} {formatUnit(ing.unit, q)}</span>
      ) : null}
      {(!ing || s.purchased) && (
        <button type="button" className="step step--quiet" onClick={onRemove} aria-label={`Remove ${name}`}>
          <Icon name="trash" size={18} />
        </button>
      )}
    </li>
  );
}

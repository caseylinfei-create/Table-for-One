import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../state/store';
import { KitchenScene } from '../art/KitchenScene';
import { SpeechBubble } from '../components/SpeechBubble';
import { chefLine } from '../domain/dialogue';
import { CATEGORIES, INGREDIENTS, INGREDIENT_BY_ID } from '../data/ingredients';
import { IngredientIcon } from '../art/IngredientIcon';
import { estimateGrams, formatQty, formatUnit, stepDown, stepUp } from '../domain/quantity';
import { Btn, Icon, Segmented, Sheet } from '../components/ui';
import type { CategoryId, Ingredient, InventoryItem, Servings } from '../domain/types';
import type { Nav } from '../App';

type Cat = CategoryId | 'all';

function matches(ing: Ingredient, q: string) {
  const s = q.trim().toLowerCase();
  if (!s) return true;
  return ing.name.toLowerCase().includes(s) || (ing.aliases ?? []).some((a) => a.includes(s));
}

export function Fridge({ nav, startAdding, toast, selected, setSelected }: {
  nav: Nav; startAdding?: boolean; toast: (t: string) => void;
  selected: string[]; setSelected: (fn: (s: string[]) => string[]) => void;
}) {
  const { data, dispatch } = useApp();
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState<Cat>('all');
  const [adding, setAdding] = useState(!!startAdding);
  const [line, setLine] = useState(() => chefLine({ kind: 'fridge', data, selected: [] }));

  useEffect(() => {
    setLine((l) => chefLine({ kind: 'fridge', data, selected }, l));
    // only react to selection changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected.length]);

  const items = useMemo(() => {
    return data.inventory
      .map((it) => ({ it, ing: INGREDIENT_BY_ID[it.ingredientId] }))
      .filter(({ ing }) => ing && (cat === 'all' || ing.category === cat) && matches(ing, query))
      .sort((a, b) => Number(b.it.quantity > 0) - Number(a.it.quantity > 0));
  }, [data.inventory, cat, query]);

  const inFridge = useMemo(() => new Set(data.inventory.map((i) => i.ingredientId)), [data.inventory]);
  const catalogHits = useMemo(
    () => (query.trim() ? INGREDIENTS.filter((i) => !inFridge.has(i.id) && matches(i, query) && (cat === 'all' || i.category === cat)).slice(0, 6) : []),
    [query, cat, inFridge],
  );

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const empty = data.inventory.length === 0;
  const countIn = (c: Cat) => data.inventory.filter((i) => c === 'all' || INGREDIENT_BY_ID[i.ingredientId]?.category === c).length;

  return (
    <div className="fridge">
      <div className="fridge-scene">
        <button type="button" className="back-btn back-btn--icon" onClick={() => nav('kitchen')} aria-label="Back to kitchen">
          <Icon name="back" size={22} />
        </button>
        <div className="scene-crop">
          <KitchenScene data={data} mode="fridge" reactKey={selected.length} bubble={<SpeechBubble text={line} compact />} />
        </div>
      </div>

      <section className="fridge-panel" aria-label="Fridge contents">
        <div className="panel-head">
          <div>
            <h1 className="font-display text-[26px] font-semibold leading-none">In your fridge</h1>
            <p className="mt-1 text-[14px] text-muted">
              {empty ? 'Nothing yet' : `${data.inventory.filter((i) => i.quantity > 0).length} items · tap to pick what to use`}
            </p>
          </div>
          <Btn variant="soft" onClick={() => setAdding(true)} className="btn--sm">
            <Icon name="plus" size={18} /> Add
          </Btn>
        </div>

        {!empty && (
          <>
            <div className="search">
              <Icon name="search" size={18} />
              <label htmlFor="fridge-search" className="sr-only">Search ingredients</label>
              <input
                id="fridge-search"
                placeholder="Search your fridge or add something"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoComplete="off"
              />
              {query && (
                <button type="button" className="icon-btn icon-btn--sm" onClick={() => setQuery('')} aria-label="Clear search">
                  <Icon name="close" size={16} />
                </button>
              )}
            </div>
            <div className="chips" role="tablist" aria-label="Categories">
              {CATEGORIES.filter((c) => c.id === 'all' || countIn(c.id) > 0).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  role="tab"
                  aria-selected={cat === c.id}
                  className={`chip ${cat === c.id ? 'is-on' : ''}`}
                  onClick={() => setCat(c.id)}
                >
                  {c.label}
                  <span className="chip-n">{countIn(c.id)}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {empty ? (
          <div className="empty">
            <p className="font-display text-[20px] font-semibold">Your fridge is empty</p>
            <p className="max-w-[30ch] text-[14px] text-muted">Add what you have and it stays here until you cook with it.</p>
            <Btn onClick={() => setAdding(true)}><Icon name="plus" size={18} /> Add Ingredients</Btn>
            <Btn variant="ghost" onClick={() => { dispatch({ type: 'loadSample' }); toast('Sample fridge loaded'); }}>
              Start with a sample fridge
            </Btn>
          </div>
        ) : (
          <ul className="ing-list" aria-label="Ingredients">
            {items.map(({ it, ing }) => (
              <IngredientRow
                key={it.ingredientId}
                item={it}
                ing={ing}
                selected={selected.includes(it.ingredientId)}
                onToggle={() => toggle(it.ingredientId)}
                onQty={(q) => dispatch({ type: 'setQty', id: it.ingredientId, qty: q })}
                onRemove={() => {
                  dispatch({ type: 'removeItem', id: it.ingredientId });
                  setSelected((s) => s.filter((x) => x !== it.ingredientId));
                  toast(`Removed ${ing.name}`);
                }}
              />
            ))}
            {items.length === 0 && !catalogHits.length && (
              <li className="py-6 text-center text-[14px] text-muted">Nothing matches “{query}”.</li>
            )}
            {catalogHits.length > 0 && (
              <li className="catalog-hits">
                <p className="eyebrow mb-2">Not in your fridge yet</p>
                <div className="flex flex-col gap-1.5">
                  {catalogHits.map((ing) => (
                    <button
                      key={ing.id}
                      type="button"
                      className="add-row"
                      onClick={() => { dispatch({ type: 'addItem', id: ing.id }); toast(`Added ${ing.name}`); }}
                    >
                      <IngredientIcon ing={ing} size={30} />
                      <span className="flex-1 text-left font-semibold">{ing.name}</span>
                      <span className="text-[13px] text-muted">+{formatQty(ing.defaultQty)} {formatUnit(ing.unit, ing.defaultQty)}</span>
                      <span className="add-plus"><Icon name="plus" size={16} /></span>
                    </button>
                  ))}
                </div>
              </li>
            )}
          </ul>
        )}

        <div className="fridge-foot">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[13px] font-bold uppercase tracking-[0.08em] text-muted" id="serv-l">Cooking for</span>
            <Segmented<Servings>
              id="servings"
              label="Cooking for"
              value={data.servings}
              onChange={(v) => dispatch({ type: 'setServings', servings: v })}
              options={[{ value: 1, label: 'Just me' }, { value: 2, label: '2' }, { value: 3, label: '3' }]}
            />
          </div>
          <Btn className="w-full btn--lg" onClick={() => nav('results')} disabled={empty}>
            Find Recipes{selected.length ? ` with ${selected.length}` : ''}
          </Btn>
        </div>
      </section>

      <AddSheet open={adding} onClose={() => setAdding(false)} toast={toast} />

    </div>
  );
}

function IngredientRow({ item, ing, selected, onToggle, onQty, onRemove }: {
  item: InventoryItem; ing: Ingredient; selected: boolean;
  onToggle: () => void; onQty: (q: number) => void; onRemove: () => void;
}) {
  const out = item.quantity <= 0;
  const g = estimateGrams(ing, item.quantity);
  return (
    <li className={`ing-row ${selected ? 'is-sel' : ''} ${out ? 'is-out' : ''}`}>
      <button
        type="button"
        className="ing-main"
        onClick={onToggle}
        aria-pressed={selected}
        aria-label={`${ing.name}, ${formatQty(item.quantity)} ${formatUnit(ing.unit, item.quantity)}${selected ? ', picked' : ''}`}
        disabled={out}
      >
        <span className="ing-check" aria-hidden="true">{selected && <Icon name="check" size={14} />}</span>
        <IngredientIcon ing={ing} />
        <span className="ing-text">
          <span className="ing-name">{ing.name}</span>
          <span className="ing-sub">
            {out ? 'Out' : selected ? 'Picked' : g ? `about ${g >= 1000 ? `${(g / 1000).toFixed(1)} kg` : `${g} g`}` : ''}
          </span>
        </span>
      </button>
      {out ? (
        <div className="flex items-center gap-1.5">
          <button type="button" className="step" onClick={() => onQty(ing.step)} aria-label={`Add ${ing.name}`}><Icon name="plus" size={18} /></button>
          <button type="button" className="step step--quiet" onClick={onRemove} aria-label={`Remove ${ing.name} from list`}><Icon name="trash" size={18} /></button>
        </div>
      ) : (
        <div className="stepper">
          <button type="button" className="step" onClick={() => onQty(stepDown(ing, item.quantity))} aria-label={`Less ${ing.name}`}>
            <Icon name="minus" size={18} />
          </button>
          <span className="qty" aria-live="polite">
            <b>{formatQty(item.quantity)}</b>
            <small>{formatUnit(ing.unit, item.quantity)}</small>
          </span>
          <button type="button" className="step" onClick={() => onQty(stepUp(ing, item.quantity))} aria-label={`More ${ing.name}`}>
            <Icon name="plus" size={18} />
          </button>
        </div>
      )}
    </li>
  );
}

function AddSheet({ open, onClose, toast }: { open: boolean; onClose: () => void; toast: (t: string) => void }) {
  const { data, dispatch } = useApp();
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState<Cat>('all');
  const qtyOf = (id: string) => data.inventory.find((i) => i.ingredientId === id)?.quantity;
  const list = INGREDIENTS.filter((i) => (cat === 'all' || i.category === cat) && matches(i, query));

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Add groceries"
      footer={<Btn className="w-full" onClick={onClose}>Done</Btn>}
    >
      <div className="search">
        <Icon name="search" size={18} />
        <label htmlFor="add-search" className="sr-only">Search all ingredients</label>
        <input id="add-search" placeholder="Search 90+ ingredients" value={query} onChange={(e) => setQuery(e.target.value)} autoComplete="off" />
      </div>
      <div className="chips">
        {CATEGORIES.map((c) => (
          <button key={c.id} type="button" className={`chip ${cat === c.id ? 'is-on' : ''}`} aria-pressed={cat === c.id} onClick={() => setCat(c.id)}>
            {c.label}
          </button>
        ))}
      </div>
      <div className="add-grid">
        {list.map((ing) => {
          const q = qtyOf(ing.id);
          const has = q !== undefined;
          return (
            <button
              key={ing.id}
              type="button"
              className={`add-tile ${has ? 'is-in' : ''}`}
              onClick={() => { dispatch({ type: 'addItem', id: ing.id }); toast(`${has ? 'More' : 'Added'} ${ing.name}`); }}
              aria-label={`Add ${ing.name}${has ? `, you have ${formatQty(q!)} ${formatUnit(ing.unit, q!)}` : ''}`}
            >
              <IngredientIcon ing={ing} size={40} />
              <span className="add-name">{ing.name}</span>
              <span className="add-sub">
                {has ? <><Icon name="check" size={13} /> {formatQty(q!)} {formatUnit(ing.unit, q!)}</> : `+${formatQty(ing.defaultQty)} ${formatUnit(ing.unit, ing.defaultQty)}`}
              </span>
            </button>
          );
        })}
        {list.length === 0 && <p className="col-span-full py-6 text-center text-[14px] text-muted">No ingredient called “{query}” yet.</p>}
      </div>
    </Sheet>
  );
}

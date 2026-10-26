import type { Recipe } from '../domain/types';
import type { IngredientLine } from '../domain/recommend';
import { INGREDIENT_BY_ID } from '../data/ingredients';
import { IngredientIcon } from '../art/IngredientIcon';
import { GameDish } from '../art/GameDish';
import { Icon } from './ui';

/** Game-style recipe showcase: rays, sparkles, wooden title plank, dish, ingredient tray. */
export function Showcase({ recipe, lines, banner = true, tray = true, className = '' }: {
  recipe: Recipe; lines?: IngredientLine[]; banner?: boolean; tray?: boolean; className?: string;
}) {
  const trayItems = (lines ?? recipe.ingredients.map((req) => ({ req, status: 'have' as const })))
    .filter((l) => !l.req.optional)
    .slice(0, 4);
  return (
    <div className={`show show--${recipe.cuisine.toLowerCase()} ${className}`} role="img" aria-label={`Illustration of ${recipe.name}`}>
      <div className="show-rays" aria-hidden="true" />
      <Sparkles />
      {banner && (
        <div className="show-banner" aria-hidden="true">
          <svg viewBox="0 0 320 76" preserveAspectRatio="none" className="show-plank">
            <defs>
              <linearGradient id="wood" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#D79A5B" />
                <stop offset="1" stopColor="#A9683A" />
              </linearGradient>
            </defs>
            <path d="M8 14 Q160 -4 312 14 L306 62 Q160 46 14 62 Z" fill="#7A4A26" />
            <path d="M12 12 Q160 -6 308 12 L302 58 Q160 42 18 58 Z" fill="url(#wood)" />
            <path d="M24 18 Q160 4 296 18" stroke="#F0C48E" strokeWidth="3" fill="none" opacity="0.7" strokeLinecap="round" />
          </svg>
          <span className="show-title">{recipe.name}</span>
          <span className="show-leaf show-leaf--l" />
          <span className="show-leaf show-leaf--r" />
        </div>
      )}
      <div className="show-dish"><GameDish recipe={recipe} /></div>
      {tray && (
        <div className="show-tray">
          {trayItems.map((l) => {
            const ing = INGREDIENT_BY_ID[l.req.ingredientId];
            return (
              <div key={l.req.ingredientId} className={`tray-item tray-item--${l.status}`}>
                <span className="tray-icon"><IngredientIcon ing={ing} size={40} /></span>
                <span className="tray-label">{ing.name}</span>
                {l.status === 'have' && lines && <span className="tray-mark"><Icon name="check" size={11} /></span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Sparkles() {
  const spots: [number, number, number][] = [[8, 30, 14], [88, 22, 12], [12, 62, 10], [90, 58, 15], [80, 78, 9], [20, 84, 8]];
  return (
    <svg className="show-sparkles" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      {spots.map(([x, y, s], k) => (
        <path
          key={k}
          className="spark"
          style={{ animationDelay: `${-k * 0.6}s`, transformOrigin: `${x}px ${y}px` }}
          d={`M${x} ${y - s / 4} Q${x + s / 20} ${y - s / 20} ${x + s / 5} ${y} Q${x + s / 20} ${y + s / 20} ${x} ${y + s / 4} Q${x - s / 20} ${y + s / 20} ${x - s / 5} ${y} Q${x - s / 20} ${y - s / 20} ${x} ${y - s / 4} Z`}
          fill="#FFE27A"
          stroke="#F2B533"
          strokeWidth="0.4"
        />
      ))}
    </svg>
  );
}

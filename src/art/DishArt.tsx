import { useMemo } from 'react';
import type { Recipe } from '../domain/types';

/**
 * Stand-in for recipe photography. Draws a top-down dish on linen from the
 * recipe's own palette. Clearly labeled so it is never mistaken for a photo.
 * When recipe.image is set, the real photo is shown instead.
 */
export function DishPhoto({ recipe, className = '', label = true }: { recipe: Recipe; className?: string; label?: boolean }) {
  if (recipe.image) {
    return (
      <div className={`dish ${className}`}>
        <img src={recipe.image} alt={recipe.name} className="dish-img" loading="lazy" />
      </div>
    );
  }
  return (
    <div className={`dish ${className}`} role="img" aria-label={`Illustration of ${recipe.name}. Photo coming later.`}>
      <DishArt recipe={recipe} />
      {label && <span className="dish-tag">Illustration · photo to come</span>}
    </div>
  );
}

const LINEN: Record<Recipe['cuisine'], [string, string]> = {
  Chinese: ['#F3E3CF', '#E9CDB0'],
  Japanese: ['#E9E4D6', '#D8D0BC'],
  Korean: ['#F1E1D6', '#E2C6B6'],
  Thai: ['#E6EAD6', '#CFD8B8'],
  Western: ['#F2E6CC', '#E2CFA5'],
};

function rng(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function blob(r: () => number, cx: number, cy: number, rad: number, points = 7) {
  const pts = Array.from({ length: points }, (_, k) => {
    const a = (k / points) * Math.PI * 2;
    const rr = rad * (0.72 + r() * 0.5);
    return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr];
  });
  const mid = (a: number[], b: number[]) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const start = mid(pts[points - 1], pts[0]);
  let d = `M${start[0].toFixed(1)} ${start[1].toFixed(1)}`;
  for (let k = 0; k < points; k++) {
    const p1 = pts[k], m2 = mid(p1, pts[(k + 1) % points]);
    d += ` Q${p1[0].toFixed(1)} ${p1[1].toFixed(1)} ${m2[0].toFixed(1)} ${m2[1].toFixed(1)}`;
  }
  return d + ' Z';
}

export function DishArt({ recipe }: { recipe: Recipe }) {
  const art = useMemo(() => build(recipe), [recipe]);
  return art;
}

function build(recipe: Recipe) {
  const r = rng(recipe.id);
  const [linenA, linenB] = LINEN[recipe.cuisine];
  const cols = recipe.look.colors;
  const id = recipe.id.replace(/[^a-z0-9]/gi, '');
  const v = recipe.look.vessel;
  const cx = 200, cy = 150;

  // Food pieces scattered inside the vessel's food radius.
  const foodR = v === 'plate' ? 74 : v === 'pan' ? 82 : 64;
  const pieces: JSX.Element[] = [];
  const n = v === 'soup' ? 9 : 16;
  for (let k = 0; k < n; k++) {
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r()) * foodR * 0.85;
    const x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d * 0.92;
    const c = cols[1 + Math.floor(r() * (cols.length - 1))] ?? cols[0];
    const size = (v === 'soup' ? 7 : 10) + r() * (v === 'soup' ? 8 : 12);
    pieces.push(<path key={k} d={blob(r, x, y, size, 6)} fill={c} opacity={0.95} />);
  }
  // Garnish specks, using the last color (usually a herb).
  const specks = Array.from({ length: 14 }, (_, k) => {
    const a = r() * Math.PI * 2, d = Math.sqrt(r()) * foodR;
    return <circle key={`g${k}`} cx={cx + Math.cos(a) * d} cy={cy + Math.sin(a) * d * 0.92} r={1.6 + r() * 2} fill={cols[cols.length - 1]} opacity="0.9" />;
  });
  const noodles = v === 'noodles'
    ? Array.from({ length: 14 }, (_, k) => {
        const a = r() * Math.PI, rr = 18 + r() * 44;
        return <path key={`n${k}`} d={`M${cx - rr * Math.cos(a)} ${cy - rr * Math.sin(a) * 0.8} Q${cx + (r() - 0.5) * 60} ${cy + (r() - 0.5) * 50} ${cx + rr * Math.cos(a + 0.8)} ${cy + rr * Math.sin(a + 0.8) * 0.8}`} stroke={cols[0]} strokeWidth={4.5} fill="none" strokeLinecap="round" opacity="0.95" />;
      })
    : null;

  return (
    <svg viewBox="0 0 400 300" className="dish-svg" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <pattern id={`lin${id}`} width="12" height="12" patternUnits="userSpaceOnUse">
          <rect width="12" height="12" fill={linenA} />
          <path d="M0 6h12M6 0v12" stroke={linenB} strokeWidth="1" opacity="0.5" />
        </pattern>
        <radialGradient id={`light${id}`} cx="0.3" cy="0.2" r="0.9">
          <stop offset="0" stopColor="#FFF8E8" stopOpacity="0.55" />
          <stop offset="1" stopColor="#FFF8E8" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`plate${id}`} cx="0.45" cy="0.4" r="0.6">
          <stop offset="0" stopColor="#FFFDF7" />
          <stop offset="0.85" stopColor="#F4EEE2" />
          <stop offset="1" stopColor="#E3D9C6" />
        </radialGradient>
        <filter id={`sh${id}`} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="6" dy="10" stdDeviation="9" floodColor="#5A4030" floodOpacity="0.28" />
        </filter>
      </defs>
      <rect width="400" height="300" fill={`url(#lin${id})`} />
      {/* napkin + utensil, fixed to the right so cards feel consistent */}
      <rect x="318" y="40" width="70" height="230" rx="6" fill={linenB} opacity="0.7" transform={`rotate(${4 + r() * 4} 353 155)`} />
      <rect x="344" y="56" width="7" height="190" rx="3.5" fill="#B9A387" transform={`rotate(${4 + r() * 4} 353 155)`} />

      <g filter={`url(#sh${id})`}>
        {v === 'pan' && (
          <>
            <rect x="268" y="138" width="110" height="18" rx="9" fill="#3A3430" transform="rotate(-14 268 147)" />
            <circle cx={cx} cy={cy} r="112" fill="#3F3A35" />
            <circle cx={cx} cy={cy} r="100" fill="#2E2A26" />
          </>
        )}
        {v === 'plate' && (
          <>
            <circle cx={cx} cy={cy} r="118" fill={`url(#plate${id})`} />
            <circle cx={cx} cy={cy} r="94" fill="none" stroke="#E6DCC8" strokeWidth="2" />
          </>
        )}
        {(v === 'bowl' || v === 'soup' || v === 'noodles') && (
          <>
            <circle cx={cx} cy={cy} r="104" fill={recipe.cuisine === 'Japanese' ? '#3B4A5A' : recipe.cuisine === 'Korean' ? '#5A4636' : '#F6F0E3'} />
            <circle cx={cx} cy={cy} r="88" fill={`url(#plate${id})`} />
          </>
        )}
      </g>

      {/* base layer: sauce, broth or rice */}
      {v === 'soup' && <circle cx={cx} cy={cy} r="80" fill={cols[0]} opacity="0.92" />}
      {v === 'bowl' && <path d={blob(r, cx, cy, 74, 9)} fill={cols[0]} />}
      {v === 'plate' && <path d={blob(r, cx, cy, 70, 9)} fill={cols[0]} />}
      {v === 'pan' && <circle cx={cx} cy={cy} r="92" fill={cols[0]} opacity="0.95" />}
      {v === 'noodles' && <circle cx={cx} cy={cy} r="76" fill={cols[0]} opacity="0.35" />}
      {noodles}
      {pieces}
      {specks}
      {v === 'soup' && <ellipse cx={cx - 30} cy={cy - 28} rx="28" ry="10" fill="#fff" opacity="0.18" transform={`rotate(-20 ${cx - 30} ${cy - 28})`} />}
      <rect width="400" height="300" fill={`url(#light${id})`} />
    </svg>
  );
}

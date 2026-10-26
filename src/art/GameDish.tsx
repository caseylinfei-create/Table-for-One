import { useMemo } from 'react';
import type { Recipe } from '../domain/types';

/**
 * Glossy casual-game style dish, drawn from the recipe's palette.
 * A code-drawn stand-in: final art is meant to be generated images in the same style.
 */

function hexToRgb(h: string) {
  const n = parseInt(h.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function mix(h: string, to: number[], t: number) {
  const c = hexToRgb(h).map((v, i) => Math.round(v + (to[i] - v) * t));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}
export const lighten = (h: string, t: number) => mix(h, [255, 255, 255], t);
export const darken = (h: string, t: number) => mix(h, [40, 20, 10], t);

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

function blob(r: () => number, cx: number, cy: number, rx: number, ry: number, points = 7) {
  const pts = Array.from({ length: points }, (_, k) => {
    const a = (k / points) * Math.PI * 2;
    const f = 0.78 + r() * 0.36;
    return [cx + Math.cos(a) * rx * f, cy + Math.sin(a) * ry * f];
  });
  const mid = (a: number[], b: number[]) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const s = mid(pts[points - 1], pts[0]);
  let d = `M${s[0].toFixed(1)} ${s[1].toFixed(1)}`;
  for (let k = 0; k < points; k++) {
    const p = pts[k], m = mid(p, pts[(k + 1) % points]);
    d += ` Q${p[0].toFixed(1)} ${p[1].toFixed(1)} ${m[0].toFixed(1)} ${m[1].toFixed(1)}`;
  }
  return d + ' Z';
}

const BOWL_COLOR: Partial<Record<Recipe['cuisine'], string>> = { Japanese: '#3E5C8A', Korean: '#8A5A3C' };

export function GameDish({ recipe }: { recipe: Recipe }) {
  return useMemo(() => build(recipe), [recipe]);
}

function build(recipe: Recipe) {
  const r = rng(recipe.id + 'g');
  const id = recipe.id.replace(/[^a-z0-9]/gi, '');
  const cols = recipe.look.colors;
  const v = recipe.look.vessel;
  const isBowl = v === 'bowl' || v === 'soup' || v === 'noodles';
  const cx = 200;
  const topY = isBowl ? 150 : 172;

  const grads = cols.map((c, i) => (
    <radialGradient key={i} id={`gg${id}${i}`} cx="0.35" cy="0.3" r="0.8">
      <stop offset="0" stopColor={lighten(c, 0.45)} />
      <stop offset="0.45" stopColor={c} />
      <stop offset="1" stopColor={darken(c, 0.22)} />
    </radialGradient>
  ));

  // Pile of glossy pieces, drawn back to front for depth.
  const spreadX = isBowl ? 100 : 112, spreadY = isBowl ? 34 : 62;
  const n = v === 'soup' ? 8 : 15;
  const pieces = Array.from({ length: n }, () => {
    const a = r() * Math.PI * 2, d = Math.sqrt(r());
    return {
      x: cx + Math.cos(a) * spreadX * d,
      y: topY + Math.sin(a) * spreadY * d - (isBowl ? 4 : 10) * (1 - d),
      s: (v === 'soup' ? 14 : 20) + r() * 14,
      c: 1 + Math.floor(r() * Math.max(1, cols.length - 1)),
    };
  }).sort((a, b) => a.y - b.y);

  const strands = v === 'noodles'
    ? Array.from({ length: 11 }, (_, k) => {
        const y = topY - 22 + k * 4.5, x0 = cx - 90 + r() * 20, x1 = cx + 90 - r() * 20;
        return (
          <g key={`n${k}`}>
            <path d={`M${x0} ${y} C${cx - 40} ${y - 16 + r() * 32} ${cx + 40} ${y + 16 - r() * 32} ${x1} ${y}`} stroke={darken(cols[0], 0.25)} strokeWidth="7" fill="none" strokeLinecap="round" />
            <path d={`M${x0} ${y} C${cx - 40} ${y - 16 + r() * 32} ${cx + 40} ${y + 16 - r() * 32} ${x1} ${y}`} stroke={cols[0]} strokeWidth="5" fill="none" strokeLinecap="round" />
          </g>
        );
      })
    : null;

  const leaves = Array.from({ length: 3 }, (_, k) => {
    const x = cx - 60 + k * 55 + r() * 20, y = topY - 20 + r() * 30, rot = r() * 360;
    return (
      <g key={`l${k}`} transform={`translate(${x} ${y}) rotate(${rot})`}>
        <path d="M0 0 C6 -10 18 -10 22 0 C18 10 6 10 0 0 Z" fill="#5DBB4C" stroke="#2F7A2A" strokeWidth="1.6" />
        <path d="M2 0 H19" stroke="#2F7A2A" strokeWidth="1.2" />
        <ellipse cx="9" cy="-3" rx="4" ry="1.6" fill="#fff" opacity="0.5" />
      </g>
    );
  });

  return (
    <svg viewBox="0 0 400 320" className="gdish" aria-hidden="true">
      <defs>
        {grads}
        <radialGradient id={`gp${id}`} cx="0.42" cy="0.32" r="0.75">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="0.75" stopColor="#F3F1EC" />
          <stop offset="1" stopColor="#D9D3C7" />
        </radialGradient>
      </defs>
      <ellipse cx={cx} cy={isBowl ? 280 : 262} rx={isBowl ? 140 : 168} ry="20" fill="#000" opacity="0.13" />

      {/* vessel */}
      {v === 'pan' ? (
        <g>
          <rect x="300" y="166" width="96" height="22" rx="11" fill="#3A322C" transform="rotate(-10 300 177)" />
          <ellipse cx={cx} cy={topY + 18} rx="162" ry="96" fill="#2C2622" />
          <ellipse cx={cx} cy={topY + 10} rx="154" ry="88" fill="#4A403A" />
          <ellipse cx={cx} cy={topY + 14} rx="138" ry="76" fill={`url(#gg${id}0)`} />
        </g>
      ) : isBowl ? (
        <g>
          <path d={`M${cx - 150} ${topY} C${cx - 140} ${topY + 120} ${cx + 140} ${topY + 120} ${cx + 150} ${topY} Z`} fill={BOWL_COLOR[recipe.cuisine] ?? '#F8F5EE'} stroke={darken(BOWL_COLOR[recipe.cuisine] ?? '#E6DFD2', 0.15)} strokeWidth="3" />
          <path d={`M${cx - 120} ${topY + 40} C${cx - 90} ${topY + 80} ${cx - 50} ${topY + 90} ${cx - 20} ${topY + 92}`} stroke="#fff" strokeWidth="6" opacity="0.35" fill="none" strokeLinecap="round" />
          <ellipse cx={cx} cy={topY} rx="150" ry="52" fill={`url(#gp${id})`} stroke="#D2CBBE" strokeWidth="3" />
          <ellipse cx={cx} cy={topY + 4} rx="128" ry="40" fill={`url(#gg${id}0)`} />
        </g>
      ) : (
        <g>
          <ellipse cx={cx} cy={topY + 22} rx="168" ry="104" fill="#D9D3C7" />
          <ellipse cx={cx} cy={topY + 14} rx="168" ry="102" fill={`url(#gp${id})`} />
          <ellipse cx={cx} cy={topY + 14} rx="128" ry="74" fill="none" stroke="#E4DED2" strokeWidth="4" />
          <path d={blob(r, cx, topY + 6, 110, 56, 9)} fill={`url(#gg${id}0)`} stroke={darken(cols[0], 0.3)} strokeWidth="2.5" />
        </g>
      )}

      {strands}
      {pieces.map((p, k) => (
        <g key={k}>
          <path d={blob(r, p.x, p.y, p.s, p.s * 0.8, 6)} fill={`url(#gg${id}${p.c})`} stroke={darken(cols[p.c] ?? cols[0], 0.35)} strokeWidth="2.2" />
          <ellipse cx={p.x - p.s * 0.3} cy={p.y - p.s * 0.32} rx={p.s * 0.28} ry={p.s * 0.14} fill="#fff" opacity="0.6" transform={`rotate(-20 ${p.x} ${p.y})`} />
        </g>
      ))}
      {v !== 'soup' && leaves}
      {v === 'soup' && <ellipse cx={cx - 50} cy={topY - 8} rx="40" ry="8" fill="#fff" opacity="0.28" />}
    </svg>
  );
}

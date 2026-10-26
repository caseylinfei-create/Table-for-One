import type { Seasoning } from '../domain/types';

/** Distinct containers for the seasoning rack. Drawn in a 48 × 72 box, base at y=70. */
export function SeasoningArt({ s }: { s: Seasoning }) {
  const { color: c, accent: a } = s;
  const shine = <rect x="0" y="0" width="0" height="0" />;
  switch (s.shape) {
    case 'tall-bottle':
      return (<g><path d="M18 6 h12 v12 q8 6 8 16 v32 a4 4 0 0 1 -4 4 h-20 a4 4 0 0 1 -4 -4 v-32 q0 -10 8 -16 z" fill={c} /><rect x="17" y="2" width="14" height="7" rx="2" fill={a} /><rect x="13" y="40" width="22" height="16" rx="3" fill="#FFF8EC" opacity="0.9" /><rect x="15" y="22" width="4" height="34" rx="2" fill="#fff" opacity="0.28" />{shine}</g>);
    case 'bottle':
      return (<g><path d="M19 10 h10 v8 q8 4 8 12 v36 a4 4 0 0 1 -4 4 h-18 a4 4 0 0 1 -4 -4 v-36 q0 -8 8 -12 z" fill={c} /><rect x="18" y="4" width="12" height="8" rx="2" fill={a} /><rect x="13" y="38" width="22" height="18" rx="3" fill="#FFF8EC" opacity="0.92" /><rect x="15" y="28" width="4" height="34" rx="2" fill="#fff" opacity="0.22" /></g>);
    case 'shaker':
      return (<g><rect x="12" y="24" width="24" height="46" rx="8" fill={c} stroke="#E2DACB" /><path d="M12 30 q12 -16 24 0 z" fill={a} /><circle cx="21" cy="24" r="1.3" fill="#FFF8EC" /><circle cx="27" cy="24" r="1.3" fill="#FFF8EC" /><circle cx="24" cy="20" r="1.3" fill="#FFF8EC" /><rect x="15" y="44" width="18" height="12" rx="3" fill="#FFF8EC" opacity="0.85" /></g>);
    case 'grinder':
      return (<g><path d="M16 22 h16 l2 48 h-20 z" fill={c} /><rect x="14" y="10" width="20" height="14" rx="6" fill={a} /><circle cx="24" cy="7" r="4" fill={a} /><rect x="17" y="40" width="14" height="14" rx="3" fill="#FFF8EC" opacity="0.85" /></g>);
    case 'jar':
      return (<g><rect x="9" y="28" width="30" height="42" rx="8" fill={c} stroke="#E2DACB" strokeOpacity="0.6" /><rect x="8" y="22" width="32" height="9" rx="3" fill={a} /><rect x="13" y="42" width="22" height="14" rx="3" fill="#FFF8EC" opacity="0.9" /><rect x="12" y="32" width="4" height="34" rx="2" fill="#fff" opacity="0.28" /></g>);
    case 'tub':
      return (<g><path d="M8 40 h32 l-3 30 h-26 z" fill={c} /><rect x="6" y="34" width="36" height="8" rx="3" fill={a} /><rect x="13" y="48" width="22" height="12" rx="3" fill="#FFF8EC" opacity="0.88" /></g>);
    case 'squeeze':
      return (<g><path d="M14 22 q10 -4 20 0 v44 a4 4 0 0 1 -4 4 h-12 a4 4 0 0 1 -4 -4 z" fill={c} /><path d="M19 22 l5 -14 l5 14 z" fill={a} /><rect x="16" y="38" width="16" height="16" rx="3" fill="#FFF8EC" opacity="0.9" /></g>);
    case 'pouch':
      return (<g><path d="M10 26 h28 l2 40 a4 4 0 0 1 -4 4 h-24 a4 4 0 0 1 -4 -4 z" fill={c} stroke="#E2DACB" /><path d="M10 26 l4 -6 h20 l4 6" fill="#E9E2D3" /><rect x="14" y="40" width="20" height="16" rx="3" fill={a} opacity="0.85" /></g>);
    case 'bulb':
      return (<g><path d="M24 30 C10 34 8 52 12 62 C16 70 32 70 36 62 C40 52 38 34 24 30 Z" fill={c} /><path d="M24 30 C21 40 21 58 24 68 M24 30 C17 40 15 56 18 66 M24 30 C31 40 33 56 30 66" stroke={a} strokeWidth="1.4" fill="none" opacity="0.7" /><path d="M24 30 l-2 -10 h4 z" fill="#D9CDB8" /></g>);
    case 'root':
      return (<g><path d="M8 58 C6 48 16 46 20 50 C22 40 32 40 32 48 C40 44 44 54 38 60 C36 68 14 70 8 58 Z" fill={c} /><path d="M14 56 q4 -2 8 0 M26 52 q4 -1 6 2" stroke={a} strokeWidth="1.4" fill="none" /></g>);
    case 'block':
      return (<g><rect x="6" y="48" width="36" height="22" rx="4" fill="#FFF8EC" /><path d="M8 50 L30 46 L40 50 L18 54 Z" fill={c} style={{ filter: 'brightness(1.08)' }} /><path d="M8 50 L18 54 V66 L8 62 Z" fill={c} style={{ filter: 'brightness(0.9)' }} /><path d="M18 54 L40 50 V62 L18 66 Z" fill={c} /></g>);
    case 'chili':
      return (<g><rect x="10" y="30" width="28" height="40" rx="6" fill="#FFF8EC" opacity="0.55" stroke="#E2DACB" /><path d="M16 64 C14 50 18 40 22 36" stroke={c} strokeWidth="5" fill="none" strokeLinecap="round" /><path d="M26 64 C30 52 30 42 28 36" stroke={c} strokeWidth="5" fill="none" strokeLinecap="round" /><path d="M21 66 C22 54 24 46 25 40" stroke={c} strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.85" /><rect x="9" y="26" width="30" height="6" rx="3" fill={a} /></g>);
  }
}

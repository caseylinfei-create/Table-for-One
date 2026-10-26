import type { Ingredient } from '../domain/types';

/** Shape-based ingredient icons tinted with each ingredient's own color. */
export function IngredientIcon({ ing, size = 36 }: { ing: Ingredient; size?: number }) {
  const c = ing.color;
  const dark = 'rgba(56,52,47,0.18)';
  const leaf = '#5E8C4A';
  let body: JSX.Element;
  switch (ing.icon) {
    case 'round':
      body = (<><circle cx="18" cy="20" r="11" fill={c} /><ellipse cx="14" cy="16" rx="3.5" ry="2.5" fill="#fff" opacity="0.35" /><path d="M15 9.5 q3 -2 6 0" stroke={leaf} strokeWidth="2.4" fill="none" strokeLinecap="round" /></>);
      break;
    case 'citrus':
      body = (<><ellipse cx="18" cy="19" rx="12" ry="10" fill={c} /><ellipse cx="13" cy="15" rx="3.5" ry="2" fill="#fff" opacity="0.4" /><circle cx="29" cy="19" r="1.6" fill={dark} /></>);
      break;
    case 'leafy':
      body = (<><path d="M18 31 C6 24 6 10 13 6 C16 12 17 20 18 31" fill={c} /><path d="M18 31 C30 24 30 10 23 6 C20 12 19 20 18 31" fill={c} opacity="0.85" /><path d="M18 31 C14 20 16 10 18 4 C20 10 22 20 18 31" fill={c} style={{ filter: 'brightness(1.12)' }} /><path d="M18 31 V12" stroke="#F3EDD9" strokeWidth="1.4" opacity="0.7" /></>);
      break;
    case 'root':
      body = (<><ellipse cx="18" cy="20" rx="12" ry="9" fill={c} transform="rotate(-18 18 20)" /><circle cx="13" cy="18" r="1" fill={dark} /><circle cx="21" cy="22" r="1" fill={dark} /><circle cx="22" cy="15" r="1" fill={dark} /></>);
      break;
    case 'long':
      body = (<><rect x="5" y="15" width="26" height="9" rx="4.5" fill={c} transform="rotate(-28 18 19)" /><path d="M27 8 l4 -3 M28 10 l5 -1" stroke={leaf} strokeWidth="2" strokeLinecap="round" /></>);
      break;
    case 'stalk':
      body = (<>{[0, 1, 2].map((i) => <rect key={i} x={11 + i * 5} y={6 + (i % 2) * 2} width="4" height="24" rx="2" fill={c} style={{ filter: `brightness(${1 - i * 0.07})` }} />)}<rect x="10" y="26" width="16" height="5" rx="2" fill="#F3EDD9" /></>);
      break;
    case 'head':
      body = (<><circle cx="18" cy="19" r="12" fill={c} /><path d="M10 15 q8 -8 16 0 M9 21 q9 -7 18 0" stroke="#fff" strokeWidth="1.6" fill="none" opacity="0.45" /></>);
      break;
    case 'egg':
      body = (<><ellipse cx="14" cy="20" rx="7" ry="9" fill={c} stroke="#E0CDA9" /><ellipse cx="23" cy="21" rx="7" ry="9" fill={c} stroke="#E0CDA9" /><ellipse cx="21" cy="17" rx="2" ry="3" fill="#fff" opacity="0.6" /></>);
      break;
    case 'carton':
      body = (<><rect x="10" y="12" width="16" height="20" rx="2" fill={c} stroke="#E0D6C3" /><path d="M10 12 l8 -7 l8 7 z" fill="#E6DECD" /><rect x="10" y="19" width="16" height="6" fill="#A8B99A" /></>);
      break;
    case 'meat':
      body = (<><path d="M7 20 C7 11 17 8 24 11 C31 14 31 24 25 28 C18 32 7 29 7 20 Z" fill={c} /><path d="M12 18 q6 -4 12 0 M13 23 q5 -2 10 0" stroke="#fff" strokeWidth="1.6" fill="none" opacity="0.6" strokeLinecap="round" /></>);
      break;
    case 'fish':
      body = (<><path d="M5 19 C10 11 22 11 27 19 C22 27 10 27 5 19 Z" fill={c} /><path d="M27 19 l5 -5 v10 z" fill={c} /><circle cx="11" cy="18" r="1.4" fill="#38342F" /><path d="M15 15 q3 4 0 8 M19 15 q3 4 0 8" stroke="#fff" strokeWidth="1.2" fill="none" opacity="0.6" /></>);
      break;
    case 'shrimp':
      body = (<><path d="M26 10 C14 8 8 16 10 24 C11 28 16 30 19 27" stroke={c} strokeWidth="7" fill="none" strokeLinecap="round" /><path d="M12 14 l3 3 M10 19 l4 1 M11 24 l4 -1" stroke="#fff" strokeWidth="1.2" opacity="0.6" /><path d="M19 27 l4 3 M19 27 l1 5" stroke={c} strokeWidth="2" strokeLinecap="round" /></>);
      break;
    case 'grain':
      body = (<><path d="M9 30 L11 12 Q18 6 25 12 L27 30 Z" fill="#E7D7B6" /><ellipse cx="18" cy="12" rx="7" ry="3" fill={c} />{[13, 17, 21].map((x) => <ellipse key={x} cx={x} cy="22" rx="1.4" ry="2.2" fill="#D9C8A6" />)}</>);
      break;
    case 'block':
      body = (<><path d="M8 14 L22 10 L30 14 L16 18 Z" fill={c} style={{ filter: 'brightness(1.06)' }} /><path d="M8 14 L16 18 V28 L8 24 Z" fill={c} style={{ filter: 'brightness(0.92)' }} /><path d="M16 18 L30 14 V24 L16 28 Z" fill={c} /></>);
      break;
    case 'can':
      body = (<><rect x="10" y="9" width="16" height="22" rx="3" fill={c} /><ellipse cx="18" cy="9" rx="8" ry="2.4" fill="#D9D3C8" /><rect x="10" y="16" width="16" height="8" fill="#FFF8EC" opacity="0.8" /></>);
      break;
    case 'bag':
      body = (<><path d="M9 10 h18 l2 20 a3 3 0 0 1 -3 3 h-16 a3 3 0 0 1 -3 -3 z" fill={c} /><rect x="9" y="8" width="18" height="4" rx="1" fill="#D9C8A6" /><circle cx="18" cy="21" r="4" fill="#fff" opacity="0.55" /></>);
      break;
    case 'mushroom':
      body = (<><path d="M5 18 C5 8 31 8 31 18 Z" fill={c} /><rect x="14" y="17" width="8" height="12" rx="3" fill="#F3EBD8" /><circle cx="12" cy="14" r="1.6" fill="#fff" opacity="0.5" /><circle cx="22" cy="12" r="1.3" fill="#fff" opacity="0.5" /></>);
      break;
    case 'noodle':
      body = (<><path d="M7 20 h22 a11 9 0 0 1 -22 0 z" fill="#A8B99A" /><path d="M10 20 q2 -8 4 0 q2 -8 4 0 q2 -8 4 0 q2 -8 4 0" stroke={c} strokeWidth="2.2" fill="none" /><path d="M24 6 L18 18 M28 7 L21 18" stroke="#76543B" strokeWidth="1.8" strokeLinecap="round" /></>);
      break;
    case 'slice':
      body = (<><rect x="8" y="9" width="20" height="20" rx="6" fill={c} /><rect x="12" y="13" width="12" height="12" rx="4" fill="#fff" opacity="0.28" /></>);
      break;
    case 'bowl':
      body = (<><path d="M6 17 h24 a12 11 0 0 1 -24 0 z" fill="#E9DFC9" /><ellipse cx="18" cy="17" rx="12" ry="4" fill={c} /><path d="M12 28 h12" stroke="#D6C8AA" strokeWidth="2" strokeLinecap="round" /></>);
      break;
    case 'beans':
      body = (<>{[[11, 15], [20, 12], [25, 20], [15, 23], [21, 27]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx="4.4" ry="3.6" fill={c} style={{ filter: `brightness(${1 - i * 0.04})` }} />)}</>);
      break;
    case 'banana':
      body = (<><path d="M7 12 C9 26 22 31 30 24 C22 25 13 20 11 10 Z" fill={c} /><path d="M7 12 l3 -3" stroke="#76543B" strokeWidth="2" strokeLinecap="round" /></>);
      break;
  }
  return (
    <svg viewBox="0 0 36 36" width={size} height={size} aria-hidden="true" className="ing-icon">
      <ellipse cx="18" cy="33" rx="11" ry="2" fill="#76543B" opacity="0.12" />
      {body}
    </svg>
  );
}

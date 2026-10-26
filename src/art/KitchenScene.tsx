import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import type { AppData, Pet } from '../domain/types';
import { INGREDIENT_BY_ID } from '../data/ingredients';
import { CHEF_BY_ID } from '../data/chefs';
import { PetArt } from './Pets';
import { IngredientIcon } from './IngredientIcon';
import { SeasoningArt } from './SeasoningArt';
import { SEASONINGS } from '../data/seasonings';
import { formatQty } from '../domain/quantity';
import { SCENES, SceneCtx, useScene } from './themes';
import { useApp } from '../state/store';

/**
 * 2.5D kitchen. Every layer shares one 400 × 440 coordinate space and is
 * stacked absolutely, so layers can drift at different speeds for parallax.
 * Hand-painted PNG layers can later replace any <Layer> without touching layout.
 */
export const SCENE_W = 400;
export const SCENE_H = 440;

type Props = {
  data: AppData;
  mode: 'home' | 'fridge';
  bubble?: ReactNode;
  onFridge?: () => void;
  onSeasoning?: () => void;
  onChef?: () => void;
  /** Changes when the chef should react (e.g. an ingredient was picked). */
  reactKey?: number;
};

export function KitchenScene({ data, mode, bubble, onFridge, onSeasoning, onChef, reactKey = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { look } = useApp();
  const asleepAtNight = look === 'night';
  const [tapKey, setTapKey] = useState(0);
  const [poke, setPoke] = useState(0);
  const [petSays, setPetSays] = useState<string | null>(null);
  const [awake, setAwake] = useState(false);
  const petTimer = useRef<number>();
  const pokePet = () => {
    const pet = data.profile!.pet;
    setPoke((k) => k + 1);
    window.clearTimeout(petTimer.current);
    if (asleepAtNight && !awake) {
      setAwake(true);
      setPetSays(pet === 'cat' ? '…mrrp?' : '…wuff?');
      petTimer.current = window.setTimeout(() => { setPetSays(null); setAwake(false); }, 4000);
    } else {
      const lines = pet === 'cat' ? ['Mrrp.', 'Purrrr.', 'Is that tuna?', '*slow blink*'] : ['Woof!', '*tail wag*', 'Snack?', 'Arf!'];
      setPetSays(lines[Math.floor(Math.random() * lines.length)]);
      petTimer.current = window.setTimeout(() => { setPetSays(null); setAwake(false); }, 2200);
    }
  };
  useEffect(() => () => window.clearTimeout(petTimer.current), []);
  // Parallax: at most one style write per frame.
  const frame = useRef(0);
  const onMove = useCallback((e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || frame.current) return;
    const { clientX, clientY } = e;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--px', (((clientX - r.left) / r.width - 0.5) * 2).toFixed(3));
      el.style.setProperty('--py', (((clientY - r.top) / r.height - 0.5) * 2).toFixed(3));
    });
  }, []);
  useEffect(() => () => cancelAnimationFrame(frame.current), []);
  const onLeave = useCallback(() => {
    ref.current?.style.setProperty('--px', '0');
    ref.current?.style.setProperty('--py', '0');
  }, []);

  const profile = data.profile!;
  const chef = CHEF_BY_ID[profile.chefId];
  const chefH = 268; // in scene units

  return (
    <SceneCtx.Provider value={SCENES[look]}>
    <div
      ref={ref}
      className={`scene scene--${mode}`}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{ '--px': 0, '--py': 0 } as CSSProperties}
    >
      <Layer depth={2}><BackWall /></Layer>
      <Layer depth={5}>
        <Counter data={data} />
        <Fridge data={data} open />
      </Layer>

      <div className="layer" style={{ '--d': 8 } as CSSProperties}>
        <button
          type="button"
          className="chef-btn"
          onClick={() => { setTapKey((k) => k + 1); onChef?.(); }}
          aria-label="Talk to your chef"
          style={{
            left: `${(136 / SCENE_W) * 100}%`,
            bottom: `${(24 / SCENE_H) * 100}%`,
            height: `${(chefH / SCENE_H) * 100}%`,
            aspectRatio: String(chef.ratio),
          }}
        >
          <span key={`t${tapKey}`} className={`chef-anim ${tapKey ? 'is-tapped' : ''}`}>
            <span key={`r${reactKey}`} className={`chef-anim ${reactKey ? 'is-react' : ''}`}>
              <img src={chef.img} alt="" className="chef-img" draggable={false} decoding="async" />
            </span>
          </span>
        </button>
      </div>

      <Layer depth={12}>
        <ForegroundPet pet={profile.pet} asleep={asleepAtNight && !awake} pokeKey={poke} />
      </Layer>

      {/* Hit areas live above every layer and do not drift. */}
      <button
        type="button"
        className="hit"
        aria-label="Open the fridge"
        onClick={onFridge}
        style={rect(196, 44, 200, 360)}
      />
      {mode === 'home' && (
        <button
          type="button"
          className="hit hit--rack"
          aria-label="Open the seasoning rack"
          onClick={onSeasoning}
          style={rect(0, 168, 84, 118)}
        />
      )}
      {profile.pet !== 'none' && (
        <button
          type="button"
          className="hit hit--pet"
          aria-label={`Pet the ${profile.pet}`}
          onClick={pokePet}
          style={profile.pet === 'cat' ? rect(346, 328, 54, 92) : rect(0, 352, 106, 60)}
        />
      )}
      {petSays && (
        <div className={`pet-say pet-say--${profile.pet}`} key={poke} aria-live="polite">
          <span>{petSays}</span>
          {!petSays.startsWith('…') && <i className="heart" aria-hidden="true" />}
          {!petSays.startsWith('…') && <i className="heart heart--b" aria-hidden="true" />}
        </div>
      )}
      {profile.pet !== 'none' && asleepAtNight && !awake && (
        <div className={`zzz zzz--${profile.pet}`} aria-hidden="true"><span>z</span><span>z</span><span>Z</span></div>
      )}
      <div className="grain" aria-hidden="true" />
      {bubble}
    </div>
    </SceneCtx.Provider>
  );
}

function rect(x: number, y: number, w: number, h: number): CSSProperties {
  return {
    left: `${(x / SCENE_W) * 100}%`,
    top: `${(y / SCENE_H) * 100}%`,
    width: `${(w / SCENE_W) * 100}%`,
    height: `${(h / SCENE_H) * 100}%`,
  };
}

function Layer({ depth, children }: { depth: number; children: ReactNode }) {
  return (
    <div className="layer" style={{ '--d': depth } as CSSProperties} aria-hidden="true">
      <svg viewBox={`0 0 ${SCENE_W} ${SCENE_H}`} preserveAspectRatio="xMidYMax meet" className="layer-svg">
        {children}
      </svg>
    </div>
  );
}

/* ---------------------------------- back ---------------------------------- */

function BackWall() {
  const P = useScene();
  return (
    <g>
      <defs>
        <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={P.wallTop} />
          <stop offset="1" stopColor={P.wallBottom} />
        </linearGradient>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={P.skyTop} />
          <stop offset="0.65" stopColor={P.skyMid} />
          <stop offset="1" stopColor={P.skyBottom} />
        </linearGradient>
        <linearGradient id="beam" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor={P.beam} stopOpacity="0.85" />
          <stop offset="1" stopColor={P.beam} stopOpacity="0" />
        </linearGradient>
        <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={P.floorTop} />
          <stop offset="1" stopColor={P.floorBottom} />
        </linearGradient>
        <clipPath id="win"><path d="M27 152 V88 a47 47 0 0 1 94 0 V152 Z" /></clipPath>
        <pattern id="dots" width="18" height="18" patternUnits="userSpaceOnUse">
          <circle cx="4" cy="4" r="1.3" fill={P.dots} opacity="0.55" />
          <circle cx="13" cy="13" r="1.3" fill={P.dots} opacity="0.55" />
        </pattern>
      </defs>
      <rect x="-40" y="-20" width="480" height="480" fill="url(#wall)" />
      <rect x="-40" y="-20" width="480" height="252" fill="url(#dots)" />
      {/* wainscot */}
      <rect x="-40" y="232" width="480" height="168" fill={P.wainscot} />
      <rect x="-40" y="228" width="480" height="8" rx="2" fill={P.rail} />
      {Array.from({ length: 21 }, (_, i) => (
        <line key={i} x1={i * 20 + 6} x2={i * 20 + 6} y1="238" y2="398" stroke={P.wainscotLine} strokeWidth="1.4" />
      ))}

      {/* window */}
      <g>
        <path d="M18 160 V86 a56 56 0 0 1 112 0 V160 Z" fill={P.frame} />
        <path d="M27 152 V88 a47 47 0 0 1 94 0 V152 Z" fill="url(#sky)" />
        <g clipPath="url(#win)">
        {P.night ? (
          <g>
            {[[40, 70], [58, 98], [104, 104], [88, 58], [50, 124], [112, 80], [66, 64]].map(([x, y], k) => (
              <circle key={k} className="twinkle" style={{ animationDelay: `${-k * 0.7}s` }} cx={x} cy={y} r={k % 3 ? 1.1 : 1.6} fill="#FFF6D6" />
            ))}
            <circle cx="94" cy="78" r="12" fill={P.sun} />
            <circle cx="99" cy="74" r="10.5" fill={P.skyMid} />
          </g>
        ) : (
          <g>
            <circle cx="94" cy="78" r="13" fill={P.sun} />
            <g className="cloud"><ellipse cx="46" cy="96" rx="13" ry="5" fill="#FFFFFF" opacity="0.85" /><ellipse cx="54" cy="92" rx="8" ry="5" fill="#FFFFFF" opacity="0.85" /></g>
            <g className="cloud cloud--b"><ellipse cx="100" cy="112" rx="10" ry="4" fill="#FFFFFF" opacity="0.7" /></g>
          </g>
        )}
        </g>
        <path d="M27 132 q22 -20 46 -6 q22 -18 48 -2 V152 H27 Z" fill={P.hill1} />
        <path d="M27 142 q30 -14 60 0 q20 -10 34 -2 V152 H27 Z" fill={P.hill2} />
        <path d="M74 44 V152 M27 108 H121" stroke={P.frame} strokeWidth="5" />
        <rect x="10" y="158" width="128" height="10" rx="4" fill={P.sill} />
        {/* plant on sill */}
        <path d="M100 160 l3 -18 h20 l3 18 z" fill={P.accentWarm} />
        <rect x="100" y="140" width="26" height="5" rx="2" fill="#C47A5C" />
        <g className="sway-slow" style={{ transformOrigin: '113px 140px' }}>
          <path d="M113 140 C104 126 98 120 92 120 C98 128 104 134 113 140" fill="#7E9E62" />
          <path d="M113 140 C112 122 116 112 122 106 C122 118 118 130 113 140" fill="#8DAE6E" />
          <path d="M113 140 C122 130 130 128 136 130 C130 134 122 138 113 140" fill="#6F8F55" />
        </g>
      </g>
      {/* curtain valance */}
      <g className="curtain" style={{ transformOrigin: '74px 30px' }}>
        <path
          d="M8 30 H140 V52 q-11 12 -22 0 q-11 12 -22 0 q-11 12 -22 0 q-11 12 -22 0 q-11 12 -22 0 q-11 12 -22 0 Z"
          fill={P.curtain}
        />
        <path d="M8 30 H140 V36 H8 Z" fill={P.accentWarm} />
        {[19, 41, 63, 85, 107, 129].map((x) => (
          <circle key={x} cx={x} cy="44" r="2" fill="#FFF3E6" opacity="0.8" />
        ))}
      </g>
      <rect x="2" y="24" width="144" height="7" rx="3.5" fill={P.woodDark} />

      {/* utensil rail */}
      <g>
        <rect x="140" y="66" width="48" height="4" rx="2" fill="#9A7B5C" />
        <circle cx="140" cy="68" r="4" fill={P.woodDark} />
        <circle cx="188" cy="68" r="4" fill={P.woodDark} />
        <g className="sway" style={{ transformOrigin: '150px 70px' }}>
          <path d="M150 70 v40" stroke={P.woodDark} strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="150" cy="116" rx="8" ry="6" fill="#9A7B5C" />
        </g>
        <g className="sway" style={{ transformOrigin: '164px 70px', animationDelay: '-1.4s' }}>
          <path d="M164 70 v34" stroke={P.woodDark} strokeWidth="3" strokeLinecap="round" />
          <rect x="157" y="102" width="14" height="16" rx="3" fill="#B9A387" />
        </g>
        <g className="sway" style={{ transformOrigin: '178px 70px', animationDelay: '-2.6s' }}>
          <path d="M178 70 v22" stroke="#38342F" strokeWidth="3" strokeLinecap="round" />
          <circle cx="178" cy="106" r="14" fill="#48413A" />
          <circle cx="178" cy="106" r="10" fill="#38342F" />
        </g>
      </g>

      <WallClock />

      {/* sunbeam (moonlight at night) */}
      <polygon className="beam" points="32,152 120,152 300,440 120,440" fill="url(#beam)" opacity={P.night ? 0.16 : 0.45} />

      {/* floor + rug */}
      <rect x="-40" y="396" width="480" height="64" fill="url(#floor)" />
      {P.floor === 'checker'
        ? Array.from({ length: 2 * 30 }, (_, k) => {
            const row = Math.floor(k / 30), col = k % 30;
            return (row + col) % 2 ? <rect key={k} x={-40 + col * 16} y={396 + row * 16} width="16" height="16" fill={P.floorLine} opacity="0.55" /> : null;
          })
        : [0, 1, 2].map((i) => (
            <line key={i} x1="-40" x2="440" y1={406 + i * 12} y2={406 + i * 12} stroke={P.floorLine} strokeWidth="1" opacity="0.6" />
          ))}
      <ellipse cx="150" cy="424" rx="92" ry="13" fill={P.rug} />
      <ellipse cx="150" cy="424" rx="80" ry="10" fill="none" stroke={P.sage} strokeWidth="3" />
      <ellipse cx="150" cy="424" rx="64" ry="7" fill="none" stroke={P.accentWarm} strokeWidth="2" opacity="0.7" />
    </g>
  );
}

/* --------------------------------- counter -------------------------------- */

function Counter({ data }: { data: AppData }) {
  const P = useScene();
  const owned = SEASONINGS.filter((x) => data.seasonings[x.id]);
  return (
    <g>
      <defs>
        <linearGradient id="oak" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={P.oakTop} />
          <stop offset="1" stopColor={P.oakBottom} />
        </linearGradient>
        <linearGradient id="walnut" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={P.cabTop} />
          <stop offset="1" stopColor={P.cabBottom} />
        </linearGradient>
      </defs>
      <rect x="-40" y="296" width="236" height="100" fill="url(#walnut)" />
      {[6, 98].map((x) => (
        <g key={x}>
          <rect x={x} y="310" width="86" height="76" rx="8" fill={P.cabDoor} />
          <rect x={x + 6} y="316" width="74" height="64" rx="6" fill="none" stroke={P.cabStroke} strokeWidth="2" />
          <circle cx={x === 6 ? x + 76 : x + 10} cy="348" r="3.5" fill={P.knob} />
        </g>
      ))}
      <rect x="-40" y="284" width="240" height="16" rx="5" fill="url(#oak)" />
      <rect x="-40" y="296" width="240" height="4" fill={P.oakEdge} />

      {/* seasoning cabinet, door swung open; shows what is actually on the shelf */}
      <g>
        <rect x="6" y="172" width="76" height="112" rx="6" fill={P.woodDark} />
        <rect x="11" y="177" width="66" height="102" rx="4" fill={P.night ? '#3B3345' : '#F6EBD3'} />
        <rect x="11" y="228" width="66" height="4" fill={P.woodDark} />
        {owned.slice(0, 8).map((x, k) => (
          <g key={x.id} transform={`translate(${12 + (k % 4) * 16} ${k < 4 ? 202 : 254}) scale(0.36)`}>
            <SeasoningArt s={x} />
          </g>
        ))}
        {owned.length === 0 && (
          <text x="44" y="232" textAnchor="middle" fontSize="8" fontStyle="italic" fill={P.night ? '#9C90AE' : '#B79A6E'}>empty</text>
        )}
        {owned.length > 8 && (
          <g>
            <rect x="56" y="180" width="20" height="10" rx="5" fill={P.accentWarm} />
            <text x="66" y="188" textAnchor="middle" fontSize="7" fontWeight="800" fill="#fff">+{owned.length - 8}</text>
          </g>
        )}
        {/* open door on the left hinge */}
        <path d="M6 174 L-14 166 L-14 290 L6 282 Z" fill={P.cabDoor} />
        <path d="M2 180 L-10 175 L-10 281 L2 276 Z" fill="none" stroke={P.cabStroke} strokeWidth="1.5" />
        <circle cx="-6" cy="228" r="2.2" fill={P.knob} />
      </g>

      {/* mug with steam */}
      <g>
        <path d="M84 266 h18 v14 a6 6 0 0 1 -6 6 h-6 a6 6 0 0 1 -6 -6 z" fill={P.sage} />
        <path d="M102 270 a5 5 0 0 1 0 10" stroke={P.sage} strokeWidth="3" fill="none" />
        <path className="steam" d="M90 260 q-4 -6 0 -12 q4 -6 0 -12" stroke="#FFFFFF" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <path className="steam steam--b" d="M96 260 q-4 -6 0 -12 q4 -6 0 -12" stroke="#FFFFFF" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      </g>
    </g>
  );
}

/* ---------------------------------- fridge --------------------------------- */

function Fridge({ data }: { data: AppData; open?: boolean }) {
  const P = useScene();
  const stock = data.inventory
    .filter((i) => i.quantity > 0 && INGREDIENT_BY_ID[i.ingredientId])
    .sort((x, y) => y.updatedAt.localeCompare(x.updatedAt));
  const isProduce = (i: { ingredientId: string }) => ['vegetables', 'fruits'].includes(INGREDIENT_BY_ID[i.ingredientId].category);
  const crisper = stock.filter(isProduce).slice(0, 5);
  const shelfAll = stock.filter((i) => !crisper.includes(i));
  const shelved = shelfAll.slice(0, 12);
  const extra = shelfAll.length - shelved.length;
  const now = Date.now();
  const fresh = (i: { updatedAt: string }) => now - Date.parse(i.updatedAt) < 90_000;
  const empty = data.inventory.every((i) => i.quantity <= 0);

  return (
    <g>
      <defs>
        <linearGradient id="fridgeBody" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={P.f1} />
          <stop offset="0.12" stopColor={P.f2} />
          <stop offset="0.85" stopColor={P.f3} />
          <stop offset="1" stopColor={P.f4} />
        </linearGradient>
        <linearGradient id="interior" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFBEF" />
          <stop offset="1" stopColor="#F4E5C2" />
        </linearGradient>
        <radialGradient id="glow" cx="0.5" cy="0.08" r="0.9">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="0.5" stopColor="#FFF6D8" stopOpacity="0.35" />
          <stop offset="1" stopColor="#FFF6D8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="doorIn" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#F3E6C8" />
          <stop offset="1" stopColor="#FBF2DD" />
        </linearGradient>
        <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#76543B" floodOpacity="0.22" />
        </filter>
      </defs>

      {/* floor shadow */}
      <ellipse cx="290" cy="398" rx="104" ry="10" fill={P.woodDark} opacity="0.22" />
      {/* light spill on floor */}
      <ellipse className="spill" cx="300" cy="412" rx="110" ry="18" fill="#FFF3CC" opacity={P.night ? 0.6 : 0.35} />

      {/* body */}
      <g filter="url(#soft)">
        <rect x="196" y="56" width="150" height="336" rx="32" fill="url(#fridgeBody)" />
        <rect x="200" y="384" width="142" height="12" rx="6" fill={P.fBase} />
        <rect x="214" y="394" width="14" height="6" rx="2" fill={P.woodDark} />
        <rect x="314" y="394" width="14" height="6" rx="2" fill={P.woodDark} />
      </g>

      {/* interior */}
      <rect x="207" y="68" width="128" height="308" rx="22" fill="url(#interior)" />
      <rect className="fridge-glow" x="207" y="68" width="128" height="308" rx="22" fill="url(#glow)" />
      <circle cx="271" cy="74" r="6" fill="#FFF4C7" />

      {/* freezer drawer */}
      <rect x="215" y="82" width="112" height="42" rx="9" fill="#EEF2E8" />
      <rect x="215" y="82" width="112" height="42" rx="9" fill="none" stroke="#DCE3D3" strokeWidth="2" />
      <rect x="225" y="92" width="38" height="22" rx="4" fill="#E2EBE3" />
      {[0, 1, 2].map((i) => <rect key={i} x={228 + i * 12} y="95" width="9" height="16" rx="2" fill="#F6FAF4" />)}
      <rect x="270" y="94" width="48" height="18" rx="5" fill="#E4D9C4" />
      <rect x="292" y="98" width="20" height="10" rx="2" fill="#F4C4B3" opacity="0.8" />

      {/* shelves */}
      {[180, 246, 310].map((y) => (
        <g key={y}>
          <rect x="210" y={y} width="122" height="5" rx="2.5" fill="#FFFFFF" opacity="0.85" />
          <rect x="210" y={y + 5} width="122" height="2" fill="#E3CFA6" />
        </g>
      ))}

      {/* Real contents: produce in the crisper, everything else on the shelves, newest first. */}
      {crisper.map((p, i) => (
        <g key={p.ingredientId} transform={`translate(${216 + i * 22} 306)`} className={fresh(p) ? 'fr-new' : undefined}>
          <IngredientIcon ing={INGREDIENT_BY_ID[p.ingredientId]} size={26} />
        </g>
      ))}
      <g>
        <rect x="213" y="326" width="116" height="40" rx="10" fill="#F1E3C4" opacity="0.92" />
        <rect x="213" y="326" width="116" height="40" rx="10" fill="none" stroke="#E2CDA0" strokeWidth="2" />
        <rect x="250" y="334" width="42" height="6" rx="3" fill="#E2CDA0" />
      </g>
      {shelved.map((p, i) => {
        const row = Math.floor(i / 4), col = i % 4;
        const x = 210 + col * 30, y = [180, 246, 310][row] - 33;
        const ing = INGREDIENT_BY_ID[p.ingredientId];
        return (
          <g key={p.ingredientId} transform={`translate(${x} ${y})`} className={fresh(p) ? 'fr-new' : undefined}>
            <IngredientIcon ing={ing} size={33} />
            {p.quantity > 1 && (
              <g>
                <circle cx="26" cy="7" r="6" fill="#38342F" />
                <text x="26" y="9.6" textAnchor="middle" fontSize="7" fontWeight="800" fill="#FFF6E2">{formatQty(Math.min(p.quantity, 99))}</text>
              </g>
            )}
          </g>
        );
      })}
      {extra > 0 && (
        <g>
          <rect x="300" y="312" width="26" height="12" rx="6" fill={P.accentWarm} />
          <text x="313" y="321" textAnchor="middle" fontSize="8" fontWeight="800" fill="#fff">+{extra}</text>
        </g>
      )}

      {empty && (
        <text x="271" y="214" textAnchor="middle" fontFamily="Fraunces, Georgia, serif" fontSize="12" fill="#B79A6E" fontStyle="italic">
          so much room
        </text>
      )}

      {/* door, swung open to the right (inner face visible) */}
      <g>
        <path d="M344 64 L394 46 L394 410 L344 384 Z" fill={P.fDoor} />
        <path d="M348 72 L390 57 L390 398 L348 376 Z" fill="url(#doorIn)" />
        {[140, 230, 320].map((y, i) => (
          <path key={y} d={`M348 ${y} L390 ${y - 11 + i * 2} L390 ${y + 7 + i * 2} L348 ${y + 14}`} fill="#EBD8B0" stroke="#DCC392" strokeWidth="1" />
        ))}
        {/* door bottles */}
        <rect x="355" y="104" width="9" height="34" rx="3" fill="#C8392D" />
        <rect x="356" y="98" width="7" height="7" rx="2" fill="#F4F1EA" />
        <rect x="370" y="100" width="11" height="34" rx="4" fill="#F5B94A" opacity="0.92" />
        <rect x="372" y="94" width="7" height="7" rx="2" fill="#5E8C4A" />
        <rect x="356" y="200" width="10" height="28" rx="4" fill={P.sage} />
        <rect x="370" y="196" width="12" height="30" rx="4" fill="#F7F4EC" stroke="#E3DACB" strokeWidth="0.8" />
        <ellipse cx="362" cy="312" rx="7" ry="5" fill="#F7EBD2" />
        <ellipse cx="376" cy="310" rx="7" ry="5" fill="#F7EBD2" />
        {/* hinge glint */}
        <rect x="341" y="96" width="5" height="22" rx="2" fill={P.fBase} />
        <rect x="341" y="330" width="5" height="22" rx="2" fill={P.fBase} />
      </g>
    </g>
  );
}

function ForegroundPet({ pet, asleep, pokeKey }: { pet: Pet; asleep: boolean; pokeKey: number }) {
  if (pet === 'none') return null;
  const at = pet === 'cat' ? 'translate(352 334)' : 'translate(4 344)';
  return (
    <g transform={at}>
      <g key={pokeKey} className={`pet pet--${pet} ${pokeKey ? 'is-poked' : ''}`}>
        <PetArt kind={pet} asleep={asleep} />
      </g>
    </g>
  );
}

/** Wall clock showing the real local time. */
function WallClock() {
  const P = useScene();
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);
  const m = now.getMinutes(), h = (now.getHours() % 12) + m / 60;
  const cx = 172, cy = 34;
  return (
    <g>
      <title>{now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</title>
      <circle cx={cx} cy={cy + 1.5} r="15" fill="#000" opacity="0.12" />
      <circle cx={cx} cy={cy} r="15" fill={P.woodDark} />
      <circle cx={cx} cy={cy} r="12.5" fill={P.night ? '#F3E3BB' : '#FFFDF6'} />
      {[0, 3, 6, 9].map((k) => {
        const a = (k / 12) * Math.PI * 2;
        return <circle key={k} cx={cx + Math.sin(a) * 9.5} cy={cy - Math.cos(a) * 9.5} r="1" fill={P.woodDark} />;
      })}
      <line x1={cx} y1={cy} x2={cx} y2={cy - 6} stroke={P.woodDark} strokeWidth="2" strokeLinecap="round" transform={`rotate(${h * 30} ${cx} ${cy})`} />
      <line x1={cx} y1={cy} x2={cx} y2={cy - 9} stroke={P.accentWarm} strokeWidth="1.4" strokeLinecap="round" transform={`rotate(${m * 6} ${cx} ${cy})`} />
      <circle cx={cx} cy={cy} r="1.4" fill={P.woodDark} />
    </g>
  );
}

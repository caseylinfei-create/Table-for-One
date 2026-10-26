/** Soft, clay-like pets drawn as SVG groups. Cat is ~44×82 units, dog ~96×64. */
export function PetArt({ kind, asleep = true }: { kind: 'cat' | 'dog'; asleep?: boolean }) {
  if (kind === 'cat') {
    return (
      <g>
        <defs>
          <radialGradient id="catFur" cx="0.4" cy="0.35" r="0.8">
            <stop offset="0" stopColor="#E9C9A0" />
            <stop offset="1" stopColor="#C99A6B" />
          </radialGradient>
        </defs>
        <ellipse cx="22" cy="80" rx="22" ry="4" fill="#76543B" opacity="0.25" />
        {/* tail */}
        <path className="tail" style={{ transformOrigin: '34px 74px' }} d="M34 74 C50 72 52 56 44 48" stroke="#C99A6B" strokeWidth="7" fill="none" strokeLinecap="round" />
        {/* body */}
        <path d="M6 80 C2 56 8 38 22 38 C36 38 42 56 38 80 Z" fill="url(#catFur)" />
        <path d="M15 56 q7 4 14 0 M14 64 q8 4 16 0" stroke="#B5845A" strokeWidth="2" fill="none" opacity="0.6" strokeLinecap="round" />
        <ellipse cx="14" cy="79" rx="6" ry="3.5" fill="#F3E3C8" />
        <ellipse cx="30" cy="79" rx="6" ry="3.5" fill="#F3E3C8" />
        {/* head */}
        <path d="M7 22 L9 4 L19 14 Z" fill="#C99A6B" />
        <path d="M37 22 L35 4 L25 14 Z" fill="#C99A6B" />
        <path d="M10 18 L11 9 L16 14 Z" fill="#EBB8A2" />
        <path d="M34 18 L33 9 L28 14 Z" fill="#EBB8A2" />
        <ellipse cx="22" cy="26" rx="17" ry="15" fill="url(#catFur)" />
        <path d="M17 14 q5 -3 10 0 M19 18 q3 -2 6 0" stroke="#B5845A" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        {asleep ? (
          <g>
            <path d="M13 27 q3 3 6 0" stroke="#38342F" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M25 27 q3 3 6 0" stroke="#38342F" strokeWidth="2" fill="none" strokeLinecap="round" />
          </g>
        ) : (
          <g className="blink" style={{ transformOrigin: '22px 27px' }}>
            <ellipse cx="16" cy="27" rx="2.4" ry="3" fill="#38342F" />
            <ellipse cx="28" cy="27" rx="2.4" ry="3" fill="#38342F" />
            <circle cx="16.8" cy="26" r="0.8" fill="#fff" />
            <circle cx="28.8" cy="26" r="0.8" fill="#fff" />
          </g>
        )}
        <path d="M20.5 31 h3 l-1.5 2 z" fill="#D98B6C" />
        <ellipse cx="13" cy="33" rx="3" ry="1.6" fill="#E9A48C" opacity="0.6" />
        <ellipse cx="31" cy="33" rx="3" ry="1.6" fill="#E9A48C" opacity="0.6" />
      </g>
    );
  }
  return (
    <g>
      <defs>
        <radialGradient id="dogFur" cx="0.4" cy="0.3" r="0.9">
          <stop offset="0" stopColor="#F3E2C2" />
          <stop offset="1" stopColor="#D7B88A" />
        </radialGradient>
      </defs>
      <ellipse cx="50" cy="62" rx="48" ry="5" fill="#76543B" opacity="0.25" />
      <path className="tail" style={{ transformOrigin: '86px 46px' }} d="M86 46 q12 -6 10 -18" stroke="#D7B88A" strokeWidth="7" fill="none" strokeLinecap="round" />
      {/* body lying down */}
      <ellipse cx="58" cy="46" rx="34" ry="17" fill="url(#dogFur)" />
      <ellipse cx="28" cy="58" rx="14" ry="5" fill="#EFDDBB" />
      <ellipse cx="52" cy="60" rx="10" ry="4" fill="#EFDDBB" />
      {/* head resting */}
      <ellipse cx="24" cy="40" rx="19" ry="16" fill="url(#dogFur)" />
      <path d="M10 30 C2 34 2 50 10 54 C14 46 14 36 10 30" fill="#B98F62" />
      <path d="M36 28 C44 30 46 44 40 50 C36 42 34 34 36 28" fill="#B98F62" />
      <ellipse cx="22" cy="48" rx="9" ry="6" fill="#F6EBD6" />
      <ellipse cx="22" cy="45" rx="3.6" ry="2.6" fill="#38342F" />
      {asleep ? (
        <g>
          <path d="M14 38 q3 2.5 6 0" stroke="#38342F" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M25 38 q3 2.5 6 0" stroke="#38342F" strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
      ) : (
        <g className="blink" style={{ transformOrigin: '22px 37px' }}>
          <circle cx="17" cy="37" r="2.4" fill="#38342F" />
          <circle cx="28" cy="37" r="2.4" fill="#38342F" />
          <circle cx="17.7" cy="36.2" r="0.7" fill="#fff" />
          <circle cx="28.7" cy="36.2" r="0.7" fill="#fff" />
        </g>
      )}
      <rect x="40" y="38" width="8" height="10" rx="3" fill="#D96B58" opacity="0.9" />
    </g>
  );
}

/** Small standalone pet badge used in setup. */
export function PetBadge({ kind }: { kind: 'cat' | 'dog' }) {
  return kind === 'cat' ? (
    <svg viewBox="-4 -2 52 90" width="30" height="48" aria-hidden="true"><PetArt kind="cat" asleep={false} /></svg>
  ) : (
    <svg viewBox="-2 18 104 52" width="56" height="30" aria-hidden="true"><PetArt kind="dog" asleep={false} /></svg>
  );
}

/** Bubble anchored above the chef. Re-keys on text change so it pops in. */
export function SpeechBubble({ text, sub, compact }: { text: string; sub?: string; compact?: boolean }) {
  return (
    <div className={`bubble ${compact ? 'bubble--compact' : ''}`} key={text} aria-live="polite">
      <p className="bubble-text">{text}</p>
      {sub && <p className="bubble-sub">{sub}</p>}
    </div>
  );
}

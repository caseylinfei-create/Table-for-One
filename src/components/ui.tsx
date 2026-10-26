import { useEffect, useRef, type ReactNode } from 'react';

export function Btn({
  children, onClick, variant = 'primary', className = '', disabled, type = 'button', ...rest
}: {
  children: ReactNode; onClick?: () => void; variant?: 'primary' | 'soft' | 'ghost' | 'danger';
  className?: string; disabled?: boolean; type?: 'button' | 'submit'; 'aria-label'?: string;
}) {
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`btn btn--${variant} ${className}`} {...rest}>
      {children}
    </button>
  );
}

export function Segmented<T extends string | number>({
  options, value, onChange, label, id,
}: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void; label: string; id: string }) {
  return (
    <div className="seg" role="radiogroup" aria-label={label} id={id}>
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          role="radio"
          aria-checked={o.value === value}
          className={`seg-opt ${o.value === value ? 'is-on' : ''}`}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Sheet({ open, onClose, title, children, footer }: {
  open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    ref.current?.focus();
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="sheet-wrap" role="presentation" onClick={onClose}>
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        ref={ref}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-grip" aria-hidden="true" />
        <div className="sheet-head">
          <h2 className="font-display text-[22px] font-semibold leading-tight">{title}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <Icon name="close" />
          </button>
        </div>
        <div className="sheet-body">{children}</div>
        {footer && <div className="sheet-foot">{footer}</div>}
      </div>
    </div>
  );
}

export type ToastAction = { label: string; onClick: () => void };
export function Toast({ text, action }: { text: string | null; action?: ToastAction | null }) {
  return (
    <div className={`toast ${text ? 'is-on' : ''} ${action ? 'has-action' : ''}`} role="status" aria-live="polite">
      <span>{text}</span>
      {text && action && (
        <button type="button" className="toast-act" onClick={action.onClick}>{action.label}</button>
      )}
    </div>
  );
}

type IconName = 'kitchen' | 'book' | 'basket' | 'person' | 'back' | 'close' | 'search' | 'plus' | 'minus' | 'check' | 'trash' | 'spark' | 'chev-l' | 'chev-r'
  | 'bookmark' | 'bookmark-on' | 'flame' | 'thermo' | 'clock' | 'play' | 'pause' | 'reset' | 'list' | 'pan' | 'dice' | 'swap';

export function Icon({ name, size = 22 }: { name: IconName; size?: number }) {
  const p = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const paths: Record<IconName, JSX.Element> = {
    kitchen: <><path d="M4 10.5 12 4l8 6.5V20H4z" {...p} /><path d="M9.5 20v-5.5h5V20" {...p} /></>,
    book: <><path d="M5 4.5h9a3 3 0 0 1 3 3V20H8a3 3 0 0 1-3-3z" {...p} /><path d="M5 17a3 3 0 0 1 3-3h9" {...p} /><path d="M9 8.5h4" {...p} /></>,
    basket: <><path d="M3.5 9.5h17l-1.8 9a2 2 0 0 1-2 1.5H7.3a2 2 0 0 1-2-1.5z" {...p} /><path d="M8 9.5 11 4M16 9.5 13 4" {...p} /><path d="M9 13.5v3M15 13.5v3" {...p} /></>,
    person: <><circle cx="12" cy="8.5" r="3.8" {...p} /><path d="M4.5 20c1.2-3.6 4-5.3 7.5-5.3s6.3 1.7 7.5 5.3" {...p} /></>,
    back: <path d="M14.5 5.5 8 12l6.5 6.5" {...p} />,
    close: <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" {...p} />,
    search: <><circle cx="11" cy="11" r="6.2" {...p} /><path d="M20 20l-4.5-4.5" {...p} /></>,
    plus: <path d="M12 5.5v13M5.5 12h13" {...p} />,
    minus: <path d="M5.5 12h13" {...p} />,
    check: <path d="M5.5 12.5l4.2 4.2 8.8-9.4" {...p} />,
    trash: <><path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12" {...p} /></>,
    spark: <path d="M12 3.5l1.9 5.4 5.6.6-4.3 3.6 1.4 5.4L12 15.6l-4.6 2.9 1.4-5.4-4.3-3.6 5.6-.6z" {...p} />,
    'chev-l': <path d="M14.5 5.5 8 12l6.5 6.5" {...p} />,
    'chev-r': <path d="M9.5 5.5 16 12l-6.5 6.5" {...p} />,
    bookmark: <path d="M7 4.5h10v15.5l-5-3.6-5 3.6z" {...p} />,
    'bookmark-on': <path d="M7 4.5h10v15.5l-5-3.6-5 3.6z" {...p} fill="currentColor" />,
    flame: <path d="M12 3.5c1 3 4.5 4.7 4.5 9.2a4.5 4.5 0 0 1-9 0c0-2 1-3.4 2-4.4.2 1.6 1 2.4 1.8 2.6C10.8 8.5 11.2 6 12 3.5z" {...p} />,
    thermo: <><path d="M10 14.5V5.5a2 2 0 0 1 4 0v9a4 4 0 1 1-4 0z" {...p} /><path d="M12 11v5" {...p} /></>,
    clock: <><circle cx="12" cy="12.5" r="7.5" {...p} /><path d="M12 8.5v4.5l3 2" {...p} /><path d="M9.5 3h5" {...p} /></>,
    play: <path d="M8 5.5v13l10-6.5z" {...p} fill="currentColor" />,
    pause: <><path d="M8.5 5.5v13M15.5 5.5v13" {...p} strokeWidth={3} /></>,
    reset: <><path d="M5 12a7 7 0 1 0 2.1-5" {...p} /><path d="M5 4.5V9h4.5" {...p} /></>,
    list: <><path d="M9 7h10M9 12h10M9 17h10" {...p} /><circle cx="5" cy="7" r="1" fill="currentColor" /><circle cx="5" cy="12" r="1" fill="currentColor" /><circle cx="5" cy="17" r="1" fill="currentColor" /></>,
    pan: <><circle cx="10" cy="13" r="6.5" {...p} /><path d="M16 11.5l5-2" {...p} /></>,
    dice: <><rect x="4.5" y="4.5" width="15" height="15" rx="3.5" {...p} /><circle cx="9" cy="9" r="1.2" fill="currentColor" /><circle cx="15" cy="15" r="1.2" fill="currentColor" /><circle cx="15" cy="9" r="1.2" fill="currentColor" /><circle cx="9" cy="15" r="1.2" fill="currentColor" /></>,
    swap: <><path d="M7 8h11l-3-3M17 16H6l3 3" {...p} /></>,
  };
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

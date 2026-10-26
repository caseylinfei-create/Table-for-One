import type { ChefId } from '../domain/types';

/** A fully customizable 3D chef. Every field is a plain value so it saves and syncs cleanly. */
export type BodyBase = 'fem' | 'masc';
export type HairStyle = 'bun' | 'ponytail' | 'bob' | 'long' | 'short' | 'curly' | 'buzz';
export type Hat = 'none' | 'toque' | 'bandana' | 'cap';
export type Action = 'idle' | 'wave' | 'stir' | 'chop' | 'taste' | 'cheer' | 'think';

export type Avatar = {
  body: BodyBase;
  skin: string;
  hair: string;
  hairStyle: HairStyle;
  hat: Hat;
  jacket: string;
  apron: string;
  /** The move your chef does while waiting in the kitchen. */
  action: Action;
};

export const SKINS = ['#F7DCC8', '#F0C6A6', '#DDA67E', '#BF8058', '#93603F', '#62402B'];
export const HAIRS = ['#2A1D17', '#563524', '#8A583A', '#C98E4E', '#E6C67E', '#B4482F', '#A7A9AD', '#E796B4', '#6F8FC4'];
export const JACKETS = ['#F5F1E8', '#EFE0C2', '#B9CFA8', '#2F3D57', '#C84B3A', '#E6B84A'];
export const APRONS = ['#3E5A7E', '#6E8EA8', '#5E7F55', '#B8483A', '#7A5238', '#E9DCC4'];

export const HAIR_STYLES: { id: HairStyle; label: string }[] = [
  { id: 'bun', label: 'Top bun' },
  { id: 'ponytail', label: 'Ponytail' },
  { id: 'bob', label: 'Bob' },
  { id: 'long', label: 'Long' },
  { id: 'short', label: 'Short' },
  { id: 'curly', label: 'Curly' },
  { id: 'buzz', label: 'Buzz' },
];
export const HATS: { id: Hat; label: string }[] = [
  { id: 'none', label: 'No hat' },
  { id: 'toque', label: 'Chef hat' },
  { id: 'bandana', label: 'Bandana' },
  { id: 'cap', label: 'Cap' },
];
export const ACTIONS: { id: Action; label: string; note: string }[] = [
  { id: 'stir', label: 'Stirring', note: 'Always something in the bowl' },
  { id: 'chop', label: 'Chopping', note: 'Knife work, very focused' },
  { id: 'taste', label: 'Tasting', note: 'Just one more spoonful' },
  { id: 'wave', label: 'Waving', note: 'Happy to see you' },
  { id: 'think', label: 'Thinking', note: 'What’s for dinner…' },
  { id: 'cheer', label: 'Cheering', note: 'Every meal is a win' },
  { id: 'idle', label: 'Relaxed', note: 'Just hanging out' },
];

export const DEFAULT_AVATAR: Record<BodyBase, Avatar> = {
  fem: { body: 'fem', skin: SKINS[1], hair: HAIRS[1], hairStyle: 'bun', hat: 'bandana', jacket: JACKETS[0], apron: APRONS[0], action: 'stir' },
  masc: { body: 'masc', skin: SKINS[2], hair: HAIRS[0], hairStyle: 'short', hat: 'toque', jacket: JACKETS[0], apron: APRONS[4], action: 'chop' },
};

const pick = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)];

export function randomAvatar(body: BodyBase = Math.random() < 0.5 ? 'fem' : 'masc'): Avatar {
  const styles: HairStyle[] = body === 'fem' ? ['bun', 'ponytail', 'bob', 'long', 'curly'] : ['short', 'curly', 'buzz', 'bun'];
  return {
    body,
    skin: pick(SKINS),
    hair: pick(HAIRS.slice(0, 6)),
    hairStyle: pick(styles),
    hat: pick(HATS).id,
    jacket: pick(JACKETS.slice(0, 3)),
    apron: pick(APRONS),
    action: pick(ACTIONS.filter((a) => a.id !== 'idle')).id,
  };
}

/** Each move maps to one of the original chef personalities, so the chef keeps a voice. */
const VOICE: Record<Action, [ChefId, ChefId]> = {
  stir: ['simmer', 'wok'],
  chop: ['herb', 'market'],
  taste: ['shortcake', 'noodle'],
  wave: ['piper', 'bakery'],
  think: ['whisk', 'line'],
  cheer: ['shortcake', 'wok'],
  idle: ['bakery', 'line'],
};
export const voiceFor = (a: Avatar): ChefId => VOICE[a.action][a.body === 'fem' ? 0 : 1];

export function isAvatar(x: unknown): x is Avatar {
  const a = x as Avatar;
  return !!a && typeof a === 'object' && (a.body === 'fem' || a.body === 'masc') && typeof a.skin === 'string'
    && HAIR_STYLES.some((h) => h.id === a.hairStyle) && HATS.some((h) => h.id === a.hat) && ACTIONS.some((h) => h.id === a.action);
}

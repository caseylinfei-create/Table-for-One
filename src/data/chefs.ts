import type { ChefId } from '../domain/types';
import wok from '../assets/chefs/wok.webp';
import market from '../assets/chefs/market.webp';
import line from '../assets/chefs/line.webp';
import whisk from '../assets/chefs/whisk.webp';
import noodle from '../assets/chefs/noodle.webp';
import shortcake from '../assets/chefs/shortcake.webp';
import simmer from '../assets/chefs/simmer.webp';
import piper from '../assets/chefs/piper.webp';
import herb from '../assets/chefs/herb.webp';
import bakery from '../assets/chefs/bakery.webp';

export type Chef = {
  id: ChefId;
  gender: 'female' | 'male';
  title: string;
  vibe: string;
  img: string;
  /** Natural aspect ratio (w / h) of the cutout */
  ratio: number;
  /** Lines only this chef says, mixed into the shared pool. */
  lines: string[];
};

export const CHEFS: Chef[] = [
  {
    id: 'wok', gender: 'male', title: 'The Wok Toss', img: wok, ratio: 320 / 520,
    vibe: 'Big flame, bigger flip. Shrimp in the air is his love language.',
    lines: ['High heat. No fear.', 'If it’s not flying, it’s not stir-fry.', 'Give me two minutes and a wok.'],
  },
  {
    id: 'market', gender: 'male', title: 'The Market Run', img: market, ratio: 274 / 445,
    vibe: 'Green cap, sharp knife, a board full of vegetables. Practical and quietly proud of it.',
    lines: ['Veg first. Always veg first.', 'A sharp knife is a happy knife.', 'I can make a meal out of that drawer.'],
  },
  {
    id: 'line', gender: 'male', title: 'The Line Cook', img: line, ratio: 234 / 504,
    vibe: 'Ladle in one hand, spatula in the other, arms crossed. Deadpan and dependable.',
    lines: ['Yes, chef.', 'Mise en place. Then we talk.', 'Clean station, clear mind.'],
  },
  {
    id: 'whisk', gender: 'male', title: 'The Quiet Whisk', img: whisk, ratio: 263 / 458,
    vibe: 'Round glasses, steady wrist. Measures twice, whisks once.',
    lines: ['Soft peaks. Patience.', 'I read the recipe. Twice.', 'Small batch, done right.'],
  },
  {
    id: 'noodle', gender: 'male', title: 'The Noodle Puller', img: noodle, ratio: 267 / 447,
    vibe: 'Bandana on, flour everywhere. Thinks most problems end in noodles.',
    lines: ['Noodles fix most things.', 'A little flour never hurt anyone.', 'Long noodles, long life.'],
  },
  {
    id: 'shortcake', gender: 'female', title: 'The Shortcake', img: shortcake, ratio: 280 / 479,
    vibe: 'Messy bun, red scarf, always one strawberry ahead. Sweet with a sneaky streak.',
    lines: ['One for the cake, one for me.', 'Dessert counts as planning ahead.', 'Strawberries make everything better.'],
  },
  {
    id: 'simmer', gender: 'female', title: 'The Slow Simmer', img: simmer, ratio: 262 / 479,
    vibe: 'Red pot, oven mitt, no hurry at all. Believes in stews and second helpings.',
    lines: ['Low heat, good mood.', 'Let it bubble. It knows what it’s doing.', 'Soup is a hug you can eat.'],
  },
  {
    id: 'piper', gender: 'female', title: 'The Piping Bag', img: piper, ratio: 250 / 451,
    vibe: 'Brown beret, long curls, a steady hand for frosting. Dreamy and detail-proud.',
    lines: ['A little swirl on top?', 'It’s all in the wrist.', 'Pretty food tastes better. Science.'],
  },
  {
    id: 'herb', gender: 'female', title: 'The Herb Garden', img: herb, ratio: 264 / 473,
    vibe: 'Headband, curls, a bowl overflowing with greens. Bright, fresh and a bit bouncy.',
    lines: ['Add herbs. Trust me.', 'Crunchy, fresh, happy.', 'A squeeze of lemon fixes most things.'],
  },
  {
    id: 'bakery', gender: 'female', title: 'The Morning Bake', img: bakery, ratio: 301 / 469,
    vibe: 'White cap, long ponytail, a tray of croissants still warm. Early riser, calm energy.',
    lines: ['Smell that? Butter.', 'Good things take a little rise time.', 'Fresh out of the oven, just for you.'],
  },
];

export const CHEF_BY_ID = Object.fromEntries(CHEFS.map((c) => [c.id, c])) as Record<ChefId, Chef>;

import mapo from '../assets/photos/mapo-tofu.webp';
import kungpao from '../assets/photos/kung-pao-chicken.webp';
import eggplant from '../assets/photos/fish-fragrant-eggplant.webp';

/**
 * Real dish photos and where they came from. Every photo must have a source and license entry.
 * HowToCook (github.com/Anduin2017/HowToCook) is released under the Unlicense (public domain).
 */
export type PhotoCredit = { src: string; source: string; license: string; url: string; addedOn: string };

const HTC = 'HowToCook (Anduin2017)';
export const PHOTOS: Record<string, PhotoCredit> = {
  'mapo-tofu': { src: mapo, source: HTC, license: 'Unlicense (public domain)', url: 'https://github.com/Anduin2017/HowToCook/tree/master/dishes/meat_dish/麻婆豆腐', addedOn: '2026-10-25' },
  'kung-pao-chicken': { src: kungpao, source: HTC, license: 'Unlicense (public domain)', url: 'https://github.com/Anduin2017/HowToCook/tree/master/dishes/meat_dish/宫保鸡丁', addedOn: '2026-10-25' },
  'fish-fragrant-eggplant': { src: eggplant, source: HTC, license: 'Unlicense (public domain)', url: 'https://github.com/Anduin2017/HowToCook/tree/master/dishes/meat_dish/鱼香茄子', addedOn: '2026-10-25' },
};

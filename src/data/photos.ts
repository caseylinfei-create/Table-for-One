import mapo from '../assets/photos/mapo-tofu.webp';
import kungpao from '../assets/photos/kung-pao-chicken.webp';
import eggplant from '../assets/photos/fish-fragrant-eggplant.webp';
import steamedEgg from '../assets/photos/steamed-egg-custard.webp';
import porkBelly from '../assets/photos/red-braised-pork-belly.webp';
import bibimbap from '../assets/photos/bibimbap.webp';
import gyudon from '../assets/photos/gyudon.webp';
import curry from '../assets/photos/japanese-curry.webp';
import steak from '../assets/photos/steak-garlic-butter.webp';
import silkyEggs from '../assets/photos/silky-scrambled-eggs.webp';
import spinachEgg from '../assets/photos/spinach-egg-stir-fry.webp';
import zucchiniEgg from '../assets/photos/zucchini-egg-stir-fry.webp';
import tornCabbage from '../assets/photos/hand-torn-cabbage.webp';
import diSanXian from '../assets/photos/di-san-xian.webp';
import tomatoNoodles from '../assets/photos/tomato-egg-noodles.webp';
import shiitakeChicken from '../assets/photos/shiitake-chicken.webp';
import porkPotato from '../assets/photos/pork-potato-slices.webp';
import shrimp from '../assets/photos/wine-steamed-shrimp.webp';
import minchi from '../assets/photos/macau-minchi.webp';

/**
 * Real dish photos and where they came from. Every photo must have a source and license entry.
 * HowToCook (github.com/Anduin2017/HowToCook) is released under the Unlicense (public domain).
 * Photos are cropped to 4:3, resized to 800×600 and lightly color-matched.
 */
export type PhotoCredit = { src: string; source: string; license: string; url: string; addedOn: string; note?: string };

const HTC = 'HowToCook (Anduin2017)';
const UNL = 'Unlicense (public domain)';
const htc = (path: string) => `https://github.com/Anduin2017/HowToCook/tree/master/dishes/${path}`;

export const PHOTOS: Record<string, PhotoCredit> = {
  'mapo-tofu': { src: mapo, source: HTC, license: UNL, url: htc('meat_dish/麻婆豆腐'), addedOn: '2026-10-25' },
  'kung-pao-chicken': { src: kungpao, source: HTC, license: UNL, url: htc('meat_dish/宫保鸡丁'), addedOn: '2026-10-25' },
  'fish-fragrant-eggplant': { src: eggplant, source: HTC, license: UNL, url: htc('meat_dish/鱼香茄子'), addedOn: '2026-10-25' },
  'steamed-egg-custard': { src: steamedEgg, source: HTC, license: UNL, url: htc('vegetable_dish/鸡蛋羹'), addedOn: '2026-10-26' },
  'red-braised-pork-belly': { src: porkBelly, source: HTC, license: UNL, url: htc('meat_dish/湖南家常红烧肉'), addedOn: '2026-10-26', note: 'Hunan-style version; ours is the classic Shanghai-style braise.' },
  bibimbap: { src: bibimbap, source: HTC, license: UNL, url: htc('staple/韩式拌饭'), addedOn: '2026-10-26', note: 'Low-resolution original (414×308). Replace when a sharper photo is available.' },
  gyudon: { src: gyudon, source: HTC, license: UNL, url: htc('staple/日式肥牛丼饭'), addedOn: '2026-10-26' },
  'japanese-curry': { src: curry, source: HTC, license: UNL, url: htc('staple/日式咖喱饭'), addedOn: '2026-10-26' },
  'steak-garlic-butter': { src: steak, source: HTC, license: UNL, url: htc('meat_dish/牛排'), addedOn: '2026-10-26' },
  'silky-scrambled-eggs': { src: silkyEggs, source: HTC, license: UNL, url: htc('vegetable_dish/炒滑蛋'), addedOn: '2026-10-25' },
  'spinach-egg-stir-fry': { src: spinachEgg, source: HTC, license: UNL, url: htc('vegetable_dish/菠菜炒鸡蛋'), addedOn: '2026-10-25' },
  'zucchini-egg-stir-fry': { src: zucchiniEgg, source: HTC, license: UNL, url: htc('vegetable_dish/西葫芦炒鸡蛋'), addedOn: '2026-10-25' },
  'hand-torn-cabbage': { src: tornCabbage, source: HTC, license: UNL, url: htc('vegetable_dish/手撕包菜'), addedOn: '2026-10-25' },
  'di-san-xian': { src: diSanXian, source: HTC, license: UNL, url: htc('vegetable_dish/地三鲜'), addedOn: '2026-10-25' },
  'tomato-egg-noodles': { src: tomatoNoodles, source: HTC, license: UNL, url: htc('staple/西红柿鸡蛋挂面'), addedOn: '2026-10-25' },
  'shiitake-chicken': { src: shiitakeChicken, source: HTC, license: UNL, url: htc('meat_dish/香菇滑鸡'), addedOn: '2026-10-25' },
  'pork-potato-slices': { src: porkPotato, source: HTC, license: UNL, url: htc('meat_dish/瘦肉土豆片'), addedOn: '2026-10-25' },
  'wine-steamed-shrimp': { src: shrimp, source: HTC, license: UNL, url: htc('aquatic/白灼虾'), addedOn: '2026-10-25' },
  'macau-minchi': { src: minchi, source: HTC, license: UNL, url: htc('meat_dish/澳门湿版免治牛肉饭'), addedOn: '2026-10-25' },
};

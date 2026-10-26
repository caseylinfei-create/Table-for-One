import { createContext, useContext } from 'react';

export type LookId = 'diner' | 'night';
export type LookSetting = 'auto' | LookId;

/** Auto switches at these local hours: Night Kitchen from 6 pm, Diner from 6 am. */
export const NIGHT_STARTS = 18;
export const DAY_STARTS = 6;

export function lookFor(setting: LookSetting, d = new Date()): LookId {
  if (setting !== 'auto') return setting;
  const h = d.getHours();
  return h >= NIGHT_STARTS || h < DAY_STARTS ? 'night' : 'diner';
}

export const LOOK_OPTIONS: { id: LookSetting; name: string; note: string }[] = [
  { id: 'auto', name: 'Auto', note: 'Diner by day, Night Kitchen from 6 pm' },
  { id: 'diner', name: 'Diner', note: 'Always day' },
  { id: 'night', name: 'Night Kitchen', note: 'Always evening' },
];

/** Colors used by the illustrated kitchen. UI colors live in CSS (index.css). */
export type ScenePalette = {
  wallTop: string; wallBottom: string; dots: string;
  skyTop: string; skyMid: string; skyBottom: string; sun: string; hill1: string; hill2: string; beam: string;
  frame: string; sill: string; curtain: string; accentWarm: string; woodDark: string;
  wainscot: string; rail: string; wainscotLine: string;
  floorTop: string; floorBottom: string; floorLine: string; rug: string; sage: string;
  oakTop: string; oakBottom: string; oakEdge: string; cabTop: string; cabBottom: string; cabDoor: string; cabStroke: string; knob: string;
  f1: string; f2: string; f3: string; f4: string; fBase: string; fDoor: string;
  night: boolean; floor: 'checker' | 'wood';
};

export const SCENES: Record<LookId, ScenePalette> = {
  diner: {
    wallTop: '#E8F3E6', wallBottom: '#D6E9D6', dots: '#F3B4BA',
    skyTop: '#CDEBF2', skyMid: '#E9F6F3', skyBottom: '#D6EBC6', sun: '#FFF0A6', hill1: '#A9D58C', hill2: '#86C06E', beam: '#FFFBE0',
    frame: '#FFFFFF', sill: '#F1E7C8', curtain: '#D9404C', accentWarm: '#C8283A', woodDark: '#1F5C46',
    wainscot: '#FBEFB2', rail: '#2F7A5B', wainscotLine: '#F0DD8C',
    floorTop: '#EEE7D7', floorBottom: '#DDD3BE', floorLine: '#CFC3A8', rug: '#FFFFFF', sage: '#2F7A5B',
    oakTop: '#F7F4EC', oakBottom: '#E6E0D2', oakEdge: '#CBC3B0', cabTop: '#7FC4A3', cabBottom: '#5FA887', cabDoor: '#8DD0B0', cabStroke: '#6BB593', knob: '#F7F4EC',
    f1: '#E2505B', f2: '#F06F78', f3: '#E45761', f4: '#C93E49', fBase: '#A12E38', fDoor: '#D9454F',
    night: false, floor: 'checker',
  },
  night: {
    wallTop: '#3B3349', wallBottom: '#2D2739', dots: '#4C4362',
    skyTop: '#232A4D', skyMid: '#3A3C6E', skyBottom: '#5B4E7E', sun: '#F7E7AE', hill1: '#2D3A4A', hill2: '#222D3A', beam: '#F7D27A',
    frame: '#4A4158', sill: '#3E3650', curtain: '#6E5C93', accentWarm: '#8E7BB8', woodDark: '#1C1824',
    wainscot: '#303D3F', rail: '#263234', wainscotLine: '#384749',
    floorTop: '#5B4737', floorBottom: '#4A392C', floorLine: '#3E3025', rug: '#3B3448', sage: '#F4C24D',
    oakTop: '#7A604C', oakBottom: '#654F3F', oakEdge: '#523F32', cabTop: '#4A3B31', cabBottom: '#3A2E27', cabDoor: '#43352C', cabStroke: '#5A483B', knob: '#F4C24D',
    f1: '#E8D3A2', f2: '#F3E3BB', f3: '#E7D19E', f4: '#CBB27D', fBase: '#A38D5A', fDoor: '#DCC58F',
    night: true, floor: 'wood',
  },
};

export const SceneCtx = createContext<ScenePalette>(SCENES.diner);
export const useScene = () => useContext(SceneCtx);

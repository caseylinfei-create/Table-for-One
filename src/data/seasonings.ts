import type { Seasoning, SeasoningGroup } from '../domain/types';

export const SEASONING_GROUPS: { id: SeasoningGroup; label: string; note: string }[] = [
  { id: 'basics', label: 'Basics', note: 'The everyday shelf' },
  { id: 'fresh', label: 'Fresh', note: 'Aromatics in the basket' },
  { id: 'asian', label: 'Asian Sauces', note: 'Pastes, sauces and heat' },
  { id: 'western', label: 'Western', note: 'Butter, oils, spices, sweet things' },
];

const S = (
  id: string, name: string, group: SeasoningGroup, shape: Seasoning['shape'], color: string, accent: string,
): Seasoning => ({ id, name, group, shape, color, accent });

export const SEASONINGS: Seasoning[] = [
  S('oil', 'Oil', 'basics', 'tall-bottle', '#E8C25A', '#7A6A3A'),
  S('salt', 'Salt', 'basics', 'shaker', '#F4F1EA', '#9AA3A8'),
  S('sugar', 'Sugar', 'basics', 'jar', '#F7F2E6', '#D9A35B'),
  S('soy-sauce', 'Soy Sauce', 'basics', 'bottle', '#4A2C22', '#D9604A'),
  S('dark-soy', 'Dark Soy', 'basics', 'bottle', '#2B1A15', '#E1B04A'),
  S('vinegar', 'Vinegar', 'basics', 'tall-bottle', '#8A5A3A', '#A8B99A'),
  S('cooking-wine', 'Cooking Wine', 'basics', 'tall-bottle', '#B97A46', '#76543B'),
  S('cornstarch', 'Cornstarch', 'basics', 'pouch', '#F3EFE6', '#6C8FAE'),
  S('black-pepper', 'Black Pepper', 'basics', 'grinder', '#3A3430', '#76543B'),
  S('white-pepper', 'White Pepper', 'basics', 'shaker', '#EFE8DA', '#C9B68A'),

  S('garlic', 'Garlic', 'fresh', 'bulb', '#F2EBDD', '#C9B4D0'),
  S('ginger', 'Ginger', 'fresh', 'root', '#D9B276', '#A9814E'),

  S('sesame-oil', 'Sesame Oil', 'asian', 'bottle', '#B8782F', '#38342F'),
  S('oyster-sauce', 'Oyster Sauce', 'asian', 'bottle', '#3D2A20', '#D96B58'),
  S('dried-chili', 'Dried Chili', 'asian', 'chili', '#C23B2E', '#76543B'),
  S('doubanjiang', 'Doubanjiang', 'asian', 'jar', '#A7372B', '#F5D98B'),
  S('sichuan-pepper', 'Sichuan Pepper', 'asian', 'jar', '#8C3B2C', '#A8B99A'),
  S('mirin', 'Mirin', 'asian', 'tall-bottle', '#E2C27A', '#D96B58'),
  S('miso', 'Miso', 'asian', 'tub', '#C99A55', '#76543B'),
  S('fish-sauce', 'Fish Sauce', 'asian', 'bottle', '#B06A2E', '#A8B99A'),
  S('birds-eye-chili', "Bird's Eye Chili", 'asian', 'chili', '#D8432F', '#5E8C4A'),
  S('green-curry', 'Green Curry Paste', 'asian', 'tub', '#6E8E46', '#F5D98B'),
  S('tom-yum', 'Tom Yum Paste', 'asian', 'tub', '#D16B3A', '#5E8C4A'),
  S('gochujang', 'Gochujang', 'asian', 'tub', '#B8352B', '#38342F'),
  S('chili-flakes', 'Chili Flakes', 'asian', 'shaker', '#C8452F', '#F5D98B'),
  S('dashi', 'Dashi Granules', 'asian', 'pouch', '#E7D2A6', '#3B5A3E'),
  S('tamarind', 'Tamarind Paste', 'asian', 'tub', '#6B3A26', '#E3A83A'),
  S('sesame-seeds', 'Sesame Seeds', 'asian', 'jar', '#EADFC4', '#76543B'),

  S('butter', 'Butter', 'western', 'block', '#F3D77E', '#76543B'),
  S('olive-oil', 'Olive Oil', 'western', 'tall-bottle', '#9BA34A', '#38342F'),
  S('ketchup', 'Ketchup', 'western', 'squeeze', '#C8392D', '#F4F1EA'),
  S('honey', 'Honey', 'western', 'jar', '#E3A83A', '#76543B'),
  S('mayo', 'Mayonnaise', 'western', 'squeeze', '#F6EED2', '#D96B58'),
  S('paprika', 'Paprika', 'western', 'shaker', '#C9502F', '#76543B'),
  S('cumin', 'Ground Cumin', 'western', 'jar', '#B07A3A', '#38342F'),
];

/** What a brand-new kitchen starts with. Everything else starts as "Need it". */
export const DEFAULT_OWNED = ['oil', 'salt', 'sugar', 'soy-sauce', 'vinegar', 'black-pepper', 'garlic', 'ginger'];

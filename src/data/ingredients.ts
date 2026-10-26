import type { CategoryId, Ingredient } from '../domain/types';

export const CATEGORIES: { id: CategoryId | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'vegetables', label: 'Vegetables' },
  { id: 'fruits', label: 'Fruits' },
  { id: 'meat', label: 'Meat' },
  { id: 'seafood', label: 'Seafood' },
  { id: 'eggs-dairy', label: 'Eggs & Dairy' },
  { id: 'grains', label: 'Grains' },
  { id: 'tofu-beans', label: 'Tofu & Beans' },
  { id: 'frozen', label: 'Frozen' },
  { id: 'other', label: 'Other' },
];

// gramsPerUnit values are household estimates used later for recipe matching.
const I = (
  id: string, name: string, category: CategoryId, unit: Ingredient['unit'],
  step: number, defaultQty: number, icon: Ingredient['icon'], color: string,
  gramsPerUnit?: number, aliases?: string[],
): Ingredient => ({ id, name, category, unit, step, defaultQty, icon, color, gramsPerUnit, aliases });

export const INGREDIENTS: Ingredient[] = [
  // Vegetables
  I('tomato', 'Tomato', 'vegetables', 'pc', 1, 3, 'round', '#D9604A', 150),
  I('onion', 'Onion', 'vegetables', 'pc', 0.5, 2, 'round', '#C99A6B', 170),
  I('potato', 'Potato', 'vegetables', 'pc', 1, 3, 'root', '#C7A276', 200),
  I('sweet-potato', 'Sweet Potato', 'vegetables', 'pc', 1, 2, 'root', '#B5634A', 250),
  I('carrot', 'Carrot', 'vegetables', 'pc', 1, 3, 'long', '#E08A3C', 70),
  I('daikon', 'Daikon', 'vegetables', 'pc', 0.25, 1, 'long', '#EDE6D6', 800, ['radish']),
  I('cabbage', 'Cabbage', 'vegetables', 'head', 0.25, 1, 'head', '#A9C48B', 900),
  I('napa-cabbage', 'Napa Cabbage', 'vegetables', 'head', 0.25, 1, 'head', '#D6E3B0', 1000, ['chinese cabbage']),
  I('bok-choy', 'Bok Choy', 'vegetables', 'bunch', 0.5, 1, 'leafy', '#7FA867', 250, ['pak choi']),
  I('spinach', 'Spinach', 'vegetables', 'handful', 0.5, 2, 'leafy', '#4F7D45', 30),
  I('lettuce', 'Lettuce', 'vegetables', 'head', 0.25, 1, 'head', '#9CC27A', 500),
  I('broccoli', 'Broccoli', 'vegetables', 'head', 0.5, 1, 'head', '#5D8A4A', 350),
  I('cauliflower', 'Cauliflower', 'vegetables', 'head', 0.25, 1, 'head', '#EEE8D5', 600),
  I('cucumber', 'Cucumber', 'vegetables', 'pc', 1, 2, 'long', '#6E9A55', 300),
  I('zucchini', 'Zucchini', 'vegetables', 'pc', 1, 1, 'long', '#5E8C4A', 250, ['courgette']),
  I('eggplant', 'Eggplant', 'vegetables', 'pc', 1, 1, 'long', '#6B4A78', 300, ['aubergine']),
  I('bell-pepper', 'Bell Pepper', 'vegetables', 'pc', 1, 2, 'round', '#E3B23C', 160, ['capsicum']),
  I('mushroom', 'Button Mushroom', 'vegetables', 'handful', 0.5, 2, 'mushroom', '#D9C8AE', 60),
  I('shiitake', 'Shiitake', 'vegetables', 'pc', 1, 4, 'mushroom', '#8A5E3F', 20),
  I('enoki', 'Enoki', 'vegetables', 'pack', 0.5, 1, 'mushroom', '#F0E9DA', 200),
  I('bean-sprouts', 'Bean Sprouts', 'vegetables', 'handful', 0.5, 2, 'stalk', '#EFE7C9', 50),
  I('scallion', 'Scallion', 'vegetables', 'stalk', 1, 4, 'stalk', '#7FAE5A', 15, ['green onion', 'spring onion']),
  I('leek', 'Leek', 'vegetables', 'stalk', 1, 1, 'stalk', '#A5C27C', 150),
  I('celery', 'Celery', 'vegetables', 'stalk', 1, 3, 'stalk', '#9CBF6E', 40),
  I('cilantro', 'Cilantro', 'vegetables', 'bunch', 0.5, 1, 'leafy', '#5E9A4E', 30, ['coriander']),
  I('thai-basil', 'Thai Basil', 'vegetables', 'handful', 0.5, 1, 'leafy', '#3F7046', 10, ['holy basil']),
  I('basil', 'Basil', 'vegetables', 'handful', 0.25, 1, 'leafy', '#4E8A45', 10, ['sweet basil', 'italian basil']),
  I('lemongrass', 'Lemongrass', 'vegetables', 'stalk', 1, 2, 'stalk', '#C9C98A', 20),
  I('corn', 'Corn', 'vegetables', 'pc', 1, 2, 'long', '#E9C548', 200, ['sweetcorn']),
  I('green-beans', 'Green Beans', 'vegetables', 'handful', 0.5, 2, 'beans', '#6A9A4C', 60),
  I('asparagus', 'Asparagus', 'vegetables', 'bunch', 0.5, 1, 'stalk', '#7FA05A', 250),
  I('kale', 'Kale', 'vegetables', 'handful', 0.5, 2, 'leafy', '#3E6B45', 30),

  // Fruits
  I('lemon', 'Lemon', 'fruits', 'pc', 0.5, 2, 'citrus', '#EBC944', 100),
  I('lime', 'Lime', 'fruits', 'pc', 0.5, 2, 'citrus', '#8DB04A', 60),
  I('apple', 'Apple', 'fruits', 'pc', 1, 3, 'round', '#C9473E', 180),
  I('banana', 'Banana', 'fruits', 'pc', 1, 3, 'banana', '#EBC94D', 120),
  I('avocado', 'Avocado', 'fruits', 'pc', 0.5, 1, 'round', '#5D7A3C', 170),
  I('mango', 'Mango', 'fruits', 'pc', 1, 1, 'round', '#EFA93C', 300),
  I('orange', 'Orange', 'fruits', 'pc', 1, 2, 'citrus', '#E8903A', 150),
  I('strawberry', 'Strawberries', 'fruits', 'handful', 0.5, 1, 'round', '#D4483F', 80),
  I('pineapple', 'Pineapple', 'fruits', 'slice', 1, 4, 'slice', '#E9C04A', 80),

  // Meat
  I('chicken-breast', 'Chicken Breast', 'meat', 'serving', 0.5, 2, 'meat', '#EBB9A3', 150),
  I('chicken-thigh', 'Chicken Thigh', 'meat', 'pc', 1, 2, 'meat', '#E3A88F', 120),
  I('ground-pork', 'Ground Pork', 'meat', 'serving', 0.5, 2, 'meat', '#E39A8E', 120, ['minced pork']),
  I('pork-belly', 'Pork Belly', 'meat', 'serving', 0.5, 1, 'meat', '#E6A796', 150),
  I('pork-loin', 'Lean Pork', 'meat', 'serving', 0.5, 2, 'meat', '#E7A79A', 120, ['pork loin', 'pork tenderloin', 'pork chop']),
  I('beef-slices', 'Thin Beef Slices', 'meat', 'serving', 0.5, 2, 'meat', '#B9554A', 120, ['shabu beef']),
  I('ground-beef', 'Ground Beef', 'meat', 'serving', 0.5, 2, 'meat', '#A84C42', 120, ['minced beef']),
  I('ground-chicken', 'Ground Chicken', 'meat', 'serving', 0.5, 2, 'meat', '#EFC3AE', 120, ['minced chicken']),
  I('steak', 'Beef Steak', 'meat', 'pc', 1, 1, 'meat', '#9E4640', 220),
  I('bacon', 'Bacon', 'meat', 'slice', 1, 6, 'slice', '#D98479', 20),
  I('ham', 'Ham', 'meat', 'slice', 1, 4, 'slice', '#E8A3A0', 25),
  I('sausage', 'Sausage', 'meat', 'pc', 1, 4, 'long', '#B4614D', 60),

  // Seafood
  I('shrimp', 'Shrimp', 'seafood', 'handful', 0.5, 2, 'shrimp', '#EA9A7A', 80, ['prawn']),
  I('salmon', 'Salmon Fillet', 'seafood', 'pc', 1, 2, 'fish', '#EC8C69', 150),
  I('white-fish', 'White Fish Fillet', 'seafood', 'pc', 1, 2, 'fish', '#E9E1D3', 150, ['cod', 'tilapia']),
  I('squid', 'Squid', 'seafood', 'pc', 1, 1, 'fish', '#EEDCD2', 200),
  I('clams', 'Clams', 'seafood', 'handful', 0.5, 2, 'round', '#CDBFA8', 120),
  I('canned-tuna', 'Canned Tuna', 'seafood', 'can', 0.5, 2, 'can', '#6C8FAE', 140),

  // Eggs & Dairy
  I('egg', 'Egg', 'eggs-dairy', 'pc', 1, 6, 'egg', '#F2E2C4', 50),
  I('milk', 'Milk', 'eggs-dairy', 'cup', 0.5, 4, 'carton', '#F4F1E8', 240),
  I('heavy-cream', 'Heavy Cream', 'eggs-dairy', 'cup', 0.5, 1, 'carton', '#F6EEDB', 240),
  I('cheese-slice', 'Cheese Slice', 'eggs-dairy', 'slice', 1, 6, 'slice', '#F0C34E', 20),
  I('mozzarella', 'Mozzarella', 'eggs-dairy', 'handful', 0.5, 2, 'round', '#F5EFDF', 40),
  I('parmesan', 'Parmesan', 'eggs-dairy', 'handful', 0.5, 1, 'block', '#EAD49A', 20),
  I('yogurt', 'Plain Yogurt', 'eggs-dairy', 'cup', 0.5, 2, 'bowl', '#F7F3EA', 240),

  // Grains
  I('rice', 'Rice (uncooked)', 'grains', 'cup', 0.5, 4, 'grain', '#F2EEE3', 190),
  I('cooked-rice', 'Leftover Rice', 'grains', 'bowl', 0.5, 2, 'bowl', '#F5F2EA', 180),
  I('pasta', 'Pasta', 'grains', 'serving', 1, 4, 'noodle', '#E8C77A', 100, ['spaghetti', 'penne']),
  I('ramen', 'Ramen Noodles', 'grains', 'pack', 1, 3, 'noodle', '#E5C06C', 90),
  I('noodles', 'Wheat Noodles', 'grains', 'serving', 1, 3, 'noodle', '#EBD9A8', 100, ['dried noodles', 'guamian', 'lo mein']),
  I('udon', 'Udon', 'grains', 'pack', 1, 2, 'noodle', '#F0E5C8', 200),
  I('rice-noodles', 'Rice Noodles', 'grains', 'serving', 1, 2, 'noodle', '#F2ECDD', 80),
  I('bread', 'Bread', 'grains', 'slice', 1, 6, 'slice', '#D9A866', 35),
  I('baguette', 'Baguette', 'grains', 'pc', 0.5, 1, 'long', '#D19A55', 250),
  I('tortilla', 'Tortilla', 'grains', 'pc', 1, 4, 'slice', '#E8D3A3', 45),
  I('rice-cakes', 'Rice Cakes (tteok)', 'grains', 'handful', 0.5, 2, 'long', '#F3EEE2', 100, ['tteok']),
  I('flour', 'Flour', 'grains', 'cup', 0.5, 2, 'bag', '#F2ECE0', 125),

  // Tofu & Beans
  I('firm-tofu', 'Firm Tofu', 'tofu-beans', 'pack', 0.5, 1, 'block', '#F3EBD8', 400),
  I('silken-tofu', 'Silken Tofu', 'tofu-beans', 'pack', 0.5, 1, 'block', '#F8F2E4', 300),
  I('edamame', 'Edamame', 'tofu-beans', 'handful', 0.5, 2, 'beans', '#7DAA55', 60),
  I('chickpeas', 'Chickpeas', 'tofu-beans', 'can', 0.5, 1, 'can', '#D9B97A', 240),
  I('black-beans', 'Black Beans', 'tofu-beans', 'can', 0.5, 1, 'can', '#4A4044', 240),
  I('soy-milk', 'Soy Milk', 'tofu-beans', 'cup', 0.5, 4, 'carton', '#EFE6D2', 240),

  // Frozen
  I('frozen-dumplings', 'Frozen Dumplings', 'frozen', 'serving', 1, 3, 'bag', '#EEE6D6', 200, ['gyoza', 'potstickers']),
  I('frozen-peas', 'Frozen Peas', 'frozen', 'handful', 0.5, 3, 'beans', '#6FA352', 60),
  I('frozen-veg', 'Frozen Mixed Veg', 'frozen', 'handful', 0.5, 3, 'bag', '#9DBF6A', 60),
  I('frozen-shrimp', 'Frozen Shrimp', 'frozen', 'handful', 0.5, 3, 'shrimp', '#E8A58A', 80),
  I('frozen-corn', 'Frozen Corn', 'frozen', 'handful', 0.5, 2, 'beans', '#E8C34A', 60),

  // Other
  I('kimchi', 'Kimchi', 'other', 'bowl', 0.5, 1, 'bowl', '#C9523E', 150),
  I('coconut-milk', 'Coconut Milk', 'other', 'can', 0.5, 1, 'can', '#E9E3D4', 400),
  I('canned-tomato', 'Canned Tomatoes', 'other', 'can', 0.5, 1, 'can', '#C44A3B', 400),
  I('chicken-stock', 'Chicken Stock', 'other', 'cup', 0.5, 4, 'carton', '#E6C487', 240, ['broth']),
  I('seaweed', 'Seaweed Sheets', 'other', 'sheet', 1, 5, 'slice', '#2F4A3A', 3, ['nori', 'gim']),
  I('peanuts', 'Peanuts', 'other', 'handful', 0.5, 1, 'beans', '#C9965E', 30),
  I('curry-roux', 'Curry Roux Cube', 'other', 'pc', 1, 8, 'block', '#9A6430', 20, ['japanese curry']),
  I('wakame', 'Dried Wakame', 'other', 'handful', 0.25, 1, 'leafy', '#3B5A3E', 8, ['seaweed']),
];

export const INGREDIENT_BY_ID: Record<string, Ingredient> = Object.fromEntries(
  INGREDIENTS.map((i) => [i.id, i]),
);

/** A believable lived-in fridge used by "Start with a sample fridge". */
export const SAMPLE_FRIDGE: [string, number][] = [
  ['egg', 6], ['tomato', 3], ['spinach', 2], ['scallion', 4], ['chicken-breast', 1],
  ['firm-tofu', 1], ['cooked-rice', 1], ['onion', 1], ['mushroom', 1.5], ['milk', 3],
  ['kimchi', 0.5], ['lemon', 1], ['pasta', 3], ['cheese-slice', 4],
];

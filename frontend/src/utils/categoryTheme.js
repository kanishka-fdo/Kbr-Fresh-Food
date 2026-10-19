// Central theme map so every category/product gets a consistent, professional
// SVG icon and color identity across the app (cards, badges, category filters).

import {
  Apple,
  Salad,
  Milk,
  Wheat,
  Flame,
  Croissant,
  CupSoda,
  Fish,
  ShoppingBag,
  Banana,
  Citrus,
  Grape,
  Carrot,
  Egg,
  Leaf,
  Cake,
  Cookie,
  Coffee,
  Beef,
  Soup,
} from 'lucide-react';

export const CATEGORY_THEMES = {
  fruit: {
    label: 'Fruits',
    icon: Apple,
    gradient: 'from-orange-300 via-amber-300 to-yellow-200',
    solid: 'bg-orange-500',
    text: 'text-orange-700',
    chip: 'bg-orange-100 text-orange-700 border-orange-200',
  },
  vegetable: {
    label: 'Vegetables',
    icon: Salad,
    gradient: 'from-brand-400 via-brand-300 to-lime-200',
    solid: 'bg-brand-600',
    text: 'text-brand-700',
    chip: 'bg-brand-100 text-brand-700 border-brand-200',
  },
  dairy: {
    label: 'Dairy & Eggs',
    icon: Milk,
    gradient: 'from-sky-300 via-blue-200 to-cyan-100',
    solid: 'bg-sky-500',
    text: 'text-sky-700',
    chip: 'bg-sky-100 text-sky-700 border-sky-200',
  },
  grain: {
    label: 'Rice & Grains',
    icon: Wheat,
    gradient: 'from-yellow-300 via-amber-200 to-orange-100',
    solid: 'bg-amber-600',
    text: 'text-amber-700',
    chip: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  spice: {
    label: 'Spices & Herbs',
    icon: Flame,
    gradient: 'from-red-300 via-rose-300 to-orange-200',
    solid: 'bg-red-500',
    text: 'text-red-700',
    chip: 'bg-red-100 text-red-700 border-red-200',
  },
  bakery: {
    label: 'Bakery',
    icon: Croissant,
    gradient: 'from-amber-200 via-orange-200 to-rose-100',
    solid: 'bg-amber-700',
    text: 'text-amber-800',
    chip: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  beverage: {
    label: 'Beverages',
    icon: CupSoda,
    gradient: 'from-pink-300 via-fuchsia-200 to-purple-200',
    solid: 'bg-fuchsia-500',
    text: 'text-fuchsia-700',
    chip: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
  },
  seafood: {
    label: 'Seafood',
    icon: Fish,
    gradient: 'from-cyan-300 via-teal-200 to-blue-100',
    solid: 'bg-teal-500',
    text: 'text-teal-700',
    chip: 'bg-teal-100 text-teal-700 border-teal-200',
  },
  other: {
    label: 'Other',
    icon: ShoppingBag,
    gradient: 'from-gray-200 via-gray-100 to-slate-100',
    solid: 'bg-gray-500',
    text: 'text-gray-700',
    chip: 'bg-gray-100 text-gray-700 border-gray-200',
  },
};

// Individual product icon overrides for common grocery items
const PRODUCT_ICONS = {
  banana: Banana,
  apple: Apple,
  grapes: Grape,
  orange: Citrus,
  lemon: Citrus,
  lime: Citrus,
  citrus: Citrus,
  carrot: Carrot,
  cabbage: Salad,
  leeks: Salad,
  salad: Salad,
  milk: Milk,
  yogurt: Milk,
  cheese: Milk,
  egg: Egg,
  eggs: Egg,
  rice: Wheat,
  wheat: Wheat,
  flour: Wheat,
  oats: Wheat,
  dhal: Wheat,
  lentils: Wheat,
  cinnamon: Leaf,
  herbs: Leaf,
  cardamom: Leaf,
  turmeric: Leaf,
  ginger: Leaf,
  pepper: Flame,
  chili: Flame,
  spicy: Flame,
  capsicum: Flame,
  bread: Croissant,
  bun: Croissant,
  bakery: Croissant,
  cake: Cake,
  cookie: Cookie,
  biscuit: Cookie,
  coffee: Coffee,
  tea: Coffee,
  juice: CupSoda,
  beverage: CupSoda,
  water: CupSoda,
  fish: Fish,
  seafood: Fish,
  prawns: Fish,
  crab: Fish,
  meat: Beef,
  beef: Beef,
  soup: Soup,
};

export function getProductIcon(name = '', categoryType = 'other') {
  const key = name.toLowerCase().trim();
  for (const [k, icon] of Object.entries(PRODUCT_ICONS)) {
    if (key.includes(k)) return icon;
  }
  return CATEGORY_THEMES[categoryType]?.icon || CATEGORY_THEMES.other.icon;
}

export function getCategoryTheme(categoryType = 'other') {
  return CATEGORY_THEMES[categoryType] || CATEGORY_THEMES.other;
}

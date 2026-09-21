// Central theme map so every category/product gets a consistent, vivid
// color identity across the app (cards, badges, category tiles) without
// depending on external stock photos.

export const CATEGORY_THEMES = {
  fruit: {
    label: 'Fruits',
    emoji: '🍍',
    gradient: 'from-orange-300 via-amber-300 to-yellow-200',
    solid: 'bg-orange-500',
    text: 'text-orange-700',
    chip: 'bg-orange-100 text-orange-700',
  },
  vegetable: {
    label: 'Vegetables',
    emoji: '🥦',
    gradient: 'from-brand-400 via-brand-300 to-lime-200',
    solid: 'bg-brand-600',
    text: 'text-brand-700',
    chip: 'bg-brand-100 text-brand-700',
  },
  dairy: {
    label: 'Dairy & Eggs',
    emoji: '🥛',
    gradient: 'from-sky-300 via-blue-200 to-cyan-100',
    solid: 'bg-sky-500',
    text: 'text-sky-700',
    chip: 'bg-sky-100 text-sky-700',
  },
  grain: {
    label: 'Rice & Grains',
    emoji: '🌾',
    gradient: 'from-yellow-300 via-amber-200 to-orange-100',
    solid: 'bg-amber-600',
    text: 'text-amber-700',
    chip: 'bg-amber-100 text-amber-700',
  },
  spice: {
    label: 'Spices & Herbs',
    emoji: '🌶️',
    gradient: 'from-red-300 via-rose-300 to-orange-200',
    solid: 'bg-red-500',
    text: 'text-red-700',
    chip: 'bg-red-100 text-red-700',
  },
  bakery: {
    label: 'Bakery',
    emoji: '🍞',
    gradient: 'from-amber-200 via-orange-200 to-rose-100',
    solid: 'bg-amber-700',
    text: 'text-amber-800',
    chip: 'bg-amber-100 text-amber-800',
  },
  beverage: {
    label: 'Beverages',
    emoji: '🥤',
    gradient: 'from-pink-300 via-fuchsia-200 to-purple-200',
    solid: 'bg-fuchsia-500',
    text: 'text-fuchsia-700',
    chip: 'bg-fuchsia-100 text-fuchsia-700',
  },
  seafood: {
    label: 'Seafood',
    emoji: '🐟',
    gradient: 'from-cyan-300 via-teal-200 to-blue-100',
    solid: 'bg-teal-500',
    text: 'text-teal-700',
    chip: 'bg-teal-100 text-teal-700',
  },
  other: {
    label: 'Other',
    emoji: '🛒',
    gradient: 'from-gray-200 via-gray-100 to-slate-100',
    solid: 'bg-gray-500',
    text: 'text-gray-700',
    chip: 'bg-gray-100 text-gray-700',
  },
};

// Individual product emoji overrides for common items so cards feel specific
// rather than every fruit looking identical.
const PRODUCT_EMOJI = {
  banana: '🍌', papaya: '🍈', 'king coconut': '🥥', coconut: '🥥', mango: '🥭',
  pineapple: '🍍', watermelon: '🍉', orange: '🍊', apple: '🍎', grapes: '🍇',
  lime: '🍋', lemon: '🍋', avocado: '🥑', guava: '🍈', rambutan: '🍈', jackfruit: '🍈',
  carrot: '🥕', tomato: '🍅', cabbage: '🥬', potato: '🥔', onion: '🧅', garlic: '🧄',
  pumpkin: '🎃', beans: '🫘', okra: '🫑', pepper: '🌶️', chili: '🌶️', capsicum: '🫑',
  brinjal: '🍆', eggplant: '🍆', cucumber: '🥒', beetroot: '🍠', leeks: '🥬',
  milk: '🥛', cheese: '🧀', egg: '🥚', eggs: '🥚', yogurt: '🥛', butter: '🧈',
  rice: '🍚', wheat: '🌾', flour: '🌾', oats: '🌾', lentils: '🫘', dhal: '🫘',
  cinnamon: '🌿', pepper: '🫑', cardamom: '🌿', turmeric: '🌿', ginger: '🫚',
  bread: '🍞', bun: '🥖', cake: '🍰', biscuit: '🍪',
  tea: '🍵', coffee: '☕', juice: '🧃', water: '💧',
  fish: '🐟', prawns: '🦐', crab: '🦀',
};

export function getProductEmoji(name = '', categoryType = 'other') {
  const key = name.toLowerCase().trim();
  for (const [k, emoji] of Object.entries(PRODUCT_EMOJI)) {
    if (key.includes(k)) return emoji;
  }
  return CATEGORY_THEMES[categoryType]?.emoji || CATEGORY_THEMES.other.emoji;
}

export function getCategoryTheme(categoryType = 'other') {
  return CATEGORY_THEMES[categoryType] || CATEGORY_THEMES.other;
}

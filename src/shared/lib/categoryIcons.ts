import {
  UtensilsCrossed,
  Cake,
  Wine,
  Soup,
  Salad,
  Fish,
  Beef,
  Utensils,
  Leaf,
  type LucideIcon
} from 'lucide-vue-next';

// Map category names to icons
export const getCategoryIcon = (categoryName: string): LucideIcon => {
  const lowerName = categoryName?.toLowerCase() || '';

  // Exact matches and Vietnamese approximations
  if (lowerName.includes('dessert') || lowerName.includes('tráng miệng') || lowerName.includes('ngọt')) return Cake;
  if (lowerName.includes('beverage') || lowerName.includes('drink') || lowerName.includes('đồ uống') || lowerName.includes('nước')) return Wine;
  if (lowerName.includes('soup') || lowerName.includes('canh') || lowerName.includes('súp')) return Soup;
  if (lowerName.includes('salad') || lowerName.includes('gỏi')) return Salad;
  if (lowerName.includes('seafood') || lowerName.includes('hải sản') || lowerName.includes('tôm') || lowerName.includes('cá') || lowerName.includes('mực')) return Fish;
  if (lowerName.includes('meat') || lowerName.includes('thịt') || lowerName.includes('bò') || lowerName.includes('gà') || lowerName.includes('heo')) return Beef;
  if (lowerName.includes('pasta') || lowerName.includes('noodle') || lowerName.includes('mì') || lowerName.includes('bún') || lowerName.includes('phở') || lowerName.includes('đồ khô')) return Utensils;
  if (lowerName.includes('vegetarian') || lowerName.includes('vegan') || lowerName.includes('chay') || lowerName.includes('rau') || lowerName.includes('củ') || lowerName.includes('quả')) return Leaf;
  if (lowerName.includes('vị') || lowerName.includes('spice') || lowerName.includes('hương')) return Leaf;

  // Fallback
  return UtensilsCrossed;
};

// Get color for category badge
export const getCategoryColor = (categoryName: string): string => {
  const lowerName = categoryName?.toLowerCase() || '';

  if (lowerName.includes('appetizer') || lowerName.includes('khai vị')) return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
  if (lowerName.includes('main') || lowerName.includes('chính')) return 'bg-green-500/20 text-green-400 border border-green-500/30';
  if (lowerName.includes('dessert') || lowerName.includes('tráng miệng') || lowerName.includes('ngọt')) return 'bg-pink-500/20 text-pink-400 border border-pink-500/30';
  if (lowerName.includes('beverage') || lowerName.includes('drink') || lowerName.includes('đồ uống') || lowerName.includes('nước')) return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
  if (lowerName.includes('soup') || lowerName.includes('canh') || lowerName.includes('súp')) return 'bg-orange-500/20 text-orange-400 border border-orange-500/30';
  if (lowerName.includes('salad') || lowerName.includes('gỏi')) return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
  if (lowerName.includes('seafood') || lowerName.includes('hải sản') || lowerName.includes('cá') || lowerName.includes('tôm')) return 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30';
  if (lowerName.includes('meat') || lowerName.includes('thịt')) return 'bg-red-500/20 text-red-400 border border-red-500/30';
  if (lowerName.includes('pasta') || lowerName.includes('bún') || lowerName.includes('phở') || lowerName.includes('mì') || lowerName.includes('đồ khô')) return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
  if (lowerName.includes('vegetarian') || lowerName.includes('vegan') || lowerName.includes('chay') || lowerName.includes('rau') || lowerName.includes('củ')) return 'bg-lime-500/20 text-lime-400 border border-lime-500/30';
  if (lowerName.includes('vị') || lowerName.includes('spice') || lowerName.includes('hương')) return 'bg-purple-500/20 text-purple-400 border border-purple-500/30';

  return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
};

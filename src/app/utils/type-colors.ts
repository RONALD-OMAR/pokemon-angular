export const TYPE_COLORS: Record<string, string> = {
  normal: '#e5e7eb',
  fire: '#fecaca',
  water: '#bfdbfe',
  electric: '#fde68a',
  grass: '#bbf7d0',
  ice: '#cffafe',
  fighting: '#fecdd3',
  poison: '#e9d5ff',
  ground: '#fde68a',
  flying: '#e0e7ff',
  psychic: '#fbcfe8',
  bug: '#d9f99d',
  rock: '#e7e5e4',
  ghost: '#ddd6fe',
  dragon: '#c7d2fe',
  dark: '#d6d3d1',
  steel: '#e5e7eb',
  fairy: '#fbcfe8',
};

export function getTypeColor(type: string): string {
  return TYPE_COLORS[type] ?? '#ffffff';
}

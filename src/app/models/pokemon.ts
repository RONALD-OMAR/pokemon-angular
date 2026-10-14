export interface NamedResource {
  name: string;
  url: string;
}

export interface PokemonListItem {
  id: number;
  name: string;
}

export interface PokemonTypeSlot {
  slot: number;
  type: NamedResource;
}

export interface PokemonAbilitySlot {
  ability: NamedResource;
  is_hidden: boolean;
  slot: number;
}

export interface PokemonStat {
  base_stat: number;
  effort: number;
  stat: NamedResource;
}

export interface PokemonSprites {
  front_default: string | null;
  front_shiny: string | null;
  other?: {
    'official-artwork'?: {
      front_default: string | null;
      front_shiny: string | null;
    };
  };
}

export interface PokemonCries {
  latest: string | null;
  legacy: string | null;
}

export interface PokemonDetail {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number | null;
  types: PokemonTypeSlot[];
  abilities: PokemonAbilitySlot[];
  stats: PokemonStat[];
  sprites: PokemonSprites;
  cries?: PokemonCries;
}

export interface TypeEntry {
  name: string;
  pokemon: { pokemon: NamedResource; slot: number }[];
}

export interface GenerationEntry {
  name: string;
  pokemon_species: NamedResource[];
}

export interface FlavorTextEntry {
  flavor_text: string;
  language: NamedResource;
}

export interface EvolutionDetail {
  min_level: number | null;
  trigger: NamedResource;
  item: NamedResource | null;
}

export interface ChainLink {
  species: NamedResource;
  evolution_details: EvolutionDetail[];
  evolves_to: ChainLink[];
}

export interface EvolutionChain {
  chain: ChainLink;
}

export interface EvolutionStage {
  id: number;
  name: string;
  requirement: string | null;
}

// Types basés sur l'API Tyradex
export interface PokemonSprites {
  regular: string;
  shiny: string;
  gmax?: {
    regular: string;
    shiny: string;
  };
}

export interface PokemonName {
  fr: string;
  en: string;
  jp: string;
}

export interface PokemonType {
  name: string;
  image: string;
}

export interface PokemonStats {
  hp: number;
  atk: number;
  def: number;
  spe_atk: number;
  spe_def: number;
  vit: number;
}

export interface PokemonResistance {
  name: string;
  multiplier: number;
}

export interface PokemonEvolution {
  pre?: {
    pokedex_id: number;
    name: string;
    condition: string;
  }[];
  next?: {
    pokedex_id: number;
    name: string;
    condition: string;
  }[];
  mega?: {
    orbe: string;
    sprites: PokemonSprites;
  }[];
}

export interface Pokemon {
  pokedex_id: number;
  generation: number;
  category: string;
  name: PokemonName;
  sprites: PokemonSprites;
  types: PokemonType[];
  talents: {
    name: string;
    tc: boolean;
  }[];
  stats: PokemonStats;
  resistances: PokemonResistance[];
  apiTypes: PokemonType[];
  apiGeneration: number;
  apiResistances: PokemonResistance[];
  resistanceModifyingAbilitiesForApi: any[];
  apiEvolutions: PokemonEvolution[];
  apiPreEvolution: any[];
  apiResistancesWithAbilities: PokemonResistance[];
  evolution?: PokemonEvolution;
  height: string;
  weight: string;
  egg_groups: string[];
  sexe: {
    male: number;
    female: number;
  };
  catch_rate: number;
  level_100: number;
  forme: number;
}

export interface PokemonListResponse {
  results: Pokemon[];
}

// Types pour les filtres et recherche
export interface PokemonFilters {
  type?: string;
  generation?: number;
  searchTerm?: string;
}

// Types pour les états de l'application
export interface PokemonState {
  pokemons: Pokemon[];
  favorites: number[];
  loading: boolean;
  error: string | null;
}

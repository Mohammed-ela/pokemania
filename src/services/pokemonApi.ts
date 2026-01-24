import axios from 'axios';
import { Pokemon } from '../types/pokemon';

// Configuration de l'API Tyradex
const API_BASE_URL = 'https://tyradex.app/api/v1';

// Instance axios avec configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'Pokemania-App/1.0.0', // Header de politesse
  },
});

// Intercepteur pour gérer les erreurs
apiClient.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export class PokemonAPI {
  /**
   * Récupère la liste complète des Pokémon
   */
  static async getAllPokemon(): Promise<Pokemon[]> {
    try {
      const response = await apiClient.get<Pokemon[]>('/pokemon');
      return response.data;
    } catch (error) {
      throw new Error('Impossible de charger la liste des Pokémon');
    }
  }

  /**
   * Récupère les détails d'un Pokémon spécifique
   * @param id - L'identifiant du Pokémon
   * @param region - La région (optionnel)
   */
  static async getPokemonById(id: number, region?: string): Promise<Pokemon> {
    try {
      const url = region ? `/pokemon/${id}/${region}` : `/pokemon/${id}`;
      const response = await apiClient.get<Pokemon>(url);
      return response.data;
    } catch (error) {
      throw new Error(`Impossible de charger les détails du Pokémon ${id}`);
    }
  }

  /**
   * Recherche des Pokémon par nom
   * @param query - Le terme de recherche
   * @param allPokemon - La liste complète des Pokémon pour la recherche locale
   */
  static searchPokemon(query: string, allPokemon: Pokemon[]): Pokemon[] {
    if (!query.trim() || !allPokemon) return allPokemon || [];

    const searchTerm = query.toLowerCase().trim();
    
    return allPokemon.filter(pokemon => {
      if (!pokemon) return false;
      
      const frName = pokemon.name?.fr?.toLowerCase() || '';
      const enName = pokemon.name?.en?.toLowerCase() || '';
      const pokemonId = pokemon.pokedex_id?.toString() || '';
      
      return frName.includes(searchTerm) ||
             enName.includes(searchTerm) ||
             pokemonId.includes(searchTerm);
    });
  }

  /**
   * Filtre les Pokémon par type
   * @param type - Le type à filtrer
   * @param allPokemon - La liste complète des Pokémon
   */
  static filterByType(type: string, allPokemon: Pokemon[]): Pokemon[] {
    if (!type || !allPokemon) return allPokemon || [];

    return allPokemon.filter(pokemon => {
      if (!pokemon.types || !Array.isArray(pokemon.types)) return false;
      
      return pokemon.types.some(pokemonType => 
        pokemonType && pokemonType.name && 
        pokemonType.name.toLowerCase() === type.toLowerCase()
      );
    });
  }

  /**
   * Filtre les Pokémon par génération
   * @param generation - La génération à filtrer
   * @param allPokemon - La liste complète des Pokémon
   */
  static filterByGeneration(generation: number, allPokemon: Pokemon[]): Pokemon[] {
    if (!generation || !allPokemon) return allPokemon || [];

    return allPokemon.filter(pokemon => 
      pokemon && pokemon.generation === generation
    );
  }

  /**
   * Applique plusieurs filtres en même temps
   * @param filters - Les filtres à appliquer
   * @param allPokemon - La liste complète des Pokémon
   */
  static applyFilters(
    filters: {
      searchTerm?: string;
      type?: string;
      generation?: number;
    },
    allPokemon: Pokemon[]
  ): Pokemon[] {
    let result = allPokemon || [];

    if (filters.searchTerm) {
      result = this.searchPokemon(filters.searchTerm, result);
    }

    if (filters.type) {
      result = this.filterByType(filters.type, result);
    }

    if (filters.generation) {
      result = this.filterByGeneration(filters.generation, result);
    }

    return result;
  }

  /**
   * Récupère les types uniques de tous les Pokémon
   * @param allPokemon - La liste complète des Pokémon
   */
  static getUniqueTypes(allPokemon: Pokemon[]): string[] {
    const types = new Set<string>();
    
    allPokemon?.forEach(pokemon => {
      pokemon.types?.forEach(type => {
        types.add(type.name);
      });
    });

    return Array.from(types).sort();
  }

  /**
   * Récupère les générations uniques de tous les Pokémon
   * @param allPokemon - La liste complète des Pokémon
   */
  static getUniqueGenerations(allPokemon: Pokemon[]): number[] {
    const generations = new Set<number>();
    
    allPokemon?.forEach(pokemon => {
      generations.add(pokemon.generation);
    });

    return Array.from(generations).sort((a, b) => a - b);
  }
}

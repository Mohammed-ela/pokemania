import AsyncStorage from '@react-native-async-storage/async-storage';
import { Pokemon } from '../types/pokemon';

const FAVORITES_KEY = 'pokemon_favorites';

// Service de stockage AsyncStorage (compatible Expo Web + Mobile)
const storage = {
  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      throw error;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      throw error;
    }
  }
};

export class FavoritesService {
  /**
   * Récupère la liste des Pokémon favoris
   */
  static async getFavorites(): Promise<Pokemon[]> {
    try {
      const favoritesJson = await storage.getItem(FAVORITES_KEY);

      if (!favoritesJson) {
        return [];
      }

      const favorites = JSON.parse(favoritesJson);
      return Array.isArray(favorites) ? favorites : [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Sauvegarde la liste des Pokémon favoris
   */
  static async saveFavorites(favorites: Pokemon[]): Promise<void> {
    try {
      await storage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch (error) {
      throw new Error('Impossible de sauvegarder les favoris');
    }
  }

  /**
   * Ajoute un Pokémon aux favoris
   */
  static async addToFavorites(pokemon: Pokemon): Promise<void> {
    try {
      const favorites = await this.getFavorites();

      // Vérifier si le Pokémon n'est pas déjà dans les favoris
      const isAlreadyFavorite = favorites.some(fav => fav.pokedex_id === pokemon.pokedex_id);

      if (!isAlreadyFavorite) {
        favorites.push(pokemon);
        await this.saveFavorites(favorites);
      }
    } catch (error) {
      throw new Error('Impossible d\'ajouter aux favoris');
    }
  }

  /**
   * Retire un Pokémon des favoris
   */
  static async removeFromFavorites(pokemonId: number): Promise<void> {
    try {
      const favorites = await this.getFavorites();
      const updatedFavorites = favorites.filter(fav => fav.pokedex_id !== pokemonId);
      await this.saveFavorites(updatedFavorites);
    } catch (error) {
      throw new Error('Impossible de retirer des favoris');
    }
  }

  /**
   * Vérifie si un Pokémon est dans les favoris
   */
  static async isFavorite(pokemonId: number): Promise<boolean> {
    try {
      const favorites = await this.getFavorites();
      return favorites.some(fav => fav.pokedex_id === pokemonId);
    } catch (error) {
      return false;
    }
  }

  /**
   * Alterne l'état favori d'un Pokémon
   */
  static async toggleFavorite(pokemon: Pokemon): Promise<boolean> {
    try {
      const isFav = await this.isFavorite(pokemon.pokedex_id);

      if (isFav) {
        await this.removeFromFavorites(pokemon.pokedex_id);
        return false;
      } else {
        await this.addToFavorites(pokemon);
        return true;
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Vide tous les favoris
   */
  static async clearFavorites(): Promise<void> {
    try {
      await storage.removeItem(FAVORITES_KEY);
    } catch (error) {
      throw new Error('Impossible de vider les favoris');
    }
  }
}

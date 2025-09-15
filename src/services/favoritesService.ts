import { Pokemon } from '../types/pokemon';

const FAVORITES_KEY = 'pokemon_favorites';

// Service de stockage unifié (localStorage pour Web, AsyncStorage pour mobile plus tard)
const storage = {
  async getItem(key: string): Promise<string | null> {
    try {
      // Pour React Native Web, utilise localStorage
      if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem(key);
      }
      // Pour React Native mobile (futur)
      // return await AsyncStorage.getItem(key);
      return null;
    } catch {
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      // Pour React Native Web, utilise localStorage
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(key, value);
        return;
      }
      // Pour React Native mobile (futur)
      // await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Erreur de stockage:', error);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      // Pour React Native Web, utilise localStorage
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(key);
        return;
      }
      // Pour React Native mobile (futur)
      // await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Erreur de suppression:', error);
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
      if (!favoritesJson) return [];
      
      const favorites = JSON.parse(favoritesJson);
      return Array.isArray(favorites) ? favorites : [];
    } catch (error) {
      console.error('Erreur lors de la récupération des favoris:', error);
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
      console.error('Erreur lors de la sauvegarde des favoris:', error);
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
      console.error('Erreur lors de l\'ajout aux favoris:', error);
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
      console.error('Erreur lors de la suppression des favoris:', error);
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
      console.error('Erreur lors de la vérification des favoris:', error);
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
      console.error('Erreur lors du basculement des favoris:', error);
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
      console.error('Erreur lors de la suppression de tous les favoris:', error);
      throw new Error('Impossible de vider les favoris');
    }
  }
}

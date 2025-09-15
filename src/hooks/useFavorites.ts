import { useState, useEffect, useCallback } from 'react';
import { FavoritesService } from '../services/favoritesService';
import { Pokemon } from '../types/pokemon';

/**
 * Hook pour gérer les Pokémon favoris
 */
export const useFavorites = () => {
  const [favorites, setFavorites] = useState<Pokemon[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Charger les favoris au montage du composant
  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const loadFavorites = useCallback(async () => {
    try {
      setIsLoading(true);
      const favs = await FavoritesService.getFavorites();
      setFavorites(favs);
    } catch (error) {
      console.error('Erreur lors du chargement des favoris:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addToFavorites = useCallback(async (pokemon: Pokemon) => {
    try {
      await FavoritesService.addToFavorites(pokemon);
      setFavorites(prev => {
        const isAlreadyFavorite = prev.some(fav => fav.pokedex_id === pokemon.pokedex_id);
        if (!isAlreadyFavorite) {
          return [...prev, pokemon];
        }
        return prev;
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout aux favoris:', error);
      throw error;
    }
  }, []);

  const removeFromFavorites = useCallback(async (pokemonId: number) => {
    try {
      await FavoritesService.removeFromFavorites(pokemonId);
      setFavorites(prev => prev.filter(fav => fav.pokedex_id !== pokemonId));
    } catch (error) {
      console.error('Erreur lors de la suppression des favoris:', error);
      throw error;
    }
  }, []);

  const toggleFavorite = useCallback(async (pokemon: Pokemon) => {
    try {
      const isFav = favorites.some(fav => fav.pokedex_id === pokemon.pokedex_id);
      
      if (isFav) {
        await removeFromFavorites(pokemon.pokedex_id);
        return false;
      } else {
        await addToFavorites(pokemon);
        return true;
      }
    } catch (error) {
      console.error('Erreur lors du basculement des favoris:', error);
      throw error;
    }
  }, [favorites, addToFavorites, removeFromFavorites]);

  const isFavorite = useCallback((pokemonId: number) => {
    return favorites.some(fav => fav.pokedex_id === pokemonId);
  }, [favorites]);

  const clearAllFavorites = useCallback(async () => {
    try {
      await FavoritesService.clearFavorites();
      setFavorites([]);
    } catch (error) {
      console.error('Erreur lors de la suppression de tous les favoris:', error);
      throw error;
    }
  }, []);

  return {
    favorites,
    isLoading,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    clearAllFavorites,
    refetch: loadFavorites,
  };
};

/**
 * Hook pour vérifier si un Pokémon spécifique est favori
 */
export const useIsFavorite = (pokemonId: number) => {
  const [isFav, setIsFav] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkFavoriteStatus();
  }, [pokemonId]);

  const checkFavoriteStatus = async () => {
    try {
      setIsLoading(true);
      const result = await FavoritesService.isFavorite(pokemonId);
      setIsFav(result);
    } catch (error) {
      console.error('Erreur lors de la vérification des favoris:', error);
      setIsFav(false);
    } finally {
      setIsLoading(false);
    }
  };

  const toggle = async (pokemon: Pokemon) => {
    try {
      const newStatus = await FavoritesService.toggleFavorite(pokemon);
      setIsFav(newStatus);
      return newStatus;
    } catch (error) {
      console.error('Erreur lors du basculement:', error);
      throw error;
    }
  };

  return {
    isFavorite: isFav,
    isLoading,
    toggleFavorite: toggle,
    refetch: checkFavoriteStatus,
  };
};

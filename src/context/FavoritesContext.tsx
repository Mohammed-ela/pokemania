import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FavoritesContextType {
  favoriteIds: number[];
  isLoading: boolean;
  isFavorite: (pokemonId: number) => boolean;
  toggleFavorite: (pokemonId: number) => void;
  clearFavorites: () => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const FAVORITES_STORAGE_KEY = 'pokemon_favorites';

// Les anciennes versions stockaient les objets Pokémon complets : on ne garde que les numéros
const parseStoredFavorites = (json: string | null): number[] => {
  if (!json) return [];
  const parsed = JSON.parse(json);
  if (!Array.isArray(parsed)) return [];

  const ids = parsed
    .map((item) => (typeof item === 'number' ? item : item?.pokedex_id))
    .filter((id): id is number => typeof id === 'number');

  return Array.from(new Set(ids));
};

const saveFavorites = (ids: number[]) => {
  AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(ids)).catch(() => {
    // Ignorer l'erreur de sauvegarde
  });
};

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const stored = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
        const ids = parseStoredFavorites(stored);
        setFavoriteIds(ids);
        // Réécrit au nouveau format si les données venaient d'une ancienne version
        if (stored && stored !== JSON.stringify(ids)) {
          saveFavorites(ids);
        }
      } catch (error) {
        // Favoris vides par défaut
      } finally {
        setIsLoading(false);
      }
    };
    loadFavorites();
  }, []);

  const toggleFavorite = useCallback((pokemonId: number) => {
    setFavoriteIds((prev) => {
      const next = prev.includes(pokemonId)
        ? prev.filter((id) => id !== pokemonId)
        : [...prev, pokemonId];
      saveFavorites(next);
      return next;
    });
  }, []);

  const clearFavorites = useCallback(() => {
    setFavoriteIds([]);
    AsyncStorage.removeItem(FAVORITES_STORAGE_KEY).catch(() => {});
  }, []);

  const isFavorite = useCallback(
    (pokemonId: number) => favoriteIds.includes(pokemonId),
    [favoriteIds]
  );

  const value = useMemo(
    () => ({ favoriteIds, isLoading, isFavorite, toggleFavorite, clearFavorites }),
    [favoriteIds, isLoading, isFavorite, toggleFavorite, clearFavorites]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
};

export const useFavorites = (): FavoritesContextType => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

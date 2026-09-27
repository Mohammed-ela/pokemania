import { useMemo } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { PokemonAPI } from '../services/pokemonApi';
import { MegaAPI } from '../services/megaApi';
import { Pokemon } from '../types/pokemon';

/**
 * Hook pour récupérer la liste complète des Pokémon
 */
export const useAllPokemon = () => {
  return useQuery({
    queryKey: ['pokemon', 'all'],
    queryFn: () => PokemonAPI.getAllPokemon(),
    staleTime: 1000 * 60 * 60, // 1 heure
    gcTime: 1000 * 60 * 60 * 24, // 24 heures (anciennement cacheTime)
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

/**
 * Hook pour récupérer les détails d'un Pokémon spécifique
 */
export const usePokemonById = (id: number, region?: string) => {
  return useQuery({
    queryKey: ['pokemon', 'detail', id, region],
    queryFn: () => PokemonAPI.getPokemonById(id, region),
    enabled: !!id,
    placeholderData: keepPreviousData, // Évite un écran vide en changeant de forme régionale
    staleTime: 1000 * 60 * 60, // 1 heure
    gcTime: 1000 * 60 * 60 * 24, // 24 heures
    retry: 3,
  });
};

/**
 * Hook pour récupérer les stats, types et talents des Méga-évolutions (PokéAPI)
 */
export const useMegaForms = (pokedexId: number, enabled: boolean) => {
  return useQuery({
    queryKey: ['pokemon', 'mega', pokedexId],
    queryFn: () => MegaAPI.getMegaForms(pokedexId),
    enabled: enabled && pokedexId > 0,
    staleTime: 1000 * 60 * 60 * 24 * 7, // Données de jeu figées : 7 jours
    gcTime: 1000 * 60 * 60 * 24 * 7,
    retry: 1,
  });
};

/**
 * Hook pour rechercher et filtrer les Pokémon
 */
export const useFilteredPokemon = (
  allPokemon: Pokemon[] | undefined,
  filters: {
    searchTerm?: string;
    type?: string;
    generation?: number;
  }
) => {
  return useMemo(() => {
    if (!allPokemon) return [];
    return PokemonAPI.applyFilters(filters, allPokemon);
  }, [allPokemon, filters.searchTerm, filters.type, filters.generation]);
};

/**
 * Hook pour obtenir les types uniques
 */
export const usePokemonTypes = (allPokemon: Pokemon[] | undefined) => {
  if (!allPokemon || allPokemon.length === 0) return [];
  
  return PokemonAPI.getUniqueTypes(allPokemon);
};

/**
 * Hook pour obtenir les générations uniques
 */
export const usePokemonGenerations = (allPokemon: Pokemon[] | undefined) => {
  if (!allPokemon || allPokemon.length === 0) return [];
  
  return PokemonAPI.getUniqueGenerations(allPokemon);
};

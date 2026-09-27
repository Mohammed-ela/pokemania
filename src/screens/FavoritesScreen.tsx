import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FavoritesScreenProps } from '../types/navigation';
import { useTheme } from '../context/ThemeContext';
import { Pokemon } from '../types/pokemon';
import { useFavorites } from '../context/FavoritesContext';
import { useAllPokemon } from '../hooks/usePokemon';
import PokemonCard from '../components/PokemonCard';

// Hauteur estimée d'une carte pour optimiser le scroll
const ITEM_HEIGHT = 180;

const FavoritesScreen: React.FC<FavoritesScreenProps> = ({ navigation }) => {
  const { favoriteIds, isLoading: isLoadingFavorites, clearFavorites } = useFavorites();
  const { data: allPokemon, isLoading: isLoadingPokemon } = useAllPokemon();
  const { colors } = useTheme();
  const isLoading = isLoadingFavorites || (favoriteIds.length > 0 && isLoadingPokemon);

  // Données toujours à jour : on retrouve les favoris dans la liste complète, dans l'ordre d'ajout
  const favorites = useMemo(() => {
    if (!allPokemon) return [];
    const byId = new Map(allPokemon.map((pokemon) => [pokemon.pokedex_id, pokemon]));
    return favoriteIds
      .map((id) => byId.get(id))
      .filter((pokemon): pokemon is Pokemon => pokemon !== undefined);
  }, [allPokemon, favoriteIds]);

  // Callback memoizé pour la navigation
  const handlePokemonPress = useCallback(
    (pokemon: Pokemon) => {
      navigation.navigate('PokemonDetail', {
        pokemonId: pokemon.pokedex_id,
        pokemon: pokemon,
      });
    },
    [navigation]
  );

  // Render item avec le composant memoizé
  const renderPokemonItem = useCallback(
    ({ item }: { item: Pokemon }) => (
      <PokemonCard pokemon={item} onPress={handlePokemonPress} />
    ),
    [handlePokemonPress]
  );

  // Optimisation FlatList : extraction de clé
  const keyExtractor = useCallback(
    (item: Pokemon) => item.pokedex_id.toString(),
    []
  );

  // Optimisation FlatList : calcul de layout
  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * Math.floor(index / 2),
      index,
    }),
    []
  );

  const handleClearAll = useCallback(() => {
    clearFavorites();
  }, [clearFavorites]);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Chargement des favoris...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (favoriteIds.length > 0 && !allPokemon) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
        <View style={styles.centerContainer}>
          <Text style={styles.emoji}>📡</Text>
          <Text style={[styles.title, { color: colors.text }]}>Favoris indisponibles</Text>
          <Text style={[styles.description, { color: colors.textMuted }]}>
            Vérifiez votre connexion internet pour charger vos Pokémon favoris.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (favorites.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
        <View style={styles.centerContainer}>
          <Text style={styles.emoji}>⭐</Text>
          <Text style={[styles.title, { color: colors.text }]}>Aucun favori</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Vous n'avez pas encore de Pokémon favoris
          </Text>
          <Text style={[styles.description, { color: colors.textMuted }]}>
            Ajoutez des Pokémon à vos favoris en cliquant sur l'étoile dans leur
            fiche détaillée.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      {/* En-tête */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {favorites.length} Pokémon favori{favorites.length > 1 ? 's' : ''}
        </Text>
        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClearAll}
          accessibilityLabel="Effacer tous les favoris"
          accessibilityRole="button"
        >
          <Text style={styles.clearButtonText}>Tout effacer</Text>
        </TouchableOpacity>
      </View>

      {/* Liste des favoris optimisée */}
      <FlatList
        data={favorites}
        renderItem={renderPokemonItem}
        keyExtractor={keyExtractor}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.row}
        // Optimisations de performance
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={10}
        getItemLayout={getItemLayout}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
    fontWeight: '600',
  },
  emoji: {
    fontSize: 72,
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 17,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: 0.2,
  },
  clearButton: {
    backgroundColor: '#FEE2E2',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  clearButtonText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  listContainer: {
    padding: 8,
  },
  row: {
    justifyContent: 'space-around',
  },
});

export default FavoritesScreen;

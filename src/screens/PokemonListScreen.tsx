import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PokemonListScreenProps } from '../types/navigation';
import { useTheme } from '../context/ThemeContext';
import { Pokemon } from '../types/pokemon';
import { useAllPokemon, useFilteredPokemon } from '../hooks/usePokemon';
import PokemonCard from '../components/PokemonCard';

// Hauteur estimée d'une carte pour optimiser le scroll
const ITEM_HEIGHT = 180;

const PokemonListScreen: React.FC<PokemonListScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: allPokemon, isLoading, error, refetch } = useAllPokemon();
  const { colors } = useTheme();

  // Filtrage des Pokémon basé sur la recherche
  const filteredPokemon = useFilteredPokemon(allPokemon, {
    searchTerm: searchQuery,
  });

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

  // Optimisation FlatList : calcul de layout (évite les mesures)
  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * Math.floor(index / 2),
      index,
    }),
    []
  );

  if (isLoading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Chargement des Pokémon...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <Text style={styles.errorText}>❌</Text>
        <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>
          Erreur lors du chargement des Pokémon
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => refetch()}
          accessibilityLabel="Réessayer le chargement"
          accessibilityRole="button"
        >
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      {/* Barre de recherche */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
        <View style={styles.searchInputWrapper}>
          <TextInput
            style={[styles.searchInput, { backgroundColor: colors.surfaceVariant, color: colors.text, borderColor: colors.border }]}
            placeholder="Rechercher un Pokémon..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.textMuted}
            accessibilityLabel="Rechercher un Pokémon"
            returnKeyType="search"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={[styles.clearButton, { backgroundColor: colors.textMuted }]}
              onPress={() => setSearchQuery('')}
              accessibilityLabel="Effacer la recherche"
            >
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Résultats */}
      <View style={[styles.resultsHeader, { backgroundColor: colors.surface }]}>
        <Text style={[styles.resultsText, { color: colors.textSecondary }]}>
          {filteredPokemon.length} Pokémon trouvé(s)
        </Text>
      </View>

      {/* Liste des Pokémon optimisée */}
      <FlatList
        data={filteredPokemon}
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
  errorText: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorMessage: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  searchContainer: {
    padding: 16,
  },
  searchInputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  clearButton: {
    position: 'absolute',
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  searchInput: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 18,
    paddingVertical: 14,
    paddingRight: 44,
    borderRadius: 12,
    fontSize: 16,
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    fontWeight: '500',
  },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  resultsText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  listContainer: {
    padding: 8,
  },
  row: {
    justifyContent: 'space-around',
  },
});

export default PokemonListScreen;

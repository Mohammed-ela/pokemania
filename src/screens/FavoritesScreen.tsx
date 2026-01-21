import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { FavoritesScreenProps } from '../types/navigation';
import { Pokemon } from '../types/pokemon';
import { useFavorites } from '../hooks/useFavorites';
import PokemonCard from '../components/PokemonCard';

// Hauteur estimée d'une carte pour optimiser le scroll
const ITEM_HEIGHT = 180;

const FavoritesScreen: React.FC<FavoritesScreenProps> = ({ navigation }) => {
  const { favorites, isLoading, clearAllFavorites } = useFavorites();

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
    clearAllFavorites();
  }, [clearAllFavorites]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#DC2626" />
          <Text style={styles.loadingText}>Chargement des favoris...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (favorites.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.emoji}>⭐</Text>
          <Text style={styles.title}>Aucun favori</Text>
          <Text style={styles.subtitle}>
            Vous n'avez pas encore de Pokémon favoris
          </Text>
          <Text style={styles.description}>
            Ajoutez des Pokémon à vos favoris en cliquant sur l'étoile dans leur
            fiche détaillée.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* En-tête */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
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
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
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

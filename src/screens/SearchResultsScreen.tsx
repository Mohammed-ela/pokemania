import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { SearchResultsScreenProps } from '../types/navigation';
import { Pokemon } from '../types/pokemon';
import { useAllPokemon, useFilteredPokemon } from '../hooks/usePokemon';

const SearchResultsScreen: React.FC<SearchResultsScreenProps> = ({ navigation, route }) => {
  const { filters } = route.params;
  const { data: allPokemon, isLoading, error } = useAllPokemon();

  // Appliquer les filtres reçus
  const filteredPokemon = useFilteredPokemon(allPokemon, filters);

  const renderPokemonItem = ({ item }: { item: Pokemon }) => (
    <TouchableOpacity
      style={styles.pokemonCard}
      onPress={() => navigation.navigate('PokemonDetail', { 
        pokemonId: item.pokedex_id,
        pokemon: item 
      })}
    >
      <View style={styles.pokemonImageContainer}>
        <Image
          source={{ uri: item.sprites.regular }}
          style={styles.pokemonImage}
          resizeMode="contain"
        />
      </View>
      
      <View style={styles.pokemonInfo}>
        <Text style={styles.pokemonNumber}>#{item.pokedex_id.toString().padStart(3, '0')}</Text>
        <Text style={styles.pokemonName}>{item.name.fr}</Text>
        <View style={styles.typesContainer}>
          {item.types?.map((type, index) => (
            <View
              key={index}
              style={[styles.typeTag, { backgroundColor: getTypeColor(type.name) }]}
            >
              <Text style={styles.typeText}>{type.name}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  const getFilterDescription = () => {
    const parts = [];
    if (filters.searchTerm) parts.push(`"${filters.searchTerm}"`);
    if (filters.type) parts.push(`Type: ${filters.type}`);
    if (filters.generation) parts.push(`Génération ${filters.generation}`);
    return parts.join(', ');
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#DC2626" />
        <Text style={styles.loadingText}>Chargement des résultats...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>❌</Text>
        <Text style={styles.errorMessage}>
          Erreur lors du chargement des résultats
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Retour à la recherche</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* En-tête avec filtres appliqués */}
      <View style={styles.filtersHeader}>
        <Text style={styles.filtersTitle}>Filtres appliqués :</Text>
        <Text style={styles.filtersDescription}>{getFilterDescription()}</Text>
      </View>

      {/* Résultats */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsText}>
          {filteredPokemon.length} résultat(s) trouvé(s)
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Modifier la recherche</Text>
        </TouchableOpacity>
      </View>

      {/* Liste des résultats */}
      {filteredPokemon.length > 0 ? (
        <FlatList
          data={filteredPokemon}
          renderItem={renderPokemonItem}
          keyExtractor={(item) => item.pokedex_id.toString()}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={styles.row}
        />
      ) : (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsEmoji}>🔍</Text>
          <Text style={styles.noResultsTitle}>Aucun résultat</Text>
          <Text style={styles.noResultsText}>
            Aucun Pokémon ne correspond aux critères sélectionnés.
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Modifier la recherche</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

// Fonction utilitaire pour les couleurs des types
const getTypeColor = (type: string): string => {
  const typeColors: { [key: string]: string } = {
    Normal: '#A8A878',
    Feu: '#F08030',
    Eau: '#6890F0',
    Électrik: '#F8D030',
    Plante: '#78C850',
    Glace: '#98D8D8',
    Combat: '#C03028',
    Poison: '#A040A0',
    Sol: '#E0C068',
    Vol: '#A890F0',
    Psy: '#F85888',
    Insecte: '#A8B820',
    Roche: '#B8A038',
    Spectre: '#705898',
    Dragon: '#7038F8',
    Ténèbres: '#705848',
    Acier: '#B8B8D0',
    Fée: '#EE99AC',
  };
  
  return typeColors[type] || '#68A090';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
  },
  retryButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  filtersHeader: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  filtersTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  filtersDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  resultsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  backButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  backButtonText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  listContainer: {
    padding: 8,
  },
  row: {
    justifyContent: 'space-around',
  },
  pokemonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    margin: 8,
    flex: 1,
    maxWidth: '45%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pokemonImageContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  pokemonImage: {
    width: 80,
    height: 80,
  },
  pokemonInfo: {
    alignItems: 'center',
  },
  pokemonNumber: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 4,
  },
  pokemonName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  typesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 4,
  },
  typeTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  noResultsEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  noResultsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  noResultsText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
});

export default SearchResultsScreen;

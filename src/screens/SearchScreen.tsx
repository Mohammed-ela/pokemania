import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { SearchScreenProps } from '../types/navigation';
import { useAllPokemon, useFilteredPokemon, usePokemonTypes, usePokemonGenerations } from '../hooks/usePokemon';

const SearchScreen: React.FC<SearchScreenProps> = ({ navigation }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string | undefined>();
  const [selectedGeneration, setSelectedGeneration] = useState<number | undefined>();

  const { data: allPokemon, isLoading } = useAllPokemon();
  const types = usePokemonTypes(allPokemon);
  const generations = usePokemonGenerations(allPokemon);

  const filteredPokemon = useFilteredPokemon(allPokemon, {
    searchTerm,
    type: selectedType,
    generation: selectedGeneration,
  });

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType(undefined);
    setSelectedGeneration(undefined);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Recherche par nom */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recherche par nom</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Nom du Pokémon..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholderTextColor="#94A3B8"
          />
        </View>

        {/* Filtre par type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Filtrer par type</Text>
          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={[
                styles.filterChip,
                !selectedType && styles.filterChipActive
              ]}
              onPress={() => setSelectedType(undefined)}
            >
              <Text style={[
                styles.filterChipText,
                !selectedType && styles.filterChipTextActive
              ]}>
                Tous
              </Text>
            </TouchableOpacity>
            
            {types?.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.filterChip,
                  selectedType === type && styles.filterChipActive
                ]}
                onPress={() => setSelectedType(selectedType === type ? undefined : type)}
              >
                <Text style={[
                  styles.filterChipText,
                  selectedType === type && styles.filterChipTextActive
                ]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Filtre par génération */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Filtrer par génération</Text>
          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={[
                styles.filterChip,
                !selectedGeneration && styles.filterChipActive
              ]}
              onPress={() => setSelectedGeneration(undefined)}
            >
              <Text style={[
                styles.filterChipText,
                !selectedGeneration && styles.filterChipTextActive
              ]}>
                Toutes
              </Text>
            </TouchableOpacity>
            
            {generations?.map((generation) => (
              <TouchableOpacity
                key={generation}
                style={[
                  styles.filterChip,
                  selectedGeneration === generation && styles.filterChipActive
                ]}
                onPress={() => setSelectedGeneration(
                  selectedGeneration === generation ? undefined : generation
                )}
              >
                <Text style={[
                  styles.filterChipText,
                  selectedGeneration === generation && styles.filterChipTextActive
                ]}>
                  Gen {generation}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Résultats */}
        <View style={styles.section}>
          <View style={styles.resultsHeader}>
            <Text style={styles.sectionTitle}>
              Résultats ({filteredPokemon.length})
            </Text>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearFilters}
            >
              <Text style={styles.clearButtonText}>Effacer filtres</Text>
            </TouchableOpacity>
          </View>

          {filteredPokemon.length > 0 ? (
            <TouchableOpacity
              style={styles.viewResultsButton}
              onPress={() => {
                // Naviguer vers l'écran de résultats avec les filtres appliqués
                navigation.navigate('SearchResults', {
                  filters: {
                    searchTerm,
                    type: selectedType,
                    generation: selectedGeneration,
                  }
                });
              }}
            >
              <Text style={styles.viewResultsButtonText}>
                Voir les {filteredPokemon.length} résultat(s)
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.noResultsText}>
              Aucun Pokémon ne correspond à vos critères
            </Text>
          )}
        </View>
      </ScrollView>
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
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginVertical: 6,
    paddingVertical: 22,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  searchInput: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 12,
    fontSize: 16,
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    fontWeight: '500',
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  filterChipText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  clearButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  clearButtonText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  viewResultsButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 18,
    paddingHorizontal: 28,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  viewResultsButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  noResultsText: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 20,
    fontWeight: '600',
  },
});

export default SearchScreen;

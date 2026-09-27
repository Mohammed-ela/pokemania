import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SearchResultsScreenProps } from '../types/navigation';
import { useTheme } from '../context/ThemeContext';
import { useAllPokemon, useFilteredPokemon } from '../hooks/usePokemon';
import PokemonGrid from '../components/PokemonGrid';

const SearchResultsScreen: React.FC<SearchResultsScreenProps> = ({
  navigation,
  route,
}) => {
  const { filters } = route.params;
  const { data: allPokemon, isLoading, error } = useAllPokemon();
  const { colors } = useTheme();

  // Appliquer les filtres reçus
  const filteredPokemon = useFilteredPokemon(allPokemon, filters);

  const getFilterDescription = useCallback(() => {
    const parts = [];
    if (filters.searchTerm) parts.push(`"${filters.searchTerm}"`);
    if (filters.type) parts.push(`Type: ${filters.type}`);
    if (filters.generation) parts.push(`Génération ${filters.generation}`);
    return parts.join(', ');
  }, [filters]);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  if (isLoading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Chargement des résultats...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <Text style={styles.errorText}>❌</Text>
        <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>
          Erreur lors du chargement des résultats
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={handleGoBack}
          accessibilityLabel="Retour à la recherche"
          accessibilityRole="button"
        >
          <Text style={styles.retryButtonText}>Retour à la recherche</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      {/* En-tête avec filtres appliqués */}
      <View style={[styles.filtersHeader, { backgroundColor: colors.surface }]}>
        <Text style={[styles.filtersTitle, { color: colors.textSecondary }]}>Filtres appliqués :</Text>
        <Text style={[styles.filtersDescription, { color: colors.textSecondary }]}>{getFilterDescription()}</Text>
      </View>

      {/* Résultats */}
      <View style={[styles.resultsHeader, { backgroundColor: colors.surface }]}>
        <Text style={[styles.resultsText, { color: colors.text }]}>
          {filteredPokemon.length} résultat(s) trouvé(s)
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}
          accessibilityLabel="Modifier la recherche"
          accessibilityRole="button"
        >
          <Text style={styles.backButtonText}>Modifier la recherche</Text>
        </TouchableOpacity>
      </View>

      {/* Liste des résultats optimisée */}
      {filteredPokemon.length > 0 ? (
        <PokemonGrid data={filteredPokemon} />
      ) : (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsEmoji}>🔍</Text>
          <Text style={[styles.noResultsTitle, { color: colors.text }]}>Aucun résultat</Text>
          <Text style={[styles.noResultsText, { color: colors.textSecondary }]}>
            Aucun Pokémon ne correspond aux critères sélectionnés.
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleGoBack}
            accessibilityLabel="Modifier la recherche"
            accessibilityRole="button"
          >
            <Text style={styles.backButtonText}>Modifier la recherche</Text>
          </TouchableOpacity>
        </View>
      )}
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
  filtersHeader: {
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  filtersTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#374151',
    marginBottom: 6,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  filtersDescription: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '600',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  resultsText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: 0.2,
  },
  backButton: {
    backgroundColor: '#DBEAFE',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#93C5FD',
  },
  backButtonText: {
    fontSize: 12,
    color: '#1E40AF',
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  noResultsEmoji: {
    fontSize: 72,
    marginBottom: 20,
  },
  noResultsTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 10,
  },
  noResultsText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 26,
    fontWeight: '600',
  },
});

export default SearchResultsScreen;

import React, { useState, useCallback, useMemo, useRef, useEffect, useDeferredValue } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PokemonListScreenProps } from '../types/navigation';
import { useTheme } from '../context/ThemeContext';
import { Pokemon, PokemonStats } from '../types/pokemon';
import { useAllPokemon } from '../hooks/usePokemon';
import PokemonCard from '../components/PokemonCard';

type SortKey = 'number' | 'name' | 'bst' | keyof PokemonStats;
type SortDirection = 'asc' | 'desc';

const SORT_OPTIONS: { key: SortKey; label: string; badge?: string }[] = [
  { key: 'number', label: 'N°' },
  { key: 'name', label: 'Nom' },
  { key: 'bst', label: 'Total', badge: 'Total' },
  { key: 'hp', label: 'PV', badge: 'PV' },
  { key: 'atk', label: 'Attaque', badge: 'Att' },
  { key: 'def', label: 'Défense', badge: 'Déf' },
  { key: 'spe_atk', label: 'Att. Spé', badge: 'Att.Spé' },
  { key: 'spe_def', label: 'Déf. Spé', badge: 'Déf.Spé' },
  { key: 'vit', label: 'Vitesse', badge: 'Vit' },
];

const isStatSort = (key: SortKey) => key !== 'number' && key !== 'name';

// Minuscules sans accents : "Électhor" -> "electhor"
const normalize = (text: string) =>
  text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

const getSortValue = (pokemon: Pokemon, key: SortKey): number => {
  const stats = pokemon.stats;
  if (key === 'bst') return stats.hp + stats.atk + stats.def + stats.spe_atk + stats.spe_def + stats.vit;
  return stats[key as keyof PokemonStats];
};

const PokemonListScreen: React.FC<PokemonListScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sort, setSort] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'number', direction: 'asc' });
  const listRef = useRef<FlatList<Pokemon>>(null);
  const { data: allPokemon, isLoading, error, refetch } = useAllPokemon();
  const { colors } = useTheme();

  // Saisie et boutons de tri réagissent tout de suite : la liste suit juste après, sans bloquer l'écran
  const deferredQuery = useDeferredValue(searchQuery);
  const deferredSort = useDeferredValue(sort);
  const isUpdating = searchQuery !== deferredQuery || sort !== deferredSort;
  const sortKey = deferredSort.key;
  const sortDirection = deferredSort.direction;

  // Textes de recherche et noms triables de chaque Pokémon, calculés une seule fois
  const { searchIndex, sortNames } = useMemo(() => {
    const search = new Map<number, string>();
    const names = new Map<number, string>();
    allPokemon?.forEach((p) => {
      search.set(p.pokedex_id, normalize(`${p.name?.fr ?? ''} ${p.name?.en ?? ''} ${p.pokedex_id}`));
      names.set(p.pokedex_id, normalize(p.name?.fr ?? ''));
    });
    return { searchIndex: search, sortNames: names };
  }, [allPokemon]);

  // Tri de la liste complète, seulement quand le tri change (pas à chaque lettre tapée).
  // Par stat, on exclut les Pokémon sans stats (MissingNo.)
  const sortedAll = useMemo(() => {
    if (!allPokemon) return [];
    const factor = sortDirection === 'asc' ? 1 : -1;
    const list = isStatSort(sortKey) ? allPokemon.filter((p) => p.stats) : [...allPokemon];
    return list.sort((a, b) => {
      let diff = 0;
      if (sortKey === 'number') diff = a.pokedex_id - b.pokedex_id;
      else if (sortKey === 'name') {
        // Comparaison simple de noms sans accents : bien plus rapide que localeCompare
        const nameA = sortNames.get(a.pokedex_id) ?? '';
        const nameB = sortNames.get(b.pokedex_id) ?? '';
        diff = nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
      }
      else diff = getSortValue(a, sortKey) - getSortValue(b, sortKey);
      // À égalité, ordre du Pokédex
      return diff !== 0 ? diff * factor : a.pokedex_id - b.pokedex_id;
    });
  }, [allPokemon, sortKey, sortDirection, sortNames]);

  // La recherche filtre la liste déjà triée : l'ordre est conservé
  const sortedPokemon = useMemo(() => {
    const term = normalize(deferredQuery);
    if (!term) return sortedAll;
    return sortedAll.filter((p) => searchIndex.get(p.pokedex_id)?.includes(term));
  }, [sortedAll, searchIndex, deferredQuery]);

  // Retour en haut de la liste à chaque changement de tri
  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [sortKey, sortDirection]);

  const handleSortPress = useCallback((key: SortKey) => {
    setSort((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : // Les stats se lisent du plus fort au plus faible
          { key, direction: isStatSort(key) ? 'desc' : 'asc' }
    );
  }, []);

  // Tri appliqué à la liste (différé) : sert aux badges et au compteur
  const activeSort = SORT_OPTIONS.find((option) => option.key === sortKey)!;

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
      <PokemonCard
        pokemon={item}
        onPress={handlePokemonPress}
        statLabel={activeSort.badge && item.stats ? activeSort.badge : undefined}
        statValue={activeSort.badge && item.stats ? getSortValue(item, sortKey) : undefined}
      />
    ),
    [handlePokemonPress, activeSort, sortKey]
  );

  // Optimisation FlatList : extraction de clé
  const keyExtractor = useCallback(
    (item: Pokemon) => item.pokedex_id.toString(),
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

      {/* Tri */}
      <View style={[styles.sortContainer, { backgroundColor: colors.surface }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sortChips}
          keyboardShouldPersistTaps="handled"
        >
          {SORT_OPTIONS.map((option) => {
            const isActive = option.key === sort.key;
            return (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.sortChip,
                  {
                    backgroundColor: isActive ? colors.primary : colors.surfaceVariant,
                    borderColor: isActive ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => handleSortPress(option.key)}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                accessibilityLabel={`Trier par ${option.label}${
                  isActive ? (sort.direction === 'desc' ? ', décroissant' : ', croissant') : ''
                }`}
              >
                <Text style={[styles.sortChipText, { color: isActive ? '#FFFFFF' : colors.text }]}>
                  {option.label}
                </Text>
                {isActive && (
                  <Ionicons
                    name={sort.direction === 'desc' ? 'arrow-down' : 'arrow-up'}
                    size={13}
                    color="#FFFFFF"
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Résultats */}
      <View style={[styles.resultsHeader, { backgroundColor: colors.surface }]}>
        {isUpdating && <ActivityIndicator size="small" color={colors.primary} style={styles.updatingIndicator} />}
        <Text style={[styles.resultsText, { color: colors.textSecondary }]}>
          {sortedPokemon.length} Pokémon
          {sortKey !== 'number' && (
            <Text style={{ color: colors.textMuted }}>
              {` · triés par ${activeSort.label.toLowerCase()} ${sortDirection === 'desc' ? '↓' : '↑'}`}
            </Text>
          )}
        </Text>
      </View>

      {/* Liste des Pokémon optimisée */}
      <FlatList
        ref={listRef}
        data={sortedPokemon}
        renderItem={renderPokemonItem}
        keyExtractor={keyExtractor}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.row}
        // Optimisations de performance
        removeClippedSubviews={true}
        maxToRenderPerBatch={12}
        updateCellsBatchingPeriod={50}
        windowSize={5}
        initialNumToRender={10}
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
  },
  sortContainer: {
    paddingBottom: 6,
  },
  sortChips: {
    paddingHorizontal: 16,
    gap: 8,
  },
  sortChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
  },
  sortChipText: {
    fontSize: 13,
    fontWeight: '700',
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  updatingIndicator: {
    marginRight: 8,
    transform: [{ scale: 0.8 }],
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

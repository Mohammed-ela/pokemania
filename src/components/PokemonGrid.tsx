import React, { useCallback } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Pokemon } from '../types/pokemon';
import PokemonCard from './PokemonCard';

interface PokemonGridProps {
  data: Pokemon[];
  listRef?: React.Ref<FlatList<Pokemon>>;
  // Stat affichée en badge sur chaque carte (liste triée par stat)
  statLabel?: string;
  getStatValue?: (pokemon: Pokemon) => number;
}

const keyExtractor = (item: Pokemon) => item.pokedex_id.toString();

// Grille de cartes Pokémon sur 2 colonnes, partagée par le Pokédex, les favoris et les résultats
const PokemonGrid: React.FC<PokemonGridProps> = ({ data, listRef, statLabel, getStatValue }) => {
  const navigation = useNavigation();

  const handlePokemonPress = useCallback(
    (pokemon: Pokemon) => {
      navigation.navigate('PokemonDetail', { pokemonId: pokemon.pokedex_id, pokemon });
    },
    [navigation]
  );

  const renderItem = useCallback(
    ({ item }: { item: Pokemon }) => {
      const showStat = statLabel !== undefined && getStatValue !== undefined && !!item.stats;
      return (
        <PokemonCard
          pokemon={item}
          onPress={handlePokemonPress}
          statLabel={showStat ? statLabel : undefined}
          statValue={showStat ? getStatValue(item) : undefined}
        />
      );
    },
    [handlePokemonPress, statLabel, getStatValue]
  );

  return (
    <FlatList
      ref={listRef}
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      numColumns={2}
      contentContainerStyle={styles.listContainer}
      columnWrapperStyle={styles.row}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      // Optimisations de performance
      removeClippedSubviews
      maxToRenderPerBatch={12}
      updateCellsBatchingPeriod={50}
      windowSize={5}
      initialNumToRender={10}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 8,
  },
  row: {
    justifyContent: 'space-around',
  },
});

export default PokemonGrid;

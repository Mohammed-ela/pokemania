import React, { memo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Pokemon } from '../types/pokemon';
import { getTypeColor } from '../utils/typeColors';

// Placeholder pour le chargement des images
const blurhash = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4';

interface PokemonCardProps {
  pokemon: Pokemon;
  onPress: (pokemon: Pokemon) => void;
}

const PokemonCard: React.FC<PokemonCardProps> = ({ pokemon, onPress }) => {
  const handlePress = useCallback(() => {
    onPress(pokemon);
  }, [pokemon, onPress]);

  return (
    <TouchableOpacity
      style={styles.pokemonCard}
      onPress={handlePress}
      activeOpacity={0.7}
      accessibilityLabel={`${pokemon.name.fr}, numéro ${pokemon.pokedex_id}`}
      accessibilityRole="button"
    >
      <View style={styles.pokemonImageContainer}>
        <Image
          source={{ uri: pokemon.sprites.regular }}
          style={styles.pokemonImage}
          contentFit="contain"
          placeholder={{ blurhash }}
          transition={200}
          cachePolicy="memory-disk"
        />
      </View>

      <View style={styles.pokemonInfo}>
        <Text style={styles.pokemonNumber}>
          #{pokemon.pokedex_id.toString().padStart(3, '0')}
        </Text>
        <Text style={styles.pokemonName} numberOfLines={1}>
          {pokemon.name.fr}
        </Text>
        <View style={styles.typesContainer}>
          {pokemon.types?.map((type, index) => (
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
};

const styles = StyleSheet.create({
  pokemonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    margin: 8,
    flex: 1,
    maxWidth: '45%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  pokemonImageContainer: {
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 8,
  },
  pokemonImage: {
    width: 80,
    height: 80,
  },
  pokemonInfo: {
    alignItems: 'center',
  },
  pokemonNumber: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 4,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  pokemonName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  typesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 4,
  },
  typeTag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  typeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

// React.memo avec comparaison personnalisée pour éviter les re-renders inutiles
export default memo(PokemonCard, (prevProps, nextProps) => {
  return prevProps.pokemon.pokedex_id === nextProps.pokemon.pokedex_id;
});

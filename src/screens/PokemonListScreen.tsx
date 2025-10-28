import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  TextInput,
  SafeAreaView,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useQueryClient } from '@tanstack/react-query';
import { PokemonListScreenProps } from '../types/navigation';
import { Pokemon } from '../types/pokemon';
import { useAllPokemon, useFilteredPokemon } from '../hooks/usePokemon';

const { width } = Dimensions.get('window');

// Composant séparé pour les éléments de la liste avec animations
const PokemonListItem: React.FC<{
  item: Pokemon;
  index: number;
  onPress: (pokemon: Pokemon) => void;
}> = React.memo(({ item, index, onPress }) => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;
  
  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 300,
      delay: index * 50,
      useNativeDriver: true,
    }).start();
  }, [index, animatedValue]);

  return (
    <Animated.View
      style={{
        opacity: animatedValue,
        transform: [
          {
            translateY: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0],
            }),
          },
        ],
      }}
    >
      <TouchableOpacity
        style={styles.pokemonCard}
        onPress={() => onPress(item)}
        activeOpacity={0.8}
      >
        <View style={styles.cardContainer}>
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
              {item.types?.map((type, typeIndex) => (
                <View
                  key={typeIndex}
                  style={[styles.typeTag, { backgroundColor: getTypeColor(type.name) }]}
                >
                  <Text style={styles.typeText}>{type.name}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

const PokemonListScreen: React.FC<PokemonListScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();
  const { data: allPokemon, isLoading, error, refetch } = useAllPokemon();

  // Filtrage des Pokémon basé sur la recherche
  const filteredPokemon = useFilteredPokemon(allPokemon, {
    searchTerm: searchQuery,
  });

  const handlePokemonPress = async (pokemon: Pokemon) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('PokemonDetail', { 
      pokemonId: pokemon.pokedex_id,
      pokemon: pokemon 
    });
  };

  const renderPokemonItem = ({ item, index }: { item: Pokemon; index: number }) => {
    return (
      <PokemonListItem
        item={item}
        index={index}
        onPress={handlePokemonPress}
      />
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#DC2626" />
        <Text style={styles.loadingText}>Chargement des Pokémon...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>❌</Text>
        <Text style={styles.errorMessage}>
          Erreur lors du chargement des Pokémon
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => refetch()}
        >
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.background}>
        {/* Barre de recherche */}
        <View style={styles.searchContainer}>
          <BlurView intensity={20} style={styles.searchBlur}>
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher un Pokémon..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="rgba(255, 255, 255, 0.7)"
            />
          </BlurView>
        </View>

        {/* Résultats */}
        <View style={styles.resultsHeader}>
          <BlurView intensity={10} style={styles.resultsBlur}>
            <Text style={styles.resultsText}>
              {filteredPokemon.length} Pokémon trouvé(s)
            </Text>
          </BlurView>
        </View>

        {/* Liste des Pokémon */}
        <FlatList
          data={filteredPokemon}
          renderItem={renderPokemonItem}
          keyExtractor={(item) => item.pokedex_id.toString()}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={styles.row}
        />
      </View>
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
    backgroundColor: '#FFFFFF',
  },
  background: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  searchContainer: {
    padding: 16,
  },
  searchBlur: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '500',
  },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resultsBlur: {
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
  },
  resultsText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
    textAlign: 'center',
  },
  listContainer: {
    padding: 8,
  },
  row: {
    justifyContent: 'space-around',
  },
  pokemonCard: {
    borderRadius: 16,
    margin: 8,
    flex: 1,
    maxWidth: '45%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
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
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 4,
    fontWeight: '600',
  },
  pokemonName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  typesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
  },
  typeTag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  typeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default PokemonListScreen;

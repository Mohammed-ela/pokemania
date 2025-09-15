import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { FavoritesScreenProps } from '../types/navigation';
import { Pokemon } from '../types/pokemon';
import { useFavorites } from '../hooks/useFavorites';

const FavoritesScreen: React.FC<FavoritesScreenProps> = ({ navigation }) => {
  const { favorites, isLoading, clearAllFavorites, refetch } = useFavorites();

  // Debug simple
  useEffect(() => {
    console.log('📋 Favorites changed:', favorites.length);
  }, [favorites]);

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

  const handleClearAll = () => {
    clearAllFavorites();
  };

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
            Ajoutez des Pokémon à vos favoris en cliquant sur l'étoile dans leur fiche détaillée.
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
        >
          <Text style={styles.clearButtonText}>Tout effacer</Text>
        </TouchableOpacity>
      </View>

      {/* Liste des favoris */}
      <FlatList
        data={favorites}
        renderItem={renderPokemonItem}
        keyExtractor={(item) => item.pokedex_id.toString()}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.row}
      />
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
  emoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
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
    fontWeight: '600',
    color: '#1F2937',
  },
  clearButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  clearButtonText: {
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
});

export default FavoritesScreen;

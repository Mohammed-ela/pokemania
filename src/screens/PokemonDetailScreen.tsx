import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { PokemonDetailScreenProps } from '../types/navigation';
import { usePokemonById } from '../hooks/usePokemon';

const { width } = Dimensions.get('window');

const PokemonDetailScreen: React.FC<PokemonDetailScreenProps> = ({ route }) => {
  const { pokemonId, pokemon: initialPokemon } = route.params;
  const [isShiny, setIsShiny] = useState(false);
  
  const { data: pokemon, isLoading, error } = usePokemonById(pokemonId);
  
  // Utilise les données de la route si disponibles, sinon utilise les données de l'API
  const displayPokemon = pokemon || initialPokemon;

  if (isLoading && !initialPokemon) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#DC2626" />
        <Text style={styles.loadingText}>Chargement des détails...</Text>
      </View>
    );
  }

  if (error && !initialPokemon) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>❌</Text>
        <Text style={styles.errorMessage}>
          Erreur lors du chargement des détails
        </Text>
      </View>
    );
  }

  if (!displayPokemon) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>❓</Text>
        <Text style={styles.errorMessage}>Pokémon non trouvé</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* En-tête avec image */}
        <View style={styles.header}>
          <View style={styles.imageContainer}>
            <Image
              source={{ 
                uri: isShiny ? displayPokemon.sprites.shiny : displayPokemon.sprites.regular 
              }}
              style={styles.pokemonImage}
              resizeMode="contain"
            />
            <TouchableOpacity
              style={styles.shinyButton}
              onPress={() => setIsShiny(!isShiny)}
            >
              <Text style={styles.shinyButtonText}>
                {isShiny ? '✨ Shiny' : '⭐ Normal'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.basicInfo}>
            <Text style={styles.pokemonNumber}>
              #{displayPokemon.pokedex_id.toString().padStart(3, '0')}
            </Text>
            <Text style={styles.pokemonName}>{displayPokemon.name.fr}</Text>
            <Text style={styles.pokemonNameEn}>({displayPokemon.name.en})</Text>
            <Text style={styles.category}>{displayPokemon.category}</Text>
          </View>
        </View>

        {/* Types */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Types</Text>
          <View style={styles.typesContainer}>
            {displayPokemon.types.map((type, index) => (
              <View
                key={index}
                style={[styles.typeTag, { backgroundColor: getTypeColor(type.name) }]}
              >
                <Text style={styles.typeText}>{type.name}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Statistiques */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistiques</Text>
          <View style={styles.statsContainer}>
            <StatBar label="PV" value={displayPokemon.stats.hp} maxValue={255} color="#FF5959" />
            <StatBar label="Attaque" value={displayPokemon.stats.atk} maxValue={255} color="#F5AC78" />
            <StatBar label="Défense" value={displayPokemon.stats.def} maxValue={255} color="#FAE078" />
            <StatBar label="Att. Spé" value={displayPokemon.stats.spe_atk} maxValue={255} color="#9DB7F5" />
            <StatBar label="Déf. Spé" value={displayPokemon.stats.spe_def} maxValue={255} color="#A7DB8D" />
            <StatBar label="Vitesse" value={displayPokemon.stats.vit} maxValue={255} color="#FA92B2" />
          </View>
        </View>

        {/* Informations physiques */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations physiques</Text>
          <View style={styles.physicalInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Taille:</Text>
              <Text style={styles.infoValue}>{displayPokemon.height}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Poids:</Text>
              <Text style={styles.infoValue}>{displayPokemon.weight}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Génération:</Text>
              <Text style={styles.infoValue}>{displayPokemon.generation}</Text>
            </View>
          </View>
        </View>

        {/* Talents */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Talents</Text>
          <View style={styles.talentsContainer}>
            {displayPokemon.talents.map((talent, index) => (
              <View key={index} style={styles.talentItem}>
                <Text style={styles.talentName}>{talent.name}</Text>
                {talent.tc && <Text style={styles.hiddenTalent}>(Talent Caché)</Text>}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Composant pour les barres de statistiques
const StatBar: React.FC<{
  label: string;
  value: number;
  maxValue: number;
  color: string;
}> = ({ label, value, maxValue, color }) => {
  const percentage = (value / maxValue) * 100;
  
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <View style={styles.statBarContainer}>
        <View
          style={[
            styles.statBar,
            { width: `${percentage}%`, backgroundColor: color }
          ]}
        />
      </View>
    </View>
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
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  pokemonImage: {
    width: 150,
    height: 150,
  },
  shinyButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 8,
  },
  shinyButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  basicInfo: {
    alignItems: 'center',
  },
  pokemonNumber: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 4,
  },
  pokemonName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  pokemonNameEn: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 8,
  },
  category: {
    fontSize: 14,
    color: '#64748B',
    fontStyle: 'italic',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginVertical: 4,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  typesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  typeText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  statsContainer: {
    gap: 12,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748B',
    width: 70,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    width: 30,
    textAlign: 'right',
  },
  statBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
  },
  statBar: {
    height: '100%',
    borderRadius: 4,
  },
  physicalInfo: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 16,
    color: '#64748B',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  talentsContainer: {
    gap: 8,
  },
  talentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  talentName: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '500',
  },
  hiddenTalent: {
    fontSize: 12,
    color: '#8B5CF6',
    fontStyle: 'italic',
  },
});

export default PokemonDetailScreen;

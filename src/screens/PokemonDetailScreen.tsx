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
import { useFavorites } from '../hooks/useFavorites';

const { width } = Dimensions.get('window');

const PokemonDetailScreen: React.FC<PokemonDetailScreenProps> = ({ route }) => {
  const { pokemonId, pokemon: initialPokemon } = route.params;
  const [isShiny, setIsShiny] = useState(false);
  
  const { data: pokemon, isLoading, error } = usePokemonById(pokemonId);
  const { favorites, toggleFavorite: toggleFav } = useFavorites();
  
  // Calculer si c'est un favori à partir de la liste complète
  const isFavorite = favorites.some(fav => fav.pokedex_id === pokemonId);
  const favoriteLoading = false;
  
  // Utilise les données de la route si disponibles, sinon utilise les données de l'API
  const displayPokemon = pokemon || initialPokemon;

  const handleFavoritePress = async () => {
    if (!displayPokemon) return;
    
    try {
      console.log('⭐ Toggle favorite for:', displayPokemon.name.fr);
      await toggleFav(displayPokemon);
      // Pas de pop-up, juste le changement visuel de l'étoile
    } catch (error) {
      // Optionnel : un simple log en cas d'erreur
      console.error('Erreur lors de la modification des favoris:', error);
    }
  };

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

  // Gestion spéciale pour le Pokémon #0 (MissingNo.)
  if (displayPokemon.pokedex_id === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* En-tête spécial pour MissingNo. */}
          <View style={styles.header}>
            <View style={styles.imageContainer}>
              <Text style={styles.missingNoEmoji}>👾</Text>
              <Text style={styles.missingNoTitle}>MissingNo.</Text>
            </View>
            
            <View style={styles.basicInfo}>
              <Text style={styles.pokemonNumber}>#000</Text>
              <Text style={styles.pokemonName}>MissingNo.</Text>
              <Text style={styles.pokemonNameEn}>(Missing Number)</Text>
              <Text style={styles.category}>Pokémon Glitch</Text>
            </View>
          </View>

          {/* Anecdote historique */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎮 Anecdote Légendaire</Text>
            <View style={styles.anecdoteContainer}>
              <Text style={styles.anecdoteText}>
                <Text style={styles.anecdoteBold}>MissingNo.</Text> est l'un des bugs les plus célèbres de l'histoire du jeu vidéo ! 
                Découvert dans Pokémon Rouge et Bleu, ce "Pokémon fantôme" apparaissait lors du fameux glitch de Cramois'Île.
              </Text>
              
              <Text style={styles.anecdoteText}>
                💡 <Text style={styles.anecdoteBold}>Le glitch :</Text> Parler au vieil homme de Viridian qui enseigne à capturer un Pokémon, 
                puis voler immédiatement vers Cramois'Île et surfer sur la côte Est.
              </Text>
              
              <Text style={styles.anecdoteText}>
                ✨ <Text style={styles.anecdoteBold}>Effet magique :</Text> Capturer MissingNo. dupliquait le 6ème objet de votre sac ! 
                Les dresseurs l'utilisaient pour obtenir 99 Master Balls ou 99 Bonbons Rares.
              </Text>
              
              <Text style={styles.anecdoteText}>
                🏆 <Text style={styles.anecdoteBold}>Impact :</Text> Ce bug est devenu si iconique qu'il fait maintenant partie de la culture Pokémon. 
                Il représente l'âge d'or des secrets cachés dans les jeux vidéo !
              </Text>
            </View>
          </View>

          {/* Données techniques */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 Données Techniques</Text>
            <View style={styles.technicalInfo}>
              <Text style={styles.technicalText}>Type : Normal/Oiseau (Type 20)</Text>
              <Text style={styles.technicalText}>Niveau : Variable (souvent 80+)</Text>
              <Text style={styles.technicalText}>Attaque : Variable</Text>
              <Text style={styles.technicalText}>Index Hexadécimal : 0x00</Text>
            </View>
          </View>

          {/* Note de sécurité */}
          <View style={styles.warningSection}>
            <Text style={styles.warningTitle}>⚠️ Note Historique</Text>
            <Text style={styles.warningText}>
              Dans les jeux originaux, MissingNo. pouvait parfois corrompre les données de sauvegarde. 
              Heureusement, dans Pokemania, vous pouvez l'admirer en toute sécurité ! 😄
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* En-tête avec image */}
        <View style={styles.header}>
          {/* Bouton favori en haut à droite */}
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={handleFavoritePress}
            disabled={favoriteLoading}
          >
            <Text style={styles.favoriteIcon}>
              {isFavorite ? '⭐' : '☆'}
            </Text>
          </TouchableOpacity>

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
                {isShiny ? '✨ Shiny' : '⭐ Shiny'}
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
            {displayPokemon.types?.map((type, index) => (
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
            {displayPokemon.talents?.map((talent, index) => (
              <View key={index} style={styles.talentItem}>
                <Text style={styles.talentName}>{talent.name}</Text>
                {talent.tc && <Text style={styles.hiddenTalent}>(Talent Caché)</Text>}
              </View>
            ))}
          </View>
        </View>

        {/* Faiblesses et Résistances */}
        {displayPokemon.resistances && displayPokemon.resistances.length > 0 && (() => {
          // Trier les résistances par catégories pour une meilleure UX
          const sortedResistances = [...displayPokemon.resistances].sort((a, b) => {
            // Ordre : Immunités (0) → Résistances (<1) → Normal (1) → Faiblesses (>1)
            if (a.multiplier === 0 && b.multiplier !== 0) return -1;
            if (b.multiplier === 0 && a.multiplier !== 0) return 1;
            if (a.multiplier < 1 && b.multiplier >= 1) return -1;
            if (b.multiplier < 1 && a.multiplier >= 1) return 1;
            if (a.multiplier === 1 && b.multiplier > 1) return -1;
            if (b.multiplier === 1 && a.multiplier > 1) return 1;
            // Trier par multiplier dans chaque catégorie
            return a.multiplier - b.multiplier;
          });

          const immunities = sortedResistances.filter(r => r.multiplier === 0);
          const resistances = sortedResistances.filter(r => r.multiplier > 0 && r.multiplier < 1);
          const weaknesses = sortedResistances.filter(r => r.multiplier > 1);

          return (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Faiblesses et Résistances</Text>
              
              {/* Immunités */}
              {immunities.length > 0 && (
                <View style={styles.categoryContainer}>
                  <Text style={styles.categoryTitle}>🛡️ Immunités</Text>
                  <View style={styles.typesGrid}>
                    {immunities.map((resistance, index) => (
                      <View key={index} style={styles.typeGridItem}>
                        <View style={[
                          styles.resistanceTypeTag, 
                          { backgroundColor: getTypeColor(resistance.name) }
                        ]}>
                          <Text style={styles.resistanceTypeName}>{resistance.name}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Résistances */}
              {resistances.length > 0 && (
                <View style={styles.categoryContainer}>
                  <Text style={styles.categoryTitle}>🔰 Résistances</Text>
                  <View style={styles.typesGrid}>
                    {resistances.map((resistance, index) => (
                      <View key={index} style={styles.typeGridItem}>
                        <View style={[
                          styles.resistanceTypeTag, 
                          { backgroundColor: getTypeColor(resistance.name) }
                        ]}>
                          <Text style={styles.resistanceTypeName}>{resistance.name}</Text>
                        </View>
                        <Text style={styles.multiplierText}>×{resistance.multiplier}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Faiblesses */}
              {weaknesses.length > 0 && (
                <View style={styles.categoryContainer}>
                  <Text style={styles.categoryTitle}>⚡ Faiblesses</Text>
                  <View style={styles.typesGrid}>
                    {weaknesses.map((resistance, index) => (
                      <View key={index} style={styles.typeGridItem}>
                        <View style={[
                          styles.resistanceTypeTag, 
                          { backgroundColor: getTypeColor(resistance.name) }
                        ]}>
                          <Text style={styles.resistanceTypeName}>{resistance.name}</Text>
                        </View>
                        <Text style={styles.multiplierText}>×{resistance.multiplier}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          );
        })()}
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
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    position: 'relative',
  },
  favoriteButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
    backgroundColor: '#FEF3C7',
    borderRadius: 24,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#FDE68A',
  },
  favoriteIcon: {
    fontSize: 24,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  pokemonImage: {
    width: 160,
    height: 160,
  },
  shinyButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 8,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  shinyButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  basicInfo: {
    alignItems: 'center',
  },
  pokemonNumber: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 6,
    fontWeight: '700',
    letterSpacing: 1,
  },
  pokemonName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  pokemonNameEn: {
    fontSize: 17,
    color: '#64748B',
    marginBottom: 8,
    fontWeight: '600',
  },
  category: {
    fontSize: 15,
    color: '#64748B',
    fontStyle: 'italic',
    fontWeight: '500',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginVertical: 6,
    paddingVertical: 22,
    paddingHorizontal: 20,
    borderRadius: 0,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 18,
    letterSpacing: 0.3,
  },
  typesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  typeTag: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  typeText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  statsContainer: {
    gap: 14,
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
    fontWeight: '600',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
    width: 32,
    textAlign: 'right',
  },
  statBarContainer: {
    flex: 1,
    height: 10,
    backgroundColor: '#E2E8F0',
    borderRadius: 6,
  },
  statBar: {
    height: '100%',
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  physicalInfo: {
    gap: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  infoLabel: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
  },
  talentsContainer: {
    gap: 10,
  },
  talentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  talentName: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '700',
  },
  hiddenTalent: {
    fontSize: 12,
    color: '#8B5CF6',
    fontStyle: 'italic',
    fontWeight: '700',
  },
  // Styles pour les résistances (nouvelle version organisée)
  categoryContainer: {
    marginBottom: 18,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#374151',
    marginBottom: 14,
    letterSpacing: 0.3,
  },
  typesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  typeGridItem: {
    alignItems: 'center',
    marginBottom: 8,
  },
  resistanceTypeTag: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    minWidth: 75,
    alignItems: 'center',
    marginBottom: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  resistanceTypeName: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  multiplierText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6B7280',
    textAlign: 'center',
  },
  // Styles spéciaux pour MissingNo.
  missingNoEmoji: {
    fontSize: 90,
    marginBottom: 20,
  },
  missingNoTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#8B5CF6',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  anecdoteContainer: {
    gap: 18,
  },
  anecdoteText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#374151',
    textAlign: 'justify',
    fontWeight: '500',
  },
  anecdoteBold: {
    fontWeight: '800',
    color: '#1F2937',
  },
  technicalInfo: {
    gap: 10,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  technicalText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  warningSection: {
    backgroundColor: '#FEF3C7',
    marginVertical: 6,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderLeftWidth: 5,
    borderLeftColor: '#F59E0B',
    borderRadius: 0,
  },
  warningTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#92400E',
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  warningText: {
    fontSize: 14,
    color: '#78350F',
    lineHeight: 22,
    fontWeight: '600',
  },
});

export default PokemonDetailScreen;

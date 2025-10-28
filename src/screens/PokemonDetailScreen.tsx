import React, { useState, useEffect } from 'react';
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
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { PokemonDetailScreenProps } from '../types/navigation';
import { usePokemonById } from '../hooks/usePokemon';
import { useFavorites } from '../hooks/useFavorites';

const { width } = Dimensions.get('window');

const PokemonDetailScreen: React.FC<PokemonDetailScreenProps> = ({ route }) => {
  const { pokemonId, pokemon: initialPokemon } = route.params;
  const [isShiny, setIsShiny] = useState(false);
  
  const { data: pokemon, isLoading, error } = usePokemonById(pokemonId);
  const { favorites, toggleFavorite: toggleFav } = useFavorites();
  
  // Animations
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(30);
  const scaleAnim = new Animated.Value(0.9);
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  
  // Calculer si c'est un favori à partir de la liste complète
  const isFavorite = favorites.some(fav => fav.pokedex_id === pokemonId);
  const favoriteLoading = false;
  
  // Utilise les données de la route si disponibles, sinon utilise les données de l'API
  const displayPokemon = pokemon || initialPokemon;

  const handleFavoritePress = async () => {
    if (!displayPokemon) return;
    
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      console.log('⭐ Toggle favorite for:', displayPokemon.name.fr);
      await toggleFav(displayPokemon);
      // Pas de pop-up, juste le changement visuel de l'étoile
    } catch (error) {
      // Optionnel : un simple log en cas d'erreur
      console.error('Erreur lors de la modification des favoris:', error);
    }
  };

  const handleShinyToggle = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsShiny(!isShiny);
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
      <View style={styles.background}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* En-tête avec image */}
          <Animated.View 
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim },
                ],
              },
            ]}
          >
            {/* Bouton favori en haut à droite */}
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={handleFavoritePress}
              disabled={favoriteLoading}
              activeOpacity={0.8}
            >
              <BlurView intensity={20} style={styles.favoriteBlur}>
                <Text style={styles.favoriteIcon}>
                  {isFavorite ? '⭐' : '☆'}
                </Text>
              </BlurView>
            </TouchableOpacity>

            <View style={styles.imageContainer}>
              <BlurView intensity={10} style={styles.imageBlur}>
                <Image
                  source={{ 
                    uri: isShiny ? displayPokemon.sprites.shiny : displayPokemon.sprites.regular 
                  }}
                  style={styles.pokemonImage}
                  resizeMode="contain"
                />
              </BlurView>
              <TouchableOpacity
                style={styles.shinyButton}
                onPress={handleShinyToggle}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={isShiny ? ['#FFD700', '#FFA500'] : ['#8B5CF6', '#A855F7']}
                  style={styles.shinyGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.shinyButtonText}>
                    {isShiny ? '✨ Shiny' : '⭐ Shiny'}
                  </Text>
                </LinearGradient>
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
          </Animated.View>

          {/* Types */}
          <Animated.View 
            style={[
              styles.section,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <BlurView intensity={20} style={styles.sectionBlur}>
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
            </BlurView>
          </Animated.View>

          {/* Statistiques */}
          <Animated.View 
            style={[
              styles.section,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <BlurView intensity={20} style={styles.sectionBlur}>
              <Text style={styles.sectionTitle}>Statistiques</Text>
              <View style={styles.statsContainer}>
                <StatBar label="PV" value={displayPokemon.stats.hp} maxValue={255} color="#FF5959" />
                <StatBar label="Attaque" value={displayPokemon.stats.atk} maxValue={255} color="#F5AC78" />
                <StatBar label="Défense" value={displayPokemon.stats.def} maxValue={255} color="#FAE078" />
                <StatBar label="Att. Spé" value={displayPokemon.stats.spe_atk} maxValue={255} color="#9DB7F5" />
                <StatBar label="Déf. Spé" value={displayPokemon.stats.spe_def} maxValue={255} color="#A7DB8D" />
                <StatBar label="Vitesse" value={displayPokemon.stats.vit} maxValue={255} color="#FA92B2" />
              </View>
            </BlurView>
          </Animated.View>

          {/* Informations physiques */}
          <Animated.View 
            style={[
              styles.section,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <BlurView intensity={20} style={styles.sectionBlur}>
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
            </BlurView>
          </Animated.View>

          {/* Talents */}
          <Animated.View 
            style={[
              styles.section,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <BlurView intensity={20} style={styles.sectionBlur}>
              <Text style={styles.sectionTitle}>Talents</Text>
              <View style={styles.talentsContainer}>
                {displayPokemon.talents?.map((talent, index) => (
                  <View key={index} style={styles.talentItem}>
                    <Text style={styles.talentName}>{talent.name}</Text>
                    {talent.tc && <Text style={styles.hiddenTalent}>(Talent Caché)</Text>}
                  </View>
                ))}
              </View>
            </BlurView>
          </Animated.View>

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
              <Animated.View 
                style={[
                  styles.section,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                  },
                ]}
              >
                <BlurView intensity={20} style={styles.sectionBlur}>
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
                </BlurView>
              </Animated.View>
            );
          })()}
        </ScrollView>
      </View>
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
    backgroundColor: '#F0F9FF',
  },
  background: {
    flex: 1,
    backgroundColor: '#F0F9FF',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    color: '#1E40AF',
    fontWeight: '700',
  },
  errorText: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorMessage: {
    fontSize: 18,
    color: '#1E40AF',
    textAlign: 'center',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
    position: 'relative',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 3,
    borderBottomColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  favoriteButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  favoriteBlur: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteIcon: {
    fontSize: 20,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  imageBlur: {
    borderRadius: 75,
    padding: 8,
    overflow: 'hidden',
  },
  pokemonImage: {
    width: 150,
    height: 150,
  },
  shinyButton: {
    borderRadius: 16,
    marginTop: 8,
    overflow: 'hidden',
  },
  shinyGradient: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  shinyButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  basicInfo: {
    alignItems: 'center',
  },
  pokemonNumber: {
    fontSize: 18,
    color: '#3B82F6',
    marginBottom: 8,
    fontWeight: '800',
  },
  pokemonName: {
    fontSize: 36,
    fontWeight: '900',
    color: '#1E293B',
    marginBottom: 8,
    textShadowColor: 'rgba(59, 130, 246, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  pokemonNameEn: {
    fontSize: 20,
    color: '#3B82F6',
    marginBottom: 12,
    fontWeight: '700',
  },
  category: {
    fontSize: 16,
    color: '#64748B',
    fontStyle: 'italic',
    fontWeight: '600',
  },
  section: {
    marginVertical: 4,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  sectionBlur: {
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1E293B',
    marginBottom: 20,
    textAlign: 'center',
  },
  typesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  typeTag: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  typeText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: 1,
  },
  statsContainer: {
    gap: 16,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statLabel: {
    fontSize: 16,
    color: '#1E293B',
    width: 80,
    fontWeight: '700',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#3B82F6',
    width: 40,
    textAlign: 'right',
  },
  statBarContainer: {
    flex: 1,
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  statBar: {
    height: '100%',
    borderRadius: 5,
  },
  physicalInfo: {
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 18,
    color: '#1E293B',
    fontWeight: '700',
  },
  infoValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#3B82F6',
  },
  talentsContainer: {
    gap: 12,
  },
  talentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  talentName: {
    fontSize: 18,
    color: '#1E293B',
    fontWeight: '700',
  },
  hiddenTalent: {
    fontSize: 14,
    color: '#8B5CF6',
    fontStyle: 'italic',
    fontWeight: '700',
  },
  // Styles pour les résistances (nouvelle version organisée)
  categoryContainer: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 16,
    textAlign: 'center',
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  resistanceTypeName: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  multiplierText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
  },
  // Styles spéciaux pour MissingNo.
  missingNoEmoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  missingNoTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B5CF6',
    textAlign: 'center',
  },
  anecdoteContainer: {
    gap: 16,
  },
  anecdoteText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#374151',
    textAlign: 'justify',
  },
  anecdoteBold: {
    fontWeight: '700',
    color: '#1F2937',
  },
  technicalInfo: {
    gap: 8,
  },
  technicalText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'monospace',
  },
  warningSection: {
    backgroundColor: '#FEF3C7',
    marginVertical: 4,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#78350F',
    lineHeight: 20,
  },
});

export default PokemonDetailScreen;

import React, { useState, useCallback, memo, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { PokemonDetailScreenProps } from '../types/navigation';
import { useTheme } from '../context/ThemeContext';
import { usePokemonById } from '../hooks/usePokemon';
import { useFavorites } from '../hooks/useFavorites';
import { getTypeColor } from '../utils/typeColors';

const { width } = Dimensions.get('window');
const blurhash = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4';

// Composant StatBar memoizé
const StatBar = memo<{
  label: string;
  value: number;
  maxValue: number;
  color: string;
}>(({ label, value, maxValue, color }) => {
  const percentage = (value / maxValue) * 100;

  return (
    <View style={styles.statRow} accessibilityLabel={`${label}: ${value}`}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <View style={styles.statBarContainer}>
        <View
          style={[
            styles.statBar,
            { width: `${percentage}%`, backgroundColor: color },
          ]}
        />
      </View>
    </View>
  );
});

// Composant pour afficher une évolution cliquable
const EvolutionItem = memo<{
  pokedexId: number;
  name: string;
  condition?: string;
  onPress: (id: number) => void;
}>(({ pokedexId, name, condition, onPress }) => {
  const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokedexId}.png`;

  return (
    <TouchableOpacity
      style={styles.evolutionItem}
      onPress={() => onPress(pokedexId)}
      accessibilityLabel={`Voir ${name}`}
      accessibilityRole="button"
    >
      <Image
        source={{ uri: spriteUrl }}
        style={styles.evolutionImage}
        contentFit="contain"
        placeholder={{ blurhash }}
        cachePolicy="memory-disk"
      />
      <Text style={styles.evolutionName} numberOfLines={1}>{name}</Text>
      <Text style={styles.evolutionNumber}>#{pokedexId.toString().padStart(3, '0')}</Text>
      {condition && (
        <Text style={styles.evolutionCondition} numberOfLines={2}>{condition}</Text>
      )}
    </TouchableOpacity>
  );
});

const PokemonDetailScreen: React.FC<PokemonDetailScreenProps> = ({ route, navigation }) => {
  const { pokemonId, pokemon: initialPokemon } = route.params;
  const [isShiny, setIsShiny] = useState(false);
  const [showGmax, setShowGmax] = useState(false);
  const { colors } = useTheme();

  const { data: pokemon, isLoading, error } = usePokemonById(pokemonId);
  const { favorites, toggleFavorite: toggleFav } = useFavorites();

  const isFavorite = favorites.some((fav) => fav.pokedex_id === pokemonId);
  const displayPokemon = pokemon || initialPokemon;

  // Calculer le BST (Base Stat Total)
  const bst = useMemo(() => {
    if (!displayPokemon?.stats) return 0;
    const { hp, atk, def, spe_atk, spe_def, vit } = displayPokemon.stats;
    return hp + atk + def + spe_atk + spe_def + vit;
  }, [displayPokemon?.stats]);

  // Vérifier si Gigamax disponible
  const hasGmax = displayPokemon?.sprites?.gmax?.regular;

  const handleFavoritePress = useCallback(async () => {
    if (!displayPokemon) return;
    try {
      await toggleFav(displayPokemon);
    } catch (err) {
      // Silently handle error - UI will reflect current state
    }
  }, [displayPokemon, toggleFav]);

  const toggleShiny = useCallback(() => {
    setIsShiny((prev) => !prev);
  }, []);

  const toggleGmax = useCallback(() => {
    setShowGmax((prev) => !prev);
  }, []);

  // Navigation vers un autre Pokémon (évolution)
  const navigateToPokemon = useCallback((id: number) => {
    navigation.push('PokemonDetail', { pokemonId: id });
  }, [navigation]);

  // Obtenir l'URL du sprite actuel
  const getCurrentSprite = useCallback(() => {
    if (!displayPokemon?.sprites) return '';

    if (showGmax && displayPokemon.sprites.gmax) {
      return isShiny
        ? displayPokemon.sprites.gmax.shiny
        : displayPokemon.sprites.gmax.regular;
    }

    return isShiny
      ? displayPokemon.sprites.shiny
      : displayPokemon.sprites.regular;
  }, [displayPokemon?.sprites, isShiny, showGmax]);

  if (isLoading && !initialPokemon) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Chargement des détails...</Text>
      </View>
    );
  }

  if (error && !initialPokemon) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <Text style={styles.errorText}>❌</Text>
        <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>Erreur lors du chargement</Text>
      </View>
    );
  }

  if (!displayPokemon) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <Text style={styles.errorText}>❓</Text>
        <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>Pokémon non trouvé</Text>
      </View>
    );
  }

  // MissingNo. special case
  if (displayPokemon.pokedex_id === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎮 Anecdote Légendaire</Text>
            <View style={styles.anecdoteContainer}>
              <Text style={styles.anecdoteText}>
                <Text style={styles.anecdoteBold}>MissingNo.</Text> est l'un des bugs les plus célèbres de l'histoire du jeu vidéo ! Découvert dans Pokémon Rouge et Bleu, ce "Pokémon fantôme" apparaissait lors du fameux glitch de Cramois'Île.
              </Text>
              <Text style={styles.anecdoteText}>
                💡 <Text style={styles.anecdoteBold}>Le glitch :</Text> Parler au vieil homme de Jadielle, puis voler vers Cramois'Île et surfer sur la côte Est.
              </Text>
              <Text style={styles.anecdoteText}>
                ✨ <Text style={styles.anecdoteBold}>Effet magique :</Text> Dupliquait le 6ème objet du sac ! 99 Master Balls garanties.
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header avec gradient basé sur le type */}
        <View style={[styles.header, { backgroundColor: getTypeColor(displayPokemon.types?.[0]?.name || 'Normal') + '15' }]}>
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={handleFavoritePress}
            accessibilityLabel={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          >
            <Text style={styles.favoriteIcon}>{isFavorite ? '⭐' : '☆'}</Text>
          </TouchableOpacity>

          <View style={styles.imageContainer}>
            <Image
              source={{ uri: getCurrentSprite() }}
              style={styles.pokemonImage}
              contentFit="contain"
              placeholder={{ blurhash }}
              transition={300}
              cachePolicy="memory-disk"
            />

            {/* Boutons Shiny et Gigamax */}
            <View style={styles.spriteButtons}>
              <TouchableOpacity
                style={[styles.spriteButton, isShiny && styles.spriteButtonActive]}
                onPress={toggleShiny}
              >
                <Text style={styles.spriteButtonText}>✨ Shiny</Text>
              </TouchableOpacity>

              {hasGmax && (
                <TouchableOpacity
                  style={[styles.spriteButton, styles.gmaxButton, showGmax && styles.spriteButtonActive]}
                  onPress={toggleGmax}
                >
                  <Text style={styles.spriteButtonText}>🔥 Gigamax</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.basicInfo}>
            <Text style={styles.pokemonNumber}>
              #{displayPokemon.pokedex_id.toString().padStart(3, '0')}
            </Text>
            <Text style={styles.pokemonName}>{displayPokemon.name.fr}</Text>
            <Text style={styles.pokemonNameEn}>
              {displayPokemon.name.en} • {displayPokemon.name.jp}
            </Text>
            <Text style={styles.category}>{displayPokemon.category}</Text>
          </View>
        </View>

        {/* Types avec icônes */}
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

        {/* Statistiques avec BST */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Statistiques</Text>
            <View style={styles.bstBadge}>
              <Text style={styles.bstLabel}>BST</Text>
              <Text style={styles.bstValue}>{bst}</Text>
            </View>
          </View>
          <View style={styles.statsContainer}>
            <StatBar label="PV" value={displayPokemon.stats.hp} maxValue={255} color="#FF5959" />
            <StatBar label="Attaque" value={displayPokemon.stats.atk} maxValue={255} color="#F5AC78" />
            <StatBar label="Défense" value={displayPokemon.stats.def} maxValue={255} color="#FAE078" />
            <StatBar label="Att. Spé" value={displayPokemon.stats.spe_atk} maxValue={255} color="#9DB7F5" />
            <StatBar label="Déf. Spé" value={displayPokemon.stats.spe_def} maxValue={255} color="#A7DB8D" />
            <StatBar label="Vitesse" value={displayPokemon.stats.vit} maxValue={255} color="#FA92B2" />
          </View>
        </View>

        {/* Évolutions */}
        {displayPokemon.evolution && (
          ((displayPokemon.evolution.pre?.length ?? 0) > 0 || (displayPokemon.evolution.next?.length ?? 0) > 0) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🔄 Évolutions</Text>
              <View style={styles.evolutionChain}>
                {/* Pré-évolutions */}
                {displayPokemon.evolution.pre?.map((evo, index) => (
                  <React.Fragment key={`pre-${index}`}>
                    <EvolutionItem
                      pokedexId={evo.pokedex_id}
                      name={evo.name}
                      onPress={navigateToPokemon}
                    />
                    <Text style={styles.evolutionArrow}>→</Text>
                  </React.Fragment>
                ))}

                {/* Pokémon actuel */}
                <View style={styles.evolutionItemCurrent}>
                  <Image
                    source={{ uri: displayPokemon.sprites.regular }}
                    style={styles.evolutionImage}
                    contentFit="contain"
                    cachePolicy="memory-disk"
                  />
                  <Text style={styles.evolutionNameCurrent}>{displayPokemon.name.fr}</Text>
                  <Text style={styles.evolutionNumber}>#{displayPokemon.pokedex_id.toString().padStart(3, '0')}</Text>
                </View>

                {/* Évolutions suivantes */}
                {displayPokemon.evolution.next?.map((evo, index) => (
                  <React.Fragment key={`next-${index}`}>
                    <Text style={styles.evolutionArrow}>→</Text>
                    <EvolutionItem
                      pokedexId={evo.pokedex_id}
                      name={evo.name}
                      condition={evo.condition}
                      onPress={navigateToPokemon}
                    />
                  </React.Fragment>
                ))}
              </View>
            </View>
          )
        )}

        {/* Infos pour le Breeding / Compétitif */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Infos Compétitif</Text>
          <View style={styles.competitiveGrid}>
            {/* Groupes d'œufs */}
            {displayPokemon.egg_groups && displayPokemon.egg_groups.length > 0 && (
              <View style={styles.competitiveItem}>
                <Text style={styles.competitiveLabel}>🥚 Groupes d'œufs</Text>
                <Text style={styles.competitiveValue}>
                  {displayPokemon.egg_groups.join(' • ')}
                </Text>
              </View>
            )}

            {/* Ratio sexe */}
            {displayPokemon.sexe && (
              <View style={styles.competitiveItem}>
                <Text style={styles.competitiveLabel}>⚧️ Ratio sexe</Text>
                {displayPokemon.sexe.male === 0 && displayPokemon.sexe.female === 0 ? (
                  <Text style={styles.competitiveValue}>Asexué</Text>
                ) : (
                  <View style={styles.genderBar}>
                    <View style={[styles.genderMale, { flex: displayPokemon.sexe.male }]}>
                      <Text style={styles.genderText}>♂ {displayPokemon.sexe.male}%</Text>
                    </View>
                    <View style={[styles.genderFemale, { flex: displayPokemon.sexe.female }]}>
                      <Text style={styles.genderText}>♀ {displayPokemon.sexe.female}%</Text>
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* Taux de capture */}
            {displayPokemon.catch_rate !== undefined && (
              <View style={styles.competitiveItem}>
                <Text style={styles.competitiveLabel}>🎣 Taux de capture</Text>
                <Text style={styles.competitiveValue}>{displayPokemon.catch_rate}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Informations physiques */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📏 Caractéristiques</Text>
          <View style={styles.physicalGrid}>
            <View style={styles.physicalItem}>
              <Text style={styles.physicalIcon}>📐</Text>
              <Text style={styles.physicalLabel}>Taille</Text>
              <Text style={styles.physicalValue}>{displayPokemon.height}</Text>
            </View>
            <View style={styles.physicalItem}>
              <Text style={styles.physicalIcon}>⚖️</Text>
              <Text style={styles.physicalLabel}>Poids</Text>
              <Text style={styles.physicalValue}>{displayPokemon.weight}</Text>
            </View>
            <View style={styles.physicalItem}>
              <Text style={styles.physicalIcon}>🎮</Text>
              <Text style={styles.physicalLabel}>Génération</Text>
              <Text style={styles.physicalValue}>{displayPokemon.generation}</Text>
            </View>
          </View>
        </View>

        {/* Talents */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✨ Talents</Text>
          <View style={styles.talentsContainer}>
            {displayPokemon.talents?.map((talent, index) => (
              <View key={index} style={[styles.talentItem, talent.tc && styles.talentItemHidden]}>
                <Text style={styles.talentName}>{talent.name}</Text>
                {talent.tc && (
                  <View style={styles.hiddenTalentBadge}>
                    <Text style={styles.hiddenTalentText}>Caché</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Faiblesses et Résistances */}
        {displayPokemon.resistances && displayPokemon.resistances.length > 0 && (
          <ResistancesSection resistances={displayPokemon.resistances} />
        )}

        {/* Spacer bottom */}
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// Composant memoizé pour les résistances
const ResistancesSection = memo<{
  resistances: Array<{ name: string; multiplier: number }>;
}>(({ resistances }) => {
  const sortedResistances = [...resistances].sort((a, b) => {
    if (a.multiplier === 0 && b.multiplier !== 0) return -1;
    if (b.multiplier === 0 && a.multiplier !== 0) return 1;
    if (a.multiplier < 1 && b.multiplier >= 1) return -1;
    if (b.multiplier < 1 && a.multiplier >= 1) return 1;
    if (a.multiplier === 1 && b.multiplier > 1) return -1;
    if (b.multiplier === 1 && a.multiplier > 1) return 1;
    return a.multiplier - b.multiplier;
  });

  const immunities = sortedResistances.filter((r) => r.multiplier === 0);
  const resistancesList = sortedResistances.filter((r) => r.multiplier > 0 && r.multiplier < 1);
  const weaknesses = sortedResistances.filter((r) => r.multiplier > 1);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>⚔️ Matchups de type</Text>

      {immunities.length > 0 && (
        <View style={styles.resistanceCategory}>
          <Text style={styles.resistanceCategoryTitle}>🛡️ Immunités</Text>
          <View style={styles.resistanceGrid}>
            {immunities.map((r, i) => (
              <View key={i} style={[styles.resistanceItem, { backgroundColor: getTypeColor(r.name) }]}>
                <Text style={styles.resistanceTypeName}>{r.name}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {resistancesList.length > 0 && (
        <View style={styles.resistanceCategory}>
          <Text style={styles.resistanceCategoryTitle}>🔰 Résistances</Text>
          <View style={styles.resistanceGrid}>
            {resistancesList.map((r, i) => (
              <View key={i} style={styles.resistanceItemWithMultiplier}>
                <View style={[styles.resistanceItem, { backgroundColor: getTypeColor(r.name) }]}>
                  <Text style={styles.resistanceTypeName}>{r.name}</Text>
                </View>
                <Text style={styles.resistanceMultiplier}>×{r.multiplier}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {weaknesses.length > 0 && (
        <View style={styles.resistanceCategory}>
          <Text style={styles.resistanceCategoryTitle}>⚡ Faiblesses</Text>
          <View style={styles.resistanceGrid}>
            {weaknesses.map((r, i) => (
              <View key={i} style={styles.resistanceItemWithMultiplier}>
                <View style={[styles.resistanceItem, { backgroundColor: getTypeColor(r.name) }]}>
                  <Text style={styles.resistanceTypeName}>{r.name}</Text>
                </View>
                <Text style={[styles.resistanceMultiplier, r.multiplier >= 4 && styles.resistanceMultiplierDanger]}>
                  ×{r.multiplier}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
});

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
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    position: 'relative',
  },
  favoriteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  favoriteIcon: {
    fontSize: 22,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  pokemonImage: {
    width: 180,
    height: 180,
  },
  spriteButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  spriteButton: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  spriteButtonActive: {
    backgroundColor: '#8B5CF6',
  },
  gmaxButton: {
    backgroundColor: '#F97316',
  },
  spriteButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  basicInfo: {
    alignItems: 'center',
  },
  pokemonNumber: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '700',
    letterSpacing: 1,
  },
  pokemonName: {
    fontSize: 34,
    fontWeight: '800',
    color: '#1E293B',
    marginVertical: 4,
  },
  pokemonNameEn: {
    fontSize: 15,
    color: '#64748B',
    marginBottom: 6,
    fontWeight: '500',
  },
  category: {
    fontSize: 14,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 12,
    marginTop: 12,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 14,
  },
  bstBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  bstLabel: {
    fontSize: 12,
    color: '#6366F1',
    fontWeight: '700',
  },
  bstValue: {
    fontSize: 16,
    color: '#4F46E5',
    fontWeight: '800',
  },
  typesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  typeTag: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  typeText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  statsContainer: {
    gap: 12,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statLabel: {
    fontSize: 13,
    color: '#64748B',
    width: 65,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '800',
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
  // Évolutions
  evolutionChain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  evolutionItem: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    minWidth: 80,
  },
  evolutionItemCurrent: {
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    padding: 10,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#6366F1',
    minWidth: 80,
  },
  evolutionImage: {
    width: 60,
    height: 60,
  },
  evolutionName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    marginTop: 4,
  },
  evolutionNameCurrent: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4F46E5',
    marginTop: 4,
  },
  evolutionNumber: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  evolutionCondition: {
    fontSize: 9,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 2,
  },
  evolutionArrow: {
    fontSize: 20,
    color: '#94A3B8',
    fontWeight: '700',
  },
  // Compétitif
  competitiveGrid: {
    gap: 14,
  },
  competitiveItem: {
    gap: 8,
  },
  competitiveLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  competitiveValue: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '700',
  },
  genderBar: {
    flexDirection: 'row',
    height: 28,
    borderRadius: 14,
    overflow: 'hidden',
  },
  genderMale: {
    backgroundColor: '#60A5FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  genderFemale: {
    backgroundColor: '#F472B6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  genderText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  // Caractéristiques
  physicalGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  physicalItem: {
    alignItems: 'center',
    gap: 4,
  },
  physicalIcon: {
    fontSize: 24,
  },
  physicalLabel: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  physicalValue: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '800',
  },
  // Talents
  talentsContainer: {
    gap: 10,
  },
  talentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  talentItemHidden: {
    backgroundColor: '#F5F3FF',
    borderColor: '#C4B5FD',
  },
  talentName: {
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '700',
  },
  hiddenTalentBadge: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  hiddenTalentText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  // Résistances
  resistanceCategory: {
    marginBottom: 16,
  },
  resistanceCategoryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 10,
  },
  resistanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  resistanceItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  resistanceItemWithMultiplier: {
    alignItems: 'center',
    gap: 4,
  },
  resistanceTypeName: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  resistanceMultiplier: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
  },
  resistanceMultiplierDanger: {
    color: '#DC2626',
  },
  // MissingNo
  missingNoEmoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  missingNoTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#8B5CF6',
  },
  anecdoteContainer: {
    gap: 14,
  },
  anecdoteText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#374151',
  },
  anecdoteBold: {
    fontWeight: '800',
    color: '#1F2937',
  },
});

export default PokemonDetailScreen;

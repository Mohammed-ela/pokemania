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

// Composant StatBar memoizé avec support du thème
const StatBar = memo<{
  label: string;
  value: number;
  maxValue: number;
  color: string;
  colors: any;
}>(({ label, value, maxValue, color, colors }) => {
  const percentage = (value / maxValue) * 100;

  return (
    <View style={styles.statRow} accessibilityLabel={`${label}: ${value}`}>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <View style={[styles.statBarContainer, { backgroundColor: colors.border }]}>
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
  colors: any;
}>(({ pokedexId, name, condition, onPress, colors }) => {
  const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokedexId}.png`;

  return (
    <TouchableOpacity
      style={[styles.evolutionItem, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}
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
      <Text style={[styles.evolutionName, { color: colors.text }]} numberOfLines={1}>{name}</Text>
      <Text style={[styles.evolutionNumber, { color: colors.textMuted }]}>#{pokedexId.toString().padStart(3, '0')}</Text>
      {condition && (
        <Text style={[styles.evolutionCondition, { color: colors.textSecondary }]} numberOfLines={2}>{condition}</Text>
      )}
    </TouchableOpacity>
  );
});

const PokemonDetailScreen: React.FC<PokemonDetailScreenProps> = ({ route, navigation }) => {
  const { pokemonId, pokemon: initialPokemon } = route.params;
  const [isShiny, setIsShiny] = useState(false);
  const [showGmax, setShowGmax] = useState(false);
  const { colors, isDark } = useTheme();

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
              <Text style={[styles.missingNoTitle, { color: colors.text }]}>MissingNo.</Text>
            </View>
            <View style={styles.basicInfo}>
              <Text style={[styles.pokemonNumber, { color: colors.textSecondary }]}>#000</Text>
              <Text style={[styles.pokemonName, { color: colors.text }]}>MissingNo.</Text>
              <Text style={[styles.pokemonNameEn, { color: colors.textSecondary }]}>(Missing Number)</Text>
              <Text style={[styles.category, { color: colors.textMuted }]}>Pokémon Glitch</Text>
            </View>
          </View>
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>🎮 Anecdote Légendaire</Text>
            <View style={styles.anecdoteContainer}>
              <Text style={[styles.anecdoteText, { color: colors.textSecondary }]}>
                <Text style={[styles.anecdoteBold, { color: colors.text }]}>MissingNo.</Text> est l'un des bugs les plus célèbres de l'histoire du jeu vidéo !
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
        <View style={[styles.header, { backgroundColor: getTypeColor(displayPokemon.types?.[0]?.name || 'Normal') + (isDark ? '30' : '15') }]}>
          {/* Bouton favori moderne */}
          <TouchableOpacity
            style={[styles.favoriteButton, { backgroundColor: isFavorite ? '#EF4444' : colors.surface }]}
            onPress={handleFavoritePress}
            accessibilityLabel={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          >
            <Text style={styles.favoriteIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
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
                style={[styles.spriteButton, { backgroundColor: colors.surfaceVariant }, isShiny && styles.spriteButtonActive]}
                onPress={toggleShiny}
              >
                <Text style={[styles.spriteButtonText, { color: isShiny ? '#FFFFFF' : colors.text }]}>✨ Shiny</Text>
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
            <Text style={[styles.pokemonNumber, { color: colors.textSecondary }]}>
              #{displayPokemon.pokedex_id.toString().padStart(3, '0')}
            </Text>
            <Text style={[styles.pokemonName, { color: colors.text }]}>{displayPokemon.name.fr}</Text>
            <Text style={[styles.pokemonNameEn, { color: colors.textSecondary }]}>
              {displayPokemon.name.en} • {displayPokemon.name.jp}
            </Text>
            <Text style={[styles.category, { color: colors.textMuted }]}>{displayPokemon.category}</Text>
          </View>
        </View>

        {/* Types avec icônes */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Types</Text>
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
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Statistiques</Text>
            <View style={[styles.bstBadge, { backgroundColor: isDark ? '#312E81' : '#EEF2FF' }]}>
              <Text style={[styles.bstLabel, { color: isDark ? '#A5B4FC' : '#6366F1' }]}>BST</Text>
              <Text style={[styles.bstValue, { color: isDark ? '#C7D2FE' : '#4F46E5' }]}>{bst}</Text>
            </View>
          </View>
          <View style={styles.statsContainer}>
            <StatBar label="PV" value={displayPokemon.stats.hp} maxValue={255} color="#FF5959" colors={colors} />
            <StatBar label="Attaque" value={displayPokemon.stats.atk} maxValue={255} color="#F5AC78" colors={colors} />
            <StatBar label="Défense" value={displayPokemon.stats.def} maxValue={255} color="#FAE078" colors={colors} />
            <StatBar label="Att. Spé" value={displayPokemon.stats.spe_atk} maxValue={255} color="#9DB7F5" colors={colors} />
            <StatBar label="Déf. Spé" value={displayPokemon.stats.spe_def} maxValue={255} color="#A7DB8D" colors={colors} />
            <StatBar label="Vitesse" value={displayPokemon.stats.vit} maxValue={255} color="#FA92B2" colors={colors} />
          </View>
        </View>

        {/* Évolutions */}
        {displayPokemon.evolution && (
          ((displayPokemon.evolution.pre?.length ?? 0) > 0 || (displayPokemon.evolution.next?.length ?? 0) > 0) && (
            <View style={[styles.section, { backgroundColor: colors.surface }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>🔄 Évolutions</Text>
              <View style={styles.evolutionChain}>
                {/* Pré-évolutions */}
                {displayPokemon.evolution.pre?.map((evo, index) => (
                  <React.Fragment key={`pre-${index}`}>
                    <EvolutionItem
                      pokedexId={evo.pokedex_id}
                      name={evo.name}
                      onPress={navigateToPokemon}
                      colors={colors}
                    />
                    <Text style={[styles.evolutionArrow, { color: colors.textMuted }]}>→</Text>
                  </React.Fragment>
                ))}

                {/* Pokémon actuel */}
                <View style={[styles.evolutionItemCurrent, { backgroundColor: isDark ? '#312E81' : '#EEF2FF', borderColor: '#6366F1' }]}>
                  <Image
                    source={{ uri: displayPokemon.sprites.regular }}
                    style={styles.evolutionImage}
                    contentFit="contain"
                    cachePolicy="memory-disk"
                  />
                  <Text style={[styles.evolutionNameCurrent, { color: isDark ? '#A5B4FC' : '#4F46E5' }]}>{displayPokemon.name.fr}</Text>
                  <Text style={[styles.evolutionNumber, { color: colors.textMuted }]}>#{displayPokemon.pokedex_id.toString().padStart(3, '0')}</Text>
                </View>

                {/* Évolutions suivantes */}
                {displayPokemon.evolution.next?.map((evo, index) => (
                  <React.Fragment key={`next-${index}`}>
                    <Text style={[styles.evolutionArrow, { color: colors.textMuted }]}>→</Text>
                    <EvolutionItem
                      pokedexId={evo.pokedex_id}
                      name={evo.name}
                      condition={evo.condition}
                      onPress={navigateToPokemon}
                      colors={colors}
                    />
                  </React.Fragment>
                ))}
              </View>
            </View>
          )
        )}

        {/* Infos pour le Breeding / Compétitif */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>🎯 Infos Compétitif</Text>
          <View style={styles.competitiveGrid}>
            {/* Groupes d'œufs */}
            {displayPokemon.egg_groups && displayPokemon.egg_groups.length > 0 && (
              <View style={styles.competitiveItem}>
                <Text style={[styles.competitiveLabel, { color: colors.textSecondary }]}>🥚 Groupes d'œufs</Text>
                <Text style={[styles.competitiveValue, { color: colors.text }]}>
                  {displayPokemon.egg_groups.join(' • ')}
                </Text>
              </View>
            )}

            {/* Ratio sexe */}
            {displayPokemon.sexe && (
              <View style={styles.competitiveItem}>
                <Text style={[styles.competitiveLabel, { color: colors.textSecondary }]}>⚧️ Ratio sexe</Text>
                {displayPokemon.sexe.male === 0 && displayPokemon.sexe.female === 0 ? (
                  <Text style={[styles.competitiveValue, { color: colors.text }]}>Asexué</Text>
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
                <Text style={[styles.competitiveLabel, { color: colors.textSecondary }]}>🎣 Taux de capture</Text>
                <Text style={[styles.competitiveValue, { color: colors.text }]}>{displayPokemon.catch_rate}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Informations physiques */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>📏 Caractéristiques</Text>
          <View style={styles.physicalGrid}>
            <View style={styles.physicalItem}>
              <Text style={styles.physicalIcon}>📐</Text>
              <Text style={[styles.physicalLabel, { color: colors.textMuted }]}>Taille</Text>
              <Text style={[styles.physicalValue, { color: colors.text }]}>{displayPokemon.height}</Text>
            </View>
            <View style={styles.physicalItem}>
              <Text style={styles.physicalIcon}>⚖️</Text>
              <Text style={[styles.physicalLabel, { color: colors.textMuted }]}>Poids</Text>
              <Text style={[styles.physicalValue, { color: colors.text }]}>{displayPokemon.weight}</Text>
            </View>
            <View style={styles.physicalItem}>
              <Text style={styles.physicalIcon}>🎮</Text>
              <Text style={[styles.physicalLabel, { color: colors.textMuted }]}>Génération</Text>
              <Text style={[styles.physicalValue, { color: colors.text }]}>{displayPokemon.generation}</Text>
            </View>
          </View>
        </View>

        {/* Talents */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>✨ Talents</Text>
          <View style={styles.talentsContainer}>
            {displayPokemon.talents?.map((talent, index) => (
              <View key={index} style={[
                styles.talentItem,
                { backgroundColor: colors.surfaceVariant, borderColor: colors.border },
                talent.tc && { backgroundColor: isDark ? '#312E81' : '#F5F3FF', borderColor: isDark ? '#6366F1' : '#C4B5FD' }
              ]}>
                <Text style={[styles.talentName, { color: colors.text }]}>{talent.name}</Text>
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
          <ResistancesSection resistances={displayPokemon.resistances} colors={colors} />
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
  colors: any;
}>(({ resistances, colors }) => {
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
    <View style={[styles.section, { backgroundColor: colors.surface }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>⚔️ Matchups de type</Text>

      {immunities.length > 0 && (
        <View style={styles.resistanceCategory}>
          <Text style={[styles.resistanceCategoryTitle, { color: colors.textSecondary }]}>🛡️ Immunités</Text>
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
          <Text style={[styles.resistanceCategoryTitle, { color: colors.textSecondary }]}>🔰 Résistances</Text>
          <View style={styles.resistanceGrid}>
            {resistancesList.map((r, i) => (
              <View key={i} style={styles.resistanceItemWithMultiplier}>
                <View style={[styles.resistanceItem, { backgroundColor: getTypeColor(r.name) }]}>
                  <Text style={styles.resistanceTypeName}>{r.name}</Text>
                </View>
                <Text style={[styles.resistanceMultiplier, { color: colors.textSecondary }]}>×{r.multiplier}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {weaknesses.length > 0 && (
        <View style={styles.resistanceCategory}>
          <Text style={[styles.resistanceCategoryTitle, { color: colors.textSecondary }]}>⚡ Faiblesses</Text>
          <View style={styles.resistanceGrid}>
            {weaknesses.map((r, i) => (
              <View key={i} style={styles.resistanceItemWithMultiplier}>
                <View style={[styles.resistanceItem, { backgroundColor: getTypeColor(r.name) }]}>
                  <Text style={styles.resistanceTypeName}>{r.name}</Text>
                </View>
                <Text style={[styles.resistanceMultiplier, { color: colors.textSecondary }, r.multiplier >= 4 && styles.resistanceMultiplierDanger]}>
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
    fontWeight: '600',
  },
  errorText: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorMessage: {
    fontSize: 16,
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
    borderRadius: 24,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  favoriteIcon: {
    fontSize: 24,
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
    fontSize: 12,
    fontWeight: '700',
  },
  basicInfo: {
    alignItems: 'center',
  },
  pokemonNumber: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
  pokemonName: {
    fontSize: 34,
    fontWeight: '800',
    marginVertical: 4,
  },
  pokemonNameEn: {
    fontSize: 15,
    marginBottom: 6,
    fontWeight: '500',
  },
  category: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  section: {
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
    marginBottom: 14,
  },
  bstBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  bstLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  bstValue: {
    fontSize: 16,
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
    width: 65,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '800',
    width: 30,
    textAlign: 'right',
  },
  statBarContainer: {
    flex: 1,
    height: 8,
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
    padding: 10,
    borderRadius: 16,
    borderWidth: 2,
    minWidth: 80,
  },
  evolutionItemCurrent: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 16,
    borderWidth: 2,
    minWidth: 80,
  },
  evolutionImage: {
    width: 60,
    height: 60,
  },
  evolutionName: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  evolutionNameCurrent: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 4,
  },
  evolutionNumber: {
    fontSize: 10,
    fontWeight: '600',
  },
  evolutionCondition: {
    fontSize: 9,
    textAlign: 'center',
    marginTop: 2,
  },
  evolutionArrow: {
    fontSize: 20,
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
    fontWeight: '600',
  },
  competitiveValue: {
    fontSize: 16,
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
    fontWeight: '600',
  },
  physicalValue: {
    fontSize: 16,
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
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  talentName: {
    fontSize: 15,
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
  },
  anecdoteContainer: {
    gap: 14,
  },
  anecdoteText: {
    fontSize: 14,
    lineHeight: 22,
  },
  anecdoteBold: {
    fontWeight: '800',
  },
});

export default PokemonDetailScreen;

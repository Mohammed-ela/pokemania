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
import { usePokemonById, useAllPokemon, useMegaForms } from '../hooks/usePokemon';
import { mergeMegaForms } from '../services/megaApi';
import { useFavorites } from '../context/FavoritesContext';
import { getTypeColor } from '../utils/typeColors';

const { width } = Dimensions.get('window');
const blurhash = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4';

const REGION_LABELS: Record<string, string> = {
  alola: 'Alola',
  galar: 'Galar',
  hisui: 'Hisui',
  paldea: 'Paldea',
};

const getRegionLabel = (region: string) =>
  REGION_LABELS[region] ?? region.charAt(0).toUpperCase() + region.slice(1);

// Écart affiché à côté d'une stat en mode Méga (ex : "+30")
const formatDelta = (delta: number) => (delta > 0 ? `+${delta}` : `${delta}`);
const DELTA_UP = '#16A34A';
const DELTA_DOWN = '#DC2626';

// Composant StatBar memoizé avec support du thème
const StatBar = memo<{
  label: string;
  value: number;
  maxValue: number;
  color: string;
  colors: any;
  baseValue?: number;
}>(({ label, value, maxValue, color, colors, baseValue }) => {
  const percentage = Math.min((value / maxValue) * 100, 100);
  const basePercentage = baseValue !== undefined ? Math.min((baseValue / maxValue) * 100, 100) : undefined;
  const delta = baseValue !== undefined ? value - baseValue : 0;

  return (
    <View
      style={styles.statRow}
      accessibilityLabel={`${label}: ${value}${delta !== 0 ? ` (${formatDelta(delta)})` : ''}`}
    >
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <View style={[styles.statBarContainer, { backgroundColor: colors.border }]}>
        <View
          style={[
            styles.statBar,
            { width: `${percentage}%`, backgroundColor: color },
          ]}
        />
        {/* Repère de la stat de la forme normale */}
        {basePercentage !== undefined && delta !== 0 && (
          <View style={[styles.statBaseMarker, { left: `${basePercentage}%`, backgroundColor: colors.text }]} />
        )}
      </View>
      {baseValue !== undefined && (
        <Text
          style={[
            styles.statDelta,
            { color: delta > 0 ? DELTA_UP : delta < 0 ? DELTA_DOWN : colors.textMuted },
          ]}
        >
          {delta !== 0 ? formatDelta(delta) : '='}
        </Text>
      )}
    </View>
  );
});

// Composant pour afficher une évolution cliquable
const EvolutionItem = memo<{
  pokedexId: number;
  name: string;
  condition?: string;
  region?: string;
  onPress: (id: number, region?: string) => void;
  colors: any;
}>(({ pokedexId, name, condition, region, onPress, colors }) => {
  const spriteUrl = region
    ? `https://raw.githubusercontent.com/Yarkis01/TyraDex/images/sprites/${pokedexId}/regular_${region}.png`
    : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokedexId}.png`;

  return (
    <TouchableOpacity
      style={[styles.evolutionItem, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}
      onPress={() => onPress(pokedexId, region)}
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
  const [region, setRegion] = useState<string | undefined>(route.params.region);
  const [isShiny, setIsShiny] = useState(false);
  const [showGmax, setShowGmax] = useState(false);
  const [megaQualifier, setMegaQualifier] = useState<string | null>(null); // '' = Méga sans suffixe
  const { colors, isDark } = useTheme();

  const { data: pokemon, isLoading, error } = usePokemonById(pokemonId, region);
  const { data: allPokemon } = useAllPokemon();
  const { isFavorite: checkIsFavorite, toggleFavorite } = useFavorites();

  const isFavorite = checkIsFavorite(pokemonId);
  // Les données passées en paramètre ne concernent que la forme normale
  const displayPokemon = pokemon || (region ? undefined : initialPokemon);

  // Formes régionales disponibles, lues depuis la liste complète (identique quelle que soit la forme affichée)
  const regionalForms = useMemo(() => {
    const base = allPokemon?.find((p) => p.pokedex_id === pokemonId);
    return base?.formes ?? displayPokemon?.formes ?? [];
  }, [allPokemon, pokemonId, displayPokemon?.formes]);

  // Méga-évolutions : uniquement pour la forme normale (PokéAPI les rattache à l'espèce, pas à la forme régionale)
  const { data: apiMegas, isLoading: isLoadingMegas } = useMegaForms(pokemonId, !region);
  const megas = useMemo(
    () => (region ? [] : mergeMegaForms(displayPokemon?.evolution?.mega ?? [], apiMegas)),
    [region, displayPokemon?.evolution?.mega, apiMegas]
  );
  const currentMega =
    megaQualifier !== null ? megas.find((m) => (m.qualifier ?? '') === megaQualifier) : undefined;

  // Pokémon affiché : la Méga remplace types, stats, talents et faiblesses quand ses données sont connues
  const shownPokemon = useMemo(() => {
    if (!displayPokemon || !currentMega?.stats) return displayPokemon;
    const suffix = currentMega.qualifier ? ` ${currentMega.qualifier}` : '';
    return {
      ...displayPokemon,
      name: {
        ...displayPokemon.name,
        fr: `Méga-${displayPokemon.name.fr}${suffix}`,
        en: `Mega ${displayPokemon.name.en}${suffix}`,
      },
      types: currentMega.types ?? displayPokemon.types,
      stats: currentMega.stats,
      talents: currentMega.talents ?? displayPokemon.talents,
      resistances: currentMega.resistances ?? displayPokemon.resistances,
    };
  }, [displayPokemon, currentMega]);
  const isMegaStats = !!currentMega?.stats;
  const baseStats = isMegaStats ? displayPokemon?.stats : undefined;

  // Calculer le BST (Base Stat Total)
  const getBst = (stats?: { hp: number; atk: number; def: number; spe_atk: number; spe_def: number; vit: number }) =>
    stats ? stats.hp + stats.atk + stats.def + stats.spe_atk + stats.spe_def + stats.vit : 0;
  const bst = useMemo(() => getBst(shownPokemon?.stats), [shownPokemon?.stats]);
  const bstDelta = baseStats ? bst - getBst(baseStats) : 0;

  // Types ajoutés par la Méga (ex : Dragon pour Méga-Dracaufeu X), mis en valeur
  const newMegaTypes = useMemo(() => {
    if (!isMegaStats || !displayPokemon) return new Set<string>();
    const baseTypes = new Set(displayPokemon.types?.map((t) => t.name));
    return new Set(shownPokemon?.types?.filter((t) => !baseTypes.has(t.name)).map((t) => t.name));
  }, [isMegaStats, displayPokemon, shownPokemon?.types]);

  // Vérifier si Gigamax disponible
  const hasGmax = displayPokemon?.sprites?.gmax?.regular;

  const handleFavoritePress = useCallback(() => {
    toggleFavorite(pokemonId);
  }, [pokemonId, toggleFavorite]);

  const toggleShiny = useCallback(() => {
    setIsShiny((prev) => !prev);
  }, []);

  const toggleGmax = useCallback(() => {
    setShowGmax((prev) => !prev);
    setMegaQualifier(null);
  }, []);

  const toggleMega = useCallback((qualifier: string) => {
    setMegaQualifier((prev) => (prev === qualifier ? null : qualifier));
    setShowGmax(false);
  }, []);

  const selectRegion = useCallback((newRegion: string | undefined) => {
    setRegion(newRegion);
    setShowGmax(false);
    setMegaQualifier(null);
  }, []);

  // Une évolution garde la forme régionale si elle en possède une (ex : Goupix d'Alola -> Feunard d'Alola)
  const getEvolutionRegion = useCallback((id: number) => {
    if (!region) return undefined;
    const target = allPokemon?.find((p) => p.pokedex_id === id);
    return target?.formes?.some((f) => f.region === region) ? region : undefined;
  }, [region, allPokemon]);

  // Navigation vers un autre Pokémon (évolution)
  const navigateToPokemon = useCallback((id: number, evolutionRegion?: string) => {
    navigation.push('PokemonDetail', { pokemonId: id, region: evolutionRegion });
  }, [navigation]);

  // Obtenir l'URL du sprite actuel
  const getCurrentSprite = useCallback(() => {
    if (!displayPokemon?.sprites) return '';

    if (currentMega) {
      return isShiny ? currentMega.sprites.shiny : currentMega.sprites.regular;
    }

    if (showGmax && displayPokemon.sprites.gmax) {
      return isShiny
        ? displayPokemon.sprites.gmax.shiny
        : displayPokemon.sprites.gmax.regular;
    }

    return isShiny
      ? displayPokemon.sprites.shiny
      : displayPokemon.sprites.regular;
  }, [displayPokemon?.sprites, isShiny, showGmax, currentMega]);

  if (isLoading && !displayPokemon) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Chargement des détails...</Text>
      </View>
    );
  }

  if (error && !displayPokemon) {
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
        <View style={[styles.header, { backgroundColor: getTypeColor(shownPokemon?.types?.[0]?.name || 'Normal') + (isDark ? '30' : '15') }]}>
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

              {megas.map((mega) => {
                const qualifier = mega.qualifier ?? '';
                const isSelected = currentMega?.key === mega.key;
                return (
                  <TouchableOpacity
                    key={mega.key}
                    style={[styles.spriteButton, styles.megaButton, isSelected && styles.spriteButtonActive]}
                    onPress={() => toggleMega(qualifier)}
                    accessibilityLabel={`Afficher ${mega.label}`}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                  >
                    <Text style={[styles.spriteButtonText, styles.megaButtonText]}>💎 {mega.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {currentMega && (
              <View style={styles.megaInfo}>
                {currentMega.orbe && (
                  <Text style={[styles.megaStone, { color: colors.textSecondary }]}>
                    Méga-Gemme : {currentMega.orbe}
                  </Text>
                )}
                {currentMega.orbeNote && (
                  <Text style={[styles.megaStone, { color: colors.textSecondary }]}>{currentMega.orbeNote}</Text>
                )}
                {!currentMega.stats && (
                  <Text style={[styles.megaStone, { color: colors.textMuted }]}>
                    {isLoadingMegas ? 'Chargement des stats Méga…' : 'Stats Méga indisponibles hors-ligne'}
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Sélecteur de forme régionale */}
          {regionalForms.length > 0 && (
            <View style={styles.formSelector}>
              {[undefined, ...regionalForms.map((f) => f.region)].map((formRegion) => {
                const isSelected = region === formRegion;
                return (
                  <TouchableOpacity
                    key={formRegion ?? 'normal'}
                    style={[
                      styles.formChip,
                      { backgroundColor: isSelected ? colors.primary : colors.surface, borderColor: colors.border },
                    ]}
                    onPress={() => selectRegion(formRegion)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                  >
                    <Text style={[styles.formChipText, { color: isSelected ? '#FFFFFF' : colors.text }]}>
                      {formRegion ? getRegionLabel(formRegion) : 'Normale'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          <View style={styles.basicInfo}>
            <Text style={[styles.pokemonNumber, { color: colors.textSecondary }]}>
              #{displayPokemon.pokedex_id.toString().padStart(3, '0')}
            </Text>
            <Text style={[styles.pokemonName, { color: colors.text }]}>{shownPokemon?.name.fr}</Text>
            <Text style={[styles.pokemonNameEn, { color: colors.textSecondary }]}>
              {shownPokemon?.name.en} • {shownPokemon?.name.jp}
            </Text>
            <Text style={[styles.category, { color: colors.textMuted }]}>{displayPokemon.category}</Text>
          </View>
        </View>

        {/* Types avec icônes */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Types</Text>
          <View style={styles.typesContainer}>
            {shownPokemon?.types?.map((type, index) => (
              <View
                key={index}
                style={[
                  styles.typeTag,
                  { backgroundColor: getTypeColor(type.name) },
                  newMegaTypes.has(type.name) && styles.typeTagNew,
                ]}
              >
                <Text style={styles.typeText}>
                  {type.name}{newMegaTypes.has(type.name) ? ' ✦' : ''}
                </Text>
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
              {bstDelta !== 0 && (
                <Text style={[styles.bstDelta, { color: bstDelta > 0 ? DELTA_UP : DELTA_DOWN }]}>
                  {formatDelta(bstDelta)}
                </Text>
              )}
            </View>
          </View>
          <View style={styles.statsContainer}>
            <StatBar label="PV" value={shownPokemon!.stats.hp} baseValue={baseStats?.hp} maxValue={255} color="#FF5959" colors={colors} />
            <StatBar label="Attaque" value={shownPokemon!.stats.atk} baseValue={baseStats?.atk} maxValue={255} color="#F5AC78" colors={colors} />
            <StatBar label="Défense" value={shownPokemon!.stats.def} baseValue={baseStats?.def} maxValue={255} color="#FAE078" colors={colors} />
            <StatBar label="Att. Spé" value={shownPokemon!.stats.spe_atk} baseValue={baseStats?.spe_atk} maxValue={255} color="#9DB7F5" colors={colors} />
            <StatBar label="Déf. Spé" value={shownPokemon!.stats.spe_def} baseValue={baseStats?.spe_def} maxValue={255} color="#A7DB8D" colors={colors} />
            <StatBar label="Vitesse" value={shownPokemon!.stats.vit} baseValue={baseStats?.vit} maxValue={255} color="#FA92B2" colors={colors} />
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
                      region={getEvolutionRegion(evo.pokedex_id)}
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
                      region={getEvolutionRegion(evo.pokedex_id)}
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
            {shownPokemon?.talents?.map((talent, index) => (
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
        {shownPokemon?.resistances && shownPokemon.resistances.length > 0 && (
          <ResistancesSection resistances={shownPokemon.resistances} colors={colors} />
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
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  megaButton: {
    backgroundColor: '#0EA5E9',
  },
  megaButtonText: {
    color: '#FFFFFF',
  },
  megaInfo: {
    alignItems: 'center',
    marginTop: 8,
    gap: 2,
  },
  megaStone: {
    fontSize: 12,
    fontWeight: '600',
  },
  statBaseMarker: {
    position: 'absolute',
    top: -2,
    bottom: -2,
    width: 2,
    marginLeft: -1,
    borderRadius: 1,
    opacity: 0.5,
  },
  statDelta: {
    width: 36,
    textAlign: 'right',
    fontSize: 12,
    fontWeight: '700',
  },
  bstDelta: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  typeTagNew: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  formSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  formChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  formChipText: {
    fontSize: 13,
    fontWeight: '600',
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

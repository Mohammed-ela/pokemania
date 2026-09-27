import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { CompareScreenProps } from '../types/navigation';
import { useTheme } from '../context/ThemeContext';
import { useAllPokemon } from '../hooks/usePokemon';
import { PokemonAPI } from '../services/pokemonApi';
import { Pokemon, PokemonStats } from '../types/pokemon';
import { getTypeColor } from '../utils/typeColors';
import { getAttackMultiplier } from '../utils/typeChart';

const blurhash = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4';

// Couleur attribuée à chaque côté de la comparaison
const SIDE_COLORS = ['#6366F1', '#F97316'] as const;

const STATS: { key: keyof PokemonStats; label: string }[] = [
  { key: 'hp', label: 'PV' },
  { key: 'atk', label: 'Attaque' },
  { key: 'def', label: 'Défense' },
  { key: 'spe_atk', label: 'Att. Spé' },
  { key: 'spe_def', label: 'Déf. Spé' },
  { key: 'vit', label: 'Vitesse' },
];

const MAX_STAT = 255;

const getBst = (stats: PokemonStats) =>
  stats.hp + stats.atk + stats.def + stats.spe_atk + stats.spe_def + stats.vit;

const formatMultiplier = (multiplier: number) =>
  multiplier === 0 ? '×0' : `×${Number.isInteger(multiplier) ? multiplier : multiplier.toString().replace('.', ',')}`;

const getMultiplierColor = (multiplier: number, fallback: string) => {
  if (multiplier === 0) return '#64748B';
  if (multiplier >= 4) return '#047857';
  if (multiplier >= 2) return '#16A34A';
  if (multiplier < 1) return '#DC2626';
  return fallback;
};

// Emplacement d'un Pokémon (vide ou rempli)
const PokemonSlot = memo<{
  pokemon?: Pokemon;
  sideColor: string;
  onPick: () => void;
  onClear: () => void;
  colors: any;
}>(({ pokemon, sideColor, onPick, onClear, colors }) => {
  if (!pokemon) {
    return (
      <TouchableOpacity
        style={[styles.slot, styles.slotEmpty, { borderColor: sideColor, backgroundColor: colors.surface }]}
        onPress={onPick}
        accessibilityRole="button"
        accessibilityLabel="Choisir un Pokémon"
      >
        <View style={[styles.slotPlus, { backgroundColor: sideColor }]}>
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </View>
        <Text style={[styles.slotEmptyText, { color: colors.textSecondary }]}>Choisir un Pokémon</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.slot, { borderColor: sideColor, backgroundColor: colors.surface }]}
      onPress={onPick}
      accessibilityRole="button"
      accessibilityLabel={`${pokemon.name.fr}, appuyer pour changer`}
    >
      <TouchableOpacity
        style={[styles.slotClear, { backgroundColor: colors.surfaceVariant }]}
        onPress={onClear}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={`Retirer ${pokemon.name.fr}`}
      >
        <Ionicons name="close" size={14} color={colors.textSecondary} />
      </TouchableOpacity>
      <Image
        source={{ uri: pokemon.sprites.regular }}
        style={styles.slotImage}
        contentFit="contain"
        placeholder={{ blurhash }}
        transition={200}
        cachePolicy="memory-disk"
      />
      <Text style={[styles.slotNumber, { color: colors.textMuted }]}>
        #{pokemon.pokedex_id.toString().padStart(3, '0')}
      </Text>
      <Text style={[styles.slotName, { color: colors.text }]} numberOfLines={1}>
        {pokemon.name.fr}
      </Text>
      <View style={styles.slotTypes}>
        {pokemon.types?.map((type) => (
          <View key={type.name} style={[styles.typeTag, { backgroundColor: getTypeColor(type.name) }]}>
            <Text style={styles.typeText}>{type.name}</Text>
          </View>
        ))}
      </View>
      <Text style={[styles.slotChange, { color: sideColor }]}>Changer</Text>
    </TouchableOpacity>
  );
});

// Ligne de stat : barres qui partent du centre vers chaque côté
const StatCompareRow = memo<{
  label: string;
  left: number;
  right: number;
  max: number;
  colors: any;
}>(({ label, left, right, max, colors }) => {
  const leftWins = left > right;
  const rightWins = right > left;

  return (
    <View style={styles.statRow} accessibilityLabel={`${label} : ${left} contre ${right}`}>
      <Text
        style={[
          styles.statValue,
          styles.statValueLeft,
          { color: leftWins ? SIDE_COLORS[0] : colors.textMuted },
          leftWins && styles.statValueWinner,
        ]}
      >
        {left}
      </Text>
      <View style={[styles.statTrack, styles.statTrackLeft, { backgroundColor: colors.border }]}>
        <View
          style={[
            styles.statBar,
            { width: `${Math.min((left / max) * 100, 100)}%`, backgroundColor: SIDE_COLORS[0], opacity: leftWins ? 1 : 0.4 },
          ]}
        />
      </View>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
      <View style={[styles.statTrack, { backgroundColor: colors.border }]}>
        <View
          style={[
            styles.statBar,
            { width: `${Math.min((right / max) * 100, 100)}%`, backgroundColor: SIDE_COLORS[1], opacity: rightWins ? 1 : 0.4 },
          ]}
        />
      </View>
      <Text
        style={[
          styles.statValue,
          { color: rightWins ? SIDE_COLORS[1] : colors.textMuted },
          rightWins && styles.statValueWinner,
        ]}
      >
        {right}
      </Text>
    </View>
  );
});

// Efficacité des types d'un Pokémon sur l'autre
const MatchupRow = memo<{
  attacker: Pokemon;
  defender: Pokemon;
  sideColor: string;
  colors: any;
}>(({ attacker, defender, sideColor, colors }) => {
  const defenseTypes = defender.types?.map((t) => t.name) ?? [];

  return (
    <View style={styles.matchupRow}>
      <View style={styles.matchupHeader}>
        <View style={[styles.matchupDot, { backgroundColor: sideColor }]} />
        <Text style={[styles.matchupTitle, { color: colors.text }]} numberOfLines={1}>
          {attacker.name.fr} → {defender.name.fr}
        </Text>
      </View>
      <View style={styles.matchupTypes}>
        {attacker.types?.map((type) => {
          const multiplier = getAttackMultiplier(type.name, defenseTypes);
          return (
            <View key={type.name} style={[styles.matchupChip, { backgroundColor: colors.surfaceVariant }]}>
              <View style={[styles.matchupTypeDot, { backgroundColor: getTypeColor(type.name) }]} />
              <Text style={[styles.matchupType, { color: colors.text }]}>{type.name}</Text>
              <Text style={[styles.matchupMultiplier, { color: getMultiplierColor(multiplier, colors.textSecondary) }]}>
                {formatMultiplier(multiplier)}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
});

// Sélecteur de Pokémon en plein écran
const PokemonPicker = memo<{
  visible: boolean;
  allPokemon: Pokemon[];
  isLoading: boolean;
  onSelect: (pokemon: Pokemon) => void;
  onClose: () => void;
  colors: any;
}>(({ visible, allPokemon, isLoading, onSelect, onClose, colors }) => {
  const [query, setQuery] = useState('');

  const results = useMemo(
    () => PokemonAPI.searchPokemon(query, allPokemon).filter((p) => p.pokedex_id > 0),
    [query, allPokemon]
  );

  const handleClose = useCallback(() => {
    setQuery('');
    onClose();
  }, [onClose]);

  const renderItem = useCallback(
    ({ item }: { item: Pokemon }) => (
      <TouchableOpacity
        style={[styles.pickerRow, { borderBottomColor: colors.border }]}
        onPress={() => {
          setQuery('');
          onSelect(item);
        }}
        accessibilityRole="button"
        accessibilityLabel={`Choisir ${item.name.fr}`}
      >
        <Image
          source={{ uri: item.sprites.regular }}
          style={styles.pickerImage}
          contentFit="contain"
          placeholder={{ blurhash }}
          cachePolicy="memory-disk"
        />
        <Text style={[styles.pickerNumber, { color: colors.textMuted }]}>
          #{item.pokedex_id.toString().padStart(3, '0')}
        </Text>
        <Text style={[styles.pickerName, { color: colors.text }]} numberOfLines={1}>
          {item.name.fr}
        </Text>
        <View style={styles.pickerTypes}>
          {item.types?.map((type) => (
            <View key={type.name} style={[styles.pickerTypeDot, { backgroundColor: getTypeColor(type.name) }]} />
          ))}
        </View>
      </TouchableOpacity>
    ),
    [colors, onSelect]
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <SafeAreaView style={[styles.pickerContainer, { backgroundColor: colors.background }]}>
        <View style={styles.pickerHeader}>
          <Text style={[styles.pickerTitle, { color: colors.text }]}>Choisir un Pokémon</Text>
          <TouchableOpacity onPress={handleClose} hitSlop={8} accessibilityRole="button" accessibilityLabel="Fermer">
            <Ionicons name="close-circle" size={28} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
        <View style={[styles.pickerSearch, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={[styles.pickerInput, { color: colors.text }]}
            placeholder="Nom ou numéro..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            autoFocus
            autoCorrect={false}
            returnKeyType="search"
          />
        </View>
        {isLoading ? (
          <ActivityIndicator style={styles.pickerLoading} size="large" color={colors.primary} />
        ) : (
          <FlatList
            data={results}
            renderItem={renderItem}
            keyExtractor={(item) => item.pokedex_id.toString()}
            keyboardShouldPersistTaps="handled"
            initialNumToRender={15}
            windowSize={7}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
});

const CompareScreen: React.FC<CompareScreenProps> = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { data: allPokemon = [], isLoading } = useAllPokemon();
  const [slots, setSlots] = useState<[number | null, number | null]>([null, null]);
  const [pickingSide, setPickingSide] = useState<0 | 1 | null>(null);

  // Pokémon envoyé depuis une fiche détail : premier emplacement libre
  const incomingId = route.params?.pokemonId;
  useEffect(() => {
    if (incomingId === undefined) return;
    setSlots(([left, right]) => {
      if (left === incomingId || right === incomingId) return [left, right];
      if (left === null) return [incomingId, right];
      return [left, incomingId];
    });
    navigation.setParams({ pokemonId: undefined });
  }, [incomingId, navigation]);

  const byId = useMemo(() => new Map(allPokemon.map((p) => [p.pokedex_id, p])), [allPokemon]);
  const left = slots[0] !== null ? byId.get(slots[0]) : undefined;
  const right = slots[1] !== null ? byId.get(slots[1]) : undefined;

  const handleSelect = useCallback(
    (pokemon: Pokemon) => {
      if (pickingSide === null) return;
      setSlots((prev) => {
        const next: [number | null, number | null] = [...prev];
        next[pickingSide] = pokemon.pokedex_id;
        return next;
      });
      setPickingSide(null);
    },
    [pickingSide]
  );

  const clearSlot = useCallback((side: 0 | 1) => {
    setSlots((prev) => {
      const next: [number | null, number | null] = [...prev];
      next[side] = null;
      return next;
    });
  }, []);

  const swap = useCallback(() => setSlots(([a, b]) => [b, a]), []);

  const summary = useMemo(() => {
    if (!left || !right) return null;
    let leftWins = 0;
    let rightWins = 0;
    STATS.forEach(({ key }) => {
      if (left.stats[key] > right.stats[key]) leftWins++;
      if (right.stats[key] > left.stats[key]) rightWins++;
    });
    return { leftWins, rightWins, leftBst: getBst(left.stats), rightBst: getBst(right.stats) };
  }, [left, right]);

  const bstMax = summary ? Math.max(summary.leftBst, summary.rightBst, 600) : 600;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Emplacements */}
        <View style={styles.slotsRow}>
          <PokemonSlot
            pokemon={left}
            sideColor={SIDE_COLORS[0]}
            onPick={() => setPickingSide(0)}
            onClear={() => clearSlot(0)}
            colors={colors}
          />
          <TouchableOpacity
            style={[styles.swapButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={swap}
            disabled={!left && !right}
            accessibilityRole="button"
            accessibilityLabel="Inverser les Pokémon"
          >
            <Ionicons name="swap-horizontal" size={20} color={colors.text} />
          </TouchableOpacity>
          <PokemonSlot
            pokemon={right}
            sideColor={SIDE_COLORS[1]}
            onPick={() => setPickingSide(1)}
            onClear={() => clearSlot(1)}
            colors={colors}
          />
        </View>

        {!left || !right ? (
          <View style={[styles.hint, { backgroundColor: colors.surface }]}>
            <Ionicons name="git-compare-outline" size={32} color={colors.textMuted} />
            <Text style={[styles.hintTitle, { color: colors.text }]}>
              {!left && !right ? 'Compare deux Pokémon' : 'Choisis un deuxième Pokémon'}
            </Text>
            <Text style={[styles.hintText, { color: colors.textSecondary }]}>
              Stats face à face, total des stats et efficacité des types. Tu peux aussi envoyer un Pokémon ici depuis sa fiche.
            </Text>
          </View>
        ) : (
          <>
            {/* Bilan */}
            {summary && (
              <View style={[styles.summary, { backgroundColor: colors.surface }]}>
                <Text style={[styles.summaryText, { color: colors.text }]}>
                  {summary.leftWins === summary.rightWins ? (
                    'Égalité sur les stats'
                  ) : (
                    <>
                      <Text style={{ color: summary.leftWins > summary.rightWins ? SIDE_COLORS[0] : SIDE_COLORS[1], fontWeight: '800' }}>
                        {summary.leftWins > summary.rightWins ? left.name.fr : right.name.fr}
                      </Text>
                      {` domine sur ${Math.max(summary.leftWins, summary.rightWins)} stats sur 6`}
                    </>
                  )}
                </Text>
              </View>
            )}

            {/* Stats */}
            <View style={[styles.section, { backgroundColor: colors.surface }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Statistiques</Text>
              {STATS.map(({ key, label }) => (
                <StatCompareRow
                  key={key}
                  label={label}
                  left={left.stats[key]}
                  right={right.stats[key]}
                  max={MAX_STAT}
                  colors={colors}
                />
              ))}
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              {summary && (
                <StatCompareRow
                  label="Total"
                  left={summary.leftBst}
                  right={summary.rightBst}
                  max={bstMax}
                  colors={colors}
                />
              )}
            </View>

            {/* Efficacité des types */}
            <View style={[styles.section, { backgroundColor: colors.surface }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Efficacité des types</Text>
              <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
                Dégâts des attaques du même type que le Pokémon
              </Text>
              <MatchupRow attacker={left} defender={right} sideColor={SIDE_COLORS[0]} colors={colors} />
              <MatchupRow attacker={right} defender={left} sideColor={SIDE_COLORS[1]} colors={colors} />
            </View>

            {/* Accès aux fiches */}
            <View style={styles.detailButtons}>
              {[left, right].map((pokemon, index) => (
                <TouchableOpacity
                  key={pokemon.pokedex_id}
                  style={[styles.detailButton, { borderColor: SIDE_COLORS[index] }]}
                  onPress={() => navigation.navigate('PokemonDetail', { pokemonId: pokemon.pokedex_id, pokemon })}
                  accessibilityRole="button"
                >
                  <Text style={[styles.detailButtonText, { color: SIDE_COLORS[index] }]} numberOfLines={1}>
                    Fiche {pokemon.name.fr}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      <PokemonPicker
        visible={pickingSide !== null}
        allPokemon={allPokemon}
        isLoading={isLoading}
        onSelect={handleSelect}
        onClose={() => setPickingSide(null)}
        colors={colors}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  // Emplacements
  slotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slot: {
    flex: 1,
    minHeight: 200,
    borderRadius: 16,
    borderWidth: 2,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotEmpty: {
    borderStyle: 'dashed',
    gap: 10,
  },
  slotPlus: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotEmptyText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  slotClear: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  slotImage: {
    width: 88,
    height: 88,
  },
  slotNumber: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
  slotName: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  slotTypes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 4,
    marginTop: 6,
  },
  slotChange: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 8,
  },
  typeTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  typeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  swapButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: -8,
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  // Indication
  hint: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  hintTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  hintText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  // Bilan
  summary: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  // Sections
  section: {
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  sectionSubtitle: {
    fontSize: 12,
    marginTop: -8,
  },
  divider: {
    height: 1,
  },
  // Stats
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    width: 34,
    fontSize: 14,
    fontWeight: '600',
  },
  statValueLeft: {
    textAlign: 'right',
  },
  statValueWinner: {
    fontWeight: '900',
  },
  statTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  statTrackLeft: {
    // La barre de gauche grandit vers la gauche, depuis le centre
    transform: [{ scaleX: -1 }],
  },
  statBar: {
    height: '100%',
    borderRadius: 4,
  },
  statLabel: {
    width: 62,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  // Efficacité des types
  matchupRow: {
    gap: 8,
  },
  matchupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  matchupDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  matchupTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
  },
  matchupTypes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  matchupChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  matchupTypeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  matchupType: {
    fontSize: 13,
    fontWeight: '600',
  },
  matchupMultiplier: {
    fontSize: 14,
    fontWeight: '900',
  },
  // Accès aux fiches
  detailButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  detailButton: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  detailButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  // Sélecteur
  pickerContainer: {
    flex: 1,
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  pickerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  pickerSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  pickerInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
  },
  pickerLoading: {
    marginTop: 40,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  pickerImage: {
    width: 44,
    height: 44,
  },
  pickerNumber: {
    width: 44,
    fontSize: 12,
    fontWeight: '700',
  },
  pickerName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  pickerTypes: {
    flexDirection: 'row',
    gap: 4,
  },
  pickerTypeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});

export default CompareScreen;

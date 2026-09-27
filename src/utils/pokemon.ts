import { PokemonStats } from '../types/pokemon';

// Libellés des stats, dans l'ordre des jeux
export const STAT_LABELS: { key: keyof PokemonStats; label: string; short: string }[] = [
  { key: 'hp', label: 'PV', short: 'PV' },
  { key: 'atk', label: 'Attaque', short: 'Att' },
  { key: 'def', label: 'Défense', short: 'Déf' },
  { key: 'spe_atk', label: 'Att. Spé', short: 'Att.Spé' },
  { key: 'spe_def', label: 'Déf. Spé', short: 'Déf.Spé' },
  { key: 'vit', label: 'Vitesse', short: 'Vit' },
];

// Total des stats de base (BST)
export const getBst = (stats: PokemonStats): number =>
  stats.hp + stats.atk + stats.def + stats.spe_atk + stats.spe_def + stats.vit;

// Minuscules sans accents, pour la recherche et le tri : "Électhor" -> "electhor"
export const normalizeText = (text: string): string =>
  text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

export const formatPokedexNumber = (id: number): string => `#${id.toString().padStart(3, '0')}`;

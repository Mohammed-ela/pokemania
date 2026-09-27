import { PokemonResistance } from '../types/pokemon';

// Table des types (Gen 6+) : multiplicateur d'une attaque (clé) sur un type défenseur
// Seules les valeurs différentes de 1 sont listées
const TYPE_CHART: Record<string, Record<string, number>> = {
  Normal: { Roche: 0.5, Spectre: 0, Acier: 0.5 },
  Feu: { Feu: 0.5, Eau: 0.5, Plante: 2, Glace: 2, Insecte: 2, Roche: 0.5, Dragon: 0.5, Acier: 2 },
  Eau: { Feu: 2, Eau: 0.5, Plante: 0.5, Sol: 2, Roche: 2, Dragon: 0.5 },
  Électrik: { Eau: 2, Électrik: 0.5, Plante: 0.5, Sol: 0, Vol: 2, Dragon: 0.5 },
  Plante: { Feu: 0.5, Eau: 2, Plante: 0.5, Poison: 0.5, Sol: 2, Vol: 0.5, Insecte: 0.5, Roche: 2, Dragon: 0.5, Acier: 0.5 },
  Glace: { Feu: 0.5, Eau: 0.5, Plante: 2, Glace: 0.5, Sol: 2, Vol: 2, Dragon: 2, Acier: 0.5 },
  Combat: { Normal: 2, Glace: 2, Poison: 0.5, Vol: 0.5, Psy: 0.5, Insecte: 0.5, Roche: 2, Spectre: 0, Ténèbres: 2, Acier: 2, Fée: 0.5 },
  Poison: { Plante: 2, Poison: 0.5, Sol: 0.5, Roche: 0.5, Spectre: 0.5, Acier: 0, Fée: 2 },
  Sol: { Feu: 2, Électrik: 2, Plante: 0.5, Poison: 2, Vol: 0, Insecte: 0.5, Roche: 2, Acier: 2 },
  Vol: { Électrik: 0.5, Plante: 2, Combat: 2, Insecte: 2, Roche: 0.5, Acier: 0.5 },
  Psy: { Combat: 2, Poison: 2, Psy: 0.5, Ténèbres: 0, Acier: 0.5 },
  Insecte: { Feu: 0.5, Plante: 2, Combat: 0.5, Poison: 0.5, Vol: 0.5, Psy: 2, Spectre: 0.5, Ténèbres: 2, Acier: 0.5, Fée: 0.5 },
  Roche: { Feu: 2, Glace: 2, Combat: 0.5, Sol: 0.5, Vol: 2, Insecte: 2, Acier: 0.5 },
  Spectre: { Normal: 0, Psy: 2, Spectre: 2, Ténèbres: 0.5 },
  Dragon: { Dragon: 2, Acier: 0.5, Fée: 0 },
  Ténèbres: { Combat: 0.5, Psy: 2, Spectre: 2, Ténèbres: 0.5, Fée: 0.5 },
  Acier: { Feu: 0.5, Eau: 0.5, Électrik: 0.5, Glace: 2, Roche: 2, Acier: 0.5, Fée: 2 },
  Fée: { Feu: 0.5, Combat: 2, Poison: 0.5, Dragon: 2, Ténèbres: 2, Acier: 0.5 },
};

export const ALL_TYPES = Object.keys(TYPE_CHART);

/**
 * Multiplicateur d'une attaque d'un type donné sur une combinaison de types défenseurs
 */
export const getAttackMultiplier = (attackType: string, defenseTypes: string[]): number =>
  defenseTypes.reduce((total, defenseType) => total * (TYPE_CHART[attackType]?.[defenseType] ?? 1), 1);

// Talents qui modifient les dégâts reçus (noms PokéAPI), comme le fait Tyradex pour ses faiblesses
const ABILITY_MODIFIERS: Record<string, Record<string, number>> = {
  levitate: { Sol: 0 },
  'earth-eater': { Sol: 0 },
  'lightning-rod': { Électrik: 0 },
  'volt-absorb': { Électrik: 0 },
  'motor-drive': { Électrik: 0 },
  'flash-fire': { Feu: 0 },
  'well-baked-body': { Feu: 0 },
  'water-absorb': { Eau: 0 },
  'storm-drain': { Eau: 0 },
  'dry-skin': { Eau: 0, Feu: 1.25 },
  'sap-sipper': { Plante: 0 },
  'thick-fat': { Feu: 0.5, Glace: 0.5 },
  heatproof: { Feu: 0.5 },
  'water-bubble': { Feu: 0.5 },
  'purifying-salt': { Spectre: 0.5 },
  fluffy: { Feu: 2 },
};

/**
 * Calcule les faiblesses/résistances d'une combinaison de types,
 * en tenant compte d'un éventuel talent (ex : Lévitation)
 */
export const computeResistances = (types: string[], abilities: string[] = []): PokemonResistance[] =>
  ALL_TYPES.map((attackType) => {
    let multiplier = types.reduce(
      (total, defenseType) => total * (TYPE_CHART[attackType][defenseType] ?? 1),
      1
    );
    abilities.forEach((ability) => {
      multiplier *= ABILITY_MODIFIERS[ability]?.[attackType] ?? 1;
    });
    return { name: attackType, multiplier };
  });

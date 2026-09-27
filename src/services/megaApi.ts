import axios from 'axios';
import { PokemonEvolution, PokemonResistance, PokemonStats, PokemonType } from '../types/pokemon';
import { computeResistances } from '../utils/typeChart';

// Tyradex ne fournit ni les stats ni les types des Méga-évolutions (et en oublie beaucoup) :
// on les complète avec PokéAPI
const pokeApiClient = axios.create({
  baseURL: 'https://pokeapi.co/api/v2',
  timeout: 10000,
});

const TYPE_NAMES_FR: Record<string, string> = {
  normal: 'Normal',
  fire: 'Feu',
  water: 'Eau',
  electric: 'Électrik',
  grass: 'Plante',
  ice: 'Glace',
  fighting: 'Combat',
  poison: 'Poison',
  ground: 'Sol',
  flying: 'Vol',
  psychic: 'Psy',
  bug: 'Insecte',
  rock: 'Roche',
  ghost: 'Spectre',
  dragon: 'Dragon',
  dark: 'Ténèbres',
  steel: 'Acier',
  fairy: 'Fée',
};

const QUALIFIER_LABELS: Record<string, string> = {
  x: 'X',
  y: 'Y',
  z: 'Z',
  male: '♂',
  female: '♀',
  curly: 'Courbée',
  droopy: 'Affalée',
  stretchy: 'Raide',
  original: 'Originelle',
};

const STAT_KEYS: Record<string, keyof PokemonStats> = {
  hp: 'hp',
  attack: 'atk',
  defense: 'def',
  'special-attack': 'spe_atk',
  'special-defense': 'spe_def',
  speed: 'vit',
};

// Même nommage que les images de types Tyradex (ex : "Électrik" -> electrik.png)
const getTypeImage = (name: string) =>
  `https://raw.githubusercontent.com/Yarkis01/TyraDex/images/types/${name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()}.png`;

// Méga-Gemmes (source : Poképédia), par nom de variété PokéAPI
const MEGA_STONES: Record<string, string> = {
  'venusaur-mega': 'Florizarrite',
  'charizard-mega-x': 'Dracaufite X',
  'charizard-mega-y': 'Dracaufite Y',
  'blastoise-mega': 'Tortankite',
  'beedrill-mega': 'Dardargnite',
  'pidgeot-mega': 'Roucarnagite',
  'raichu-mega-x': 'Raichuïte X',
  'raichu-mega-y': 'Raichuïte Y',
  'clefable-mega': 'Mélodelfite',
  'alakazam-mega': 'Alakazamite',
  'victreebel-mega': 'Empiflorite',
  'slowbro-mega': 'Flagadossite',
  'gengar-mega': 'Ectoplasmite',
  'kangaskhan-mega': 'Kangourexite',
  'starmie-mega': 'Starossite',
  'pinsir-mega': 'Scarabruite',
  'gyarados-mega': 'Léviatorite',
  'aerodactyl-mega': 'Ptéraïte',
  'dragonite-mega': 'Dracolossite',
  'mewtwo-mega-x': 'Mewtwoïte X',
  'mewtwo-mega-y': 'Mewtwoïte Y',
  'meganium-mega': 'Méganiumite',
  'feraligatr-mega': 'Aligatueurite',
  'ampharos-mega': 'Pharampite',
  'steelix-mega': 'Steelixite',
  'scizor-mega': 'Cizayoxite',
  'heracross-mega': 'Scarhinoïte',
  'skarmory-mega': 'Airmurite',
  'houndoom-mega': 'Démolossite',
  'tyranitar-mega': 'Tyranocivite',
  'sceptile-mega': 'Jungkite',
  'blaziken-mega': 'Braségalite',
  'swampert-mega': 'Laggronite',
  'gardevoir-mega': 'Gardevoirite',
  'sableye-mega': 'Ténéfixite',
  'mawile-mega': 'Mysdibulite',
  'aggron-mega': 'Galekingite',
  'medicham-mega': 'Charminite',
  'manectric-mega': 'Élecsprintite',
  'sharpedo-mega': 'Sharpedite',
  'camerupt-mega': 'Caméruptite',
  'altaria-mega': 'Altarite',
  'banette-mega': 'Branettite',
  'chimecho-mega': 'Éokite',
  'absol-mega': 'Absolite',
  'absol-mega-z': 'Absolite Z',
  'glalie-mega': 'Oniglalite',
  'salamence-mega': 'Drattakite',
  'metagross-mega': 'Métalossite',
  'latias-mega': 'Latiasite',
  'latios-mega': 'Latiosite',
  'staraptor-mega': 'Étouraptorite',
  'lopunny-mega': 'Lockpinite',
  'garchomp-mega': 'Carchacrokite',
  'garchomp-mega-z': 'Carchacrokite Z',
  'lucario-mega': 'Lucarite',
  'lucario-mega-z': 'Lucarite Z',
  'abomasnow-mega': 'Blizzarite',
  'gallade-mega': 'Gallamite',
  'froslass-mega': 'Momartikite',
  'heatran-mega': 'Heatranite',
  'darkrai-mega': 'Darkraïte',
  'emboar-mega': 'Roitiflamite',
  'excadrill-mega': 'Minotaupite',
  'audino-mega': 'Nanméouïte',
  'scolipede-mega': 'Brutapodite',
  'scrafty-mega': 'Baggaïdite',
  'eelektross-mega': 'Ohmassacrite',
  'chandelure-mega': 'Lugulabrite',
  'golurk-mega': 'Golemastokite',
  'chesnaught-mega': 'Blindépiquite',
  'delphox-mega': 'Goupelinite',
  'greninja-mega': 'Amphinolite',
  'pyroar-mega': 'Néméliosite',
  'floette-mega': 'Floettite',
  'meowstic-male-mega': 'Mistigrixite',
  'meowstic-female-mega': 'Mistigrixite',
  'malamar-mega': 'Sepiatrocite',
  'barbaracle-mega': 'Golgopathite',
  'dragalge-mega': 'Kravarekite',
  'hawlucha-mega': 'Brutalibrite',
  'zygarde-mega': 'Zygardite',
  'diancie-mega': 'Diancite',
  'crabominable-mega': 'Crabominablite',
  'golisopod-mega': 'Sarmuraïte',
  'drampa-mega': 'Draïeulite',
  'magearna-mega': 'Magearnite',
  'magearna-original-mega': 'Magearnite',
  'zeraora-mega': 'Zeraorite',
  'falinks-mega': 'Hexadronite',
  'scovillain-mega': 'Scovilainite',
  'glimmora-mega': 'Floréclatite',
  'tatsugiri-curly-mega': 'Nigirigonite',
  'tatsugiri-droopy-mega': 'Nigirigonite',
  'tatsugiri-stretchy-mega': 'Nigirigonite',
  'baxcalibur-mega': 'Glaivodite',
};

// Rayquaza n'a pas de Méga-Gemme
const MEGA_STONE_NOTES: Record<string, string> = {
  'rayquaza-mega': 'Doit connaître Draco Ascension',
};

export interface MegaForm {
  key: string;
  label: string; // "Méga", "Méga X", "Méga ♀"...
  qualifier?: string;
  orbe?: string;
  orbeNote?: string;
  sprites: { regular: string; shiny: string };
  // Absents si PokéAPI n'a pas pu être joint : on affiche alors seulement l'image
  stats?: PokemonStats;
  types?: PokemonType[];
  talents?: { name: string; tc: boolean }[];
  resistances?: PokemonResistance[];
}

export interface PokeApiMega {
  key: string;
  qualifier?: string;
  stats: PokemonStats;
  types: PokemonType[];
  talents: { name: string; tc: boolean }[];
  resistances: PokemonResistance[];
  sprites: { regular: string; shiny: string };
}

// "charizard-mega-x" -> "X", "meowstic-female-mega" -> "♀", "venusaur-mega" -> undefined
const getQualifier = (varietyName: string, speciesName: string): string | undefined => {
  const parts = varietyName
    .replace(speciesName, '')
    .split('-')
    .filter((part) => part && part !== 'mega');
  if (parts.length === 0) return undefined;
  return parts
    .map((part) => QUALIFIER_LABELS[part] ?? part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const getFrenchName = async (url: string, fallback: string): Promise<string> => {
  try {
    const { data } = await axios.get(url, { timeout: 10000 });
    return data.names?.find((n: any) => n.language?.name === 'fr')?.name ?? fallback;
  } catch {
    return fallback;
  }
};

export class MegaAPI {
  /**
   * Récupère toutes les Méga-évolutions d'une espèce depuis PokéAPI
   */
  static async getMegaForms(pokedexId: number): Promise<PokeApiMega[]> {
    const { data: species } = await pokeApiClient.get(`/pokemon-species/${pokedexId}`);
    const megaVarieties: string[] = species.varieties
      .map((v: any) => v.pokemon.name as string)
      .filter((name: string) => name.split('-').includes('mega'));

    return Promise.all(
      megaVarieties.map(async (varietyName) => {
        const { data } = await pokeApiClient.get(`/pokemon/${varietyName}`);

        const stats = {} as PokemonStats;
        data.stats.forEach((s: any) => {
          const key = STAT_KEYS[s.stat.name];
          if (key) stats[key] = s.base_stat;
        });

        const types: PokemonType[] = data.types.map((t: any) => {
          const name = TYPE_NAMES_FR[t.type.name] ?? t.type.name;
          return { name, image: getTypeImage(name) };
        });

        const abilityNames: string[] = data.abilities.map((a: any) => a.ability.name);
        const talents = await Promise.all(
          data.abilities.map(async (a: any) => ({
            name: await getFrenchName(a.ability.url, a.ability.name),
            tc: a.is_hidden,
          }))
        );

        const home = data.sprites?.other?.home;
        const artwork = data.sprites?.other?.['official-artwork'];

        return {
          key: varietyName,
          qualifier: getQualifier(varietyName, species.name),
          stats,
          types,
          talents,
          resistances: computeResistances(types.map((t) => t.name), abilityNames),
          sprites: {
            regular: home?.front_default ?? artwork?.front_default ?? data.sprites?.front_default ?? '',
            shiny: home?.front_shiny ?? artwork?.front_shiny ?? data.sprites?.front_shiny ?? '',
          },
        };
      })
    );
  }
}

// "Dracaufite X" -> "X" (seulement quand le Pokémon a plusieurs Méga)
const getOrbeQualifier = (orbe: string, megaCount: number) => {
  if (megaCount <= 1) return undefined;
  const suffix = orbe.trim().split(' ').pop();
  return suffix && suffix.length <= 2 ? suffix.toUpperCase() : undefined;
};

const buildLabel = (qualifier?: string) => (qualifier ? `Méga ${qualifier}` : 'Méga');

/**
 * Fusionne les Méga de Tyradex (image + Méga-Gemme) avec celles de PokéAPI (stats, types, talent).
 * Les images Tyradex sont gardées quand elles existent pour rester cohérent avec le reste de l'appli.
 */
export const mergeMegaForms = (
  tyradexMegas: NonNullable<PokemonEvolution['mega']>,
  apiMegas: PokeApiMega[] | undefined
): MegaForm[] => {
  const tyradex = tyradexMegas.map((mega) => ({
    ...mega,
    qualifier: getOrbeQualifier(mega.orbe, tyradexMegas.length),
  }));

  if (!apiMegas || apiMegas.length === 0) {
    return tyradex.map((mega) => ({
      key: mega.orbe,
      label: buildLabel(mega.qualifier),
      qualifier: mega.qualifier,
      orbe: mega.orbe,
      sprites: mega.sprites,
    }));
  }

  return apiMegas.map((api) => {
    const match = tyradex.find((mega) => mega.qualifier === api.qualifier);
    return {
      key: api.key,
      label: buildLabel(api.qualifier),
      qualifier: api.qualifier,
      orbe: MEGA_STONES[api.key] ?? match?.orbe,
      orbeNote: MEGA_STONE_NOTES[api.key],
      sprites: match?.sprites ?? api.sprites,
      stats: api.stats,
      types: api.types,
      talents: api.talents,
      resistances: api.resistances,
    };
  });
};

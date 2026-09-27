import { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Pokemon } from './pokemon';

// Onglets de la barre du bas
export type TabParamList = {
  Search: undefined;
  Favorites: undefined;
  Pokedex: undefined;
  Compare: {
    // Pokémon envoyé depuis une fiche détail pour être comparé
    pokemonId?: number;
  } | undefined;
  Settings: undefined;
};

// Pile principale : les onglets, puis les écrans ouverts par-dessus
export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList>;
  PokemonDetail: {
    pokemonId: number;
    pokemon?: Pokemon;
    region?: string;
  };
  SearchResults: {
    filters: {
      searchTerm?: string;
      type?: string;
      generation?: number;
    };
  };
};

type TabScreenProps<T extends keyof TabParamList> = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;

// Types de props pour chaque écran
export type PokemonListScreenProps = TabScreenProps<'Pokedex'>;
export type FavoritesScreenProps = TabScreenProps<'Favorites'>;
export type SearchScreenProps = TabScreenProps<'Search'>;
export type CompareScreenProps = TabScreenProps<'Compare'>;
export type SettingsScreenProps = TabScreenProps<'Settings'>;
export type PokemonDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'PokemonDetail'>;
export type SearchResultsScreenProps = NativeStackScreenProps<RootStackParamList, 'SearchResults'>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

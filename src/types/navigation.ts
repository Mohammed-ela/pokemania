import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pokemon } from './pokemon';

// Définition des paramètres de navigation
export type RootStackParamList = {
  Home: undefined;
  PokemonList: undefined;
  PokemonDetail: {
    pokemonId: number;
    pokemon?: Pokemon;
  };
  Favorites: undefined;
  Search: {
    filters?: {
      type?: string;
      generation?: number;
    };
  };
  SearchResults: {
    filters: {
      searchTerm?: string;
      type?: string;
      generation?: number;
    };
  };
  Settings: undefined;
};

// Types de props pour chaque écran
export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
export type PokemonListScreenProps = NativeStackScreenProps<RootStackParamList, 'PokemonList'>;
export type PokemonDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'PokemonDetail'>;
export type FavoritesScreenProps = NativeStackScreenProps<RootStackParamList, 'Favorites'>;
export type SearchScreenProps = NativeStackScreenProps<RootStackParamList, 'Search'>;
export type SearchResultsScreenProps = NativeStackScreenProps<RootStackParamList, 'SearchResults'>;
export type SettingsScreenProps = NativeStackScreenProps<RootStackParamList, 'Settings'>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

// Import des écrans
import HomeScreen from '../screens/HomeScreen';
import PokemonListScreen from '../screens/PokemonListScreen';
import PokemonDetailScreen from '../screens/PokemonDetailScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import SearchScreen from '../screens/SearchScreen';
import SearchResultsScreen from '../screens/SearchResultsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#DC2626', // Rouge Pokémon
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: '800',
            fontSize: 18,
          },
          headerShadowVisible: true,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Pokemania',
            headerStyle: {
              backgroundColor: '#DC2626',
            },
          }}
        />
        
        <Stack.Screen
          name="PokemonList"
          component={PokemonListScreen}
          options={{
            title: 'Liste des Pokémon',
          }}
        />
        
        <Stack.Screen
          name="PokemonDetail"
          component={PokemonDetailScreen}
          options={({ route }) => ({
            title: route.params?.pokemon?.name.fr || 'Détails du Pokémon',
          })}
        />
        
        <Stack.Screen
          name="Favorites"
          component={FavoritesScreen}
          options={{
            title: 'Mes Favoris',
          }}
        />
        
        <Stack.Screen
          name="Search"
          component={SearchScreen}
          options={{
            title: 'Recherche Avancée',
          }}
        />
        
        <Stack.Screen
          name="SearchResults"
          component={SearchResultsScreen}
          options={{
            title: 'Résultats de recherche',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

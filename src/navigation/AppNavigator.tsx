import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator, BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, TabParamList } from '../types/navigation';
import { useTheme } from '../context/ThemeContext';
import PokeballIcon from '../components/PokeballIcon';

// Import des écrans
import PokemonListScreen from '../screens/PokemonListScreen';
import PokemonDetailScreen from '../screens/PokemonDetailScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import SearchScreen from '../screens/SearchScreen';
import SearchResultsScreen from '../screens/SearchResultsScreen';
import CompareScreen from '../screens/CompareScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const CENTER_BUTTON_SIZE = 64;

// Bouton central du Pokédex, surélevé au-dessus de la barre
const PokedexTabButton: React.FC<BottomTabBarButtonProps> = ({ onPress, onLongPress, ...props }) => {
  const { colors } = useTheme();
  const focused = props['aria-selected'] ?? props.accessibilityState?.selected ?? false;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.centerWrapper}
      accessibilityRole="tab"
      accessibilityLabel="Pokédex"
      accessibilityState={{ selected: focused }}
    >
      <View
        style={[
          styles.centerButton,
          {
            backgroundColor: colors.surface,
            borderColor: focused ? colors.primary : colors.border,
            shadowColor: focused ? colors.primary : '#000',
          },
        ]}
      >
        <PokeballIcon size={42} />
      </View>
      <Text style={[styles.centerLabel, { color: focused ? colors.primary : colors.textMuted }]}>
        Pokédex
      </Text>
    </Pressable>
  );
};

const TAB_ICONS: Record<Exclude<keyof TabParamList, 'Pokedex'>, [keyof typeof Ionicons.glyphMap, keyof typeof Ionicons.glyphMap]> = {
  Search: ['search', 'search-outline'],
  Favorites: ['heart', 'heart-outline'],
  Compare: ['git-compare', 'git-compare-outline'],
  Settings: ['settings', 'settings-outline'],
};

const TabNavigator: React.FC = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="Pokedex"
      screenOptions={({ route }) => ({
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 17,
          color: colors.text,
        },
        headerShadowVisible: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'Pokedex') return null;
          const [active, inactive] = TAB_ICONS[route.name];
          return <Ionicons name={focused ? active : inactive} size={size - 2} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{ title: 'Recherche avancée', tabBarLabel: 'Recherche' }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{ title: 'Mes favoris', tabBarLabel: 'Favoris' }}
      />
      <Tab.Screen
        name="Pokedex"
        component={PokemonListScreen}
        options={{
          title: 'Pokédex',
          tabBarButton: (props) => <PokedexTabButton {...props} />,
        }}
      />
      <Tab.Screen
        name="Compare"
        component={CompareScreen}
        options={{ title: 'Comparer', tabBarLabel: 'Comparer' }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Réglages', tabBarLabel: 'Réglages' }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator: React.FC = () => {
  const { colors } = useTheme();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 17,
            color: colors.text,
          },
          headerShadowVisible: false,
          headerBackButtonDisplayMode: 'minimal',
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen
          name="Tabs"
          component={TabNavigator}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="PokemonDetail"
          component={PokemonDetailScreen}
          options={({ route }) => ({
            title: route.params?.pokemon?.name.fr || 'Détails du Pokémon',
          })}
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

const styles = StyleSheet.create({
  centerWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 4,
  },
  centerButton: {
    width: CENTER_BUTTON_SIZE,
    height: CENTER_BUTTON_SIZE,
    borderRadius: CENTER_BUTTON_SIZE / 2,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    // Déborde au-dessus de la barre pour être mis en évidence
    marginTop: -CENTER_BUTTON_SIZE / 2,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  centerLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
});

export default AppNavigator;

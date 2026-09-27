import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { FavoritesProvider } from './src/context/FavoritesContext';
import AppNavigator from './src/navigation/AppNavigator';

// Configuration du client React Query avec cache optimisé
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 1000 * 60 * 5, // 5 minutes avant "stale"
      gcTime: 1000 * 60 * 60 * 24, // 24 heures de cache (pour le mode hors-ligne)
    },
  },
});

// Persisteur AsyncStorage pour le mode hors-ligne
// Les données Pokémon seront disponibles même sans connexion
const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'pokemania-cache',
  throttleTime: 1000, // Évite les écritures trop fréquentes
});

// La barre d'état suit le thème de l'appli, pas celui du téléphone
function ThemedStatusBar() {
  const { isDark } = useTheme();
  return <StatusBar style={isDark ? 'light' : 'dark'} />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{
            persister: asyncStoragePersister,
            maxAge: 1000 * 60 * 60 * 24 * 7, // Cache persisté 7 jours
            dehydrateOptions: {
              shouldDehydrateQuery: (query) => {
                // Ne persiste que les requêtes réussies
                return query.state.status === 'success';
              },
            },
          }}
        >
          <FavoritesProvider>
            <AppNavigator />
          </FavoritesProvider>
          <ThemedStatusBar />
        </PersistQueryClientProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

export default function App() {
  return (
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
      <AppNavigator />
      <StatusBar style="light" />
    </PersistQueryClientProvider>
  );
}

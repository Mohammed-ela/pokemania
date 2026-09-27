import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';

export type ThemePreference = 'system' | 'light' | 'dark';
type ThemeMode = 'light' | 'dark';

interface ThemeColors {
  background: string;
  surface: string;
  surfaceVariant: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  primary: string;
  primaryLight: string;
}

interface ThemeContextType {
  mode: ThemeMode;
  preference: ThemePreference;
  colors: ThemeColors;
  setPreference: (preference: ThemePreference) => void;
  isDark: boolean;
}

const lightColors: ThemeColors = {
  background: '#F1F5F9',
  surface: '#FFFFFF',
  surfaceVariant: '#F8FAFC',
  text: '#1E293B',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  primary: '#DC2626',
  primaryLight: 'rgba(220, 38, 38, 0.08)',
};

const darkColors: ThemeColors = {
  background: '#0F172A',
  surface: '#1E293B',
  surfaceVariant: '#334155',
  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  border: '#334155',
  primary: '#EF4444',
  primaryLight: 'rgba(239, 68, 68, 0.15)',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'pokemania-theme';

// Garde l'écran de démarrage affiché tant que le thème n'est pas chargé (évite le flash clair)
SplashScreen.preventAutoHideAsync().catch(() => {});

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [isReady]);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === 'system' || savedTheme === 'dark' || savedTheme === 'light') {
        setPreferenceState(savedTheme);
      }
    } catch (error) {
      // Utiliser le thème par défaut
    } finally {
      setIsReady(true);
    }
  };

  const setPreference = useCallback((newPreference: ThemePreference) => {
    setPreferenceState(newPreference);
    AsyncStorage.setItem(THEME_STORAGE_KEY, newPreference).catch(() => {
      // Ignorer l'erreur de sauvegarde
    });
  }, []);

  const mode: ThemeMode =
    preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference;

  // Valeur stable : les écrans ne se redessinent que si le thème change vraiment
  const value = useMemo(
    () => ({
      mode,
      preference,
      colors: mode === 'light' ? lightColors : darkColors,
      setPreference,
      isDark: mode === 'dark',
    }),
    [mode, preference, setPreference]
  );

  if (!isReady) return null;

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

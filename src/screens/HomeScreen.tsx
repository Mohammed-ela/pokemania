import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HomeScreenProps } from '../types/navigation';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');
const APP_VERSION = '1.0.0';

// Composant Pokéball stylée
const PokeballLogo: React.FC = () => {
  return (
    <View style={styles.pokeballWrapper}>
      {/* Cercle décoratif en arrière-plan */}
      <View style={styles.pokeballHalo} />

      {/* Éléments décoratifs flottants */}
      <View style={[styles.sparkle, styles.sparkle1]}>
        <Text style={styles.sparkleText}>✨</Text>
      </View>
      <View style={[styles.sparkle, styles.sparkle2]}>
        <Text style={styles.sparkleText}>⭐</Text>
      </View>
      <View style={[styles.sparkle, styles.sparkle3]}>
        <Text style={styles.sparkleText}>✨</Text>
      </View>

      {/* Pokéball principale */}
      <View style={styles.pokeballContainer}>
        {/* Partie supérieure rouge */}
        <View style={styles.pokeballTop} />

        {/* Bande centrale noire */}
        <View style={styles.pokeballMiddle}>
          {/* Cercle central blanc */}
          <View style={styles.pokeballCenter}>
            {/* Cercle intérieur noir */}
            <View style={styles.pokeballInner} />
            {/* Reflet brillant */}
            <View style={styles.pokeballShine} />
          </View>
        </View>

        {/* Partie inférieure blanche */}
        <View style={styles.pokeballBottom} />
      </View>
    </View>
  );
};

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Bouton paramètres en haut à droite */}
      <TouchableOpacity
        style={[styles.settingsButton, { backgroundColor: colors.surface }]}
        onPress={() => navigation.navigate('Settings')}
        accessibilityLabel="Ouvrir les paramètres"
      >
        <Text style={styles.settingsIcon}>⚙️</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        {/* Header avec logo Pokémon */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.primary }]}>Pokemania</Text>
          <Text style={[styles.subtitle, { color: colors.primary }]}>Pokédex de poche</Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            Explorez le monde des Pokémon
          </Text>
        </View>

        {/* Pokéball stylée */}
        <View style={styles.imageContainer}>
          <PokeballLogo />
        </View>

        {/* Boutons de navigation */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => navigation.navigate('PokemonList')}
          >
            <Text style={styles.buttonText}>📋 Liste des Pokémon</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => navigation.navigate('Search', {})}
          >
            <Text style={styles.buttonText}>🔍 Recherche Avancée</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.favoriteButton]}
            onPress={() => navigation.navigate('Favorites')}
          >
            <Text style={styles.buttonText}>❤️ Mes Favoris</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textMuted }]}>
            Données fournies par l'API Tyradex
          </Text>
          <Text style={[styles.footerVersion, { color: colors.textMuted }]}>
            Pokemania v{APP_VERSION}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  settingsButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingsIcon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 32,
  },
  title: {
    fontSize: 48,
    fontWeight: '800',
    marginBottom: 12,
    textShadowColor: 'rgba(220, 38, 38, 0.2)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 20,
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 0.5,
    opacity: 0.9,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  // Styles pour la Pokéball
  pokeballWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  pokeballHalo: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(220, 38, 38, 0.08)',
    borderWidth: 2,
    borderColor: 'rgba(220, 38, 38, 0.15)',
  },
  pokeballContainer: {
    width: 180,
    height: 180,
    borderRadius: 90,
    overflow: 'hidden',
    borderWidth: 6,
    borderColor: '#1E293B',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  pokeballTop: {
    height: '50%',
    backgroundColor: '#DC2626',
    borderBottomWidth: 0,
  },
  pokeballBottom: {
    height: '50%',
    backgroundColor: '#FFFFFF',
  },
  pokeballMiddle: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 20,
    backgroundColor: '#1E293B',
    marginTop: -10,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  pokeballCenter: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 6,
    borderColor: '#1E293B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  pokeballInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 4,
    borderColor: '#1E293B',
  },
  pokeballShine: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  // Éléments décoratifs flottants
  sparkle: {
    position: 'absolute',
  },
  sparkle1: {
    top: -20,
    right: 30,
  },
  sparkle2: {
    top: 50,
    left: -10,
  },
  sparkle3: {
    bottom: 20,
    right: -5,
  },
  sparkleText: {
    fontSize: 24,
    opacity: 0.6,
  },
  buttonsContainer: {
    gap: 14,
    marginBottom: 8,
  },
  button: {
    paddingVertical: 18,
    paddingHorizontal: 28,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButton: {
    backgroundColor: '#DC2626',
  },
  secondaryButton: {
    backgroundColor: '#3B82F6',
  },
  favoriteButton: {
    backgroundColor: '#F59E0B',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  footer: {
    alignItems: 'center',
    marginTop: 16,
  },
  footerText: {
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 4,
    fontWeight: '500',
  },
  footerVersion: {
    fontSize: 10,
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default HomeScreen;

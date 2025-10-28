import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { HomeScreenProps } from '../types/navigation';

const { width } = Dimensions.get('window');

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header avec logo Pokémon */}
        <View style={styles.header}>
          <Text style={styles.title}>Pokemania</Text>
          <Text style={styles.subtitle}>Pokédex de poche</Text>
          <Text style={styles.description}>Explorez le monde des Pokémon</Text>
        </View>

        {/* Image principale */}
        <View style={styles.imageContainer}>
          <Text style={styles.pokeball}>⚪</Text>
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
          <Text style={styles.footerText}>
            Données fournies par l'API Tyradex
          </Text>
          <Text style={styles.footerVersion}>
            Pokemania v1.0.0
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
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
    color: '#DC2626',
    marginBottom: 12,
    textShadowColor: 'rgba(220, 38, 38, 0.2)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 20,
    color: '#EF4444',
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  pokeball: {
    fontSize: 140,
    opacity: 0.15,
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
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 4,
    fontWeight: '500',
  },
  footerVersion: {
    fontSize: 10,
    color: '#CBD5E1',
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default HomeScreen;

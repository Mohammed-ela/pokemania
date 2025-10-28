# ✨ Pokemania - Pokédex Ultra-Moderne

Une application React Native révolutionnaire pour explorer le monde des Pokémon avec un design époustouflant et des animations fluides !

## 🚀 Fonctionnalités

- 📋 **Liste complète des Pokémon** avec animations fluides et design moderne
- 🔍 **Recherche avancée** avec interface intuitive et feedback en temps réel
- ❤️ **Système de favoris** avec feedback haptique et persistance locale
- ✨ **Mode Shiny** pour admirer les Pokémon étincelants
- 🎨 **Design ultra-moderne** avec gradients, effets de flou et animations
- 📱 **Interface immersive** sans barres de navigation intrusives
- 🌐 **Données complètes** fournies par l'API Tyradex
- 🎭 **Animations performantes** avec React Native Reanimated
- 📊 **Statistiques détaillées** avec barres de progression colorées
- 🛡️ **Système de résistances** organisé par catégories (Immunités, Résistances, Faiblesses)

## 🛠️ Technologies utilisées

### Core
- **React Native** - Framework mobile cross-platform
- **Expo** - Plateforme de développement et déploiement
- **TypeScript** - Typage statique pour la sécurité du code
- **React Query (TanStack Query)** - Gestion d'état et cache intelligent
- **React Navigation** - Navigation fluide et moderne

### UI/UX Modernes
- **Expo Linear Gradient** - Dégradés colorés et modernes
- **Expo Blur** - Effets de flou pour un look premium
- **Expo Haptics** - Feedback tactile sur les interactions
- **React Native Reanimated** - Animations performantes et fluides
- **React Native Gesture Handler** - Gestion des gestes avancés

### Stockage et API
- **AsyncStorage** - Persistance locale des favoris
- **Axios** - Client HTTP avec intercepteurs
- **API Tyradex** - Source de données Pokémon complète

## 🎨 Améliorations apportées

### Design Révolutionnaire
- **Gradients colorés** sur tous les écrans pour un look moderne
- **Effets de flou (BlurView)** pour créer de la profondeur
- **Animations fluides** d'entrée, de transition et de chargement
- **Ombres et élévations** sophistiquées pour la profondeur
- **Typographie améliorée** avec des poids et espacements optimisés
- **Couleurs harmonieuses** et cohérentes dans toute l'app

### Expérience Utilisateur Premium
- **Feedback haptique** sur toutes les interactions importantes
- **Animations de chargement** élégantes et engageantes
- **Transitions fluides** entre les écrans
- **Interface immersive** sans barres de navigation intrusives
- **Recherche en temps réel** avec feedback visuel
- **Mode Shiny** avec animation de basculement

### Performance Optimisée
- **Animations natives** avec React Native Reanimated
- **Optimisations** des rendus et de la mémoire
- **Cache intelligent** avec React Query
- **Chargement progressif** des éléments UI
- **Gestion d'erreur** robuste avec retry automatique

## 📦 Installation

### Prérequis
- Node.js (v16 ou plus récent)
- Expo CLI
- Un appareil mobile ou émulateur

### Installation
```bash
# Cloner le projet
git clone <url-du-repo>
cd pokemania

# Installer les dépendances
npm install

# Démarrer l'application
npm start
```

### Démarrage sur différentes plateformes
```bash
# Android
npm run android

# iOS (macOS uniquement)
npm run ios

# Web
npm run web
```

## 🎯 Guide d'utilisation

### Écran d'accueil
- **Design immersif** avec gradient coloré
- **Animations d'entrée** fluides
- **Boutons modernes** avec gradients et feedback haptique
- **Pokeball animée** en rotation continue

### Liste des Pokémon
- **Grille moderne** avec cartes en gradient
- **Recherche en temps réel** avec effet de flou
- **Animations d'apparition** échelonnées
- **Feedback haptique** sur la sélection

### Détails du Pokémon
- **Interface immersive** avec gradient de fond
- **Mode Shiny** avec bouton animé
- **Statistiques visuelles** avec barres colorées
- **Sections organisées** avec effets de flou
- **Système de favoris** avec feedback haptique

## 🌐 API Tyradex

L'application utilise l'API publique **Tyradex** pour des données complètes :

### Endpoints
- **Liste complète** : `GET https://tyradex.app/api/v1/pokemon`
- **Détail** : `GET https://tyradex.app/api/v1/pokemon/<id>/[region]`

### Headers de politesse
```typescript
'User-Agent': 'Pokemania-App/1.0.0'
'Content-Type': 'application/json'
```

### Données incluses
- Informations de base (nom, numéro, catégorie)
- Sprites normaux et shiny haute qualité
- Types avec couleurs appropriées
- Statistiques complètes (PV, Attaque, Défense, etc.)
- Talents (y compris talents cachés)
- Informations physiques (taille, poids)
- Génération d'origine
- Système de résistances complet

## 📁 Structure du projet

```
src/
├── components/          # Composants réutilisables
├── hooks/              # Hooks personnalisés (usePokemon, useFavorites)
├── navigation/         # Configuration de navigation moderne
├── screens/            # Écrans avec design moderne
│   ├── HomeScreen.tsx      # Accueil avec animations
│   ├── PokemonListScreen.tsx # Liste avec grille moderne
│   ├── PokemonDetailScreen.tsx # Détails immersifs
│   ├── FavoritesScreen.tsx    # Favoris avec persistance
│   └── SearchScreen.tsx       # Recherche avancée
├── services/           # Services API avec intercepteurs
├── types/              # Définitions TypeScript complètes
└── utils/              # Utilitaires et helpers
```

## 🎨 Personnalisation

L'application est entièrement personnalisable :

### Couleurs et thèmes
- Modifiez les gradients dans les styles
- Ajustez les couleurs des types Pokémon
- Personnalisez les effets de flou

### Animations
- Durées des transitions dans les composants
- Types d'animations d'entrée
- Feedback haptique personnalisé

### Interface
- Espacements et typographie
- Ombres et élévations
- Bordures et rayons

## 📱 Compatibilité

- **iOS** 11.0+ avec support des effets de flou
- **Android** 6.0+ (API 23+) avec support des animations
- **Expo** SDK 53+ avec nouvelles fonctionnalités

## 🚀 Prochaines fonctionnalités

- [ ] **Mode sombre** avec thème adaptatif
- [ ] **Comparaison de Pokémon** côte à côte
- [ ] **Filtres avancés** par statistiques et capacités
- [ ] **Partage de Pokémon** avec images
- [ ] **Cache d'images** pour utilisation hors ligne
- [ ] **Animations 3D** avec Lottie
- [ ] **Reconnaissance vocale** pour la recherche
- [ ] **Widgets** pour l'écran d'accueil

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :

1. **Signaler des bugs** avec des captures d'écran
2. **Proposer des améliorations** de design ou de performance
3. **Ajouter de nouvelles fonctionnalités** modernes
4. **Améliorer la documentation** et les commentaires
5. **Optimiser les animations** et les transitions

### Processus de contribution
1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/amazing-feature`)
3. Commit vos changements (`git commit -m 'Add amazing feature'`)
4. Push vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

---

**Développé avec ❤️, ✨ et l'API Tyradex**

*Pokemania - L'expérience Pokémon la plus moderne qui soit !*
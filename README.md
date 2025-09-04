# 🔴 Pokédex React Native - Pokemania

Une application mobile Pokédex moderne développée avec React Native, Expo et TypeScript, utilisant l'API Tyradex.

## 🚀 Fonctionnalités

- ✅ **Liste complète des Pokémon** avec images et informations de base
- ✅ **Détails complets** avec statistiques, types, talents et sprites shiny
- ✅ **Recherche avancée** par nom, type et génération
- ✅ **Interface moderne** avec design inspiré de Pokémon
- ✅ **Navigation fluide** entre les écrans
- ✅ **Gestion d'état robuste** avec React Query
- 🔄 **Favoris** (à venir)

## 🛠️ Technologies utilisées

- **React Native** avec Expo
- **TypeScript** pour la sécurité des types
- **React Navigation** pour la navigation
- **React Query (TanStack Query)** pour la gestion des données
- **Axios** pour les requêtes API
- **API Tyradex** pour les données Pokémon

## 📱 Écrans

1. **Accueil** - Point d'entrée avec navigation vers les autres sections
2. **Liste des Pokémon** - Affichage en grille avec recherche rapide
3. **Détails du Pokémon** - Informations complètes avec sprites et statistiques
4. **Recherche avancée** - Filtres par type et génération
5. **Favoris** - Sauvegarde des Pokémon préférés (à venir)

## 🚀 Installation et démarrage

### Prérequis
- Node.js (v16 ou plus récent)
- Expo CLI
- Un appareil mobile ou émulateur

### Installation
```bash
# Cloner le projet (si depuis un repo)
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

## 📁 Structure du projet

```
src/
├── components/          # Composants réutilisables
├── hooks/              # Hooks personnalisés
├── navigation/         # Configuration de navigation
├── screens/            # Écrans de l'application
├── services/           # Services API
├── types/              # Définitions TypeScript
└── utils/              # Utilitaires
```

## 🌐 API

L'application utilise l'API publique **Tyradex** :
- **Liste complète** : `GET https://tyradex.app/api/v1/pokemon`
- **Détail** : `GET https://tyradex.app/api/v1/pokemon/<id>/[region]`

### Headers de politesse
```typescript
'User-Agent': 'Pokemania-App/1.0.0'
'Content-Type': 'application/json'
```

## 🎨 Design

- **Couleur principale** : Rouge Pokémon (#DC2626)
- **Interface moderne** avec ombres et bordures arrondies
- **Responsive** pour différentes tailles d'écran
- **Animations fluides** pour la navigation

## 🔧 Fonctionnalités techniques

- **Mise en cache intelligente** avec React Query
- **Gestion d'erreur robuste** avec retry automatique
- **Types TypeScript stricts** pour la sécurité
- **Performance optimisée** avec FlatList virtualisée
- **Recherche en temps réel** côté client

## 📊 Données Pokémon

Chaque Pokémon inclut :
- Informations de base (nom, numéro, catégorie)
- Sprites normaux et shiny
- Types avec couleurs appropriées
- Statistiques complètes (PV, Attaque, Défense, etc.)
- Talents (y compris talents cachés)
- Informations physiques (taille, poids)
- Génération d'origine

## 🚀 Prochaines fonctionnalités

- [ ] Système de favoris avec persistance locale
- [ ] Comparaison de Pokémon
- [ ] Filtres avancés (stats, capacités)
- [ ] Mode sombre
- [ ] Partage de Pokémon
- [ ] Cache d'images pour utilisation hors ligne

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
1. Fork le projet
2. Créer une branche feature
3. Commit vos changements
4. Push vers la branche
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

---

**Développé avec ❤️ et l'API Tyradex**

<div align="center">

# Pokemania

### Votre Pokedex de poche

[![React Native](https://img.shields.io/badge/React_Native-0.79-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-53-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

<br/>

<img src="assets/pokeball-logo.svg" alt="Pokemania Logo" width="180"/>

<br/>

**Application mobile moderne pour explorer l'univers Pokemon**

[Fonctionnalites](#-fonctionnalites) •
[Installation](#-installation) •
[Stack technique](#-stack-technique) •
[Architecture](#-architecture)

</div>

---

## Fonctionnalites

<table>
<tr>
<td width="50%">

### Catalogue complet
Parcourez l'integralite des Pokemon avec une interface fluide et reactive. Recherche instantanee par nom, numero ou type.

### Fiches detaillees
Statistiques completes, chaine d'evolution interactive, talents (y compris caches), faiblesses et resistances.

### Mode Shiny & Gigamax
Visualisez les sprites alternatifs d'un simple tap. Support des formes Gigamax quand disponibles.

</td>
<td width="50%">

### Donnees competitives
BST (Base Stat Total), groupes d'oeufs, taux de capture, ratio male/femelle - tout pour les dresseurs serieux.

### Favoris persistants
Sauvegardez vos Pokemon preferes. Vos favoris sont conserves meme apres fermeture de l'app.

### Mode hors-ligne
Cache intelligent avec React Query. Consultez vos donnees meme sans connexion.

</td>
</tr>
</table>

---

## Stack technique

| Technologie | Usage |
|-------------|-------|
| **React Native** | Framework mobile cross-platform |
| **Expo** | Toolchain et build system |
| **TypeScript** | Typage statique |
| **TanStack Query** | Gestion du cache et des requetes |
| **React Navigation** | Navigation entre ecrans |
| **AsyncStorage** | Persistance locale des favoris |
| **Axios** | Client HTTP |

---

## Installation

### Prerequisites

- Node.js 18+
- npm ou yarn
- Expo Go sur votre mobile (ou un emulateur)

### Demarrage rapide

```bash
# Cloner le repository
git clone https://github.com/Mohammed-ela/pokemania.git
cd pokemania

# Installer les dependances
npm install

# Lancer l'application
npm start
```

Scannez le QR code avec Expo Go (Android) ou l'app Camera (iOS).

### Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm start` | Demarre le serveur de dev Expo |
| `npm run android` | Lance sur emulateur Android |
| `npm run ios` | Lance sur simulateur iOS |
| `npm run web` | Lance la version web |

---

## Architecture

```
src/
├── components/       # Composants reutilisables (PokemonCard...)
├── hooks/            # Hooks personnalises (usePokemon, useFavorites)
├── navigation/       # Configuration React Navigation
├── screens/          # Ecrans de l'application
│   ├── HomeScreen
│   ├── PokemonListScreen
│   ├── PokemonDetailScreen
│   ├── SearchScreen
│   └── FavoritesScreen
├── services/         # Logique metier (API, favoris)
├── types/            # Definitions TypeScript
└── utils/            # Utilitaires (couleurs des types...)
```

---

## API

Les donnees proviennent de l'API publique **[Tyradex](https://tyradex.app)** - une API Pokemon francophone.

```
Base URL: https://tyradex.app/api/v1
```

| Endpoint | Description |
|----------|-------------|
| `GET /pokemon` | Liste complete des Pokemon |
| `GET /pokemon/:id` | Details d'un Pokemon |

---

## Performances

- **Images optimisees** avec `expo-image` (cache memoire + disque)
- **Composants memoizes** avec `React.memo`
- **FlatList virtualisee** pour les longues listes
- **Cache persistant** React Query (7 jours)

---

## Licence

MIT - Voir [LICENSE](LICENSE) pour plus de details.

---

<div align="center">

**Fait avec React Native et l'API Tyradex**

[Mohammed El Amrani](https://github.com/Mohammed-ela)

</div>

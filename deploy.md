# Guide de Deploiement - Pokemania

Ce guide explique comment deployer l'application Pokemania sur le Google Play Store et l'Apple App Store.

## Prerequisites

### Outils requis

```bash
# Installer EAS CLI globalement
npm install -g eas-cli

# Verifier l'installation
eas --version
```

### Comptes necessaires

- **Expo** : Compte sur [expo.dev](https://expo.dev)
- **Google Play** : Compte developpeur Google Play (25$ unique)
- **Apple Developer** : Compte Apple Developer Program (99$/an)

---

## Configuration initiale

### 1. Connexion a Expo

```bash
eas login
```

### 2. Configuration du projet EAS

```bash
eas build:configure
```

Cela va generer/mettre a jour le fichier `eas.json` et ajouter le `projectId` dans `app.json`.

### 3. Mettre a jour app.json

Remplacez les valeurs placeholder dans `app.json` :

```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "votre-vrai-project-id"
      }
    }
  }
}
```

---

## Deploiement Android (Google Play Store)

### Etape 1 : Creer un compte Google Play Console

1. Allez sur [Google Play Console](https://play.google.com/console)
2. Payez les 25$ de frais d'inscription (unique)
3. Completez les informations du compte developpeur

### Etape 2 : Creer l'application sur Google Play Console

1. Cliquez sur "Creer une application"
2. Remplissez les informations :
   - Nom : `Pokemania - Pokedex`
   - Langue par defaut : Francais
   - Type : Application
   - Gratuit

### Etape 3 : Preparer les assets

Vous aurez besoin de :
- **Icone** : 512x512 PNG (existe deja dans `assets/icon.png`)
- **Feature graphic** : 1024x500 PNG
- **Screenshots** :
  - Telephone : minimum 2 (entre 320px et 3840px)
  - Tablette 7" : minimum 1
  - Tablette 10" : minimum 1

### Etape 4 : Configurer le Service Account

Pour permettre a EAS de publier automatiquement :

1. Google Cloud Console > APIs & Services > Credentials
2. Creer un Service Account
3. Donner les permissions "Service Account User"
4. Telecharger le fichier JSON
5. Le renommer en `google-service-account.json` et le placer a la racine
6. Google Play Console > Configuration > Acces API > Lier le service account

**Important** : Ajoutez ce fichier au `.gitignore` :
```
google-service-account.json
```

### Etape 5 : Build de production

```bash
# Build AAB pour le Play Store
eas build --platform android --profile production
```

### Etape 6 : Soumettre au Play Store

```bash
# Soumettre automatiquement
eas submit --platform android --profile production

# OU soumettre manuellement le fichier AAB via la Play Console
```

### Etape 7 : Remplir les informations du Store

Dans Google Play Console :
1. **Fiche Play Store** : Description, screenshots, etc.
2. **Questionnaire sur le contenu** : Classification d'age
3. **Politique de confidentialite** : URL vers votre privacy-policy
4. **Tarification et distribution** : Gratuit, pays cibles

---

## Deploiement iOS (App Store)

### Etape 1 : Compte Apple Developer

1. Inscrivez-vous sur [Apple Developer](https://developer.apple.com)
2. Payez l'abonnement de 99$/an
3. Completez les accords legaux

### Etape 2 : Mettre a jour eas.json

Modifiez la section `submit.production.ios` :

```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "votre-email@apple.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABCD1234"
      }
    }
  }
}
```

Pour trouver ces valeurs :
- **appleId** : Votre email Apple Developer
- **ascAppId** : App Store Connect > Mon App > Informations generales > Identifiant Apple
- **appleTeamId** : Apple Developer > Membership > Team ID

### Etape 3 : Creer l'application sur App Store Connect

1. Allez sur [App Store Connect](https://appstoreconnect.apple.com)
2. Mes apps > "+" > Nouvelle app
3. Remplissez :
   - Nom : `Pokemania - Pokedex`
   - Langue principale : Francais
   - Bundle ID : `com.pokemania.pokedex`
   - SKU : `pokemania-pokedex`

### Etape 4 : Preparer les assets iOS

- **Icone** : 1024x1024 PNG sans transparence
- **Screenshots iPhone** :
  - 6.7" (iPhone 14 Pro Max) : 1290x2796
  - 6.5" (iPhone 11 Pro Max) : 1284x2778
  - 5.5" (iPhone 8 Plus) : 1242x2208
- **Screenshots iPad** :
  - 12.9" iPad Pro : 2048x2732

### Etape 5 : Build de production iOS

```bash
# Build pour l'App Store
eas build --platform ios --profile production
```

Note : Pour le premier build, EAS vous demandera de creer les credentials. Choisissez "Let Expo handle it".

### Etape 6 : Soumettre a l'App Store

```bash
# Soumettre automatiquement
eas submit --platform ios --profile production
```

### Etape 7 : Remplir les informations de l'App Store

Dans App Store Connect :
1. **Informations sur l'app** : Description, mots-cles, etc.
2. **Classification d'age** : Remplir le questionnaire
3. **Prix et disponibilite** : Gratuit
4. **Confidentialite de l'app** : Declarer qu'aucune donnee n'est collectee
5. **Review Information** : Coordonnees de contact pour l'equipe de review

---

## Commandes utiles

### Build pour les deux plateformes

```bash
eas build --platform all --profile production
```

### Soumettre aux deux stores

```bash
eas submit --platform all --profile production
```

### Build de test (APK)

```bash
eas build --platform android --profile preview
```

### Voir le statut des builds

```bash
eas build:list
```

### Mettre a jour une version

1. Incrementer `version` dans `app.json` (ex: "1.0.1")
2. Incrementer `android.versionCode` (ex: 2)
3. Rebuild et resubmit

```bash
eas build --platform all --profile production
eas submit --platform all --profile production
```

---

## Checklist pre-soumission

### Android

- [ ] `package` unique dans `app.json`
- [ ] `versionCode` incremente
- [ ] Icone 512x512 prete
- [ ] Screenshots prepares
- [ ] Politique de confidentialite accessible via URL
- [ ] Description de l'app redigee
- [ ] Questionnaire de classification rempli

### iOS

- [ ] `bundleIdentifier` unique dans `app.json`
- [ ] `buildNumber` incremente
- [ ] Icone 1024x1024 prete (sans transparence)
- [ ] Screenshots pour toutes les tailles
- [ ] Politique de confidentialite accessible via URL
- [ ] Description de l'app redigee
- [ ] Questionnaire de classification d'age rempli
- [ ] Accords legaux signes dans App Store Connect

---

## Troubleshooting

### "Invalid credentials" Android

Verifiez que le fichier `google-service-account.json` est valide et que le service account a les permissions dans Google Play Console.

### Build iOS echoue

```bash
# Regenerer les credentials
eas credentials --platform ios
```

### "App not found" lors du submit iOS

Assurez-vous que l'app existe dans App Store Connect avec le meme `bundleIdentifier`.

### Mise a jour rejetee par les stores

- Verifiez les guidelines respectives
- Pour Pokemon : Ajoutez un disclaimer que l'app n'est pas affiliee a Nintendo/Pokemon Company

---

## Ressources

- [Documentation EAS Build](https://docs.expo.dev/build/introduction/)
- [Documentation EAS Submit](https://docs.expo.dev/submit/introduction/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [App Store Connect Help](https://developer.apple.com/help/app-store-connect/)

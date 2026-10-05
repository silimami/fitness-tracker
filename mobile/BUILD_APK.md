# Fitness Tracker APK

Cette application permet de suivre :
- le nombre de pas
- le kilométrage
- les calories brûlées
- les minutes actives
- l’historique des jours

## Démarrage rapide

```bash
cd mobile
npm install
npm start
```

## Générer l’APK sur Windows / Mac / Linux

### 1) Installer Android Studio
- Installez Android Studio
- Installez le SDK Android
- Configurez les variables d’environnement

### 2) Démarrer le projet Expo

```bash
cd mobile
npm install
npx expo start
```

### 3) Générer le fichier APK

```bash
cd mobile
npx expo build:android
```

Ou, si vous préférez la version moderne :

```bash
cd mobile
npm install -g eas-cli
eas login
eas build --platform android
```

## Installer l’APK sur le téléphone

1. Transférez le fichier APK sur votre téléphone
2. Ouvrez-le
3. Acceptez l’installation

## Notes

- La version actuelle est une base fonctionnelle pour démonstration
- Vous pouvez ensuite ajouter une vraie connexion, sauvegarde sur serveur, et graphiques avancés

## Prochaine étape recommandée

Pour une vraie application de suivi de santé, on peut ensuite ajouter :
- connexion utilisateur
- sauvegarde dans une base de données
- graphiques hebdo / mensuel
- objectifs personnalisés
- sync avec smartwatch


# Suivi de ma condition physique

Bienvenue dans l'application de suivi de forme physique. Cette version de base permet de suivre :

- le nombre de pas
- le kilométrage
- les calories brûlées
- les minutes actives
- l'historique des journées
- les objectifs quotidiens

## Structure du projet

- `index.html` : interface principale de l'application
- `styles.css` : styles et mise en page
- `app.js` : logique de calcul, affichage et stockage local

## Utilisation

### Option 1 : ouvrir directement le fichier
Vous pouvez ouvrir `index.html` dans votre navigateur.

### Option 2 : lancer un petit serveur local
Depuis le dossier du projet, exécutez :

```bash
python3 -m http.server 3000
```

Puis ouvrez :

```text
http://localhost:3000
```

## Fonctionnalités de la version de base

- Résumé quotidien des performances
- Ajout d'une journée d'activité
- Suivi du nombre de pas et de la distance
- Calcul des calories et des minutes actives
- Visualisation sous forme de barres sur 7 jours
- Stockage local dans le navigateur

## Personnalisation future

Cette base peut ensuite être étendue avec :

- connexion utilisateur
- sauvegarde dans une base de données
- authentification
- graphiques plus avancés
- synchronisation mobile/web
- notifications d'objectifs

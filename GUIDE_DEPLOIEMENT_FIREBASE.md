# Guide de Déploiement sur Firebase Hosting

## Prérequis

1. **Compte Google** (pour accéder à Firebase Console)
2. **Node.js** installé (version 18+)
3. **npm** ou **yarn** installé

## Étape 1 : Installer Firebase CLI

Ouvrez un terminal et exécutez :

```bash
npm install -g firebase-tools
```

Ou avec yarn :
```bash
yarn global add firebase-tools
```

## Étape 2 : Se connecter à Firebase

```bash
firebase login
```

Cela ouvrira votre navigateur pour vous authentifier avec votre compte Google.

## Étape 3 : Créer un projet Firebase

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Cliquez sur "Créer un projet" ou "Add project"
3. Donnez un nom à votre projet (ex: "real-time-trading")
4. Suivez les étapes de création
5. Activez **Firebase Hosting** dans les fonctionnalités

## Étape 4 : Initialiser Firebase dans votre projet

Dans le terminal, à la racine de votre projet, exécutez :

```bash
firebase init hosting
```

Répondez aux questions :
- **What do you want to use as your public directory?** → `dist`
- **Configure as a single-page app (rewrite all urls to /index.html)?** → `Yes`
- **Set up automatic builds and deploys with GitHub?** → `No` (pour l'instant)
- **File dist/index.html already exists. Overwrite?** → `No`

Si vous avez déjà créé le projet sur Firebase Console, vous pouvez sélectionner le projet existant.

## Étape 5 : Modifier .firebaserc (si nécessaire)

Le fichier `.firebaserc` contient l'ID de votre projet Firebase. Si votre projet s'appelle différemment, modifiez-le :

```json
{
  "projects": {
    "default": "votre-id-de-projet-firebase"
  }
}
```

## Étape 6 : Construire votre application

```bash
npm run build
```

Cela créera le dossier `dist` avec vos fichiers statiques.

## Étape 7 : Déployer sur Firebase

```bash
firebase deploy --only hosting
```

## Déploiement automatique (Optionnel)

Pour déployer automatiquement à chaque push sur GitHub, vous pouvez configurer GitHub Actions ou utiliser Firebase CLI avec GitHub.

### Avec GitHub Actions

Créez le fichier `.github/workflows/firebase-deploy.yml` :

```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches:
      - main

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: votre-id-de-projet-firebase
```

## Commandes utiles

- **Voir les projets Firebase** : `firebase projects:list`
- **Déployer uniquement le hosting** : `firebase deploy --only hosting`
- **Voir les logs de déploiement** : `firebase hosting:channel:list`
- **Ouvrir le site déployé** : `firebase open hosting:site`

## Configuration personnalisée

Les fichiers de configuration Firebase ont été créés :
- `firebase.json` : Configuration du hosting (redirections SPA, cache, etc.)
- `.firebaserc` : ID du projet Firebase

## Important

- Le dossier `dist` est généré à chaque build et ne doit pas être commité (déjà dans .gitignore)
- Les redirections SPA sont configurées pour que toutes les routes pointent vers `/index.html`
- Le cache est configuré pour optimiser les performances (1 an pour les assets statiques)

## Support

Pour plus d'informations, consultez la [documentation Firebase Hosting](https://firebase.google.com/docs/hosting).
# Guide de Déploiement Automatique Firebase Hosting

## Réponse rapide

**Question : Est-ce que le dernier push a été déployé ?**
- ❌ Non, le push n'a PAS été déployé automatiquement
- ✅ Oui, j'ai déployé manuellement maintenant (les boutons Stripe sont en ligne)

## Méthode 1 : Intégration GitHub Firebase (RECOMMANDÉ - Plus simple)

### Étapes :

1. **Allez dans Firebase Console** :
   - https://console.firebase.google.com/project/realtime-dc5d3/hosting
   - Cliquez sur "Hosting" dans le menu de gauche

2. **Activez l'intégration GitHub** :
   - Cherchez la section "GitHub" ou "Intégration GitHub"
   - Cliquez sur "Connect repository" ou "Connecter le dépôt"

3. **Sélectionnez votre dépôt** :
   - Sélectionnez `star-shaanti/trade-wave-ai`
   - Choisissez la branche `main`

4. **Configurez le build** :
   - **Build command** : `npm run build`
   - **Output directory** : `dist`
   - **Root directory** : `/` (la racine)

5. **Activer le déploiement automatique** :
   - Firebase créera automatiquement un workflow GitHub Actions
   - Chaque push sur `main` déclenchera un déploiement

**Avantages** :
- ✅ Configuration simple via l'interface
- ✅ Firebase gère automatiquement les tokens et secrets
- ✅ Pas besoin de configurer manuellement GitHub Actions

---

## Méthode 2 : GitHub Actions (Plus de contrôle)

### Prérequis :

Vous devez créer un **Service Account Firebase** et l'ajouter comme secret GitHub.

### Étapes :

1. **Créer un Service Account Firebase** :
   ```bash
   # Dans Firebase Console
   - Allez dans Project Settings → Service Accounts
   - Cliquez sur "Generate new private key"
   - Téléchargez le fichier JSON
   ```

2. **Ajouter le secret dans GitHub** :
   - Allez sur : https://github.com/star-shaanti/trade-wave-ai/settings/secrets/actions
   - Cliquez sur "New repository secret"
   - **Name** : `FIREBASE_SERVICE_ACCOUNT`
   - **Value** : Copiez tout le contenu du fichier JSON téléchargé
   - Cliquez sur "Add secret"

3. **Le workflow est déjà créé** :
   - Le fichier `.github/workflows/firebase-deploy.yml` existe déjà
   - Il déploiera automatiquement à chaque push sur `main`

**Avantages** :
- ✅ Plus de contrôle sur le processus
- ✅ Vous pouvez personnaliser le workflow
- ⚠️ Nécessite plus de configuration

---

## Quelle méthode choisir ?

**Recommandation : Méthode 1 (Intégration GitHub Firebase)**
- Plus simple
- Moins de configuration
- Firebase gère tout automatiquement

---

## Vérifier le déploiement automatique

### Après configuration (Méthode 1) :
1. Allez sur : https://github.com/star-shaanti/trade-wave-ai/actions
2. Vous devriez voir un workflow Firebase se déclencher à chaque push

### Après configuration (Méthode 2) :
1. Allez sur : https://github.com/star-shaanti/trade-wave-ai/actions
2. Vous devriez voir "Deploy to Firebase Hosting" à chaque push

---

## Déploiement manuel (toujours disponible)

Si vous voulez déployer manuellement :

```bash
npm run build
firebase deploy --only hosting
```

---

## Important

Le workflow GitHub Actions (Méthode 2) est déjà créé dans `.github/workflows/firebase-deploy.yml`, mais il nécessite le secret `FIREBASE_SERVICE_ACCOUNT` pour fonctionner.

Pour activer immédiatement sans configuration supplémentaire, utilisez la **Méthode 1** (Intégration GitHub Firebase via la console).
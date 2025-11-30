# 🚀 Guide Complet - Déploiement Automatique Supabase Edge Functions

## 📋 Vue d'ensemble

Ce guide explique comment configurer le déploiement automatique de vos Edge Functions Supabase via GitHub Actions. Chaque fois que vous poussez du code vers la branche `main`, toutes les Edge Functions seront automatiquement déployées sur Supabase.

## 🔑 Étape 1 : Obtenir le SUPABASE_ACCESS_TOKEN

Le `SUPABASE_ACCESS_TOKEN` est un token d'accès personnel qui permet à GitHub Actions d'accéder à votre projet Supabase.

### Méthode 1 : Via Supabase Dashboard (Recommandé)

1. **Allez sur** : https://supabase.com/dashboard/account/tokens
2. **Connectez-vous** à votre compte Supabase
3. **Cliquez sur "Generate new token"**
4. **Donnez un nom** au token (ex: "GitHub Actions Deployment")
5. **Copiez le token** généré (⚠️ **IMPORTANT** : Vous ne pourrez le voir qu'une seule fois !)

### Méthode 2 : Via Supabase CLI

```bash
# Installer Supabase CLI si pas déjà fait
npm install -g supabase

# Se connecter
supabase login

# Le token sera automatiquement récupéré
```

## 🔐 Étape 2 : Configurer les secrets GitHub

1. **Allez sur votre dépôt GitHub** : https://github.com/star-shaanti/trade-wave-ai

2. **Cliquez sur "Settings"** (en haut du dépôt)

3. **Dans le menu de gauche**, cliquez sur **"Secrets and variables"** → **"Actions"**

4. **Cliquez sur "New repository secret"** et ajoutez ces secrets :

   ### Secret 1 : SUPABASE_ACCESS_TOKEN
   - **Name** : `SUPABASE_ACCESS_TOKEN`
   - **Secret** : Collez le token que vous avez généré à l'étape 1
   - Cliquez sur **"Add secret"**

   ### Secret 2 : SUPABASE_DB_PASSWORD (Optionnel mais recommandé)
   - **Name** : `SUPABASE_DB_PASSWORD`
   - **Secret** : Votre mot de passe de base de données Supabase
     - Vous pouvez le trouver dans : Supabase Dashboard → Project Settings → Database → Database Password
   - Cliquez sur **"Add secret"**

## ✅ Étape 3 : Vérifier le workflow

Le fichier `.github/workflows/deploy-edge-functions.yml` est déjà créé et configuré. Il déploiera automatiquement **toutes** les Edge Functions suivantes :

- ✅ `check-nowpayments-payment`
- ✅ `create-nowpayments-invoice`
- ✅ `nowpayments-webhook`
- ✅ `create-payment`
- ✅ `create-checkout`
- ✅ `stripe-webhook`
- ✅ `check-subscription`
- ✅ `customer-portal`

## 🚀 Étape 4 : Activer le déploiement automatique

1. **Poussez le workflow vers GitHub** (si ce n'est pas déjà fait) :

```bash
git add .github/workflows/deploy-edge-functions.yml
git commit -m "Configure automatic deployment for Edge Functions"
git push
```

2. **Vérifiez que le workflow est actif** :
   - Allez sur : https://github.com/star-shaanti/trade-wave-ai/actions
   - Vous devriez voir le workflow "Deploy Supabase Edge Functions"

## 📝 Comment ça fonctionne

Le workflow se déclenche automatiquement quand :
- ✅ Vous poussez du code vers la branche `main`
- ✅ ET que des fichiers dans `supabase/functions/**` ont été modifiés
- ✅ OU que le fichier `.github/workflows/deploy-edge-functions.yml` a été modifié
- ✅ OU que le fichier `supabase/config.toml` a été modifié

## 🔍 Vérifier le déploiement

### 1. Vérifier dans GitHub Actions

1. Allez sur : https://github.com/star-shaanti/trade-wave-ai/actions
2. Cliquez sur le dernier workflow exécuté
3. Vérifiez que tous les steps sont verts ✅

### 2. Vérifier dans Supabase Dashboard

1. Allez sur : https://supabase.com/dashboard
2. Sélectionnez votre projet
3. Allez dans **"Edge Functions"**
4. Vérifiez la date du dernier déploiement pour chaque fonction

## ⚠️ Dépannage

### Erreur : "SUPABASE_ACCESS_TOKEN not found"

**Solution** : Vérifiez que vous avez bien ajouté le secret `SUPABASE_ACCESS_TOKEN` dans GitHub Settings → Secrets and variables → Actions

### Erreur : "Authentication failed"

**Solution** : 
1. Vérifiez que le token est correct
2. Générez un nouveau token dans Supabase Dashboard
3. Mettez à jour le secret dans GitHub

### Erreur : "Function deploy failed"

**Solution** :
- Le workflow continue même si une fonction échoue (continue-on-error)
- Vérifiez les logs dans GitHub Actions pour voir quelle fonction a échoué
- Vérifiez les logs dans Supabase Dashboard → Edge Functions → [Nom de la fonction] → Logs

### Le workflow ne se déclenche pas

**Vérifications** :
1. ✅ Vous avez bien poussé vers la branche `main` (pas `master`)
2. ✅ Vous avez modifié des fichiers dans `supabase/functions/**`
3. ✅ Le workflow est présent dans `.github/workflows/deploy-edge-functions.yml`

## 🎯 Test du déploiement automatique

Pour tester que tout fonctionne :

1. **Faites une petite modification** dans une Edge Function :
   ```bash
   # Par exemple, ajoutez un commentaire dans check-nowpayments-payment
   code supabase/functions/check-nowpayments-payment/index.ts
   ```

2. **Poussez le changement** :
   ```bash
   git add .
   git commit -m "Test: Trigger automatic deployment"
   git push
   ```

3. **Vérifiez dans GitHub Actions** :
   - Le workflow devrait se déclencher automatiquement
   - Après quelques minutes, les fonctions devraient être déployées

4. **Vérifiez dans Supabase Dashboard** :
   - Les dates de déploiement devraient être mises à jour

## 📚 Ressources

- [Documentation Supabase CLI](https://supabase.com/docs/reference/cli)
- [Documentation GitHub Actions](https://docs.github.com/en/actions)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

## ✅ Checklist finale

- [ ] Token `SUPABASE_ACCESS_TOKEN` généré dans Supabase Dashboard
- [ ] Secret `SUPABASE_ACCESS_TOKEN` ajouté dans GitHub
- [ ] Secret `SUPABASE_DB_PASSWORD` ajouté dans GitHub (optionnel)
- [ ] Workflow `.github/workflows/deploy-edge-functions.yml` présent dans le dépôt
- [ ] Workflow poussé vers GitHub
- [ ] Test effectué et vérifié

Une fois tous ces éléments en place, le déploiement sera **100% automatique** ! 🎉


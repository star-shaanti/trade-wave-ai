# 🚀 Configuration Rapide - Déploiement Auto Supabase

## ⚡ Guide Express (5 minutes)

### 1️⃣ Obtenir le Token Supabase (2 min)

1. Allez sur : **https://supabase.com/dashboard/account/tokens**
2. Cliquez sur **"Generate new token"**
3. Nommez-le : `GitHub Actions`
4. **Copiez le token** (⚠️ vous ne le verrez qu'une fois !)

### 2️⃣ Ajouter le Secret dans GitHub (2 min)

1. Allez sur : **https://github.com/star-shaanti/trade-wave-ai/settings/secrets/actions**
2. Cliquez sur **"New repository secret"**
3. **Name** : `SUPABASE_ACCESS_TOKEN`
4. **Secret** : Collez le token de l'étape 1
5. Cliquez sur **"Add secret"**

### 3️⃣ Pousser le Workflow (1 min)

Le workflow est déjà prêt ! Il suffit de le pousser :

```bash
git add .github/workflows/deploy-edge-functions.yml
git commit -m "Configure automatic deployment"
git push
```

## ✅ C'est tout !

Maintenant, **chaque fois que vous poussez des modifications** dans `supabase/functions/**`, **toutes les Edge Functions seront automatiquement déployées** sur Supabase !

## 🔍 Vérifier que ça marche

1. Faites une petite modification dans une fonction Edge
2. Poussez vers Git
3. Allez sur : **https://github.com/star-shaanti/trade-wave-ai/actions**
4. Vous devriez voir le workflow se déclencher automatiquement !

## 📋 Fonctions déployées automatiquement

Le workflow déploie automatiquement ces 8 fonctions :
- ✅ check-nowpayments-payment
- ✅ create-nowpayments-invoice
- ✅ nowpayments-webhook
- ✅ create-payment
- ✅ create-checkout
- ✅ stripe-webhook
- ✅ check-subscription
- ✅ customer-portal

## ❓ Besoin d'aide ?

Consultez le guide complet : `GUIDE_DEPLOIEMENT_AUTO_COMPLET.md`


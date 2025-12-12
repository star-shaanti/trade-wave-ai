# 🔍 Vérification des Webhooks

## 📌 Important : Deux webhooks différents

Votre plateforme utilise **deux webhooks indépendants** :

1. **`stripe-webhook`** : Pour les paiements Stripe (carte bancaire)
   - URL : `https://taadbjuelxonszosfrsk.supabase.co/functions/v1/stripe-webhook`
   - Configuré dans : Stripe Dashboard

2. **`nowpayments-webhook`** : Pour les paiements crypto (NOWPayments)
   - URL : `https://taadbjuelxonszosfrsk.supabase.co/functions/v1/nowpayments-webhook`
   - Configuré dans : NOWPayments Dashboard

⚠️ **Le problème des paiements crypto n'est PAS lié au webhook Stripe.**

## ✅ Vérifier le webhook NOWPayments (pour crypto)

### 1. Vérifier dans NOWPayments Dashboard

1. Allez sur : https://nowpayments.io/dashboard
2. Allez dans **Settings** → **IPN Callback**
3. Vérifiez que l'URL est :
   ```
   https://taadbjuelxonszosfrsk.supabase.co/functions/v1/nowpayments-webhook
   ```
4. Vérifiez que le statut est **✅ Actif**

### 2. Vérifier dans Supabase

1. Allez sur : https://supabase.com/dashboard/project/taadbjuelxonszosfrsk/functions
2. Vérifiez que `nowpayments-webhook` est déployée
3. Vérifiez la date du dernier déploiement

### 3. Vérifier les variables d'environnement

1. Allez sur : https://supabase.com/dashboard/project/taadbjuelxonszosfrsk/settings/functions
2. Vérifiez que `NOWPAYMENTS_IPN_SECRET_KEY` est configuré
3. Il doit correspondre au secret dans NOWPayments Dashboard

### 4. Vérifier les logs

1. Allez sur : https://supabase.com/dashboard/project/taadbjuelxonszosfrsk/logs/edge-logs
2. Filtrez par : `nowpayments-webhook`
3. Vérifiez les dernières entrées pour voir si le webhook est appelé

## ✅ Vérifier le webhook Stripe (pour carte bancaire)

### 1. Vérifier dans Stripe Dashboard

1. Allez sur : https://dashboard.stripe.com/webhooks
2. Trouvez le webhook avec l'URL :
   ```
   https://taadbjuelxonszosfrsk.supabase.co/functions/v1/stripe-webhook
   ```
3. Vérifiez que le statut est **✅ Actif**
4. Vérifiez les événements écoutés :
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

### 2. Vérifier dans Supabase

1. Allez sur : https://supabase.com/dashboard/project/taadbjuelxonszosfrsk/functions
2. Vérifiez que `stripe-webhook` est déployée
3. Vérifiez la date du dernier déploiement

### 3. Vérifier les variables d'environnement

1. Allez sur : https://supabase.com/dashboard/project/taadbjuelxonszosfrsk/settings/functions
2. Vérifiez que `STRIPE_WEBHOOK_SECRET` est configuré
3. Il doit correspondre au secret dans Stripe Dashboard

### 4. Réactiver le webhook Stripe si nécessaire

Si Stripe vous a envoyé un email disant que le webhook fonctionne, mais qu'il apparaît comme désactivé :

1. Allez sur : https://dashboard.stripe.com/webhooks
2. Trouvez votre webhook
3. Cliquez sur **"..."** → **"Re-enable"** ou **"Reactivate"**
4. Vérifiez que les événements sont bien sélectionnés
5. Testez avec un paiement test

## 🚨 Problème : Paiements crypto ne fonctionnent pas

Si les paiements crypto ne fonctionnent pas, vérifiez :

1. ✅ Le webhook NOWPayments est actif dans NOWPayments Dashboard
2. ✅ L'URL du webhook est correcte
3. ✅ Le secret IPN est configuré dans Supabase
4. ✅ La fonction `nowpayments-webhook` est déployée
5. ✅ Les logs montrent que le webhook est appelé
6. ✅ L'email dans le webhook correspond à l'email de l'utilisateur

**Le webhook Stripe n'a AUCUN impact sur les paiements crypto.**

## 📝 Test rapide

### Tester le webhook NOWPayments

1. Effectuez un paiement crypto test
2. Vérifiez les logs Supabase pour `nowpayments-webhook`
3. Vérifiez que le webhook est appelé avec `customer_email`
4. Vérifiez que l'abonnement est activé dans la table `subscribers`

### Tester le webhook Stripe

1. Effectuez un paiement Stripe test
2. Vérifiez les logs Supabase pour `stripe-webhook`
3. Vérifiez que le webhook est appelé
4. Vérifiez que l'abonnement est activé dans la table `subscribers`


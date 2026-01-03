# 🔑 Configuration des Clés NOWPayments

## 📌 Clés nécessaires

Pour que les paiements crypto fonctionnent, vous devez configurer **2 clés** dans Supabase :

### 1. `NOWPAYMENTS_API_KEY` (OBLIGATOIRE)

**Qu'est-ce que c'est ?**
- C'est votre clé API secrète NOWPayments
- Utilisée pour créer des invoices et vérifier les paiements
- **Ne doit JAMAIS être exposée côté client**

**Où la trouver ?**
1. Allez sur : https://nowpayments.io/dashboard
2. Allez dans **Settings** → **API Keys**
3. Copiez votre **API Key** (commence généralement par `xxxxx-xxxxx-xxxxx`)

**Où la configurer dans Supabase ?**
1. Allez sur : https://supabase.com/dashboard/project/taadbjuelxonszosfrsk/settings/functions
2. Ajoutez la variable :
   - **Name** : `NOWPAYMENTS_API_KEY`
   - **Value** : Votre clé API NOWPayments

### 2. `NOWPAYMENTS_IPN_SECRET_KEY` (OBLIGATOIRE pour la sécurité)

**Qu'est-ce que c'est ?**
- C'est le secret IPN (Instant Payment Notification)
- Utilisé pour vérifier que les webhooks viennent bien de NOWPayments
- **Sans cette clé, les webhooks ne seront pas sécurisés**

**Où la trouver ?**
1. Allez sur : https://nowpayments.io/dashboard
2. Allez dans **Settings** → **IPN Callback** (ou **Webhooks**)
3. Créez ou copiez votre **IPN Secret Key**

**Où la configurer dans Supabase ?**
1. Allez sur : https://supabase.com/dashboard/project/taadbjuelxonszosfrsk/settings/functions
2. Ajoutez la variable :
   - **Name** : `NOWPAYMENTS_IPN_SECRET_KEY`
   - **Value** : Votre secret IPN NOWPayments

**⚠️ Important** : Ce secret doit être **identique** à celui configuré dans NOWPayments Dashboard.

### 3. `NOWPAYMENTS_IPN_URL` (OPTIONNEL mais recommandé)

**Qu'est-ce que c'est ?**
- L'URL du webhook qui sera appelée par NOWPayments
- Si non configurée, NOWPayments utilisera l'URL globale configurée dans leur dashboard

**Valeur à configurer :**
```
https://taadbjuelxonszosfrsk.supabase.co/functions/v1/nowpayments-webhook
```

**Où la configurer dans Supabase ?**
1. Allez sur : https://supabase.com/dashboard/project/taadbjuelxonszosfrsk/settings/functions
2. Ajoutez la variable :
   - **Name** : `NOWPAYMENTS_IPN_URL`
   - **Value** : `https://taadbjuelxonszosfrsk.supabase.co/functions/v1/nowpayments-webhook`

## ❓ Clé publique NOWPayments ?

**Réponse courte : NON, vous n'avez pas besoin de clé publique.**

NOWPayments fonctionne différemment de Stripe :
- **Stripe** : Utilise une clé publique côté client + une clé secrète côté serveur
- **NOWPayments** : Utilise uniquement une clé API secrète côté serveur

**Pourquoi ?**
- Les paiements NOWPayments se font via une redirection vers leur page de paiement
- Vous n'avez pas besoin d'initialiser un SDK côté client
- Toute la logique se fait côté serveur (Edge Functions)

## ✅ Checklist de configuration

- [ ] `NOWPAYMENTS_API_KEY` est configurée dans Supabase
- [ ] `NOWPAYMENTS_IPN_SECRET_KEY` est configurée dans Supabase
- [ ] `NOWPAYMENTS_IPN_SECRET_KEY` correspond au secret dans NOWPayments Dashboard
- [ ] `NOWPAYMENTS_IPN_URL` est configurée dans Supabase (optionnel)
- [ ] Le webhook est configuré dans NOWPayments Dashboard avec la bonne URL
- [ ] Le secret IPN dans NOWPayments Dashboard correspond à `NOWPAYMENTS_IPN_SECRET_KEY`

## 🔍 Vérifier que les clés sont correctes

### Test 1 : Vérifier les logs de création d'invoice

1. Effectuez un paiement test
2. Allez sur : https://supabase.com/dashboard/project/taadbjuelxonszosfrsk/logs/edge-logs
3. Filtrez par : `create-nowpayments-invoice`
4. Vérifiez qu'il n'y a pas d'erreur "NOWPayments API key not configured"

### Test 2 : Vérifier les logs du webhook

1. Après un paiement, vérifiez les logs :
   - Filtrez par : `nowpayments-webhook`
2. Si vous voyez "WARNING: NOWPAYMENTS_IPN_SECRET_KEY not set", ajoutez la clé

## 🚨 Problèmes courants

### Erreur : "NOWPayments API key not configured"
**Solution** : Ajoutez `NOWPAYMENTS_API_KEY` dans Supabase Settings → Functions

### Erreur : "Invalid signature" dans les logs du webhook
**Solution** : Vérifiez que `NOWPAYMENTS_IPN_SECRET_KEY` correspond exactement au secret dans NOWPayments Dashboard

### Aucun log pour `nowpayments-webhook`
**Solution** : Vérifiez que le webhook est configuré dans NOWPayments Dashboard avec la bonne URL

## 📝 Résumé

**Clés OBLIGATOIRES :**
1. ✅ `NOWPAYMENTS_API_KEY` - Pour créer des invoices
2. ✅ `NOWPAYMENTS_IPN_SECRET_KEY` - Pour sécuriser les webhooks

**Clé OPTIONNELLE :**
3. ⚪ `NOWPAYMENTS_IPN_URL` - Pour spécifier l'URL du webhook (sinon utilise celle du dashboard)

**Clé NON NÉCESSAIRE :**
4. ❌ Clé publique - Pas utilisée par NOWPayments





# 🚨 Fix : Aucun log pour nowpayments-webhook

## 🎯 Problème

Aucun log n'apparaît dans Supabase pour `nowpayments-webhook`, ce qui signifie que **NOWPayments n'appelle jamais le webhook**.

## 🔍 Causes possibles

1. **Le webhook n'est pas configuré dans NOWPayments Dashboard**
2. **L'URL du webhook est incorrecte**
3. **La variable `NOWPAYMENTS_IPN_URL` n'est pas configurée dans Supabase**
4. **Le webhook est désactivé dans NOWPayments**

## ✅ Solution 1 : Vérifier la configuration dans NOWPayments Dashboard

### Étape 1 : Accéder au Dashboard NOWPayments

1. Allez sur : https://nowpayments.io/dashboard
2. Connectez-vous avec votre compte

### Étape 2 : Configurer le webhook IPN

1. Allez dans **Settings** → **IPN Callback** (ou **Webhooks**)
2. Vérifiez que l'URL suivante est configurée :
   ```
   https://taadbjuelxonszosfrsk.supabase.co/functions/v1/nowpayments-webhook
   ```
3. **Si l'URL n'est pas configurée**, ajoutez-la
4. **Si l'URL est incorrecte**, corrigez-la
5. Vérifiez que le statut est **✅ Actif**

### Étape 3 : Vérifier le secret IPN

1. Dans NOWPayments Dashboard, trouvez le **IPN Secret Key**
2. Copiez ce secret
3. Allez sur Supabase : https://supabase.com/dashboard/project/taadbjuelxonszosfrsk/settings/functions
4. Vérifiez que `NOWPAYMENTS_IPN_SECRET_KEY` est configuré avec ce secret
5. **Si la variable n'existe pas**, ajoutez-la

## ✅ Solution 2 : Vérifier la variable d'environnement dans Supabase

### Étape 1 : Vérifier `NOWPAYMENTS_IPN_URL`

1. Allez sur : https://supabase.com/dashboard/project/taadbjuelxonszosfrsk/settings/functions
2. Vérifiez que `NOWPAYMENTS_IPN_URL` est configurée avec :
   ```
   https://taadbjuelxonszosfrsk.supabase.co/functions/v1/nowpayments-webhook
   ```
3. **Si la variable n'existe pas**, ajoutez-la

**Note** : Cette variable est utilisée lors de la création d'invoice pour spécifier le webhook. Si elle n'est pas configurée, le webhook global dans NOWPayments Dashboard sera utilisé.

## ✅ Solution 3 : Vérifier que la fonction est déployée

1. Allez sur : https://supabase.com/dashboard/project/taadbjuelxonszosfrsk/functions
2. Vérifiez que `nowpayments-webhook` est listée
3. Vérifiez la date du dernier déploiement
4. **Si la fonction n'est pas déployée**, déployez-la :
   ```bash
   supabase functions deploy nowpayments-webhook
   ```

## ✅ Solution 4 : Tester le webhook manuellement

### Test 1 : Vérifier que l'endpoint est accessible

Utilisez curl ou Postman pour tester :

```bash
curl -X POST https://taadbjuelxonszosfrsk.supabase.co/functions/v1/nowpayments-webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "webhook"}'
```

**Résultat attendu** : Vous devriez voir un log dans Supabase avec "Webhook received"

### Test 2 : Vérifier dans NOWPayments Dashboard

1. Allez dans NOWPayments Dashboard → **Settings** → **IPN Callback**
2. Cherchez un bouton **"Test"** ou **"Send Test"**
3. Cliquez dessus pour envoyer un webhook de test
4. Vérifiez les logs Supabase

## ✅ Solution 5 : Vérifier les logs de création d'invoice

1. Allez sur : https://supabase.com/dashboard/project/taadbjuelxonszosfrsk/logs/edge-logs
2. Filtrez par : `create-nowpayments-invoice`
3. Vérifiez les logs pour voir :
   - Si `ipn_callback_url` est inclus dans le payload
   - Si `customer_email` est inclus dans le payload

## 🔄 Checklist complète

- [ ] Le webhook est configuré dans NOWPayments Dashboard
- [ ] L'URL du webhook est correcte : `https://taadbjuelxonszosfrsk.supabase.co/functions/v1/nowpayments-webhook`
- [ ] Le statut du webhook est **Actif** dans NOWPayments
- [ ] `NOWPAYMENTS_IPN_SECRET_KEY` est configuré dans Supabase
- [ ] `NOWPAYMENTS_IPN_URL` est configuré dans Supabase (optionnel mais recommandé)
- [ ] La fonction `nowpayments-webhook` est déployée dans Supabase
- [ ] Le test manuel du webhook génère des logs

## 🚨 Si le problème persiste

1. **Contactez le support NOWPayments** pour vérifier :
   - Si le webhook est bien configuré côté serveur
   - Si des webhooks sont envoyés mais échouent
   - Si l'URL est accessible depuis leurs serveurs

2. **Vérifiez les logs NOWPayments** :
   - Allez dans NOWPayments Dashboard → **Logs** ou **Webhooks**
   - Vérifiez si des tentatives d'appel au webhook sont enregistrées
   - Vérifiez les codes d'erreur HTTP

3. **Vérifiez le firewall/security** :
   - Vérifiez que Supabase n'a pas de restrictions qui bloquent les appels depuis NOWPayments
   - Vérifiez que l'URL est accessible publiquement

## 📝 Configuration recommandée

### Dans Supabase (Settings → Functions) :

```
NOWPAYMENTS_IPN_URL=https://taadbjuelxonszosfrsk.supabase.co/functions/v1/nowpayments-webhook
NOWPAYMENTS_IPN_SECRET_KEY=votre_secret_ipn_de_nowpayments
NOWPAYMENTS_API_KEY=votre_api_key_de_nowpayments
```

### Dans NOWPayments Dashboard :

- **IPN Callback URL** : `https://taadbjuelxonszosfrsk.supabase.co/functions/v1/nowpayments-webhook`
- **IPN Secret Key** : (doit correspondre à `NOWPAYMENTS_IPN_SECRET_KEY` dans Supabase)


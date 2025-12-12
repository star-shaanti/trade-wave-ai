# 🔧 Fix : Abonnement non activé après déploiement

## 🎯 Problème

Après un déploiement, les utilisateurs qui paient avec crypto ne voient pas leur abonnement activé, même si le paiement est confirmé.

## 🔍 Causes possibles

1. **Les Edge Functions ne sont pas à jour** après le déploiement
2. **Le webhook URL n'est pas correctement configuré** dans NOWPayments
3. **Le webhook n'a pas encore été appelé** par NOWPayments
4. **L'email dans le webhook ne correspond pas** à l'email de l'utilisateur

## ✅ Solutions

### Solution 1 : Vérifier que les Edge Functions sont déployées

1. **Allez sur** : https://github.com/star-shaanti/trade-wave-ai/actions
2. **Vérifiez** que le workflow "Deploy Supabase Edge Functions" s'est exécuté avec succès
3. **Vérifiez sur Supabase** :
   - https://supabase.com/dashboard/project/taadbjuelxonszosfrsk/functions
   - Vérifiez la date du dernier déploiement pour chaque fonction
   - Les fonctions importantes :
     - `check-nowpayments-payment`
     - `nowpayments-webhook`
     - `check-subscription`

### Solution 2 : Vérifier la configuration du webhook NOWPayments

1. **Allez sur** : https://nowpayments.io/dashboard
2. **Allez dans** "Settings" → "IPN Callback"
3. **Vérifiez que l'URL du webhook est** :
   ```
   https://taadbjuelxonszosfrsk.supabase.co/functions/v1/nowpayments-webhook
   ```
4. **Vérifiez que le secret IPN est configuré** dans Supabase :
   - Allez sur : https://supabase.com/dashboard/project/taadbjuelxonszosfrsk/settings/functions
   - Vérifiez que `NOWPAYMENTS_IPN_SECRET_KEY` est configuré
   - Il doit correspondre au secret dans NOWPayments

### Solution 3 : Vérifier les logs du webhook

1. **Allez sur** : https://supabase.com/dashboard/project/taadbjuelxonszosfrsk/logs/edge-logs
2. **Filtrez par** : `nowpayments-webhook`
3. **Vérifiez** :
   - Si le webhook a été appelé
   - Si l'email est présent dans le webhook
   - Si l'utilisateur a été trouvé par email
   - Si l'abonnement a été activé

### Solution 4 : Activer manuellement l'abonnement (Solution temporaire)

Si le webhook n'a pas encore été appelé, vous pouvez activer manuellement l'abonnement :

1. **Allez sur** : https://supabase.com/dashboard/project/taadbjuelxonszosfrsk/editor
2. **Ouvrez la table** `subscribers`
3. **Trouvez l'utilisateur** par email
4. **Mettez à jour** :
   - `subscribed` : `true`
   - `subscription_tier` : `Premium` (ou selon le plan)
   - `subscription_end` : Date 30 jours dans le futur
   - `payment_source` : `nowpayments`

### Solution 5 : Vérifier que l'email est correct

Le webhook utilise `customer_email` du body pour trouver l'utilisateur. Vérifiez que :

1. **L'email dans NOWPayments** correspond à l'email de l'utilisateur dans Supabase
2. **L'email est bien envoyé** lors de la création de l'invoice (voir les logs de `create-nowpayments-invoice`)

## 🔄 Processus de vérification après déploiement

Après chaque déploiement, vérifiez :

1. ✅ Les Edge Functions sont déployées (GitHub Actions)
2. ✅ Le webhook URL est correct dans NOWPayments
3. ✅ Le secret IPN est configuré dans Supabase
4. ✅ Testez un paiement et vérifiez les logs

## 📝 Logs à vérifier

### Dans `create-nowpayments-invoice` :
- `Email added to payload` - confirme que l'email est envoyé
- `Email added to invoice URL` - confirme que l'email est dans l'URL

### Dans `nowpayments-webhook` :
- `Webhook received` - confirme que le webhook est appelé
- `customer_email: ...` - confirme que l'email est présent
- `User found by email` - confirme que l'utilisateur est trouvé
- `Successfully updated subscription` - confirme que l'abonnement est activé

### Dans `check-nowpayments-payment` :
- `User already has subscription` - confirme que l'abonnement est actif
- `Successfully updated subscription` - confirme l'activation

## 🚨 Si le problème persiste

1. **Vérifiez les logs Supabase** pour voir où le processus échoue
2. **Vérifiez que l'email de l'utilisateur** correspond exactement dans :
   - Supabase Auth
   - NOWPayments invoice
   - Table `subscribers`
3. **Testez avec un nouveau paiement** pour voir si le problème persiste
4. **Contactez le support NOWPayments** si le webhook n'est jamais appelé


# ✅ Vérification rapide après déploiement

## 🔍 Checklist rapide

### 1. Vérifier que les Edge Functions sont déployées

**GitHub Actions** :
- https://github.com/star-shaanti/trade-wave-ai/actions
- Vérifiez que le dernier workflow "Deploy Supabase Edge Functions" est ✅ vert

**Supabase Dashboard** :
- https://supabase.com/dashboard/project/taadbjuelxonszosfrsk/functions
- Vérifiez la date du dernier déploiement pour :
  - `check-nowpayments-payment`
  - `nowpayments-webhook`
  - `check-subscription`

### 2. Vérifier la configuration du webhook

**NOWPayments Dashboard** :
- https://nowpayments.io/dashboard
- Settings → IPN Callback
- URL doit être : `https://taadbjuelxonszosfrsk.supabase.co/functions/v1/nowpayments-webhook`

**Supabase** :
- https://supabase.com/dashboard/project/taadbjuelxonszosfrsk/settings/functions
- Vérifiez que `NOWPAYMENTS_IPN_SECRET_KEY` est configuré

### 3. Tester avec un paiement

1. Effectuez un paiement test
2. Vérifiez les logs Supabase :
   - https://supabase.com/dashboard/project/taadbjuelxonszosfrsk/logs/edge-logs
   - Filtrez par `nowpayments-webhook`
   - Vérifiez que le webhook est appelé et que l'abonnement est activé

## 🚨 Si le problème persiste

Voir le guide complet : `FIX_ABONNEMENT_APRES_DEPLOIEMENT.md`






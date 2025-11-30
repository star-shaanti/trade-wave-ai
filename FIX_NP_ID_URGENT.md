# 🚨 URGENT - Fix NP_id dans l'URL

## Problème identifié

Dans l'URL de redirection NOWPayments : `payment-success?method=nowpayments&NP_id=4959004355`

Le paramètre **`NP_id`** n'était **PAS extrait** et utilisé pour vérifier le paiement !

## Corrections appliquées

### 1. ✅ PaymentSuccess.tsx
- Extraction du paramètre `NP_id` depuis l'URL
- Utilisation de `NP_id` comme `payment_id` ou `invoice_id` si les autres paramètres ne sont pas disponibles
- Logs ajoutés pour voir quels IDs sont utilisés

### 2. ✅ Index.tsx
- Extraction de `NP_id` depuis l'URL dans la vérification automatique
- Priorité donnée à `NP_id` si présent

## Déploiement

### ⚠️ IMPORTANT - Vous devez redéployer le frontend !

Les modifications ont été faites dans :
- `src/pages/PaymentSuccess.tsx`
- `src/pages/Index.tsx`

**Si vous utilisez un service de déploiement automatique (Vercel, Netlify, etc.) :**
```bash
git add .
git commit -m "Fix: Extraction et utilisation du paramètre NP_id depuis l'URL NOWPayments"
git push
```

**Si vous déployez manuellement :**
- Reconstruisez votre application frontend
- Redéployez les fichiers modifiés

## Test

1. Effectuez un nouveau paiement
2. Vérifiez dans la console du navigateur que vous voyez :
   ```
   Invoice ID stocké: 4959004355
   Payment ID stocké: 4959004355
   ```
3. La fonction `check-nowpayments-payment` devrait maintenant recevoir le `NP_id` et pouvoir vérifier le paiement

## Notes

- `NP_id` peut être un `payment_id` ou un `invoice_id` selon NOWPayments
- Le code essaie maintenant les deux cas
- Si c'est un `payment_id`, la vérification sera plus directe
- Si c'est un `invoice_id`, la fonction récupérera le `payment_id` associé


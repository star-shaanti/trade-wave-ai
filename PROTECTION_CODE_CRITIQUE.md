# 🛡️ Protection du Code Critique

## ⚠️ Fichiers CRITIQUES - Ne PAS modifier sans vérification

Ces fichiers contiennent des corrections critiques pour les paiements crypto. **Ne les modifiez pas sans comprendre l'impact complet.**

### 🔴 Fichiers Ultra-Critiques

1. **`supabase/functions/nowpayments-webhook/index.ts`**
   - **Pourquoi critique** : Gère l'activation automatique des abonnements après paiement crypto
   - **Corrections importantes** :
     - Extraction du `user_id` depuis `order_id` avec regex
     - Récupération de l'email si `customer_email` manquant
     - Contournement de la contrainte `stripe_customer_id` avec valeur spéciale
   - **⚠️ Ne PAS modifier** :
     - La logique d'extraction du `user_id` (lignes ~151-190)
     - La valeur `nowpayments_${payment_id}` pour `stripe_customer_id` (ligne ~260)
     - La logique de récupération de l'email depuis `user_id`

2. **`src/hooks/useAuth.tsx`**
   - **Pourquoi critique** : Gère la vérification de l'abonnement côté client
   - **Corrections importantes** :
     - `checkSubscriptionWithRetry` avec gestion de session améliorée
     - Vérification que `session?.access_token` existe avant vérification
   - **⚠️ Ne PAS modifier** :
     - La logique de retry (lignes ~65-130)
     - La vérification de `session?.access_token` avant les appels

3. **`supabase/functions/check-nowpayments-payment/index.ts`**
   - **Pourquoi critique** : Vérifie les paiements crypto et active l'abonnement si nécessaire
   - **⚠️ Ne PAS modifier** :
     - La logique de vérification périodique
     - La vérification préalable si l'utilisateur est déjà abonné

## ✅ Stratégies de Protection

### 1. Créer une Branche de Protection

```bash
# Créer une branche de sauvegarde
git checkout -b backup/critical-payment-fix-$(date +%Y%m%d)
git push origin backup/critical-payment-fix-$(date +%Y%m%d)
```

### 2. Ajouter des Commentaires de Protection dans le Code

Ajoutez des commentaires comme :
```typescript
// ⚠️ CODE CRITIQUE - Ne pas modifier sans vérification complète
// Cette section gère l'extraction du user_id depuis order_id
// Modifié le: 2025-12-13 - Fix paiements crypto
```

### 3. Créer des Tests de Régression

Créez des tests pour vérifier que les fonctionnalités critiques fonctionnent toujours.

### 4. Documentation des Modifications

Documentez toutes les modifications dans ce fichier pour référence future.

## 🔒 Protection via Git

### Créer une Branche de Protection

1. **Créer une branche de sauvegarde** :
   ```bash
   git checkout -b backup/payment-fix-stable
   git push origin backup/payment-fix-stable
   ```

2. **Protéger la branche main** :
   - Allez sur : https://github.com/star-shaanti/trade-wave-ai/settings/branches
   - Ajoutez une règle de protection pour `main`
   - Exigez une review avant merge
   - Empêchez les force push

### Tags de Version

Créez un tag pour marquer cette version stable :
```bash
git tag -a v2.0.1-payment-fix -m "Fix critique: Paiements crypto fonctionnels"
git push origin v2.0.1-payment-fix
```

## 📝 Checklist avant Modification

Avant de modifier un fichier critique, vérifiez :

- [ ] J'ai compris pourquoi ce code existe
- [ ] J'ai testé l'impact de ma modification
- [ ] J'ai créé une branche de sauvegarde
- [ ] J'ai documenté ma modification
- [ ] J'ai testé les paiements crypto après modification

## 🚨 En Cas de Problème

Si vous modifiez accidentellement un fichier critique :

1. **Restaurez depuis Git** :
   ```bash
   git checkout HEAD -- supabase/functions/nowpayments-webhook/index.ts
   ```

2. **Ou restaurez depuis la branche de sauvegarde** :
   ```bash
   git checkout backup/payment-fix-stable -- supabase/functions/nowpayments-webhook/index.ts
   ```

## 📋 Fichiers à Surveiller lors des Déploiements

Lors de chaque déploiement, vérifiez que ces fichiers n'ont pas été modifiés accidentellement :

- `supabase/functions/nowpayments-webhook/index.ts`
- `src/hooks/useAuth.tsx`
- `supabase/functions/check-nowpayments-payment/index.ts`
- `src/pages/Index.tsx` (section vérification paiement)
- `src/pages/PaymentSuccess.tsx`

## 🔄 Processus de Déploiement Sécurisé

1. **Avant déploiement** :
   - Vérifiez les fichiers modifiés : `git diff`
   - Vérifiez que les fichiers critiques ne sont pas modifiés
   - Testez localement

2. **Après déploiement** :
   - Testez un paiement crypto
   - Vérifiez les logs Supabase
   - Vérifiez que l'abonnement est activé

3. **En cas d'erreur** :
   - Restaurez immédiatement depuis Git
   - Vérifiez les logs pour identifier le problème
   - Ne déployez pas d'autres modifications avant résolution





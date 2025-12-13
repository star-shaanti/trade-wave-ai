# 🛡️ Guide Rapide : Protéger le Code lors des Déploiements

## ✅ Ce qui a été fait

1. ✅ **Tag de version créé** : `v2.0.1-payment-fix`
2. ✅ **Branche de sauvegarde créée** : `backup/payment-fix-stable`
3. ✅ **Commentaires de protection ajoutés** dans le code critique
4. ✅ **Documentation créée** : `PROTECTION_CODE_CRITIQUE.md`

## 🔒 Protection GitHub (Recommandé)

### Étape 1 : Protéger la branche main

1. Allez sur : https://github.com/star-shaanti/trade-wave-ai/settings/branches
2. Cliquez sur **"Add rule"** ou **"Add branch protection rule"**
3. Configurez :
   - **Branch name pattern** : `main`
   - ✅ **Require a pull request before merging**
   - ✅ **Require approvals** : 1 (ou plus)
   - ✅ **Dismiss stale pull request approvals when new commits are pushed**
   - ✅ **Require status checks to pass before merging**
   - ✅ **Do not allow bypassing the above settings**

### Étape 2 : Créer un fichier `.github/CODEOWNERS`

Créez un fichier `.github/CODEOWNERS` pour protéger les fichiers critiques :

```
# Fichiers critiques - nécessitent review avant modification
supabase/functions/nowpayments-webhook/index.ts @star-shaanti
src/hooks/useAuth.tsx @star-shaanti
supabase/functions/check-nowpayments-payment/index.ts @star-shaanti
```

## 📋 Checklist avant chaque déploiement

Avant de pousser du code vers `main` :

- [ ] Vérifier les fichiers modifiés : `git diff`
- [ ] Vérifier que les fichiers critiques ne sont pas modifiés
- [ ] Si modification d'un fichier critique :
  - [ ] Créer une branche séparée
  - [ ] Tester complètement
  - [ ] Demander review si protection activée
- [ ] Tester les paiements crypto après déploiement

## 🔄 Restauration en cas de problème

### Option 1 : Restaurer depuis le tag

```bash
git checkout v2.0.1-payment-fix -- supabase/functions/nowpayments-webhook/index.ts
git commit -m "fix: Restaurer code critique depuis tag stable"
```

### Option 2 : Restaurer depuis la branche de sauvegarde

```bash
git checkout backup/payment-fix-stable -- supabase/functions/nowpayments-webhook/index.ts
git commit -m "fix: Restaurer code critique depuis branche de sauvegarde"
```

### Option 3 : Restaurer depuis un commit spécifique

```bash
# Trouver le commit
git log --oneline | grep "payment-fix"

# Restaurer depuis le commit
git checkout <commit-hash> -- supabase/functions/nowpayments-webhook/index.ts
```

## 🚨 Fichiers à NE JAMAIS modifier sans test

1. `supabase/functions/nowpayments-webhook/index.ts`
   - Extraction `user_id` depuis `order_id`
   - Valeur spéciale pour `stripe_customer_id`
   - Récupération email depuis `user_id`

2. `src/hooks/useAuth.tsx`
   - Fonction `checkSubscriptionWithRetry`
   - Vérification `session?.access_token`

3. `supabase/functions/check-nowpayments-payment/index.ts`
   - Vérification préalable abonnement
   - Logique de retry

## 📝 Bonnes Pratiques

1. **Toujours créer une branche** pour les modifications importantes
2. **Tester localement** avant de pousser
3. **Vérifier les logs Supabase** après chaque déploiement
4. **Tester un paiement crypto** après chaque déploiement
5. **Documenter** toute modification critique

## 🔍 Vérification Post-Déploiement

Après chaque déploiement, vérifiez :

1. ✅ Les logs Supabase pour `nowpayments-webhook`
2. ✅ Qu'un paiement test fonctionne
3. ✅ Que l'abonnement est activé automatiquement
4. ✅ Que le bouton "Start Signals" se débloque

## 📞 En cas de problème

1. **Ne pas paniquer** - le code est sauvegardé
2. **Restaurez immédiatement** depuis le tag ou la branche de sauvegarde
3. **Vérifiez les logs** pour identifier le problème
4. **Ne déployez pas d'autres modifications** avant résolution


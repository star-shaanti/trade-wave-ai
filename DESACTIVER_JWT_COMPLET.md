# ✅ Désactivation de "Verify JWT with legacy secret" pour toutes les fonctions

## Fichiers créés

J'ai créé des fichiers `config.toml` pour toutes vos fonctions pour désactiver la vérification JWT automatique :

- ✅ `supabase/functions/check-nowpayments-payment/config.toml`
- ✅ `supabase/functions/create-nowpayments-invoice/config.toml`
- ✅ `supabase/functions/nowpayments-webhook/config.toml`
- ✅ `supabase/functions/check-subscription/config.toml`
- ✅ `supabase/functions/create-payment/config.toml`
- ✅ `supabase/functions/customer-portal/config.toml`
- ✅ `supabase/functions/create-checkout/config.toml`
- ✅ `supabase/functions/stripe-webhook/config.toml` (déjà existant)

## Fichier principal mis à jour

Le fichier `supabase/config.toml` a été mis à jour pour inclure toutes les configurations.

## ⚠️ IMPORTANT : Sécurité

**Vos fonctions vérifient déjà le JWT manuellement dans leur code** (via `getUser(token)`), donc désactiver cette option ne réduit pas la sécurité. Cela permet simplement d'éviter les conflits avec la vérification automatique de Supabase.

## Déploiement

Pour que ces configurations prennent effet, vous devez :

### Option 1 : Via Dashboard Supabase (pour chaque fonction)

1. Allez sur : https://supabase.com/dashboard → Votre projet → Edge Functions
2. Pour chaque fonction, cliquez dessus
3. Cherchez "Settings" ou "Configuration"
4. Décochez "Verify JWT" ou "Verify JWT with legacy secret"
5. Sauvegardez

### Option 2 : Via Supabase CLI (déploiement automatique)

Si vous utilisez Supabase CLI, les fichiers config.toml seront pris en compte lors du déploiement.

## Pourquoi désactiver ?

- ✅ Évite les conflits entre vérification automatique et manuelle
- ✅ Donne plus de contrôle sur la gestion de l'authentification
- ✅ Évite les erreurs liées au "legacy secret"
- ✅ Les fonctions vérifient déjà le JWT dans le code, donc pas de risque de sécurité


# 🔑 Restauration des Clés d'Environnement

## 📌 Situation actuelle

Le fichier `.env` contient actuellement des valeurs placeholder. Les clés doivent être restaurées depuis vos services.

## ✅ Clés publiques récupérables depuis le code

J'ai trouvé vos clés **publiques Supabase** dans le code source (`src/integrations/supabase/client.ts`) :

```
VITE_SUPABASE_URL=https://taadbjuelxonszosfrsk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhYWRianVlbHhvbnN6b3NmcnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyNjM5MzYsImV4cCI6MjA2OTgzOTkzNn0.Z9Z_FFde9j9ajGD7tPWPh5tqQCf16Yp_5yigccg_HGY
```

Ces clés peuvent être ajoutées dans votre fichier `.env`.

## ⚠️ Clés secrètes à récupérer

Les clés **secrètes** ne sont **PAS** dans le code (c'est normal pour la sécurité) et doivent être récupérées depuis vos dashboards :

### 1. Clés Supabase

**Où les trouver :**
1. Allez sur : https://supabase.com/dashboard/project/taadbjuelxonszosfrsk/settings/api
2. Récupérez :
   - **`SUPABASE_URL`** : `https://taadbjuelxonszosfrsk.supabase.co` ✅ (déjà connue)
   - **`SUPABASE_ANON_KEY`** : Clé "anon" publique ✅ (déjà connue)
   - **`SUPABASE_SERVICE_ROLE_KEY`** : Clé "service_role" **SECRÈTE** ⚠️ (à récupérer)

### 2. Clés Stripe

**Où les trouver :**
1. Allez sur : https://dashboard.stripe.com/apikeys
2. Récupérez :
   - **`VITE_STRIPE_PUBLISHABLE_KEY`** : Clé publique (commence par `pk_...`)
   - **`STRIPE_SECRET_KEY`** : Clé secrète (commence par `sk_...`) ⚠️
3. Pour le webhook secret :
   - Allez sur : https://dashboard.stripe.com/webhooks
   - Cliquez sur votre webhook
   - Récupérez le **Signing secret** (commence par `whsec_...`)

### 3. Clés NOWPayments (si utilisé)

**Où les trouver :**
1. Allez sur : https://nowpayments.io/dashboard
2. Settings > API Keys
3. Récupérez :
   - **`NOWPAYMENTS_API_KEY`** ⚠️
   - **`NOWPAYMENTS_IPN_SECRET_KEY`** ⚠️

## 📝 Structure du fichier .env

Créez ou modifiez votre fichier `.env` avec cette structure :

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://taadbjuelxonszosfrsk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhYWRianVlbHhvbnN6b3NmcnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyNjM5MzYsImV4cCI6MjA2OTgzOTkzNn0.Z9Z_FFde9j9ajGD7tPWPh5tqQCf16Yp_5yigccg_HGY

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_... # À récupérer depuis Stripe Dashboard
STRIPE_SECRET_KEY=sk_live_... # À récupérer depuis Stripe Dashboard
STRIPE_WEBHOOK_SECRET=whsec_... # À récupérer depuis Stripe Webhooks

# Variables pour les fonctions Supabase
SUPABASE_URL=https://taadbjuelxonszosfrsk.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhYWRianVlbHhvbnN6b3NmcnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyNjM5MzYsImV4cCI6MjA2OTgzOTkzNn0.Z9Z_FFde9j9ajGD7tPWPh5tqQCf16Yp_5yigccg_HGY
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhYWRianVlbHhvbnN6b3NmcnNrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDI2MzkzNiwiZXhwIjoyMDY5ODM5OTM2fQ.xxx # À récupérer depuis Supabase Dashboard

# NOWPayments (si utilisé)
NOWPAYMENTS_API_KEY=... # À récupérer depuis NOWPayments Dashboard
NOWPAYMENTS_IPN_SECRET_KEY=... # À récupérer depuis NOWPayments Dashboard

# Site URL
PUBLIC_SITE_URL=https://realtimetradingsignals.com
```

## ⚠️ Important

1. **Le fichier `.env` n'est PAS versionné** (c'est normal - il est dans `.gitignore`)
2. **Les clés secrètes ne doivent JAMAIS être commitées dans Git**
3. **Les clés publiques Supabase sont déjà dans le code** (dans `src/integrations/supabase/client.ts`)
4. **Pour la production (Firebase)**, les clés sont configurées dans Supabase Dashboard > Edge Functions > Environment Variables

## 🔍 Vérification

Pour vérifier si vos clés fonctionnent :

```bash
# Vérifier que le fichier .env existe
ls -la .env

# Vérifier le contenu (sans afficher les clés secrètes)
cat .env | grep -E "^VITE_" | sed 's/=.*/=***/'
```

## 📌 Note

Le fichier `.env` est utilisé pour le développement local. Pour la production (Firebase Hosting), les variables d'environnement doivent être configurées dans :
- **Supabase Dashboard** > Settings > Edge Functions > Environment Variables
- **Firebase Hosting** (si nécessaire)

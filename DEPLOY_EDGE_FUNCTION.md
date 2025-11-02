# Guide de Déploiement de la Fonction Edge `create-payment`

## Option 1 : Via Dashboard Supabase (RECOMMANDÉ - Plus Simple)

### Étapes :

1. **Ouvrir le Dashboard Supabase**
   - Allez sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Sélectionnez votre projet : `taadbjuelxonszosfrsk`

2. **Naviguer vers Edge Functions**
   - Dans le menu de gauche, cliquez sur **"Edge Functions"**
   - Cherchez la fonction **`create-payment`**
   - Si elle n'existe pas, cliquez sur **"Create a new function"** et nommez-la `create-payment`

3. **Copier le code**
   - Ouvrez le fichier `supabase/functions/create-payment/index.ts` dans votre éditeur
   - Copiez tout le contenu du fichier

4. **Coller et déployer**
   - Dans le Dashboard Supabase, collez le code dans l'éditeur
   - Cliquez sur **"Deploy"** ou **"Save"**

5. **Configurer les variables d'environnement**
   - Dans le Dashboard Supabase, allez dans **"Project Settings"** > **"Edge Functions"** > **"Secrets"**
   - Vérifiez que ces variables sont définies :
     - `SUPABASE_URL` (généralement automatique)
     - `SUPABASE_ANON_KEY` (généralement automatique)
     - `STRIPE_SECRET_KEY` (à définir manuellement avec votre clé secrète Stripe)

## Option 2 : Via Supabase CLI (Pour les développeurs)

### Installation de Supabase CLI

#### Sur Windows (PowerShell) :

```powershell
# Installer Scoop si vous ne l'avez pas
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex

# Installer Supabase CLI
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

#### Ou via npm :

```powershell
npm install -g supabase
```

### Déploiement

1. **Se connecter à Supabase**
```powershell
supabase login
```

2. **Lier le projet**
```powershell
supabase link --project-ref taadbjuelxonszosfrsk
```

3. **Déployer la fonction**
```powershell
supabase functions deploy create-payment
```

4. **Configurer les secrets**
```powershell
supabase secrets set STRIPE_SECRET_KEY=sk_live_votre_cle_secrete
```

## Vérification après déploiement

1. Dans le Dashboard Supabase, allez dans **"Edge Functions"** > **`create-payment`**
2. Cliquez sur **"Logs"** pour voir les logs en temps réel
3. Testez un abonnement sur votre site pour vérifier que ça fonctionne

## Dépannage

Si vous rencontrez des erreurs :

1. **Vérifiez les variables d'environnement** dans Supabase Dashboard
2. **Vérifiez les logs** de la fonction Edge dans le Dashboard
3. **Testez avec la console du navigateur** (F12) pour voir les erreurs détaillées


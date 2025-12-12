# Instructions pour créer l'utilisateur premium de test

## Utilisateur de test
- **Email:** starshiyer@gmail.com
- **Mot de passe:** aaaaaa
- **Statut:** Premium

## Méthode 1: Via Supabase Dashboard (Recommandé)

### Étape 1: Créer l'utilisateur
1. Allez dans votre projet Supabase
2. Naviguez vers **Authentication** > **Users**
3. Cliquez sur **Add User** > **Create new user**
4. Entrez:
   - Email: `starshiyer@gmail.com`
   - Password: `aaaaaa`
   - Auto Confirm User: ✅ (cocher)
5. Cliquez sur **Create User**

### Étape 2: Activer l'abonnement premium
1. Allez dans **SQL Editor**
2. Exécutez le script `CREATE_TEST_PREMIUM_USER.sql`
3. Vérifiez que l'utilisateur a bien l'abonnement premium

## Méthode 2: Via SQL Direct

Exécutez ce script dans Supabase SQL Editor:

```sql
-- Activer l'abonnement premium pour starshiyer@gmail.com
INSERT INTO public.subscribers (
  email,
  user_id,
  subscribed,
  subscription_tier,
  subscription_end,
  payment_source,
  updated_at,
  created_at
)
SELECT 
  'starshiyer@gmail.com' AS email,
  u.id AS user_id,
  true AS subscribed,
  'Premium' AS subscription_tier,
  NOW() + INTERVAL '365 days' AS subscription_end,
  'test' AS payment_source,
  NOW() AS updated_at,
  NOW() AS created_at
FROM auth.users u
WHERE u.email = 'starshiyer@gmail.com'
ON CONFLICT (email) 
DO UPDATE SET
  user_id = COALESCE(EXCLUDED.user_id, subscribers.user_id),
  subscribed = true,
  subscription_tier = 'Premium',
  subscription_end = NOW() + INTERVAL '365 days',
  payment_source = 'test',
  updated_at = NOW();
```

## Méthode 3: Via Edge Function (Si vous avez les droits)

1. Créez une Edge Function temporaire
2. Utilisez le code de `create-test-user.ts`
3. Appelez la fonction avec les variables d'environnement appropriées

## Vérification

Après avoir créé l'utilisateur et activé l'abonnement, vérifiez avec:

```sql
SELECT 
  s.email,
  s.user_id,
  s.subscribed,
  s.subscription_tier,
  s.subscription_end,
  u.email AS auth_email
FROM public.subscribers s
LEFT JOIN auth.users u ON u.id = s.user_id
WHERE s.email = 'starshiyer@gmail.com';
```

Vous devriez voir:
- `subscribed: true`
- `subscription_tier: Premium`
- `subscription_end: [date dans 1 an]`

## Connexion

Une fois créé, vous pouvez vous connecter avec:
- Email: `starshiyer@gmail.com`
- Mot de passe: `aaaaaa`

L'utilisateur aura automatiquement accès aux signaux premium!


-- ============================================
-- SCRIPT SQL : Créer un utilisateur premium de test
-- Email: starshiyer@gmail.com
-- Mot de passe: aaaaaa
-- ============================================

-- IMPORTANT: Ce script doit être exécuté dans Supabase SQL Editor
-- L'utilisateur doit d'abord être créé via l'interface d'authentification
-- ou via l'API Supabase Auth, puis ce script active l'abonnement premium

-- Étape 1: Vérifier si l'utilisateur existe dans auth.users
-- Note: Vous devez créer l'utilisateur d'abord via l'interface Supabase Auth
-- ou utiliser: supabase.auth.admin.createUser() dans une Edge Function

-- Étape 2: Activer l'abonnement premium pour cet utilisateur
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
  NOW() + INTERVAL '365 days' AS subscription_end, -- 1 an d'abonnement
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

-- Vérifier le résultat
SELECT 
  email,
  user_id,
  subscribed,
  subscription_tier,
  subscription_end,
  payment_source,
  updated_at
FROM public.subscribers
WHERE email = 'starshiyer@gmail.com';

-- Si l'utilisateur n'existe pas encore dans auth.users, vous devez le créer d'abord
-- via l'interface Supabase Auth ou utiliser cette commande (nécessite les droits admin):
-- 
-- INSERT INTO auth.users (
--   instance_id,
--   id,
--   aud,
--   role,
--   email,
--   encrypted_password,
--   email_confirmed_at,
--   created_at,
--   updated_at
-- )
-- VALUES (
--   '00000000-0000-0000-0000-000000000000',
--   gen_random_uuid(),
--   'authenticated',
--   'authenticated',
--   'starshiyer@gmail.com',
--   crypt('aaaaaa', gen_salt('bf')), -- Hash du mot de passe
--   NOW(),
--   NOW(),
--   NOW()
-- );


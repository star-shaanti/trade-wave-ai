-- ============================================
-- SCRIPT DE NETTOYAGE DES ABONNEMENTS FRAUDULEUX
-- À exécuter dans Supabase SQL Editor
-- ============================================

-- ÉTAPE 1: Voir tous les abonnés actuels
SELECT 
  id,
  email,
  user_id,
  stripe_customer_id,
  subscribed,
  subscription_tier,
  subscription_end,
  created_at,
  updated_at
FROM subscribers
ORDER BY created_at DESC;

-- ============================================
-- ÉTAPE 2: Identifier les abonnements SANS preuve de paiement
-- (Pas de stripe_customer_id = probablement frauduleux)
-- ============================================
SELECT 
  id,
  email,
  subscribed,
  subscription_tier,
  subscription_end,
  stripe_customer_id,
  created_at
FROM subscribers
WHERE subscribed = true 
  AND stripe_customer_id IS NULL
ORDER BY created_at DESC;

-- ============================================
-- ÉTAPE 3: SUPPRIMER les abonnements frauduleux
-- (Décommentez la ligne ci-dessous pour exécuter)
-- ============================================

-- OPTION A: Supprimer TOUS les abonnés sans stripe_customer_id
-- DELETE FROM subscribers WHERE stripe_customer_id IS NULL;

-- OPTION B: Supprimer TOUS les abonnés (réinitialisation complète)
-- ATTENTION: Cela supprime TOUS les abonnements, y compris les légitimes!
-- DELETE FROM subscribers;

-- OPTION C: Marquer comme non abonnés au lieu de supprimer
-- UPDATE subscribers 
-- SET subscribed = false, subscription_tier = null, subscription_end = null 
-- WHERE stripe_customer_id IS NULL;

-- ============================================
-- ÉTAPE 4: Vérifier le résultat
-- ============================================
SELECT 
  COUNT(*) as total_subscribers,
  SUM(CASE WHEN subscribed = true THEN 1 ELSE 0 END) as active_subscriptions,
  SUM(CASE WHEN stripe_customer_id IS NOT NULL THEN 1 ELSE 0 END) as with_stripe_id
FROM subscribers;



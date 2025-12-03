-- ============================================
-- SCRIPT SQL : Activer Tous les Abonnements
-- Pour tous les paiements NOWPayments "Fini"
-- ============================================

WITH paiements AS (
  -- Liste de tous les paiements avec leur Order ID, montant et tier
  SELECT 'eba08474-1fda-492e-b711-4381457efb09-1764458813894' AS order_id, 9 AS amount_usd, 'Basic' AS tier
  UNION ALL SELECT 'eba08474-1fda-492e-b711-4381457efb09-1764441412309', 9, 'Basic'
  UNION ALL SELECT 'eba08474-1fda-492e-b711-4381457efb09-1764432405624', 9, 'Basic'
  UNION ALL SELECT '1ce8a24e-b6ec-445b-9e3a-1fd0a8473b5a-1764432403080', 9, 'Basic'
  UNION ALL SELECT 'eba08474-1fda-492e-b711-4381457efb09-1764428852089', 9, 'Basic'
  UNION ALL SELECT '9da5e307-5b62-4aa2-ad2b-8cbdb3e3b1c4-1764413738497', 14, 'Premium'
  UNION ALL SELECT '71f07e80-f830-4326-b676-1dfd44f7875d-1763897862540', 11, 'Premium'
  UNION ALL SELECT 'f6f64549-7ffa-4f9f-b020-16e20ff5a1fe-1763649919992', 11, 'Premium'
  UNION ALL SELECT '227c7e0d-a517-4cea-81ca-895dca7c271b-1764186812408', 99, 'Enterprise'
  UNION ALL SELECT '8630afb9-abdb-42b1-81f1-c79116cf05d9-1763914026586', 16, 'Premium'
  UNION ALL SELECT '23ee9ce9-737f-4297-ad84-af573ef36ba2-1764218101719', 35, 'Enterprise'
),
user_ids_extracted AS (
  SELECT 
    order_id,
    amount_usd,
    tier,
    -- Extraire le user_id (les 5 premiers segments du UUID) et convertir en UUID
    (array_to_string((string_to_array(order_id, '-'))[1:5], '-'))::uuid AS user_id
  FROM paiements
),
user_info AS (
  SELECT 
    u.id,
    u.email,
    oi.amount_usd,
    oi.tier,
    oi.order_id
  FROM user_ids_extracted oi
  LEFT JOIN auth.users u ON u.id = oi.user_id
  WHERE u.email IS NOT NULL
),
-- Gérer les utilisateurs avec plusieurs paiements : prendre le tier le plus élevé
max_tier_per_user AS (
  SELECT 
    email,
    id AS user_id,
    MAX(CASE tier 
      WHEN 'Enterprise' THEN 3
      WHEN 'Premium' THEN 2
      WHEN 'Basic' THEN 1
      ELSE 1
    END) AS tier_priority,
    MAX(amount_usd) AS max_amount
  FROM user_info
  GROUP BY email, id
)
-- Activer tous les abonnements en une fois
INSERT INTO public.subscribers (email, user_id, subscribed, subscription_tier, subscription_end, updated_at)
SELECT 
  mtu.email,
  mtu.user_id,
  true AS subscribed,
  CASE mtu.tier_priority
    WHEN 3 THEN 'Enterprise'
    WHEN 2 THEN 'Premium'
    ELSE 'Basic'
  END AS subscription_tier,
  NOW() + INTERVAL '30 days' AS subscription_end,
  NOW() AS updated_at
FROM max_tier_per_user mtu
ON CONFLICT (email) 
DO UPDATE SET
  user_id = COALESCE(EXCLUDED.user_id, subscribers.user_id),
  subscribed = true,
  subscription_tier = EXCLUDED.subscription_tier,
  subscription_end = NOW() + INTERVAL '30 days',
  updated_at = NOW();

-- Afficher le résultat : tous les utilisateurs activés
SELECT 
  email,
  user_id,
  subscribed,
  subscription_tier,
  subscription_end,
  updated_at
FROM public.subscribers
WHERE user_id IN (
  SELECT DISTINCT (array_to_string((string_to_array(order_id, '-'))[1:5], '-'))::uuid AS user_id
  FROM (
    SELECT 'eba08474-1fda-492e-b711-4381457efb09-1764458813894' AS order_id
    UNION ALL SELECT 'eba08474-1fda-492e-b711-4381457efb09-1764441412309'
    UNION ALL SELECT 'eba08474-1fda-492e-b711-4381457efb09-1764432405624'
    UNION ALL SELECT '1ce8a24e-b6ec-445b-9e3a-1fd0a8473b5a-1764432403080'
    UNION ALL SELECT 'eba08474-1fda-492e-b711-4381457efb09-1764428852089'
    UNION ALL SELECT '9da5e307-5b62-4aa2-ad2b-8cbdb3e3b1c4-1764413738497'
    UNION ALL SELECT '71f07e80-f830-4326-b676-1dfd44f7875d-1763897862540'
    UNION ALL SELECT 'f6f64549-7ffa-4f9f-b020-16e20ff5a1fe-1763649919992'
    UNION ALL SELECT '227c7e0d-a517-4cea-81ca-895dca7c271b-1764186812408'
    UNION ALL SELECT '8630afb9-abdb-42b1-81f1-c79116cf05d9-1763914026586'
    UNION ALL SELECT '23ee9ce9-737f-4297-ad84-af573ef36ba2-1764218101719'
  ) paiements
)
ORDER BY updated_at DESC;


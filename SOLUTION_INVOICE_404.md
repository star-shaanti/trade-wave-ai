# 🔧 SOLUTION - Problème Invoice 404

## Problème identifié

Les utilisateurs rencontrent le message "Invoice introuvable" même après avoir effectué un paiement. Les logs Supabase montrent que l'invoice retourne un **404** dans l'API NOWPayments.

## Causes possibles

1. **Le webhook a déjà traité le paiement** mais l'invoice a été supprimée ou expirée dans NOWPayments
2. **L'invoice_id stocké ne correspond pas** à celui utilisé dans NOWPayments
3. **L'invoice n'a pas encore été créée** dans NOWPayments au moment de la vérification

## Solutions implémentées

### 1. Vérification préalable de l'abonnement ✅

**Fichier modifié:** `supabase/functions/check-nowpayments-payment/index.ts`

- **AVANT** de chercher l'invoice dans NOWPayments, la fonction vérifie maintenant si l'utilisateur est **déjà abonné**
- Si l'utilisateur est déjà abonné, la fonction retourne immédiatement `subscription_activated: true` sans chercher l'invoice
- Cela résout le cas où le webhook a déjà traité le paiement mais l'invoice n'existe plus

**Code ajouté (lignes 89-127):**
```typescript
// IMPORTANT: Vérifier d'abord si l'utilisateur est déjà abonné
// Le webhook peut avoir déjà traité le paiement même si l'invoice n'existe plus
const serviceRoleClient = createClient(...);
const { data: existingSubscription } = await serviceRoleClient
  .from("subscribers")
  .select("*")
  .eq("email", userData.user.email || "")
  .single();

if (existingSubscription && existingSubscription.subscribed) {
  // Retourner immédiatement que l'abonnement est actif
}
```

### 2. Vérification supplémentaire en cas de 404 ✅

**Fichier modifié:** `supabase/functions/check-nowpayments-payment/index.ts`

- Si l'invoice retourne **404**, la fonction vérifie **encore une fois** si l'utilisateur est abonné
- Si oui, elle retourne `already_subscribed: true` au lieu d'une erreur
- Cela évite d'afficher "Invoice introuvable" quand le paiement a déjà été traité

**Code ajouté (lignes 244-279):**
```typescript
} else if (invoiceResponse.status === 404) {
  // Vérifier à nouveau si l'utilisateur est déjà abonné
  const { data: subscriptionCheck } = await serviceRoleClient
    .from("subscribers")
    .select("*")
    .eq("email", userData.user.email || "")
    .single();
  
  if (subscriptionCheck && subscriptionCheck.subscribed) {
    // Retourner que l'abonnement est déjà actif
    return { already_subscribed: true, subscription_activated: true };
  }
}
```

### 3. Logs détaillés dans create-nowpayments-invoice ✅

**Fichier modifié:** `supabase/functions/create-nowpayments-invoice/index.ts`

- Ajout de logs détaillés pour voir exactement ce que NOWPayments retourne
- Extraction améliorée de l'invoice_id depuis plusieurs sources :
  - `invoice.id`
  - `invoice.invoice_id`
  - Paramètre `iid` dans l'URL de l'invoice
  - Path de l'URL de l'invoice
- Cela aide à comprendre pourquoi certains invoice_id ne fonctionnent pas

### 4. Gestion côté client du cas "already_subscribed" ✅

**Fichier modifié:** `src/pages/Index.tsx`

- La fonction `checkPaymentStatus` gère maintenant le cas où `data.already_subscribed === true`
- Affiche un message "Abonnement déjà actif" au lieu d'une erreur
- Nettoie les identifiants de paiement et recharge la page

## 📦 Déploiement

### Étape 1: Déployer les fonctions Edge

**Fonction 1: `check-nowpayments-payment`**

1. Ouvrez `supabase/functions/check-nowpayments-payment/index.ts`
2. Copiez **TOUT** le contenu (Ctrl+A, Ctrl+C)
3. Allez sur https://supabase.com/dashboard → Votre projet → **Edge Functions** → `check-nowpayments-payment`
4. Collez le code (Ctrl+V) dans l'éditeur
5. Cliquez sur **"Deploy"**
6. Attendez que le déploiement se termine

**Fonction 2: `create-nowpayments-invoice`**

1. Ouvrez `supabase/functions/create-nowpayments-invoice/index.ts`
2. Copiez **TOUT** le contenu (Ctrl+A, Ctrl+C)
3. Allez sur https://supabase.com/dashboard → Votre projet → **Edge Functions** → `create-nowpayments-invoice`
4. Collez le code (Ctrl+V) dans l'éditeur
5. Cliquez sur **"Deploy"**
6. Attendez que le déploiement se termine

### Étape 2: Déployer le code frontend

Le code frontend (`src/pages/Index.tsx`) a été modifié mais n'a pas besoin d'être redéployé sur Supabase. Si vous utilisez un service de déploiement (Vercel, Netlify, etc.), poussez les changements vers Git :

```bash
git add .
git commit -m "Amélioration gestion invoices 404 - vérification abonnement existant"
git push
```

## 🧪 Test

1. **Effectuez un nouveau paiement**
2. **Vérifiez les logs Supabase** pour voir les nouveaux messages :
   - `[CHECK-NOWPAYMENTS-PAYMENT] User already has subscription`
   - `[CREATE-NOWPAYMENTS-INVOICE] Invoice created successfully`
3. **Même si l'invoice retourne 404**, le bouton "Start Signals" devrait se débloquer si :
   - L'utilisateur est déjà abonné (webhook a traité le paiement)
   - Ou le paiement est en attente (le webhook traitera plus tard)

## 📊 Logs à surveiller

Dans Supabase Dashboard → Edge Functions → Logs, vous devriez voir :

1. **Lors de la création de l'invoice:**
   ```
   [CREATE-NOWPAYMENTS-INVOICE] Invoice created successfully
   ```

2. **Lors de la vérification du paiement:**
   ```
   [CHECK-NOWPAYMENTS-PAYMENT] Request received
   [CHECK-NOWPAYMENTS-PAYMENT] User already has subscription
   ```
   Ou :
   ```
   [CHECK-NOWPAYMENTS-PAYMENT] Invoice not found in NOWPayments - checking if user is already subscribed
   ```

## ⚠️ Important

- Le message "Invoice introuvable" peut toujours apparaître, mais maintenant :
  - Si l'utilisateur est **déjà abonné**, le bouton "Start Signals" se débloquera automatiquement
  - Si l'utilisateur n'est **pas encore abonné**, le webhook activera l'abonnement automatiquement une fois le paiement confirmé
- Les invoices peuvent être supprimées ou expirées dans NOWPayments, mais cela n'affecte pas l'activation de l'abonnement si le webhook a déjà traité le paiement

## ✅ Résultat attendu

Après le déploiement :
- ✅ Le bouton "Start Signals" se débloque même si l'invoice retourne 404
- ✅ Les utilisateurs voient "Abonnement déjà actif" au lieu d'erreur si le webhook a déjà traité le paiement
- ✅ Les logs sont plus détaillés pour diagnostiquer les problèmes futurs
- ✅ L'invoice_id est extrait correctement depuis plusieurs sources



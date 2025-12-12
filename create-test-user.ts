// Script pour créer un utilisateur premium de test
// Exécuter avec: npx tsx create-test-user.ts
// OU dans Supabase Edge Function

import { createClient } from '@supabase/supabase-js';

// Récupérer les variables d'environnement
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
  process.exit(1);
}

// Créer un client Supabase avec les droits admin
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTestPremiumUser() {
  const email = 'starshiyer@gmail.com';
  const password = 'aaaaaa';

  try {
    console.log('🔄 Création de l\'utilisateur de test...');

    // Étape 1: Créer l'utilisateur dans auth.users
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Confirmer l'email automatiquement
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('ℹ️  L\'utilisateur existe déjà, récupération de l\'ID...');
        
        // Récupérer l'utilisateur existant
        const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
        const user = existingUser?.users.find(u => u.email === email);
        
        if (!user) {
          throw new Error('Utilisateur existe mais introuvable');
        }
        
        // Activer l'abonnement premium
        await activatePremiumSubscription(user.id, email);
        return;
      }
      throw authError;
    }

    if (!authData.user) {
      throw new Error('Utilisateur non créé');
    }

    console.log('✅ Utilisateur créé:', authData.user.id);

    // Étape 2: Activer l'abonnement premium
    await activatePremiumSubscription(authData.user.id, email);

    console.log('✅ Utilisateur premium de test créé avec succès!');
    console.log('📧 Email:', email);
    console.log('🔑 Mot de passe:', password);
    console.log('👑 Statut: Premium');

  } catch (error: any) {
    console.error('❌ Erreur:', error.message);
    
    // Si l'utilisateur existe déjà, essayer d'activer l'abonnement
    if (error.message.includes('already registered') || error.message.includes('User already registered')) {
      console.log('🔄 Tentative d\'activation de l\'abonnement pour l\'utilisateur existant...');
      
      const { data: users } = await supabaseAdmin.auth.admin.listUsers();
      const user = users?.users.find(u => u.email === email);
      
      if (user) {
        await activatePremiumSubscription(user.id, email);
      } else {
        console.error('❌ Utilisateur introuvable');
      }
    }
  }
}

async function activatePremiumSubscription(userId: string, email: string) {
  console.log('🔄 Activation de l\'abonnement premium...');

  const { data, error } = await supabaseAdmin
    .from('subscribers')
    .upsert({
      email: email,
      user_id: userId,
      subscribed: true,
      subscription_tier: 'Premium',
      subscription_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 an
      payment_source: 'test',
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'email'
    });

  if (error) {
    throw new Error(`Erreur lors de l'activation de l'abonnement: ${error.message}`);
  }

  console.log('✅ Abonnement premium activé!');
  console.log('📊 Données:', data);
}

// Exécuter le script
createTestPremiumUser()
  .then(() => {
    console.log('✅ Script terminé avec succès');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });


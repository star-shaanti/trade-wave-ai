# 🔑 Guide : Mettre à jour le token GitHub avec permission workflow

## 📋 Étapes pour créer un nouveau token avec permission workflow

### Étape 1 : Créer un nouveau token GitHub

1. **Allez sur** : https://github.com/settings/tokens
2. **Cliquez sur** "Generate new token" → "Generate new token (classic)"
3. **Donnez un nom** au token (ex: "Trade Wave AI - Workflow Access")
4. **Sélectionnez les permissions** :
   - ✅ **repo** (accès complet au dépôt)
   - ✅ **workflow** (modifier les workflows GitHub Actions) ⚠️ **IMPORTANT**
5. **Choisissez l'expiration** :
   - Recommandé : "No expiration" (ou une date lointaine)
6. **Cliquez sur** "Generate token"
7. **⚠️ COPIEZ LE TOKEN IMMÉDIATEMENT** (vous ne pourrez plus le voir après)

### Étape 2 : Mettre à jour le token dans Git

#### Option A : Via Git Credential Manager (Windows)

1. **Ouvrez PowerShell** en tant qu'administrateur
2. **Exécutez** :
   ```powershell
   git credential-manager-core erase
   ```
3. **Lors du prochain push**, Git vous demandera vos identifiants
4. **Utilisez** :
   - **Username** : Votre nom d'utilisateur GitHub
   - **Password** : Le nouveau token (pas votre mot de passe GitHub)

#### Option B : Configurer Git pour utiliser le token

1. **Ouvrez PowerShell** dans le dossier du projet
2. **Exécutez** :
   ```powershell
   git remote set-url origin https://VOTRE_USERNAME:VOTRE_TOKEN@github.com/star-shaanti/trade-wave-ai.git
   ```
   Remplacez :
   - `VOTRE_USERNAME` par votre nom d'utilisateur GitHub
   - `VOTRE_TOKEN` par le token que vous venez de créer

#### Option C : Utiliser Git Credential Store (Recommandé)

1. **Ouvrez PowerShell** dans le dossier du projet
2. **Exécutez** :
   ```powershell
   git config --global credential.helper store
   ```
3. **Lors du prochain push**, entrez :
   - **Username** : Votre nom d'utilisateur GitHub
   - **Password** : Le nouveau token
4. Git sauvegardera automatiquement les identifiants

### Étape 3 : Tester le push

1. **Récupérez le fichier workflow mis de côté** :
   ```powershell
   git stash pop
   ```

2. **Ajoutez et commitez** :
   ```powershell
   git add .github/workflows/deploy-edge-functions.yml
   git commit -m "feat: Ajouter déclenchement manuel pour le workflow de déploiement Supabase"
   ```

3. **Poussez** :
   ```powershell
   git push origin main
   ```

4. **Si ça fonctionne**, vous verrez :
   ```
   To https://github.com/star-shaanti/trade-wave-ai.git
     5a3942e..xxxxxxx  main -> main
   ```

### Étape 4 : Vérifier que le workflow fonctionne

1. **Allez sur** : https://github.com/star-shaanti/trade-wave-ai/actions
2. **Vérifiez** que le workflow "Deploy Supabase Edge Functions" se déclenche
3. **Vérifiez** que les Edge Functions sont déployées sur Supabase

## 🔒 Sécurité

⚠️ **IMPORTANT** :
- Ne partagez **JAMAIS** votre token GitHub
- Ne commitez **JAMAIS** le token dans le code
- Si le token est compromis, révoquez-le immédiatement sur GitHub

## ❓ Dépannage

### Erreur : "Authentication failed"
- Vérifiez que le token a bien la permission `workflow`
- Vérifiez que vous utilisez le token (pas votre mot de passe)

### Erreur : "Permission denied"
- Vérifiez que le token a la permission `repo` (accès complet)
- Vérifiez que vous avez les droits sur le dépôt

### Le token ne fonctionne toujours pas
- Créez un nouveau token avec toutes les permissions nécessaires
- Révoquez l'ancien token si nécessaire

## 📝 Résumé des permissions nécessaires

Pour ce projet, votre token GitHub doit avoir :
- ✅ **repo** : Accès complet au dépôt
- ✅ **workflow** : Modifier les workflows GitHub Actions

Ces deux permissions sont **essentielles** pour pousser les modifications de workflow.






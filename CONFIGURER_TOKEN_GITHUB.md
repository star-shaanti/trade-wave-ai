# 🔑 Configuration rapide du token GitHub

## ⚠️ IMPORTANT : Le token ne doit PAS être dans le nom du fichier !

Le token GitHub doit être entré **pendant l'exécution** du script, pas dans le nom du fichier.

## 🚀 Méthode simple (3 étapes)

### Étape 1 : Créer le token GitHub

1. Allez sur : **https://github.com/settings/tokens**
2. Cliquez sur **"Generate new token"** → **"Generate new token (classic)"**
3. Nom : `Trade Wave AI - Workflow`
4. **Permissions** :
   - ✅ **repo** (toutes les cases)
   - ✅ **workflow** (modifier les workflows)
5. Cliquez sur **"Generate token"**
6. **COPIEZ LE TOKEN** (vous ne le reverrez plus !)

### Étape 2 : Configurer Git avec le token

**Ouvrez PowerShell** dans le dossier `trade-wave-ai` et exécutez :

```powershell
# 1. Configurer le credential helper
git config --global credential.helper store

# 2. Configurer l'URL distante (remplacez USERNAME et TOKEN)
git remote set-url origin https://VOTRE_USERNAME:VOTRE_TOKEN@github.com/star-shaanti/trade-wave-ai.git
```

**Exemple** :
```powershell
git remote set-url origin https://star-shaanti:ghp_jGIACBEQdWF8GQ0wBpgsrA9zwkQWLQZ@github.com/star-shaanti/trade-wave-ai.git
```

### Étape 3 : Tester et pousser

```powershell
# Récupérer le fichier workflow
git stash pop

# Ajouter et commiter
git add .github/workflows/deploy-edge-functions.yml
git commit -m "feat: Ajouter déclenchement manuel pour le workflow"

# Pousser (devrait maintenant fonctionner)
git push origin main
```

## ✅ Vérification

Si tout fonctionne, vous verrez :
```
To https://github.com/star-shaanti/trade-wave-ai.git
   5a3942e..xxxxxxx  main -> main
```

## 🔒 Sécurité

- ⚠️ Ne partagez JAMAIS votre token
- ⚠️ Ne commitez JAMAIS le token dans le code
- ⚠️ Le token est maintenant stocké dans Git Credential Store (fichier texte)






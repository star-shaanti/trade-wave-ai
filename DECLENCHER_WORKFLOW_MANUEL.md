# 🚀 Comment déclencher le workflow manuellement

## Méthode 1 : Depuis GitHub Actions (Recommandé)

1. **Allez sur** : https://github.com/star-shaanti/trade-wave-ai/actions
2. **Cliquez sur** "Deploy Supabase Edge Functions" dans la liste des workflows (à gauche)
3. **Cliquez sur** "Run workflow" (bouton en haut à droite)
4. **Sélectionnez** la branche `main`
5. **Cliquez sur** "Run workflow"

Le workflow se déclenchera immédiatement et déploiera toutes les Edge Functions.

## Méthode 2 : Modifier un fichier Edge Function

Si vous voulez que le workflow se déclenche automatiquement, modifiez n'importe quel fichier dans `supabase/functions/**` :

```powershell
# Ajouter un commentaire dans un fichier Edge Function
# Par exemple, dans check-subscription/index.ts
```

Puis :
```powershell
git add supabase/functions/check-subscription/index.ts
git commit -m "Trigger: Déclencher le déploiement des Edge Functions"
git push origin main
```

## Pourquoi le workflow ne s'est pas déclenché ?

Le workflow se déclenche **automatiquement** seulement quand :
- ✅ Des fichiers dans `supabase/functions/**` sont modifiés
- ✅ Le fichier `.github/workflows/deploy-edge-functions.yml` est modifié
- ✅ Le fichier `supabase/config.toml` est modifié

Le dernier commit (`8be4fa7`) ne modifiait que `src/pages/Index.tsx`, donc le workflow ne s'est pas déclenché automatiquement. C'est **normal** et **attendu**.

## Vérifier que le workflow fonctionne

Après avoir déclenché le workflow manuellement :
1. Allez sur : https://github.com/star-shaanti/trade-wave-ai/actions
2. Vous devriez voir le workflow en cours d'exécution
3. Une fois terminé, vérifiez sur Supabase que les Edge Functions sont à jour






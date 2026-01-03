# Script PowerShell pour configurer le token GitHub avec permission workflow
# Usage: .\setup-github-token.ps1

Write-Host "🔑 Configuration du token GitHub avec permission workflow" -ForegroundColor Cyan
Write-Host ""

# Demander le nom d'utilisateur GitHub
$username = Read-Host "Entrez votre nom d'utilisateur GitHub"

# Demander le token
Write-Host ""
Write-Host "⚠️  IMPORTANT: Le token doit avoir les permissions 'repo' et 'workflow'" -ForegroundColor Yellow
Write-Host "   Créez un token sur: https://github.com/settings/tokens" -ForegroundColor Yellow
Write-Host ""
$token = Read-Host "Entrez votre token GitHub" -AsSecureString
$tokenPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($token)
)

# Configurer Git Credential Helper
Write-Host ""
Write-Host "📝 Configuration de Git Credential Helper..." -ForegroundColor Cyan
git config --global credential.helper store

# Configurer l'URL distante avec le token
Write-Host ""
Write-Host "🔗 Configuration de l'URL distante..." -ForegroundColor Cyan
$remoteUrl = "https://${username}:${tokenPlain}@github.com/star-shaanti/trade-wave-ai.git"
git remote set-url origin $remoteUrl

# Nettoyer le token de la mémoire
$tokenPlain = $null
[GC]::Collect()

Write-Host ""
Write-Host "✅ Configuration terminée!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Prochaines étapes:" -ForegroundColor Cyan
Write-Host "   1. Récupérez le fichier workflow: git stash pop" -ForegroundColor White
Write-Host "   2. Ajoutez le fichier: git add .github/workflows/deploy-edge-functions.yml" -ForegroundColor White
Write-Host "   3. Commitez: git commit -m 'feat: Ajouter déclenchement manuel pour le workflow'" -ForegroundColor White
Write-Host "   4. Poussez: git push origin main" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  Note: Le token est maintenant stocké dans Git Credential Store" -ForegroundColor Yellow






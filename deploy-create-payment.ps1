# Script PowerShell pour préparer le déploiement de la fonction Edge create-payment
# Ce script affiche le code à copier dans le Dashboard Supabase

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Déploiement de la fonction Edge" -ForegroundColor Cyan
Write-Host "create-payment" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

$codePath = "supabase/functions/create-payment/index.ts"

if (Test-Path $codePath) {
    Write-Host "Lecture du code de la fonction..." -ForegroundColor Yellow
    $code = Get-Content $codePath -Raw
    
    Write-Host ""
    Write-Host "Code prêt à copier !" -ForegroundColor Green
    Write-Host ""
    Write-Host "ÉTAPES À SUIVRE :" -ForegroundColor Yellow
    Write-Host "1. Allez sur https://supabase.com/dashboard" -ForegroundColor White
    Write-Host "2. Sélectionnez votre projet: taadbjuelxonszosfrsk" -ForegroundColor White
    Write-Host "3. Dans le menu gauche, cliquez sur 'Edge Functions'" -ForegroundColor White
    Write-Host "4. Cherchez ou créez la fonction 'create-payment'" -ForegroundColor White
    Write-Host "5. Ouvrez le fichier ci-dessous et copiez tout son contenu" -ForegroundColor White
    Write-Host "6. Collez dans l'éditeur du Dashboard et cliquez sur 'Deploy'" -ForegroundColor White
    Write-Host ""
    Write-Host "Fichier à copier: $codePath" -ForegroundColor Cyan
    Write-Host ""
    
    # Ouvrir le fichier dans l'éditeur par défaut
    Write-Host "Ouverture du fichier dans votre éditeur..." -ForegroundColor Yellow
    Start-Process $codePath
    
    Write-Host ""
    Write-Host "IMPORTANT: Vérifiez aussi les variables d'environnement !" -ForegroundColor Red
    Write-Host "Dans Supabase Dashboard > Project Settings > Edge Functions > Secrets" -ForegroundColor White
    Write-Host "Assurez-vous que STRIPE_SECRET_KEY est défini !" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host "ERREUR: Le fichier $codePath n'existe pas !" -ForegroundColor Red
}


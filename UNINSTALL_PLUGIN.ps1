# Script PowerShell pour désinstaller manuellement le plugin Litra Glow
# Exécuter en tant qu'administrateur si nécessaire

Write-Host "=== Désinstallation du Plugin Litra Glow ===" -ForegroundColor Yellow

# Arrêter Stream Deck
Write-Host "1. Arrêt de Stream Deck..." -ForegroundColor Green
Get-Process -Name "Stream Deck" -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 3

# Supprimer les dossiers du plugin (toutes les versions)
$pluginPaths = @(
    "$env:APPDATA\Elgato\StreamDeck\Plugins\com.litra.glow.sdPlugin",
    "$env:APPDATA\Elgato\StreamDeck\Plugins\com.litra.glow.v2.sdPlugin",
    "$env:APPDATA\Elgato\StreamDeck\Plugins\com.litra.glow.v2.1.sdPlugin"
)

Write-Host "2. Suppression des dossiers du plugin..." -ForegroundColor Green
foreach ($path in $pluginPaths) {
    if (Test-Path $path) {
        Write-Host "   Suppression: $path" -ForegroundColor Cyan
        try {
            Remove-Item -Path $path -Recurse -Force
            Write-Host "   ✓ Supprimé avec succès" -ForegroundColor Green
        }
        catch {
            Write-Host "   ✗ Erreur: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "   Tentative de déblocage des fichiers..." -ForegroundColor Yellow
            
            # Forcer la suppression des fichiers verrouillés
            Get-ChildItem -Path $path -Recurse -Force | ForEach-Object {
                try {
                    $_.IsReadOnly = $false
                    Remove-Item $_.FullName -Force
                }
                catch {
                    Write-Host "     Fichier verrouillé: $($_.FullName)" -ForegroundColor Red
                }
            }
            
            # Tentative finale de suppression du dossier
            try {
                Remove-Item -Path $path -Recurse -Force
                Write-Host "   ✓ Supprimé après déblocage" -ForegroundColor Green
            }
            catch {
                Write-Host "   ✗ Impossible de supprimer: $path" -ForegroundColor Red
                Write-Host "   Vous devrez le supprimer manuellement après un redémarrage" -ForegroundColor Yellow
            }
        }
    }
    else {
        Write-Host "   Dossier non trouvé: $path" -ForegroundColor Gray
    }
}

# Nettoyer les fichiers de configuration
Write-Host "3. Nettoyage des fichiers de configuration..." -ForegroundColor Green
$configPaths = @(
    "$env:APPDATA\Elgato\StreamDeck\ProfilesV2",
    "$env:APPDATA\Elgato\StreamDeck\Logs"
)

foreach ($configPath in $configPaths) {
    if (Test-Path $configPath) {
        Write-Host "   Recherche de références au plugin dans: $configPath" -ForegroundColor Cyan
        Get-ChildItem -Path $configPath -Recurse -File | ForEach-Object {
            $content = Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue
            if ($content -and ($content -match "com\.litra\.glow")) {
                Write-Host "   Trouvé des références dans: $($_.FullName)" -ForegroundColor Yellow
                Write-Host "   (Ces fichiers peuvent être supprimés manuellement si nécessaire)" -ForegroundColor Gray
            }
        }
    }
}

# Arrêter les processus Node.js liés (bridge)
Write-Host "4. Arrêt des processus Node.js liés..." -ForegroundColor Green
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
    $_.CommandLine -and $_.CommandLine -match "litra"
} | ForEach-Object {
    Write-Host "   Arrêt du processus Node.js: $($_.Id)" -ForegroundColor Cyan
    Stop-Process -Id $_.Id -Force
}

# Nettoyer le port 3000 si utilisé
Write-Host "5. Vérification du port 3000..." -ForegroundColor Green
$port3000 = netstat -ano | Select-String ":3000"
if ($port3000) {
    Write-Host "   Port 3000 en cours d'utilisation:" -ForegroundColor Yellow
    $port3000 | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
    Write-Host "   Si c'est le bridge Litra, il sera arrêté au prochain redémarrage" -ForegroundColor Gray
}

Write-Host "=== Désinstallation terminée ===" -ForegroundColor Yellow
Write-Host "Vous pouvez maintenant:" -ForegroundColor Green
Write-Host "1. Redémarrer Stream Deck" -ForegroundColor Cyan
Write-Host "2. Installer la nouvelle version du plugin" -ForegroundColor Cyan
Write-Host "3. En cas de problème persistant, redémarrer l'ordinateur" -ForegroundColor Cyan

# Optionnel: Redémarrer Stream Deck
$restart = Read-Host "Voulez-vous redémarrer Stream Deck maintenant? (O/N)"
if ($restart -eq "O" -or $restart -eq "o" -or $restart -eq "Y" -or $restart -eq "y") {
    Write-Host "Redémarrage de Stream Deck..." -ForegroundColor Green
    Start-Process -FilePath "$env:ProgramFiles\Elgato\StreamDeck\StreamDeck.exe" -ErrorAction SilentlyContinue
    if (-not $?) {
        # Essayer le chemin alternatif
        Start-Process -FilePath "${env:ProgramFiles(x86)}\Elgato\StreamDeck\StreamDeck.exe" -ErrorAction SilentlyContinue
    }
}

Write-Host "Script terminé." -ForegroundColor Green

# Changelog – Litra Glow Control

## [2.2.2] - 2026-09-12

### ⚡ Performance : actions quasi instantanées (~0,3-0,5 s au lieu de 6-7 s)

Contexte : depuis des mises à jour de l'app Stream Deck, chaque appui mettait
6-7 secondes à réagir alors que le CLI `litra-*` répond en ~0,5 s.

Cause : chaque appui enchaînait **3 appels `npx litra-*` synchrones et bloquants**
(lecture d'état → écriture → relecture de « vérification »), `npx` coûtant à lui
seul ~1100 ms par spawn (résolution npm + contrôle réseau éventuel du registre).

Correctifs :

- **Nouveau module partagé `src/lib/litra.ts`** : exécute directement
  `node <litra>/dist/commonjs/cli/litra-*.js` avec le Node déjà en mémoire via
  `execFile` asynchrone — fini `npx`, fini `execSync` qui gelait le plugin.
- **1 seul spawn par appui** : lecture `litra-devices --json` mutualisée entre
  les 5 actions (cache 1,5 s + déduplication des appels concurrents, donc les 5
  `onWillAppear` simultanés ne coûtent qu'un spawn), suppression de la relecture
  de vérification (l'écriture HID réussie fait foi), retour visuel `showOk()`.
- **Toggle en 1 spawn**, sans lecture préalable.
- **Sérialisation par lampe** : les appuis rapides (`+`/`+`/`+`) sont mis en file
  au lieu de se disputer le handle HID.
- **Bridge `:3000`** (Property Inspector) : même runner direct + cache.
- Mesuré sur machine réelle : lecture 554 ms (0 ms en cache), écriture 303 ms.

### 🛠️ Maintenance

- Nettoyage des anciens chunks de build dans `bin/` (rollup génère des noms
  hashés à chaque build ; les fichiers obsolètes n'embarquent plus, paquet
  passé de 595 Ko à ~410 Ko).
- `package.json` → 2.2.2, manifest → 2.2.2.0 (supérieur à la 2.2.1.1 publiée :
  l'installation par-dessus l'ancienne version est acceptée comme mise à jour ;
  UUID `com.litra.glow.v2.1` inchangé : les boutons existants sont conservés).

### 🔄 Mise à jour depuis une version précédente

Si la désinstallation via Stream Deck échoue (processus `node` orphelin
verrouillant `bin\plugin-batch.log`) :

```powershell
# 1. Fermer Stream Deck, puis tuer le plugin orphelin
Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like "*litra*" } |
  ForEach-Object { Stop-Process -Id $_.ProcessId -Force }

# 2. Supprimer l'ancien plugin
Remove-Item "$env:APPDATA\Elgato\StreamDeck\Plugins\com.litra.glow.v2.1.sdPlugin" -Recurse -Force

# 3. Double-cliquer com.litra.glow.v2.1.streamDeckPlugin pour installer la 2.2.0
```

---

## [2.2.1.1] - 2024-09-24

### 🐞 Critical Fixes

- **Fixed SVG Icon Loading Issue**
  - Resolved the green exclamation mark appearing on toggle actions
  - Fixed dynamic path resolution for SVG files in installed plugin directory
  - Plugin now correctly finds icon files regardless of installation location

- **UUID Consistency**
  - Updated all action UUIDs to match the new plugin version (`com.litra.glow.v2.1`)
  - Ensures proper action registration and prevents conflicts with previous versions

### 🛠️ Maintenance & Troubleshooting

- **Manual Plugin Uninstall Support**
  - Added comprehensive manual uninstall procedure for problematic installations
  - Handles locked files and processes that prevent normal uninstallation
  - Includes automatic cleanup of configuration files and Node.js processes
  - Complete step-by-step procedure with PowerShell commands

### 🚨 IMPORTANT: Plugin Upgrade Procedure

**Before installing this version, you MUST remove any previous Litra plugin versions:**

#### Step 1: Close Stream Deck Application
1. Right-click on Stream Deck icon in system tray
2. Select "Quit Stream Deck" 
3. **OR** Close Stream Deck from Task Manager if needed

#### Step 2: Run PowerShell as Administrator
1. Press `Win + X` and select "Windows PowerShell (Admin)"
2. **OR** Search "PowerShell", right-click, "Run as Administrator"

#### Step 3: Execute Uninstall Commands
**Copy and paste these commands one by one:**

```powershell
# 1. Stop any remaining Stream Deck processes
Get-Process -Name "Stream Deck" -ErrorAction SilentlyContinue | Stop-Process -Force

# 2. Wait for processes to close
Start-Sleep -Seconds 3

# 3. Remove all Litra plugin versions
Remove-Item -Path "$env:APPDATA\Elgato\StreamDeck\Plugins\com.litra.glow.sdPlugin" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "$env:APPDATA\Elgato\StreamDeck\Plugins\com.litra.glow.v2.sdPlugin" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "$env:APPDATA\Elgato\StreamDeck\Plugins\com.litra.glow.v2.1.sdPlugin" -Recurse -Force -ErrorAction SilentlyContinue

# 4. Stop Node.js bridge processes
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -and $_.CommandLine -match "litra" } | Stop-Process -Force

# 5. Force cleanup of locked files
Get-ChildItem -Path "$env:APPDATA\Elgato\StreamDeck\Plugins\" -Filter "*litra*" -Recurse -Force -ErrorAction SilentlyContinue | ForEach-Object { $_.IsReadOnly = $false; Remove-Item $_.FullName -Force -ErrorAction SilentlyContinue }

# 6. Restart Stream Deck
Start-Process -FilePath "$env:ProgramFiles\Elgato\StreamDeck\StreamDeck.exe" -ErrorAction SilentlyContinue
```

#### Step 4: Install New Version
1. Wait for Stream Deck to fully restart
2. Double-click the new plugin file: `com.litra.glow.v2.1.streamDeckPlugin`
3. Follow Stream Deck installation prompts

### 📋 Quick Uninstall (One Command)

For advanced users, use this single command in PowerShell (Administrator):

```powershell
Get-Process -Name "Stream Deck" -ErrorAction SilentlyContinue | Stop-Process -Force; Start-Sleep -Seconds 3; Remove-Item -Path "$env:APPDATA\Elgato\StreamDeck\Plugins\com.litra.glow*.sdPlugin" -Recurse -Force -ErrorAction SilentlyContinue; Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -and $_.CommandLine -match "litra" } | Stop-Process -Force; Start-Process -FilePath "$env:ProgramFiles\Elgato\StreamDeck\StreamDeck.exe" -ErrorAction SilentlyContinue
```

---

## [2.2.1.0] - 2024-06-06

### 🚀 Major Features

- **Multiple Logitech Litra Lights Support**
  - You can now control several Logitech Litra lights connected to the same PC.
  - **Per-action light association:** Each action (toggle, brightness, temperature, etc.) can be linked to a specific Litra light, allowing fully independent control of each device from your Stream Deck.

### ✨ Features & Improvements

- **Full Internationalization (i18n)**
  - Added multi-language support: English (`en.json`) and French (`fr.json`)
  - Automatic translation of action names, tooltips, and labels based on Stream Deck language
  - All custom UI labels are now centralized in locale files for easy maintenance

- **Property Inspector UI**
  - Perfect alignment of labels and fields for a native Stream Deck look
  - Dynamic translation of labels in the Property Inspector according to the app language

- **Enhanced Actions**
  - Translated names and tooltips for all actions: Toggle, Brightness +/-, Temperature +/-
  - Button and dropdown labels are now localized

- **Text Updates**
  - Improved descriptions and tooltips for clarity
  - Adjusted action names for better consistency across languages

### 🐞 Fixes

- Fixed label alignment in the Property Inspector
- Unified style for all fields and labels across actions
- **Fixed a typo in the dropdown HTML (`class` instead of `clas`) that prevented detected lights from displaying correctly in the Property Inspector.**
- **Resolved: The bridge for device detection (`litra-devices-bridge`) is now started automatically with the plugin, ensuring the dropdown always loads the list of active lights in JSON.**

### 🛠️ Technical

- Refactored HTML/CSS structure for better scalability
- Added a utility function to dynamically load localized labels in the Property Inspector
- **Integrated the litra-devices bridge directly in the plugin code (TypeScript), so it launches automatically at plugin startup. No manual launch required.**

---

**Thank you for using Litra Glow Control!**
Feel free to report bugs or suggest improvements on the [GitHub repository](https://github.com/timrogers/litra). 
# Stream Deck Plugin pour Logitech Litra Glow 💡

> **Note professionnelle :**
> Ce projet a été réalisé à titre personnel, en grande partie avec l'assistance de l'intelligence artificielle. Je ne suis pas développeur de métier, mais passionné par l'automatisation et l'intégration de solutions pour la communauté. Ce plugin est donc le fruit d'un apprentissage et d'une expérimentation guidés par l'IA.

## ✨ Fonctionnalités

- **🔘 Toggle Light** - Allumer/éteindre la lumière avec états visuels
- **🔆 Set Brightness** - Contrôle de la luminosité par pas de **25 lumens** à chaque clic (soit environ 10% de la plage totale, de 20 à 250 lumens)
- **🌡️ Set Temperature** - Contrôle de la température de couleur par pas de **400 K** à chaque clic (soit environ 15% de la plage totale, de 2700K à 6500K)

## 🚀 Installation

### Prérequis

1. **Installer Node.js pour Windows**
   - Télécharger et installer depuis : https://nodejs.org/en/download

2. **Installer le projet GitHub "Logitech Litra Glow CLI 'litra'" avec Node dans PowerShell**
   ```powershell
   npm install --save litra
   ```

3. **Tester la détection de la lumière**
   - Dans PowerShell, exécutez :
   ```powershell
   litra-devices
   ```
   - Vérifiez que votre Litra Glow est bien détectée.

4. **Installer le plugin Stream Deck**
   - Télécharger le fichier `com.litra.glow.v2.streamDeckPlugin`
   - Double-cliquer sur le fichier pour installer le plugin dans Stream Deck

5. **Ajouter les actions sur votre Stream Deck**
   - Glissez-déposez les actions depuis la bibliothèque Stream Deck

## 🛠️ Développement

### Structure du Projet

```
📁 litra-glow-streamdeck/
├── 📁 src/                          # Code source TypeScript
│   ├── 📄 plugin.ts                 # Point d'entrée principal  
│   └── 📁 actions/                  # Actions Stream Deck
│       ├── 📄 toggle-light.ts       # Action Toggle
│       ├── 📄 set-brightness.ts     # Action Luminosité
│       └── 📄 set-temperature.ts    # Action Température
├── 📁 com.litra.glow.sdPlugin/      # Plugin compilé
│   ├── 📄 manifest.json             # Manifest du plugin
│   ├── 📁 bin/                      # Code JavaScript compilé
│   ├── 📁 imgs/                     # Icônes (72x72 + @2x)
│   └── 📁 ui/                       # Property inspectors
├── 📄 com.litra.glow.streamDeckPlugin # Package de distribution
├── 📄 build-release.js              # Script de build
├── 📄 package.json                  # Configuration npm
├── 📄 rollup.config.mjs             # Configuration build
├── 📄 tsconfig.json                 # Configuration TypeScript
└── 📄 SUCCESS.md                    # Documentation de succès
```

### Commandes de Développement

```bash
# Installation des dépendances
npm install

# Build du plugin
npm run build

# Build et package complet
node build-release.js

# Commandes Stream Deck CLI
streamdeck dev                              # Mode développement
streamdeck validate com.litra.glow.sdPlugin # Validation
streamdeck restart com.litra.glow          # Redémarrage
streamdeck pack com.litra.glow.sdPlugin    # Packaging
```

### Test des Commandes Litra

```bash
# Vérifier les appareils connectés
npx litra-devices

# Contrôle manuel
npx litra-toggle                    # Toggle on/off
npx litra-brightness 75             # Luminosité 75%
npx litra-temperature-k 4000        # Température 4000K
```

## 🎯 Architecture Technique

- **Framework** : [@elgato/streamdeck](https://www.npmjs.com/package/@elgato/streamdeck) SDK + Stream Deck CLI
- **Langage** : TypeScript → JavaScript (via Rollup)
- **Intégration** : Commandes CLI `npx litra-*` via `execSync`
- **Icônes** : PNG générées programmatiquement (72x72 + @2x variants)
- **Validation** : Stream Deck CLI officiel

## 📦 Package de Distribution

- **Fichier** : `com.litra.glow.streamDeckPlugin` (~64 KB)
- **Validation** : ✅ Stream Deck CLI officiel
- **Contenu** : 36 fichiers, 766.8 KiB décompressé
- **Icônes** : Haute résolution avec variants @2x

## 🆘 Support

### Actions Disponibles

| Action | UUID | Description |
|--------|------|-------------|
| Toggle Light | `com.litra.glow.toggle` | Allumer/éteindre avec feedback visuel |
| Set Brightness | `com.litra.glow.brightness` | Curseur 0-100% avec property inspector |
| Set Temperature | `com.litra.glow.temperature` | Curseur 2700K-6500K avec property inspector |

### Résolution de Problèmes

1. **Plugin non détecté** : Vérifiez que `litra` est installé globalement
2. **Pas de réponse** : Vérifiez la connexion USB de la Litra Glow
3. **Erreurs de build** : Assurez-vous d'avoir Node.js 20+

## 📄 Licence

MIT - Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🙏 Remerciements

- [timrogers/litra](https://github.com/timrogers/litra) - Bibliothèque de contrôle Litra
- [Elgato Stream Deck SDK](https://docs.elgato.com/sdk) - Documentation officielle
- [Stream Deck CLI](https://docs.elgato.com/streamdeck/cli/intro) - Outils de développement

---

**🎮 Plugin prêt à l'emploi ! Profitez du contrôle total de vos lumières Litra depuis votre Stream Deck !** 
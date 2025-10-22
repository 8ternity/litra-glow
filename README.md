# Stream Deck Plugin for Logitech Litra Glow 💡

> **Professional Note:**
> This project was created as a personal endeavor, largely with the assistance of artificial intelligence. I am not a professional developer, but rather passionate about automation and integrating solutions for the community. This plugin is therefore the result of learning and experimentation guided by AI.

## ✨ Features

- **🔥 Link a specific Litra Light to any action control** - You can now link any of your multiple Logitech Litra Glow Lights to any action for targeted light control
- **🔘 Toggle Light** - Turn the light on/off with visual status feedback
- **🔆 Set Brightness** - Brightness control in **25 lumens** increments per click (approximately 10% of the total range, from 20 to 250 lumens)
- **🌡️ Set Temperature** - Color temperature control in **400 K** increments per click (approximately 15% of the total range, from 2700K to 6500K)

- Allow for now to only control 1 Logitech Litra Glow. (Maybe will evolve later)

## 🚀 Installation

### Prerequisites

1. **Install Node.js for Windows**
   - Download and install from: https://nodejs.org/en/download
   
   NOTE: If you install version 22 or later, make sure to manually add the new PATH to the Windows Environment Variables. The path is typically located at C:\Program Files\nodejs\. After adding the path, restart your computer. Otherwise, the NPM command may not be recognized. It's unclear why newer versions don't automatically update the environment variables.
   
3. **Install the GitHub project "Logitech Litra Glow CLI 'litra'" with Node in PowerShell or CMD**
   ```CMD/PowerShell
   npm install -g litra
   ```



4. **Test light detection**
   - In CDM or PowerShell, run:
   ```CMD/PowerShell
   litra-devices
   ```
   - Verify that your Litra Glow is properly detected.


   **Note for developers:**
   > If you want to build or modify the plugin source, you should also run:
   > ```powershell
   > npm install --save-dev @types/express @types/cors
   > ```
   > These are only needed for TypeScript development, not for running the plugin.

5. **Install the Stream Deck plugin**
   - Download the `com.litra.glow.v2.1.streamDeckPlugin` file
   - Double-click the file to install the plugin in Stream Deck

6. **Add actions to your Stream Deck**
   - Drag and drop actions from the Stream Deck library
   - Click on the action button you've added and select which 'light' you want to assign the action
   - Repeate the same step for each actions added to your stream deck

### Bridge litra-devices

- The bridge (local HTTP server for device detection) is now started **automatically** when the plugin launches. You do not need to run any extra command or script.

## 🛠️ Development

### Project Structure

```
📁 litra-glow-streamdeck/
├── 📁 src/                          # TypeScript source code
│   ├── 📄 plugin.ts                 # Main entry point  
│   └── 📁 actions/                  # Stream Deck actions
│       ├── 📄 toggle-light.ts       # Toggle action
│       ├── 📄 set-brightness.ts     # Brightness action
│       └── 📄 set-temperature.ts    # Temperature action
├── 📁 com.litra.glow.sdPlugin/      # Compiled plugin
│   ├── 📄 manifest.json             # Plugin manifest
│   ├── 📁 bin/                      # Compiled JavaScript code
│   ├── 📁 imgs/                     # Icons (72x72 + @2x)
│   └── 📁 ui/                       # Property inspectors
├── 📄 com.litra.glow.streamDeckPlugin # Distribution package
├── 📄 build-release.js              # Build script
├── 📄 package.json                  # npm configuration
├── 📄 rollup.config.mjs             # Build configuration
├── 📄 tsconfig.json                 # TypeScript configuration
└── 📄 SUCCESS.md                    # Success documentation
```

### Source Development Commands

```bash
# Install dependencies
npm install

# Node Express and CORS for Bridge Development 
npm install --save-dev @types/express @types/cors

# Build plugin
npm run build

# Complete build and package
node build-release.js

# Stream Deck CLI commands
streamdeck dev                              # Development mode
streamdeck validate com.litra.glow.sdPlugin # Validation
streamdeck restart com.litra.glow          # Restart
streamdeck pack com.litra.glow.sdPlugin    # Packaging
```

### Litra Command Testing

```bash
# Check connected devices
npx litra-devices

# Manual control
npx litra-toggle                    # Toggle on/off
npx litra-brightness 75             # 75% brightness
npx litra-temperature-k 4000        # 4000K temperature

# Bridge multi Logitech serial numbers detection
http://localhost:3000/litra-devices

```

## 🎯 Technical Architecture

- **Framework**: [@elgato/streamdeck](https://www.npmjs.com/package/@elgato/streamdeck) SDK + Stream Deck CLI
- **Language**: TypeScript → JavaScript (via Rollup)
- **Integration**: CLI commands `npx litra-*` via `execSync`
- **Icons**: Programmatically generated PNG (72x72 + @2x variants)
- **Validation**: Official Stream Deck CLI

## 📦 Distribution Package

- **File**: `com.litra.glow.streamDeckPlugin` (~64 KB)
- **Validation**: ✅ Official Stream Deck CLI
- **Content**: 36 files, 766.8 KiB uncompressed
- **Icons**: High resolution with @2x variants

## 🆘 Support
- **NOTE**: After a StreamDeck APP Update 7.0.X, reboot your computer. I've discover after updating to 7.0.3 the latest version the plugin seems to give exclamation and after rebooting computer, the plugin worked again.

### Available Actions

| Action | UUID | Description |
|--------|------|-------------|
| Toggle Light | `com.litra.glow.toggle` | Turn on/off with visual feedback |
| Set Brightness | `com.litra.glow.brightness` | 0-100% slider with property inspector |
| Set Temperature | `com.litra.glow.temperature` | 2700K-6500K slider with property inspector |

### Troubleshooting

1. **Plugin not detected**: Verify that `litra` is installed globally
2. **No response**: Check the USB connection of the Litra Glow
3. **Build errors**: Make sure you have Node.js 20+

## 📄 License

MIT - See the [LICENSE](LICENSE) file for more details.

## 🙏 Acknowledgments

- [timrogers/litra](https://github.com/timrogers/litra) - Command-line library for controlling Logitech Litra Glow, Beam & Beam LC lights. Essential library for this project's functionality.
- [Elgato Stream Deck SDK](https://docs.elgato.com/sdk) - Official documentation
- [Stream Deck CLI](https://docs.elgato.com/streamdeck/cli/intro) - Development tools

---

**🎮 Plugin ready to use! Enjoy full control of your Litra lights from your Stream Deck!**

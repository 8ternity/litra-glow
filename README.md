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

2. **Install the "Logitech Litra Glow CLI 'litra'" globally with Node in PowerShell**
   > The plugin runs the `litra-*` CLIs directly (no `npx`), so the package must
   > be resolvable globally:
   ```powershell
   npm install -g litra
   ```

3. **Test light detection**
   - In PowerShell, run:
   ```powershell
   litra-devices
   ```
   - Verify that your Litra Glow is properly detected.


   **Note for developers:**
   > If you want to build or modify the plugin source, you should also run:
   > ```powershell
   > npm install --save-dev @types/express @types/cors
   > ```
   > These are only needed for TypeScript development, not for running the plugin.

4. **Install the Stream Deck plugin**
   - Download the `com.litra.glow.v2.1.streamDeckPlugin` file (release 2.2.2+)
   - Double-click the file to install the plugin in Stream Deck

5. **Add actions to your Stream Deck**
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
│   ├── 📄 litra-devices-bridge.ts   # Property Inspector bridge (:3000)
│   ├── 📁 lib/
│   │   └── 📄 litra.ts              # Shared runner: direct litra CLI calls (no npx),
│   │                                # JSON state cache + per-device command queue
│   └── 📁 actions/                  # Stream Deck actions
│       ├── 📄 toggle-light.ts       # Toggle action
│       ├── 📄 brightness-up.ts      # Brightness +25 lm
│       ├── 📄 brightness-down.ts    # Brightness -25 lm
│       ├── 📄 temperature-up.ts     # Temperature +400 K
│       └── 📄 temperature-down.ts   # Temperature -400 K
├── 📁 com.litra.glow.v2.1.sdPlugin/ # Compiled plugin (UUID com.litra.glow.v2.1)
│   ├── 📄 manifest.json             # Plugin manifest (Version 2.2.2.0)
│   ├── 📁 bin/                      # Compiled JavaScript code
│   ├── 📁 imgs/                     # Icons
│   └── 📁 ui/                       # Property inspectors
├── 📄 com.litra.glow.v2.1.streamDeckPlugin # Distribution package
├── 📄 build-release.js              # Build script
├── 📄 package.json                  # npm configuration
├── 📄 rollup.config.mjs             # Build configuration
└── 📄 tsconfig.json                 # TypeScript configuration
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
streamdeck validate com.litra.glow.v2.1.sdPlugin # Validation
streamdeck restart com.litra.glow.v2.1      # Restart
streamdeck pack com.litra.glow.v2.1.sdPlugin -f # Packaging
```

### Litra Command Testing

```bash
# Check connected devices (direct binary, same call path as the plugin)
litra-devices --json

# Manual control
litra-toggle                    # Toggle on/off
litra-brightness-lm 150         # 150 lumens brightness
litra-temperature-k 4000        # 4000K temperature

# Bridge multi Logitech serial numbers detection
http://localhost:3000/litra-devices

```

## 🎯 Technical Architecture

- **Framework**: [@elgato/streamdeck](https://www.npmjs.com/package/@elgato/streamdeck) SDK + Stream Deck CLI
- **Language**: TypeScript → JavaScript (via Rollup)
- **Integration**: `litra-*` CLIs executed directly with the running Node.js runtime
  (`node <global litra>/dist/commonjs/cli/litra-*.js` via async `execFile` —
  no `npx`, no blocking calls). Single `litra-devices --json` read per keypress
  (shared 1.5 s cache across actions), optimistic HID writes, per-device queue.
- **Icons**: Programmatically generated PNG (72x72 + @2x variants)
- **Validation**: Official Stream Deck CLI

## 📦 Distribution Package

- **File**: `com.litra.glow.v2.1.streamDeckPlugin` (~410 KB)
- **Validation**: ✅ Official Stream Deck CLI
- **Content**: ~1.3 MiB uncompressed

## 🆘 Support

### Available Actions

| Action | UUID | Description |
|--------|------|-------------|
| Toggle Light | `com.litra.glow.v2.1.toggle` | Turn on/off with visual feedback |
| Brightness +25 lm | `com.litra.glow.v2.1.brightness.up` | +25 lumens per press (20-250 lm) |
| Brightness -25 lm | `com.litra.glow.v2.1.brightness.down` | -25 lumens per press (20-250 lm) |
| Temperature +400 K | `com.litra.glow.v2.1.temperature.up` | +400 K per press (2700-6500 K) |
| Temperature -400 K | `com.litra.glow.v2.1.temperature.down` | -400 K per press (2700-6500 K) |

### Troubleshooting

1. **Plugin not detected**: verify that `litra` is installed globally (`npm install -g litra`, then `litra-devices`)
2. **No response**: check the USB connection of the Litra Glow
3. **Slow actions**: make sure you run v2.2.2+ (direct runner, no `npx`); see [CHANGELOG](CHANGELOG.md)
4. **Uninstall blocked** (`bin\plugin-batch.log` locked): close Stream Deck, kill any orphaned
   `node.exe` whose command line contains `litra`, then delete
   `%APPDATA%\Elgato\StreamDeck\Plugins\com.litra.glow.v2.1.sdPlugin`
5. **Build errors**: make sure you have Node.js 20+

## 📄 License

MIT - See the [LICENSE](LICENSE) file for more details.

## 🙏 Acknowledgments

- [timrogers/litra](https://github.com/timrogers/litra) - Command-line library for controlling Logitech Litra Glow, Beam & Beam LC lights. Essential library for this project's functionality.
- [Elgato Stream Deck SDK](https://docs.elgato.com/sdk) - Official documentation
- [Stream Deck CLI](https://docs.elgato.com/streamdeck/cli/intro) - Development tools

---

**🎮 Plugin ready to use! Enjoy full control of your Litra lights from your Stream Deck!**

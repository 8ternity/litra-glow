# Changelog – Litra Glow Control

## [2.2.1.0] - 2024-xx-xx

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
'use strict';

var tslib_es6 = require('./tslib.es6-CSuM4ipl.js');
var plugin = require('./plugin.js');
var child_process = require('child_process');
var fs = require('fs');
var path = require('path');
require('events');
require('https');
require('http');
require('net');
require('tls');
require('crypto');
require('stream');
require('url');
require('zlib');
require('buffer');
require('node:path');
require('node:process');
require('node:fs');
require('tty');
require('util');
require('string_decoder');
require('node:zlib');
require('node:events');
require('node:http');
require('querystring');
require('node:net');

function _interopNamespaceDefault(e) {
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n.default = e;
  return Object.freeze(n);
}

var fs__namespace = /*#__PURE__*/_interopNamespaceDefault(fs);
var path__namespace = /*#__PURE__*/_interopNamespaceDefault(path);

const MIN_LUMENS = 20;
const STEP_LUMENS = 25;
// Icône de luminosité réduite avec teinte rougeâtre pour la diminution
const ICON_BRIGHTNESS_DOWN = `
<svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
  <g transform="translate(36, 36) scale(0.5, 0.5)">
    <g fill="none" stroke="#e08080" stroke-width="8">
      <!-- Cercle extérieur -->
      <circle cx="72" cy="72" r="54" />
      <!-- Curseur central -->
      <circle cx="72" cy="72" r="30" fill="#e08080" />
      <!-- Symbole moins -->
      <line x1="52" y1="72" x2="92" y2="72" stroke="#ffffff" stroke-width="8" stroke-linecap="round" />
    </g>
  </g>
</svg>`;
function logToFile(message) {
    const logDir = path__namespace.join(__dirname, '../../logs');
    if (!fs__namespace.existsSync(logDir)) {
        fs__namespace.mkdirSync(logDir, { recursive: true });
    }
    const logFile = path__namespace.join(logDir, 'brightness-down.log');
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    try {
        fs__namespace.appendFileSync(logFile, logMessage);
        console.log(`[BrightnessDown] ${message}`);
    }
    catch (error) {
        console.error(`[BrightnessDown] Log error: ${error}`);
    }
}
let BrightnessDownAction = (() => {
    let _classDecorators = [plugin.action({ UUID: 'com.litra.glow.v2.brightness.down' })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = plugin.SingletonAction;
    (class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            tslib_es6.__esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            tslib_es6.__runInitializers(_classThis, _classExtraInitializers);
        }
        lastRequestedLumens = null;
        async executeLitraCommand(command, serialNumber) {
            try {
                let cmd = `npx litra-${command}`;
                if (serialNumber && !command.startsWith('devices')) {
                    cmd += ` --serial-number ${serialNumber}`;
                }
                logToFile(`[executeLitraCommand] Exécution: ${cmd}`);
                const result = child_process.execSync(cmd, {
                    encoding: 'utf8',
                    timeout: 10000,
                    cwd: process.cwd(),
                    env: {
                        ...process.env,
                        PATH: process.env.PATH + ';C:\\Program Files\\nodejs\\;C:\\Users\\ET34N1TY\\AppData\\Roaming\\npm',
                        NODE_PATH: path__namespace.join(process.cwd(), 'node_modules')
                    }
                });
                logToFile(`[executeLitraCommand] Succès: ${result.trim()}`);
                return result.trim();
            }
            catch (error) {
                logToFile(`[executeLitraCommand] Erreur: ${error.message}`);
                throw error;
            }
        }
        async getCurrentBrightness(serialNumber) {
            try {
                const output = await this.executeLitraCommand('devices');
                logToFile(`[getCurrentBrightness] Sortie complète de litra-devices:\n${output}`);
                // Si serialNumber est défini, on cherche le bloc correspondant
                if (serialNumber) {
                    const regex = new RegExp(`\\(${serialNumber}\\):[^\\n]*\\n(?:  - .+\\n)*?  - Brightness: (\\d+)\\s*lm`, 'm');
                    const match = regex.exec(output);
                    if (match && match[1]) {
                        const lumens = parseInt(match[1], 10);
                        logToFile(`[getCurrentBrightness] Luminosité trouvée pour ${serialNumber}: ${lumens} lm`);
                        return lumens;
                    }
                }
                else {
                    // Ancien comportement : première valeur trouvée
                    const brightnessRegex = /Brightness:\s*(\d+)\s*lm/;
                    const match = brightnessRegex.exec(output);
                    if (match && match[1]) {
                        const lumens = parseInt(match[1], 10);
                        logToFile(`[getCurrentBrightness] Luminosité trouvée: ${lumens} lm`);
                        return lumens;
                    }
                }
                logToFile(`[getCurrentBrightness] Pattern non trouvé dans la sortie!`);
                logToFile(`[getCurrentBrightness] Utilisation de la valeur par défaut: ${MIN_LUMENS} lm`);
                return MIN_LUMENS;
            }
            catch (error) {
                logToFile(`[getCurrentBrightness] Erreur: ${error}`);
                return MIN_LUMENS;
            }
        }
        // Méthode pour mettre à jour l'icône
        async updateIcon(action) {
            try {
                await action.setImage(ICON_BRIGHTNESS_DOWN);
                logToFile(`[updateIcon] Icône mise à jour avec succès`);
            }
            catch (error) {
                logToFile(`[updateIcon] Erreur lors de la mise à jour de l'icône: ${error}`);
            }
        }
        async onWillAppear(ev) {
            logToFile(`[onWillAppear] Appelée`);
            logToFile(`[onWillAppear] serialNumber dans settings: ${ev.payload.settings?.serialNumber}`);
            try {
                const serialNumber = ev.payload.settings?.serialNumber;
                const currentLumens = await this.getCurrentBrightness(serialNumber);
                await ev.action.setTitle(`-25 lm`);
                // Appliquer l'icône personnalisée
                if (ev.payload.isInMultiAction !== true) {
                    await this.updateIcon(ev.action);
                }
                logToFile(`[onWillAppear] Action initialisée avec luminosité: ${currentLumens} lm`);
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Erreur inconnue';
                logToFile(`[onWillAppear] Erreur: ${message}`);
                await ev.action.setTitle('-25 lm');
            }
        }
        async onKeyDown(ev) {
            logToFile(`[onKeyDown] Appelée`);
            logToFile(`[onKeyDown] serialNumber dans settings: ${ev.payload.settings?.serialNumber}`);
            try {
                const serialNumber = ev.payload.settings?.serialNumber;
                let currentLumens;
                if (this.lastRequestedLumens !== null) {
                    currentLumens = this.lastRequestedLumens;
                    logToFile(`[onKeyDown] Utilisation de lastRequestedLumens: ${currentLumens} lm`);
                }
                else {
                    currentLumens = await this.getCurrentBrightness(serialNumber);
                    logToFile(`[onKeyDown] Luminosité actuelle: ${currentLumens} lm`);
                }
                // Si déjà au minimum, ne rien faire
                if (currentLumens <= MIN_LUMENS) {
                    logToFile(`[onKeyDown] Déjà au minimum (${MIN_LUMENS} lm), aucune action`);
                    await ev.action.setTitle(`-25 lm`);
                    return;
                }
                // Calculer nouvelle valeur (simplement -25 lumens)
                const newLumens = Math.max(MIN_LUMENS, currentLumens - STEP_LUMENS);
                logToFile(`[onKeyDown] Nouvelle luminosité calculée: ${newLumens} lm (${currentLumens} - ${STEP_LUMENS})`);
                this.lastRequestedLumens = newLumens;
                // Application de la nouvelle luminosité
                logToFile(`[onKeyDown] Application de la nouvelle luminosité: ${newLumens} lm`);
                await this.executeLitraCommand(`brightness-lm ${newLumens}`, serialNumber);
                // Vérification après application
                const verifiedLumens = await this.getCurrentBrightness(serialNumber);
                this.lastRequestedLumens = null;
                logToFile(`[onKeyDown] Vérification après application: ${verifiedLumens} lm`);
                // Mise à jour de l'interface
                await ev.action.setTitle(`-25 lm`);
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Erreur inconnue';
                logToFile(`[onKeyDown] Erreur: ${message}`);
                await ev.action.showAlert();
                this.lastRequestedLumens = null;
            }
        }
    });
    return _classThis;
})();

exports.BrightnessDownAction = BrightnessDownAction;
//# sourceMappingURL=brightness-down-DVqvwbnV.js.map

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

const MAX_LUMENS = 250;
const STEP_LUMENS = 25;
// Chemin vers le module litra (pour éviter d'utiliser npx à chaque fois)
const LITRA_PATH = path__namespace.join(process.cwd(), 'node_modules', '.bin', 'litra-brightness-lm');
// Icône de luminosité réduite avec teinte verdâtre pour l'augmentation
const ICON_BRIGHTNESS_UP = `
<svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
  <g transform="translate(36, 36) scale(0.5, 0.5)">
    <g fill="none" stroke="#a0e080" stroke-width="8">
      <!-- Cercle extérieur -->
      <circle cx="72" cy="72" r="54" />
      <!-- Curseur central -->
      <circle cx="72" cy="72" r="30" fill="#a0e080" />
      <!-- Symbole plus -->
      <line x1="72" y1="52" x2="72" y2="92" stroke="#ffffff" stroke-width="8" stroke-linecap="round" />
      <line x1="52" y1="72" x2="92" y2="72" stroke="#ffffff" stroke-width="8" stroke-linecap="round" />
    </g>
  </g>
</svg>`;
function logToFile(message) {
    const logDir = path__namespace.join(__dirname, '../../logs');
    if (!fs__namespace.existsSync(logDir)) {
        fs__namespace.mkdirSync(logDir, { recursive: true });
    }
    const logFile = path__namespace.join(logDir, 'brightness-up.log');
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    try {
        fs__namespace.appendFileSync(logFile, logMessage);
        console.log(`[BrightnessUp] ${message}`);
    }
    catch (error) {
        console.error(`[BrightnessUp] Log error: ${error}`);
    }
}
let BrightnessUpAction = (() => {
    let _classDecorators = [plugin.action({ UUID: 'com.litra.glow.v2.brightness.up' })];
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
        // Stocker la luminosité en mémoire pour éviter des appels superflus
        lastKnownBrightness = null;
        async executeLitraCommand(command) {
            try {
                logToFile(`[executeLitraCommand] Exécution: litra-${command}`);
                // Utiliser directement npx litra-* pour les commandes autres que brightness-lm
                const cmd = command.startsWith('brightness-lm ')
                    ? `"${LITRA_PATH}" ${command.substring('brightness-lm '.length)}`
                    : `npx litra-${command}`;
                logToFile(`[executeLitraCommand] Commande exacte: ${cmd}`);
                const result = child_process.execSync(cmd, {
                    encoding: 'utf8',
                    timeout: 5000, // Réduit le timeout pour une réponse plus rapide
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
        async getCurrentBrightness() {
            try {
                // Lecture de la luminosité actuelle
                const output = await this.executeLitraCommand('devices');
                // Recherche du pattern avec une regex très souple
                const brightnessRegex = /Brightness:\s*(\d+)\s*lm/;
                const match = brightnessRegex.exec(output);
                if (match && match[1]) {
                    const lumens = parseInt(match[1], 10);
                    this.lastKnownBrightness = lumens; // Mettre à jour la valeur mémorisée
                    logToFile(`[getCurrentBrightness] Luminosité trouvée: ${lumens} lm`);
                    return lumens;
                }
                // En cas d'échec, on utilise la dernière valeur connue ou la valeur par défaut
                const fallbackValue = this.lastKnownBrightness || MAX_LUMENS;
                logToFile(`[getCurrentBrightness] Pattern non trouvé, utilisation de: ${fallbackValue} lm`);
                return fallbackValue;
            }
            catch (error) {
                // En cas d'erreur, utiliser la dernière valeur connue ou la valeur par défaut
                const fallbackValue = this.lastKnownBrightness || MAX_LUMENS;
                logToFile(`[getCurrentBrightness] Erreur, utilisation de: ${fallbackValue} lm`);
                return fallbackValue;
            }
        }
        // Méthode pour mettre à jour l'icône
        async updateIcon(action) {
            try {
                await action.setImage(ICON_BRIGHTNESS_UP);
                logToFile(`[updateIcon] Icône mise à jour avec succès`);
            }
            catch (error) {
                logToFile(`[updateIcon] Erreur lors de la mise à jour de l'icône: ${error}`);
            }
        }
        async onWillAppear(ev) {
            logToFile(`[onWillAppear] Appelée`);
            try {
                const currentLumens = await this.getCurrentBrightness();
                await ev.action.setTitle(`+25 lm\n${currentLumens} lm`);
                // Appliquer l'icône personnalisée
                if (ev.payload.isInMultiAction !== true) {
                    await this.updateIcon(ev.action);
                }
                logToFile(`[onWillAppear] Action initialisée avec luminosité: ${currentLumens} lm`);
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Erreur inconnue';
                logToFile(`[onWillAppear] Erreur: ${message}`);
                await ev.action.setTitle('+25 lm');
            }
        }
        async onKeyDown(ev) {
            logToFile(`[onKeyDown] Appelée`);
            try {
                // Lecture de la luminosité actuelle
                const currentLumens = await this.getCurrentBrightness();
                logToFile(`[onKeyDown] Luminosité actuelle: ${currentLumens} lm`);
                // Si déjà au maximum, ne rien faire
                if (currentLumens >= MAX_LUMENS) {
                    logToFile(`[onKeyDown] Déjà au maximum (${MAX_LUMENS} lm), aucune action`);
                    await ev.action.setTitle(`+25 lm\n${currentLumens} lm`);
                    await ev.action.showOk();
                    return;
                }
                // Calculer nouvelle valeur (simplement +25 lumens)
                const newLumens = Math.min(MAX_LUMENS, currentLumens + STEP_LUMENS);
                logToFile(`[onKeyDown] Nouvelle luminosité calculée: ${newLumens} lm (${currentLumens} + ${STEP_LUMENS})`);
                // Application de la nouvelle luminosité (sans attendre la fin de l'exécution)
                // Pour réduire le délai, nous mettons à jour l'interface avant même de vérifier le résultat
                this.lastKnownBrightness = newLumens; // Mettre à jour immédiatement la valeur en mémoire
                await ev.action.setTitle(`+25 lm\n${newLumens} lm`);
                // Exécuter la commande sans attendre la vérification
                this.executeLitraCommand(`brightness-lm ${newLumens}`)
                    .then(() => {
                    // Succès silencieux
                    ev.action.showOk();
                })
                    .catch((error) => {
                    // En cas d'erreur, on le signale
                    logToFile(`[onKeyDown] Erreur d'application: ${error}`);
                    ev.action.showAlert();
                });
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Erreur inconnue';
                logToFile(`[onKeyDown] Erreur: ${message}`);
                await ev.action.showAlert();
            }
        }
    });
    return _classThis;
})();

exports.BrightnessUpAction = BrightnessUpAction;
//# sourceMappingURL=brightness-up-DMkPw1UL.js.map

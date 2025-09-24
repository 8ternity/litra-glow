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

const MIN_TEMP = 2700;
const STEP_TEMP = 400;
// Icône de température avec teinte ambrée/orange pour la diminution (plus chaud)
const ICON_TEMPERATURE_DOWN = `
<svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
  <g transform="translate(36, 36) scale(0.5, 0.5)">
    <g fill="none" stroke="#e0a050" stroke-width="8">
      <!-- Cercle extérieur -->
      <circle cx="72" cy="72" r="54" />
      <!-- Cercle intérieur -->
      <circle cx="72" cy="72" r="30" fill="#e0a050" />
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
    const logFile = path__namespace.join(logDir, 'temperature-down.log');
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    try {
        fs__namespace.appendFileSync(logFile, logMessage);
        console.log(`[TemperatureDown] ${message}`);
    }
    catch (error) {
        console.error(`[TemperatureDown] Log error: ${error}`);
    }
}
let TemperatureDownAction = (() => {
    let _classDecorators = [plugin.action({ UUID: 'com.litra.glow.v2.temperature.down' })];
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
        async executeLitraCommand(command) {
            try {
                logToFile(`[executeLitraCommand] Exécution: npx litra-${command}`);
                const result = child_process.execSync(`npx litra-${command}`, {
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
        async getCurrentTemperature() {
            try {
                // Lecture de la température actuelle
                const output = await this.executeLitraCommand('devices');
                // Log de la sortie complète pour débogage
                logToFile(`[getCurrentTemperature] Sortie complète de litra-devices:\n${output}`);
                // Recherche du pattern avec une regex
                const temperatureRegex = /Temperature:\s*(\d+)\s*K/;
                const match = temperatureRegex.exec(output);
                if (match && match[1]) {
                    const kelvin = parseInt(match[1], 10);
                    logToFile(`[getCurrentTemperature] Température trouvée: ${kelvin} K`);
                    return kelvin;
                }
                // En cas d'échec, on affiche un message détaillé
                logToFile(`[getCurrentTemperature] Pattern non trouvé dans la sortie!`);
                logToFile(`[getCurrentTemperature] Utilisation de la valeur par défaut: ${MIN_TEMP} K`);
                return MIN_TEMP;
            }
            catch (error) {
                logToFile(`[getCurrentTemperature] Erreur: ${error}`);
                return MIN_TEMP;
            }
        }
        // Méthode pour mettre à jour l'icône
        async updateIcon(action) {
            try {
                await action.setImage(ICON_TEMPERATURE_DOWN);
                logToFile(`[updateIcon] Icône mise à jour avec succès`);
            }
            catch (error) {
                logToFile(`[updateIcon] Erreur lors de la mise à jour de l'icône: ${error}`);
            }
        }
        async onWillAppear(ev) {
            logToFile(`[onWillAppear] Appelée`);
            try {
                const currentTemp = await this.getCurrentTemperature();
                await ev.action.setTitle(`-400 K`);
                // Appliquer l'icône personnalisée
                if (ev.payload.isInMultiAction !== true) {
                    await this.updateIcon(ev.action);
                }
                logToFile(`[onWillAppear] Action initialisée avec température: ${currentTemp} K`);
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Erreur inconnue';
                logToFile(`[onWillAppear] Erreur: ${message}`);
                await ev.action.setTitle('-400 K');
            }
        }
        async onKeyDown(ev) {
            logToFile(`[onKeyDown] Appelée`);
            try {
                // Lecture de la température actuelle
                const currentTemp = await this.getCurrentTemperature();
                logToFile(`[onKeyDown] Température actuelle: ${currentTemp} K`);
                // Si déjà au minimum, ne rien faire
                if (currentTemp <= MIN_TEMP) {
                    logToFile(`[onKeyDown] Déjà au minimum (${MIN_TEMP} K), aucune action`);
                    await ev.action.setTitle(`-400 K`);
                    await ev.action.showOk();
                    return;
                }
                // Calculer nouvelle valeur (- STEP_TEMP)
                let newTemp = Math.max(MIN_TEMP, currentTemp - STEP_TEMP);
                // S'assurer que la température est un multiple de 100
                newTemp = Math.round(newTemp / 100) * 100;
                logToFile(`[onKeyDown] Nouvelle température calculée: ${newTemp} K (${currentTemp} - ${STEP_TEMP})`);
                // Application de la nouvelle température
                logToFile(`[onKeyDown] Application de la nouvelle température: ${newTemp} K`);
                await this.executeLitraCommand(`temperature-k ${newTemp}`);
                // Vérification après application
                const verifiedTemp = await this.getCurrentTemperature();
                logToFile(`[onKeyDown] Vérification après application: ${verifiedTemp} K`);
                // Mise à jour de l'interface
                await ev.action.setTitle(`-400 K`);
                await ev.action.showOk();
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

exports.TemperatureDownAction = TemperatureDownAction;
//# sourceMappingURL=temperature-down-D4l9HHN0.js.map

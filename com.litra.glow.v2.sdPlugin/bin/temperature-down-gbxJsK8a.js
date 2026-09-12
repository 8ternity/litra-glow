'use strict';

var tslib_es6 = require('./tslib.es6-CSuM4ipl.js');
var plugin = require('./plugin.js');
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
require('child_process');

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
    let _classDecorators = [plugin.action({ UUID: 'com.litra.glow.v2.1.temperature.down' })];
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
        async getCurrentTemperature(serialNumber) {
            // 1 seul appel `litra-devices --json` (mutualisé + caché entre les actions).
            const devices = await plugin.getDevices();
            const device = plugin.pickDevice(devices, serialNumber);
            if (device) {
                logToFile(`[getCurrentTemperature] Température trouvée: ${device.temperatureInKelvin} K`);
                return device.temperatureInKelvin;
            }
            logToFile(`[getCurrentTemperature] Lampe introuvable, valeur par défaut: ${MIN_TEMP} K`);
            return MIN_TEMP;
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
            logToFile(`[onWillAppear] serialNumber dans settings: ${ev.payload.settings?.serialNumber}`);
            try {
                const serialNumber = ev.payload.settings?.serialNumber;
                const currentTemp = await this.getCurrentTemperature(serialNumber);
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
            logToFile(`[onKeyDown] serialNumber dans settings: ${ev.payload.settings?.serialNumber}`);
            try {
                const serialNumber = ev.payload.settings?.serialNumber;
                const newTemp = await plugin.withDeviceLock(serialNumber, async () => {
                    const currentTemp = await this.getCurrentTemperature(serialNumber);
                    logToFile(`[onKeyDown] Température actuelle: ${currentTemp} K`);
                    // Si déjà au minimum, ne rien faire
                    if (currentTemp <= MIN_TEMP) {
                        logToFile(`[onKeyDown] Déjà au minimum (${MIN_TEMP} K), aucune action`);
                        return null;
                    }
                    // Calculer nouvelle valeur (- STEP_TEMP)
                    let next = Math.max(MIN_TEMP, currentTemp - STEP_TEMP);
                    // S'assurer que la température est un multiple de 100
                    next = Math.round(next / 100) * 100;
                    logToFile(`[onKeyDown] Nouvelle température calculée: ${next} K (${currentTemp} - ${STEP_TEMP})`);
                    // Application de la nouvelle température (1 seul spawn, pas de
                    // relecture : l'écriture réussie fait foi)
                    await plugin.setTemperature(serialNumber, next);
                    return next;
                });
                // Mise à jour de l'interface
                await ev.action.setTitle(`-400 K`);
                if (newTemp !== null) {
                    await ev.action.showOk().catch(() => undefined);
                    logToFile(`[onKeyDown] Température appliquée: ${newTemp} K`);
                }
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
//# sourceMappingURL=temperature-down-gbxJsK8a.js.map

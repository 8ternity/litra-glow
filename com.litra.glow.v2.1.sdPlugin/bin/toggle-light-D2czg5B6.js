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

function logToFile(message) {
    const logDir = path__namespace.join(__dirname, '../../logs');
    if (!fs__namespace.existsSync(logDir)) {
        fs__namespace.mkdirSync(logDir, { recursive: true });
    }
    const logFile = path__namespace.join(logDir, 'toggle-light.log');
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    try {
        fs__namespace.appendFileSync(logFile, logMessage);
        console.log(`[ToggleLight] ${message}`);
    }
    catch (error) {
        console.error(`[ToggleLight] Log error: ${error}`);
    }
}
// Définition des icônes SVG d'Elgato pour Key Light
// Ces SVG sont adaptés du style des icônes d'Elgato
const ICON_LIGHT_ON = `
<svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
  <path fill="white" d="M72 28c-24.3 0-44 19.7-44 44 0 13.7 6.3 25.9 16 34v10c0 2.2 1.8 4 4 4h48c2.2 0 4-1.8 4-4v-10c9.7-8.1 16-20.3 16-34 0-24.3-19.7-44-44-44zm20 66.8V108H52V94.8C43.6 87.7 38 75.3 38 66c0-18.8 15.2-34 34-34s34 15.2 34 34c0 9.3-5.6 21.7-14 28.8z"/>
  <path fill="white" d="M72 48c-11 0-20 9-20 20 0 11 9 20 20 20s20-9 20-20c0-11-9-20-20-20zm0 30c-5.5 0-10-4.5-10-10s4.5-10 10-10 10 4.5 10 10-4.5 10-10 10z"/>
  <path fill="white" d="M60 116h24v8H60z"/>
</svg>`;
const ICON_LIGHT_OFF = `
<svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
  <path fill="white" d="M72 28c-24.3 0-44 19.7-44 44 0 13.7 6.3 25.9 16 34v10c0 2.2 1.8 4 4 4h48c2.2 0 4-1.8 4-4v-10c9.7-8.1 16-20.3 16-34 0-24.3-19.7-44-44-44zm20 66.8V108H52V94.8C43.6 87.7 38 75.3 38 66c0-18.8 15.2-34 34-34s34 15.2 34 34c0 9.3-5.6 21.7-14 28.8z"/>
  <path fill="white" d="M60 116h24v8H60z"/>
</svg>`;
let ToggleLightAction = (() => {
    let _classDecorators = [plugin.action({ UUID: 'com.litra.glow.v2.toggle' })];
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
        currentState = 0; // Track state internally
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
        async checkLightStatus() {
            try {
                logToFile(`[checkLightStatus] Vérification de l'état de la lumière...`);
                const devices = await this.executeLitraCommand('devices');
                const isOn = devices.includes(': On ') || devices.includes('💡') || devices.toLowerCase().includes('on');
                logToFile(`[checkLightStatus] Lumière ${isOn ? 'ON' : 'OFF'}`);
                return isOn;
            }
            catch (error) {
                logToFile(`[checkLightStatus] Erreur: ${error}`);
                return false;
            }
        }
        // Méthode pour définir l'icône en fonction de l'état
        async updateIcon(action, state) {
            try {
                // Utiliser les icônes SVG en fonction de l'état
                const iconSvg = state === 1 ? ICON_LIGHT_ON : ICON_LIGHT_OFF;
                // Appel à setImage pour définir l'icône dynamiquement
                await action.setImage(iconSvg);
                logToFile(`[updateIcon] Icône mise à jour avec succès pour l'état: ${state}`);
            }
            catch (error) {
                logToFile(`[updateIcon] Erreur lors de la mise à jour de l'icône: ${error}`);
            }
        }
        /**
         * The {@link SingletonAction.onWillAppear} event is called when the action appears on the Stream Deck.
         */
        async onWillAppear(ev) {
            logToFile(`[onWillAppear] Appelée`);
            try {
                const lightIsOn = await this.checkLightStatus();
                this.currentState = lightIsOn ? 1 : 0;
                logToFile(`[onWillAppear] État initial: ${this.currentState}`);
                // Définir l'état pour l'image statique du manifest
                if ('setState' in ev.action && typeof ev.action.setState === 'function') {
                    await ev.action.setState(this.currentState);
                }
                // Utiliser l'icône SVG Elgato si disponible
                if (ev.payload.isInMultiAction !== true) {
                    await this.updateIcon(ev.action, this.currentState);
                }
            }
            catch (error) {
                logToFile(`[onWillAppear] Erreur: ${error}`);
                this.currentState = 0;
                if ('setState' in ev.action && typeof ev.action.setState === 'function') {
                    await ev.action.setState(0);
                }
            }
        }
        /**
         * The {@link SingletonAction.onKeyDown} event is called when the key is pressed down.
         */
        async onKeyDown(ev) {
            logToFile(`[onKeyDown] Appelée - état courant: ${this.currentState}`);
            try {
                await this.executeLitraCommand('toggle');
                this.currentState = this.currentState === 0 ? 1 : 0;
                logToFile(`[onKeyDown] Nouvel état: ${this.currentState}`);
                // Définir l'état pour l'image statique du manifest
                if ('setState' in ev.action && typeof ev.action.setState === 'function') {
                    await ev.action.setState(this.currentState);
                }
                // Mettre à jour l'icône SVG Elgato si ce n'est pas dans une multi-action
                if (ev.payload.isInMultiAction !== true) {
                    await this.updateIcon(ev.action, this.currentState);
                }
                await ev.action.showOk();
                logToFile(`[onKeyDown] Action terminée avec succès`);
            }
            catch (error) {
                logToFile(`[onKeyDown] Erreur: ${error}`);
                await ev.action.showAlert();
            }
        }
    });
    return _classThis;
})();

exports.ToggleLightAction = ToggleLightAction;
//# sourceMappingURL=toggle-light-D2czg5B6.js.map

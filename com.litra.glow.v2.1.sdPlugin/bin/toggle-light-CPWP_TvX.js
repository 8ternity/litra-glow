'use strict';

var driver = require('./driver-BK-7QaK7.js');
var plugin = require('./plugin.js');
var fs = require('fs');
var path = require('path');
require('events');
require('util');
require('os');
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
            driver.__esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            driver.__runInitializers(_classThis, _classExtraInitializers);
        }
        currentState = 0; // Track state internally
        getFirstDevice() {
            try {
                logToFile(`[getFirstDevice] Recherche des appareils Litra...`);
                const device = driver.findDevice();
                if (!device) {
                    logToFile(`[getFirstDevice] Aucun appareil Litra trouvé`);
                    throw new Error('Aucun appareil Litra Glow trouvé');
                }
                logToFile(`[getFirstDevice] Appareil Litra trouvé: ${device.serialNumber}`);
                return device;
            }
            catch (error) {
                logToFile(`[getFirstDevice] Erreur: ${error.message}`);
                throw error;
            }
        }
        checkLightStatus() {
            try {
                logToFile(`[checkLightStatus] Vérification de l'état de la lumière...`);
                const device = this.getFirstDevice();
                const lightIsOn = driver.isOn(device);
                logToFile(`[checkLightStatus] Lumière ${lightIsOn ? 'ON' : 'OFF'}`);
                return lightIsOn;
            }
            catch (error) {
                logToFile(`[checkLightStatus] Erreur: ${error}`);
                return false;
            }
        }
        /**
         * The {@link SingletonAction.onWillAppear} event is called when the action appears on the Stream Deck.
         */
        async onWillAppear(ev) {
            logToFile(`[onWillAppear] Appelée`);
            try {
                const lightIsOn = this.checkLightStatus();
                this.currentState = lightIsOn ? 1 : 0;
                logToFile(`[onWillAppear] État initial: ${this.currentState}`);
                if ('setState' in ev.action && typeof ev.action.setState === 'function') {
                    await ev.action.setState(this.currentState);
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
                const device = this.getFirstDevice();
                driver.toggle(device);
                this.currentState = this.currentState === 0 ? 1 : 0;
                logToFile(`[onKeyDown] Nouvel état: ${this.currentState}`);
                if ('setState' in ev.action && typeof ev.action.setState === 'function') {
                    await ev.action.setState(this.currentState);
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
//# sourceMappingURL=toggle-light-CPWP_TvX.js.map

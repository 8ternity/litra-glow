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
        async getCurrentBrightness() {
            try {
                const result = await this.executeLitraCommand('brightness');
                const match = result.match(/(\d+)/);
                if (match && match[1]) {
                    const brightness = parseInt(match[1], 10);
                    logToFile(`[getCurrentBrightness] Luminosité actuelle: ${brightness}%`);
                    return brightness;
                }
                logToFile(`[getCurrentBrightness] Impossible de lire la luminosité, utilisation de la valeur par défaut: 100%`);
                return 100; // Valeur par défaut si on ne peut pas lire la luminosité actuelle
            }
            catch (error) {
                logToFile(`[getCurrentBrightness] Erreur: ${error}`);
                return 100;
            }
        }
        async onWillAppear(ev) {
            logToFile(`[onWillAppear] Appelée`);
            try {
                const currentBrightness = await this.getCurrentBrightness();
                await ev.action.setTitle(`-10%\n${currentBrightness}%`);
                logToFile(`[onWillAppear] Action initialisée avec luminosité: ${currentBrightness}%`);
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Erreur inconnue';
                logToFile(`[onWillAppear] Erreur: ${message}`);
                await ev.action.setTitle('-10%');
            }
        }
        async onKeyDown(ev) {
            logToFile(`[onKeyDown] Appelée`);
            try {
                const currentBrightness = await this.getCurrentBrightness();
                const newBrightness = Math.max(currentBrightness - 10, 1); // Minimum 1% pour garder la lumière visible
                logToFile(`[onKeyDown] Diminution de la luminosité de ${currentBrightness}% à ${newBrightness}%`);
                await this.executeLitraCommand(`brightness ${newBrightness}`);
                logToFile(`[onKeyDown] Luminosité réglée avec succès à ${newBrightness}%`);
                await ev.action.setTitle(`-10%\n${newBrightness}%`);
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

exports.BrightnessDownAction = BrightnessDownAction;
//# sourceMappingURL=brightness-down-Rr_UbWA-.js.map

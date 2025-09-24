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
// Chemins vers les fichiers SVG externes
const SVG_LIGHT_ON_PATH = path__namespace.join(__dirname, '../../imgs/litra_glow_on.svg');
const SVG_LIGHT_OFF_PATH = path__namespace.join(__dirname, '../../imgs/litra_glow_off.svg');
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
        async checkLightStatus(serialNumber) {
            try {
                logToFile(`[checkLightStatus] Vérification de l'état de la lumière...`);
                const devices = await this.executeLitraCommand('devices');
                logToFile(`[checkLightStatus] Sortie litra-devices:\n${devices}`);
                if (serialNumber) {
                    // Cherche le bloc correspondant au numéro de série
                    const regex = new RegExp(`- [^\n]+\\(${serialNumber}\\): (On|Off)[^\n]*`, 'm');
                    const match = regex.exec(devices);
                    if (match && match[1]) {
                        const isOn = match[1].toLowerCase() === 'on';
                        logToFile(`[checkLightStatus] Lumière ${serialNumber} ${isOn ? 'ON' : 'OFF'}`);
                        return isOn;
                    }
                    logToFile(`[checkLightStatus] Numéro de série ${serialNumber} non trouvé dans la sortie.`);
                    return false;
                }
                else {
                    // Ancien comportement : premier bloc trouvé
                    const isOn = devices.includes(': On ') || devices.includes('💡') || devices.toLowerCase().includes('on');
                    logToFile(`[checkLightStatus] Lumière (premier bloc) ${isOn ? 'ON' : 'OFF'}`);
                    return isOn;
                }
            }
            catch (error) {
                logToFile(`[checkLightStatus] Erreur: ${error}`);
                return false;
            }
        }
        // Méthode pour définir l'icône en fonction de l'état
        async updateIcon(action, state) {
            try {
                // Lire le contenu SVG à partir des fichiers externes
                const svgPath = state === 1 ? SVG_LIGHT_ON_PATH : SVG_LIGHT_OFF_PATH;
                // Vérifier si le fichier existe
                if (fs__namespace.existsSync(svgPath)) {
                    const svgContent = fs__namespace.readFileSync(svgPath, 'utf8');
                    // Appel à setImage pour définir l'icône dynamiquement
                    await action.setImage(svgContent);
                    logToFile(`[updateIcon] Icône mise à jour avec succès pour l'état: ${state} depuis ${svgPath}`);
                }
                else {
                    logToFile(`[updateIcon] Fichier SVG introuvable: ${svgPath}`);
                    throw new Error(`Fichier SVG introuvable: ${svgPath}`);
                }
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
            logToFile(`[onWillAppear] serialNumber dans settings: ${ev.payload.settings?.serialNumber}`);
            try {
                const serialNumber = ev.payload.settings?.serialNumber;
                const lightIsOn = await this.checkLightStatus(serialNumber);
                this.currentState = lightIsOn ? 1 : 0;
                logToFile(`[onWillAppear] État initial: ${this.currentState}`);
                // Définir l'état pour l'image statique du manifest
                if ('setState' in ev.action && typeof ev.action.setState === 'function') {
                    await ev.action.setState(this.currentState);
                }
                // Utiliser l'icône SVG si disponible
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
            logToFile(`[onKeyDown] serialNumber dans settings: ${ev.payload.settings?.serialNumber}`);
            try {
                const serialNumber = ev.payload.settings?.serialNumber;
                await this.executeLitraCommand('toggle', serialNumber);
                this.currentState = this.currentState === 0 ? 1 : 0;
                logToFile(`[onKeyDown] Nouvel état: ${this.currentState}`);
                // Définir l'état pour l'image statique du manifest
                if ('setState' in ev.action && typeof ev.action.setState === 'function') {
                    await ev.action.setState(this.currentState);
                }
                // Mettre à jour l'icône SVG si ce n'est pas dans une multi-action
                if (ev.payload.isInMultiAction !== true) {
                    await this.updateIcon(ev.action, this.currentState);
                }
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
//# sourceMappingURL=toggle-light-CnGDSn7J.js.map

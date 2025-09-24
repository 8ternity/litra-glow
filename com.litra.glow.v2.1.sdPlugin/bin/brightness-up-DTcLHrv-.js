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
                // Lecture de la luminosité actuelle
                const output = await this.executeLitraCommand('devices');
                // Log de la sortie complète pour débogage
                logToFile(`[getCurrentBrightness] Sortie complète de litra-devices:\n${output}`);
                // Recherche du pattern avec une regex très souple
                const brightnessRegex = /Brightness:\s*(\d+)\s*lm/;
                const match = brightnessRegex.exec(output);
                if (match && match[1]) {
                    const lumens = parseInt(match[1], 10);
                    logToFile(`[getCurrentBrightness] Luminosité trouvée: ${lumens} lm`);
                    return lumens;
                }
                // En cas d'échec, on affiche un message détaillé
                logToFile(`[getCurrentBrightness] Pattern non trouvé dans la sortie!`);
                logToFile(`[getCurrentBrightness] Utilisation de la valeur par défaut: ${MAX_LUMENS} lm`);
                return MAX_LUMENS;
            }
            catch (error) {
                logToFile(`[getCurrentBrightness] Erreur: ${error}`);
                return MAX_LUMENS;
            }
        }
        async onWillAppear(ev) {
            logToFile(`[onWillAppear] Appelée`);
            try {
                const currentLumens = await this.getCurrentBrightness();
                await ev.action.setTitle(`+25 lm\n${currentLumens} lm`);
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
                // Application de la nouvelle luminosité
                logToFile(`[onKeyDown] Application de la nouvelle luminosité: ${newLumens} lm`);
                await this.executeLitraCommand(`brightness-lm ${newLumens}`);
                // Vérification après application
                const verifiedLumens = await this.getCurrentBrightness();
                logToFile(`[onKeyDown] Vérification après application: ${verifiedLumens} lm`);
                // Mise à jour de l'interface
                await ev.action.setTitle(`+25 lm\n${verifiedLumens} lm`);
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

exports.BrightnessUpAction = BrightnessUpAction;
//# sourceMappingURL=brightness-up-DTcLHrv-.js.map

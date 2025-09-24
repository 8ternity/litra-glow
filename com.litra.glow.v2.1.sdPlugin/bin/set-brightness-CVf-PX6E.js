'use strict';

var tslib_es6 = require('./tslib.es6-CSuM4ipl.js');
var plugin = require('./plugin.js');
var driver = require('./driver-BUJgd4GA.js');
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
require('fs');
require('path');
require('util');
require('os');

let SetBrightnessAction = (() => {
    let _classDecorators = [plugin.action({ UUID: 'com.litra.glow.v2.brightness' })];
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
        getFirstDevice() {
            try {
                console.log(`[SetBrightnessAction] Recherche des appareils Litra...`);
                const device = driver.findDevice();
                if (!device) {
                    console.log(`[SetBrightnessAction] Aucun appareil Litra trouvé`);
                    throw new Error('Aucun appareil Litra Glow trouvé');
                }
                console.log(`[SetBrightnessAction] Appareil Litra trouvé: ${device.serialNumber}`);
                return device;
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Erreur inconnue';
                console.error(`[SetBrightnessAction] Erreur lors de la recherche de l'appareil: ${message}`);
                throw new Error(`Impossible de trouver l'appareil Litra: ${message}`);
            }
        }
        validateBrightness(settings) {
            if (!settings || typeof settings.brightness === 'undefined' || settings.brightness === null) {
                console.warn(`[SetBrightnessAction] Aucune luminosité configurée, utilisation de 100%`);
                return 100;
            }
            const brightness = Number(settings.brightness);
            if (isNaN(brightness)) {
                console.warn(`[SetBrightnessAction] Valeur de luminosité invalide: ${settings.brightness}, utilisation de 100%`);
                return 100;
            }
            const validBrightness = Math.min(Math.max(brightness, 1), 100);
            if (validBrightness !== brightness) {
                console.warn(`[SetBrightnessAction] Valeur de luminosité ajustée de ${brightness}% à ${validBrightness}%`);
            }
            return validBrightness;
        }
        /**
         * The {@link SingletonAction.onWillAppear} event is called when the action appears on the Stream Deck.
         */
        async onWillAppear(ev) {
            try {
                const brightnessPercentage = this.validateBrightness(ev.payload.settings);
                // Update title with configured brightness
                await ev.action.setTitle(`${brightnessPercentage}%`);
                console.log(`[SetBrightnessAction] Action initialisée avec ${brightnessPercentage}%`);
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Erreur inconnue';
                console.error(`[SetBrightnessAction] Erreur lors de l'initialisation: ${message}`);
                await ev.action.setTitle('N/A');
            }
        }
        /**
         * The {@link SingletonAction.onKeyDown} event is called when the key is pressed down.
         */
        async onKeyDown(ev) {
            try {
                const brightnessPercentage = this.validateBrightness(ev.payload.settings);
                console.log(`[SetBrightnessAction] Tentative de réglage de la luminosité à ${brightnessPercentage}%`);
                // Get device first to fail fast if not found
                const device = this.getFirstDevice();
                if (!device) {
                    throw new Error('Aucun appareil Litra trouvé');
                }
                // Set brightness using litra API
                await driver.setBrightnessPercentage(device, brightnessPercentage);
                console.log(`[SetBrightnessAction] Luminosité réglée avec succès à ${brightnessPercentage}%`);
                // Update title
                await ev.action.setTitle(`${brightnessPercentage}%`);
                // Show success feedback
                await ev.action.showOk();
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Erreur inconnue';
                console.error(`[SetBrightnessAction] Erreur: ${message}`);
                await ev.action.showAlert();
                await ev.action.setTitle('Erreur');
            }
        }
    });
    return _classThis;
})();

exports.SetBrightnessAction = SetBrightnessAction;
//# sourceMappingURL=set-brightness-CVf-PX6E.js.map

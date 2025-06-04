'use strict';

var driver = require('./driver-BK-7QaK7.js');
var plugin = require('./plugin.js');
require('events');
require('util');
require('path');
require('os');
require('fs');
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

let SetTemperatureAction = (() => {
    let _classDecorators = [plugin.action({ UUID: 'com.litra.glow.temperature' })];
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
        getFirstDevice() {
            try {
                console.log(`[SetTemperatureAction] Recherche des appareils Litra...`);
                const device = driver.findDevice();
                if (!device) {
                    console.log(`[SetTemperatureAction] Aucun appareil Litra trouvé`);
                    throw new Error('Aucun appareil Litra Glow trouvé');
                }
                console.log(`[SetTemperatureAction] Appareil Litra trouvé: ${device.serialNumber}`);
                return device;
            }
            catch (error) {
                console.error(`[SetTemperatureAction] Erreur: ${error.message}`);
                throw error;
            }
        }
        /**
         * The {@link SingletonAction.onWillAppear} event is called when the action appears on the Stream Deck.
         */
        async onWillAppear(ev) {
            try {
                const settings = ev.payload.settings;
                const temperature = settings.temperature || 6500;
                // Update title with configured temperature
                await ev.action.setTitle(`${temperature}K`);
            }
            catch (error) {
                console.error('Error setting up temperature action:', error);
                await ev.action.setTitle('N/A');
            }
        }
        /**
         * The {@link SingletonAction.onKeyDown} event is called when the key is pressed down.
         */
        async onKeyDown(ev) {
            try {
                const settings = ev.payload.settings;
                const temperature = settings.temperature || 6500;
                // Set temperature using litra API
                const device = this.getFirstDevice();
                driver.setTemperatureInKelvin(device, temperature);
                // Update title
                await ev.action.setTitle(`${temperature}K`);
                // Show success feedback
                await ev.action.showOk();
            }
            catch (error) {
                console.error('Error setting temperature:', error);
                await ev.action.showAlert();
            }
        }
    });
    return _classThis;
})();

exports.SetTemperatureAction = SetTemperatureAction;
//# sourceMappingURL=set-temperature-DIq2XF16.js.map

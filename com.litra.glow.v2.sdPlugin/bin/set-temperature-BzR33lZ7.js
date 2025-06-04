'use strict';

var tslib_es6 = require('./tslib.es6-CSuM4ipl.js');
var plugin = require('./plugin.js');
var require$$0 = require('events');
var require$$1$1 = require('util');
var path = require('path');
var require$$1 = require('os');
var fs = require('fs');
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

var nodehid = {};

var bindingOptions;
var hasRequiredBindingOptions;

function requireBindingOptions () {
	if (hasRequiredBindingOptions) return bindingOptions;
	hasRequiredBindingOptions = 1;
	bindingOptions = {
	    name: 'HID',
	    napi_versions: [3],
	};
	return bindingOptions;
}

function commonjsRequire(path) {
	throw new Error('Could not dynamically require "' + path + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}

var prebuild;
var hasRequiredPrebuild;

function requirePrebuild () {
	if (hasRequiredPrebuild) return prebuild;
	hasRequiredPrebuild = 1;
	const fs$1 = fs;

	/**
	 * Generate the filename of the prebuild file.
	 * The format of the name is possible to calculate based on some options
	 * @param {object} options
	 * @returns
	 */
	function getPrebuildName(options) {
		if (!options.napi_version) throw new Error('NAN not implemented') // TODO

		const tokens = [
			options.name,
			options.platform,
			options.arch,
			// options.armv ? (options.arch === 'arm64' ? '8' : vars.arm_version) : null,
			options.libc && options.platform === 'linux' ? options.libc : null,
		];
		return `${tokens.filter((t) => !!t).join('-')}/${options.runtime}-napi-v${options.napi_version}.node`
	}

	function isNwjs() {
		return !!(process.versions && process.versions.nw)
	}

	function isElectron() {
		if (process.versions && process.versions.electron) return true
		if (process.env.ELECTRON_RUN_AS_NODE) return true
		return typeof window !== 'undefined' && window.process && window.process.type === 'renderer'
	}

	function isAlpine(platform) {
		return platform === 'linux' && fs$1.existsSync('/etc/alpine-release')
	}

	prebuild = {
		getPrebuildName,
		isNwjs,
		isElectron,
		isAlpine,
	};
	return prebuild;
}

var bindings;
var hasRequiredBindings;

function requireBindings () {
	if (hasRequiredBindings) return bindings;
	hasRequiredBindings = 1;
	const path$1 = path;
	const os = require$$1;
	const { getPrebuildName, isNwjs, isElectron, isAlpine } = requirePrebuild();

	// Jest can allow users to mock 'fs', but we need the real fs
	const fs$1 = typeof jest !== 'undefined' ? jest.requireActual('fs') : fs;

	// Workaround to fix webpack's build warnings: 'the request of a dependency is an expression'
	const runtimeRequire = typeof __webpack_require__ === 'function' ? __non_webpack_require__ : commonjsRequire; // eslint-disable-line

	/**
	 * Find the best path to the binding file
	 * @param {string} basePath - Base path of the module, where binaries will be located
	 * @param {object} options - Describe how the prebuilt binary is named
	 * @param {boolean} verifyPrebuild - True if we are verifying that a prebuild exists
	 * @param {boolean} throwOnMissing - True if an error should be thrown when the binary is missing
	 * @returns
	 */
	function resolvePath(basePath, options, verifyPrebuild, throwOnMissing) {
		if (typeof basePath !== 'string' || !basePath) throw new Error(`Invalid basePath to pkg-prebuilds`)

		if (typeof options !== 'object' || !options) throw new Error(`Invalid options to pkg-prebuilds`)
		if (typeof options.name !== 'string' || !options.name) throw new Error(`Invalid name to pkg-prebuilds`)

		let isNodeApi = false;
		if (options.napi_versions && Array.isArray(options.napi_versions)) {
			isNodeApi = true;
		}

		const arch = (verifyPrebuild && process.env.npm_config_arch) || os.arch();
		const platform = (verifyPrebuild && process.env.npm_config_platform) || os.platform();

		let runtime = 'node';
		// If node-api, then everything can share the same binary
		if (!isNodeApi) {
			if (verifyPrebuild && process.env.npm_config_runtime) {
				runtime = process.env.npm_config_runtime;
			} else if (isElectron()) {
				runtime = 'electron';
			} else if (isNwjs()) {
				runtime = 'node-webkit';
			}
		}

		const candidates = [];

		if (!verifyPrebuild) {
			// Try for a locally built binding
			candidates.push(
				path$1.join(basePath, 'build', 'Debug', `${options.name}.node`),
				path$1.join(basePath, 'build', 'Release', `${options.name}.node`)
			);
		}

		let libc = undefined;
		if (isAlpine(platform)) libc = 'musl';

		// Look for prebuilds
		if (isNodeApi) {
			// Look for node-api versioned builds
			for (const ver of options.napi_versions) {
				const prebuildName = getPrebuildName({
					name: options.name,
					platform,
					arch,
					libc,
					napi_version: ver,
					runtime,
					// armv: options.armv ? (arch === 'arm64' ? '8' : vars.arm_version) : null,
				});
				candidates.push(path$1.join(basePath, 'prebuilds', prebuildName));
			}
		} else {
			throw new Error('Not implemented for NAN!')
		}

		let foundPath = null;

		for (const candidate of candidates) {
			if (fs$1.existsSync(candidate)) {
				const stat = fs$1.statSync(candidate);
				if (stat.isFile()) {
					foundPath = candidate;
					break
				}
			}
		}

		if (!foundPath && throwOnMissing) {
			const candidatesStr = candidates.map((cand) => ` - ${cand}`).join('\n');
			throw new Error(`Failed to find binding for ${options.name}\nTried paths:\n${candidatesStr}`)
		}

		return foundPath
	}

	function loadBinding(basePath, options) {
		const foundPath = resolvePath(basePath, options, false, true);

		// Note: this error should not be hit, as resolvePath will throw if the binding is missing
		if (!foundPath) throw new Error(`Failed to find binding for ${options.name}`)

		return runtimeRequire(foundPath)
	}
	loadBinding.resolve = resolvePath;

	bindings = loadBinding;
	return bindings;
}

var hasRequiredNodehid;

function requireNodehid () {
	if (hasRequiredNodehid) return nodehid;
	hasRequiredNodehid = 1;
	const EventEmitter = require$$0.EventEmitter;
	const util = require$$1$1;

	let driverType = null;
	function setDriverType(type) {
	    driverType = type;
	}

	// lazy load the C++ binding
	let binding = null;
	function loadBinding() {
	    if (!binding) {
	        const options = requireBindingOptions();
	        if (process.platform === "linux" && (!driverType || driverType === "hidraw")) {
	            options.name = 'HID_hidraw';
	        }
	        binding = requireBindings()(__dirname, options);
	    }
	}

	//This class is a wrapper for `binding.HID` class
	function HID() {

	    // see issue #150 (enhancement, solves issue #149)
	    // throw an error for those who forget to instantiate, i.e. by "*new* HID.HID()"
	    // and who would otherwise be left trying to figure out why "self.on is not a function"
	    if (!new.target) {
	        throw new Error('HID() must be called with \'new\' operator');
	    }

	    //Inherit from EventEmitter
	    EventEmitter.call(this);

	    loadBinding();

	    /* We also want to inherit from `binding.HID`, but unfortunately,
	        it's not so easy for native Objects. For example, the
	        following won't work since `new` keyword isn't used:
	        `binding.HID.apply(this, arguments);`
	        So... we do this craziness instead...
	    */
	    var thisPlusArgs = new Array(arguments.length + 1);
	    thisPlusArgs[0] = null;
	    for(var i = 0; i < arguments.length; i++)
	        thisPlusArgs[i + 1] = arguments[i];
	    this._raw = new (Function.prototype.bind.apply(binding.HID,
	        thisPlusArgs) )();

	    /* Now we have `this._raw` Object from which we need to
	        inherit.  So, one solution is to simply copy all
	        prototype methods over to `this` and binding them to
	        `this._raw`
	    */
	    for(var i in binding.HID.prototype)
	        this[i] = binding.HID.prototype[i].bind(this._raw);

	    /* We are now done inheriting from `binding.HID` and EventEmitter.
	        Now upon adding a new listener for "data" events, we start
	        polling the HID device using `read(...)`
	        See `resume()` for more details. */
	    this._paused = true;
	    var self = this;
	    self.on("newListener", function(eventName, listener) {
	        if(eventName == "data")
	            process.nextTick(self.resume.bind(self) );
	    });
	}
	//Inherit prototype methods
	util.inherits(HID, EventEmitter);
	//Don't inherit from `binding.HID`; that's done above already!

	HID.prototype.close = function close() {
	    this._closing = true;
	    this.removeAllListeners();
	    if (this._paused) {
	        // Don't exit if a read is currently running
	        this._raw.close();
	        this._closed = true;
	    } else {
	        // Make sure the read is stopped ASAP
	        this._raw.readInterrupt();
	    }
	};
	//Pauses the reader, which stops "data" events from being emitted
	HID.prototype.pause = function pause() {
	    this._paused = true;
	    this._raw.readInterrupt();
	};

	HID.prototype.read = function read(callback) {
	    if (this._closed) {
	    throw new Error('Unable to read from a closed HID device');
	  } else {
	    return this._raw.read(callback);
	  }
	};

	HID.prototype.resume = function resume() {
	    var self = this;
	    if(self._paused && self.listeners("data").length > 0)
	    {
	        //Start polling & reading loop
	        self._paused = false;
	        self.read(function readFunc(err, data) {
	            try {
	                if (self._closing) {
	                    // Discard any data if we're closing

	                    self._paused = true;
	                    self._raw.close();
	                    self._closed = true;

	                    return
	                }

	                if(err)
	                {
	                    //Emit error and pause reading
	                    self._paused = true;
	                    if(!self._closing)
	                        self.emit("error", err);
	                    //else ignore any errors if I'm closing the device
	                }
	                else
	                {
	                    //If there are no "data" listeners, we pause
	                    if(self.listeners("data").length <= 0)
	                        self._paused = true;
	                    //Keep reading if we aren't paused
	                    if(!self._paused)
	                        self.read(readFunc);
	                    //Now emit the event
	                    self.emit("data", data);
	                }
	            } catch (e) {
	                // Emit an error on the device instead of propagating to a c++ exception
	                setImmediate(() => {
	                    if (!self._closing)
	                        self.emit("error", e);
	                });
	            }
	        });
	    }
	};

	class HIDAsync extends EventEmitter {
	    constructor(raw) {
	        super();

	        if (!(raw instanceof binding.HIDAsync)) {
	            throw new Error(`HIDAsync cannot be constructed directly. Use HIDAsync.open() instead`)
	        }

	        this._raw = raw;

	        /* Now we have `this._raw` Object from which we need to
	            inherit.  So, one solution is to simply copy all
	            prototype methods over to `this` and binding them to
	            `this._raw`.
	            We explicitly wrap them in an async method, to ensure 
	            that any thrown errors are promise rejections
	        */
	        for (let i in this._raw) {
	            this[i] = async (...args) => this._raw[i](...args);
	        }

	        /* Now upon adding a new listener for "data" events, we start
	            the read thread executing. See `resume()` for more details.
	        */
	        this.on("newListener", (eventName, listener) =>{
	            if(eventName == "data")
	                process.nextTick(this.resume.bind(this) );
	        });
	        this.on("removeListener", (eventName, listener) => {
	            if(eventName == "data" && this.listenerCount("data") == 0)
	                process.nextTick(this.pause.bind(this) );
	        });
	    }

	    static async open(...args) {
	        loadBinding();
	        const native = await binding.openAsyncHIDDevice(...args);
	        return new HIDAsync(native)
	    }

	    async close() {
	        this._closing = true;
	        this.removeAllListeners();
	        await this._raw.close();
	        this._closed = true;
	    }
	    
	    //Pauses the reader, which stops "data" events from being emitted
	    pause() {
	        this._raw.readStop();
	    }

	    resume() {
	        if(this.listenerCount("data") > 0)
	        {
	            //Start polling & reading loop
	            this._raw.readStart((err, data) => {
	                try {
	                    if (err) {
	                        if(!this._closing)
	                            this.emit("error", err);
	                        //else ignore any errors if I'm closing the device
	                    } else {
	                        this.emit("data", data);
	                    }
	                } catch (e) {
	                    // Emit an error on the device instead of propagating to a c++ exception
	                    setImmediate(() => {
	                        if (!this._closing)
	                            this.emit("error", e);
	                    });
	                }
	            });
	        }
	    }
	}

	function showdevices() {
	    loadBinding();
	    return binding.devices.apply(HID,arguments);
	}

	function showdevicesAsync(...args) {
	    loadBinding();
	    return binding.devicesAsync(...args);
	}


	//Expose API
	nodehid.HID = HID;
	nodehid.HIDAsync = HIDAsync;
	nodehid.devices = showdevices;
	nodehid.devicesAsync = showdevicesAsync;
	nodehid.setDriverType = setDriverType;
	return nodehid;
}

var nodehidExports = requireNodehid();
var HID = /*@__PURE__*/plugin.getDefaultExportFromCjs(nodehidExports);

/**
 * Pads the provided array to a specified length, adding the required
 * number of occurences of the padding element to the end of the array.
 *
 * @param {any[]} array The array to pad
 * @param {number} length The required length for the array after padding
 * @param {any} paddingElement The element to pad the array with
 * @returns {any[]} The array padded to the required length
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const padRight = (array, length, paddingElement) => {
    if (array.length >= length) {
        return array;
    }
    return [
        ...array,
        ...Array(length - array.length)
            .fill([paddingElement])
            .flat(),
    ];
};
/**
 * Converts the provided integer into an array of two bytes, with the most
 * significant byte at the beginning of the array.
 *
 * Throws an error if the provided parameter is not an integer.
 *
 * @param {integer} integer The integer to convert into an array of bytes
 * @returns {[number, number]} The provided integer converted to an array
 * of type bytes, with the most significant byte at the beginning of the
 * array.
 */
const integerToBytes = (integer) => {
    if (!Number.isInteger(integer)) {
        throw 'Provided value must be an integer';
    }
    return [Math.trunc(integer / 256), integer % 256];
};
/**
 * Finds all multiples of a given integer within a range. The returned
 * list of multiples may or may not include the values at the start and
 * the end of the range.
 *
 * For example:
 *   - the multiples of 3 within the range 0 to 10 are 0, 3, 6, 9
 *   - the multiples of 3 within the range 1 to 10 are 3, 6, 9
 *   - the multiples of 5 within the range 0 to 20 are 0, 5, 10, 15, 20
 *   - the multiples of 3 within the range 10 to 20 are 12, 15, 18
 *
 * @param {number} multiplesOf The integer to find multiples of
 * @param {number} startRange The integer at the start of the range
 * @param {number} endRange The integer at the end of the range
 * @returns {number[]} An array of all the multiples
 */
const multiplesWithinRange = (multiplesOf, startRange, endRange) => {
    if (!Number.isInteger(multiplesOf)) {
        throw 'Provided value for `multiplesOf` must be an integer';
    }
    if (!Number.isInteger(startRange)) {
        throw 'Provided value for `startRange` must be an integer';
    }
    if (!Number.isInteger(endRange)) {
        throw 'Provided value for `endRange` must be an integer';
    }
    const inclusiveIntegersWithinRange = Array(endRange - startRange + 1)
        .fill([])
        .map((_, idx) => startRange + idx);
    return inclusiveIntegersWithinRange.filter((integer) => integer % multiplesOf === 0);
};

var DeviceType;
(function (DeviceType) {
    DeviceType["LitraGlow"] = "litra_glow";
    DeviceType["LitraBeam"] = "litra_beam";
    DeviceType["LitraBeamLX"] = "litra_beam_lx";
})(DeviceType || (DeviceType = {}));
const VENDOR_ID = 0x046d;
const PRODUCT_IDS = [
    0xc900, // Litra Glow
    0xc901, // Litra Beam
    0xb901, // Litra Beam
    0xc903, // Litra Beam LX
];
const USAGE_PAGE = 0xff43;
({
    [DeviceType.LitraGlow]: 20,
    [DeviceType.LitraBeam]: 30,
    [DeviceType.LitraBeamLX]: 30,
});
({
    [DeviceType.LitraGlow]: 250,
    [DeviceType.LitraBeam]: 400,
    [DeviceType.LitraBeamLX]: 400,
});
const MULTIPLES_OF_100_BETWEEN_2700_AND_6500 = multiplesWithinRange(100, 2700, 6500);
const ALLOWED_TEMPERATURES_IN_KELVIN_BY_DEVICE_TYPE = {
    [DeviceType.LitraGlow]: MULTIPLES_OF_100_BETWEEN_2700_AND_6500,
    [DeviceType.LitraBeam]: MULTIPLES_OF_100_BETWEEN_2700_AND_6500,
    [DeviceType.LitraBeamLX]: MULTIPLES_OF_100_BETWEEN_2700_AND_6500,
};
({
    [DeviceType.LitraGlow]: 'Logitech Litra Glow',
    [DeviceType.LitraBeam]: 'Logitech Litra Beam',
    [DeviceType.LitraBeamLX]: 'Logitech Litra Beam LX',
});
const isLitraDevice = (device) => {
    return (device.vendorId === VENDOR_ID &&
        PRODUCT_IDS.includes(device.productId) &&
        device.usagePage === USAGE_PAGE);
};
const hidDeviceToDevice = (hidDevice) => {
    return {
        type: getDeviceTypeByProductId(hidDevice.productId),
        hid: new HID.HID(hidDevice.path),
        serialNumber: hidDevice.serialNumber,
    };
};
/**
 * Finds your Logitech Litra device and returns it. Returns `null` if a
 * supported device cannot be found connected to your computer.
 *
 * @returns {Device, null} An object representing your Logitech Litra device,
 * passed into other functions like `turnOn` and `setTemperatureInKelvin` -
 * or `null` if a matching device cannot be found connected to your computer.
 */
const findDevice = () => {
    const matchingDevice = HID.devices().find(isLitraDevice);
    if (matchingDevice) {
        return hidDeviceToDevice(matchingDevice);
    }
    else {
        return null;
    }
};
const generateSetTemperatureInKelvinBytes = (device, temperatureInKelvin) => {
    if (device.type === DeviceType.LitraBeamLX) {
        return padRight([0x11, 0xff, 0x06, 0x9c, ...integerToBytes(temperatureInKelvin)], 20, 0x00);
    }
    else {
        return padRight([0x11, 0xff, 0x04, 0x9c, ...integerToBytes(temperatureInKelvin)], 20, 0x00);
    }
};
/**
 * Sets the temperature of your Logitech Litra device
 *
 * @param {Device} device The device to set the temperature of
 * @param {number} temperatureInKelvin The temperature to set in Kelvin. Only
 *   multiples of 100 between the device's minimum and maximum temperatures
 *   are allowed. Use the `getMinimumTemperatureInKelvinForDevice` and
 *   `getMaximumTemperatureInKelvinForDevice` functions to get the minimum
 *   and maximum temperature for your device.
 */
const setTemperatureInKelvin = (device, temperatureInKelvin) => {
    if (!Number.isInteger(temperatureInKelvin)) {
        throw 'Provided temperature must be an integer';
    }
    const minimumTemperature = getMinimumTemperatureInKelvinForDevice(device);
    const maximumTemperature = getMaximumTemperatureInKelvinForDevice(device);
    const allowedTemperatures = getAllowedTemperaturesInKelvinForDevice(device);
    if (!allowedTemperatures.includes(temperatureInKelvin)) {
        throw `Provided temperature must be a multiple of 100 between ${minimumTemperature} and ${maximumTemperature} for this device`;
    }
    const bytes = generateSetTemperatureInKelvinBytes(device, temperatureInKelvin);
    device.hid.write(bytes);
};
/**
 * Gets the type of a Logitech Litra device by its product IOD
 *
 * @param {number} productId The product ID of the device
 * @returns {DeviceType} The type of the device
 */
const getDeviceTypeByProductId = (productId) => {
    switch (productId) {
        case PRODUCT_IDS[0]:
            return DeviceType.LitraGlow;
        case PRODUCT_IDS[1]:
        case PRODUCT_IDS[2]:
            return DeviceType.LitraBeam;
        case PRODUCT_IDS[3]:
            return DeviceType.LitraBeamLX;
        default:
            throw 'Unknown device type';
    }
};
/**
 * Gets the minimum temperature in Kelvin supported by a device
 *
 * @param {Device} device The device to check the minimum temperature for
 * @returns {number} The minimum temperature in Kelvin supported by the device
 */
const getMinimumTemperatureInKelvinForDevice = (device) => {
    return ALLOWED_TEMPERATURES_IN_KELVIN_BY_DEVICE_TYPE[device.type][0];
};
/**
 * Gets the maximum temperature in Kelvin supported by a device
 *
 * @param {Device} device The device to check the maximum temperature for
 * @returns {number} The maximum temperature in Kelvin supported by the device
 */
const getMaximumTemperatureInKelvinForDevice = (device) => {
    const allowedTemperatures = ALLOWED_TEMPERATURES_IN_KELVIN_BY_DEVICE_TYPE[device.type];
    return allowedTemperatures[allowedTemperatures.length - 1];
};
/**
 * Gets all temperature values in Kelvin supported by a device
 *
 * @param {Device} device The device to check the allowed temperatures for
 * @returns {number[]} The temperature values in Kelvin supported by the device
 */
const getAllowedTemperaturesInKelvinForDevice = (device) => {
    return ALLOWED_TEMPERATURES_IN_KELVIN_BY_DEVICE_TYPE[device.type];
};

let SetTemperatureAction = (() => {
    let _classDecorators = [plugin.action({ UUID: 'com.litra.glow.v2.temperature' })];
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
                console.log(`[SetTemperatureAction] Recherche des appareils Litra...`);
                const device = findDevice();
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
                setTemperatureInKelvin(device, temperature);
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
//# sourceMappingURL=set-temperature-BzR33lZ7.js.map

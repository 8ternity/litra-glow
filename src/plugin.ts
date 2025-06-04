import streamDeck from '@elgato/streamdeck';
import { writeFileSync, appendFileSync } from 'fs';
import { join } from 'path';

const logFile = join(__dirname, '..', 'plugin-debug.log');

function log(message: string) {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - ${message}\n`;
  console.log(message);
  try {
    appendFileSync(logFile, logMessage);
  } catch (e) {
    // Ignore file write errors
  }
}

// Main async function to handle plugin initialization
async function main() {
    try {
        // Log startup information
        console.log('[Plugin] Starting Litra Glow plugin...');
        console.log('[Plugin] Process arguments:', process.argv.slice(2));

        // Parse command line arguments provided by Stream Deck
        const args = process.argv.slice(2);
        let port: string | undefined;
        let pluginUUID: string | undefined;
        let registerEvent: string | undefined;
        let info: string | undefined;

        // Parse arguments
        for (let i = 0; i < args.length; i++) {
            switch (args[i]) {
                case '-port':
                    port = args[i + 1];
                    break;
                case '-pluginUUID':
                    pluginUUID = args[i + 1];
                    break;
                case '-registerEvent':
                    registerEvent = args[i + 1];
                    break;
                case '-info':
                    info = args[i + 1];
                    break;
            }
        }

        console.log('[Plugin] Parsed arguments:', {
            port,
            pluginUUID,
            registerEvent,
            info: info ? 'received' : 'missing'
        });

        // Import and register actions
        console.log('[Plugin] Importing action classes...');

        const { BrightnessUpAction } = await import('./actions/brightness-up.js');
        const { BrightnessDownAction } = await import('./actions/brightness-down.js');
        const { TemperatureUpAction } = await import('./actions/temperature-up.js');
        const { TemperatureDownAction } = await import('./actions/temperature-down.js');
        const { ToggleLightAction } = await import('./actions/toggle-light.js');

        console.log('[Plugin] Registering actions...');

        // Register all actions
        streamDeck.actions.registerAction(new BrightnessUpAction());
        streamDeck.actions.registerAction(new BrightnessDownAction());
        streamDeck.actions.registerAction(new TemperatureUpAction());
        streamDeck.actions.registerAction(new TemperatureDownAction());
        streamDeck.actions.registerAction(new ToggleLightAction());

        console.log('[Plugin] All actions registered');

        // Connect to Stream Deck and wait for connection
        console.log('[Plugin] Connecting to Stream Deck...');
        await streamDeck.connect();
        
        console.log('[Plugin] ✅ Successfully connected to Stream Deck!');
        console.log('[Plugin] Plugin initialization complete - ready to receive events');

    } catch (error) {
        console.error('[Plugin] ❌ Initialization failed:', error);
        process.exit(1);
    }
}

// Keep the process alive
process.on('SIGINT', () => {
    console.log('[Plugin] Received SIGINT, shutting down...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('[Plugin] Received SIGTERM, shutting down...');
    process.exit(0);
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
    console.error('[Plugin] Uncaught exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('[Plugin] Unhandled rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Start the plugin
main(); 
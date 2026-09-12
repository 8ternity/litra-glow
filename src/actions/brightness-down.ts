import { action, KeyDownEvent, SingletonAction, WillAppearEvent } from '@elgato/streamdeck';
import * as fs from 'fs';
import * as path from 'path';
import { getDevices, pickDevice, setBrightness, withDeviceLock } from '../lib/litra.js';

const MIN_LUMENS = 20;
const MAX_LUMENS = 250;
const STEP_LUMENS = 25;

// Icône de luminosité réduite avec teinte rougeâtre pour la diminution
const ICON_BRIGHTNESS_DOWN = `
<svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
  <g transform="translate(36, 36) scale(0.5, 0.5)">
    <g fill="none" stroke="#e08080" stroke-width="8">
      <!-- Cercle extérieur -->
      <circle cx="72" cy="72" r="54" />
      <!-- Curseur central -->
      <circle cx="72" cy="72" r="30" fill="#e08080" />
      <!-- Symbole moins -->
      <line x1="52" y1="72" x2="92" y2="72" stroke="#ffffff" stroke-width="8" stroke-linecap="round" />
    </g>
  </g>
</svg>`;

function logToFile(message: string) {
  const logDir = path.join(__dirname, '../../logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  const logFile = path.join(logDir, 'brightness-down.log');
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  try {
    fs.appendFileSync(logFile, logMessage);
    console.log(`[BrightnessDown] ${message}`);
  } catch (error) {
    console.error(`[BrightnessDown] Log error: ${error}`);
  }
}

type Settings = {
  serialNumber?: string;
  brightness?: number;
};

@action({ UUID: 'com.litra.glow.v2.1.brightness.down' })
export class BrightnessDownAction extends SingletonAction<Settings> {

  private async getCurrentBrightness(serialNumber?: string): Promise<number> {
    // 1 seul appel `litra-devices --json` (mutualisé + caché entre les actions).
    const devices = await getDevices();
    const device = pickDevice(devices, serialNumber);
    if (device) {
      logToFile(`[getCurrentBrightness] Luminosité trouvée: ${device.brightnessInLumen} lm`);
      return device.brightnessInLumen;
    }
    logToFile(`[getCurrentBrightness] Lampe introuvable, valeur par défaut: ${MIN_LUMENS} lm`);
    return MIN_LUMENS;
  }

  // Méthode pour mettre à jour l'icône
  private async updateIcon(action: any): Promise<void> {
    try {
      await action.setImage(ICON_BRIGHTNESS_DOWN);
      logToFile(`[updateIcon] Icône mise à jour avec succès`);
    } catch (error) {
      logToFile(`[updateIcon] Erreur lors de la mise à jour de l'icône: ${error}`);
    }
  }

  async onWillAppear(ev: WillAppearEvent<Settings>): Promise<void> {
    logToFile(`[onWillAppear] Appelée`);
    logToFile(`[onWillAppear] serialNumber dans settings: ${ev.payload.settings?.serialNumber}`);
    try {
      const serialNumber = ev.payload.settings?.serialNumber;
      const currentLumens = await this.getCurrentBrightness(serialNumber);
      await ev.action.setTitle(`-25 lm`);

      // Appliquer l'icône personnalisée
      if (ev.payload.isInMultiAction !== true) {
        await this.updateIcon(ev.action);
      }

      logToFile(`[onWillAppear] Action initialisée avec luminosité: ${currentLumens} lm`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      logToFile(`[onWillAppear] Erreur: ${message}`);
      await ev.action.setTitle('-25 lm');
    }
  }

  async onKeyDown(ev: KeyDownEvent<Settings>): Promise<void> {
    logToFile(`[onKeyDown] Appelée`);
    logToFile(`[onKeyDown] serialNumber dans settings: ${ev.payload.settings?.serialNumber}`);
    try {
      const serialNumber = ev.payload.settings?.serialNumber;
      const newLumens = await withDeviceLock(serialNumber, async () => {
        const currentLumens = await this.getCurrentBrightness(serialNumber);
        logToFile(`[onKeyDown] Luminosité actuelle: ${currentLumens} lm`);
        // Si déjà au minimum, ne rien faire
        if (currentLumens <= MIN_LUMENS) {
          logToFile(`[onKeyDown] Déjà au minimum (${MIN_LUMENS} lm), aucune action`);
          return null;
        }
        // Calculer nouvelle valeur (simplement -25 lumens)
        const next = Math.max(MIN_LUMENS, currentLumens - STEP_LUMENS);
        logToFile(`[onKeyDown] Nouvelle luminosité calculée: ${next} lm (${currentLumens} - ${STEP_LUMENS})`);
        // Application de la nouvelle luminosité (1 seul spawn, pas de relecture :
        // l'écriture réussie fait foi)
        await setBrightness(serialNumber, next);
        return next;
      });
      // Mise à jour de l'interface
      await ev.action.setTitle(`-25 lm`);
      if (newLumens !== null) {
        await ev.action.showOk().catch(() => undefined);
        logToFile(`[onKeyDown] Luminosité appliquée: ${newLumens} lm`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      logToFile(`[onKeyDown] Erreur: ${message}`);
      await ev.action.showAlert();
    }
  }
}

import { action, KeyDownEvent, SingletonAction, WillAppearEvent } from '@elgato/streamdeck';
import * as fs from 'fs';
import * as path from 'path';
import { getDevices, pickDevice, toggleDevice, withDeviceLock } from '../lib/litra.js';

function logToFile(message: string) {
  const logDir = path.join(__dirname, '../../logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  const logFile = path.join(logDir, 'toggle-light.log');
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  try {
    fs.appendFileSync(logFile, logMessage);
    console.log(`[ToggleLight] ${message}`);
  } catch (error) {
    console.error(`[ToggleLight] Log error: ${error}`);
  }
}

// Chemins vers les fichiers SVG externes (relatifs au plugin installé)
const getPluginPath = () => {
  // En mode développement ou production, on cherche le dossier imgs au bon endroit
  const possiblePaths = [
    path.join(__dirname, '../../imgs'), // Chemin de développement
    path.join(process.cwd(), 'imgs'),   // Chemin du plugin installé
    path.join(__dirname, '../imgs'),    // Autre chemin possible
  ];

  for (const basePath of possiblePaths) {
    if (fs.existsSync(path.join(basePath, 'litra_glow_on.svg'))) {
      return basePath;
    }
  }

  // Fallback vers le chemin de développement
  return path.join(__dirname, '../../imgs');
};

const SVG_LIGHT_ON_PATH = path.join(getPluginPath(), 'litra_glow_on.svg');
const SVG_LIGHT_OFF_PATH = path.join(getPluginPath(), 'litra_glow_off.svg');

@action({ UUID: 'com.litra.glow.v2.1.toggle' })
export class ToggleLightAction extends SingletonAction<Settings> {
  private currentState = 0; // Track state internally

  private async checkLightStatus(serialNumber?: string): Promise<boolean> {
    // 1 seul appel `litra-devices --json` (mutualisé + caché entre les actions).
    const devices = await getDevices();
    const device = pickDevice(devices, serialNumber);
    if (!device) {
      logToFile(`[checkLightStatus] Aucune lampe trouvée.`);
      return false;
    }
    logToFile(`[checkLightStatus] Lampe ${device.serialNumber} ${device.isOn ? 'ON' : 'OFF'}`);
    return device.isOn;
  }

  // Méthode pour définir l'icône en fonction de l'état
  private async updateIcon(action: any, state: number): Promise<void> {
    try {
      // Lire le contenu SVG à partir des fichiers externes
      const svgPath = state === 1 ? SVG_LIGHT_ON_PATH : SVG_LIGHT_OFF_PATH;

      // Vérifier si le fichier existe
      if (fs.existsSync(svgPath)) {
        const svgContent = fs.readFileSync(svgPath, 'utf8');

        // Appel à setImage pour définir l'icône dynamiquement
        await action.setImage(svgContent);
        logToFile(`[updateIcon] Icône mise à jour avec succès pour l'état: ${state} depuis ${svgPath}`);
      } else {
        logToFile(`[updateIcon] Fichier SVG introuvable: ${svgPath}`);
        throw new Error(`Fichier SVG introuvable: ${svgPath}`);
      }
    } catch (error) {
      logToFile(`[updateIcon] Erreur lors de la mise à jour de l'icône: ${error}`);
    }
  }

  /**
   * The {@link SingletonAction.onWillAppear} event is called when the action appears on the Stream Deck.
   */
  async onWillAppear(ev: WillAppearEvent<Settings>): Promise<void> {
    logToFile(`[onWillAppear] Appelée`);
    logToFile(`[onWillAppear] serialNumber dans settings: ${ev.payload.settings?.serialNumber}`);
    try {
      const serialNumber = ev.payload.settings?.serialNumber;
      const lightIsOn = await this.checkLightStatus(serialNumber);
      this.currentState = lightIsOn ? 1 : 0;
      logToFile(`[onWillAppear] État initial: ${this.currentState}`);

      // Définir l'état pour l'image statique du manifest
      if ('setState' in ev.action && typeof ev.action.setState === 'function') {
        await ev.action.setState(this.currentState as 0 | 1);
      }

      // Utiliser l'icône SVG si disponible
      if (ev.payload.isInMultiAction !== true) {
        await this.updateIcon(ev.action, this.currentState);
      }
    } catch (error) {
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
  async onKeyDown(ev: KeyDownEvent<Settings>): Promise<void> {
    logToFile(`[onKeyDown] Appelée - état courant: ${this.currentState}`);
    logToFile(`[onKeyDown] serialNumber dans settings: ${ev.payload.settings?.serialNumber}`);
    try {
      const serialNumber = ev.payload.settings?.serialNumber;
      // 1 seul spawn : pas de lecture préalable ni de vérification, le
      // hardware bascule et l'écriture réussie fait foi.
      await withDeviceLock(serialNumber, () => toggleDevice(serialNumber));
      this.currentState = this.currentState === 0 ? 1 : 0;
      logToFile(`[onKeyDown] Nouvel état: ${this.currentState}`);

      // Définir l'état pour l'image statique du manifest
      if ('setState' in ev.action && typeof ev.action.setState === 'function') {
        await ev.action.setState(this.currentState as 0 | 1);
      }

      // Mettre à jour l'icône SVG si ce n'est pas dans une multi-action
      if (ev.payload.isInMultiAction !== true) {
        await this.updateIcon(ev.action, this.currentState);
      }

      await ev.action.showOk().catch(() => undefined);
      logToFile(`[onKeyDown] Action terminée avec succès`);
    } catch (error) {
      logToFile(`[onKeyDown] Erreur: ${error}`);
      await ev.action.showAlert();
    }
  }
}

/**
 * Settings for {@link ToggleLightAction}.
 */
type Settings = {
  serialNumber?: string;
};

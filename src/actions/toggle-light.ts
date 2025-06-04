import { action, KeyDownEvent, SingletonAction, WillAppearEvent } from '@elgato/streamdeck';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

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

// Chemins vers les fichiers SVG externes
const SVG_LIGHT_ON_PATH = path.join(__dirname, '../../imgs/litra_glow_on.svg');
const SVG_LIGHT_OFF_PATH = path.join(__dirname, '../../imgs/litra_glow_off.svg');

@action({ UUID: 'com.litra.glow.v2.toggle' })
export class ToggleLightAction extends SingletonAction<Settings> {
  private currentState = 0; // Track state internally
  
  private async executeLitraCommand(command: string): Promise<string> {
    try {
      logToFile(`[executeLitraCommand] Exécution: npx litra-${command}`);
      
      const result = execSync(`npx litra-${command}`, {
        encoding: 'utf8',
        timeout: 10000,
        cwd: process.cwd(),
        env: {
          ...process.env,
          PATH: process.env.PATH + ';C:\\Program Files\\nodejs\\;C:\\Users\\ET34N1TY\\AppData\\Roaming\\npm',
          NODE_PATH: path.join(process.cwd(), 'node_modules')
        }
      });
      
      logToFile(`[executeLitraCommand] Succès: ${result.trim()}`);
      return result.trim();
    } catch (error: any) {
      logToFile(`[executeLitraCommand] Erreur: ${error.message}`);
      throw error;
    }
  }

  private async checkLightStatus(): Promise<boolean> {
    try {
      logToFile(`[checkLightStatus] Vérification de l'état de la lumière...`);
      const devices = await this.executeLitraCommand('devices');
      const isOn = devices.includes(': On ') || devices.includes('💡') || devices.toLowerCase().includes('on');
      logToFile(`[checkLightStatus] Lumière ${isOn ? 'ON' : 'OFF'}`);
      return isOn;
    } catch (error) {
      logToFile(`[checkLightStatus] Erreur: ${error}`);
      return false;
    }
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
    try {
      const lightIsOn = await this.checkLightStatus();
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
    try {
      await this.executeLitraCommand('toggle');
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
  // No settings needed for toggle action
}; 
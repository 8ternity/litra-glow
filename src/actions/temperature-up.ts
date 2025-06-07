import { action, KeyDownEvent, SingletonAction, WillAppearEvent } from '@elgato/streamdeck';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const MIN_TEMP = 2700;
const MAX_TEMP = 6500;
const STEP_TEMP = 400;

// Icône de température avec teinte bleue pour l'augmentation (plus froid)
const ICON_TEMPERATURE_UP = `
<svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
  <g transform="translate(36, 36) scale(0.5, 0.5)">
    <g fill="none" stroke="#80b0e0" stroke-width="8">
      <!-- Cercle extérieur -->
      <circle cx="72" cy="72" r="54" />
      <!-- Cercle intérieur -->
      <circle cx="72" cy="72" r="30" fill="#80b0e0" />
      <!-- Thermomètre + symbole plus -->
      <line x1="72" y1="52" x2="72" y2="92" stroke="#ffffff" stroke-width="8" stroke-linecap="round" />
      <line x1="52" y1="72" x2="92" y2="72" stroke="#ffffff" stroke-width="8" stroke-linecap="round" />
    </g>
  </g>
</svg>`;

function logToFile(message: string) {
  const logDir = path.join(__dirname, '../../logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  const logFile = path.join(logDir, 'temperature-up.log');
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  try {
    fs.appendFileSync(logFile, logMessage);
    console.log(`[TemperatureUp] ${message}`);
  } catch (error) {
    console.error(`[TemperatureUp] Log error: ${error}`);
  }
}

type Settings = {
  serialNumber?: string;
};

@action({ UUID: 'com.litra.glow.v2.temperature.up' })
export class TemperatureUpAction extends SingletonAction<Settings> {
  
  private async executeLitraCommand(command: string, serialNumber?: string): Promise<string> {
    try {
      let cmd = `npx litra-${command}`;
      if (serialNumber && !command.startsWith('devices')) {
        cmd += ` --serial-number ${serialNumber}`;
      }
      logToFile(`[executeLitraCommand] Exécution: ${cmd}`);
      const result = execSync(cmd, {
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

  private async getCurrentTemperature(serialNumber?: string): Promise<number> {
    try {
      const output = await this.executeLitraCommand('devices');
      logToFile(`[getCurrentTemperature] Sortie complète de litra-devices:\n${output}`);
      if (serialNumber) {
        const regex = new RegExp(`\\(${serialNumber}\\):[^\\n]*\\n(?:  - .+\\n)*?  - Temperature: (\\d+)\\s*K`, 'm');
        const match = regex.exec(output);
        if (match && match[1]) {
          const kelvin = parseInt(match[1], 10);
          logToFile(`[getCurrentTemperature] Température trouvée pour ${serialNumber}: ${kelvin} K`);
          return kelvin;
        }
      } else {
        const temperatureRegex = /Temperature:\s*(\d+)\s*K/;
        const match = temperatureRegex.exec(output);
        if (match && match[1]) {
          const kelvin = parseInt(match[1], 10);
          logToFile(`[getCurrentTemperature] Température trouvée: ${kelvin} K`);
          return kelvin;
        }
      }
      logToFile(`[getCurrentTemperature] Pattern non trouvé dans la sortie!`);
      logToFile(`[getCurrentTemperature] Utilisation de la valeur par défaut: ${MAX_TEMP} K`);
      return MAX_TEMP;
    } catch (error) {
      logToFile(`[getCurrentTemperature] Erreur: ${error}`);
      return MAX_TEMP;
    }
  }

  // Méthode pour mettre à jour l'icône
  private async updateIcon(action: any): Promise<void> {
    try {
      await action.setImage(ICON_TEMPERATURE_UP);
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
      const currentTemp = await this.getCurrentTemperature(serialNumber);
      await ev.action.setTitle(`+400 K`);
      
      // Appliquer l'icône personnalisée
      if (ev.payload.isInMultiAction !== true) {
        await this.updateIcon(ev.action);
      }
      
      logToFile(`[onWillAppear] Action initialisée avec température: ${currentTemp} K`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      logToFile(`[onWillAppear] Erreur: ${message}`);
      await ev.action.setTitle('+400 K');
    }
  }

  async onKeyDown(ev: KeyDownEvent<Settings>): Promise<void> {
    logToFile(`[onKeyDown] Appelée`);
    logToFile(`[onKeyDown] serialNumber dans settings: ${ev.payload.settings?.serialNumber}`);
    try {
      const serialNumber = ev.payload.settings?.serialNumber;
      const currentTemp = await this.getCurrentTemperature(serialNumber);
      logToFile(`[onKeyDown] Température actuelle: ${currentTemp} K`);
      
      // Si déjà au maximum, ne rien faire
      if (currentTemp >= MAX_TEMP) {
        logToFile(`[onKeyDown] Déjà au maximum (${MAX_TEMP} K), aucune action`);
        await ev.action.setTitle(`+400 K`);
        return;
      }
      
      // Calculer nouvelle valeur (+ STEP_TEMP)
      let newTemp = Math.min(MAX_TEMP, currentTemp + STEP_TEMP);
      
      // S'assurer que la température est un multiple de 100
      newTemp = Math.round(newTemp / 100) * 100;
      
      logToFile(`[onKeyDown] Nouvelle température calculée: ${newTemp} K (${currentTemp} + ${STEP_TEMP})`);
      
      // Application de la nouvelle température
      logToFile(`[onKeyDown] Application de la nouvelle température: ${newTemp} K`);
      await this.executeLitraCommand(`temperature-k ${newTemp}`, serialNumber);
      
      // Vérification après application
      const verifiedTemp = await this.getCurrentTemperature(serialNumber);
      logToFile(`[onKeyDown] Vérification après application: ${verifiedTemp} K`);
      
      // Mise à jour de l'interface
      await ev.action.setTitle(`+400 K`);
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      logToFile(`[onKeyDown] Erreur: ${message}`);
      await ev.action.showAlert();
    }
  }
} 
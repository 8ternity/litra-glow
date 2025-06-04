import { action, KeyDownEvent, SingletonAction, WillAppearEvent } from '@elgato/streamdeck';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const MIN_LUMENS = 20;
const MAX_LUMENS = 250;
const STEP_LUMENS = 25;

// Icône de luminosité réduite avec teinte verdâtre pour l'augmentation
const ICON_BRIGHTNESS_UP = `
<svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
  <g transform="translate(36, 36) scale(0.5, 0.5)">
    <g fill="none" stroke="#a0e080" stroke-width="8">
      <!-- Cercle extérieur -->
      <circle cx="72" cy="72" r="54" />
      <!-- Curseur central -->
      <circle cx="72" cy="72" r="30" fill="#a0e080" />
      <!-- Symbole plus -->
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
  const logFile = path.join(logDir, 'brightness-up.log');
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  try {
    fs.appendFileSync(logFile, logMessage);
    console.log(`[BrightnessUp] ${message}`);
  } catch (error) {
    console.error(`[BrightnessUp] Log error: ${error}`);
  }
}

@action({ UUID: 'com.litra.glow.v2.brightness.up' })
export class BrightnessUpAction extends SingletonAction<Settings> {
  
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

  private async getCurrentBrightness(): Promise<number> {
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
    } catch (error) {
      logToFile(`[getCurrentBrightness] Erreur: ${error}`);
      return MAX_LUMENS;
    }
  }

  // Méthode pour mettre à jour l'icône
  private async updateIcon(action: any): Promise<void> {
    try {
      await action.setImage(ICON_BRIGHTNESS_UP);
      logToFile(`[updateIcon] Icône mise à jour avec succès`);
    } catch (error) {
      logToFile(`[updateIcon] Erreur lors de la mise à jour de l'icône: ${error}`);
    }
  }

  async onWillAppear(ev: WillAppearEvent<Settings>): Promise<void> {
    logToFile(`[onWillAppear] Appelée`);
    try {
      const currentLumens = await this.getCurrentBrightness();
      await ev.action.setTitle(`+25 lm`);
      
      // Appliquer l'icône personnalisée
      if (ev.payload.isInMultiAction !== true) {
        await this.updateIcon(ev.action);
      }
      
      logToFile(`[onWillAppear] Action initialisée avec luminosité: ${currentLumens} lm`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      logToFile(`[onWillAppear] Erreur: ${message}`);
      await ev.action.setTitle('+25 lm');
    }
  }

  async onKeyDown(ev: KeyDownEvent<Settings>): Promise<void> {
    logToFile(`[onKeyDown] Appelée`);
    try {
      // Lecture de la luminosité actuelle
      const currentLumens = await this.getCurrentBrightness();
      logToFile(`[onKeyDown] Luminosité actuelle: ${currentLumens} lm`);
      
      // Si déjà au maximum, ne rien faire
      if (currentLumens >= MAX_LUMENS) {
        logToFile(`[onKeyDown] Déjà au maximum (${MAX_LUMENS} lm), aucune action`);
        await ev.action.setTitle(`+25 lm`);
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
      await ev.action.setTitle(`+25 lm`);
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      logToFile(`[onKeyDown] Erreur: ${message}`);
      await ev.action.showAlert();
    }
  }
}

type Settings = Record<string, never>; // Pas de paramètres nécessaires 
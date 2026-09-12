import { execFile } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

export interface LitraDeviceState {
  name: string;
  serialNumber: string;
  isOn: boolean;
  brightnessInLumen: number;
  temperatureInKelvin: number;
}

interface JsonDevice {
  name: string;
  serial_number: string;
  is_on: boolean;
  brightness_in_lumen: number;
  temperature_in_kelvin: number;
}

const CLI_TIMEOUT_MS = 8000;
const DEVICES_CACHE_TTL_MS = 1500;

// ---------------------------------------------------------------------------
// Résolution du binaire litra.
//
// Avant : `npx litra-xxx` à chaque appui (~1100 ms / spawn, avec résolution
// npm + vérification réseau éventuelle du registre).
// Après : `node <.../litra/dist/commonjs/cli/litra-xxx.js>` via le Node déjà
// en cours d'exécution (~500 ms / spawn, identique au CLI tapé à la main).
// ---------------------------------------------------------------------------

let cliDirCache: string | null | undefined;

function candidateCliDirs(): string[] {
  const dirs: string[] = [];
  if (process.platform === 'win32') {
    if (process.env.APPDATA) dirs.push(join(process.env.APPDATA, 'npm', 'node_modules'));
    dirs.push('C:\\Program Files\\nodejs\\node_modules');
  } else {
    dirs.push('/usr/local/lib/node_modules');
    dirs.push('/opt/homebrew/lib/node_modules');
    if (process.env.HOME) dirs.push(join(process.env.HOME, '.npm-global', 'lib', 'node_modules'));
    dirs.push('/usr/lib/node_modules');
  }
  // Installation locale (dev / plugin packagé avec ses node_modules)
  dirs.push(join(process.cwd(), 'node_modules'));
  dirs.push(join(__dirname, '..', '..', 'node_modules'));
  dirs.push(join(__dirname, '..', 'node_modules'));
  return dirs;
}

function resolveLitraCliDir(): string | null {
  if (cliDirCache !== undefined) return cliDirCache;
  for (const dir of candidateCliDirs()) {
    try {
      // `litra-devices.js` existe forcément si le paquet est installé.
      if (existsSync(join(dir, 'litra', 'dist', 'commonjs', 'cli', 'litra-devices.js'))) {
        cliDirCache = join(dir, 'litra', 'dist', 'commonjs', 'cli');
        return cliDirCache;
      }
    } catch {
      // ignore et continue
    }
  }
  cliDirCache = null;
  return null;
}

function serialArgs(serialNumber?: string): string[] {
  return serialNumber ? ['--serial-number', serialNumber] : [];
}

/**
 * Exécute un CLI litra-* SANS passer par `npx` (lent) et SANS shell bloquant.
 * Retourne stdout trimmé. Rejette en cas d'erreur ou de timeout.
 */
export function runLitraCli(cliName: string, args: string[] = []): Promise<string> {
  const cliDir = resolveLitraCliDir();

  let cmd: string;
  let cmdArgs: string[];

  if (cliDir) {
    // Chemin rapide : le Node déjà en mémoire exécute directement le CLI.
    cmd = process.execPath;
    cmdArgs = [join(cliDir, `litra-${cliName}.js`), ...args];
  } else if (process.platform === 'win32') {
    // Repli : shim global via cmd (les .cmd ne sont pas exécutables directement).
    cmd = 'cmd';
    cmdArgs = ['/c', `litra-${cliName}`, ...args];
  } else {
    cmd = `litra-${cliName}`;
    cmdArgs = [...args];
  }

  return new Promise((resolve, reject) => {
    execFile(
      cmd,
      cmdArgs,
      {
        timeout: CLI_TIMEOUT_MS,
        windowsHide: true,
        env: {
          ...process.env,
          NO_UPDATE_NOTIFIER: '1',
          NPM_CONFIG_UPDATE_NOTIFIER: 'false',
        },
      },
      (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`litra-${cliName} failed: ${error.message}${stderr ? ` (${stderr.trim()})` : ''}`));
          return;
        }
        resolve(stdout.trim());
      }
    );
  });
}

// ---------------------------------------------------------------------------
// Lecture d'état avec cache court + déduplication des appels concurrents.
// `litra-devices --json` est le seul appel de lecture : 1 spawn donne
// on/off + luminosité + température d'un coup.
// ---------------------------------------------------------------------------

let devicesCache: { timestamp: number; data: LitraDeviceState[] } | null = null;
let devicesInFlight: Promise<LitraDeviceState[]> | null = null;

function mapJsonDevices(json: JsonDevice[]): LitraDeviceState[] {
  return json.map((d) => ({
    name: d.name,
    serialNumber: d.serial_number,
    isOn: d.is_on,
    brightnessInLumen: d.brightness_in_lumen,
    temperatureInKelvin: d.temperature_in_kelvin,
  }));
}

export async function getDevices(options: { allowCache?: boolean } = {}): Promise<LitraDeviceState[]> {
  const allowCache = options.allowCache !== false;
  const now = Date.now();

  if (allowCache && devicesCache && now - devicesCache.timestamp < DEVICES_CACHE_TTL_MS) {
    return devicesCache.data;
  }
  if (devicesInFlight) {
    return devicesInFlight;
  }

  devicesInFlight = (async () => {
    const stdout = await runLitraCli('devices', ['--json']);
    const parsed = JSON.parse(stdout) as JsonDevice[];
    const mapped = mapJsonDevices(parsed);
    devicesCache = { timestamp: Date.now(), data: mapped };
    return mapped;
  })();

  try {
    return await devicesInFlight;
  } finally {
    devicesInFlight = null;
  }
}

export function invalidateDevicesCache(): void {
  devicesCache = null;
}

export function pickDevice(devices: LitraDeviceState[], serialNumber?: string): LitraDeviceState | undefined {
  if (serialNumber) {
    return devices.find((d) => d.serialNumber === serialNumber);
  }
  return devices[0];
}

// ---------------------------------------------------------------------------
// Mutations. Chaque mutation = 1 seul spawn (pas de relecture de
// vérification : l'écriture HID réussie fait foi, le cache est invalidé).
// ---------------------------------------------------------------------------

export async function toggleDevice(serialNumber?: string): Promise<void> {
  await runLitraCli('toggle', serialArgs(serialNumber));
  invalidateDevicesCache();
}

export async function setBrightness(serialNumber: string | undefined, lumens: number): Promise<void> {
  await runLitraCli('brightness-lm', [String(Math.round(lumens)), ...serialArgs(serialNumber)]);
  invalidateDevicesCache();
}

export async function setTemperature(serialNumber: string | undefined, kelvin: number): Promise<void> {
  await runLitraCli('temperature-k', [String(Math.round(kelvin)), ...serialArgs(serialNumber)]);
  invalidateDevicesCache();
}

// ---------------------------------------------------------------------------
// Sérialisation des commandes par lampe : le HID n'aime pas les ouvertures
// concurrentes, et ça évite les races sur les appuis rapides (+++ / ---).
// ---------------------------------------------------------------------------

const deviceLocks = new Map<string, Promise<void>>();

export function withDeviceLock<T>(serialNumber: string | undefined, fn: () => Promise<T>): Promise<T> {
  const key = serialNumber ?? '__default__';
  const previous = deviceLocks.get(key) ?? Promise.resolve();
  const next = previous.then(fn, fn);
  deviceLocks.set(key, next.then(
    () => undefined,
    () => undefined
  ));
  return next;
}

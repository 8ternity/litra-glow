import express, { Request, Response } from 'express';
import cors from 'cors';
import { getDevices } from './lib/litra.js';

const app = express();
const PORT = 3000;

app.use(cors());

app.get('/litra-devices', async (req: Request, res: Response) => {
  try {
    // Lecture via le runner direct (pas de `npx`), avec cache court partagé.
    const devices = await getDevices();
    res.json(
      devices.map((d) => ({
        name: d.name,
        serial_number: d.serialNumber,
        is_on: d.isOn,
        brightness_in_lumen: d.brightnessInLumen,
        temperature_in_kelvin: d.temperatureInKelvin,
      }))
    );
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? 'Failed to list litra devices' });
  }
});

export function startLitraDevicesBridge() {
  app.listen(PORT, () => {
    console.log(`Litra Devices Bridge running on http://localhost:${PORT}`);
  });
}

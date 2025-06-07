import express, { Request, Response } from 'express';
import cors from 'cors';
import { exec } from 'child_process';

const app = express();
const PORT = 3000;

app.use(cors());

app.get('/litra-devices', (req: Request, res: Response) => {
  exec('npx litra-devices --json', (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    try {
      const devices = JSON.parse(stdout);
      res.json(devices);
    } catch (e) {
      res.status(500).json({ error: 'Invalid JSON from litra-devices' });
    }
  });
});

export function startLitraDevicesBridge() {
  app.listen(PORT, () => {
    console.log(`Litra Devices Bridge running on http://localhost:${PORT}`);
  });
} 
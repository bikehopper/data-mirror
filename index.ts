import express from 'express';
import { CHECKSUMS, DATA_PATH, updateFiles } from './lib/fetch-files.js';
import path from 'node:path';
import { PORT } from './env.js';
import { pinoHttp } from 'pino-http';
import logger from './lib/logger.js';
import helmet from 'helmet';
import { restartServices } from './lib/restart-services.js';

updateFiles();
const app = express();

// Add logger
const httpLogger = pinoHttp({
  logger: logger,
});
app.use((req, res, next) => {
  httpLogger(req, res);
  next();
});

// Used by coolify for healthchecks
app.get('/health', (req, res) => {
  res.sendStatus(200);
  res.end();
});

// basic api hardening
app.use(helmet());

/**
 * ROUTES
 */

app.get('/gtfs.zip', (req, res) => {
  if (CHECKSUMS.gtfs == null) {
    res.sendStatus(404);
    return;
  }

  res.setHeader('ETag', `"${CHECKSUMS.gtfs}"`);
  res.setHeader('Content-Type', 'application/octet-stream');
  res.sendFile(path.join(DATA_PATH, 'gtfs.zip'));
});

app.get('/osm.pbf', (req, res) => {
  if (CHECKSUMS.osm == null) {
    res.sendStatus(404);
    return;
  }
  res.setHeader('ETag', `"${CHECKSUMS.osm}"`);
  res.sendFile(path.join(DATA_PATH, 'osm.pbf'));
});

app.get('/region-config.json', (req, res) => {
  if (CHECKSUMS.region_config == null) {
    res.sendStatus(404);
    return;
  }
  res.setHeader('ETag', `"${CHECKSUMS.region_config}"`);
  res.sendFile(path.join(DATA_PATH, 'region-config.json'));
});

app.get('/elevators.csv', (req, res) => {
  if (CHECKSUMS.region_config == null) {
    res.sendStatus(404);
    return;
  }
  res.setHeader('ETag', `"${CHECKSUMS.elevators}"`);
  res.sendFile(path.join(DATA_PATH, 'elevators.csv'));
});

app.get('/checksums', (req, res) => {
  res.json(CHECKSUMS);
});

app.post('/update-data', async (req, res) => {
  const reqIp = req.ip;
  logger.info(`reqIp for /update-data: ${reqIp}`);
  // Only update data when request comes in from localhost
  if (reqIp && (reqIp === '::ffff:127.0.0.1' || reqIp === '::1')) {
    await updateFiles();
    await restartServices();
    res.sendStatus(200);
  } else {
    res.sendStatus(403);
  }
});


// Start th server
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
});
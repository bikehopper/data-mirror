import express from 'express';
import { CHECKSUMS, DATA_PATH, updateFiles } from './lib/fetch-files.js';
import path from 'node:path';
import { PORT } from './env.js';
import { pinoHttp } from 'pino-http';
import logger from './lib/logger.js';
import helmet from 'helmet';

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

app.get('/checksums', (req, res) => {
  res.json(CHECKSUMS);
});

app.post('/update-data', async (req, res) => {
  const reqIp = req.ip;
  logger.info(`reqIp for /update-data: ${reqIp}`);
  // Only update data when request comes in from localhost
  if (reqIp && reqIp === '::ffff:127.0.0.1') {
    await updateFiles();
    res.sendStatus(200);
  } else {
    res.sendStatus(403);
  }
});


// Start th server
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
});
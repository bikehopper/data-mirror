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
  res.sendFile(path.join(DATA_PATH, 'gtfs.zip'));
});

app.get('/osm.pbf', (req, res) => {
  if (CHECKSUMS.osm == null) {
    res.sendStatus(404);
    return;
  }
  res.sendFile(path.join(DATA_PATH, 'osm.pbf'));
});

app.get('/checksums', (req, res) => {
  res.json(CHECKSUMS);
});


// Start th server
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
});
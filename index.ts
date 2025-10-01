import express from 'express';
import { CHECKSUMS, DATA_PATH, updateFiles } from './lib/fetch-files.js';
import path from 'node:path';
import { PORT } from './env.js';
import { pinoHttp } from 'pino-http';
import logger from './lib/logger.js';
import helmet from 'helmet';
import { restartServices } from './lib/restart-services.js';
import { FILES, type SourceDataFileType } from './files.js';

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

for(const [key, fileInfo] of Object.entries(FILES)) {
  app.get(`/${fileInfo.name}`, (req, res) => {
    const fileType = key as SourceDataFileType;
    const checksum = CHECKSUMS.get(fileType);
    if (!checksum) {
      res.sendStatus(404);
      return;
    }

    res.setHeader('ETag', `"${checksum}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.sendFile(path.join(DATA_PATH, fileInfo.name));
  });
}

app.get('/checksums', (req, res) => {
  const json: any = {};
  for (const [fileType, checksum] of CHECKSUMS.entries()){
    json[fileType] = checksum;
  }
  res.json(json);
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
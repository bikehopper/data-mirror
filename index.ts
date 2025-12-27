import express from 'express';
import { CHECKSUMS, DATA_PATH, updateFiles } from './lib/fetch-files.js';
import path from 'node:path';
import { PORT } from './env.js';
import { pinoHttp } from 'pino-http';
import logger from './lib/logger.js';
import helmet from 'helmet';
import { restartServices } from './lib/restart-services.js';
import { FILES, type SourceDataFileType } from './files.js';
import { isLocalhost } from './lib/is-localhost.js';
import { getRealtimePbf } from './lib/fetch-rt-pbfs.js';
import { REALTIME_PBFS, type RealtimeSourceType } from './rt-pbfs.js';

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

for(const key of Object.keys(REALTIME_PBFS)) {
  app.get(`/rt/${key}.pbf`, (req, res) => {
    const pbfName = key as RealtimeSourceType;
    const buff = getRealtimePbf(pbfName);
    if (!buff) {
      res.sendStatus(404);
      return;
    }

    res
      .header('Cache-Control', 'max-age=0')
      .status(200)
      .send(buff);
  });
}

app.post('/update-data', async (req, res) => {
  const reqIp = req.ip;
  logger.info(`reqIp for /update-data: ${reqIp}`);
  // Only update data when request comes in from localhost
  if (isLocalhost(reqIp)) {
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
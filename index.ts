import express from 'express';
import { CHECKSUMS, DATA_PATH, updateFiles } from './fetch-files.js';
import path from 'node:path';
import { PORT } from './env.js';

updateFiles();

const app = express();

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

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})
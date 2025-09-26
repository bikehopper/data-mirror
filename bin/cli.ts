#!/usr/bin/env node

import { program } from 'commander';
import assert from 'node:assert';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { calcChecksum } from '../lib/calc-checksum.js';
import { fetchBlob } from '../lib/fetch-blob.js';

program
  .name('bikehopper/sync-data')
  .description('Download Bikehopper source data to initialize services')
  .option(
    '-o, --outDir <string>', 'output fir relative path', 
    (value: string) => path.join(process.cwd(), value),
    path.join(process.cwd(), '/data')
  )
  .option(
    '-r, --rootUrl <string>', '(Optional) root url for making requests for the file',
    'https://data.cool-bikehopper.org'
  );

program.parse();

const options = program.opts();
const checksumUrl = path.join(options.rootUrl, '/checksums');
const checksumRes = await fetch(checksumUrl);
const json = await checksumRes.json() as {gtfs: string | null, osm: string | null};
const gtfsHash = json.gtfs;
const osmHash = json.osm;
assert(gtfsHash != null)
assert(osmHash != null)

const checksumsLookup = {
  'gtfs.zip': gtfsHash,
  'osm.pbf': osmHash,
};

const updateFileIfNecessary = async (filename: 'gtfs.zip' | 'osm.pbf') => {
  if (!existsSync(options.outDir)){
    mkdirSync(options.outDir)
  }
  const filepath = path.join(options.outDir, filename);
  let needsDownload = false;
  if (!existsSync(filepath)) {
    needsDownload = true;
  } else {
    const checksum = calcChecksum(Buffer.from(readFileSync(filepath)));
    if (checksum !== checksumsLookup[filename]) {
      needsDownload = true;
    }
  }

  if (needsDownload) {
    const buffer = await fetchBlob(options.rootUrl+'/'+filename, console.log);
    writeFileSync(filepath, buffer);
  } else {
    console.log(`${filepath} does not need update`);
  }
};

await updateFileIfNecessary('gtfs.zip');
await updateFileIfNecessary('osm.pbf');
#!/usr/bin/env node

import { program } from 'commander';
import assert from 'node:assert';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { calcChecksum } from '../lib/calc-checksum.js';
import { fetchBlob } from '../lib/fetch-blob.js';
import type { CHECKSUMS } from '../lib/fetch-files.js';

program
  .name('bikehopper/sync-data')
  .description('Download Bikehopper source data to initialize services')
  .option(
    '-o, --outDir <string>', 'output directoy relative path', 
    (value: string) => path.resolve(value),
    path.join(process.cwd(), '/data')
  )
  .option(
    '-r, --rootUrl <string>', '(Optional) root url for making requests for the file',
    'https://data.cool-bikehopper.org'
  )
  .option(
    '-f, --files <string>', '(Optional) comma separated list of which resources should be downloaded',
    'gtfs,osm'
  );

program.parse();

const options = program.opts();
const filedToDownload: string[] = options.files.split(',');
const checksumUrl = path.join(options.rootUrl, '/checksums');
const checksumRes = await fetch(checksumUrl);
const json = await checksumRes.json() as typeof CHECKSUMS;
const gtfsHash = json.gtfs;
const osmHash = json.osm;
const regionConfigHash = json.region_config;
const elevatorsHash = json.elevators;
assert(gtfsHash != null)
assert(osmHash != null)
assert(regionConfigHash != null)
assert(elevatorsHash != null)

const checksumsLookup = {
  'gtfs.zip': gtfsHash,
  'osm.pbf': osmHash,
  'region-config.json': regionConfigHash,
  'elevators.csv': elevatorsHash,
};

const updateFileIfNecessary = async (filename: 'gtfs.zip' | 'osm.pbf' | 'region-config.json' | 'elevators.csv') => {
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
    const buffer = await fetchBlob(options.rootUrl+'/'+filename, console.log, true);
    writeFileSync(filepath, buffer);
  } else {
    console.log(`${filepath} does not need update`);
  }
};

if (filedToDownload.includes('gtfs')){
  await updateFileIfNecessary('gtfs.zip');
}

if (filedToDownload.includes('osm')) {
  await updateFileIfNecessary('osm.pbf');
}

if (filedToDownload.includes('region_config')) {
  await updateFileIfNecessary('region-config.json');
}

if (filedToDownload.includes('elevators')) {
  await updateFileIfNecessary('elevators.csv');
}
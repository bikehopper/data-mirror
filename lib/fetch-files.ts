import { GTFS_URL, OSM_PBF_URL } from '../env.js';
import path from 'node:path';
import fs, { existsSync, mkdirSync, rmSync } from 'node:fs';
import { calcChecksum } from './calc-checksum.js';
import { fetchBlob } from './fetch-blob.js';
import logger from './logger.js';

export const CHECKSUMS: Record<'gtfs' | 'osm', string | null> = {
  gtfs: null,
  osm: null,
};

export const DATA_PATH = path.join(process.cwd(), '/data');

let isUpdating = false;
export const updateFiles = async (): Promise<void> => {
  if (isUpdating) {
    return;
  }

  isUpdating = true;
  const gtfsZip = await fetchBlob(GTFS_URL, logger.info);
  const osmPbf = await fetchBlob(OSM_PBF_URL, logger.info);

  logger.info('Finished fetching data');

  CHECKSUMS.gtfs = calcChecksum(gtfsZip);
  CHECKSUMS.osm = calcChecksum(osmPbf);

  logger.info(JSON.stringify(CHECKSUMS, null, 2));

  // Intentionally using sync IO here
  // Avoid dealing with edge-cases of file-write being in-progress while a request comes in
  if (existsSync(DATA_PATH)) {
    rmSync(DATA_PATH, {recursive: true});
  }
  mkdirSync(DATA_PATH);
  fs.writeFileSync(path.join(DATA_PATH, 'gtfs.zip'), gtfsZip);
  fs.writeFileSync(path.join(DATA_PATH, 'osm.pbf'), osmPbf);

  isUpdating = false;
}

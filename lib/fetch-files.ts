import { ELEVATORS_CSV_URL, GTFS_URL, OSM_PBF_URL, REGION_CONFIG_URL } from '../env.js';
import path from 'node:path';
import fs, { existsSync, mkdirSync, rmSync } from 'node:fs';
import { calcChecksum } from './calc-checksum.js';
import { fetchBlob } from './fetch-blob.js';
import logger from './logger.js';

export type SourceDataFileType = 'gtfs' | 'osm' | 'region_config' | 'elevators';

export const CHECKSUMS: Record<SourceDataFileType, string | null> = {
  gtfs: null,
  osm: null,
  region_config: null,
  elevators: null,
};

export const DATA_PATH = path.join(process.cwd(), '/data');

let isUpdating = false;
export const updateFiles = async (): Promise<void> => {
  if (isUpdating) {
    return;
  }

  isUpdating = true;
  const gtfsZip = await fetchBlob(GTFS_URL, (value: string) => logger.info(value));
  const osmPbf = await fetchBlob(OSM_PBF_URL, (value: string) => logger.info(value));
  const regionConfig = await fetchBlob(REGION_CONFIG_URL, (value: string) => logger.info(value), true);
  const elevators = await fetchBlob(ELEVATORS_CSV_URL, (value: string) => logger.info(value), true);

  logger.info('Finished fetching data');

  CHECKSUMS.gtfs = calcChecksum(gtfsZip);
  CHECKSUMS.osm = calcChecksum(osmPbf);
  CHECKSUMS.region_config = calcChecksum(regionConfig);
  CHECKSUMS.elevators = calcChecksum(elevators);

  logger.info(JSON.stringify(CHECKSUMS, null, 2));

  // Intentionally using sync IO here
  // Avoid dealing with edge-cases of file-write being in-progress while a request comes in
  if (existsSync(DATA_PATH)) {
    rmSync(DATA_PATH, {recursive: true});
  }
  mkdirSync(DATA_PATH);
  fs.writeFileSync(path.join(DATA_PATH, 'gtfs.zip'), gtfsZip);
  fs.writeFileSync(path.join(DATA_PATH, 'osm.pbf'), osmPbf);
  fs.writeFileSync(path.join(DATA_PATH, 'region-config.json'), regionConfig);
  fs.writeFileSync(path.join(DATA_PATH, 'elevators.csv'), elevators);

  isUpdating = false;
}

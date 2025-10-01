import { ELEVATORS_CSV_URL, GTFS_URL, OSM_PBF_URL, REGION_CONFIG_URL } from '../env.js';
import path from 'node:path';
import fs, { existsSync, mkdirSync, rmSync } from 'node:fs';
import { calcChecksum } from './calc-checksum.js';
import { fetchBlob } from './fetch-blob.js';
import logger from './logger.js';
import { FILES, type SourceDataFileType } from '../files.js';

export const CHECKSUMS: Map<SourceDataFileType, string> = new Map();

export const DATA_PATH = path.join(process.cwd(), '/data');

let isUpdating = false;
export const updateFiles = async (): Promise<void> => {
  if (isUpdating) {
    return;
  }

  isUpdating = true;
  // Fetch Files from sources
  const fileBuffers: Map<SourceDataFileType, Buffer> = new Map();
  for (const [fileType, fileInfo] of Object.entries(FILES)) {
    const buff = await fetchBlob(fileInfo.source, (value: string) => logger.info(value));
    fileBuffers.set(fileType as SourceDataFileType, buff);
  }

  logger.info('Finished fetching data');

  // Calculate checksums
  for(const [fileType, buffer] of fileBuffers.entries()){
    CHECKSUMS.set(fileType, calcChecksum(buffer));
  }

  logger.info(JSON.stringify(CHECKSUMS, null, 2));

  // Intentionally using sync IO here
  // Avoid dealing with edge-cases of file-write being in-progress while a request comes in
  if (existsSync(DATA_PATH)) {
    rmSync(DATA_PATH, {recursive: true});
  }
  mkdirSync(DATA_PATH);
  for(const [fileType, buffer] of fileBuffers.entries()){
    fs.writeFileSync(path.join(DATA_PATH, FILES[fileType].name), buffer);
  }

  isUpdating = false;
}

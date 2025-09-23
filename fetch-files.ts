import { createHash } from 'node:crypto';
import { GTFS_URL, OSM_PBF_URL } from './env.js';
import path from 'node:path';
import fs, { existsSync, mkdirSync, rmSync } from 'node:fs';

export const CHECKSUMS: Record<'gtfs' | 'osm', string | null> = {
  gtfs: null,
  osm: null,
};

export const DATA_PATH = path.join(process.cwd(), '/data');

export const updateFiles = async (): Promise<void> => {
  const [gtfsZip, osmPbf] = await Promise.all([
    fetchBlob(GTFS_URL),
    fetchBlob(OSM_PBF_URL),
  ]);

  console.log('Finished fetching data');

  CHECKSUMS.gtfs = calcChecksum(gtfsZip);
  CHECKSUMS.osm = calcChecksum(osmPbf);

  console.log(JSON.stringify(CHECKSUMS, null, 2));

  // Intentionally using sync IO here
  // Avoid dealing with edge-cases of file-write being in-progress while a request comes in
  if (existsSync(DATA_PATH)) {
    rmSync(DATA_PATH, {recursive: true});
  }
  mkdirSync(DATA_PATH);
  fs.writeFileSync(path.join(DATA_PATH, 'gtfs.zip'), gtfsZip);
  fs.writeFileSync(path.join(DATA_PATH, 'osm.pbf'), osmPbf);
}


const fetchBlob = async (url: string): Promise<Buffer> => { 
  console.log(`Dowloading from ${url}`);
  const res = await fetch(url);
  if (res.status === 200) {
    const binary = await res.arrayBuffer();
    return Buffer.from(binary);
  } else {
    throw new Error(`Fetch from ${url} failed with status code ${res.status}`);
  }
}

const calcChecksum = (buf: Buffer): string => {
  const hasher = createHash('sha256');
  hasher.update(buf);
  return hasher.digest('hex');
};


import { API_511_KEY_POOL } from '../env.js';
import { REALTIME_PBFS, type RealtimeSourceType } from '../rt-pbfs.js';
import { ApiKeyPool } from './api-key-pool.js';
import { fetchBlob } from './fetch-blob.js';
import logger from './logger.js';

const pbfCache: Map<RealtimeSourceType, Buffer> = new Map();

let pool: ApiKeyPool | null = null;
try {
  pool = new ApiKeyPool(API_511_KEY_POOL);
} catch (e) {
  logger.info('Could not initialize API key pool, gtfs-rt will not be available');
}

let isUpdating = false;
export const updateRealtimePbfs = async (): Promise<void> => {
  if (isUpdating || !pool) {
    return;
  }

  isUpdating = true;
  const newCache: Map<RealtimeSourceType, Buffer>= new Map();

  for (const [pbfName, urlTemplate] of Object.entries(REALTIME_PBFS)){
    const apiKey = pool.getKey();
    const url = urlTemplate.replace('{API_KEY}', apiKey);
    const buff = await fetchBlob(url, (value: string) => logger.info(value));
    newCache.set(pbfName as RealtimeSourceType, buff);
  }

  // Everything is async is done, so now atomically update pbfCache
  // This ensures that no read happens while writes are potentially inflight on the Map
  pbfCache.clear();
  for (const [pbfName, buff] of newCache.entries()){
    pbfCache.set(pbfName, buff);
  }

  isUpdating = false;
};

export const getRealtimePbf = (name: RealtimeSourceType): Buffer | undefined => {
  return pbfCache.get(name);
};

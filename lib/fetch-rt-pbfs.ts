import { API_511_KEY_POOL, GTFS_RT_UPDATE_INTERVAL_MS } from '../env.js';
import { REALTIME_PBFS, type RealtimeSourceType } from '../rt-pbfs.js';
import { ApiKeyPool } from './api-key-pool.js';
import { fetchBlob } from './fetch-blob.js';
import logger from './logger.js';

const pbfCache: Map<RealtimeSourceType, Buffer> = new Map();
let lastUpdateTime: number = -1;

// This MUST stay a singleton instance, this allows multiple calls on `getRtPbfs` to wait on the same update
let updatePromise: Promise<void> | null = null;

let pool: ApiKeyPool | null = null;
try {
  pool = new ApiKeyPool(API_511_KEY_POOL);
} catch (e) {
  logger.info('Could not initialize API key pool, gtfs-rt will not be available');
}

type PbfPromise = Promise<{
  pbfName: RealtimeSourceType,
  buffer: Buffer,
}>;

const fetchPbf = async ( pbfName: RealtimeSourceType,  urlTemplate: string, apiKeyPool: ApiKeyPool ): PbfPromise => {
  const apiKey = apiKeyPool.getKey();
  const url = urlTemplate.replace('{API_KEY}', apiKey);
  const buffer = await fetchBlob(url, (value: string) => logger.info(value));
  return {pbfName, buffer};
};

/**
 * Fetches new-rt pbfs from 511 Endpoints
 * Function automatically early returns if data update isn't needed
 * 
 * This updates the `updatePromise` singleton, and ensures its singleton-ness.
 */
const updateRealtimePbfs = async (): Promise<void> => {
  // Early return if no API keys or when request is already in-flight
  if (!pool) {
    return;
  }

  if (updatePromise != null) {
    logger.info('updateRealtimePbfs early return because a update is already in fight');
    return updatePromise;
  }

  // Check if data needs Update
  const timeDiff = Date.now() - lastUpdateTime;
  const needsUpdate = timeDiff > GTFS_RT_UPDATE_INTERVAL_MS;

  logger.info(`updateRealtimePbfs: needsUpdate: ${needsUpdate}, lastUpdateTime: ${lastUpdateTime}, timeDiff: ${timeDiff}`);

  if (!needsUpdate) {
    return;
  }

  let resolver = () => {};
  let rejecter = (reason?: any) => {};
  updatePromise = new Promise((resolve, reject) => {
    resolver = resolve;
    rejecter = reject;
  });

  try {
    const promises: PbfPromise[] =[];
    for (const [pbfName, urlTemplate] of Object.entries(REALTIME_PBFS)){
      promises.push(fetchPbf(pbfName as RealtimeSourceType, urlTemplate, pool));
    }
    
    const buffers = await Promise.all(promises);
    // Everything is async is done, so now atomically update pbfCache
    // This ensures that no read happens while writes are potentially inflight on the Map
    pbfCache.clear();
    for (const {pbfName, buffer} of buffers){
      pbfCache.set(pbfName, buffer);
    }

    lastUpdateTime = Date.now();
    resolver();
  } catch (e) {
    rejecter(e);
  } 

  const updatePromiseStash = updatePromise;
  // Set the global ref to null do denote that no updates are in flight
  updatePromise = null;
  return updatePromiseStash;
};

export const getRealtimePbf = async (name: RealtimeSourceType): Promise<Buffer | undefined> => {
  await updateRealtimePbfs();

  return pbfCache.get(name);
};

export const resetInternaPbfCacheState = () => {
  lastUpdateTime = -1;
  pbfCache.clear();
  updatePromise = null;
};

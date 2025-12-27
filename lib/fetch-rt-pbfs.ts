import { API_511_KEY_POOL, GTFS_RT_UPDATE_INTERVAL_MS } from '../env.js';
import { REALTIME_PBFS, type RealtimeSourceType } from '../rt-pbfs.js';
import { ApiKeyPool } from './api-key-pool.js';
import { fetchBlob } from './fetch-blob.js';
import logger from './logger.js';
import ControlablePromise from './controlable-promise.js';

const pbfCache: Map<RealtimeSourceType, Buffer> = new Map();
let lastUpdateTime: number = -1;

// Stash an already-resolved promise to start
// This MUST stay a singleton instance, this allows multiple calls on `getRtPbfs` to wait on the same update
let updatePromise: ControlablePromise<void> = (new ControlablePromise<void>()).resolve();

let pool: ApiKeyPool | null = null;
try {
  pool = new ApiKeyPool(API_511_KEY_POOL);
} catch (e) {
  logger.info('Could not initialize API key pool, gtfs-rt will not be available');
}

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

  if (updatePromise.inFlight) {
    logger.info('updateRealtimePbfs early return because a update is already in fight');
    return;
  }

  // Check if data needs Update
  const timeDiff = Math.abs(Date.now() - lastUpdateTime);
  const dataIsStale = timeDiff > GTFS_RT_UPDATE_INTERVAL_MS;

  logger.info(`updateRealtimePbfs: dataIsStale: ${dataIsStale}, lastUpdateTime: ${lastUpdateTime}, timeDiff: ${timeDiff}`);

  const noData = pbfCache.size === 0;
  const prevUpdateFailed = updatePromise.rejected;

  const needsUpdate = dataIsStale || noData || prevUpdateFailed;

  if (!needsUpdate) {
    return;
  }

  console.log('updating!');
  updatePromise = new ControlablePromise<void>();

  try {
    const newCache: Map<RealtimeSourceType, Buffer>= new Map();
    for (const [pbfName, urlTemplate] of Object.entries(REALTIME_PBFS)){
      const apiKey = pool.getKey();
      const url = urlTemplate.replace('{API_KEY}', apiKey);
      console.log(url);
      const buff = await fetchBlob(url, (value: string) => logger.info(value));
      newCache.set(pbfName as RealtimeSourceType, buff);
    }
  
    // Everything is async is done, so now atomically update pbfCache
    // This ensures that no read happens while writes are potentially inflight on the Map
    pbfCache.clear();
    for (const [pbfName, buff] of newCache.entries()){
      pbfCache.set(pbfName, buff);
    }


    updatePromise.resolve();
    lastUpdateTime = Date.now();
  } catch (e) {
    updatePromise.reject(e);
  } 
};

export const getRealtimePbf = async (name: RealtimeSourceType): Promise<Buffer | undefined> => {
  updateRealtimePbfs();
  // ALL requests await on the singleton instance of the updatePromise
  await updatePromise.nativePromise();

  return pbfCache.get(name);
};

export const resetInternaPbfCacheState = () => {
  lastUpdateTime = -1;
  pbfCache.clear();
  updatePromise = (new ControlablePromise<void>()).resolve();
};

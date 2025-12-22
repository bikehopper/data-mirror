import type { RealtimeSourceType } from '../rt-pbfs.js';

const pbfCache: Map<RealtimeSourceType, Buffer> = new Map();

let isUpdating = false;
export const updateRealtimePbfs = async (): Promise<void> => {
  if (isUpdating) {
    return;
  }
};

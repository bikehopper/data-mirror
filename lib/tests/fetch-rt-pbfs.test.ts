import { expect, test, vi, beforeEach, afterEach } from 'vitest';
import { getRealtimePbf, resetInternaPbfCacheState } from '../fetch-rt-pbfs.js';

vi.mock('../../env.js', () => {
  return {
    API_511_KEY_POOL: [ 'foo', 'baz', 'bar', 'test', 'bry' , 'wtf'],
    GTFS_RT_UPDATE_INTERVAL_MS: 300,
    GTFS_RT_VEHICLE_POSITIONS_URL_TEMPLATE: 'https://foo.bar?key={API_KEY}',
    GTFS_RT_TRIP_UPDATES_URL_TEMPLATE: 'https://foo.bar?key={API_KEY}',
    GTFS_RT_SERVICE_ALERTS_URL_TEMPLATE: 'https://foo.bar?key={API_KEY}',
  };
});

// 1. Setup the mock
beforeEach(() => {
  global.fetch = vi.fn(async () => {
    return  new Response();
  });
});

// 2. Clean up after each test
afterEach(() => {
  vi.restoreAllMocks();
  resetInternaPbfCacheState();
})

test('it should update only once for multiple requests', async () => {
  const NUM_CALLS = 100;

  for (let i = 0; i < NUM_CALLS; i++) {
    await getRealtimePbf('service_alerts');
  }

  expect(global.fetch).toHaveBeenCalledTimes(3);
});

test('it should update if data is stale', async () => {
  const NUM_CALLS = 30;
  vi.useFakeTimers();

  for (let i = 0; i < NUM_CALLS; i++) {
    await getRealtimePbf('service_alerts');
  }

  await vi.advanceTimersByTimeAsync(500)
  for (let i = 0; i < NUM_CALLS; i++) {
    await getRealtimePbf('service_alerts');
  }

  expect(global.fetch).toHaveBeenCalledTimes(6);
});
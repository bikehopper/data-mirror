import { GTFS_RT_SERVICE_ALERTS_URL_TEMPLATE, GTFS_RT_TRIP_UPDATES_URL_TEMPLATE, GTFS_RT_VEHICLE_POSITIONS_URL_TEMPLATE } from './env.js';

export type RealtimeSourceType = 'vehicle_positions' | 'service_alerts' | 'trip_updates';

export const REALTIME_PBFS: Record<RealtimeSourceType, string> = {
  vehicle_positions: GTFS_RT_VEHICLE_POSITIONS_URL_TEMPLATE,
  service_alerts: GTFS_RT_SERVICE_ALERTS_URL_TEMPLATE,
  trip_updates: GTFS_RT_TRIP_UPDATES_URL_TEMPLATE,
};

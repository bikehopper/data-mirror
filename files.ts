import { ELEVATION_URL, ELEVATORS_CSV_URL, GTFS_URL, OSM_PBF_URL, REGION_CONFIG_URL } from './env.js';

export type SourceDataFileType = 'gtfs' | 'osm' | 'region_config' | 'elevators' | 'elevation';
export type SourceDataFileInfo = { name: string, source: string};

export const FILES: Record<SourceDataFileType, SourceDataFileInfo> = {
  gtfs: {name : 'gtfs.zip', source: GTFS_URL},
  osm: {name : 'osm.pbf', source: OSM_PBF_URL},
  region_config: {name : 'region-config.json', source: REGION_CONFIG_URL},
  elevators: {name : 'elevators.csv', source: ELEVATORS_CSV_URL},
  elevation: {name: 'elevation.tgz', source: ELEVATION_URL},
};
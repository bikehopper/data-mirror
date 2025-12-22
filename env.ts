export const PORT: number = parseInt(process.env.PORT || '3002');

export const GTFS_URL: string = process.env.GTFS_URL || 
  `http://api.511.org/transit/datafeeds?api_key=${process.env.API_511_KEY}&operator_id=RG`;
export const OSM_PBF_URL: string = process.env.OSM_PBF_URL || 
  'https://download.geofabrik.de/north-america/us/california/norcal-latest.osm.pbf';
export const REGION_CONFIG_URL: string = process.env.REGION_CONFIG_URL ||
  'https://raw.githubusercontent.com/bikehopper/manual-datafiles/refs/heads/main/region-config.json';
export const ELEVATORS_CSV_URL: string = process.env.ELEVATORS_CSV_URL || 
  'https://raw.githubusercontent.com/bikehopper/manual-datafiles/refs/heads/main/elevators.csv';
export const ELEVATION_URL: string = process.env.ELEVATION_URL ||
  'https://github.com/bikehopper/manual-datafiles/raw/refs/heads/main/elevation.tgz';

export const API_511_KEY_POOL = process.env.API_511_KEY_POOL?.split(',').map((key) => key.trim());

// Using template-strings here so that we can replace {API_KEY} with a different ket from API_511_KEY_POOL
export const GTFS_RT_TRIP_UPDATES_URL_TEMPLATE = 'http://api.511.org/transit/tripupdates?api_key={API_KEY}&agency=RG';
export const GTFS_RT_VEHICLE_POSITIONS_URL_TEMPLATE = 'http://api.511.org/transit/vehiclepositions?api_key={API_KEY}&agency=RG';
export const GTFS_RT_SERVICE_ALERTS_URL_TEMPLATE = 'http://api.511.org/transit/servicealerts?api_key={API_KEY}&agency=RG';

export const REFRESH_KEY: string = process.env.REFRESH_KEY || '';
export const PORT: number = parseInt(process.env.PORT || '3002');

export const GTFS_URL: string = process.env.GTFS_URL || 
  `http://api.511.org/transit/datafeeds?api_key=${process.env.API_511_KEY}&operator_id=RG`;
export const OSM_PBF_URL: string = process.env.OSM_PBF_URL || 
  'https://download.geofabrik.de/north-america/us/california/norcal-latest.osm.pbf';
export const REFRESH_KEY: string = process.env.REFRESH_KEY || '';
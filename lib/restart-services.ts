import { REFRESH_KEY } from '../env.js';
import logger from './logger.js';

export const restartServices = async (): Promise<void> => {
  if (REFRESH_KEY) {
    const res = await fetch(
      'https://coolify.bikehopper.org/api/v1/deploy?tag=nightly-data-refresh&force=true', 
      {
        headers: {
          Authorization: `Bearer ${REFRESH_KEY}`,
        },
      }
    );

    if (res.status !== 200) {
      logger.error('Nightly Data refresh failed');
    }

    const json = await res.json();
    logger.info(JSON.stringify(json, null, 2));
  }
};

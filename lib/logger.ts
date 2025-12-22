import pino from 'pino';

const debugMode = process.env.NODE_ENV !== 'production';
const options: pino.LoggerOptions<never, boolean> = {
  level: process.env.LOG_LEVEL || 'info',
};

if (debugMode) {
  options.transport =  {
    target: 'pino-pretty',
    options: {
      all: true,
      translateTime: true,
    },
  };
} 

const logger = pino(options);

export default logger;
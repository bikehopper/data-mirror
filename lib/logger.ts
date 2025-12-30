import pino from 'pino';

const options: pino.LoggerOptions<never, boolean> = {
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
  }
};

const logger = pino(options);

export default logger;
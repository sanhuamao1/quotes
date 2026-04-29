import winston from 'winston';
import { config } from '../config';

const logger = winston.createLogger({
  level: config.env === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    config.env === 'production'
      ? winston.format.json()
      : winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
          const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
          const stackStr = stack ? `\n${stack}` : '';
          return `${timestamp} [${level.toUpperCase()}] ${message}${metaStr}${stackStr}`;
        }),
  ),
  transports: [new winston.transports.Console()],
});

export { logger };

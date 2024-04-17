import winston from 'winston';

const loggerConfig = {
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(
      (info) =>
        `[${info.timestamp}] - ${info.level.toUpperCase()}: ${info.message}`,
    ),
  ),
  transports: [new winston.transports.Console()],
};

export const Logger = winston.createLogger(loggerConfig);

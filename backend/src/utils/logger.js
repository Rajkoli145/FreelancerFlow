const winston = require('winston');
require('winston-daily-rotate-file');
const path = require('path');
const config = require('../config/config');

// Define log format
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

// Console format for development
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        let msg = `${timestamp} [${level}]: ${message}`;
        if (Object.keys(meta).length > 0) {
            msg += ` ${JSON.stringify(meta)}`;
        }
        return msg;
    })
);

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');

// File transport for errors
const errorFileTransport = new winston.transports.DailyRotateFile({
    filename: path.join(logsDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    maxSize: '20m',
    maxFiles: '14d',
    format: logFormat,
});

// File transport for all logs
const combinedFileTransport = new winston.transports.DailyRotateFile({
    filename: path.join(logsDir, 'combined-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d',
    format: logFormat,
});

// Create logger
const logger = winston.createLogger({
    level: config.logLevel,
    format: logFormat,
    transports: [
        errorFileTransport,
        combinedFileTransport,
    ],
    exceptionHandlers: [
        new winston.transports.DailyRotateFile({
            filename: path.join(logsDir, 'exceptions-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxSize: '20m',
            maxFiles: '14d',
        }),
    ],
    rejectionHandlers: [
        new winston.transports.DailyRotateFile({
            filename: path.join(logsDir, 'rejections-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxSize: '20m',
            maxFiles: '14d',
        }),
    ],
});

// Add console transport in development
if (config.nodeEnv !== 'production') {
    logger.add(new winston.transports.Console({
        format: consoleFormat,
    }));
}

// Create a stream object for Morgan
logger.stream = {
    write: (message) => {
        logger.info(message.trim());
    },
};

module.exports = logger;

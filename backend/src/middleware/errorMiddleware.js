const logger = require('../utils/logger');

const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  res.status(statusCode);

  logger.error(`${err.message} - ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  if (err.stack) {
    logger.error(err.stack);
  }

  res.json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = {
  catchAsync,
  notFound,
  errorHandler,
};

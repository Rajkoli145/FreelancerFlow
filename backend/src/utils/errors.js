class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message || 'Validation failed', 400);
  }
}

class AuthenticationError extends AppError {
  constructor(message) {
    super(message || 'Authentication failed', 401);
  }
}

class ConflictError extends AppError {
  constructor(message) {
    super(message || 'Conflict occurred', 409);
  }
}

class NotFoundError extends AppError {
  constructor(message) {
    super(message || 'Resource not found', 404);
  }
}

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  ConflictError,
  NotFoundError
};

const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { jwtSecret } = require('../config/config');
const { AuthenticationError } = require('../utils/errors');
const { catchAsync } = require('./errorMiddleware');

const protect = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    throw new AuthenticationError('No token provided');
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = await User.findById(decoded.id).select('-passwordHash');
    if (!req.user) {
      throw new AuthenticationError('Not authorized, user not found');
    }
    next();
  } catch (error) {
    throw new AuthenticationError('Token is not valid');
  }
});

module.exports = { protect };

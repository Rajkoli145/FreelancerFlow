const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { jwtSecret, jwtExpire } = require('../config/config');
const { catchAsync } = require('../middleware/errorMiddleware');
const { AuthenticationError } = require('../utils/errors');

/**
 * Single endpoint to handle Firebase OAuth tokens (Google, GitHub, etc.)
 */
const firebaseAuth = catchAsync(async (req, res, next) => {
  const { token: idToken } = req.body;

  if (!idToken) {
    throw new AuthenticationError('Firebase ID Token is required');
  }

  try {
    // Verify the token with Firebase
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture, firebase } = decodedToken;
    const provider = firebase?.sign_in_provider || 'google.com';

    // Map firebase provider to our authProvider enum
    let authProvider = 'google';
    if (provider.includes('github')) authProvider = 'github';

    // Find or create user
    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      user = await User.create({
        fullName: name || email.split('@')[0],
        email: email.toLowerCase(),
        firebaseUid: uid,
        authProvider,
        profilePhoto: picture,
        defaultHourlyRate: 0,
        passwordHash: undefined // Explicitly no password for OAuth users
      });
    } else {
      // Update existing user with firebase info if not already present
      if (!user.firebaseUid) {
        user.firebaseUid = uid;
        user.authProvider = authProvider;
        if (picture) user.profilePhoto = picture;
        await user.save();
      }
    }

    // Generate our own JWT for the user
    const appToken = jwt.sign({ id: user._id }, jwtSecret, {
      expiresIn: jwtExpire,
    });

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          profilePhoto: user.profilePhoto,
          role: user.role,
          authProvider: user.authProvider
        },
        token: appToken,
      },
    });
  } catch (error) {
    console.error('Firebase Auth Error:', error);
    throw new AuthenticationError('Authentication failed: ' + error.message);
  }
});

module.exports = { firebaseAuth };

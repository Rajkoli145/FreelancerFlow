const admin = require('firebase-admin');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

// Initialize Firebase Admin (you'll need to set this up)
// This will be initialized in the main server file

exports.firebaseAuth = async (req, res) => {
  try {
    const { idToken, provider, fullName, email, photoURL } = req.body;

    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const firebaseUid = decodedToken.uid;

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user
      user = new User({
        fullName,
        email,
        firebaseUid,
        authProvider: provider,
        profilePhoto: photoURL,
        password: Math.random().toString(36).slice(-10) // Random password for OAuth users
      });
      await user.save();
    } else {
      // Update existing user with Firebase UID if not already set
      if (!user.firebaseUid) {
        user.firebaseUid = firebaseUid;
        user.authProvider = provider;
        if (photoURL && !user.profilePhoto) {
          user.profilePhoto = photoURL;
        }
        await user.save();
      }
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        id: user._id,
        email: user.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        currency: user.currency,
        defaultHourlyRate: user.defaultHourlyRate,
        profilePhoto: user.profilePhoto
      }
    });
  } catch (error) {
    console.error('Firebase auth error:', error);
    res.status(401).json({
      success: false,
      error: 'Authentication failed',
      message: error.message
    });
  }
};

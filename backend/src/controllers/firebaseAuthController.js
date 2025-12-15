const admin = require('firebase-admin');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize Firebase Admin (you'll need to set this up)
// This will be initialized in the main server file

exports.firebaseAuth = async (req, res) => {
  try {
    // Get Firebase ID token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }
    const idToken = authHeader.split(' ')[1];

    // Verify the Firebase ID token
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
      console.log('✅ Token verified, Firebase UID:', decodedToken.uid);
    } catch (verifyError) {
      console.error('❌ Token verification failed:', verifyError.message);
      return res.status(401).json({
        success: false,
        error: 'Invalid Firebase token',
        message: verifyError.message
      });
    }

    // Extract user info from decoded token
    const firebaseUid = decodedToken.uid;
    const email = decodedToken.email;
    const fullName = decodedToken.name || email?.split('@')[0];
    const photoURL = decodedToken.picture;
    const provider = decodedToken.firebase?.sign_in_provider || 'google';

    console.log('🔥 Firebase auth request received:', { provider, email });

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      console.log('Creating new user:', email);
      
      // Generate a random password hash for OAuth users
      const randomPassword = Math.random().toString(36).slice(-10);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      
      // Create new user
      user = new User({
        fullName,
        email,
        passwordHash: hashedPassword,
        firebaseUid,
        authProvider: provider,
        profilePhoto: photoURL,
      });
      await user.save();
      console.log('✅ New user created:', user._id);
    } else {
      console.log('Existing user found:', user._id);
      
      // Update existing user with Firebase UID if not already set
      if (!user.firebaseUid) {
        user.firebaseUid = firebaseUid;
        user.authProvider = provider;
        if (photoURL && !user.profilePhoto) {
          user.profilePhoto = photoURL;
        }
        await user.save();
        console.log('✅ User updated with Firebase UID');
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

    console.log('✅ JWT token created for user:', user.email);

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
    console.error('❌ Firebase auth error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed',
      message: error.message
    });
  }
};

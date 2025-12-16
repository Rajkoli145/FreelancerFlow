const admin = require('firebase-admin');
const User = require('../models/user');
const { generateToken } = require('../utils/generateToken');

exports.firebaseAuth = async (req, res) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: Missing or invalid token' });
  }

  const idToken = authorization.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        firebaseUID: uid,
        email,
        fullName: name,
        profilePhoto: picture,
        // Set a default hourly rate or other fields as needed
        defaultHourlyRate: 0,
      });
      await user.save();
    }

    const token = generateToken(user._id);

    res.status(200).json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePhoto: user.profilePhoto,
      },
    });
  } catch (error) {
    console.error('Token verification failed:', error);
    res.status(401).json({ message: 'Unauthorized: Token verification failed' });
  }
};

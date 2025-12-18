const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/freelancerflow',
  jwtSecret: process.env.JWT_SECRET || 'UkULktrt9CPNJHslJCD+TGmtrEbtInKYXCjUH+FckE5Y5MMKORik/8aNQxGiGTx3mcqq4dGCt1n2op4R4d6aGw==',
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  frontendUrl: process.env.FRONTEND_URL || 'https://freelancer-flow-seven.vercel.app',
};

console.log("CONFIG PORT:", module.exports.port);
console.log("CONFIG MONGO:", module.exports.mongoUri);

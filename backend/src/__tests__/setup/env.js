/**
 * Jest global setup — loads .env.test before any test file is run.
 * This ensures MONGO_URI and JWT_SECRET pass config validation
 * even though the actual DB connection is replaced by mongodb-memory-server.
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env.test') });

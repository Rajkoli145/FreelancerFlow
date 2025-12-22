const admin = require('firebase-admin');
const config = require('./config');
const logger = require('../utils/logger');

const initializeFirebase = () => {
    try {
        if (!config.firebaseProjectId || !config.firebaseClientEmail || !config.firebasePrivateKey) {
            logger.warn('Firebase configuration is incomplete. Social auth may not work.');
            return;
        }

        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: config.firebaseProjectId,
                clientEmail: config.firebaseClientEmail,
                privateKey: config.firebasePrivateKey,
            }),
        });

        logger.info('✅ Firebase Admin initialized successfully');
    } catch (error) {
        logger.error('❌ Firebase Admin initialization failed:', error.message);
    }
};

module.exports = { initializeFirebase, admin };

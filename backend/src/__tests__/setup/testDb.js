const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

/**
 * Connect to in-memory database for testing
 */
const connect = async () => {
    console.log('Test DB: Starting MongoMemoryServer...');
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    console.log('Test DB: MongoMemoryServer started at', uri);

    console.log('Test DB: Connecting mongoose...');
    await mongoose.connect(uri);
    console.log('Test DB: Mongoose connected');
};

/**
 * Drop database, close connection, and stop mongod
 */
const closeDatabase = async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
};

/**
 * Remove all data from collections
 */
const clearDatabase = async () => {
    const collections = mongoose.connection.collections;

    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany();
    }
};

module.exports = {
    connect,
    closeDatabase,
    clearDatabase,
};

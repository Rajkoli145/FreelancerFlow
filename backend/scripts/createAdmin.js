const mongoose = require('mongoose');
const User = require('../src/models/user');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB...');

        const adminEmail = 'admin@freelancerflow.com';
        const existing = await User.findOne({ email: adminEmail });

        if (existing) {
            console.log('Admin user already exists. Updating role to admin...');
            existing.role = 'admin';
            await existing.save();
            console.log('User updated to Admin successfully!');
        } else {
            console.log('Creating new Admin user...');
            const bcrypt = require('bcryptjs');
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash('Admin123!', salt);

            await User.create({
                fullName: 'Platform Admin',
                email: adminEmail,
                passwordHash,
                role: 'admin'
            });
            console.log('Admin user created successfully!');
            console.log('Email: admin@freelancerflow.com');
            console.log('Password: Admin123!');
        }

        mongoose.connection.close();
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

createAdmin();

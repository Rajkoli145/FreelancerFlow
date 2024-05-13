const request = require('supertest');
const app = require('../index');
const User = require('../models/user');
const { connect, closeDatabase, clearDatabase } = require('./setup/testDb');

// Setup and teardown
beforeAll(async () => await connect());
afterEach(async () => await clearDatabase());
afterAll(async () => await closeDatabase());

jest.setTimeout(30000);

describe('Auth API Tests', () => {
    describe('POST /api/auth/signup', () => {
        it('should create a new user with valid data', async () => {
            const userData = {
                fullName: 'John Doe',
                email: 'john@example.com',
                password: 'password123',
                defaultHourlyRate: 50,
                currency: 'USD',
            };

            const res = await request(app)
                .post('/api/auth/signup')
                .send(userData)
                .expect(201);

            expect(res.body.success).toBe(true);
            expect(res.body.data.user).toHaveProperty('id');
            expect(res.body.data.user.email).toBe(userData.email.toLowerCase());
            expect(res.body.data.user.fullName).toBe(userData.fullName);
            expect(res.body.data).toHaveProperty('token');

            // Verify user was created in database
            const user = await User.findOne({ email: userData.email });
            expect(user).toBeTruthy();
            expect(user.fullName).toBe(userData.fullName);
        });

        it('should reject signup with missing required fields', async () => {
            const res = await request(app)
                .post('/api/auth/signup')
                .send({
                    email: 'test@example.com',
                    // Missing fullName and password
                })
                .expect(400);

            expect(res.body.success).toBe(false);
            expect(res.body.message).toBeDefined();
        });

        it('should reject signup with invalid email', async () => {
            const res = await request(app)
                .post('/api/auth/signup')
                .send({
                    fullName: 'John Doe',
                    email: 'invalid-email',
                    password: 'password123',
                })
                .expect(400);

            expect(res.body.success).toBe(false);
        });

        it('should reject signup with short password', async () => {
            const res = await request(app)
                .post('/api/auth/signup')
                .send({
                    fullName: 'John Doe',
                    email: 'john@example.com',
                    password: '123', // Too short
                })
                .expect(400);

            expect(res.body.success).toBe(false);
        });

        it('should reject duplicate email registration', async () => {
            const userData = {
                fullName: 'John Doe',
                email: 'john@example.com',
                password: 'password123',
            };

            // First signup
            await request(app)
                .post('/api/auth/signup')
                .send(userData)
                .expect(201);

            // Duplicate signup
            const res = await request(app)
                .post('/api/auth/signup')
                .send(userData)
                .expect(409);

            expect(res.body.success).toBe(false);
            expect(res.body.message || res.body.error).toContain('already registered');
        });
    });

    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            // Create a test user
            await request(app)
                .post('/api/auth/signup')
                .send({
                    fullName: 'Test User',
                    email: 'test@example.com',
                    password: 'password123',
                });
        });

        it('should login with valid credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'password123',
                })
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(res.body.data.user).toHaveProperty('id');
            expect(res.body.data.user.email).toBe('test@example.com');
            expect(res.body.data).toHaveProperty('token');
        });

        it('should reject login with wrong password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'wrongpassword',
                })
                .expect(401);

            expect(res.body.success).toBe(false);
            expect(res.body.message || res.body.error).toContain('Invalid credentials');
        });

        it('should reject login with non-existent email', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'password123',
                })
                .expect(401);

            expect(res.body.success).toBe(false);
            expect(res.body.message || res.body.error).toContain('Invalid credentials');
        });

        it('should reject login with missing credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    // Missing password
                })
                .expect(400);

            expect(res.body.success).toBe(false);
        });
    });

    describe('GET /api/auth/me', () => {
        let authToken;

        beforeEach(async () => {
            // Create and login a user
            const signupRes = await request(app)
                .post('/api/auth/signup')
                .send({
                    fullName: 'Test User',
                    email: 'test@example.com',
                    password: 'password123',
                });

            authToken = signupRes.body.data.token;
        });

        it('should return current user with valid token', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('email', 'test@example.com');
            expect(res.body.data).toHaveProperty('fullName', 'Test User');
        });

        it('should reject request without token', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .expect(401);

            expect(res.body.message).toContain('No token provided');
        });

        it('should reject request with invalid token', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', 'Bearer invalid-token')
                .expect(401);

            expect(res.body.message).toContain('not valid');
        });
    });

    describe('PUT /api/auth/profile', () => {
        let authToken;

        beforeEach(async () => {
            const signupRes = await request(app)
                .post('/api/auth/signup')
                .send({
                    fullName: 'Test User',
                    email: 'test@example.com',
                    password: 'password123',
                });

            authToken = signupRes.body.data.token;
        });

        it('should update user profile', async () => {
            const res = await request(app)
                .put('/api/auth/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    fullName: 'Updated Name',
                    defaultHourlyRate: 75,
                })
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(res.body.data.fullName).toBe('Updated Name');
            expect(res.body.data.defaultHourlyRate).toBe(75);
        });

        it('should reject profile update without authentication', async () => {
            const res = await request(app)
                .put('/api/auth/profile')
                .send({
                    fullName: 'Updated Name',
                })
                .expect(401);

            expect(res.body.message).toContain('No token provided');
        });
    });

    describe('PUT /api/auth/password', () => {
        let authToken;

        beforeEach(async () => {
            const signupRes = await request(app)
                .post('/api/auth/signup')
                .send({
                    fullName: 'Test User',
                    email: 'test@example.com',
                    password: 'password123',
                });

            authToken = signupRes.body.data.token;
        });

        it('should update password with correct current password', async () => {
            const res = await request(app)
                .put('/api/auth/password')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    currentPassword: 'password123',
                    newPassword: 'newpassword123',
                })
                .expect(200);

            expect(res.body.success).toBe(true);
            expect(res.body.message).toContain('Password updated');

            // Verify can login with new password
            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'newpassword123',
                })
                .expect(200);

            expect(loginRes.body.success).toBe(true);
        });

        it('should reject password update with wrong current password', async () => {
            const res = await request(app)
                .put('/api/auth/password')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    currentPassword: 'wrongpassword',
                    newPassword: 'newpassword123',
                })
                .expect(401);

            expect(res.body.success).toBe(false);
            expect(res.body.message || res.body.error).toContain('incorrect');
        });

        it('should reject password update with short new password', async () => {
            const res = await request(app)
                .put('/api/auth/password')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    currentPassword: 'password123',
                    newPassword: '123', // Too short
                })
                .expect(400);

            expect(res.body.success).toBe(false);
        });
    });
});

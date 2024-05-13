const request = require('supertest');
const app = require('../index');
const Client = require('../models/Client');
const { connect, closeDatabase, clearDatabase } = require('./setup/testDb');

beforeAll(async () => await connect());
afterEach(async () => await clearDatabase());
afterAll(async () => await closeDatabase());

jest.setTimeout(30000);

// Helper: register a user and return their auth token
const registerUser = async (suffix = '') => {
    const res = await request(app)
        .post('/api/auth/signup')
        .send({
            fullName: `Test User${suffix}`,
            email: `testuser${suffix}@example.com`,
            password: 'password123',
        });
    return res.body.data.token;
};

// Helper: create a client via the API
const createClient = async (token, overrides = {}) => {
    const payload = {
        name: 'Acme Corp',
        email: 'acme@example.com',
        phone: '555-1234',
        company: 'Acme',
        ...overrides,
    };
    return request(app)
        .post('/api/client')
        .set('Authorization', `Bearer ${token}`)
        .send(payload);
};

describe('Client API', () => {
    describe('POST /api/client', () => {
        it('creates a client with valid data', async () => {
            const token = await registerUser();
            const res = await createClient(token);

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toMatchObject({
                name: 'Acme Corp',
                email: 'acme@example.com',
            });
            expect(res.body.data).toHaveProperty('_id');
        });

        it('returns 401 without a token', async () => {
            const res = await request(app)
                .post('/api/client')
                .send({ name: 'No Auth', email: 'noauth@example.com' });

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });

        it('returns 400 when name is missing', async () => {
            const token = await registerUser();
            const res = await request(app)
                .post('/api/client')
                .set('Authorization', `Bearer ${token}`)
                .send({ email: 'noname@example.com' });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('returns 400 when email is missing', async () => {
            const token = await registerUser();
            const res = await request(app)
                .post('/api/client')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'No Email Client' });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('returns 400 when email format is invalid', async () => {
            const token = await registerUser();
            const res = await request(app)
                .post('/api/client')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Bad Email', email: 'not-an-email' });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });

    describe('GET /api/client', () => {
        it('returns all clients for the authenticated user', async () => {
            const token = await registerUser();
            await createClient(token, { name: 'Client A', email: 'a@example.com' });
            await createClient(token, { name: 'Client B', email: 'b@example.com' });

            const res = await request(app)
                .get('/api/client')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveLength(2);
        });

        it('returns an empty array when user has no clients', async () => {
            const token = await registerUser();
            const res = await request(app)
                .get('/api/client')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.data).toHaveLength(0);
        });

        it('returns 401 without a token', async () => {
            const res = await request(app).get('/api/client');
            expect(res.status).toBe(401);
        });

        it('does not return clients belonging to another user', async () => {
            const tokenA = await registerUser('_a');
            const tokenB = await registerUser('_b');

            await createClient(tokenA, { name: 'User A Client', email: 'ua@example.com' });

            const res = await request(app)
                .get('/api/client')
                .set('Authorization', `Bearer ${tokenB}`);

            expect(res.status).toBe(200);
            expect(res.body.data).toHaveLength(0);
        });
    });

    describe('GET /api/client/:id', () => {
        it('returns a single client by ID', async () => {
            const token = await registerUser();
            const createRes = await createClient(token);
            const clientId = createRes.body.data._id;

            const res = await request(app)
                .get(`/api/client/${clientId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.data._id).toBe(clientId);
            expect(res.body.data.name).toBe('Acme Corp');
        });

        it('returns 404 for a non-existent client ID', async () => {
            const token = await registerUser();
            const fakeId = '64a1b2c3d4e5f6a7b8c9d0e1';

            const res = await request(app)
                .get(`/api/client/${fakeId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
        });

        it('returns 404 when accessing another user\'s client', async () => {
            const tokenA = await registerUser('_a');
            const tokenB = await registerUser('_b');
            const createRes = await createClient(tokenA);
            const clientId = createRes.body.data._id;

            const res = await request(app)
                .get(`/api/client/${clientId}`)
                .set('Authorization', `Bearer ${tokenB}`);

            expect(res.status).toBe(404);
        });
    });

    describe('PUT /api/client/:id', () => {
        it('updates a client with valid data', async () => {
            const token = await registerUser();
            const createRes = await createClient(token);
            const clientId = createRes.body.data._id;

            const res = await request(app)
                .put(`/api/client/${clientId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Updated Corp', phone: '999-0000' });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.name).toBe('Updated Corp');
            expect(res.body.data.phone).toBe('999-0000');
        });

        it('returns 404 when updating a non-existent client', async () => {
            const token = await registerUser();
            const fakeId = '64a1b2c3d4e5f6a7b8c9d0e1';

            const res = await request(app)
                .put(`/api/client/${fakeId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Ghost' });

            expect(res.status).toBe(404);
        });

        it('returns 400 for invalid email format on update', async () => {
            const token = await registerUser();
            const createRes = await createClient(token);
            const clientId = createRes.body.data._id;

            const res = await request(app)
                .put(`/api/client/${clientId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ email: 'bad-email' });

            expect(res.status).toBe(400);
        });

        it('returns 401 without a token', async () => {
            const fakeId = '64a1b2c3d4e5f6a7b8c9d0e1';
            const res = await request(app)
                .put(`/api/client/${fakeId}`)
                .send({ name: 'No Auth' });

            expect(res.status).toBe(401);
        });
    });

    describe('DELETE /api/client/:id', () => {
        it('deletes a client owned by the user', async () => {
            const token = await registerUser();
            const createRes = await createClient(token);
            const clientId = createRes.body.data._id;

            const res = await request(app)
                .delete(`/api/client/${clientId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            // Verify it's actually gone
            const verify = await Client.findById(clientId);
            expect(verify).toBeNull();
        });

        it('returns 404 when deleting another user\'s client', async () => {
            const tokenA = await registerUser('_a');
            const tokenB = await registerUser('_b');
            const createRes = await createClient(tokenA);
            const clientId = createRes.body.data._id;

            const res = await request(app)
                .delete(`/api/client/${clientId}`)
                .set('Authorization', `Bearer ${tokenB}`);

            expect(res.status).toBe(404);

            // Verify it still exists for user A
            const verify = await Client.findById(clientId);
            expect(verify).not.toBeNull();
        });

        it('returns 401 without a token', async () => {
            const fakeId = '64a1b2c3d4e5f6a7b8c9d0e1';
            const res = await request(app).delete(`/api/client/${fakeId}`);
            expect(res.status).toBe(401);
        });
    });
});

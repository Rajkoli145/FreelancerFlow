const request = require('supertest');
const app = require('../index');
const { connect, closeDatabase, clearDatabase } = require('./setup/testDb');

beforeAll(async () => await connect());
afterEach(async () => await clearDatabase());
afterAll(async () => await closeDatabase());

jest.setTimeout(30000);

// Helper: register a user and return token + userId
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

// Helper: create a client and return its ID
const createClient = async (token) => {
    const res = await request(app)
        .post('/api/client')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Test Client', email: 'client@example.com' });
    return res.body.data._id;
};

// Helper: create a project
const createProject = async (token, clientId, overrides = {}) => {
    const payload = {
        clientId,
        title: 'Test Project',
        billingType: 'Hourly',
        hourlyRate: 75,
        ...overrides,
    };
    return request(app)
        .post('/api/project')
        .set('Authorization', `Bearer ${token}`)
        .send(payload);
};

describe('Project API', () => {
    describe('POST /api/project', () => {
        it('creates an hourly project with valid data', async () => {
            const token = await registerUser();
            const clientId = await createClient(token);
            const res = await createProject(token, clientId);

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toMatchObject({
                title: 'Test Project',
                billingType: 'Hourly',
                hourlyRate: 75,
            });
            expect(res.body.data).toHaveProperty('_id');
        });

        it('creates a fixed-price project', async () => {
            const token = await registerUser();
            const clientId = await createClient(token);
            const res = await createProject(token, clientId, {
                billingType: 'Fixed',
                fixedPrice: 5000,
                hourlyRate: undefined,
            });

            expect(res.status).toBe(201);
            expect(res.body.data.billingType).toBe('Fixed');
            expect(res.body.data.fixedPrice).toBe(5000);
        });

        it('returns 400 when clientId is missing', async () => {
            const token = await registerUser();
            const res = await request(app)
                .post('/api/project')
                .set('Authorization', `Bearer ${token}`)
                .send({ title: 'No Client', billingType: 'Hourly', hourlyRate: 50 });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('returns 400 when title is missing', async () => {
            const token = await registerUser();
            const clientId = await createClient(token);
            const res = await request(app)
                .post('/api/project')
                .set('Authorization', `Bearer ${token}`)
                .send({ clientId, billingType: 'Hourly', hourlyRate: 50 });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('returns 400 for invalid billingType', async () => {
            const token = await registerUser();
            const clientId = await createClient(token);
            const res = await request(app)
                .post('/api/project')
                .set('Authorization', `Bearer ${token}`)
                .send({ clientId, title: 'Bad Billing', billingType: 'WeeklyRetainer', hourlyRate: 50 });

            expect(res.status).toBe(400);
        });

        it('returns 400 when hourly project is missing hourlyRate', async () => {
            const token = await registerUser();
            const clientId = await createClient(token);
            const res = await request(app)
                .post('/api/project')
                .set('Authorization', `Bearer ${token}`)
                .send({ clientId, title: 'No Rate', billingType: 'Hourly' });

            expect(res.status).toBe(400);
        });

        it('returns 401 without a token', async () => {
            const res = await request(app)
                .post('/api/project')
                .send({ title: 'No Auth', billingType: 'Fixed', fixedPrice: 100 });

            expect(res.status).toBe(401);
        });
    });

    describe('GET /api/project', () => {
        it('returns all projects for the authenticated user', async () => {
            const token = await registerUser();
            const clientId = await createClient(token);
            await createProject(token, clientId, { title: 'Project A' });
            await createProject(token, clientId, { title: 'Project B' });

            const res = await request(app)
                .get('/api/project')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data).toHaveLength(2);
        });

        it('does not return projects belonging to another user', async () => {
            const tokenA = await registerUser('_a');
            const tokenB = await registerUser('_b');
            const clientId = await createClient(tokenA);
            await createProject(tokenA, clientId);

            const res = await request(app)
                .get('/api/project')
                .set('Authorization', `Bearer ${tokenB}`);

            expect(res.status).toBe(200);
            expect(res.body.data).toHaveLength(0);
        });

        it('returns 401 without a token', async () => {
            const res = await request(app).get('/api/project');
            expect(res.status).toBe(401);
        });
    });

    describe('GET /api/project/:id', () => {
        it('returns a single project by ID', async () => {
            const token = await registerUser();
            const clientId = await createClient(token);
            const createRes = await createProject(token, clientId, { title: 'Specific Project' });
            const projectId = createRes.body.data._id;

            const res = await request(app)
                .get(`/api/project/${projectId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.data.title).toBe('Specific Project');
        });

        it('returns 404 for a non-existent project', async () => {
            const token = await registerUser();
            const fakeId = '64a1b2c3d4e5f6a7b8c9d0e1';

            const res = await request(app)
                .get(`/api/project/${fakeId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(404);
        });

        it('returns 404 when accessing another user\'s project', async () => {
            const tokenA = await registerUser('_a');
            const tokenB = await registerUser('_b');
            const clientId = await createClient(tokenA);
            const createRes = await createProject(tokenA, clientId);
            const projectId = createRes.body.data._id;

            const res = await request(app)
                .get(`/api/project/${projectId}`)
                .set('Authorization', `Bearer ${tokenB}`);

            expect(res.status).toBe(404);
        });
    });

    describe('PUT /api/project/:id', () => {
        it('updates project title and status', async () => {
            const token = await registerUser();
            const clientId = await createClient(token);
            const createRes = await createProject(token, clientId);
            const projectId = createRes.body.data._id;

            const res = await request(app)
                .put(`/api/project/${projectId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ title: 'Renamed Project', status: 'completed' });

            expect(res.status).toBe(200);
            expect(res.body.data.title).toBe('Renamed Project');
            expect(res.body.data.status).toBe('completed');
        });

        it('returns 404 when updating a non-existent project', async () => {
            const token = await registerUser();
            const fakeId = '64a1b2c3d4e5f6a7b8c9d0e1';

            const res = await request(app)
                .put(`/api/project/${fakeId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ title: 'Ghost' });

            expect(res.status).toBe(404);
        });
    });

    describe('DELETE /api/project/:id', () => {
        it('deletes a project owned by the user', async () => {
            const token = await registerUser();
            const clientId = await createClient(token);
            const createRes = await createProject(token, clientId);
            const projectId = createRes.body.data._id;

            const res = await request(app)
                .delete(`/api/project/${projectId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('returns 404 when deleting another user\'s project', async () => {
            const tokenA = await registerUser('_a');
            const tokenB = await registerUser('_b');
            const clientId = await createClient(tokenA);
            const createRes = await createProject(tokenA, clientId);
            const projectId = createRes.body.data._id;

            const res = await request(app)
                .delete(`/api/project/${projectId}`)
                .set('Authorization', `Bearer ${tokenB}`);

            expect(res.status).toBe(404);
        });
    });
});

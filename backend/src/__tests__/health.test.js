const request = require('supertest');
const app = require('../index');
const { connect, closeDatabase } = require('./setup/testDb');

beforeAll(async () => await connect());
afterAll(async () => await closeDatabase());

jest.setTimeout(15000);

describe('Health Endpoints', () => {
    describe('GET /health', () => {
        it('returns 200 with healthy status', async () => {
            const res = await request(app).get('/health');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.status).toBe('healthy');
            expect(res.body).toHaveProperty('timestamp');
            expect(res.body).toHaveProperty('uptime');
        });
    });

    describe('GET /api/health', () => {
        it('returns 200 with healthy status', async () => {
            const res = await request(app).get('/api/health');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.status).toBe('healthy');
            expect(res.body).toHaveProperty('timestamp');
        });
    });

    describe('404 handler', () => {
        it('returns 404 for unknown routes', async () => {
            const res = await request(app).get('/api/this-route-does-not-exist');

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
        });

        it('returns 404 for unknown routes with any HTTP method', async () => {
            const res = await request(app).post('/api/nonexistent-endpoint');

            expect(res.status).toBe(404);
        });
    });
});

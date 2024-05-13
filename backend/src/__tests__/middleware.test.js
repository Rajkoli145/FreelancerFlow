const { validate, validateObjectId, schemas } = require('../middleware/validateMiddleware');
const { ValidationError } = require('../utils/errors');

// Helper: create mock Express req/res/next objects
const mockReq = (body = {}, params = {}) => ({ body, params });
const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};
const mockNext = () => jest.fn();

describe('validate() middleware', () => {
    describe('signup schema', () => {
        it('passes valid signup data and strips unknown fields', () => {
            const req = mockReq({
                fullName: 'Jane Doe',
                email: 'jane@example.com',
                password: 'secure123',
                unknownField: 'should be stripped',
            });
            const res = mockRes();
            const next = mockNext();

            validate('signup')(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            expect(next).toHaveBeenCalledWith();
            expect(req.body).not.toHaveProperty('unknownField');
            expect(req.body.email).toBe('jane@example.com');
        });

        it('throws ValidationError for missing fullName', () => {
            const req = mockReq({ email: 'jane@example.com', password: 'secure123' });
            const next = mockNext();

            expect(() => validate('signup')(req, mockRes(), next)).toThrow(ValidationError);
            expect(next).not.toHaveBeenCalled();
        });

        it('throws ValidationError for invalid email', () => {
            const req = mockReq({
                fullName: 'Jane',
                email: 'not-an-email',
                password: 'secure123',
            });
            expect(() => validate('signup')(req, mockRes(), mockNext())).toThrow(ValidationError);
        });

        it('throws ValidationError for password shorter than 6 characters', () => {
            const req = mockReq({
                fullName: 'Jane',
                email: 'jane@example.com',
                password: 'abc',
            });
            expect(() => validate('signup')(req, mockRes(), mockNext())).toThrow(ValidationError);
        });

        it('normalizes email to lowercase', () => {
            const req = mockReq({
                fullName: 'Jane',
                email: 'JANE@EXAMPLE.COM',
                password: 'secure123',
            });
            validate('signup')(req, mockRes(), mockNext());
            expect(req.body.email).toBe('jane@example.com');
        });
    });

    describe('login schema', () => {
        it('passes valid login data', () => {
            const req = mockReq({ email: 'jane@example.com', password: 'secure123' });
            const next = mockNext();
            validate('login')(req, mockRes(), next);
            expect(next).toHaveBeenCalledTimes(1);
        });

        it('throws ValidationError when password is missing', () => {
            const req = mockReq({ email: 'jane@example.com' });
            expect(() => validate('login')(req, mockRes(), mockNext())).toThrow(ValidationError);
        });
    });

    describe('createClient schema', () => {
        it('passes with name and email', () => {
            const req = mockReq({ name: 'Test Corp', email: 'corp@example.com' });
            const next = mockNext();
            validate('createClient')(req, mockRes(), next);
            expect(next).toHaveBeenCalledTimes(1);
        });

        it('throws ValidationError when name is missing', () => {
            const req = mockReq({ email: 'corp@example.com' });
            expect(() => validate('createClient')(req, mockRes(), mockNext())).toThrow(ValidationError);
        });

        it('throws ValidationError when email is missing', () => {
            const req = mockReq({ name: 'Test Corp' });
            expect(() => validate('createClient')(req, mockRes(), mockNext())).toThrow(ValidationError);
        });
    });

    describe('createProject schema', () => {
        it('throws ValidationError when hourlyRate is missing for Hourly project', () => {
            const req = mockReq({
                clientId: '64a1b2c3d4e5f6a7b8c9d0e1',
                title: 'My Project',
                billingType: 'Hourly',
            });
            expect(() => validate('createProject')(req, mockRes(), mockNext())).toThrow(ValidationError);
        });

        it('throws ValidationError when fixedPrice is missing for Fixed project', () => {
            const req = mockReq({
                clientId: '64a1b2c3d4e5f6a7b8c9d0e1',
                title: 'My Project',
                billingType: 'Fixed',
            });
            expect(() => validate('createProject')(req, mockRes(), mockNext())).toThrow(ValidationError);
        });
    });

    it('throws an error for unknown schema name', () => {
        const req = mockReq({});
        expect(() => validate('nonExistentSchema')(req, mockRes(), mockNext())).toThrow();
    });
});

describe('validateObjectId() middleware', () => {
    it('calls next() for a valid MongoDB ObjectId', () => {
        const req = mockReq({}, { id: '64a1b2c3d4e5f6a7b8c9d0e1' });
        const next = mockNext();
        validateObjectId('id')(req, mockRes(), next);
        expect(next).toHaveBeenCalledTimes(1);
        expect(next).toHaveBeenCalledWith();
    });

    it('throws ValidationError for a non-ObjectId string', () => {
        const req = mockReq({}, { id: 'not-a-valid-id' });
        expect(() => validateObjectId('id')(req, mockRes(), mockNext())).toThrow(ValidationError);
    });

    it('throws ValidationError for an empty string', () => {
        const req = mockReq({}, { id: '' });
        expect(() => validateObjectId('id')(req, mockRes(), mockNext())).toThrow(ValidationError);
    });

    it('validates a custom param name', () => {
        const req = mockReq({}, { clientId: '64a1b2c3d4e5f6a7b8c9d0e1' });
        const next = mockNext();
        validateObjectId('clientId')(req, mockRes(), next);
        expect(next).toHaveBeenCalledTimes(1);
    });
});

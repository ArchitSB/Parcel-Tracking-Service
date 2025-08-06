const request = require('supertest');
const app = require('../src/server');

describe('Health Check', () => {
  it('should return health status', async () => {
    const res = await request(app)
      .get('/health')
      .expect(200);

    expect(res.body.status).toBe('OK');
    expect(res.body.service).toBe('Parcel Tracking API');
  });
});

describe('API Routes', () => {
  it('should return 404 for unknown routes', async () => {
    const res = await request(app)
      .get('/api/v1/unknown')
      .expect(404);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Route not found');
  });
});

// Add more tests for authentication, shipments, etc.
describe('Authentication', () => {
  describe('POST /api/v1/auth/register', () => {
    it('should register a new user with valid data', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      };

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(userData.email);
      expect(res.body.data.token).toBeDefined();
    });

    it('should return error for invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      };

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });
});

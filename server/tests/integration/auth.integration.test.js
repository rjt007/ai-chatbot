const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;
let app;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongoServer.getUri();
  process.env.JWT_SECRET = 'test-secret-key-for-testing';
  process.env.OPENAI_API_KEY = 'test-key';
  process.env.NODE_ENV = 'test';

  await mongoose.connect(process.env.MONGODB_URI);
  app = require('../../src/app');
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

describe('Auth Routes', () => {
  describe('POST /api/auth/register', () => {
    it('should register a user with @petasight.com email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@petasight.com',
          password: 'securepass123',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('test@petasight.com');
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.password).toBeUndefined();
    });

    it('should reject registration with non-petasight email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Bad User',
          email: 'test@gmail.com',
          password: 'securepass123',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('@petasight.com');
    });

    it('should reject registration with missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@petasight.com' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject duplicate email registration', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'First User',
          email: 'dupe@petasight.com',
          password: 'securepass123',
        });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Second User',
          email: 'dupe@petasight.com',
          password: 'securepass456',
        });

      expect(res.status).toBe(409);
    });

    it('should reject short passwords', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'short@petasight.com',
          password: '123',
        });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Login Test',
          email: 'login@petasight.com',
          password: 'securepass123',
        });
    });

    it('should login with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@petasight.com',
          password: 'securepass123',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
    });

    it('should reject wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@petasight.com',
          password: 'wrongpassword',
        });

      expect(res.status).toBe(401);
    });

    it('should reject non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nobody@petasight.com',
          password: 'securepass123',
        });

      expect(res.status).toBe(401);
    });
  });

  describe('Protected routes', () => {
    it('should reject requests without auth header', async () => {
      const res = await request(app)
        .post('/api/chat/message')
        .send({ message: 'hello' });

      expect(res.status).toBe(401);
    });

    it('should reject requests with invalid token', async () => {
      const res = await request(app)
        .post('/api/chat/message')
        .set('Authorization', 'Bearer invalidtoken123')
        .send({ message: 'hello' });

      expect(res.status).toBe(401);
    });
  });
});

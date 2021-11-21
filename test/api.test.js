const request = require('supertest');

const app = require('../src/app');

const db = require('../src/db');

describe('api tests', () => {
  beforeAll(async () => {
    await db.migrate.latest();
  });

  afterAll(async () => {
    await db.destroy();
  });

  describe('GET /api/v1', () => {
    it('responds with a json message', (done) => {
      request(app)
        .get('/api/v1')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, {
          message: 'API - Battles'
        }, done);
    });
  });

  describe('GET /api/v1/battles', () => {
    it('responds with a json message', (done) => {
      request(app)
        .get('/api/v1/battles')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, [], done);
    });
  });
});

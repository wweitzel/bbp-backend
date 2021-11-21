const request = require('supertest');

const app = require('../src/app');

const db = require('../src/db');

describe('api tests', () => {
  beforeAll(async () => {
    await db.migrate.latest();

    // await db('battle_submission').truncate();
    // await db('battle').truncate();
    // await db('user').truncate();

    await db.seed.run();
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
    it('responds with the seeded battles', (done) => {
      const expectedBattles = [
        { id: 1, streamer_id: '1' },
        { id: 2, streamer_id: '1' },
        { id: 3, streamer_id: '1' },
      ];

      request(app)
        .get('/api/v1/battles')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, expectedBattles, done);
    });

    it('responds with the specified battle', (done) => {
      const expectedBattle = { id: 1, streamer_id: '1' };

      request(app)
        .get('/api/v1/battles/1')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200, expectedBattle, done);
    });

    it('responds with not found for battle not in db', (done) => {
      request(app)
        .get('/api/v1/battles/5')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(404, done);
    });
  });
});

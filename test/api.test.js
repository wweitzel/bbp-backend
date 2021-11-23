const request = require('supertest');

const app = require('../src/app');

const db = require('../src/db');

const dbNames = require('../src/constants/dbNames');

describe('api tests', () => {
  beforeAll(async () => {
    await db.migrate.latest();
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
      request(app)
        .get('/api/v1/battles')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
          const battle = res.body[0];
          battle.id = 1;
          battle.streamerId = '1';
          battle.streamerUsername = 'chrispunsalan';
          const battle2 = res.body[1];
          battle2.id = 2;
          battle2.streamerId = '1';
          battle2.streamerUsername = 'chrispunsalan';
          const battle3 = res.body[2];
          battle3.id = 3;
          battle3.streamerId = '1';
          battle3.streamerUsername = 'chrispunsalan';
        })
        .end(done);
    });
  });

  describe('GET /api/v1/battles/:battle_id', () => {
    it('responds with the specified battle', (done) => {
      request(app)
        .get('/api/v1/battles/1')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .field(dbNames.battleColumns.id, 1)
        .field(dbNames.battleColumns.streamerId, '1')
        .end(done);
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

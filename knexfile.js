// Update with your config settings.

require('dotenv').config();

module.exports = {
  development: {
    client: 'pg',
    connection: {
      database: process.env.POSTGRES_DB,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD
    },
    migrations: {
      directory: './db/migrations',
    },
    seeds: {
      directory: './db/seeds',
    }
  },
  test: {
    client: 'pg',
    connection: {
      port: 5433,
      database: process.env.POSTGRES_TEST_DB,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD
    },
    migrations: {
      directory: './db/migrations',
    },
    seeds: {
      directory: './db/seeds',
    }
  },
  production: {
    client: 'pg',
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      },
    },
    migrations: {
      directory: './db/migrations',
    },
    seeds: {
      directory: './db/seeds',
    }
  }

};

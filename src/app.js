const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const cors = require('cors');

require('dotenv').config();

const middlewares = require('./middlewares');
const api = require('./api');

const app = express();

require('./db');

app.enable('trust proxy');

morgan.token('user-id', (req) => req.userId);
morgan.token('username', (req) => req.username);

// TODO: Move this out into a config
if (process.env.NODE_ENV === 'production') {
  app.use(morgan((tokens, req, res) => [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens['response-time'](req, res), 'ms',
    // eslint-disable-next-line dot-notation
    tokens['username'](req, res),
    // eslint-disable-next-line dot-notation
    tokens['user-id'](req, res)
  ].join(' ')));
} else {
  app.use(morgan('dev'));
}

app.set('trust proxy', 1);
app.use(helmet());
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(cors({
  // TODO: Probably dont want to include localhost in prod
  origin: [process.env.FRONTEND_ORIGIN, process.env.FRONTEND_ORIGIN_2, 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'Beat Battle Platform 🥁 🎹 🎧 🎸'
  });
});

app.use('/api/v1', api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

module.exports = app;

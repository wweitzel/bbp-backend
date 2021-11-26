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

app.use(morgan('dev'));
app.use(helmet());
app.use(cookieParser('keyboard_cat'));
app.use(cors({
  // TODO: Probably dont want to include localhost in prod
  origin: ['http://localhost:3000', process.env.FRONTEND_ORIGIN],
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

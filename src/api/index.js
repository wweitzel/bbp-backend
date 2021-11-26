const express = require('express');

const middleWares = require('../middlewares');

const auth = require('./auth/auth.routes');
const users = require('./users/users.routes');
const battles = require('./battles/battles.routes');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'API - Battles'
  });
});

router.use('/auth', auth);
if (process.env.ENABLE_AUTH === 'true') {
  router.use('/users', middleWares.ensureLoggedIn, users);
  router.use('/battles', middleWares.ensureLoggedIn, battles);
} else {
  router.use('/users', users);
  router.use('/battles', battles);
}

module.exports = router;

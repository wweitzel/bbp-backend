const express = require('express');

const users = require('./users/users.routes');
const battles = require('./battles/battles.routes');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'API - Battles'
  });
});

router.use('/users', users);
router.use('/battles', battles);

module.exports = router;

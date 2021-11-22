const express = require('express');

const auth = require('./auth/auth.routes');
const users = require('./users/users.routes');
const battles = require('./battles/battles.routes');
const battleSubmissions = require('./battle_submissions/battle-submissions.routes');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'API - Battles'
  });
});

router.use('/auth', auth);
router.use('/users', users);
router.use('/battles', battles);
router.use('/battles', battleSubmissions);

module.exports = router;

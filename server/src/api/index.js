const express = require('express');

const battles = require('./battles.routes');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'API - 👋🌎🌍🌏'
  });
});

router.use('/battles', battles);

module.exports = router;

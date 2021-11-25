const express = require('express');

const dbNames = require('../../constants/dbNames');

const router = express.Router({ mergeParams: true });

router.get('/', async (req, res) => {
  res.json();
});

module.exports = router;

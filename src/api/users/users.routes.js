const express = require('express');

const users = require('./users.queries');

const router = express.Router();

router.get('/', async (req, res) => {
  res.json(await users.find());
});

router.get('/:id', async (req, res, next) => {
  try {
    const user = await users.get(req.params.id);
    return res.json(user);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;

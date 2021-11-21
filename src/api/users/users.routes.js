const express = require('express');

const User = require('./users.model');

const router = express.Router();

router.get('/', async (req, res) => {
  const users = await User.query();
  res.json(users);
});

router.get('/:id', async (req, res, next) => {
  try {
    const user = await User.query()
      .where('twitch_user_id', req.params.id)
      .first();
    return res.json(user);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;

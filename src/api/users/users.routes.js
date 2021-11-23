const express = require('express');

const User = require('./users.model');
const dbNames = require('../../constants/dbNames');

const router = express.Router();

const fields = [
  dbNames.userColumns.twitchUserId,
  dbNames.userColumns.twtichUsername,
  dbNames.userColumns.streamer,
  dbNames.userColumns.createdAt
];

router.get('/', async (req, res) => {
  const users = await User.query()
    .select(fields)
    .where(dbNames.userColumns.deletedAt, null);
  res.json(users);
});

router.get('/:id', async (req, res, next) => {
  try {
    const user = await User.query()
      .select(fields)
      .where(dbNames.userColumns.twitchUserId, req.params.id)
      .andWhere(dbNames.userColumns.deletedAt, null);
    return res.json(user);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;

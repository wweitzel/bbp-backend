const express = require('express');

const queries = require('./battles.queries');
const User = require('../users/users.model');

const router = express.Router();

router.get('/', async (req, res) => {
  const battles = await queries.find();
  const ids = new Set(battles.map((battle) => battle.streamer_id));
  const promises = [];
  // TODO: Should be able to get all users in one query instead of multiple
  ids.forEach(async (id) => {
    promises.push(User.query()
      .where('twitch_user_id', id)
      .first());
  });
  const idToUser = new Map();
  await Promise.all(promises).then((users) => {
    users.forEach((user) => {
      idToUser.set(user.twitch_user_id, user);
    });
  });
  battles.forEach((battle) => {
    battle.streamer_username = idToUser.get(battle.streamer_id).twitch_username;
  });
  res.json(battles);
});

router.get('/:id', async (req, res, next) => {
  try {
    const battle = await queries.get(req.params.id);
    if (battle) {
      return res.json(battle);
    }
    return next();
  } catch (error) {
    return next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const battle = await queries.create(req.body);
    res.json(battle);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

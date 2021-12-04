const express = require('express');

const User = require('../users/users.model');
const Battle = require('./battles.model');
const dbNames = require('../../constants/dbNames');
const submissions = require('../submissions/submissions.routes');
const brackets = require('../brackets/brackets.routes');

const router = express.Router({
  mergeParams: true
});

const fields = [
  dbNames.battleColumns.id,
  dbNames.battleColumns.streamerId,
  dbNames.battleColumns.endTime,
  dbNames.battleColumns.name,
  dbNames.battleColumns.votingEndTime,
  dbNames.battleColumns.isAnonymous,
  dbNames.battleColumns.createdAt
];

router.use('/:battle_id/submissions', submissions);
router.use('/:battle_id/brackets', brackets);

function validate(battleRequest, res) {
  if (!battleRequest.votingDurationMinutes) {
    res.status(400);
    throw new Error('Request body must contain votingDurationMinutes field');
  }
}

router.get('/', async (req, res, next) => {
  try {
    const battles = await Battle.query()
      .select(fields)
      .where(dbNames.battleColumns.deletedAt, null);
    const ids = new Set(battles.map((battle) => battle.streamerId));
    const promises = [];
    // TODO: Should be able to get all users in one query instead of multiple
    ids.forEach(async (id) => {
      promises.push(User.query()
        .where(dbNames.userColumns.twitchUserId, id)
        .andWhere(dbNames.userColumns.deletedAt, null)
        .first());
    });
    const idToUser = new Map();
    await Promise.all(promises).then((users) => {
      users.forEach((user) => {
        idToUser.set(user.twitchUserId, user);
      });
    });

    battles.forEach((battle) => {
      battle.streamerUsername = idToUser.get(battle.streamerId).twitchUsername;
    });
    res.json(battles);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const battle = await Battle.query()
      .select(fields)
      .where(dbNames.battleColumns.id, req.params.id)
      .andWhere(dbNames.userColumns.deletedAt, null)
      .first();
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
    validate(req.body, res);
    const minutes = req.body.votingDurationMinutes;
    const votingEndTime = new Date(new Date(req.body.endTime).getTime() + minutes * 60000);
    req.body.votingEndTime = votingEndTime;
    delete req.body.votingDurationMinutes;
    const battle = await Battle.query()
      .insert(req.body)
      .returning(fields);
    res.json(battle);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

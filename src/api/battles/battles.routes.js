const express = require('express');

const User = require('../users/users.model');
const Battle = require('./battles.model');
const dbNames = require('../../constants/dbNames');
const submissions = require('../submissions/submissions.routes');
const brackets = require('../brackets/brackets.routes');
const { isStreamer, userIdEquals } = require('../../lib/authUtils');

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
  dbNames.battleColumns.isSubscriberOnly,
  dbNames.battleColumns.sampleUrl,
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

function validateUpdateBattleRequest(battle) {
  if (battle.id) {
    throw new Error('id field cannot be set when updating a battle.');
  }
  if (battle.streamerId) {
    throw new Error('streamerId field cannot be set when updating a battle.');
  }
  if (battle.createdAt) {
    throw new Error('createdAt field cannot be set when updating a battle.');
  }
  if (battle.updatedAt) {
    throw new Error('updatedAt field cannot be set when updating a battle.');
  }
}

router.get('/', async (req, res, next) => {
  try {
    res.cookie('test_cookie', 'test', {
      httpOnly: true,
      secure: true,
      signed: true
    });
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

router.patch('/:id', async (req, res, next) => {
  try {
    const dbBattle = await Battle.query().findById(req.params.id);
    if (dbBattle.streamerId !== req.signedCookies.twitch_user_id) {
      res.status(401);
      throw new Error('Cannot update another users battle.');
    }

    try {
      validateUpdateBattleRequest(req.body);
    } catch (error) {
      res.status(400);
      throw error;
    }

    const battle = await Battle.query().patchAndFetchById(
      req.params.id,
      req.body
    );
    res.json(battle);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    validate(req.body, res);

    if (!isStreamer(req.signedCookies)) {
      res.status(401);
      throw new Error(`User ${req.signedCookies.twitch_user_id} not authorized to create a battle`);
    }

    if (!userIdEquals(req.signedCookies, req.body.streamerId)) {
      res.status(401);
      throw new Error(`User ${req.signedCookies.twitch_user_id} cannot make a battle for other user ${req.body.streamerId}`);
    }

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

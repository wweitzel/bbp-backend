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
  dbNames.battleColumns.streamerUsername,
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
    const battles = await Battle.query()
      .select(fields)
      .where(dbNames.battleColumns.deletedAt, null);
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

    if (req.signedCookies.twitch_username) {
      req.body.streamerUsername = req.signedCookies.twitch_username;
    } else {
      // We should never get here because if the streamer
      // token is set, the username should be as well.
      console.error('Twitch username cookie not set but streamer cookie was set.');
      const user = await User.query()
        .select(fields)
        .where(dbNames.userColumns.twitchUserId, req.body.streamerId)
        .andWhere(dbNames.userColumns.deletedAt, null);
      req.body.streamerUsername = user.twitchUsername;
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

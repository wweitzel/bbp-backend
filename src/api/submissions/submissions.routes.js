const express = require('express');

const { raw } = require('objection');
const dbNames = require('../../constants/dbNames');
const Submission = require('./submissions.model');
const User = require('../users/users.model');
const Battle = require('../battles/battles.model');
const { userIdEquals, validateLoggedIn } = require('../../lib/authUtils');

const router = express.Router({ mergeParams: true });

const fields = [
  dbNames.submissionColumns.battleId,
  dbNames.submissionColumns.submitterId,
  dbNames.submissionColumns.soundcloudLink,
  dbNames.submissionColumns.voteCount,
  dbNames.submissionColumns.voteUsers,
  dbNames.submissionColumns.rank,
  dbNames.submissionColumns.submitterUsername,
  dbNames.submissionColumns.createdAt
];

const battleFields = [
  dbNames.battleColumns.id,
  dbNames.battleColumns.streamerId,
  dbNames.battleColumns.endTime,
  dbNames.battleColumns.name,
  dbNames.battleColumns.votingEndTime,
  dbNames.battleColumns.createdAt
];

router.get('/', async (req, res) => {
  const submissions = await Submission.query()
    .select(fields)
    .where(dbNames.submissionColumns.battleId, req.params.battle_id)
    .andWhere(dbNames.submissionColumns.deletedAt, null);
  res.json(submissions);
});

router.get('/:submitter_id', async (req, res, next) => {
  try {
    const submission = await Submission.query()
      .select(fields)
      .where(dbNames.submissionColumns.battleId, req.params.battle_id)
      .andWhere(dbNames.submissionColumns.submitterId, req.params.submitter_id)
      .andWhere(dbNames.submissionColumns.deletedAt, null)
      .first();
    if (!submission) {
      return next();
    }
    return res.json(submission);
  } catch (error) {
    return next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    validateLoggedIn(req, res);

    const battle = await Battle.query()
      .select(battleFields)
      .where(dbNames.battleColumns.id, req.params.battle_id)
      .andWhere(dbNames.userColumns.deletedAt, null)
      .first();

    const nowMs = new Date().getTime();
    const submissionEndTime = new Date(battle.endTime).getTime();
    if (submissionEndTime < nowMs) {
      res.status(400);
      throw new Error('Battle submission phase has ended.');
    }

    const user = await User.query()
      .select(dbNames.userColumns.twtichUsername)
      .where(dbNames.userColumns.twitchUserId, req.body.submitterId)
      .first();

    if (!user) {
      throw new Error('User with twitchUserId ' + req.body.subitterId + ' does not exist');
    }
    req.body.submitterUsername = user.twitchUsername;

    if (!userIdEquals(req.signedCookies, req.body.submitterId)) {
      res.status(400);
      throw new Error(`User ${req.signedCookies.twitch_user_id} attempting to submit beat for a different user ${req.body.submitterId}`);
    }

    const submission = await Submission.query()
      .insert(req.body)
      .returning(fields);
    res.json(submission);
  } catch (error) {
    next(error);
  }
});

router.post('/:submitter_id/votes', async (req, res, next) => {
  try {
    validateLoggedIn(req, res);

    const battle = await Battle.query()
      .select(battleFields)
      .where(dbNames.battleColumns.id, req.params.battle_id)
      .andWhere(dbNames.userColumns.deletedAt, null)
      .first();

    // TODO: This is duplicated from brackets.controller.js. We should combine them
    // in a util function.
    const nowMs = new Date().getTime();
    const votingEndTime = new Date(battle.votingEndTime).getTime();
    if (votingEndTime < nowMs) {
      res.status(400);
      throw new Error('Battle voting phase is over.');
    }

    const submission = await Submission.query()
      .select(fields)
      .where(dbNames.submissionColumns.battleId, req.params.battle_id)
      .andWhere(dbNames.submissionColumns.submitterId, req.params.submitter_id)
      .andWhere(dbNames.submissionColumns.deletedAt, null)
      .first();

    if (submission.voteUsers.includes(req.body.voterId)) {
      res.status(400);
      return next(new Error('Cannot vote on same submission twice'));
    }

    const { voteUsers } = submission;
    voteUsers.push(req.body.voterId);

    const submissionUpdated = await Submission.query()
      .patch({
        voteCount: raw(dbNames.submissionColumns.voteCount + ' + 1'),
        voteUsers
      })
      .where(dbNames.submissionColumns.battleId, req.params.battle_id)
      .andWhere(dbNames.submissionColumns.submitterId, req.params.submitter_id)
      .returning(fields);

    return res.json(submissionUpdated);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;

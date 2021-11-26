const express = require('express');

const dbNames = require('../../constants/dbNames');
const Submission = require('./submissions.model');

const router = express.Router({ mergeParams: true });

const fields = [
  dbNames.submissionColumns.battleId,
  dbNames.submissionColumns.submitterId,
  dbNames.submissionColumns.soundcloudLink,
  dbNames.submissionColumns.votes,
  dbNames.submissionColumns.rank,
  dbNames.submissionColumns.submitterUsername,
  dbNames.submissionColumns.createdAt
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
      .andWhere(dbNames.submissionColumns.deletedAt, null);
    res.json(submission);
    return next();
  } catch (error) {
    return next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const submission = await Submission.query()
      .insert(req.body)
      .returning(fields);
    res.json(submission);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

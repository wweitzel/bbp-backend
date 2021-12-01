const express = require('express');

const dbNames = require('../../constants/dbNames');
const bracketController = require('./brackets.controller');
const Bracket = require('./brackets.model');
const Participant = require('../participants/participants.model');
const Match = require('../matches/matches.model');

const router = express.Router({ mergeParams: true });

const fields = [
  dbNames.bracketColumns.id,
  dbNames.bracketColumns.battleId,
  dbNames.bracketColumns.createdAt
];

const participantFileds = [
  dbNames.participantColumns.id,
  dbNames.participantColumns.matchId,
  dbNames.participantColumns.name,
  dbNames.participantColumns.isWinner,
  dbNames.participantColumns.resultText,
];

const matchFields = [
  dbNames.matchColumns.id,
  dbNames.matchColumns.bracketId,
  dbNames.matchColumns.nextMatchId
];

async function getBracket(bracketId) {
  const [bracket] = await Bracket.query()
    .select(fields)
    .where(dbNames.bracketColumns.id, bracketId)
    .andWhere(dbNames.submissionColumns.deletedAt, null);

  const matches = await Match.query()
    .select(matchFields)
    .where(dbNames.matchColumns.bracketId, bracketId)
    .andWhere(dbNames.submissionColumns.deletedAt, null);

  for (let i = 0; i < matches.length; i++) {
    const participants = await Participant.query()
      .select(participantFileds)
      .where(dbNames.participantColumns.matchId, matches[i].id)
      .andWhere(dbNames.submissionColumns.deletedAt, null);
    matches[i].participants = participants;
  }

  bracket.matches = matches;

  return bracket;
}

router.get('/', async (req, res) => {
  const brackets = await Bracket.query()
    .select(fields)
    .where(dbNames.bracketColumns.battleId, req.params.battle_id)
    .andWhere(dbNames.submissionColumns.deletedAt, null);
  res.json(brackets);
});

// Test endpoiont to reset bracket
router.post('/:bracket_id/reset', async (req, res) => {
  await Participant.transaction(async (trx) => {
    await Participant.query(trx)
      .delete()
      .whereIn(dbNames.participantColumns.matchId, ['5', '6', '7', '8']);
    const ps = await Participant.query(trx)
      .select(participantFileds)
      .whereIn(dbNames.participantColumns.matchId, ['1', '2', '3', '4']);
    for (let i = 0; i < ps.length; i++) {
      await Participant.query(trx)
        .patch({
          isWinner: false,
          resultText: ''
        });
    }
  });
  res.json(await getBracket(req.params.bracket_id));
});

router.get('/:bracket_id', async (req, res) => {
  res.json(await getBracket(req.params.bracket_id));
});

router.post('/:bracket_id/matches/:match_id', async (req, res, next) => {
  const match = await Match.query()
    .findById(req.params.match_id);

  if (!match) {
    return next();
  }

  try {
    await bracketController.saveMatchWinner(req, res, next);
    return res.json(await getBracket(req.params.bracket_id));
  } catch (error) {
    return next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const bracket = await bracketController.createBracket(req, res, next);
    return res.json(await getBracket(bracket.id));
  } catch (error) {
    return next(error);
  }
});

module.exports = router;

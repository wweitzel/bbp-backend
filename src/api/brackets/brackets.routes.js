const express = require('express');

const dbNames = require('../../constants/dbNames');
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

router.get('/', async (req, res) => {
  const brackets = await Bracket.query()
    .select(fields)
    .where(dbNames.bracketColumns.battleId, req.params.battle_id)
    .andWhere(dbNames.submissionColumns.deletedAt, null);
  res.json(brackets);
});

router.get('/:bracket_id', async (req, res) => {
  const [bracket] = await Bracket.query()
    .select(fields)
    .where(dbNames.bracketColumns.id, req.params.bracket_id)
    .andWhere(dbNames.submissionColumns.deletedAt, null);

  // const matchId = 0;

  const matches = await Match.query()
    .select(matchFields)
    .where(dbNames.matchColumns.bracketId, req.params.bracket_id)
    .andWhere(dbNames.submissionColumns.deletedAt, null);

  for (let i = 0; i < matches.length; i++) {
    const particpants = await Participant.query()
      .select(participantFileds)
      .where(dbNames.participantColumns.matchId, matches[i].id)
      .andWhere(dbNames.submissionColumns.deletedAt, null);
    matches[i].participants = particpants;
  }

  bracket.matches = matches;

  res.json(bracket);
});

module.exports = router;

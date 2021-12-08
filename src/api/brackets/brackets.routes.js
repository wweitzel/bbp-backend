const express = require('express');

const dbNames = require('../../constants/dbNames');
const bracketController = require('./brackets.controller');
const Bracket = require('./brackets.model');
const Participant = require('../participants/participants.model');
const Match = require('../matches/matches.model');
const Submission = require('../submissions/submissions.model');
const Battle = require('../battles/battles.model');

const { userIdEquals, isStreamer } = require('../../lib/authUtils');

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

async function getBracket(bracketId, battleId, res) {
  // TODO: All below queries should probably be in a transaction
  const [bracket] = await Bracket.query()
    .select(fields)
    .where(dbNames.bracketColumns.id, bracketId)
    .andWhere(dbNames.bracketColumns.deletedAt, null);

  if (!bracket) {
    res.status(404);
    throw new Error(`Bracket with bracket id ${bracketId} not fonud`);
  }

  const matches = await Match.query()
    .select(matchFields)
    .where(dbNames.matchColumns.bracketId, bracketId)
    .andWhere(dbNames.submissionColumns.deletedAt, null);

  const submissions = await Submission.query()
    .select(dbNames.submissionColumns.submitterId, dbNames.submissionColumns.rank)
    .where(dbNames.submissionColumns.battleId, battleId)
    .andWhere(dbNames.submissionColumns.deletedAt, null);

  for (let i = 0; i < matches.length; i++) {
    const participants = await Participant.query()
      .select(participantFileds)
      .where(dbNames.participantColumns.matchId, matches[i].id)
      .andWhere(dbNames.submissionColumns.deletedAt, null);
    participants.forEach((participant) => {
      participant.seed = submissions.find((s) => s.submitterId === participant.id).rank;
    });
    matches[i].participants = participants;
    // TODO: Gonna need to set this correctly depending on how many rounds there are
    matches[i].tournamentRoundText = '1';
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
  res.json(await getBracket(req.params.bracket_id, req.params.battle_id, res));
});

router.get('/:bracket_id', async (req, res, next) => {
  try {
    res.json(await getBracket(req.params.bracket_id, req.params.battle_id, res));
  } catch (error) {
    next(error);
  }
});

router.post('/:bracket_id/matches/:match_id', async (req, res, next) => {
  const battle = await Battle.query().findById(req.params.battleId);

  if (!userIdEquals(req.signedCookies, battle.streamerId)) {
    res.status(400);
    throw new Error(`User ${req.signedCookies.twitch_user_id} not authorized to update user ${battle.streamerId} battle`);
  }

  const match = await Match.query()
    .findById(req.params.match_id);

  if (!match) {
    return next();
  }

  try {
    await bracketController.saveMatchWinner(req, res, next);
    return res.json(await getBracket(req.params.bracket_id, req.params.battle_id, res));
  } catch (error) {
    return next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const battle = await Battle.query().findById(req.params.battleId);

    if (!isStreamer(req.signedCookies)) {
      res.status(400);
      throw new Error('Must be a streamer to create a bracket');
    }

    if (!userIdEquals(req.signedCookies, battle.streamerId)) {
      res.status(400);
      throw new Error(`User ${req.signedCookies.twitch_user_id} not authorized create bracket for ${battle.streamerId} battle`);
    }

    const bracket = await bracketController.createBracket(req, res, next);
    return res.json(await getBracket(bracket.id, req.params.battle_id, res));
  } catch (error) {
    return next(error);
  }
});

module.exports = router;

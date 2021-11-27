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

async function getBracket(req) {
  const [bracket] = await Bracket.query()
    .select(fields)
    .where(dbNames.bracketColumns.id, req.params.bracket_id)
    .andWhere(dbNames.submissionColumns.deletedAt, null);

  const matches = await Match.query()
    .select(matchFields)
    .where(dbNames.matchColumns.bracketId, req.params.bracket_id)
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
  res.json(await getBracket(req));
});

router.get('/:bracket_id', async (req, res) => {
  res.json(await getBracket(req));
});

router.post('/:bracket_id/matches/:match_id', async (req, res, next) => {
  const match = await Match.query()
    .findById(req.params.match_id);

  if (!match) {
    return next();
  }

  console.log(match);

  if (!req.body.winnerUserId) {
    return next(new Error('winnerUserId needs to be specified in the request to declare a winner.'));
  }

  const participants = await Participant.query()
    .select(participantFileds)
    .where(dbNames.participantColumns.matchId, req.params.match_id);

  if (participants.length < 2 && req.body.winnerUserId) {
    return next(new Error('Cannot set winner for a match with less than 2 participants'));
  }

  console.log(participants);

  let winnerName;

  for (let i = 0; i < participants.length; i++) {
    // TODO: Should we use code below to prevent this operation if the match already has a winner?
    // if (participants[i].isWinner) {
    //   return next(new Error('Match already has a winner declared.'));
    // }
    if (participants[i].id === req.body.winnerUserId) {
      participants[i].isWinner = true;
      participants[i].resultText = 'WON';
      winnerName = participants[i].name;
    } else {
      participants[i].isWinner = false;
      participants[i].resultText = 'LOST';
    }
  }

  try {
    await Participant.transaction(async (trx) => {
      for (let i = 0; i < participants.length; i++) {
        await Participant.query(trx)
          .patch({
            isWinner: participants[i].isWinner,
            resultText: participants[i].resultText
          })
          .where(dbNames.participantColumns.id, participants[i].id)
          .andWhere(dbNames.participantColumns.matchId, req.params.match_id);
      }

      if (match.nextMatchId) {
        // Advance the winner to the next match
        await Participant.query(trx).insert({
          id: req.body.winnerUserId,
          matchId: match.nextMatchId,
          name: winnerName
        });
      }
    });

    return res.json(await getBracket(req));
  } catch (error) {
    return next(error);
  }
});

module.exports = router;

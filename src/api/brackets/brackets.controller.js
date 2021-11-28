const Match = require('../matches/matches.model');
const Participant = require('../participants/participants.model');
const dbNames = require('../../constants/dbNames');

const participantFields = [
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

async function validateMatchExists(req, res, next) {
  const match = await Match.query().findById(req.params.match_id);
  if (!match) {
    return next();
  }
  return match;
}

async function validateRequest(req, res, next) {
  if (!req.body.winnerUserId) {
    return next(new Error('winnerUserId needs to be specified in the request to declare a winner.'));
  }
  return true;
}

async function validateParticipants(req, res) {
  const participants = await Participant.query()
    .select(participantFields)
    .where(dbNames.participantColumns.matchId, req.params.match_id);

  if (participants.length < 2) {
    res.status(400);
    throw new Error('Cannot set winner for a match with less than 2 participants');
  }
  return participants;
}

function updateParticipantFields(participants, winnerUserId, res) {
  let winnerName;
  let loserId;
  let dontUpdateWinner;
  for (let i = 0; i < participants.length; i++) {
    if (participants[i].isWinner && participants[i].id === winnerUserId) {
      // TODO: This is terrible. There has to be a better way.
      if ((i === 0 && participants[1].isWinner !== null)
        || (i === 1 && participants[0].isWinner !== null)) {
        res.status(400);
        throw new Error(participants[i].name + ' is already the winner');
      } else {
        dontUpdateWinner = true;
      }
    }
    if (participants[i].id === winnerUserId) {
      participants[i].isWinner = true;
      participants[i].resultText = 'WON';
      winnerName = participants[i].name;
    } else {
      participants[i].isWinner = false;
      participants[i].resultText = 'LOST';
      loserId = participants[i].id;
    }
  }
  return { winnerName, loserId, dontUpdateWinner };
}

function getAllNextMatchIds(matches, matchIds, nextMatchId) {
  if (!nextMatchId) {
    return;
  }
  matchIds.push(nextMatchId);
  getAllNextMatchIds(matches, matchIds, matches.find((m) => m.id === nextMatchId).nextMatchId);
}

async function updateDbParticipants(
  participants, match, winnerUserId, winnerName, loserId, nextMatchIds, dontUpdateWinner, next
) {
  try {
    await Participant.transaction(async (trx) => {
      for (let i = 0; i < participants.length; i++) {
        await Participant.query(trx)
          .patch({
            isWinner: participants[i].isWinner,
            resultText: participants[i].resultText
          })
          .where(dbNames.participantColumns.id, participants[i].id)
          .andWhere(dbNames.participantColumns.matchId, match.id);
      }

      if (match.nextMatchId) {
        if (!dontUpdateWinner) {
          // Advance the winner to the next match
          await Participant.query(trx).insert({
            id: winnerUserId,
            matchId: match.nextMatchId,
            name: winnerName
          });
        }
      }

      await Participant.query(trx)
        .delete()
        .where(dbNames.participantColumns.id, loserId)
        .whereIn(dbNames.participantColumns.matchId, nextMatchIds);
    });
    return true;
  } catch (error) {
    return next(error);
  }
}

async function saveMatchWinner(req, res, next) {
  validateRequest(req, res, next);

  const match = await validateMatchExists(req, res, next);
  const participants = await validateParticipants(req, res);

  const {
    winnerName,
    loserId,
    dontUpdateWinner
  } = updateParticipantFields(participants, req.body.winnerUserId, res);

  const matches = await Match.query()
    .select(matchFields)
    .where(dbNames.matchColumns.bracketId, req.params.bracket_id)
    .andWhere(dbNames.submissionColumns.deletedAt, null);

  const nextMatchIds = [];
  getAllNextMatchIds(matches, nextMatchIds, match.nextMatchId);

  await updateDbParticipants(
    participants,
    match,
    req.body.winnerUserId,
    winnerName,
    loserId,
    nextMatchIds,
    dontUpdateWinner,
    next
  );
}

module.exports = {
  saveMatchWinner
};

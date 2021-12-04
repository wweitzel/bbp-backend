const Match = require('../matches/matches.model');
const Participant = require('../participants/participants.model');
const Battle = require('../battles/battles.model');
const Bracket = require('./brackets.model');
const Submission = require('../submissions/submissions.model');
const User = require('../users/users.model');
const dbNames = require('../../constants/dbNames');
const rankMappings = require('../../constants/rankMappings');
const matchMappings = require('../../constants/matchMappings');

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

const bracketFields = [
  dbNames.bracketColumns.id,
  dbNames.bracketColumns.battleId,
  dbNames.bracketColumns.createdAt
];

const submissionFields = [
  dbNames.submissionColumns.battleId,
  dbNames.submissionColumns.submitterId,
  dbNames.submissionColumns.soundcloudLink,
  dbNames.submissionColumns.voteCount,
  dbNames.submissionColumns.voteUsers,
  dbNames.submissionColumns.rank,
  dbNames.submissionColumns.submitterUsername,
  dbNames.submissionColumns.createdAt
];

function findMatch(matches, matchNumber) {
  return matches.find((m) => m.matchNumber === matchNumber);
}

function findMatchId(matches, submission) {
  const { rank } = submission;
  const matchNumber = rankMappings.get(8).get(rank);
  const matchId = matches.find((m) => m.matchNumber === matchNumber).id;
  return matchId;
}

async function createMatches(participantCount, bracketId, submissions, trx) {
  const matches = [];
  for (let i = 0; i < participantCount - 1; i++) {
    matches.push({ bracketId });
  }
  const createdMatches = await Match.query(trx).insert(matches).returning('*');

  for (let i = 0; i < participantCount - 1; i++) {
    createdMatches[i].matchNumber = i + 1;
    createdMatches[i].nextMatchNumber = matchMappings.get(participantCount).get(i + 1);
  }

  const updatePromises = [];

  for (let i = 0; i < participantCount - 1 - 1; i++) {
    const nextMatch = findMatch(
      createdMatches, matchMappings.get(participantCount).get(i + 1)
    );
    createdMatches[i].nextMatchId = nextMatch.id;
    updatePromises.push(Match.query(trx)
      .where({ id: createdMatches[i].id })
      .update({ nextMatchId: nextMatch.id }));
  }

  await Promise.all(updatePromises);

  const userIds = submissions.map((s) => s.submitterId);

  const users = await User.query(trx)
    .select(dbNames.userColumns.twitchUserId, dbNames.userColumns.twtichUsername)
    .whereIn(dbNames.userColumns.twitchUserId, Array.from(userIds))
    .andWhere(dbNames.userColumns.deletedAt, null);

  const idToUser = new Map();
  users.forEach((user) => {
    idToUser.set(user.twitchUserId, user);
  });

  const participants = [];

  for (let i = 0; i < participantCount; i++) {
    const participant = {
      id: submissions[i].submitterId,
      matchId: findMatchId(createdMatches, submissions[i]),
      name: idToUser.get(submissions[i].submitterId).twitchUsername
    };
    participants.push(participant);
  }

  await Participant.query(trx).insert(participants).returning('*');
}

async function _createBracket(battleId, orderedSubmissions) {
  let bracket;
  await Bracket.transaction(async (trx) => {
    bracket = await Bracket.query(trx).insert({ battleId }).returning('*');
    await createMatches(8, bracket.id, orderedSubmissions, trx);
  });
  return bracket;
}

async function rankSubmissions(battleId) {
  const submissions = await Submission.query()
    .select(submissionFields)
    .where(dbNames.submissionColumns.battleId, battleId)
    .andWhere(dbNames.submissionColumns.deletedAt, null);
  submissions.sort((sub1, sub2) => (sub1.voteCount < sub2.voteCount ? 1 : -1));
  for (let i = 0; i < submissions.length; i++) {
    submissions[i].rank = i + 1;
  }
  return submissions;
}

async function validateMatchExists(req, res, next) {
  const match = await Match.query().findById(req.params.match_id);
  if (!match) {
    return next();
  }
  return match;
}

async function validateRequest(req, res) {
  if (!req.body || !req.body.winnerUserId) {
    res.status(400);
    throw new Error('Request body must contain winnerUserId.');
  }
  return true;
}

async function validateCanCreateBracket(req, res) {
  const battle = await Battle.query().findById(req.body.battleId);
  if (!battle) {
    // TODO: Figure out how to get next to throw this. Or at least
    // pull this 404 logic out into a util so its not duplicated with the middleware.
    res.status(404);
    throw new Error(`🔍 - Not Found - ${req.originalUrl}`);
  }
  const nowMs = new Date().getTime();
  const endTimeMs = new Date(battle.endTime).getTime();
  const votingEndTimeMs = new Date(battle.votingEndTime).getTime();
  if (endTimeMs > nowMs) {
    res.status(400);
    throw new Error('Battle submission period is not over yet.');
  }
  if (votingEndTimeMs > nowMs) {
    res.status(400);
    throw new Error('Battle vodting period is not over yet.');
  }

  const brackets = await Bracket.query()
    .select(bracketFields)
    .where(dbNames.bracketColumns.battleId, req.body.battleId)
    .andWhere(dbNames.bracketColumns.deletedAt, null);
  if (brackets.length > 0) {
    res.status(403);
    throw new Error('Bracket already exists for battle id: ' + req.body.battleId);
  }
  return true;
}

function validateCreateBracketRequest(req) {
  if (!req.body || !req.body.battleId) {
    throw new Error('Rquest body must contain battleId.');
  }
  if (req.body.battleId !== parseInt(req.params.battle_id, 10)) {
    throw new Error('battleId in request body does not match battleId in request params.');
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

async function createBracket(req, res) {
  validateCreateBracketRequest(req, res);
  await validateCanCreateBracket(req, res);
  const orderedSubmissions = await rankSubmissions(req.body.battleId);
  if (orderedSubmissions.length < 8) {
    throw new Error('Not enough submissions to create bracket. Need 8 but had ' + orderedSubmissions.length);
  }
  return _createBracket(req.body.battleId, orderedSubmissions);
}

module.exports = {
  saveMatchWinner,
  createBracket
};

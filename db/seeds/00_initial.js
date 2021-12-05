const dbNames = require('../../src/constants/dbNames');
const matchMappings = require('../../src/constants/matchMappings');
const rankMappings = require('../../src/constants/rankMappings');

function createUser(twitchUserId, twitchUsername, streamer) {
  return { twitchUserId, twitchUsername, streamer };
}

function createSubmission(battleId, submitterId, submitterUsername, soundcloudLink, rank) {
  return {
    battleId, submitterId, submitterUsername, soundcloudLink, rank
  };
}

function createBattle(streamerId, endTime, name, votingEndTime, isAnonymous) {
  return {
    streamerId, endTime, name, votingEndTime, isAnonymous
  };
}

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
  const createdMatches = await trx(dbNames.tableNames.match).insert(matches).returning('*');

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
    updatePromises.push(trx(dbNames.tableNames.match)
      .where({ id: createdMatches[i].id })
      .update({ nextMatchId: nextMatch.id }));
  }

  await Promise.all(updatePromises);

  const userIds = submissions.map((s) => s.submitterId);

  const users = await trx(dbNames.tableNames.user)
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

  await trx(dbNames.tableNames.participant).insert(participants).returning('*');
}

async function createBracket(knex, submissions) {
  await knex.transaction(async (trx) => {
    const bracket = {
      battleId: 1
    };
    const [createdBracket] = await trx(dbNames.tableNames.bracket).insert(bracket).returning('*');
    // TODO: We are creating 8 matches but have 10 submissions. This works by chance
    // because the seed puts the ranks in order, but we should fix it
    await createMatches(8, createdBracket.id, submissions, trx);
  });
}

exports.seed = async (knex) => {
  await knex(dbNames.tableNames.submission).truncate();
  // TODO: Find way to not have to use raw here since raw won't be portable
  await knex.raw('TRUNCATE TABLE battle RESTART IDENTITY CASCADE');
  await knex(dbNames.tableNames.user).del();

  const users = [
    createUser('516754928', 'chrispunsalan', true),
    createUser('477294350', 'kennybeats', false),
    createUser('3', 'alextumay', false),
    createUser('4', 'spell', false),
    createUser('5', 'wes', false),
    createUser('6', 'dave', false),
    createUser('7', 'adam', false),
    createUser('8', 'fond', false),
    createUser('9', 'scott', false),
    createUser('10', 'richy', false)
  ];

  await knex(dbNames.tableNames.user)
    .insert(users)
    .returning('*');

  const endTime = new Date(new Date().getTime() + (1 * 60 * 60 * 1000));
  const votingEndTime = new Date(endTime.getTime() + 15 * 60000); // 15 mintues after endTime
  const battles = [
    createBattle('516754928', endTime, 'Battle 1', votingEndTime, false),
    createBattle('516754928', endTime, 'Battle 2', votingEndTime, true),
    createBattle('477294350', endTime, 'Battle 3', votingEndTime, false),
    createBattle('4', endTime, 'Battle 4', votingEndTime, false)
  ];

  await knex(dbNames.tableNames.battle)
    .insert(battles)
    .returning('*');

  const submissions = [
    createSubmission(1, '516754928', 'chrispunsalan', 'https://soundcloud.com/brunomars/bruno-mars-anderson-paak-silk', 1),
    createSubmission(1, '477294350', 'kennybeats', 'https://soundcloud.com/brunomars/bruno-mars-anderson-paak-3', 2),
    createSubmission(1, '3', 'alextumay', 'https://soundcloud.com/brunomars/bruno-mars-anderson-paak-3', 3),
    createSubmission(1, '4', 'spell', 'https://soundcloud.com/brunomars/bruno-mars-anderson-paak-3', 4),
    createSubmission(1, '5', 'wes', 'https://soundcloud.com/brunomars/bruno-mars-anderson-paak-3', 5),
    createSubmission(1, '6', 'dave', 'https://soundcloud.com/brunomars/bruno-mars-anderson-paak-3', 6),
    createSubmission(1, '7', 'adam', 'https://soundcloud.com/brunomars/bruno-mars-anderson-paak-3', 7),
    createSubmission(1, '8', 'fond', 'https://soundcloud.com/brunomars/bruno-mars-anderson-paak-3', 8),
    createSubmission(1, '9', 'scott', 'https://soundcloud.com/brunomars/bruno-mars-anderson-paak-3', 9),
    createSubmission(1, '10', 'richy', 'https://soundcloud.com/brunomars/bruno-mars-anderson-paak-3', 10)
  ];

  const createdSubmissions = await knex(dbNames.tableNames.submission)
    .insert(submissions)
    .returning('*');

  await createBracket(knex, createdSubmissions);
};

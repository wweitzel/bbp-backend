const dbNames = require('../../src/constants/dbNames');
const matchMappings = require('../../src/constants/matchMappings');
const rankMappings = require('../../src/constants/rankMappings');

function createUser(twitchUserId, twitchUsername, streamer) {
  return { twitchUserId, twitchUsername, streamer };
}

function createSubmission(battleId, submitterId, soundcloudLink, rank) {
  return {
    battleId, submitterId, soundcloudLink, rank
  };
}

function createBattle(streamerId, endTime) {
  return { streamerId, endTime };
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

  await trx(dbNames.tableNames.partipant).insert(participants).returning('*');
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
    createUser('1', 'chrispunsalan', true),
    createUser('2', 'kennybeats', false),
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

  const battles = [
    createBattle('1', new Date(new Date().getTime() + (1 * 60 * 60 * 1000))),
    createBattle('1', new Date(new Date().getTime() + (1 * 60 * 60 * 1000))),
    createBattle('1')
  ];

  await knex(dbNames.tableNames.battle)
    .insert(battles)
    .returning('*');

  const submissions = [
    createSubmission(1, '1', 'https://soundcloud.com/brunomars/bruno-mars-anderson-paak-silk', 1),
    createSubmission(1, '2', 'https://soundcloud.com/brunomars/bruno-mars-anderson-paak-3', 2),
    createSubmission(1, '3', 'https://soundcloud.com/brunomars/bruno-mars-anderson-paak-3', 3),
    createSubmission(1, '4', 'https://soundcloud.com/brunomars/bruno-mars-anderson-paak-3', 4),
    createSubmission(1, '5', 'https://soundcloud.com/brunomars/bruno-mars-anderson-paak-3', 5),
    createSubmission(1, '6', 'https://soundcloud.com/brunomars/bruno-mars-anderson-paak-3', 6),
    createSubmission(1, '7', 'https://soundcloud.com/brunomars/bruno-mars-anderson-paak-3', 7),
    createSubmission(1, '8', 'https://soundcloud.com/brunomars/bruno-mars-anderson-paak-3', 8),
    createSubmission(1, '9', 'https://soundcloud.com/brunomars/bruno-mars-anderson-paak-3', 9),
    createSubmission(1, '10', 'https://soundcloud.com/brunomars/bruno-mars-anderson-paak-3', 10)
  ];

  const createdSubmissions = await knex(dbNames.tableNames.submission)
    .insert(submissions)
    .returning('*');

  await createBracket(knex, createdSubmissions);
};
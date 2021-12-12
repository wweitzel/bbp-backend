const dbNames = require('../../src/constants/dbNames');
const matchMappings = require('../../src/constants/matchMappings');
const rankMappings = require('../../src/constants/rankMappings');

function createUser(twitchUserId, twitchUsername, streamer) {
  return { twitchUserId, twitchUsername, streamer };
}

function createSubmission(
  battleId, submitterId, submitterUsername, soundcloudLink, rank, voteCount
) {
  return {
    battleId, submitterId, submitterUsername, soundcloudLink, rank, voteCount
  };
}

function createBattle(streamerId, endTime, name, votingEndTime,
  isAnonymous, isSubscriberOnly, sampleUrl, streamerUsername) {
  return {
    streamerId,
    endTime,
    name,
    votingEndTime,
    isAnonymous,
    isSubscriberOnly,
    sampleUrl,
    streamerUsername
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

async function createBracket(knex, rankedSubmissions, battleId) {
  await knex.transaction(async (trx) => {
    const bracket = {
      battleId
    };
    const [createdBracket] = await trx(dbNames.tableNames.bracket).insert(bracket).returning('*');
    // TODO: We are creating 8 matches but have 10 submissions. This works by chance
    // because the seed puts the ranks in order, but we should fix it
    await createMatches(8, createdBracket.id, rankedSubmissions, trx);
  });
}

exports.seed = async (knex) => {
  await knex(dbNames.tableNames.submission).truncate();
  // TODO: Find way to not have to use raw here since raw won't be portable
  await knex.raw('TRUNCATE TABLE battle RESTART IDENTITY CASCADE');
  await knex(dbNames.tableNames.user).del();

  const users = [
    createUser('516754928', 'chrispunsalan', true),
    createUser('477294350', 'kennybeats', true),
    createUser('515338746', 'alextumay', true),
    createUser('733149', 'spell', true),
    createUser('87523161', 'zestyyyyyyy', true),
    createUser('207861573', 'dcs_lefty', true),
  ];

  for (let i = 1; i < 1000; i++) {
    const username = 'user' + i;
    users.push(createUser(i.toString(), username, false));
  }

  await knex(dbNames.tableNames.user)
    .insert(users)
    .returning('*');

  const endTime = new Date(new Date().getTime() + (1 * 60 * 60 * 1000));
  const votingEndTime = new Date(endTime.getTime() + 15 * 60000); // 15 mintues after endTime

  const oldEndTime = new Date(new Date().getTime() - (1 * 60 * 60 * 24 * 2 * 1000));
  const oldVotingEndTime = new Date(oldEndTime.getTime() + 15 * 60000);

  const battles = [
    createBattle('516754928', endTime, 'Live battle', votingEndTime, false, false, 'https://soundcloud.com/mondoloops/taurus-dcs-lefty-mondo-loops', 'chrispunsalan'),
    createBattle('477294350', endTime, 'kennys battle', votingEndTime, false, false, 'https://soundcloud.com/3200warhol/birds-nest-prod-kenny-beats', 'kennybeats'),
    createBattle('516754928', oldEndTime, 'Really fun battle!', oldVotingEndTime, false, false, 'https://soundcloud.com/prodbychris/escape', 'chrispunsalan'),
    createBattle('733149', endTime, 'another one', votingEndTime, true, true, 'https://soundcloud.com/familyofkings/another-one', 'spell'),
    createBattle('207861573', oldEndTime, 'lot of submissions', oldVotingEndTime, false, false, 'https://soundcloud.com/familyofkings/another-one', 'dcs_lefty'),
    createBattle('87523161', oldEndTime, 'battle of all battles', oldVotingEndTime, false, false, 'https://soundcloud.com/familyofkings/another-one', 'zestyyyyyyy')
  ];

  await knex(dbNames.tableNames.battle)
    .insert(battles)
    .returning('*');

  const liveSubmissions = [
    createSubmission(1, '516754928', 'chrispunsalan', 'https://soundcloud.com/brunomars/bruno-mars-anderson-paak-silk', null, 23),
    createSubmission(1, '477294350', 'kennybeats', 'https://soundcloud.com/brunomars/bruno-mars-anderson-paak-3', null, 21),
    createSubmission(1, '515338746', 'alextumay', 'https://soundcloud.com/brunomars/bruno-mars-anderson-paak-4', null, 20),
    createSubmission(1, '733149', 'spell', 'https://soundcloud.com/brunomars/bruno-mars-anderson-paak-5', null, 16),
    createSubmission(1, '1', 'user1', 'https://soundcloud.com/brunomars/bruno-mars-anderson-paak-6', null, 12),
    createSubmission(1, '2', 'user2', 'https://soundcloud.com/brunomars/bruno-mars-anderson-paak-7', null, 10),
    createSubmission(1, '3', 'user3', 'https://soundcloud.com/freenationals/obituaries-instrumental?in=freenationals/sets/free-nationals-instrumentals', null, 6),
    createSubmission(1, '4', 'user4', 'https://soundcloud.com/freenationals/beauty-essex-instrumental?in=freenationals/sets/free-nationals-instrumentals', null, 3),
    createSubmission(1, '5', 'user5', 'https://soundcloud.com/freenationals/on-sight-instrumental?in=freenationals/sets/free-nationals-instrumentals', null, 3),
    createSubmission(1, '6', 'user6', 'https://soundcloud.com/freenationals/shibuya-instrumental?in=freenationals/sets/free-nationals-instrumentals', null, 2),
  ];

  function getOldSubmissions(battleId) {
    return [
      createSubmission(battleId, '516754928', 'chrispunsalan', 'https://soundcloud.com/brunomars/bruno-mars-anderson-paak-silk', 1, 43),
      createSubmission(battleId, '477294350', 'kennybeats', 'https://soundcloud.com/brunomars/bruno-mars-anderson-paak-3', 2, 35),
      createSubmission(battleId, '515338746', 'alextumay', 'https://soundcloud.com/brunomars/bruno-mars-anderson-paak-4', 3, 3),
      createSubmission(battleId, '733149', 'spell', 'https://soundcloud.com/brunomars/bruno-mars-anderson-paak-5', 4, 30),
      createSubmission(battleId, '1', 'user1', 'https://soundcloud.com/brunomars/bruno-mars-anderson-paak-6', 5, 10),
      createSubmission(battleId, '2', 'user2', 'https://soundcloud.com/brunomars/bruno-mars-anderson-paak-7', 6, 7),
      createSubmission(battleId, '3', 'user3', 'https://soundcloud.com/freenationals/obituaries-instrumental?in=freenationals/sets/free-nationals-instrumentals', 7, 3),
      createSubmission(battleId, '4', 'user4', 'https://soundcloud.com/freenationals/beauty-essex-instrumental?in=freenationals/sets/free-nationals-instrumentals', 8, 3),
      createSubmission(battleId, '5', 'user5', 'https://soundcloud.com/freenationals/on-sight-instrumental?in=freenationals/sets/free-nationals-instrumentals', 9, 1),
      createSubmission(battleId, '6', 'user6', 'https://soundcloud.com/freenationals/shibuya-instrumental?in=freenationals/sets/free-nationals-instrumentals', 10, 0)
    ];
  }

  const thousandSubmissions = [];
  for (let i = 1; i < 1000; i++) {
    thousandSubmissions.push(createSubmission(5, i.toString(), 'user' + i, 'https://soundcloud.com/brunomars/bruno-mars-anderson-paak-6', null, 1000 - i));
  }

  await knex(dbNames.tableNames.submission)
    .insert(liveSubmissions)
    .returning('*');

  await knex(dbNames.tableNames.submission)
    .insert(thousandSubmissions)
    .returning('*');

  const createdOldSubmissions = await knex(dbNames.tableNames.submission)
    .insert(getOldSubmissions(3))
    .returning('*');

  await knex(dbNames.tableNames.submission)
    .insert(getOldSubmissions(6))
    .returning('*');

  await createBracket(knex, createdOldSubmissions, 3);
};

const dbNames = require('../../src/constants/dbNames');

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

function createGame(battleId, bracketType, playerOneParentGameId, playerTwoParentGameId,
  roundNumber, playerOneUserId, playerTwoUserId, playerOneScore, playerTwoScore) {
  return {
    battleId,
    bracketType,
    playerOneParentGameId,
    playerTwoParentGameId,
    roundNumber,
    playerOneUserId,
    playerTwoUserId,
    playerOneScore,
    playerTwoScore
  };
}

async function createBracket(knex) {
  const [game1] = await knex(dbNames.tableNames.game).insert(
    createGame(1, 'WINNERS', null, null, 1, '9', '8', 0, 0)
  ).returning('*');
  const [game2] = await knex(dbNames.tableNames.game).insert(
    createGame(1, 'WINNERS', null, null, 1, '7', '10', 0, 0)
  ).returning('*');
  const [game3] = await knex(dbNames.tableNames.game).insert(
    createGame(1, 'WINNERS', null, game1.id, 2, '1', null, 0, 0)
  ).returning('*');
  const [game4] = await knex(dbNames.tableNames.game).insert(
    createGame(1, 'WINNERS', null, null, 2, '5', '4', 0, 0)
  ).returning('*');
  const [game5] = await knex(dbNames.tableNames.game).insert(
    createGame(1, 'WINNERS', null, null, 2, '3', '6', 0, 0)
  ).returning('*');
  const [game6] = await knex(dbNames.tableNames.game).insert(
    createGame(1, 'WINNERS', game2.id, null, 2, null, '2', 0, 0)
  ).returning('*');
  const [game7] = await knex(dbNames.tableNames.game).insert(
    createGame(1, 'WINNERS', game3.id, game4.id, 3, null, null, 0, 0)
  ).returning('*');
  const [game8] = await knex(dbNames.tableNames.game).insert(
    createGame(1, 'WINNERS', game5.id, game6.id, 3, null, null, 0, 0),
  ).returning('*');
  await knex(dbNames.tableNames.game).insert(
    createGame(1, 'WINNERS', game7.id, game8.id, 4, null, null, 0, 0),
  );
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

  await knex(dbNames.tableNames.submission)
    .insert(submissions)
    .returning('*');

  const bracket = {
    battleId: '1',
    bracketType: 'WINNERS'
  };

  await knex(dbNames.tableNames.bracket)
    .insert(bracket)
    .returning('*');

  await createBracket(knex);
};

const dbNames = require('../../src/constants/dbNames');

exports.seed = async (knex) => {
  await knex(dbNames.tableNames.submission).truncate();
  // TODO: Find way to not have to use raw here since raw won't be portable
  await knex.raw('TRUNCATE TABLE battle RESTART IDENTITY CASCADE');
  await knex(dbNames.tableNames.user).del();

  const user = {
    twitchUserId: '1',
    twitchUsername: 'chrispunsalan',
    streamer: true
  };

  const user2 = {
    twitchUserId: '2',
    twitchUsername: 'someguy',
    streamer: false
  };

  const user3 = {
    twitchUserId: '3',
    twitchUsername: 'alextumay',
    streamer: false
  };

  await knex(dbNames.tableNames.user)
    .insert([user, user2, user3])
    .returning('*');

  const battle = {
    streamerId: '1',
    endTime: new Date(new Date().getTime() + (1 * 60 * 60 * 1000))
  };
  const battle2 = {
    streamerId: '1',
    endTime: new Date(new Date().getTime() + (1 * 60 * 60 * 1000))
  };
  const battle3 = {
    streamerId: '1'
  };

  await knex(dbNames.tableNames.battle)
    .insert([battle, battle2, battle3])
    .returning('*');

  const submission = {
    battleId: 1,
    submitterId: 1,
    soundcloudLink: 'https://soundcloud.com/brunomars/bruno-mars-anderson-paak-silk'
  };

  const submission2 = {
    battleId: 1,
    submitterId: 2,
    soundcloudLink: 'https://soundcloud.com/brunomars/bruno-mars-anderson-paak-3'
  };

  await knex(dbNames.tableNames.submission)
    .insert([submission, submission2])
    .returning('*');
};

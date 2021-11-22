const tableNames = require('../../src/constants/tableNames');

exports.seed = async (knex) => {
  await knex(tableNames.battle_submission).truncate();
  await knex.raw('TRUNCATE TABLE battle RESTART IDENTITY CASCADE');
  await knex(tableNames.user).del();

  const user = {
    twitch_user_id: '1',
    twitch_username: 'chrispunsalan',
    streamer: true
  };

  const user2 = {
    twitch_user_id: '2',
    twitch_username: 'someguy',
    streamer: false
  };

  await knex(tableNames.user)
    .insert([user, user2])
    .returning('*');

  const battle = {
    streamer_id: '1'
  };
  const battle2 = {
    streamer_id: '1'
  };
  const battle3 = {
    streamer_id: '1'
  };

  await knex(tableNames.battle)
    .insert([battle, battle2, battle3])
    .returning('*');

  const submission = {
    battle_id: 1,
    submitter_id: 1,
    soundcloud_link: 'dope track'
  };

  const submission2 = {
    battle_id: 1,
    submitter_id: 2,
    soundcloud_link: 'super sick track'
  };

  await knex(tableNames.battle_submission)
    .insert([submission, submission2])
    .returning('*');
};

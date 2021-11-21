const tableNames = require('../../src/constants/tableNames');

exports.seed = async (knex) => {
  await knex(tableNames.battle_submission).truncate();
  await knex(tableNames.battle).truncate();
  await knex(tableNames.user).del();

  const user = {
    twitch_user_id: '1',
    twitch_username: 'chrispunsalan',
    streamer: true
  };

  await knex(tableNames.user)
    .insert(user)
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
};

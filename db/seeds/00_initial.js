const tableNames = require('../../src/constants/tableNames');

exports.seed = async (knex) => {
  await knex(tableNames.battle).del();

  const battle = {
    streamer_id: 'chrispunsalan'
  };
  const battle2 = {
    streamer_id: 'chrispunsalan'
  };
  const battle3 = {
    streamer_id: 'chrispunsalan'
  };

  const createdBattles = await knex(tableNames.battle)
    .insert([battle, battle2, battle3])
    .returning('*');

  console.log('Battles Created:', createdBattles);
};

const db = require('../../db');

const tableNames = require('../../constants/tableNames');
const Battle = require('./battles.model');

const fields = ['id', 'streamer_id'];

module.exports = {
  find() {
    return db(tableNames.battle).select(fields);
  },

  get(id) {
    return db(tableNames.battle)
      .select(fields)
      .where(
        { id }
      ).first();
  },

  create(battle) {
    return Battle.query().insert(battle);
  }
};

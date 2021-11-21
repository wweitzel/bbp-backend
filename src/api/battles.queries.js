const db = require('../db');

const tableNames = require('../constants/tableNames');

const fields = ['id', 'streamer_id'];

module.exports = {
  find() {
    return db(tableNames.battle).select(fields);
  },

  async get(id) {
    const [battle] = await db(tableNames.battle)
      .select(fields)
      .where(
        { id }
      ).first();
  }
};
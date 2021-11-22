const db = require('../../db');

const tableNames = require('../../constants/tableNames');
const BattleSubmission = require('./battle-submissions.model');

const fields = ['battle_id', 'submitter_id', 'soundcloud_link'];

module.exports = {
  find() {
    return db(tableNames.battle_submission).select(fields);
  },

  get(id) {
    return db(tableNames.battle_submission)
      .select(fields)
      .where(
        { id }
      ).first();
  },

  create(battleSubmission) {
    return BattleSubmission.query().insert(battleSubmission);
  }
};

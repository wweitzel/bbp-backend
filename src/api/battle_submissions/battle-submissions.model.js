const { Model } = require('objection');

const tableNames = require('../../constants/tableNames');
const schema = require('./battle-submissions.schema.json');

class BattleSubmission extends Model {
  static get tableName() {
    return tableNames.battle_submission;
  }

  static get jsonSchema() {
    return schema;
  }

  static get idColumn() {
    return ['battle_id', 'submitter_id'];
  }
}

module.exports = BattleSubmission;

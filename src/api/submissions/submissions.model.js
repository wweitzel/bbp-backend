const BaseModel = require('../../lib/baseModel');

const dbNames = require('../../constants/dbNames');
const schema = require('./submissions.schema.json');

class Submission extends BaseModel {
  static get tableName() {
    return dbNames.tableNames.submission;
  }

  static get jsonSchema() {
    return schema;
  }

  static get idColumn() {
    return [
      dbNames.submissionColumns.battleId,
      dbNames.submissionColumns.submitterId
    ];
  }
}

module.exports = Submission;

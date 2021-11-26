const BaseModel = require('../../lib/baseModel');

const dbNames = require('../../constants/dbNames');

class Participant extends BaseModel {
  static get tableName() {
    return dbNames.tableNames.participant;
  }
}

module.exports = Participant;

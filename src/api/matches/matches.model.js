const BaseModel = require('../../lib/baseModel');

const dbNames = require('../../constants/dbNames');

class Match extends BaseModel {
  static get tableName() {
    return dbNames.tableNames.match;
  }
}

module.exports = Match;

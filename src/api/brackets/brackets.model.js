const BaseModel = require('../../lib/baseModel');

const dbNames = require('../../constants/dbNames');

class Bracket extends BaseModel {
  static get tableName() {
    return dbNames.tableNames.bracket;
  }
}

module.exports = Bracket;

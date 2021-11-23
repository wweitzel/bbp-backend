const BaseModel = require('../../lib/baseModel');

const dbNames = require('../../constants/dbNames');
const schema = require('./battles.schema.json');

class Battle extends BaseModel {
  static get tableName() {
    return dbNames.tableNames.battle;
  }

  static get jsonSchema() {
    return schema;
  }
}

module.exports = Battle;

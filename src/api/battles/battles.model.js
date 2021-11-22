const { Model } = require('objection');

const tableNames = require('../../constants/tableNames');
const schema = require('./battles.schema.json');

class Battle extends Model {
  static get tableName() {
    return tableNames.battle;
  }

  static get jsonSchema() {
    return schema;
  }
}

module.exports = Battle;

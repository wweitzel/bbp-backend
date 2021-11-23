const BaseModel = require('../../lib/baseModel');

const dbNames = require('../../constants/dbNames');

class Game extends BaseModel {
  static get tableName() {
    return dbNames.tableNames.game;
  }
}

module.exports = Game;

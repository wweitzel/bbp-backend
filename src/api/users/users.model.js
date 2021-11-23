const BaseModel = require('../../lib/baseModel');

const dbNames = require('../../constants/dbNames');
const schema = require('./users.schema.json');

class User extends BaseModel {
  static get tableName() {
    return dbNames.tableNames.user;
  }

  static get jsonSchema() {
    return schema;
  }

  static get idColumn() {
    return dbNames.userColumns.twitchUserId;
  }
}

module.exports = User;

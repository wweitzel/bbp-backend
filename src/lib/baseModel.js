const { Model } = require('objection');

class BaseModel extends Model {
  $beforeInsert() {
    this.createdAt = new Date().toISOString();
  }

  $beforeUpdate() {
    this.updatedAt = new Date().toISOString();
  }
}

module.exports = BaseModel;

const db = require('../../db');

const tableNames = require('../../constants/tableNames');

const fields = ['twitch_user_id', 'twitch_username', 'streamer', 'created_at', 'updated_at'];

module.exports = {
  find() {
    return db(tableNames.user).select(fields);
  },

  get(twitch_user_id) {
    return db(tableNames.user)
      .select(fields)
      .where(
        { twitch_user_id }
      ).first();
  }
};

const dbNames = require('../../src/constants/dbNames');

function addDefaultColumns(table) {
  table.timestamps(false, true);
  table.datetime('deleted_at');
}

exports.up = async (knex) => {
  await knex.schema.createTable(dbNames.tableNames.user, (table) => {
    table.string(dbNames.userColumns.twitchUserId);
    table.primary(dbNames.userColumns.twitchUserId);
    table.string(dbNames.userColumns.twtichUsername).notNullable();
    table.boolean(dbNames.userColumns.streamer).defaultTo(false);
    addDefaultColumns(table);
  });

  await knex.schema.createTable(dbNames.tableNames.battle, (table) => {
    table.increments().notNullable();
    table.string(dbNames.battleColumns.streamerId).notNullable();
    table.foreign(dbNames.battleColumns.streamerId).references(dbNames.userColumns.twitchUserId).inTable(dbNames.tableNames.user).onDelete('CASCADE');
    table.timestamp(dbNames.battleColumns.endTime);
    addDefaultColumns(table);
  });

  await knex.schema.createTable(dbNames.tableNames.submission, (table) => {
    table.integer(dbNames.submissionColumns.battleId).notNullable();
    table.string(dbNames.submissionColumns.submitterId).notNullable();
    table.primary([dbNames.submissionColumns.battleId, dbNames.submissionColumns.submitterId]);
    table.foreign(dbNames.submissionColumns.battleId).references(dbNames.battleColumns.id).inTable(dbNames.tableNames.battle).onDelete('CASCADE');
    table.foreign(dbNames.submissionColumns.submitterId).references(dbNames.userColumns.twitchUserId).inTable(dbNames.tableNames.user).onDelete('CASCADE');
    table.text(dbNames.submissionColumns.soundcloudLink).notNullable();
    table.integer(dbNames.submissionColumns.votes);
    table.integer(dbNames.submissionColumns.rank);
    addDefaultColumns(table);
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTable(dbNames.tableNames.submission);
  await knex.schema.dropTable(dbNames.tableNames.battle);
  await knex.schema.dropTable(dbNames.tableNames.user);
};

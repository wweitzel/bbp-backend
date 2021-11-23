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

  await knex.schema.createTable(dbNames.tableNames.bracket, (table) => {
    table.integer(dbNames.bracketColumns.battleId).notNullable();
    table.string(dbNames.bracketColumns.bracketType).notNullable();
    table.unique(dbNames.bracketColumns.bracketType);
    table.primary([dbNames.bracketColumns.battleId, dbNames.bracketColumns.bracketType]);
    table.foreign(dbNames.bracketColumns.battleId).references(dbNames.battleColumns.id).inTable(dbNames.tableNames.battle).onDelete('CASCADE');
    addDefaultColumns(table);
  });

  await knex.schema.createTable(dbNames.tableNames.game, (table) => {
    table.increments().notNullable();
    table.integer(dbNames.gameColumns.battleId).notNullable();
    table.string(dbNames.gameColumns.bracketType).notNullable();
    table.integer(dbNames.gameColumns.roundNumber).notNullable();
    table.integer(dbNames.gameColumns.playerOneParentGameId);
    table.integer(dbNames.gameColumns.playerTwoParentGameId);
    table.foreign(dbNames.gameColumns.battleId).references(dbNames.battleColumns.id).inTable(dbNames.tableNames.battle).onDelete('CASCADE');
    table.foreign(dbNames.gameColumns.bracketType).references(dbNames.bracketColumns.bracketType).inTable(dbNames.tableNames.bracket).onDelete('CASCADE');
    table.string(dbNames.gameColumns.playerOneUserId);
    table.string(dbNames.gameColumns.playerTwoUserId);
    table.string(dbNames.gameColumns.playerOneUsername);
    table.string(dbNames.gameColumns.playerTwoUsername);
    table.string(dbNames.gameColumns.playerOneScore);
    table.string(dbNames.gameColumns.playerTwoScore);
    addDefaultColumns(table);
  });
};

exports.down = async (knex) => {
  // await knex.schema.dropTable(dbNames.tableNames.game);
  // await knex.schema.dropTable(dbNames.tableNames.bracket);
  await knex.schema.dropTable(dbNames.tableNames.submission);
  await knex.schema.dropTable(dbNames.tableNames.battle);
  await knex.schema.dropTable(dbNames.tableNames.user);
};

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
    table.string(dbNames.battleColumns.name);
    table.timestamp(dbNames.battleColumns.votingEndTime);
    addDefaultColumns(table);
  });

  await knex.schema.createTable(dbNames.tableNames.submission, (table) => {
    table.integer(dbNames.submissionColumns.battleId).notNullable();
    table.string(dbNames.submissionColumns.submitterId).notNullable();
    table.primary([dbNames.submissionColumns.battleId, dbNames.submissionColumns.submitterId]);
    table.foreign(dbNames.submissionColumns.battleId).references(dbNames.battleColumns.id).inTable(dbNames.tableNames.battle).onDelete('CASCADE');
    table.foreign(dbNames.submissionColumns.submitterId).references(dbNames.userColumns.twitchUserId).inTable(dbNames.tableNames.user).onDelete('CASCADE');
    table.text(dbNames.submissionColumns.soundcloudLink).notNullable();
    table.integer(dbNames.submissionColumns.voteCount).defaultTo(0);
    table.specificType(dbNames.submissionColumns.voteUsers, 'text[]').defaultTo('{}');
    table.integer(dbNames.submissionColumns.rank);
    table.string(dbNames.submissionColumns.submitterUsername).notNullable();
    addDefaultColumns(table);
  });

  await knex.schema.createTable(dbNames.tableNames.bracket, (table) => {
    table.increments().notNullable();
    table.integer(dbNames.bracketColumns.battleId).notNullable();
    table.foreign(dbNames.bracketColumns.battleId).references(dbNames.battleColumns.id).inTable(dbNames.tableNames.battle).onDelete('CASCADE');
    addDefaultColumns(table);
  });

  await knex.schema.createTable(dbNames.tableNames.match, (table) => {
    table.increments().notNullable();
    table.integer(dbNames.matchColumns.bracketId).notNullable();
    table.foreign(dbNames.matchColumns.bracketId).references(dbNames.bracketColumns.id).inTable(dbNames.tableNames.bracket).onDelete('CASCADE');
    table.integer(dbNames.matchColumns.nextMatchId);
    addDefaultColumns(table);
  });

  await knex.schema.createTable(dbNames.tableNames.participant, (table) => {
    table.string(dbNames.participantColumns.id).notNullable();
    table.integer(dbNames.participantColumns.matchId).notNullable();
    table.primary([dbNames.participantColumns.id, dbNames.participantColumns.matchId]);
    table.foreign(dbNames.participantColumns.id).references(dbNames.userColumns.twitchUserId).inTable(dbNames.tableNames.user).onDelete('CASCADE');
    table.foreign(dbNames.participantColumns.matchId).references(dbNames.matchColumns.id).inTable(dbNames.tableNames.match).onDelete('CASCADE');
    table.boolean(dbNames.participantColumns.isWinner);
    table.string(dbNames.participantColumns.resultText);
    table.string(dbNames.participantColumns.name);
    addDefaultColumns(table);
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTable(dbNames.tableNames.participant);
  await knex.schema.dropTable(dbNames.tableNames.match);
  await knex.schema.dropTable(dbNames.tableNames.bracket);
  await knex.schema.dropTable(dbNames.tableNames.submission);
  await knex.schema.dropTable(dbNames.tableNames.battle);
  await knex.schema.dropTable(dbNames.tableNames.user);
};

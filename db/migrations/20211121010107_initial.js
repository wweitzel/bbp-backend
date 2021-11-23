const dbNames = require('../../src/constants/dbNames');

function addDefaultColumns(table) {
  table.timestamps(false, true);
  table.datetime('deleted_at');
}

exports.up = async (knex) => {
  await knex.schema.createTable(dbNames.tableNames.user, (table) => {
    table.string('twitch_user_id');
    table.primary('twitch_user_id');
    table.string('twitch_username').notNullable();
    table.boolean('streamer').defaultTo(false);
    addDefaultColumns(table);
  });

  await knex.schema.createTable(dbNames.tableNames.battle, (table) => {
    table.increments().notNullable();
    table.string('streamer_id').notNullable();
    table.foreign('streamer_id').references('twitch_user_id').inTable(dbNames.tableNames.user).onDelete('CASCADE');
    table.timestamp('end_time');
    addDefaultColumns(table);
  });

  await knex.schema.createTable(dbNames.tableNames.submission, (table) => {
    table.integer('battle_id').notNullable();
    table.string('submitter_id').notNullable();
    table.primary(['battle_id', 'submitter_id']);
    table.foreign('battle_id').references('id').inTable(dbNames.tableNames.battle).onDelete('CASCADE');
    table.foreign('submitter_id').references('twitch_user_id').inTable(dbNames.tableNames.user).onDelete('CASCADE');
    table.text('soundcloud_link').notNullable();
    table.integer('votes');
    table.integer('rank');
    addDefaultColumns(table);
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTable(dbNames.tableNames.submission);
  await knex.schema.dropTable(dbNames.tableNames.battle);
  await knex.schema.dropTable(dbNames.tableNames.user);
};

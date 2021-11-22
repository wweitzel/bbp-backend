const tableNames = require('../../src/constants/tableNames');

function addDefaultColumns(table) {
  table.timestamps(false, true);
  table.datetime('deleted_at');
}

exports.up = async (knex) => {
  await knex.schema.createTable(tableNames.user, (table) => {
    table.string('twitch_user_id');
    table.primary('twitch_user_id');
    table.string('twitch_username').notNullable();
    table.boolean('streamer').defaultTo(false);
    addDefaultColumns(table);
  });

  await knex.schema.createTable(tableNames.battle, (table) => {
    table.increments().notNullable();
    table.string('streamer_id').notNullable();
    table.foreign('streamer_id').references('twitch_user_id').inTable(tableNames.user).onDelete('CASCADE');
    table.timestamp('start_time').defaultTo(knex.fn.now());
    addDefaultColumns(table);
  });

  await knex.schema.createTable(tableNames.battle_submission, (table) => {
    table.integer('battle_id').notNullable();
    table.string('submitter_id').notNullable();
    table.primary(['battle_id', 'submitter_id']);
    table.foreign('battle_id').references('id').inTable(tableNames.battle).onDelete('CASCADE');
    table.foreign('submitter_id').references('twitch_user_id').inTable(tableNames.user).onDelete('CASCADE');
    table.text('soundcloud_link').notNullable();
    table.integer('votes');
    table.integer('rank');
    addDefaultColumns(table);
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTable(tableNames.battle_submission);
  await knex.schema.dropTable(tableNames.battle);
  await knex.schema.dropTable(tableNames.user);
};

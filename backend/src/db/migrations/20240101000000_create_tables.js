/**
 * @param {import('knex')} knex
 */
exports.up = async function (knex) {
  await knex.schema.createTable('quotes', (table) => {
    table.increments('id').primary();
    table.text('content').notNullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('tags', (table) => {
    table.increments('id').primary();
    table.string('name', 50).notNullable().unique();
    table.timestamp('last_used_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('quote_tags', (table) => {
    table.increments('id').primary();
    table.integer('quote_id').notNullable().references('id').inTable('quotes').onDelete('CASCADE');
    table.integer('tag_id').notNullable().references('id').inTable('tags').onDelete('CASCADE');
    table.unique(['quote_id', 'tag_id']);
  });

  // better-sqlite3 does not support multi-statement raw queries, run individually
  await knex.schema.raw('CREATE INDEX IF NOT EXISTS idx_quotes_updated_at ON quotes(updated_at DESC)');
  await knex.schema.raw('CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name)');
  await knex.schema.raw('CREATE INDEX IF NOT EXISTS idx_quote_tags_quote_id ON quote_tags(quote_id)');
  await knex.schema.raw('CREATE INDEX IF NOT EXISTS idx_quote_tags_tag_id ON quote_tags(tag_id)');
};

/**
 * @param {import('knex')} knex
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('quote_tags');
  await knex.schema.dropTableIfExists('tags');
  await knex.schema.dropTableIfExists('quotes');
};

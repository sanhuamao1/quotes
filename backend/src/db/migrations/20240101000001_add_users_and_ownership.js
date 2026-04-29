/**
 * @param {import('knex')} knex
 */
exports.up = async function (knex) {
  // 1. Create users table
  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('openid').notNullable().unique();
    table.string('nickname');
    table.string('avatar_url');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  await knex.schema.raw('CREATE INDEX IF NOT EXISTS idx_users_openid ON users(openid)');

  // 2. Seed default user for existing data
  const defaultUser = await knex('users').where({ openid: '__default__' }).first();
  if (!defaultUser) {
    await knex('users').insert({ id: 1, openid: '__default__', nickname: '默认用户' });
  }

  // 3. Add user_id to quotes
  // SQLite limitation: ALTER TABLE ADD COLUMN cannot have both NOT NULL and REFERENCES
  // We add the column with DEFAULT, application layer ensures integrity
  const hasUserIdColumn = await knex.schema.hasColumn('quotes', 'user_id');
  if (!hasUserIdColumn) {
    await knex.schema.raw("ALTER TABLE quotes ADD COLUMN user_id INTEGER DEFAULT 1");
    await knex.schema.raw('CREATE INDEX IF NOT EXISTS idx_quotes_user_id ON quotes(user_id)');
  }

  // 4. Recreate tags table with user_id and UNIQUE(user_id, name)
  // SQLite doesn't support ALTER TABLE to change constraints
  const hasTagUserId = await knex.schema.hasColumn('tags', 'user_id');
  if (!hasTagUserId) {
    // Disable foreign key checks temporarily
    await knex.schema.raw('PRAGMA foreign_keys = OFF');

    // Create new tags table with user_id
    await knex.schema.createTable('tags_new', (table) => {
      table.increments('id').primary();
      table.string('name', 50).notNullable();
      table.integer('user_id').notNullable().defaultTo(1).references('id').inTable('users');
      table.timestamp('last_used_at').defaultTo(knex.fn.now());
      table.unique(['user_id', 'name']);
    });

    // Copy existing data (assign all to default user)
    await knex.raw('INSERT INTO tags_new (id, name, user_id, last_used_at) SELECT id, name, 1, last_used_at FROM tags');

    // Drop old tags table and rename new one
    await knex.schema.dropTableIfExists('tags');
    await knex.schema.renameTable('tags_new', 'tags');

    // Re-create index
    await knex.schema.raw('CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name)');

    // Re-enable foreign keys
    await knex.schema.raw('PRAGMA foreign_keys = ON');
  }
};

/**
 * @param {import('knex')} knex
 */
exports.down = async function (knex) {
  // Drop user_id from quotes
  await knex.schema.raw('DROP INDEX IF EXISTS idx_quotes_user_id');
  // SQLite can't easily drop columns — in practice we'd recreate the table
  // For rollback, drop the users table (will cascade)
  await knex.schema.dropTableIfExists('users');
};

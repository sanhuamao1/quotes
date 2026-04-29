const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'app.db');

module.exports = {
  development: {
    client: 'better-sqlite3',
    connection: { filename: DB_PATH },
    useNullAsDefault: true,
    migrations: { directory: './src/db/migrations' },
    pool: {
      afterCreate: (conn, cb) => {
        conn.pragma('journal_mode = WAL');
        conn.pragma('foreign_keys = ON');
        cb();
      },
    },
  },
  test: {
    client: 'better-sqlite3',
    connection: { filename: ':memory:' },
    useNullAsDefault: true,
    migrations: { directory: './src/db/migrations' },
    pool: {
      afterCreate: (conn, cb) => {
        conn.pragma('journal_mode = WAL');
        conn.pragma('foreign_keys = ON');
        cb();
      },
    },
  },
  production: {
    client: 'better-sqlite3',
    connection: { filename: DB_PATH },
    useNullAsDefault: true,
    migrations: { directory: './src/db/migrations' },
    pool: {
      afterCreate: (conn, cb) => {
        conn.pragma('journal_mode = WAL');
        conn.pragma('foreign_keys = ON');
        cb();
      },
    },
  },
};

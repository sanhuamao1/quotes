import knex, { Knex } from 'knex';
import { config } from '../config';

let db: Knex | null = null;

export function getDB(): Knex {
  if (!db) {
    db = knex({
      client: 'better-sqlite3',
      connection: { filename: config.db.path },
      useNullAsDefault: true,
      pool: {
        afterCreate: (conn: { pragma: (s: string) => void }, cb: () => void) => {
          conn.pragma('journal_mode = WAL');
          conn.pragma('foreign_keys = ON');
          cb();
        },
      },
    });
  }
  return db;
}

export async function closeDB(): Promise<void> {
  if (db) {
    await db.destroy();
    db = null;
  }
}

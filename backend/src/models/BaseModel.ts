import { Knex } from 'knex';
import { getDB } from '../db/connection';

export class BaseModel {
  protected db: Knex;
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
    this.db = getDB();
  }

  query(): Knex.QueryBuilder {
    return this.db(this.tableName);
  }

  async findById(id: number): Promise<Record<string, unknown> | undefined> {
    return this.query().where({ id }).first();
  }

  async findAll(): Promise<Record<string, unknown>[]> {
    return this.query();
  }

  async create(data: Record<string, unknown>): Promise<number> {
    const ids = await this.query().insert(data);
    return ids[0] as number;
  }

  async update(id: number, data: Record<string, unknown>): Promise<number> {
    return this.query().where({ id }).update(data);
  }

  async delete(id: number): Promise<number> {
    return this.query().where({ id }).delete();
  }
}

import { BaseModel } from './BaseModel';

interface UserRecord {
  id: number;
  openid: string;
  nickname?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

class User extends BaseModel {
  constructor() {
    super('users');
  }

  async findByOpenid(openid: string): Promise<UserRecord | undefined> {
    return this.query().where({ openid }).first() as Promise<UserRecord | undefined>;
  }

  async createUser(data: { openid: string; nickname?: string; avatar_url?: string }): Promise<number> {
    return this.create(data);
  }
}

const userModel = new User();
export { userModel, User, UserRecord };

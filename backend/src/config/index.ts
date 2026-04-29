import dotenv from 'dotenv';
import path from 'path';
import type { AppConfig } from '../types';

dotenv.config();

const config: AppConfig = {
  port: parseInt(process.env.PORT || '3000', 10),
  env: process.env.NODE_ENV || 'development',
  db: {
    path: process.env.DB_PATH || path.join(__dirname, '..', '..', 'data', 'app.db'),
  },
  wechat: {
    appId: process.env.WECHAT_APP_ID || '',
    appSecret: process.env.WECHAT_APP_SECRET || '',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
};

export { config };

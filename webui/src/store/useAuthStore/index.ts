import { create } from 'zustand';
import Taro from '@tarojs/taro';

export interface AuthUser {
  id: number;
  openid: string;
}

export interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isLoggedIn: boolean;
  initializing: boolean;
}

export interface AuthActions {
  login: (token: string, user: AuthUser | null) => void;
  logout: () => void;
  setInitializing: (v: boolean) => void;
}

export type AuthStore = AuthState & AuthActions;

// 从存储中恢复初始状态
function getInitialState(): AuthState {
  try {
    const token = Taro.getStorageSync('token');
    return {
      token: token || null,
      user: null,
      isLoggedIn: !!token,
      initializing: true,
    };
  } catch {
    return { token: null, user: null, isLoggedIn: false, initializing: true };
  }
}

export const useAuthStore = create<AuthStore>()((set) => ({
  ...getInitialState(),

  login: (token, user) => {
    set({ token, user, isLoggedIn: true });
  },

  logout: () => {
    set({ token: null, user: null, isLoggedIn: false });
  },

  setInitializing: (v) => {
    set({ initializing: v });
  },
}));

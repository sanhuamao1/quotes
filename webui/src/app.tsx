import { useState, PropsWithChildren } from 'react';
import { Text, View } from '@tarojs/components';
import Taro, { useLaunch } from '@tarojs/taro';

import { useAuthStore } from './store/useAuthStore';
import { request } from './request/wrapper';
import './app.scss';

function App({ children }: PropsWithChildren<any>) {
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const login = useAuthStore(s => s.login);
  const setInitializing = useAuthStore(s => s.setInitializing);

  useLaunch(async () => {
    try {
      const storedToken = Taro.getStorageSync('token');
      if (storedToken) {
        login(storedToken, null);
        return;
      }

      const loginResult = await Taro.login();
      if (!loginResult.code) {
        throw new Error('获取微信登录 code 失败');
      }

      const data = await request<{ token: string; user: { id: number; openid: string } }>({
        url: '/auth/wechat-login',
        method: 'POST',
        data: { code: loginResult.code },
      });

      console.log('登录成功:', data);

      Taro.setStorageSync('token', data.token);
      login(data.token, data.user);
    } catch (err: any) {
      console.error('自动登录失败:', err);
      setAuthError(err.message || '登录失败');
    } finally {
      setInitializing(false);
      setLoading(false);
    }
  });

  return (
    <>
      {children}
      {(loading || authError) && (
        <View className="auth-overlay">
          <View className="auth-loading">
            <Text className="auth-loading__title">词摘</Text>
            <Text className="auth-loading__desc">{authError || '正在初始化...'}</Text>
          </View>
        </View>
      )}
    </>
  );
}

export default App;

import { useState, useCallback } from 'react';
import Taro from '@tarojs/taro';

export function useDrawer(initialValue = false) {
  const [showDrawer, setShowDrawer] = useState(initialValue);

  const updateShowDrawer = useCallback((value: boolean) => {
    setShowDrawer(value);
    if (value) {
      Taro.hideTabBar();
    } else {
      Taro.showTabBar();
    }
  }, []);

  return [showDrawer, updateShowDrawer] as const;
}

import Taro from '@tarojs/taro';

const BASE_URL = 'http://localhost:3000/api';

interface RequestOptions<T = any> {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: T;
  header?: Record<string, string>;
}

interface ApiResponse<T = any> {
  code: number;
  data: T;
  message?: string;
}

export async function request<T = any>(
  options: RequestOptions
): Promise<T> {
  const { url, method = 'GET', data, header = {} } = options;

  // 获取token（如需要）
  const token = Taro.getStorageSync('token');

  try {
    const res = await Taro.request<ApiResponse<T>>({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...header,
      },
    });

    if (res.statusCode >= 200 && res.statusCode < 300) {
      return res.data.data;
    }

    throw new Error(res.data.message || `请求失败: ${res.statusCode}`);
  } catch (error: any) {
    Taro.showToast({
      title: error.message || '网络错误',
      icon: 'none',
    });
    throw error;
  }
}

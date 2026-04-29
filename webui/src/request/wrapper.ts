import Taro from "@tarojs/taro";

// 从环境变量获取 API 地址
const BASE_URL =
  process.env.TARO_APP_API_BASE_URL || "http://localhost:3000/api";

interface RequestOptions<T = any> {
  url: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  data?: T;
  header?: Record<string, string>;
}

interface ApiResponse<T = any> {
  code: number;
  data: T;
  message?: string;
}

export async function request<T = any>(options: RequestOptions): Promise<T> {
  const { url, method = "GET", data, header = {} } = options;

  // 获取token（如需要）
  const token = Taro.getStorageSync("token");

  try {
    const res = await Taro.request<ApiResponse<T>>({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...header,
      },
    });

    if (res.statusCode >= 200 && res.statusCode < 300) {
      return res.data.data;
    }

    // 401: token 过期或无效
    if (res.statusCode === 401) {
      Taro.removeStorageSync("token");
      throw new Error("登录已过期，请重启小程序");
    }

    throw new Error(res.data.message || `请求失败: ${res.statusCode}`);
  } catch (error: any) {
    // 避免重复提示 401 错误（已在上面处理跳转）
    if (error.message !== "登录已过期，请重新登录") {
      Taro.showToast({
        title: error.message || "网络错误",
        icon: "none",
      });
    }
    throw error;
  }
}

import { AxiosHttpClient } from './axios';
import { CreateAxiosOptions } from './types';

// 开发环境
const isDev = process.env.NODE_ENV === 'development';

// 默认配置
const defaultOptions: CreateAxiosOptions = {
  // 请求超时时间
  timeout: 10000,
  // 接口地址
  baseURL: isDev ? 'http://localhost:8080/api' : 'https://api.example.com/api',
  // 请求配置
  requestOptions: {
    // 是否携带token
    withToken: true,
    // 是否显示加载中
    showLoading: false,
    // 错误消息类型
    errorMessageType: 'message',
    // 成功消息类型
    successMessageType: 'none',
    // 重试次数
    retryCount: 3,
    // 重试延迟
    retryDelay: 1000
  },
  // 拦截器
  interceptors: {
    // 请求成功拦截器
    requestInterceptors: (config) => {
      // 可以在这里添加自定义请求头
      config.headers['X-Client-Type'] = 'web';
      return config;
    },
    // 响应成功拦截器
    responseInterceptors: (response) => {
      // 可以在这里处理响应数据
      return response.data;
    },
    // 请求失败拦截器
    requestInterceptorsCatch: (error) => {
      console.error('Request Error:', error);
      return error;
    },
    // 响应失败拦截器
    responseInterceptorsCatch: (error) => {
      console.error('Response Error:', error);
      return error;
    }
  }
};

// 创建HTTP实例
const http = AxiosHttpClient.create(defaultOptions);

// 导出HTTP实例
export { http };

// 导出类型
export * from './types';

// 导出HTTP类
export { AxiosHttpClient };

// 默认导出
export default http; 
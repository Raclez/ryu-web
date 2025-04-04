import type { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// 请求配置
export interface RequestOptions {
  // 是否显示加载中
  showLoading?: boolean;
  // 是否携带token
  withToken?: boolean;
  // 错误提示类型：'message' | 'notification' | 'none'
  errorMessageType?: 'message' | 'notification' | 'none';
  // 成功提示类型：'message' | 'notification' | 'none'
  successMessageType?: 'message' | 'notification' | 'none';
  // 接口超时时间
  timeout?: number;
  // 接口地址
  baseURL?: string;
  // 重试次数
  retryCount?: number;
  // 重试延迟 (ms)
  retryDelay?: number;
}

// 请求配置
export interface CreateAxiosOptions extends AxiosRequestConfig {
  requestOptions?: RequestOptions;
  interceptors?: Interceptors;
}

// 拦截器
export interface Interceptors {
  // 请求拦截
  requestInterceptors?: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig;
  // 响应拦截
  responseInterceptors?: <T = any>(response: AxiosResponse<T>) => T;
  // 请求拦截错误处理
  requestInterceptorsCatch?: (error: any) => any;
  // 响应拦截错误处理
  responseInterceptorsCatch?: (error: any) => any;
}

// 后端返回格式
export interface ResponseBody<T = any> {
  code: number | string;
  data: T;
  message: string;
  success: boolean;
}

// HTTP方法
export type Method = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'head' | 'options'; 
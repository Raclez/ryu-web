/**
 * 环境变量相关工具函数
 */

// 当前环境
export const ENV = import.meta.env.VITE_APP_ENV || 'development';

// 是否是开发环境
export const isDev = ENV === 'development';

// 是否是测试环境
export const isTest = ENV === 'test';

// 是否是预发布环境
export const isStaging = ENV === 'staging';

// 是否是生产环境
export const isProd = ENV === 'production';

// 获取环境变量
export function getEnvValue(key: string): string {
  return import.meta.env[key] as string;
}

// 获取API基础URL
export function getApiBaseUrl(): string {
  return getEnvValue('VITE_API_BASE_URL');
}

// 获取应用标题
export function getAppTitle(): string {
  return getEnvValue('VITE_APP_TITLE');
}

// 应用版本
export const APP_VERSION = getEnvValue('VITE_APP_VERSION');

// 根据环境返回对应的值
export function envAdapter<T>(options: {
  dev?: T;
  test?: T;
  staging?: T;
  prod?: T;
  default?: T;
}): T | undefined {
  if (isDev && options.dev !== undefined) return options.dev;
  if (isTest && options.test !== undefined) return options.test;
  if (isStaging && options.staging !== undefined) return options.staging;
  if (isProd && options.prod !== undefined) return options.prod;
  return options.default;
} 
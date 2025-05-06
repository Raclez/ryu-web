import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { CreateAxiosOptions, RequestOptions, ResponseBody } from './types';

// 请求计数器
let pendingRequestCount = 0;

export class AxiosHttpClient {
  // axios实例
  private instance: AxiosInstance;
  // 请求配置
  private options: CreateAxiosOptions;

  constructor(options: CreateAxiosOptions) {
    this.options = options;
    this.instance = axios.create(options);
    this.setupInterceptors();
  }

  // 设置拦截器
  private setupInterceptors() {
    const { interceptors, requestOptions = {} } = this.options;

    // 请求拦截器
    this.instance.interceptors.request.use(
      (config) => {
        // 记录请求数
        pendingRequestCount++;

        // 是否显示loading
        if (requestOptions.showLoading) {
          // 这里可以实现显示全局loading
          // showLoading();
        }

        // 自定义请求拦截器
        if (interceptors?.requestInterceptors) {
          config = interceptors.requestInterceptors(config);
        }

        // 添加Token
        if (requestOptions.withToken !== false) {
          //TODO
          // const token = localStorage.getItem('token');
          const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJsb2dpblR5cGUiOiJsb2dpbiIsImxvZ2luSWQiOjEsInJuU3RyIjoibXJpMk1EY3ZiVEJwRW40eXRBM09idmtBVTBIVXRVUG0ifQ.99v7LDtl3YJqXvjN3otP7u7UHx4ZVt-9cBXHvUsKh7A"
          if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
          }
        }

        return config;
      },
      (error) => {
        pendingRequestCount--;

        // 自定义请求错误拦截器
        if (interceptors?.requestInterceptorsCatch) {
          error = interceptors.requestInterceptorsCatch(error);
        }

        // 隐藏loading
        if (pendingRequestCount <= 0 && requestOptions.showLoading) {
          // hideLoading();
        }

        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse<any>) => {
        pendingRequestCount--;

        // 隐藏loading
        if (pendingRequestCount <= 0 && requestOptions.showLoading) {
          // hideLoading();
        }

        // 自定义响应拦截器
        if (interceptors?.responseInterceptors) {
          response.data = interceptors.responseInterceptors(response);
        }

        return response;
      },
      (error: AxiosError) => {
        pendingRequestCount--;

        // 隐藏loading
        if (pendingRequestCount <= 0 && requestOptions.showLoading) {
          // hideLoading();
        }

        // 自定义响应错误拦截器
        if (interceptors?.responseInterceptorsCatch) {
          error = interceptors.responseInterceptorsCatch(error);
        }

        // 错误处理
        this.handleError(error);

        return Promise.reject(error);
      }
    );
  }

  // 错误处理
  private handleError(error: AxiosError) {
    const { requestOptions } = this.options;

    // 如果不需要显示错误信息，直接返回
    if (requestOptions?.errorMessageType === 'none') {
      return;
    }

    let message = '';
    if (error.response) {
      const status = error.response.status;

      // 统一处理HTTP状态码
      switch (status) {
        case 400:
          message = '请求错误';
          break;
        case 401:
          message = '未授权，请登录';
          // 可以在这里实现登出逻辑
          // logout();
          break;
        case 403:
          message = '拒绝访问';
          break;
        case 404:
          message = `请求地址出错: ${error.config?.url}`;
          break;
        case 408:
          message = '请求超时';
          break;
        case 500:
          message = '服务器内部错误';
          break;
        case 501:
          message = '服务未实现';
          break;
        case 502:
          message = '网关错误';
          break;
        case 503:
          message = '服务不可用';
          break;
        case 504:
          message = '网关超时';
          break;
        case 505:
          message = 'HTTP版本不受支持';
          break;
        default:
          message = `未知错误(${status})`;
      }
    } else if (error.request) {
      // 请求发送成功，但没有收到响应
      message = '服务器无响应';
    } else {
      // 请求设置发生错误
      message = error.message;
    }

    // 显示错误消息，可以根据项目需求选择消息提示组件
    console.error(message);

    // 使用不同的提示方式
    if (requestOptions?.errorMessageType === 'notification') {
      // 使用通知显示错误
      // this.notification.error({ message: '错误', description: message });
    } else {
      // 默认使用消息提示
      // this.message.error(message);
    }
  }

  // 请求方法
  public request<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<ResponseBody<T>> {
    const mergedOptions = { ...this.options.requestOptions, ...options };

    // 创建一个新的Promise以处理自定义逻辑
    return new Promise((resolve, reject) => {
      // 应用自定义选项
      if (mergedOptions.timeout) {
        config.timeout = mergedOptions.timeout;
      }

      if (mergedOptions.baseURL) {
        config.baseURL = mergedOptions.baseURL;
      }

      // 重试机制
      const retryCount = mergedOptions.retryCount || 0;
      const retryDelay = mergedOptions.retryDelay || 1000;

      // 请求函数
      const request = async (retries = 0) => {
        try {
          const response = await this.instance.request<ResponseBody<T>>(config);
          const data = response.data;

          // 统一处理业务状态码
          if (data.success || data.code === 200 || data.code === '200') {
            // 成功提示
            if (mergedOptions.successMessageType && mergedOptions.successMessageType !== 'none') {
              // this.message.success(data.message || '操作成功');
            }

            // 返回成功响应
            resolve(data);
          } else {
            // 业务逻辑错误
            if (mergedOptions.errorMessageType !== 'none') {
              // this.message.error(data.message || '操作失败');
              console.error(data.message || '操作失败');
            }

            reject(data);
          }
        } catch (error) {
          // 网络错误或服务器错误
          if (retries < retryCount) {
            // 重试
            console.log(`Request failed, retrying (${retries + 1}/${retryCount})...`);
            setTimeout(() => request(retries + 1), retryDelay);
          } else {
            reject(error);
          }
        }
      };

      // 开始请求
      request();
    });
  }

  // GET请求
  public get<T = any>(url: string, params?: any, options?: RequestOptions): Promise<ResponseBody<T>> {
    return this.request<T>({ method: 'GET', url, params }, options);
  }

  // POST请求
  public post<T = any>(url: string, data?: any, options?: RequestOptions): Promise<ResponseBody<T>> {
    return this.request<T>({ method: 'POST', url, data }, options);
  }

  // PUT请求
  public put<T = any>(url: string, data?: any, options?: RequestOptions): Promise<ResponseBody<T>> {
    return this.request<T>({ method: 'PUT', url, data }, options);
  }

  // DELETE请求
  public delete<T = any>(url: string, params?: any, options?: RequestOptions): Promise<ResponseBody<T>> {
    return this.request<T>({ method: 'DELETE', url, params }, options);
  }

  // PATCH请求
  public patch<T = any>(url: string, data?: any, options?: RequestOptions): Promise<ResponseBody<T>> {
    return this.request<T>({ method: 'PATCH', url, data }, options);
  }

  // 自定义实例（方便创建新实例）
  public static create(options: CreateAxiosOptions = {}): AxiosHttpClient {
    return new AxiosHttpClient(options);
  }
}

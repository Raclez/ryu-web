// import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
// import type { Blog, Category, ApiResponse, PaginatedResponse, Comment } from './types';
//
// // 导出类型
// export type { Blog, Category, Comment, ApiResponse, PaginatedResponse } from './types';
//
// // 创建axios实例
// const api = axios.create({
//   baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
//   timeout: 15000,
//   headers: {
//     'Content-Type': 'application/json'
//   }
// });
//
// // 请求拦截器
// api.interceptors.request.use(
//   (config) => {
//     // 可以在这里添加token等认证信息
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );
//
// // 响应拦截器
// api.interceptors.response.use(
//   (response) => {
//     // 如果返回的是文件流，直接返回
//     if (response.config.responseType === 'blob') {
//       return response;
//     }
//
//     // 处理API响应
//     const apiResponse = response.data as ApiResponse<any>;
//
//     // 如果API返回错误码，抛出错误
//     if (apiResponse.code !== 200) {
//       return Promise.reject(new Error(apiResponse.message || '请求失败'));
//     }
//
//     // 正常返回数据
//     return apiResponse.data;
//   },
//   (error) => {
//     if (error.response) {
//       // 服务器返回错误状态码
//       switch (error.response.status) {
//         case 401:
//           // 未授权，可以在这里处理登出
//           console.error('未授权，请重新登录');
//           break;
//         case 404:
//           console.error('请求的资源不存在');
//           break;
//         case 500:
//           console.error('服务器错误');
//           break;
//         default:
//           console.error(`请求错误: ${error.response.status}`);
//       }
//     } else if (error.request) {
//       // 请求发出但没有收到响应
//       console.error('网络错误，请检查您的网络连接');
//     } else {
//       // 请求配置错误
//       console.error('请求配置错误:', error.message);
//     }
//
//     return Promise.reject(error);
//   }
// );
//
// /**
//  * 通用GET请求
//  * @param url 请求地址
//  * @param params 请求参数
//  * @param config 额外配置
//  */
// export const get = <T>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> => {
//   return api.get(url, { params, ...config });
// };
//
// /**
//  * 通用POST请求
//  * @param url 请求地址
//  * @param data 请求数据
//  * @param config 额外配置
//  */
// export const post = <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
//   return api.post(url, data, config);
// };
//
// /**
//  * 通用PUT请求
//  * @param url 请求地址
//  * @param data 请求数据
//  * @param config 额外配置
//  */
// export const put = <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
//   return api.put(url, data, config);
// };
//
// /**
//  * 通用DELETE请求
//  * @param url 请求地址
//  * @param config 额外配置
//  */
// export const del = <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
//   return api.delete(url, config);
// };
//
// /**
//  * 博客API
//  */
// export const blogApi = {
//   /**
//    * 获取所有博客
//    */
//   getAllBlogs(): Promise<Blog[]> {
//     return get<Blog[]>('/blogs');
//   },
//
//   /**
//    * 获取热门博客
//    * @param limit 数量限制
//    */
//   getHotBlogs(limit: number = 5): Promise<Blog[]> {
//     return get<Blog[]>('/blogs/hot', { limit });
//   },
//
//   /**
//    * 根据ID获取博客详情
//    * @param id 博客ID
//    */
//   getBlogById(id: string): Promise<Blog> {
//     return get<Blog>(`/blogs/${id}`);
//   },
//
//   /**
//    * 获取相关博客
//    * @param id 当前博客ID
//    * @param limit 数量限制
//    */
//   getRelatedBlogs(id: string, limit: number = 3): Promise<Blog[]> {
//     return get<Blog[]>(`/blogs/${id}/related`, { limit });
//   },
//
//   /**
//    * 添加评论
//    * @param blogId 博客ID
//    * @param content 评论内容
//    */
//   addComment(blogId: string, content: string): Promise<Comment> {
//     return post<Comment>(`/blogs/${blogId}/comments`, { content });
//   },
//
//   /**
//    * 点赞评论
//    * @param commentId 评论ID
//    */
//   likeComment(commentId: string): Promise<void> {
//     return post<void>(`/comments/${commentId}/like`);
//   },
//
//   /**
//    * 回复评论
//    * @param commentId 评论ID
//    * @param content 评论内容
//    * @param replyTo 回复的用户名
//    */
//   replyToComment(commentId: string, content: string, replyTo: string): Promise<Comment> {
//     return post<Comment>(`/comments/${commentId}/reply`, { content, replyTo });
//   }
// };
//
// /**
//  * 分类API
//  */
// export const categoryApi = {
//   /**
//    * 获取所有分类
//    */
//   getAllCategories(): Promise<Category[]> {
//     return get<Category[]>('/categories');
//   },
//
//   /**
//    * 根据分类名获取博客列表
//    * @param categoryName 分类名
//    */
//   getBlogsByCategory(categoryName: string): Promise<Blog[]> {
//     return get<Blog[]>(`/categories/${categoryName}/blogs`);
//   }
// };
//
// // 默认导出
// export default {
//   get,
//   post,
//   put,
//   del,
//   blogApi,
//   categoryApi
// };

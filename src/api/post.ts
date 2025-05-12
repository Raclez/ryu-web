import {http} from '@/utils/http/index.ts'
import {BaseBlog, BlogDetail, Category, CursorPaginatedResponse} from './types'
import {ResponseBody} from '@/utils/http/types'

/**
 * 博客分页参数接口
 */
export interface BlogPaginationParams {
  cursor?: string;
  limit?: number;
  direction?: string;
  createTime?: string;
}

/**
 * 根据游标获取博客列表
 * @param params 分页参数，包含游标、限制数量、加载方向和创建时间
 * @returns 博客列表响应
 */
export async function getBlogByCursor(params: BlogPaginationParams = { cursor: '', limit: 5, direction: 'older' }): Promise<ResponseBody<CursorPaginatedResponse<BaseBlog>>> {
   return http.get("/ryu-content/posts/front", params);
}

/**
 * 根据ID获取博客详情
 * @param id 博客ID
 * @returns 博客详情响应
 */

export async function getBlogDetail(id: string): Promise<ResponseBody<BlogDetail>> {
    return http.get(`/ryu-content/posts/detail/${id}`);
}


/**
 * 获取推荐博客
 * @param postId 博客ID
 * @param limit 限制数量
 * @returns 推荐博客响应
 */

export async function getRecommendBlog(postId: string, limit: number ): Promise<ResponseBody<BlogDetail>> {
  return http.get(`/ryu-content/posts/related/${postId}/${limit}`);
}

/**
 * 获取所有分类
 * @returns 分类列表响应
 */
export async function getCategories(): Promise<ResponseBody<Category[]>> {
  return http.get('/ryu-content/categories');
}

/**
 * 根据分类名获取博客列表
 * @param categoryName 分类名
 * @returns 博客列表响应
 */
export async function getBlogsByCategory(categoryName: string): Promise<ResponseBody<BaseBlog[]>> {
  return http.get(`/ryu-content/posts/category/${categoryName}`);
}

/**
 * 记录博客浏览历史
 * @param params 浏览记录参数
 * @returns 响应结果
 */
export interface ViewRecordParams {
  postId: string;
  viewDuration?: number;
  referrer?: string;
  visitorId?: string;
}

export async function recordBlogView(params: ViewRecordParams): Promise<ResponseBody<any>> {
  return http.post('/ryu-content/view/record', params);
}

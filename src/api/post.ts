import { http } from '@/utils/http/index.ts'
import { BaseBlog, BlogDetail, CursorPaginatedResponse } from './types'
import { ResponseBody } from '@/utils/http/types'

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
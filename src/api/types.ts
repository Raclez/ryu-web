/**
 * 博客文章类型定义
 */
export interface BaseBlog {
  id: string;
  title: string;
  createTime: string;
  views: number;
  tagsName: string[];
  categoryName: string;
  coverImageUrl: string;
  excerpt: string;
  comments?: Comment[];
}

/**
 * 博客详情类型定义，扩展自BaseBlog
 */
export interface BlogDetail extends BaseBlog {
  markdown: string;
  author?: Author;
}

/**
 * 分类类型定义
 */
export interface Category {
  id: string;
  name: string;
  count: number;
  description?: string;
}

/**
 * 作者类型定义
 */
export interface Author {
  id: string;
  name: string;
  avatar: string;
  bio: string;
}

/**
 * 评论类型定义
 */
export interface Comment {
  id: string;
  content: string;
  createTime: string;
  likes: number;
  liked: boolean;
  user: User;
  replies?: Reply[];
}

/**
 * 回复类型定义
 */
export interface Reply {
  id: string;
  content: string;
  createTime: string;
  user: User;
  replyTo: string;
}

/**
 * 用户类型定义
 */
export interface User {
  id: string;
  name: string;
  avatar: string;
}

/**
 * API响应类型定义
 */
export interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

/**
 * 分页响应类型
 */
export interface PaginatedResponse<T> {
  total: number;
  page: number;
  pageSize: number;
  list: T[];
}

/**
 * 游标分页响应类型
 */
export interface CursorPaginatedResponse<T> {
  list: T[];
  cursor: string;
  hasMore: boolean;
}

/**
 * 浏览历史DTO类型定义
 */
export interface ViewHistoryDTO {
  id: string;
  postId: string;
  postTitle: string;
  viewTime: string;
  viewDuration: number;
  ipAddress: string;
  agent: string;
  location: string;
  coverImageUrl?: string; // 文章封面图
}

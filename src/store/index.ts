import { defineStore } from 'pinia';
import {BaseBlog, BlogDetail} from "@/api/types.ts";
import {ref} from "vue";
import {getBlogByCursor , BlogPaginationParams, getBlogDetail} from "@/api/post.ts";
import { DateUtils } from '@/utils/dateUtils';

export const useBlogStore = defineStore('blog', () => {
    // State
    const blogs = ref<BaseBlog[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)
    const currentBlog = ref<BlogDetail | null>(null)
    const hasMore = ref(true)
    const cursor = ref('')
    const lastCreateTime = ref<string>('')
    const loadingMore = ref(false)

    // Actions
    const fetchAllBlogs = async () => {
        try {
            loading.value = true
            cursor.value = ''
            lastCreateTime.value = ''
            hasMore.value = true

            const params: BlogPaginationParams = {
                cursor: '',
                limit: 5,
                direction: 'older'
            };

            const res = await getBlogByCursor(params)
            console.log("blogs", res.data)

            if (res.code === 200) {
                if (res.data && Array.isArray(res.data.list)) {
                    blogs.value = res.data.list || []
                    cursor.value = res.data.cursor || ''
                    hasMore.value = res.data.hasMore || false

                    if (blogs.value.length > 0) {
                        lastCreateTime.value = blogs.value[blogs.value.length - 1].createTime
                        console.log("保存创建时间:", lastCreateTime.value)
                    }
                } else if (Array.isArray(res.data)) {
                    blogs.value = res.data
                    if (res.data.length > 0) {
                        cursor.value = res.data[res.data.length - 1].id || ''
                        lastCreateTime.value = res.data[res.data.length - 1].createTime
                        console.log("保存创建时间:", lastCreateTime.value)
                    }
                    hasMore.value = res.data.length >= params.limit!
                } else {
                    blogs.value = []
                    hasMore.value = false
                }
            } else {
                error.value = res.message || '获取博客列表失败'
            }
        } catch (err) {
            error.value = err instanceof Error ? err.message : '请求失败'
        } finally {
            loading.value = false
        }
    }

    // 加载更多博客
    const loadMoreBlogs = async () => {
        if (!hasMore.value || loadingMore.value) return

        try {
            loadingMore.value = true

            const formattedCreateTime = DateUtils.formatDateForRequest(lastCreateTime.value);
            console.log("原始创建时间:", lastCreateTime.value);
            console.log("格式化后创建时间:", formattedCreateTime);

            const params: BlogPaginationParams = {
                cursor: cursor.value,
                limit: 5,
                direction: 'older',
                createTime: formattedCreateTime
            };

            const res = await getBlogByCursor(params)
            console.log("loadMore blogs:", res.data)

            if (res.code === 200) {
                if (res.data && Array.isArray(res.data.list)) {
                    blogs.value = [...blogs.value, ...res.data.list]
                    cursor.value = res.data.cursor || ''
                    hasMore.value = res.data.hasMore || false

                    if (res.data.list.length > 0) {
                        lastCreateTime.value = res.data.list[res.data.list.length - 1].createTime
                        console.log("更新创建时间:", lastCreateTime.value)
                    }
                } else if (Array.isArray(res.data)) {
                    blogs.value = [...blogs.value, ...res.data]
                    hasMore.value = res.data.length >= params.limit!

                    if (res.data.length > 0) {
                        cursor.value = res.data[res.data.length - 1].id
                        lastCreateTime.value = res.data[res.data.length - 1].createTime
                        console.log("更新创建时间:", lastCreateTime.value)
                    }
                } else {
                    console.error('加载更多返回数据格式不符合预期:', res.data)
                    hasMore.value = false
                }
            } else {
                hasMore.value = false
                error.value = res.message || '加载更多失败'
            }
        } catch (err) {
            console.error('加载更多异常:', err)
            error.value = err instanceof Error ? err.message : '加载更多失败'
            hasMore.value = false
        } finally {
            loadingMore.value = false
        }
    }

    // 获取单个博客
    const fetchBlogById = async (id: string) => {
        try {
            loading.value = true
            const res = await getBlogDetail(id)
            console.log("blog detail:", res)
            if (res.code === 200) {
                currentBlog.value = res.data
                return res.data
            } else {
                error.value = res.message || '获取博客详情失败'
                return null
            }
        } catch (err) {
            error.value = err instanceof Error ? err.message : '获取博客详情失败'
            return null
        } finally {
            loading.value = false
        }
    }

    return {
        blogs,
        loading,
        error,
        currentBlog,
        fetchAllBlogs,
        fetchBlogById,
        loadMoreBlogs,
        hasMore,
        loadingMore
    }
})

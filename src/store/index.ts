import { defineStore } from 'pinia';
import { blogApi, categoryApi } from '@/api';
import type { Blog, Category } from '@/api';

export const useBlogStore = defineStore('blog', {
  state: () => ({
    blogs: [] as Blog[],
    categories: [] as Category[],
    // 模拟数据，用于开发阶段
    mockMode: import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_API
  }),

  getters: {
    /**
     * 根据分类获取博客
     */
    getBlogsByCategory: (state) => {
      return (categoryName: string) => {
        return state.blogs.filter(blog => blog.category === categoryName);
      };
    },
    
    /**
     * 获取最新的博客
     */
    getLatestBlogs: (state) => {
      return (limit: number = 5) => {
        return [...state.blogs]
          .sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime())
          .slice(0, limit);
      };
    },
    
    /**
     * 获取最热门的博客
     */
    getHotBlogs: (state) => {
      return (limit: number = 5) => {
        return [...state.blogs]
          .sort((a, b) => b.heat - a.heat)
          .slice(0, limit);
      };
    }
  },

  actions: {
    /**
     * 获取所有博客
     */
    async fetchAllBlogs() {
      if (this.mockMode) {
        // 使用模拟数据
        this.blogs = getMockBlogs();
        return this.blogs;
      }
      
      try {
        this.blogs = await blogApi.getAllBlogs();
        return this.blogs;
      } catch (error) {
        console.error('Failed to fetch blogs:', error);
        throw error;
      }
    },
    
    /**
     * 根据ID获取博客
     * @param id 博客ID
     */
    async fetchBlogById(id: string): Promise<Blog | null> {
      if (this.mockMode) {
        // 使用模拟数据
        const blog = getMockBlogs().find(blog => blog.id === id) || null;
        return blog;
      }
      
      try {
        const blog = await blogApi.getBlogById(id);
        // 如果本地状态中没有该博客，添加到状态中
        const existingIndex = this.blogs.findIndex(b => b.id === blog.id);
        if (existingIndex === -1) {
          this.blogs.push(blog);
        } else {
          // 替换为新获取的详细博客信息
          this.blogs[existingIndex] = blog;
        }
        return blog;
      } catch (error) {
        console.error(`Failed to fetch blog with id ${id}:`, error);
        throw error;
      }
    },
    
    /**
     * 获取所有分类
     */
    async fetchCategories() {
      if (this.mockMode) {
        // 使用模拟数据
        this.categories = getMockCategories();
        return this.categories;
      }
      
      try {
        this.categories = await categoryApi.getAllCategories();
        return this.categories;
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        throw error;
      }
    },
    
    /**
     * 获取相关博客
     * @param blogId 当前博客ID
     */
    async fetchRelatedBlogs(blogId: string) {
      if (this.mockMode) {
        // 使用模拟数据，从当前博客同分类中随机选择
        const currentBlog = this.blogs.find(blog => blog.id === blogId);
        if (!currentBlog) return [];
        
        return this.blogs
          .filter(blog => blog.id !== blogId && blog.category === currentBlog.category)
          .slice(0, 3);
      }
      
      try {
        return await blogApi.getRelatedBlogs(blogId);
      } catch (error) {
        console.error(`Failed to fetch related blogs for ${blogId}:`, error);
        throw error;
      }
    }
  }
});

// 模拟数据生成函数
function getMockBlogs(): Blog[] {
  return [
    {
      id: '1',
      title: 'Vue 组件开发指南',
      content: 'Vue组件是Vue.js最强大的功能之一。本文将介绍组件开发的最佳实践和高级技巧，包括组件通信、插槽使用、生命周期管理等内容。通过本文，你将学会如何构建可复用、可维护的Vue组件。',
      date: '2023-05-15',
      createTime: '2023-05-15T08:30:00Z',
      heat: 458,
      tags: ['Vue', '前端', '组件'],
      category: '前端开发',
      image: 'https://example.com/images/vue-components.jpg',
      coverImage: 'https://example.com/images/vue-components-cover.jpg',
      toc: '<a href="#intro">1. 介绍</a><a href="#basics" class="h2">1.1 基础知识</a><a href="#advanced" class="h2">1.2 高级技巧</a>',
      author: {
        id: 'author1',
        name: '张三',
        avatar: 'https://example.com/avatars/zhangsan.jpg',
        bio: '资深前端工程师，Vue.js核心贡献者'
      },
      comments: [
        {
          id: 'c1',
          content: '非常实用的文章，学到了很多技巧！',
          createTime: '2023-05-16T10:15:00Z',
          likes: 24,
          liked: false,
          user: {
            id: 'user1',
            name: '前端小白',
            avatar: 'https://example.com/avatars/user1.jpg'
          },
          replies: [
            {
              id: 'r1',
              content: '我也觉得很实用，尤其是组件通信那部分',
              createTime: '2023-05-16T14:22:00Z',
              user: {
                id: 'user2',
                name: '技术达人',
                avatar: 'https://example.com/avatars/user2.jpg'
              },
              replyTo: '前端小白'
            }
          ]
        }
      ]
    },
    {
      id: '2',
      title: '现代前端解决方案',
      content: '收纳技术相关的暂零、限流、降级、断路器、事务、锁等相关技术，统一整理在此处。各种常见前端问题的解决方案，包括性能优化、状态管理、微前端架构等。',
      date: '2023-04-20',
      createTime: '2023-04-20T14:15:00Z',
      heat: 672,
      tags: ['架构', '解决方案', '最佳实践'],
      category: '架构设计',
      image: 'https://example.com/images/frontend-solutions.jpg',
      coverImage: 'https://example.com/images/frontend-solutions-cover.jpg',
      toc: '<a href="#intro">1. 架构挑战</a><a href="#solutions" class="h2">2. 解决方案</a>',
      author: {
        id: 'author2',
        name: '李四',
        avatar: 'https://example.com/avatars/lisi.jpg',
        bio: '资深架构师，拥有10年大型应用开发经验'
      },
      comments: []
    },
    {
      id: '3',
      title: 'TypeScript 类型系统深入理解',
      content: 'TypeScript的类型系统是其最强大的特性，本文深入探讨TypeScript的高级类型特性，包括泛型、条件类型、映射类型等。通过理解这些概念，可以更好地利用TypeScript进行开发。',
      date: '2023-06-10',
      createTime: '2023-06-10T09:45:00Z',
      heat: 389,
      tags: ['TypeScript', '类型系统', '前端'],
      category: '前端开发',
      image: 'https://example.com/images/typescript.jpg',
      coverImage: 'https://example.com/images/typescript-cover.jpg',
      toc: '<a href="#basics">1. 类型基础</a><a href="#advanced" class="h2">2. 高级类型</a>',
      author: {
        id: 'author1',
        name: '张三',
        avatar: 'https://example.com/avatars/zhangsan.jpg',
        bio: '资深前端工程师，Vue.js核心贡献者'
      },
      comments: []
    },
    {
      id: '4',
      title: '微服务架构设计模式',
      content: '微服务架构已经成为构建大型应用的主流方式。本文讨论微服务架构中的常见设计模式，包括服务发现、API网关、断路器等。这些模式可以帮助你构建更加健壮和可扩展的系统。',
      date: '2023-03-25',
      createTime: '2023-03-25T16:30:00Z',
      heat: 521,
      tags: ['微服务', '架构', '设计模式'],
      category: '架构设计',
      image: 'https://example.com/images/microservices.jpg',
      coverImage: 'https://example.com/images/microservices-cover.jpg',
      toc: '<a href="#intro">1. 微服务简介</a><a href="#patterns" class="h2">2. 设计模式</a>',
      author: {
        id: 'author3',
        name: '王五',
        avatar: 'https://example.com/avatars/wangwu.jpg',
        bio: '云原生专家，微服务架构师'
      },
      comments: []
    },
    {
      id: '5',
      title: 'React与Vue比较：如何选择前端框架',
      content: 'React和Vue是当前最流行的两个前端框架。本文从多个角度比较两个框架的异同点，包括性能、生态系统、学习曲线等。帮助你根据项目需求选择最适合的框架。',
      date: '2023-07-05',
      createTime: '2023-07-05T11:20:00Z',
      heat: 723,
      tags: ['React', 'Vue', '前端框架'],
      category: '前端开发',
      image: 'https://example.com/images/react-vs-vue.jpg',
      coverImage: 'https://example.com/images/react-vs-vue-cover.jpg',
      toc: '<a href="#comparison">1. 框架比较</a><a href="#cases" class="h2">2. 适用场景</a>',
      author: {
        id: 'author4',
        name: '赵六',
        avatar: 'https://example.com/avatars/zhaoliu.jpg',
        bio: '全栈开发者，同时精通React和Vue'
      },
      comments: []
    }
  ];
}

function getMockCategories(): Category[] {
  return [
    {
      id: 'cat1',
      name: '前端开发',
      count: 3,
      description: '关于前端开发的文章，包括HTML、CSS、JavaScript、框架等'
    },
    {
      id: 'cat2',
      name: '架构设计',
      count: 2,
      description: '系统架构设计相关文章，包括微服务、分布式系统等'
    },
    {
      id: 'cat3',
      name: '后端开发',
      count: 0,
      description: '后端开发技术文章，包括服务器、API设计、数据库等'
    },
    {
      id: 'cat4',
      name: '移动开发',
      count: 0,
      description: 'iOS、Android及跨平台移动应用开发相关内容'
    }
  ];
} 
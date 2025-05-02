<template>
  <div class="category-container">
    <header class="header" @mousemove="showNav" @mouseleave="hideNav">
      <div class="nav" :class="{ 'visible': isNavVisible }">
        <div class="menu-wrapper">
          <div class="menu">
            <router-link to="/">首页</router-link>
            <div class="dropdown">
              <span>分类</span>
              <div class="dropdown-content">
                <router-link 
                  v-for="category in categories" 
                  :key="category.id" 
                  :to="`/category/${category.name}`"
                >
                  {{ category.name }}
                </router-link>
              </div>
            </div>
          </div>
          
          <div class="right-actions">
            <div class="search-container">
              <input v-if="showSearchInput" 
                type="text" 
                class="search-input" 
                placeholder="搜索..." 
                ref="searchInput"
                v-model="searchQuery"
                @keyup.enter="performSearch"
                @blur="hideSearchInput"
              />
              <div class="search-btn" @click="toggleSearchInput">
                <i class="search-icon">🔍</i>
              </div>
            </div>
            <div class="avatar">
              <img src="@/assets/images/avatar.png" alt="头像" />
            </div>
          </div>
        </div>
      </div>
      <div class="category-info">
        <div class="container">
          <h1>{{ categoryTitle }}</h1>
          <p class="count">共 {{ blogs.length }} 篇文章</p>
        </div>
      </div>
    </header>
    
    <main class="main">
      <div class="container">
        <div v-if="loading" class="loading">
          <p>加载中...</p>
        </div>
        
        <div v-else-if="error" class="error">
          <p>{{ error }}</p>
        </div>
        
        <div v-else-if="blogs.length === 0" class="no-blogs">
          <p>该分类下暂无文章</p>
          <router-link to="/" class="home-link">返回首页</router-link>
        </div>
        
        <div v-else class="blog-list">
          <div 
            v-for="blog in blogs" 
            :key="blog.id" 
            class="blog-card"
            @click="navigateToBlog(blog.id)"
          >
            <div class="blog-thumbnail">
              <img :src="blog.coverImageUrl" :alt="blog.title" />
            </div>
            <div class="blog-info">
              <h2 class="blog-title">{{ blog.title }}</h2>
              <p class="blog-desc">{{ truncateContent(blog.excerpt) }}</p>
              <div class="blog-meta">
                <span class="blog-date">{{ formatDate(blog.createTime) }}</span>
                <span class="blog-category">{{ blog.categoryName }}</span>
                <span class="blog-views">{{ blog.views || randomViews() }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    
    <footer class="footer">
      <div class="copyright">
        © {{ new Date().getFullYear() }} Ryu
      </div>
      <div class="powered-by">
        Powered by <a href="https://halo.run/" target="_blank">Halo</a>  •  Crafted with by <a href="https://lixingyong.com/" target="_blank">LIlGG</a>
      </div>
      <div class="icp">
        鄂ICP备2024072949号
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useBlogStore } from '@/store';
import type { Category } from '@/api/types';
import type { BaseBlog } from '@/api/types';

const route = useRoute();
const router = useRouter();
const blogStore = useBlogStore();

const loading = ref<boolean>(true);
const error = ref<string | null>(null);
const category = computed<string>(() => route.params.category as string);
const categoryTitle = computed<string>(() => {
  return currentCategory.value ? currentCategory.value.name : category.value;
});
const isNavVisible = ref<boolean>(false);
const showSearchInput = ref<boolean>(false);
const searchQuery = ref<string>('');
const searchInput = ref<HTMLInputElement | null>(null);

// 显示导航栏
const showNav = (): void => {
  isNavVisible.value = true;
};

// 隐藏导航栏
const hideNav = (): void => {
  isNavVisible.value = false;
};

// 获取当前分类信息
const currentCategory = computed<Category | undefined>(() => {
  return blogStore.categories.find(cat => cat.name === category.value);
});

// 获取所有分类
const categories = computed<Category[]>(() => blogStore.categories);

// 获取当前分类下的博客
const blogs = ref<BaseBlog[]>([]);

// 获取分类下的博客
const fetchCategoryBlogs = async (): Promise<void> => {
  if (category.value) {
    const result = await blogStore.getBlogsByCategory(category.value);
    blogs.value = result || [];
  }
};

// 导航到博客详情页
const navigateToBlog = (blogId: string): void => {
  router.push({ name: 'BlogDetail', params: { id: blogId } });
};

// 截断内容
const truncateContent = (content: string): string => {
  if (!content) return '';
  if (content.length <= 70) return content;
  return content.substring(0, 70) + '...';
};

// 随机浏览量
const randomViews = (): number => {
  return Math.floor(Math.random() * 1000) + 100;
};

// 格式化日期
const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
};

// 扩展Window接口以支持自定义属性
declare global {
  interface Window {
    live2d_path?: string;
    live2d_settings?: {
      modelId: number;
      modelTexturesId: number;
      modelStorage: boolean;
      waifuSize: string;
      waifuTipsSize: string;
      waifuFontSize: string;
      waifuToolFont: string;
      waifuToolLine: string;
      waifuToolTop: string;
      waifuDraggable: string;
      waifuDraggableRevert: boolean;
      homePageUrl: string;
      showToolMenu: boolean;
      canCloseLive2d: boolean;
      canSwitchModel: boolean;
      canSwitchTextures: boolean;
      canSwitchHitokoto: boolean;
      canTakeScreenshot: boolean;
      canTurnToHomePage: boolean;
      canTurnToAboutPage: boolean;
      modelAPI: string;
      tipsMessage: string;
      hitokotoAPI: string;
    };
  }
}

// 初始加载数据
const loadData = async (): Promise<void> => {
  try {
    loading.value = true;
    
    // 并行加载博客和分类
    await Promise.all([
      blogStore.fetchAllBlogs(),
      blogStore.fetchCategories()
    ]);
    
    // 加载分类下的博客
    await fetchCategoryBlogs();
    
    // 检查分类是否存在
    if (category.value && !currentCategory.value) {
      error.value = '找不到该分类';
    }
  } catch (err) {
    console.error('加载数据失败:', err);
    error.value = err instanceof Error ? err.message : '加载数据失败，请刷新页面重试';
  } finally {
    loading.value = false;
  }
};

// 监听路由变化，重新加载数据
watch(() => route.params.category, async () => {
  if (blogStore.blogs.length > 0 && blogStore.categories.length > 0) {
    // 如果数据已经加载，只需加载当前分类的博客
    await fetchCategoryBlogs();
    
    // 检查分类是否存在
    if (category.value && !currentCategory.value) {
      error.value = '找不到该分类';
    } else {
      error.value = null;
    }
  } else {
    // 重新加载数据
    await loadData();
  }
});

onMounted(async () => {
  await loadData();
  
  // 初始化Live2D
  nextTick(() => {
    // 设置全局变量配置
    window.live2d_path = 'https://fastly.jsdelivr.net/gh/stevenjoezhang/live2d-widget@latest/';
    
    // 创建Live2D脚本
    const script = document.createElement('script');
    script.src = 'https://fastly.jsdelivr.net/gh/stevenjoezhang/live2d-widget@latest/autoload.js';
    
    // 设置模型路径
    window.live2d_settings = {
      modelId: 6,                // 设置默认模型为haruto
      modelTexturesId: 0,        // 默认材质
      modelStorage: false,       // 不储存模型ID
      waifuSize: '280x250',      // 看板娘大小
      waifuTipsSize: '250x70',   // 提示框大小
      waifuFontSize: '12px',     // 提示框字体
      waifuToolFont: '14px',     // 工具栏字体
      waifuToolLine: '20px',     // 工具栏行高
      waifuToolTop: '0px',       // 工具栏顶部边距
      waifuDraggable: 'unlimited', // 拖拽样式
      waifuDraggableRevert: true,  // 松开鼠标还原拖拽位置
      homePageUrl: '/',          // 主页链接
      showToolMenu: true,        // 显示工具栏
      canCloseLive2d: true,      // 显示关闭按钮
      canSwitchModel: true,      // 显示模型切换
      canSwitchTextures: true,   // 显示材质切换
      canSwitchHitokoto: true,   // 显示一言切换
      canTakeScreenshot: true,   // 显示看板娘截图
      canTurnToHomePage: true,   // 显示返回主页
      canTurnToAboutPage: true,  // 显示关于页
      modelAPI: 'https://unpkg.com/live2d-widget-model-haruto@1.0.5/assets/haruto.model.json',
      tipsMessage: 'waifu-tips.json',         // 同目录下可省略路径
      hitokotoAPI: 'hitokoto.cn'              // 一言API
    } as any; // 使用类型断言解决TS类型问题
    
    // 添加到文档
    document.body.appendChild(script);
    
    console.log('Live2D脚本已添加到文档中');
  });
});

const toggleSearchInput = (): void => {
  showSearchInput.value = !showSearchInput.value;
  if (showSearchInput.value) {
    searchInput.value?.focus();
  }
};

const hideSearchInput = (): void => {
  showSearchInput.value = false;
};

const performSearch = (): void => {
  // 实现搜索逻辑
  console.log('搜索查询:', searchQuery.value);
};
</script>

<style lang="scss" scoped>
.category-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #1c1c1c;
  color: #e0e0e0;
}

.header {
  position: relative;
  
  .nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px 0;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s ease, visibility 0.3s ease;
    z-index: 100;
    background-color: rgba(40, 40, 40, 0.35);
    backdrop-filter: blur(5px);
    
    &.visible {
      opacity: 1;
      visibility: visible;
    }
    
    .menu-wrapper {
      display: flex;
      align-items: center;
      justify-content: space-between;
      max-width: 1120px;
      width: 100%;
      margin: 0 auto;
      padding: 0 20px;
      position: relative;
      
      .menu {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        align-items: center;
        gap: 30px;
        
        a, .dropdown > span {
          color: #fff;
          font-size: 15px;
          position: relative;
          cursor: pointer;
          font-weight: 400;
          padding: 5px 0;
          text-align: center;
          
          &:after {
            content: '';
            position: absolute;
            width: 0;
            height: 2px;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            background-color: #fff;
            transition: width 0.3s ease;
          }
          
          &:hover:after, &.router-link-active:after {
            width: 100%;
          }
        }
        
        .dropdown {
          position: relative;
          
          .dropdown-content {
            position: absolute;
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            margin-top: 10px;
            background-color: rgba(80, 80, 80, 0.5);
            backdrop-filter: blur(5px);
            border-radius: 8px;
            padding: 10px 0;
            min-width: 120px;
            display: none;
            flex-direction: column;
            z-index: 10;
            
            a {
              padding: 8px 15px;
              white-space: nowrap;
              text-align: center;
              
              &:after {
                display: none;
              }
              
              &:hover {
                background-color: rgba(255, 255, 255, 0.1);
              }
            }
          }
          
          &:hover .dropdown-content {
            display: flex;
          }
        }
      }
      
      .right-actions {
        margin-left: auto;
        display: flex;
        align-items: center;
        gap: 15px;
        
        .search-container {
          position: relative;
          display: flex;
          align-items: center;
          
          .search-input {
            width: 200px;
            height: 32px;
            border: none;
            border-radius: 16px;
            padding: 0 15px;
            font-size: 14px;
            outline: none;
            background-color: rgba(255, 255, 255, 0.15);
            color: #fff;
            transition: all 0.3s ease;
            
            &::placeholder {
              color: rgba(255, 255, 255, 0.7);
            }
            
            &:focus {
              background-color: rgba(255, 255, 255, 0.2);
              width: 220px;
            }
          }
          
          .search-btn {
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            background-color: transparent;
            border-radius: 50%;
            transition: all 0.2s ease;
            
            &:hover {
              background-color: rgba(255, 255, 255, 0.1);
            }
            
            .search-icon {
              color: #fff;
              font-size: 16px;
            }
          }
        }
        
        .avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          overflow: hidden;
          cursor: pointer;
          border: 2px solid rgba(255, 255, 255, 0.2);
          transition: border-color 0.2s ease;
          
          &:hover {
            border-color: rgba(255, 255, 255, 0.4);
          }
          
          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }
      }
    }
  }
  
  .category-info {
    padding: 80px 0 40px;
    background-color: #2a2a2a;
    border-bottom: 1px solid #3a3a3a;
    margin-bottom: 30px;
    
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 0 20px;
      text-align: center;
    }
    
    h1 {
      font-size: 2.2rem;
      margin-bottom: 15px;
      font-weight: 700;
      color: #ffffff;
    }
    
    .count {
      color: #888;
      font-size: 14px;
    }
  }
}

.main {
  flex: 1;
  
  .container {
    max-width: 900px;
    margin: 0 auto;
    padding: 0 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .loading, .error, .no-blogs {
    text-align: center;
    padding: 50px 0;
    color: #e0e0e0;
    
    .home-link {
      display: inline-block;
      margin-top: 20px;
      padding: 10px 20px;
      background-color: #3273dc;
      color: white;
      border-radius: 5px;
      text-decoration: none;
      
      &:hover {
        background-color: #276cda;
      }
    }
  }
  
  .blog-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-bottom: 50px;
  }
  
  .blog-card {
    display: flex;
    flex-direction: row;
    background-color: #2a2a2a;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
    cursor: pointer;
    position: relative;
    width: 780px;
    height: 300px;
    margin-bottom: 20px;
    
    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3);
    }
    
    &:nth-child(even) {
      flex-direction: row-reverse;
    }
    
    .blog-thumbnail {
      position: relative;
      width: 429px;
      height: 300px;
      flex-shrink: 0;
      overflow: hidden;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
      }
    }
    
    &:hover .blog-thumbnail img {
      transform: scale(1.05);
    }
    
    .blog-info {
      flex: 1;
      padding: 25px 30px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      
      .blog-title {
        font-size: 22px;
        margin-bottom: 15px;
        color: #ffffff;
        font-weight: 600;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
        line-height: 1.4;
      }
      
      .blog-desc {
        color: #b0b0b0;
        font-size: 16px;
        line-height: 1.6;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        margin-bottom: 15px;
        flex: 1;
      }
      
      .blog-meta {
        margin-top: auto;
        display: flex;
        justify-content: space-between;
        font-size: 14px;
        color: #888;
        
        .blog-date {
          display: flex;
          align-items: center;
          background-color: rgba(255, 255, 255, 0.05);
          padding: 4px 10px;
          border-radius: 4px;
        }
        
        .blog-date:before {
          content: '📅';
          margin-right: 5px;
        }
        
        .blog-views {
          display: flex;
          align-items: center;
          background-color: rgba(255, 255, 255, 0.05);
          padding: 4px 10px;
          border-radius: 4px;
        }
        
        .blog-views:before {
          content: '👁️';
          margin-right: 5px;
        }
        
        .blog-category {
          display: flex;
          align-items: center;
          background-color: rgba(50, 120, 230, 0.2);
          padding: 4px 10px;
          border-radius: 4px;
          color: #6e9fff;
        }
        
        .blog-category:before {
          content: '📁';
          margin-right: 5px;
        }
      }
    }
  }
}

.footer {
  padding: 30px 20px;
  text-align: center;
  color: #888;
  font-size: 14px;
  margin-top: auto;
  background-color: #2a2a2a;
  
  .copyright {
    margin-bottom: 5px;
  }
  
  .powered-by {
    margin-bottom: 5px;
  }
  
  .icp {
    font-size: 12px;
    color: #999;
  }
  
  a {
    color: #6e9fff;
    
    &:hover {
      color: #90b5ff;
    }
  }
}

@media (max-width: 1200px) {
  .main .container {
    max-width: 800px;
  }
  
  .blog-card {
    width: 700px;
    
    .blog-thumbnail {
      width: 300px;
    }
    
    .blog-info {
      padding: 20px 25px;
      
      .blog-title {
        font-size: 20px;
        margin-bottom: 12px;
      }
      
      .blog-desc {
        font-size: 15px;
      }
    }
  }
}

@media (max-width: 768px) {
  .header {    
    .nav .menu-wrapper {
      width: 95%;
      padding: 0 15px;
      
      .menu {
        position: static;
        transform: none;
        justify-content: center;
        width: 100%;
        gap: 15px;
        margin: 0 auto;
        
        a, .dropdown > span {
          font-size: 14px;
        }
      }
      
      .right-actions {
        position: absolute;
        right: 15px;
        gap: 10px;
      }
      
      .avatar {
        width: 28px;
        height: 28px;
      }
    }
    
    .category-info {
      padding: 60px 0 30px;
      
      h1 {
        font-size: 1.8rem;
      }
    }
  }
  
  .main {
    .container {
      max-width: 95%;
    }
    
    .blog-card, .blog-card:nth-child(even) {
      width: 100%;
      height: auto;
      flex-direction: column;
      
      .blog-thumbnail {
        width: 100%;
        height: 200px;
      }
      
      .blog-info {
        padding: 15px 20px;
        
        .blog-title {
          font-size: 18px;
          margin-bottom: 10px;
        }
        
        .blog-desc {
          font-size: 14px;
          -webkit-line-clamp: 2;
          margin-bottom: 10px;
        }
      }
    }
  }
}

@media (max-width: 576px) {
  .header .nav .menu-wrapper {
    .menu {
      gap: 10px;
      
      a, .dropdown > span {
        font-size: 13px;
      }
    }
    
    .search-container {
      display: none;
    }
  }
}
</style> 
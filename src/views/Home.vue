<template>
  <div class="home-container">
    <div class="scroll-progress" :style="{ width: scrollProgress + '%' }"></div>
    <header class="header" @mousemove="showNav" @mouseleave="hideNav">
      <div class="nav" :class="{ 'visible': isNavVisible }" :style="{ 
        'background-color': `rgba(28, 28, 28, ${navOpacity})`,
        'backdrop-filter': `blur(${navOpacity * 10}px)`,
        'height': '60px'
      }">
        <div class="menu-wrapper">
          <div class="menu">
            <router-link to="/" class="nav-link">
              <i class="nav-icon">🏠</i>
              <span>首页</span>
            </router-link>
            <div class="dropdown">
              <span class="nav-link">
                <i class="nav-icon">📂</i>
                <span>分类</span>
              </span>
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
            <router-link to="/backend" class="nav-link">
              <i class="nav-icon">💻</i>
              <span>后端学习</span>
            </router-link>
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
      <div class="banner">
        <div class="hero-content">
          <h1 class="hero-title">Hi, Ryu</h1>
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
        
        <div v-else class="blog-list">
          <div 
            v-for="(blog, index) in blogs" 
            :key="blog.id" 
            class="blog-card"
            :style="{ '--i': index }"
            @click="navigateToBlog(blog.id)"
          >
            <div class="blog-thumbnail">
              <img :src="blog.image" :alt="blog.title" />
            </div>
            <div class="blog-info">
              <h3 class="blog-title">{{ blog.title }}</h3>
              <p class="blog-desc">{{ truncateContent(blog.content) }}</p>
              <div class="blog-meta">
                <span class="blog-date">
                  <i>📅</i>{{ formatDate(blog.createTime) }}
                </span>
                <span class="blog-comments">
                  <i>💬</i>{{ randomComments() }}
                </span>
                <span class="blog-views">
                  <i>👁️</i>{{ randomViews() }}
                </span>
                <span class="blog-category">
                  <i>📁</i>{{ blog.category }}
                </span>
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
import { ref, computed, onMounted, nextTick, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useBlogStore } from '@/store';
import type { Blog } from '@/api';

const router = useRouter();
const blogStore = useBlogStore();

const loading = ref<boolean>(true);
const error = ref<string | null>(null);
const blogs = computed<Blog[]>(() => blogStore.blogs);
const categories = computed(() => blogStore.categories);
const isNavVisible = ref<boolean>(false);
const showSearchInput = ref<boolean>(false);
const searchQuery = ref<string>('');
const scrollY = ref<number>(0);
const navOpacity = computed(() => {
  // 根据滚动位置计算导航栏透明度
  if (scrollY.value < 50) return 0.35; // 顶部时半透明
  if (scrollY.value > 200) return 0.75; // 滚动200px后更不透明
  return 0.35 + (scrollY.value - 50) / 150 * 0.4; // 在50-200px之间线性变化
});
const scrollProgress = computed(() => {
  if (!document.documentElement) return 0;
  const scrollTop = window.scrollY;
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  return (scrollTop / scrollHeight) * 100 || 0;
});

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

// 随机评论数
const randomComments = (): number => {
  return Math.floor(Math.random() * 50) + 1;
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

// 导航到博客详情页
const navigateToBlog = (blogId: string): void => {
  router.push({ name: 'BlogDetail', params: { id: blogId } });
};

// 显示导航栏
const showNav = (): void => {
  isNavVisible.value = true;
};

// 隐藏导航栏
const hideNav = (): void => {
  if (scrollY.value < 100) { // 只有在页面顶部才自动隐藏导航栏
    isNavVisible.value = false;
  }
};

// 监听滚动事件
const handleScroll = (): void => {
  scrollY.value = window.scrollY;
  
  // 当用户滚动页面时自动显示导航栏
  if (scrollY.value > 100) {
    isNavVisible.value = true;
  }
};

// 显示搜索输入框
const toggleSearchInput = (): void => {
  showSearchInput.value = !showSearchInput.value;
};

// 隐藏搜索输入框
const hideSearchInput = (): void => {
  showSearchInput.value = false;
};

// 执行搜索
const performSearch = (): void => {
  // 实现搜索逻辑
  console.log('搜索查询:', searchQuery.value);
};

onMounted(async (): Promise<void> => {
  try {
    // 并行加载博客和分类
    await Promise.all([
      blogStore.fetchAllBlogs(),
      blogStore.fetchCategories()
    ]);
    
    // 添加滚动监听
    window.addEventListener('scroll', handleScroll);
    
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
  } catch (err) {
    console.error('加载数据失败:', err);
    error.value = err instanceof Error ? err.message : '加载数据失败，请刷新页面重试';
  } finally {
    loading.value = false;
  }
});

// 组件卸载前清理
onBeforeUnmount(() => {
  // 移除滚动监听
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style lang="scss" scoped>
.home-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #1c1c1c;
  color: #e0e0e0;
  position: relative;
}

.scroll-progress {
  position: fixed;
  top: 0;
  left: 0;
  height: 5px;
  background: linear-gradient(to right, #ff9500, #ffcc00);
  z-index: 1000;
  transition: width 0.1s;
}

.header {
  position: relative;
  background-image: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('@/assets/images/banner.jpg');
  background-size: cover;
  background-position: center;
  height: 100vh;
  display: flex;
  flex-direction: column;
  
  .nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    z-index: 100;
    background-color: rgba(28, 28, 28, 0.6);
    backdrop-filter: blur(10px);
    height: 60px;
    
    &.visible {
      opacity: 1;
      visibility: visible;
      
      .menu .nav-link {
        animation: fadeIn 0.3s forwards;
        animation-delay: calc(0.05s * var(--i, 0));
        opacity: 0;
        
        .nav-icon {
          animation: bounceIn 0.5s forwards;
          animation-delay: calc(0.1s * var(--i, 0) + 0.2s);
        }
      }
      
      .right-actions {
        animation: slideInRight 0.4s forwards;
      }
    }
    
    .menu-wrapper {
      display: flex;
      align-items: center;
      max-width: 100%;
      width: 100%;
      padding: 0 30px;
      position: relative;
      height: 100%;
      box-sizing: border-box;
      
      .menu {
        display: flex;
        align-items: center;
        gap: 40px;
        justify-content: center;
        margin: 0 auto;
        
        .nav-link {
          color: #fff;
          font-size: 16px;
          position: relative;
          cursor: pointer;
          font-weight: 400;
          padding: 5px 0;
          text-align: center;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 8px;
          
          .nav-icon {
            font-size: 18px;
            color: #ffcc00;
            opacity: 0.7;
            transition: all 0.3s ease;
          }
          
          &:hover {
            color: #ffcc00;
            transform: translateY(-2px);
            
            .nav-icon {
              opacity: 1;
              transform: scale(1.1);
            }
          }
          
          &:after {
            content: '';
            position: absolute;
            width: 100%;
            height: 3px;
            bottom: -10px;
            left: 0;
            background-color: transparent;
            transition: background-color 0.3s ease, transform 0.3s ease;
            transform: scaleX(0.8);
            transform-origin: center;
          }
          
          &:hover:after {
            background-color: rgba(255, 204, 0, 0.7);
            transform: scaleX(1);
          }
          
          &.router-link-active:after {
            background-color: #ffcc00;
            transform: scaleX(1);
          }
        }
        
        .router-link-active {
          color: #ffcc00;
          font-weight: 500;
          
          .nav-icon {
            opacity: 1;
          }
        }
        
        .dropdown {
          position: relative;
          
          & > span {
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 8px;
          }
          
          .dropdown-content {
            position: absolute;
            top: 100%;
            left: 50%;
            transform: translateX(-50%) translateY(10px);
            margin-top: 10px;
            background-color: rgba(40, 40, 40, 0.95);
            backdrop-filter: blur(8px);
            border-radius: 8px;
            padding: 8px 0;
            width: 120px;
            display: none;
            flex-direction: column;
            z-index: 10;
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.08);
            opacity: 0;
            transition: all 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
            
            &:before {
              content: '';
              position: absolute;
              top: -5px;
              left: 50%;
              transform: translateX(-50%) rotate(45deg);
              width: 10px;
              height: 10px;
              background: rgba(40, 40, 40, 0.95);
              border-top: 1px solid rgba(255, 255, 255, 0.08);
              border-left: 1px solid rgba(255, 255, 255, 0.08);
            }
            
            a {
              padding: 10px 16px;
              white-space: nowrap;
              text-align: center;
              transition: all 0.25s ease;
              position: relative;
              font-size: 14px;
              
              &:after {
                display: none;
              }
              
              &:hover {
                background-color: rgba(255, 204, 0, 0.15);
                color: #ffcc00;
                transform: translateX(3px);
              }
              
              &:before {
                content: '';
                position: absolute;
                bottom: 0;
                left: 20%;
                right: 20%;
                height: 1px;
                background: rgba(255, 255, 255, 0.05);
              }
              
              &:last-child:before {
                display: none;
              }
            }
          }
          
          &:hover .dropdown-content {
            display: flex;
            opacity: 1;
            transform: translateX(-50%) translateY(5px);
          }
          
          & > span:after {
            content: '';
            position: absolute;
            width: 100%;
            height: 3px;
            bottom: -10px;
            left: 0;
            background-color: transparent;
            transition: background-color 0.3s ease, transform 0.3s ease;
            transform: scaleX(0.8);
            transform-origin: center;
          }
          
          &:hover > span:after {
            background-color: rgba(255, 204, 0, 0.7);
            transform: scaleX(1);
          }
        }
      }
    }
  }
  
  .banner {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .hero-content {
      text-align: center;
      
      .hero-title {
        font-size: 3.5rem;
        font-weight: bold;
        color: #fff;
        text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        letter-spacing: 1px;
        opacity: 0;
        transform: translateY(30px);
        animation: fadeInUp 1s forwards;
        animation-delay: 0.3s;
      }
    }
  }
}

.main {
  flex: 1;
  padding: 50px 0;
  max-width: 1120px;
  margin: 0 auto;
  width: 100%;
  
  .container {
    max-width: 900px;
    margin: 0 auto;
    padding: 0 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .section-title {
    font-size: 22px;
    margin-bottom: 25px;
    font-weight: 600;
    color: #ffffff;
    text-align: center;
    position: relative;
    margin-top: 30px;
    letter-spacing: 0.5px;
    opacity: 0;
    transform: translateY(20px);
    animation: fadeInUp 0.6s forwards;
    animation-delay: 0.1s;
    
    &:after {
      content: '';
      position: absolute;
      bottom: -8px;
      left: 50%;
      transform: translateX(-50%);
      width: 40px;
      height: 3px;
      background-color: #ffcc00;
      border-radius: 2px;
    }
  }
  
  .loading, .error {
    text-align: center;
    padding: 30px;
    font-size: 16px;
    color: #e0e0e0;
    opacity: 0;
    animation: fadeIn 0.5s forwards;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  
  .blog-list {
    display: flex;
    flex-direction: column;
    gap: 30px;
    margin-bottom: 50px;
    width: 100%;
  }
  
  .blog-card {
    display: flex;
    flex-direction: row;
    background-color: #2a2a2a;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
    cursor: pointer;
    position: relative;
    width: 780px;
    height: 300px;
    margin-bottom: 25px;
    opacity: 0;
    transform: translateY(40px);
    animation: fadeInUp 0.8s forwards;
    animation-delay: calc(0.2s * var(--i, 0));
    
    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
      
      .blog-title {
        color: #ffcc00;
      }
      
      .blog-meta > span {
        transform: translateY(-3px);
      }
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
      
      &:before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(to bottom, rgba(0,0,0,0.05), rgba(0,0,0,0.3));
        z-index: 1;
        opacity: 0.7;
        transition: opacity 0.3s ease;
      }
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
      }
    }
    
    &:hover .blog-thumbnail {
      &:before {
        opacity: 0.3;
      }
      
      img {
        transform: scale(1.05);
      }
    }
    
    .blog-info {
      padding: 20px;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      width: 100%;
      height: 100%;
      position: relative;
      
      .blog-title {
        font-size: 1.5rem;
        margin-bottom: 10px;
        color: #fff;
      }
      
      .blog-desc {
        color: #bbb;
        font-size: 0.9rem;
        line-height: 1.5;
        margin-bottom: 60px;
      }
      
      .blog-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        position: absolute;
        bottom: 20px;
        right: 20px;
      }
      
      .blog-meta > span {
        display: flex;
        align-items: center;
        padding: 4px 8px;
        background-color: rgba(40, 40, 40, 0.7);
        border-radius: 15px;
        font-size: 0.8rem;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
      }
      
      .blog-meta i {
        margin-right: 5px;
      }
      
      .blog-date {
        color: #ffcc80;
      }
      
      .blog-views {
        color: #80cbc4;
      }
      
      .blog-comments {
        color: #ce93d8;
      }
      
      .blog-category {
        color: #90caf9;
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
  background-color: #1a1a1a;
  
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
    color: #ffcc00;
    
    &:hover {
      color: #ffd633;
    }
  }
}

@media (max-width: 1200px) {
  .main .container {
    max-width: 800px;
  }
  
  .right-actions {
    right: 20px;
  }
  
  .blog-card {
    width: 700px;
    
    .blog-thumbnail {
      width: 380px;
    }
  }
}

@media (max-width: 768px) {
  .header {
    height: 60vh;
    
    .nav .menu-wrapper {
      padding: 0 15px;
      
      .menu {
        justify-content: center;
        width: 100%;
        gap: 20px;
        margin: 0 auto;
        
        .nav-link {
          font-size: 14px;
          
          .nav-icon {
            font-size: 16px;
          }
          
          &:after {
            bottom: -8px;
            height: 2px;
          }
        }
      }
      
      .right-actions {
        position: fixed;
        right: 15px;
        top: 15px;
      }
    }
    
    .banner {
      .hero-content {
        .hero-title {
          font-size: 2.5rem;
        }
      }
    }
  }
  
  .main {
    padding: 40px 0;
    
    .container {
      max-width: 95%;
    }
    
    .blog-card, .blog-card:nth-child(even) {
      width: 100%;
      height: auto;
      flex-direction: column;
      max-width: 480px;
      margin-left: auto;
      margin-right: auto;
      
      .blog-thumbnail {
        width: 100%;
        height: 220px;
      }
      
      .blog-info {
        padding: 20px;
        
        .blog-title {
          font-size: 18px;
          margin-bottom: 12px;
        }
        
        .blog-desc {
          font-size: 14px;
          -webkit-line-clamp: 2;
          margin-bottom: 15px;
        }
        
        .blog-meta {
          gap: 8px;
        }
      }
    }
  }
}

@media (max-width: 576px) {
  .header .nav .menu-wrapper {
    .menu {
      gap: 15px;
      
      .nav-link {
        font-size: 13px;
        
        .nav-icon {
          font-size: 13px;
        }
      }
    }
    
    .right-actions {
      position: fixed;
      right: 10px;
      top: 15px;
    }
  }
  
  .main .blog-card {
    .blog-thumbnail {
      height: 180px;
    }
    
    .blog-info {
      padding: 15px 20px;
      
      .blog-title {
        font-size: 17px;
      }
      
      .blog-meta {
        font-size: 12px;
        
        .blog-date, .blog-views, .blog-category {
          padding: 3px 8px;
        }
      }
    }
  }
  
  .scroll-progress {
    height: 6px;
  }
}

/* Live2D 样式 - 使用全局样式以确保外部DOM元素可以正确应用样式 */
#waifu {
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 1000;
  font-size: 0;
  transition: all 0.3s ease-in-out;
  -webkit-transform: translateY(3px);
  transform: translateY(3px);
}

#waifu:hover {
  -webkit-transform: translateY(0);
  transform: translateY(0);
}

.waifu-tool {
  display: none;
  color: #888;
  top: 50px;
  right: -10px;
  font-size: 18px;
  position: absolute;
  overflow: hidden;
  border-radius: 50%;
  
  span {
    display: block;
    cursor: pointer;
    color: #c0c0c0;
    line-height: 30px;
    text-align: center;
    margin-bottom: 5px;
    width: 30px;
    height: 30px;
    background: #3a3a3a;
    border-radius: 50%;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
  }
  
  span:hover {
    color: #ffcc00;
    background: #4a4a4a;
  }
  
  span:before {
    font-size: 18px;
    font-weight: bold;
  }
}

#waifu:hover .waifu-tool {
  display: block;
}

.fui-home:before { content: "🏠"; }
.fui-chat:before { content: "💬"; }
.fui-music:before { content: "🎵"; }
.fui-search:before { content: "🔍"; }
.fui-eye:before { content: "👁️"; }
.fui-photo:before { content: "📷"; }
.fui-info-circle:before { content: "ℹ️"; }
.fui-cross:before { content: "❌"; }

.waifu-tips {
  opacity: 0;
  width: 280px;
  max-width: 90vw;
  min-height: 80px;
  margin: -30px 20px;
  padding: 10px;
  border: 1px solid rgba(130, 130, 130, 0.62);
  border-radius: 12px;
  background-color: rgba(60, 60, 60, 0.8);
  box-shadow: 0 3px 15px 2px rgba(0, 0, 0, 0.2);
  font-size: 12px;
  font-weight: bold;
  text-overflow: ellipsis;
  overflow: hidden;
  position: absolute;
  animation-delay: 5s;
  animation-duration: 50s;
  animation-iteration-count: infinite;
  animation-name: shake;
  animation-timing-function: ease-in-out;
  color: #e0e0e0;
}

/* 聊天窗口样式 */
.waifu-chat-window {
  position: fixed;
  bottom: 20px;
  left: 300px;
  width: 350px;
  max-width: 90vw;
  height: 500px;
  max-height: 80vh;
  background: #2a2a2a;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 999;
  animation: slideUp 0.4s;
}

.chat-header {
  padding: 15px;
  background: linear-gradient(135deg, #4a4a4a, #3a3a3a);
  color: white;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-title {
  font-size: 16px;
}

.chat-close {
  cursor: pointer;
  font-size: 22px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.chat-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

.chat-messages {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  background: #333;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chat-message {
  display: flex;
  max-width: 80%;
}

.chat-message.user {
  align-self: flex-end;
}

.chat-message.ai {
  align-self: flex-start;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 10px;
  flex-shrink: 0;
}

.message-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.message-content {
  padding: 10px 14px;
  border-radius: 15px;
  background: #444;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  font-size: 14px;
  line-height: 1.4;
  color: #e0e0e0;
}

.chat-message.user .message-content {
  background: #3a3a3a;
  color: white;
  border-bottom-right-radius: 4px;
}

.chat-message.ai .message-content {
  background: #444;
  border-bottom-left-radius: 4px;
}

.chat-message.thinking .message-content {
  position: relative;
}

.chat-message.thinking .message-content:after {
  content: '';
  position: absolute;
  bottom: 8px;
  right: 12px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid rgba(0, 0, 0, 0.3);
  border-top-color: transparent;
  animation: spin 1s linear infinite;
}

.chat-input-container {
  display: flex;
  padding: 12px;
  border-top: 1px solid #444;
  background-color: #2a2a2a;
}

.chat-input {
  flex: 1;
  border: 1px solid #555;
  border-radius: 24px;
  padding: 10px 16px;
  font-size: 14px;
  outline: none;
  background-color: #3a3a3a;
  color: #e0e0e0;
}

.chat-input:focus {
  border-color: #3273dc;
  box-shadow: 0 0 0 2px rgba(50, 115, 220, 0.2);
}

.chat-send {
  margin-left: 8px;
  background: #3273dc;
  color: white;
  border: none;
  border-radius: 24px;
  padding: 0 16px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.chat-send:hover {
  background: #2c65be;
}

/* 音乐播放器样式 */
.waifu-music-player {
  position: fixed;
  bottom: 20px;
  left: 300px;
  width: 350px;
  height: 400px;
  background: #2a2a2a;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 999;
  animation: slideUp 0.4s;
}

.music-header {
  padding: 15px;
  background: linear-gradient(135deg, #4a4a4a, #3a3a3a);
  color: white;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.music-title {
  font-size: 16px;
}

.music-close {
  cursor: pointer;
  font-size: 22px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.music-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

.music-content {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: hidden;
  background-color: #333;
  color: #e0e0e0;
}

.music-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.music-cover {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.music-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.music-details {
  flex: 1;
}

.music-name {
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 5px;
  color: #e0e0e0;
}

.music-artist {
  color: #b0b0b0;
  font-size: 14px;
}

.music-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.music-progress {
  height: 4px;
  background: #555;
  border-radius: 2px;
  position: relative;
}

.progress-bar {
  position: absolute;
  height: 100%;
  width: 0%;
  background: #3273dc;
  border-radius: 2px;
}

.control-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.control-buttons span {
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.2s;
}

.control-buttons span:hover {
  background: #f0f7ff;
}

.play-button {
  background: #3273dc;
  color: white;
  border-radius: 20px;
  padding: 6px 14px;
}

.play-button:hover {
  background: #2c65be !important;
}

.music-playlist {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.playlist-title {
  font-weight: bold;
  margin-bottom: 10px;
  padding-bottom: 5px;
  border-bottom: 1px solid #555;
  color: #e0e0e0;
}

.playlist-items {
  list-style: none;
  padding: 0;
  margin: 0;
  overflow-y: auto;
  flex: 1;
}

.playlist-items li {
  padding: 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #b0b0b0;
}

.playlist-items li:hover {
  background: #3a3a3a;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes shake {
  2% {
    transform: translate(0.5px, -1.5px) rotate(-0.5deg);
  }
  4% {
    transform: translate(0.5px, 1.5px) rotate(1.5deg);
  }
  6% {
    transform: translate(1.5px, 1.5px) rotate(1.5deg);
  }
  8% {
    transform: translate(2.5px, 1.5px) rotate(0.5deg);
  }
  10% {
    transform: translate(0.5px, 2.5px) rotate(0.5deg);
  }
  /* 简化动画帧以节省空间 */
  100% {
    transform: translate(0, 0) rotate(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-10px) translateX(-50%);
  }
  to {
    opacity: 1;
    transform: translateY(0) translateX(-50%);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.right-actions {
  display: flex;
  align-items: center;
  gap: 15px;
  position: fixed;
  right: 30px;
  top: 17px;
  animation: slideInRight 0.4s ease-out;
  
  .search-container {
    position: relative;
    display: flex;
    align-items: center;
    
    .search-input {
      width: 180px;
      height: 32px;
      border: none;
      border-radius: 16px;
      padding: 0 15px;
      font-size: 14px;
      outline: none;
      background-color: rgba(255, 255, 255, 0.1);
      color: #fff;
      transition: all 0.3s ease;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      
      &::placeholder {
        color: rgba(255, 255, 255, 0.7);
      }
      
      &:focus {
        background-color: rgba(255, 255, 255, 0.15);
        width: 200px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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
      transition: all 0.25s ease;
      
      &:hover {
        background-color: rgba(255, 204, 0, 0.2);
        transform: scale(1.1);
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
    transition: all 0.25s ease;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    
    &:hover {
      border-color: rgba(255, 204, 0, 0.5);
      transform: scale(1.1);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    }
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
}
</style> 
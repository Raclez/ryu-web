<template>
  <div class="category-container">
    <header class="header">
      <div class="nav">
        <div class="logo">
          <router-link to="/">
            <img src="@/assets/images/logo.png" alt="Logo" />
          </router-link>
        </div>
        <div class="menu">
          <router-link to="/">首页</router-link>
          <div class="categories-dropdown">
            <span>分类</span>
            <div class="dropdown-content">
              <router-link 
                v-for="category in categories" 
                :key="category.id" 
                :to="`/category/${category.name}`"
              >
                {{ category.name }} ({{ category.count }})
              </router-link>
            </div>
          </div>
        </div>
        <div class="search">
          <input type="text" placeholder="搜索..." />
        </div>
      </div>
    </header>
    
    <main class="main">
      <div class="category-header">
        <h1>{{ categoryName }}</h1>
      </div>
      
      <div v-if="loading" class="loading">
        <p>加载中...</p>
      </div>
      
      <div v-else-if="error" class="error">
        <p>{{ error }}</p>
      </div>
      
      <div v-else-if="categoryBlogs.length === 0" class="empty">
        <p>暂无相关文章</p>
      </div>
      
      <div v-else class="blog-list">
        <div 
          v-for="blog in categoryBlogs" 
          :key="blog.id" 
          class="blog-card"
          @click="navigateToBlog(blog.id)"
        >
          <div class="blog-content">
            <div class="blog-meta">
              <span class="publish-date">{{ blog.date }}</span>
            </div>
            <h3 class="blog-title">{{ blog.title }}</h3>
            <p class="blog-desc">{{ blog.content }}</p>
            <div class="blog-stats">
              <span class="heat">{{ blog.heat }} 热度</span>
            </div>
          </div>
          <div class="blog-image">
            <img :src="blog.image" :alt="blog.title" />
          </div>
        </div>
      </div>
    </main>
    
    <footer class="footer">
      <div class="mascots">
        <div class="mascot left">
          <img src="@/assets/images/mascots/mascot-left.png" alt="吉祥物" />
        </div>
        <div class="mascot right">
          <img src="@/assets/images/mascots/mascot-right.png" alt="吉祥物" />
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useBlogStore } from '@/store';

const route = useRoute();
const router = useRouter();
const blogStore = useBlogStore();

const loading = ref(false);
const error = ref(null);
const categoryName = computed(() => route.params.categoryName);
const categoryBlogs = ref([]);
const categories = computed(() => blogStore.categories);

// 导航到博客详情页
const navigateToBlog = (blogId) => {
  router.push({ name: 'BlogDetail', params: { id: blogId } });
};

// 获取当前分类的博客
const fetchCategoryBlogs = async () => {
  if (!categoryName.value) return;
  
  loading.value = true;
  error.value = null;
  
  try {
    // 确保先加载所有博客
    if (blogStore.blogs.length === 0) {
      await blogStore.fetchAllBlogs();
    }
    
    // 使用本地过滤
    categoryBlogs.value = blogStore.getBlogsByCategory(categoryName.value);
  } catch (err) {
    console.error('获取分类博客失败:', err);
    error.value = '获取分类博客失败，请稍后再试';
  } finally {
    loading.value = false;
  }
};

// 监听路由参数变化
watch(() => route.params.categoryName, () => {
  fetchCategoryBlogs();
});

onMounted(async () => {
  // 加载分类
  if (blogStore.categories.length === 0) {
    await blogStore.fetchCategories();
  }
  
  // 加载当前分类博客
  await fetchCategoryBlogs();
});
</script>

<style lang="scss" scoped>
.category-container {
  min-height: 100vh;
  background-color: #2d3142;
  color: #fff;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.header {
  background-color: #383c51;
  
  .nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 50px;
    
    .logo {
      width: 40px;
      img {
        width: 100%;
      }
    }
    
    .menu {
      display: flex;
      align-items: center;
      
      a {
        color: #fff;
        text-decoration: none;
        margin: 0 15px;
        font-size: 18px;
        &:hover {
          color: #a7adc6;
        }
      }
      
      .categories-dropdown {
        position: relative;
        margin: 0 15px;
        cursor: pointer;
        
        span {
          font-size: 18px;
          &:hover {
            color: #a7adc6;
          }
        }
        
        .dropdown-content {
          display: none;
          position: absolute;
          background-color: #383c51;
          min-width: 160px;
          box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
          z-index: 1;
          border-radius: 5px;
          overflow: hidden;
          
          a {
            color: #fff;
            padding: 12px 16px;
            text-decoration: none;
            display: block;
            margin: 0;
            font-size: 16px;
            
            &:hover {
              background-color: #4b5073;
              color: white;
            }
          }
        }
        
        &:hover .dropdown-content {
          display: block;
        }
      }
    }
    
    .search {
      input {
        padding: 8px 12px;
        border-radius: 20px;
        border: none;
        background-color: rgba(255, 255, 255, 0.2);
        color: white;
        width: 200px;
        &::placeholder {
          color: rgba(255, 255, 255, 0.7);
        }
      }
    }
  }
}

.main {
  padding: 50px;
  max-width: 1200px;
  margin: 0 auto;
  
  .category-header {
    margin-bottom: 40px;
    text-align: center;
    
    h1 {
      font-size: 32px;
      position: relative;
      display: inline-block;
      
      &:after {
        content: '';
        position: absolute;
        bottom: -10px;
        left: 50%;
        transform: translateX(-50%);
        width: 50px;
        height: 3px;
        background-color: #a7adc6;
      }
    }
  }
  
  .loading, .error, .empty {
    text-align: center;
    padding: 30px;
    font-size: 18px;
    color: #a7adc6;
  }
  
  .blog-list {
    display: flex;
    flex-direction: column;
    gap: 30px;
    
    .blog-card {
      display: flex;
      background-color: #3e4259;
      border-radius: 10px;
      overflow: hidden;
      transition: transform 0.3s;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
      cursor: pointer;
      
      &:hover {
        transform: translateY(-5px);
      }
      
      .blog-content {
        flex: 2;
        padding: 25px;
        
        .blog-meta {
          margin-bottom: 15px;
          .publish-date {
            font-size: 14px;
            color: #a7adc6;
          }
        }
        
        .blog-title {
          font-size: 24px;
          margin-bottom: 10px;
        }
        
        .blog-desc {
          color: #d1d5e8;
          margin-bottom: 25px;
          line-height: 1.6;
        }
        
        .blog-stats {
          font-size: 14px;
          color: #a7adc6;
        }
      }
      
      .blog-image {
        flex: 1;
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
    }
  }
}

.footer {
  position: relative;
  padding: 50px;
  background-color: #383c51;
  min-height: 100px;
  margin-top: 50px;
  
  .mascots {
    position: absolute;
    bottom: 0;
    width: 100%;
    left: 0;
    display: flex;
    justify-content: space-between;
    
    .mascot {
      width: 150px;
      
      img {
        width: 100%;
      }
      
      &.left {
        transform: translateY(20px);
      }
      
      &.right {
        transform: translateY(40px);
      }
    }
  }
}
</style> 
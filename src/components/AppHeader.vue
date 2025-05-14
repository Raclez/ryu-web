<template>
  <header class="header" @mousemove="showNav" @mouseleave="hideNav">
    <div class="progress-bar" :style="{ width: `${scrollProgress}%` }"></div>
    <div class="nav" :class="{ 'visible': isNavVisible }" :style="{
      'background-color': isMobile ? 'transparent' : `rgba(28, 28, 28, ${navOpacity})`,
      'backdrop-filter': isMobile ? 'none' : `blur(${navOpacity * 10}px)`,
    }">
      <div class="menu-wrapper">
        <div class="menu">
          <router-link :style="{'--i': 0}" class="nav-link" to="/">
            <i class="nav-icon">🏠</i>
            <span>首页</span>
          </router-link>
          <div class="dropdown">
            <span :style="{'--i': 1}" class="nav-link">
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
          <router-link :style="{'--i': 2}" class="nav-link" to="/backend">
            <i class="nav-icon">💻</i>
            <span>后端学习</span>
          </router-link>
        </div>

        <div class="right-actions">
          <div class="search-container">
            <input v-if="showSearchInput"
              class="search-input"
              placeholder="搜索..."
              type="text"
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
    <div v-if="showBanner" :style="bannerStyle" class="banner">
      <div class="hero-content">
        <h1 v-if="bannerTitle" class="hero-title">{{ bannerTitle }}</h1>
        <slot name="banner-content"></slot>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import {computed, onBeforeUnmount, onMounted, ref} from 'vue';

const props = defineProps({
  categories: {
    type: Array as () => { id: string, name: string }[],
    default: () => []
  },
  showBanner: {
    type: Boolean,
    default: false
  },
  bannerTitle: {
    type: String,
    default: ''
  },
  bannerImage: {
    type: String,
    default: '@/assets/images/banner.jpg'
  },
  bannerHeight: {
    type: String,
    default: '100vh'
  }
});

const bannerStyle = computed(() => {
  return {
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${props.bannerImage})`,
    height: props.bannerHeight
  };
});

const isNavVisible = ref<boolean>(false);
const showSearchInput = ref<boolean>(false);
const searchQuery = ref<string>('');
const searchInput = ref<HTMLInputElement | null>(null);
const scrollY = ref<number>(0);
const scrollProgress = ref<number>(0);
const isMobile = ref<boolean>(false);
const navOpacity = computed(() => {
  // 根据滚动位置计算导航栏透明度
  if (scrollY.value < 50) return 0.35; // 顶部时半透明
  if (scrollY.value > 200) return 0.75; // 滚动200px后更不透明
  return 0.35 + (scrollY.value - 50) / 150 * 0.4; // 在50-200px之间线性变化
});

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

// 检测是否为移动设备
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768;
};

// 监听滚动事件
const handleScroll = (): void => {
  scrollY.value = window.scrollY;

  // 计算滚动进度
  const scrollPosition = window.scrollY;
  const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
  scrollProgress.value = (scrollPosition / documentHeight) * 100 || 0;

  // 当用户滚动页面时自动显示导航栏
  if (scrollY.value > 100) {
    isNavVisible.value = true;
  }
};

// 显示搜索输入框
const toggleSearchInput = (): void => {
  showSearchInput.value = !showSearchInput.value;
  if (showSearchInput.value && searchInput.value) {
    // 下一个微任务中聚焦搜索框
    setTimeout(() => {
      searchInput.value?.focus();
    }, 0);
  }
};

// 隐藏搜索输入框
const hideSearchInput = (): void => {
  showSearchInput.value = false;
};

// 执行搜索
const performSearch = (): void => {
  // 实现搜索逻辑
  console.log('搜索查询:', searchQuery.value);
  hideSearchInput();
};

onMounted(() => {
  // 添加滚动监听
  window.addEventListener('scroll', handleScroll);

  // 检测移动设备
  checkMobile();
  window.addEventListener('resize', checkMobile);

  // 初始化滚动进度
  handleScroll();
});

onBeforeUnmount(() => {
  // 移除滚动监听
  window.removeEventListener('scroll', handleScroll);
  window.removeEventListener('resize', checkMobile);
});
</script>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap');

.progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  background: linear-gradient(90deg, rgba(255, 204, 0, 1) 0%, rgba(254, 95, 85, 1) 100%);
  z-index: 1000;
  transition: width 0.1s;
}

.header {
  position: relative;
  z-index: 100;

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
      max-width: 1120px;
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
    position: relative;
    background-size: cover;
    background-position: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .hero-content {
      text-align: center;
      padding: 0 20px;

      .hero-title {
        font-size: 4rem;
        font-weight: normal;
        color: #fff;
        text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        letter-spacing: 2px;
        opacity: 0;
        transform: translateY(30px);
        animation: fadeInUp 1s forwards;
        animation-delay: 0.3s;
        font-family: 'Dancing Script', cursive;
      }
    }
  }
}

.right-actions {
  display: flex;
  align-items: center;
  gap: 15px;
  position: fixed;
  right: 30px;
  top: 17px;
  opacity: 0;
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
      animation: fadeIn 0.3s forwards;

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

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
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

@media (max-width: 768px) {
  .header {
    background-color: transparent !important;
    backdrop-filter: none !important;
    box-shadow: none !important;
    border-bottom: none !important;

    .nav {
      background-color: transparent !important;
      backdrop-filter: none !important;
      box-shadow: none !important;
      border: none !important;
    }

    .banner {
      height: 200px !important;

      .hero-content {
        .hero-title {
          font-size: 2.2rem;
          margin-top: 50px;
        }
      }
    }

    .right-actions {
      z-index: 1001; // 增加z-index确保在更高层级

      .avatar {
        display: block !important;
        background-color: transparent !important;

        img {
          background-color: transparent !important;
        }
      }

      .search-container {
        display: none;
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

  .banner .hero-title {
    font-size: 1.8rem !important;
  }
}
</style>

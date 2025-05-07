<template>
  <div class="mobile-menu">
    <div
        :class="{ 'active': isOpen }"
        class="hamburger"
        @click="toggleMenu"
    >
      <span></span>
      <span></span>
      <span></span>
    </div>

    <div :class="{ 'active': isOpen }" class="mobile-menu-overlay" @click="closeMenu"></div>

    <div :class="{ 'active': isOpen }" class="mobile-menu-content">
      <div class="mobile-menu-header">
        <div class="logo-container">
          <img alt="头像" class="menu-avatar" src="@/assets/images/avatar.png"/>
          <div class="menu-logo">Ryu's Blog</div>
        </div>
        <div class="close-btn" @click="closeMenu">×</div>
      </div>

      <div class="mobile-nav">
        <router-link class="mobile-nav-item" to="/" @click="closeMenu">
          <i class="mobile-nav-icon">🏠</i>
          <span>首页</span>
        </router-link>

        <div class="mobile-dropdown">
          <div class="mobile-nav-item dropdown-toggle" @click="toggleCategoryDropdown">
            <i class="mobile-nav-icon">📂</i>
            <span>分类</span>
          </div>

          <div :class="{ 'active': isCategoryOpen }" class="mobile-dropdown-content">
            <router-link
                v-for="category in categories"
                :key="category.id"
                :to="`/category/${category.name}`"
                class="mobile-dropdown-item"
                @click="closeMenu"
            >
              {{ category.name }}
            </router-link>
          </div>
        </div>

        <router-link class="mobile-nav-item" to="/backend" @click="closeMenu">
          <i class="mobile-nav-icon">💻</i>
          <span>后端学习</span>
        </router-link>

        <router-link class="mobile-nav-item" to="/category" @click="closeMenu">
          <i class="mobile-nav-icon">🗂️</i>
          <span>全部分类</span>
        </router-link>

        <router-link class="mobile-nav-item" to="/about" @click="closeMenu">
          <i class="mobile-nav-icon">👋</i>
          <span>关于我</span>
        </router-link>
      </div>

      <div class="mobile-search">
        <input
            v-model="searchQuery"
            class="mobile-search-input"
            placeholder="搜索..."
            type="text"
            @keyup.enter="performSearch"
        />
        <div class="mobile-search-btn" @click="performSearch">
          <i class="search-icon">🔍</i>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue';
import {useRouter} from 'vue-router';

const props = defineProps({
  categories: {
    type: Array as () => { id: string, name: string }[],
    default: () => []
  }
});

const router = useRouter();
const isOpen = ref(false);
const isCategoryOpen = ref(false);
const searchQuery = ref('');

// 切换菜单显示状态
const toggleMenu = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    document.body.style.overflow = 'hidden'; // 禁止背景滚动
  } else {
    document.body.style.overflow = ''; // 恢复背景滚动
  }
};

// 关闭菜单
const closeMenu = () => {
  isOpen.value = false;
  isCategoryOpen.value = false;
  document.body.style.overflow = '';
};

// 切换分类下拉菜单
const toggleCategoryDropdown = () => {
  isCategoryOpen.value = !isCategoryOpen.value;
};

// 执行搜索
const performSearch = () => {
  if (searchQuery.value) {
    // 实现搜索逻辑
    console.log('移动端搜索:', searchQuery.value);
    // 关闭菜单
    closeMenu();
  }
};
</script>

<style lang="scss" scoped>
.mobile-menu {
  display: none;

  @media (max-width: 768px) {
    display: block;
  }

  .hamburger {
    position: fixed;
    top: 15px;
    left: 15px;
    width: 30px;
    height: 25px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    cursor: pointer;
    z-index: 1001;
    background-color: transparent;

    span {
      display: block;
      height: 3px;
      width: 100%;
      background-color: #fff;
      border-radius: 3px;
      transition: all 0.3s ease;
    }

    &.active {
      opacity: 0; // 当菜单打开时隐藏汉堡按钮
      visibility: hidden;
    }
  }

  .mobile-menu-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 999;
    visibility: hidden;
    opacity: 0;
    transition: opacity 0.3s ease;
    backdrop-filter: blur(3px);

    &.active {
      visibility: visible;
      opacity: 1;
    }
  }

  .mobile-menu-content {
    position: fixed;
    top: 0;
    left: -280px;
    width: 280px;
    height: 100%;
    background-color: #222;
    z-index: 1000;
    transition: left 0.3s ease;
    display: flex;
    flex-direction: column;
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.2);

    &.active {
      left: 0;
    }

    .mobile-menu-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 15px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);

      .logo-container {
        display: flex;
        align-items: center;
        gap: 10px;

        .menu-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
        }

        .menu-logo {
          color: #ffcc00;
          font-weight: bold;
          font-size: 16px;
        }
      }

      .close-btn {
        color: #fff;
        font-size: 24px;
        cursor: pointer;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.1);
        transition: all 0.3s ease;

        &:hover {
          background-color: rgba(255, 204, 0, 0.2);
          color: #ffcc00;
        }
      }
    }

    .mobile-nav {
      flex: 1;
      padding: 15px;
      overflow-y: auto;

      .mobile-nav-item {
        display: flex;
        align-items: center;
        padding: 15px 10px;
        color: #fff;
        border-radius: 6px;
        margin-bottom: 10px;
        cursor: pointer;
        transition: background-color 0.3s ease;

        &:hover, &.router-link-active {
          background-color: rgba(255, 204, 0, 0.15);
          color: #ffcc00;
        }

        .mobile-nav-icon {
          margin-right: 15px;
          font-size: 20px;
        }

        .dropdown-arrow {
          margin-left: auto;
          font-size: 12px;
          transition: transform 0.3s ease;

          &.open {
            transform: rotate(180deg);
          }
        }
      }

      .mobile-dropdown {
        .mobile-dropdown-content {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease;

          &.active {
            max-height: 300px;
          }

          .mobile-dropdown-item {
            display: block;
            padding: 12px 15px 12px 45px;
            color: #ccc;
            border-radius: 6px;
            margin-bottom: 5px;
            background-color: rgba(255, 255, 255, 0.05);

            &:hover, &.router-link-active {
              background-color: rgba(255, 204, 0, 0.1);
              color: #ffcc00;
            }
          }
        }
      }
    }

    .mobile-search {
      padding: 15px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;

      .mobile-search-input {
        flex: 1;
        background-color: rgba(255, 255, 255, 0.1);
        border: none;
        color: #fff;
        padding: 10px 15px;
        border-radius: 4px 0 0 4px;

        &::placeholder {
          color: #aaa;
        }

        &:focus {
          outline: none;
        }
      }

      .mobile-search-btn {
        background-color: #ffcc00;
        color: #222;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        border-radius: 0 4px 4px 0;
        cursor: pointer;
      }
    }
  }
}
</style>

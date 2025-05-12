<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-info">
          <div class="logo">Ryu's Blog</div>
          <p class="footer-desc">记录学习与生活的美好瞬间</p>
          <div class="social-icons">
            <a class="social-icon" href="https://github.com/ryu" target="_blank" title="GitHub">
              <i class="social-github">🐙</i>
            </a>
            <a class="social-icon" href="https://weibo.com/ryu" target="_blank" title="微博">
              <i class="social-weibo">📱</i>
            </a>
            <a class="social-icon" href="https://twitter.com/ryu" target="_blank" title="Twitter">
              <i class="social-twitter">🐦</i>
            </a>
            <a class="social-icon" href="mailto:ryu@example.com" title="邮箱">
              <i class="social-email">📧</i>
            </a>
          </div>
        </div>

        <div class="footer-links">
          <div class="link-group">
            <h4>导航</h4>
            <router-link to="/">首页</router-link>
            <router-link to="/categories">分类</router-link>
            <router-link to="/about">关于</router-link>
          </div>
          <div class="link-group">
            <h4>技术栈</h4>
            <a href="https://vuejs.org/" target="_blank">Vue.js</a>
            <a href="https://www.typescriptlang.org/" target="_blank">TypeScript</a>
            <a href="https://vitejs.dev/" target="_blank">Vite</a>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <div class="copyright">
          © {{ currentYear }} Ryu's Blog
        </div>
        <div class="divider">·</div>
        <div class="icp">
          <a href="https://beian.miit.gov.cn/" target="_blank">鄂ICP备2024072949号</a>
        </div>
        <div class="divider">·</div>
        <div class="powered-by">
          Made with <span class="heart">❤️</span> by Ryu
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import {computed} from 'vue';

// 计算当前年份
const currentYear = computed(() => new Date().getFullYear());
</script>

<style lang="scss" scoped>
.footer {
  background-color: #1c1c1c;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding: 40px 0 30px;
  margin-top: auto;
  color: #e0e0e0;

  .container {
    width: 100%;
    max-width: 1000px;
    margin: 0 auto;
    padding: 0 20px;
    box-sizing: border-box;
  }

  .footer-content {
    display: flex;
    justify-content: space-between;
    margin-bottom: 30px;

    @media (max-width: 768px) {
      flex-direction: column;
      gap: 30px;
    }

    .footer-info {
      max-width: 280px;

      .logo {
        font-size: 24px;
        font-weight: 700;
        margin-bottom: 12px;
        color: #ffcc00;
        font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif;
        letter-spacing: -0.5px;
      }

      .footer-desc {
        color: rgba(255, 255, 255, 0.6);
        line-height: 1.5;
        margin-bottom: 20px;
        font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif;
        font-size: 14px;
        letter-spacing: -0.2px;
      }

      .social-icons {
        display: flex;
        gap: 14px;

        .social-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          background-color: rgba(255, 255, 255, 0.05);
          border-radius: 50%;
          color: rgba(255, 255, 255, 0.7);
          transition: all 0.3s ease;

          &:hover {
            background-color: #ffcc00;
            color: #1c1c1c;
            transform: translateY(-3px);
          }

          i {
            font-size: 16px;
          }
        }
      }
    }

    .footer-links {
      display: flex;
      gap: 80px;

      @media (max-width: 576px) {
        gap: 40px;
      }

      .link-group {
        h4 {
          font-size: 15px;
          font-weight: 600;
          margin-bottom: 15px;
          color: rgba(255, 255, 255, 0.9);
          position: relative;
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif;
          letter-spacing: -0.3px;
        }

        a {
          display: block;
          margin-bottom: 10px;
          color: rgba(255, 255, 255, 0.5);
          transition: all 0.2s ease;
          font-size: 14px;
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif;
          letter-spacing: -0.2px;

          &:hover {
            color: #ffcc00;
            transform: translateX(3px);
          }
        }
      }
    }
  }

  .footer-bottom {
    display: flex;
    align-items: center;
    justify-content: center;
    padding-top: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif;
    letter-spacing: -0.2px;
    flex-wrap: wrap;
    gap: 5px;

    .copyright, .icp, .powered-by {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.4);
    }

    .divider {
      color: rgba(255, 255, 255, 0.3);
      margin: 0 3px;
    }

    a {
      color: rgba(255, 255, 255, 0.4);
      transition: color 0.2s ease;

      &:hover {
        color: #ffcc00;
      }
    }

    .heart {
      display: inline-block;
      color: #ff6b6b;
      font-size: 12px;
      margin: 0 2px;
      animation: heartbeat 1.5s infinite;
    }
  }
}

@keyframes heartbeat {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

@media (max-width: 576px) {
  .footer {
    padding: 30px 0 20px;

    .footer-bottom {
      flex-direction: column;
      gap: 8px;

      .divider {
        display: none;
      }
    }
  }
}
</style>

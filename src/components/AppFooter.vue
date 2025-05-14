<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-bottom">
        <div class="logo">
          <span>RYU</span>
        </div>
        <div class="footer-item copyright">
          © {{ currentYear }} Ryu's Blog
        </div>
        <div class="footer-item icp">
          <a href="https://beian.miit.gov.cn/" target="_blank">鄂ICP备2024072949号</a>
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
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding: 40px 0;
  margin-top: auto;
  color: #e0e0e0;

  .container {
    width: 100%;
    max-width: 1000px;
    margin: 0 auto;
    padding: 0 20px;
    box-sizing: border-box;
  }

  .footer-bottom {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    gap: 16px;

    .logo {
      font-size: 26px;
      font-weight: 700;
      color: #ffcc00;
      font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;
      letter-spacing: 1px;
      margin-bottom: 6px;

      span {
        position: relative;

        &:after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, rgba(255, 204, 0, 0) 0%, rgba(255, 204, 0, 1) 50%, rgba(255, 204, 0, 0) 100%);
        }
      }
    }

    .footer-item {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.6);
      font-family: 'Noto Sans SC', -apple-system, BlinkMacSystemFont, sans-serif;
      letter-spacing: 0.2px;
      transition: all 0.3s ease;
      padding: 4px 0;

      &.copyright {
        font-weight: 500;
        font-size: 15px;
        color: rgba(255, 255, 255, 0.7);
      }

      &:hover {
        color: rgba(255, 255, 255, 0.9);
      }
    }

    a {
      color: rgba(255, 255, 255, 0.6);
      transition: all 0.3s ease;
      position: relative;
      padding-bottom: 1px;

      &:after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 50%;
        width: 0;
        height: 1px;
        background-color: #ffcc00;
        transition: all 0.3s ease;
        transform: translateX(-50%);
      }

      &:hover {
        color: #ffcc00;

        &:after {
          width: 100%;
        }
      }
    }

    .heart {
      display: inline-block;
      color: #ff6b6b;
      font-size: 14px;
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

@media (max-width: 768px) {
  .footer {
    padding: 30px 0;

    .footer-bottom {
      gap: 12px;

      .logo {
        font-size: 24px;
      }
    }
  }
}
</style>

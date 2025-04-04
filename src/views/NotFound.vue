<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <div class="error-code">404</div>
      <h1 class="title">页面未找到</h1>
      <p class="description">抱歉，您访问的页面不存在或已被移除</p>
      <router-link to="/" class="home-button">
        返回首页
      </router-link>
    </div>
    
    <div class="mascots">
      <div class="mascot left">
        <img src="@/assets/images/mascots/mascot-left.png" alt="吉祥物" />
      </div>
      <div class="mascot right">
        <img src="@/assets/images/mascots/mascot-right.png" alt="吉祥物" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 404 页面不需要任何复杂逻辑
</script>

<style lang="scss" scoped>
.not-found-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #2d3142;
  color: #fff;
  padding: 20px;
  position: relative;
  overflow: hidden;
  
  .not-found-content {
    text-align: center;
    z-index: 1;
    
    .error-code {
      font-size: 150px;
      font-weight: bold;
      line-height: 1;
      color: #4b5073;
      text-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
      margin-bottom: 30px;
    }
    
    .title {
      font-size: 36px;
      margin-bottom: 15px;
    }
    
    .description {
      font-size: 18px;
      color: #a7adc6;
      margin-bottom: 30px;
    }
    
    .home-button {
      display: inline-block;
      padding: 12px 30px;
      background-color: #4b5073;
      color: white;
      text-decoration: none;
      border-radius: 30px;
      font-size: 16px;
      transition: all 0.3s;
      
      &:hover {
        background-color: #5d6392;
        transform: translateY(-3px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
      }
    }
  }
  
  .mascots {
    position: absolute;
    bottom: 0;
    width: 100%;
    display: flex;
    justify-content: space-between;
    pointer-events: none;
    
    .mascot {
      width: 200px;
      
      img {
        width: 100%;
      }
      
      &.left {
        transform: translateY(50px);
      }
      
      &.right {
        transform: translateY(30px);
      }
    }
  }
}

@media (max-width: 768px) {
  .not-found-container {
    .not-found-content {
      .error-code {
        font-size: 100px;
      }
      
      .title {
        font-size: 28px;
      }
    }
    
    .mascots {
      .mascot {
        width: 120px;
      }
    }
  }
}
</style> 
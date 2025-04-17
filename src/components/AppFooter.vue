<template>
  <footer class="footer">
    <div class="container">
      <!-- <div class="footer-content"> -->
        <!-- <div class="footer-info">
          <div class="logo">Ryu's Blog</div>
          <p class="footer-desc">记录学习与生活的美好瞬间</p>
        </div>
        <div class="footer-links">
          <div class="link-group">
            <h4>导航</h4>
            <router-link to="/">首页</router-link>
            <router-link to="/categories">分类</router-link>
            <router-link to="/about">关于</router-link>
          </div>
          <div class="link-group">
            <h4>社交媒体</h4>
            <a href="#" target="_blank">GitHub</a>
            <a href="#" target="_blank">微博</a>
            <a href="#" target="_blank">知乎</a>
          </div>
          <div class="link-group">
            <h4>友情链接</h4>
            <a href="https://halo.run/" target="_blank">Halo</a>
            <a href="https://lixingyong.com/" target="_blank">LIlGG</a>
          </div>
        </div> -->
      <!-- </div> -->
      <div class="copyright">
        © {{ new Date().getFullYear() }} Ryu
      </div>
      <div class="icp">
        鄂ICP备2024072949号
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
// 页脚组件不需要额外的逻辑
</script>

<style lang="scss" scoped>
.footer {
  background-color: #fff;
  border-top: 1px solid #eee;
  padding: 50px 0 20px;
  margin-top: auto;
  
  .container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 15px;
    box-sizing: border-box;
  }
  
  .footer-content {
    display: flex;
    justify-content: space-between;
    margin-bottom: 40px;
    
    @media (max-width: 768px) {
      flex-direction: column;
      gap: 30px;
    }
    
    .footer-info {
      max-width: 300px;
      
      .logo {
        font-size: 22px;
        font-weight: 700;
        margin-bottom: 10px;
        color: #333;
      }
      
      .footer-desc {
        color: #777;
        line-height: 1.6;
      }
    }
    
    .footer-links {
      display: flex;
      gap: 60px;
      
      @media (max-width: 576px) {
        flex-wrap: wrap;
        gap: 30px;
      }
      
      .link-group {
        h4 {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 15px;
          color: #333;
        }
        
        a {
          display: block;
          margin-bottom: 10px;
          color: #777;
          transition: all 0.2s ease;
          
          &:hover {
            color: #ffcc00;
            transform: translateX(3px);
          }
        }
      }
    }
  }
  
  .copyright {
    text-align: center;
    padding-top: 20px;
    border-top: 1px solid #eee;
    font-size: 14px;
    color: #777;
    margin-bottom: 10px;
  }
  
  .icp {
    text-align: center;
    font-size: 12px;
    color: #999;
  }
}
</style> 
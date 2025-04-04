<template>
  <div class="blog-detail-container">
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
    </header>
    
    <div v-if="loading" class="loading">
      <p>加载中...</p>
    </div>
    
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
    </div>
    
    <template v-else-if="blog">
      <div class="blog-header">
        <div class="container">
          <h1 class="blog-title">{{ blog.title }}</h1>
          <div class="blog-meta">
            <div class="category">{{ blog.category }}</div>
            <div class="date">{{ formatDate(blog.createTime) }}</div>
          </div>
        </div>
      </div>
      
      <main class="blog-content">
        <div class="container">
          <article class="article-content" v-html="blog.content"></article>
          
          <div class="post-tags" v-if="blog.tags && blog.tags.length">
            <span class="tag-item" v-for="(tag, index) in blog.tags" :key="index">
              {{ tag }}
            </span>
          </div>
          
          <div class="author-info">
            <div class="avatar">
              <img :src="blog.author?.avatar" :alt="blog.author?.name" />
            </div>
            <div class="author-details">
              <div class="name">{{ blog.author?.name || 'Ryu' }}</div>
              <div class="bio">{{ blog.author?.bio || '博客作者' }}</div>
            </div>
          </div>
          
          <div class="related-posts" v-if="relatedBlogs && relatedBlogs.length">
            <h3 class="related-title">相关文章</h3>
            <div class="related-list">
              <div 
                v-for="related in relatedBlogs" 
                :key="related.id" 
                class="related-item"
                @click="navigateToBlog(related.id)"
              >
                <div class="related-image">
                  <img :src="related.image" :alt="related.title" />
                </div>
                <div class="related-info">
                  <h4>{{ related.title }}</h4>
                  <div class="related-meta">
                    <span>{{ related.category }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="comments-section">
            <h3 class="comments-title">评论</h3>
            
            <div class="comment-form">
              <textarea placeholder="发表你的评论..." v-model="commentText"></textarea>
              <button @click="submitComment">提交评论</button>
            </div>
            
            <div class="comments-list" v-if="blog.comments && blog.comments.length > 0">
              <div v-for="comment in blog.comments" :key="comment.id" class="comment-item">
                <div class="comment-avatar">
                  <img :src="comment.user.avatar" :alt="comment.user.name" />
                </div>
                <div class="comment-content">
                  <div class="comment-header">
                    <span class="comment-author">{{ comment.user.name }}</span>
                    <span class="comment-date">{{ formatDate(comment.createTime) }}</span>
                  </div>
                  <div class="comment-text">{{ comment.content }}</div>
                </div>
              </div>
            </div>
            
            <div class="no-comments" v-else>
              <p>暂无评论，成为第一个评论的人吧！</p>
            </div>
          </div>
        </div>
      </main>
    </template>
    
    <div id="live2d-container" class="live2d-container" :class="{ 'active': showAiMenu }">
      <div id="live2d-widget" style="border: 1px solid red; min-height: 300px; min-width: 200px;"></div>
      <div class="live2d-speech-bubble" v-if="showAiSpeechBubble">
        <div class="bubble-content">{{ currentAiMessage }}</div>
      </div>
      <div class="live2d-menu" v-if="showAiMenu">
        <div class="menu-item" @click.stop="startChat">
          <i class="menu-icon">💬</i>
          <span class="menu-text">聊天助手</span>
        </div>
        <div class="menu-item" @click.stop="playMusic">
          <i class="menu-icon">🎵</i>
          <span class="menu-text">播放音乐</span>
        </div>
        <div class="menu-item" @click.stop="searchContent">
          <i class="menu-icon">🔍</i>
          <span class="menu-text">搜索内容</span>
        </div>
        <div class="menu-item" @click.stop="askDeepSeek">
          <i class="menu-icon">🤖</i>
          <span class="menu-text">DeepSeek AI</span>
        </div>
        <div class="menu-item" @click.stop="toggleSpeechBubble">
          <i class="menu-icon">💭</i>
          <span class="menu-text">{{ showAiSpeechBubble ? '关闭提示' : '显示提示' }}</span>
        </div>
      </div>
      <audio ref="audioPlayer" class="audio-player"></audio>
    </div>
    
    <div class="ai-chat-modal" v-if="showChatModal">
      <div class="chat-container">
        <div class="chat-header">
          <div class="chat-title">
            <img src="@/assets/images/mascots/mascot-left.png" alt="AI" class="title-avatar" />
            <span>AI 助手</span>
          </div>
          <div class="chat-close" @click="closeChat">×</div>
        </div>
        <div class="chat-messages" ref="chatMessages">
          <div 
            v-for="(message, index) in chatMessages" 
            :key="index" 
            :class="['chat-message', message.type]"
          >
            <div class="message-avatar" v-if="message.type === 'ai'">
              <img src="@/assets/images/mascots/mascot-left.png" alt="AI" />
            </div>
            <div class="message-content">{{ message.content }}</div>
          </div>
        </div>
        <div class="chat-input">
          <input 
            type="text" 
            v-model="chatInput" 
            placeholder="输入你想问的问题..." 
            @keyup.enter="sendMessage"
          />
          <button @click="sendMessage">发送</button>
        </div>
      </div>
    </div>
    
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
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useBlogStore } from '@/store';
import type { Blog, Comment } from '@/api';
// @ts-ignore
import Live2DWidget from 'live2d-widget';

const route = useRoute();
const router = useRouter();
const blogStore = useBlogStore();

const loading = ref<boolean>(true);
const error = ref<string | null>(null);
const blog = ref<Blog | null>(null);
const commentText = ref<string>('');
const relatedBlogs = ref<Blog[]>([]);
const isNavVisible = ref<boolean>(false);
const showAiMenu = ref<boolean>(false);
const categories = computed(() => blogStore.categories);
const showAiSpeechBubble = ref<boolean>(false);
const currentAiMessage = ref<string>('有什么我能帮你的吗?');
const audioPlayer = ref<HTMLAudioElement | null>(null);
const showChatModal = ref<boolean>(false);
const chatMessages = ref<Array<{ type: string; content: string }>>([
  { type: 'ai', content: '你好！我是你的AI助手，有什么可以帮到你的吗？' }
]);
const chatInput = ref<string>('');
const chatMessages$ = ref<HTMLElement | null>(null);
const isUsingDeepseek = ref<boolean>(false);
const isProcessingAI = ref<boolean>(false);
const live2dWidget = ref<any>(null);
const showSearchInput = ref<boolean>(false);
const searchQuery = ref<string>('');
const searchInput = ref<HTMLInputElement | null>(null);

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

// 显示导航栏
const showNav = (): void => {
  isNavVisible.value = true;
};

// 隐藏导航栏
const hideNav = (): void => {
  isNavVisible.value = false;
};

// Live2D初始化
const initLive2DWidget = (): void => {
  try {
    console.log('开始加载Live2D...');
    
    // 创建script元素
    const script = document.createElement('script');
    script.src = 'https://fastly.jsdelivr.net/gh/stevenjoezhang/live2d-widget@latest/autoload.js';
    
    // 设置全局变量配置
    window.live2d_path = 'https://fastly.jsdelivr.net/gh/stevenjoezhang/live2d-widget@latest/';
    window.live2d_settings = {
      modelId: 6,               // 设置默认模型为haruto
      modelTexturesId: 0,       // 默认材质ID
      modelStorage: false,      // 不储存模型ID
      waifuSize: '280x250',     // 看板娘大小
      waifuTipsSize: '250x70',  // 提示框大小
      waifuFontSize: '12px',    // 提示框字体
      waifuToolFont: '14px',    // 工具栏字体
      waifuToolLine: '20px',    // 工具栏行高
      waifuToolTop: '0px',      // 工具栏顶部边距
      waifuDraggable: 'unlimited', // 拖拽样式
      waifuDraggableRevert: true, // 松开鼠标还原拖拽位置
      homePageUrl: '/',         // 主页链接
      showToolMenu: true,       // 显示工具栏
      canCloseLive2d: true,     // 显示关闭按钮
      canSwitchModel: true,     // 显示模型切换
      canSwitchTextures: true,  // 显示材质切换
      canSwitchHitokoto: true,  // 显示一言切换
      canTakeScreenshot: true,  // 显示看板娘截图
      canTurnToHomePage: true,  // 显示返回主页
      canTurnToAboutPage: true, // 显示关于页
      modelAPI: 'https://unpkg.com/live2d-widget-model-haruto@1.0.5/assets/haruto.model.json',
      tipsMessage: 'waifu-tips.json',         // 同目录下可省略路径
      hitokotoAPI: 'hitokoto.cn'              // 一言API
    } as any; // 使用类型断言解决TS类型问题
    
    // 添加到文档
    document.body.appendChild(script);
    
    console.log('Live2D脚本加载成功');
  } catch (error) {
    console.error('Live2D加载失败:', error);
  }
};

// 请求DeepSeek API
const askDeepSeek = async (event: Event): Promise<void> => {
  event.stopPropagation();
  isUsingDeepseek.value = true;
  startChat(event);
  currentAiMessage.value = '已切换到DeepSeek AI模式';
};

// 切换AI助手菜单
const toggleAiMenu = (): void => {
  showAiMenu.value = !showAiMenu.value;
  if (showAiMenu.value) {
    currentAiMessage.value = '需要我做什么?';
  } else {
    currentAiMessage.value = '你要干嘛?';
  }
};

// 切换对话气泡
const toggleSpeechBubble = (event: Event): void => {
  event.stopPropagation();
  showAiSpeechBubble.value = !showAiSpeechBubble.value;
};

// 开始聊天
const startChat = (event: Event): void => {
  event.stopPropagation();
  showChatModal.value = true;
  showAiMenu.value = false;
  
  // 滚动到底部
  nextTick(() => {
    scrollChatToBottom();
  });
};

// 关闭聊天
const closeChat = (): void => {
  showChatModal.value = false;
  isUsingDeepseek.value = false;
};

// 滚动聊天窗口到底部
const scrollChatToBottom = (): void => {
  if (chatMessages$.value) {
    chatMessages$.value.scrollTop = chatMessages$.value.scrollHeight;
  }
};

// 模拟DeepSeek API调用
const callDeepSeekAPI = async (prompt: string): Promise<string> => {
  // 这里是模拟API调用，实际项目中替换为真实的DeepSeek API调用
  console.log('调用DeepSeek API，提问:', prompt);
  
  // 模拟API延迟
  return new Promise((resolve) => {
    setTimeout(() => {
      // 根据问题关键词生成不同响应
      if (prompt.includes('你好') || prompt.includes('hi')) {
        resolve('你好！我是基于DeepSeek的AI助手，很高兴为你服务。');
      } else if (prompt.includes('天气')) {
        resolve('我无法获取实时天气信息，但我可以帮你解答技术问题或提供其他信息。如果需要天气信息，建议查看专业天气APP或网站。');
      } else if (prompt.includes('代码') || prompt.includes('编程')) {
        resolve('关于编程问题，我可以提供帮助。DeepSeek模型对编程领域有很好的理解。请详细描述你遇到的问题，包括使用的编程语言和具体场景。');
      } else if (prompt.includes('博客') || prompt.includes('文章')) {
        resolve(`我注意到你正在阅读"${blog.value?.title}"这篇博客。这是一篇很有见解的文章！如果你对文章内容有任何问题，我很乐意解答。`);
      } else if (prompt.includes('什么是') || prompt.includes('如何')) {
        resolve('这是一个很好的问题。DeepSeek模型擅长解释概念和提供指导。让我为你详细分析一下这个问题...');
      } else {
        resolve('感谢你的问题。作为一个基于DeepSeek的AI助手，我尽力提供准确的回答。你可以问我关于技术、科学、历史或其他领域的问题，我会基于我的知识库给你解答。');
      }
    }, 2000);
  });
};

// 播放音乐
const playMusic = (event: Event): void => {
  event.stopPropagation();
  if (audioPlayer.value) {
    if (audioPlayer.value.paused) {
      audioPlayer.value.src = 'https://music.163.com/song/media/outer/url?id=1824045033.mp3';
      audioPlayer.value.play();
      currentAiMessage.value = '正在播放音乐...';
    } else {
      audioPlayer.value.pause();
      currentAiMessage.value = '音乐已暂停';
    }
  }
};

// 发送消息
const sendMessage = async (): Promise<void> => {
  if (!chatInput.value.trim() || isProcessingAI.value) return;
  
  // 添加用户消息
  chatMessages.value.push({
    type: 'user',
    content: chatInput.value
  });
  
  const userMessage = chatInput.value;
  chatInput.value = '';
  
  // 滚动到底部
  nextTick(() => {
    scrollChatToBottom();
  });
  
  // 处理回复
  if (isUsingDeepseek.value) {
    // 调用DeepSeek AI
    isProcessingAI.value = true;
    
    // 显示思考状态
    chatMessages.value.push({
      type: 'ai',
      content: '思考中...'
    });
    
    // 滚动到底部
    nextTick(() => {
      scrollChatToBottom();
    });
    
    try {
      // 调用DeepSeek API
      const aiResponse = await callDeepSeekAPI(userMessage);
      
      // 移除思考消息
      chatMessages.value.pop();
      
      // 添加AI回复
      chatMessages.value.push({
        type: 'ai',
        content: aiResponse
      });
    } catch (error) {
      // 错误处理
      chatMessages.value.pop();
      chatMessages.value.push({
        type: 'ai',
        content: '抱歉，DeepSeek API调用出错，请稍后再试。'
      });
      console.error('DeepSeek API调用出错:', error);
    } finally {
      isProcessingAI.value = false;
      
      // 滚动到底部
      nextTick(() => {
        scrollChatToBottom();
      });
    }
  } else {
    // 普通AI响应
    setTimeout(() => {
      const responses = [
        '我理解你的问题，让我思考一下...',
        '这是个很好的问题！',
        '我可以帮你解决这个问题。',
        '根据我的理解，这个问题的答案是...',
        '很抱歉，我现在无法回答这个问题。',
        '我需要更多信息来回答这个问题。'
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      chatMessages.value.push({
        type: 'ai',
        content: randomResponse
      });
      
      // 滚动到底部
      nextTick(() => {
        scrollChatToBottom();
      });
    }, 1000);
  }
};

// 搜索内容
const searchContent = (event: Event): void => {
  event.stopPropagation();
  currentAiMessage.value = '请输入要搜索的内容';
  // 可以在这里实现搜索功能
};

// 导航到相关博客
const navigateToBlog = (blogId: string): void => {
  if (route.params.id === blogId) return;
  router.push({ name: 'BlogDetail', params: { id: blogId } });
};

// 格式化日期
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

// 提交评论
const submitComment = (): void => {
  if (!commentText.value.trim() || !blog.value) return;
  
  // 这里应该调用API提交评论
  console.log('提交评论:', commentText.value);
  
  // 清空评论框
  commentText.value = '';
};

// 加载博客详情
onMounted(async (): Promise<void> => {
  const blogId = route.params.id as string;
  
  if (!blogId) {
    error.value = '博客ID无效';
    loading.value = false;
    return;
  }
  
  try {
    // 加载分类数据
    await blogStore.fetchCategories();
    
    blog.value = await blogStore.fetchBlogById(blogId);
    
    if (blog.value) {
      // 加载相关博客
      relatedBlogs.value = await blogStore.fetchRelatedBlogs(blogId);
    } else {
      error.value = '未找到博客';
    }
  } catch (err) {
    console.error('加载博客详情失败:', err);
    error.value = err instanceof Error ? err.message : '加载博客详情失败，请刷新页面重试';
  } finally {
    loading.value = false;
  }
  
  // 初始化Live2D
  nextTick(() => {
    initLive2DWidget();
  });
});

// 组件卸载前清理Live2D
onBeforeUnmount(() => {
  if (live2dWidget.value) {
    live2dWidget.value.destroy();
  }
});

// 切换搜索输入框
const toggleSearchInput = (): void => {
  showSearchInput.value = !showSearchInput.value;
};

// 隐藏搜索输入框
const hideSearchInput = (): void => {
  showSearchInput.value = false;
};

// 执行搜索
const performSearch = (): void => {
  // 这里应该实现搜索逻辑
  console.log('执行搜索，关键词:', searchQuery.value);
};
</script>

<style lang="scss" scoped>
.blog-detail-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  color: #333;
}

.header {
  position: relative;
  height: 80px;
  
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
}

.blog-header {
  padding: 60px 0 40px;
  background-color: #fff;
  border-bottom: 1px solid #eee;
  
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 0 20px;
  }
  
  .blog-title {
    font-size: 2.2rem;
    margin-bottom: 15px;
    font-weight: 700;
    color: #333;
  }
  
  .blog-meta {
    display: flex;
    align-items: center;
    
    .category {
      background-color: #f5f5f5;
      color: #666;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 14px;
      margin-right: 15px;
    }
    
    .date {
      color: #999;
      font-size: 14px;
    }
  }
}

.blog-content {
  flex: 1;
  
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 40px 20px;
  }
  
  .article-content {
    margin-bottom: 40px;
    line-height: 1.8;
    color: #333;
    
    h1, h2, h3, h4, h5, h6 {
      margin-top: 1.5em;
      margin-bottom: 0.5em;
      font-weight: 600;
    }
    
    p {
      margin-bottom: 1rem;
    }
    
    a {
      color: #3273dc;
      text-decoration: none;
      
      &:hover {
        text-decoration: underline;
      }
    }
    
    img {
      max-width: 100%;
      height: auto;
      border-radius: 5px;
      margin: 20px 0;
    }
    
    pre {
      background-color: #f5f5f5;
      padding: 15px;
      border-radius: 5px;
      overflow-x: auto;
      margin: 20px 0;
    }
    
    code {
      font-family: 'Courier New', Courier, monospace;
      background-color: #f5f5f5;
      padding: 2px 5px;
      border-radius: 3px;
    }
    
    blockquote {
      border-left: 4px solid #ddd;
      padding-left: 15px;
      color: #666;
      margin: 20px 0;
    }
    
    ul, ol {
      padding-left: 25px;
      margin: 15px 0;
    }
  }
  
  .post-tags {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 40px;
    
    .tag-item {
      background-color: #f5f5f5;
      color: #666;
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 13px;
      margin-right: 10px;
      margin-bottom: 10px;
    }
  }
  
  .author-info {
    display: flex;
    align-items: center;
    padding: 20px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    margin-bottom: 40px;
    
    .avatar {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      overflow: hidden;
      margin-right: 20px;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
    
    .author-details {
      .name {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 5px;
      }
      
      .bio {
        color: #666;
        font-size: 14px;
      }
    }
  }
  
  .related-posts {
    margin-bottom: 40px;
    
    .related-title {
      font-size: 1.5rem;
      margin-bottom: 20px;
      font-weight: 600;
    }
    
    .related-list {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    
    .related-item {
      background-color: #fff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      cursor: pointer;
      transition: transform 0.3s ease;
      display: flex;
      
      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
      }
      
      .related-image {
        width: 120px;
        min-width: 120px;
        height: 80px;
        
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
      
      .related-info {
        padding: 10px 15px;
        flex: 1;
        
        h4 {
          font-size: 16px;
          margin-bottom: 5px;
          font-weight: 600;
        }
        
        .related-meta {
          font-size: 13px;
          color: #666;
        }
      }
    }
  }
  
  .comments-section {
    background-color: #fff;
    border-radius: 8px;
    padding: 30px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    
    .comments-title {
      font-size: 1.5rem;
      margin-bottom: 20px;
      font-weight: 600;
    }
    
    .comment-form {
      margin-bottom: 30px;
      
      textarea {
        width: 100%;
        padding: 15px;
        border: 1px solid #eee;
        border-radius: 5px;
        resize: vertical;
        min-height: 120px;
        font-family: inherit;
        margin-bottom: 15px;
      }
      
      button {
        background-color: #3273dc;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        font-weight: 600;
        
        &:hover {
          background-color: #276cda;
        }
      }
    }
    
    .comments-list {
      .comment-item {
        display: flex;
        margin-bottom: 25px;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .comment-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          overflow: hidden;
          margin-right: 15px;
          
          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }
        
        .comment-content {
          flex: 1;
          
          .comment-header {
            margin-bottom: 8px;
            
            .comment-author {
              font-weight: 600;
              margin-right: 10px;
            }
            
            .comment-date {
              font-size: 12px;
              color: #999;
            }
          }
          
          .comment-text {
            font-size: 14px;
            line-height: 1.6;
          }
        }
      }
    }
    
    .no-comments {
      text-align: center;
      padding: 20px 0;
      color: #999;
    }
  }
}

.live2d-container {
  position: fixed;
  left: 30px;
  bottom: 30px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  
  #live2d-widget {
    width: 200px;
    height: 300px;
    position: relative;
    cursor: pointer;
    
    canvas {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
    }
  }
  
  .live2d-speech-bubble {
    position: absolute;
    top: -60px;
    left: 50px;
    min-width: 140px;
    animation: floatBubble 2s infinite alternate;
    pointer-events: none;
    z-index: 1001;
    
    .bubble-content {
      background-color: #fff;
      padding: 12px 16px;
      border-radius: 20px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.12);
      font-size: 14px;
      position: relative;
      
      &:after {
        content: '';
        position: absolute;
        bottom: -10px;
        left: 20px;
        width: 0;
        height: 0;
        border-left: 10px solid transparent;
        border-right: 10px solid transparent;
        border-top: 12px solid #fff;
      }
    }
  }
  
  .live2d-menu {
    position: absolute;
    bottom: 250px;
    left: 50px;
    background-color: #fff;
    border-radius: 15px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
    padding: 8px 0;
    width: 180px;
    animation: fadeIn 0.3s ease;
    overflow: hidden;
    z-index: 1001;
    
    .menu-item {
      padding: 12px 18px;
      font-size: 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      transition: all 0.2s ease;
      
      &:hover {
        background-color: #f0f7ff;
        transform: translateX(5px);
      }
      
      .menu-icon {
        font-size: 18px;
        margin-right: 12px;
      }
      
      .menu-text {
        font-weight: 500;
      }
    }
  }
}

.ai-chat-modal {
  position: fixed;
  bottom: 30px;
  left: 150px;
  z-index: 1001;
  animation: slideUp 0.4s;
  
  .chat-container {
    width: 350px;
    height: 500px;
    background-color: #fff;
    border-radius: 20px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    
    .chat-header {
      padding: 16px;
      background-color: #3273dc;
      color: #fff;
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .chat-title {
        display: flex;
        align-items: center;
        font-weight: 600;
        font-size: 16px;
        
        .title-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          margin-right: 10px;
          background-color: #fff;
          object-fit: cover;
        }
      }
      
      .chat-close {
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        cursor: pointer;
        font-size: 22px;
        transition: background-color 0.2s ease;
        
        &:hover {
          background-color: rgba(255, 255, 255, 0.2);
        }
      }
    }
    
    .chat-messages {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 16px;
      background-color: #f9f9f9;
      
      .chat-message {
        display: flex;
        margin-bottom: 5px;
        
        &.user {
          justify-content: flex-end;
          
          .message-content {
            background-color: #3273dc;
            color: #fff;
            border-radius: 18px 18px 0 18px;
            margin-left: auto;
          }
        }
        
        &.ai {
          justify-content: flex-start;
          
          .message-content {
            background-color: #fff;
            color: #333;
            border-radius: 18px 18px 18px 0;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
            margin-right: auto;
          }
        }
        
        .message-avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          overflow: hidden;
          margin-right: 12px;
          border: 2px solid #fff;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          
          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }
        
        .message-content {
          padding: 12px 16px;
          max-width: 80%;
          font-size: 14px;
          line-height: 1.5;
        }
      }
    }
    
    .chat-input {
      padding: 15px;
      border-top: 1px solid #eee;
      display: flex;
      background-color: #fff;
      
      input {
        flex: 1;
        border: 1px solid #e0e0e0;
        border-radius: 24px;
        padding: 12px 18px;
        font-size: 14px;
        outline: none;
        
        &:focus {
          border-color: #3273dc;
          box-shadow: 0 0 0 3px rgba(50, 115, 220, 0.1);
        }
      }
      
      button {
        margin-left: 10px;
        background-color: #3273dc;
        color: #fff;
        border: none;
        border-radius: 24px;
        padding: 10px 20px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        
        &:hover {
          background-color: #2a65c0;
        }
      }
    }
  }
}

.loading, .error {
  text-align: center;
  padding: 100px 20px;
  font-size: 18px;
}

.footer {
  padding: 30px 20px;
  text-align: center;
  color: #666;
  font-size: 14px;
  margin-top: auto;
  
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
    color: #555;
    
    &:hover {
      color: #000;
    }
  }
}

@keyframes floatBubble {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-6px);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .header .nav .menu-wrapper {
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
  
  .blog-header {
    padding: 40px 0 30px;
    
    .blog-title {
      font-size: 1.8rem;
    }
  }
  
  .related-posts .related-item {
    flex-direction: column;
    
    .related-image {
      width: 100%;
      height: 120px;
    }
  }
  
  .live2d-container {
    left: 10px;
    bottom: 10px;
    
    #live2d-widget {
      width: 150px;
      height: 225px;
    }
    
    .live2d-menu {
      width: 160px;
      bottom: 180px;
      left: 30px;
    }
    
    .live2d-speech-bubble {
      left: 30px;
    }
  }
  
  .ai-chat-modal .chat-container {
    width: 90%;
    max-width: 350px;
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
    
    .search-btn {
      display: none;
    }
  }
}
</style> 
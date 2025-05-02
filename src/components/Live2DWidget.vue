<template>
  <div class="live2d-container" :class="{ 'chat-open': showChat, 'music-open': showMusic, 'translator-open': showTranslator, 'weather-open': showWeather, 'todo-open': showTodo }">
    <!-- 重要：移除自定义工具栏的HTML结构 -->
    <div id="live2d-widget"></div>
    
    <!-- 对话气泡 -->
    <div class="live2d-speech-bubble" v-if="showSpeechBubble">
      <div class="bubble-content">{{ message }}</div>
    </div>
    
    <!-- AI 聊天界面 -->
    <div class="live2d-chat-panel" v-if="showChat">
      <div class="panel-header">
        <h3>AI 聊天助手</h3>
        <button class="close-btn" @click="showChat = false">×</button>
      </div>
      <div class="panel-body" ref="chatContainer">
        <div class="chat-messages">
          <div v-for="(msg, index) in chatMessages" :key="index" class="message" :class="msg.role">
            <div class="message-avatar">
              <div v-if="msg.role === 'assistant'" class="avatar-img ai-avatar">🤖</div>
              <div v-else class="avatar-img user-avatar">👤</div>
      </div>
            <div class="message-content">
              <div class="message-text">{{ msg.content }}</div>
              <div class="message-time">{{ msg.time }}</div>
      </div>
      </div>
      </div>
    </div>
      <div class="panel-footer">
        <input 
          type="text" 
          v-model="userInput" 
          placeholder="输入消息..." 
          @keyup.enter="sendMessage"
          class="chat-input"
        />
        <button @click="sendMessage" class="send-btn" :disabled="isLoading">
          <span v-if="isLoading">⏳</span>
          <span v-else>发送</span>
        </button>
      </div>
    </div>
    
    <!-- 网易云音乐播放器面板 -->
    <div class="live2d-music-panel" v-if="showMusic">
      <div class="panel-header">
        <h3>网易云音乐</h3>
        <button class="close-btn" @click="showMusic = false">×</button>
      </div>
      <div class="panel-body aplayer-wrapper" ref="aplayerContainer">
        <!-- APlayer将在这里挂载 -->
      </div>
    </div>
    
    <!-- 翻译助手界面 -->
    <div class="live2d-translator-panel" v-if="showTranslator">
      <div class="panel-header">
        <h3>翻译助手</h3>
        <button class="close-btn" @click="showTranslator = false">×</button>
      </div>
      <div class="panel-body">
        <div class="translator-controls">
          <div class="language-selector">
            <select v-model="sourceLang">
              <option value="auto">自动检测</option>
              <option value="zh">中文</option>
              <option value="en">英文</option>
            </select>
            <span class="direction-arrow">→</span>
            <select v-model="targetLang">
              <option value="zh">中文</option>
              <option value="en">英文</option>
            </select>
          </div>
        </div>
        
        <div class="translator-input">
          <textarea 
            v-model="sourceText" 
            placeholder="请输入要翻译的文本..."
            rows="4"
          ></textarea>
        </div>
        
        <div class="translator-actions">
          <button @click="translateText" :disabled="isTranslating" class="translate-btn">
            <span v-if="isTranslating">翻译中...</span>
            <span v-else>翻译</span>
          </button>
        </div>
        
        <div class="translator-result" v-if="translatedText">
          <div class="result-label">翻译结果:</div>
          <div class="result-text">{{ translatedText }}</div>
        </div>
      </div>
    </div>
    
    <!-- 天气界面 -->
    <div class="live2d-weather-panel" v-if="showWeather">
      <div class="panel-header">
        <h3>天气预报</h3>
        <button class="close-btn" @click="showWeather = false">×</button>
      </div>
      <div class="panel-body">
        <div class="weather-search">
          <input 
            type="text" 
            v-model="weatherCity" 
            placeholder="输入城市名..." 
            @keyup.enter="getWeatherByCity"
          />
          <button @click="getWeatherByCity" :disabled="isLoadingWeather">
            <span v-if="isLoadingWeather">⏳</span>
            <span v-else>🔍</span>
          </button>
        </div>
        
        <div class="weather-loading" v-if="isLoadingWeather">
          正在获取天气数据...
        </div>
        
        <div class="weather-result" v-else-if="weatherData">
          <div class="weather-current">
            <div class="weather-city">{{ weatherData.city }}</div>
            <div class="weather-temp">{{ weatherData.temperature }}°C</div>
            <div class="weather-condition">{{ weatherData.condition }}</div>
            <div class="weather-details">
              <div class="weather-humidity">湿度: {{ weatherData.humidity }}%</div>
              <div class="weather-wind">风力: {{ weatherData.wind }}级</div>
            </div>
          </div>
          
          <div class="weather-forecast">
            <div class="forecast-title">未来天气</div>
            <div class="forecast-items">
              <div 
                v-for="(item, index) in weatherData.forecast" 
                :key="index"
                class="forecast-item"
              >
                <div class="forecast-day">{{ item.day }}</div>
                <div class="forecast-condition">{{ item.condition }}</div>
                <div class="forecast-temp">{{ item.low }}°C ~ {{ item.high }}°C</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="weather-empty" v-else>
          请输入城市名查询天气
        </div>
      </div>
    </div>
    
    <!-- 待办事项界面 -->
    <div class="live2d-todo-panel" v-if="showTodo">
      <div class="panel-header">
        <h3>待办事项</h3>
        <button class="close-btn" @click="showTodo = false">×</button>
      </div>
      <div class="panel-body">
        <div class="todo-input">
          <input 
            type="text" 
            v-model="newTodoText" 
            placeholder="添加新的待办事项..." 
            @keyup.enter="addTodoItem"
          />
          <button @click="addTodoItem">添加</button>
        </div>
        
        <div class="todo-list">
          <div 
            v-for="item in todoItems" 
            :key="item.id"
            class="todo-item"
            :class="{ 'completed': item.completed }"
          >
            <div class="todo-checkbox" @click="toggleTodoCompleted(item.id)">
              <span v-if="item.completed">✓</span>
            </div>
            <div class="todo-text">{{ item.text }}</div>
            <div class="todo-delete" @click="deleteTodoItem(item.id)">×</div>
          </div>
        </div>
        
        <div class="todo-empty" v-if="todoItems.length === 0">
          暂无待办事项
        </div>
      </div>
    </div>
    
    <audio ref="audioPlayer" class="audio-player" @timeupdate="updateProgress" @ended="songEnded"></audio>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, defineEmits, defineProps, nextTick, watch } from 'vue';
import axios from 'axios';
import 'aplayer/dist/APlayer.min.css';
import APlayer from 'aplayer';
// import MetingJS from 'meting-js';

// 删除未使用的props声明，使用下面的方式代替
defineProps({
  message: {
    type: String,
    default: '有什么我能帮你的吗?'
  }
});

const emit = defineEmits(['chat', 'music', 'search', 'ai', 'menu-toggle', 'message-change']);

const showMenu = ref<boolean>(false);
const showSpeechBubble = ref<boolean>(false);
const audioPlayer = ref<HTMLAudioElement | null>(null);
const chatContainer = ref<HTMLElement | null>(null);

// 聊天相关
const showChat = ref<boolean>(false);
const userInput = ref<string>('');
const isLoading = ref<boolean>(false);
const chatMessages = ref<Array<{role: string, content: string, time: string}>>([
  {
    role: 'assistant',
    content: '你好！我是AI助手，有什么我可以帮你的吗？',
    time: new Date().toLocaleTimeString()
  }
]);

// 音乐相关 - 修改为支持APlayer
const showMusic = ref<boolean>(false);
const playlistId = ref<string>('3778678'); // 默认播放列表ID，可以修改为您喜欢的网易云歌单ID
const musicServer = ref<string>('netease'); // 音乐服务提供商: netease, tencent, kugou, xiami, baidu
const musicType = ref<string>('playlist'); // 播放类型: song, playlist, album, search, artist
const currentTime = ref<number>(0);
const duration = ref<number>(0);
const isPlaying = ref<boolean>(false);
const showMusicError = ref<boolean>(false);
const newPlaylistId = ref<string>('');

// 翻译相关
const showTranslator = ref<boolean>(false);
const sourceText = ref<string>('');
const translatedText = ref<string>('');
const sourceLang = ref<string>('auto');
const targetLang = ref<string>('en');
const isTranslating = ref<boolean>(false);

// 天气相关
const showWeather = ref<boolean>(false);
const weatherCity = ref<string>('');
const weatherData = ref<any>(null);
const isLoadingWeather = ref<boolean>(false);

// 待办事项相关
const showTodo = ref<boolean>(false);
const todoItems = ref<Array<{id: number, text: string, completed: boolean}>>([]);
const newTodoText = ref<string>('');

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
    APlayer?: any;
  }
}

// 新增参考元素
const aplayerContainer = ref<HTMLElement | null>(null);
const aplayer = ref<any>(null);

// 导出初始化函数，便于在其他组件中调用
const initLive2DWidget = (): void => {
  try {
    console.log('开始加载Live2D...');
    
    // 创建script元素
    const script = document.createElement('script');
    script.src = 'https://fastly.jsdelivr.net/gh/stevenjoezhang/live2d-widget@latest/autoload.js';
    
    // 设置全局变量配置 - 保留原始工具栏
    window.live2d_path = 'https://fastly.jsdelivr.net/gh/stevenjoezhang/live2d-widget@latest/';
    window.live2d_settings = {
      modelId: 6,                // 设置默认模型为haruto
      modelTexturesId: 0,        // 默认材质ID
      modelStorage: true,        // 储存模型ID
      waifuSize: '280x250',      // 看板娘大小
      waifuTipsSize: '250x70',   // 提示框大小
      waifuFontSize: '12px',     // 提示框字体
      waifuToolFont: '14px',     // 工具栏字体
      waifuToolLine: '20px',     // 工具栏行高
      waifuToolTop: '0px',       // 工具栏顶部边距
      waifuDraggable: 'unlimited', // 拖拽样式
      waifuDraggableRevert: true,  // 松开鼠标还原拖拽位置
      homePageUrl: window.location.origin + '/',  // 设置正确的主页链接
      // 保留原始工具栏并启用
      showToolMenu: true,        // 显示工具栏
      canCloseLive2d: false,     // 隐藏关闭按钮  
      canSwitchModel: false,     // 隐藏原始模型切换
      canSwitchTextures: false,  // 关闭材质切换
      canSwitchHitokoto: false,  // 关闭一言切换
      canTakeScreenshot: false,  // 关闭看板娘截图
      canTurnToHomePage: false,  // 关闭返回主页
      canTurnToAboutPage: false, // 关闭关于页
      modelAPI: 'https://unpkg.com/live2d-widget-model-haruto@1.0.5/assets/haruto.model.json',
      tipsMessage: 'waifu-tips.json',         // 同目录下可省略路径
      hitokotoAPI: 'hitokoto.cn'              // 一言API
    } as any; // 使用类型断言解决TS类型问题
    
    // 添加到文档
    document.body.appendChild(script);
    
    console.log('Live2D脚本加载成功');
    
    // 等待Live2D加载完成后修改原始工具栏
    const setupInterval = setInterval(() => {
      const waifuTool = document.querySelector('#waifu-tool');
      if (waifuTool) {
        clearInterval(setupInterval);
        console.log('找到工具栏，开始自定义按钮');
        removeCustomToolbar(); // 移除自定义工具栏
        customizeOriginalToolbar(); // 自定义原始工具栏
        loadAPlayerScripts(); // 加载APlayer相关脚本
      }
    }, 500);
    
    // 最多等待10秒
    setTimeout(() => {
      clearInterval(setupInterval);
    }, 10000);
  } catch (error) {
    console.error('Live2D加载失败:', error);
  }
};

// 导出 initLive2DWidget 函数
// export { initLive2DWidget };

// 使用defineExpose暴露函数
defineExpose({ 
  initLive2DWidget 
});

// 加载APlayer所需的模块
const loadAPlayerScripts = (): void => {
  console.log('APlayer模块已通过npm包导入，无需动态加载脚本');
  
  // 动态加载Meting.js (npm包中可能不包含完整功能)
  if (!document.querySelector('script[src*="Meting.min.js"]')) {
    const script = document.createElement('script');
    // 尝试直接从官方CDN加载最新版本
    script.src = 'https://cdn.jsdelivr.net/npm/meting@2.0.1/dist/Meting.min.js';
    document.body.appendChild(script);
    
    script.onload = () => {
      console.log('Meting.js脚本加载完成');
      showMusicError.value = false;
      
      // 自定义元素可能未注册，手动注册
      if (!customElements.get('meting-js')) {
        console.log('尝试手动注册meting-js元素');
        
        // 等待一定时间，确保可能的函数已准备好
        setTimeout(() => {
          try {
            // 注册自定义元素（如果window.customElements存在）
            if (window.customElements && (window as any).MetingJSElement) {
              window.customElements.define('meting-js', (window as any).MetingJSElement);
              console.log('meting-js元素注册成功');
            }
          } catch (error) {
            console.error('注册meting-js元素失败:', error);
            showMusicError.value = true;
          }
        }, 500);
      }
    };
    
    script.onerror = () => {
      console.error('加载Meting.js脚本失败');
      // 显示错误状态，允许用户手动更新歌单ID
      showMusicError.value = true;
      
      // 尝试其他CDN源
      const alternativeScript = document.createElement('script');
      alternativeScript.src = 'https://unpkg.com/meting@2.0.1/dist/Meting.min.js';
      document.body.appendChild(alternativeScript);
    };
  }
};

// 移除可能存在的自定义工具栏
const removeCustomToolbar = (): void => {
  try {
    // 移除自定义工具栏
    const customToolbar = document.querySelector('#custom-waifu-tool');
    if (customToolbar && customToolbar.parentNode) {
      console.log('找到并移除自定义工具栏');
      customToolbar.parentNode.removeChild(customToolbar);
    }
    
    // 隐藏原始工具栏的按钮
    const originalButtons = document.querySelectorAll('#waifu-tool > span:not([data-action])');
    originalButtons.forEach(btn => {
      if (btn.parentNode) {
        console.log('移除原始按钮');
        btn.parentNode.removeChild(btn);
      }
    });
  } catch (error) {
    console.error('移除自定义工具栏失败:', error);
  }
};

// 修改原始工具栏，保留切换模型和添加聊天功能
const customizeOriginalToolbar = (): void => {
  try {
    const waifuTool = document.querySelector('#waifu-tool');
    if (!waifuTool) {
      console.error('未找到Live2D工具栏');
      return;
    }
    
    // 移除所有现有按钮
    while (waifuTool.firstChild) {
      waifuTool.removeChild(waifuTool.firstChild);
    }
    
    // 添加切换模型按钮
    const switchModelBtn = document.createElement('span');
    switchModelBtn.innerHTML = '👚';
    switchModelBtn.title = '切换模型';
    switchModelBtn.setAttribute('data-action', 'switch-model');
    switchModelBtn.onclick = (e: MouseEvent) => {
      console.log('点击切换模型按钮');
      e.preventDefault();
      e.stopPropagation();
      
      const loadlive2d = (window as any).loadlive2d;
      const models = [
        { id: 1, name: 'shizuku', url: 'https://unpkg.com/live2d-widget-model-shizuku@1.0.5/assets/shizuku.model.json' },
        { id: 2, name: 'z16', url: 'https://unpkg.com/live2d-widget-model-z16@1.0.5/assets/z16.model.json' }, 
        { id: 3, name: 'koharu', url: 'https://unpkg.com/live2d-widget-model-koharu@1.0.5/assets/koharu.model.json' },
        { id: 4, name: 'haruto', url: 'https://unpkg.com/live2d-widget-model-haruto@1.0.5/assets/haruto.model.json' },
        { id: 5, name: 'hijiki', url: 'https://unpkg.com/live2d-widget-model-hijiki@1.0.5/assets/hijiki.model.json' },
        { id: 6, name: 'tororo', url: 'https://unpkg.com/live2d-widget-model-tororo@1.0.5/assets/tororo.model.json' }
      ];
      
      // 随机选择一个不同的模型
      let randomIndex = Math.floor(Math.random() * models.length);
      const currentId = window.live2d_settings?.modelId || 0;
      
      // 尝试最多6次获取不同的模型
      for (let i = 0; i < 6; i++) {
        if (models[randomIndex].id !== currentId) break;
        randomIndex = Math.floor(Math.random() * models.length);
      }
      
      const model = models[randomIndex];
      if (typeof loadlive2d === 'function') {
        console.log(`切换到模型: ${model.name}`);
        loadlive2d('live2d', model.url);
        
        // 更新当前模型ID
        if (window.live2d_settings) {
          window.live2d_settings.modelId = model.id;
        }
        
        // 显示提示消息
        showMessage(`模型已切换为 ${model.name}`);
      } else {
        console.error('loadlive2d函数未找到');
      }
      return false;
    };
    
    // 添加AI聊天按钮
    const chatBtn = document.createElement('span');
    chatBtn.innerHTML = '💬';
    chatBtn.title = 'AI聊天';
    chatBtn.setAttribute('data-action', 'ai-chat');
    chatBtn.onclick = (e: MouseEvent) => {
      console.log('点击AI聊天按钮');
      e.preventDefault();
      e.stopPropagation();
      openChat();
      return false;
    };
    
    // 添加音乐按钮
    const musicBtn = document.createElement('span');
    musicBtn.innerHTML = '🎵';
    musicBtn.title = '网易云音乐';
    musicBtn.setAttribute('data-action', 'play-music');
    musicBtn.onclick = (e: MouseEvent) => {
      console.log('点击音乐按钮');
      e.preventDefault();
      e.stopPropagation();
      openMusic();
      return false;
    };
    
    // 添加天气按钮
    const weatherBtn = document.createElement('span');
    weatherBtn.innerHTML = '��️';
    weatherBtn.title = '天气查询';
    weatherBtn.setAttribute('data-action', 'weather');
    weatherBtn.onclick = (e: MouseEvent) => {
      console.log('点击天气按钮');
      e.preventDefault();
      e.stopPropagation();
      openWeather();
      return false;
    };
    
    // 添加翻译按钮
    const translateBtn = document.createElement('span');
    translateBtn.innerHTML = '🌐';
    translateBtn.title = '翻译助手';
    translateBtn.setAttribute('data-action', 'translator');
    translateBtn.onclick = (e: MouseEvent) => {
      console.log('点击翻译按钮');
      e.preventDefault();
      e.stopPropagation();
      openTranslator();
      return false;
    };
    
    // 添加待办事项按钮
    const todoBtn = document.createElement('span');
    todoBtn.innerHTML = '📝';
    todoBtn.title = '待办事项';
    todoBtn.setAttribute('data-action', 'todo-list');
    todoBtn.onclick = (e: MouseEvent) => {
      console.log('点击待办事项按钮');
      e.preventDefault();
      e.stopPropagation();
      openTodoList();
      return false;
    };
    
    // 添加到工具栏
    waifuTool.appendChild(switchModelBtn);
    waifuTool.appendChild(chatBtn);
    waifuTool.appendChild(musicBtn);
    waifuTool.appendChild(weatherBtn);
    waifuTool.appendChild(translateBtn);
    waifuTool.appendChild(todoBtn);
    
    // 设置按钮样式
    const buttons = waifuTool.querySelectorAll('span');
    buttons.forEach(btn => {
      (btn as HTMLElement).style.cssText = `
        cursor: pointer !important;
        font-size: 20px !important;
        line-height: 22px !important;
        display: block !important;
        margin-bottom: 10px !important;
        transition: transform 0.3s, opacity 0.3s !important;
        opacity: 0.8 !important;
        z-index: 10010 !important;
        user-select: none !important;
      `;
      
      btn.addEventListener('mouseenter', () => {
        (btn as HTMLElement).style.transform = 'scale(1.2)';
        (btn as HTMLElement).style.opacity = '1';
      });
      
      btn.addEventListener('mouseleave', () => {
        (btn as HTMLElement).style.transform = 'scale(1)';
        (btn as HTMLElement).style.opacity = '0.8';
      });
    });
    
    // 修改工具栏整体样式
    (waifuTool as HTMLElement).style.cssText += `
      z-index: 10010 !important; 
      visibility: visible !important;
      opacity: 1 !important;
    `;
    
    console.log('Live2D工具栏修改成功');
  } catch (error) {
    console.error('修改工具栏失败:', error);
  }
};

// 显示消息到原始的提示框
const showMessage = (text: string): void => {
  const tips = document.getElementById('waifu-tips');
  if (tips) {
    tips.innerHTML = text;
    tips.style.display = 'block';
    setTimeout(() => {
      tips.style.display = 'none';
    }, 3000);
  }
};

// 修改打开音乐面板的函数 - 直接使用APlayer
const openMusic = (): void => {
  console.log('执行openMusic函数');
  showMusic.value = true;
  showChat.value = false;
  showTranslator.value = false;
  showWeather.value = false;
  showTodo.value = false;
  
  // 确保音乐面板可见
  setTimeout(() => {
    const musicPanel = document.querySelector('.live2d-music-panel');
    if (musicPanel) {
      (musicPanel as HTMLElement).style.display = 'flex';
      console.log('设置音乐面板为可见');
      
      // 如果还没有创建APlayer实例，则创建
      if (!aplayer.value) {
        createAPlayer();
      } else {
        console.log('使用已创建的APlayer实例');
      }
    } else {
      console.log('找不到音乐面板元素');
      
      // 尝试创建音乐面板
      const waifu = document.querySelector('#waifu');
      if (waifu) {
        console.log('找到Live2D容器，尝试创建音乐面板');
        const musicPanelDiv = document.createElement('div');
        musicPanelDiv.className = 'live2d-music-panel';
        musicPanelDiv.innerHTML = `
          <div class="panel-header">
            <h3>网易云音乐</h3>
            <button class="close-btn" id="close-music-btn">×</button>
          </div>
          <div class="panel-body aplayer-wrapper" id="aplayer-container">
            <!-- APlayer将在这里挂载 -->
          </div>
        `;
        
        document.body.appendChild(musicPanelDiv);
        
        // 设置关闭按钮事件
        const closeBtn = document.getElementById('close-music-btn');
        if (closeBtn) {
          closeBtn.addEventListener('click', () => {
            showMusic.value = false;
            musicPanelDiv.style.display = 'none';
          });
        }
        
        // 设置样式
        musicPanelDiv.style.display = 'flex';
        musicPanelDiv.style.flexDirection = 'column';
        musicPanelDiv.style.position = 'fixed';
        musicPanelDiv.style.bottom = '10px';
        musicPanelDiv.style.left = '150px';
        musicPanelDiv.style.width = '320px';
        musicPanelDiv.style.height = '450px';
        musicPanelDiv.style.backgroundColor = '#fff';
        musicPanelDiv.style.borderRadius = '20px';
        musicPanelDiv.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.15)';
        musicPanelDiv.style.zIndex = '1002';
        
        // 设置面板头部样式
        const panelHeader = musicPanelDiv.querySelector('.panel-header');
        if (panelHeader) {
          (panelHeader as HTMLElement).style.display = 'flex';
          (panelHeader as HTMLElement).style.justifyContent = 'space-between';
          (panelHeader as HTMLElement).style.alignItems = 'center';
          (panelHeader as HTMLElement).style.padding = '15px 20px';
          (panelHeader as HTMLElement).style.backgroundColor = '#f06292';
          (panelHeader as HTMLElement).style.borderBottom = '1px solid #e9446a';
          (panelHeader as HTMLElement).style.color = 'white';
          (panelHeader as HTMLElement).style.borderTopLeftRadius = '20px';
          (panelHeader as HTMLElement).style.borderTopRightRadius = '20px';
        }
        
        // 设置面板标题样式
        const panelTitle = musicPanelDiv.querySelector('.panel-header h3');
        if (panelTitle) {
          (panelTitle as HTMLElement).style.margin = '0';
          (panelTitle as HTMLElement).style.fontSize = '16px';
          (panelTitle as HTMLElement).style.fontWeight = '600';
          (panelTitle as HTMLElement).style.color = 'white';
        }
        
        // 设置关闭按钮样式
        const closeBtnElem = musicPanelDiv.querySelector('.close-btn');
        if (closeBtnElem) {
          (closeBtnElem as HTMLElement).style.background = 'none';
          (closeBtnElem as HTMLElement).style.border = 'none';
          (closeBtnElem as HTMLElement).style.fontSize = '20px';
          (closeBtnElem as HTMLElement).style.color = 'rgba(255, 255, 255, 0.8)';
          (closeBtnElem as HTMLElement).style.cursor = 'pointer';
          (closeBtnElem as HTMLElement).style.transition = 'color 0.2s ease';
        }
        
        // 设置面板内容部分样式
        const panelBody = musicPanelDiv.querySelector('.panel-body');
        if (panelBody) {
          (panelBody as HTMLElement).style.flex = '1';
          (panelBody as HTMLElement).style.overflow = 'hidden';
        }
        
        // 使用新创建的面板
        aplayerContainer.value = document.getElementById('aplayer-container') as HTMLElement;
        createAPlayer();
      } else {
        console.error('找不到Live2D容器，无法创建音乐面板');
      }
    }
  }, 50);
};

// 创建APlayer播放器
const createAPlayer = async (): Promise<void> => {
  if (!aplayerContainer.value) return;
  
  console.log('创建APlayer播放器');
  
  // 如果已经存在实例，先销毁
  if (aplayer.value) {
    console.log('销毁已存在的APlayer实例');
    aplayer.value.destroy();
    aplayer.value = null;
  }
  
  // 清空容器
  aplayerContainer.value.innerHTML = '';
  
  try {
    // 从网易云获取歌单数据
    console.log('正在获取歌单数据，ID:', playlistId.value);
    
    // 加载提示
    aplayerContainer.value.innerHTML = '<div class="loading-music">正在加载歌单数据...</div>';
    
    // 获取网易云歌单数据
    const songList = await fetchNeteaseSongs(playlistId.value);
    
    if (songList && songList.length > 0) {
      console.log(`成功获取${songList.length}首歌曲`);
      
      // 清空加载提示
      aplayerContainer.value.innerHTML = '';
      
      // 创建APlayer实例
      aplayer.value = new APlayer({
        container: aplayerContainer.value,
        lrcType: 0,
        autoplay: false,
        theme: '#F58EA8',
        audio: songList,
        listFolded: false,
        listMaxHeight: '320px',
        order: 'random'
      });
      
      console.log('APlayer实例创建成功');
    } else {
      throw new Error('无法获取歌曲数据');
    }
  } catch (error) {
    console.error('创建APlayer实例失败:', error);
    
    // 显示错误信息
    aplayerContainer.value.innerHTML = `
      <div class="music-error">
        <p>无法加载歌单数据，请尝试更换歌单ID</p>
        <div class="music-input">
          <input 
            type="text" 
            id="newPlaylistId"
            placeholder="输入网易云歌单ID..." 
          />
          <button id="changePlaylistBtn">更新</button>
        </div>
      </div>
    `;
    
    // 添加事件监听
    const input = document.getElementById('newPlaylistId');
    const button = document.getElementById('changePlaylistBtn');
    
    if (button && input) {
      button.addEventListener('click', () => {
        const newId = (input as HTMLInputElement).value.trim();
        if (newId) {
          playlistId.value = newId;
          createAPlayer();
        }
      });
    }
  }
};

// 从网易云API获取歌单数据
const fetchNeteaseSongs = async (id: string): Promise<Array<{name: string, artist: string, url: string, cover: string, lrc?: string}> | null> => {
  try {
    // 使用公共网易云API
    const response = await axios.get(`https://api.i-meto.com/meting/api?server=netease&type=playlist&id=${id}`);
    
    if (response.data && Array.isArray(response.data)) {
      return response.data.map((song: any) => ({
        name: song.title || '未知歌曲',
        artist: song.author || '未知艺术家',
        url: song.url || '',
        cover: song.pic || 'https://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg',
        lrc: song.lrc || ''
      }));
    }
    
    // 备用方法：如果上述API失败，使用直接链接（可能需要跨域处理）
    return [
      {
        name: '示例歌曲1',
        artist: '默认艺术家',
        url: 'https://music.163.com/song/media/outer/url?id=1901371647.mp3',
        cover: 'https://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg'
      },
      {
        name: '示例歌曲2',
        artist: '默认艺术家',
        url: 'https://music.163.com/song/media/outer/url?id=1887533268.mp3',
        cover: 'https://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg'
      }
    ];
  } catch (error) {
    console.error('获取网易云歌单失败:', error);
    
    // 返回备用歌曲
    return [
      {
        name: '示例歌曲1',
        artist: '默认艺术家',
        url: 'https://music.163.com/song/media/outer/url?id=1901371647.mp3',
        cover: 'https://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg'
      },
      {
        name: '示例歌曲2',
        artist: '默认艺术家',
        url: 'https://music.163.com/song/media/outer/url?id=1887533268.mp3',
        cover: 'https://p2.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg'
      }
    ];
  }
};

// 初始化APlayer - 注释未使用的函数，但保留定义供将来可能的使用
/* const initAPlayer = (): void => {
  // 函数实现...
}; */

// 天气功能
const openWeather = (): void => {
  console.log('执行openWeather函数');
  showWeather.value = true;
  showChat.value = false;
  showMusic.value = false;
  showTranslator.value = false;
  showTodo.value = false;
  
  // 确保天气面板可见
  setTimeout(() => {
    const weatherPanel = document.querySelector('.live2d-weather-panel');
    if (weatherPanel) {
      (weatherPanel as HTMLElement).style.display = 'flex';
      console.log('设置天气面板为可见');
    } else {
      console.log('找不到天气面板元素');
    }
  }, 50);
  
  // 如果已获取地理位置权限，自动获取当前位置天气
  if (navigator.geolocation) {
    isLoadingWeather.value = true;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        getWeatherByCoords(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        console.error('获取位置失败:', error);
        isLoadingWeather.value = false;
      }
    );
  }
};

// 根据坐标获取天气 - 使用参数但不需要在函数中再单独声明
const getWeatherByCoords = async (lat: number, lon: number): Promise<void> => {
  try {
    // 这里应该调用实际的天气API，这里使用模拟数据，并传递但不单独存储坐标参数
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 可以在这里使用lat和lon参数调用实际的天气API
    console.log(`获取坐标(${lat}, ${lon})的天气数据`);
    
    weatherData.value = {
      city: '当前位置',
      temperature: Math.floor(15 + Math.random() * 15), // 15-30度之间
      condition: ['晴朗', '多云', '小雨', '阴天'][Math.floor(Math.random() * 4)],
      humidity: Math.floor(40 + Math.random() * 40), // 40-80%之间
      wind: Math.floor(1 + Math.random() * 9), // 1-10级
      forecast: [
        { day: '今天', high: Math.floor(20 + Math.random() * 10), low: Math.floor(10 + Math.random() * 10), condition: '晴' },
        { day: '明天', high: Math.floor(20 + Math.random() * 10), low: Math.floor(10 + Math.random() * 10), condition: '多云' },
        { day: '后天', high: Math.floor(20 + Math.random() * 10), low: Math.floor(10 + Math.random() * 10), condition: '小雨' }
      ]
    };
  } catch (error) {
    console.error('获取天气失败:', error);
  } finally {
    isLoadingWeather.value = false;
  }
};

// 待办事项功能
const openTodoList = (): void => {
  console.log('执行openTodoList函数');
  showTodo.value = true;
  showChat.value = false;
  showMusic.value = false;
  showTranslator.value = false;
  showWeather.value = false;
  
  // 确保待办事项面板可见
  setTimeout(() => {
    const todoPanel = document.querySelector('.live2d-todo-panel');
    if (todoPanel) {
      (todoPanel as HTMLElement).style.display = 'flex';
      console.log('设置待办事项面板为可见');
    } else {
      console.log('找不到待办事项面板元素');
    }
  }, 50);
  
  // 加载待办事项
  loadTodoItems();
};

// 从本地存储加载待办事项
const loadTodoItems = (): void => {
  const savedItems = localStorage.getItem('live2d-todo-items');
  if (savedItems) {
    try {
      todoItems.value = JSON.parse(savedItems);
    } catch (e) {
      console.error('解析待办事项失败:', e);
      todoItems.value = [];
    }
  }
};

// 保存待办事项到本地存储
const saveTodoItems = (): void => {
  localStorage.setItem('live2d-todo-items', JSON.stringify(todoItems.value));
};

// 添加待办事项
const addTodoItem = (): void => {
  if (!newTodoText.value.trim()) return;
  
  const newId = todoItems.value.length ? Math.max(...todoItems.value.map(item => item.id)) + 1 : 1;
  
  todoItems.value.push({
    id: newId,
    text: newTodoText.value,
    completed: false
  });
  
  newTodoText.value = '';
  saveTodoItems();
};

// 切换待办事项完成状态
const toggleTodoCompleted = (id: number): void => {
  const item = todoItems.value.find(item => item.id === id);
  if (item) {
    item.completed = !item.completed;
    saveTodoItems();
  }
};

// 删除待办事项
const deleteTodoItem = (id: number): void => {
  todoItems.value = todoItems.value.filter(item => item.id !== id);
  saveTodoItems();
};

// 更新进度条
const updateProgress = (): void => {
  if (!audioPlayer.value) return;
  
  currentTime.value = audioPlayer.value.currentTime;
  duration.value = audioPlayer.value.duration || 0;
};

// 歌曲播放结束
const songEnded = (): void => {
  isPlaying.value = false;
  currentTime.value = 0;
  
  // 可以在这里实现自动播放下一首
};

// 切换对话气泡 - 注释未使用的函数，但保留定义供将来可能的使用
/* const toggleSpeechBubble = (event: Event): void => {
  event.stopPropagation();
  showSpeechBubble.value = !showSpeechBubble.value;
}; */

// 监听路由变化，关闭所有面板
watch(() => window.location.pathname, () => {
  showMenu.value = false;
  showChat.value = false;
  showMusic.value = false;
});

// 在路由变化或页面重载时重新应用工具栏修改
const handleRouteChange = (): void => {
  console.log('路由变化，检查工具栏状态');
  
  // 立即检查一次
  checkAndRestoreToolbar();
  
  // 然后每500ms检查一次，最多检查10次
  let checkCount = 0;
  const checkInterval = setInterval(() => {
    checkCount++;
    if (checkCount >= 10) {
      clearInterval(checkInterval);
      return;
    }
    
    if (checkAndRestoreToolbar()) {
      clearInterval(checkInterval);
    }
  }, 500);
};

// 检查工具栏状态并恢复自定义按钮
const checkAndRestoreToolbar = (): boolean => {
  const waifuTool = document.querySelector('#waifu-tool');
  if (!waifuTool) {
    console.log('工具栏不存在，等待加载');
    return false;
  }
  
  const customButtons = waifuTool.querySelector('[data-action="ai-chat"]');
  if (!customButtons) {
    console.log('检测到工具栏重置，重新应用自定义按钮');
    removeCustomToolbar();
    customizeOriginalToolbar();
    return true;
  }
  
  return true;
};

// 翻译功能
const openTranslator = (): void => {
  console.log('执行openTranslator函数');
  showTranslator.value = true;
  showChat.value = false;
  showMusic.value = false;
  showWeather.value = false;
  showTodo.value = false;
  
  // 确保翻译面板可见
  setTimeout(() => {
    const translatorPanel = document.querySelector('.live2d-translator-panel');
    if (translatorPanel) {
      (translatorPanel as HTMLElement).style.display = 'flex';
      console.log('设置翻译面板为可见');
    } else {
      console.log('找不到翻译面板元素');
    }
  }, 50);
};

// 执行翻译
const translateText = async (): Promise<void> => {
  if (!sourceText.value.trim() || isTranslating.value) return;
  
  isTranslating.value = true;
  
  try {
    // 这里应该调用实际的翻译API，这里使用模拟响应
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // 模拟翻译
    if (targetLang.value === 'en') {
      // 中译英模拟
      const translations: Record<string, string> = {
        '你好': 'Hello',
        '早上好': 'Good morning',
        '晚上好': 'Good evening',
        '谢谢': 'Thank you',
        '我爱你': 'I love you',
        '再见': 'Goodbye'
      };
      
      translatedText.value = translations[sourceText.value] || 
        `[En] ${sourceText.value} (Simulated translation)`;
    } else {
      // 英译中模拟
      const translations: Record<string, string> = {
        'hello': '你好',
        'good morning': '早上好',
        'good evening': '晚上好',
        'thank you': '谢谢',
        'i love you': '我爱你',
        'goodbye': '再见'
      };
      
      translatedText.value = translations[sourceText.value.toLowerCase()] || 
        `[中] ${sourceText.value} (模拟翻译)`;
    }
  } catch (error) {
    console.error('翻译失败:', error);
    translatedText.value = '翻译出错，请稍后再试';
  } finally {
    isTranslating.value = false;
  }
};

// 切换播放列表 - 注释未使用的函数，但保留定义供将来可能的使用
/* const changePlaylist = (): void => {
  // 函数实现...
}; */

onMounted(() => {
  // 直接初始化Live2D部件
  setTimeout(() => {
  initLive2DWidget();
  }, 300);
  
  // 监听点击事件，关闭面板
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (!target.closest('.live2d-chat-panel') && 
        !target.closest('.live2d-music-panel') && 
        !target.closest('.live2d-translator-panel') && 
        !target.closest('.live2d-weather-panel') && 
        !target.closest('.live2d-todo-panel') && 
        !target.closest('#waifu-tool') && 
        !target.closest('#waifu-tips')) {
      // 只有点击在面板和工具栏之外时才关闭
      showChat.value = false;
      showMusic.value = false;
      showTranslator.value = false;
      showWeather.value = false;
      showTodo.value = false;
    }
  });
  
  // 设置音频播放器引用
  audioPlayer.value = document.querySelector('.audio-player');
  
  // 添加MutationObserver来监视DOM变化
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        // 检查是否添加了waifu元素
        const waifuAdded = Array.from(mutation.addedNodes).some(
          node => (node as Element).id === 'waifu' || (node as Element).querySelector?.('#waifu')
        );
        
        if (waifuAdded) {
          console.log('检测到Live2D元素被添加，初始化工具栏');
          setTimeout(() => {
            removeCustomToolbar();
            customizeOriginalToolbar();
          }, 500);
        }
      }
    });
  });
  
  // 开始监视document.body的变化
  observer.observe(document.body, { childList: true, subtree: true });
  
  // 监听URL变化（不依赖路由）
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;
  
  history.pushState = function() {
    const result = originalPushState.apply(this, arguments as any);
    console.log('历史状态变化 (pushState)');
    handleRouteChange();
    return result;
  };
  
  history.replaceState = function() {
    const result = originalReplaceState.apply(this, arguments as any);
    console.log('历史状态变化 (replaceState)');
    handleRouteChange();
    return result;
  };
  
  window.addEventListener('popstate', () => {
    console.log('历史状态变化 (popstate)');
    handleRouteChange();
  });
  
  // 页面加载完成后再次检查
  window.addEventListener('load', () => {
    console.log('页面加载完成，检查工具栏');
    setTimeout(handleRouteChange, 1000);
  });
});

onBeforeUnmount(() => {
  // 清理事件监听器和观察者
  window.removeEventListener('popstate', handleRouteChange);
  
  // 恢复原始的history方法
  if (history.pushState.toString().includes('handleRouteChange')) {
    history.pushState = window.history.pushState;
    history.replaceState = window.history.replaceState;
  }
});
</script>

<style lang="scss" scoped>
.live2d-container {
  position: fixed;
  left: 30px;
  bottom: 30px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  
  &.chat-open, &.music-open, &.translator-open, &.weather-open, &.todo-open {
    #live2d-widget {
      transform: translateX(-40px) scale(0.8);
      transition: transform 0.3s ease;
    }
  }
  
  #live2d-widget {
    position: relative;
    cursor: pointer;
    transition: transform 0.3s ease;
    
    canvas {
      position: absolute;
      left: 0;
      top: 0;
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
  
  // AI聊天面板样式
  .live2d-chat-panel {
    position: absolute;
    bottom: 10px;
    left: 150px;
    width: 320px;
    height: 400px;
    background-color: #fff;
    border-radius: 20px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: slideIn 0.3s ease;
    z-index: 1002;
    
    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 20px;
      background-color: #f8f9fb;
      border-bottom: 1px solid #eaeaea;
      
      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #333;
      }
      
      .close-btn {
        background: none;
        border: none;
        font-size: 20px;
        color: #aaa;
        cursor: pointer;
        transition: color 0.2s ease;
        
        &:hover {
          color: #666;
        }
      }
    }
    
    .panel-body {
      flex: 1;
      overflow-y: auto;
      padding: 15px;
      background-color: #f5f7fa;
      
      &::-webkit-scrollbar {
        width: 4px;
      }
      
      &::-webkit-scrollbar-track {
        background: transparent;
      }
      
      &::-webkit-scrollbar-thumb {
        background-color: rgba(0, 0, 0, 0.1);
        border-radius: 2px;
      }
      
      .chat-messages {
        display: flex;
        flex-direction: column;
        gap: 15px;
        
        .message {
          display: flex;
          max-width: 85%;
          
          &.user {
            align-self: flex-end;
            flex-direction: row-reverse;
            
            .message-content {
              background-color: #dcf8c6;
              border-radius: 18px 4px 18px 18px;
              margin-right: 10px;
            }
            
            .message-time {
              text-align: right;
            }
          }
          
          &.assistant {
            align-self: flex-start;
            
            .message-content {
              background-color: #fff;
              border-radius: 4px 18px 18px 18px;
              margin-left: 10px;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
            }
          }
          
          .message-avatar {
            width: 36px;
            height: 36px;
            flex-shrink: 0;
            
            .avatar-img {
              width: 100%;
              height: 100%;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 20px;
              background-color: #f0f0f0;
            }
            
            .ai-avatar {
              background-color: #e6f7ff;
            }
            
            .user-avatar {
              background-color: #f0f7e6;
            }
          }
          
          .message-content {
            padding: 10px 15px;
            border-radius: 18px;
            
            .message-text {
              font-size: 14px;
              line-height: 1.5;
              word-break: break-word;
            }
            
            .message-time {
              font-size: 11px;
              color: #999;
              margin-top: 5px;
            }
          }
        }
      }
    }
    
    .panel-footer {
      display: flex;
      align-items: center;
      padding: 10px 15px;
      background-color: #fff;
      border-top: 1px solid #eaeaea;
      
      .chat-input {
        flex: 1;
        border: 1px solid #ddd;
        border-radius: 20px;
        padding: 8px 15px;
        font-size: 14px;
        outline: none;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
        
        &:focus {
          border-color: #4f9bff;
          box-shadow: 0 0 0 2px rgba(79, 155, 255, 0.1);
        }
      }
      
      .send-btn {
        background-color: #4f9bff;
        color: white;
        border: none;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        margin-left: 10px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.2s ease, transform 0.2s ease;
        
        &:hover {
          background-color: #3d86e8;
          transform: scale(1.05);
        }
        
        &:disabled {
          background-color: #b0ccf5;
          cursor: not-allowed;
          transform: none;
        }
      }
    }
  }
  
  // 音乐播放面板样式
  .live2d-music-panel {
    position: absolute;
    bottom: 10px;
    left: 150px;
    width: 320px;
    height: 450px;
    background-color: #fff;
    border-radius: 20px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: slideIn 0.3s ease;
    z-index: 1002;
    
    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 20px;
      background-color: #f06292;
      border-bottom: 1px solid #e9446a;
      color: white;
      
      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
      }
      
      .close-btn {
        background: none;
        border: none;
        font-size: 20px;
        color: rgba(255, 255, 255, 0.8);
        cursor: pointer;
        transition: color 0.2s ease;
        
        &:hover {
          color: white;
        }
      }
    }
    
    .panel-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      
      .loading-music {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        color: #f06292;
        font-size: 14px;
        text-align: center;
        padding: 30px;
        
        &:after {
          content: '';
          display: inline-block;
          width: 20px;
          height: 20px;
          margin-left: 10px;
          border: 2px solid #f06292;
          border-radius: 50%;
          border-right-color: transparent;
          animation: spin 1s linear infinite;
        }
      }
      
      .music-error {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 30px 20px;
        height: 100%;
        text-align: center;
        
        p {
          margin-bottom: 20px;
          color: #f06292;
          font-size: 14px;
        }
        
        .music-input {
          display: flex;
          width: 100%;
          max-width: 260px;
          
          input {
            flex: 1;
            border: 1px solid #ddd;
            border-radius: 20px 0 0 20px;
            padding: 8px 15px;
            font-size: 14px;
            outline: none;
            
            &:focus {
              border-color: #f06292;
            }
          }
          
          button {
            background-color: #f06292;
            color: white;
            border: none;
            border-radius: 0 20px 20px 0;
            padding: 0 15px;
            cursor: pointer;
            transition: all 0.2s ease;
            
            &:hover {
              background-color: #e94976;
            }
          }
        }
      }
    }
  }
  
  // 翻译助手面板样式
  .live2d-translator-panel {
    position: absolute;
    bottom: 10px;
    left: 150px;
    width: 320px;
    height: 400px;
    background-color: #fff;
    border-radius: 20px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: slideIn 0.3s ease;
    z-index: 1002;
    
    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 20px;
      background-color: #4dabf7;
      border-bottom: 1px solid #339af0;
      color: white;
      
      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
      }
      
      .close-btn {
        background: none;
        border: none;
        font-size: 20px;
        color: rgba(255, 255, 255, 0.8);
        cursor: pointer;
        transition: color 0.2s ease;
        
        &:hover {
          color: white;
        }
      }
    }
    
    .panel-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 15px;
      gap: 15px;
      
      .translator-controls {
        .language-selector {
          display: flex;
          align-items: center;
          justify-content: space-between;
          
          select {
            flex: 1;
            padding: 8px;
            border-radius: 8px;
            border: 1px solid #ddd;
            outline: none;
            
            &:focus {
              border-color: #4dabf7;
            }
          }
          
          .direction-arrow {
            margin: 0 10px;
            font-weight: bold;
            color: #4dabf7;
          }
        }
      }
      
      .translator-input {
        flex: 1;
        
        textarea {
          width: 100%;
          height: 100%;
          min-height: 100px;
          border-radius: 8px;
          border: 1px solid #ddd;
          resize: none;
          padding: 10px;
          font-size: 14px;
          outline: none;
          
          &:focus {
            border-color: #4dabf7;
          }
        }
      }
      
      .translator-actions {
        display: flex;
        justify-content: center;
        
        .translate-btn {
          background-color: #4dabf7;
          color: white;
          border: none;
          padding: 8px 20px;
          border-radius: 20px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          
          &:hover {
            background-color: #339af0;
            transform: translateY(-2px);
          }
          
          &:disabled {
            background-color: #a5d8ff;
            cursor: not-allowed;
            transform: none;
          }
        }
      }
      
      .translator-result {
        background-color: #f8f9fa;
        border-radius: 8px;
        padding: 12px;
        
        .result-label {
          font-size: 12px;
          color: #868e96;
          margin-bottom: 6px;
        }
        
        .result-text {
          font-size: 14px;
          line-height: 1.5;
          color: #333;
        }
      }
    }
  }
  
  // 天气面板样式
  .live2d-weather-panel {
    position: absolute;
    bottom: 10px;
    left: 150px;
    width: 320px;
    height: 450px;
    background-color: #fff;
    border-radius: 20px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: slideIn 0.3s ease;
    z-index: 1002;
    
    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 20px;
      background-color: #51cf66;
      border-bottom: 1px solid #40c057;
      color: white;
      
      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
      }
      
      .close-btn {
        background: none;
        border: none;
        font-size: 20px;
        color: rgba(255, 255, 255, 0.8);
        cursor: pointer;
        transition: color 0.2s ease;
        
        &:hover {
          color: white;
        }
      }
    }
    
    .panel-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 15px;
      
      .weather-search {
        display: flex;
        margin-bottom: 15px;
        
        input {
          flex: 1;
          border: 1px solid #ddd;
          border-radius: 20px;
          padding: 8px 15px;
          font-size: 14px;
          outline: none;
          
          &:focus {
            border-color: #51cf66;
            box-shadow: 0 0 0 2px rgba(81, 207, 102, 0.1);
          }
        }
        
        button {
          background-color: #51cf66;
          color: white;
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          margin-left: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          
          &:hover {
            background-color: #40c057;
            transform: scale(1.05);
          }
          
          &:disabled {
            background-color: #b2f2bb;
            cursor: not-allowed;
            transform: none;
          }
        }
      }
      
      .weather-loading {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        color: #868e96;
        font-size: 14px;
      }
      
      .weather-result {
        flex: 1;
        display: flex;
        flex-direction: column;
        
        .weather-current {
          background-color: #f1f8e9;
          border-radius: 15px;
          padding: 20px;
          margin-bottom: 15px;
          text-align: center;
          
          .weather-city {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 5px;
          }
          
          .weather-temp {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 5px;
            color: #2b8a3e;
          }
          
          .weather-condition {
            font-size: 16px;
            color: #495057;
            margin-bottom: 10px;
          }
          
          .weather-details {
            display: flex;
            justify-content: space-around;
            font-size: 12px;
            color: #868e96;
          }
        }
        
        .weather-forecast {
          background-color: #f8f9fa;
          border-radius: 15px;
          padding: 15px;
          
          .forecast-title {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 10px;
            color: #495057;
            text-align: center;
          }
          
          .forecast-items {
            display: flex;
            justify-content: space-between;
            
            .forecast-item {
              flex: 1;
              text-align: center;
              padding: 10px 5px;
              
              .forecast-day {
                font-size: 14px;
                font-weight: 500;
                margin-bottom: 5px;
              }
              
              .forecast-condition {
                font-size: 12px;
                color: #495057;
                margin-bottom: 5px;
              }
              
              .forecast-temp {
                font-size: 12px;
                color: #868e96;
              }
            }
          }
        }
      }
      
      .weather-empty {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        color: #868e96;
        font-size: 14px;
      }
    }
  }
  
  // 待办事项面板样式
  .live2d-todo-panel {
    position: absolute;
    bottom: 10px;
    left: 150px;
    width: 320px;
    height: 400px;
    background-color: #fff;
    border-radius: 20px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: slideIn 0.3s ease;
    z-index: 1002;
    
    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 20px;
      background-color: #fab005;
      border-bottom: 1px solid #f59f00;
      color: white;
      
      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
      }
      
      .close-btn {
        background: none;
        border: none;
        font-size: 20px;
        color: rgba(255, 255, 255, 0.8);
        cursor: pointer;
        transition: color 0.2s ease;
        
        &:hover {
          color: white;
        }
      }
    }
    
    .panel-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 15px;
      
      .todo-input {
        display: flex;
        margin-bottom: 15px;
        
        input {
          flex: 1;
          border: 1px solid #ddd;
          border-radius: 20px;
          padding: 8px 15px;
          font-size: 14px;
          outline: none;
          
          &:focus {
            border-color: #fab005;
            box-shadow: 0 0 0 2px rgba(250, 176, 5, 0.1);
          }
        }
        
        button {
          background-color: #fab005;
          color: white;
          border: none;
          padding: 0 15px;
          border-radius: 20px;
          margin-left: 10px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
          
          &:hover {
            background-color: #f59f00;
            transform: translateY(-2px);
          }
        }
      }
      
      .todo-list {
        flex: 1;
        overflow-y: auto;
        
        &::-webkit-scrollbar {
          width: 4px;
        }
        
        &::-webkit-scrollbar-track {
          background: transparent;
        }
        
        &::-webkit-scrollbar-thumb {
          background-color: rgba(0, 0, 0, 0.1);
          border-radius: 2px;
        }
        
        .todo-item {
          display: flex;
          align-items: center;
          padding: 10px;
          border-bottom: 1px solid #f1f3f5;
          
          &.completed {
            .todo-text {
              text-decoration: line-through;
              color: #adb5bd;
            }
          }
          
          .todo-checkbox {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 2px solid #fab005;
            margin-right: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            background-color: #fff;
            cursor: pointer;
            transition: all 0.2s ease;
            
            &:hover {
              background-color: rgba(250, 176, 5, 0.1);
            }
          }
          
          &.completed .todo-checkbox {
            background-color: #fab005;
          }
          
          .todo-text {
            flex: 1;
            font-size: 14px;
            line-height: 1.5;
            word-break: break-word;
          }
          
          .todo-delete {
            width: 20px;
            height: 20px;
            color: #adb5bd;
            font-size: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            opacity: 0.5;
            transition: all 0.2s ease;
            
            &:hover {
              opacity: 1;
              color: #fa5252;
            }
          }
        }
      }
      
      .todo-empty {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        color: #868e96;
        font-size: 14px;
      }
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

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .live2d-container {
    left: 10px;
    bottom: 10px;
    
    .live2d-menu {
      width: 160px;
      bottom: 180px;
      left: 30px;
    }
    
    .live2d-speech-bubble {
      left: 30px;
    }
    
    .live2d-chat-panel,
    .live2d-music-panel,
    .live2d-translator-panel,
    .live2d-weather-panel,
    .live2d-todo-panel {
      left: 100px;
      width: calc(100vw - 120px);
      max-width: 320px;
    }
  }
}
</style> 
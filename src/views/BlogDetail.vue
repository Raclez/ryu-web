<template>
  <div class="blog-detail-container">
    <!-- 页面顶部进度条 -->
    <div class="scroll-progress-bar" :style="{width: `${scrollProgress}%`}"></div>

    <!-- 顶部导航栏 -->
    <AppHeader :categories="categories" />

    <!-- 加载状态 -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <div class="loading-text">Loading...</div>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button class="retry-btn" @click="() => fetchBlogDetail()">重试</button>
    </div>

    <!-- 博客内容 -->
    <div v-else-if="blog">
      <!-- 大图标题区 -->
      <div class="hero-section" :style="{ backgroundImage: `url('${blog.coverImageUrl || '@/assets/images/banner.jpg'}')` }">
        <div class="hero-overlay"></div>
        <div class="hero-content">
        <h1 class="blog-title">{{ blog.title }}</h1>
          <div class="author-info">
            <img :src="blog.authorAvatar" alt="author" class="author-avatar" />
            <span class="author-name">{{ blog.author }}</span>
            <span class="publish-date">{{ formattedDate }}</span>
            <span class="blog-views"><i>👁️</i>{{ blog.views }}</span>
          </div>
          </div>
      </div>

      <!-- 通知栏 -->
      <!-- <div class="notification-bar">
        <div v-if="notifications[0]" class="notification">
          <span>本文最后更新于 {{ formattedUpdateDate }}，若有错误请留言指正</span>
          <button class="close-btn" @click="closeNotification(1)">×</button>
        </div>
        <div v-if="notifications[1]" class="notification">
          <span>阅读时间约 {{ readingTime }} 分钟，共 {{ wordCount }} 个字</span>
          <button class="close-btn" @click="closeNotification(2)">×</button>
        </div>
      </div> -->

      <!-- 内容布局 -->
      <div class="content-container">
        <!-- 左侧栏 -->
        <div class="left-sidebar">
          <Live2DWidget :message="'正在阅读: ' + blog.title" />
          </div>

        <!-- 中间内容 -->
        <div class="main-content">
          <div class="blog-content-wrapper">
            <div class="blog-content" ref="blogContentRef" v-html="renderedContent"></div>

            <!-- 添加知识共享协议部分 -->
            <div class="license-section">
              <div class="license-container">
                <img src="https://licensebuttons.net/l/by-nc-sa/4.0/88x31.png" alt="Creative Commons License" class="license-img">
                <div class="license-text">
                  <p>本文采用 <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank">知识共享署名-非商业性使用-相同方式共享 4.0 国际 (CC BY-NC-SA 4.0)</a> 进行许可。</p>
                </div>
          </div>
        </div>

            <!-- 添加标签部分 -->
            <div class="blog-tags" v-if="blog.tags && blog.tags.length > 0">
              <span class="tag-label">标签：</span>
              <span v-for="(tag, index) in blog.tags" :key="index" class="tag">{{ tag }}</span>
          </div>

            <!-- 添加相关推荐部分 -->
            <div class="related-posts-section">
              <h3 class="related-posts-title">相关推荐</h3>
              <div class="related-posts-container">
                <div v-if="prevPost" class="related-post-card prev-post" @click="goToPost(prevPost)">
                  <div class="related-post-image">
                    <img :src="prevPost.coverImageUrl" :alt="prevPost.title" />
                    <div class="related-post-overlay">
                      <div class="related-post-label">PREVIOUS POST</div>
                      <div class="related-post-title">{{ prevPost.title }}</div>
                    </div>
                  </div>
                </div>
                <div v-if="nextPost" class="related-post-card next-post" @click="goToPost(nextPost)">
                  <div class="related-post-image">
                    <img :src="nextPost.coverImageUrl" :alt="nextPost.title" />
                    <div class="related-post-overlay">
                      <div class="related-post-label">NEXT POST</div>
                      <div class="related-post-title">{{ nextPost.title }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 添加评论区部分 -->
            <div class="comments-section">
              <h3 class="comments-title">
                <span class="comments-icon">💬</span>
                评论 ({{ comments.length }})
                <span class="title-decoration"></span>
              </h3>

              <!-- 评论列表 -->
              <div class="comments-list">
                <transition-group name="comment-fade">
                  <div v-for="(comment, index) in comments" :key="index" class="comment-item">
                    <div class="comment-avatar">
                      <img :src="comment.avatar" :alt="comment.name">
                      <div class="avatar-glow"></div>
                    </div>
                    <div class="comment-content">
                      <div class="comment-header">
                        <div class="comment-info">
                          <span class="comment-name">{{ comment.name }}</span>
                          <span class="comment-date">{{ formatCommentDate(comment.date) }}</span>
                        </div>
                        <div class="comment-actions">
                          <button @click="toggleLike(index)" class="like-button" :class="{ 'liked': comment.liked }">
                            <i class="heart-icon">❤️</i>
                            <span class="like-count">{{ comment.likes }}</span>
                          </button>
                          <button class="reply-button">
                            <i class="reply-icon">↩️</i>
                            <span>回复</span>
                          </button>
                        </div>
                      </div>
                      <div class="comment-text">{{ comment.content }}</div>
                    </div>
                  </div>
                </transition-group>
              </div>

              <!-- 评论表单 -->
              <div class="comment-form">
                <div class="form-decorations">
                  <div class="decoration-star decoration-star-1"></div>
                  <div class="decoration-star decoration-star-2"></div>
                  <div class="decoration-star decoration-star-3"></div>
                </div>
                <h4 class="form-title">
                  <span class="form-icon">✏️</span>
                  发表评论
                </h4>
                <div class="form-row">
                  <div class="form-group">
                    <label for="name">昵称 <span class="required">*</span></label>
                    <div class="input-wrapper">
                      <span class="input-icon">👤</span>
                      <input type="text" id="name" v-model="newComment.name" placeholder="请输入您的昵称">
                    </div>
                  </div>
                  <div class="form-group">
                    <label for="email">邮箱</label>
                    <div class="input-wrapper">
                      <span class="input-icon">📧</span>
                      <input type="email" id="email" v-model="newComment.email" placeholder="请输入您的邮箱（选填）">
                    </div>
                  </div>
                </div>
                <div class="form-group">
                  <label for="comment">评论内容 <span class="required">*</span></label>
                  <div class="textarea-wrapper">
                    <textarea id="comment" v-model="newComment.content" placeholder="请输入您的评论，支持友善的讨论~"></textarea>
                    <div class="textarea-decoration">
                      <div class="anime-decoration"></div>
                    </div>
                  </div>
                </div>
                <div class="form-footer">
                  <div class="comment-tips">
                    <i class="tip-icon">💡</i>
                    <span>请文明发言，共建和谐社区</span>
                  </div>
                  <button @click="submitComment" class="submit-button">
                    <span class="submit-icon">📮</span>
                    <span>提交评论</span>
                    <span class="button-effect"></span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧栏 -->
          <div class="right-sidebar">
          <!-- 目录 -->
          <div class="catalog">
            <h3 class="catalog-title">
              <span class="category-icon">📋</span>
              <span class="category-title-text">目录</span>
            </h3>
            <ul class="catalog-list" v-if="toc.length">
              <li
                v-for="item in toc"
                :key="item.id"
                :class="[`level-${item.level}`, { active: activeHeading === item.id }]"
                @click="scrollToHeading(item.id)"
                  >
                    {{ item.text }}
                </li>
              </ul>
            <div v-else class="empty-toc">
              此文章没有目录
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 回到顶部 -->
    <button v-if="!loading && blog && showBackToTop" class="back-to-top" @click="backToTop">
      <span>↑</span>
    </button>

    <!-- 页脚 -->
    <AppFooter/>
  </div>
</template>

<script setup lang="ts">
import {computed, nextTick, onMounted, onUnmounted, ref, watch} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {useBlogStore} from '@/store';
import AppHeader from '@/components/AppHeader.vue';
import Live2DWidget from '@/components/Live2DWidget.vue';
import AppFooter from '@/components/AppFooter.vue';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';
import {getRecommendBlog, recordBlogView} from '@/api/post';
import {getOrCreateVisitorId} from '@/utils/visitorUtils';

const route = useRoute();
const router = useRouter();
const blogStore = useBlogStore();

// 定义类型接口
interface TocItem {
  id: string;
  level: number;
  text: string | null;
}

interface CommentType {
  name: string;
  avatar: string;
  date: Date;
  content: string;
  likes: number;
  liked: boolean;
}

interface PostPreview {
  id: string;
  title: string;
  coverImageUrl: string;
  createTime: Date;
}

interface NewCommentType {
  name: string;
  email: string;
  content: string;
}

const loading = ref<boolean>(true);
const error = ref<string | null>(null);
const blog = ref<any>(null);
const categories = ref<any[]>([]);
const scrollProgress = ref<number>(0);
const readingTime = ref<number>(0);
const wordCount = ref<number>(0);
const notifications = ref<boolean[]>([true, true]);
const toc = ref<TocItem[]>([]);
const activeHeading = ref<string>('');
const showBackToTop = ref<boolean>(false);
const renderedContent = ref<string>('');
const blogContentRef = ref<HTMLElement | null>(null);
const prevPost = ref<PostPreview | null>(null);
const nextPost = ref<PostPreview | null>(null);

// 添加浏览时间记录
const viewStartTime = ref<number>(0);
const viewingTime = ref<number>(0);
const viewTimerId = ref<number | null>(null);
const isPageVisible = ref<boolean>(true);
const currentBlogId = ref<string>('');

// 记录浏览开始时间并启动计时器
const startViewTracking = (id: string) => {
  if (currentBlogId.value === id && viewTimerId.value !== null) {
    // 已经在记录这篇文章，不需要重新开始
    return;
  }

  // 如果之前在记录其他文章，先结束那篇文章的记录
  if (currentBlogId.value && currentBlogId.value !== id) {
    endViewTracking();
  }

  currentBlogId.value = id;
  viewStartTime.value = Date.now();
  viewingTime.value = 0;
  console.log('开始记录浏览时间:', id, new Date(viewStartTime.value).toISOString());

  // 每秒更新一次浏览时间
  viewTimerId.value = window.setInterval(() => {
    if (isPageVisible.value) {
      viewingTime.value += 1;
    }
  }, 1000);
};

// 结束浏览记录并发送数据
const endViewTracking = async () => {
  if (currentBlogId.value && viewStartTime.value > 0) {
    // 清除计时器
    if (viewTimerId.value !== null) {
      clearInterval(viewTimerId.value);
      viewTimerId.value = null;
    }

    const viewDuration = viewingTime.value; // 使用累计的浏览时间（秒）
    console.log('结束记录浏览时间:', currentBlogId.value, '浏览时长:', viewDuration, '秒');

    try {
      await recordBlogView({
        postId: currentBlogId.value,
        viewDuration,
        referrer: document.referrer,
        visitorId: getOrCreateVisitorId()
      });
    } catch (error) {
      console.error('记录浏览历史失败:', error);
    }

    // 重置记录
    viewStartTime.value = 0;
    viewingTime.value = 0;
    currentBlogId.value = '';
  }
};

// 处理页面可见性变化
const handleVisibilityChange = () => {
  isPageVisible.value = document.visibilityState === 'visible';
  console.log('页面可见性变化:', isPageVisible.value ? '可见' : '隐藏');
};

const formattedDate = computed(() => {
  if (!blog.value || !blog.value.createTime) return '';
  return formatDate(blog.value.createTime);
});

// 格式化日期
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diff = Math.floor(diffTime / 1000 / 60 / 60 / 24);

  if (diff === 0) {
    return '今天';
  } else if (diff === 1) {
    return '昨天';
  } else if (diff < 30) {
    return `${diff}天前`;
  } else {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
};

// 新增一个专门用于格式化评论日期的函数
const formatCommentDate = (date: Date): string => {
  if (!date) return '';

  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diff = Math.floor(diffTime / 1000 / 60 / 60 / 24);

  if (diff === 0) {
    return '今天';
  } else if (diff === 1) {
    return '昨天';
  } else if (diff < 30) {
    return `${diff}天前`;
  } else {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
};

// 检查内容是否过期
/* const isContentExpired = (updateTime: string): boolean => {
  if (!updateTime) return false;
  const now = new Date();
  const lastUpdate = new Date(updateTime);
  const diffTime = now.getTime() - lastUpdate.getTime();
  const diffDays = diffTime / (1000 * 3600 * 24);
  return diffDays > 180; // 超过180天视为过期
}; */

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str: string, lang: string): string {
    if (lang && hljs.getLanguage(lang)) {
      try {
        const highlighted = hljs.highlight(str, { language: lang }).value;

        // 创建带Mac风格窗口的代码块
        return `<div class="code-block">
          <div class="code-header">
            <div class="code-dots">
              <span class="dot red"></span>
              <span class="dot yellow"></span>
              <span class="dot green"></span>
            </div>
            <div class="code-lang">${lang.toUpperCase()}</div>
            <div class="code-copy">复制</div>
          </div>
          <pre class="hljs"><code>${highlighted}</code></pre>
        </div>`;
      } catch (__) {}
    }

    // 默认样式
    return `<div class="code-block">
      <div class="code-header">
        <div class="code-dots">
          <span class="dot red"></span>
          <span class="dot yellow"></span>
          <span class="dot green"></span>
        </div>
        <div class="code-lang">CODE</div>
        <div class="code-copy">复制</div>
      </div>
      <pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>
    </div>`;
  }
});

const fetchBlogDetail = async (id?: string): Promise<void> => {
  loading.value = true;
  error.value = null;

  try {
    if (id) {
      blog.value = await blogStore.fetchBlogById(id);

      // 开始记录浏览时间
      startViewTracking(id);
    } else {
      blog.value = await blogStore.fetchBlogById('1');

      // 开始记录浏览时间
      startViewTracking('1');
    }

    console.log('blog', blog.value);

    // 渲染Markdown内容
    renderedContent.value = renderContent(blog.value.content);
    const res = await getRecommendBlog(blog.value.id, 2);

    if (res.code === 200 && res.data && Array.isArray(res.data)) {
      const recommendBlog = res.data;
      console.log('recommendBlog', recommendBlog[0]);

      if (recommendBlog.length > 0 && recommendBlog[0]) {
        prevPost.value = {
          id: recommendBlog[0].id,
          title: recommendBlog[0].title,
          coverImageUrl: recommendBlog[0].coverImageUrl,
          createTime: new Date() // 添加默认日期，解决TypeScript错误
        };
      }

      if (recommendBlog.length > 1 && recommendBlog[1]) {
        nextPost.value = {
          id: recommendBlog[1].id,
          title: recommendBlog[1].title,
          coverImageUrl: recommendBlog[1].coverImageUrl,
          createTime: new Date() // 添加默认日期，解决TypeScript错误
        };
      }
    }

    // 获取前后文章
    // prevPost.value = {
    //   id: '1',
    //   title: 'Middleware',
    //   coverImageUrl: 'https://picsum.photos/400/300?random=4',
    //   createTime: new Date('2023-04-20')
    // };

    // nextPost.value = {
    //   id: '3',
    //   title: 'Drools规则引擎-CSDN博客',
    //   coverImageUrl: 'https://picsum.photos/400/300?random=5',
    //   createTime: new Date('2023-05-15')
    // };

    // 检查内容是否过期
    // if (isContentExpired(mockData.updateTime)) {
    //   notifications.value[0] = true;
    // }

  } catch (err) {
    console.error('获取博客详情失败:', err);
    error.value = '获取博客详情失败，请稍后重试';
  } finally {
    loading.value = false;
  }
};

const renderContent = (content: string): string => {
  if (!content) return '';

  // 替换Markdown标题格式，移除多余的#和数字前缀
  let processedContent = content
    .replace(/^### (\d+\.\d+) /gm, '### ')  // 替换类似 ### 10.4 这样的标题格式
    .replace(/^### (\d+\.) /gm, '### ')     // 替换类似 ### 10. 这样的标题格式
    .replace(/^### (\d+) /gm, '### ')       // 替换类似 ### 10 这样的标题格式
    .replace(/^## (\d+\.\d+) /gm, '## ')    // 替换二级标题
    .replace(/^## (\d+\.) /gm, '## ')
    .replace(/^## (\d+) /gm, '## ')
    .replace(/^# (\d+\.\d+) /gm, '# ')      // 替换一级标题
    .replace(/^# (\d+\.) /gm, '# ')
    .replace(/^# (\d+) /gm, '# ');

  const markdownIt = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    highlight: function (str: string, lang: string): string {
      if (lang && hljs.getLanguage(lang)) {
        try {
          const code = hljs.highlight(str, { language: lang }).value;
          return `<div class="code-block"><div class="code-header"><div class="code-dots"><span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span></div><span class="code-lang">${lang}</span><span class="code-copy" data-code="${encodeURIComponent(str)}">复制</span></div><pre><code class="hljs ${lang}">${code}</code></pre></div>`;
        } catch (__) {}
      }

      const escapedStr: string = markdownIt.utils.escapeHtml(str);
      return `<div class="code-block"><div class="code-header"><div class="code-dots"><span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span></div><span class="code-lang">plaintext</span><span class="code-copy" data-code="${encodeURIComponent(str)}">复制</span></div><pre><code class="hljs">${escapedStr}</code></pre></div>`;
    }
  });

  let rendered = markdownIt.render(processedContent);

  // 计算阅读时间和字数
  wordCount.value = content.replace(/\s+/g, '').length;
  readingTime.value = Math.ceil(wordCount.value / 400); // 假设阅读速度400字/分钟

  // 提取目录并更新HTML，确保标题有id
  const htmlWithIds = extractTOC(rendered);

  // 如果htmlWithIds有值，则使用它，否则使用原始rendered
  rendered = htmlWithIds || rendered;

  // 添加代码复制功能
  setTimeout(() => {
    document.querySelectorAll('.code-copy').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const code = decodeURIComponent(target.getAttribute('data-code') || '');
        navigator.clipboard.writeText(code).then(() => {
          target.classList.add('copied');
          target.textContent = '已复制';
          setTimeout(() => {
            target.classList.remove('copied');
            target.textContent = '复制';
          }, 2000);
        });
      });
    });
  }, 100);

  return rendered;
};

const extractTOC = (html: string): string | null => {
  const div = document.createElement('div');
  div.innerHTML = html;

  const headings = div.querySelectorAll('h1, h2, h3, h4');
  const tocItems: TocItem[] = [];

  headings.forEach((heading: Element, index: number) => {
    const level = parseInt(heading.tagName.substring(1));
    const id = heading.id || `heading-${index}`;

    // 确保heading有id属性，用于定位
    if (!heading.id) {
      heading.id = id;
    }

    tocItems.push({
      id,
      level,
      text: heading.textContent
    });
  });

  toc.value = tocItems;

  // 返回HTML字符串，以便在DOM中应用修改后的id
  return div.innerHTML;
};

const scrollToHeading = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    // 获取目标元素的位置
    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // 计算目标滚动位置，考虑顶部间距
    const targetPosition = scrollTop + rect.top - 100; // 100px的顶部间距

    // 平滑滚动到目标位置
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });

    // 设置当前活动标题
    activeHeading.value = id;

    // 高亮显示目标元素
    element.classList.add('highlight-heading');
    setTimeout(() => {
      element.classList.remove('highlight-heading');
    }, 2000);
  }
};

const handleScroll = () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  scrollProgress.value = (scrollTop / docHeight) * 100;

  // 显示/隐藏回到顶部按钮
  showBackToTop.value = scrollTop > 300;

  // 更新当前活动的目录项
  updateActiveHeading();

  // 更新目录位置
  updateCatalogPosition();
};

const updateActiveHeading = () => {
  if (toc.value.length === 0) return;

  const headings = toc.value.map(item => document.getElementById(item.id));
  const scrollPosition = window.scrollY + 100;

  for (let i = headings.length - 1; i >= 0; i--) {
    const element = headings[i];
    if (element && element.offsetTop <= scrollPosition) {
      activeHeading.value = toc.value[i].id;
      break;
    }
  }
};

const updateCatalogPosition = () => {
  const catalog = document.querySelector('.catalog') as HTMLElement;
  const mainContent = document.querySelector('.content-wrapper');
  const commentsSection = document.querySelector('.comments-section');

  if (catalog && mainContent && commentsSection) {
    // 移除未使用的变量
    // const catalogRect = catalog.getBoundingClientRect();
    // const mainContentRect = mainContent.getBoundingClientRect();
    const commentsSectionRect = commentsSection.getBoundingClientRect();

    // 计算评论区顶部相对于视口的位置
    const commentsSectionTop = commentsSectionRect.top;
    const viewportHeight = window.innerHeight;

    // 如果评论区进入可视区域
    if (commentsSectionTop < viewportHeight) {
      // 计算目录应该缩短的距离
      const overlap = viewportHeight - commentsSectionTop;
      // 限制目录最大高度
      catalog.style.maxHeight = `calc(100vh - 40px - ${overlap}px)`;
    } else {
      // 恢复默认最大高度
      catalog.style.maxHeight = 'calc(100vh - 40px)';
    }
  }
};

const backToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

// 保留closeNotification函数但使用它
const closeNotification = (index: number): void => {
  // 确保index在有效范围内
  if (index >= 0 && index < notifications.value.length) {
    notifications.value.splice(index, 1);
  }
};

// 生命周期钩子
onMounted(() => {
  if (route.params.id) {
    fetchBlogDetail(typeof route.params.id === 'string' ? route.params.id : route.params.id[0]);
  } else {
    fetchBlogDetail('1');
  }

  window.addEventListener('scroll', handleScroll);
  // 添加页面可见性变化事件监听
  document.addEventListener('visibilitychange', handleVisibilityChange);

  // 初始加载时也检查一次位置
  nextTick(() => {
    updateCatalogPosition();
  });
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  document.removeEventListener('visibilitychange', handleVisibilityChange);

  // 在组件卸载前结束浏览记录
  endViewTracking();

  // 确保清除计时器
  if (viewTimerId.value !== null) {
    clearInterval(viewTimerId.value);
    viewTimerId.value = null;
  }
});

// 监听路由变化
watch(() => route.params.id, (newId) => {
  if (newId) {
    // 结束上一篇文章的浏览记录
    endViewTracking();
    // 获取新文章
    fetchBlogDetail(typeof newId === 'string' ? newId : newId[0]);
  }
});

// 添加评论相关的响应式变量
const comments = ref<CommentType[]>([
  {
    name: '动漫迷',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    date: new Date('2023-05-15'),
    content: '这篇文章真的太棒了，学到了很多关于算法的知识！',
    likes: 15,
    liked: false
  },
  {
    name: '编程少女',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    date: new Date('2023-05-10'),
    content: '代码示例非常清晰，解释得也很详细。期待更多类似的文章！',
    likes: 8,
    liked: false
  },
  {
    name: 'CodeMaster',
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
    date: new Date('2023-05-05'),
    content: '我有个问题，时间复杂度还能再优化吗？',
    likes: 3,
    liked: false
  }
]);

const newComment = ref<NewCommentType>({
  name: '',
  email: '',
  content: ''
});

// 点赞功能
const toggleLike = (index: number): void => {
  const comment = comments.value[index];
  if (comment.liked) {
    comment.likes--;
  } else {
    comment.likes++;
  }
  comment.liked = !comment.liked;
};

// 提交评论
const submitComment = (): void => {
  if (!newComment.value.name || !newComment.value.content) {
    alert('昵称和评论内容不能为空！');
    return;
  }

  const comment: CommentType = {
    name: newComment.value.name,
    avatar: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 100)}.jpg`,
    date: new Date(),
    content: newComment.value.content,
    likes: 0,
    liked: false
  };

  comments.value.unshift(comment);

  // 重置表单
  newComment.value = {
    name: '',
    email: '',
    content: ''
  };
};

// 添加跳转到相关文章的函数
const goToPost = async (post: PostPreview): Promise<void> => {
  try {
    // 结束当前文章的浏览记录
    await endViewTracking();

    // 导航到博客详情页
    router.push({name: 'BlogDetail', params: {id: post.id}});
  } catch (error) {
    console.error('跳转文章失败:', error);
    // 即使失败，仍然导航到博客详情页
    router.push({name: 'BlogDetail', params: {id: post.id}});
  }
};
</script>

<style lang="scss" scoped>
.blog-detail-container {
  background-color: #1c1c1c;
  color: #e0e0e0;
  min-height: 100vh;
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
  position: relative;
}

// 滚动进度条
.scroll-progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  background: linear-gradient(90deg, #ffcc00, #ff5722);
  z-index: 1000;
  transition: width 0.1s;
}

// 加载状态
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;

  .spinner {
    width: 50px;
    height: 50px;
    border: 3px solid rgba(255, 204, 0, 0.2);
    border-top: 3px solid #ffcc00;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .loading-text {
    margin-top: 16px;
    font-size: 16px;
    color: #bbb;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
}

// 错误状态
.error {
  text-align: center;
  padding: 100px 0;

  p {
    color: #e74c3c;
    margin-bottom: 20px;
  }

  .retry-btn {
    background-color: #ffcc00;
    color: #1c1c1c;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;

    &:hover {
      background-color: #e6b800;
    }
  }
}

// 大图标题区
.hero-section {
  position: relative;
  height: 350px;
  background-size: cover;
  background-position: center;

  .hero-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
  }

  .hero-content {
    position: absolute;
    bottom: 50px;
    left: 0;
    width: 100%;
    text-align: center;
    color: white;
    padding: 0 20px;

    .blog-title {
      font-size: 2.5rem;
      font-weight: 600;
      margin-bottom: 20px;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    }

    .author-info {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 15px;

      .author-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 2px solid #ffcc00;
      }

      .author-name, .publish-date, .blog-views {
        font-size: 0.9rem;
        opacity: 0.9;

        i {
          margin-right: 5px;
        }
      }

      .publish-date:before, .blog-views:before {
        content: '•';
        margin-right: 15px;
        opacity: 0.7;
      }
    }
  }
}

// 通知栏
.notification-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
  margin: 20px auto;
  max-width: 900px;

  .notification {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 20px;
    font-size: 14px;
    color: #e0e0e0;
    background-color: rgba(44, 44, 44, 0.6);
    border-left: 4px solid #ffcc00;
    border-radius: 0 6px 6px 0;
    margin-bottom: 12px;
    width: 100%;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
    animation: fadeInDown 0.5s ease;

    &:first-child {
      border-left-color: #3498db;
    }

    &:hover {
      background-color: rgba(50, 50, 50, 0.7);
      transform: translateY(-2px);
    }

    span {
      display: flex;
      align-items: center;

      &:before {
        content: '';
        display: inline-block;
        width: 16px;
        height: 16px;
        margin-right: 10px;
        background-image: url('@/assets/images/logo.png');
        background-size: contain;
        background-repeat: no-repeat;
      }
    }

    .close-btn {
      background: none;
      border: none;
      color: #999;
      font-size: 18px;
      cursor: pointer;
      padding: 0 5px;
      transition: all 0.2s ease;

      &:hover {
        color: white;
        transform: rotate(90deg);
      }
    }
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 内容布局
.content-container {
  display: grid;
  grid-template-columns: 120px minmax(0, 800px) 300px; // 减少中间内容区域宽度，从1200px改为800px
  gap: 30px;
  max-width: 1220px; // 减少整体最大宽度，从1620px改为1220px
  margin: 0 auto;
  padding: 30px 20px;

  @media (max-width: 1100px) {
    grid-template-columns: 120px minmax(0, 1fr);

    .right-sidebar {
      display: none;
    }
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    padding: 20px 10px;

    .left-sidebar {
      display: none;
    }
  }
}

// 左侧栏
.left-sidebar {
  .live2d-widget {
    position: sticky;
    top: 120px;
    height: 300px;
  }
}

// 中间内容
.main-content {
  background-color: transparent;
  border-radius: 0;
  overflow: hidden;
  box-shadow: none;
  border: none;

  .blog-content-wrapper {
    padding: 0;
    font-size: 16px;
    line-height: 1.8;
    color: #e0e0e0;
    background-color: #1c1c1c;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    overflow: hidden;

    .blog-content {
      padding: 40px;

      @media (max-width: 768px) {
        padding: 20px 15px;
      }

      // 内容区域的宽度限制
      > div {
        max-width: 100%;
        margin: 0 auto;
        letter-spacing: 0.3px;
      }

      // 代码块样式
      :deep(.code-block) {
        margin: 30px -40px; // 使用更大的负边距使代码块超出内容区域
        border-radius: 0;
        overflow: visible; // 改为visible，确保代码可以超出容器
        background-color: #161b22;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
        position: relative; // 添加相对定位
        width: calc(100% + 80px); // 宽度增加与负margin相对应

        @media (max-width: 768px) {
          margin: 25px -15px; // 移动端调整
          width: calc(100% + 30px); // 移动端宽度调整
        }

        .code-header {
          display: flex;
          align-items: center;
          background-color: #0d1117;
          padding: 10px 40px; // 增加内边距与内容对齐
          border-bottom: 1px solid #30363d;

          @media (max-width: 768px) {
            padding: 8px 15px; // 移动端调整
          }

          .code-dots {
            display: flex;
            gap: 6px;
            margin-right: 15px;

            .dot {
              width: 12px;
              height: 12px;
              border-radius: 50%;

              &.red {
                background-color: #ff5f56;
              }

              &.yellow {
                background-color: #ffbd2e;
              }

              &.green {
                background-color: #27c93f;
              }
            }
          }

          .code-lang {
            flex: 1;
            font-size: 12px;
            color: #8b949e;
          }

          .code-copy {
            font-size: 12px;
            color: #8b949e;
            cursor: pointer;
            padding: 2px 6px;
            border-radius: 4px;

            &:hover {
              background-color: #30363d;
              color: #c9d1d9;
            }

            &.copied {
              color: #27c93f;
            }
          }
        }

        /* 强制增强特异性 */
        pre, pre code, .hljs {
          &::-webkit-scrollbar {
            height: 8px !important; // 增加滚动条高度
            width: 8px !important;
          }

          &::-webkit-scrollbar-track {
            background: #161b22 !important;
          }

          &::-webkit-scrollbar-thumb {
            background: rgba(255, 204, 0, 0.5) !important; /* 黄色滚动条 */
            border-radius: 4px !important;
            border: none !important;
          }

          &::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 204, 0, 0.8) !important; /* 黄色滚动条悬停状态 */
          }
        }

        pre {
          margin: 0;
          padding: 25px 40px; // 增加内边距使代码显示更舒适
          overflow-x: auto;
          font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
          font-size: 15px; // 增加字体大小
          line-height: 1.6;
          max-width: 100%;
          width: 100%;
          background-color: #161b22; // 确保背景颜色正确

          @media (max-width: 768px) {
            padding: 15px; // 移动端调整
            font-size: 13px;
          }

          code {
            background: transparent;
            padding: 0;
            white-space: pre;
            word-break: normal;
            word-wrap: normal;
            width: auto;
            max-width: 100%;
            position: relative;

            &::after {
              content: none;
              display: none;
            }
          }
        }
      }

      // 标题样式
      :deep(h1), :deep(h2), :deep(h3), :deep(h4) {
        margin-top: 50px;
        margin-bottom: 25px;
        color: white;
        font-weight: 600;
        position: relative;
        scroll-margin-top: 100px; // 跳转时留出顶部空间
        transition: color 0.3s ease;
        letter-spacing: 0.5px;
        line-height: 1.4;

        &.highlight-heading {
          color: #ffcc00;
          animation: pulse 2s ease;
        }
      }

      @keyframes pulse {
        0% {
          background-color: rgba(255, 204, 0, 0.1);
        }
        50% {
          background-color: rgba(255, 204, 0, 0.2);
        }
        100% {
          background-color: transparent;
        }
      }

      :deep(h1) {
        font-size: 1.8em;
        border-bottom: 1px solid #333;
        padding-bottom: 10px;
        color: #ffcc00;
      }

      :deep(h2) {
        font-size: 1.5em;
      }

      :deep(h3) {
        font-size: 1.3em;
      }

      :deep(h4) {
        font-size: 1.1em;
      }

      // 段落样式
      :deep(p) {
        margin-bottom: 24px;
        text-align: justify;
        line-height: 1.9;
        letter-spacing: 0.3px;
        font-size: 16px;
      }

      // 链接样式
      :deep(a) {
        color: #ffcc00;
        text-decoration: none;
        position: relative;

        &:hover {
          color: #ffdd33;
        }

        &:after {
          content: '';
          position: absolute;
          width: 100%;
          transform: scaleX(0);
          height: 1px;
          bottom: 0;
          left: 0;
          background-color: #ffcc00;
          transform-origin: bottom right;
          transition: transform 0.3s ease-out;
        }

        &:hover:after {
          transform: scaleX(1);
          transform-origin: bottom left;
        }
      }

      // 列表样式
      :deep(ul), :deep(ol) {
        margin-bottom: 28px;
        margin-top: 16px;
        padding-left: 26px;
      }

      :deep(ul) {
        list-style: none; // 移除默认列表样式

        li {
          margin-bottom: 12px;
          line-height: 1.7;
          position: relative;
          padding-left: 4px;
        }

        li::before {
          content: '';
          position: absolute;
          left: -14px;
          top: 10px;
          width: 6px;
          height: 6px;
          background-color: rgba(255, 204, 0, 0.7);
          border-radius: 50%;
        }
      }

      :deep(ol) {
        list-style: none; // 移除默认列表样式
        counter-reset: item;

        li {
          counter-increment: item;
          position: relative;
          padding-left: 4px;
          margin-bottom: 12px;
          line-height: 1.7;
        }

        li::before {
          content: counter(item) ".";
          position: absolute;
          left: -20px;
          top: 0;
          background-color: transparent;
          color: rgba(255, 204, 0, 0.8);
          font-weight: bold;
          border-radius: 0;
          width: auto;
          height: auto;
        }
      }

      // 引用样式
      :deep(blockquote) {
        background-color: rgba(44, 44, 44, 0.5);
        border-left: 4px solid rgba(255, 204, 0, 0.7);
        padding: 20px;
        margin: 30px 0;
        color: #d0d0d0;
        font-style: italic;
        font-size: 15px;
        line-height: 1.7;
        letter-spacing: 0.3px;
        border-radius: 0 4px 4px 0;
        position: relative;

        p {
          margin-bottom: 0;
        }

        &::before {
          content: '"';
          font-size: 28px;
          color: rgba(255, 204, 0, 0.4);
          position: absolute;
          left: 10px;
          top: 0;
        }
      }
    }

    // 内联代码
    :deep(code:not(pre code)) {
      background-color: rgba(40, 40, 40, 0.5);
      padding: 3px 6px;
      border-radius: 4px;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 0.9em;
      color: #ff9580;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    // 表格样式
    :deep(table) {
  width: 100%;
      border-collapse: collapse;
      margin: 30px 0;
      font-size: 15px;
      border: 1px solid #2c2c2c;

      th, td {
        border: 1px solid #2c2c2c;
        padding: 14px 18px;
        text-align: left;
      }

      th {
        background-color: rgba(31, 41, 55, 0.7);
        font-weight: 600;
        color: #ffcc00;
        text-transform: uppercase;
        font-size: 13px;
        letter-spacing: 0.5px;
      }

      tr:nth-child(even) {
        background-color: rgba(40, 40, 40, 0.4);
      }

      tr:hover {
        background-color: rgba(50, 50, 50, 0.5);
      }
    }

    // 图片样式
    :deep(img) {
      max-width: 100%;
  border-radius: 6px;
      margin: 20px 0;
      display: block;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    }

    // 知识共享协议
    .license-section {
      margin-top: 40px;
      padding: 20px;
      background-color: #1c1c1c;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .license-container {
  display: flex;
      align-items: center;
      gap: 20px;
    }

    .license-img {
      width: 88px;
      height: 31px;
    }

    .license-text {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.8);
    }

    .license-text a {
      color: #ffcc00;
      text-decoration: none;
    }

    .license-text a:hover {
      text-decoration: underline;
    }

    // 标签容器
    .blog-tags {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      margin-top: 30px;
      padding: 15px 0;
    }

    .tag-label {
      font-size: 14px;
      margin-right: 10px;
      color: rgba(255, 255, 255, 0.7);
    }

    .tag {
      display: inline-block;
      padding: 3px 10px;
      margin: 0 5px 5px 0;
      background-color: rgba(255, 255, 255, 0.05);
      color: #e0e0e0;
      border-radius: 3px;
      font-size: 13px;
      transition: all 0.3s ease;
    }

    .tag:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    // 相关推荐
    .related-posts-section {
      margin-top: 40px;
      padding: 20px 0;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .related-posts-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 20px;
      padding-bottom: 10px;
      color: #fff;
    }

    .related-posts-container {
      display: flex;
      gap: 20px;
      justify-content: space-between;
    }

    .related-post-card {
      width: calc(50% - 10px);
      height: 200px;
      border-radius: 8px;
      transition: all 0.3s ease;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    }

    .related-post-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
    }

    .related-post-image {
      position: relative;
      width: 100%;
      height: 100%;
    }

    .related-post-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }

    .related-post-card:hover .related-post-image img {
      transform: scale(1.1);
    }

    .related-post-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.8));
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 20px;
      text-align: center;
    }

    .related-post-label {
      font-size: 12px;
      font-weight: 600;
      color: #ffcc00;
      margin-bottom: 10px;
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    .related-post-title {
      font-size: 16px;
      font-weight: 500;
      line-height: 1.4;
      color: #ffffff;
      text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
    }

    .prev-post .related-post-overlay, .next-post .related-post-overlay {
      transition: background-color 0.3s ease;
    }

    .prev-post:hover .related-post-overlay, .next-post:hover .related-post-overlay {
      background: linear-gradient(to bottom, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.9));
    }

    // 评论区
    .comments-section {
      margin-top: 40px;
      padding: 20px 0;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      animation: fadeIn 0.8s ease;
      position: relative;

      &::before {
        content: '';
        position: absolute;
        top: -1px;
        left: 0;
        width: 100%;
        height: 1px;
        background: linear-gradient(to right, transparent, rgba(255, 204, 0, 0.5) 50%, transparent);
      }
    }

    .comments-title {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 25px;
      color: #fff;
      display: flex;
      align-items: center;
      font-family: 'Comic Sans MS', 'Ma Shan Zheng', cursive;
      position: relative;
      padding-bottom: 12px;

      .comments-icon {
        margin-right: 10px;
        font-size: 22px;
        animation: bounce 2s infinite;
      }

      .title-decoration {
        position: absolute;
        right: 0;
        bottom: 0;
        width: 80%;
        height: 12px;
        background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 10"><path fill="none" stroke="%23ffcc00" stroke-width="2" d="M0,5 C20,0 30,10 50,5 C70,0 80,10 100,5" /></svg>');
        background-repeat: repeat-x;
        background-size: auto 100%;
        opacity: 0.4;
      }

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 60px;
        height: 3px;
        background: linear-gradient(90deg, #ffcc00, transparent);
        border-radius: 3px;
      }
    }

    .comments-list {
      margin-bottom: 40px;
    }

    .comment-fade-enter-active, .comment-fade-leave-active {
      transition: all 0.5s ease;
    }

    .comment-fade-enter-from, .comment-fade-leave-to {
      opacity: 0;
      transform: translateY(30px);
    }

    .comment-item {
      display: flex;
      margin-bottom: 30px;
      padding-bottom: 25px;
      border-bottom: 1px dashed rgba(255, 204, 0, 0.2);
      position: relative;
      transition: all 0.3s ease;

      &:hover {
        transform: translateX(5px);

        .comment-avatar .avatar-glow {
          opacity: 0.8;
        }
      }

      &::before {
        content: '';
        position: absolute;
        left: 18px;
        top: 40px;
        bottom: 0;
        width: 1px;
        background: linear-gradient(to bottom, rgba(255, 204, 0, 0.5), transparent);
        z-index: 0;
      }

      &:last-child {
        margin-bottom: 0;
        border-bottom: none;

        &::before {
          display: none;
        }
      }
    }

    .comment-avatar {
      width: 40px;
      height: 40px;
      margin-right: 15px;
      flex-shrink: 0;
      position: relative;
      z-index: 1;

      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid rgba(255, 204, 0, 0.5);
        box-shadow: 0 0 10px rgba(255, 204, 0, 0.2);
        transition: all 0.3s ease;
      }

      .avatar-glow {
        position: absolute;
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
        border-radius: 50%;
        background: radial-gradient(ellipse at center, rgba(255, 204, 0, 0.3) 0%, transparent 70%);
        opacity: 0;
        transition: opacity 0.3s ease;
        z-index: -1;
        animation: pulse 3s infinite;
      }
    }

    .comment-content {
      flex: 1;
      background-color: rgba(40, 40, 40, 0.4);
      border-radius: 10px;
      padding: 15px;
      position: relative;

      &::before {
        content: '';
        position: absolute;
        left: -8px;
        top: 15px;
        width: 0;
        height: 0;
        border-top: 8px solid transparent;
        border-bottom: 8px solid transparent;
        border-right: 8px solid rgba(40, 40, 40, 0.4);
      }
    }

    .comment-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      flex-wrap: wrap;
      gap: 10px;
    }

    .comment-info {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
    }

    .comment-name {
      font-weight: 600;
      color: #ffcc00;
      font-size: 14px;
      position: relative;
      z-index: 1;

      &::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 0;
        width: 100%;
        height: 2px;
        background-color: rgba(255, 204, 0, 0.3);
        transform: scaleX(0);
        transform-origin: left;
        transition: transform 0.3s ease;
        z-index: -1;
      }

      &:hover::after {
        transform: scaleX(1);
      }
    }

    .comment-date {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.5);
      position: relative;
      padding-left: 12px;

      &::before {
        content: '•';
        position: absolute;
        left: 4px;
        top: 0;
        color: rgba(255, 255, 255, 0.4);
      }
    }

    .comment-text {
      margin-bottom: 8px;
      line-height: 1.6;
      color: rgba(255, 255, 255, 0.9);
      font-size: 14px;
      word-break: break-word;
      position: relative;
      padding: 10px 0;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);

      &::first-letter {
        font-size: 1.1em;
        font-weight: 500;
        color: #ffcc00;
      }

      &::before {
        content: '"';
        position: absolute;
        left: -5px;
        top: -5px;
        font-size: 20px;
        color: rgba(255, 204, 0, 0.3);
        font-family: 'Georgia', serif;
      }

      &::after {
        content: '"';
        position: absolute;
        right: -5px;
        bottom: -10px;
        font-size: 20px;
        color: rgba(255, 204, 0, 0.3);
        font-family: 'Georgia', serif;
      }
    }

    .comment-actions {
      display: flex;
      gap: 15px;
    }

    .like-button, .reply-button {
      background: none;
      border: none;
      font-size: 13px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 5px;
      transition: all 0.3s ease;
      padding: 5px 8px;
      border-radius: 15px;
    }

    .like-button {
      color: rgba(255, 255, 255, 0.7);

      &:hover {
        color: #ff6b6b;
        background-color: rgba(255, 107, 107, 0.1);
      }

      &.liked {
        color: #ff6b6b;
        background-color: rgba(255, 107, 107, 0.1);

        .heart-icon {
          animation: heartBeat 0.3s ease;
        }

        .like-count {
          animation: popIn 0.3s ease;
        }
      }
    }

    .reply-button {
      color: rgba(255, 255, 255, 0.7);

      &:hover {
        color: #64b5f6;
        background-color: rgba(100, 181, 246, 0.1);
      }
    }

    .heart-icon, .reply-icon {
      font-size: 14px;
      margin-right: 2px;
    }

    // 评论表单样式
    .comment-form {
      background-color: rgba(30, 30, 30, 0.6);
      padding: 25px;
      border-radius: 12px;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
      border: 1px solid rgba(255, 204, 0, 0.1);
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 3px;
        background: linear-gradient(90deg, #ffcc00, transparent);
      }

      &::after {
        content: '';
        position: absolute;
        bottom: -50px;
        right: -50px;
        width: 100px;
        height: 100px;
        background: radial-gradient(circle, rgba(255, 204, 0, 0.15), transparent 70%);
        border-radius: 50%;
        z-index: 0;
      }

      .form-decorations {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        pointer-events: none;
        z-index: 0;

        .decoration-star {
          position: absolute;
          width: 20px;
          height: 20px;
          background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="%23ffcc00" d="M12,1L9,9H2L7,14L5,21L12,17L19,21L17,14L22,9H15Z" /></svg>');
          background-size: contain;
          opacity: 0.15;

          &.decoration-star-1 {
            top: 20px;
            right: 50px;
            width: 15px;
            height: 15px;
            animation: floatStar 5s infinite ease-in-out;
          }

          &.decoration-star-2 {
            bottom: 80px;
            right: 30px;
            width: 20px;
            height: 20px;
            animation: floatStar 7s infinite ease-in-out 1s;
          }

          &.decoration-star-3 {
            bottom: 30px;
            left: 40px;
            width: 12px;
            height: 12px;
            animation: floatStar 4s infinite ease-in-out 2s;
          }
        }
      }
    }

    @keyframes floatStar {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(-10px) rotate(10deg); }
    }

    .form-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 25px;
      color: #fff;
      display: flex;
      align-items: center;
      font-family: 'Comic Sans MS', 'Ma Shan Zheng', cursive;

      .form-icon {
        margin-right: 10px;
        font-size: 20px;
        animation: wiggle 3s ease-in-out infinite;
      }
    }

    @keyframes wiggle {
      0%, 100% { transform: rotate(0deg); }
      85% { transform: rotate(0deg); }
      90% { transform: rotate(10deg); }
      95% { transform: rotate(-10deg); }
    }

    .form-row {
      display: flex;
      gap: 20px;
      margin-bottom: 20px;

      @media (max-width: 600px) {
        flex-direction: column;
        gap: 15px;
      }
    }

    .form-group {
      flex: 1;
      margin-bottom: 20px;
      position: relative;
      z-index: 1;

      label {
        display: block;
        margin-bottom: 10px;
        color: rgba(255, 255, 255, 0.8);
        font-size: 14px;
        font-weight: 500;
        transition: color 0.3s ease;
      }

      .input-wrapper, .textarea-wrapper {
        position: relative;

        .input-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 16px;
          color: rgba(255, 204, 0, 0.7);
          transition: all 0.3s ease;
          pointer-events: none;
        }
      }

      input, textarea {
        width: 100%;
        padding: 12px 15px 12px 40px;
        background-color: rgba(30, 30, 30, 0.7);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 10px;
        color: #fff;
        font-size: 14px;
        transition: all 0.3s ease;
        box-sizing: border-box;

        &:focus {
          outline: none;
          border-color: rgba(255, 204, 0, 0.5);
          box-shadow: 0 0 0 3px rgba(255, 204, 0, 0.15);

          & + .input-icon {
            color: #ffcc00;
            transform: translateY(-50%) scale(1.1);
          }
        }

        &::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }
      }

      textarea {
        min-height: 120px;
        resize: vertical;
        line-height: 1.6;
        padding: 15px;
        background-color: rgba(30, 30, 30, 0.7);
        z-index: 1;
        position: relative;
      }

      .textarea-wrapper {
        position: relative;

        .textarea-decoration {
          position: absolute;
          right: 10px;
          bottom: 10px;
          z-index: 0;
          pointer-events: none;
          opacity: 0.3;
          transition: opacity 0.3s ease;

          .anime-decoration {
            width: 70px;
            height: 70px;
            background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill="%23ffcc00" d="M50 0 C60 30 80 50 100 50 L50 100 C30 70 20 50 0 50 Z"/></svg>');
            background-size: contain;
            background-repeat: no-repeat;
            transform: rotate(-15deg);
          }
        }

        &:hover .textarea-decoration {
          opacity: 0.5;
        }
      }

      &:focus-within {
        label {
          color: #ffcc00;
        }
      }
    }

    .form-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 10px;
      flex-wrap: wrap;
      gap: 15px;

      @media (max-width: 600px) {
        flex-direction: column;
        align-items: flex-start;
      }

      .comment-tips {
        display: flex;
        align-items: center;
        color: rgba(255, 255, 255, 0.6);
        font-size: 13px;

        .tip-icon {
          margin-right: 6px;
          font-size: 15px;
          animation: pulse 2s infinite;
        }
      }
    }

    .required {
      color: #ff6b6b;
      margin-left: 2px;
    }

    .submit-button {
      background: linear-gradient(45deg, #ffcc00, #ff9500);
      color: #1c1c1c;
      border: none;
      padding: 12px 25px;
      border-radius: 25px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      box-shadow: 0 4px 10px rgba(255, 204, 0, 0.3);
      position: relative;
      overflow: hidden;
      z-index: 1;

      .submit-icon {
        font-size: 18px;
        transform: translateY(1px);
      }

      .button-effect {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, transparent 20%, rgba(255, 255, 255, 0.2), transparent 80%);
        transform: translateX(-100%);
        transition: transform 0.3s ease;
        z-index: -1;
      }

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 15px rgba(255, 204, 0, 0.4);
        background: linear-gradient(45deg, #ffda44, #ffae00);

        .button-effect {
          transform: translateX(100%);
        }

        .submit-icon {
          animation: iconWiggle 0.5s ease;
        }
      }

      &:active {
        transform: translateY(0);
        box-shadow: 0 2px 5px rgba(255, 204, 0, 0.3);
      }
    }

    @keyframes iconWiggle {
      0%, 100% { transform: translateY(1px) rotate(0deg); }
      25% { transform: translateY(1px) rotate(-10deg); }
      75% { transform: translateY(1px) rotate(10deg); }
    }
  }
}

// 右侧栏
.right-sidebar {
  .catalog, .categories {
    background-color: transparent;
    border-radius: 0;
    margin-bottom: 30px;
    overflow: hidden;
    border: none;
    box-shadow: none;
    position: sticky;
    top: 20px;
    max-height: calc(100vh - 40px);
    display: flex;
    flex-direction: column;
    transition: max-height 0.3s ease;
  }

  .catalog-title, .categories-title {
    font-size: 20px;
    font-weight: 600;
    color: white;
    padding: 12px 0;
    background-color: transparent;
    margin: 0 0 16px 0;
    display: flex;
    align-items: center;
    border-bottom: 2px solid rgba(255, 255, 255, 0.3);
    flex-shrink: 0;

    .category-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      background-color: transparent;
      color: #ffcc00;
      border-radius: 0;
      margin-right: 12px;
      font-weight: bold;
      font-size: 20px;
    }

    .category-title-text {
      font-size: 16px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .catalog-list, .category-list {
    list-style: none;
    padding: 0 0 0 4px;
    margin: 0;
    overflow-y: auto;
    flex: 1;

    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    li {
      padding: 10px 0;
      cursor: pointer;
      color: rgba(230, 230, 230, 0.7);
      font-size: 15px;
      transition: all 0.25s ease;
      border-left: 3px solid transparent;
      margin-bottom: 4px;
      border-radius: 0 4px 4px 0;

      &:hover {
        background-color: rgba(44, 44, 44, 0.3);
        color: #ffcc00;
        border-left-color: rgba(255, 204, 0, 0.5);
        padding-left: 12px;
      }

      &.active, .category-item-text.active {
        color: #ffcc00;
        background-color: rgba(44, 44, 44, 0.5);
        border-left-color: #ffcc00;
        padding-left: 12px;
        font-weight: 500;
      }

      .category-item-text {
        display: block;

        &.category-level-1 {
          padding-left: 15px;
          font-size: 13px;
          position: relative;

          &::before {
            content: '';
            position: absolute;
            left: 0;
            top: 50%;
            width: 8px;
            height: 1px;
            background-color: #666;
          }
        }
      }
    }
  }

  .catalog-list {
    li {
      &.level-1 {
        font-weight: 600;
        color: rgba(255, 255, 255, 0.9);
      }
      &.level-2 {
        padding-left: 20px;
      }
      &.level-3 {
        padding-left: 40px;
        font-size: 14px;
      }
      &.level-4 {
        padding-left: 60px;
        font-size: 13px;
      }

      &.active, &:hover {
        &.level-1 { padding-left: 12px; }
        &.level-2 { padding-left: 32px; }
        &.level-3 { padding-left: 52px; }
        &.level-4 { padding-left: 72px; }
      }
    }
  }

  .empty-toc {
    padding: 20px;
    text-align: center;
    color: #777;
    font-style: italic;
  }
}

// 回到顶部
.back-to-top {
  position: fixed;
  right: 30px;
  bottom: 30px;
  width: 40px;
  height: 40px;
  background-color: rgba(255, 204, 0, 0.8);
  color: #1c1c1c;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 100;
  font-size: 18px;
  font-weight: bold;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;

  &:hover {
    background-color: #ffcc00;
    transform: translateY(-3px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
  }
}

// 动画
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
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
    transform: scale(0);
    opacity: 0;
  }
  80% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-5px); }
  60% { transform: translateY(-2px); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes heartBeat {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}

@keyframes popIn {
  0% { transform: scale(0.8); opacity: 0.5; }
  100% { transform: scale(1); opacity: 1; }
}

// 删除浏览历史链接相关样式
</style>

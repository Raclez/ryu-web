# Ryu 个人博客

这是一个使用 Vue 3、TypeScript 和 Vite 构建的现代个人博客系统。

## 项目特点

- 🚀 基于 Vue 3 + TypeScript + Vite 构建
- 📱 响应式设计，适配多种设备屏幕
- ✨ 支持 Markdown 文章编写和渲染
- 🔍 按分类浏览文章
- 🎨 美观的 UI 设计
- 🌈 Live2D 小部件增强用户体验

## 技术栈

- **前端框架**: Vue 3
- **构建工具**: Vite
- **编程语言**: TypeScript
- **状态管理**: Pinia
- **路由管理**: Vue Router
- **样式处理**: SCSS
- **Markdown 处理**: markdown-it, Prism.js
- **HTTP 客户端**: Axios

## 功能模块

- **首页**: 文章列表展示
- **博客详情**: 文章内容阅读
- **分类页面**: 按分类浏览文章
- **Live2D 组件**: 交互式动画角色

## 快速开始

### 前提条件

- Node.js 18.x 或更高版本
- pnpm 8.x 或更高版本

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

### 构建生产版本

```bash
pnpm build
```

### 预览生产构建

```bash
pnpm preview
```

### 类型检查

```bash
pnpm type-check
```

## 项目结构

```
src/
├── api/         # API 请求封装
├── assets/      # 静态资源
├── components/  # 通用组件
├── router/      # 路由配置
├── store/       # Pinia 状态管理
├── types/       # TypeScript 类型定义
├── utils/       # 工具函数
├── views/       # 页面组件
├── App.vue      # 根组件
└── main.ts      # 入口文件
```

## 自定义配置

请参考 [Vite 配置参考](https://vitejs.dev/config/) 进行项目配置。

## 许可证

[ISC](LICENSE) 
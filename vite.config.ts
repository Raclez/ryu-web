import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // 根据当前工作目录中的 `mode` 加载 .env 文件
  // 设置第三个参数为 '' 来加载所有环境变量，而不管是否有 `VITE_` 前缀。
  const env = loadEnv(mode, process.cwd(), '');

  console.log(`当前环境: ${mode}`);
  console.log(`API Base URL: ${env.VITE_API_BASE_URL}`);

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 3000,
      open: true,
      proxy: {
        // 开发环境API代理配置
        '/api': {
          target: env.VITE_API_BASE_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    // 为不同环境构建不同的输出目录
    build: {
      outDir: `dist-${mode}`,
      // 在生产环境中禁用源映射以提高构建速度
      sourcemap: mode !== 'production',
      // 增加警告限制，减少大文件警告
      chunkSizeWarningLimit: 1000,
      // 配置Rollup选项
      rollupOptions: {
        output: {
          // 手动拆分代码块
          manualChunks: {
            // 将vue相关库打包成一个chunk
            'vue-vendor': ['vue', 'vue-router', 'pinia'],
            // 将markdown相关库打包成一个chunk
            'markdown': ['markdown-it', 'markdown-it-anchor', 'markdown-it-container', 
                         'markdown-it-emoji', 'markdown-it-prism', 'markdown-it-task-lists'],
            // 将其他大型库分开打包
            'highlight': ['highlight.js'],
            'shiki': ['shiki'],
            'editor': ['md-editor-v3']
          },
          // 用于从入口点创建的块的打包输出格式
          entryFileNames: 'assets/[name].[hash].js',
          // 用于代码块的打包输出格式
          chunkFileNames: 'assets/[name].[hash].js',
          // 用于静态资源的输出格式
          assetFileNames: 'assets/[name].[hash].[ext]'
        }
      }
    },
    // 定义全局常量替换
    define: {
      __APP_ENV__: JSON.stringify(env.VITE_APP_ENV),
      __APP_VERSION__: JSON.stringify(env.VITE_APP_VERSION),
    },
  };
});

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
    },
    // 定义全局常量替换
    define: {
      __APP_ENV__: JSON.stringify(env.VITE_APP_ENV),
      __APP_VERSION__: JSON.stringify(env.VITE_APP_VERSION),
    },
  };
});

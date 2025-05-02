# 构建阶段
FROM node:20.12.2-alpine as build-stage

# 设置构建参数，默认为生产环境
ARG BUILD_ENV=production

# 安装pnpm
RUN npm install -g pnpm

# 设置工作目录
WORKDIR /app

# 复制package.json和pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install

# 复制源代码
COPY . .

# 根据环境构建应用
RUN if [ "$BUILD_ENV" = "development" ]; then \
        pnpm run build; \
    elif [ "$BUILD_ENV" = "test" ]; then \
        pnpm run build:test; \
    elif [ "$BUILD_ENV" = "staging" ]; then \
        pnpm run build:staging; \
    else \
        pnpm run build:prod; \
    fi

# 生产阶段
FROM nginx:stable-alpine as production-stage

# 设置环境变量
ARG BUILD_ENV=production
ENV APP_ENV=$BUILD_ENV

# 复制对应环境的构建产物到Nginx服务目录
COPY --from=build-stage /app/dist-${BUILD_ENV} /usr/share/nginx/html

# 复制自定义Nginx配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露80端口
EXPOSE 80

# 显示环境信息并启动Nginx
CMD echo "Running in ${APP_ENV} environment" && nginx -g "daemon off;"

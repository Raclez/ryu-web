#!/bin/bash

# 构建脚本用于本地测试Docker构建

# 设置颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 设置Docker仓库信息
DOCKER_REGISTRY=${DOCKER_REGISTRY:-"registry.cn-hangzhou.aliyuncs.com"}
DOCKER_NAMESPACE=${DOCKER_NAMESPACE:-"ryu-blog"}
APP_NAME=${APP_NAME:-"ryu-web"}
IMAGE_NAME="${DOCKER_REGISTRY}/${DOCKER_NAMESPACE}/${APP_NAME}"

# 设置默认环境
ENV=${1:-production}
echo -e "${BLUE}准备构建环境: $ENV${NC}"
echo -e "${BLUE}镜像名称: ${IMAGE_NAME}:${ENV}${NC}"

# 检查Docker是否运行
if ! docker info > /dev/null 2>&1; then
  echo -e "${RED}错误: Docker未运行，请先启动Docker服务${NC}"
  exit 1
fi

# 清理旧的Docker镜像
echo -e "${YELLOW}清理旧的Docker镜像...${NC}"
docker rmi ${IMAGE_NAME}:${ENV} 2>/dev/null || true

# 先执行对应环境的构建
echo -e "${YELLOW}先执行本地构建，确保生成正确的构建目录...${NC}"
if [ "$ENV" = "development" ]; then
  pnpm run build || { echo -e "${RED}本地构建失败${NC}"; exit 1; }
elif [ "$ENV" = "test" ]; then
  pnpm run build:test || { echo -e "${RED}本地构建失败${NC}"; exit 1; }
elif [ "$ENV" = "staging" ]; then
  pnpm run build:staging || { echo -e "${RED}本地构建失败${NC}"; exit 1; }
else
  pnpm run build:prod || { echo -e "${RED}本地构建失败${NC}"; exit 1; }
fi

# 检查构建目录是否存在
if [ ! -d "dist-$ENV" ]; then
  echo -e "${YELLOW}警告: dist-$ENV 目录不存在，检查是否有 dist 目录${NC}"
  if [ -d "dist" ]; then
    echo -e "${YELLOW}发现 dist 目录，将其复制为 dist-$ENV${NC}"
    cp -r dist "dist-$ENV"
  else
    echo -e "${RED}错误: 没有找到任何构建输出目录${NC}"
    exit 1
  fi
fi

# 构建新镜像
echo -e "${BLUE}开始构建Docker镜像...${NC}"
echo -e "${YELLOW}执行: docker build --no-cache --build-arg BUILD_ENV=$ENV -t ${IMAGE_NAME}:${ENV} .${NC}"

# 使用--progress=plain参数获取更详细的构建输出
docker build --no-cache --progress=plain --build-arg BUILD_ENV=$ENV -t ${IMAGE_NAME}:${ENV} .

# 检查构建结果
if [ $? -eq 0 ]; then
    echo -e "${GREEN}构建成功! 镜像标签: ${IMAGE_NAME}:${ENV}${NC}"
    echo ""
    echo -e "${BLUE}您可以使用以下命令运行此镜像:${NC}"
    echo -e "${YELLOW}docker run -d --name ryu-web-$ENV -p 8080:80 ${IMAGE_NAME}:${ENV}${NC}"
    echo ""
    echo -e "${BLUE}或使用docker-compose:${NC}"
    echo -e "${YELLOW}ENV=$ENV PORT=8080 docker-compose up -d${NC}"
    
    echo -e "\n${BLUE}推送镜像命令:${NC}"
    echo -e "${YELLOW}docker push ${IMAGE_NAME}:${ENV}${NC}"
else
    echo -e "${RED}构建失败，请检查上述错误信息${NC}"
    exit 1
fi 
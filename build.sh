#!/bin/bash

# 构建脚本用于本地测试Docker构建

# 设置颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 设置默认环境
ENV=${1:-production}
echo -e "${BLUE}准备构建环境: $ENV${NC}"

# 检查Docker是否运行
if ! docker info > /dev/null 2>&1; then
  echo -e "${RED}错误: Docker未运行，请先启动Docker服务${NC}"
  exit 1
fi

# 清理旧的Docker镜像
echo -e "${YELLOW}清理旧的Docker镜像...${NC}"
docker rmi ryu-web:$ENV 2>/dev/null || true

# 构建新镜像
echo -e "${BLUE}开始构建Docker镜像...${NC}"
echo -e "${YELLOW}执行: docker build --no-cache --build-arg BUILD_ENV=$ENV -t ryu-web:$ENV .${NC}"

# 使用--progress=plain参数获取更详细的构建输出
docker build --no-cache --progress=plain --build-arg BUILD_ENV=$ENV -t ryu-web:$ENV .

# 检查构建结果
if [ $? -eq 0 ]; then
    echo -e "${GREEN}构建成功! 镜像标签: ryu-web:$ENV${NC}"
    echo ""
    echo -e "${BLUE}您可以使用以下命令运行此镜像:${NC}"
    echo -e "${YELLOW}docker run -d --name ryu-web-$ENV -p 8080:80 ryu-web:$ENV${NC}"
    echo ""
    echo -e "${BLUE}或使用docker-compose:${NC}"
    echo -e "${YELLOW}ENV=$ENV PORT=8080 docker-compose up -d${NC}"
else
    echo -e "${RED}构建失败，请检查上述错误信息${NC}"
    exit 1
fi 
pipeline {
    agent any

    parameters {
        choice(
            name: 'TARGET_ENV',
            choices: ['development', 'test', 'staging', 'production'],
            description: '选择要部署的环境'
        )
        booleanParam(
            name: 'SKIP_BUILD',
            defaultValue: false,
            description: '跳过构建步骤（用于重新部署已有镜像）'
        )
    }

    environment {
        // 项目信息
        PROJECT_NAME = 'ryu-web'
        // Docker 镜像仓库信息
        DOCKER_REGISTRY = 'registry.cn-hangzhou.aliyuncs.com'
        DOCKER_NAMESPACE = 'ryu-blog'
        // 完整镜像名称
        IMAGE_NAME = "${DOCKER_REGISTRY}/${DOCKER_NAMESPACE}/${PROJECT_NAME}"
        // Docker镜像标签
        IMAGE_TAG = "${params.TARGET_ENV}-${BUILD_NUMBER}"
        // Docker镜像仓库认证凭证ID
        DOCKER_REGISTRY_CREDENTIALS = '7bbd2f0b-5af4-4079-a15c-bc52037de966'
        // SSH凭证ID
        SSH_CREDENTIALS_ID = '37ab906a-5428-404f-ad67-765dd2a7a8ad'
        // 部署用户
        DEPLOY_USER = 'ubuntu'
        // 部署服务器 - 使用与后端相同的服务器
        DEPLOY_SERVER = '119.91.136.254'
        // 端口映射配置
        PORT_MAPPING_CONFIG = """
            development=3001:80
            test=3002:80
            staging=3003:80
            production=80:80
        """
        // 部署基础路径
        DEPLOY_BASE_PATH = "/opt/ryu-blog"
    }

    options {
        timeout(time: 30, unit: 'MINUTES')
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timestamps()
        ansiColor('xterm')
    }

    stages {
        stage('环境配置') {
            steps {
                script {
                    // 解析端口映射配置
                    def configs = PORT_MAPPING_CONFIG.trim().split('\n')
                    for (config in configs) {
                        def parts = config.trim().split('=')
                        if (parts.length == 2 && parts[0] == params.TARGET_ENV) {
                            env.PORT_MAPPING = parts[1]
                            break
                        }
                    }
                    
                    echo "开始构建 ${PROJECT_NAME}"
                    echo "目标环境: ${params.TARGET_ENV}"
                    echo "目标服务器: ${DEPLOY_SERVER}"
                    echo "端口映射: ${PORT_MAPPING}"
                    echo "镜像标签: ${IMAGE_TAG}"
                }
            }
        }

        stage('检出代码') {
            steps {
                checkout scm
            }
        }

        stage('安装依赖') {
            when { expression { return !params.SKIP_BUILD } }
            steps {
                sh 'npm install -g pnpm'
                sh 'pnpm install'
            }
        }

        stage('代码检查') {
            when { expression { return !params.SKIP_BUILD } }
            steps {
                sh 'pnpm run type-check'
            }
        }

        stage('构建项目') {
            when { expression { return !params.SKIP_BUILD } }
            steps {
                script {
                    if (params.TARGET_ENV == 'development') {
                        sh 'pnpm run build'
                    } else if (params.TARGET_ENV == 'test') {
                        sh 'pnpm run build:test'
                    } else if (params.TARGET_ENV == 'staging') {
                        sh 'pnpm run build:staging'
                    } else if (params.TARGET_ENV == 'production') {
                        sh 'pnpm run build:prod'
                    }
                }
            }
        }

        stage('构建Docker镜像') {
            when { expression { return !params.SKIP_BUILD } }
            steps {
                script {
                    // 确保构建目录存在
                    sh """
                        set -e
                        echo "检查构建目录..."
                        if [ -d "dist-${params.TARGET_ENV}" ]; then
                            echo "构建目录 dist-${params.TARGET_ENV} 已存在"
                        elif [ -d "dist" ]; then
                            echo "dist-${params.TARGET_ENV} 不存在，但找到 dist 目录，复制它"
                            cp -r dist dist-${params.TARGET_ENV}
                        else
                            echo "错误: 没有找到构建输出目录"
                            exit 1
                        fi
                    """

                    // 登录到Docker镜像仓库
                    withCredentials([usernamePassword(credentialsId: "${DOCKER_REGISTRY_CREDENTIALS}", passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
                        sh """
                            echo ${DOCKER_PASSWORD} | docker login ${DOCKER_REGISTRY} -u ${DOCKER_USERNAME} --password-stdin
                        """
                    }

                    // 构建Docker镜像
                    sh """
                        docker build --no-cache --build-arg BUILD_ENV=${params.TARGET_ENV} -t ${IMAGE_NAME}:${IMAGE_TAG} -t ${IMAGE_NAME}:${params.TARGET_ENV}-latest .
                    """
                }
            }
        }

        stage('推送Docker镜像') {
            when { expression { return !params.SKIP_BUILD } }
            steps {
                script {
                    // 推送Docker镜像
                    sh "docker push ${IMAGE_NAME}:${IMAGE_TAG}"
                    sh "docker push ${IMAGE_NAME}:${params.TARGET_ENV}-latest"
                    
                    echo "镜像推送成功: ${IMAGE_NAME}:${IMAGE_TAG}"
                }
            }
        }

        stage('部署应用') {
            steps {
                script {
                    // 选择使用哪个标签的镜像
                    def deployTag = params.SKIP_BUILD ? "${params.TARGET_ENV}-latest" : "${IMAGE_TAG}"
                    
                    // 容器名称
                    def containerName = "${PROJECT_NAME}-${params.TARGET_ENV}"
                    
                    // 远程部署
                    retry(3) {
                        timeout(time: 5, unit: 'MINUTES') {
                            sshagent([env.SSH_CREDENTIALS_ID]) {
                                echo "开始部署到服务器 ${DEPLOY_SERVER}..."
                                
                                // 确保目标目录存在
                                sh "ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 ${DEPLOY_USER}@${DEPLOY_SERVER} \"mkdir -p ${DEPLOY_BASE_PATH}/frontend/${params.TARGET_ENV}/logs\""
                                
                                // 登录Docker仓库
                                withCredentials([usernamePassword(credentialsId: "${DOCKER_REGISTRY_CREDENTIALS}", passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
                                    sh "ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 ${DEPLOY_USER}@${DEPLOY_SERVER} \"echo ${DOCKER_PASSWORD} | docker login ${DOCKER_REGISTRY} -u ${DOCKER_USERNAME} --password-stdin\""
                                }
                                
                                // 直接执行部署命令
                                sh """
                                    ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 ${DEPLOY_USER}@${DEPLOY_SERVER} "
                                        # 停止并删除旧容器(如果存在)
                                        docker stop ${containerName} || true
                                        docker rm ${containerName} || true
                                        
                                        # 拉取最新镜像
                                        docker pull ${IMAGE_NAME}:${deployTag}
                                        
                                        # 启动新容器
                                        docker run -d \\
                                          --name ${containerName} \\
                                          --restart unless-stopped \\
                                          --network docker_ryu-net \\
                                          -p ${PORT_MAPPING} \\
                                          -v ${DEPLOY_BASE_PATH}/frontend/${params.TARGET_ENV}/logs:/var/log/nginx \\
                                          ${IMAGE_NAME}:${deployTag}
                                          
                                        # 检查容器状态
                                        docker ps | grep ${containerName}
                                        
                                        # 清理未使用的镜像
                                        docker image prune -f
                                    "
                                """
                                
                                echo "部署完成! 环境: ${params.TARGET_ENV}, 服务器: ${DEPLOY_SERVER}, 镜像: ${IMAGE_NAME}:${deployTag}"
                            }
                        }
                    }
                }
            }
        }
        
        stage('健康检查') {
            steps {
                script {
                    // 等待10秒确保服务已启动
                    sleep(10)
                    
                    // 通过SSH检查容器状态
                    sshagent([env.SSH_CREDENTIALS_ID]) {
                        def checkResult = sh(script: "ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 ${DEPLOY_USER}@${DEPLOY_SERVER} \"docker ps | grep ${PROJECT_NAME}-${params.TARGET_ENV}\"", returnStatus: true)
                        
                        if (checkResult != 0) {
                            error "容器未运行，部署可能失败!"
                        }
                        
                        // 提取端口
                        def port = PORT_MAPPING.split(':')[0]
                        
                        // 检查HTTP状态
                        def healthCheck = sh(script: "ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 ${DEPLOY_USER}@${DEPLOY_SERVER} \"curl -s -o /dev/null -w '%{http_code}' http://localhost:${port}\"", returnStdout: true).trim()
                        
                        if (healthCheck == '200') {
                            echo "健康检查通过! HTTP状态: ${healthCheck}"
                        } else {
                            echo "警告: 健康检查返回HTTP状态: ${healthCheck}"
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo "${params.TARGET_ENV}环境部署成功！"
            
            emailext (
                subject: "【${PROJECT_NAME}】${params.TARGET_ENV}环境部署成功",
                body: """
                <p>部署成功!</p>
                <p>项目: ${PROJECT_NAME}</p>
                <p>环境: ${params.TARGET_ENV}</p>
                <p>版本: ${IMAGE_TAG}</p>
                <p>服务器: ${DEPLOY_SERVER}</p>
                <p>详情请查看: <a href='${env.BUILD_URL}'>构建日志</a></p>
                """,
                to: '475118582@qq.com',
                mimeType: 'text/html'
            )
        }
        failure {
            echo "${params.TARGET_ENV}环境部署失败！请检查Jenkins日志获取详细信息。"
            
            emailext (
                subject: "【${PROJECT_NAME}】${params.TARGET_ENV}环境部署失败",
                body: """
                <p>部署失败!</p>
                <p>项目: ${PROJECT_NAME}</p>
                <p>环境: ${params.TARGET_ENV}</p>
                <p>版本: ${IMAGE_TAG}</p>
                <p>服务器: ${DEPLOY_SERVER}</p>
                <p>详情请查看: <a href='${env.BUILD_URL}'>构建日志</a></p>
                """,
                to: '475118582@qq.com',
                mimeType: 'text/html'
            )
        }
    }
}

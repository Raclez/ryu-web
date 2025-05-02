pipeline {
    agent any

    parameters {
        choice(
            name: 'ENV',
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
        // 定义环境变量
        DOCKER_REGISTRY = 'registry.cn-hangzhou.aliyuncs.com'  // 替换为你的Docker镜像仓库地址
        APP_NAME = 'ryu-web'
        DEPLOY_ENV = "${params.ENV}"
        IMAGE_NAME = "${DOCKER_REGISTRY}/${APP_NAME}"
        IMAGE_TAG = "${DEPLOY_ENV}-${env.BUILD_NUMBER}"
        
        // 根据环境参数设置部署配置
        DEPLOY_CONFIG = """
            development=3001:80,开发服务器IP地址
            test=3002:80,测试服务器IP地址
            staging=3003:80,预发布服务器IP地址
            production=80:80,生产服务器IP地址
        """
    }

    stages {
        stage('环境配置') {
            steps {
                script {
                    // 解析部署配置
                    def configs = DEPLOY_CONFIG.trim().split('\n')
                    for (config in configs) {
                        def parts = config.trim().split('=')
                        if (parts.length == 2 && parts[0] == DEPLOY_ENV) {
                            def values = parts[1].split(',')
                            env.PORT_MAPPING = values[0]
                            env.SERVER_IP = values[1]
                            break
                        }
                    }
                    
                    echo "当前部署环境: ${DEPLOY_ENV}"
                    echo "目标服务器: ${SERVER_IP}"
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

        stage('类型检查') {
            when { expression { return !params.SKIP_BUILD } }
            steps {
                sh 'pnpm run type-check'
            }
        }

        stage('构建项目') {
            when { expression { return !params.SKIP_BUILD } }
            steps {
                script {
                    if (DEPLOY_ENV == 'development') {
                        sh 'pnpm run build'
                    } else if (DEPLOY_ENV == 'test') {
                        sh 'pnpm run build:test'
                    } else if (DEPLOY_ENV == 'staging') {
                        sh 'pnpm run build:staging'
                    } else if (DEPLOY_ENV == 'production') {
                        sh 'pnpm run build:prod'
                    }
                }
            }
        }

        stage('构建Docker镜像') {
            when { expression { return !params.SKIP_BUILD } }
            steps {
                script {
                    // 构建Docker镜像，传递环境参数
                    sh "docker build --build-arg BUILD_ENV=${DEPLOY_ENV} -t ${IMAGE_NAME}:${IMAGE_TAG} -t ${IMAGE_NAME}:${DEPLOY_ENV}-latest ."
                }
            }
        }

        stage('推送Docker镜像') {
            when { expression { return !params.SKIP_BUILD } }
            steps {
                script {
                    // 登录到Docker镜像仓库
                    withCredentials([usernamePassword(credentialsId: '7bbd2f0b-5af4-4079-a15c-bc52037de966', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
                        sh "echo $DOCKER_PASSWORD | docker login $DOCKER_REGISTRY -u $DOCKER_USERNAME --password-stdin"
                    }

                    // 推送Docker镜像
                    sh "docker push ${IMAGE_NAME}:${IMAGE_TAG}"
                    sh "docker push ${IMAGE_NAME}:${DEPLOY_ENV}-latest"
                }
            }
        }

        stage('部署') {
            steps {
                script {
                    // 选择使用哪个标签的镜像
                    def deployTag = params.SKIP_BUILD ? "${DEPLOY_ENV}-latest" : "${IMAGE_TAG}"
                    
                    // 根据环境设置容器名称
                    def containerName = "${APP_NAME}-${DEPLOY_ENV}"
                    
                    // 远程部署
                    withCredentials([sshUserPrivateKey(credentialsId: '37ab906a-5428-404f-ad67-765dd2a7a8ad', keyFileVariable: 'SSH_KEY', usernameVariable: 'SSH_USER')]) {
                        def remoteCommand = """
                            docker pull ${IMAGE_NAME}:${deployTag}
                            docker stop ${containerName} || true
                            docker rm ${containerName} || true
                            docker run -d --name ${containerName} -p ${PORT_MAPPING} ${IMAGE_NAME}:${deployTag}
                            docker image prune -f
                        """

                        // 使用SSH执行远程命令
                        sh """
                            ssh -i ${SSH_KEY} -o StrictHostKeyChecking=no ${SSH_USER}@${SERVER_IP} '${remoteCommand}'
                        """
                    }
                }
            }
        }
    }

    post {
        always {
            // 清理工作空间
            cleanWs()
        }
        success {
            echo "${DEPLOY_ENV}环境部署成功！"
        }
        failure {
            echo "${DEPLOY_ENV}环境部署失败！"
        }
    }
}

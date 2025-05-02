pipeline {
 agent any

    environment {
        // 定义环境变量
        DOCKER_REGISTRY = 'registry.cn-hangzhou.aliyuncs.com'  // 替换为你的Docker镜像仓库地址
        APP_NAME = 'ryu-web'
        IMAGE_NAME = "${DOCKER_REGISTRY}/${APP_NAME}"
        IMAGE_TAG = "${env.BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install -g pnpm'
                sh 'pnpm install'
            }
        }

        stage('Type Check') {
            steps {
                sh 'pnpm run type-check'
            }
        }

        stage('Build') {
            steps {
                sh 'pnpm run build'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    // 构建Docker镜像
                    sh "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} -t ${IMAGE_NAME}:latest ."
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                script {
                    // 登录到Docker镜像仓库
                    withCredentials([usernamePassword(credentialsId: '7bbd2f0b-5af4-4079-a15c-bc52037de966', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
                        sh "echo $DOCKER_PASSWORD | docker login $DOCKER_REGISTRY -u $DOCKER_USERNAME --password-stdin"
                    }

                    // 推送Docker镜像
                    sh "docker push ${IMAGE_NAME}:${IMAGE_TAG}"
                    sh "docker push ${IMAGE_NAME}:latest"
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    // 远程部署
                    withCredentials([sshUserPrivateKey(credentialsId: '37ab906a-5428-404f-ad67-765dd2a7a8ad', keyFileVariable: 'SSH_KEY', usernameVariable: 'SSH_USER')]) {
                        def remoteCommand = """
                            docker pull ${IMAGE_NAME}:${IMAGE_TAG}
                            docker stop ${APP_NAME} || true
                            docker rm ${APP_NAME} || true
                            docker run -d --name ${APP_NAME} -p 80:80 ${IMAGE_NAME}:${IMAGE_TAG}
                        """

                        // 使用SSH执行远程命令
                        sh """
                            ssh -i ${SSH_KEY} -o StrictHostKeyChecking=no ${SSH_USER}@your-server-ip '${remoteCommand}'
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
            echo '部署成功！'
        }
        failure {
            echo '部署失败！'
        }
    }
}


pipeline {
    agent {
        label 'docker-agent-1'
    }

    options {
        skipDefaultCheckout(true)
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Frontend Dependencies') {
            steps {
                dir('frontend') {
                    sh 'pnpm install --frozen-lockfile'
                }
            }
        }

        stage('Frontend Tests') {
            steps {
                dir('frontend') {
                    sh 'pnpm exec ng test --watch=false --reporters=junit --output-file=frontend-junit.xml'
                }
            }
            post {
                always {
                    junit 'frontend/frontend-junit.xml'
                }
            }
        }

        stage('Backend Build') {
            steps {
                dir('backend') {
                    sh 'mvn -B -ntp -DskipTests package'
                }
            }
        }

        stage('Backend Tests') {
            steps {
                dir('backend') {
                    sh 'mvn -B -ntp test -Dspring.profiles.active=local'
                }
            }
            post {
                always {
                    junit 'backend/target/surefire-reports/TEST-*.xml'
                }
            }
        }
    }
}

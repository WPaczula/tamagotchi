#!groovy

def isDeploymentBranch(branch) {
  branch =~ /^master|develop_[0-9]$/
}

def PORT = 3001;

node {
    def containerName = "tamagotchi_${env.BRANCH_NAME}"
    def imageName = "tamagotchi-server:${env.BRANCH_NAME}"
    def postgresHost = "172.17.0.3"

    currentBuild.result = "SUCCESS"

    try {

        stage('Checkout') {
            checkout scm
        }

        stage('Test') {
            sh "make test TAG=${env.BUILD_ID}";
            sh "make stop";
        }

        if (isDeploymentBranch(env.BRANCH_NAME)) {
            stage('Create image') {
                sh "make image TAG=${env.BRANCH_NAME} PORT=${PORT}"
            }

            stage('Run container') {
                def containerExists = sh (script: "docker ps -f \"name=${containerName}\" --format '{{.Names}}'", returnStdout: true).trim()

                if (containerExists) {
                    sh "docker stop ${containerName}"
                    sh "docker rm ${containerName}"
                }

                sh "docker run --network bridge -e NODE_ENV=production -e PORT=${PORT} -e POSTGRES_HOST=${postgresHost} -e POSTGRES_DB=\"tamagotchi_${env.BRANCH_NAME}\" --name ${containerName} -p ${PORT}:${PORT} -d ${imageName}"
            }
        }

        stage('Cleanup') {
            def imageExists = sh (script: "docker images --filter=reference='tamagotchi-*:${env.BUILD_ID}' --format '{{.Repository}}'", returnStdout: true).trim()

            if (imageExists) {
                sh "docker rmi tamagotchi-server:${env.BUILD_ID}"
            }
        }

    }
    catch (err) {

        currentBuild.result = "FAILURE"

        throw err
    }
}
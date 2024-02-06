pipeline {
    environment {
        DOCKER_IMAGE_NAME1 = "sistemasudec/pifod:simplesaml-pre"
        DOCKER_IMAGE_NAME2 = "sistemasudec/phpmyadmin:pifod-pre"
        REGISTRY_CREDENTIAL = 'sistemasudec'
        SSH_CREDENTIAL = 'pre-key'
        REMOTE_USER = 'digesetuser'
        REMOTE_HOST = '148.213.1.131'
        K8S_CLI = '/usr/local/bin/k0s kubectl'
        KUBECONFIG_PATH = '/home/digesetuser/.kube/config'
        DEPLOY_PATH = '/home/digesetuser/pifod'
        JENKINS_URL = "jarvis.ucol.mx:8080"
        SONAR_SCANNER_HOME = "/opt/sonar-scanner"
    	PATH = "${env.SONAR_SCANNER_HOME}/bin:${env.PATH}"
    }

    agent any
    stages {
        stage('Checkout Code') {
            steps {
                git credentialsId: 'github_credential', url: 'https://github.com/Universidad-de-Colima/PIFOD-digedpa.git', branch: 'pre'
            }
        }

		stage('Static Code Analysis') {
      		steps {
        		withSonarQubeEnv('sonarqube') {
         		sh "${env.SONAR_SCANNER_HOME}/bin/sonar-scanner \
					-Dsonar.projectKey=pifod \
					-Dsonar.projectName=pifod \
					-Dsonar.projectVersion=1.0 \
					-Dsonar.sources=public-html \
					-Dsonar.language=php \
					-Dsonar.login=${sonarqubeGlobal} \
					-Dsonar.host.url=http://scanner.ucol.mx:9000 \
					-Dsonar.report.export.path=sonar-report.json"
        		}
      		}
   		}

    stage('Kubernetes Deployments') {
      steps {
        script {
           sshagent(credentials: ["${env.SSH_CREDENTIAL}"]) {
                def files = ['storage.yaml', 'configmap.yaml', 'statefulset.yaml', 'deployment.yaml', 'deployment-phpmyadmin.yaml']
                files.each { file ->
                    sh "scp -o StrictHostKeyChecking=no deployments/${file} ${env.REMOTE_USER}@${env.REMOTE_HOST}:${env.DEPLOY_PATH}"
                    sh "ssh ${env.REMOTE_USER}@${env.REMOTE_HOST} ${env.K8S_CLI} apply -f ${env.DEPLOY_PATH}/${file} --kubeconfig=${env.KUBECONFIG_PATH}"
                }
                sh "ssh ${env.REMOTE_USER}@${env.REMOTE_HOST} ${env.K8S_CLI} rollout restart deployment pifod -n pifod-pre --kubeconfig=${env.KUBECONFIG_PATH}"
            }
        }
      }
    }
  }


    post {
        success {
            slackSend channel: 'C06FHFQMQS0', color: 'good', failOnError: true, message: customMsg(), teamDomain: 'universidadde-bea3869', tokenCredentialId: 'slackpass'
        }
    }
}

def customMsg() {
    String buildStatus = env.BUILD_STATUS ?: 'SUCCESS'
    String emoji = (buildStatus == 'SUCCESS') ? ':white_check_mark:' : ':x:'
    String jobName = "<${env.JENKINS_URL}/job/${env.JOB_NAME}/${env.BUILD_ID}|${env.JOB_NAME}>"

    return "${emoji} *Build ${buildStatus}* - Job ${jobName}\nLogs: jarvis.ucol.mx:8080/job/${env.JOB_NAME}/${env.BUILD_ID}/consoleText"
}
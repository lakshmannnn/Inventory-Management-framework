pipeline {
    agent any
    tools {nodejs "node"}
    stages {
        stage('install dependencies') {
                    steps {
                        git url: 'https://github.com/lakshmannnn/Inventory-Management-framework.git'
                        bat 'npm install'
                        bat 'npm update'
                    }
                }
		stage('trigger tests') {

                    steps {
                        bat 'npm run trigger-parallel-execution'
                    }
                }
// Just paste these two stages into your current pipeline — they will run independently and give you:

// Immediate feedback if the OpenAPI file is invalid or poorly written (Spectral)
// Thousands of real requests automatically generated and validated against the live API (Schemathesis)
// Beautiful reports + Jenkins test trends

// No other changes needed. Works perfectly with your Render-hosted API.
                    // ──────────────────────────────────────────────────────────────
    // 1. OpenAPI Spec Linting (Spectral – fast & strict)
    // ──────────────────────────────────────────────────────────────
    stage('Lint OpenAPI Specification') {
        steps {
            script {
                sh '''
                    # Download the exact spec used by /api-docs/
                    curl -fsS -o openapi.json \
                        https://apiforshopsinventorymanagementsystem-qnkc.onrender.com/api-docs/openapi.json

                    # Install Spectral CLI (lightweight, no Node version lock)
                    npm install -g @stoplight/spectral-cli

                    # Run linting – fails on error or warning (adjust -F if you want only errors)
                    spectral lint openapi.json --fail-severity=error
                '''
                }
        }
        post {
            always {
                archiveArtifacts artifacts: 'openapi.json', fingerprint: true, allowEmptyArchive: true
            }
        }
    }

    // ──────────────────────────────────────────────────────────────
    // 2. Schemathesis Contract + Property-Based Testing
    // ──────────────────────────────────────────────────────────────
    stage('Schemathesis Contract Tests') {
        steps {
            script {
                sh '''
                    # Create isolated Python env
                    python3 -m venv .venv
                    . .venv/bin/activate

                    # Install latest Schemathesis
                    pip install --upgrade schemathesis

                    # Run full contract + fuzz testing
                    schemathesis run \\
                        https://apiforshopsinventorymanagementsystem-qnkc.onrender.com/api-docs/openapi.json \\
                        --base-url=https://apiforshopsinventorymanagementsystem-qnkc.onrender.com \\
                        --checks=all \\
                        --validate-schema=true \\
                        --workers=6 \\
                        --hypothesis-max-examples=500 \\
                        --request-timeout=15 \\
                        --report=schemathesis-report.html

                    # Generate JUnit XML for Jenkins test trend graphs
                    schemathesis run \\
                        https://apiforshopsinventorymanagementsystem-qnkc.onrender.com/api-docs/openapi.json \\
                        --base-url=https://apiforshopsinventorymanagementsystem-qnkc.onrender.com \\
                        --checks=all \\
                        --hypothesis-max-examples=100 \\
                        --junit-xml=schemathesis-junit.xml
                '''
            }
        }
        post {
            always {
                // JUnit results → Test tab in Jenkins
                junit testResults: 'schemathesis-junit.xml', allowEmptyResults: true

                // Nice HTML report
                publishHTML(target: [
                    allowMissing: false,
                    alwaysLinkToLastBuild: true,
                    keepAll: true,
                    reportDir: '.',
                    reportFiles: 'schemathesis-report.html',
                    reportName: 'Schemathesis Contract Report'
                ])

                archiveArtifacts artifacts: 'schemathesis-report.html, schemathesis-junit.xml, openapi.json',
                                allowEmptyArchive: true
            }
            cleanup {
                sh 'rm -rf .venv openapi.json schemathesis-*'
            }
        }
    }
        }
    }
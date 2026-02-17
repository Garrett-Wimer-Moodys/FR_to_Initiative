#!/usr/bin/env node

/**
 * JIRA Configuration Helper
 * This script helps you set up your JIRA credentials and test the connection
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Color codes for console output
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',  
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m'
};

function log(color, message) {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function createEnvFile(config) {
    const envContent = `# JIRA Integration Configuration
# Generated on ${new Date().toISOString()}

# Instance Type: 'cloud' for Atlassian Cloud, 'server' for Server/Data Center
JIRA_INSTANCE_TYPE=${config.instanceType}

# Your JIRA site URL
JIRA_SITE_URL=${config.siteUrl}

${config.instanceType === 'cloud' ? `
# === ATLASSIAN CLOUD CONFIGURATION ===
# Your JIRA Cloud email address
JIRA_EMAIL=${config.email}

# Your JIRA API Token
JIRA_API_TOKEN=${config.apiToken}

# Optional: Your JIRA Cloud ID
${config.cloudId ? `JIRA_CLOUD_ID=${config.cloudId}` : '# JIRA_CLOUD_ID=your-cloud-id-here'}
` : `
# === JIRA SERVER/DATA CENTER CONFIGURATION ===
# Your JIRA server URL
JIRA_SERVER_URL=${config.serverUrl}

# Username for Server/Data Center
JIRA_USERNAME=${config.username}

# Password or Personal Access Token for Server/Data Center
JIRA_PASSWORD=${config.password}
`}

# Server configuration
PORT=3001
`;

    fs.writeFileSync('.env', envContent);
    log('green', '✓ .env file created successfully!');
}

async function testConnection(config) {
    try {
        log('blue', 'Testing JIRA connection...');
        
        let authString;
        let apiUrl;
        
        if (config.instanceType === 'cloud') {
            authString = `${config.email}:${config.apiToken}`;
            if (config.cloudId) {
                apiUrl = `https://api.atlassian.com/ex/jira/${config.cloudId}/rest/api/3/serverInfo`;
            } else {
                apiUrl = `${config.siteUrl}/rest/api/3/serverInfo`;
            }
        } else {
            authString = `${config.username}:${config.password}`;
            apiUrl = `${config.serverUrl}/rest/api/2/serverInfo`;
        }
        
        const auth = Buffer.from(authString).toString('base64');
        const response = await axios.get(apiUrl, {
            headers: {
                'Authorization': `Basic ${auth}`,
                'Accept': 'application/json'
            },
            timeout: 10000
        });
        
        log('green', '✓ Connection successful!');
        log('cyan', `Server: ${response.data.serverTitle || 'JIRA'}`);
        log('cyan', `Version: ${response.data.version}`);
        log('cyan', `Base URL: ${response.data.baseUrl}`);
        
        return true;
    } catch (error) {
        log('red', '✗ Connection failed!');
        if (error.response) {
            log('red', `Status: ${error.response.status}`);
            log('red', `Message: ${error.response.data?.message || error.response.statusText}`);
        } else {
            log('red', `Error: ${error.message}`);
        }
        return false;
    }
}

async function main() {
    log('cyan', '=== JIRA Configuration Helper ===\n');
    
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    function question(prompt) {
        return new Promise(resolve => rl.question(prompt, resolve));
    }
    
    try {
        // Get instance type
        log('yellow', 'What type of JIRA instance are you connecting to?');
        console.log('1. Atlassian Cloud (yourname.atlassian.net)');
        console.log('2. JIRA Server/Data Center (self-hosted)');
        
        const instanceChoice = await question('\nEnter choice (1 or 2): ');
        const instanceType = instanceChoice === '2' ? 'server' : 'cloud';
        
        const config = { instanceType };
        
        if (instanceType === 'cloud') {
            log('cyan', '\n=== Atlassian Cloud Configuration ===');
            
            config.siteUrl = await question('Enter your JIRA site URL (e.g., https://yourcompany.atlassian.net): ');
            config.email = await question('Enter your email address: ');
            config.apiToken = await question('Enter your API token: ');
            
            const cloudIdInput = await question('Enter your Cloud ID (optional, press Enter to skip): ');
            if (cloudIdInput.trim()) {
                config.cloudId = cloudIdInput.trim();
            }
            
        } else {
            log('cyan', '\n=== JIRA Server/Data Center Configuration ===');
            
            config.serverUrl = await question('Enter your JIRA server URL (e.g., https://jira.yourcompany.com): ');
            config.username = await question('Enter your username: ');
            config.password = await question('Enter your password or personal access token: ');
            config.siteUrl = config.serverUrl;
        }
        
        log('yellow', '\nTesting connection...');
        const connectionSuccess = await testConnection(config);
        
        if (connectionSuccess) {
            createEnvFile(config);
            log('green', '\n✓ Configuration complete! You can now start the server with: npm start');
        } else {
            log('red', '\n✗ Configuration failed. Please check your credentials and try again.');
        }
        
    } catch (error) {
        log('red', `\nError: ${error.message}`);
    } finally {
        rl.close();
    }
}

// Run only if called directly
if (require.main === module) {
    main();
}

module.exports = { testConnection, createEnvFile };
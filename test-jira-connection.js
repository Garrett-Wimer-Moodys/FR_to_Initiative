#!/usr/bin/env node

/**
 * JIRA Connection Test Script
 * Tests your JIRA configuration without starting the full server
 */

require('dotenv').config();
const axios = require('axios');

// JIRA configuration from environment
const JIRA_CONFIG = {
    cloudId: process.env.JIRA_CLOUD_ID,
    baseUrl: process.env.JIRA_BASE_URL || 'https://api.atlassian.com',
    serverUrl: process.env.JIRA_SERVER_URL,
    siteUrl: process.env.JIRA_SITE_URL,
    email: process.env.JIRA_EMAIL,
    apiToken: process.env.JIRA_API_TOKEN,
    username: process.env.JIRA_USERNAME,
    password: process.env.JIRA_PASSWORD,
    instanceType: process.env.JIRA_INSTANCE_TYPE || 'cloud'
};

// Helper functions
function getJiraHeaders() {
    let authString;
    
    if (JIRA_CONFIG.instanceType === 'cloud') {
        authString = `${JIRA_CONFIG.email}:${JIRA_CONFIG.apiToken}`;
    } else {
        const user = JIRA_CONFIG.username || JIRA_CONFIG.email;
        const pass = JIRA_CONFIG.password || JIRA_CONFIG.apiToken;
        authString = `${user}:${pass}`;
    }
    
    const auth = Buffer.from(authString).toString('base64');
    return {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    };
}

function getJiraApiUrl() {
    if (JIRA_CONFIG.instanceType === 'cloud' && JIRA_CONFIG.cloudId) {
        return `${JIRA_CONFIG.baseUrl}/ex/jira/${JIRA_CONFIG.cloudId}/rest/api/3`;
    } else if (JIRA_CONFIG.serverUrl) {
        return `${JIRA_CONFIG.serverUrl}/rest/api/2`;
    } else if (JIRA_CONFIG.siteUrl) {
        return `${JIRA_CONFIG.siteUrl}/rest/api/3`;
    } else {
        throw new Error('No valid JIRA URL configuration found');
    }
}

async function testConnection() {
    console.log('🔧 JIRA Connection Test');
    console.log('=======================\n');
    
    // Check configuration
    console.log('Configuration:');
    console.log(`- Instance Type: ${JIRA_CONFIG.instanceType}`);
    console.log(`- Site URL: ${JIRA_CONFIG.siteUrl || 'Not set'}`);
    console.log(`- Server URL: ${JIRA_CONFIG.serverUrl || 'Not set'}`);
    console.log(`- Email/Username: ${JIRA_CONFIG.email || JIRA_CONFIG.username || 'Not set'}`);
    console.log(`- API Token/Password: ${(JIRA_CONFIG.apiToken || JIRA_CONFIG.password) ? '✓ Set' : '✗ Not set'}`);
    console.log(`- API URL: ${getJiraApiUrl()}\n`);
    
    try {
        // Test 1: Server Info
        console.log('🧪 Test 1: Server Information');
        const serverInfoUrl = `${getJiraApiUrl()}/serverInfo`;
        const serverResponse = await axios.get(serverInfoUrl, { 
            headers: getJiraHeaders(),
            timeout: 10000 
        });
        
        console.log('✅ Server info retrieved successfully');
        console.log(`   Server Title: ${serverResponse.data.serverTitle}`);
        console.log(`   Version: ${serverResponse.data.version}`);
        console.log(`   Base URL: ${serverResponse.data.baseUrl}\n`);
        
        // Test 2: Projects
        console.log('🧪 Test 2: Project Access');
        const projectsUrl = JIRA_CONFIG.instanceType === 'cloud' 
            ? `${getJiraApiUrl()}/project/search?action=create`
            : `${getJiraApiUrl()}/project`;
            
        const projectsResponse = await axios.get(projectsUrl, { 
            headers: getJiraHeaders(),
            timeout: 10000 
        });
        
        const projects = JIRA_CONFIG.instanceType === 'cloud' 
            ? projectsResponse.data.values || projectsResponse.data
            : projectsResponse.data;
            
        console.log('✅ Projects retrieved successfully');
        console.log(`   Found ${projects.length} accessible projects:`);
        
        projects.slice(0, 5).forEach((project, index) => {
            console.log(`   ${index + 1}. ${project.key} - ${project.name}`);
        });
        
        if (projects.length > 5) {
            console.log(`   ... and ${projects.length - 5} more`);
        }
        
        console.log('\n🎉 All tests passed! JIRA connection is working correctly.');
        
        return true;
        
    } catch (error) {
        console.log('\n❌ Connection test failed!');
        
        if (error.response) {
            console.log(`   Status: ${error.response.status} ${error.response.statusText}`);
            console.log(`   Error: ${JSON.stringify(error.response.data, null, 2)}`);
        } else if (error.request) {
            console.log(`   Network Error: ${error.message}`);
            console.log('   Check your URL and network connection');
        } else {
            console.log(`   Error: ${error.message}`);
        }
        
        console.log('\nTroubleshooting:');
        console.log('1. Verify your credentials are correct');
        console.log('2. Check your JIRA URL is accessible');
        console.log('3. Ensure your API token is not expired (for cloud)');
        console.log('4. Verify you have the necessary permissions');
        
        return false;
    }
}

// Run the test
if (require.main === module) {
    testConnection()
        .then(success => process.exit(success ? 0 : 1))
        .catch(error => {
            console.error('Unexpected error:', error);
            process.exit(1);
        });
}

module.exports = { testConnection };
// JIRA Integration Backend API
// This server provides REST endpoints that integrate with real JIRA APIs

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '.')));

// JIRA configuration - REPLACE WITH YOUR CREDENTIALS
const JIRA_CONFIG = {
    // For Atlassian Cloud instances
    cloudId: process.env.JIRA_CLOUD_ID || '2604d8a6-7a83-454a-abcc-2cd164d90231',
    baseUrl: process.env.JIRA_BASE_URL || 'https://api.atlassian.com',
    
    // For Server/Data Center instances (alternative to cloud)
    serverUrl: process.env.JIRA_SERVER_URL || null,
    
    // Your JIRA site URL (for generating links)
    siteUrl: process.env.JIRA_SITE_URL || 'https://mistech.atlassian.net',
    
    // Authentication
    email: process.env.JIRA_EMAIL || 'your-email@company.com',
    apiToken: process.env.JIRA_API_TOKEN || 'your-api-token-here',
    
    // For server instances with username/password or PAT
    username: process.env.JIRA_USERNAME || null,
    password: process.env.JIRA_PASSWORD || null,
    
    // Instance type
    instanceType: process.env.JIRA_INSTANCE_TYPE || 'cloud' // 'cloud' or 'server'
};

// Helper function to get JIRA auth headers
function getJiraHeaders() {
    let authString;
    
    if (JIRA_CONFIG.instanceType === 'cloud') {
        // Atlassian Cloud uses email:apiToken
        authString = `${JIRA_CONFIG.email}:${JIRA_CONFIG.apiToken}`;
    } else {
        // Server/Data Center can use username:password or username:token
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

// Helper function to get JIRA base API URL
function getJiraApiUrl() {
    if (JIRA_CONFIG.instanceType === 'cloud' && JIRA_CONFIG.cloudId) {
        return `${JIRA_CONFIG.baseUrl}/ex/jira/${JIRA_CONFIG.cloudId}/rest/api/3`;
    } else if (JIRA_CONFIG.serverUrl) {
        return `${JIRA_CONFIG.serverUrl}/rest/api/2`;
    } else {
        // Fallback for direct cloud URL
        return `${JIRA_CONFIG.siteUrl}/rest/api/3`;
    }
}

// API Routes

// Get all projects
app.get('/api/jira/projects', async (req, res) => {
    try {
        const apiUrl = getJiraApiUrl();
        const endpoint = JIRA_CONFIG.instanceType === 'cloud' 
            ? `${apiUrl}/project/search?action=create`
            : `${apiUrl}/project`;
            
        const response = await axios.get(endpoint, { headers: getJiraHeaders() });
        
        // Handle different response formats between cloud and server
        const projects = JIRA_CONFIG.instanceType === 'cloud' 
            ? response.data.values || response.data
            : response.data;
            
        res.json({
            values: projects.map(project => ({
                key: project.key,
                name: project.name,
                id: project.id
            }))
        });
    } catch (error) {
        console.error('Error fetching projects:', error.response?.data || error.message);
        res.status(500).json({ 
            error: 'Failed to fetch projects',
            details: error.response?.data?.errorMessages || error.message
        });
    }
});

// Get issue types for a project
app.get('/api/jira/projects/:projectKey/issuetypes', async (req, res) => {
    try {
        const { projectKey } = req.params;
        const apiUrl = getJiraApiUrl();
        const response = await axios.get(
            `${apiUrl}/project/${projectKey}/issuetypes`,
            { headers: getJiraHeaders() }
        );
        
        res.json({
            values: response.data.map(issueType => ({
                name: issueType.name,
                description: issueType.description,
                id: issueType.id
            }))
        });
    } catch (error) {
        console.error('Error fetching issue types:', error.response?.data || error.message);
        res.status(500).json({ 
            error: 'Failed to fetch issue types',
            details: error.response?.data?.errorMessages || error.message
        });
    }
});

// Create JIRA issue
app.post('/api/jira/issues', async (req, res) => {
    try {
        const { projectKey, issueType, summary, description, priority } = req.body;
        
        // Handle different descriptions for different API versions
        const issueData = {
            fields: {
                project: { key: projectKey },
                summary: summary,
                issuetype: { name: issueType },
                priority: { name: priority || 'Medium' }
            }
        };
        
        // Format description based on API version
        if (JIRA_CONFIG.instanceType === 'cloud' || getJiraApiUrl().includes('/api/3/')) {
            // JIRA Cloud (API v3) uses Atlassian Document Format (ADF)
            issueData.fields.description = {
                type: "doc",
                version: 1,
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: description
                            }
                        ]
                    }
                ]
            };
        } else {
            // JIRA Server (API v2) uses plain text or wiki markup
            issueData.fields.description = description;
        }
        
        const apiUrl = getJiraApiUrl();
        const response = await axios.post(
            `${apiUrl}/issue`,
            issueData,
            { headers: getJiraHeaders() }
        );
        
        res.json({
            key: response.data.key,
            id: response.data.id,
            url: `${JIRA_CONFIG.siteUrl}/browse/${response.data.key}`,
            self: response.data.self
        });
    } catch (error) {
        console.error('Error creating issue:', error.response?.data || error.message);
        res.status(500).json({ 
            error: 'Failed to create issue',
            details: error.response?.data?.errors || error.response?.data?.errorMessages || error.message
        });
    }
});

// Get JIRA issue
app.get('/api/jira/issues/:issueKey', async (req, res) => {
    try {
        const { issueKey } = req.params;
        const apiUrl = getJiraApiUrl();
        const response = await axios.get(
            `${apiUrl}/issue/${issueKey}`,
            { headers: getJiraHeaders() }
        );
        
        res.json({
            key: response.data.key,
            fields: {
                summary: response.data.fields.summary,
                description: response.data.fields.description,
                status: response.data.fields.status,
                priority: response.data.fields.priority
            }
        });
    } catch (error) {
        console.error('Error fetching issue:', error.response?.data || error.message);
        res.status(500).json({ 
            error: 'Failed to fetch issue',
            details: error.response?.data?.errorMessages || error.message
        });
    }
});

// Update JIRA issue
app.put('/api/jira/issues/:issueKey', async (req, res) => {
    try {
        const { issueKey } = req.params;
        const updateData = req.body;
        
        const apiUrl = getJiraApiUrl();
        await axios.put(
            `${apiUrl}/issue/${issueKey}`,
            updateData,
            { headers: getJiraHeaders() }
        );
        
        res.json({
            key: issueKey,
            message: 'Issue updated successfully'
        });
    } catch (error) {
        console.error('Error updating issue:', error.response?.data || error.message);
        res.status(500).json({ 
            error: 'Failed to update issue',
            details: error.response?.data?.errors || error.response?.data?.errorMessages || error.message
        });
    }
});

// Search JIRA issues
app.post('/api/jira/search', async (req, res) => {
    try {
        const { jql, fields } = req.body;
        
        const apiUrl = getJiraApiUrl();
        const response = await axios.post(
            `${apiUrl}/search`,
            { jql, fields },
            { headers: getJiraHeaders() }
        );
        
        res.json({
            issues: response.data.issues,
            total: response.data.total
        });
    } catch (error) {
        console.error('Error searching issues:', error.response?.data || error.message);
        res.status(500).json({ 
            error: 'Failed to search issues',
            details: error.response?.data?.errorMessages || error.message
        });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    const isConfigured = JIRA_CONFIG.instanceType === 'cloud'
        ? !!(JIRA_CONFIG.email && JIRA_CONFIG.apiToken && JIRA_CONFIG.email !== 'your-email@company.com')
        : !!(JIRA_CONFIG.serverUrl && (JIRA_CONFIG.username || JIRA_CONFIG.email) && (JIRA_CONFIG.password || JIRA_CONFIG.apiToken));
        
    res.json({ 
        status: 'ok', 
        message: 'JIRA Integration API is running',
        jira: {
            configured: isConfigured,
            instanceType: JIRA_CONFIG.instanceType,
            siteUrl: JIRA_CONFIG.siteUrl,
            serverUrl: JIRA_CONFIG.serverUrl,
            apiUrl: getJiraApiUrl(),
            authentication: JIRA_CONFIG.instanceType === 'cloud' 
                ? `Email: ${JIRA_CONFIG.email !== 'your-email@company.com' ? '✓' : '✗'}, Token: ${JIRA_CONFIG.apiToken !== 'your-api-token-here' ? '✓' : '✗'}`
                : `User: ${(JIRA_CONFIG.username || JIRA_CONFIG.email) ? '✓' : '✗'}, Pass: ${(JIRA_CONFIG.password || JIRA_CONFIG.apiToken) ? '✓' : '✗'}`
        }
    });
});

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`JIRA Integration API server running on port ${PORT}`);
    console.log(`Frontend available at: http://localhost:${PORT}`);
    console.log(`API endpoints available at: http://localhost:${PORT}/api`);
    console.log('\\nConfiguration:');
    console.log(`- Instance Type: ${JIRA_CONFIG.instanceType}`);
    console.log(`- JIRA Site: ${JIRA_CONFIG.siteUrl}`);
    if (JIRA_CONFIG.serverUrl) {
        console.log(`- Server URL: ${JIRA_CONFIG.serverUrl}`);
    }
    console.log(`- API URL: ${getJiraApiUrl()}`);
    
    if (JIRA_CONFIG.instanceType === 'cloud') {
        console.log(`- Email configured: ${JIRA_CONFIG.email !== 'your-email@company.com'}`);
        console.log(`- API Token configured: ${JIRA_CONFIG.apiToken !== 'your-api-token-here'}`);
    } else {
        console.log(`- Username configured: ${!!(JIRA_CONFIG.username || JIRA_CONFIG.email)}`);
        console.log(`- Password/Token configured: ${!!(JIRA_CONFIG.password || JIRA_CONFIG.apiToken)}`);
    }
    
    console.log('\\nTo configure JIRA credentials:');
    if (JIRA_CONFIG.instanceType === 'cloud') {
        console.log('1. Set JIRA_EMAIL environment variable');
        console.log('2. Set JIRA_API_TOKEN environment variable');
        console.log('3. Optional: Set JIRA_SITE_URL for your specific instance');
        console.log('4. Optional: Set JIRA_CLOUD_ID if different from default');
    } else {
        console.log('1. Set JIRA_SERVER_URL environment variable (e.g., https://jira.yourcompany.com)');
        console.log('2. Set JIRA_USERNAME and JIRA_PASSWORD (or JIRA_API_TOKEN)');
        console.log('3. Set JIRA_INSTANCE_TYPE=server');
    }
});

module.exports = app;

/* 
SETUP INSTRUCTIONS:

1. Install dependencies:
   npm install express cors axios

2. Set environment variables:
   export JIRA_EMAIL="your-email@company.com"
   export JIRA_API_TOKEN="your-api-token"

3. Or edit JIRA_CONFIG object above with your credentials

4. Generate JIRA API Token:
   - Go to: https://id.atlassian.com/manage-profile/security/api-tokens
   - Create new token
   - Use your email and token for authentication

5. Start the server:
   node jira-mock-server.js

6. Test with:
   curl http://localhost:3001/api/health
*/
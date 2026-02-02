// JIRA Integration Mock Server
// This file demonstrates how to integrate with real JIRA APIs
// In production, you would implement these endpoints in your backend server

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '.')));

// Mock JIRA configuration (replace with real values)
const JIRA_CONFIG = {
    cloudId: '2604d8a6-7a83-454a-abcc-2cd164d90231',
    baseUrl: 'https://api.atlassian.com',
    email: 'your-email@company.com',
    apiToken: 'your-api-token' // Replace with actual API token
};

// Mock projects data (in real implementation, fetch from JIRA)
const MOCK_PROJECTS = [
    { key: 'A360', name: 'Analyst 360', id: '11803' },
    { key: 'ACES', name: 'Aces', id: '10018' },
    { key: 'AGILETEST', name: 'Agile-Test-Project', id: '10002' },
    { key: 'CHEETAHS', name: 'Cheetahs', id: '10791' },
    { key: 'CALCENG', name:'Calculations Engine', id: '11813' }
];

// Mock issue types
const MOCK_ISSUE_TYPES = [
    { name: 'Initiative', description: 'A large feature or effort with multiple Epics spans multiple Projects.' },
    { name: 'Epic', description: 'A big user story that needs to be broken down.' },
    { name: 'Story', description: 'Stories track functionality or features expressed as user goals.' },
    { name: 'Task', description: 'A small, distinct piece of work.' },
    { name: 'Feature', description: 'A new feature or functionality.' }
];

// API Routes

// Get all projects
app.get('/api/jira/projects', (req, res) => {
    // In real implementation, make authenticated request to JIRA API:
    // GET /rest/api/3/project/search
    
    setTimeout(() => {
        res.json({
            values: MOCK_PROJECTS,
            total: MOCK_PROJECTS.length
        });
    }, 500);
});

// Get issue types for a project
app.get('/api/jira/projects/:projectKey/issuetypes', (req, res) => {
    // In real implementation:
    // GET /rest/api/3/project/{projectKey}/issuetypes
    
    setTimeout(() => {
        res.json({
            values: MOCK_ISSUE_TYPES
        });
    }, 300);
});

// Create JIRA issue
app.post('/api/jira/issues', (req, res) => {
    // In real implementation:
    // POST /rest/api/3/issue
    
    const issueData = req.body;
    
    // Simulate creation time
    setTimeout(() => {
        const mockKey = issueData.fields.project.key + '-' + Math.floor(Math.random() * 1000 + 100);
        
        res.json({
            key: mockKey,
            id: Math.floor(Math.random() * 10000),
            self: `https://mistech.atlassian.net/rest/api/3/issue/${mockKey}`
        });
    }, 1000);
});

// Get JIRA issue
app.get('/api/jira/issues/:issueKey', (req, res) => {
    // In real implementation:
    // GET /rest/api/3/issue/{issueKey}
    
    const { issueKey } = req.params;
    
    res.json({
        key: issueKey,
        fields: {
            summary: 'Mock Issue',
            description: 'This is a mock issue',
            status: { name: 'To Do' },
            priority: { name: 'Medium' }
        }
    });
});

// Update JIRA issue
app.put('/api/jira/issues/:issueKey', (req, res) => {
    // In real implementation:
    // PUT /rest/api/3/issue/{issueKey}
    
    const { issueKey } = req.params;
    
    res.json({
        key: issueKey,
        message: 'Issue updated successfully'
    });
});

// Search JIRA issues
app.post('/api/jira/search', (req, res) => {
    // In real implementation:
    // POST /rest/api/3/search
    
    const { jql } = req.body;
    
    res.json({
        issues: [],
        total: 0
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'JIRA Integration API is running' });
});

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`JIRA Integration API server running on port ${PORT}`);
    console.log(`Frontend available at: http://localhost:${PORT}`);
    console.log(`API endpoints available at: http://localhost:${PORT}/api`);
});

/* 
REAL JIRA INTEGRATION IMPLEMENTATION NOTES:

1. Authentication:
   - Use Atlassian API tokens or OAuth 2.0
   - Include Authorization header: "Basic" + base64(email:apiToken)

2. API Endpoints:
   - Base URL: https://api.atlassian.com/ex/jira/{cloudId}/rest/api/3
   - Use the actual MCP Atlassian tools available in this environment

3. Real Implementation Example:

async function createJiraIssue(issueData) {
    const response = await fetch(`${JIRA_CONFIG.baseUrl}/ex/jira/${JIRA_CONFIG.cloudId}/rest/api/3/issue`, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${btoa(JIRA_CONFIG.email + ':' + JIRA_CONFIG.apiToken)}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(issueData)
    });
    
    return response.json();
}

4. Use MCP Atlassian Tools:
   - mcp_atlassian_atl_createJiraIssue
   - mcp_atlassian_atl_getVisibleJiraProjects
   - mcp_atlassian_atl_getJiraProjectIssueTypesMetadata
   
   These tools handle authentication and API calls automatically.
*/

module.exports = app;
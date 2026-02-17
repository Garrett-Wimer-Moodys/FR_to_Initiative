# JIRA Integration Backend Setup Guide

## Overview
This backend API provides real JIRA integration for the FR to Initiative application. It uses the Atlassian REST API v3 to create, read, and manage JIRA issues.

## Prerequisites
- Node.js (version 14 or higher)
- JIRA Cloud instance access
- JIRA API Token

## Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure JIRA Credentials

#### Option A: Environment Variables (Recommended)
```bash
# Windows PowerShell
$env:JIRA_EMAIL="your-email@company.com"
$env:JIRA_API_TOKEN="your-api-token"

# Or create .env file (copy from .env.example)
```

#### Option B: Edit Configuration File
Edit the `JIRA_CONFIG` object in `jira-mock-server.js`:
```javascript
const JIRA_CONFIG = {
    email: 'your-email@company.com',
    apiToken: 'your-actual-api-token'
};
```

### 3. Generate JIRA API Token
1. Go to: https://id.atlassian.com/manage-profile/security/api-tokens
2. Click "Create API token"
3. Give it a label (e.g., "FR Initiative App")
4. Copy the generated token

### 4. Start the Server
```bash
npm start
# Or for development with auto-restart:
npm run dev
```

### 5. Test the API
```bash
# Check if server is running
curl http://localhost:3001/api/health

# Test project access
curl http://localhost:3001/api/jira/projects
```

## API Endpoints

### Projects
- `GET /api/jira/projects` - Get all accessible projects
- `GET /api/jira/projects/:projectKey/issuetypes` - Get issue types for project

### Issues
- `POST /api/jira/issues` - Create new issue
- `GET /api/jira/issues/:issueKey` - Get issue details
- `PUT /api/jira/issues/:issueKey` - Update issue
- `POST /api/jira/search` - Search issues using JQL

### System
- `GET /api/health` - Health check and configuration status

## Frontend Integration

The frontend is already configured to use these endpoints. Just make sure:

1. The backend server is running on port 3001
2. Your JIRA credentials are properly configured
3. The frontend is served from the same origin or CORS is enabled

## Troubleshooting

### Common Issues

1. **401 Unauthorized**
   - Check your email and API token
   - Ensure API token is valid and not expired

2. **403 Forbidden**
   - Verify you have proper permissions in JIRA
   - Check project access permissions

3. **CORS Issues**
   - Backend already includes CORS middleware
   - Ensure frontend is making requests to correct port

4. **Connection Refused**
   - Make sure backend server is running
   - Check if port 3001 is available

### Debug Mode

To see detailed API responses and errors, check the server console output. All JIRA API errors are logged with full details.

### Testing with Real Data

Once configured, you can test creating real JIRA issues through the frontend:

1. Open http://localhost:3001 in your browser
2. Navigate to "Manage Initiatives"
3. Click "Configure JIRA Integration"
4. Select a project and create an issue

## Security Notes

- Never commit your `.env` file or API tokens to version control
- API tokens should be treated like passwords
- Consider using OAuth 2.0 for production deployments
- Implement proper error handling for production use

## Production Deployment

For production deployment:

1. Use environment variables for all sensitive data
2. Implement proper logging and monitoring
3. Add rate limiting and security headers
4. Use HTTPS for all connections
5. Consider implementing user authentication
6. Add input validation and sanitization

## Current JIRA Configuration

- **JIRA Instance**: mistech.atlassian.net
- **Cloud ID**: 2604d8a6-7a83-454a-abcc-2cd164d90231
- **Available Projects**: A360, ACES, AGILETEST, CHEETAHS, CALCENG, and others
- **API Version**: Atlassian REST API v3
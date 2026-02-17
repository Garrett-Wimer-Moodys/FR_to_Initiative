// Real JIRA Integration Service
// This service connects to the backend API for real JIRA integration

angular.module('frInitiativeApp')
    .service('RealJiraService', function($http) {
        var self = this;
        var API_BASE_URL = '/api/jira';
        var selectedProject = null;
        var availableProjects = [];
        
        // Set selected project
        this.setSelectedProject = function(project) {
            selectedProject = project;
        };
        
        this.getSelectedProject = function() {
            return selectedProject;
        };
        
        // Real JIRA API integration via backend
        this.createJiraIssue = function(initiative, projectKey, issueType) {
            var issueData = {
                projectKey: projectKey,
                issueType: issueType || 'Task',
                summary: initiative.title,
                description: this.formatDescription(initiative),
                priority: this.mapPriorityToJira(initiative.priority)
            };
            
            return $http.post(API_BASE_URL + '/issues', issueData);
        };
        
        this.getProjects = function() {
            return $http.get(API_BASE_URL + '/projects')
                .then(function(response) {
                    availableProjects = response.data.values || [];
                    return response;
                });
        };
        
        this.getIssueTypes = function(projectKey) {
            return $http.get(API_BASE_URL + '/projects/' + projectKey + '/issuetypes');
        };
        
        this.getIssue = function(issueKey) {
            return $http.get(API_BASE_URL + '/issues/' + issueKey);
        };
        
        this.updateIssue = function(issueKey, updateData) {
            return $http.put(API_BASE_URL + '/issues/' + issueKey, updateData);
        };
        
        this.searchIssues = function(jql, fields) {
            return $http.post(API_BASE_URL + '/search', {
                jql: jql,
                fields: fields || ['summary', 'status', 'assignee', 'priority']
            });
        };
        
        this.checkHealth = function() {
            return $http.get('/api/health');
        };\n        \n        this.formatDescription = function(initiative) {\n            var description = initiative.description;\n            \n            if (initiative.requirements && initiative.requirements.length > 0) {\n                description += '\\n\\n*Requirements:*\\n';\n                initiative.requirements.forEach(function(req) {\n                    description += '* ' + req + '\\n';\n                });\n            }\n            \n            if (initiative.acceptanceCriteria && initiative.acceptanceCriteria.length > 0) {\n                description += '\\n*Acceptance Criteria:*\\n';\n                initiative.acceptanceCriteria.forEach(function(criteria) {\n                    description += '* ' + criteria + '\\n';\n                });\n            }\n            \n            if (initiative.estimatedEffort) {\n                description += '\\n*Estimated Effort:* ' + initiative.estimatedEffort;\n            }\n            \n            return description;\n        };\n        \n        this.mapPriorityToJira = function(priority) {\n            switch(priority && priority.toLowerCase()) {\n                case 'high': return 'High';\n                case 'medium': return 'Medium';\n                case 'low': return 'Low';\n                default: return 'Medium';\n            }\n        };\n    });\n\n/*\nBACKEND IMPLEMENTATION GUIDE:\n\nTo implement real JIRA integration in your backend, create these API endpoints:\n\n1. GET /api/jira/projects\n   - Calls: mcp_atlassian_atl_getVisibleJiraProjects(CLOUD_ID)\n   - Returns: List of accessible JIRA projects\n\n2. GET /api/jira/projects/:projectKey/issuetypes\n   - Calls: mcp_atlassian_atl_getJiraProjectIssueTypesMetadata(CLOUD_ID, projectKey)\n   - Returns: Available issue types for the project\n\n3. POST /api/jira/create-issue\n   - Calls: mcp_atlassian_atl_createJiraIssue(CLOUD_ID, projectKey, issueTypeName, summary, description)\n   - Returns: Created issue details (key, id, url)\n\n4. GET /api/jira/issues/:issueKey\n   - Calls: mcp_atlassian_atl_getJiraIssue(CLOUD_ID, issueKey)\n   - Returns: Issue details\n\n5. PUT /api/jira/issues/:issueKey\n   - Calls: mcp_atlassian_atl_editJiraIssue(CLOUD_ID, issueKey, fields)\n   - Returns: Updated issue\n\nExample Node.js backend endpoint:\n\napp.post('/api/jira/create-issue', async (req, res) => {\n    try {\n        const { projectKey, issueTypeName, summary, description } = req.body;\n        \n        const result = await mcpClient.call('mcp_atlassian_atl_createJiraIssue', {\n            cloudId: CLOUD_ID,\n            projectKey: projectKey,\n            issueTypeName: issueTypeName,\n            summary: summary,\n            description: description\n        });\n        \n        res.json(result);\n    } catch (error) {\n        console.error('Error creating JIRA issue:', error);\n        res.status(500).json({ error: 'Failed to create JIRA issue' });\n    }\n});\n*/
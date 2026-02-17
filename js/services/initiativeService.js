// JIRA Integration Service - Real REST API
angular.module('frInitiativeApp')
    .service('JiraService', ['$http', '$q', function($http, $q) {
        var JIRA_BASE_URL = '/api/jira'; // Backend API endpoint
        var selectedProject = null;
        
        this.getProjects = function() {
            return $http({
                method: 'GET',
                url: JIRA_BASE_URL + '/projects',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        };
        
        this.setSelectedProject = function(project) {
            selectedProject = project;
        };
        
        this.getSelectedProject = function() {
            return selectedProject;
        };
        
        this.getIssueTypes = function(projectKey) {
            return $http({
                method: 'GET',
                url: JIRA_BASE_URL + '/projects/' + projectKey + '/issuetypes',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        };
        
        this.createIssue = function(issueData) {
            return $http({
                method: 'POST',
                url: JIRA_BASE_URL + '/issues',
                data: issueData,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        };
        
        this.updateIssue = function(issueKey, updateData) {
            return $http({
                method: 'PUT',
                url: JIRA_BASE_URL + '/issues/' + issueKey,
                data: updateData,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        };
        
        this.getIssue = function(issueKey) {
            return $http({
                method: 'GET',
                url: JIRA_BASE_URL + '/issues/' + issueKey,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        };
        
        this.searchIssues = function(jql) {
            return $http({
                method: 'POST',
                url: JIRA_BASE_URL + '/search',
                data: {
                    jql: jql,
                    fields: ['summary', 'description', 'status', 'priority', 'created', 'updated']
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        };
        
        // Convert initiative to JIRA issue format
        this.formatInitiativeForJira = function(initiative, projectKey, issueType) {
            var description = initiative.description;
            
            if (initiative.requirements && initiative.requirements.length > 0) {
                description += '\n\n*Requirements:*\n';
                initiative.requirements.forEach(function(req) {
                    description += '* ' + req + '\n';
                });
            }
            
            if (initiative.acceptanceCriteria && initiative.acceptanceCriteria.length > 0) {
                description += '\n*Acceptance Criteria:*\n';
                initiative.acceptanceCriteria.forEach(function(criteria) {
                    description += '* ' + criteria + '\n';
                });
            }
            
            if (initiative.estimatedEffort) {
                description += '\n*Estimated Effort:* ' + initiative.estimatedEffort;
            }
            
            return {
                projectKey: projectKey,
                issueType: issueType || 'Initiative',
                summary: initiative.title,
                description: description,
                priority: this.mapPriorityToJira(initiative.priority)
            };
        };
        
        this.mapPriorityToJira = function(priority) {
            switch(priority && priority.toLowerCase()) {
                case 'high': return 'High';
                case 'medium': return 'Medium';
                case 'low': return 'Low';
                default: return 'Medium';
            }
        };
    }])
    
// Initiative Service
angular.module('frInitiativeApp')
    .service('InitiativeService', ['JiraService', function(JiraService) {
        var initiatives = [
            {
                id: 1,
                title: 'User Authentication System',
                description: 'Implement secure user login and registration functionality',
                status: 'completed',
                priority: 'high',
                createdDate: new Date('2026-01-15'),
                dueDate: new Date('2026-02-15')
            },
            {
                id: 2,
                title: 'Dashboard Analytics',
                description: 'Create comprehensive analytics dashboard for business metrics',
                status: 'in-progress',
                priority: 'medium',
                createdDate: new Date('2026-01-20'),
                dueDate: new Date('2026-03-01')
            },
            {
                id: 3,
                title: 'Mobile Responsive Design',
                description: 'Ensure application works seamlessly on mobile devices',
                status: 'planning',
                priority: 'high',
                createdDate: new Date('2026-01-25'),
                dueDate: new Date('2026-02-28')
            }
        ];
        
        var nextId = 4;
        
        this.getAllInitiatives = function() {
            return angular.copy(initiatives);
        };
        
        this.getInitiativeById = function(id) {
            return initiatives.find(function(initiative) {
                return initiative.id === id;
            });
        };
        
        this.addInitiative = function(initiative) {
            var newInitiative = {
                id: nextId++,
                title: initiative.title,
                description: initiative.description,
                status: initiative.status || 'planning',
                priority: initiative.priority || 'medium',
                createdDate: new Date(),
                dueDate: initiative.dueDate || null
            };
            initiatives.push(newInitiative);
            return newInitiative;
        };
        
        this.updateInitiativeStatus = function(id, status) {
            var initiative = this.getInitiativeById(id);
            if (initiative) {
                initiative.status = status;
                return true;
            }
            return false;
        };
        
        this.deleteInitiative = function(id) {
            var index = initiatives.findIndex(function(initiative) {
                return initiative.id === id;
            });
            if (index > -1) {
                initiatives.splice(index, 1);
                return true;
            }
            return false;
        };
        
        this.getInitiativesByStatus = function(status) {
            return initiatives.filter(function(initiative) {
                return initiative.status === status;
            });
        };
        
        // JIRA Integration methods
        this.createJiraIssue = function(initiative, projectKey, issueType) {
            var issueData = JiraService.formatInitiativeForJira(initiative, projectKey, issueType);
            return JiraService.createIssue(issueData);
        };
        
        this.syncWithJira = function(initiative) {
            if (initiative.jiraKey) {
                return JiraService.getIssue(initiative.jiraKey);
            }
            return null;
        };
        
        this.updateJiraIssue = function(jiraKey, updateData) {
            return JiraService.updateIssue(jiraKey, updateData);
        };
    });
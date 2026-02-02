// JIRA Integration Service
angular.module('frInitiativeApp')
    .service('JiraService', ['$http', '$q', function($http, $q) {
        var CLOUD_ID = '2604d8a6-7a83-454a-abcc-2cd164d90231';
        var API_BASE = 'https://api.atlassian.com/ex/jira/' + CLOUD_ID + '/rest/api/3';
        
        // Available projects cache
        var availableProjects = [];
        var selectedProject = null;
        
        this.getProjects = function() {
            return $http({
                method: 'GET',
                url: '/api/jira/projects',
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
                url: '/api/jira/projects/' + projectKey + '/issuetypes',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        };
        
        this.createIssue = function(issueData) {
            return $http({
                method: 'POST',
                url: '/api/jira/issues',
                data: issueData,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        };
        
        this.updateIssue = function(issueKey, updateData) {
            return $http({
                method: 'PUT',
                url: '/api/jira/issues/' + issueKey,
                data: updateData,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        };
        
        this.getIssue = function(issueKey) {
            return $http({
                method: 'GET',
                url: '/api/jira/issues/' + issueKey,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        };
        
        this.searchIssues = function(jql) {
            return $http({
                method: 'POST',
                url: '/api/jira/search',
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
                fields: {
                    project: {
                        key: projectKey
                    },
                    summary: initiative.title,
                    description: description,
                    issuetype: {
                        name: issueType || 'Initiative'
                    },
                    priority: {
                        name: this.mapPriorityToJira(initiative.priority)
                    }
                }
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
        
        // Mock API endpoints for demonstration
        this.getMockProjects = function() {
            var deferred = $q.defer();
            setTimeout(function() {
                deferred.resolve({
                    data: {
                        values: [
                            { key: 'A360', name: 'Analyst 360', id: '11803' },
                            { key: 'ACES', name: 'Aces', id: '10018' },
                            { key: 'AGILETEST', name: 'Agile-Test-Project', id: '10002' },
                            { key: 'CHEETAHS', name: 'Cheetahs', id: '10791' },
                            { key: 'CALCENG', name: 'Calculations Engine', id: '11813' }
                        ]
                    }
                });
            }, 500);
            return deferred.promise;
        };
        
        this.createMockIssue = function(issueData) {
            var deferred = $q.defer();
            setTimeout(function() {
                var mockKey = issueData.fields.project.key + '-' + Math.floor(Math.random() * 1000 + 100);
                deferred.resolve({
                    data: {
                        key: mockKey,
                        id: Math.floor(Math.random() * 10000),
                        self: 'https://mistech.atlassian.net/browse/' + mockKey
                    }
                });
            }, 1000);
            return deferred.promise;
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
            return JiraService.createMockIssue(issueData);
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
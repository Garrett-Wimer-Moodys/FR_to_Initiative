// Initiatives Controller
angular.module('frInitiativeApp')
    .controller('InitiativesController', ['$scope', 'InitiativeService', 'JiraService', function($scope, InitiativeService, JiraService) {
        $scope.pageTitle = 'Initiatives Management';
        $scope.initiatives = [];
        $scope.newInitiative = {};
        $scope.showAddForm = false;
        
        // AI Processing variables
        $scope.requirementsData = null;
        $scope.isProcessingAI = false;
        $scope.aiGeneratedInitiatives = [];
        $scope.showAIResults = false;
        
        // JIRA Integration variables
        $scope.jiraConnectionStatus = 'disconnected'; // disconnected, connecting, connected
        $scope.availableProjects = [];
        $scope.selectedProject = null;
        $scope.availableIssueTypes = [];
        $scope.selectedIssueType = 'Initiative';
        $scope.showJiraConfig = false;
        
        // Initialize
        $scope.init = function() {
            $scope.initiatives = InitiativeService.getAllInitiatives();
            
            // Check if we have requirements data from home page
            var storedData = sessionStorage.getItem('initiativeData');
            if (storedData) {
                $scope.requirementsData = JSON.parse(storedData);
                $scope.processRequirementsWithAI();
                // Clear the session storage
                sessionStorage.removeItem('initiativeData');
            }
        };
        
        // Process requirements with AI
        $scope.processRequirementsWithAI = function() {
            $scope.isProcessingAI = true;
            
            // Simulate AI processing
            setTimeout(function() {
                $scope.$apply(function() {
                    $scope.isProcessingAI = false;
                    $scope.showAIResults = true;
                    
                    // Generate sample initiatives based on requirements
                    $scope.aiGeneratedInitiatives = [
                        {
                            title: 'User Authentication & Security System',
                            description: 'Implement comprehensive authentication system with MFA, SSO, and corporate credential integration',
                            priority: 'High',
                            estimatedEffort: '6-8 weeks',
                            type: 'Epic',
                            requirements: ['Corporate credential login', 'Multi-factor authentication', 'Password reset functionality'],
                            acceptanceCriteria: [
                                'Users can log in with corporate credentials',
                                'MFA is enforced for all users',
                                'Password reset works via email'
                            ]
                        },
                        {
                            title: 'Data Management & Security Platform',
                            description: 'Build secure data storage and management system with encryption and search capabilities',
                            priority: 'High',
                            estimatedEffort: '8-10 weeks',
                            type: 'Epic',
                            requirements: ['Document upload/storage', 'Data encryption', 'Search and filtering'],
                            acceptanceCriteria: [
                                'Documents can be uploaded and stored securely',
                                'All data encrypted at rest and in transit',
                                'Users can search and filter documents effectively'
                            ]
                        },
                        {
                            title: 'Reporting & Analytics Dashboard',
                            description: 'Create comprehensive reporting system with real-time dashboards and export capabilities',
                            priority: 'Medium',
                            estimatedEffort: '4-6 weeks',
                            type: 'Epic',
                            requirements: ['Monthly reports', 'PDF/Excel export', 'Real-time dashboard'],
                            acceptanceCriteria: [
                                'Monthly usage reports are automatically generated',
                                'Reports can be exported to PDF and Excel',
                                'Real-time dashboard shows key metrics'
                            ]
                        },
                        {
                            title: 'Enterprise Integration Services',
                            description: 'Develop integration layer for LDAP, APIs, and SSO connectivity',
                            priority: 'High',
                            estimatedEffort: '6-8 weeks',
                            type: 'Epic',
                            requirements: ['LDAP integration', 'API endpoints', 'SSO capability'],
                            acceptanceCriteria: [
                                'System integrates with existing LDAP directory',
                                'API endpoints are available for third-party apps',
                                'SSO works seamlessly'
                            ]
                        },
                        {
                            title: 'Performance & Infrastructure Optimization',
                            description: 'Ensure system meets performance requirements and uptime goals',
                            priority: 'Medium',
                            estimatedEffort: '3-4 weeks',
                            type: 'Epic',
                            requirements: ['1000 concurrent users', 'Sub-3s load times', '99.9% uptime'],
                            acceptanceCriteria: [
                                'System supports 1000 concurrent users',
                                'Page load times are under 3 seconds',
                                '99.9% uptime achieved'
                            ]
                        },
                        {
                            title: 'Mobile Application Development',
                            description: 'Create responsive web interface and native mobile apps with offline capability',
                            priority: 'Medium',
                            estimatedEffort: '10-12 weeks',
                            type: 'Epic',
                            requirements: ['Responsive web UI', 'Native iOS/Android apps', 'Offline functionality'],
                            acceptanceCriteria: [
                                'Web interface is fully responsive',
                                'Native apps available for iOS and Android',
                                'Critical functions work offline'
                            ]
                        }
                    ];
                });
            }, 3000); // Simulate 3-second AI processing
        };
        
        // Connect to JIRA and load projects
        $scope.connectToJira = function() {
            $scope.jiraConnectionStatus = 'connecting';
            
            JiraService.getMockProjects().then(
                function(response) {
                    $scope.availableProjects = response.data.values;
                    $scope.jiraConnectionStatus = 'connected';
                    $scope.showJiraConfig = true;
                },
                function(error) {
                    console.error('Failed to connect to JIRA:', error);
                    $scope.jiraConnectionStatus = 'disconnected';
                    alert('Failed to connect to JIRA. Please check your configuration.');
                }
            );
        };
        
        // Select JIRA project
        $scope.selectProject = function(project) {
            $scope.selectedProject = project;
            JiraService.setSelectedProject(project);
            
            // Load issue types for selected project (using mock data)
            $scope.availableIssueTypes = [
                { name: 'Initiative', description: 'A large feature or effort with multiple Epics spans multiple Projects.' },
                { name: 'Epic', description: 'A big user story that needs to be broken down.' },
                { name: 'Story', description: 'Stories track functionality or features expressed as user goals.' },
                { name: 'Task', description: 'A small, distinct piece of work.' },
                { name: 'Feature', description: 'A new feature or functionality.' }
            ];
        };
        
        // Create initiative in JIRA
        $scope.createInJira = function(initiative) {
            if (!$scope.selectedProject) {
                alert('Please select a JIRA project first.');
                return;
            }
            
            initiative.jiraStatus = 'creating';
            
            InitiativeService.createJiraIssue(initiative, $scope.selectedProject.key, $scope.selectedIssueType)
                .then(
                    function(response) {
                        initiative.jiraStatus = 'created';
                        initiative.jiraKey = response.data.key;
                        initiative.jiraUrl = 'https://mistech.atlassian.net/browse/' + response.data.key;
                        console.log('Created JIRA issue:', response.data.key);
                    },
                    function(error) {
                        initiative.jiraStatus = 'error';
                        console.error('Failed to create JIRA issue:', error);
                        alert('Failed to create JIRA issue. Please try again.');
                    }
                );
        };
        
        // Create all initiatives in JIRA
        $scope.createAllInJira = function() {
            if ($scope.jiraConnectionStatus !== 'connected') {
                alert('Please connect to JIRA first.');
                return;
            }
            
            if (!$scope.selectedProject) {
                alert('Please select a JIRA project first.');
                return;
            }
            
            $scope.aiGeneratedInitiatives.forEach(function(initiative) {
                if (!initiative.jiraStatus) {
                    $scope.createInJira(initiative);
                }
            });
        };
        
        // Toggle JIRA configuration panel
        $scope.toggleJiraConfig = function() {
            $scope.showJiraConfig = !$scope.showJiraConfig;
        };
        
        // Get status badge class for JIRA status
        $scope.getJiraStatusClass = function(status) {
            switch(status) {
                case 'created': return 'badge bg-success';
                case 'creating': return 'badge bg-warning';
                case 'error': return 'badge bg-danger';
                default: return 'badge bg-secondary';
            }
        };
        
        // Open JIRA issue in new tab
        $scope.openJiraIssue = function(jiraUrl) {
            if (jiraUrl) {
                window.open(jiraUrl, '_blank');
            }
        };
        
        // Add generated initiative to local list
        $scope.addToLocal = function(initiative) {
            var newInitiative = {
                title: initiative.title,
                description: initiative.description,
                priority: initiative.priority,
                status: 'planning',
                type: initiative.type,
                estimatedEffort: initiative.estimatedEffort,
                requirements: initiative.requirements,
                acceptanceCriteria: initiative.acceptanceCriteria
            };
            
            InitiativeService.addInitiative(newInitiative);
            $scope.initiatives = InitiativeService.getAllInitiatives();
        };
        
        // Original functionality
        $scope.addInitiative = function() {
            if ($scope.newInitiative.title && $scope.newInitiative.description) {
                InitiativeService.addInitiative($scope.newInitiative);
                $scope.newInitiative = {};
                $scope.showAddForm = false;
                $scope.initiatives = InitiativeService.getAllInitiatives();
            }
        };
        
        $scope.toggleAddForm = function() {
            $scope.showAddForm = !$scope.showAddForm;
            if (!$scope.showAddForm) {
                $scope.newInitiative = {};
            }
        };
        
        $scope.updateStatus = function(initiative, newStatus) {
            InitiativeService.updateInitiativeStatus(initiative.id, newStatus);
            $scope.initiatives = InitiativeService.getAllInitiatives();
        };
        
        $scope.deleteInitiative = function(initiativeId) {
            if (confirm('Are you sure you want to delete this initiative?')) {
                InitiativeService.deleteInitiative(initiativeId);
                $scope.initiatives = InitiativeService.getAllInitiatives();
            }
        };
        
        $scope.getStatusClass = function(status) {
            switch(status) {
                case 'completed': return 'badge bg-success';
                case 'in-progress': return 'badge bg-warning';
                case 'planning': return 'badge bg-info';
                default: return 'badge bg-secondary';
            }
        };
        
        // Initialize controller
        $scope.init();
    }]);
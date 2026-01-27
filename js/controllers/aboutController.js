// About Controller
angular.module('frInitiativeApp')
    .controller('AboutController', ['$scope', function($scope) {
        $scope.pageTitle = 'About FR to Initiative';
        $scope.appInfo = {
            version: '1.0.0',
            description: 'A comprehensive tool for converting functional requirements into actionable business initiatives.',
            features: [
                'Requirements analysis and categorization',
                'Initiative planning and tracking',
                'Progress monitoring and reporting',
                'Collaborative workspace',
                'Export capabilities'
            ],
            technologies: [
                'AngularJS 1.8.2',
                'Bootstrap 5',
                'HTML5 & CSS3',
                'JavaScript ES5+'
            ]
        };
        
        $scope.teamMembers = [
            {
                name: 'Development Team',
                role: 'Full Stack Development',
                description: 'Responsible for application architecture and implementation'
            },
            {
                name: 'Business Analysts',
                role: 'Requirements Analysis',
                description: 'Expert in translating business needs into technical requirements'
            },
            {
                name: 'Project Managers',
                role: 'Initiative Planning',
                description: 'Specialized in project planning and execution strategies'
            }
        ];
    }]);
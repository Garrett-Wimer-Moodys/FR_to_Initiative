// Home Controller
angular.module('frInitiativeApp')
    .controller('HomeController', ['$scope', function($scope) {
        $scope.pageTitle = 'Welcome to FR to Initiative';
        $scope.message = 'Transform your functional requirements into actionable initiatives.';
        
        $scope.features = [
            {
                title: 'Requirement Analysis',
                description: 'Analyze and categorize functional requirements effectively.',
                icon: 'fas fa-search'
            },
            {
                title: 'Initiative Planning',
                description: 'Convert requirements into strategic initiatives.',
                icon: 'fas fa-lightbulb'
            },
            {
                title: 'Progress Tracking',
                description: 'Monitor the progress of your initiatives in real-time.',
                icon: 'fas fa-chart-line'
            }
        ];
        
        $scope.getStarted = function() {
            window.location.hash = '#/initiatives';
        };
    }]);
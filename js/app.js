// Main AngularJS application module
angular.module('frInitiativeApp', ['ngRoute'])
    .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
        $routeProvider
            .when('/home', {
                templateUrl: 'views/home.html',
                controller: 'HomeController'
            })
            .when('/initiatives', {
                templateUrl: 'views/initiatives.html',
                controller: 'InitiativesController'
            })
            .when('/about', {
                templateUrl: 'views/about.html',
                controller: 'AboutController'
            })
            .otherwise({
                redirectTo: '/home'
            });
    }])
    .run(['$rootScope', function($rootScope) {
        $rootScope.appName = 'FR to Initiative';
        $rootScope.version = '1.0.0';
    }]);
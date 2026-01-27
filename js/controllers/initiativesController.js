// Initiatives Controller
angular.module('frInitiativeApp')
    .controller('InitiativesController', ['$scope', 'InitiativeService', function($scope, InitiativeService) {
        $scope.pageTitle = 'Initiatives Management';
        $scope.initiatives = [];
        $scope.newInitiative = {};
        $scope.showAddForm = false;
        
        // Initialize
        $scope.init = function() {
            $scope.initiatives = InitiativeService.getAllInitiatives();
        };
        
        // Add new initiative
        $scope.addInitiative = function() {
            if ($scope.newInitiative.title && $scope.newInitiative.description) {
                InitiativeService.addInitiative($scope.newInitiative);
                $scope.newInitiative = {};
                $scope.showAddForm = false;
                $scope.initiatives = InitiativeService.getAllInitiatives();
            }
        };
        
        // Toggle add form
        $scope.toggleAddForm = function() {
            $scope.showAddForm = !$scope.showAddForm;
            if (!$scope.showAddForm) {
                $scope.newInitiative = {};
            }
        };
        
        // Update initiative status
        $scope.updateStatus = function(initiative, newStatus) {
            InitiativeService.updateInitiativeStatus(initiative.id, newStatus);
            $scope.initiatives = InitiativeService.getAllInitiatives();
        };
        
        // Delete initiative
        $scope.deleteInitiative = function(initiativeId) {
            if (confirm('Are you sure you want to delete this initiative?')) {
                InitiativeService.deleteInitiative(initiativeId);
                $scope.initiatives = InitiativeService.getAllInitiatives();
            }
        };
        
        // Get status badge class
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
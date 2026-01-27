// Initiative Service
angular.module('frInitiativeApp')
    .service('InitiativeService', function() {
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
    });
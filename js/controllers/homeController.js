// Home Controller
angular.module('frInitiativeApp')
    .controller('HomeController', ['$scope', '$location', function($scope, $location) {
        $scope.pageTitle = 'Welcome to FR to Initiative';
        $scope.message = 'Transform your functional requirements into actionable initiatives.';
        
        // Initialize scope variables
        $scope.isDragOver = false;
        $scope.isProcessing = false;
        $scope.convertedText = '';
        $scope.errorMessage = '';
        $scope.fileName = '';
        $scope.aiInstructions = '';
        
        // Original features
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
                title: 'JIRA + Confluence Integration',
                description: 'Upload requirements directly to JIRA and document in Confluence.',
                icon: 'fas fa-chart-line'
            }
        ];
        
        // File dialog handler
        $scope.openFileDialog = function() {
            document.getElementById('fileInput').click();
        };
        
        // Handle file selection from dialog
        $scope.onFileSelected = function(files) {
            if (files && files.length > 0) {
                $scope.processFile(files[0]);
            }
        };
        
        // Drag and drop handlers
        $scope.onDragEnter = function(event) {
            event.preventDefault();
            $scope.isDragOver = true;
            $scope.$apply();
        };
        
        $scope.onDragLeave = function(event) {
            event.preventDefault();
            $scope.isDragOver = false;
            $scope.$apply();
        };
        
        $scope.onDragOver = function(event) {
            event.preventDefault();
            return false;
        };
        
        $scope.onFileDropped = function(event) {
            event.preventDefault();
            $scope.isDragOver = false;
            
            var files = event.dataTransfer.files;
            if (files.length > 0) {
                $scope.processFile(files[0]);
            }
            $scope.$apply();
        };
        
        // Process the uploaded file
        $scope.processFile = function(file) {
            // Reset previous state
            $scope.convertedText = '';
            $scope.errorMessage = '';
            $scope.aiInstructions = '';
            
            // Validate file type
            if (!file.name.match(/\.(doc|docx)$/i)) {
                $scope.errorMessage = 'Please select a Word document (.doc or .docx file).';
                $scope.$apply();
                return;
            }
            
            // Validate file size (10MB limit)
            if (file.size > 10 * 1024 * 1024) {
                $scope.errorMessage = 'File size must be less than 10MB.';
                $scope.$apply();
                return;
            }
            
            $scope.fileName = file.name;
            $scope.isProcessing = true;
            
            // Simulate file processing for functional requirements
            $scope.simulateFileConversion(file);
        };
        
        // Simulate file conversion for functional requirements
        $scope.simulateFileConversion = function(file) {
            setTimeout(function() {
                $scope.$apply(function() {
                    $scope.isProcessing = false;
                    
                    // Simulate functional requirements extraction
                    $scope.convertedText = `Functional Requirements extracted from "${file.name}":

1. USER AUTHENTICATION
   - Users must be able to log in using corporate credentials
   - System must support multi-factor authentication
   - Password reset functionality must be available

2. DATA MANAGEMENT
   - System must allow users to upload and store documents
   - Data must be encrypted at rest and in transit
   - Users must be able to search and filter documents

3. REPORTING CAPABILITIES
   - System must generate monthly usage reports
   - Reports must be exportable to PDF and Excel formats
   - Real-time dashboard with key metrics

4. INTEGRATION REQUIREMENTS
   - Must integrate with existing LDAP directory
   - API endpoints for third-party applications
   - Single sign-on (SSO) capability

5. PERFORMANCE REQUIREMENTS
   - System must support 1000 concurrent users
   - Page load times must be under 3 seconds
   - 99.9% uptime requirement

6. MOBILE SUPPORT
   - Responsive web interface for mobile devices
   - Native mobile app for iOS and Android
   - Offline capability for critical functions

File processed: ${new Date().toLocaleString()}
Ready for AI processing and JIRA initiative creation.`;
                });
            }, 2000); // Simulate 2-second processing time
        };
        
        // Proceed to initiatives with AI instructions
        $scope.proceedToInitiatives = function() {
            if (!$scope.aiInstructions.trim()) {
                alert('Please provide instructions for AI processing.');
                return;
            }
            
            // Store the data for the initiatives page
            var initiativeData = {
                requirements: $scope.convertedText,
                aiInstructions: $scope.aiInstructions,
                fileName: $scope.fileName,
                timestamp: new Date().toISOString()
            };
            
            // Store in session storage for use in initiatives controller
            sessionStorage.setItem('initiativeData', JSON.stringify(initiativeData));
            
            // Navigate to initiatives page
            $location.path('/initiatives');
        };
        
        // Download converted text as .txt file (keeping original functionality)
        $scope.downloadTextFile = function() {
            if (!$scope.convertedText) {
                return;
            }
            
            var blob = new Blob([$scope.convertedText], { type: 'text/plain' });
            var url = window.URL.createObjectURL(blob);
            
            var a = document.createElement('a');
            a.href = url;
            a.download = $scope.fileName.replace(/\.(doc|docx)$/i, '_requirements.txt');
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        };
    }]);

// Add drag and drop directives
angular.module('frInitiativeApp')
    .directive('ngDrop', function() {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                element.on('drop', function(event) {
                    scope.$eval(attrs.ngDrop, {$event: event.originalEvent});
                });
            }
        };
    })
    .directive('ngDragEnter', function() {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                element.on('dragenter', function(event) {
                    scope.$eval(attrs.ngDragEnter, {$event: event.originalEvent});
                });
            }
        };
    })
    .directive('ngDragLeave', function() {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                element.on('dragleave', function(event) {
                    scope.$eval(attrs.ngDragLeave, {$event: event.originalEvent});
                });
            }
        };
    })
    .directive('ngDragOver', function() {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                element.on('dragover', function(event) {
                    scope.$eval(attrs.ngDragOver, {$event: event.originalEvent});
                });
            }
        };
    })
    .directive('ngFileSelect', function() {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                element.on('change', function(event) {
                    var files = event.target.files;
                    scope.$eval(attrs.ngFileSelect, {$files: files});
                    scope.$apply();
                });
            }
        };
    });
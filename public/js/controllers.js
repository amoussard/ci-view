var ciViewApp = angular.module('ciViewApp', ['masonry']);

ciViewApp.factory('socket', function($rootScope) {
    var socket = io.connect();
	return {
		on: function(eventName, callback) {
			socket.on(eventName, function() {
				var args = arguments;
				$rootScope.$apply(function() {
					callback.apply(socket, args);
				});
			});
		},
		emit: function(eventName, data, callback) {
			socket.emit(eventName, data, function() {
				var args = arguments;
				$rootScope.$apply(function() {
					if(callback) {
						callback.apply(socket, args);
					}
				});
			});
		}
	};
});

var statusToClasses = {
    'success': 'success',
    'fixed': 'warning',
    'failed': 'danger',
    'canceled': 'info',
    'timedout': 'info'
}

ciViewApp.controller('ProjectListCtrl', function ($scope, socket) {
    $scope.projects = {};

    socket.on('new_project', function(project) {
        if ($scope.projects[project.name]) {
            if (!$scope.projects[project.name]['branches'][project.branch]) {
                $scope.projects[project.name]['branches'][project.branch] = {
                    name: project.branch
                };
            }

            $scope.projects[project.name]['branches'][project.branch]['status'] = statusToClasses[project.status];
        } else {
            $scope.projects[project.name] = {
                name: project.name,
                branches: {}
            };

            $scope.projects[project.name]['branches'][project.branch] = {
                name: decodeURIComponent(project.branch),
                status: statusToClasses[project.status]
            };
        }
    });
});

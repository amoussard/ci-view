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

    var alert = false;

    socket.on('new_project', function(project) {
        if (project.status === 'failed') {
            $scope.receiveError();
        }

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
                name: project.branch,
                status: statusToClasses[project.status]
            };
        }
    });

    $scope.receiveError = function() {
        var alertSound = document.getElementById('alertSound');
        var bombVideo = document.getElementById('bombVideo');
        var alertImage = document.getElementById('alertImage');
        var overlay = document.getElementById('overlay');

        if (!alert) {
            alert = true;

            bombVideo.style.display = 'block';
            overlay.style.display = 'block';
            bombVideo.ontimeupdate = function() {
                if (bombVideo.currentTime > 6) {
                    alertSound.play();
                }
            };
            bombVideo.onended = function() {
                bombVideo.style.display = 'none';
                overlay.style.display = 'none';
                alertImage.style.display = 'block';

                setTimeout(function() {
                    alertSound.pause();
                    alertSound.currentTime = 0;
                    bombVideo.currentTime = 0;
                    alertImage.style.display = 'none';
                    alert = false;
                }, 30000);
            };
            bombVideo.play();
        }
    }
});

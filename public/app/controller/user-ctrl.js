angular.module('technicalSalon')
    .constant('authUrl', '/login')
    .controller('registerCtrl', function ($scope, $location, UserService) {

        $scope.user = {};

        $scope.register = function (u) {
            var userService = new UserService(u);
            userService.$save(function (data) {
                if (data.result == 'error') {
                    $scope.$emit(data.result, data.message);
                } else {
                    $scope.$emit(data.result, data.message);
                    $location.path('/index');
                }

            }, function (err) {
                console.log(err);
            });
        }

    })
    .controller('loginCtrl', function ($scope, $http, $location, authUrl) {
        $scope.user = {};
        $scope.login = function (u) {
            console.log('do login');
            $http.post(authUrl, u).success(function (data) {
                if (data.result == 'error') {
                    $scope.$emit(data.result, data.message);
                } else {
                    $scope.$emit(data.result, data.message);
                    $location.path('/index');
                }
            }).error(function (err) {
                console.log(err)
            });
        }
    })

    .controller("userManageCtrl", function ($scope, $http, UserService) {
        $scope.users = UserService.query();
    });


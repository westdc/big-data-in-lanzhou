angular.module('technicalSalon')
    .controller('userCtrl', function ($scope, $location, UserService) {

        $scope.user = {};

        $scope.register = function(u) {
            var userService = new UserService(u);
            userService.$save(function(data) {
                if(data.result == 'error') {
                    $scope.$emit(data.result,data.message);
                } else {
                    $scope.$emit(data.result,data.message);
                    $location.path('/index');
                }

            }, function(err) {
                console.log(err);
            });
        }

    });
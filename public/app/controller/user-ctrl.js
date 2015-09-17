angular.module('technicalSalon')
    .controller('userCtrl', function ($scope, $location, UserService) {

        $scope.user = {};

        $scope.register = function(u) {
            console.log(u);
            var userService = new UserService(u);
            userService.$save(function(user) {
                console.log(user);
                $location.path('/index');
                $scope.$emit('success','hehe');
            }, function(err) {
                console.log(err);
                $scope.$emit('error',err);
            });
        }

    });
angular.module('technicalSalon')
    .controller('userCtrl', function ($scope, $location, UserService) {
        $scope.register = function(u) {
            user.$save(function(user) {
                console.log(user);
                $location.path('/index');
                $scope.$emit('success','hehe');
            }, function(err) {
                console.log(err);
                $scope.$emit('error',err);
            });
        }

    });
angular.module("technicalSalon")
    .controller("indicatorsCtrl", function ($scope) {
        $scope.indicator = false;
        $scope.style = "";
        $scope.user = null;

        $scope.$on('success', function (event, message) {
            $scope.indicator = true;
            $scope.style = "alert-success";
            $scope.message = message;
        });

        $scope.$on('info', function (event, message) {
            $scope.indicator = true;
            $scope.style = "alert-info";
            $scope.message = message;
        });

        $scope.$on('warning', function (event, message) {
            $scope.indicator = true;
            $scope.style = "alert-warning";
            $scope.message = message;
        });

        $scope.$on('error', function (event, message) {
            console.log(event);
            $scope.indicator = true;
            $scope.style = "alert-danger";
            $scope.message = message;
        });


        $scope.erase = function () {
            $scope.indicator = false;
        };

        $scope.getClass = function () {
            return $scope.style + " bounceInDown bounceOutDown";
        };

        $scope.$on('login',function(event, user) {
            $scope.user = user;
        });

        $scope.$on('logout', function(event) {
           $scope.user = null;
        });

    })
    .controller("navCtrl", function ($scope, $location) {
        $scope.getClass = function (path) {
            if ($location.path().substr(0,path.length)== path) {
                return "active"
            } else {
                return ""
            }
        }
    });
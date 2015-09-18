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

    .controller("userManageCtrl", function ($scope, $http, UserService, $modal) {

        $scope.toggle = function (u) {
            u.status = u.status == 1 ? 0 : 1;
            $http.post('/user/toggle', u)
                .success(function(data) {
                    if (data.result == 'error') {
                        $scope.$emit(data.result, data.message);
                    } else {
                        $scope.$emit(data.result, data.message);
                    }
                })
                .error(function(err) {
                    console.log(err);
                });
        };

        $scope.currentPage = 1;
        $scope.totalItems = 0;
        $scope.items = [];

        $http.get('/count/user').success(function (data) {
            $scope.totalItems = data.totalItems;
            $scope.items = UserService.query({skip: ($scope.currentPage - 1) * 10, pageSize: 10});
        });

        $scope.pageChanged = function (page) {
            $scope.items = UserService.query({skip: ($scope.currentPage - 1) * 10, pageSize: 10});
        };
            $scope.items = [];
            $scope.open = function (modalCtrl, size) {
                var modalInstance = $modal.open({
                    templateUrl: 'app/partials/admin/template/alert-delete.html',
                    controller: modalCtrl,
                    size: size
                });
            }
        })

    .controller("alertDeleteCtrl", function ($scope, $modalInstance) {
        $scope.ok = function () {
            $modalInstance.close();
        };
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        }
    });



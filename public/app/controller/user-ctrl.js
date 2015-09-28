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

    .controller("userManageCtrl", function ($scope, $http, $modal,$timeout, UserService) {

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
        var timeout;
        $scope.$watch('search',function(keyword) {
            timeout = $timeout(function() {
                $http.get('/count/user?keyword='+keyword).success(function(data) {
                    $scope.totalItems = data.totalItems;
                    $scope.items = UserService.query({keyword: keyword, skip: ($scope.currentPage - 1) * 10, pageSize: 10})
                });
            }, 350);
        });


        $scope.pageChanged = function (page) {
            $scope.items = UserService.query({skip: ($scope.currentPage - 1) * 10, pageSize: 10});
        };
        $scope.openDeleteDialog = function(user, modalCtrl, size) {
            var modalInstance = $modal.open({
                templateUrl: 'app/partials/admin/template/alert-delete.html',
                controller: modalCtrl,
                size: size,
                resolve:{
                    id:function() {
                        return user._id
                    }
                }
            });
            modalInstance.result.then(function(id) {
                $http.post('/user/remove',{id:id}).success(function(data) {
                    console.log(data);
                    if (data.result == 'error') {
                        $scope.$emit(data.result, data.message);
                    } else {
                        $scope.$emit(data.result, data.message);
                        $scope.items.splice($scope.items.indexOf(user), 1);
                    }
                }).error(function(err) {
                    console.log(err);
                });
            }, function() {

            })
        }
    })
    .controller('deleteUserCtrl',function($scope,$modalInstance,id){
        $scope.submit = function () {
            $modalInstance.close(id);
            console.log(id)
        };
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        }
    });

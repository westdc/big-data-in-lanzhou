/**
 * Created by paul on 15-8-12.
 */

angular.module("technicalSalon")
    .controller("lastNewsCtrl", function ($scope, $http,$modal, NewsService) {
        $scope.news = NewsService.last({num: 5});
    })
    .controller("newsCtrl", function ($scope, $http,$modal,NewsService) {
        $scope.currentPage = 1;
        $scope.totalItems = 0;
        $scope.items = [];

        $http.get('/count/news').success(function (data) {
            $scope.totalItems = data.totalItems;
            $scope.items = NewsService.query({skip: ($scope.currentPage - 1) * 10, pageSize: 10});
        });

        $scope.pageChanged = function (page) {
            $scope.items = NewsService.query({skip: ($scope.currentPage - 1) * 10, pageSize: 10});
        };
        $scope.openDeleteNews = function(message, modalCtrl, size) {
            var modalInstance = $modal.open({
                templateUrl: 'app/partials/admin/template/alert-delete.html',
                controller: modalCtrl,
                size: size,
                resolve:{
                    id:function() {
                        return message._id
                    }
                }
            });

            modalInstance.result.then(function(id) {
                $http.post('/news/remove',{id:id}).success(function(data) {
                    if (data.result == 'error') {
                        $scope.$emit(data.result, data.message);
                    } else {
                        $scope.$emit(data.result, data.message);
                        $scope.items.splice($scope.items.indexOf(message), 1);
                    }
                }).error(function(err) {
                    console.log(err);
                });
            }, function() {

            })
        }


    })
    .controller('deleteNewsCtrl', function($scope, $modalInstance, id) {
        $scope.submit = function () {
            $modalInstance.close(id);
        };
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        }
    })
    .controller("newsDetailCtrl", function ($scope, $routeParams, $http, NewsService) {
        var id = $routeParams.id;
        $scope.n = NewsService.get({id: id});

    });

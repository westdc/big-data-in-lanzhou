/**
 * Created by nober on 15-9-22.
 */
/**
 * Created by paul on 15-8-12.
 */

angular.module("technicalSalon")
    .controller("lastNewsCtrl", function ($scope, $http, $modal, NewsService) {
        $scope.news = NewsService.last({num: 5});
    })
    .controller("newsCtrl", function ($scope, $http, $modal, NewsService) {
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
    })
    .controller("newsDetailCtrl", function ($scope, $routeParams, $http, NewsService) {
        var id = $routeParams.id;
        $scope.n = NewsService.get({id: id});
    })
    .controller("newsManagerCtrl", function ($scope, $http, $modal,$timeout, NewsService) {
        $scope.news = [];
        $scope.currentPage = 1;
        $scope.totalItems = 0;
        $scope.items = [];

        $http.get('/count/news').success(function (data) {
            $scope.totalItems = data.totalItems;
            $scope.items = NewsService.query({skip: ($scope.currentPage - 1) * 10, pageSize: 10});

            var timeout;
            $scope.$watch('search',function(keyword) {
                if(timeout){
                    $timeout.cancel(timeout);
                }
                timeout = $timeout(function() {
                    $http.get('/count/news?keyword='+keyword).success(function(data) {
                        $scope.totalItems = data.totalItems;
                        $scope.items = NewsService.query({keyword: keyword, skip: ($scope.currentPage - 1) * 10, pageSize: 10})
                    });
                }, 350);
            });
        });

        $scope.pageChanged = function (page) {
            $scope.items = NewsService.query({skip: ($scope.currentPage - 1) * 10, pageSize: 10});
        };
        $scope.openAddDialog = function (modalCtrl, size) {
            var modalInstance = $modal.open({
                templateUrl: 'app/partials/admin/template/add-news.html',
                controller: modalCtrl,
                size: size
            });
            modalInstance.result.then(function (news) {
                var newsService = new NewsService(news);
                newsService.$save(function (data) {
                    if (data.result == 'error') {
                        $scope.$emit(data.result, data.message);
                    } else {
                        $scope.$emit(data.result, data.message);
                        $scope.items.splice(0, 0, news);
                    }
                }, function (err) {
                    console.log(err);
                });
            }, function () {
            });
        };
        $scope.openDeleteDialog = function (news, modalCtrl, size) {
            var modalInstance = $modal.open({
                templateUrl: 'app/partials/admin/template/alert-delete.html',
                controller: modalCtrl,
                size: size,
                resolve: {
                    id: function () {
                        return news._id
                    }
                }
            });
            modalInstance.result.then(function (id) {
                $http.post('/news/remove', {id: id}).success(function (data) {
                    if (data.result == 'error') {
                        $scope.$emit(data.result, data.message);
                    } else {
                        $scope.$emit(data.result, data.message);
                        $scope.items.splice($scope.items.indexOf(news), 1);
                    }
                }).error(function (err) {
                    console.log(err);
                });
            }, function () {

            })
        };


        $scope.openUpdateDialog = function (news, modalCtrl, size) {
            var modalInstance = $modal.open({
                templateUrl: 'app/partials/admin/template/update-news.html',
                controller: modalCtrl,
                size: size,
                resolve: {
                    news: function () {
                        return news
                    }
                }
            });
            modalInstance.result.then(function (news) {
                $http.post("news/update",{news: news}).success(function (data) {
                    if (data.result == 'error') {
                        $scope.$emit(data.result, data.message);
                    } else {
                        $scope.$emit(data.result, data.message);
                    }
                }).error(function (err) {
                    console.log(err)
                })
            },function(){
            })
        }
    })
    .controller("submitNewsCtrl", function ($scope, $modalInstance) {

        $scope.news = {};
        $scope.submit = function (news) {
            $modalInstance.close(news);
        };
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        }
    })
    .controller('deleteNewsCtrl', function ($scope, $modalInstance, id) {
        $scope.submit = function () {
            $modalInstance.close(id);
        };
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        }
    })
    .controller("updateNewsCtrl", function ($scope, $modalInstance, news) {

        $scope.news =news;
        $scope.submit = function () {
            $modalInstance.close($scope.news);
        };
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        }
    })
    .controller('searchCtrl',function($scope,$http){
       $http({

       })
    });


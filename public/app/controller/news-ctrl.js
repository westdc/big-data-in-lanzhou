/**
 * Created by paul on 15-8-12.
 */

angular.module("technicalSalon")
    .controller("lastNewsCtrl", function ($scope, $http, NewsService) {
        $scope.news = NewsService.last({num: 5});
    })
    .controller("newsCtrl", function ($scope, $http, NewsService) {
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
    });
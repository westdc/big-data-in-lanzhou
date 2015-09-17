/**
 * Created by paul on 15-8-12.
 */

angular.module("technicalSalon")
    .controller("lastNewsCtrl",function($scope, NewsService) {
        $scope.news = NewsService.last({num:5});
    })
    .controller("newsCtrl",function($scope,$http,NewsService) {
        $scope.totalItems = 64;
        $scope.currentPage = 1;

        $scope.setPage = function (pageNo) {
            $scope.currentPage = pageNo;
        };

        $scope.pageChanged = function() {
            console.log('Page changed to: ' + $scope.currentPage);
        };
        $scope.news = NewsService.query();
    })
    .controller("newsDetailCtrl",function($scope, $routeParams, $http, NewsService){
        var id=$routeParams.id;
        $scope.n = NewsService.get({id:id});
    });

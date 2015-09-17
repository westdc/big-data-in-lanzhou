/**
 * Created by paul on 15-8-12.
 */

angular.module("technicalSalon")
    .controller("lastNewsCtrl",function($scope, NewsService) {
        $scope.news = NewsService.last({num:5});
    })
    .controller("newsCtrl",function($scope,$http,NewsService) {
        $scope.news = NewsService.query();
    })
    .controller("newsDetailCtrl",function($scope, $routeParams, $http, NewsService){
        var id=$routeParams.id;
        $scope.n = NewsService.get({id:id});
            //$http.get(newsUrl + id)
            //.success(function(data) {
            //    $scope.n = data;
            //})
            //.error(function(error) {
            //    $scope.n = error;
            //});
    });

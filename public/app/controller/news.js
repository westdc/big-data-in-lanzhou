/**
 * Created by paul on 15-8-12.
 */

angular.module("technicalSalon")
    .constant("lastNewsUrl", "/news/last")
    .constant("newsUrl","/news")
    .controller("newsCtrl",function($scope,$http,lastNewsUrl) {
        $scope.news = {};
        $http.get(lastNewsUrl)
            .success(function(data) {
                $scope.news = data;
            })
            .error(function(error) {
                $scope.error = error;
            });


    })
    .controller("newsDetailCtrl",function($scope, $routeParams, $http, newsUrl){
         var id=$routeParams.id;
        $http.get(newsUrl, {id:id})
            .success(function(data) {
                $scope.news = data;
            })
            .error(function(error) {
                $scope.error = error;
            });


    });

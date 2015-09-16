/**
 * Created by paul on 15-8-12.
 */

angular.module("technicalSalon")
    .constant("dataUrl", "/news/last")
    .controller("newsCtrl",function($scope,$http,dataUrl) {
        $scope.news = {};
        $http.get(dataUrl)
            .success(function(data) {
                $scope.news = data;
            })
            .error(function(error) {
                $scope.error = error;
            });


    });

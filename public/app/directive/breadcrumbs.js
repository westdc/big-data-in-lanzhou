/**
 * Created by paul on 15-7-30.
 */
angular.module("1m")
    .directive("9mBreadcrumbs",function() {
        return {
            link:function(scope, element, attrs) {
            },
            restrict: "A",
            templateUrl:"app/partials/template/breadcrumbs.html",
            controller:"breadCrumbsCtrl",
            scope: {
                pathFn:"&path"
            }
        }
});

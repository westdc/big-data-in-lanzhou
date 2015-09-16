angular.module('technicalSalon').controller('pageCtrl', function($scope){

    $scope.paginationConf = {
        currentPage: 1,
        totalItems:800,
        itemsPerPage: 15,
        pagesLength: 15,
        perPageOptions: [10, 20, 30, 40, 50],
        /*  rememberPerPage: 'perPageItems',*/
        onChange: function(){

        }
    };
})
angular.module('1m').controller('testController', function($scope){
    /**
     * I'm not good at English, wish you you catch what I said And help me improve my English.
     *
     * A lightweight and useful pagination directive
     * conf is a object, it has attributes like below:
     *
     * currentPage: Current page number, default 1
     * totalItems: Total number of items in all pages
     * itemsPerPage:  number of items per page, default 15
     * onChange: when the pagination is change, it will excute the function.
     *
     * pagesLength: number for pagination size, default 9
     * perPageOptions: defind select how many items in a page, default [10, 15, 20, 30, 50]
     * rememberPerPage: use to remember how many items in a page select by user.
     *
     */
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
angular.module("technicalSalon")
    .controller("messageCtrl", function ($scope, $http, $modal) {

        $scope.items = [];
        $scope.open = function (modalCtrl, size) {
            var modalInstance = $modal.open({
                templateUrl: 'app/partials/template/message.html',
                controller: modalCtrl,
                size: size
            });

        }
    })
    .controller("submitMessageCtrl", function ($scope, $modalInstance, MessageService) {

        $scope.message = {};

        $scope.submit = function (message) {

            var messageService = new MessageService(message);
            messageService.$save(function (data) {
                if (data.result == 'error') {
                    $scope.$emit(data.result, data.message);
                } else {
                    $scope.$emit(data.result, data.message);
                    $modalInstance.close();
                }

            }, function (err) {
                console.log(err);
            });
        };
        $scope.cancel = function () {
            $scope.message = {};
            $modalInstance.dismiss('cancel');
        }
    })
    .controller('messageManageCtrl', function ($scope, $http, MessageService) {

        $scope.currentPage = 1;
        $scope.totalItems = 0;
        $scope.items = [];

        $http.get('/count/message').success(function (data) {
            $scope.totalItems = data.totalItems;
            $scope.items = MessageService.query({skip: ($scope.currentPage - 1) * 10, pageSize: 10});
        });

        $scope.pageChanged = function (page) {
            $scope.items = MessageService.query({skip: ($scope.currentPage - 1) * 10, pageSize: 10});
        };

    });


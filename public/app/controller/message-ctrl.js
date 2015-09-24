angular.module("technicalSalon")
    .controller("messageCtrl", function ($scope, $http, $modal, MessageService) {
        $scope.items = [];
        $scope.open = function (modalCtrl, size) {
            var modalInstance = $modal.open({
                templateUrl: 'app/partials/template/message.html',
                controller: modalCtrl,
                size: size
            });
            modalInstance.result.then(function (message) {
                var messageService = new MessageService(message);
                messageService.$save(function (data) {
                    if (data.result == 'error') {
                        $scope.$emit(data.result, data.message);
                    } else {
                        $scope.$emit(data.result, data.message);
                    }
                }, function (err) {
                    console.log(err);
                });
            }, function () {

            });
        }
    })
    .controller("submitMessageCtrl", function ($scope, $modalInstance) {

        $scope.message = {};

        $scope.submit = function (message) {
            $modalInstance.close(message);
        };
        $scope.cancel = function () {
            $scope.message = {};
            $modalInstance.dismiss('cancel');
        }
    })
    .controller('messageManageCtrl', function ($scope, $http, $modal, MessageService) {

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

        $scope.openDeleteDialog = function(message, modalCtrl, size) {
            var modalInstance = $modal.open({
                templateUrl: 'app/partials/admin/template/alert-delete.html',
                controller: modalCtrl,
                size: size,
                resolve:{
                    id:function() {
                        return message._id
                    }
                }
            });
            modalInstance.result.then(function(id) {
                $http.post('/message/remove',{id:id}).success(function(data) {
                    if (data.result == 'error') {
                        $scope.$emit(data.result, data.message);
                    } else {
                        $scope.$emit(data.result, data.message);
                        $scope.items.splice($scope.items.indexOf(message), 1);
                    }
                }).error(function(err) {
                   console.log(err);
                });
            }, function() {

            })
        }

    })
    .controller('deleteMessageCtrl', function($scope, $modalInstance, id) {
        $scope.submit = function () {
            $modalInstance.close(id);
        };
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        }
    });


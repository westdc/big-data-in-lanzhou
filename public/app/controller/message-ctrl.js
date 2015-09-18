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
    .controller("submitMessageCtrl", function ($scope, $modalInstance) {
        $scope.ok = function () {
            $modalInstance.close();
        };
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        }
    })

    .controller('messagesCtrl', function ($scope,MessageService) {
        $scope.user = {};

        $scope.messages = function (u) {
            var messageService = new MessageService(u);
                messageService.$save(function (data) {
                if (data.result == 'error') {
                    $scope.$emit(data.result, data.message);
                } else {
                    $scope.$emit(data.result, data.message);
                }
            }, function (err) {
                console.log(err);
            });
        }

    });



angular.module("technicalSalon")
    .controller("messageCtrl",function($scope,$http,$modal) {

        $scope.items = [];
        $scope.open = function(modalCtrl,size) {
            var modalInstance = $modal.open({
                templateUrl: 'app/partials/template/message.html',
                controller: modalCtrl,
                size:size
            });

        }
    })
    .controller("submitMessageCtrl",function($scope,$modalInstance) {
        $scope.ok = function() {
            $modalInstance.close();
        };
        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };
    });
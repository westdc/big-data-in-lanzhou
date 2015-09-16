
angular.module("technicalSalon")
    .constant("schemaUrl", "/schema/index.json")
    .controller("metadataCtrl",function($scope) {
    })
    .controller("metadataToolbarCtrl",function($scope,$http,schemaUrl,$modal) {

        $scope.items = [];
        $scope.open = function(item,modalCtrl,size) {
            var modalInstance = $modal.open({
                templateUrl: 'app/partials/tamplate/messageBoard.html',
                controller: modalCtrl,
                size:size
            });

            console.log(item.id + ":" + item.name);
        }
    })
    .controller("editorCtrl",function($scope,$modalInstance) {
        $scope.ok = function() {
            $modalInstance.close();
        };
        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };
    })

    .controller('virtualCtrl', function($scope, $http) {
        $http.get("app/virtual/virtual.json")
            .success(function(response){$scope.poje = response.records;});
    })
    .controller('deleteCtrl',function($scope){

        $scope.delete = function(poje) {
            $scope.records.splice($scope.records.indexOf(poje), 1);
        }});
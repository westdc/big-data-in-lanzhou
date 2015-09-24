/**
 * Created by nober on 15-9-24.
 */
angular.modal('technicalSalon')
    .directive("userSearchDirective",function(){
        return{
            restrict:"AE",
            template:"<input class='input-sm' ng-model='search'>",
            replace:true
        }
    })
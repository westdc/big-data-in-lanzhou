/**
 * Created by nober on 15-9-18.
 */
angular.module('technicalSalon')
    .factory('MessageService',function($resource) {
    return $resource('/message/:id');
});
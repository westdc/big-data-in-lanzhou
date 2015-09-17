/**
 * Created by paul on 15-9-17.
 */

angular.module('technicalSalon')
    .factory('NewsService',function($resource) {
        return $resource('/news/:id', {}, {
            last: {method:'GET', params:{last: true}, isArray:true}
        });
    });
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([ 'module', '../../javascripts/angular.main' ], function (module, angular) {
            module.exports = factory(angular);
        });
    } else if (typeof module === 'object') {
        module.exports = factory(require('angular'));
    } else {
        if (!root.mp) {
            root.mp = {};
        }

        root.mp.escAction = factory(root.angular);
    }
}(this, function (angular) {
    'use strict';

    return angular.module('mp.escAction', []).directive('escAction', function () {

        return {
            restrict: 'A',

            link: {
                pre: function ($scope, element, $attr) {
                    var escExpr = $attr.escAction;

                    element.bind('keyup', function (event) {
                        console.log(event.which);
                        if (event.which === 27) { // Esc
                            $scope.$apply(function () {
                                $scope.$eval(escExpr);
                            });
                            event.preventDefault();
                        }
                    });
                }
            }
        };
    });
}));

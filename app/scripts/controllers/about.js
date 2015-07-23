'use strict';

/**
 * @ngdoc function
 * @name thinglinxApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the thinglinxApp
 */
angular.module('thinglinxApp')
  .controller('AboutCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });

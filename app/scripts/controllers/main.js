'use strict';

/**
 * @ngdoc function
 * @name thinglinxApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the thinglinxApp
 */
angular.module('thinglinxApp')
  .controller('MainCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });

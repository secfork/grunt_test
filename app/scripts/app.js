/* global localStorage */
define([
        'jQuery', 
        'angular',
        'lodash',
        
        'angular-ui',
        'angular-ui-router',
        'angular-translate',
        'angular-resource',

 

], function(angular) {
    'use strict';
 
 

    var app = angular.module('app', configFn);

   
    return app;
});
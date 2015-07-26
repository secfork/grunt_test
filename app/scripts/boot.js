/**
 * This is only used in production to bootstrap the app.
 *
 * This file will be required in the minified file. It then requires 'app' thus executing all needed angular code before calling angular.bootstrap.
 */
define(['angular' , 
        'app',
 
        'jQuery', 
        'lodash',
        
        'angular-ui',
        'angular-ui-router',
        'angular-translate',
        'angular-resource',
        
        'angular-animate',
        'angular-cookies',



        'ngStorage',
        'ui-jq',
        'ui-load',
        'ui-validate'  ,




   ], function(angular) {

    'use strict';  
    console.log("boot" , angular);
  
    return  angular.bootstrap(document, ['app']);
});
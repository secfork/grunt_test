require.config({
    baseUrl: './',
    paths: {
        'jQuery': 'vendor/jquery/jquery.min', 
        'angular': 'vendor/angular/angular.min',
        'lodash': 'vendor/lodash/lodash.min',
        
        'angular-ui': 'vendor/angular-bootstrap/ui-bootstrap-tpls.min',
        'angular-ui-router': 'vendor/angular-ui-router/release/angular-ui-router.min',
        'angular-translate':'vendor/angular-translate/angular-translate.min',
        'angular-resource':'vendor/angular-resource/angular-resource.min', 

        'angular-animate':'vendor/angular-animate/angular-animate.min',
        'angular-cookies':'vendor/angular-cookies/angular-cookies.min',



        'ngStorage':'vendor/ngStorage.min',
        'ui-jq':'vendor/ui-jq',
        'ui-load':'vendor/ui-load',
        'ui-validate':'vendor/ui-validate'

       


      },
    shim: {
        'angular': { exports: 'angular', deps: ['jQuery'] }, 

        'angular-ui': { deps: ['angular']},
        'angular-ui-router': { deps: ['angular']},
        'angular-translate': { deps: ['angular']},
        'angular-resource': { deps: ['angular']},  
        'angular-animate': { deps: ['angular']}, 
        'angular-cookies': { deps: ['angular']}, 

 

        // 'ngStorage': { exports: 'ngStorage',  deps: ['angular'] }, 
        // 'ui-jq': { exports: 'ui-jq', deps: ['angular']}, 
        // 'ui-load': {exports: 'ui-load', deps: ['angular']}, 
        // 'ui-validate': {exports: 'ui-validate', deps: ['angular']}, 

        'ngStorage': {    deps: ['angular'] }, 
        'ui-jq': {   deps: ['angular']}, 
        'ui-load': {  deps: ['angular']}, 
        'ui-validate': {  deps: ['angular']}, 
 


        'jQuery': { exports: '$' },  
        'lodash': { exports: '_'}
    }
});

require(['scripts/thinglinx']);
require.config({
    baseUrl: './',
    paths: {
        'jQuery': 'vendor/jquery/jquery.min', 
        'angular': 'vendor/angular/angular.min',
        'lodash': 'vendor/lodash/lodash.min',
        
        'angular-ui': 'vendor/angular-bootstrap/ui-bootstrap-tpls.min',
        'angular-ui-router': 'vendor/angular-ui-router/release/angular-ui-router.min',
        'angular-translate':'vendor/angular-translate/angular-translate.min',
        'angular-resource':'vendor/angular-resource/angular-resource.min'
      },
    shim: {
        'angular': { exports: 'angular', deps: ['jQuery'] }, 

        'angular-ui': { deps: ['angular']},
        'angular-ui-router': { deps: ['angular']},
        'angular-translate': { deps: ['angular']},
        'angular-resource': { deps: ['angular']}, 

        'jQuery': { exports: '$' }, 

        'lodash': { exports: '_'}
    }
});

require(['thinglinx']);
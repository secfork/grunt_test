require.config({
    baseUrl: 'vendor',
    paths: {
        'jQuery': 'jquery/jquery.min', 
        'angular': 'angular/angular.min',
        'lodash': 'lodash/lodash.min',
        
        'angular-ui': 'angular-bootstrap/ui-bootstrap-tpls.min',
        'angular-ui-router': 'angular-ui-router/release/angular-ui-router.min',
        'angular-translate':'angular-translate/angular-translate.min',
        'angular-resource':'angular-resource/angular-resource.min'
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
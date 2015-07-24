require.config({
    baseUrl: 'bower_conponents',
    paths: {
        'jQuery': 'jquery/jquery', 
        'angular': 'angular/angular',
        'lodash': 'lodash/lodash',
        
        'angular-ui': 'angular-bootstrap/ui-bootstrap-tpls',
        'angular-ui-router': 'angular-ui-router/release/angular-ui-router',
        'angular-translate':'angular-translate/angular-translate',
        'angular-resource':'angular-resource/angular-resource'
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

var dependencies = ['angular', 'app', 'angular-l10n-de'];
require(dependencies, function(angular) {
    'use strict';
    angular.bootstrap(document, ['app']);
});

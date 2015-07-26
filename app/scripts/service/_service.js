define( [  
	'angular',
	'scripts/service/source',
	'scripts/service/sysconfig',
	'scripts/service/ajaxintercepter',

	'scripts/service/account',
	'scripts/service/map',
	'scripts/service/project',
 
	], function( angular, source , sysconfig , intercepter , account , map , project ){  

		angular.module('app.service', [])
				.service('$source',  source)
				.service('$sys',  sysconfig)
				.service('Interceptor' , intercepter)
				.service('$account',  account )
				.service('$map', map)
				.service('$project',project )
				;

		 	
		 


	})
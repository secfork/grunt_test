 angular.module('app.show.system', [])

.controller('show_system_prop', function($scope ,$source  ,$q, $sys , $filter ){

	$scope.system =  $scope.$$cache[0] ;

	var sysModel = $scope.system.model , 
        td =  $filter("date")( new Date() ,"yyyy-MM-dd") ,
        plot ,
		plot_config  = angular.copy( $sys.plotChartConfig  ) ,
		arr , d ; 


	//初始化页面; 
 	$scope.getArray = function(){
 		arr = [],
 		d = new Date().getTime();  
 		arr[0]=[ d - $scope.op.c_int* $scope.op.pointSize  , undefined ] ; 
 		// arr[$scope.op.pointSize-1] = [ d , undefined ] ;     
 		return arr ; 
 	}


	$scope.op = {   start:"" ,num:50 , 
					start_h :"00:00", 
					end_h:"23:00" ,
					start: td ,
					end:td ,
					ala:"a" , // a: 实时报警; b: 历史报警; 
					pointSize : 60 , // 曲线上的点数; 
					c_int : 1000 , // 实时数据 interval 时间; 
					a_int : 1000   // 实时报警; interva 时间; 
				} ;
 


	// 得到 device ;
	$scope.getDevices = function( sysModel ){
		return	$source.$sysDevice.get( {system_model : sysModel}).$promise;
	}

	//得到 device 下的 tag ;
	$scope.getTags = function( sysModel ){
		return $source.$sysTag.get( { system_model:sysModel } ).$promise ;
	}

	// 得到 device ;
	$scope.loadDevsPromise = $source.$sysDevice.get( {system_model : sysModel}).$promise;
	//得到 tag ;
	$scope.loadTagsPromise = $source.$sysTag.get( { system_model:sysModel } ).$promise ;




 	$scope.loadDevsPromise.then( function( resp ){
 		$scope.devices = resp.ret ;
 		$scope.op.devId  =  resp.ret[0] && resp.ret[0].id ;
 	})

 	$scope.loadTagsPromise.then( function( resp ){
 		$scope.tags = resp.ret ;
 		$scope.op.tagName = resp.ret[0] && resp.ret[0].name ;
 	})

	$q.all([ $scope.loadTagsPromise , $scope.loadDevsPromise]).then( function(){
		$scope.filterTags = function(){
			var reg =  new RegExp("^"+ $scope.op.devId +".*" ,"g" ) ;
			$scope._$tags =   $scope.tags.filter(function( v,i,t){
				console._log(  reg.test(v.connect) , v.connect )
				return  !reg.test(v.connect);
			})
		}

		$scope.filterTags();
	})


	$scope.initFlotChart = function(  _plot_data ){
	 
		_plot_data = _plot_data || { data: $scope.getArray() } ;
		console._log( _plot_data);
		plot =	$.plot("#show_live_data" , [ _plot_data ] ,plot_config );
	}


	


	$scope.hours =  [  "00:00"  ,  "01:00" ,  "02:00" ,  "03:00" ,  "04:00" ,
		 "05:00" , 	 "06:00" ,  "07:00" ,  "08:00" ,  "09:00" ,  "10:00" ,
		  "11:00" , 	 "12:00" ,  "13:00" ,  "14:00",  "15:00",  "16:00" ,
		 "17:00" ,  "18:00",  "19:00" ,  "20:00" ,  "21:00" ,  "22:00" , "23:00"
 	]

 
})


.controller('show_system_current',  function( $scope , $show , $interval , $sys ){

 	var interval ;

	$scope.$on("$destroy" , function(){
		$interval.cancel( interval );
	})
 

 	// 订阅数据; 

	$scope.liveData = function( tagName ){
		$interval.cancel( interval );
		var plot_data = { data:   $scope.getArray()  , label: tagName} ,
			data =  plot_data.data  ;

		interval = $interval( function(){

			$show.live.get(  { uuid: $scope.system.uuid  ,  tag : [tagName ] } , function(resp){
				if(!resp.ret || !resp.ret[0] ){
					console._log(  resp.ret );
					return ; 
					//$interval.cancel( interval);
					//alert("无数据!")
				}

				var d = resp.ret[0] ,  // {0: {pv: 0, src: 1436751068000}}
				    dx = [ d.src , d.pv ]  ;

				if( data.length >= $scope.op.pointSize ){
					data.shift()
				}

				data.push( dx );
				$scope.initFlotChart( plot_data);

			})


		} , $scope.op.c_int );
	}



})

.controller('show_system_history',   function($scope , $show){


	$scope.queryHistory = function(){
		$scope.validForm();

		var d = { },
			op = $scope.op ,
			d1 = new Date(op.start +" "+ op.start_h ).getTime(),
			d2 = new Date(op.end +" "+ op.end_h ).getTime();

		d.uuid = $scope.system.uuid ,
		d.start = d1>d2?d1:d2  ,
		d.end   =  d1>d2?d2:d1 ,
		d.num   =  op.num,
		d.tag  =  op.tagName;

		$show.history.get( d, function( resp ){
			var data = resp.ret[0] ,
				d = [];
			if(!data.length){
				alert("无数据!")
				return;
			}

			$.each( data , function(i,v,t){
				d.push([v.ts, v.pv]);
			})

			$scope.initFlotChart( {data:d, label: op.tagName} ) ;

		});

	}

})

.controller('show_system_alarm',   function( $scope , $show  , $interval ){

	var  interval ; 

	$scope.$on("$destroy", function(){
		$interval.cancel(interval);
	}) ;

	$scope.$watch("op.ala" , function(){
		$scope.alarms = [] ; 
		$interval.cancel( interval );
		interval = null ; 
	})

	$scope.liveAlarm = function(){
		if( interval) {  
			$interval.cancel( interval ) ; 
			interval = null ; 
			return ; 
		}

		interval =  $interval( function(){
						console._log("live alarm " , $interval );
						$show.alarm.get( {uuid: $scope.system.uuid} , function( resp){
							$scope.alarms = resp.ret ; 
						} )  
					},2000)
	}
 

	//$scope.liveAlarm(); 
	$scope.queryAlarm = function(){ 
		var d = { },
			op = $scope.op , 
			d1 = new Date(op.start +" "+ op.start_h ).getTime(),
			d2 = new Date(op.end +" "+ op.end_h ).getTime();

		d.uuid = $scope.system.uuid ,
		d.start = d1>d2?d1:d2  ,
		d.end   =  d1>d2?d2:d1 ;

		console._log(d);
		$show.alarm.save(d ,null, function( resp ){
			$scope.alarms = resp.ret ; 
		})
	}



})

.controller('show_system_map',   function(){

})

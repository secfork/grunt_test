angular.module('app.show.system', [])

.controller('show_system_prop', function($scope, $source, $q, $sys, $filter,$source ,$localStorage ,$timeout) {

	$scope.system = $scope.$$cache[0];

	var sysModel = $scope.system.model,
		//td = $filter("date")(new Date(), "yyyy-MM-dd"),
		plot,
		plot_config = angular.copy($sys.plotChartConfig),
		arr, d  ;

	//初始化页面; 
	$scope.getArray = function() {
		arr = [],
			d = new Date().getTime();
		arr[0] = [d - $scope.op.c_int * $scope.op.pointSize, undefined];
		// arr[$scope.op.pointSize-1] = [ d , undefined ] ;     
		return arr;
	}

	$scope.op = {
		start: "",
		num: 50, 
		end: new Date(),
		start: new Date( new Date() - 86400000),
		ala: "b", // a: 实时报警; b: 历史报警; 
		pointSize: 60, // 曲线上的点数; 
		c_int: 2000, // 实时数据 interval 时间; 
		a_int: 2000 // 实时报警; interva 时间; 
	};
 
	// 得到 sysmodel 下的tags ; 

	$scope.loadTagPromise = $source.$sysTag.get({  system_model: sysModel }).$promise ;

	$scope.loadTagPromise.then( function( resp){
		$scope.tags = resp.ret;
	})
 
	$scope.initFlotChart = function(_plot_data) {
		console._log(_plot_data);

		_plot_data = _plot_data || { 	data: $scope.getArray() };
		 
		plot = $.plot("#show_live_data", [_plot_data], plot_config);
		 
	}



	$scope.openCalendar = function(e, exp) {
		e.preventDefault();
		e.stopPropagation();

		this.$eval(exp);
	};
 
 



})


.controller('show_system_current', function($scope, $show, $interval, $sys,$state , $filter) {

	var interval; 

	//$scope.$popNav($scope.system.name + "()", $state);

	$scope.$on("$destroy", function() {
		$interval.cancel(interval);
	})

	var   names=[] , doms_v , doms_t; 
 

 	$scope.loadTagPromise.then( function( resp){
 		angular.forEach(resp.ret, function(v, i){
 			names.push(v.name);	
 		});
 		console.log(names); 
 	})
 

 
 

	// 订阅数据;   faea 发饿
    $scope.liveData =  function ( need ) {
    	if(!need) return ; 

    	if( !names.length ){  
    	 	return ; 
    	} ;

    	doms_t =  doms_t || $(".current_time"),
    	doms_v =  doms_v || $(".current_val");


		$interval.cancel(interval); 
		interval = $interval(function() {

			$show.live.get({
				uuid: $scope.system.uuid,
				tag:  names
			}, function(resp) { 
				console.log( names);
		 		$.each( resp.ret , function(i,d){ 
		 			t = $filter("date")( d.src , 'yyyy-MM-dd HH:mm');  
		 			doms_v.eq(i).text(d.pv);
		 			doms_t.eq(i).text(t); 
		 		})

			})


		}, $scope.op.c_int );
	}


	$scope.liveWrite= function(t,v){
		//console.log(arguments);  // String system_id , String name ,String value
		if(!t) return ; 
		var d = { system_id : $scope.system.uuid ,
					name: t,
					value: v
					}
		$show.liveWrite.save( d , function( resp){
			console.log( resp );
		})

	}

})

.controller('show_system_history', function($scope, $show) {

	$scope.od = {
		showS: false,
		showE: false
	};

	$scope.queryHistory = function() {
		$scope.validForm();

		if(!$scope.op.his_tag) return ; 

		var d = {},
			op = $scope.op,
			d1 = op.start.getTime(),
			d2 = op.end.getTime();

	   	d.uuid = $scope.system.uuid,
			d.start = d1 < d2 ? d1 : d2,
			d.end = d1 < d2 ? d2 : d1,
			d.num = op.num,
			d.tag = op.his_tag ;


		$show.his.get( d, function(resp) {
			var data = resp.ret[0],
				d = [];
			 

			$.each(data, function(i, v, t) {
				d.push([v.ts, v.pv]);
			})

			$scope.initFlotChart({
				data: d,
				label: op.his_tag
			});

		});

	}

})

.controller('show_system_alarm', function($scope, $show, $interval,$modal) {

	var interval;

	$scope.$on("$destroy", function() {
		$interval.cancel(interval);
	});

	$scope.$watch("op.ala", function() {
		$scope.alarms = [];

		$interval.cancel(interval); 
		interval = null;
	})

	$scope.liveAlarm = function() {
		if (interval) {
			$interval.cancel(interval);
			interval = null;
			return;
		}

		interval = $interval(function() {
			console._log("live alarm ", $interval);
			$show.alarm.get({
				uuid: $scope.system.uuid
			}, function(resp) {
				$scope.alarms = resp.ret;
			})
		}, 2000)
	}


	//$scope.liveAlarm(); 
	$scope.queryAlarm = function() {
		var d = {},
			op = $scope.op,
			d1 = op.start.getTime(),
			d2 = op.end.getTime();

		d.uuid = $scope.system.uuid,
			d.start = d1 < d2 ? d1 : d2,
			d.end = d1 < d2 ? d2 : d1;

		console._log(d);
		$show.alarm.save(d, null, function(resp) {
			$scope.alarms = resp.ret;
		})
	}
 
	var S = $scope ;
	$scope.alarmMsg = function(a){
		$modal.open({
			templateUrl:"athena/views/show/alarm_msg.html" ,
			controller:function( $scope ,$modalInstance ){
				$scope.__proto__ = S ; 
				$scope.$modalInstance = $modalInstance;
				$scope.done = $scope.cancel;
				$scope.alarm = a ; 
			}
		})
	}

})

.controller('show_system_map', function() {

}).controller('datepicker', function($scope) {
	$scope.today = function() {
		$scope.dt = new Date();
	};
	$scope.today();

	$scope.clear = function() {
		$scope.dt = null;
	};

	// Disable weekend selection
	$scope.disabled = function(date, mode) {
		return (mode === 'day' && (date.getDay() === 0 || date.getDay() === 6));
	};

	$scope.toggleMin = function() {
		$scope.minDate = $scope.minDate ? null : new Date();
	};
	$scope.toggleMin();

	$scope.open = function($event) {
		$event.preventDefault();
		$event.stopPropagation();

		$scope.opened = true;
	};

	$scope.dateOptions = {
		formatYear: 'yyyy',
		startingDay: 1,
		class: 'datepicker'
	};

	$scope.initDate = new Date('2016-15-20');
	$scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
	// $scope.format = $scope.formats[1];
})
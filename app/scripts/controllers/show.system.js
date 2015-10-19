angular.module('app.show.system', [])

.controller("show_alarm", function($scope, $state, $source, $show, $sys, $q, $filter) {


    $scope.$moduleNav("报警", $state);

    $scope.openCalendar = function(e, exp) {
        e.preventDefault();
        e.stopPropagation();
        this.$eval(exp);
    };

    // 先加载 regions ; 
    $source.$region.query({
        currentPage: 1
    }, function(resp) {
        $scope.regions = resp.data;
    })

    // 按需加载  system ; 
    $scope.loadSys = function() {
        if (!$scope.op.region) {
            $scope.systems = [];
            $scope.od.system = undefined;
            return;
        };
        $source.$system.query({
            currentPage: 1,
            options: "of_proj",
            proj_id: $scope.op.region
        }, function(resp) {
            $scope.systems = resp.data;

        })
    }

    $scope.op = {
        active: false,
        region: undefined
    };
    $scope.od = {
        class_id: 0,
        severity: '0',
        end: new Date(),
        start: new Date(new Date() - 86400000)
    };



    // // 查询全部报警; 
    //  //$scope.liveAlarm();
    //  $scope.queryAlarm = function() {
    //      var d = {},
    //          op = $scope.op,
    //          d1 = op.start.getTime(),
    //          d2 = op.end.getTime();

    //      d.uuid = $scope.system.uuid,
    //          d.start = d1 < d2 ? d1 : d2,
    //          d.end = d1 < d2 ? d2 : d1;

    //      console.log(d);
    //      $show.alarm.save(d, null, function(resp) {
    //          $scope.alarms = resp.ret;
    //      })
    //  }


    $scope.queryAlarm = function() {
        $scope.validForm();
        var od = angular.copy($scope.od),
            d1 = od.start.getTime(),
            d2 = od.end.getTime();

        od.start = d1 < d2 ? d1 : d2;
        od.end = d1 < d2 ? d2 : d1;

        var promise;
        // 活跃报警; 
        if ($scope.op.active) {
            $show.alarm.get(od, function(resp) {
                $scope.alarms = resp.ret;
            });
        } else { // 全部报警; 
            $show.alarm.save(od, undefined, function(resp) {
                $scope.alarms = resp.ret;
            });
        }



    }

})



.controller('show_system_prop', function($scope, $state, $source, $q, $sys, $filter) {

    $scope.system = $scope.$$cache[0];

    var sysModel = $scope.system.model,
        //td = $filter("date")(new Date(), "yyyy-MM-dd"),
        arr, d;

    $source.$sysModel.getByPk({
        pk: sysModel
    }, function(resp) {
        $scope.systemModel = resp.ret;
        //$scope.system.network = angular.fromJson( $scope.system.network);
    })


    $scope.op = {
        start: "",
        num: 50,
        end: new Date(),
        start: new Date(new Date() - 86400000),
        ala: "a", // a: 实时报警; b: 历史报警;
        pointSize: 60, // 曲线上的点数;
        c_int: 10000, // 实时数据 interval 时间;
        a_int: 10000, // 实时报警; interva 时间;
        progValue: 0
    };

    // 得到 sysmodel 下的 log tags ;
    // $scope.loadTagPromiseA = $source.$sysTag.get({
    //     system_model: sysModel
    // }).$promise;

    $scope.loadTagPromise = $source.$sysLogTag.get({
        profile: $scope.system.profile
    }).$promise;


    $scope.loadTagPromise.then(function(resp) {
        $scope.tags = resp.ret;
    });



    $scope.openCalendar = function(e, exp) {
        e.preventDefault();
        e.stopPropagation();

        this.$eval(exp);
    };


    $scope.goHis = function(t) {
        $scope.op.his_tag = t.name;
        $state.go('app.show.system_prop.history');
    }

})

.controller('show_system_basic', function($scope, $sys, $show) {
    // 获取是否在线; 

})

.controller('show_system_current', function($scope, $show, $interval, $sys, $state, $filter) {

    var interval;

    //$scope.$popNav($scope.system.name + "()", $state);

    $scope.$on("$destroy", function() {
        $interval.cancel(interval);
    })

    var names = [],
        doms_v, doms_t;


    $scope.loadTagPromise.then(function(resp) {
        angular.forEach(resp.ret, function(v, i) {
            names.push(v.name);
        });
    })



    // 订阅数据;
    $scope.progValue = 0;
    $scope.liveData = function(need) {
        if (!need) return;

        if (!names.length) {
            return;
        };

        doms_t = doms_t || $(".current_time"),
            doms_v = doms_v || $(".current_val");



        $interval.cancel(interval);
        getCurrent();
        interval = $interval(function() {

            $scope.progValue += 1000;
            //@if  append

            console.log($scope.progValue)
                //@endif 
            if ($scope.progValue == $scope.op.c_int) {
                getCurrent();
            }

            if ($scope.progValue > $scope.op.c_int) {
                $scope.progValue = 0;
            }


        }, 1000);
    }



    function getCurrent() {
        $show.live.get({
            uuid: $scope.system.uuid,
            tag: names
        }, function(resp) {

            $.each(resp.ret, function(i, d) {
                if (!d) {
                    d = {
                        src: null,
                        pv: null
                    };
                };
                t = $filter("date")(d.src, 'MM-dd HH:mm:ss');
                doms_v.eq(i).text(d.pv);
                doms_t.eq(i).text(t);
            })

        });
    }



    $scope.liveWrite = function(t, v) {
        //console.log(arguments);  // String system_id , String name ,String value
        if (!t) return;
        // var d = {    system_id : $scope.system.uuid ,
        //          tagname: t.name ,
        //          value: v
        //      };
        var d = {};
        d[t.name] = v;
        $show.liveWrite.save({
            uuid: $scope.system.uuid
        }, d, function(resp) {
            //@if  append

            console.log(resp);
            //@endif 
        })
    }

})

.controller('show_system_history', function($scope, $show, $sys) {

    // $scope.od = {
    //  showS: false,
    //  showE: false
    // };

    $scope.$on("$destroy", function() {
        $scope.op.his_tag = null;
    })


    var polt, plot_config = angular.copy($sys.plotChartConfig);

    $scope.initFlotChart = function(_plot_data) {
        //@if  append

        console.log(_plot_data);
        //@endif 
        if ($scope.op.his_tag) {
            $scope.op.start = new Date(new Date() - 86400000);
            $scope.op.end = new Date();
            $scope.queryHistory();
        } else {
            plot = $.plot("#show_live_data", [{
                data: [],
                label: "未选择点"
            }], plot_config);
        }


    }


    $scope.queryHistory = function() {
        $scope.validForm();

        if (!$scope.op.his_tag) return;

        var d = {},
            op = $scope.op,
            d1 = op.start.getTime(),
            d2 = op.end.getTime();

        d.uuid = $scope.system.uuid,
            d.start = d1 < d2 ? d1 : d2,
            d.end = d1 < d2 ? d2 : d1,
            d.num = op.num,
            d.tag = op.his_tag;


        $show.his.get(d, function(resp) {
            var data = resp.ret[0],
                d = [];


            $.each(data, function(i, v, t) {
                d.push([v.ts, v.pv]);
            })

            plot = $.plot("#show_live_data", [{
                data: d,
                label: op.his_tag
            }], plot_config);

        });

    }

})

.controller('show_system_alarm', function($scope, $show, $interval, $modal , $sys ) {

    // var interval;
    $scope.page = {}; 

    // $scope.$on("$destroy", function() {
    //     $interval.cancel(interval);
    // });

    var od = { uuid: $scope.system.uuid } ; 
    
    $scope.$watch("op.ala", function(n) { 
        // $interval.cancel(interval);
        // interval; 
        //@if  append 
        console.log(n);
        //@endif  

        if (n == 'a') {
            $scope.loadPageData(1);
        }

    });

    // 查询活跃 报警;  未确认的; 
    $scope.getActiveAlarm = function( pageNo) {  // 一般值 interval是, 切换是调用; 
        var  pg = { currentPage: pageNo ,  itemsPerPage : $sys.itemsPerPage  };

        $show.alarm.get( angular.extend(  od, pg ) , function(resp) {
            $scope.page = resp.ret;
            $scope.page = pageNo ;
        })
    }

    $scope.loadPageData = function( pageNo  ){
        if( $scope.op.ala == "a"){ // 活跃报警
            $scope.getActiveAlarm(pageNo); 
        }else{//  全部活跃; 
            $scope.queryAlarm( pageNo);

        } 
    }
 
    // interval

    // $scope.liveAlarm = function() { 
    //     getAlarm(1 );  // 首页 ;
    //     interval = $interval(function() {
    //         getAlarm(1);
    //     }, $scope.op.a_int);
    // }

    // 点击按钮 查询全部报警;  
    $scope.queryAlarm = function( pageNo ) {
        var d = {},
            op = $scope.op,
            d1 = op.start.getTime(),
            d2 = op.end.getTime();

        
            d.start = d1 < d2 ? d1 : d2,
            d.end = d1 < d2 ? d2 : d1;
        //@if  append

        console.log(d);
        //@endif 
        //var  pg = { currentPage: pageNo ,  itemsPerPage : $sys.itemsPerPage  };
        d.uuid = $scope.system.uuid,
        d.currentPage  = pageNo ,
        d.itemsPerPage = $sys.itemsPerPage ;

        $show.alarm.save(d, null, function(resp) {
            $scope.pageNo = resp.ret;
        })
    }

    // alarm 详细信息;
    var S = $scope;
    $scope.alarmMsg = function(a) {
        $modal.open({
            templateUrl: "athena/show/alarm_msg.html",
            controller: function($scope, $modalInstance) {
                $scope.__proto__ = S;
                $scope.$modalInstance = $modalInstance;
                // $scope.done = $scope.cancel;
                $scope.alarm = a;
            }
        })
    }

})

.controller('show_system_map', function($scope, $map) {

    var map;
    $scope.initMap = function() {
        //@if  append

        console.log("initMap");
        //@endif 
        map = $map.initMap($scope, [$scope.system], "station_map", 135, "$stateParams.projname");

    }

})

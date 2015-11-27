angular.module('app.show.system', [])



.controller("show_alarm", function($scope, $state, $source, $show, $sys, $q, $filter, $modal) {

    $scope.$moduleNav("报警", $state);
    var S = $scope;

    $scope.openCalendar = function(e, exp) {
        e.preventDefault();
        e.stopPropagation();
        this.$eval(exp);
    };

    $scope.page = {};

    // 先加载 regions ; 
    $source.$region.query({
        currentPage: 1
    }, function(resp) {
        $scope.regions = resp.data;
    })

    // 按需加载  system ; 
    $scope.loadSys = function() {
        if (!$scope.od.region_id) {
            $scope.systems = [];
            $scope.od.system_id = undefined;
            return;
        };
        $source.$system.query({
            currentPage: 1,
            //  options: "of_proj",
            isactive: 1,
            region_id: $scope.od.region_id
        }, function(resp) {
            $scope.systems = resp.data;

        })
    }

    $scope.op = {
        active: "a"
    };

    $scope.$watch("op.active", function() {
        $scope.page.data = [];
        $scope.page.total = 0;
        $scope.page.currentPage = 0;
    })



    $scope.od = {
        class_id: null, //0,
        severity: null, //'0',
        end: new Date(),
        start: new Date(new Date() - 86400000),
        region_id: undefined,
        system_id: undefined
    };



    // // 查询全部报警;   

    $scope.loadPageData = function(pageNo) {
        if (!pageNo) {
            return;
        }

        $scope.validForm();
        var od = angular.copy($scope.od);

        if (!od.start) {
            angular.alert("请输入起始时间");
            return;
        }
        if (!od.end) {
            angular.alert("请输入结束时间");
            return;
        }

        od.start = od.start.getTime(),
            od.end = od.end.getTime();



        if (od.start > od.end) {
            angular.alert("起始时间不可超前与结束时间");
            return;
        }

        od.itemsPerPage = $sys.itemsPerPage;
        od.currentPage = pageNo;

        // 活跃报警;  
        od.active = $scope.op.active == "a" ? "1" : undefined;

        od.uuid = "query";

        od.offset = (od.currentPage - 1) * $sys.itemsPerPage;
        od.limit = $sys.itemsPerPage;

        od.itemsPerPage = undefined;
        od.currentPage = undefined;


         $scope.showMask = true ;

        $show.alarm.query(od, function(resp) {
            $scope.page.data = resp.data;
            $scope.page.total = resp.total;
            $scope.page.currentPage = pageNo;

            if (!resp.data.length) {
                angular.alert({
                    title: "无报警数据"
                })
            }

            $scope.showMask  = false ; 
        },function(){   $scope.showMask = false;  })

    }



    // alarm 详细信息;

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
 

.controller('show_system_prop', function($scope, $state,  $stateParams, _$system , $source, $q, $sys, $filter) {

    //@if  append
    console.log("show_system_prop");
    //@endif 

    // $scope.system = $scope.$$cache[0]; 
    
    $scope.system =  _$system.ret  ; 
    $scope.tags = $scope.system.tags ;  
 
    
    var sysModel = $scope.system.model,
        //td = $filter("date")(new Date(), "yyyy-MM-dd"),
        arr, d;

    // 加载模型来干什么? 
    //  0: 展示不需要列出系统引用那个模型; 
    //  1: 获得模式来判断是否能下置点数据;  
    $source.$sysModel.getByPk({
        pk: sysModel
    }, function(resp) {
        $scope.systemModel = resp.ret;
        //$scope.system.network = angular.fromJson( $scope.system.network);
    })


    $scope.op = {
        start: "",
        num: 400, // 查询点历史 返回条数;  
        end: new Date(),
        start: new Date(new Date() - 86400000),
        ala: "a", // a: 实时报警; b: 历史报警;
        pointSize: 60, // 曲线上的点数;
        c_int: 10000, // 实时数据 interval 时间;
        a_int: 10000, // 实时报警; interva 时间;
        progValue: 0
    };

    // $scope.openCalendar = function(e, exp) {




    $scope.openCalendar = function(e, exp) {
        e.preventDefault();
        e.stopPropagation();

        this.$eval(exp);
    };


    $scope.goHis = function(t) {
        $scope.op.his_tag = t;
        $state.go('app.show.system_prop.history');
    }
  
    //  var map = new BMap.Map("l-map");      
    // map.centerAndZoom(new BMap.Point(116.404, 39.915), 11);      
    // // 创建地理编码实例      
    if( $scope.system.latitude ){
        var myGeo = new BMap.Geocoder();      
        // // 根据坐标得到地址描述    
        myGeo.getLocation(new BMap.Point( $scope.system.longitude ,  $scope.system.latitude ), function(result){      
            if (result){   
                console.log( result );   
                $scope.$apply( function(){
                    $scope.system.map_address = result.address ;    
                })
            }      
        });

    }

    


})

.controller('show_system_basic', function($scope, $sys, $show, $state) {
    // 获取是否在线; 
    $scope.$popNav($scope.system.name + "", $state);




})

.controller('show_system_current', function($scope, $show, $interval, $sys, $state, $filter,
    $timeout) {

    $scope.$popNav($scope.system.name + "(实时数据)", $state);

    var interval;

    //$scope.$popNav($scope.system.name + "()", $state);

    $scope.$on("$destroy", function() {
        $interval.cancel(interval);
    });

    // 自动刷新   ;
    $scope.auto_r = true;

    var names = [],
        reg;

    $scope.filtTags = [];
    $scope.filterTags = function(name) {
        names = [];
        reg = new RegExp(name);

        $scope.filtTags = $scope.tags.filter(function(v) {
            if (reg.test(v.name)) {
                names.push(v.name);
                return true;
            }
            return false;
        });
        getCurrent();
    };
 
        $scope.filterTags("");

        $scope.$watch("auto_r", function(n) {
            if (n) { // 自动刷新;  
                $scope.liveData();
            } else { // false; 
                // 取消 interval , 但是保存状态( 保持 progvalue ); 
                $interval.cancel(interval);
            }
        })

    



    // 开始订阅数据;
    $scope.progValue = 0;
    $scope.liveData = function() { // need = $last ; 
        $interval.cancel(interval);

        interval = $interval(function() {

            $scope.progValue += 1000;
            //@if  append 
            //@endif 
            if ($scope.progValue == $scope.op.c_int) {
                getCurrent();
            }

            if ($scope.progValue > $scope.op.c_int) {
                $scope.progValue = 0;
            }

        }, 1000);
    }


    // 单次获得 当前数据; 
    var x = {
            src: null,
            pv: null
        },
        t;

    function getCurrent($event) {
        //@if  append 
        console.log(names);
        //@endif 
        var $dom ;
     


        if( names.length ){
            if($event) {
                $dom = $($event.currentTarget);
                $dom.text("刷新中").attr("disabled" , true);
     
            } ;

            $show.live.get({
                uuid: $scope.system.uuid,
                tag: names
            }, function(resp) {
                $.each(resp.ret, function(i, d) {
                    d = d || x;
                    t = $filter("date")(d.src, 'MM-dd HH:mm:ss');
                    $("#_val_" + i).text(d.pv == null ? "" : d.pv);
                    t && $("#_time_" + i).text(t);
                });

                if( $dom ){
                    $dom.text("刷新成功");

                    $timeout( function(){
                        $dom.text("刷新").attr("disabled" , false );
                    },3000);

                }

                 

            } , function(){ 
                if($dom){
                    
                    
                }

                $dom && $dom.text("刷新").attr("disabled" , false );
            })
        }
 
    }

    $scope.getCurrent = getCurrent;


    // 下置数据; 
    $scope.liveWrite = function(t, v, e , s ) {
        //console.log(arguments);  // String system_id , String name ,String value
        if (!t) return;
        var d = {},
            $button = $(e.currentTarget);;
        d[t.name] = v;

        //        jjw
        //        $button.text("下置中...");
        s.showSpinner = true ; 
        $show.liveWrite.save({
            uuid: $scope.system.uuid
        }, d, function(resp) {
            s.showSpinner =  false ; 
            //@if  append
            console.log(resp);
            //@endif 
            //            $button.text("下置成功");

            //            $timeout(function() {
            //                $button.text("下置");
            //            }, 2000)

        }, function() {
            s.showSpinner = false ; 
            //            $button.text("下置失败").toggleClass("btn-danger");
            //            $timeout(function() {
            //                $button.text("下置").toggleClass("btn-danger");
            //            }, 2000)
        })
    }
})

.controller('show_system_history', function($scope, $show, $sys, $state) {

    // $scope.od = { 
    //  showS: false,
    //  showE: false 
    // };

    $scope.$popNav($scope.system.name + "(历史数据)", $state);

    $scope.$on("$destroy", function() {
        $scope.op.his_tag = null;
    })


    var polt, 
        plot_config = angular.copy($sys.plotChartConfig);

    $scope.initFlotChart = function(_plot_data) {
        //@if  append

        console.log(_plot_data);
        //@endif 
        if ($scope.op.his_tag) {
            $scope.op.start = new Date(new Date() - 21600000);
            $scope.op.end = new Date();
            $scope.queryHistory();
        } else {
            plot = $.plot("#show_live_data", [{
                    data: [],
                    label: "未选择点"
                }],
                plot_config
            );
        }
    }


    $scope.queryHistory = function($event) {

        $scope.validForm();
        
         //@if  append
            console.log("查询点历史" , $scope.op.his_tag);
         //@endif 

        if (!$scope.op.his_tag) {
            angular.alert("请选择要查询的点!");
            return;
        }

        var d = {},
            op = $scope.op;
        d.start = op.start.getTime(),
            d.end = op.end.getTime();

        if (d.start > d.end) {
            angular.alert("起始时间不可超前与结束时间");
            return;
        }

        d.uuid = $scope.system.uuid,
            d.num = op.num,
            d.tag = op.his_tag.name;
        d.type = op.his_tag.type;
 
 
        // 历史数据; 
        //  intervali =  ts ,  readRow  = rcv ;   
        
        $scope.showMask = true ;
        $show.his.getArr(d, function(resp) {

            var timekey = (d.end - d.start) > 86400000 ? "ts" : "rcv",
                atTimedata = resp[0].ret[0][0],
                arrData = resp[1].ret[0];

            arrData.unshift(atTimedata);

            var arr = formatFlotData($scope.op.his_tag, arrData, timekey);

            // 解决 无数据时 , 前段时间轴不显示; 

            // arr.unshift([d.start, null]);
            // arr.push([d.end, null]); 
            plot_config.yaxis.tickDecimals = $scope.op.his_tag.type == "Analog"?6:0 ;
             
            plot = $.plot("#show_live_data", [{
                data: arr,
                label: op.his_tag.name

            }], plot_config);
 
            $scope.showMask = false ;
        },function(){   $scope.showMask = false;  });




    }


    //    如果变量数据类型为analog，绘制成趋势曲线
    //    如果变量数据类型为digital，绘制成阶越曲线 (  0 ,1 整型; )
    //     type: "Analog"
    //     type: "Digital" ;
    //     tag  : 点,  dataarr:rest数据; 
    //     timekey : ts|| rcv ; 
    //     timekey 对第一个点无效;  但是第一个点又参与 digital , anglog 画图逻辑; 
    //                    
    function formatFlotData(tag, dataArr, timekey) {
        var df = [],
            val; 

        var d = dataArr.shift();
        if (!d) return df;

        val = d.pv;

        // 第一个点的值 必须为 ts , 更精确点为 od.start ; 
        // df.push([d[timekey], val]);
        df.push( [$scope.op.start , val]);
 
        if (tag.type === "Digital" || tag.type = "digital") {
           
                

            $.each(dataArr, function(i, v) {
                if (val != v.pv ) { 
                    df.push([v[timekey], val]);
                    df.push([v[timekey], v.pv]);
                    val = v.pv;
                }

            });
        } else {
            $.each(dataArr, function(i, v, t) {
                // v.pv !==null &&     
                df.push([v[timekey], v.pv]);
            })
        }

        console.log(df);
        return df;
    }


})

.controller('show_system_alarm', function($scope, $show, $interval, $modal, $sys, $state) {


    $scope.$popNav($scope.system.name + "(报警)", $state);
    // var interval;
    $scope.page = {};

    // $scope.$on("$destroy", function() {
    //     $interval.cancel(interval);
    // });

  

    var od = {
        uuid: $scope.system.uuid
    };

    $scope.$watch("op.ala", function(n) {
        //@if  append 
        console.log(n);
        //@endif  

        if (n == 'a') {
            $scope.loadPageData(1);
        } else {
            $scope.page.data = [];
            $scope.page.total = 0;
            $scope.page.currentPage = 0;
        }

    });

    // 查询活跃 报警;  未确认的; 
    $scope.getActiveAlarm = function(pageNo, $dom) { // 一般值 interval是, 切换是调用; 
        var pg = {
            currentPage: pageNo,
            itemsPerPage: $sys.itemsPerPage
        };

        $scope.showMask = true ;
        $show.alarm.get(angular.extend(od, pg), function(resp) {

            if ($dom) {
                $dom.toggleClass("show");
            }
            $scope.page.data = resp.data;
            $scope.page.total = resp.total;
            $scope.page.currentPage = pageNo;
            if (!resp.data.length) {
                // angular.alert({
                //     title: "无活跃报警数据"
                // })
            };
            $scope.showMask = false ;
        },function(){   $scope.showMask = false;  })
    }

    $scope.loadPageData = function(pageNo, $event) {

        if (!pageNo) {
            return;
        }
        var $dom;


        if ($event) {
            $dom = $($event.currentTarget).find("i");
            $dom.toggleClass("show");

        }


        if ($scope.op.ala == "a") { // 活跃报警
            $scope.getActiveAlarm(pageNo, $dom);
        } else { //  全部活跃; 
            $scope.queryAlarm(pageNo, $dom);
        }
    }


    // 点击按钮 查询全部报警;  
    $scope.queryAlarm = function(pageNo, $dom) {
        var d = {},
            op = $scope.op;
        d.start = op.start.getTime(),
            d.end = op.end.getTime();

        if (d.start > d.end) {
            angular.alert("起始时间不可超前与结束时间!");
            return;
        }

        //@if  append 
        console.log(d);
        //@endif  
        //var  pg = { currentPage: pageNo ,  itemsPerPage : $sys.itemsPerPage  };
        d.uuid = $scope.system.uuid,
            d.currentPage = pageNo,
            d.itemsPerPage = $sys.itemsPerPage;

        $scope.showMask = true ; 
        $show.alarm.save(d, null, function(resp) {
            if ($dom) {
                $dom.toggleClass("show");
            }

            $scope.page.data = resp.data;
            $scope.page.total = resp.total;
            $scope.page.currentPage = pageNo;
            if (!resp.data.length) {
                angular.alert({
                    title: "无报警数据"
                })
            }
            $scope.showMask  = false ; 
        },function(){   $scope.showMask = false;  })
    }

})

.controller('show_system_map', function($scope, $map, $state) {


    $scope.$popNav($scope.system.name + "(地图)", $state);

    var map;
    $scope.initMap = function() {
        //@if  append

        console.log("initMap");
        //@endif 
        map = $map.initMap($scope, [$scope.system], "station_map", 135, "$stateParams.projname");

    }

})

// 激活的采集器  控制器;

// 激活  未激活 公用控制器

angular.module('app.system', [])


    .controller("dastation_ignore_active", function($scope, $state, $stateParams, $source,
        $modal, $q, $map, $sys) {


        //是否为 show 模块;
        $scope.isShowModul = $state.$current.data && $state.$current.data.isShowModul;

        $scope._$projState = $scope.isShowModul ? 'app.show.proj_prop.station' : 'app.proj.prop.station';
        $scope._$mapState = $scope.isShowModul ? 'app.show.system_prop.map' : 'app.station.prop._map';
        $scope._$stationState = $scope.isShowModul ? "app.show.system_prop.basic" : "app.station.prop._basic";


        if ($scope.isShowModul) {
            $scope.$moduleNav("系统", $state);
        } else {
            $scope.$moduleNav($stateParams.isactive == '1' ? "已激活系统" : "未激活系统", $state);
        }
 


        $scope.updataORdel = "del";

        $scope.list_map = "list";
  
        $scope.od = { } ; 
        $scope.page = {};

       // 加载 system , 然后 , 加载 region信息, 同步信息, 在线信息; 
        var loadRegionPromise =   $source.$region.get({ currentPage:1} ).$promise ,
            loadSysModelPromise = $source.$sysModel.get( {currentPage:1}).$promise ; 
         
        $scope.rg_k_v = {} ; 

        var analyzeRegionPromise =  loadRegionPromise.then( function( resp ){
            $scope.regions = resp.data ; 
            $scope.regions.forEach( function( r){
                $scope.rg_k_v[r.id] = r ;   // rg_k_v  在  region.prop - systom中 也要是 该名: rg_k_v;
            }) 
        });    
        loadSysModelPromise.then( function( resp ){
            $scope.sysModels = resp.ret ; 
        })
          

        $scope.reset = function(){
            $scope.od = {};
        }

        $scope.loadPageData = function(pageNo ) { 

            $scope.page.currentPage = pageNo; 
            // 分页加载 系统数据;
            var d = angular.extend({
                currentPage: pageNo, 
                itemsPerPage: $sys.itemsPerPage  
            }, $stateParams , $scope.od );
             
            $source.$system.query(d).$promise.then(function(resp) {

                var sys_ref,
                    promise_A, promise_B, sysState, sta2sync;
 
                sys_ref = {}; 

                resp.data.forEach(function(n, i, a) { 
                    sys_ref[n.uuid] = n ; 
                }) 
                promise_A = {}  //  状态 是否在线, 挂起 ; 
                // $source.$region.getProjNameByIdS(Object.keys(projids)).$promise;

                // 激活的系统;
                var ids = Object.keys(sys_ref);
                if ($stateParams.isactive == '1' && ids.length) {

                    // 在线状态 ; 
                    promise_A = $source.$system.status(   ids ).$promise ; 

                    // proj name ;
                    // 是否要 同步;
                    promise_B = $source.$system.needSync(  ids  ).$promise;

                }

                // 非激活的system; 或者 展示模块;
                // 加载 state , needsysnc ,  拆分 region数据;  ,
                $q.all([promise_A, promise_B , analyzeRegionPromise ]).then(function(resp_B) {

                    sysStatus = resp_B[0] && resp_B[0].ret;
                    sta2sync = resp_B[1] && resp_B[1].ret; //在 未激活,  展示 模块 为 undefind ;
                    
                    // 组装是否需要 同步 ; 
                    $.each(resp.data, function(i, n) {
                        //  不是这个 系统状态(0:未激活,1:活跃,2:挂起)
                        // 而是系统在线在线状态; 
                        n.online = sysStatus && sysStatus[i] && sysStatus[i].online;
                        n.needsync = sta2sync && sta2sync[n.uuid];
                    });

                    angular.extend($scope.page, resp );
 
                    //$scope.page = resp_A ;

                    // 翻页 刷新  地图上的点;
                    if ($scope.list_map == "map") {
                        $map.flushMarkers(map, $scope.page.data);
                    }
                })

            })
        }


        $scope.loadPageData(1);

        var map;
        $scope.initMap = function() {
            //@if append
            console.log("initMap");
            //@endif 
            
            map =    $map.initMap($scope, $scope.page.data, "bdmap", 268, $stateParams.projname);

        }


    })



//添加系统;
.controller("dastation_add",
    function($state, $scope, $stateParams, $source) {
        //@if  append
            console.log("dastation_add");
            // 由系统 转来 无 projid= nudifund ,  由 project 转来有projid ;
            console.log($state, $stateParams);
         //@endif 

        if ($scope.project) {
            $scope.$popNav($scope.project.projName + "(添加系统)", $state);
        } else {
            $scope.$moduleNav("添加系统", $state);
        }


         //var  proj_id =  $scope.$$cache[0];  // 确保 cache 是 project ?? ;

        

 
        $scope.system = {};

        var a =  $scope.$$cache && $scope.$$cache[0] && $scope.$$cache[0].id ; 
        // 加载可操作的 project ;
        $source.$region.query({
            currentPage: 1,
            itemsPerPage: 5000
        }, function(resp) {
            $scope.projects = resp.data;
            $scope.system.region_id = a ? a :(resp.data[0] && resp.data[0].id);
        })



        // 加载 所有 systemModel ;
        $source.$sysModel.get(function(resp) {
            $scope.sysmodels = resp.ret,
                $scope.systemModel = resp.ret[0];
        });

        $scope.$watch("systemModel", function(n, o) {
            if (!n) return;
             //@if append
             
            console.log(" systemModel  change ", n);
             //@endif 
            

            // 加载  profile;
            if (n.mode == 2) {
                delete $scope.system.network;
            }

            $source.$sysProfile.get({
                system_model: n.uuid
            }, function(resp) {
                $scope.profiles = resp.ret;
                $scope.system.profile = resp.ret[0] && resp.ret[0].uuid;
            })

        })



        //$scope.dastation = {timezone:"0"  };
        $scope.dastation = {};

        $scope.cascadeTime = function() {
            $scope.b = $scope.tiemzone[$scope.a];
            $scope.dastation.timezone = $scope.b[0].value;
        };

        // 提交系统
        $scope.commit = function() {
            $scope.validForm();

           // $scope.system.network = angular.toJson($scope.system.network);
            var sys =  angular.extend({
                            model: $scope.systemModel.uuid
                        }, $scope.system);
            $source.$system.save( sys, function(resp) { 
                // alert("创建成功!");  
                sys.uuid = resp.ret ;
                sys.state = 0 ;
                 
                $scope.confirmInvoke( { title:"创建成功,是否去配置系统"} , function( next ){
                    $scope.goto( "app.station.prop._config" ,  sys , sys );
                    next();
                }) 
            }) 
        }



    });

// 激活的采集器  控制器;

// 激活  未激活 公用控制器

angular.module('app.system', [])


.controller("dastation_ignore_active", function($scope, $state, $stateParams, $source,
    $modal, $q, $map, $sys) {

    var  thatScope = $scope ; 

    //是否为 show 模块;
    $scope.isShowModul = $state.$current.data && $state.$current.data.isShowModul;

    $scope._$projState = $scope.isShowModul ? 'app.show.proj_prop.station' : 'app.proj.prop.station';
    $scope._$mapState = $scope.isShowModul ? 'app.show.system_prop.map' : 'app.station.prop._map';
    $scope._$stationState = $scope.isShowModul ? "app.s_system_prop.basic" : "app.m_system_prop._basic";


    $scope.active2del  =  true ;

    if ($scope.isShowModul) {
        $scope.$moduleNav("系统", $state);
    } else {
        $scope.$moduleNav($stateParams.isactive == '1' ? "已激活系统" : "未激活系统", $state);
    }


    $scope.updataORdel = "del";


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
         $scope.loadPageData(1) ;
    }

    $scope.loadPageData = function(pageNo ) { 

        $scope.showMask = true ;

        $scope.page.currentPage = pageNo; 
        // 分页加载 系统数据;
        var d = angular.extend({
            options:"query",
            
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
                promise_B = ! $scope.isShowModul &&  $source.$system.needSync(  ids  ).$promise;

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

                    n.online = sysStatus && sysStatus[i] &&  
                                ( sysStatus[i].daserver? 
                                    sysStatus[i].daserver.logon 
                                    : sysStatus[i].online
                                )

                    n.needsync = sta2sync && sta2sync[n.uuid];
                });

                angular.extend($scope.page, resp );

                //$scope.page = resp_A ;

                // 翻页 刷新  地图上的点;
                if ($scope.lm == "map") {
                    $map.flushMarkers(map, $scope.page.data);
                }

                $scope.showMask = false ;
            },function(){   $scope.showMask = false;  })

        },function(){   $scope.showMask = false;  })
    }


    $scope.loadPageData(1);

    var map;
    $scope.initMap = function() {
        //@if append
        console.log("initMap");
        //@endif 
        
        map =    $map.initMap($scope, $scope.page.data, "bdmap", 268, $stateParams.projname);

    }


    $scope.createSystem = function(){
        $modal.open( {
            templateUrl:"athena/dastation/dastation_add_temp.html",
            controller: function( $scope , $modalInstance ){
                $scope.__proto__ = thatScope ; 
                $scope.$modalInstance = $modalInstance;

                $scope.system = {} ;

                $scope.od = { systemModel: undefined  }; 

                $scope.$watch("od.systemModel", function(n, o) {
                        if (!n) return;
                         //@if append
                         
                        console.log(" systemModel  change ", n);
                         //@endif 
                        

                        // 加载  profile;
                        if (n.mode == 2) {
                            delete $scope.system.network;
                        }

                        $scope.showMask = true ;
                        $source.$sysProfile.get({
                            system_model: n.uuid
                        }, function(resp) {
                            $scope.profiles = resp.ret;
                            $scope.system.profile = resp.ret[0] && resp.ret[0].uuid;
                            $scope.showMask = false ; 
                        },function(){   $scope.showMask = false;  })

                })




                $scope.done = function() {
                    $scope.validForm();

                    $scope.showMask = true ;

                   // $scope.system.network = angular.toJson($scope.system.network);
                    var sys =  angular.extend({
                                    model: $scope.od.systemModel.uuid
                                }, $scope.system);


                    $source.$system.save( sys, function(resp) { 
                        // alert("创建成功!");  
                        sys.uuid = resp.ret ;
                        sys.state = 0 ;

                        $scope.page.data.unshift( sys) ;
                        $scope.cancel();

                        $scope.confirmInvoke(
                            { 
                                title:"配置系统",
                                note:"创建成功,是否去配置该系统?", 
                                todo:"是",
                                undo:"不用了"
                            } , 
                            function( next ){
                                $scope.goto( "app.m_system_prop._config" ,  sys , sys );
                                next();
                            }
                        ) 

                        $scope.showMask= false ;

                    } , function(){
                        $scope.showMask  = false ; 
                    }) 
                }


            }
        })
    }
})



//添加系统;
.controller("dastation_add",
    function($state, $scope, $stateParams, $source , $q ) {
    
 
        //var  proj_id =  $scope.$$cache[0];  // 确保 cache 是 project ?? ;

        
        $scope.showMask = true ;
 
        $scope.system = {};

        var a =  $scope.$$cache && $scope.$$cache[0] && $scope.$$cache[0].id ; 



        // 加载可操作的 project ;
        $q.all([
            $source.$region.query({
                currentPage: 1,
                itemsPerPage: 5000
            }).$promise,

             $source.$sysModel.get().$promise


        ]).then( function( resp ){
            $scope.projects = resp[0].data ; 
            $scope.system.region_id = a ? a :($scope.projects[0] && $scope.projects[0].id);

            $scope.sysmodels = resp[1].ret,
            $scope.systemModel = resp[1].ret[0];

            $scope.showMask = false ; 


        },function(){   $scope.showMask = false;  })
 

        $scope.$watch("systemModel", function(n, o) {
            if (!n) return;
             //@if append
             
            console.log(" systemModel  change ", n);
             //@endif 
            

            // 加载  profile;
            if (n.mode == 2) {
                delete $scope.system.network;
            }

            $scope.showMask = true ;
            $source.$sysProfile.get({
                system_model: n.uuid
            }, function(resp) {
                $scope.profiles = resp.ret;
                $scope.system.profile = resp.ret[0] && resp.ret[0].uuid;
                $scope.showMask = false ; 
            },function(){   $scope.showMask = false;  })

        })
 
        $scope.dastation = {};

        // 提交系统
        $scope.commit = function() {
            $scope.validForm();

            $scope.showMask = true ;

           // $scope.system.network = angular.toJson($scope.system.network);
            var sys =  angular.extend({
                            model: $scope.systemModel.uuid
                        }, $scope.system);
            $source.$system.save( sys, function(resp) { 
                // alert("创建成功!");  
                sys.uuid = resp.ret ;
                sys.state = 0 ;
                 
                $scope.confirmInvoke( { 
                    title:"配置系统",
                    note:"创建成功,是否去配置该系统?", 
                    todo:"是",
                    undo:"不用了"
                    } , function( next ){
                    $scope.goto( "app.station.prop._config" ,  sys , sys );
                    next();
                }) 
                $scope.showMask= false ;
            } , function(){
                $scope.showMask  = false ; 
            }) 
        }

    });

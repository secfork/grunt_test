// 管理-项目-管理; project 

angular.module('app.project', [])

.controller("manage_projs", function($scope, $source, $state, $utils,
    
    $filter, $timeout, $sys, $localStorage) {

    //@if  append

    // 加载 projects ;
    console.log("manage_projs"); // postcode
    //@endif 
    //
     

    //是否为 show 模块;
    $scope.isShowModul = $state.$current.data && $state.$current.data.isShowModul;

    $scope._$nextState = $scope.isShowModul ? 'app.show.proj_prop.station' : 'app.proj.prop.station';

    // if ($scope.isShowModul) {
    //     $scope.$moduleNav("项目", $state);
    // } else {
    //jjw 区域
    $scope.$moduleNav('全部区域', $state);
    // }


    var per = $sys.itemsPerPage;
    $scope.page = {};
    $scope.loadPageData = function(pageNo) {
        $scope.showMask = true ;

        var d = {
            itemsPerPage: per,
            currentPage: pageNo,
            name: $scope.f_projname
        };

        $source.$region.query(d, function(resp) {
            $scope.showMask = false ;
            $scope.page = resp;
            $scope.page.currentPage = pageNo;

        },function(){   $scope.showMask = false;  });
    };

    var region_ids = [];
    $scope.collectRegionId = function(region, $last) {
        region_ids.push(region.id);

        //@if  append
        console.log(region, $last);
        //@endif 


        if ($last) {
            getActiveSum(region_ids);

            !$scope.isShowModul && getUnActiveSum(region_ids);

        }
    }




    function getActiveSum(region_ids) {
        $source.$region.save({
            pk: "sum",
            state: 1
        }, region_ids, function(resp) {
            resp.ret.forEach(function(v, i) {
                $("#act_" + v.region_id).text(v.count);
            })
        })
    }


    function getUnActiveSum(region_ids) {
        $source.$region.save({
            pk: "sum",
            state: 0
        }, region_ids, function(resp) {
            resp.ret.forEach(function(v, i) {
                $("#unact_" + v.region_id).text(v.count);
            })
        })
    }




    $scope.loadPageData(1);


    /*
     * 从 fps 中移除, 从 filterP 中移除;   从 allprojects 中移除;
     * */
    $scope.delProject = function(proj, index) {

        $scope.confirmInvoke({
                title: "删除区域: " + proj.name  ,
                note:"确认要删除该区域吗?"
            },
            function(next) {

                $source.$region.delete({
                    pk: proj.id
                }, function(resp) {

                    $scope.page.data.splice(index, 1);

                    next();
                }, next)
            }
        )
    }


})

// 添加 工程;
.controller("manage_addproj", function($scope, $source, $state, $sys) {
    //@if  append

    console.log('manage_addproj');
    //@endif 
    /*添加区域*/
    $scope.$moduleNav("添加区域", $state);

    $scope.isAdd =true ;
    // 添加 工程

    $scope.commit = function() {
        $scope.validForm();
        $scope.showMask = true ;
        $source.$region.save($scope.proj, function(resp) {
            //resp.ret && $state.go("app.proj.manage");  
            $scope.showMask = false ; 
            angular.alert("添加成功!");
        },function(){   $scope.showMask = false;  })


    }
})

// -------------------- project 属性  ------------------------------------------
.controller("proj_prop", ['$scope', '$state', '$stateParams', function($scope, $state) {
    //@if  append

    console.log("manage_proj_prop");
    //@endif 

    $scope.$appendNav('项目属性', '_project');

    //是否为 show 模块;
    $scope.isShowModul = $state.$current.data && $state.$current.data.isShowModul;

    $scope._$mapState = $scope.isShowModul ? 'app.show.system_prop.map' : 'app.station.prop._map';
    $scope._$stationState = $scope.isShowModul ? "app.show.system_prop.current" : "app.station.prop._basic";


    $scope.project = $scope.$$cache[0];
    //@if  append

    console.log($scope.project);
    //@endif 

}])

// ==========================================================================================

// 加载 工程 采集站 属性; -- 默认
.controller("proj_prop_station", function($scope, $state, $map, $source, $window, $compile, $q, $sys) {
    //@if  append

    console.log("proj_prop_station");
    //@endif 

    $scope.$popNav($scope.project.name + "", $state);

    $scope.updataORdel = "updata";

    $scope.active2del  =  false ; 

    $source.$sysModel.get({
        currentPage: 1
    }).$promise.then(function(resp) {
        $scope.sysModels = resp.ret;
    });



    $scope.page = {};
    $scope.od = {};
    $scope.reset = function() {
        $scope.od = {};
        $scope.loadPageData(1);
    }

    // 加载第一页数据;
    // var d = { currentPage:1, itemsPerPage: $sys.itemsPerPage };

    $scope.rg_k_v = {};
    $scope.rg_k_v[$scope.project.id + ""] = $scope.project;

    $scope.loadPageData = function(pageNo) {
        // 分页加载 采集站数据;
        $scope.page.currentPage = pageNo;
        $scope.showMask = true ;

        var d = angular.extend({
             options:"query",
            region_id: $scope.project.id,
            currentPage: pageNo,
            itemsPerPage: $sys.itemsPerPage,

            isactive: $state.includes('app.show') ? 1 : undefined

        }, $scope.od);

        //  分页 加载 project 下的 system
        $source.$system.query(d).$promise.then(function(resp) {

            var projids, sys_ref,
                promise_A,
                promise_B,
                projnames, sta2sync;

            sys_ref = {};

            resp.data.forEach(function(n, i, a) {
                n.proj_name = $scope.project.name;
                sys_ref[n.uuid] = n;
            })


            // $scope.isShowModul  是 不能控制 同步

            // 需要同步的 system
            var ids = Object.keys(sys_ref);

            if (ids.length) {
                // 在线状态 ; 
                promise_A = $source.$system.status(ids).$promise;
                // 同步 状态; 
                promise_B = !$scope.isShowModul && $source.$system.needSync(ids).$promise;

            }

            $q.all([promise_A, promise_B]).then(function(resp_B) {
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

                angular.extend($scope.page, resp);

                //$scope.page = resp_A ;

                // 翻页 刷新  地图上的点;
                if ($scope.list_map == "map") {
                    $map.flushMarkers(map, $scope.page.data);
                }

                $scope.showMask = false ;
            });

        },function(){   $scope.showMask = false;  });

    }

    var map;
    $scope.initMap = function() {
        //@if  append
        console.log("initMap");

        //@endif  
        map = $map.initMap($scope, $scope.page.data, "bdmap", 175, $scope.project.name);
    }

    // 加载第一页数据;
    // var d = { currentPage:1, itemsPerPage: $sys.pager.itemsPerPage };
    $scope.page = {
        currentPage: 1
    };

    $scope.loadPageData(1);

    $scope.go2AddDas = function() {
        $state.go("app.proj.prop.addstation");
    };

})

// 加载工程 属性字段;
.controller("proj_prop_attr", function($state, $scope, $source) {

    //@if  append

    console.log("proj_prop_attr");

    console.log($scope);
    //@endif 

    $scope.$popNav($scope.project.name + "(属性)", $state);


    $scope.proj = angular.copy($scope.project);



    $scope.od = {   } ;

    // 得到 区域的 订阅; 
    function getSubOfRegion ( proj_id ) {

        $source.$sub.get( {op:"select" , region: proj_id , user: $scope.user.id }  , function( resp ){
            $scope.od.sub_id = resp.ret[0] && resp.ret[0].id ;
            $scope.od.issubed  = !!$scope.od.sub_id ;

        }) 
    }
    
    getSubOfRegion( $scope.proj.id );

    // 编辑区域的订阅; 
    function createSubOfRegion (){

        var d = {
            filter: { region_id: $scope.proj.id , type:"alarm"},
            sendee :{ user_id: $scope.user.id }
        }

        $source.$sub.save( { op:"create"} , d , function( resp ){
            $scope.od.sub_id =  resp.ret   ;
            $scope.od.issubed = true ;
        })

    }
    
    function delSubOfRegion ( ) {
        $source.$sub.get( { op:"delete" , pk: $scope.od.sub_id  } , function( resp ){
            $scope.od.sub_id =  undefind  ;
        })
    }

    $scope.editSub = function(){
        // change 之后的 值,  逻辑正好反转; 
        ( $scope.od.issubed ? createSubOfRegion : delSubOfRegion )();
    }



    $scope.commit = function() {

        $scope.validForm();

        // delete $scope.project.create_time;

        $source.$region.put({
            pk: $scope.project.id
        }, $scope.proj, function(resp) {
            angular.alert("修改成功!");

            angular.extend($scope.project, $scope.proj);
        })


    };


})

;

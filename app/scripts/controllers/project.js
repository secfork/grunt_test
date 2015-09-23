4 // 管理-项目-管理; project


angular.module('app.project', [])

.controller("manage_projs", function($scope, $source, $state, $utils,
    $filter, $timeout, $sys, $localStorage) {
    // 加载 projects ;
    console._log("manage_projs"); // postcode

    //是否为 show 模块;
    $scope.isShowModul = $state.$current.data && $state.$current.data.isShowModul;

    $scope._$nextState = $scope.isShowModul ? 'app.show.proj_prop.station' : 'app.proj.prop.station';

    if ($scope.isShowModul) {
        $scope.$moduleNav("项目", $state);
    } else {
        $scope.$moduleNav('项目管理', $state);
    }


    var per = $sys.itemsPerPage;
    $scope.page = {};
    $scope.loadPageData = function(pageNo) {
        var d = {
            itemsPerPage: per,
            currentPage: pageNo
        };

        $source.$region.query(d, function(resp) {
            $scope.page = resp;
            $scope.page.currentPage = pageNo;
        });
    }

    $scope.loadPageData(1);


    /*
     * 从 fps 中移除, 从 filterP 中移除;   从 allprojects 中移除;
     * */
    $scope.delProject = function(proj, index) {

        $scope.confirmInvoke({
                title: "删除区域 " + proj.projName + " ?",
                note: "其下系统不会被删除!"
            },
            function(next) {

            	$source.$region.delete( {pk:proj.id} , function(resp){
                    if(!resp.err){
            		  $scope.page.data.splice(index, 1);
                    }
                        next();
            	}) 
            }
        )
    }


})

// 添加 工程;
.controller("manage_addproj", function($scope, $source, $state, $sys) {

    console._log('manage_addproj');

    $scope.$moduleNav("添加项目", $state);


    // 添加 工程

    $scope.commit = function() {
        $scope.validForm(); 
        $source.$region.save($scope.proj,
            function(resp) {
                //resp.ret && $state.go("app.proj.manage");
                if (resp.ret) {
                    alert("添加成功!")
                }

            }
        )


    }
})

// -------------------- project 属性  ------------------------------------------
.controller("proj_prop", ['$scope', '$state', '$stateParams', function($scope, $state) {

    console._log("manage_proj_prop");

    $scope.$appendNav('项目属性', '_project');

    //是否为 show 模块;
    $scope.isShowModul = $state.$current.data && $state.$current.data.isShowModul;
    $scope._$mapState = $scope.isShowModul ? 'app.show.station_prop.map' : 'app.station.prop._map'
    $scope._$stationState = $scope.isShowModul ? "app.show.system_prop.current" : "app.station.prop._basic";


    $scope.project = $scope.$$cache[0];

    console._log($scope.project);
}])

// ==========================================================================================

// 加载 工程 采集站 属性; -- 默认
.controller("proj_prop_station", function($scope, $state, $map, $source,
    $window, $compile, $q, $sys) {

    console._log("proj_prop_station");

    $scope.$popNav($scope.project.projName + "(系统列表)", $state);

    $scope.updataORdel = "updata";

    var pd = {
            options: "of_proj",
            proj_id: $scope.project.id
        },
        projName = $scope.project.projName;

    // 加载第一页数据;
    // var d = { currentPage:1, itemsPerPage: $sys.itemsPerPage };


    $scope.loadPageData = function(pageNo) {
        // 分页加载 采集站数据;
        var d = angular.extend({
            currentPage: pageNo,
            itemsPerPage: $sys.itemsPerPage
        }, pd);

        //  分页 加载 project 下的 system
        $source.$system.query(d).$promise.then(function(resp) {

            var projids, sys_ref,
                promise_B,
                projnames, sta2sync;

            sys_ref = {};

            resp.data.forEach(function(n, i, a) {
                n.proj_name = projName;
                sys_ref[n.uuid] = n;
            })

            // 需要同步的 system
            var  ids = Object.keys(sys_ref); 




            if(ids.length ){
				promise_B = $source.$system.needSync({
	                uuids: Object.keys(sys_ref)
	            }).$promise.then(function(respB) {
		                angular.forEach(respB.ret, function(n, i, t) {
		                    sys_ref[i].needsync = n;
		                }) ;  
		                cc();
		            });    
            }else{ 
				cc();
            } 

            function cc (){
            	angular.extend($scope.page, resp);
                // console._log(" project system " , resp )

                // 翻页 刷新  地图上的点;
                if ($scope.list_map == "map") {
                    $map.flushMarkers(map, $scope.page.data);
                }
            }

            // promise_B = $source.$system.needSync({
            //     uuids: Object.keys(sys_ref)
            // }).$promise .then(function(respB) {
            //     angular.forEach(respB.ret, function(n, i, t) {
            //         sys_ref[i].needsync = n;
            //     })

            //     angular.extend($scope.page, resp);
            //     // console._log(" project system " , resp )

            //     // 翻页 刷新  地图上的点;
            //     if ($scope.list_map == "map") {
            //         $map.flushMarkers(map, $scope.page.data);
            //     }
            // });


        });

    }

    var map;
    $scope.initMap = function() {
        console._log("initMap");
        map = $map.initMap($scope, $scope.page.data, "bdmap", 175, projName);
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
.controller("proj_prop_attr", function($state, $scope) {

    console._log("proj_prop_attr");

    console._log($scope);

    $scope.$popNav($scope.project.projName + "(区域属性)", $state);


    $scope.proj = angular.copy($scope.project);

    $scope.commit = function() {

        $scope.validForm();

        // delete $scope.project.create_time;
        $project.updataProject({
            projid: $scope.project.id
        }, $scope.proj, function(resp) {
            console._log(resp.ret);
            alert("修改成功!")

            angular.extend($scope.project, $scope.proj);

        })
    };


})

;

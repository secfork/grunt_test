// 激活的采集器  控制器;

// 激活  未激活 公用控制器

angular.module('app.system', [])
	.controller("dastation_ignore_active", function($scope, $state, $stateParams, $source,
		$modal, $project, $q, $map, $sys) {


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


		console._log("dastation_ignore_active");
		console._log($scope, $stateParams);


		$scope.updataORdel = "del";

		$scope.go2Map = function(das, index) {
			index = index;
			$state.go('app.station.prop._map', das);
		};

		$scope.go2AddDas = function() {
			$state.go("app.station.add");
		}

		$scope.page = {};


		$scope.loadPageData = function(pageNo, total) {

			$scope.page.currentPage = pageNo;
			// 分页加载 系统数据;
			var d = angular.extend({
				currentPage: pageNo,
				total: total
			}, $stateParams, $sys.pager);

			$source.$system.query(d).$promise.then(function(resp) {

				var projids, sys_ref,
					promise_A, promise_B, projnames, sta2sync;

				projids = {};
				sys_ref = {};

				resp.data.forEach(function(n, i, a) {
					projids[n.group_id] = "";
					sys_ref[n.uuid] = n;
				})
				console.log(projids);
				promise_A = $project.getProjNameByIdS(Object.keys(projids)).$promise;

				// 激活的系统;
				if ($stateParams.isactive == '1') {
					// proj name ;
					// 是否要 同步;
					promise_B = $source.$system.needSync({
						uuids: Object.keys(sys_ref)
					}).$promise;
				}

				// 非激活的擦激战; 或者 展示模块;
				$q.all([promise_A, promise_B]).then(function(resp_B) {

					projnames = resp_B[0];
					sta2sync = resp_B[1] && resp_B[1].ret; //在 未激活,  展示 模块 为 undefind ;

					console._log(projnames, sta2sync);

					$.each(sys_ref, function(i, n) {
						n.proj_name = projnames[n.group_id];
						n.needsync = sta2sync && sta2sync[n.uuid];
					});

					angular.extend($scope.page, resp)
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
			console._log("initMap");
			map = $map.initMap($scope, $scope.page.data, "bdmap", 145, $stateParams.projname);

		}


	})

//添加系统;
.controller("dastation_add",
	function($state, $scope, $stateParams, $project, $source) {

		console._log("dastation_add");
		// 由系统 转来 无 projid= nudifund ,  由 project 转来有projid ;
		console._log($state, $stateParams);

		if ($scope.project) {
			$scope.$popNav($scope.project.projName + "(添加系统)", $state);
		} else {
			$scope.$moduleNav("添加系统", $state);
		}



		$scope.system = {};

		var a = $stateParams.projid;
		// 加载可操作的 project ;
		$project.getAllprojsBasic(
			function(resp) {
				$scope.projects = resp.ret;
				$scope.system.group_id = a ? a : resp.ret[0].id;
			}
		);
		// 加载 所有 systemModel ;
		$source.$sysModel.get(function(resp) {
			$scope.sysmodels = resp.ret,
				$scope.systemModel = resp.ret[0];
		});

		$scope.$watch("systemModel", function(n, o) {
			if (!n) return;
			console._log(" systemModel  change ", n);
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

			$scope.system.network = angular.toJson($scope.system.network);

			$source.$system.save(angular.extend({
				model: $scope.systemModel.uuid
			}, $scope.system), function(resp) {
				alert("创建成功!");

			})

		}



	});
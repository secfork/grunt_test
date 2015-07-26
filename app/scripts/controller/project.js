define(['angular'], function() {


	4 // 管理-项目-管理; project


	angular.module('app.controller.project', [])

	.controller("aa" , function($scope){
		$scope.data = 12345222 ; 
	})

	.controller("manage_projs", function($scope, $project, $state,   $sys ) {
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


		var per = $sys.pager.itemsPerPage;

		$scope.page = {
			currentPage: 1
		};
		$scope.loadPageData = function(pageNo) {
			var d = {
				itemsPerPage: per,
				currentPage: pageNo
			};

			$project.query(d, function(resp) {
				$scope.page = resp;
			});
		}

		$scope.loadPageData(1);


		/*
		 * 从 fps 中移除, 从 filterP 中移除;   从 allprojects 中移除;
		 * */
		$scope.delProject = function(proj, index) {

			$scope.confirmInvoke({
					title: "删除区域 " + proj.projName + " ?",
					note: "系统不会被删除!"
				},
				function(next) {
					$project.deletePoject({
							projid: proj.id
						},
						function(resp) {
							console._log(resp);
							// 打断 在 拼接 allprojects, 达到移除 数组某项;
							//if (resp.ret)   // resp.ret =1 ok,   = 0 ; error ;
							//	$scope.allprojects.splice( index, 1);
							/*  angular.forEach($scope.allprojects, function (n, i) {
										    return  n.id == proj.id ?(   $scope.allprojects.splice(i , 1) ,  false )
												                    : true ;
										});
									     // 重组 当前页;
									    $scope.filteProjByName();*/
							$scope.page.data.splice(index, 1);
							next();
						}
					)
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
	.controller("proj_prop_station", function($scope, $project, $state, $map, $source,
		$window, $compile, $q, $sys) {

		console._log("proj_prop_station");

		$scope.$popNav($scope.project.projName + "(采集站列表)", $state);

		$scope.updataORdel = "updata";

		var pd = {
				options: "of_proj",
				proj_id: $scope.project.id
			},
			projName = $scope.project.projName;

		// 加载第一页数据;
		// var d = { currentPage:1, itemsPerPage: $sys.pager.itemsPerPage };
		$scope.page = {
			currentPage: 1
		};

		$scope.loadPageData = function(pageNo) {
			// 分页加载 采集站数据;
			var d = angular.extend({
				currentPage: pageNo
			}, $sys.pager, pd);

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
				promise_B = $source.$system.needSync({
					uuids: Object.keys(sys_ref)
				}).$promise.then(function(respB) {
					angular.forEach(respB.ret, function(n, i, t) {
						sys_ref[i].needsync = n;
					})

					angular.extend($scope.page, resp);
					// console._log(" project system " , resp )

					// 翻页 刷新  地图上的点;
					if ($scope.list_map == "map") {
						$map.flushMarkers(map, $scope.page.data);
					}
				});
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
			$state.go("app.proj.prop.addstation", $stateParams);
		};



	})

	// 加载工程 属性字段;
	.controller("proj_prop_attr", function($state, $scope, $project) {

		console._log("proj_prop_attr");

		console._log($scope);

		//$scope.$popNav($stateParams.projname + "(详细属性)", $state);


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

	// 加载工程文件域;
	.controller("proj_prop_file", function($scope, $state, $stateParams,
		$fileregion, $modal, $state) {

		console._log($stateParams.projid);

		$scope.reload = function() {

			console._log("reload");
			console._log($state)
		};

		$fileregion.getFe_ReByProjid($stateParams, function(resp) {
			$scope.fileregions = resp
		}, function() {});

		// delfile
		$scope.delFile = function(params, index) {
			$fileregion.deleteFile(angular.extend(params, $stateParams),
				function(resp) {
					if (resp['0'] = 1) {
						// 删除成功!
						// 打断 在 拼接 allprojects, 达到移除 数组某项;
						$scope.fileregions.splice(index, 1)

					} else {
						// 删除失败失败;
					}
				},
				function() {

				});
		};

		// 打开 文件域 文件上传窗口;
		$scope.openFileUploadWin = function(size) {
			$modal.open({
				templateUrl: '../../file_upload_temp.html',
				controller: fileUploadCtrl,
				size: "x", // size

				resolve: {
					proj: function() {
						return $stateParams
					},
					$$scope: function() {
						return $scope;
					}
				}
			});

		};

		// 文件上传控制器;
		var fileUploadCtrl = function($scope, $modalInstance, $state, proj,
			$$scope) {
			console._log("fileUploadCtrl");
			console._log(proj);

			$scope.cancel = $$scope.closePopupWin($modalInstance);

			$scope.file = {};
			$scope.progress = 1;
			$scope.showmsg = false;

			console._log($scope);

			// 获得文件路径;
			$scope.setFiles = function(element) {

				$scope.canupload = true;
				$scope.$apply(function($scope) {
					console._log(element.files);
					// Turn the FileList object into an Array
					$scope.files = []

					console._log(element.files[0].size)
						// 值上传 第一个; 单位 B ; // 1G
					$scope.rightfile = (element.files[0].size < 10240000);
					$scope.showmsg = !$scope.rightfile;
					if ($scope.rightfile) {
						$scope.files.push(element.files[0]);
					}
				});
			};

			$scope.uploadFile = function() {

				console._log($scope.file);

				var fd = new FormData()
				for (var i in $scope.files) {
					fd.append("uploadedFile", $scope.files[i])
				}

				fd.append("filename", $scope.file.filename);
				fd.append("filedesc", $scope.file.filedesc);

				// $fileregion.uploadFile( )

				var xhr = new XMLHttpRequest();
				console._log(xhr);

				xhr.upload.addEventListener("progress", uploadProgress, false);
				xhr.addEventListener("load", uploadComplete, false);
				// xhr.addEventListener("error", uploadFailed, false);
				// xhr.addEventListener("abort", uploadCanceled, false) ;
				xhr.open("POST", "project/" + proj.projid + "/file/upload");
				$scope.progressVisible = true;
				xhr.send(fd);
			};

			// 上传完成; 刷新 fileregion 视图;
			function uploadComplete(evt) {

				// xhr 返回的数据 之后要 push 到 $$scope.fileregions
				console._log(evt.target.responseText)

				try {
					$modalInstance.dismiss('cancel');
				} catch (e) {}
				// console._log( $$scope.fileregions ) // 之后要 网 里push 数据;
				$state.transitionTo($state.current, $stateParams, {
					reload: true,
					inherit: false,
					notify: true
				});
			}

			// 进程条滚动;
			function uploadProgress(evt) {
				$scope.$apply(function() {
					if (evt.lengthComputable) {
						$scope.progress = Math.round(evt.loaded * 100 / evt.total)
					} else {
						$scope.progress = 'unable to compute'
					}
				})
			}

		};

	})

	// 添加 工程;
	.controller("manage_addproj", ["$scope", "$project", '$state', '$sys', "$account",
		function($scope, $project, $state, $sys, $account) {

			console._log('manage_addproj');

			$scope.$moduleNav("添加项目", $state);


			// 添加 工程

			$scope.commit = function() {
				$scope.validForm();

				// if ($scope.form.$valid) {
				$project.crateProect($scope.proj,
						function(resp) {
							$state.go("app.proj.manage");
						}
					)
					// };
			}
		}
	]);



})
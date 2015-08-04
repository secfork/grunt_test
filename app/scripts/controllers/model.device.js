angular.module('app.model.device', [])
.controller("devmodel", [ 
    '$scope', '$compile', '$state', '$modal', '$log', '$http',
    '$timeout', '$source',   '$utils' ,
    function($scope, $compile, $state, $modal, $log, $http,
        $timeout, $source,  $utils
    ) {
        // 加载 projects ;
        console._log("template", $window); //postcode   $source.$dmPoint ,
        
        var tempScope = $scope;

        $scope.$rootNav("管理");
        $scope.$moduleNav("设备模版", $state);

        var $window = $(window);

    

        // 监视屏幕滚动;
        var _timeout, w_st, w_h, t_p, t_b, p_t, p_b,
            t_doms, $t_dom;

        $scope.$on("$destroy", function() {
            $window.off("scroll");
        })

        $window.scroll(function() {
            $timeout.cancel(_timeout);

            _timeout = $timeout(function() {
                console._log("window scroll", _timeout);

                w_st = $(window).scrollTop();
                w_h = $(window).innerHeight();

                console.log(w_st, w_h);
                return;

                // 判断 temp 滚动;  当 temp 超上限 判断是否展开;  若展开判断 point ;
                t_doms = $("#temp_context .temp");


                $.each(t_doms, function(i) {
                    $t_dom = $(this);
                    console.log($t_dom);
                    if ($dom.position().top < w_st) {
                        // 上超限 ;


                    }
                    if ($dom.position().top > (w_h + w_st)) {
                        // 下超限;

                    }
                })

                // 判断 point 滚动;

            }, 200);

        });

         // 加载 device model ; 
$source.$deviceModel.get(function(resp) { 
            $scope.deviceModels  =  resp.ret ;  
        });


        // 加载 device model  下 的 points ;
        $scope.loadPoints = function(scope, $event, index, devModel) {
            console._log(arguments);
            if (!scope.points) {
                $source.$dmPoint.get({
                        device_model: devModel.uuid
                    },
                    function(resp) {
                        scope.points =  resp.ret;
                    }
                );
            }
        };

        // 添加 || 编辑  模版; 弹出框 ;=================================================
        $scope.add_edit_t = function(scope, t) { //  temp-scope , 或者; super-scope ;
            $modal.open({
                templateUrl: 'athena/views/template/temp.html', 
                controller: function($scope, $modalInstance, $driver, $source  ) {
                    console._log("edit or new  temp ", t);
                    $scope.__proto__ = scope;
                    $scope.$modalInstance = $modalInstance;

                    $scope.isAdd = !t;

                    if (!t) { // 新建; 
                        //$scope.drivers =
                         $driver.getDriverList(function(resp) { 
                            $scope.drivers = [ {id:2, driver_id:"FCS_MODBUS" , version:"1.0.0.0" } ]  
                                            // resp;
                            $scope.d = $scope.drivers[0]; 
                         });
                    }





                    $scope.T = t ? angular.copy(t) : {};


                    $scope.cancel = function() {
                        $modalInstance.dismiss('cancel');
                    };
                    // 编辑 新建 template ;
                    $scope.done = function(btn) {
                        $scope.validForm();     

                        if (!t) {
                            // 新建;
                            $scope.T.driver_id = $scope.d.driver_id;
                            $scope.T.driver_ver   = $scope.d.version ; 
                            console._log($scope.T);  
$source.$deviceModel.save($scope.T,  function(resp) {
                                    
                                    $scope.T.uuid = resp.ret;
                                    $scope.deviceModels.push($scope.T);
                                    // $scope.page.total ++ ; 
                                    $scope.cancel()
                                }
                            );
                        } else {
                            //更名; 
$source.$deviceModel.put( { uuid: t.uuid , name:$scope.T.name, desc: $scope.T.desc },   function(resp) {
                                    t.name = $scope.T.name;
                                    t.desc = $scope.T.desc;
                                    $scope.cancel()
                                }
                            )
                        }
                    }
                }
            });
        };


        // 上传模版;==================================================================================
        $scope.upload_t = function() {
            $modal.open({
                templateUrl: 'athena/views/template/temp_upload.html',
                controller: temp_upload,
                size: "m", //size
                resolve: {
                    $$scope: function() {
                        return $scope;
                    }
                }
            });
        };

        // 文件上传控制器;
        var temp_upload = function($scope, $$scope, $modalInstance) {

            console._log("temp upload");
            console._log($scope);
            $scope.file = {};
            $scope.progress = 1;
            $scope.showmsg = false;
            $scope.cancel = $$scope.closePopupWin($modalInstance);

            // 获得文件路径;
            $scope.setFiles = function(element) {

                $scope.canupload = true;
                $scope.$apply(function($scope) {
                    console._log(element.files);
                    // Turn the FileList object into an Array   form 中家 multiple  就是多文件上传;
                    $scope.files = [];

                    console._log(element.files[0]);

                    // 值上传 第一个; 单位 B ;  // 1G
                    $scope.rightfile = (element.files[0].size < 10240000);
                    $scope.showmsg = !$scope.rightfile;
                    if ($scope.rightfile) {
                        $scope.files.push(element.files[0]) //  文件路径;
                    }
                });
            };

            $scope.uploadFile = function() {

                console._log($scope.file);

                var fd = new FormData();
                // for (var i in $scope.files) {
                fd.append("uploadedFile", $scope.files[0])
                    // } ;
                    // 添加参数;
                    // fd.append("filename", $scope.file.filename );
                    // fd.append("filedesc", $scope.file.filedesc );

                var xhr = new XMLHttpRequest();

                xhr.upload.addEventListener("progress", uploadProgress, false);
                xhr.addEventListener("load", uploadComplete, false);

                //  xhr.addEventListener("error", uploadFailed, false) ;
                //  xhr.addEventListener("abort", uploadCanceled, false) ;

                xhr.open("POST", "template/upload");
                $scope.progressVisible = true;
                xhr.send(fd);
            };


            // 上传完成;  刷新 fileregion 视图;
            function uploadComplete(evt) {
                try {
                    $modalInstance.dismiss('cancel');
                } catch (e) {}
                //  console._log( $$scope.fileregions )  // 之后要 网 里push 数据;
                /*  $state.transitionTo($state.current, $stateParams, {
                 reload: true, inherit: false, notify: true
                 });*/
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


        // 导出模版;===============================================================================
        $scope.export_t = function(T) {
            $modal.open({
                templateUrl: '../views/template/temp_export.html',
                controller: temp_export,
                size: "m", //size
                resolve: {
                    $$scope: function() {
                        return $scope;
                    },
                    T: function() {
                        return T
                    }
                }
            });
        };



        var temp_export = function($scope, $$scope, $modalInstance, T) {
            console._log("export_t");
            $scope.cancel = $$scope.closePopupWin($modalInstance);
            $scope.T = T;
        };


        // ============================= 用户删除 tempalte  group file ===========================
        // 删除 tempalte

        $scope.delTemp = function(  index, obj) {
             
            var msg = {
                title: "删除模版!" + obj.name +" ?" 
            };
            if (obj.ref)
                msg.warn = "该模版被" + obj.ref + "个设备使用! 不可删除!"; 
            $scope.confirmInvoke(msg,  function(next) {
                if (obj.ref) return; 
$source.$deviceModel.delete({  uuid: obj.uuid   },  function(resp) {
                    if (resp) {
                        $scope.deviceModels.splice(index, 1); 
                        // $scope.page.total-- ; 
                        next();
                    }
                })
            });
        };

        $scope.delPoint = function(scope, index, p, dm_uuid) {
            console._log("delPoint", p);
            $scope.confirmInvoke({
                title: "删除点 " + p.name + " ?"
            }, function(next) {
                $source.$dmPoint.delete({
                    id: p.id,
                    device_model: dm_uuid
                }, function(resp) {
                    scope.points.splice(index, 1);
                    next();
                });
            })
        };

 
        //--------------
        //添加 point;

        $scope.addOrEditPoint = function(scope, p, index) {
            console._log(" add_f or edit_f  ");

            $modal.open({
                templateUrl: 'athena/views/template/file.html', 
                controller: function($scope,   $modalInstance,   $sys ) {
                    $scope.__proto__ = scope;
                    $scope.$modalInstance = $modalInstance;
                    $scope.point = {};

                    if (p) {
                        $scope.point = angular.copy(p); 
                        $scope.point.params = angular.fromJson( $scope.point.params); 
                    }else{
                         var  dm =  scope.dm ;  
                         $scope.point =  angular.copy( $sys.point[dm.driver_id  ][dm.driver_ver ].entity )
                    };

                    console._log( p ,  $scope.point);

                    // $scope.g = {hex: "0001ffdf", show: "2", type: "2", mask: true};

                    $scope.done = function() {
                        $scope.validForm();
                        // 创建 ? || 编辑?
                        $scope.point.device_model = scope.dm.uuid;

                        if (p) {
                            // 编辑;   
                            $source.$dmPoint.put($scope.point, function(resp) {
                                $scope.points[index] = angular.copy($scope.point);
                                $scope.cancel();
                            });
                        } else {
                            // 创建 
                            $source.$dmPoint.save($scope.point, function(resp) {
                                $scope.point.id = resp.ret;
                                $scope.points.push($scope.point);
                                $scope.cancel();
                            });
                        }

                    };
                }
            });
        }; 
        $scope.clone_f = function(f_id) {
            console._log(arguments)
        };

    }
]);
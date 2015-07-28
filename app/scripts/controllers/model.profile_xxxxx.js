

angular.module( 'app.model.profile',[])

    .controller("profile_all", function ($scope, $state, $sysProfile) {
        // 加载 所有  固化 prifle ,
        console._log("profile_all");
      //  console._log($profile.getInnateProfile);


        $scope.$moduleNav("配置项", $state );


        // 得到系统固化的 profile ;
        /* $profile.getInnateProfile(function (resp) {
         $scope.innateProf = resp.ret  ;
         } );*/

        // 得到  和  用户自定义profile ;
        $sysProfile.get(function (resp) {
            $scope.privateProf = resp.ret;
        });


        $scope.delete = function (profile, index) {
            console._log(profile);
            $scope.confirmInvoke({title: "移除配置项:" + profile.name + "?"},
                function (next) {
                    console._log($scope.privateProf, index);
                    $sysProfile.delete({profid: profile.profile_id}, function (resp) {
                        if (resp)
                            $scope.privateProf.splice(index, 1);
                        next();
                    })

                });
        }
    })


    .controller("profile_add", function ($scope, $profile, $devtemplate, $state) {
        console._log("profile_add");
        console._log($scope);

        $scope.$moduleNav("添加配置项", $state );

        // 默认 profile 类型 , 模版数据;
        $scope.profile = {dev_conn_params: {}};
        $scope.drivertype = "modbus";

        $scope.$watch("drivertype",
            function (newval, oldval) {
                $devtemplate.getTemplateListByType({type: newval},
                    function (resp) {
                        if (resp) {
                            $scope.template = resp.ret;
                            $scope.profile.template_id = resp.ret[0].template_id;
                        }
                    }
                )
            }
        );


        // 创建 profile ;
        $scope.createProfile = function () {
            if (!$scope.form.$valid) return;
            $profile.create($scope.profile,
                function (resp) {
                    if (resp) {
                        $state.go("app.profile.profile");
                    }
                }
            )
        }

    })

    .controller("profile_edit", function ($scope, $state, $profile, $stateParams,
                                             $devtemplate, $q, $sys, $utils, $filter) {
        console._log("profile_edit");
        console._log($stateParams);



        $scope.isedit = $stateParams.edit == "true";
        // 得到 profile 信息;
        $scope.profile = {};
        var promise_1 = $profile.getTheProfile({profid: $stateParams.profid}).$promise,

        // 得到profile 下 关联 的 tempalte ;
            promise_2 = $profile.getTempRefed({profid: $stateParams.profid}).$promise;


        //得到 profile ,和 prfile 关联的 template ;
        $scope.promise_3 = $q.all([promise_1, promise_2]).then(
            function (args) {
                console._log(" 两个请求完成后处理; ");
                console._log(args);
                $scope.profile       =   args[0].ret;
                $scope.profile.temps =   args[1].ret;
                $scope.op_temp = args[1].ret[0];
                console._log($scope.profile);
               // 堆叠 导航栏;
                $scope.$appendNav(  $scope.profile.name , $state );


            }
        );

        // 添加 profpoint , alarmpoint  后, profle 也新增连接 template ;
        $scope.$profAddTemp = function (newtempid) {
            console._log("$profAddTemp");
            $scope.op_temp = $utils.findTempByid($scope.templates, newtempid);
            // 向 profile.temps 中添加 ;
            if (!$utils.containTemp($scope.profile.temps, newtempid)) {
                $scope.profile.temps.push($scope.op_temp);
            }
        };

        // 复制 profile 确定按钮;
        $scope.done = function () {
            //console._log($scope.aa)
            alert("还未实现 profile 复制功能!")
        }


        // 得到 所有 template 模版;
        $scope.promise_3.then(function () {

        });

        // 驱动类型 切换,( template driverType ) 更换template 集合更新!
        $scope.driverTypeChange = function ( scope ) {
             console._log('driverTypeChange');
            $scope.temps = $filter("filter")($scope.templates, {driver_id: scope.opt.D});
            console._log( $scope.temps );
            scope.opt.temp_id = $scope.temps[0] && $scope.temps[0].template_id;
        };

        // 加载所有 template ;
        $scope.createOpt = function (scope ) {
            if(!$scope.templates){
               return   $devtemplate.getTemplateList(function (resp) {
                    $scope.templates = resp.ret;
                    creaeteOpt (scope);
                })
            }else{
               creaeteOpt( scope ) ;
               return null ;
            }
        }
        function  creaeteOpt(scope){
            if($scope.op_temp) {
                scope.opt = {
                    D: angular.copy($scope.op_temp.driver_id),
                    temp_id: angular.copy($scope.op_temp.template_id),
                    point: undefined
                };
                $scope.temps = $filter('filter')($scope.templates, {driver_id: $scope.op_temp.driver_id});
            }else{
                //  $scope.tempaltes 还没加载来是 就会报错;
                $scope.temps = $filter('filter')($scope.templates, {driver_id: $sys.drivertype.default});
                scope.opt = {
                    D: $sys.drivertype.default,
                    temp_id: $scope.temps[0] && $scope.temps[0].template_id,
                    point: undefined
                };
            }
            // templatede 切换, templatePoints 集合 更新;
            scope.$watch("opt.temp_id", function (n, o) {
                // 加载 模版下的点; 清空 point_id 值;
                console._log("watche  opt.temp_id = ", n, o);
                //$scope.opt.temp = n ;
                scope.opt.point = undefined;
                console._log(scope.opt );
                if (n) {
                    $devtemplate.getPoints({id: n}, function (resp) {
                        scope.temppoints = resp.ret;
                        scope.opt.point = resp.ret[0] && resp.ret[0] //.point_id;
                    })
                }
            });

            // 添加 日志点时 设置 ;   name 和 point 那么 重名;
            scope.$watch("opt.point", function (n) {
                scope.pp.name = n.name ;
            })

        }


        // profile 中删除 关联的 template ;
        //   getPointRefTemp: {url: "web/profile/:profid/temp/:tempid/profpoint"},
        $scope.stripTemp = function (temp, index) {
            console._log('stripTemp');
            console._log( $stateParams);
            $scope.confirmInvoke({title:"从配置项中删除与模版的关联 ? "} , function (next) {
                $profile.removeTempOFProf( { profid: $stateParams.profid, tempid:temp.template_id} , function (resp) {
                    console._log(resp);
                    if(!resp.err){
                        $scope.profile.temps.splice(index , 1);
                        // 移除的temp 为当前选中的temp 时 ,  op_temp 选中前一个;
                        if($scope.op_temp.template_id ==  temp.template_id ){
                            $scope.op_temp =  $scope.profile.temps[ index-- ] ;
                        }
                        if( index == 0  ){
                            $scope.op_temp  = $scope.profile.temps[0]||undefined ;
                        }
                    }  ;

                    next();
                });
            })
        };
        // op_temp 切换换;
        $scope.selectTemp = function ( temp , index ) {
            $scope.op_temp = temp ;
        };

        // 完善 , log ,alarm 点 引用 template point 的点名;

        $scope.loadProfPointOrAlarm= function ( tid , $promise  , assignFun ){
            var alarm_p = {};
            $promise.then(function (resp_A) {
                resp_A.ret.forEach(function ( n,i,a) {
                    ((alarm_p[''+ n.point_id] ) || ( alarm_p[""+ n.point_id] = [] )).push(n);
                });
                $devtemplate.getPointsWithIds( Object.keys(alarm_p),  function ( resp_B ) {
                    angular.forEach( resp_B.ret , function (n, i) {
                        alarm_p[""+ n.point_id].forEach(function (m,i,a) {
                            m.pointname = n.name;
                        })
                    })
                    assignFun(resp_A.ret);
                });
            });
        }




    })
    .controller("profile_edit_dev", function ($scope, $profile, $state, $stateParams ) {
        console._log("profile_edit_dev");
        console._log($stateParams);
        //$scope.grid_th = [ { th:"th.station"  } ,{ th:"th.project"},{ th:"th.sync"},{ th:"th.null"}   ]


        function getDevs(v) {
            $profile.getDevicesRefProfile({profid: $stateParams.profid, tempid: v}, function (resp) {
                $scope.ds = resp.ret;
            })
        }

        //console._log(  $scope.promise_3 );
        // "profile 加载完成"
        $scope.promise_3.then(
            function () {
                $scope.$watch("op_temp.template_id", function (n, o) {
                    console._log("temp 切换 加载 devs ");
                    n ? getDevs(n) : null;
                })
            }
        );
    })

    .controller("profile_edit_log", function ($scope, $state, $modal, $profile, $stateParams ) {

        console._log("profile_edit_log");
        console._log($stateParams);

        $scope.profpoints = [];
        $scope.promise_3.then(
            function () {
                console._log("profile 加载完成! ");
                $scope.$watch("op_temp.template_id", function (n, o) {
                    console._log("temp 切换 加载 profpoints ");
                    if(n){
                        $scope.loadProfPointOrAlarm(
                            n,
                            $profile.getPointRefTemp({profid: $stateParams.profid, tempid: n}).$promise ,
                            function ( a ) {   $scope.profpoints = a ; }
                        ) ;

                    }
                })
            }
        );


        // localscope
        $scope.addLogPoint = function (scope) {
            $modal.open({
                templateUrl: "../views/profile/prof_point_add.html",
                controller: function ($scope, $modalInstance, $profile, $driver, $q, $utils) {
                    $scope.__proto__ = scope;
                    console._log("profile_edit_log  -- addLogParam ");

                    $driver.getDriverList(function (resp) {
                        $scope.drivers = resp ;
                    });

                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel')
                    };

                    $scope.createOpt ($scope );

                    $scope.pp = {};
                    $scope.done = function (btn) {
                        //web/profile/:prof_uuid/profpoint/create"
                        // alert(    $scope.po.r.name  );
                        console._log("create prof-point");
                        $scope.checkModalForm(btn, $scope);
                        if (!$scope.$$childTail.form.$valid)  return;

                        //url:"web/profile/:prof_id/profpoint/:temppoint_id/create"
                        $profile.createProfPoint(
                            {prof_id: $stateParams.profid, temppoint_id: $scope.opt.point.point_id},
                            $scope.pp,
                            function (resp) {
                                console._log(resp);
                                // 如果是 optempid 则 纳入集合, 否侧 不处理;
                                if ($scope.op_temp && $scope.op_temp.template_id == $scope.opt.temp_id) {
                                   // $scope.pp.point_id = resp.ret;
                                    angular.extend($scope.pp, {point_id:resp.ret, pointname:$scope.opt.point.name});
                                    $scope.profpoints.push($scope.pp);
                                } else {
                                    //  查找出 切换后的 temp ;
                                     $scope.$profAddTemp($scope.opt.temp_id);
                                }
                                $scope.cancel();
                            }
                        );
                    }

                }
            });
        };


        $scope.editLog = function (scope, pp, index) {
            console._log(" editLog point !!");
            console._log(pp);
            $modal.open({
                templateUrl: "../views/profile/prof_point_edit.html",
                controller: function ($scope, $modalInstance, $profile) {
                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel')
                    };
                    $scope.__proto__ = scope;

                    $scope.pp = {
                        name: pp.name, desc: pp.desc, scale: pp.scale, deviation: pp.deviation,
                        save_log: pp.save_log, log_cycle: pp.log_cycle, log_type: pp.log_type
                    };
                    $scope.done = function (btn) {
                        $scope.checkModalForm(btn, $scope);
                        if (!$scope.$$childTail.form.$valid)  return;
                        $profile.setProfPoint(
                            {prof_id: $stateParams.profid, point_id: pp.point_id},
                            $scope.pp,
                            function (resp) {

                                $scope.profpoints[index] = angular.extend(pp, $scope.pp);
                                $scope.cancel();
                            }
                        )
                    }
                }
            });
        };


        $scope.cloneLog = function () {
            $modal.open({
                templateUrl: "../views/debris/log_visual.html",
                resolve: {
                    log: function () {
                        return {a: 11}
                    }
                },
                controller: function ($scope, $modalInstance) {
                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel')
                    };
                    $scope.g = {gname: "xxx"};
                }
            });

        };

        $scope.delLog = function (pp, index) {
            console._log(pp);
            $scope.confirmInvoke({title: "删除日志点 " + pp.name + " ?"}, function (next) {
                console._log("删除日志 逻辑");
                // web/profile/:prof_uuid/point/:point_name/delete
                console._log($stateParams);
                console._log(pp);

                $profile.deleteProfPoint({prof_id: $stateParams.profid, point_id: pp.point_id},
                    function (resp) {
                        $scope.profpoints.splice(index, 1);
                        next();
                    });

            });
        }
    })

    .controller("profile_edit_alarm", function ($scope, $state ,$stateParams,$modal, $profile , $devtemplate ) {
        console._log("profile_edit_alarm");

        $scope.profAlarmPoints=[] ;
        $scope.promise_3.then(
            function () {
                console._log("profile 加载完成! 加载 prof 下的 报警 点;  ");
                $scope.$watch("op_temp.template_id", function (n, o) {
                    console._log("temp 切换 加载 profpoints ");
                    if(n){
                        $scope.loadProfPointOrAlarm(
                             n,
                             $profile.getProfAlarmByTid({profid:$stateParams.profid ,  tempid: n }).$promise ,
                             function ( a ) {   $scope.profAlarmPoints = a ; }
                        ) ;
                    }
                })
            }
        );

        $scope.byte = 32 ;  // 32位   位 报警;




        // prof alarm  params  为报警时! 验证十六进制 数;
        var regex = /^[0-9a-fA-F]$/ ;
        $scope.cc  = function ( $scope ) {
            //位 报警时 才验证;
            if( !$scope.alarm.params ) return  ;
            var  byte = $scope.byte,  // 位数;
                s =  $scope.alarm.params,
                l = s.length,
                n =  byte/4 ;
            console._log(s , n );
            if( l > n ){
                $scope.alarm.params = s.substring(0, n).toUpperCase() ;
                return ;
            }
            //验证字符合法;
            var  char = s.charAt( l-1 );
            console._log(char);
            if( !regex.test(char) ){
                $scope.alarm.params = s.substring(0, l-1).toUpperCase() ;

            }else{
                $scope.alarm.params = s.toUpperCase() ;
            }
        }

        $scope.addProfAlarmPoint = function (scope ) {
            console._log("addProfAlarmPoint");
            $modal.open({
                templateUrl: "../views/profile/prof_alarm_add.html",
                controller: function ($scope, $modalInstance, $profile ,$driver,$q) {
                    $scope.__proto__ = scope ;
                    console._log( $scope );


                    var permiss = $scope.createOpt ($scope );
                    //console._log(permiss);

                    // 16 位 或者 32位 ;   opt 是在 createOpt 的回调中生成的!
                    // $scope.opt.byte = 16 ;
                    $driver.getDriverList(function (resp) {
                        $scope.drivers = resp ;
                    });
                    $scope.alarm={} ;

                    $scope.cancel = function () {  $modalInstance.dismiss('cancel') };
                    $scope.done = function ( btn ) {
                        $scope.checkModalForm(btn , $scope ) ;
                        if(! $scope.$$childTail.form.$valid ) return ;

                        // 创建 prof_alarm 点;
                        $scope.alarm.profile_id = $stateParams.profid ;
                        $scope.alarm.point_id = $scope.opt.point.point_id ;
                        console._log( $scope.alarm );
                        $profile.createProfAlarmPoint( $scope.alarm , function ( resp ) {
                            console._log(resp);
                            // 如果是 optempid 则 纳入集合, 否侧 不处理;
                            if ($scope.op_temp && $scope.op_temp.template_id == $scope.opt.temp_id) {
                                $scope.alarm.id = resp.ret ;
                                $scope.alarm.pointname = $scope.opt.point.name;
                                $scope.profAlarmPoints.push( $scope.alarm );
                            } else {
                                //  查找出 切换后的 temp ;
                                $scope.$profAddTemp($scope.opt.temp_id);
                            }
                            $scope.cancel();
                        });
                    }
                }
            });
        }


        $scope.updateProfAlarmPoint = function ( scope , alarm , index ) {
            console._log("updateProfAlarmPoint");
            $modal.open({
                templateUrl: "../views/profile/prof_alarm_edit.html",
                controller: function ($scope, $modalInstance, $profile) {
                    $scope.__proto__ = scope ;

                    $scope.createOpt ($scope );

                    $scope.cancel = function () {  $modalInstance.dismiss('cancel') };
                    $scope.alarm = angular.copy(alarm) ;

                    console._log($scope.alarm , alarm )
                    // 16 位 或者 32位 ;
                   // $scope.opt.byte = 16 ;
                    $scope.done  = function (btn) {
                        $scope.checkModalForm(btn , $scope ) ;
                        if(! $scope.$$childTail.form.$valid ) return ;
                        console._log( $scope.alarm);
                        //web/profile/alarms/update/:alarm_pid
                        $profile.updateProfAlarmPoint(  {alarm_pid: alarm.id}, $scope.alarm, function (resp) {
                             $scope.profAlarmPoints[index] = angular.copy($scope.alarm) ;
                            $scope.cancel();
                        })
                    }
                }
            });
        }

        $scope.delPropAlarmPoint = function ( alarm , index ) {
             console._log("delPropAlarmPoint");
             $scope.confirmInvoke({title:"删除报警点 ?" } , function (next) {
                 //web/profile/alarms/delete/:alarm_pid"
                 $profile.delProfAlarm( {alarm_pid: alarm.id} , function (resp) {
                     $scope.profAlarmPoints.splice(index, 1);
                     next();
                 });
             })
        }
    })


    .controller("profile_edit_visual", function ($scope, $state, $modal) {
        console._log("profile_edit_visual");


        $scope.editVisual = function () {

            $modal.open({
                templateUrl: "../views/debris/log_visual.html",
                resolve: {
                    log: function () {
                        return {a: 11}
                    }
                },
                controller: function ($scope, $modalInstance) {
                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel')
                    };
                    console._log($scope);
                    $scope.g = {gname: "xxx"};
                }
            });

        };

        $scope.cloneVisual = function () {
            $modal.open({
                templateUrl: "../views/debris/log_visual.html",
                resolve: {
                    log: function () {
                        return {a: 11}
                    }
                },
                controller: function ($scope, $modalInstance) {
                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel')
                    };
                    $scope.g = {gname: "xxx"};
                }
            });

        };

        $scope.delVisual = function () {
            $scope.confirmInvoke({title: "删除可视化项"}, function (next) {
                alert("删除日志 逻辑");
                next();
            });
        }


    })




// ==================================  资料网关 分类控制 ;===============================
    .controller("profile_edit_gatway", function ($scope, $state, $stateParams) {
        console._log("profile_edit_gatway");
        console._log($scope);


        //准备三套
        console._log($stateParams);

        $scope.gateway = "modbus";

        $scope.url = "athena/views/profile/edit_gatway_" + $scope.gateway + ".html";

        $scope.$watch(function () {
                return $scope.gateway
            },
            function (d) {
                try {
                    $scope.url = "athena/views/profile/edit_gatway_" + d + ".html";
                } catch (e) {
                }
            }
        );


        // 加载 metadata 数据;
        // 模版类型 ,  设备星星 , profile 类型 是否 一定 相对应的 ;
        /*   var  bathpath = "athena/views/profile/edit_gatway_",

         metadata   =  {
         // controller  写在 相应页面中了!
         gps:{   url: bathpath+ ".html" , controller : "pro_ed_ga_gps"} ,
         modbus:{ url: bathpath+"modbus.html" , controller : "pro_ed_ga_modbus"} ,
         ec300:{ url: bathpath+"ec300.html" , controller : "pro_ed_ga_ec300"}
         } ;
         */
        /* $scope.gateway  =  angular.extend( $stateParams , metadata[$stateParams.type ]  ) ;*/

        /* console._log( $scope.gateway  ) ;*/

    })

    .controller("pro_ed_ga_gps", function ($scope, $state, $stateParams) {
        console._log("pro_ed_ga_gps");
        console._log($scope);


        //准备三套


        // $scope.gatwayType = { Gps: {  Enabled: $gateway.    }   } ;

    })
    .controller("pro_ed_ga_modbus", function ($scope, $state, $stateParams) {
        console._log("pro_ed_ga_modbus");


        //准备三套


        // $scope.gatwayType = { Gps: {  Enabled: $gateway.    }   } ;

    })
    .controller("pro_ed_ga_ec300", function ($scope, $state, $stateParams) {
        console._log("pro_ed_ga_ec300");


        //准备三套


        // $scope.gatwayType = { Gps: {  Enabled: $gateway.    }   } ;

    });


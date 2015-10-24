angular.module("app.model.system", []) 
    .controller("sysmodel", function($scope, $state, $modal, $source, $utils) {
     // $source.$sysModel 


        $scope.$moduleNav("系统模型", $state);


        var t = $scope,
            page;

        // 加载所有 sysmodel ;
        $source.$sysModel.get($scope.$sys.fristPage, function(resp) {
            $scope.page = page = {
                    data: resp.ret
                } // $utils.page(resp);
        });


        $scope.createSM = function() {
            $modal.open({
                templateUrl: 'athena/sysmodel/add_sysmodel.html',
                controller: function($scope, $modalInstance) {
                    $scope.__proto__ = t,
                        $scope.$modalInstance = $modalInstance,
                        $scope.sm = {
                            mode: '1',
                            comm_type: '1'
                        },
                        $scope.isAdd = true;
                    $scope.done = function() {
                        // 验证表格;
                        $scope.validForm();
                        // 新建 sysmodel ;
                        $source.$sysModel.save($scope.sm, function(resp) {
                            var  d = { uuid: resp.ret , create_time: new Date() , device_count:0 ,profile_count:1};
                     
                            page.data.push( angular.extend( d , $scope.sm ) );
                            page.total++;
                            $scope.cancel();
                        });
                    }
                }
            })
        }

        $scope.deleteSM = function(index, sm) {
            $scope.confirmInvoke({ 
                title: "删除系统模型: " + sm.name + "?" 
            }, function(next) {
                $source.$sysModel.delete({
                    uuid: sm.uuid
                }, function(resp) {
                    page.data.splice(index, 1);
                    page.total--;

                    next();
                }, next)
            })
        }

        $scope.updateSM = function(scope, index, sm) {
            $modal.open({
                templateUrl: 'athena/sysmodel/add_sysmodel.html',
                controller: function($scope, $modalInstance) {
                    $scope.__proto__ = scope;
                    $scope.$modalInstance = $modalInstance;
                    $scope.sm = angular.copy(sm);
                    $scope.done = function() {
                        $scope.validForm();
                        var n = $scope.sm.name,
                            m = $scope.sm.mode,
                            d = $scope.sm.desc,
                            c = $scope.sm.comm_type,
                            da = {
                                uuid: sm.uuid,
                                name: n,
                                desc: d,
                                comm_type: c,
                                mode: m
                            };
                        $source.$sysModel.put(da, function(resp) {
                            sm.name = n,
                                sm.desc = d,
                                sm.mode = m,
                                sm.comm_type = c;
                            $scope.cancel();
                        })
                    }

                }
            }) 
        } 

    })

.controller('sysmodelProp',   
    function($scope, $source, $q) {


        var d = $scope.$$cache[0]
        try {
            d.gateway_default = angular.fromJson(d.gateway_default || {});
        } catch (e) {
            angular.alert("GateWay Default 严重错误!")
            console.error("  SystemModel  gateway_default 字段 不合法!!");
        }

        $scope.sysmodel = d;


        // 属性 tabs 配置;  
        $scope.tabs = [{
            title: "tab.t16",
            icon: "icon icon-info",
            state: "app.model.sysmodel_p.basic"
        }];
        $scope.tabs.push({
            title: "tab.t12",
            icon: "icon icon-wrench",
            state: "app.model.sysmodel_p.sysprofile"
        });

        if ($scope.sysmodel.mode == 1) {
            $scope.tabs.push({
                title: "tab.t10",
                icon: "icon icon-screen-desktop",
                state: "app.model.sysmodel_p.sysdevice"
            })
        }
 
        $scope.tabs = $scope.tabs.concat([
            { 
                title: "tab.t11",
                icon: "icon icon-tag",
                state: "app.model.sysmodel_p.systag"
            },

            {
                title: "tab.t13",
                icon: "icon icon-rocket",
                state: "app.model.sysmodel_p.trigger"
            },

            {
                title: "tab.t14",
                icon: "icon icon-flag",
                state: "app.model.sysmodel_p.message"
            }
        ]);
        if ($scope.sysmodel.mode == 1 && $scope.sysmodel.comm_type == 2) {
            $scope.tabs.push({
                title: "tab.t15",
                icon: "glyphicon glyphicon-random",
                state: "app.model.sysmodel_p.gateway"
            });
        } 

        // tags , triggers,  message 对应的 prifile ;
        $scope.odp = {};
 


        $scope.loadProfilePromise = $source.$sysProfile.get( {system_model: $scope.sysmodel.uuid }).$promise;

        $scope.loadProfilePromise.then( function( resp ){
            $scope.profiles = resp.ret,
            $scope.hasProfile = !!resp.ret.length;
        })  
        // 控控制 tag , 触发器, 通知  在 systemodel ,
        $scope.isModelState = true;

 
  
        var loadSystemDevicePromise  ;
        $scope.loadSysDev = function(){ 

            if( ! loadSystemDevicePromise ){
              loadSystemDevicePromise =   $source.$sysDevice.get({system_model: $scope.sysmodel.uuid} ).$promise;
              loadSystemDevicePromise.then( function( resp ){
                    $scope.sysdevices = resp.ret ;   
                }); 
            }  
            return  loadSystemDevicePromise ;
        }  
 
        var loadAllDeviceModelsPromise ; 
        $scope.loadDevModels = function(){
            if(  !loadAllDeviceModelsPromise ){
               loadAllDeviceModelsPromise =  $source.$deviceModel.get( ) .$promise;
               loadAllDeviceModelsPromise.then(function( resp ){
                    $scope.devmodels = resp.ret; 
                });
            }
            return loadAllDeviceModelsPromise;

        }
 

    }
) 

.controller("sysmodel_basic", function($scope, $source, $state) {


    $scope.$popNav($scope.sysmodel.name + "(信息)", $state);
 

})

.controller("sysmodel_device",
    function($scope, $sessionStorage, $source, $modal, $sys, $state) {

        $scope.$popNav($scope.sysmodel.name + "(设备)", $state);
 
        var sysmodel = $scope.sysmodel ;

        var  t = $scope;

        // 得到suoyou sysmode 下的 sysDevice ; 
        $scope.loadSysDev().then( function( resp){ 
             //@if  append 
                console.log(" 该方法 使 父 scope 中 定义了  sysdevices  ");
             //@endif 
        }); 
 
        // 转换 devModel 为 kv 格式; 回显 sysdevice 因用的那个devicemodel; 
        $scope.devModelKV = {};  // 用来列出 设备模版 下拉表;

        $scope.loadDevModels().then( function(){
            $.each( $scope.devmodels , function(i, v, t) {
                $scope.devModelKV[v.uuid] = v;
            });
        });
  

        $scope.addOrEditDevice = function(devices, index, dev) {
            $modal.open({
                templateUrl: "athena/sysmodel/add_sysdevice.html",
                resolve: {
                    data: function() { 
                        return $scope.loadDevModels(); 
                    }
                },
                controller: function($scope, $modalInstance, data) {

                    $scope.$modalInstance = $modalInstance;

                    $scope.__proto__ = t, 
                    $scope.isAdd = !dev  ,
                    $scope.devModels =  $scope.devmodels ; 

                    // gateway 网络参数 过滤;  bool 是否初始化 params 值; 
                    $scope.filterChannel = function(type, bool) {

                        $scope._$channel = t.sysmodel.gateway_default[type];
                        if (bool ) {
                            var d ; 
                            if( type == "ETHERNET"){
                                d = "LAN_1";
                            }else{
                                if( $scope._$channel ){
                                    d = Object.keys($scope._$channel)[0];
                                }else{
                                    d = null ;
                                }
                            }
                            $scope.D.network.params = {  channel: d  };
                        }
                    }


                    if ($scope.isAdd) { // 新建; 

                        $scope.devModel = $scope.devModelKV[Object.keys($scope.devModelKV)[0]];
 
                        if (!$scope.devModel) {
                            $scope.alert({
                                type: "info",
                                title: "请先创建设备模型!"
                            }) 
                            throw ("_Error: No Device Model !");

                        }

                        // 初始化D; 
                        $scope.D = angular.extend({
                                device_model: $scope.devModel.uuid
                            },
                            $sys.device.entity,
                            angular.copy($sys.device[$scope.devModel.driver_id].entity)
                        );

                        // 托管; gateway模式; 
                        if ($scope.sysmodel.mode == 1 && $scope.sysmodel.comm_type == 2) {
                            $scope.D.network = {
                                type: "RS232"
                            };
                        }

                    } else {
                        dev.network = angular.fromJson(dev.network || {});
                        dev.params = angular.fromJson(dev.params || {});

                        $scope.D = angular.copy(dev);
                        $scope.devModel = $scope.devModelKV[$scope.D.device_model];

                    }

                    // 缓存 操作; 的配置; 
                    var cache = {};
                    $scope.$watch("D.device_model", function(n, o) {

                        var a, b;
                        a = $scope.devModelKV[n].driver_id;
                        b = $scope.devModelKV[o].driver_id;
                        if (a != b) {
                            // 缓存驱动 params ;    
                            //cache[a] =  angular.copy( $scope.D.params );  

                            // 驱动参数赋值;
                            angular.extend($scope.D, $sys.device[a].entity);
                            $scope.devModel = $scope.devModelKV[n];
                        }

                    })



                    // 添加 sysmodel device ;
                    $scope.done = function(btn) {
                        // 验证表格;
                        $scope.validForm();
                        var d = angular.copy($scope.D);

                        d.system_model = $scope.sysmodel.uuid,
                            d.params = angular.toJson(d.params),
                            d.network = angular.toJson(d.network);

                        if ($scope.isAdd) {
                            $source.$sysDevice.save(d, function(resp) {

                                d.id = resp.ret;
                                $scope.sysdevices.push(d);
                                $scope.cancel();

                            })

                        } else {
                            $source.$sysDevice.put(d, function(resp) {

                                devices[index] = d;
                                $scope.cancel();

                            })
                        };
                    }; 
                }
            })
        }


        $scope.deleteSysD = function(scope, index, sysd) {
            $scope.confirmInvoke({ 
                title: "删除系统设备: " + sysd.name + " ?" 
            }, function(next) {
                $source.$sysDevice.delete({
                    system_model: sysmodel.uuid,
                    id: sysd.id
                }, function() {
                    $scope.sysdevices.splice(index, 1);
                    next();
                }, next)
            })
        }
    }
)

 
.controller("sysmodel_tag",  function($scope, $source, $modal, $q, $utils, $sys, $state ,
        $timeout , $q) { 
        $scope.$popNav($scope.sysmodel.name + "(Tags)", $state);


        //@if  append

        console.log(" sysmodel_tag"); 
        //@endif   
 

        var sysmodel = $scope.sysmodel, // $scope.$$cache[0],
            t = $scope;
        t.isManageMode = sysmodel.mode == $sys.manageMode;

        // 拆分 connect 字段;
        // connect 回显 ;  device id ( 整合成 kv形式)--> 得到 demodel( ) --> 再去加载point数据;
        var cc;
        $scope.splictC = function(tag, $last) {
            cc = tag.connect.split('.');
            tag.dev_id = cc[0], 
            tag.point_id = cc[0];
        };


       
        // 加载 tag ;  
       
        var dev_id , dev_ref ;  
        $scope.getDevName = function(tag , scope ){ 
            
                dev_id = tag.connect.replace(/(\d+).(\d+)/, "$1") ; 

                dev_ref = $scope.devicesKV[dev_id],
               // 是否真的连接了设备, dev_name 来判断; 
                scope.dev_name = dev_ref && dev_ref.name ;

                // 不连接设备时 ,  Type 忽略显示; 
                tag.type= scope.dev_name?tag.type:null ;

                
                //@if  append
                  console.log(" 查找 dev name =" , scope.dev_name );
                //@endif  
 
        }


        
        //  manage 模式时 ,  tag 的编辑, 新建; 增加 dev , devModelPoint 联动;
        function ApplyDevPoint(scope) {
            var oldDevModel ;

            scope.op = {};

            //zai 父scope中添加 sysdevices ; 
            var promise =  $scope.loadSysDev() ; 
 

            scope.loadPoint = function  (dev) {
                if (!dev) return;
                if (dev.device_model == oldDevModel) return;
                oldDevModel = dev.device_model;

                var promise ; 
                promise = $source.$dmPoint.get({ device_model: oldDevModel }).$promise;

                promise.then(function  (resp) {
                    $scope.points = resp.ret;
                }) 
                return promise ; 
            };

            // 拼接  connnet  字段;
            scope.addConnect = function(tag) { 
                tag.connect = scope.op.dev.id + "." + scope.op.point.id; 

            };

            return promise;
        }



        // 组织 device 的kv 形式;
        $scope.loadSysDev().then( function(){
                //  // 加载 sys device ;  放到下面发昂只 deivice 增删时, devKV 跟着改变; 
                $scope.devicesKV={};
                $scope.sysdevices.forEach( function(v,i){
                    $scope.devicesKV[v.id] = v ; 
                });
        })


        // $scope.prof_uuid = 111
        // profile ng-chage ;   tag 比较特殊 没profile 也可以创建; 
        $scope.loadSysTag = function(prof_uuid) {
            // { profile_id: $scope.profile } 
            if (prof_uuid) {
                // 有profile时 ; 去检索是否连接了设备; 
                var    promise_tag    = $source.$sysLogTag.get({ profile: prof_uuid }).$promise ;
                $q.all([ promise_tag , $scope.loadSysDev() ]).then( function( resp ){
                    $scope.systags = resp[0].ret;
                }) 
            } else {
                // query ; 无profile时 ;  跟定不连接  设备;  
                $source.$sysTag.get({
                    system_model: sysmodel.uuid
                }, function(argument) {
                    $scope.systags = argument.ret;
                })
            }
        }

        // 加载 点; 
        $scope.odp = {};
  
        $scope.loadProfilePromise.then(function() {
            $scope.odp.puuid = $scope.odp.puuid || $scope.profiles[0] && $scope.profiles[0].uuid;
            $scope.loadSysTag($scope.odp.puuid);
        });


        // tag 的 创建, 编辑 , 删除;
        $scope.addTag = function() {

            if (!$scope.profiles.length) { 
                angular.alert("请先创建系统配置!"); 
                // $state.go('app.model.sysprofile');
                return;
            }

            $modal.open({
                templateUrl: "athena/sysmodel/add_systag.html",
                controller: function($scope, $modalInstance) {
 
                    if (t.isManageMode) {  // 托管模式;  
                        ApplyDevPoint($scope);
                    }

                    $scope.$modalInstance = $modalInstance,
                        $scope.__proto__ = t,
                        $scope.isAdd = true,

                        $scope.T = {
                            type: "Number"
                        },
                        $scope.L = {};

                    $scope.done = function() {
                        // 验证表格;
                        $scope.validForm("form_tag"), 
                        $scope.validForm("form_log"),

                        $scope.T.system_model = sysmodel.uuid;

                        $scope.addConnect && $scope.addConnect($scope.T);

                        // 组装 connect 字段 的值;
                        // 先保存点, 在保存log数据; 
                        $source.$sysTag.save($scope.T, function(resp) {
 

                            function call() {
                                var d;
                                if (t.hasProfile) {
                                    d = angular.extend($scope.T, $scope.L);
                                } else { 
                                    d = angular.extend($scope.T, { id: resp.ret }) 
                                }
                                $scope.systags.push(d);
                                $scope.cancel();
                            }


                            if (t.hasProfile) { // 日志参数; 
                                $scope.L.id = resp.ret, 
                                $scope.L.profile = t.odp.puuid,
                                $scope.L.save_log = $scope.L.log_cycle ? 1 : 0; 
                                $source.$sysLogTag.save($scope.L, call);
                            } else {
                                call()
                            }
                        });
                    };
                }
            });
        }
 
        // 编辑点; 
        $scope.updateTag = function(index, tag , scope ) {
            $modal.open({
                templateUrl: "athena/sysmodel/add_systag.html",
                controller: function($scope, $modalInstance) {
                    var a, b, c, d, dd, dt; 

                    $scope.$modalInstance = $modalInstance,
                    $scope.__proto__ = t,
                    $scope.T = a = angular.copy(tag);
                    $scope.true_conn = scope.true_conn; 

                    // dev , point 回显 待定;  conncet 是 id 还是那么;
                    d = a.connect.split("."),
                        dd = d[0],
                        dt = d[1];
 
                    if (t.isManageMode) { // 托管模式;
                        ApplyDevPoint($scope).then(function( ) {
                            
                            // 回显 devmodel , point ;
                            $scope.op.dev = $scope.sysdevices.filter (function(v, i) {
                                                return v.id == dd
                                            })[0] || undefined,


                            $scope.op.dev && $scope.loadPoint($scope.op.dev).then( function(){
                                $scope.op.point = $scope.points.filter( function(v,i){
                                                    return  v.id == dt 
                                                })[0] || undefined  
                            }); 
                             
                        })
                    }



                    $scope.done = function() { 
                        // 验证表格; 
                        $scope.validForm("form_tag");

                        var d = $utils.copyProp(a, 'system_model', 'id', 'name', 'type', 'desc');

                        $scope.addConnect && $scope.addConnect(d);

                        $source.$sysTag.put(d, function(resp) {
                            // 连接上了 设备; 
                            scope.$parent.true_conn = true;  
                            scope.$parent.dev_name =  $scope.devicesKV[ $scope.op.dev.id ].name ;
 
                            angular.extend(tag, d);
                            $scope.cancel();
                        })
                    }
                }
            })
        }

        $scope.deleteTag = function(index, tag) {
            //@if  append

            console.log("deleteTag");
            //@endif 
            $scope.confirmInvoke({ 
                title: "删除模型变量 : " + tag.name + " ?",
                warn: "该点在各个配置项中的信息也将被删除!" 
            }, function(next) {
                $source.$sysTag.delete({
                    system_model: sysmodel.uuid,
                    id: tag.id
                }, function(resp) {
                    $scope.systags.splice(index, 1);
                    next();
                }, next)
            })
        }

        //==================================================================

        // profile Tag 的 创建 , 编辑 删除;
        $scope.add_update_Log = function(index, tag) {

            if (!t.hasProfile) { 
                angular.alert("请先创建 系统配置!"); 
                $state.go('app.model.sysprofile');
                return;
            }

            $modal.open({
                templateUrl: "athena/sysmodel/add_log_tag.html",
                controller: function($scope, $modalInstance) {

                    var a, b, c, d;

                    $scope.$modalInstance = $modalInstance,
                        $scope.__proto__ = t,
                        $scope.L = a = angular.copy(tag),
                        $scope.hasLog = b = tag.profile;
 
                    $scope.done = function() {  
                          $scope.validForm("form_tag"), 
                        $scope.L.save_log = $scope.L.log_cycle ? 1 : 0;
                        $scope.L.id = tag.id;

                        d = {
                            id: a.id,
                            tp_desc: a.tp_desc,
                            //profile: t.odp.puuid, //profile  read-only
                            unit: a.unit,
                            scale: a.scale,
                            deviation: a.deviation,
                            save_log: a.save_log,
                            log_cycle: a.log_cycle,
                            log_type: a.log_type
                        };

                        // 更新;
                        if (b) {
                            d.profile = a.profile;
                            $source.$sysLogTag.put(d, function() {
                                angular.extend(tag, d);
                            })
                        } else { // 新建 log ;
                            d.profile = t.odp.puuid;
                            $source.$sysLogTag.save(d, function() {
                                angular.extend(tag, d);
                            })
                        }
                        $scope.cancel();
                    }
                }
            });
        }
 


    }
)


.controller("sysmodel_profile",
    function($scope, $source, $modal, $filter, $state) {
        $scope.$popNav($scope.sysmodel.name + "(Profile)", $state);
        //@if  append

        console.log(" sysmodel_profile");
        //@endif 
        var sysmodel = $scope.sysmodel,
            t = $scope;

        $scope.addSysProfile = function() {
            $modal.open({
                templateUrl: "athena/sysmodel/add_sysprofile.html",
                controller: function($scope, $modalInstance) {
                    $scope.$modalInstance = $modalInstance,
                        $scope.__proto__ = t,
                        $scope.P = {},
                        $scope.isAdd = true;

                    $scope.done = function() {
                        // 验证表格;
                        $scope.validForm();
                        $scope.P.system_model = sysmodel.uuid;

                        $source.$sysProfile.save($scope.P, function(resp) {
                            $scope.P.uuid = resp.ret;
                            //$scope.p.create_time = $filter("date")( new Date() , '2015-07-07T00:33:54.000Z' )  ;
                            // $scope.p.create_time =  $filter("date")( new Date() , 'yyyy-MM-07T00:33:54.000Z' )  ;
                            $scope.profiles.push($scope.P); 
                            $scope.__proto__.$parent.hasProfile = true ; 
                            $scope.cancel();
                        })
                    }
                }
            })
        }

        $scope.updateSysProfile = function(s, i, p) {
            $modal.open({
                templateUrl: "athena/sysmodel/add_sysprofile.html",
                controller: function($scope, $modalInstance) {
                    $scope.__proto__ = t,
                        $scope.$modalInstance = $modalInstance,
                        $scope.P = {
                            uuid: p.uuid,
                            name: p.name,
                            desc: p.desc
                        };
                    var d = $scope.P;
                    $scope.done = function() {
                        $source.$sysProfile.put(d, function(resp) {
                            p.name = d.name,
                                p.desc = d.desc;
                            $scope.cancel();
                        })

                    }
                }
            });
        }

        $scope.deleteSysProfile = function(s, i, p) {
            $scope.confirmInvoke({ 
                title: "删除配置项: " + p.name + " ?" 
            }, function(n) {
                $source.$sysProfile.delete({
                    uuid: p.uuid
                }, function() {
                    $scope.profiles.splice(i, 1); 
                    $scope.$parent.hasProfile = !!$scope.profiles.length ; 
                    n();
                }, n)
            })
        }
    }
)


.controller("sysmodel_prof_trigger",
    function($scope, $source, $modal, $state , $q ) {

        $scope.$popNav($scope.sysmodel.name + "(触发器)", $state);

        var sysmodel = $scope.sysmodel,
            S = $scope;
            // tags_nv,
            // tags_arr;


        $scope.byte = 32; // 32 位 报警;


        // 加载 Tag 数据; ; 
         
        var loadTagPromise =  $source.$sysTag.get({ system_model: sysmodel.uuid }).$promise ;
         
        loadTagPromise.then( function( resp ){
           $scope.tags_arr = resp.ret; 
           $scope.tags_nv = {}; 
           $scope.tags_arr.forEach(function(v, i, ar) {
               $scope.tags_nv[v.name] = v;
           }); 
        })

        function  condition_parmas_tojson  ( x ){
            x.conditions = angular.fromJson(x.conditions);
            x.params = angular.fromJson( x.params);
        }


        // 加载triger ; 
        // var lose_tag = { 'background-color':'grey' };
        $scope.loadTriggers = function(prof_uuid) {
            if (!prof_uuid) return;
            $q.all([
                $source.$sysProfTrigger.get({ profile: prof_uuid }).$promise ,
                loadTagPromise
            ]).then( function( resp ){  
                $scope.triggers = resp[0].ret;
                $scope.triggers.forEach( function( t ){ 
                    condition_parmas_tojson(t);
                    // 检查tag是否存在; 
                    
                    angular.isArray( t.conditions ) && t.conditions.forEach( function( v ){
                        var left = v.exp.left ,
                            right = v.exp.right ; 
                        if( left.fn =="PV" && !$scope.tags_nv[left.args]){
                           left.args = null ; 
                          // t.lose_tag = lose_tag ;

                        }   
                        if(right.fn =="PV" && !$scope.tags_nv[ right.args]){
                            right.args = null ; 
                            // t.lose_tag = true ;
                        }

                    }) 
                })  
            }) 
        }
 
  



        $scope.odp = {} ; 
        $scope.loadProfilePromise.then(function() {
            $scope.odp.puuid = $scope.odp.puuid || $scope.profiles[0] && $scope.profiles[0].uuid;
            $scope.loadTriggers($scope.odp.puuid);
        });



        $scope.deleteTrigger = function(i, t) {
            $scope.confirmInvoke({ 
                title: "删除触发器: " + t.name + " ?" 
            }, function(n) {
                $source.$sysProfTrigger.delete({
                    profile: t.profile,
                    id: t.id
                }, function(resp) {
                    $scope.triggers.splice(i, 1);
                    n();
                }, n)
            })
        }

        // 创建 , 编辑 触发器; 
        $scope.c_u_Trigger = function(add_OR_i, trigger) {
            if (!$scope.profiles.length) { 
                angular.alert("请先创建 系统配置!"); 
                $state.go('app.model.sysprofile');
                return;
            }

            $modal.open({
                templateUrl: "athena/sysmodel/add_proftrigger.html",
                size: "lg",
                controller: function($scope, $modalInstance, $source, $sys, $webWorker) {
                    var a, b, c, i;
                    $scope.isAdd = i = add_OR_i == 'create',
                        $scope.__proto__ = S,
                        $scope.$modalInstance = $modalInstance;

                    if (i) { // 创建;
                        $scope.T =a = {
                            profile: S.odp.puuid,
                            conditions: [angular.copy($sys.trigger_c)],
                            params: {}
                        };
                    } else {
                        $scope.T =a = angular.copy(trigger);  
                    }
  
                    $scope.done = function() {
                        var x = angular.copy( $scope.T ),
                            l, r,
                            tags = {};

                        // 收集 tags ;
                        angular.forEach(x.conditions, function(v, k) {
                            l = v.exp.left,
                                r = v.exp.right;

                            if (l.fn == "PV") {
                                tags[l.args] = true;
                            }
                            if (r.fn == "PV") {
                                tags[r.args] = true;
                            }

                        });

                        x.conditions = angular.toJson(x.conditions), 
                        x.params.tags = Object.keys(tags),
                        x.params = angular.toJson(x.params);



                        if (i) { // 新建;
                            $source.$sysProfTrigger.save(x, function(resp) {
                                condition_parmas_tojson(x);

                                x.id = resp.ret; 
                                $scope.triggers.push(x);
                                $scope.cancel();
                            })
                        } else { // 更新;
                            $source.$sysProfTrigger.put(x, function(resp) {
                                condition_parmas_tojson(x);

                                $scope.triggers[add_OR_i] = x;
                                $scope.cancel();
                            })
                        }
                    }

                    $scope.appendVerb = function() {
                        var verb = a.conditions.length ? $sys.trigger.verb_default : null;
                        a.conditions.push(angular.extend({
                            verb: verb
                        }, angular.copy($sys.trigger_c)));
                    }

                    $scope.delVerb = function(index) {
                        a.conditions.splice(index, 1);
                        if (0 == index)
                            a.conditions[0].verb = null;
                    }

                }
            })
        }

        // 显示 触发器的 condition ; 
        $scope.showCondi = function(trigger) {
            $modal.open({
                templateUrl: "athena/sysmodel/add_proftrigger.html",
                size: "lg",
                controller: function($scope, $modalInstance) {
                    $scope.__proto__ = S,
                        $scope.$modalInstance = $modalInstance;
                    var a, b, c, d, e;


                }
            })

        }

      

        // prof alarm  params  为报警时! 验证十六进制 数;
        var regex = /^[0-9a-fA-F]$/;
        $scope.cc = function($scope) {
            //位 报警时 才验证;
            if (!$scope.T.params) return;
            var byte = $scope.byte, // 位数;
                s = $scope.T.params,
                l = s.length,
                n = byte / 4;
            if (l > n) {
                $scope.T.params = s.substring(0, n).toUpperCase();
                return;
            }
            //验证字符合法;
            var char = s.charAt(l - 1);
            if (!regex.test(char)) {
                $scope.T.params = s.substring(0, l - 1).toUpperCase();
            } else {
                $scope.T.params = s.toUpperCase();
            }
        }

    }
)


.controller('sysmodel_message',
    function($scope, $source, $modal, $sys, $state) { // $source
        $scope.$popNav($scope.sysmodel.name + "(通知)", $state);

        var sysmodel = $scope.sysmodel,
            S = $scope,

            prof_triger = {}; // profile - trigger 缓存;



        $scope.loadMessages = function(prof_uuid) {
            if (!prof_uuid) return;
            $source.$message.get({
                profile_id: prof_uuid
            }, function(resp) {
                $scope.messages = resp.ret;
            })
        }

        // 加载 profile 下的 message ; 
        $scope.odp = {};
  
        $scope.loadProfilePromise.then(function() {
            $scope.odp.puuid = $scope.odp.puuid || $scope.profiles[0] && $scope.profiles[0].uuid;
            $scope.loadMessages($scope.odp.puuid);
        });

        // crate or  update ;
        $scope.createMessage = function(index, message) {
            //无配置项 不能创建;
            if (!$scope.profiles.length) { 
                angular.alert("请先创建 系统配置!"); 
                // $state.go('app.model.sysprofile');
                return;
            }
            // 无触发器 不能创建;
            $modal.open({
                templateUrl: "athena/sysmodel/add_message.html",
                resolve: {},
                controller: function($scope, $modalInstance, $sys) {
                    $scope.__proto__ = S,
                        $scope.$modalInstance = $modalInstance,
                        $scope.M = angular.copy(message || $sys.message.entity),
                        $scope.isAdd = !(index || index == 0);

                    $scope.op = {};

                    var puuid = $scope.odp.puuid,

                        triggers = prof_triger[puuid];


                    // 加载trigger ;
                    if (triggers) {
                        $scope.triggers = triggers;
                        cc();

                    } else {
                        $source.$sysProfTrigger.get({
                            profile: puuid
                        }, function(resp) {
                            var d = resp.ret;
                            prof_triger[puuid] = d;
                            $scope.triggers = d;
                            cc();
                        })
                    }

                    function cc() {
                        if ($scope.isAdd)
                            $scope.M.trigger_id = $scope.triggers[0] && $scope.triggers[0].id
                    }

                    $scope.done = function() {
                        $scope.validForm();


                        if ($scope.isAdd) {
                            $scope.M.profile = puuid;
                            $source.$message.save($scope.M, function(resp) {
                                $scope.M.message_id = resp.ret;
                                $scope.messages.push($scope.M);
                                $scope.cancel();
                            })
                        } else {
                            $source.$message.put($scope.M, function() {
                                $scope.messages[index] = $scope.M;
                                $scope.cancel();
                            })
                        }
                    }
                }
            })
        }

        $scope.deleteMessage = function(index, message) {

            $scope.confirmInvoke({
                warn: "移除通知 " + message.name + "?"
            }, function(next) {

                $source.$message.delete({
                    profile_id: message.profile,
                    message_id: message.message_id
                }, function() {
                    $scope.messages.splice(index, 1);
                    next();
                }, next)
            })
        }

    }
)


.controller('sysmodel_gateway',
    function($scope, $modal, $source, $state) { // $source   $source.$sysModel


        $scope.$popNav($scope.sysmodel.name + "(网关)", $state);

        var g = {
                distance: 100,
                baud_rate: 1200
            },
            S = $scope;


        S.GateWay = angular.copy($scope.sysmodel.gateway_default || {});;



        S.needUpdate = false,
            S.enbaleGPS = !!S.GateWay.GPS,
            S.canAddPort = 0;

        // 监视 还能否添加串口;
        S.$watch('GateWay', function(n, o) {
            var n = 0;
            angular.forEach(S.GateWay, function(v, i, t) {
                i != 'GPS' && (S.canAddPort = n++ == 7)
            })
        }, true)



        S.gpsChange = function() {
            S.enbaleGPS ? (
                S.GateWay.GPS = g
            ) : (
                g = S.GateWay.GPS,
                delete S.GateWay.GPS
            )
            S.needUpdate = true;
        }

        // geteway  串口类型 ;
        var types = S.$sys.gateway.types;

        S.c_u_Gateway = function(T, t, data) {
            $modal.open({
                templateUrl: "athena/sysmodel/add_gateway.html",
                controller: function($scope, $modalInstance) {

                    $scope.__proto__ = S,
                        $scope.$modalInstance = $modalInstance,

                        $scope.isAdd = !data,
                        // 串口 名称; key
                        $scope.G = {
                            t: t
                        },
                        // 串口数据 ; value ;
                        $scope.D = angular.copy(data || S.$sys.gateway.entity),

                        $scope.filterType = function() {
                            if (!$scope.isAdd) return;

                            var obj = {};
                            // { k:v , .. } k 小类 , v 大类  ;
                            angular.forEach(types, function(v, k, t) {
                                if (!(S.GateWay[v] && S.GateWay[v][k])) {
                                    obj[k] = v;
                                }
                            });
                            //@if  append

                            console.log("filterType", obj);
                            //@endif 
                            $scope.G.t = Object.keys(obj)[0];

                            $scope._$types = obj;
                        }
                    $scope.done = function() {
                        $scope.validForm();
                        t = t || $scope.G.t,
                            T = T || $scope._$types[t];

                        ($scope.GateWay[T] || ($scope.GateWay[T] = {}))[t] = $scope.D
                        S.needUpdate = true;
                        $scope.cancel();
                    }
                }
            })
        }

        S.cc = function() {
            S.needUpdate = true;
        }

        S.deleteGateway = function(T, t, data) {
            $scope.confirmInvoke({ 
                warn: "删除串口: " + t + " ?" 
            }, function(next) {
                delete S.GateWay[T][t];
                //S.sysmodel.gateway_default = S.GateWay ;
                S.needUpdate = true;
                next();
            })
        }

        S.saveGateWay = function() {
            $source.$sysModel.put({
                uuid: S.sysmodel.uuid,
                gateway_default: angular.toJson(S.GateWay)
            }, function(resp) {
                S.sysmodel.gateway_default = angular.copy(S.GateWay);
                S.haveSave = true;
                S.needUpdate = false;
            })
        }



    }
)

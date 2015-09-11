angular.module("app.model.system", [])
    .controller("sysmodel", ["$scope", '$modal', '$source', '$utils',
        function($scope, $modal, $source, $utils) { // $source.$sysModel


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
                    templateUrl: 'athena/views/sysmodel/add_sysmodel.html',
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
                                $scope.sm.uuid = resp.ret;
                                page.data.push($scope.sm);
                                page.total++;
                                $scope.cancel();
                            });
                        }
                    }
                })
            }

            $scope.deleteSM = function(index, sm) {
                $scope.confirmInvoke({
                    title: "删除系统模版" + sm.name + "?"
                }, function(next) {
                    $source.$sysModel.delete({
                        uuid: sm.uuid
                    }, function( resp ) {
                      if(!resp.err){
                        page.data.splice(index, 1);
                        page.total-- ;
                      }
                      next();
                    })
                })
            }

            $scope.updateSM = function(scope, index, sm) {
                $modal.open({
                    templateUrl: 'athena/views/sysmodel/add_sysmodel.html',
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



        }
    ])

.controller('sysmodelProp', ['$scope', '$source', '$q',
    function($scope, $source, $q) {


        var d = $scope.$$cache[0]


        try {
            d.gateway_default = angular.fromJson(d.gateway_default || {});
        } catch (e) {
            console.error("  SystemModel  gateway_default 字段 不合法!!");
        }

        $scope.sysmodel = d;

        var defer = $q.defer();

        // tags , triggers,  message 对应的 prifile ; 
        $scope.odp = {};

        $scope.loadProfilePromise = defer.promise;

        $source.$sysProfile.get({
            system_model: $scope.sysmodel.uuid
        }, function(resp) {
            $scope.profiles = resp.ret,
                $scope.hasProfile = !!resp.ret.length;
            defer.resolve();
        })

        // 控控制 tag , 触发器, 通知  在 systemodel ,
        $scope.isModelState = true;



    }
])


.controller("sysmodel_basic", function($scope, $source) {
    console.log("sysmodel_basic");
})

.controller("sysmodel_device", ['$scope', '$sessionStorage', '$source', '$modal',
    function($scope, $sessionStorage, $source, $modal) {
        console._log(" sysmodel_device");

        var sysmodel = $scope.sysmodel,
            t = $scope;

        // 得到suoyou sysmode 下的 sysDevice ;
        $source.$sysDevice.get({
            system_model: sysmodel.uuid
        }, function(resp) {
            $scope.sysdevices = resp.ret;

        })



        var devModelPromise = $source.$deviceModel.get().$promise;

        // 转换 devModel 为 kv 格式;
        $scope.devModelKV = {};
        devModelPromise.then(function(resp) {
            $.each(resp.ret, function(i, v, t) {
                $scope.devModelKV[v.uuid] = v;
            })
        })


        $scope.addOrEditDevice = function(devices, index, dev) {
            $modal.open({
                templateUrl: "athena/views/sysmodel/add_sysdevice.html",
                resolve: {
                    data: function() {
                        return devModelPromise;
                    }
                },
                controller: function($scope, $modalInstance, data) {

                    $scope.$modalInstance = $modalInstance;

                    $scope.__proto__ = t,
                        $scope.isAdd = !dev,
                        $scope.devModels = data.ret;

                    if ($scope.isAdd) {
                        var d = Object.keys($scope.devModelKV)[0];
                        $scope.D = {
                            device_model: d,
                            network: {
                                type: "RS232",
                                params: {
                                    channel: "RS232_1"
                                }
                            }
                        };
                    } else {
                        dev.network = angular.fromJson(dev.network || {});
                        dev.params = angular.fromJson(dev.params || {});

                        $scope.D = angular.copy(dev);
                    }

                    $scope.$watch('D.device_model', function(n, o) {
                        $scope.devModel = $scope.devModelKV[n];
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
                            $source.$sysDevice.put(d, function() {
                                devices[index] = d;
                                $scope.cancel();
                            })
                        };
                    };

                    $scope.filterChannel = function(type, bool) {
                        $scope._$channel = t.sysmodel.gateway_default[type];
                        if (bool) {
                            var d = type == 'ETHERNET' ? 'LAN_1' : Object.keys($scope._$channel)[0];
                            $scope.D.network.params = {
                                channel: d
                            };
                        }
                    }
                }
            })
        }


        $scope.deleteSysD = function(scope, index, sysd) {
            $scope.confirmInvoke({
                title: "删除系统设备" + sysd.name + " ?"
            }, function(next) {
                $source.$sysDevice.delete({
                    system_model: sysmodel.uuid,
                    id: sysd.id
                }, function() {
                    $scope.sysdevices.splice(index, 1);
                    next();
                })
            })
        }
    }
])


.controller("sysmodel_tag", ['$scope', '$source', "$modal", "$q", "$utils", "$sys", '$state',
    function($scope, $source, $modal, $q, $utils, $sys, $state) {

        console._log(" sysmodel_tag");
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
        }



        var oldDevModel;
        //  manage 模式时 ,  tag 的编辑, 新建; 增加 dev , devModelPoint 联动;
        function ApplyDevPoint(scope) {

            scope.op = {};

            $source.$sysDevice.get({
                system_model: sysmodel.uuid
            }, function(resp) {
                scope.devices = resp.ret;
            });

            scope.loadPoint = function a1(dev) {
                if (dev.device_model == oldDevModel) return;
                oldDevModel = dev.device_model;
                $source.$dmPoint.get({
                    device_model: oldDevModel
                }, function a2(resp) {
                    $scope.points = resp.ret;
                })
            };

            // 拼接  connnet  字段;
            scope.addConnect = function(tag) {
                tag.connect = scope.op.dev.id + "." + scope.op.point.id;

            };

        }

        // $scope.prof_uuid = 111
        // profile ng-chage ;   tag 比较特殊 没profile 也可以创建;
        $scope.loadSysTag = function(prof_uuid) {
            // { profile_id: $scope.profile }

            if (prof_uuid) {
                $source.$sysLogTag.get({
                    profile: prof_uuid
                }, function(resp) {
                    $scope.systags = resp.ret;
                })
            } else {
                // query ; 无profile时 ;
                $source.$sysTag.get({
                    system_model: sysmodel.uuid
                }, function(argument) {
                    $scope.systags = argument.ret;
                })
            }
        }

        // 加载 点;
        $scope.loadProfilePromise.then(function() {
            $scope.odp.puuid = $scope.odp.puuid || $scope.profiles[0] && $scope.profiles[0].uuid;
            $scope.loadSysTag($scope.odp.puuid);
        });


        // tag 的 创建, 编辑 , 删除;
        $scope.addTag = function() {

            if (!$scope.profiles.length) {
                alert("请先创建 系统配置!");
                // $state.go('app.model.sysprofile');
                return;
            }

            $modal.open({
                templateUrl: "athena/views/sysmodel/add_systag.html",
                controller: function($scope, $modalInstance) {

                    if (t.isManageMode) {
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

                        $source.$sysTag.save($scope.T, function(resp) {

                            function call() {
                                var d;
                                if (t.hasProfile) {
                                    d = angular.extend($scope.T, $scope.L);
                                } else {
                                    d = angular.extend($scope.T, {
                                        id: resp.ret
                                    })
                                }
                                console.log(d);
                                $scope.systags.push(d);
                                $scope.cancel();
                            }


                            if (t.hasProfile) {
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

        $scope.updateTag = function(index, tag) {
            $modal.open({
                templateUrl: "athena/views/sysmodel/add_systag.html",
                controller: function($scope, $modalInstance) {
                    var a, b, c;
                    if (t.isManageMode) {
                        ApplyDevPoint($scope);
                    }

                    // dev , point 回显 待定;  conncet 是 id 还是那么;
                    $scope.op = {
                        dev: 1
                    };

                    $scope.$modalInstance = $modalInstance,
                        $scope.__proto__ = t,
                        $scope.T = a = angular.copy(tag);
                    $scope.done = function() {
                        // 验证表格;
                        $scope.validForm();
                        var d = $utils.copyProp(a, 'system_model', 'id', 'name', 'type', 'desc');
                        $scope.addConnect && $scope.addConnect(d);
                        $source.$sysTag.put(d, function(resp) {
                            angular.extend(tag, d);
                            $scope.cancel();
                        })
                    }
                }
            })
        }

        $scope.deleteTag = function(index, tag) {
            console._log("deleteTag");
            $scope.confirmInvoke({
                title: "删除系统模版点" + tag.name + " ?",
                warn: "其他系统配置项对该点的控制也将被删除!"
            }, function(next) {
                $source.$sysTag.delete({
                    system_model: sysmodel.uuid,
                    id: tag.id
                }, function(resp) {
                    $scope.systags.splice(index, 1);
                    next();
                })
            })
        }

        //==================================================================

        // profile Tag 的 创建 , 编辑 删除;
        $scope.add_update_Log = function(index, tag) {

            if (!t.hasProfile) {
                alert("请先创建 系统配置!");
                $state.go('app.model.sysprofile');
                return;
            }

            $modal.open({
                templateUrl: "athena/views/sysmodel/add_log_tag.html",
                controller: function($scope, $modalInstance) {

                    var a, b, c, d;

                    $scope.$modalInstance = $modalInstance,
                        $scope.__proto__ = t,
                        $scope.L = a = angular.copy(tag),
                        $scope.hasLog = b = tag.profile;

                    $scope.done = function() {
                        $scope.validForm();
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


        $scope.addProfile = function() {
            alert("新建 profile !");
        }



    }
])


.controller("sysmodel_profile", ['$scope', '$source', '$modal', '$filter',
    function($scope, $source, $modal, $filter) {

        console._log(" sysmodel_profile");
        var sysmodel = $scope.sysmodel,
            t = $scope;

        $scope.addSysProfile = function() {
            $modal.open({
                templateUrl: "athena/views/sysmodel/add_sysprofile.html",
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
                            $scope.cancel();
                        })
                    }
                }
            })
        }

        $scope.updateSysProfile = function(s, i, p) {
            $modal.open({
                templateUrl: "athena/views/sysmodel/add_sysprofile.html",
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
                title: "删除配置项" + p.name + " ?"
            }, function(n) {
                $source.$sysProfile.delete({
                    uuid: p.uuid
                }, function() {
                    $scope.profiles.splice(i, 1);
                    n();
                })
            })
        }
    }
])


.controller("sysmodel_prof_trigger", ['$scope', '$source', '$modal', '$state',
    function($scope, $source, $modal, $state) {

        console._log(" sysmodel_prof_trigger ");
        var sysmodel = $scope.sysmodel,
            S = $scope,
            tags_nv,
            tags_arr;


        $scope.byte = 32; // 32 位 报警;

        $scope.loadTriggers = function(prof_uuid) {
            // { profile_id: $scope.profile }

            if (!prof_uuid) return;
            $source.$sysProfTrigger.get({
                profile: prof_uuid
            }, function(resp) {
                $scope.triggers = resp.ret;
            })
        }

        $scope.loadProfilePromise.then(function() {
            $scope.odp.puuid = $scope.odp.puuid || $scope.profiles[0] && $scope.profiles[0].uuid;
            $scope.loadTriggers($scope.odp.puuid);
        });



        $scope.deleteTrigger = function(i, t) {
            $scope.confirmInvoke({
                title: "删除触发器" + t.name + " ?"
            }, function(n) {
                $source.$sysProfTrigger.delete({
                    profile: t.profile,
                    id: t.id
                }, function(resp) {
                    $scope.triggers.splice(i, 1);
                    n();
                })
            })
        }

        $scope.c_u_Trigger = function(add_OR_i, trigger) {
            if (!$scope.profiles.length) {
                alert("请先创建 系统配置!");
                $state.go('app.model.sysprofile');
                return;
            }

            $modal.open({
                templateUrl: "athena/views/sysmodel/add_proftrigger.html",
                size: "lg",
                controller: function($scope, $modalInstance, $source, $sys, $webWorker) {
                    var a, b, c, i;
                    $scope.isAdd = i = add_OR_i == 'create',
                        $scope.__proto__ = S,
                        $scope.$modalInstance = $modalInstance;

                    if (i) { // 创建;
                        $scope.T = a = {
                            profile: S.odp.puuid,
                            conditions: [angular.copy($sys.trigger_c)],
                            params: {}
                        };
                    } else {
                        a = angular.copy(trigger),
                            a.conditions = angular.fromJson(a.conditions),
                            a.params = angular.fromJson(a.params);
                        console.log(a)

                        $scope.T = a;
                    }


                    // 加载 tags ; 由 [ {tag}, ,,]  转换为 {tagNanme:tag , ...  } 形式;
                    if (!tags_nv) {
                        $source.$sysTag.get({
                            system_model: sysmodel.uuid
                        }, function(resp) {
                            $scope.tags_arr = tags_arr = resp.ret;

                            tags_nv = {};

                            tags_arr.forEach(function(v, i, ar) {
                                tags_nv[v.name] = v;
                            });

                            $scope.tags_nv = tags_nv;
                        })
                    } else {
                        $scope.tags_nv = tags_nv;
                        $scope.tags_arr = tags_arr;
                    }


                    // 验证 左右参数是否合法; ,
                    // 收集 tags ; 


                    $scope.done = function() {
                        var x = angular.copy(a),
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
                                x.id = resp.ret;
                                $scope.triggers.push(x);
                                $scope.cancel();
                            })
                        } else { // 更新;
                            $source.$sysProfTrigger.put(x, function(resp) {
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

        $scope.showCondi = function(trigger) {
            $modal.open({
                templateUrl: "athena/views/sysmodel/add_proftrigger.html",
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
])


.controller('sysmodel_message', ['$scope', '$source', '$modal', "$sys",
    function($scope, $source, $modal, $sys) { // $source

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
        $scope.loadProfilePromise.then(function() {
            $scope.odp.puuid = $scope.odp.puuid || $scope.profiles[0] && $scope.profiles[0].uuid;
            $scope.loadMessages($scope.odp.puuid);
        });

        // crate or  update ;
        $scope.createMessage = function(index, message) {
            //无配置项 不能创建;
            if (!$scope.profiles.length) {
                alert("请先创建 系统配置!");
                // $state.go('app.model.sysprofile');
                return;
            }
            // 无触发器 不能创建; 
            $modal.open({
                templateUrl: "athena/views/sysmodel/add_message.html",
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
                })
            })
        }

    }
])


.controller('sysmodel_gateway', ['$scope', '$modal', '$source',
    function($scope, $modal, $source) { // $source   $source.$sysModel

        console._log($scope.sysmodel);


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
                templateUrl: "athena/views/sysmodel/add_gateway.html",
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
                            console._log("filterType", obj);
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
                warn: "删除串口 " + t + " ?"
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
])

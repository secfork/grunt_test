// dastation  配置  网关离线报警:开:  配置 form 的控制器   das_conf_gateway 写死在 模版上!!!
//       关:  设备, 日志, .... 网关配置; 的各个控制器 写死在 模版上;


// controller  分的太细了 ! 完全可以合并 部分 controller ;



angular.module('app.system.prop', [])
    .controller("dastation_prop", function($scope, $state, $source,
        $stateParams) {

        console._log("dastation_prop");

        // $stateParams.state =="unactive"  时  需要激活 station ;

        // 改变 station 会自动存到 sessionstorage ; AppScope.$watch("$$cache", fun... ,  true)
        $scope.station = $scope.$$cache[0];


        // 未激活的采集站 处理 ;
        $scope.setActive = function() {
            $scope.activateStation($scope, null, $scope.station, null, "updata");
        };

        // 得到systemModel 数据 ; 便于配置 gateway , network ;
        $source.$sysModel.getByPk({
            pk: $scope.station.model
        }, function(resp) {
            // sysmodel ;
            $scope.sysmodel = resp.ret;

            // 转换 sysmodel Device = [{}], 为 k-v 形式; 便于 回显;
            $scope.deviceKV = {};
            $scope.sysmodel.devices.forEach(function(v, i, t) {
                this[v.id] = v.name;
            }, $scope.deviceKV);

            console._log($scope.sysmodel);

        });
 

        // 获得文件路径;
        $scope.op = {rightfile:true};
        $scope.setFiles = function(element) { 
            $scope.canupload = true;
            $scope.$apply(function($scope) {

                console._log(element.files);
                // Turn the FileList object into an Array   form 中家 multiple  就是多文件上传;
                $scope.files = [];
 
                var file = element.files[0];

 

                // 值上传 第一个; 单位 B ;  // 1G
                // $scope.rightfile = (element.files[0].size < 10240000);
                //   /.[png,jpg]$/.test( file.name ) &&
                $scope.op.rightfile =   ( file.size < 1024*500); //2M ; 



                // $scope.showmsg = !$scope.rightfile;
                if ($scope.op.rightfile) {
                    $scope.files.push(element.files[0]) //  文件路径;
                }
            });
        };


        $scope.uploadFile = function() {

            $scope.progress = 1;
 

            var fd = new FormData();
            // for (var i in $scope.files) {
            fd.append("uploadedFile", $scope.files[0])
                // } ;
                // 添加参数;
           // fd.append("filename", $scope.files[0].name );
            fd.append("system_id", $scope.station.uuid );

            var xhr = new XMLHttpRequest();


            xhr.upload.addEventListener("progress", uploadProgress, false);
            xhr.addEventListener("load", uploadComplete, false);

            //  xhr.addEventListener("error", uploadFailed, false) ;
            //  xhr.addEventListener("abort", uploadCanceled, false) ;

            xhr.open("POST",  angular.rootUrl  + "picture/system");
            xhr.setRequestHeader("Accept" , 'application/json');

            $scope.progressVisible = true;
            xhr.send(fd);
        };


        // 上传完成;  刷新 fileregion 视图;
        function uploadComplete(evt) {
            try { 
                $scope.$apply( function(){
                    $scope.progressVisible = false ; 
                    $scope.station.pic_url =  angular.fromJson( evt.target.response ).ret;
                })
                

            } catch (e) {} 
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



 
        var temp_upload = function($scope, $$scope, $modalInstance) {
 
            $scope.file = {};
            $scope.progress = 1;
            $scope.showmsg = false; 



          


        };














    })

.controller("das_basic", function($scope, $filter, $state, $stateParams) {

    console._log(" das_basic ");
    console._log($stateParams, $state); // $stateParams.dastationid


    //  堆叠 导航;
    $scope.$popNav($scope.station.name + "(状态)", $state);


})



.controller("das_config", ['$scope', '$state', '$stateParams', '$source', "$modal",
    function($scope, $state, $stateParams, $source,   $modal) {

        console._log("das_config");
        console._log($stateParams);

        var S = $scope,
            needUpdate, hasSave;

        S.needUpdate = needUpdate = {},
            S.hasSave = hasSave = {};

        $scope.t = {} ;     

        // 生成 ticket ; 
        $scope.ticket = function(){
            // 先 写死 ticket 的 选前; 
            $scope.t.privilege = ['SYSTEM_MANAGE' , 'SYSTEM_CONTROL'];    

            $source.$ticket.save( { system_id: $scope.station.uuid  } ,
                                   $scope.t , function( resp ){
                if(resp.ret){
                    $scope.t.ticket = resp.ret ; 
                }                    
            })
        }

        $source.$ticket.get(  { system_id: $scope.station.uuid  } , function ( resp ){
            if( resp.ret){
                $scope.t =  resp.ret ;  
            }
        });


        // 控制 编辑按钮 显隐 ;
        function toUpdate(field) {
            needUpdate[field] = true;
            hasSave[field] = false;

        }

        function toSave(field) {
            needUpdate[field] = false;
            hasSave[field] = true;
        }

        $scope.toUpdate = toUpdate;
        $scope.toSave = toSave;
        //------

        $scope.$popNav($scope.station.name + "(配置)", $state);

        // var  network , gateway ;

        try {
            $scope.network = angular.fromJson($scope.station.network || {});
        } catch (e) {
            console.error(" system . network 字段 不是 json 格式", $scope.station.network);
        }

        try {
            $scope.gateway = angular.fromJson($scope.station.gateway || {});
        } catch (e) {
            console.error(" system . gateway  字段 不是 json 格式", $scope.station.gateway);
        }



        //========================================================================================
        // ================ 托管 -- Daserver类型;  , Dtu| tcpclient | ctpServer  模式 :
        //                                                    netwrok.dssever  ===================
        //   system.network.daserver  = {  network:{} ,daserver_id : 1024 }
        //========================================================================================
        // 托管 Daserver 类型; Dtu模式;
        $scope.initDaServer = function() {
            $scope.daserver = angular.copy(S.network.daserver || (S.network.daserver = {}))

        }


        // 托管 -- DaSErver类型 --Dtu 模式;  ;
        //  dtu驱动ng-change时 ;  dut_name  字段待定; v.name 待定;
        $scope.applyDtuData = function(params) { // params  =

            console.log("--组装 DAServer ,  dtu network --");

            params.port = undefined;
            params.cmway = undefined;
            $.each($scope.dtuList, function(i, v) {
                if (v.driver_id == params.driverid) {
                    console._log(" dtu 数据", i, v);
                    params.port = v.port;
                    params.cmway = v.cmway;
                    toUpdate('daserver');
                    return false;
                }
            })
        }


        // 加载支持的 dtu 驱动;
        $scope.loadSupportDtus = function() {
            if ($scope.dutList) return;
            $source.$driver.get( {type:"dtu"},function(resp) {

                $scope.dtuList =  resp.ret;
            });
        }

        //========================================================================================
        //======================================  profile =======================================
        //========================================================================================
        // 托管 | 非托管;  profile 更换操作
        // ; op 在 操作 system 的 profile 更改;


        $source.$sysProfile.get({
            system_model: $scope.station.model
        }, function(resp) {

            $scope.profiles = resp.ret;
            var p_uuid = $scope.station.profile;
            $.each($scope.profiles, function(i, v, t) {
                if (v.uuid == p_uuid) {
                    $scope.profile = v;
                }
            })
        })



        //========================================================================================
        //====================================== Gateway 模式 :   system.network.devices ================
        //========================================================================================
        // 托管 , gateway 类型; 初始化 network 下的devices ;
        $scope.initGatewayDevs = function() {
            var b = S.network.devices || (S.network.devices = []);
            $scope.gatewayDevs = angular.copy(b)
        }

        // 便于过滤 devs ;
        $scope.devRef = {};

        // 托管-- Gatwway类型 ;
        // 删除 gatewway dev , 删除 devRef 引用  ;
        $scope.delete_dev = function(gateway_devs, idnex, dev) {
            $scope.confirmInvoke({
                warn: "删除设备 " + $scope.deviceKV[dev.id] + "  的网络配置?"
            }, function(next) {
                gateway_devs.splice(idnex, 1);
                delete $scope.devRef[dev.id];
                // gateway Network 字段 更新;
                // update_+   $scope.gateweayDevs ;不要乱起名;
                toUpdate("gatewayDevs");
                next();
            });
        }

        // 托管  -- gatwway类型;
        // 添加|编辑  gateway类型的  network.device;  属性;
        // 添加  devfef 引用; 在 ng-repeat 中自动添加了;

        $scope.c_u_dev = function(gateway_devs, index, dev) {
            $modal.open({
                templateUrl: "athena/dastation/add_gateway_device.html",
                controller: function($scope, $modalInstance) {
                    $scope.__proto__ = S,
                        $scope.$modalInstance = $modalInstance,
                        $scope.isAdd = !dev,
                        $scope.dev = angular.copy(dev || {});

                    $scope.op = {};

                    $scope.done = function() {
                        $scope.validForm();
                        if ($scope.isAdd) {
                            gateway_devs.push($scope.dev);

                        } else {
                            gateway_devs[index] = $scope.dev;
                        }
                        // gateway Network 字段 更新;
                        toUpdate("gatewayDevs");
                        $scope.cancel();
                    }


                    // _$devs ;
                    $scope.filterDev = function() {
                        console._log("filte dev");
                        var arr = S.sysmodel.devices.filter(function(v, i, t) {
                            return !$scope.devRef[v.id];
                        })

                        // $scope._$devs = arr ;
                        $scope.dev.id = arr[0] && arr[0].id;
                        $scope._$devs = arr;
                    }

                    // _$channel ;
                    // bool 来判断是否 刷新 parmas ;
                    $scope.filterChannel = function(bool) {
                        var obj = {},
                            w = $scope.dev.type,
                            c;

                        if (w == 'ETHERNET') {
                            obj = {
                                LAN_1: null,
                                WLAN_1: null
                            };
                        } else {
                            angular.forEach(S.sysmodel.gateway_default, function(v, i, t) {
                                w == i && (obj = v);
                            })
                        }
                        bool && ($scope.dev.params = {
                            channel: Object.keys(obj)[0]
                        });
                        $scope._$channel = obj;
                    }
                }
            })
        }



        //========================================================================================
        //====================================== Gateway 模式  :  system.gateway   ;  ====================
        //========================================================================================
        // sysmodel 下默认的 gateway_default ;


        // 托管 -- gateway 类型;
        // 添加 | 编辑   gateway 类型的  gatwway 字段属性;

        $scope.c_u_way = function(T, t, way) {
            $modal.open({
                templateUrl: "athena/dastation/_prop_gateway_addgateway.html",
                controller: function($scope, $modalInstance) {

                    $scope.__proto__ = S,
                        $scope.$modalInstance = $modalInstance,

                        $scope.isAdd = !way;

                    var x = (way && way.dns && way.gateway) ? ('WLAN') : ('LAN');

                    $scope.op = {
                        T: T || 'ETHERNET',
                        t: t,
                        x: x,
                        way: angular.copy(way || {})
                    };

                    // 我去 ng-change 还不好使了;
                    // $scope.$watch('op.T' , function( n, o ){
                    //     $scope.way = {} ;
                    //     op.t = undefined ;
                    // })

                    $scope.done = function() {
                        $scope.validForm();
                        // 添加||编辑;
                        var op = $scope.op;
                        $scope.isAdd && (op.way.enable = false);
                        ($scope.gateway[op.T] || ($scope.gateway[op.T] = {}))[op.t] = $scope.op.way;
                        toUpdate('gateway');
                        $scope.cancel();

                    }
                }
            })
        }

        // 托管 -- gateway 类型;
        // 删除  gateway类型 中的 数据;
        $scope.del_way = function(T, t, way) {
            $scope.confirmInvoke({
                warn: " 删除网关 " + t + "?"
            }, function(next) {
                delete $scope.gateway[T][t]
                toUpdate('gateway');
                next();
            })
        }



        // c_u_dev



        //======================================================================
        //================================   保存 配置 ======================================
        //======================================================================

        // 更新 system :
        //                daserver模式 - nentwork  .  daserver ; (  $scope.daserver    )
        //                geteway模式 -  network   .  devices  ; (  $scope.gatewayDevs )
        //                gateway模式 -  gateway              ; ( $scope.gateway )
        //                 profile , ($scope.op.profile )
        // 字段;
        $scope.updateSystem = function(field) {
            $scope.validForm();

            var d = {
                uuid: $scope.station.uuid
            };

            function update(d) {
                return $source.$system.put(d).$promise;
            }

            if (field == 'gatewayDevs') {
                d.network = angular.toJson({
                    devices: $scope.gatewayDevs
                });
                update(d).then(function() {
                    toSave("gatewayDevs");
                    $scope.station.network = d.network;

                });
            }

            if (field == 'daserver') {
                d.network = angular.toJson({
                    daserver: $scope.daserver
                });
                update(d).then(function() {
                    toSave("daserver");
                    $scope.station.network = d.network;
                })
            }

            if (field == 'gateway') {
                d.gateway = angular.toJson($scope.gateway);
                update(d).then(function() {
                    toSave("gateway");
                    $scope.station.gateway = d.gateway;
                })
            }

            if (field == 'profile') {
                d.profile = $scope.profile.uuid;
                update(d).then(function() {
                    toSave("profile");
                    $scope.station.profile = d.profile;
                })
            }



        }


        //=============================================================================================
        //=============================================================================================
        //=============================================================================================

        $scope.d_stop = function() {
            $source.$system.stop({
                pk: $scope.station.uuid
            }, function(resp) {
                alert(angular.toJson(resp));
            });
        }
        $scope.d_call = function() {
            $source.$system.call({
                pk: $scope.station.uuid
            }, {}, function(resp) {
                alert(angular.toJson(resp));
            });
        }

    }
])


.controller('das_tag', ['$scope', '$source', '$state', function($scope, $source, $state) {

    var station = $scope.station;

    $scope.$popNav($scope.station.name + "(变量)", $state);

    if (station.profile) {
        $source.$sysLogTag.get({
            profile: station.profile
        }, function(resp) {
            $scope.systags = resp.ret;
        })
    } else {
        // query ;
        $source.$sysTag.get({
            system_model: station.model
        }, function(argument) {
            $scope.systags = argument.ret;
        })
    }
}])


.controller('das_trigger', ['$scope', '$source', '$state', function($scope, $source, $state) {

    var station = $scope.station;
    $scope.$popNav($scope.station.name + "(触发器)", $state);

    $source.$sysProfTrigger.get({
        profile: station.profile
    }, function(resp) {
        $scope.triggers = resp.ret;
    })


}])

.controller('das_message',   function($scope, $source, $state) {

    var station = $scope.station;
    $scope.$popNav($scope.station.name + "(通知)", $state);

    $source.$message.get({
        profile_id: station.profile
    }, function(resp) {
        $scope.messages = resp.ret;
    })
})

.controller('das_contact',   function($scope, $source, $state , $http , $interval , $timeout) {

    // 加载 system 的 contact ;
    // pk ~=   system_uuid ;
    $scope.$popNav($scope.station.name + "(联系人)", $state);


    $scope.op = {} ;  
 
    var interval  , timeout; 
 
    // 获取 短信验证码; 
    $scope.sendVer = function(){
        $source.$note.get( {op:"send_connnect" , mobile_phone: $scope.C.mobile_phone } ,  function( resp ){
            $scope.op.second = 10 ; 
            $scope.op.send = true ; 
            interval  = $interval(function() {
                $scope.op.second -- ; 
                if( $scope.op.second <= 0 ){
                     $interval.cancel(  interval  );
                     $scope.op.send = false ; 
                }  
            }, 1000);

        })
    }
    

    //验证 短信吗;  
    $scope.validVer = function( code ){
        $timeout.cancel( timeout);

        timeout = $timeout( function (){
                


        }, 1000);

        console.log(11111);
        return ; 
        $source.$note.get( {op:"verify_connect"} , function( resp ){

        })
    }



    $source.$contact.get({
        pk: $scope.station.uuid
    }).$promise.then(function(resp) {

        $scope.isAdd = !resp.ret;


        $scope.C = resp.ret || {};
        $scope.C.mail_notice = $scope.C.mail_notice + '';
        $scope.C.sms_notice = $scope.C.sms_notice + '';


         $scope.C.mobile_phone =  11111111111 ;


        // 更新 system 的 contact ;
        $scope.commit = function() {
            $scope.validForm();
            ($scope.isAdd ? createContact : updateContact)();
        }

        function updateContact() {

            $source.$contact.put({
                pk: $scope.station.uuid
            }, $scope.C, function(resp) {
                !resp.err && (alert("修改成功!"));
            })
        }

        function createContact() {
            $scope.C.system_id = $scope.station.uuid;
            $source.$contact.save({
                pk: $scope.station.uuid
            }, $scope.C, function(resp) {
                $scope.C.contact_id = resp.ret || $scope.C.contact_id;
                $scope.isAdd = false;
                alert('添加成功!');
            })
        }

    });

})

.controller("das_map",
    function($scope, $state, $stateParams, $map, $localStorage, $timeout, $document, $window, $source) {

        console._log($state, $stateParams, $localStorage.active_das, $document, $window);

        $scope.$popNav($scope.station.name + "(地图)", $state);


        var map, marker, mapContextMenu;


        // 取消  resize 事件 ;
        $scope.$on("$destroy", function() {
            $(window).off("resize");
        })
        var $mapdom = $document.find("#station_map");
        $mapdom.css({
            height: $window.innerHeight - 175
        });
        $($window).on("resize", function() {
            $mapdom.css({
                height: $window.innerHeight - 175
            });
        });



        $scope.pos = {};

        $scope.createMap = function() {
            if ($scope.station.latitude) {
                marker = $map.mapMarker($scope.station.latitude, $scope.station.longitude, $scope.station.name)
                addMoveMenu.apply(marker);
                addMarkMouseUpHandler.apply(marker);
            }

            map = $map.createMap("station_map", [marker]);
            $map.addSearch(map, "suggestId", "searchResultPanel");


            mapContextMenu = new BMap.ContextMenu();
            mapContextMenu.addItem(new BMap.MenuItem("定位位于此处", junpLocation, 100));
            map.addContextMenu(mapContextMenu);
        }



        // 新station 定位;
        function junpLocation(p) {
            console._log(this, arguments);

            var d = {
                uuid: $scope.station.uuid,
                latitude: p.lat,
                longitude: p.lng
            }

            $source.$system.put(d, function(resp) {

                $scope.station.latitude = p.lat;
                $scope.station.longitude = p.lng;

                map.clearOverlays();
                marker = $map.mapMarker(p.lat, p.lng, $scope.station.name);
                addMoveMenu.apply(marker);
                addMarkMouseUpHandler.apply(marker);
                map.addOverlay(marker);
            });
        }



        // mark点 添加  点击事件 ;
        function addMoveMenu() {
            var markerMenu = new BMap.ContextMenu();
            markerMenu.addItem(new BMap.MenuItem('移动位置', letIconMove.bind(this)));
            this.addContextMenu(markerMenu);
        }
        // 使采集站图标移动;
        function letIconMove(p, e, m) {
            this.enableDragging();
            this.removeContextMenu();
            addPosUndoMenu.apply(this);
            // 更改图标;
            this.setAnimation(2);
        }


        function addMarkMouseUpHandler() {
            this.addEventListener("mouseup", function(e) {
                console._log(arguments);

                var pos = e.currentTarget.point;
                // 有 $scope.station  则 不触发, 优先定位 Statoin , 后定义  themovestation ;
                $scope.$apply(function() {
                    $scope.station.latitude = pos.lat;
                    $scope.station.longitude = pos.lng;
                })
            })
        }

        function addPosUndoMenu() {
            var markerMenu = new BMap.ContextMenu();
            markerMenu.addItem(new BMap.MenuItem('使用此新位置', locatedSation.bind(this)));
            //markerMenu.addItem(new BMap.MenuItem('还原',   undo.bind(this)));
            this.addContextMenu(markerMenu);
        }


        // 按钮定位;
        $scope.locatedStation = function() {
            var d = {
                uuid: $scope.station.uuid,
                longitude: $scope.station.longitude,
                latitude: $scope.station.latitude
            }

            $source.$system.put(d, function() {

                map.clearOverlays();
                marker = $map.mapMarker($scope.station.latitude, $scope.station.longitude,
                    $scope.station.name);
                addMoveMenu.apply(marker);
                addMarkMouseUpHandler.apply(marker);
                map.addOverlay(marker);
                map.centerAndZoom(marker.point);

            });
        };

        // 右键 定位 移动的 station  ;
        function locatedSation(p) {
            console._log(this, arguments); // this = marker ;
            var that = this;
            var d = {
                uuid: $scope.station.uuid,
                longitude: p.lng,
                latitude: p.lat
            }

            $source.$system.put(d, function() {
                that.setAnimation(0);
                that.disableDragging();
                that.removeContextMenu();
                addMoveMenu.apply(that);
            });
        }



        function undo(p, e, m) {
            console._log(this, arguments, map); // this = marker ;
            map.removeOverlay(this);
            var mark = $map.mapMarker(m.station.latitude, m.station.longitude, m.station.name);
            mark.station = angular.copy(m.station);
            addMoveMenu.apply(mark);
            addMarkMouseUpHandler.apply(mark);
            map.addOverlay(mark);
        }

        // 创建 map ;
        function createMap(domid) {
            map = $map.createMap(domid, marks);
            console._log("map = ", map);

            // 当前采集占无定位时
            if ($scope.station.station_id) {
                //addMapMenu.apply(map);
                map.addContextMenu(mapContextMenu);
            }
            // 添加搜索, 选中的结果 传给 $scope.pos ;
            $map.addSearch(map, $scope, $scope.pos, "suggestId", "searchResultPanel");
            // map.addEventListener("click", mapClick);

        }

        function mapClick(e) {
            console._log(map, e);
            if ($scope.lock) return;
            map.clearOverlays();
            console._log(e.point.lng, e.point.lat);
            var x, y;
            x = e.point.lat;
            y = e.point.lng;
            $scope.$apply(function() {
                $scope.station.latitude = x;
                $scope.station.longitude = y;
            });
            map_marker = $map.mapMarker(x, y);
            // map_marker.enableDragging();
            map.addOverlay(map_marker);
        }

    })

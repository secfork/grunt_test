/* Services
 *
 * */
// Demonstrate how to register services   ___   $resource ,


// ajax  响应 ,不会被拦截的响应 ;

/**

 修改 angualr-resource.js  源码 133 行, 增加put 方式;
增加   getByPk:{method:"GET"} , 方法;

*/

angular.module('app.services', ["ngResource" ] ,function(){
    ingorErr = {
              'DEVICE_NOT_EXIST': true ,
              'ER_CONTACT_NOT_EXIST': true ,

              };

    // angular.rootUrl = 'http://localhost:8090/thinglinx/' ;
    angular.rootUrl = '' ;

})



.service('$source', ['$resource', function($resource) {

    var devmodel   = angular.rootUrl + "web/devmodel/:pk",
        dmPoint    = angular.rootUrl + "web/devmodel/points/:pk",
        sysProfile = angular.rootUrl + "web/profile/:pk",
        sysLogTag  = angular.rootUrl + "web/profile/tags/:pk",
        sysTag     = angular.rootUrl + "web/sysmodel/tags/:pk" ,
        sysProfTrigger = angular.rootUrl + "web/profile/triggers/:pk" ,
        sysModel       = angular.rootUrl + "web/sysmodel/:pk",
        sysDevice = angular.rootUrl + "web/sysmodel/devices/:pk" ,
        message   = angular.rootUrl + "web/sysmodel/messages"  ,

        system   = angular.rootUrl + "web/system/:pk/:options/:proj_id" ,
        contact  = angular.rootUrl  + "web/system/contacts/:pk" ,
        common   = "/xx" ;

    this.$deviceModel = $resource(devmodel);
    this.$dmPoint     = $resource(dmPoint);
    this.$sysProfile  = $resource(sysProfile);
    this.$sysLogTag   = $resource(sysLogTag);
    this.$sysTag         = $resource(sysTag);
    this.$sysProfTrigger = $resource(sysProfTrigger);
    this.$sysModel       = $resource(sysModel);
    this.$sysDevice      = $resource(sysDevice);
    this.$message =  $resource(  message  ) ;
    this.$contact =  $resource( contact) ;

    this.$common = $resource( common, {} , {
                    cc_passWord :{ url: angular.rootUrl + "web/common/ccpassword" , method:"PUT"   }

                  });

    this.$system =  $resource(angular.rootUrl + "web/system/:pk/:options/:proj_id", {}, {
                            sync: { method:"PUT"} ,
                            stop: { method:"DELETE"} ,
                            start:{ method:"GET"} ,
                            call: { method:"POST"} ,

                            needSync:{ url: angular.rootUrl + "web/system/needsync/uuids" }
                    })
}])

  


.service('$show', ['$resource', function($resource){

    var live    = angular.rootUrl + "web/show/live/:uuid" ,
        liveWrite = angular.rootUrl + 'web/show/livewrite'
        his = angular.rootUrl + "web/show/history/:uuid" ,
        alarm   = angular.rootUrl + "web/show/alarm/:uuid" ;

    this.live    =  $resource(live ) ;
    this.his =  $resource(his);
    this.alarm   =  $resource(alarm);
    this.liveWrite = $resource(liveWrite);



}])



// driver ;
.factory("$driver", function ($resource  ) {

    return $resource(angular.rootUrl +"web/driver/:pk",{},{

          // template , type =0 得到的是 driver最高版本;
          getDriverList:{params :{id:"list" ,type:0}   },

         // station ; type = 1 ;  得到 dtu ;
          getDtuList :{params:{id:"list",type:1}  },
         /**
          * type =  tempalte_ui,  driver_ui ;
          */
          getUi:{ isArray:true} ,

          getDaserveInfo :{url:angular.rootUrl +"web/driver/daserver/:id"}

    })
})

.factory('$account', ['$resource', '$http',  function ($resource, $http ) {
    //transformResponse

    console._log($http.defaults);
  

    return $resource(angular.rootUrl+'web/account/:operate', {}, {

        login: {url: angular.rootUrl +"web/common/login", method: "POST"
               // , transformRequest:[shaPW].concat($http.defaults.transformRequest)
        },

        logout: {url: angular.rootUrl +"web/account/logout"},
        // 检查 user 重名
        isDuplicate: {url: angular.rootUrl +"web/account/isduplicate/user"},
        //  检查 acco 重名;
        isDupOfAcco: {url: angular.rootUrl +"web/account/isduplicate/acco"},

        isInviteCode: {url: angular.rootUrl +"web/account/invitecode"} ,

         // 得到account 的所有角色信息;
        getRoles :{  url: angular.rootUrl + "web/account/roles/all/true" } ,

        getUiRoles: { url: angular.rootUrl +"web/account/roles/ui/:withAuthor" } ,
        getProjRoles: {url: angular.rootUrl +"web/account/roles/proj/:withAuthor" } ,

        // type =  all || ui || proj  ;
        getAuthor: {url: angular.rootUrl +"web/account/authors/:type"} ,

        // 批量更新roles ;
        updateRoles:{ params:{operate:'roles'} ,method:"PUT"} ,
        //批量创建 roles ;
        crateRoles:{ params:{operate:"roles"} ,method:"POST"} ,
        delRoles :{params:{operate:"roles"}   , method:"DELETE"} ,


        // 得到 account 下的采集站sn 号 ;
        getStationSn:{url:angular.rootUrl +"web/account/station_sn" }
        ,getBasicInfo:{url:angular.rootUrl +"web/account/basicinfo" }


        , getAuthorData: {url: angular.rootUrl +"web/common/islogined"}
        // 注册account 用户;
        , signUp: {url: angular.rootUrl +"web/common/regist", method: "POST"}
        // 在account 下 添加 user ;
        , createUser: {url: angular.rootUrl +"web/account/adduser", method: "POST"}
        , createProjUser:{ url:angular.rootUrl + "web/account/addprojuser"}
           // 更新 user 在某个proj 上的 角色;
         ,updateProjUser:{ url:angular.rootUrl + "web/account/updataprojuser" }


        , getAllUser: {url: angular.rootUrl +"web/account/users" , cache:true }
        , alluserinfo:{ url:angular.rootUrl +"web/account/alluserinfo"}


        , getUsersGroupByProj:{ url: angular.rootUrl + "web/account/users_by_proj"}

        //得到user  和其管理关联的proj
         ,getUserWidthProj:{url: angular.rootUrl+"web/account/user_m_proj"}

        , log_ygf:{url:angular.rootUrl +"web/account/login_ygf" , method:"POST"}

    });
}])


.factory('$project', ['$resource', '$http', function ($resource, $http) {

    return $resource( angular.rootUrl + "web/project", {}, {


        // 建采集站用;只加载 id , projname 属性;
        getAllprojsBasic: {url: angular.rootUrl +"web/project/basic"},
        // 展示project list ;
        getAllprojs: {url: angular.rootUrl +"web/project/list"},
        //展示 project 下的 stations
        getSatationByProjid: {  url: angular.rootUrl +"web/project/:projid/dastation/list"},

        // 展示 project 属性;
        getProjAttr: {method: "GET", url: angular.rootUrl +"web/project/:projid/property"},

        crateProect: {method: "POST", url: angular.rootUrl +"web/project/create "},
        deletePoject: {url: angular.rootUrl +"web/project/:projid/delete "},
        updataProject: {method: "POST", url: angular.rootUrl +"web/project/:projid/updata"},

        // 展示 rest  stations 列表 ,由 proj_id  得到 proj_name ;
        getProjNameByIdS: {method: "POST", url: angular.rootUrl +"web/project/getnamebyids"},

        //获得时区 数据;
        getTimeZone: {url: angular.rootUrl +"web/data/timezone"}

    });

}])






//==========================================================================
//==========================================================================
//==========================================================================
    // js 命令;
    .factory("jsorder", function ( $sys ) {
        return {
            'login': function () {
               // 跳到登录界面;
               // if( !$sys.$debug ){
                    window.location.hash = "#/access/signin";
               // }
            }
        }
    })


    .factory('Interceptor', function ($q  , jsorder  ,
        $location , $anchorScroll , $timeout , $sys  ) {

        // 判断 是否有ajax加载 并显隐 动作条;
        var  ajax_times  = 0  , _timeout , animat = false , $dom=[] ;


        return {
            /* 四种拦截 key 是 固定的; */
            // optional method    通过实现 request 方法拦截请求
            'request': function (config) {
                // do something on success
                ++ajax_times ;
                if( $sys.$debug && !animat  ){
                    animat = !animat ;
                   // 开始滚动;   滚动 bug :
                   // $modal.open({ template:"faefea"})
                    $dom  = $dom.length? $dom : $("#ajax_modal") ;

                    // $dom.show();
                }
                // 添加区域字段;
                // html 的不添加 local ;
                if( ! /(.html)$/.test(config.url) ){
                   if(config.params){
                       config.params.local=navigator.language ;
                   }else{
                       config.params = {local : navigator.language };
                   }
                }else{
                   // config.url ="//www.baidu.com/" + config.url ;
                }

                return config || $q.when(config);

            },
            /*
             // optional method  通过实现 requestError 方法拦截请求异常: 有时候一个请求发送失败或者被拦截器拒绝了
             'requestError': function (rejection) {
             // do something on request error
             if (canRecover(rejection)) {
             return responseOrNewPromise
             }
             return $q.reject(rejection);
             }, */

            // optional method   通过实现 response 方法拦截响应:
            'response': function (response) {

                if( $sys.$debug &&  !--ajax_times){
                    $timeout.cancel(_timeout);
                    _timeout =  $timeout(function() {
                    // 停止滚动;
                        animat  = !animat ;

                        // $dom.hide();

                    }, 100);
                }

                if (response.data.err && !ingorErr[response.data.err]) {
                    //alert( $err[response.data.err+'']|| response.data.err );
                    alert( response.data.err);
                    console.error( "_ERR_:"+ response.data.err   );
                    throw error("_ERR_:"+ response.data.err )
                }
                //return response || $q.when(response); 
                if(response.data.order ){
                    console.log("order:" + response.data.order );
                     jsorder[response.data.order]();
                 }
                return response;
            },

            // optional method  通过实现 responseError 方法拦截响应异常:
            'responseError': function (response) {
                if(! --ajax_times){
                    $timeout.cancel(_timeout);
                    _timeout =  $timeout(function() {
                          // 停止滚动;
                          $dom.addClass('hide').removeClass('active');
                          animat = false ;
                    }, 200);
                }
                 /*
                if (response.status == 302) {
                     alert("session失效!!");
                    window.location.href = "/athena";
                    return;
                }*/
                console.error(response.status + "--" + response);
                return  response ;

            }
        }

    })

    .factory("$brower", function ($window) {

        var brower = {};

        var ua = navigator.userAgent.toLowerCase();
        var s;
        (s = ua.match(/rv:([\d.]+)\) like gecko/)) ? brower.ie = s[1] :
            (s = ua.match(/msie ([\d.]+)/)) ? brower.ie = s[1] :
                (s = ua.match(/firefox\/([\d.]+)/)) ? brower.firefox = s[1] :
                    (s = ua.match(/chrome\/([\d.]+)/)) ? brower.chrome = s[1] :
                        (s = ua.match(/opera.([\d.]+)/)) ? brower.opera = s[1] :
                            (s = ua.match(/version\/([\d.]+).*safari/)) ? brower.safari = s[1] : 0;

        function isSmartDevice($window) {
            // Adapted from http://www.detectmobilebrowers.com
            var ua = $window['navigator']['userAgent'] || $window['navigator']['vendor'] || $window['opera'];
            // Checks for iOs, Android, Blackberry, Opera Mini, and Windows mobile devices
            return (/iPhone|iPod|iPad|Silk|Android|BlackBerry|Opera Mini|IEMobile/).test(ua);
        }

        brower.isSmart = isSmartDevice($window);

        return brower;
    })




    .factory("$utils", function () {
        var a, b, c, d, e,f;
        return {
            getWorker: function(){

            } ,

            copyProp: function (){
                var a , b  , c = {};
                a = arguments[0],
                b =  Array.prototype.splice.call(arguments, 1);

                b.forEach( function(v,i, t){
                    c[v] = angular.copy( a[v]);
                });
                return c;
            } ,
         

            // profile  连接模版时用;
            findTempByid: function (temps, tempid) {
                var t;
                $.each(temps, function (i, n) {
                    if (n.template_id == tempid) {
                        t = n;
                        return false;
                    }
                });
                return t;
            },
            // profile 连接模版时用;
            containTemp: function (temps, tempid) {
                var t = false;
                $.each(temps, function (i, n) {
                    if (n.template_id == tempid) {
                        t = true;
                        return false;
                    }
                });
                return t;
            },


          
           

            /**  统计 [ { keyProp:"k", countProp:"A" }    { keyProp:"k", countProp:"B" }     ]
             *  返回:  { k:{A:N , B:M} ,  ...  }
             * */
            KeyAsCountProp: function (arrayJson, keyProp, countProp) {
                console._log(arguments);
                a = {};
                $.each(arrayJson, function (i, n) {
                    b = n[keyProp];
                    c = n[countProp];
                    a[b] ? null : a[b] = {};
                    a[b][c] ? a[b][c]++ : a[b][c] = 1;
                });
                return a;
            },

       

        }
    })

    

.service("$map" , function ( $http , $templateCache , $sys ,$filter , $interpolate ) {

        var  $map  = this ;
         // dom_id 无需加 # 号 ;
        this.createMap =  function createMap ( Dom_id  , markers ) {
            // 百度地图API功能

            var  map = new BMap.Map( Dom_id  );    // 创建Map实例
           // map.centerAndZoom(new BMap.Point(116.404, 39.915), 15);
           // 初始化地图,设置中心点坐标和地图级别
            addMarkers2map(map , markers);

            map.addControl(new BMap.MapTypeControl());   //添加地图类型控件
           // map.setCurrentCity("北京");          // 设置地图显示的城市 此项是必须设置的

            //开启鼠标滚轮缩放
            map.enableScrollWheelZoom(true);
            // 左上角，添加比例尺
            var top_left_control = new BMap.ScaleControl({anchor: BMAP_ANCHOR_TOP_LEFT});
            //左上角，添加默认缩放平移控件
            var top_left_navigation = new BMap.NavigationControl();

            //右上角，仅包含平移和缩放按钮
            var top_right_navigation = new BMap.NavigationControl({anchor: BMAP_ANCHOR_TOP_RIGHT, type: BMAP_NAVIGATION_CONTROL_SMALL});
            /*缩放控件type有四种类型:
             BMAP_NAVIGATION_CONTROL_SMALL：仅包含平移和缩放按钮；BMAP_NAVIGATION_CONTROL_PAN:仅包含平移按钮；BMAP_NAVIGATION_CONTROL_ZOOM：仅包含缩放按钮*/
            map.addControl(top_left_control);
            map.addControl(top_left_navigation);
           // map.addControl(top_right_navigation);
            return map ;
        }

        // flushMarkers 清除所有覆盖物 , 添加新覆盖物;

        this.flushMarkers = function (map , stations ){
            map.clearOverlays();
            addMarkers2map( map , createDAPoint(stations) );

        }


        // marker点;
       this.mapMarker =  function mapMarker ( x, y , text ) {

            var  mark = new BMap.Marker( new BMap.Point( y , x ));
             if(text){
                 label =  new BMap.Label( text  , {offset:new BMap.Size(20,-10)}   ) ;
                 label.setStyle({  'border-width': 0 ,  'font-weight': 700   });
                 mark.setLabel( label );
             }
              return   mark ;
        }

       this.addSearch =  function addSearch ( map  , inputid , resultid){
            function G(id) {
                return document.getElementById(id);
            }

            //建立一个自动完成的对象
            var ac = new BMap.Autocomplete(
                {    "input" :  inputid
                    ,"location" : map
                });
            //鼠标放在下拉列表上的事件
            ac.addEventListener("onhighlight", function(e) {
                var str = "";
                var _value = e.fromitem.value;
                var value = "";
                if (e.fromitem.index > -1) {
                    value = _value.province +  _value.city +  _value.district +  _value.street +  _value.business;
                }
                str = "FromItem<br />index = " + e.fromitem.index + "<br />value = " + value;

                value = "";
                if (e.toitem.index > -1) {
                    _value = e.toitem.value;
                    value = _value.province +  _value.city +  _value.district +  _value.street +  _value.business;
                }
                str += "<br />ToItem<br />index = " + e.toitem.index + "<br />value = " + value;
                G("searchResultPanel").innerHTML = str;
            });

            var myValue;
            //鼠标点击下拉列表后的事件
            ac.addEventListener("onconfirm", function(e) {
                var _value = e.item.value;
                myValue = _value.province +  _value.city +  _value.district +  _value.street +  _value.business;
                G( resultid ).innerHTML ="onconfirm<br />index = " + e.item.index + "<br />myValue = " + myValue;

                setPlace();
            });

            function setPlace(){
                map.clearOverlays();    //清除地图上所有覆盖物
                function myFun(){
                    var pp = local.getResults().getPoi(0).point;    //获取第一个智能搜索的结果

                    map.centerAndZoom(pp, 18);
                   // map.addOverlay(new BMap.Marker(pp));    //添加标注
                }
                var local = new BMap.LocalSearch(map, { //智能搜索
                    onSearchComplete: myFun
                });
                local.search(myValue);
            }
        }

        // 地图展示 一个proj下的所有已定位的是station ;
        /**
           必要 :$scope , sations , domid , h_offset ;
           非必要: projName ;
        */
        this.initMap = function( $scope , stations , domid  , h_offset , projName ){

            console._log(arguments);

            var $mapdom , marks, map;

            $mapdom = $("#"+domid );

            // 取消  resize 事件 ;
            $scope.$on("$destroy" , function () {
                $(window).off("resize");
            })

            $mapdom.css({height: window.innerHeight - h_offset});

            $(window).on("resize", function(){
                $mapdom.css({height: window.innerHeight - h_offset });
            });


            marks =   createDAPoint(stations, projName );

            map = $map.createMap("bdmap" , marks);
            return  map ;
        }

        function  createDAPoint( stations  , projName ){
             var marks = [] ;

             angular.forEach( stations , function(v,k){
                if(!v.latitude) return ;
                var mark  =  $map.mapMarker( v.latitude , v.longitude ,  v.name  );

                (function(station){
                    mark.addEventListener("click", function(e){
                        var that = this ;
                        // 动态生成 infoWindow ;
                        $http({method:"GET" ,
                            url:"athena/views/dastation/prop_map_popup.html",
                            cache: $templateCache
                        })
                        .success(function(a){
                             var s = angular.copy( station );
                             console.log(s);
                             s.proj_name = s.proj_name || projName ; // ;
                             s.create_time = $filter("date")( s.create_time ,"yyyy-MM-dd hh:mm:ss" );

                             // system 类型;
                            // s.type =  $sys.stationtype.values[s.type].k ;

                            var str = $interpolate(a)(s);
                            //console._log(str , $(str).html()  );

                            var infoWindow  = new BMap.InfoWindow( str)
                            that.openInfoWindow( infoWindow );
                            //  删除 手机 小图片;


                        }).error(function(b){
                             alert("error");
                             throw("加载异常  athena/views/dastation/prop_map_popup.html?");
                        })

                    });

                })(v)
                marks.push( mark ) ;
            });
            return marks ;
        }

        function addMarkers2map ( map , markers ){
            if( markers && markers[0]){
                angular.forEach(  markers , function (n, i ) {
                    if(i == 0){
                       console._log(n);
                        map.centerAndZoom(n.point, 12 );
                    }
                    map.addOverlay(n);
                })
            }else{
                var myCity = new BMap.LocalCity();
                myCity.get(function (result) {
                    console._log(result);
                    map.centerAndZoom(  result.center ,12);
                    map.setCurrentCity(result.name);
                });
            }

        }

  })

.factory("$workerConfig" , function(){
    return {
        baseUrl:'athena/webworker/'
    }
})
.factory('$webWorker', ['$q','$workerConfig' ,  function($q , $workerConfig ){

    return  function ( jsFile ){
            console._log( "创建 webworker -- "  , jsFile  ) ;
            var worker   = new Worker(  $workerConfig.baseUrl + jsFile )  ;

            var defer = $q.defer();

            worker.addEventListener('message', function(e) {
              defer.resolve(e.data);
            }, false);

        return  {
            postMessage: function(  ){
                defer = $q.defer();
                worker.postMessage(arguments);
                return  defer.promise;
            },
            terminate: function(){
                worker.terminate();
                console._log(" 关闭 web worker !; ");
            }

        } ;

    }

}])


   ;






'use strict';


var app = angular.module('thinglinx', [

    'ngAnimate',
    'ngCookies',
    'ngMessages',
    'ngStorage',
    'ui.router',
    'ui.bootstrap',
    'ui.bootstrap.datetimepicker',
    'ui.load',
    'ui.jq',
    'ui.validate',
    'pascalprecht.translate',

    'app.basecontroller', 'app.account', 'app.model.device', 'app.model.system', 'app.project',
    'app.show.proj', 'app.show.system', 'app.system', 'app.system.prop', 'app.support',
    'app.directives',
    'app.filters',
    'app.services', 'app.sysconfig'


])

.run(
    function($rootScope, $state, $stateParams, $sys, $compile, $localStorage,
        $cacheFactory, $translate, $sce, $sessionStorage) {

        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
        $rootScope.$sys = $sys;
        $rootScope.$translate = $translate;
        $rootScope.$sceHtml = $sce.trustAsHtml;
        $rootScope.$session = $sessionStorage;
        $rootScope.fromJson = angular.fromJson ;


        $rootScope.ossRoot = "@@oss" ;
 

        window.onbeforeunload = function() {
            alert("关闭窗口");
        };

        // $rootScope.$err = $err ;

        $rootScope.$debug = $sys.$debug;

        // $rootScope.$$cache = null ;
        //@if  append

        window.test = function() {
            alert("test  function !")
        };

        $rootScope.test = function() {
                alert("test  function !")
        }
            //@endif  

        // $rootScope.validate = function(data, msg) {
        //   if (!data) {
        //     alert(msg)
        //     throw Error(msg);
        //   }
        // }

        $rootScope.funtest = function() {
            //@if  append

            console.log("函数测试!");
            //@endif 
        };

    }

)


.config(
    ['$stateProvider', '$urlRouterProvider', '$controllerProvider', '$compileProvider',
        '$filterProvider', '$provide', "$httpProvider", "$resourceProvider",
        function($stateProvider, $urlRouterProvider, $controllerProvider, $compileProvider,
            $filterProvider, $provide, $httpProvider, $resourceProvider) {

            // 自定义 ajax 拦截器;
            $httpProvider.interceptors.push('Interceptor');
            // 默认前端 跨域;
            //$httpProvider.defaults.withCredentials = true;

            //@if  append

            console.log(document.cookie, $resourceProvider);
            //@endif 




            // lazy controller, directive and service
            app.controller = $controllerProvider.register;
            app.directive = $compileProvider.directive;
            app.filter = $filterProvider.register;
            app.factory = $provide.factory;
            app.service = $provide.service;
            app.constant = $provide.constant;
            app.value = $provide.value;



            //  $httpProvider.defaults.headers.common  ={
            //    Accept: "application/json, text/plain, */*"
            //    ,'Access-Control-Allow-Origin':'*'
            //    ,'Access-Control-Allow-Credentials':true
            //    ,'Access-Control-Allow-Methods':'GET,POST,OPTIONS'

            // } ;




        // $provide.decorator('$rootScope', ['$delegate', function($delegate) {
        //   // ['$delegate',
        //   // 为 所有的 scope 注册  $destroy 事件; !!
        //   var $new_proxy = $delegate.$new;
        //   $delegate.$new = function() {
        //     var $scope = $new_proxy.apply(this);
        //     var _s // this = ?
        //     $scope.$on("$destroy", function($event) {
        //       console._log("$scope $destroy event  ", "清除controller 缓存;");

        //       _s = $event.targetScope;

        //       if (_s.hasOwnProperty('$cache')) {
        //         _s.$cache.destroy();
        //         console._log(" 清除controller 缓存; ");
        //       }


        //     });
        //     return $scope;
        //   };













            $urlRouterProvider
            //.otherwise('/access/signin');
            //.otherwise('/app/template');
            //.otherwise('/app/proj/manage');
                .otherwise('/app');

            $stateProvider.state('app', {
                //abstract: true,
                url: '/app',
                templateUrl: 'athena/app.html',
                resolve: {
                    $user : function( $source ){
                        
                        return    $source.$common.get({  op: "islogined" }).$promise
                    }
                },
                controller: function($scope, $state, $sys  , $user ) {

                     //后台判断是否已经登录; 
                    var user =  $user.ret ;

                    
                    
                    if (user) {
                        user.sms_notice = !!user.sms_notice;
                        user.mail_notice = !!user.mail_notice;

                        $scope.user = user;

                        //@if  append 
                        console.log("sessionStorage 含有user");
                        //@endif 

                        // 是 app 路由转到 rootState ;
                        // rootstate = app.prpj.namage ;
                        $state.is("app") ? $state.go($sys.rootState) : undefined;

                        $scope.user = user ; 

                    } else {
                        //  if( !$sys.$debug ){
                        $state.go('access.signin');
                            //  }
                    };
                    
                    
                }

            })

            .state("app.show", {
                url: "/show",
 
//                    jjw no-border
                template: '<div ui-view class="gap-5  panel panel-default no-border  "></div>'
 
                    // , templateUrl:
                    ,
                data: {
                    isShowModul: true
                },
                controller: function($scope, $state) {
                    $scope.$rootNav("展示");
                },

                resolve: {
                    deps: ['uiLoad', function(uiLoad) {
                        return uiLoad.load([
                            'lib/flot/jquery.flot.min.js',
                           //  'lib/flot/jquery.flot.spline.js', 
                            
                          //  'lib/flot/jquery.flot.navigate.min.js',
                           'lib/flot/jquery.flot.time.min.js',
                           // 'lib/flot/date.js',
 
                           'lib/flot/jquery.flot.tooltip.min.js',
                        ]);
                    }]
                }

            })

            //  模版 =================================
            .state("app.show.proj", {
                url: "/proj",
                controller: "manage_projs",
                templateUrl: "athena/region/project_temp.html"

            })

            .state("app.show.proj_prop", {

                    // url: "/{projid}/{projname}/prop",
                    url: "/proj_prop",
                    controller: "proj_prop",
                    templateUrl: "athena/region/pro_man_prop.html"

                })
                // 得到项目所在的系统 属性;   // app.proj_prop 被忽略掉; 才可;
                .state("app.show.proj_prop.station", {
                    url: "/system",
                    controller: "proj_prop_station",
                    // 采集站 模版;
                    templateUrl: "athena/dastation/dastation_temp.html"

                })
                // 项目自身属性;
                .state("app.show.proj_prop.attr", {
                    url: "/attr",
                    controller: "proj_prop_attr",
                    templateUrl: "athena/region/project_info.html"
                })


            .state("app.show.system", {
                url: "/system?isactive",
                templateUrl: "athena/dastation/dastation_temp.html",
                controller: "dastation_ignore_active"
            })

            .state("app.show.system_prop", {
                url: "/system_prop",
                controller: "show_system_prop",
                templateUrl: "athena/show/system_prop.html"
            })

            .state("app.show.system_prop.basic", {
                url: "/_basic",
                templateUrl: "athena/show/system_prop_basic.html",
                controller: "show_system_basic"

            })

            .state("app.show.system_prop.current", {
                    url: "/_current",
                    templateUrl: "athena/show/system_prop_current.html",
                    controller: "show_system_current"
                })
                .state("app.show.system_prop.history", {
                    url: "/_history",
                    templateUrl: "athena/show/system_prop_history.html",
                    controller: "show_system_history"
                })
                .state("app.show.system_prop.alarm", {
                    url: "/_alarm",
                    templateUrl: "athena/show/system_prop_alarm.html",
                    controller: "show_system_alarm"
                })


            .state("app.show.system_prop.map", {
                url: "/_map",
                templateUrl: "athena/show/system_prop_map.html",
                //template: "<div class='panel-body h-full' id='station_map' > 423 </div>",
                controller: "show_system_map"
            })

            .state("app.show.alarm", {
                url: "/alarm",
                templateUrl: "athena/show/alarm.html",
                controller: "show_alarm"
            })


            //===========================================================

            .state("app.model", {
                url: "/model",
//                    jjw no-border
                template: '<div ui-view class=" gap-5 panel panel-default no-border"></div>'
                    //template:'<div ui-view class="fade-in-up smooth wrapper-xs"></div>'
            })

            .state("app.model.devmodel", {
                    url: "/devmodel",
                    templateUrl: "athena/template/template.html",
                    controller: 'devmodel'

                })
                .state("app.model.sysmodel", {
                    url: "/sysmodel",
                    templateUrl: "athena/sysmodel/sysmodel.html",
                    controller: 'sysmodel'
                })

            .state("app.model.sysmodel_p", {
                    url: "/sysmodel_p",
                    // template:'<div ui-view class=" wrapper-xs"></div>' ,
                    templateUrl: 'athena/debris/_tabs.html',
                    controller: "sysmodelProp"
                })
                .state("app.model.sysmodel_p.basic", {
                    url: "/basic",
                    templateUrl: "athena/sysmodel/sys_basic.html",
                    controller: "sysmodel_basic"
                })
                .state("app.model.sysmodel_p.sysdevice", {
                    url: "/sysdevice",
                    templateUrl: "athena/sysmodel/sys_device.html",
                    controller: "sysmodel_device"
                })
                .state("app.model.sysmodel_p.systag", {
                    url: "/systag",
                    templateUrl: "athena/sysmodel/sys_tag.html",
                    controller: "sysmodel_tag"
                })

            .state("app.model.sysmodel_p.sysprofile", {
                    url: "/sysprofile",
                    templateUrl: "athena/sysmodel/sys_profile.html",
                    controller: "sysmodel_profile"
                })
                .state("app.model.sysmodel_p.trigger", {
                    url: "/trigger",
                    templateUrl: "athena/sysmodel/sys_proftrigger.html",
                    controller: "sysmodel_prof_trigger"
                })

            .state("app.model.sysmodel_p.message", {
                    url: "/message",
                    templateUrl: "athena/sysmodel/sys_message_center.html",
                    controller: "sysmodel_message"
                })
                .state("app.model.sysmodel_p.gateway", {
                    url: "/gateway",
                    templateUrl: "athena/sysmodel/sys_gateway.html",
                    controller: "sysmodel_gateway"
                })



            //===========================================================
            //===========================================================

            // project 管理 , 添加;  ================================================
            .state('app.proj', {
                    url: '/proj',
                    //                    jjw no-border
                    template: '<div ui-view class="gap-5  panel panel-default no-border "></div>',
                    controller: function($scope, $state) {
                        $scope.$rootNav("管理");
                    },

                })
                .state("app.proj.manage", {
                    url: "/manage",
                    controller: "manage_projs",
                    templateUrl: "athena/region/project_temp.html"
                })

            .state("app.proj.addproj", {
                url: "/addproj",
                controller: "manage_addproj",
                templateUrl: "athena/region/project_add_temp.html"
            })

            //   项目 属性 ; ==============================================
            .state("app.proj.prop", {
                    // url: "/prop",
                    controller: "proj_prop",
                    templateUrl: "athena/region/pro_man_prop.html"
                })
                // 得到项目所在的系统 属性;
                // app.proj_prop 被忽略掉; 才可;
                .state("app.proj.prop.station", {
                    url: "/station",
                    controller: "proj_prop_station",
                    // 采集站 模版;
                    templateUrl: "athena/dastation/dastation_temp.html"
                })
                // 项目自身属性;
                .state("app.proj.prop.attr", {
                    url: "/attr",
                    controller: "proj_prop_attr",
                    templateUrl: "athena/region/project_add_temp.html"
                })
                // 要和系统选项 栏 合并 ;  同一功能;
                .state("app.proj.prop.addstation", {
                    url: "/addstation",
                    controller: "dastation_add",
                    templateUrl: "athena/dastation/dastation_add_temp.html"
                })



            //==========采集站 =====================   class="fade-in-right-big smooth"
            //
            .state('app.station', {
                    url: '/station',
                    template: '<div ui-view  class=" gap-5  panel panel-default no-border"></div>',
                    controller: function($scope, $state) {
                        $scope.$rootNav("管理");
                    }

                })
                //================
                .state("app.station.active", {
                    url: "/active?isactive",
                    controller: "dastation_ignore_active",
                    templateUrl: "athena/dastation/dastation_temp.html"
                })
                .state("app.station.unactive", {
                    url: "/unactive?isactive",
                    controller: "dastation_ignore_active",
                    templateUrl: "athena/dastation/dastation_temp.html"
                })

            .state("app.station.add", {
                url: "/add",
                controller: "dastation_add",
                templateUrl: "athena/dastation/dastation_add_temp.html"
            })

            // 采集站 属性;
            .state("app.station.prop", {
                    //abstract:true ,
                    url: "/prop", // 开始就传递 station id 参数;
                    controller: "dastation_prop",
                    templateUrl: "athena/dastation/dastation_prop.html"
                })
                //========================

            // 又分  dastation 的 好多 tab  属性;
            .state("app.station.prop._basic", {
                url: "/_basic",
                controller: "das_basic",
                templateUrl: "athena/dastation/prop_basic.html"
            })

            .state("app.station.prop._config", {
                url: "/_config",
                controller: "das_config",
                templateUrl: "athena/dastation/prop_config.html"
            })


            // 系统信息版( sation 中 使用 );  描述信息版(外部描述 ,);
            .state("app.station.prop.tag", {
                    url: "/_tag",
                    controller: "das_tag",
                    templateUrl: "athena/sysmodel/sys_tag.html"
                })
                .state("app.station.prop.trigger", {
                    url: "/_trigger",
                    controller: "das_trigger",
                    templateUrl: "athena/sysmodel/sys_proftrigger.html"
                })
                .state("app.station.prop.message", {
                    url: "/_message",
                    controller: "das_message",
                    templateUrl: "athena/sysmodel/sys_message_center.html"
                })

            .state("app.station.prop.contact", {
                url: "/_contact",
                templateUrl: "athena/dastation/prop_contact.html",
                controller: "das_contact"
            })

            .state("app.station.prop._map", {
                url: "/_map",
                controller: "das_map",
                templateUrl: "athena/dastation/prop_map.html"
                    // http://api.map.baidu.com/api?v=1.5&ak=M9b53slaoqAKQj8jX0CRz6xA" type="text/javascript
                    ,
                resolve: {
                    deps: ['uiLoad',
                        function(uiLoad) {
                            return uiLoad.load([
                                'http://api.map.baidu.com/api?v=1.5&ak=M9b53slaoqAKQj8jX0CRz6xA',
                            ]);
                        }
                    ]
                }

            })



            // athena_user --------------------------------------------------

            .state('app.account', {
                url: '/account',
                //                    jjw no-border
                template: '<div ui-view class="  gap-5 panel panel-default no-border"></div>',
                controller: function($scope, $state) {
                    $scope.$rootNav("管理");
                }

            })

            .state("app.account.info", {
                url: "/info",
                controller: "account_info",
                templateUrl: "athena/account/info.html"
            })

            .state("app.account.user", {
                url: "/user",
                templateUrl: "athena/account/users.html",
                controller: "account_users"
            })


            .state("app.account.usergroup", {
                    url: "/usergroup",
                    // abstract:true,
                    // templateUrl:"athena/views/debris/_tabs.html",
                    templateUrl: "athena/account/usergroup.html",
                    controller: "usergroup"
                })
                .state("app.account.usergroup_users", {
                    url: "/group_users",
                    templateUrl: "athena/account/usergroup_users.html",
                    controller: "usergroup_users"
                })

            //app.account.author
            // 账户 -->编辑权限;
            .state("app.account.role", {
                url: "/role",
                controller: "acco_role",
                templateUrl: "athena/account/role.html"
            })

            .state("app.account.author", {
                    url: "/author",
                    templateUrl: "athena/account/author.html",
                    controller: "acco_author"
                })
                .state("app.account.author.region", {
                    url: "/region",
                    templateUrl: "athena/account/author_region.html",
                    controller: "author_region"
                })
                .state("app.account.author.account", {
                    url: "/account",
                    templateUrl: "athena/account/author_account.html",
                    controller: "author_account"
                })


            //================================================================
            //================================================================

            //   access/signin
            .state('access', {
                    url: '/access',
                    template: '<div ui-view class="   h-full smooth"></div>',
                    resolve: {
                        $user : function(  ){
                            
                            return   window.loginUserPromise 
                        }
                    },

                    controller:function(){

                    }
                })
                .state('access.signin', {
                    url: '/signin',
                    controller: "access_signin",
                    templateUrl: 'athena/page_signin.html'
                })


                .state('access.signup', {
                    url: '/signup',
                    controller: "access_signup",
                    templateUrl: 'athena/page_signup.html'
                })
                .state('access.forgotpwd', {
                    url: '/forgotpwd',
                    controller: "access_fogpas",
                    templateUrl: 'athena/page_forgotpwd.html'
                })

                .state("access.verifyemail" , {
                    url:"/verify_email" ,
                    controller:"verifyemail",
                    templateUrl:"athena/page_verifyemail.html"
                })

                .state('access.404', {
                    url: '/404',
                    templateUrl: 'tpl/page_404.html'
                })

            //============ access  ===========================================================
            // 联系我们; 技术支持; 使用条款; 问题反馈; 帮助;
            // .state("support", {
            //   url:"support",
            //   template:'<div ui-view class="smooth"></div>'
            // })
            .state("conncet", {

                })
                .state('app.tech', {
                    url: "/tech",
                    templateUrl: "athena/support/tech.html",
                    controller: "tech"

                })
                .state("app.tech_detail", {
                    url: "/techdetail",
                    templateUrl: "athena/support/techdetail.html",
                    controller: "techdetail"
                })
                .state('protocol', {})
                .state('htlp', {})



        }
    ]
)

.constant('JQ_CONFIG', {

    // wysiwyg: ['lib/wysiwyg/bootstrap-wysiwyg.js',
    //           'lib/wysiwyg/jquery.hotkeys.js'
    //         ] 

    chosen: ['lib/chosen/chosen.jquery.min.js',
        'lib/chosen/chosen.css'
    ],
    filestyle: [
        'lib/file/bootstrap-filestyle.min.js'
    ]

})

.config(['$translateProvider', function($translateProvider) {


    $translateProvider.useStaticFilesLoader({
        prefix: 'l10n/',
        suffix: '.json'
    });
    $translateProvider.preferredLanguage('zh_CN');
    $translateProvider.useLocalStorage();


}]);

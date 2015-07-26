/* global localStorage */

// "scripts/directive/directive"


define([
    'angular',
    'scripts/directive/_directive',
    'scripts/service/_service',
    'scripts/controller/_controller'

], function(angular ,  d, s, c) {

    'use strict';
    var dep = [
            'ngAnimate',
            'ngCookies',

            'ngStorage',

            "ngResource",
            //'ngMessages',

            'ui.router',
            'ui.bootstrap',
            'ui.load',
            'ui.jq',
            'ui.validate',
            'pascalprecht.translate',


            'app.directive',
            'app.service',
            'app.controller'


        ],
    app = angular.module('app', dep)
    .run(['$rootScope', '$state', '$stateParams', '$sys', "$compile", "$localStorage","$cacheFactory", "$translate",
            function($rootScope, $state, $stateParams, $sys, $compile, $localStorage, $cacheFactory, $translate) {

                $rootScope.$state = $state;
                $rootScope.$stateParams = $stateParams;
                $rootScope.$sys = $sys;
                $rootScope.$translate = $translate;
                $rootScope.$debug = $sys.$debug;



                console._log = $sys.$debug ? console.log : function() {};

                window.test = function() {
                    alert("test  function !")
                };
                $rootScope.test = function() {
                    alert("test  function !")
                }

                $rootScope.validate = function(data, msg) {
                    if (!data) {
                        alert(msg)
                        throw Error(msg);
                    }
                }
            }
    ])

    .config(['$stateProvider', '$urlRouterProvider', '$controllerProvider', '$compileProvider', '$filterProvider', '$provide', "$httpProvider", "$resourceProvider",
        function($stateProvider, $urlRouterProvider, $controllerProvider, $compileProvider, $filterProvider, $provide, $httpProvider, $resourceProvider) {

            // lazy controller, directive and service
            app.controller = $controllerProvider.register;
            app.directive = $compileProvider.directive;
            app.filter = $filterProvider.register;
            app.factory = $provide.factory;
            app.service = $provide.service;
            app.constant = $provide.constant;
            app.value = $provide.value;


            // 自定义 ajax 拦截器;
            $httpProvider.interceptors.push('Interceptor');

            // 默认前端 跨域;
            //$httpProvider.defaults.withCredentials = true;


            console.log(document.cookie, $resourceProvider);

            $provide.decorator("$resource", ['$delegate', function($delegate) {

                return $delegate

            }]);

            $urlRouterProvider
            //.otherwise('/access/signin');
            //.otherwise('/app/template');
            //.otherwise('/app/proj/manage');
                .otherwise('/app');



            $stateProvider.state('app', {
                //abstract: true,
                url: '/app',
                templateUrl: 'athena/app.html',
                controller: function($scope, $state, $sys, $sessionStorage) {

                    // jsorder go2long 要清除sessionstorage 的user ;
                    var user = $sessionStorage.user;

                    if (user) {
                        $scope.user = user;
                        console._log("sessionStorage 含有user");
                        // 是 app 路由转到 rootState ;
                        // rootstate = app.prpj.namage ;
                        $state.is("app") ? $state.go($sys.rootState) : undefined;
                    } else {
                        //  if( !$sys.$debug ){
                        $state.go('access.signin')
                            //  }
                    };
                }

            })



            .state("app.show", {
                url: "/show",
                template: '<div ui-view class="wrapper-xs"></div>'
                    // , templateUrl:
                    ,
                data: {
                    isShowModul: true
                },
                controller: function($scope, $state) {
                    $scope.$rootNav("展示");
                }

                ,
                resolve: {
                    deps: ['uiLoad', function(uiLoad) {
                        return uiLoad.load([
                            'lib/jquery/charts/flot/jquery.flot.min.js',
                            'lib/jquery/charts/flot/jquery.flot.navigate.min.js',
                            'lib/jquery/charts/flot/jquery.flot.time.min.js',
                            'lib/jquery/charts/flot/date.js',

                            // 'lib/jquery/charts/flot/jquery.flot.errorbars.js',
                            // 'lib/jquery/charts/flot/jquery.flot.resize.js',
                            'lib/jquery/charts/flot/jquery.flot.tooltip.min.js',
                            'lib/jquery/charts/flot/jquery.flot.spline.js',
                            //    'lib/jquery/charts/flot/jquery.flot.orderBars.js',
                            // 'lib/jquery/charts/flot/jquery.flot.pie.min.js'
                        ]);
                    }]
                }

            })

            //  模版 =================================
            .state("app.show.proj", {
                url: "/proj",
                controller: "manage_projs",
                templateUrl: "athena/views/project_temp.html"

            })

            .state("app.show.proj_prop", {

                    // url: "/{projid}/{projname}/prop",
                    url: "/proj_prop",
                    controller: "proj_prop",
                    templateUrl: "athena/views/manage/pro_man_prop.html"

                })
                // 得到项目所在的系统 属性;   // app.proj_prop 被忽略掉; 才可;
                .state("app.show.proj_prop.station", {
                    url: "/system",
                    controller: "proj_prop_station",
                    // 采集站 模版;
                    templateUrl: "athena/views/dastation_temp.html"

                })
                // 项目自身属性;
                .state("app.show.proj_prop.attr", {
                    url: "/attr",
                    controller: "proj_prop_attr",
                    templateUrl: "athena/views/project_add_temp.html"
                })


            .state("app.show.system", {
                url: "/system?isactive",
                templateUrl: "athena/views/dastation_temp.html",
                controller: "dastation_ignore_active"
            })

            .state("app.show.system_prop", {
                url: "/system_prop",
                controller: "show_system_prop",
                templateUrl: "athena/views/show/system_prop.html"
            })


            .state("app.show.system_prop.current", {
                    url: "/_current",
                    templateUrl: "athena/views/show/system_prop_current.html",
                    controller: "show_system_current"
                })
                .state("app.show.system_prop.history", {
                    url: "/_history",
                    templateUrl: "athena/views/show/system_prop_history.html",
                    controller: "show_system_history"
                })
                .state("app.show.system_prop.alarm", {
                    url: "/_alarm",
                    templateUrl: "athena/views/show/system_prop_alarm.html",
                    controller: "show_system_alarm"
                })


            .state("app.show.system_prop.map", {
                url: "/_map",
                template: "<div class='panel-body h-full' id='station_map' >  </div>",
                controller: "show_system_map"
            })



            //===========================================================

            .state("app.model", {
                url: "/model",
                template: '<div ui-view class=" wrapper-xs "></div>'
                    //template:'<div ui-view class="fade-in-up smooth wrapper-xs"></div>'
            })

            .state("app.model.devmodel", {
                    url: "/devmodel",
                    templateUrl: "athena/views/template/template.html",
                    controller: 'devmodel'

                })
                .state("app.model.sysmodel", {
                    url: "/sysmodel",
                    templateUrl: "athena/views/sysmodel/sysmodel.html",
                    controller: 'sysmodel'
                })

            .state("app.model.sysmodel_p", {
                    url: "/sysmodel_p",
                    // template:'<div ui-view class=" wrapper-xs"></div>' ,
                    templateUrl: 'athena/views/sysmodel/sys_.html',
                    resolve: {
                        prof_data: function() {
                            console.log('-----------------------------------');

                            // $scope.sysmodel = $scope.$$cache[0],

                            // $sysProfile.get({  system_model: $scope.sysmodel.uuid }, function(resp) {
                            //     $scope.profiles = resp.ret ,
                            //     $scope.profile = resp.ret[0] , //&& array[0].uuid ;

                            //     $scope.hasProfile = !!resp.ret.length ;
                            // })

                        }
                    },
                    controller: "sysmodelProp"
                })
                .state("app.model.sysmodel_p.sysdevice", {
                    url: "/sysdevice",
                    templateUrl: "athena/views/sysmodel/sys_device.html",
                    controller: "sysmodel_device"
                })
                .state("app.model.sysmodel_p.systag", {
                    url: "/systag",
                    templateUrl: "athena/views/sysmodel/sys_tag.html",
                    controller: "sysmodel_tag"
                })

            .state("app.model.sysmodel_p.sysprofile", {
                    url: "/sysprofile",
                    templateUrl: "athena/views/sysmodel/sys_profile.html",
                    controller: "sysmodel_profile"
                })
                .state("app.model.sysmodel_p.trigger", {
                    url: "/trigger",
                    templateUrl: "athena/views/sysmodel/sys_proftrigger.html",
                    controller: "sysmodel_prof_trigger"
                })

            .state("app.model.sysmodel_p.message", {
                    url: "/message",
                    templateUrl: "athena/views/sysmodel/sys_message_center.html",
                    controller: "sysmodel_message"
                })
                .state("app.model.sysmodel_p.gateway", {
                    url: "/gateway",
                    templateUrl: "athena/views/sysmodel/sys_gateway.html",
                    controller: "sysmodel_gateway"
                })



            //===========================================================
            //===========================================================

            // project 管理 , 添加;  ================================================
            .state('app.proj', {
                    url: '/proj',
                    template: '<div ui-view class="  wrapper-xs"></div>',
                    controller: function($scope, $state) {
                        $scope.$rootNav("管理");
                    },
                    resolve: {
                        data: function() {
                            return "aa"
                        }
                    }
                })
                .state("app.proj.manage", {
                    url: "/manage",
                    controller: "manage_projs",
                    templateUrl: "athena/views/project_temp.html"
                })

            .state("app.proj.addproj", {
                url: "/addproj",
                controller: "manage_addproj",
                templateUrl: "athena/views/project_add_temp.html"
            })

            //   项目 属性 ; ==============================================
            .state("app.proj.prop", {
                    // url: "/prop",
                    controller: "proj_prop",
                    templateUrl: "athena/views/manage/pro_man_prop.html"
                })
                // 得到项目所在的系统 属性;
                // app.proj_prop 被忽略掉; 才可;
                .state("app.proj.prop.station", {
                    url: "/station",
                    controller: "proj_prop_station",
                    // 采集站 模版;
                    templateUrl: "athena/views/dastation_temp.html"
                })
                // 项目自身属性;
                .state("app.proj.prop.attr", {
                    url: "/attr",
                    controller: "proj_prop_attr",
                    templateUrl: "athena/views/project_add_temp.html"
                })
                // 要和系统选项 栏 合并 ;  同一功能;
                .state("app.proj.prop.addstation", {
                    url: "/addstation",
                    controller: "dastation_add",
                    templateUrl: "athena/views/dastation_add_temp.html"
                })



            //==========采集站 =====================   class="fade-in-right-big smooth"
            .state('app.station', {
                    url: '/station',
                    template: '<div ui-view  class="  wrapper-xs   "></div>',
                    controller: function($scope, $state) {
                        $scope.$rootNav("管理");
                    }

                })
                //================
                .state("app.station.active", {
                    url: "/active?isactive",
                    controller: "dastation_ignore_active",
                    templateUrl: "athena/views/dastation_temp.html"
                })
                .state("app.station.unactive", {
                    url: "/unactive?isactive",
                    controller: "dastation_ignore_active",
                    templateUrl: "athena/views/dastation_temp.html"
                })

            .state("app.station.add", {
                url: "/add",
                controller: "dastation_add",
                templateUrl: "athena/views/dastation_add_temp.html"
            })

            // 采集站 属性;
            .state("app.station.prop", {
                    //abstract:true ,
                    url: "/prop", // 开始就传递 station id 参数;
                    controller: "dastation_prop",
                    templateUrl: "athena/views/dastation/dastation_prop.html"
                        /* , resolve: {
                             deps: ['uiLoad',
                                 function (uiLoad) {
                                     return uiLoad.load([
                                         'athena/controller/dastation_prop.js'
                                     ]);
                                 }]
                         }*/
                })
                //========================

            // 又分  dastation 的 好多 tab  属性;
            .state("app.station.prop._basic", {
                url: "/_basic",
                controller: "das_basic",
                templateUrl: "athena/views/dastation/prop_basic.html"
            })

            .state("app.station.prop._config", {
                url: "/_config",
                controller: "das_config",
                templateUrl: "athena/views/dastation/prop_config.html"
            })


            // 系统信息版( sation 中 使用 );  描述信息版(外部描述 ,);
            .state("app.station.prop.tag", {
                    url: "/_tag",
                    controller: "das_tag",
                    templateUrl: "athena/views/sysmodel/sys_tag.html"
                })
                .state("app.station.prop.trigger", {
                    url: "/_trigger",
                    controller: "das_trigger",
                    templateUrl: "athena/views/sysmodel/sys_proftrigger.html"
                })
                .state("app.station.prop.message", {
                    url: "/_message",
                    controller: "das_message",
                    templateUrl: "athena/views/sysmodel/sys_message_center.html"
                })

            .state("app.station.prop.contact", {
                url: "/_contact",
                templateUrl: "athena/views/dastation/prop_contact.html",
                controller: "das_contact"
            })

            .state("app.station.prop._map", {
                url: "/_map",
                controller: "das_map",
                templateUrl: "athena/views/dastation/prop_map.html"
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
                template: '<div ui-view class="    wrapper-xs "></div>',
                /* resolve: {
                     deps: ['uiLoad',
                         function (uiLoad) {
                             return uiLoad.load([
                                 'athena/controller/account.js'
                             ]);
                         }]
                 } ,*/
                controller: function($scope, $state) {
                    $scope.$rootNav("管理");
                }

            })

            .state("app.account.info", {
                url: "/info",
                controller: "account_info",
                templateUrl: "athena/views/account/info.html"
            })

            .state("app.account.promise", {
                    url: "/promise",
                    controller: "acco_promi",
                    templateUrl: "athena/views/account/promise.html"
                })
                .state("app.account.promise._billing", {
                    url: "/_billing",
                    controller: "acco_promi_billing",
                    templateUrl: "athena/views/account/promise_billing.html"
                })
                .state("app.account.promise._regist", {
                    url: "/_regist",
                    controller: "acco_promi_regist",
                    templateUrl: "athena/views/account/promise_regist.html"
                })
                .state("app.account.promise._sms", {
                    url: "/_sms",
                    controller: "acco_promi_sms",
                    templateUrl: "athena/views/account/promise_sms.html"
                })
                .state("app.account.promise._user", {
                    url: "/_user",
                    controller: "acco_promi_user",
                    templateUrl: "athena/views/account/promise_user.html"
                })

            .state("app.account.user", {
                    url: "/user",
                    templateUrl: "athena/views/account/users.html",
                    controller: "account_users"
                })
                .state("app.account.user._all", {
                    url: "/_all",
                    controller: "acco_user_all",
                    templateUrl: "athena/views/account/users_all.html"
                })
                .state("app.account.user._byproj", {
                    url: "/_byproj",
                    controller: "acco_user_byproj",
                    templateUrl: "athena/views/account/users_byproj.html",
                    resolve: {
                        data: function($account) {
                            return $account.getUsersGroupByProj().$promise;
                        }
                    }
                })
                .state("app.account.user._add", {
                    url: "/_add",
                    controller: "acco_user_add",
                    templateUrl: "athena/views/account/users_add.html",
                    resolve: {
                        role_proj: function($project, $account, $q) {
                            var a, b;
                            a = $project.getAllprojsBasic().$promise;
                            b = $account.getRoles().$promise;
                            return $q.all([b, a]);

                        }
                    }
                })
                // 账户 --> 用户  --> 编辑用户;
                .state("app.account.edit", {
                    url: "/useredit",
                    controller: "acco_useredit",
                    templateUrl: "athena/views/account/users_edit.html"
                })


            //app.account.author
            // 账户 -->编辑权限;
            .state("app.account.author", {
                url: "/author",
                controller: "acco_author",
                templateUrl: "athena/views/account/author.html"

                ,
                resolve: {
                    data: function($account, $q) {

                        return $q.all([
                            $account.getRoles().$promise,
                            $account.getAuthor({
                                type: "all"
                            }).$promise
                        ])
                    }
                }


            })


            .state("app.account.visdata", {
                    url: "/visdata",
                    controller: "acco_visdata",
                    templateUrl: "athena/views/account/visdata.html"
                })
                .state("app.account.visdata._net", {
                    url: "/_net",
                    controller: "acco_visdata_net",
                    templateUrl: "athena/views/account/visdata_net.html"
                })
                .state("app.account.visdata._rss", {
                    url: "/_rss",
                    controller: "acco_visdata_rss",
                    templateUrl: "athena/views/account/visdata_rss.html"
                })
                .state("app.account.visdata._profiles", {
                    url: "/_profiles",
                    controller: "acco_visdata_profiles",
                    templateUrl: "athena/views/account/visdata_profiles.html"
                })

            .state("app.account.custom", {
                url: "/custom",
                templateUrl: "athena/views/account/custom.html"
            })



            //   access/signin
            .state('access', {
                    url: '/access',
                    template: '<div ui-view class="   h-full smooth"></div>'
                })
                .state('access.signin', {
                    url: '/signin',
                    //controller: "access_signin",
                    templateUrl: 'athena/page_signin.html'
                })
                .state('access.signup', {
                    url: '/signup',
                    controller: "access_signup",
                    templateUrl: 'athena/page_signup.html'
                })
                .state('access.forgotpwd', {
                    url: '/forgotpwd',
                    // controller: "access_fogpas",
                    templateUrl: 'athena/page_forgotpwd.html'
                })
                .state('access.404', {
                    url: '/404',
                    templateUrl: 'tpl/page_404.html'
                })


        }
    ])

    // .config(['$translateProvider', function($translateProvider) {
    //     $translateProvider.useStaticFilesLoader({
    //         prefix: 'athena/l10n/',
    //         suffix: '.json'
    //     });
    //     $translateProvider.preferredLanguage('zh_CN');
    //     $translateProvider.useLocalStorage();


    // }])

   ;



    return app;
});
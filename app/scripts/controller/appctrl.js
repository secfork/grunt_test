define(['angular'] , function(angular){

	angular.module('app.controller.appctrl', [])

	.controller('AppCtrl', ['$scope', '$translate', '$localStorage', '$window', '$modal',
    '$account', '$state',
    "$timeout", '$sessionStorage', '$source', "$project", "$q",

    function ($scope, $translate, $localStorage, $window, $modal, $account, $state,
              $timeout, $sessionStorage, $source, $project, $q) {

      var S = $scope;


      console._log("app ctrl", $scope);
      //"f7846f55cf23e14eebeab5b4e1550cad5b509e3348fbc4efa3a1413d393cb650";

      // add 'ie' classes to html
      var isIE = !!navigator.userAgent.match(/MSIE/i);
      isIE && angular.element($window.document.body).addClass('ie');
      isSmartDevice($window) && angular.element($window.document.body).addClass('smart');

      // config
      $scope.app = {
        name: 'Angulr',
        version: '1.3.0',
        // for chart colors
        color: {
          primary: '#7266ba',
          info: '#23b7e5',
          success: '#27c24c',
          warning: '#fad733',
          danger: '#f05050',
          light: '#e8eff0',
          dark: '#3a3f51',
          black: '#1c2b36'
        },
        settings: {
          themeID: 10,
          navbarHeaderColor: 'bg-black',
          navbarCollapseColor: 'bg-info ',
          asideColor: 'bg-black',
          headerFixed: true,
          asideFixed: true,
          asideFolded: false
        }
      };


      // click 跳转 , 第一个  必须为 state ,
      //               第二个 必须是 params || null ; ,
      //              第三个以后 ( 可多个) 是 cache

      $scope.goto = function () {
        var state = arguments[0],
          params = arguments[1], //
          value = arguments[2];

        if (value) {
          var v = Array.prototype.splice.call(arguments, 2)
          $sessionStorage.cache = v;
          $scope.$$cache = v;
        }
        $state.go(state, params);
      }
      // 自动存入 sessionStorage  ;
      $scope.$watch("$$cache", function (n, o) {
        console._log("放入 sessionStorage 数据", n);
        $sessionStorage.cache = n;
      }, true)

      // 赋初始值 ;
      $scope.$$cache = $sessionStorage.cache


      //=========form 验证=====  默认 验证 form[ name = "form"] ;
      $scope.validForm = function (formName) {
        formName = formName || "form";
        var valids = this[formName] || this.$$childTail[formName];
        if (valids && valids.$invalid) {
          // 处理 form 的 validate ;
          var errName;
          angular.forEach(valids.$error, function (e, k) {
            console._log(e);
            angular.forEach(e, function (modelCtrl, k1) {

              modelCtrl.$setViewValue(modelCtrl.$viewValue);

            })
          });
          throw (" form invalid !!")
        }
      }

      $scope.ccPassWord = function () {
        $modal.open({
          templateUrl: "athena/cc_password.html",
          // size:"sm",
          controller: function ($scope, $modalInstance, $source ) {
            $scope.op = {} ,
            $scope.od = {} ,
              $scope.__proto__ = S ,
              $scope.$modalInstance = $modalInstance;

            $scope.done = function () {
              $scope.validForm();
              $source.$common.cc_passWord($scope.op, function ( resp ) {
                if( resp.msg){
                   $scope.od.msg = resp.msg ; 
                   return ; 
                }

                alert("修改成功!");
                console._log("修改成功!");
                $scope.cancel();
              })
            }
          }
        })
      }


      // save settings to local storage
      if (angular.isDefined($localStorage.settings)) {
        $scope.app.settings = $localStorage.settings;
      } else {
        $localStorage.settings = $scope.app.settings;
      }
      $scope.$watch('app.settings', function () {
        $localStorage.settings = $scope.app.settings;
      }, true);

      // angular translate
      $scope.lang = {
        isopen: false
      };
      $scope.langs = {
        en: 'English',
        zh_CN: '简体中文'
      };
      $scope.selectLang = $scope.langs[$translate.proposedLanguage()] || "简体中文";
      $scope.setLang = function (langKey, $event) {
        // set the current lang
        $scope.selectLang = $scope.langs[langKey];
        // You can change the language during runtime
        $translate.use(langKey);
        $scope.lang.isopen = !$scope.lang.isopen;
      };

      function isSmartDevice($window) {
        // Adapted from http://www.detectmobilebrowsers.com
        var ua = $window['navigator']['userAgent'] || $window['navigator']['vendor'] || $window['opera'];
        // Checks for iOs, Android, Blackberry, Opera Mini, and Windows mobile devices
        return (/iPhone|iPod|iPad|Silk|Android|BlackBerry|Opera Mini|IEMobile/).test(ua);
      }

      //===================================================================================
      //===================================================================================
      //===================================================================================

      /* if( $sessionStorage.navs){
       $scope.navs = $sessionStorage.navs ;
       }else{
       $sessionStorage.navs = [] ;
       }*/

      if (!$sessionStorage.navs) {
        $sessionStorage.navs = [];
      }

      $scope.navs = $sessionStorage.navs;

      console._log($scope.navs);

      function transState($title, $state, tab) {
        if (angular.isString($state)) {
          return {
            id: $state,
            title: $title
          }
        } else {
          return {
            id: $state.current.name,
            title: $title,
            state: {
              name: $state.current.name,
              params: $state.params
            },
            tab: tab
          }
        }
        ;
      }


      function pushNav(nav) {
        var nc, index; // nc  意思 : 包包括;

        $.each($scope.navs, function (i, n) {
          index = i;
          return nc = (n.id != nav.id);
        });
        if (nc) {
          $scope.navs.push(nav);
        }
        return [nc, index]
      }

      // 管理  || 展示 根 ;
      $scope.$rootNav = function ($title) {
        $scope.navs[0] = {
          title: $title,
          id: 'root'
        };
      };

      // 清空 nav ;
      $scope.$moduleNav = function ($title, $state) {
        var s = transState($title, $state);
        $scope.navs = $sessionStorage.navs = $scope.navs.splice(0, 1);
        pushNav(s);
      };


      // 追加 nav  ;
      $scope.$appendNav = function ($title, $state) {
        if ($scope.navs[$scope.navs.length - 1].title != $title) {
          pushNav(transState($title, $state));
        }
        console._log($scope.navs, $sessionStorage);

      };

      // (tab 类型 )替换最后一个 nav;
      $scope.$popNav = function ($title, $state) {
        var l, s, r;
        l = $scope.navs[$scope.navs.length - 1];
        s = transState($title, $state, true);

        if (l.tab) {
          $scope.navs.pop();
        }
        r = pushNav(s);
        if (!r[0]) {
          $scope.navs = $scope.navs.splice(0, r[1] + 1);
        }
        ;
      };


      $scope.navGo = function (n) {
        if (!n.state) return;
        $state.go(n.state.name, n.state.params);
        //$state.go();
      };


      // 弹出框 管理;
      $scope.popupWindow = function (cfg) {
        $modal.open({
          templateUrl: cfg.tmeplateUrl, //'athena/views/file_upload_temp.html',
          controller: function () {
          },
          size: cfg.size, //size
          resolve: cfg.resolve
        });
      };

      // 关闭弹出 window
      $scope.cancel = function () {
        this.$modalInstance.dismiss('cancel');
      };

      // 登出;
      $scope.logout = function () { //ui-sref="access.signin"
        $account.logout(
          function (ret) {
            console._log(ret);

            console._log("注销!!");

            $scope.user = null;

            $state.go('access.signin');
            // $window.location ="/athena" ;
          }
        );
      };

      // 公共 采集站 模版 的  替换, 失败, 移除 ,  在  appCtrl中定义;

      // 替换;
      $scope.chaStation = function (scope, station, index) {

        $modal.open({
          templateUrl: 'athena/views/dastation/station_change.html',
          size: "md", //size  lg md  sm
          resolve: {
            station: function () {
              return station
            }
          },
          controller: function ($scope, station, $modalInstance, $source) {
            $scope.__proto__ = scope;

            console._log("changeDastation");
            console._log($scope);

            $scope.station = station;
            $scope.cancel = function () {
              $modalInstance.dismiss('cancel')
            };
            // 替换逻辑;
            $scope.done = function (btn) {
              console._log(111);
              //$scope.checkModalForm(btn, $scope);
              // if (!$scope.$$childTail.form.$valid) return;
              $scope.validForm();


            }
          }
        });
      };

      //  采集占失效   失败;
      $scope.effStation = function (dastations, station, index) {
        $scope.confirmInvoke({title: "失效系统 " + station.name + " ?"}, function (next) {
          var d = {uuid: station.uuid, state: 0};
          $source.$system.put(d, function (resp) {
            dastations.splice(index, 1);
            next();
          })
        })


        /*  $modal.open({
         templateUrl: 'athena/views/dastation/station_efficacy.html',
         size: "md", //
         resolve: {
         station: function() {
         return station
         }
         },
         controller: function($scope, $modalInstance, station) {
         $scope.station = station;
         console._log("effStation 采集占失效 有效 失败;  ");

         $scope.cancel = function() {
         $modalInstance.dismiss('cancel')
         };


         }
         });*/
      };


      // 移除;
      $scope.delStation = function (dastations, station, index) {
        $scope.confirmInvoke({title: "您是否要删除系统 " + station.name + " ?"}, function (next) {
          $source.$system.delete({system_id: station.uuid}, function (res) {
            dastations.splice(index, 1);
            next();
          });
        })
      };

      //激活采集站;
      $scope.activateStation = function (scope, dastations, station, index, updataOrDel) {
        console._log("opt=", updataOrDel);

        $scope.confirmInvoke({title: "激活采集站 " + station.name + " ?"}, function (next) {
          // 激活采集站;
          var d = {uuid: station.uuid, state: 1};
          $source.$system.put(d, function (resp) {
            station.state = 1;
            dastations && ( dastations.splice(index, 1) );
            next();
          })
        })
      };

      // 编辑采集站;

      $scope.editStation = function (scope, s, index) {
        console._log("editStation");
        $modal.open({
          templateUrl: "athena/views/dastation/station_edit.html",
          controller: function ($scope, $source, $modalInstance, $project) {
            $scope.__proto__ = scope;
            console._log(s, $scope);
            $scope.das = {
              name: s.name,
              desc: s.desc
            }; //angular.copy(s) ;

            $scope.op = {};
            $scope.projs = [];

            $project.getAllprojsBasic(function (resp) {
              $scope.projs = resp.ret;
              if (s.group_id) {
                $.each($scope.projs, function (i, n) {
                  if (s.group_id == n.id) {
                    $scope.op._proj = n;
                    return false;
                  }
                })
              } else {
                $scope.op._proj = resp.ret[0]
              }

            });

            $scope.cancel = function () {
              $modalInstance.dismiss('cancel')
            };
            $scope.done = function (btn) {
              // $scope.checkModalForm(btn, $scope);
              $scope.validForm();
              var d = $scope.op._proj;
              $scope.das.group_id = d.id ,
                $scope.das.uuid = s.uuid;
              $source.$system.put($scope.das, function (resp) {
                  console._log(resp);
                  $scope.das.proj_name = d.projName;
                  angular.extend(s, $scope.das);
                  $scope.cancel();

                }
              );
            }

          }
        });
      };


      // 同步 das 配置;
      $scope.syncSystem = function (das) {
        console._log(das, this);
        this.sync_start = true;
        var that = this;
        $source.$system.sync({pk: das.uuid}, {}, function (resp) {
          that.sync_start = false;
          das.needsync = false;
          that.sync_err_msg = resp.err;
          that.sync_ret_msg = resp.err ? undefined : "同步完成";
        });
      };

      //  启动 采集站;
      //  在
      $scope.startSystem = function (sys, systems, index) {
        var uuid = sys.uuid;

        function start(uuid) {
          return $source.$system.start({pk: uuid}).$promise;
        }

        if (systems) {
          $scope.confirmInvoke({title: "启动系统 " + sys.name + " ?"}, function (next) {
            start(uuid).then(function (resp) {
              systems.splice(index, 1);
              next();
            });
          })
        } else {
          start(uuid).then(function (resp) {
            alert(angular.toJson(resp))
          });
        }


      }


      // 弹出展示属性;
      $scope.popup2ShowProps = function (title, props) {
        $modal.open({
          templateUrl: '../../debris/prop_view.html',
          //   resolve:{ title: function (){ return  title } ,  props: function (){ return props} } ,
          //   controller: function( $scope ,$modalInstance , title , props  ){
          controller: function ($scope, $modalInstance) {
            console._log("  delStation  ");
            $scope.cancel = function () {
              $modalInstance.dismiss('cancel')
            };
            console._log(props);
            $scope.props = props;
            $scope.title = title;

          }
        });
      };

      /**
       * msg = { title : '标题' , note:  注释 , warn: 警告  }
       * handler : funcction  ;     handler 最好有 true false 返回值 , 以便derfer 处理 ;
       * @param msg
       * @param handler
       */
      $scope.confirmInvoke = function (msg, handler) {
        $modal.open({
          templateUrl: 'athena/views/debris/confirm_invoke.html',
          //resolve:{ msg: function (){ return  msg } ,  handler: function (){ return handler} } ,
          //  controller: function( $scope ,$modalInstance , $q ,  msg , handler  ){
          controller: function ($scope, $modalInstance) {
            $scope.cancel = function () {
              $modalInstance.dismiss('cancel')
            };
            $scope.done = function () {
              handler ? handler($scope.cancel) : $scope.cancel();
            };
            $scope.msg = msg;

          }
        });
      };


      //************** tip 显隐 ************************************

      var tipDom, b, pos, x, y, _x, _y;
      $scope.showTip = function (type, version, params, $ele) {
        if (null == params) return;

        if (!tipDom) tipDom = $("#tip_dom");

        $scope.$apply(function () {
          pos = $ele.offset();
          try {
            b = angular.fromJson(params);
            // tip 为数字, json 串 ;
            angular.isNumber(b) ? (
              $scope.tip_params = undefined,
                $scope.tip_msg = b
            ) : ( // json 对象;
              $scope.tip_params = b,
                $scope.tip_msg = undefined
            );

            $scope.type = type;
            $scope.version = version;
            console.log(type, version);
          } catch (e) {
            // tip 为 字符串;
            $scope.tip_params = undefined;
            $scope.tip_msg = params + "";
          }
          tipDom.show();
          $timeout(function () {
            x = tipDom.innerWidth(),
              y = tipDom.innerHeight(),
              _x = $ele.innerWidth(),
              _y = $ele.innerHeight();
            tipDom.offset({
              top: pos.top - y - 10,
              left: pos.left + (_x - x) / 2
            });
          }, 10)
        });

      };

      $scope.hiddenTip = function () {
        $scope.$apply(function () {
          $scope.tip_params = undefined;
          $scope.tip_msg = undefined;
          tipDom.offset({
            left: -300
          });
        });
      };


      //********************

    }
  ])

 


})
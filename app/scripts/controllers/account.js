angular.module('app.account', [])

.controller("account_info", function($scope, $state, $account) {
    console._log("account_info");
    console._log($scope);

    $scope.$moduleNav("账户信息", $state);
    // 采集占序列号;
    $account.getStationSn(function(resp) {
        $scope.sns = resp.ret;
      })
      // 账户信息; 项目, user ,station 数量
    $account.getBasicInfo(function(resp) {
      console._log(resp);
      $scope.accMsg = resp.ret;
    })



    $scope.product = [{
        di: "1",
        name: "aaaaa"
      }, {
        di: "2",
        name: "bbbb"
      }, {
        di: "3",
        name: "ccccc"
      }, {
        di: "4",
        name: "dddd"
      }]
      // 15 30 60 分钟;   5 10 15 30 分钟;    30 60秒, 5分钟;
    $scope.s1 = [15, 30, 60];
    $scope.s2 = [5, 10, 15, 30];
    $scope.s3 = [30, 60, 300];

  })
  .controller("acco_promi", function($scope, $modal, $state) {
    console._log("acco_promi");
    console._log($scope);
    // 注册吗 输入 公共方法;
    $scope.addRegNo = function(handler) {
      $modal.open({
        templateUrl: "../../debris/regist_no.html",
        // resolve:{ handler: function (){return handler}} ,
        controller: function($scope, $modalInstance) {
          var $target, val, keycode,
            NUM = 3; // 每个输入狂有几个字符;

          $scope.cancel = function() {
            $modalInstance.dismiss("cancel");
          };
          $scope.$obj = {
            a: 111,
            b: 333
          };

          console._log(handler);

          $scope.done = function() {
            //handler.call( this , $scope.$obj );
            handler($scope.$obj);
            $scope.cancel();
          };
          $scope.No = [111, 111, 111, 111];
          // 够N为 自动跳转 下一个 input逻辑;


          $scope.keyUp = function(i, $event) {

            $target = $($event.target),
              val = $target.val();
            keycode = $event.keyCode;

            if ((keycode == 46 || keycode == 8) && !val) { // delete keycode = 46;     BackSpace = 8
              var $prev = $target.prev();
              _val = $prev.val();
              $prev.val('').focus().val(_val);
            }
          };

          $scope.changeV = function(i, v) {
            if (v.length > NUM - 1) {
              $scope.No[i] = v.substr(0, NUM);
              var $next = $("#regno_in_" + (i + 1)), //.get(i+1),
                val = $next.val();
              $next.val('').focus().val(val);
            }

          };
        }
      });
    };


  })

.controller("acco_promi_billing", function($scope, $state) {

  //console._log(this);
  console._log("acco_promi_billing");
  console._log($scope);

})

.controller("acco_promi_regist", function($scope, $state) {
  console._log("acco_promi_regist");
  console._log($scope);

  $scope.addRegistNo = function() {
    $scope.addRegNo(function($obj) {
      // rest 传递的参数; $obj ;
      console._log($obj);
    })
  };

  $scope.useRegistNo = function() {
    $scope.confirmInvoke({
      title: "使用注册吗"
    }, function() {
      alert("使用注册吗逻辑")
    })
  };


})

.controller("acco_promi_sms", function($scope) {
  console._log("acco_promi_sms");
  console._log($scope);



  $scope.addSmsNo = function() {
    $scope.addRegNo(function($obj) {
      // rest 传递的参数; $obj ;
      console._log($obj);
    })
  };
  $scope.useSmsNo = function() {
    $scope.confirmInvoke({
      title: "使用短信注册吗"
    }, function() {
      alert("使用短信注册吗逻辑")
    })
  };



})

.controller("acco_promi_user", function($scope, $state) {
  console._log("acco_promi_user");
  console._log($scope);

  $scope.addUserNo = function() {
    $scope.addRegNo(function($obj) {
      // rest 传递的参数; $obj ;
      console._log($obj);
    })
  };
  $scope.useUserNo = function() {
    $scope.confirmInvoke({
      title: "使用user注册吗"
    }, function() {
      alert("使用user注册吗逻辑")
    })
  };


})

.controller("account_users", function($scope, $state, $account ) {
    $scope.$moduleNav("用户pop", "_user");
    // 更改密码;
    $scope.editUser = function(user) {
      var a = prompt("输入新密码!")
      if (a) {
        var p = prompt("输入操作吗!")
        if (p) {
          
          $account.save({
            operate: "update"
          }, {
            id: user.id,
            password: a,
            accesskey: p
          }, function(resp) {
            alert(resp.ret ? "成功!" : "失败!")
          })
        }
      };
    }
  })
  .controller("acco_user_all", ['$scope', '$account', '$state', '$stateParams', '$sys', '$modal',
    function($scope, $account, $state, $stateParams, $sys, $modal) {
      console._log("acco_user_all");
      console._log($scope);

      $scope.$popNav("用户", $state);


      $scope.loadPageData = function(pageNo, total) {

        var d = angular.extend({
          currentPage: pageNo,
          total: total
        }, $sys.pager);


        // var page = angular.extend( { currentPage:pageNo , total: $scope.page.total  } , $sys.pager   );

        $account.getAllUser(d, function(resp) {
          $scope.page = resp.ret;
        })

      }



      $scope.loadPageData(1);

      $scope.addProjForUser = function(user) {
        $modal.open({
          templateUrl: "athena/views/account/users_add_proj.html",
          controller: ['$scope', '$modalInstance', '$project', function($scope, $modalInstance, $project) {
            //$scope.__proto__ = scope ;
            $scope.d = {};


            $account.getProjRoles({
              withAuthor: true
            }, function(resp) {
              $scope.roles = resp.ret;
            });

            $project.getAllprojsBasic(function(resp) {
              $scope.projs = resp.ret;
            })

            $scope.done = function() {
              //   console.log(  $scope.$$childTail.form.$valid );
              if ($scope.$$childTail.form.$valid) {
                // 工程下挂 用户;
                $scope.d.userId = user.userId;
                $account.createProjUser($scope.d, function(resp) {
                  if (resp.ret) {
                    alert("添加成功!");
                    $scope.cancel();
                  };
                });

              }
            }

            $scope.cancel = function() {
              $modalInstance.dismiss('cancel')
            };

          }]
        })
      }



    }
  ])

.controller("acco_user_byproj", ['$scope', '$account', '$state', 'data',
  function($scope, $account, $state, data) {
    console._log("acco_user_byproj");
    console._log($scope);
    // $scope.$popNav("按项目划分用户", $state);

    /*    var ups = [] ;

       angular.forEach( data.ret , function(v,k){
           ups.push(  {projId: v.id , isProj:true , projName: v.projName });
           angular.forEach(v.userList, function(v1,k1){
               var u =  angular.copy(v1);
               u.isUser =true ;
               u.resourceMap = {};  //[ 1,2,3,4,5 ... 14]
               v1.resources && v1.resources.split(",").forEach(function(v,k){
                  u.resourceMap[v] = true ;
               })

              ups.push( u );
           });
       })
    */

    $scope.proj_users = data.ret;

  }
])

.controller("acco_user_add", function(role_proj, $scope, $account, $timeout, $state ) {
    console._log("acco_user_add");

    console._log($scope, role_proj);

    $scope.uiRoles = role_proj[0].ret[0];
    $scope.projRoles = role_proj[0].ret[1];

    $scope.projs = role_proj[1].ret;


    $scope.$popNav("添加用户", $state);

    $scope.pjs = [];
    $scope.rs = [];

    $scope.addProj = function() {
      if ($scope.pjs.length >= $scope.projs.length) {
        alert("权限内无更多的工程可添加到新用户");
        return;
      }

      $scope.pjs.push({});

    };



    // 检查 proj重复选择;
    $scope.checkDup = function(pj, index) {
      console._log(pj, index);
      $.each($scope.pjs, function(k, v) {
        if (v.projId == pj.projId && index != k) {
          alert("已选择过该工程");
          pj.projId = "";
          return false;
        }
      })
    };



    $scope.delP = function(index) {

      $scope.pjs.splice(index, 1);
    }

    // 创建用户;
    $scope.commit = function() {

      console._log("adduser");


      if (!$scope.form.$valid) return;
      if ($scope.can_use) return;


      // 检查 role  ; 不论 projId 有无, role必须有一个;
      var data = {};

      // 创建user 需要关联 工程时 才用 ;
      /*
      if(!$scope.pjs.length){
         alert("需添加角色或者工程");
         return ;
      }*/

      $.each($scope.pjs, function(k, v) {
        data[v.projId] = v.roles;

        if (!v.projId) {
          alert("请选择第 " + (k + 1) + " 项的工程?");
          throw ("请选择第 " + (k + 1) + " 项的工程?");
          return false;
        };

        if (!v.roles || !v.roles.length) {
          alert("请选择第 " + (k + 1) + " 项的角色?");
          throw ("请选择第 " + (k + 1) + " 项的角色?");
          return false;
        };
      })

      console._log(data)

      var user = angular.copy($scope.user); 


      $account.createUser(user, function(resp) {
        if (!resp.ret) return;

        alert("创建成功!");
        $scope.can_use = false;

        // 清空 select2  选择框;
        // $(".search-choice-close").trigger("click") ;

        $scope.user = {};
        $scope.user.roleId = $scope.uiRoles[0].id

        $scope.confirm_password = "";


      });
    };

    $scope.user = {};

    var delay = null;
    $scope.can_use = false;

    // 检查用户重名;
    $scope.checkname = function() {
      delay = $timeout.cancel(delay);
      var n = $.trim($scope.user.username);
      if (n) {
        delay = $timeout(
          function() {
            $account.isDuplicate({
                username: $scope.user.username
              },
              function(resp) {
                console._log(resp);
                if (resp)
                  $scope.can_use = !resp.ret;
              })
          }, 500
        );
      }
    }



  })
  .controller("acco_visdata", function($scope, $modal, $state) {
    console._log("acco_visdata");
    console._log($scope);


    // 添加 外部数据访问 公共方法;
    $scope.addVisData = function(handler) {
      $modal.open({
        templateUrl: "../visdata_add.html",
        // resolve:{ handler: function (){return handler}} ,

        controller: function($scope, $modalInstance) {
          $scope.cancel = function() {
            $modalInstance.dismiss("cancel");
          };

          $scope.$obj = {
            a: 111,
            b: 333
          };

          console._log(handler);

          $scope.done = function() {
            //handler.call( this , $scope.$obj );
            handler($scope.$obj);
            $scope.cancel();
          };
        }

      });
    };

    $scope.addPublish = function(handler) {
      $modal.open({
        templateUrl: "../visdata_addpublish.html",
        // resolve:{ handler: function (){return handler}} ,
        controller: function($scope, $modalInstance) {
          $scope.cancel = function() {
            $modalInstance.dismiss("cancel");
          };

          $scope.$obj = {
            a: 111,
            b: 333
          };

          console._log(handler);

          $scope.done = function() {
            //handler.call( this , $scope.$obj );
            handler($scope.$obj);
            $scope.cancel();
          };
        }

      });

    };

  })

.controller("acco_visdata_net", function($scope, $state) {
    console._log("acco_visdata_net");
    console._log($scope);


    $scope.addNetVis = function() {
      $scope.addVisData(function() {
        alert("添加 net vis")
      });
    }


  })
  .controller("acco_visdata_rss", function($scope, $state) {
    console._log("acco_visdata_rss");
    console._log($scope);



    $scope.addRssVis = function() {
      $scope.addVisData(function() {
        alert("添加 rss vis")
      });
    }
  })

.controller("acco_visdata_profiles", function($scope, $state) {
    console._log("acco_visdata_profiles");
    console._log($scope);

    $scope.addPublishProfile = function() {
      $scope.addPublish(function() {
        alert("添加 profile  publish ");
      });
    }

  })
  .controller("acco_useredit", function($scope, $state) {

    console._log("acco_useredit");

    console._log("配置 tabs 参数; ");


    var basePath = "athena/views/account/",
      current = "users_edit_author.html";

    $scope.currentTab = basePath + current;

    $scope.tabs = [{
      title: "报警",
      url: "users_edit_alarm.html"
    }, {
      title: "权限",
      url: "users_edit_author.html"
    }, {
      title: "安全",
      url: "users_edit_security.html"
    }, ];

    /*  $sysconfig.getTabConfigFile(function (resp) {
          console._log( resp)  ;

          $scope.tabs = resp.useredit.tabs ;
          $scope.currentTab  = $scope.tabs[resp.useredit.currenttab].url ;
      });*/

    $scope.onClickTab = function(tab) {
      current = tab.url;
      $scope.currentTab = basePath + tab.url;
    };

    $scope.isActiveTab = function(tabUrl) {
      return tabUrl == current;
    };



  })
  .controller("acco_useredit_msg", function($scope, $state) {
    console._log("acco_useredit_msg");

  })

.controller("acco_useredit_security", function($scope, $state) {
    console._log("acco_useredit_security");


    $scope.radioModel = true;



  })
  .controller("acco_useredit_author", [
    '$scope', '$project', '$account', '$state', '$stateParams', '$utils', "$q", "$modal",
    function($scope, $project, $account, $state, $stateParams, $utils, $q, $modal) {

      console._log("acco_useredit_author", $scope.$$cache);

      $scope.user = $scope.$$cache[0];


      $q.all([
        // 得到所用 工程!
        $project.getAllprojsBasic().$promise,
        //得到所有工程 角色 带权限;
        $account.getProjRoles({
          withAuthor: true
        }).$promise,

        //得到 proj 角色的权限集 ;
        $account.getAuthor({
          type: "proj"
        }).$promise

      ]).then(function(data) {
        $scope.projs = data[0].ret;
        $scope.kv_projs = $utils.propAsKey(data[0].ret, "id");
        $scope.roles = data[1].ret;
        $scope.kv_roles = $utils.propAsKey(data[1].ret, "id");

        $scope.authors = data[2].ret;

        //得到 user 对应的 proj ;
        $account.getUserWidthProj({
          userId: $scope.user.userId
        }, function(resp) {
          $scope.userProjs = resp.ret;
        });

      })

      // 某工程上 更换角色;
      $scope.changeRole = function(pr, scope) {
        pr.userId = $scope.user.userId;
        $account.updateProjUser(pr, function(resp) {
          if (!resp.ret) {
            alert("修改失败!")
          }
        })


      }

      // 添加 控制工程;
      var thatScope = $scope;
      $scope.addProj = function() {
        console._log("addProj");
        $modal.open({
          templateUrl: "../users_add_proj.html",
          controller: ['$scope', '$modalInstance', '$project', function($scope, $modalInstance, $project) {
            $scope.__proto__ = thatScope;
            $scope.d = {};
            $scope.done = function() {
              if ($scope.$$childTail.form.$valid) {
                // 工程下挂 用户;
                $scope.d.userId = $scope.user.userId;
                $account.createProjUser($scope.d, function(resp) {
                  if (resp.ret) {
                    alert("添加成功!");
                    $scope.userProjs.push($scope.d);
                    $scope.cancel();
                  };
                });
              }
            }
            $scope.cancel = function() {
              $modalInstance.dismiss('cancel')
            };
          }]
        })
      }



    }
  ])

.controller("acco_useredit_alarm", function($scope, $state) {
  console._log("acco_useredit_alarm");


})

.controller('acco_author', function($scope, $state, $stateParams, $account, data, $modal) {

  console._log("acco_author", data);
  var thatScope = $scope;

  // data = [ roles  , authors ]
  $scope.roles = data[0].ret;
  $scope.authors = data[1].ret;

  $scope.role2updata = [];

  // 点击 checkbox ;
  $scope.editRole = function(r) {
    console._log(r)

    if ($scope.role2updata.indexOf(r) === -1) {
      $scope.role2updata.push(r); // ={ resourceMap:r.resourceMap ,  roleName:r.roleName } ;

    };
  }

  //点击 确定 按钮;
  $scope.updateRoles = function() {
    if (!$scope.role2updata.length) return;
    $account.updateRoles($scope.role2updata, function(resp) {
      console._log(resp);
      $scope.role2updata = [];
      alert("修改成功!")

    })

  }

  var scope = $scope;
  $scope.addRole = function() {
    $modal.open({
      templateUrl: "athena/views/account/author_addrole.html",
      controller: function($scope, $modalInstance) {
        $scope.__proto__ = scope;

        $scope.r = {
          name: "",
          authorIds: {}
        };
        $scope.cancel = function() {
          $modalInstance.dismiss("cancel");
        };
        $scope.done = function() {

          $scope.validate($scope.r.name, "请输入角色名");

          $account.crateRoles($scope.r, function(resp) {
            console._log(resp.ret);
            
            console._log("还没有 role id  ; !!");
            if (resp.ret) {
              $scope.r.id = resp.ret[0];
              if ($scope.r.type === "ui") {
                $scope.roles[0].push(angular.copy($scope.r));
              } else {
                $scope.roles[1].push(angular.copy($scope.r));
              } 
            }
            $scope.cancel();
          })
        }
      }
    })
  }

  $scope.delRole = function(r, index) {
    $scope.confirmInvoke({
      title: '删除角色:' + r.name + " ?"
    }, function(next) {
      $account.delRoles({
        ids: [r.id]
      }, function(resp) {
        console._log(resp);

        if (r.type === "ui") {
          $scope.roles[0].splice(index, 1);
        } else {
          $scope.roles[1].splice(index, 1);
        }

        next();

      })

    })

  }

})

;
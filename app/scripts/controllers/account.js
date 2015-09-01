angular.module('app.account', [])

.controller("account_info", function($scope, $state, $source) {
  console._log("account_info");
  console._log($scope);

  $scope.$moduleNav("账户信息", $state);


  // 账户信息; 项目, user ,station 数量
  $source.$account.getByPk({
    pk: 1234
  }, function(resp) {
    console._log(resp);
    $scope.accMsg = resp.ret;
  })

})

.controller("account_users", function($scope, $state, $source, $sys) {



  // 分页 加载 users ; 

  $scope.user = {};

  $scope.loadPageData = function(pageNo) {
    var d = {
      currentPage: pageNo,
      itemsPerPage: $sys.itemsPerPage
    };
    $source.$user.query(d, function(resp) {
      $scope.page = resp;
      $scope.page.currentPage = pageNo;
    })
  }

  $scope.loadPageData(1);



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

  $scope.createUser = function() {

    $source.$user.save($scope.user, function(resp) {

    })

  }
})


.controller("usergroup", function($scope, $state, $source, $sys, $sessionStorage) {

  console.log($sessionStorage);

  $scope.page = {
    currentPage: 1, 
  };

  $scope.loadPageData = undefined; 

  var  groupPage , userPage ,d ;


  var tabToGroup = function( ) {   
    $scope.loadPageData = loadPageData_userGroup; 
    if( !groupPage){
        d = { itemsPerPage: $sys.itemsPerPage }; 
        $scope.loadPageData( 1 ); 
    } else{
        $scope.page = groupPage ; 
    }
  } 
 
  var tabToGroupUser = function( ) {
    $scope.loadPageData = loadPageData_usersOfGroup;
    if( !userPage ){
        d = { pk:"xxx", itemsPerPage: $sys.itemsPerPage };
        $scope.loadPageData(1);
    }else{
       $scope.page = userPage ; 
    }
  };

  var loadPageData_userGroup = function( pageNo){ 
      d.currentPage = pageNo ; 
      $source.$userGroup.query(d , function( resp ){
            if( $scope.loadPageData  === loadPageData_userGroup   && resp.data ){
                groupPage = resp ; 
                groupPage.currentPage = pageNo ; 
                $scope.page =  groupPage ; 
            }

      } ) 
  }

  var loadPageData_usersOfGroup = function( pageNo ){
      d.currentPage = pageNo ; 
      $source.$userGroup.queryUser(d , function( resp){
          if( $scope.loadPageData === loadPageData_usersOfGroup && resp.data ){
              userPage = resp ; 
              userPage.currentPage = pageNo ; 
              $scope.page = userPage ; 
          }
      })
  }
 


  /**
    select , deselect  这两个key 是固定写死的; 
    修改  bootstrp-tpl.js   "  directive("tab", " 处 的 controller  强关联 到 select , deselect ;     "
  */

  var rootUrl = "athena/views/account/"
  $scope.tabs = [{
    title: '所有组',
    select: tabToGroup, 
    className: "fa  fa-group",
    url: rootUrl + "usergroup_all.html"
  }, {
    title: "组用户",
    select: tabToGroupUser,
    className: "icon icon-users",
    url: rootUrl + "usergroup_users.html"
  }, {
    title: "添加组",
    className: "icon icon-user-follow",
    url: rootUrl + "usergroup_add.html"
  }];

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


.controller('acco_role', function($scope, $state, $stateParams,   $modal) {

  console._log("acco_author");
  var thatScope = $scope;
 

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
 
  $scope.addRole = function() {
    $modal.open({
      templateUrl: "athena/views/account/author_addrole.html",
      controller: function($scope, $modalInstance) {
        $scope.__proto__ = thatScope;

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

.controller('acco_author', function($scope, $state, $source) {



})

;
angular.module('app.account', [])

.controller("account_info", function($scope, $state, $source) {
    //@if  append

    console.log($scope);
    //@endif 

    $scope.$moduleNav("账户信息", $state);


    // 账户信息; 项目, user ,station 数量 

    $source.$account.get({
        "account_id": $scope.user.account_id
    }, function(resp) {

        //@if  append
        console.log(resp);
        //@endif 

        $scope.account = resp.ret;

    });

})

.controller("account_users", function($scope, $state, $source, $sys, $q, $modal) {

    //$scope.$moduleNav("用户pop", "_user");
    // $scope.$moduleNav("账户信息", $state);
    $scope.$moduleNav("用户", $state);

    // 分页 加载 users ;

    $scope.page = {};
    $scope.user = {};
    $scope.op = {};
    $scope.od = {
        groups: undefined
    };

    // 添加用户时 所属的 组;

    $scope.loadPageData = function(pageNo) {
        var d = {
            currentPage: pageNo || 1,
            itemsPerPage: $sys.itemsPerPage
        };
        $source.$user.query(d, function(resp) {
            $scope.page = resp;
            $scope.page.currentPage = pageNo;
        })
    }

    $scope.tabToUsers = function() {
        //if( !$scope.page.data){
        $scope.user = {
            mail_notice: 1,
            sms_notice: 1
        };
        $scope.op.confirm_password = undefined;
        $scope.loadPageData(1);
        //}
    }

    // 加载所有 角色 信息;



    $source.$userGroup.query({
        currentPage: 1
    }, function(resp) {
        $scope.groups = resp.data;
        // $scope.lgp = true ; 
    })


    // 更改user ;
    var S = $scope;
    // $scope.op = {idAdd:true }  ;
    $scope.editUser = function(arr, user, index) {
        $modal.open({
            templateUrl: "athena/account/users_edit.html",
            controller: function($scope, $modalInstance) {
                $scope.__proto__ = S;
                $scope.isEdit = true;
                $scope.$modalInstance = $modalInstance;
                $scope.op = {
                    isEdit: true,
                    ccpass: false
                };
                $scope.user = angular.copy(user);
                delete $scope.user.password;

                $scope.done = function() {
                    $source.$user.put({}, $scope.user, function() {
                        angular.extend(user, $scope.user);
                        $scope.cancel();
                    }, $scope.cancel)


                }
            }
        })
    }


    $scope.createUser = function() {

        $scope.validForm();

        $source.$user.save( {groupids: $scope.od.groups } ,$scope.user,
            function(resp) {
                // 添加到组; 分配几个组 调用几次; 
                // var p = [];
                // angular.forEach($scope.od.groups, function(v) {
                //     p.push($source.$userGroup.put({
                //         pk: v,
                //         userid: resp.ret
                //     }, {}).$promise);
                // })

                // $q.all(p).then(function() {
                //     alert("创建成功!")
                // })
                 
            
            }


        );
    }


    $scope.delUser = function(arr, u, i) {
        $scope.confirmInvoke({
            title: "删除用户:" + u.username + " ?"
        }, function(next) {
            $source.$user.delByPk({
                    pk: u.id
                },
                function(resp) {
                    arr.splice(i, 1);
                    next();
                },
                next
            )
        })
    }

})


.controller("usergroup", function($scope, $state, $source, $sys, $sessionStorage, $modal) {

    $scope.$moduleNav("用户组", $state);

    var S = $scope;

    $scope.page = {
        currentPage: 1
    };

    $scope.loadPageData = function(pageNo) {

        d = {
            itemsPerPage: $sys.itemsPerPage,
            currentPage: pageNo || 1
        };

        $source.$userGroup.query(d, function(resp) {
            if (resp.data) {
                $scope.page.data = resp.data;
                $scope.page.total = resp.total;
                $scope.page.currentPage = pageNo;
            }
        })

    };


    $scope.tabToGroup = function() {
        //if (!$scope.page.data ) {
        $scope.loadPageData(1);
        //} 
    }



    $scope.ug = {};

    // 创建用户组;
    $scope.commit = function() {
        $source.$userGroup.save($scope.ug, function(resp) {
 
            angular.alert("创建成功!") 
        })
    }


    // 删除组;
    $scope.delGroup = function(arr, g, i) {
        $scope.confirmInvoke({
            title: "删除用户组:" + g.name + " ?"
        }, function(next) {
            $source.$userGroup.delByPk({
                pk: g.id
            }, function(resp) {

                arr.splice(i, 1);
                next();

            }, next)
        })

    }

    // 更新组;

    $scope.editGroup = function(arr, g, i) {
        $modal.open({
            templateUrl: "athena/account/usergroup_edit.html",
            controller: function($scope, $modalInstance) {
                $scope.__proto__ = S;
                $scope.$modalInstance = $modalInstance;

                $scope.ug = angular.copy(g);
                $scope.done = function() {
                    $scope.validForm();
                    $source.$userGroup.put($scope.ug, function(resp) {

                        angular.extend(g, $scope.ug);
                        $scope.cancel();

                    }, $scope.cancel);
                }
            }
        })
    }

})


.controller("usergroup_users", function($scope, $state, $source, $sys, $localStorage) {


    $scope.usergroup = $scope.$$cache[0];

    $scope.$popNav($scope.usergroup.name + "(用户)", $state);

    var d = {
        itemsPerPage: $sys.itemsPerPage,
        pk: $scope.usergroup.id
    };
    $scope.page = {};

    //无分页接口;
    ($scope.loadPageData = function(pageNo) {
        d.currentPage = pageNo || 1;
        $source.$userGroup.queryUser(d, function(resp) {
            // if ($scope.loadPageData === loadPageData_usersOfGroup && resp.data) {

            // if (resp.ret) {
            //resp.currentPage = pageNo;

            //angular.extend($scope.page, resp);
            //无分页接口;
            $scope.page.data = resp.ret;
            // }
        })
    })(1);
    // $scope.loadPageData(1);

    // 移除用户;
    $scope.removeUser = function(arr, u, i) {
        $scope.confirmInvoke({
            title: "从组中移除用户:" + u.username + "?",
            note: "用户不会被删除!"
        }, function(next) {
            $source.$userGroup.delete({
                pk: $scope.usergroup.id,
                userid: u.id
            }, {}, function(resp) {

                arr.splice(i, 1);
                next();

            }, next)
        })
    }

})

.controller('acco_role', function($scope, $state, $stateParams, $sys, $source, $modal) {


    $scope.$moduleNav("角色", $state);

    var thatScope = $scope;


    $scope.role2updata = [];



    $scope.promise = [$sys.accountP, $sys.regionP]

    // $scope.allpromise = arrayUi.concat(arrayProj);


    $scope.regionRoles = [];
    $scope.accountRoles = [];

    $source.$role.get(function(resp) {
        angular.forEach(resp.ret, function(v, i) {
            (v.role_category ? $scope.regionRoles : $scope.accountRoles).push(v);
        })
    })

    //点击 确定 按钮 更新 role;
    $scope.updateRole = function(e, r, arr, i) {
        var d = [],
            s = this;

        angular.forEach($(e.currentTarget).parent('form').serializeArray(), function(v, i) {
            d.push(v.name)
        });
        $source.$role.put({
            pk: r.id
        }, {
            privilege: d
        }, function(resp) {
            s.op.edit = false;
            r.privilege = d;
        }, function() { // 恢复更改之钱的值;  闪回!
            arr[i] = angular.copy(r);
        });
    }

    $scope.addRole = function() {
        $modal.open({
            templateUrl: "athena/account/role_add.html",
            controller: function($scope, $modalInstance) {
                $scope.__proto__ = thatScope;
                $scope.$modalInstance = $modalInstance;
                $scope.op = {
                    type: "ui"
                };


                $scope.r = {
                    name: "",
                    role_category: 0,
                    authors: {}
                };

                $scope.done = function() {

                    $scope.validForm();
                    var privilege = [];
                    angular.forEach($scope.r.authors, function(k, v) {
                        v && (privilege.push(v))
                    });

                    delete $scope.r.authors;
                    $scope.r.privilege = privilege;

                    $source.$role.save(
                        $scope.r,
                        function(resp) {
                            $scope.r.id = resp.ret;
                            if ($scope.r.role_category) {
                                $scope.regionRoles.push(angular.copy($scope.r));
                            } else {
                                $scope.accountRoles.push(angular.copy($scope.r));
                            }

                            $scope.cancel();
                        },
                        $scope.cancel
                    )
                }
            }
        })
    }

    $scope.delRole = function(arr, r, index) {
        $scope.confirmInvoke({
            title: '删除角色:' + r.name + " ?"
        }, function(next) {

            $source.$role.delByPk({
                pk: r.id
            }, function(resp) {

                arr.splice(index, 1)

                next();
            }, next)
        })
    }

})

.controller('acco_author', function($scope, $state, $source) {
    // 预先加载 所有组;
    $scope.$moduleNav("权限", $state);


    $scope.gp = $source.$userGroup.query({
        currentPage: 1
    }).$promise;

    // 预先加载所有 角色 ;
    $scope.rp = $source.$role.get().$promise;

    $scope.gp.then(function(resp) {
        $scope.allgroups = resp.data;
    })

    $scope.rp.then(function(resp) {
        $scope.allroles = resp.ret;
    })

})

.controller("author_region", function($scope, $state, $source, $sys, $modal, $q) {
    var d = {
            itemsPerPage: $sys.itemsPerPage
        },
        S = $scope;
    $q.all([$scope.gp, $scope.rp]).then(function(resp) {
        //过滤 roles 得到 区域角色;
        $scope.regionroles = $scope.allroles.filter(function(v, i) {
            return v.role_category;
        })
    })

    //{source: .. , group:..}
    // source = region || app ;
    // 分页加载区域;
    $scope.loadPageData = function(pageNo) {
        d.currentPage = pageNo;
        $source.$region.query(d, function(resp) {
            $scope.page = resp;
            $scope.page.currentPage = pageNo;
        });
    }

    $scope.loadPageData(1);

    // 按需加载区域下的角色;
    $scope.loadPermission = function(scope, region) {
        if (!scope.groups) {
            $source.$permission.get({
                source: "region",
                source_id: region.id
            }, function(resp) {
                scope.groups = resp.ret;
                scope.groupids = scope.groups.map(function(v, i) {
                    return v.id;
                })


            })
        }
    }

    function addGroup2Region() {
        // body...
    }



    // 想区域中添加组; 附带权限;
    $scope.addAuthor = function(scope, arr, r) {

        $modal.open({
            templateUrl: "athena/account/author_region_add.html",
            controller: function($scope, $modalInstance) {
                $scope.__proto__ = scope;
                $scope.$modalInstance = $modalInstance;

                // 过路分组; 得到;未添加过的组 , 初始化 au ;
                $scope.done = function() {
                    $scope.validForm();
                    var permission = $(".modal-content")
                        .find("input[type=checkbox]")
                        .serializeArray()
                        .map(function(v) {
                            return v.name;
                        })

                    $source.$permission.save({
                            source: "region",
                            source_id: r.id,
                            group_id: $scope.au.group.id
                        },
                        permission,
                        function(resp) {
                            // 添加组; , 添加id引用;
                            var g = angular.copy($scope.au.group);
                            g.privilege = permission;
                            scope.groups.push(g);
                            scope.groupids.push($scope.au.group.id);
                            $scope.cancel();

                        },
                        $scope.cancel
                    )
                }

                $scope.groups2add = $scope.allgroups.filter(function(v, i) {
                    return !(scope.groupids.indexOf(v.id) + 1);
                })

                $scope.au = {
                    role: $scope.regionroles[0],
                    group: $scope.groups2add[0]
                };
            }
        })
    }

    // 删除  权限组; , 删除本地id引用;
    $scope.delGroup = function(scope, r, arr, g, i) {

        $scope.confirmInvoke({
            title: "移除权限组:" + g.name + "?"
        }, function(next) {
            $source.$permission.delete({
                source: "region",
                source_id: r.id,
                group_id: g.id
            }, function(resp) {
                // 删除数据;
                arr.splice(i, 1);
                // 删除 id 引用;
                scope.groupids.splice(scope.groupids.indexOf(g.id), 1);

                next();

            }, next)
        })
    }

    // 更新权限;    

    $scope.updateProm = function(scope, r, g, dom) {
        var permission = $(dom).parent()
            .find("form")
            .serializeArray()
            .map(function(v) {
                return v.name
            });

        $source.$permission.save({
                source: "region",
                source_id: r.id,
                group_id: g.id
            },
            permission,
            function(resp) {
                scope.op.edit = false;
                g.privilege = permission;

            }
        );

    }

})

.controller("author_account", function($scope, $state, $source, $sys, $modal) {

    // 加载 组中的account 权限 ;
    $scope.loadPermission = function(scope, group) {
        if (!group.promise) {
            $source.$permission.get({
                source: "account",
                group_id: group.id
            }, function(resp) {
                scope.promise = resp.ret && resp.ret.privilege;
            })
        }
    }

    $scope.ee = function(e) {
        //@if  append

        console.log(e);
        //@endif 
    }


    $scope.saveAuthor = function(scope, group, e) {

        var promise = $(e.target).parent("form").serializeArray().map(function(v) {
            return v.name;
        })


        $source.$permission.put({
            source: "account",
            group_id: group.id
        }, promise, function(resp) {
            scope.op.edit = 0;
        })
    }

});

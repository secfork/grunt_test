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

.controller("account_users", function($scope, $state, $source, $sys, $q, $modal , $modal) {

    //$scope.$moduleNav("用户pop", "_user");
    // $scope.$moduleNav("账户信息", $state);
    $scope.$moduleNav("用户", $state);

    // 分页 加载 users ;

    $scope.page = {};
    $scope.user = {};
    $scope.op = {};
    $scope.od = {
        groups: []
    };

    // var loadAllGroupsPromise = $source.$userGroup.query({
    //     currentPage: 1
    // }).$promise;

    

    // 添加用户时 所属的 组; 

    $scope.loadPageData = function(pageNo) {
        var d = {
            currentPage: pageNo || 1,
            itemsPerPage: $sys.itemsPerPage
        };

        $scope.showMask = true;

        $source.$user.query(d, function(resp) {
            $scope.page = resp;
            $scope.page.currentPage = pageNo;
            $scope.showMask = false;
        },
        function(){   $scope.showMask = false;  }
        );
    };
    $scope.loadPageData(1);
  
    // 加载所有 角色 信息;


    // 更改user ;
    var S = $scope;
    // $scope.op = {idAdd:true }  ;
    $scope.editUser = function(arr, user, index) {
        $modal.open({
            templateUrl: "athena/account/users_edit.html",
            resolve: {
                g: function() {
                    return $source.$user.get({
                        pk: "groups",
                        user_id: user.id
                    }).$promise;
                }
            },
            controller: function($scope, $modalInstance, g) {
                $scope.__proto__ = S;
                $scope.isEdit = true;
                $scope.$modalInstance = $modalInstance;
                $scope.op = {
                    isEdit: true,
                    ccpass: false
                };


                // "liszt:updated"事件，这样Chosen就会对更新过内容后的select
                // 选择框重新进行渲染。  
                //  $("#form-field-select").trigger("chosen:updated");   
                //  在 ui-jq 库中修改, 调用chonse插件是 初始化选项; 
                var oldgroups = (g.ret || (g.ret = [])).map(function(v) {
                    return v.id + "";
                });

                $scope.od = {
                    groups: oldgroups
                };

                $scope.user = angular.copy(user);

                delete $scope.user.password;

                $scope.done = function() {
                    $scope.validForm();

                    // 更改密码; 
                    if($scope.op.ccpass){
                        // $source.$use.

                    }



                    $scope.user.sms_notice  = undefined;
                    $scope.user.mail_notice = undefined;

                    //1 : 用户未验证手机和或邮件时，不能打开短信报警或邮件报警的开关
                    //2 : 当用户更改邮件或手机时，对应的报警接收开关
                    //     自动关闭，必须重新开启才能收到通知 (后台已经做处理)
                   // $scope.user.email_verified = 
                    
                   // 更新 email , mobile_phone , 自动关闭通知; 
                   var  u = angular.copy( $scope.user ) , cc_e , cc_m; 
                        // delete u.mobile_phone_verified;
                        // delete u.email_verified ;

                    if( u.email ===  user.email ){
                        delete  u.email ;
                    }else{
                        $scope.user.email_verified = 0 ;
                        //cc_e = true ; 
                    }

                    if( u.mobile_phone === user.mobile_phone ){
                        delete u.mobile_phone ;
                    }else{
                        $scope.user.mobile_phone_verified = 0 ;
                        //cc_m = true ;
                    }
 
                    $source.$user.put({},  u , function() {
                        
                        angular.extend(user, $scope.user);

                        // cc_e && ( $scope.$$user.mail_notice = false  ) ;
                        // cc_m && ( $scope.$$user.sms_notice = false  ) ;
 
 
                        // 用户组 更改时 ; 
                        // 新就 groups 比较 来判断是否要 增 删 ; 
                        // old = []  ; 
                        // new = [] ; 
                        var toDel = [],
                            di;

                        // 新组中有 老组的元素,移除; 
                        // 新组中 无 老组的元素 ; 加入 toDel ; 
                        // 新组新组中有剩余  ; 加入  toAdd ;     
                        oldgroups.forEach(function(v, i) {
                            di = $scope.od.groups.indexOf(v);
                            if (di < 0) {
                                toDel.push(v);
                            } else {
                                $scope.od.groups.splice(di, 1);
                            }
                        });

 
                        var toAdd = $scope.od.groups;
                        //@if  append
                        console.log(" 需删除---的组=", toDel);
                        console.log(" 需添加+++的组=", $scope.od.groups);
                        //@endif 


                        // toDel  ,  toADd = $scope.od.groups ;
                        // 删除项;
                        toDel.forEach(function(v) {
                            $source.$userGroup.delete({
                                pk: v,
                                userid: user.id
                            });
                        });

                        // 增加项 ;
                        $scope.od.groups.forEach(function(v) {
                            $source.$userGroup.put({
                                pk: v,
                                userid: user.id
                            }, null);
                        });




                        $scope.cancel();
                    }, $scope.cancel)
                }
            }
        })
    };

    $scope.createUser = function() {
        $modal.open({
            templateUrl:"athena/account/users_edit.html",
            controller:function($scope , $modalInstance){
                $scope.__proto__ = S ; 
                $scope.$modalInstance = $modalInstance;
                $scope.done = function(){

                    $scope.validForm();
                    $source.$user.save({
                            groupids: $scope.od.groups
                        }, $scope.user,
                        function(resp) {
                            angular.alert("创建用户成功", function() {
                                $scope.user = {
                                    // mail_notice: 1,
                                    // sms_notice: 1
                                };
                                $scope.op.confirm_password = undefined;
                            });
                        }
                    );
                }

            }
        }) 
    };


    $scope.delUser = function(arr, u, i) {
        $scope.confirmInvoke({
            title: "删除用户:" + u.username ,
            note:"确认要删除该用户吗?"
        }, function(next) {
            $source.$user.delByPk({
                    pk: u.id
                },
                function(resp) {
                    arr.splice(i, 1);
                    next();
                },
                next
            );
        });
    };

    

    // 验证联系方式;
    //        jjw 添加参数temp，标记是phone还是email
    $scope.verifyUser = function(u, i, temp) {
        $modal.open({
            templateUrl: temp == 'phone' ? "athena/account/users_verify_phone.html" : "athena/account/users_verify_email.html",
            controller: function($scope, $modalInstance, $interval) {
                $scope.$modalInstance = $modalInstance;

                $scope.__proto__ = S;
                $scope.u = angular.copy(u);
                $scope.ver = {};

                var smsInterval, emailInterval;

                var text = "重新发送(%)";


                var  cofText = { "email":"发送验证邮件" , "phone":'发送验证码'};

                function setInter(btnDom , type ) {
                    btnDom.disabled = true;
                    var times = 120;
                    smsInterval = $interval(function() {
                        $(btnDom).text(text.replace("%", times));
                        times--;
                        if (times < 0) {
                            btnDom.disabled = false;
                            
                            $(btnDom).text(  cofText[ type || "phone" ] );

                            $interval.cancel(smsInterval);
                        }
                    }, 1000)
                }



                $scope.sendEmail = function(e) {

                    if (!$scope.u.email) {
                        angular.alert("请输入邮箱!");
                        return;
                    }
                    setInter(e.currentTarget , "email" );

                    var d = {
                        id: u.id,
                        email: $scope.u.email
                    };

                    $source.$user.save({
                        pk: "sendverifyemail"
                    }, d);

                }

                $scope.sendNote = function(e) {
                    if (!$scope.u.mobile_phone) {
                        angular.alert("请输入手机号");
                        return;
                    }

                    setInter(e.currentTarget , "phone");

                    $source.$note.get({
                            op: "user",
                            mobile_phone: $scope.u.mobile_phone
                        },
                        function() {

                        });

                } 




                $scope.verifyPhone = function() {
                    if (!$scope.u.mobile_phone) {
                        angular.alert("请输入手机号");
                        return;
                    }
                    if (!$scope.ver.phone) {
                        angular.alert("请输入验证码");
                        return;
                    }

                    var d = {
                        id: u.id,
                        mobile_phone: $scope.u.mobile_phone,
                        verifi: $scope.ver.phone
                    };

                    $source.$user.save({
                        pk: "verifyphone"
                    }, d , function(resp) {
                        u.mobile_phone_verified = true;
                        $scope.cancel();
                        
                        u.mobile_phone = $scope.u.mobile_phone ; 

                        $scope.user.mobile_phone_verified = true ;
                    });


                }


            }
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
        $scope.showMask = true;
        $source.$userGroup.query(d, function(resp) {
            if (resp.data) {
                $scope.page.data = resp.data;
                $scope.page.total = resp.total;
                $scope.page.currentPage = pageNo;
                $scope.showMask = false;
            }
        }, function(){   $scope.showMask = false;  })

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
            title: "删除用户组:" + g.name ,
            note:"确认要删除该用户组吗?"
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

        $scope.showMask = true;
        $source.$userGroup.queryUser(d, function(resp) {
            // if ($scope.loadPageData === loadPageData_usersOfGroup && resp.data) {

            // if (resp.ret) {
            //resp.currentPage = pageNo;

            //angular.extend($scope.page, resp);
            //无分页接口;
            $scope.page.data = resp.ret;

            $scope.showMask = false;
            // }
        } , function(){   $scope.showMask = false;  })
    })(1);
    // $scope.loadPageData(1);

    // 移除用户;
    $scope.removeUser = function(arr, u, i) {
        $scope.confirmInvoke({
            title: "移除用户:" + u.username ,
            note: "确认从组中移除该用户吗?用户不会被删除!"
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

})

.controller('acco_author', function($scope, $state, $source, $q) {
    // 预先加载 所有组;
    $scope.$moduleNav("权限", $state);


    $scope.gp = $source.$userGroup.query({
        currentPage: 1
    }).$promise;

    // 预先加载所有 角色 ;
    $scope.rp = $source.$role.get().$promise;



    $q.all([$scope.gp, $scope.rp]).then(function(resp) {
        $scope.allgroups = resp[0].data;
        $scope.allroles = resp[1].ret;


    })

    // $scope.gp.then(function(resp) {
    //     $scope.allgroups = resp.data;
    // })

    // $scope.rp.then(function(resp) {
    //     $scope.allroles = resp.ret;
    // })

})



.controller("role_ctrl", function($scope, $state, $stateParams, $source, $sys, $modal, $q ,$translate) {


    var thatScope = $scope ; 
    var role_category =  $state.$current.data.role_category ; 

    $scope.promise =  role_category ==1 ?$sys.regionP : $sys.accountP ; 

    var text_arr ; 
    $scope.toText = function( privileges){
        text_arr = [] ; 
        angular.forEach( privileges ,function( k , v ){ 
            text_arr.push( $translate.instant(k) )
        })
        return  text_arr.join(";")

    }

 
    // type = 1 , region ;  =0 , account ;
    // add or update 
    $scope.addRole = function(    role, index ) {
        $modal.open({
            templateUrl: "athena/account/role_add.html",
            controller: function($scope, $modalInstance) {

                $scope.__proto__ = thatScope;
                $scope.$modalInstance = $modalInstance;
                 

                if( role ){
                    var o = {  };
                    $scope.r = angular.copy(role);

                    angular.forEach( role.privilege , function( k , v ){
                        o[k] = true ; 
                    })

                    $scope.r.authors = o ; 
                } else{
                    $scope.r = { 
                        role_category:  role_category,
                        authors: {}
                    }
                }
 

                $scope.done = function() {



                    $scope.validForm();

                    var r = angular.copy( $scope.r );
                        r.privilege = [];
                    
                    angular.forEach($scope.r.authors, function(v, i) {
                        v && (r.privilege.push(i))
                    });

                    if( !r.privilege.length ){
                        angular.alert("请选择权限!")
                        return ; 
                    }


                    delete r.authors;
 
                    if( role ){
                        $source.$role.put( {pk:r.id}, r , function( resp ){
                            $scope.roles[ index] = r ; 
                            $scope.cancel();
                        } , $scope.cancel )
                    }else{
                        $source.$role.save(
                            r,
                            function(resp) {
                                r.id = resp.ret;
                                thatScope.roles.unshift(r);
                               
                                $scope.cancel();
                            },
                            $scope.cancel
                        )

                    } 

                }
            }
        })
    }

    $scope.delRole = function( r, index) {
        $scope.confirmInvoke({
            title: '删除角色:' + r.name ,
            note:"确认要删除该角色吗?"
        }, function(next) {

            $source.$role.delete({
                pk: r.id
            }, function(resp) {

                $scope.roles.splice(index, 1)

                next();
            }, next)
        })
    }



    var d = { 
            role_category: role_category 
        } ; 
    $scope.loadPageData = function(pageNo) {
        d.currentPage = pageNo;
        $scope.showMask = true;

        $source.$role.get(d, function(resp) {
            // $scope.page = resp;
            // $scope.page.currentPage = pageNo;
            $scope.roles = resp.ret || [] ; 
            $scope.showMask = false;

        }, function(){   $scope.showMask = false;  } );
    }

    $scope.loadPageData(1);



   

})

 


;

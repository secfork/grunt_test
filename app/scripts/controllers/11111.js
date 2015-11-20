  
    window.loginUserPromise =    $source.$common.get({  op: "islogined" }).$promise ; 
  
    window.loginUserPromise.then( function(resp) {

            $('#preload').fadeOut('slow'); 

            if (resp.ret) {
 
                resp.ret.sms_notice = !!resp.ret.sms_notice;
                resp.ret.mail_notice = !!resp.ret.mail_notice; 


                $rootScope.user = resp.ret ; 

                if( $location.$$path.length <5 || $location.$$path.startsWith("/access")){
                    $state.go("app.proj.manage");

                } 
                
            } else {
                // 获取登录次数; 
                $source.$common.get({
                    op: 'logintimes'
                }, function(resp) {
                    $scope.logintimes = resp.ret || 0;
                    $state.go("access.signin");
                });
            }

    } , function(){
        alert("-_-。sorry！");
    });
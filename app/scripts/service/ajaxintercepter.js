define([], function() {

	return ['$q', '$location', '$anchorScroll', '$timeout', '$sys', function( $q , $location , $anchorScroll , $timeout , $sys ) {
		// 判断 是否有ajax加载 并显隐 动作条;
		var ajax_times = 0,
			_timeout, animat = false,
			$dom = [];

		return {
			/* 四种拦截 key 是 固定的; */
			// optional method    通过实现 request 方法拦截请求
			'request': function(config) {
							// do something on success
							++ajax_times;
							if ($sys.$debug && !animat) {
								animat = !animat;
								// 开始滚动;   滚动 bug :
								// $modal.open({ template:"faefea"})
								$dom = $dom.length ? $dom : $("#ajax_modal");

								$dom.show();
							}
							// 添加区域字段;
							// html 的不添加 local ;
							if (!/(.html)$/.test(config.url)) {
								if (config.params) {
									config.params.local = navigator.language;
								} else {
									config.params = {
										local: navigator.language
									};
								}
							} else {
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
			'response': function(response) {

				if ($sys.$debug && !--ajax_times) {
					$timeout.cancel(_timeout);
					_timeout = $timeout(function() {
						// 停止滚动;
						animat = !animat;

						$dom.hide();

					}, 100);
				}

				if (response.data.err && !ingorErr[response.data.err]) {
					//alert( $err[response.data.err+'']|| response.data.err );
					alert(response.data.err);
					console.error("_ERR_:" + response.data.err);
					throw error("_ERR_:" + response.data.err)
				}
				//return response || $q.when(response); 
				if (response.data.order) {
					console.log("order:" + response.data.order);

					// 返回登录界面; 
					window.location.hash = "#/access/signin";
					 
				}
				return response;
			},

			// optional method  通过实现 responseError 方法拦截响应异常:
			'responseError': function(response) {
				if (!--ajax_times) {
					$timeout.cancel(_timeout);
					_timeout = $timeout(function() {
						// 停止滚动;
						$dom.addClass('hide').removeClass('active');
						animat = false;
					}, 200);
				}
				/*
                if (response.status == 302) {
                     alert("session失效!!");
                    window.location.href = "/athena";
                    return;
                }*/
				console.error(response.status + "--" + response);
				return response;

			}
		}


	}]


})
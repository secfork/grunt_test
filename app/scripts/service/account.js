define([], function() {

	return ['$resource', '$http', function($resource, $http) {
		//transformResponse

		console._log($http.defaults);


		return $resource(angular.rootUrl + 'web/account/:operate', {}, {

			login: {
				url: angular.rootUrl + "web/common/login",
				method: "POST"
					// , transformRequest:[shaPW].concat($http.defaults.transformRequest)
			},

			logout: {
				url: angular.rootUrl + "web/account/logout"
			},
			// 检查 user 重名
			isDuplicate: {
				url: angular.rootUrl + "web/account/isduplicate/user"
			},
			//  检查 acco 重名;
			isDupOfAcco: {
				url: angular.rootUrl + "web/account/isduplicate/acco"
			},

			isInviteCode: {
				url: angular.rootUrl + "web/account/invitecode"
			},

			// 得到account 的所有角色信息;
			getRoles: {
				url: angular.rootUrl + "web/account/roles/all/true"
			},

			getUiRoles: {
				url: angular.rootUrl + "web/account/roles/ui/:withAuthor"
			},
			getProjRoles: {
				url: angular.rootUrl + "web/account/roles/proj/:withAuthor"
			},

			// type =  all || ui || proj  ;
			getAuthor: {
				url: angular.rootUrl + "web/account/authors/:type"
			},

			// 批量更新roles ;
			updateRoles: {
				params: {
					operate: 'roles'
				},
				method: "PUT"
			},
			//批量创建 roles ;
			crateRoles: {
				params: {
					operate: "roles"
				},
				method: "POST"
			},
			delRoles: {
				params: {
					operate: "roles"
				},
				method: "DELETE"
			},


			// 得到 account 下的采集站sn 号 ;
			getStationSn: {
				url: angular.rootUrl + "web/account/station_sn"
			},
			getBasicInfo: {
				url: angular.rootUrl + "web/account/basicinfo"
			}


			,
			getAuthorData: {
				url: angular.rootUrl + "web/common/islogined"
			}
			// 注册account 用户;
			,
			signUp: {
				url: angular.rootUrl + "web/common/regist",
				method: "POST"
			}
			// 在account 下 添加 user ;
			,
			createUser: {
				url: angular.rootUrl + "web/account/adduser",
				method: "POST"
			},
			createProjUser: {
				url: angular.rootUrl + "web/account/addprojuser"
			}
			// 更新 user 在某个proj 上的 角色;
			,
			updateProjUser: {
				url: angular.rootUrl + "web/account/updataprojuser"
			}


			,
			getAllUser: {
				url: angular.rootUrl + "web/account/users",
				cache: true
			},
			alluserinfo: {
				url: angular.rootUrl + "web/account/alluserinfo"
			}


			,
			getUsersGroupByProj: {
				url: angular.rootUrl + "web/account/users_by_proj"
			}

			//得到user  和其管理关联的proj
			,
			getUserWidthProj: {
				url: angular.rootUrl + "web/account/user_m_proj"
			}

			,
			log_ygf: {
				url: angular.rootUrl + "web/account/login_ygf",
				method: "POST"
			}

		});
	}]



})
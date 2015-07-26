define([], function(){
	return ['$resource', '$http', function ($resource, $http) {

		    return $resource( angular.rootUrl + "web/project", {}, {


		        // 建采集站用;只加载 id , projname 属性;
		        getAllprojsBasic: {url: angular.rootUrl +"web/project/basic"},
		        // 展示project list ;
		        getAllprojs: {url: angular.rootUrl +"web/project/list"},
		        //展示 project 下的 stations
		        getSatationByProjid: {  url: angular.rootUrl +"web/project/:projid/dastation/list"},

		        // 展示 project 属性;
		        getProjAttr: {method: "GET", url: angular.rootUrl +"web/project/:projid/property"},

		        crateProect: {method: "POST", url: angular.rootUrl +"web/project/create "},
		        deletePoject: {url: angular.rootUrl +"web/project/:projid/delete "},
		        updataProject: {method: "POST", url: angular.rootUrl +"web/project/:projid/updata"},

		        // 展示 rest  stations 列表 ,由 proj_id  得到 proj_name ;
		        getProjNameByIdS: {method: "POST", url: angular.rootUrl +"web/project/getnamebyids"},

		        //获得时区 数据;
		        getTimeZone: {url: angular.rootUrl +"web/data/timezone"}

		    });

		}]


})
define([], function() {
	return [

		function($http, $templateCache, $sys, $filter, $interpolate) {

			var $map = this;
			// dom_id 无需加 # 号 ;
			this.createMap = function createMap(Dom_id, markers) {
				// 百度地图API功能

				var map = new BMap.Map(Dom_id); // 创建Map实例
				// map.centerAndZoom(new BMap.Point(116.404, 39.915), 15);
				// 初始化地图,设置中心点坐标和地图级别
				addMarkers2map(map, markers);

				map.addControl(new BMap.MapTypeControl()); //添加地图类型控件
				// map.setCurrentCity("北京");          // 设置地图显示的城市 此项是必须设置的

				//开启鼠标滚轮缩放
				map.enableScrollWheelZoom(true);
				// 左上角，添加比例尺
				var top_left_control = new BMap.ScaleControl({
					anchor: BMAP_ANCHOR_TOP_LEFT
				});
				//左上角，添加默认缩放平移控件
				var top_left_navigation = new BMap.NavigationControl();

				//右上角，仅包含平移和缩放按钮
				var top_right_navigation = new BMap.NavigationControl({
					anchor: BMAP_ANCHOR_TOP_RIGHT,
					type: BMAP_NAVIGATION_CONTROL_SMALL
				});
				/*缩放控件type有四种类型:
				 BMAP_NAVIGATION_CONTROL_SMALL：仅包含平移和缩放按钮；BMAP_NAVIGATION_CONTROL_PAN:仅包含平移按钮；BMAP_NAVIGATION_CONTROL_ZOOM：仅包含缩放按钮*/
				map.addControl(top_left_control);
				map.addControl(top_left_navigation);
				// map.addControl(top_right_navigation);
				return map;
			}

			// flushMarkers 清除所有覆盖物 , 添加新覆盖物;

			this.flushMarkers = function(map, stations) {
				map.clearOverlays();
				addMarkers2map(map, createDAPoint(stations));

			}


			// marker点;
			this.mapMarker = function mapMarker(x, y, text) {

				var mark = new BMap.Marker(new BMap.Point(y, x));
				if (text) {
					label = new BMap.Label(text, {
						offset: new BMap.Size(20, -10)
					});
					label.setStyle({
						'border-width': 0,
						'font-weight': 700
					});
					mark.setLabel(label);
				}
				return mark;
			}

			this.addSearch = function addSearch(map, inputid, resultid) {
				function G(id) {
					return document.getElementById(id);
				}

				//建立一个自动完成的对象
				var ac = new BMap.Autocomplete({
					"input": inputid,
					"location": map
				});
				//鼠标放在下拉列表上的事件
				ac.addEventListener("onhighlight", function(e) {
					var str = "";
					var _value = e.fromitem.value;
					var value = "";
					if (e.fromitem.index > -1) {
						value = _value.province + _value.city + _value.district + _value.street + _value.business;
					}
					str = "FromItem<br />index = " + e.fromitem.index + "<br />value = " + value;

					value = "";
					if (e.toitem.index > -1) {
						_value = e.toitem.value;
						value = _value.province + _value.city + _value.district + _value.street + _value.business;
					}
					str += "<br />ToItem<br />index = " + e.toitem.index + "<br />value = " + value;
					G("searchResultPanel").innerHTML = str;
				});

				var myValue;
				//鼠标点击下拉列表后的事件
				ac.addEventListener("onconfirm", function(e) {
					var _value = e.item.value;
					myValue = _value.province + _value.city + _value.district + _value.street + _value.business;
					G(resultid).innerHTML = "onconfirm<br />index = " + e.item.index + "<br />myValue = " + myValue;

					setPlace();
				});

				function setPlace() {
					map.clearOverlays(); //清除地图上所有覆盖物
					function myFun() {
						var pp = local.getResults().getPoi(0).point; //获取第一个智能搜索的结果

						map.centerAndZoom(pp, 18);
						// map.addOverlay(new BMap.Marker(pp));    //添加标注
					}
					var local = new BMap.LocalSearch(map, { //智能搜索
						onSearchComplete: myFun
					});
					local.search(myValue);
				}
			}

			// 地图展示 一个proj下的所有已定位的是station ;
			/**
			   必要 :$scope , sations , domid , h_offset ;
			   非必要: projName ;
			*/
			this.initMap = function($scope, stations, domid, h_offset, projName) {

				console._log(arguments);

				var $mapdom, marks, map;

				$mapdom = $("#" + domid);

				// 取消  resize 事件 ;
				$scope.$on("$destroy", function() {
					$(window).off("resize");
				})

				$mapdom.css({
					height: window.innerHeight - h_offset
				});

				$(window).on("resize", function() {
					$mapdom.css({
						height: window.innerHeight - h_offset
					});
				});


				marks = createDAPoint(stations, projName);

				map = $map.createMap("bdmap", marks);
				return map;
			}

			function createDAPoint(stations, projName) {
				var marks = [];

				angular.forEach(stations, function(v, k) {
					if (!v.latitude) return;
					var mark = $map.mapMarker(v.latitude, v.longitude, v.name);

					(function(station) {
						mark.addEventListener("click", function(e) {
							var that = this;
							// 动态生成 infoWindow ;
							$http({
									method: "GET",
									url: "athena/views/dastation/prop_map_popup.html",
									cache: $templateCache
								})
								.success(function(a) {
									var s = angular.copy(station);
									console.log(s);
									s.proj_name = s.proj_name || projName; // ;
									s.create_time = $filter("date")(s.create_time, "yyyy-MM-dd hh:mm:ss");

									// system 类型;
									// s.type =  $sys.stationtype.values[s.type].k ;

									var str = $interpolate(a)(s);
									//console._log(str , $(str).html()  );

									var infoWindow = new BMap.InfoWindow(str)
									that.openInfoWindow(infoWindow);
									//  删除 手机 小图片;


								}).error(function(b) {
									alert("error");
									throw ("加载异常  athena/views/dastation/prop_map_popup.html?");
								})

						});

					})(v)
					marks.push(mark);
				});
				return marks;
			}

			function addMarkers2map(map, markers) {
				if (markers && markers[0]) {
					angular.forEach(markers, function(n, i) {
						if (i == 0) {
							console._log(n);
							map.centerAndZoom(n.point, 12);
						}
						map.addOverlay(n);
					})
				} else {
					var myCity = new BMap.LocalCity();
					myCity.get(function(result) {
						console._log(result);
						map.centerAndZoom(result.center, 12);
						map.setCurrentCity(result.name);
					});
				}

			}

		}

	]


})
 /* Directives */
 // All the directives rely on jQuery.


 angular.module('app.directives', ['pascalprecht.translate'])

 .directive(
         'uiModule', ['MODULE_CONFIG', 'uiLoad', '$compile',
             function(MODULE_CONFIG, uiLoad, $compile) {
                 return {
                     restrict: 'A',
                     compile: function(el, attrs) {
                         var contents = el.contents().clone();
                         return function(scope, el, attrs) {
                             el.contents().remove();
                             uiLoad.load(MODULE_CONFIG[attrs.uiModule])
                                 .then(function() {
                                     $compile(contents)(scope,
                                         function(clonedElement,
                                             scope) {
                                             el
                                                 .append(clonedElement);
                                         });
                                 });
                         }
                     }
                 };
             }
         ])
     .directive('uiShift', ['$timeout', function($timeout) {
         return {
             restrict: 'A',
             link: function(scope, el, attr) {
                 // get the $prev or $parent of this el
                 var _el = $(el),
                     _window = $(window),
                     prev = _el.prev(),
                     parent, width = _window
                     .width();

                 !prev.length && (parent = _el.parent());

                 function sm() {
                     $timeout(function() {
                         var method = attr.uiShift;
                         var target = attr.target;
                         _el.hasClass('in') || _el[method](target).addClass('in');
                     });
                 }

                 function md() {
                     parent && parent['prepend'](el);
                     !parent && _el['insertAfter'](prev);
                     _el.removeClass('in');
                 }

                 (width < 768 && sm()) || md();

                 _window.resize(function() {
                     if (width !== _window.width()) {
                         $timeout(function() {
                             (_window.width() < 768 && sm()) || md();
                             width = _window.width();
                         });
                     }
                 });
             }
         };
     }])

 .directive('uiToggleClass', ['$timeout', '$document', function($timeout, $document) {
         return {
             restrict: 'AC',
             link: function(scope, el, attr) {
                 el.on('click', function(e) {
                     e.preventDefault();
                     var classes = attr.uiToggleClass.split(','),
                         targets = (attr.target && attr.target
                             .split(',')) || Array(el),
                         key = 0;
                     angular.forEach(classes, function(_class) {
                         var target = targets[(targets.length && key)];
                         (_class.indexOf('*') !== -1) && magic(_class, target);
                         $(target).toggleClass(_class);
                         key++;
                     });
                     $(el).toggleClass('active');

                     function magic(_class, target) {
                         var patt = new RegExp('\\s' + _class.replace(/\*/g,
                                 '[A-Za-z0-9-_]+')
                             .split(' ')
                             .join('\\s|\\s') + '\\s', 'g');
                         var cn = ' ' + $(target)[0].className + ' ';
                         while (patt.test(cn)) {
                             cn = cn.replace(patt, ' ');
                         }
                         $(target)[0].className = $.trim(cn);
                     }
                 });
             }
         };
     }])
     .directive('uiNav', ['$timeout', function($timeout) {
         return {
             restrict: 'AC',
             link: function(scope, el, attr) {
                 var _window = $(window),
                     _mb = 768,
                     wrap = $('.app-aside'),
                     next, backdrop = '.dropdown-backdrop';
                 // unfolded
                 el.on('click', 'a', function(e) {
                     next && next.trigger('mouseleave.nav');
                     var _this = $(this);
                     _this.parent().siblings(".active")
                         .toggleClass('active');
                     _this.next().is('ul') && _this.parent().toggleClass('active') && e.preventDefault();
                     // mobile
                     _this.next().is('ul') || ((_window.width() < _mb) && $('.app-aside')
                         .removeClass('show off-screen'));
                 });

                 // folded & fixed
                 el.on('mouseenter', 'a', function(e) {
                     next && next.trigger('mouseleave.nav');

                     if (!$('.app-aside-fixed.app-aside-folded').length || (_window.width() < _mb))
                         return;
                     var _this = $(e.target),
                         top, w_h = $(window).height(),
                         offset = 50,
                         min = 150;

                     !_this.is('a') && (_this = _this.closest('a'));
                     if (_this.next().is('ul')) {
                         next = _this.next();
                     } else {
                         return;
                     }

                     _this.parent().addClass('active');
                     top = _this.parent().position().top + offset;
                     next.css('top', top);
                     if (top + next.height() > w_h) {
                         next.css('bottom', 0);
                     }
                     if (top + min > w_h) {
                         next.css('bottom', w_h - top - offset).css('top',
                             'auto');
                     }
                     next.appendTo(wrap);

                     next.on('mouseleave.nav', function(e) {
                         $(backdrop).remove();
                         next.appendTo(_this.parent());
                         next.off('mouseleave.nav').css('top', 'auto')
                             .css('bottom', 'auto');
                         _this.parent().removeClass('active');
                     });

                     $('.smart').length && $('<div class="dropdown-backdrop"/>')
                         .insertAfter('.app-aside').on('click',
                             function(next) {
                                 next
                                     && next
                                     .trigger('mouseleave.nav');
                             });

                 });

                 wrap.on('mouseleave', function(e) {
                     next && next.trigger('mouseleave.nav');
                 });
             }
         };
     }])
     .directive('uiScroll', ['$location', '$anchorScroll', function($location, $anchorScroll) {
         return {
             restrict: 'AC',
             link: function(scope, el, attr) {
                 el.on('click', function(e) {
                     $location.hash(attr.uiScroll);
                     $anchorScroll();
                 });
             }
         };
     }])
     .directive('uiFullscreen', ['uiLoad', function(uiLoad) {
         return {
             restrict: 'AC',
             template: '<i class="fa fa-expand fa-fw text"></i><i class="fa fa-compress fa-fw text-active"></i>',
             link: function(scope, el, attr) {
                 el.addClass('hide');
                 console._log("加载 fullscreen .js 文件!");
                 uiLoad.load('lib/js/screenfull.min.js').then(function() {
                     if (screenfull.enabled) {
                         el.removeClass('hide');
                     }
                     el.on('click', function() {
                         var target;
                         attr.target && (target = $(attr.target)[0]);
                         el.toggleClass('active');
                         screenfull.toggle(target);
                     });
                 });
             }
         };
     }])
     // ajax 加载时 动作条; 



 // state 切换是动作条; 
 .directive('uiButterbar', ['$rootScope', '$location', '$anchorScroll',
         function($rootScope, $location, $anchorScroll) {
             return {
                 restrict: 'AC',
                 template: '<span class="bar" ></span>',
                 link: function(scope, el, attrs) {
                     console._log("bbbb", el);
                     el.addClass('butterbar hide');


                     scope.$on('$stateChangeStart', function(event) {
                         $location.hash('app');
                         $anchorScroll();
                         el.removeClass('hide').addClass('active');
                     });
                     scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState) {
                         event.targetScope.$watch(
                             '$viewContentLoaded',
                             function() {
                                 el.addClass('hide').removeClass('active');
                             })
                     });
                 }
             };
         }
     ])
     .directive('setNgAnimate', ['$animate', function($animate) {
         return {
             link: function($scope, $element, $attrs) {
                 $scope.$watch(function() {
                     return $scope.$eval($attrs.setNgAnimate,
                         $scope);
                 }, function(valnew, valold) {
                     $animate.enabled(!!valnew, $element);
                 });
             }
         };
     }])

 // =================================================================================

 .directive('draggable', function($document) {
     return function(scope, element, attr) {
         console._log(attr);
         console._log(element);
         console._log($document);

         var startX = 0,
             startY = 0,
             x = 0,
             y = 0;

         element.css({
             position: 'relative',
             border: '1px solid red',
             backgroundColor: 'lightgrey',
             cursor: 'pointer'
         });

         element.on('mousedown', function(event) {
             // Prevent default dragging of selected
             // content
             event.preventDefault();
             startX = event.pageX - x;
             startY = event.pageY - y;
             $document.on('mousemove', mousemove);
             $document.on('mouseup', mouseup);
         });

         function mousemove(event) {
             y = event.pageY - startY;
             x = event.pageX - startX;
             element.css({
                 top: y + 'px',
                 left: x + 'px'
             });
         }

         function mouseup() {
             $document.unbind('mousemove', mousemove);
             $document.unbind('mouseup', mouseup);
         }
     };
 })



 .directive("token", function($compile, $timeout) {
     // disabled
     return {
         restrict: "A",
         require: ["?^ngDisabled"],
         link: function(scope, $ele, attrs, fn) {
             console._log(arguments);
             console._log("token =", attrs.token || 1000);
             $ele.on("click", function() {
                 var that = this;
                 that.disabled = true;
                 $timeout(function() {
                     that.disabled = false
                 }, attrs.token || 1000)
             });
         }

     }
 })

 /**
     tip = {jsonDta} 
     tip-type=""  // point , device , tag // 对应 sysconfig 中的配置; 
 */
 .directive('tip', function($compile, $filter, $brower) {
     return {
         restrict: "A",
         link: function(scope, $ele, attrs) {
             var $appScope = $("#app").scope();

             var $pTipData,
                 isempty = true,
                 tipScope;
             try {

                 $pTipData = angular.fromJson(attrs.tip);

                 for (var p in $pTipData) { // =.= {} 也是 empty ;
                     isempty = false;
                     break;
                 }
             } catch (e) {}

             if (isempty && angular.isObject($pTipData)) {
                 $ele.removeClass('fa');
                 return;
             }

             $ele.addClass('text-primary');

             if ($brower.isSmart) { // 移动设备;

                 $ele.on("click", function() {
                     //$appScope.showTip( attrs.tip  , $ele);
                     console._log($(this).attr("showtip"));
                     if ($ele.attr("showtip")) { // undefind ; 未显示;
                         $appScope.hiddenTip();
                         $ele.removeAttr("showtip");
                     } else {
                         $("i .fa[showtip]").removeAttr("showtip");
                         $ele.attr("showtip", true);
                         $appScope.showTip(attrs.type, attrs.version, attrs.tip, $ele);
                     }
                 });
             } else { // pc 设备;
                 $ele.on("mouseenter", function() {
                     $appScope.showTip(attrs.type, attrs.version, attrs.tip, $ele);
                 });
                 $ele.on("mouseleave", function() {
                     $appScope.hiddenTip();
                 });
             }

         }
     }
 })

 /**
  * 依赖 bootstrap-datepicker ; 从 localstore 中去除 方言 key ; ( en| zh-cn)
  * $localStorage : angularjs 有自己的封装; $loaclstorege =
  * localstorege中所有内容;
  */


 .directive("mydatepicker", function( ) {

    var temp =[
           // '<input  tl-wrap label="xxx" />' ,
           '<div class="form-group">',
           '<label class=" w-xxs text-right control-label"  for="exampleInputPassword2">起始时间</label>',
          
           ' <div class="input-group  w ">',
            '  <input type="text" class=" form-control  w-xxs" datepicker-popup="{{format}}" ',
            '             ng-model="dt" is-open="opened"   datepicker-options="dateOptions" ',
             '  ng-required="true"   close-text="Close" />',
               
            '  <span class="input-group-btn">',
             '   <button type="button" class="btn btn-default" ng-click="open($event)"><i class="glyphicon glyphicon-calendar"></i></button> ',
             ' </span>   </div></div>' ,

              // ' <timepicker ng-model="mytime" ng-change="changed()" ',
              //   '     hour-step="hstep" minute-step="mstep" ',
              //   '     show-meridian="ismeridian"></timepicker> ' ,



        ].join("");

     return {
        restrict: "A" ,
        replace:true ,
        template: temp,
        scope:{

        },
        link:function( $scope , $element, $attrs){

                $scope.today = function() {
                  $scope.dt = new Date();
                };
                $scope.today();

                $scope.clear = function () {
                  $scope.dt = null;
                };

                // Disable weekend selection
                $scope.disabled = function(date, mode) {
                  return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
                };

                $scope.toggleMin = function() {
                  $scope.minDate = $scope.minDate ? null : new Date();
                };
                $scope.toggleMin();

                $scope.open = function($event) {
                  $event.preventDefault();
                  $event.stopPropagation();

                  $scope.opened = true;
                };

                $scope.dateOptions = {
                  formatYear: 'yy',
                  startingDay: 1,
                  class: 'datepicker'
                };

                $scope.initDate = new Date('2016-15-20');
                $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
                $scope.format = $scope.formats[1];




    $scope.mytime = new Date();

    $scope.hstep = 1;
    $scope.mstep = 15;

    $scope.options = {
      hstep: [1, 2, 3],
      mstep: [1, 5, 10, 15, 25, 30]
    };

    $scope.ismeridian = true;
    $scope.toggleMode = function() {
      $scope.ismeridian = ! $scope.ismeridian;
    };

    $scope.update = function() {
      var d = new Date();
      d.setHours( 14 );
      d.setMinutes( 0 );
      $scope.mytime = d;
    };

    $scope.changed = function () {
      //console.log('Time changed to: ' + $scope.mytime);
    };

    $scope.clear = function() {
      $scope.mytime = null;
    };






        }

     }

 })

 .directive("mark", function() {
     return {
         restrict: 'E',
         replace: true,
         template: '<span class="text-danger font-bold">*</span>',
         link: function() {
             console._log("mark!");
         }
     };
 })

 .directive("centered", function($timeout) {
     return function(scope, $element, attr) {

         var wh, dh, st;
         wh = $(window).height();
         st = $(window).scrollTop();

         $element.css({
             display: "none"
         });

         $element.ready(function() {
             $timeout(function() {
                 dh = $element.height();
                 console._log(wh, dh);
                 dh ? $element.offset({
                     top: dh < wh ? st + (wh - dh) / 2 : 0
                 }) : $element.offset({
                     top: 10
                 });

                 $element.css({
                     display: "block"
                 });
             }, 200);
         });
     }
 })


 .directive("wrap", function() {
         x = '<div class="form-group"><div class="col-sm-3 col-sm-offset-1 control-label"></div></div>'

         return function(s, e, a) {
             e.wrap(x);
         }
     })
     .directive("wrapL", function() {
         x = '<div class="form-group"><div class="col-sm-3 col-sm-offset-1 control-label"></div></div>'

         return function(s, e, a) {
             e.wrap(x);
         }
     })



 .directive("tlWrap", function($compile, $translate, valid) {
     return {
         restrict: "A",
         priority: 90,
         require: '?^ngModel',
         scope: true,
         link: function($scope, $ele, $attrs, modelCtrl) {

             //  ==================================  

             var label = '<label class= " col-sm-3 col-sm-offset-1 control-label   "  > ' + ' <span   translate="' + $attrs.label + '"  ></span> ' + ' </label>',

                 marklabel = '<label class= " col-sm-3 col-sm-offset-1 control-label   "  > ' + ' <span   translate="' + $attrs.label + '"  ></span> ' + ' <span class="text-danger font-bold">*</span>' + ' </label>',

                 wrap_input = '<div class="form-group " ><div class=" col-sm-7"></div></div>',

                 r = $ele.attr("required"),
                 l,
                 cls;

             // var tag = $ele[0].tagName, cls;
             //cls = (   tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT")  ?"form-control":"form-control no-border";
             //cls = $ele.is('input , textarea, select')? "form-control":"form-control no-border";

             if ($ele.is('input , textarea, select')) {
                 cls = "form-control";
                 $ele.addClass(cls).wrap($compile(wrap_input)($scope));
                 l = r ? ($compile(marklabel)($scope)) : ($compile(label)($scope));
                 $ele.parent().before(l);
                 valid($scope, $ele, $attrs, $translate, $compile, modelCtrl);
             } else {



            }




         }
     }
 })

 .value("valid", function($scope, $ele, $attrs, $translate, $compile, modelCtrl) {
     //只做了 require 提示;  其他的待完成; 
     $scope.m = modelCtrl;

     function v(type, value) {
         var msg = $translate.instant("valid." + type);
         if (value) {
             msg = msg.replace("X", value);
         }

         $ele.after(
             $compile("<p class='text-danger "+ type +" '   ng-if=' m.$dirty &&  m.$error." + type + "' >" + msg + " </p>")($scope)
         );

     }

     if ($attrs.required) {
         if ($attrs.type) {
             var msg = $translate.instant("valid." + $attrs.type);
             $ele.after(
                 $compile("<p class='text-danger' ng-if=' m.$dirty &&  m.$error.required' >" + msg + " </p>")($scope)
             );
         } else {
             v("required");
         }
     } else {
        // return ; // 无required ; 其他的就不验证了; 
     };

     if ($attrs.type) {
         v($attrs.type)
     }

     if ($attrs.max) {
         v("max", $attrs.max);
     }

     if ($attrs.min) {
         v("min", $attrs.min);
     }
     // ui-validate , 自定义的验证; 带完成; ( require:"uiValidate"); 
 })


 .directive("tlWrapL", function($compile, $translate, valid) {
     return {
         restrict: "A",
         priority: 90,
         require: 'ngModel',
         scope: {
             label: "@"
         },
         link: function($scope, $ele, $attrs, modelCtrl) {
             // console._log( $scope.label );
             // ==================================

             var label = '<label class= " col-sm-3 control-label   "  > ' + ' <span   translate="' + $attrs.label + '"  ></span> ' + ' </label>',
                 marklabel = '<label class= " col-sm-3 control-label   "  > ' + ' <span   translate="' + $attrs.label + '"  ></span> ' + ' <span class="text-danger font-bold">*</span>' + ' </label>',
                 wrap_input = '<div class="form-group"    ><div class=" col-sm-9"></div></div>',
                 r = $ele.attr("required"),
                 l;

             var tag = $ele[0].tagName,
                 cls;

             cls = (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") ? "form-control" : " no-border";
             //cls = (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") ?   "form-control"  :  "form-control no-border";

             $ele.addClass(cls).wrap($compile(wrap_input)($scope));

             if (r) {
                 l = $compile(marklabel)($scope);
             } else {
                 l = $compile(label)($scope);
             }
             $ele.parent().before(l);
             valid($scope, $ele, $attrs, $translate, $compile, modelCtrl);

         }
     }
 })


 .directive("hexSimulator", function() {
     return {
         restrict: "E",
         scope: {
             data: "=",
             notation: "="
         },
         replace: true,
         template: // "<div><div>xxxx</div>" +
             "<div  class='row hex' > " +
             "<ul class='col-xs-2 col-xs-offset-2 text-right'>" +
             " <li ng-if='notation>16' >高16位</li><li>低16位</li></ul>" +
             "<ul class=' col-xs-7 hex-ul ' > " +
             "<li  ng-repeat='  b in byte track  by $index ' " +
             "  class='btn'     ng-class='{ \"btn-default\":b==0,\"btn-info\":b==1" +
             "   ,\"m-l-sm\": !($index%8) " +
             " } '  " +
             "       ng-click = ' updataHex(  $index ) '   popover='{{notation -$index-1 || 0 }}' popover-trigger='mouseenter'   >   " +
             "  {{b}}    " +
             " </li> " +


             "</ul>" +
             "</div> ",
         // + " </div>",



         link: function($scope, $ele, $attrs) {
             //$scope.notation = 32;// 16 进制 ?;  //32位 ?
             $scope.$watch("notation", function(n, o) {
                 // $scope.data = undefined ;
                 if (n != o) $scope.data = undefined;
                 $scope.byte = [];
                 while ($scope.byte.length < n) {
                     $scope.byte.unshift(0);
                 }
             });


             $scope.$watch("data", function(n, o) {
                 $scope.byte = [];
                 if (n) {
                     var bytestr = parseInt(n, 16).toString(2);
                     for (var i = 0; i < bytestr.length; ++i) {
                         $scope.byte.push(parseInt(bytestr[i]));
                     }
                 }
                 //  byte 位数不够, 不够的补 0 ;
                 while ($scope.byte.length < $scope.notation) {
                     $scope.byte.unshift(0);
                 }
             });

             // butten 更新到input ;
             $scope.updataHex = function(index) {
                 $scope.byte[index] = $scope.byte[index] ? 0 : 1;
                 $scope.data = parseInt($scope.byte.join(""), 2).toString(16).toUpperCase();

             };

         }
     }
 })

.directive("nofocus" , function(){
    return function(a,b){
        b.focus(function(){
            $(this).blur();
        })
    }
})

 // 展示  template  t ;  device  d ; templatePoint  tp ;  profpoint pp ;  profalarm pa
 //       project   proj ; station  s ;
 //       的 属性;
 .directive("params", function($sys, $translate) {

     var a, b, c, e, f, p;

     return function($scope, $ele, $attrs) {

         var x = $scope.$eval($attrs.params),
             params = angular.fromJson(x),
             a = [];

         // template ;
         if ($scope.dm) {
             e = $scope.dm,
                 p = $sys.point,
                 b = p[e.driver_id] && p[e.driver_id][e.driver_ver];


             if (!b) {
                 console._log("无匹配的驱动数据: 驱动 id =  ", e.driver_id, " 驱动版本 = ", e.driver_ver);
                 $ele.text(x);
             } else {
                 angular.forEach(params, function(v, k) {
                     // a.push( $translate.instant("params."+k)  +'='+  b[k][v] );
                     //  非 select 的字段 匹配成原始值 ;
                     c = b[k];
                     //console._log(c , k);
                     if (k == "data_type_ex") {
                         a.push("额外配置值:" + v)
                     } else {
                         f = $translate.instant("params." + k) + ":" + (c ? c[v] : v);
                         a.push(f);
                     }
                 });
                 console._log(a.join(", "));
                 $ele.text(a.join(",  "));
             }
         }


     }
 })


 .directive("panelclass", function() {
     return function($scope, $ele, $attrs) {
         $ele.addClass(" col-md-7 col-md-offset-2 col-sm-10 col-sm-offset-1  col-xs-12 m-t")
     }
 })

 //  初始化 得用 , $sys 中配置的 entituy ; 
 // 出现  nodejs 返回 字段为number 值是 不匹配 $sys 中配置的 key 时 ; 用 tl-defatul 转换成 string ; 
 //  此时 的 ng-change 要 换成  when-change ;  

 // tl-default =  只能是  数字格式字符串 ,或 a.b.c .. 格式( 不存在是返回null ); 
 //  无意义的字符串 返回 undefined ; 
 // 可以完全不用这个指令 ;  为 model 在sysconfig 中 配置各个模型的模版 ( 配置上默认值)
 .directive("tlDefault", function($parse) {
     return {
         restrict: "A",
         require: '?^ngModel',
         priority: 110, //  mgModel 的权重为100 ; 该指令 要低于 ngmodel ; 确保 trans 有值;
         link: function($scope, $ele, $attrs, modelControl) {


             // tl-default =  可以是 自定义任何字符串; ,
             //    或 a.b.c .. 格式( 不存在是返回null , 为 0 时 比较危险;  ); 


             var vo = $parse($attrs.tlDefault)($scope),
                 v1 = $parse($attrs.tlDefault)($scope) || $attrs.tlDefault,
                 mv = $parse($attrs.ngModel)($scope);

             v1 = mv ? mv : v1;
             if ($attrs.type == "number" || $attrs.type == "Number") {
                 modelControl.$setViewValue(v1);
             } else {
                 modelControl.$setViewValue(v1 + "");

             }
             modelControl.$render();

             // 触发 when-chage 监听; 
             if ($attrs.whenChange) {
                 modelControl.$viewChangeListeners.push(function() {
                     $scope.$eval($attrs.whenChange);
                 });
             }

         }
     }

 })

 .directive("acrollLimit", function() {
     // 多少行监听滚动; 
     var t_offset = 2;
     p_offset = 10;
     // template 滚动; 
     function tempScroll() {

     }

     // point 滚动; 
     function pointScroll() {

     }

     return function($scope, $ele, $attr) {

         if ($attr.$attr.temp) {
             if ($scope.$index % t_offset === 0) {
                 $ele.addClass("temp")
             }
         } else {
             if ($scope.$index % p_offset === 0) {
                 $ele.addClass("point");
             }

         }
     }
 })

 

 

 
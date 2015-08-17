angular.module('app.sysconfig', [], function () {
}) 

.service("$sys", function ( $translate){ return { 
            '$debug': true ,
 

            plotChartConfig : {
                colors: ['#23b7e5'], 
               // series: { shadowSize: 1 },  
                grid: { hoverable: true, clickable: true, borderWidth: 1, color: '#ccc' }, 

                tooltip: true,
                zoom: {
                     // interactive: true
                },
                xaxis: {
                    mode: "time",
                    //  show: true
                    // zoomRange: [0.1, 10],  // 缩放范围; 
                },
                legend: {
                    position: "nw",
                    show: true
                },
               
                tooltipOpts: { content: '%x  -- %y',  defaultTheme: false, shifts: { x: 0, y: 15 } }
            } ,
          
 
            tipUrl :"tip.html" ,  // script 模版: <script   type="text/ng-template" id =" tip.html">
            // // ui-bootstrap  1468 行该指令的 每页 行数;
            
            // systemo 模式: manage , unmanage ,unknown ; 
            manageMode : 1, 

            pager:{ itemsPerPage:10 } ,
             
            // application  首页;
            rootState: "app.proj.manage",
            // 分页数据; 

            // 报警类型;
            alarmtype: {
                defalut: 0,
                values:[
                    {k:"越限值报警 > " ,  v:0 } ,
                    {k:"越限值报警 >= " , v:1 } ,
                    {k:"越限值报警 <" ,   v:2 } ,
                    {k:"越限值报警 <=" ,  v:3 } ,

                    {k:"变化报警  = " ,  v:4 } ,
                    {k:"变化报警 !=" ,   v:5 } ,

                    /*{k:"位报警 &&"     , v:6 } ,
                    {k:"位报警 ||"     , v:7 } ,
                    {k:"位报警 xor"    , v:8 } ,
                    {k:"位报警 not &&" , v:9 } ,
                    {k:"位报警 not || "   , v:10 } ,
                    {k:"位报警 not xor"  , v:11 }*/

                     {k:"位报警 按位与"     , v:6 } ,
                     {k:"位报警 按位或"     , v:7 } ,
                     {k:"位报警 按位异或"    , v:8 } ,
                     {k:"位报警 按位与 取反" , v:9 } ,
                     {k:"位报警 按位或 取反 "   , v:10 } ,
                     {k:"位报警 按位异或 取反"  , v:11 }

                ]
            },
           

            // 报警源  alarmorigin
            trigger: {
               origin_default: '0' ,
               origin : { 0:"ThingLinx Cloud" , 1:"Remote Gateway" } ,

               action_default: 'alarm' ,
               action :{'alarm':"Alarm" ,"event":"Event" , 'task':"Task"}, // 1:"事件" , 2:"任务"} ,
 
               action_alarm : "alarm" ,
               action_event : "event" ,
               action_task  : "task" ,

               type_default:'1',
               type:{ 0: "状态持续触发" , 1:"状态变化触发" },

               // {"PV":"PV" ,null:"输入值"},  
               // fn 限制不可为 字符串的 "null" 故 改成 array 形式; 
               fn_default:"PV",
               fn:{"PV":"PV" } ,    


               op_default : ">" ,
               op         : [ ">" , "<" , "=" ,">=" , "<=" ,"!=" , "&" ,"|" ],


               // op:[ ">" , "<" , "=" ,">=" , "<=" ,"!=" , "&" ,"|" ,"!" ,"~"],

               verb_default:'And' , 
               verb: [ 'And' , 'Or'] ,  


               severity_default:"0" ,   
               severity:{   '0':'Indeterminate',
                            '1':'Critical ',
                            '2':'Major ',
                            '3':'Minor ',
                            '4':'Warning',
                           // '5':'Cleared'
                        } ,

                class_id_default:"1" ,        
                class_id: [ '0','1','2','3','4','5','6','7','8','9' ] ,      // 类型;        

               desc:"" 
            },
 
            // 新建 trigger 时 conditons [] 中 的值 使用该模版; 
            trigger_c:{ //verb : null,
                        exp : {
                          left  : { fn:'PV', args:null },    //   fn: pv  || null ; 
                          op    : ">=",
                          right : { fn:'PV', args:null }
                        }
            } ,

            sysManageMode : 1 ,
            sysModelMode: {
                default: "1",
                values:{"2":"UnManaged", "1":"Managed"}  
            } ,
 
            save_his: {
                desc: " prof pint 是否保存历史!",
                default: 0,
                values: [{ v:0 ,k:"不保存历史"}, {v: 1 ,k : "保存历史"}]
            },

            log_period: {
                desc: " prof pint 的 日志周期!",
                default: 30,
                values:[  {v:'30' , k: "30秒"}, 
                          {v:'60',k: "60秒"},
                          {v:'300',k: "5分钟"}, 
                          {v:'600' ,k: "10分钟"},
                          {v:'900',k: "15分钟"},
                          {v:'1800',k: "30分钟"},
                          {v:'3600',k:"60分钟" }
                        ]
            },
            log_type: {
                default:"RAW",
                values:{
                    "RAW":"保存原始记录",
                    "CHANGED":"只在变化时存储"
                }
            } ,

            // 添加 device 时 根据类型 加载;
            device_type: [] ,

            // 添加 device   moudbus  0 时 配置 数据;  以后版本要更新; ;
            //"device_modbus_" : {  // 根据version 配置; 

            "device" : {
                // device emodel 驱动Id ;  
                "FCS_MODBUS":{
                    // device model 驱动 版本号 ; 
                    "1.0.0.0":{
                        protocol_default: 0 ,
                        protocol :  {0: 'ModbusRtu',1:'ModbusTcp'} ,

                        data_order_default: 0 ,
                        data_order : {
                                     0:'FFH4_FFH3_FFH2_FFH1',
                                     1:'FFH3_FFH4_FFH1_FFH2',
                                     2:'FFH1_FFH2_FFH3_FFH4',
                                     3:'FFH2_FFH1_FFH4_FFH3'
                        } ,

                        double_order_default: 0 ,
                        double_order : {0:'正序', 1:'反序'} , 

                        crc_order_default: 0 ,
                        crc_order : {0 :'高前低后',1:'低前高后'}  
                    } ,

                    "1.0.0.1":{
                        protocol_default: 0 ,
                        protocol :  {0: 'ModbusRtu',1:'ModbusTcp'} ,

                        data_order_default: 0 ,
                        data_order : {
                                     0:'FFH4_FFH3_FFH2_FFH1',
                                     1:'FFH3_FFH4_FFH1_FFH2',
                                     2:'FFH1_FFH2_FFH3_FFH4',
                                     3:'FFH2_FFH1_FFH4_FFH3'
                        } ,

                        double_order_default: 0 ,
                        double_order : {0:'正序', 1:'反序'} , 

                        crc_order_default: 0 ,
                        crc_order : {0 :'高前低后',1:'低前高后'}  
                    } 


                }   
            },
 
            // tip 分类;  profPoint-tip ;
 
            // template 点创建;  template point type ;  0 = modbus ;
            "point" : { 
                // devicemodel  驱动 Id ;   
                "FCS_MODBUS":{ 
                  //device model 驱动 版本 ;  
                    "1.0.0.0":{   
                                entity: { params: { "area": '0',"data_type": '0',"access_right": '0' ,"address": 1 } },
                                 
                                data_type: 
                                    { 0:"布尔" ,
                                     1:"有符号字节",
                                     2:"无符号字节" ,
                                     3 :"16位有符号整数"   ,
                                     4 :"16位无符号整数"   ,
                                     5 :"32有符号整数"   ,
                                     6 :"32位无符号整数"   ,
                                     7 :"单精度浮点数"   ,
                                     8 :"双精度浮点数"   ,
                                     9 :"16位BCD码"   ,
                                     10 :"32位BCD码"   ,
                                     11 :"\\0 结束ASCII字符串"   ,
                                     12 :"固定长度ASCII字符串" ,
                                     
                                    } ,
                                // 数据区 
                                area:{ 0:"CO区", 1:"DI区" ,2:"HR区",3:"AI区" } ,

                                // 高低位 字节; 
                                hlbyte :{0:"高字节" , 1:"低字节"} ,
                                 // 读写属性; 
                                access_right:{0:"只读", 1:"只写",2:"读写"}
                    } ,

                    "1.0.0.1":{   
                                entity: { params: { "area": '0',"data_type": '0',"access_right": '0' ,"address": 1 } },
                                 
                                data_type: 
                                    { 0:"布尔" ,
                                     1:"有符号字节",
                                     2:"无符号字节" ,
                                     3 :"16位有符号整数"   ,
                                     4 :"16位无符号整数"   ,
                                     5 :"32有符号整数"   ,
                                     6 :"32位无符号整数"   ,
                                     7 :"单精度浮点数"   ,
                                     8 :"双精度浮点数"   ,
                                     9 :"16位BCD码"   ,
                                     10 :"32位BCD码"   ,
                                     11 :"\\0 结束ASCII字符串"   ,
                                     12 :"固定长度ASCII字符串"
                                    } ,
                                // 数据区 
                                area:{ 0:"CO区", 1:"DI区" ,2:"HR区",3:"AI区" } ,

                                // 高低位 字节; 
                                hlbyte :{0:"高字节" , 1:"低字节"} ,
                                 // 读写属性; 
                                access_right:{0:"只读", 1:"只写",2:"读写"}
                    } ,



                }
            },   

            "tag":{
                type:['Number','Boolean','String','Buffer','Array','Date','Object']

            } ,

            message: {
                entity: {
                    user_category: "0" 
                } ,

                category: {
                    0:'平台用户',
                    1:'联系人用户'
                }        
            } ,

            gateway:{
                types : {  
                            'RS232_1' :"RS232" ,
                            'RS232_2' :"RS232" ,
                            'RS232_3' :"RS232" ,
                            'RS232_4' :"RS232" , 
                            
                            'RS485_1':'RS485' , 
                            'RS485_2':'RS485' ,  
                            
                            'RS422_1':'RS422' , 
                            'RS422_2':'RS422' 

                        },

                baud_rate: [ 1200 , 2400 , 4800 , 9600 , 19200 , 38400],
                data_bits: [ 7, 8 ] ,
                stop_bits: [ 1, 2 ] ,
                parity : {'none':"无校验" , 'even':"偶校验" , 'odd':"奇校验"},

                gps_distance: [ 50,100,250,500 ] ,
                gps_baud_rate :  [ 300 , 600 , 1200 , 2400 , 4800 , 9600 , 19200  ] ,


                entity: { enable:true , baud_rate:9600 , data_bits:8 , stop_bits: 1  ,  parity: 'none' , delay: 10  }
            } ,

            "desc":""
 }});  
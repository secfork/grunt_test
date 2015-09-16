angular.module('app.sysconfig', [], function() {})

.service("$sys", function($translate) {
    return {
        $debug: true, 
        
        // systemo 模式: manage , unmanage ,unknown ; 
        manageMode: 1,

        itemsPerPage: 5,
 

        // 账户权限; 
        accountP:[
                      "REGION_MANAGE", // 区域管理
                      "MODEL_MANAGE", //模型管理
                      "GROUP_MANAGE", //用户组管理
                      "USER_MANAGE", //用户管理
                      "ROLE_MANAGE", //角色管理
                    ],
        // 区域权限; 
        regionP: [

                      "READ_DATA", //读数据
                      "WRITE_DATA", //写数据
                      "ALARM_VIEW", //报警查看
                      "ACK_ALARM", //报警确认
                      "SYSTEM_MANAGE", //系统管理
                      "TICKET_MANAGE", //ticket管理
                      "REGION_USER_MANAGE", //区域用户管理
                      "SYSTEM_CONTROL" //系统控制
                    ] ,      

        plotChartConfig: {
            colors: ['#23b7e5'],
            // series: { shadowSize: 1 },  
            grid: {
                hoverable: true,
                clickable: true,
                borderWidth: 1,
                color: '#ccc'
            },

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

            tooltipOpts: {
                content: '%x  -- %y',
                defaultTheme: false,
                shifts: {
                    x: 0,
                    y: 15
                }
            }
        },

        // 角色类型; 
        roleType:{
            '账户角色': 0 ,
            "区域角色":1
        } ,


        // application  首页;
        rootState: "app.proj.manage",
        // 分页数据; 

        // 报警类型;
        alarmtype: {
            defalut: 0,
            values: [{
                    k: "越限值报警 > ",
                    v: 0
                }, {
                    k: "越限值报警 >= ",
                    v: 1
                }, {
                    k: "越限值报警 <",
                    v: 2
                }, {
                    k: "越限值报警 <=",
                    v: 3
                },

                {
                    k: "变化报警  = ",
                    v: 4
                }, {
                    k: "变化报警 !=",
                    v: 5
                },

                /*{k:"位报警 &&"     , v:6 } ,
                {k:"位报警 ||"     , v:7 } ,
                {k:"位报警 xor"    , v:8 } ,
                {k:"位报警 not &&" , v:9 } ,
                {k:"位报警 not || "   , v:10 } ,
                {k:"位报警 not xor"  , v:11 }*/

                {
                    k: "位报警 按位与",
                    v: 6
                }, {
                    k: "位报警 按位或",
                    v: 7
                }, {
                    k: "位报警 按位异或",
                    v: 8
                }, {
                    k: "位报警 按位与 取反",
                    v: 9
                }, {
                    k: "位报警 按位或 取反 ",
                    v: 10
                }, {
                    k: "位报警 按位异或 取反",
                    v: 11
                }

            ]
        },


        // 报警源  alarmorigin
        trigger: {
            origin_default: '0',
            origin: {
                0: "ThingLinx Cloud",
                1: "Remote Gateway"
            },

            action_default: 'alarm',
            action: {
                'alarm': "Alarm",
                "event": "Event",
                'task': "Task"
            }, // 1:"事件" , 2:"任务"} ,

            action_alarm: "alarm",
            action_event: "event",
            action_task: "task",

            type_default: '1',
            type: {
                0: "状态持续触发",
                1: "状态变化触发"
            },

            // {"PV":"PV" ,null:"输入值"},  
            // fn 限制不可为 字符串的 "null" 故 改成 array 形式; 
            fn_default: "PV",
            fn: {
                "PV": "PV"
            },


            op_default: ">",
            op: [">", "<", "=", ">=", "<=", "!=", "&", "|"],


            // op:[ ">" , "<" , "=" ,">=" , "<=" ,"!=" , "&" ,"|" ,"!" ,"~"],

            verb_default: 'And',
            verb: ['And', 'Or'],


            severity_default: "0",
            severity: {
                '0': 'Indeterminate',
                '1': 'Critical ',
                '2': 'Major ',
                '3': 'Minor ',
                '4': 'Warning',
                // '5':'Cleared'
            },

            class_id_default: "1",
            class_id: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'], // 类型;        

            desc: ""
        },

        // 新建 trigger 时 conditons [] 中 的值 使用该模版; 
        trigger_c: { //verb : null,
            exp: {
                left: {
                    fn: 'PV',
                    args: null
                }, //   fn: pv  || null ; 
                op: ">=",
                right: {
                    fn: 'PV',
                    args: null
                }
            }
        },

        sysManageMode: 1,
        sysModelMode: {
            default: "1",
            values: {
                "2": "UnManaged",
                "1": "Managed"
            }
        },

        save_his: {
            desc: " prof pint 是否保存历史!",
            default: 0,
            values: [{
                v: 0,
                k: "不保存历史"
            }, {
                v: 1,
                k: "保存历史"
            }]
        },

        log_period: {
            desc: " prof pint 的 日志周期!",
            default: 30,
            values: [{
                v: '30',
                k: "30秒"
            }, {
                v: '60',
                k: "60秒"
            }, {
                v: '300',
                k: "5分钟"
            }, {
                v: '600',
                k: "10分钟"
            }, {
                v: '900',
                k: "15分钟"
            }, {
                v: '1800',
                k: "30分钟"
            }, {
                v: '3600',
                k: "60分钟"
            }]
        },
        log_type: {
            default: "RAW",
            values: {
                "RAW": "保存原始记录",
                "CHANGED": "只在变化时存储"
            }
        },

        // 添加 device 时 根据类型 加载;
        device_type: [],

        // 添加 device   moudbus  0 时 配置 数据;  以后版本要更新; ;
        //"device_modbus_" : {  // 根据version 配置; 

        "device": {
            entity:{
                Cycle:2 , 
                CycleUnit:1,
                SlowCycle:59,
                SlowCycleUnit:1,
                Timeout:15,
                Retry:1 ,
                Delay:0 ,
            },

             // 时间单位; 
            timeUnit:[
                {k:"Second" , v: 0} ,
                {k:"Minute" , v: 1} ,
                {k:"Hour" , v: 2 } 
            ], 

            // device emodel 的 驱动Id ;  
            "FCS_MODBUS": {
                // 公共部分默认值 ; 
                entity:{ 
                    params:{ // 驱动部分默认值; 
                        Address : 1 ,
                        ProtocolType: 0 ,
                        OffsetFormat : 0 ,
                        RegisterLength :1 ,
                        MaxPacketLength: 64 ,
                        PacketOffset : 4 ,
                        IntOrder: 0 ,
                        Int64Order: 0 ,
                        FloatOrder: 0 ,
                        DoubleOrder:0 ,
                        RegisterOrder : 0 ,
                        CRCOrder: 0 
                    }  
                },

                // device model 驱动 版本号 ;  // {k:"" , v: } ,
 
                protocol: [
                    {k:"ModbusRtu" , v:0},
                    {k:"ModbusTcp" , v:1} 
                ], 

                offsetformat :[
                     {k:"10进制" , v: 0} ,
                     {k:"Modbus格式" , v:1 } 
                ],

                reglength :[
                     {k:"1 字节" , v:0 } ,
                     {k:"2 字节" , v:1 } ,
                     {k:"4 字节" , v:2 } 
                ] ,

                order_a:  [
                    {k:"FFH4_FFH3_FFH2_FFH1" , v:0},
                    {k:"FFH3_FFH4_FFH1_FFH2" , v:1},
                    {k:"FFH1_FFH2_FFH3_FFH4" , v:2},
                    {k:"FFH2_FFH1_FFH4_FFH3" , v:3}
                ],

                order_b: [
                    {k:"正序", v:0},
                    {k:"逆序", v:1}
                ],

                order_c: [
                    {k:"高前低后" , v:0},
                    {k:"低前高后" , v:1}
                ]
                
            },

            "PLC_SIEMENS_PPI":{
                entity:{
                    params:{
                        Address : 1,
                        MaxPacketLength : 150 ,
                        PacketOffset  : 10 
                    }
                }
            }

            



        },

        // tip 分类;  profPoint-tip ;

        // template 点创建;  template point type ;  0 = modbus ;



        "point": {
            // 公共部分默认值; 
            entity: {
                Poll:  0 ,
                IsPacket: false,
                
            },

            // 点轮询 ; 
            pointPoll:[
                {k:"Normal" , v:0},
                {k:"Slow", v:1},
                {k:"Call", v:2},
            ], 

            // devicemodel  驱动 Id ;   
            "FCS_MODBUS": { 
                // 驱动相对应的默认参数; 
                entity:{ 
                    params: {
                        "Area": 0,
                        "Offset":0,
                        "Type": 0, //  可选项遂区域在变; 
                        // "TypeEx": 0,// 遂区域在变; 
                        "Access": 0  // 遂区域变; 
                    } 
                },
                // 级联属性 start ;  
                // Area 变化是数据变化; 
                
                AreaCC : function( point  ){
                    // k :area , v: access ;  
                    
                    //@if  append
                        console.log("AreaCC"); 
                    //@endif         

                    var cc = {1:0 , 3:0 , 0:2 , 2:2};
                    if( point.params.Area < 2){
                        point.params.Type = 0 ; 
                        point.params.TypeEx = undefined ;  
                    }else{
                        point.params.Type = 3 ; 
                        point.params.TypeEx = undefined ; 
                    }
                    point.params.Access = cc[ point.params.Area];  
                } ,
                // Type 变化时 数据变化; 
                TypeCC : function(point){
                    //@if  append
                        console.log("TypeCC"); 
                    //@endif   
                    if( point.params.Area  > 1 ){
                        //  // k: 数据类型 , v: typeEx 值;   
                        var cc = { 0:0 , 1:0 , 2:0 , 13:1 , 14:1}; 

                        point.params.TypeEx = cc[ point.params.Type ];
                    }

                } , 

                // 级联属性 end ;
                type:[
                    {k:"Bool" , v:0 },
                    {k:"Char" , v:1 },
                    {k:"Byte" , v:2 },
                    {k:"Short" , v:3 },
                    {k:"Word" , v: 4},
                    {k:"Int" , v: 5},
                    {k:"DWord" , v:6 },
                    {k:"Float" , v: 7},
                    {k:"BCD16" , v: 8},
                    {k:"BCD32" , v: 9},
                    {k:"Int64" , v: 10},
                    {k:"UInt64" , v:11 },
                    {k:"Double" , v:12 },
                    {k:"String" , v:13 },
                    {k:"Buffer" , v:14 },
                ], 
                // 数据区 
                area: [
                    {k:"CO区" , v:0 },
                    {k:"DI区" , v:1 },
                    {k:"HR区" , v:2 },
                    {k:"AI区" , v:3 },
                ] ,

                // 高低位 字节; 
                hlbyte: [
                    {k:"HightByte" , v:0},
                    {k:"LowByte" , v:1 }
                ],
                // 读写属性; 
                access: [
                    {k:"Read" ,v:0 },
                    {k:"Write" ,v:1 },
                    {k:"ReadWrite" ,v:2 }
                ] 
            },

            "PLC_SIEMENS_PPI":{
                // 驱动默认参数; 
                entity:{
                    params:{
                        Area:0,
                        Offset: 0,
                        Type: 0 ,
                        TypeEx : 0 
                    }
                } ,

                areaCC : function ( scope , point  , bool ){ 
                    var  t   , 
                         tt = this.type ,

                        area = point.params.Area ;

                    function cc ( data){
                        if(bool){
                            scope._dataType = data ; 
                        }else{
                            scope.$parent._dataType = data ; 
                        } 
                    } ;


                    if(  0<= area <= 3 ){ 
                        t = angular.copy( this.type) ;
                        t.splice(9,1);
                        cc( t ) ;
                        point.params.Type = 0 ;
                        
                    }
                    if( area == 4 ){
                        cc(tt);
                        point.params.Type = 0 ;
                        // point.params.typeEx = 1 ;
                        
                    }

                    if( area == 5 || area == 9){
                        cc( [ tt[6] , tt[7] , tt[8] ] ) ; 
                        point.params.Type = 6 ; 
                         
                    }

                    if( area == 6 || area == 8 ){
                        point.params.Type = undefined ; 
                        point.params.typeEx = undefined ; 
 
                    }

                    if (area ==7 || area == 10 || area == 11) {
                        cc (  [ tt[3] , tt[4] , tt[5] ] ) ; 
                        point.params.Type = 3 ; 
                        
                    }; 

                   // scope.$digest();
                     //@if  append 
                        console.log("areaCC", arguments )
                    //@endif 

                },

                typeCC : function ( point ){
                    var area = point.params.Area,
                        type = point.params.Type ; 
                    if( type == 0 ){
                        point.params.TypeEx = 0;
                        return ;
                    }    
                    if( type == 9){
                        point.params.TypeEx =1 ;
                        return ;
                    }
                    point.params.TypeEx = undefined ;
                } ,


                area :[
                    {k:"I 离散输入" , v:0},
                    {k:"Q 离散输出" , v:1},
                    {k:"M 内部内存位" , v:2},
                    {k:"SM 特殊内存位" , v:3},
                    {k:"V 内存变量" , v:4},
                    {k:"T 定时器当前值" , v:5},
                    {k:"T 定时器位" , v:6},
                    {k:"C 计数器当前值" , v:7},
                    {k:"C 计数器位" , v:8},
                    {k:"HC 高速计数器当前值" , v:9},
                    {k:"AI 模拟输入" , v:10},
                    {k:"AO 模拟输出" , v:11}
                ],
                   
                type:[
                    {k:"BIT(位 0~7)" , v:0},
                    {k:"BY (8位无符号整型,0~255)" , v:1},
                    {k:"CH (8位有符号整型,-128~127)" , v:2},
                    {k:"US (16位无符号整型, 0~65535)" , v:3},
                    {k:"SS (16位有符号整型, -32768~32767)" , v:4},
                    {k:"SB (16位 BCD 整型, 0~9999)" , v:5},
                    {k:"LG (32位长整型, -2147483648~2147483647)" , v:6},
                    {k:"LB (32位 BCD 格式整型 , 0~99999999)" , v:7},
                    {k:"FL (32位IEEE格式单精度浮点型)" , v:8},
                    {k:"STR(ASCII 字符串型,1~127个字符)" , v:9}
                ]
            }
 

        },

        "tag": {
            type: ['Number', 'Boolean', 'String', 'Buffer', 'Array', 'Date', 'Object']

        },

        message: {
            entity: {
                user_category: "0"
            },

            category: {
                0: '平台用户',
                1: '联系人用户'
            }
        },

        gateway: {
            types: {
                'RS232_1': "RS232",
                'RS232_2': "RS232",
                'RS232_3': "RS232",
                'RS232_4': "RS232",

                'RS485_1': 'RS485',
                'RS485_2': 'RS485',

                'RS422_1': 'RS422',
                'RS422_2': 'RS422'

            },

            baud_rate: [1200, 2400, 4800, 9600, 19200, 38400],
            data_bits: [7, 8],
            stop_bits: [1, 2],
            parity: {
                'none': "无校验",
                'even': "偶校验",
                'odd': "奇校验"
            },

            gps_distance: [50, 100, 250, 500],
            gps_baud_rate: [300, 600, 1200, 2400, 4800, 9600, 19200],


            entity: {
                enable: true,
                baud_rate: 9600,
                data_bits: 8,
                stop_bits: 1,
                parity: 'none',
                delay: 10
            }
        },

        "desc": ""
    }
});
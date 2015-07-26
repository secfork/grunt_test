define([ ], function( ){

	var rootUrl = "", 

	    devmodel   =  rootUrl + "web/devmodel/:pk",
        dmPoint    =  rootUrl + "web/devmodel/points/:pk",
        sysProfile = rootUrl + "web/profile/:pk",
        sysLogTag  = rootUrl + "web/profile/tags/:pk",
        sysTag     = rootUrl + "web/sysmodel/tags/:pk" ,

        sysProfTrigger = rootUrl + "web/profile/triggers/:pk" ,
        sysModel       = rootUrl + "web/sysmodel/:pk",

        sysDevice = rootUrl + "web/sysmodel/devices/:pk" ,
        message   = rootUrl + "web/sysmodel/messages"  ,

        system   = rootUrl + "web/system/:pk/:options/:proj_id" ,
        contact  = rootUrl  + "web/system/contacts/:pk" ,

        common   = "/xx" ;

	return ['$resource', function($resource) { 

		    this.$deviceModel = $resource(devmodel);
		    this.$dmPoint     = $resource(dmPoint);
		    this.$sysProfile  = $resource(sysProfile);
		    this.$sysLogTag   = $resource(sysLogTag);
		    this.$sysTag         = $resource(sysTag);
		    this.$sysProfTrigger = $resource(sysProfTrigger);
		    this.$sysModel       = $resource(sysModel);
		    this.$sysDevice      = $resource(sysDevice);
		    this.$message =  $resource(  message  ) ;
		    this.$contact =  $resource( contact) ;


		    this.$common = $resource( common, {} , {
                    cc_passWord :{ url: rootUrl + "web/common/ccpassword" , method:"PUT"   }
                });

    		this.$system =  $resource(rootUrl + "web/system/:pk/:options/:proj_id", {}, {
                    sync: { method:"PUT"} ,
                    stop: { method:"DELETE"} ,
                    start:{ method:"GET"} ,
                    call: { method:"POST"} ,

                    needSync:{ url: rootUrl + "web/system/needsync/uuids" }
                });

            this.$driver =$resource( rootUrl +"web/driver/:pk",{},{ 
                          // template , type =0 得到的是 driver最高版本;
                          getDriverList:{params :{id:"list" ,type:0}   }, 

                         // station ; type = 1 ;  得到 dtu ;
                          getDtuList :{params:{id:"list",type:1}  },
                         /**
                          * type =  tempalte_ui,  driver_ui ;
                          */
                          getUi:{ isArray:true} ,

                          getDaserveInfo :{url: rootUrl +"web/driver/daserver/:id"}

                    });

            this.$show = $resource("/xx", {}, {
                live:{ url: rootUrl + "web/show/live/:uuid" } ,
                history: { url:rootUrl + "web/show/history/:uuid"  } ,
                alarm: { url: rootUrl + "web/show/alarm/:uuid" }

            });

	 }]
		

})
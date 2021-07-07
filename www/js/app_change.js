/******************************************
Global
******************************************/
var clientpk = sessionStorage.getItem("CLIENT_ID");

/******************************************
Controllers
******************************************/
(function() {

    //var myApp = angular.module("myApp", []);
	var myApp = angular.module("myApp", ['pascalprecht.translate']);
	myApp.config(function ($translateProvider) {

	 $translateProvider.useStaticFilesLoader({
		prefix: "locales/locale-",
		suffix: ".json"
	 });
     $translateProvider.preferredLanguage(ln.language.code);
	});

    myApp.controller("clientCtrl", function($scope,$filter){

        $scope.EDIT_MODE = false;

        $scope.newleader = "";

        /******************************************
        - Applicant's Data
        ******************************************/
        $scope.apHighestEdOthers = function(){
            return $scope.clientinfo.CLT_HIGH_EDU=="6";     //returns TRUE if Education "Others" is selected
        };

        /******************************************
        - Husband's Info
        ******************************************/
        $scope.showHusband = function(){ //show fields on husband tab if Married, Divorced or Widowed. Or if not single.
            return $scope.clientinfo.CLT_MARITAL_STATUS=='M'||
                $scope.clientinfo.CLT_MARITAL_STATUS=='D'||
                $scope.clientinfo.CLT_MARITAL_STATUS=='W';
        };

        /******************************************
        - On Submit of Change Request
        ******************************************/
        $scope.asyncSwal = function(title,text,type,page){
            swal({
                title:title,
                text:text,
                type:type
            }).then(function (isConfirm){
                if(isConfirm) $.mobile.changePage(page);
            },function(){

						});
        };


        $scope.actionSubmit = function(){
            //check if education if others is specified
            if($scope.clientinfo.CLT_HIGH_EDU=='6'&&$scope.clientinfo.CLT_HIGH_EDU_OTHER===""){
                //alert("Please specify other education.");
				//alert(i18n.t("messages.EmptyOtherEducation"));
                $scope.asyncSwal(i18n.t("messages.Alert"),i18n.t("messages.EmptyOtherEducation"),'warning','#pageAppData');
                return false;
            }

            //check marital status page
            if(
                //checkNull($scope.clientinfo.CLT_MARITAL_STATUS,"Please specify client's marital status.")
				checkNull($scope.clientinfo.CLT_MARITAL_STATUS,i18n.t("messages.EmptyMaritalStatus"))
            ){
                $.mobile.changePage("#pageAppData2");
                return false;
            }
            if($scope.clientinfo.CLT_MARITAL_STATUS!='S'&&($scope.clientinfo.CLT_HB_NAME==null)){
                //alert("Please specify husband's name.");
				// alert(i18n.t("messages.EmptyHusbandName"));
    //             $.mobile.changePage("#pageAppData2");
    //             return false;

                $scope.asyncSwal(i18n.t("messages.Alert"),i18n.t("messages.EmptyHusbandName"),'warning','#pageAppData2');
                return false;
            }
			/*
            if(
                //checkNull($scope.clientinfo.CLT_HB_ID,"Please specify husband's ID number.")
				checkNull($scope.clientinfo.CLT_HB_ID,i18n.t("messages.EmptyHusbandIDNo"))
            )
			{
                $.mobile.changePage("#pageAppData2");
                return false;
            }
            */
            if(
				/*
                checkNull($scope.clientinfo.CLT_NUM_HOUSE_MEM,"Please specify number of members in the household.")||
                checkRange(0,99,$scope.clientinfo.CLT_NUM_HOUSE_MEM,"Number of members in household must be 0-99.")||
                checkNull($scope.clientinfo.CLT_NUM_CHILDREN,"Please specify number of children in the household.")||
                checkRange(0,99,$scope.clientinfo.CLT_NUM_CHILDREN,"Number of children in household must be 0-99.")
				*/

				checkNull($scope.clientinfo.CLT_NUM_HOUSE_MEM,i18n.t("messages.EmptyMember"))||
                checkRange(0,99,$scope.clientinfo.CLT_NUM_HOUSE_MEM,i18n.t("messages.InvalidMember"))||
                checkNull($scope.clientinfo.CLT_NUM_CHILDREN,i18n.t("messages.EmptyChildren"))||
                checkRange(0,99,$scope.clientinfo.CLT_NUM_CHILDREN,i18n.t("messages.InvalidChildren"))

            )
            {
                $.mobile.changePage("#pageAppData3");
                return false;
            }

            if(
				/*
                checkNull($scope.clientinfo.CLT_VILLAGE,"Please specify village.")||
                checkNull($scope.clientinfo.CLT_SUB_DISTRICT,"Please specify subdistrict.")||
                checkNull($scope.clientinfo.CLT_DISTRICT,"Please specify district.")||
                checkNull($scope.clientinfo.CLT_PROVINCE,"Please specify province.")
				*/

				checkNull($scope.clientinfo.CLT_VILLAGE.value,i18n.t("messages.EmptyVillage"))||
                checkNull($scope.clientinfo.CLT_SUB_DISTRICT,i18n.t("messages.EmptySubDistrict"))||
                checkNull($scope.clientinfo.CLT_DISTRICT,i18n.t("messages.EmptyDistrict"))||
                checkNull($scope.clientinfo.CLT_PROVINCE,i18n.t("messages.EmptyProvince"))

            )
            {
                $.mobile.changePage("#pageAddress");
                return false;
            }
            if($scope.clientinfo.CLT_VILLAGE.value=="?"){
                //alert("Please specify village.");
				// alert(i18n.t("messages.EmptyVillage"));
    //             $.mobile.changePage("#pageAddress");
    //             return false;

                $scope.asyncSwal(i18n.t("messages.Alert"),i18n.t("messages.EmptyVillage"),'warning','#pageAddress');
                return false;
            }

           // if(!confirm("Submit change request?")) return false;
		    //if(!confirm(i18n.t("messages.SubmitChangeRequest"))) return false;
            swal({
                title:i18n.t("messages.Alert"),
                text:i18n.t("messages.SubmitChangeRequest"),
                type:'info'
            }).then(function (isConfirm){
                if(isConfirm){
                    $scope.actionSubmitSecond();
                }
            });
        }; //end of Action Submit

        $scope.actionSubmitSecond = function(){
            /******************************************
            - Data Cleaning
            ******************************************/

            var branchpk = parseInt(sessionStorage.getItem("BRC_PK"));
            var fopk = sessionStorage.getItem("USER_PK");
            var groupid = sessionStorage.getItem("GROUP_ID");
            var date = new Date();
            date = ("0"+date.getDate()).slice(-2)+"/"+("0"+(date.getMonth()+1)).slice(-2)+"/"+date.getFullYear()+" "
                +("0"+date.getHours()).slice(-2)+":"
                +("0"+date.getMinutes()).slice(-2)+":"
                +("0"+date.getSeconds()).slice(-2);

            var cmd = "";
            if($scope.EDIT_MODE){ //User is editting

                cmd += "UPDATE T_CLIENT_CHANGE_REQUEST SET ";
                cmd += "CCR_HIGH_EDU='"+$scope.clientinfo.CLT_HIGH_EDU+"',";
                cmd += "CCR_HIGH_EDU_OTHER='"+sanitize($scope.clientinfo.CLT_HIGH_EDU_OTHER)+"',";

                cmd += "CCR_MARITAL_STATUS='"+$scope.clientinfo.CLT_MARITAL_STATUS+"',";
                cmd += "CCR_HB_NAME='"+sanitize($scope.clientinfo.CLT_HB_NAME)+"',";
                cmd += "CCR_HB_ID='"+$scope.clientinfo.CLT_HB_ID+"',";
                cmd += "CCR_HB_LIVE_IN_HOUSE='"+(($scope.clientinfo.CLT_HB_LIVE_IN_HOUSE=="YES")?"Y":"N")+"',";
                cmd += "CCR_HB_LIVE_PLACE='"+sanitize($scope.clientinfo.CLT_HB_LIVE_PLACE)+"',";
                cmd += "CCR_HB_COME_HOUSE='"+$scope.clientinfo.CLT_HB_COME_HOUSE+"',";

                cmd += "CCR_NUM_HOUSE_MEM='"+$scope.clientinfo.CLT_NUM_HOUSE_MEM+"',";
                cmd += "CCR_NUM_CHILDREN='"+$scope.clientinfo.CLT_NUM_CHILDREN+"',";

                cmd += "CCR_BIZ='"+sanitize($scope.clientinfo.CLT_BIZ)+"',";
                cmd += "CCR_BIZ_EQUIPT='"+sanitize($scope.clientinfo.CLT_BIZ_EQUIPT)+"',";
                cmd += "CCR_BOTH_BIZ='"+sanitize($scope.clientinfo.CLT_BOTH_BIZ)+"',";
                cmd += "CCR_BOTH_BIZ_EQUIPT='"+sanitize($scope.clientinfo.CLT_BOTH_BIZ_EQUIPT)+"',";
                cmd += "CCR_HB_BIZ='"+sanitize($scope.clientinfo.CLT_HB_BIZ)+"',";
                cmd += "CCR_HB_BIZ_EQUIPT='"+sanitize($scope.clientinfo.CLT_HB_BIZ_EQUIPT)+"',";

                cmd += "CCR_RT_RW='"+sanitize($scope.clientinfo.CLT_RT_RW)+"',";
                cmd += "CCR_STREET_AREA_NM='"+sanitize($scope.clientinfo.CLT_STREET_AREA_NM)+"',";
                cmd += "CCR_CENTER_ID='"+$scope.clientinfo.CLT_CENTER_ID+"', ";
                cmd += "CCR_VILLAGE='"+$scope.clientinfo.CLT_VILLAGE.value+"',";
                cmd += "CCR_SUB_DISTRICT='"+sanitize($scope.clientinfo.CLT_SUB_DISTRICT)+"',";
                cmd += "CCR_DISTRICT='"+sanitize($scope.clientinfo.CLT_DISTRICT)+"',";
                cmd += "CCR_PROVINCE='"+sanitize($scope.clientinfo.CLT_PROVINCE)+"',";
                cmd += "CCR_POSTAL_CD='"+$scope.clientinfo.CLT_POSTAL_CD+"',";
                cmd += "CCR_LAND_MARK='"+sanitize($scope.clientinfo.CLT_LAND_MARK)+"',";
                cmd += "CCR_MOB_NO_1='"+$scope.clientinfo.CLT_MOB_NO_1+"',";
                cmd += "CCR_MOB_NO_2='"+$scope.clientinfo.CLT_MOB_NO_2+"',";
                cmd += "CCR_HUSB_MOB_NO='"+$scope.clientinfo.CLT_HUSB_MOB_NO+"'";

                cmd += " WHERE CCR_CLT_PK='"+clientpk+"'";

            }else{
                cmd = 'INSERT INTO T_CLIENT_CHANGE_REQUEST VALUES(null,' //new change request
                +clientpk+","
                +clientpk+"," //CCR_CLT_PK
                +branchpk+","
                +"'"+$scope.clientinfo.CLT_FULL_NAME+"',"
                +"'"+$scope.clientinfo.CLT_NICK_NAME+"',"
                +"'"+sanitize($scope.clientinfo.CLT_HB_NAME)+"',"
                +"'"+$scope.clientinfo.CLT_HB_ID+"',"
                +"'"+(($scope.clientinfo.CLT_HB_LIVE_IN_HOUSE=="YES")?"Y":"N")+"',"
                +"'"+$scope.clientinfo.CLT_FAMILY_CARD_NO+"',"
                +"'"+$scope.clientinfo.CLT_CLEINT_ID+"',"
                +"'"+$scope.clientinfo.CLT_OTH_REG_NO+"',"
                +"'"+$scope.clientinfo.CLT_GENDER+"',"
                +"'"+$scope.clientinfo.CLT_DOB+"',"
                +$scope.clientinfo.CLT_AGE+","
                +"'"+$scope.clientinfo.CLT_HIGH_EDU+"',"
                +"'"+sanitize($scope.clientinfo.CLT_HIGH_EDU_OTHER)+"',"
                +"'"+$scope.clientinfo.CLT_MARITAL_STATUS+"',"
                +$scope.clientinfo.CLT_NUM_HOUSE_MEM+","
                +$scope.clientinfo.CLT_NUM_CHILDREN+","
                +"'"+sanitize($scope.clientinfo.CLT_HB_LIVE_PLACE)+"',"
                +"'"+$scope.clientinfo.CLT_HB_COME_HOUSE+"',"
                +"'"+$scope.clientinfo.CLT_MOTHER_NM+"',"
                +"'"+$scope.clientinfo.CLT_MOTHER_DOB+"',"
                +$scope.clientinfo.CLT_MOTHER_AGE+","
                +"'"+sanitize($scope.clientinfo.CLT_BIZ)+"',"
                +"'"+sanitize($scope.clientinfo.CLT_BIZ_EQUIPT)+"',"
                +"'"+sanitize($scope.clientinfo.CLT_HB_BIZ)+"',"
                +"'"+sanitize($scope.clientinfo.CLT_HB_BIZ_EQUIPT)+"',"
                +"'"+sanitize($scope.clientinfo.CLT_BOTH_BIZ)+"',"
                +"'"+sanitize($scope.clientinfo.CLT_BOTH_BIZ_EQUIPT)+"',"
                +"'"+sanitize($scope.clientinfo.CLT_RT_RW)+"',"
                +"'"+sanitize($scope.clientinfo.CLT_STREET_AREA_NM)+"',"
                +"'"+$scope.clientinfo.CLT_CENTER_ID+"',"
                +"'"+$scope.clientinfo.CLT_VILLAGE.value+"',"
                +"'"+sanitize($scope.clientinfo.CLT_SUB_DISTRICT)+"',"
                +"'"+sanitize($scope.clientinfo.CLT_DISTRICT)+"',"
                +"'"+sanitize($scope.clientinfo.CLT_PROVINCE)+"',"
                +"'"+$scope.clientinfo.CLT_POSTAL_CD+"',"
                +"'"+sanitize($scope.clientinfo.CLT_LAND_MARK)+"',"
                +"'"+$scope.clientinfo.CLT_MOB_NO_1+"',"
                +"'"+$scope.clientinfo.CLT_MOB_NO_2+"',"
                +"'"+$scope.clientinfo.CLT_HUSB_MOB_NO+"',"
                +fopk+"," //FO PK
                +"'"+groupid+"'," //GROUP ID
                +fopk+"," //CREATED BY
                +"'"+date+"'," //CREATED DATE
                +"null," //ACCEPTED BY
                +"null," //ACCEPTED DATE
                +"null" //CCR STATUS
                +")";

            }

            if($scope.clientinfo.didChangeAddress && $scope.clientinfo.CLT_IS_GROUP_LEADER == "Y"){

                if($scope.clientinfo.CLT_SUB_DISTRICT_OLD != $scope.clientinfo.CLT_SUB_DISTRICT||
                    $scope.clientinfo.CLT_VILLAGE_OLD.value != $scope.clientinfo.CLT_VILLAGE.value||
                    $scope.clientinfo.CLT_STREET_AREA_NM_OLD != $scope.clientinfo.CLT_STREET_AREA_NM||
                    $scope.clientinfo.CLT_PROVINCE_OLD != $scope.clientinfo.CLT_PROVINCE){

                    var groupid = $scope.clientinfo.CLT_GROUP_ID;
                    if(groupid == undefined) groupid = $scope.clientinfo.CLT_GROUP_ID;

                    var gmd = 'select clt_full_name, * from t_client ';
                    gmd     +=' left join t_client_loan on clt_pk = cll_clt_pk';
                    gmd     +=' left join t_client_change_request on clt_pk = ccr_clt_pk';
                    gmd     +=' where clt_group_id="'+groupid+'" and clt_pk != '+$scope.clientinfo.CLT_PK;
                    gmd     +=' and CLT_VILLAGE='+$scope.clientinfo.CLT_VILLAGE_OLD.value;
                    gmd     +=' and ( CCR_VILLAGE='+$scope.clientinfo.CLT_VILLAGE_OLD.value+' OR CCR_VILLAGE is NULL ) ';
                    gmd     +=' and clt_is_group_leader = "N"';

                    myDB.execute(gmd, function(results){

                        if(results.length==0){
                            return  $scope.actionSubmitThird(cmd);
                        }else{
                            var tablediv = '';
                            tablediv += '<div class="ng-wrapa">';

                            $.each(results, function(id, val){
                                tablediv += '<div class="ng-client ui-shadow ui-btn-corner-all ui-btn-up-c" id="ngclient'+val.CLT_PK+'">';
                                tablediv += '   <div class="left">';
                                tablediv += '       <a href="#" class="ui-btn ui-btn-gr ui-icon-user ui-corner-all ui-btn-inline ui-btn-icon-notext"></a>';
                                tablediv += '   </div>';
                                tablediv += '   <div class="right cl-name marg-top-10">';
                                tablediv += '       <div class="left">'+val.CLT_FULL_NAME+'</div>';
                                tablediv += '   </div>';
                                tablediv += '</div>';
                            });
                            tablediv += '</div>';

                            swal({
                                title: "Choose New Leader",
                                text: tablediv,
                                type: "warning",
                                confirmButtonColor: "#80C6C7",
                                confirmButtonText: "Ok",
                                showCancelButton: true
                                html: true
                            }).then(function (isConfirm) {
                                if (isConfirm) {

                                    var cmds =[];
                                    cmds.push("UPDATE T_CLIENT_LOAN SET CLT_IS_GROUP_LEADER='N' WHERE CLT_GROUP_ID='"+groupid+"' AND CLL_CLT_PK="+$scope.clientinfo.CLT_PK);
                                    cmds.push("UPDATE T_CLIENT_LOAN SET CLT_IS_GROUP_LEADER='Y' WHERE CLT_GROUP_ID='"+groupid+"' AND CLL_CLT_PK="+$scope.newleader);
                                    //console.log(cmds);
                                    myDB.dbShell.transaction(function(tx){
                                        for(e in cmds) tx.executeSql(cmds[e]);
                                    // }, function(err){alert("There was an error making change leader request.");return false;}, function(suc){
                                    }, function(err){alert(i18n.t("messages.ChangeLeaderError"));return false;}, function(suc){
                                        // alert("Group leader changed.");
                                        swal({
                                            title:i18n.t("messages.GroupLeaderChange"),
                                            closeOnConfirm:false,
                                            type:'success'
                                        },function (isConfirm) {
                                            if(isConfirm){
                                                return  $scope.actionSubmitThird(cmd);
                                            }
                                        })
                                    });
                                }
                            });
                        }
                    });

                }

            } else {
                $scope.actionSubmitThird(cmd);
            }
        }

        $scope.actionSubmitThird = function(cmd){
            cmd = cmd.replace(/undefined/g, ""); //clean data
            //console.log(cmd);
            myDB.dbShell.transaction(function(tx){
                tx.executeSql(cmd);
            }, function(err){
                swal("err:"+JSON.stringify(err));return true;
            }, function(suc){
               // alert("Successfully added change request.");
                swal({
                    title:i18n.t("messages.AddChangeRequestSuccess"),
                    type:'success',
                    closeOnConfirm: true
                },function (isConfirm) {
                    if(isConfirm){
                        window.location.href = "client.html";
                    }
                });
            });
        }

        /******************************************
        - Data Initialization
        ******************************************/
        var t = this;

        $scope.selectCodes = {};
        $scope.clientinfo = {};

        //get database defaults
        myDB.T_CODE.get("(CODE_TYPE_PK>=1 AND CODE_TYPE_PK<=3) OR CODE_TYPE_PK=6 OR (CODE_TYPE_PK>=9 AND CODE_TYPE_PK<=16)",function(results){
            results.forEach(function(value,index){
                $scope.selectCodes[value.CODE_TYPE_PK] || ($scope.selectCodes[value.CODE_TYPE_PK] = []); //init if null
                var keypair = {'name': value.CODE_NAME,'value': value.CODE_VALUE}
                $scope.selectCodes[value.CODE_TYPE_PK].push(keypair);
                if(value.CODE_TYPE_PK==2){
                    $scope.selectCodes[2][value.CODE_VALUE] = value.CODE_NAME;
                }
            });

            myDB.T_VILLAGE_MASTER.get(null,function(results){//grab villages now
                $.each(results, function(ind, val){
                    $scope.selectCodes['VILL'] || ($scope.selectCodes['VILL'] = []); //init if null
                    var keypair = {'name': val.VLM_NAME,'value': val.VLM_PK}
                    $scope.selectCodes['VILL'].push(keypair);
                });
                $scope.$apply(function (){
                    $scope.selectCodes;
                    $scope.beginLoad();
                });
            });

            myDB.T_CENTER_MASTER.get(null,function(results){//grab villages now
                $.each(results, function(ind, val){
                    $scope.selectCodes['CTR'] || ($scope.selectCodes['CTR'] = []); //init if null
                    var keypair = {'name':val.CTR_CENTER_NAME , 'value':val.CTR_PK };
                    $scope.selectCodes['CTR'].push(keypair);
                });
                $scope.$apply(function (){
                    $scope.selectCodes;
                    $scope.beginLoad();
                });
            });

        });

        //get previous change request if any
        $scope.beginLoad = function(){
            myDB.T_CLIENT_CHANGE_REQUEST.get('CCR_CLT_PK='+clientpk,function(results){
                if(results.length<=0){$scope.loadClient();} //no results//load from T_CLIENT
                else{
                    $scope.prepChgReq(results[0]);
                    $scope.EDIT_MODE = true;
                }
            });
        };

        $scope.loadClient = function(){
            //console.log($scope);
            var cmd =   " select clt.*, cll.cll_account_number, cll.cll_loan_number,clt_group_id,clt_is_group_leader, vlm.vlm_name "+
                        " from t_client as clt "+
                        " left join t_client_loan as cll on (cll.cll_clt_pk = clt.clt_pk)"+
                        " left join t_village_master as vlm on (vlm.vlm_pk = clt.clt_village) "+
                        " where clt.clt_pk ="+clientpk;


            myDB.execute(cmd, function(results){
                if(results.length<=0){
                    //don't do anything
                }else{
                    //console.log(results[0]);
                    $scope.populateRequest(results[0]);
                }
            });

            // myDB.T_CLIENT.get('CLT_PK='+clientpk,function(results){
            //     if(results.length<=0){
            //         //don't do anything
            //     }else{
            //         $scope.populateRequest(results[0]);
            //     }
            // });
        }
        $('body').on('click','.ng-client', function(){
            var div = $(this);
            $('.ng-client').removeClass('selected');
            $('.ng-client').find('a').removeClass('ui-btn-g');
            $('.ng-client').find('a').addClass('ui-btn-gr');
            div.addClass('selected');

            div.find('a').toggleClass('ui-btn-gr');
            div.find('a').toggleClass('ui-btn-g');
            var client = div.attr('id');
            client = client.replace('ngclient','');
            $scope.newleader = client;

        });
        $scope.prepChgReq = function(result){ //For easy data renaming, saving as CLT instead of CCR
            var str = JSON.stringify(result)
            //console.log(str);
            str = str.replace(/CCR/g, "CLT");
            //console.log(str);
            $scope.populateRequest(JSON.parse(str));
        };

        $scope.populateRequest = function(value){ //handles Angular/JQuery mobile select box UI
            $scope.$apply(function(){
                //console.log(value);
                value.didChangeAddress = false;

                value.CLT_SUB_DISTRICT_OLD = value.CLT_SUB_DISTRICT;
                value.CLT_VILLAGE_OLD = {
                    value:value.CLT_VILLAGE,
                    name:value.VLM_NAME,
                };
                value.CLT_STREET_AREA_NM_OLD = value.CLT_STREET_AREA_NM;
                value.CLT_PROVINCE_OLD = value.CLT_PROVINCE;

                $scope.clientinfo = value;
                //console.log($scope.clientinfo);

                if($scope.clientinfo.VLM_NAME != undefined)  {
                    $scope.clientinfo.CLT_VILLAGE = {
                        name: $scope.clientinfo.VLM_NAME,
                        value: $scope.clientinfo.CLT_VILLAGE
                    };
                } else {
                    if(!isNaN($scope.clientinfo.CLT_VILLAGE)){
                        $scope.clientinfo.CLT_VILLAGE = {
                            name: "",
                            value:value.CLT_VILLAGE
                        };
                        myDB.execute("SELECT VLM_NAME FROM T_VILLAGE_MASTER WHERE VLM_PK="+$scope.clientinfo.CLT_VILLAGE.value,function(res){
                            //console.log(res);
                            $scope.$apply(function(){
                                $scope.clientinfo.CLT_VILLAGE.name = res[0].VLM_NAME;
                            });
                        })
                    }
                }


                $scope.clientinfo.centerid = $scope.clientinfo.CLT_CENTER_ID;

                if($scope.clientinfo.CLT_HB_LIVE_IN_HOUSE=='Y'){
                    $scope.clientinfo.CLT_HB_LIVE_IN_HOUSE='YES';
                    $('#ncadLivesInHouse').prop('checked', true).checkboxradio('refresh');
                } else {
                    $scope.clientinfo.CLT_HB_LIVE_IN_HOUSE='NO';
                    $('#ncadLivesInHouse').checkboxradio('refresh'); //.prop('checked', true)
                }
                $scope.clientinfo.CLT_HB_ID = parseInt($scope.clientinfo.CLT_HB_ID);
                //select box : Education
                for(var i=0;i<$scope.selectCodes[3].length;i++){
                    var obj = $scope.selectCodes[3][i];
                    if(obj['value']==$scope.clientinfo.CLT_HIGH_EDU){
                      //  $("#ncadHighestEducation").parent().find('span').html(obj['name']);
					    $("#ncadHighestEducation").parent().find('span').html($filter('translate')(obj['name']));
                    }
                }
                //select box : Marital Status
                for(var i=0;i<$scope.selectCodes[1].length;i++){
                    var obj = $scope.selectCodes[1][i];
                    if(obj['value']==$scope.clientinfo.CLT_MARITAL_STATUS){
                       // $("#ncadMaritalStatus").parent().find('span').html(obj['name']);
					    $("#ncadMaritalStatus").parent().find('span').html($filter('translate')(obj['name']));
                    }
                }
                //select box : Marital Status
                for(var i=0;i<$scope.selectCodes[6].length;i++){
                    var obj = $scope.selectCodes[6][i];
                    if(obj['value']==$scope.clientinfo.CLT_HB_COME_HOUSE){
                       // $("#ncadHowOftenHusband").parent().find('span').html(obj['name']);
					    $("#ncadHowOftenHusband").parent().find('span').html($filter('translate')(obj['name']));
                    }
                }
                //select box : village
                // for(var i=0;i<$scope.selectCodes['VILL'].length;i++){
                //     var obj = $scope.selectCodes['VILL'][i];
                //     if(obj['value']==$scope.clientinfo.CLT_VILLAGE.value){
                //         $("#advillage").parent().find('span').html(obj['name']);
                //     }
                // }
                //select box : Center
                for(var i=0;i<$scope.selectCodes['CTR'].length;i++){
                    var obj = $scope.selectCodes['CTR'][i];
                    //console.log(obj['value'] +" : "+ $scope.clientinfo.centerid);
                    if(obj['value']==$scope.clientinfo.centerid){
                        $("#adcenter").parent().find('span').html(obj['name']);
                    }
                }


                $scope.$watchGroup(['clientinfo.CLT_SUB_DISTRICT','clientinfo.CLT_VILLAGE','clientinfo.CLT_STREET_AREA_NM','clientinfo.CLT_PROVINCE'], function(newValue, oldValue,scope) {

                    if(oldValue[0] != newValue[0]||
                        oldValue[1] != newValue[1]||
                        oldValue[2] != newValue[2]||
                        oldValue[3] != newValue[3]){
                        //console.log("change address");
                        $scope.clientinfo.didChangeAddress = true;

                        //console.log($scope.clientinfo);
                    }

                });
            });
        };


        $scope.updateAddress = function(){
            ////console.log($scope.address.centerid);
            myDB.execute("SELECT * FROM T_VILLAGE_MASTER, T_DISTRICT_MASTER, T_SUB_DISTRICT_MASTER, T_CENTER_MASTER WHERE DSM_PK = SDSM_DSM_PK AND SDSM_PK = VLM_SDSM_PK AND VLM_PK = CTR_VLM_PK AND CTR_PK = "+$scope.clientinfo.centerid+"  ", function(results){
                //console.log(results[0]);
                $scope.updateSecond(results);

            });
        }

        $scope.updateSecond = function(results){

            ////console.log($scope.address);
            $scope.$apply(function(){

                $scope.clientinfo.CLT_VILLAGE = {
                    value: results[0].VLM_PK,
                    name: results[0].VLM_NAME,
                };
                //console.log($scope.clientinfo.CLT_VILLAGE);
                $scope.clientinfo.CLT_DISTRICT = results[0].DSM_NAME;
                $scope.clientinfo.CLT_SUB_DISTRICT = results[0].SDSM_NAME;
                $scope.clientinfo.CLT_PROVINCE = results[0].DSM_PROVINCE_CODE;
            });
        }

    });
})();

/******************************************
UI Functions
******************************************/
function init(){
    initTemplate.load(2);
    $(".ncadPhoto").each(function(){
        $(this).width(250).height($(this).width()*1.25);
    });
    $("[data-role=main]").each(function(){
        $(this).prepend('<div data-role="controlgroup" data-type="horizontal" style="text-align:left;">'+
                        '<a href="#pageAppData" class="ui-btn ui-btn-h ui-corner-all ui-shadow ui-icon-user ui-btn-icon-left mini-header selected" data-i18n="buttons.Applicant">Applicant<div class="btm-bar"></div></a>'+
                        '<a href="#pageAppData2" class="ui-btn ui-btn-h ui-corner-all ui-shadow ui-icon-user ui-btn-icon-left mini-header" data-i18n="buttons.Husband">Husband</a>'+
                        '<a href="#pageAppData3" class="ui-btn ui-btn-h ui-corner-all ui-shadow ui-icon-user ui-btn-icon-left mini-header" data-i18n="buttons.HouseholdMother">Household/Mother</a>'+
                        '<a href="#pageAppData4" class="ui-btn ui-btn-h ui-corner-all ui-shadow ui-icon-plus ui-btn-icon-left mini-header" data-i18n="buttons.Business">Business</a>'+
                        '<a href="#pageAddress" class="ui-btn ui-btn-h ui-corner-all ui-shadow ui-icon-phone ui-btn-icon-left mini-header" data-i18n="buttons.Address">Address/Tel</a>'+
                        '</div>'
                       );
        $(this).trigger("create");
    });
    $(".footer").each(function(){
                   $(this).prepend('<div data-role="controlgroup" data-type="horizontal" style="margin:0.5em 0 0 1em;float:left;">'+
                                   '<button type="submit" class="ui-btn ui-btn-g ui-corner-all ui-shadow ui-icon-check ui-btn-icon-left" value="Submit" data-i18n="buttons.Submit">SUBMIT</button>'+
                                   '<a href="#pageCancel" class="ui-btn ui-btn-r ui-corner-all ui-shadow ui-icon-delete ui-btn-icon-left" data-i18n="buttons.Cancel">Cancel</a></div>');
        $(this).trigger("create");
    });
    $("select").each(function(){ //change color for selectors
        $(this).closest('.ui-btn').css('background-color','#80C6C7');
        $(this).closest('.ui-btn').css('color','#fff');
        $(this).closest('.ui-btn').css('text-shadow','0 0 0 #fff');
    });
    $('body').on('click','.mini-header', function(){
        $('.mini-header').removeClass('selected');
        $('.mini-header .btm-bar').remove();
        var hh = $(this).attr('href');
        $('.mini-header[href$='+hh+']').addClass('selected');
        $('.mini-header[href$='+hh+']').append('<div class="btm-bar"></div>');
    });

}

function navBack(){history.back();return false;}

/******************************************
Load Photo
******************************************/
$(document).ready(function(){
    var loadcount = 0;
    var loadPicture = setInterval(function(){
        loadcount++;
        if(!devtest&&window.requestFileSystem){
            clearInterval(loadPicture);
            fileManager = new fm();
            try{
                var promise = fileManager.read("photo"+clientpk+".dataurl");
                promise.done(function(result){
                    $("#ncadPhoto").attr("src",result);
                });
            }catch(e){alert(e.message);}
        }
        if(loadcount>=5){
            clearInterval(loadPicture);
            //console.log("Not able to load window.requestFileSystem.");
        }
    }, 1000);
});

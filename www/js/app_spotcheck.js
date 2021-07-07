/******************************************
GLOBAL
******************************************/
devtest = true;
var SEARCH_LIMIT = 5;
var serverURL = (localStorage.getItem("SYNC_SERVER")||$('#setip').val());
function nullTonullString(val){
    for(var key in val){
        if(val[key] === null || val[key] === undefined ||  (val[key] === '' && val[key] !== 0)  ){
            val[key] = 'null';
        }
    }
    return val;
}
/******************************************
UI Tweaks - makes select box blue.
******************************************/
function updateOnlineStatus()
{
    console.log("online");
    //document.getElementById("connection").innerHTML = "User is online";
}

function updateOfflineStatus()
{
    console.log("offline");
    //document.getElementById("connection").innerHTML = "User is offline";
}

function checkNetworkStatus(){
    if(navigator.onLine){
      updateOnlineStatus();
    } else {
      updateOfflineStatus();
    }
}

window.addEventListener('online',  checkNetworkStatus());
window.addEventListener('offline', checkNetworkStatus());

function init(){
   
    initTemplate.load(1);
  
    $("select").each(function(){
        $(this).closest('.ui-btn').css('background-color','#80C6C7');
        $(this).closest('.ui-btn').css('color','#fff');
        $(this).closest('.ui-btn').css('text-shadow','0 0 0 #fff');
    });
}  

/******************************************
Controller
******************************************/
//myApp = angular.module("myApp",[]);

myApp = angular.module("myApp",['pascalprecht.translate']);  //declare angular-translate as a dependency

myApp.config(function ($translateProvider) {

	 $translateProvider.useStaticFilesLoader({
		prefix: "locales/locale-",
		suffix: ".json"
	});

    $translateProvider.preferredLanguage(ln.language.code);

});

//myApp.controller("ClientCtrl",function($scope){
myApp.controller("CheckCtrl",function($scope,$filter){
    $scope.selectedvillage = null;
    $scope.villages = [];
    $scope.centers = [];
    $scope.clients = [];
    
    $scope.selectcenterTxt = i18n.t("messages.PleaseSelectCenter");
    $scope.viewclientTxt = i18n.t("messages.ProceedToViewClients");
    $scope.centerTxt = i18n.t("messages.Center");
    $scope.testTxt = 'asdad';

    setTimeout(function() {
        $scope.selectcenterTxt = i18n.t("messages.PleaseSelectCenter");
        $scope.viewclientTxt = i18n.t("messages.ProceedToViewClients");
        $scope.centerTxt = i18n.t("messages.Center");
    },100)

    $scope.getVillages = function(){
        var cmd = "SELECT VLM_NAME, VLM_PK FROM T_VILLAGE_MASTER ";
        myDB.execute(cmd,function(res){

            for(var v in res){
                //console.log(res[v]);
                var vil = res[v];
                var key = {
                    VLM_PK: vil.VLM_PK,
                    VLM_NAME: vil.VLM_NAME
                };
                $scope.villages.push(key);
            }
            $scope.$apply(); 
        });
    };

    $scope.getCenters = function(){
        var cmd = "SELECT CTR_CENTER_NAME, CTR_PK, CTR_VLM_PK, CTR_CENTER_ID FROM T_CENTER_MASTER ORDER BY CTR_CENTER_ID ";
        myDB.execute(cmd,function(res){

            for(var c in res){
                $scope.centers.push(res[c]);
            }
            $scope.$apply(); 
        });
    }; 

    

    $scope.download = function() {

        if($scope.selectedcenter === undefined){
            swal(i18n.t("messages.PleaseSelectCenter"));
            return false;
        }

        swal(i18n.t("messages.Downloading"));
        swal.showLoading();
        console.log("downloading...");
        console.log($scope.selectedcenter);
        var obj = {
            CRED: [],
            DATA: [$scope.selectedcenter.CTR_PK]
        };
        var promise = $.Deferred();
        $.ajax({
            url: serverURL,
            cache: false,
            type: "POST",
            data: "strMode=download&data="+$scope.selectedcenter.CTR_PK,
            crossDomain: true,
            processData: false,
            success: function(data){
                var result = JSON.parse(data);
                promise.resolve(result);
                swal(
                    i18n.t("messages.DownloadSuccess"),
                    result.T_CLIENT.length+" " + i18n.t("messages.Client") +" " + i18n.t("messages.Download"),
                    'success'
                );
                swal.hideLoading();
            },
            error: function(jqXHR,textStatus,errorThrown){
                //syncmgr.endsync("Sync clients failed: "+jqXHR.responseText);
                swal(
                    i18n.t("messages.DownloadFail"),
                    result.T_CLIENT.length+" " + i18n.t("messages.Client") +" " + i18n.t("messages.Download"),
                    'danger'
                ); 
                swal.hideLoading();
                promise.resolve(null);
            }
        });
        promise.done(function(result){
            console.log(result);
            var preps = [];
            var commands = [];
            var cmdar = {
                prepared: null,
                values: [],
            };
            if(result == null) return false;

            if(result.T_CLIENT && result.T_CLIENT.length > 0){

                var cmdarr = {
                    prepared: null,
                    values : [],
                };

                cmd = "INSERT INTO T_CLIENT ("+
                        "CLT_PK,"+
                        "CLT_BRC_PK,"+
                        "CLT_FULL_NAME,"+
                        "CLT_NICK_NAME,"+
                        "CLT_GENDER,"+
                        "CLT_HB_NAME,"+
                        "CLT_HB_ID,"+
                        "CLT_HB_LIVE_IN_HOUSE,"+
                        "CLT_FAMILY_CARD_NO,"+
                        "CLT_CLEINT_ID,"+
                        "CLT_OTH_REG_NO,"+ //10
                        "CLT_DOB,"+
                        "CLT_AGE,"+
                        "CLT_HIGH_EDU,"+
                        "CLT_HIGH_EDU_OTHER,"+
                        "CLT_MARITAL_STATUS,"+
                        "CLT_NUM_HOUSE_MEM,"+
                        "CLT_NUM_CHILDREN,"+
                        "CLT_HB_LIVE_PLACE,"+
                        "CLT_HB_COME_HOUSE,"+
                        "CLT_MOTHER_NM,"+ //20
                        "CLT_MOTHER_DOB,"+
                        "CLT_MOTHER_AGE,"+
                        "CLT_BIZ,"+
                        "CLT_BIZ_EQUIPT,"+
                        "CLT_HB_BIZ,"+
                        "CLT_HB_BIZ_EQUIPT,"+
                        "CLT_BOTH_BIZ,"+
                        "CLT_BOTH_BIZ_EQUIPT,"+
                        "CLT_RT,"+
                        "CLT_STREET_AREA_NM,"+ //30
                        "CLT_VILLAGE,"+
                        "CLT_SUB_DISTRICT,"+
                        "CLT_DISTRICT,"+
                        "CLT_PROVINCE,"+
                        "CLT_POSTAL_CD,"+
                        "CLT_LAND_MARK,"+
                        "CLT_MOB_NO_1,"+
                        "CLT_MOB_NO_2,"+
                        "CLT_HUSB_MOB_NO,"+
                        "CLT_BRNET_NO,"+ //40
                        "CLT_CREDITS_NUMBER,"+
                        "CLT_FO_FOR_TRAINING,"+
                        "CLT_TRANING_START_DATE,"+
                        "CLT_TRANING_END_DATE,"+
                        "CLT_TRANING_COMPLETED,"+
                        "CLT_PLACE_OF_BIRTH,"+
                        "CLT_RESIDENCE_OF_PARENTS,"+
                        "CLT_CREATED_BY,"+
                        "CLT_CREATED_DATE,"+
                        "CLT_STATUS,"+  //50
                        "CLT_GROUP_ID,"+
                        "CLT_IS_GROUP_LEADER,"+
                        "CLT_CENTER_ID,"+
                        "CLT_RW, "+
                        "CLT_ATTENDANCE_PERCENTAGE, "+
                        "CLT_INSTALMENT_PERCENTAGE, "+
                        "CLT_TRAINING_ATTENDANCE, "+
                        "CLT_MOB_NEW)"+
                    " VALUES "+
                    " (?,?,?,?,?,?,?,?,?,?,"+
                    "  ?,?,?,?,?,?,?,?,?,?,"+
                    "  ?,?,?,?,?,?,?,?,?,?,"+
                    "  ?,?,?,?,?,?,?,?,?,?,"+
                    "  ?,?,?,?,?,?,?,?,?,?,"+
                    "  ?,?,?,?,?,?,?,?,0)";

                cmdarr.prepared = cmd;

                var date = new Date();
                date = ("0"+date.getDate()).slice(-2)+"/"+("0"+(date.getMonth()+1)).slice(-2)+"/"+date.getFullYear();
                var todate = new Date();

                $.each(result.T_CLIENT, function(ind, val){

                    if($scope.cltPks.indexOf(val[0]) == -1) {
                        var valu = [];
                        valu[0] = val[0]; //CLT_PK
                        valu[1] = val[1]; //CLT_BRC_PK
                        valu[2] = val[2]; //CLT_FULL_NAME
                        valu[3] = val[3]; //CLT_NICK_NAME
                        valu[4] = val[10]; //CLT_GENDER  ----- WITH --- CLT
                        valu[5] = val[4]; //CLT_CLT_HB_NAME
                        valu[6] = val[5]; //CLT_HB_ID
                        valu[7] = val[6]; //CLT_HB_LIVE_IN_HOUSE
                        valu[8] = val[7]; //CLT_FAMILY_CARD_NO
                        valu[9] = val[8]; //CLT_CLEINT_ID
                        valu[10] = val[9]; //CLT_OTH_REG_NO                 //10
                        valu[11] = val[11]; //CLT_DOB
                        valu[12] = val[12]; //CLT_AGE
                        valu[13] = val[13]; //CLT_HIGH_EDU
                        valu[14] = val[14]; //CLT_HIGH_EDU_OTHER
                        valu[15] = val[15]; //CLT_MARITAL_STATUS
                        valu[16] = val[16]; //CLT_NUM_HOUSE_MEM
                        valu[17] = val[17]; //CLT_NUM_CHILDREN
                        valu[18] = val[18]; //CLT_HB_LIVE_PLACE
                        valu[19] = val[19]; //CLT_HB_COME_HOUSE
                        valu[20] = val[20];  //CLT_MOTHER_NM                 //20
                        valu[21] = val[21]; //CLT_MOTHER_DOB
                        valu[22] = val[22]; //CLT_MOTHER_AGE
                        valu[23] = val[23]; //CLT_BIZ
                        valu[24] = val[24];  //CLT_BIZ_EQUIPT
                        valu[25] = val[25]; //CLT_HB_BIZ
                        valu[26] = val[26]; //CLT_HB_BIZ_EQUIPT
                        valu[27] = val[27]; //CLT_BOTH_BIZ_EQUIPT
                        valu[28] = val[28];  //CLT_RT
                        valu[29] = val[29]; //CLT_STREET_AREA_NM                 //30
                        valu[30] = val[30];  //CLT_STREET_AREA_NM
                        valu[31] = val[31];  //CLT_VILLAGE
                        valu[32] = val[32];  //CLT_SUB_DISTRICT
                        valu[33] = val[33];  //CLT_DISTRICT
                        valu[34] = val[34];  //CLT_PROVINCE
                        valu[35] = val[35];  //CLT_POSTAL_CD
                        valu[36] = val[36];  //CLT_LAND_MARK
                        valu[37] = val[37];  //CLT_MOB_NO_1
                        valu[38] = val[38];  //CLT_MOB_NO_2
                        valu[39] = val[39];  //CLT_HUSB_MOB_NO
                        valu[40] = val[40];  //CLT_BRNET_NO                  //40
                        valu[41] = val[41];  //CLT_CREDITS_NUMBER
                        valu[42] = val[42];  //CLT_FO_FOR_TRAINING
                        valu[43] = val[43];  //CLT_TRANING_START_DATE
                        valu[44] = val[44];  //CLT_TRANING_END_DATE
                        valu[45] = val[45];  //CLT_TRANING_COMPLETED
                        valu[46] = val[46];  //CLT_PLACE_OF_BIRTH
                        valu[47] = val[47];  //CLT_RESIDENCE_OF_PARENTS
                        valu[48] = val[48];  //CLT_CREATED_BY
                        valu[49] = val[49];  //CLT_CREATED_DATE
                        valu[50] = val[51];  //CLT_STATUS                 //50
                        valu[51] = val[52];  //CLT_GROUP_ID
                        valu[52] = val[53];  //CLT_IS_GROUP_LEADER
                        valu[53] = val[54];  //CLT_CENTER_ID
                        valu[54] = val[55];  //CLT_RW
                        valu[55] = val[56];  //CLT_ATTENDANCE_PERCENTAGE
                        valu[56] = val[57];  //CLT_INSTALMENT_PERCENTAGE
                        valu[57] = val[58]; //CLL_TRAINING_ATTENDANCE

                        var valu2 = nullTonullString(valu);
                        cmdarr.values.push(valu2);

                        var clientObj = {
                            CLT_FULL_NAME: val[2],
                            CLT_CLEINT_ID: val[8],
                            CLT_CENTER_ID: val[54],
                            CLT_GROUP_ID:   val[52]
                        }

                        $scope.clients.push(clientObj);

                        //#######################################
                        //  CLIENT TRAINING
                        //#######################################
                        var startdate   = new Date(val[43]);
                        var enddate     = new Date(val[44]);
                        //startdate = ("0"+startdate.getDate()).slice(-2)+"/"+("0"+(startdate.getMonth()+1)).slice(-2)+"/"+startdate.getFullYear();

                        //enddate = ("0"+enddate.getDate()).slice(-2)+"/"+("0"+(enddate.getMonth()+1)).slice(-2)+"/"+enddate.getFullYear();

                        if(startdate.getTime() < todate.getTime() && enddate.getTime() > todate.getTime()){

                            var timeDiff = Math.abs(todate.getTime() - startdate.getTime());
                            var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

                            myDB.execute("INSERT INTO T_CLIENT_TRAINING_TMP VALUES(null,"+val[0]+","+diffDays+",0)",function(res){

                            });
                        }

                        //always save val[NEXT LAST INTEGER] into photos
                        if(!devtest) if(fileManager)fileManager.write("photo"+val[0]+".dataurl",  "data:image/jpg;base64,"+val[val.length-1]);
                    }
                });
                console.log($scope.clients);
                $scope.$apply();
                preps.push(cmdarr);
            }

            if(result.T_CLIENT_LOAN && result.T_CLIENT_LOAN.length > 0){

                var cmdarr = {
                    prepared: null,
                    values : [],
                };

                cmd = "INSERT INTO T_CLIENT_LOAN ("+
                        "CLL_PK,"+
                        "CLL_BRC_PK,"+
                        "CLL_CLT_PK,"+
                        "CLL_FO_ASSIGNED,"+
                        "CLL_WELFARE_STATUS,"+
                        "CLL_WORKING_CAPITAL,"+
                        "CLL_HB_WORKING_CAPITAL,"+
                        "CLL_HOUSE_TYP,"+
                        "CLL_HOUSE_SIZE,"+
                        "CLL_HOUSE_CONDITION,"+
                        "CLL_ROOF_TYPE,"+ //Index 10
                        "CLL_WALL_TYPE,"+
                        "CLL_FLOOR_TYP,"+
                        "CLL_ELETRICITY,"+
                        "CLL_WATER_SRC,"+
                        "CLL_HSE_INX,"+
                        "CLL_TOTAL_LOAN_WEEKS,"+
                        "CLL_ORIGINAL_LOAN,"+
                        "CLL_ACTUAL_LOAN,"+
                        "CLL_LOAN_INTEREST,"+
                        "CLL_CRF_PERCENTAGE,"+ //Index 20
                        "CLL_CRF_AMOUNT,"+
                        "CLL_FORM_DISTRIBUTION_DATE,"+
                        "CLL_DISBURSEMENT_DATE,"+
                        "CLL_CAPITAL_REPAY_PER_WEEK,"+
                        "CLL_PROFIT_REPAY_PER_WEEK,"+
                        "CLL_SCHEDULD_LAST_PAY_DATE,"+
                        "CLL_ACTUAL_LAST_PAY_DATE,"+
                        "CLL_EXTRACTED_DATE,"+
                        "CLL_CRF_DISBURSEMENT_DATE,"+
                        "CLL_CRF_DISBURSEMENT_AMT,"+ //Index 30
                        "CLL_IS_NEW_LOAN_APPLIED,"+
                        "CLL_PARENT_CLL_PK,"+
                        "CLL_CREATED_BY,"+
                        "CLL_CREATED_DATE,"+
                        "CLL_STATUS,"+
                        "CLL_LTY_PK,"+
                        "CLL_ACCOUNT_NUMBER,"+
                        "CLL_LPU_PK, "+
                        "CLL_TERMINATION_DATE, "+
                        "CLL_FIRST_COLLECTION_DATE, "+ //Index 40
                        "CLL_TOTAL_PRINCIPAL_PAID, "+
                        "CLL_TOTAL_INTEREST_PAID, "+
                        "CLL_OUTSTANDING, "+
                        "CLL_REPAY_PER_WEEK, "+
                        "CLL_LOAN_NUMBER, "+
                        "CLL_INDEX_OF_INCOME,"+
                        "CLL_INDEX_OF_ASSET,"+
                        "CLL_TSUNAMI_AFFECT,"+
                        "CLL_QUAKE_AFFECT,"+
                        "CLL_LOAN_COOPERATE_EXISTS,"+ //Index 50
                        "CLL_LOAN_BANK_EXISTS,"+
                        "CLL_FINANCE_INSTITUTE_ACCESS,"+
                        "CLL_SAVING_ACCOUNT_EXISTS,"+
                        "CLL_INSURANCE_EXISTS,"+
                        "CLL_PAST_MEMBERSHIP_EXISTS,"+
                        "CLL_IS_FORM_PRINTED,"+
                        "CLL_MANAGER_PK,"+
                        "CLL_PDF_PATH,"+
                        "CLL_WITNESS1_PK,"+
                        "CLL_WITNESS2_PK,"+ //Index 60
                        "CLL_WITNESS3_PK,"+
                        "CLL_WITNESS4_PK,"+
                        "CLL_TEST_RESULT_DATETIME,"+
                        "CLL_TEST_PLACE,"+
                        "CLL_TOTAL_INTEREST_AMT,"+
                        "CLL_HOMELESS,"+
                        "CLL_LOAN_WEEKS,"+
                        "CLL_ROUNDING_OF_REPAYMENT, "+
                        "CLL_GRACE_PERIOD_WEEKS, "+
                        "CLL_GRACE_PERIOD_INTEREST, "+ //Index 70
                        "CLL_CASH_OUT_BY, " +
                        "CLL_LOAN_CYCLE, " +
                        "CLL_CASHIER_BY, " +   // Index 73
                        "CLL_CENTER_LEAD_PK, " +
                        "CLL_GROUP_LEAD_PK, "+
                        "CLL_THIRDPARTY_NAME, "+
                        "CLL_CHILD_GENDER, "+
                        "CLL_CHILD_AGE, "+
                        "CLL_CHILD_NAME, "+ 
                        "CLL_MEMBER_STUDENT_PROFILE, "+ //80 
                        "CLL_THIRDPARTY_DISBURSEMENT_DATE, "+
                        "CLL_THIRDPARTY_DISBURSED, "+ 
                        "CLL_THIRDPARTY_ACC_NUMBER, "+
                        "CLL_THIRDPARTY_ACCHOLDER_NAME, "+
                        "CLL_THIRDPARTY_SIGNATURE, "+
                        "CLL_TRANSFER_MODE, "+
                        "CLL_ARTA_PRODUCTS, "+
                        "CLL_THIRDPARTY_ADDRESS, "+  
                        "CLL_MAIN_PLANT, "+
                        "CLL_LAND_BLOCK_LOCATION, "+ // 90
                        "CLL_TYPES_VARIETIES, "+
                        "CLL_LAND_AREA, "+  
                        "CLL_ORIGIN_OF_SEED, "+
                        "CLL_LAND_TENURE, "+
                        "CLL_OTHER_PLANTS, "+
                        "CLL_LAND_QUALITY, "+
                        "CLL_NOTE, "+
                        "CLL_BUSINESS_RISK, "+ 
                        "CLL_MOB_NEW)"+
                        " VALUES "+
                        " (?,?,?,?,?,?,?,?,?,?,"+
						"  ?,?,?,?,?,?,?,?,?,?,"+
						"  ?,?,?,?,?,?,?,?,?,?,"+
						"  ?,?,?,?,?,?,?,?,?,?,"+
						"  ?,?,?,?,?,?,?,?,?,?,"+
						"  ?,?,?,?,?,?,?,?,?,?,"+
						"  ?,?,?,?,?,?,?,?,?,?,"+
						"  ?,?,?,?,?,?,?,?,?,?,"+
						"  ?,?,?,?,?,?,'',?,?,?,"+
						"  ?,?,?,?,?,?,?,?,?,0) ";

                cmdarr.prepared = cmd;
                console.log("rescount");
                console.log(result.length);
                $.each(result.T_CLIENT_LOAN, function(ind, val){
                    if($scope.cllPks.indexOf(val[0]) == -1 ) {
                        var valu = nullTonullString(val);
                        cmdarr.values.push(valu);
                    }
                });
                preps.push(cmdarr);
            }

            if(result.T_CLIENT_PRODUCT_MAPPING && result.T_CLIENT_PRODUCT_MAPPING.length > 0){

				var cmdarr = {
					prepared: null,
					values : [],
				};

				cmd = "INSERT INTO T_CLIENT_PRODUCT_MAPPING ("+
						"CPM_PK,"+
						"CPM_CLT_PK,"+
						"CPM_CLL_PK,"+
						"CPM_PRM_PK,"+
						"CPM_PRM_MATURITY,"+
						"CPM_PRM_BALANCE,"+
						"CPM_PRM_ACC_NUMBER,"+
						"CPM_PRM_JOIN_DATE,"+
						"CPM_PRM_CLOSE_DATE,"+
						"CPM_STATUS_PK,"+
						"CPM_REPAY_PER_WEEK,"+
						"CPM_START_MATURITY_DATE,"+
						"CPM_END_MATURITY_DATE, "+
						"CPM_CHKNEW)"+
						" VALUES "+
						" (?,?,?,?,?,?,?,?,?,?,?,"+
						"  ?,?,0)";

				 cmdarr.prepared = cmd;

				$.each(result.T_CLIENT_PRODUCT_MAPPING, function(ind, val){
					var valu = nullTonullString(val);
					cmdarr.values.push(valu);
				});

				preps.push(cmdarr);

			}

            if(result.T_CLIENT_REPAY_SCHEDULE && result.T_CLIENT_REPAY_SCHEDULE.length > 0){

				var cmdarr = {
					prepared: null,
					values : [],
				};

				var listlen = parseInt(result.T_CLIENT_REPAY_SCHEDULE.length - 1 );
 
				cmd = "INSERT INTO T_CLIENT_REPAY_SCHEDULE ("+
						"CRS_PK,"+
						"CRS_CLT_PK,"+
						"CRS_CLL_PK,"+
						"CRS_PRM_LTY_PK,"+
						"CRS_LOAN_SAVING_FLAG,"+
						"CRS_ACTUAL_WEEK_NO,"+
						"CRS_COLLECTION_WEEK_NO,"+
						"CRS_DATE,"+
						"CRS_FO,"+
						"CRS_FLAG,"+
						"CRS_ATTENDED,"+
						"CRS_EXP_CAPITAL_AMT,"+
						"CRS_EXP_PROFIT_AMT,"+
						"CRS_BALANCE_CAPITAL,"+
						"CRS_BALANCE_PROFIT,"+
						"CRS_PENALTY,"+
						"CRS_SMS_STATUS,"+
						"CRS_SMS_GROUP_STATUS,"+
						"CRS_RECP_STATUS,"+
						"CRS_RECP_GROUP_STATUS,"+
						"CRS_REASON,"+
						"CRS_ASSISTED,"+
						"CRS_ACT_CAPITAL_AMT,"+
						"CRS_ACT_PROFIT_AMT,"+
						"CRS_IS_VARY_FORECAST,"+
						"CRS_REF_NO,"+
						"CRS_EXT_STATUS,"+
						"CRS_FUP_PK,"+
						"CRS_RECON_FUP_PK,"+
						"CRS_CREATED_BY,"+
						"CRS_CREATED_DATE,"+
						"CRS_PAIDBY_PK) VALUES ("+
						" ?,?,?,?,?,?,?,?,?,?"+
						",?,?,?,?,?,?,?,?,?,?"+
						",?,?,?,?,?,?,?,?,?,?"+
						",?,?)";

				cmdarr.prepared = cmd;
				$.each(result.T_CLIENT_REPAY_SCHEDULE, function(ind, val){

					for(var i=0; i < 32; i++){
						if(val[i] === null || val[i] === undefined)
							val[i] = "";
					}

					//var valu = nullTonullString(val);
					if(val[4] == 'L'){ //Temp remove all S records
						cmdarr.values.push(val);
					}


				});

				preps.push(cmdarr);

			}

            if(result.T_VILLAGE_MASTER && result.T_VILLAGE_MASTER.length > 0){

				var cmdarr = {
					prepared: null,
					values : [],
				};

				cmd = "INSERT INTO T_VILLAGE_MASTER ("+
						"VLM_PK,"+
						"VLM_BRC_PK,"+
						"VLM_DSM_PK," +
						"VLM_SDSM_PK," +
						"VLM_NAME,"+
						"VLM_CODE,"+
						"VLM_CREATED_BY,"+
						"VLM_CREATED_DATE,"+
						"VLM_UPDATED_BY,"+
						"VLM_UPDATED_DATE)"+
						" VALUES "+
						" (?,?,?,?,?,?,?,?,?,?)";
				cmdarr.prepared = cmd;
				$.each(result.T_VILLAGE_MASTER, function(ind, val){
                    if($scope.vlmPks.indexOf(val[0]) == -1){
                        var valu = nullTonullString(val);
					    cmdarr.values.push(valu);
                    }
				});
				preps.push(cmdarr);
			}

            var dt = new Date();
            var time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();
            ////console.log("data prepared - "+time);
            ////console.log(preps);
            myDB.dbShell.transaction(function(tx){
                for(var c in commands){

                    tx.executeSql(commands[c]);

                }
                for(var e in preps){
                    for(var v in preps[e].values){
                        // console.log(preps[e].prepared);
                        // console.log(preps[e].values[v].length);
                        tx.executeSql(
                            preps[e].prepared,preps[e].values[v],  function(tx,data){/*console.log(data)*/},function(tx, err){
                            console.log('error '+err.message);
                        });
                    }
                } 
            }, function(err){
                ////console.log("Error : " + err.message  );
                return false;
            }, function(suc){
                //syncmgr.endsync("Successfully synced.");
                var dt = new Date();
                var time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds(); 
                console.log("Successfully synced.");
            });
        });
    };

    $scope.cltPks = [];
    $scope.cllPks = [];
    $scope.vlmPks = [];

    $scope.getAllVillagePks = function() {
        myDB.execute("SELECT VLM_PK FROM T_VILLAGE_MASTER", function(res) {
            res.forEach(vlm_pk => {
                $scope.vlmPks.push(vlm_pk);
            });
        })
    }

    $scope.getAllClientPks = function() {
        myDB.execute("SELECT CLT_PK FROM T_CLIENT", function(res) {
            res.forEach(clt_pk => {
                $scope.cltPks.push(clt_pk);
            });
        })
    }

    $scope.getAllLoanPks = function() {
        myDB.execute("SELECT CLL_PK FROM T_CLIENT_LOAN", function(res) { 
            res.forEach(cll_pk => {
                $scope.cllPks.push(cll_pk);
            });
        });
    }
 
    $scope.getAllClientPks();
    $scope.getAllLoanPks();
    $scope.getVillages();
    $scope.getCenters();
    setTimeout(function(){
        $('.aniview').AniView();
    },300);

});
//end of controller

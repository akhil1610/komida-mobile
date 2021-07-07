//const serverURL = 'http://192.168.88.88:5245/Prodigy/CommonBuildJSON';
const serverURL = 'http://192.168.88.201:8080/MBK/CommonBuildJSON'
function init(){
 
    initTemplate.load();
    const sync = new Sync();
    sync.beginSync(2);
}
$(document).ready(function(){  
    
    
    $('#syncbutton').on('click', function(){ 
        mgrlogin()
    });

    function mgrlogin(){ 
        var userid = $('#userid').val();
        var password = $('#password').val();

        // if(userid == '' || password == ''){
        //     swal({
        //         type: 'error',
        //         title: 'Oops...',
        //         text: i18n.t("messages.MissingCreds"), 
        //     })
        //     return false;
        // }
        
        var obj = [ userid, password ];
        
        let timerInterval;
        swal({
            title: i18n.t("messages.LogginIn"),  
            allowOutsideClick: () => !swal.isLoading(),
            onOpen: () => {
                swal.showLoading();
            },
            onClose: () => {
                clearInterval(timerInterval)
            }
        }).then((result) => {
            if (
                // Read more about handling dismissals
                result.dismiss === swal.DismissReason.timer
            ) {
                console.log('I was closed by the timer')
            }
        }) 
 
        $.ajax({
			url: serverURL,
			cache: false,
			type: "POST",
			data: "strMode=MgrLogin&cred="+JSON.stringify(obj),
			crossDomain: true,
			processData: false,
			success: function(result){ 
                swal.close();
				if(result=="Success"){ 
                    localStorage.setItem("LOGIN_MANAGER",userid);
                    swal({
                        title: i18n.t("messages.loginsuccess"),
                        text: i18n.t("messages.DoYouWantPullData"),
                        type: 'success',
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: i18n.t("messages.Yes")
                      }).then((result) => {
                        if (result.value) {
                           pullData();
                        }
                      }) 
				} else { 
                    // swal({
                    //     type: 'error',
                    //     title: 'Oops...',
                    //     text: i18n.t("messages.CredsMismatch"), 
                    // })
                }
			},
			error: function(jqXHR,textStatus,errorThrown){ 
                swal.close();
                // swal({
                //     type: 'error',
                //     title: 'Oops...',
                //     text: i18n.t("messages.loginfail"), 
                // })
			}
		});
    }

    function pullData() {
        sync.beginSync(2);
    }

    
});
function Sync(){
    /******************************************
    // Settings
    ******************************************/

    var date = new Date();

    var dayOfWeek = date.getDay() + 1;

    date = ("0"+date.getDate()).slice(-2)+"/"+("0"+(date.getMonth()+1)).slice(-2)+"/"+date.getFullYear();

    var anotherdate = new Date();
    anotherdate = anotherdate.getFullYear()+"-"+("0"+(anotherdate.getMonth()+1)).slice(-2)+"-"+("0"+anotherdate.getDate()).slice(-2);

    var syncmgr = this; //the sync manager singleton
    var synccounter = 0; //counts if any items are synced, if not -> "Nothing is synced"

    //var serverURL = $('#setip').val();
    //var serverURL="http://192.168.88.235:8080/MBK/CommonBuildJSON";

    //username and password saving, to be remembered for next login
    $('#setip').val(serverURL); 

    /******************************************
    // Sync Manager
    ******************************************/
    this.syncError = function(){
        //syncmgr.endsync("Sync has encountered an error.");
        syncmgr.endsync(i18n.t("messages.SyncError"));
    }; //declare sync error function

    this.orderSync = {}; //start orderSync "scheduler", runs different syncs in a sequence

    var PSYNC = {
        checkUnassignedClients:false,
        checkRequirements:false,
        pushWithdrawalReq:false,
        syncLoans:false,
        syncNewLoans:false,
        syncUpdateClient:false,
        pushClientPrd:false,
        updateDisburse:false,
        updateDisbursementInfo:false,
        updateCollection:false,
        udpateLoanStatus: false,
        updateTest:false,
        updateTraining:false,
        synccprdclose:false,
        sendEval:false,
        updateSignatures:false,
        sendChange:false,
        meetingChange:false,
        sendGroup:false
    };

    //to change the sequence sync is performed, just change the items on the list
    syncmgr.beginSync = function(syncmode){

        swal({
            title: 'Please Wait..',
            html: '<strong></strong>',
            timer: 20000,
            onOpen: () => {
              swal.showLoading()
              timerInterval = setInterval(() => {
                // swal.getContent().querySelector('strong')
                //   .textContent = swal.getTimerLeft()
              }, 100)
            },
            onClose: () => {
              clearInterval(timerInterval)
            }
        }).then((result) => {
            if (
              // Read more about handling dismissals
              result.dismiss === swal.DismissReason.timer
            ) {
              console.log('I was closed by the timer')
            }
        })

        if(syncmode==1) //is a push request
        syncmgr.orderSync.syncfn_arr = [ //functions declared below
            syncmgr.checkVersion,
            syncmgr.checkUnassignedClients,
            syncmgr.checkRequirements,
            syncmgr.checkRepayments,
            syncmgr.pushWithdrawalReq,
            syncmgr.syncLoans,
            syncmgr.syncNewLoans,
            syncmgr.syncUpdateClient,
            syncmgr.pushClientPrd,
            syncmgr.updateDisburse,
            syncmgr.updateDisbursementInfo,
            syncmgr.updateCollection,
            syncmgr.udpateLoanStatus,
            syncmgr.updateTest,
            syncmgr.updateTraining,
            syncmgr.synccprdclose,
            syncmgr.sendEval, 
            syncmgr.updateSignatures, 
            syncmgr.sendChange,
            syncmgr.meetingChange,
            syncmgr.sendGroup 
        ];
        else //pull request
            syncmgr.orderSync.syncfn_arr = [
                syncmgr.checkVersion,
                syncmgr.resetDB
            ]; //pull sync only needs to checkVersion

        syncmgr.orderSync.sync_fn(syncmgr.orderSync.syncfn_arr.shift(),syncmode); //start syncing
    };

    syncmgr.orderSync.sync_fn = function(fn,syncmode){ //this is looped
        var promise = fn(); //run the function that is passed as argument, get promise
        promise.done(function(){ //sync is done, do next
            if(syncmgr.orderSync.syncfn_arr.length>0) //if there are more functions, continue
                syncmgr.orderSync.sync_fn(syncmgr.orderSync.syncfn_arr.shift(),syncmode);
            else{ //sync is done
                if(syncmode==1) {
                    syncmgr.endPushSync();
                } else {
                    syncmgr.pullRequest();
                }             //else, call pull request
            }
        });
    };

    /******************************************
    //check version module
    ******************************************/
    this.resetDB = function(){

        var promise = new $.Deferred(); //create promise

        if(!devtest){ if(fileManager)fileManager.delete();}
        $.when(myDB.reset()).done(function(){
            promise.resolve();
        });

        return promise;
    };

    this.checkVersion = function(){

        //save username and password, //!Note: put this elsewhere  
        var promise = new $.Deferred(); //create promise
        //serverURL= $('#setip').val();

        //handle ui
        //$.mobile.loading( "show", { html: "<div id='syncer'><span class='ui-icon ui-icon-loading'></span><div id='synclog' class='synclog center'>Syncing...<button class=' ui-btn ui-shadow ui-corner-all' onclick='closeSyncLog()'>Close</button></div></div>", text:"loading",textVisible :true });
        $( "#myPopupDialog" ).popup( "close" ); //closes sync login box
        //syncmgr.synclog("Checking server version...");
        syncmgr.synclog(i18n.t("messages.CheckServerVersion"));
         
        $.ajax({ //!Note: Probably refactor all ajax calls so we don't have multiples of the same declaration
            url: serverURL,
            type: "POST",
            async: true,
            cache: false,
            data: "strMode=checkversion",
            crossDomain: true,
            success: function(result){
                console.log(result);
                var currVersion = localStorage.getItem("DATABASE_VERSION"); //this value is set in initdb
                if(currVersion==result){ //check version here
                    // syncmgr.synclog("Version check successful.");
                    syncmgr.synclog(i18n.t("messages.VersionCheckSuccess")); 
                    promise.resolve();
                }else{
                    //syncmgr.endsync("Your application version is "+currVersion+"\nServer version is "+result);
                    syncmgr.endsync(i18n.t("messages.ApplicationVersion") + currVersion + "\n" + i18n.t("messages.ServerVersion")+result); 
                }
            },
            error: function(jqXHR,textStatus,errorThrown){
                //syncmgr.endsync("Check version failed: "+jqXHR.responseText);
                var err = eval("(" + jqXHR.responseText + ")");
                if(err !== undefined){
                    syncmgr.endsync(i18n.t("messages.VersionCheckFail") + err.Message);
                }

            }
        });
        return promise;
    };

    /******************************************
    // Check pending evaluation reviews, signed statuspullData
    ******************************************/
    this.checkRequirements = function(){
        var promise = new $.Deferred();
        var date = new Date();
        date = ("0"+date.getDate()).slice(-2)+"/"+("0"+(date.getMonth()+1)).slice(-2)+"/"+date.getFullYear();

        //myDB.execute("SELECT CLL_STATUS FROM T_CLIENT_LOAN,T_LOAN_TYPE,T_CLIENT_REPAY_SCHEDULE WHERE ( CLL_LTY_PK = LTY_PK AND CRS_CLT_PK = CLL_CLT_PK AND CRS_DATE = '"+date+"' AND ( (CRS_COLLECTION_WEEK_NO >= LTY_FIRST_REVIEW_WEEK AND CLL_STATUS = 17) ) OR  (CRS_COLLECTION_WEEK_NO >= LTY_SECOND_REVIEW_WEEK AND CLL_STATUS = 19) ) OR ( CLL_STATUS = 10 and CLL_FORM_DISTRIBUTION_DATE = '"+date+"') LIMIT 1", function(loanrec){
        myDB.execute("SELECT CLL_STATUS FROM T_CLIENT,T_CLIENT_LOAN,T_LOAN_TYPE WHERE CLT_PK = CLL_CLT_PK AND CLT_SIGNATURE = '' AND ( CLL_STATUS = 12 OR CLL_FORM_DISTRIBUTION_DATE = '"+date+"' ) GROUP BY CLT_PK LIMIT 1", function(loanrec){
            if(loanrec.length>0){
                syncmgr.endsync(i18n.t("messages.SignByApplicantStatusNotSetForUser"));
                return false;
            }
            promise.resolve();
        });
        return promise;
    };

    /******************************************
    // Check Outstanding Repayments
    ******************************************/
    this.checkRepayments = function(){
        var promise = new $.Deferred();
        var date = new Date();
        date = ("0"+date.getDate()).slice(-2)+"/"+("0"+(date.getMonth()+1)).slice(-2)+"/"+date.getFullYear();

        //myDB.execute("SELECT CLL_STATUS FROM T_CLIENT_LOAN,T_LOAN_TYPE,T_CLIENT_REPAY_SCHEDULE WHERE ( CLL_LTY_PK = LTY_PK AND CRS_CLT_PK = CLL_CLT_PK AND CRS_DATE = '"+date+"' AND ( (CRS_COLLECTION_WEEK_NO >= LTY_FIRST_REVIEW_WEEK AND CLL_STATUS = 17) ) OR  (CRS_COLLECTION_WEEK_NO >= LTY_SECOND_REVIEW_WEEK AND CLL_STATUS = 19) ) OR ( CLL_STATUS = 10 and CLL_FORM_DISTRIBUTION_DATE = '"+date+"') LIMIT 1", function(loanrec){
        var cmd = "SELECT CRS_CLT_PK FROM T_CLIENT_REPAY_SCHEDULE WHERE (CRS_LOAN_SAVING_FLAG='S' OR CRS_FLAG='D' ) AND CRS_DATE='"+date+"' AND (CRS_RECP_GROUP_STATUS NOT IN  ('Y','N') AND CRS_SMS_GROUP_STATUS NOT IN  ('Y','N') AND CRS_RECP_STATUS NOT IN  ('Y','N') AND CRS_SMS_STATUS NOT IN  ('Y','N') )";
        console.log(cmd);
        myDB.execute(cmd, function(loanrec){
            if(loanrec.length>0){
                syncmgr.endsync(i18n.t("messages.PendingCollections"));
                return false;
            }
            promise.resolve();
        });
        return promise;
    };
    /******************************************
    // Check for unassigned users (with no groups assigned)
    ******************************************/
    this.checkUnassignedClients = function(){

        var promise = new $.Deferred();
        myDB.execute("SELECT CLT_PK FROM T_CLIENT WHERE CLT_MOB_NEW=1 and CLT_GROUP_ID='' LIMIT 1", function(results){

            if(results.length==1){ //at least 1 user with no group
                //syncmgr.endsync("Some clients are unassigned to a group.");
                syncmgr.endsync(i18n.t("messages.ClientUnassignedToGroup"));
                return false;
            }
            PSYNC.checkUnassignedClients = true;
            promise.resolve();
        });
        return promise;
    };

    /******************************************
    // Sync clients and loans
    ******************************************/
    this.syncLoans = function(){ //begin syncing

        var promise = new $.Deferred();
        var total = 0, failed = 0, success = 0;



        myDB.T_CLIENT.get("CLT_MOB_NEW=1", function(results){//get all new records
            total = results.length;
            if(total === 0){
                promise.resolve(); //perform next in sequence
                PSYNC.syncLoans = true;
                return false;
            }
            synccounter++; //sync counter + 1

            //syncmgr.synclog("Syncing new loans and clients");
            syncmgr.synclog(i18n.t("messages.SyncNewLoanAndClient"));


            var flags = {};

            var client_for_push = [];


            results.forEach(function(val, ind){ //for every new loan

                client_for_push.push(val.CLT_PK);

                var reqObj = {};

                var cnt = parseInt(ind) + 1;
                var CLTNO = val.CLT_PK;

                var CLT_ARR = [];
                flags = {};
                flags.T_CLIENT = false;
                flags.T_CLIENT_LOAN = false;
                flags.T_CLIENT_BORROWED_FUNDS = false;
                flags.T_CLIENT_INCOME = false;
                flags.PHT = false;
                flags.T_CLIENT_PRODUCT_MAPPING = false;
                flags.T_CLIENT_ASSET_LIST = false;
                flags.T_CLIENT_GROUP = false;

                var undate = val.CLT_CREATED_DATE.split(" ")[0];
                undate = undate.replace(new RegExp('/', 'g'),"-");

                var undate_arr = undate.split("-");
                var un_day = undate_arr[0];
                var un_month = parseInt(undate_arr[1])-1;
                var un_year = undate_arr[2];

                var todayDate = new Date();
                todayDate.setFullYear(un_year,un_month,un_day);

                var format ="AM";
                var hour=todayDate.getHours();
                var min=todayDate.getMinutes();
                var sec=todayDate.getSeconds();
                var month=todayDate.getMonth()+1;
                if(hour>11){format="PM";}
                if (hour   > 12) { hour = hour - 12; }
                if (hour === 0) { hour = 12; }
                if (min < 10){min = "0" + min;}
                var newtime = todayDate.getDate() + "/" + month + "/" +  todayDate.getFullYear()+" "+hour+":"+min+":"+sec;

                var NEW_CLT_CREATED_DATE = newtime;

                var CLT = [
                    val.CLT_PK,
                    val.CLT_BRC_PK,
                    sanitize(val.CLT_FULL_NAME),
                    sanitize(val.CLT_NICK_NAME),
                    val.CLT_PLACE_OF_BIRTH,
                    val.CLT_RESIDENCE_OF_PARENTS,
                    val.CLT_GENDER,
                    sanitize(val.CLT_HB_NAME),
                    val.CLT_HB_ID,
                    val.CLT_HB_LIVE_IN_HOUSE,
                    sanitize(val.CLT_FAMILY_CARD_NO), //10
                    val.CLT_CLEINT_ID,
                    val.CLT_OTH_REG_NO,
                    val.CLT_DOB,
                    val.CLT_AGE,
                    val.CLT_HIGH_EDU,
                    sanitize(val.CLT_HIGH_EDU_OTHER),
                    val.CLT_MARITAL_STATUS,
                    val.CLT_NUM_HOUSE_MEM,
                    val.CLT_NUM_CHILDREN,
                    sanitize(val.CLT_HB_LIVE_PLACE), //20
                    val.CLT_HB_COME_HOUSE,
                    sanitize(val.CLT_MOTHER_NM),
                    val.CLT_MOTHER_DOB,
                    val.CLT_MOTHER_AGE,
                    sanitize(val.CLT_BIZ),
                    sanitize(val.CLT_BIZ_EQUIPT),
                    sanitize(val.CLT_HB_BIZ),
                    sanitize(val.CLT_HB_BIZ_EQUIPT),
                    sanitize(val.CLT_BOTH_BIZ),
                    sanitize(val.CLT_BOTH_BIZ_EQUIPT), //30
                    sanitize(val.CLT_RT),
                    sanitize(val.CLT_STREET_AREA_NM),
                    val.CLT_VILLAGE,
                    sanitize(val.CLT_SUB_DISTRICT),
                    sanitize(val.CLT_DISTRICT),
                    sanitize(val.CLT_PROVINCE),
                    val.CLT_POSTAL_CD,
                    sanitize(val.CLT_LAND_MARK),
                    val.CLT_MOB_NO_1,
                    val.CLT_MOB_NO_2, //40
                    val.CLT_HUSB_MOB_NO,
                    val.CLT_CREATED_BY,
                    NEW_CLT_CREATED_DATE,
                    val.CLT_STATUS,
                    parseInt(val.CLT_CENTER_ID),
                    val.CLT_GROUP_ID,
                    val.CLT_IS_GROUP_LEADER,
                    val.CLT_RW,
                    val.CLT_ATTENDANCE_PERCENTAGE,
                    val.CLT_INSTALMENT_PERCENTAGE,
                    val.CLT_TRAINING_ATTENDANCE,
                    val.CLT_RELATIVE,
                    val.CLT_CTR_LEADER_PK,
                    val.CLT_GRP_LEADER_PK,
                    val.CLT_HOME_ONWERSHIP,
                    val.CLT_NEW_MEMBER_TYPE
                    //val.CLT_PLACE_OF_BIRTH
                ];


                $.each(CLT,function(id,newcltfix){
                    if(newcltfix=='undefined'){
                        CLT[id]='';
                    }
                }); //data cleaning

                CLT = nullToEmpty(CLT); //data cleaning
                reqObj.CLT = CLT;

                checkFamily(CLTNO,reqObj);

            }); //!end of retrieving and sending new client data

            function checkFamily(CLTNO,request){ //FAMILY

                myDB.T_CLIENT_FAMILY_LIST.get("CFL_CLT_PK="+CLTNO,function(cltres){
                    console.log(cltres);
                    if(cltres.length<=0){
                        flags.T_CLIENT_FAMILY_LIST = true;
                        request.CFL = [];
                        checkLoan(CLTNO,request);
                        return false;
                    }

                    CFL_ARR = [];

                    cltres.forEach(function(val, ind){ //for every new family member
 
                        var todayDate = new Date(val.CFL_DOB);
                        var format ="AM";
                        var hour=todayDate.getHours();
                        var min=todayDate.getMinutes();
                        var sec=todayDate.getSeconds();
                        var month=todayDate.getMonth()+1;
                        if(hour>11){format="PM";}
                        if (hour   > 12) { hour = hour - 12; }
                        if (hour === 0) { hour = 12; }
                        if (min < 10){min = "0" + min;}
                        var newtime = todayDate.getDate() + "/" + month + "/" +  todayDate.getFullYear();
                        //var newtime = todayDate.getDate() + "/" + month + "/" +  todayDate.getFullYear()+" "+hour+":"+min+":"+sec;

                        var NEW_CFL_DOB = newtime;

                        var FAM_OBJ = [
                            val.CFL_PK,
                            val.CFL_CMP_ID,
                            val.CFL_CLT_PK,
                            val.CFL_NAME,
                            val.CFL_PLACE_OF_BIRTH,
                            NEW_CFL_DOB,
                            val.CFL_WORK,
                            val.CFL_FAMILY_CODE,
                            val.CFL_EDU_CODE,
                            val.CFL_STILL_IN_SCHOOL,
                            val.CFL_STATUS, //CLF_STATUS
                            val.CFL_GENDER,
                            val.CFL_EDU_INFORMATION,
                            val.CFL_MARITAL_STATUS
                        ];
                        console.log(FAM_OBJ);
                        FAM_OBJ = nullToEmpty(FAM_OBJ);
                        CFL_ARR.push(FAM_OBJ);
                    });
                    request.CFL = CFL_ARR;
                    checkLoan(CLTNO,request);
                });
            }

            function checkLoan(CLTNO,request){ // LOAN
                ////console.log("@@@@@@@@@@@@@@@@@@@@@ CHECKING LOAN "+CLTNO);
                myDB.T_CLIENT_LOAN.get("CLL_MOB_NEW=1 AND CLL_CLT_PK="+CLTNO, function(cltres){
                    if(cltres.length<=0){
                        flags.T_CLIENT_LOAN = true; //we are done collecting client data for this loan
                        //checkfinal(CLTNO);
                        return false;
                    }

                    var CLL_ARR = [];
                    var BORR_ARR = [];
                    var INC_ARR = [];
                    var CPM_ARR = [];


                    var loan_pk_arr = "";

                    cltres.forEach(function(val, ind){ //for every new loan

                        var lcnt = parseInt(ind) + 1;
                        var CLLNO = val.CLL_PK;

                        if(loan_pk_arr !== "") loan_pk_arr += ",";
                        loan_pk_arr += CLLNO;

                        var center_leader_pk = 0;
                        var group_leader_pk = 0;
                        if(val.CLL_CENTER_LEAD_PK !== '' && val.CLL_CENTER_LEAD_PK !== null && val.CLL_CENTER_LEAD_PK !== undefined) center_leader_pk = val.CLL_CENTER_LEAD_PK;
                        if(val.CLL_GROUP_LEAD_PK !== '' && val.CLL_GROUP_LEAD_PK !== null && val.CLL_GROUP_LEAD_PK !== undefined) group_leader_pk = val.CLL_GROUP_LEAD_PK;

                        var CLL_OBJ = [
                            val.CLL_PK,
                            val.CLL_BRC_PK,
                            val.CLL_CLT_PK,
                            val.CLL_FO_ASSIGNED,
                            val.CLL_WELFARE_STATUS,
                            val.CLL_WORKING_CAPITAL,
                            val.CLL_HB_WORKING_CAPITAL,
                            val.CLL_HOUSE_TYP,
                            val.CLL_HOUSE_SIZE,
                            val.CLL_HOUSE_CONDITION,
                            val.CLL_ROOF_TYPE,
                            val.CLL_WALL_TYPE,
                            val.CLL_FLOOR_TYP,
                            val.CLL_ELETRICITY,
                            val.CLL_WATER_SRC,
                            val.CLL_HSE_INX,
                            val.CLL_TOTAL_LOAN_WEEKS,
                            val.CLL_ORIGINAL_LOAN,
                            val.CLL_LOAN_INTEREST,
                            val.CLL_CRF_PERCENTAGE,
                            val.CLL_PARENT_CLL_PK,
                            val.CLL_CREATED_DATE,
                            val.CLL_STATUS,
                            val.CLL_LTY_PK,
                            val.CLL_ACCOUNT_NUMBER,
                            val.CLL_LPU_PK,
                            val.CLL_TERMINATION_DATE,
                            val.CLL_FIRST_COLLECTION_DATE,
                            val.CLL_TOTAL_PRINCIPAL_PAID,
                            val.CLL_TOTAL_INTEREST_PAID,
                            val.CLL_OUTSTANDING,
                            val.CLL_REPAY_PER_WEEK,
                            val.CLL_LOAN_NUMBER,
                            val.CLL_INDEX_OF_INCOME,
                            val.CLL_INDEX_OF_ASSET,
                            val.CLL_TSUNAMI_AFFECT,
                            val.CLL_QUAKE_AFFECT,
                            val.CLL_LOAN_COOPERATE_EXISTS,
                            val.CLL_LOAN_BANK_EXISTS,
                            val.CLL_FINANCE_INSTITUTE_ACCESS,
                            val.CLL_SAVING_ACCOUNT_EXISTS,
                            val.CLL_INSURANCE_EXISTS,
                            val.CLL_PAST_MEMBERSHIP_EXISTS,
                            val.CLL_HOMELESS,
                            val.CLL_ROUNDING_OF_REPAYMENT,
                            val.CLL_GRACE_PERIOD_WEEKS,
                            val.CLL_GRACE_PERIOD_INTEREST,
                            val.CLL_CASH_OUT_BY,
                            val.CLL_LOAN_CYCLE,
                            val.CLL_CASHIER_BY,
                            center_leader_pk,
                            group_leader_pk,
                            val.CLL_THIRDPARTY_NAME,
                            val.CLL_CHILD_GENDER,
                            val.CLL_CHILD_AGE,
                            val.CLL_CHILD_NAME, 
                            val.CLL_MEMBER_STUDENT_PROFILE,
                            val.CLL_THIRDPARTY_DISBURSEMENT_DATE,
                            val.CLL_THIRDPARTY_DISBURSED, 
                            val.CLL_THIRDPARTY_ACC_NUMBER, 
                            val.CLL_THIRDPARTY_ACCHOLDER_NAME, 
                            val.CLL_TRANSFER_MODE,
                            val.CLL_ARTA_PRODUCTS,
                            val.CLL_THIRDPARTY_ADDRESS,
                            val.CLL_THIRDPARTY_DISBURSEMENT_DATE,
                            val.CLL_THIRDPARTY_DISBURSED, 
                            val.CLL_THIRDPARTY_ACC_NUMBER,
                            val.CLL_THIRDPARTY_ACCHOLDER_NAME,
                            val.CLL_THIRDPARTY_SIGNATURE,
                            val.CLL_TRANSFER_MODE,
                            val.CLL_ARTA_PRODUCTS,
                            val.CLL_THIRDPARTY_ADDRESS,  
                            val.CLL_MAIN_PLANT,
                            val.CLL_LAND_BLOCK_LOCATION,  
                            val.CLL_TYPES_VARIETIES,
                            val.CLL_LAND_AREA,
                            val.CLL_ORIGIN_OF_SEED,
                            val.CLL_LAND_TENURE,
                            val.CLL_OTHER_PLANTS,
                            val.CLL_LAND_QUALITY,
                            val.CLL_NOTE,
                            val.CLL_BUSINESS_RISK,
                        ];

                         var LOAN = {
                            LOAN    :null,
                            CPM     :[]
                        };

                        CLL_OBJ = nullToEmpty(CLL_OBJ);
                        LOAN.LOAN = CLL_OBJ;

                        CLL_ARR.push(LOAN);

                    }); // END LOOP

                    request.CLL = CLL_ARR;
                    checkProduct(CLTNO,request);
                });

            }

            function checkProduct(CLTNO,request){
                ////console.log("@@@@@@@@@@@@@@@@@@@@@ CHECKING PRODUCT "+CLTNO);
                request.CLL.forEach(function(reqloan,l){
                    var req_CLL_PK = reqloan.LOAN[0];
                    myDB.T_CLIENT_PRODUCT_MAPPING.get("CPM_CLL_PK="+req_CLL_PK+" AND CPM_CHKNEW=1", function(results){

                        var CPM_ARR = [];
                        if(results.length === 0){
                            checkIncome(CLTNO,request);
                            return false;
                        }

                        results.forEach(function(val, ind){

                            var CPM_OBJ = [
                                val.CPM_PK,
                                val.CPM_CLT_PK,
                                val.CPM_CLL_PK,
                                val.CPM_PRM_PK,
                                val.CPM_PRM_MATURITY,
                                val.CPM_PRM_BALANCE,
                                val.CPM_PRM_ACC_NUMBER,
                                val.CPM_PRM_JOIN_DATE,
                                val.CPM_PRM_CLOSE_DATE,
                                val.CPM_STATUS_PK,
                                val.CPM_REPAY_PER_WEEK,
                                val.CPM_START_MATURITY_DATE,
                                val.CPM_END_MATURITY_DATE
                            ];

                            CPM_OBJ = nullToEmpty(CPM_OBJ);
                            //CPM_ARR.push(CPM_OBJ);
                            reqloan.CPM.push(CPM_OBJ);

                            var cpm_cnt = parseInt(ind) + 1;
                            var loan_cnt = parseInt(l) + 1;
                            if(cpm_cnt == results.length && request.CLL.length == loan_cnt){
                                //reqObj["CPM"] = CPM_ARR;
                                checkIncome(CLTNO,request);
                            }
                        });
                    });
                });
            }

            function checkIncome(CLTNO,reqObj){
                ////console.log("@@@@@@@@@@@@@@@@@@@@@ CHECKING INCOME "+CLTNO);
                myDB.T_CLIENT_INCOME.get("CLI_CLT_PK ="+CLTNO, function(results){
                    var INC_ARR = [];
                    if(results.length === 0){
                        checkBorrowed(CLTNO,reqObj);
                        return false;
                    }

                    results.forEach(function(val, ind){

                        var INC_OBJ = [
                            val.CLI_PK,
                            val.CLI_CLT_PK,
                            val.CLI_CLL_PK,
                            val.CLI_SOURCE,
                            val.CLI_SOURCE_DETAIL,
                            val.CLI_FIXED,
                            val.CLI_VARIABLE
                            //val.CLI_MOB_NEW
                        ];

                        INC_OBJ = nullToEmpty(INC_OBJ);
                        INC_ARR.push(INC_OBJ);

                        var inc_cnt = parseInt(ind) + 1;
                        if( results.length == inc_cnt ){
                            reqObj.INC = INC_ARR;
                            checkBorrowed(CLTNO,reqObj);
                        }
                    });
                });
            }

            function checkBorrowed(CLTNO,reqObj){
                ////console.log("@@@@@@@@@@@@@@@@@@@@@ CHECKING BORROWED "+CLTNO);
                myDB.T_CLIENT_BORROWED_FUNDS.get("CEF_CLT_PK="+CLTNO, function(results){
                    var BORR_ARR = [];
                    if(results.length === 0){
                        reqObj.BORR = [];
                        checkAsset(CLTNO,reqObj);
                        return false;
                    }

                    results.forEach(function(val, ind){

                        var BORR_OBJ = [
                            val.CEF_PK,
                            val.CEF_CLT_PK,
                            val.CEF_CLL_PK,
                            val.CEF_LOAN_FROM,
                            sanitize(val.CEF_LOAN_FROM_NAME),
                            val.CEF_BORROWED_BY,
                            val.CEF_ORGINAL_AMT,
                            val.CEF_BALANCE_AMT,
                            val.CEF_REPAY_PER_WEEK,
                            val.CEF_REPAY_PER_MONTH,
                            val.CEF_LOAN_PAID_OFF
                            //val.CEF_MOB_NEW
                        ];

                        BORR_OBJ = nullToEmpty(BORR_OBJ);
                        BORR_ARR.push(BORR_OBJ);

                        var borr_cnt = parseInt(ind) + 1;
                        if(borr_cnt == results.length){
                            reqObj.BORR = BORR_ARR;
                            checkAsset(CLTNO,reqObj);
                        }
                    });
                });
            }

            function checkAsset(CLTNO,reqObj){
                ////console.log("@@@@@@@@@@@@@@@@@@@@@ CHECKING ASSET "+CLTNO);
                myDB.T_CLIENT_ASSET_LIST.get("CAL_MOB_NEW=1 AND CAL_CLT_PK="+CLTNO,function(results){

                    if(results.length === 0){
                        reqObj.CAL = [];
                        checkGroup(CLTNO,reqObj);
                        return false;
                    }

                    var CAL_ARR = [];
                    results.forEach(function(val, ind){

                        var CALL_OBJ = [
                            val.CAL_PK,
                            val.CAL_CLT_PK,
                            val.CAL_CLL_PK,
                            val.CAL_ASSET_NAME,
                            val.CAL_ASSET_VALUE
                        ];
                        CALL_OBJ = nullToEmpty(CALL_OBJ);
                        CAL_ARR.push(CALL_OBJ);
                    });
                    reqObj.CAL = CAL_ARR;

                    checkGroup(CLTNO,reqObj);

                });
            }

            function checkGroup(CLTNO,reqObj){

                var groupname = reqObj.CLT[46];
                var center = reqObj.CLT[45];

                ////console.log("@@@@@@@@@@@@@@@@@@@@@ CHECKING GROUP "+CLTNO);
                myDB.T_CLIENT_GROUP.get("CLG_MOB_NEW=1 AND CLG_ID='"+groupname+"' AND CLG_CTR_PK="+center,function(results){

                    if(results.length === 0){
                        reqObj.CLG = [];
                        checkPHT(CLTNO,reqObj);
                        return false;
                    }

                    var CLG_ARR = [];
                    results.forEach(function(val, ind){

                        var CLG_OBJ = [
                            val.CLG_PK,
                            val.CLG_BRC_PK,
                            val.CLG_CTR_PK,
                            val.CLG_ID,
                            val.CLG_NAME
                        ];
                        CLG_OBJ = nullToEmpty(CLG_OBJ);
                        CLG_ARR.push(CLG_OBJ);
                    });
                    reqObj.CLG = CLG_ARR;
                    checkPHT(CLTNO,reqObj);
                });
            }

            function checkPHT(CLTNO,reqObj){
                if(!devtest){ //if not development
                    var promise = fileManager.read("photo"+CLTNO+".dataurl");
                    promise.done(function(data){
                        reqObj.PHT = btoa(data);
                        checkfinal(CLTNO,reqObj);
                    });
                }else{
                    reqObj.PHT = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
                    checkfinal(CLTNO,reqObj);
                }
            }


            //Proceed when all data related to client is retrieved
            function checkfinal(CLTNO,reqObj){
                ////console.log("@@@@@@@@@@@@@@@@@@@@@ CHECKING FINAL "+CLTNO);
               // if(flags["T_CLIENT"]&&flags["T_CLIENT_BORROWED_FUNDS"]&&flags["T_CLIENT_INCOME"]&&flags["PHT"]){ //all flags == true
                ////console.log(flags);
                //if(flags["T_CLIENT"]&&flags["T_CLIENT_LOAN"]&&flags["T_CLIENT_BORROWED_FUNDS"]&&flags["T_CLIENT_INCOME"]&&flags["PHT"]&&flags["T_CLIENT_PRODUCT_MAPPING"]&&flags['T_CLIENT_ASSET_LIST']&&flags['T_CLIENT_GROUP']){ //all flags == true

                    reqObj.CRED = getPushCRED();
                    ////console.log("\n\nSENT:\n\n" + JSON.stringify(reqObj));

                    $.ajax({
                        url: serverURL,
                        cache: false,
                        type: "POST",
                        data: "strMode=push&data="+JSON.stringify(reqObj),
                        crossDomain: true,
                        processData: false,
                        success: function(result){
                            if(result=="Success"){
                                success++;
                                myDB.dbShell.transaction(function(tx){ //must delete this client, already synced with server
                                    var groupname = reqObj.CLT[46];
                                    tx.executeSql("DELETE FROM T_CLIENT WHERE CLT_PK="+CLTNO);
                                    tx.executeSql("DELETE FROM T_CLIENT_LOAN WHERE CLL_CLT_PK="+CLTNO);
                                    tx.executeSql("DELETE FROM T_CLIENT_ASSET_LIST WHERE CAL_CLT_PK="+CLTNO);
                                    tx.executeSql("DELETE FROM T_CLIENT_GROUP WHERE CLG_MOB_NEW = 1 AND CLG_NAME='"+groupname+"'");
                                    tx.executeSql("DELETE FROM T_CLIENT_BORROWED_FUNDS WHERE CEF_CLT_PK="+CLTNO);
                                    tx.executeSql("DELETE FROM T_CLIENT_INCOME WHERE CLI_CLT_PK="+CLTNO);
                                    tx.executeSql("DELETE FROM T_CLIENT_PRODUCT_MAPPING WHERE CPM_CHKNEW=1 AND CPM_CLT_PK="+CLTNO);
                                }, function(err){

                                }, function(suc){

                                });
                            }else{

                                //syncmgr.endsync("Client sync failed.");
                                syncmgr.endsync(i18n.t("messages.ClientSyncFail"));
                                return true;
                            }
                            report();
                        },
                        error: function(jqXHR,textStatus,errorThrown){
                            //syncmgr.endsync("Sync clients failed: "+jqXHR.responseText);
                            syncmgr.endsync(i18n.t("messages.ClientSyncFail")+jqXHR.responseText);
                        }
                    });
                //}
            }
            function sqlError(){failed++;} //this is not even used, delete?

            function report(){ //all clients and loans synced, tally results
                if((success+failed)==total){ //all requests completed
                    if(success==total){
                        //syncmgr.synclog("Clients synced.");
                        syncmgr.synclog(i18n.t("messages.ClientSyncSuccess"));
                        PSYNC.syncLoans = true;
                        promise.resolve();
                    }else{
                         //syncmgr.endsync("Some requests failed. Please sync again.");
                        syncmgr.endsync(i18n.t("messages.SomeSyncRequestFail"));
                        return false;
                    }
                }
            }

        });
        return promise;
    };
    /******************************************
    // Sync NEW LOANS
    ******************************************/
    this.syncNewLoans = function(){ //begin syncing

        var promise = new $.Deferred();
        var total = 0, failed = 0, success = 0;
 
        myDB.execute("SELECT T_CLIENT.* FROM T_CLIENT,T_CLIENT_LOAN WHERE CLL_CLT_PK = CLT_PK AND CLL_MOB_NEW=1 ",function(results){
            total = results.length;
            if(total===0){
                promise.resolve(); //perform next in sequence
                PSYNC.syncNewLoans = true;
                return false;
            }
            synccounter++; //sync counter + 1

            //syncmgr.synclog("Syncing new loans and clients");
            syncmgr.synclog(i18n.t("messages.SyncNewLoanAndClient"));

            console.log("syncing new loan");

            var flags = {};

            var client_for_push = [];


            results.forEach(function(val, ind){ //for every new loan

                client_for_push.push(val.CLT_PK);

                var reqObj = {};

                var cnt = parseInt(ind) + 1;
                var CLTNO = val.CLT_PK;

                var CLT_ARR = [];
                flags = {};
                flags.T_CLIENT = false;
                flags.T_CLIENT_LOAN = false;
                flags.T_CLIENT_BORROWED_FUNDS = false;
                flags.T_CLIENT_INCOME = false;
                flags.T_CLIENT_FAMILY_LIST = false;
                flags.PHT = false;
                flags.T_CLIENT_PRODUCT_MAPPING = false;
                flags.T_CLIENT_ASSET_LIST = false;
                flags.T_CLIENT_GROUP = false;

                var todayDate = new Date(val.CLT_CREATED_DATE);
                var format ="AM";
                var hour=todayDate.getHours();
                var min=todayDate.getMinutes();
                var sec=todayDate.getSeconds();
                var month=todayDate.getMonth()+1;
                if(hour>11){format="PM";}
                if (hour   > 12) { hour = hour - 12; }
                if (hour === 0) { hour = 12; }
                if (min < 10){min = "0" + min;}
                var newtime = todayDate.getDate() + "/" + month + "/" +  todayDate.getFullYear()+" "+hour+":"+min+":"+sec;

                var NEW_CLT_CREATED_DATE = newtime;

                var CLT = [
                    val.CLT_PK,
                    val.CLT_BRC_PK,
                    sanitize(val.CLT_FULL_NAME),
                    sanitize(val.CLT_NICK_NAME),
                    val.CLT_PLACE_OF_BIRTH,
                    val.CLT_RESIDENCE_OF_PARENTS,
                    val.CLT_GENDER,
                    sanitize(val.CLT_HB_NAME),
                    val.CLT_HB_ID,
                    val.CLT_HB_LIVE_IN_HOUSE,
                    sanitize(val.CLT_FAMILY_CARD_NO),
                    val.CLT_CLEINT_ID,
                    val.CLT_OTH_REG_NO,
                    val.CLT_DOB,
                    val.CLT_AGE,
                    val.CLT_HIGH_EDU,
                    sanitize(val.CLT_HIGH_EDU_OTHER),
                    val.CLT_MARITAL_STATUS,
                    val.CLT_NUM_HOUSE_MEM,
                    val.CLT_NUM_CHILDREN,
                    sanitize(val.CLT_HB_LIVE_PLACE),
                    val.CLT_HB_COME_HOUSE,
                    sanitize(val.CLT_MOTHER_NM),
                    val.CLT_MOTHER_DOB,
                    val.CLT_MOTHER_AGE,
                    sanitize(val.CLT_BIZ),
                    sanitize(val.CLT_BIZ_EQUIPT),
                    sanitize(val.CLT_HB_BIZ),
                    sanitize(val.CLT_HB_BIZ_EQUIPT),
                    sanitize(val.CLT_BOTH_BIZ),
                    sanitize(val.CLT_BOTH_BIZ_EQUIPT),
                    sanitize(val.CLT_RT),
                    sanitize(val.CLT_STREET_AREA_NM),
                    val.CLT_VILLAGE,
                    sanitize(val.CLT_SUB_DISTRICT),
                    sanitize(val.CLT_DISTRICT),
                    sanitize(val.CLT_PROVINCE),
                    val.CLT_POSTAL_CD,
                    sanitize(val.CLT_LAND_MARK),
                    val.CLT_MOB_NO_1,
                    val.CLT_MOB_NO_2,
                    val.CLT_HUSB_MOB_NO,
                    val.CLT_CREATED_BY,
                    NEW_CLT_CREATED_DATE,
                    val.CLT_STATUS,
                    parseInt(val.CLT_CENTER_ID),
                    val.CLT_GROUP_ID,
                    val.CLT_IS_GROUP_LEADER,
                    val.CLT_RW,
                    val.CLT_ATTENDANCE_PERCENTAGE,
                    val.CLT_INSTALMENT_PERCENTAGE,
                    val.CLT_TRAINING_ATTENDANCE,
                    val.CLT_RELATIVE,
                    val.CLT_CTR_LEADER_PK,
                    val.CLT_GRP_LEADER_PK,
                    val.CLT_HOME_ONWERSHIP,
                    val.CLT_NEW_MEMBER_TYPE
                    //val.CLT_PLACE_OF_BIRTH
                ];


                $.each(CLT,function(id,newcltfix){
                    if(newcltfix=='undefined'){
                        CLT[id]='';
                    }
                }); //data cleaning

                CLT = nullToEmpty(CLT); //data cleaning
                reqObj.CLT = CLT;
                reqObj.CLG = [];

                checkFamily(CLTNO,reqObj);

            }); //!end of retrieving and sending new client data

            function checkFamily(CLTNO,request){ //FAMILY

                myDB.T_CLIENT_FAMILY_LIST.get("CFL_CLT_PK="+CLTNO,function(cltres){
                    console.log(cltres);
                    if(cltres.length<=0){
                        flags.T_CLIENT_FAMILY_LIST = true;
                        request.CFL = [];
                        checkLoan(CLTNO,request);
                        return false;
                    }

                    CFL_ARR = [];

                    cltres.forEach(function(val, ind){ //for every new family member
                        var todayDate = new Date(val.CFL_DOB);
                        var format ="AM";
                        var hour=todayDate.getHours();
                        var min=todayDate.getMinutes();
                        var sec=todayDate.getSeconds();
                        var month=todayDate.getMonth()+1;
                        if(hour>11){format="PM";}
                        if (hour   > 12) { hour = hour - 12; }
                        if (hour === 0) { hour = 12; }
                        if (min < 10){min = "0" + min;}
                        var newtime = todayDate.getDate() + "/" + month + "/" +  todayDate.getFullYear()+" "+hour+":"+min+":"+sec;

                        var NEW_CFL_DOB = newtime;

                        var FAM_OBJ = [
                            val.CFL_PK,
                            val.CFL_CMP_ID,
                            val.CFL_CLT_PK,
                            val.CFL_NAME,
                            val.CFL_PLACE_OF_BIRTH,
                            NEW_CFL_DOB,
                            val.CFL_WORK,
                            val.CFL_FAMILY_CODE,
                            val.CFL_EDU_CODE,
                            val.CFL_STILL_IN_SCHOOL,
                            val.CFL_STAUS, //CLF_STATUS
                            val.CFL_GENDER,
                            val.CFL_EDU_INFORMATION,
                            val.CFL_MARITAL_STATUS
                        ];
                        FAM_OBJ = nullToEmpty(FAM_OBJ);
                        CFL_ARR.push(FAM_OBJ);
                    });
                    request.CFL = CFL_ARR;
                    checkLoan(CLTNO,request);
                });
            }

            function checkLoan(CLTNO,request){ // LOAN
                ////console.log("@@@@@@@@@@@@@@@@@@@@@ CHECKING LOAN "+CLTNO);
                myDB.T_CLIENT_LOAN.get("CLL_MOB_NEW=1 AND CLL_CLT_PK="+CLTNO, function(cltres){
                    if(cltres.length<=0){
                        flags.T_CLIENT_LOAN = true; //we are done collecting client data for this loan
                        //checkfinal(CLTNO);
                        return false;
                    }

                    var CLL_ARR = [];
                    var BORR_ARR = [];
                    var INC_ARR = [];
                    var CPM_ARR = [];


                    var loan_pk_arr = "";

                    cltres.forEach(function(val, ind){ //for every new loan

                        var lcnt = parseInt(ind) + 1;
                        var CLLNO = val.CLL_PK;

                        if(loan_pk_arr !== "") loan_pk_arr += ",";
                        loan_pk_arr += CLLNO;

                        var center_leader_pk = 0;
                        var group_leader_pk = 0;
                        if(val.CLL_CENTER_LEAD_PK !== '' && val.CLL_CENTER_LEAD_PK !== null && val.CLL_CENTER_LEAD_PK !== undefined) center_leader_pk = val.CLL_CENTER_LEAD_PK;
                        if(val.CLL_GROUP_LEAD_PK !== '' && val.CLL_GROUP_LEAD_PK !== null && val.CLL_GROUP_LEAD_PK !== undefined) group_leader_pk = val.CLL_GROUP_LEAD_PK;

                        var CLL_OBJ = [
                            val.CLL_PK,
                            val.CLL_BRC_PK,
                            val.CLL_CLT_PK,
                            val.CLL_FO_ASSIGNED,
                            val.CLL_WELFARE_STATUS,
                            val.CLL_WORKING_CAPITAL,
                            val.CLL_HB_WORKING_CAPITAL,
                            val.CLL_HOUSE_TYP,
                            val.CLL_HOUSE_SIZE,
                            val.CLL_HOUSE_CONDITION,
                            val.CLL_ROOF_TYPE,
                            val.CLL_WALL_TYPE,
                            val.CLL_FLOOR_TYP,
                            val.CLL_ELETRICITY,
                            val.CLL_WATER_SRC,
                            val.CLL_HSE_INX,
                            val.CLL_TOTAL_LOAN_WEEKS,
                            val.CLL_ORIGINAL_LOAN,
                            val.CLL_LOAN_INTEREST,
                            val.CLL_CRF_PERCENTAGE,
                            val.CLL_PARENT_CLL_PK,
                            val.CLL_CREATED_DATE,
                            val.CLL_STATUS,
                            val.CLL_LTY_PK,
                            val.CLL_ACCOUNT_NUMBER,
                            val.CLL_LPU_PK,
                            val.CLL_TERMINATION_DATE,
                            val.CLL_FIRST_COLLECTION_DATE,
                            val.CLL_TOTAL_PRINCIPAL_PAID,
                            val.CLL_TOTAL_INTEREST_PAID,
                            val.CLL_OUTSTANDING,
                            val.CLL_REPAY_PER_WEEK,
                            val.CLL_LOAN_NUMBER,
                            val.CLL_INDEX_OF_INCOME,
                            val.CLL_INDEX_OF_ASSET,
                            val.CLL_TSUNAMI_AFFECT,
                            val.CLL_QUAKE_AFFECT,
                            val.CLL_LOAN_COOPERATE_EXISTS,
                            val.CLL_LOAN_BANK_EXISTS,
                            val.CLL_FINANCE_INSTITUTE_ACCESS,
                            val.CLL_SAVING_ACCOUNT_EXISTS,
                            val.CLL_INSURANCE_EXISTS,
                            val.CLL_PAST_MEMBERSHIP_EXISTS,
                            val.CLL_HOMELESS,
                            val.CLL_ROUNDING_OF_REPAYMENT,
                            val.CLL_GRACE_PERIOD_WEEKS,
                            val.CLL_GRACE_PERIOD_INTEREST,
                            val.CLL_CASH_OUT_BY,
                            val.CLL_LOAN_CYCLE,
                            val.CLL_CASHIER_BY,
                            center_leader_pk,
                            group_leader_pk,
                            val.CLL_THIRDPARTY_NAME,
                            val.CLL_CHILD_GENDER,
                            val.CLL_CHILD_AGE,
                            val.CLL_CHILD_NAME, 
                            val.CLL_MEMBER_STUDENT_PROFILE,
                            val.CLL_THIRDPARTY_DISBURSEMENT_DATE,
                            val.CLL_THIRDPARTY_DISBURSED, 
                            val.CLL_THIRDPARTY_ACC_NUMBER, 
                            val.CLL_THIRDPARTY_ACCHOLDER_NAME, 
                            val.CLL_TRANSFER_MODE,
                            val.CLL_ARTA_PRODUCTS,
                            val.CLL_THIRDPARTY_ADDRESS,
                            val.CLL_THIRDPARTY_DISBURSEMENT_DATE,
                            val.CLL_THIRDPARTY_DISBURSED, 
                            val.CLL_THIRDPARTY_ACC_NUMBER,
                            val.CLL_THIRDPARTY_ACCHOLDER_NAME,
                            val.CLL_THIRDPARTY_SIGNATURE,
                            val.CLL_TRANSFER_MODE,
                            val.CLL_ARTA_PRODUCTS,
                            val.CLL_THIRDPARTY_ADDRESS,  
                            val.CLL_MAIN_PLANT,
                            val.CLL_LAND_BLOCK_LOCATION,  
                            val.CLL_TYPES_VARIETIES,
                            val.CLL_LAND_AREA,
                            val.CLL_ORIGIN_OF_SEED,
                            val.CLL_LAND_TENURE,
                            val.CLL_OTHER_PLANTS,
                            val.CLL_LAND_QUALITY,
                            val.CLL_NOTE,
                            val.CLL_BUSINESS_RISK,
                        ];

                         var LOAN = {
                            LOAN    :null,
                            CPM     :[]
                        };

                        CLL_OBJ = nullToEmpty(CLL_OBJ);
                        LOAN.LOAN = CLL_OBJ;

                        CLL_ARR.push(LOAN);

                    }); // END LOOP

                    request.CLL = CLL_ARR;
                    checkProduct(CLTNO,request);
                });

            }

            function checkProduct(CLTNO,request){
                ////console.log("@@@@@@@@@@@@@@@@@@@@@ CHECKING PRODUCT "+CLTNO);
                request.CLL.forEach(function(reqloan,l){
                    var req_CLL_PK = reqloan.LOAN[0];
                    myDB.T_CLIENT_PRODUCT_MAPPING.get("CPM_CLL_PK="+req_CLL_PK+" AND CPM_CHKNEW=1", function(results){

                        var CPM_ARR = [];
                        if(results.length === 0){
                            checkIncome(CLTNO,request);
                            return false;
                        }

                        results.forEach(function(val, ind){

                            var CPM_OBJ = [
                                val.CPM_PK,
                                val.CPM_CLT_PK,
                                val.CPM_CLL_PK,
                                val.CPM_PRM_PK,
                                val.CPM_PRM_MATURITY,
                                val.CPM_PRM_BALANCE,
                                val.CPM_PRM_ACC_NUMBER,
                                val.CPM_PRM_JOIN_DATE,
                                val.CPM_PRM_CLOSE_DATE,
                                val.CPM_STATUS_PK,
                                val.CPM_REPAY_PER_WEEK,
                                val.CPM_START_MATURITY_DATE,
                                val.CPM_END_MATURITY_DATE
                            ];

                            CPM_OBJ = nullToEmpty(CPM_OBJ);
                            //CPM_ARR.push(CPM_OBJ);
                            reqloan.CPM.push(CPM_OBJ);

                            var cpm_cnt = parseInt(ind) + 1;
                            var loan_cnt = parseInt(l) + 1;
                            if(cpm_cnt == results.length && request.CLL.length == loan_cnt){
                                //reqObj["CPM"] = CPM_ARR;
                                checkIncome(CLTNO,request);
                            }
                        });
                    });
                });
            }

            function checkIncome(CLTNO,reqObj){
                ////console.log("@@@@@@@@@@@@@@@@@@@@@ CHECKING INCOME "+CLTNO);
                myDB.T_CLIENT_INCOME.get("CLI_CLT_PK ="+CLTNO, function(results){
                    var INC_ARR = [];
                    if(results.length === 0){
                        reqObj.INC = [];
                        checkBorrowed(CLTNO,reqObj);
                        return false;
                    }

                    results.forEach(function(val, ind){

                        var INC_OBJ = [
                            val.CLI_PK,
                            val.CLI_CLT_PK,
                            val.CLI_CLL_PK,
                            val.CLI_SOURCE,
                            sanitize(val.CLI_SOURCE_DETAIL),
                            sanitize(val.CLI_FIXED),
                            val.CLI_VARIABLE
                            //val.CLI_MOB_NEW
                        ];

                        INC_OBJ = nullToEmpty(INC_OBJ);
                        INC_ARR.push(INC_OBJ);

                        var inc_cnt = parseInt(ind) + 1;
                        if( results.length == inc_cnt ){
                            reqObj.INC = INC_ARR;
                            checkBorrowed(CLTNO,reqObj);
                        }
                    });
                });
            }

            function checkBorrowed(CLTNO,reqObj){
                ////console.log("@@@@@@@@@@@@@@@@@@@@@ CHECKING BORROWED "+CLTNO);
                myDB.T_CLIENT_BORROWED_FUNDS.get("CEF_CLT_PK="+CLTNO, function(results){
                    var BORR_ARR = [];
                    if(results.length === 0){
                        reqObj.BORR = [];
                        checkAsset(CLTNO,reqObj);
                        return false;
                    }

                    results.forEach(function(val, ind){

                        var BORR_OBJ = [
                            val.CEF_PK,
                            val.CEF_CLT_PK,
                            val.CEF_CLL_PK,
                            val.CEF_LOAN_FROM,
                            sanitize(val.CEF_LOAN_FROM_NAME),
                            val.CEF_BORROWED_BY,
                            val.CEF_ORGINAL_AMT,
                            val.CEF_BALANCE_AMT,
                            val.CEF_REPAY_PER_WEEK,
                            val.CEF_REPAY_PER_MONTH,
                            val.CEF_LOAN_PAID_OFF
                            //val.CEF_MOB_NEW
                        ];

                        BORR_OBJ = nullToEmpty(BORR_OBJ);
                        BORR_ARR.push(BORR_OBJ);

                        var borr_cnt = parseInt(ind) + 1;
                        if(borr_cnt == results.length){
                            reqObj.BORR = BORR_ARR;
                            checkAsset(CLTNO,reqObj);
                        }
                    });
                });
            }

            function checkAsset(CLTNO,reqObj){
                ////console.log("@@@@@@@@@@@@@@@@@@@@@ CHECKING ASSET "+CLTNO);
                myDB.T_CLIENT_ASSET_LIST.get("CAL_MOB_NEW=1 AND CAL_CLT_PK="+CLTNO,function(results){

                    if(results.length === 0){
                        reqObj.CAL = [];
                        checkPHT(CLTNO,reqObj);
                        return false;
                    }

                    var CAL_ARR = [];
                    results.forEach(function(val, ind){

                        var CALL_OBJ = [
                            val.CAL_PK,
                            val.CAL_CLT_PK,
                            val.CAL_CLL_PK,
                            val.CAL_ASSET_NAME,
                            val.CAL_ASSET_VALUE
                        ];
                        CALL_OBJ = nullToEmpty(CALL_OBJ);
                        CAL_ARR.push(CALL_OBJ);
                    });
                    reqObj.CAL = CAL_ARR;

                    checkPHT(CLTNO,reqObj);

                });
            }


            function checkPHT(CLTNO,reqObj){
                if(!devtest){ //if not development
                    var promise = fileManager.read("photo"+CLTNO+".dataurl");
                    promise.done(function(data){
                        reqObj.PHT = encodeURIComponent(data);
                    });
                }else{
                    reqObj.PHT = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
                }
                checkfinal(CLTNO,reqObj);
            }


            //Proceed when all data related to client is retrieved
            function checkfinal(CLTNO,reqObj){
                ////console.log("@@@@@@@@@@@@@@@@@@@@@ CHECKING FINAL "+CLTNO);
               // if(flags["T_CLIENT"]&&flags["T_CLIENT_BORROWED_FUNDS"]&&flags["T_CLIENT_INCOME"]&&flags["PHT"]){ //all flags == true
                ////console.log(flags);
                //if(flags["T_CLIENT"]&&flags["T_CLIENT_LOAN"]&&flags["T_CLIENT_BORROWED_FUNDS"]&&flags["T_CLIENT_INCOME"]&&flags["PHT"]&&flags["T_CLIENT_PRODUCT_MAPPING"]&&flags['T_CLIENT_ASSET_LIST']&&flags['T_CLIENT_GROUP']){ //all flags == true

                reqObj.CRED = getPushCRED();
                ////console.log("\n\nSENT:\n\n" + JSON.stringify(reqObj));

                $.ajax({
                    url: serverURL,
                    cache: false,
                    type: "POST",
                    data: "strMode=push&data="+JSON.stringify(reqObj),
                    crossDomain: true,
                    processData: false,
                    success: function(result){
                        if(result=="Success"){
                            success++;
                            myDB.dbShell.transaction(function(tx){ //must delete this client, already synced with server
                                var groupname = reqObj.CLT[46];
                                //tx.executeSql("DELETE FROM T_CLIENT_NEW WHERE CLT_MOB_NEW = 1 AND CLT_PK="+CLTNO);
                                tx.executeSql("DELETE FROM T_CLIENT_LOAN WHERE CLL_MOB_NEW = 1 AND CLL_CLT_PK="+CLTNO);
                                tx.executeSql("DELETE FROM T_CLIENT_ASSET_LIST WHERE CAL_MOB_NEW = 1 AND CAL_CLT_PK="+CLTNO);
                                tx.executeSql("DELETE FROM T_CLIENT_GROUP WHERE CLG_MOB_NEW = 1 AND CLG_NAME='"+groupname+"'");
                                tx.executeSql("DELETE FROM T_CLIENT_BORROWED_FUNDS WHERE CEF_MOB_NEW = 1 AND CEF_CLT_PK="+CLTNO);
                                tx.executeSql("DELETE FROM T_CLIENT_INCOME WHERE CLI_MOB_NEW =1 AND CLI_CLT_PK="+CLTNO);
                                tx.executeSql("DELETE FROM T_CLIENT_PRODUCT_MAPPING WHERE CPM_CHKNEW=1 AND CPM_CLT_PK="+CLTNO);
                            }, function(err){

                            }, function(suc){

                            });
                        }else{

                            //syncmgr.endsync("Client sync failed.");
                            syncmgr.endsync(i18n.t("messages.ClientSyncFail"));
                            return true;
                        }
                        report();
                    },
                    error: function(jqXHR,textStatus,errorThrown){
                        //syncmgr.endsync("Sync clients failed: "+jqXHR.responseText);
                        syncmgr.endsync(i18n.t("messages.ClientSyncFail")+jqXHR.responseText);
                    }
                });
            }
            function sqlError(){failed++;} //this is not even used, delete?

            function report(){ //all clients and loans synced, tally results
                if((success+failed)==total){ //all requests completed
                    if(success==total){
                        //syncmgr.synclog("Clients synced.");
                        PSYNC.syncNewLoans = true;
                        syncmgr.synclog(i18n.t("messages.ClientSyncSuccess"));
                        promise.resolve();
                    }else{
                         //syncmgr.endsync("Some requests failed. Please sync again.");
                        syncmgr.endsync(i18n.t("messages.SomeSyncRequestFail"));
                        return false;
                    }
                }
            }

        });
        return promise;
    };
    /******************************************
    // Sync NEW SnycUpdate
    ******************************************/
    this.syncUpdateClient = function(){

        var promise = new $.Deferred();
        var total = 0, failed = 0, success = 0;

        myDB.T_CLIENT_NEW.get("CLT_MOB_NEW=2", function(results){//get all new records
            total = results.length;
            if(total === 0){
                promise.resolve(); //perform next in sequence
                PSYNC.syncUpdateClient = true;
                return false;
            }
            synccounter++; //sync counter + 1

            //syncmgr.synclog("Syncing new loans and clients");
            syncmgr.synclog(i18n.t("messages.UpdatingClients"));


            var flags = {};

            var client_for_push = [];

            results.forEach(function(val, ind){ //for every new loan

                client_for_push.push(val.CLT_PK);

                var reqObj = {};

                var cnt = parseInt(ind) + 1;
                var CLTNO = val.CLT_PK;

                var CLT_ARR = [];
                flags = {};
                flags.T_CLIENT = false;
                flags.T_CLIENT_LOAN = false;
                flags.T_CLIENT_BORROWED_FUNDS = false;
                flags.T_CLIENT_INCOME = false;
                flags.PHT = false;
                flags.SIG = false;
                flags.T_CLIENT_PRODUCT_MAPPING = false;
                flags.T_CLIENT_ASSET_LIST = false;
                flags.T_CLIENT_GROUP = false;
                flags.T_CLIENT_FAMILY_LIST = false;

                var todayDate = new Date(val.CLT_CREATED_DATE);
                    var format ="AM";
                    var hour=todayDate.getHours();
                    var min=todayDate.getMinutes();
                    var sec=todayDate.getSeconds();
                    var month=todayDate.getMonth()+1;
                    if(hour>11){format="PM";}
                    if (hour   > 12) { hour = hour - 12; }
                    if (hour === 0) { hour = 12; }
                    if (min < 10){min = "0" + min;}
                    var newtime = todayDate.getDate() + "/" + month + "/" +  todayDate.getFullYear()+" "+hour+":"+min+":"+sec;

                var NEW_CLT_CREATED_DATE = newtime;
 
                var CLT = [
                    val.CLT_PK,
                    val.CLT_BRC_PK,
                    sanitize(val.CLT_FULL_NAME),
                    sanitize(val.CLT_NICK_NAME),
                    val.CLT_PLACE_OF_BIRTH,
                    val.CLT_RESIDENCE_OF_PARENTS,
                    val.CLT_GENDER,
                    sanitize(val.CLT_HB_NAME),
                    val.CLT_HB_ID,
                    val.CLT_HB_LIVE_IN_HOUSE,
                    sanitize(val.CLT_FAMILY_CARD_NO),
                    val.CLT_CLEINT_ID,
                    val.CLT_OTH_REG_NO,
                    val.CLT_DOB,
                    val.CLT_AGE,
                    val.CLT_HIGH_EDU,
                    sanitize(val.CLT_HIGH_EDU_OTHER),
                    val.CLT_MARITAL_STATUS,
                    val.CLT_NUM_HOUSE_MEM,
                    val.CLT_NUM_CHILDREN,
                    sanitize(val.CLT_HB_LIVE_PLACE),
                    val.CLT_HB_COME_HOUSE,
                    sanitize(val.CLT_MOTHER_NM),
                    val.CLT_MOTHER_DOB,
                    val.CLT_MOTHER_AGE,
                    sanitize(val.CLT_BIZ),
                    sanitize(val.CLT_BIZ_EQUIPT),
                    sanitize(val.CLT_HB_BIZ),
                    sanitize(val.CLT_HB_BIZ_EQUIPT),
                    sanitize(val.CLT_BOTH_BIZ),
                    sanitize(val.CLT_BOTH_BIZ_EQUIPT),
                    sanitize(val.CLT_RT),
                    sanitize(val.CLT_STREET_AREA_NM),
                    val.CLT_VILLAGE,
                    sanitize(val.CLT_SUB_DISTRICT),
                    sanitize(val.CLT_DISTRICT),
                    sanitize(val.CLT_PROVINCE),
                    val.CLT_POSTAL_CD,
                    sanitize(val.CLT_LAND_MARK),
                    val.CLT_MOB_NO_1,
                    val.CLT_MOB_NO_2,
                    val.CLT_HUSB_MOB_NO,
                    val.CLT_CREATED_BY,
                    NEW_CLT_CREATED_DATE,
                    val.CLT_STATUS,
                    parseInt(val.CLT_CENTER_ID),
                    val.CLT_GROUP_ID,
                    val.CLT_IS_GROUP_LEADER,
                    val.CLT_RW,
                    val.CLT_ATTENDANCE_PERCENTAGE,
                    val.CLT_INSTALMENT_PERCENTAGE,
                    val.CLT_TRAINING_ATTENDANCE,
                    val.CLT_RELATIVE,
                    val.CLT_CTR_LEADER_PK,
                    val.CLT_GRP_LEADER_PK,
                    val.CLT_HOME_ONWERSHIP,
                    val.CLT_NEW_MEMBER_TYPE
                    //val.CLT_PLACE_OF_BIRTH
                ];


                $.each(CLT,function(id,newcltfix){
                    if(newcltfix=='undefined'){
                        CLT[id]='';
                    }
                }); //data cleaning

                CLT = nullToEmpty(CLT); //data cleaning
                reqObj.CLT = CLT;

                checkLoan(CLTNO,reqObj);

            }); //!end of retrieving and sending new client data

            function checkLoan(CLTNO,request){ // LOAN
                ////console.log("@@@@@@@@@@@@@@@@@@@@@ CHECKING LOAN "+CLTNO); 
                myDB.T_CLIENT_LOAN.get("CLL_MOB_NEW=2 AND CLL_CLT_PK="+CLTNO+" AND CLL_STATUS != 9 LIMIT 1", function(cltres){
                    if(cltres.length<=0){
                        flags.T_CLIENT_LOAN = true; //we are done collecting client data for this loan
                        request.CLL = [];
                        checkIncome(CLTNO,request);
                        return false;
                    }

                    var CLL_ARR = [];
                    var BORR_ARR = [];
                    var INC_ARR = [];
                    var CPM_ARR = [];


                    var loan_pk_arr = "";

                    cltres.forEach(function(val, ind){ //for every new loan

                        var lcnt = parseInt(ind) + 1;
                        var CLLNO = val.CLL_PK;

                        if(loan_pk_arr !== "") loan_pk_arr += ",";
                        loan_pk_arr += CLLNO;

                        var WORKINGCAP = 0;
                        var HBWORKINGCAP = 0;
                        var INCOME_INDEX = 0;
                        var ASSET_INDEX = 0;
                        var TSUNAMI_AFFECT = 0;
                        var QUAKE_AFFECT = 0;
                        var LOAN_COOP_EXISTS = 0;
                        var BANK_LOAN = 0;
                        var FINANCIAL_INST_ACCESS = 0;
                        var PAST_MEMBERSHIP = 0;
                        var SAVINGS_ACT_EXISTS = 0;
                        var INSURANCE_EXISTS = 0;
                        var HOMELESS = 0;

                        if(val.CLL_WORKING_CAPITAL !== null) WORKINGCAP = val.CLL_WORKING_CAPITAL;
                        if(val.CLL_HB_WORKING_CAPITAL !== null) HBWORKINGCAP = val.CLL_HB_WORKING_CAPITAL;
                        if(val.CLL_INDEX_OF_INCOME !== null) INCOME_INDEX = val.CLL_INDEX_OF_INCOME;
                        if(val.CLL_INDEX_OF_ASSET !== null) ASSET_INDEX = val.CLL_INDEX_OF_ASSET;
                        if(val.CLL_TSUNAMI_AFFECT !== null) TSUNAMI_AFFECT = val.CLL_TSUNAMI_AFFECT;
                        if(val.CLL_QUAKE_AFFECT !== null) QUAKE_AFFECT = val.CLL_QUAKE_AFFECT;
                        if(val.CLL_LOAN_COOPERATE_EXISTS !== null) LOAN_COOP_EXISTS = val.CLL_LOAN_COOPERATE_EXISTS;
                        if(val.CLL_LOAN_BANK_EXISTS !== null) BANK_LOAN = val.CLL_LOAN_BANK_EXISTS;
                        if(val.CLL_FINANCE_INSTITUTE_ACCESS !== null) FINANCIAL_INST_ACCESS = val.CLL_FINANCE_INSTITUTE_ACCESS;
                        if(val.CLL_PAST_MEMBERSHIP_EXISTS !== null) PAST_MEMBERSHIP = val.CLL_PAST_MEMBERSHIP_EXISTS;
                        if(val.CLL_SAVING_ACCOUNT_EXISTS !== null) SAVINGS_ACT_EXISTS = val.CLL_SAVING_ACCOUNT_EXISTS;
                        if(val.CLL_INSURANCE_EXISTS !== null) INSURANCE_EXISTS = val.CLL_INSURANCE_EXISTS;
                        if(val.CLL_HOMELESS !== null) HOMELESS = val.CLL_HOMELESS;

                        var CLL_OBJ = [
                            val.CLL_PK,
                            val.CLL_BRC_PK,
                            val.CLL_CLT_PK,
                            val.CLL_FO_ASSIGNED,
                            val.CLL_WELFARE_STATUS,
                            WORKINGCAP,
                            HBWORKINGCAP,
                            val.CLL_HOUSE_TYP,
                            val.CLL_HOUSE_SIZE,
                            val.CLL_HOUSE_CONDITION,
                            val.CLL_ROOF_TYPE, //10
                            val.CLL_WALL_TYPE,
                            val.CLL_FLOOR_TYP,
                            val.CLL_ELETRICITY,
                            val.CLL_WATER_SRC,
                            val.CLL_HSE_INX,
                            // val.CLL_LOAN_WEEKS,
                            // val.CLL_ORIGINAL_LOAN,
                            // val.CLL_LOAN_INTEREST,
                            // val.CLL_CRF_PERCENTAGE,
                            // val.CLL_PARENT_CLL_PK,
                            // val.CLL_CREATED_BY,
                            // val.CLL_CREATED_DATE,
                            // val.CLL_STATUS,
                            // val.CLL_LTY_PK,
                            // val.CLL_ACCOUNT_NUMBER,
                            // val.CLL_LPU_PK,
                            // val.CLL_TERMINATION_DATE,
                            // val.CLL_FIRST_COLLECTION_DATE,
                            // val.CLL_TOTAL_PRINCIPAL_PAID,
                            // val.CLL_TOTAL_INTEREST_PAID,
                            // val.CLL_OUTSTANDING,
                            // val.CLL_REPAY_PER_WEEK,
                            // val.CLL_LOAN_NUMBER,
                            parseFloat(INCOME_INDEX),
                            ASSET_INDEX,
                            parseInt(TSUNAMI_AFFECT),
                            parseInt(QUAKE_AFFECT),
                            parseInt(LOAN_COOP_EXISTS), //20
                            parseInt(BANK_LOAN),
                            parseInt(FINANCIAL_INST_ACCESS),
                            parseInt(SAVINGS_ACT_EXISTS),
                            parseInt(INSURANCE_EXISTS),
                            PAST_MEMBERSHIP,
                            HOMELESS,
                            val.CLL_ROUNDING_OF_REPAYMENT,
                            val.CLL_GRACE_PERIOD_WEEKS,
                            val.CLL_GRACE_PERIOD_INTEREST,
                            val.CLL_CASH_OUT_BY,
                            val.CLL_LOAN_CYCLE,
                            val.CLL_CASHIER_BY
                        ];

                        CLL_OBJ = nullToEmpty(CLL_OBJ);
                        CLL_ARR = CLL_OBJ;


                    }); // END LOOP


                    request.CLL = CLL_ARR;
                    //checkProduct(CLTNO,request);
                    checkIncome(CLTNO,request);
                });

            }

            function checkIncome(CLTNO,reqObj){
                ////console.log("@@@@@@@@@@@@@@@@@@@@@ CHECKING INCOME "+CLTNO);
                myDB.T_CLIENT_INCOME_NEW.get("CLI_CLT_PK ="+CLTNO, function(results){
                    var INC_ARR = [];
                    if(results.length === 0){
                        reqObj.INC = [];
                        checkBorrowed(CLTNO,reqObj);
                        return false;
                    }

                    results.forEach(function(val, ind){

                        var INC_OBJ = [
                            val.CLI_PK,
                            val.CLI_CLT_PK,
                            val.CLI_CLL_PK,
                            val.CLI_SOURCE,
                            val.CLI_SOURCE_DETAIL,
                            val.CLI_FIXED,
                            val.CLI_VARIABLE
                        ];

                        INC_OBJ = nullToEmpty(INC_OBJ);
                        INC_ARR.push(INC_OBJ);

                        var inc_cnt = parseInt(ind) + 1;
                        if( results.length == inc_cnt ){
                            reqObj.INC = INC_ARR;
                            checkBorrowed(CLTNO,reqObj);
                        }
                    });
                });
            }

            function checkBorrowed(CLTNO,reqObj){
                ////console.log("@@@@@@@@@@@@@@@@@@@@@ CHECKING BORROWED "+CLTNO);
                myDB.T_CLIENT_BORROWED_FUNDS_NEW.get("CEF_CLT_PK="+CLTNO, function(results){
                    var BORR_ARR = [];
                    if(results.length === 0){
                        reqObj.BORR = [];
                        checkAsset(CLTNO,reqObj);
                        return false;
                    }

                    results.forEach(function(val, ind){

                        var BORR_OBJ = [
                            val.CEF_PK,
                            val.CEF_CLT_PK,
                            val.CEF_CLL_PK,
                            val.CEF_LOAN_FROM,
                            sanitize(val.CEF_LOAN_FROM_NAME),
                            val.CEF_BORROWED_BY,
                            val.CEF_ORGINAL_AMT,
                            val.CEF_BALANCE_AMT,
                            val.CEF_REPAY_PER_WEEK,
                            val.CEF_REPAY_PER_MONTH,
                            val.CEF_LOAN_PAID_OFF
                            //val.CEF_MOB_NEW
                        ];

                        BORR_OBJ = nullToEmpty(BORR_OBJ);
                        BORR_ARR.push(BORR_OBJ);

                        var borr_cnt = parseInt(ind) + 1;
                        if(borr_cnt == results.length){
                            reqObj.BORR = BORR_ARR;
                            checkAsset(CLTNO,reqObj);
                        }
                    });
                });
            }

            function checkAsset(CLTNO,reqObj){
                ////console.log("@@@@@@@@@@@@@@@@@@@@@ CHECKING ASSET "+CLTNO);
                myDB.T_CLIENT_ASSET_LIST_NEW.get("CAL_MOB_NEW=1 AND CAL_CLT_PK="+CLTNO,function(results){

                    if(results.length === 0){
                        reqObj.CAL = [];
                        checkPHT(CLTNO,reqObj);
                        return false;
                    }

                    var CAL_ARR = [];
                    results.forEach(function(val, ind){

                        var CALL_OBJ = [
                            val.CAL_PK,
                            val.CAL_CLT_PK,
                            val.CAL_CLL_PK,
                            val.CAL_ASSET_NAME,
                            val.CAL_ASSET_VALUE
                        ];
                        CALL_OBJ = nullToEmpty(CALL_OBJ);
                        CAL_ARR.push(CALL_OBJ);
                    });
                    reqObj.CAL = CAL_ARR;

                    checkPHT(CLTNO,reqObj);

                });
            }

            function checkPHT(CLTNO,reqObj){
                if(!devtest){ //if not development
                    var promise = fileManager.read("photo"+CLTNO+".dataurl");
                    promise.done(function(data){
                        reqObj.PHT = encodeURIComponent(data);
                    });
                }else{
                    reqObj.PHT = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
                }
                checkSIG(CLTNO,reqObj);
            }

            function checkSIG(CLTNO,reqObj){
                myDB.execute("SELECT CLT_SIGNATURE, CLT_PK, CLT_FULL_NAME FROM T_CLIENT_NEW WHERE CLT_MOB_NEW=2 AND CLT_SIGNATURE != '' AND CLT_PK="+CLTNO, function(signatures){

                    reqObj.SIG = [];
                    if(signatures.length === 0){
                        checkGroup(CLTNO,reqObj);
                        return false;
                    }

                    $.each(signatures,function(i,sig){

                        var SIG_ARR = [
                                        sig.CLT_SIGNATURE
                                    ];

                        reqObj.SIG = SIG_ARR;

                    });
                    checkGroup(CLTNO,reqObj);
                });
            }

            function checkGroup(CLTNO,reqObj){

                reqObj.CLG = [];
                checkFamily(CLTNO,reqObj);
                return false;

            }

            function checkFamily(CLTNO,reqObj){
                myDB.T_CLIENT_FAMILY_LIST_NEW.get("CFL_CLT_PK="+CLTNO,function(results){

                    if(results.length === 0){
                        reqObj.CFL = [];
                        checkfinal(CLTNO,reqObj);
                        return false;
                    }

                    var CFL_ARR = [];

                    results.forEach(function(val, ind){

                        var todayDate = new Date(val.CFL_DOB);
                        var format ="AM";
                        var hour=todayDate.getHours();
                        var min=todayDate.getMinutes();
                        var sec=todayDate.getSeconds();
                        var month=todayDate.getMonth()+1;
                        if(hour>11){format="PM";}
                        if (hour   > 12) { hour = hour - 12; }
                        if (hour === 0) { hour = 12; }
                        if (min < 10){min = "0" + min;}
                        var newtime = todayDate.getDate() + "/" + month + "/" +  todayDate.getFullYear();
                        //var newtime = todayDate.getDate() + "/" + month + "/" +  todayDate.getFullYear()+" "+hour+":"+min+":"+sec;

                        var NEW_CFL_DOB = newtime;

                        var CALL_OBJ = [
                            val.CFL_PK,
                            val.CFL_CMP_ID,
                            val.CFL_CLT_PK,
                            val.CFL_NAME,
                            val.CFL_PLACE_OF_BIRTH,
                            NEW_CFL_DOB,
                            val.CFL_WORK,
                            val.CFL_FAMILY_CODE,
                            val.CFL_EDU_CODE,
                            val.CFL_STILL_IN_SCHOOL,
                            val.CFL_STATUS, //CLF_STATUS
                            val.CFL_GENDER,
                            val.CFL_EDU_INFORMATION,
                            val.CFL_MARITAL_STATUS
                        ];
                        CFLL_OBJ = nullToEmpty(CALL_OBJ);
                        CFL_ARR.push(CFLL_OBJ);
                    });
                    reqObj.CFL = CFL_ARR;

                    checkfinal(CLTNO,reqObj);

                });
            }

            //Proceed when all data related to client is retrieved
            function checkfinal(CLTNO,reqObj){
             
                reqObj.CRED = getPushCRED();
                ////console.log("\n\nSENT:\n\n" + JSON.stringify(reqObj));

                $.ajax({
                    url: serverURL,
                    cache: false,
                    type: "POST",
                    data: "strMode=cltupdate&data="+JSON.stringify(reqObj),
                    crossDomain: true,
                    processData: false,
                    success: function(result){
                        if(result=="Success"){
                            success++;
                            myDB.dbShell.transaction(function(tx){ //must delete this client, already synced with server
                                var groupname = reqObj.CLT[46];
                                tx.executeSql("DELETE FROM T_CLIENT_NEW WHERE CLT_PK="+CLTNO);
                                tx.executeSql("DELETE FROM T_CLIENT_LOAN_NEW WHERE CLL_CLT_PK="+CLTNO);
                                tx.executeSql("DELETE FROM T_CLIENT_ASSET_LIST_NEW WHERE CAL_PK="+CLTNO);
                                tx.executeSql("DELETE FROM T_CLIENT_BORROWED_FUNDS_NEW WHERE CEF_CLT_PK="+CLTNO);
                                tx.executeSql("DELETE FROM T_CLIENT_INCOME_NEW WHERE CLI_CLT_PK="+CLTNO);
                            }, function(err){

                            }, function(suc){

                            });
                        }else{

                            //syncmgr.endsync("Client sync failed.");
                            syncmgr.endsync(i18n.t("messages.ClientSyncFail"));
                            return true;
                        }
                        report();
                    },
                    error: function(jqXHR,textStatus,errorThrown){
                        //syncmgr.endsync("Sync clients failed: "+jqXHR.responseText);
                        syncmgr.endsync(i18n.t("messages.ClientSyncFail")+jqXHR.responseText);
                    }
                });
            }
            function sqlError(){failed++;} //this is not even used, delete?

            function report(){ //all clients and loans synced, tally results
                if((success+failed)==total){ //all requests completed
                    if(success==total){
                        //syncmgr.synclog("Clients synced.");
                        PSYNC.syncUpdateClient = true;
                        syncmgr.synclog(i18n.t("messages.ClientSyncSuccess"));
                        promise.resolve();
                    }else{
                         //syncmgr.endsync("Some requests failed. Please sync again.");
                        syncmgr.endsync(i18n.t("messages.SomeSyncRequestFail"));
                        return false;
                    }
                }
            }

        });
        return promise;

    }; 
    /******************************************
    // Update request/Repayment schedules
    ******************************************/
    this.udpateLoanStatus = function() {
        var promise = $.Deferred();

        syncmgr.synclog(i18n.t("messages.UpdateRequest"));

        ////console.log("signature");

        var stries = 0;
        var flag = 0;
        var indic = {}; 
        var updateLoan = {};
        updateLoan.CRED = null;
        updateLoan.DATA = [];

        var cmd = "SELECT CLL_PK, CLL_CENTER_LEAD_PK, CLL_GROUP_LEAD_PK, CLL_STATUS, CLT_PK FROM T_CLIENT_LOAN LEFT JOIN T_CLIENT ON(CLT_PK = CLL_CLT_PK) WHERE  ( DATE(CLT_TRANING_END_DATE) ='"+anotherdate+"' OR CLL_MOB_NEW=3 ) ";
      
        myDB.execute(cmd,function(loans){

            if(loans.length == 0){
               PSYNC.udpateLoanStatus = true;
                promise.resolve();
                return; 
            }
            $.each(loans, function(i,reval){ 
 
                var loan = [];

                console.log(reval);

                var center_leader_pk = 0;
                var group_leader_pk = 0;
                if(reval.CLL_CENTER_LEAD_PK !== '' && reval.CLL_CENTER_LEAD_PK !== null && reval.CLL_CENTER_LEAD_PK !== 'null') center_leader_pk = reval.CLL_CENTER_LEAD_PK;
                if(reval.CLL_GROUP_LEAD_PK !== '' && reval.CLL_GROUP_LEAD_PK !== null && reval.CLL_GROUP_LEAD_PK !== 'null') group_leader_pk = reval.CLL_GROUP_LEAD_PK;


                //LOAN
                loan.push(reval.CLL_PK); 
                loan.push(center_leader_pk);
                loan.push(group_leader_pk);
                loan.push(reval.CLL_STATUS);

                loan = nullToEmpty(loan);

                updateLoan.DATA.push(loan);
            });
            sendUpdate();
        });


        function fail(error) {
            alert(error.code);
        }


        function sendUpdate(){
             
            if(updateLoan.DATA.length === 0)
            { //both results are zero skip
                PSYNC.udpateLoanStatus = true;
                promise.resolve();
                return;
            }

            if(stries > 2) {
                syncmgr.endsync(i18n.t("messages.UpdateLoanInfoFail"));
                return false;
            }

            stries = stries + 1;

            synccounter++; //sync counter + 1
            updateLoan.CRED = getPushCRED();
 
            $.ajax({
                url: serverURL,
                type: "POST",
                cache: false,
                data: "strMode=updateLoanStatus&data="+JSON.stringify(updateLoan),
                crossDomain: true,
                processData: false,
                success: function(result){
                     console.log(result);
                    if(result=="Success"){
                        myDB.dbShell.transaction(function(tx){
                           // tx.executeSql("DELETE FROM T_STAT_UPDATE");

                        }, function(err){}, function(suc){});
                        //syncmgr.synclog("Updating success");
                        syncmgr.synclog(i18n.t("messages.UpdateLoanInfoSuccess"));
                        PSYNC.udpateLoanStatus = true;
                        promise.resolve();
                        return true;
                    }else if (result=='Fail'){
                        //syncmgr.endsync("Update/Schedule fail.");
                        syncmgr.endsync(i18n.t("messages.UpdateLoanInfoFail"));
                        return false;
                    } else {
                        sendUpdate();
                    }
                },
                error: function(jqXHR,textStatus,errorThrown){
                    //syncmgr.endsync("Sync repayments failed: "+jqXHR.responseText);
                    syncmgr.endsync(i18n.t("messages.UpdateLoanInfoFail")+jqXHR.responseText);
                }
            }); 
        }
        return promise;
    }
    this.updateSignatures = function(){
        var haveESIG = false;
        var haveCSIG = false;
        var haveUSIG = false; 

        var promise = new $.Deferred();

        syncmgr.synclog(i18n.t("messages.UpdateRequest"));

        ////console.log("signature");

        var stries = 0;
        var flag = 0;
        var indic = {};
        var SIG_ARR = [];

        function getUSIG(){

            var mProm = $.Deferred();

            myDB.execute("SELECT USER_SIGNATURE, USER_PK, USER_NAME FROM T_USER WHERE USER_HAVE_SIGNATURE ='Y' AND USER_SIGNATURE != '' ", function(signatures){
                ////console.log("usig");
                ////console.log(signatures);
                indic.USIG = true;
                flag += parseInt(signatures.length);
                if(signatures.length > 0){
                    sortSigs(signatures,'U');
                    mProm.resolve(signatures);
                }  else {
                    mProm.resolve(false);
                }

            });

            return mProm.promise();
        }

        function getCSIG(){

            var mProm = $.Deferred();

            myDB.execute("SELECT CLT_SIGNATURE, CLT_PK, CLT_FULL_NAME, CLT_STATUS FROM T_CLIENT WHERE CLT_SIGNATURE !='' ", function(signatures){

                indic.CSIG = true;
                flag += parseInt(signatures.length);

                if(signatures.length > 0){
                    sortSigs(signatures,'C');
                    mProm.resolve(signatures);
                }  else {
                    mProm.resolve(false);
                }

            });

            return mProm.promise();
        }

        function getESIG() {

            var mProm = $.Deferred();

            myDB.execute("SELECT CLE_REVIEW_CODE, CLE_CLT_PK, CLE_CLT_SIGN, CLE_CTR_LEAD_PK, CLE_CTR_LEAD_SIGN, CLE_CLL_PK  FROM T_CLIENT_EVALUATION WHERE CLE_REVIEW_CODE=1 AND CLE_MOB_NEW = 1 ", function(signatures){

                indic.CSIG = true;
                flag += parseInt(signatures.length);

                if(signatures.length > 0){
                    sortSigs(signatures,'E');
                    mProm.resolve(signatures);
                }  else {
                    mProm.resolve(false);
                }

            });

            return mProm.promise();

        }

        function sortSigs(signatures,type){
            
            $.each(signatures,function(i,sig){

                var name = "";
                var signature = null;
                var pk = "";
                var ctr_lead_signature = null;
                var ctr_lead_pk = "";
                var rev_code = "";
                var loanno = "";
                var flag = "";
                var signarray = [];

                if(type == 'C'){                                //CLIENT
                    haveCSIG = true;
                    name = sig.CLT_FULL_NAME;
                    signature = sig.CLT_SIGNATURE;
                    pk = sig.CLT_PK;

                    signarray = [
                       signature,
                       pk,
                   ];
                   var key = { 'obj':signarray, 'type': type};
                   SIG_ARR.push(key);
                } else if (type == 'U'){                        //USER
                    haveUSIG = true;
                    name = sig.USER_NAME;
                    signature = sig.USER_SIGNATURE;
                    pk = sig.USER_PK;

                    signarray = [
                       signature,
                       pk
                   ];
                   var key = { 'obj':signarray, 'type': type};
                   SIG_ARR.push(key);
                } else if (type == 'E'){
                    haveESIG = true;
                    loanno = sig.CLE_CLL_PK;
                    rev_code = sig.CLE_REVIEW_CODE;
                    signature = sig.CLE_CLT_SIGN;
                    pk = sig.CLE_CLT_PK;
                    ctr_lead_signature = sig.CLE_CTR_LEAD_SIGN;
                    ctr_lead_pk = sig.CLE_CTR_LEAD_PK;

                    signarray = [ 
                        pk,
                        loanno,
                        rev_code,
                        signature,
                        ctr_lead_pk,
                        ctr_lead_signature
                   ];
                   var key = { 'obj':signarray, 'type': type};
                   SIG_ARR.push(key);
                }
                if(signature === null){
                    syncmgr.endsync(name+" "+i18n.t("messages.HasNotSigned"));
                    return false;
                }

            });
        }

        $.when(getUSIG(),getCSIG(),getESIG()).done(function(udone,cdone,edone){
            ////console.log("sigdone");
            ////console.log(udone);
            ////console.log(cdone);
            ////console.log(SIG_ARR);

            if(SIG_ARR.length > 0){
                $.when(sendAllSig()).done(function(){
                    ////console.log("SIG_ARR DOne "+SIG_ARR.length);
                    promise.resolve();
                });
            } else {
                promise.resolve();
            }

        });

        function sendAllSig(){

            var deferred = $.Deferred();

            sendSignature(SIG_ARR[0].obj,SIG_ARR[0].type);

            function sendSignature(sig, type){

                var updateSig  = {};
                synccounter++; //sync counter + 1
                updateSig.CRED = getPushCRED();
                updateSig.SIG = sig;
                var strMode = "";
                if(type == 'U'){
                    strMode = "USIG";
                } else if (type == 'C') {
                    strMode = "CSIG";
                } else if (type == 'E'){
                    strMode = "ESIG";
                } 
                
                console.log("strMode="+strMode+"&data="+JSON.stringify(updateSig));
                 
                $.ajax({
                    url: serverURL,
                    type: "POST",
                    cache: false,
                    data: "strMode="+strMode+"&data="+JSON.stringify(updateSig),
                    crossDomain: true,
                    processData: false,
                    success: function(result){

                        console.log("result is "+result);

                        if(result=="Success"){

                            SIG_ARR.shift(); 
                            console.log(SIG_ARR.length);
                            if(SIG_ARR.length > 0){
                                sendSignature(SIG_ARR[0].obj,SIG_ARR[0].type);
                            } else {
                                 if(haveESIG){
                                    //Signature is called after evaluation, so we delete eval data here
                                    myDB.dbShell.transaction(function(tx){
                                        tx.executeSql("DELETE FROM T_CLIENT_EVALUATION");
                                        
                                    }, function(err){

                                    }, function(suc){

                                    });
                                }
                                deferred.resolve();
                            }

                        }else if (result=='Fail'){
                            //syncmgr.endsync("Update/Schedule fail.");
                            syncmgr.endsync(i18n.t("messages.UpdateSignatureFail"));
                            deferred.resolve();
                        }
                    },
                    error: function(jqXHR,textStatus,errorThrown){
                        //syncmgr.endsync("Sync repayments failed: "+jqXHR.responseText);
                        syncmgr.endsync(i18n.t("messages.UpdateSignatureFail")+jqXHR.responseText);
                        deferred.resolve();
                    }
                });

            }

            return deferred.promise();

        }

        function checkSig(){
            if(indic.USIG && indic.CSIG && flag === 0){
                promise.resolve();
                PSYNC.updateSignatures = true;
                return false;
            } else if (indic.USIG && indic.CSIG && SIG_ARR.length > 0){
                sendSignature(SIG_ARR[0].obj,SIG_ARR[0].type);
            }
        }

        function fail(error) {
            alert(error.code);
        }

        return promise.promise();

    };

    this.updateTraining = function(){

        var promise = new $.Deferred();

        var flags = {};
        var tries = 0;
        var stries = 0;

        var TRAINING_ARR = [];
        var cmd = "SELECT CLT_PK, CLT_STATUS, CLT_TRAINING_ATTENDANCE FROM T_CLIENT WHERE CLT_STATUS in (4,6,26,64,65,66) AND DATE(CLT_TRANING_END_DATE) > '"+anotherdate+"' AND DATE(CLT_TRANING_START_DATE) <='"+anotherdate+"' ";
        console.log(cmd);
        myDB.execute(cmd, function(clients){
            console.log(clients);
            if(clients.length === 0){
                PSYNC.updateTraining = true;
                promise.resolve();
                return false;
            }
            $.each(clients, function(i,client){

                var client_key =  [
                    client.CLT_PK,
                    client.CLT_STATUS,
                    client.CLT_TRAINING_ATTENDANCE
                ];
                console.log(client_key);
                var nulled_client_key = nullToEmpty(client_key);
                TRAINING_ARR.push(nulled_client_key);
            });
            sendUpdate();
        });

        function sendUpdate(){

            ////console.log('inhere3');

            if(TRAINING_ARR.length===0 )
            { //both results are zero skip
                promise.resolve();
                return;
            }

            var updateTrainingStatus = {};

            updateTrainingStatus.DATA = TRAINING_ARR;

            synccounter++; //sync counter + 1
            updateTrainingStatus.CRED = getPushCRED();

            $.ajax({
                url: serverURL,
                type: "POST",
                cache: false,
                data: "strMode=updateTraining&data="+JSON.stringify(updateTrainingStatus),
                crossDomain: true,
                processData: false,
                success: function(result){

                    if(result=="Success"){
                        TRAINING_ARR.shift();
                        if(TRAINING_ARR.length === 0 ){

                            myDB.dbShell.transaction(function(tx){

                            }, function(err){}, function(suc){});

                            //ALL TEST RESTULTS ARE SENT SO RESOVLE PROMISE
                            PSYNC.updateTraining = true;
                            syncmgr.synclog(i18n.t("messages.UpdateTestSuccess"));
                            promise.resolve();
                            return true;

                        } else {
                            //IF THERES MORE TESTS TO SEND, SEND THEM lol
                            sendUpdate();
                        }
                    }else if (result=='Fail'){
                        //syncmgr.endsync("Update/Schedule fail.");
                        syncmgr.endsync(i18n.t("messages.UpdateTestFail"));
                        return false;
                    } else {
                        if(tries > 2) {
                            syncmgr.endsync(i18n.t("messages.UpdateTestFail"));
                            return false;
                        }

                        tries = tries + 1;

                        sendUpdate();
                    }
                        },
                error: function(jqXHR,textStatus,errorThrown){
                    //syncmgr.endsync("Sync repayments failed: "+jqXHR.responseText);
                    syncmgr.endsync(i18n.t("messages.UpdateTestFail")+jqXHR.responseText);
                }
            });
        }

        return promise;

    };

    this.updateTest = function(){

        var promise = new $.Deferred();

        // var updateStatus = {};
        // updateStatus.CLL = [];
        // updateStatus.CPM = [];

        ////console.log('inhere');
        var flags = {};
        var tries = 0;
        var stries = 0;

        var TEST_ARR = [];
        var LOAN_ARR = [];

        var date = new Date();
        date = ("0"+date.getDate()).slice(-2)+"/"+("0"+(date.getMonth()+1)).slice(-2)+"/"+date.getFullYear();
        var anotherdate = new Date();
        anotherdate = anotherdate.getFullYear()+"-"+("0"+(anotherdate.getMonth()+1)).slice(-2)+"-"+("0"+anotherdate.getDate()).slice(-2);
 
        // myDB.execute("SELECT CLL_PK, CLL_CLT_PK, CLL_STATUS, CLL_MANAGER_PK, CLL_WITNESS1_PK, CLL_WITNESS2_PK, CLL_WITNESS3_PK, CLL_WITNESS4_PK, CLL_TEST_PLACE FROM T_CLIENT_LOAN, T_CLIENT WHERE CLL_CLT_PK = CLT_PK AND ( CLL_STATUS = 64 OR (CLL_STATUS = 13 AND CLL_DISBURSEMENT_DATE ='"+date+"') OR ( DATE(CLT_TRANING_END_DATE) ='"+anotherdate+"' ) ) ", function(loans){
        myDB.execute("SELECT CLL_PK, CLL_CLT_PK, CLL_STATUS, CLL_MANAGER_PK, CLL_WITNESS1_PK, CLL_WITNESS2_PK, CLL_WITNESS3_PK, CLL_WITNESS4_PK, CLL_TEST_PLACE FROM T_CLIENT_LOAN, T_CLIENT WHERE CLL_CLT_PK = CLT_PK AND DATE(CLT_TRANING_END_DATE) ='"+anotherdate+"'  ", function(loans){
            ////console.log(loans);
            if(loans.length === 0){
                PSYNC.updateTest = true;
                promise.resolve();
                return false;
            }
            flags.LOAN = true;
            $.each(loans, function(i,loan){

                // updateStatus.CLL = [];
                // updateStatus.CPM = [];

                var wit1_pk = 0;
                var wit2_pk = 0;
                var wit3_pk = 0;
                var wit4_pk = 0;
                var mgr_pk  = 0;

                if(loan.CLL_MANAGER_PK != '')  mgr_pk  = loan.CLL_MANAGER_PK;
                if(loan.CLL_WITNESS1_PK != '') wit1_pk = loan.CLL_WITNESS1_PK;
                if(loan.CLL_WITNESS2_PK != '') wit2_pk = loan.CLL_WITNESS2_PK;
                if(loan.CLL_WITNESS3_PK != '') wit3_pk = loan.CLL_WITNESS3_PK;
                if(loan.CLL_WITNESS4_PK != '') wit4_pk = loan.CLL_WITNESS4_PK;
 
                var loan_key =  [
                            loan.CLL_PK,
                            loan.CLL_CLT_PK,
                            loan.CLL_STATUS,
                            mgr_pk,
                            wit1_pk,
                            wit2_pk,
                            wit3_pk,
                            wit4_pk,
                            loan.CLL_TEST_PLACE
                        ];

                loan_key = nullToEmpty(loan_key);
                LOAN_ARR.push(loan_key);
            });
            loadProducts(LOAN_ARR);
        });

        function loadProducts(loans){
            ////console.log(loans);

            $.each(loans,function(l,loan){
                var updateStatus = {};
                updateStatus.CLL = [];
                updateStatus.CPM = [];

                updateStatus.CLL.push(loan);
                // if(loan[2] != 26) {
                //     flags.CPM = true;
                //     sendUpdate(updateStatus);
                //     return false;
                // }
                myDB.execute("SELECT * FROM T_CLIENT_PRODUCT_MAPPING,T_PRODUCT_MASTER WHERE CPM_PRM_PK = PRM_PK AND PRM_CODE IN ('002.0001','002.0003','002.0005') AND CPM_CLL_PK="+loan[0],function(cpm){
                    flags.CPM = true;
                    ////console.log(cpm);
                    if(cpm.length === 0){
                        TEST_ARR.push(updateStatus);
                        if( l == parseInt(loans.length) -1){
                            sendUpdate();
                        }
                    }

                    $.each(cpm, function(c,prd){

                        var todayDate = new Date();
                        var format ="AM";
                        var hour=todayDate.getHours();
                        var min=todayDate.getMinutes();
                        var sec=todayDate.getSeconds();
                        var month=todayDate.getMonth()+1;
                        if(hour>11){format="PM";}
                        if (hour   > 12) { hour = hour - 12; }
                        if (hour === 0) { hour = 12; }
                        if (min < 10){min = "0" + min;}
                        var newtime = todayDate.getDate() + "/" + month + "/" +  todayDate.getFullYear()+" "+hour+":"+min+":"+sec;

                        var prm_join_date = newtime;

                        var prd_key = [
                                        prd.CPM_PK,
                                        prd.CPM_CLT_PK,
                                        prd.CPM_CLL_PK,
                                        prd.CPM_PRM_PK,
                                        prd.CPM_PRM_MATURITY,
                                        prd.CPM_PRM_BALANCE,
                                        prd.CPM_PRM_ACC_NUMBER,
                                        prm_join_date,
                                        prd.CPM_PRM_CLOSE_DATE,
                                        prd.CPM_STATUS_PK,
                                        prd.CPM_REPAY_PER_WEEK,
                                        prd.CPM_START_MATURITY_DATE,
                                        prd.CPM_END_MATURITY_DATE
                                    ];

                        prd_key = nullToEmpty(prd_key);
                        updateStatus.CPM.push(prd_key);

                        var ccnt = parseInt(c) + 1;
                        if(ccnt == cpm.length){
                            //sendUpdate(updateStatus);
                            TEST_ARR.push(updateStatus);
                            if(l == parseInt(loans.length) -1){
                                sendUpdate();
                            }
                        }
                    });
                });
            });
        }

        function fail(error) {
            alert(error.code);
        }


        function sendUpdate(){

            ////console.log('inhere3');

            if(TEST_ARR.length === 0 )
            { //both results are zero skip
                promise.resolve();
                return;
            }

            var updateStatus = TEST_ARR[0];

            synccounter++; //sync counter + 1
            updateStatus.CRED = getPushCRED();

            ////console.log(JSON.stringify(updateStatus));

            $.ajax({
                url: serverURL,
                type: "POST",
                cache: false,
                data: "strMode=update&data="+JSON.stringify(updateStatus),
                crossDomain: true,
                processData: false,
                success: function(result){

                    if(result=="Success"){ 
                        if(TEST_ARR.length > 0) TEST_ARR.shift();
                        if(TEST_ARR.length === 0 ){

                            myDB.dbShell.transaction(function(tx){

                                    tx.executeSql("DELETE FROM T_CLIENT_LOAN WHERE CLL_STATUS IN (26,27)");
                                    tx.executeSql("DELETE FROM T_CLIENT WHERE CLT_STATUS IN (26,27)");
                                    var cpmpk = "";
                                    $.each(updateStatus.CLL,function(i,prd){
                                        if(cpmpk !== "") cpmpk += ",";
                                        cpmpk += prd.CPM_PK;
                                    });
                                    tx.executeSql("DELETE FROM T_CLIENT_PRODUCT_MAPPING WHERE CPM_PK IN ("+cpmpk+")");

                            }, function(err){}, function(suc){});

                            //ALL TEST RESTULTS ARE SENT SO RESOVLE PROMISE
                            PSYNC.updateTest = true;
                            syncmgr.synclog(i18n.t("messages.UpdateTestSuccess"));
                            promise.resolve();
                            return true;

                        } else {
                            //IF THERES MORE TESTS TO SEND, SEND THEM lol
                            sendUpdate();
                        }
                    }else if (result=='Fail'){
                        //syncmgr.endsync("Update/Schedule fail.");
                        syncmgr.endsync(i18n.t("messages.UpdateTestFail"));
                        return false;
                    } else {
                        if(tries > 2) {
                            syncmgr.endsync(i18n.t("messages.UpdateTestFail"));
                            return false;
                        }

                        tries = tries + 1;

                        sendUpdate();
                    }
                        },
                error: function(jqXHR,textStatus,errorThrown){
                    //syncmgr.endsync("Sync repayments failed: "+jqXHR.responseText);
                    syncmgr.endsync(i18n.t("messages.UpdateTestFail")+jqXHR.responseText);

                }
            });
        }

        return promise;

    };

    this.updateDisburse = function(){

        var promise = new $.Deferred();
        syncmgr.synclog(i18n.t("messages.UpdateRequest"));

        ////console.log("disburse");

        var updateStatus = {};
        updateStatus.REPAY = [];

        var updateLoan = {};
        updateLoan.LOAN = [];

        var flags = {};
        var tries = 0;

        var date = new Date();
        date = ("0"+date.getDate()).slice(-2)+"/"+("0"+(date.getMonth()+1)).slice(-2)+"/"+date.getFullYear();

        myDB.execute('SELECT * FROM T_CLIENT_REPAY_SCHEDULE LEFT JOIN T_CLIENT_LOAN WHERE CLL_STATUS = 13 AND CRS_CLL_PK = CLL_PK AND CRS_LOAN_SAVING_FLAG = "L" AND CRS_FLAG = "D" AND CRS_CREATED_DATE != "" AND CRS_DATE != "" AND CRS_DATE="'+date+'" ', function(repayres){
            flags.REPAY = true;
            console.log(repayres);
            if(repayres.length === 0) {
                PSYNC.updateDisburse = true;
                promise.resolve();
                return false;
            }
            var nocoldis = 0;
            $.each(repayres, function(id,reval){

                reval = nullToEmpty(reval);//Null fields to Empty

                if(reval.CRS_ATTENDED ===''||reval.CRS_ATTENDED=='null'||reval.CRS_ATTENDED===null||reval.CRS_ATTENDED===''){nocoldis++;}
                var repayment = [];
                var loan = [];

                var paidby = 0;
                if(reval.CRS_PAIDBY_PK !== '' && reval.CRS_PAIDBY_PK !== null) paidby = reval.CRS_PAIDBY_PK;

                //LOAN
                loan.push(reval.CLL_TOTAL_LOAN_WEEKS);
                loan.push(reval.CRS_ACT_CAPITAL_AMT);
                loan.push(reval.CLL_CAPITAL_REPAY_PER_WEEK);
                loan.push(reval.CLL_PROFIT_REPAY_PER_WEEK);
                loan.push(reval.CLL_ROUNDING_OF_REPAYMENT);
                loan.push(reval.CLL_GRACE_PERIOD_WEEKS);

                loan = nullToEmpty(loan);

                updateLoan.LOAN.push(loan);

                //REPAY
                repayment.push(reval.CRS_PK);
                repayment.push(reval.CRS_CLT_PK);
                repayment.push(reval.CRS_CLL_PK);
                repayment.push(reval.CRS_PRM_LTY_PK);
                repayment.push(reval.CRS_LOAN_SAVING_FLAG);
                repayment.push(reval.CRS_ACTUAL_WEEK_NO);
                repayment.push(reval.CRS_COLLECTION_WEEK_NO);
 
                repayment.push(reval.CRS_DATE); // Converted Date

                repayment.push(reval.CRS_FO);
                repayment.push(reval.CRS_FLAG);
                repayment.push(reval.CRS_ATTENDED);
                repayment.push(reval.CRS_EXP_CAPITAL_AMT);
                repayment.push(reval.CRS_EXP_PROFIT_AMT);
                repayment.push(reval.CRS_BALANCE_CAPITAL);
                repayment.push(reval.CRS_BALANCE_PROFIT);
                repayment.push(reval.CRS_PENALTY);
                repayment.push(reval.CRS_SMS_STATUS);
                repayment.push(reval.CRS_SMS_GROUP_STATUS);
                repayment.push(reval.CRS_RECP_STATUS);
                repayment.push(reval.CRS_RECP_GROUP_STATUS);
                repayment.push(sanitize(reval.CRS_REASON));
                repayment.push(reval.CRS_ASSISTED);
                repayment.push(reval.CRS_ACT_CAPITAL_AMT);
                repayment.push(reval.CRS_ACT_PROFIT_AMT);
                repayment.push(reval.CRS_IS_VARY_FORECAST);
                repayment.push(reval.CRS_REF_NO);
                repayment.push(reval.CRS_EXT_STATUS);
                repayment.push(reval.CRS_FUP_PK);
                repayment.push(reval.CRS_RECON_FUP_PK);
                repayment.push(reval.CRS_CREATED_BY);
                repayment.push(reval.CRS_CREATED_DATE);
                repayment.push(paidby);

                repayment = nullToEmpty(repayment);

                updateStatus.REPAY.push(repayment);
            });
            if(nocoldis>0){
                //syncmgr.endsync("There are disbursements / collections pending.");
                syncmgr.endsync(i18n.t("messages.NoRepayment"));
                return false;
            }
            sendUpdate();
        });


        function fail(error) {
            alert(error.code);
        }
 
        function sendUpdate(){
         
            if(updateStatus.REPAY.length === 0)
            { //both results are zero skip
                PSYNC.updateDisburse = true;
                promise.resolve();
                return;
            }

            if(tries > 2) {
                syncmgr.endsync(i18n.t("messages.RepaymentSyncFail"));
                return false;
            }

            tries = tries + 1;

            synccounter++; //sync counter + 1
            updateStatus.CRED = getPushCRED();

            console.log(JSON.stringify(updateStatus));

            $.ajax({
                url: serverURL,
                type: "POST",
                cache: false,
                data: "strMode=updRepay&data="+JSON.stringify(updateStatus),
                crossDomain: true,
                processData: false,
                success: function(result){ 
                    if(result=="Success"){
                        myDB.dbShell.transaction(function(tx){
                           // tx.executeSql("DELETE FROM T_STAT_UPDATE");
                            tx.executeSql('DELETE FROM T_CLIENT_REPAY_SCHEDULE WHERE CRS_LOAN_SAVING_FLAG = "L" AND CRS_FLAG = "D" AND CRS_CREATED_DATE !="" AND CRS_DATE != "" AND CRS_DATE="'+date+'"');
                        }, function(err){}, function(suc){});
                        //syncmgr.synclog("Updating success");
                        syncmgr.synclog(i18n.t("messages.RepaymentSyncSuccess"));
                        promise.resolve();
                        return true;
                    } else if (result=='Fail'){
                        //syncmgr.endsync("Update/Schedule fail.");
                        syncmgr.endsync(i18n.t("messages.RepaymentSyncFail"));
                        return false;
                    } else {
                        sendUpdate();
                    }
                },
                error: function(jqXHR,textStatus,errorThrown){
                    //syncmgr.endsync("Sync repayments failed: "+jqXHR.responseText);
                    syncmgr.endsync(i18n.t("messages.RepaymentSyncFail")+jqXHR.responseText);
                }
            });
        }

        return promise;

    };

    this.updateDisbursementInfo = function(){

        var promise = new $.Deferred();
        syncmgr.synclog(i18n.t("messages.UpdateLoanInfo"));

        ////console.log("disbursement data");

        var updateLoan = {};
        updateLoan.DATA = [];

        var flags = {};
        var tries = 0;

        var date = new Date();
        date = ("0"+date.getDate()).slice(-2)+"/"+("0"+(date.getMonth()+1)).slice(-2)+"/"+date.getFullYear();

        myDB.execute('SELECT * FROM T_CLIENT_LOAN WHERE CLL_STATUS IN (13,34) AND CLL_DISBURSEMENT_DATE="'+date+'" ', function(repayres){
            if(repayres.length === 0) {
                PSYNC.updateDisbursementInfo = true;
                promise.resolve();
                return false;
            }

            $.each(repayres, function(id,reval){

                reval = nullToEmpty(reval);//Null fields to Empty
                var loan = [];

                //LOAN
                loan.push(reval.CLL_PK);
                loan.push(reval.CLL_TOTAL_LOAN_WEEKS);
                loan.push(reval.CLL_ACTUAL_LOAN);
                loan.push(reval.CLL_REPAY_PER_WEEK);
                loan.push(0);
                loan.push(reval.CLL_ROUNDING_OF_REPAYMENT);
                loan.push(reval.CLL_GRACE_PERIOD_INTEREST);
                loan.push(reval.CLL_CASH_OUT_BY);
                loan.push(reval.CLL_LOAN_CYCLE);
                loan.push(reval.CLL_CASHIER_BY);
                loan.push(reval.CLL_STATUS);

                loan = nullToEmpty(loan);

                updateLoan.DATA.push(loan);
            });
            sendUpdate();
        });


        function fail(error) {
            alert(error.code);
        }


        function sendUpdate(){
         
            if(updateLoan.DATA.length === 0)
            { //both results are zero skip
                PSYNC.updateDisbursementInfo = true;
                promise.resolve();
                return;
            }

            if(tries > 2) {
                syncmgr.endsync(i18n.t("messages.UpdateLoanInfoFail"));
                return false;
            }

            tries = tries + 1;

            synccounter++; //sync counter + 1
            updateLoan.CRED = getPushCRED();

            ////console.log(JSON.stringify(updateLoan));

            $.ajax({
                url: serverURL,
                type: "POST",
                cache: false,
                data: "strMode=updLoanInfo&data="+JSON.stringify(updateLoan),
                crossDomain: true,
                processData: false,
                success: function(result){

                    if(result=="Success"){
                        myDB.dbShell.transaction(function(tx){
                           // tx.executeSql("DELETE FROM T_STAT_UPDATE");

                        }, function(err){}, function(suc){});
                        //syncmgr.synclog("Updating success");
                        syncmgr.synclog(i18n.t("messages.UpdateLoanInfoSuccess"));
                        promise.resolve();
                        return true;
                    }else if (result=='Fail'){
                        //syncmgr.endsync("Update/Schedule fail.");
                        syncmgr.endsync(i18n.t("messages.UpdateLoanInfoFail"));
                        return false;
                    } else {
                        sendUpdate();
                    }
                },
                error: function(jqXHR,textStatus,errorThrown){
                    //syncmgr.endsync("Sync repayments failed: "+jqXHR.responseText);
                    syncmgr.endsync(i18n.t("messages.UpdateLoanInfoFail")+jqXHR.responseText);
                }
            });
        }

        return promise;

    };

    this.updateCollection = function(){

        var promise = new $.Deferred();
        syncmgr.synclog(i18n.t("messages.UpdateRequest")); 

        var updateStatus = {};
        updateStatus.REPAY = [];

        var flags = {};
        var tries = 0;

        var date = new Date();
        date = ("0"+date.getDate()).slice(-2)+"/"+("0"+(date.getMonth()+1)).slice(-2)+"/"+date.getFullYear();

        myDB.execute('SELECT * FROM T_CLIENT_REPAY_SCHEDULE WHERE CRS_FLAG = "C" AND CRS_CREATED_DATE != "" AND CRS_DATE !="" AND CRS_DATE="'+date+'" ', function(repayres){

            flags.REPAY = true;
            if(repayres.length === 0) {
                PSYNC.updateCollection = true;
                promise.resolve();
                return false;
            }
            var nocoldis = 0;
            $.each(repayres, function(id,reval){

                ////console.log(reval);

                reval = nullToEmpty(reval);//Null fields to Empty

                var paidby = 0;
                if(reval.CRS_PAIDBY_PK !== '' && reval.CRS_PAIDBY_PK !== null) paidby = reval.CRS_PAIDBY_PK;

                if(reval.CRS_ATTENDED ===''||reval.CRS_ATTENDED=='null'||reval.CRS_ATTENDED === null||reval.CRS_ATTENDED === ''){nocoldis++;}
                var repayment = [];
                repayment.push(reval.CRS_PK);
                repayment.push(reval.CRS_CLT_PK);
                repayment.push(reval.CRS_CLL_PK);
                repayment.push(reval.CRS_PRM_LTY_PK);
                repayment.push(reval.CRS_LOAN_SAVING_FLAG);
                repayment.push(reval.CRS_ACTUAL_WEEK_NO);
                repayment.push(reval.CRS_COLLECTION_WEEK_NO); 
                repayment.push(reval.CRS_DATE); // Converted Date 
                repayment.push(reval.CRS_FO);
                repayment.push(reval.CRS_FLAG);
                repayment.push(reval.CRS_ATTENDED);
                repayment.push(reval.CRS_EXP_CAPITAL_AMT);
                repayment.push(reval.CRS_EXP_PROFIT_AMT);
                repayment.push(reval.CRS_BALANCE_CAPITAL);
                repayment.push(reval.CRS_BALANCE_PROFIT);
                repayment.push(reval.CRS_PENALTY);
                repayment.push(reval.CRS_SMS_STATUS);
                repayment.push(reval.CRS_SMS_GROUP_STATUS);
                repayment.push(reval.CRS_RECP_STATUS);
                repayment.push(reval.CRS_RECP_GROUP_STATUS);
                repayment.push(sanitize(reval.CRS_REASON));
                repayment.push(reval.CRS_ASSISTED);
                repayment.push(reval.CRS_ACT_CAPITAL_AMT);
                repayment.push(reval.CRS_ACT_PROFIT_AMT);
                repayment.push(reval.CRS_IS_VARY_FORECAST);
                repayment.push(reval.CRS_REF_NO);
                repayment.push(reval.CRS_EXT_STATUS);
                repayment.push(reval.CRS_FUP_PK);
                repayment.push(reval.CRS_RECON_FUP_PK);
                repayment.push(reval.CRS_CREATED_BY);
                repayment.push(reval.CRS_CREATED_DATE);
                repayment.push(paidby);

                repayment = nullToEmpty(repayment);
                updateStatus.REPAY.push(repayment);
            });
            if(nocoldis>0){
                //syncmgr.endsync("There are disbursements / collections pending.");
                syncmgr.endsync(i18n.t("messages.RepaymentSyncFail"));
                return false;
            }
            sendUpdate();
        });


        function fail(error) {
            alert(error.code);
        }


        function sendUpdate(){
             
            if(updateStatus.REPAY.length === 0)
            { //both results are zero skip
                PSYNC.updateCollection = true;
                promise.resolve();
                return;
            }

            if(tries > 2) {
                syncmgr.endsync(i18n.t("messages.RepaymentSyncFail"));
                return false;
            }

            tries = tries + 1;

            synccounter++; //sync counter + 1
            updateStatus.CRED = getPushCRED();

            ////console.log("updRepay");
            ////console.log(updateStatus);

            $.ajax({
                url: serverURL,
                type: "POST",
                cache: false,
                data: "strMode=updRepay&data="+JSON.stringify(updateStatus),
                crossDomain: true,
                processData: false,
                success: function(result){

                    if(result=="Success"){
                        myDB.dbShell.transaction(function(tx){
                           // tx.executeSql("DELETE FROM T_STAT_UPDATE");
                            PSYNC.updateCollection = true;
                            tx.executeSql('DELETE FROM T_CLIENT_REPAY_SCHEDULE WHERE CRS_FLAG = "C" AND CRS_DATE != "" AND CRS_DATE="'+date+'"');
                        }, function(err){}, function(suc){});
                        //syncmgr.synclog("Updating success");
                        syncmgr.synclog(i18n.t("messages.RepaymentSyncFail"));
                        promise.resolve();
                        return true;
                    }else if (result=='Fail'){
                        //syncmgr.endsync("Update/Schedule fail.");
                        syncmgr.endsync(i18n.t("messages.RepaymentSyncFail"));
                        return false;
                    } else {
                        sendUpdate();
                    }
                        },
                error: function(jqXHR,textStatus,errorThrown){
                    //syncmgr.endsync("Sync repayments failed: "+jqXHR.responseText);
                    syncmgr.endsync(i18n.t("messages.RepaymentSyncFail")+jqXHR.responseText);
                }
            });
        }

        return promise;

    };

    this.updateRequest = function(){

        var promise = new $.Deferred();
       // syncmgr.synclog("Updating request preparing..");
        syncmgr.synclog(i18n.t("messages.UpdateRequest"));
        ////console.log("repay");

        var updateStatus = {};
        updateStatus.REPAY = [];
        updateStatus.CLL = [];
        updateStatus.CPM = [];

        var flags = {};
        var tries = 0;

        var anotherdate = new Date();
        anotherdate = anotherdate.getFullYear()+"-"+("0"+(anotherdate.getMonth()+1)).slice(-2)+"-"+("0"+anotherdate.getDate()).slice(-2);

        var date = new Date();
        date = ("0"+date.getDate()).slice(-2)+"/"+("0"+(date.getMonth()+1)).slice(-2)+"/"+date.getFullYear();
        var cmd  = 'SELECT * FROM T_CLIENT_REPAY_SCHEDULE WHERE CRS_LOAN_SAVING_FLAG = "L" AND CRS_FLAG = "D" AND CRS_DATE="'+date+'"';
    
        myDB.execute(cmd, function(repayres){
            flags.REPAY = true;
            if(repayres.length === 0) {
                PSYNC.updateRequest = true;
                sendUpdate();
                return false;
            }
            var nocoldis = 0;
            $.each(repayres, function(id,reval){

                reval = nullToEmpty(reval); //Null fields to Empty

                if(reval.CRS_ATTENDED === '' || reval.CRS_ATTENDED=='null'||reval.CRS_ATTENDED === null||reval.CRS_ATTENDED === ''){nocoldis++;}
                var repayment = [];
                repayment.push(reval.CRS_PK);
                repayment.push(reval.CRS_CLT_PK);
                repayment.push(reval.CRS_CLL_PK);
                repayment.push(reval.CRS_PRM_LTY_PK);
                repayment.push(reval.CRS_LOAN_SAVING_FLAG);
                repayment.push(reval.CRS_ACTUAL_WEEK_NO);
                repayment.push(reval.CRS_COLLECTION_WEEK_NO);
                repayment.push(reval.CRS_DATE);
                repayment.push(reval.CRS_FO);
                repayment.push(reval.CRS_FLAG);
                repayment.push(reval.CRS_ATTENDED);
                repayment.push(reval.CRS_EXP_CAPITAL_AMT);
                repayment.push(reval.CRS_EXP_PROFIT_AMT);
                repayment.push(reval.CRS_BALANCE_CAPITAL);
                repayment.push(reval.CRS_BALANCE_PROFIT);
                repayment.push(reval.CRS_PENALTY);
                repayment.push(reval.CRS_SMS_STATUS);
                repayment.push(reval.CRS_SMS_GROUP_STATUS);
                repayment.push(reval.CRS_RECP_STATUS);
                repayment.push(reval.CRS_RECP_GROUP_STATUS);
                repayment.push(sanitize(reval.CRS_REASON));
                repayment.push(reval.CRS_ASSISTED);
                repayment.push(reval.CRS_ACT_CAPITAL_AMT);
                repayment.push(reval.CRS_ACT_PROFIT_AMT);
                repayment.push(reval.CRS_IS_VARY_FORECAST);
                repayment.push(reval.CRS_REF_NO);
                repayment.push(reval.CRS_EXT_STATU);
                repayment.push(reval.CRS_FUP_PK);
                repayment.push(reval.CRS_RECON_FUP_PK);
                repayment.push(reval.CRS_CREATED_BY);
                repayment.push(reval.CRS_CREATED_DATE);
                repayment.push(reval.CRS_PAIDBY_PK);

                repayment = nullToEmpty(repayment);
                updateStatus.REPAY.push(repayment);
            });
            if(nocoldis>0){
                //syncmgr.endsync("There are disbursements / collections pending.");
                syncmgr.endsync(i18n.t("messages.PendingDisbursementCollection"));
                return false;
            }
            //dataExport();
            sendUpdate();
        });


        function fail(error) {
            alert(error.code);
        }


        function sendUpdate(){
             
            if(updateStatus.REPAY.length === 0)
            { //both results are zero skip
                PSYNC.updateRequest = true;
                promise.resolve();
                return;
            }

            if(tries > 2) {
                syncmgr.endsync(i18n.t("messages.UpdateScheduleFail"));
                return false;
            }

            tries = tries + 1;

            synccounter++; //sync counter + 1
            updateStatus.CRED = getPushCRED();

            ////console.log(updateStatus);

            $.ajax({
                url: serverURL,
                type: "POST",
                cache: false,
                data: "strMode=updateRepay&data="+JSON.stringify(updateStatus),
                crossDomain: true,
                processData: false,
                success: function(result){

                    if(result=="Success"){
                        myDB.dbShell.transaction(function(tx){
                            // tx.executeSql("DELETE FROM T_STAT_UPDATE");
                            PSYNC.updateRequest = true;
                            tx.executeSql('DELETE FROM T_CLIENT_REPAY_SCHEDULE WHERE CRS_LOAN_SAVING_FLAG = "L" AND CRS_FLAG = "D" AND CRS_DATE != "" AND CRS_DATE="'+date+'"');
                        }, function(err){}, function(suc){});
                        //syncmgr.synclog("Updating success");
                        syncmgr.synclog(i18n.t("messages.UpdateRequestSuccess"));
                        promise.resolve();
                        return true;
                    }else if (result=='Fail'){
                        //syncmgr.endsync("Update/Schedule fail.");
                        syncmgr.endsync(i18n.t("messages.UpdateScheduleFail"));
                        return false;
                    } else {
                        sendUpdate();
                    }
                },
                error: function(jqXHR,textStatus,errorThrown){
                    //syncmgr.endsync("Sync repayments failed: "+jqXHR.responseText);
                    syncmgr.endsync(i18n.t("messages.UpdateScheduleFail")+jqXHR.responseText);
                }
            });
        }
        return promise;
    };
    /******************************************
    // Withdrawal and Other Savings records
    ******************************************/
    this.pushWithdrawalReq = function(){
        var promise = new $.Deferred();

        var cptdate = new Date();

        cptdate = cptdate.getFullYear()+"-"+("0"+(cptdate.getMonth()+1)).slice(-2)+"-"+("0"+cptdate.getDate()).slice(-2);
        var withdrawalreq = {};
        withdrawalreq.DATA = [];
        var cptcdm = 'SELECT * FROM T_CLIENT_PRD_TXN WHERE CPT_CHKNEW = 1 AND DATE(CPT_DATETIME)="'+cptdate+'" ';

        myDB.execute(cptcdm, function(datares){

            if(datares.length === 0) {
                PSYNC.pushWithdrawalReq = true;
                sendUpdate();
                return false;
            }
            var nocoldis = 0;
            $.each(datares, function(id,reval){

                //if(reval.CRS_ATTENDED==''||reval.CRS_ATTENDED==null||reval.CRS_ATTENDED=='null'){nocoldis++;}

                reval = nullToEmpty(reval);//Null fields to Empty

                var newtxn = [];
                newtxn.push(reval.P_ID);
                newtxn.push(reval.CPT_PK);
                newtxn.push(reval.CPT_CPM_PK);
                newtxn.push(reval.CPT_CLT_PK);
                newtxn.push(reval.CPT_PRM_PK);
                newtxn.push(reval.CPT_USER_PK);
                newtxn.push(reval.CPT_STATUS);
                newtxn.push(reval.CPT_FLAG);
                newtxn.push(reval.CPT_TXN_AMOUNT);
                newtxn.push(reval.CPT_REASON);
                newtxn.push(reval.CPT_REMARK);
                // Reformat Time
                var todayDate = new Date(reval.CPT_DATETIME);
                var format ="AM";
                var hour=todayDate.getHours();
                var min=todayDate.getMinutes();
                var sec=todayDate.getSeconds();
                var month=todayDate.getMonth()+1;
                if(hour>11){format="PM";}
                if (hour   > 12) { hour = hour - 12; }
                if (hour === 0) { hour = 12; }
                if (min < 10){min = "0" + min;}
                var newtime = todayDate.getDate() + "/" + month + "/" +  todayDate.getFullYear()+" "+hour+":"+min+":"+sec;

                newtxn.push(newtime);
                newtxn.push(reval.CPT_COLLECTION_WEEK_NO);

                newtxn = nullToEmpty(newtxn);
                withdrawalreq.DATA.push(newtxn);
            });

            sendUpdate();

        });

        function sendUpdate(){
            ////console.log(withdrawalreq.DATA.length);
            if(withdrawalreq.DATA.length === 0)
            { //both results are zero skip
                PSYNC.pushWithdrawalReq = true;
                promise.resolve();
                return;
            }

            synccounter++; //sync counter + 1
            withdrawalreq.CRED = getPushCRED();
            ////console.log(JSON.stringify(withdrawalreq));

            $.ajax({
                url: serverURL,
                type: "POST",
                cache: false,
                data: "strMode=pushWithdrawalReq&data="+JSON.stringify(withdrawalreq),
                crossDomain: true,
                processData: false,
                success: function(result){
                    if(result=="Success"){
                        myDB.dbShell.transaction(function(tx){
                            PSYNC.pushWithdrawalReq = true;
                            tx.executeSql("DELETE FROM T_CLIENT_PRD_TXN WHERE CPT_FLAG='D' AND CPT_CHKNEW = 1");
                        }, function(err){}, function(suc){});
                       // syncmgr.synclog("Updating success");
                        syncmgr.synclog(i18n.t("messages.WithdrawaReqSuccess"));
                        promise.resolve();
                        return true;
                    }else if (result=='Fail'){
                        //syncmgr.endsync("Update/Schedule fail.");
                        syncmgr.endsync(i18n.t("messages.WithdrawaReqFail"));
                        return false;
                    }
                },
                error: function(jqXHR,textStatus,errorThrown){
                    //syncmgr.endsync("Sync repayments failed: "+jqXHR.responseText);
                    ////console.log(errorThrown);
                    syncmgr.endsync(i18n.t("messages.WithdrawaReqFail")+jqXHR.responseText);
                }
            });
        }
        return promise;
    };

    /******************************************
    // Withdrawal and Other Savings records
    ******************************************/
    this.synccprdclose = function(){

        var promise = new $.Deferred();

        var date = new Date();

        date = date.getFullYear()+"-"+("0"+(date.getMonth()+1)).slice(-2)+"-"+("0"+date.getDate()).slice(-2);

        var synccprdclose = {};
        synccprdclose.DATA = [];

        var cptcdm = 'SELECT * FROM T_CLIENT_PRODUCT_CLOSE_INFO WHERE CPC_CHKNEW = 1 AND DATE(CPC_CREATED_DATE)="'+date+'" ';

        myDB.execute(cptcdm, function(datares){

            if(datares.length === 0) {
                PSYNC.synccprdclose = true;
                sendUpdate();
                return false;
            }
            var nocoldis = 0;
            $.each(datares, function(id,reval){

                //if(reval.CRS_ATTENDED==''||reval.CRS_ATTENDED==null||reval.CRS_ATTENDED=='null'){nocoldis++;}

                reval = nullToEmpty(reval);//Null fields to Empty

                var prdclose = [];
                prdclose.push(reval.CPC_PK);
                prdclose.push(reval.CPC_CLL_PK);
                prdclose.push(reval.CPC_CPM_PK);
                prdclose.push(reval.CPC_BALANCE_AMT);
                prdclose.push(reval.CPC_CLOSING_FEE);
                prdclose.push(reval.CPC_DISBURSE_AMT);
                prdclose.push(reval.CPC_REASON);
                prdclose.push(reval.CPC_STATUS);
                prdclose.push(reval.CPC_CREATED_BY);
                //prdclose.push(reval.CPC_CREATED_DATE);
                //Reformat Time
                var todayDate = new Date(reval.CPC_CREATED_DATE);
                var format ="AM";
                var hour=todayDate.getHours();
                var min=todayDate.getMinutes();
                var sec=todayDate.getSeconds();
                //var month=todayDate.getMonth()+1;
                var dayofdate = ("0"+todayDate.getDate()).slice(-2);
                var month = ("0"+(todayDate.getMonth()+1)).slice(-2);
                if(hour>11){format="PM";}
                if (hour   > 12) { hour = hour - 12; }
                if (hour === 0) { hour = 12; }
                if (min < 10){min = "0" + min;}
                var newtime = dayofdate + "/" + month + "/" +  todayDate.getFullYear()+" "+hour+":"+min+":"+sec;
                prdclose.push(newtime);

                prdclose = nullToEmpty(prdclose);
                synccprdclose.DATA.push(prdclose);
            });

            //dataExport();
            ////console.log(synccprdclose);
            sendUpdate();

        });

        function sendUpdate(){
            if(synccprdclose.DATA.length === 0)
            { //both results are zero skip
                promise.resolve();
                return;
            }

            synccounter++; //sync counter + 1
            synccprdclose.CRED = getPushCRED();

            $.ajax({
                url: serverURL,
                type: "POST",
                cache: false,
                data: "strMode=pushCloseAcc&data="+JSON.stringify(synccprdclose),
                crossDomain: true,
                processData: false,
                success: function(result){
                    if(result=="Success"){
                        myDB.dbShell.transaction(function(tx){
                            PSYNC.synccprdclose = true;
                            tx.executeSql("DELETE FROM T_CLIENT_PRODUCT_CLOSE_INFO WHERE CPC_CHKNEW = 1");
                        }, function(err){}, function(suc){});
                        syncmgr.synclog("Updating success");
                        syncmgr.synclog(i18n.t("messages.AcctCloseSyncSuccess"));
                        promise.resolve();
                        return true;
                    }else if (result=='Fail'){
                        //syncmgr.endsync("Update/Schedule fail.");
                        syncmgr.endsync(i18n.t("messages.AcctCloseSyncFailed"));
                        return false;
                    }
                },
                error: function(jqXHR,textStatus,errorThrown){
                    //syncmgr.endsync("Sync repayments failed: "+jqXHR.responseText);
                    ////console.log(errorThrown);
                    syncmgr.endsync(i18n.t("messages.AcctCloseSyncFailed")+jqXHR.responseText);
                }
            });
        }
        return promise;
    };
    /******************************************
    // New Savings Products
    ******************************************/
    this.pushClientPrd = function(){
        var promise = new $.Deferred();

        var cpmdate = new Date();

        cpmdate = cpmdate.getFullYear()+"-"+("0"+(cpmdate.getMonth()+1)).slice(-2)+"-"+("0"+cpmdate.getDate()).slice(-2);
        var clientnewprd = {};
        clientnewprd.DATA = [];
        var cpmcmd = 'SELECT * FROM T_CLIENT_PRODUCT_MAPPING WHERE CPM_CHKNEW = 2';

        myDB.execute(cpmcmd, function(datares){
            ////console.log(datares);
            if(datares.length === 0) {
                PSYNC.pushClientPrd = true;
                promise.resolve();
                return false;
            }
            var nocoldis = 0;
            $.each(datares, function(id,reval){


                reval = nullToEmpty(reval);//Null fields to Empty
                //if(reval.CRS_ATTENDED==''||reval.CRS_ATTENDED==null||reval.CRS_ATTENDED=='null'){nocoldis++;}
                var newprd = [];
                newprd.push(reval.CPM_PK);
                newprd.push(reval.CPM_CLT_PK);
                newprd.push(reval.CPM_CLL_PK);
                newprd.push(reval.CPM_PRM_PK);
                newprd.push(reval.CPM_PRM_MATURITY);
                //newprd.push(reval.CPM_PRM_BALANCE);
                // Reformat Time
                var todayDate = new Date();
                var format ="AM";
                var hour=todayDate.getHours();
                var min=todayDate.getMinutes();
                var sec=todayDate.getSeconds();
                var month=todayDate.getMonth()+1;
                if(hour>11){format="PM";}
                if (hour > 12) { hour = hour - 12; }
                if (hour === 0) { hour = 12; }
                if (min < 10){min = "0" + min;}
                var newtime = todayDate.getDate() + "/" + month + "/" +  todayDate.getFullYear()+" "+hour+":"+min+":"+sec;

                newprd.push(newtime);
                newprd.push(reval.CPM_STATUS_PK);
                newprd.push(reval.CPM_REPAY_PER_WEEK);
                newprd.push(reval.CPM_START_MATURITY_DATE);
                newprd.push(reval.CPM_END_MATURITY_DATE);

                newprd = nullToEmpty(newprd);
                clientnewprd.DATA.push(newprd);
            });

            sendUpdate();

        });

        function sendUpdate(){

            if(clientnewprd.DATA.length === 0)
            { //both results are zero skip
                promise.resolve();
                return;
            }

            synccounter++; //sync counter + 1
            clientnewprd.CRED = getPushCRED();
            ////console.log(clientnewprd);
            $.ajax({
                url: serverURL,
                type: "POST",
                cache: false,
                data: "strMode=pushClientPrd&data="+JSON.stringify(clientnewprd),
                crossDomain: true,
                processData: false,
                success: function(result){
                    if(result=="Success"){
                        myDB.dbShell.transaction(function(tx){
                            PSYNC.pushClientPrd = true;
                            tx.executeSql("DELETE FROM T_CLIENT_PRODUCT_MAPPING WHERE CPM_CHKNEW=2");
                        }, function(err){}, function(suc){});
                       // syncmgr.synclog("Updating success");
                        syncmgr.synclog(i18n.t("messages.ClienPrdUpdSuccess"));
                        promise.resolve();
                        return true;
                    }else if (result=='Fail'){
                        //syncmgr.endsync("Update/Schedule fail.");
                        syncmgr.endsync(i18n.t("messages.ClienPrdUpdFailed"));
                        return false;
                    }
                },
                error: function(jqXHR,textStatus,errorThrown){
                    //syncmgr.endsync("Sync repayments failed: "+jqXHR.responseText);
                    ////console.log(errorThrown);
                    syncmgr.endsync(i18n.t("messages.ClienPrdUpdFailed")+jqXHR.responseText);
                }
            });
        }
        return promise;
    };

    /******************************************
    // Evaluation records
    ******************************************/
    this.sendEval = function(){

        var promise = new $.Deferred();
        myDB.T_CLIENT_EVALUATION.get("CLE_MOB_NEW=1", function(results){
 
            if(results.length === 0) {
                PSYNC.sendEval = true;
                promise.resolve();
                return false;
            }
            synccounter++; //sync counter + 1

            var evaldatalist = [];
            var count = 0;

            $.each(results,function(id,evalu){
                var evalpk = evalu.CLE_PK;
                var evalstatus = evalu.CLE_REVIEW_CODE;
                var evaldata = {};

                evalu = nullToEmpty(evalu);//Null fields to Empty


                var eval_housemember = 0;
                var eval_noof_children = 0;
                var eval_noof_children_schooling =0;

                if(evalu.CLE_HOUSEHOLD_MEMBERS !== null && evalu.CLE_HOUSEHOLD_MEMBERS != '') eval_housemember = evalu.CLE_HOUSEHOLD_MEMBERS;
                if(evalu.CLE_NO_OF_CHILDREN !== null && evalu.CLE_NO_OF_CHILDREN != '') eval_noof_children = evalu.CLE_NO_OF_CHILDREN;
                if(evalu.CLE_NO_OF_CHILDREN_IN_SCHOOLING != null && evalu.CLE_NO_OF_CHILDREN_IN_SCHOOLING != '') eval_noof_children_schooling = evalu.CLE_NO_OF_CHILDREN_IN_SCHOOLING;

                var evalObj = [
                    evalu.CLE_PK,
                    evalu.CLE_CLT_PK,
                    evalu.CLE_CLL_PK,
                    evalu.CLE_REVIEW_CODE,
                    evalu.CLE_NO_OF_WEEK,
                    evalu.CLE_INTERVIEW_LOCATION,
                    evalu.CLE_IS_CLIENT_IN_BUSINESS,
                    sanitize(evalu.CLE_NOTE),
                    evalu.CLE_IS_BUSINESS_WELL,
                    sanitize(evalu.CLE_REASON),
                    evalu.CLE_SCHOOL_FEES_WORK_CAP,
                    evalu.CLE_HOUSE_REPAIR_WORK_CAP,
                    evalu.CLE_HOME_UTENSILS_WORK_CAP,
                    evalu.CLE_CLOTHES_SHOES_WORK_CAP,
                    evalu.CLE_MEDICAL_WORK_CAP,
                    evalu.CLE_FOOD_WORK_CAP,
                    evalu.CLE_CRF_WORK_CAP,
                    evalu.CLE_GIVE_LEND_WORK_CAP,
                    evalu.CLE_SAVE_WORK_CAP,
                    evalu.CLE_REPAY_DEBTS_WORK_CAP,
                    evalu.CLE_OTHER_USED_WORK_CAP,
                    evalu.CLE_OTHER_WORK_CAP,
                    evalu.CLE_SCHOOL_FEES_EXPENSES,
                    evalu.CLE_HOUSE_REPAIR_IMPROVEMENT,
                    evalu.CLE_HOME_UTENSILS_EQUIPMENT,
                    evalu.CLE_CLOTHES_SHOES,
                    evalu.CLE_MEDICAL,
                    evalu.CLE_FOOD,
                    evalu.CLE_CRF,
                    evalu.CLE_GIVE_LEND,
                    evalu.CLE_SAVE_FOR_EMERGENCY,
                    evalu.CLE_REPAY_DEBTS,
                    evalu.CLE_OTHER_USED,
                    sanitize(evalu.CLE_OTHER),
                    evalu.CLE_OTHER_EXPENSES,
                    evalu.CLE_HOUSE_SIZE,
                    evalu.CLE_HOUSE_CONDITION,
                    evalu.CLE_ROOF_TYPE,
                    evalu.CLE_WALL_TYPE,
                    evalu.CLE_FLOOR_TYP,
                    evalu.CLE_ELETRICITY,
                    evalu.CLE_WATER_SRC,
                    evalu.CLE_HSE_INX,
                    evalu.CLE_CLIENT_MET_LOCATION,
                    //eval.CLE_MCLIENT_MET_LOCATION,
                    //eval.CLE_DMCLIENT_MET_LOCATION,
                    evalu.CLE_WORKING_CAPITAL,
                    evalu.CLE_HB_WORKING_CAPITAL,
                    sanitize(evalu.CLE_FO_REMARKS),
                    //eval.CLE_MANAGER_REMARK,
                    //eval.CLE_DMANAGER_REMARK,
                    evalu.CLE_STATUS,
                    evalu.CLE_CREATED_BY,
                    evalu.CLE_CREATED_DATE,
                    //eval.CLE_DMREVIEWED_BY,
                    //eval.CLE_DMREVIEWED_DATE,
                    //eval.CLE_MREVIEWED_BY,
                    //eval.CLE_MREVIEWED_DATE
                    evalu.CLE_HOMELESS,
                    evalu.CLE_EVER_IN_ARREARS,
                    evalu.CLE_EVER_IN_JOINT_RESPONSIBILITY,
                    evalu.CLE_ARTA_TYPE,
                    evalu.CLE_ARTA_SPECS,
                    evalu.CLE_ARTA_NOSHIP_COST,
                    evalu.CLE_ARTA_DELIVERY_ONTIME,
                    evalu.CLE_ARTA_KWH,
                    evalu.CLE_ARTA_COMPLETION_ONTIME,
                    evalu.CLE_ARTA_NOADD_FEE,
                    evalu.CLE_ARTA_COMPLAINT,
                    evalu.CLE_AGRI_QSEED,
                    evalu.CLE_AGRI_HEALTHY_NURSERY,
                    evalu.CLE_AGRI_GOOD_CROP,
                    evalu.CLE_AGRI_LAND_READY,
                    evalu.CLE_AGRI_OTHERS,
                    evalu.CLE_DISBURSEMENT_RECOMMENDATION,
                    evalu.CLE_ARTA_GOODS_CONDITION, 
                ];

                var newevalObj = nullToEmpty(evalObj); 
                newevalObj.push(parseInt(eval_housemember));
                newevalObj.push(parseInt(eval_noof_children));
                newevalObj.push(parseInt(eval_noof_children_schooling));

     
                evaldata.EVAL = newevalObj;

                //get all T_CLIENT_EVALUATION_BIZ
                myDB.T_CLIENT_EVALUATION_BIZ.get('CEB_CLE_PK='+evalpk+" and CEB_MOB_NEW=1", function(evalbiz){
                    var evalbizlist = [];
                    $.each(evalbiz,function(bizid, evalbizrecord){

                        evalbizrecord = nullToEmpty(evalbizrecord);//Null fields to Empty

                        var newbizrecord = [
                            evalbizrecord.CEB_PK,
                            evalbizrecord.CEB_CLE_PK,
                            evalbizrecord.CEB_CLT_PK,
                            evalbizrecord.CEB_CLL_PK,
                            evalbizrecord.CEB_SOURCE,
                            evalbizrecord.CEB_SOURCE_DETAIL,
                            evalbizrecord.CEB_FIX,
                            evalbizrecord.CEB_VARIABLE
                        ];

                        newbizrecord = nullToEmpty(newbizrecord);
                        evalbizlist.push(newbizrecord);
                    });

                    evaldata.CVBZ = evalbizlist;
                    sendAjax(); //send when all biz evaluation consolidated
                });

                if(evalstatus==1){
                    evaldata.CEBF = [];
                    evaldata.CEAL = [];
                    sendAjax(); //call function
                } else { //status is 20, find borrowed funds
                    myDB.T_CLIENT_EVAL_BORROWED_FUNDS.get('EEF_CLE_PK='+evalpk+' and EEF_MOB_NEW=1', function(borfunds){
                        var borfundslist = [];
                        $.each(borfunds,function(borfundif, borfundrecord){

                            borfundrecord = nullToEmpty(borfundrecord);//Null fields to Empty

                            var newborfund = [
                                borfundrecord.EEF_PK,
                                borfundrecord.EEF_CLE_PK,
                                borfundrecord.EEF_CLT_PK,
                                borfundrecord.EEF_CLL_PK,
                                borfundrecord.EEF_LOAN_FROM,
                                sanitize(borfundrecord.EEF_LOAN_FROM_NAME),
                                borfundrecord.EEF_BORROWED_BY,
                                borfundrecord.EEF_ORGINAL_AMT,
                                borfundrecord.EEF_BALANCE_AMT,
                                borfundrecord.EEF_REPAY_PER_WEEK,
                                borfundrecord.EEF_REPAY_PER_MONTH,
                                borfundrecord.EEF_LOAN_PAID_OFF
                            ];

                            newborfund = nullToEmpty(newborfund);
                            borfundslist.push(newborfund);
                        });
                        evaldata.CEBF = borfundslist;
                        sendAjax();
                    });
                    myDB.T_CLIENT_EVAL_ASSET_LIST.get('CEAL_CLE_PK='+evalpk, function(assetlists){
                        var assetlist_arr = [];
                        $.each(assetlists,function(a, assetlist){

                            assetrecord = nullToEmpty(assetlist);//Null fields to Empty

                            var asset = [
                                assetlist.CEAL_PK,
                                assetlist.CEAL_CLE_PK,
                                assetlist.CEAL_CLT_PK,
                                assetlist.CEAL_CLL_PK,
                                assetlist.CEAL_ASSET_NAME,
                                assetlist.CEAL_ASSET_VALUE
                            ];

                            asset = nullToEmpty(asset);
                            assetlist_arr.push(asset);
                        });
                        evaldata.CEAL = assetlist_arr;
                        sendAjax();
                    });
                }

                function sendAjax(){
                    if(evaldata.CVBZ !== undefined&&evaldata.CEBF !== undefined&&evaldata.CEAL !== undefined){
                        evaldatalist.push(evaldata);
                        count++;
                        if(count==results.length){
                            var finalevaldata = {};
                            finalevaldata.DATA = evaldatalist;
                            finalevaldata.CRED =  getPushCRED();
                            ////console.log(finalevaldata);
                            $.ajax({
                               url: serverURL,
                               type: "POST",
                               async: true,
                               data: "strMode=pusheval&data="+JSON.stringify(finalevaldata),
                               crossDomain: true,
                               cache: false,
                               success: function(result){

                                   if(result=='Success'){
                                     //  syncmgr.synclog("Evaluation synced successfully.");
                                        PSYNC.sendEval = true;
                                        syncmgr.synclog(i18n.t("messages.EvaluationSyncSuccess"));
                                        myDB.dbShell.transaction(function(tx){
                                            //tx.executeSql("DELETE FROM T_CLIENT_EVALUATION");
                                            tx.executeSql("DELETE FROM T_CLIENT_EVALUATION_BIZ");
                                            tx.executeSql("DELETE FROM T_CLIENT_EVAL_BORROWED_FUNDS");
                                        }, function(err){}, function(suc){});
                                       promise.resolve();
                                   }else if (result=='Fail'){
                                       //syncmgr.endsync("Evaluation sync fail.");
                                       syncmgr.endsync(i18n.t("messages.EvaluationSyncFail"));
                                       return false;
                                   }
                               },
                                error: function(jqXHR,textStatus,errorThrown){
                                    //syncmgr.endsync("Sync evaluations failed: "+jqXHR.responseText);
                                    syncmgr.endsync(i18n.t("messages.EvaluationSyncFail")+jqXHR.responseText);
                                }
                            });
                        }
                    }
                    return false;
                }
            });
        });
        return promise;
    };

    /******************************************
    // Change request
    ******************************************/
    this.sendChange = function(){

        var promise = new $.Deferred();
        //syncmgr.synclog("Change request preparing..");
        syncmgr.synclog(i18n.t("messages.ChangeRequestSync"));
        var changereqlist = [];
        myDB.T_CLIENT_CHANGE_REQUEST.get(null, function(results){

            if(results.length === 0) {
                PSYNC.sendChange = true;
                promise.resolve();
                return false;
            }
            synccounter++; //sync counter + 1
            $.each(results, function(id,chgreq){

                chgreq = nullToEmpty(chgreq);//Null fields to Empty

                var changereq = [
                    chgreq.CCR_PK,
                    chgreq.CCR_CLT_PK,
                    chgreq.CCR_BRC_PK,
                    chgreq.CCR_FULL_NAME,
                    chgreq.CCR_NICK_NAME,
                    sanitize(chgreq.CCR_HB_NAME),
                    chgreq.CCR_HB_ID,
                    chgreq.CCR_HB_LIVE_IN_HOUSE,
                    chgreq.CCR_FAMILY_CARD_NO,
                    chgreq.CCR_CLEINT_ID,
                    chgreq.CCR_OTH_REG_NO,
                    chgreq.CCR_GENDER,
                    chgreq.CCR_DOB,
                    chgreq.CCR_AGE,
                    chgreq.CCR_HIGH_EDU,
                    sanitize(chgreq.CCR_HIGH_EDU_OTHER),
                    chgreq.CCR_MARITAL_STATUS,
                    chgreq.CCR_NUM_HOUSE_MEM,
                    chgreq.CCR_NUM_CHILDREN,
                    sanitize(chgreq.CCR_HB_LIVE_PLACE),
                    chgreq.CCR_HB_COME_HOUSE,
                    chgreq.CCR_MOTHER_NM,
                    chgreq.CCR_MOTHER_DOB,
                    chgreq.CCR_MOTHER_AGE,
                    sanitize(chgreq.CCR_BIZ),
                    sanitize(chgreq.CCR_BIZ_EQUIPT),
                    sanitize(chgreq.CCR_HB_BIZ),
                    sanitize(chgreq.CCR_HB_BIZ_EQUIPT),
                    sanitize(chgreq.CCR_BOTH_BIZ),
                    sanitize(chgreq.CCR_BOTH_BIZ_EQUIPT),
                    sanitize(chgreq.CCR_RT_RW),
                    sanitize(chgreq.CCR_STREET_AREA_NM),
                    chgreq.CCR_CENTER_ID,
                    chgreq.CCR_VILLAGE,
                    sanitize(chgreq.CCR_SUB_DISTRICT),
                    sanitize(chgreq.CCR_DISTRICT),
                    sanitize(chgreq.CCR_PROVINCE),
                    chgreq.CCR_POSTAL_CD,
                    sanitize(chgreq.CCR_LAND_MARK),
                    chgreq.CCR_MOB_NO_1,
                    chgreq.CCR_MOB_NO_2,
                    chgreq.CCR_HUSB_MOB_NO,
                    //chgreq.CCR_PHOTO_PATH,
                    //chgreq.CCR_CREATED_BY,
                    chgreq.CCR_CREATED_DATE,
                    chgreq.CCR_FO_PK,
                    chgreq.CCR_GROUP_ID,
                    //chgreq.CCR_ACCEPTED_BY,
                    //chgreq.CCR_ACCEPTED_DATE,
                    //chgreq.CCR_STATUS
                    chgreq.CCR_RW
                ];

                changereq = nullToEmpty(changereq);
                changereqlist.push(changereq);
            });

            //send change request
            if(results.length>0){
                var finalchangereqdata = {};
                finalchangereqdata.DATA = changereqlist;
                finalchangereqdata.CRED = getPushCRED();
                ////console.log(finalchangereqdata);
                $.ajax({
                    url: serverURL,
                    type: "POST",
                    cache: false,
                    async: true,
                    data: "strMode=pushchange&data="+JSON.stringify(finalchangereqdata),
                    crossDomain: true,
                    success: function(result){
                        if(result=='Fail'){
                           // syncmgr.endsync("Change requests sync fail.");
                            syncmgr.endsync(i18n.t("messages.ChangeRequestSyncFail"));
                            return false;
                        }else if(result=='Success'){
                            //syncmgr.synclog("Change Request synced successfully.");
                            PSYNC.sendChange = true;
                            syncmgr.synclog(i18n.t("messages.ChangeRequestSyncSuccess"));
                            myDB.dbShell.transaction(function(tx){
                                tx.executeSql("DELETE FROM T_CLIENT_CHANGE_REQUEST");
                            }, function(err){}, function(suc){});
                            promise.resolve();
                        }
                    },
                    error: function(jqXHR,textStatus,errorThrown){
                        //syncmgr.endsync("Sync change requests failed: "+jqXHR.responseText);
                        syncmgr.endsync(i18n.t("messages.ChangeRequestSyncFail")+jqXHR.responseText);
                    }
                });
            }
        });
        return promise;
    };

    /******************************************
    // Change meeting date
    ******************************************/
    this.meetingChange = function(){

        var promise = new $.Deferred();
        //syncmgr.synclog("Change request preparing..");
        syncmgr.synclog(i18n.t("messages.ChangeRequestSync"));
        var changereqlist   = {};
        changereqlist.MEET  = null;
        changereqlist.CRS   = null;

        var getChangeDate   = getChangeDate();
        var getCrsPk       = getCrsPk();

        $.when(getChangeDate, getCrsPk).done(function(chnD,crspk) {

            console.log("chnD");
            console.log(chnD);
            console.log("crspk");
            console.log(crspk);

            if(chnD !== false) changereqlist.MEET = chnD;	
                else changereqlist.MEET = [];
            if(crspk !== false) changereqlist.CRS = crspk;
                else changereqlist.CRS = [];
            ////console.log(changereqlist.MEET);
            ////console.log(changereqlist.CRS);
            if(changereqlist.MEET.length > 0){
                sendUpdate(changereqlist);
            }
        });

        function getChangeDate(){

            var CDdeferred = $.Deferred();

            myDB.execute("SELECT * FROM T_CHANGE_MEETING_DATE WHERE CMD_NEW = 1 GROUP BY CMD_CENTER_ID", function(results){
                if(results.length==0) {
                    PSYNC.meetingChange = true;
                    promise.resolve(false);
                    return false;
                }
                synccounter++; //sync counter + 1
                var CHGMET = [];
                $.each(results, function(id,chgreq_beforenull){

                    chgreq = nullToEmpty(chgreq_beforenull);//Null fields to Empty

                    var changereq = [
                        chgreq.CMD_PK,
                        chgreq.CMD_GROUP_ID,
                        chgreq.CMD_CENTER_PK,
                        chgreq.CMD_CENTER_ID,
                        chgreq.CMD_OLD_MEETING_DAY,
                        chgreq.CMD_OLD_MEETING_TIME,
                        chgreq.CMD_NEW_MEETING_DAY,
                        chgreq.CMD_NEW_MEEETING_TIME,
                        chgreq.CMD_STATUS,
                        chgreq.CMD_FUP_PK,
                        chgreq.CMD_CREATED_BY,
                        chgreq.CMD_CREATED_DATE,

                    ];

                    changereq = nullToEmpty(changereq);
                    CHGMET.push(changereq);
                });

                CDdeferred.resolve(CHGMET);

            });


            return CDdeferred.promise();

        }

        function getCrsPk(){

            var CPdeferred = $.Deferred();

            var cmd = "SELECT CRS_PK FROM T_CLIENT_REPAY_SCHEDULE WHERE CRS_LOAN_SAVING_FLAG='X'";
            myDB.execute(cmd,function(results){
                if(results.length == 0){
                    CPdeferred.resolve(false);
                    return false;
                }
                var CRS = [];
                $.each(results,function(i,res){
                    CRS.push(res.CRS_PK);
                });
                CPdeferred.resolve(CRS);
            });

            return CPdeferred.promise();

        }

        function sendUpdate(changereqlist){

            ////console.log("sendUpdate");

            var finalchangereqdata = changereqlist ;
            finalchangereqdata.CRED = getPushCRED();
        
            $.ajax({
                url: serverURL,
                type: "POST",
                cache: false,
                async: true,
                data: "strMode=chngMeeting&data="+JSON.stringify(finalchangereqdata),
                crossDomain: true,
                success: function(result){
                    if(result=='Fail'){
                       // syncmgr.endsync("Change requests sync fail.");
                        syncmgr.endsync(i18n.t("messages.ChangeRequestSyncFail"));
                        return false;
                    }else if(result=='Success'){
                        PSYNC.meetingChange = true;
                        //syncmgr.synclog("Change Request synced successfully.");
                        syncmgr.synclog(i18n.t("messages.ChangeRequestSyncSuccess"));
                        myDB.dbShell.transaction(function(tx){
                            tx.executeSql("DELETE FROM T_CHANGE_MEETING_DATE WHERE CMD_NEW = 1");
                            tx.executeSql("DELETE FROM T_CLIENT_REPAY_SCHEDULE WHERE CRS_LOAN_SAVING_FLAG='X'");
                        }, function(err){}, function(suc){});
                        promise.resolve();
                    }
                },
                error: function(jqXHR,textStatus,errorThrown){
                    //syncmgr.endsync("Sync change requests failed: "+jqXHR.responseText);
                    syncmgr.endsync(i18n.t("messages.ChangeRequestSyncFail")+jqXHR.responseText);
                }
            });
        }


        return promise;

    };

    /******************************************
    // Send Group Request
    ******************************************/
    this.sendGroup = function(){

        var promise = new $.Deferred();
        // syncmgr.synclog("Updating group leaders..");
        syncmgr.synclog(i18n.t("messages.UpdateGroupLeader"));
        var grouplist = [];
        myDB.T_TXN_GROUP.get(null, function(results){
            if(results.length==0) {
                PSYNC.sendGroup = true;
                promise.resolve();
                return false;
            }
            synccounter++; //sync counter + 1
            $.each(results, function(id,grpchg){

                grpchg = nullToEmpty(grpchg);//Null fields to Empty

                var groupchg = [
                    grpchg.TGP_GROUP_ID,
                    grpchg.TGP_OLD_LEADER,
                    sanitize(grpchg.TGP_NEW_LEADER),
                    sanitize(grpchg.TGP_REASON),
                    grpchg.TGP_CREATED_BY,
                    grpchg.TGP_CREATED_DATE
                ];

                groupchg = nullToEmpty(groupchg);
                grouplist.push(groupchg);
            });

            if(results.length>0){
                var finalgrouplist = {};
                finalgrouplist.DATA = grouplist;
                finalgrouplist.CRED = getPushCRED();
                ////console.log(finalgrouplist);
                $.ajax({
                    url: serverURL,
                    type: "POST",
                    async: true,
                    cache: false,
                    data: "strMode=pushgroup&data="+JSON.stringify(finalgrouplist),
                    crossDomain: true,
                    success: function(result){
                        if (result=='Fail'){
                           // syncmgr.endsync("Group change sync fail.");
                            syncmgr.endsync(i18n.t("messages.GroupChangeSyncFail"));
                            return false;
                        }else if(result=='Success'){
                            //syncmgr.synclog("Group change synced successfully.");
                            PSYNC.sendGroup = true;
                            syncmgr.synclog(i18n.t("messages.GroupChangeSyncSuccess"));
                            myDB.dbShell.transaction(function(tx){
                                tx.executeSql("DELETE FROM T_TXN_GROUP");
                            }, function(err){}, function(suc){});
                            promise.resolve();
                        }
                    },
                    error: function(jqXHR,textStatus,errorThrown){
                        //syncmgr.endsync("Sync groups failed: "+jqXHR.responseText);
                        syncmgr.endsync(i18n.t("messages.GroupChangeSyncFail") +jqXHR.responseText);
                    }
                });
            }
        });
        return promise;
    };

    /******************************************
    // End of syncing, report
    ******************************************/
    this.endPushSync = function(){
       // if(synccounter==0) syncmgr.endsync("No data to sync.");

       ResponseFO('Push');
        if(synccounter === 0) {
            syncmgr.endsync(i18n.t("messages.NoDataToSync"));
        } else {
            syncmgr.endsync(i18n.t("messages.SyncSuccess"));

        }
    };

    /******************************************
    // Pull data
    ******************************************/
    this.pullRequest = function(){

        var dt = new Date();
        var time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();
        ////console.log("start - "+time);

        //serverURL= $('#setip').val();
        //$.mobile.loading("show", { html: "<div id='syncer'><span class='ui-icon ui-icon-loading'></span><div id='synclog' class='synclog center'>Syncing...</div></div>", text:"loading",textVisible :true });

        var cred = {
            
        }
        // syncmgr.synclog ("Pull Request starting.");
        syncmgr.synclog(i18n.t("messages.PullData"));
        startCountdown();
        var promise = $.Deferred();
        $.ajax({
            url: serverURL,
            type: "POST",
            cache: false,
            async: true,
            data: "strMode=pull&cred="+JSON.stringify(cred),
            crossDomain: true,
            dataType: 'json',
            success: function(result){
                //syncmgr.synclog("Pull success, initiating database");
                syncmgr.synclog(i18n.t("messages.PullDataSuccess"));
                console.log(result);
                promise.resolve(result);
                stopCountdown(); 
            },
            error: function(jqXHR, textStatus, errorThrown){
                //syncmgr.endsync("Sync failed. Check username and password.");
                if(jqXHR.responseText == 'FO cannot Pull data again.'){
                    syncmgr.endsync(i18n.t("messages.FOCannotPullAgain"));
                } else {
                    syncmgr.endsync(i18n.t("messages.SyncFail"));
                }
                promise.reject();
                stopCountdown();
                return false; 
            }
        });
        
        promise.done(function(result){

            var dt = new Date();
            var time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();
            console.log("received data - "+time);
            console.log(result);
            // return false;
            //////console.log("\n\nRECEIVED:\n\n"+JSON.stringify(result)); //print results onto console
            var preps = [];
            var commands = [];
            var cmdar = {
                prepared: null,
                values: [],
            };
            ////console.log(result);

            var cmd = "INSERT INTO T_COMPANY ( "+
                        "CMP_PK,"+
                        "CMP_NAME,"+
                        "CMP_ID,"+
                        "CMP_ADDRESS,"+
                        "CMP_ZIP,"+
                        "CMP_PHONE,"+
                        "CMP_FAX,"+
                        "CMP_CONTACT_NAME,"+
                        "CMP_CONTACT_ADDRESS,"+
                        "CMP_CONTACT_ZIP,"+
                        "CMP_CONTACT_RPHONE,"+
                        "CMP_CONTACT_HPHONE,"+
                        "CMP_CONTACT_EMAIL,"+
                        "CMP_CONTACT_FAX,"+
                        "CMP_IS_ACTIVE,"+
                        "CMP_SCHEDULE_BY_BRNET,"+
                        // "CMP_DEFAULT_LOAN_INTEREST,"+
                        // "CMP_DEFAULT_CRF_INTEREST,"+
                        "CMP_SMS_FORMAT,"+
                        "CMP_RECEIPT_FORMAT,"+
                        "CMP_SMS_LABEL,"+
                        "CMP_RECEIPT_LABEL,"+
                        // "CMP_ARREARS_PERCENTAGE,"+
                        "CMP_TRAINING_DAYS,"+
                        "CMP_CREATED_BY,"+
                        "CMP_CREATED_TIMESTAMP,"+
                        "CMP_MODIFIED_BY,"+
                        "CMP_MODIFIED_TIMESTAMP) "+
                        " VALUES "+
                        " (?,?,?,?,?,?,?,?,?,?,"+
                        "  ?,?,?,?,?,?,?,?,?,?,"+
                        "  ?,?,?,?,?) ";

            cmdar.prepared = cmd;
            var valu = nullTonullString(result.T_COMPANY);
            cmdar.values.push(valu);
            preps.push(cmdar);

            var cmdar2 = {
                prepared: null,
                values : [],
            };

            cmd = "INSERT INTO T_BRANCH ("+
                    "BRC_PK,"+
                    "BRC_CMP_PK,"+
                    "BRC_NAME,"+
                    "BRC_BRANCH_ID,"+
                    "BRC_ADDRESS,"+
                    "BRC_ZIP,"+
                    "BRC_PHONE,"+
                    "BRC_FAX,"+
                    // "BRC_DEFAULT_LOAN_AMOUNT,"+
                    "BRC_PR_CONTACT_NAME,"+
                    "BRC_PR_CONTACT_ADDRESS,"+
                    "BRC_PR_CONTACT_ZIP,"+
                    "BRC_PR_CONTACT_RPHONE,"+
                    "BRC_PR_CONTACT_HPHONE,"+
                    "BRC_PR_CONTACT_EMAIL,"+
                    "BRC_PR_CONTACT_FAX,"+
                    "BRC_IS_ACTIVE,"+
                    // "BRC_HOUSE_INDEX_CAP,"+
                    // "BRC_INCOME_CAP,"+
                    // "BRC_NO_OF_LOANS_FROM_OTHERBANKS,"+
                    // "BRC_WELFARE_STATUS_CAP,"+
                    "BRC_DISBURSE_NOTIFICATION,"+
                    "BRC_CREATED_BY,"+
                    "BRC_CREATED_TIMESTAMP,"+
                    "BRC_MODIFIED_BY,"+
                    "BRC_MODIFIED_TIMESTAMP)"+
                    " VALUES "+
                    " (?,?,?,?,?,?,?,?,?,?,"+
                    "  ?,?,?,?,?,?,?,?,?,?,"+
                    "  ?) ";

            cmdar2.prepared = cmd;
            var valu = nullTonullString(result.T_BRANCH);
            cmdar2.values.push(valu);
            preps.push(cmdar2);

            if(result.T_CODE && result.T_CODE.length > 0){

                var cmdarr = {
                        prepared: null,
                        values : [],
                    };

                cmd = "INSERT INTO T_CODE ("+
                        "CODE_PK,"+
                        "CODE_TYPE_PK,"+
                        "CODE_VALUE,"+
                        "CODE_NAME,"+
                        "CODE_DESC,"+
                        "CODE_IS_ACTIVE,"+
                        "CODE_CREATED_BY,"+
                        "CODE_CREATED_DATE,"+
                        "CODE_UPDATED_BY,"+
                        "CODE_UPDATED_DATE)"+
                        " VALUES "+
                        " (?,?,?,?,?,?,?,?,?,?)";

                cmdarr.prepared = cmd;

                $.each(result.T_CODE, function(ind, val){
                    var valu = nullTonullString(val);
                    cmdarr.values.push(valu);
                });
                preps.push(cmdarr);

            }

            if(result.T_TXN_STATUS && result.T_TXN_STATUS.length > 0){

                var cmdarr = {
                        prepared: null,
                        values : [],
                    };

                cmd = "INSERT INTO T_TXN_STATUS ("+
                        "TST_PK,"+
                        "TST_NAME,"+
                        "TST_GIF_NAME,"+
                        "TST_KEY)"+
                        " VALUES "+
                        " (?,?,?,?)";

                cmdarr.prepared = cmd;

                $.each(result.T_TXN_STATUS, function(ind, val){
                    var valu = nullTonullString(val);
                    cmdarr.values.push(valu);
                });
                preps.push(cmdarr);

            }

            if(result.T_USER && result.T_USER.length > 0){

                var cmdarr = {
                        prepared: null,
                        values : [],
                    };

                cmd = "INSERT INTO T_USER ("+
                        "USER_PK,"+
                        "USER_ID,"+
                        "USER_ROLE,"+
                        "USER_CMP_PK,"+
                        "USER_BRC_PK,"+
                        // "USER_CTR_PK,"+
                        // "USER_CTR_NAME,"+
                        // "USER_CTR_ID,"+
                        "USER_TITLE,"+
                        "USER_NAME,"+
                        "USER_GENDER,"+
                        "USER_DOB,"+
                        "USER_EMAIL,"+
                        "USER_OFFICE_PH_NO,"+
                        "USER_MOBILE_PH_NO,"+
                        "USER_DEPARTMENT,"+
                        "USER_OTH_DEPARTMENT,"+
                        "USER_DESIGNATION,"+
                        "USER_STATUS,"+
                        "USER_INACTIVE_DATE,"+
                        "USER_PASSWORD,"+
                        "USER_PREV_PWD_1,"+
                        "USER_PREV_PWD_2,"+
                        "USER_PREV_PWD_3,"+
                        "USER_UNIQUE_SALT,"+
                        "USER_PWD_CHG_DATE,"+
                        "USER_FAILED_ATTEMPTS,"+
                        "USER_LOGIN_ACTIVE,"+
                        "USER_LAST_ACCESS_DATE,"+
                        "USER_EMAIL_SENT,"+
                        "USER_GROUP_SEQUENCES,"+
                        "USER_CREATED_BY,"+
                        "USER_CREATED_DATE,"+
                        "USER_UPDATED_BY,"+
                        "USER_UPDATED_DATE, "+
                        "USER_HAVE_SIGNATURE, "+
                        "USER_SIGNATURE)"+
                        " VALUES "+
                        " (?,?,?,?,?,?,?,?,?,?,"+
                        "  ?,?,?,?,?,?,?,?,?,?,"+
                        "  ?,?,?,?,?,?,?,?,?,?,"+
                        "  ?,?,?,null)";

                cmdarr.prepared = cmd;

                $.each(result.T_USER, function(ind, val){
                    var valu = nullTonullString(val);
                    cmdarr.values.push(valu);
                });
                preps.push(cmdarr);
            }

            if(result.T_CLIENT_ASSETS_LIST && result.T_CLIENT_ASSETS_LIST.length > 0){

                var cmdarr = {
                        prepared: null,
                        values : [],
                    };

                cmd = "INSERT INTO T_CLIENT_ASSET_LIST ("+
                        "CAL_PK,"+
                        "CAL_CLT_PK,"+
                        "CAL_CLL_PK,"+
                        "CAL_ASSET_NAME,"+
                        "CAL_ASSET_VALUE,"+
                        "CAL_MOB_NEW) "+
                        " VALUES "+
                        " (?,?,?,?,?,0) ";

                cmdarr.prepared = cmd;

                 $.each(result.T_CLIENT_ASSETS_LIST, function(ind, val){
                    var valu = nullTonullString(val);
                    cmdarr.values.push(valu);
                });

                preps.push(cmdarr);
            }

            if(result.T_CHANGE_MEETING_DATE && result.T_CHANGE_MEETING_DATE.length > 0){

                var cmdarr = {
                        prepared: null,
                        values : [],
                    };

                     
                cmd = "INSERT INTO T_CHANGE_MEETING_DATE ("+
                        "CMD_PK,"+ 
                        "CMD_CENTER_PK,"+
                        "CMD_GROUP_ID,"+
                        "CMD_CENTER_ID,"+
                        "CMD_OLD_MEETING_DAY,"+
                        "CMD_NEW_MEETING_DAY,"+
                        "CMD_OLD_MEETING_TIME,"+ 
                        "CMD_NEW_MEEETING_TIME,"+
                        "CMD_STATUS,"+
                        "CMD_CREATED_BY,"+
                        "CMD_CREATED_DATE,"+ 
                        "CMD_NEW) "+
                        " VALUES "+
                        " (?,?,?,?,?,?,?,?,?,?,"+
                        "  ?,0) ";

                cmdarr.prepared = cmd;

                $.each(result.T_CHANGE_MEETING_DATE, function(ind, val){
                    var valu = nullTonullString(val);
                    cmdarr.values.push(valu);
                });
                preps.push(cmdarr); 

            }

            if(result.T_CLIENT_GROUP && result.T_CLIENT_GROUP.length > 0){

                var cmdarr = {
                        prepared: null,
                        values : [],
                    };

                cmd = "INSERT INTO T_CLIENT_GROUP ("+
                        "CLG_PK,"+
                        "CLG_BRC_PK,"+
                        "CLG_CTR_PK,"+
                        "CLG_ID,"+
                        "CLG_NAME,"+
                        "CLG_MOB_NEW) "+
                        " VALUES "+
                        " (?,?,?,?,?,0) ";

                cmdarr.prepared = cmd;

                $.each(result.T_CLIENT_GROUP, function(ind, val){
                    var valu = nullTonullString(val);
                    cmdarr.values.push(valu);
                });
                preps.push(cmdarr);
            }

            //if there are clients
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
                        "CLT_APPROVED_MANAGER_PK, "+
                        "CLT_RELATIVE, "+
                        "CLT_RELATIVE_SIGNATURE, "+
                        "CLT_CTR_LEADER_PK, "+
                        "CLT_GRP_LEADER_PK, "+
                        "CLT_HOME_ONWERSHIP, "+
                        "CLT_NEW_MEMBER_TYPE, "+
                        "CLT_MOB_NEW)"+
                        
                    " VALUES "+
                    " (?,?,?,?,?,?,?,?,?,?,"+
                    "  ?,?,?,?,?,?,?,?,?,?,"+
                    "  ?,?,?,?,?,?,?,?,?,?,"+
                    "  ?,?,?,?,?,?,?,?,?,?,"+
                    "  ?,?,?,?,?,?,?,?,?,?,"+
                    "  ?,?,?,?,?,?,?,?,?,?,"+
                    "  ?,?,?,?,?,0)";

                cmdarr.prepared = cmd;    

                var date = new Date();
                date = ("0"+date.getDate()).slice(-2)+"/"+("0"+(date.getMonth()+1)).slice(-2)+"/"+date.getFullYear();
                var todate = new Date();

                $.each(result.T_CLIENT, function(ind, val){

                    console.log(val);
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
                    valu[58] = val[64]; //CLT_APPROVED_MANAGER_PK
                    valu[59] = val[59]; //CLL_RELATIVE
                    valu[60] = ""; //CLL_RELATIVE_SIGNATURE
                    valu[61] = val[60]; //CLT_CTR_LEADER_PK
                    valu[62] = val[61]; //CLT_GRP_LEADER_PK

                    valu[63] = val[62]; //CLT_HOME_ONWERSHIP
                    valu[64] = val[63]; //CLT_NEW_MEMBER_TYPE

 
                    var valu2 = nullTonullString(valu);
                    cmdarr.values.push(valu2);

                    //#######################################
                    //  CLIENT TRAINING
                    //#######################################
                    var startdate   = new Date(val[43]);
                    var enddate     = new Date(val[44]);
                 
                    if(startdate.getTime() < todate.getTime() && enddate.getTime() > todate.getTime()){

                        var timeDiff = Math.abs(todate.getTime() - startdate.getTime());
                        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

                        myDB.execute("INSERT INTO T_CLIENT_TRAINING_TMP VALUES(null,"+val[0]+","+diffDays+",0)",function(res){

                        });
                    }

                    //always save val[NEXT LAST INTEGER] into photos
                    if(!devtest) if(fileManager)fileManager.write("photo"+val[0]+".dataurl",  "data:image/jpg;base64,"+val[val.length-1]);
                });
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
                    var valu = nullTonullString(val);
                    cmdarr.values.push(valu);
                });
                preps.push(cmdarr);
            }

            if(result.T_LOAN_PURPOSE && result.T_LOAN_PURPOSE.length > 0){

                var cmdarr = {
                    prepared: null,
                    values : [],
                };

                cmd = "INSERT INTO T_LOAN_PURPOSE ("+
                        "LPU_PK,"+
                        "LPU_LTY_PK,"+
                        "LPU_CMP_PK,"+
                        "LPU_CODE,"+
                        "LPU_NAME,"+
                        "LPU_IS_ACTIVE )"+
                        " VALUES "+
                        " (?,?,?,?,?,?) ";

                cmdarr.prepared = cmd;

                $.each(result.T_LOAN_PURPOSE, function(ind, val){
                    var valu = nullTonullString(val);
                    cmdarr.values.push(valu);
                });
                preps.push(cmdarr);
            }

            if(result.T_CLIENT_FORM && result.T_CLIENT_FORM.length > 0){

                var cmdarr = {
                    prepared: null,
                    values : [],
                };

                cmd = "INSERT INTO T_CLIENT_FORM ("+
                        "CLF_PK,"+
                        "CLF_CMP_PK, "+
                        "CLF_QUESTION,"+
                        "CLF_OPTIONS,"+
                        "CLF_SCORE,"+
                        "CLF_TYPE,"+
                        "CLF_DEPENDANT_QUES_PK,"+
                        "CLF_DEPENDANT_ANSWER,"+
                        "CLF_MOB_NEW)"+
                        " VALUES "+
                        " (?,?,?,?,?,?,?,?,0)";

                cmdarr.prepared = cmd;

                $.each(result.T_CLIENT_FORM, function(ind, val){
                    var valu = nullTonullString(val);
                    cmdarr.values.push(valu);
                });

                preps.push(cmdarr);
            }

            if(result.T_CLIENT_FORM_ANSWERS && result.T_CLIENT_FORM_ANSWERS.length > 0){

                var cmdarr = {
                    prepared: null,
                    values : [],
                };

                cmd = "INSERT INTO T_CLIENT_FORM_ANSWERS ("+
                        "CFA_PK, "+
                        "CFA_CLT_PK, "+
                        "CFA_CLL_PK, "+
                        "CLA_CLF_PK, "+
                        "CLA_FO_PK, "+
                        "CFA_CMP_PK, "+
                        "CLF_ASNWER, "+
                        "CLA_SCORE, "+
                        "CLA_CREATED_BY, "+
                        "CLA_CREATED_DATE, "+ 
                        "CLA_MOB_NEW)"+
                        " VALUES "+
                        " (?,?,?,?,?,?,?,?,?,?,0)";

                cmdarr.prepared = cmd;

                $.each(result.T_CLIENT_FORM_ANSWERS, function(ind, val){
                    var valu = nullTonullString(val);
                    cmdarr.values.push(valu);
                });

                preps.push(cmdarr);
            }



            if(result.T_CENTER_MASTER && result.T_CENTER_MASTER.length > 0){

                var cmdarr = {
                    prepared: null,
                    values : [],
                };

                cmd = "INSERT INTO T_CENTER_MASTER ("+
                        "CTR_PK,"+
                        "CTR_BRC_PK,"+
                        "CTR_CENTER_NAME,"+
                        "CTR_CENTER_ID,"+
                        "CTR_IS_ACTIVE,"+
                        "CTR_FO_PK,"+
                        "CTR_VLM_PK,"+
                        "CTR_MEETING_DATE,"+
                        "CTR_MEETING_TIME,"+
                        "CTR_CREATED_BY,"+
                        "CTR_CREATED_DATE,"+
                        "CTR_MODIFIED_BY,"+
                        "CTR_MODIFIED_DATE)"+
                        " VALUES "+
                        " (?,?,?,?,?,?,?,?,?,?,"+
                        "  ?,?,?) ";

                cmdarr.prepared = cmd;

                $.each(result.T_CENTER_MASTER, function(ind, val){
                    var valu = nullTonullString(val);
                    cmdarr.values.push(valu);
                });
                preps.push(cmdarr);
            }

            if(result.T_DISTRICT_MASTER && result.T_DISTRICT_MASTER.length > 0){

                var cmdarr = {
                    prepared: null,
                    values : [],
                };

                cmd = "INSERT INTO T_DISTRICT_MASTER ("+
                        "DSM_PK,"+
                        "DSM_CMP_PK,"+
                        "DSM_NAME,"+
                        "DSM_CODE,"+
                        "DSM_PROVINCE_CODE,"+
                        "DSM_IS_ACTIVE,"+
                        "DSM_CREATED_BY,"+
                        "DSM_CREATED_DATE,"+
                        "DSM_UPDATED_BY,"+
                        "DSM_UPDATED_DATE) "+
                        " VALUES "+
                        " (?,?,?,?,?,?,?,?,?,?) ";

                cmdarr.prepared = cmd;

                $.each(result.T_DISTRICT_MASTER, function(ind, val){
                    var valu = nullTonullString(val);
                    cmdarr.values.push(valu);
                });
                preps.push(cmdarr);
            }

            if(result.T_SUB_DISTRICT_MASTER && result.T_SUB_DISTRICT_MASTER.length > 0){

                var cmdarr = {
                    prepared: null,
                    values : [],
                };

                cmd = "INSERT INTO T_SUB_DISTRICT_MASTER ("+
                        "SDSM_PK,"+
                        "SDSM_CMP_PK,"+
                        "SDSM_DSM_PK, "+
                        "SDSM_NAME,"+
                        "SDSM_CODE,"+
                        "SDSM_IS_ACTIVE,"+
                        "SDSM_CREATED_BY,"+
                        "SDSM_CREATED_DATE,"+
                        "SDSM_UPDATED_BY,"+
                        "SDSM_UPDATED_DATE)"+
                        " VALUES "+
                        " (?,?,?,?,?,?,?,?,?,?) ";

                cmdarr.prepared = cmd;

                $.each(result.T_SUB_DISTRICT_MASTER, function(ind, val){
                    var valu = nullTonullString(val);
                    cmdarr.values.push(valu);
                });
                preps.push(cmdarr);
            }

            if(result.T_CLIENT_BORROWED_FUNDS && result.T_CLIENT_BORROWED_FUNDS.length > 0){

                var cmdarr = {
                    prepared: null,
                    values : [],
                };

                cmd = "INSERT INTO T_CLIENT_BORROWED_FUNDS ("+
                        "CEF_PK,"+
                        "CEF_CLT_PK,"+
                        "CEF_CLL_PK,"+
                        "CEF_LOAN_FROM,"+
                        "CEF_LOAN_FROM_NAME,"+
                        "CEF_BORROWED_BY,"+
                        "CEF_ORGINAL_AMT,"+
                        "CEF_BALANCE_AMT,"+
                        "CEF_REPAY_PER_WEEK,"+
                        "CEF_REPAY_PER_MONTH,"+
                        "CEF_LOAN_PAID_OFF,"+
                        "CEF_MOB_NEW)"+
                        " VALUES "+
                        " (?,?,?,?,?,?,?,?,?,?,?,"+
                        "  0)";
                cmdarr.prepared = cmd;

                $.each(result.T_CLIENT_BORROWED_FUNDS, function(ind, val){
                    var valu = nullTonullString(val);
                    cmdarr.values.push(valu);
                });
                preps.push(cmdarr);
            }
            if(result.T_CLIENT_INCOME && result.T_CLIENT_INCOME.length > 0){
                ////console.log(result['T_CLIENT_INCOME'])
                var cmdarr = {
                    prepared: null,
                    values : [],
                };

                cmd = "INSERT INTO T_CLIENT_INCOME ("+
                        "CLI_PK,"+
                        "CLI_CLT_PK,"+
                        "CLI_CLL_PK,"+
                        "CLI_SOURCE,"+
                        "CLI_SOURCE_DETAIL,"+
                        "CLI_FIXED,"+
                        "CLI_VARIABLE,"+
                        "CLI_MOB_NEW)"+
                        " VALUES "+
                        " (?,?,?,?,?,?,?,0)";

                cmdarr.prepared = cmd;
                $.each(result.T_CLIENT_INCOME, function(ind, val){

                    var valu = nullTonullString(val);
                    cmdarr.values.push(valu);
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
                    var valu = nullTonullString(val);
                    cmdarr.values.push(valu);
                });
                preps.push(cmdarr);
            }
            if(result.T_LOAN_TYPE && result.T_LOAN_TYPE.length > 0){

                var cmdarr = {
                    prepared: null,
                    values : [],
                };

                cmd = "INSERT INTO T_LOAN_TYPE ("+
                        "LTY_PK,"+
                        "LTY_CMP_PK,"+
                        "LTY_CODE,"+
                        "LTY_DESCRIPTION,"+
                        "LTY_MIN_LOAN_AMOUNT,"+
                        "LTY_MAX_LOAN_AMOUNT,"+
                        "LTY_DEFAULT_LOAN_INTEREST,"+
                        "LTY_DEFAULT_CRF_INTEREST,"+
                        "LTY_HOUSE_INDEX_CAP,"+
                        "LTY_INCOME_CAP,"+
                        "LTY_NO_OF_LOANS_FROM_OTHERBANKS,"+
                        "LTY_WELFARE_STATUS_CAP,"+
                        "LTY_ARREARS_PERCENTAGE,"+
                        "LTY_MIN_REPAY_WEEK,"+
                        "LTY_MAX_REPAY_WEEK,"+
                        "LTY_FIRST_REVIEW_WEEK,"+
                        "LTY_SECOND_REVIEW_WEEK,"+
                        "LTY_IS_ACTIVE,"+
                        "LTY_CREATED_BY,"+
                        "LTY_CREATED_TIMESTAMP,"+
                        "LTY_MODIFIED_BY,"+
                        "LTY_MODIFIED_TIMESTAMP,"+
                        "LTY_MULTIPLE_LOAN_ALLOWED,"+
                        "LTY_LOAN_ELIGIBILITY_WEEK,"+
                        "LTY_TERM_OF_LOAN, "+
                        "LTY_GRACE_PERIOD_WEEK, "+
                        "LTY_ROUNDING_AMOUNT) "+
                        " VALUES "+
                        " (?,?,?,?,?,?,?,?,?,?,"+
                        "  ?,?,?,?,?,?,?,?,?,?,"+
                        "  ?,?,?,?,?,?,?)";
                cmdarr.prepared = cmd;

                $.each(result.T_LOAN_TYPE, function(ind, val){
                    //var valu = nullTonullString(val);
                    cmdarr.values.push(val);
                });

                preps.push(cmdarr);

            }

            if(result.T_CLIENT_FAMILY_LIST && result.T_CLIENT_FAMILY_LIST.length > 0){

                var cmdarr = {
                    prepared: null,
                    values : [],
                };

                cmd = "INSERT INTO T_CLIENT_FAMILY_LIST ("+
                        "CFL_PK,"+
                        "CFL_CMP_ID,"+
                        "CFL_CLT_PK,"+
                        "CFL_NAME,"+
                        "CFL_PLACE_OF_BIRTH,"+
                        "CFL_DOB,"+
                        "CFL_WORK,"+
                        "CFL_FAMILY_CODE, "+
                        "CFL_EDU_CODE,"+
                        "CFL_STILL_IN_SCHOOL,"+
                        "CFL_STATUS, "+
                        "CFL_GENDER, "+
                        "CFL_EDU_INFORMATION, "+
                        "CFL_MARITAL_STATUS )"+
                        " VALUES "+
                        " (?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
                cmdarr.prepared = cmd;

                $.each(result.T_CLIENT_FAMILY_LIST, function(ind, val){
                    //var valu = nullTonullString(val);
                    cmdarr.values.push(val);
                });

                preps.push(cmdarr);
            }

            if(result.T_PRODUCT_MASTER && result.T_PRODUCT_MASTER.length > 0){

                var cmdarr = {
                    prepared: null,
                    values : [],
                };

                cmd = "INSERT INTO T_PRODUCT_MASTER ("+
                        "PRM_PK,"+
                        "PRM_CMP_PK,"+
                        "PRM_NAME,"+
                        "PRM_CODE,"+
                        "PRM_DESCRIPTION,"+
                        "PRM_DEPOSIT_FREQUENCY,"+
                        "PRM_DEPOSIT_AMOUNT_RANGE,"+
                        "PRM_DEPOSIT_AMOUNT,"+
                        "PRM_LOAN_MATURITY_OPTIONS,"+
                        "PRM_CLOSING_CHARGES,"+
                        "PRM_IS_ACTIVE,"+
                        "PRM_LOAN_WITHDRAW_POLICY, "+
                        "PRM_LOAN_CLOSING_POLICY, "+
                        "PRM_LOAN_FLEXI_FIELD,"+
                        "PRM_CREATED_BY,"+
                        "PRM_CREATED_TIMESTAMP,"+
                        "PRM_MODIFIED_BY,"+
                        "PRM_MODIFIED_TIMESTAMP,"+
                        "PRM_DEFAULT_AMOUNT,"+
                        "PRM_LOCAL_NAME)"+
                        " VALUES "+
                        " (?,?,?,?,?,?,?,?,?,?,"+
                        "  ?,?,?,?,?,?,?,?,?,?)";
                cmdarr.prepared = cmd;

                $.each(result.T_PRODUCT_MASTER, function(ind, val){
                    //var valu = nullTonullString(val);
                    cmdarr.values.push(val);
                });

                preps.push(cmdarr);
            }


            if(result.T_PRODUCT_MASTER_DETAILS && result.T_PRODUCT_MASTER_DETAILS.length > 0){

                var cmdarr = {
                    prepared: null,
                    values : [],
                };

                cmd = "INSERT INTO T_PRODUCT_MASTER_DETAILS ("+
                        "PRD_PK,"+
                        "PRD_PRM_PK,"+
                        "PRD_LOAN_AMT_FROM,"+
                        "PRD_LOAN_AMT_TO,"+
                        "PRD_WEEKLY_DEPOSIT)"+
                        " VALUES "+
                        " (?,?,?,?,?)";

                cmdarr.prepared = cmd;

                $.each(result.T_PRODUCT_MASTER_DETAILS, function(ind, val){
                    //var valu = nullTonullString(val);
                    cmdarr.values.push(val);
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

            if(result.T_LOAN_SAVING_PRD_MAPPING && result.T_LOAN_SAVING_PRD_MAPPING.length > 0){

                var cmdarr = {
                    prepared: null,
                    values : [],
                };

                cmd = "INSERT INTO T_LOAN_SAVING_PRD_MAPPING ("+
                        "LSM_PK, "+
                        "LSM_LTY_PK, "+
                        "LSM_PRM_PK, "+
                        "LSM_PRM_OPEN_BAL, "+
                        "LSM_PRM_IS_MANDATORY)"+
                        " VALUES "+
                        " (?,?,?,?,?) ";

                cmdarr.prepared = cmd;

                $.each(result.T_LOAN_SAVING_PRD_MAPPING, function(ind, val){
                    //var valu = nullTonullString(val);
                    cmdarr.values.push(val);
                });

                preps.push(cmdarr);
            }

            if(result.T_CLIENT_PRD_TXN && result.T_CLIENT_PRD_TXN.length > 0){

                var cmdarr = {
                    prepared: null,
                    values : [],
                };

                cmd = "INSERT INTO T_CLIENT_PRD_TXN ("+
                            "CPT_PK,"+
                            "CPT_CPM_PK,"+
                            "CPT_CLT_PK,"+
                            "CPT_PRM_PK,"+
                            "CPT_FLAG,"+
                            "CPT_TXN_AMOUNT,"+
                            "CPT_DATETIME,"+
                            "CPT_USER_PK,"+
                            "CPT_REASON,"+
                            "CPT_REMARK,"+
                            "CPT_STATUS,"+
                            "CPT_COLLECTION_WEEK_NO,"+
                            "CPT_EXP_AMOUNT,"+
                            "CPT_CHKNEW) VALUES"+
                            "(?,?,?,?,?,?,?,?,?,?,?,?,?,0) ";

                cmdarr.prepared = cmd;

                $.each(result.T_CLIENT_PRD_TXN, function(ind, val){

                    for(var i in val){
                        if(val[i] === null||val[i] === "null")
                            val[i] = "";
                    }

                    val[val.length] = val[5];

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


            if(result.T_CLIENT_TRAINING && result.T_CLIENT_TRAINING.length > 0){

                var cmdarr = {
                    prepared: null,
                    values : [],
                };

                cmd = "INSERT INTO T_CLIENT_TRAINING ("+
                        "CTR_PK,"+
                        "CTR_CLT_PK,"+
                        "CTR_FO_FOR_TRAINING,"+
                        "CTR_TRANING_START_DATE,"+
                        "CTR_TRANING_END_DATE,"+
                        "CTR_CREATED_BY,"+
                        "CTR_CREATED_DATE,"+
                        "CTR_STATUS)"+
                        " VALUES "+
                        " (?,?,?,?,?,?,?,?)";

                cmdarr.prepared = cmd;

                $.each(result.T_CLIENT_TRAINING, function(ind, val){
                    var valu = nullTonullString(val);
                    cmdarr.values.push(valu);
                });

                preps.push(cmdarr);
            }

            if(result.T_CLIENT_PRODUCT_CLOSE_INFO && result.T_CLIENT_PRODUCT_CLOSE_INFO.length > 0) {

                var cmdarr = {
                    prepared: null,
                    values : [],
                };

                cmd = "INSERT INTO T_CLIENT_PRODUCT_CLOSE_INFO ("+
                        "CPC_PK,"+
                        "CPC_CLL_PK,"+
                        "CPC_CPM_PK,"+
                        "CPC_BALANCE_AMT,"+
                        "CPC_CLOSING_FEE,"+
                        "CPC_DISBURSE_AMT,"+
                        "CPC_DISBURSE_DATE,"+
                        "CPC_REASON,"+
                        "CPC_MANAGER_REMARK,"+
                        "CPC_MANAGER_PK,"+
                        "CPC_STATUS,"+
                        "CPC_CREATED_BY,"+
                        "CPC_CREATED_DATE,"+
                        "CPC_CHKNEW )"+
                        " VALUES "+
                        " (?,?,?,?,?,?,?,?,?,?,"+
                        "  ?,?,?,0)";

                cmdarr.prepared = cmd;

                $.each(result.T_CLIENT_PRODUCT_CLOSE_INFO, function(ind, val){

                    var valu = [];
                    valu[0] = val[0];
                    valu[1] = val[1];
                    valu[2] = val[2];
                    valu[3] = val[6];
                    valu[4] = val[7];
                    valu[5] = val[8];
                    valu[6] = val[11];
                    valu[7] = val[9];
                    valu[8] = val[10];
                    valu[9] = val[3];
                    valu[10] = val[4];
                    valu[11] = val[5];
                    valu[12] = val[12];

                    var valu2 = nullTonullString(valu);
                    cmdarr.values.push(valu2);

                    // CpcPk
                    // CpcCpmPk
                    // CpcManagerPk
                    // CpcStatus
                    // CpcCreatedBy
                    // CpcBalanceAmt
                    // CpcCloseFee
                    // CpcDisburseAmt
                    // CpcReason
                    // CpcManagerRemark
                    // CpcDisburseDate
                    // CpcCreatedDate
                });

                preps.push(cmdarr);

            }

            if(result.T_CLIENT_EVALUATION && result.T_CLIENT_EVALUATION.length > 0){ //58 fields, instead of listing each of them, automate this with a loop //another method

                var cmdarr = {
                    prepared: null,
                    values : [],
                };

                cmd = "INSERT INTO T_CLIENT_EVALUATION ("+
                        "CLE_PK,"+
                        "CLE_CLT_PK,"+
                        "CLE_CLL_PK,"+
                        "CLE_REVIEW_CODE,"+
                        "CLE_NO_OF_WEEK,"+
                        "CLE_INTERVIEW_LOCATION,"+
                        "CLE_IS_CLIENT_IN_BUSINESS,"+
                        "CLE_NOTE,"+
                        "CLE_IS_BUSINESS_WELL,"+
                        "CLE_REASON,"+
                        "CLE_SCHOOL_FEES_WORK_CAP,"+
                        "CLE_HOUSE_REPAIR_WORK_CAP,"+
                        "CLE_HOME_UTENSILS_WORK_CAP,"+
                        "CLE_CLOTHES_SHOES_WORK_CAP,"+
                        "CLE_MEDICAL_WORK_CAP,"+
                        "CLE_FOOD_WORK_CAP,"+
                        "CLE_CRF_WORK_CAP,"+
                        "CLE_GIVE_LEND_WORK_CAP,"+
                        "CLE_SAVE_WORK_CAP,"+
                        "CLE_REPAY_DEBTS_WORK_CAP,"+
                        "CLE_OTHER_USED_WORK_CAP,"+
                        "CLE_OTHER_WORK_CAP,"+
                        "CLE_SCHOOL_FEES_EXPENSES,"+
                        "CLE_HOUSE_REPAIR_IMPROVEMENT,"+
                        "CLE_HOME_UTENSILS_EQUIPMENT,"+
                        "CLE_CLOTHES_SHOES,"+
                        "CLE_MEDICAL,"+
                        "CLE_FOOD,"+
                        "CLE_CRF,"+
                        "CLE_GIVE_LEND,"+
                        "CLE_SAVE_FOR_EMERGENCY,"+
                        "CLE_REPAY_DEBTS,"+
                        "CLE_OTHER_USED,"+
                        "CLE_OTHER,"+
                        "CLE_OTHER_EXPENSES,"+
                        "CLE_HOUSE_SIZE,"+
                        "CLE_HOUSE_CONDITION,"+
                        "CLE_ROOF_TYPE,"+
                        "CLE_WALL_TYPE,"+
                        "CLE_FLOOR_TYP,"+
                        "CLE_ELETRICITY,"+
                        "CLE_WATER_SRC,"+
                        "CLE_HSE_INX,"+
                        "CLE_CLIENT_MET_LOCATION,"+
                        "CLE_WORKING_CAPITAL,"+
                        "CLE_HB_WORKING_CAPITAL,"+
                        "CLE_FO_REMARKS,"+
                        "CLE_STATUS,"+
                        "CLE_CREATED_BY,"+
                        "CLE_CREATED_DATE,"+
                        "CLE_MOB_NEW)"+
                        " VALUES "+
                        " (?,?,?,?,?,?,?,?,?,?,"+
                        "  ?,?,?,?,?,?,?,?,?,?,"+
                        "  ?,?,?,?,?,?,?,?,?,?,"+
                        "  ?,?,?,?,?,?,?,?,?,?,"+
                        "  ?,?,?,?,?,?,?,?,?,?,"+
                        "  0)";

                cmdarr.prepared = cmd;

                $.each(result.T_CLIENT_EVALUATION, function(ind, val){
                    var valu = nullTonullString(val);
                    cmdarr.values.push(valu);
                });

                preps.push(cmdarr);
            }
 
            if(result.T_LOAN_TYPE) //58 fields, instead of listing each of them, automate this with a loop //another method
                localStorage.setItem("loan_type", JSON.stringify(result.T_LOAN_TYPE));
                // $.each(result['T_LOAN_TYPE'], function(ind, val){

                // });

            //get T_CLIENT_EVALUATION_BIZ AND T_CLIENT_EVAL_BORROWED_FUNDS //another method
            //downside of this is.. can't replace w null/other values/reorder_sequence if server decides not to send data
            var tables = [
                {name:'T_CLIENT_EVALUATION_BIZ', recs:8},
                {name:'T_CLIENT_EVAL_BORROWED_FUNDS', recs:12}
            ];
            $.each(tables,function(tabid, tbl){
                if(result[tbl.name]){
                    $.each(result[tbl.name], function(ind, val){
                        var cmd = 'INSERT INTO '+tbl.name+' VALUES(null,';
                        var noen = tbl.recs;
                        for(var i=0;i<noen;i++){

                            if(val[i] === null) val[i] = "";

                            if(i==noen-1) cmd+= '"'+val[i]+'",0)';
                            else cmd+= '"'+val[i]+'",';
                        }
                        commands.push(cmd);
                    });
                }
            });

            tables = [
                {name:'T_HOUSE_INDEX', recs:7},
                {name:'T_FAMILY_WELFARE', recs:6}
            ];
            $.each(tables,function(tabid, tbl){
                if(result[tbl.name]){
                    $.each(result[tbl.name], function(ind, val){
                        var cmd = 'INSERT INTO '+tbl.name+' VALUES(null,';
                        var noen = tbl.recs;
                        for(var i=0;i<noen;i++){
                            if(i==noen-1) cmd+= '"'+val[i]+'")';
                            else cmd+= '"'+val[i]+'",';
                        }
                        commands.push(cmd);
                    });
                }
            });
            var dt = new Date();
            var time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();
     
            myDB.dbShell.transaction(function(tx){
                for(var c in commands){

                    tx.executeSql(commands[c]);

                }
                for(var e in preps){
                    for(var v in preps[e].values){
                        console.log(preps[e].prepared);
                        console.log(preps[e].values[v].length);
                        tx.executeSql(
                            preps[e].prepared,preps[e].values[v],  function(tx,data){/*console.log(data)*/},function(tx, err){
                            console.log('error '+err.message); 
                            syncmgr.endsync("Error : " + err.message  );
                        });
                    }
                } 
            }, function(err){
                console.log("Error : " + err.message  );
                syncmgr.endsync("Error : " + err.message  );
                return false;
            }, function(suc){
                // syncmgr.endsync("Successfully synced.");
                syncmgr.synclog(i18n.t("messages.SyncSuccess"));
                var dt = new Date();
                var time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();
                // console.log("done - "+time);
                if(devtest){
                    //login();
                    ResponseFO('Pull');
                } else {
                    ResponseFO('Pull');
                } 
            });

        });
    };

    /******************************************
    // UI for sync box
    ******************************************/

    //display messages in the box
    this.synclog = function(text){
        // var syncbox = $("#synclog");
        // if(syncbox){syncbox.html(text);}
        swal({
            type: 'success',
            title: text
        })
    };

    //display messages with a button to close
    this.endsync = function(text){
        // var syncbox = $("#synclog");
        // if(syncbox) syncbox.html(text);

        swal({
            type: 'error',
            title: text
        })

        // var quit = $('<button>Close</button>');
        // quit.on('click', function(){syncmgr.closebox();});
        // quit.hide().appendTo(syncbox).fadeIn();
        // syncbox.trigger("create");
    };

    //close the spinning wheel
    this.closebox = function(){
        $.mobile.loading("hide");
    };

}
/******************************************
//Prepare the  UI
******************************************/
function init(){

    initTemplate.load(1); //load header

    $("select").each(function(){ //change select menu
        $(this).closest('.ui-btn').css('background-color','#80C6C7');
        $(this).closest('.ui-btn').css('color','#fff');
        $(this).closest('.ui-btn').css('text-shadow','0 0 0 #fff');
    });

    $(".back").each(function(){ //append a back button for detailed group view page
        $(this).prepend('<a href="#page" style="margin-left:1em;" class="left ui-btn ui-btn-g ui-corner-all ui-icon-carat-l ui-btn-icon-left ui-btn-inline" data-i18n="buttons.Back">Back</a>');
    });
}



/******************************************
//Global variables
******************************************/

var USER_PK             = sessionStorage.getItem("USER_PK");
var USER_NAME           = sessionStorage.getItem("USER_NAME");
var USER_HAVE_SIG       = sessionStorage.getItem("USER_HAVE_SIG");
var USER_SIGNED         = (sessionStorage.getItem("USER_HAVE_SIG") == 'Y' ? true : false );
var BRC_PK              = sessionStorage.getItem("BRC_PK");
var BRC_NAME            = sessionStorage.getItem("BRC_NAME");
var BRC_PHONE           = sessionStorage.getItem("BRC_PHONE");
var CMP_NAME            = sessionStorage.getItem("CMP_NAME");

var MGR_PK              = sessionStorage.getItem("MGR_PK");
var MGR_ID              = sessionStorage.getItem("MGR_ID");
var MGR_NAME            = sessionStorage.getItem("MGR_NAME");
var MGR_HAVE_SIG        = sessionStorage.getItem("MGR_HAVE_SIG");
var MGR_SIG             = sessionStorage.getItem("MGR_SIG");
var MGR_SIGNED          = (sessionStorage.getItem("MGR_HAVE_SIG") == 'Y' ? true : false );

var BRC_BRANCH_ID       = sessionStorage.getItem("BRC_BRANCH_ID");
var USER_ID             = sessionStorage.getItem("USER_ID");
var USER_CTR_ID         = sessionStorage.getItem("USER_CTR_ID");
var USER_CTR_NAME       = sessionStorage.getItem("USER_CTR_NAME");

var CMP_SMS_FORMAT      = sessionStorage.getItem("CMP_SMS_FORMAT");
var CMP_RECEIPT_FORMAT  = sessionStorage.getItem("CMP_RECEIPT_FORMAT");
var CMP_SMS_LABEL       = sessionStorage.getItem("CMP_SMS_LABEL");
var CMP_RECEIPT_LABEL   = sessionStorage.getItem("CMP_RECEIPT_LABEL");
var SMS_OR_RECEIPT      = sessionStorage.getItem("SMS_OR_RECEIPT");

var msg_separator       = '@@@@prodigy@@@@';

var SMS_RCP_CODE        = ['DT','FONM','FOID','BR','BRID','CLNM','CLID','INSTNO','AMT'];

//BEFORE PRODUCTION FIND AND REMOVE ALL LINES TAGGED WITH = !REMOVE

/******************************************
//Controller
******************************************/
//Temp modification;
//CMP_RECEIPT_FORMAT += ",CLNM , CLID, INSTNO, AMT, SAV"; //!remove in production



var myApp = angular.module('myApp',['ng-currency', 'pascalprecht.translate']);

myApp.config(function ($translateProvider) {

     $translateProvider.useStaticFilesLoader({
        prefix: "locales/locale-",
        suffix: ".json"
    });

    $translateProvider.preferredLanguage(ln.language.code);

});


angular.module('myApp').filter('ifEmpty', function() {
    return function(input, defaultValue) {
        if (angular.isUndefined(input) || input === null || input === '') {
            return defaultValue;
        }

        return input;
    };
});



myApp.controller('MeetingCtrl', function($scope, $filter, $timeout, $compile){

    $scope.user = {
        userPK:USER_PK,
        userName:USER_NAME,
        userHaveSig:USER_HAVE_SIG,
        branchPK:BRC_PK,
        branchName:BRC_NAME,
        companyName:CMP_NAME,
        branchID:BRC_BRANCH_ID,
        branchPhone:BRC_PHONE,
        centreID:USER_CTR_ID,
        centreName:USER_CTR_NAME,
        groups:[],
        selectedGroup:null,
        SMS_SENT: 'N',
        RECEIPT_SENT: 'N',
        clients:[],
        hasSigned: USER_SIGNED,
        currentVillage: null,
        Signature: null
    };

    //console.log($scope.user.hasSigned);

    $scope.MGR = {
        mgrpk: MGR_PK,
        mgrname: MGR_NAME,
        mgrhavesig: MGR_HAVE_SIG,
        hasSigned: MGR_SIGNED,
        Signature: MGR_SIG
    };

    $scope.showSign = false;
    $scope.signingclientIndex = null;
    $scope.signinguser = null;

    $scope.selectedGroup = {
        name: null,
        value: null,
        center: null,

    };

    $scope.selectedCenter = {
        name: null,
        value: null
    };

    $scope.changetype = "center";

    $scope.clients = [];

    $scope.currentVillage= null;
    $scope.curr_village = null;
    $scope.selectVillage = [];

    $scope.currloc = '';
    $scope.BRC_DISBURSE_NOTIFICATION = sessionStorage.getItem("SMS_OR_RECEIPT");
    $scope.bpmproducts=[];
    $scope.withdrawals = [];
    $scope.isLoanTable = true;
    $scope.isGroupSelected = false;
    $scope.maxPrdTxn_CPT_PK = 0;
    $scope.clientspage = 1;
    $scope.currentVillage = localStorage.getItem('currentVillage_name');
    $scope.groups = [];
    $scope.village = {
        groups: []
    };
    $scope.timeline = [];
    $scope.foschedule = [];
    $scope.changedDates = [];
    $scope.groupsChanged = [];
    $scope.CMD_COUNT = 0;

    $scope.choosetxt = '';

    setTimeout(() => {
        $scope.choosetxt = i18n.t("messages.Choose");
    }, 300);


    $scope.getChangedMeetings = function(){
        myDB.execute("SELECT * FROM T_CHANGE_MEETING_DATE",function(results){
            $scope.CMD_COUNT = results.length;
        });
    };

    $scope.updateVillage = function(obj){
        var keypair = { 'name': obj.value, 'value': obj.value  };
        //console.log(obj);
        //console.log($scope.currentVillage);
        //console.log(localStorage.getItem('currentVillage_name'));

        $scope.currentVillage = obj.name;
        setTimeout(function(){
            $scope.$apply();
            $scope.loadGroup();
            $scope.taskUpd = 1;
        },100);
    };

    $scope.getNextWeekDate = function(){

        var anotherdate = new Date();
        anotherdate = anotherdate.getFullYear()+"-"+("0"+(anotherdate.getMonth()+1)).slice(-2)+"-"+("0"+anotherdate.getDate()).slice(-2);

        var date = new Date();
        date = ("0"+date.getDate()).slice(-2)+"/"+("0"+(date.getMonth()+1)).slice(-2)+"/"+date.getFullYear();


        var crs = " SELECT (CRS_ACTUAL_WEEK_NO + 1) AS ACTUAL_WEEK, CRS_CLT_PK FROM T_CLIENT_REPAY_SCHEDULE WHERE CRS_CLT_PK IN (SELECT DISTINCT CLT_PK FROM T_CLIENT WHERE CAST(CLT_CENTER_ID AS INTEGER)="+$scope.selectedCenter.CTR_CENTER_PK+" ) AND CRS_LOAN_SAVING_FLAG='L' AND CRS_DATE='"+date+"'";
        //console.log(crs);
        myDB.execute(crs,function(res){
            //console.log(res);
            //console.log(res[0].ACTUAL_WEEK);
            // var crs2 = "UPDATE T_CLIENT_REPAY_SCHEDULE SET CRS_LOAN_SAVING_FLAG = 'X' WHERE CRS_DATE = (SELECT CRS_DATE FROM T_CLIENT_REPAY_SCHEDULE WHERE CRS_ACTUAL_WEEK_NO="+res[0].ACTUAL_WEEK+" AND CRS_CLT_PK="+res[0].CRS_CLT_PK+" LIMIT 1 ) AND CRS_LOAN_SAVING_FLAG='S' AND CRS_CLT_PK IN (SELECT DISTINCT CLT_PK FROM T_CLIENT WHERE CAST(CLT_CENTER_ID AS INTEGER)="+$scope.selectedCenter.CTR_CENTER_PK+"  )  ";

            // myDB.execute(crs2,function(res){
            //     //console.log(res);
            // });
        });

    };

    $scope.loadVillages = function(){
        /******************************************
         Display village names
        ******************************************/

        var currVille = 0;
        if(localStorage.getItem('currentVillage') !== null){
            currVille = localStorage.getItem('currentVillage');
        }

        //console.log(currVille);

        myDB.execute("SELECT * FROM T_VILLAGE_MASTER, T_CENTER_MASTER WHERE VLM_PK = ctr_vlm_pk", function(results){

                $scope.user.selectVillage = [];
                for(var k in results){

                    var keypair = { name: results[k].VLM_NAME, value: results[k].VLM_PK , center: results[k].CTR_CENTER_NAME };

                    $scope.selectVillage.push(keypair);

                    if(currVille!==null && currVille!== undefined && currVille == results[k].VLM_PK){
                        $scope.curr_village = keypair;
                        $scope.village = keypair;
                        $scope.village.groups = [];
                    }

                    var cnt = parseInt(k) + parseInt(1);
                    if(results.length === cnt){

                    }

                }
                setTimeout(function(){
                    if($scope.changetype == 'group')$scope.loadGroup();
                    if($scope.changetype == 'center') $scope.loadCenter();
                },50);
        });
    };




    $scope.totalcliencount = 0;
    $scope.viilletotal = function(){
        $scope.$apply();
        var date = new Date();
        date = ("0"+date.getDate()).slice(-2)+"/"+("0"+(date.getMonth()+1)).slice(-2)+"/"+date.getFullYear();

        var anotherdate = new Date();
        anotherdate = anotherdate.getFullYear()+"-"+("0"+(anotherdate.getMonth()+1)).slice(-2)+"-"+("0"+anotherdate.getDate()).slice(-2);

        var cmd =   " SELECT * FROM T_CLIENT ";
            cmd +=  " WHERE CLT_VILLAGE="+ $scope.curr_village.value;
            cmd +=  " AND CLT_STATUS !=2 ";

        myDB.execute(cmd, function(results){
            $scope.totalcliencount = results.length;
            //console.log(results);
            if(results.length > 0) {
                $.each(results, function(ind,client){

                    $scope.clients.push(client);
                    if($scope.clients.length === $scope.totalcliencount){
                        //console.log('done');
                        $scope.$apply();
                    }

                });

            }
        });

    };

    /*######################################################

        GROUP CHANGES

    ########################################################*/

    $scope.loadGroup = function(){

        //Translations dont seems to work with ng-repeat in html, thus resulted in this method

        $scope.request = i18n.t("messages.Request");
        $scope.expected = i18n.t("messages.Expected");
        $scope.loanamt = i18n.t("messages.LoanAmt");
        $scope.grouptext = i18n.t("messages.Group");
        $scope.weektext = i18n.t("messages.Week");
        $scope.weektext = i18n.t("messages.Week");
        $scope.producttext = i18n.t("messages.Product");
        $scope.deposittext = i18n.t("messages.DepositAmt");


        var date = new Date();
        date = date.getFullYear()+"-"+("0"+(date.getMonth()+1)).slice(-2)+"-"+("0"+date.getDate()).slice(-2);

        //RESET GROUPS DATA
        $scope.groups = [];
        $scope.village.groups = [];

        setTimeout(function(){

            var cmd =   " SELECT distinct CLT_GROUP_ID, clt_village,vlm_name, COUNT(T_CLIENT.CLT_PK) as clientcount, CTR_PK, CTR_CENTER_NAME, CTR_CENTER_ID, CTR_MEETING_DATE, CTR_MEETING_TIME ";
                cmd +=  " FROM T_CLIENT, T_VILLAGE_MASTER, T_CENTER_MASTER ";
                cmd +=  " WHERE clt_village = VLM_PK ";
                cmd +=  " AND VLM_PK = CTR_VLM_PK ";
                cmd +=  " AND CLT_CENTER_ID = CTR_PK ";
                cmd +=  " AND CLT_STATUS != 2 ";
                cmd +=  " AND clt_village="+$scope.curr_village.value;
            //console.log(cmd);
            //retrieve all the groups that are tagged to the user
            myDB.execute(cmd, function(results){
                //console.log(results);
                if(results.length<=0) {

                }else{

                    for(var k in results){
                        $scope.groups.push(results[k]);
                        var cnt = parseInt(k) + 1;
                        if(results.length === cnt){

                        }
                    }
                    setTimeout(function(){
                        $scope.viilletotal();
                    },50);
                }
            });
        },0);
    };



    $scope.changeGroup = function(group){

        alert(group.CTR_CENTER_ID);

        $scope.selectedGroup.name = group.VLM_NAME;
        $scope.selectedGroup.value = group.CLT_GROUP_ID;
        $scope.selectedGroup.center = group.CTR_CENTER_NAME;
        $scope.selectedGroup.CTR_CENTER_PK = group.CTR_PK;
        $scope.selectedGroup.CTR_CENTER_ID = group.CTR_CENTER_ID;
        $scope.selectedGroup.CTR_MEETING_DATE = group.CTR_MEETING_DATE;
        $scope.selectedGroup.CTR_MEETING_TIME = group.CTR_MEETING_TIME;

        //console.log($scope.selectedGroup);

    };


    $scope.LoadFoSchedule = function(){

        var cmd =   "SELECT CLG_ID, CTR_CENTER_NAME, CTR_MEETING_TIME, CTR_MEETING_DATE,  GROUP_CONCAT( DISTINCT CLG_ID ) as group_list ";
        cmd     +=  " FROM T_CENTER_MASTER, T_CLIENT_GROUP ";
        cmd     +=  " WHERE CTR_FO_PK ="+USER_PK+" GROUP BY CTR_CENTER_NAME ";

        myDB.execute(cmd,function(results){
            //console.log(results);
            $.each(results, function(i,center){

                var ctr = {
                    CLG_ID: center.CLG_ID,
                    CTR_CENTER_NAME: center.CTR_CENTER_NAME,
                    CTR_MEETING_TIME: center.CTR_MEETING_TIME,
                    CTR_MEETING_DATE: center.CTR_MEETING_DATE,
                    group_list : center.group_list.replace(/,/g,', '),
                    type:'normal'
                };

                $scope.foschedule.push(ctr);

            });

            $scope.loadChangedSchedule();

        });
    };

    $scope.loadChangedSchedule = function(){


        var cmd =   "SELECT CMD.*, GROUP_CONCAT(CMD.CMD_GROUP_ID) as group_list,CTR_CENTER_NAME  ";
        cmd     +=  " FROM T_CHANGE_MEETING_DATE AS CMD, T_CENTER_MASTER ";
        cmd     +=  " WHERE CMD.CMD_CENTER_ID = CTR_CENTER_ID ";
        myDB.execute(cmd,function(results){
            console.log(results);
            if(results[0].CMD_GROUP_ID !== null){
                $.each(results,function(i,res){

                    $scope.addtoChanged(res.CTR_CENTER_NAME,res.CMD_GROUP_ID);  // To to list of changed groups to lock them

                    var ctr = {
                        CLG_ID: res.CMD_GROUP_ID,
                        CTR_CENTER_NAME: res.CTR_CENTER_NAME,
                        CTR_MEETING_TIME: res.CMD_NEW_MEEETING_TIME,
                        CTR_MEETING_DATE: res.CMD_NEW_MEETING_DAY,
                        group_list : res.group_list.replace(/,/g,', '),
                        type: 'changed'
                    };

                    $.each($scope.foschedule,function(i,val){
                        if(val.CTR_CENTER_NAME == ctr.CTR_CENTER_NAME){
                            if(val.group_list.indexOf(ctr.CLG_ID) > -1){
                                var grps = val.group_list.split(', ');
                                var new_group = "";
                                $.each(grps,function(i,grp){
                                    if(grp == ctr.CLG_ID){
                                        grps.splice(i,1);
                                    }
                                });
                                if(grps.length > 0){
                                    val.group_list = grps.join(", ");
                                } else {
                                    $scope.foschedule.splice(i,1);
                                }

                            }
                        }
                    });

                    //$scope.changedDates.push(ctr);
                    $scope.foschedule.push(ctr);


                });
            }
            //console.log($scope.foschedule);
            $scope.loadTimeLine();
        });

    };

    $scope.loadTimeLine = function(){

        var d_start = 1;
        var d_end = 8;
        var t_start = 8;
        var t_end = 17;

        var fosasdscd = $filter('filter')($scope.foschedule, { CTR_MEETING_DATE: 4 });
        //console.log($scope.foschedule);
        //console.log(fosasdscd);
        if(fosasdscd.length > 0){
            $.each(fosasdscd,function(i,fos){
                var t = fos.CTR_MEETING_TIME;
                var h = t.split(":")[0];
                //console.log(h+"    "+fos.CTR_CENTER_NAME);

            });
        }

        for(var i=t_start; i <=t_end; i++){

            var key = { hour: i, day: [],  center: null, time: null};

            for(var d=d_start; d <=d_end; d++){

                var day = {
                    dindex: d,
                    center: null,
                    time:null,
                    groups:null,
                    type:null
                };

                var foscd = $filter('filter')($scope.foschedule, { CTR_MEETING_DATE: d });
                if(foscd.length > 0){
                    $.each(foscd,function(i,fos){
                        var t = fos.CTR_MEETING_TIME;
                        var h = t.split(":")[0];
                        if(parseInt(key.hour) == parseInt(h)){
                            day.center = fos.CTR_CENTER_NAME;
                            day.time = fos.CTR_MEETING_TIME;
                            day.groups = fos.group_list;
                            day.type = fos.type;
                        }
                    });
                }

                key.day.push(day);

            }

            $scope.timeline.push(key);

        }
    };


    $scope.chooseDate = function(scd, day){

        if($scope.checkChanged()){
            swal(i18n.t("messages.NewTimeSlotSaved"));
            return false;
        }


        swal({
            title: i18n.t("messages.Alert"),
            text: i18n.t("messages.ConfirmChangeMeetingDate"),
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#80C6C7",
            confirmButtonText: i18n.t("messages.Yes")
        }).then(function(isConfirm){
            if(isConfirm){

                if(day.center == $scope.selectedGroup.center){
                    if(day.groups.indexOf($scope.selectedGroup.value) > -1){
                        swal(i18n.t("messages.CenterInTimeSlot")); // GROUP EXIST IN THIS TIME SLOT
                        return false;
                    }
                } else if(day.center !== null) {
                    swal(i18n.t("messages.GroupDontBelongtoCenter")); //GROUP DONT BELONG TO THIS CENTER
                    return false;
                }

                swal.close();

                day.center = $scope.selectedGroup.center;

                var time = "";
                if(scd.hour > 11) time = scd.hour+":00:00 PM";
                else time = scd.hour+":00:00 AM";

                day.time = time;

                $.each($scope.timeline,function(i,val){ // LOOP ARRAY
                    $.each(val.day,function(i,vday){   // LOOP DAY
                        if(vday.groups !== null && vday.center == $scope.selectedGroup.center){
                            if(vday.groups.indexOf($scope.selectedGroup.value) > -1){  //FIND IF GROUP EXISTS IN OTHER TIME SLOT
                                var grps = vday.groups.split(', ');
                                var new_group = "";
                                $.each(grps,function(i,grp){
                                    if(grp == $scope.selectedGroup.value){
                                        grps.splice(i,1);  // REMOVE GROUP FROM OLD TIME SLOT
                                    }
                                });
                                vday.groups = grps.join(", ");
                            }
                        }

                    });
                });

                if(day.groups === null) {
                    day.groups = $scope.selectedGroup.value;
                } else {
                    day.groups += ", "+$scope.selectedGroup.value;
                }
                //console.log($scope.selectedGroup);
                var newcount = parseInt($scope.CMD_COUNT) + 1;

                var cmd =   "INSERT INTO T_CHANGE_MEETING_DATE VALUES(null,"+
                            newcount+", "+
                            "'"+$scope.selectedGroup.value+"', "+
                            $scope.selectedGroup.CTR_CENTER_PK+", "+
                            "'"+$scope.selectedGroup.CTR_CENTER_ID+"', "+
                            $scope.selectedGroup.CTR_MEETING_DATE+", "+
                            "'"+$scope.selectedGroup.CTR_MEETING_TIME+"', "+
                            day.dindex+", "+
                            "'"+time+"', "+
                            "56, "+
                            "'', "+ // 49 ?
                            USER_PK+", "+
                            "'"+moment().format('DD/MM/YYYY HH:mm:ss')+"', "+
                            "1)";

                //console.log(cmd);

                //Change next weeks savings crs_loan_saving to 'X' to omit it ot
                $scope.getNextWeekDate();

                var anotherdate = new Date();
                anotherdate = anotherdate.getFullYear()+"-"+("0"+(anotherdate.getMonth()+1)).slice(-2)+"-"+("0"+anotherdate.getDate()).slice(-2);

                //var crs = "SELECT ACTUAL_WEEK FROM SELECT (CRS_ACTUAL_WEEK_NO + 1) AS ACTUAL_WEEK FROM T_CLIENT_REPAY_SCHEDULE WHERE CRS_CLT_PK IN (SELECT DISTINCT CLT_PK FROM T_CLIENT WHERE CLT_CENTER_ID="+$scope.selectedGroup.CTR_CENTER_PK+" AND CLT_GROUP_ID="+$scope.selectedGroup.value+") AND CRS_LOAN_SAVING_FLAG='L' AND CRS_DATE='"+anotherdate+"' LIMIT 1";

                myDB.execute(cmd,function(results){

                    $scope.addtoChanged($scope.selectedGroup.CTR_MEETING_NAME,$scope.selectedGroup.value);

                    $scope.$apply();
                });
            }

        },function(){

        });
    };

    $scope.checkChanged = function(center,group){

        var changed = $filter('filter')($scope.groupsChanged, { center: center });
        changed = $filter('filter')(changed, { group: group });
        if(changed.length > 0){
            return true;
        }


        return false;

    };

    $scope.changesInGroup = function(group){

        var sum = 0;

        $.each($scope.groupsChanged,function(i,grp){
            if(grp = group ) sum ++;
        });
        return sum;
    };

    $scope.addtoChanged = function(center,group){

        var key= {
            center: center,
        };

        var exists = false;
        for(var k in $scope.centerChanged){
            if($scope.centerChanged[k].center == center){

                exists = true;
            }
        }

        if(!exists){
            $scope.centerChanged.push(key);
        }

    };


    /*######################################################

        CENTER CHANGES

    ########################################################*/

    $scope.foschedulebycenter = [];
    $scope.changedDates = [];
    $scope.centerChanged = [];
    $scope.centers = [];

    $scope.changeCenter = function(center){

        $scope.selectedCenter.name = center.VLM_NAME;
        $scope.selectedCenter.value = center.CLT_GROUP_ID;
        $scope.selectedCenter.groups = [];
        $scope.selectedCenter.center = center.CTR_CENTER_NAME;
        $scope.selectedCenter.CTR_CENTER_PK = center.CTR_PK;
        $scope.selectedCenter.CTR_CENTER_ID = center.CTR_CENTER_ID;
        $scope.selectedCenter.CTR_MEETING_DATE = center.CTR_MEETING_DATE;
        $scope.selectedCenter.CTR_MEETING_TIME = center.CTR_MEETING_TIME;
        $scope.selectedCenter.CTR_CENTER_NAME = center.CTR_CENTER_NAME; 
        
        let query = "SELECT CLG_PK FROM T_CLIENT_GROUP WHERE CLG_CTR_PK="+center.CTR_PK;
        console.log(query);
        myDB.execute(query,function(res){
            console.log(res);
            for(var k in res){
                $scope.selectedCenter.groups.push(res[k].CLG_PK);
            }
        });

        console.log($scope.selectedCenter);

    };

    $scope.loadCenter = function(){
        if($scope.curr_village === null) return false;
        //Translations dont seems to work with ng-repeat in html, thus resulted in this method

        $scope.request = i18n.t("messages.Request");
        $scope.expected = i18n.t("messages.Expected");
        $scope.loanamt = i18n.t("messages.LoanAmt");
        $scope.grouptext = i18n.t("messages.Group");
        $scope.weektext = i18n.t("messages.Week");
        $scope.weektext = i18n.t("messages.Week");
        $scope.producttext = i18n.t("messages.Product");
        $scope.deposittext = i18n.t("messages.DepositAmt");


        var date = new Date();
        date = date.getFullYear()+"-"+("0"+(date.getMonth()+1)).slice(-2)+"-"+("0"+date.getDate()).slice(-2);

        //RESET GROUPS DATA
        $scope.centers = [];
        $scope.village.groups = [];

        setTimeout(function(){

            var cmd =   " SELECT distinct c.clt_village, CAST(c.CLT_CENTER_ID as INTEGER) as CLT_CENTER_ID, vm.vlm_name, COUNT(c.CLT_PK) as clientcount, cm.CTR_PK, cm.CTR_CENTER_NAME, cm.CTR_PK, cm.CTR_CENTER_ID, cm.CTR_MEETING_DATE, cm.CTR_MEETING_TIME ";
                cmd +=  " FROM T_VILLAGE_MASTER as vm ";
                cmd +=  " LEFT JOIN T_CLIENT as c oN (c.clt_village = vm.VLM_PK AND c.CLT_STATUS != 2)";
                cmd +=  " LEFT JOIN T_CENTER_MASTER as cm ON (vm.VLM_PK = cm.CTR_VLM_PK AND CAST(c.CLT_CENTER_ID as INTEGER) = cm.CTR_PK ) ";
                cmd +=  " WHERE ";
                cmd +=  "  ";
                cmd +=  "    vm.VLM_PK="+$scope.curr_village.value;
                cmd +=  " GROUP BY cm.CTR_PK ";
            console.log(cmd);
            //retrieve all the groups that are tagged to the user
            myDB.execute(cmd, function(results){
                console.log(results);
                if(results.length<=0) {

                }else{

                    for(var k in results){
                        $scope.centers.push(results[k]);
                        var cnt = parseInt(k) + 1;
                        if(results.length === cnt){

                        }
                    }
                    setTimeout(function(){
                        $scope.viilletotal();
                    },50);
                }
            });
        },0);
    };

    $scope.chooseDateforCenter = function(scd, day){

        if($scope.checkChanged()){
            swal(i18n.t("messages.NewTimeSlotSaved"));
            return false;
        }

        var newDay = "";
        var newTime ="";

        console.log($scope.selectedCenter);

        swal({
            title: i18n.t("messages.Alert"),
            text: i18n.t("messages.ConfirmChangeMeetingDate"),
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#80C6C7",
            confirmButtonText: i18n.t("messages.Yes")
        }).then(function(isConfirm){
            if(isConfirm.value){
                if(day.center == $scope.selectedCenter.center){
                    if(day.center.indexOf($scope.selectedGroup.value) > -1){
                        swal(i18n.t("messages.CenterInTimeSlot")); // GROUP EXIST IN THIS TIME SLOT
                        return false;
                    }
                } else if(day.center !== null) {
                    swal(i18n.t("messages.CenterInTimeSlot")); //GROUP DONT BELONG TO THIS CENTER
                    return false;
                }

                swal.close(); 
                setTimeout(function(){
                    $scope.$apply(function(){
                        $.each($scope.timeline,function(i,val){ // LOOP ARRAY
                            $.each(val.day,function(i,vday){   // LOOP DAY
                                if(vday.center !== null && vday.center == $scope.selectedCenter.CTR_CENTER_NAME){
                                    if(vday.center.indexOf($scope.selectedCenter.CTR_CENTER_NAME) > -1){  //FIND IF GROUP EXISTS IN OTHER TIME SLOT

                                        vday.center = "";
                                        vday.type = null;
                                        // var grps = vday.center.split(', ');
                                        // var new_center = "";
                                        // $.each(grps,function(i,grp){
                                        //     if(grp == $scope.selectedGroup.center){
                                        //         grps.splice(i,1);  // REMOVE GROUP FROM OLD TIME SLOT
                                        //     }
                                        // });
                                        // vday.groups = grps.join(", ");
                                    }
                                }

                            });
                        });
                    });
                },1);
                day.center = $scope.selectedCenter.CTR_CENTER_NAME;

                var time = "";
                if(scd.hour > 11) time = scd.hour+":00:00";
                else time = scd.hour+":00:00";

                day.time = time;

                newTime = time;

                console.log($scope.timeline);
                console.log($scope.selectedCenter);

                // if(day.groups === null) {
                //     day.groups = $scope.selectedGroup.value;
                // } else {
                //     day.groups += ", "+$scope.selectedGroup.value;
                // }

                var newcount = parseInt($scope.CMD_COUNT) + 1;

               var qryvalues = [];

               var delQuery = "DELETE FROM T_CHANGE_MEETING_DATE WHERE CMD_CENTER_PK="+$scope.selectedCenter.CTR_CENTER_PK;

               myDB.execute(delQuery,function(res){
                  if(res){
                  var qry =   "INSERT INTO T_CHANGE_MEETING_DATE ("+
                                " CMD_PK, "+
                                " CMD_GROUP_ID,"+
                                " CMD_CENTER_PK,"+
                                " CMD_CENTER_ID,"+
                                " CMD_OLD_MEETING_DAY,"+
                                " CMD_OLD_MEETING_TIME,"+
                                " CMD_NEW_MEETING_DAY,"+
                                " CMD_NEW_MEEETING_TIME,"+
                                " CMD_STATUS, "+
                                " CMD_FUP_PK,"+
                                " CMD_CREATED_BY,"+
                                " CMD_CREATED_DATE,"+
                                " CMD_NEW )"+
                                " VALUES "+
                                "   (?,?,?,?,?,?,?,?,?,?,"+
                                "    ?,?,?)";

                    $.each($scope.selectedCenter.groups,function(i,grp){
                        var vals = [
                                        newcount,
                                        grp,
                                        $scope.selectedCenter.CTR_CENTER_PK,
                                        $scope.selectedCenter.CTR_CENTER_ID+"",
                                        $scope.selectedCenter.CTR_MEETING_DATE,
                                        $scope.selectedCenter.CTR_MEETING_TIME,
                                        day.dindex,
                                        time,
                                        56,
                                        '',
                                        USER_PK,
                                        moment().format('DD/MM/YYYY HH:mm:ss'),
                                        1
                                    ];

                        qryvalues.push(vals);

                    });
                    $scope.addtoChanged($scope.selectedCenter.CTR_CENTER_NAME,$scope.selectedGroup.value);
                    var initial = $scope.foschedulebycenter;
                    console.log(initial);

                    var updated = false;
                    $.each($scope.foschedulebycenter,function(i,fsc){

                        if(fsc.CTR_CENTER_NAME == $scope.selectedCenter.CTR_CENTER_NAME){
                            updated= true;
                            //$scope.foschedulebycenter.splice(i,1);
                            var ctr = {

                                    CTR_CENTER_NAME: $scope.selectedCenter.CTR_CENTER_NAME,
                                    CTR_MEETING_TIME: time,
                                    CTR_MEETING_DATE: day.dindex,
                                    type:'changed'
                            };
                            $scope.foschedulebycenter[i] = ctr;
                            //$scope.foschedulebycenter.push(ctr);
                        }
                    });
                    if(!updated){

                        var ctr = {

                            CTR_CENTER_NAME: $scope.selectedCenter.CTR_CENTER_NAME,
                            CTR_MEETING_TIME: time,
                            CTR_MEETING_DATE: day.dindex,
                            type:'changed'
                        };
                        //$scope.foschedulebycenter.push(ctr);
                    }
                    console.log($scope.foschedulebycenter);



                    myDB.dbShell.transaction(function(tx){
                        for(var v in qryvalues){
                            tx.executeSql(qry,qryvalues[v],function(tx,data){ },function(tx,err){

                            });
                        }


                    }, function(err){
                        console.log("Error : " + err.message  );
                        return false;
                    }, function(suc){
                         console.log("successfully saved");
                        //$scope.addtoChanged($scope.selectedGroup.center,$scope.selectedGroup.value);
                        $scope.$apply();


                    });

                    //Change next weeks savings crs_loan_saving to 'X' to omit it ot
                    // $scope.getNextWeekDate();

                    // var anotherdate = new Date();
                    // anotherdate = anotherdate.getFullYear()+"-"+("0"+(anotherdate.getMonth()+1)).slice(-2)+"-"+("0"+anotherdate.getDate()).slice(-2);
                    $scope.loadTimeLineByCenter();
                  }
               });


                //var crs = "SELECT ACTUAL_WEEK FROM SELECT (CRS_ACTUAL_WEEK_NO + 1) AS ACTUAL_WEEK FROM T_CLIENT_REPAY_SCHEDULE WHERE CRS_CLT_PK IN (SELECT DISTINCT CLT_PK FROM T_CLIENT WHERE CLT_CENTER_ID="+$scope.selectedGroup.CTR_CENTER_PK+" AND CLT_GROUP_ID="+$scope.selectedGroup.value+") AND CRS_LOAN_SAVING_FLAG='L' AND CRS_DATE='"+anotherdate+"' LIMIT 1";

                // myDB.execute(cmd,function(results){

                //     $scope.addtoChanged($scope.selectedGroup.center,$scope.selectedGroup.value);

                //     $scope.$apply();
                // });
            }

        },function(){

        });
    };

    $scope.changeGroup = function(group){

        alert(group.CTR_CENTER_ID);

        $scope.selectedGroup.name = group.VLM_NAME;
        $scope.selectedGroup.value = group.CLT_GROUP_ID;
        $scope.selectedGroup.center = group.CTR_CENTER_NAME;
        $scope.selectedGroup.CTR_CENTER_PK = group.CTR_PK;
        $scope.selectedGroup.CTR_CENTER_ID = group.CTR_CENTER_ID;
        $scope.selectedGroup.CTR_MEETING_DATE = group.CTR_MEETING_DATE;
        $scope.selectedGroup.CTR_MEETING_TIME = group.CTR_MEETING_TIME;

        //console.log($scope.selectedGroup);

    };


    $scope.LoadFoScheduleByCenter = function(){

        var cmd =   "SELECT CLG_ID, CTR_CENTER_NAME, CTR_CENTER_ID, CTR_MEETING_TIME, CTR_MEETING_DATE";
        cmd     +=  " FROM T_CENTER_MASTER, T_CLIENT_GROUP ";
        cmd     +=  " WHERE CTR_FO_PK ="+USER_PK+ " GROUP BY CTR_CENTER_NAME";

        myDB.execute(cmd,function(results){
            //console.log(results);
            $.each(results, function(i,center){

                var ctr = {
                    CLG_ID: center.CLG_ID,
                    CTR_CENTER_ID: center.CTR_CENTER_ID,
                    CTR_CENTER_NAME: center.CTR_CENTER_NAME,
                    CTR_MEETING_TIME: center.CTR_MEETING_TIME,
                    CTR_MEETING_DATE: center.CTR_MEETING_DATE,
                    type:'normal'
                };

                $scope.foschedulebycenter.push(ctr);

            });

            $scope.loadChangedScheduleByCenter();

        });
    };

    $scope.loadChangedScheduleByCenter = function(){


        var cmd =   "SELECT CMD.* ,CTR_CENTER_NAME  ";
        cmd     +=  " FROM T_CHANGE_MEETING_DATE AS CMD, T_CENTER_MASTER ";
        cmd     +=  " WHERE CMD.CMD_CENTER_ID = CTR_CENTER_ID ";
        cmd 	+=  " GROUP BY CMD_CENTER_ID ";
        myDB.execute(cmd,function(results){
            //console.log(results);

            $.each(results,function(i,res){
            	console.log(res);
                $scope.addtoChanged(res.CTR_CENTER_NAME,res.CMD_GROUP_ID);  // To to list of changed groups to lock them

                var ctr = {
                    CTR_CENTER_NAME: res.CTR_CENTER_NAME,
                    CTR_MEETING_TIME: res.CMD_NEW_MEEETING_TIME,
                    CTR_MEETING_DATE: res.CMD_NEW_MEETING_DAY,
                    type: 'changed'
                };

                // $.each($scope.foschedulebycenter,function(i,val){
                //     if(val.CTR_CENTER_NAME == ctr.CTR_CENTER_NAME){

                //     }
                // })

                // $.each($scope.foschedulebycenter,function(i,val){
                //     if(val.CTR_CENTER_NAME == ctr.CTR_CENTER_NAME){
                //         if(val.group_list.indexOf(ctr.CLG_ID) > -1){
                //             var grps = val.group_list.split(', ');
                //             var new_group = "";
                //             $.each(grps,function(i,grp){
                //                 if(grp == ctr.CLG_ID){
                //                     grps.splice(i,1);
                //                 }
                //             });
                //             if(grps.length > 0){
                //                 val.group_list = grps.join(", ");
                //             } else {
                //                 $scope.foschedulebycenter.splice(i,1);
                //             }

                //         }
                //     }
                // });

                $scope.foschedulebycenter.push(ctr);


            });
            //console.log($scope.foschedule);
            $scope.loadTimeLineByCenter();
        });

    };

    $scope.loadTimeLineByCenter = function(){

        var d_start = 1;
        var d_end = 7;
        var t_start = 8;
        var t_end = 17;

        $scope.timeline = [];

        // var fosasdscd = $filter('filter')($scope.foschedulebycenter, { CTR_MEETING_DATE: 4 });
        // //console.log($scope.foschedule);
        // //console.log(fosasdscd);
        // if(fosasdscd.length > 0){
        //     $.each(fosasdscd,function(i,fos){
        //         var t = fos.CTR_MEETING_TIME;
        //         var h = t.split(":")[0];
        //         //console.log(h+"    "+fos.CTR_CENTER_NAME);

        //     });
        // }
        console.log($scope.foschedulebycenter);
        for(var i=t_start; i <=t_end; i++){

            var key = { hour: i, day: [],  center: null, time: null};

            for(var d=d_start; d <=d_end; d++){

                var day = {
                    dindex: d,
                    center: null,
                    centerid: null,
                    time:null,
                    groups:null,
                    type:null
                };

                var foscd = $filter('filter')($scope.foschedulebycenter, { CTR_MEETING_DATE: d });
                console.log(foscd);
                if(foscd.length > 0){
                    $.each(foscd,function(i,fos){
                        var t = fos.CTR_MEETING_TIME;
                        var h = t.split(":")[0];
                        if(parseInt(key.hour) == parseInt(h)){
                            day.center = fos.CTR_CENTER_NAME;
                            day.centerid = fos.CTR_CENTER_ID;
                            day.time = fos.CTR_MEETING_TIME;
                            day.type = fos.type;
                            console.log(day);
                        }
                    });
                }

                key.day.push(day);

            }

            $scope.timeline.push(key);

        }
    };

    $scope.choosePermTemp = function(scd, day) {
        swal({
            title: i18n.t("messages.Alert"),
            text: i18n.t("messages.ChooseChangeType"),
            type: "info",
            showCancelButton: true,
            confirmButtonColor: "#CCC",
            cancelButtonColor: '#CCC',
            confirmButtonText: i18n.t("messages.Temporary"),
            cancelButtonText: i18n.t("messages.Permanent")
        }).then(function(result){
            console.log(result);
            let type = 'T';
            if (result.value) {
                console.log('Temporary');
            } else if (result.dismiss === 'cancel'){
                console.log('Permanent');
                type = 'P';
            }

            $scope.chooseDateForCenter(scd, day, type)
        });
    }


    $scope.chooseDateForCenter = function(scd, day, type){
        console.log(scd);
        console.log(day);
        console.log(type);
        console.log($scope.selectedCenter);
        if($scope.checkChanged()){
            swal(i18n.t("messages.NewTimeSlotSaved"));
            return false;
        } 
        swal({
            title: i18n.t("messages.Alert"),
            text: i18n.t("messages.ConfirmChangeMeetingDate"),
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#80C6C7",
            confirmButtonText: i18n.t("messages.Yes")
        }).then(function(isConfirm){
            if(isConfirm.value){ 
                if(day.center == $scope.selectedCenter.center){
                    if(day.center !== null && day.center.indexOf($scope.selectedCenter.value) > -1){
                        swal(i18n.t("messages.CenterInTimeSlot")); // GROUP EXIST IN THIS TIME SLOT
                        return false;
                    }
                } else if(day.center !== null) {
                    swal(i18n.t("messages.GroupDontBelongtoCenter")); //GROUP DONT BELONG TO THIS CENTER
                    return false;
                }

                swal.close();

                day.center = $scope.selectedCenter.center;

                var time = "";
                if(scd.hour > 11) time = scd.hour+":00:00 PM";
                else time = scd.hour+":00:00 AM";

                day.time = time;

                $.each($scope.timeline,function(t,val){ // LOOP ARRAY
                    $.each(val.day,function(i,vday){   // LOOP DAY
                        if(vday.center !== null && 
                            vday.center == $scope.selectedCenter.center && 
                            vday.center.dindex != $scope.selectedCenter.CTR_MEETING_DATE &&
                            vday.center.time !== $scope.selectedCenter.CTR_MEETING_TIME) {
                            console.log(vday);
                            $scope.resetSlot(t,i);
                        }
                        if(vday.dindex == day.dindex && vday.time == day.time) {
                            $scope.timeline[t].day[i].center = $scope.selectedCenter.CTR_CENTER_NAME;
                            $scope.timeline[t].day[i].centerid = $scope.selectedCenter.CTR_CENTER_ID;
                            $scope.timeline[t].day[i].groups = $scope.selectedCenter.groups;
                            $scope.$apply();
                        }
                        // if(vday.center !== null && vday.center == $scope.selectedCenter.center){
                        //     if(vday.center.indexOf($scope.selectedCenter.value) > -1){  //FIND IF GROUP EXISTS IN OTHER TIME SLOT
                        //         var grps = vday.center.split(', ');
                        //         var new_group = "";
                        //         $.each(grps,function(i,grp){
                        //             if(grp == $scope.selectedGroup.value){
                        //                 grps.splice(i,1);  // REMOVE GROUP FROM OLD TIME SLOT
                        //             }
                        //         });
                        //         vday.groups = grps.join(", ");
                        //     }
                        // }

                    });
                });

                // if(day.groups === null) {
                //     day.groups = $scope.selectedGroup.value;
                // } else {
                //     day.groups += ", "+$scope.selectedGroup.value;
                // } 
                var newcount = parseInt($scope.CMD_COUNT) + 1;

                var cmd =   "INSERT INTO T_CHANGE_MEETING_DATE VALUES(null,"+
                            newcount+", "+
                            "'', "+ // $scope.selectedCenter.value
                            $scope.selectedCenter.CTR_CENTER_PK+", "+
                            "'"+$scope.selectedCenter.CTR_CENTER_ID+"', "+
                            $scope.selectedCenter.CTR_MEETING_DATE+", "+
                            "'"+$scope.selectedCenter.CTR_MEETING_TIME+"', "+
                            day.dindex+", "+
                            "'"+time+"', "+
                            "56, "+
                            "'', "+ // 49 ?
                            USER_PK+", "+
                            "'"+moment().format('DD/MM/YYYY HH:mm:ss')+"', "+
                            "'"+type+"', " +
                            "1)";


                console.log(cmd);

                //Change next weeks savings crs_loan_saving to 'X' to omit it ot
                $scope.getNextWeekDate();

                var anotherdate = new Date();
                anotherdate = anotherdate.getFullYear()+"-"+("0"+(anotherdate.getMonth()+1)).slice(-2)+"-"+("0"+anotherdate.getDate()).slice(-2);

                // var crs = "SELECT ACTUAL_WEEK FROM SELECT (CRS_ACTUAL_WEEK_NO + 1) AS ACTUAL_WEEK FROM T_CLIENT_REPAY_SCHEDULE WHERE CRS_CLT_PK IN (SELECT DISTINCT CLT_PK FROM T_CLIENT WHERE CLT_CENTER_ID="+$scope.selectedGroup.CTR_CENTER_PK+" AND CLT_GROUP_ID="+$scope.selectedGroup.value+") AND CRS_LOAN_SAVING_FLAG='L' AND CRS_DATE='"+anotherdate+"' LIMIT 1";

                myDB.execute(cmd,function(results){

                    console.log(results);
                    console.log($scope.selectedCenter);
                    $scope.addtoChanged($scope.selectedCenter.CTR_CENTER_NAME,'');

                    $scope.$apply();
                });
            }

        },function(){
          
        });
    };

    $scope.resetSlot = function(Tidx, Idx) {
        $scope.timeline[Tidx].day[Idx].center = null;
        $scope.timeline[Tidx].day[Idx].centerid = null;
        $scope.timeline[Tidx].day[Idx].groups = null;
        $scope.$apply();
    }

    $scope.checkChangedCenter = function(center,group){

        var changed = $filter('filter')($scope.groupsChanged, { center: center });
        changed = $filter('filter')(changed, { group: group });
        if(changed.length > 0){
            return true;
        }


        return false;

    };

    $scope.changesInCenter = function(center){

        var sum = 0;

        $.each($scope.centerChanged,function(i,cnt){
            if(cnt.center == center.CTR_CENTER_NAME ) sum ++;
        });
        return sum;
    };


    /*######################################################

        OTHERS

    ########################################################*/

    $scope.detailview = function(back){

        if(back === undefined){
            back = 1;
        } else {
            back = -1;
        }

        $scope.clientspage = parseInt($scope.clientspage + back*1);
        if($scope.clientspage > 2) $scope.clientspage = 1;
        //console.log($scope.clientspage);

        if($scope.clientspage == 1){
            $('.first-page').fadeIn();
            $('.second-page').show();
            $('.third-page').hide();

            $('.second-wrapper').hide();
            $('.third-wrapper').show();

        } else if($scope.clientspage == 2) {

            $('.first-page').hide();
            $('.second-page').fadeOut();
            $('.third-page').hide();

            $('.second-wrapper').show();
            $('.third-wrapper').hide();


        } else if($scope.clientspage == 3) {

            $('.first-page').hide();
            $('.second-page').hide();
            $('.thir-page').fadeOut();

            $('.second-wrapper').hide();
            $('.third-wrapper').show();
        }
    };


    // myDB.execute("Delete FROM T_CHANGE_MEETING_DATE",function(res){

    // });

    $scope.getChangedMeetings();
    //$scope.LoadFoSchedule();
    $scope.LoadFoScheduleByCenter();
    $scope.loadVillages();

});

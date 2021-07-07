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
canPrint = true;
function checkPopChecked(pk){
    if($('#product_'+pk).is(":checked")){
      $('#amount_'+pk).prop('disabled', false);
        $('#amount_'+pk).focus();
    } else {
      $('#amount_'+pk).prop('disabled', true);
    }
}
 

var USER_PK             = sessionStorage.getItem("USER_PK");
var USER_NAME           = sessionStorage.getItem("USER_NAME");
var BRC_PK              = sessionStorage.getItem("BRC_PK");
var BRC_NAME            = sessionStorage.getItem("BRC_NAME");
var BRC_PHONE           = sessionStorage.getItem("BRC_PHONE");
var CMP_NAME            = sessionStorage.getItem("CMP_NAME");
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
    }
}); 
 
myApp.filter('filterClientLoan', function() {
     return function(items,allprds) {
        //printLog(items);
        //printLog(allprds);
        if(items == undefined || allprds == undefined) return false;

        var filtered = [];
        $.each(items,function(g,item){

            var exists = false;
            $.each(allprds,function(r,prd){
                ////printLog(item.PRM_CODE+" "+prd.PRM_CODE);
                if(item.PRM_CODE == prd.PRM_CODE){
                    exists = true;
                }
            })
            if(!exists){
                filtered.push(item);
            }

        })

        return filtered;
    };
});
myApp.directive('testing', function(){
    return {
        restrict: 'E',
        scope: {
            control: '='
        },
        templateUrl: 'widget_testing.html', 
        link: function(scope, element, attrs){
            scope.centers = scope.control || {};
            scope.$watch('control', function(value) {
                scope.centers = value
            });
        }
    } 
});
 
myApp.directive('showWithdrawal', function(){
    return {
        restrict: 'A',
        scope: {
            product: '=',
            client: '=',
            iuser: '=',
            itype: '@'
        },
        link : function(scope,elm,attrs){
            var showWith = false;

            scope.$watchGroup(['client','product.WTH_NEW'], function(newValue, oldValue, scope) {

                var another_date = new Date();
                another_date = another_date.getFullYear()+"-"+("0"+(another_date.getMonth()+1)).slice(-2)+"-"+("0"+another_date.getDate()).slice(-2);
 
                if (newValue[0]) {
                    var havesaved = false;

                    if(newValue[0].CRS_SMS_STATUS=='Y'||scope.iuser.SMS_SENT=='Y'|| scope.iuser.RECEIPT_SENT=='Y'|| newValue[0].CRS_RECP_STATUS=='Y' || newValue[1] == true ){
                        havesaved = true;
                    }

                    if( scope.product.WTH_PK > 0 || ((scope.product.CPC_STATUS == 3 || scope.product.CPC_STATUS == 55)&& scope.product.CPC_DISBURSE_DATE == another_date) ) {
                        showWith = true;
                    }

                    if(scope.itype=="input") { // DISPLAY INPUT

                        if(havesaved ){
                            elm.hide();
                        } else {
                            elm.show();
                        }
                    } else if(scope.itype=="div"){ // DISPLAY DIV

                        if(havesaved){
                            elm.show();
                        } else {
                            elm.hide();
                        }
                    }
                }
            });
        }
    }
});

myApp.filter('loanOpen', function () {
    return function (items) {
        var filtered = [];
        for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (/a/i.test(item.name.substring(0, 1))) {
            filtered.push(item);
        }
        }
        return filtered;
    };
});

myApp.directive('linkDisabled', function() {
    return {
        restrict: 'A',
        scope: {
            enabled: '=linkDisabled'
        },
        link: function(scope, element, attrs){
            element.bind('click', function(event){
                if(!scope.enabled){
                    event.preventDefault();
                    swal(i18n.t("messages.EmptyGroup"));
                }
            });
        }
    };
});

myApp.controller('TransactionsCtrl', function($scope, $filter, $timeout, $compile){

    $scope.todaysCRS = localStorage.getItem("TODAYS_CRS_PKS"); 
   
    $scope.user = {
        userPK:USER_PK,
        userName:USER_NAME,
        branchPK:BRC_PK,
        branchName:BRC_NAME,
        companyName:CMP_NAME,
        branchID:BRC_BRANCH_ID,
        branchPhone:BRC_PHONE,
        centreID:USER_CTR_ID,
        centreName:USER_CTR_NAME,
        curr_village:null,
        village:{
            total:null
        },
        selectVillage:[],
        groups:[],
        selectedGroup:{
            value:null
        },
        defaultGroup: {
            value:null
        },
        filteredGroups: {
            pending:[],
            completed:[]
        },
        SMS_SENT: 'N',
        RECEIPT_SENT: 'N',
        clients:[],
        Printing: {
            sms: [],
            rcp: []
        },

    };
    $scope.centerlistControl = {};
    $scope.centers = [];
    $scope.selectedCenter = null;

    $scope.centerRepayment_Expected = 0;
    $scope.centerSavings_Expected = 0;
    $scope.centerWidthdrawal_Expected = 0;

    $scope.centerRepayment = 0;
    $scope.centerSavings = 0;
    $scope.centerWidthdrawal = 0;

    $scope.currloc = '';
    $scope.smmqueue = [];
    $scope.smsstatus = [];
    $scope.BRC_DISBURSE_NOTIFICATION = sessionStorage.getItem("SMS_OR_RECEIPT");
    $scope.bpmproducts = [];
    $scope.isLoanTable = true;
    $scope.isGroupSelected = false;
    $scope.maxPrdTxn_CPT_PK = 0;
    $scope.productmaster = [];
    $scope.loading = false;
    $scope.rescount = 0;
    $scope.anotherdate =  getDashDate.YMD();
    $scope.date  = getSlashDate.DMY();
    $scope.selectedProduct = {
        PRM_CODE: 0
    };

    $scope.selectedMaturity = 10;
    $scope.prepPrintin = function(){
        //GET ARRAY OF RECEIPT LABELS
        var rcp_array = CMP_RECEIPT_LABEL.split(",");
        CMP_RECEIPT_FORMAT = CMP_RECEIPT_FORMAT.replace(/ /g,'');
        var print_format = CMP_RECEIPT_FORMAT.split(",");
        //GET ARRAY OF SMS LABELS
        var sms_array = CMP_SMS_LABEL.split(",");
        CMP_SMS_FORMAT = CMP_SMS_FORMAT.replace(/ /g,'');
        var sms_format = CMP_SMS_FORMAT.split(",");

        for(var p in print_format){

            var pos = jQuery.inArray(print_format[p], SMS_RCP_CODE );

            var arr_rcp = [];
            arr_rcp.pid = print_format[p];
            arr_rcp.pname = rcp_array[pos];
            $scope.user.Printing.rcp.push(arr_rcp); // MERGE CODE WITH LABEL

        }

        for(var s in sms_format){
            var pos = jQuery.inArray(sms_format[s], SMS_RCP_CODE );

            var arr_sms = [];
            arr_sms.pid = sms_format[s];
            arr_sms.pname = sms_array[pos];
            $scope.user.Printing.sms.push(arr_sms); // MERGE CODE WITH LABEL
        }
    };

    

    var cm = "SELECT MAX(CPT_PK) as MAX_CPTPK FROM T_CLIENT_PRD_TXN";
    myDB.execute(cm, function(results){
        if(results.length<=0) return false;
        else{
            for(var k in results){
                $scope.maxPrdTxn_CPT_PK = results[k].MAX_CPTPK + 1;
            }  
        }
    });


    $scope.loadVillages = function(){
        var currVille = 0;
        if(localStorage.getItem('statType') !== null){
            currVille = localStorage.getItem('statType');
        } else  if(localStorage.getItem('currentVillage') !== null){
            currVille = localStorage.getItem('currentVillage');
        }

        myDB.execute("select VLM_PK,VLM_NAME from T_VILLAGE_MASTER", function(results){

                $scope.user.selectVillage = [];
                for(var k in results){
                    var keypair = {'name': results[k].VLM_NAME,'value': results[k].VLM_PK};

                    $scope.user.selectVillage.push(keypair);

                    if(currVille !== null && currVille !== undefined && currVille == results[k].VLM_PK){
                        $scope.user.curr_village = keypair;
                        $scope.user.village= keypair;
                        $scope.user.village.groups = [];
                    }
                }
            
                setTimeout(function(){
                    $scope.$apply();
                    $scope.loadGroup();
                },50);
        });
    };
    
    $scope.getMaxPrdTxn = function(){
        var cm = "SELECT MAX(CPT_PK) as MAX_CPTPK FROM T_CLIENT_PRD_TXN";
        myDB.execute(cm, function(results){
            if(results.length<=0) return false;
            else{
                $scope.$apply(function(){
                    for(var k in results){
                        $scope.maxPrdTxn_CPT_PK = results[k].MAX_CPTPK + 1; // GET LAST UNUSED CPT_PK
                    }
                });
            }
        });
    }
    

    $scope.updateVillage = function(obj){

        $scope.user.curr_village = obj;
        setTimeout(function(){
            $scope.$apply();
            $scope.loadGroup();
            $scope.taskUpd = 1;
        },100);

    };

    $scope.getCenterCompleted = function(){

        if($scope.selectedCenter === null) return false;

        var clients =  $filter('filter')($scope.user.clients,{ CLT_CENTER_ID: $scope.selectedCenter.CTR_CENTER_ID });
        printLog(clients.length);
        var completed = true;
        $.each(clients,function(c,client){
            if(client.products[0] !== undefined){
                if(client.products[0].CRS_ATTENDED === ''){ 
                    completed = false;
                }
            }
        });

        printLog("completed center "+completed);

        return completed;
    };

    $scope.getCenterExpected = function(type){

        printLog("center expected is "+ $scope.centerRepayment_Expected);

        return $scope.centerRepayment_Expected;

    };

    $scope.getCenterActual = function(type){

        printLog("center actual is "+ $scope.centerRepayment);
        return $scope.centerRepayment;
    }; 
 
    $scope.updateCenter = function(){
        
        printLog($scope.selectedCenter);
        printLog($scope.user.clients);

        var clients =  $filter('filter')($scope.user.clients,{ CLT_CENTER_ID: $scope.selectedCenter.CTR_CENTER_ID });

        var centerRepayment = 0;
        var centerSavings = 0;
        var centerWidthdrawal = 0;

        var centerRepayment_exp = 0;
        var centerSavings_exp = 0;
        var centerWidthdrawal_exp = 0;

        $.each(clients, function(c,client){

            $.each(client.loans,function(l,loan){
                if(loan.CRS_ATTENDED !== ''){
                    centerRepayment += $scope.getLoanActualAmt_Display(loan, 'sum');
                    centerRepayment_exp += $scope.getLoanExpectedAmt(loan);
                }
            });
            $.each(client.products, function(p,prd){
                if(prd.CRS_ATTENDED !== ''){
                    centerSavings += parseFloat(prd.CRS_ACT_CAPITAL_AMT);
                    centerSavings_exp += parseFloat(prd.CRS_EXP_CAPITAL_AMT);
                    centerWidthdrawal += prd.ACT_WTH_AMT  === null ? 0 : parseFloat(prd.ACT_WTH_AMT );

                }
            });
            $.each(client.ranproducts, function(p,prd){
                if(prd.CRS_ATTENDED !== ''){
                    centerSavings += parseFloat(prd.CRS_ACT_CAPITAL_AMT);
                    centerSavings_exp += parseFloat(prd.CRS_EXP_CAPITAL_AMT);
                    centerWidthdrawal +=  prd.ACT_WTH_AMT  === null ? 0 : parseFloat(prd.ACT_WTH_AMT );

                }
            });

        });

        $scope.centerRepayment_Expected = centerRepayment_exp;
        $scope.centerSavings_Expected = centerSavings_exp;
        $scope.centerWidthdrawal_Expected = 0;

        $scope.centerRepayment = centerRepayment;
        $scope.centerSavings = centerSavings;
        $scope.centerWidthdrawal = centerWidthdrawal;
        
        setTimeout(function(){
            $scope.$apply();
        },10);
        

    };

    $scope.refreshAlldiv = function(obj, c){
 
        refreshall(obj);
    }

    $scope.loadGroup = function(){
        $scope.request = i18n.t("messages.Request");
        $scope.expected = i18n.t("messages.Expected");
        $scope.actual = i18n.t("messages.Actual");
        $scope.grouptext = i18n.t("messages.Group");
        $scope.weektext = i18n.t("messages.Week");
        $scope.overviewtext = i18n.t("messages.Overview");

        var date = new Date();
        date = date.getFullYear()+"-"+("0"+(date.getMonth()+1)).slice(-2)+"-"+("0"+date.getDate()).slice(-2);

        //RESET GROUPS DATA
        $scope.user.groups = [];
        $scope.user.village.groups = [];

        $('.load-cover').fadeIn();
        $('.center_overview').hide();

        $scope.viilletotal();

    };

    $scope.GrpFilter = function(client){
        return client.CLT_GROUP_ID === user.selectedGroup.value;
    };

    $scope.checkComplete = function(){

        var date = new Date();
        date = ("0"+date.getDate()).slice(-2)+"/"+("0"+(date.getMonth()+1)).slice(-2)+"/"+date.getFullYear();

        var groupids = "";

        for(var g in $scope.user.groups){
            if(groupids !== "") groupids += ",";
            groupids += "'"+$scope.user.groups[g].CLT_GROUP_ID+"'";
        }

        var currVille = 0;
        if(localStorage.getItem('statType') !== null){
            currVille = localStorage.getItem('statType');
        } else  if(localStorage.getItem('currentVillage') !== null){
            currVille = localStorage.getItem('currentVillage');
        }

        var cmd2 = " select clt_group_id,crs_pk,crs_sms_status,crs_sms_group_status,crs_recp_status,crs_recp_group_status,clt_village,vlm_name ";
        cmd2    +=" from T_CLIENT_REPAY_SCHEDULE,T_CLIENT_LOAN,T_CLIENT,T_VILLAGE_MASTER ";
        cmd2    +=" where clt_group_id in ("+groupids+") ";
        cmd2    +=" and crs_clt_pk = cll_clt_pk ";
        cmd2    +=" and clt_pk = crs_clt_pk ";
        cmd2    +=" and vlm_pk = clt_village ";
        cmd2    +=" and crs_date='"+$scope.date+"'" ;
        cmd2    +=" order by clt_group_id";

        myDB.execute(cmd2, function(results){

            //printLog("checkComplete");
            $scope.user.selectedGroup.value = null;
            $scope.user.filteredGroups.pending = [];
            $scope.user.filteredGroups.completed = [];

            if(results.length<=0){

                var keypair = { 'name': '', 'value': '', 'centerid':''} ;
                $scope.user.filteredGroups.pending.push(keypair);
                $scope.user.selectedGroup = keypair;

                //$scope.user.filteredGroups;
                $scope.autoSelGroup($scope.user.defaultGroup) ;

            } else {
                //SET VILLAGE CODE
                for(var k in results){

                    var keypair = { 'name': results[k].VLM_NAME, 'value': results[k].CLT_GROUP_ID} ;
                    $scope.user.defaultGroup = keypair;
                    //CHECK COMPLETED
                    if(results[k].CRS_SMS_STATUS=='Y'||
                        results[k].CRS_SMS_GROUP_STATUS=='Y'||
                        results[k].CRS_RECP_STATUS=='Y'||
                        results[k].CRS_RECP_GROUP_STATUS=='Y' ){
                        //THIS USER COMPLETED
                    } else {
                        //AS LONG AS ONE USER NOT COMPLETED, THE GROUP ISNT DONE

                        if($scope.user.filteredGroups.pending.length > 0){
                            var shouldPushGroup = true;
                            for(var p in $scope.user.filteredGroups.pending){

                                if($scope.user.filteredGroups.pending[p].value == results[k].CLT_GROUP_ID){
                                    shouldPushGroup = false;
                                }
                            }
                            if(shouldPushGroup)
                                $scope.user.filteredGroups.pending.push(keypair);
                        } else {
                            $scope.user.filteredGroups.pending.push(keypair);
                        }
                    }

                    if(currVille !== 0 && currVille==results[k].CLT_VILLAGE){
                        $scope.user.defaultGroup = keypair;
                    }
                }
            }

            var groupidsarr = groupids.split(',');
          
            for(g in $scope.user.groups){
               
                var keypair = { 'name': $scope.user.groups[g].VLM_NAME, 'value': $scope.user.groups[g].CLT_GROUP_ID , 'centerid': $scope.user.groups[g].CLT_CENTER_ID};
                if($scope.user.filteredGroups.pending.length > 0){
                    var shouldPushGroup = true;
                    for(var p in $scope.user.filteredGroups.pending){

                        if($scope.user.filteredGroups.pending[p].value == $scope.user.groups[g].CLT_GROUP_ID){
                            shouldPushGroup = false;
                        }
                    }
                    if(shouldPushGroup)
                        $scope.user.filteredGroups.completed.push(keypair);

                } else {
                    $scope.user.filteredGroups.completed.push(keypair);
                }
            }

            $scope.autoSelGroup($scope.user.defaultGroup);


        });
    };

    $scope.watchGroups = $scope.$watch('user.filteredGroups',function(newValue,oldValue){
        if(newValue != oldValue){
            $scope.watchGroups();
        }
    });

    $scope.autoSelGroup = function(obj){
 
        $scope.user.selectedGroup = obj; 
        localStorage.removeItem('statType');

        $scope.selectGroup(); 
    }; 
 
    $scope.viilletotal = function(){

        $scope.loaded = true;

        var date = new Date();
        date = ("0"+date.getDate()).slice(-2)+"/"+("0"+(date.getMonth()+1)).slice(-2)+"/"+date.getFullYear();

        var anotherdate = new Date();
        anotherdate = anotherdate.getFullYear()+"-"+("0"+(anotherdate.getMonth()+1)).slice(-2)+"-"+("0"+anotherdate.getDate()).slice(-2);

        var cmd1 = "";

        cmd1 += " SELECT ";

        cmd1 += " CLT.CLT_GROUP_ID,vlm_name,vlm_pk, CAST(CLT_CENTER_ID AS INT) as CLT_CENTER_ID, CTR.CTR_CENTER_NAME, CTR.CTR_CENTER_ID, ";
        cmd1 += " CLT.CLT_VILLAGE as CLT_VILLAGE, ";

        cmd1 += " CRS_S.crs_prm_lty_pk as PRM_PK ,";

        cmd1 += " GROUP_CONCAT(CRS_S.CRS_RECP_GROUP_STATUS) AS CRS_RECP_GROUP_STATUS, ";
        cmd1 += " GROUP_CONCAT(CRS_S.CRS_RECP_STATUS) AS CRS_RECP_STATUS, ";
        cmd1 += " GROUP_CONCAT(CRS_S.CRS_SMS_GROUP_STATUS) AS CRS_SMS_GROUP_STATUS, ";
        cmd1 += " GROUP_CONCAT(CRS_S.CRS_SMS_STATUS) AS CRS_SMS_STATUS, ";

        cmd1 += " (SUM(CAST(IFNULL(CRS_S.CRS_EXP_CAPITAL_AMT,0) AS UNSIGNED)) + SUM(CAST(IFNULL(CRS_S.CRS_EXP_PROFIT_AMT,0) AS UNSIGNED))) as total_sav_exp, ";
        cmd1 += " (SUM(CAST(IFNULL(CRS_S.CRS_ACT_CAPITAL_AMT,0) AS UNSIGNED)) + SUM(CAST(IFNULL(CRS_S.CRS_ACT_PROFIT_AMT,0) AS UNSIGNED))) as total_sav_act "; 
        cmd1 += " FROM T_CLIENT AS CLT";
        cmd1 += " LEFT JOIN T_VILLAGE_MASTER ON vlm_pk = CLT.clt_village ";
        cmd1 += " LEFT JOIN T_CENTER_MASTER CTR ON CLT_CENTER_ID = CTR_PK ";
        cmd1 += ` LEFT JOIN
        T_CLIENT_REPAY_SCHEDULE CRS_S 
        ON (
            CLT.CLT_PK=CRS_S.CRS_CLT_PK 
            AND (CRS_S.CRS_LOAN_SAVING_FLAG = 'S' OR CRS_S.CRS_LOAN_SAVING_FLAG='X') 
            AND CRS_S.CRS_CLL_PK = 0 
            AND CRS_S.CRS_FLAG='C' 
            AND CRS_S.CRS_DATE='${$scope.date}'
        )`
        cmd1 += " WHERE CLT.clt_traning_completed='Y' ";
        cmd1 += " AND CLT_PK = CRS_S.CRS_CLT_PK ";
        cmd1 += " AND CLT.clt_village="+$scope.user.curr_village.value;
        cmd1 += " AND CLT.CLT_STATUS in (7,21,26,27,40) ";
        cmd1 += " GROUP BY CLT.CLT_VILLAGE, CLT.CLT_CENTER_ID, CLT.CLT_GROUP_ID ";
 
        //printLog("88888");
        printLog(cmd1);
        console.log(cmd1);
        $scope.loading = true;
        myDB.execute(cmd1, function(results){
            console.log("737");
            // console.log(results);
            //console.log(results);
            var test = results;
            console.log(test);

            if(results.length == 0 || results == null){
                //printLog("no results");
                $('.load-cover').fadeOut();
                $('.notransaction').fadeIn();
                $scope.user.village.groups = null;
                $scope.loading = false;
            } else {

                dt = new Date();
                time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();

                $scope.user.village.groups = [];
                $scope.user.village.centers = [];
                $scope.centers = []; 
                $scope.rescount = results.length;
                $.each(results,function(r,res){
 
                    var ckey = { CTR_CENTER_NAME: res.CTR_CENTER_NAME, CTR_CENTER_ID: res.CLT_CENTER_ID, SELECTED: false, CTR_CENTER_CODE: res.CTR_CENTER_ID }; 

                    var center_exists = false;
                    $.each($scope.user.village.centers, function(c,center){
                        if(center.CTR_CENTER_NAME == res.CTR_CENTER_NAME){
                            center_exists = true;
                        }
                    });

                    if(!center_exists) {
                        if($scope.user.village.centers.length === 0) {
                            ckey.SELECTED = true;
                            $scope.selectedCenter = ckey;
                        }
                        $scope.user.village.centers.push(ckey); 
                        $scope.centers.push(ckey); 
                    }

                    printLog("adding centers");
                    printLog($scope.centers);
                    
                    if(res.CRS_RECP_GROUP_STATUS === null)res.CRS_RECP_GROUP_STATUS = '';
                    if(res.CRS_RECP_STATUS === null) res.CRS_RECP_STATUS = '';
                    if(res.CRS_SMS_GROUP_STATUS === null) res.CRS_SMS_GROUP_STATUS = '';
                    if(res.CRS_SMS_STATUS === null)res.CRS_SMS_STATUS = '';

                    var loan_exp = res.total_loan_exp;
                    if(loan_exp === null) loan_exp = 0;

                    var loan_act = res.total_loan_act;
                    if(loan_act === null) loan_act = 0;

                    var save_exp = res.total_sav_exp;
                    if(save_exp === null) save_exp = 0;

                    var save_act = res.total_sav_act;
                    if(save_act === null) save_act = 0;

                    res.total_exp =  parseFloat(save_exp);
                    res.total_act =  parseFloat(save_act);
 
                    var grp = $filter('filter')($scope.user.village.groups,{ CLT_CENTER_ID: res.CLT_CENTER_ID });
                    grp = $filter('filter')(grp,{ CLT_GROUP_ID : res.GROUP_ID })[0];

                    $scope.villetotal_loan(res);
                });


            }

        });

    };

    $scope.villetotal_loan = function(res){

        printLog(res); 

        var scd = " SELECT CLT_VILLAGE, ";

        scd += " (COUNT(DISTINCT CLT.CLT_PK)) as clientcount, ";
        scd += " (COUNT(DISTINCT CLL.CLL_PK)) as loancount, "; 

        scd += " SUM( IFNULL(CRS_LE.total_loan_exp,0)) as total_loan_exp, ";
        scd += " SUM( IFNULL(CRS_L.total_loan_act,0)) as total_loan_act ";

        scd += " FROM T_CLIENT AS CLT,T_CLIENT_LOAN AS CLL ";
        scd += " LEFT JOIN T_VILLAGE_MASTER ON vlm_pk = CLT.clt_village ";
        scd += " LEFT JOIN T_CENTER_MASTER CTR ON CLT_CENTER_ID = CTR_PK ";

        scd += " LEFT JOIN ( ";
        scd += "    SELECT CRS_LE.CRS_CLL_PK, CRS_LE.CRS_CLT_PK, ( CAST(IFNULL(CRS_LE.CRS_EXP_CAPITAL_AMT,0) AS UNSIGNED) + CAST(IFNULL(CRS_LE.CRS_EXP_PROFIT_AMT,0) AS UNSIGNED) ) as total_loan_exp ";
        scd += "    FROM T_CLIENT_REPAY_SCHEDULE as CRS_LE ";
        scd += "    WHERE CRS_LE.CRS_ACTUAL_WEEK_NO != 0  AND CRS_LE.CRS_LOAN_SAVING_FLAG = 'L' AND CRS_LE.CRS_FLAG='C' AND CRS_LE.CRS_DATE='"+$scope.date+"' ";
        scd += "    GROUP BY CRS_LE.CRS_CLL_PK, CRS_LE.CRS_CLT_PK ";
        scd += " ) as  CRS_LE ON ( CLL.CLL_PK=CRS_LE.CRS_CLL_PK AND CLL.CLL_CLT_PK = CRS_LE.CRS_CLT_PK  ) ";

        scd += " LEFT JOIN ( ";
        scd += "    SELECT CRS_L.CRS_CLL_PK, CRS_L.CRS_CLT_PK, SUM( CAST(IFNULL(CRS_L.CRS_ACT_CAPITAL_AMT,0) AS UNSIGNED) + CAST(IFNULL(CRS_L.CRS_ACT_PROFIT_AMT,0) AS UNSIGNED) ) as total_loan_act ";
        scd += "    FROM T_CLIENT_REPAY_SCHEDULE as CRS_L "; 
        scd += "    WHERE CRS_L.CRS_ACTUAL_WEEK_NO != 0  AND CRS_L.CRS_LOAN_SAVING_FLAG = 'L' AND CRS_L.CRS_FLAG='C' AND CRS_L.CRS_DATE='"+$scope.date+"' ";
        scd += "    GROUP BY CRS_L.CRS_CLL_PK, CRS_L.CRS_CLT_PK ";
        scd += " ) as CRS_L ON ( CLL.CLL_PK=CRS_L.CRS_CLL_PK AND CLL.CLL_CLT_PK = CRS_L.CRS_CLT_PK  ) ";

        scd += " WHERE CLT.clt_traning_completed='Y' ";
        scd += " AND CLL_STATUS > 8 AND CLL.CLL_STATUS NOT IN (9,27,55) ";
        scd += " AND CLT.CLT_PK=CLL.CLL_CLT_PK ";
        //scd += " AND CLL_DISBURSEMENT_DATE !='"+$scope.date+"'";
        scd += " AND CAST(CLT.CLT_CENTER_ID AS INT)="+res.CLT_CENTER_ID+" AND CLT.CLT_GROUP_ID='"+res.CLT_GROUP_ID+"' ";
        scd += " and CLT.clt_village="+res.CLT_VILLAGE;
        scd += " AND CLT.CLT_STATUS in (7,21,26,27,40)  ";
        scd += " AND CLL.CLL_DISBURSEMENT_DATE != '' "; 
        scd += " GROUP BY CLT.CLT_VILLAGE, CLT.CLT_CENTER_ID, CLT.CLT_GROUP_ID ";
        console.log(scd);
        // console.log(scd);
        myDB.execute(scd,function(sres){
            console.log(res);
            console.log("sres");
            console.log(sres);  
            $scope.rescount = parseInt($scope.rescount) - 1 ;
            printLog($scope.rescount);
            if($scope.rescount === 0 ){
                $('.load-cover').fadeOut();
                $scope.updateCenter();
                $('.center_overview').fadeIn();
            }
            if(sres.length === 0) {
                $scope.user.village.groups.push(res);

                $scope.$apply(function(){
                    printLog($scope.user.village.groups);
                    $scope.loading = false;
                });
                return false;
            }
            setTimeout(function(){
                $scope.$apply(function(){ 

                    res.total_exp += parseFloat(sres[0].total_loan_exp);
                    res.total_act += parseFloat(sres[0].total_loan_act);
                    res.clientcount = sres[0].clientcount;

                    var anotherdate = new Date();
                    anotherdate = anotherdate.getFullYear()+"-"+("0"+(anotherdate.getMonth()+1)).slice(-2)+"-"+("0"+anotherdate.getDate()).slice(-2);

                    var ncmd = "SELECT (SUM(CAST(CPT_TXN_AMOUNT AS UNSIGNED))) as cpt_total ";
                    ncmd    += " FROM T_CLIENT_PRD_TXN,T_CLIENT WHERE CLT_PK = CPT_CLT_PK ";
                    ncmd    += " AND DATE(CPT_DATETIME)='"+anotherdate+"'";
                    ncmd    += " AND CAST(CLT_CENTER_ID AS INT)="+res.CLT_CENTER_ID+" AND CLT_GROUP_ID='"+res.CLT_GROUP_ID+"' ";
                    ncmd    += " AND CLT_VILLAGE="+res.CLT_VILLAGE;
                    ncmd    += " AND CPT_COLLECTION_WEEK_NO != 0";
                    ncmd    += " AND CPT_FLAG='C'";
                    ncmd    += " GROUP BY CLT_VILLAGE, CLT_CENTER_ID, CLT_GROUP_ID ";

                    /*
                     * calculate random product withdrawal
                     */
                    let calculateWithdrawCmd = ` 
                        SELECT 
                            SUM(CPT_TXN_AMOUNT)  as total_wth_act
                        FROM 
                            T_CLIENT_PRD_TXN CPT 
                        LEFT JOIN 
                            T_CLIENT
                        ON 
                            CLT_PK=CPT_CLT_PK
                        WHERE 
                        DATE(CPT.CPT_DATETIME)='${anotherdate}'
                        AND CPT.CPT_FLAG='D' 
                        AND CPT.CPT_CHKNEW=1
                        AND CAST(CLT_CENTER_ID AS INT)='${res.CLT_CENTER_ID}'
                        AND CLT_GROUP_ID='${res.CLT_GROUP_ID}'
                        AND CLT_VILLAGE='${res.CLT_VILLAGE}'
                        GROUP BY 
                        CLT_VILLAGE, CLT_CENTER_ID, CLT_GROUP_ID 
                    `
                    //console.log(ncmd);
                    myDB.execute(ncmd,function(cres){
                        myDB.execute(calculateWithdrawCmd,function(wres){
                            console.log('outcome',ncmd,'--',calculateWithdrawCmd,cres,wres); 
                            res.loans = [];
                            res.savings = [];

                            if(cres.length >0) { 
                                res.total_act += parseFloat(cres[0].cpt_total);
                            } 
                            res.total_wth_act = wres.length >0 ? wres[0].total_wth_act : 0 
                            $scope.user.village.groups.push(res); 
                            $scope.$apply(function(){
                                printLog($scope.user.village.groups);
                                $scope.loading = false;
                            }); 
                        });
                    })
                });
            },110);
        });
    };



    $scope.testing = function(prd){
   
    };

    $scope.totalExpectedForVille = function(){
        var sum = 0;
        for(var g in $scope.user.village.groups){
            sum += parseFloat(($scope.user.village.groups[g].savings_total_exp)+($scope.user.village.groups[g].loan_total_exp));
        }
        return sum;
    };

    $scope.totalActualForVille = function(){
        var sum = 0;
        for(var g in $scope.user.village.groups){
            sum += parseFloat(($scope.user.village.groups[g].savings_total_act+$scope.user.village.groups[g].loan_total_act));
        }
        return sum;
    };

    $scope.selectGroup = function(){
        $scope.clientname = i18n.t("messages.ClientName");
        $scope.clienttotal = i18n.t("messages.Total");
        $scope.absent = i18n.t("messages.Absent");
        $scope.reason = i18n.t("messages.Reason");
        $scope.assisted = i18n.t("messages.Assisted");
        $scope.wkno = i18n.t("messages.WkNo");
        $scope.sms = i18n.t("messages.SMS");
        $scope.print = i18n.t("messages.Print");

        $scope.producttext = i18n.t("messages.Product");
        $scope.expectedamttext = i18n.t("messages.ExpectedAmt");
        $scope.actualamttext = i18n.t("messages.ActualAmt");

        $scope.capitalamttext = i18n.t("messages.CapitalAmount");
        $scope.profitamttext = i18n.t("messages.ProfitAmount");

        $scope.balancetext = i18n.t("messages.Balance");
        $scope.pendingclose = i18n.t("messages.PendingClosure");
        $scope.withdrawalamttext = i18n.t("messages.WithdrawalAmt");
        $scope.withdrawaltext = i18n.t("messages.Withdrawal");
        $scope.newproducttxt = i18n.t("messages.NewProduct");
        $scope.addnewproducttxt = i18n.t("messages.AddNewProduct");
        $scope.maturitytxt = i18n.t("messages.Maturity");
        $scope.weeklysavingstxt = i18n.t("messages.WeeklySavings");
        $scope.actiontxt = i18n.t("messages.Action");
        $scope.weekstxt = i18n.t("messages.Weeks");
        $scope.weektxt = i18n.t("messages.Week");
        $scope.collectiontxt = i18n.t("buttons.Collection");
        $scope.loantxt = i18n.t("messages.Loan");
        $scope.payfortxt = i18n.t("messages.PayFor"); 

        $scope.repayamt = i18n.t("messages.RepaymentAmt");
        if(CMP_SMS_FORMAT.indexOf('AMT')!=-1)
            $scope.repayamt = $scope.user.Printing.rcp[findIndexInData($scope.user.Printing.rcp,'pid','AMT')].pname;
 
        var date = new Date();
        date = ("0"+date.getDate()).slice(-2)+"/"+("0"+(date.getMonth()+1)).slice(-2)+"/"+date.getFullYear();
 
        $scope.user.SMS_SENT = 'N';
        $scope.user.RECEIPT_SENT = 'N';

        $scope.TOTAL_LOAN_EXP = 0.00;
        $scope.TOTAL_LOAN_ACT = 0.00;

        var dt = new Date();
        var time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();
        //printLog("select group start - "+time);

        var cmd2;
        $scope.bpmproducts = [];
        var cmd1;
        cmd1 = "SELECT PRM_PK, PRM_LOCAL_NAME, PRM_LOCAL_NAME, PRM_CODE,  PRM_IS_ACTIVE, PRM_LOAN_FLEXI_FIELD FROM T_PRODUCT_MASTER ORDER BY PRM_LOAN_FLEXI_FIELD";
        myDB.execute(cmd1, function(bpmresults){
            if(bpmresults.length<=0){
                //printLog("bpm no results");
            } else {
                $scope.bpmproducts = [];
                for(var bpm in bpmresults){
                    bpmresults[bpm].total_EXP = 0;
                    bpmresults[bpm].total_ACT = 0;

                    $scope.bpmproducts.push(bpmresults[bpm]);
                }
            }
        });
    };

    $scope.getCurrentLoanWeek = function(loan){
        return loan.CRS_COLLECTION_WEEK_NO
    };

    $scope.getActualLoanWeek = function(loan){ 
        let  clientDidnotPay = loan.CRS_ATTENDED=='N' && loan.CRS_ASSISTED=='N'
        // if client haven't paid , & not paid yet
        let  clientHaventPaid = !loan.CRS_ATTENDED
        if( clientDidnotPay|| clientHaventPaid){
            // which is the week they are going to paid minus
             return loan.CRS_ACTUAL_WEEK_NO -1 
        }

        // else if  client already paid
        if(loan.payfor > 1){ 
            // if client already paid, the week they paid until + loan.payfor
            return loan.CRS_ACTUAL_WEEK_NO + (loan.payfor - 1);
        } else {
            return loan.CRS_ACTUAL_WEEK_NO
        }
    };

    $scope.updatePaidBy = function(loan){

        printLog(loan.paidonbehalfby);

        refreshall('.paidonbehalfby');

    };

    $scope.getLoans = function(clients){

        var deferred = $.Deferred();

        var cmd2 = "";
        cmd2 = "  SELECT CLL_PK, CLL_PARENT_CLL_PK, CLL_PK, CLL_STATUS, CLL_OUTSTANDING, CLL_CLT_PK,CLL_LTY_PK, CLL_LOAN_WEEKS,";
        cmd2 += " CLL_TOTAL_LOAN_WEEKS, CLL_ACTUAL_LOAN, CLL_LOAN_NUMBER, lty_description, LTY_TERM_OF_LOAN, LTY_SECOND_REVIEW_WEEK, ";
        cmd2 += " CRS.CRS_PK, CRS.CRS_CLT_PK, CRS.CRS_CLL_PK, CRS.CRS_PRM_LTY_PK, CRS.CRS_LOAN_SAVING_FLAG, "
        /**
         * for the next line ,
         * when multiple week has a same CRS date as today, because client have late payment.
         * it will case the crs_date crash with the future CRS record (because we didn't update future CRS date)
         * 
         * solution to this it to group by  and use
         * Min(actual week no) to force sql to select the most record with the earliest crs date.
        */
        cmd2 += " MIN(CRS.CRS_ACTUAL_WEEK_NO) as CRS_ACTUAL_WEEK_NO ," 
        cmd2 += " CRS.CRS_COLLECTION_WEEK_NO as CRS_COLLECTION_WEEK_NO, CRS.CRS_DATE, CRS.CRS_FO, CRS.CRS_FLAG, CRS.CRS_ATTENDED, CRS.CRS_EXP_CAPITAL_AMT as CRS_EXP_CAPITAL_AMT, CRS.CRS_EXP_PROFIT_AMT as CRS_EXP_PROFIT_AMT, CRS.CRS_BALANCE_CAPITAL, CRS.CRS_BALANCE_PROFIT, CRS.CRS_PENALTY, CRS.CRS_SMS_STATUS, CRS.CRS_SMS_GROUP_STATUS, CRS.CRS_RECP_STATUS, CRS.CRS_RECP_GROUP_STATUS, CRS.CRS_REASON, CRS.CRS_ASSISTED, (CRS.CRS_ACT_CAPITAL_AMT) as CRS_ACT_CAPITAL_AMT, (CRS.CRS_ACT_PROFIT_AMT) as CRS_ACT_PROFIT_AMT, CRS.CRS_IS_VARY_FORECAST, CRS.CRS_PAIDBY_PK,";
        cmd2 += " MCRS.currweekno, MCRS.weekspaidtoday, TCRS.payfor ";
        cmd2 += " FROM T_CLIENT_REPAY_SCHEDULE AS CRS ";
        cmd2 += " LEFT JOIN T_CLIENT_LOAN as CLL ON (CLL.CLL_PK=CRS.CRS_CLL_PK)";
        cmd2 += " LEFT JOIN T_LOAN_TYPE ON (CLL.CLL_LTY_PK = LTY_PK) ";
        //Get weeks paid today
        cmd2 += " LEFT JOIN (";
        cmd2 += "     SELECT SUM( CASE WHEN CRS_DATE != '"+$scope.date+"' THEN 1 ELSE 0 END) AS currweekno, SUM( CASE WHEN  CRS_DATE == '"+$scope.date+"' THEN 1 ELSE 0 END) AS weekspaidtoday,  CRS_CLL_PK FROM T_CLIENT_REPAY_SCHEDULE ";
        cmd2 += "     WHERE CRS_ATTENDED != '' AND  CRS_FLAG='C' AND  CRS_LOAN_SAVING_FLAG = 'L'  ";
        cmd2 += "     GROUP BY CRS_CLL_PK";
        cmd2 += " ) as MCRS ON (CRS.CRS_CLL_PK = MCRS.CRS_CLL_PK) "; 
        //Get Paying for
        cmd2 += " LEFT JOIN (";
        cmd2 += "     SELECT COUNT(CRS_PK) as payfor, CRS_CLL_PK ";
        cmd2 += "     FROM T_CLIENT_REPAY_SCHEDULE ";
        cmd2 += "     WHERE CRS_DATE='"+$scope.date+"' AND CRS_ATTENDED = 'Y' AND CRS_FLAG='C' AND CRS_LOAN_SAVING_FLAG='L'";
        cmd2 += "     GROUP BY CRS_CLL_PK ";
        cmd2 += " ) AS TCRS ON (CRS.CRS_CLL_PK = TCRS.CRS_CLL_PK)" ;
        //Get 
        cmd2 += " WHERE CRS.CRS_FLAG='C' ";
        cmd2 += "   AND CLL.CLL_STATUS NOT IN (9,12,13) ";
        cmd2 += "   AND CRS.CRS_LOAN_SAVING_FLAG = 'L'";
        cmd2 += "   AND ( (CRS.CRS_DATE = '"+$scope.date+"'))";
        //cmd2 += "   AND ( CRS.CRS_ACTUAL_WEEK_NO = CRS.CRS_COLLECTION_WEEK_NO )"; 
        cmd2 += "GROUP BY CLL_PK ";
        cmd2 += " ORDER BY CLL_PK ";
        //console.log($scope.todaysCRS);
        myDB.execute(cmd2, function(results){
            if(results.length<=0){
                //printLog("no result!");
                deferred.resolve(false);
            } else {
                $.each(clients,function(c,client){
                    $.each(results, function(id, val){ 
                        printLog(val.CLL_LOAN_NUMBER);
                        printLog(val);
                        var loan = [];
                        for(var key in val){
                            var keytype = key.substring(0, 3);
                            if(keytype!='CLT'){
    
                            }
                            loan[key] = val[key];
                        } 
    
                        if(loan.CLL_LOAN_NUMBER === null) loan.CLL_LOAN_NUMBER = "-";
    
                        if(!(loan.CRS_SMS_STATUS == 'Y' || loan.CRS_SMS_GROUP_STATUS == 'Y' ||loan.CRS_RECP_STATUS == 'Y' || loan.CRS_RECP_GROUP_STATUS == 'Y')){
                            loan.CRS_ACT_PROFIT_AMT = loan.CRS_EXP_PROFIT_AMT;
                        }
    
                        $scope.user.RECEIPT_SENT = loan.CRS_RECP_GROUP_STATUS;
                        $scope.user.SMS_SENT = loan.CRS_SMS_GROUP_STATUS;
    
    
                        if(loan.CRS_SMS_STATUS !== '' || loan.CRS_SMS_GROUP_STATUS !== '' ||loan.CRS_RECP_STATUS !== '' || loan.CRS_RECP_GROUP_STATUS !== ''){
                   
                        } else {
                            loan.CRS_ACT_PROFIT_AMT = loan.CRS_EXP_PROFIT_AMT;
                            loan.CRS_ACT_CAPITAL_AMT = loan.CRS_EXP_CAPITAL_AMT;
                        }
    
                        if(loan.CRS_EXP_PROFIT_AMT === null) loan.CRS_EXP_PROFIT_AMT = 0;
                        if(loan.CRS_EXP_CAPITAL_AMT === null) loan.CRS_EXP_CAPITAL_AMT = 0;
                        if(loan.CRS_ACT_CAPITAL_AMT === null) loan.CRS_ACT_CAPITAL_AMT = 0;
                        if(loan.CRS_ACT_PROFIT_AMT === null) loan.CRS_ACT_PROFIT_AMT = 0;
    
                        if(loan.CRS_ASSISTED=='null'||loan.CRS_ASSISTED==="") loan.CRS_ASSISTED = 'N';
                        //if(loan.CRS_ATTENDED=='null'||loan.CRS_ATTENDED=="") loan.CRS_ATTENDED = 'Y';
                        if(loan.CRS_REASON=='null'||loan.CRS_REASON==="")     loan.CRS_REASON = '';
                        if(loan.CRS_SMS_GROUP_STATUS =='null') loan.CRS_SMS_GROUP_STATUS = 'N';
                        if(loan.CRS_RECP_GROUP_STATUS=='null') loan.CRS_RECP_GROUP_STATUS = 'N';
                        if(loan.CRS_SMS_STATUS =='null') loan.CRS_SMS_STATUS = 'N';
                        if(loan.CRS_RECP_STATUS=='null') loan.CRS_RECP_STATUS = 'N';
                        //initialize group values
                        if(loan.CRS_SMS_GROUP_STATUS=='Y') $scope.user.SMS_SENT = 'Y';
                        if(loan.CRS_RECP_GROUP_STATUS=='Y') $scope.user.RECEIPT_SENT = 'Y';
    
                        loan.isOpen = false; // For toggling detail view on screen
                        loan.paidbyothers = false;
                        if(loan.CRS_PAIDBY_PK !== undefined && loan.CRS_PAIDBY_PK !== null && loan.CRS_PAIDBY_PK !== ''){ 
                            loan.paidbyothers = true;
                            loan.paidonbehalfby = loan.CRS_PAIDBY_PK;
                        }
    
                        loan.actual_amount = 0; 
    
                        if(loan.CRS_COLLECTION_WEEK_NO === null || loan.payfor === null){
                            loan.payfor = 1;
                        }  else {
                            if(loan.CRS_ATTENDED !== "") {
                                loan.payfor = parseFloat(loan.weekspaidtoday);
                            } else {
                                printLog("payfor "+loan.payfor);
                            }
                        }
    
                        if(loan.payfor < 0) {
                            loan.payfor =  0;
                        }
                        printLog("get loans "+loan.CLL_LOAN_NUMBER);
                        printLog(loan);
                        // client.loans.push(loan); 
                        if(client.CLT_PK == loan.CLL_CLT_PK){
                            client.isAbsent = "";
                            client.reason = loan.CRS_REASON;
                            client.sms_status = loan.CRS_SMS_STATUS;
                            client.rcp_status = loan.CRS_RECP_STATUS;
                            client.sms_group_status = loan.CRS_SMS_GROUP_STATUS;
                            client.rcp_group_status = loan.CRS_RECP_GROUP_STATUS;
    
                            if(loan.CRS_ATTENDED == 'N') {
                              client.isAbsent = true;
                            }
                            $scope.getLoanActualAmt(loan);
                            client.loans.push(loan);
                            printLog(client);
                        }
                    }); 
                    if(c == clients.length -1){
                        deferred.resolve(clients);
                    }
                });
            }
        });

        return deferred.promise();
    };
    
    $scope.getResults = function(results) {

        var dt = new Date();
        var time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();
 
        $scope.isGroupSelected = true;
        var rescount = results.length;
        var c =0;
        var isLast = false;
        $scope.user.clients = []; //reset client list

        var clients = [];

        $.each(results, function(id, val){

            var client = {
                    loans: [],
            };
            for(var key in val){
                var keytype = key.substring(0, 3);
                if(keytype=='CLT'){
                    client[key] = val[key];
                }
            }

            client.loans = [];
            client.products = [];
            client.newProducts = [];
            client.ranproducts = [];
            client.isAbsent = "";
            client.reason = "";
            client.sms_status = "";
            client.rcp_status = "";
            client.sms_group_status = "";
            client.rcp_group_status = "";
            client.allloanprds = [];
            client.selectedProduct = null;
            client.showdetails = true;

            clients.push(client); 
        });
        
        var getloans = $scope.getLoans(clients);

        $scope.user.clients = [];
        $.when(getloans).done(function(new_clients) {
 
            console.log("new_clients");
            console.log(new_clients);

            if(new_clients == false){
                var nclients = clients;
            } else {
                var nclients = new_clients;
            }
             
            console.log(nclients);
            $.each(nclients,function(c,client){

                if(client.loans && client.loans.length > 0){
                    if(client.loans[0].CRS_ATTENDED == 'N') client.isAbsent = true;
                    client.CRS_REASON = client.loans[0].CRS_REASON;
                    client.sms_status = client.loans[0].CRS_SMS_STATUS;
                    client.rcp_status = client.loans[0].CRS_RECP_STATUS;
                }

                client.all_existing_prds = [];
                var existingloans = "";
                $.each(client.loans,function(l,loan){
                    if(existingloans !== "") existingloans += ",";
                    existingloans += loan.CLL_Pk;
                    getTotalExpectedCaptialAndProfitFromDb(loan.CRS_CLL_PK,loan.CRS_ACTUAL_WEEK_NO,loan.payfor)
                    .then((v) => {
                        loan.total_expected_capital = v.total_expected_capital
                        loan.total_expected_profit = v.total_expected_profit
                    })
                });

                $scope.user.clients.push(client);
            });
            var getAllLoanPrd = $scope.getAllLoanPrd($scope.user.clients);
            $.when(getAllLoanPrd).done(function(allprds){
                $scope.$apply(); 
            });

            var getpds   = $scope.getProducts($scope.user.clients);
            var getrpds  = $scope.addRanProducts($scope.user.clients);
            var getnewprds = $scope.getNewProducts($scope.user.clients);

            $.when(getpds,getrpds,getnewprds).done(function(getpds,getrpds,getnewprds) {
                // console.log('product done');
                // console.log(getpds);
                
                $scope.refreshClient(); 

            });
        });
    };

    $scope.getNewProducts = function(clients){

        $.each(clients,function(c,client){

            var cmd = "SELECT * FROM T_CLIENT, T_CLIENT_PRODUCT_MAPPING, T_PRODUCT_MASTER WHERE CPM_CLT_PK = CLT_PK AND CLT_VILLAGE="+localStorage.getItem('currentVillage')+" AND CPM_PRM_PK = PRM_PK AND CPM_CHKNEW = 2 AND CPM_CLT_PK="+client.CLT_PK;
            myDB.execute(cmd,function(res){
                //printLog(res);
                $.each(res,function(i,val){
                    var prd = {
                        NAME: val.PRM_LOCAL_NAME,
                        CPM_CLL_PK: val.CPM_CLL_PK,
                        CPM_CLT_PK: val.CPM_CLT_PK
                    };
                    client.newProducts.push(prd);
                    var key = {
                        PRM_CODE : val.PRM_CODE,
                        CLL_PK: val.CPM_CLL_PK,
                        CLT_PK: val.CPM_CLT_PK
                    };
                    client.all_existing_prds.push(key);
                });
            });

        });

    };

    $scope.getbpmproductTotal = function(PRM_LOCAL_NAME){


        //checking
        var sum = 0.00;
        if($scope.user.selectedGroup !== null){
            var clientsv = $filter('filter')($scope.user.clients, { CLT_GROUP_ID: $scope.user.selectedGroup.value });
            var clients = $filter('filter')(clientsv, { CLT_CENTER_ID: $scope.user.selectedGroup.centerid });

            $.each(clients,function(c,client){
                $.each(client.products,function(p,prd){
                    if(prd.PRM_LOCAL_NAME == PRM_LOCAL_NAME){
                        sum += (parseFloat(prd.CRS_ACT_PROFIT_AMT) + parseFloat(prd.CRS_ACT_CAPITAL_AMT));
                    }
                });
                $.each(client.ranproducts,function(p,prd){
                    if(prd.PRM_LOCAL_NAME == PRM_LOCAL_NAME){
                        sum += (parseFloat(prd.CRS_ACT_PROFIT_AMT) + parseFloat(prd.CRS_ACT_CAPITAL_AMT));
                    }
                });
            });
        }

        return sum;

    };

    $scope.loadClient = function(){

        cmd2 =  "SELECT CLT_PK, CLT_FULL_NAME, CLT_STATUS, CLT_CLEINT_ID, CLT_MOB_NO_1, CLT_STATUS, CLT_IS_GROUP_LEADER, CLT_GROUP_ID, CAST(CLT_CENTER_ID AS INT) as CLT_CENTER_ID ";
        cmd2 += " FROM T_CLIENT LEFT JOIN T_CLIENT_REPAY_SCHEDULE AS CRS ON (CLT_PK=CRS.CRS_CLT_PK)  ";  
        cmd2 += " WHERE CLT_VILLAGE="+localStorage.getItem('currentVillage')+" AND (CLT_STATUS in (7,21,26,27,40)) AND (CRS.CRS_FLAG='C' AND CRS.CRS_CLL_PK = 0 AND  CRS.CRS_DATE='"+$scope.date+"') GROUP BY CLT_PK ORDER BY CLT_CLEINT_ID";  //without joining to CPM and PRM tables yet; Do records need to be limited to 5?
        //printLog(cmd2);
        myDB.execute(cmd2, function(results){
            console.log('client result');
            console.log(cmd2);
            console.log(results);
            if(results.length<=0){
                //printLog("no result!");
                return false;
            } else {
                $scope.getResults(results); //Loading Clients
            }

        });
    };  

    //check if $scope.groups have any items
    $scope.isClientExist = function(){
       if ($scope.user.clients.length > 0){
            return true;
        } else {
            return false;
        }
    };


    $scope.nextTable = function(){
        if($scope.isLoanTable)
            $scope.isLoanTable = false;
    };


    $scope.previousTable = function(){
        if(!$scope.isLoanTable)
            $scope.isLoanTable = true;
    };

    $scope.updateForWeek = function(loan){

        var payfor = parseInt(loan.payfor);
        var totalweeks = loan.CLL_TOTAL_LOAN_WEEKS;
        var currentLoanWeekNumber = loan.CRS_ACTUAL_WEEK_NO;
        var maxpayable = parseInt(totalweeks) - parseInt(currentLoanWeekNumber) + 1; //always plus 1 to include current week

        if(payfor > maxpayable) loan.payfor = maxpayable;
    };

    $scope.validateAmt = function(client,product,type){

        if(type == 'withdrawal' || type =='saving'){

            var thisval = product.ACT_WTH_AMT;
            if(thisval == 0){

            } else {
                if(thisval < 500 && thisval > 0){
                    product.ACT_WTH_AMT = 500;
                } else if (thisval > 500000){
                    product.ACT_WTH_AMT = 500000;
                }

                var closing_fee = 0;
                if(product.PRM_CLOSING_CHARGES !== null) closing_fee = product.PRM_CLOSING_CHARGES;
                var balance = $scope.getSavingsBalance(client,product);

                var ACT_COL_AMT = 0;
                if(product.ACT_COL_AMT !== null ) ACT_COL_AMT = product.ACT_COL_AMT;

                balance = balance - closing_fee - parseFloat(product.ACT_WTH_AMT); //+ parseFloat(product.CRS_ACT_CAPITAL_AMT);

                if(balance < 0){
                    product.ACT_WTH_AMT = 0;

                     swal({
                        title: i18n.t("messages.Alert"),
                        text: i18n.t("messages.InvalidWithdrawAmt"),
                        type: "error",
                        confirmButtonColor: "#80C6C7",
                        confirmButtonText: "Ok",
                        closeOnConfirm: true
                    });

                    return false;
                }
            } 
        }

        return true;
    };

    $scope.checkLoanRepayment = function(client,loan){
        printLog("checking repayment");
        printLog(client.isAbsent);
        printLog(loan.payfor);
        if(client.isAbsent && loan.payfor > 0){
            var inputOptionsPromise = new Promise(function (resolve) {

              var clientsc = $filter('filter') ($scope.user.clients, { CLT_CENTER_ID: client.CLT_CENTER_ID });
              var clients = {};

              for(var c in clientsc){
                  var cc = clientsc[c];
                  clients[cc.CLT_PK] = cc.CLT_FULL_NAME + " ("+cc.CLT_CLEINT_ID+") ";
              }
              resolve(clients);

            });
            swal({
                title: i18n.t("messages.WhoPaid"),
                text: "",
                input: 'select',
                inputOptions : inputOptionsPromise,
                inputPlaceholder: 'Please select'
            }).then(function(chosen_CLT_PK){
                printLog("output");
                printLog(chosen_CLT_PK);
                loan.paidonbehalfby = chosen_CLT_PK.value;
                printLog(loan.paidonbehalfby);
                swal.resetDefaults();
                $scope.$apply();
            });
        }
    };

    $scope.checkProductPayment = function(client,product){
        printLog("checking repayment");
        printLog(client.isAbsent);
        printLog(product.CRS_ACT_CAPITAL_AMT);
        if(client.isAbsent && product.CRS_ACT_CAPITAL_AMT > 0){
            var inputOptionsPromise = new Promise(function (resolve) {

              var clientsc = $filter('filter') ($scope.user.clients, { CLT_CENTER_ID: client.CLT_CENTER_ID });
              var clients = {};

              for(var c in clientsc){
                  var cc = clientsc[c];
                  clients[cc.CLT_PK] = cc.CLT_FULL_NAME + " ("+cc.CLT_CLEINT_ID+") ";
              }
              resolve(clients);
            });
            swal({
                title: i18n.t("messages.WhoPaid"),
                text: "",
                input: 'select',
                inputOptions : inputOptionsPromise,
                inputPlaceholder: 'Please select'
            }).then(function(chosen_CLT_PK){
                printLog("output");
                printLog(chosen_CLT_PK);
                product.CRS_PAIDBY_PK = chosen_CLT_PK.value;
                printLog(product.CRS_PAIDBY_PK);
                swal.resetDefaults();
                $scope.$apply();
            });
        }
    };

    $scope.absentControl = function(client){

        var canPayLoanIfAbsent = true;
        var canPayProductIfAbsent = true;

        let currentLoan = client.loans[0]; 
        let hasLoan = client.loans && client.loans.length> 0 
        let someNotClearCondition = (currentLoan.CRS_ATTENDED == 'Y' || currentLoan.CRS_ATTENDED == 'null' || currentLoan.CRS_ATTENDED == null || client.isAbsent == "" || client.isAbsent == false) 

        if(!hasLoan||!someNotClearCondition){ 
            client.isAbsent = false;
            if(!hasLoan){
                for(var l in client.loans){
                    client.loans[l].CRS_ATTENDED = '';
                    client.loans[l].payfor = 1;
                    client.loans[l].paidonbehalfby = null;
                    $scope.updateForWeek(client.loans[l]);
                }
            }
            for(var prd in client.products ){
              client.products[prd].CRS_ACT_CAPITAL_AMT = client.products[prd].CRS_EXP_CAPITAL_AMT;
              client.products[prd].CRS_ATTENDED = '';
              client.products[prd].CRS_PAIDBY_PK = null;
            } 

            return 
            // early return
        }

 
            var htmlChkBox = "";
            var htmlSelBox = "";
            var htmlBoxArray = [];
            htmlSelBox = '<select id="reasons" name="reasons"><option value="Izin">Izin</option><option value="Sakit">Sakit</option><option value="Cuti">Cuti</option><option value="Alpa">Alpa</option></select>'; 


        client.isAbsent = true;

        swal({
            title: i18n.t("messages.IsPaymentonBehalf"),
            text: " ",
            type: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No',
        }).then(function (confirm) {

            let isPaidByBehave = !!confirm.value
            client.isAssisted = isPaidByBehave;

                for(var l in client.loans){
                    client.loans[l].CRS_ATTENDED = 'N';
                client.loans[l].CRS_ASSISTED = isPaidByBehave ?'Y' :'N';
                if(!isPaidByBehave){
                    client.loans[l].CRS_ACT_CAPITAL_AMT = 0;
                    client.loans[l].CRS_ACT_PROFIT_AMT = 0; 
                }
                    if(!canPayLoanIfAbsent){
                        client.loans[l].payfor = 0;
                        $scope.updateForWeek(client.loans[l]);
                    }
                    htmlChkBox += '<div style="width:100%;display:inline-block;"><input style="float:left;" id="loan_'+client.loans[l].CLL_PK+'" type="checkbox" name="loan_'+client.loans[l].CLL_PK+'" value="loan_'+client.loans[l].CLL_PK+'" /><label style="float:left" for="loan_'+client.loans[l].CLL_PK+'">'+i18n.t("LOANS."+client.loans[l].LTY_DESCRIPTION)+'</label></div><br/>';
                    htmlBoxArray.push('loan_'+client.loans[l].CLL_PK);
                }


            for(var prd in client.products){
                if(!canPayProductIfAbsent){
                    client.products[prd].CRS_ACT_CAPITAL_AMT = 0.00;
                }
                client.products[prd].CRS_ATTENDED = 'N';
                client.products[prd].CRS_ASSISTED = isPaidByBehave ?'Y' :'N';
                if(!isPaidByBehave){
                    client.products[prd].CRS_ACT_CAPITAL_AMT = 0;
                    client.products[prd].CRS_ACT_PROFIT_AMT = 0; 
                }

                htmlChkBox += '<div style="width:100%;display:inline-block;"><input style="float:left;" id="product_'+client.products[prd].CRS_PK+'" type="checkbox" name="product_'+client.products[prd].CRS_PK+'" value="product_'+client.products[prd].CRS_PK+'" onclick=" checkPopChecked('+client.products[prd].CRS_PK+')" /><label style="float:left" for="product_'+client.products[prd].CRS_PK+'">'+client.products[prd].PRM_LOCAL_NAME+'</label><input placeholder="Amount" type="number" id="amount_'+client.products[prd].CRS_PK+'" value="'+ client.products[prd].CRS_EXP_CAPITAL_AMT +'" disabled /></div><br/>';
                htmlBoxArray.push('product_'+client.products[prd].CRS_PK);
                htmlBoxArray.push('amount_'+client.products[prd].CRS_PK);
            }

            for(var rprd in client.ran_products ){
                if(!canPayProductIfAbsent){
                    client.ran_products[rprd].CRS_ACT_CAPITAL_AMT = 0.00;
                }
            }

            if(!isPaidByBehave){
                // exit ,early return
                return
            }

                    swal.setDefaults({
                        confirmButtonText: i18n.t("buttons.Next")+' &rarr;',
                        showCancelButton: true,
                        animation: false,
                        progressSteps: ['1', '2', '3']
                    });
                    var reasonOptionsPromise = new Promise(function(resolve) {
                        var reasons = [];
                        reasons['Izin'] = 'Izin';
                        reasons['Sakit'] = 'Sakit';
                        reasons['Cuti'] = 'Cuti';
                        reasons['Alpa'] = 'Alpa';
                        resolve(reasons);
                    })
                    var inputOptionsPromise = new Promise(function (resolve) {
    
                        var clientsc = $filter('filter') ($scope.user.clients, { CLT_CENTER_ID: client.CLT_CENTER_ID });
                        var clients = {};
    
                        for(var c in clientsc){
                            var cc = clientsc[c];
                            clients[cc.CLT_PK] = cc.CLT_FULL_NAME + " ("+cc.CLT_CLEINT_ID+") ";
                        }
                        resolve(clients);
    
                    });
    
                    var steps = [
                        {
                          title: i18n.t("messages.AbsentReason"),
                          text: '',
                          input: 'select',
                          inputOptions: reasonOptionsPromise
                        },
                        {
                          title: i18n.t("messages.WhoisPayer"),
                          text: '',
                          input: 'select',
                          inputOptions: inputOptionsPromise
                        },
                        {
                            title: i18n.t("messages.PayforWhichProducts"),
                            html: htmlChkBox,
                            preConfirm: function() {
                                return new Promise(function(resolve) {
                                    var output = [];
                                    for(var h in htmlBoxArray){
    
                                        var inp = $('#'+htmlBoxArray[h]);
    
                                        var inpType = inp.attr('type');
                                        printLog(inpType);
                                        if(inpType == 'number'){
                                            output.push(inp.val());
                                        } else if (inpType == 'checkbox') {
                                            if(inp.is(":checked")){
                                                output.push(inp.val());
                                            } else {
                                                output.push(0);
                                            }
                                        }
    
                                    }
                                    resolve(output);
                                });
                            }
                        }
                    ];
    
                    swal.queue(steps).then(function (result) {
                        swal.resetDefaults();
                        console.log('origclient');
                        console.log(client);
                        $scope.updatePayonBehalf(result.value,client);
    
                    }, function () {
                      swal.resetDefaults();
                    });

            }, function (dismiss) {
                
            });

    };

    $scope.getGroupTotal = function(){
        var total = 0;
        var clients = $filter('filter')($scope.user.clients, { CLT_GROUP_ID: $scope.user.selectedGroup.value, CLT_CENTER_ID: $scope.user.selectedGroup.centerid });
        for (let i = 0; i < clients.length; i++) {
            const client = clients[i];
            total += parseInt($scope.getClientActualTotal(client));
        }
        return total;
    }

    $scope.updatePayonBehalf = function(result,data){
        console.log(result);
        var reason = result[0];
        var paidby = result[1];
        var products = result[2];

        var client = data;
 
        client.CRS_REASON = reason;
        
        console.log(client);
        for(var a in products){
            console.log(a);
            if(products[a] !== 0){
                var par = products[a].split('_');
                var type = par[0];
                console.log(type);
                var pk = parseInt(par[1]);
                if(type == 'loan'){
                    for(var l in client.loans){
                        var loan = client.loans[l];
                        if(loan.CLL_PK == pk){
                            loan.paidbyothers = true;
                            loan.paidonbehalfby = parseInt(paidby);
                            loan.payfor = 1;
                            $scope.updateForWeek(loan);
                        }
                    }
                } else if (type == 'product'){
                    for(var p in client.products){

                        var product = client.products[p];
                        if(product.CRS_PK == pk){
                            product.CRS_PAIDBY_PK = parseInt(paidby);
                            var amtIndex = parseInt(a) + 1;
                            product.CRS_ASSISTED = 'Y';
                            product.CRS_ATTENDED = 'N';
                            product.CRS_ACT_CAPITAL_AMT = products[amtIndex];
                        }

                    }
                }
            }
        }
        console.log(client);
        $scope.sendMsg('C', 'R', client); 
    };

    $scope.getTotalLoanExp = function(){
        var sum=0;
        for(var client in $scope.user.clients){
            sum += $scope.user.clients[client].CRS_COLLECTION_AMT;
        }
        $scope.totalLoanAmtExp = sum;
        return sum;
    };

    $scope.getTotalLoanAct = function(){
        
        console.log('totaltotal');
        var sum=0;
        for(var cl in $scope.user.clients){
            var obj = $scope.user.clients[cl];
            console.log(obj);
            //sum += obj.CRS_TOTALPAID;
            if ( obj.loans !== undefined && obj.loans.length > 0 ){
                for (let l = 0; l < obj.loans.length; l++) {
                    const loan = obj.loans[l];
                    console.log(loan);
                    if((loan.CRS_SMS_STATUS == 'Y' ||
                    loan.CRS_SMS_GROUP_STATUS == 'Y' ||
                    loan.CRS_RECP_STATUS == 'Y' ||
                    loan.CRS_RECP_GROUP_STATUS == 'Y')){
                            sum += parseInt(loan.CRS_ACT_CAPITAL_AMT);
                            sum += parseInt(loan.CRS_ACT_PROFIT_AMT);
                        }
                }
            }
        }
        
        console.log('totaltotalsum');
        console.log(sum);
        $scope.totalLoanAmtAct = sum;
        return $scope.totalLoanAmtAct;
    };

    $scope.getGrpTotalLoan = function(){
        var sum=0;
        for(var cl in $scope.user.clients){
            var obj = $scope.user.clients[cl];
            sum += obj.CRS_TOTALPAID;
        }
        return sum;
    };

    $scope.groupActTotal = function(group){

        var sum = 0; 
        var clientsv = $filter('filter')($scope.user.clients, { CLT_GROUP_ID: group.CLT_GROUP_ID });
        var clients = $filter('filter') (clientsv, { CLT_CENTER_ID: group.centerid });

        $.each(clients,function(c,client){
            $.each(client.loans,function(l,loan){
                sum += (parseFloat(loan.CRS_ACT_CAPITAL_AMT) + parseFloat(loan.CRS_ACT_PROFIT_AMT));
                $.each(loan.products,function(p,prd){
                    sum += (parseFloat(prd.CRS_ACT_CAPITAL_AMT) + parseFloat(prd.CRS_ACT_PROFIT_AMT));
                });
            });
        });
        return sum;
    }

    $scope.groupExpTotal = function(group){

        var sum = 0;
        ////printLog($scope.user.clients);

        var clientsv = $filter('filter')($scope.user.clients, { CLT_GROUP_ID: group.CLT_GROUP_ID });
        var clients = $filter('filter') (clientsv, { CLT_CENTER_ID: group.centerid });
        $.each(clients,function(c,client){
            $.each(client.loans,function(l,loan){
                sum += (parseFloat(loan.CRS_EXP_CAPITAL_AMT) + parseFloat(loan.CRS_EXP_PROFIT_AMT));
                $.each(loan.products,function(p,prd){
                    sum += (parseFloat(prd.CRS_EXP_CAPITAL_AMT) + parseFloat(prd.CRS_EXP_PROFIT_AMT));
                });
            });
        });
        return sum;
    }

    //get total due for all groups
    $scope.grpsGetTotalDue = function(){
        var sum = 0.00;
        sum += parseFloat($scope.getTotalLoanExp());

        for(k in $scope.bpmproducts){
            sum += parseFloat($scope.bpmproducts[k].total_EXP);
        }

        return sum;
    }
    //get total collected for all groups
    $scope.getTotalLoanForOneGroup = function(centerid, groupid){
        var sum = 0;
        console.log('onegroup');
        console.log(centerid);
        console.log(groupid); 
        for(var cl in $scope.user.clients){
            var client = $scope.user.clients[cl];
            if( client.CLT_CENTER_ID == centerid && client.CLT_GROUP_ID == groupid) {
                console.log('thisclient');
                console.log(client);
                //sum += obj.CRS_TOTALPAID;
                if ( client.loans !== undefined && client.loans.length > 0 ){
                    for (let l = 0; l < client.loans.length; l++) {
                        const loan = client.loans[l];
                        console.log(client.CRS_RECP_GROUP_STATUS);
                        if(client.rcp_group_status == 'Y' || client.rcp_status == 'Y'){
                                console.log('increase sum');
                                console.log(loan.CRS_ACT_CAPITAL_AMT);
                                console.log(loan.CRS_ACT_PROFIT_AMT);
                                sum += parseInt(loan.CRS_ACT_CAPITAL_AMT*loan.payfor);
                                sum += parseInt(loan.CRS_ACT_PROFIT_AMT*loan.payfor);
                            }
                    }
                }
            }
        }
        
        console.log('totaltotalsum');
        console.log(sum);
        return sum;
    }
    $scope.grpsGetTotalCol = function(){
        var sum = 0.00;
        sum += parseFloat($scope.getTotalLoanAct());

        for(k in $scope.bpmproducts){
            sum += parseFloat($scope.bpmproducts[k].total_ACT);
        }

        return sum;
    }

     $scope.getLoanExpectedAmt = function(loan){
        var expected = parseFloat(loan.CRS_EXP_CAPITAL_AMT) + parseFloat(loan.CRS_EXP_PROFIT_AMT);
        //printLog(expected);
        return parseFloat(expected);
    }

    $scope.getLoanActualAmt_Display = function(loan,type){

        if(type == 'sum'){
            var actual = parseFloat(loan.CRS_ACT_CAPITAL_AMT) + parseFloat(loan.CRS_ACT_PROFIT_AMT);
            var payfor = loan.payfor;
            if(payfor === null) payfor = 0;
            actual = parseFloat(actual) * parseFloat(payfor);
            return parseFloat(actual);
        } else if (type == 'capital'){
            var actual = parseFloat(loan.CRS_ACT_CAPITAL_AMT) ;
            var payfor = loan.payfor;
            if(payfor === null) payfor = 0;
            actual = parseFloat(actual) * parseFloat(payfor);
            return parseFloat(actual);
        } else if (type == 'profit'){
            var actual = parseFloat(loan.CRS_ACT_PROFIT_AMT);
            var payfor = loan.payfor;
            if(payfor === null) payfor = 0;
            actual = parseFloat(actual) * parseFloat(payfor);
            return parseFloat(actual);
        }


    }

    $scope.getLoanActualAmt = function(loan){
        var actual = 0;

        var actual_amount = 0;

        var endWeek = parseInt(loan.CRS_ACTUAL_WEEK_NO) + parseInt(loan.payfor) -1;
         
        actual = parseFloat(loan.CRS_ACT_CAPITAL_AMT) + parseFloat(loan.CRS_ACT_PROFIT_AMT);
      
        if(loan.payfor == 1){
            printLog("1 week");
          
            actual_amount =  actual;
            loan.actual_amount = actual_amount;
        } else {
            printLog("more than 1 week");
            printLog(loan.payfor);
            if(endWeek == loan.CLL_TOTAL_LOAN_WEEKS){
                printLog("max week");
                ///$$$$
                loan.actual_amount = actual;
                var cmd1 = "";
                cmd1 = "SELECT CRS_EXP_CAPITAL_AMT,CRS_EXP_PROFIT_AMT FROM T_CLIENT_REPAY_SCHEDULE WHERE CRS_CLL_PK="+loan.CLL_PK+
                        " ORDER BY CRS_ACTUAL_WEEK_NO DESC LIMIT 1 ";

                myDB.execute(cmd1,function(results){
                    var row = results[0];
                    printLog(actual);
                    actual = actual - (actual / loan.payfor );
                    printLog("actual before " + actual);
                    actual += (parseFloat(row.CRS_EXP_CAPITAL_AMT) + parseFloat(row.CRS_EXP_PROFIT_AMT));
                    printLog("actual after "+ actual);

                    $scope.$apply(function(){
                        loan.actual_amount = actual;
                    });
                });

            } else {

                actual_amount =   actual;
                loan.actual_amount = actual_amount;
            }
        }


    }

    $scope.getSavingsActual = function(prd){

        var actual = parseFloat(prd.CRS_ACT_CAPITAL_AMT) + parseFloat(prd.CRS_ACT_PROFIT_AMT);

        return actual;
    }


    $scope.getSavingsExpected = function(prd){
        var expected = parseFloat(prd.CRS_EXP_CAPITAL_AMT) + parseFloat(prd.CRS_EXP_PROFIT_AMT);

        return expected;
    }

    $scope.getSavingsBalance = function(client,prd){
    
        var balance = prd.CPM_PRM_BALANCE;

        if(!balance) return 0;

        balance = parseFloat(balance.toString().replace(",",""));
        if(isNaN(balance)){
            balance = 0;
        }

        var ACT_CAPITAL_AMT_TOTAL = 0;
        var WTH_TOTAL = 0;
        var COL_TOTAL = 0;

        // var products = $filter('filter') (client.products, { PRM_PK: prd.PRM_PK });
 
        // $.each(products,function(p,prd){
        //     if(prd.CRS_ATTENDED != ""){ 
        //         if(prd.ACT_WTH_AMT != null){
 
        //         }
        //     }
        // });
     
        // var ranproducts = $filter('filter') (client.ranproducts, { PRM_PK: prd.PRM_PK });
 
        // $.each(ranproducts,function(p,prd){
        //     if(prd.CRS_ATTENDED != ""){
                 
        //         if(prd.ACT_WTH_AMT != null){
                    
        //         }
        //     }
        //     if(prd.ACT_COL_AMT > 0){
                
        //     }
        // }); 

        var WTH = prd.ACT_WTH_AMT;

        if(WTH == null) WTH = 0;

        //console.log(balance);
 
        var newbalance = parseFloat(balance) + parseFloat(ACT_CAPITAL_AMT_TOTAL) - parseFloat(WTH_TOTAL) - parseFloat(COL_TOTAL);

        //console.log(newbalance);

        return newbalance;

    }
    $scope.getLoanBalance = function(loan){
         

        var outstanding = loan.CLL_OUTSTANDING;


        return outstanding;

    }

    $scope.getClientActualTotal = function(client){

        var sum = 0;
        if(jQuery.type( client.loans ) === "array"){
            if(isAbsentAndNoPaidBehave(client)){
                return 0;
            }

            $.each(client.loans, function(index,loan){
                var act_profit = 0;
                if(loan.CRS_ACT_PROFIT_AMT != "") act_profit = loan.CRS_ACT_PROFIT_AMT;

                var act_capital = 0;
                if(loan.CRS_ACT_CAPITAL_AMT != "" ) act_capital = loan.CRS_ACT_CAPITAL_AMT;

                sum +=  ( (parseFloat(act_capital) + parseFloat(act_profit))  * parseInt(loan.payfor) );

            });
            $.each(client.products,function(i,prd){

                var act_profit = 0;
                if(prd.CRS_ACT_PROFIT_AMT !== "") act_profit = prd.CRS_ACT_PROFIT_AMT;

                var act_capital = 0;
                if(prd.CRS_ACT_CAPITAL_AMT !== "" ) act_capital = prd.CRS_ACT_CAPITAL_AMT;

                var act_wth = prd.ACT_WTH_AMT  === null ? 0 : parseFloat(prd.ACT_WTH_AMT );

                sum += (parseFloat(act_capital) + parseFloat(act_profit) - parseFloat(act_wth));
            });
            $.each(client.ranproducts,function(i,prd){

                var act_profit = 0;
                if(prd.CRS_ACT_CAPITAL_AMT !== "" && prd.CRS_ACT_CAPITAL_AMT !== null) act_profit = prd.CRS_ACT_CAPITAL_AMT;

                var act_wth = prd.ACT_WTH_AMT  === null ? 0 : parseFloat(prd.ACT_WTH_AMT );

                sum += (parseFloat(act_profit)  - parseFloat(act_wth) );
            });
            if ( client.newProducts.length > 0) {
                $.each(client.newProducts,function(i,prd){
                    if ( prd.PRM_CODE == '002.0007' && prd.CAPITAL !== 'null') { 
                        sum += parseFloat(prd.CAPITAL);
                    }
                });
            }
        }
        return sum;
    }

    $scope.testClient= function(client) {
        console.log("test client",client) 
    }

    $scope.getClientTotal = function(client){
        var sum = 0;
        if(jQuery.type( client.loans ) === "array"){
            ////printLog(client);
            $.each(client.loans, function(index,loan){
                var exp_profit = 0;
                if(loan.CRS_EXP_PROFIT_AMT != "") exp_profit = loan.CRS_EXP_PROFIT_AMT;

                var exp_capital = 0;
                if(loan.CRS_EXP_CAPITAL_AMT != "" ) exp_capital = loan.CRS_EXP_CAPITAL_AMT;

                sum += (parseFloat(exp_capital) + parseFloat(exp_profit));

            });
            $.each(client.products,function(i,prd){

                var exp_profit = 0;
                if(prd.CRS_EXP_PROFIT_AMT != "") exp_profit = prd.CRS_EXP_PROFIT_AMT;

                var exp_capital = 0;
                if(prd.CRS_EXP_CAPITAL_AMT != "" ) exp_capital = prd.CRS_EXP_CAPITAL_AMT;

                sum += (parseFloat(exp_capital) + parseFloat(exp_profit));
            });
            
        }
        return sum;
    }

    $scope.checkIsGroupSelected = function(){

        ////printLog($scope.user.clients);

        var response = true;

        if($scope.user.selectedGroup.value == null){
            response = false;
        }

        return response;
    }

    $scope.villeChange = function(){


        $scope.loadGroup();

    }

    $scope.groupChange = function(){
        
        $scope.selectGroup();
         
    }

    $scope.groupCompleted = function(group){
        //console.log(group);
        //console.log('groupppp');
        if(group === undefined) return false;
        var check = true;
        if(group.CRS_RECP_GROUP_STATUS.indexOf('Y') !== -1){
            check = true;
            return check;
        }
        if(group.CRS_SMS_GROUP_STATUS.indexOf('Y') !== -1){
            check = true;
            return check;
        }

        var recp_st = group.CRS_RECP_STATUS.split(',');
        var sms_st = group.CRS_SMS_STATUS.split(',');
 
        var recp_check = true;
        var sms_check = true;
        var recp_cnt = 0;
        var sms_cnt = 0;
        //console.log(recp_st);
        //console.log(sms_st);
        $.each(recp_st,function(i,rcp){
            if(rcp == 'Y') recp_cnt++;
            if(rcp != 'Y'){
                recp_check = false;
            }
        });

        $.each(sms_st,function(i,sms){
            if(sms == 'Y') sms_cnt++;
            if(sms != 'Y'){
                sms_check = false;
            }
        });
 
        if(recp_check || sms_check || sms_cnt >= group.clientcount || recp_cnt >= group.clientcount) return true;

        return false;
    }

 
    $scope.getSMSClientStatus = function(client){ return client.products[0].CRS_SMS_STATUS=='Y'; };  //has client sent SMS?
    $scope.getSMSGrpStatus = function(){ return $scope.user.SMS_SENT=='Y';};             //is group sms sent for group
    $scope.getReceiptClientStatus = function(client){
        ////printLog(client.loans);
        return client.products[0].CRS_RECP_STATUS=='Y';
    };  //has client printed receipt?
    $scope.isGroupPrinted = function(group){
        //printLog(group);
        //printLog($scope.user.clients);
        if($scope.user.clients.length == 0) return false;
        var clientsv = $filter('filter')($scope.user.clients, { CLT_GROUP_ID: group.CLT_GROUP_ID });
        //printLog(clientsv);
        var clients = $filter('filter')(clientsv, { CLT_CENTER_ID: group.CLT_CENTER_ID });
        //printLog(clients);
        if(clients[0] == undefined) return false;
        return clients[0].products[0].CRS_RECP_GROUP_STATUS == 'Y';
    }
    $scope.getReceiptGrpStatus = function(){
        if($scope.user.clients.length == 0) return false;
        var clientsv = $filter('filter')($scope.user.clients, { CLT_GROUP_ID: $scope.user.selectedGroup.value });
        var clients = $filter('filter')(clientsv, { CLT_CENTER_ID: $scope.user.selectedGroup.centerid });
        if(clients[0] == undefined) return false;
        return clients[0].products[0].CRS_RECP_GROUP_STATUS == 'Y';
    };          //has group printed receipt
    $scope.getAbsentStatus = function(client){ return client.loans[0].CRS_ATTENDED == 'N'; }
    $scope.isSubmited = function(client){
        if(client.products[0].CRS_SMS_STATUS == 'Y'||
            client.products[0].CRS_SMS_GROUP_STATUS == 'Y'||
            client.products[0].CRS_RECP_STATUS == 'Y'||
            client.products[0].CRS_RECP_GROUP_STATUS == 'Y' ){
            return true;
        }
        if(client.products && client.products.length > 0){
            if(client.products[0].CRS_RECP_STATUS == 'Y'||
                client.products[0].CRS_RECP_GROUP_STATUS == 'Y'){
                return true;
            }
        }
        return false;
    }
    $scope.isAccountClose = function(prd){
        ////printLog(prd);
        if(prd.CPC_STATUS == 53 || prd.CPC_STATUS == 55){

            return true;
        }
        return false;
    }
    $scope.isRandomCollection = function(product){
        ////printLog(product);
        if(product.PRM_DEPOSIT_FREQUENCY == 'R'){
            return true;
        }
        return false;
    }
    $scope.checkClosed = function(product){

        if((product.CPC_STATUS == 53  && product.CPC_CREATED_DATE == $scope.anotherdate) || (product.CPC_STATUS==3  && product.CPC_DISBURSE_DATE == $scope.anotherdate) ){ // CHECK IF CLOSED
            return true;
        }
        return false;
    }
    $scope.expandLoan = function(client,loan,$event){

        $.each(client.loans,function(l,loan){
            loan.isOpen = false;
        })

        if(loan.isOpen){
            loan.isOpen = false;
        } else {
            $('html, body').animate({ scrollTop:  angular.element($event.currentTarget).offset().top - 50 }, 'slow');
            loan.isOpen = true;
        }
    }
    $scope.pressTimer = null;
    $scope.toggleAssistedDown = function(loan,$event){
        $scope.pressTimer = window.setTimeout(function() { $scope.toggleAssisted(loan); },500)
    }
    $scope.toggleAssistedUp = function(loan,$event){
        clearTimeout($scope.pressTimer);
    }

    $scope.toggleAssisted = function(loan,client){

        if($scope.isSubmited(client)) return false;

        $.each(client.products,function(p,prd){
            if(prd.CRS_ASSISTED == 'Y'){
                prd.CRS_ASSISTED = 'N'
            } else {
                prd.CRS_ASSISTED = 'Y'
            }
        })
        $.each(client.loans,function(p,prd){
            if(loan.CRS_ASSISTED == 'Y'){
                loan.CRS_ASSISTED = 'N'
            } else {
                loan.CRS_ASSISTED = 'Y'
            }
        })


    }

    $scope.getLoanActual = function(loan,client) {
        var sum = 0;

        if(client.products[0].CRS_ATTENDED != ""){

            sum += ( parseFloat(loan.CRS_ACT_CAPITAL_AMT) + parseFloat(loan.CRS_ACT_PROFIT_AMT) );

            var filteredProducts = $filter('filter')(client.products, { CRS_CLL_PK: loan.CLL_PK });

            for(p in filteredProducts){
                sum += ( parseFloat(filteredProducts[p].CRS_ACT_CAPITAL_AMT) + parseFloat(filteredProducts[p].CRS_ACT_PROFIT_AMT) );
            }

            var filteredRanProducts =  $filter('filter')(client.ranproducts, { CPM_CLL_PK: loan.CLL_PK });

            for(p in filteredRanProducts){
                sum += ( parseFloat(filteredRanProducts[p].CRS_ACT_CAPITAL_AMT) + parseFloat(filteredRanProducts[p].CRS_ACT_PROFIT_AMT) );
            }

        }

        return sum;
    }

    $scope.getLoanExpected = function(loan,client) {
        var sum = 0;

        var exp_capital = 0;
       if(loan.CRS_EXP_PROFIT_AMT != "") exp_capital = loan.CRS_EXP_PROFIT_AMT;

        var exp_profit = 0;
        if(loan.CRS_EXP_CAPITAL_AMT != "") exp_profit = loan.CRS_EXP_CAPITAL_AMT;

        sum += (parseFloat(loan.CRS_EXP_PROFIT_AMT) + parseFloat(loan.CRS_EXP_CAPITAL_AMT)) ;

        var filteredProducts = $filter('filter')(client.products, { CRS_CLL_PK: loan.CLL_PK });

        for(p in filteredProducts){
            sum += (parseFloat(filteredProducts[p].CRS_EXP_CAPITAL_AMT) + parseFloat(filteredProducts[p].CRS_EXP_PROFIT_AMT)) ;
            //sum -= parseFloat(loan.products[p].CRS_FLEXI_WTH);
        }

        return sum;
    } 
$scope.getOriginalBalance = function(client,prd,type){

    var balance = prd.CPM_PRM_BALANCE;

    //printLog("balance "+balance);

    if(type == 'ran'){
        var products = $filter('filter')( client.ranproducts, { PRM_PK : prd.PRM_PK } );
    } else {
        var products = $filter('filter')( client.products, { PRM_PK : prd.PRM_PK } );
    }

    total =0;
    if(products.length > 0 ){
        //printLog(products);
        $.each(products,function(p,prd){
            total = parseFloat(total) + parseFloat(prd.CRS_ACT_CAPITAL_AMT);
            if(prd.ACT_WTH_AMT != null) total = parseFloat(total) - parseFloat(prd.ACT_WTH_AMT);
        });
    }
    //printLog("total "+total);

    return parseFloat(balance) - parseFloat(total);

}

$scope.getSavingWithdrawal = function(prd){

    var amount = 0;

    if(prd.ACT_WTH_AMT != null) {
        amount = prd.ACT_WTH_AMT;
    }

    return amount;

}

$scope.updateSavingBalance = function(client,type,prd){
 
    var balance = 0;
    var total = 0;
    var proceed = false;


    var prd_array = [];
    if(type == 'ran'){
        if(client.ranproducts == undefined) return false;
        var prdks = client.ranproducts;
    } else {
        if(client.products == undefined ) return false;
        var prdks = client.products;
    }


    $.each(prdks,function(p,prd){
        if(prd.PRM_CODE == "002.0004"){
            prd.CPM_PRM_BALANCE = parseFloat(prd.CPM_PRM_BALANCE) + parseFloat(prd.CRS_ACT_CAPITAL_AMT) - parseFloat(prd.ACT_WTH_AMT);
            return true;
        }
        if ($.inArray(prd.PRM_PK, prd_array) == -1)
        {
            prd_array.push(prd.PRM_PK);
        }
    });
 
    $.each(prd_array,function(i,pa){
        if(type == 'ran'){
            var products = $filter('filter')( client.ranproducts, { PRM_PK : pa } );
        } else {
            var products = $filter('filter')( client.products, { PRM_PK : pa } );
        }
      
        total =0;
        if(products.length > 0 ){
            $.each(products,function(p,prd){
                total = parseFloat(total) +  parseFloat(prd.CRS_ACT_CAPITAL_AMT) - parseFloat(prd.ACT_WTH_AMT);
            });
        
            $.each(products,function(p,prd){
                
                prd.CPM_PRM_BALANCE = parseFloat(prd.CPM_PRM_BALANCE) +  parseFloat(total) ;
         
            });
        }
    })
}
function contains(a, obj) {
    if (a === undefined) return false;
    var i = a.length;
    while (i--) {
       if (a[i] === obj) {
           return true;
       }
    }
    return false;
}
$scope.updateGroup = function(center,group,type,amount,isGroup,clientpk){
    printLog("group update");

    $.each($scope.user.village.groups,function(v,vil){
        if(vil.CLT_CENTER_ID == center && vil.CLT_GROUP_ID == group){

            if(type == 'C'){ //If Collection
                vil.total_act += parseFloat(amount);
            } else if (type == 'D'){ // If Withdrawal
                vil.total_wth_act += parseFloat(amount);
            } else if (type == 'F') {
                vil.total_act += parseFloat(amount);
                vil.total_exp += parseFloat(amount);
            }

            var recp_st = vil.CRS_RECP_STATUS.split(",")

            $.each(recp_st,function(r,rs){
                if(rs != "Y"){
                    rs = "Y";
                    recp_st[r] = "Y";
                    return false;
                }
            });
            printLog(recp_st);
            vil.CRS_RECP_STATUS = recp_st.join();
            if(vil.loans !== undefined && !contains(vil.loans,clientpk)){
                vil.loans.push(clientpk);
            }
         
            printLog(vil);

        }
    });

}

$scope.payforOnChange=(loan) => {
   $scope.updateForWeek(loan);
   getTotalExpectedCaptialAndProfitFromDb(loan.CRS_CLL_PK,loan.CRS_ACTUAL_WEEK_NO,loan.payfor)
    .then((result) => {
        loan.total_expected_capital = result.total_expected_capital
        loan.total_expected_profit = result.total_expected_profit
        $scope.$apply();
    })
}

$scope.updateClient = function(client,alreadysaved){
 
    printLog("updating client "+alreadysaved);
    //printLog(client);
    var commands = [];
    var cmd = "";
 

    var isNew = true;

    if(client.products.length > 0 && client.products[0].CRS_ATTENDED != "") isNew = false;

    var clientAttended = 'N';
    var filteredProducts = client.products;
    var filteredRanProducts =  client.ranproducts;

    var clientDone = filteredProducts[0].isDone;

    if(client.isAbsent) clientAttended = "N";
    else clientAttended = "Y";
    let clientNotPaid = isAbsentAndNoPaidBehave(client)

    for(l in client.loans){
        cmd = "";
        var loan = client.loans[l];
        var outstanding = loan.CLL_OUTSTANDING;

        if(outstanding == null) {
            outstanding = loan.CLL_ACTUAL_LOAN;
        }
        var updatedOutstanding = parseFloat(outstanding) - (loan.total_expected_capital);

        loan.CLL_OUTSTANDING = updatedOutstanding;
        if(loan.CLL_STATUS != 34){
            if(loan.CLL_OUTSTANDING == 0  ){
                cmd = "UPDATE T_CLIENT_LOAN SET CLL_OUTSTANDING=0, "+
                        "CLL_STATUS = 9, "+
                        "CLL_LOAN_WEEKS = '"+loan.CLL_TOTAL_LOAN_WEEKS+"'"+
                        "WHERE CLL_PK="+loan.CLL_PK;
            } else {
                if(!isNaN(updatedOutstanding)){
                    cmd = "UPDATE T_CLIENT_LOAN SET CLL_OUTSTANDING="+updatedOutstanding+
                        " WHERE CLL_PK="+loan.CLL_PK;
                } 
            }
        }
        if(cmd !== '') commands.push(cmd);

        if(loan.CRS_ATTENDED=='null'||loan.CRS_ATTENDED=="") loan.CRS_ATTENDED = 'Y';

        if(loan.CRS_PK != null){
            printLog("loan.CRS_PK");
            printLog(loan.CRS_PK);
            printLog(loan.CRS_CLT_PK);

            var CRS_ACT_PROFIT_AMT = 0;
            var CRS_ACT_CAPITAL_AMT = 0;
            if (!clientNotPaid && loan.payfor > 0 ) {
                CRS_ACT_PROFIT_AMT = loan.CRS_ACT_PROFIT_AMT;
                CRS_ACT_CAPITAL_AMT = loan.CRS_ACT_CAPITAL_AMT;
            }

            cmd = "UPDATE T_CLIENT_REPAY_SCHEDULE SET CRS_SMS_STATUS='"+loan.CRS_SMS_STATUS+"'";
            cmd +=", CRS_ATTENDED='"+clientAttended+"'";
            //", CRS_DISBURSEMNT_AMT="+client.CRS_DISBURSEMNT_AMT+
            //cmd +=", CRS_COLLECTION_WEEK_NO ="+loan.CRS_ACTUAL_WEEK_NO;
            cmd +=", CRS_DATE='"+moment().format("DD/MM/YYYY")+"'";
            cmd +=", CRS_SMS_GROUP_STATUS='"+loan.CRS_SMS_GROUP_STATUS+"'";
            cmd +=", CRS_REASON='"+sanitize(client.CRS_REASON)+"'";
            cmd +=", CRS_ACT_PROFIT_AMT='"+CRS_ACT_PROFIT_AMT+"'";
            cmd +=", CRS_ACT_CAPITAL_AMT='"+CRS_ACT_CAPITAL_AMT+"'";
            cmd +=", CRS_BALANCE_CAPITAL='"+loan.CRS_BALANCE_CAPITAL+"'";
            cmd +=", CRS_BALANCE_PROFIT='"+loan.CRS_BALANCE_PROFIT+"'";
            cmd +=", CRS_CREATED_BY="+USER_PK;
            cmd +=", CRS_CREATED_DATE='"+moment().format("YYYY-MM-DD HH:mm:ss")+"'";
            cmd +=", CRS_RECP_STATUS='"+loan.CRS_RECP_STATUS+"'";
            cmd +=", CRS_RECP_GROUP_STATUS='"+loan.CRS_RECP_GROUP_STATUS+"'";

            if(client.isAbsent && client.isAssisted){ 
                cmd +=", CRS_PAIDBY_PK=" + loan.paidonbehalfby;
                loan.CRS_ASSISTED = 'Y';
            }

            if(clientNotPaid){
            cmd +=", CRS_ASSISTED='"+loan.CRS_ASSISTED+"'";
            }

            var ttloan = parseFloat(CRS_ACT_PROFIT_AMT) + parseFloat(CRS_ACT_CAPITAL_AMT);
            var isGroup = loan.CRS_RECP_GROUP_STATUS;


            var CRS_IS_VARY_FORECAST = "N";

            if(loan.CRS_ACT_PROFIT_AMT != loan.CRS_EXP_PROFIT_AMT){
                CRS_IS_VARY_FORECAST = "Y";
            }
            cmd += ", CRS_IS_VARY_FORECAST='"+CRS_IS_VARY_FORECAST+"'";

            cmd +=" WHERE CRS_PK="+loan.CRS_PK;
            if(loan.CLL_LTY_PK != 99){
                if(!clientDone ) $scope.updateGroup(client.CLT_CENTER_ID,client.CLT_GROUP_ID,"C",ttloan,isGroup,client.CLT_PK);
                commands.push(cmd);
            }
            printLog("loan payfor "+loan.payfor);
            if(parseInt(loan.payfor) > 1){
                var advWeeks = parseInt(loan.payfor) - 1; 
                printLog("multiple weeks" + advWeeks);
                for (var i=0; i < advWeeks; i++) { 

                    var weekpayingfor = parseInt(loan.CRS_ACTUAL_WEEK_NO) + i + 1;
                    printLog("weekpayingfor "+weekpayingfor);

                    cmd = "UPDATE T_CLIENT_REPAY_SCHEDULE SET CRS_SMS_STATUS='"+loan.CRS_SMS_STATUS+"'"+
                        ", CRS_ATTENDED='"+loan.CRS_ATTENDED+"'"+
                        //", CRS_COLLECTION_WEEK_NO ="+loan.CRS_ACTUAL_WEEK_NO+
                        ", CRS_DATE='"+moment().format("DD/MM/YYYY")+"'"+
                        ", CRS_SMS_GROUP_STATUS='"+loan.CRS_SMS_GROUP_STATUS+"'"+
                        ", CRS_REASON='"+sanitize(loan.CRS_REASON)+"'"+
                        ", CRS_ASSISTED='"+loan.CRS_ASSISTED+"'"+
                        ", CRS_ACT_PROFIT_AMT= CRS_EXP_PROFIT_AMT"+
                        ", CRS_ACT_CAPITAL_AMT= CRS_EXP_CAPITAL_AMT"+
                        ", CRS_BALANCE_CAPITAL='"+loan.CRS_BALANCE_CAPITAL+"'"+
                        ", CRS_BALANCE_PROFIT='"+loan.CRS_BALANCE_PROFIT+"'"+
                        ", CRS_REF_NO='REF' " +
                        ", CRS_CREATED_BY="+USER_PK+
                        ", CRS_CREATED_DATE='"+moment().format("YYYY-MM-DD HH:mm:ss")+"'"+
                        ", CRS_RECP_STATUS='"+loan.CRS_RECP_STATUS+"'"+
                        ", CRS_RECP_GROUP_STATUS='"+loan.CRS_RECP_GROUP_STATUS+"'"+
                        ", CRS_IS_VARY_FORECAST='N'";

                    if(client.isAbsent && (loan.paidonbehalfby !== null && loan.paidonbehalfby !== '')){
                        cmd +=", CRS_PAIDBY_PK=" + loan.paidonbehalfby;
                    }

                    cmd +=" WHERE CRS_ACTUAL_WEEK_NO="+weekpayingfor+
                        " AND CRS_CLL_PK="+loan.CLL_PK+
                        " AND CRS_CLT_PK="+loan.CLL_CLT_PK;

                    if(loan.CLL_LTY_PK != 99 ){
                        printLog("advweek");
                        printLog(cmd);
                        var ttloan = parseFloat(loan.CRS_ACT_PROFIT_AMT) + parseFloat(loan.CRS_ACT_CAPITAL_AMT);
                        if(!clientDone ) $scope.updateGroup(client.CLT_CENTER_ID,client.CLT_GROUP_ID,"C",ttloan,isGroup,client.CLT_PK);
                        commands.push(cmd);
                    }
                }
            }
            printLog("done repayment");
        }

        var second_review_week = 0;
        var loan_period = loan.CLL_TOTAL_LOAN_WEEKS;
 
        var loan_terms = loan.LTY_TERM_OF_LOAN.split(',');
        var loan_secrev_weeks = loan.LTY_SECOND_REVIEW_WEEK.split(',');
        for(var l in loan_terms){ 
             
            if(parseInt(loan_period) == parseInt(loan_terms[l])){
                second_review_week = parseInt(loan_secrev_weeks[l]);
            }
        } 
         
        var weekspaid = isAbsentAndNoPaidBehave(client) ? loan.CRS_ACTUAL_WEEK_NO - 1 : parseInt(loan.CRS_ACTUAL_WEEK_NO) + (loan.payfor - 1)
       
        if(weekspaid >= second_review_week){
            //Check For Second Review
            var rmd = " UPDATE T_CLIENT_LOAN SET CLL_STATUS= 19, CLL_MOB_NEW= 3 ";
                 rmd +=" WHERE CLL_STATUS IN (16,17,18) AND CLL_PK="+loan.CLL_PK;
            printLog(rmd);
            commands.push(rmd);  
        }  
    }

    if(isNew && !clientNotPaid){
        for(k in filteredRanProducts){ //Random Payment Products

            var prd = filteredRanProducts[k];

            var CRS_BALANCE_PROFIT = parseFloat(prd.CRS_BALANCE_PROFIT) + parseFloat(prd.CRS_ACT_PROFIT_AMT);
            var CRS_BALANCE_CAPITAL = parseFloat(prd.CRS_BALANCE_CAPITAL) + parseFloat(prd.CRS_ACT_CAPITAL_AMT);


            if(parseFloat(prd.CRS_ACT_CAPITAL_AMT) > 0 && prd.CRS_ATTENDED == ""){ // ONLY IF SAVINGS > 0
                prd.CRS_ATTENDED = clientAttended;
                var cmd3 = "INSERT INTO T_CLIENT_PRD_TXN VALUES(null,"+
                                $scope.maxPrdTxn_CPT_PK+ //CPT_PK
                                ", "+prd.CPT_CPM_PK+ //CPT_CPM_PK
                                ", '"+client.CLT_PK+"'"+ // CPT_CLT_PK
                                ", '"+prd.CPM_PRM_PK+"'"+ // CPT_PRM_PK
                                ", 'C'"+ // CPT_FLAG
                                ", '"+parseFloat(prd.CRS_ACT_CAPITAL_AMT)+"'"+ // CPT_TXN_AMOUNT
                                ", '"+moment().format('YYYY-MM-DD HH:mm:ss.0')+"'"+ // CPT_DATETIME
                                ", '"+$scope.user.userPK+"'"+ // CPT_USER_PK
                                ", ''"+ // CPT_REASON
                                ", ''"+ // CPT_REMARK
                                ", 45"+ // CPT_STATUS
                                ", '0'"+ //CPT_EXP_AMOUNT
                                ",1"+ //CPT_COLLECTION_WEEK_NO
                                ",1);"; // CPT_CHKNEW
                //printLog(cmd3);
                commands.push(cmd3);
                $scope.maxPrdTxn_CPT_PK = parseInt($scope.maxPrdTxn_CPT_PK) + 1;
                var ttloan = parseFloat(prd.CRS_ACT_PROFIT_AMT) + parseFloat(prd.CRS_ACT_CAPITAL_AMT);
                if(!clientDone ) $scope.updateGroup(client.CLT_CENTER_ID,client.CLT_GROUP_ID,"C",ttloan,'N',client.CLT_PK);
            }

            if( parseFloat(prd.CRS_ACT_CAPITAL_AMT) > 0 || parseFloat(prd.ACT_WTH_AMT > 0) ){

                var CPM_PRM_BALANCE = 0;
                if(!isNaN(prd.CPM_PRM_BALANCE)) CPM_PRM_BALANCE = prd.CPM_PRM_BALANCE;
                if (parseFloat(prd.ACT_WTH_AMT > 0)) { // deduct if there is withdrawal
                    CPM_PRM_BALANCE = parseFloat(CPM_PRM_BALANCE) - parseFloat(prd.ACT_WTH_AMT);
                }
                var cpmcmd = "UPDATE T_CLIENT_PRODUCT_MAPPING SET CPM_PRM_BALANCE='"+CPM_PRM_BALANCE+"'WHERE CPM_PRM_PK="+prd.PRM_PK+" AND CPM_PK="+prd.CPM_PK;
                commands.push(cpmcmd);
                
            }

            if(parseFloat(prd.ACT_WTH_AMT) > 0){
                prd.CRS_ATTENDED = 'Y';
                var wthcmd = $scope.withdrawalCommand(client,loan,prd,clientDone);
                printLog("withdrawal");
                printLog(wthcmd);
                commands.push(wthcmd);

            }

        }
    }

    var totalExp = 0;
    var totalAct = 0;

    for(k in filteredProducts){ //Schedule Products

        var prd = filteredProducts[k];

        var PRD_CRS_IS_VARY_FORECAST = "N";

        if(prd.CRS_ACT_PROFIT_AMT != prd.CRS_EXP_PROFIT_AMT ||
            prd.CRS_ACT_CAPITAL_AMT != prd.CRS_EXP_CAPITAL_AMT ) PRD_CRS_IS_VARY_FORECAST = 'Y';
 
        totalExp += parseFloat(prd.CRS_EXP_CAPITAL_AMT);
        totalAct += parseFloat(prd.CRS_ACT_CAPITAL_AMT);

        if(prd.CRS_PK == prd.CRS_MAX_PK){

            var pcmd = "UPDATE T_CLIENT_REPAY_SCHEDULE SET CRS_SMS_STATUS='"+client.sms_status+"'"+
                    ", CRS_ATTENDED='"+clientAttended+"'"+
                    //", CRS_DISBURSEMNT_AMT="+client.CRS_DISBURSEMNT_AMT+ 
                    //TODO: check whether we need to update collection week, pontential bug in prodigy plus
                    ", CRS_COLLECTION_WEEK_NO ="+prd.CRS_ACTUAL_WEEK_NO+
                    ", CRS_DATE='"+moment().format("DD/MM/YYYY")+"'"+
                    ", CRS_REASON='"+sanitize(client.reason)+"'"+
                    ", CRS_ASSISTED='"+prd.CRS_ASSISTED+"'"+
                    ", CRS_EXP_PROFIT_AMT='"+prd.CRS_EXP_PROFIT_AMT+"'"+
                    ", CRS_EXP_CAPITAL_AMT='"+prd.CRS_EXP_CAPITAL_AMT+"'"+
                    ", CRS_ACT_PROFIT_AMT='"+prd.CRS_ACT_PROFIT_AMT+"'"+
                    ", CRS_ACT_CAPITAL_AMT='"+prd.CRS_ACT_CAPITAL_AMT+"'"+
                    ", CRS_BALANCE_CAPITAL='"+prd.CRS_BALANCE_CAPITAL+"'"+ //Previously commented
                    ", CRS_BALANCE_PROFIT='"+prd.CRS_BALANCE_PROFIT+"'"+ //Previously commented
                    ", CRS_CREATED_BY="+USER_PK+
                    ", CRS_CREATED_DATE='"+moment().format("DD/MM/YYYY HH:mm:ss")+"'"+
                    ", CRS_RECP_STATUS='"+client.rcp_status+"'"+
                    ", CRS_RECP_GROUP_STATUS='"+client.rcp_group_status+"'"+
                    ", CRS_SMS_GROUP_STATUS='"+client.sms_group_status+"'"+
                    ", CRS_IS_VARY_FORECAST='"+PRD_CRS_IS_VARY_FORECAST+"'"+
                    ", CRS_RECP_STATUS='"+client.CRS_RECP_STATUS+"'"+
                    ", CRS_RECP_GROUP_STATUS='"+client.CRS_RECP_GROUP_STATUS+"'";

            if(client.isAbsent && (prd.CRS_PAIDBY_PK != null && prd.CRS_PAIDBY_PK != '')){

                pcmd +=", CRS_PAIDBY_PK=" + prd.CRS_PAIDBY_PK;

            }

            pcmd += " WHERE CRS_PK ="+prd.CRS_PK;

            var xcmd = "UPDATE T_CLIENT_REPAY_SCHEDULE SET "+
                " CRS_LOAN_SAVING_FLAG='X' "+
                " ,CRS_ATTENDED='"+clientAttended+"'"+
                ", CRS_CREATED_BY="+USER_PK+
                ", CRS_CREATED_DATE='"+moment().format("DD/MM/YYYY HH:mm:ss")+"'"+
                " WHERE CRS_DATE='"+prd.CRS_DATE+"'"+
                " AND CRS_PRM_LTY_PK="+prd.CPM_PRM_PK+
                " AND CRS_LOAN_SAVING_FLAG='S' "+
                " AND CRS_CLT_PK="+client.CLT_PK+
                " AND CRS_PK <> "+prd.CRS_PK;
            //printLog(xcmd);
            commands.push(xcmd);

            var ttloan = parseFloat(prd.CRS_ACT_PROFIT_AMT) + parseFloat(prd.CRS_ACT_CAPITAL_AMT);
            var isGroup = client.CRS_RECP_GROUP_STATUS;
            if(!clientDone) $scope.updateGroup(client.CLT_CENTER_ID,client.CLT_GROUP_ID,"C",ttloan,isGroup,client.CLT_PK);
            prd.isDone = true;
        } else {
            var pcmd = "UPDATE T_CLIENT_REPAY_SCHEDULE SET CRS_SMS_STATUS='"+client.sms_status+"'"+
                    ", CRS_ATTENDED='"+clientAttended+"'"+ 
                    ", CRS_DATE='"+moment().format("DD/MM/YYYY")+"'"+ 
                    // ", CRS_BALANCE_CAPITAL='"+CRS_BALANCE_CAPITAL+"'"+ //Previously commented
                    // ", CRS_BALANCE_PROFIT='"+CRS_BALANCE_PROFIT+"'"+ //Previously commented
                    ", CRS_LOAN_SAVING_FLAG='X' "+
                    ", CRS_CREATED_BY="+USER_PK+
                    ", CRS_CREATED_DATE='"+moment().format("DD/MM/YYYY HH:mm:ss")+"'"+
                    ", CRS_RECP_STATUS='"+client.rcp_status+"'"+
                    ", CRS_RECP_GROUP_STATUS='"+client.rcp_group_status+"'"+
                    ", CRS_SMS_GROUP_STATUS='"+client.sms_group_status+"'"+ 
                    " WHERE CRS_CLT_PK="+client.CLT_PK+" AND CRS_PRM_LTY_PK="+prd.PRM_PK+" AND CRS_ATTENDED != 'Y' AND CRS_DATE='"+moment().format("DD/MM/YYYY")+"' AND CRS_LOAN_SAVING_FLAG='S' ";
        }
 
        commands.push(pcmd);

        if( parseFloat(prd.CRS_ACT_CAPITAL_AMT) > 0 || parseFloat(prd.ACT_WTH_AMT > 0 && prd.CRS_ATTENDED == 'Y') ){
            prd.CRS_ATTENDED = "Y";
            var CPM_PRM_BALANCE = 0;
            if(!isNaN(prd.CPM_PRM_BALANCE)) CPM_PRM_BALANCE = prd.CPM_PRM_BALANCE;
            if (parseFloat(prd.ACT_WTH_AMT > 0)) { // deduct if there is withdrawal
                CPM_PRM_BALANCE = parseFloat(CPM_PRM_BALANCE) - parseFloat(prd.ACT_WTH_AMT);
            }
            var cpmcmd = "UPDATE T_CLIENT_PRODUCT_MAPPING SET CPM_PRM_BALANCE='"+CPM_PRM_BALANCE+"'  WHERE CPM_PRM_PK="+prd.PRM_PK+" AND CPM_PK="+prd.CPM_PK;
            commands.push(cpmcmd);
        } 
        if(parseFloat(prd.ACT_WTH_AMT) > 0 ){
            var wthcmd = $scope.withdrawalCommand(client,loan,prd,clientDone);
            commands.push(wthcmd);
        }

         var pcmd = "UPDATE T_CLIENT_REPAY_SCHEDULE SET CRS_SMS_STATUS='"+client.sms_status+"'"+
                    ", CRS_ATTENDED='"+prd.CRS_ATTENDED+"'"+ 
                    //TODO: check whether we need to update collection week, pontential bug in prodigy plus
                    ", CRS_COLLECTION_WEEK_NO ="+prd.CRS_ACTUAL_WEEK_NO+
                    ", CRS_DATE='"+moment().format("DD/MM/YYYY")+"'"+
                    ", CRS_REASON='"+sanitize(client.reason)+"'"+
                    ", CRS_ASSISTED='"+prd.CRS_ASSISTED+"'"+ 
                    ", CRS_CREATED_BY="+USER_PK+
                    ", CRS_CREATED_DATE='"+moment().format("DD/MM/YYYY HH:mm:ss")+"'"+
                    ", CRS_RECP_STATUS='"+client.rcp_status+"'"+
                    ", CRS_RECP_GROUP_STATUS='"+client.rcp_group_status+"'"+
                    ", CRS_SMS_GROUP_STATUS='"+client.sms_group_status+"'"+
                    ", CRS_IS_VARY_FORECAST='"+PRD_CRS_IS_VARY_FORECAST+"'";
                    if(client.isAbsent && (prd.CRS_PAIDBY_PK != null && prd.CRS_PAIDBY_PK != '')){

                        cmd +=", CRS_PAIDBY_PK=" + prd.CRS_PAIDBY_PK;

                    }
                    cmd +=" WHERE CRS_PK ="+prd.CRS_PK;

    } 


    if(commands.length>0){

        myDB.dbShell.transaction(function(tx3){
            for(c in commands){
                //console.log(commands[c]);
                tx3.executeSql(commands[c]);
            }
        }, function(err){
            console.log("error encountered ");
            console.log(err);
            swal("An error encountered when updating client.");
            return false;
        }, function(suc){
      
            $scope.taskUpd = 1; //To update  Header
            client.showdetails = false;
            $scope.updateCenter(); 
            $scope.$apply();
        });
    }
};


$scope.withdrawalCommand = function(client,loan,prd,clientDone){
 
    var CRS_COLLECTION_WEEK_NO = 1;
    printLog(loan);
    if(  loan != undefined && !isNaN(loan.CRS_COLLECTION_WEEK_NO) ) CRS_COLLECTION_WEEK_NO = loan.CRS_COLLECTION_WEEK_NO;

    var cmd = "INSERT INTO T_CLIENT_PRD_TXN VALUES(null,"+
                    $scope.maxPrdTxn_CPT_PK+ //CPT_PK
                    ", "+prd.CPM_PK+ //CPT_CPM_PK
                    ", '"+client.CLT_PK+"'"+ // CPT_CLT_PK
                    ", '"+prd.CPM_PRM_PK+"'"+ // CPT_PRM_PK
                    ", 'D'"+ // CPT_FLAG
                    ", '"+parseFloat(prd.ACT_WTH_AMT)+"'"+ // CPT_TXN_AMOUNT
                    ",'"+moment().format('YYYY-MM-DD HH:mm:ss.0')+"'"+ // CPT_DATETIME
                    ", '"+$scope.user.userPK+"'"+ // CPT_USER_PK
                    ", ''"+ // CPT_REASON
                    ", ''"+ // CPT_REMARK
                    ", 58"+ // CPT_STATUS
                    ",'0'"+ //CPT_EXP_AMOUNT
                    ","+CRS_COLLECTION_WEEK_NO+ //CRS_COLLECTION_WEEK_NO
                    ",1);"; // CPT_CHKNEW
                $scope.maxPrdTxn_CPT_PK = parseInt($scope.maxPrdTxn_CPT_PK) + 1;

    if(!clientDone) $scope.updateGroup(client.CLT_CENTER_ID,client.CLT_GROUP_ID,"D",parseFloat(prd.ACT_WTH_AMT),'N',client.CLT_PK);

    return cmd;
} 

    function checkLoanInvalid(client){

        $.each(client.loans,function(k,loan) {

            if(isNaN(loan.CRS_ACT_PROFIT_AMT)){
                return false;
            }
            // if((loan.CRS_ACT_PROFIT_AMT>loan.CRS_EXP_PROFIT_AMT)){
            //     return false;
            // }
            if((loan.CRS_ACT_PROFIT_AMT<0)){
               return false;
            }

            if(isNaN(loan.CRS_ACT_PROFIT_AMT)||(loan.CRS_ACT_PROFIT_AMT<0)){
                //swal(client.CLT_FULL_NAME+"'s loan amount is invalid.");
                return true;
            }
        });

        return false;
    };

    function checkEmptyReason(client){

        ////printLog(client);
        if(client.CRS_SMS_GROUP_STATUS != 'Y' && client.CRS_RECP_GROUP_STATUS != 'Y' &&
            client.CRS_RECP_STATUS != 'Y' && client.CRS_SMS_STATUS != 'Y'){
            if(client.CRS_ATTENDED=='N' && (client.CRS_REASON=='' || client.CRS_REASON == null)){

                swal({
                    title: i18n.t("messages.Alert"),
                    text: i18n.t("messages.EmptyReason"),
                    type: "error",
                    confirmButtonColor: "#80C6C7",
                    confirmButtonText: "Ok",
                    closeOnConfirm: true
                });
                return true;

            }
        }
        return false;
    }

    function checkTransactionInvalid(client){ 
        return false;
    };

    $scope.checkCashonHand = function(){

        swal({
            title: i18n.t("messages.Alert"),
            text: i18n.t("messages.PleaseCheckCashOnHand"),
            type: "info",
            confirmButtonColor: "#80C6C7",
            confirmButtonText: "Ok",
            closeOnConfirm: true
        });

    }
 
    function isAbsentAndNoPaidBehave(client) {
        return client.isAbsent && !client.isAssisted
    }
 
    $scope.sendMsg = function(type_flag, sms_print_flag, data,ind){

        if(!$scope.isGroupSelected){
            return false;
        }
        var proceed = true;

        var grp_total = null, grp_leader = null, msg = "";
     
        var resend = false; //check if this is a resend
        var alreadysaved = false; //check if already saved

        if(type_flag=="G"){ //group send
            //check data to make sure they are good
            var checking = true;

            var clientsv = $filter('filter')($scope.user.clients, { CLT_GROUP_ID: $scope.user.selectedGroup.value });
            var clients = $filter('filter')(clientsv, { CLT_CENTER_ID: $scope.user.selectedGroup.centerid });
 
            $.each(clients,function(k,client) {

                $.each(client.loans,function(i,loan){

                    if(client.products[0].CRS_ATTENDED == ""){
                        $.each(client.products,function(p,prd){ 
                            if(!$scope.validateAmt(client,prd,'withdrawal')) checking = false;
                        });
                        $.each(client.ranproducts,function(p,prd){
                            if(!$scope.validateAmt(client,prd,'withdrawal')) checking = false;
                        })
                    }

                });
            });

            if(!checking) return false;

            $.each(clients,function(k,client) {
                if(checkTransactionInvalid(client)){return false;}//check if client has invalid collection value
                if(checkEmptyReason(client)){return false;}
                if(sms_print_flag=="S")client.sms_group_status = "Y";
                if(sms_print_flag!="S")client.rcp_group_status = "Y";
            });
            if(sms_print_flag=="S"){
                if($scope.user.SMS_SENT=="Y") resend = true; //group is sending sms for the second time
            }else{ //printing
                if($scope.user.RECEIPT_SENT=="Y") resend = true; //group is printing receipt for the second time
            }
            if($scope.user.SMS_SENT=='Y'||$scope.user.RECEIPT_SENT=='Y')
                alreadysaved = true;

        } else { //only client
            
            var client = data;
            let isValid = true
            data.loans.forEach((loan)=>{ 
                // check payfor is valid
                if(isNaN(parseInt(loan.payfor))){
                    isValid=false
                }
            })
            if(!isValid){
                //TODO: ADD INTERNATIONALIZE MESSAGE
                swal("Invalid fields")     ;
                return
            }

            if (client.isAbsent && (client.CRS_REASON == '' || client.CRS_REASON == null)) {
                swal(i18n.t("messages.EmptyReason"));
                return false;
            }


            if(sms_print_flag=="S")client.sms_status = "Y";
            if(sms_print_flag!="S")client.rcp_status = "Y";

            var checking = true;

            if(client.loans[0]){
                if(client.loans[0].CRS_ATTENDED == ""){
                    $.each(client.products,function(p,prd){ 
                        if(!$scope.validateAmt(client,prd,'withdrawal')) checking = false;
                    });
                    $.each(client.ranproducts,function(p,prd){
                        if(!$scope.validateAmt(client,prd,'withdrawal')) checking = false;
                    })
                }
            }


            if(!checking) return false;

            if(checkTransactionInvalid(client)){return false;}
        
        }

        if(!alreadysaved && proceed == false) {
 
        } else if(resend){
            
        } else {
           
        }
        $scope.sendMsgSecondpart(type_flag, sms_print_flag, data, resend,ind,alreadysaved);
    }
    $scope.sendMsgSecondpart = function(type_flag, sms_print_flag, data, resend,ind,alreadysaved){

        var grp_total = null, grp_leader = null;
    
        var time = "";
        if(sms_print_flag=="S") time = moment().format('DD/MM/YYYY HH:MM a');
        else time = moment().format('DD MMM YYYY HH:MM a');


        if(type_flag=="G"){
            var grp_products = $scope.bpmproducts;
            //get total if group
            grp_loan_total = $scope.getGrpTotalLoan();
            grp_total = grp_loan_total;
            var grp_id = $scope.user.selectedGroup.value;
            var clientsv = $filter('filter')($scope.user.clients, { CLT_GROUP_ID: $scope.user.selectedGroup.value });
            var clients = $filter('filter')(clientsv, { CLT_CENTER_ID: $scope.user.selectedGroup.centerid });
            $.each(clients,function(c,client){
                if(client.products[0].CRS_ATTENDED == ""){
                    $scope.updateSavingBalance(client,'ran');
                    $scope.updateSavingBalance(client,'sch');
                }
            })
            var cmd = "SELECT CLT_MOB_NO_1, CLT_FULL_NAME FROM T_CLIENT, T_CLIENT_LOAN WHERE CLT_GROUP_ID='"+grp_id+"' AND CLL_CLT_PK=CLT_PK AND CLT_IS_GROUP_LEADER='Y'";
            myDB.execute(cmd,function(results){
                if(results.length<1){ swal("No leader found.");return false;} //no leader
                $scope.getTextFormat(type_flag, sms_print_flag, data, results[0], grp_loan_total, time,resend)
                .then((msg)=>{
                    $scope.updateGroupButtons(sms_print_flag);
                    $scope.updateAndSend(type_flag, sms_print_flag, data, results[0], msg,resend,alreadysaved); 
                })
            });
        }else{
            //get text format
            if(data.products && data.products.length > 0 && data.products[0].CRS_ATTENDED == ""){
                $scope.updateSavingBalance(data,'ran');
                $scope.updateSavingBalance(data,'sch');
            }


            if(!isAbsentAndNoPaidBehave(data))
                //if client paid
                $scope.getTextFormat(type_flag, sms_print_flag, data, grp_leader, grp_total, time,resend)
                .then((msg)=>{
                    $scope.updateAndSend(type_flag, sms_print_flag, data, grp_leader, msg,resend,alreadysaved);
                })
            else{
                //if client didnt   pay 
                let msg = ""
                $scope.updateAndSend(type_flag, sms_print_flag, data, grp_leader, msg,resend,alreadysaved);
            }

 
        }

    }
 
    $scope.updateGroupButtons = function(sms_print_flag){
 
        $scope.$apply(function(){
            if(sms_print_flag=="S") $scope.user.SMS_SENT = 'Y';
            if(sms_print_flag=="R") $scope.user.RECEIPT_SENT = 'Y';
        });
        return false;
    }

    $scope.updateclientButtons = function(client,status_flag,ind){
        ////printLog(client);
        if(status_flag == "S"){
            $scope.user.clients[ind].CRS_SMS_STATUS = 'Y';
        } else {
            $scope.user.clients[ind].CRS_RECP_STATUS = 'Y';
        }
        return false;
    }

    $scope.updateAndSend = function(type_flag, sms_print_flag, data, grp_leader, msg,resend,alreadysaved){

        if(type_flag=="G"){ //update group's sms/receipt status and also for its clients
            var clientsv = $filter('filter')($scope.user.clients, { CLT_GROUP_ID: $scope.user.selectedGroup.value });
            var clients = $filter('filter')(clientsv, { CLT_CENTER_ID: $scope.user.selectedGroup.centerid });
            //printLog(clients);
            var client;
            for(k in clients){

                client =  clients[k];

                var updatealreadysaved = false;

                if(client.CRS_SMS_STATUS == undefined) client.CRS_SMS_STATUS = '';
                if(client.CRS_RECP_STATUS == undefined) client.CRS_RECP_STATUS = '';

                if(clients[k].CRS_SMS_STATUS=='Y'|| clients[k].CRS_RECP_STATUS=='Y'||
                    clients[k].CRS_SMS_GROUP_STATUS == 'Y'||clients[k].CRS_RECP_GROUP_STATUS == 'Y'){
                    updatealreadysaved = true;
                }
                if(sms_print_flag=="S")      { clients[k].CRS_SMS_GROUP_STATUS  = 'Y';}
                else if(sms_print_flag=="R") { clients[k].CRS_RECP_GROUP_STATUS = 'Y';}



                $.each(client.loans, function(i,loan){
                    if(sms_print_flag=="S")      loan.CRS_SMS_GROUP_STATUS = 'Y';
                    else if(sms_print_flag=="R") loan.CRS_RECP_GROUP_STATUS = 'Y';
                })
                $.each(client.products, function(i,prd){
                    if(sms_print_flag=="S")      prd.CRS_SMS_GROUP_STATUS = 'Y';
                    else if(sms_print_flag=="R") prd.CRS_RECP_GROUP_STATUS = 'Y';
                })
                $scope.updateClient(client,updatealreadysaved); //sends for sql update

            }

            if(sms_print_flag=="S")      $scope.user.SMS_SENT = 'Y';
            else if(sms_print_flag=="R") $scope.user.RECEIPT_SENT = 'Y';
   
            $scope.$apply(function(){
                $scope.user;
            });

        }else if(type_flag=="C"){ //update only client's status

            var updatealreadysaved = false;
            if(data.loans[0]){
                if(data.loans[0].CRS_SMS_STATUS=='Y'||data.loans[0].CRS_RECP_STATUS=='Y'||
                    data.loans[0].CRS_SMS_GROUP_STATUS == 'Y'||data.loans[0].CRS_RECP_GROUP_STATUS == 'Y'){
                    updatealreadysaved = true;
                }
            }

            if(data.CRS_SMS_STATUS=='Y'|| data.CRS_RECP_STATUS=='Y'||
                data.CRS_SMS_GROUP_STATUS == 'Y'|| data.CRS_RECP_GROUP_STATUS == 'Y'){
                updatealreadysaved = true;
            }

            data.CRS_SMS_GROUP_STATUS = '';
            data.CRS_SMS_STATUS = '';
            data.CRS_RECP_GROUP_STATUS = '';
            data.CRS_RECP_STATUS = '';

            if(sms_print_flag=="S")      { data.CRS_SMS_STATUS  = 'Y';}
            else if(sms_print_flag=="R") { data.CRS_RECP_STATUS = 'Y';}

            $.each(data.loans, function(i,loan){
                if(sms_print_flag=="S")      loan.CRS_SMS_STATUS = 'Y';
                else if(sms_print_flag=="R") loan.CRS_RECP_STATUS = 'Y';
            });
            $.each(data.products, function(i,prd){
                if(sms_print_flag=="S")      prd.CRS_SMS_STATUS = 'Y';
                else if(sms_print_flag=="R") prd.CRS_RECP_STATUS = 'Y';
            });
            $scope.updateClient(data,updatealreadysaved); //sends for sql update
        }
 
        if(msg===""){
            // if there is no mesage ,don't need to print anything
            return 
        }

        console.log("Printed message:",msg);
        if(!devtest){ //if production, send sms and print receipt
            var company = "TEL:"+BRC_PHONE;

            //send receipt
            if(resend) company+="\n**DUPLICATE**";

            if(sms_print_flag!='S'){
                if(canPrint) {
                    printservice.createEvent(CMP_NAME,msg,company,
                        function(res) {
                            if(res){ 
                                swal({
                                    title:i18n.t("messages.SuccessfulPrintReceipt"),
                                    text:'',
                                    showConfirmButton: false,
                                    timer:1000,
                                });
                            } else {
                                swal(i18n.t("messages.ErrorPrintReceipt"));
                            }
    
                        }
                    ); //print receipt
                }

            } else if(sms_print_flag!='R'){ //send sms
           
                if ( msg.indexOf(msg_separator) !== -1 ) {
                    var megs = msg.split(msg_separator);

                    var theQueue = $({});


                    swal(i18n.t("messages.SendingSMS"));

                    $scope.smsstatus = [];


                    $.each(megs,function(i,msg) {
                        if(msg != ""){
                            var recipient = (type_flag=="G")?grp_leader.CLT_MOB_NO_1:data.CLT_MOB_NO_1;
                            var mdata = {'title':msg.split("\n")[0],'msg':msg,'didsend':false,'recipient':recipient};
                            $scope.smsstatus.push(mdata);
                            $scope.smmqueue.push(function(){
                                $scope.sendthesms(i);
                            });
                        }
                    });


                    ($scope.smmqueue.shift())();
                } else {
                    var recipient = (type_flag=="G")?grp_leader.CLT_MOB_NO_1:data.CLT_MOB_NO_1;

                    swal(i18n.t("messages.SendingSMS"));

                    smsservice.createEvent( recipient, msg.substring(0, 160),
                        function(res) {

                            if(res){
                                swal(i18n.t("messages.SuccessSMS"));
                            } else {
                                swal(i18n.t("messages.FailSMS"));
                            }

                        }
                    );
                }
            }
        } else { //otherwise output to console
            if(sms_print_flag!='S') {
                
                swal({
                    title:i18n.t("messages.SuccessfulPrintReceipt"),
                    text:'',
                    showConfirmButton: false,
                    timer:1000,
                }).then(function(){
                    swal.close(); 
                });

            } else if(sms_print_flag!='R'){
                if(type_flag=="G")      {
                  console.log("Send Group SMS:\n"+grp_leader.CLT_MOB_NO_1+"\n"+msg);
                } //send sms to group
                else if(type_flag=="C") {

                    var theQueue = $({});
                    if ( msg.indexOf(msg_separator) !== -1 ) {
                        var megs = msg.split(msg_separator);

                        $scope.smsstatus = [];
                        $.each(megs,function(i,msg) {
                            if(msg != ""){
                                var recipient = (type_flag=="G")?grp_leader.CLT_MOB_NO_1:data.CLT_MOB_NO_1;
                                var mdata = {'title':msg.split("\n")[0],'msg':msg,'didsend':false,'recipient':recipient};
                                $scope.smsstatus.push(mdata);
                                $scope.smmqueue.push(function(){
                                    $scope.sendthesms(i);
                                });
                            }
                        });
                    }
                    ($scope.smmqueue.shift())(); 
                }      //send sms to client
            }
        }
    };

    $scope.testnum = 0;
 
    $scope.sendthesms = function(i){
 
        $scope.testnum += 1; 
        if(devtest){

            if(i==0)
                $scope.smsstatus[i].didsend = true;
            else
                $scope.smsstatus[i].didsend = false;


            if($scope.testnum == 3 || $scope.testnum > 4)
                $scope.smsstatus[i].didsend = true;

            if($scope.smmqueue.length > 0){
                ($scope.smmqueue.shift())();
            } else {
                $scope.smsSwal();
            }

        } else {
            smsservice.createEvent( $scope.smsstatus[i].recipient, $scope.smsstatus[i].msg, function(res) {

                    $scope.smsstatus[i].didsend = res;

                    //printLog($scope.smsstatus[i].didsend);

                    if($scope.smmqueue.length > 0){
                        ($scope.smmqueue.shift())();
                    } else {
                        $scope.smsSwal();
                    }

                    }
            );
        }


    }

    $scope.smsSwal = function(){

        var smsalert ="";
        var needresend = false; 
        $.each($scope.smsstatus,function(i,sms){ 
            if($scope.smsstatus[i].didsend){
                smsalert += "<p>"+$scope.smsstatus[i].title+"&#09;"+"<span style='color:green'>Successful</span></p>";

            } else {

                smsalert += "<p>"+$scope.smsstatus[i].title+"&#09;"+"<span style='color:red'>Failed</span></p>";
                needresend = true;
            }
        });

        if(needresend){
            swal({
                title: "SMS",
                text: smsalert,
                type: "error",
                confirmButtonColor: "#80C6C7",
                confirmButtonText: "Resend ?",
                showCancelButton: true,
                html: true
            }).then(function (isConfirm) {
                if (isConfirm) {
                    $scope.smmqueue = [];
                    $.each($scope.smsstatus,function(i,sms){
                        //printLog($scope.smsstatus[i].didsend);
                        if(!$scope.smsstatus[i].didsend){
                            $scope.smmqueue.push(function(){
                                $scope.sendthesms(i);
                            });
                        }
                    });
                    ($scope.smmqueue.shift())();
                }
            },function(){

            });
        } else {
            $scope.testnum = 0;
            swal({
                title: "SMS",
                text: smsalert,
                type: "success",
                confirmButtonColor: "#80C6C7",
                confirmButtonText: "Ok",
                closeOnConfirm: true,
                html:true
            });
        }
    }
 
    $scope.lockSavings = function(type,prd){

        var isLocked = false;

        if(type == 'ran'){ 
            if(prd.CRS_ATTENDED != '' && prd.CRS_ATTENDED != null) isLocked = true;
        } else if (type == 'weekly'){
            if(prd.CRS_SMS_STATUS != '' || prd.CRS_SMS_GROUP_STATUS != '' || prd.CRS_RECP_STATUS != '' || prd.CRS_RECP_GROUP_STATUS != ''){
                isLocked = true;
            }
        }
        return isLocked;

    }

    /**
     * 
     * get the exact sum amount of the expect profit across multiple week
     * 
     * unlike other place of this code assume each loan repayment schedule has the same capital and profit
     * this method return  the correct figure
     * @param {String} cllPk client loan pk
     * @param {Number} from 
     * @param {Number} payfor 
     * @return {Promise<{
     *  total_expected_capital:Number,
     *  total_expected_profit:Number
     * }>} 
     */
    function getTotalExpectedCaptialAndProfitFromDb(cllPK,from,payfor) {
        // TODO: FIX THE PAY-FOR FIRST TIME NOT RENDERING
        if(isNaN(payfor) || parseInt(payfor)===0){
             return Promise.resolve({
                total_expected_capital:0,
                total_expected_profit:0 
             })
        }

        let query = `
            Select 
                SUM(CRS_EXP_CAPITAL_AMT) as total_expected_capital,
                SUM(CRS_EXP_PROFIT_AMT) as total_expected_profit
            From 
                t_client_repay_schedule
            Where 
                CRS_CLL_PK=${cllPK}
                And CRS_ACTUAL_WEEK_NO between ${from} and ${from+payfor-1}
        `

         return new Promise((resolve, reject) => {
            myDB.execute(query,(results)=>{
                let total_expected_capital = results[0].total_expected_capital
                let total_expected_profit = results[0].total_expected_profit
                resolve({
                   total_expected_capital:total_expected_capital?parseFloat(total_expected_capital):0,
                   total_expected_profit:total_expected_profit?parseFloat(total_expected_profit):0
                })
            }) 
        });
    }

    $scope.getTextFormat = function(type_flag, sms_print_flag, data, grp_leader, grp_total, time, resend){
      return new Promise((resolve, reject) => {
        var msg = "";
        //SMS format
        if(sms_print_flag=='S'){
             
            msg += "LOAN";
            if(type_flag=="G") msg += "(GP)";
            if(resend) msg += "-"+i18n.t("messages.Copy");
            msg+="\n";
            if(type_flag=="G"){
                var group_cash_onhand = parseInt(grp_total);
                if(CMP_SMS_FORMAT.indexOf('CLNM')!=-1)   msg+=$scope.user.Printing.sms[findIndexInData($scope.user.Printing.sms,'pid','FONM')].pname+":"+grp_leader.CLT_FULL_NAME+"\n";
                if(CMP_SMS_FORMAT.indexOf('CLID')!=-1)   msg+=$scope.user.Printing.sms[findIndexInData($scope.user.Printing.sms,'pid','CLID')].pname+":"+$scope.user.selectedGroup.value+"\n";
                if(CMP_SMS_FORMAT.indexOf('AMT')!=-1)    msg+=$scope.user.Printing.sms[findIndexInData($scope.user.Printing.sms,'pid','AMT')].pname+":"+$filter('currency')(grp_total);
                if(CMP_RECEIPT_FORMAT.indexOf('SAV')==-1) {
                    msg+="\n";
                    for(k in $scope.bpmproducts){
                        var prdAmt = $scope.getbpmproductTotal($scope.bpmproducts[k].PRM_LOCAL_NAME);
                        msg+=$scope.bpmproducts[k].PRM_LOCAL_NAME+":"+$filter('currency')(prdAmt)+"\n";
                        group_cash_onhand += parseInt(prdAmt);
                    }
                }
                msg += "Total:" + +$filter('currency')(group_cash_onhand)+"\n";
            }else if(type_flag=="C"){
 
                if(CMP_SMS_FORMAT.indexOf('FONM')!=-1)   msg+=$scope.user.Printing.sms[findIndexInData($scope.user.Printing.sms,'pid','FONM')].pname+":"+USER_NAME+"("+BRC_NAME+")\n"; //NAME OF OFFICER(OFFICER ID)
                if(CMP_SMS_FORMAT.indexOf('CLNM')!=-1)   msg+=$scope.user.Printing.sms[findIndexInData($scope.user.Printing.sms,'pid','CLNM')].pname+":"+data.CLT_FULL_NAME+"("+data.CLT_CLEINT_ID+")\n";// NAME OF CLIENT(CLIENT ID)
                msg+="Orig Bal:"+$filter('currency')(data.CRS_BALANCE_CAPITAL)+"\n";// OPENING BALANCE
                msg+="Depo Amt:"+$filter('currency')(data.CRS_TOTALPAID)+"\n";// DEPOSIT AMOUNT

                var currbal = parseFloat(data.CRS_BALANCE_CAPITAL) + parseFloat(data.CRS_TOTALPAID);
                msg+="Curr Bal:"+$filter('currency')(currbal)+"\n";// CURRENT BALANCE

                msg+=msg_separator;
                ////printLog(data.products);
                for(k in data.products){
                    ////printLog(data.products[k]);
                    msg+="SAVING("+data.products[k].PRM_LOCAL_NAME+")\n";// SAVINGS NAME
                    //msg+=time+"\n";
                    if(CMP_SMS_FORMAT.indexOf('FONM')!=-1)   msg+=$scope.user.Printing.sms[findIndexInData($scope.user.Printing.sms,'pid','FONM')].pname+":"+USER_NAME+"("+BRC_NAME+")\n"; //NAME OF OFFICER(OFFICER ID)
                    if(CMP_SMS_FORMAT.indexOf('CLNM')!=-1)   msg+=$scope.user.Printing.sms[findIndexInData($scope.user.Printing.sms,'pid','CLNM')].pname+":"+data.CLT_FULL_NAME+"("+data.CLT_CLEINT_ID+")\n";// NAME OF CLIENT(CLIENT ID)
                    msg+="Orig Bal:"+$filter('currency')(data.products[k].CPM_PRM_BALANCE)+"\n";// OPENING BALANCE
                    msg+="Depo Amt :"+$filter('currency')(data.products[k].CRS_FLEXI_ACT)+"\n";// DEPOSIT AMOUNT
                    if(data.products[k].CRS_FLEXI_WTH != "0"){
                        msg+="Wth Amt:"+$filter('currency')(data.products[k].CRS_FLEXI_WTH)+"\n";
                    }
                    var total = 0.00
                    total = parseFloat(data.products[k].CPM_PRM_BALANCE)+parseFloat(data.products[k].CRS_FLEXI_ACT) - parseFloat(data.products[k].CRS_FLEXI_WTH);
                    if(total == undefined || total == null || $.isNumeric(total) == false) total = 0.00;
                    msg+="Curr Bal :"+$filter('currency')(total)+"\n";
                    if(k != data.products)msg+=msg_separator;

                }
            }
            return resolve(msg);
        }

        //Receipt format
        if(sms_print_flag=='R'){
 
            if(type_flag=="G") msg += i18n.t("messages.GPReceipt");
            msg+="\n";

            if(CMP_RECEIPT_FORMAT.indexOf('DT')!=-1)         msg+=time+"\n\n";

            if(CMP_RECEIPT_FORMAT.indexOf('FONM')!=-1)       msg+=$scope.user.Printing.rcp[findIndexInData($scope.user.Printing.rcp,'pid','FONM')].pname+":"+USER_NAME;
            msg+="\n";
            if(CMP_RECEIPT_FORMAT.indexOf('BR')!=-1)         msg+=$scope.user.Printing.rcp[findIndexInData($scope.user.Printing.rcp,'pid','BR')].pname+":"+BRC_NAME;
            msg+="\n";
            if(CMP_RECEIPT_FORMAT.indexOf('BRID')!=-1)       msg+=$scope.user.Printing.rcp[findIndexInData($scope.user.Printing.rcp,'pid','BRID')].pname+":"+" ("+BRC_BRANCH_ID+")"; 
            msg+="\n\n";


            if(type_flag=="G"){
                var group_total_loan = $scope.getTotalLoanForOneGroup($scope.user.selectedGroup.centerid, $scope.user.selectedGroup.value);
                var group_total_onhand = group_total_loan;
                // Group Format
                // if(CMP_RECEIPT_FORMAT.indexOf('CLNM')!=-1)   msg+=$scope.user.Printing.rcp[findIndexInData($scope.user.Printing.rcp,'pid','CLNM')].pname+":"+grp_leader.CLT_FULL_NAME+"\n";
                // if(CMP_RECEIPT_FORMAT.indexOf('CLID')!=-1)   msg+=$scope.user.Printing.rcp[findIndexInData($scope.user.Printing.rcp,'pid','CLID')].pname+":"+$scope.user.selectedGroup.value+"\n";
                
                msg+= 'Center : ' + $scope.selectedCenter.CTR_CENTER_NAME + '(' + $scope.selectedCenter.CTR_CENTER_CODE + ')'+"\n";
                if(CMP_RECEIPT_FORMAT.indexOf('CLID')!=-1)   msg+=i18n.t("messages.GroupID")+" ID:"+$scope.user.selectedGroup.value+"\n";
                if(CMP_RECEIPT_FORMAT.indexOf('CLNM')!=-1)   msg+=i18n.t("messages.GroupLeader")+":"+grp_leader.CLT_FULL_NAME+"\n";

                if(CMP_RECEIPT_FORMAT.indexOf('AMT')!=-1)    msg+="GP "+$scope.user.Printing.rcp[findIndexInData($scope.user.Printing.rcp,'pid','AMT')].pname+": Rp "+group_total_loan+"\n";
                if(CMP_RECEIPT_FORMAT.indexOf('SAV')==-1) {
                    console.log('bmproducts');
                    console.log($scope.bpmproducts);
                    for (let b = 0; b < $scope.bpmproducts.length; b++) {
                        const prd = $scope.bpmproducts[b];
                        const prdAmt = $scope.getbpmproductTotal(prd.PRM_LOCAL_NAME);
                        msg+="GP "+prd.PRM_LOCAL_NAME+": Rp "+prdAmt+"\n";
                        group_total_onhand += parseInt(prdAmt);
                    }
                    for(k in $scope.bpmproducts){
                        
                    }
                }
                msg+="Total: Rp " + group_total_onhand+"\n";
                return resolve(msg)
            } else if(type_flag=="C"){
                //Individual Format
                if(CMP_RECEIPT_FORMAT.indexOf('CLNM')!=-1)   msg+= $scope.user.Printing.rcp[findIndexInData($scope.user.Printing.rcp,'pid','CLNM')].pname+":"+data.CLT_FULL_NAME+"\n";
                if(CMP_RECEIPT_FORMAT.indexOf('CLID')!=-1)   msg+=$scope.user.Printing.rcp[findIndexInData($scope.user.Printing.rcp,'pid','CLID')].pname+":"+data.CLT_CLEINT_ID+"\n";
                

                let allPromises = data.loans.map((loan)=>{
                  let getLoanMsg = (result)=>{
                    let total_expected_capital = result.total_expected_capital
                    let total_expected_profit = result.total_expected_profit
                    let loanMsg="\n\n"
                    loanMsg+=i18n.t("LOANS."+loan.LTY_DESCRIPTION).toUpperCase()+"\n";
                    loanMsg+="("+loan.CLL_LOAN_NUMBER+")\n";
                    loanMsg+=i18n.t("messages.LoanAmt")+":"+loan.CLL_ACTUAL_LOAN+"\n";
                    loanMsg+=i18n.t("messages.ActualWk")+":"+(loan.CRS_ACTUAL_WEEK_NO+loan.payfor-1)+"\n";  //Eg: Collection:Actual -> 20:19, if(client.pay(2Weeks)) then 19+2 = 21. So it should be n-1
                    loanMsg+=i18n.t("messages.CollectWk")+":"+loan.CRS_COLLECTION_WEEK_NO+"\n";
                    if (loan.payfor == 0 && loan.CRS_ASSISTED == 'N') {
                        loanMsg+=i18n.t("messages.AmtPaid_P")+":0.00"+"\n";
                        loanMsg+=i18n.t("messages.AmtPaid_I")+":0.00"+"\n";
                    } else {
                        loanMsg+=i18n.t("messages.AmtPaid_P")+":"+total_expected_capital+"\n";
                        loanMsg+=i18n.t("messages.AmtPaid_I")+":"+total_expected_profit+"\n";
                    }
                    loanMsg+=i18n.t("messages.LoanBal_P")+":"+ (loan.CLL_OUTSTANDING - (total_expected_capital))+"\n";
                    loanMsg+=i18n.t("messages.LoanBal_I")+":"+(parseInt(loan.CRS_BALANCE_PROFIT) -(total_expected_profit))+"\n";

                    var filteredProducts = $filter('filter')(data.products, { CRS_CLT_PK: loan.CLL_CLT_PK });

                    $.each(filteredProducts,function(p,prd){
                        var prdwth = $scope.getSavingWithdrawal(prd);
                        loanMsg+="\n";
                        loanMsg+=prd.PRM_LOCAL_NAME.toUpperCase()+"\n";
                        loanMsg+="Original Bal: Rp "+ ( $scope.getOriginalBalance(data,prd,'sch'))+"\n";
                        loanMsg+="Deposit Amt: Rp "+$scope.getSavingsActual(prd)+"\n";
                        if ( prdwth > 0) {
                            loanMsg+="Withdrawal Amt: Rp " + prdwth+"\n";
                        }
                        loanMsg+="Current Bal: Rp "+$scope.getSavingsBalance(data,prd)+"\n";

                    });

                    var filteredRanProducts = $filter('filter')(data.ranproducts, { CPM_CLT_PK: loan.CLL_CLT_PK });
                    $.each(filteredRanProducts,function(p,prd){
                        var prdwth = $scope.getSavingWithdrawal(prd);
                        loanMsg+="\n";
                        loanMsg+=prd.PRM_LOCAL_NAME.toUpperCase()+"\n";
                        loanMsg+="Original Bal: Rp "+( $scope.getOriginalBalance(data,prd,'ran'))+"\n";
                        loanMsg+="Deposit Amt: Rp "+$scope.getSavingsActual(prd)+"\n";
                        if ( prdwth > 0) {
                            loanMsg+="Withdrawal Amt: Rp " + prdwth+"\n";
                        }
                        loanMsg+="Current Bal: Rp "+$scope.getSavingsBalance(data,prd)+"\n"; 
                    });
                    return loanMsg
                  }

                  return getTotalExpectedCaptialAndProfitFromDb(loan.CRS_CLL_PK,loan.CRS_ACTUAL_WEEK_NO,loan.payfor)
                  .then(getLoanMsg)
                })

                return Promise.all(allPromises)
                  .then((allLoanMsg) => {
                    allLoanMsg.forEach((loanMsg)=>{
                      msg+=loanMsg
                    })
                    return resolve(msg)
                  })
            }
          } 
      });
  };


    $scope.addNewProduct = function(client,loan){

        var prdname     = $('#newprod'+client.CLT_PK+' option[value="'+client.selectedProduct+'"]').text();
        var prdid       = client.selectedProduct;
        var prdmat      = $('#newProdMat'+client.CLT_PK).val();
        var prdweekly   = $('#newprodpay'+client.CLT_PK+' option:selected').text();
        prdweekly       = prdweekly.split(" ")[0];
        var CPM_CLL_PK  = 0; //client.loans[0].CLL_PK;
        var CPM_CLT_PK  = client.CLT_PK;
 
        if(prdid == "" || prdid == 0){
            swal(i18n.t("messages.EmptyProduct"));
            return false;
        }
        if(prdmat == "" || prdmat == 0){
            swal(i18n.t("messages.ZeroMaturity"));
            return false;
        }
        if(prdweekly == undefined){
            prdweekly = "null";
        }

        if(prdweekly != "null" && prdweekly != ''){
            prdmat = "null";
        } 

        swal({
            title:'',
            text: i18n.t("messages.ConfirmAddProduct"),
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes!", 
        }).then(function(isConfirm){ 
            if (isConfirm.value) {
                //printLog("Added"); 
                client.newProducts.push({
                    NAME: prdname,
                    CPM_CLT_PK : CPM_CLT_PK
                });
                 
                var PRM = $filter('filter')($scope.productmaster,{ PRM_CODE : prdid})[0];
 
                $scope.getMaxCPM()
                    .then(function(maxcpmpk) { 
                        var balance = 0;
                        var key = {
                            PRM_CODE : prdid,
                            CLL_PK: CPM_CLL_PK,
                            CLT_PK: CPM_CLT_PK,
                            CAPITAL: prdweekly
                        }
                        // if(PRM.PRM_CODE == '002.0007'){ 
                        //     balance = key.CAPITAL = parseInt(key.CAPITAL) + parseInt(PRM.PRM_DEFAULT_AMOUNT); 
                        // }
                        
                        client.all_existing_prds.push(key);

                        var addcmd = "INSERT INTO T_CLIENT_PRODUCT_MAPPING VALUES(null, "+maxcpmpk+", "+client.CLT_PK+", "+CPM_CLL_PK+", "+ PRM.PRM_PK +", '"+ prdmat +"', '"+ balance +"', null, '"+moment().format('DD/MM/YYYY HH:mm:ss')+"', null, 1,'"+prdweekly+"', 'null','null', 2)";
                        //console.log(addcmd);
                        myDB.execute(addcmd,function(res2) { 
                            $('#newprod'+client.CLT_PK+' option:eq(0)').prop("selected", true);
                            $('#newprodpay'+client.CLT_PK+' option:eq(0)').prop("selected", true);

                            if ( PRM.PRM_CODE == '002.0007' ){
                                $scope.createRepayForFeast(client, PRM.PRM_PK, prdmat, prdweekly, PRM.PRM_DEPOSIT_AMOUNT);
                            } 
                            $scope.$apply();
                        })
                });
            }
        });

    }

    $scope.getMaxCPM = function() {
        var p = new Promise(function(suc, rej) {
            myDB.execute("SELECT MAX(CPM_PK) as maxcpmpk FROM T_CLIENT_PRODUCT_MAPPING ",function(res){
                var result = res[0];
                var maxcpmpk = parseInt(result['maxcpmpk']) + 1;
                suc(maxcpmpk);
            })
        });
        return p;
    }

    $scope.createRepayForFeast = function(client, prmpk, prdmat, weeklyamt, opening){
        var cmd = "SELECT MAX(CRS_PK) as maxcrspk FROM T_CLIENT_REPAY_SCHEDULE ";
        myDB.execute(cmd,function(res){
            var result = res[0];
            var maxcrspk = parseInt(result['maxcrspk']) + 1;
            var balance = actual_capital_amount = parseInt(weeklyamt) + parseInt(opening); 
            /**
             * we are insert this record is only for the UI purpose
             * it wil be use at the dashboard page for calculating all the total saving amount
             * 
             * In before setting, creating a new product only need to create a row in new t_client_product_mapping
             * But here we are creating a repayment row just for calcuating the correct amount.
             * 
             * to prevent this record for being push , we set the crs_saving_loan_flag to 'X'', 
             * so we can easliy exclude them. 
             */
            var rpcmd = "INSERT INTO T_CLIENT_REPAY_SCHEDULE VALUES(null, " +
                maxcrspk + ", "+// CRS_PK BIGINT NOT NULL,
                client.CLT_PK + ", " +// CRS_CLT_PK BIGINT NOT NULL,
                "0, " + // CRS_CLL_PK BIGINT NOT NULL,
                prmpk + ", " + // CRS_PRM_LTY_PK INTEGER NOT NULL,
                "'S', " +// CRS_LOAN_SAVING_FLAG CHARACTER VARYING(1) NOT NULL,
                "1, " +// CRS_ACTUAL_WEEK_NO INTEGER NOT NULL,
                "0, " +// CRS_COLLECTION_WEEK_NO INTEGER NOT NULL,
                "'"+ moment().format('DD/MM/YYYY') + "', " +// CRS_DATE DATE NOT NULL,
                USER_PK + ", " +// CRS_FO INTEGER NOT NULL,
                "'C', " + // CRS_FLAG CHARACTER VARYING(1) NOT NULL,
                "'', " + // CRS_ATTENDED CHARACTER VARYING(1),
                "'" + weeklyamt + "', " + // CRS_EXP_CAPITAL_AMT CHARACTER VARYING(1000),
                "'0', " + // CRS_EXP_PROFIT_AMT CHARACTER VARYING(1000),
                "'"+ balance +"', " + // CRS_BALANCE_CAPITAL CHARACTER VARYING(1000),
                "'0', " + // CRS_BALANCE_PROFIT CHARACTER VARYING(1000),
                "'0', " + // CRS_PENALTY CHARACTER VARYING(1000),
                "'', " + // CRS_SMS_STATUS CHARACTER VARYING(1),
                "'', " + // CRS_SMS_GROUP_STATUS CHARACTER VARYING(1),
                "'', " + // CRS_RECP_STATUS CHARACTER VARYING(1),
                "'', " + // CRS_RECP_GROUP_STATUS CHARACTER VARYING(1),
                "'', " + // CRS_REASON CHARACTER VARYING(500),
                "'', " + // CRS_ASSISTED CHARACTER VARYING(1),
                "'"+ actual_capital_amount +"', " + // CRS_ACT_CAPITAL_AMT CHARACTER VARYING(1000),
                "'0', " + // CRS_ACT_PROFIT_AMT CHARACTER VARYING(1000),
                "'', " + // CRS_IS_VARY_FORECAST CHARACTER VARYING(1),
                "'', " + // CRS_REF_NO CHARACTER VARYING(100),
                "0, " + // CRS_EXT_STATUS INTEGER,
                "0, " + // CRS_FUP_PK BIGINT,
                "0, " + // CRS_RECON_FUP_PK BIGINT,
                USER_PK + ", " + // CRS_CREATED_BY INTEGER,
                "'"+ moment().format('DD/MM/YYYY') + "', " +// CRS_CREATED_DATE TIMESTAMP WITHOUT TIME ZONE,
                "0) " ; // CRS_PAID_BY INTEGER,
            myDB.execute(rpcmd,function(res){

                var cmd = "SELECT * FROM T_CLIENT_PRODUCT_MAPPING LEFT JOIN T_PRODUCT_MASTER ON (CPM_PRM_PK = PRM_PK) LEFT JOIN T_CLIENT_REPAY_SCHEDULE ON (CRS_PRM_LTY_PK = CPM_PRM_PK AND CRS_LOAN_SAVING_FLAG = 'S' AND CRS_CLT_PK = CPM_CLT_PK) WHERE CPM_CLT_PK =" + client.CLT_PK + " AND CPM_PRM_PK=" + prmpk;
                myDB.execute(cmd, function(p) {
                    console.log('new product');
                    console.log(p)
                    var newprd = p[0];
                    newprd.ACT_WTH_AMT = 0;
                    client.products.push(newprd);
                    $scope.$apply();
                    $scope.updateGroup(client.CLT_CENTER_ID,client.CLT_GROUP_ID,"F",balance,'N',client.CLT_PK);
                    $scope.updateCenter();
                });
            });
        });
    }

    $scope.getProducts = function (clients){ // Has schedule

        var deferred = $.Deferred();

        clients.isPrdLoaded = false;
        clients.isRanPrdLoaded = false;
        clients.isPushed = false;

        var dt = new Date();
        var time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();
 
        $.each(clients,function(index,client){


            client.productweek = null;
            var existingloans = "";
            $.each(client.loans,function(l,loan){

                if(existingloans != "") existingloans += ",";
                existingloans = existingloans +""+ loan.CLL_PK;
            });

            var cmdbal = "select prm.prm_pk, prm.PRM_LOCAL_NAME, prm.prm_local_name, prm.prm_loan_flexi_field,prm.prm_closing_charges,prm.prm_deposit_frequency, cpm.cpm_prm_pk, cpm.cpm_pk, cpm.cpm_prm_balance, cpm.cpm_status_pk,  "+
            " prm.prm_loan_withdraw_policy,prm.PRM_CODE, "+
            " cpc.cpc_disburse_amt, cpc.cpc_cpm_pk, cpc.cpc_status, DATE(cpc.cpc_disburse_date) as cpc_disburse_justdate, cpc.CPC_CLOSING_FEE, DATE(cpc.cpc_created_date) as cpc_created_justdate, "+
            " crs.CRS_PK,crs.CRS_ACTUAL_WEEK_NO, crs.CRS_BALANCE_CAPITAL, crs.CRS_BALANCE_PROFIT, crs.CRS_ATTENDED,  crs.CRS_ASSISTED,"+
            " crs.CRS_CLL_PK, crs.CRS_CLT_PK, crs.CRS_RECP_STATUS, crs.CRS_RECP_GROUP_STATUS, crs.CRS_SMS_STATUS, crs.CRS_SMS_GROUP_STATUS, crs.CRS_PAIDBY_PK, "+
            " wth.cpt_status, wth.cpt_reason, wth.cpt_pk,"+

            " MAX(crs.CRS_PK) as MAXCRS, "+
            " crs.CRS_DATE, "+

            " SUM(wth.cpt_txn_amount) as ACT_WTH_AMT, "+
            " SUM(col.cpt_txn_amount) as ACT_COL_AMT, "+
            " SUM(crs.CRS_EXP_CAPITAL_AMT) as CRS_EXP_CAPITAL_AMT, SUM(crs.CRS_EXP_PROFIT_AMT) as CRS_EXP_PROFIT_AMT, "+
            " SUM(crs.CRS_ACT_CAPITAL_AMT) as CRS_ACT_CAPITAL_AMT, SUM(crs.CRS_ACT_PROFIT_AMT) as CRS_ACT_PROFIT_AMT "+

            " from t_client_repay_schedule as crs"+ // get products client has
            " left join t_product_master as prm on  prm.prm_pk = crs.crs_prm_lty_pk and prm.prm_code != '22400000' and prm.prm_code !='002.005' "+ //get product name
            " left join (SELECT SUM(CPM_PRM_BALANCE) as CPM_PRM_BALANCE, CPM_PRM_PK, CPM_PK, CPM_CLT_PK, CPM_STATUS_PK FROM t_client_product_mapping GROUP BY CPM_CLT_PK,CPM_PRM_PK) as cpm on ( prm.prm_pk = cpm.cpm_prm_pk AND cpm.cpm_clt_pk = crs.crs_clt_pk)  "+
            " left join t_client_prd_txn as wth on (wth.cpt_prm_pk = cpm.cpm_prm_pk and wth.cpt_status = 58 and DATE(wth.cpt_datetime) = '"+$scope.anotherdate+"' )" +
            " left join t_client_prd_txn as col on (col.cpt_prm_pk = cpm.cpm_prm_pk and col.cpt_status = 48 and DATE(wth.cpt_datetime) = '"+$scope.anotherdate+"' )" +
            " left join t_client_product_close_info as cpc on cpc.cpc_cpm_pk = cpm.cpm_pk AND cpc.CPC_STATUS != 25 "+ // AND ( DATE(cpc.cpc_disburse_date)='"+$scope.anotherdate+"' OR DATE(cpc.cpc_created_date)='"+$scope.anotherdate+"' )
            " WHERE cpm.cpm_clt_pk ="+client.CLT_PK+
            "   and cpm.cpm_status_pk NOT IN (55,53) "+
            "   and crs.crs_clt_pk="+client.CLT_PK+
            "   and crs.crs_cll_pk = 0 " +
            "   and prm.prm_deposit_frequency !='R' "+
            "   and crs.crs_flag='C' "+
            "   and (crs.crs_loan_saving_flag='S' OR crs.crs_loan_saving_flag='X')"+
            "   and crs.crs_date='"+$scope.date+"'" +
            " group by crs.crs_clt_pk, cpm.cpm_prm_pk "+
            " order by prm.prm_loan_flexi_field ";
 
            myDB.execute(cmdbal, function(productres){

                // console.log("addProducts "+client.CLT_PK);
                // console.log(productres);
                if(productres.length <= 0){ 
                    client.isPrdLoaded = true;
                    deferred.resolve(true);
                } else {
              
                    for(cpb in productres){
                        
                        var pmresults = [];
                        row = 0;
                        
                        var strexp = 0;
                        var stract = 0;
                        var strwth = 0;
                        var strtxn = 0;

                        var wth_pk = 0;
 
                        var i = row - 1;
 
                        pmresults.CPM_PK = 0;
                        pmresults.CPM_PRM_PK = 0;
                        pmresults.CPM_CLL_PK = 0;
                        pmresults.CPM_PRM_BALANCE = 0;
                        pmresults.CPM_STATUS_PK = 0;

                        pmresults.PRM_PK = 0;
                        pmresults.PRM_CODE = 0;
                        pmresults.PRM_LOAN_FLEXI_FIELD = 0;
                        pmresults.PRM_CLOSING_CHARGES = 0;
                        pmresults.PRM_LOCAL_NAME = "";
                        pmresults.PRM_LOAN_WITHDRAW_POLICY = "";

                        pmresults.CRS_PK = 0;
                        pmresults.CRS_CLL_PK = 0;
                        pmresults.CRS_CLT_PK = 0;
                        pmresults.CRS_DATE = null;
                        pmresults.CRS_FLEXI_EXP = 0;
                        pmresults.CRS_FLEXI_ACT = 0;
                        pmresults.CRS_FLEXI_WTH = 0;
                        pmresults.CRS_FLEXI_APPROVED_WTH = 0;
                        pmresults.CRS_ACTUAL_WEEK_NO = 0;
                        pmresults.CRS_SMS_GROUP_STATUS = "";
                        pmresults.CRS_SMS_STATUS = "";
                        pmresults.CRS_RECP_GROUP_STATUS = "";
                        pmresults.CRS_RECP_STATUS = "";
                        pmresults.CRS_ACTUAL_WEEK_NO = 0;
                        pmresults.CRS_MAX_PK = 0;
                        pmresults.CRS_ASSISTED = "Y";
                        pmresults.CRS_PAIDBY_PK = null;

                        pmresults.WTH_PK = 0;
                        pmresults.WTH_NEW = false;
                        pmresults.TXN_AMOUNT = 0;

                        pmresults.CPC_CPM_PK = 0;
                        pmresults.CPC_DISBURSE_AMT = 0;
                        pmresults.cpc_disburse_date = '';
                        pmresults.cpc_created_date = '';
                        pmresults.CPC_CLOSING_FEE = 0;
                        pmresults.CPC_STATUS = 0;

                        pmresults.CPT_PK = 0;
                        pmresults.CPT_STATUS = 0;
                        pmresults.ACT_WTH_AMT = 0;
                        pmresults.ACT_COL_AMT = 0;

                        var flexi_field = 0;

                        //Get total for each product
                        for(bp in $scope.bpmproducts){
                            if($scope.bpmproducts[bp].PRM_LOCAL_NAME == productres[cpb].PRM_LOCAL_NAME){
                                $scope.bpmproducts[bp].total_EXP += parseFloat(strexp);
                                $scope.bpmproducts[bp].total_ACT += parseFloat(stract);
                            }
                        }
                        //If have withdrawal
                        if(productres[cpb].CPT_WTH_PK != 0 && productres[cpb].CPT_WTH_PK != null){
                            wth_pk = productres[cpb].CPT_WTH_PK;
                            strwth = productres[cpb].CPT_WTH_AMOUNT;
                        }

                        // Fill with data
                        pmresults.CPM_PK = productres[cpb].CPM_PK;
                        pmresults.CPM_CLL_PK = productres[cpb].CPM_CLL_PK;
                        pmresults.CPM_PRM_BALANCE = productres[cpb].CPM_PRM_BALANCE;
                        pmresults.CPM_PRM_PK = productres[cpb].CPM_PRM_PK;
                        pmresults.CPM_STATUS_PK =  productres[cpb].CPM_STATUS_PK;

                        pmresults.PRM_PK = productres[cpb].PRM_PK;
                        pmresults.PRM_CODE = productres[cpb].PRM_CODE;
                        pmresults.PRM_LOAN_FLEXI_FIELD = flexi_field;
                        pmresults.PRM_LOCAL_NAME = productres[cpb].PRM_LOCAL_NAME;
                        pmresults.PRM_CLOSING_CHARGES = productres[cpb].PRM_CLOSING_CHARGES;
                        pmresults.PRM_DEPOSIT_FREQUENCY = productres[cpb].PRM_DEPOSIT_FREQUENCY;
                        pmresults.PRM_LOAN_WITHDRAW_POLICY = productres[cpb].PRM_LOAN_WITHDRAW_POLICY;
                        
                        pmresults.CRS_PK = productres[cpb].CRS_PK;
                        pmresults.CRS_DATE = productres[cpb].CRS_DATE;
                        pmresults.CRS_FLEXI_EXP = productres[cpb].saving_exp;
                        pmresults.CRS_FLEXI_ACT = parseInt(productres[cpb].saving_act);
                        pmresults.CRS_ATTENDED = productres[cpb].CRS_ATTENDED;
                        pmresults.CRS_CLL_PK = productres[cpb].CRS_CLL_PK;
                        pmresults.CRS_CLT_PK = productres[cpb].CRS_CLT_PK;
                        pmresults.CRS_EXP_CAPITAL_AMT = productres[cpb].CRS_EXP_CAPITAL_AMT;
                        pmresults.CRS_EXP_PROFIT_AMT = productres[cpb].CRS_EXP_PROFIT_AMT;
                        pmresults.CRS_PAIDBY_PK = productres[cpb].CRS_PAIDBY_PK;

                        // console.log('paid by');
                        // console.log(productres[cpb].CRS_PAIDBY_PK);

                        if(productres[cpb].CRS_ASSISTED=='null'||productres[cpb].CRS_ASSISTED=="") pmresults.CRS_ASSISTED = 'N';

                        pmresults.CRS_ACT_CAPITAL_AMT = productres[cpb].CRS_EXP_CAPITAL_AMT;
                        pmresults.CRS_ACT_PROFIT_AMT = productres[cpb].CRS_EXP_PROFIT_AMT;

                        if(productres[cpb].CRS_SMS_GROUP_STATUS == 'Y'||
                            productres[cpb].CRS_RECP_GROUP_STATUS == 'Y'||
                            productres[cpb].CRS_SMS_STATUS == 'Y' ||
                            productres[cpb].CRS_RECP_STATUS == 'Y'){

                            pmresults.CRS_ACT_CAPITAL_AMT = productres[cpb].CRS_ACT_CAPITAL_AMT;
                            pmresults.CRS_ACT_PROFIT_AMT = productres[cpb].CRS_ACT_PROFIT_AMT;
                        }

                        pmresults.CRS_BALANCE_CAPITAL = productres[cpb].CRS_BALANCE_CAPITAL;
                        pmresults.CRS_BALANCE_PROFIT = productres[cpb].CRS_BALANCE_PROFIT;
                        pmresults.CRS_ACTUAL_WEEK_NO = productres[cpb].CRS_ACTUAL_WEEK_NO;

                        pmresults.CRS_SMS_GROUP_STATUS = productres[cpb].CRS_SMS_GROUP_STATUS;
                        pmresults.CRS_SMS_STATUS = productres[cpb].CRS_SMS_STATUS;
                        pmresults.CRS_RECP_GROUP_STATUS = productres[cpb].CRS_RECP_GROUP_STATUS;
                        pmresults.CRS_RECP_STATUS = productres[cpb].CRS_RECP_STATUS;
                        pmresults.CRS_MAX_PK = productres[cpb].MAXCRS;

                        pmresults.isDone = false;

                        if(productres[cpb].CRS_SMS_GROUP_STATUS == 'Y' ||
                            productres[cpb].CRS_RECP_GROUP_STATUS == 'Y' ||
                            productres[cpb].CRS_SMS_STATUS == 'Y' ||
                            productres[cpb].CRS_RECP_STATUS == 'Y'){
                            pmresults.isDone = true;
                            client.showdetails = false;
                            $.each($scope.user.village.groups,function(v,vil){

                                if(vil.CLT_CENTER_ID == client.CLT_CENTER_ID && vil.CLT_GROUP_ID == client.CLT_GROUP_ID && productres[cpb].PRM_CODE == '002.0001'){
                                    if(!contains(vil.loans,clientpk)){
                                        vil.loans.push(clientpk);
                                    }
                                }
                            })
                        }

                        pmresults.ORIG_BALANCE = parseFloat(pmresults.CRS_BALANCE_PROFIT) + parseFloat(pmresults.CRS_BALANCE_CAPITAL);

                        pmresults.CPT_WTH_REASON = productres[cpb].CPT_WTH_REASON;
                        pmresults.CPT_WTH_REMARK = productres[cpb].CPT_WTH_REMARK;
                        pmresults.CPT_USER_PK = productres[cpb].CPT_WTH_USER_PK;
                        pmresults.TXN_AMOUNT = strtxn;

                        pmresults.CPC_CPM_PK = productres[cpb].CPC_CPM_PK;
                        pmresults.CPC_STATUS = productres[cpb].CPC_STATUS;

                        pmresults.CPT_PK = productres[cpb].CPT_PK;
                        pmresults.CPT_STATUS = productres[cpb].CPT_STATUS;
                        pmresults.ACT_WTH_AMT = productres[cpb].ACT_WTH_AMT;
                        pmresults.ACT_COL_AMT = productres[cpb].ACT_COL_AMT;
                        if(pmresults.CRS_ATTENDED == '') pmresults.ACT_WTH_AMT = 0; //Fix for Collected  withdrawal amount

                        pmresults.CPC_CLOSING_FEE = productres[cpb].CPC_CLOSING_FEE;

                        // IF DISBURSEMENT IS TODAY
                        if( (pmresults.CPC_STATUS == 3  || pmresults.CPC_STATUS == 55) && productres[cpb].cpc_disburse_justdate == another_date){
                            pmresults.CRS_FLEXI_WTH += parseFloat(pmresults.CPC_DISBURSE_AMT);
                        }
                        var key = {
                            PRM_CODE : pmresults.PRM_CODE,
                            CLL_PK: pmresults.CPM_CLL_PK,
                            CLT_PK: pmresults.CPM_CLT_PK,
                        }
                        client.products.push(pmresults);
                        client.all_existing_prds.push(key);

                    }
                    client.isPrdLoaded = true;
                    deferred.resolve(productres);
                }

            });
        });

        return deferred.promise();

    }
    
    $scope.haveMoreProducts = function(client){
 
        var allloanprds = client.allloanprds;
        var all_existing_prds = client.all_existing_prds; 

        var prds = $filter('filterClientLoan')(allloanprds, all_existing_prds );
 
        if(prds.length > 0){
            return true;
        } else {
            return false;
        }
    }

    $scope.addRanProducts = function(clients){ //Random Saving

        var deferred = $.Deferred();
        var lastClient = false;
        var lastLoan = false;

        $.each(clients,function(c,client){

            if(c == clients.length - 1){
                lastClient = true;
            }

            var cmdrp   =" SELECT PRM_PK,PRM_LOCAL_NAME,CPM_PRM_PK,CPM_PK,CPM_STATUS_PK,CPM_CLL_PK, CPM_CLT_PK, CPM_PRM_BALANCE, PRM_CODE, PRM_LOAN_WITHDRAW_POLICY,  "+
                        " SUM(cpt.CPT_TXN_AMOUNT) as CPT_TXN_AMOUNT , "+
                        " SUM(col.CPT_TXN_AMOUNT) as ACT_COL_AMT , "+
                        " SUM(wth.CPT_TXN_AMOUNT) as ACT_WTH_AMT , "+
                        " CPC_STATUS, CPC_CLOSING_FEE,PRM_CLOSING_CHARGES "+
                        " FROM T_CLIENT_PRODUCT_MAPPING,T_PRODUCT_MASTER "+
                        " LEFT JOIN T_CLIENT_PRD_TXN as cpt ON (cpt.CPT_CPM_PK = CPM_PK AND cpt.CPT_FLAG='C' AND cpt.CPT_COLLECTION_WEEK_NO != 0 AND DATE(cpt.CPT_DATETIME)='"+$scope.anotherdate+"'"+") "+
                        " LEFT JOIN T_CLIENT_PRD_TXN as wth ON (wth.CPT_CPM_PK = CPM_PK AND wth.CPT_FLAG='D' AND wth.CPT_STATUS IN (58)  AND DATE(wth.CPT_DATETIME)='"+$scope.anotherdate+"'"+") "+
                        " LEFT JOIN T_CLIENT_PRD_TXN as col ON (col.CPT_CPM_PK = CPM_PK AND col.CPT_FLAG='D' AND col.CPT_STATUS IN (48)  AND DATE(col.CPT_DATETIME)='"+$scope.anotherdate+"'"+") "+
                        " LEFT JOIN t_client_product_close_info as cpc on cpc.cpc_cpm_pk = CPM_PK AND cpc.CPC_STATUS != 25 "+
                        " WHERE CPM_CLT_PK="+client.CLT_PK+
                        " AND PRM_DEPOSIT_FREQUENCY = 'R' "+
                        " AND CPM_PRM_PK != 76 " +
                        " AND CPM_CHKNEW != 2 "+
                        " AND PRM_PK = CPM_PRM_PK and PRM_CODE != '22400000' "+
                        " GROUP BY PRM_PK";
 
            myDB.execute(cmdrp,function(resu){
                //printLog(resu);
                if(resu.length == 0){
                    client.isRanPrdLoaded = true;
                    if(lastClient){
                        deferred.resolve(true);
                    }

                } else {
                    for(ranp in resu){

                        var ran_prd = {
                            CPT_CPM_PK:0,
                            CPM_PRM_PK: 0,
                            CPM_CLL_PK: 0,
                            CPM_CLT_PK: 0,
                            CPM_STATUS_PK: 0,
                            CPM_PRM_BALANCE: 0,
                            PRM_PK: 0,
                            PRM_LOCAL_NAME: "",
                            CRS_BALANCE_CAPITAL: 0,
                            CRS_BALANCE_PROFIT: 0,
                            CRS_EXP_CAPITAL_AMT: 0,
                            CRS_EXP_PROFIT_AMT: 0,
                            CRS_ACT_PROFIT_AMT: 0,
                            CRS_ACT_CAPITAL_AMT: 0,
                            PRM_DEPOSIT_FREQUENCY: 'R',
                            PRM_LOAN_WITHDRAW_POLICY: 'A',
                            PRM_CLOSING_CHARGES:0,
                            PRM_CODE: 0,
                            ACT_WTH_AMT: 0,
                            ACT_COL_AMT: 0,
                            CRS_ATTENDED: '',
                            CPC_STATUS : 0,
                            CPC_CLOSING_FEE : 0

                        };

                        ran_prd.CPM_PK = resu[ranp].CPM_PK;
                        ran_prd.CPT_CPM_PK = resu[ranp].CPM_PK;
                        ran_prd.CPM_PRM_PK = resu[ranp].CPM_PRM_PK;
                        ran_prd.CPM_CLL_PK = resu[ranp].CPM_CLL_PK;
                        ran_prd.CPM_CLT_PK = resu[ranp].CPM_CLT_PK;
                        ran_prd.CPM_STATUS_PK = resu[ranp].CPM_STATUS_PK;
                        ran_prd.CPM_PRM_BALANCE = resu[ranp].CPM_PRM_BALANCE;

                        ran_prd.PRM_PK = resu[ranp].PRM_PK;
                        ran_prd.PRM_LOCAL_NAME = resu[ranp].PRM_LOCAL_NAME;
                        ran_prd.PRM_LOAN_WITHDRAW_POLICY = resu[ranp].PRM_LOAN_WITHDRAW_POLICY;
                        ran_prd.PRM_CLOSING_CHARGES = resu[ranp].PRM_CLOSING_CHARGES;
                        ran_prd.PRM_CODE = resu[ranp].PRM_CODE;

                        ran_prd.CRS_BALANCE_CAPITAL = resu[ranp].CPM_PRM_BALANCE;
                        ran_prd.CRS_ACT_CAPITAL_AMT = resu[ranp].CPT_TXN_AMOUNT;
                        ran_prd.ACT_WTH_AMT = resu[ranp].ACT_WTH_AMT;
                        ran_prd.ACT_COL_AMT = resu[ranp].ACT_COL_AMT;

                        ran_prd.CPC_STATUS = resu[ranp].CPC_STATUS;
                        ran_prd.CPC_CLOSING_FEE = resu[ranp].CPC_CLOSING_FEE;

                        if(ran_prd.CRS_ACT_CAPITAL_AMT ==  null){ // NULL is not collected yet
                            ran_prd.CRS_ACT_CAPITAL_AMT = 0;
                        }

                        if(resu[ranp].CPT_TXN_AMOUNT || resu[ranp].ACT_WTH_AMT){
                            ran_prd.CRS_ATTENDED = 'Y';
                        }

                        if(ran_prd.CRS_BALANCE_CAPITAL ==  null){ // NULL is not collected yet
                            ran_prd.CRS_BALANCE_CAPITAL = 0;
                        }
                        if(ran_prd.ACT_WTH_AMT == null){
                            ran_prd.ACT_WTH_AMT = 0;
                        }

                        client.ranproducts.push(ran_prd);

                        var key = {
                            PRM_CODE : ran_prd.PRM_CODE,
                            CLL_PK: ran_prd.CPM_CLL_PK,
                            CLT_PK: ran_prd.CPM_CLT_PK,
                        }
                        client.all_existing_prds.push(key);

                    }
                    ////printLog(loan);
                    client.isRanPrdLoaded = true;
                    if(lastClient ){
                        deferred.resolve(resu);
                    }
                }

            });
        });

        return deferred.promise();
    }

    $scope.feastrepay =  feastrepay;

    $scope.getAllLoanPrd = function(clients){

        var deferred = $.Deferred();

        var loans = "";
        $.each(clients,function(c,client){
            $.each(client.loans,function(l,loan){
                //printLog(loan);
                if(loans != "") loans += ",";
                loans += loan.CLL_LTY_PK;
            })

            client.allloanprds = [];

            var cmd =  " SELECT PRM_CODE, PRM_LOCAL_NAME, PRM_DESCRIPTION FROM T_PRODUCT_MASTER ";
                cmd += " LEFT JOIN T_LOAN_SAVING_PRD_MAPPING ON (PRM_PK = LSM_PRM_PK) ";
                cmd += " LEFT JOIN T_LOAN_TYPE ON (LSM_LTY_PK = LTY_PK AND LTY_PK IN ("+loans+") )";
                cmd += " WHERE LTY_PK = LSM_LTY_PK AND PRM_PK = LSM_PRM_PK";
                // cmd +=" AND ";
                cmd += " AND PRM_CODE NOT IN('002.0001','002.0004','22400000') ";
                cmd += " GROUP BY PRM_CODE ";

            //printLog("3801");
            //printLog(cmd);
            myDB.execute(cmd,function(res){ 
                client.allloanprds = res ;
            });
        })
        deferred.resolve(true);

        return deferred.promise();
    }


    $scope.getUnAssocProducts = function(clients,asc_products){

        var deferred = $.Deferred();

        $.each(clients.loans,function(l,loan){
            var cmd = " SELECT * FROM T_LOAN_TYPE,T_LOAN_SAVING_PRODUCT_MAPPING,T_PRODUCT_MASTER,T_PRODUCT_MASTER_DETAILS";
            cmd     +=" WHERE  AND LTY"
        });


        deferred.resolve(true);

        return deferred.promise();

    }

    $scope.refreshClient = function(){
        var dt = new Date();
        var time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();

    }

    $scope.canWithdrawal = function(prd){

        var canWth = false;
        if(prd.PRM_LOAN_WITHDRAW_POLICY == 'A' || (prd.PRM_LOAN_WITHDRAW_POLICY != 'A' && prd.CPM_STATUS_PK == 55) ){
            canWth = true;
        }
        return canWth;
    }

    $scope.updateVille = function(){

    }

    $scope.groupPrint = function(group){

        $scope.changeGroup(group);

        var coltxt = i18n.t("messages.HaveYouCollected");

        var expected = group.total_exp.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");

        coltxt = coltxt.replace("@@Amount@@","IDR "+ expected);
        if($scope.groupCompleted(group)){
            setTimeout(function(){
                $scope.sendMsg('G', 'R', $scope.user,0);
            },50);
        } else {
            swal({
                title: coltxt,
                text:  '',
                showCancelButton: true,
                confirmButtonText: i18n.t("messages.Yes"),
                cancelButtonText: i18n.t("messages.No"),
                confirmButtonColor: '#4dbd33'
            }).then(function(confirm){ 
                if(confirm.value){
                    $scope.sendMsg('G', 'R', $scope.user,0);
                } else {
                  swal.close();
                }
            });
        }
    } 
    $scope.showClient = function(client){

        if(client.showdetails){
            client.showdetails = false;
        } else {
            client.showdetails = true;
        }

    }

    $scope.changeGroup = function(group){
        ////printLog(group);
        var keypair = { 'name': group.VLM_NAME, 'value': group.CLT_GROUP_ID, 'centerid': group.CLT_CENTER_ID} ;
        $scope.autoSelGroup(keypair) ;
        ////printLog( keypair );
        //$("html, body").animate({ scrollTop: 0 }, 600);
    }

    $scope.loaded = false;

    $scope.detailview = function(){
        if($scope.clientspage)
            $scope.clientspage = false;
        else
            $scope.clientspage = true;

        if($scope.clientspage){
            $('.first-page').hide();
            $('.second-wrapper').show();
            $('.second-page').fadeOut();
        } else {
            if(!$scope.loaded) $scope.viilletotal();
            $('.first-page').fadeIn();
            $('.second-page').show();
            $('.second-wrapper').hide();
        }
        $("html, body").animate({ scrollTop: 0 }, "fast");
        //printLog($scope.user.village.group);
    }
    var directive = {
        restrict: 'EA',
        link: function() {
            var isField = ($element[0].tagName === 'INPUT');

            if(!isField) {
                // Load the html through $templateRequest
                $templateRequest('datepicker.html').then(function(html){
                    // Convert the html to an actual DOM node
                    var template = angular.element(html);
                    // Append it to the directive element
                    $element.append(template);
                    // And let Angular $compile it
                    $compile(template)($scope);
                });
            }
        }
    };
    $scope.clientprofile = function(client){

        ////printLog(client);

        sessionStorage.setItem("LOAN_ID",client.loans[0].CLL_PK);
        sessionStorage.setItem("PREV_LOAN_ID",client.loans[0].CLL_PARENT_CLL_PK);
        sessionStorage.setItem('CLIENT_ID',client.CLT_PK);

        $scope.loan_id = sessionStorage.getItem("LOAN_ID");
        $scope.prev_loan_id = sessionStorage.getItem("PREV_LOAN_ID");

         $scope.currLoan = [];

        $('.whitecover').fadeIn();

        $.ajax({
            type: 'post',
            url: 'view_client_ajax.html',
            success: function(html)
            {
                ////printLog(html);
                var bhtml = '';

                var newhtml = bhtml + html;

                var template = angular.element(newhtml);
                $(".whitecover .coverwrap").height($(window).height()-100);
                $(".whitecover .coverwrap").width('100%');
                $(".whitecover .coverwrap").html(template);

                $.when($compile(template)($scope)).done(function(){

                    $('.whitecover .coverwrap').prepend('<div class="pophead"><div class="closepop"><i class="fa fa-3x fa-times"></i></div></div>'+

                        '<div class="ui-content"><div data-role="controlgroup" data-type="horizontal" style="text-align:left;width:101%;">'+
                        '<a href="#pageAppData" class="ui-btn ui-btn-h ui-corner-all ui-shadow ui-icon-user ui-btn-icon-left mini-header selected" data-i18n="buttons.Applicant">Applicant<div class="btm-bar"></div></a>'+
                        '<a href="#pageAppData2" class="ui-btn ui-btn-h ui-corner-all ui-shadow ui-icon-user ui-btn-icon-left mini-header" data-i18n="buttons.Husband">Husband</a>'+
                        '<a href="#pageAppData3" class="ui-btn ui-btn-h ui-corner-all ui-shadow ui-icon-user ui-btn-icon-left mini-header" data-i18n="buttons.HouseholdMother">Household/Mother</a>'+
                        '<a href="#pageAppData4" class="ui-btn ui-btn-h ui-corner-all ui-shadow ui-icon-plus ui-btn-icon-left mini-header" data-i18n="buttons.Business">Business</a>'+
                        '<a href="#pageAddress" class="ui-btn ui-btn-h ui-corner-all ui-shadow ui-icon-phone ui-btn-icon-left mini-header" data-i18n="buttons.Address">Address</a>'+
                        '<a href="#pageWelfareStatus" class="ui-btn ui-btn-h ui-corner-all ui-shadow ui-icon-home ui-btn-icon-left mini-header" data-i18n="buttons.FamilyWelfare">Welfare</a>'+
                        '</div>'+
                        '<div data-role="controlgroup" data-type="horizontal" style="text-align:left;width:102%;">'+
                        '<a href="#pageWorkingCapital" class="ui-btn ui-btn-h ui-corner-all ui-shadow ui-icon-bars ui-btn-icon-left mini-header " data-i18n="buttons.WorkingCapital">Working Capital</a>'+
                        '<a href="#pageHousingIndex" class="ui-btn ui-btn-h ui-corner-all ui-shadow ui-icon-home ui-btn-icon-left mini-header" data-i18n="buttons.HousingIndex">Housing Index</a>'+
                        '<a href="#pageHouseIncomeEst" class="ui-btn ui-btn-h ui-corner-all ui-shadow ui-icon-bars ui-btn-icon-left mini-header" data-i18n="buttons.Income">Income</a>'+
                        '<a href="#pagePaymentHistory" class="ui-btn ui-btn-h ui-cortotner-all ui-shadow ui-icon-bars ui-btn-icon-left mini-header" data-i18n="buttons.History">History</a>'+(($scope.prev_loan_id!="null")?('<a href="#pagePrevPaymentHistory" class="ui-btn ui-btn-h ui-corner-all ui-shadow ui-icon-bars ui-btn-icon-left">Prev History</a>'):"")+
                        '<a href="#pageAccountStatus" class="ui-btn ui-btn-h ui-corner-all ui-shadow ui-icon-user ui-btn-icon-left mini-header" data-i18n="buttons.Status">Status</a>'+
                        '<a href="#pageProductMapping" class="ui-btn ui-btn-h ui-corner-all ui-shadow ui-icon-grid ui-btn-icon-left mini-header" data-i18n="buttons.ProductMapping">Product Map</a>'+
                        '</div></div>');
                    $('.whitecover .coverwrap').trigger("create");

                    $.when($scope.loadAllProducts())
                    .done(function(){
                        $('.mini-client-details').hide();
                        $('.mini-client-details:first').fadeIn();
                        $scope.autoloadClientLoans();
                        loadNCADphoto();
                    });
                });

            }
        });

    }
    /******************************************
    // Client Info related
    ******************************************/

        $scope.clientinfo = null;
        $scope.loaninfo = null;
        $scope.borrowedinfo = null;
        $scope.incomeinfo = null;
        $scope.trainingschedule = null;
        $scope.productinfo = null;
        $scope.unadded_productinfo = [];
        $scope.allproducts = [];
        $scope.last_cmp_pk = null;
        $scope.words = [
            greyicon    = '',
            redicon     = '',
            goldicon    = '',
            blueicon    = '',
        ];
        var t = $scope;

        var todate = new Date();

        todate = todate.getFullYear()+"-"+("0"+(todate.getMonth()+1)).slice(-2)+"-"+("0"+todate.getDate()).slice(-2);

        $scope.prepWords = function(){

            // data-18n not working within ng-repeat - this is manual fix

            //main table header
            $scope.words.ProductName = i18n.t("messages.ProductName");
            $scope.words.AccountNumber = i18n.t("messages.AccountNumber");
            $scope.words.Maturity = i18n.t("messages.Maturity");
            $scope.words.Balance = i18n.t("messages.Balance");
            $scope.words.Status = i18n.t("messages.Status");
            $scope.words.Action = i18n.t("messages.Action");

            $scope.words.LiketoAddProduct = i18n.t("messages.LiketoAddProduct");
            $scope.words.NoCloseRecords = i18n.t("messages.NoCloseRecords");

            //second table header
            $scope.words.Reason = i18n.t("messages.Reason");
            $scope.words.ClosingCharge = i18n.t("messages.ClosingCharge");
            $scope.words.DisbursedAmt = i18n.t("messages.DisbursedAmt");
            $scope.words.CloseDate = i18n.t("messages.CloseDate");

            //legend
            $scope.words.greyicon = i18n.t("messages.ActiveAccount")+" & "+i18n.t("messages.PendingClosureApproval");
            $scope.words.redicon = i18n.t("messages.ActiveAccount")+" & "+i18n.t("messages.AbleRequestClosure");
            $scope.words.blueicon = i18n.t("messages.NewAccount")+" & "+i18n.t("messages.AbleCancelActImmed");
            $scope.words.goldicon = i18n.t("messages.InactiveAccount")+" & "+i18n.t("messages.AbleActivateAccount");

            setTimeout(function(){
                $scope.$apply();
            },1);

        }

        setTimeout(function(){
            $scope.prepWords();
        },500);

        /******************************************
        // Function that fixes the date display
        ******************************************/
        $scope.prepDate = function(d){
            var dateonly = (d+"").split(" ")[0];
            dateonly = dateonly.split(/-|\//g);
            return dateonly[0]+"/"+dateonly[1]+"/"+dateonly[2];
        }

        /******************************************
        // Set results to angular variable to be displayed on UI
        ******************************************/
        $scope.setClientInfo = function(results){ //setClientInfo
            $scope.$apply(function() {

                var date = new Date();
                date = ("0"+date.getDate()).slice(-2)+"/"+("0"+(date.getMonth()+1)).slice(-2)+"/"+date.getFullYear();
                $scope.loans = [];
                $scope.clientinfo = results;
                $scope.clientinfo.CLT_BIRTHDATE = $scope.prepDate($scope.clientinfo.CLT_DOB);
                $scope.clientinfo.CLT_MOTHER_BIRTHDATE = $scope.prepDate($scope.clientinfo.CLT_MOTHER_DOB);

                if(results.CLT_MOB_NEW == 1 || results.CLT_MOB_NEW == 2){
                    cmd = "SELECT * FROM T_LOAN_TYPE,T_CLIENT_LOAN,T_LOAN_PURPOSE WHERE  CLL_LTY_PK = LTY_PK AND CLL_CLT_PK = "+$scope.clientinfo.CLT_PK+" AND LPU_PK = CLL_LPU_PK order by LTY_CODE";
                } else {
                    cmd = "SELECT * FROM T_LOAN_TYPE,T_CLIENT_LOAN,T_LOAN_PURPOSE,T_CLIENT_REPAY_SCHEDULE WHERE CLL_LTY_PK = LTY_PK AND CRS_DATE='"+date+"' AND LPU_PK = CLL_LPU_PK AND CRS_LOAN_SAVING_FLAG='L' AND CRS_FLAG ='C' AND CLL_CLT_PK = "+$scope.clientinfo.CLT_PK+" GROUP BY CLL_PK order by LTY_CODE";
                }

                myDB.execute(cmd,function(results){
                    //printLog(results);
                    var loans = [];
                    $.each(results,function(ind,rec){
                        rec.products = [];
                        rec.isSelected = false;
                        var matarray = [];
                        for(var i=rec.LTY_MIN_REPAY_WEEK; i <= rec.LTY_MAX_REPAY_WEEK; i++){
                            var key = {
                                value : i,
                                name : i
                            };
                            matarray.push(key);
                        }
                        rec.maturityOptions = matarray;
                        rec.selecteddetais = {
                            loanamt: rec.CLL_ACTUAL_LOAN,
                            loanmaturity: {
                                value: rec.CLL_TOTAL_LOAN_WEEKS
                            },
                            loanpurpose: {
                                value: rec.LPU_PK,
                                name: rec.LPU_NAME
                            }
                        };
                        $scope.loans.push(rec);

                        var cnt = parseInt(ind) + 1;

                        if(cnt == results.length){
                            //printLog($scope.loans);
                            //$scope.loadproducts();
                        }

                    });
                });
            });
        };

        $scope.refresh = function(client,typ){

            var pk = client.CLT_PK;
            //printLog("refresh");
            //printLog(client.selectedProduct);

            setTimeout(function(){ 
                refreshall('#newprod'+pk);
                $scope.$apply();
            },100);

            //Check Prodct Type
            var prm_code = $('#newprod'+pk).val();

            var prm_description = $("#newprod"+pk+" option[value='"+prm_code+"']").text();
            if(typ == 'prd'){
                if(prm_code == '002.0007'){
                    $('#newprodmattxt'+pk).fadeOut();
                    $('#newprodwktxt'+pk).fadeOut();
                    $('#newProdMat'+pk).fadeOut();

                    $('#newprodpay'+pk).fadeIn();


                } else {
                    $('#newprodmattxt'+pk).fadeIn();
                    $('#newprodwktxt'+pk).fadeIn();
                    $('#newProdMat'+pk).fadeIn();

                    $('#newprodpay'+pk).fadeOut();
                }
            }

            $('.newprod').each(function(i, element) {
                var selval = $(this).val();
                var selected = $(this).find('option[value="'+selval+'"]').html();
                if(selected != null && selected != ''){
                    $(this).parent().find('span').html(selected);
                }

            });
        }

        $scope.loadAllProducts = function(){

            var allmd   =  " select prm.*, CPM_PK, CPM_PRM_PK, CPM_CLL_PK, CPM_CLT_PK, CPM_PRM_MATURITY, CPM_PRM_BALANCE, CPM_PRM_JOIN_DATE, CPM_PRM_CLOSE_DATE, CPM_PRM_ACC_NUMBER, CPM_CHKNEW from t_product_master as prm";
            allmd       += " left join t_client_product_mapping as cpm on (cpm.cpm_prm_pk=prm.prm_pk and cpm.cpm_prm_close_date='null' and prm_code !='22400000' and cpm.cpm_cll_pk="+$scope.loan_id+")";

            myDB.execute(allmd,function(results){
                $scope.allproducts = [];
                if(results.length > 0){
                    var isLast = false;

                    ////printLog(results);

                    $.each(results,function(ind,rec){

                        rec.isActive = false;
                        rec.status = "Inactive"
                        rec.STATUS_TEXT = i18n.t("messages.InActive");
                        //Checking if account active
                        if(rec.CPM_PK != null){
                            rec.isActive = true;
                            rec.status = "Active"
                            if(rec.CPM_CHKNEW == 2) rec.status = "New";
                            rec.STATUS_TEXT = i18n.t("messages.Active");
                            if(rec.CPM_PRM_BALANCE==""||rec.CPM_PRM_BALANCE=="null"||rec.CPM_PRM_BALANCE==null)rec.CPM_PRM_BALANCE = 0.00;
                            rec.CPM_PRM_BALANCE_TEXT = $filter('currency')(rec.CPM_PRM_BALANCE);
                        } else {
                            rec.CPM_PRM_BALANCE_TEXT = "NA";
                        }
                        //FREQUENCY_TEXT
                        rec.PRM_DEPOSIT_FREQUENCY_TEXT = i18n.t("messages.Random");
                        if(rec.PRM_DEPOSIT_FREQUENCY=='W') rec.PRM_DEPOSIT_FREQUENCY_TEXT = i18n.t("messages.Weekly");
                        //MANDATORY_TEXT
                        rec.PRM_IS_MANDATORY_TEXT = i18n.t("messages.No");
                        if(rec.PRM_IS_MANDATORY=="Y") rec.PRM_IS_MANDATORY_TEXT = i18n.t("messages.Yes");
                        //MATURITY
                        if(rec.PRM_MATURITY_OPTIONS != null && rec.PRM_MATURITY_OPTIONS.indexOf(",") !== -1){
                            var matarray = rec.PRM_MATURITY_OPTIONS.split(",");
                            rec.CPM_PRM_MATURITY_TEXT = matarray[rec.CPM_PRM_MATURITY];
                        } else {
                            rec.CPM_PRM_MATURITY_TEXT = rec.PRM_MATURITY_OPTIONS;
                        }


                        //STATUS

                        // $scope.allproducts.push(rec);

                        //printLog(rec);
                        if(results.length == parseInt(ind+1)) isLast = true;

                        $scope.loadAllProductAccount(rec,isLast);

                    });
                }
            });
        }


        var cptdate = new Date();

        cptdate = cptdate.getFullYear()+"-"+("0"+(cptdate.getMonth()+1)).slice(-2)+"-"+("0"+cptdate.getDate()).slice(-2);


        $scope.loadAllProductAccount = function(product, isLast){
            var cmd  = " select CPM_PK, CPM_PRM_MATURITY, CPM_PRM_BALANCE, CPM_PRM_JOIN_DATE, CPM_PRM_CLOSE_DATE, CPM_PRM_ACC_NUMBER, CPM_CHKNEW, CPM_PRM_ACC_NUMBER ";

            cmd     += " ,CPC_REASON, CPC_MANAGER_REMARK, CPC_STATUS, CPC_CLOSING_FEE, CPC_DISBURSE_AMT, CPC_CHKNEW, CPC_DISBURSE_DATE, DATE(CPC_DISBURSE_DATE) as CPC_DISBURSE_JUSTDATE ";
            cmd     += " from t_client_product_close_info as cpc";
            cmd     += " left join t_client_product_mapping as cpm  on (cpc.cpc_cpm_pk=cpm.cpm_pk and cpm.cpm_cll_pk="+$scope.loan_id+") ";
            cmd     += " left join t_product_master as prm on (prm.prm_pk = cpm.cpm_prm_pk) ";
            cmd     += " where cpm_prm_pk="+product.PRM_PK+" and prm_code != '22400000' and cpm_cll_pk="+$scope.loan_id;
            //printLog('loadAllProductAccount');
            myDB.execute(cmd,function(results){
                ////printLog(results);
                product.closerequests = [];
                product.activeaccount = null;
                if(results.length > 0){

                    $.each(results,function(ind,rec){

                        //CLOSE DATE
                        rec.CPC_DISBURSE_AMT_TEXT = $filter('currency')(rec.CPC_DISBURSE_AMT);
                        if(rec.CPM_PRM_CLOSE_DATE=="null"||rec.CPM_PRM_CLOSE_DATE==null){
                            rec.CPM_PRM_CLOSE_DATE="NA";
                            rec.CPC_DISBURSE_AMT_TEXT = "NA";
                        }
                        //STATUS
                        rec.CPC_STATUS_TEXT="Active";
                        if(rec.CPM_CHKNEW==2)rec.CPC_STATUS_TEXT="Just Created";
                        if(rec.CPC_STATUS==53 || rec.CPC_STATUS==3){
                            rec.CPC_STATUS_TEXT= i18n.t("messages.PendingClosureApproval");
                            product.status="Pending";
                        } else if(rec.CPC_STATUS==55){
                             rec.CPC_STATUS_TEXT= i18n.t("messages.Closed");
                            if(rec.CPC_DISBURSE_JUSTDATE == $scope.anotherdate){
                                product.status="Closed";
                            } else {

                            }
                            if(rec.CPC_CHKNEW==1){
                                product.STATUS_TEXT = i18n.t("messages.Closed");
                                product.status="Pending";
                            }

                        }
                        //REASON
                        if(rec.CPC_REASON==null)rec.CPC_REASON="NA";
                        //REMARK
                        if(rec.CPC_MANAGER_REMARK==null)rec.CPC_MANAGER_REMARK="NA";

                        product.closerequests.push(rec);

                    });


                }

                $scope.allproducts.push(product);
                if(isLast){
                    $scope.allproducts;
                    $scope.$apply();
                   ////printLog( $scope.allproducts);
                }
            });
        }

        $scope.getAllProducts = function(){

            var cmd = "SELECT * FROM T_PRODUCT_MASTER ";
            myDB.execute(cmd,function(res){
                $scope.productmaster = res;
            });
        }
        

        $scope.autoloadClientLoans = function(){
            /******************************************
            // auto load client's loan details
            ******************************************/

            var s = $scope;

            $scope.loanpurpose = [];

            myDB.execute("SELECT * FROM T_CLIENT,T_CLIENT_LOAN, T_VILLAGE_MASTER WHERE CLL_PK="+$scope.loan_id+" AND CLT_VILLAGE=VLM_PK AND CLT_PK=CLL_CLT_PK",function(results){
            $scope.setClientInfo(results[0]);
            var client_id = results[0]['CLT_PK'];
            myDB.execute("SELECT * FROM T_CLIENT_LOAN WHERE CLL_PK="+$scope.loan_id,function(results){
                $scope.$apply(function () {
                    s.loaninfo = results[0];
                    s.loaninfo.CLL_SCHEDULD_LAST_PAY_DATE_PREP = s.prepDate(s.loaninfo.CLL_SCHEDULD_LAST_PAY_DATE);
                    s.loaninfo.CLL_ACTUAL_LAST_PAY_DATE_PREP = s.prepDate(s.loaninfo.CLL_ACTUAL_LAST_PAY_DATE);
                });
                myDB.execute("SELECT * FROM T_FAMILY_WELFARE WHERE FWF_TYPE_PK='"+$scope.loaninfo.CLL_WELFARE_STATUS+"'",function(results){
                    s.$apply(function () {s.selectedWelfare = results[0];});
                });
            });
            myDB.execute("SELECT * FROM T_CLIENT_BORROWED_FUNDS WHERE CEF_CLL_PK="+$scope.loan_id,function(results){
                s.$apply(function () {s.borrowedinfo = results;});
            });
            myDB.execute("SELECT * FROM T_CLIENT_INCOME WHERE CLI_CLL_PK="+$scope.loan_id,function(results){
                s.$apply(function () {s.incomeinfo = results;});
            });

            /******************************************
            // load loan history (can be previous or current loan, depending on the arguments passed to the function)
            ******************************************/

            $scope.loadLoan = function(){

                var cmd = "SELECT T_CLIENT_LOAN.*, T_LOAN_TYPE.*, MAX(CRS_ACTUAL_WEEK_NO) as CRS_ACTUAL_WEEK_NO  FROM T_CLIENT_LOAN,T_LOAN_TYPE,T_CLIENT_REPAY_SCHEDULE WHERE CRS_LOAN_SAVING_FLAG='L' AND CLL_LTY_PK = LTY_PK AND CLL_CLT_PK="+sessionStorage.getItem('CLIENT_ID')+" AND CRS_CLL_PK = CLL_PK AND CRS_ATTENDED='Y' GROUP BY CLL_PK";

                myDB.execute(cmd,function(res){
                    //printLog(res);
                    $.each(res,function(i,loan){
                        //printLog(loan);
                        $scope.currLoan.push(loan);

                        if(i == 0){
                            $scope.currLoanSelPK = loan.CLL_PK;
                                setTimeout(function(){
                                //run queries to load loan history
                                $scope.loadHistoryQuery();

                            },500);
                        }
                    });
                })
            }

            $scope.loadLoan();

            $scope.SelectLoanHistory = function(obj,CLL_PK){


                $('.loanhist').removeClass('selected');
                $(obj).addClass('selected');

                //printLog($(obj).html());

                $scope.currLoanSelPK = CLL_PK;
                $scope.loadHistoryQuery();

            }

                $scope.loadHistory = function(cmd, historydata, historyfn, historycanvas){

                    $scope[historydata] = [];
                    myDB.execute(cmd,function(results){
                        //printLog(results);
                        /*if (historycanvas=="prevHistoryChart"){
                            //printLog(cmd);
                            //printLog(results);
                        }*/

                        if(results.length<=0) return false;
                        $.each(results, function(i,r){ //save into a custom format
                            var rec = [
                                r.CRS_ACTUAL_WEEK_NO,
                                r.CRS_DATE,
                                '-',
                                '-',
                                parseFloat(r.CRS_EXP_CAPITAL_AMT),
                                r.CRS_EXP_PROFIT_AMT,
                                parseFloat(r.CRS_EXP_CAPITAL_AMT)+parseFloat(r.CRS_EXP_PROFIT_AMT),
                                parseFloat(r.CRS_ACT_CAPITAL_AMT),
                                parseFloat(r.CRS_ACT_PROFIT_AMT),
                                '',
                                parseFloat(r.CRS_ACT_CAPITAL_AMT)+parseFloat(r.CRS_ACT_PROFIT_AMT)
                            ];
                            $scope[historydata].push(rec);
                        });

                        $scope.$apply(function(){//force update
                            $scope[historydata];
                            historyfn();
                        });

                        var label = [], dataset = []; //populate data into the labels
                        $.each($scope[historydata], function(ind, obj){
                          //  label.push('Week '+(obj[0]));
                            label.push(i18n.t("messages.Week") + " " + (obj[0]));
                            dataset.push(obj[10]);
                        });

                        //printLog($scope[historydata]);

                        //specify canvas
                        $("#"+historycanvas).attr({width:$(window).width()*0.9, height:$(window).width()/3});
                        if(dataset.length==0) $(historycanvas).css({display:'none'});
                        var ctx = document.getElementById(historycanvas).getContext("2d");

                        data = {
                            labels: label,
                            datasets: [
                                {
                                    label: "Payment History",
                                    fillColor: "rgba(151,187,205,0.2)",
                                    strokeColor: "rgba(151,187,205,1)",
                                    pointColor: "rgba(151,187,205,1)",
                                    pointStrokeColor: "#fff",
                                    pointHighlightFill: "#fff",
                                    pointHighlightStroke: "rgba(151,187,205,1)",
                                    data: dataset
                                }
                            ]
                        };
                    122
                        var myNewChart = new Chart(ctx).Bar(data);
                        if(historydata=="history"){ $scope.updateStatus(results); } //if it's current loan history
                    });
                };

                $scope.loadHistoryQuery = function(){
                    //printLog('load1');
                    $scope.loadHistory("SELECT * FROM T_CLIENT_LOAN,T_CLIENT_REPAY_SCHEDULE WHERE ((CLL_STATUS>=13 AND CLL_STATUS<=42) OR CLL_STATUS=9) AND CRS_FLAG='C' AND CRS_LOAN_SAVING_FLAG ='L' AND CLT_PK=CRS_CLT_PK AND CLL_CLT_PK ="+sessionStorage.getItem('CLIENT_ID')+" AND CLL_PK="+$scope.currLoanSelPK+" ORDER BY CRS_ACTUAL_WEEK_NO","history",$scope.getHistory,"historyChart");
                    //for previous loans
                    $scope.loadHistory("SELECT * FROM T_CLIENT_LOAN,T_CLIENT_REPAY_SCHEDULE WHERE CRS_FLAG='C' AND CRS_LOAN_SAVING_FLAG ='L' AND CLT_PK=CRS_CLT_PK AND CLL_PK="+$scope.prev_loan_id+" ORDER BY CRS_ACTUAL_WEEK_NO","prevhistory",$scope.prevgetHistory,"prevHistoryChart");
                }
            });

            $scope.showHusband = function(){
                return $scope.clientinfo.CLT_MARITAL_STATUS=='M';
                //return $scope.husbandinfo.maritalstatus=='M'||$scope.husbandinfo.maritalstatus=='D'||$scope.husbandinfo.maritalstatus=='W';
            }

            $scope.showSelect = function(income){


                if(income.source=='HUSBAND' && !$scope.showHusband()){
                    return false;
                }

                return true;

            }

            $scope.rerender = function(time){

                var rum = $scope.houseIncomes;

                $scope.houseIncomes = [];
                setTimeout(function(){
                    $scope.$apply(function(){
                        $scope.houseIncomes = rum;
                    })
                },time);

            }
            $scope.houseIncomes = [];
            $scope.getTotalIncome = function(){
                var sum = 0;
                $.each($scope.houseIncomes,function(i,inc){
                    sum += parseInt(inc.fixed) + parseInt(inc.variable);
                });

                return sum;
            }

            $scope.loadIncomes = function(){

                myDB.execute("SELECT * FROM T_CODE WHERE CODE_TYPE_PK=20",function(res){
                    $.each(res,function(i,inc){

                        var incomeSouce = {
                            source:inc.CODE_NAME,
                            inctype:inc.CODE_DESC,
                            fixed:0,
                            variable:0,
                            details:0,
                            detaildesc:null
                        }

                        $scope.houseIncomes.push(incomeSouce);

                    });
                    $scope.$apply();
                });

            }

            $scope.loadIncomes();

    }
    $scope.viewloanproducts = function(idx,$event){

        $('.loan-box').removeClass('selected');

        var tis = $event.currentTarget;

        $(tis).find('.loan-box').addClass('selected');

        $scope.activeloan = [];

        $scope.activeloan = $scope.loans[idx];

        $scope.loadLoanPurpose();

        $('#activeloanMaturity'+$scope.activeloan.LTY_PK).selectmenu("refresh", true);
        $('#activeloanPurpose'+$scope.activeloan.LTY_PK).selectmenu("refresh", true);

        setTimeout(function(){
            $('#activeloanMaturity'+$scope.activeloan.LTY_PK).selectmenu("refresh", true);
            $('#activeloanPurpose'+$scope.activeloan.LTY_PK).selectmenu("refresh", true);
        },300);
        // $('html, body').animate({
        //     scrollTop: $("#productmappingdetails").offset().top - 90
        // }, 1000);
        // //printLog($scope.activeloan);
    }
    $scope.loadLoanPurpose = function(){
        myDB.execute("SELECT * FROM T_LOAN_PURPOSE WHERE LPU_LTY_PK",function(results){
            ////printLog(results);
            $scope.loanpurpose = [];
            if(results.length > 0){
                $.each(results, function(i,val){

                    var key = { value: val.LPU_PK, name: val.LPU_NAME, code: val.LPU_CODE, loan: val.LPU_LTY_PK };
                    $scope.loanpurpose.push(key);
                });
            }
        });
    }
    /******************************************
    // welfare
    ******************************************/
    $scope.checkWelfare = function(selection){
        if($scope.loaninfo) return selection===$scope.loaninfo.CLL_WELFARE_STATUS;
    };
    /******************************************
    // load transaction statuses from T_TXN_STATUS
    ******************************************/
    $scope.selectTransactions = {
        process : function(results){
            results.forEach(function(value,index){
                $scope.selectTransactions[value.TST_PK] || ($scope.selectTransactions[value.TST_PK] = {}); //init if nul
                $scope.selectTransactions[value.TST_PK] = value
            });
        },
        setTransactions : function(results){ //setClientInfo
            $scope.$apply(function() {$scope.selectTransactions.process(results);});
        },
        getTransactions : function(){
            var scope = this;
            myDB.execute("SELECT * FROM T_TXN_STATUS",function(results){
                scope.setTransactions(results);
            });
        }
    };
    $scope.selectTransactions.getTransactions();

    /******************************************
    // Variables and functions for loan history
    ******************************************/
    $scope.history = [];
    $scope.filteredHistory = [],
    $scope.currentPage = 1,
    $scope.numPerPage = 5,
    $scope.maxSize = 5;

    //previous history
    $scope.prevhistory = [];
    $scope.prevfilteredHistory = [],
    $scope.prevcurrentPage = 1,
    $scope.prevnumPerPage = 5,
    $scope.prevmaxSize = 5;

    $scope.numPages = function(){
        return Math.ceil($scope.history.length/$scope.numPerPage);
    }
    $scope.getPages = function(){
        return new Array($scope.numPages());
    }
    $scope.changePage = function(pg){
        $scope.currentPage = pg;
        $scope.getHistory();
    }
    $scope.getHistory = function(){
        var begin = (($scope.currentPage - 1) * $scope.numPerPage),
            end = begin + $scope.numPerPage;
        $scope.filteredHistory = $scope.history.slice(begin,end);
    };

    $scope.prevnumPages = function(){
        return Math.ceil($scope.prevhistory.length/$scope.prevnumPerPage);
    }
    $scope.prevgetPages = function(){
        return new Array($scope.prevnumPages());
    }
    $scope.prevchangePage = function(pg){
        $scope.prevcurrentPage = pg;
        $scope.prevgetHistory();
    }

    $scope.prevgetHistory = function(){
        var begin = (($scope.prevcurrentPage - 1) * $scope.prevnumPerPage)
        , end = begin + $scope.prevnumPerPage;
        $scope.prevfilteredHistory = $scope.prevhistory.slice(begin,end);
    };

    $scope.updateStatus = function(results){
        //this function calcs the YTD and puts on status page
        $scope.totalpaid = 0;
        var beforetoday = true;
        $.each(results, function(i,schpmt){ //scheduled payment
            if(schpmt.CRS_FLAG=='C'&&(schpmt.CRS_SMS_STATUS=='Y'||schpmt.CRS_SMS_GROUP_STATUS=='Y'||schpmt.CRS_RECP_STATUS=='Y'||schpmt.CRS_RECP_GROUP_STATUS=='Y')){
                $scope.totalpaid += schpmt.CRS_TOTALPAID; //payment is made, calculate YTD
            }

            if(schpmt.CRS_FLAG=='C'&&schpmt.CRS_DATE==$scope.date){
                $scope.capbalance = schpmt.CRS_BALANCE_CAPITAL;
                $scope.profbalance = schpmt.CRS_BALANCE_PROFIT;
                beforetoday = false;
            }

            //find the last missed payment
            if(beforetoday&&schpmt.CRS_TOTALPAID==0&&schpmt.CRS_DATE!=$scope.date){
                $scope.latestpayment = schpmt;
            }
        });
    }

    /******************************************
    // T_CODE to show proper values in UI
    ******************************************/
    $scope.CODE = {};
    myDB.execute("SELECT CODE_TYPE_PK,CODE_VALUE,CODE_NAME FROM T_CODE WHERE CODE_IS_ACTIVE='Y'",function(results){
        results.forEach(function(value,index){
            $scope.CODE[value.CODE_TYPE_PK] || ($scope.CODE[value.CODE_TYPE_PK] = {}); //init if null
            $scope.CODE[value.CODE_TYPE_PK][value.CODE_VALUE] || ($scope.CODE[value.CODE_TYPE_PK][value.CODE_VALUE] = {});
            $scope.CODE[value.CODE_TYPE_PK][value.CODE_VALUE] = value;
        });
        $scope.$apply(function(){
            $scope.CODE;
        });
    });


    /******************************************
    // T_HOUSE_INDEX
    ******************************************/
    myDB.execute("SELECT * FROM T_HOUSE_INDEX",function(results){
        $scope.houseindices = {};
        $.each(results,function(ind,rec){
            ($scope.houseindices[rec.HSE_TYPE_PK]||($scope.houseindices[rec.HSE_TYPE_PK]={}));
            $scope.houseindices[rec.HSE_TYPE_PK][rec.HSE_VALUE]=(rec);//.push
        });
    });


    $scope.openSign = function(client){
        swal('hi');
    }
    
    $scope.prepPrintin();
    $scope.loadVillages(); 
    $scope.getMaxPrdTxn();
    $scope.loadClient();
    $scope.getAllProducts();
});

function findIndexInData(data, property, value) {
    var result = -1;
    data.some(function (item, i) {
        if (item[property] === value) {
            result = i;
            return true;
        }
    });
    return result;
}
/******************************************
// Load client's photograph
******************************************/
function loadNCADphoto(){

    $(".ncadPhoto").each(function(){
        $(this).width(250).height($(this).width()*1.25);
    });

    var loadcount = 0;
    var loadPicture = setInterval(function(){
        //printLog("Searching");
        loadcount++;
        if(!devtest&&window.requestFileSystem){ //clientid
            clearInterval(loadPicture);
                fileManager = new fm();
                    try{
                    var promise = fileManager.read("photo"+clientid+".dataurl");
                    promise.done(function(result){
                        $("#ncadPhoto").attr("src",result);
                    });
                    }catch(e){alert(e.message);};
        }
        if(loadcount>=5){
            clearInterval(loadPicture);
            //printLog("Giving up");
        }
    }, 1000);
}
$(document).ready(function(){
    $(this).on('click','.closepop i', function(){
        $('.coverwrap ').html('');
        $('.whitecover').fadeOut();
    });


    $(document).on('click','.mini-header', function(){

        var clicked = $(this);
        $('.mini-header').removeClass('selected');
        $('.mini-header .btm-bar').remove();
        clicked.addClass('selected');
        clicked.append('<div class="btm-bar"></div>');
        $('.mini-client-details').hide();
        $(clicked.attr('href')).fadeIn();

    });










}); 
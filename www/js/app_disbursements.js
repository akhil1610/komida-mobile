/******************************************
 Global variables
******************************************/
function init(){
    initTemplate.load(1);
    $("select").each(function(){
        $(this).closest('.ui-btn').css('background-color','#80C6C7');
        $(this).closest('.ui-btn').css('color','#fff');
        $(this).closest('.ui-btn').css('text-shadow','0 0 0 #fff');
    });
    $(".back").each(function(){
        $(this).prepend('<a href="#page" style="margin-left:1em;" class="left ui-btn ui-btn-g ui-corner-all ui-icon-carat-l ui-btn-icon-left ui-btn-inline" data-i18n="buttons.Back">Back</a>');
    });
};
var canPrint = true;
/******************************************
 Global variables
******************************************/
var USER_PK             = sessionStorage.getItem("USER_PK");
var USER_NAME           = sessionStorage.getItem("USER_NAME");
var USER_HAVE_SIG       = sessionStorage.getItem("USER_HAVE_SIG");
var USER_SIG            = (sessionStorage.getItem("USER_SIG") === null ? '' : sessionStorage.getItem("USER_SIG"));
var USER_SIGNED         = (sessionStorage.getItem("USER_HAVE_SIG") == 'Y' ? true : false );
var BRC_PK              = sessionStorage.getItem("BRC_PK");
var BRC_NAME            = sessionStorage.getItem("BRC_NAME");
var BRC_PHONE           = sessionStorage.getItem("BRC_PHONE");
var CMP_NAME            = sessionStorage.getItem("CMP_NAME");

var CMP_SMS_FORMAT      = sessionStorage.getItem("CMP_SMS_FORMAT");
var CMP_RECEIPT_FORMAT  = sessionStorage.getItem("CMP_RECEIPT_FORMAT");
var CMP_SMS_LABEL       = sessionStorage.getItem("CMP_SMS_LABEL");
var CMP_RECEIPT_LABEL   = sessionStorage.getItem("CMP_RECEIPT_LABEL");
var SMS_OR_RECEIPT      = sessionStorage.getItem("SMS_OR_RECEIPT");

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

var msg_separator       = '@@@@prodigy@@@@';

var SMS_RCP_CODE        = ['DT','FONM','FOID','BR','BRID','CLNM','CLID','INSTNO','AMT'];

/******************************************
 Controller
******************************************/
//var myApp = angular.module('myApp',['ng-currency']);
var myApp = angular.module('myApp',['ng-currency', 'pascalprecht.translate','ngAnimate']);

myApp.config(function ($translateProvider) {

     $translateProvider.useStaticFilesLoader({
        prefix: "locales/locale-",
        suffix: ".json"
    });

    $translateProvider.preferredLanguage(ln.language.code);

});

myApp.filter('disburseClient', function() {
     return function(items) {
        if(items === undefined) return false;

        var filtered = [];

        $.each(items,function(idx,client){
            if(client.loans !== undefined && client.loans.length > 0){
                var isDisburse = false;
                $.each(client.loans,function(l,loan){
                    if(loan.CLL_STATUS == 12 || loan.CLL_STATUS == 13) {
                        isDisburse = true;
                    }
                });
                if(isDisburse) filtered.push(client);
            }
        });
        return filtered;
    };
});

myApp.filter('disbursementOnly', function() {
     return function(items) {
        if(items === undefined) return false;

        var date = new Date();
        date = ("0"+date.getDate()).slice(-2)+"/"+("0"+(date.getMonth()+1)).slice(-2)+"/"+date.getFullYear();


        var filtered = [];
        $.each(items,function(g,group){
            var isDisburse = false;
            $.each(group.members,function(idx,client){
                if(client.loans !== undefined && client.loans.length > 0){
                    $.each(client.loans,function(l,loan){

                        if((loan.CLL_STATUS == 12 || loan.CLL_STATUS == 13) && loan.CLL_DISBURSEMENT_DATE == date) {
                            isDisburse = true;
                        }

                    });
                }
            });
            if(isDisburse) filtered.push(group);
        });

        return filtered;
    };
});

myApp.controller('DisbursementCtrl', function($scope, $filter, $rootScope){

    setTimeout(function(){
        $scope.nametext = i18n.t("messages.Name");
        $scope.loanamttext = i18n.t("messages.LoanAmt");
        $scope.maturitytext = i18n.t("messages.Maturity");
        $scope.graceperiodtext = i18n.t("messages.GracePeriod");
        $scope.weeklyrepaymenttext = i18n.t("messages.WeeklyRepayment");
        $scope.nodisbursementtext = i18n.t("messages.NoDisbursement");
        $scope.weektext = i18n.t("messages.Week");
        $scope.onetimesavingstext = i18n.t("messages.OneTimeSavings");
        $scope.percofloantext = i18n.t("messages.PercOfLoan");
        $scope.amounttext = i18n.t("messages.Amount");
        $scope.ttlamtcollectedtext = i18n.t("messages.TotalAmtCollected");
        $scope.expectedtext =  i18n.t("messages.Expected"); 
        $scope.grouptext = i18n.t("messages.Group"); 
        $scope.groupleadertext = i18n.t("messages.GroupLeader");
        $scope.$apply();
    },500)

    var t = $scope;

    //reset groups
    $scope.groups = {};
    $scope.crfgroups = {};
    $scope.clearVariables = function(){
        $scope.groups = {};
        $scope.crfgroups = {};
    };
    $scope.clearVariables();

    $scope.sf = {
        CLT_VILLAGE: null,
    };

    $scope.Printing = {
        sms: [],
        rcp: []
    };

    $scope.maxcrs = 0;
    $scope.maxcpt = 0;
    $scope.maxcpm = 0;
    $scope.maxfdl = 0;

    $scope.showSign = false;

    $scope.currloc = ''; //currency symbol

    $scope.date  = getSlashDate.DMY();

    $scope.reschedules = [];

    //TEXTS  
    $scope.MGR = {
        mgrpk: MGR_PK,
        mgrname: MGR_NAME,
        mgrhavesig: MGR_HAVE_SIG,
        hasSigned: MGR_SIGNED,
        Signature: MGR_SIG
    };

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
        currentVillage: null,
        Signature: '',
        hasSigned: false
    };

    $scope.disbursementpolicy = "Dengan ini saya menyatakan bahwa saya bersedia mematuhi peraturan yang berlaku di KOMIDA. Apabila kewajiban saya untuk membayar pembiayaan dan margin tidak dipenuhi, maka saya siap menerima keputusan/kebijakan yang berlaku di KOMIDA. Apabila dikemudian hari terbukti pembiayaan ini digunakan oleh orang lain, maka saya sepenuhnya bertanggungjawab atas pembiayaan tersebut.Saya mengerti dan memberikan wewenang kepada KOMIDA untuk membagikan informasi pribadi dan keuangan kepada kredit biro, atau lembaga pemerintah lainnya sesuai dengan hukum yang berlaku, misalnya bank, layanan dari pihak ketiga, termasuk perusahaan IT, telekomunikasi, konsultan, lembaga donor, mahasiswa, lembaga penelitian dan survey yang bisa memberikan rekomendasi untuk pelayanan bisa lebih baik. Saya paham bahwa KOMIDA akan menjaga kerahasiaan data saya, seperti yang disampaikan didalam SOP Kerahasiaan Data Anggota.";
    
    $scope.memberCount = function(group){

        var count = 0;

        if(group.members !== undefined){
            count = Object.keys(group.members).length;
        }
        return count;
    };


    $scope.prepPrintin = function(){

        var rcp_array = CMP_RECEIPT_LABEL.split(",");
        CMP_RECEIPT_FORMAT = CMP_RECEIPT_FORMAT.replace(/ /g,'');

        var print_format = CMP_RECEIPT_FORMAT.split(",");

        var sms_array = CMP_SMS_LABEL.split(",");
        CMP_SMS_FORMAT = CMP_SMS_FORMAT.replace(/ /g,'');
        var sms_format = CMP_SMS_FORMAT.split(",");


        for(var p in print_format){

            var pos = jQuery.inArray(print_format[p], SMS_RCP_CODE );

            var arr_rcp = [];
            arr_rcp.pid = print_format[p];
            arr_rcp.pname = rcp_array[pos];
            $scope.Printing.rcp.push(arr_rcp);

        }
        for(var s in sms_format){
            var pos = jQuery.inArray(sms_format[s], SMS_RCP_CODE );

            var arr_sms = [];
            arr_sms.pid = sms_format[s];
            arr_sms.pname = sms_array[pos];
            $scope.Printing.sms.push(arr_sms);
        }
        //console.log($scope.Printing);
    };

    $scope.filterdisbursementOnly = function(group) {
        console.log(group)
        console.log('disbursementOnly');
        var date = new Date();
        date = ("0"+date.getDate()).slice(-2)+"/"+("0"+(date.getMonth()+1)).slice(-2)+"/"+date.getFullYear();
        var isDisburse = false;
        $.each(group.members,function(idx,client){
            console.log(client);
            console.log((client.loans.length));
            if(client.loans !== undefined){
                console.log(client.loans);
                $.each(client.loans,function(l,loan){
                    console.log(loan);
                    console.log(date);
                    console.log(loan.CLL_STATUS);
                    console.log(loan.CLL_DISBURSEMENT_DATE)
                    if((loan.CLL_STATUS == 12 || loan.CLL_STATUS == 13) && loan.CLL_DISBURSEMENT_DATE == date) {
                        isDisburse = true;
                        console.log('disburse');
                    } else {
                        console.log('no disburse')
                    }

                });
            }
        });
        return isDisburse;
   }

    $scope.prepPrintin();

    //get branch related values
    $scope.crf = sessionStorage.getItem('CLL_CRF_PERCENTAGE');
    $scope.BRC_DISBURSE_NOTIFICATION = sessionStorage.getItem("SMS_OR_RECEIPT");

/******************************************
 Display clients on page after query has been executed
******************************************/
    // $scope.getResults = function(results){
    //     //console.log($scope.groups);
    //     $.each(results, function(id, val){ //each 'val' is a repayment schedule record
    //         var groupID  = val.CLT_GROUP_ID; //get group id

    //         var appGroup = $scope.groups; //depending if this is a CRF record, we will make save it into groups or crfgroups.
    //         if(val.CRS_FLAG=='R') appGroup=$scope.crfgroups;

    //         if(!appGroup[groupID]){ //if group does not exist
    //             appGroup[groupID] || ((appGroup[groupID] = {}) && (appGroup[groupID].members={})); //create group if does not exist
    //             appGroup[groupID].GRP_FLAG = val.CRS_FLAG; //set group crf
    //             appGroup[groupID].CRS_FLAG = val.CRS_FLAG; //!Note: why do we have 2 flags for the same thing?
    //             appGroup[groupID].SMS_SENT = 'N'; //set group variables
    //             appGroup[groupID].RECEIPT_SENT = 'N'; //SMS, RECEIPT and GROUP_ID (for easy reference)
    //             appGroup[groupID].GROUP_ID = groupID;
    //         }

    //         //create user if does not exists
    //         appGroup[groupID].members[val['CLT_PK']+"-"+val['CLL_PK']] || (appGroup[groupID].members[val['CLT_PK']+"-"+val['CLL_PK']] = {});
    //         var client = appGroup[groupID].members[val['CLT_PK']+"-"+val['CLL_PK']];
    //         for(key in val){
    //             client[key] = val[key]; //begin copying the values from val to client
    //         }

    //         //if this client's SMS or RECEP is Y, then the group's SMS and RECP status should be the same
    //         if(client.CRS_SMS_GROUP_STATUS == 'Y')  appGroup[groupID].SMS_SENT = "Y";
    //         if(client.CRS_RECP_GROUP_STATUS == 'Y') appGroup[groupID].RECEIPT_SENT = "Y";

    //         //for client, if no sms sent, we help set default TOTALPAID value as DISBURSEMNT AMT
    //         if(!(client.CRS_SMS_STATUS == 'Y' || client.CRS_SMS_GROUP_STATUS == 'Y' ||client.CRS_RECP_STATUS == 'Y' || client.CRS_RECP_GROUP_STATUS == 'Y'))
    //             client.CRS_ACT_CAPITAL_AMT = client.CRS_EXP_CAPITAL_AMT;
    //         if(client.CRS_SMS_GROUP_STATUS=='null')  client.CRS_SMS_GROUP_STATUS = 'N';
    //         if(client.CRS_RECP_GROUP_STATUS=='null') client.CRS_RECP_GROUP_STATUS = 'N';
    //         if(client.CRS_SMS_STATUS=='null') client.CRS_SMS_STATUS = 'N';
    //         if(client.CRS_RECP_STATUS=='null') client.CRS_RECP_STATUS = 'N';

    //         $scope.$apply(function(){appGroup;}); //force UI to update
    //     });
    // };


/******************************************
 Run Query when user selectes village
******************************************/
    //User selected a village. Auto load records to display for that village.
    $scope.$watch("sf.CLT_VILLAGE", function(){
        $scope.clearVariables(); //reset
        if($scope.sf.CLT_VILLAGE==null||$scope.sf.CLT_VILLAGE=="") return false; //user selected no village

        var date = new Date();
        date = ("0"+date.getDate()).slice(-2)+"/"+("0"+(date.getMonth()+1)).slice(-2)+"/"+date.getFullYear();

        var cmd = "SELECT * FROM (SELECT CLT_PK,CLT_STATUS,CLT_VILLAGE,CLT_FULL_NAME,CLT_MOB_NO_1,CLT_CLEINT_ID,CLT_GROUP_ID,CLL_PK,CLL_STATUS,CLL_CLT_PK,CLT_IS_GROUP_LEADER,CLT_GROUP_ID,0 as CLL_CRF_PERCENTAGE,CLL_ACTUAL_LOAN,CRS_FLAG,CRS_SMS_GROUP_STATUS,CRS_RECP_GROUP_STATUS,CRS_SMS_STATUS,CRS_SMS_GROUP_STATUS,CRS_RECP_GROUP_STATUS,CRS_RECP_STATUS,CRS_ACT_CAPITAL_AMT,CRS_EXP_CAPITAL_AMT,CRS_DATE,CRS_CLT_PK,CRS_CLL_PK,CRS_ASSISTED,CRS_ATTENDED,CRS_PENALTY,CRS_REASON,CRS_CREATED_DATE,CRS_PK FROM T_CLIENT, T_CLIENT_LOAN, T_CLIENT_REPAY_SCHEDULE WHERE (CLT_STATUS in(7,21,26,27,40) AND CLL_STATUS in (12,36)) AND CLT_PK=CLL_CLT_PK AND CRS_FLAG in ('D','R') AND CLT_PK=CLL_CLT_PK AND CRS_LOAN_SAVING_FLAG = 'L' AND CRS_DATE='"+date+"' AND CLT_PK=CRS_CLT_PK AND CLL_PK=CRS_CLL_PK AND CLT_PK=CLL_CLT_PK AND CLT_PK=CRS_CLT_PK AND CLL_PK=CRS_CLL_PK AND CLT_VILLAGE="+$scope.sf.CLT_VILLAGE.value+") as DATA     ";

        cmd = "SELECT CLT_PK,CLT_STATUS,CLT_VILLAGE,CLT_SIGNATURE,CLT_FULL_NAME,CLT_MOB_NO_1,CLT_CLEINT_ID,CLT_GROUP_ID,CLT_CENTER_ID,CLT_IS_GROUP_LEADER,CLT_GROUP_ID, LTY_DESCRIPTION, CTR_CENTER_NAME, CTR_CENTER_ID FROM T_CLIENT LEFT JOIN T_CENTER_MASTER ON (CLT_CENTER_ID = CTR_PK) LEFT JOIN T_CLIENT_LOAN ON (CLL_CLT_PK = CLT_PK) LEFT JOIN T_LOAN_TYPE ON (CLL_LTY_PK = LTY_PK) WHERE  CLT_VILLAGE="+$scope.sf.CLT_VILLAGE.value+"  AND CLL_STATUS IN (12,13,36)   ";
        myDB.execute(cmd,function(results){

            var cnt = 0;
            var cltInGrp = "";
            var groupUniq = "";
            var appGroup = $scope.groups;
            console.log("294");
            console.log(appGroup);
            $.each(results,function(i,val){

                var groupID = val.CLT_GROUP_ID;
                groupUniq = val.CLT_GROUP_ID + "-" + parseInt(val.CLT_CENTER_ID);

                val.hasSigned = false;

                //depending if this is a CRF record, we will make save it into groups or crfgroups.
                if(!appGroup[groupUniq]){ //if group does not exist
                    appGroup[groupUniq] || ((appGroup[groupUniq] = {}) && (appGroup[groupUniq].members={}));
                    appGroup[groupUniq].GROUP_ID = val.CLT_GROUP_ID;
                    appGroup[groupUniq].CLT_CENTER_ID = parseInt(val.CLT_CENTER_ID);
                    appGroup[groupUniq].CTR_CENTER_NAME = val.CTR_CENTER_NAME;
                }

                appGroup[groupUniq].members[val['CLT_PK']] || (appGroup[groupUniq].members[val['CLT_PK']] = {});
                var client = appGroup[groupUniq].members[val['CLT_PK']];

                for(key in val){
                    client[key] = val[key]; //begin copying the values from val to client
                }

                client.loans = [];
                var isFinal = false;
                var cnt = parseInt(i) + 1;
                if(results.length == cnt){
                    isFinal = true;
                }
                $scope.getLoans(client,isFinal);

            });
            appGroup[groupUniq].witness = [];
        });
    });

    $scope.getMaxPks = function(){
        myDB.execute("SELECT MAX(CRS_PK) as MAXCRS FROM T_CLIENT_REPAY_SCHEDULE",function(res){ 
            $scope.maxcrs = parseInt(res[0].MAXCRS == null ? 0 : res[0].MAXCRS) + 1;
        });
        myDB.execute("SELECT MAX(CPT_PK) as MAXCPT FROM T_CLIENT_PRD_TXN",function(res){
            $scope.maxcpt = parseInt(res[0].MAXCPT == null ? 0 : res[0].MAXCPT) + 1;
        });
        myDB.execute("SELECT MAX(CPM_PK) as MAXCPM FROM T_CLIENT_PRODUCT_MAPPING", function(res){
            $scope.maxcpm = parseInt(res[0].MAXCPM == null ? 0 : res[0].MAXCPM) + 1;
        });
        myDB.execute("SELECT MAX(FDL_PK) as MAXFDL FROM T_FAIL_DISBURSE_LOAN", function(res){
            $scope.maxfdl = parseInt(res[0].MAXFDL == null ? 0 : res[0].MAXFDL) + 1;
        });
    }

    $scope.getMaxPks();

    $scope.getLoans = function(client,isFinal){

        var groupID = client.CLT_GROUP_ID;
        var groupUniq = client.CLT_GROUP_ID + "-" + parseInt(client.CLT_CENTER_ID);
        var cmd = "SELECT CLL_PK,CLL_STATUS,CLL_CLT_PK, 0 as CLL_CRF_PERCENTAGE,CLL_REPAY_PER_WEEK,CLL_LTY_PK,CLL_ACTUAL_LOAN,CLL_LOAN_INTEREST,CLL_LOAN_WEEKS,CLL_TOTAL_LOAN_WEEKS,CLL_DISBURSEMENT_DATE,CLL_GRACE_PERIOD_WEEKS,CRS_FLAG,CRS_SMS_GROUP_STATUS,CRS_RECP_GROUP_STATUS,CRS_SMS_STATUS,CRS_SMS_GROUP_STATUS,CRS_RECP_GROUP_STATUS,CRS_RECP_STATUS,CRS_ACT_CAPITAL_AMT,CRS_EXP_CAPITAL_AMT,CRS_DATE,CRS_CLT_PK,CRS_CLL_PK,CRS_ASSISTED,CRS_ATTENDED,CRS_PENALTY,CRS_REASON,CRS_CREATED_DATE,CRS_PK,LTY_DESCRIPTION,LTY_TERM_OF_LOAN, LTY_DEFAULT_LOAN_INTEREST,LTY_GRACE_PERIOD_WEEK FROM T_CLIENT_LOAN,T_LOAN_TYPE, T_CLIENT_REPAY_SCHEDULE WHERE CLL_LTY_PK = LTY_PK AND CLL_PK = CRS_CLL_PK AND CRS_LOAN_SAVING_FLAG='L' AND CRS_FLAG='D' AND CLL_CLT_PK = CRS_CLT_PK AND CLL_CLT_PK = "+client.CLT_PK+"  AND CRS_DATE='"+$scope.date+"'";
        myDB.execute(cmd,function(results){

            console.log(results);
            var appGroup = $scope.groups;
 
            $.each(results,function(i,val){

                //console.log("337 "+val.LTY_DESCRIPTION);
                //console.log(val);
                var loan = [];

                for(key in val){
                    loan[key] = val[key];
                }

                appGroup[groupUniq].SMS_SENT = "N";
                appGroup[groupUniq].RECEIPT_SENT = "N";

                if(loan.CRS_SMS_GROUP_STATUS == 'Y')  appGroup[groupUniq].SMS_SENT = "Y";
                if(loan.CRS_RECP_GROUP_STATUS == 'Y') appGroup[groupUniq].RECEIPT_SENT = "Y";

                if(!(loan.CRS_SMS_STATUS == 'Y' || loan.CRS_SMS_GROUP_STATUS == 'Y' ||loan.CRS_RECP_STATUS == 'Y' || loan.CRS_RECP_GROUP_STATUS == 'Y'))
                    loan.CRS_ACT_CAPITAL_AMT = loan.CRS_EXP_CAPITAL_AMT;
                if(loan.CRS_SMS_GROUP_STATUS=='null')  loan.CRS_SMS_GROUP_STATUS = 'N';
                if(loan.CRS_RECP_GROUP_STATUS=='null') loan.CRS_RECP_GROUP_STATUS = 'N';
                if(loan.CRS_SMS_STATUS=='null') loan.CRS_SMS_STATUS = 'N';
                if(loan.CRS_RECP_STATUS=='null') loan.CRS_RECP_STATUS = 'N';

                if(loan.CRS_SMS_GROUP_STATUS == 'Y') appGroup[groupUniq].members[client['CLT_PK']].SMS_SENT = 'Y';
                else appGroup[groupUniq].members[client['CLT_PK']].SMS_SENT = 'N';

                if(loan.CRS_RECP_GROUP_STATUS == 'Y') appGroup[groupUniq].members[client['CLT_PK']].RECEIPT_SENT = 'Y';
                else appGroup[groupUniq].members[client['CLT_PK']].RECEIPT_SENT = 'N';

                loan.haveLoan = true;
                loan.faildisburse = false;
                if(loan.CLL_LTY_PK == 99){
                    loan.haveLoan = false;
                    loan.faildisburse = true;
                    loan.CRS_ATTENDED = 'N';
                }

                var loanmat = [];
                if(loan.LTY_TERM_OF_LOAN.indexOf(",") !== -1){
                    var loanarr = loan.LTY_TERM_OF_LOAN.split(",");
                    $.each(loanarr,function(i,val){
                        var key = { value : val, name: val + " Weeks" };
                        loanmat.push(key);
                        // if(key.value == loan.CLL_TOTAL_LOAN_WEEKS){
                        //     loan.CLL_TOTAL_LOAN_WEEKS = key;
                        // }
                    });
                } else {
                    var key = {
                        value : loan.LTY_TERM_OF_LOAN,
                        name: loan.LTY_TERM_OF_LOAN + " Weeks"
                    };
                    loanmat.push(key);
                }

                loan.matopts = loanmat;

                var gracearray = [];
                if(loan.LTY_GRACE_PERIOD_WEEK != null){
                    if(loan.LTY_GRACE_PERIOD_WEEK.indexOf(",") != -1){
                        var grace = loan.LTY_GRACE_PERIOD_WEEK.split(",");
                        if(grace.length > 0){
                            $.each(grace,function(g,gracea){
                                var key = {
                                    value : gracea,
                                    name: gracea+" WEEKS"
                                }
                                gracearray.push(key);
                                if(key.value == loan.CLL_GRACE_PERIOD_WEEKS){
                                    loan.CLL_GRACE_PERIOD_WEEKS = key;
                                }
                            })
                        }
                    } else {
                        var key = {
                            value : loan.LTY_GRACE_PERIOD_WEEK,
                            name: loan.LTY_GRACE_PERIOD_WEEK+" WEEKS"
                        }
                        gracearray.push(key);
                        if(key.value == loan.CLL_GRACE_PERIOD_WEEKS){
                            loan.CLL_GRACE_PERIOD_WEEKS = key;
                        }
                    }
                    if(loan.CLL_GRACE_PERIOD_WEEKS == null | loan.CLL_GRACE_PERIOD_WEEKS == ''){
                        loan.CLL_GRACE_PERIOD_WEEKS = gracearray[0];
                    }
                    loan.graceopts = gracearray;
                }

                //appGroup[groupID].members[client['CLT_PK']].loans.push(loan);
                console.log(loan);
                loan.products = [];
                $scope.getProducts(client,loan);

             });
            if(isFinal){
                $scope.$apply(function(){

                });

            }
        });

    }

    $scope.items = [
        25,50
    ];

    $scope.refresh = function(cllpk){

        setTimeout(function(){
            $scope.$apply();
            $('#loanmat'+cllpk).selectmenu("refresh");
            $('#loanmat'+cllpk).selectmenu("refresh");
            $('#loangrace'+cllpk).selectmenu("refresh");
            $('#loangrace'+cllpk).selectmenu("refresh");
        },100);
        $('.loanmat').each(function(i, element) {
            var selected = $(this).find('option:selected').text();
            $(this).parent().find('span').html(selected);
        });
        $('.loangrace').each(function(i, element) {
            var selected = $(this).find('option:selected').text();
            $(this).parent().find('span').html(selected);
        });
    }

    $scope.getProducts = async function(client,loan){

        var groupID = client.CLT_GROUP_ID;
        var groupUniq = client.CLT_GROUP_ID + "-" + parseInt(client.CLT_CENTER_ID);
        var date = new Date();
        date = ("0"+date.getDate()).slice(-2)+"/"+("0"+(date.getMonth()+1)).slice(-2)+"/"+date.getFullYear();

        var cmd =   " SELECT * FROM T_CLIENT_PRODUCT_MAPPING,T_PRODUCT_MASTER"+
                    " LEFT JOIN T_CLIENT_REPAY_SCHEDULE as CRS ON (CRS_PRM_LTY_PK= PRM_PK AND CRS_CLL_PK ="+loan.CLL_PK+" AND CRS_LOAN_SAVING_FLAG='S' AND CRS_FLAG='C' AND CRS_DATE='"+date+"' ) "+
                    " LEFT JOIN T_CLIENT_PRD_TXN as CPT ON (CPT_PRM_PK = PRM_PK AND CPT_CPM_PK = CPM_PK) "+
                    " LEFT JOIN T_LOAN_SAVING_PRD_MAPPING as LSM ON (LSM.LSM_PRM_PK = PRM_PK AND LSM.LSM_LTY_PK="+loan.CLL_LTY_PK+" )"+
                    " WHERE CPM_PRM_PK = PRM_PK AND CPM_CLT_PK="+client.CLT_PK+
                    " AND ( PRM_CODE IN ('002.0001','22400000') OR ( PRM_CODE IN ('002.0004') AND LSM_PRM_IS_MANDATORY='Y' )) GROUP BY CPM_PK ";
        myDB.execute(cmd,function(res){
            //console.log(client.CLT_PK);
            console.log("deebu");
            console.log(res);
            $.each(res,function(i,prd){

                // prd.isCompulsary = false;
                // prd.DefisCompulsary = false;
                
                var createdPrd = $scope.createProducts(loan, prd);

                console.log(createdPrd);
                loan.products.push(createdPrd);
            });

            if($scope.isMissingPension(loan)){
                $scope.createPsuedoPension(loan)
                    .then( function(pen) {
                        loan.products.push(pen);
                        $scope.pushNewLoan(groupUniq, client.CLT_PK, loan);
                    })
            } else {
                $scope.pushNewLoan(groupUniq, client.CLT_PK, loan);
            }

            
        });
        setTimeout(() => {
            $scope.$apply();
        }, 300); 
    }

    $scope.pushNewLoan = function(groupUniq, CLT_PK, loan){
        $scope.groups[groupUniq].members[CLT_PK].loans.push(loan);
        $scope.$apply();
    }

    $scope.createProducts = function(loan,prd){
        prd.isCompulsary = true;
        prd.DefisCompulsary = true;
        prd.amtToPay = 0;
        prd.intPercentage = 0;
        prd.DefintPercentage = 0;
        prd.existsingPrd = true;
        
        if(prd.CRS_FLAG == 'C' || prd.CPT_FLAG == 'C'){
            // prd.isCompulsary = true;
            // prd.DefisCompulsary = true;
            if(prd.PRM_DEPOSIT_FREQUENCY == "R"){
                prd.amtToPay = prd.CPT_TXN_AMOUNT;
            } else {
                prd.amtToPay = prd.CRS_ACT_CAPITAL_AMT;
                if(prd.CRS_ACT_CAPITAL_AMT == null){
                    prd.intPercentage = prd.LSM_PRM_OPEN_BAL.replace('%','');
                    prd.DefintPercentage = prd.LSM_PRM_OPEN_BAL.replace('%','');
                }
            }

            if(prd.amtToPay > 0){
                prd.intPercentage = parseFloat(prd.amtToPay) / parseFloat(loan.CRS_ACT_CAPITAL_AMT) * 100;
                prd.DefintPercentage = parseFloat(prd.amtToPay) / parseFloat(loan.CRS_ACT_CAPITAL_AMT) * 100;
            }
        }

        var perc = prd.LSM_PRM_OPEN_BAL;
        if(perc != null || perc != 0){
            prd.DefintPercentage = prd.intPercentage = perc.replace('%','');
            prd.CRS_EXP_CAPITAL_AMT = parseFloat(loan.CLL_ACTUAL_LOAN) / 100  * parseFloat(prd.intPercentage);
        } else {
            prd.CRS_EXP_CAPITAL_AMT = 0;
        }

        return prd;
    }

    $scope.isMissingPension = function(loan){
        var missing = true;
        for (let p = 0; p < loan.products.length; p++) {
            const prd = loan.products[p];
            if(prd.PRM_CODE == '002.0004'){
                missing = false;
            }
        }
        return missing;
    }

    $scope.createPsuedoPension = function(loan){
        var p = new Promise(function(suc, rej) {
            var cmd = "SELECT * FROM T_PRODUCT_MASTER LEFT JOIN T_LOAN_SAVING_PRD_MAPPING ON (LSM_PRM_PK = PRM_PK) WHERE PRM_CODE ='002.0004'";
            myDB.execute(cmd,function(res){
                var prd  = res[0];
                prd.isCompulsary = true;
                prd.DefisCompulsary = true;
                prd.amtToPay = 0;
                prd.intPercentage = 0;
                prd.DefintPercentage = 0;
                prd.existsingPrd = false;
                
                prd.intPercentage = prd.LSM_PRM_OPEN_BAL.replace('%','');
                prd.DefintPercentage = prd.LSM_PRM_OPEN_BAL.replace('%',''); 

                var perc = prd.LSM_PRM_OPEN_BAL;
                if(perc != null || perc != 0){
                    prd.DefintPercentage = prd.intPercentage = perc.replace('%','');
                    prd.CRS_EXP_CAPITAL_AMT = parseFloat(loan.CLL_ACTUAL_LOAN) / 100  * parseFloat(prd.intPercentage);
                } else {
                    prd.CRS_EXP_CAPITAL_AMT = 0;
                }
                suc(prd);
            });
        }); 
        return p;
    }

    $scope.togglePrdCompulsary = function(prd){
        if(prd.isCompulsary){
            prd.isCompulsary = false;
            prd.amtToPay = 0;
            //prd.intPercentage = 0;
        } else {
            prd.isCompulsary = true;
            prd.intPercentage = prd.DefintPercentage;
            //if(prd.intPercentage == 0) prd.intPercentage = 1;
        }
    }

    $scope.validateIntAmt = function(loan,product){


    }

    $scope.AmtToPayForProduct = function(loan,product){

        var perc = product.intPercentage;
        var loanamt = loan.CRS_ACT_CAPITAL_AMT;
        var amttopay = parseFloat(loanamt) / 100 * perc;
        product.amtToPay = amttopay;

        return  product.amtToPay;
    }

    $scope.totalAmtToPay = function(loan){

        var sum = 0;
        $.each(loan.products,function(i,prd){
            if(prd.amtToPay != null && prd.isCompulsary){
                sum =  parseFloat(sum) + parseInt(prd.amtToPay);
            } 
        }) 
        return sum;
    }

/******************************************
 if any records exist in Disb or CRF
******************************************/
    //if 'compare' is 'D', return true if there are any groups with disbursement today. Otherwise, check if there are any groups with CRF.
    $scope.checkDisbursements = function(compare){
        if(compare=="D") for(k in $scope.groups) return true;
        else for(k in $scope.crfgroups) return true;
        return false;
    };

/******************************************
 Functions to find group totals
******************************************/

    $scope.grpGetTotalApplied = function(group){
        var sum=0;
        for(m in group.members){
            for(l in group.members[m].loans){
                sum += parseFloat(group.members[m].loans[l].CRS_EXP_CAPITAL_AMT);
            }
        }
        group.totalAmtApplied = sum;
        return sum;
    }

    //this is the amount clients want to loan (get disbursement from FO) instead
    $scope.grpGetTotalLoan = function(group){
        var sum=0;
        for(member in group.members){
            for(k in group.members[member].loans){
                sum += parseFloat(group.members[member].loans[k].CRS_ACT_CAPITAL_AMT);
            }
        }
        group.totalAmtLoan = sum;
        return sum;
    }

    //this is the amount clients actually get
    $scope.grpGetActualTotalLoan = function(group){
        var sum = 0;
        for(m in group.members){
            var client = group.members[m];
            for(l in group.members[m].loans){
                var loan = group.members[m].loans[l];
                var amt = loan.CRS_ACT_CAPITAL_AMT;
                if(loan['CRS_FLAG']=='D'){
                    amt=amt*(100-parseFloat(loan.CLL_CRF_PERCENTAGE))/100; //multiply by CRF
                }else if(loan['CRS_FLAG']=='R'){
                    //do nothing
                }
                if( loan.CRS_RECP_STATUS != '') {
                    sum += amt;
                } 
            }
        }
        group.totalActualAmtLoan = sum;
        return sum;
    }

/******************************************
 Functions to calculate client's actual loan amount
******************************************/
    //this is the actual amount disbursed after CRF (for client)
    $scope.calcAct = function(client){
        var amt = client.CRS_ACT_CAPITAL_AMT;
        if(client['CRS_FLAG']=='D'){
            amt=amt*(100-parseFloat(client.CLL_CRF_PERCENTAGE) )/100;
        }else if(client['CRS_FLAG']=='R'){
            //do nothing
        }
        return amt;
    }
    //this is the actual CRF amount
    $scope.crfAmt = function(client){
        var amt = client.CRS_ACT_CAPITAL_AMT;
        if(client['CRS_FLAG']=='D'){
            amt=amt*(parseFloat(client.CLL_CRF_PERCENTAGE))/100;
        }else if(client['CRS_FLAG']=='R'){
            //do nothing
            amt=0;
        }
        return amt;
    }
    //for CRF, the data is the disbursement amount
    $scope.getCRF = function(client){
        if(client['CRS_FLAG']=='R') return 0;
        else return client.CLL_CRF_PERCENTAGE;
    }
    $scope.weeklyrepayment = function(loan){
        console.log(loan);

        //var totalweeks = loan.CLL_TOTAL_LOAN_WEEKS.value; 
        var totalweeks = loan.CLL_TOTAL_LOAN_WEEKS;  

        loan.CLL_CAPITAL_REPAY_PER_WEEK = parseFloat(loan.CRS_ACT_CAPITAL_AMT) / totalweeks;

        loan.CLL_PROFIT_REPAY_PER_WEEK = parseFloat(loan.CRS_ACT_CAPITAL_AMT)*(parseFloat(loan.CLL_LOAN_INTEREST)) / 100 / totalweeks;

        console.log("Repay : "+ loan.CLL_CAPITAL_REPAY_PER_WEEK);
        console.log("Profit: "+loan.CLL_PROFIT_REPAY_PER_WEEK);

        var amt = loan.CLL_CAPITAL_REPAY_PER_WEEK + loan.CLL_PROFIT_REPAY_PER_WEEK;

        console.log("Repay / Week : " + amt);

        //var newamt = 500 * Math.round(amt/500);

        var capital = 500 * Math.floor(loan.CLL_CAPITAL_REPAY_PER_WEEK/500);
        var capital_r = parseFloat(loan.CLL_CAPITAL_REPAY_PER_WEEK) - parseFloat(capital);
        console.log("Repay Cap After Floor " + capital);
        console.log("Repay Cap R After Floor " + capital_r);

        var profit = 500 * Math.floor(loan.CLL_PROFIT_REPAY_PER_WEEK/500);
        if(profit == 0) profit = loan.CLL_PROFIT_REPAY_PER_WEEK;
        var profit_r = parseFloat(loan.CLL_PROFIT_REPAY_PER_WEEK) - parseFloat(profit);

        console.log("Repay Prof After Floor " + profit);
        console.log("Repay Prof R After Floor " + profit_r);

        var newamt = parseFloat(amt) - (parseFloat(capital_r) + parseFloat(profit_r) );

        return loan.CLL_REPAY_PER_WEEK;

    }

/******************************************
 Functions to calculate total for all groups, disbursement and CRF inclusive
******************************************/

    //This function has replaced all the functions below.
    //value can be totalAmtApplied, totalAmtLoan or totalActualAmtLoan
    $scope.grpsGetValue = function(value){
        var sum = 0;
        for(key in $scope.groups)   {sum += $scope.groups[key][""+value];}
        for(key in $scope.crfgroups){sum += $scope.crfgroups[key][""+value];}
        return sum;
    }

    /*
    $scope.grpsGetTotalApplied = function(){
        var sum = 0;
        for(key in $scope.groups)   {sum += $scope.groups[key].totalAmtApplied;}
        for(key in $scope.crfgroups){sum += $scope.crfgroups[key].totalAmtApplied;}
        return sum;
    }

    $scope.grpsGetTotalLoan = function(){
        var sum = 0;
        for(key in $scope.groups)   {sum += $scope.groups[key].totalAmtLoan;}
        for(key in $scope.crfgroups){sum += $scope.crfgroups[key].totalAmtLoan;}
        return sum;
    }

    $scope.grpsGetActualTotalLoan = function(){
        var sum = 0;
        for(key in $scope.groups)   {sum += $scope.groups[key].totalActualAmtLoan;}
        for(key in $scope.crfgroups){sum += $scope.crfgroups[key].totalActualAmtLoan;}
        return sum;
    }*/


/******************************************
 Check SMS and printer status for client and group
******************************************/
    $scope.getSMSClientStatus = function(loan){

        if(loan == undefined){
            return false;
        } else {
            return loan.CRS_SMS_STATUS=='Y';
        }

    };
    $scope.getSMSGrpStatus    = function(group) {  return group.SMS_SENT=='Y';};

    $scope.getReceiptClientStatus = function(loan){
        ////console.log(loan);
        if(loan == undefined){
            return false;
        } else {
            return loan.CRS_RECP_STATUS == 'Y';
        }
    };

    $scope.groupHasStatement = function(){

        var haveStatement = false;
        if($scope.currGroup.members == undefined || $scope.currGroup.members == null) return false; 
        $.each($scope.currGroup.members,function(c,client){
            $.each(client.loans,function(l,loan){
                if(loan.LTY_CODE == '001.0002'){
                    haveStatement = true;
                }
            })
        });

        return haveStatement;

    }

    $scope.getReceiptClientClientStatus = function(client){

        var done = true;;

        $.each(client.loans,function(i,loan){
            if(loan.CRS_RECP_STATUS == '' && loan.CRS_SMS_STATUS ==''){
                done = false;
            }
        });

        return done;


    };

    $scope.getReceiptGrpStatus    = function(group) {return group.RECEIPT_SENT=='Y';};

/******************************************
 Update the client after they have sent SMS or print receipt
******************************************/
$scope.updateClient = function(client){

    var commands = [];
    //console.log(client);
    for(l in client.loans){

        var loan = client.loans[l];
        //console.log(loan);
        var attended = 'Y';
        if(loan.faildisburse) attended = 'N';
        if(loan.CLL_LTY_PK == 99) attended = 'Y';
 
        var variation = 'N';
        if(parseFloat(loan.CRS_ACT_CAPITAL_AMT) != parseFloat(loan.CRS_EXP_CAPITAL_AMT)) variation = 'Y';
        var lcmd = "";
        if(attended){
            //lcmd = "UDPATE T_CLIENT_LOAN SET CLL_STATUS=13 WHERE CLL_PK="+loan.CLL_PK;
        }

        if(attended == 'Y'){

            var capital = 500 * Math.floor(loan.CLL_CAPITAL_REPAY_PER_WEEK/500);
            var capital_r = parseFloat(loan.CLL_CAPITAL_REPAY_PER_WEEK) - parseFloat(capital);
            var profit = 500 * Math.floor(loan.CLL_PROFIT_REPAY_PER_WEEK/500);
            if(profit == 0) profit = loan.CLL_PROFIT_REPAY_PER_WEEK;
            var profit_r = parseFloat(loan.CLL_PROFIT_REPAY_PER_WEEK) - parseFloat(profit);

            // alert(loan.CLL_CAPITAL_REPAY_PER_WEEK);
            // alert(capital);
            // alert(capital_r);
            // alert(loan.CLL_PROFIT_REPAY_PER_WEEK);
            // alert(profit);
            // alert(profit_r);

            var rounding = parseFloat(capital_r) + parseFloat(profit_r);

            //alert("rounding "+rounding);

            var graceweeks = 0;

            if(loan.CLL_GRACE_PERIOD_WEEKS && loan.CLL_GRACE_PERIOD_WEEKS.value != null && loan.CLL_GRACE_PERIOD_WEEKS.value != ''){
                graceweeks = loan.CLL_GRACE_PERIOD_WEEKS.value;
            }

            //alert(graceweeks);

            //return false;

            loan.CLL_STATUS = 13;
            var lcmd = "UPDATE T_CLIENT_LOAN SET CLL_STATUS=13,"+
                        // "CLL_ACTUAL_LOAN="+loan.CRS_ACT_CAPITAL_AMT+", "+
                        // "CLL_TOTAL_LOAN_WEEKS="+loan.CLL_TOTAL_LOAN_WEEKS.value+","+
                        // "CLL_CAPITAL_REPAY_PER_WEEK="+capital+","+
                        // "CLL_PROFIT_REPAY_PER_WEEK="+profit+", "+
                        // "CLL_ROUNDING_OF_REPAYMENT='"+rounding+"',"+
                        // "CLL_GRACE_PERIOD_WEEKS='"+graceweeks+"', "+
                        "CLL_CASH_OUT_BY='"+sessionStorage.getItem("USER_ID")+"', "+
                        "CLL_CASHIER_BY='"+sessionStorage.getItem("CASHIER_ID")+"' "+
                        // "CLL_GRACE_PERIOD_INTEREST='"++"',"+
                        " WHERE CLL_PK="+loan.CLL_PK;
                        console.log(lcmd);
            commands.push(lcmd);
        }  

        if(loan.faildisburse){
            loan.CLL_STATUS = 34;
            var lcmd = "UPDATE T_CLIENT_LOAN SET CLL_STATUS=34 WHERE CLL_PK="+loan.CLL_PK;
            console.log(lcmd);
            commands.push(lcmd);
        }
 
        var cmd = "UPDATE T_CLIENT_REPAY_SCHEDULE SET CRS_SMS_STATUS='"+loan.CRS_SMS_STATUS+"'"+
        ", CRS_SMS_GROUP_STATUS='"+loan.CRS_SMS_GROUP_STATUS+"'"+
        ", CRS_RECP_STATUS='"+loan.CRS_RECP_STATUS+"'"+
        ", CRS_RECP_GROUP_STATUS='"+loan.CRS_RECP_GROUP_STATUS+"'"+
        ", CRS_ASSISTED='N'"+
        ", CRS_ATTENDED='"+attended+"'"+ 
        ", CRS_PENALTY='' "+
        ", CRS_REASON='' "+
        ", CRS_IS_VARY_FORECAST='"+variation+"' "+
        ", CRS_ACT_CAPITAL_AMT="+loan.CRS_ACT_CAPITAL_AMT+
        ", CRS_CREATED_DATE='"+moment().format("DD/MM/YYYY HH:mm:ss")+"'"+
        ", CRS_CREATED_BY="+USER_PK+
        " WHERE CRS_PK="+loan.CRS_PK;
        console.log(cmd);

        commands.push(cmd);

        if(attended == 'Y'){
            for(p in loan.products){
                var prd = loan.products[p];
                if(prd.PRM_DEPOSIT_FREQUENCY == 'W'  ){
                    if(prd.amtToPay != null && prd.amtToPay > 0 && prd.isCompulsary){
                        var pcmd =  " INSERT INTO T_CLIENT_REPAY_SCHEDULE VALUES(null,"+$scope.maxcrs+
                                ","+client.CLT_PK+ //CRS_CLT_PK
                                ","+loan.CLL_PK+ //CRS_CLL_PK
                                ","+prd.PRM_PK+ //CRS_PRM_LTY_PK
                                ",'S'"+ //CRS_LOAN_SAVING_FLAG
                                ",0"+ //CRS_ACTUAL_WEEK_NO
                                ",0"+ //CRS_COLLECTION_WEEK_NO
                                ",'"+moment().format('DD/MM/YYYY')+"'"+ //CRS_DATE
                                ","+USER_PK+ //CRS_FO
                                ",'C'"+ //CRS_FLAG
                                ",'"+attended+"'"+ //CRS_ATTENDED
                                ",'"+prd.CRS_EXP_CAPITAL_AMT+"'"+ //CRS_EXP_CAPITAL_AMT
                                ",'0'"+ //CRS_EXP_CAPITAL_AMT
                                ",'"+prd.CPM_PRM_BALANCE+"'"+ //CRS_BALANCE_CAPITAL
                                ",'0'"+ //CRS_BALANCE_PROFIT
                                ",''"+ //CRS_PENALTY
                                ",'"+loan.CRS_SMS_STATUS+"'"+ //CRS_SMS_STATUS
                                ",'"+loan.CRS_SMS_GROUP_STATUS+"'"+ //CRS_SMS_GROUP_STATUS
                                ",'"+loan.CRS_RECP_STATUS+"'"+ //CRS_RECP_STATUS
                                ",'"+loan.CRS_RECP_GROUP_STATUS+"'"+ //CRS_RECP_GROUP_STATUS
                                ",''"+ //CRS_REASON
                                ",'N'"+ //CRS_ASSISTED
                                ",'"+prd.amtToPay+"'"+ //CRS_ACT_CAPITAL_AMT
                                ",'0'"+ //CRS_ACT_PROFIT_AMT
                                ",'N'"+ //CRS_IS_VARY_FORECAST
                                ",''"+ //CRS_REF_NO
                                ",''"+ //CRS_EXT_STATUS
                                ",''"+ //CRS_FUP_PK
                                ",''"+ //CRS_RECON_FUP_PK
                                ","+USER_PK+ //CRS_CREATED_BY
                                ",'"+moment().format("DD/MM/YYYY HH:mm:ss")+"'"+ //CRS_CREATED_DATE
                                ",0);";
                        console.log(pcmd);
                        commands.push(pcmd);
                        $scope.maxcrs = parseInt($scope.maxcrs) + 1;
                    } 
                } else {
                     console.log(prd);
                    if(prd.amtToPay != null && prd.amtToPay > 0 && prd.isCompulsary){

                        var txnStatus = 45;
                        var CPM = prd.CPM_PK;
                        if(!prd.existsingPrd) {
                            txnStatus = 999;
                            CPM = parseInt($scope.maxcpm);
                            $scope.maxcpm = parseInt($scope.maxcpm) + 1; 
                            var cmdCPM = "INSERT INTO T_CLIENT_PRODUCT_MAPPING VALUES(null, "+CPM+", "+loan.CLL_CLT_PK+", "+loan.CLL_PK+", "+ prd.PRM_PK +", '3', '"+ prd.amtToPay +"', null, '"+moment().format('DD/MM/YYYY HH:mm:ss')+"', null, 1,'0', '"+moment().format('DD/MM/YYYY HH:mm:ss')+"','"+moment().add(3, 'years').format('DD/MM/YYYY HH:mm:ss')+"', 2)"; 
                            commands.push(cmdCPM);
                        }

                        var cmd3 = "INSERT INTO T_CLIENT_PRD_TXN VALUES(null,"+
                                ""+$scope.maxcpt+ //CPT_PK
                                ", "+CPM+ //CPT_CPM_PK
                                ", '"+loan.CLL_CLT_PK+"'"+ // CPT_CLT_PK
                                ", '"+prd.PRM_PK+"'"+ // CPT_PRM_PK
                                ", 'C'"+ // CPT_FLAG
                                ", '"+prd.amtToPay+"'"+ // CPT_TXN_AMOUNT
                                ",'"+moment().format('YYYY-MM-DD HH:mm:ss.0')+"'"+ // CPT_DATETIME
                                ", '"+USER_PK+"'"+ // CPT_USER_PK
                                ", ''"+ // CPT_REASON
                                ", ''"+ // CPT_REMARK
                                ", '"+ txnStatus +"'"+ // CPT_STATUS
                                ",'0'"+ //CPT_EXP_AMOUNT
                                ",0"+ //CPT_COLLECTION_WEEK_NO
                                ",1);"; // CPT_CHKNEW
                        console.log(cmd3);
                        commands.push(cmd3);
                        $scope.maxcpt = parseInt($scope.maxcpt) + 1;
                    }
                }

            }
        } else {
            if ($scope.reschedules.length > 0 ){
                for (let r = 0; r < $scope.reschedules.length; r++) {
                    const resc = $scope.reschedules[r];
                    if (resc.CLL_PK == loan.CLL_PK){
                        var cmd4 = "INSERT INTO T_FAIL_DISBURSE_LOAN VALUES(null"+
                                ", "+$scope.maxfdl+ //CPT_PK
                                ", "+loan.CLL_PK+ //FDL_OLD_CLL_PK
                                ", '"+resc.CLL_ACTUAL_LOAN+"'"+ // FDL_CLL_ACTUAL_LOAN
                                ", '"+resc.CLL_DISBURSEMENT_DATE+"'"+ // FDL_CLL_DISBURSEMENT_DATE
                                ", '"+resc.CLL_LOAN_WEEKS+"'"+ // FDL_LOAN_WEEKS 
                                ", "+ USER_PK + // FDL_CREATED_BY
                                ",'"+moment().format('YYYY-MM-DD HH:mm:ss.0')+"'"+ // FCL_CREATED_DATE
                                ");";
                        console.log(cmd4);
                        commands.push(cmd4);
                        $scope.maxfdl = parseInt($scope.maxfdl) + 1;
                    }
                }
            }
        }

    }

    myDB.dbShell.transaction(function(tx){

        for(c in commands){
            console.log(commands[c]);
            tx.executeSql(commands[c]);
        }
        if(lcmd != ""){
            tx.executeSql(lcmd);
        } 
    }, function(err){
        console.log(err);
        swal(i18n.t("messages.SaveClientError"));
        return true;
    }, function(suc){
        $scope.taskUpd = 1; //To update  Header
        $scope.$apply();
    });
};

/******************************************
 When user selects no disbursement
******************************************/
    //fail to disburse
    $scope.failDisburseToggle = function(loan){
 
        if(loan.faildisburse == false){
            loan.CRS_ACT_CAPITAL_AMT = 0;
            loan.CRS_ATTENDED = 'N';
            $.each(loan.products,function(i,prd){
                prd.isCompulsary = false;
                prd.intPercentage = 0;
            });
            $scope.rescheduleSwal(loan);
        } else {
            loan.CRS_ACT_CAPITAL_AMT = loan.CRS_EXP_CAPITAL_AMT;
            loan.CRS_ATTENDED = 'Y';
            $.each(loan.products,function(i,prd){
                prd.isCompulsary = prd.DefisCompulsary;
                prd.intPercentage = prd.DefintPercentage;
            });
            $scope.removeReschedule(loan);
        } 

        console.log(loan.faildisburse );

    };

/******************************************
 When invalid value is entered for client
******************************************/
    $scope.checkLoanInvalid = function(client){
        for(l in client.loans){
            loan = client.loans[l];
            //console.log(loan);
            if(loan.CRS_ACT_CAPITAL_AMT==null||isNaN(loan.CRS_ACT_CAPITAL_AMT)||(parseFloat(loan.CRS_ACT_CAPITAL_AMT)>parseFloat(loan.CRS_EXP_CAPITAL_AMT))||(loan.CRS_ACT_CAPITAL_AMT<0)){
                //alert(member.CLT_FULL_NAME+"'s loan amount is invalid.");
                swal(client.CLT_FULL_NAME+i18n.t("messages.InvalidLoanAmt"));
                return true;
            }
        }

        return false;
    }

    $scope.allDone = function(group){

        var done = true;
        var needsign = false;

        if(group == undefined || group.members == undefined || group.members.length == 0){
            return false;
        } else {
            $.each(group.members,function(c,client){
                $.each(client.loans,function(l,loan){
                    if( loan.CRS_RECP_STATUS == "" && 
                        loan.CRS_SMS_STATUS == "" && 
                        loan.CRS_RECP_GROUP_STATUS == "" && 
                        loan.CRS_SMS_GROUP_STATUS == ""){
                        done = false;
                    }
                    if(loan.CLL_STATUS == 13) needsign = true;
                });
            });
        }
        if(done && needsign && $scope.currGroup == group){
            window.scrollTo(100,document.body.scrollHeight);
        }

        return (done && needsign);
    }

/******************************************
 When user clicks on send sms or print receipt
******************************************/
    $scope.sendMsg = function(type_flag, sms_print_flag, data){
        var grp_total = null, grp_disb=null, grp_leader = null, msg = "", resend = false;;

        if(type_flag=="G"){ //group
            var members = data.members;
            var member;
            for(k in members){
                member = members[k];
                if($scope.checkLoanInvalid(member)){return false;}
            }

            //check if this is a resend
            if(sms_print_flag=="S"){
                if(data.SMS_SENT=="Y") resend = true;
            }else{ //printing
                if(data.RECEIPT_SENT=="Y") resend = true;
            }
        }else{ //single
            var member = data;
            if($scope.checkLoanInvalid(member)){return false;}

            for(l in member.loans){
                var resend = false;
                var loan = member.loans[l];
                if(sms_print_flag=="S"){
                    if(loan.CRS_SMS_STATUS=="Y") resend = true;
                }else{ //printing
                    if(loan.CRS_RECP_STATUS=="Y") resend = true;
                }
            }
        }

        if(resend){ //seek confirmation
           // if (!confirm((sms_print_flag=="S")?"Do you want to resend SMS?":"Do you want to print duplicate receipt?")) return false;
            if (!confirm((sms_print_flag=="S")? i18n.t("messages.DoYouWantToResendSMS"):i18n.t("messages.DoYouWantToPrintDuplicateReceipt"))) return false;
        }

        //get time
        var time = "";
        if(sms_print_flag=="S") time = moment().format('DD/MM/YY');// h:mma
        else time = moment().format('Do MMMM YYYY, h:mm:ssa');

        if(type_flag=="G"){
            grp_total = $scope.grpGetTotalLoan(data); //get total if group
            grp_disb = $scope.grpGetActualTotalLoan(data);
            var grp_id = data.GROUP_ID;

            //use SQL to get leader's information
            var cmd = "SELECT CLT_MOB_NO_1, CLT_FULL_NAME FROM T_CLIENT WHERE CLT_GROUP_ID='"+grp_id+"' AND  CLT_IS_GROUP_LEADER='Y'";
            myDB.execute(cmd,function(results){
                if(results.length<1){
                   // alert("No leader found.");
                    swal(i18n.t("messages.NoLeaderFound"));
                    return false;
                }
                //get text format
                msg = $scope.getTextFormat(type_flag, sms_print_flag, data, results[0], grp_total, grp_disb, time,resend);
                $scope.updateAndSend(type_flag, sms_print_flag, data, results[0], msg,resend);
            });
        }else{
            //get text format
            msg = $scope.getTextFormat(type_flag, sms_print_flag, data, grp_leader, grp_total, grp_disb, time,resend);
            $scope.updateAndSend(type_flag, sms_print_flag, data, grp_leader, msg,resend);
        }
    }

   /**
    *  Update client profile and send sms/print receipt
    *  @param type_flag G => group , C => client
    *  @param sms_print_flag S => SMS , R => Printing
    *  @param data
    *  @param grp_leader
    *  @param msg
    *  @param resend
    */
    $scope.updateAndSend = function(type_flag, sms_print_flag, data, grp_leader, msg,resend){
        if(type_flag=="G"){ 
            for(key in data.members){
                var client = data.members[key];
                for(l in client.loans){
                    var loan = client.loans[l];
                    if(sms_print_flag=="S"){ loan.CRS_SMS_GROUP_STATUS = 'Y'; } //update sms print statuses
                    else if(sms_print_flag=="R"){ loan.CRS_RECP_GROUP_STATUS = 'Y'; }
                }

                $scope.updateClient(client);
            }
            if(sms_print_flag=="S"){ $scope.$apply(function(){data.SMS_SENT = 'Y';}); } //update group statuses
            else if(sms_print_flag=="R"){ $scope.$apply(function(){data.RECEIPT_SENT = 'Y';}); }
        }else if(type_flag=="C"){
            for(l in data.loans){
                var loan = data.loans[l];
                if(sms_print_flag=="S") loan.CRS_SMS_STATUS = 'Y'; //update sms status for client
                else if(sms_print_flag=="R") loan.CRS_RECP_STATUS = 'Y'; //update print status for client
                //console.log(loan);
            }
            //console.log(data);
            $scope.updateClient(data);
        } 

        if(!devtest){ //production, send sms and print receipt
            var company = "TEL:"+BRC_PHONE;
            if(resend) company+="\n**DUPLICATE**";

            if(sms_print_flag!='S') {
                //printservice.createEvent(CMP_NAME,msg,company); //print
                if(canPrint) {
                    printservice.createEvent(CMP_NAME,msg,company,
                        function(res) {
    
                            if(res){
                                swal(i18n.t("messages.SuccessfulPrintReceipt"));
                            } else {
                                swal(i18n.t("messages.ErrorPrintReceipt"));
                            }
    
                        }
                    ); //print receipt
                }
                
            } else if(sms_print_flag!='R'){ //sms
                var recipient = (type_flag=="G")?grp_leader.CLT_MOB_NO_1:data.CLT_MOB_NO_1; //decide if recipient is group leader or individual client
                //smsservice.createEvent(recipient, msg.substring(0, 160));

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
        }else{ //print to console
            if(sms_print_flag == 'R') console.log("Print receipt:\n"+CMP_NAME+"\n"+msg+"\n"+"TEL:"+BRC_PHONE); //printer
            else if(sms_print_flag =='S'){ //sms
                if(type_flag=="G") console.log("Send group sms:\n"+grp_leader.CLT_MOB_NO_1+"\n"+msg+"\n"+msg.substring(0, 160).length); //sms group
                else if(type_flag=="C") console.log("Send client sms:\n"+data.CLT_MOB_NO_1+"\n"+msg+"\n"+msg.substring(0, 160).length); //sms client
            }
        }
    };
/******************************************
 Generate text to print
******************************************/

    $scope.getTextFormat = function(type_flag, sms_print_flag, data, grp_leader, grp_total, grp_disb, time,resend){
        var msg = "";

        //sms format
        if(sms_print_flag=='S'){
            if((type_flag=="C"&&data.CRS_FLAG=="R")||(type_flag=="G"&&data.GRP_FLAG=="R")) msg += "CRF DISB";
            else msg += "DISB";

            if(type_flag=="G") msg += "(GP)";
            if(resend) msg += "-"+i18n.t("messages.Copy");
            msg+= "\n";
            //if(CMP_SMS_FORMAT.indexOf('DT')!=-1)    msg+=time+"\n";
            if(CMP_SMS_FORMAT.indexOf('DT')!=-1)    msg+=$scope.Printing.sms[findIndexInData($scope.Printing.sms,'pid','DT')].pname+":"+time;
            msg+="\n";
            //if(CMP_SMS_FORMAT.indexOf('FONM')!=-1)   msg+="FO: "+USER_NAME+"\n";
            if(CMP_SMS_FORMAT.indexOf('FONM')!=-1)    msg+=$scope.Printing.sms[findIndexInData($scope.Printing.sms,'pid','FONM')].pname+":"+USER_NAME;
            msg+="\n";
            // if(CMP_SMS_FORMAT.indexOf('BR')!=-1||CMP_SMS_FORMAT.indexOf('BRID')!=-1) msg+="BR: ";
            //if(CMP_SMS_FORMAT.indexOf('BR')!=-1)     msg+=BRC_NAME;
            if(CMP_SMS_FORMAT.indexOf('BR')!=-1)    msg+=$scope.Printing.sms[findIndexInData($scope.Printing.sms,'pid','BR')].pname+":"+BRC_NAME;
            msg+="\n";
            if(CMP_SMS_FORMAT.indexOf('BRID')!=-1){
                //if(CMP_SMS_FORMAT.indexOf('BR')!=-1) msg+="/";
                //msg+=BRC_BRANCH_ID;
                msg+=$scope.Printing.sms[findIndexInData($scope.Printing.sms,'pid','BRID')].pname+":"+" ("+BRC_BRANCH_ID+")";
            }

            msg+="\n";
            if(type_flag=="G"){
                if(CMP_SMS_FORMAT.indexOf('CLNM')!=-1&&sms_print_flag=='S') msg+="GP LEAD: "+grp_leader.CLT_FULL_NAME+"\n";
                if(CMP_SMS_FORMAT.indexOf('CLID')!=-1) msg+="GP ID: "+data.CLT_GROUP_ID+"\n";
                if(CMP_SMS_FORMAT.indexOf('AMT')!=-1){
                    if(data.CRS_FLAG=="R") msg+="CRF AMT: "+$filter('currency')(grp_total,$scope.currloc);
                    else msg+="AMT: "+$filter('currency')(grp_disb,$scope.currloc)+"\n"+"CRF:"+$filter('currency')(grp_total-grp_disb,$scope.currloc);
                }
            }else if(type_flag=="C"){
                //if(CMP_SMS_FORMAT.indexOf('CLNM')!=-1)   msg+="NAME: "+data.CLT_FULL_NAME+"\n";
                if(CMP_SMS_FORMAT.indexOf('CLNM')!=-1)   msg+=$scope.Printing.sms[findIndexInData($scope.Printing.sms,'pid','CLNM')].pname+":"+data.CLT_FULL_NAME+")\n";// NAME OF CLIENT
                if(CMP_SMS_FORMAT.indexOf('CLID')!=-1)   msg+=$scope.Printing.sms[findIndexInData($scope.Printing.sms,'pid','CLID')].pname+":"+data.CLT_CLEINT_ID+")\n";// NAME OF CLIENT(CLIENT ID)
                //if(CMP_SMS_FORMAT.indexOf('CLID')!=-1)   msg+="ID: "+data.CLT_CLEINT_ID+"\n";
                if(CMP_SMS_FORMAT.indexOf('AMT')!=-1){
                    if(data.CRS_FLAG=="D") msg+="AMT: "+$filter('currency')($scope.calcAct(data),$scope.currloc)+"\n"+"CRF:"+$filter('currency')($scope.crfAmt(data),$scope.currloc);
                    else msg+="CRF AMT: "+$filter('currency')(data.CRS_ACT_CAPITAL_AMT,$scope.currloc)+"\n";//(data.CRS_TOTALPAID)
                }
            }
            return msg;
        }

        //receipt format
        if(sms_print_flag=='R'){
            if((type_flag=="C"&&data.CRS_FLAG=="R")||(type_flag=="G"&&data.GRP_FLAG=="R")) msg += "CRF DISBURSEMENT";
            else msg += i18n.t("messages.Disbursement");

            if(type_flag=="G") msg += " (Group)";

            msg+= "\n\n";

            if(CMP_RECEIPT_FORMAT.indexOf('DT')!=-1)         msg+=time+"\n";
            msg+="\n";
            if(CMP_RECEIPT_FORMAT.indexOf('FONM')!=-1)       msg+=$scope.Printing.rcp[findIndexInData($scope.Printing.rcp,'pid','FONM')].pname+":"+USER_NAME;
            msg+="\n";
            if(CMP_RECEIPT_FORMAT.indexOf('BR')!=-1)         msg+=$scope.Printing.rcp[findIndexInData($scope.Printing.rcp,'pid','BR')].pname+":"+BRC_NAME;
            msg+="\n";
            if(CMP_RECEIPT_FORMAT.indexOf('BRID')!=-1)       msg+=$scope.Printing.rcp[findIndexInData($scope.Printing.rcp,'pid','BRID')].pname+":"+" ("+BRC_BRANCH_ID+")";
            msg+="\n";
            if(type_flag=="G"){ //group
                if(CMP_RECEIPT_FORMAT.indexOf('CLNM')!=-1)   msg+="GRP LEADER: "+grp_leader.CLT_FULL_NAME+"\n";
                if(CMP_RECEIPT_FORMAT.indexOf('CLID')!=-1)   msg+="GRP ID    : "+data.GROUP_ID+"\n";
                if(CMP_RECEIPT_FORMAT.indexOf('AMT')!=-1){
                    if(data.CRS_FLAG=="R")
                        msg+="CRF AMT: " +$filter('currency')(grp_total)+"\n";
                    else{
                        msg+=i18n.t("messages.LoanAmt")+": "+$filter('currency')(grp_total,$scope.currloc)+"\n";
                        msg+="CRF     : "+$filter('currency')(grp_total-grp_disb,$scope.currloc)+"\n";
                        msg+="AMT DISB: "+$filter('currency')(grp_disb,$scope.currloc)+"\n";
                    }
                }
            }else if(type_flag=="C"){ //client
                if(CMP_RECEIPT_FORMAT.indexOf('CLNM')!=-1)   msg+=$scope.Printing.rcp[findIndexInData($scope.Printing.rcp,'pid','CLNM')].pname+":"+data.CLT_FULL_NAME;
                msg+="\n";
                if(CMP_RECEIPT_FORMAT.indexOf('CLID')!=-1)   msg+=$scope.Printing.rcp[findIndexInData($scope.Printing.rcp,'pid','CLID')].pname+":"+data.CLT_CLEINT_ID;
                msg+="\n";
                if(CMP_RECEIPT_FORMAT.indexOf('AMT')!=-1){
                    if(data.CRS_FLAG=="R") msg+="CRF AMT: "+$filter('currency')(data.CRS_ACT_CTAPITAL_AMT,$scope.currloc)+"\n";//(data.CRS_TOTALPAID)
                    else{
                        $.each(data.loans,function(i,loan){
                            msg+=i18n.t("messages.Loan")+":     "+i18n.t(`LOANS.${loan.LTY_DESCRIPTION}`)+"\n";
                            msg+=i18n.t("messages.LoanAmt")+": "+$filter('noFractionCurrency')(loan.CRS_ACT_CAPITAL_AMT,$scope.currloc)+"\n";//(data.CRS_TOTALPAID)
                            msg+="CRF     : "+$filter('noFractionCurrency')($scope.crfAmt(loan),$scope.currloc)+"\n";//(data.CRS_TOTALPAID)
                            msg+="AMT DISB: "+$filter('noFractionCurrency')($scope.calcAct(loan),$scope.currloc)+"\n";//(data.CRS_TOTALPAID)
                        })
                    }
                }
            }
            return msg;
        }

    }

/******************************************
 Checks if CRF Group
******************************************/
    $scope.checkIsCRF = function(group){ return group.GRP_FLAG=='R';};

/******************************************
 When user selects a group and navigates to detailed page
******************************************/
    $scope.currGroup = {};
    $scope.viewGroup = function(group){
        $scope.currGroup = group;
        var cltInGrp = "";
        //console.log("LINE 1024");
        //console.log(group);
        $.each(group.members,function(c,client){
            console.log("line204")
            console.log(client)
            if(cltInGrp !="") cltInGrp += ",";
            cltInGrp += client.CLT_PK;
            if(client.CLT_SIGNATURE != null && client.CLT_SIGNATURE != 'null'){
                client.hasSigned = true;
                $scope.showSignature('client',client.CLT_PK,client.CLT_SIGNATURE);
            }
        })
 
        var ccdm = "SELECT * FROM T_CLIENT WHERE CAST(CLT_CENTER_ID AS INTEGER)="+$scope.currGroup.CLT_CENTER_ID+" AND CLT_GROUP_ID = '"+$scope.currGroup.GROUP_ID+"' AND CLT_PK NOT IN ("+cltInGrp+") ";
        myDB.execute(ccdm,function(res){
            console.log(res);
            console.log('asda');
            if(res && res.length > 0){
                
                $scope.currGroup.witness = [];
                $.each(res,function(i,client){
                    client.hasSigned = false;
                    $scope.currGroup.witness.push(client);
                    if(client.CLT_SIGNATURE != null && client.CLT_SIGNATURE != 'null'){
                        client.hasSigned = true;
                        console.log('client signature')
                        console.log(client);
                        $scope.showSignature('client', client.CLT_PK, client.CLT_SIGNATURE);
                    }
                });
                $scope.$apply(); 
            }
            console.log("updated ");
            console.log($scope.currGroup);
            setTimeout(function(){
                $scope.$apply();
            }, 1)
            $scope.detailview();
        }); 
    };
    $scope.updateVillage = function(obj){

        //console.log(obj);

       $scope.sf.CLT_VILLAGE = obj;
        setTimeout(function(){
            $scope.$apply();
            $scope.taskUpd = 1;
        },100);
    }
    $scope.detailview = function(){
        if($scope.clientspage)
            $scope.clientspage = false;
        else
            $scope.clientspage = true;

        if($scope.clientspage){
            $('.first-page').hide();
            $('.second-wrapper').show();
            $('.second-page').fadeOut();
            $.each($scope.currGroup.members,function(c,client){

                $.each(client.loans,function(i,loan){
                    //console.log("123");
                    //console.log($("#test").html());
                    //$("#loanmat"+loan.CLL_PK).val(loan.CLL_TOTAL_LOAN_WEEKS).change();
                    $('.loanmat').each(function(i, element) {
                        var selected = $(this).find('option:selected').text();
                        $(this).parent().find('span').html(selected);
                    });
                    $('.loangrace').each(function(i, element) {
                        var selected = $(this).find('option:selected').text();
                        $(this).parent().find('span').html(selected);
                    });

                })


            })
        } else {
            $('.first-page').fadeIn();
            $('.second-page').show();
            $('.second-wrapper').hide();

        }
    }

    $scope.updateInterest = function(loan){

        var TermArray = loan.LTY_TERM_OF_LOAN.split(",");
        var InterestArray = loan.LTY_DEFAULT_LOAN_INTEREST.split(","); 
        for(var i=0; i < TermArray.length; i++){
            if(loan.CLL_TOTAL_LOAN_WEEKS.value == TermArray[i]){
                loan.CLL_LOAN_INTEREST = (parseInt(InterestArray[i]) /100).toFixed(2); 
            }
        } 
    }

    $scope.validateLoanAmt = function(loan){
        var thisval =  loan.CRS_ACT_CAPITAL_AMT;
        if(thisval==null||isNaN(thisval)||thisval==""||thisval=="null"||thisval<=0){
            loan.CRS_TOTALPAID = 0;
        }
        if(parseFloat(thisval) > parseFloat(loan.CRS_EXP_CAPITAL_AMT)){
            loan.CRS_ACT_CAPITAL_AMT = loan.CRS_EXP_CAPITAL_AMT;
        }
    }

    $scope.showSignscreen = function(client, type){

        type = typeof type !== 'undefined' ? type : null;

        if(!$scope.showSign){
            $scope.showSign = true;
            setTimeout(function(){
                if(type == null){
                    $scope.signingclientIndex = client.CLT_PK;
                    $scope.loadSignaturePad(client);
                } else if(type === 'officer'){
                    $scope.loadSignaturePad(null,'officer');
                    $scope.signinguser = 'officer';
                } else if(type === 'mgr'){
                    $scope.loadSignaturePad(null,'mgr');
                    $scope.signinguser = 'mgr';
                }

            },100);

        } else {
            $scope.showSign = false;
        }
    }

    var $sigdiv = $("#signature")
    var canvas = $('#the-canvas')[0];
    var context = canvas.getContext("2d");

    var imht = 100;
    var imwt = 200;

    var img2 = "";

    $scope.loadSignaturePad = function(client, type){

        client = typeof client !== 'undefined' ? client : null;

        $('#sigbtn').fadeIn();

        if($('canvas.jSignature').length == 0){
            $sigdiv.jSignature({
                width:'90%',
                height:250,
                lineWidth:4,
                'border-bottom':'2px solid black',
                'background-color': '#DDD',
                'decor-color': 'transparent',
            });
        }

        $('#signature').jSignature('clear');
        $('.displayarea').html('');

        context.clearRect(0, 0, canvas.width, canvas.height);

        $('.jSignature').css('background-color','#DDD');
        $('.jSignature').css('border-bottom','2px solid black');
        $('.jSignature').css('margin-bottom','15px');

        if(type == null){
            $('#signingperson').html('<h3><p>'+client.CLT_FULL_NAME+' '+ i18n.t("messages.SignHere") +'</p></h3>');
        } else if (type == 'officer') {
            $('#signingperson').html('<h3><p>'+$scope.user.userName+' '+ i18n.t("messages.SignHere") +'</p></h3>');
        }

        $('html, body').animate({
            scrollTop: $("#the-canvas").offset().top - 10
        }, 500);

    }

    $scope.clearSignature = function(ind, type){

        ind = typeof ind !== 'undefined' ? ind : null;

        $scope.clearSigPad();

        if( ind != null ){

            var clients = $filter('filter')($scope.clients, { CLT_GROUP_ID: $scope.selectedGroup.value });

            var client = clients[ind];
            var canv = $('#the-canvas-'+client.CLT_PK)[0];
            client.hasSigned = false;
        } else if (type === 'officer'){
            var canv = $('#the-canvas-officer')[0]; 

            myDB.execute("UPDATE T_USER SET USER_SIGNATURE ='', USER_HAVE_SIGNATURE='N' WHERE USER_PK = "+$scope.user.userPK, function(res){
                $scope.$apply(function(){
                    $scope.user.hasSigned = false;
                    $scope.user.Signature = '';
                    sessionStorage.setItem("USER_SIG",null);
                    sessionStorage.setItem("USER_HAVE_SIG","N");
                });
            }); 
        } else if (type === 'mgr'){
            var canv = $('#the-canvas-mgr')[0];
            $scope.MGR.hasSigned = false;
            $scope.MGR.Signature = "";
            sessionStorage.setItem("MGR_HAVE_SIG","N");
            sessionStorage.setItem("MGR_SIG","");

            myDB.execute("UPDATE T_USER SET USER_SIGNATURE ='', USER_HAVE_SIGNATURE='N' WHERE USER_PK = '"+$scope.MGR.mgrpk+"'", function(res){

            });

        }

        var cont = canv.getContext("2d");
        cont.clearRect(0, 0, 200, 100);
    }

    $scope.clearSigPad = function(){
        if($scope.showSign){
            $('#signature').jSignature('clear');
            context.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    $scope.showSignature = function(type,pk,c_sig){
        if(type == 'officer'){
            var dsrc = atob($scope.user.Signature);

            var img2 = new Image();
            img2.onload = (function(){
                var canv = $('#the-canvas-officer')[0];
                var cont = canv.getContext("2d");
                cont.drawImage(img2, 0, 0, 200, 100);
            });

        } else if (type == 'mgr'){
            var dsrc = atob($scope.MGR.Signature);

            var img2 = new Image();
            img2.onload = (function(){
                var canv = $('#the-canvas-mgr')[0];
                var cont = canv.getContext("2d");
                cont.drawImage(img2, 0, 0, 200, 100);
            });
        } else if (type == 'client'){
            var dsrc = atob(c_sig);

            var img2 = new Image();
            img2.onload = (function(){
                var canv = $('#the-canvas-'+pk)[0];
                var cont = canv.getContext("2d");
                cont.drawImage(img2,0,0,200,100);
            });
        }

        img2.src = dsrc;
    }

    $scope.importImg = function(){

        var clients = $scope.currGroup.members;

        var data = $sigdiv.jSignature('getData', 'image');

        var dsrc = 'data:' + data[0] + ',' + data[1];
        var png = $sigdiv.jSignature('getData','base30');

        var blob = btoa(dsrc);
        var ratio = canvas.height / 200;

        ht = canvas.height / ratio;

        var img2 = new Image();
        img2.onload = (function(){ 
            if($scope.signingclientIndex != null){
                var client = clients[$scope.signingclientIndex];

                if(client === undefined){
                    client = $filter('filter')($scope.currGroup.witness, { CLT_PK: $scope.signingclientIndex })[0];
                } 
                var canv = $('#the-canvas-'+client.CLT_PK)[0];
                $scope.$apply(function(){
                    client.hasSigned = true;
                    var cmd1 = "UPDATE T_CLIENT SET CLT_SIGNATURE ='"+blob+"' WHERE CLT_PK = "+client.CLT_PK;
                    myDB.execute(cmd1,function(res){

                    });
                })

                $scope.signingclientIndex = null;
            } else if($scope.signinguser === 'officer'){
                var canv = $('#the-canvas-officer')[0];
                $scope.$apply(function(){
                    $scope.user.hasSigned = true;
                    $scope.user.Signature = blob;
                })

                var cmd1 = "UPDATE T_USER SET USER_SIGNATURE ='"+blob+"' , USER_HAVE_SIGNATURE='Y' WHERE USER_PK = "+$scope.user.userPK;

                myDB.execute(cmd1, function(res){
                });

            } else if($scope.signinguser === 'mgr'){
                var canv = $('#the-canvas-mgr')[0];
                $scope.$apply(function(){
                    $scope.MGR.hasSigned = true;
                    $scope.MGR.Signature = blob;
                });

                var cmd1 = "UPDATE T_USER SET USER_SIGNATURE ='"+blob+"' , USER_HAVE_SIGNATURE='Y' WHERE USER_PK = "+$scope.MGR.mgrpk;

                myDB.execute(cmd1, function(res){

                    sessionStorage.setItem("MGR_HAVE_SIG","Y");
                    sessionStorage.setItem("MGR_SIG",blob);

                });
            }

            $scope.clearSigPad();
            var cont = canv.getContext("2d");
            cont.drawImage(img2, 0, 0, 200, 100);

            $scope.showSign = false;

            $('html, body').animate({
                scrollTop: $("#client-signatures").offset().top - 90
            }, 500);

            $scope.checkAllDone($scope.currGroup,true);
            $scope.$apply();
        });

        img2.src = dsrc;
    }

    $scope.checkAllDone = function(group,canAlert){

        var alldone = true;

        var grpclients = group.members;

        if(grpclients == undefined || grpclients.length == 0) return alldone;

        $.each(grpclients,function(i,client){
            if(client.loans.length > 0){
                console.log(client);
                if((client.loans[0].CLL_STATUS == 13 && !client.hasSigned) || client.loans[0].CLL_STATUS == 12) alldone = false;
            }
        });

        if(!alldone) return alldone;

        var witnesses = group.witness;
        if(witnesses != undefined && witnesses.length > 0){
            $.each(witnesses,function(i,client){
                if(!client.hasSigned) alldone = false;
            });
        } 
        if(!$scope.user.hasSigned) alldone = false;

        if(alldone && canAlert) $scope.allSigned();
        
        return alldone;
    }

    $scope.allSigned = function(){
        swal({
            title: i18n.t("messages.AlertSuccess"),
            text: i18n.t("messages.GroupCompleted"),
            type: 'success',
            confirmButtonColor: "#80C6C7",
            confirmButtonText: "Ok",
            closeOnConfirm: true
        },function(){

            setTimeout(function(){
                $scope.detailview(0);
                $('.addclientdone').fadeIn();
            },100);

        });
    }

    $scope.b64toBlob = function (b64Data, contentType, sliceSize) {
        contentType = contentType || '';
        sliceSize = sliceSize || 512;

        var byteCharacters = atob(b64Data);
        var byteArrays = [];

        for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            var slice = byteCharacters.slice(offset, offset + sliceSize);

            var byteNumbers = new Array(slice.length);
            for (var i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            var byteArray = new Uint8Array(byteNumbers);

            byteArrays.push(byteArray);
        }

        var blob = new Blob(byteArrays, {type: contentType});
        return blob;
    }

    $scope.loadImage = function(src, onload) {
        // http://www.thefutureoftheweb.com/blog/image-onload-isnt-being-called
        var img = new Image();
        img.onload = onload;
        img.src = src;
        return img;
    }

    $(document).on('click','a.mlogo',function(e){

        if(!$scope.checkAllDone($scope.currGroup,false)){
            e.preventDefault();
            e.stopPropagation();

            swal({
                title: i18n.t("messages.Alert"),
                text: i18n.t("messages.ConfirmLeavePage"),
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes!",
                closeOnConfirm: false
            }).then(function(isConfirm){
                if(isConfirm){
                    window.location = 'dashboard.html';
                }
            });
        }
    })

    $scope.getUserSignature = function(){
        myDB.execute("SELECT USER_SIGNATURE, USER_HAVE_SIGNATURE FROM T_USER WHERE USER_PK='"+$scope.user.userPK+"'" ,function(results){

            $scope.user.Signature = ((results[0].USER_SIGNATURE === null || results[0].USER_SIGNATURE === 'null') ? '' : results[0].USER_SIGNATURE); 
            if(results[0].USER_HAVE_SIGNATURE == 'Y'  ) {
                $scope.user.hasSigned = true;
                $scope.showSignature('officer');
            }
        });
    }

    $scope.readOutLoud = function(words){
        TTS
        .speak({
            text: words,
            locale: 'id_ID',
            rate: 0.75
        }, function () {
            swal('success');
        }, function (reason) {
            swal(reason);
        });
    }

    $scope.getUserSignature();
    if($scope.MGR.Signature != null && $scope.MGR.Signature != ''){
        $scope.MGR.hasSigned = true;
        $scope.showSignature('mgr');
    }
    var qrdata = {
        amount : 100000,
        type: 'Disbursement'
    };

    qrdata = JSON.stringify(qrdata);

    // var qrcode = new QRCode("qrcode", {
    //     text:qrdata,
    //     width: 128,
    //     height: 128,
    //     colorDark : "#000000",
    //     colorLight : "#ffffff",
    //     correctLevel : QRCode.CorrectLevel.H
    // });

    $scope.openQR = function(client){

        console.log(client);

        var ttlAmount = 0;

        if(client.loans && client.loans.length > 0){
            client.loans.forEach(function(loan){
                ttlAmount += parseInt(loan.CLL_ACTUAL_LOAN);
            })
        }

        var qrdata = {
            name: client.CLT_FULL_NAME,
            amount : ttlAmount,
            type: 'Disbursement'
        };

        qrdata = JSON.stringify(qrdata);
        $('#qrcode').html('');
        var qrcode = new QRCode("qrcode", {
            text:qrdata,
            width: 128,
            height: 128,
            colorDark : "#000000",
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.H
        });


        $('#myModal').show();
    }

    $scope.closeQR = function() {
        $('#myModal').hide();
    }
    $scope.removeReschedule = function(loan) {
        if($scope.reschedules.length > 0) {
            for (let r = 0; r < $scope.reschedules.length; r++) {
                const resc = $scope.reschedules[r];
                if (resc.CLL_PK == loan.CLL_PK){
                    $scope.reschedules.splice(r,1);
                }
            }
        }
    }
    $scope.rescheduleSwal = function(loan){
        Swal.fire({
            title: i18n.t("messages.DisbursementFailed"),
            text: i18n.t("messages.WantToReschedule"),
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: i18n.t("messages.Yes"),
            cancelButtonText: i18n.t("messages.No"),
        }).then((result) => {
            if (result.value) {
                const loanPeriod = {}
                for (let p = 0; p < loan.matopts.length; p++) {
                    const period = loan.matopts[p];
                    loanPeriod[period.value] = period.name.replace("Weeks", i18n.t("messages.Weeks"));
                }
                Swal.mixin({
                    input: 'text',
                    confirmButtonText: i18n.t("buttons.Next") + ' &rarr;',
                    showCancelButton: true,
                    cancelButtonText: i18n.t("buttons.Cancel"),
                    progressSteps: ['1', '2']
                }).queue([
                    {
                        title: i18n.t("messages.LoanAmt"),
                        input: 'number'
                    },
                    {
                        title: i18n.t("messages.Maturity"),
                        input: 'select',
                        inputOptions: loanPeriod
                    }
                ]).then((result) => {
                    if (result.value) {
                        const resc = {
                            CLL_PK: loan.CLL_PK,
                            CLL_LOAN_WEEKS: result.value[1],
                            CLL_ACTUAL_LOAN: result.value[0],
                            CLL_DISBURSEMENT_DATE: moment(loan.CLL_DISBURSEMENT_DATE, 'DD/MM/YYYY').add(7, 'days').format('DD/MM/YYYY')
                        };
                        $scope.reschedules.push(resc);
                        Swal.fire({
                            title: i18n.t("messages.Done"),
                        });
                    }
                })  
            }
        })

    }
/******************************************
 Display village names
******************************************/
    //console.log(localStorage.getItem('statType'));
    var currVille = 0;
    if(localStorage.getItem('statType') != null){
        currVille = localStorage.getItem('statType');
    } else  if(localStorage.getItem('currentVillage') != null){
        currVille = localStorage.getItem('currentVillage');
    }

    myDB.T_VILLAGE_MASTER.get(null,function(results){
        $scope.selectVillage || ($scope.selectVillage = []); //init if null
        $scope.selectVillage.push({'name': '','value': ''});
        var cur_vill = localStorage.getItem('curr_village'); //global current village
        $scope.$apply(function(){
            $.each(results, function(ind, val){
                var keypair = {'name': val.VLM_NAME,'value': val.VLM_PK};

                $scope.selectVillage.push(keypair);

                if(currVille!=null && currVille!= undefined && currVille == val.VLM_PK){
                    $scope.sf.CLT_VILLAGE = keypair;
                }
            });
        });
    });


    //POPUP-SIGNATURE
    $scope.emitLoadSignature = function(signee, type){
        console.log('emitting');
        console.log(signee);
        console.log(type);
        $rootScope.$emit('loadSignature', signee, type);
    }
    $rootScope.$on('signatureDone', function(event, data) {
        console.log('signature done');
        console.log(data);
        $scope.updateImg(data.signee, data.type, data.dsrc);
    });

    $scope.updateImg = function(signee, type, dsrc){

        console.log('updating img');
        console.log(signee);
        console.log(type);
        console.log(dsrc);

        var data = $sigdiv.jSignature('getData', 'image'); 

        var blob = btoa(dsrc);
        var ratio = canvas.height / 200;

        ht = canvas.height / ratio;

        var img2 = new Image();
        img2.onload = (function(){
            if(type == null || type == 'client'){ 
                var canv = $('#the-canvas-'+signee.CLT_PK)[0];
                $scope.$apply(function(){
                    signee.hasSigned = true;
                    var cmd1 = "UPDATE T_CLIENT SET CLT_SIGNATURE ='"+blob+"' WHERE CLT_PK = "+signee.CLT_PK;
                    myDB.execute(cmd1,function(res){

                    });
                })

                $scope.signingclientIndex = null;
                
            } else if(type === 'officer'){
                var canv = $('#the-canvas-officer')[0];
                $scope.$apply(function(){
                    $scope.user.hasSigned = true;
                    $scope.user.Signature = blob;
                })

                var cmd1 = "UPDATE T_USER SET USER_SIGNATURE ='"+blob+"' , USER_HAVE_SIGNATURE='Y' WHERE USER_PK = "+$scope.user.userPK;

                myDB.execute(cmd1, function(res){
                });

            } else if(type === 'mgr'){
                var canv = $('#the-canvas-mgr')[0];
                $scope.$apply(function(){
                    $scope.MGR.hasSigned = true;
                    $scope.MGR.Signature = blob;
                });

                var cmd1 = "UPDATE T_USER SET USER_SIGNATURE ='"+blob+"' , USER_HAVE_SIGNATURE='Y' WHERE USER_PK = "+$scope.MGR.mgrpk;

                myDB.execute(cmd1, function(res){

                    sessionStorage.setItem("MGR_HAVE_SIG","Y");
                    sessionStorage.setItem("MGR_SIG",blob);

                });
            } else if (type === 'ctr_lead'){
                var canv = $('#the-canvas-ctr_lead')[0];
                $scope.$apply(function(){
                    $scope.ctr_lead.hasSigned = true;
                    $scope.ctr_lead.Signature = blob;
                })
            } else if (type === 'witness') { 
                var canv = $('#the-canvas-'+$scope.witnesses.witness_pk)[0];
                $scope.$apply(function(){
                    $scope.witnesses.hasSigned = true;
                    $scope.witnesses.Signature = blob;
                })
            } else if (type == 'grp_lead'){
                var canv = $('#the-canvas-grp_lead')[0];
                $scope.$apply(function(){
                    $scope.grp_lead.hasSigned = true;
                    $scope.grp_lead.Signature = blob;
                })
            } else if (type === 'family') {
                var canv = $('#the-canvas-family')[0];
                $scope.$apply(function(){
                    $scope.familyMember.hasSigned = true;
                    $scope.familyMember.Signature = blob;
                });
            }
            
            if($scope.signingclientIndex != null || type == 'grp_lead' || type == 'ctr_lead' || type.indexOf("witness") > -1){

                var SIG_CLT_PK = "";
                if($scope.signingclientIndex != null){
                    SIG_CLT_PK = $scope.applicantdata.CLT_PK;
                } else if (type == 'grp_lead'){
                    SIG_CLT_PK = $scope.grp_lead.grp_lead_pk;
                } else if (type == 'ctr_lead') {
                    SIG_CLT_PK = $scope.ctr_lead.ctr_lead_pk;
                } else if (type.indexOf("witness") > -1) {
                    SIG_CLT_PK = $scope.witnesses.witness_pk;
                }
                
                var cmd1 = "UPDATE T_CLIENT SET CLT_SIGNATURE ='"+blob+"' WHERE CLT_PK = "+SIG_CLT_PK;
                myDB.execute(cmd1, function(res){
                    if($scope.signingclientIndex !== null) $scope.signingclientIndex = null;
                });
            }

            $scope.clearSigPad();
            var cont = canv.getContext("2d");
            cont.drawImage(img2, 0, 0, 300, 150);
            $scope.showSign = false;
            $scope.$apply();
        });

        img2.src = dsrc;
    }

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
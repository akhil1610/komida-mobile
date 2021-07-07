/******************************************
 Global variables
******************************************/
  var   clientpk    = sessionStorage.getItem("CLIENT_ID"),
        loanpk      = sessionStorage.getItem("LOAN_ID"),
        loanstatus  = sessionStorage.getItem("LOAN_STATUS"),
        secondreview = false,
        editmode     = sessionStorage.getItem("EVALMODE");

var USER_PK = sessionStorage.getItem("USER_PK");
var USER_NAME = sessionStorage.getItem("USER_NAME");
var USER_HAVE_SIG = sessionStorage.getItem("USER_HAVE_SIG");
var USER_SIG = (sessionStorage.getItem("USER_SIG") === null ? '' : sessionStorage.getItem("USER_SIG"));
var USER_SIGNED = (sessionStorage.getItem("USER_HAVE_SIG_TEST") == 'Y' ? true : false);
var BRC_PK = sessionStorage.getItem("BRC_PK");
var BRC_NAME = sessionStorage.getItem("BRC_NAME");
var BRC_PHONE = sessionStorage.getItem("BRC_PHONE");
var CMP_NAME = sessionStorage.getItem("CMP_NAME");

var BRC_BRANCH_ID = sessionStorage.getItem("BRC_BRANCH_ID");
var USER_ID = sessionStorage.getItem("USER_ID");
var USER_CTR_ID = sessionStorage.getItem("USER_CTR_ID");
var USER_CTR_NAME = sessionStorage.getItem("USER_CTR_NAME");
/******************************************
 Controller
******************************************/

var myApp = angular.module('myApp',['ng-currency', 'pascalprecht.translate']);

myApp.config(function ($translateProvider) {

    $translateProvider.useStaticFilesLoader({
        prefix: "locales/locale-",
        suffix: ".json"
    });

    $translateProvider.preferredLanguage(ln.language.code);

}); 

myApp.controller("clientCtrl", function($scope,$filter,$timeout,$rootScope){

    
    $scope.maxPrdTxn_CPT_PK = 0;
    $scope.BRC_PK = 0;

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
        Signature: USER_SIG,
        hasSigned: false
    };

    $scope.today = moment().format('DD/MM/YYYY/')

    $scope.clientinfo = null;
    $scope.loaninfo = null;
    $scope.repays = [];
    $scope.financestatus = 'NOT PAID';
    $scope.createdate = '';
        
    $scope.loans = [];
    $scope.voluntarySavings = {
        CPM_PRM_BALANCE: 0,
        WITHDRAWAL_AMT: 0
    };
    $scope.mandatorySavings = {
        CPM_PRM_BALANCE: 0,
        WITHDRAWAL_AMT: 0
    };
    $scope.pensionSavings = {
        CPM_PRM_BALANCE: 0,
        WITHDRAWAL_AMT: 0
    };
    $scope.feastdaySavings = {
        CPM_PRM_BALANCE: 0,
        WITHDRAWAL_AMT: 0
    };
    $scope.totalsavings = 0;
    $scope.refundable = 0;

    $scope.er_otherloaninstitue = 0;
    $scope.er_nohusbandpermission = 0;
    $scope.er_bankrupt = 0;
    $scope.er_sick = 0;
    $scope.er_movinghouse = 0;
    $scope.er_badbusiness = 0;
    $scope.er_higherloanfromotherinstitution = 0;
    $scope.er_unhappywithproduct = 0;
    $scope.er_groupout = 0;
    $scope.er_noneedloanagain = 0;
    $scope.er_unhappywithservice = 0;
    $scope.er_groupdisband = 0;
    $scope.er_needmoneywithdrawmansaving = 0;
    $scope.er_unhappywithregreq = 0;
    $scope.er_conflictwithmember = 0;
    $scope.er_conflictwithgroupleader = 0;
    $scope.er_uncomfortableingroup = 0;
    $scope.er_unabletoattendcenter = 0;

    $scope.ik_centerattendanceproblem = 0;
    $scope.ik_parchangeaddress = 0;
    $scope.ik_passaway = 0;
    $scope.ik_arreas= 0;
    $scope.ik_indobluecollarworkers = 0;

    $scope.reason = '';

    $scope.getBrcPK = function(){
        var cm = "SELECT BRC_PK FROM T_BRANCH";
        myDB.execute(cm, function(results){
            if(results.length<=0) return false;
            else{
                $scope.BRC_PK = results[0].BRC_PK;
            }
        });
    }

    $scope.getMaxCPT = function(){
        var cm = "SELECT MAX(CPT_PK) as MAX_CPTPK FROM T_CLIENT_PRD_TXN";
        myDB.execute(cm, function(results){
            if(results.length<=0) return false;
            else{
                for(var k in results){
                    $scope.maxPrdTxn_CPT_PK = results[k].MAX_CPTPK + 1;
                }  
            }
        });
    }

    $scope.totalSavings = function(){
        var totalsavings = 0;
        var voluntarySavings = 0;
        var mandatorySavings = 0;
        var pensionSavings = 0;
        var feastdaySavings = 0;

        if($scope.voluntarySavings != null) voluntarySavings = $scope.voluntarySavings.CPM_PRM_BALANCE;
        if($scope.mandatorySavings != null) mandatorySavings = $scope.mandatorySavings.CPM_PRM_BALANCE;
        if($scope.pensionSavings != null) pensionSavings = $scope.pensionSavings.CPM_PRM_BALANCE;
        if($scope.feastdaySavings != null) feastdaySavings = $scope.feastdaySavings.CPM_PRM_BALANCE;

        totalsavings = parseFloat(voluntarySavings) + parseFloat(mandatorySavings) + parseFloat(pensionSavings) + parseFloat(feastdaySavings);

        return totalsavings;
    };

    $scope.getVoluntarySavings = function(clientpk){
        var p = new Promise(function(suc, rej) {
            myDB.execute("SELECT *, CAST(CPM_PRM_BALANCE as INT) - CAST(PRM_CLOSING_CHARGES as int) as   WITHDRAWAL_AMT  FROM T_CLIENT_PRODUCT_MAPPING LEFT JOIN T_PRODUCT_MASTER ON (CPM_PRM_PK = PRM_PK) WHERE CPM_PRM_PK=74 AND CPM_CLT_PK ="+clientpk,function(res){
                console.log(res[0]);
                suc(res[0]);
            });
        });
        return p;
    };

    $scope.getMandatorySavings = function(clientpk){
        var p = new Promise(function(suc, rej) {
            myDB.execute("SELECT *, CAST(CPM_PRM_BALANCE as INT) - CAST(PRM_CLOSING_CHARGES as int) as   WITHDRAWAL_AMT  FROM T_CLIENT_PRODUCT_MAPPING LEFT JOIN T_PRODUCT_MASTER ON (CPM_PRM_PK = PRM_PK) WHERE CPM_PRM_PK=73 AND CPM_CLT_PK ="+clientpk,function(res){
                suc(res[0]);
            });
        });
        return p;
    };

    $scope.getPensionSavings = function(clientpk){
        var p = new Promise(function(suc, rej) {
            myDB.execute("SELECT *, CAST(CPM_PRM_BALANCE as INT) - CAST(PRM_CLOSING_CHARGES as int) as   WITHDRAWAL_AMT  FROM T_CLIENT_PRODUCT_MAPPING LEFT JOIN T_PRODUCT_MASTER ON (CPM_PRM_PK = PRM_PK) WHERE CPM_PRM_PK=75 AND CPM_CLT_PK ="+clientpk,function(res){
                suc(res[0]);
            });
        });
        return p;
    };

    $scope.getFeastdaySavings = function(clientpk){
        var p = new Promise(function(suc, rej) {
            myDB.execute("SELECT *, CAST(CPM_PRM_BALANCE as INT) - CAST(PRM_CLOSING_CHARGES as int) as   WITHDRAWAL_AMT  FROM T_CLIENT_PRODUCT_MAPPING LEFT JOIN T_PRODUCT_MASTER ON (CPM_PRM_PK = PRM_PK) WHERE CPM_PRM_PK=77 AND CPM_CLT_PK ="+clientpk,function(res){
                console.log('feast') 
                console.log(res) 
                if (res.length == 0){
                    suc({
                        CPM_PRM_BALANCE: 0,
                        WITHDRAWAL_AMT: 0
                    })
                } else {
                    suc(res[0]);
                }
            });
        });
        return p;
    };

    $scope.getClient = function(cltpk) {
        myDB.execute("SELECT * FROM T_CLIENT LEFT JOIN T_CENTER_MASTER ON (CTR_PK = CLT_CENTER_ID)  WHERE CLT_PK=" + cltpk+ "  ", function(results){
            console.log('client');
            console.log(results);
            if(results.length == 0) return false;
            $scope.setClientInfo(results[0]);
        });
    }
    $scope.getLoans = function(cltpk){
        myDB.execute("SELECT *, 'NOT PAID' as LOANPAID FROM T_CLIENT_LOAN LEFT JOIN T_LOAN_TYPE ON (CLL_LTY_PK = LTY_PK)  WHERE CLL_CLT_PK=" + cltpk+ " AND CLL_STATUS != 9 ORDER BY CLL_STATUS ",function(results){
            console.log('loans');
            console.log(results);
            console.log(results.length);
            if(results.length > 0) {
                $scope.setLoansAndGetPks(results);
            }
            $scope.setLoaninfo(results[0]);
        });
    }

    $scope.getAllProducts = function(cltpk){
        Promise.all([
            $scope.getVoluntarySavings(cltpk),
            $scope.getMandatorySavings(cltpk),
            $scope.getPensionSavings(cltpk),
            $scope.getFeastdaySavings(cltpk)])
            .then( function(val) {
                $scope.voluntarySavings = val[0];
                $scope.mandatorySavings = val[1];
                $scope.pensionSavings = val[2]; 
                $scope.feastdaySavings = val[3];
            });
    }

    $scope.allPaid = function(){
        var paidCount = 0;
        for (let l = 0; l < $scope.loans.length; l++) {
            const loan = $scope.loans[l];
            if (loan.LOANPAID == 'PAID') {
                paidCount ++ ;
            }
        }
        return paidCount == $scope.loans.length;
    }

    $scope.allSigned = function(){
        return ($scope.clientinfo.hasSigned && $scope.user.hasSigned);
    }

    $scope.getClient(clientpk);
    $scope.getLoans(clientpk);
    $scope.getAllProducts(clientpk);
    // $scope.getVoluntarySavings(clientpk);
    // $scope.getMandatorySavings(clientpk);
    // $scope.getPensionSavings(clientpk);
    // $scope.getFeastdaySavings(clientpk);

    $scope.totalRefund = function() {
        var vol = 0;
        var man = 0;
        var pen = 0;
        var fea = 0; 

        if($scope.voluntarySavings !== undefined && !isNaN($scope.voluntarySavings.WITHDRAWAL_AMT)) {
            vol = parseInt($scope.voluntarySavings.WITHDRAWAL_AMT);
        }
        if($scope.mandatorySavings !== undefined && !isNaN($scope.mandatorySavings.WITHDRAWAL_AMT)){
            man = parseInt($scope.mandatorySavings.WITHDRAWAL_AMT);
        }
        if($scope.pensionSavings !== undefined && !isNaN($scope.pensionSavings.WITHDRAWAL_AMT)){
            pen = parseInt($scope.pensionSavings.WITHDRAWAL_AMT);
        }
        if($scope.feastdaySavings !== undefined && !isNaN($scope.feastdaySavings.WITHDRAWAL_AMT)){
            fea = parseInt($scope.feastdaySavings.WITHDRAWAL_AMT);
        }

        return vol + man + pen + fea;
    }
    
    $scope.getRepays = function(loanPks){
        var query = "SELECT *, CRS_EXP_PROFIT_AMT as ORI_EXP_PROFIT_AMT FROM T_CLIENT_REPAY_SCHEDULE WHERE CRS_ATTENDED != 'Y' AND CRS_LOAN_SAVING_FLAG = 'L' AND CRS_CLL_PK IN ("+loanPks.join()+") ORDER BY CRS_ACTUAL_WEEK_NO";
        
        myDB.execute(query,function(res){
            console.log(query);
            console.log('getRepays');
            console.log(res);
            $scope.setRepays(res);
        });
    }

    $scope.setRepays = function(repays) {
        $scope.repays = [];
        for (let r = 0; r < repays.length; r++) {
            const repay = repays[r];
            $scope.repays.push(repay);
        }
        $scope.updateLoans();
        $scope.$apply();
    }

    $scope.updateLoans = function() {
        for (let l = 0; l < $scope.loans.length; l++) {
            const loan = $scope.loans[l];
            
            for (let r = 0; r < $scope.repays.length; r++) {
                const repay = $scope.repays[r];
                if (repay.CRS_CLL_PK == loan.CLL_PK){
                    $scope.loans[l].totalPrincipal += parseInt(repay.CRS_EXP_CAPITAL_AMT)
                    $scope.loans[l].totalInterest += parseInt(repay.CRS_EXP_PROFIT_AMT)
                }
            }

        }
    }
    
    $scope.setLoansAndGetPks = function(res) {
        console.log('getting loans and pks')
        var loanPks = [];
        if (res !== undefined && res !== null) {
            for (let l = 0; l < res.length; l++) {
                const loan = res[l];
                loan.showRepay = false;
                loan.totalPrincipal = 0;
                loan.totalInterest = 0;
                loanPks.push(loan.CLL_PK);
                $scope.loans.push(loan);
            }
            console.log($scope.loans); 
            $scope.getRepays(loanPks);
        }
    }
    $scope.setClientInfo = function(results){ //setClientInfo
        $scope.$apply(function() {

            var clientinfo = [];
            for(key in results){

                var res = results[key];
                if(res == null || res =='null') res = "-";

                clientinfo[key] = res;
            }

            $scope.clientinfo = clientinfo;
            $scope.clientinfo.CLT_CENTER_ID = parseInt($scope.clientinfo.CLT_CENTER_ID);
            $scope.createdDate = clientinfo.CLT_CREATED_DATE.split(" ")[0];
            $scope.clientinfo.CLT_BIRTHDATE = $scope.prepDate($scope.clientinfo.CLT_DOB);
            $scope.clientinfo.CLT_MOTHER_BIRTHDATE = $scope.prepDate($scope.clientinfo.CLT_MOTHER_DOB);
        });
    };

    $scope.setLoaninfo = function(results) {
        $scope.$apply(function() {

            var loaninfo = [];
            for(key in results){

                var res = results[key];
                if(res == null || res =='null') res = "-";
                if ( key.indexOf('CLL_') != -1) {
                    loaninfo[key] = res;
                }
            }
            $scope.loaninfo = loaninfo;
            if($scope.loaninfo.CLL_LOAN_CYCLE == '-') $scope.loaninfo.CLL_LOAN_CYCLE = 1;

        });
        
    }


    $scope.isFutureDate = function(date){
        return moment(date) > moment();
    }

    $scope.totalLoanRepayable = function(loan) {
        var total = 0;
        for (let r = 0; r < $scope.repays.length; r++) {
            const repay = $scope.repays[r];
            if (repay.CRS_CLL_PK == loan.CLL_PK){
                total += parseInt(repay.CRS_EXP_CAPITAL_AMT);
                total += parseInt(repay.CRS_EXP_PROFIT_AMT);
            }
        }
        return total;
    }

    $scope.calculateDue = function() {
        var amounts = {
            principal: 0,
            interest: 0
        };
        for (let r = 0; r < $scope.repays.length; r++) {
            const repay = $scope.repays[r];
            if (!$scope.isFutureDate(repay.CRS_DATE)){
                amounts.interest += parseInt(repay.CRS_EXP_PROFIT_AMT);
                amounts.principal += parseInt(repay.CRS_EXP_CAPITAL_AMT);
            }
        }
        return amounts;
    }

    $scope.calculateNotDue = function() {
        var amounts = {
            principal: 0,
            interest: 0
        };
        for (let r = 0; r < $scope.repays.length; r++) {
            const repay = $scope.repays[r];
            if ($scope.isFutureDate(repay.CRS_DATE)){
                amounts.interest += parseInt(repay.CRS_EXP_PROFIT_AMT);
                amounts.principal += parseInt(repay.CRS_EXP_CAPITAL_AMT);
            }
        }
        return amounts;
    }

    $scope.calculateTotalInterest = function() {
        var total = 0;
        for (let l = 0; l < $scope.loans.length; l++) {
            const loan = $scope.loans[l];
            total += parseInt(loan.totalInterest);
        }
        return total;
    }

    $scope.saveExitForm = function() {

        $scope.createClientExit()
            .then(function(created) { 
                Promise.all([
                    $scope.closeMandatory(),
                    $scope.closeVoluntary(),
                    $scope.closePension(),
                    $scope.closeFeast(),
                    $scope.closeLoans(),
                    $scope.closeClients(),
                    $scope.updateRepays()
                ]).then(function(val) { 
                    swal({
                        title: i18n.t("messages.AlertSuccess"),
                        text: i18n.t("messages.ClientExitSuccess"),
                        type: 'success',
                        confirmButtonColor: "#80C6C7",
                        confirmButtonText: "Ok",
                        closeOnConfirm: true
                    })
                })
            });
    }

    $scope.prepareReceipt = function() {
        console.log('preparing receipt');
        var nextLine = "\n";
        var breakLine = "\n\n";
        var msg = '';
        msg += nextLine;
        msg += i18n.t("messages.ClientExit");
        msg += breakLine;
        msg += i18n.t("messages.FullName") + ": " + $scope.clientinfo.CLT_FULL_NAME;
        msg += nextLine;
        msg += i18n.t("messages.ClientID") + ": " + $scope.clientinfo.CLT_CLEINT_ID;
        msg += nextLine;
        msg += i18n.t("messages.GroupID") + ": " + $scope.clientinfo.CLT_GROUP_ID;
        msg += nextLine;
        msg += i18n.t("messages.Center") + ": " + $scope.clientinfo.CTR_CENTER_ID;
        msg += nextLine;
        msg += i18n.t("messages.HusbandName") + ": " + $scope.clientinfo.CLT_HB_NAME;
        msg += nextLine;
        msg += i18n.t("messages.RegistrationDate") + ": " + moment($scope.clientinfo.createdDate).format('DD/MM/YYYY');
        msg += "\n\n";
        
        for (let l = 0; l < $scope.loans.length; l++) {
            const loan = $scope.loans[l];
            msg += i18n.t("messages.LoanType") + ": " + i18n.t("LOANS."+loan.LTY_DESCRIPTION).toUpperCase();
            msg += nextLine;
            msg += i18n.t("messages.FinanceTypes") + ": " + loan.CLL_LOAN_NUMBER;
            msg += nextLine;
            
            msg += i18n.t("messages.LoanCycle") + ": " + loan.CLL_LOAN_CYCLE;
            msg += nextLine;

            // msg += i18n.t("messages.FinancingStatus") + ": " + loan.LOANPAID;
            // msg += nextLine;

            msg += i18n.t("messages.AmountOfFinancing") + ": Rp " + parseInt(loan.CLL_ACTUAL_LOAN);
            msg += nextLine;

            msg += i18n.t("messages.Principal") + ": Rp " + parseInt(loan.totalPrincipal);
            msg += nextLine;

            msg += i18n.t("messages.Interest") + ": Rp " + parseInt(loan.totalInterest);
            msg += nextLine;

            msg += i18n.t("messages.TotalPayable") + ": Rp " + parseInt($scope.totalLoanRepayable(loan));

            if ( l == $scope.loans.length -1 ) {
                msg += breakLine;
            }

        }

        if ($scope.voluntarySavings) {
            msg += $scope.getSavingFromHTML('#volsaving') + ": ";
            msg += nextLine;
            msg += "   " + i18n.t("messages.Balance") + ": Rp " + parseInt($scope.voluntarySavings.CPM_PRM_BALANCE);
            msg += nextLine;
            msg += "   " + i18n.t("messages.ClosingAmt") + ": Rp " + (parseInt($scope.voluntarySavings.CPM_PRM_BALANCE) - parseInt($scope.voluntarySavings.WITHDRAWAL_AMT));
            msg += nextLine;
            msg += "   " + i18n.t("messages.WithdrawalAmt") + ": Rp " + parseInt($scope.voluntarySavings.WITHDRAWAL_AMT);
            msg += breakLine;
        }

        
        if ($scope.mandatorySavings) { 
            msg += $scope.getSavingFromHTML('#mansaving') + ": ";
            msg += nextLine;
            msg += "   " + i18n.t("messages.Balance") + ": Rp " + parseInt($scope.mandatorySavings.CPM_PRM_BALANCE);
            msg += nextLine;
            msg += "   " + i18n.t("messages.ClosingAmt") + ": Rp " + (parseInt($scope.mandatorySavings.CPM_PRM_BALANCE) - parseInt($scope.mandatorySavings.WITHDRAWAL_AMT));
            msg += nextLine;
            msg += "   " + i18n.t("messages.WithdrawalAmt") + ": Rp " + parseInt($scope.mandatorySavings.WITHDRAWAL_AMT);
            
            msg += breakLine; 
        }

        if ($scope.pensionSavings) {
            msg += $scope.getSavingFromHTML('#pensaving') + ": ";
            msg += nextLine;
            msg += "   " + i18n.t("messages.Balance") + ": Rp " + parseInt($scope.pensionSavings.CPM_PRM_BALANCE);
            msg += nextLine;
            msg += "   " + i18n.t("messages.ClosingAmt") + ": Rp " + (parseInt($scope.pensionSavings.CPM_PRM_BALANCE) - parseInt($scope.pensionSavings.WITHDRAWAL_AMT));
            msg += nextLine;
            msg += "   " + i18n.t("messages.WithdrawalAmt") + ": Rp " + parseInt($scope.pensionSavings.WITHDRAWAL_AMT); 

            msg += breakLine;
        }


        if ($scope.feastdaySavings) {
            msg += $scope.getSavingFromHTML('#feastsaving') + ": ";
            msg += nextLine;
            msg += "   " + i18n.t("messages.Balance") + ": Rp " + parseInt($scope.feastdaySavings.CPM_PRM_BALANCE);
            msg += nextLine;
            msg += "   " + i18n.t("messages.ClosingAmt") + ": Rp " + (parseInt($scope.feastdaySavings.CPM_PRM_BALANCE) - parseInt($scope.feastdaySavings.WITHDRAWAL_AMT));
            msg += nextLine;
            msg += "   " + i18n.t("messages.WithdrawalAmt") + ": Rp " + parseInt($scope.feastdaySavings.WITHDRAWAL_AMT);
            
            msg += breakLine;
        }

        msg += i18n.t("messages.TotalRefundable") + ": " + parseInt($scope.totalRefund());
        msg += nextLine;

        msg += i18n.t("messages.Information") + ": " + $scope.reason;
        msg += nextLine;

        msg += i18n.t("messages.ExitReason") + ": ";
        msg += nextLine;

        if ( $scope.er_otherloaninstitue == 1) {
            msg += "   " + i18n.t("messages.ThereIsOtherInst") + " ";
            msg += nextLine;
        }
        if ( $scope.er_nohusbandpermission == 1) {
            msg += "   " + i18n.t("messages.NoHusbandPermission") + " ";
            msg += nextLine;
        }
        if ( $scope.er_bankrupt == 1) {
            msg += "   " + i18n.t("messages.Bankrupt") + " ";
            msg += nextLine;
        }
        if ( $scope.er_sick == 1) {
            msg += "   " + i18n.t("messages.Sick") + " ";
            msg += nextLine;
        }
        if ( $scope.er_movinghouse == 1) {
            msg += "   " + i18n.t("messages.MovingHouse") + " ";
            msg += nextLine;
        }
        if ( $scope.er_badbusiness == 1) {
            msg += "   " + i18n.t("messages.BadBusiness") + " ";
            msg += nextLine;
        }
        if ( $scope.er_higherloanfromotherinstitution == 1) {
            msg += i18n.t("messages.LoanFromOthInst") + " ";
            msg += nextLine;
        }
        if ( $scope.er_groupout == 1) {
            msg += "   " + i18n.t("messages.GroupAskOut") + " ";
            msg += nextLine;
        }
        if ( $scope.er_unhappywithservice == 1) {
            msg += "   " + i18n.t("messages.UnhappyService") + " ";
            msg += nextLine;
        }
        if ( $scope.groupdisband == 1) {
            msg += "   " + i18n.t("messages.GroupDisbandedExit") + " ";
            msg += nextLine;
        }
        if ( $scope.er_needmoneywithdrawmansaving == 1) {
            msg += "   " + i18n.t("messages.NeedingMoney") + " ";
            msg += nextLine;
        }
        if ( $scope.er_unhappywithregreq == 1) {
            msg += "   " + i18n.t("messages.UnhappyRegulation") + " ";
            msg += nextLine;
        }
        if ( $scope.er_conflictwithmember == 1) {
            msg += "   " + i18n.t("messages.GroupMemberConflict") + " ";
            msg += nextLine;
        }
        if ( $scope.er_conflictwithgroupleader == 1) {
            msg += "   " + i18n.t("messages.GroupLeaderConflict") + " ";
            msg += nextLine;
        }
        if ( $scope.er_uncomfortableingroup == 1) {
            msg += "   " + i18n.t("messages.GroupUncomfortable") + " ";
            msg += nextLine;
        }
        if ( $scope.er_unabletoattendcenter == 1) {
            msg += "   " + i18n.t("messages.UnableToAttendMeeting") + " ";
            msg += nextLine;
        }
        if ( $scope.ik_centerattendanceproblem == 1) {
            msg += "   " + i18n.t("messages.AttendanceProblem") + " ";
            msg += nextLine;
        }
        if ( $scope.ik_parchangeaddress == 1) {
            msg += "   " + i18n.t("messages.ChangeOfAddress") + " ";
            msg += nextLine;
        }
        if ( $scope.ik_passaway == 1) {
            msg += "   " + i18n.t("messages.PassAway") + " ";
            msg += nextLine;
        }
        if ( $scope.ik_arreas == 1) {
            msg += "   " + i18n.t("messages.InstallmentProblem") + " ";
            msg += nextLine;
        }
        if ( $scope.ik_indobluecollarworkers == 1) {
            msg += "   " + i18n.t("messages.BeingWorker") + " ";
            msg += nextLine;
        }
        
        msg += breakLine;

        msg += moment().format();

        return msg;
    }

    $scope.printReceipt = function() {
        console.log('printing receipt');
        var msg = $scope.prepareReceipt();
        console.log('get msg');
        console.log(msg);
        var canPrint = true;
        console.log(canPrint);
        if(canPrint) {
            let company = ""; //no using
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
        } else {
            console.log(msg);
        }
    }

    $scope.goBackClientPage = function () {
       window.location.href="client.html"; 
    }

    $scope.getSavingFromHTML = function(id) {
        return $(id).html().split('</b>')[1].trim()
    }

    $scope.checkZeroRepayValue = function(r,val){
        if (val == undefined || val == null || val == '' || isNaN(val)){
            $scope.repays[r].CRS_EXP_PROFIT_AMT = 0;
        }
    }

    $scope.checkZeroSavingValue = function(type,val){
        if (val == undefined || val == null || val == '' || isNaN(val)){
            if ( type == 'vol') $scope.voluntarySavings.WITHDRAWAL_AMT = 0; 
            if ( type == 'man') $scope.mandatorySavings.WITHDRAWAL_AMT = 0; 
            if ( type == 'pen') $scope.pensionSavings.WITHDRAWAL_AMT = 0; 
            if ( type == 'fea') $scope.feastdaySavings.WITHDRAWAL_AMT = 0; 
        }
    }

    $scope.updateRepays = function(){
        var commands = [];
        var query = "UPDATE T_CLIENT_REPAY_SCHEDULE SET " +
                    " CRS_ATTENDED='Y'"+  
                    ", CRS_REASON='EXIT'"+ 
                    ", CRS_CREATED_BY="+USER_PK+
                    ", CRS_CREATED_DATE='"+moment().format("DD/MM/YYYY HH:mm:ss")+"'"+
                    ", CRS_RECP_STATUS='Y'" +
                    ", CRS_ACT_CAPITAL_AMT = '0' " +
                    ", CRS_ACT_PROFIT_AMT = '0' " +
                    "WHERE CRS_LOAN_SAVING_FLAG='S' AND CRS_DATE ='" + moment().format("DD/MM/YYYY") + "'" +
                    "AND CRS_CLT_PK=" + $scope.clientinfo.CLT_PK;
        commands.push(query);
        for (let r = 0; r < $scope.repays.length; r++) {
            const repay = $scope.repays[r];
            query = "UPDATE T_CLIENT_REPAY_SCHEDULE SET "+
                    " CRS_ATTENDED='Y'"+ 
                    ", CRS_COLLECTION_WEEK_NO =" + repay.CRS_ACTUAL_WEEK_NO+
                    ", CRS_DATE='"+moment().format("DD/MM/YYYY")+"'"+
                    ", CRS_REASON='EXIT'"+ 
                    ", CRS_CREATED_BY="+USER_PK+
                    ", CRS_CREATED_DATE='"+moment().format("DD/MM/YYYY HH:mm:ss")+"'"+
                    ", CRS_RECP_STATUS='Y'"+
                    ", CRS_ACT_CAPITAL_AMT = CRS_EXP_CAPITAL_AMT " +
                    ", CRS_ACT_PROFIT_AMT='"+ repay.CRS_EXP_PROFIT_AMT + "'" +
                    " WHERE CRS_PK ="+repay.CRS_PK;

            commands.push(query);
        }
 
        var p = new Promise(function(suc, rej) {
            if(commands.length>0){

                myDB.dbShell.transaction(function(tx3){
                    for(c in commands){ 
                        console.log(commands[c]);
                        tx3.executeSql(commands[c]);
                    }
                }, function(err){
                    printLog("error encountered ");
                    printLog(err);
                    swal("An error encountered when updating repay.");
                    return false;
                }, function(succ){
                    console.log('done');
                    suc(true);
                    $scope.$apply();
                });
            }
        })
        return p;
    }

    $scope.closeClients = function(){
        /**
         *  if client is the last member and  group leader,
         * 
         *  his leader status haven't clear in previous process
         *  need to handle this situation here
         *  
         * for this reason, we are setting "CLT_IS_GROUP_LEADER='N'" here. * 
         * just for compatible with previous behaviour
         * 
        **/ 
        var query = "UPDATE T_CLIENT SET CLT_STATUS = 9, CLT_IS_GROUP_LEADER='N' WHERE CLT_PK="+$scope.clientinfo.CLT_PK;
        var p = new Promise(function(suc, rej) {
            console.log(query);
            myDB.execute(query, function(){
                suc(true)
            })
        })
        return p;
    }

    $scope.closeLoans = function(){
        var query = "UPDATE T_CLIENT_LOAN SET CLL_OUTSTANDING = '0', CLL_STATUS = 9 WHERE CLL_CLT_PK="+$scope.clientinfo.CLT_PK;
        var p = new Promise(function(suc, rej) {
            console.log(query);
            myDB.execute(query, function(){
                suc(true)
            })
        })
        return p;
    }

    $scope.closeMandatory = function(){

        var balance = $scope.mandatorySavings.CPM_PRM_BALANCE;
        var withdrawal = $scope.mandatorySavings.WITHDRAWAL_AMT;
        var closing = parseInt($scope.mandatorySavings.CPM_PRM_BALANCE) - parseInt($scope.mandatorySavings.WITHDRAWAL_AMT);

        var query = "INSERT INTO T_CLIENT_CLOSE_PRODUCTS VALUES(null,"+ 
                "0, " + // "CCP_PK BIGINT NOT NULL, "+
                $scope.clientinfo.CLT_PK + ", " +// "CCP_PK_CLT_PK BIGINT NOT NULL, "+
                "'" + $scope.mandatorySavings.CPM_PRM_ACC_NUMBER + "', " +// "CCP_PK_ACCOUNT_NUMBER CHARACTER VARYING(1000), "+
                "'" + balance + "', " +// "CCP_PK_BALANCE_AMT CHARACTER VARYING(1000), "+
                "'" + withdrawal + "', " +// "CCP_PK_WITHDRAWAL_AMT CHARACTER VARYING(1000), "+
                "'" + closing + "', " +// "CCP_PK_CLOSING_AMT CHARACTER VARYING(1000), "+
                "8, " +// "CCP_PK_STATUS INTEGER, "+
                USER_PK + ", " +// "CCP_PK_CREATED_BY INTEGER NOT NULL, "+
                "'" + moment().format("DD/MM/YYYY HH:mm:ss") + "', " +// "CCP_PK_CREATED_DATE TIMESTAMP WITHOUT TIME ZONE NOT NULL, "+
                "0, " + // "CCP_PK_EXT_STATUS INTEGER, "+
                "0, " + // "CCP_PK_FUP_PK BIGINT, "+
                "0) " ; // "CCP_PK_RECON_FUP_PK BIGINT");
        var p = new Promise(function(suc, rej) {
            console.log(query);
            myDB.execute(query, function(){
                $scope.createWithdrawal($scope.mandatorySavings, withdrawal)
                    .then(function(v){
                        suc(true)
                    });
            })
        })
        return p;
    }

    $scope.closeVoluntary = function(){

        var balance = $scope.voluntarySavings.CPM_PRM_BALANCE;
        var withdrawal = $scope.voluntarySavings.WITHDRAWAL_AMT;
        var closing = parseInt($scope.voluntarySavings.CPM_PRM_BALANCE) - parseInt($scope.voluntarySavings.WITHDRAWAL_AMT);

        var query = "INSERT INTO T_CLIENT_CLOSE_PRODUCTS VALUES(null,"+ 
                "0, " + // "CCP_PK BIGINT NOT NULL, "+
                $scope.clientinfo.CLT_PK + ", " +// "CCP_PK_CLT_PK BIGINT NOT NULL, "+
                "'" + $scope.voluntarySavings.CPM_PRM_ACC_NUMBER + "', " +// "CCP_PK_ACCOUNT_NUMBER CHARACTER VARYING(1000), "+
                "'" + balance + "', " +// "CCP_PK_BALANCE_AMT CHARACTER VARYING(1000), "+
                "'" + withdrawal + "', " +// "CCP_PK_WITHDRAWAL_AMT CHARACTER VARYING(1000), "+
                "'" + closing + "', " +// "CCP_PK_CLOSING_AMT CHARACTER VARYING(1000), "+
                "8, " +// "CCP_PK_STATUS INTEGER, "+
                USER_PK + ", " +// "CCP_PK_CREATED_BY INTEGER NOT NULL, "+
                "'" + moment().format("DD/MM/YYYY HH:mm:ss") + "', " +// "CCP_PK_CREATED_DATE TIMESTAMP WITHOUT TIME ZONE NOT NULL, "+
                "0, " + // "CCP_PK_EXT_STATUS INTEGER, "+
                "0, " + // "CCP_PK_FUP_PK BIGINT, "+
                "0) " ; // "CCP_PK_RECON_FUP_PK BIGINT");
        var p = new Promise(function(suc, rej) {
            console.log(query);
            myDB.execute(query, function(){
                $scope.createWithdrawal($scope.voluntarySavings, withdrawal)
                    .then(function(v){
                        suc(true)
                    });
            })
        })
        return p;
    }

    $scope.closePension = function(){

        var balance = $scope.pensionSavings.CPM_PRM_BALANCE;
        var withdrawal = $scope.pensionSavings.WITHDRAWAL_AMT;
        var closing = parseInt($scope.pensionSavings.CPM_PRM_BALANCE) - parseInt($scope.pensionSavings.WITHDRAWAL_AMT);

        var query = "INSERT INTO T_CLIENT_CLOSE_PRODUCTS VALUES(null,"+ 
                "0, " + // "CCP_PK BIGINT NOT NULL, "+
                $scope.clientinfo.CLT_PK + ", " +// "CCP_PK_CLT_PK BIGINT NOT NULL, "+
                "'" + $scope.pensionSavings.CPM_PRM_ACC_NUMBER + "', " +// "CCP_PK_ACCOUNT_NUMBER CHARACTER VARYING(1000), "+
                "'" + balance + "', " +// "CCP_PK_BALANCE_AMT CHARACTER VARYING(1000), "+
                "'" + withdrawal + "', " +// "CCP_PK_WITHDRAWAL_AMT CHARACTER VARYING(1000), "+
                "'" + closing + "', " +// "CCP_PK_CLOSING_AMT CHARACTER VARYING(1000), "+
                "8, " +// "CCP_PK_STATUS INTEGER, "+
                USER_PK + ", " +// "CCP_PK_CREATED_BY INTEGER NOT NULL, "+
                "'" + moment().format("DD/MM/YYYY HH:mm:ss") + "', " +// "CCP_PK_CREATED_DATE TIMESTAMP WITHOUT TIME ZONE NOT NULL, "+
                "0, " + // "CCP_PK_EXT_STATUS INTEGER, "+
                "0, " + // "CCP_PK_FUP_PK BIGINT, "+
                "0) " ; // "CCP_PK_RECON_FUP_PK BIGINT");
        var p = new Promise(function(suc, rej) {
            console.log(query);
            myDB.execute(query, function(){
                $scope.createWithdrawal($scope.pensionSavings, withdrawal)
                    .then(function(v){
                        suc(true)
                    });
            })
        })
        return p;
    }

    $scope.closeFeast = function(){
        if ($scope.feastdaySavings.CPM_PK == undefined) return false;
        var balance = $scope.feastdaySavings.CPM_PRM_BALANCE;
        var withdrawal = $scope.feastdaySavings.WITHDRAWAL_AMT;
        var closing = parseInt($scope.feastdaySavings.CPM_PRM_BALANCE) - parseInt($scope.feastdaySavings.WITHDRAWAL_AMT);

        var query = "INSERT INTO T_CLIENT_CLOSE_PRODUCTS VALUES(null,"+ 
                "0, " + // "CCP_PK BIGINT NOT NULL, "+
                $scope.clientinfo.CLT_PK + ", " +// "CCP_PK_CLT_PK BIGINT NOT NULL, "+
                "'" + $scope.feastdaySavings.CPM_PRM_ACC_NUMBER + "', " +// "CCP_PK_ACCOUNT_NUMBER CHARACTER VARYING(1000), "+
                "'" + balance + "', " +// "CCP_PK_BALANCE_AMT CHARACTER VARYING(1000), "+
                "'" + withdrawal + "', " +// "CCP_PK_WITHDRAWAL_AMT CHARACTER VARYING(1000), "+
                "'" + closing + "', " +// "CCP_PK_CLOSING_AMT CHARACTER VARYING(1000), "+
                "8, " +// "CCP_PK_STATUS INTEGER, "+
                USER_PK + ", " +// "CCP_PK_CREATED_BY INTEGER NOT NULL, "+
                "'" + moment().format("DD/MM/YYYY HH:mm:ss") + "', " +// "CCP_PK_CREATED_DATE TIMESTAMP WITHOUT TIME ZONE NOT NULL, "+
                "0, " + // "CCP_PK_EXT_STATUS INTEGER, "+
                "0, " + // "CCP_PK_FUP_PK BIGINT, "+
                "0) "; // "CCP_PK_RECON_FUP_PK BIGINT");
        var p = new Promise(function(suc, rej) {
            console.log(query);
            myDB.execute(query, function(){
                $scope.createWithdrawal($scope.feastdaySavings, withdrawal)
                    .then(function(v){
                        suc(true)
                    });
            })
        })
        return p;
    }

    $scope.createClientExit = function(){
        var amountDue = $scope.calculateDue();
        var amountNotDue = $scope.calculateNotDue();
        var totalInterest = $scope.calculateTotalInterest();
        var totalRefund = $scope.totalRefund();
        
        var query = "INSERT INTO T_CLIENT_EXIT_FORM VALUES(null,"+
                "0, "+// "CEF_PK BIGINT NOT NULL,"+
                $scope.clientinfo.CLT_PK + ", " + //CEF_CLT_PK BIGINT NOT NULL, "+
                BRC_PK + "," + // "CEF_BRANCH_PK BIGINT NOT NULL, "+
                "'" + amountDue.principal + "', " +// "CEF_DUE_PRINCIPAL VARCHAR(1000) NULL, "+
                "'" + amountDue.interest + "', " +// "CEF_DUE_INTEREST CHARACTER VARYING(1000), "+
                "'" + amountNotDue.principal + "', " +// "CEF_PRINCIPAL_NOT_DUE CHARACTER VARYING(1000), "+
                "'" + amountNotDue.interest + "', " +// "CEF_INTEREST_NOT_DUE CHARACTER VARYING(1000), "+
                "'" + totalInterest + "', " +// "CEF_INTEREST_BALANCE CHARACTER VARYING(1000), "+
                "'" + totalRefund + "', " +// "CEF_DISBUSEMENT_AMOUNT CHARACTER VARYING(1000), "+
                "null, " +// "CEF_ISWO INTEGER, "+
                "8, " +// "CEF_STATUS INTEGER, "+
                USER_PK + ", " + // "CEF_CREATED_BY INTEGER NOT NULL, "+
                "'" + moment().format("DD/MM/YYYY HH:mm:ss") + "', " +// "CEF_CREATED_DATE TIMESTAMP WITHOUT TIME ZONE NOT NULL, "+
                "1, " + // "CEF_APPROVED_BY_EDC INTEGER, "+
                $scope.er_otherloaninstitue+", " + // "CEF_OTHER_INSTITUTION_LOANS INTEGER, "+
                $scope.er_sick + ", " + // "CEF_SICK INTEGER, "+
                $scope.er_nohusbandpermission + ", " + // "CEF_NO_HUSBAND_PERMISSION INTEGER, "+
                $scope.er_movinghouse + ", " + // "CEF_MOVING_HOUSE INTEGER, "+
                $scope.er_bankrupt + ", " + // "CEF_BANKRUPT INTEGER, "+
                $scope.er_badbusiness + ", " + // "CEF_LOSS INTEGER, "+
                $scope.er_noneedloanagain + ", " + // "CEF_LARGER_LOANS INTEGER, "+
                $scope.er_unhappywithproduct + ", " + // "CEF_NOT_HAPPY_PRODUCT INTEGER, "+
                $scope.er_unhappywithservice + ", " + // "CEF_NOT_HAPPY_SERVICE INTEGER, "+
                $scope.er_unhappywithregreq + ", " + // "CEF_NOT_HAPPY_REGULATIONS INTEGER, "+
                "1, " + // "CEF_REQUEST_EXIT INTEGER, "+
                $scope.er_groupout + ", " + // "CEF_BROKE_UP INTEGER, "+
                $scope.er_conflictwithmember + ", " + // "CEF_MEMBER_CONFLICT INTEGER, "+
                $scope.er_conflictwithgroupleader + ", " + // "CEF_CHAIRPERSON_CONFLICT INTEGER, "+
                $scope.er_uncomfortableingroup +", " + // "CEF_UNCOMFORTABLE INTEGER, "+
                $scope.er_unabletoattendcenter + ", " + // "CEF_NOT_PRESENT INTEGER, "+
                $scope.er_noneedloanagain  +", " + // "CEF_DONT_NEED_LOAN INTEGER, "+
                $scope.er_needmoneywithdrawmansaving + ", " + // "CEF_NEED_MONEY INTEGER, "+
                $scope.ik_centerattendanceproblem + ", " + // "CEF_ATTENDANCE_PROBLEM INTEGER, "+
                $scope.ik_arreas + ", " + // "CEF_INSTALLMENT_PROBLEMS INTEGER, "+
                $scope.ik_centerattendanceproblem + ", " + // "CEF_MOVE_ADDRESS INTEGER, "+
                $scope.ik_indobluecollarworkers + ", " + // "CEF_EMPLOYMENT_OUT_OF_STATE INTEGER, "+
                $scope.ik_passaway + ", " + // "CEF_DIE INTEGER, "+
                "0, " + // "CEF_EXT_STATUS INTEGER, "+
                "0, " + // "CEF_FUP_PK BIGINT, "+
                "0, " + // "CEF_RECON_FUP_PK BIGINT, "+
                "'" + $scope.user.Signature + "', " + // "CEF_FO_SIGN CHARACTER VARYING(2000), "+
                "'" + $scope.clientinfo.Signature + "', " + // "CEF_CLIENT_SIGN CHARACTER VARYING(2000), "+
                "'" + $scope.reason + "') "; // "CEF_REASON CHARACTER VARYING(2000) ");
        
        var p = new Promise(function(suc, rej) {
            console.log(query);
            myDB.execute(query, function(){
                suc(true)
            })
        })
        return p;
    }

    // async keyword to convert result promise
    $scope.createWithdrawal = async function(prd, withdrawal){ 
        return new Promise((resolve, reject) => {

            if (!withdrawal || parseInt(withdrawal) == 0) {
                return resolve(false);
            } 

            var cmd = "INSERT INTO T_CLIENT_PRD_TXN VALUES(null,"+
                        $scope.maxPrdTxn_CPT_PK+ //CPT_PK
                        ", "+prd.CPM_PK+ //CPT_CPM_PK
                        ", '"+$scope.clientinfo.CLT_PK+"'"+ // CPT_CLT_PK
                        ", '"+prd.CPM_PRM_PK+"'"+ // CPT_PRM_PK
                        ", 'D'"+ // CPT_FLAG
                        ", '"+parseFloat(withdrawal)+"'"+ // CPT_TXN_AMOUNT
                        ", '"+moment().format('YYYY-MM-DD HH:mm:ss.0')+"'"+ // CPT_DATETIME
                        ", '"+USER_PK+"'"+ // CPT_USER_PK
                        ", ''"+ // CPT_REASON
                        ", ''"+ // CPT_REMARK
                        ", 58"+ // CPT_STATUS
                        ", '0'"+ //CPT_EXP_AMOUNT
                        ", 0"+ //CRS_COLLECTION_WEEK_NO
                        ", 1);"; // CPT_CHKNEW

            console.log(cmd); 

            myDB.execute(cmd, function(){
                resolve(true)
            }) 

        }); 
    }

    $scope.prepDate = function(d){
        var dateonly = (d+"").split(" ")[0];
        dateonly = dateonly.split(/-|\//g);
        return dateonly[0]+"/"+dateonly[1]+"/"+dateonly[2];
    }

    var $sigdiv = $("#signature")
    var canvas = $('#the-canvas')[0]; 

    $scope.emitLoadSignature = function(signee, type){
        console.log('emitting');
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
                    $scope.clientinfo.Signature = blob;
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

            }  

            var cont = canv.getContext("2d");
            cont.drawImage(img2, 0, 0, 300, 150);
            $scope.showSign = false;
            $scope.$apply();

            if ($scope.allSigned()) {
                $scope.saveExitForm();
            }
        });
        img2.src = dsrc;
    }
});


/******************************************
Dislay header and handle UI
******************************************/

function init(){
    initTemplate.load(2);
    $(".ncadPhoto").each(function(){
        $(this).width(250).height($(this).width()*1.25);
    });
}

/******************************************
For cancel button
******************************************/
function navBack(){history.back();return false;}

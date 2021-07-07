/******************************************
 Global variables
******************************************/
$("input[type='number']").on("click", function () {
    $(this).select();
 });
var clientpk        = sessionStorage.getItem("CLIENT_ID"),
    loanpk          = sessionStorage.getItem("LOAN_ID"),
    loanstatus      = sessionStorage.getItem("LOAN_STATUS"),
    secondreview    = false,
    editmode        = sessionStorage.getItem("EVALMODE");

var USER_PK             = sessionStorage.getItem("USER_PK");
var USER_NAME           = sessionStorage.getItem("USER_NAME");
var USER_HAVE_SIG       = sessionStorage.getItem("USER_HAVE_SIG");
var USER_SIG            = (sessionStorage.getItem("USER_SIG") === null ? '' : sessionStorage.getItem("USER_SIG"));
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
 
if(loanstatus==19||loanstatus==42) secondreview = true; //using loan status to set if this is first review or second
 
/******************************************
 Controller
******************************************/
myApp = angular.module('myApp',['ng-currency', 'pascalprecht.translate']);

   // var myApp = angular.module("myApp", ['ng-currency']); 

	myApp.config(function ($translateProvider) {

	$translateProvider.useStaticFilesLoader({
		prefix: "locales/locale-",
		suffix: ".json"
	});

    $translateProvider.preferredLanguage(ln.language.code);

});

myApp.directive('checkChange',function($timeout){
    return {
        restrict: 'A',
        scope: {
            chkKey: '@',
            chkType: '=',
        },
        link: function(scope,elm,attrs) {

            scope.$watch(function() {
                return scope.chkType.newdata;
            },
            function(newValue, oldValue) {
                if(newValue !== null && newValue != 'null'){
                    if(scope.chkType.newdata[scope.chkKey] !== null && scope.chkType.newdata[scope.chkKey] != 'null' && scope.chkType.newdata[scope.chkKey] != scope.chkType.olddata[scope.chkKey]){
                        if(!elm.is("select")) {
                            elm.css('color','#009688');
                            elm.css('font-weight','bold');
                        } else {
                            elm.parent().css('color','#009688');
                            elm.parent().css('font-weight','bold');
                        }
                    }
                }
            });
        }
    };
});

myApp.directive('checkProgress',function(){
    return {
        restrict: 'A',
        link: function(scope,elm,attr){

            var page = attr.title;
            elm.click(function(event){

                event.stopPropagation();
                event.preventDefault();
                
                if(page== 'pageGeneralQuestion'){
                    if(false){

                    } else {
                        $("html, body").animate({ scrollTop: 0 }, 600);
                        $(".etask:nth-child(1)" ).find('.etask-icon i').removeClass('hidden');

                        var perc = '33%';

                        if(scope.secondreview) { perc = '33%'; }

                        $('.etask-progress-bar').css('width',perc);

                        $(".etask-progress .etask:nth-child(1)").find('.etask-icon i').removeClass('hidden');
                        $('.etask-progress .etask:nth-child(1)').find('.etask-icon i').delay(700).animate({
                            opacity: '1',
                            height: '3em',
                            width: '3em',
                            'line-height': '3em',
                            left: '-0.5em',
                            top: '-0.5em',
                        },300);

                        setTimeout(function(){
                            scope.rerender(600);
                            $.mobile.changePage("#pageAssetInfo");
                        },1450);

                    }

                } else if(page == 'pageFamilyBizInfo'){

                    var bfentry = true;

                    if(bfentry){
                        // $( ".etask:nth-child(2)" ).find('.etask-icon i').removeClass('hidden');
                        // $('.etask-progress-bar').css('width','50%');

                        $("html, body").animate({ scrollTop: 0 }, 600);
                        $(".etask:nth-child(2)" ).find('.etask-icon i').removeClass('hidden');

                        var perc = '66%';
                        if(secondreview) perc = '40%';

                        $('.etask-progress-bar').css('width',perc);


                        $(".etask-progress .etask:nth-child(2)").find('.etask-icon i').removeClass('hidden');
                        $('.etask-progress .etask:nth-child(2)').find('.etask-icon i').delay(700).animate({
                            opacity: '1',
                            height: '3em',
                            width: '3em',
                            'line-height': '3em',
                            left: '-0.5em',
                            top: '-0.5em',
                        },300);

                        setTimeout(function(){
                            scope.rerender(600);
                            $.mobile.changePage("#pageAssetInfo");
                        },1450);
                    }

                } else if(page == 'pageAssetInfo'){

                    var bfentry = true;

                    if(bfentry){
                        // $( ".etask:nth-child(2)" ).find('.etask-icon i').removeClass('hidden');
                        // $('.etask-progress-bar').css('width','50%');

                        $("html, body").animate({ scrollTop: 0 }, 600);
                        $(".etask:nth-child(2)" ).find('.etask-icon i').removeClass('hidden');

                        var perc = '66%';
                        if(secondreview) perc = '66%';

                        $('.etask-progress-bar').css('width',perc);


                        $(".etask-progress .etask:nth-child(3)").find('.etask-icon i').removeClass('hidden');
                        $('.etask-progress .etask:nth-child(3)').find('.etask-icon i').delay(700).animate({
                            opacity: '1',
                            height: '3em',
                            width: '3em',
                            'line-height': '3em',
                            left: '-0.5em',
                            top: '-0.5em',
                        },300);

                        setTimeout(function(){
                            $.mobile.changePage("#pageHousingIndex");
                        },1450);
                    }

                } else if(page == 'pageUse'){

                    for(var k=0;k<scope.eval.usage.length;k++){
                        var useof = scope.eval.usage[k];

                        if((useof.yesno=='Y' && (isNaN(useof.amt)))||
                            (k==11&&useof.yesno=='Y'&&(isNaN(useof.amt)))){ //||(useof.other==null) not sure about this
                            //console.log(useof);
                            event.preventDefault();
                            //alert("Please check [Working Capital Usage] tab item \""+["School Fees/Expenses","House Repair/Improvements","Home Utensils/Equipment","Clothes/Shoes","Medicine, Clinic, Doctor","Food for Family","CRF","Give/Lend to other person","Save for Emergency","Repay Debts","Used by other persons","Others"][parseInt(k)]+"\"");
                            //alert(i18n.t("messages.CheckWorkCapitalUsage")[parseInt(k)]+"\"");
                            //$.mobile.changePage("#pageUse");
                            var alertstr = i18n.t("messages.CheckWorkCapitalUsage");
                            var astr_arr = alertstr.split(":");
                            var afirst = astr_arr[0];
                            var ssec = astr_arr[1];
                            var type_arr  = ssec.split(",");
                            var currenchk = type_arr[parseInt(k)];

                            var alertmsg = afirst + " : " + currenchk;


                            swal({
                                title: i18n.t("messages.Alert"),
                                text: alertmsg,
                                type: "warning",
                                closeOnConfirm: true
                            });

                            return false;
                        }
                    }

                    // $('.etask-progress-bar').css('width','75%');
                    // $( ".etask:nth-child(3)" ).find('.etask-icon i').removeClass('hidden');


                    $("html, body").animate({ scrollTop: 0 }, 600);
                    $(".etask:nth-child(4)" ).find('.etask-icon i').removeClass('hidden');

                    var perc = '100%';
                    if(secondreview) perc = '80%';

                    $('.etask-progress-bar').css('width',perc);


                    $(".etask-progress .etask:nth-child(4)").find('.etask-icon i').removeClass('hidden');
                    $('.etask-progress .etask:nth-child(4)').find('.etask-icon i').delay(700).animate({
                        opacity: '1',
                        height: '3em',
                        width: '3em',
                        'line-height': '3em',
                        left: '-0.5em',
                        top: '-0.5em',
                    },300);

                    setTimeout(function(){

                        setTimeout(function(){
                            scope.$apply(function(){
                                //scope.eval.houseind = [null,null,null,null,null,null,null];

                                setTimeout(function() {
                                    $('#ncHSSZ').selectmenu("refresh", true);
                                    $('#ncCOND').selectmenu("refresh", true);
                                    $('#ncROOF').selectmenu("refresh", true);
                                    $('#ncWALL').selectmenu("refresh", true);
                                    $('#ncFLOR').selectmenu("refresh", true);

                                }, 200);


                            });
                        },1);

                        $.mobile.changePage("#pageHousingIndex");
                    },1450);

                } else if(page == 'pageHousingIndex'){

                    if( scope.eval.houseind[0] === null ||  scope.eval.houseind[0] === undefined ||
                        scope.eval.houseind[1] === null ||  scope.eval.houseind[1] === undefined ||
                        scope.eval.houseind[2] === null ||  scope.eval.houseind[2] === undefined ||
                        scope.eval.houseind[3] === null ||  scope.eval.houseind[3] === undefined ||
                        scope.eval.houseind[4] === null ||  scope.eval.houseind[4] === undefined){

                        if( sweetCheckNull(scope.eval.houseind[0],i18n.t("messages.EmptyHouseSize"),"pageHousingIndex")||
                            sweetCheckNull(scope.eval.houseind[1],i18n.t("messages.EmptyHouseCondition"),"pageHousingIndex")||
                            sweetCheckNull(scope.eval.houseind[2],i18n.t("messages.EmptyRoofType"),"pageHousingIndex")||
                            sweetCheckNull(scope.eval.houseind[3],i18n.t("messages.EmptyWallType"),"pageHousingIndex")||
                            sweetCheckNull(scope.eval.houseind[4],i18n.t("messages.EmptyFloorType"),"pageHousingIndex")
                        )
                        {
                            //$.mobile.changePage("#pageHousingIndex");
                            return false;
                        }
                    } else {
                        // $('.etask-progress-bar').css('width','100%');
                        // $( ".etask:nth-child(4)" ).find('.etask-icon i').removeClass('hidden');

                        $("html, body").animate({ scrollTop: 0 }, 600);
                        $(".etask:nth-child(5)" ).find('.etask-icon i').removeClass('hidden');
                            
                        $('.etask-progress-bar').css('width','100%');
                        $(".etask-progress .etask:nth-child(5)").find('.etask-icon i').removeClass('hidden');
                        $('.etask-progress .etask:nth-child(5)').find('.etask-icon i').delay(700).animate({
                            opacity: '1',
                            height: '3em',
                            width: '3em',
                            'line-height': '3em',
                            left: '-0.5em',
                            top: '-0.5em',
                        },300);

                        if(secondreview){
                            setTimeout(function(){
                                $.mobile.changePage("#pageWorkingCapital");
                            },1450);
                        } else {

                        }
                    }



                } else if(page == 'pageWorkingCapital'){

                }


            });



            function checkEntry(entry){
                var cols = 0;
                var totalcols = 9; //family business info has 9 mandatory fields in total
                var proceed = true;
                for(var key in entry){ //iterate all fields
                    cols++;
                    if((entry[key]===null||entry[key]===''||entry[key]==='null'||entry[key]===undefined||
                        (["wkcapital","owncapital","revperwk","expperwk","profperwk"].indexOf(key)>-1 && isNaN(entry[key]))
                    ))
                    //  {alert("There is an empty field in your family business information entry");return false;} //&&entry[key]!==0
                    {
                        proceed = false;
                        //alert(i18n.t("messages.EmptyFamilyBusinessInfoEntry"));

                    } //&&entry[key]!==0
                }
                //if(cols<totalcols){alert("There is an empty field in your family business information entry"); return false;} //if there are no 9 keys = missing 1 field
                if(cols<totalcols){
                    proceed = false;
                    //alert(i18n.t("messages.EmptyFamilyBusinessInfoEntry"));

                } //if there are no 9 keys = missing 1 field
                if(proceed) {
                    return true;
                } else {
                    swal({
                        title: i18n.t("messages.Alert"),
                        text: i18n.t("messages.EmptyFamilyBusinessInfoEntry"),
                        type: "warning"
                    }).then(function(){
                        return false;
                    },function(){

                    });
                }
            }
        }
    };
});
 
    myApp.controller("clientCtrl", ['$scope','$filter', '$timeout','$rootScope', function($scope,$filter,$timeout,$rootScope){

        //format to human readable date from string
        $scope.prepDate = function(d){
            var dateonly = d.split(" ")[0];
            dateonly = dateonly.split(/-|\//g);
            return dateonly[2]+"/"+dateonly[1]+"/"+dateonly[0];
        };
        $scope.currloc = 'RP ';
        //these variables save queries when user decides to remove existing borrowed funds/income
        $scope.deleteFBI = [];
        $scope.deleteBF = [];

        //preset variables
        /******************************************
        - Applicant's Data
        ******************************************/
        $scope.eval = {
            loantype: null,
            general : {
                disAmt : null,
                disDate : null,
                disWeeks : null,
                disLoc : 'C',
                inBusiness: null,
                isWell: null,
                note: null,
                reason: null,
                compliance: null,
                compliance_others: null
            },
            agri: {
                qseeds:null,
                healthynursery: null,
                goodcrop: null,
                landrediness: null,
                othersChck: null,
                others: null,
                recommenddisbursement: null
            },
            arta: {
                type : null,
                kwh: null,
                completiontime: null,
                addfee:null,
                goodscondition: null,
                specs1: null,
                specs2: null,
                specs3: null,
                specs4: null,
                noshipcost:null,
                deliveryOnTime:null,
                complaint: null
            },
            edu: {
                householdmembers: null,
                noofchildren: 0,
                noofchildrenschooling: 0
            },
            everInArreas: 'N',
            everInJointResponse: 'N',
            usage : [{},{},{},{},{},{},{},{},{},{},{},{}],
            houseind : [null,null,null,null,null,null,null],
            homeless: 'NO',
            otherinstituesrepayperweek: 0,
            husband_income: 0,
            wife_income: 0,
            other_income: 0,
            household_expenses: 0,
            education_expenses: 0,
            extra_expenses: 0
        };

        $scope.tempchoices = [null,null,null,null,null,null,null];

        $('#ncHSSZ').selectmenu("refresh", true);
        $('#ncCOND').selectmenu("refresh", true);
        $('#ncROOF').selectmenu("refresh", true);
        $('#ncWALL').selectmenu("refresh", true);
        $('#ncFLOR').selectmenu("refresh", true);

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
            Signature: USER_SIG,
            hasSigned: USER_SIGNED
        };
        $scope.showSign = false;
        $scope.ctr_lead = {
            ctr_lead_pk: null,
            ctr_lead_name: null,
            Signature: null,
            hasSigned : null,
            ctr_leaders: []
        };

        $scope.showSign = false;
        $scope.signingclientIndex = null;
        $scope.signinguser = null;

        /******************************************
        //Loading housing index and populating with previous values (Loan, or from First Review)
        ******************************************/
        $scope.selectHome={}; 

        $scope.loadSavingDetails = function() {
            var cmd = "SELECT * FROM T_CLIENT_PRODUCT_MAPPING LEFT JOIN T_PRODUCT_MASTER ON (PRM_PK = CPM_PRM_PK)  WHERE CPM_CLT_PK="+clientpk;
            myDB.execute(cmd,function(results){
                console.log('client products')
                console.log(results);
                $scope.products = {
                    mandatory : 0,
                    pension : 0,
                    voluntary: 0,
                    feast: 0,
                }
                results.forEach( res => {
                    if(res.PRM_CODE == '002.0001') {
                        $scope.products.mandatory = res.CPM_PRM_BALANCE;
                    }
                    if(res.CPM_PRM_PK == '002.0004') {
                        $scope.products.pension = res.CPM_PRM_BALANCE;
                    }
                    if(res.CPM_PRM_PK == '002.0003') {
                        $scope.products.voluntary = res.CPM_PRM_BALANCE;
                    }
                    if(res.CPM_PRM_PK == '002.0007') {
                        $scope.products.feast = res.CPM_PRM_BALANCE;
                    }
                })
            });
        }

        $scope.totalSavings = function() {
            var total = 0;
            total += parseInt($scope.products.mandatory);
            total += parseInt($scope.products.pension);
            total += parseInt($scope.products.voluntary);
            total += parseInt($scope.products.feast);
            return total;
        }

        $scope.loadRepaymentDetails = function() {
            var cmd = "SELECT * FROM T_CLIENT_REPAY_SCHEDULE  WHERE CRS_CLL_PK="+loanpk;
            myDB.execute(cmd,function(results){
                console.log('client repay schedule')
                console.log(results);
                $scope.repay = {
                    totalweekspaid: 0,
                    totalpaid: 0,
                    perweek: 0
                }
                results.forEach(res => {
                    if(res.CRS_ATTENDED == 'Y') {
                        $scope.repay.totalweekspaid++;
                        $scope.repay.totalpaid + parseInt(res.CRS_ACT_CAPITAL_AMT) + parseInt(res.CRS_ACT_PROFIT_AMT)
                        $scope.repay.perweek = parseInt(res.CRS_ACT_CAPITAL_AMT) + parseInt(res.CRS_ACT_PROFIT_AMT);
                    }
                })
            });
        }

        $scope.loadLoanDetails = function(){

            var cmd = "SELECT * FROM T_CLIENT_LOAN LEFT JOIN T_LOAN_TYPE ON (LTY_PK = CLL_LTY_PK) LEFT JOIN T_LOAN_PURPOSE ON (LPU_PK = CLL_LPU_PK) WHERE CLL_PK="+loanpk;
            myDB.execute(cmd,function(result){
                var loan = result[0];
                $scope.eval.general.loanname = loan.LTY_DESCRIPTION;
                $scope.eval.general.loanid = loan.CLL_LOAN_NUMBER;
                $scope.eval.general.purpose = loan.LPU_NAME;
                $scope.eval.general.loanperiod = loan.CLL_LOAN_WEEKS;
                $scope.eval.general.loancycle = loan.CLL_LOAN_CYLCE;

                var loantype = loan.CLL_LTY_PK;
            
                if(loantype == 34 || loantype == 35){
                    $scope.loantype = 'general';
                } else if (loantype == 56){
                    $scope.loantype = 'arta';
                } else if (loantype == 38){
                    $scope.loantype = 'sanitation';
                } else if (loantype == 37) {
                    $scope.loantype = 'agriculture';
                } else if (loantype == 36) {
                    $scope.loantype = 'education';
                } else {
                    $scope.loantype = 'general';
                }
                $scope.$apply();
            });

        };

        $scope.getGroupLeaders = function(){

            var cmd = "SELECT CLT_PK, CLT_FULL_NAME FROM T_CLIENT WHERE CAST(CLT_CENTER_ID as INTEGER) ="+$scope.client.CLT_CENTER_ID+" AND CLT_IS_GROUP_LEADER='Y' ";
            console.log(cmd);
            myDB.execute(cmd, function(results){
                console.log(results);
                for(var r in results){
                    $scope.ctr_lead.ctr_leaders.push(results[r]);
                }
            });
        };

        $scope.updateCtrLeader = function(){

            $scope.ctr_lead.ctr_lead_pk = $scope.selectedCtrLeader.CLT_PK;
            $scope.ctr_lead.ctr_lead_name = $scope.selectedCtrLeader.CLT_FULL_NAME;

        };

        $scope.loadLoanDetails();
        $scope.loadRepaymentDetails();
        $scope.loadSavingDetails();
        $scope.incomes = {
            husband: 0,
            wife: 0,
            other: 0
        };
        $scope.expenses = {
            household: 0,
            education: 0,
            other: 0
        };

        $scope.getTotalEvalIncome = function() {
            var total = 0;
            total += parseInt($scope.eval.husband_income);
            total += parseInt($scope.eval.wife_income);
            total += parseInt($scope.eval.other_income);
            return total;
        }

        $scope.getTotalEvalExpenses = function() {
            var total = 0;
            total += parseInt($scope.eval.household_expenses);
            total += parseInt($scope.eval.education_expenses);
            total += parseInt($scope.eval.extra_expenses);
            total += parseInt($scope.eval.otherinstituesrepayperweek);
            return total;
        }

        myDB.T_HOUSE_INDEX.get(null,function(results){// OR (CODE_TYPE_PK>=9 AND CODE_TYPE_PK<=16)
            var sqlcmd = ""; 
            if(secondreview === false){ //first review
                ////console.log("First review: Checking if existing record exists for home");
                //check if there is an existing record
                myDB.execute("SELECT CLE_HOUSE_SIZE as ncHSSZ,CLE_HOUSE_CONDITION as ncCOND,CLE_ROOF_TYPE as ncROOF,CLE_WALL_TYPE as ncWALL,CLE_FLOOR_TYP as ncFLOR,CLE_ELETRICITY as ncELEC,CLE_WATER_SRC as ncWATR FROM T_CLIENT_EVALUATION WHERE CLE_REVIEW_CODE=1 AND CLE_CLL_PK="+loanpk+" AND CLE_CLT_PK="+clientpk,function(houseres){
                    if(houseres.length>0){
                        ////console.log("First review: Existing house record from first review");
                        $scope.loadHouseOne();
                        //existing record exists, load from review 1
                    }else{
                        //no edits, load from loan
                        ////console.log("House: No edits, loading from loan");
                        $scope.loadHouseLoan();
                    }
                });
            }else{ //second review check if there is existing
                myDB.execute("SELECT CLE_HOUSE_SIZE as ncHSSZ,CLE_HOUSE_CONDITION as ncCOND,CLE_ROOF_TYPE as ncROOF,CLE_WALL_TYPE as ncWALL,CLE_FLOOR_TYP as ncFLOR,CLE_ELETRICITY as ncELEC,CLE_WATER_SRC as ncWATR FROM T_CLIENT_EVALUATION WHERE CLE_REVIEW_CODE=2 AND CLE_CLL_PK="+loanpk+" AND CLE_CLT_PK="+clientpk,function(houseres){
                     
                    if(houseres.length>0){
                        ////console.log("House: Second review, existing record");
                        //existing record exists, use existing evaluation record to update
                        $scope.loadHouseUI(houseres[0]);
                    }else{
                        //load from review 1 because an existing one is not available
                        ////console.log("House: Second review, no existing so load review 1");
                        $scope.loadHouseOne();

                    }
                });
            }
            results.forEach(function(value,index){
                s.selectHome[value.HSE_TYPE_PK] || (s.selectHome[value.HSE_TYPE_PK] = []); //init if null
                var keypair = {'name': value.HSE_NAME,'value': value.HSE_VALUE};
                s.selectHome[value.HSE_TYPE_PK].push(keypair);
            });
            s.$apply(function(){s.selectHome;}); ////console.log(s.selectHome);
        });

        $scope.checkHomeless = function(){

            if($scope.eval.homeless == 'YES'){
                $scope.tempchoices = $scope.eval.houseind;
                $scope.eval.houseind = [null,null,null,null,null,null,null];
            } else {
                $scope.eval.houseind = $scope.tempchoices;
            }

            setTimeout(function() {

                $('#ncHSSZ').selectmenu("refresh", true);
                $('#ncCOND').selectmenu("refresh", true);
                $('#ncROOF').selectmenu("refresh", true);
                $('#ncWALL').selectmenu("refresh", true);
                $('#ncFLOR').selectmenu("refresh", true);

            }, 300);

        };

        $scope.husbandinfo = {
            maritalstatus:null
        };
        $scope.eval.general.loanname = "General Loan"; //Need to Remove
        $scope.eval.general.purpose = "For business"; //Need to Remove


        $scope.eval.general.disWeeks = sessionStorage.getItem("LOAN_WEEKS");
        if($scope.eval.general.disWeeks == "null") $scope.eval.general.disWeeks = 0;
        $scope.eval.general.disAmt   = sessionStorage.getItem("LOAN_ORIGINAL");
        $scope.eval.general.disDate  = $scope.prepDate(sessionStorage.getItem("LOAN_DISDATE"));

        $scope.loanstatus  = sessionStorage.getItem("LOAN_STATUS");
        $scope.secondreview = false;

        if($scope.loanstatus==19|| $scope.loanstatus==42) $scope.secondreview = true;
    
        /******************************************
        - Family Business Info
        ******************************************/
        $scope.entryList = [];
        $scope.currentEntry = {};
        $scope.selectedNum = -1;

        $scope.houseIncomes = [];

        $scope.incomeDetailoptions = [];

        //#####################################################
        // CLIENT INCOME
        //#####################################################
        $scope.loadDetaillOptions = function(){

            $scope.incomeDetailoptions = [];

            $scope.incomeDetailoptions = [
                {label: 'Metre Square', value: 'Metre Square'},
                {label: 'Slot', value: 'Slot'},
                {label: 'Hectare', value: 'Hectare'}
            ];


        };

        $scope.changing = function(obj){

            refreshall('.detaildesc');

        };

        myDB.execute("SELECT * FROM T_CODE WHERE CODE_TYPE_PK=20 ORDER BY CODE_PK DESC",function(res){
            //console.log(res);
            $.each(res,function(i,inc){

                var incomeSouce = {
                    source:inc.CODE_NAME,
                    inctype:inc.CODE_DESC,
                    fixed:0,
                    variable:0,
                    details:0,
                    detaildesc:null
                };

                $scope.houseIncomes.push(incomeSouce);

            });

            $scope.$apply(function(){
                $scope.houseIncomes;
            })
        });

        $scope.chkHse = function(){
            console.log($scope.eval.houseind);
        }

        myDB.execute("SELECT * FROM T_CLIENT_LOAN WHERE CLL_STATUS !=9 AND CLL_CLT_PK="+clientpk+" LIMIT 1",function(res){
            //console.log(res);

            if(res.length > 0){

                var loan = res[0];

                $scope.eval.appWorkCap = loan.CLL_WORKING_CAPITAL;
                $scope.eval.husbWorkCap = loan.CLL_HB_WORKING_CAPITAL;

                var houseinfo = {};
                houseinfo.housetype = loan.CLL_HOUSE_TYP;

                var housesize = null;
                var housecond = null;
                var houseroof = null;
                var houseflor = null;
                var housewall = null;
                var houseelec = null;
                var housewatr = null;

                if(loan.CLL_HOUSE_SIZE !== null) housesize = loan.CLL_HOUSE_SIZE.toString();
                if(loan.CLL_HOUSE_CONDITION !== null) housecond = loan.CLL_HOUSE_CONDITION.toString();
                if(loan.CLL_ROOF_TYPE !== null) houseroof = loan.CLL_ROOF_TYPE.toString();
                if(loan.CLL_WALL_TYPE !== null) housewall = loan.CLL_WALL_TYPE.toString();
                if(loan.CLL_FLOOR_TYP !== null) houseflor = loan.CLL_FLOOR_TYP.toString();

                $scope.eval.houseind = [
                                    housesize,
                                    housecond,
                                    houseroof,
                                    housewall,
                                    houseflor,
                                    houseelec,
                                    housewatr
                                ];
                console.log($scope.eval.houseind);
                console.log($scope.selectHome);

                $scope.eval.homeless = (loan.CLL_HOMELESS == 'Y') ? 'YES' : 'NO';

                $scope.$apply(function(){

                    var choice0 = "";
                    var choice1 = "";
                    var choice2 = "";
                    var choice3 = "";
                    var choice4 = "";

                    choice0 = getHousIndex($scope.selectHome[2],housesize);
                    choice1 = getHousIndex($scope.selectHome[3],housecond);
                    choice2 = getHousIndex($scope.selectHome[4],houseroof);
                    choice3 = getHousIndex($scope.selectHome[5],housewall);
                    choice4 = getHousIndex($scope.selectHome[6],houseflor);

                    console.log(choice0);
                    console.log(choice1);
                    console.log(choice2);
                    console.log(choice3);
                    console.log(choice4); 
 
                    // $('#ncHSSZ').val(choice0);
                    // $('#ncCOND').val(choice1);
                    // $('#ncROOF').val(choice2);
                    // $('#ncWALL').val(choice3);
                    // $('#ncFLOR').val(choice4);

                    // refreshall('.hsedrop');
                    // $scope.$apply();

                    // $('#ncHSSZ').selectmenu("refresh", true);
                    // $('#ncCOND').selectmenu("refresh", true);
                    // $('#ncROOF').selectmenu("refresh", true);
                    // $('#ncWALL').selectmenu("refresh", true);
                    // $('#ncFLOR').selectmenu("refresh", true);

                });


            }

        });

        function getHousIndex(obj,value){

            var ind = 0;

            //console.log(obj);
            $.each(obj,function(i,val){
                //console.log(val.value+" "+value);
                if(parseInt(val.value) == parseInt(value) ){
                    ind = i;
                }
            });

            return ind;
        }

        myDB.execute("SELECT * FROM T_CLIENT_INCOME, T_CLIENT_LOAN, T_CODE WHERE CODE_NAME = CLI_SOURCE AND CODE_TYPE_Pk = 20 AND CLI_CLL_PK = CLL_PK AND  CLL_CLT_PK ="+clientpk+" AND CLL_PK="+loanpk,function(results){
            console.log('incomes ');
            console.log(results);

            if(results.length === 0) return false;

            $scope.houseIncomes = [];

            $.each(results, function(i,inc){

                var detaildesc = inc.CLI_SOURCE_DETAIL;
                var inc_detail = detaildesc.substr(0,detaildesc.indexOf(' '));
                var inc_desc = detaildesc.substr(detaildesc.indexOf(' ')+1);

                var incomeSouce = {
                    source:inc.CLI_SOURCE,
                    inctype:inc.CODE_DESC,
                    fixed:parseInt(inc.CLI_FIXED),
                    variable:parseInt(inc.CLI_VARIABLE),
                    details:parseInt(inc_detail == 'null' ? 0 : inc_detail),
                    detaildesc:inc_desc
                };

                $scope.houseIncomes.push(incomeSouce);

            });

            $scope.$apply(function(){
                $scope.houseIncomes;
            });

        });

        $scope.checkNegative = function(income){

            if(income.inctype == 'NEGATIVE'){

                if(parseInt(income.fixed) > 0) {
                    income.fixed = parseInt(income.fixed) * -1;
                }
                if(income.variable > 0) {
                    income.variable = parseInt(income.variable) * -1;
                }

            }
        };

        $scope.showSelect = function(income){


            if(income.source=='HUSBAND' && !$scope.showHusband()){
                return false;
            }

            return true;

        };

        $scope.showHusband = function(){
            return $scope.husbandinfo.maritalstatus=='M';
        };

        $scope.getTotalIncome = function(){
            var sum = 0;
            $.each($scope.houseIncomes,function(i,inc){
                sum += parseInt(inc.fixed) + parseInt(inc.variable);
            });

            return sum;
        };

        $scope.rerender = function(time){

            var rum = $scope.houseIncomes;
            var rom = $scope.unproassets;

            $scope.$apply(function(){
                $scope.houseIncomes = [];
                $scope.unproassets = [];
            });


            setTimeout(function(){

                $scope.$apply(function(){

                    $scope.loadDetaillOptions();

                    $scope.houseIncomes = rum;

                    $scope.unproassets = rom;
                });
                refreshall('.detaildesc');
            },time);

        };



        $scope.addEntry = function(){
            if(!checkEntry($scope.currentEntry)) return false; //check if the newly added entry has proper data
            $scope.entryList.push($scope.currentEntry);        //add to family business info list
            var app = $scope.currentEntry.applicant;           //preset the next entry to take the same applicant type
            $scope.currentEntry = {};
            $scope.currentEntry.applicant = app;
        };
        $scope.selectEntry = function(entrynum){ //when user clicks and select on entry
            if($scope.selectedNum!=-1&&$scope.selectedNum!=entrynum){
                if(!checkEntry($scope.entryList[$scope.selectedNum])) return false; //do not let user change to another entry if there are errors with this one
            }
            $scope.selectedNum=entrynum; //change to the entry that user has clicked
        };

        function checkEntry(entry){
            var cols = 0;
            var totalcols = 9; //family business info has 9 mandatory fields in total
            var proceed = true;
            for(var key in entry){ //iterate all fields
                cols++;
                if((entry[key]===null||entry[key]===''||entry[key]==='null'||entry[key]===undefined||
                   (["wkcapital","owncapital","revperwk","expperwk","profperwk"].indexOf(key)>-1 && isNaN(entry[key]))
                ))
                //  {alert("There is an empty field in your family business information entry");return false;} //&&entry[key]!==0
			    {
                    proceed = false;
                    //alert(i18n.t("messages.EmptyFamilyBusinessInfoEntry"));

                } //&&entry[key]!==0
            }
            //if(cols<totalcols){alert("There is an empty field in your family business information entry"); return false;} //if there are no 9 keys = missing 1 field
			if(cols<totalcols){
                proceed = false;
                //alert(i18n.t("messages.EmptyFamilyBusinessInfoEntry"));

            } //if there are no 9 keys = missing 1 field
            if(proceed) {
                return true;
            } else {
                swal({
                    title: i18n.t("messages.Alert"),
                    text: i18n.t("messages.EmptyFamilyBusinessInfoEntry"),
                    type: "warning"
                }).then(function(){
                    return false;
                },function(){

                });
            }
        }


        $scope.isSelectedEntry = function(entrynum){ //if this is the selected entry, return true
            return entrynum===$scope.selectedNum;
        };
        $scope.deleteEntry = function(entrynum){
            var rec = $scope.entryList[entrynum];
            if(rec.id){$scope.deleteFBI.push(rec.id);} //record as deleted
            $scope.entryList.splice(entrynum,1);       //remove from the list
            $scope.selectedNum = -1;                   //reset selection
        };
        $scope.getApplicant = function(value){
            switch(value){
                //case 'C': return 'Client';
				case 'C': return $filter('translate')('Client');
               // case 'CH': return 'Client/Husband';
			    case 'CH': return $filter('translate')('Client/Husband');
                //case 'H': return 'Husband';
				case 'H': return $filter('translate')('Husband');
                //case 'O': return 'Others';
				case 'O': return $filter('translate')('Others');
            }
        }
        $scope.calcBizTotal = function(key){
            var total = 0;
            for(entryk in $scope.entryList){
                var entry = $scope.entryList[entryk];
                if(key=="profpermth") total += entry['totaldays']*entry['profperwk'];
                else total += entry[key];
            }
            return total;
        }

        /******************************************
        - Working Capital Usage
        ******************************************/
        $scope.checkYes = function(ind){return $scope.eval.usage[ind].yesno=="Y";}; //for each index, if YES is selected
        $scope.totalConsumption = function(){ //add totals for column 1
            var usage = $scope.eval.usage;
            var total = 0;
            for(var i=0;i<=5;i++){
                if(usage[i].yesno=='Y'&&usage[i].amt!=null) total += usage[i].amt;
            }
            return total;
        }
        $scope.totalRepaid = function(){      //add totals for column 2
            var usage = $scope.eval.usage;
            var total = 0;
            for(var i=6;i<=11;i++){
                if(usage[i].yesno=='Y'&&usage[i].amt!=null) total += usage[i].amt;
            }
            return total;
        }
        /******************************************
        - House Type
        ******************************************/
        $scope.getHouseIndex = function(){
            var total = 0;

            for(var e in $scope.eval.houseind) {
                if($scope.eval.houseind[e] != "null"){
                    total += +$scope.eval.houseind[e];
                }
            }

            return total;
        };
        /******************************************
        - Assets
        ******************************************/
        $scope.addNewUpro = function(ind){

            var isnew = true;

            if(ind === 0) isnew = false;

            var currpro = parseInt(ind);
            var maxunpro = $scope.unproassets.length;
            var newobj = {
                index: parseInt(maxunpro + 1),
                asset: '',
                value: 0,
                isNew: isnew
            };

            if(maxunpro == currpro){
                $scope.unproassets.push(newobj);
                setTimeout(function() {$scope.$apply();}, 100);
            }
        };

        $scope.getTotalUnproVal = function(){
            var sum = 0;
            $.each($scope.unproassets, function(index, value){
                sum += parseFloat(value.value);
            });
            return sum;
        };
        $scope.unproassets = [];
        $scope.addNewUpro(0);

        /******************************************
        - Working Capital
        ******************************************/
        $scope.borrowedFunds = [];
        $scope.fundEntry = {};
        $scope.selectedfund = -1;
        $scope.workcap = {app:null,husband:null, //get total working capita
                          totalWorkCap : function(){
                              return $scope.workcap.app+$scope.workcap.husband;
                          },
                         };
        $scope.addFund = function(){
            //check
            if(!checkFunds($scope.fundEntry)) return false; //check if current fund has invalid data
            $scope.borrowedFunds.push($scope.fundEntry);
            var lf = $scope.fundEntry.loanfrom,
                app = $scope.fundEntry.applicant;
            $scope.fundEntry = {};                          //use same settings for next new fund
            $scope.fundEntry.loanfrom = lf;
            $scope.fundEntry.applicant = app;
        };
        $scope.selectFund = function(newinfo){
            if($scope.selectedfund!=-1&&$scope.selectedfund!=newinfo){
                if(!checkFunds($scope.borrowedFunds[$scope.selectedfund])) return false; //if user tries to select others without completing this one
            }
            $scope.selectedfund=newinfo; //allow the switch
        };
         // var cmd = "UPDATE T_CLIENT_LOAN SET CLL_STATUS=59 WHERE CLL_PK="+loanpk;
         //        myDB.execute(cmd,function(res){
         //            loanstatus = 59;
         //            sessionStorage.setItem("LOAN_STATUS",59);
         //            window.location.href = "evaluation.html";
         //        })
        $scope.skipEval = function(){
            swal({
                title: i18n.t("messages.Alert"),
                text: i18n.t("messages.SkipEvaluation"),
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#80C6C7",
                confirmButtonText: i18n.t("messages.Yes")
            }).then(function(){
                var cmd = "UPDATE T_CLIENT_LOAN SET CLL_STATUS=19 WHERE CLL_PK="+loanpk;
                myDB.execute(cmd,function(res){
                    loanstatus = 19;
                    sessionStorage.setItem("LOAN_STATUS",19);
                    window.location.href = "evaluation.html";
                });
            },function(){

            });
        };
        function checkFunds(fundObj){
            var cols = 0;
            var totalcols = 7; //7 mandatory fields in fund entry
            for(key in fundObj){
                cols++;
                if((fundObj[key]===null||fundObj[key]===''||fundObj[key]==='null'||fundObj[key]===undefined||
                    (["originalamt","balance","repaymentperwk","repaymentpermth"].indexOf(key)>-1 && isNaN(fundObj[key]))
                   ))
               // {alert("There is an empty field in your borrowed funds entry");return false;}
			    {
                    //alert(i18n.t("messages.EmptyBorrowFundEntry"));
                    swal({
                        title: i18n.t("messages.Alert"),
                        text: i18n.t("messages.EmptyBorrowFundEntry"),
                        type: "warning",
                        confirmButtonColor: "#80C6C7",
                        confirmButtonText: i18n.t("messages.Ok"),
                        closeOnConfirm: true
                    });
                    return false;
                }
            }
         //   if(cols<totalcols){alert("There is an empty field in your borrowed funds entry"); return false;} //missing a field
		    if(cols<totalcols){
                //alert(i18n.t("messages.EmptyBorrowFundEntry"));
                swal({
                    title: i18n.t("messages.Alert"),
                    text: i18n.t("messages.EmptyBorrowFundEntry"),
                    type: "warning",
                    confirmButtonColor: "#80C6C7",
                    confirmButtonText: i18n.t("messages.Ok"),
                    closeOnConfirm: true
                });
                return false;
            } //missing a field
            return true;
        }
        $scope.isSelectedFund = function(newinfo){return newinfo===$scope.selectedfund;};
        $scope.deleteFund = function(newinfo){
            //grab and save number
            var rec = $scope.borrowedFunds[newinfo];
            if(rec.id){$scope.deleteBF.push(rec.id);} //save into deleteBF to be handled later
            $scope.borrowedFunds.splice(newinfo,1);
            $scope.selectedfund = -1;
        };
        $scope.getBFLoanFrom = function(from){
          //  if(from=='B') return "Bank";
            if(from=='B') return $filter('translate')("Bank");
			//else if(from=='I') return "Institution";
			else if(from=='I') return $filter('translate')("Institution");
          //  else if(from=='M') return "MoneyLender";
		    else if(from=='M') return $filter('translate')("MoneyLender");
           // else if(from=='C') return "Cooperative";
		    else if(from=='C') return $filter('translate')("Cooperative");
        };
        $scope.getBFApplicant = function(from){
            if(from=='C') return "Client";
            else if(from=='H') return "Husband";
            else if(from=='B') return "Both";
        };
        $scope.countBFBanks = function(){
            var total = 0;
            $.each($scope.borrowedFunds, function(i,fund){
                if(fund.loanfrom=='B') total++;
            });
            return total;
        };

        /******************************************
        - On form submit, perform checks, prepare commands
        ******************************************/
        $scope.submitForm = function(){
            $scope.actionSubmit();
        };
        $scope.submitSecondForm = function() {
            if($scope.eval.homeless == 'NO' && (
                sweetCheckNull($scope.eval.houseind[0],i18n.t("messages.EmptyHouseSize"),"pageHousingIndex")||
                sweetCheckNull($scope.eval.houseind[1],i18n.t("messages.EmptyHouseCondition"),"pageHousingIndex")||
                sweetCheckNull($scope.eval.houseind[2],i18n.t("messages.EmptyRoofType"),"pageHousingIndex")||
                sweetCheckNull($scope.eval.houseind[3],i18n.t("messages.EmptyWallType"),"pageHousingIndex")||
                sweetCheckNull($scope.eval.houseind[4],i18n.t("messages.EmptyFloorType"),"pageHousingIndex")
                )
            )
            {
                return false;
            }
            //set reviewcodes, required for data entry
            swal({
                title: i18n.t("messages.Alert"),
                text: i18n.t("messages.SubmitClientEvaluationRequest"),
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#80C6C7",
                confirmButtonText: i18n.t("messages.Yes")
            }).then(function(){
                $scope.submitSecondFormSecondPart();
            },function(){

            });
        }
        $scope.submitSecondFormSecondPart = function() {
            var reviewcode = 1;
            if(secondreview) reviewcode = 2;

            eligibilityNotice = "";
            //check if client is eligible for loan
            var CLIENT_STATUS = 21;
            if((sessionStorage.getItem('BRC_HOUSE_INDEX_CAP')!==0&&sessionStorage.getItem('BRC_HOUSE_INDEX_CAP')<=$scope.getHouseIndex())||
               (sessionStorage.getItem('BRC_INCOME_CAP')!==0&&sessionStorage.getItem('BRC_INCOME_CAP')<=$scope.calcBizTotal('profpermth'))||
               (sessionStorage.getItem('BRC_NO_OF_LOANS_FROM_OTHERBANKS')!==0&&sessionStorage.getItem('BRC_NO_OF_LOANS_FROM_OTHERBANKS')<=$scope.countBFBanks()))
                //||sessionStorage.getItem('BRC_WELFARE_STATUS_CAP').indexOf(","+$scope.welfareStatus+",")!='-1')
            {
                //alert("Notice:This client is not eligible for loan.");
                //alert(i18n.t("messages.ClientNotEligibleForLoan"));
                eligibilityNotice = i18n.t("messages.ClientNotEligibleForLoan");
                CLIENT_STATUS = 40;
            }

        /******************************************
        - Checks done, generate queries to update
        ******************************************/
            var cmds = [];

            //data cleaning, set to 0 if null
            for(var i=0;i<=11;i++){
                var amt = $scope.eval.usage[i].amt;
                if(amt===null||!amt) $scope.eval.usage[i].amt = 0;
            }

            var isHomeless = ($scope.eval.homeless != 'YES') ? 'N' : 'Y';

            if($scope.eval.general.note == null || $scope.eval.general.note == ''){
                $scope.eval.general.note = '-';
            }

            var remarks = "null";
            if($scope.eval.general.remarks !== undefined) remarks = $scope.eval.general.remarks;

            var cmd = "INSERT INTO T_CLIENT_EVALUATION VALUES(null,"+loanpk+","+clientpk+","+loanpk+","+reviewcode+","+
            $scope.eval.general.disWeeks+","+
            "'"+$scope.eval.general.disLoc+"',"+
            "'"+$scope.eval.general.inBusiness+"',"+
            "'"+sanitize($scope.eval.general.note)+"',"+
            "'"+$scope.eval.general.isWell+"',"+
            "'"+sanitize($scope.eval.general.reason)+"',"; //end
            if(secondreview){
                for(var i=0;i<=11;i++){cmd += "'"+$scope.eval.usage[i].yesno+"',";}
                for(var i=0;i<=11;i++){
                    var amt = $scope.eval.usage[i].amt;
                    if(amt==null||!amt||amt=='') amt = 0; //set to 0 if null
                    if(i==11&&$scope.eval.usage[11].other) cmd += "'"+sanitize($scope.eval.usage[11].other)+"',";
                    else if (i==11) cmd+="'',";
                    cmd += amt+",";//$scope.eval.usage[i].amt
                }
                for(var i=0;i<=6;i++){
                    if($scope.eval.houseind[i]==null||$scope.eval.houseind[i]==''){
                        cmd += "0,";
                    } else {
                        cmd += $scope.eval.houseind[i]+",";
                    }

                }
                cmd += $scope.getHouseIndex()+",";
                cmd += "'"+$scope.eval.general.disLoc+"',"; //duplicate
                //cmd += "'','',"; //MCLIENT AND CMCLIENT_MET LOCATION LEAVE AS BLANK
                cmd += $scope.eval.appWorkCap+","+$scope.eval.husbWorkCap+",";
                cmd += "'"+sanitize(remarks)+"',";//FO_REMARKS
                //cmd += "'','',"; //MANAGER_REMARK, DMANAGER_REMARK
                cmd += CLIENT_STATUS+",";

                var USER_PK = parseInt(sessionStorage.getItem("USER_PK"));
                cmd += USER_PK+",";
                var date = new Date();
                cmd += "'"+("0"+date.getDate()).slice(-2)+"/"+("0"+(date.getMonth()+1)).slice(-2)+"/"+date.getFullYear()+" ";
                cmd += ("0"+date.getHours()).slice(-2)+":";
                cmd += ("0"+date.getMinutes()).slice(-2)+":";
                cmd += ("0"+date.getSeconds()).slice(-2)+"',";
                cmd += "'"+isHomeless+"', ";
            } else {
                for(var i=0;i<=11;i++){cmd += "'', ";}
                for(var i=0;i<=11;i++){  cmd += "'', ";}
                cmd += "'',";
                for(var i=0;i<=6;i++){ cmd += "0,"; }
                cmd += "'',";
                cmd += "'',"; //duplicate
                //cmd += "'','',"; //MCLIENT AND CMCLIENT_MET LOCATION LEAVE AS BLANK
                cmd += "'','',";
                cmd += "'',";//FO_REMARKS
                //cmd += "'','',"; //MANAGER_REMARK, DMANAGER_REMARK
                cmd += CLIENT_STATUS+",";

                var USER_PK = parseInt(sessionStorage.getItem("USER_PK"));
                cmd += USER_PK+",";
                var date = new Date();
                cmd += "'"+("0"+date.getDate()).slice(-2)+"/"+("0"+(date.getMonth()+1)).slice(-2)+"/"+date.getFullYear()+" ";
                cmd += ("0"+date.getHours()).slice(-2)+":";
                cmd += ("0"+date.getMinutes()).slice(-2)+":";
                cmd += ("0"+date.getSeconds()).slice(-2)+"',";
                cmd += "'', ";
            }
            var specs = "";
            if( $scope.eval.arta.specs1 !== null ||
                $scope.eval.arta.specs2 !== null ||
                $scope.eval.arta.specs3 !== null ||
                $scope.eval.arta.specs4 !== null){
                    specs = $scope.eval.arta.specs1+"~"+$scope.eval.arta.specs2+"~"+$scope.eval.arta.specs3+"~"+$scope.eval.arta.specs4;
            }
            var CLT_SIGNATURE = "";
            if(!$scope.secondreview) CLT_SIGNATURE = $scope.client.CLT_SIGNATURE;


            if($scope.eval.arta.type=='GOODS'){
                $scope.eval.arta.kwh = "";
                $scope.eval.arta.completiontime = "";
                $scope.eval.arta.addfee = "";
            } else if ($scope.eval.arta.type == 'INSTALLATION'){
                $scope.eval.arta.goodscondition = "";
                specs = "";
                $scope.eval.arta.noshipcost = "";
                $scope.eval.arta.deliveryOnTime = ""; 
            }

            cmd += "'"+$scope.eval.everInArreas+"', "; //CLE_EVER_IN_ARREARS
            cmd += "'"+$scope.eval.everInJointResponse+"', "; //CLE_EVER_IN_JOINT_RESPONSIBILITY
            cmd += "'"+$scope.eval.arta.type+"', "; //CLE_ARTA_TYPE
            cmd += "'"+specs+"', "; //CLE_ARTA_SPECS
            cmd += "'"+$scope.eval.arta.noshipcost+"', "; //CLE_ARTA_NOSHIP_COST
            cmd += "'"+$scope.eval.arta.deliveryOnTime+"', "; //CLE_ARTA_DELIVERY_ONTIME
            cmd += "'"+$scope.eval.arta.completiontime+"', "; //CLE_ARTA_COMPLETION_ONTIME
            cmd += "'"+$scope.eval.arta.addfee+"', "; //CLE_ARTA_NOADD_FEE
            cmd += "'"+$scope.eval.arta.complaint+"', "; //CLE_ARTA_COMPLAINT
            cmd += "'"+$scope.eval.agri.qseeds+"', "; //CLE_AGRI_QSEED
            cmd += "'"+$scope.eval.agri.healthynursery+"', "; //CLE_AGRI_HEALTHY_NURSERY
            cmd += "'"+$scope.eval.agri.goodcrop+"', "; //CLE_AGRI_GOOD_CROP
            cmd += "'"+$scope.eval.agri.landrediness+"', "; //CLE_AGRI_LAND_READY
            cmd += "'"+$scope.eval.agri.recommenddisbursement+"', "; //CLE_DISBURSEMENT_RECOMMENDATION
            cmd += "'"+$scope.eval.arta.goodscondition+"', "; //CLE_ARTA_GOODS_CONDITION
            cmd += "'"+$scope.eval.arta.kwh+"', "; //CLE_ARTA_KWH
            cmd += "'"+$scope.eval.agri.others+"', "; //CLE_AGRI_OTHERS


            cmd += "'"+CLT_SIGNATURE+"', ";
            cmd += "'', ";
            cmd += "'', ";
            cmd += USER_PK+", ";
            cmd += "'', ";
            cmd += $scope.ctr_lead.ctr_lead_pk+", "; // CLE_CTR_LEAD_PK
            cmd += "'"+$scope.ctr_lead.Signature+"', "; //CLE_CTR_LEAD_SIGN
            cmd += $scope.eval.edu.householdmembers+", "; //CLE_HOUSEHOLD_MEMBERS
            cmd += $scope.eval.edu.noofchildren+", "; //CLE_NO_OF_CHILDREN
            cmd += $scope.eval.edu.noofchildrenschooling+", "; //CLE_NO_OF_CHILDREN_IN_SCHOOLING
            cmd += "'"+$scope.eval.general.compliance+"', "; // CLE_COMPLIANCE
            cmd += "'"+$scope.eval.general.compliance_others+"', "; // CLE_COMPLIANCE_OTHERS
            cmd += "'"+$scope.eval.otherinstitues+"', " ; // CLE_OTHER_INSTITUINAL_FINANCING
            cmd += "'"+$scope.eval.institutename+"', " ; //CLE_OTHER_INSTITUITIONAL_NAME
            cmd += "'"+$scope.eval.amountfinanced+"', "; //CLE_AMOUNT_OF_FINANCING
            cmd += "'"+$scope.eval.projectionpaid+"', " ; //CLE_PAID_OFF
            cmd += "'"+$scope.eval.general.note+"', " ; //CLE_FO_NOTE
            cmd += "'"+$scope.eval.otherinstituesrepayperweek+"'," ;//CLE_REPAY_PER_WEEK
            cmd += "'"+$scope.eval.assetcondition+"',"; //CLE_ASSET_CONDITION
            cmd += "'"+$scope.eval.totalasset+"',", //CLE_TOTAL_ASSET
            cmd += "'"+$scope.eval.husband_income+"',", //CLE_HUSBAND_INCOME
            cmd += "'"+$scope.eval.wife_income+"',", //CLE_WIFE_INCOME
            cmd += "'"+$scope.eval.other_income+"',", //CLE_OTHER_INCOME
            cmd += "'"+$scope.eval.household_expenses+"',", //CLE_HOUSEHOLD_EXPENSES
            cmd += "'"+$scope.eval.education_expenses+"',", //CLE_EDUCATION_EXPENSES
            cmd += "'"+$scope.eval.extra_expenses+"',", //CLE_EXTRA_EXPENSES
            cmd += " 1) ";
            //cmd += "'','','','')";
            console.log(cmd); 
            
            myDB.execute(cmd,function(results){
                console.log(results);
            
                myDB.execute("SELECT CLE_PK FROM T_CLIENT_EVALUATION WHERE CLE_MOB_NEW = 1 ORDER BY P_ID DESC LIMIT 1",function(res){
                    var CLE_PK = res[0].CLE_PK; 
                    
                    var nlstat = 41; //new loan status
                    if(loanstatus==19) nlstat = 42; //if second review, update this to second review completed
                    if(loanstatus==59) nlstat = 19; //if bothreview, update this to second review

                    if($scope.UPD_CLE===false&&(loanstatus!=41||loanstatus!=42)){
                        cmds.push('UPDATE T_CLIENT_LOAN SET CLL_STATUS='+nlstat+' WHERE CLL_PK='+loanpk);
                    }
                    checkLogin(); //check login again
                    myDB.dbShell.transaction(function(tx){
                        for(var e in cmds){
                            cmds[e] = cmds[e].replace(/undefined/g, ""); //remove undefined and replace with empty string
                            tx.executeSql(cmds[e]);
                            console.log(cmds[e]);
                        }
                    }, function(err){
                        console.log(err);
                        $scope.redirectCallback('failed');
                    }, function(suc){
                        if(eligibilityNotice == ""){
                            $scope.redirectCallback('success');
                        } else {
                            $scope.redirectCallback('noteligible');
                        }
                    });

                })
            });
        }
        $scope.actionSubmit = function(){
            //checks
    //         if(

    //             checkNull($scope.eval.general.disLoc,"Please specify an interview location.")||
    //             checkNull($scope.eval.general.inBusiness,"Please specify if client is in business.")||
    //             checkNull($scope.eval.general.isWell,"Please specify if business is doing well.")||
    //             checkNull($scope.eval.general.note,"Please specify a note.")||
    //             checkNull($scope.eval.general.reason,"Please specify a reason.")


				// checkNull($scope.eval.general.disLoc,i18n.t("messages.EmptyInterviewLocation"))||
    //             checkNull($scope.eval.general.inBusiness,i18n.t("messages.IsClientInBusiness"))||
    //             checkNull($scope.eval.general.isWell,i18n.t("messages.IsBusinessDoingWell"))||
    //             checkNull($scope.eval.general.note,i18n.t("messages.EmptyNote"))||
    //             checkNull($scope.eval.general.reason,i18n.t("messages.EmptyReason"))

    //             sweetCheckNull($scope.eval.general.disLoc,i18n.t("messages.EmptyInterviewLocation"),"pageGeneralQuestion")||
    //             sweetCheckNull($scope.eval.general.inBusiness,i18n.t("messages.IsClientInBusiness"),"pageGeneralQuestion")||
    //             sweetCheckNull($scope.eval.general.isWell,i18n.t("messages.IsBusinessDoingWell"),"pageGeneralQuestion")||
    //             sweetCheckNull($scope.eval.general.note,i18n.t("messages.EmptyNote"),"pageGeneralQuestion")
    //           ){
    //             //$.mobile.changePage("#pageGeneralQuestion");
    //             return false;
    //         }
 
            if(!secondreview){ // FirstReview
                $scope.eval.appWorkCap  = 0;
                $scope.eval.husbWorkCap = 0;
                var stitle = "";
                if(!$scope.client.hasSigned){
                    stitle = i18n.t("messages.Client") +" "+ i18n.t("messages.HasNotSigned");
                    swal(stitle);
                    return false;
                }
                if(!$scope.ctr_lead.hasSigned){
                    stitle = i18n.t("messages.CenterLeader") +" "+ i18n.t("messages.HasNotSigned");
                    swal(stitle);
                    return false;
                }
                if(!$scope.user.hasSigned){
                    stitle = i18n.t("messages.FieldOfficer") +" "+ i18n.t("messages.HasNotSigned");
                    swal(stitle);
                    return false;
                }
                // if( 
                //     // checkNull($scope.eval.general.disLoc,"Please specify an interview location.")||
                //     // checkNull($scope.eval.general.inBusiness,"Please specify if client is in business.")||
                //     // checkNull($scope.eval.general.isWell,"Please specify if business is doing well.")||
                //     // checkNull($scope.eval.general.note,"Please specify a note.")||
                //     // checkNull($scope.eval.general.reason,"Please specify a reason.")||
    
    
                //     // checkNull($scope.eval.general.disLoc,i18n.t("messages.EmptyInterviewLocation"))||
                //     // checkNull($scope.eval.general.inBusiness,i18n.t("messages.IsClientInBusiness"))||
                //     // checkNull($scope.eval.general.isWell,i18n.t("messages.IsBusinessDoingWell"))||
                //     // checkNull($scope.eval.general.note,i18n.t("messages.EmptyNote"))||
                //     // checkNull($scope.eval.general.reason,i18n.t("messages.EmptyReason"))||
    
                //     sweetCheckNull($scope.eval.general.disLoc,i18n.t("messages.EmptyInterviewLocation"),"pageGeneralQuestion")||
                //     // ($scope.loantype == 'general' && sweetCheckNull($scope.eval.general.inBusiness,i18n.t("messages.IsClientInBusiness"),"pageGeneralQuestion"))||
                //     ($scope.loantype == 'general' && sweetCheckNull($scope.eval.general.isWell,i18n.t("messages.IsBusinessDoingWell"),"pageGeneralQuestion"))||
                //     ($scope.loantype == 'general' && sweetCheckNull($scope.eval.general.note,i18n.t("messages.EmptyNote"),"pageGeneralQuestion"))
                //   ){
                //     console.log($scope.eval.general.inBusiness);
                //     console.log($scope.eval.general.isWell);
                //     console.log($scope.eval.general.note);
                //     //$.mobile.changePage("#pageGeneralQuestion");
                //     return false;
                // }
                // if($scope.eval.general.inBusiness == 'N'){
                //     sweetCheckNull($scope.eval.general.reason,i18n.t("messages.EmptyReason"),"pageGeneralQuestion");

                //     return false;
                // }

            } else { // SecondReview
                if($scope.eval.homeless == 'NO' && (
                    /*
                    checkNull($scope.eval.houseind[0],"Please specify house size")||
                    checkNull($scope.eval.houseind[1],"Please specify house condition")||
                    checkNull($scope.eval.houseind[2],"Please specify roof type")||
                    checkNull($scope.eval.houseind[3],"Please specify wall type")||
                    checkNull($scope.eval.houseind[4],"Please specify floor type")||
                    checkNull($scope.eval.houseind[5],"Please specify electricity source")||
                    checkNull($scope.eval.houseind[6],"Please specify water source")
    
    
                    checkNull($scope.eval.houseind[0],i18n.t("messages.EmptyHouseSize"))||
                    checkNull($scope.eval.houseind[1],i18n.t("messages.EmptyHouseCondition"))||
                    checkNull($scope.eval.houseind[2],i18n.t("messages.EmptyRoofType"))||
                    checkNull($scope.eval.houseind[3],i18n.t("messages.EmptyWallType"))||
                    checkNull($scope.eval.houseind[4],i18n.t("messages.EmptyFloorType"))||
                    checkNull($scope.eval.houseind[5],i18n.t("messages.EmptyElectricitySource"))||
                    checkNull($scope.eval.houseind[6],i18n.t("messages.EmptyWaterSource"))*/
                    sweetCheckNull($scope.eval.houseind[0],i18n.t("messages.EmptyHouseSize"),"pageHousingIndex")||
                    sweetCheckNull($scope.eval.houseind[1],i18n.t("messages.EmptyHouseCondition"),"pageHousingIndex")||
                    sweetCheckNull($scope.eval.houseind[2],i18n.t("messages.EmptyRoofType"),"pageHousingIndex")||
                    sweetCheckNull($scope.eval.houseind[3],i18n.t("messages.EmptyWallType"),"pageHousingIndex")||
                    sweetCheckNull($scope.eval.houseind[4],i18n.t("messages.EmptyFloorType"),"pageHousingIndex")
    
    
                    )
                    // sweetCheckNull($scope.eval.houseind[5],i18n.t("messages.EmptyElectricitySource"),"pageHousingIndex")||
                    // sweetCheckNull($scope.eval.houseind[6],i18n.t("messages.EmptyWaterSource"),"pageHousingIndex")
                )
                {
                    //$.mobile.changePage("#pageHousingIndex");
                    return false;
                }
                // if((isNaN($scope.eval.appWorkCap)|| ($scope.husbandinfo.maritalstatus == 'M' && isNaN($scope.eval.husbWorkCap))) && secondreview===true)//||bfentry
                // { 
                //     //$.mobile.changePage("#pageWorkingCapital");
                //     swal({
                //         title: i18n.t("messages.Alert"),
                //         text: i18n.t("messages.CheckApplicantHusbandWorkCapital"),
                //         type: "warning",
                //         closeOnConfirm: true
                //     }, function(){
                //         $.mobile.changePage("#pageWorkingCapital");
                //     });
                //     return false;
                // }
                // for(var key in $scope.borrowedFunds){
                //     if(!checkFunds($scope.borrowedFunds[key])){
                //         //$.mobile.changePage("#pageWorkingCapital");
                //         swal({
                //             title: i18n.t("messages.Alert"),
                //             text: i18n.t("messages.CheckApplicantHusbandWorkCapital"),
                //             type: "warning",
                //             closeOnConfirm: true
                //         }, function(){
                //             $.mobile.changePage("#pageWorkingCapital");
                //         });
                //         return false;
                //     }
                // }
                //get confirmation from user
                //if(!confirm("Submit client evaluation request?")) return false;
                //if(!confirm(i18n.t("messages.SubmitClientEvaluationRequest"))) return false;

                //set reviewcodes, required for data entry
                
            }

            swal({
                title: i18n.t("messages.Alert"),
                text: i18n.t("messages.SubmitClientEvaluationRequest"),
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#80C6C7",
                confirmButtonText: i18n.t("messages.Yes")
            }).then(function(){
                $scope.actionSubmitSecond();
            },function(){

            });

       //      var bfentry = false;
       //      if($scope.entryList.length<1){
       //          // alert("Please check [Family Business Information] tab.\nFamily Business information is mandatory.");
			    // //alert(i18n.t("messages.MandatoryFamilyBusinessInfo"));
       //          //$.mobile.changePage("#pageFamilyBizInfo");
       //          swal({
       //              title: i18n.t("messages.Alert"),
       //              text: i18n.t("messages.MandatoryFamilyBusinessInfo"),
       //              type: "warning",
       //              closeOnConfirm: true
       //          }, function(){
       //              $.mobile.changePage("#pageFamilyBizInfo");
       //          });
       //          return false;
       //      }
            // for(key in $scope.entryList){
            //     if(!checkEntry($scope.entryList[key])){
            //         //$.mobile.changePage("#pageFamilyBizInfo");
            //         swal({
            //             title: i18n.t("messages.Alert"),
            //             text: i18n.t("messages.MandatoryFamilyBusinessInfo"),
            //             type: "warning",
            //             closeOnConfirm: true
            //         }, function(){
            //             $.mobile.changePage("#pageFamilyBizInfo");
            //         });
            //         return false;
            //     }
            // }

            var ret = false;
            for(var k=0;k<$scope.eval.usage.length;k++){
                var useof = $scope.eval.usage[k];

                if((useof.yesno=='Y' && (isNaN(useof.amt)))||
                   (k==11&&useof.yesno=='Y'&&(isNaN(useof.amt)))){ //||(useof.other==null) not sure about this
                    //console.log(useof);
                   // alert("Please check [Working Capital Usage] tab item \""+["School Fees/Expenses","House Repair/Improvements","Home Utensils/Equipment","Clothes/Shoes","Medicine, Clinic, Doctor","Food for Family","CRF","Give/Lend to other person","Save for Emergency","Repay Debts","Used by other persons","Others"][parseInt(k)]+"\"");
				    //alert(i18n.t("messages.CheckWorkCapitalUsage")[parseInt(k)]+"\"");
                    //$.mobile.changePage("#pageUse");
                    // swal({
                    //     title: i18n.t("messages.Alert"),
                    //     text: i18n.t("messages.CheckWorkCapitalUsage")[parseInt(k)]+"\"",
                    //     type: "warning",
                    //     closeOnConfirm: true
                    // }, function(){
                    //     $.mobile.changePage("#pageUse");
                    // });
                    // ret = true;
                    // return false;
                }
            }
            console.log(ret);
            if(ret) return false; 
        };


        $scope.actionSubmitSecond = function(){

            var reviewcode = 1;
            if(secondreview) reviewcode = 2;

            eligibilityNotice = "";
            //check if client is eligible for loan
            var CLIENT_STATUS = 21;
            if((sessionStorage.getItem('BRC_HOUSE_INDEX_CAP')!==0&&sessionStorage.getItem('BRC_HOUSE_INDEX_CAP')<=$scope.getHouseIndex())||
               (sessionStorage.getItem('BRC_INCOME_CAP')!==0&&sessionStorage.getItem('BRC_INCOME_CAP')<=$scope.calcBizTotal('profpermth'))||
               (sessionStorage.getItem('BRC_NO_OF_LOANS_FROM_OTHERBANKS')!==0&&sessionStorage.getItem('BRC_NO_OF_LOANS_FROM_OTHERBANKS')<=$scope.countBFBanks()))
                //||sessionStorage.getItem('BRC_WELFARE_STATUS_CAP').indexOf(","+$scope.welfareStatus+",")!='-1')
            {
                //alert("Notice:This client is not eligible for loan.");
                //alert(i18n.t("messages.ClientNotEligibleForLoan"));
                eligibilityNotice = i18n.t("messages.ClientNotEligibleForLoan");
                CLIENT_STATUS = 40;
            }

        /******************************************
        - Checks done, generate queries to update
        ******************************************/
            var cmds = [];

            //data cleaning, set to 0 if null
            for(var i=0;i<=11;i++){
                var amt = $scope.eval.usage[i].amt;
                if(amt===null||!amt) $scope.eval.usage[i].amt = 0;
            }

            var isHomeless = ($scope.eval.homeless != 'YES') ? 'N' : 'Y';

            if($scope.eval.general.note == null || $scope.eval.general.note == ''){
                $scope.eval.general.note = '-';
            }

            var remarks = "null";
            if($scope.eval.general.remarks !== undefined) remarks = $scope.eval.general.remarks;

            if($scope.UPD_CLE!==false) //edit mode, so create an update entry
            {
                var cmd = "UPDATE T_CLIENT_EVALUATION SET ";
                //cmd += " CLE_REVIEW_CODE="+reviewcode; //should not update this
                cmd += " CLE_NO_OF_WEEK='"+$scope.eval.general.disWeeks;
                cmd += "', CLE_INTERVIEW_LOCATION='"+$scope.eval.general.disLoc;
                cmd += "', CLE_IS_CLIENT_IN_BUSINESS='"+$scope.eval.general.inBusiness;
                cmd += "', CLE_NOTE='"+sanitize($scope.eval.general.note);
                cmd += "', CLE_IS_BUSINESS_WELL='"+$scope.eval.general.isWell;
                cmd += "', CLE_REASON='"+sanitize($scope.eval.general.reason);
                cmd += "', CLE_SCHOOL_FEES_WORK_CAP='"+$scope.eval.usage[0].yesno;
                cmd += "', CLE_HOUSE_REPAIR_WORK_CAP='"+$scope.eval.usage[1].yesno;
                cmd += "', CLE_HOME_UTENSILS_WORK_CAP='"+$scope.eval.usage[2].yesno;
                cmd += "', CLE_CLOTHES_SHOES_WORK_CAP='"+$scope.eval.usage[3].yesno;
                cmd += "', CLE_MEDICAL_WORK_CAP='"+$scope.eval.usage[4].yesno;
                cmd += "', CLE_FOOD_WORK_CAP='"+$scope.eval.usage[5].yesno;
                cmd += "', CLE_CRF_WORK_CAP='"+$scope.eval.usage[6].yesno;
                cmd += "', CLE_GIVE_LEND_WORK_CAP='"+$scope.eval.usage[7].yesno;
                cmd += "', CLE_SAVE_WORK_CAP='"+$scope.eval.usage[8].yesno;
                cmd += "', CLE_REPAY_DEBTS_WORK_CAP='"+$scope.eval.usage[9].yesno;
                cmd += "', CLE_OTHER_USED_WORK_CAP='"+$scope.eval.usage[10].yesno;
                cmd += "', CLE_OTHER_WORK_CAP='"+$scope.eval.usage[11].yesno;
                cmd += "', CLE_SCHOOL_FEES_EXPENSES='"+$scope.eval.usage[0].amt;
                cmd += "', CLE_HOUSE_REPAIR_IMPROVEMENT='"+$scope.eval.usage[1].amt;
                cmd += "', CLE_HOME_UTENSILS_EQUIPMENT='"+$scope.eval.usage[2].amt;
                cmd += "', CLE_CLOTHES_SHOES='"+$scope.eval.usage[3].amt;
                cmd += "', CLE_MEDICAL='"+$scope.eval.usage[4].amt;
                cmd += "', CLE_FOOD='"+$scope.eval.usage[5].amt;
                cmd += "', CLE_CRF='"+$scope.eval.usage[6].amt;
                cmd += "', CLE_GIVE_LEND='"+$scope.eval.usage[7].amt;
                cmd += "', CLE_SAVE_FOR_EMERGENCY='"+$scope.eval.usage[8].amt;
                cmd += "', CLE_REPAY_DEBTS='"+$scope.eval.usage[9].amt;
                cmd += "', CLE_OTHER_USED='"+$scope.eval.usage[10].amt;
                cmd += "', CLE_OTHER='"+sanitize($scope.eval.usage[11].other);
                cmd += "', CLE_OTHER_EXPENSES='"+$scope.eval.usage[11].amt;
                cmd += "', CLE_HOUSE_SIZE='"+$scope.eval.houseind[0];
                cmd += "', CLE_HOUSE_CONDITION='"+$scope.eval.houseind[1];
                cmd += "', CLE_ROOF_TYPE='"+$scope.eval.houseind[2];
                cmd += "', CLE_WALL_TYPE='"+$scope.eval.houseind[3];
                cmd += "', CLE_FLOOR_TYP='"+$scope.eval.houseind[4];
                cmd += "', CLE_ELETRICITY='"+$scope.eval.houseind[5];
                cmd += "', CLE_WATER_SRC='"+$scope.eval.houseind[6];
                cmd += "', CLE_HSE_INX='"+$scope.getHouseIndex();
                cmd += "', CLE_CLIENT_MET_LOCATION='"+$scope.eval.general.disLoc;
                cmd += "', CLE_WORKING_CAPITAL='"+$scope.eval.appWorkCap;
                cmd += "', CLE_HB_WORKING_CAPITAL='"+$scope.eval.husbWorkCap;
                cmd += "', CLE_FO_REMARKS='"+sanitize(remarks);
                cmd += "', CLE_HOMELESS='"+isHomeless;
                cmd += "' WHERE CLE_PK="+$scope.UPD_CLE;
                cmds.push(cmd);
             
            }else{//UPD_CLE == false, new entry so create insert query

                var cmd = "INSERT INTO T_CLIENT_EVALUATION VALUES(null,"+loanpk+","+clientpk+","+loanpk+","+reviewcode+","+
                    $scope.eval.general.disWeeks+","+
                    "'"+$scope.eval.general.disLoc+"',"+
                    "'"+$scope.eval.general.inBusiness+"',"+
                    "'"+sanitize($scope.eval.general.note)+"',"+
                    "'"+$scope.eval.general.isWell+"',"+
                    "'"+sanitize($scope.eval.general.reason)+"',"; //end
                if(secondreview){
                    for(var i=0;i<=11;i++){cmd += "'"+$scope.eval.usage[i].yesno+"',";}
                    for(var i=0;i<=11;i++){
                        var amt = $scope.eval.usage[i].amt;
                        if(amt==null||!amt||amt=='') amt = 0; //set to 0 if null
                        if(i==11&&$scope.eval.usage[11].other) cmd += "'"+sanitize($scope.eval.usage[11].other)+"',";
                        else if (i==11) cmd+="'',";
                        cmd += amt+",";//$scope.eval.usage[i].amt
                    }
                    for(var i=0;i<=6;i++){
                        if($scope.eval.houseind[i]==null||$scope.eval.houseind[i]==''){
                            cmd += "0,";
                        } else {
                            cmd += $scope.eval.houseind[i]+",";
                        }

                    }
                    cmd += $scope.getHouseIndex()+",";
                    cmd += "'"+$scope.eval.general.disLoc+"',"; //duplicate
                    //cmd += "'','',"; //MCLIENT AND CMCLIENT_MET LOCATION LEAVE AS BLANK
                    cmd += $scope.eval.appWorkCap+","+$scope.eval.husbWorkCap+",";
                    cmd += "'"+sanitize(remarks)+"',";//FO_REMARKS
                    //cmd += "'','',"; //MANAGER_REMARK, DMANAGER_REMARK
                    cmd += CLIENT_STATUS+",";

                    var USER_PK = parseInt(sessionStorage.getItem("USER_PK"));
                    cmd += USER_PK+",";
                    var date = new Date();
                    cmd += "'"+("0"+date.getDate()).slice(-2)+"/"+("0"+(date.getMonth()+1)).slice(-2)+"/"+date.getFullYear()+" ";
                    cmd += ("0"+date.getHours()).slice(-2)+":";
                    cmd += ("0"+date.getMinutes()).slice(-2)+":";
                    cmd += ("0"+date.getSeconds()).slice(-2)+"',";
                    cmd += "'"+isHomeless+"', ";
                } else {
                    for(var i=0;i<=11;i++){cmd += "'', ";}
                    for(var i=0;i<=11;i++){  cmd += "'', ";}
                    cmd += "0,";
                    for(var i=0;i<=6;i++){ cmd += "0,"; }
                    cmd += "0,"; //housing
                    cmd += "'',"; //duplicate
                    //cmd += "'','',"; //MCLIENT AND CMCLIENT_MET LOCATION LEAVE AS BLANK
                    cmd += "'','',";
                    cmd += "'-',";//FO_REMARKS
                    //cmd += "'','',"; //MANAGER_REMARK, DMANAGER_REMARK
                    cmd += CLIENT_STATUS+",";

                    var USER_PK = parseInt(sessionStorage.getItem("USER_PK"));
                    cmd += USER_PK+",";
                    var date = new Date();
                    cmd += "'"+("0"+date.getDate()).slice(-2)+"/"+("0"+(date.getMonth()+1)).slice(-2)+"/"+date.getFullYear()+" ";
                    cmd += ("0"+date.getHours()).slice(-2)+":";
                    cmd += ("0"+date.getMinutes()).slice(-2)+":";
                    cmd += ("0"+date.getSeconds()).slice(-2)+"',";
                    cmd += "'', "; 
                }
                var specs = "";
                if( $scope.eval.arta.specs1 !== null ||
                    $scope.eval.arta.specs2 !== null ||
                    $scope.eval.arta.specs3 !== null ||
                    $scope.eval.arta.specs4 !== null){
                        specs = $scope.eval.arta.specs1+"~"+$scope.eval.arta.specs2+"~"+$scope.eval.arta.specs3+"~"+$scope.eval.arta.specs4;
                }
                var CLT_SIGNATURE = "";
                if(!$scope.secondreview) CLT_SIGNATURE = $scope.client.CLT_SIGNATURE;


                if($scope.eval.arta.type=='GOODS'){
                    $scope.eval.arta.kwh = "";
                    $scope.eval.arta.completiontime = "";
                    $scope.eval.arta.addfee = "";
                } else if ($scope.eval.arta.type == 'INSTALLATION'){
                    $scope.eval.arta.goodscondition = "";
                    specs = "";
                    $scope.eval.arta.noshipcost = "";
                    $scope.eval.arta.deliveryOnTime = ""; 
                }

                cmd += "'"+$scope.eval.everInArreas+"', "; //CLE_EVER_IN_ARREARS
                cmd += "'"+$scope.eval.everInJointResponse+"', "; //CLE_EVER_IN_JOINT_RESPONSIBILITY
                cmd += "'"+$scope.eval.arta.type+"', "; //CLE_ARTA_TYPE
                cmd += "'"+specs+"', "; //CLE_ARTA_SPECS
                cmd += "'"+$scope.eval.arta.noshipcost+"', "; //CLE_ARTA_NOSHIP_COST
                cmd += "'"+$scope.eval.arta.deliveryOnTime+"', "; //CLE_ARTA_DELIVERY_ONTIME
                cmd += "'"+$scope.eval.arta.completiontime+"', "; //CLE_ARTA_COMPLETION_ONTIME
                cmd += "'"+$scope.eval.arta.addfee+"', "; //CLE_ARTA_NOADD_FEE
                cmd += "'"+$scope.eval.arta.complaint+"', "; //CLE_ARTA_COMPLAINT
                cmd += "'"+$scope.eval.agri.qseeds+"', "; //CLE_AGRI_QSEED
                cmd += "'"+$scope.eval.agri.healthynursery+"', "; //CLE_AGRI_HEALTHY_NURSERY
                cmd += "'"+$scope.eval.agri.goodcrop+"', "; //CLE_AGRI_GOOD_CROP
                cmd += "'"+$scope.eval.agri.landrediness+"', "; //CLE_AGRI_LAND_READY
                cmd += "'"+$scope.eval.agri.recommenddisbursement+"', "; //CLE_DISBURSEMENT_RECOMMENDATION
                cmd += "'"+$scope.eval.arta.goodscondition+"', "; //CLE_ARTA_GOODS_CONDITION
                cmd += "'"+$scope.eval.arta.kwh+"', "; //CLE_ARTA_KWH
                cmd += "'"+$scope.eval.agri.others+"', "; //CLE_AGRI_OTHERS


                cmd += "'"+CLT_SIGNATURE+"', ";
                cmd += "'', "; // CLE_MGR_PK
                cmd += "'', "; // CLE_MGR_SIGN
                cmd += USER_PK+", "; // CLE_FO_PK
                cmd += "'', "; // CLE_FO_SIGN
                cmd += $scope.ctr_lead.ctr_lead_pk+", "; // CLE_CTR_LEAD_PK
                cmd += "'"+$scope.ctr_lead.Signature+"', "; //CLE_CTR_LEAD_SIGN
                cmd += $scope.eval.edu.householdmembers+", "; //CLE_HOUSEHOLD_MEMBERS
                cmd += $scope.eval.edu.noofchildren+", "; //CLE_NO_OF_CHILDREN
                cmd += $scope.eval.edu.noofchildrenschooling+", "; //CLE_NO_OF_CHILDREN_IN_SCHOOLING
                cmd += "'"+$scope.eval.general.compliance+"', "; // CLE_COMPLIANCE
                cmd += "'"+$scope.eval.general.compliance_others+"', "; // CLE_COMPLIANCE_OTHERS
                cmd += "'"+$scope.eval.otherinstitues+"', " ; // CLE_OTHER_INSTITUINAL_FINANCING
                cmd += "'"+$scope.eval.institutename+"', " ; //CLE_OTHER_INSTITUITIONAL_NAME
                cmd += "'"+$scope.eval.amountfinanced+"', "; //CLE_AMOUNT_OF_FINANCING
                cmd += "'"+$scope.eval.projectionpaid+"', " ; //CLE_PAID_OFF
                cmd += "'"+$scope.eval.general.note+"', " ; //CLE_FO_NOTE
                cmd += "'"+$scope.eval.otherinstituesrepayperweek+"'," ;//CLE_REPAY_PER_WEEK
                cmd += "'"+$scope.eval.assetcondition+"',"; //CLE_ASSET_CONDITION
                cmd += "'"+$scope.eval.totalasset+"',", //CLE_TOTAL_ASSET
                cmd += "'"+$scope.eval.husband_income+"',", //CLE_HUSBAND_INCOME
                cmd += "'"+$scope.eval.wife_income+"',", //CLE_WIFE_INCOME
                cmd += "'"+$scope.eval.other_income+"',", //CLE_OTHER_INCOME
                cmd += "'"+$scope.eval.household_expenses+"',", //CLE_HOUSEHOLD_EXPENSES
                cmd += "'"+$scope.eval.education_expenses+"',", //CLE_EDUCATION_EXPENSES
                cmd += "'"+$scope.eval.extra_expenses+"',", //CLE_EXTRA_EXPENSES
                cmd += " 1) ";
                //cmd += "'','','','')";
                console.log(cmd); 
             
                myDB.execute(cmd,function(results){
                    console.log(results);
                   
                    myDB.execute("SELECT CLE_PK FROM T_CLIENT_EVALUATION WHERE CLE_MOB_NEW = 1 ORDER BY P_ID DESC LIMIT 1",function(res){
                        var CLE_PK = res[0].CLE_PK; 
                  
                        //processing deletion by user
                        //family business information
                        // $scope.deleteFBI.forEach(function(del,num){
                        //     cmds.push("DELETE FROM T_CLIENT_EVALUATION_BIZ WHERE P_ID="+del );
                        //     ////console.log("DELETE FROM T_CLIENT_EVALUATION_BIZ WHERE P_ID="+del );
                        // });
                        if(secondreview){
                            $scope.deleteBF.forEach(function(del,num){
                                cmds.push("DELETE FROM T_CLIENT_EVAL_BORROWED_FUNDS WHERE P_ID="+del );
                                ////console.log("DELETE FROM T_CLIENT_EVAL_BORROWED_FUNDS WHERE P_ID="+del );
                            });
                            //Delete All Biz
                            myDB.execute("DELETE FROM T_CLIENT_EVALUATION_BIZ WHERE CEB_CLT_PK="+clientpk,function(res){

                            });
                            //Delelte All Assets
                            myDB.execute("DELETE FROM T_CLIENT_EVAL_ASSET_LIST WHERE CEAL_CLT_PK="+clientpk,function(res){

                            });

                            for(var akey in $scope.unproassets){
                                //console.log($scope.unproassets[akey]);
                                if($scope.unproassets[akey].asset !== ""){ 
                                    cmds.push("INSERT INTO T_CLIENT_EVAL_ASSET_LIST VALUES(null,null,"+CLE_PK+", "+clientpk+","+loanpk+",'"+$scope.unproassets[akey].asset+"','"+$scope.unproassets[akey].value+"')");
                                }
                            }

                            //business income update and inserts
                            $.each($scope.houseIncomes,function(i,income){
                                console.log(income);
                                var incomedetails = "";
                                if(income.detaildesc === null || income.detaildesc == "" || income.detaildesc == "null"){
                                    incomedetails = 'null';
                                } else {
                                    var det = 0;
                                    if(income.details !== null && income.details !== '' && !isNaN(income.details)) det = income.details;
                                    incomedetails =  det+" "+income.detaildesc;
                                }

                                var newcmd = "INSERT INTO T_CLIENT_EVALUATION_BIZ VALUES(null,";
                                    newcmd +=  CLE_PK+","+loanpk+","+clientpk+","+loanpk+","; //
                                    newcmd += "'"+income.source+"',";
                                    newcmd += "'"+incomedetails+"',";
                                    newcmd += "'"+income.fixed+"',";
                                    newcmd += "'"+income.variable+"',1)";
                                    cmds.push(newcmd);

                            });  
                            //only if status is 19
                            //second review has more fields to process in database
                            
                            $.each($scope.borrowedFunds,function(i,funds){
                                var newcmd = "";
                                if(funds.id){ //if existing fund (has id), update it
                                    //update
                                    newcmd = "UPDATE T_CLIENT_EVAL_BORROWED_FUNDS SET ";
                                    newcmd += " EEF_LOAN_FROM='"+funds.loanfrom+"',";
                                    newcmd += " EEF_LOAN_FROM_NAME='"+sanitize(funds.loanfromname)+"',";
                                    newcmd += " EEF_BORROWED_BY='"+funds.applicant+"',";
                                    newcmd += " EEF_ORGINAL_AMT='"+funds.originalamt+"',";
                                    newcmd += " EEF_BALANCE_AMT='"+funds.balance+"',";
                                    newcmd += " EEF_REPAY_PER_WEEK='"+funds.repaymentperwk+"',";
                                    newcmd += " EEF_REPAY_PER_MONTH='"+funds.repaymentpermth+"'";
                                    newcmd += " EEF_LOAN_PAID_OFF='"+funds.loanpaidoff+"'"; 
                                    newcmd += " WHERE P_ID='"+funds.id+"'";
                                    cmds.push(newcmd);
                                }else{ //new fund, insert


                                    var repaymentPerMonth = parseFloat(funds.repaymentperwk) * 4;

                                    newcmd = "INSERT INTO T_CLIENT_EVAL_BORROWED_FUNDS VALUES(null,";
                                    newcmd += CLE_PK+","+loanpk+","+clientpk+","+loanpk+","; //clientpk+","+
                                    newcmd += "'"+funds.loanfrom+"',";
                                    newcmd += "'"+sanitize(funds.loanfromname)+"',";
                                    newcmd += "'"+funds.applicant+"',";
                                    newcmd += funds.originalamt+",";
                                    newcmd += funds.balance+",";
                                    newcmd += funds.repaymentperwk+",";
                                    newcmd += repaymentPerMonth+",";
                                    newcmd += "'"+funds.loanpaidoff+"',1)";
                                    cmds.push(newcmd);
                                }
                            });
                        }

                        var nlstat = 41; //new loan status
                        if(loanstatus==19) nlstat = 42; //if second review, update this to second review completed
                        if(loanstatus==59) nlstat = 19; //if bothreview, update this to second review

                        if($scope.UPD_CLE===false&&(loanstatus!=41||loanstatus!=42)){
                            cmds.push('UPDATE T_CLIENT_LOAN SET CLL_STATUS='+nlstat+' WHERE CLL_PK='+loanpk);
                        }
                        checkLogin(); //check login again

                        //    var BRC_PK = parseInt(sessionStorage.getItem("BRC_PK"));
                        //    var CLL_ORIGINAL_LOAN = sessionStorage.getItem("CLL_ORIGINAL_LOAN");
                        //    var CLL_LOAN_INTEREST = sessionStorage.getItem("CLL_LOAN_INTEREST");
                        //    var CLL_CRF_PERCENTAGE = sessionStorage.getItem("CLL_CRF_PERCENTAGE");

                        /*    var CLIENT_STATUS = 7;
                        if(sessionStorage.getItem('BRC_HOUSE_INDEX_CAP')<$scope.getTotal()||
                        sessionStorage.getItem('BRC_INCOME_CAP')<$scope.getCurrency('netrev')||
                        sessionStorage.getItem('BRC_NO_OF_LOANS_FROM_OTHERBANKS')<$scope.countBFBanks()||
                        sessionStorage.getItem('BRC_WELFARE_STATUS_CAP').indexOf(","+$scope.welfareStatus+",")!='-1'){
                        alert("Notice:This client is not eligible for loan.");
                        CLIENT_STATUS = 27;
                        }
                        */

                        //execute the cmds
                        //console.log(cmds);
                        myDB.dbShell.transaction(function(tx){
                            for(var e in cmds){
                                cmds[e] = cmds[e].replace(/undefined/g, ""); //remove undefined and replace with empty string
                                tx.executeSql(cmds[e]);
                                console.log(cmds[e]);
                            }
                        //  }, function(err){alert("Error saving evaluation.");return true;}, function(suc){
                        }, function(err){
                            //alert(i18n.t("messages.SaveEvaluationError"));
                            console.log(err);
                            $scope.redirectCallback('failed');
                        }, function(suc){
                           // alert("Successfully added evaluation.");
                            //alert(i18n.t("messages.SaveEvaluationSuccess"));

                            //alert("success add");
                            if(eligibilityNotice == ""){
                                $scope.redirectCallback('success');
                            } else {
                                $scope.redirectCallback('noteligible');
                            }
                            //window.location.href = "client.html";
                            //alert('finish');
                        });

                    })
                });
            } 
            
        };

        $scope.redirectCallback = function(type){

            if(type == "failed"){
                swal({
                    title: i18n.t("messages.Alert"),
                    text: i18n.t("messages.SaveEvaluationError"),
                    type: "error",
                    confirmButtonColor: "#80C6C7",
                    confirmButtonText: "Ok", 
                });
            } else if (type == "noteligible"){
                swal({
                    title: i18n.t("messages.Alert"),
                    text: i18n.t("messages.ClientNotEligibleForLoan"),
                    type: "error",
                    confirmButtonColor: "#80C6C7",
                    confirmButtonText: "Ok"
                }).then(function(isConfirm){
                    if(isConfirm){
                        window.location.href = "client.html";
                    }
                },function(){

                });
            } else if (type == "success"){
                swal({
                    title: i18n.t("messages.AlertSuccess"),
                    text: i18n.t("messages.ReviewClientSuccess"),
                    type: "success",
                    confirmButtonColor: "#80C6C7",
                    confirmButtonText: "Ok",
                    allowOutsideClick: false
                }).then(function(isConfirm){
                    if(isConfirm){
                        window.location.href = "client.html";
                    }
                },function(){

                });
            }
            //window.location.href = "client.html";
        };

        /******************************************
        - Load database values
        ******************************************/
        var t = this;
        var s = $scope;
        $scope.selectCodes = {};
        $scope.nameCodes = {};
        /******************************************
        -Prep data for select boxes
        ******************************************/
        $scope.selectCodes["Business"] = [
            {name:"YES",value:"Y"},
            {name:"NO",value:"N"},
            {name:"NOT YET",value:"NY"}
        ];
        $scope.selectCodes["BusinessWell"] = [
            {name:"YES",value:"Y"},
            {name:"NO",value:"N"},
            {name:"SO-SO",value:"S"}
        ];
        $scope.nameCodes["Business"] = {};
        $.each($scope.selectCodes["Business"], function(id, biz){
            $scope.nameCodes["Business"][biz.value] = biz.name;
        });
        $scope.nameCodes["BusinessWell"] = {};
        $.each($scope.selectCodes["BusinessWell"], function(id, biz){
            $scope.nameCodes["BusinessWell"][biz.value] = biz.name;
        }); //!Note: no idea why I wrote this.. must be half dazed

        //loading T_TXN_TABLES values to populate fields
        myDB.T_CODE.get("CODE_TYPE_PK=5 OR CODE_TYPE_PK=18",function(results){
            //saving those values into $scope.selectCodes for easy access
            results.forEach(function(value,index){
                s.selectCodes[value.CODE_TYPE_PK] || (s.selectCodes[value.CODE_TYPE_PK] = []); //init if null
                var keypair = {'name': value.CODE_NAME,'value': value.CODE_VALUE};
                s.selectCodes[value.CODE_TYPE_PK].push(keypair);
                    s.nameCodes[value.CODE_TYPE_PK] || (s.nameCodes[value.CODE_TYPE_PK]={});
                    s.nameCodes[value.CODE_TYPE_PK][value.CODE_VALUE] = value.CODE_NAME;
            });
            s.$apply(function(){s.selectCodes;});
            s.populateFields(); //move on to the next step, check if this is a new evaluation or updating evaluation
        });

        //loading T_TXN_TABLES values to populate fields
        myDB.T_CODE.get("CODE_TYPE_PK=5 OR CODE_TYPE_PK=43",function(results){
            //saving those values into $scope.selectCodes for easy access
            results.forEach(function(value,index){
                s.selectCodes[value.CODE_TYPE_PK] || (s.selectCodes[value.CODE_TYPE_PK] = []); //init if null
                var keypair = {'name': value.CODE_NAME,'value': value.CODE_VALUE};
                s.selectCodes[value.CODE_TYPE_PK].push(keypair);
                    s.nameCodes[value.CODE_TYPE_PK] || (s.nameCodes[value.CODE_TYPE_PK]={});
                    s.nameCodes[value.CODE_TYPE_PK][value.CODE_VALUE] = value.CODE_NAME;
            });
            s.$apply(function(){s.selectCodes;});
            s.populateFields(); //move on to the next step, check if this is a new evaluation or updating evaluation
        });



        /******************************************
        //Get client info
        ******************************************/
        myDB.execute("SELECT CLT_FULL_NAME,CLT_OTH_REG_NO,CLT_MARITAL_STATUS,CLT_CLEINT_ID, CAST(CLT_CENTER_ID as INTEGER) as CLT_CENTER_ID FROM T_CLIENT WHERE CLT_PK="+clientpk,function(clientres){
            $scope.client = {
                CLT_FULL_NAME : clientres[0].CLT_FULL_NAME,
                CLT_OTH_REG_NO : clientres[0].CLT_OTH_REG_NO,
                CLT_CLEINT_ID : clientres[0].CLT_CLEINT_ID,
                CLT_PK : clientpk,
                CLT_CENTER_ID: clientres[0].CLT_CENTER_ID
            };
            $scope.getGroupLeaders();
            $scope.husbandinfo.maritalstatus = clientres[0].CLT_MARITAL_STATUS;
            $scope.$apply();
        });

        /******************************************
        // load from evaluation review 1 (to populate fields)
        ******************************************/

        $scope.loadHouseOne = function(){

            var sqlcmd = "SELECT CLE_HOUSE_SIZE as ncHSSZ,CLE_HOUSE_CONDITION as ncCOND,CLE_ROOF_TYPE as ncROOF,CLE_WALL_TYPE as ncWALL,CLE_FLOOR_TYP as ncFLOR,CLE_ELETRICITY as ncELEC,CLE_WATER_SRC as ncWATR FROM T_CLIENT_EVALUATION WHERE CLE_REVIEW_CODE=1 AND CLE_CLL_PK="+loanpk+" AND CLE_CLT_PK="+clientpk;
            myDB.execute(sqlcmd,function(houseres){  
                if(houseres.length>0){
                    $scope.loadHouseUI(houseres[0]); //load data and properly display the UI
                } else {
                    $scope.loadDefaultHouseUI();
                }
            });
        };

        /******************************************
        // load from loan record instead
        ******************************************/
        $scope.loadHouseLoan = function(){
              var sqlcmd = "SELECT CLL_HOUSE_SIZE as ncHSSZ,CLL_HOUSE_CONDITION as ncCOND ,CLL_ROOF_TYPE as ncROOF,CLL_WALL_TYPE as ncWALL,CLL_FLOOR_TYP as ncFLOR,CLL_ELETRICITY as ncELEC,CLL_WATER_SRC as ncWATR FROM T_CLIENT_LOAN WHERE CLL_PK="+loanpk+" AND CLL_CLT_PK="+clientpk;
            myDB.execute(sqlcmd,function(houseres){
                if(houseres.length>0){
                    $scope.loadHouseUI(houseres[0]);
                }
            });
        };

        /******************************************
        // Take data and propagate the UI
        ******************************************/
        $scope.loadHouseUI = function(houseres){ 
            var selectboxes = ['ncHSSZ','ncCOND','ncROOF','ncWALL','ncFLOR','ncELEC','ncWATR'];
            for(var i=0;i<=4;i++){
                var findX = 0;
                for(test in s.selectHome[i+2]){ //finding the right value to set the selectboxes
                    if(s.selectHome[i+2][test].value==houseres[selectboxes[i]])
                        findX = test;
                }
                s.eval.houseind[i] = houseres[selectboxes[i]]+"";
                s.$apply(function(){s.eval;});
               // $('#'+selectboxes[i]).parent().find('span').html(s.selectHome[i+2][findX].name);
			    $('#'+selectboxes[i]).parent().find('span').html($filter('translate')(s.selectHome[i+2][findX].name));
            }
        };
        $scope.loadDefaultHouseUI = function( ){ 

            var selectboxes = ['ncHSSZ','ncCOND','ncROOF','ncWALL','ncFLOR','ncELEC','ncWATR'];
            for(var i=0;i<=4;i++){
                var findX = 0;
                console.log(s.selectHome[i+2]);
                $.each(s.selectHome[i+2],function(si,opt){
                    if(opt.value == s.eval.houseind[i]){
                        findX = si;
                    }
                })
                //$scope.eval.houseind
                s.eval.houseind[i] = s.selectHome[i+2][findX].value;
                s.$apply(function(){s.eval;});
               // $('#'+selectboxes[i]).parent().find('span').html(s.selectHome[i+2][findX].name);
                $('#'+selectboxes[i]).parent().find('span').html($filter('translate')(s.selectHome[i+2][findX].name));
            }
        };

        /******************************************
        - Begin grabbing values from database after selectboxes are set up
        ******************************************/

        $scope.UPD_CLE = false; //UPD = update, = false (defaults to a new entry)

        $scope.populateFields = function(){
            if(secondreview){ //second review
                myDB.T_CLIENT_EVALUATION.get("CLE_CLT_PK="+clientpk+" AND CLE_CLL_PK="+loanpk+" AND CLE_REVIEW_CODE=2", function(ceres){
                       if(ceres.length==0){
                           $scope.loadFirst(); //for this case not editing anything, consider a new entry for review 2
                       }else{
                           //load and set editable to 1
                           //for this case editing review 2, set edit case
                           $scope.UPD_CLE = ceres[0].CLE_PK; //set edit to true
                           $scope.loadRecords(ceres[0]);
                       }
                });
            }else{ //first review
                $scope.loadFirst();
            }
        };

        /******************************************
        - Begin grabbing values from database after selectboxes are set up
        ******************************************/
        $scope.loadFirst = function(){
            myDB.T_CLIENT_EVALUATION.get("CLE_CLT_PK="+clientpk+" AND CLE_CLL_PK="+loanpk+" AND CLE_REVIEW_CODE=1",function(ceres){
                if(ceres.length==0){
                    //dont do anything except set option boxes

                    $('#GQLocation').parent().find('span').html($filter('translate')($scope.selectCodes[18][0].name));
                 //   $('#GQBusiness').parent().find('span').html($scope.nameCodes['Business']["Y"]);

				    $('#GQBusiness').parent().find('span').html($filter('translate')($scope.nameCodes['Business']["Y"]));

                    $('#GQBusinessWell').parent().find('span').html($filter('translate')($scope.nameCodes['BusinessWell']["Y"]));
                    //set working capital to all NO
                    for(var i=0;i<=11;i++){
                        $scope.eval.usage[i].yesno = "N";
                      //  $('#WC'+i).parent().find('span').html($scope.nameCodes[5]["N"]);
					    $('#WC'+i).parent().find('span').html($filter('translate')($scope.nameCodes[5]["N"]));
                    }
                }else{
                    //if it is not second review i.e is first review, and there is a existing record.. we're editing
                    if(!secondreview)
                        $scope.UPD_CLE = ceres[0].CLE_PK; //set edit to true
                    //load and set editable to 1
                    $scope.loadRecords(ceres[0]);
                }
            });
        };



        /******************************************
        - load records and properly prepare them for displaying and saving
        ******************************************/
        //receive the eval record, now load the rest with loadRecords
        $scope.loadRecords = function(cerec){
            $scope.eval.general.remarks = cerec.CLE_FO_REMARKS;
            $scope.eval.general.disLoc = cerec.CLE_INTERVIEW_LOCATION;
            $scope.eval.general.inBusiness = cerec.CLE_IS_CLIENT_IN_BUSINESS;
            $scope.eval.general.note = cerec.CLE_NOTE;
            $scope.eval.general.isWell = cerec.CLE_IS_BUSINESS_WELL;
            $scope.eval.general.reason = cerec.CLE_REASON;
            $scope.eval.usage[0].yesno = cerec.CLE_SCHOOL_FEES_WORK_CAP;
            $scope.eval.usage[1].yesno = cerec.CLE_HOUSE_REPAIR_WORK_CAP;
            $scope.eval.usage[2].yesno = cerec.CLE_HOME_UTENSILS_WORK_CAP;
            $scope.eval.usage[3].yesno = cerec.CLE_CLOTHES_SHOES_WORK_CAP;
            $scope.eval.usage[4].yesno = cerec.CLE_MEDICAL_WORK_CAP;
            $scope.eval.usage[5].yesno = cerec.CLE_FOOD_WORK_CAP;
            $scope.eval.usage[6].yesno = cerec.CLE_CRF_WORK_CAP;
            $scope.eval.usage[7].yesno = cerec.CLE_GIVE_LEND_WORK_CAP;
            $scope.eval.usage[8].yesno = cerec.CLE_SAVE_WORK_CAP;
            $scope.eval.usage[9].yesno = cerec.CLE_REPAY_DEBTS_WORK_CAP;
            $scope.eval.usage[10].yesno = cerec.CLE_OTHER_USED_WORK_CAP;
            $scope.eval.usage[11].yesno = cerec.CLE_OTHER_WORK_CAP;
            $scope.eval.usage[0].amt = cerec.CLE_SCHOOL_FEES_EXPENSES;
            $scope.eval.usage[1].amt = cerec.CLE_HOUSE_REPAIR_IMPROVEMENT;
            $scope.eval.usage[2].amt = cerec.CLE_HOME_UTENSILS_EQUIPMENT;
            $scope.eval.usage[3].amt = cerec.CLE_CLOTHES_SHOES;
            $scope.eval.usage[4].amt = cerec.CLE_MEDICAL;
            $scope.eval.usage[5].amt = cerec.CLE_FOOD;
            $scope.eval.usage[6].amt = cerec.CLE_CRF;
            $scope.eval.usage[7].amt = cerec.CLE_GIVE_LEND;
            $scope.eval.usage[8].amt = cerec.CLE_SAVE_FOR_EMERGENCY;
            $scope.eval.usage[9].amt = cerec.CLE_REPAY_DEBTS;
            $scope.eval.usage[10].amt = cerec.CLE_OTHER_USED;
            $scope.eval.usage[11].other = cerec.CLE_OTHER;
            $scope.eval.usage[11].amt = cerec.CLE_OTHER_EXPENSES;
            if(secondreview==true&&($scope.UPD_CLE!==false)){
                $scope.eval.appWorkCap = cerec.CLE_WORKING_CAPITAL;
                $scope.eval.husbWorkCap = cerec.CLE_HB_WORKING_CAPITAL;
            }
            //do ui prep
            //$('#GQLocation').parent().find('span').html($scope.nameCodes[18][$scope.eval.general.disLoc]);
			$('#GQLocation').parent().find('span').html($filter('translate')($scope.nameCodes[18][$scope.eval.general.disLoc]));

			//$('#GQBusiness').parent().find('span').html($scope.nameCodes['Business'][$scope.eval.general.inBusiness]);
			$('#GQBusiness').parent().find('span').html($filter('translate')($scope.nameCodes['Business'][$scope.eval.general.inBusiness]));

			//$('#GQBusinessWell').parent().find('span').html($scope.nameCodes['BusinessWell'][$scope.eval.general.isWell]);
			$('#GQBusinessWell').parent().find('span').html($filter('translate')($scope.nameCodes['BusinessWell'][$scope.eval.general.isWell]));

			//for(var i=0;i<=11;i++) $('#WC'+i).parent().find('span').html($scope.nameCodes[5][$scope.eval.usage[i].yesno]);
			for(var i=0;i<=11;i++) $('#WC'+i).parent().find('span').html($filter('translate')($scope.nameCodes[5][$scope.eval.usage[i].yesno]));
            myDB.T_CLIENT_EVALUATION_BIZ.get("CEB_CLT_PK="+clientpk+" AND CEB_CLL_PK="+loanpk+" AND CEB_CLE_PK="+cerec.CLE_PK,function(cebres){
                if(cebres.length>0){
                    $scope.UPD_CEB = true; //set edit to true
                    $.each(cebres,function(id, cebrec){
                        var newcebrec = {};
                        if($scope.UPD_CLE!=false) newcebrec.id = cebrec.P_ID; //required for updating //USING MOBILE ONLY P_ID
                        newcebrec.activities = cebrec.CEB_OCCUP_ACTIVITY;
                        newcebrec.applicant = cebrec.CEB_CAPITAL_BY;
                        newcebrec.wkcapital = cebrec.CEB_WORK_CAPITAL;
                        newcebrec.owncapital = cebrec.CEB_OWN_WORK_CAPITAL;
                        newcebrec.location = cebrec.CEB_WORK_LOCATION;
                        newcebrec.revperwk = cebrec.CEB_WAGE_MTH;
                        newcebrec.expperwk = cebrec.CEB_EXPENSE_MTH;
                        newcebrec.profperwk = cebrec.CEB_PROFIT_MTH;
                        newcebrec.totaldays = cebrec.CEB_TOTAL_DAYS_MTH;
                        $scope.entryList.push(newcebrec);
                    });
                    $scope.$apply(function(){$scope.entryList;});
                }
            });
            if(secondreview){
                myDB.T_CLIENT_EVAL_BORROWED_FUNDS.get("EEF_CLT_PK="+clientpk+" AND EEF_CLL_PK="+loanpk+" AND EEF_CLE_PK="+cerec.CLE_PK,function(cebfres){
                    //load all and save
                    $.each(cebfres,function(id, cebfres){
                        var newcebfrec = {};
                        if($scope.UPD_CLE!=false) newcebfrec.id = cebfres.P_ID; //USING MOBILE ONLY P_ID
                        newcebfrec.loanfrom = cebfres.EEF_LOAN_FROM;
                        newcebfrec.loanfromname = cebfres.EEF_LOAN_FROM_NAME;
                        newcebfrec.applicant = cebfres.EEF_BORROWED_BY;
                        newcebfrec.originalamt = cebfres.EEF_ORGINAL_AMT;
                        newcebfrec.balance = cebfres.EEF_BALANCE_AMT;
                        newcebfrec.repaymentperwk = cebfres.EEF_REPAY_PER_WEEK;
                        newcebfrec.repaymentpermth = cebfres.EEF_REPAY_PER_MONTH;
                        $scope.borrowedFunds.push(newcebfrec);
                    });
                    $scope.$apply(function(){$scope.borrowedFunds;});
                });
            }
        }

        $scope.checkprogress = function(page,$event){


        }


        $scope.showSignscreen = function(ind, type){

            type = typeof type !== 'undefined' ? type : null;

            if(!$scope.showSign){
                $scope.showSign = true;
                setTimeout(function(){
                    if(type == null){
                        $scope.signingclientIndex = 0;
                        var client = $scope.client;
                        $scope.loadSignaturePad(client);
                    } else {
                        $scope.loadSignaturePad(null,type);
                        $scope.signinguser = type;
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
                    'background': '#EEEEEE',
                    'decor-color': 'transparent',
                });
            }

            $('#signature').jSignature('clear');
            $('.displayarea').html('');

            context.clearRect(0, 0, canvas.width, canvas.height);

            $('.jSignature').css('background','#EEE');
            $('.jSignature').css('border-bottom','2px solid black');
            $('.jSignature').css('margin-bottom','15px');

            if(type == null){
                $('#signingperson').html('<h3><p>'+client.CLT_FULL_NAME+' Sign Here</p></h3>');
            } else if (type == 'officer') {
                $('#signingperson').html('<h3><p>'+$scope.user.userName+' Sign Here</p></h3>');
            } else if (type == 'mgr'){
                $('#signingperson').html('<h3><p>'+$scope.MGR.mgrname+' Sign Here</p></h3>');
            } else if (type == 'ctr_lead'){
                $('#signingperson').html('<h3><p>'+$scope.ctr_lead.ctr_lead_name+' Sign Here</p></h3>');
            }

            $('html, body').animate({
                scrollTop: $("#the-canvas").offset().top - 90
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
                //console.log($scope.user);

                myDB.execute("UPDATE T_USER SET USER_SIGNATURE ='', USER_HAVE_SIGNATURE='N' WHERE USER_PK = "+$scope.user.userPK, function(res){
                    $scope.$apply(function(){
                        $scope.user.hasSigned = false;
                        $scope.user.Signature = '';
                        sessionStorage.setItem("USER_SIG",null);
                        sessionStorage.setItem("USER_HAVE_SIG","N");
                    });
                });
                // myDB.execute("SELECT * FROM T_USER WHERE USER_PK = "+$scope.user.userPK, function(res){
                //     //console.log(res);
                // });
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

            //$scope.$apply();

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
            } else if (type == 'ctr_lead'){
                var dsrc = atob($scope.ctr_lead.Signature);

                var img2 = new Image();
                img2.onload = (function(){
                    var canv = $('#the-canvas-'+$scope.ctr_lead.ctr_lead_pk)[0];
                    var cont = canv.getContext("2d");
                    cont.drawImage(img2,0,0,300,150);
                });
            }

            img2.src = dsrc;
        }

        $scope.importImg = function(){

            var data = $sigdiv.jSignature('getData', 'image');

            var dsrc = 'data:' + data[0] + ',' + data[1];
            var png = $sigdiv.jSignature('getData','base30');

            var blob = btoa(dsrc);
            var ratio = canvas.height / 200;

            ht = canvas.height / ratio;

            var img2 = new Image();
            img2.onload = (function(){
                //console.log($scope.signingclientIndex);
                if($scope.signingclientIndex != null){
                    var client = $scope.client;
                    //console.log(client);
                    var canv = $('#the-canvas-'+client.CLT_PK)[0];
                    $scope.$apply(function(){
                        client.hasSigned = true;
                        client.CLT_SIGNATURE = blob;
                    })

                    $scope.signingclientIndex = null;
                } else if($scope.signinguser === 'officer'){
                    var canv = $('#the-canvas-officer')[0];
                    $scope.$apply(function(){
                        $scope.user.hasSigned = true;
                        $scope.user.Signature = blob;
                    });

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
                } else if ($scope.signinguser === 'ctr_lead'){
                    var canv = $('#the-canvas-ctr_lead')[0];
                    $scope.$apply(function(){
                        $scope.ctr_lead.hasSigned = true;
                        $scope.ctr_lead.Signature = blob;
                    })
                }

                $scope.clearSigPad();
                var cont = canv.getContext("2d");
                cont.drawImage(img2, 0, 0, 300, 150);
                $scope.showSign = false;

                $('html, body').animate({
                    scrollTop: $("#client-signatures").offset().top - 90
                }, 500);

                $scope.$apply();
            });

            img2.src = dsrc;
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

        $scope.getUserSignature = function(){
            myDB.execute("SELECT USER_SIGNATURE, USER_HAVE_SIGNATURE FROM T_USER WHERE USER_PK='"+$scope.user.userPK+"'" ,function(results){

                $scope.user.Signature = (results[0].USER_SIGNATURE === null ? '' : results[0].USER_SIGNATURE);
                //console.log(results[0].USER_HAVE_SIGNATURE);
                if(results[0].USER_HAVE_SIGNATURE == 'Y') {
                    $scope.user.hasSigned = true;
                    $scope.showSignature('officer');
                }
            });
        } 

        $scope.artaLoanTypeToggle = function(){
            
            console.log($scope.eval.arta.type);
            if($scope.eval.arta.type == 'GOODS'){
                $('label[for="eval_arta_goods"]').addClass('ui-checkbox-on');
                $('label[for="eval_arta_goods"]').removeClass('ui-checkbox-off');
                $('label[for="eval_arta_install"]').removeClass('ui-checkbox-on');
                $('label[for="eval_arta_install"]').addClass('ui-checkbox-off');
 
            } else if ($scope.eval.arta.type == 'INSTALLATION'){
                $('label[for="eval_arta_install"]').addClass('ui-checkbox-on');
                $('label[for="eval_arta_install"]').removeClass('ui-checkbox-off');
                $('label[for="eval_arta_goods"]').removeClass('ui-checkbox-on');
                $('label[for="eval_arta_goods"]').addClass('ui-checkbox-off');
  
            }
        }

        $scope.refreshCheck = function(type){
      
            if(type == 'GOODS'){
                // $scope.eval.arta.type.goods = true;
                $scope.eval.arta.type.elect = false;
            } else {
                $scope.eval.arta.type.goods = false;
                // $scope.eval.arta.type.elect = true;
            }
            console.log("goods "+$scope.eval.arta.type.goods);  
            console.log("elect "+$scope.eval.arta.type.elect);  

            $timeout(function(){
                //$scope.$apply();
            }, 5);

        }


        //PROCESSES

        $scope.getUserSignature();
        if($scope.MGR.Signature != null && $scope.MGR.Signature != ''){
            $scope.MGR.hasSigned = true;
            $scope.showSignature('mgr');
        }


        //SIGNATURE
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
                //console.log($scope.signingclientIndex);
                if(type == null || type == 'client'){
                    var client = $scope.client;
                    //console.log(client);
                    var canv = $('#the-canvas-'+client.CLT_PK)[0];
                    $scope.$apply(function(){
                        client.hasSigned = true;
                        client.CLT_SIGNATURE = blob;
                    })

                    $scope.signingclientIndex = null;
                } else if(type === 'officer'){
                    var canv = $('#the-canvas-officer')[0];
                    $scope.$apply(function(){
                        $scope.user.hasSigned = true;
                        $scope.user.Signature = blob;
                    });

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
                }

                $scope.clearSigPad();
                var cont = canv.getContext("2d");
                cont.drawImage(img2, 0, 0, 300, 150);
                $scope.showSign = false;
                $scope.$apply();
            });

            img2.src = dsrc;
        }

    }]);

/******************************************
Dislay header and handle UI
******************************************/

function init(){
    initTemplate.load(2);
    $(".ncadPhoto").each(function(){
        $(this).width(250).height($(this).width()*1.25);
    });

    var headermenu = '';

    if(secondreview){
        // headermenu = '<div data-role="controlgroup" data-type="horizontal" style="text-align:left;">'+
        //   '<a href="#pageGeneralQuestion" class="ui-btn ui-btn-h ui-corner-all ui-shadow ui-icon-user ui-btn-icon-left" data-i18n="buttons.GeneralQuestion">General Questions</a>'+
        //   '<a href="#pageFamilyBizInfo" ng-click="rerender(400)"  class="ui-btn ui-btn-h ui-corner-all ui-shadow ui-icon-bars ui-btn-icon-left" data-i18n="buttons.FamilyBusinessInfo">Family Business Information</a>'+
        //   '<a href="#pageUse" class="ui-btn ui-btn-h ui-corner-all ui-shadow ui-icon-bars ui-btn-icon-left" data-i18n="buttons.WorkCapitalUsage">Working Capital Usage</a>'+
        //   '<a href="#pageHousingIndex" class="ui-btn ui-btn-h ui-corner-all ui-shadow ui-icon-home ui-btn-icon-left" data-i18n="buttons.HousingIndex">Housing Index</a>'+
        //   '<a href="#pageWorkingCapital" class="ui-btn ui-btn-h ui-corner-all ui-shadow ui-icon-home ui-btn-icon-left" data-i18n="buttons.OwnWorkCapitalBorrowFund">Own Working Capital & Borrowed Funds</a>';
        // headermenu += '</div>';
        headermenu = '<div data-role="controlgroup" data-type="horizontal" style="text-align:left;">'+
          '<a href="#pageGeneralQuestion" class="ui-btn ui-btn-h ui-corner-all ui-shadow ui-icon-user ui-btn-icon-left" data-i18n="buttons.GeneralQuestion">General Questions</a>'+
          '<a href="#pageAssetInfo" ng-click="rerender(400)"  class="ui-btn ui-btn-h ui-corner-all ui-shadow ui-icon-bars ui-btn-icon-left" data-i18n="buttons.Asset">Assets</a>'+
          '<a href="#pageFamilyBizInfo" ng-click="rerender(400)"  class="ui-btn ui-btn-h ui-corner-all ui-shadow ui-icon-bars ui-btn-icon-left" data-i18n="buttons.FamilyBusinessInfo">Biz Info</a>'+
          '<a href="#pageUse" class="ui-btn ui-btn-h ui-corner-all ui-shadow ui-icon-bars ui-btn-icon-left" data-i18n="buttons.WorkCapitalUsage">Working Capital Usage</a>'+
          '<a href="#pageHousingIndex" class="ui-btn ui-btn-h ui-corner-all ui-shadow ui-icon-home ui-btn-icon-left" data-i18n="buttons.HousingIndex">Housing Index</a>'+
          '<a href="#pageWorkingCapital" class="ui-btn ui-btn-h ui-corner-all ui-shadow ui-icon-home ui-btn-icon-left" data-i18n="buttons.OwnWorkCapitalBorrowFund">Own Working Capital & Borrowed Funds</a>';
        headermenu += '</div>';

    }


    var leftstyle2 = "";
    var leftstyle3 = "";
    var leftstyle4 = "";
    var leftstyle5 = "";
    if(!secondreview){
        leftstyle2 = 'style="left:33%"';
        leftstyle3 = 'style="left:66%"';
        leftstyle4 = 'style="left:100%"';
    } else {
        leftstyle2 = 'style="left:20%"';
        leftstyle3 = 'style="left:33%"';
        leftstyle4 = 'style="left:60%"';
        leftstyle5 = 'style="left:66%"';
        leftstyle6 = 'style="left:100%"';
    }

    var  newheader = '<div data-role="controlgroup" data-type"horizontal" class="etask-progress" style="text-align:left;" >'+
            '<div class="etask" ><div class="etask-icon">1<i class="fa fa-check hidden"></i></div><a href="#pageGeneralQuestion" class="etask-name" data-i18n="buttons.GeneralQuestion">General</a></div>'+
            // '<div class="etask" '+leftstyle2+'><div class="etask-icon">2<i class="fa fa-check hidden"></i></div><a href="#pageFamilyBizInfo" ng-click="rerender(400)" class="etask-name"  data-i18n="buttons.FamilyBusinessInfo">Biz Info</a></div>'+
            '<div class="etask" '+leftstyle3+'><div class="etask-icon">3<i class="fa fa-check hidden"></i></div><a href="#pageAssetInfo" ng-click="rerender(400)" class="etask-name"  data-i18n="buttons.Asset">Assets</a></div>'+
            // '<div class="etask" '+leftstyle4+'><div class="etask-icon">4<i class="fa fa-check hidden"></i></div><a href="#pageUse" class="etask-name">Capital</a></div>'+
            '<div class="etask" '+leftstyle5+'><div class="etask-icon">5<i class="fa fa-check hidden"></i></div><a href="#pageHousingIndex" class="etask-name" data-i18n="buttons.HousingIndex">Housing</a></div>';
            if(secondreview){
                newheader += '<div class="etask" '+leftstyle6+' ><div class="etask-icon">6<i class="fa fa-check hidden"></i></div><a href="#pageWorkingCapital" class="etask-name" data-i18n="buttons.OwnWorkCapitalBorrowFund">Borrowed</a></div>';
            }
        newheader += '<div class="etask-progress-bar"></div>'+
        '</div>';
        
    // $("[data-role=main]").each(function(){
    //     if(!secondreview)$(this).prepend(newheader);
    //     $(this).trigger("create");
    // });

    //selector re-write
    $("select").each(function(){
        $(this).closest('.ui-btn').css('background-color','#80C6C7');
        $(this).closest('.ui-btn').css('color','#fff');
        $(this).closest('.ui-btn').css('text-shadow','0 0 0 #fff');
    });
}

/******************************************
For cancel button
******************************************/
function navBack(){history.back();return false;}

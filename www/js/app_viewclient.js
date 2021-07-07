/******************************************
// Initialize the UI
******************************************/
var clientid = sessionStorage.getItem("CLIENT_ID");


var prev_loan_id = sessionStorage.getItem("PREV_LOAN_ID");
function init(){
    initTemplate.load(2);
    $(".ncadPhoto").each(function(){
        $(this).width(250).height($(this).width()*1.25);
    });


    // $('.header').before(' <div data-role="panel" id="mypanel" data-display="overlay" data-dismissible="false"></div><div class="menupop-wrapper"><div class="menu-pop" id="menu-pop"></div></div>');

    //for the menu for all screens
    $("[data-role=main]").each(function(){
        //header for all screens
        $(this).prepend('<div data-role="controlgroup" data-type="horizontal" style="text-align:left">'+
                        '<a href="#pageAppData" class="ui-btn ui-btn-h ui-corner-all ui-shadow ui-icon-user ui-btn-icon-left mini-header selected" data-i18n="buttons.Applicant">Applicant<div class="btm-bar"></div></a>'+
                        '<a href="#pageAppData2" class="ui-btn ui-btn-h ui-corner-all ui-shadow ui-icon-user ui-btn-icon-left mini-header" data-i18n="buttons.Husband">Husband</a>'+
                        '<a href="#pageAppData3" class="ui-btn ui-btn-h ui-corner-all ui-shadow ui-icon-user ui-btn-icon-left mini-header" data-i18n="buttons.HouseholdMother">Household/Mother</a>'+
                        '<a href="#pageAppData4" class="ui-btn ui-btn-h ui-corner-all ui-shadow ui-icon-plus ui-btn-icon-left mini-header" data-i18n="buttons.Business">Business</a>'+
                        '<a href="#pageAddress" class="ui-btn ui-btn-h ui-corner-all ui-shadow ui-icon-phone ui-btn-icon-left mini-header" data-i18n="buttons.Address">Address</a>'+
                        '<a href="#pageWelfareStatus" class="ui-btn ui-btn-h ui-corner-all ui-shadow ui-icon-home ui-btn-icon-left mini-header" data-i18n="buttons.FamilyWelfare">Family Welfare</a>'+
                        '</div>'+
                        '<div data-role="controlgroup" data-type="horizontal" style="text-align:left;">'+
                        '<a href="#pageWorkingCapital" class="ui-btn ui-btn-h ui-corner-all ui-shadow ui-icon-bars ui-btn-icon-left mini-header " data-i18n="buttons.WorkingCapital">Working Capital</a>'+
                        '<a href="#pageHousingIndex" class="ui-btn ui-btn-h ui-corner-all ui-shadow ui-icon-home ui-btn-icon-left mini-header" data-i18n="buttons.HousingIndex">Housing Index</a>'+
                        '<a href="#pageHouseIncomeEst" class="ui-btn ui-btn-h ui-corner-all ui-shadow ui-icon-bars ui-btn-icon-left mini-header" data-i18n="buttons.Income">Income</a>'+
                        '<a href="#pagePaymentHistory" class="ui-btn ui-btn-h ui-corner-all ui-shadow ui-icon-bars ui-btn-icon-left mini-header" data-i18n="buttons.History">History</a>'+((prev_loan_id!="null")?('<a href="#pagePrevPaymentHistory" class="ui-btn ui-btn-h ui-corner-all ui-shadow ui-icon-bars ui-btn-icon-left">Prev History</a>'):"")+
                        '<a href="#pageAccountStatus" class="ui-btn ui-btn-h ui-corner-all ui-shadow ui-icon-user ui-btn-icon-left mini-header" data-i18n="buttons.Status">Status</a>'+
						// '<a href="#pageProductMapping" class="ui-btn ui-btn-h ui-corner-all ui-shadow ui-icon-grid ui-btn-icon-left mini-header" data-i18n="buttons.ProductMapping">Product Mapping</a>'+
                        '</div>');
        $(this).trigger("create");
    });

    $('body').on('click','.mini-header', function(){
        $('.mini-header').removeClass('selected');
        $('.mini-header .btm-bar').remove();
        var hh = $(this).attr('href');
        $('.mini-header[href$='+hh+']').addClass('selected');
        $('.mini-header[href$='+hh+']').append('<div class="btm-bar"></div>');
    });


    $('#historyChart').on('mousedown',function(event){ event.preventDefault(); });
    $('#prevHistoryChart').on('mousedown',function(event){ event.preventDefault(); });
}

var CMP_PK            = sessionStorage.getItem("CMP_PK");
var date = new Date();
date = ("0"+date.getDate()).slice(-2)+"/"+("0"+(date.getMonth()+1)).slice(-2)+"/"+date.getFullYear();
/******************************************
// Controller
******************************************/
//var myApp = angular.module("myApp",[]);
var myApp = angular.module("myApp",['pascalprecht.translate','ng-currency']);

myApp.config(function ($translateProvider) {

	 $translateProvider.useStaticFilesLoader({
		prefix: "locales/locale-",
		suffix: ".json"
	 });
     $translateProvider.preferredLanguage(ln.language.code);
});

myApp.filter('nfcurrency', [ '$filter', '$locale', function ($filter, $locale) {
    var currency = $filter('currency'), formats = $locale.NUMBER_FORMATS;
    return function (amount, symbol) {
        var value = currency(amount, 'RP ');
        return value.replace(new RegExp('\\' + formats.DECIMAL_SEP + '\\d{2}'), '')
    }
}])

myApp.controller("ClientCtrl",function($scope,$filter){

    //get the CLIENT ID to display
    var s = $scope;
    $scope.clientid = clientid;
    $scope.houseIncomes = [];
    $scope.family = [];
    $scope.currLoan = [];
      $scope.memberTypes = [];
      $scope.homeOwnershipType = [];
      $scope.joblist = [];
      $scope.educationList = [];
    $scope.currLoanSelPK = null;
    $scope.loan_id = sessionStorage.getItem("LOAN_ID");
    $scope.prev_loan_id = sessionStorage.getItem("PREV_LOAN_ID");
    $scope.clientinfo = null;
    $scope.loaninfo = null;
    $scope.borrowedinfo = null;
    $scope.incomeinfo = null;
    $scope.trainingschedule = null;
	$scope.productinfo = null;
	$scope.unadded_productinfo = [];
    $scope.allproducts = [];
    $scope.cmp_pk = CMP_PK;
	$scope.last_cmp_pk = null;
    $scope.words = [
        greyicon    = '',
        redicon     = '',
        goldicon    = '',
        blueicon    = '',
    ];
    $scope.totalpaid = 0;
    $scope.feastrepay = feastrepay;
    $scope.date = date;
    var t = this; 

    var todate = new Date(); 
    todate = todate.getFullYear()+"-"+("0"+(todate.getMonth()+1)).slice(-2)+"-"+("0"+todate.getDate()).slice(-2);

    $scope.loadPhoto = function(){
        myDB.execute("SELECT PH_PHOTO FROM T_PHOTOS WHERE PH_CLT_PK = "+clientid,function(res){ 
            if( res.length > 0) {
                var ph = res[0].PH_PHOTO;
                $("#ncadPhoto").attr("src",atob(ph));
            } 
        });
    }
    $scope.loadPhoto();
    $scope.prepWords = function(){

        // data-18n not working within ng-repeat - this is manual fix

        //main table header
        $scope.words.ProductName = i18n.t("messages.ProductName");
        $scope.words.AccountNumber = i18n.t("messages.AccountNumber");
        $scope.words.Maturity = i18n.t("messages.Maturity");
        $scope.words.Balance = i18n.t("messages.Balance");
        $scope.words.Status = i18n.t("messages.Status");
        $scope.words.Action = i18n.t("messages.Action");

        $scope.words.Gender = i18n.t("messages.Gender");
        $scope.words.DOB = i18n.t("messages.DOB");
        $scope.words.Relationship = i18n.t("messages.Relationship");
        $scope.words.MaritalStatus = i18n.t("messages.MaritalStatus");
        $scope.words.Work = i18n.t("messages.Work");
        $scope.words.Education = i18n.t("messages.Education");
        $scope.words.Information = i18n.t("messages.Information");

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
        $scope.$apply();
    }
    setTimeout(function(){
        $scope.prepWords();
    },500);



    var lcmd = " select MAX(cpm_pk) as cmp_pk from t_client_product_mapping ";
    myDB.execute(lcmd,function(result){

        $scope.last_cmp_pk = parseInt(result[0].cmp_pk)+1;
    });


/******************************************
// Function that fixes the date display
******************************************/
    $scope.prepDate = function(d){
        var dateonly = (d+"").split(" ")[0];
        dateonly = dateonly.split(/-|\//g);
        return dateonly[0]+"/"+dateonly[1]+"/"+dateonly[2];
    }
    $scope.adCalcAge = function(){
        //alert(moment().diff(moment($scope.applicantdata.dateofbirth),'years')); 
        if($scope.clientinfo != null){ 
            var year = $scope.clientinfo.CLT_BIRTHDATE.split("/")[2];
            var diff = parseInt(moment().format('YYYY'))-parseInt(year);
            var age = 0;
            if(diff===null||isNaN(diff)) age = 0;
            else age = diff; 
            return age;
        } else {
            return 0;
        } 
    }
/******************************************
// Set results to angular variable to be displayed on UI
******************************************/
    this.setClientInfo = function(results){ //setClientInfo
        $scope.$apply(function() {

            var clientinfo = [];
            for(key in results){

                var res = results[key];
                if(res == null || res =='null') res = "-";

                clientinfo[key] = res;
            }

            $scope.clientinfo = clientinfo;
            $scope.clientinfo.CLT_BIRTHDATE = $scope.prepDate($scope.clientinfo.CLT_DOB);
            $scope.clientinfo.CLT_MOTHER_BIRTHDATE = '';
            
            if( $scope.clientinfo.CLT_MOTHER_DOB !== null && $scope.clientinfo.CLT_MOTHER_DOB !== '-' ) {
                $scope.clientinfo.CLT_MOTHER_BIRTHDATE = $scope.prepDate($scope.clientinfo.CLT_MOTHER_DOB);
            }

            if( $scope.clientinfo.CLT_RESIDENCE_OF_PARENTS !== null && $scope.clientinfo.CLT_RESIDENCE_OF_PARENTS !== '-' ) {
                $scope.clientinfo.CLT_RESIDENCE_OF_PARENTS = $scope.clientinfo.CLT_RESIDENCE_OF_PARENTS;
            }

            //console.log($scope.clientinfo);
            var cmd = "";
            //console.log(results);
            if(results.CLT_MOB_NEW == 1 || results.CLT_MOB_NEW == 2){
                cmd = "SELECT * FROM T_LOAN_TYPE,T_CLIENT_LOAN,T_LOAN_PURPOSE WHERE  CLL_LTY_PK = LTY_PK AND CLL_CLT_PK = "+$scope.clientinfo.CLT_PK+" AND LPU_PK = CLL_LPU_PK order by LTY_CODE";
            } else {
                cmd = "SELECT * FROM T_LOAN_TYPE,T_CLIENT_LOAN,T_LOAN_PURPOSE WHERE CLL_LTY_PK = LTY_PK  AND LPU_PK = CLL_LPU_PK AND CLL_STATUS >=9 AND CLL_CLT_PK = "+$scope.clientinfo.CLT_PK+" GROUP BY CLL_PK order by LTY_CODE";
            }

            myDB.execute(cmd,function(results){
                //console.log(results);
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
                            value: rec.CLL_LOAN_WEEKS
                        },
                        loanpurpose: {
                            value: rec.LPU_PK,
                            name: rec.LPU_NAME
                        }
                    };

                    if(rec.CLL_LOAN_WEEKS == 'null') rec.CLL_LOAN_WEEKS = "NA";


                    $scope.loans.push(rec);

                    var cnt = parseInt(ind) + 1;

                    if(cnt == results.length){
                        //console.log($scope.loans);
                        $scope.loadproducts();
                    }

                });
            });

            $scope.unproassets = [];
            myDB.execute("SELECT * FROM T_CLIENT_ASSET_LIST WHERE CAL_CLT_PK ="+$scope.clientinfo.CLT_PK+" ORDER BY CAL_PK DESC", function(results){
                //console.log(results);
                if(results.length > 0){

                    $.each(results,function(i,asset){
                        var ind = i;
                        var key = { index: ind, asset: asset.CAL_ASSET_NAME, value: asset.CAL_ASSET_VALUE, isNew: false };
                        $scope.unproassets.push(key);
                    })

                }

                setTimeout(function(){
                    $scope.$apply(function(){
                        $scope.unproassets;
                    });
                }, 1000);

            });

        });
    };
/******************************************
// Check checkboxOnchange
******************************************/
    $scope.checkboxChange = function(product){

    }
/******************************************
// Save new Product
******************************************/
    $scope.addThisProduct = function(product){

        swal({
            title: i18n.t("messages.Alert"),
            text: i18n.t("messages.ConfirmAddProduct"),
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#80C6C7",
            confirmButtonText: i18n.t("messages.Yes"),
            closeOnConfirm: true
        },function(isConfirm){
            if(isConfirm){

                var date = new Date();
                //date = date.getFullYear()+"-"+("0"+(date.getMonth()+1)).slice(-2)+"-"+("0"+date.getDate()).slice(-2)+" "+("0"+date.getHours()).slice(-2)+":"+("0"+date.getMinutes()).slice(-2)+":"+("0"+date.getSeconds()).slice(-2);

                date = ("0"+date.getDate()).slice(-2)+"/"+("0"+(date.getMonth()+1)).slice(-2)+"/"+date.getFullYear();

                var prdSavperWeek = null;
                if(product.PRM_CODE == feastsavingcode){
                    prdSavperWeek = product.selectedSavingperWeek;
                    product.PRM_MATURITY_OPTIONS = '';
                }

                var cmd = "INSERT INTO T_CLIENT_PRODUCT_MAPPING VALUES(null"+
                            ","+$scope.last_cmp_pk+ //CPM_PK
                            ","+$scope.clientinfo.CLL_CLT_PK+ //CPM_CLT_PK
                            ","+$scope.clientinfo.CLL_PK+//CPM_CLL_PK
                            ","+product.PRM_PK+ //CPM_PRM_PK
                            ",'"+product.PRM_MATURITY_OPTIONS+"'"+ //CPM_PRM_MATURITY
                            ",0"+ //CPM_PRM_BALANCE
                            ",null"+ //CPM_PRM_ACC_NUMBER
                            ",'"+date+"'"+ //CPM_PRM_JOIN_DATE
                            ",'null'"+ //CPM_PRM_CLOSE_DATE
                            ",56"+ //CPM_STATUS_PK
                            ",'"+prdSavperWeek+"'"+
                            ",null"+ //CPM_START_MATURITY_DATE
                            ",null"+ //CPM_END_MATURITY_DATE
                            ",2)"; //CPM_CHKNEW 1=new record

                myDB.dbShell.transaction(function(tx3){
                    tx3.executeSql(cmd);
                }, function(err){
                    //console.log(err);
                    swal("An error encountered when updating product.");
                    return false;
                }, function(suc){
                    $scope.last_cmp_pk = parseInt($scope.last_cmp_pk)+1;
                    $scope.loadproducts();
                    //$scope.loadAllProducts();
                });

            }
        });
    }

    $scope.getLoanBalance = function(loan){

        var sum = parseFloat(loan.CRS_BALANCE_CAPITAL) + parseFloat(loan.CRS_BALANCE_PROFIT);
        if(isNaN(sum)) sum = "New";

        return sum;
    } 

    $scope.saveNewProducts = function(){

        var date = new Date();
        date = date.getFullYear()+"-"+("0"+(date.getMonth()+1)).slice(-2)+"-"+("0"+date.getDate()).slice(-2)+" 00:00:00";
        var commands = [];
        var cindex = [];
        for(k in $scope.unadded_productinfo){

            //console.log($scope.unadded_productinfo[k]);

            if($scope.unadded_productinfo[k].isSelected == 'YES'){
                var cmd = "INSERT INTO T_CLIENT_PRODUCT_MAPPING VALUES(null"+
                    ","+$scope.last_cmp_pk+ //CPM_PK
                    ","+$scope.clientinfo.CLL_CLT_PK+ //CPM_CLT_PK
                    ","+$scope.clientinfo.CLL_PK+//CPM_CLL_PK
                    ","+$scope.unadded_productinfo[k].PRM_PK+ //CPM_PRM_PK
                    ",'"+$scope.unadded_productinfo[k].PRM_MATURITY_OPTIONS+"'"+ //CPM_PRM_MATURITY
                    ",0"+ //CPM_PRM_BALANCE
                    ",null"+ //CPM_PRM_ACC_NUMBER
                    ",'"+date+"'"+ //CPM_PRM_JOIN_DATE
                    ",null"+ //CPM_PRM_CLOSE_DATE
                    ",56"+ //CPM_STATUS_PK
                    ",2)"; //CPM_CHKNEW 1=new record

                commands.push(cmd);
                cindex.push(k); //Record pos to use later to transfer to another array
                // $scope.productinfo.push($scope.unadded_productinfo[k]);
                // $scope.unadded_productinfo.splice(k,1);
                $scope.last_cmp_pk = parseInt($scope.last_cmp_pk)+1;
            }
        }

        if(commands.length > 0){
            swal({
                title: i18n.t("messages.Alert"),
                text: i18n.t("messages.ConfirmAddProduct"),
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#80C6C7",
                confirmButtonText: i18n.t("messages.Yes"),
                closeOnConfirm: true
            },function(isConfirm){
                if(isConfirm){

                    myDB.dbShell.transaction(function(tx3){
                        for(c in commands){
                            var pos = cindex[c];
                            $scope.productinfo.push($scope.unadded_productinfo[pos]);
                            $scope.unadded_productinfo.splice(pos,1);

                            tx3.executeSql(commands[c]);
                        }
                    }, function(err){
                        //console.log(err);
                        swal("An error encountered when updating product.");
                        return false;
                    }, function(suc){
                        $scope.$apply(function(){

                        });
                    });
                }
            });
        }
    }


/******************************************
// load photo - replaced by new code below
******************************************/
    // $scope.loadPicture = function(clientid){
    //  if(!devtest){
    //         fileManager = new fm();
    //             try{
    //             var promise = fileManager.read("photo"+clientid+".dataurl");
    //             promise.done(function(result){
    //                 //alert("Results from promise:"+result);
    //                 $("#ncadPhoto").attr("src",result);
    //                 //alert(result);
    //             });
    //             }catch(e){
    //             //    alert(e.message);
    //             };
    //         }
    // };

/******************************************
	// auto load client's product mapping details
******************************************/
    $scope.loadAllProducts = function(){

        var allmd   =  " select prm.*, CPM_PK, CPM_PRM_PK, CPM_CLL_PK, CPM_CLT_PK, CPM_PRM_MATURITY, CPM_PRM_BALANCE, CPM_PRM_JOIN_DATE, CPM_PRM_CLOSE_DATE, CPM_PRM_ACC_NUMBER, CPM_CHKNEW from t_product_master as prm";
        allmd       += " left join t_client_product_mapping as cpm on (cpm.cpm_prm_pk=prm.prm_pk and cpm.cpm_prm_close_date='null' and cpm.cpm_status_pk NOT IN (53,55) and cpm.cpm_cll_pk="+$scope.loan_id+")";

        myDB.execute(allmd,function(results){
            //console.log(results);
            $scope.allproducts = [];
            if(results.length > 0){
                var isLast = false;

                //console.log(results);

                $.each(results,function(ind,rec){
                    //console.log(rec);
                    rec.isActive = false;
                    rec.status = "Inactive"
                    rec.STATUS_TEXT = i18n.t("messages.InActive");
                    //Checking if account active
                    if(rec.CPM_PK != null){
                        rec.isActive = true;
                        rec.status = "Active"
                        if(rec.CPM_CHKNEW == 1) rec.status = "New";
                        rec.STATUS_TEXT = i18n.t("messages.Active");
                        if(rec.CPM_PRM_BALANCE==""||rec.CPM_PRM_BALANCE==null)rec.CPM_PRM_BALANCE = 0.00;
                        rec.CPM_PRM_BALANCE_TEXT = $filter('currency')(rec.CPM_PRM_BALANCE);
                    } else {
                        rec.CPM_PRM_BALANCE_TEXT = "NA";
                    }
                    rec.selectedSavingperWeek = rec.CPM_REPAY_PER_WEEK;
                    //FREQUENCY_TEXT
                    rec.PRM_DEPOSIT_FREQUENCY_TEXT = i18n.t("messages.Random");
                    if(rec.PRM_DEPOSIT_FREQUENCY=='W') rec.PRM_DEPOSIT_FREQUENCY_TEXT = i18n.t("messages.Weekly");
                    //MANDATORY_TEXT
                    rec.PRM_IS_MANDATORY_TEXT = i18n.t("messages.No");
                    if(rec.PRM_IS_MANDATORY=="Y") rec.PRM_IS_MANDATORY_TEXT = i18n.t("messages.Yes");
                    //MATURITY

                    rec.CPM_PRM_MATURITY_TEXT = rec.CPM_PRM_MATURITY;
                    //STATUS

                    // $scope.allproducts.push(rec);

                    //console.log(rec);
                    if(results.length == parseInt(ind+1)) isLast = true;

                    $scope.loadAllProductAccount(rec,isLast);

                });
            }
        });
    }
    $scope.loadAllProducts();

    var cptdate = new Date();

    cptdate = cptdate.getFullYear()+"-"+("0"+(cptdate.getMonth()+1)).slice(-2)+"-"+("0"+cptdate.getDate()).slice(-2);
    //console.log(cptdate);

    var ccc = "select  DATE(CPC_CREATED_DATE) as asdasda from t_client_product_close_info ";
    myDB.execute(ccc,function(results){
        //console.log(results);
    });


    $scope.loadAllProductAccount = function(product, isLast){
        var cmd  = " select CPM_PK, CPM_PRM_MATURITY, CPM_PRM_BALANCE, CPM_PRM_JOIN_DATE, CPM_PRM_CLOSE_DATE, CPM_PRM_ACC_NUMBER, CPM_CHKNEW, CPM_PRM_ACC_NUMBER ";

        cmd     += " ,CPC_REASON, CPC_MANAGER_REMARK, CPC_STATUS, CPC_CLOSING_FEE, CPC_DISBURSE_AMT, CPC_CHKNEW, CPC_DISBURSE_DATE, DATE(CPC_DISBURSE_DATE) as CPC_DISBURSE_JUSTDATE ";
        cmd     += " from t_client_product_close_info as cpc";
        cmd     += " left join t_client_product_mapping as cpm  on (cpc.cpc_cpm_pk=cpm.cpm_pk and cpm.cpm_cll_pk="+$scope.loan_id+") ";
        cmd     += " where cpm_prm_pk="+product.PRM_PK+" and cpm_cll_pk="+$scope.loan_id;
        //console.log('loadAllProductAccount');
        myDB.execute(cmd,function(results){
            //console.log(results);
            product.closerequests = [];
            product.activeaccount = null;
            if(results.length > 0){

                var anotherdate = new Date();

                anotherdate = anotherdate.getFullYear()+"-"+("0"+(anotherdate.getMonth()+1)).slice(-2)+"-"+("0"+anotherdate.getDate()).slice(-2);

                $.each(results,function(ind,rec){

                    //CLOSE DATE
                    rec.CPC_DISBURSE_AMT_TEXT = $filter('currency')(rec.CPC_DISBURSE_AMT);
                    if(rec.CPM_PRM_CLOSE_DATE=="null"||rec.CPM_PRM_CLOSE_DATE==null){
                        rec.CPM_PRM_CLOSE_DATE="NA";
                        rec.CPC_DISBURSE_AMT_TEXT = "NA";
                    }
                    //STATUS
                    rec.CPC_STATUS_TEXT="Active";
                    if(rec.CPM_CHKNEW==1)rec.CPC_STATUS_TEXT="Just Created";
                    if(rec.CPC_STATUS==53 || rec.CPC_STATUS==3){
                        rec.CPC_STATUS_TEXT= i18n.t("messages.PendingClosureApproval");
                        product.status="Pending";
                    } else if(rec.CPC_STATUS==55){
                         rec.CPC_STATUS_TEXT= i18n.t("messages.Closed");
                        if(rec.CPC_DISBURSE_JUSTDATE == anotherdate){
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
                //console.log( $scope.allproducts);
            }
        });

    }

    $scope.removeThisProduct = function(product){
        var cmp_pk = product.CPM_PK;

        var cmd = " delete from t_client_product_mapping where CPM_PK ="+cmp_pk;
        //console.log(cmd);
        myDB.execute(cmd,function(results){

            $scope.loadAllProducts();

        });

    }

    $scope.cancelClose = function(product){

        var cmp_pk = product.CPM_PK;
        var cmd2 = " delete from T_CLIENT_PRODUCT_CLOSE_INFO where CPC_CHKNEW=1 and cpc_cpm_pk = "+cmp_pk;
        //console.log(cmd2);
        myDB.dbShell.transaction(function(tx3){
            myDB.execute(cmd2);
        },function(err){
            //console.log(err.message);
        },function(suc){
            $scope.loadproducts();
            //$scope.loadAllProducts();
        });

    }

	myDB.execute("SELECT * FROM T_CLIENT_PRODUCT_MAPPING, T_PRODUCT_MASTER WHERE CPM_CLL_PK="+$scope.loan_id+" AND CPM_PRM_PK=PRM_PK",function(results){
		s.productinfo = results;
	});
    var cmd = "SELECT * FROM T_PRODUCT_MASTER WHERE PRM_CMP_PK="+$scope.cmp_pk+" AND PRM_PK NOT IN (select cpm_prm_pk from T_CLIENT_PRODUCT_MAPPING where CPM_CLL_PK="+$scope.loan_id+")";

    myDB.execute(cmd,function(results){
        //s.unadded_productinfo = results;
        //console.log(results);
        $.each(results,function(ind,rec){
            if(rec.PRM_IS_MANDATORY == "Y"){
                rec.isSelected = "YES";
            } else{
                rec.isSelected = "NO";
            }
            rec.showMaturityOptions = false;
            rec.maturityOptions = null;
            rec.selectedMaturityOption = [{
                id: null,
                name: null,
            }];

            // if(rec.PRM_MATURITY_OPTIONS.length > 0){
            //     rec.showMaturityOptions = true;
            //     var matOptions = rec.PRM_MATURITY_OPTIONS.split(",");

            //     rec.maturityOptions = matOptions;

            //     rec.maturityObjects = [];
            //     for(var i=0; i < matOptions.length; i++){

            //         rec.maturityObjects[i] = {
            //             id: i,
            //             name: matOptions[i]
            //         }
            //     }
            //     $scope.maturityObjects = rec.maturityObjects;
            // }

            $scope.unadded_productinfo.push(rec);

        });


        //console.log($scope.productinfo);
        //console.log($scope.unadded_productinfo);
    });
/******************************************
// auto load client's loan details
******************************************/

    $scope.loans = [];
    $scope.selectedLoans = [];

    $scope.products = [];
    $scope.loantypes = [];
    $scope.loanpurpose = [];
    ////console.log("mato "+$scope.produts.maturityObjects);
    $scope.selectOption = function(idx, obj){
        //$("#maturityOption32-button").children().text("test");
        ////console.log($scope.products[idx].selectedMaturityOption);
        //console.log($scope.products[idx].selectedMaturityOption.id);
    }

    $scope.loadLoanPurpose = function(){
        myDB.execute("SELECT * FROM T_LOAN_PURPOSE WHERE LPU_LTY_PK",function(results){
            ////console.log(results);
            if(results.length > 0){
                $.each(results, function(i,val){

                    var key = { value: val.LPU_PK, name: val.LPU_NAME, code: val.LPU_CODE, loan: val.LPU_LTY_PK };
                    $scope.loanpurpose.push(key);
                });
            }
        });
    }

    $scope.loadLoanPurpose();

    $scope.loadproducts = function(){
        //console.log($scope.loans);
        $.each($scope.loans,function(ind,loan){
            var cmd =   "   SELECT *, DATE(CPM_PRM_JOIN_DATE) as CPM_START_DATE FROM T_PRODUCT_MASTER "+
                        "   LEFT JOIN T_LOAN_SAVING_PRD_MAPPING ON (LSM_PRM_PK = PRM_PK) "+
                        "   LEFT JOIN T_CLIENT_PRODUCT_MAPPING ON (CPM_PRM_PK = PRM_PK AND CPM_STATUS_PK != 55 AND CPM_CLL_PK="+loan.CLL_PK+") "+
                        "   LEFT JOIN T_CLIENT_PRODUCT_CLOSE_INFO ON (CPC_CPM_PK = CPM_PK) "+
                        "   WHERE LSM_LTY_PK ="+ loan.LTY_PK+
                        "   ";
            myDB.execute(cmd,function(results){
                //console.log(results);
                var products  = [];
                $.each(results,function(index,rec){

                    var prd = [];
                    for(key in rec){
                        prd[key] = rec[key];
                    }

                    prd.isSelected = "NO";
                    if(prd.LSM_PRM_IS_MANDATORY == 'Y' || prd.CPM_PK != null){
                        prd.isMandatory = 'Y';
                        prd.isSelected = "YES";
                    } else {
                        prd.isMandatory = 'N';
                    }


                    prd.isActive = true;
                    if(prd.CPM_PK == null) prd.isActive = false;
                    prd.status = "Active";
                    if(prd.CPM_CHKNEW == 1) prd.status = "New";
                    prd.showMaturityOptions = false;
                    prd.maturityOptions = null;
                    if(prd.CPM_PRM_MATURITY == null || prd.CPM_PRM_MATURITY == ''){
                        prd.selectedMaturityOption = "";
                    } else if(prd.CPM_PRM_MATURITY.indexOf('Year') > 0){
                        prd.selectedMaturityOption = prd.CPM_PRM_MATURITY + "s";
                    } else {
                        prd.selectedMaturityOption = prd.CPM_PRM_MATURITY;
                    }

                    prd.selectedSavingperWeek = prd.CPM_REPAY_PER_WEEK;

                    // if(prd.CPM_PRM_MATURITY == null || prd.CPM_PRM_MATURITY.indexOf('Year') == -1 ) {
                    //     prd.selectedMaturityOption = $scope.loans[ind].selecteddetais.loanmaturity.value + " Weeks ";
                    // }

                    prd.depositAmt = 0;

                    prd.CPC_STATUS_TEXT="Active";
                    if(prd.CPM_CHKNEW==1)rec.CPC_STATUS_TEXT="Just Created";
                    if(prd.CPC_STATUS==53 || rec.CPC_STATUS==3){
                        prd.CPC_STATUS_TEXT= i18n.t("messages.PendingClosureApproval");
                        prd.status="Pending";
                    } else if(rec.CPC_STATUS==55){
                         prd.CPC_STATUS_TEXT= i18n.t("messages.Closed");
                        if(prd.CPC_DISBURSE_JUSTDATE == anotherdate){
                            prd.status="Closed";
                        } else {

                        }
                        if(prd.CPC_CHKNEW==1){
                            prd.STATUS_TEXT = i18n.t("messages.Closed");
                            prd.status="Pending";
                        }
                    }
                    //REASON
                    if(prd.CPC_REASON==null)prd.CPC_REASON="NA";
                    //REMARK
                    if(prd.CPC_MANAGER_REMARK==null)prd.CPC_MANAGER_REMARK="NA";

                    prd.canClose = false;
                    if(prd.PRM_LOAN_CLOSING_POLICY == 'A'||
                        (prd.PRM_LOAN_CLOSING_POLICY == 'C' && loan.CLL_STATUS == 9)){
                        prd.canClose = true;
                    }

                    if(prd.PRM_LOAN_CLOSING_POLICY == 'M'){

                        var mat_years = 0;

                        if(prd.CPM_PRM_MATURITY != null && prd.CPM_PRM_MATURITY.indexOf('Year') != -1){
                            mat_years = parseInt(prd.CPM_PRM_MATURITY.replace("Year","").trim());

                            var d1 = new Date(prd.CPM_START_DATE); //Start Date
                            var d2 = new Date(new Date().setFullYear(d1.getFullYear() + mat_years )); // Date After Maturity

                            var d3 = new Date(); // Today
                            if(d3 > d2){
                                prd.canClose = true;
                            }

                        }


                    }


                    products.push(prd);
                });
                $scope.loans[ind].products = products;
                //console.log($scope.loans[ind]);

                var cnt = parseInt(ind) + 1;
                if(cnt == $scope.loans.length){
                    $scope.$apply();
                }

            });

        });

    }

    $scope.loanSelected = function(loan,$event){
        $event.preventDefault();
        $event.stopPropagation();
        if(loan.isSelected){
            loan.isSelected = false;
            for(var i = 0; i < $scope.selectedLoans.length; i++) {
                if($scope.selectedLoans[i].LTY_PK == loan.LTY_PK) {
                    $scope.selectedLoans.splice(i, 1);
                    break;
                }
            }
        } else {
            loan.isSelected = true;
            $('#activeloanMaturity'+loan.LTY_PK).selectmenu("refresh", true);
            $scope.selectedLoans.push(loan);
        }
        //console.log($scope.selectedLoans);
    }

    $scope.viewloanproducts = function(idx,$event){

        $('.loan-box').removeClass('selected');

        var tis = $event.currentTarget;

        $(tis).find('.loan-box').addClass('selected');

        $scope.activeloan = [];

        //console.log($scope.loanpurpose);

        //$scope.loans[idx].selecteddetais.loanamt = $scope.loans[idx].CLL_ACTUAL_LOAN;
       // $scope.loans[idx].selecteddetais.loanmaturity = $scope.loans[idx].maturityOptions[0];
        //$scope.loans[idx].selecteddetais.loanpurpose = $filter('filter')($scope.loanpurpose, { loan: $scope.loans[idx].LTY_PK })[0];
        $scope.activeloan = $scope.loans[idx];

        $scope.loadLoanPurpose();

        $('#activeloanMaturity'+$scope.activeloan.LTY_PK).selectmenu("refresh", true);
        $('#activeloanPurpose'+$scope.activeloan.LTY_PK).selectmenu("refresh", true);

        setTimeout(function(){
            $('#activeloanMaturity'+$scope.activeloan.LTY_PK).selectmenu("refresh", true);
            $('#activeloanPurpose'+$scope.activeloan.LTY_PK).selectmenu("refresh", true);
        },300);
        $('html, body').animate({
            scrollTop: $("#productmappingdetails").offset().top - 90
        }, 1000);
        //console.log($scope.activeloan);
    }

    myDB.T_PRODUCT_MASTER.get(null,function(results){
        $.each(results,function(ind,rec){
            if(rec.PRM_IS_MANDATORY == "Y"){
                rec.isSelected = "YES";
            } else{
                rec.isSelected = "NO";
            }
            rec.showMaturityOptions = false;
            rec.maturityOptions = null;
            rec.selectedMaturityOption = [{
                id: null,
                name: null,
            }];
            $scope.products.push(rec);
        });
    });

    //Settign Loan Type Options
    $scope.LOAN_TYPE = [];
    var LT = JSON.parse(localStorage.getItem("loan_type"));
    ////console.log(LT);
    LT.forEach(function(value,index){
        var keypair = {'value': value[0],'name': value[3]};
        $scope.LOAN_TYPE.push(keypair);
        ////console.log($scope.LOAN_TYPE);
    });



    myDB.execute("SELECT * FROM T_CLIENT,T_CLIENT_LOAN, T_VILLAGE_MASTER,T_CENTER_MASTER WHERE CLL_PK="+$scope.loan_id+" AND CLT_VILLAGE=VLM_PK AND CLT_CENTER_ID = CTR_PK AND CLT_PK=CLL_CLT_PK",function(results){
    //console.log(results);
        if(results.length == 0) return false;
        t.setClientInfo(results[0]);
        var client_id = results[0]['CLT_PK'];
        myDB.T_CLIENT_LOAN.get("CLL_PK="+$scope.loan_id,function(results){ 
            s.$apply(function () {
                s.loaninfo = results[0];
                s.loaninfo.CLL_SCHEDULD_LAST_PAY_DATE_PREP = s.prepDate(s.loaninfo.CLL_SCHEDULD_LAST_PAY_DATE);
                s.loaninfo.CLL_ACTUAL_LAST_PAY_DATE_PREP = s.prepDate(s.loaninfo.CLL_ACTUAL_LAST_PAY_DATE);
            });
            myDB.T_FAMILY_WELFARE.get("FWF_TYPE_PK='"+$scope.loaninfo.CLL_WELFARE_STATUS+"'",function(results){
                s.$apply(function () {s.selectedWelfare = results[0];});
            });
        });
        myDB.T_CLIENT_BORROWED_FUNDS.get("CEF_CLL_PK="+$scope.loan_id,function(results){
            s.$apply(function () {s.borrowedinfo = results;});
        });
        myDB.T_CLIENT_INCOME.get("CLI_CLL_PK="+$scope.loan_id,function(results){
            s.$apply(function () {s.incomeinfo = results;});
        });
/******************************************
// load loan history (can be previous or current loan, depending on the arguments passed to the function)
******************************************/

        $scope.loadLoan = function(){

            var cmd = "SELECT T_CLIENT_LOAN.*, T_LOAN_TYPE.*, MAX(CRS_ACTUAL_WEEK_NO) as CRS_ACTUAL_WEEK_NO  FROM T_CLIENT_LOAN,T_LOAN_TYPE,T_CLIENT_REPAY_SCHEDULE WHERE CLL_LTY_PK = LTY_PK AND CLL_STATUS > 1 AND CLL_CLT_PK="+$scope.clientid+" AND CRS_CLL_PK = CLL_PK AND CRS_ATTENDED='Y' ";

            myDB.execute(cmd,function(res){
                $.each(res,function(i,loan){
                    //console.log(loan);
                    if(loan.CLL_PK != null)
                    $scope.currLoan.push(loan);

                    $.each($scope.currLoan,function(l,cloan){
                        if(cloan.CLL_LOAN_WEEKS == 'null') cloan.CLL_LOAN_WEEKS = "NA";
                    })


                    // var choice0 = "";
                    // var choice1 = "";
                    // var choice2 = "";
                    // var choice3 = "";
                    // var choice4 = "";

                    // $scope.houseindices = {};

                    // if(loan.CLL_HOUSE_SIZE != 'null')  $scope.houseindices[2] = loan.CLL_HOUSE_SIZE;
                    // if(loan.CLL_HOUSE_CONDITION != 'null' ) $scope.houseindices[3] = loan.CLL_HOUSE_CONDITION;
                    // if(loan.CLL_ROOF_TYPE != 'null' ) $scope.houseindices[4] = loan.CLL_ROOF_TYPE;
                    // if(loan.CLL_WALL_TYPE != 'null' ) $scope.houseindices[5] = loan.CLL_WALL_TYPE;
                    // if(loan.CLL_FLOOR_TYP != 'null' ) $scope.houseindices[6] = loan.CLL_FLOOR_TYP;

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

        $scope.SelectLoanHistory = function(CLL_PK){

            $scope.currLoanSelPK = CLL_PK;
            $scope.loadHistoryQuery();

        }

        $scope.isSchooling = function(schooling){
            var display = i18n.t("messages.IsSchooling"); 
            if(parseInt(schooling) == 0) display = i18n.t("messages.IsNotSchooling");
 
            return display;
        };

        $scope.getEducation = function(educode){ 
            return $scope.getFilteredList($scope.educationList, educode, 'name', true, 'desc');
        }

        $scope.getFilteredList = function(list, searchBy, searchKey, getOne, getKey) {
            if(list.length > 0) {
                var filteredList = $filter('filter')(list, { [searchKey]: searchBy });
                if(filteredList.length > 0) {
                    if(getOne) {
                        if(getKey !== null) {
                            return filteredList[0][getKey];
                        } else {
                            return filteredList[0];
                        }
                    } else {
                        return filteredList;
                    }
                }
            }
            return '';
        }

        $scope.loadFamily = function(CLT_PK){
              $scope.family = [];
              myDB.execute("SELECT * FROM T_CLIENT_FAMILY_LIST WHERE CFL_CLT_PK="+CLT_PK,function(results){ 
                  $.each(results,function(i,member){  
                        var ind = parseInt(i) + 1;
                        var key = {
                              index: ind,
                              name: member.CFL_NAME,
                              birthdate: member.CFL_DOB,
                              work: $scope.getFilteredList($scope.joblist, member.CFL_WORK, 'value', true, 'name'),
                              birthplace: member.CFL_PLACE_OF_BIRTH,
                              famcode: member.CFL_FAMILY_CODE,
                              gender: member.CFL_GENDER == "M" ? 'Male' : 'Female',
                              educode: $scope.getFilteredList($scope.educationList, member.CFL_EDU_CODE, 'name', true, 'desc'),
                              maritalstatus: $scope.getFilteredList($scope.maritalList, member.CFL_MARITAL_STATUS, 'value', true, 'name'),
                              isschooling: $scope.isSchooling(member.CFL_STILL_IN_SCHOOL)
                        };

                        $scope.family.push(key);
                  });
              });
        } 

        $scope.loadIncomes = function(){


            myDB.execute("SELECT * FROM T_CLIENT_INCOME, T_CLIENT_LOAN, T_CODE WHERE CODE_NAME = CLI_SOURCE AND CODE_TYPE_Pk = 20 AND CLI_CLL_PK = CLL_PK AND  CLL_CLT_PK ="+$scope.clientid+" GROUP BY CLI_SOURCE ORDER BY CLI_PK DESC ",function(results){  
                if(results.length == 0){
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

                        })
                        $scope.$apply(function(){
                            $scope.houseIncomes;
                        });
                    });
                } else {
                    $scope.houseIncomes = [];
                    //console.log(results);
                    var test = [];
                    $.each(results, function(i,inc){

                        var detaildesc = inc.CLI_SOURCE_DETAIL;
                        var inc_detail = "";
                        var inc_desc    = "";
                        if(detaildesc != "null"){
                            inc_detail = detaildesc.split(' ')[0];
                            inc_desc = detaildesc.split(' ')[1];
                        }

                        var incomeSouce = {
                            source: inc.CLI_SOURCE,
                            inctype: inc.CODE_DESC,
                            fixed: parseInt(inc.CLI_FIXED),
                            variable: parseInt(inc.CLI_VARIABLE),
                            details: parseInt(inc_detail == 'null' ? 0 : inc_detail),
                            detaildesc: inc_desc
                        } 
                        test.push(incomeSouce);
                        $scope.houseIncomes.push(incomeSouce);
                        if ( i+1 == results.length) { 
                        }
                    });

                    setTimeout(function(){
                        $scope.$apply(function(){
                            $scope.houseIncomes = test;  
                        })
                    },1000);
                }

            });

        }

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

        $scope.getTotalIncome = function(){
            var sum = 0;
            $.each($scope.houseIncomes,function(i,inc){
                sum += parseInt(inc.fixed) + parseInt(inc.variable);
            });

            return sum;
        }

        $scope.getTotalNetIncome = function(){
            var sum = 0;
            $.each($scope.houseIncomes,function(i,inc){
                if(inc.inctype == 'NEGATIVE'){
                    sum -= (parseInt(inc.fixed) + parseInt(inc.variable));
                } else {
                    sum += parseInt(inc.fixed) + parseInt(inc.variable);
                }
            }); 
            return sum;
        }

        $scope.loadIncomes();

        $scope.getHomeOwnership = function(){
            $scope.clientinfo.CLT_HOME_ONWERSHIP;
            if($scope.homeOwnershipType && $scope.homeOwnershipType.length > 0) {
                var ownership = $filter('filter')($scope.homeOwnershipType, { name:$scope.clientinfo.CLT_HOME_ONWERSHIP })[0];
                return ownership.value;
            } else {
                return '';
            }
            
        }

        $scope.loadCodes = function(){
            myDB.execute("SELECT * FROM T_CODE",function(res){
                  $scope.houseIncomes = [];
                  $scope.memberTypes = [];
                  $scope.homeOwnershipType = [];
                  $scope.joblist = [];
                  $scope.educationList = [];
                  $scope.maritalList = [];
                  $.each(res,function(i,code){
                        if(code.CODE_TYPE_PK == 20){ //Income Codes
                              var incomeSouce = {
                                    source:code.CODE_NAME,
                                    inctype:code.CODE_DESC,
                                    fixed:0,
                                    variable:0,
                                    details:0,
                                    detaildesc:null
                              };

                              $scope.houseIncomes.push(incomeSouce);
                        } else if (code.CODE_TYPE_PK == 23){ //Member Types
                              var memberType = {
                                    name:code.CODE_NAME,
                                    value:code.CODE_VALUE, 
                              };

                              $scope.memberTypes.push(memberType);
                        } else if (code.CODE_TYPE_PK == 22){ //Home Ownership
                              var ownershipType = {
                                    name: code.CODE_NAME,
                                    value:code.CODE_VALUE
                              }
                              $scope.homeOwnershipType.push(ownershipType);
                        } else if (code.CODE_TYPE_PK == 24) {
                              var Job = {
                                    name: code.CODE_NAME,
                                    value: code.CODE_VALUE
                              }
                              $scope.joblist.push(Job);
                        } else if (code.CODE_TYPE_PK == 3){
                              var edu = {
                                    name: code.CODE_NAME,
                                    value: code.CODE_VALUE,
                                    desc: code.CODE_DESC
                              }
                              $scope.educationList.push(edu);
                        } else if (code.CODE_TYPE_PK == 1){
                              var marital = {
                                    name: code.CODE_NAME,
                                    value: code.CODE_VALUE,
                                    desc: code.CODE_DESC
                              }
                              $scope.maritalList.push(marital);
                        }
                  })
                  $scope.loadFamily($scope.clientid);
            })
        }

        $scope.loadCodes();

        $scope.loadHistory = function(cmd, historydata, historyfn, historycanvas){

            $scope[historydata] = [];
            //console.log(cmd);
            myDB.execute(cmd,function(results){
                //console.log(results);
                /*if (historycanvas=="prevHistoryChart"){
                    //console.log(cmd);
                    //console.log(results);
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

                //console.log($scope[historydata]);

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
                var myNewChart = new Chart(ctx).Bar(data);
                if(historydata=="history"){ $scope.updateStatus(results); } //if it's current loan history
            });
        };

        $scope.loadHistoryQuery = function(){

            $scope.loadHistory("SELECT * FROM T_CLIENT_LOAN,T_CLIENT_REPAY_SCHEDULE WHERE ((CLL_STATUS>=13) OR CLL_STATUS=9) AND CRS_FLAG='C' AND CRS_LOAN_SAVING_FLAG ='L' AND CLL_PK=CRS_CLL_PK AND CLL_CLT_PK ="+$scope.clientid+" AND CLL_PK="+$scope.currLoanSelPK+" ORDER BY CRS_ACTUAL_WEEK_NO","history",$scope.getHistory,"historyChart");
            //for previous loans
            $scope.loadHistory("SELECT * FROM T_CLIENT_LOAN,T_CLIENT_REPAY_SCHEDULE WHERE CRS_FLAG='C' AND CRS_LOAN_SAVING_FLAG ='L' AND CLL_PK=CRS_CLL_PK AND CLL_PK="+prev_loan_id+" ORDER BY CRS_ACTUAL_WEEK_NO","prevhistory",$scope.prevgetHistory,"prevHistoryChart");
        }

    });
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
            var scope = this;
            results.forEach(function(value,index){
                scope.selectTransactions[value.TST_PK] || (scope.selectTransactions[value.TST_PK] = {}); //init if nul
                scope.selectTransactions[value.TST_PK] = value
            });
        },
        setTransactions : function(results){ //setClientInfo
            var scope = this;
            if(scope.selectTransactions) {
                $scope.$apply(function() {scope.selectTransactions.process(results);});
            } 
        },
        getTransactions : function(){
            var scope = this;
            myDB.T_TXN_STATUS.get(null,function(results){
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

    $scope.closeAccount = function(product){

        var dateonly = new Date();

        dateonly = ("0"+dateonly.getDate()).slice(-2)+"/"+("0"+(dateonly.getMonth()+1)).slice(-2)+"/"+dateonly.getFullYear();

        var newbalance = parseFloat(product.CPM_PRM_BALANCE);

        $scope.accCloseCheck(product,newbalance);

        // if(product.PRM_DEPOSIT_FREQUENCY == 'R'){

        // } else {

        // }

        // var cmd = "select * from T_CLIENT_REPAY_SCHEDULE as crs where crs.crs_date='"+dateonly+"' and crs.CRS_PRM_LTY_PK = "+product.PRM_PK+" AND crs.CRS_LOAN_SAVING_FLAG='S' AND crs.CRS_ATTENDED IN ('Y','N') and crs.crs_cll_pk ="+product.CPM_CLL_PK;
        // //console.log(cmd);
        // myDB.execute(cmd,function(results){
        //     //console.log(results);

        //     var prd = results[0];
        //     var actualpayment = parseFloat(prd.CRS_ACT_PROFIT_AMT) + parseFloat(prd.CRS_ACT_CAPITAL_AMT);

        //     var newbalance = parseFloat(newbalance) + parseFloat(actualpayment);

        //     $scope.accCloseCheck(product,newbalance);

        // });
    }

    $scope.accCloseCheck = function(product,newbalance){


        if(parseFloat(newbalance) < parseFloat(product.PRM_CLOSING_CHARGES)){

            var reason_text = i18n.t("messages.InsufficientBalToClose");
            reason_text = reason_text.replace("{closingfee}", $filter('currency')(product.PRM_CLOSING_CHARGES) );
            reason_text = reason_text.replace("{accountname}",product.PRM_NAME);

            var reason2_text = i18n.t("messages.YouOnlyHave");
            reason2_text = reason2_text.replace("{currentbal}",$filter('currency')(newbalance))

            swal({
                title: reason_text,
                text: reason2_text,
                type: "error",
                closeOnConfirm: true,
            });

            return false;
        } else {
            swal({
                title: i18n.t("messages.CnfmCloseAccount"),
                text: i18n.t("messages.Reason")+":",
                type: "input",
                showCancelButton: true,
                closeOnConfirm: false,
                animation: "slide-from-top",
                inputPlaceholder: i18n.t("messages.WriteReason")
            },
            function(inputValue){
                if (inputValue === false) return false;
                if (inputValue === "") {
                    swal.showInputError(i18n.t("messages.EmptyReason"));
                    return false
                }
                swal.close();
                //swal("Nice!", "You wrote: " + inputValue, "success");
                var date = new Date();

                date = date.getFullYear()+"-"+("0"+(date.getMonth()+1)).slice(-2)+"-"+("0"+date.getDate()).slice(-2)+" "+("0"+date.getHours()).slice(-2)+":"+("0"+date.getMinutes()).slice(-2)+":"+("0"+date.getSeconds()).slice(-2);

                //date = ("0"+date.getDate()).slice(-2)+"/"+("0"+(date.getMonth()+1)).slice(-2)+"/"+date.getFullYear()+" "+("0"+date.getHours()).slice(-2)+":"+("0"+date.getMinutes()).slice(-2)+":"+("0"+date.getSeconds()).slice(-2);

                // var DisbursedAmt = parseFloat(newbalance-product.PRM_CLOSING_CHARGES);
                var DisbursedAmt = parseFloat(newbalance);

                var cmd = "INSERT INTO T_CLIENT_PRODUCT_CLOSE_INFO VALUES(null"+
                            ","+$scope.last_cmp_pk+ //CPC_PK
                            ","+product.CPM_CLL_PK+ //CPC_CLL_PK
                            ","+product.CPM_PK+ //CPC_CPM_PK
                            ","+newbalance+//CPC_BALANCE_AMT
                            ","+product.PRM_CLOSING_CHARGES+ //CPC_CLOSING_FEE
                            ","+DisbursedAmt+ //CPC_DISBURSE_AMT
                            ",null"+ //CPC_DISBURSE_DTAE
                            ",'"+inputValue+"'"+ //CPC_REASON
                            ",null"+ //CPC_MANAGER_REMARK
                            ",null"+ //CPC_MANAGER_PK
                            ",53"+ //CPC_STATUS
                            ","+$scope.clientinfo.CLL_CREATED_BY+ //CLT_CREATED_BY
                            ",'"+date+"'"+ //CLT_CREATED_DATE
                            ",1)"; //CPC_CHKNEW 1=new record

                //console.log(cmd);

                myDB.dbShell.transaction(function(tx3){
                    tx3.executeSql(cmd);
                }, function(err){
                    //console.log(err);
                    swal("An error encountered when closing product.");
                    return false;
                }, function(suc){
                    //$scope.loadAllProducts();
                    $scope.loadproducts();
                });
            });
        }
    }

    $scope.addAccount = function(){
        swal({
            title: "Are you sure you want to open this account ?",
            type: "info",
            showCancelButton: true,
            closeOnConfirm: false,
        });
    }

/******************************************
// Updates the status page with values
******************************************/
    $scope.updateStatus = function(results){
        //this function calcs the YTD and puts on status page
        $scope.totalpaid = 0;
        var beforetoday = true;
        $.each(results, function(i,schpmt){ //scheduled payment
            if(schpmt.CRS_FLAG=='C'&& schpmt.CRS_ATTENDED=='Y'){
                $scope.totalpaid += ( parseFloat(schpmt.CRS_ACT_CAPITAL_AMT) + parseFloat(schpmt.CRS_ACT_PROFIT_AMT) ) ; //payment is made, calculate YTD
                //console.log($scope.totalpaid);
            }

            //calc latest loan balance
            var date = new Date();
            date = ("0"+date.getDate()).slice(-2)+"/"+("0"+(date.getMonth()+1)).slice(-2)+"/"+date.getFullYear();
            if(schpmt.CRS_FLAG=='C'&&schpmt.CRS_DATE==date){
                $scope.capbalance = schpmt.CRS_BALANCE_CAPITAL;
                $scope.profbalance = schpmt.CRS_BALANCE_PROFIT;
                beforetoday = false;
            }

            //find the last missed payment
            if(beforetoday&&schpmt.CRS_TOTALPAID==0&&schpmt.CRS_DATE!=date){
                $scope.latestpayment = schpmt;
            }
        });

        $scope.$apply();
    }


/******************************************
// T_CODE to show proper values in UI
******************************************/
    s.CODE = {};
    myDB.execute("SELECT CODE_TYPE_PK,CODE_VALUE,CODE_NAME FROM T_CODE WHERE CODE_IS_ACTIVE='Y'",function(results){
        results.forEach(function(value,index){
            s.CODE[value.CODE_TYPE_PK] || (s.CODE[value.CODE_TYPE_PK] = {}); //init if null
            s.CODE[value.CODE_TYPE_PK][value.CODE_VALUE] || (s.CODE[value.CODE_TYPE_PK][value.CODE_VALUE] = {});
            s.CODE[value.CODE_TYPE_PK][value.CODE_VALUE] = value;
        });
        $scope.$apply(function(){
           $scope.CODE;
        });
    });


    // $scope.products = [];
    // myDB.T_PRODUCT_MASTER.get(null,function(results){
    //         $.each(results,function(ind,rec){
    //             if(rec.PRM_IS_MANDATORY == "Y"){
    //                 rec.isSelected = "YES";
    //             } else{
    //                 rec.isSelected = "NO";
    //             }
    //             rec.showMaturityOptions = false;
    //             rec.maturityOptions = null;
    //             rec.selectedMaturityOption = [{
    //                 id: null,
    //                 name: null,
    //             }];
    //              if(rec.PRM_MATURITY_OPTIONS.length > 0){
    //                 rec.showMaturityOptions = true;
    //                 var matOptions = rec.PRM_MATURITY_OPTIONS.split(",");

    //                 rec.maturityOptions = matOptions;

    //                 rec.maturityObjects = [];
    //                 for(var i=0; i < matOptions.length; i++){

    //                     rec.maturityObjects[i] = {
    //                         id: i,
    //                         name: matOptions[i]
    //                     }
    //                 }
    //                 $scope.maturityObjects = rec.maturityObjects;
    //             }

    //             $scope.products.push(rec);

    //         });
    //         // //console.log($scope.products[1].isSelected);
    //         // //console.log($scope.products[1].PRM_IS_MANDATORY);
    //         // //console.log($scope.products[1].PRM_PK);
    //         //console.log($scope.products);
    //     });

/******************************************
// T_HOUSE_INDEX
******************************************/
    myDB.T_HOUSE_INDEX.get(null,function(results){ 
        $scope.houseindices = {};
        $.each(results,function(ind,rec){
            ($scope.houseindices[rec.HSE_TYPE_PK]||($scope.houseindices[rec.HSE_TYPE_PK]={}));
            $scope.houseindices[rec.HSE_TYPE_PK][rec.HSE_VALUE]=(rec);//.push
        }); 
    });
});

/******************************************
// Load client's photograph
******************************************/
// $(document).ready(function(){
//     var loadcount = 0;
//     var loadPicture = setInterval(function(){
//         console.log("Searching");
//         loadcount++;
//         console.log("RequestFileSytem");
//         console.log(window.requestFileSystem)
//         console.log("devtest")
//         console.log(devtest);
//         if(!devtest&&window.requestFileSystem){ //clientid
//             console.log(loadcount);
//             clearInterval(loadPicture);
//                 fileManager = new fm();
//                     try{
//                         var promise = fileManager.read("photo"+clientid+".dataurl");
//                         promise.done(function(result){
//                             $("#ncadPhoto").attr("src",result);
//                         });
//                     }catch(e){
//                         alert(e.message);
//                     };
//         } else {
//             console.log("no access");
//         }
//         if(loadcount>=5){
//             clearInterval(loadPicture);
//             console.log("Giving up");
//         }
//     }, 1000);
// });



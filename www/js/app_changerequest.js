/******************************************
// Controller
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


function nullToEmpty(val){
    for(var key in val){
        if(val[key] === null || val[key].length===0 || val[key] == 'null'){
            val[key] = '';
        }
    }
    return val;
}

(function() {
    //var myApp = angular.module("myApp", ['ng-currency']);
    myApp = angular.module("myApp", ['ng-currency', 'pascalprecht.translate' ]);
 
    myApp.directive('noDecimal', function () {
        return { 
            link: function ($scope, element, attrs) {
                element.bind('blur', function () {
                    attrs.ngModel = element.val(Math.round(element.val()))
                });
                element.bind('keypress', function () {
                    attrs.ngModel = element.val(Math.round(element.val()))
                });
                element.bind('blur', function () {
                    attrs.ngModel = element.val(Math.round(element.val()))
                });
            }
        };
    });

    myApp.filter('nfcurrency', [ '$filter', '$locale', function ($filter, $locale) {
        var currency = $filter('currency'), formats = $locale.NUMBER_FORMATS;
        return function (amount, symbol) {
            var value = currency(amount, 'RP ');
            return value.replace(new RegExp('\\' + formats.DECIMAL_SEP + '\\d{2}'), '')
        }
    }])

    myApp.filter('noFractionCurrency',
        [ '$filter', '$locale', function(filter, locale) {
                var currencyFilter = filter('currency');
                var formats = locale.NUMBER_FORMATS;
                return function(amount, currencySymbol) {
                    var value = currencyFilter(amount, currencySymbol);
                    var sep = value.indexOf(formats.DECIMAL_SEP);
                    ////printLog(amount, value);
                    if(amount >= 0) {
                    return value.substring(0, sep);
                    }
                    return value.substring(0, sep)+")";
                };
            }
        ]
    ); 

    myApp.config(function ($translateProvider) {

     $translateProvider.useStaticFilesLoader({
        prefix: "locales/locale-",
        suffix: ".json"
     });
     $translateProvider.preferredLanguage(ln.language.code);
    });

    myApp.directive('onFinishRender', function ($timeout) {
        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                if (scope.$last === true) {
                    $timeout(function () {
                        scope.$emit('ngRepeatFinished');
                    });
                }
            }
        };
    });
    myApp.directive('initialisation',['$rootScope',function($rootScope) {
        return {
            restrict: 'A',
            link: function($scope) {
                var to;
                var listener = $scope.$watch(function() {
                    clearTimeout(to);
                    to = setTimeout(function () {
                        //console.log('initialised');
                        listener();
                        $rootScope.$broadcast('initialised');
                    }, 50);
                });
            }
        };
    }]);
    myApp.directive('unproAssets', function () {
       return {
            scope: {
              upa: '=unproAssets',
              addnewUpro: '&',
              currloc: '@'
            },
            restrict: 'EA',
            template:   '<td>{{ upa.ind + 1 }}</td>' +
                        '<td>' +
                            '<div class="ui-input-text ui-body-inherit ui-corner-all ui-shadow-inset">'+
                                '<input id="" class="colVal" ng-blur=""  onclick="this.select();" type="text" ng-model="upa.asset" />'+
                            '</div>'+
                        '</td>'+
                        '<td>'+
                            '<div class="ui-input-text ui-body-inherit ui-corner-all ui-shadow-inset">'+
                                '<input id="" class="colVal" ng-blur=""  onclick="this.select();" ng-click="addnewUpro(upa.ind)" type="tel" ng-model="upa.value"  ng-currency currency-symbol="{{currloc}}"  />'+
                            '</div>'+
                        '</td>'
        };
    });
    myApp.filter('loanpurposefilter', function() {
         return function(items, lty_pk) {
            //console.log(lty_pk);
            if(lty_pk === undefined || lty_pk === null) return items;

            var filtered = [];
            $.each(items,function(idx,lpurp){
                if(lpurp.loan == lty_pk){
                    filtered.push(lpurp);
                }
            });
            var element = $('#activeloanPurpose');
            var selected = element.find('option:selected').text();
            element.parent().find('span').html(selected);

            var element2 = $('#activeloanMaturity');
            selected = element2.find('option:selected').text();
            element2.parent().find('span').html(selected);

            element2 = $('#activeloanGracePeriod');
            selected = element2.find('option:selected').text();
            element2.parent().find('span').html(selected);

            //$('#activeloanPurpose').selectmenu().selectmenu().selectmenu();

            return filtered;
        };
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
                elm.click(function(e){

                    e.stopPropagation();
                    e.preventDefault();

                    var USER_PK = parseInt(sessionStorage.getItem("USER_PK"));
                    var BRC_PK = parseInt(sessionStorage.getItem("BRC_PK"));
                    var haveNewRec = false;

                    if(page== 'pageAppData'){
                        //CHECK APPLICANT

                        if( scope.applicantdata.photo===null||
                            scope.applicantdata.fullname===null||
                            scope.applicantdata.gender===null||
                            // scope.applicantdata.loantype==null||
                            scope.applicantdata.placeofbirth===null||
                            scope.applicantdata.familycardno===null||
                            scope.applicantdata.ktpno===null||
                            scope.applicantdata.dateofbirth=== null||
                            scope.applicantdata.age===null||
                            scope.applicantdata.applicantdata<10||
                            scope.applicantdata.applicantdataapplicantdata>100||
                            scope.applicantdata.highested=== null||
                            (scope.applicantdata.highested==='6'&&scope.applicantdata.highestedothers==="")){

                                if( sweetCheckNull(scope.applicantdata.photo,i18n.t("messages.EmptyPhoto"),"pageAppData")||
                                    sweetCheckNull(scope.applicantdata.fullname,i18n.t("messages.EmptyFullName"),"pageAppData")||
                                    sweetCheckNull(scope.applicantdata.gender,i18n.t("messages.EmptyGender"),"pageAppData")||
                                    // sweetCheckNull(scope.applicantdata.loantype,i18n.t("messages.EmptyLoanType"),"pageAppData")||
                                    sweetCheckNull(scope.applicantdata.familycardno,i18n.t("messages.EmptyFamilyCardNo"),"pageAppData")||
                                    sweetCheckNull(scope.applicantdata.ktpno,i18n.t("messages.EmptyKTPNo"),"pageAppData")||
                                    sweetCheckNull(scope.applicantdata.dateofbirth,i18n.t("messages.EmptyDOB"),"pageAppData")||
                                    sweetCheckNull(scope.applicantdata.placeofbirth,i18n.t("messages.EmptyPlaceofBirth"),"pageAppData")||
                                    sweetCheckNull(scope.applicantdata.age,i18n.t("messages.EmptyAge"),"pageAppData")||
                                    sweetCheckNull(scope.applicantdata.highested,i18n.t("messages.EmptyHighestEducation"),"pageAppData")||
                                    sweetCheckRange(10,120,scope.applicantdata.age,i18n.t("messages.InvalidAge"),"pageAppData")
                                  ){



                                } else if(scope.applicantdata.highested=='6'&&scope.applicantdata.highestedothers===""){
                                    swal({
                                        title: i18n.t("messages.Alert"),
                                        text: i18n.t("messages.EmptyOtherEducation"),
                                        type: "error",
                                        confirmButtonColor: "#80C6C7",
                                        confirmButtonText: "Ok",
                                    });
                                }

                            return false;
                        } else {

                            $('.ab-'+page+'.arrow_box').addClass('edited');

                            $("html, body").animate({ scrollTop: 0 }, 600);

                            if( $( ".etask-progress .etask:nth-child(1)" ).find('.etask-icon i').hasClass('hidden')){
                                $('.etask-progress-bar').delay(500).css('width','25%');
                            }
                            $( ".etask-progress .etask:nth-child(1)" ).find('.etask-icon i').removeClass('hidden');
                            $('.etask-progress .etask:nth-child(1)').find('.etask-icon i').delay(700).animate({
                                opacity: '1',
                                height: '3em',
                                width: '3em',
                                'line-height': '3em',
                                left: '-0.5em',
                                top: '-0.5em',
                            },300);

                            scope.updateClientData('applicantdata');
                            // setTimeout(function(){
                            //     $.mobile.changePage("#pageAppData2");
                            // },1450)
                        }

                        if(haveNewRec){
                            //scope.actionSubmit();
                            //scope.actionSubmitSecond();
                        }


                    } else if(page == 'pageAppData2'){

                        //CHECK MARRITAL
                        if( scope.husbandinfo.maritalstatus===null||
                            (scope.husbandinfo.maritalstatus!='S'&& scope.husbandinfo.husbandname===null)||
                            (scope.husbandinfo.maritalstatus!='S'&& scope.husbandinfo.husbandidno===null)){
                                if( sweetCheckNull (scope.husbandinfo.maritalstatus,i18n.t("messages.EmptyMaritalStatus"))
                                ){

                                } else  if(scope.husbandinfo.maritalstatus!='S'&&(scope.husbandinfo.husbandname===null)){

                                    swal({
                                        title: i18n.t("messages.Alert"),
                                        text: i18n.t("messages.EmptyHusbandName"),
                                        type: "error",
                                        confirmButtonColor: "#80C6C7",
                                        confirmButtonText: "Ok",
                                    });
                                } else if(scope.husbandinfo.maritalstatus!='S'&&(scope.husbandinfo.husbandidno===null)){
                                    swal({
                                        title: i18n.t("messages.Alert"),
                                        text: i18n.t("messages.EmptyHusbandIDNo"),
                                        type: "error",
                                        confirmButtonColor: "#80C6C7",
                                        confirmButtonText: "Ok",
                                    });
                                }
                            e.stopPropagation();
                            e.preventDefault();
                            return false;

                        } else {

                            $('.ab-'+page+'.arrow_box').addClass('edited');

                            $("html, body").animate({ scrollTop: 0 }, 600);
                            if( $( ".etask-progress .etask:nth-child(2)" ).find('.etask-icon i').hasClass('hidden')){
                                $('.etask-progress-bar').delay(500).css('width','50%');
                            }
                            $( ".etask-progress .etask:nth-child(2)" ).find('.etask-icon i').removeClass('hidden');
                            $('.etask-progress .etask:nth-child(2)').find('.etask-icon i').delay(700).animate({
                                opacity: '1',
                                height: '3em',
                                width: '3em',
                                'line-height': '3em',
                                left: '-0.5em',
                                top: '-0.5em',
                            },300);
                        
                            scope.updateClientData('husbandinfo');
                        }

                    } else if(page == 'pageAppData3'){

                        if(scope.housemotherinfo.noofmembers===null||
                            scope.housemotherinfo.noofchildren===null||
                            scope.housemotherinfo.mothername===null||
                            scope.housemotherinfo.motherdob===null||
                            scope.housemotherinfo.motherage===null||
                            scope.housemotherinfo.noofmembers<0 || scope.housemotherinfo.noofmembers>99||
                            scope.housemotherinfo.noofchildren<0 || scope.housemotherinfo.noofchildren>99||
                            scope.housemotherinfo.motherage<10 || scope.housemotherinfo.motherage>120){

                            if( sweetCheckNull(scope.housemotherinfo.noofmembers,i18n.t("messages.EmptyMember"),"pageAppData3")||
                                sweetCheckRange(0,99,scope.housemotherinfo.noofmembers,i18n.t("messages.InvalidMember"),"pageAppData3")||
                                sweetCheckNull(scope.housemotherinfo.noofchildren,i18n.t("messages.EmptyChildren"),"pageAppData3")||
                                sweetCheckRange(0,99,scope.housemotherinfo.noofchildren,i18n.t("messages.InvalidChildren"),"pageAppData3")||
                                sweetCheckNull(scope.housemotherinfo.mothername,i18n.t("messages.EmptyMotherName"),"pageAppData3")||
                                sweetCheckNull(scope.housemotherinfo.motherdob,i18n.t("messages.EmptyMotherDOB"),"pageAppData3")||
                                sweetCheckNull(scope.housemotherinfo.motherage,i18n.t("messages.EmptyMotherAge"),"pageAppData3")||
                                sweetCheckRange(10,120,scope.housemotherinfo.motherage,i18n.t("messages.InvalidMotherAge"),"pageAppData3")
                            ){
                                //$.mobile.changePage("#pageAppData3");

                            }
                            e.stopPropagation();
                            e.preventDefault();
                            return false;
                        } else {
                            $('.ab-'+page+'.arrow_box').addClass('edited');
                            $("html, body").animate({ scrollTop: 0 }, 600);
                            $( ".etask-progress .etask:nth-child(3)" ).find('.etask-icon i').removeClass('hidden');
                            $('.etask-progress-bar').css('width','75%');
                            $('.etask-progress .etask:nth-child(3)').find('.etask-icon i').delay(700).animate({
                                opacity: '1',
                                height: '3em',
                                width: '3em',
                                'line-height': '3em',
                                left: '-0.5em',
                                top: '-0.5em',
                            },300);
                            scope.updateClientData('housemotherinfo');
                          
                        }
                    } else if(page == 'pageAppData4'){
                        $('.ab-'+page+'.arrow_box').addClass('edited');
                        $("html, body").animate({ scrollTop: 0 }, 600);
                        $( ".etask-progress .etask:nth-child(4)" ).find('.etask-icon i').removeClass('hidden');
                        $('.etask-progress-bar').css('width','100%');
                        $('.etask-progress .etask:nth-child(4)').find('.etask-icon i').delay(700).animate({
                                opacity: '1',
                                height: '3em',
                                width: '3em',
                                'line-height': '3em',
                                left: '-0.5em',
                                top: '-0.5em',
                            },300);
                       
                        scope.updateClientData('businessinfo');

                    } else if(page == 'pageAddress'){
                        //console.log(scope.address.village);

                        if( scope.address.village.val===null||
                            scope.address.subdistrict===null||
                            scope.address.district===null
                        ){

                            if( sweetCheckNull(scope.address.village.val,i18n.t("messages.EmptyVillage"),"pageAddress")||
                                sweetCheckNull(scope.address.subdistrict,i18n.t("messages.EmptySubDistrict"),"pageAddress")||
                                sweetCheckNull(scope.address.district,i18n.t("messages.EmptyDistrict"),"pageAddress")||
                                sweetCheckNull(scope.address.province,i18n.t("messages.EmptyProvince"),"pageAddress")
                            ){

                            }
                            e.stopPropagation();
                            e.preventDefault();
                            return false;

                        } else {
                            $('.ab-'+page+'.arrow_box').addClass('edited');
                            $("html, body").animate({ scrollTop: 0 }, 600);
                            $( ".etask-progress .etask:nth-child(5)" ).find('.etask-icon i').removeClass('hidden');
                            $('.etask-progress-bar-vert').css('height','100%');
                            $('.etask-progress .etask:nth-child(5)').find('.etask-icon i').delay(700).animate({
                                opacity: '1',
                                height: '3em',
                                width: '3em',
                                'line-height': '3em',
                                left: '-0.5em',
                                top: '-0.5em',
                            },300);
                            scope.updateClientData('address');
                       
                        }

                    } else if(page == 'pageWelfareStatus'){

                        if(scope.welfareStatus === null){
                            if(sweetCheckNull(scope.welfareStatus,i18n.t("messages.EmptyWelfareStatus"),"pageWelfareStatus"))
                            {

                            }
                            e.stopPropagation();
                            e.preventDefault();
                            return false;

                        } else {
                            $('.ab-'+page+'.arrow_box').addClass('edited');
                            $("html, body").animate({ scrollTop: 0 }, 600);
                            $( ".etask-progress-reverse .etask:nth-child(5)" ).find('.etask-icon i').removeClass('hidden');
                            $('.etask-progress-bar-reverse').css('width','75%');
                            $('.etask-progress-reverse .etask:nth-child(5)').find('.etask-icon i').delay(700).animate({
                                opacity: '1',
                                height: '3em',
                                width: '3em',
                                'line-height': '3em',
                                left: '-0.5em',
                                top: '-0.5em',
                            },300);
                   
                            scope.updateClientData('welfare');
                        }

                    } else if(page == 'pageWorkingCapital'){

                        if(scope.borrowedFunds.length>0){
                            for(var key in scope.borrowedFunds){
                                if(!checkFunds(scope.borrowedFunds[key])){
 
                                    e.stopPropagation();
                                    e.preventDefault();
                                    return false;
                                }
                            }
                        }

                        if( scope.workcap.app===null|| isNaN(scope.workcap.app)||
                            (scope.husbandinfo.maritalstatus=='M'&&scope.workcap.husband===null) ||
                            (scope.husbandinfo.maritalstatus=='M'&&isNaN(scope.workcap.husband) ) ) {

                            if( sweetCheckNull(scope.workcap.app,i18n.t("messages.EmptyApplicantWorkCapital"),"pageWorkingCapital")||
                                (scope.husbandinfo.maritalstatus=='M'&&sweetCheckNull(scope.workcap.husband,i18n.t("messages.EmptyHusbandWorkCapital"),"pageWorkingCapital"))
                            ){

                            } else if( isNaN(scope.workcap.app) || isNaN(scope.workcap.husband) ){
                                swal({
                                    title: i18n.t("messages.Alert"),
                                    text: i18n.t("messages.EmptyClientHusbandWorkCapital"),
                                    type: "error",
                                    confirmButtonColor: "#80C6C7",
                                    confirmButtonText: "Ok",
                                });
                            }
                            e.stopPropagation();
                            e.preventDefault();
                            return false;

                        } else {
                            $('.ab-'+page+'.arrow_box').addClass('edited');
                            $("html, body").animate({ scrollTop: 0 }, 600);
                            $( ".etask-progress-reverse .etask:nth-child(4)" ).find('.etask-icon i').removeClass('hidden');
                            $('.etask-progress-bar-reverse').css('width','50%');
                            $('.etask-progress-reverse .etask:nth-child(4)').find('.etask-icon i').delay(700).animate({
                                opacity: '1',
                                height: '3em',
                                width: '3em',
                                'line-height': '3em',
                                left: '-0.5em',
                                top: '-0.5em',
                            },300);
                            // setTimeout(function(){
                            //     $.mobile.changePage("#pageHousingIndex");
                            // },1450)
                            scope.updateClientData('workcap');
                        }

                    } else if(page == 'pageHousingIndex'){


                        if( scope.applicantdata.homeless != 'YES' &&
                            (
                                //scope.choices[0]===null||
                            //scope.choices[1]===null||
                            // scope.choices[2]==null||
                            scope.choices[3]===null||
                            scope.choices[4]===null) ){
                         
                              if( 
                                    sweetCheckNull(scope.choices[3],i18n.t("messages.EmptyWallType"),"pageHousingIndex")||
                                    sweetCheckNull(scope.choices[4],i18n.t("messages.EmptyFloorType"),"pageHousingIndex") 
                                )
                                {

                                }
                            e.stopPropagation();
                            e.preventDefault();
                            return false;
                        } else {
                            $('.ab-'+page+'.arrow_box').addClass('edited');
                            $("html, body").animate({ scrollTop: 0 }, 600);
                            $( ".etask-progress-reverse .etask:nth-child(3)" ).find('.etask-icon i').removeClass('hidden');
                            $('.etask-progress-bar-reverse').css('width','25%');
                            $('.etask-progress-reverse .etask:nth-child(3)').find('.etask-icon i').delay(700).animate({
                                opacity: '1',
                                height: '3em',
                                width: '3em',
                                'line-height': '3em',
                                left: '-0.5em',
                                top: '-0.5em',
                            },300);
                            scope.updateClientData('houseinfo'); 
                        }

                    } else if(page == 'pageHouseIncomeEst'){

                        if(scope.houseIncomes.length<1){
                            swal({
                                title: i18n.t("messages.Alert"),
                                text: i18n.t("messages.MinIncomeSource"),
                                type: "error",
                                confirmButtonColor: "#80C6C7",
                                confirmButtonText: "Ok",
                            });
                            e.stopPropagation();
                            e.preventDefault();
                            return false;
                        }
 
                        $('.ab-'+page+'.arrow_box').addClass('edited');
                        $("html, body").animate({ scrollTop: 0 }, 600);
                        $( ".etask-progress-reverse .etask:nth-child(2)" ).find('.etask-icon i').removeClass('hidden');
                        $('.etask-progress-bar-reverse').css('width','0%');
                        $('.etask-progress-reverse .etask:nth-child(2)').find('.etask-icon i').delay(700).animate({
                                opacity: '1',
                                height: '3em',
                                width: '3em',
                                'line-height': '3em',
                                left: '-0.5em',
                                top: '-0.5em',
                            },300);

                        scope.updateClientData('houseincomes');
                        
                    } else if(page == 'pageProductMapping'){

                        if(scope.selectedLoans.length === 0){
                            swal({
                                title: i18n.t("messages.Alert"),
                                text: i18n.t("messages.NoLoanSelected"),
                                type: "warning",
                            });
                            return false;
                        } else {
                            var totalloan = 0;
                            for(var lkey in scope.selectedLoans){
                                // if($scope.selectedLoans[key].selecteddetails.)
                                totalloan += scope.selectedLoans[lkey].selecteddetails.loanamt;
                            }

                            if(totalloan > 10000000) {
                                swal({
                                    title: i18n.t("messages.Alert"),
                                    text: i18n.t("messages.LoansExceed"),
                                    type: "warning",
                                });
                                return false;
                            }

                            $(".etask-progress-reverse .etask:nth-child(1)" ).find('.etask-icon i').removeClass('hidden');
                            $('.etask-progress-bar-reverse').css('width','0%');
                            $('.etask-progress-reverse .etask:nth-child(2)').find('.etask-icon i').delay(700).animate({
                                    opacity: '1',
                                    height: '3em',
                                    width: '3em',
                                    'line-height': '3em',
                                    left: '-0.5em',
                                    top: '-0.5em',
                                },300); 
                        }
                    } else if ( page == 'pageProducts') {
                        if(scope.selectedLoans.length > 0){
                            if(scope.ctr_lead.hasSigned && scope.client.hasSigned){
                                scope.updateClientData('loan');
                            } else {
                                swal({
                                    title: i18n.t("messages.Alert"),
                                    text: i18n.t("messages.PleaseSignBelow"),
                                    type: "warning",
                                });
                                return false;
                            }

                        } else {
                            swal({
                                title: i18n.t("messages.Alert"),
                                text: i18n.t("messages.NoLoanSelected"),
                                type: "warning",
                            });
                            return false;
                        }
                    }

                });

                function checkIncomes(incObj){
                    return true;
                   
                }

            }
        };
    });



    myApp.controller("clientCtrl", ['$scope','$filter','$compile','$timeout','ClientService','LoanService','SavingService', '$rootScope',
    function($scope,$filter,$compile,$timeout,ClientService,LoanService,SavingService, $rootScope) {
 
        $scope.$on('ngRepeatFinished', function (ngRepeatFinishedEvent) {
             
        });

        setTimeout(() => {
            $scope.monthtext = i18n.t("messages.Month");
        }, 1000);
       
        var cmd = "select * from T_COMPANY";
        myDB.execute(cmd, function(results){
                ////console.log(results);
        });

        $scope.currloc = 'Rp ';

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
            hasSigned: false
        };
        $scope.showSign = false;
        $scope.isNewClient = false;
        $scope.ctr_lead = {
            ctr_lead_pk: null,
            ctr_lead_name: null,
            Signature: null,
            hasSigned : null,
            ctr_leaders: []
        };

        $scope.witnesses = [
            { witness_pk: null, witness_name: null, Signature: null, hasSigned : null },
            { witness_pk: null, witness_name: null, Signature: null, hasSigned : null },
            { witness_pk: null, witness_name: null, Signature: null, hasSigned : null },
            { witness_pk: null, witness_name: null, Signature: null, hasSigned : null },
        ]

        $scope.selectedWitness = [];

        $scope.grp_lead = {
            grp_lead_pk: null,
            grp_lead_name: null,
            Signature: null,
            hasSigned: null
        };

        $scope.showSign = false;
        $scope.signingclientIndex = null;
        $scope.signinguser = null;

        $scope.repaymentPerMonth = 0;

        //TEXTS IN NG-REPEAT
        $scope.grouptext = i18n.t("messages.Group");
        $scope.actiontext = i18n.t("messages.Action");
        $scope.maxMembers = 5;
        $scope.currGrp = {};
        $scope.leader = null;
        $scope.available = [];
        $scope.savedGrps = []; 
        $scope.family = [];
        $scope.unproassets = [];
        $scope.selectCodes = [];
        $scope.haveNewRec = false;
        $scope.client= null;
        $scope.attendance = 0;
        $scope.group_attendance = 0;
        $scope.center_attendance = 0;
        $scope.installment = 0;
        $scope.group_installment = 0;
        $scope.center_isntallment = 0;
        $scope.feastrepay = feastrepay;

        /******************************************
        - Applicant's Data
        ******************************************/

        $scope.applicantdata = {
            photo:null,
            filename:null,
            fullname:null,
            nickname:null,
            gender:null,
            familycardno:null,
            clientno:null,
            ktpno:null,
            loantype:null,
            dateofbirth:null,
            age:null,
            highested:null,
            highestedothers:"",
            tsunamiAffected: 'NO',
            quakeAffected: 'NO',
            haveSavings: 'NO',
            haveInsurance: 'NO',
            homeless: 'NO',
            products: [],
        };

        setTimeout(function(){
            $scope.nametxt = i18n.t("messages.Name");
            $scope.birthdatetxt = i18n.t("messages.DOB");
            $scope.relationshiptxt = i18n.t("messages.Relationship");
            $scope.gendertxt = i18n.t("messages.Gender");
            $scope.worktxt = i18n.t("messages.Work");
            $scope.birthplacetxt = i18n.t("messages.BirthPlace");
            $scope.educationtxt = i18n.t("messages.Education");
            $scope.jointhistgrouptxt = i18n.t("messages.JoinThisGroup");
            $scope.removetxt = i18n.t("messages.Remove");
            $scope.weektxt = i18n.t("messages.Weeks");
            $scope.minloantxt = i18n.t("messages.MinLoan");
            $scope.loanpurposetxt = i18n.t("messages.LoanPurpose");
        },100);

        $scope.loadCodes = function(){
            myDB.execute("SELECT * FROM T_CODE",function(res){
                  $scope.houseIncomes = [];
                  $scope.memberTypes = [];
                  $scope.homeOwnershipType = [];
                  $scope.joblist = [];
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
                        }
                  })
            })
        }

        $scope.loadCodes();


        $scope.checkNew = function(type,key){
            ////console.log(type);
            if(type.olddata === null || type.olddata[key] === null){
                return true;
            } else {
                return false;
            }

        };

        $scope.group = {
            groupid: null,
            isGroupLeader: false
        };

        $scope.oldgroupid = null;

        $scope.apHighestEdOthers = function(){
            return $scope.applicantdata.highested=="6";
        };

        $scope.adCalcAge = function(){

            var dob = $scope.applicantdata.dateofbirth;

            if(dob == undefined ) return 0;

            var year = dob.split("/")[2];
            var diff = parseInt(moment().format('YYYY'))-parseInt(year);
            var age = 0;
            if(diff==null||isNaN(diff)) age = 0;
            else age = diff;
            $scope.applicantdata.age = age;
            return age;
        };

        $scope.checkHomeless = function(){

            if($scope.applicantdata.homeless == 'YES'){
                $scope.tempchoices = $scope.choices;
                $scope.choices = [null,null,null,null,null,null,null];
            } else {
                $scope.choices = $scope.tempchoices;
            }
            console.log($scope.choices);
            $scope.getTotal();
            refreshall('.housing');

            setTimeout(function() {

                $('#ncHSSZ').selectmenu("refresh", true);
                $('#ncCOND').selectmenu("refresh", true);
                $('#ncROOF').selectmenu("refresh", true);
                $('#ncWALL').selectmenu("refresh", true);
                $('#ncFLOR').selectmenu("refresh", true);

            }, 300);

        };
        /******************************************
        - Husband's Info
        ******************************************/

        $scope.husbandinfo = {
            maritalstatus:null,
            husbandname:null,
            husbandidno:null,
            livesinhouse:'NO',
            whereis:null,
            howoften:null,
        };

        $scope.showHusband = function(){
            return $scope.husbandinfo.maritalstatus=='M';
        };

        /******************************************
        - Household and Mother Info
        ******************************************/

        $scope.housemotherinfo = {
            noofmembers:null,
            noofchildren:null,
            mothername:null,
            motherdob:null,
            motherage:null,
        };

        $scope.hmiCalcMotherAge = function(){ //@@@@@@@@@@@@@@@@@@
            var year = (document.getElementById('ncadMotherBirthdate'));

            var dob = $scope.housemotherinfo.motherdob;

            if(dob == undefined ) return 0;

            year = dob.split("/")[2];
            var diff = parseInt(moment().format('YYYY'))-parseInt(year);
            var age = 0;
            if(diff==null||isNaN(diff)) age = 0;
            else age = diff;

            $scope.housemotherinfo.motherage = age;

            return age;
        };

        /******************************************
        - Business Info
        ******************************************/

        $scope.businessinfo = {
            typeofbusiness:null,
            busequipment:null,
            jointbusiness:null,
            jbequipment:null,
            husbandbusiness:null,
            hbequipment:null,
        };

        /******************************************
        - Address
        ******************************************/

        $scope.address = {
            rt:null,
            rw:null,
            streetarea:null,
            centerid:null,
            village : {
                val: null,
                name: null,
            },
            subdistrict:null,
            district:null,
            province:null,
            postcode:null,
            landmark:null,
            mobile1:null,
            mobile2:null,
            husbmobile:null,
        };

        $scope.group = {
            branchpk : null,
            centerpk : null,
            groupid : null,
            groupname : null
        };

        /******************************************
        - Family Welfare Status
        ******************************************/
        $scope.welfareStatus=null;

        $scope.checkWelfare = function(selection){
            return selection===$scope.welfareStatus;
        };
        $scope.addNewFam = function(ind){
            var isnew = true;
            if(ind === 0 ) isnew = false;
            var maxfam = $scope.family.length;
            var currpro = parseInt(ind);
            if(maxfam == currpro){

                $scope.family.push($scope.getDefRecFamily());
                setTimeout(function() {$scope.$apply();}, 100);
            }
        };
        $scope.getDefRecFamily = function(){
            return {
                name: '',
                birthplace: '',
                birthdate: '',
                gender: '',
                work: '',
                education: '',
                isschooling: 0,
                status: 8,
                isNew: false
            };
        };
        $scope.checkSch = function(schooling,$event){

            console.log(schooling);
            var obj = $event.currentTarget;
            console.log($(obj).attr('id'));
            var id = $(obj).attr('id');
            if(schooling == 0) {
                $("label[for='"+id+"']").removeClass('ui-checkbox-off').addClass('ui-checkbox-on');
            } else {
                $("label[for='"+id+"']").removeClass('ui-checkbox-on').addClass('ui-checkbox-off');
            }
        };
        $scope.isSchChecked = function(schooling){
            var checked = false;
            if(schooling == 1) {
                checked = true;
            }
            return checked;
        };
        $scope.isSchooling = function(schooling){
            var display = i18n.t("messages.IsSchooling"); 
            if(schooling == 0) display = i18n.t("messages.IsNotSchooling");

            return display;
        };
        $scope.addNewUpro = function(ind){

            var currpro = parseInt(ind);
            var maxunpro = $scope.unproassets.length;
            var newobj = {
                index: parseInt(maxunpro + 1),
                asset: '',
                value: 0,
                isNew: true
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

        /******************************************
        - Working Capital
        ******************************************/

        $scope.borrowedFunds = [];
        $scope.fundEntry = {};
        $scope.selectedfund = -1;
        $scope.workcap = {
            app:null,
            husband:null,
            totalWorkCap : function(){
                return $scope.workcap.app+$scope.workcap.husband;
            },
        };

        $scope.clients = [];
        $scope.getAllClientsFromCenter = function(client){

            $.when(ClientService.getAllClientsFromCenter(client.CLT_CENTER_ID)).done(function(data){
                clients = data;
                for(var c in clients){
                    var c_client = clients[c];
                    $scope.clients.push(c_client);
                    if(c_client.CLT_IS_GROUP_LEADER == 'Y'){
                        $scope.ctr_lead.ctr_leaders.push(c_client);
                        if(c_client.CLT_GROUP_ID == client.CLT_GROUP_ID){
                            $scope.grp_lead.grp_lead_pk = c_client.CLT_PK;
                            $scope.grp_lead.grp_lead_name = c_client.CLT_FULL_NAME;
                            $scope.grp_lead.hasSigned = false;
                        }
                    }
                } 
            }); 

        };

        $scope.updated = {
            applicantdata: {
                isUpdated: false,
                olddata: null,
                newdata: null
            },
            husbandinfo: {
                isUpdated: false,
                olddata: null,
                newdata: null
            },
            housemotherinfo: {
                isUpdated: false,
                olddata: null,
                newdata: null
            },
            businessinfo: {
                isUpdated: false,
                olddata: null,
                newdata: null
            },
            address: {
                isUpdated: false,
                olddata: null,
                newdata: null
            },
            unproassets: {
                isUpdated: false,
                olddata: null,
                newdata: null
            },
            family: {
                isUpdated: false,
                olddata: null,
                newdata: null
            },
            welfare : {
                isUpdated: false,
                olddata: null,
                newdata: null
            },
            houseIncomes: {
                isUpdated: false,
                olddata: null,
                newdata: null
            },
            houseinfo: {
                isUpdated: false,
                olddata: null,
                newdata: null
            },
            workcap: {
                isUpdated: false,
                olddata: null,
                newdata: null
            },
            signature: {
                isUpdated: false,
                olddata: null,
                newdata: null
            },
            group: {
                isUpdated: false,
                olddata: null,
                newdata: null
            }
        };

        $scope.blob = null;

        $scope.tmp_client = null;
        $scope.old_client = null;

        $scope.clientPK = sessionStorage.getItem("CLIENT_ID"); //(parseInt(sessionStorage.getItem("NEWLOAN_CLIENT_PK")) != "" ?

        $scope.unproaObj = {
            index: 0,
            asset: '',
            value: 0
        };

        $scope.allGroups = [];
        $scope.groupmembers = [];
        $scope.existingloans = [];
        $scope.existingloanStatus = [];

        var CLT_PK = $scope.clientPK;

        myDB.execute("SELECT * FROM T_CLIENT_GROUP, T_CENTER_MASTER WHERE CLG_CTR_PK = CTR_PK",function(res){
            if(res){
                $.each(res,function(i,val){
                    $scope.allGroups.push(val);
                });
            }
        });

        $scope.getAllGroupMembers = function(client) {
            myDB.execute("SELECT CLT_FULL_NAME, CLT_PK FROM T_CLIENT WHERE CLT_CENTER_ID='"+ client.CLT_CENTER_ID + "' AND CLT_GROUP_ID='"+ client.CLT_GROUP_ID +"'", function(res) {
                if(res) {
                    $.each(res, function(i,member) {
                        $scope.groupmembers.push(member);
                    });
                }
            });
        }

        $scope.checkShooling = function(fam, id){
            //console.log(fam.educode);
            if(fam.educode == 'NS'){
                fam.isschooling = 0;
            }
            //console.log(fam)
            if(parseInt(fam.isschooling) == 1) {
                $("label[for='"+id+"']").removeClass('ui-checkbox-off').addClass('ui-checkbox-on');
            } else {
                $("label[for='"+id+"']").removeClass('ui-checkbox-on').addClass('ui-checkbox-off');
            } 
            refreshall('.schoolingcode'); 

        }

        $scope.ChkNewClientDataExists = function(CLT_PK){
            
            var client = null; 
            $.when(ClientService.getOneClientNewInfo(CLT_PK)).done(function(data){
                client = data;
                if(client !== null){
                    $scope.haveNewRec = true;
                    $scope.client = client;
                    $scope.magic(client);
                    $scope.loadFromClient(CLT_PK,false,client);
                } else { 
                    $scope.loadFromClient(CLT_PK,true,client);
                } 
            }) 
        };

        $scope.loadFromClient = function(CLT_PK,ifMagic,clientnew){

            var client = null; 
            $.when(ClientService.getOneClient(CLT_PK)).done(function(data){
                //console.log(data);
                client = data;
                $scope.client = client;
                $scope.magic(client,clientnew);
                $scope.getAllClientsFromCenter(client); 
                $scope.getExistingLoanRepayment(CLT_PK);
                $scope.getAllGroupMembers(client);
            }) 
        };

        $scope.getExistingLoanRepayment = function(CLT_PK){
                
            $scope.repaymentPerMonth = 0;
 
            var cmd = "SELECT CLL_REPAY_PER_WEEK FROM T_CLIENT_LOAN WHERE CLL_STATUS IN (16,17,18,19,20,21,41,42) AND CLL_CLT_PK="+CLT_PK;
             
            myDB.execute(cmd,function(res){ 
                $.each(res,function(l,loan){
                    $scope.repaymentPerMonth += (parseFloat(loan.CLL_REPAY_PER_WEEK) * 4);
                });
            });
        };

        

        $scope.getApplicantData = function(client,isNew,loan){
 
            if(client != null){
                var applicantdata = {};
                //console.log(client);
                applicantdata.fullname= decodeURI(client.CLT_FULL_NAME);
                applicantdata.nickname= decodeURI(client.CLT_NICK_NAME);
                applicantdata.clientstatus = 7; //client.CLT_STATUS;

                var educ = null;
                if( client.CLT_HIGH_EDU != ''  && client.CLT_HIGH_EDU != 'null') {
                    educ =  $filter('filter')($scope.selectCodes[3], { name: client.CLT_HIGH_EDU })[0];
                }
                var housingtype = null;
                if( client.CLT_HOME_ONWERSHIP != '' && client.CLT_HOME_ONWERSHIP != 'null') {
                    housingtype =  $filter('filter')($scope.homeOwnershipType, { value: client.CLT_HOME_ONWERSHIP })[0]; 
                }

                var gender = $filter('filter')($scope.selectCodes[2], { value: client.CLT_GENDER })[0]; 
                // console.log($scope.selectCodes[3])
                // console.log(educ);  
                // console.log($scope.homeOwnershipType);

                applicantdata.gender = gender.value;
                applicantdata.placeofbirth= decodeURI(client.CLT_PLACE_OF_BIRTH);
                applicantdata.dateofbirth=  client.CLT_DOB;
                applicantdata.familycardno= client.CLT_FAMILY_CARD_NO;
                applicantdata.clientno= client.CLT_CLEINT_ID;
                applicantdata.ktpno= client.CLT_OTH_REG_NO;
                applicantdata.gruopid = client.CLT_GROUP_ID;
                applicantdata.homeownership = housingtype;

                //console.log(applicantdata.dateofbirth);
                var dateofbirth = getDateInFormat(applicantdata.dateofbirth,'-','ymd');

                $('#ncadDateofBirth').val("1990-02-02");

                applicantdata.age= client.CLT_AGE;
                applicantdata.highested = educ == null ? null : educ.desc;
                applicantdata.highestedothers= client.CLT_HIGH_EDU_OTHER;
                applicantdata.highestedothers="";
                applicantdata.tsunamiAffected= 'NO',
                applicantdata.quakeAffected= 'NO',
                applicantdata.haveSavings= 'NO',
                applicantdata.haveInsurance= 'NO',
                applicantdata.homeless= 'NO',

                $scope.applicantdata = applicantdata;
           
                return applicantdata;

            } else if (loan != null){

                if($scope.applicantdata == null){
                    $scope.applicantdata = {};
                }

                $scope.applicantdata.tsunamiAffected = (parseInt(loan.CLL_TSUNAMI_AFFECT) == 1 ) ? 'YES' : 'NO' ;
                $scope.applicantdata.quakeAffected = (parseInt(loan.CLL_QUAKE_AFFECT) == 1 ) ? 'YES' : 'NO' ;
                $scope.applicantdata.haveSavings = (parseInt(loan.CLL_SAVING_ACCOUNT_EXISTS) == 1 ) ? 'YES' : 'NO' ;
                $scope.applicantdata.haveInsurance = (parseInt(loan.CLL_INSURANCE_EXISTS) == 1 ) ? 'YES' : 'NO' ;


                //console.log($scope.applicantdata);

                refreshChkBox();

                if(isNew){
                    console.log($scope.updated);
                    if($scope.updated.applicantdata.newdata == null ){
                        $scope.updated.applicantdata.newdata = {};
                    }
                    $scope.updated.applicantdata.newdata.tsunamiAffected = $scope.applicantdata.tsunamiAffected;
                    $scope.updated.applicantdata.newdata.quakeAffected = $scope.applicantdata.quakeAffected;
                    $scope.updated.applicantdata.newdata.haveSavings = $scope.applicantdata.haveSavings;
                    $scope.updated.applicantdata.newdata.haveInsurance = $scope.applicantdata.haveInsurance;
                } else {
                    $scope.updated.applicantdata.olddata.tsunamiAffected = $scope.applicantdata.tsunamiAffected;
                    $scope.updated.applicantdata.olddata.quakeAffected = $scope.applicantdata.quakeAffected;
                    $scope.updated.applicantdata.olddata.haveSavings = $scope.applicantdata.haveSavings;
                    $scope.updated.applicantdata.olddata.haveInsurance = $scope.applicantdata.haveInsurance;
                }
                return $scope.applicantdata;
            }


        };

        $scope.checkApplicantData = function(){

            if($scope.updated.applicantdata.newdata == null) {

                return false;
            }

            if($scope.updated.applicantdata.olddata.fullname != $scope.updated.applicantdata.newdata.fullname ||
                $scope.updated.applicantdata.olddata.nickname != $scope.updated.applicantdata.newdata.nickname ||
                $scope.updated.applicantdata.olddata.gender != $scope.updated.applicantdata.newdata.gender ||
                $scope.updated.applicantdata.olddata.placeofbirth != $scope.updated.applicantdata.newdata.placeofbirth ||
                $scope.updated.applicantdata.olddata.dateofbirth != $scope.updated.applicantdata.newdata.dateofbirth ||
                $scope.updated.applicantdata.olddata.familycardno != $scope.updated.applicantdata.newdata.familycardno ||
                $scope.updated.applicantdata.olddata.clientno != $scope.updated.applicantdata.newdata.clientno ||
                $scope.updated.applicantdata.olddata.ktpno != $scope.updated.applicantdata.newdata.ktpno ||
                $scope.updated.applicantdata.olddata.age != $scope.updated.applicantdata.newdata.age ||
                $scope.updated.applicantdata.olddata.highested != $scope.updated.applicantdata.newdata.highested  ||
                $scope.updated.applicantdata.olddata.highestedothers != $scope.updated.applicantdata.newdata.highestedothers ||
                $scope.updated.applicantdata.olddata.tsunamiAffected != $scope.updated.applicantdata.newdata.tsunamiAffected ||
                $scope.updated.applicantdata.olddata.quakeAffected != $scope.updated.applicantdata.newdata.quakeAffected ||
                $scope.updated.applicantdata.olddata.haveSavings != $scope.updated.applicantdata.newdata.haveSavings ||
                $scope.updated.applicantdata.olddata.haveInsurance != $scope.updated.applicantdata.newdata.haveInsurance ||
                $scope.updated.applicantdata.olddata.homeless != $scope.updated.applicantdata.newdata.homeless ||
                $scope.updated.applicantdata.olddata.tsunamiAffected  != $scope.updated.applicantdata.newdata.tsunamiAffected ||
                $scope.updated.applicantdata.olddata.quakeAffected  != $scope.updated.applicantdata.newdata.quakeAffected ||
                $scope.updated.applicantdata.olddata.haveSavings  != $scope.updated.applicantdata.newdata.haveSavings ||
                $scope.updated.applicantdata.olddata.haveInsurance  != $scope.updated.applicantdata.newdata.haveInsurance){

                $('.ab-pageAppData.arrow_box').addClass('edited');

            }

        };

        $scope.getHusbandinfo = function(client,isNew){
            //console.log(client);
            var husbandinfo = {};

            husbandinfo.maritalstatus= client.CLT_MARITAL_STATUS;
            husbandinfo.husbandname= decodeURI(client.CLT_HB_NAME);
            husbandinfo.husbandidno= parseInt(client.CLT_HB_ID);
            husbandinfo.livesinhouse= client.CLT_HB_LIVE_IN_HOUSE == 'Y' ? 'YES' : 'NO';
            husbandinfo.whereis= client.CLT_HB_LIVE_PLACE;
            husbandinfo.howoften= client.CLT_HB_COME_HOUSE;

            $scope.husbandinfo = husbandinfo;

            if($scope.husbandinfo.livesinhouse === 'YES'){

                $('#ncadLivesInHouse').prop('checked',true);
                $("label[for='ncadLivesInHouse']").removeClass('ui-checkbox-off');
                $("label[for='ncadLivesInHouse']").addClass('ui-checkbox-on');
                $('#ncadLivesInHouse').find('span').addClass('checked');

            } else {
                $('#ncadLivesInHouse').prop('checked',false);
                $("label[for='ncadLivesInHouse']").addClass('ui-checkbox-off');
                $("label[for='ncadLivesInHouse']").removeClass('ui-checkbox-on');
                $('#ncadLivesInHouse').find('span').addClass('checked');
            } 
            
            return husbandinfo;
        };

        $scope.checkHusbandinfo = function(){

            if($scope.updated.husbandinfo.newdata == null) {

                return false;
            }

            if($scope.updated.husbandinfo.olddata.maritalstatus != $scope.updated.husbandinfo.newdata.maritalstatus ||
                ($scope.updated.husbandinfo.olddata.husbandname != $scope.updated.husbandinfo.newdata.husbandname && $scope.updated.husbandinfo.newdata.husbandname != 'null') ||
                $scope.updated.husbandinfo.olddata.husbandidno != $scope.updated.husbandinfo.newdata.husbandidno && !isNaN($scope.updated.husbandinfo.newdata.husbandidno)  ||
                $scope.updated.husbandinfo.olddata.livesinhouse != $scope.updated.husbandinfo.newdata.livesinhouse ||
                ($scope.updated.husbandinfo.olddata.whereis != $scope.updated.husbandinfo.newdata.whereis && $scope.updated.husbandinfo.newdata.whereis != 'null') ||
                $scope.updated.husbandinfo.olddata.howoften != $scope.updated.husbandinfo.newdata.howoften){

                 $('.ab-pageAppData2.arrow_box').addClass('edited');

            }

        };

        $scope.getHousemotherinfo = function(client,isNew){

            var housemotherinfo = {};

            housemotherinfo.noofmembers= client.CLT_NUM_HOUSE_MEM;
            housemotherinfo.noofchildren= client.CLT_NUM_CHILDREN;
            housemotherinfo.mothername= decodeURI(client.CLT_MOTHER_NM);
            housemotherinfo.motherdob = client.CLT_MOTHER_DOB;

            if(client.CLT_MOTHER_DOB != null && client.CLT_MOTHER_DOB  != ""){
                var dateofbirth = getDateInFormat(client.CLT_MOTHER_DOB,'-','ymd');
                $('#ncadMotherBirthdate').val(dateofbirth);
            }

            housemotherinfo.motherage= client.CLT_MOTHER_AGE;

            $scope.housemotherinfo = housemotherinfo;

            return housemotherinfo;

        };

        $scope.checkHousemotherinfo = function(){

            if($scope.updated.housemotherinfo.newdata == null){

                return false;
            }


            if($scope.updated.housemotherinfo.olddata.noofmembers != $scope.updated.housemotherinfo.newdata.noofmembers ||
                $scope.updated.housemotherinfo.olddata.noofchildren != $scope.updated.housemotherinfo.newdata.noofchildren ||
                $scope.updated.housemotherinfo.olddata.mothername != $scope.updated.housemotherinfo.newdata.mothername ||
                $scope.updated.housemotherinfo.olddata.motherdob != $scope.updated.housemotherinfo.newdata.motherdob  ||
                $scope.updated.housemotherinfo.olddata.motherage != $scope.updated.housemotherinfo.newdata.motherage ){

                $('.ab-pageAppData3.arrow_box').addClass('edited');
            }

        };

        $scope.getBusinessinfo = function(client,isNew){

            var businessinfo = {};

            businessinfo.typeofbusiness= decodeURI(client.CLT_BIZ);
            businessinfo.busequipment= decodeURI(client.CLT_BIZ_EQUIPT);
            businessinfo.jointbusiness= decodeURI(client.CLT_BOTH_BIZ);
            businessinfo.jbequipment= decodeURI(client.CLT_BOTH_BIZ_EQUIPT);
            businessinfo.husbandbusiness= decodeURI(client.CLT_HB_BIZ);
            businessinfo.hbequipment= decodeURI(client.CLT_HB_BIZ_EQUIPT);

            $scope.businessinfo = businessinfo;

            return businessinfo;
        };

        $scope.checkBusinessinfo = function(){

            if( $scope.updated.businessinfo.newdata == null){

                return false;
            }

            if($scope.updated.businessinfo.olddata.typeofbusiness != $scope.updated.businessinfo.newdata.typeofbusiness ||
                $scope.updated.businessinfo.olddata.busequipment != $scope.updated.businessinfo.newdata.busequipment ||
                $scope.updated.businessinfo.olddata.jointbusiness != $scope.updated.businessinfo.newdata.jointbusiness ||
                $scope.updated.businessinfo.olddata.jbequipment != $scope.updated.businessinfo.newdata.jbequipment ||
                $scope.updated.businessinfo.olddata.husbandbusiness != $scope.updated.businessinfo.newdata.husbandbusiness ||
                $scope.updated.businessinfo.olddata.hbequipment != $scope.updated.businessinfo.newdata.hbequipment){

                $('.ab-pageAppData4.arrow_box').addClass('edited');

            }


        };

        $scope.getAddress = function(client,isNew){

            var address = {};
            //console.log(client);
            var ville = $filter('filter')( $scope.selectCodes.VILL, { value: client.CLT_VILLAGE })[0];
            var center = $filter('filter')( $scope.selectCodes.CTR, { value: parseInt(client.CLT_CENTER_ID) })[0];
            //console.log($scope.selectCodes['CTR']);
            //console.log(client.CLT_CENTER_ID);
            //console.log(parseInt(client.CLT_CENTER_ID));
            address.village = {
                val: ville.value,
                name: client.VLM_NAME
            };

            address.centerid = parseInt(client.CLT_CENTER_ID);
            address.subdistrict= client.CLT_SUB_DISTRICT;
            address.district= client.CLT_DISTRICT;
            address.province= client.CLT_PROVINCE;
            address.postcode= client.CLT_POSTAL_CD;
            address.landmark= decodeURI(client.CLT_LAND_MARK);
            address.mobile1= client.CLT_MOB_NO_1;
            address.mobile2= client.CLT_MOB_NO_2;
            address.husbmobile= client.CLT_HUSB_MOB_NO;
            address.rt= decodeURI(client.CLT_RT);
            address.rw= decodeURI(client.CLT_RW);
            address.streetarea= decodeURI(client.CLT_STREET_AREA_NM);

            $scope.address = address;

            $scope.loadPerformance();

            return address;
        };

        $scope.checkAddress = function(){

            if($scope.updated.address.newdata == null){

                return false;
            }
            //console.log($scope.updated.address.olddata);
            //console.log($scope.updated.address.newdata)
            if($scope.updated.address.olddata.centerid != $scope.updated.address.newdata.centerid ||
                $scope.updated.address.olddata.subdistrict != $scope.updated.address.newdata.subdistrict ||
                $scope.updated.address.olddata.district != $scope.updated.address.newdata.district ||
                $scope.updated.address.olddata.province != $scope.updated.address.newdata.province ||
                $scope.updated.address.olddata.postcode != $scope.updated.address.newdata.postcode ||
                $scope.updated.address.olddata.landmark != $scope.updated.address.newdata.landmark ||
                $scope.updated.address.olddata.mobile1 != $scope.updated.address.newdata.mobile1 ||
                $scope.updated.address.olddata.mobile2 != $scope.updated.address.newdata.mobile2 ||
                $scope.updated.address.olddata.husbmobile != $scope.updated.address.newdata.husbmobile ||
                $scope.updated.address.olddata.rt != $scope.updated.address.newdata.rt ||
                $scope.updated.address.olddata.rw != $scope.updated.address.newdata.rw ||
                $scope.updated.address.olddata.streetarea != $scope.updated.address.newdata.streetarea){

                $('.ab-pageAddress.arrow_box').addClass('edited');

            }

        };

        $scope.getHouseinfo = function(loan,isnew){

            var houseinfo = {};
            houseinfo.housetype = loan.CLL_HOUSE_TYP;

            var housesize = null;
            var housecond = null;
            var houseroof = null;
            var houseflor = null;
            var housewall = null;
            var houseelec = null;
            var housewatr = null;

            if(loan.CLL_HOUSE_SIZE != null && loan.CLL_HOUSE_SIZE != "") housesize = loan.CLL_HOUSE_SIZE.toString();
            if(loan.CLL_HOUSE_CONDITION != null && loan.CLL_HOUSE_CONDITION != "") housecond = loan.CLL_HOUSE_CONDITION.toString();
            if(loan.CLL_ROOF_TYPE != null && loan.CLL_ROOF_TYPE != "") houseroof = loan.CLL_ROOF_TYPE.toString();
            if(loan.CLL_WALL_TYPE != null && loan.CLL_WALL_TYPE != "") housewall = loan.CLL_WALL_TYPE.toString();
            if(loan.CLL_FLOOR_TYP != null && loan.CLL_FLOOR_TYP != "") houseflor = loan.CLL_FLOOR_TYP.toString();

            $scope.choices = [housesize,housecond,houseroof,housewall,houseflor,houseelec,housewatr]; 
            houseinfo.choices = $scope.choices;  
            $scope.applicantdata.homeless = (loan.CLL_HOMELESS == 'Y') ? 'YES' : 'NO';

            $scope.$apply(function(){

                var choice0 = "";var choice1 = "";var choice2 = "";var choice3 = "";var choice4 = "";

                if(housesize != null) choice0 = getTheIndex($scope.houseindices[2],'HSE_VALUE',housesize);
                if(housecond != null) choice1 = getTheIndex($scope.houseindices[3],'HSE_VALUE',housecond);
                if(houseroof != null) choice2 = getTheIndex($scope.houseindices[4],'HSE_VALUE',houseroof);
                if(housewall != null) choice3 = getTheIndex($scope.houseindices[5],'HSE_VALUE',housewall);
                if(houseflor != null) choice4 = getTheIndex($scope.houseindices[6],'HSE_VALUE',houseflor);

                $('#ncHSSZ').val(choice0);
                $('#ncCOND').val(choice1);
                $('#ncROOF').val(choice2);
                $('#ncWALL').val(choice3);
                $('#ncFLOR').val(choice4);

                $('#ncHSSZ').selectmenu("refresh", true);
                $('#ncCOND').selectmenu("refresh", true);
                $('#ncROOF').selectmenu("refresh", true);
                $('#ncWALL').selectmenu("refresh", true);
                $('#ncFLOR').selectmenu("refresh", true);

            });



            $scope.houseinfo = houseinfo;
            if(isnew){
                $scope.updated.houseinfo.newdata = $scope.houseinfo;
            } else {
                $scope.updated.houseinfo.olddata = $scope.houseinfo;
            }
            return  houseinfo;

        };


        $scope.checkHouseinfo = function(){

            if($scope.updated.houseinfo.newdata == null || $scope.updated.houseinfo.newdata == ''){

                return false;
            }
            if($scope.updated.houseinfo.olddata.housetype != $scope.updated.houseinfo.newdata.housetype ||
                $scope.updated.houseinfo.olddata.choices[0] != $scope.updated.houseinfo.newdata.choices[0] ||
                $scope.updated.houseinfo.olddata.choices[1] != $scope.updated.houseinfo.newdata.choices[1] ||
                $scope.updated.houseinfo.olddata.choices[2] != $scope.updated.houseinfo.newdata.choices[2] ||
                $scope.updated.houseinfo.olddata.choices[3] != $scope.updated.houseinfo.newdata.choices[3] ||
                $scope.updated.houseinfo.olddata.choices[4] != $scope.updated.houseinfo.newdata.choices[4] ||
                $scope.updated.houseinfo.olddata.choices[5] != $scope.updated.houseinfo.newdata.choices[5] ||
                $scope.updated.houseinfo.olddata.choices[6] != $scope.updated.houseinfo.newdata.choices[6]){
                $('.ab-pageHousingIndex.arrow_box').addClass('edited');
            }
        };

        $scope.getWorkcap = function(loan,isnew){

            var workcap = {};
            workcap.app= loan.CLL_WORKING_CAPITAL;
            workcap.husband= loan.CLL_HB_WORKING_CAPITAL;

            $scope.workcap = workcap;

            if(isnew){
                $scope.updated.workcap.newdata =  $scope.workcap;
            } else {
                $scope.updated.workcap.olddata =  $scope.workcap;
            }


            return  workcap;

        };

        $scope.checkWorkcap = function(){

            if($scope.updated.workcap.newdata == null || $scope.updated.workcap.newdata == ''){

                return false;
            }

            if($scope.updated.workcap.olddata.app != $scope.updated.workcap.newdata.app ||
                $scope.updated.workcap.olddata.husband != $scope.updated.workcap.newdata.husband){

                $('.ab-pageWorkingCapital.arrow_box').addClass('edited');

            }
        };

        $scope.getFamilymembers = function(members,isnew){
            if(members.length > 0){
                $scope.family = [];
                $.each(members,function(i,member){
                    console.log(member);

                    var work = $filter('filter')($scope.joblist, { value: member.CFL_WORK })[0];
                    if ( work == undefined ) work = null;
                    console.log(work)

                    var ind = parseInt(i) + 1;
                    var key = {
                            index: ind,
                            name: member.CFL_NAME,
                            birthdate: member.CFL_DOB,
                            work: work == undefined ? null : work.value,
                            birthplace: member.CFL_PLACE_OF_BIRTH,
                            famcode: member.CFL_FAMILY_CODE,
                            gender: member.CFL_GENDER,
                            educode: member.CFL_EDU_CODE,
                            maritalstatus: member.CFL_MARITAL_STATUS,
                            isschooling: member.CFL_STILL_IN_SCHOOL
                        };

                    $scope.family.push(key);
                });

                if(isnew){
                    $scope.updated.family.newdata = $scope.family;
                } else {
                    $scope.updated.family.olddata = $scope.family;
                }
            }
        };

        $scope.checkFamily = function(){

            if($scope.updated.family.newdata == null || $scope.updated.family.newdata == ''){
                return false;
            } else {
                $('.ab-pageAppData3.arrow_box').addClass('edited');
            }

        };

        $scope.getUnproassets = function(assets,isnew){

            if(assets.length > 0){
                $scope.unproassets = [];
                $.each(assets, function(i,asset){

                    var ind = parseInt(i) + 1;

                    var key = { index: ind, asset: asset.CAL_ASSET_NAME, value: asset.CAL_ASSET_VALUE, isNew: false };
                    $scope.unproassets.push(key);
                });
                //console.log($scope.unproassets);
                if(isnew){
                    $scope.updated.unproassets.newdata = $scope.unproassets;
                } else {
                    $scope.updated.unproassets.olddata = $scope.unproassets;
                }
            }

        };

        $scope.checkUnproassets = function(){

            if($scope.updated.unproassets.newdata == null || $scope.updated.unproassets.newdata == ''){
                return false;
            } else {
                $('.ab-pageWelfareStatus.arrow_box').addClass('edited');
            }

        };

        $scope.getHouseIncomes = function(incomes,isnew){

            $scope.houseIncomes = [];
            $.each(incomes, function(i,income){
                var client_income = {
                    capitalby:income.CLI_CAPITAL_BY,
                    activity:income.CLI_OCCUP_ACTIVITY,
                    location:income.CLI_WORK_LOCATION,
                    owncapita:income.CLI_OWN_WORK_CAPITAL,
                    revpermth:income.CLI_WAGE_MTH,
                    exppermth:income.CLI_EXPENSE_MTH,
                    profpermth:income.CLI_PROFIT_MTH,
                    totalinmth:income.CLI_NET_REVENUE_MTH,
                };
                $scope.houseIncomes.push(client_income);
            });
            //console.log($scope.houseIncomes);
            if(isnew){
                $scope.updated.houseIncomes.isUpdated = true;
                $scope.updated.houseIncomes.newdata = $scope.houseIncomes;
            } else {
                $scope.updated.houseIncomes.olddata = $scope.houseIncomes;
            }
        };

        $scope.checkHouseIncomes = function(){

            if($scope.updated.houseIncomes.newdata == null || $scope.updated.houseIncomes.newdata == ''){
                return false;
            }  else {
                $('.ab-pageHouseIncomeEst.arrow_box').addClass('edited');
            }

        };

        $scope.getSignature = function(client,isnew){

            var signature = {
                SIG: client.CLT_SIGNATURE
            };

            $scope.blob = client.CLT_SIGNATURE;

            if(isnew){
                $scope.updated.signature.newdata = signature;
            } else {
                $scope.updated.signature.olddata = signature;
            }

            return signature;

        };

        $scope.checkSignature = function(){

            //console.log($scope.updated.signature);

            if($scope.updated.signature.newdata == null) return false;

            if($scope.updated.signature.newdata.SIG == null || $scope.updated.signature.newdata.SIG == ''){
                return false;
            }  else {
                $('.ab-pageSignature.arrow_box').addClass('edited');
            }

        };

        $scope.getClientGroup = function(client,isnew){

            var groupid = client.CLT_GROUP_ID;
            var centerid = client.CLT_CTR_PK;

            var groups  = $filter('filter')($scope.allGroups, { CLG_CTR_PK: centerid });
            var group  = $filter('filter')(groups, { CLG_ID: parseInt(groupid) })[0];

            $scope.group = {
                centerpk: centerid,
                groupid: groupid,
                isGroupLeader: client.CLT_IS_GROUP_LEADER
            };

            if(isnew){
                if($scope.updated.group.olddata.CLG_ID != group.CLG_ID){

                    $scope.updated.group.newdata = group;
                }
            } else {
                $scope.updated.group.olddata = group;
            }

            $scope.oldgroup = $scope.group;

            return group;

        };

        $scope.checkGroup = function(){

            if($scope.updated.group.newdata == null || $scope.updated.group.newdata == ''){
                return false;
            }  else {
                if(parseInt($scope.updated.group.olddata.CLG_ID) != parseInt($scope.updated.group.newdata.CLG_ID) ){
                    $('.ab-pageGroup.arrow_box').addClass('edited');
                } else {
                    return false;
                }
            }

        };

        $scope.productDetails = function(code){
            if($scope.updated.applicantdata.olddata == null) return 0;
            if($scope.updated.applicantdata.olddata.products == null) return 0;
            var balance = 0;
            $.each($scope.updated.applicantdata.olddata.products,function(p,prd){
                //console.log(prd);
                if(prd.PRM_CODE == code){
                    balance = prd.CPM_PRM_BALANCE;
                }
            });
            return balance;
        };

        $scope.totalProductBalance = function(){
            if($scope.updated.applicantdata.olddata == null) return 0;
            if($scope.updated.applicantdata.olddata.products == null) return 0;
            var balance = 0;
            $.each($scope.updated.applicantdata.olddata.products,function(p,prd){
               balance += parseFloat(prd.CPM_PRM_BALANCE);
            });
            return balance;
        };

        $scope.showProductMapping = function(){

            var CS = $scope.CLT_STATUS;
            if(CS==61||CS==25||CS==27||CS==40||CS==1|| (CS <9&&CS!=7) ){
                return false;
            }

            return true;

        };

        $scope.magic = function(clientold,clientnew){

            var client = clientold;
            if(clientnew != null && clientnew != '') client = clientnew;

            var clientPK = client.CLT_PK;

            $scope.CLT_STATUS = client.CLT_STATUS;

            $scope.CLT_GROUP_ID = client.CLT_GROUP_ID;
            $scope.CLT_FULL_NAME = client.CLT_FULL_NAME;
            $scope.tmp_client = client;

            $scope.applicantdata.photo='data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';



            $scope.$apply(function(){

                //#####################################################
                // organising old and new data
                //#####################################################
                $scope.updated.applicantdata.olddata = $scope.getApplicantData(clientold,false);
                $scope.updated.husbandinfo.olddata = $scope.getHusbandinfo(clientold,false);
                $scope.updated.housemotherinfo.olddata = $scope.getHousemotherinfo(clientold,false);
                $scope.updated.businessinfo.olddata = $scope.getBusinessinfo(clientold,false);
                $scope.updated.address.olddata = $scope.getAddress(clientold,false);
                $scope.updated.signature.olddata = $scope.getSignature(clientold,false);
                $scope.updated.group.olddata = $scope.getClientGroup(clientold,false);
                if(clientnew != '' && clientnew != null){
                    //console.log(clientnew);
                    $scope.updated.applicantdata.newdata = $scope.getApplicantData(clientnew,true);
                    $scope.updated.husbandinfo.newdata = $scope.getHusbandinfo(clientnew,true);
                    $scope.updated.housemotherinfo.newdata = $scope.getHousemotherinfo(clientnew,true);
                    $scope.updated.businessinfo.newdata = $scope.getBusinessinfo(clientnew,true);
                    $scope.updated.address.newdata = $scope.getAddress(clientnew,true);
                    $scope.updated.signature.newdata = $scope.getSignature(clientnew,true);
                    $scope.updated.group.newdata = $scope.getClientGroup(clientnew,true);
                }

                $scope.checkApplicantData(); // CHECKING IF APPLICANTDATA IS EDITED
                $scope.checkHusbandinfo(); // CHECKING IF HUSBANDINFO IS EDITED
                $scope.checkHousemotherinfo(); // CHECKING IF HOUSEMOTHERINFO IS EDITED
                $scope.checkBusinessinfo(); // CHECKING IF BUISNESSINFO IS EDITED
                $scope.checkAddress(); // CHECKING IF ADDRESS IS EDITED
                $scope.checkSignature(); // CHECKING IF SIGNATURE IS EDITED
                $scope.checkGroup(); // CHECKING IF GROUP IS EDITED


                setTimeout(function(){
                    $scope.loadGroups();
                    refreshChkBox();
                },100);

            });

            setTimeout(function(){

                refreshall('#ncadGender');
                refreshall('#ncadHighestEducation');
                refreshall('#ncadMaritalStatus');
                refreshall('#ncadGenncadHowOftenHusbandder');
                refreshall('#adcenter');
            },1000);

            //if($scope.husbandinfo.livesinhouse == 'YES') $('#ncadLivesInHouse').click();

            myDB.execute("SELECT * FROM T_CLIENT_LOAN WHERE CLL_CLT_PK = "+clientPK+" ORDER BY CLL_PK DESC LIMIT 1", function(results){
                //console.log(results);
                if(results.length == 0) return false;

                var loan = results[0];

                $scope.welfareStatus= loan.CLL_WELFARE_STATUS;
                $scope.getWorkcap(loan,false);
                $scope.getHouseinfo(loan,false);
                $scope.getApplicantData(null,false,loan);


                if($scope.welfareStatus == "W"){
                    $('#welfareRadio2').click();
                } else if ($scope.welfareStatus == "W2"){
                    $('#welfareRadio3').click();
                } else {
                    $('#welfareRadio1').click();
                }

                myDB.execute("SELECT * FROM T_CLIENT_LOAN_NEW WHERE CLL_CLT_PK = "+clientPK+" ORDER BY CLL_PK DESC LIMIT 1", function(resultsl){
                    if(resultsl.length == 0) {
                        $scope.checkHouseinfo(); // CHECKING IF HOUSING IS EDITED
                    } else {
                        var newloan = resultsl[0];

                        $scope.welfareStatus= newloan.CLL_WELFARE_STATUS;
                        $scope.getWorkcap(newloan,true);
                        $scope.getHouseinfo(newloan,true);
                        $scope.getApplicantData(null,true,newloan);

                        $scope.checkHouseinfo(); // CHECKING IF HOUSING IS EDITED
                        $scope.checkWorkcap();

                        if($scope.welfareStatus == "W"){
                            $('#welfareRadio2').click();
                        } else if ($scope.welfareStatus == "W2"){
                            $('#welfareRadio3').click();
                        } else {
                            $('#welfareRadio1').click();
                        }

                    }
                    $scope.$apply();
                });


            });
            $scope.updated.applicantdata.olddata.products = [];
            myDB.execute("SELECT * FROM T_CLIENT_PRODUCT_MAPPING, T_PRODUCT_MASTER WHERE CPM_PRM_PK = PRM_PK AND CPM_CLT_PK ="+clientPK,function(results){
                if(results.length == 0){

                } else {
                    $.each(results,function(i,res){
                        var key = {
                            PRM_CODE: res.PRM_CODE,
                            CPM_PRM_PK: res.CPM_PRM_PK,
                            CPM_PRM_BALANCE: res.CPM_PRM_BALANCE
                        };
                        $scope.updated.applicantdata.olddata.products.push(res);
                    });
                    $.each($scope.loans,function(l,loan){
                        $.each(loan.products,function(i,val){
                            $.each($scope.updated.applicantdata.olddata.products,function(p,prd){
                                //console.log("loansav");
                                //console.log(prd);
                                if(prd.PRM_CODE == val.PRM_CODE){
                                    val.selectedMaturityOption  = prd.CPM_PRM_MATURITY;
                                }
                            });
                        });
                    });
                }
            });
            //#####################################################
            // CLIENT ASSET
            //#####################################################
            $scope.unproassets = [];
            var key = { index: 0, asset: '', value: 0, isNew: false };
            $scope.unproassets.push(key);

            var assetFromClient = function(){
                var promise = new $.Deferred(); 
                myDB.execute("SELECT * FROM T_CLIENT_ASSET_LIST WHERE CAL_CLT_PK ="+clientPK+" ORDER BY CAL_PK DESC", function(results){
                    promise.resolve(results);
                });
                return promise;
            }

            var assetFromNew = function(){
                var promise2 = new $.Deferred(); 
                myDB.execute("SELECT * FROM T_CLIENT_ASSET_LIST_NEW WHERE CAL_CLT_PK ="+clientPK+" ORDER BY CAL_PK DESC", function(newresults){
                    promise2.resolve(newresults);  
                });
                return promise2;
            }
            
            var assetFromReview = function(){
                var promise3 = new $.Deferred(); 
                myDB.execute("SELECT CEAL_ASSET_NAME as CAL_ASSET_NAME, CEAL_ASSET_VALUE as CAL_ASSET_VALUE FROM T_CLIENT_EVAL_ASSET_LIST  WHERE CEAL_CLT_PK ="+clientPK+" ORDER BY CEAL_PK DESC", function(eresults){
                    promise3.resolve(eresults);  
                });
                return promise3;
            } 

            $.when(assetFromClient(),assetFromNew(),assetFromReview()).done(function(results,newresults,eresults){
                // console.log("asset loaded");
                // console.log(eresults);
                // console.log(newresults);
                // console.log(results);
                if(eresults.length > 0){
                    $scope.getUnproassets(eresults,false);
                } else {
                    $scope.getUnproassets(results,false);
                } 
                $scope.getUnproassets(newresults,true); 
                $scope.checkUnproassets(); //CHECKING IF UNPROASSETS IS EDITED
                setTimeout(function(){
                    $scope.$apply(function(){
                        //console.log($scope.unproassets);
                        $scope.unproassets;
                    });
                }, 1000);
 
            })
 
            //#####################################################
            // CLIENT FAMILY
            //#####################################################

            myDB.execute("SELECT * FROM T_CLIENT_FAMILY_LIST WHERE CFL_CLT_PK ="+clientPK+" ORDER BY CFL_PK DESC", function(results){

                $scope.getFamilymembers(results,false);

                myDB.execute("SELECT * FROM T_CLIENT_FAMILY_LIST_NEW WHERE CFL_CLT_PK ="+clientPK+" ORDER BY CFL_PK DESC", function(newresults){

                    // $scope.getUnproassets(newresults,true);

                    $scope.getFamilymembers(newresults,true);


                    $scope.checkFamily(); //CHECKING IF FAMILY IS EDITED

                });

                setTimeout(function(){
                    $scope.$apply(function(){
                        $scope.family;
                        refreshall('.famedu');
                        refreshall('.famgender');
                        refreshall('.famcode');
                        refreshall('.workcode');
                        refreshall('.famsch');
                        refreshall('.famMS');
                    });
                }, 1000);

            });
            //#####################################################
            // CLIENT INCOME
            //#####################################################

            myDB.execute("SELECT * FROM T_CODE WHERE CODE_TYPE_PK=20",function(res){
                //console.log(res);
                $scope.houseIncomes = [];
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
            });
  

            
            myDB.execute("SELECT * FROM T_CLIENT_BORROWED_FUNDS_NEW WHERE CEF_CLT_PK="+clientPK,function(newres){
                if(newres.length == 0){
                    myDB.execute("SELECT EEF_CLT_PK as CEF_CLT_PK, EEF_BALANCE_AMT as CEF_BALANCE_AMT, EEF_LOAN_FROM as CEF_LOAN_FROM, EEF_LOAN_FROM_NAME as CEF_LOAN_FROM_NAME, EEF_ORGINAL_AMT as CEF_ORGINAL_AMT, EEF_REPAY_PER_MONTH as CEF_REPAY_PER_MONTH, EEF_REPAY_PER_WEEK as CEF_REPAY_PER_WEEK, EEF_LOAN_PAID_OFF as CEF_LOAN_PAID_OFF  FROM T_CLIENT_EVAL_BORROWED_FUNDS WHERE EEF_CLT_PK="+clientPK,function(eres){
                        if(eres.length == 0){
                            myDB.execute("SELECT * FROM T_CLIENT_BORROWED_FUNDS WHERE CEF_CLT_PK="+clientPK,function(res){
                                $scope.setBorrowedFunds(res);
                            });  
                        } else {
                            $scope.setBorrowedFunds(eres);
                        }
                    });  
                } else {
                    $scope.setBorrowedFunds(newres);
                }
            });  
            
            myDB.execute("SELECT * FROM T_CLIENT_INCOME_NEW, T_CODE WHERE CODE_NAME = CLI_SOURCE AND CODE_TYPE_Pk = 20 AND CLI_CLT_PK ="+clientPK+" GROUP BY CLI_SOURCE ORDER BY CLI_PK ",function(newresults){
                //console.log(newresults);
                if(newresults.length == 0){
                    myDB.execute("SELECT CEB_SOURCE_DETAIL as CLI_SOURCE_DETAIL, CEB_SOURCE as CLI_SOURCE, CEB_FIX as  CLI_FIXED, CEB_VARIABLE as CLI_VARIABLE, CODE_DESC FROM T_CLIENT_EVALUATION_BIZ , T_CLIENT_LOAN, T_CODE WHERE CODE_NAME = CEB_SOURCE AND CODE_TYPE_Pk = 20 AND CEB_CLL_PK = CLL_PK AND  CLL_CLT_PK ="+clientPK+" GROUP BY CEB_SOURCE ORDER BY CEB_PK ",function(eresults){
                        if(eresults.length == 0){

                            myDB.execute("SELECT * FROM T_CLIENT_INCOME, T_CLIENT_LOAN, T_CODE WHERE CODE_NAME = CLI_SOURCE AND CODE_TYPE_Pk = 20 AND CLI_CLL_PK = CLL_PK AND  CLL_CLT_PK ="+clientPK+" GROUP BY CLI_SOURCE ORDER BY CLI_PK ",function(results){
                                if(results.length == 0) return false;

                                $scope.setHouseIncome(results,false);

                            });
                        } else {

                            $scope.setHouseIncome(eresults,false);

                        } 
                    });
                } else { 

                    $scope.setHouseIncome(newresults,true);  
                    $scope.checkHouseIncomes();
                } 
            });
        };

        $scope.setBorrowedFunds = function(res){
            $.each(res,function(b,bor){
                var borfun = {
                    applicant:null,
                    balance:null,
                    loanfrom:null,
                    loanfromname:null,
                    originalamt:null,
                    repaymentpermth:null,
                    repaymentperwk:null
                };

                borfun.applicant = bor.CEF_CLT_PK;
                borfun.balance = bor.CEF_BALANCE_AMT;
                borfun.loanfrom = bor.CEF_LOAN_FROM;
                borfun.loanfromname = bor.CEF_LOAN_FROM_NAME;
                borfun.originalamt = bor.CEF_ORGINAL_AMT;
                borfun.repaymentpermth = bor.CEF_REPAY_PER_MONTH;
                borfun.repaymentperwk = bor.CEF_REPAY_PER_WEEK;
                borfun.loanpaidoff = bor.CEF_LOAN_PAID_OFF;

                $scope.borrowedFunds.push(borfun);
            });
        }


        $scope.setHouseIncome = function(results,isnew){

            $scope.houseIncomes = [];
            $.each(results, function(i,inc){

                var detaildesc = inc.CLI_SOURCE_DETAIL;
                var inc_detail = "";
                var inc_desc    = "";
                if(detaildesc != "null"){
                    inc_detail = detaildesc.substr(0,detaildesc.indexOf(' '));
                    inc_desc = detaildesc.substr(detaildesc.indexOf(' ')+1);
                }

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
         
            if(isnew){
                $scope.updated.houseIncomes.newdata = $scope.houseIncomes;
            }

            $scope.$apply(function(){
                $scope.houseIncomes;
            });
        }

        /******************************************
        - Camera
        ******************************************/
        $scope.takePhoto = function(){
            if(!devtest){
                navigator.camera.getPicture($scope.onSuccess, $scope.onFail, {
                    quality: 50,
                    targetWidth: 400,
                    targetHeight: 514,
                    correctOrientation: true,
                    //destinationType: Camera.DestinationType.FILE_URI
                    destinationType: Camera.DestinationType.DATA_URL
                });
            }else{
                var imageData='data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
                $scope.applicantdata.photo = imageData;
                $("#ncadPhoto").src = imageData;
            }
        };

        $scope.removePhoto = function(){
            var image = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
            $scope.applicantdata.photo = image;
            $("#ncadPhoto").src = image;
        };

        $scope.onSuccess = function (imageData) {
            $scope.$apply(function() {
                $scope.applicantdata.photo = "data:image/jpg;base64," + imageData;
                $("#ncadPhoto").src = "data:image/jpeg;base64," + imageData;
            });
        };

        //$scope.onFail = function (message) {alert('Failed because: ' + message);}
        $scope.onFail = function (message) {
            //alert(i18n.t("messages.PhotoTakeFail") + message);
            swal({
                title: i18n.t("messages.Alert"),
                text: i18n.t("messages.PhotoTakeFail") + message,
                type: "error",
                confirmButtonColor: "#80C6C7",
                confirmButtonText: "Ok",
            });
        };

        $scope.addFund = function(){

            //console.log($scope.fundEntry);
            if(!checkFunds($scope.fundEntry)) return false;
            var date = new Date($scope.fundEntry.laonpaidoff);
            $scope.fundEntry.loanpaidoff = (date.getMonth() + 1) + '/' + date.getDate() + '/' +  date.getFullYear();
            $scope.borrowedFunds.push($scope.fundEntry);
            console.log($scope.borrowedFunds);
            var lf = $scope.fundEntry.loanfrom,
                app = $scope.fundEntry.applicant;
            $scope.fundEntry = {};
            $scope.fundEntry.loanfrom = lf;
            $scope.fundEntry.applicant = app;
        };

        $scope.selectFund = function(newinfo){
            if($scope.selectedfund!=-1&&$scope.selectedfund!=newinfo){
                if(!checkFunds($scope.borrowedFunds[$scope.selectedfund])) return false;
            }
            $scope.selectedfund=newinfo;
        };


        /******************************************
        - Product Mapping
        ******************************************/

        $scope.products = [];
        $scope.loantypes = [];
        $scope.loanpurpose = [];
        ////console.log("mato "+$scope.produts.maturityObjects);
        $scope.selectOption = function(idx, obj){

            $('.newprodmat').each(function(i, element) {
                var selected = $(this).find('option:selected').text();
                if(selected != null && selected != ''){
                    $(this).parent().find('span').html(selected);
                }

            });
        };

        $scope.getIncome = function(type){
            
            var total = 0;
            $.each($scope.houseIncomes,function(i,income){
                 
                if (income.source == type){
                    if(income.inctype == 'NEGATIVE'){
                        total -= (parseFloat(income.fixed) + parseFloat(income.variable));
                    } else {
                        total += (parseFloat(income.fixed) + parseFloat(income.variable));
                    }
                    
                }  
            }); 
            return total;
        };

        $scope.totalHouseholdIncome = function(){
            var total = 0;

            $.each($scope.houseIncomes,function(i,income){
                 
                if (
                    income.source == 'HUSBAND' ||
                    income.source == 'WIFE' ||
                    income.source == 'OTHER INCOME'  ){
                    total += (parseFloat(income.fixed) + parseFloat(income.variable));
                    
                }  
            }); 

            return total;
        };

        $scope.totalHouseholdExpenses = function(){
            var total = 0;
            $.each($scope.houseIncomes,function(i,income){
                 
                if (
                    income.source == 'HOUSEHOLD COST' ||
                    income.source == 'EDUCATION COST' ||
                    income.source == 'OTHER COSTS'  ){
                    total += (parseFloat(income.fixed) + parseFloat(income.variable));
                    
                }  
            }); 


            total -= $scope.getTotalLoanedAmountFromOtherInst();
            total -= $scope.getTotalLoanedAmountFromKomida();

            return total;
        };

        $scope.getNetIncome = function(){
            return parseFloat($scope.totalHouseholdIncome()) + parseFloat($scope.totalHouseholdExpenses());
        }; 

        $scope.abilityToPay = function(){
            var netIncome = $scope.getNetIncome();
            if(netIncome == 0) return 0;
            return parseFloat(netIncome) / 100 * 30;
        };

        $scope.getTotalLoanedAmountFromKomida = function(){
            var total = 0;

            total = $scope.repaymentPerMonth;

            return total;
        };

        $scope.getTotalLoanedAmountFromOtherInst = function(){
            var total = 0;
            //console.log("borrowed "+$scope.borrowedFunds.length);
            $.each($scope.borrowedFunds,function(b,borrowed){
                total += (parseFloat(borrowed.repaymentperwk) * 4);
            });

            return total;
        };

        $scope.isSelected = function(loan){

            var show = false;

            //console.log(loan.isSelected);
            //console.log(loan.existingloan);

            if(loan.isSelected) show = true;
            if(loan.existingloan) show = true;

            return show;
        };

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
        };
        $scope.loadLoanPurpose();

        $scope.isSelectedFund = function(newinfo){
            return newinfo===$scope.selectedfund;
        };

        $scope.deleteFund = function(newinfo){
            $scope.borrowedFunds.splice(newinfo,1);
            $scope.selectedfund = -1;
        };

        $scope.getBFLoanFrom = function(from){
            if(from=='B') return "Bank";
            else if(from=='I') return "Institution";
            else if(from=='M') return "MoneyLender";
            else if(from=='C') return "Cooperative";

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

        $scope.ttl_installment = 0;
        $scope.ttl_group_installment = 0;
        $scope.ttl_center_installment = 0;

        $scope.loadPerformance = function(){
            myDB.execute("select CLT_GROUP_ID, T_CLIENT_REPAY_SCHEDULE.*, PRM_CODE from T_CLIENT_REPAY_SCHEDULE LEFT JOIN T_PRODUCT_MASTER ON (CRS_PRM_LTY_PK = PRM_PK) LEFT JOIN T_CLIENT ON(CLT_PK = CRS_CLT_PK) WHERE CRS_FLAG = 'C' AND CAST(CLT_CENTER_ID AS INTEGER)="+$scope.address.centerid,function(res){
                //console.log(res);
                //console.log("ewaaa");

                var rttlattenance = 0;
                var attendance = 0;
                var group_ttl_attendance = 0;
                var group_attendance = 0;
                var center_ttl_attendance = 0;
                var center_attendance = 0;

                var ttlInstallment = 0;
                var installment = 0;
                var group_ttl_installment = 0;
                var group_installment = 0;
                var center_ttl_installment = 0;
                var center_installment = 0;

                $.each(res,function(i,repay){
                    ////console.log("test "+repay.PRM_CODE+" "+repay.CRS_ATTENDED+" "+repay.CRS_LOAN_SAVING_FLAG);
                    ////console.log(moment().format('MM/DD/YYYY'));

                    var ndate = repay.CRS_DATE.split('/');

                    var day = ndate[0];
                    var month = ndate[1];
                    var year = ndate[2];

                    var newdate = ("0"+month).slice(-2) +"/"+ ("0"+day).slice(-2) +"/"+ year;

                    var crs_date = new Date(newdate);
                    var now_date = new Date();

                    ////console.log(newdate+" alldate "+crs_date);

                    if(crs_date.getTime() <= now_date.getTime()){

                        //console.log("date "+crs_date+" now "+now_date);

                        //console.log(repay.CRS_PK+" calc "+repay.CRS_LOAN_SAVING_FLAG+ " "+repay.PRM_CODE+ " A "+repay.CRS_ATTENDED);

                        if(repay.CRS_CLT_PK == $scope.clientPK){

                            if(repay.CRS_LOAN_SAVING_FLAG == 'L'){
                                rttlattenance += 1;
                            }
                            if(repay.CRS_LOAN_SAVING_FLAG == 'L'  && repay.CRS_ATTENDED == 'Y'){
                                attendance += 1;
                            }

                            if(repay.CRS_LOAN_SAVING_FLAG == 'L'){
                                ttlInstallment += (parseFloat(repay.CRS_EXP_CAPITAL_AMT) + parseFloat(repay.CRS_EXP_PROFIT_AMT));
                                installment += (parseFloat(repay.CRS_ACT_CAPITAL_AMT) + parseFloat(repay.CRS_ACT_PROFIT_AMT));
                            }
                        }

                        if(repay.CLT_GROUP_ID == $scope.CLT_GROUP_ID){

                            if(repay.CRS_LOAN_SAVING_FLAG == 'L'){
                                group_ttl_attendance += 1;
                            }
                            if(repay.CRS_LOAN_SAVING_FLAG == 'L'  && repay.CRS_ATTENDED == 'Y'){
                                group_attendance += 1;
                            }
                            if(repay.CRS_LOAN_SAVING_FLAG == 'L'){
                                group_ttl_installment += (parseFloat(repay.CRS_EXP_CAPITAL_AMT) + parseFloat(repay.CRS_EXP_PROFIT_AMT));
                                group_installment += (parseFloat(repay.CRS_ACT_CAPITAL_AMT) + parseFloat(repay.CRS_ACT_PROFIT_AMT));
                            }
                        }

                        if(repay.CRS_LOAN_SAVING_FLAG == 'L'){
                            center_ttl_attendance += 1;
                        }
                        if(repay.CRS_LOAN_SAVING_FLAG == 'L' && repay.CRS_ATTENDED == 'Y'){
                            center_attendance += 1;
                        }

                        if(repay.CRS_LOAN_SAVING_FLAG == 'L'){
                            center_ttl_installment += (parseFloat(repay.CRS_EXP_CAPITAL_AMT) + parseFloat(repay.CRS_EXP_PROFIT_AMT));
                            center_installment += (parseFloat(repay.CRS_ACT_CAPITAL_AMT) + parseFloat(repay.CRS_ACT_PROFIT_AMT));
                        }

                    }


                });

                //Client
                if(rttlattenance > 0){
                    $scope.attendanceWeeks =  parseInt(attendance);
                    $scope.attendance =  (parseFloat(attendance) / parseFloat(rttlattenance) * 100).toFixed(0);
                    setTimeout(function(){$('#attendance > .innerwrap').css('width',$scope.attendance +"%");},1);
                }
                if(ttlInstallment > 0) {
                    $scope.installmentAmt = parseInt(installment);
                    $scope.installment = parseFloat(parseFloat(installment) / parseFloat(ttlInstallment) * 100).toFixed(0);
                    setTimeout(function(){$('#installment > .innerwrap').css('width',$scope.installment +"%");},100);
                }

                // if(ttlInstallment == 0) $scope.installment = 0;
                // else


                //Group
                if(group_ttl_attendance > 0){
                    $scope.group_attendance =  (group_attendance / group_ttl_attendance * 100).toFixed(0);
                    setTimeout(function(){$('#group_attendance > .innerwrap').css('width',$scope.group_attendance +"%");},200);
                }

                if(group_ttl_installment > 0 ){
                    $scope.group_installment = (group_installment / group_ttl_installment * 100).toFixed(0);
                    setTimeout(function(){$('#group_installment > .innerwrap').css('width',$scope.group_installment +"%");},300);
                }
                // if(group_ttl_installment == 0) $scope.group_installment = 0;
                // else


                //Center
                if(center_ttl_attendance > 0 ){
                    $scope.center_attendance =  (center_attendance / center_ttl_attendance * 100).toFixed(0);
                    setTimeout(function(){$('#center_attendance > .innerwrap').css('width',$scope.center_attendance +"%");},400);
                }


                if(center_installment > 0 ){
                    $scope.center_installment = (center_installment / center_ttl_installment * 100).toFixed(0);
                    setTimeout(function(){$('#center_installment > .innerwrap').css('width',$scope.center_installment +"%");},500);
                }
                // if(center_ttl_installment == 0) $scope.center_installment = 0;
                // else

                $scope.$apply();
            });

        };


        /******************************************
        - House Income
        ******************************************/

        $scope.houseIncomes = [];
        $scope.memberTypes = [];
        $scope.homeOwnershipType = [];
        $scope.joblist = [];
        $scope.incomeEntry = {
            capitalby:null,
            activity:null,
            location:null,
            owncapita:null,
            revpermth:null,
            exppermth:null,
            profpermth:null,
            totalinmth:null,
            //netrev:null,
        };

        $scope.showSelect = function(income){


            if(income.source=='HUSBAND' && !$scope.showHusband()){
                return false;
            }

            return true;

        };

        $scope.getTotalIncome = function(){
            var sum = 0;
            $.each($scope.houseIncomes,function(i,inc){
                  if(inc.inctype != 'NEGATIVE'){
                        sum += parseInt(inc.fixed) + parseInt(inc.variable);
                  } 
            });

            return sum;
        };

        $scope.getTotalNetIncome = function(){
            var sum = 0;
            $.each($scope.houseIncomes,function(i,inc){
                if(inc.inctype == 'NEGATIVE'){
                    sum -= (parseInt(inc.fixed) + parseInt(inc.variable));
                } else {
                    sum += parseInt(inc.fixed) + parseInt(inc.variable);
                }
                
            });
            // console.log($scope.applicantdata.highested)
            // console.log("sum is "+sum);

            return sum;
        };

        $scope.getSumofIncomes= function(fixed,variable){
            if(isNaN(fixed))fixed = 0;
            if(isNaN(variable))variable = 0; 
            return parseFloat(fixed) + parseFloat(variable);
        }

        $scope.rerender = function(time){

            if(time == null || time == undefined) time = 1;

            var rum = $scope.houseIncomes;
            $scope.houseIncomes = [];
            setTimeout(function(){

            },time);

            $timeout(function () {
                $scope.$apply(function(){
                    $scope.houseIncomes = rum;
                });
                refreshall('.incomedetails');
            },time);
        };

        $scope.selectedEntry = -1;

        $scope.addEntry = function(){
            // if(!checkIncomes($scope.incomeEntry)) return false;
            $scope.houseIncomes.push($scope.incomeEntry);
            var cb = $scope.incomeEntry.capitalby;
            $scope.incomeEntry = {};
            $scope.incomeEntry.capitalby=cb;
        };

        $scope.getINCCapitalBy = function(from){
            if(from=='C') return "Client";
            else if(from=='H') return "Husband";
            else if(from=='R') return "Remittance";
        };

        $scope.selectEntry = function(newinfo){
            if($scope.selectedEntry!==-1&&$scope.selectedEntry!=newinfo){
                // if(!checkIncomes($scope.houseIncomes[$scope.selectedEntry])) return false;
            }
            $scope.selectedEntry=newinfo;
        };

        $scope.isSelectedEntry = function(newinfo){
            return newinfo===$scope.selectedEntry;
        };

        $scope.deleteEntry = function(newinfo){
            $scope.houseIncomes.splice(newinfo,1);
            $scope.selectedEntry = -1;
        };

        $scope.getCurrency = function(parsefrom){
            var total = 0;
            $.each($scope.houseIncomes,function(ind,val){
                if(parsefrom=="netrev") total += parseFloat(val.totalinmth)*parseFloat(val.profpermth);
                else total += parseFloat(val[parsefrom]);
                });
            return total;
        };

        $scope.getTotalIncome = function(){
            var sum = 0;
            $.each($scope.houseIncomes,function(i,inc){
                sum += parseInt(inc.fixed) + parseInt(inc.variable);
            });

            return sum;
        };

        $scope.checkNegative = function(income){

            if(income.inctype == 'NEGATIVE'){

                // if(parseInt(income.fixed) > 0) {
                //     income.fixed = parseInt(income.fixed) * -1;
                // }
                // if(income.variable > 0) {
                //     income.variable = parseInt(income.variable) * -1;
                // }

            }
        };

        $scope.incomeDetailoptions = [
            {label: 'Metre Square', value: 'Metre Square'},
            {label: 'Slot', value: 'Slot'},
            {label: 'Hectare', value: 'Hectare'}
        ];

        function checkIncomes(incObj){
            return true; 
        }

        /******************************************
        - House Type
        ******************************************/
        $scope.housetotal = 0;

        $scope.houseinfo={
            housetype: 0,
            total : function(){
                var total = 0;
                for(var i in $scope.choices) total += parseInt(i);
                return total;
            },
        };

        $scope.tempchoices = [null,null,null,null,null,null,null];
        $scope.choices = [null,null,null,null,null,null,null];


        $scope.deleteFund = function(newinfo){
            $scope.borrowedFunds.splice(newinfo,1);
            $scope.selectedfund = -1;
        };

        $scope.getTotal = function(){
            total = 0;
            for(var e in $scope.choices) {
                if($scope.choices[e] != "null"){
                    total += +$scope.choices[e];
                }
            }
            $scope.housetotal = total;

            return total;
        };






        /******************************************
        - Submit
        ******************************************/
        $scope.actionSubmit = function(groupname){


            if(

                sweetCheckNull($scope.applicantdata.photo,i18n.t("messages.EmptyPhoto"),"pageAppData")||
                sweetCheckNull($scope.applicantdata.fullname,i18n.t("messages.EmptyFullName"),"pageAppData")||
                sweetCheckNull($scope.applicantdata.gender,i18n.t("messages.EmptyGender"),"pageAppData")||
                // sweetCheckNull($scope.applicantdata.loantype,i18n.t("messages.EmptyLoanType"),"pageAppData")||
                sweetCheckNull($scope.applicantdata.familycardno,i18n.t("messages.EmptyFamilyCardNo"),"pageAppData")||
                sweetCheckNull($scope.applicantdata.ktpno,i18n.t("messages.EmptyKTPNo"),"pageAppData")||
                sweetCheckNull($scope.applicantdata.dateofbirth,i18n.t("messages.EmptyDOB"),"pageAppData")||
                sweetCheckNull($scope.applicantdata.age,i18n.t("messages.EmptyAge"),"pageAppData")||
                sweetCheckRange(10,100,$scope.applicantdata.age,i18n.t("messages.InvalidAge"),"pageAppData")
              ){
                //$.mobile.changePage("#pageAppData");
                return false;
            }

            if($scope.applicantdata.highested=='6'&&$scope.applicantdata.highestedothers==""){
                // alert("Please specify other education.");
                //alert(i18n.t("messages.EmptyOtherEducation"));
                swal({
                    title: i18n.t("messages.Alert"),
                    text: i18n.t("messages.EmptyOtherEducation"),
                    type: "error",
                    confirmButtonColor: "#80C6C7",
                    confirmButtonText: "Ok",
                }).then(function(){
                    $.mobile.changePage("#pageAppData");
                });
                return false;
            }

            //check husband tab
            if(
              //  checkNull($scope.husbandinfo.maritalstatus,"Please specify client's marital status.")
                checkNull($scope.husbandinfo.maritalstatus,i18n.t("messages.EmptyMaritalStatus"))
            ){
                $.mobile.changePage("#pageAppData2");
                return false;
            }

            if($scope.husbandinfo.maritalstatus!='S'&&($scope.husbandinfo.husbandname==null)){
                //alert("Please specify husband's name.");
                //alert(i18n.t("messages.EmptyHusbandName"));
                swal({
                    title: i18n.t("messages.Alert"),
                    text: i18n.t("messages.EmptyHusbandName"),
                    type: "error",
                    confirmButtonColor: "#80C6C7",
                    confirmButtonText: "Ok",
                }).then(function(){
                    $.mobile.changePage("#pageAppData2");
                });
                return false;
            }

            if($scope.husbandinfo.maritalstatus!='S'&&($scope.husbandinfo.husbandidno==null)){
               // alert("Please specify husband's ID number.");
                //alert(i18n.t("messages.EmptyHusbandIDNo"));
                swal({
                    title: i18n.t("messages.Alert"),
                    text: i18n.t("messages.EmptyHusbandIDNo"),
                    type: "error",
                    confirmButtonColor: "#80C6C7",
                    confirmButtonText: "Ok",
                }).then(function(){
                    $.mobile.changePage("#pageAppData2");
                });

                return false;
            }

            //check household
            if(

                sweetCheckNull($scope.housemotherinfo.noofmembers,i18n.t("messages.EmptyMember"),"pageAppData3")||
                sweetCheckRange(0,99,$scope.housemotherinfo.noofmembers,i18n.t("messages.InvalidMember"),"pageAppData3")||
                sweetCheckNull($scope.housemotherinfo.noofchildren,i18n.t("messages.EmptyChildren"),"pageAppData3")||
                sweetCheckRange(0,99,$scope.housemotherinfo.noofchildren,i18n.t("messages.InvalidChildren"),"pageAppData3")||
                sweetCheckNull($scope.housemotherinfo.mothername,i18n.t("messages.EmptyMotherName"),"pageAppData3")||
                sweetCheckNull($scope.housemotherinfo.motherdob,i18n.t("messages.EmptyMotherDOB"),"pageAppData3")||
                sweetCheckNull($scope.housemotherinfo.motherage,i18n.t("messages.EmptyMotherAge"),"pageAppData3")||
                sweetCheckRange(10,120,$scope.housemotherinfo.motherage,i18n.t("messages.InvalidMotherAge"),"pageAppData3")
            ){
                //$.mobile.changePage("#pageAppData3");
                return false;
            }

            //check address
            if(

                sweetCheckNull($scope.address.village.val,i18n.t("messages.EmptyVillage"),"pageAddress")||
                sweetCheckNull($scope.address.subdistrict,i18n.t("messages.EmptySubDistrict"),"pageAddress")||
                sweetCheckNull($scope.address.district,i18n.t("messages.EmptyDistrict"),"pageAddress")||
                sweetCheckNull($scope.address.province,i18n.t("messages.EmptyProvince"),"pageAddress")
            )
            {
               // $.mobile.changePage("#pageAddress");
                return false;
            }

            if($scope.address.village.val=="?"){
                //alert("Please specify village.");
                //alert(i18n.t("messages.EmptyVillage"));
                swal({
                    title: i18n.t("messages.Alert"),
                    text: i18n.t("messages.EmptyVillage"),
                    type: "error",
                    confirmButtonColor: "#80C6C7",
                    confirmButtonText: "Ok",
                }).then(function(){
                    $.mobile.changePage("#pageAddress");
                });
                return false;
            }

            //check welfare
           // if(checkNull($scope.welfareStatus,"Please specify welfare status."))
            if(
                //checkNull($scope.welfareStatus,i18n.t("messages.EmptyWelfareStatus"))
                sweetCheckNull($scope.welfareStatus,i18n.t("messages.EmptyWelfareStatus"),"pageWelfareStatus")
                )
            {
                //$.mobile.changePage("#pageWelfareStatus");
                return false;
            }

            if(

                sweetCheckNull($scope.workcap.app,i18n.t("messages.EmptyApplicantWorkCapital"),"pageWorkingCapital")||
                sweetCheckNull($scope.workcap.husband,i18n.t("messages.EmptyHusbandWorkCapital"),"pageWorkingCapital")
            ){
                //$.mobile.changePage("#pageWorkingCapital");
                return false;
            }

            if(
                isNaN($scope.workcap.app)||
                isNaN($scope.workcap.husband)
            ){
                //alert("Please specify client's and husband's working capital.");
                //alert(i18n.t("messages.EmptyClientHusbandWorkCapital"));
                swal({
                    title: i18n.t("messages.Alert"),
                    text: i18n.t("messages.EmptyClientHusbandWorkCapital"),
                    type: "error",
                    confirmButtonColor: "#80C6C7",
                    confirmButtonText: "Ok",
                }).then(function(){
                    $.mobile.changePage("#pageWorkingCapital");
                });

                return false;
            }

            if($scope.borrowedFunds.length>0){
                for(var key in $scope.borrowedFunds){
                    if(!checkFunds($scope.borrowedFunds[key])){
                        $.mobile.changePage("#pageWorkingCapital");
                        return false;
                    }
                }
            }

            if(

                sweetCheckNull($scope.choices[0],i18n.t("messages.EmptyHouseSize"),"pageHousingIndex")||
                sweetCheckNull($scope.choices[1],i18n.t("messages.EmptyHouseCondition"),"pageHousingIndex")||
                sweetCheckNull($scope.choices[2],i18n.t("messages.EmptyRoofType"),"pageHousingIndex")||
                sweetCheckNull($scope.choices[3],i18n.t("messages.EmptyWallType"),"pageHousingIndex")||
                sweetCheckNull($scope.choices[4],i18n.t("messages.EmptyFloorType"),"pageHousingIndex")
                // sweetCheckNull($scope.choices[5],i18n.t("messages.EmptyElectricitySource"),"pageHousingIndex")||
                // sweetCheckNull($scope.choices[6],i18n.t("messages.EmptyWaterSource"),"pageHousingIndex")
            )
            {
                //$.mobile.changePage("#pageHousingIndex");
                return false;
            }

            if($scope.houseIncomes.length<1){
               // alert("Please give at least 1 income source.");
                //alert(i18n.t("messages.MinIncomeSource"));
                swal({
                    title: i18n.t("messages.Alert"),
                    text: i18n.t("messages.MinIncomeSource"),
                    type: "error",
                    confirmButtonColor: "#80C6C7",
                    confirmButtonText: "Ok",
                }).then(function(){
                    $.mobile.changePage("#pageHouseIncomeEst");
                });

                return false;
            }

            //check product mapping
            for(var key in $scope.products){
                if(($scope.products[key].isSelected == "YES") &&
                    ($scope.products[key].maturityOptions != null && $scope.products[key].maturityOptions.length > 0) &&
                    sweetCheckNull($scope.products[key].selectedMaturityOption.id,i18n.t("messages.EmptyMaturityOption"),"pageProductMapping")
                )
                {
                    swal({
                        title: i18n.t("messages.Alert"),
                        text: i18n.t("messages.EmptyMaturityOption"),
                        type: "warning",
                    }).then(function(){
                        $.mobile.changePage("#pageProductMapping");
                    });

                    return false;
                }
                // if(sweetCheckNull($scope.products[key].selectedMaturityOption.id,i18n.t("messages.EmptyMaturityOption"),"pageProductMapping")){
                //     //$.mobile.changePage("#pageProductMapping");
                //     return false;
                // }
            }

            if($scope.selectedLoans.length == 0){
                swal({
                    title: i18n.t("messages.Alert"),
                    text: i18n.t("messages.NoLoanSelected"),
                    type: "warning",
                }).then(function(){
                    $.mobile.changePage("#pageProductMapping");
                });
            } else {
                for(var key in $scope.selectedLoans){
                    // if($scope.selectedLoans[key].selecteddetails.)
                }
            } 

            swal({
                title: i18n.t("messages.Alert"),
                text: i18n.t("messages.SubmitNewClientInfo"),
                type: "warning",
                showCancelButton: true,
                confirmButtonText: i18n.t("messages.Yes"),
            }).then(function(isConfirm){
                if(isConfirm)
                    $scope.actionSubmitSecond(groupname);
            });


        };

        $scope.getIncomeCapita = function(){

            var houseIncomes = $scope.houseIncomes;
            var housemotherinfo = $scope.housemotherinfo;

            var totalincome = 0;
            for(var key in houseIncomes){
                totalincome = parseFloat(totalincome + (houseIncomes[key].profpermth*houseIncomes[key].totalinmth));
            }

            var incomepercapita =  totalincome;
            if(housemotherinfo.noofmembers > 0) incomepercapita = parseFloat(totalincome / housemotherinfo.noofmembers);

            return incomepercapita;
        };

        $scope.actionSubmitSecond = function(groupname){

            //check undefined for all listed fields and replace with ''
            var allscopes = [$scope.applicantdata,$scope.husbandinfo,$scope.housemotherinfo,$scope.husbandinfo,$scope.businessinfo,$scope.address,$scope.workcap,$scope.houseinfo,$scope.choices,$scope.borrowedFunds,$scope.houseIncomes, $scope.products];

            $.each(allscopes, function(id, scoper){
                $.each(scoper, function(id, field){
                    if(field==undefined) {
                        field='';
                    }
                });
            });

            //begin query
            // var query = "SELECT * FROM (SELECT MAX(CLT_PK) as mclt_pk FROM T_CLIENT) AS TC INNER JOIN (SELECT MAX(CLL_PK) as mcll_pk FROM T_CLIENT_LOAN) AS TCL INNER JOIN (SELECT MAX(CEF_PK) as mcef_pk FROM T_CLIENT_BORROWED_FUNDS) AS TCEF INNER JOIN (SELECT MAX(CLI_PK) as mcli_pk FROM T_CLIENT_INCOME) AS TCLI";
            var query = "SELECT * FROM (SELECT MAX(CLT_PK) as mclt_pk FROM T_CLIENT) AS TC INNER JOIN (SELECT MAX(CLL_PK) as mcll_pk FROM T_CLIENT_LOAN) AS TCL INNER JOIN (SELECT MAX(CEF_PK) as mcef_pk FROM T_CLIENT_BORROWED_FUNDS) AS TCEF INNER JOIN (SELECT MAX(CLI_PK) as mcli_pk FROM T_CLIENT_INCOME) AS TCLI INNER JOIN (SELECT MAX(CPM_PK) as mcpm_pk FROM T_CLIENT_PRODUCT_MAPPING) AS TCPM INNER JOIN (SELECT MAX(CAL_PK) as mcal_pk FROM T_CLIENT_ASSET_LIST) AS TACL";

            var applicantdata = $scope.applicantdata;
            var husbandinfo = $scope.husbandinfo;
            var housemotherinfo = $scope.housemotherinfo;
            var husbandinfo = $scope.husbandinfo;
            var businessinfo = $scope.businessinfo;
            var address = $scope.address;
            var welfareStatus = $scope.welfareStatus;
            var workcap = $scope.workcap;
            var houseinfo = $scope.houseinfo;
                houseinfo.housetype = 0;
            var choices = $scope.choices;
            var housetotal = $scope.housetotal;
            var borrowedFunds = $scope.borrowedFunds;
            var houseIncomes = $scope.houseIncomes;
            var products = $scope.products;

            var d = new Date(applicantdata.dateofbirth);
            var appAge = applicantdata.age+"";
            var appdateofbirth = d.getDate()+"/"+(d.getMonth())+"/"+d.getFullYear();//+" 00:00:00";

            d = new Date(housemotherinfo.motherdob);
            var motherAge = housemotherinfo.motherage+"";
            var motherdob = d.getDate()+"/"+(d.getMonth())+"/"+d.getFullYear();//+" 00:00:00";

            var stayinhouse = "N";
            if(husbandinfo.livesinhouse=='YES') stayinhouse="Y";

            myDB.execute(query, function(results){
                if(results.length<0) return false;

                var CLT_PK = results[0].mclt_pk+1; //get max pks
                var CLL_PK = results[0].mcll_pk+1;
                var CEF_PK = results[0].mcef_pk+1;
                var CLI_PK = results[0].mcli_pk+1;

                applicantdata.filename = CLT_PK;

                var USER_PK = parseInt(sessionStorage.getItem("USER_PK"));
                var BRC_PK = parseInt(sessionStorage.getItem("BRC_PK"));
                var CLL_ORIGINAL_LOAN = sessionStorage.getItem("CLL_ORIGINAL_LOAN");
                var CLL_LOAN_INTEREST = sessionStorage.getItem("CLL_LOAN_INTEREST");
                var CLL_CRF_PERCENTAGE = sessionStorage.getItem("CLL_CRF_PERCENTAGE");
                var CLL_CENTER_ID = sessionStorage.getItem("USER_CTR_ID");

                var CLL_LOAN_NUMBER;

                //check if client is eligible for loan
                var CLIENT_STATUS = 2;

                var eligibilityNotice = "";

                if((sessionStorage.getItem('BRC_HOUSE_INDEX_CAP')!=0&&sessionStorage.getItem('BRC_HOUSE_INDEX_CAP')<=$scope.getTotal())||
                   (sessionStorage.getItem('BRC_INCOME_CAP')!=0&&sessionStorage.getItem('BRC_INCOME_CAP')<=$scope.getCurrency('netrev'))||
                   (sessionStorage.getItem('BRC_NO_OF_LOANS_FROM_OTHERBANKS')!=0&&sessionStorage.getItem('BRC_NO_OF_LOANS_FROM_OTHERBANKS')<=$scope.countBFBanks())||
                   (sessionStorage.getItem('BRC_WELFARE_STATUS_CAP')!=""&&(sessionStorage.getItem('BRC_WELFARE_STATUS_CAP').indexOf($scope.welfareStatus))!='-1')){
                   // alert("Notice:This client is not eligible for loan.");
                    //alert(i18n.t("messages.ClientNotEligibleForLoan"));
                    eligibilityNotice = i18n.t("messages.ClientNotEligibleForLoan");
                    CLIENT_STATUS = 27;
                }

                checkLogin();

                var tsunamiAffected = (sanitize(applicantdata.tsunamiAffected) == 'YES' ? 1 : 0);
                var quakeAffected = (sanitize(applicantdata.quakeAffected) == 'YES' ? 1 : 0);
                var haveSavings = (sanitize(applicantdata.haveSavings) == 'YES' ? 1 : 0);
                var haveInsurance = (sanitize(applicantdata.haveInsurance) == 'YES' ? 1 : 0);
                var havecooperate = 0;
                var haveotherbank = 0;
                var haveinstitutes = 0;

                for(var key in borrowedFunds){
                    if(borrowedFunds[key].loanfrom == "I") haveinstitutes = 1;
                    if(borrowedFunds[key].loanfrom == "B") haveotherbank = 1;
                    if(borrowedFunds[key].loanfrom == "C") havecooperate = 1;
                }

                var totalincome = 0;
                for(var key in houseIncomes){
                    totalincome = parseFloat(totalincome + (houseIncomes[key].profpermth*houseIncomes[key].totalinmth));
                }

                var incomepercapita =  totalincome;
                if(housemotherinfo.noofmembers > 0) incomepercapita = parseFloat(totalincome / housemotherinfo.noofmembers);

                $scope.getMaxGrpId();

                if($scope.haveNewRec){
                    myDB.execute("DELETE FROM T_CLIENT_NEW WHERE CLT_PK="+CLT_PK,function(res){

                    });
                }

                var CLL_CRF_AMOUNT = CLL_ORIGINAL_LOAN * CLL_CRF_PERCENTAGE;
                var query1 = "INSERT INTO T_CLIENT_NEW VALUES(null,"+CLT_PK+",'"+BRC_PK+"','"+sanitize(applicantdata.fullname)+"','"+sanitize(applicantdata.nickname)+"','"+applicantdata.gender+"','"+sanitize(husbandinfo.husbandname)+"','"+husbandinfo.husbandidno+"','"+((husbandinfo.livesinhouse=="YES")?"Y":"N")+"','"+sanitize(applicantdata.familycardno)+"','"+applicantdata.clientno+"','"+applicantdata.ktpno+"','"+appdateofbirth+"','"+appAge+"','"+applicantdata.highested+"','"+sanitize(applicantdata.highestedothers)+"','"+husbandinfo.maritalstatus+"','"+housemotherinfo.noofmembers+"','"+housemotherinfo.noofchildren+"','"+sanitize(husbandinfo.whereis)+"','"+husbandinfo.howoften+"','"+sanitize(housemotherinfo.mothername)+"','"+motherdob+"','"+motherAge+"','"+sanitize(businessinfo.typeofbusiness)+"','"+sanitize(businessinfo.busequipment)+"','"+sanitize(businessinfo.jointbusiness)+"','"+sanitize(businessinfo.jbequipment)+"','"+sanitize(businessinfo.husbandbusiness)+"','"+sanitize(businessinfo.hbequipment)+"','"+$scope.address.rw+"','"+sanitize(address.streetarea)+"','"+address.village.val+"','"+sanitize(address.subdistrict)+"','"+sanitize(address.district)+"','"+sanitize(address.province)+"','"+address.postcode+"','"+sanitize(address.landmark)+"','"+sanitize(address.mobile1)+"','"+sanitize($scope.address.mobile2)+"','"+sanitize(address.husbmobile)+"',null,null,null,null,null,null, "+
                             "'"+sanitize(applicantdata.placeofbirth)+"' , "+ //CLT_PLACE_OF_BIRTH
                            "'"+sanitize(husbandinfo.whereis)+"', " + //CLT_RESIDENCE_OF_PARENTS
                            "'"+USER_PK+"', "+
                            "'"+moment().format('DD/MM/YYYY HH:mm:ss')+"', "+
                            applicantdata.clientstatus+", "+
                            $scope.address.centerid+", "+
                            "null, "+
                            "null, "+
                            "'"+$scope.address.rw+"', "+ //CLT_RW
                            "'null', "+ //CLT_ATTENDANCE_PERCENTAGE
                            "'null', "+ //CLT_INSTALMENT_PERCENTAGE
                            "null, "+ //CLT_SIGNATURE
                            "1)";  // ISNEW

                var query6 = [];
                var query7 = [];
                var query8 = [];


                myDB.execute("SELECT CLL_PK FROM T_CLIENT_LOAN_NEW WHERE CLL_CLT_PK="+CLTPK,function(results){
                    $.each(results,function(i,res){
                        var lcmd = "UPDATE T_CLIENT_LOAN_NEW SET "+
                                        "  CLL_WELFARE_STATUS='"+welfareStatus+"'"+
                                        ", CLL_WORKING_CAPITAL="+workcap.app+
                                        ", CLL_HB_WORKING_CAPITAL="+workcap.husband+
                                        ", CLL_HOUSE_TYP="+houseinfo.housetype+
                                        ", CLL_HOUSE_SIZE="+choices['0']+
                                        ", CLL_HOUSE_CONDITION="+choices['1']+
                                        ", CLL_ROOF_TYPE="+choices['2']+
                                        ", CLL_WALL_TYPE="+choices['3']+
                                        ", CLL_FLOOR_TYP="+choices['4']+
                                        ", CLL_ELETRICITY="+choices['5']+
                                        ", CLL_WATER_SRC="+choices['6']+
                                        ", CLL_HSE_INX ="+housetotal+
                                        ", CLL_INDEX_OF_INCOME='"+incomepercapita+"'"+
                                        ", CLL_INDEX_OF_ASSE='"+$scope.getTotalUnproVal()+"'"+
                                        ", CLL_TSUNAMI_AFFECT="+tsunamiAffected+
                                        ", CLL_QUAKE_AFFECT="+quakeAffected+
                                        ", CLL_LOAN_COOPERATE_EXISTS="+havecooperate+
                                        ", CLL_LOAN_BANK_EXISTS="+haveotherbank+
                                        ", CLL_FINANCE_INSTITUTE_ACCESS="+haveinstitutes+
                                        ", CLL_SAVING_ACCOUNT_EXISTS="+haveSavings+
                                        ", CLL_INSURANCE_EXISTS="+haveInsurance+
                                        ", CLL_MOB_NEW=2 "+
                                        " WHERE CLL_PK="+res.CLL_PK;
                        //query6.push();
                    });
                });
 
                var query3 = [];
                var query4 = [];
                var query5 = [];

                for(var key in borrowedFunds){
                    query3.push("INSERT INTO T_CLIENT_BORROWED_FUNDS_NEW VALUES(null,"+CEF_PK+","+CLT_PK+","+CLL_PK+",'"+borrowedFunds[key].loanfrom+"','"+sanitize(borrowedFunds[key].loanfromname)+"','"+borrowedFunds[key].applicant+"',"+borrowedFunds[key].originalamt+","+borrowedFunds[key].balance+","+borrowedFunds[key].repaymentperwk+","+borrowedFunds[key].repaymentpermth+",1);");
                } 

                for(var key in houseIncomes){
                    if(houseIncomes[key].detaildesc == null || houseIncomes[key].detaildesc == ""){
                        var incomedetails = 'null';
                    } else {
                        var det = 0;
                        if(houseIncomes[key].details != null && houseIncomes[key].details != '' && !isNaN(houseIncomes[key].details)) det = houseIncomes[key].details;
                        var incomedetails =  det+" "+houseIncomes[key].detaildesc;
                    }
                    query4.push( "INSERT INTO T_CLIENT_INCOME_NEW VALUES(null,"+CLI_PK+","+CLT_PK+","+CLL_PK+",'"+houseIncomes[key].source+"','"+incomedetails+"','"+houseIncomes[key].fixed+"','"+houseIncomes[key].variable+"',1)");

                }



                for(key in products){
                    if(products[key].isSelected == "YES"){
                        //query5.push("INSERT INTO T_CLIENT_PRODUCT_MAPPING VALUES(null," + CPM_PK + "," + CLT_PK + "," + CLL_PK + "," + products[key].PRM_PK + "," + ((products[key].selectedMaturityOption==null)? "''" :"'"+ products[key].selectedMaturityOption.id+"'") + ",0,null,'" + moment().format('DD/MM/YYYY HH:mm:ss') + "',null,56, 2" + ");");
                    }
                }

                //clean data
                query1 = query1.replace(/undefined/g, "");
                //query2 = query2.replace(/undefined/g, "");

                for(var e in query3){query3[e] = query3[e].replace(/undefined/g, "");}
                for(var e in query4){query4[e] = query4[e].replace(/undefined/g, "");}
                for(var e in query5){query5[e] = query5[e].replace(/undefined/g, "");}
                for(var e in query6){query6[e] = query6[e].replace(/undefined/g, "");}
                for(var e in query7){query7[e] = query7[e].replace(/undefined/g, "");}
                for(var e in query8){query8[e] = query8[e].replace(/undefined/g, "");}

                //console.log(query1);

                if(!devtest){ //save photo, once successful write into database
                    fileManager = new fm();
                    var promise = fileManager.write("photo"+CLT_PK+".dataurl",applicantdata.photo);
                    promise.done(function(res){
                        myDB.dbShell.transaction(function(tx){
                            tx.executeSql(query1);
                            //tx.executeSql(query2);
                            for(var e in query3){tx.executeSql(query3[e]);}
                            for(var e in query4){tx.executeSql(query4[e]);}
                            for(var e in query5){tx.executeSql(query5[e]);}

                            for(var e in query6){ tx.executeSql(query6[e]);}
                            for(var e in query7){ console.log(query7[e]); tx.executeSql(query7[e]);}
                            for(var e in query8){ tx.executeSql(query8[e]);}
                       // }, function(err){alert("Error saving data into database.");return true;}, function(suc){
                        }, function(err){
                            //alert(i18n.t("messages.AddClientError") + err);

                            swal({
                                title: i18n.t("messages.Alert"),
                                text: i18n.t("messages.AddClientError"),
                                type: "error",
                                confirmButtonColor: "#80C6C7",
                                confirmButtonText: "Ok",
                            });
                            return true;
                        }, function(suc){
                           // alert("Successfully added client");
                            //alert(i18n.t("messages.AddClientSuccess"));
                            $scope.submitClient(eligibilityNotice);
                            return true;
                        });
                    //}).fail(function(err){alert("Error encountered.");});
                    }).fail(function(err){
                        //alert(i18n.t("messages.ErrorEncounter"));
                        swal({
                            title: i18n.t("messages.Alert"),
                            text: i18n.t("messages.ErrorEncounter"),
                            type: "error",
                            confirmButtonColor: "#80C6C7",
                            confirmButtonText: "Ok",
                        });
                    });
                    return false;
                }else{ //development so only save into database
                    myDB.dbShell.transaction(function(tx){

                        tx.executeSql(query1);
                        // //tx.executeSql(query2);
                        for(var e in query3){ console.log(query3[e]); tx.executeSql(query3[e]);}
                        for(var e in query4){ console.log(query4[e]); tx.executeSql(query4[e]);}
                        for(var e in query5){ console.log(query5[e]); tx.executeSql(query5[e]);}
                        for(var e in query6){ console.log(query6[e]); tx.executeSql(query6[e]);}
                        for(var e in query7){ console.log(query7[e]); tx.executeSql(query7[e]);}
                        for(var e in query8){ console.log(query8[e]); tx.executeSql(query8[e]);}
               //     }, function(err){alert("Error saving into database.");return true;}, function(suc){
                    }, function(err){
                            //alert(i18n.t("messages.AddClientError") + err);
                            //console.log(err);
                            swal({
                                title: i18n.t("messages.Alert"),
                                text: i18n.t("messages.AddClientError"),
                                type: "error",
                                confirmButtonColor: "#80C6C7",
                                confirmButtonText: "Ok",
                            });
                            return true;
                        },
                        function(suc){
                            $scope.submitClient();
                            return true;
                        });
                }
            });
        };

        $scope.submitClient = function(){

            var stitle = "";
            var stext = "";
            var stype = "";

            stitle =  i18n.t("messages.AlertSuccess");
            stext =  i18n.t("messages.ClientUpdateSuccess");
            stype = "success";

            swal({
                title: stitle,
                text: stext,
                type: stype,
                confirmButtonColor: "#80C6C7",
                confirmButtonText: "Ok",
            }).then(function(){
                //window.location.href = "client.html";
                $('.etask-container').fadeOut();
                setTimeout(function(){
                    //$scope.loadGroups();
                    window.location.href = "client.html";
                },100);
            });
        };


/******************************************
- Display T_CODE/T_HOUSE_INDEX values on UI properly
******************************************/


        $scope.loanpurpose = [];

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
        };
        $scope.loadLoanPurpose();

        var t = this;
        $scope.loans = [];
        $scope.selectedLoans = [];
        $scope.isNewLoan = [];
        $scope.newloaninfo = [];
        $scope.existingLoanPks = [];


        var date = new Date();
        date = ("0"+date.getDate()).slice(-2)+"/"+("0"+(date.getMonth())).slice(-2)+"/"+date.getFullYear();

        //Get Last Completed Loan
        $scope.lastloan = null;
        var cmdll = "SELECT T_CLIENT_LOAN.*, T_LOAN_TYPE.*, T_LOAN_PURPOSE.*, CLE_HSE_INX, CLE_EVER_IN_ARREARS, CLE_EVER_IN_JOINT_RESPONSIBILITY, CLE_NOTE, SUM(EVAL_ASSET.CEAL_ASSET_VALUE) as total_asset FROM T_CLIENT_LOAN LEFT JOIN T_LOAN_TYPE ON (CLL_LTY_PK = LTY_PK) LEFT JOIN T_LOAN_PURPOSE ON (CLL_LPU_PK = LPU_PK) LEFT JOIN T_CLIENT_EVALUATION ON (CLE_CLL_PK = CLL_PK AND CLE_REVIEW_CODE = 2) LEFT JOIN (SELECT CEAL_ASSET_VALUE, CEAL_CLE_PK, CEAL_CLT_PK FROM T_CLIENT_EVAL_ASSET_LIST WHERE CEAL_CLT_PK = "+$scope.clientPK+"  ) as EVAL_ASSET ON ( CEAL_CLE_PK = CLE_PK ) WHERE CLL_CLT_PK="+$scope.clientPK+" AND CLL_STATUS = 9 ORDER BY CLL_PK DESC LIMIT 1";
        console.log(cmdll);
        console.log("333");
        myDB.execute(cmdll,function(results){ 
            if(results){
                $scope.lastloan = results[0];
            }
        });
        //Get Asset Assesment
        //myDB.execute("SELECT * FROM T_CLIENT_ASSET_LIST, T_CLIENT_EVAL_ASSETS_LIST WHERE");

        $scope.getAllExistingLoans = function(clientpk){
 
            $.when(LoanService.getAllExistingLoans(clientpk),LoanService.getAllLoanTypesAndLoanCycleofClient(clientpk)).then(function(data,loantypes){

                if(data != null){
                    var loans = data;
                    for(l in loans){
                        var loan = loans[l];

                        if( loan.CLL_STATUS == 64) $scope.isNewClient = true;

                        $scope.existingloans.push(loan.CLL_LTY_PK);
                        $scope.existingloanStatus.push(loan.CLL_STATUS);
                        $scope.existingLoanPks.push(loan.CLL_PK);
                        $scope.isNewLoan.push(loan.CLL_MOB_NEW);
                        if(loan.CLL_MOB_NEW == 1 ){
                            var loanObj = {
                                CLL_LTY_PK: loan.CLL_LTY_PK,
                                CLL_ACTUAL_LOAN: loan.CLL_ACTUAL_LOAN,
                                CLL_TOTAL_LOAN_WEEKS: loan.CLL_TOTAL_LOAN_WEEKS,
                                LPU_NAME: loan.LPU_NAME,
                                CLL_CHILD_NAME: loan.CLL_CHILD_NAME,
                                CLL_CHILD_GENDER: loan.CLL_CHILD_GENDER,
                                CLL_CHILD_AGE: loan.CLL_CHILD_AGE,
                                CLL_MEMBER_STUDENT_PROFILE: loan.CLL_MEMBER_STUDENT_PROFILE,
                                CLL_THIRDPARTY_NAME: loan.CLL_THIRDPARTY_NAME,
                                CLL_THIRDPARTY_ADDRESS: loan.CLL_THIRDPARTY_ADDRESS,
                                CLL_THIRDPARTY_ACC_NUMBER: loan.CLL_THIRDPARTY_ACC_NUMBER,
                                CLL_TRANSFER_MODE: loan.CLL_TRANSFER_MODE
                            };
                            $scope.newloaninfo.push(loanObj);
                        }
                    }
                    var exist_loans = $scope.existingloans.join();
                } 
                if(loantypes != null){
                    var loans = [];
                    $.each(loantypes,function(ind,rec){
                        rec.products = [];
                        rec.isSelected = false;

                        var loanInt = rec.LTY_DEFAULT_LOAN_INTEREST.split(",")[0];
                        var childname = "";
                        var childage = "";
                        var childgender = "";
     
                        rec.selecteddetails = {
                            loanamt: rec.LTY_MIN_LOAN_AMOUNT,
                            loanmaturity: null,
                            loanpurpose: null,
                            loaninterest:loanInt, 
                        };
                        // GET MATURITY
                        var matarray = [];
                        if(rec.LTY_TERM_OF_LOAN != null){
                            if(rec.LTY_TERM_OF_LOAN.indexOf(",") != -1){
                                var mat = rec.LTY_TERM_OF_LOAN.split(",");
                                if(mat.length > 0){
                                    $.each(mat,function(m,mata){
                                        var key = {
                                            value : mata,
                                            name : mata
                                        };
                                        matarray.push(key);
                                    });
                                }
                            } else {
                                var key = {
                                        value : rec.LTY_TERM_OF_LOAN,
                                        name : rec.LTY_TERM_OF_LOAN
                                    };
                                matarray.push(key);
                            }

                        }
                        var gracearray = [];
                        if(rec.LTY_GRACE_PERIOD_WEEK != null){
                            if(rec.LTY_GRACE_PERIOD_WEEK.indexOf(",") != -1){
                                var grace = rec.LTY_GRACE_PERIOD_WEEK.split(",");
                                if(grace.length > 0){
                                    $.each(grace,function(g,gracea){
                                        var key = {
                                            value : gracea,
                                            name: gracea
                                        };
                                        gracearray.push(key);
                                    });
                                }
                            } else {
                                var key = {
                                    value : rec.LTY_GRACE_PERIOD_WEEK,
                                    name: rec.LTY_GRACE_PERIOD_WEEK
                                };
                                gracearray.push(key);
                            }
                        }

                        rec.maturityOptions = matarray;
                        rec.graceOptions = gracearray;
                        rec.isOriginal = false;

                        rec.existingloan = false;
                        rec.newloan = false;
                        rec.CLL_STATUS = 99;
                        if(rec.CLL_MOB_NEW == 1) rew.newloan = true;
                        //console.log("loany");
                        //console.log($scope.existingloans);
                        //console.log($scope.existingloanStatus);
                        $.each($scope.existingloans,function(e,eloan){
                            if(eloan == rec.LTY_PK){
                                rec.existingloan = true;
                                rec.CLL_STATUS = $scope.existingloanStatus[e];
                                if($scope.isNewLoan[e] == 1){
                                    rec.newloan = true;
                                    rec.CLL_PK = $scope.existingLoanPks[e];
                                }
                            }
                        });
     
                        $scope.loans.push(rec);
                    });
                }
                $scope.loadproducts();
                $scope.loadNewProducts();
            });
 
        }

        $scope.getAllExistingLoans($scope.clientPK);
 
        $scope.getNewLoan = function(activeloan,type){
            if(activeloan == undefined ) return false;
            if($scope.newloaninfo ==undefined || $scope.newloaninfo.length == 0) return false;
  
            var loan = $filter('filter')( $scope.newloaninfo, { CLL_LTY_PK : activeloan.LTY_PK } )[0];
          
            if(loan == undefined) return false;

            if(type == 'loanamt'){
                return loan.CLL_ACTUAL_LOAN;
            } else if (type == 'loanmat'){
                return loan.CLL_TOTAL_LOAN_WEEKS;
            } else if (type == 'loanpurp'){
                return loan.LPU_NAME;
            } else if (type == 'childname'){
                return loan.CLL_CHILD_NAME;
            } else if (type == 'childgender'){
                return loan.CLL_CHILD_GENDER;
            } else if (type == 'childage'){
                return loan.CLL_CHILD_AGE;
            } else if (type == 'childprofile'){
                return loan.CLL_MEMBER_STUDENT_PROFILE;
            } else if (type == 'payeename'){
                return loan.CLL_THIRDPARTY_NAME;
            } else if (type == 'payeeaddress'){
                return loan.CLL_THIRDPARTY_ADDRESS;
            } else if (type == 'payeeacct'){
                return loan.CLL_THIRDPARTY_ACC_NUMBER;
            } else if (type == 'disbmode'){
                return loan.CLL_TRANSFER_MODE;
            } 

        };

        $scope.selectDisburseMode = function(loan,type){
            if(!loan.newloan) loan.selecteddetails.disbmode= type;
        };

        $scope.getPolicyText = function(policy,type){

            var text = "";

            if(policy == "M"){
                text = "On Maturity";
            } else if (policy == "A"){
                text = "Anytime";
            } else if (policy == "C"){
                text = "on Account Close";
            } else if (policy == "H"){
                text = "on Holiday";
            } else if (policy == "N"){
                text = "No" + type;
            }

            return text;

        };

        $scope.loadNewProducts = function(){

            $scope.newproducts = [];

            myDB.execute("SELECT * FROM T_PRODUCT_MASTER,T_CLIENT_PRODUCT_MAPPING WHERE CPM_PRM_PK = PRM_PK AND CPM_CHKNEW = 1 AND CPM_CLT_PK="+$scope.clientPK,function(res){
                // console.log("newprds");
                // console.log(res);
                if(res.length == 0) return false;
                $.each(res,function(i,val){

                    val.isMandatory = "Y";
                    val.isSelected = "YES";
                    val.selectedSavingperWeek = val.CPM_REPAY_PER_WEEK;

                    $scope.newproducts.push(val);
                });
            });

        };



        $scope.loadproducts = function(){
            ////console.log($scope.loans);

            $.when(SavingService.getAllMappedProductsForSecondLoan($scope.clientPK)).done(function(prds){
                var products = [];
                console.log("got all prds");
                console.log(prds);
                if(prds !== null ){
                    $.each($scope.loans,function(ind,loan){
                        $scope.loans.products = [];
                        for(p in prds){
                            var prd = prds[p];
                            //console.log(prd.LSM_LTY_PK+" "+loan.LTY_PK);
                            if(prd.LSM_LTY_PK == loan.LTY_PK){
                                //console.log("match");
                                prd.isSelected = "YES";
                                if(prd.LSM_PRM_IS_MANDATORY == 'Y'){
                                    prd.isMandatory = 'Y';
                                } else {
                                    prd.isMandatory = 'N';
                                }

                                prd.showMaturityOptions = false;
                                prd.selectedMaturityOption = null;
                                var mat_arr = [];
                                mat_arr = prd.PRM_LOAN_MATURITY_OPTIONS.split(',');
                                if(mat_arr.length > 1) {
                                    prd.showMaturityOptions = true;
                                    //rec.selectedMaturityOption = mat_arr[0];
                                }
                                prd.maturityOptions = mat_arr;
                                ////console.log(rec);
                                prd.withdrawPolicy = $scope.getPolicyText(prd.PRM_LOAN_WITHDRAW_POLICY,"withdrawal");
                                prd.closingPolicy = $scope.getPolicyText(prd.PRM_LOAN_CLOSING_POLICY,"closing");

                                var depoamt = prd.LSM_PRM_OPEN_BAL;

                                if(depoamt != null && depoamt.indexOf("%") != -1){

                                    depoamt = depoamt.replace("%","");
                                    depoamt = parseFloat(loan.selecteddetails.loanamt) / parseFloat(depoamt);
                                    depoamt = depoamt.toFixed(4);

                                }

                                prd.depositAmt = depoamt; 
                                loan.products.push(prd);
                                
                            } 
                        }
                        console.log('loan products')
                        console.log(loan);
                    }); 
                    $scope.$apply();
                }
            });
 
             

        };
        $scope.loanSelected = function(loan,$event){
            $event.preventDefault();
            $event.stopPropagation();
 
            loan.CLL_STATUS = 42;

            var proceed = true;

            if(loan.existingloan && loan.CLL_STATUS != 42 && loan.CLL_STATUS != 1) {

                if(loan.CLL_STATUS==59 || loan.CLL_STATUS == 19){
                    $scope.evaluate();
                } else {
                    swal(i18n.t(messages.ClientNotEligibleForNewLoan));
                }
                return false;
            }
            if(loan.newloan){
                swal(i18n.t(messages.ClienthasExistingNewLoan));
                return false;
            }

            $.each(loan.products,function(i,prd){
                console.log('loan products');
                console.log(prd);
                var canAdd = $scope.productAvailable(prd,'check'); 
                console.log('canAdd ' + canAdd);
                if(canAdd){
                    if(prd.showMaturityOptions && (prd.selectedMaturityOption == null || prd.selectedMaturityOption == 'null') && prd.isSelected == 'YES'){
                        swal({
                            title: i18n.t("messages.Alert"),
                            text:  i18n.t("messages.ProductMaturityEmpty"),
                            type:  "warning",
                            confirmButtonColor: "#80C6C7",
                            confirmButtonText: i18n.t("buttons.Ok"),
                        });
                        proceed = false;
                        return false;
                    }
                    if(prd.PRM_CODE == feastsavingcode && prd.isSelected == 'YES' && (prd.selectedSavingperWeek == "" || prd.selectedSavingperWeek == null) ){
                        swal({
                            title: i18n.t("messages.Alert"),
                            text:  i18n.t("messages.EmptyProductSavingpwk"),
                            type:  "warning",
                            confirmButtonColor: "#80C6C7",
                            confirmButtonText: i18n.t("buttons.Ok"),
                        });
                        proceed = false;
                        return false;
                    }
                    if(prd.isSelected == 'YES'){
                        $scope.productAvailable(prd,'add');
                        if(prd.showMaturityOptions && prd.selectedMaturityOption != null){
                            $.each($scope.loans,function(l,sloan){
                                $.each(sloan.products,function(s,savings){
                                    savings.selectedMaturityOption = prd.selectedMaturityOption;
                                });
                            });
                            //console.log($scope.loans);
                        }
                        if(prd.PRM_CODE == feastsavingcode && prd.isSelected == 'YES' && (prd.selectedSavingperWeek != "" || prd.selectedSavingperWeek != null) ){
                            $.each($scope.loans,function(l,sloan){
                                $.each(sloan.products,function(s,savings){
                                    savings.selectedSavingperWeek = prd.selectedSavingperWeek;
                                });
                            });
                        }
                    }

                }
            });


            if(!proceed) return false;

            if(loan.isSelected){
                loan.isSelected = false;
                for(var i = 0; i < $scope.selectedLoans.length; i++) {
                    if($scope.selectedLoans[i].LTY_PK == loan.LTY_PK) {
                        $scope.selectedLoans.splice(i, 1);
                        break;
                    }
                }
            } else {

                var conflicting_loan = false;
                if(loan.LTY_PK == 34 || loan.LTY_PK == 35){
                    var confli = 0;
                    if(loan.LTY_PK == 34) confli = 35;
                    if(loan.LTY_PK == 35) confli = 34;
                    //LOOP SELECTED LOAN TO FIND CONFLICTING LOANS
                    $.each($scope.selectedLoans,function(i,lo){
                        if(lo.LTY_PK == confli){
                            conflicting_loan = true;
                        }
                    });

                    if(conflicting_loan){
                        swal({
                            title: i18n.t("messages.Alert"),
                            text: "General Loan "+i18n.t("messages.And")+" Microbisnis Loan "+i18n.t("messages.CannotbeTogether"),
                            type: "warning",
                            confirmButtonColor: "#80C6C7",
                            confirmButtonText: i18n.t("buttons.Ok"),
                        });
                        return false;
                    }
                }


                if(loan.selecteddetails.loanamt < loan.LTY_MIN_LOAN_AMOUNT){

                    swal({
                        title: i18n.t("messages.Alert"),
                        text: i18n.t("messages.LoanAmtLesserThan") +loan.LTY_MIN_LOAN_AMOUNT,
                        type: "warning",
                        confirmButtonColor: "#80C6C7",
                        confirmButtonText: i18n.t("buttons.Ok"),
                    });

                    return false;
                }

                loan.isSelected = true;
                //$('#activeloanMaturity').selectmenu("refresh", true);

                if(loan.LTY_PK == 99){
                    var key = {
                        name: '',
                        value: 999
                    };
                    loan.selecteddetails.loanamt = 0;
                    loan.selecteddetails.loanpurpose = key;
                }
                console.log(loan);
                $scope.selectedLoans.push(loan);

                // $('#activeloanMaturity').selectmenu("refresh", true);
                // $('#activeloanGracePeriod').selectmenu("refresh", true);

            }
        };

        //myDB.execute("UPDATE T_CLIENT_LOAN_NEW SET CLL_PAST_MEMBERSHIP_EXISTS=0 WHERE CLL_PK=105");

        $scope.viewloanproducts = function(idx,$event){

            $('.loan-box').removeClass('selected');

            var tis = $event.currentTarget;

            $(tis).find('.loan-box').addClass('selected');

            $scope.activeloan = [];
            var loan = $scope.loans[idx];
            var purpose = $filter('filter')( $scope.loanpurpose, { loan: loan.LTY_PK })[0];
            
            loan.selecteddetails.loanamt = parseFloat(loan.LTY_MIN_LOAN_AMOUNT);
            loan.selecteddetails.loanmaturity = loan.maturityOptions[0];
            loan.selecteddetails.graceperiod = loan.graceOptions[0];
            loan.selecteddetails.loanpurpose = purpose;
            loan.selecteddetails.childname = loan.CLL_CHILD_NAME !== undefined ? loan.CLL_CHILD_NAME : '';
            loan.selecteddetails.childgender = loan.CLL_CHILD_GENDER !== undefined ? loan.CLL_CHILD_GENDER : '';
            loan.selecteddetails.childage = loan.CLL_CHILD_AGE !== undefined ? loan.CLL_CHILD_AGE : 0;
  
            if(loan.existingloan && loan.CLL_STATUS != 42 && loan.CLL_STATUS != 1 && loan.CLL_STATUS != 64){

                if(loan.CLL_STATUS==59 || loan.CLL_STATUS == 19){
                    $scope.evaluate();
                } else {
                    swal(i18n.t("messages.ClientNotEligibleForNewLoan"));
                    return false;
                }

                if(loan.newloan){
                    swal(i18n.t("messages.ClienthasExistingNewLoan"));
                    return false;
                }
            }

            $scope.activeloan = loan;
            console.log('active loan');
            console.log($scope.activeloan);
            //$scope.loadLoanPurpose();

            //$('#activeloanMaturity'+$scope.activeloan.LTY_PK).selectmenu("refresh", true);
            //$('#activeloanPurpose'+$scope.activeloan.LTY_PK).selectmenu("refresh", true);

            setTimeout(function(){
                $('#activeloanMaturity'+$scope.activeloan.LTY_PK).selectmenu("refresh", true);
                $('#activeloanPurpose'+$scope.activeloan.LTY_PK).selectmenu("refresh", true);
                refreshall('#activeloanGracePeriod'); 
            },300);
            $('html, body').animate({
                scrollTop: $("#productmappingdetails").offset().top - 90
            }, 1000);
            //console.log($scope.activeloan);
        };

        myDB.T_PRODUCT_MASTER.get(null,function(results){
            $.each(results,function(ind,rec){
                if(rec.PRM_IS_MANDATORY == "Y"){
                    rec.isSelected = "YES";
                } else{
                    rec.isSelected = "NO";
                }
                rec.showMaturityOptions = false;
                rec.selectedMaturityOption = null;
                var mat_arr = [];
                mat_arr = rec.PRM_LOAN_MATURITY_OPTIONS.split(',');
                if(mat_arr.length > 1) {
                    rec.showMaturityOptions = true;
                    //rec.selectedMaturityOption = mat_arr[0];
                }

                rec.maturityOptions = mat_arr;
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

        

        //load T_CODE values into a variable selectCodes
        $scope.selectAllCodes = {
            process : function(results){
                results.forEach(function(value,index){
                    $scope.selectCodes[value.CODE_TYPE_PK] || ($scope.selectCodes[value.CODE_TYPE_PK] = []); //init if null
                    var keypair = {'name': value.CODE_NAME,'value': value.CODE_VALUE, 'desc' : value.CODE_DESC};
                    $scope.selectCodes[value.CODE_TYPE_PK].push(keypair);
                });
            },
        };
        this.setCodes = function(results){
            $scope.$apply(function() {$scope.selectAllCodes.process(results);});
        };
        myDB.T_CODE.get("(CODE_TYPE_PK>=1 AND CODE_TYPE_PK<=3) OR CODE_TYPE_PK=6 OR CODE_TYPE_PK=21 OR (CODE_TYPE_PK>=9 AND CODE_TYPE_PK<=16)",function(results){
            t.setCodes(results);
            //$scope.magic();
            $scope.ChkNewClientDataExists($scope.clientPK);

        });

        //load T_HOUSE_INDEX
        myDB.T_HOUSE_INDEX.get(null,function(results){
            $scope.houseindices = {};
            $.each(results,function(ind,rec){
                ($scope.houseindices[rec.HSE_TYPE_PK]||($scope.houseindices[rec.HSE_TYPE_PK]=[]));
                $scope.houseindices[rec.HSE_TYPE_PK].push(rec);
            });
        });

        //Load WELFARE values
        $scope.selectWelfare = function(typepk){ $scope.selectedWelfare = $scope.familywelfare[typepk]; };
        myDB.T_FAMILY_WELFARE.get(null,function(results){
            $scope.familywelfare = [];
            $.each(results,function(ind,rec){ $scope.familywelfare.push(rec); }); //saves each welfare type into the array

            $scope.selectWelfare(0); //select the first option as default
            $scope.welfareStatus="PW";
            $("#welfareRadio1label").addClass("ui-radio-on");
        });

        //Load VILLAGE values
        this.setVillages = function(results){
            $.each(results, function(ind, val){
                $scope.selectCodes.VILL || ($scope.selectCodes.VILL = []); //init if null
                var keypair = {'name': val.VLM_NAME,'value': val.VLM_PK}
                $scope.selectCodes.VILL.push(keypair);
            });
            $scope.$apply(function () {$scope.selectCodes.VILL;});
        };

        this.setCenters = function(results){
            ////console.log(results);
            $.each(results,function(ind, val){
                $scope.selectCodes.CTR || ($scope.selectCodes.CTR = []); //init if null
                var keypair = {'name':val.CTR_CENTER_NAME+" ("+val.VLM_NAME+")" , 'value':val.CTR_PK };
                $scope.selectCodes.CTR.push(keypair);
            });
            $scope.$apply(function () {$scope.selectCodes.CTR;});
        };

        $scope.updateAddress = function(){
            ////console.log($scope.address.centerid);
            myDB.execute("SELECT * FROM T_VILLAGE_MASTER, T_DISTRICT_MASTER, T_SUB_DISTRICT_MASTER, T_CENTER_MASTER WHERE DSM_PK = SDSM_DSM_PK AND SDSM_PK = VLM_SDSM_PK AND VLM_PK = CTR_VLM_PK AND CTR_PK = "+$scope.address.centerid+"  ", function(results){
                //console.log(results[0]);
                $scope.updateSecond(results);

            });
        };
        $scope.updateSecond = function(results){

            ////console.log($scope.address);
            $scope.$apply(function(){
                $scope.address.village.val = results[0].VLM_PK;
                $scope.address.village.name = results[0].VLM_NAME;
                $scope.address.district = results[0].DSM_NAME;
                $scope.address.subdistrict = results[0].SDSM_NAME;
                $scope.address.province = results[0].DSM_PROVINCE_CODE;
            });
        };

        myDB.T_VILLAGE_MASTER.get(null,function(results){
            t.setVillages(results);
        });

        myDB.execute("SELECT * FROM T_CENTER_MASTER,T_VILLAGE_MASTER WHERE VLM_PK = CTR_VLM_PK ORDER BY VLM_NAME, CTR_CENTER_NAME",function(results){
            t.setCenters(results);
        });

/******************************************************************************
New Group functions here:
1) Grab unique group names and populate "Add to Group" field
******************************************************************************/
        $scope.existingGroups = null;
        $scope.selectedGroup = null;


        myDB.execute("SELECT *, count(distinct CLT_PK) as countClients, CLT_GROUP_ID,  GROUP_CONCAT(CLT_STATUS) as CLT_STATUS, CLT_VILLAGE  FROM T_CLIENT   WHERE CLT_STATUS not in (25,8,9) AND CLT_IS_GROUP_LEADER='Y' GROUP BY CLT_GROUP_ID, CLT_VILLAGE ", function(results){
            if(results.length<=0) return false;
            else{
                $scope.existingGroups = []; //init
                for(var k in results) $scope.existingGroups.push(results[k]);
                $scope.$apply();
            }
        });


        $scope.haveGroups = function(){ //check if any groups available
            if(!$scope.existingGroups) return false;
            return $scope.existingGroups.length>0;
        }

        $scope.addToExistingGroup = function(){

            //console.log($scope.address);
            //console.log($scope.currGroup);
            if($scope.currGroup==null){
              //  alert("Please select a group.");
                //alert(i18n.t("messages.EmptyGroup"));
                swal(i18n.t("messages.EmptyGroup"));
                return false;
            }

            var selectedGrp = $scope.currGroup;

            if(selectedGrp.countClients>=5){
                //alert("This group is full. Please choose another group.");
                //alert(i18n.t("messages.GroupFull"));
                swal(i18n.t("messages.GroupFull"));
                return false;
            }

            if(selectedGrp.CLT_VILLAGE != $scope.address.village.val){
                //alert(i18n.t("messages.LdrDiffVillage"));
                swal({
                    title: i18n.t("messages.Alert"),
                    text: i18n.t("messages.LdrDiffVillage"),
                    type: "warning",
                    confirmButtonColor: "#80C6C7",
                    confirmButtonText: i18n.t("buttons.Ok"),
                });

                return false;
            }

            var statuses = selectedGrp.CLT_STATUS.split(","); //for selected group, CLL_STATUS is a string of the leader's loan statuses
            for(var i=0;i<statuses.length;i++){
                if([40,21].indexOf(parseInt(statuses[i]))!=-1){
                  //  alert("Group leader not yet applied for new loan.");
                    //alert(i18n.t("messages.GroupLeaderHasNotApplyForNewLoan"));
                    swal(i18n.t("messages.GroupLeaderHasNotApplyForNewLoan"));
                    return false;
                }
            }

            //add user to grp
            $scope.actionSubmit(selectedGrp.CLT_GROUP_ID);
            return true;
        };


        $scope.checkboxChange = function(e){
            //console.log(e);
        }

        $scope.alignDivs = function() {


        }

        setTimeout(function(){
            $scope.alignDivs();
        },100);

        setTimeout(function(){
            //$scope.addNewUpro(-1);
        },1000);


        var colwid = $('.grid').width() / 2;

        $('.grid').masonry({
          itemSelector: '.grid-item',
          columnWidth: colwid
        });

        /******************************************
        // Prepare data
        ******************************************/
        $scope.loadGroups = function(){

            $scope.savedGrps = [];

            var lg = "";
            lg += " SELECT CLT_MOB_NEW,CLT_FAMILY_CARD_NO,CLT_DOB,CLT_MOTHER_NM,CLT_MOTHER_DOB,CLT_STATUS, CLL_STATUS, CLT_PK, ";
            lg += " CLT_BRC_PK, CLT_FULL_NAME, CLT_OTH_REG_NO, CLL_PK, CLL_CLT_PK, CLT_GROUP_ID, CLT_IS_GROUP_LEADER, CLL_MOB_NEW, CLT_CENTER_ID, CTR_CENTER_NAME";
            lg += "  FROM T_CLIENT_LOAN, T_CLIENT, T_CENTER_MASTER WHERE CLL_CLT_PK = CLT_PK AND CLT_CENTER_ID = CTR_PK AND CLL_STATUS!=8 GROUP BY CLL_CLT_PK";
            myDB.execute(lg,function(results){
                //console.log(results);
                var res = [];
                $.each(results, function(ind,val){
                    var obj = {};
                    for(var k in val){ obj[k] = val[k]; }
                    res.push(obj);
                }); //does a copy of the results, for some reason using results directly won't work

                results = res;

                $.each(results,function(ind, val){
                    if(!val.CLT_GROUP_ID){ //if member is not in a group
                        $scope.available.push(val); //add to available
                    }else{
                        //add to existing groups
                        //var grp = $scope.findGroup(val.CLT_GROUP_ID);
                        var thisgroupid = val.CLT_GROUP_ID;


                        if(val.CLT_PK == $scope.clientPK){
                            thisgroupid = $scope.group.groupid;
                            val.CLT_IS_GROUP_LEADER = 'N';
                        }
                        var grp = $scope.findGroup(thisgroupid,val.CLT_CENTER_ID,val.CTR_CENTER_NAME);
                        //console.log(val);
                        grp.MEMBERS.push(val);
                        //console.log(grp);
                    }
                });

                setTimeout(function(){
                    $scope.$apply();
                    $scope.refreshUI();
                },1)

            });
        };

        /******************************************
        // Make sure UI is showing the right values, an angular/jquery mobile fix
        ******************************************/
        $scope.refreshUI = function(){

            $scope.grouptext = i18n.t("messages.Group");
            $scope.actiontext = i18n.t("messages.Action");

            $scope.createGroup = '0';
            if($scope.available[$scope.createGroup])
                $("#createGroup").parent().find('span').html($scope.available[$scope.createGroup].CLT_FULL_NAME);

            if($scope.savedGrps[0]){
                $scope.currGroup = $scope.savedGrps[0].GROUP_ID;
                $("#addToGroup").parent().find('span').html($scope.savedGrps[0].GROUP_ID);
            }
            setTimeout(function(){
                var $container = $('.grid');
                $container.masonry('reloadItems');
                $container.masonry();
                $scope.isitDone();

            },500);

        }


        /******************************************
        //Return only a list of unique clients in the group (so that multiple loans won't stack in the list)
        ******************************************/
        $scope.removeGroup = function(ind){
            var cmd = [];
            var group = $scope.savedGrps[ind]; //given ID, take the group object
            var remove = [];
            $.each(group.MEMBERS,function(id, mem){
                if(mem.CLT_MOB_NEW=="1"&&mem.CLT_IS_GROUP_LEADER!="Y"){ //remove new members who are not leaders
                    $scope.available.push(mem);         //add them to available list
                    mem['CLT_IS_GROUP_LEADER'] = 'N';   //logically this should not happen but set to N anyway

                    var c = "UPDATE T_CLIENT SET CLT_IS_GROUP_LEADER='N', CLT_GROUP_ID=null WHERE CLT_PK="+mem.CLT_PK;
                    cmd.push(c);

                    remove.push(id); //required to properly remove members below
                } else if (mem.CLT_MOB_NEW=="1") {
                     $scope.available.push(mem);         //add them to available list
                    mem['CLT_IS_GROUP_LEADER'] = 'N';   //logically this should not happen but set to N anyway

                    var c = "UPDATE T_CLIENT SET CLT_IS_GROUP_LEADER='N', CLT_GROUP_ID=null WHERE CLT_PK="+mem.CLT_PK;
                    cmd.push(c);

                    remove.push(id); //required to properly remove members below
                }
            });

            for(var i=remove.length-1;i>=0;i--){ group.MEMBERS.splice(remove[i],1); } //remove backwards

            //remove group if its empty
            if(group.MEMBERS.length<=0){
                $scope.savedGrps.splice(ind,1); //delete the whole group lol
                if($scope.savedGrps.length<=0){ //no more groups
                    $("#addToGroup").parent().find('span').html("&nbsp;"); //reset UI
                    $scope.currGroup = null;

                }
            }

            myDB.dbShell.transaction(function(tx){
                $.each(cmd, function(i,v){tx.executeSql(v);});
            }, function(err){
               // alert("Error encountered saving into database.");
                alert(i18n.t("messages.SaveClientError"));
                window.location.href = "groupclients.html";
                return true;
            }, function(suc){});

            $scope.refreshUI();

        };

        $scope.removeClientGroup = function(grpid){

            myDB.execute("DELETE FROM T_CLIENT_GROUP WHERE CLG_MOB_NEW = 1 AND CLG_ID = '"+grpid+"'");
            $scope.getMaxGrpId();

        }

        function checkFunds(fundObj){
            var cols = 0;
            var totalcols = 7;
            for(var key in fundObj){

                cols++;
                if((["originalamt","balance","repaymentperwk"].indexOf(key)>-1 && isNaN(fundObj[key]))
                   )
                //{alert("There is an empty field in your borrowed funds entry"); return false;}
                {
                    //alert(i18n.t("messages.EmptyBorrowedFund"));
                    swal({
                        title: i18n.t("messages.Alert"),
                        text: i18n.t("messages.EmptyBorrowedFund"),
                        type: "error",
                        confirmButtonColor: "#80C6C7",
                        confirmButtonText: "Ok",
                    });
                    return false;
                }
            }
            // if(cols<totalcols){alert("There is an empty field in your borrowed funds entry"); return false;}
           
            if(cols<totalcols){
                //alert(i18n.t("messages.EmptyBorrowedFund"));
                swal({
                    title: i18n.t("messages.Alert"),
                    text: i18n.t("messages.EmptyBorrowedFund") + 1,
                    type: "error",
                    confirmButtonColor: "#80C6C7",
                    confirmButtonText: "Ok",
                });
                return false;
            }
            return true;
        }

        $scope.removeClient = function(ind,mem){
            var cmd = [];
            var group = $scope.savedGrps[ind]; //given ID, take the group object
            var remove = [];
            var groupid = mem.CLT_GROUP_ID;
            //console.log(groupid);

            if(mem.CLT_IS_GROUP_LEADER=="Y"){
                $scope.removeGroup(ind);
                $scope.removeClientGroup(groupid);
            } else {

                var id = $.inArray(mem, group.MEMBERS);

                if(mem.CLT_MOB_NEW=="1"&&mem.CLT_IS_GROUP_LEADER!="Y"){ //remove new members who are not leaders
                    $scope.available.push(mem);         //add them to available list
                    mem['CLT_IS_GROUP_LEADER'] = 'N';   //logically this should not happen but set to N anyway

                    var c = "UPDATE T_CLIENT SET CLT_IS_GROUP_LEADER='N', CLT_GROUP_ID=null WHERE CLT_PK="+mem.CLT_PK;
                    cmd.push(c);

                    remove.push(id); //required to properly remove members below
                } else if (mem.CLT_MOB_NEW=="1") {
                    $scope.available.push(mem);         //add them to available list
                    mem['CLT_IS_GROUP_LEADER'] = 'N';   //logically this should not happen but set to N anyway

                    var c = "UPDATE T_CLIENT SET CLT_IS_GROUP_LEADER='N', CLT_GROUP_ID=null WHERE CLT_PK="+mem.CLT_PK;
                    cmd.push(c);

                    remove.push(id); //required to properly remove members below
                }

                group.MEMBERS.splice(id,1);
                //for(var i=remove.length-1;i>=0;i--){ group.MEMBERS.splice(remove[i],1); } //remove backwards

                //remove group if its empty
                if(group.MEMBERS.length<=0){
                    $scope.savedGrps.splice(ind,1); //delete the whole group lol
                    if($scope.savedGrps.length<=0){ //no more groups
                        $("#addToGroup").parent().find('span').html("&nbsp;"); //reset UI
                        $scope.currGroup = null;
                        $scope.removeClientGroup(groupid);
                    }
                }

                myDB.dbShell.transaction(function(tx){
                    $.each(cmd, function(i,v){tx.executeSql(v);});
                }, function(err){

                    return true;
                }, function(suc){});

                $scope.refreshUI();

            }

        };

        /******************************************
        Create a new group
        ******************************************/
        $scope.createNewGroup = function(){
            //console.log($scope.available);

            if($scope.createGroup=="undefined"||$scope.createGroup==undefined){ //!Note: createGroup holds the client's index we will be using
                                                                                //sorry for the bad naming convention
               // alert("No client selected.");
                alert(i18n.t("messages.NoClientSelect"));
                return false;
            }

            //prepare group id
            // var newID = new Date();
            // newID = sessionStorage.getItem("USER_PK")+("0"+newID.getDate()).slice(-2)+""+("0"+(newID.getMonth()+1)).slice(-2)+""+(newID.getFullYear()+"").slice(-2)+"-"+("0"+newID.getHours()).slice(-2)+""+("0"+newID.getMinutes()).slice(-2)+""+("0"+newID.getSeconds()).slice(-2)+"";//+("000"+newID.getMilliseconds()).slice(-4)
            var BRC_PK = parseInt(sessionStorage.getItem("BRC_PK"));
            var newName = "GROUP "+$scope.maxgroupid;
            var newID = $scope.maxgroupid;

            myDB.execute("INSERT INTO T_CLIENT_GROUP VALUES (null, "+parseInt($scope.maxgroupid)+", "+BRC_PK+", "+$scope.address.centerid+", '"+newID+"', '"+newName+"', 1 )",function(results){
                $scope.getMaxGrpId();
            });

            var client = $scope.available[$scope.createGroup]; //access the list of available clients with the client's index (client's index=createGroup)
            client.CLT_IS_GROUP_LEADER = 'Y'; //make group leader

            $scope.addClientToGroup($scope.createGroup,newID);
        };

        $scope.addGroupCount = function(){
            var grpcnt = $scope.maxgroupid;
            //console.log(grpcnt);
            grpcnt = parseInt(grpcnt + 1);
            //console.log(grpcnt);
            var groupid = grpcnt;
            var zcnt = "";
            for(var i=0; i < parseInt(3-groupid.toString().length); i++){
                zcnt = zcnt.concat("0");
            }
            groupid = zcnt.concat(groupid);
            //console.log(groupid);

            $scope.getMaxGrpId();
        }

        $scope.getMaxGrpId = function(centerid){

            if(centerid === null || centerid == undefined) centerid = $scope.address.centerid;

            ////console.log("SELECT CLG_CTR_PK, CLG_ID FROM T_CLIENT_GROUP WHERE CLG_CTR_PK='"+ centerid +"'  ORDER BY CLG_ID DESC LIMIT 1");
            myDB.execute("SELECT CLG_CTR_PK, CLG_ID FROM T_CLIENT_GROUP WHERE CLG_CTR_PK='"+ centerid +"'  ORDER BY CLG_ID DESC LIMIT 1",function(results){

                ////console.log(results.length);
                var groupid = "001";
                if(results.length > 0){
                    //console.log(results[0].CLG_ID);

                    groupid = parseInt(results[0].CLG_ID) + 1;
                    //console.log(groupid);
                    //console.log(groupid.toString().length);
                    var zcnt = "";
                    for(var i=0; i < parseInt(3-groupid.toString().length); i++){
                        zcnt = zcnt.concat("0");
                    }
                    //console.log(zcnt);
                    groupid = zcnt.concat(groupid);
                    //console.log(groupid);
                }

                $scope.maxgroupid = groupid;
            });
        }
        $scope.getMaxGrpId(90);

        /******************************************
        Add member to existing group
        ******************************************/
        $scope.addToExistingGroup = function(){

            if($scope.createGroup=="undefined"||$scope.createGroup==undefined){
               // alert("No client selected.");
                //alert(i18n.t("messages.NoClientSelect"));
                swal(i18n.t("messages.NoClientSelect"),"error");
                return false;
            }

            if($scope.currGroup=="undefined"||$scope.currGroup==undefined){
               // alert("No group selected.");
                //alert(i18n.t("messages.NoGroupSelect"));
                swal(i18n.t("messages.NoGroupSelect"),"error");
                return false;
            }

         
            var client = $scope.available[$scope.createGroup];


            if(client.CLT_VILLAGE != $scope.getLeaderOf($scope.findGroup($scope.currGroup)).CLT_VILLAGE) {
                swal({
                    title: i18n.t("messages.LdrDiffVillage")  ,
                    type: "warning",
                    confirmButtonColor: "#80C6C7",
                    confirmButtonText: i18n.t("buttons.Ok"),
                });
            } else {
                 $scope.addClientToGroup($scope.createGroup,$scope.currGroup);
            }
            return false;

        }

        /******************************************
        Count number of members in the group
        ******************************************/
        $scope.countMembers = function(group){
            var pk = [];
            var client;
            for(var key in group.MEMBERS){
                client = group.MEMBERS[key];
                if(pk.indexOf(client.CLT_PK)==-1){
                    pk.push(client.CLT_PK); //client PK does not exist in our list yet
                }
            }
            return pk.length;
        }

        $scope.addClientToGroup = function(clientid,grpid){
            //perform check here

            var client = $scope.available[clientid];
            var grp = $scope.findGroup(grpid);

            if($scope.createGroup=="undefined"||$scope.createGroup==undefined){
             //   alert("No client selected.");
                //swal(i18n.t("messages.NoClientSelect"));
                swal({
                    title: i18n.t("messages.NoClientSelect"),
                    type: "warning",
                    confirmButtonColor: "#80C6C7",
                    confirmButtonText: i18n.t("buttons.Ok"),
                });
                return false;
            } else if($scope.countMembers(grp)>=$scope.maxMembers){
               // alert("Group is full.");
                //swal(i18n.t("messages.GroupFull"));
                swal({
                    title: i18n.t("messages.GroupFull"),
                    type: "warning",
                    confirmButtonColor: "#80C6C7",
                    confirmButtonText: i18n.t("buttons.Ok"),
                });
                return false;
            } else {
                var leader = $scope.getLeaderOf(grp);

                if(!leader){
                    //continue
                }else{
                    if([40,21].indexOf(parseInt(leader.CLT_STATUS))!=-1){ //if leader has not applied for new loan
                       // alert("Group leader not yet applied for new loan.");
                        alert(i18n.t("messages.GroupLeaderHasNotApplyForNewLoan"));
                        return false;
                    }
                    if(leader.CLT_PK==client.CLT_PK)       //adding same client to group
                        client.CLT_IS_GROUP_LEADER = 'Y';   //set this new add as leader too. leader could be renewing loan
                    else
                        client.CLT_IS_GROUP_LEADER = 'N';
                }

                client.CLT_GROUP_ID = grpid;         //set group ID
                grp.MEMBERS.push(client);            //add client to group
                $scope.available.splice(clientid,1); //and remove from list of available clients

                var cmd = "UPDATE T_CLIENT SET CLT_IS_GROUP_LEADER='"+client.CLT_IS_GROUP_LEADER+"', CLT_GROUP_ID='"+grpid+"' WHERE CLT_PK="+client.CLT_PK;
                myDB.dbShell.transaction(function(tx){
                    tx.executeSql(cmd); //update database
                }, function(err){
                    //alert("Error encountered saving into database.");
                    alert(i18n.t("messages.SaveClientError"));
                    window.location.href = "groupclients.html";
                    return true;
                }, function(suc){});

                $scope.refreshUI(); //handle UI
            }
        };

        $scope.belongToGroup = function(group){

            var isInGroup = false;

            $.each(group.MEMBERS,function(m,mem){
                if(parseInt(mem.CLL_CLT_PK) == parseInt(CLT_PK)){
                    isInGroup = true;
                }
            })

            return isInGroup;

        }

        $scope.changeGroup = function(group){

            var groupid = group.GROUP_ID;
            $scope.group.groupid = groupid;

            $scope.updateClientData('group');

        }

        /******************************************
        // Returns a new group object or an existing group given grp name
        ******************************************/
        $scope.findGroup = function(grpid,centerid,centername){
            //find the right group to put into
            var grp = null;
            var found = false;

            for(var key in $scope.savedGrps){
                if($scope.savedGrps[key].GROUP_ID==grpid && parseInt($scope.savedGrps[key].CENTER.value) == parseInt(centerid)){
                    grp = $scope.savedGrps[key];
                    found = true;
                }
            }
            //console.log($scope.savedGrps);
            if(!found){//if doesn't exist create the group

                var newgrp = {
                    GROUP_ID:grpid,
                    MEMBERS:[],
                    CENTER: {
                        value: parseInt(centerid),
                        name: centername
                    },
                    CENTERID : parseInt(centerid),
                };


                $scope.savedGrps.push(newgrp);
                return newgrp;

            } else {
                //console.log(grp);
                return grp;
            }
        };

        $scope.memeberFilter = function() {
            return $scope.groupmembers.filter( mem => {
                console.log($scope.witnesses);
                var exist = false;
                if( mem.CLT_PK == $scope.client.CLT_PK) {
                    exist = true;
                }
                if (!exist) {
                    for (let w = 0; w < $scope.witnesses.length; w++) {
                        const wit = $scope.witnesses[w];
                        if ( wit.witness_pk == mem.CLT_PK && wit.hasSigned) {
                            exist = true;
                        }
                    }
                }
                return !exist;
            })
        }

        $scope.productAvailable = function(product,newp){

            var isActive = false;
            //console.log("checking "+product.PRM_CODE);

            if($scope.updated.applicantdata.olddata == undefined) return true;
            if($scope.updated.applicantdata.olddata.products == undefined) return true;

            //console.log($scope.updated.applicantdata.olddata.products);

            $.each($scope.updated.applicantdata.olddata.products,function(p,prd){
                console.log('existing products');
                console.log(prd);
                if(prd.PRM_CODE == product.PRM_CODE && prd.CPM_STATUS_PK == 56){
                    if(newp == "check"){
                        if(product.PRM_CODE=='002.0004'){
                            var pension = product;
                            // var pen_mat = pension.CPM_PRM_MATURITY.replace("Year").trim();
                            var pen_start = pension.CPM_START_MATURITY_DATE;
                            var pen_end = pension.CPM_END_MATURITY_DATE;

                            var CurrentDate = new Date();

                            if(pen_start != "null" && CurrentDate > pen_end){
                                isActive = true;
                            } else if (pen_start == "null"){
                                isActive = true;
                            }

                        }else {
                            isActive = true;
                        }
                    } else {
                        if(newp == 'add'){
                            prd.isActive = true;
                        }
                    }

                }
            })

            //console.log(isActive);
            if(isActive){
                return false;
            }
            return true;

        }

        /******************************************
        //count number of clients in available list
        ******************************************/
        $scope.countAvailable = function(){
            var ttl = 0;
            for(var key in $scope.available) ttl++;
            return ttl;
        };

        $scope.isitDone = function() {

            var ttl = 0;
            for(var key in $scope.available) ttl++;

            if(ttl > 0){
                $('.addclientdone').hide();
            } else {
                $('.addclientdone').fadeIn();
            }
        }

        /******************************************
        //Get leader of Group
        ******************************************/
       $scope.getLeaderOf = function(group){

            if(group == undefined || group == '' || group == null) return false;

            var leader = null;
            // //console.log($scope.savedGrps);
            // //console.log(group);
            $.each($scope.savedGrps,function(i,grp){
    //            //console.log(grp.GROUP_ID+" "+group);
                if(grp.GROUP_ID == group){
                    var members = grp.MEMBERS;
                    for(var memid in members){
      //                  //console.log(members[memid].CLT_IS_GROUP_LEADER);
                        if(members[memid].CLT_IS_GROUP_LEADER=='Y') {
                            // return members[memid];//.CLT_FULL_NAME
                            leader = members[memid];
                            return leader;
                        }
                    }
                }
            });

            return leader;
        }

        /******************************************
        //Count number of new members in current group
        ******************************************/
        $scope.newInGrp = function(group){
            var count = 0;
            for(var memid in group.MEMBERS){
                //if(group.MEMBERS[memid].CLL_MOB_NEW==1&&group.MEMBERS[memid].CLL_IS_GROUP_LEADER!="Y") count++;//.CLT_FULL_NAME
                if(group.MEMBERS[memid].CLL_MOB_NEW==1) count++;
            }
            return count;
        }

        /******************************************
        //Return only a list of unique clients in the group (so that multiple loans won't stack in the list)
        ******************************************/
        $scope.filterGroupNames = function(group){
            var filter = {};

            $.each(group, function(id,member){
                if(filter[member.CLT_PK]==null||member.CLL_MOB_NEW=="1"){

                    if(member.CLT_IS_GROUP_LEADER != "Y"){
                        filter[member.CLT_PK] = member;
                    }

                }
            });
            return filter;
        }


        $scope.checkChanges = function( ){

            var haveChanges = false;
            //console.log($scope.old_client);
            if( $scope.old_client == undefined ) return false;

            if(
                $scope.applicantdata.olddata!=$scope.old_client.CLT_FULL_NAME||
                $scope.applicantdata.gender!=$scope.old_client.CLT_GENDER||
                $scope.applicantdata.placeofbirth!=$scope.old_client.CLT_PLACE_OF_BIRTH||
                $scope.applicantdata.familycardno!=$scope.old_client.CLT_FAMILY_CARD_NO||
                $scope.applicantdata.ktpno!=$scope.old_client.CLT_OTH_REG_NO||
                $scope.applicantdata.dateofbirth!=$scope.old_client.CLT_DOB||
                $scope.applicantdata.age!=$scope.old_client.CLT_AGE||
                $scope.applicantdata.highested!=educ.value){

                haveChanges = true;
            }

        }

        $scope.checkFieldChange = function(type,key){
            var ret = false;
            //console.log($scope.updated[key].olddata[key]);
        }

        $scope.updateClientData = function(type){

            var BRC_PK = parseInt(sessionStorage.getItem("BRC_PK"));
            var USER_PK = parseInt(sessionStorage.getItem("USER_PK"));

            var applicantdata = $scope.applicantdata;
            var husbandinfo = $scope.husbandinfo;
            var housemotherinfo = $scope.housemotherinfo;
            var husbandinfo = $scope.husbandinfo;
            var businessinfo = $scope.businessinfo;
            var address = $scope.address;
            var welfareStatus = $scope.welfareStatus;
            var workcap = $scope.workcap;
            var houseinfo = $scope.houseinfo;
                houseinfo.housetype = null;
                //console.log("line999");
                //console.log(houseinfo);
            var choices = $scope.choices;
            var housetotal = $scope.housetotal;

            if(husbandinfo.maritalstatus != 'M'){
                workcap.husband = 0;
            }

            var borrowedFunds = $scope.borrowedFunds;
            var houseIncomes = $scope.houseIncomes;
            var products = $scope.products;
            var signature = $scope.signature;
            var blob = $scope.blob;
            var groupdata  = $scope.group;

            workcap.husband = workcap.husband == null ? 0 : workcap.husband;

            // DATE OF BIRTH
            if(applicantdata.dateofbirth != undefined && applicantdata.dateofbirth.toString().indexOf("/") !== -1){
                var dob = applicantdata.dateofbirth.split('/');
                var d = new Date(dob[2],dob[1],dob[0]);
            } else {
                var d = new Date(applicantdata.dateofbirth);
            }

            var appAge = applicantdata.age+"";
            var appdateofbirth = d.getDate()+"/"+(d.getMonth())+"/"+d.getFullYear();//+" 00:00:00";

            // MOTHER'S DATE OF BIRTH
            if(housemotherinfo.motherdob != undefined && housemotherinfo.motherdob.toString().indexOf("/") !== -1){
                var mdob = housemotherinfo.motherdob.split('/');
                var d1 = new Date(mdob[2],mdob[1],mdob[0]);
            } else {
                var d1 = new Date(housemotherinfo.motherdob);
            }

            var motherAge = housemotherinfo.motherage+"";
            var motherdob = d1.getDate()+"/"+(d1.getMonth())+"/"+d1.getFullYear();//+" 00:00:00";

            var stayinhouse = "N";
            if(husbandinfo.livesinhouse=='YES') stayinhouse="Y";

            myDB.execute("SELECT CLT_PK FROM T_CLIENT_NEW WHERE CLT_PK="+CLT_PK,function(res){
                if(res.length == 0){
                    myDB.execute("INSERT INTO T_CLIENT_NEW SELECT * FROM T_CLIENT WHERE CLT_PK="+CLT_PK,function(e){
                        $scope.checkUpdate(type);
                    });
                } else {
                    $scope.checkUpdate(type);
                }
            });

            $scope.checkUpdate = function(type){

                if(type != 'loan'){

                    myDB.execute("SELECT CLT_PK FROM T_CLIENT_NEW WHERE CLT_PK="+CLT_PK,function(res){
                        if(res.length == 0){ // IF NO NEW RECORD CREATE
                            myDB.execute("INSERT INTO T_CLIENT_NEW SELECT * FROM T_CLIENT WHERE CLT_PK="+CLT_PK,function(e){
                                myDB.execute("SELECT CLL_CLT_PK FROM T_CLIENT_LOAN_NEW WHERE CLL_CLT_PK="+CLT_PK,function(resl){
                                        if(resl.length == 0){
                                            myDB.execute("INSERT INTO T_CLIENT_LOAN_NEW SELECT * FROM T_CLIENT_LOAN WHERE CLL_CLT_PK="+CLT_PK+" LIMIT 1",function(el){
                                                myDB.execute("SELECT CEF_PK FROM T_CLIENT_BORROWED_FUNDS_NEW WHERE CEF_CLT_PK="+CLT_PK,function(res2){
                                                    if (res2.length == 0) {
                                                        myDB.execute("INSERT INTO T_CLIENT_BORROWED_FUNDS_NEW SELECT * FROM T_CLIENT_BORROWED_FUNDS WHERE CEF_CLT_PK="+CLT_PK);
                                                    }
                                                });
                                                myDB.execute("SELECT CLI_PK FROM T_CLIENT_INCOME_NEW WHERE CLI_CLT_PK="+CLT_PK,function(res3){
                                                    if(res3.length == 0){
                                                        myDB.execute("INSERT INTO T_CLIENT_INCOME_NEW SELECT * FROM T_CLIENT_INCOME WHERE CLI_CLT_PK="+CLT_PK);
                                                    }
                                                });
                                                myDB.execute("UPDATE T_CLIENT_NEW SET  CLT_CREATED_DATE='"+moment().format('YYYY-MM-DD HH:mm:ss')+"',CLT_MOB_NEW=2 WHERE CLT_PK="+CLT_PK);
                                                myDB.execute("UPDATE T_CLIENT_LOAN_NEW SET CLL_MOB_NEW=2 WHERE CLL_CLT_PK="+CLT_PK);
                                                setTimeout(function(){
                                                    $scope.updateApplicantData(type);
                                                },300);
                                            })
                                        } else {
                                            myDB.execute("UPDATE T_CLIENT_NEW SET CLT_CREATED_DATE='"+moment().format('YYYY-MM-DD HH:mm:ss')+"',CLT_MOB_NEW=2 WHERE CLT_PK="+CLT_PK);
                                            myDB.execute("UPDATE T_CLIENT_LOAN_NEW SET CLL_MOB_NEW=2 WHERE CLL_CLT_PK="+CLT_PK);
                                            setTimeout(function(){
                                                $scope.updateApplicantData(type);
                                            },300);
                                        }
                                });
                            });
                        } else {

                            myDB.execute("SELECT CLL_CLT_PK FROM T_CLIENT_LOAN_NEW WHERE CLL_CLT_PK="+CLT_PK,function(resl){
                                if(resl.length == 0){
                                    myDB.execute("INSERT INTO T_CLIENT_LOAN_NEW SELECT * FROM T_CLIENT_LOAN WHERE CLL_CLT_PK="+CLT_PK+" LIMIT 1",function(el){
                                        myDB.execute("SELECT CEF_PK FROM T_CLIENT_BORROWED_FUNDS_NEW WHERE CEF_CLT_PK="+CLT_PK,function(res2){
                                            if (res2.length == 0) {
                                                myDB.execute("INSERT INTO T_CLIENT_BORROWED_FUNDS_NEW SELECT * FROM T_CLIENT_BORROWED_FUNDS WHERE CEF_CLT_PK="+CLT_PK);
                                            }
                                        });
                                        myDB.execute("SELECT CLI_PK FROM T_CLIENT_INCOME_NEW WHERE CLI_CLT_PK="+CLT_PK,function(res3){
                                            if(res3.length == 0){
                                                myDB.execute("INSERT INTO T_CLIENT_INCOME_NEW SELECT * FROM T_CLIENT_INCOME WHERE CLI_CLT_PK="+CLT_PK);
                                            }
                                        });
                                        setTimeout(function(){
                                            myDB.execute("UPDATE T_CLIENT_NEW SET CLT_CREATED_DATE='"+moment().format('YYYY-MM-DD HH:mm:ss')+"',CLT_MOB_NEW=2 WHERE CLT_PK="+CLT_PK);
                                            myDB.execute("UPDATE T_CLIENT_LOAN_NEW SET CLL_MOB_NEW=2 WHERE CLL_CLT_PK="+CLT_PK);
                                            $scope.updateApplicantData(type);
                                        },300);

                                    })
                                } else {
                                   setTimeout(function(){
                                        myDB.execute("UPDATE T_CLIENT_NEW SET CLT_CREATED_DATE='"+moment().format('YYYY-MM-DD HH:mm:ss')+"',CLT_MOB_NEW=2 WHERE CLT_PK="+CLT_PK);
                                        myDB.execute("UPDATE T_CLIENT_LOAN_NEW SET CLL_MOB_NEW=2 WHERE CLL_CLT_PK="+CLT_PK);
                                        $scope.updateApplicantData(type);
                                    },300);
                                }
                            });
                        }
                    });


                } else if (type == 'loan'){

                    myDB.execute("UPDATE T_CLIENT SET CLT_CREATED_DATE='"+moment().format('YYYY-MM-DD HH:mm:ss')+"' WHERE CLT_PK="+CLT_PK);
                    var query = "SELECT * FROM (SELECT MAX(CLT_PK) as mclt_pk FROM T_CLIENT) AS TC INNER JOIN (SELECT MAX(CLL_PK) as mcll_pk FROM T_CLIENT_LOAN) AS TCL INNER JOIN (SELECT MAX(CEF_PK) as mcef_pk FROM T_CLIENT_BORROWED_FUNDS) AS TCEF INNER JOIN (SELECT MAX(CLI_PK) as mcli_pk FROM T_CLIENT_INCOME) AS TCLI INNER JOIN (SELECT MAX(CPM_PK) as mcpm_pk FROM T_CLIENT_PRODUCT_MAPPING) AS TCPM INNER JOIN (SELECT MAX(CAL_PK) as mcal_pk FROM T_CLIENT_ASSET_LIST) AS TACL";
                    myDB.execute(query, function(results){
                        if(results.length<0) return false;

                        $scope.CLT_PK = $scope.clientPK;
                        $scope.CLL_PK = results[0].mcll_pk+1;
                        $scope.CPM_PK = results[0].mcpm_pk+1;
                        $scope.CEF_PK = results[0].mcef_pk+1;
                        $scope.CLI_PK = results[0].mcli_pk+1;

                        $scope.updateApplicantData(type);

                    });
                }

            }
            var branchpk = parseInt(sessionStorage.getItem("BRC_PK"));
            var fopk = sessionStorage.getItem("USER_PK");
            var groupid = sessionStorage.getItem("GROUP_ID");


            var prep = [];

            $scope.updateApplicantData = function(type){

                var branchpk = parseInt(sessionStorage.getItem("BRC_PK"));
                var fopk = sessionStorage.getItem("USER_PK");
                var groupid = sessionStorage.getItem("GROUP_ID");

                var query = [];

                var comm = {
                    query: null,
                    values: []
                }

                var isHomeless = ($scope.applicantdata.homeless != 'YES') ? 'N' : 'Y' ;
                var tsunamiAffected = (sanitize($scope.applicantdata.tsunamiAffected) == 'YES' ? 1 : 0);
                var quakeAffected = (sanitize($scope.applicantdata.quakeAffected) == 'YES' ? 1 : 0);
                var haveSavings = (sanitize($scope.applicantdata.haveSavings) == 'YES' ? 1 : 0);
                var haveInsurance = (sanitize($scope.applicantdata.haveInsurance) == 'YES' ? 1 : 0);
                var havecooperate = 0;
                var haveotherbank = 0;
                var haveinstitutes = 0;
                if(isHomeless == 'Y') $scope.housetotal = 0;

                for(var key in $scope.borrowedFunds){
                    if($scope.borrowedFunds[key].loanfrom == "I") haveinstitutes = 1;
                    if($scope.borrowedFunds[key].loanfrom == "B") haveotherbank = 1;
                    if($scope.borrowedFunds[key].loanfrom == "C") havecooperate = 1;
                }

                var totalincome = 0;
                for(var key in $scope.houseIncomes){
                    totalincome = $scope.getTotalIncome();
                }

                var incomepercapita =  totalincome;
                if($scope.housemotherinfo.noofmembers > 0) incomepercapita = parseFloat(totalincome / $scope.housemotherinfo.noofmembers);

                if(type == 'applicantdata'){

                    comm.query = "UPDATE T_CLIENT_NEW SET CLT_FULL_NAME=? ,"+
                            " CLT_NICK_NAME=? ,"+
                            " CLT_GENDER=? ,"+
                            " CLT_HIGH_EDU=? ,"+
                            " CLT_PLACE_OF_BIRTH=?,"+
                            " CLT_DOB=?,"+
                            " CLT_FAMILY_CARD_NO=?,"+
                            " CLT_CLEINT_ID=?,"+
                            " CLT_OTH_REG_NO=?,"+
                            " CLT_AGE=?,"+
                            " CLT_HIGH_EDU_OTHER=?,"+
                            " CLT_MOB_NEW=2" +
                            " WHERE CLT_PK="+CLT_PK;

                    var vals = [];
                    vals.push(applicantdata.fullname);
                    vals.push(applicantdata.nickname);
                    vals.push(applicantdata.gender);
                    vals.push(applicantdata.highested);
                    vals.push(applicantdata.placeofbirth);
                    vals.push(appdateofbirth);
                    vals.push(applicantdata.familycardno);
                    vals.push(applicantdata.clientno);
                    vals.push(applicantdata.ktpno);
                    vals.push(applicantdata.age);
                    vals.push(applicantdata.highestedothers);

                    comm.values.push(vals);

                    prep.push(comm);

                    var comm2 = {
                        query: null,
                        values: []
                    }

                    comm2.query = "UPDATE T_CLIENT_LOAN_NEW SET "+
                            " CLL_TSUNAMI_AFFECT=?, "+
                            " CLL_QUAKE_AFFECT=?, "+
                            " CLL_SAVING_ACCOUNT_EXISTS=?, "+
                            " CLL_INSURANCE_EXISTS=?, "+
                            " CLL_LOAN_COOPERATE_EXISTS=?, "+
                            " CLL_LOAN_BANK_EXISTS=?, "+
                            " CLL_FINANCE_INSTITUTE_ACCESS=?, "+ 
                            " CLL_MOB_NEW=2 "+
                            " WHERE CLL_CLT_PK="+CLT_PK;

                    comm2.values = [];
                    var vals = [];

                    vals.push(parseInt(tsunamiAffected));
                    vals.push(parseInt(quakeAffected));
                    vals.push(parseInt(haveSavings));
                    vals.push(parseInt(haveInsurance));
                    vals.push(parseInt(havecooperate));
                    vals.push(parseInt(haveotherbank));
                    vals.push(parseInt(haveinstitutes));

                    comm2.values.push(vals);

                    prep.push(comm2);
                    //console.log(prep);


                } else if (type == 'husbandinfo'){

                    var stayinhouse = "N";
                    if(husbandinfo.livesinhouse=='YES') stayinhouse="Y";

                    comm.query = "UPDATE T_CLIENT_NEW SET CLT_MARITAL_STATUS=?,"+
                            " CLT_HB_NAME=?,"+
                            " CLT_HB_ID=?,"+
                            " CLT_HB_LIVE_IN_HOUSE=?,"+
                            " CLT_HB_LIVE_PLACE=?,"+
                            " CLT_HB_COME_HOUSE=?,"+
                            " CLT_MOB_NEW=2" +
                            " WHERE CLT_PK="+CLT_PK;
                    var vals = [];
                    vals.push(husbandinfo.maritalstatus);
                    vals.push(husbandinfo.husbandname);
                    vals.push(husbandinfo.husbandidno.toString());
                    vals.push(stayinhouse);
                    vals.push(husbandinfo.whereis);
                    vals.push(husbandinfo.howoften);

                    comm.values.push(vals);

                    prep.push(comm);

                } else if (type == 'housemotherinfo'){

                    //alert('saving house');

                    comm.query = "UPDATE T_CLIENT_NEW SET CLT_NUM_HOUSE_MEM=?,"+
                            " CLT_NUM_CHILDREN=?,"+
                            " CLT_MOTHER_NM=?,"+
                            " CLT_MOTHER_DOB=?,"+
                            " CLT_MOTHER_AGE=?,"+
                            " CLT_MOB_NEW=2" +
                            " WHERE CLT_PK="+CLT_PK;

                    var vals = [];

                    if(housemotherinfo.noofchildren == "" || housemotherinfo.noofchildren == null) housemotherinfo.noofchildren = 0;
                    if(housemotherinfo.noofmembers == "" || housemotherinfo.noofmembers == null) housemotherinfo.noofmembers = 0;

                    vals.push(housemotherinfo.noofmembers);
                    vals.push(housemotherinfo.noofchildren);
                    vals.push(housemotherinfo.mothername);
                    vals.push(motherdob);
                    vals.push(housemotherinfo.motherage);

                    comm.values.push(vals);

                    prep.push(comm);

                    var comm2 = {
                        query: null,
                        values: []
                    };

                    var cmd = "DELETE FROM T_CLIENT_FAMILY_LIST_NEW WHERE CFL_CLT_PK="+CLT_PK;
                    myDB.execute(cmd);

                    comm2.query = "INSERT INTO T_CLIENT_FAMILY_LIST_NEW VALUES(null,?,?,?,?,?,?,?,?,?,?,?,?)";

                    for(var fkey in $scope.family){
                        if($scope.family[fkey].name != ""){ 
                            var isschooling = 0;
                            if($scope.family[fkey].isschooling != 'NO') isschooling = 1;
                            var gender = "F";
                            if($scope.family[fkey].gender !='Female') gender = "M";

                            var CFL_PK = 0;
                            var vals = [];
                            vals.push(CFL_PK); //CFL_PK
                            vals.push(sessionStorage.getItem("CMP_PK")); //CFL_CMP_ID
                            vals.push(CLT_PK); //CFL_CLT_PK
                            vals.push($scope.family[fkey].name);  //CFL_NAME
                            vals.push($scope.family[fkey].birthplace); //CFL_PLACE_OF_BIRTH
                            vals.push($scope.family[fkey].birthdate); //CFL_DOB
                            vals.push($scope.family[fkey].work); //CFL_WORK
                            vals.push($scope.family[fkey].famcode); //CFL_FAMILY_CODE
                            vals.push($scope.family[fkey].educode); //CFL_EDU_CODE
                            vals.push(isschooling); //CFL_STILL_IN_SCHOOL
                            vals.push(8); //CFL_STATUS
                            vals.push(gender); //CFL_GENDER

                            comm2.values.push(vals)
                        }

                    }

                    prep.push(comm2);

                } else if (type == 'businessinfo'){

                    comm.query = "UPDATE T_CLIENT_NEW SET CLT_BIZ=?,"+
                            " CLT_BIZ_EQUIPT=?,"+
                            " CLT_BOTH_BIZ=?,"+
                            " CLT_BOTH_BIZ_EQUIPT=?,"+
                            " CLT_HB_BIZ=?,"+
                            " CLT_HB_BIZ_EQUIPT=?,"+
                            " CLT_MOB_NEW=2" +
                            " WHERE CLT_PK="+CLT_PK;

                    var vals = [];
                    vals.push(businessinfo.typeofbusiness);
                    vals.push(businessinfo.busequipment);
                    vals.push(businessinfo.jointbusiness);
                    vals.push(businessinfo.jbequipment);
                    vals.push(businessinfo.husbandbusiness);
                    vals.push(businessinfo.hbequipment);

                    comm.values.push(vals);

                    prep.push(comm);

                } else if (type == 'address'){

                    comm.query = "UPDATE T_CLIENT_NEW SET CLT_VILLAGE=?,"+
                            " CLT_CENTER_ID=?,"+
                            " CLT_SUB_DISTRICT=?,"+
                            " CLT_DISTRICT=?,"+
                            " CLT_PROVINCE=?,"+
                            " CLT_POSTAL_CD=?,"+
                            " CLT_LAND_MARK=?,"+
                            " CLT_MOB_NO_1=?,"+
                            " CLT_MOB_NO_2=?,"+
                            " CLT_HUSB_MOB_NO=?,"+
                            " CLT_RT=?,"+
                            " CLT_STREET_AREA_NM=?,"+
                            " CLT_RW=?,"+
                            " CLT_MOB_NEW=2" +
                            " WHERE CLT_PK="+CLT_PK;

                    var vals = [];
                    vals.push(address.village.val);
                    vals.push(parseInt(address.centerid));
                    vals.push(address.subdistrict);
                    vals.push(address.district);
                    vals.push(address.province);
                    vals.push(address.postcode);
                    vals.push(address.landmark);
                    vals.push(address.mobile1);
                    vals.push(address.mobile2);
                    vals.push(address.husbmobile);
                    vals.push(address.rt);
                    vals.push(address.streetarea);
                    vals.push(address.rw);

                    comm.values.push(vals);

                    prep.push(comm);

                    var comm2 = {
                        query: null,
                        values: []
                    }

                    myDB.execute("DELETE FROM T_CLIENT_CHANGE_REQUEST WHERE CCR_CLT_PK="+CLT_PK ,function(res){

                    });

                    comm2.query = "INSERT INTO T_CLIENT_CHANGE_REQUEST VALUES(null," //new change request
                                    +"?,?,?,?,?,?,?,?,?,?,"
                                    +"?,?,?,?,?,?,?,?,?,?,"
                                    +"?,?,?,?,?,?,?,?,?,?,"
                                    +"?,?,?,?,?,?,?,?,?,?,"
                                    +"?,?,?,?,?,?,null,null,null,?)";

                    vals = [];

                    vals.push(CLT_PK);
                    vals.push(CLT_PK);
                    vals.push(branchpk);
                    vals.push($scope.applicantdata.fullname);
                    vals.push($scope.applicantdata.nickname);
                    vals.push($scope.husbandinfo.husbandname);
                    vals.push($scope.husbandinfo.husbandidno);
                    vals.push((($scope.husbandinfo.livesinhouse=="YES")?"Y":"N"));
                    vals.push($scope.applicantdata.familycardno);
                    vals.push($scope.applicantdata.clientno);

                    vals.push($scope.applicantdata.ktpno);
                    vals.push($scope.applicantdata.gender);
                    vals.push($scope.applicantdata.dateofbirth);
                    vals.push($scope.applicantdata.age);
                    vals.push($scope.applicantdata.highested);
                    vals.push(sanitize($scope.applicantdata.highestedothers));
                    vals.push($scope.husbandinfo.maritalstatus);
                    vals.push($scope.housemotherinfo.noofmembers);
                    vals.push($scope.housemotherinfo.noofchildren);
                    vals.push(sanitize($scope.husbandinfo.whereis));

                    vals.push($scope.husbandinfo.howoften);
                    vals.push($scope.housemotherinfo.mothername);
                    vals.push($scope.housemotherinfo.motherdob);
                    vals.push($scope.housemotherinfo.motherage);
                    vals.push(sanitize($scope.businessinfo.typeofbusiness));
                    vals.push(sanitize($scope.businessinfo.busequipment));
                    vals.push(sanitize($scope.businessinfo.husbandbusiness));
                    vals.push(sanitize($scope.businessinfo.hbequipment));
                    vals.push(sanitize($scope.businessinfo.jointbusiness));
                    vals.push(sanitize($scope.businessinfo.jbequipment));

                    vals.push(sanitize($scope.address.rt));
                    vals.push(sanitize($scope.address.streetarea));
                    vals.push(parseInt($scope.address.centerid));
                    vals.push($scope.address.village.val);
                    vals.push(sanitize($scope.address.subdistrict));
                    vals.push(sanitize($scope.address.district));
                    vals.push(sanitize($scope.address.province));
                    vals.push($scope.address.postcode)
                    vals.push(sanitize($scope.address.landmark));
                    vals.push($scope.address.mobile1);
                    vals.push($scope.address.mobile2);

                    vals.push($scope.address.husbmobile);
                    vals.push(fopk);
                    vals.push(groupid);
                    vals.push(fopk);
                    vals.push(date);

                    vals.push($scope.address.rw);


                    comm2.values.push(vals);

                    prep.push(comm2);

                }  else if (type == 'houseinfo'){



                    comm.query = "UPDATE T_CLIENT_LOAN_NEW SET "+

                            " CLL_HOUSE_TYP=?, "+
                            " CLL_HOUSE_SIZE=?, "+
                            " CLL_HOUSE_CONDITION=?, "+
                            " CLL_ROOF_TYPE=?, "+
                            " CLL_WALL_TYPE=?, "+
                            " CLL_FLOOR_TYP=?, "+
                            " CLL_ELETRICITY=?, "+
                            " CLL_WATER_SRC=?, "+
                            " CLL_HSE_INX=?, "+
                            " CLL_HOMELESS=?, "+
                            " CLL_MOB_NEW=2 "+
                            " WHERE CLL_CLT_PK="+CLT_PK;

                    var vals = [];
                    vals.push($scope.houseinfo.housetype);
                    vals.push($scope.choices['0']);
                    vals.push($scope.choices['1']);
                    vals.push($scope.choices['2']);
                    vals.push($scope.choices['3']);
                    vals.push($scope.choices['4']);
                    vals.push($scope.choices['5']);
                    vals.push($scope.choices['6']);
                    vals.push($scope.housetotal);
                    vals.push(isHomeless);

                    comm.values.push(vals);

                    prep.push(comm);


                } else if (type=='workcap'){

                    var hbworkcap = 0;

                    if($scope.workcap.husband == null || $scope.workcap.husband == '' || $scope.workcap.husband == 'null'){
                        hbworkcap = 0;
                    } else {
                        hbworkcap = parseInt(workcap.husband);
                    }

                    comm.query = "UPDATE T_CLIENT_LOAN_NEW SET "+

                            " CLL_WORKING_CAPITAL=?, "+
                            " CLL_HB_WORKING_CAPITAL=? "+

                            " WHERE CLL_CLT_PK="+CLT_PK;
                    var vals = [];


                    if($scope.workcap.app == '' || $scope.workcap.app == null) $scope.workcap.app = 0;
                    if(hbworkcap == '' || hbworkcap == null) hbworkcap = 0;

                    vals.push($scope.workcap.app);
                    vals.push(hbworkcap);

                    comm.values.push(vals);

                    prep.push(comm);
 
                    var comm2 = {
                        query: null,
                        values: []
                    }

                    var cmd = "DELETE FROM T_CLIENT_BORROWED_FUNDS_NEW WHERE CEF_CLT_PK="+CLT_PK;
                    myDB.execute(cmd);

                    comm2.query = "INSERT INTO T_CLIENT_BORROWED_FUNDS_NEW VALUES(null,0,?,0,?,?,?,?,?,?,?,?,1)";
                    
                    for(var key in borrowedFunds){
                        
                        var repaymentPerMonth = parseFloat(borrowedFunds[key].repaymentperwk) * 4;
                        var loanpaidoff = borrowedFunds[key].loanpaidoff;

                        var vals = [];
                        //CEF_PK
                        vals.push(CLT_PK); //CEF_CLT_PK
                        // CEF_CLL_PK
                        vals.push(borrowedFunds[key].loanfrom); //CEF_LOAN_FROM
                        vals.push(borrowedFunds[key].loanfromname); //CEF_LOAN_FROM_NAME
                        vals.push(borrowedFunds[key].applicant); //CEF_BORROWED_BY
                        vals.push(borrowedFunds[key].originalamt); //CEF_ORGINAL_AMT
                        vals.push(borrowedFunds[key].balance); //CEF_BALANCE_AMT
                        vals.push(borrowedFunds[key].repaymentperwk); //CEF_REPAY_PER_WEEK
                        vals.push(repaymentPerMonth); //CEF_REPAY_PER_MONTH
                        vals.push(loanpaidoff); //CEF_LOAN_PAID_OFF

                        comm2.values.push(vals);
                    }

                    prep.push(comm2);

                } else if(type=='houseincomes'){

                    var comm2 = {
                        query: null,
                        values: []
                    }

                    var cmd = "DELETE FROM T_CLIENT_INCOME_NEW WHERE CLI_CLT_PK="+CLT_PK;
                    myDB.execute(cmd);

                    comm2.query = "INSERT INTO T_CLIENT_INCOME_NEW VALUES(null,?,?,0,?,?,?,?,1);";

                    var CLI_PK = 1;
                    for(var key in $scope.houseIncomes){

                        if(houseIncomes[key].detaildesc == null || houseIncomes[key].detaildesc == ""){
                            var incomedetails = 'null';
                        } else {
                            var det = 0;
                            if(houseIncomes[key].details != null && houseIncomes[key].details != ''&& !isNaN(houseIncomes[key].details) ) det = houseIncomes[key].details;

                            var incomedetails =  det+" "+houseIncomes[key].detaildesc;
                        }

                        var vals = [];

                        //console.log(houseIncomes);

                        vals.push(CLI_PK);
                        vals.push(CLT_PK);
                        vals.push(houseIncomes[key].source);
                        vals.push(incomedetails);
                        vals.push(houseIncomes[key].fixed);
                        vals.push(houseIncomes[key].variable);

                        comm2.values.push(vals);

                        CLI_PK = parseInt(CLI_PK) + 1;
                    }

                    prep.push(comm2);
                    comm.query = "UPDATE T_CLIENT_LOAN_NEW SET "+

                            " CLL_INDEX_OF_INCOME=?, "+
                            " CLL_MOB_NEW=2 "+
                            // " CLL_HSE_INX="+$scope.housetotal;
                            " WHERE CLL_CLT_PK="+CLT_PK;

                    var vals = [];
                    vals.push(incomepercapita);

                    comm.values.push(vals);

                    prep.push(comm);

                } else if (type =='welfare'){

                    var totalassetvalue = 0;

                    var comm2 = {
                        query: null,
                        values: []
                    }

                    var comm = {
                        query: null,
                        values: []
                    }

                    comm.query = "UPDATE T_CLIENT_LOAN_NEW SET CLL_WELFARE_STATUS=? ,CLL_INDEX_OF_ASSET=?, CLL_MOB_NEW=2 WHERE CLL_CLT_PK=?";

                    var vals = [];
                    vals.push(welfareStatus);
                    vals.push($scope.getTotalUnproVal());
                    vals.push(CLT_PK);

                    comm.values.push(vals);

                    prep.push(comm);

                    var cmd = "DELETE FROM T_CLIENT_ASSET_LIST_NEW WHERE CAL_CLT_PK="+CLT_PK;
                    myDB.execute(cmd);

                    comm2.query = "INSERT INTO T_CLIENT_ASSET_LIST_NEW VALUES(null, ?,?,0,?,?,1 )";

                    for(var akey in $scope.unproassets){
                        if($scope.unproassets[akey].asset != ""){

                            var CAL_PK = 0;
                            var vals = [];
                            vals.push(CAL_PK);
                            vals.push(CLT_PK);
                            vals.push($scope.unproassets[akey].asset);
                            vals.push($scope.unproassets[akey].value);

                            comm2.values.push(vals)

                        }

                        totalassetvalue += $scope.unproassets[akey].value;

                    }

                    prep.push(comm2);

                } else if (type == 'signature'){

                    query.push("UPDATE T_CLIENT_NEW SET CLT_SIGNATURE ='"+blob+"' WHERE CLT_PK = "+CLT_PK);

                } else if (type == 'group'){

                    query.push("UPDATE T_CLIENT_NEW SET CLT_GROUP_ID ='"+$scope.group.groupid+"', CLT_IS_GROUP_LEADER='N' WHERE CLT_PK = "+CLT_PK);

                    var oldgroup = $filter('filter')($scope.savedGrps, { GROUP_ID: $scope.oldgroup.groupid })[0];
                    //console.log(oldgroup);
                    if(oldgroup != undefined && oldgroup.MEMBERS.length > 1 && $scope.group.isGroupLeader == 'Y'){
                        $.each(oldgroup.MEMBERS,function(i,mem){
                            if(mem.CLL_CLT_PK != CLT_PK){
                                query.push("UPDATE T_CLIENT_NEW SET CLT_IS_GROUP_LEADER='Y' WHERE CLT_PK = "+mem.CLL_CLT_PK);
                                return false;
                            }
                        });
                    }

                    $scope.oldgroup = $scope.group;
                    $scope.loadGroups();

                } else if (type == 'loan'){



                    for(var key in $scope.selectedLoans){

                        if(!$scope.selectedLoans[key].newloan){

                            var loankey = {
                                CLL_LTY_PK: $scope.selectedLoans[key].CLL_LTY_PK,
                                CLL_ACTUAL_LOAN: $scope.selectedLoans[key].CLL_ACTUAL_LOAN,
                                CLL_TOTAL_LOAN_WEEKS: $scope.selectedLoans[key].CLL_TOTAL_LOAN_WEEKS,
                                LPU_NAME:  $('#activeloanPurpose').text(),
                                CLL_CHILD_NAME: $scope.selectedLoans[key].CLL_CHILD_NAME,
                                CLL_CHILD_GENDER: $scope.selectedLoans[key].CLL_CHILD_GENDER,
                                CLL_CHILD_AGE: $scope.selectedLoans[key].CLL_CHILD_AGE,
                                CLL_MEMBER_STUDENT_PROFILE: $scope.selectedLoans[key].CLL_MEMBER_STUDENT_PROFILE,
                                CLL_THIRDPARTY_NAME: $scope.selectedLoans[key].CLL_THIRDPARTY_NAME,
                                CLL_THIRDPARTY_ADDRESS: $scope.selectedLoans[key].CLL_THIRDPARTY_ADDRESS,
                                CLL_THIRDPARTY_ACC_NUMBER: $scope.selectedLoans[key].CLL_THIRDPARTY_ACC_NUMBER,
                                CLL_TRANSFER_MODE: $scope.selectedLoans[key].CLL_TRANSFER_MODE
                            };
                            //console.log("#######################");
                            //console.log(loankey);
                            $scope.newloaninfo.push(loankey);

                            $scope.selectedLoans[key].newloan = true;

                            var hbworkcap = 0;

                            if(workcap.husband == null || workcap.husband == '' || workcap.husband == 'null'){
                                hbworkcap = 0;
                            } else {
                                hbworkcap = parseInt(workcap.husband);
                            }

                            var graceperiod = null;

                            if($scope.selectedLoans[key].selecteddetails.hasOwnProperty("graceperiod")){
                                if($scope.selectedLoans[key].selecteddetails.graceperiod != undefined){
                                        graceperiod = $scope.selectedLoans[key].selecteddetails.graceperiod.value;
                                }
                            }


                            if(choices[0] == '') choices[0] = 0;
                            if(choices[1] == '') choices[1] = 0;
                            if(choices[2] == '') choices[2] = 0;
                            if(choices[3] == '') choices[3] = 0;
                            if(choices[4] == '') choices[4] = 0;

                            //MISSING CLL_EXTRACTED_DATE TIMESTAMP NULL, CLL_GROUP_ID VARCHAR(50) NULL, CLL_IS_GROUP_LEADER VARCHAR(1) null
                            var crf_amt = parseFloat($scope.selectedLoans[key].selecteddetails.loanamt * ($scope.selectedLoans[key].LTY_DEFAULT_CRF_INTEREST / 100));

                            //query.push("UPDATE T_CLIENT SET CLT_MOB_NEW=1, CLT_CREATED_DATE='"+moment().format('DD/MM/YYYY HH:mm:ss')+"' WHERE CLT_PK="+CLT_PK);
                            query.push("UPDATE T_CLIENT_NEW SET CLT_CREATED_DATE='"+moment().format('YYYY-MM-DD HH:mm:ss')+"' WHERE CLT_PK="+$scope.clientPK);
                            query.push("UPDATE T_CLIENT_ASSET_LIST SET CAL_MOB_NEW=1 WHERE CAL_CLT_PK="+$scope.clientPK);
                            query.push("UPDATE T_CLIENT_INCOME SET CLI_MOB_NEW=1 WHERE CLI_CLT_PK="+$scope.clientPK);
                            query.push("UPDATE T_CLIENT_BORROWED_FUNDS SET CEF_MOB_NEW=1 WHERE CEF_CLT_PK="+$scope.clientPK);




                           var q = "INSERT INTO T_CLIENT_LOAN VALUES( null, "+
                                $scope.CLL_PK+", "+
                                BRC_PK+", "+
                                CLT_PK+", "+
                                USER_PK+", '"+
                                welfareStatus+"', "+
                                workcap.app+", "+
                                hbworkcap+", "+
                                $scope.houseinfo.housetype+", "+
                                $scope.choices['0']+","+
                                $scope.choices['1']+","+ //10
                                $scope.choices['2']+","+
                                $scope.choices['3']+","+
                                $scope.choices['4']+", null, null, "+
                                housetotal+", "+
                                $scope.selectedLoans[key].selecteddetails.loanmaturity.value+",  "+
                                $scope.selectedLoans[key].selecteddetails.loanamt+",  "+
                                $scope.selectedLoans[key].selecteddetails.loanamt+", "+
                                $scope.selectedLoans[key].selecteddetails.loaninterest+", "+ //20
                                $scope.selectedLoans[key].LTY_DEFAULT_CRF_INTEREST+", "+
                                crf_amt+", null, null, null, null, null, null, null, null, null, 'Y', null, "+ //33
                                $scope.selectedLoans[key].LTY_CREATED_BY+", '"+
                                moment().format('DD/MM/YYYY HH:mm:ss')+"', 1, "+
                                $scope.selectedLoans[key].LTY_PK+", null, "+ 
                                "'"+$scope.selectedLoans[key].selecteddetails.loanpurpose.value+"', "+ //CLL_LPU_PK
                                "null, "+ //CLL_TERMINATION_DATE 40
                                "null, "+ //CLL_FIRST_COLLECTION_DATE
                                "0, "+ //CLL_TOTAL_PRINCIPAL_PAID
                                "0, "+ //CLL_TOTAL_INTEREST_PAID
                                $scope.selectedLoans[key].selecteddetails.loanamt+", "+ //CLL_OUTSTANDING
                                "null, "+ //CLL_REPAY_PER_WEEK
                                "null, "+ //CLL_LOAN_NUMBER
                                incomepercapita+", "+ //CLL_INDEX_OF_INCOME VARCHAR(1000) NULL
                                $scope.getTotalUnproVal()+", "+ //CLL_INDEX_OF_ASSET VARCHAR(1000) NULL
                                tsunamiAffected+", "+
                                quakeAffected+", "+ //50
                                havecooperate+", "+//CLL_LOAN_COOPERATE_EXISTS VARCHAR(1) NULL
                                haveotherbank+", "+ //CLL_LOAN_BANK_EXISTS VARCHAR(1) NULL
                                haveinstitutes+", "+ //CLL_FINANCE_INSTITUTE_ACCESS VARCHAR(1) NULL
                                haveSavings+", "+ //CLL_SAVING_ACCOUNT_EXISTS VARCHAR(1) NULL
                                haveInsurance+", "+ //CLL_INSURANCE_EXISTS VARCHAR(1) NULL
                                "'Y', "+ //CLL_PAST_MEMBERSHIP_EXISTS VARCHAR(1) NULL
                                "null, "+ //CLL_IS_FORM_PRINTED VARCHAR(1) NULL, "+
                                "null, "+ //CLL_MANAGER_PK INT NULL, "+
                                "null, "+ //CLL_PDF_PATH VARCHAR(1000) NULL, "+
                                $scope.witnesses[0].witness_pk + ", "+ //CLL_WITNESS1_PK INT NULL, "+ 60
                                $scope.witnesses[1].witness_pk + ", "+ //CLL_WITNESS2_PK INT NULL, "+
                                $scope.witnesses[2].witness_pk + ", "+ //CLL_WITNESS3_PK INT NULL, "+
                                $scope.witnesses[3].witness_pk + ", "+ //CLL_WITNESS4_PK INT NULL, "+
                                "null, "+ //CLL_TEST_RESULT_DATETIME TIMESTAMP NULL, "+
                                "null, "+ //CLL_TEST_PLACE VARCHAR(1000) NULL, "+
                                "null, "+ //CLL_TOTAL_INTEREST_AMT VARCHAR(1000) NULL, "+
                                "'"+isHomeless+"', "+ //CLL_HOMELESS VARCHAR(1) NULL
                                "0,"+ //CLL_LOAN_WEEKS 
                                "0,"+ //CLL_ROUNDING_OF_REPAYMENT
                                graceperiod+","+ //CLL_GRACE_PERIOD_WEEKS 70
                                $scope.selectedLoans[key].selecteddetails.loaninterest+","+ //CLL_GRACE_PERIOD_INTEREST
                                "null, "+ //CLL_CASHOUT_BY
                                $scope.selectedLoans[key].loancycle+", "+ //CLL_LOAN_CYLE
                                "null, "+ //CLL_CASHIER_BY
								$scope.ctr_lead.ctr_lead_pk+", "+ //CLL_CENTER_LEAD_PK
								$scope.grp_lead.grp_lead_pk+", "+ //CLL_GROUP_LEAD_PK
                                "'"+$scope.selectedLoans[key].selecteddetails.childname+"',"+//CLL_CHILD_NAME VARCHAR (1000) NULL, "+
                                "'"+$scope.selectedLoans[key].selecteddetails.childgender+"',"+//CLL_CHILD_GENDER VARCHAR (1) NULL, "+
                                "'"+$scope.selectedLoans[key].selecteddetails.childage+"',"+//CLL_CHILD_AGE VARCHAR(15) NULL, "+
                                "'"+$scope.selectedLoans[key].selecteddetails.payeename+"',"+//CLL_THIRDPARTY_NAME VARCHAR (1000) NULL, "+ 80
                                "'"+$scope.selectedLoans[key].selecteddetails.profile+"',"+//CLL_MEMBER_STUDENT_PROFILE VARCHAR(3000) NULL, "+
                                "null, "+//CLL_THIRDPARTY_DISBURSEMENT_DATE TIMESTAMP NULL, "+
                                "null, "+//CLL_THIRDPARTY_DISBURSED VARCHAR(1) NULL, "+ 
                                "'"+$scope.selectedLoans[key].selecteddetails.payeeacct+"',"+//CLL_THIRDPARTY_ACC_NUMBER VARCHAR(100) NULL, "+
                                "'"+$scope.selectedLoans[key].selecteddetails.payeeaddress+"',"+//CLL_THIRDPARTY_ADDRESS VARCHAR(1000) NULL, "+
                                "'"+$scope.selectedLoans[key].selecteddetails.payeename+"',"+//CLL_THIRDPARTY_ACCHOLDER_NAME VARCHAR(100) NULL, "+
                                "null, "+//CLL_THIRDPARTY_SIGNATURE TEXT NULL, "+
                                "'"+$scope.selectedLoans[key].selecteddetails.disbmode+"',"+//CLL_TRANSFER_MODE VARCHAR(100) NULL, "+
                                "'"+$scope.selectedLoans[key].selecteddetails.artaproducts+"',"+//CLL_ARTA_PRODUCTS VARCHAR(1000) NULL, "+  
                                "'"+$scope.selectedLoans[key].selecteddetails.agrimainplant+"',"+ //CLL_MAIN_PLANT VARCHAR(1000) NULL, "+ 90
                                "'"+$scope.selectedLoans[key].selecteddetails.agrilandlocation+"',"+ //CLL_LAND_BLOCK_LOCATION+
                                "'"+$scope.selectedLoans[key].selecteddetails.agritype+"',"+ //CLL_TYPES_VARIETIES
                                "'"+$scope.selectedLoans[key].selecteddetails.agrilandarea+"',"+ //CLL_LAND_AREA
                                "'"+$scope.selectedLoans[key].selecteddetails.agrioriginofseed+"',"+ //CLL_ORIGIN_OF_SEED
                                "'"+$scope.selectedLoans[key].selecteddetails.agrilandtenure+"',"+ //CLL_LAND_TENURE
                                "'"+$scope.selectedLoans[key].selecteddetails.agriotherplant+"',"+ //CLL_OTHER_PLANTS
                                "'"+$scope.selectedLoans[key].selecteddetails.agrilandquality+"',"+ //CLL_LAND_QUALITY
                                "'"+$scope.selectedLoans[key].selecteddetails.agrinote+"',"+ //CLL_NOTE
                                "'"+$scope.selectedLoans[key].selecteddetails.agribizrisk+"',"+ //CLL_BUSINESS_RISK 99

                                "1 )"; //
                            console.log(q);
                            console.log(q.split(',').length);
                            query.push(q);

                            for(var pkey in $scope.selectedLoans[key].products){
                                if($scope.selectedLoans[key].products[pkey].isSelected == "YES" && $scope.productAvailable($scope.selectedLoans[key].products[pkey],'check') ){

                                    var prd_maturity = $scope.selectedLoans[key].selecteddetails.loanmaturity.value
                                    if($scope.selectedLoans[key].products[pkey].selectedMaturityOption != null){
                                        prd_maturity = $scope.selectedLoans[key].products[pkey].selectedMaturityOption;
                                    } else {
                                        prd_maturity = $scope.selectedLoans[key].selecteddetails.loanmaturity.value + " Weeks";
                                    }

                                    var prdSavperWeek = null;
                                    if($scope.selectedLoans[key].products[pkey].PRM_CODE == feastsavingcode){
                                        prdSavperWeek = $scope.selectedLoans[key].products[pkey].selectedSavingperWeek;
                                    }

                                    var enddate = null;
                                    var startdate = null;

                                    if($scope.selectedLoans[key].products[pkey].PRM_CODE == '002.0004'){ // If Pension

                                        var newPension = true;

                                        if(!$scope.productAvailable($scope.selectedLoans[key].products[pkey],'check')){

                                            newPension = false;

                                            var pension = $scope.selectedLoans[key].products[pkey];
                                            var pen_mat = pension.CPM_PRM_MATURITY.replace("year").trim();
                                            var pen_start = pension.CPM_START_MATURITY_DATE;
                                            var pen_end = pension.CPM_END_MATURITY_DATE;

                                            var CurrentDate = new Date();

                                            if(CurrentDate > pen_end){

                                            }

                                        }
                                    }

                                    query.push("INSERT INTO T_CLIENT_PRODUCT_MAPPING VALUES(null, "+$scope.CPM_PK+", "+CLT_PK+", "+$scope.CLL_PK+", "+ $scope.selectedLoans[key].products[pkey].PRM_PK +", '"+prd_maturity+"', 0, null, '"+moment().format('DD/MM/YYYY HH:mm:ss')+"', null, 1, '"+prdSavperWeek+"','"+startdate+"','"+enddate+"', 1)");
                                    $scope.CPM_PK += 1;

                                    $scope.updated.applicantdata.olddata.products.push($scope.selectedLoans[key].products[pkey]);
 
                                }
                            }
                        }
                        $scope.CLL_PK += 1;
                    }
                }

                myDB.dbShell.transaction(function(tx){

                    if(query.length > 0){
                        for(var e in query){
                            //console.log(query[e]);
                            tx.executeSql(query[e]);
                        }
                    }

                    if(prep.length > 0){
                        for(var e in prep){
                            for(var v in prep[e].values){
                                //console.log(prep[e].query);
                                //console.log(prep[e].values[v]);
                                tx.executeSql(prep[e].query,prep[e].values[v],  function(tx,data){/*console.log(data)*/},function(tx, err){ console.log('error '+err.message)});
                            }
                        }
                    }


                }, function(err){
                    console.log(err);
                    swal({
                        title: i18n.t("messages.Alert"),
                        text: i18n.t("messages.ClientUpdateFail")+" "+err.message,
                        type: "error",
                        confirmButtonColor: "#80C6C7",
                        confirmButtonText: "Ok",
                    });
                }, function(suc){
                   //$scope.ChkNewClientDataExists($scope.clientPK);

                   swal({
                        title: i18n.t("messages.ClientUpdateSuccess"),
                        type: "success",
                        confirmButtonColor: "#80C6C7",
                        confirmButtonText: "Ok",
                    }).then(function(){
                        if(type == 'loan'){
                            location.reload();
                        } else {
                            swal.close();
                            $scope.$apply();
                       }
                    });
                });

            }
        }

        $scope.updateInterest = function(loan){

            var TermArray = loan.LTY_TERM_OF_LOAN.split(",");
            var InterestArray = loan.LTY_DEFAULT_LOAN_INTEREST.split(",");
            for(var i=0; i < TermArray.length; i++){
                if(loan.selecteddetails.loanmaturity.value == TermArray[i]){
                    loan.selecteddetails.loaninterest = (parseInt(InterestArray[i])).toFixed(2);
                }
            }
            console.log(loan);
        }

        $scope.conflictingLoanValidation = function(loan){
            var hasGeneralLoan = false;
            var hasMicroBusinessLoan = false;
            var existing_hasLoan1 = false;
            var existing_hasLoan2 = false;


            $.each($scope.selectedLoans,function(i,selloan){
                if(selloan.LTY_PK == 34){
                    hasGeneralLoan = true;
                }
                if(selloan.LTY_PK == 35){
                    hasMicroBusinessLoan = true;
                }
            });
            $.each($scope.loans,function(i,selloan){
                if(selloan.LTY_PK == 34 && selloan.existingloan){
                    hasGeneralLoan = true;
                }
                if(selloan.LTY_PK == 35 && selloan.existingloan){
                    hasMicroBusinessLoan = true;
                }
            });


            // if it is a new client, he can only take general loan
            if($scope.isNewClient) {
                if( loan.LTY_PK !== 34 ) return false;
            }

            /**
             *  rule 1: if client already took general loan, he can't take micro-bussiness loan
             *  rule 2: if client already took micro-bussiness loan, he can't take general loan
             * */ 
            if((hasGeneralLoan && loan.LTY_PK == 35 )||
                (hasMicroBusinessLoan && loan.LTY_PK == 34)) {
                return false;
            }

            return true;

        }

        $scope.updateCtrLeader = function(){

            $scope.ctr_lead.ctr_lead_pk = $scope.selectedCtrLeader.CLT_PK;
            $scope.ctr_lead.ctr_lead_name = $scope.selectedCtrLeader.CLT_FULL_NAME;

        };

        $scope.updateWitness = function(idx) {
            $scope.witnesses[idx].witness_pk = $scope.selectedWitness[idx].CLT_PK;
            $scope.witnesses[idx].witness_name = $scope.selectedWitness[idx].CLT_FULL_NAME;
            setTimeout(() => {
                refreshall('.witness');
            }, 1);
        }

        $scope.showSignscreen = function(idx, type){

            type = typeof type !== 'undefined' ? type : null;

            if(!$scope.showSign){
                $scope.showSign = true;
                setTimeout(function(){
                    if(type == null){
                        $scope.signingclientIndex = 0;
                        var client = $scope.client;
                        $scope.loadSignaturePad(client);
                    } else {
                        $scope.loadSignaturePad(null, type, idx);
                        if( type.indexOf('witness')  > -1) {
                            $scope.signinguser = type + idx;
                        } else {
                            $scope.signinguser = type;
                        }
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

        $scope.loadSignaturePad = function(client, type, idx){

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
                $('#signingperson').html('<h3><p>'+client.CLT_FULL_NAME+' '+ i18n.t("messages.SignHere") + '</p></h3>');
            } else if (type == 'officer') {
                $('#signingperson').html('<h3><p>'+$scope.user.userName+' '+ i18n.t("messages.SignHere") + '</p></h3>');
            } else if (type == 'mgr'){
                $('#signingperson').html('<h3><p>'+$scope.MGR.mgrname+' '+ i18n.t("messages.SignHere") + '</p></h3>');
            } else if (type == 'ctr_lead'){
                $('#signingperson').html('<h3><p>'+$scope.ctr_lead.ctr_lead_name+' '+ i18n.t("messages.SignHere") + '</p></h3>');
            } else if (type == 'grp_lead'){
                $('#signingperson').html('<h3><p>'+$scope.grp_lead.grp_lead_name+' '+ i18n.t("messages.SignHere") + '</p></h3>');
            } else if (type == 'witness') {
                $('#signingperson').html('<h3><p>'+$scope.witnesses[idx].witness_name+' '+ i18n.t("messages.SignHere") + '</p></h3>');
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
            } else if (type == 'grp_lead'){
                var dsrc = atob($scope.grp_lead.Signature);

                var img2 = new Image();
                img2.onload = (function(){
                    var canv = $('#the-canvas-'+$scope.grp_lead.grp_lead_pk)[0];
                    var cont = canv.getContext("2d");
                    cont.drawImage(img2,0,0,300,150);
                });
            } else if (type == 'witness') {
                var dsrc = atob($scope.grp_lead.Signature);

                var img2 = new Image();
                img2.onload = (function(){
                    var canv = $('#the-canvas-'+$scope.grp_lead.grp_lead_pk)[0];
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
                } else if($scope.signinguser == 'officer'){
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
                } else if ($scope.signinguser === 'grp_lead'){
                    var canv = $('#the-canvas-grp_lead')[0];
                    $scope.$apply(function(){
                        $scope.grp_lead.hasSigned = true;
                        $scope.grp_lead.Signature = blob;
                    })
                } else if ($scope.signinguser.indexOf("witness") > -1 ) {
                    var idx = $scope.signinguser.split("witness")[1];
                    var canv = $('#the-canvas-'+$scope.witnesses[idx].witness_pk)[0];
                    $scope.$apply(function(){
                        $scope.witnesses[idx].hasSigned = true;
                        $scope.witnesses[idx].Signature = blob;
                    })
                }
           
                if($scope.signingclientIndex != null || $scope.signinguser == 'grp_lead' || $scope.signinguser == 'ctr_lead' || $scope.signinguser.indexOf("witness") > -1){

                    var SIG_CLT_PK = "";
                    var cmd2 = "";
                    if($scope.signingclientIndex != null){
                        SIG_CLT_PK = $scope.client.CLT_PK;
                    } else if ($scope.signinguser == 'grp_lead'){
                        SIG_CLT_PK = $scope.grp_lead.grp_lead_pk;
                        cmd2 = "UPDATE T_CLIENT SET CLT_GRP_LEADER_PK=" + SIG_CLT_PK + " WHERE CLT_PK = " +$scope.client.CLT_PK;
                    } else if ($scope.signinguser == 'ctr_lead') {
                        SIG_CLT_PK = $scope.ctr_lead.ctr_lead_pk;
                        cmd2 = "UPDATE T_CLIENT SET CLT_CTR_LEADER_PK=" + SIG_CLT_PK + " WHERE CLT_PK = " +$scope.client.CLT_PK;
                    } else if ($scope.signinguser.indexOf("witness") > -1) {
                        var idx = $scope.signinguser.split("witness")[1];
                        SIG_CLT_PK = $scope.witnesses[idx].witness_pk;
                    }

                    if(cmd2 !== "") {
                        myDB.execute(cmd2, function(res){
                             
                        });
                    } 

                    var cmd1 = "UPDATE T_CLIENT SET CLT_SIGNATURE ='"+blob+"' WHERE CLT_PK = "+SIG_CLT_PK;
                    myDB.execute(cmd1, function(res){
                        if($scope.signingclientIndex !== null) $scope.signingclientIndex = null;
                    });
                }

                $scope.clearSigPad(); 

                context.clearRect(0, 0, canvas.width, canvas.height);
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

        //PROCESSES

        // $scope.getUserSignature();
        if($scope.MGR.Signature != null && $scope.MGR.Signature != ''){
            $scope.MGR.hasSigned = true;
            $scope.showSignature('mgr');
        }

        $scope.loadsign = function(){
            setTimeout(function(){
                $scope.loadSignaturePad();
            },500);
        }


        $scope.evaluate = function(){

            swal({
                title: i18n.t("messages.Alert"),
                text: i18n.t("messages.PendingReview"),
                type: "warning",
                confirmButtonColor: "#80C6C7",
                confirmButtonText: "Ok",
            }).then(function(){
                // Do PPI First
                // Check If PPI Done
                sessionStorage.setItem("PPI_CLIENT_ID",CLT_PK);
                sessionStorage.setItem("CLIENT_ID",$scope.clientPK);
                sessionStorage.setItem("CLIENT_NAME",$scope.CLT_FULL_NAME);
                window.location.href = "ppiform.html";

                //Else just Review

                // sessionStorage.setItem("CLIENT_ID",$scope.clientPK);
                // sessionStorage.setItem("CLIENT_NAME",$scope.CLT_FULL_NAME);
                // sessionStorage.setItem("GOTO","EVAL");
                // window.location.href = "client.html";
            });
        }


        $scope.filterWitnessess = function(members) {
            var filteredWitnesses = [];
            members.forEach(mem => {
                var exists = false;
                $scope.witnesses.forEach(witness => {
                    if( mem.CLT_PK == witness.witness_pk) {
                        exists = true;
                    }
                });
                if (!exists) {
                    filteredWitnesses.push(mem);
                }
            });
            return filteredWitnesses;
        }

        $scope.prepareSignature = function(idx, witness){

            $scope.signinguser = 'witness' + idx;
            $scope.emitLoadSignature(witness, 'witness')
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
                } else if (type == 'grp_lead') {
                    var canv = $('#the-canvas-grp_lead')[0];
                    $scope.$apply(function(){
                        $scope.grp_lead.hasSigned = true;
                        $scope.grp_lead.Signature = blob;
                    })
                } else if (type == 'witness' ) {
                    var idx = $scope.signinguser.split("witness")[1];
                    var canv = $('#the-canvas-'+$scope.witnesses[idx].witness_pk)[0];
                    $scope.$apply(function(){
                        $scope.witnesses[idx].hasSigned = true;
                        $scope.witnesses[idx].Signature = blob;
                    })
                }
           
                if(type == 'client' || type == 'grp_lead' || type == 'ctr_lead' || type == 'witness'){

                    var SIG_CLT_PK = "";
                    var cmd2 = "";
                    if(type == 'client'){
                        SIG_CLT_PK = $scope.client.CLT_PK;
                    } else if (type == 'grp_lead'){
                        SIG_CLT_PK = $scope.grp_lead.grp_lead_pk;
                        cmd2 = "UPDATE T_CLIENT SET CLT_GRP_LEADER_PK=" + SIG_CLT_PK + " WHERE CLT_PK = " +$scope.client.CLT_PK;
                    } else if (type == 'ctr_lead') {
                        SIG_CLT_PK = $scope.ctr_lead.ctr_lead_pk;
                        cmd2 = "UPDATE T_CLIENT SET CLT_CTR_LEADER_PK=" + SIG_CLT_PK + " WHERE CLT_PK = " +$scope.client.CLT_PK;
                    } else if (type == 'witness') {
                        var idx = $scope.signinguser.split("witness")[1];
                        SIG_CLT_PK = $scope.witnesses[idx].witness_pk;
                    }

                    if(cmd2 !== "") {
                        myDB.execute(cmd2, function(res){
                             
                        });
                    } 

                    var cmd1 = "UPDATE T_CLIENT SET CLT_SIGNATURE ='"+blob+"' WHERE CLT_PK = "+SIG_CLT_PK;
                    myDB.execute(cmd1, function(res){
                         
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

    }]);




})();

/******************************************************************************
Add menu and buttons to every page
******************************************************************************/
function init(){
    initTemplate.load(2);
    $(".ncadPhoto").each(function(){ $(this).width(250).height($(this).width()*1.25); });
    var  newheader = '  <div class="etask-container">'+
                            '<div data-role="controlgroup" data-type"horizontal" class="etask-progress top no-progress" style="text-align:left;" >'+
                                '<div class="etask"><div class="etask-icon">1<i class="fa fa-check hidden"></i></div><a href="#pageAppData" data-ajax="false" class="etask-name active" data-i18n="buttons.Applicant">Applicant</a></div>'+
                                '<div class="etask"><div class="etask-icon">5<i class="fa fa-check hidden"></i></div><a href="#pageAddress" data-ajax="false" class="etask-name"  data-i18n="buttons.Address">Address</a></div>'+
                                '<div class="etask"><div class="etask-icon">2<i class="fa fa-check hidden"></i></div><a href="#pageAppData2" data-ajax="false" class="etask-name" data-i18n="buttons.Husband">Husband</div></a>'+
                                '<div class="etask"><div class="etask-icon">3<i class="fa fa-check hidden"></i></div><a href="#pageAppData3" data-ajax="false" class="etask-name" data-i18n="buttons.HouseholdMother">HouseholdMother</a></div>'+
                                '<div class="etask"><div class="etask-icon">4<i class="fa fa-check hidden"></i></div><a href="#pageAppData4" data-ajax="false" class="etask-name" data-i18n="buttons.Business">Business</a></div>'+
                                
                                '<div class="etask-progress-bar"></div>'+
                            '</div>'+
                            '<div data-role="controlgroup" class="etask-progress-vert  no-progress" >'+
                                '<div class="etask-progress-bar-vert right"></div>'+
                            '</div>'+
                            '<div data-role="controlgroup" class="etask-progress-reverse  no-progress">'+
                                '<div class="etask"><div class="etask-icon">10<i class="fa fa-check hidden"></i></div><a href="#pageProductMapping" data-ajax="false" class="etask-name" data-i18n="buttons.ProductMapping">Product Mapping</a></div>'+
                                '<div class="etask"><div class="etask-icon">9<i class="fa fa-check hidden"></i></div><a href="#pageHouseIncomeEst" data-ajax="false" class="etask-name" data-i18n="buttons.Income">Income</a></div>'+
                                '<div class="etask"><div class="etask-icon">8<i class="fa fa-check hidden"></i></div><a href="#pageHousingIndex" data-ajax="false" class="etask-name"  data-i18n="buttons.HousingIndex">Housing Index</a></div>'+
                                '<div class="etask"><div class="etask-icon">7<i class="fa fa-check hidden"></i></div><a href="#pageWorkingCapital" data-ajax="false" class="etask-name"  data-i18n="buttons.WorkingCapital">Working Capital</a></div> '+
                                '<div class="etask"><div class="etask-icon">6<i class="fa fa-check hidden"></i></div><a href="#pageWelfareStatus" data-ajax="false" class="etask-name" data-i18n="buttons.FamilyWelfare">Family Welfare</a></div>'+
                                '<div class="etask-progress-bar-reverse no-progress"></div>'+
                            '</div>'+
                        '</div>';
    var newestheader = '<div class="cr-container">'+

                            '<a href="#pageAppData" data-ajax="false" class="arrow_box etask-name ab-pageAppData active"><div class="main-tb"><div class="center-tb" data-i18n="buttons.Applicant">Applicant</div></div></a>'+
                            '<a href="#pageAddress" data-ajax="false" class="arrow_box etask-name ab-pageAddress"><div class="main-tb"><div class="center-tb" data-i18n="buttons.Address">Address</div></div></a>'+
                            '<a href="#pageAppData2" data-ajax="false" class="arrow_box etask-name ab-pageAppData2"><div class="main-tb"><div class="center-tb" data-i18n="buttons.Husband">Husband</div></div></a>'+
                            '<a href="#pageAppData3" data-ajax="false" class="arrow_box etask-name ab-pageAppData3"><div class="main-tb"><div class="center-tb" data-i18n="buttons.HouseholdMother">HouseholdMother</div></div></a>'+
                            //'<a href="#pageAppData4" data-ajax="false" class="arrow_box etask-name ab-pageAppData4"><div class="main-tb"><div class="center-tb" data-i18n="buttons.Business">Business</div></div></a>'+  
                            //'<a href="#pageWelfareStatus" data-ajax="false" class=" arrow_box etask-name ab-pageWelfareStatus"><div class="main-tb"><div class="center-tb" data-i18n="buttons.FamilyWelfare">FamilyWelfare</div></div></a>'+
                            //'<a href="#pageWorkingCapital" data-ajax="false" class=" arrow_box etask-name ab-pageWorkingCapital"><div class="main-tb"><div class="center-tb" data-i18n="buttons.WorkingCapital">WorkingCapital</div></div></a>'+
                            '<a href="#pageHousingIndex" data-ajax="false" class=" arrow_box etask-name ab-pageHousingIndex"><div class="main-tb"><div class="center-tb" data-i18n="buttons.HousingIndex">HousingIndex</div></div></a>'+
                            '<a href="#pageHouseIncomeEst" data-ajax="false" ng-click="rerender(400)" class=" arrow_box etask-name ab-pageHouseIncomeEst"><div class="main-tb"><div class="center-tb" data-i18n="buttons.Income">Income</div></div></a>'+
                            //'<a href="#pageSignature" data-ajax="false" ng-click="loadsign()" class=" arrow_box etask-name ab-pageSignature"><div class="main-tb"><div class="center-tb" data-i18n="buttons.Signature">Signature</div></div></a>'+
                            `<a href="#pageGroup" data-ajax="false" ng-click="refreshUI()" class=" arrow_box etask-name ab-pageGroup">
                                <div class="main-tb">
                                    <div class="center-tb" data-i18n="buttons.Group">Group</div>
                                </div>
                            </a>`+
                            `<a href="#pageProducts" data-ajax="false" ng-click="checkForReviews()" class=" arrow_box etask-name ab-pageProducts">
                                <div class="main-tb">
                                    <div class="center-tb" data-i18n="buttons.ProductLoan">Product / Loan</div>
                                </div>
                            </a>`+
                        '</div">';

    $("[data-role=main] ").each(function(){

        $(this).prepend(newestheader);
        $(this).trigger("create");

    });

    $(".footer").each(function(){
        //$(this).prepend('<div style="float:left;margin:.5em .5em"><div ng-show="haveGroups()" style="display:inline"><span data-i18n="messages.Group">Group:</span><select ng-show="haveGroups()" class="addToGroup" name="addToGroup" id="addToGroup" ng-model="currGroup" ng-options="value.CLT_GROUP_ID for (key,value) in existingGroups" /></div><span data-i18n="messages.Action">Action:</span><div data-role="controlgroup" data-type="horizontal" style="margin:0.5em 0 0 1em;display:inline"><button type="submit" class="ui-btn ui-btn-g ui-corner-all ui-shadow ui-icon-check ui-btn-icon-left" value="Submit" ng-click="actionSubmit()" data-i18n="buttons.Submit">SUBMIT</button><a href="#" type="submit" class="ui-btn ui-btn-bl ui-corner-all ui-shadow ui-icon-check ui-btn-icon-left" value="Submit" ng-click="addToExistingGroup()" data-inline="true" ng-show="haveGroups()">{{ "ADD" | translate }} {{applicantdata.fullname}} {{ "TO GROUP" | translate }} {{currGroup.CLT_GROUP_ID}}</a><a href="#pageCancel" class="ui-btn ui-btn-r ui-corner-all ui-shadow ui-icon-delete ui-btn-icon-left" data-i18n="buttons.Cancel">Cancel</a></div></div>'+'');
        //$(this).trigger("create");
    });



    $(".addToGroup").each(function(){ $(this).parent().parent().css("display","inline"); });


    //selector re-write
    $("select").each(function(){
        $.mobile.page.prototype.options.keepNative = "select";
        //$.mobile.selectmenu.prototype.options.nativeMenu = true;
        //$.mobile.ignoreContentEnabled = true;
        $(this).closest('.ui-btn').css('background-color','#80C6C7');  //select 1st ancestor of all elements with class="ui-btn" and set the background to green color
        $(this).closest('.ui-btn').css('color','#fff');
        $(this).closest('.ui-btn').css('text-shadow','0 0 0 #fff');
    });



    $("b.ui-table-cell-label").remove();
}


//cancel button when user tries to exit newclient
function navBack(){history.back();return false;}

function checkFunds(fundObj){
            var cols = 0;
    var totalcols = 7;
    for(var key in fundObj){
        cols++;
        if((fundObj[key]===null||fundObj[key]===''||fundObj[key]===undefined||
            (["originalamt","balance","repaymentperwk","repaymentpermth"].indexOf(key)>-1 && isNaN(fundObj[key]))
           ))
        //{alert("There is an empty field in your borrowed funds entry"); return false;}
        {
            //alert(i18n.t("messages.EmptyBorrowedFund"));
            swal({
                title: i18n.t("messages.Alert"),
                text: i18n.t("messages.EmptyBorrowedFund"),
                type: "error",
                confirmButtonColor: "#80C6C7",
                confirmButtonText: "Ok",
            });
            return false;
        }
    }
           // if(cols<totalcols){alert("There is an empty field in your borrowed funds entry"); return false;}
            if(cols<totalcols){
                //alert(i18n.t("messages.EmptyBorrowedFund"));
                swal({
                    title: i18n.t("messages.Alert"),
                    text: i18n.t("messages.EmptyBorrowedFund") + message,
                    type: "error",
                    confirmButtonColor: "#80C6C7",
                    confirmButtonText: "Ok",
                });
                return false;
            }
            return true;
}

$(document).on('pagebeforeshow', function () {
    var URL = $.mobile.path.parseUrl(window.location).toString();

    var strar = URL.split("#");
    var myString = "";
    if(strar.length > 1){
        myString = "#"+strar.pop().trim();
    }

    $('.arrow_box').removeClass('active');
    if(myString != ""){
        $('a[href$="'+myString+'"].arrow_box ').addClass('active');
    } else {
        $('a[href$="#pageAppData"].arrow_box ').addClass('active');
    }

});

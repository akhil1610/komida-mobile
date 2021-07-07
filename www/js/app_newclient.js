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

var myApp = angular.module("myApp", ['ng-currency', 'pascalprecht.translate', 'masonry']);
(function() {
    //var myApp = angular.module("myApp", ['ng-currency']); 
      
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
        return function(amount, num, currencySymbol) {
            if (num===0) num = -1;
            var value = currencyFilter(amount, currencySymbol);
            var sep = value.indexOf(formats.DECIMAL_SEP)+1;
            var symbol = '';
            if (sep<value.indexOf(formats.CURRENCY_SYM)) symbol = ' '+formats.CURRENCY_SYM;
            return value.substring(0, sep+num)+symbol;
        };
        } ]);



      myApp.directive('blockout', function () {
            return function (scope, element, attrs) {
                  attrs.$observe('blockout', function (newValue) {
                        newValue != true && element[0].blur();
                  });
            }
      });


    myApp.directive('initialisation',['$rootScope',function ($rootScope) {
        return {
            restrict: 'A',
            link: function ($scope) {
                var to;
                var listener = $scope.$watch(function () {
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
                            '<div class="ui-input-text ui-body-inherit ui-corner-all ui-shadow-inset">' +
                                '<input id="" class="colVal" ng-blur=""  onclick="this.select();" type="text" ng-model="upa.asset" />' +
                            '</div>' +
                        '</td>' +
                        '<td>' +
                            '<div class="ui-input-text ui-body-inherit ui-corner-all ui-shadow-inset">' +
                                '<input id="" class="colVal" ng-blur=""  onclick="this.select();" ng-click="addnewUpro(upa.ind)" type="tel" ng-model="upa.value"  ng-currency currency-symbol="{{currloc}}"  />' +
                            '</div>' +
                        '</td>'
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
                        if(page== 'pageAppData'){
                              //CHECK APPLICANT

                              if( scope.applicantdata.photo===null||
                                    scope.applicantdata.fullname===null||
                                    scope.applicantdata.gender===null||
                                    // scope.applicantdata.loantype==null||
                                    scope.applicantdata.placeofbirth===null||
                                    //scope.applicantdata.familycardno===null||
                                    scope.applicantdata.ktpno===null||
                                    scope.applicantdata.dateofbirth=== null||
                                    scope.applicantdata.age===null||
                                    scope.applicantdata.age<10||
                                    scope.applicantdata.age>100
                                    // scope.applicantdata.highested=== null||
                                    // (scope.applicantdata.highested=='6'&&scope.applicantdata.highestedothers==="")
                                    ){

                                          if( sweetCheckNull(scope.applicantdata.photo,i18n.t("messages.EmptyPhoto"),"pageAppData")||
                                                sweetCheckNull(scope.applicantdata.fullname,i18n.t("messages.EmptyFullName"),"pageAppData")||
                                                sweetCheckNull(scope.applicantdata.gender,i18n.t("messages.EmptyGender"),"pageAppData")||
                                                // sweetCheckNull(scope.applicantdata.loantype,i18n.t("messages.EmptyLoanType"),"pageAppData")||
                                                //sweetCheckNull(scope.applicantdata.familycardno,i18n.t("messages.EmptyFamilyCardNo"),"pageAppData")||
                                                sweetCheckNull(scope.applicantdata.ktpno,i18n.t("messages.EmptyKTPNo"),"pageAppData")||
                                                sweetCheckNull(scope.applicantdata.dateofbirth,i18n.t("messages.EmptyDOB"),"pageAppData")||
                                                sweetCheckNull(scope.applicantdata.placeofbirth,i18n.t("messages.EmptyPlaceofBirth"),"pageAppData")||
                                                sweetCheckNull(scope.applicantdata.age,i18n.t("messages.EmptyAge"),"pageAppData")||
                                                //sweetCheckNull(scope.applicantdata.highested,i18n.t("messages.EmptyHighestEducation"),"pageAppData")||
                                                sweetCheckRange(10,100,scope.applicantdata.age,i18n.t("messages.InvalidAge"),"pageAppData")
                                          ){

                                          } else if(scope.applicantdata.highested=='6'&&scope.applicantdata.highestedothers===""){
                                                 
                                          }

                                    return false;
                              } else {

                                     
                                    scope.moveToNextPage(page);


                              }


                        } else if(page == 'pageAppData2'){


                              //CHECK MARRITAL 
                              if( scope.husbandinfo.maritalstatus===null||
                                    (scope.showHusband()&& scope.husbandinfo.husbandname===null)
                                    //(scope.showHusband()&& scope.husbandinfo.husbandidno===null)
                                    ){
                                          if( sweetCheckNull (scope.husbandinfo.maritalstatus,i18n.t("messages.EmptyMaritalStatus"))
                                          ){

                                          } else  if(scope.showHusband()&&(scope.husbandinfo.husbandname===null)){

                                                swal({
                                                title: i18n.t("messages.Alert"),
                                                text: i18n.t("messages.EmptyHusbandName"),
                                                type: "error",
                                                confirmButtonColor: "#80C6C7",
                                                confirmButtonText: "Ok", 
                                                });
                                          } else if(scope.showHusband()&&(scope.husbandinfo.husbandidno===null)){
                                                 
                                          }
                                    e.stopPropagation();
                                    e.preventDefault();
                                    return false;

                              } else {
                                     
                                    scope.moveToNextPage(page);
                                     setTimeout(function(){ 
                                          scope.$apply(function(){
                                                if(scope.family.length == 0) {
                                                 
                                                }
                                          });
                                          
                                    },1450);
                                    

                              }

                        } else if(page == 'pageAppData3'){
                               //Check to see if there is mother data
                               
                            if( scope.housemotherinfo.parentsresidence === null || scope.housemotherinfo.parentsresidence === undefined) {
                                if( sweetCheckNull (scope.housemotherinfo.parentsresidence,i18n.t("messages.EmptyParentsResidence"))
                                    ){
                                        e.stopPropagation();
                                        e.preventDefault();
                                        return false;
                                    }
                            } else if(scope.checkEmptyFam()){
                                swal({
                                    title: i18n.t("messages.Alert"),
                                    text: i18n.t("messages.UnfilledMember"),
                                    type: "warning", 
                                }).then(function(response){
                                    if( response ) {
                                        scope.removeUnfilledFamilyMembers();
                                        scope.moveToNextPage(page);
                                    } 
                                });
                            } else {
                                if( scope.checkFamilyFilled() ) {
                                    scope.moveToNextPage(page);
                                }
                            }
                              
                        } else if(page == 'pageAppData4'){
                            var alldone = true;
                            $.each(scope.ppiQuestions, function(q, qtn) { 
                                if(qtn.PPIQ_NEED_ANSWER==="Y" && !qtn.answer) {
                                    console.log(qtn);
                                    alldone = false;
                                }
                            });
                            if (!alldone) {
                                e.stopPropagation();
                                e.preventDefault();
                                swal({ 
                                    title: i18n.t("messages.IncompletePPI"),
                                    text: i18n.t("messages.PleasefillPPI"), 
                                    type: "info",
                                });
                                return false;
                            } else {
                                scope.moveToNextPage(page);
                            }   

                        } else if(page == 'pageAddress'){
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
                                     
                                    scope.moveToNextPage(page);
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
                                     
                                    scope.moveToNextPage(page);
                              }

                        } else if(page == 'pageWorkingCapital'){

                              if(scope.borrowedFunds.length>0){
                                    for(var key in scope.borrowedFunds){
                                          if(!scope.checkFunds(scope.borrowedFunds[key])){


                                                e.stopPropagation();
                                                e.preventDefault();
                                                return false;
                                          }
                                    }
                              }

                              if( scope.workcap.app===null|| isNaN(scope.workcap.app)||
                                    (scope.husbandinfo.maritalstatus=='M'&&scope.workcap.husband===null) || (scope.husbandinfo.maritalstatus=='M'&&isNaN(scope.workcap.husband))){

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
                                     
                                    scope.moveToNextPage(page);
                              }

                        } else if(page == 'pageHousingIndex'){

                              if( scope.applicantdata.homeless != 'YES' &&
                                    ( 
                                    scope.choices[2]===0||
                                    scope.choices[3]===0||
                                    scope.choices[4]===0) ){ 

                                          if(
                                              
                                                sweetCheckZero(scope.choices[2],i18n.t("messages.EmptyRoofType"),"pageHousingIndex")||
                                                sweetCheckZero(scope.choices[3],i18n.t("messages.EmptyWallType"),"pageHousingIndex")||
                                                sweetCheckZero(scope.choices[4],i18n.t("messages.EmptyFloorType"),"pageHousingIndex")
                                                
                                          )
                                          {

                                          }
                                    e.stopPropagation();
                                    e.preventDefault();
                                    return false;
                              } else {
                                     
                                    setTimeout(function(){  
                                          scope.moveToNextPage(page)  
                                    },1450); 
                                    
                              }

                        } else if(page == 'pageHouseIncomeEst'){

                              
                              scope.moveToNextPage(page);


                        } else if(page == 'pageProductMapping'){
                               
                              if(scope.selectedLoans.length === 0){
                                    swal({
                                          title: i18n.t("messages.Alert"),
                                          text: i18n.t("messages.NoLoanSelected"),
                                          type: "warning", 
                                    }).then(function(){
                                          return false;
                                    });
                                    return false;
                              } else {
                                    var totalloan = 0;
                                    for(var key in scope.selectedLoans){
                                          // if($scope.selectedLoans[key].selecteddetails.)
                                          totalloan += scope.selectedLoans[key].selecteddetails.loanamt;
                                    }

                                    if(totalloan > 10000000) {
                                          swal({
                                                title: i18n.t("messages.Alert"),
                                                text: i18n.t("messages.LoansExceed"),
                                                type: "warning", 
                                          }).then(function(){
                                                return false;
                                          });
                                          return false;
                                    }
                                    $.mobile.changePage('#loanSummary');
                                    return false;
                                     
                              }
                        }
                        
                  });
                   
                  scope.moveToNextPage = function(page){
                        console.log(page);
                        scope.pages.forEach(function(pg,p){
                              if(page == 'pageProductMapping'){
                                    setTimeout(function(){
                                          $.mobile.changePage('#loanSummary');
                                    },1000);
                                    return false; 
                              } else if (page == pg){
 
                                    var nxtPageIdx = p+1;
                                    var nextPage = "";
                                    var DefMovePercentage = 100 / parseInt(scope.pageStepDownAtIndex);
                                    if(p+1 == scope.pages.length){
                                          //If Last Page
                                          nextPage = '#loanSummary';
                                    } else {
                                          nextPage = scope.pages[p+1]
                                    } 
                                   
                                    var selectedClass = '.etask-progress';
                                    var selectedBarClass = '.etask-progress-bar';
                                    
                                    $("html, body").animate({ scrollTop: 0 }, 600);
                                    if(p < scope.pageStepDownAtIndex){
                                          //Move right
                                          selectedClass = '.etask-progress';
                                          selectedBarClass = '.etask-progress-bar'; 
                                          movePercentage = DefMovePercentage * nxtPageIdx;
                                    } else if (p == scope.pageStepDownAtIndex) {
                                          //Move down at this step 
                                          movePercentage = DefMovePercentage * scope.pageStepDownAtIndex; 
                                          selectedBarClass += '-vert';
                                    } else {
                                          //Move left 
                                          nxtPageIdx = (scope.pages.length - 1 - scope.pageStepDownAtIndex) - ( nxtPageIdx- scope.pageStepDownAtIndex );
                                          movePercentage = DefMovePercentage * nxtPageIdx;
                                          nxtPageIdx = nxtPageIdx + 2;
                                          selectedClass += '-reverse';
                                          selectedBarClass += '-reverse'; 
                                    } 

                                    console.log("selectedClass : "+ selectedClass);
                                    console.log("selectedBarClass : "+ selectedBarClass);
                                    console.log("nextPage : "+ nextPage);
                                    console.log("nxtPageIdx : "+ nxtPageIdx); 
                                    
                                    $( selectedClass+" .etask:nth-child("+nxtPageIdx+")" ).find('.etask-icon i').removeClass('hidden');
                                    if(p == scope.pageStepDownAtIndex){ //downwards
                                          $(selectedBarClass).css('height',movePercentage+'%');
                                    } else {//left or right
                                          $(selectedBarClass).css('width',movePercentage+'%'); 
                                    }
                                   
                                    $(selectedClass+" .etask:nth-child("+nxtPageIdx+")").find('.etask-icon i').delay(700).animate({
                                          opacity: '1',
                                          height: '3em',
                                          width: '3em',
                                          'line-height': '3em',
                                          left: '-0.5em',
                                          top: '-0.5em',
                                    },300);
                                    setTimeout(function(){
                                          $.mobile.changePage('#'+nextPage); 
                                    },1450); 
                                    return false;
                              }
                        });
                        return false;
                  }

                  function checkIncomes(incObj){
                        var cols = 0;
                        var totalcols = 8;
                        for(var key in incObj){
                              cols++;
                              if((incObj[key]===null||incObj[key]===''||incObj[key]===undefined||
                              (["owncapita","revpermth","exppermth","profpermth"].indexOf(key)>-1 && isNaN(incObj[key]))
                              //   )) {alert("There is an empty field in your income entry");return false;} //&&incObj[key]!==0
                              )) {
                                    //alert(i18n.t("messages.EmptyIncomeEntry"));
                                    swal({
                                          title: i18n.t("messages.Alert"),
                                          text: i18n.t("messages.EmptyIncomeEntry"),
                                          type: "error",
                                          confirmButtonColor: "#80C6C7",
                                          confirmButtonText: "Ok", 
                                    });
                                    return false;
                              } //&&incObj[key]!==0
                        }
                        // if(cols<totalcols){alert("There is an empty field in your income entry"); return false;}
                        if(cols<totalcols){
                              //alert(i18n.t("messages.EmptyIncomeEntry"));
                              swal({
                              title: i18n.t("messages.Alert"),
                              text: i18n.t("messages.EmptyIncomeEntry"),
                              type: "error",
                              confirmButtonColor: "#80C6C7",
                              confirmButtonText: "Ok", 
                              });

                              return false;
                        }
                        return true;
                  }

                  }
            };
      });

    myApp.filter('reverseArray', function() {
        return function(items) {
            if (!angular.isArray(items)) return false;
            return items.slice().reverse();
        };
    });

    myApp.filter('groupFilter', function() {
        return function(groups,centerid) {
            var filtered = [];
            angular.forEach(groups, function(item) {
                if(item.CENTER.value == centerid){
                    filtered.push(item);
                }
            });
            return filtered;
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


	myApp.controller("clientCtrl", function($scope,$filter,$timeout,$rootScope){

        //$scope.$on('$viewContentLoaded', jqueryStartWork);

        $scope.$on('ngRepeatFinished', function (ngRepeatFinishedEvent) {
             
        });
        /**
        !note: remove this Magic Button
        **/
        var cmd = "select * from T_COMPANY WHERE CMP_PK ="+sessionStorage.getItem("CMP_PK");
        myDB.execute(cmd, function(results){
            $scope.cmp_id = results[0].CMP_ID;
        });
        $scope.currloc = '';
        $scope.activeloan = null;
        $scope.centerLeader = 0;


        $scope.pages = [
              'pageAppData',
              'pageAddress',
              'pageAppData2', 
              'pageAppData3',   
              'pageHousingIndex',
              'pageHouseIncomeEst',
              'pageAppData4',
              'pageProductMapping',
              'loanSummary'
            ];

        $scope.pageStepDownAtIndex = 3;


        //TEXTS IN NG-REPEAT
        $scope.grouptext = i18n.t("messages.Group");
        $scope.actiontext = i18n.t("messages.Action");
        $scope.currGrp = {};
        $scope.leader = null;
        $scope.available = [];
        $scope.savedGrps = [];
        $scope.currloc = 0;
        $scope.unproassets = [];
        $scope.family = [];

        
        $scope.maxMembers = 0;
        myDB.execute("SELECT BRC_NOOFCLIENTS_INGROUP FROM T_BRANCH", function(results){
            if(results.length > 0){
                if(results[0].BRC_MAX_GRP_CLIENT !== '' && results[0].BRC_MAX_GRP_CLIENT !== null) {
                    $scope.maxMembers = results[0].BRC_MAX_GRP_CLIENT;
                }
            }
        });
        
        $scope.feastrepay = feastrepay;
        $scope.selectedRepayment =  null;

        setTimeout(function(){
            $scope.nametxt = i18n.t("messages.Name"); 
	        $scope.birthdatetxt = i18n.t("messages.DOB");
	        $scope.relationshiptxt = i18n.t("messages.Relationship");
	        $scope.gendertxt = i18n.t("messages.Gender");
            $scope.worktxt = i18n.t("messages.Work");
            $scope.maritalstatustxt = i18n.t("messages.MaritalStatus");
	        $scope.birthplacetxt = i18n.t("messages.BirthPlace");
            $scope.educationtxt = i18n.t("messages.Education");
            $scope.productnametxt = i18n.t("messages.ProductName");
            $scope.withdrawalpolicytxt = i18n.t("messages.WidthdrawalPolicy");
            $scope.closingpolicytxt = i18n.t("messages.ClosingPolicy");
            $scope.closingfeetxt = i18n.t("messages.ClosingFee");
            $scope.Loanamttxt = i18n.t("messages.LoanAmt");
            $scope.maturitytxt = i18n.t("messages.Maturity");
	    },1);


        $scope.unproaObj = {
            index: 0,
            asset: '',
            value: 0
        };


        $scope.magic = function(){
            return false;
            if(!devtest) return false; //no magic buttons for production
            //or transparent : data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7
            $scope.applicantdata.photo='data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
            $scope.applicantdata.fullname="Jaminah";
            $scope.applicantdata.nickname="Jaminah";
            $scope.applicantdata.gender='F';
            $scope.applicantdata.placeofbirth='Place of Birth';
            $scope.applicantdata.dateofbirth='';
            $scope.applicantdata.familycardno=891267853601;
            $scope.applicantdata.clientno=345650870001;
            $scope.applicantdata.ktpno=554601353001;
            //$scope.applicantdata.dateofbirth='1980-01-01'; //this never works with date fields for some reason
            document.getElementById("ncadDateofBirth").value='1980-01-01';
            $scope.applicantdata.age=30;
            $scope.applicantdata.highested=1;
            $scope.applicantdata.highestedothers="";

            $scope.husbandinfo.maritalstatus='M';
            $scope.husbandinfo.husbandname='Muso';
            $scope.husbandinfo.husbandidno=3996804301;
            $scope.husbandinfo.livesinhouse='Y';
            $scope.husbandinfo.whereis='Home';
            $scope.husbandinfo.howoften='1W';

            $scope.housemotherinfo.noofmembers=5;
            $scope.housemotherinfo.noofchildren=2;
            $scope.housemotherinfo.mothername='Padmavati';
            //$scope.housemotherinfo.motherdob='1980-01-01';
            document.getElementById("ncadMotherBirthdate").value='1980-01-01';
            $scope.housemotherinfo.motherage=50;

            $scope.businessinfo.typeofbusiness='Sundry Shop';
            $scope.businessinfo.busequipment='Wooden cart';
            $scope.businessinfo.jointbusiness='NA';
            $scope.businessinfo.jbequipment='NA';
            $scope.businessinfo.husbandbusiness='Bus Driver';
            $scope.businessinfo.hbequipment='NA';

            $scope.address.rt='30';
            $scope.address.rw='30';
            $scope.address.streetarea='Sidowarak';
            //$scope.address.village.val=7;
            $scope.address.subdistrict='Jombang';
            $scope.address.district='Jombang';
            $scope.address.province='West Java';
            $scope.address.postcode=46300543;
            $scope.address.landmark='Mosque of Bandung';
            $scope.address.mobile1=81676177;
            $scope.address.mobile2=81676177;
            $scope.address.husbmobile=81676177;

            $scope.welfareStatus='W2';
            $scope.workcap.app=500;
            $scope.workcap.husband=400;
            $scope.houseinfo.housetype=1;
			      $scope.choices = [1,1,1,1,1,1,1];

            // $scope.unproassets[0].asset = 'House';
            // $scope.unproassets[0].value = '1000000';

            $scope.unproassets.push({ index: 0, asset: 'House', value: '10000000'});


            $scope.houseIncomes = [{
                capitalby:"C",
                activity:1,
                location:"Locale",
                owncapita:100,
                revpermth:50,
                exppermth:20,
                profpermth:30,
                totalinmth:20,
            }];

        };

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
                console.log(btoa(imageData)); 
            }
        };

        $scope.removePhoto = function(){
            var image = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
            $scope.applicantdata.photo = image;
            $("#ncadPhoto").src = image;
        };

        $scope.onSuccess = function (imageData) {
            $scope.$apply(function() {
                ////console.log(imageData);
                $scope.applicantdata.photo = "data:image/jpg;base64," + imageData;
                $("#ncadPhoto").src = "data:image/jpg;base64," + imageData;
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

        $scope.InsurancePk = 0;
        $scope.MembersharePk = 0;

        $scope.getProductMaster = function(){

            var cmd = "SELECT * FROM T_PRODUCT_MASTER";
            myDB.execute(cmd,function(res){
                $.each(res,function(i,val){
                    if(val.PRM_CODE == '002.0005'){
                        $scope.MembersharePk = val.PRM_PK;
                    }
                    if(val.PRM_CODE == '22400000'){
                        $scope.InsurancePk = val.PRM_PK;
                    }
                });
            });
        };

        $scope.getProductMaster();

        /******************************************
        - Applicant's Data
        ******************************************/

        $scope.applicantdata = {
            photo:null,
            filename:null,
            fullname:null,
            nickname:null,
            gender: null,
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
            havePastmembership: 'NO',
            havecooperate: 'NO',
            haveotherbank: 'NO',
            haveinstitutes: 'NO',
            homeless: 'NO',
            membertype: '',
            hasSigned: false,
            CLT_SIGNATURE: null,
            CLT_PK: null,
            groupid: null,
            witness: {
                hasSigned: false,
                witness_name: '',
                witness_pk: null
            }, 
        };  
        refreshall('#ncadGender');
        $scope.maxPPIFormPk = 0;
        $scope.maxPPIAnsPk = 0;
        $scope.isPPIComplete = false;

        $scope.user = {
            userPK:USER_PK,
            userName:USER_NAME,
            userHaveSig:USER_HAVE_SIG,
            branchPK:BRC_PK,
            branchName:BRC_NAME,
            companyName:CMP_NAME,    
            Signature: USER_SIG,
            hasSigned: false
        };

        $scope.showSign = false;
        $scope.signingclientIndex = null;
        $scope.signinguser = null;

        $scope.groupmembers = null;

        $scope.ctr_lead = {
            ctr_lead_pk: null,
            ctr_lead_name: null,
            Signature: null,
            hasSigned : null,
            ctr_leaders: []
        };

        $scope.grp_lead = {
            grp_lead_pk: null,
            grp_lead_name: null,
            Signature: null,
            hasSigned: null
        };

        $scope.familyMember = {
            membertype: 'SUA',
            membername: '',
            hasSigned: false,
            Signature: null
        }

        $scope.witnesses = {
            hasSigned: false,
            witness_name: '',
            witness_pk: null
        };

        $scope.selectedWitness = null;

        $scope.apHighestEdOthers = function(){
            return $scope.applicantdata.highested=="6";
        };

        $scope.adCalcAge = function(){
            var year = (document.getElementById('ncadDateofBirth').value).split("-")[0];
            var diff = parseInt(moment().format('YYYY'))-parseInt(year);
            var age = 0;
            if(diff===null||isNaN(diff)) age = 0;
            else age = diff;
            $scope.applicantdata.age = age;
            return age;
        };

        $scope.getAge = function(dateString){
            console.log(dateString);
            var year = dateString.split("-")[0];
            var diff = parseInt(moment().format('YYYY'))-parseInt(year);
            var age = 0;
            if(diff===null||isNaN(diff)) age = 0;
            else age = diff; 
            return age;
        }

        $scope.checkHomeless = function(){

            if($scope.applicantdata.homeless == 'Y'){
                $scope.tempchoices = $scope.choices;
                $scope.choices = [null,null,null,null,null,null,null];
            } else {
                $scope.choices = $scope.tempchoices;
            }

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
            //return $scope.husbandinfo.maritalstatus=='M'||$scope.husbandinfo.maritalstatus=='D'||$scope.husbandinfo.maritalstatus=='W';
        };
        $scope.husbandLiving = function(){
            console.log($scope.husbandinfo.livesinhouse);
            if($scope.husbandinfo.livesinhouse == 'YES'){
                return false;
            } else {
                return true;
            }
        }

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

        $scope.hmiCalcMotherAge = function(){
            var year = (document.getElementById('ncadMotherBirthdate').value).split("-")[0];
            var diff = parseInt(moment().format('YYYY'))-parseInt(year);
            var age = 0;
            if(diff===null||isNaN(diff)) age = 0;
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
                setTimeout(function() {
                      $scope.$apply();  
                      $scope.rerenderCheckbox('.schoolingcode')
                  }, 100);
            }
        };

        $scope.rerenderCheckbox = function(cls){
            var nth = $scope.family.length - 1;
            $(cls+nth).removeClass('ui-checkbox-off');
            $(cls+nth).addClass('ui-checkbox-on');
        }

        $scope.checkEmptyFam = function(){
            var haveEmptyFam = false;
            $scope.family.forEach(function(fam,f){
                if(fam.name === null){
                    haveEmptyFam = true;
                } else {
                    
                }
            });
            return haveEmptyFam;
        }

        $scope.checkFamilyFilled = function(){ 
            var allFilled = true;
            var missingInfo = false; 
            $scope.family.forEach(function(fam,f){ 
                if ( fam.birthdate == null || fam.birthdate == '') {
                    missingInfo = true;
                } else if (fam.famcode == null || fam.famode == '') {
                    missingInfo = true;
                } else if (fam.work == null || fam.work == '') {
                    missingInfo = true;
                } else if (fam.educode == null || fam.educode == '') {
                    missingInfo = true;
                } else if (fam.maritalstatus == null || fam.maritalstatus == '') {
                    missingInfo = true;
                } else if (fam.isschooling == null && fam.isschooling == '') {
                    missingInfo = true;
                }
                if ( missingInfo ) { 
                    allFilled = false;
                    swal({
                        title: i18n.t("messages.Alert"),
                        text: i18n.t("messages.EmptyFamilyInfo"),
                        type: "error",
                        confirmButtonColor: "#80C6C7",
                        confirmButtonText: "Ok", 
                  }).then(function(){
                        
                  });
                }
            }); 
            return allFilled;
        }

        $scope.removeUnfilledFamilyMembers = function(){
             
            $scope.family.forEach(function(fam,f){
                  if(fam.name === null){
                        $scope.family.splice(f,1);
                  }
            }); 
            console.log("FAMILY");
            console.log($scope.family);
            $scope.$apply();
        }

        $scope.checkUniqueMother = function(thisfam){
            var hasMohter = false;
            if(thisfam.famcode == 'IBU'){
                  $scope.family.forEach(function(fam,f){
                        if(fam.famcode == 'IBU'){
                              if(!hasMohter){
                                    hasMohter = true;
                              } else {
                                    swal({
                                          title: i18n.t("messages.Alert"),
                                          text: i18n.t("messages.NoTwoMothers"),
                                          type: "error",
                                          confirmButtonColor: "#80C6C7",
                                          confirmButtonText: "Ok", 
                                    }).then(function(){
                                          thisfam.famcode = null;
                                    });
                                    return false;
                              }
                              
                        }
                  })
            } 
        }

        $scope.getDefRecFamily = function(famCode){

            // var famObj = null;
            // if(famCode !== null){
            //       $scope.selectCodes[21].forEach(function(code,c){
            //             console.log(code);
            //             if(code.value == famCode) famObj = code.value;
            //       });
            // }

            return {
                name: null,
                birthplace: null,
                birthdate: null,
                gender: '',
                work: $scope.joblist[0].value,
                education: '',
                eduinfo:'',
                famcode: famCode,
                isschooling: 1,
                status: 8,
                isNew: false
            };
        };

        $('body').on('pageshow','#pageHouseIncomeEst',function(event,ui){ 
            $scope.rerender(1);
        })

        $scope.moveToPreviousPage = function(page){

            $scope.pages.forEach(function(pg,p){
                  if(pg == page){
                        var prevPage = $scope.pages[p-1];
                        console.log(prevPage);
                        $.mobile.changePage('#'+prevPage);
                  }
            });
            
        }

        $scope.checkSch = function(schooling,$event){

            console.log(schooling);
            var obj = $event.currentTarget;
            console.log($(obj).attr('id'));
            var id = $(obj).attr('id');
           
            if(parseInt(schooling) == 0) {
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
            console.log(schooling);
            if(parseInt(schooling) == 0) display = i18n.t("messages.IsNotSchooling");
 
            return display;
        };
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
            }
        };

        $scope.addFund = function(){
            if(!$scope.checkFunds($scope.fundEntry)) return false;
            $scope.borrowedFunds.push($scope.fundEntry);
                    //console.log($scope.borrowedFunds);
            var lf = $scope.fundEntry.loanfrom,
                app = $scope.fundEntry.applicant;
            $scope.fundEntry = {};
            $scope.fundEntry.loanfrom = lf;
            $scope.fundEntry.applicant = app;
        };

        $scope.selectFund = function(newinfo){
            if($scope.selectedfund!=-1&&$scope.selectedfund!=newinfo){
                if(!$scope.checkFunds($scope.borrowedFunds[$scope.selectedfund])) return false;
            }
            $scope.selectedfund=newinfo;
        };

		/******************************************
        - Product Mapping
        ******************************************/

		$scope.products = [];
        $scope.loantypes = [];
        $scope.loanpurpose = [];
		$scope.selectOption = function(idx, obj){ 
            $('.newprodmat').each(function(i, element) {
                var selected = $(this).find('option:selected').text();
                if(selected !== null && selected !== ''){
                    $(this).parent().find('span').html(selected);
                }

            });
		};

        $scope.loadLoanPurpose = function(){
            myDB.execute("SELECT * FROM T_LOAN_PURPOSE WHERE LPU_LTY_PK = 34",function(results){
                if(results.length > 0){
                    $.each(results, function(i,val){

                        var key = { value: val.LPU_PK, name: val.LPU_NAME, code: val.LPU_CODE, loan: val.LPU_LTY_PK };
                        $scope.loanpurpose.push(key);
                    });
                }
            });
        };
		$scope.loadLoanPurpose();

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
                        text: i18n.t("messages.EmptyBorrowedFund") + message,
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

        $scope.incomeDetailoptions = [
            {label: 'Metre Square', value: 'Metre Square'},
            {label: 'Slot', value: 'Slot'},
            {label: 'Hectare', value: 'Hectare'}
        ];


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

            return sum;
        };

        $scope.checkIncome = function(i, income) {
            if ( income.fixed == '' || income.fixed == null || income.fixed == undefined || isNaN(income.fixed)) {
                $scope.houseIncomes[i].fixed = 0;
            }
            if ( income.variable == '' || income.variable == null || income.variable == undefined || isNaN(income.variable)) {
                $scope.houseIncomes[i].variable = 0;
            }
        }

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

        $scope.showSelect = function(income){


            if(income.source=='HUSBAND' && !$scope.showHusband()){
                return false;
            }

            return true;

        };

        $scope.rerender = function(time){

            if(time === null || time === undefined) time = 1;

            var rum = $scope.houseIncomes;
            $scope.houseIncomes = [];
            $scope.$apply(); 
            $timeout(function () {
                  $scope.houseIncomes = rum;
                  
                  refreshall('.incomedetails');    
            },time);


        };

        $scope.change = function(income){ 
            income.detaildesc = income.detaildesc.value;
        }; 

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
                $scope.loadPPIQuestions()
            })
        }

        $scope.loadCodes();

        //$scope.loadIncomes();
        $scope.ppiQuestions = [];
        $scope.loadPPIQuestions = function() {
            myDB.execute("SELECT * FROM T_PPI_QUESTION WHERE PPIQ_SECOND_LOAN = 'N' ORDER BY PPIQ_PK", function(questions) {
                console.log(questions)
                questions.forEach(function(qtn) {
                    $scope.loadOptionsForQuestion(qtn);
                });
            })
        }

        $scope.isQtnType = function(qtn, type) {
            var canShow = false;
            if (type == 'text') {
                canShow =  qtn.PPIQ_CODE_TYPE_PK === 'null';
            } if (type == 'select') {
                canShow =   qtn.PPIQ_CODE_TYPE_PK !== 'null';
            }
            return canShow;
        }

        $scope.loadOptionsForQuestion = function(qtn) {
            qtn.answer = null;
            myDB.execute("SELECT * FROM T_CODE WHERE CODE_TYPE_PK=" + qtn.PPIQ_CODE_TYPE_PK, function(res) {
                if(res.length > 0) {
                    qtn.options = res;
                    qtn.answer = null;
                }
                $scope.ppiQuestions.push(qtn);
            })
        }

        $scope.getTotalPPIScore = function(){
            var score = 0;
            $scope.ppiQuestions.forEach(function(qtn) {
                if(qtn.answer != null && qtn.PPIQ_CODE_TYPE_PK != 'null') {
                    score += parseInt(qtn.answer.CODE_VALUE);
                }
            });
            return score;
        }

        $scope.checkFunds = function(fundObj){
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
                        text: i18n.t("messages.EmptyBorrowedFund") + message,
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
                            text: i18n.t("messages.EmptyBorrowedFund"),
                            type: "error",
                            confirmButtonColor: "#80C6C7",
                            confirmButtonText: "Ok", 
                        });
                        return false;
                    }
                    return true;
        };

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

        $scope.selectedEntry = -1;

        $scope.addEntry = function(){
            if(!checkIncomes($scope.incomeEntry)) return false;
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
                if(!checkIncomes($scope.houseIncomes[$scope.selectedEntry])) return false;
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

        function checkIncomes(incObj){
            var cols = 0;
            var totalcols = 8;
            for(var key in incObj){
                cols++;
                if((incObj[key]===null||incObj[key]===''||incObj[key]===undefined||
                    (["owncapita","revpermth","exppermth","profpermth"].indexOf(key)>-1 && isNaN(incObj[key]))
                //   )) {alert("There is an empty field in your income entry");return false;} //&&incObj[key]!==0
				   )) {
                        //alert(i18n.t("messages.EmptyIncomeEntry"));
                        swal({
                            title: i18n.t("messages.Alert"),
                            text: i18n.t("messages.EmptyIncomeEntry"),
                            type: "error",
                            confirmButtonColor: "#80C6C7",
                            confirmButtonText: "Ok", 
                        });
                        return false;
                    } //&&incObj[key]!==0
            }
           // if(cols<totalcols){alert("There is an empty field in your income entry"); return false;}
			if(cols<totalcols){
                //alert(i18n.t("messages.EmptyIncomeEntry"));
                swal({
                    title: i18n.t("messages.Alert"),
                    text: i18n.t("messages.EmptyIncomeEntry"),
                    type: "error",
                    confirmButtonColor: "#80C6C7",
                    confirmButtonText: "Ok", 
                });

                return false;
            }
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
        $scope.choices = [0,0,0,0,0,0,0];


        $scope.deleteFund = function(newinfo){
            $scope.borrowedFunds.splice(newinfo,1);
            $scope.selectedfund = -1;
        };

        $scope.getTotal = function(){
            total = 0;
            for(var e in $scope.choices) total += +$scope.choices[e];
            $scope.housetotal = total;
            return total;
        };


        $scope.getNoOfChildren = function(){
            var noochildren = 0;
            $scope.family.forEach(function(fam,f){
                  if($scope.getAge(fam.birthdate) < 18){
                        noochildren++;
                  }
            });
            return noochildren;
        }

        $scope.getMotherData = function(){
            var mother = null;
            $scope.family.forEach(function(fam,f){
                  if(fam.famcode == 'IBU'){
                        mother = fam;
                  }
            });
            return mother;
        }




      /******************************************
       - Submit
      ******************************************/ 

      $scope.actionSubmit = function(groupname){ 
             
			if( 
                sweetCheckNull($scope.applicantdata.photo,i18n.t("messages.EmptyPhoto"),"pageAppData")||
                sweetCheckNull($scope.applicantdata.fullname,i18n.t("messages.EmptyFullName"),"pageAppData")||
                sweetCheckNull($scope.applicantdata.gender,i18n.t("messages.EmptyGender"),"pageAppData")||
        
                sweetCheckNull($scope.applicantdata.ktpno,i18n.t("messages.EmptyKTPNo"),"pageAppData")||
                sweetCheckNull($scope.applicantdata.dateofbirth,i18n.t("messages.EmptyDOB"),"pageAppData")||
                sweetCheckNull($scope.applicantdata.age,i18n.t("messages.EmptyAge"),"pageAppData")||
                sweetCheckRange(10,100,$scope.applicantdata.age,i18n.t("messages.InvalidAge"),"pageAppData")
              ){
                $.mobile.changePage("#pageAppData");
                return false;
            }

            

            if($scope.applicantdata.highested=='6'&&$scope.applicantdata.highestedothers===""){
                 
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

            if($scope.showHusband()&&($scope.husbandinfo.husbandname===null)){

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

            if($scope.showHusband()&&($scope.husbandinfo.husbandidno===null)){
                 
            }

             
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

             

            if($scope.applicantdata.homeless != 'YES'){
                if(
                    
                    checkNull($scope.choices[2],i18n.t("messages.EmptyRoofType"))||
                    checkNull($scope.choices[3],i18n.t("messages.EmptyWallType"))||
                    checkNull($scope.choices[4],i18n.t("messages.EmptyFloorType"))
        
                )
                { 
                    return false;
                }
            }


       

			//check product mapping
            for(var key in $scope.products){
                  if(($scope.products[key].isSelected == "YES") &&
					($scope.products[key].maturityOptions != null && $scope.products[key].maturityOptions.length > 0) &&
                    sweetCheckNull($scope.products[key].selectedMaturityOption.id,i18n.t("messages.EmptyMaturityOption"),"pageProductMapping")
                  ) {
                        swal({
                              title: i18n.t("messages.Alert"),
                              text: i18n.t("messages.EmptyMaturityOption"),
                              type: "warning", 
                        }).then(function(){
                              $.mobile.changePage("#pageProductMapping");
                        });

                        return false;
                  }
                  
            }
            

            if($scope.selectedLoans.length === 0){
                  swal({
                        title: i18n.t("messages.Alert"),
                        text: i18n.t("messages.NoLoanSelected"),
                        type: "warning", 
                  }).then(function(){
                        $.mobile.changePage("#pageProductMapping");
                  });
            } else {
                  for(key in $scope.selectedLoans){
                        // if($scope.selectedLoans[key].selecteddetails.)
                  }
            }
 

            swal({
                title: i18n.t("messages.Alert"),
                text: i18n.t("messages.SubmitNewClientInfo"),
                type: "warning", 
                confirmButtonText: i18n.t("messages.Yes")
            }).then(function(isConfirm){
                if(isConfirm) $scope.actionSubmitSecond(groupname);
            },function(){
							
            });  
 
            return false;
        }

        $scope.getIncomeCapita = function(){

            var houseIncomes = $scope.houseIncomes;
            var housemotherinfo = $scope.housemotherinfo;
            var noOfHouseholdMembers = $scope.family.length;

            var totalincome = 0;
            totalincome = $scope.getTotalIncome();

            var incomepercapita =  totalincome;
            if(noOfHouseholdMembers !== null && noOfHouseholdMembers > 0) incomepercapita = parseFloat(totalincome / noOfHouseholdMembers);

            return incomepercapita.toFixed(0);
        };

        $scope.actionSubmitSecond = function(groupname){  
             
            //check undefined for all listed fields and replace with ''
            var allscopes = [$scope.applicantdata,$scope.husbandinfo,$scope.housemotherinfo,$scope.husbandinfo,$scope.businessinfo,$scope.address,$scope.workcap,$scope.houseinfo,$scope.choices,$scope.borrowedFunds,$scope.houseIncomes, $scope.products];

            $.each(allscopes, function(id, scoper){
                $.each(scoper, function(id, field){
                    if(field===undefined) {
                        field='';
                    }
                });
            });

            
            var query = "SELECT * FROM (SELECT MAX(CLT_PK) as mclt_pk FROM T_CLIENT) AS TC INNER JOIN (SELECT MAX(CLL_PK) as mcll_pk FROM T_CLIENT_LOAN) AS TCL INNER JOIN (SELECT MAX(CEF_PK) as mcef_pk FROM T_CLIENT_BORROWED_FUNDS) AS TCEF INNER JOIN (SELECT MAX(CLI_PK) as mcli_pk FROM T_CLIENT_INCOME) AS TCLI INNER JOIN (SELECT MAX(CPM_PK) as mcpm_pk FROM T_CLIENT_PRODUCT_MAPPING) AS TCPM INNER JOIN (SELECT MAX(CAL_PK) as mcal_pk FROM T_CLIENT_ASSET_LIST) AS TACL INNER JOIN (SELECT MAX(CFL_PK) as fcal_pk FROM T_CLIENT_FAMILY_LIST) AS CFL";

            var applicantdata = $scope.applicantdata;
            var husbandinfo = $scope.husbandinfo;
            var housemotherinfo = $scope.housemotherinfo;
            var businessinfo = $scope.businessinfo;
            var address = $scope.address;
            var welfareStatus = $scope.welfareStatus;
            var workcap = $scope.workcap;
            //FIX
            workcap.app = 0;
            var houseinfo = $scope.houseinfo;
                houseinfo.housetype = 0;
            var choices = $scope.choices;
            var housetotal = $scope.housetotal;
            var borrowedFunds = $scope.borrowedFunds;
            var houseIncomes = $scope.houseIncomes;
            var products = $scope.products;

            workcap.husband = workcap.husband === null ? 0 : workcap.husband;

            if(applicantdata.familycardno === null ) applicantdata.familycardno = '';

            var isHomeless = $scope.applicantdata.homeless != 'YES' ? 'N' : 'Y';

            var d = new Date(applicantdata.dateofbirth);
            var appAge = applicantdata.age+"";
            var appdateofbirth = d.getDate()+"/"+(d.getMonth()+1)+"/"+d.getFullYear();//+" 00:00:00";

            var motherAge = 0;
            var motherdob = null;

            var motherdata = $scope.getMotherData()
            if( motherdata ) {
                d = new Date(motherdata.birthdate);
                motherAge = $scope.getAge(motherdata.birthdate)+"";
                motherdob = d.getDate()+"/"+(d.getMonth()+1)+"/"+d.getFullYear();//+" 00:00:00";
            }  else {
                d = new Date(housemotherinfo.motherdob);
                motherdob = d.getDate()+"/"+(d.getMonth()+1)+"/"+d.getFullYear();//+" 00:00:00";
                motherAge = $scope.getAge(d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate())+"";
            }
            
            var stayinhouse = "N";
            if(husbandinfo.livesinhouse=='YES') stayinhouse="Y";

            myDB.execute(query, function(results){
                if(results.length<0) return false;

                var haveProducts = [];

                var CLT_PK = results[0].mclt_pk+1; //get max pks

                var CEF_PK = results[0].mcef_pk+1;
                var CLI_PK = results[0].mcli_pk+1;

                applicantdata.filename = CLT_PK;
                $scope.applicantdata.CLT_PK = CLT_PK;

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

                if((sessionStorage.getItem('BRC_HOUSE_INDEX_CAP')!==0&&sessionStorage.getItem('BRC_HOUSE_INDEX_CAP')<=$scope.getTotal())||
                   (sessionStorage.getItem('BRC_INCOME_CAP')!==0&&sessionStorage.getItem('BRC_INCOME_CAP')<=$scope.getCurrency('netrev'))||
                   (sessionStorage.getItem('BRC_NO_OF_LOANS_FROM_OTHERBANKS')!==0&&sessionStorage.getItem('BRC_NO_OF_LOANS_FROM_OTHERBANKS')<=$scope.countBFBanks())||
                   (sessionStorage.getItem('BRC_WELFARE_STATUS_CAP')!=="" && ( sessionStorage.getItem('BRC_WELFARE_STATUS_CAP').indexOf($scope.welfareStatus))!='-1')){
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
                var havePastmembership = (sanitize(applicantdata.havePastmembership) == 'YES' ? 'Y' : 'N');

                var havecooperate = 0;
                var haveotherbank = 0;
                var haveinstitutes = 0;

                for(var key in borrowedFunds){
                    if(borrowedFunds[key].loanfrom == "I") haveinstitutes = 1;
                    if(borrowedFunds[key].loanfrom == "B") haveotherbank = 1;
                    if(borrowedFunds[key].loanfrom == "C") havecooperate = 1;
                }

                var totalincome = 0;
                for(key in houseIncomes){
                    totalincome = $scope.getTotalIncome();
                }

                var incomepercapita =  totalincome;
                var motherdata = $scope.getMotherData();
                housemotherinfo.noofmembers = $scope.family.length;
                housemotherinfo.noofchildren = $scope.getNoOfChildren();
                
                if(motherdata !== null){
                    //housemotherinfo.mothername = motherdata.name;
                }

                console.log(housemotherinfo.noofchildren);
                console.log(housemotherinfo.noofmembers);

                if(parseInt(housemotherinfo.noofmembers) > 0) incomepercapita = parseFloat(totalincome / parseInt(housemotherinfo.noofmembers));

                //$scope.getMaxGrpId();

                var CLL_CRF_AMOUNT = CLL_ORIGINAL_LOAN * CLL_CRF_PERCENTAGE;
                var query1 = "INSERT INTO T_CLIENT VALUES(null,"+CLT_PK+",'"+
                BRC_PK+"','"+
                sanitize(applicantdata.fullname)+"','"+
                sanitize(applicantdata.nickname)+"','"+
                applicantdata.gender+"','"+
                sanitize(husbandinfo.husbandname)+"','"+
                husbandinfo.husbandidno+"','"+
                ((husbandinfo.livesinhouse=="YES")?"Y":"N")+"','"+
                sanitize(applicantdata.ktpno)+"','"+
                applicantdata.clientno+"','"+
                applicantdata.familycardno+"','"+
                appdateofbirth+"','"+
                appAge+"','"+
                applicantdata.highested+"','"+
                sanitize(applicantdata.highestedothers)+"','"+
                husbandinfo.maritalstatus+"','"+
                housemotherinfo.noofmembers+"','"+
                housemotherinfo.noofchildren+"','"+
                sanitize(husbandinfo.whereis)+"','"+
                husbandinfo.howoften+"','"+
                sanitize(housemotherinfo.mothername)+"','"+
                motherdob+"','"+
                motherAge+"','"+sanitize(businessinfo.typeofbusiness)+"','"+sanitize(businessinfo.busequipment)+"','"+sanitize(businessinfo.jointbusiness)+"','"+sanitize(businessinfo.jbequipment)+"','"+sanitize(businessinfo.husbandbusiness)+"','"+sanitize(businessinfo.hbequipment)+"','"+sanitize(address.rt)+"','"+sanitize(address.streetarea)+"','"+address.village.val+"','"+sanitize(address.subdistrict)+"','"+sanitize(address.district)+"','"+sanitize(address.province)+"','"+address.postcode+"','"+sanitize(address.landmark)+"','"+sanitize(address.mobile1)+"','"+sanitize($scope.address.mobile2)+"','"+sanitize(address.husbmobile)+"',null,null,null,null,null,null, "+
                            "'"+sanitize(applicantdata.placeofbirth)+"' , "+ //CLT_PLACE_OF_BIRTH
                            "'"+sanitize(housemotherinfo.parentsresidence)+"', " + //CLT_RESIDENCE_OF_PARENTS
                            "'"+USER_PK+"', "+
                            "'"+moment().format('DD/MM/YYYY HH:mm:ss')+"', "+
                            CLIENT_STATUS+", "+
                             
                            $scope.address.centerid+", "+
                            "null, "+       //CLT_GROUP_ID
                            "null, "+       //CLT_IS_GROUP_LEADER
                            "'"+$scope.address.rw+"', "+ //CLT_RW
                            "'null', "+ //CLT_ATTENDANCE_PERCENTAGE
                            "'null', "+ //CLT_INSTALMENT_PERCENTAGE
                            "null, "+ //CLT_SIGNATURE
                            "null, "+ //CLT_TRAINING_ATTENDANCE
                            "null, "+ //CLT_APPROVED_MANAGER_PK
                            "null, "+ //CLT_RELATIVE
                            "null, "+ //CLT_RELATIVE_SIGNATURE
                            "null, "+ //CLT_CTR_LEADER_PK 
                            "null, "+ //CLT_GRP_LEADER_PK 
                            "'"+applicantdata.homeownership+"', "+ //CLT_HOME_ONWERSHIP 
                            "null, "+ //CLT_NEW_MEMBER_TYPE
                            "1)";  // ISNEW
                console.log(query1);
                 
                var query6 = [];
                var query7 = [];
                var query8 = [];
                var query9 = [];

                for(key in $scope.selectedLoans){
                    var CLL_PK = results[0].mcll_pk+1;
                    results[0].mcll_pk = CLL_PK;
                     
                    var crf_amt = parseFloat($scope.selectedLoans[key].selecteddetails.loanamt * ($scope.selectedLoans[key].LTY_DEFAULT_CRF_INTEREST / 100));

                    var graceperiod = null;

                    if($scope.selectedLoans[key].selecteddetails.hasOwnProperty("graceperiod")){
                        if($scope.selectedLoans[key].selecteddetails.graceperiod !== undefined){
                                graceperiod = $scope.selectedLoans[key].selecteddetails.graceperiod.value;
                        }
                    }

                    query6.push("INSERT INTO T_CLIENT_LOAN VALUES(null, "+
                        CLL_PK+", "+
                        BRC_PK+", "+
                        CLT_PK+", "+
                        USER_PK+","+
                        "'"+ welfareStatus+"',"+
                        workcap.app+", "+
                        workcap.husband+", "+
                        houseinfo.housetype+", "+
                        choices['0']+","+
                        choices['1']+","+ //10
                        choices['2']+","+
                        choices['3']+","+
                        choices['4']+","+
                        choices['5']+","+
                        choices['6']+", "+
                        housetotal+", "+
                        $scope.selectedLoans[key].selecteddetails.loanmaturity.value+", "+
                        $scope.selectedLoans[key].selecteddetails.loanamt+", "+
                        $scope.selectedLoans[key].selecteddetails.loanamt+", "+
                        $scope.selectedLoans[key].selecteddetails.loaninterest+", "+ //20
                        $scope.selectedLoans[key].LTY_DEFAULT_CRF_INTEREST+", "+
                        crf_amt+", "+ //CLL_CRF_AMOUNT
                        "null,"+ //CLL_FORM_DISTRIBUTION_DATE
                        "null,"+ //CLL_DISBURSEMENT_DATE
                        "null,"+ //CLL_CAPITAL_REPAY_PER_WEEK
                        "null,"+ //CLL_PROFIT_REPAY_PER_WEEK
                        "null,"+ //CLL_SCHEDULD_LAST_PAY_DATE
                        "null,"+ //CLL_ACTUAL_LAST_PAY_DATE
                        "null,"+  //CLL_EXTRACTED_DATE
                        "null,"+ //CLL_CRF_DISBURSEMENT_DATE  30
                        "null,"+ //CLL_CRF_DISBURSEMENT_AMT
                        "'Y', "+ //CLL_IS_NEW_LOAN_APPLIED
                        "null,"+ //CLL_PARENT_CLL_PK
                        $scope.selectedLoans[key].LTY_CREATED_BY+", '"+ //CLL_CREATED_BY
                        moment().format('DD/MM/YYYY HH:mm:ss')+"',"+ //CLL_CREATED_DATE
                        " 1, "+ //CLL_STATUS
                        $scope.selectedLoans[key].LTY_PK+", "+ //CLL_LTY_PK
                        "null, "+ //CLL_ACCOUNT_NUMBER
                        $scope.selectedLoans[key].selecteddetails.loanpurpose.value+", "+ //CLL_LPU_CODE
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
                        "'"+havePastmembership+"', "+ //CLL_PAST_MEMBERSHIP_EXISTS VARCHAR(1) NULL
                        "null, "+ //CLL_IS_FORM_PRINTED VARCHAR(1) NULL, "+
                        "null, "+ //CLL_MANAGER_PK INT NULL, "+
                        "null, "+ //CLL_PDF_PATH VARCHAR(1000) NULL, "+
                        "null, "+ //CLL_WITNESS1_PK INT NULL, "+ 60
                        "null, "+ //CLL_WITNESS2_PK INT NULL, "+
                        "null, "+ //CLL_WITNESS3_PK INT NULL, "+
                        "null, "+ //CLL_WITNESS4_PK INT NULL, "+
                        "null, "+ //CLL_TEST_RESULT_DATETIME TIMESTAMP NULL, "+
                        "null, "+ //CLL_TEST_PLACE VARCHAR(1000) NULL, "+
                        "null, "+ //CLL_TOTAL_INTEREST_AMT VARCHAR(1000) NULL, "+
                        "'"+isHomeless+"', "+ //CLL_HOMELESS VARCHAR(1) NULL
                        "0,"+ //CLL_LOAN_WEEKS
                        "0,"+ //CLL_ROUNDING_OF_REPAYMENT
                        graceperiod+","+ //CLL_GRACE_PERIOD_WEEKS 70
                        $scope.selectedLoans[key].selecteddetails.loaninterest+","+ //CLL_GRACE_PERIOD_INTEREST
                        "null, "+ //CLL_CASHOUT_BY
                        "1, "+ //CLL_LOAN_CYLE
                        "null, "+ //CLL_CASHIER_BY
    					"null, "+ //CLL_CENTER_LEAD_PK
    					"null, "+ //CLL_GROUP_LEAD_PK
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

                        "1 )"); //CLL_MOB_NEW

                    for(var akey in $scope.unproassets){
                        //console.log($scope.unproassets[akey]);
                        if($scope.unproassets[akey].asset !== ""){
                            var CAL_PK = results[0].mcal_pk+1;
                            query8.push("INSERT INTO T_CLIENT_ASSET_LIST VALUES(null, "+CAL_PK+","+CLT_PK+","+CLL_PK+",'"+$scope.unproassets[akey].asset+"','"+$scope.unproassets[akey].value+"',1 )");
                        }
                    }
                    for(var fkey in $scope.family){
                        var CFL_PK = results[0].fcal_pk+1;
                        var isschooling = 0;
                        if($scope.family[fkey].isschooling != 'NO') isschooling = 1;
                        var gender = "F";
                        if($scope.family[fkey].gender !='Female') gender = "M";
                        query9.push("INSERT INTO T_CLIENT_FAMILY_LIST VALUES(null,"+CFL_PK+",'"+$scope.cmp_id+"',"+CLT_PK+",'"+$scope.family[fkey].name+"','"+$scope.family[fkey].birthplace+"','"+$scope.family[fkey].birthdate+"','"+$scope.family[fkey].work+"','"+$scope.family[fkey].famcode+"','"+$scope.family[fkey].educode+"',"+$scope.family[fkey].isschooling+",'"+$scope.family[fkey].status+"','"+gender+"','','"+$scope.family[fkey].maritalstatus+"')");
                    }
                    var CPM_PK = results[0].mcpm_pk+1;
                    for(var pkey in $scope.selectedLoans[key].products){

                         

                        var enddate = null;
                        var startdate = null;

                        if($scope.selectedLoans[key].products[pkey].isSelected == "YES" && !inArray($scope.selectedLoans[key].products[pkey].PRM_PK,haveProducts) ){
                            var prd_maturity = $scope.selectedLoans[key].selecteddetails.loanmaturity.value;
                            if($scope.selectedLoans[key].products[pkey].selectedMaturityOption !== null){
                                prd_maturity = $scope.selectedLoans[key].products[pkey].selectedMaturityOption;
                                if($scope.selectedLoans[key].products[pkey].PRM_CODE == '002.0004'){ //If Pension
                                    if(prd_maturity.indexOf("year") != -1){ //Check if maturity is in years
                                        prd_maturity = prd_maturity.split(' ')[0];
                                    }
                                }
                            }   else {
                                prd_maturity = $scope.selectedLoans[key].selecteddetails.loanmaturity.value + " Weeks";
                            }

                            var prdSavperWeek = null;
                            if($scope.selectedLoans[key].products[pkey].PRM_CODE == feastsavingcode){
                                prdSavperWeek = $scope.selectedLoans[key].products[pkey].selectedSavingperWeek;
                            }

                            query7.push("INSERT INTO T_CLIENT_PRODUCT_MAPPING VALUES(null, "+CPM_PK+", "+CLT_PK+", "+CLL_PK+", "+ $scope.selectedLoans[key].products[pkey].PRM_PK +", '"+prd_maturity+"', 0, null, '"+moment().format('DD/MM/YYYY HH:mm:ss')+"', null, 1, '"+prdSavperWeek+"', '"+startdate+"','"+enddate+"', 1)");
                            CPM_PK = CPM_PK + 1;

                            haveProducts.push($scope.selectedLoans[key].products[pkey].PRM_PK);
                        }
                    }

                    var haveIns = false;
                    var haveMShare = false;

                    for(pkey in $scope.selectedLoans[key].products){

                        if($scope.selectedLoans[key].products[pkey].isSelected == "YES"){
                            if($scope.selectedLoans[key].products[pkey].PRM_CODE == insurancecode) haveIns = true; //load_template
                            if($scope.selectedLoans[key].products[pkey].PRM_CODE == membersharecode) haveMShare = true; //load_template
                        }
                    }

                    if(!haveIns && !inArray($scope.InsurancePk,haveProducts)){
                        //Insurance
                        query7.push("INSERT INTO T_CLIENT_PRODUCT_MAPPING VALUES(null, "+CPM_PK+", "+CLT_PK+", "+CLL_PK+", "+$scope.InsurancePk+", '', 0, null, '"+moment().format('DD/MM/YYYY HH:mm:ss')+"', null, 1, null, null, null,  1)");
                        CPM_PK = CPM_PK + 1;
                        haveProducts.push($scope.InsurancePk);
                    }
                    if(!haveMShare && !inArray($scope.MembersharePk,haveProducts)){
                        //Member Share
                        haveProducts.push($scope.MembersharePk);
                        query7.push("INSERT INTO T_CLIENT_PRODUCT_MAPPING VALUES(null, "+CPM_PK+", "+CLT_PK+", "+CLL_PK+", "+$scope.MembersharePk+", '', 0, null, '"+moment().format('DD/MM/YYYY HH:mm:ss')+"', null, 1, null, null, null,  1)");
                    }
                }

                 

                var query3 = [];
                var query4 = [];
                var query5 = [];

                for(key in borrowedFunds){

                    
                    query3.push("INSERT INTO T_CLIENT_BORROWED_FUNDS VALUES(null,"+CEF_PK+","+CLT_PK+","+CLL_PK+",'"+borrowedFunds[key].loanfrom+"','"+sanitize(borrowedFunds[key].loanfromname)+"','"+borrowedFunds[key].applicant+"',"+borrowedFunds[key].originalamt+","+borrowedFunds[key].balance+","+borrowedFunds[key].repaymentperwk+","+parseFloat(borrowedFunds[key].repaymentperwk)*4+",'"+borrowedFunds[key].loanpaidoff+"',1)");
                }
                for(key in houseIncomes){

                    if(houseIncomes[key].detaildesc === null || houseIncomes[key].detaildesc == ""){
                        var incomedetails = 'null';
                    } else {

                        var det = 0;
                        if(houseIncomes[key].details !== null && houseIncomes[key].details != ''&& !isNaN(houseIncomes[key].details) ) det = houseIncomes[key].details;

                        var incomedetails =  det+" "+houseIncomes[key].detaildesc;
                    }


                    query4.push( "INSERT INTO T_CLIENT_INCOME VALUES(null,"+CLI_PK+","+CLT_PK+","+CLL_PK+",'"+houseIncomes[key].source+"','"+incomedetails+"','"+houseIncomes[key].fixed+"','"+houseIncomes[key].variable+"',1)");
                }

                for(key in products){
                    if(products[key].isSelected == "YES"){
                        
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
                for(var e in query9){query9[e] = query9[e].replace(/undefined/g, "");}

                // //console.log(query1);
                myDB.execute("INSERT INTO T_PHOTOS VALUES (null,0,"+CLT_PK+",'"+btoa(applicantdata.photo)+"')",function(res){
                    console.log(res);
                });
                if(!devtest){ //save photo, once successful write into database
                    fileManager = new fm();
                    var promise = fileManager.write("photo"+CLT_PK+".dataurl",applicantdata.photo);
                    
                    promise.done(function(res){

                        myDB.dbShell.transaction(function(tx){
                            tx.executeSql(query1);
                            //tx.executeSql(query2);
                            for(e in query3){tx.executeSql(query3[e]);}
                            for(e in query4){tx.executeSql(query4[e]);}
                            for(e in query5){tx.executeSql(query5[e]);}

                            for(e in query6){ tx.executeSql(query6[e]);}
                            for(e in query7){ console.log(query7[e]); tx.executeSql(query7[e]);}
                            for(e in query8){ tx.executeSql(query8[e]);}
                            for(e in query9){ tx.executeSql(query9[e]);}
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
                            return false;
                        }, function(suc){
                           // alert("Successfully added client");
                            //alert(i18n.t("messages.AddClientSuccess"));
                            $scope.submitClient(eligibilityNotice);
                            return false;
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
                        for(e in query3){ console.log(query3[e]); tx.executeSql(query3[e]);}
                        for(e in query4){ console.log(query4[e]); tx.executeSql(query4[e]);}
                        for(e in query5){ console.log(query5[e]); tx.executeSql(query5[e]);}
                        for(e in query6){ console.log(query6[e]); tx.executeSql(query6[e]);}
                        for(e in query7){ console.log(query7[e]); tx.executeSql(query7[e]);}
                        for(e in query8){ console.log(query8[e]); tx.executeSql(query8[e]);}
                        for(e in query9){ console.log(query9[e]); tx.executeSql(query9[e]);}
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
                        },
                        function(suc){
                            $scope.submitClient(eligibilityNotice); 
                        });
                }
            });
            
            return false;
        };

        $scope.submitClient = function(eligibilityNotice){

            var stitle = "";
            var stext = "";
            var stype = "";
            if(eligibilityNotice === ""){
                stitle =  i18n.t("messages.AlertSuccess");
                stext =  i18n.t("messages.AddClientSuccess");
                stype = "success";
                $('.pmenu-icon').fadeOut();
            } else {
                stitle =  i18n.t("messages.Alert");
                stext =  eligibilityNotice;
                stype = "error";
            }

            swal({
                title: stitle,
                text: stext,
                type: stype,
                confirmButtonColor: "#80C6C7",
                confirmButtonText: "Ok", 
            }).then(function(){
                //window.location.href = "client.html";
                $scope.loadGroups(); 
                setTimeout(function(){
                    $.mobile.changePage("#selectGroup");
                    setTimeout(function(){
                        refreshthis('#addToGroup');
                    },10);
                    $('.etask-container').fadeOut();
                },100);
            });  

            return false;
        };

        var t = this;
	  $scope.loans = [];
        $scope.selectedLoans = [];
		//load T_PRODUCT_MASTER
		myDB.execute("SELECT * FROM T_LOAN_TYPE WHERE LTY_CODE IN ('001.0001','001.9999') order by LTY_CODE",function(results){
            ////console.log(results);
            var loans = [];
            $.each(results,function(ind,rec){

                var loanInt = rec.LTY_DEFAULT_LOAN_INTEREST.split(",")[0];

                rec.products = [];
                rec.isSelected = false;
                rec.selecteddetails = {
                    loanamt: rec.LTY_MIN_LOAN_AMOUNT,
                    loanmaturity: null,
                    loanpurpose: null,
                    graceperiod: null,
                    loaninterest:loanInt
                };
                // GET MATURITY
                var matarray = [];
                if(rec.LTY_TERM_OF_LOAN !== null){
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
                if(rec.LTY_GRACE_PERIOD_WEEK !== null && rec.LTY_GRACE_PERIOD_WEEK !== ''){
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
                $scope.loans.push(rec);
            });
            $scope.loadproducts();
        });

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

        $scope.loadproducts = function(){
            ////console.log($scope.loans);
            $.each($scope.loans,function(ind,loan){
                myDB.execute("SELECT * FROM T_PRODUCT_MASTER LEFT JOIN T_LOAN_SAVING_PRD_MAPPING ON (LSM_PRM_PK = PRM_PK) WHERE LSM_PRM_PK != 79 AND PRM_CODE != '002.0007' AND LSM_LTY_PK ="+ loan.LTY_PK,function(results){
                    //console.log("@@@@@@@@@@@@@@@");
                    //console.log(results);
                    var products  = [];
                    $.each(results,function(index,rec){
                        if( rec.PRM_CODE == '002.0001' || rec.PRM_CODE == '002.0003' || rec.PRM_CODE == '002.0005') {
                            rec.isSelected = "YES";
                        } else {
					        rec.isSelected = "NO";
                        }

                        if (rec.PRM_CODE == '002.0007') {
                            rec.selectedSavingperWeek = $scope.feastrepay[0].value;
                        }
                        
                        if(rec.LSM_PRM_IS_MANDATORY == 'Y'){
                            rec.isMandatory = 'Y';
                        } else {
                            rec.isMandatory = 'N';
                        }

                        rec.showMaturityOptions = false;
                        rec.selectedMaturityOption = null;
                        var mat_arr = [];
                        mat_arr = rec.PRM_LOAN_MATURITY_OPTIONS.split(',');
                        if(mat_arr.length > 1) {
                            rec.showMaturityOptions = true;
                            rec.selectedMaturityOption = mat_arr[0];
                        }
                        rec.maturityOptions = mat_arr;
                        ////console.log(rec);
                        rec.withdrawPolicy = $scope.getPolicyText(rec.PRM_LOAN_WITHDRAW_POLICY,"withdrawal");
                        rec.closingPolicy = $scope.getPolicyText(rec.PRM_LOAN_CLOSING_POLICY,"closing");

                        var depoamt = rec.LSM_PRM_OPEN_BAL;

                        if(depoamt !== null && depoamt.indexOf("%") != -1){

                            depoamt = depoamt.replace("%","");
                            depoamt = parseFloat($scope.loans[ind].selecteddetails.loanamt) / parseFloat(depoamt);
                            depoamt = depoamt.toFixed(4);

                        }

                        rec.depositAmt = depoamt;


                        products.push(rec);
                        ////console.log(products);
                    });

                    $scope.loans[ind].products = products;
                    refreshall('.newprodmat');
                    refreshall('.newprod');
                    $scope.$apply();
                });
            });
            //Only For Trial
            $scope.viewloanproducts(0);
            $scope.loanSelected($scope.activeloan)
        };

        $scope.productAvailable = function(product,newp){

            var isActive = false;
            //console.log($scope.products);
            $.each($scope.products,function(p,prd){
                if(prd.PRM_CODE == product.PRM_CODE){
                    if(newp == "check"){
                        isActive = prd.isActive;
                    } else {
                        if(newp == 'add'){
                            prd.isActive = true;
                        } else {
                            prd.isActive = false;
                        }
                    }

                }
            });
            //console.log(isActive);
            if(isActive){
                return false;
            }
            return true;

        };



        $scope.loanSelected = function(loan,$event){

            if($event){
                $event.preventDefault();
                $event.stopPropagation(); 
            }

            var proceed = true;

            $.each(loan.products,function(i,prd){

                var canAdd = $scope.productAvailable(prd,'check');

                if(canAdd){
                    if(prd.showMaturityOptions && prd.selectedMaturityOption === null && prd.isSelected == 'YES'){
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
                    if(prd.PRM_CODE === feastsavingcode && prd.isSelected == 'YES' && (prd.selectedSavingperWeek === "" || prd.selectedSavingperWeek === null) ){
                        swal({
                            title: i18n.t("messages.Alert"),
                            text:  i18n.t("messages.EmptyProductSavingpwk"),
                            type:  "warning",
                            confirmButtonColor: "#80C6C7",
                            confirmButtonText: i18n.t("buttons.Ok") 
                        });
                        proceed = false;
                        return false;
                    }
                    if(prd.isSelected == 'YES'){
                        $scope.productAvailable(prd,'add');
                        if(prd.showMaturityOptions && prd.selectedMaturityOption !== null){
                            $.each($scope.loans,function(l,sloan){
                                $.each(sloan.products,function(s,savings){
                                    savings.selectedMaturityOption = prd.selectedMaturityOption;
                                });
                            });
                            //console.log($scope.loans);
                        }
                        if(prd.PRM_CODE == feastsavingcode && prd.isSelected == 'YES' && (prd.selectedSavingperWeek !== "" || prd.selectedSavingperWeek !== null) ){
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
                $.each($scope.products,function(p,prd){
                    prd.isActive = false;
                });
            } else {

                //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

                var conflicting_loan = false;
                if(loan.LTY_CODE == '001.0001' || loan.LTY_CODE == '001.0002'){
                    var confli = 0;
                    if(loan.LTY_CODE == '001.0001') confli = '001.0002';
                    if(loan.LTY_CODE == '001.0002') confli = '001.0001';
                    //LOOP SELECTED LOAN TO FIND CONFLICTING LOANS
                    $.each($scope.selectedLoans,function(i,lo){
                        if(lo.LTY_CODE == confli){
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


                $scope.selectedLoans.push(loan);
            }
            //console.log($scope.selectedLoans);
        };

        $scope.conflictingLoanValidation = function(loan){
            var hasLoan1 = false;
            var hasLoan2 = false;



            $.each($scope.selectedLoans,function(i,selloan){
                if(selloan.LTY_CODE == '001.0001'){
                    hasLoan1 = true;
                }
                if(selloan.LTY_CODE == '001.0002'){
                    hasLoan2 = true;
                }
            });

            if((hasLoan1 && loan.LTY_CODE == '001.0002' )||
                (hasLoan2 && loan.LTY_CODE == '001.0001')) {
                return false;
            }
            return true;

        };

        $scope.viewloanproducts = function(idx,$event){

            var hideLoan = true;
 
            if(!hideLoan && $event){
                $('.loan-box').removeClass('selected');

                var tis = $event.currentTarget;

                $(tis).find('.loan-box').addClass('selected');
            }

            

            $scope.activeloan = [];
 
            var purpose = $filter('filter')($scope.loanpurpose, { loan: $scope.loans[idx].LTY_PK })[0];

            $scope.loans[idx].selecteddetails.loanamt = parseFloat($scope.loans[idx].LTY_MIN_LOAN_AMOUNT);
            $scope.loans[idx].selecteddetails.loanmaturity = $scope.loans[idx].maturityOptions[0];
            $scope.loans[idx].selecteddetails.graceperiod = $scope.loans[idx].graceOptions[0];
            $scope.loans[idx].selecteddetails.loanpurpose = purpose;

            $scope.activeloan = $scope.loans[idx]; 

            setTimeout(function(){
                $scope.$apply();
                $.each($scope.activeloan.products,function(i,prd){
                    if(prd.showMaturityOptions){
                       
                    }
                }); 
                resetthis('.newprod',"");
                $('.newprodmat').prop('selectedIndex', 0);
                setTimeout(function(){
                    $scope.$apply(); 
                    refreshall('.newprodmat');  
                },300);
                if(!hideLoan){
                    if($('#productmappingdetails').length > 0){
                        $('html, body').animate({
                            scrollTop: $("#productmappingdetails").offset().top - 90
                        }, 1000);
                    }
                }
            },0); 
        };

        myDB.T_PRODUCT_MASTER.get(null,function(results){
			$.each(results,function(ind,rec){
				if(rec.PRM_IS_MANDATORY == "Y"){
					rec.isSelected = "YES";
				} else{
					rec.isSelected = "NO";
				}
                rec.isActive = false;
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

            //console.log($scope.products);
            ////console.log($scope.products);
            // //console.log($scope.products[1].isSelected);
            // //console.log($scope.products[1].PRM_IS_MANDATORY);
            // //console.log($scope.products[1].PRM_PK);
		    // //console.log(JSON.stringify($scope.products.isSelected));

        });


        //Settign Loan Type Options
        $scope.LOAN_TYPE = [];
        var LT = JSON.parse(localStorage.getItem("loan_type"));
   
        LT.forEach(function(value,index){
            var keypair = {'value': value[0],'name': value[3]};
            $scope.LOAN_TYPE.push(keypair); 
        });

        //load T_CODE values into a variable selectCodes
        $scope.selectCodes = {
            process : function(results){
                results.forEach(function(value,index){
                    $scope.selectCodes[value.CODE_TYPE_PK] = $scope.selectCodes[value.CODE_TYPE_PK] || [];
                    var keypair = {'name': value.CODE_NAME,'value': value.CODE_VALUE, 'desc':value.CODE_DESC};
                    $scope.selectCodes[value.CODE_TYPE_PK].push(keypair);
                    if(value.CODE_TYPE_PK == 2 && value.CODE_VALUE == 'F'){
                        $scope.applicantdata.gender = value.CODE_VALUE;
                    }
                });
            },
        };
        this.setCodes = function(results){
            $scope.$apply(function() {$scope.selectCodes.process(results);});
            refreshall('#ncadGender');
        };
        myDB.T_CODE.get("(CODE_TYPE_PK>=1 AND CODE_TYPE_PK<=3) OR CODE_TYPE_PK=6 OR CODE_TYPE_PK=21 OR (CODE_TYPE_PK>=9 AND CODE_TYPE_PK<=16) ORDER BY CODE_TYPE_PK",function(results){
            console.log(results);
            t.setCodes(results);
        });

        //load T_HOUSE_INDEX
        myDB.T_HOUSE_INDEX.get(null,function(results){
            $scope.houseindices = {};
            $.each(results,function(ind,rec){
                $scope.houseindices[rec.HSE_TYPE_PK] = $scope.houseindices[rec.HSE_TYPE_PK] || [];
                $scope.houseindices[rec.HSE_TYPE_PK].push(rec);
            });
        });

        //Load WELFARE values
        $scope.selectWelfare = function(typepk){ $scope.selectedWelfare = $scope.familywelfare[typepk]; }
        myDB.T_FAMILY_WELFARE.get(null,function(results){
            $scope.familywelfare = [];
            $.each(results,function(ind,rec){ $scope.familywelfare.push(rec); }); //saves each welfare type into the array

            $scope.selectWelfare(0); //select the first option as default
            $scope.welfareStatus="PW";
            $("#welfareRadio1label").addClass("ui-radio-on");
        });

        //Load VILLAGE values
        this.setVillages = function(results){
            // $.each(results, function(ind, val){
            //     $scope.selectCodes['VILL'] || ($scope.selectCodes['VILL'] = []); //init if null
            //     var keypair = {'name': val.VLM_NAME,'value': val.VLM_PK}
            //     $scope.selectCodes['VILL'].push(keypair);
            // });
            // $scope.$apply(function () {$scope.selectCodes['VILL'];});
        };

        this.setCenters = function(results){
            //console.log(results);
            $.each(results,function(ind, val){
                $scope.selectCodes.CTR = $scope.selectCodes.CTR ||  []; //init if null
                var keypair = {'name':val.CTR_CENTER_ID+" "+val.CTR_CENTER_NAME , 'value':val.CTR_PK };
                $scope.selectCodes.CTR.push(keypair);
            });
            //console.log($scope.selectCodes['CTR']);
            $scope.$apply(function () { $scope.selectCodes.CTR; });
        };

      $scope.blockout = function(element) {
         console.log(element)
      }

        $scope.updateDynamicSelect = function(c, qtn) {
            refreshall('.'+c);
            console.log(qtn); 
        }

        $scope.hideQtn = function(qtn){
            return $scope.checkFormOptions(qtn)
        }

        $scope.checkFormOptions = function(qtn){
            var disable = false; 
            if(qtn == undefined) return false;
            if(qtn.CLF_DEPENDANT_QUES_PK != 'null' && qtn.CLF_DEPENDANT_ANSWER != 'null'){
                  disable = true;
                  $scope.questions.forEach(function(q,i){
                        if(q.CLF_PK == qtn.CLF_DEPENDANT_QUES_PK && q.answers !== null && q.answers.value == qtn.CLF_DEPENDANT_ANSWER){
                              disable = false;
                        }
                  });
            } else {
                  disable = false;
            }
            return disable;
        }

        $scope.updateAddress = function(){
            ////console.log($scope.address.centerid);
            myDB.execute("SELECT * FROM T_VILLAGE_MASTER, T_DISTRICT_MASTER, T_SUB_DISTRICT_MASTER, T_CENTER_MASTER WHERE DSM_PK = SDSM_DSM_PK AND SDSM_PK = VLM_SDSM_PK AND VLM_PK = CTR_VLM_PK AND CTR_PK = "+$scope.address.centerid+"  ", function(results){
                //console.log(results[0]);
                $scope.updateSecond(results);
                $scope.getCenterLeader($scope.address.centerid);
            });
        }
        $scope.updateSecond = function(results){

            ////console.log($scope.address);
            $scope.$apply(function(){
                $scope.address.village.val = results[0].VLM_PK;
                $scope.address.village.name = results[0].VLM_NAME;
                $scope.address.district = results[0].DSM_NAME;
                $scope.address.subdistrict = results[0].SDSM_NAME;
                $scope.address.province = results[0].DSM_PROVINCE_CODE;
            });
        }

        $scope.getCenterLeader = function(centerid){
            myDB.execute("SELECT CLT_PK FROM T_CLIENT WHERE CLT_IS_GROUP_LEADER= 'Y' AND CLT_CENTER_ID="+centerid+" ORDER BY CLT_PK LIMIT 1", function(res){
                  console.log(res);
                  if(res.length > 0 && res[0].CLT_PK !== null){
                        $scope.centerLeader = res[0].CLT_PK;
                  }
            })
        }

        // myDB.T_VILLAGE_MASTER.get(null,function(results){
        //     t.setVillages(results);
        // });

        myDB.execute("SELECT * FROM T_CENTER_MASTER WHERE CTR_FO_PK = "+sessionStorage.getItem("USER_PK")+" ORDER BY CTR_CENTER_ID, CTR_CENTER_NAME",function(results){
            t.setCenters(results);
        })

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
                for(k in results) $scope.existingGroups.push(results[k]);
                $scope.$apply();
            }
        });


        $scope.haveGroups = function(){ //check if any groups
            if(!$scope.existingGroups) return false;
            return $scope.existingGroups.length>0;
        }
        $scope.updateMother = function(key){
            if(key == 'name'){
                $scope.family[0].name = $('#ncadMotherName').val(); //$scope.housemotherinfo.mothername;
                $scope.family[0].gender = "F";
                $scope.family[0].famcode = "IBU";
                refreshall('.famgender');
                refreshall('.famcode');
            } else if (key == 'dob'){
                $scope.family[0].birthdate = moment($scope.housemotherinfo.motherdob).format('DD/MM/YYYY');
            } else if (key == 'residence'){
                $scope.family[0].birthplace = $('#ncadParentsResidence').val(); //$scope.housemotherinfo.parentsresidence;
            }
        }
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
            }) 
            return total;
        }

        $scope.totalHouseholdIncome = function(){
            var total = 0;

            $.each($scope.houseIncomes,function(i,income){
                 
                if (
                    income.source == 'HUSBAND' ||
                    income.source == 'WIFE' ||
                    income.source == 'OTHER INCOME'  ){

                    var fixed_amt = 0;
                    var variable_amt = 0;
                    if(income.fixed != null) fixed_amt = parseFloat(income.fixed);
                    if(income.variable != null) variable_amt = parseFloat(income.variable);
                    

                    total += (fixed_amt + variable_amt);
                    
                }  
            }) 

            return total;
        }

        $scope.totalHouseholdExpenses = function(){
            var total = 0;
            $.each($scope.houseIncomes,function(i,income){
                 
                if (
                    income.source == 'HOUSEHOLD COST' ||
                    income.source == 'EDUCATION COST' ||
                    income.source == 'OTHER COSTS'  ){
                    total += (parseFloat(income.fixed) + parseFloat(income.variable));
                    
                }  
            }) 


            total -= $scope.getTotalLoanedAmountFromOtherInst();
            total -= $scope.getTotalLoanedAmountFromKomida();

            return total;
        }

        $scope.getNetIncome = function(){
            return parseFloat($scope.totalHouseholdIncome()) + parseFloat($scope.totalHouseholdExpenses());
        } 

        $scope.abilityToPay = function(){
            var netIncome = $scope.getNetIncome();
            if(netIncome == 0) return 0;
            return parseFloat(netIncome) / 100 * 30;
        }

        $scope.getTotalLoanedAmountFromKomida = function(){
            var total = 0; 
            return total;
        }

        $scope.getTotalLoanedAmountFromOtherInst = function(){
            var total = 0;
            //console.log("borrowed "+$scope.borrowedFunds.length);
            $.each($scope.borrowedFunds,function(b,borrowed){
                total += (parseFloat(borrowed.repaymentperwk) * 4);
            });

            return total;
        }
      


        $scope.checkboxChange = function(e){
            //console.log(e);
        }



        $scope.alignDivs = function() {

            var potop = $('.etask-progress').position().top;

            potop += parseFloat($('.etask-progress').css("margin-top"));

            var pobtm = $('.etask-progress-reverse').position().top;

            pobtm += parseFloat($('.etask-progress').css("margin-top"));

            var height = parseFloat(pobtm - potop);


            $('.etask-progress-vert').css('top',potop+'px');
            $('.etask-progress-vert').css('height',height+'px');


            //$('.aniview').AniView();

        }

        setTimeout(function(){
            $scope.alignDivs();
        },100);

        $scope.addNewUpro(0);

        var colwid = $('.grid').width() / 2;

        $('.grid').masonry({
          itemSelector: '.grid-item',
          columnWidth: colwid
        });
        /******************************************
        // Returns a new group object or an existing group given grp name
        ******************************************/
        $scope.findGroup = function(grpid,centerid,centername){
            

            var grp = null;
            var found = false;
            ////console.log($scope.savedGrps);
            for(key in $scope.savedGrps){
                if($scope.savedGrps[key].GROUP_ID==grpid && parseInt($scope.savedGrps[key].CENTER.value) == parseInt(centerid)){
                    grp = $scope.savedGrps[key];
                    found = true;
                }
            }

            if(!found){//if doesn't exist create the group

                var newgrp = {
                    GROUP_ID:grpid,
                    MEMBERS:[],
                    CENTER: {
                        value: parseInt(centerid),
                        name: centername
                    }
                };

                $scope.savedGrps.push(newgrp);
                return newgrp;

            } else {
                ////console.log(grp);
                return grp;
            }
        };

        /******************************************
        // Prepare data
        ******************************************/
        $scope.loadQuetions = function() {
            $scope.questions = [];
            $scope.subquestions = [];
            var cmd = "SELECT * FROM T_CLIENT_FORM ORDER BY CLF_PK";
            myDB.execute(cmd,function(results){
                  var qtns = results;
                  qtns.forEach(function(qtn,i){
                        //console.log(qtn);
                        var q = qtn;
                        q.answers = "";
                        if(qtn.CLF_DEPENDANT_QUES_PK != 'null' && qtn.CLF_DEPENDANT_ANSWER == 'null'){ 
                              var opts = qtn.CLF_OPTIONS.split("#");
                              var score =  qtn.CLF_SCORE.split("#");
                              q.CLF_OPTIONS = [];
                              q.answers = null;
                              opts.forEach(function(opts,o){
                                    q.CLF_OPTIONS.push({
                                          value: score[o],
                                          text: opts
                                    });
                              });
                              $scope.subquestions.push(q);
                        } else {
                              var opts = qtn.CLF_OPTIONS.split("#");
                              var score =  qtn.CLF_SCORE.split("#");
                              q.CLF_OPTIONS = [];
                              q.answers = null;
                              opts.forEach(function(opts,o){
                                    q.CLF_OPTIONS.push({
                                          value: score[o],
                                          text: opts
                                    });
                              }); 
                              $scope.questions.push(q);
                        }
                  }); 
                  //console.log("3000");
                  //console.log($scope.questions);
                  //console.log($scope.subquestions);

            });   
        }
        $scope.loadGroups = function(){
            myDB.execute("SELECT CTR_PK, CTR_CENTER_NAME, CTR_CENTER_ID, CTR_CENTER_NAME, CLG_ID, CLG_NAME FROM T_CENTER_MASTER LEFT JOIN T_CLIENT_GROUP ON (CLG_CTR_PK = CTR_PK) WHERE CTR_PK = " + $scope.address.centerid + " ORDER BY CTR_CENTER_NAME " , function(results){
                console.log(results);
                console.log("group list");
                if(results.length > 0) {
                    $.each(results,function(ind, val){
                        var grp = $scope.findGroup(val.CLG_ID,val.CTR_PK,val.CTR_CENTER_NAME);
                    });
                    console.log($scope.savedGrps)
                }
                var lg = "";
                lg += " SELECT CLT_MOB_NEW,CLT_FAMILY_CARD_NO,CLT_DOB,CLT_MOTHER_NM,CLT_MOTHER_DOB,CLT_STATUS, CLT_PK, CLT_TRANING_COMPLETED, CLT_TRANING_START_DATE, CLT_TRANING_END_DATE, ";
                lg += " CLT_FULL_NAME, CLT_OTH_REG_NO, CLT_CLEINT_ID,  CLT_GROUP_ID, CLT_IS_GROUP_LEADER, CAST(CLT_CENTER_ID AS INTEGER) as CLT_CENTER_ID, CTR_CENTER_NAME, CLT_BRC_PK ";
                lg += "  FROM  T_CLIENT, T_CENTER_MASTER WHERE  CLT_CENTER_ID = CTR_PK AND CAST(CLT_CENTER_ID as INTEGER) = "+$scope.address.centerid+" GROUP BY CLT_PK";
                console.log("loadgrpssss");
                console.log(lg);
                myDB.execute(lg,function(results){
                    console.log(results);
                    $scope.available = [];
                    var res = [];
                    $.each(results, function(ind,val){
                        var obj = {};
                        for(var k in val){ obj[k] = val[k]; }
                        res.push(obj);
                    }); //does a copy of the results, for some reason using results directly won't work

                    results = res; 
                    $.each(results,function(ind, val){
                        
                        if(!val.CLT_GROUP_ID && val.CLT_MOB_NEW == 1){ //if member is not in a group
                            console.log("memeber not in group");
                            $scope.available.push(val); //add to available
                        }else{
                            //add to existing groups
                            console.log("in existing group");
                            var grp = $scope.findGroup(val.CLT_GROUP_ID,val.CLT_CENTER_ID,val.CTR_CENTER_NAME);
                            var clientExistsInGrp = false;
                        
                            for(var m in grp.MEMBERS){
                                if(grp.MEMBERS[m].CLT_PK == val.CLT_PK){
                                    clientExistsInGrp = true;
                                }
                            }
                            console.log(val.CLT_PK+" "+clientExistsInGrp);
                            if(!clientExistsInGrp){
                                grp.MEMBERS.push(val); 
                            }
                            console.log(grp.MEMBERS);
                             
                        } 
                    });
                    setTimeout(function(){
                        $.when($scope.$apply()).then(function(){
                            $scope.refreshUI();
                        });
                    },1)  
                });
            }); 
            
        };
        $scope.updateInterest = function(loan){

            var TermArray = loan.LTY_TERM_OF_LOAN.split(",");
            var InterestArray = loan.LTY_DEFAULT_LOAN_INTEREST.split(",");
            for(var i=0; i < TermArray.length; i++){
                if(loan.selecteddetails.loanmaturity.value == TermArray[i]){
                    loan.selecteddetails.loaninterest = (parseInt(InterestArray[i])).toFixed(2);
                }
            }
            console.log(loan);
        };

        /******************************************
        // Make sure UI is showing the right values, an angular/jquery mobile fix
        ******************************************/
        $scope.isitDone = function() {

            var ttl = 0;
            for(var key in $scope.available) ttl++;

            if(ttl > 0 || !$scope.isPPIComplete) {
                $('.addclientdone').hide();
            } else {
                $('.addclientdone').fadeIn();
            }
        };
        $scope.refreshUI = function(){

            $scope.grouptext = i18n.t("messages.Group");
            $scope.actiontext = i18n.t("messages.Action");

            $scope.createGroup = '0';
            if($scope.available[$scope.createGroup])
                $("#createGroup").parent().find('span').html($scope.available[$scope.createGroup].CLT_FULL_NAME);
 
            setTimeout(function(){
                var $container = $('.grid');

                $scope.isitDone();
                $.when($scope.$apply()).done(function(){
                    $container.masonry('reloadItems');
                    $container.masonry();
                });
                if($scope.savedGrps[0]){
                    //$scope.currGroup = $scope.savedGrps[0].GROUP_ID;
                    $("#addToGroup").val('');
                    $("#createGroup").selectmenu('refresh',true);
                    //$("#addToGroup").parent().find('span').html($scope.savedGrps[0].GROUP_ID);
                }
            },100);

        };


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
                    mem.CLT_IS_GROUP_LEADER = 'N';   //logically this should not happen but set to N anyway

                    var c = "UPDATE T_CLIENT SET CLT_IS_GROUP_LEADER='N', CLT_GROUP_ID=null WHERE CLT_PK="+mem.CLT_PK;
                    cmd.push(c);

                    remove.push(id); //required to properly remove members below
                } else if (mem.CLT_MOB_NEW=="1") {
                     $scope.available.push(mem);         //add them to available list
                    mem.CLT_IS_GROUP_LEADER = 'N';   //logically this should not happen but set to N anyway

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
            //$scope.getMaxGrpId();

        };

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
                    mem.CLT_IS_GROUP_LEADER = 'N';   //logically this should not happen but set to N anyway

                    var c = "UPDATE T_CLIENT SET CLT_IS_GROUP_LEADER='N', CLT_GROUP_ID=null WHERE CLT_PK="+mem.CLT_PK;
                    cmd.push(c);

                    remove.push(id); //required to properly remove members below
                } else if (mem.CLT_MOB_NEW=="1") {
                    $scope.available.push(mem);         //add them to available list
                    mem.CLT_IS_GROUP_LEADER = 'N';   //logically this should not happen but set to N anyway

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
            
            if($scope.createGroup=="undefined"||$scope.createGroup===undefined){ //!Note: createGroup holds the  
                alert(i18n.t("messages.NoClientSelect"));
                return false;
            }
            $scope.getMaxGrpId();
             

        };

        $scope.checkShooling = function(fam, id){
            console.log(fam.educode);
            if(fam.educode == 'NS'){
                fam.isschooling = 0;
            }
            console.log(fam)
            if(parseInt(fam.isschooling) == 1) {
                $("label[for='"+id+"']").removeClass('ui-checkbox-off').addClass('ui-checkbox-on');
            } else {
                $("label[for='"+id+"']").removeClass('ui-checkbox-on').addClass('ui-checkbox-off');
            } 
            refreshall('.schoolingcode'); 

        }

        $scope.getMaxGrpId = function(){
            //console.log("getMaxGrpId");
            var client = $scope.available[$scope.createGroup];
            if(client === null) return false;
            var centerid = client.CLT_CENTER_ID;

            ////console.log("SELECT CLG_CTR_PK, CLG_ID FROM T_CLIENT_GROUP WHERE CLG_CTR_PK='"+ centerid +"'  ORDER BY CLG_ID DESC LIMIT 1");

            myDB.execute("SELECT CLG_CTR_PK, CLG_ID  FROM T_CLIENT_GROUP LEFT JOIN T_CENTER_MASTER ON (CTR_PK = CLG_CTR_PK) WHERE CTR_PK="+ centerid +"  ORDER BY CAST(CLG_ID AS INTEGER) DESC LIMIT 1",function(results){

                ////console.log(results.length);
                var groupid = "001";
                //console.log(results);
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
                $scope.createNewGroupSecond();
            });
        };

        $scope.createNewGroupSecond = function(){
            //console.log("createNewGroupSecond");
            var client = $scope.available[$scope.createGroup]; //access the list of available clients with the client's index (client's index=createGroup)
            client.CLT_IS_GROUP_LEADER = 'Y'; //make group leader

            var BRC_PK = parseInt(sessionStorage.getItem("BRC_PK"));
            //console.log(client);

            var newID =  $scope.maxgroupid;
            var newName = "GROUP "+$scope.maxgroupid;



            var cmd  = "INSERT INTO T_CLIENT_GROUP VALUES (null, "+parseInt($scope.maxgroupid)+", "+client.CLT_BRC_PK+", "+client.CLT_CENTER_ID+", '"+newID+"', '"+newName+"', 1 )";
            var cltcmd = "UPDATE T_CLIENT SET CLT_GROUP_ID ='"+newName+"' WHERE CLT_PK="+client.CLT_PK;
            myDB.execute(cmd,function(results){
                myDB.execute(cltcmd,function(results){


                    swal("Successfully added "+client.CLT_FULL_NAME+" to GROUP "+newID+" in "+client.CTR_CENTER_NAME);

                    $scope.addClientToGroup($scope.createGroup,newID,client.CTR_CENTER_NAME);
                });
            });
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

            //$scope.getMaxGrpId();
        };

        /******************************************
        Add member to existing group
        ******************************************/
        $scope.addToExistingGroup = function(client){


            if($scope.createGroup=="undefined"||$scope.createGroup===undefined){
               // alert("No client selected.");
                //alert(i18n.t("messages.NoClientSelect"));
                swal(i18n.t("messages.NoClientSelect"),"error");
                return false;
            }

            if($scope.currGroup=="undefined"||$scope.currGroup===undefined){
               // alert("No group selected.");
                //alert(i18n.t("messages.NoGroupSelect"));
                swal(i18n.t("messages.NoGroupSelect"),"error");
                return false;
            }

            
            $scope.findGroup($scope.currGroup,client.CLT_CENTER_ID,client.CTR_CENTER_NAME);
            $scope.addClientToGroup($scope.createGroup,$scope.currGroup,client.CTR_CENTER_NAME);
            return false;

        };

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
        };

        $scope.getSumofIncomes= function(fixed,variable){
            if(isNaN(fixed))fixed = 0;
            if(isNaN(variable))variable = 0; 
            return parseFloat(fixed) + parseFloat(variable);
        }

        $scope.addClientToGroup = function(clientid,grpid,centername){
            //perform check here 
            var client = $scope.available[clientid];
            var grp = $scope.findGroup(grpid,client.CLT_CENTER_ID,centername); 

            if($scope.createGroup=="undefined"||$scope.createGroup===undefined){
                swal({
                    title: i18n.t("messages.NoClientSelect"),
                    type: "warning",
                    confirmButtonColor: "#80C6C7",
                    confirmButtonText: i18n.t("buttons.Ok"), 
                });
                return false;
            } else if($scope.maxMembers  > 0 && $scope.countMembers(grp)>=$scope.maxMembers){
                swal({
                    title: i18n.t("messages.GroupFull"),
                    type: "warning",
                    confirmButtonColor: "#80C6C7",
                    confirmButtonText: i18n.t("buttons.Ok"), 
                });
                return false;
            } else {
                var leader = $scope.getLeaderOf(grpid,client.CLT_CENTER_ID);

                if(!leader || leader === null){
                    //continue
                } else {
                    if([40,21].indexOf(parseInt(leader.CLT_STATUS))!=-1){ //if leader has not applied for new loan
                       // alert("Group leader not yet applied for new loan.");
                        swal(i18n.t("messages.GroupLeaderHasNotApplyForNewLoan"));
                        return false;
                    }
                    if(leader.CLT_PK==client.CLT_PK)       //adding same client to group
                        client.CLT_IS_GROUP_LEADER = 'Y';   //set this new add as leader too. leader could be renewing loan
                    else
                        client.CLT_IS_GROUP_LEADER = 'N';
                }
                
                $scope.applicantdata.groupid = grpid;
                var tempClient = {
                    CLT_CENTER_ID: $scope.address.centerid,
                    CLT_GROUP_ID: $scope.applicantdata.groupid
                };
                $scope.getGroupLeaders(tempClient);
                $scope.refreshSelect('.famcode'); 
                
                client.CLT_GROUP_ID = grpid;         //set group ID
                grp.MEMBERS.push(client);            //add client to group
                $scope.available.splice(clientid,1); //and remove from list of available clients

                $scope.groupmembers = grp.MEMBERS; 
 
                var cmd = "UPDATE T_CLIENT SET CLT_IS_GROUP_LEADER='"+client.CLT_IS_GROUP_LEADER+"', CLT_GROUP_ID='"+grpid+"' WHERE CLT_PK="+client.CLT_PK;

                var ldrPk = client.CLT_PK;
                if(leader) ldrPk = leader.CLT_PK;
                if($scope.centerLeader == 0) $scope.centerLeader = client.CLT_PK;

                var memberType = $scope.getMemberType(grp); 

                var ldr = "UPDATE T_CLIENT SET CLT_GRP_LEADER_PK="+ldrPk+", CLT_CTR_LEADER_PK="+$scope.centerLeader+", CLT_NEW_MEMBER_TYPE='"+memberType+"' WHERE CLT_PK = "+client.CLT_PK;
                console.log(ldr);
                myDB.execute(ldr,function(){
                        console.log("updated client group leader and center leader");
                });

                myDB.dbShell.transaction(function(tx){
                    tx.executeSql(cmd); //update database
                }, function(err){
                    swal(i18n.t("messages.SaveClientError"));
                    window.location.href = "groupclients.html";
                    return true;
                }, function(suc){});

                if(grp.MEMBERS[0].CLT_TRANING_COMPLETED != 'Y' && (grp.MEMBERS[0].CLT_STATUS == 4 || grp.MEMBERS[0].CLT_STATUS == 6)){
                    var cmd1 = "UPDATE T_CLIENT SET CLT_STATUS=4, CLT_TRANING_END_DATE='"+grp.MEMBERS[0].CLT_TRANING_END_DATE+"', CLT_TRANING_START_DATE='"+grp.MEMBERS[0].CLT_TRANING_START_DATE+"' WHERE CLT_PK="+client.CLT_PK;
                    myDB.execute(cmd1,function(){
                        console.log("updated client to proceed with test");
                    });
                    myDB.execute("INSERT INTO T_CLIENT_TRAINING_TMP VALUES(null,"+client.CLT_PK+",0,0)",function(res){

                    });
                }
                if($scope.countAvailable() == 0) {
                    setTimeout(() => {
                        refreshall('.ppiqtns');
                    }, 300);
                }
                $scope.refreshUI(); //handle UI
            }
        };
        $scope.getMemberType = function(grp){
              var memType = "";
              var memCount = 0;
              grp.MEMBERS.forEach(function(mem,m){
                  if(mem.CLT_STATUS != 2 && mem.CLT_STATUS != 27) memCount++
              });
              if(memCount == 0){ //Only Current Client
                  memType = "R"; //Regular Mmeber
              } else if (memCount <= 5){
                  memType = "T" //Tambal Salam
              } else if (memCount > 5) {
                  memType = memCount;
              }
              return memType;
        }
        /******************************************
        //count number of clients in available list
        ******************************************/
        $scope.countAvailable = function(){
            var ttl = 0;
            for(var key in $scope.available) ttl++;
            return ttl;
        };


        /******************************************
        //Get leader of Group
        ******************************************/
        $scope.getLeaderOf = function(group,centerid){

            if(group === undefined || group === '' || group === null) return false;

            var leader = null;

            $.each($scope.savedGrps,function(i,grp){
                if(grp.GROUP_ID == group && parseInt(grp.CENTER.value) == centerid){
                    var members = grp.MEMBERS;
                    for(var memid in members){
                        if(members[memid].CLT_IS_GROUP_LEADER=='Y') {
                            leader = members[memid];
                            return true;
                        }
                    }
                }
            });

            return leader;
        };

        $scope.refresh = function(model){
            //console.log(model);
            //console.log($scope.currGroup);
            $timeout(function(){
                $scope.currGroup = model;
                //$('#addToGroup').selectmenu('refresh',true);
            },500);
        };
        $scope.loadGroups();
        //$scope.loadQuetions();

        $scope.refreshInc = function(income,id){

            var thisv = $('#incsel'+id);
            var selected = $(thisv).find('option:selected').text();
            // if($(thisv).val() == 0){
            //     income.details = "-";
            //     $('#incdet'+id).hide();
            // } else {
            //     $('#incdet'+id).show();
            // }

            if(selected !== null && selected !== ''){
                $(thisv).parent().find('span').html(selected);
            }
        };

        $scope.refreshSelect = function(idf){

            $(idf).each(function(i, element) {
                var selected = $(this).find('option:selected').text();
                console.log(i);
                console.log(selected);
                if(selected !== null && selected !== ''){
                    $(this).parent().find('span').html(selected);
                } 
            });
        };

        $scope.refreshSelSav = function(cllpk,product){
 
            setTimeout(function(){
                $scope.$apply();
                $('#newprod'+cllpk).selectmenu("refresh");
            },100);

            //Check Prodct Type
            var prm_code = $('#newprod'+cllpk).val();
            if(prm_code !== ""){
                if(prm_code == '002.0007'){
                    $('#newprodmattxt'+cllpk).fadeOut();
                    $('#newprodwktxt'+cllpk).fadeOut();
                    $('#newProdMat'+cllpk).fadeOut();

                    $('#newprodpay'+cllpk).fadeIn();


                } else {
                    $('#newprodmattxt'+cllpk).fadeIn();
                    $('#newprodwktxt'+cllpk).fadeIn();
                    $('#newProdMat'+cllpk).fadeIn();

                    $('#newprodpay'+cllpk).fadeOut();
                }
            } 
        };

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
        };

        /******************************************
        //Return only a list of unique clients in the group (so that multiple loans won't stack in the list)
        ******************************************/
        $scope.filterGroupNames = function(members){
            var filter = [];

            console.log("members");
            console.log(members);
            if(members.length > 0){

                $.each(members, function(id,member){
                    if(member.CLT_IS_GROUP_LEADER != "Y"){
                        var alrExist = false;
                        $.each(filter,function(f,fun){
                            if(fun.CLT_PK == member.CLT_PK) alrExist = true;
                        });
                        if(!alrExist) filter.push(member);
                    }
                });

            }
            console.log(filter)

            return filter;
        };
 
        // Signatures

        $scope.getGroupLeaders = function(client){

            var cmd = "SELECT CLT_PK, CLT_FULL_NAME, CLT_GROUP_ID FROM T_CLIENT WHERE CLT_IS_GROUP_LEADER='Y' AND CAST(CLT_CENTER_ID as INTEGER) ="+client.CLT_CENTER_ID;
            
            myDB.execute(cmd, function(results){
                console.log('getLeaders');
                console.log(results);
                console.log(client);
                for(var r in results){
                    $scope.ctr_lead.ctr_leaders.push(results[r]);
                    if(results[r].CLT_GROUP_ID == client.CLT_GROUP_ID){
                        $scope.grp_lead.grp_lead_pk = results[r].CLT_PK;
                        $scope.grp_lead.grp_lead_name = results[r].CLT_FULL_NAME;
                        $scope.grp_lead.hasSigned = false; 
                    }
                }
            });
        };

        $scope.showSignscreen = function(idx, t){

            var type = typeof t !== 'undefined' ? t : null; 
            if(!$scope.showSign){
                $scope.showSign = true;
                setTimeout(function(){
                    if(type == null){
                        $scope.signingclientIndex = 0;
                        var client = $scope.client;
                        $scope.loadSignaturePad(client, null);
                    } else {
                        $scope.signingclientIndex = null;
                        $scope.signinguser = type;
                        $scope.loadSignaturePad(null, type, null);
                        $scope.signinguser = type;
                    }
    
                },100);
    
            } else {
                $scope.showSign = false;
            }
        }
    
        var $sigdiv = $("#ppisignature")
        var canvas = $('#the-ppicanvas')[0];
        var context = canvas.getContext("2d");
    
        var imht = 100;
        var imwt = 200;
    
        var img2 = "";
    
        $scope.loadSignaturePad = function(client, type, idx){
    
            client = typeof client !== 'undefined' ? client : null;
    
            $('#ppisigbtn').fadeIn();
    
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
    
            $('#ppisignature').jSignature('clear');
            $('.displayarea').html('');
    
            context.clearRect(0, 0, canvas.width, canvas.height);
    
            $('.jSignature').css('background','#EEE');
            $('.jSignature').css('border-bottom','2px solid black');
            $('.jSignature').css('margin-bottom','15px');
            
            var signingMsg = ''; 
            if(type == null || type == undefined){
                signingMsg = $scope.applicantdata.fullname+' '+ i18n.t("messages.SignHere");
            } else if (type == 'officer') {
                signingMsg = $scope.user.userName+' '+ i18n.t("messages.SignHere");
            } else if (type == 'mgr'){
                signingMsg = $scope.MGR.mgrname+' '+ i18n.t("messages.SignHere");
            } else if (type == 'ctr_lead'){
                signingMsg = $scope.ctr_lead.ctr_lead_name+' '+ i18n.t("messages.SignHere");
            } else if (type == 'grp_lead'){
                signingMsg = $scope.grp_lead.grp_lead_name+' '+ i18n.t("messages.SignHere");
            } else if (type == 'witness') {
                signingMsg = $scope.witnesses.witness_name+' '+ i18n.t("messages.SignHere");
            } else if (type == 'family') {
                signingMsg = $scope.familyMember.membername+' '+ i18n.t("messages.SignHere");
            }

            $('#ppisigningperson').html('<h3><p>' + signingMsg + '</p></h3>');

            $('html, body').animate({
                scrollTop: $("#the-canvas").offset().top - 30
            }, 500);
    
        }
    
        $scope.clearSignature = function(ind, type){
    
            ind = typeof ind !== 'undefined' ? ind : null;
    
            $scope.clearSigPad();
    
            if( ind != null ){
                var client = $scope.selectedClient;
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
    
            //$scope.$apply();
    
        }
    
        $scope.clearSigPad = function(){
            if($scope.showSign){
                $('#ppisignature').jSignature('clear');
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
                img2.src = dsrc;
            } else if (type == 'mgr'){
                var dsrc = atob($scope.MGR.Signature);
    
                var img2 = new Image();
                img2.onload = (function(){
                    var canv = $('#the-canvas-mgr')[0];
                    var cont = canv.getContext("2d");
                    cont.drawImage(img2, 0, 0, 200, 100);
                });
                img2.src = dsrc;
            } else if (type == 'client'){
                var dsrc = atob(c_sig);
                var img2 = new Image();
                img2.onload = (function(){
                    var canv = $('#the-canvas-client')[0];
                    var cont = canv.getContext("2d");
                    cont.drawImage(img2,0,0,200,100);
                });
                img2.src = dsrc;
            } else if (type == 'ctr_lead'){
                var dsrc = atob($scope.ctr_lead.Signature);
    
                var img2 = new Image();
                img2.onload = (function(){
                    var canv = $('#the-canvas-'+$scope.ctr_lead.ctr_lead_pk)[0];
                    var cont = canv.getContext("2d");
                    cont.drawImage(img2,0,0,300,150);
                });
                img2.src = dsrc;
            } else if (type == 'grp_lead'){
                var dsrc = atob($scope.grp_lead.Signature);
    
                var img2 = new Image();
                img2.onload = (function(){
                    var canv = $('#the-canvas-'+$scope.grp_lead.grp_lead_pk)[0];
                    var cont = canv.getContext("2d");
                    cont.drawImage(img2,0,0,300,150);
                });
                img2.src = dsrc;
            } else if (type == 'centerleader' || type == 'groupleader' || type == 'witness') {
                myDB.execute("SELECT CLT_SIGNATURE FROM T_CLIENT WHERE CLT_PK=" + pk, function(res) {
                    if(res) {
                        if(res[0]) {
                            var dsrc = atob(res[0].CLT_SIGNATURE);
    
                            var img2 = new Image();
                            img2.onload = (function(){
                                if(type == 'centerleader') var canv = $('#the-canvas-ctr_lead')[0];
                                if(type == 'groupleader') var canv = $('#the-canvas-grp_lead')[0];
                                if(type == 'witness') {
                                    var canv = $('#the-canvas-'+pk)[0];
                                }
                                
                                var cont = canv.getContext("2d");
                                cont.clearRect(0, 0, 300, 150);
                                cont.drawImage(img2,0,0,300,150);
    
                            });
                            img2.src = dsrc;
                        }
                    }
                })
            } else if (type == 'family'){
                var dsrc = atob(c_sig);
                var img2 = new Image();
                img2.onload = (function(){
                    var canv = $('#the-canvas-family')[0];
                    var cont = canv.getContext("2d");
                    cont.drawImage(img2,0,0,200,100);
                });
                img2.src = dsrc;
            }
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
                var scrollTo = '#client-signatures'; 
                if($scope.signingclientIndex != null){
                    var client = $scope.client;
                    //console.log(client);
                    var canv = $('#the-canvas-client')[0];
                    scrollTo = '#the-canvas-client';
                    $scope.$apply(function(){
                        $scope.applicantdata.hasSigned = true;
                        $scope.applicantdata.CLT_SIGNATURE = blob;
                    })
                } else if($scope.signinguser == 'officer'){
                    scrollTo = '#the-canvas-officer';
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
                } else if ($scope.signinguser === 'witness') { 
                    var canv = $('#the-canvas-'+$scope.witnesses.witness_pk)[0];
                    $scope.$apply(function(){
                        $scope.witnesses.hasSigned = true;
                        $scope.witnesses.Signature = blob;
                    })
                } else if ($scope.signinguser === 'family') {
                    var canv = $('#the-canvas-family')[0];
                    $scope.$apply(function(){
                        $scope.familyMember.hasSigned = true;
                        $scope.familyMember.Signature = blob;
                    });
                }
           
                if($scope.signingclientIndex != null || $scope.signinguser == 'grp_lead' || $scope.signinguser == 'ctr_lead' || $scope.signinguser.indexOf("witness") > -1){
    
                    var SIG_CLT_PK = "";
                    if($scope.signingclientIndex != null){
                        SIG_CLT_PK = $scope.applicantdata.CLT_PK;
                    } else if ($scope.signinguser == 'grp_lead'){
                        SIG_CLT_PK = $scope.grp_lead.grp_lead_pk;
                    } else if ($scope.signinguser == 'ctr_lead') {
                        SIG_CLT_PK = $scope.ctr_lead.ctr_lead_pk;
                    } else if ($scope.signinguser.indexOf("witness") > -1) {
                        var idx = $scope.signinguser.split("witness")[1];
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
    
                $('html, body').animate({
                    scrollTop: $(scrollTo).offset().top - 50
                }, 500);
    
                $scope.$apply();
            });
    
            img2.src = dsrc;
        }

        $scope.checkPPI = function() {
            var allAnswered = true;
            $.each($scope.ppiQuestions, function(q, qtn){
                var answer = '';
                var score = ''; 
                if($scope.isQtnType(qtn, 'text')) {
                    answer = qtn.answer;
                    score = qtn.score;
                } else {
                    if(qtn.answer != null) {
                        answer = qtn.answer.CODE_NAME;
                        score  = qtn.answer.CODE_VALUE;
                    }
                } 

                
                if(qtn.PPIQ_NEED_ANSWER==="Y" && (answer == '' || answer == undefined)) {
                    console.log('question',q,allAnswered);
                    allAnswered = false;
                }

            });

            if(!allAnswered) {
                swal({
                    title: i18n.t("messages.PleaseCompleteAllQuestions"), 
                    type: "error",
                    confirmButtonColor: "#80C6C7",
                    confirmButtonText: "Ok", 
                });
                return false;
            }
            
            var allSigned = true;
            var nonMandatoryNotSigned = '';
            var mandatoryNotSigned = '';
            if( !$scope.applicantdata.hasSigned) { //check client
                allSigned = false; 
                mandatoryNotSigned = i18n.t("messages.PPIClientNoSign");
            // } else if (! $scope.grp_lead.hasSigned) { // check group leader
            //     allSigned = false;
            //     mandatoryNotSigned = i18n.t("messages.PPIGroupLeadNoSign");
            } else if (! $scope.user.hasSigned) { // check FO signature
                allSigned = false;
                mandatoryNotSigned = i18n.t("messages.PPIFONoSign");
            } else if( !$scope.familyMember.hasSigned) {
                allSigned = false;
                nonMandatoryNotSigned += i18n.t("messages.PPIFamilyNoSign");
            }

            // if( !$scope.ctr_lead.hasSigned) {
            //     if(nonMandatoryNotSigned !== '') nonMandatoryNotSigned += " " +i18n.t("messages.And")
            //     nonMandatoryNotSigned += " "+i18n.t("messages.PPICenterLeadNoSign");
            // }
            
            if (! $scope.witnesses.hasSigned) { //check witness
                if(nonMandatoryNotSigned !== '') nonMandatoryNotSigned += " " +i18n.t("messages.And")
                nonMandatoryNotSigned += " "+i18n.t("messages.PPIWitnessNoSign");
            } 

            if(nonMandatoryNotSigned !== '') {
                swal({ 
                    title: i18n.t("messages.PendingSignatures"),
                    text: nonMandatoryNotSigned, 
                    type: "info",
                    showCancelButton: true,
                    confirmButtonColor: '#0091EA',
                    cancelButtonColor: '#EF5350',
                    confirmButtonText: i18n.t("buttons.Proceed")
                }).then((result) => {
                    if (result.value) {
                        $scope.savePPI();
                    }
                })  
            } else {
                if(allSigned) {
                    $scope.savePPI();
                } else {
                    swal({
                        title: i18n.t("messages.PendingSignatures"),
                        text: mandatoryNotSigned,
                        type: "error",
                        confirmButtonColor: "#80C6C7",
                        confirmButtonText: "Ok", 
                    });
                }
            }
        }

        $scope.savePPI = function() {
            var centerleader_pk = null;
            if( $scope.ctr_lead.hasSigned) {
                centerleader_pk = $scope.ctr_lead.ctr_lead_pk;
            }
            var familySignature = '';
            if( $scope.familyMember.hasSigned) {
                familySignature = $scope.familyMember.Signature;
            }
            var query = "INSERT INTO T_PPI_FORM VALUES (null, "+$scope.maxPPIFormPk+", "+$scope.applicantdata.CLT_PK+", null, "+ $scope.getTotalPPIScore()+", "+$scope.applicantdata.CLT_PK+", "+ $scope.user.userPK+", "+$scope.witnesses.witness_pk+", null, "+centerleader_pk+", " +$scope.grp_lead.grp_lead_pk+ ", '"+$scope.familyMember.membertype+"', '"+$scope.familyMember.membername+"', '"+familySignature+"', "+$scope.user.userPK+", '"+moment().format('DD/MM/YYYY HH:mm:ss')+"', "+$scope.user.userPK+", '"+moment().format('DD/MM/YYYY HH:mm:ss')+"', 1 )";
            console.log(query)
            myDB.execute(query, function(save) {
                if(save) {
                    console.log(save);
                    var ppiQueries = [];
                    
                    $.each($scope.ppiQuestions, function(q, qtn){
                        var answer = '';
                        var score = '';
                        if($scope.isQtnType(qtn, 'text')) {
                            answer = qtn.answer;
                            score = qtn.score;
                        } else { 
                            // if the question is optional , answer can be null
                            if(qtn.answer){
                                answer = qtn.answer.CODE_NAME;
                                score  = qtn.answer.CODE_VALUE; 
                            }else{
                                answer = ''
                                score  = '0'
                            }
                        }

                        var qry = "INSERT INTO T_PPI_ANSWER VALUES (null, "+$scope.maxPPIAnsPk+", "+$scope.maxPPIFormPk+", "+ qtn.PPIQ_PK+", '"+ answer + "', '"+ score + "', "+$scope.user.userPK+", '"+moment().format('DD/MM/YYYY HH:mm:ss')+"', "+$scope.user.userPK+", '"+moment().format('DD/MM/YYYY HH:mm:ss')+"' )";
                        console.log(qry);
                        ppiQueries.push(qry);
                        $scope.maxPPIAnsPk  = parseInt($scope.maxPPIAnsPk) + 1;
                    });
                    myDB.dbShell.transaction(function(tx){ 
                        for(e in ppiQueries){ tx.executeSql(ppiQueries[e]);} 
                    }, function(err){ 
                        swal({
                            title: i18n.t("messages.Alert"),
                            text: i18n.t("messages.PPIFail"),
                            type: "error",
                            confirmButtonColor: "#80C6C7",
                            confirmButtonText: "Ok", 
                        });
                        return false;
                    }, function(suc){ 
                        swal({
                            title: i18n.t("messages.PPISuccess"),
                            text: '',
                            type: "success",
                        });
                        $scope.isPPIComplete = true;
                        $scope.$apply();
                        refreshall('.ppiqtns');
                        $scope.isitDone();
                    });
                }
            })
        }
        
        $scope.updateWitness = function(idx) {
            $scope.witnesses.witness_pk = $scope.selectedWitness.CLT_PK;
            $scope.witnesses.witness_name = $scope.selectedWitness.CLT_FULL_NAME;
            setTimeout(() => {
                refreshall('.witness');
            }, 1);
        }
    
        $scope.updateCtrLeader = function(){

            $scope.ctr_lead.ctr_lead_pk = $scope.selectedCtrLeader.CLT_PK;
            $scope.ctr_lead.ctr_lead_name = $scope.selectedCtrLeader.CLT_FULL_NAME;
    
        };
    
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
                console.log(results[0].USER_HAVE_SIGNATURE);
                if(results[0].USER_HAVE_SIGNATURE == 'Y') {
                    $scope.user.hasSigned = true;
                    $scope.showSignature('officer');
                }
            });
        } 
    
        $scope.loadsign = function(){
            setTimeout(function(){
                $scope.loadSignaturePad();
            },500);
        } 

        $scope.getMaxPPIFormPk = function(){
            myDB.execute("SELECT MAX(PPIF_PK) as maxppi FROM T_PPI_FORM ", function(res) {
                var maxppi = res[0].maxppi == null ? 0 : res[0].maxppi;
                $scope.maxPPIFormPk = parseInt(maxppi) + 1;
                console.log("$scope.maxPPIFormPk " + $scope.maxPPIFormPk);
            });
        }
        $scope.getMaxPPIAnsPk = function(){
            myDB.execute("SELECT MAX(PPIA_PK) as maxppi FROM T_PPI_ANSWER ", function(res) {
                var maxppi = res[0].maxppi == null ? 0 : res[0].maxppi;
                $scope.maxPPIAnsPk = parseInt(maxppi) + 1;
                console.log("$scope.maxPPIAnsPk " + $scope.maxPPIAnsPk);
            });
        }

        setTimeout(() => {
            $scope.getMaxPPIFormPk();
            $scope.getMaxPPIAnsPk();
        }, 3000);

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
                //console.log($scope.signingclientIndex);
                if(type == null || type == 'client' || type == 'newclient'){
                    var client = $scope.client;
                    //console.log(client);
                    var canv = $('#the-canvas-client')[0];
                    $scope.$apply(function(){
                        $scope.applicantdata.hasSigned = true;
                        $scope.applicantdata.CLT_SIGNATURE = blob;
                    })
                } else if(type === 'officer'){
                    var canv = $('#the-canvas-officer')[0];
                    $scope.$apply(function(){
                        $scope.user.hasSigned = true;
                        $scope.user.Signature = blob;
                    });
    
                    var cmd1 = "UPDATE T_USER SET USER_SIGNATURE ='"+blob+"' , USER_HAVE_SIGNATURE='Y' WHERE USER_PK = "+$scope.user.userPK;
    
                    myDB.execute(cmd1, function(res){});

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
})();

/******************************************************************************
Add menu and buttons to every page
******************************************************************************/
function init(){
    initTemplate.load(2);
    $(".ncadPhoto").each(function(){ $(this).width(250).height($(this).width()*1.25); });
    var  newheader = '  <div class="etask-container">'+
                            '<div data-role="controlgroup" data-type"horizontal" class="etask-progress top" style="text-align:left;" >'+
                                '<div class="etask"><div class="etask-icon">1<i class="fa fa-check hidden"></i></div><a href="#pageAppData" data-ajax="false" class="etask-name active" data-i18n="buttons.Applicant">Applicant</a></div>'+
                                '<div class="etask"><div class="etask-icon">5<i class="fa fa-check hidden"></i></div><a href="#pageAddress" data-ajax="false" class="etask-name"  data-i18n="buttons.Address">Address</a></div>'+
                                '<div class="etask"><div class="etask-icon">2<i class="fa fa-check hidden"></i></div><a href="#pageAppData2" data-ajax="false" class="etask-name" data-i18n="messages.MaritalStatus">Marital Status</div></a>'+  
                                '<div class="etask"><div class="etask-icon">3<i class="fa fa-check hidden"></i></div><a href="#pageAppData3" data-ajax="false" class="etask-name" data-i18n="buttons.HouseholdMother">HouseholdMother</a></div>'+  

                                '<div class="etask-progress-bar"></div>'+
                            '</div>'+

                            '<div data-role="controlgroup" class="etask-progress-vert" >'+
                                '<div class="etask-progress-bar-vert right"></div>'+
                            '</div>'+

                            '<div data-role="controlgroup" class="etask-progress-reverse">'+
                                '<div class="etask"><div class="etask-icon">8<i class="fa fa-check hidden"></i></div><a href="#pageProductMapping" data-ajax="false" class="etask-name" data-i18n="messages.FinalStep">Langkah terakhir</a></div>'+
                                '<div class="etask"><div class="etask-icon">7<i class="fa fa-check hidden"></i></div><a href="#pageAppData4" data-ajax="false" class="etask-name"  >PPI Form</a></div>'+
                                '<div class="etask"><div class="etask-icon">7<i class="fa fa-check hidden"></i></div><a href="#pageHouseIncomeEst" data-ajax="false" class="etask-name" data-i18n="buttons.Income">Income</a></div>'+
                                '<div class="etask"><div class="etask-icon">6<i class="fa fa-check hidden"></i></div><a href="#pageHousingIndex" data-ajax="false" class="etask-name"  data-i18n="buttons.HousingIndex">Housing Index</a></div>'+
                                
                              //   '<div class="etask"><div class="etask-icon">7<i class="fa fa-check hidden"></i></div><a href="#pageWorkingCapital" data-ajax="false" class="etask-name"  data-i18n="buttons.WorkingCapital">Working Capital</a></div> '+
                              //   '<div class="etask"><div class="etask-icon">6<i class="fa fa-check hidden"></i></div><a href="#pageWelfareStatus" data-ajax="false" class="etask-name" data-i18n="buttons.FamilyWelfare">Family Welfare</a></div>'+
                              '<div class="etask-progress-bar-reverse"></div>'+
                            '</div>'+
                        '</div>';

    $("[data-role=main] ").each(function(){
      //   $(this).prepend('<div data-role="controlgroup" data-type="horizontal" style="text-align:left;">'+
      //                   '<a href="#pageAppData" class="ui-btn ui-btn-h ui-corner-all ui-shadow ui-icon-user ui-btn-icon-left" data-i18n="buttons.Applicant">Applicant</a>'+
      //                   '<a href="#pageAppData2" class="ui-btn ui-btn-h ui-corner-all ui-shadow ui-icon-user ui-btn-icon-left" data-i18n="buttons.Husband">Husband</a>'+
      //                   '<a href="#pageAppData3" class="ui-btn ui-btn-h ui-corner-all ui-shadow ui-icon-user ui-btn-icon-left" data-i18n="buttons.HouseholdMother">Household/Mother</a>'+
      //                   '<a href="#pageAppData4" class="ui-btn ui-btn-h ui-corner-all ui-shadow ui-icon-plus ui-btn-icon-left" data-i18n="buttons.Business">Business</a>'+
      //                   '<a href="#pageAddress" class="ui-btn ui-btn-h ui-corner-all ui-shadow ui-icon-phone ui-btn-icon-left" data-i18n="buttons.Address">Address/Tel</a>'+
      //                   '</div>'+'<div data-role="controlgroup" data-type="horizontal" style="text-align:left;">'+
      //                   '<a href="#pageWelfareStatus" class="ui-btn ui-btn-h ui-corner-all ui-shadow ui-icon-home ui-btn-icon-left" data-i18n="buttons.FamilyWelfare">Family Welfare</a>'+
      //                   '<a href="#pageWorkingCapital" class="ui-btn ui-btn-h ui-corner-all ui-shadow ui-icon-bars ui-btn-icon-left" data-i18n="buttons.WorkingCapital">Working Capital</a>'+
      //                   '<a href="#pageHousingIndex" class="ui-btn ui-btn-h ui-corner-all ui-shadow ui-icon-home ui-btn-icon-left" data-i18n="buttons.HousingIndex">Housing Index</a>'+
      //                   '<a href="#pageHouseIncomeEst" class="ui-btn ui-btn-h ui-corner-all ui-shadow ui-icon-bars ui-btn-icon-left" data-i18n="buttons.Income">Income</a>'+
						// '<a href="#pageProductMapping" class="ui-btn ui-btn-h ui-corner-all ui-shadow ui-icon-bars ui-btn-icon-left" data-i18n="buttons.ProductMapping">Product Mapping</a>'+
      //                   '</div>');
        $(this).prepend(newheader);
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

$(document).on('pagebeforeshow', function () {
    var URL = $.mobile.path.parseUrl(window.location).toString();

    var strar = URL.split("#");
    var myString = "";
    if(strar.length > 1){
        myString = "#"+strar.pop().trim();
    }
    $('.etask a').removeClass('active');
    if(myString !== ""){
        $('.etask a[href$="'+myString+'"]').addClass('active');
    } else {
        $('.etask a[href$="#pageAppData"]').addClass('active');
    }

});
$("#newClientForm").enterAsTab({ 'allowSubmit': true});

function inArray(obj,array){
    if(jQuery.inArray(obj, array) !== -1){
        return true;
    } else {
        return false;
    }
}

$(document).ready(function() {
    $('.pmenu-icon').on('click', function(event ) {
        event.preventDefault();
        event.stopPropagation();
        swal({ 
            title: i18n.t("messages.AreYouSure"),
            text: i18n.t("messages.LoseNewClientData"), 
            type: "info",
            showCancelButton: true,
            confirmButtonText: i18n.t("buttons.Proceed")
        }).then((result) => {
            console.log(result);
            if (result.value) {
                window.location.href = 'client.html';
            }
        }) 
    })
})

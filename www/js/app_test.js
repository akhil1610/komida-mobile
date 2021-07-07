/******************************************
// Controller
******************************************/
(function() {
    //var myApp = angular.module("myApp", ['ng-currency']);
	var myApp = angular.module("myApp", ['ng-currency', 'pascalprecht.translate', 'masonry']);

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
                        console.log('initialised');
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
        }
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

                        if( scope.applicantdata.photo==null||
                            scope.applicantdata.fullname==null||
                            scope.applicantdata.gender==null||
                            // scope.applicantdata.loantype==null||
                            scope.applicantdata.placeofbirth==null||
                            scope.applicantdata.familycardno==null||
                            scope.applicantdata.ktpno==null||
                            scope.applicantdata.dateofbirth== null||
                            scope.applicantdata.age==null||
                            scope.applicantdata.applicantdata<10||
                            scope.applicantdata.applicantdataapplicantdata>100||
                            scope.applicantdata.highested== null||
                            (scope.applicantdata.highested=='6'&&scope.applicantdata.highestedothers=="")){

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
                                    sweetCheckRange(10,100,scope.applicantdata.age,i18n.t("messages.InvalidAge"),"pageAppData")
                                  ){

                                } else if(scope.applicantdata.highested=='6'&&scope.applicantdata.highestedothers==""){
                                    swal({
                                        title: i18n.t("messages.Alert"),
                                        text: i18n.t("messages.EmptyOtherEducation"),
                                        type: "error",
                                        confirmButtonColor: "#80C6C7",
                                        confirmButtonText: "Ok",
                                        closeOnConfirm: true
                                    });
                                }

                            return false;
                        } else {

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

                            setTimeout(function(){
                                $.mobile.changePage("#pageAppData2");
                            },1450)


                        }


                    } else if(page == 'pageAppData2'){


                        //CHECK MARRITAL
                        if( scope.husbandinfo.maritalstatus==null||
                            (scope.showHusband()&& scope.husbandinfo.husbandname==null)||
                            (scope.showHusband()&& scope.husbandinfo.husbandidno==null)){
                                if( sweetCheckNull (scope.husbandinfo.maritalstatus,i18n.t("messages.EmptyMaritalStatus"))
                                ){

                                } else  if(scope.showHusband()&&(scope.husbandinfo.husbandname==null)){

                                    swal({
                                        title: i18n.t("messages.Alert"),
                                        text: i18n.t("messages.EmptyHusbandName"),
                                        type: "error",
                                        confirmButtonColor: "#80C6C7",
                                        confirmButtonText: "Ok",
                                        closeOnConfirm: true
                                    });
                                } else if(scope.showHusband()&&(scope.husbandinfo.husbandidno==null)){
                                    swal({
                                        title: i18n.t("messages.Alert"),
                                        text: i18n.t("messages.EmptyHusbandIDNo"),
                                        type: "error",
                                        confirmButtonColor: "#80C6C7",
                                        confirmButtonText: "Ok",
                                        closeOnConfirm: true
                                    });
                                }
                            e.stopPropagation();
                            e.preventDefault();
                            return false;

                        } else {
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
                            setTimeout(function(){
                                $.mobile.changePage("#pageAppData3");
                            },1450)

                        }

                    } else if(page == 'pageAppData3'){

                        if(scope.housemotherinfo.noofmembers==null||
                            scope.housemotherinfo.noofchildren==null||
                            scope.housemotherinfo.mothername==null||
                            scope.housemotherinfo.motherdob==null||
                            scope.housemotherinfo.motherage==null||
                            scope.housemotherinfo.parentsresidence==null||
                            scope.housemotherinfo.noofmembers<0 || scope.housemotherinfo.noofmembers>99||
                            scope.housemotherinfo.noofchildren<0 || scope.housemotherinfo.noofchildren>99||
                            scope.housemotherinfo.motherage<10 || scope.housemotherinfo.motherage>120){

                            if( sweetCheckNull(scope.housemotherinfo.noofmembers,i18n.t("messages.EmptyMember"),"pageAppData3")||
                                sweetCheckRange(0,99,scope.housemotherinfo.noofmembers,i18n.t("messages.InvalidMember"),"pageAppData3")||
                                sweetCheckNull(scope.housemotherinfo.noofchildren,i18n.t("messages.EmptyChildren"),"pageAppData3")||
                                sweetCheckNull(scope.housemotherinfo.parentsresidence,i18n.t("messages.EmptyParentsResidence"),"pageAppData3")||
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
                            setTimeout(function(){
                                $.mobile.changePage("#pageAppData4");
                            },1450)
                        }
                    } else if(page == 'pageAppData4'){

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
                            setTimeout(function(){
                                $.mobile.changePage("#pageAddress");
                            },1450)

                    } else if(page == 'pageAddress'){
                        console.log(scope.address.village);
                        if( scope.address.village.val==null||
                            scope.address.subdistrict==null||
                            scope.address.district==null
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
                            setTimeout(function(){
                                $.mobile.changePage("#pageWelfareStatus");
                            },1450)
                        }

                    } else if(page == 'pageWelfareStatus'){

                        if(scope.welfareStatus == null){
                            if(sweetCheckNull(scope.welfareStatus,i18n.t("messages.EmptyWelfareStatus"),"pageWelfareStatus"))
                            {

                            }
                            e.stopPropagation();
                            e.preventDefault();
                            return false;

                        } else {
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
                            setTimeout(function(){
                                $.mobile.changePage("#pageWorkingCapital");
                            },1450)
                        }

                    } else if(page == 'pageWorkingCapital'){

                        if(scope.borrowedFunds.length>0){
                            for(key in scope.borrowedFunds){
                                if(!scope.checkFunds(scope.borrowedFunds[key])){


                                    e.stopPropagation();
                                    e.preventDefault();
                                    return false;
                                }
                            }
                        }

                        if( scope.workcap.app==null|| isNaN(scope.workcap.app)||
                            (scope.husbandinfo.maritalstatus=='M'&&scope.workcap.husband==null) || (scope.husbandinfo.maritalstatus=='M'&&isNaN(scope.workcap.husband))){

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
                                    closeOnConfirm: true
                                });
                            }
                            e.stopPropagation();
                            e.preventDefault();
                            return false;

                        } else {
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
                            setTimeout(function(){
                                $.mobile.changePage("#pageHousingIndex");
                            },1450)
                        }

                    } else if(page == 'pageHousingIndex'){

                        if( scope.applicantdata.homeless != 'YES' &&
                            (scope.choices[0]==0||
                            scope.choices[1]==0||
                            scope.choices[2]==0||
                            scope.choices[3]==0||
                            scope.choices[4]==0) ){
                            // scope.choices[5]==null||
                            // scope.choices[6]==null){
                            // scope.houseinfo.housetype==null||

                              if(
                                    sweetCheckZero(scope.choices[0],i18n.t("messages.EmptyHouseSize"),"pageHousingIndex")||
                                    sweetCheckZero(scope.choices[1],i18n.t("messages.EmptyHouseCondition"),"pageHousingIndex")||
                                    sweetCheckZero(scope.choices[2],i18n.t("messages.EmptyRoofType"),"pageHousingIndex")||
                                    sweetCheckZero(scope.choices[3],i18n.t("messages.EmptyWallType"),"pageHousingIndex")||
                                    sweetCheckZero(scope.choices[4],i18n.t("messages.EmptyFloorType"),"pageHousingIndex")
                                    // sweetCheckNull(scope.choices[5],i18n.t("messages.EmptyElectricitySource"),"pageHousingIndex")||
                                    // sweetCheckNull(scope.choices[6],i18n.t("messages.EmptyWaterSource"),"pageHousingIndex")
                                    //sweetCheckNull(scope.houseinfo.housetype,i18n.t("messages.EmptyHouseType"),"pageHousingIndex")||
                                )
                                {

                                }
                            e.stopPropagation();
                            e.preventDefault();
                            return false;
                        } else {
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
                            setTimeout(function(){
                                $.mobile.changePage("#pageHouseIncomeEst");
                                scope.rerender();
                                scope.$apply();
                            },1450)
                        }

                    } else if(page == 'pageHouseIncomeEst'){

                        // if(scope.houseIncomes.length<1){
                        //     swal({
                        //         title: i18n.t("messages.Alert"),
                        //         text: i18n.t("messages.MinIncomeSource"),
                        //         type: "error",
                        //         confirmButtonColor: "#80C6C7",
                        //         confirmButtonText: "Ok",
                        //         closeOnConfirm: true
                        //     });
                        //     e.stopPropagation();
                        //     e.preventDefault();
                        //     return false;
                        // }

                        // for(key in scope.houseIncomes){
                        //     if(!checkIncomes(scope.houseIncomes[key])){
                        //         e.stopPropagation();
                        //         e.preventDefault();
                        //         return false;
                        //     }
                        // }

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
                            setTimeout(function(){
                                $.mobile.changePage("#pageProductMapping");
                            },1450)


                    } else if(page == 'pageProductMapping'){

                        if(scope.selectedLoans.length == 0){
                            swal({
                                title: i18n.t("messages.Alert"),
                                text: i18n.t("messages.NoLoanSelected"),
                                type: "warning",
                                closeOnConfirm: true
                            }, function(){
                                return false;
                            });
                            return false;
                        } else {
                            var totalloan = 0;
                            for(key in scope.selectedLoans){
                                // if($scope.selectedLoans[key].selecteddetais.)
                                totalloan += scope.selectedLoans[key].selecteddetais.loanamt;
                            }

                            if(totalloan > 10000000) {
                                swal({
                                    title: i18n.t("messages.Alert"),
                                    text: i18n.t("messages.LoansExceed"),
                                    type: "warning",
                                    closeOnConfirm: true
                                }, function(){
                                    return false;
                                });
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
                            setTimeout(function(){
                                $.mobile.changePage("#loanSummary");
                            },1000);
                        }
                    }

                });

                function checkIncomes(incObj){
                    var cols = 0;
                    var totalcols = 8;
                    for(key in incObj){
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
                                    closeOnConfirm: true
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
                            closeOnConfirm: true
                        });

                        return false;
                    }
                    return true;
                }

            }
        }
    })

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
            console.log(lty_pk);
            if(lty_pk == undefined || lty_pk == null) return items;

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
            var selected = element2.find('option:selected').text();
            element2.parent().find('span').html(selected);

            var element2 = $('#activeloanGracePeriod');
            var selected = element2.find('option:selected').text();
            element2.parent().find('span').html(selected);

            //$('#activeloanPurpose').selectmenu().selectmenu().selectmenu();

            return filtered;
        };
    });


	myApp.controller("clientCtrl",['$scope','$filter','$timeout', function($scope,$filter,$timeout){

        //$scope.$on('$viewContentLoaded', jqueryStartWork);

        $scope.$on('ngRepeatFinished', function (ngRepeatFinishedEvent) {
            //you also get the actual event object
            //do stuff, execute functions -- whatever...
            //alert("ng-repeat finished");
            //swal("ng-repeat finished");
        });
        /**
        !note: remove this Magic Button
        **/
        var cmd = "select * from T_COMPANY"
        myDB.execute(cmd, function(results){
                //console.log(results);
        });
        $scope.currloc = '';


        //TEXTS IN NG-REPEAT
        $scope.grouptext = i18n.t("messages.Group");
        $scope.actiontext = i18n.t("messages.Action");
        $scope.maxMembers = 5;
        $scope.currGrp = {};
        $scope.leader = null;
        $scope.available = [];
        $scope.savedGrps = [];
        $scope.currloc = 0;
        $scope.unproassets = [];
        $scope.feastrepay = feastrepay;
        $scope.selectedRepayment =  null;

        $scope.unproaObj = {
            index: 0,
            asset: '',
            value: 0
        }


        $scope.magic = function(){
            return false;
            if(!devtest) return false; //no magic buttons for production
            //or transparent : data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7
            $scope.applicantdata.photo='data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
            $scope.applicantdata.fullname="Jaminah";
            $scope.applicantdata.nickname="Jaminah";
            $scope.applicantdata.gender='F';
            $scope.applicantdata.placeofbirth='Place of Birth';
            $scope.applicantdata.dateofbirth=''
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
            $scope.houseinfo.housetype=1,
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
        }

        $scope.removePhoto = function(){
            var image = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
            $scope.applicantdata.photo = image;
            $("#ncadPhoto").src = image;
        }

        $scope.onSuccess = function (imageData) {
            $scope.$apply(function() {
                //console.log(imageData);
                $scope.applicantdata.photo = "data:image/jpg;base64," + imageData;
                $("#ncadPhoto").src = "data:image/jpg;base64," + imageData;
            });
        }

        //$scope.onFail = function (message) {alert('Failed because: ' + message);}
		$scope.onFail = function (message) {
			//alert(i18n.t("messages.PhotoTakeFail") + message);
            swal({
                title: i18n.t("messages.Alert"),
                text: i18n.t("messages.PhotoTakeFail") + message,
                type: "error",
                confirmButtonColor: "#80C6C7",
                confirmButtonText: "Ok",
                closeOnConfirm: true
            });
		}

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
                })
            })
        }

        $scope.getProductMaster();

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
						havePastmembership: 'NO',
            homeless: 'NO',
        };


        $scope.apHighestEdOthers = function(){
            return $scope.applicantdata.highested=="6";
        };

        $scope.adCalcAge = function(){
            var year = (document.getElementById('ncadDateofBirth').value).split("-")[0];
            var diff = parseInt(moment().format('YYYY'))-parseInt(year);
            var age = 0;
            if(diff==null||isNaN(diff)) age = 0;
            else age = diff;
            $scope.applicantdata.age = age;
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

        }
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
            if(diff==null||isNaN(diff)) age = 0;
            else age = diff;
            $scope.housemotherinfo.motherage = age;
            return age;
        }

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

        $scope.addNewUpro = function(ind){

            var isnew = true;

            if(ind == 0) isnew = false;

            var currpro = parseInt(ind);
            var maxunpro = $scope.unproassets.length;
            var newobj = {
                index: parseInt(maxunpro + 1),
                asset: '',
                value: 0,
                isNew: isnew
            }

            if(maxunpro == currpro){
                $scope.unproassets.push(newobj);
                setTimeout(function() {$scope.$apply();}, 100);
            }
        }

        $scope.getTotalUnproVal = function(){
            var sum = 0;
            $.each($scope.unproassets, function(index, value){
                sum += parseFloat(value.value);
            })
            return sum;
        }

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
        }

        $scope.addFund = function(){
            if(!$scope.checkFunds($scope.fundEntry)) return false;
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
		//console.log("mato "+$scope.produts.maturityObjects);
		$scope.selectOption = function(idx, obj){
			//$("#maturityOption32-button").children().text("test");
            //console.log($scope.products[idx].selectedMaturityOption);
            console.log(obj.selectedMaturityOption);

            $('.newprodmat').each(function(i, element) {
                var selected = $(this).find('option:selected').text();
                if(selected != null && selected != ''){
                    $(this).parent().find('span').html(selected);
                }

            });
		}

        $scope.loadLoanPurpose = function(){
            myDB.execute("SELECT * FROM T_LOAN_PURPOSE WHERE LPU_LTY_PK",function(results){
                //console.log(results);
                if(results.length > 0){
                    $.each(results, function(i,val){

                        var key = { value: val.LPU_PK, name: val.LPU_NAME, code: val.LPU_CODE, loan: val.LPU_LTY_PK };
                        $scope.loanpurpose.push(key);
                    });
                }
            });
        }
		$scope.loadLoanPurpose();

        function checkFunds(fundObj){
            var cols = 0;
            var totalcols = 7;
            for(key in fundObj){
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
                        closeOnConfirm: true
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
                            closeOnConfirm: true
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
                sum += parseInt(inc.fixed) + parseInt(inc.variable);
            });

            return sum;
        }


        $scope.checkNegative = function(income){

            if(income.inctype == 'NEGATIVE'){

                if(parseInt(income.fixed) > 0) {
                    income.fixed = parseInt(income.fixed) * -1;
                }
                if(income.variable > 0) {
                    income.variable = parseInt(income.variable) * -1;
                }

            }
        }

        $scope.showSelect = function(income){


            if(income.source=='HUSBAND' && !$scope.showHusband()){
                return false;
            }

            return true;

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
                    })
                    refreshall('.incomedetails');
                },time);


        }

        $scope.change = function(income){
            console.log(income.detaildesc);
            income.detaildesc = income.detaildesc.value;
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

                })
                $scope.$apply();
            });

        }

        $scope.loadIncomes();

        $scope.checkFunds = function(fundObj){
            var cols = 0;
            var totalcols = 7;
            for(key in fundObj){
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
                        closeOnConfirm: true
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
                            closeOnConfirm: true
                        });
                        return false;
                    }
                    return true;
        }

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
        }

        /******************************************
        - House Income
        ******************************************/

        $scope.houseIncomes = [];
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
                if(parsefrom=="netrev") total += parseFloat(val['totalinmth'])*parseFloat(val['profpermth']);
                else total += parseFloat(val[parsefrom]);
                });
            return total;
        };

        function checkIncomes(incObj){
            var cols = 0;
            var totalcols = 8;
            for(key in incObj){
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
                            closeOnConfirm: true
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
                    closeOnConfirm: true
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
                for(i in $scope.choices) total += parseInt(i);
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






        /******************************************
        - Submit
        ******************************************/
        $scope.actionSubmit = function(groupname){

            //check applicant
			/*
            if(checkNull($scope.applicantdata.photo,"Please take a photo of client.")||
               checkNull($scope.applicantdata.fullname,"Please give full name of client.")||
               checkNull($scope.applicantdata.gender,"Please give gender of client.")||
               checkNull($scope.applicantdata.familycardno,"Please give family card number for client.")||
               checkNull($scope.applicantdata.ktpno,"Please give KTP number of client.")||
               checkNull($scope.applicantdata.dateofbirth,"Please give date of birth for client.")||
               checkNull($scope.applicantdata.age,"Please give client's age.")||
               checkRange(10,100,$scope.applicantdata.age,"Client's age must be 10 and above and 100 and below.")
			   */
			if(
                // checkNull($scope.applicantdata.photo,i18n.t("messages.EmptyPhoto"))||
                // checkNull($scope.applicantdata.fullname,i18n.t("messages.EmptyFullName"))||
                // checkNull($scope.applicantdata.gender,i18n.t("messages.EmptyGender"))||
                // checkNull($scope.applicantdata.familycardno,i18n.t("messages.EmptyFamilyCardNo"))||
                // checkNull($scope.applicantdata.ktpno,i18n.t("messages.EmptyKTPNo"))||
                // checkNull($scope.applicantdata.dateofbirth,i18n.t("messages.EmptyDOB"))||
                // checkNull($scope.applicantdata.age,i18n.t("messages.EmptyAge"))||
                // checkRange(10,100,$scope.applicantdata.age,i18n.t("messages.InvalidAge"))

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
                    closeOnConfirm: true
                },function(){
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

            if($scope.showHusband()&&($scope.husbandinfo.husbandname==null)){

                swal({
                    title: i18n.t("messages.Alert"),
                    text: i18n.t("messages.EmptyHusbandName"),
                    type: "error",
                    confirmButtonColor: "#80C6C7",
                    confirmButtonText: "Ok",
                    closeOnConfirm: true
                },function(){
                    $.mobile.changePage("#pageAppData2");
                });
                return false;
            }

            if($scope.showHusband()&&($scope.husbandinfo.husbandidno==null)){
               // alert("Please specify husband's ID number.");
			    //alert(i18n.t("messages.EmptyHusbandIDNo"));
                swal({
                    title: i18n.t("messages.Alert"),
                    text: i18n.t("messages.EmptyHusbandIDNo"),
                    type: "error",
                    confirmButtonColor: "#80C6C7",
                    confirmButtonText: "Ok",
                    closeOnConfirm: true
                },function(){
                    $.mobile.changePage("#pageAppData2");
                });

                return false;
            }

            //check household
            if(
				/*
                checkNull($scope.housemotherinfo.noofmembers,"Please specify number of members in the household.")||
                checkRange(0,99,$scope.housemotherinfo.noofmembers,"Number of members in household must be 0-99.")||
                checkNull($scope.housemotherinfo.noofchildren,"Please specify number of children in the household.")||
                checkRange(0,99,$scope.housemotherinfo.noofchildren,"Number of children in household must be 0-99.")||
                checkNull($scope.housemotherinfo.mothername,"Please specify mother's name.")||
                checkNull($scope.housemotherinfo.motherdob,"Please specify mother's date of birth.")||
                checkNull($scope.housemotherinfo.motherage,"Please specify mother's age.")||
                checkRange(10,120,$scope.housemotherinfo.motherage,"Mother's age should be 10-120.")
				*/

				// checkNull($scope.housemotherinfo.noofmembers,i18n.t("messages.EmptyMember"))||
    //             checkRange(0,99,$scope.housemotherinfo.noofmembers,i18n.t("messages.InvalidMember"))||
    //             checkNull($scope.housemotherinfo.noofchildren,i18n.t("messages.EmptyChildren"))||
    //             checkRange(0,99,$scope.housemotherinfo.noofchildren,i18n.t("messages.InvalidChildren"))||
    //             checkNull($scope.housemotherinfo.mothername,i18n.t("messages.EmptyMotherName"))||
    //             checkNull($scope.housemotherinfo.motherdob,i18n.t("messages.EmptyMotherDOB"))||
    //             checkNull($scope.housemotherinfo.motherage,i18n.t("messages.EmptyMotherAge"))||
    //             checkRange(10,120,$scope.housemotherinfo.motherage,i18n.t("messages.InvalidMotherAge"))

                sweetCheckNull($scope.housemotherinfo.noofmembers,i18n.t("messages.EmptyMember"),"pageAppData3")||
                sweetCheckRange(0,99,$scope.housemotherinfo.noofmembers,i18n.t("messages.InvalidMember"),"pageAppData3")||
                sweetCheckNull($scope.housemotherinfo.noofchildren,i18n.t("messages.EmptyChildren"),"pageAppData3")||
                sweetCheckNull($scope.housemotherinfo.parentsresidence,i18n.t("messages.EmptyParentsResidence"),"pageAppData3")||
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
				/*
                checkNull($scope.address.village,"Please specify village.")||
                checkNull($scope.address.subdistrict,"Please specify subdistrict.")||
                checkNull($scope.address.district,"Please specify district.")||
                checkNull($scope.address.province,"Please specify province.")
				*/

				// checkNull($scope.address.village,i18n.t("messages.EmptyVillage"))||
    //             checkNull($scope.address.subdistrict,i18n.t("messages.EmptySubDistrict"))||
    //             checkNull($scope.address.district,i18n.t("messages.EmptyDistrict"))||
    //             checkNull($scope.address.province,i18n.t("messages.EmptyProvince"))
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
                    closeOnConfirm: true
                },function(){
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
				/*
                checkNull($scope.workcap.app,"Please specify applicant's working capital.")||
                checkNull($scope.workcap.husband,"Please specify husband's working capital.")
				*/
				// checkNull($scope.workcap.app,i18n.t("messages.EmptyApplicantWorkCapital"))||
    //             checkNull($scope.workcap.husband,i18n.t("messages.EmptyHusbandWorkCapital"))
                sweetCheckNull($scope.workcap.app,i18n.t("messages.EmptyApplicantWorkCapital"),"pageWorkingCapital")||
                ($scope.husbandinfo.maritalstatus=='M'&&sweetCheckNull($scope.workcap.husband,i18n.t("messages.EmptyHusbandWorkCapital"),"pageWorkingCapital") )
            ){
                //$.mobile.changePage("#pageWorkingCapital");
                return false;
            }

            if(
                isNaN($scope.workcap.app)||
                ($scope.husbandinfo.maritalstatus!='S'&&isNaN($scope.workcap.husband) )
            ){
                //alert("Please specify client's and husband's working capital.");
				//alert(i18n.t("messages.EmptyClientHusbandWorkCapital"));
                swal({
                    title: i18n.t("messages.Alert"),
                    text: i18n.t("messages.EmptyClientHusbandWorkCapital"),
                    type: "error",
                    confirmButtonColor: "#80C6C7",
                    confirmButtonText: "Ok",
                    closeOnConfirm: true
                },function(){
                    $.mobile.changePage("#pageWorkingCapital");
                });

                return false;
            }

            if($scope.borrowedFunds.length>0){
                for(key in $scope.borrowedFunds){
                    if(!$scope.checkFunds($scope.borrowedFunds[key])){
                        $.mobile.changePage("#pageWorkingCapital");
                        return false;
                    }
                }
            }

            if($scope.applicantdata.homeless != 'YES'){
                if(
                    /*
                    checkNull($scope.houseinfo.housetype,"Please specify house type.")||
                    checkNull($scope.choices[0],"Please specify house size")||
                    checkNull($scope.choices[1],"Please specify house condition")||
                    checkNull($scope.choices[2],"Please specify roof type")||
                    checkNull($scope.choices[3],"Please specify wall type")||
                    checkNull($scope.choices[4],"Please specify floor type")||
                    checkNull($scope.choices[5],"Please specify electricity source")||
                    checkNull($scope.choices[6],"Please specify water source")
                    */
                    // checkNull($scope.houseinfo.housetype,i18n.t("messages.EmptyHouseType"))||
        //             checkNull($scope.choices[0],i18n.t("messages.EmptyHouseSize"))||
        //             checkNull($scope.choices[1],i18n.t("messages.EmptyHouseCondition"))||
        //             checkNull($scope.choices[2],i18n.t("messages.EmptyRoofType"))||
        //             checkNull($scope.choices[3],i18n.t("messages.EmptyWallType"))||
        //             checkNull($scope.choices[4],i18n.t("messages.EmptyFloorType"))||
        //             checkNull($scope.choices[5],i18n.t("messages.EmptyElectricitySource"))||
        //             checkNull($scope.choices[6],i18n.t("messages.EmptyWaterSource"))
                    // sweetCheckNull($scope.houseinfo.housetype,i18n.t("messages.EmptyHouseType"),"pageHousingIndex")||
                    sweetCheckZero($scope.choices[0],i18n.t("messages.EmptyHouseSize"),"pageHousingIndex")||
                    sweetCheckZero($scope.choices[1],i18n.t("messages.EmptyHouseCondition"),"pageHousingIndex")||
                    sweetCheckZero($scope.choices[2],i18n.t("messages.EmptyRoofType"),"pageHousingIndex")||
                    sweetCheckZero($scope.choices[3],i18n.t("messages.EmptyWallType"),"pageHousingIndex")||
                    sweetCheckZero($scope.choices[4],i18n.t("messages.EmptyFloorType"),"pageHousingIndex")
                    // sweetCheckNull($scope.choices[5],i18n.t("messages.EmptyElectricitySource"),"pageHousingIndex")||
                    // sweetCheckNull($scope.choices[6],i18n.t("messages.EmptyWaterSource"),"pageHousingIndex")
                )
                {
                    //$.mobile.changePage("#pageHousingIndex");
                    return false;
                }
            }


       //      if($scope.houseIncomes.length<1){
       //         // alert("Please give at least 1 income source.");
			    // //alert(i18n.t("messages.MinIncomeSource"));
       //          swal({
       //              title: i18n.t("messages.Alert"),
       //              text: i18n.t("messages.MinIncomeSource"),
       //              type: "error",
       //              confirmButtonColor: "#80C6C7",
       //              confirmButtonText: "Ok",
       //              closeOnConfirm: true
       //          },function(){
       //              $.mobile.changePage("#pageHouseIncomeEst");
       //          });

       //          return false;
       //      }

            // for(key in $scope.houseIncomes){
            //     if(!checkIncomes($scope.houseIncomes[key])){
            //         $.mobile.changePage("#pageHouseIncomeEst");
            //         return false;
            //     }
            // }

			//check product mapping
			for(key in $scope.products){
				if(($scope.products[key].isSelected == "YES") &&
					($scope.products[key].maturityOptions != null && $scope.products[key].maturityOptions.length > 0) &&
                    sweetCheckNull($scope.products[key].selectedMaturityOption.id,i18n.t("messages.EmptyMaturityOption"),"pageProductMapping")
				)
				{
                    swal({
                        title: i18n.t("messages.Alert"),
                        text: i18n.t("messages.EmptyMaturityOption"),
                        type: "warning",
                        closeOnConfirm: true
                    }, function(){
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
                    closeOnConfirm: true
                }, function(){
                    $.mobile.changePage("#pageProductMapping");
                });
            } else {
                for(key in $scope.selectedLoans){
                    // if($scope.selectedLoans[key].selecteddetais.)
                }
            }


            //if(!confirm("Submit new client information?")) return false;
			//if(!confirm(i18n.t("messages.SubmitNewClientInfo"))) return false;


            swal({
                title: i18n.t("messages.Alert"),
                text: i18n.t("messages.SubmitNewClientInfo"),
                type: "warning",
                showCancelButton: true,
                confirmButtonText: i18n.t("messages.Yes"),
                closeOnConfirm: false
            }, function(isConfirm){
                if(isConfirm)
                    $scope.actionSubmitSecond(groupname);
            });


        };

        $scope.getIncomeCapita = function(){

            var houseIncomes = $scope.houseIncomes;
            var housemotherinfo = $scope.housemotherinfo;

            var totalincome = 0;
            for(key in houseIncomes){
                totalincome = $scope.getTotalIncome();
            }

            var incomepercapita =  totalincome;
            if(housemotherinfo.noofmembers > 0) incomepercapita = parseFloat(totalincome / housemotherinfo.noofmembers);

            return incomepercapita.toFixed(0);
        }

        $scope.actionSubmitSecond = function(groupname){
            //check undefined for all listed fields and replace with ''
            var allscopes = [$scope.applicantdata,$scope.husbandinfo,$scope.housemotherinfo,$scope.husbandinfo,$scope.businessinfo,$scope.address,$scope.workcap,$scope.houseinfo,$scope.choices,$scope.borrowedFunds,$scope.houseIncomes, $scope.products];

            $.each(allscopes, function(id, scoper){
                $.each(scoper, function(id, field){
                    if(field==undefined) {
                        field=''
                    };
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

            workcap.husband = workcap.husband == null ? 0 : workcap.husband;

            var isHomeless = $scope.applicantdata.homeless != 'YES' ? 'N' : 'Y';

            var d = new Date(applicantdata.dateofbirth);
            var appAge = applicantdata.age+"";
            var appdateofbirth = d.getDate()+"/"+(d.getMonth()+1)+"/"+d.getFullYear();//+" 00:00:00";

            d = new Date(housemotherinfo.motherdob);
            var motherAge = housemotherinfo.motherage+"";
            var motherdob = d.getDate()+"/"+(d.getMonth()+1)+"/"+d.getFullYear();//+" 00:00:00";

            var stayinhouse = "N";
            if(husbandinfo.livesinhouse=='YES') stayinhouse="Y";

            myDB.execute(query, function(results){
                if(results.length<0) return false;

                var haveProducts = [];

                var CLT_PK = results[0].mclt_pk+1; //get max pks

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
								var havePastmembership = (sanitize(applicantdata.havePastmembership) == 'YES' ? 1 : 0);
                var havecooperate = 0;
                var haveotherbank = 0;
                var haveinstitutes = 0;

                for(key in borrowedFunds){
                    if(borrowedFunds[key].loanfrom == "I") haveinstitutes = 1;
                    if(borrowedFunds[key].loanfrom == "B") haveotherbank = 1;
                    if(borrowedFunds[key].loanfrom == "C") havecooperate = 1;
                }

                var totalincome = 0;
                for(key in houseIncomes){
                    totalincome = $scope.getTotalIncome();
                }

                var incomepercapita =  totalincome;
                if(parseInt(housemotherinfo.noofmembers) > 0) incomepercapita = parseFloat(totalincome / parseInt(housemotherinfo.noofmembers));

                //$scope.getMaxGrpId();

                var CLL_CRF_AMOUNT = CLL_ORIGINAL_LOAN * CLL_CRF_PERCENTAGE;
                var query1 = "INSERT INTO T_CLIENT VALUES(null,"+CLT_PK+",'"+BRC_PK+"','"+sanitize(applicantdata.fullname)+"','"+sanitize(applicantdata.nickname)+"','"+applicantdata.gender+"','"+sanitize(husbandinfo.husbandname)+"','"+husbandinfo.husbandidno+"','"+((husbandinfo.livesinhouse=="YES")?"Y":"N")+"','"+sanitize(applicantdata.familycardno.toString())+"','"+applicantdata.clientno+"','"+applicantdata.ktpno.toString()+"','"+appdateofbirth+"','"+appAge+"','"+applicantdata.highested+"','"+sanitize(applicantdata.highestedothers)+"','"+husbandinfo.maritalstatus+"','"+housemotherinfo.noofmembers+"','"+housemotherinfo.noofchildren+"','"+sanitize(husbandinfo.whereis)+"','"+husbandinfo.howoften+"','"+sanitize(housemotherinfo.mothername)+"','"+motherdob+"','"+motherAge+"','"+sanitize(businessinfo.typeofbusiness)+"','"+sanitize(businessinfo.busequipment)+"','"+sanitize(businessinfo.jointbusiness)+"','"+sanitize(businessinfo.jbequipment)+"','"+sanitize(businessinfo.husbandbusiness)+"','"+sanitize(businessinfo.hbequipment)+"','"+sanitize(address.rt)+"','"+sanitize(address.streetarea)+"','"+address.village.val+"','"+sanitize(address.subdistrict)+"','"+sanitize(address.district)+"','"+sanitize(address.province)+"','"+address.postcode+"','"+sanitize(address.landmark)+"','"+sanitize(address.mobile1)+"','"+sanitize($scope.address.mobile2)+"','"+sanitize(address.husbmobile)+"',null,null,null,null,null,null, "+
                            "'"+sanitize(applicantdata.placeofbirth)+"' , "+ //CLT_PLACE_OF_BIRTH
                            "'"+sanitize(housemotherinfo.parentsresidence)+"', " + //CLT_RESIDENCE_OF_PARENTS
                            "'"+USER_PK+"', "+
                            "'"+moment().format('DD/MM/YYYY HH:mm:ss')+"', "+
                            CLIENT_STATUS+", "+
                            // "null, "+ //CLT_TERMINATION_DATE
                            // incomepercapita+", "+ //CLT_INDEX_OF_INCOME VARCHAR(1000) NULL
                            // $scope.getTotalUnproVal()+", "+ //CLT_INDEX_OF_ASSET VARCHAR(1000) NULL
                            // tsunamiAffected+", "+
                            // quakeAffected+", "+
                            // havecooperate+", "+//CLT_LOAN_COOPERATE_EXISTS VARCHAR(1) NULL
                            // haveotherbank+", "+ //CLT_LOAN_BANK_EXISTS VARCHAR(1) NULL
                            // haveinstitutes+", "+ //CLT_FINANCE_INSTITUTE_ACCESS VARCHAR(1) NULL
                            // haveSavings+", "+ //CLT_SAVING_ACCOUNT_EXISTS VARCHAR(1) NULL
                            // haveInsurance+", "+ //CLT_INSURANCE_EXISTS VARCHAR(1) NULL
                            // havePastmembership+", "+ //CLT_PAST_MEMBERSHIP_EXISTS VARCHAR(1) NULL
                            $scope.address.centerid+", "+
                            "null, "+       //CLT_GROUP_ID
                            "null, "+       //CLT_IS_GROUP_LEADER
                            "'"+$scope.address.rw+"', "+ //CLT_RW
                            "'null', "+ //CLT_ATTENDANCE_PERCENTAGE
                            "'null', "+ //CLT_INSTALMENT_PERCENTAGE
                            "null, "+ //CLT_SIGNATURE
                            "1)";  // ISNEW
                // var query2 = "INSERT INTO T_CLIENT_LOAN VALUES(null,"+CLL_PK+","+BRC_PK+","+CLT_PK+","+USER_PK+",'"+welfareStatus+"',"+workcap.app+","+workcap.husband+","+houseinfo.housetype+","+choices['0']+","+choices['1']+","+choices['2']+","+choices['3']+","+choices['4']+","+choices['5']+","+choices['6']+","+housetotal+",null,"+CLL_ORIGINAL_LOAN+",null,"+CLL_LOAN_INTEREST+","+CLL_CRF_PERCENTAGE+","+CLL_CRF_AMOUNT+",null,null,null,null,null,null,null,"+((groupname==undefined)?"''":"'"+groupname+"'")+","+((groupname==null)?null:"'N'")+",null,null,null,null,"+USER_PK+",'"+moment().format('DD/MM/YYYY HH:mm:ss')+"',"+CLIENT_STATUS+",1);";
                //var query2 = "INSERT INTO T_CLIENT_LOAN VALUES(null,"+CLL_PK+","+BRC_PK+","+CLT_PK+","+USER_PK+",'"+welfareStatus+"',"+workcap.app+","+workcap.husband+","+houseinfo.housetype+","+choices['0']+","+choices['1']+","+choices['2']+","+choices['3']+","+choices['4']+","+choices['5']+","+choices['6']+","+housetotal+",null,"+CLL_ORIGINAL_LOAN+",null,"+CLL_LOAN_INTEREST+","+CLL_CRF_PERCENTAGE+","+CLL_CRF_AMOUNT+",null,null,null,null,null,null,null,"+((groupname==undefined)?"''":"'"+groupname+"'")+","+((groupname==null)?null:"'N'")+",null,null,null,null,"+USER_PK+",'"+moment().format('DD/MM/YYYY HH:mm:ss')+"',"+CLIENT_STATUS +",'"+ CLL_CENTER_ID +"',null,'"+applicantdata.loantype+"',null,1);";
                console.log(query1);
                var query6 = [];
                var query7 = [];
                var query8 = [];

                for(key in $scope.selectedLoans){
                    var CLL_PK = results[0].mcll_pk+1;
                    results[0].mcll_pk = CLL_PK;
                    console.log("loans");
                    console.log($scope.selectedLoans[key].selecteddetais);
                    //MISSING CLL_EXTRACTED_DATE TIMESTAMP NULL, CLL_GROUP_ID VARCHAR(50) NULL, CLL_IS_GROUP_LEADER VARCHAR(1) null
                    var crf_amt = parseFloat($scope.selectedLoans[key].selecteddetais.loanamt * ($scope.selectedLoans[key].LTY_DEFAULT_CRF_INTEREST / 100));

                    var graceperiod = null;

                    if($scope.selectedLoans[key].selecteddetais.hasOwnProperty("graceperiod")){
                        if($scope.selectedLoans[key].selecteddetais.graceperiod != undefined){
                                graceperiod = $scope.selectedLoans[key].selecteddetais.graceperiod.value;
                        }
                    }

                    query6.push("INSERT INTO T_CLIENT_LOAN VALUES( null, "+CLL_PK+", "+BRC_PK+", "+CLT_PK+", "+USER_PK+", '"+welfareStatus+"', "+workcap.app+", "+workcap.husband+", "+houseinfo.housetype+", "+choices['0']+","+choices['1']+","+choices['2']+","+choices['3']+","+choices['4']+","+choices['5']+","+choices['6']+", "+housetotal+", "+$scope.selectedLoans[key].selecteddetais.loanmaturity.value+",  "+$scope.selectedLoans[key].selecteddetais.loanamt+",  "+$scope.selectedLoans[key].selecteddetais.loanamt+", "+$scope.selectedLoans[key].LTY_DEFAULT_LOAN_INTEREST+", "+$scope.selectedLoans[key].LTY_DEFAULT_CRF_INTEREST+", "+crf_amt+", null, null, null, null, null, null, null, null, null, 'Y', null, "+$scope.selectedLoans[key].LTY_CREATED_BY+", '"+moment().format('DD/MM/YYYY HH:mm:ss')+"', 1, "+$scope.selectedLoans[key].LTY_PK+", null, "+
                        $scope.selectedLoans[key].selecteddetais.loanpurpose.value+", "+ //CLL_LPU_CODE
                        "null, "+ //CLL_TERMINATION_DATE
                        "null, "+ //CLL_FIRST_COLLECTION_DATE
                        "0, "+ //CLL_TOTAL_PRINCIPAL_PAID
                        "0, "+ //CLL_TOTAL_INTEREST_PAID
                        $scope.selectedLoans[key].selecteddetais.loanamt+", "+ //CLL_OUTSTANDING
                        "null, "+ //CLL_REPAY_PER_WEEK
                        "null, "+ //CLL_LOAN_NUMBER
                        incomepercapita+", "+ //CLL_INDEX_OF_INCOME VARCHAR(1000) NULL
                        $scope.getTotalUnproVal()+", "+ //CLL_INDEX_OF_ASSET VARCHAR(1000) NULL
                        tsunamiAffected+", "+
                        quakeAffected+", "+
                        havecooperate+", "+//CLL_LOAN_COOPERATE_EXISTS VARCHAR(1) NULL
                        haveotherbank+", "+ //CLL_LOAN_BANK_EXISTS VARCHAR(1) NULL
                        haveinstitutes+", "+ //CLL_FINANCE_INSTITUTE_ACCESS VARCHAR(1) NULL
                        haveSavings+", "+ //CLL_SAVING_ACCOUNT_EXISTS VARCHAR(1) NULL
                        haveInsurance+", "+ //CLL_INSURANCE_EXISTS VARCHAR(1) NULL
                        havePastmembership+", "+ //CLL_PAST_MEMBERSHIP_EXISTS VARCHAR(1) NULL
                        "null, "+ //CLL_IS_FORM_PRINTED VARCHAR(1) NULL, "+
                        "null, "+ //CLL_MANAGER_PK INT NULL, "+
                        "null, "+ //CLL_PDF_PATH VARCHAR(1000) NULL, "+
                        "null, "+ //CLL_WITNESS1_PK INT NULL, "+
                        "null, "+ //CLL_WITNESS2_PK INT NULL, "+
                        "null, "+ //CLL_WITNESS3_PK INT NULL, "+
                        "null, "+ //CLL_WITNESS4_PK INT NULL, "+
                        "null, "+ //CLL_TEST_RESULT_DATETIME TIMESTAMP NULL, "+
                        "null, "+ //CLL_TEST_PLACE VARCHAR(1000) NULL, "+
                        "null, "+ //CLL_TOTAL_INTEREST_AMT VARCHAR(1000) NULL, "+
                        "'"+isHomeless+"', "+ //CLL_HOMELESS VARCHAR(1) NULL
                        "0,"+ //CLL_LOAN_WEEKS
                        "0,"+ //CLL_ROUNDING_OF_REPAYMENT
                        graceperiod+","+ //CLL_GRACE_PERIOD_WEEKS
                        $scope.selectedLoans[key].LTY_DEFAULT_LOAN_INTEREST+","+ //CLL_GRACE_PERIOD_INTEREST
                        "1 )");

                    for(akey in $scope.unproassets){
                        console.log($scope.unproassets[akey]);
                        if($scope.unproassets[akey].asset != ""){
                            var CAL_PK = results[0].mcal_pk+1;
                            query8.push("INSERT INTO T_CLIENT_ASSET_LIST VALUES(null, "+CAL_PK+","+CLT_PK+","+CLL_PK+",'"+$scope.unproassets[akey].asset+"','"+$scope.unproassets[akey].value+"',1 )");
                        }
                    }
                    var CPM_PK = results[0].mcpm_pk+1;
                    for(pkey in $scope.selectedLoans[key].products){

                        console.log("Loan : "+$scope.selectedLoans[key].CLL_PK+" Prd : "+$scope.selectedLoans[key].products[pkey].PRM_PK+" ");
                        console.log(haveProducts);

                        var enddate = null;
                        var startdate = null;

                        if($scope.selectedLoans[key].products[pkey].isSelected == "YES" && !inArray($scope.selectedLoans[key].products[pkey].PRM_PK,haveProducts) ){
                            var prd_maturity = $scope.selectedLoans[key].selecteddetais.loanmaturity.value
                            if($scope.selectedLoans[key].products[pkey].selectedMaturityOption != null){
                                prd_maturity = $scope.selectedLoans[key].products[pkey].selectedMaturityOption;
                                if($scope.selectedLoans[key].products[pkey].PRM_CODE == '002.0004'){ //If Pension
                                    if(prd_maturity.indexOf("year") != -1){ //Check if maturity is in years

                                    }
                                }
                            }   else {
                                prd_maturity = $scope.selectedLoans[key].selecteddetais.loanmaturity.value + " Weeks";
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

                // console.log(query1);
                // console.log(query6);
                // console.log(query7);
                // console.log(query8);

                var query3 = [];
                var query4 = [];
                var query5 = [];

                for(key in borrowedFunds){
                    query3.push("INSERT INTO T_CLIENT_BORROWED_FUNDS VALUES(null,"+CEF_PK+","+CLT_PK+","+CLL_PK+",'"+borrowedFunds[key].loanfrom+"','"+sanitize(borrowedFunds[key].loanfromname)+"','"+borrowedFunds[key].applicant+"',"+borrowedFunds[key].originalamt+","+borrowedFunds[key].balance+","+borrowedFunds[key].repaymentperwk+","+borrowedFunds[key].repaymentpermth+",1)");
                }
                for(key in houseIncomes){

                    if(houseIncomes[key].detaildesc == null || houseIncomes[key].detaildesc == ""){
                        var incomedetails = 'null';
                    } else {

                        var det = 0;
                        if(houseIncomes[key].details != null && houseIncomes[key].details != ''&& !isNaN(houseIncomes[key].details) ) det = houseIncomes[key].details;

                        var incomedetails =  det+" "+houseIncomes[key].detaildesc;
                    }


                    query4.push( "INSERT INTO T_CLIENT_INCOME VALUES(null,"+CLI_PK+","+CLT_PK+","+CLL_PK+",'"+houseIncomes[key].source+"','"+incomedetails+"','"+houseIncomes[key].fixed+"','"+houseIncomes[key].variable+"',1)");
                }

                for(key in products){
                    if(products[key].isSelected == "YES"){
                        //query5.push("INSERT INTO T_CLIENT_PRODUCT_MAPPING VALUES(null," + CPM_PK + "," + CLT_PK + "," + CLL_PK + "," + products[key].PRM_PK + "," + ((products[key].selectedMaturityOption==null)? "''" :"'"+ products[key].selectedMaturityOption.id+"'") + ",0,null,'" + moment().format('DD/MM/YYYY HH:mm:ss') + "',null,56, 2" + ");");
                    }
                }

                //clean data
                query1 = query1.replace(/undefined/g, "");
                //query2 = query2.replace(/undefined/g, "");

                for(e in query3){query3[e] = query3[e].replace(/undefined/g, "");}
                for(e in query4){query4[e] = query4[e].replace(/undefined/g, "");}
                for(e in query5){query5[e] = query5[e].replace(/undefined/g, "");}
                for(e in query6){query6[e] = query6[e].replace(/undefined/g, "");}
                for(e in query7){query7[e] = query7[e].replace(/undefined/g, "");}
                for(e in query8){query8[e] = query8[e].replace(/undefined/g, "");}

                // console.log(query1);

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
                       // }, function(err){alert("Error saving data into database.");return true;}, function(suc){
                        }, function(err){
                            //alert(i18n.t("messages.AddClientError") + err);

                            swal({
                                title: i18n.t("messages.Alert"),
                                text: i18n.t("messages.AddClientError"),
                                type: "error",
                                confirmButtonColor: "#80C6C7",
                                confirmButtonText: "Ok",
                                closeOnConfirm: true
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
                            closeOnConfirm: true
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
               //     }, function(err){alert("Error saving into database.");return true;}, function(suc){
                    }, function(err){
                            //alert(i18n.t("messages.AddClientError") + err);
                            console.log(err);
                            swal({
                                title: i18n.t("messages.Alert"),
                                text: i18n.t("messages.AddClientError"),
                                type: "error",
                                confirmButtonColor: "#80C6C7",
                                confirmButtonText: "Ok",
                                closeOnConfirm: true
                            });
                            return true;
                        },
                        function(suc){
                            $scope.submitClient(eligibilityNotice);
                            return true;
                        });
                }
            });
        }

        $scope.submitClient = function(eligibilityNotice){

            var stitle = "";
            var stext = "";
            var stype = "";
            if(eligibilityNotice == ""){
                stitle =  i18n.t("messages.AlertSuccess");
                stext =  i18n.t("messages.AddClientSuccess");
                stype = "success";
            } else {
                stitle =  i18n.t("messages.Alert");
                stext =  eligibilityNotice
                stype = "error";
            }

            swal({
                title: stitle,
                text: stext,
                type: stype,
                confirmButtonColor: "#80C6C7",
                confirmButtonText: "Ok",
                closeOnConfirm: true
            },function(){
                //window.location.href = "client.html";
                $scope.loadGroups();

                setTimeout(function(){
                    $.mobile.changePage("#selectGroup");
                    $('.etask-container').fadeOut();
                },100);
            });
        }

        var t = this;
	    $scope.loans = [];
        $scope.selectedLoans = [];
		//load T_PRODUCT_MASTER
		myDB.execute("SELECT * FROM T_LOAN_TYPE order by LTY_CODE",function(results){
            //console.log(results);
            var loans = [];
            $.each(results,function(ind,rec){

                rec.products = [];
                rec.isSelected = false;
                rec.selecteddetais = {
                    loanamt: rec.LTY_MIN_LOAN_AMOUNT,
                    loanmaturity: null,
                    loanpurpose: null,
                    graceperiod: null
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
                if(rec.LTY_GRACE_PERIOD_WEEK != null && rec.LTY_GRACE_PERIOD_WEEK != ''){
                    if(rec.LTY_GRACE_PERIOD_WEEK.indexOf(",") != -1){
                        var grace = rec.LTY_GRACE_PERIOD_WEEK.split(",");
                        if(grace.length > 0){
                            $.each(grace,function(g,gracea){
                                var key = {
                                    value : gracea,
                                    name: gracea
                                }
                                gracearray.push(key);
                            })
                        }
                    } else {
                        var key = {
                            value : rec.LTY_GRACE_PERIOD_WEEK,
                            name: rec.LTY_GRACE_PERIOD_WEEK
                        }
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

        }

        $scope.loadproducts = function(){
            //console.log($scope.loans);
            $.each($scope.loans,function(ind,loan){
                myDB.execute("SELECT * FROM T_PRODUCT_MASTER LEFT JOIN T_LOAN_SAVING_PRD_MAPPING ON (LSM_PRM_PK = PRM_PK) WHERE LSM_PRM_PK != 79 AND LSM_LTY_PK ="+ loan.LTY_PK,function(results){
                    console.log("@@@@@@@@@@@@@@@");
                    console.log(results);
                    var products  = [];
                    $.each(results,function(index,rec){
                        rec.isSelected = "YES";
                        if(rec.LSM_PRM_IS_MANDATORY == 'Y'){
                            rec.isMandatory = 'Y';
                        } else {
                            rec.isMandatory = 'N';
                        }

                        rec.showMaturityOptions = false;
                        rec.selectedMaturityOption = null;
                        var mat_arr = new Array();
                        mat_arr = rec.PRM_LOAN_MATURITY_OPTIONS.split(',');
                        if(mat_arr.length > 1) {
                            rec.showMaturityOptions = true;
                            //rec.selectedMaturityOption = mat_arr[0];
                        }
                        rec.maturityOptions = mat_arr;
                        //console.log(rec);
                        rec.withdrawPolicy = $scope.getPolicyText(rec.PRM_LOAN_WITHDRAW_POLICY,"withdrawal");
                        rec.closingPolicy = $scope.getPolicyText(rec.PRM_LOAN_CLOSING_POLICY,"closing");

                        var depoamt = rec.LSM_PRM_OPEN_BAL;

                        if(depoamt != null && depoamt.indexOf("%") != -1){

                            depoamt = depoamt.replace("%","");
                            depoamt = parseFloat($scope.loans[ind].selecteddetais.loanamt) / parseFloat(depoamt);
                            depoamt = depoamt.toFixed(4);

                        }

                        rec.depositAmt = depoamt;


                        products.push(rec);
                        //console.log(products);
                    });

                    $scope.loans[ind].products = products;
                });
            });

        }

        $scope.productAvailable = function(product,newp){

            var isActive = false;
            console.log($scope.products);
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
            })
            console.log(isActive);
            if(isActive){
                return false;
            }
            return true;

        }



        $scope.loanSelected = function(loan,$event){
            $event.preventDefault();
            $event.stopPropagation();

            var proceed = true;

            $.each(loan.products,function(i,prd){

                var canAdd = $scope.productAvailable(prd,'check');

                if(canAdd){
                    if(prd.showMaturityOptions && prd.selectedMaturityOption == null && prd.isSelected == 'YES'){
                        swal({
                            title: i18n.t("messages.Alert"),
                            text:  i18n.t("messages.ProductMaturityEmpty"),
                            type:  "warning",
                            confirmButtonColor: "#80C6C7",
                            confirmButtonText: i18n.t("buttons.Ok"),
                            closeOnConfirm: true
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
                            closeOnConfirm: true
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
                                })
                            })
                            console.log($scope.loans);
                        }
                        if(prd.PRM_CODE == feastsavingcode && prd.isSelected == 'YES' && (prd.selectedSavingperWeek != "" || prd.selectedSavingperWeek != null) ){
                            $.each($scope.loans,function(l,sloan){
                                $.each(sloan.products,function(s,savings){
                                    savings.selectedSavingperWeek = prd.selectedSavingperWeek;
                                })
                            })
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

                //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

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
                    })

                    if(conflicting_loan){
                        swal({
                            title: i18n.t("messages.Alert"),
                            text: "General Loan "+i18n.t("messages.And")+" Microbisnis Loan "+i18n.t("messages.CannotbeTogether"),
                            type: "warning",
                            confirmButtonColor: "#80C6C7",
                            confirmButtonText: i18n.t("buttons.Ok"),
                            closeOnConfirm: true
                        });
                        return false;
                    }
                }


                if(loan.selecteddetais.loanamt < loan.LTY_MIN_LOAN_AMOUNT){

                    swal({
                        title: i18n.t("messages.Alert"),
                        text: i18n.t("messages.LoanAmtLesserThan") +loan.LTY_MIN_LOAN_AMOUNT,
                        type: "warning",
                        confirmButtonColor: "#80C6C7",
                        confirmButtonText: i18n.t("buttons.Ok"),
                        closeOnConfirm: true
                    });

                    return false;
                }

                loan.isSelected = true;
                //$('#activeloanMaturity').selectmenu("refresh", true);

                if(loan.LTY_PK == 99){
                    var key = {
                        name: '',
                        value: 999
                    }
                    loan.selecteddetais.loanamt = 0;
                    loan.selecteddetais.loanpurpose = key;
                }


                $scope.selectedLoans.push(loan);
            }
            console.log($scope.selectedLoans);
        }

        $scope.conflictingLoanValidation = function(loan){
            var hasLoan1 = false;
            var hasLoan2 = false;



            $.each($scope.selectedLoans,function(i,selloan){
                if(selloan.LTY_PK == 34){
                    hasLoan1 = true;
                }
                if(selloan.LTY_PK == 35){
                    hasLoan2 = true;
                }
            });

            if((hasLoan1 && loan.LTY_PK == 35 )||
                (hasLoan2 && loan.LTY_PK == 34)) {
                return false;
            }
            return true;

        }

        $scope.viewloanproducts = function(idx,$event){

            $('.loan-box').removeClass('selected');

            var tis = $event.currentTarget;

            $(tis).find('.loan-box').addClass('selected');

            $scope.activeloan = [];

            //console.log($scope.loans[idx]);
            var purpose = $filter('filter')($scope.loanpurpose, { loan: $scope.loans[idx].LTY_PK })[0];

            $scope.loans[idx].selecteddetais.loanamt = parseFloat($scope.loans[idx].LTY_MIN_LOAN_AMOUNT);
            $scope.loans[idx].selecteddetais.loanmaturity = $scope.loans[idx].maturityOptions[0];
            $scope.loans[idx].selecteddetais.graceperiod = $scope.loans[idx].graceOptions[0];
            $scope.loans[idx].selecteddetais.loanpurpose = purpose;

            $scope.activeloan = $scope.loans[idx];

            //$scope.loadLoanPurpose();

            setTimeout(function(){
                $scope.$apply();
                $.each($scope.activeloan.products,function(i,prd){
                    if(prd.showMaturityOptions){
                        //$('select#maturityOption'+prd.LSM_PRM_PK).selectmenu("refresh", true);
                    }
                })
                //refreshthis(".newprod");
                //$('#activeloanMaturity').selectmenu("refresh", true);
                //$('#activeloanPurpose'+$scope.activeloan.LTY_PK).selectmenu("refresh", true);
                resetthis('.newprod',"");
                resetthis('.newprodmat',"");
                setTimeout(function(){
                    $scope.$apply();
                    $('#activeloanMaturity').selectmenu("refresh", true);
                    $('#activeloanPurpose').selectmenu("refresh", true);
                    $('#activeloanGracePeriod').selectmenu("refresh",true);
                    //$('.newprod').prop('selectedIndex', 1);

                },1000);

                if($('#productmappingdetails').length > 0){
                    $('html, body').animate({
                        scrollTop: $("#productmappingdetails").offset().top - 90
                    }, 1000);
                }
            },0)




            console.log($scope.activeloan);
        }

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
                var mat_arr = new Array();
                mat_arr = rec.PRM_LOAN_MATURITY_OPTIONS.split(',');
                if(mat_arr.length > 1) {
                    rec.showMaturityOptions = true;
                    //rec.selectedMaturityOption = mat_arr[0];
                }

                rec.maturityOptions = mat_arr;
			    $scope.products.push(rec);
			});

            console.log($scope.products);
            //console.log($scope.products);
            // console.log($scope.products[1].isSelected);
            // console.log($scope.products[1].PRM_IS_MANDATORY);
            // console.log($scope.products[1].PRM_PK);
		    // console.log(JSON.stringify($scope.products.isSelected));

        });


        //Settign Loan Type Options
        $scope.LOAN_TYPE = [];
        var LT = JSON.parse(localStorage.getItem("loan_type"));
        //console.log(LT);
        LT.forEach(function(value,index){
            var keypair = {'value': value[0],'name': value[3]};
            $scope.LOAN_TYPE.push(keypair);
            //console.log($scope.LOAN_TYPE);
        });


        //load T_CODE values into a variable selectCodes
        $scope.selectCodes = {
            process : function(results){
                results.forEach(function(value,index){
                    $scope.selectCodes[value.CODE_TYPE_PK] || ($scope.selectCodes[value.CODE_TYPE_PK] = []); //init if null
                    var keypair = {'name': value.CODE_NAME,'value': value.CODE_VALUE}
                    $scope.selectCodes[value.CODE_TYPE_PK].push(keypair);
                });
            },
        };
        this.setCodes = function(results){
            $scope.$apply(function() {$scope.selectCodes.process(results);});
        };
        myDB.T_CODE.get("(CODE_TYPE_PK>=1 AND CODE_TYPE_PK<=3) OR CODE_TYPE_PK=6 OR (CODE_TYPE_PK>=9 AND CODE_TYPE_PK<=16)",function(results){
            console.log(results);
            t.setCodes(results);
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
            console.log(results);
            $.each(results,function(ind, val){
                $scope.selectCodes['CTR'] || ($scope.selectCodes['CTR'] = []); //init if null
                var keypair = {'name':val.CTR_CENTER_NAME , 'value':val.CTR_PK };
                $scope.selectCodes['CTR'].push(keypair);
            });
            console.log($scope.selectCodes['CTR']);
            $scope.$apply(function () {$scope.selectCodes['CTR'];});
        }

        $scope.updateAddress = function(){
            //console.log($scope.address.centerid);
            myDB.execute("SELECT * FROM T_VILLAGE_MASTER, T_DISTRICT_MASTER, T_SUB_DISTRICT_MASTER, T_CENTER_MASTER WHERE DSM_PK = SDSM_DSM_PK AND SDSM_PK = VLM_SDSM_PK AND VLM_PK = CTR_VLM_PK AND CTR_PK = "+$scope.address.centerid+"  ", function(results){
                console.log(results[0]);
                $scope.updateSecond(results);

            });
        }
        $scope.updateSecond = function(results){

            //console.log($scope.address);
            $scope.$apply(function(){
                $scope.address.village.val = results[0].VLM_PK;
                $scope.address.village.name = results[0].VLM_NAME;
                $scope.address.district = results[0].DSM_NAME;
                $scope.address.subdistrict = results[0].SDSM_NAME;
                $scope.address.province = results[0].DSM_PROVINCE_CODE;
            });
        }

        // myDB.T_VILLAGE_MASTER.get(null,function(results){
        //     t.setVillages(results);
        // });

        myDB.execute("SELECT * FROM T_CENTER_MASTER WHERE CTR_FO_PK = "+sessionStorage.getItem("USER_PK")+" ORDER BY CTR_CENTER_NAME",function(results){
            t.setCenters(results);
        })

/******************************************************************************
New Group functions here:
1) Grab unique group names and populate "Add to Group" field
******************************************************************************/
        $scope.existingGroups = null;
        $scope.selectedGroup = null;

        //get groups and distinct clients etc
        // myDB.execute("SELECT * FROM (SELECT count(distinct CLL_CLT_PK) as countClients, CLL_GROUP_ID FROM T_CLIENT_LOAN  WHERE CLL_STATUS not in (25,8,9) GROUP BY CLL_GROUP_ID) as TABLE1 JOIN (SELECT GROUP_CONCAT(CLL_STATUS) as CLL_STATUS, CLL_GROUP_ID, cl.CLT_VILLAGE FROM T_CLIENT_LOAN LEFT JOIN T_CLIENT as cl on CLT_PK = CLL_CLT_PK  WHERE CLL_IS_GROUP_LEADER='Y' GROUP BY CLL_GROUP_ID, cl.CLT_VILLAGE) as TABLE2 ON TABLE1.CLL_GROUP_ID = TABLE2.CLL_GROUP_ID", function(results){
        //     if(results.length<=0) return false;
        //     else{
        //         $scope.existingGroups = []; //init
        //         for(k in results) $scope.existingGroups.push(results[k]);
        //         $scope.$apply();
        //     }
        // });
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

        $scope.addToExistingGroup = function(){

            console.log($scope.address);
            console.log($scope.currGroup);
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
            console.log(selectedGrp);
            console.log($scope.address);
            if(selectedGrp.CLT_CENTER_ID != $scope.address.centerid){
                //alert(i18n.t("messages.LdrDiffVillage"));
                swal({
                    title: i18n.t("messages.Alert"),
                    text: i18n.t("messages.LdrDiffCenter"),
                    type: "warning",
                    confirmButtonColor: "#80C6C7",
                    confirmButtonText: i18n.t("buttons.Ok"),
                    closeOnConfirm: true
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
            console.log(e);
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
            // //find the right group to put into

            // console.log(grpid);
            // console.log(centerid);
            // console.log(centername);

            var grp = null;
            var found = false;
            //console.log($scope.savedGrps);
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
                //console.log(grp);
                return grp;
            }
        };

        /******************************************
        // Prepare data
        ******************************************/
        $scope.loadGroups = function(){

            var lg = "";
            lg += " SELECT CLT_MOB_NEW,CLT_FAMILY_CARD_NO,CLT_DOB,CLT_MOTHER_NM,CLT_MOTHER_DOB,CLT_STATUS, CLL_STATUS, CLT_PK, ";
            lg += " CLT_FULL_NAME, CLT_OTH_REG_NO, CLL_PK, CLL_CLT_PK, CLT_GROUP_ID, CLT_IS_GROUP_LEADER, CLL_MOB_NEW, CAST(CLT_CENTER_ID AS INTEGER) as CLT_CENTER_ID, CTR_CENTER_NAME, CLT_BRC_PK ";
            lg += "  FROM T_CLIENT_LOAN, T_CLIENT, T_CENTER_MASTER WHERE CLL_CLT_PK = CLT_PK AND CLT_CENTER_ID = CTR_PK AND CLL_STATUS!=8 GROUP BY CLL_CLT_PK";
            //console.log(lg);
            myDB.execute(lg,function(results){
                //console.log(results);
                $scope.available = [];
                var res = [];
                $.each(results, function(ind,val){
                    var obj = {};
                    for(k in val){ obj[k] = val[k]; }
                    res.push(obj);
                }); //does a copy of the results, for some reason using results directly won't work

                results = res;

                $.each(results,function(ind, val){
                    //console.log(val);
                    if(!val.CLT_GROUP_ID){ //if member is not in a group
                        $scope.available.push(val); //add to available
                    }else{
                        //add to existing groups
                        var grp = $scope.findGroup(val.CLT_GROUP_ID,val.CLT_CENTER_ID,val.CTR_CENTER_NAME);
                        grp.MEMBERS.push(val);
                        // var grp = {
                        //     GROUP_ID:val.CLT_GROUP_ID,
                        //     MEMBERS:[],
                        //     CENTER: {
                        //         value: val.CLT_CENTER_ID,
                        //         name: val.CTR_CENTER_NAME
                        //     }
                        // };
                        // grp.MEMBERS.push(val);
                    }
                });

                $.when($scope.$apply()).then(function(){
                    $scope.refreshUI();
                });


            }); // AND CLL_MOB_NEW=1
        };

        /******************************************
        // Make sure UI is showing the right values, an angular/jquery mobile fix
        ******************************************/
        $scope.isitDone = function() {

            var ttl = 0;
            for(key in $scope.available) ttl++;

            if(ttl > 0){
                $('.addclientdone').hide();
            } else {
                $('.addclientdone').fadeIn();
            }
        }
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
            //$scope.getMaxGrpId();

        }

        $scope.removeClient = function(ind,mem){
            var cmd = [];
            var group = $scope.savedGrps[ind]; //given ID, take the group object
            var remove = [];
            var groupid = mem.CLT_GROUP_ID;
            console.log(groupid);

            if(mem.CLT_IS_GROUP_LEADER=="Y"){
                $scope.removeGroup(ind);
                $scope.removeClientGroup(groupid);
            } else {

                var id = $.inArray(mem, group.MEMBERS);

                // var res = -1;
                // for(var i=0; i < group.MEMBERS.length; i++){
                //     if(group.MEMBERS[i].CLL_CLT_PK == mem.CLL_CLT_PK){
                //         res = i;
                //         break;
                //     }
                // }

                // console.log(ind);
                // console.log(mem);
                // console.log(group.MEMBERS);
                // console.log(id);
                // return false;
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
                    console.log(err.message);
                   // alert("Error encountered saving into database.");
                    //swal(i18n.t("messages.SaveClientError"));
                    //window.location.href = "groupclients.html";
                    return true;
                }, function(suc){});

                $scope.refreshUI();

            }

        };

        /******************************************
        Create a new group
        ******************************************/
        $scope.createNewGroup = function(){
            console.log("createNewGroup");
            console.log($scope.available);
            console.log($scope.createGroup);
            if($scope.createGroup=="undefined"||$scope.createGroup==undefined){ //!Note: createGroup holds the client's index we will be using
                //sorry for the bad naming convention
                //alert("No client selected.");
                alert(i18n.t("messages.NoClientSelect"));
                return false;
            }
            $scope.getMaxGrpId();
            // //prepare group id
            // // var newID = new Date();
            // // newID = sessionStorage.getItem("USER_PK")+("0"+newID.getDate()).slice(-2)+""+("0"+(newID.getMonth()+1)).slice(-2)+""+(newID.getFullYear()+"").slice(-2)+"-"+("0"+newID.getHours()).slice(-2)+""+("0"+newID.getMinutes()).slice(-2)+""+("0"+newID.getSeconds()).slice(-2)+"";//+("000"+newID.getMilliseconds()).slice(-4)
            // var BRC_PK = parseInt(sessionStorage.getItem("BRC_PK"));
            // var newName = "GROUP "+$scope.maxgroupid;
            // var newID = $scope.maxgroupid;

            // var client = $scope.available[$scope.createGroup]; //access the list of available clients with the client's index (client's index=createGroup)
            // //console.log(client);
            // client.CLT_IS_GROUP_LEADER = 'Y'; //make group leader

            // var cmd  = "INSERT INTO T_CLIENT_GROUP VALUES (null, "+parseInt($scope.maxgroupid)+", "+BRC_PK+", "+$scope.address.centerid+", '"+newID+"', '"+newName+"', 1 )";
            // var cltcmd = "UPDATE T_CLIENT SET CLT_GROUP_ID ='"+newName+"' WHERE CLT_PK="+client.CLT_PK;
            // myDB.execute(cmd,function(results){
            //     $scope.getMaxGrpId();
            // });
            // myDB.execute(cltcmd,function(results){
            // });

            // $scope.addClientToGroup($scope.createGroup,newID,client.CTR_CENTER_NAME);

        };

        $scope.getMaxGrpId = function(){
            console.log("getMaxGrpId");
            var client = $scope.available[$scope.createGroup];
            if(client == null) return false;
            var centerid = client.CLT_CENTER_ID;

            //console.log("SELECT CLG_CTR_PK, CLG_ID FROM T_CLIENT_GROUP WHERE CLG_CTR_PK='"+ centerid +"'  ORDER BY CLG_ID DESC LIMIT 1");

            myDB.execute("SELECT CLG_CTR_PK, CLG_ID  FROM T_CLIENT_GROUP LEFT JOIN T_CENTER_MASTER ON (CTR_PK = CLG_CTR_PK) WHERE CTR_PK="+ centerid +"  ORDER BY CAST(CLG_ID AS INTEGER) DESC LIMIT 1",function(results){

                //console.log(results.length);
                var groupid = "001";
                console.log(results);
                if(results.length > 0){
                    console.log(results[0].CLG_ID);

                    groupid = parseInt(results[0].CLG_ID) + 1;
                    console.log(groupid);
                    console.log(groupid.toString().length);
                    var zcnt = "";
                    for(var i=0; i < parseInt(3-groupid.toString().length); i++){
                        zcnt = zcnt.concat("0");
                    }
                    console.log(zcnt);
                    groupid = zcnt.concat(groupid);
                    console.log(groupid);
                }

                $scope.maxgroupid = groupid;
                $scope.createNewGroupSecond();
            });
        }

        $scope.createNewGroupSecond = function(){
            console.log("createNewGroupSecond");
            var client = $scope.available[$scope.createGroup]; //access the list of available clients with the client's index (client's index=createGroup)
            client.CLT_IS_GROUP_LEADER = 'Y'; //make group leader

            var BRC_PK = parseInt(sessionStorage.getItem("BRC_PK"));
            console.log(client);

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
        }

        $scope.addGroupCount = function(){
            var grpcnt = $scope.maxgroupid;
            console.log(grpcnt);
            grpcnt = parseInt(grpcnt + 1);
            console.log(grpcnt);
            var groupid = grpcnt;
            var zcnt = "";
            for(var i=0; i < parseInt(3-groupid.toString().length); i++){
                zcnt = zcnt.concat("0");
            }
            groupid = zcnt.concat(groupid);
            console.log(groupid);

            //$scope.getMaxGrpId();
        }

        /******************************************
        Add member to existing group
        ******************************************/
        $scope.addToExistingGroup = function(client){


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

            // console.log($scope.currGroup);
            // console.log($scope.createGroup);
            // console.log($scope.getLeaderOf($scope.findGroup($scope.currGroup)).CLT_VILLAGE);

           console.log(client);
           console.log($scope.getLeaderOf($scope.currGroup, client.CLT_CENTER_ID))

            if(parseInt(client.CLT_CENTER_ID) != parseInt($scope.getLeaderOf($scope.currGroup, client.CLT_CENTER_ID).CLT_CENTER_ID )) {
                swal({
                    title: i18n.t("messages.LdrDiffCenter")  ,
                    type: "warning",
                    confirmButtonColor: "#80C6C7",
                    confirmButtonText: i18n.t("buttons.Ok"),
                    closeOnConfirm: true
                });
            } else {
                $scope.findGroup($scope.currGroup,client.CLT_CENTER_ID,client.CTR_CENTER_NAME);
                $scope.addClientToGroup($scope.createGroup,$scope.currGroup,client.CTR_CENTER_NAME);
            }
            return false;

        }

        /******************************************
        Count number of members in the group
        ******************************************/
        $scope.countMembers = function(group){
            var pk = [];
            var client;
            for(key in group.MEMBERS){
                client = group.MEMBERS[key];
                if(pk.indexOf(client.CLT_PK)==-1){
                    pk.push(client.CLT_PK); //client PK does not exist in our list yet
                }
            }
            return pk.length;
        }

        $scope.addClientToGroup = function(clientid,grpid,centername){
            //perform check here

            var client = $scope.available[clientid];
            console.log(client);
            var grp = $scope.findGroup(grpid,client.CLT_CENTER_ID,centername);

            console.log(grp);

            if($scope.createGroup=="undefined"||$scope.createGroup==undefined){
                //   alert("No client selected.");
                //swal(i18n.t("messages.NoClientSelect"));
                swal({
                    title: i18n.t("messages.NoClientSelect"),
                    type: "warning",
                    confirmButtonColor: "#80C6C7",
                    confirmButtonText: i18n.t("buttons.Ok"),
                    closeOnConfirm: true
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
                    closeOnConfirm: true
                });
                return false;
            } else {
                var leader = $scope.getLeaderOf(grpid,client.CLT_CENTER_ID);

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
        /******************************************
        //count number of clients in available list
        ******************************************/
        $scope.countAvailable = function(){
            var ttl = 0;
            for(key in $scope.available) ttl++;
            return ttl;
        };


        /******************************************
        //Get leader of Group
        ******************************************/
        $scope.getLeaderOf = function(group,centerid){

            if(group == undefined || group == '' || group == null) return false;

            var leader = null;

            $.each($scope.savedGrps,function(i,grp){
                //console.log(grp.GROUP_ID+" "+group);
                if(grp.GROUP_ID == group && parseInt(grp.CENTER.value) == centerid){
                    var members = grp.MEMBERS;
                    for(memid in members){
                        //console.log(members[memid].CLT_IS_GROUP_LEADER);
                        if(members[memid].CLT_IS_GROUP_LEADER=='Y') {
                            // return members[memid];//.CLT_FULL_NAME
                            leader = members[memid];
                            return true;
                        }
                    }
                }
            });

            return leader;
        }

        $scope.refresh = function(model){
            console.log(model);
            console.log($scope.currGroup);
            $timeout(function(){
                $scope.currGroup = model;
                //$('#addToGroup').selectmenu('refresh',true);
            },500);
        }
        $scope.loadGroups();

        $scope.refreshInc = function(income,id){

            var thisv = $('#incsel'+id);
            var selected = $(thisv).find('option:selected').text();
            // if($(thisv).val() == 0){
            //     income.details = "-";
            //     $('#incdet'+id).hide();
            // } else {
            //     $('#incdet'+id).show();
            // }

            if(selected != null && selected != ''){
                $(thisv).parent().find('span').html(selected);
            }
        }

        $scope.refreshSelect = function(idf){

            $(idf).each(function(i, element) {
                var selected = $(this).find('option:selected').text();
                if(selected != null && selected != ''){
                    $(this).parent().find('span').html(selected);
                }

            });
        }

        $scope.refreshSelSav = function(cllpk,product){
            console.log(product);
            setTimeout(function(){
                $scope.$apply();
                $('#newprod'+cllpk).selectmenu("refresh");
            },100);

            //Check Prodct Type
            var prm_code = $('#newprod'+cllpk).val();
            if(prm_code != ""){
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

            // $('.newprod').each(function(i, element) {
            //     var selected = $(this).find('option:selected').text();
            //     if(selected != null && selected != ''){
            //         $(this).parent().find('span').html(selected);
            //     }

            // });
        }

        /******************************************
        //Count number of new members in current group
        ******************************************/
        $scope.newInGrp = function(group){
            var count = 0;
            for(memid in group.MEMBERS){
                //if(group.MEMBERS[memid].CLL_MOB_NEW==1&&group.MEMBERS[memid].CLL_IS_GROUP_LEADER!="Y") count++;//.CLT_FULL_NAME
                if(group.MEMBERS[memid].CLL_MOB_NEW==1) count++;
            }
            return count;
        }

        /******************************************
        //Return only a list of unique clients in the group (so that multiple loans won't stack in the list)
        ******************************************/
        $scope.filterGroupNames = function(members){
            var filter = {};

            if(members.length > 0){

                $.each(members, function(id,member){
                    if(filter[member.CLT_PK]==null||member.CLL_MOB_NEW=="1"){
                        if(member.CLT_IS_GROUP_LEADER != "Y"){
                            filter[member.CLT_PK] = member;
                        }
                    }
                });

            }

            return filter;
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
                            '<div data-role="controlgroup" data-type"horizontal" class="etask-progress top" style="text-align:left;" >'+
                                '<div class="etask"><div class="etask-icon">1<i class="fa fa-check hidden"></i></div><a href="#pageAppData" data-ajax="false" class="etask-name active" data-i18n="buttons.Applicant">Applicant</a></div>'+
                                '<div class="etask"><div class="etask-icon">2<i class="fa fa-check hidden"></i></div><a href="#pageAppData2" data-ajax="false" class="etask-name" data-i18n="buttons.Husband">Husband</div></a>'+
                                '<div class="etask"><div class="etask-icon">3<i class="fa fa-check hidden"></i></div><a href="#pageAppData3" data-ajax="false" class="etask-name" data-i18n="buttons.HouseholdMother">HouseholdMother</a></div>'+
                                '<div class="etask"><div class="etask-icon">4<i class="fa fa-check hidden"></i></div><a href="#pageAppData4" data-ajax="false" class="etask-name" data-i18n="buttons.Business">Business</a></div>'+
                                '<div class="etask"><div class="etask-icon">5<i class="fa fa-check hidden"></i></div><a href="#pageAddress" data-ajax="false" class="etask-name"  data-i18n="buttons.Address">Address</a></div>'+
                                '<div class="etask-progress-bar"></div>'+
                            '</div>'+
                            '<div data-role="controlgroup" class="etask-progress-vert" >'+
                                '<div class="etask-progress-bar-vert right"></div>'+
                            '</div>'+
                            '<div data-role="controlgroup" class="etask-progress-reverse">'+
                                '<div class="etask"><div class="etask-icon">10<i class="fa fa-check hidden"></i></div><a href="#pageProductMapping" data-ajax="false" class="etask-name" data-i18n="buttons.ProductMapping">Product Mapping</a></div>'+
                                '<div class="etask"><div class="etask-icon">9<i class="fa fa-check hidden"></i></div><a href="#pageHouseIncomeEst" ng-click="rerender(300)" data-ajax="false" class="etask-name" data-i18n="buttons.Income">Income</a></div>'+
                                '<div class="etask"><div class="etask-icon">8<i class="fa fa-check hidden"></i></div><a href="#pageHousingIndex" data-ajax="false" class="etask-name"  data-i18n="buttons.HousingIndex">Housing Index</a></div>'+
                                '<div class="etask"><div class="etask-icon">7<i class="fa fa-check hidden"></i></div><a href="#pageWorkingCapital" data-ajax="false" class="etask-name"  data-i18n="buttons.WorkingCapital">Working Capital</a></div> '+
                                '<div class="etask"><div class="etask-icon">6<i class="fa fa-check hidden"></i></div><a href="#pageWelfareStatus" data-ajax="false" class="etask-name" data-i18n="buttons.FamilyWelfare">Family Welfare</a></div>'+
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
    if(myString != ""){
        $('.etask a[href$="'+myString+'"]').addClass('active');
    } else {
        $('.etask a[href$="#pageAppData"]').addClass('active');
    }

})
$("#newClientForm").enterAsTab({ 'allowSubmit': true});

function inArray(obj,array){
    if(jQuery.inArray(obj, array) !== -1){
        return true;
    } else {
        return false;
    }
}

myApp.directive('dropVill',function($compile){
    return {
        restrict: 'A',
        link: function(scope,elm,attrs){

            scope.output = '';
            //Get All Villages
            var cmd = "select vlm_name, vlm_pk from T_VILLAGE_MASTER ORDER BY vlm_name ASC";
            myDB.execute(cmd, function(results){

                var vlm_pk = "";
                if(localStorage.getItem('currentVillage') && (localStorage.getItem('currentVillage') != undefined || localStorage.getItem('currentVillage') != ""))
                    vlm_pk = localStorage.getItem('currentVillage');

                scope.output = '<div><h1>Select Current Village</h1><ul select-vill class="menu-sel-vil">';

                if(results.length>0){

                    var isSelected = '';
                    for(r in results){
                        isSelected='';
                        if(vlm_pk == results[r].VLM_PK ) { // Highlight Current Village
                            isSelected='selected';
                            $('.cur_vi').html(results[r].VLM_NAME);
                        } //set seletected class
                        scope.output += '<li class="currentvi'+results[r].VLM_PK+' '+isSelected+'"><i class="fa fa-map-marker"></i><div class="viname">'+results[r].VLM_NAME+'</div></li>';

                    }
                }

                scope.output += '</ul></div>';


                var e = angular.element(scope.output);
                $compile(e.contents())(scope); //Update in View for other jquery funcs to take effect

                $('.menu-pop').html(e);

            });

            elm.bind('click', function(e){

                e.stopPropagation();
                e.preventDefault();

                $( "#mypanel" ).panel( "option", "dismissible", true );
                    $( "#mypanel" ).panel({
                      beforeclose: function( event, ui ) {
                        if($('.menupop-wrapper').is(':visible')){
                            $( "#mypanel" ).panel( "option", "dismissible", true );
                            event.preventDefault();
                            event.stopPropagation();
                            return false;
                        }
                    }
                });

                var panelright = $('#mypanel').width();
                $('.menupop-wrapper').css('left', panelright+'px');
                $('.menu-pop').css('margin-right','0px');
                if($('.menupop-wrapper').is(':visible')){
                    $('.menupop-wrapper').fadeOut();
                } else {

                    $('.menupop-wrapper').fadeIn();
                }
            });
        }
    }
});
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
myApp.directive('centerleader', function(){
    return {
        restrict: 'A',
        scope: {
            control : "="
        },
        replace: true,
        templateUrl: 'widget_centerleader_sign.html?V=1.1.1',
        link: function(scope, element, attrs){
            scope.ctr_lead = scope.control || {}; 
            scope.$watchCollection('control.ctr_leaders',function(value){
            	if (true) {
	            	printLog("new leaders"); 
	            	printLog(value); 
	            	scope.ctr_lead.ctr_leaders = value;
	            } 
            },true);

            scope.selectedCtrLeader = null;
            scope.showSignscreen = scope.$parent.showSignscreen;
            scope.updateCtrLeader = function(){
            	printLog("updateCtrLeader");
                scope.ctr_lead.ctr_lead_pk = scope.selectedCtrLeader.CLT_PK;
                scope.ctr_lead.ctr_lead_name = scope.selectedCtrLeader.CLT_FULL_NAME;

                scope.$parent.ctr_lead = scope.ctr_lead;

            }; 
        }
    }
});
myApp.directive('centerlist', function(){
    return {
        restrict: 'E',
        scope: {
            control: '=',
            updateC: '&',
            eventHandler: '&ngClick'
        },
        templateUrl: 'widget_centerlist.html?v=2',  
        link: function(scope, element, attrs){
            scope.centers = scope.control || {};
            printLog("centerlist");
            printLog(scope.centers);
            scope.$watch('control', function(value) {
                printLog("center updated");
                printLog(value);
                scope.centers = value;
            });
            scope.changeCenter = function(center,$event) {
               
                var btn = $event.currentTarget;
                $(btn).animateCss('pulse');
                $.each(scope.centers,function(c,cc){
                   if(center.CTR_CENTER_NAME == cc.CTR_CENTER_NAME){ 
                      center.SELECTED = true;
                      scope.$parent.selectedCenter = center; 
                      scope.$parent.updateCenter();
                   } else {
                      cc.SELECTED = false;
                   }
                }); 
            }
        }
    } 
});

myApp.directive('date',function(){
    return {
        require:'ngModel',
        link: function (scope,elm,attrs,ctrl) {
            var dateFormat = attrs['date'] || 'yyyy-MM-dd';
            ctrl.$formatters.unshift(function(modelValue) {
                return dateFilter(modelValue,dateFormat);
            });
        }
    }
});

myApp.directive('myChange', function() {
      return function(scope, element) {
        element.bind('change', function() {
            var selected = element.find('option:selected').text();
            element.parent().find('span').html(selected);
        });
      };
    });
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
myApp.directive('selectVill',function($window){
    return {
        restrict: 'A',
        scope: false,
        link: function(scope,elm,attrs){

            elm.find('li').each(function(){
                $(this).bind('click', function(){ // Clicking to change Village
                    var li = $(this);
                    if(li.hasClass('selected')){
                        //Nothing happens if current Village is selected
                    } else {
                        var pk = li.attr('class');
                        pk = pk.replace('currentvi','').trim();
                        var pname =li.find('.viname').html().trim();
                        localStorage.setItem('currentVillage',pk);
                        localStorage.setItem('curr_village',pk);
                        localStorage.setItem('statType',pk);
                        localStorage.setItem('currentVillage_name',pname);
                        var keypair = { 'name': pname, 'value': parseInt(pk)};
                        scope.updateVillage(keypair);

                        elm.find('li').removeClass('selected');
                        li.addClass('selected');
                        $('.cur_vi').html(pname); //Update Name in Left Menu
                        $('.menupop-wrapper').fadeOut().delay(300);
                        $("#mypanel").panel( "close" ).delay(300);
                        //Close Panel after a 0.3s Delay
                    }

                });
            });
        }
    }
});
myApp.directive('myTasks', function(){
    return {
        restrict: 'A',
        link: function(scope,elm,attrs){
            // elm.hide();
            // return false;
            scope.taskC = 0;
            scope.taskD = 0;
            scope.taskWith = 0;
            scope.taskEval = 0;
            scope.taskTrain = 0;
            scope.taskConfm = 0;
            scope.taskTest = 0;
            scope.tastSign = 0;
            scope.taskTotal = 0;
            scope.tastUpd = 0;
            scope.taskQdone = 0;
            scope.isHeadLoaded = false;

            scope.fo = {
                currentVillageClients: ''
            };

            if(typeof scope.currentVillage  !== 'undefined'){
                var listener = scope.$watch('currentVillage', function (newValue, oldValue,scope) {
                    // //printLog(oldValue);
                  //    //printLog(newValue);
                    if(newValue != null && oldValue != null && newValue != oldValue){
                        ////printLog("new value");
                        checkAll();
                    }
                });
            }

            if(scope.isHeadLoaded == false){
                //printLog("orig checkall");
                scope.isHeadLoaded = true;
                checkAll();
            }

            var date = new Date();
            date = ("0"+date.getDate()).slice(-2)+"/"+("0"+(date.getMonth()+1)).slice(-2)+"/"+date.getFullYear();
            var anotherdate = new Date();
            anotherdate = anotherdate.getFullYear()+"-"+("0"+(anotherdate.getMonth()+1)).slice(-2)+"-"+("0"+anotherdate.getDate()).slice(-2);
            //elm.find('div').html(scope.taskTotal);
            scope.$watchGroup(['taskTotal','taskUpd','taskQdone'], function(newValue, oldValue,scope) {

                if(newValue[2] == 1){
                    scope.taskTotal = parseInt(scope.taskC + scope.taskD + scope.taskWith + scope.taskEval + scope.taskTrain + scope.taskConfm);
                    scope.taskQdone = 0;
                }
                if(newValue[1] == 1){

                    checkAll();
                    scope.taskUpd = 0;
                }

                if(scope.taskTotal == 0){
                    elm.find("div").html(scope.taskTotal);
                } else {
                    elm.show();
                    //elm.html("<span>"+scope.taskTotal+"</span> "+i18n.t("messages.Tasks"));
                    elm.find("div").html(scope.taskTotal);

                    if(scope.taskC>0){
                        attrs.$set('href','transactions.html');
                    } else if(scope.taskD>0){
                        attrs.$set('href','disbursements.html');
                    } else if(scope.taskWith>0){
                        attrs.$set('href','withdrawals.html');
                    } else if(scope.taskEval>0){
                        attrs.$set('href','client.html');
                    } else if(scope.taskTrain>0){
                        localStorage.setItem('statType',"CommonStatus.Status_5");
                        attrs.$set('href','training.html');
                    } else if(scope.taskConfm > 0){
                        localStorage.setItem('statType',"CommonStatus.Status_11");
                        attrs.$set('href','downpayment.html');
                    }
                }



             });

            function checkAll(){

                //printLog("loading..");

                var date = new Date();
                date = ("0"+date.getDate()).slice(-2)+"/"+("0"+(date.getMonth()+1)).slice(-2)+"/"+date.getFullYear();

                var clientlist = "";

                if(localStorage.getItem('currentVillage') !== null && localStorage.getItem('currentVillage') !== 'null'){

                    var cmd = "select distinct clt_pk from t_client WHERE clt_village="+localStorage.getItem('currentVillage');

                    myDB.execute(cmd, function(results){
                        //printLog(results);
                        if(results.length > 0){
                            for(r in results){
                                if(clientlist != "") clientlist += ",";
                                clientlist += results[r].CLT_PK;
                            }
                            scope.$apply(function(){
                                scope.fo.currentVillageClients = clientlist;
                            });

                            getC(date);
                            getD(date);
                            getW(date);
                            getEvaluation();
                            getTraining();
                            getConfirmation(date);
                        } else {
                            scope.$apply(function(){
                                scope.taskC = 0;
                                scope.taskD = 0;
                                scope.taskWith = 0;
                                scope.taskEval = 0;
                                scope.taskTrain = 0;
                                scope.taskConfm = 0;
                                scope.taskQdone = 1;
                            });
                        }
                    });
                } else {
                    scope.fo.currentVillageClients = '';
                    getC(date);
                    getD(date);
                    getW(date);
                    getEvaluation();
                    getTraining();
                    getConfirmation(date);
                }


            }

            function getC(date){

                var clientFilter = "";
                if(scope.fo.currentVillageClients != ""){
                    clientFilter = " AND CRS_CLT_PK IN ("+scope.fo.currentVillageClients+") ";
                }

                var cmd = "SELECT COUNT(DISTINCT CRS_CLT_PK) as FLAGS FROM T_CLIENT_REPAY_SCHEDULE WHERE CRS_FLAG = 'C'"+
                        clientFilter +
                        " AND CRS_DATE='"+date+"' AND (CRS_ATTENDED in ('null','') OR CRS_ATTENDED IS NULL)  ";
                myDB.execute(cmd, function(results){
                    scope.$apply(function(){
                        if(results.length > 0){
                            scope.taskC = results[0].FLAGS;
                        } else {
                            scope.taskC = 0;
                        }
                        scope.taskQdone = 1;
                    });


                }); //process the results for display
            }
            function getD(date){

                var clientFilter = "";
                if(scope.fo.currentVillageClients != ""){
                    clientFilter = " AND CLT_PK IN ("+scope.fo.currentVillageClients+") ";
                }

                var cmd = "SELECT COUNT(CRS_FLAG) as FLAGS FROM T_CLIENT, T_CLIENT_LOAN, T_CLIENT_REPAY_SCHEDULE WHERE CLL_STATUS!=8 AND CRS_FLAG in ('R','D') AND CLL_STATUS=12 AND CRS_DATE='"+date+"' AND (CRS_ATTENDED in ('null','') OR CRS_ATTENDED IS NULL) AND CLT_PK=CRS_CLT_PK AND CLL_CLT_PK=CLT_PK AND CRS_CLL_PK=CLL_PK AND CRS_CLT_PK=CLT_PK ";
                cmd += clientFilter;
                cmd += " GROUP BY CRS_FLAG";
                myDB.execute(cmd, function(results){
                    scope.$apply(function(){
                        if(results.length > 0){
                            scope.taskD = results[0].FLAGS;
                        } else {
                            scope.taskD = 0;
                        }
                        scope.taskQdone = 1;
                    });
                }); //process the results for display
            }
            function getW(date){

                var clientFilter = "";
                if(scope.fo.currentVillageClients != ""){
                    clientFilter = " AND CLT_PK IN ("+scope.fo.currentVillageClients+") ";
                }

                var cmd = "SELECT COUNT(DISTINCT CPT_CLT_PK) as FLAGS FROM T_CLIENT,T_CLIENT_PRD_TXN WHERE CPT_STATUS = 47 AND CPT_CLT_PK=CLT_PK AND DATE(CPT_DATETIME)='"+anotherdate+"'";
                myDB.execute(cmd,function(results){
                    //printLog(results);
                    scope.$apply(function(){
                        if(results.length > 0){
                            scope.taskWith = results[0].FLAGS;
                        } else {
                            scope.taskWith = 0;
                        }
                        scope.taskQdone = 1;
                    })
                })

            }
            //show correct labels
            function getFlag(flag){
                switch(flag){
                    case 'C': return 'Collection(s)';
                    case 'D': return 'Disbursement(s)';
                    case 'R': return 'CRF Disbursement(s)';
                }
            }
            function getEvaluation(){

                var clientFilter = "";
                if(scope.fo.currentVillageClients != ""){
                    clientFilter = " AND CLT_PK IN ("+scope.fo.currentVillageClients+") ";
                }


                //Retrieve pending evaluations for today
                //var newcmd = "SELECT COUNT(DISTINCT CLT_PK) as EVALCOUNT FROM T_CLIENT, T_CLIENT_LOAN, T_VILLAGE_MASTER, T_LOAN_TYPE, T_CLIENT_REPAY_SCHEDULE WHERE CLL_STATUS in (17,19) AND CLL_CLT_PK=CLT_PK AND CLL_LTY_PK = LTY_PK AND CRS_CLT_PK = CLT_PK AND CRS_DATE = '"+date+"' AND CRS_COLLECTION_WEEK_NO >= LTY_FIRST_REVIEW_WEEK AND CLT_VILLAGE=VLM_PK "+clientFilter+" GROUP BY CLT_VILLAGE";
                var newcmd = "SELECT COUNT(DISTINCT CLL_PK) as EVALCOUNT, VLM_PK, VLM_NAME, CLL_CLT_PK, CLT_PK, CLT_VILLAGE, CRS_ACTUAL_WEEK_NO, LTY_FIRST_REVIEW_WEEK FROM T_CLIENT, T_CLIENT_LOAN, T_LOAN_TYPE, T_VILLAGE_MASTER, T_CLIENT_REPAY_SCHEDULE WHERE CLL_LTY_PK = LTY_PK AND CRS_CLT_PK = CLT_PK AND CRS_DATE = '"+date+"' AND (  (CRS_ACTUAL_WEEK_NO >= LTY_FIRST_REVIEW_WEEK AND CLL_STATUS = 17) OR (CRS_ACTUAL_WEEK_NO >= LTY_SECOND_REVIEW_WEEK AND CLL_STATUS = 19) ) AND CLL_CLT_PK=CLT_PK AND CLT_VILLAGE=VLM_PK "+clientFilter+" GROUP BY CLT_VILLAGE";
                myDB.execute(newcmd, function(results){
                    //printLog(results)
                    scope.$apply(function(){
                        if(results.length > 0){
                            scope.taskEval = results[0].EVALCOUNT;
                        } else {
                            scope.taskEval = 0;
                        }
                        scope.taskQdone = 1;
                    });
                });
            }
            function getTraining() {
                //Retrieve pending training completion for today
                var clientFilter = "";
                if(scope.fo.currentVillageClients != ""){
                    clientFilter = " AND CLT_PK IN ("+scope.fo.currentVillageClients+") ";
                }

                var training = "SELECT COUNT(CLT_VILLAGE) as EVALCOUNT  FROM T_CLIENT, T_CLIENT_LOAN WHERE (CLT_STATUS = 4 ) AND (CLL_STATUS=3) AND CLL_CLT_PK=CLT_PK AND CLT_TRANING_START_DATE < '"+date+"' AND CLT_TRANING_END_DATE > '"+date+"' ";
                training += clientFilter;

                myDB.execute(training, function(results){

                    scope.$apply(function(){
                        if(results.length > 0){
                            scope.taskTrain = results[0].EVALCOUNT;
                        } else {
                            scope.taskTrain = 0;
                        }

                        scope.taskQdone = 1;
                    });
                });
            }
            function getConfirmation(date){
                //Retrieve pending confirmation from client for today

                var clientFilter = "";
                if(scope.fo.currentVillageClients != ""){
                    clientFilter = " AND CLT_PK IN ("+scope.fo.currentVillageClients+") ";
                }

                var signbyapp = "SELECT COUNT(CLT_VILLAGE) as EVALCOUNT FROM T_CLIENT, T_CLIENT_LOAN WHERE (CLT_STATUS=7) AND (CLL_STATUS=10) AND CLL_FORM_DISTRIBUTION_DATE='"+date+"' AND CLL_CLT_PK=CLT_PK ";

                signbyapp += clientFilter;

                myDB.execute(signbyapp, function(results){
                    scope.$apply(function(){
                        if(results.length > 0){
                            scope.taskConfm = results[0].EVALCOUNT;
                        } else {
                            scope.taskConfm = 0;
                        }
                        scope.taskQdone = 1;
                    });
                });
            }

        }
    }
});
myApp.directive('dashLink', function(){
    return {
        scope: {
            dashLink: '@',
            statType: '@',
            dStatus: '@'
        },
        link: function(scope,elm,attrs){

            elm.on('click', function(e) {

                //Saving current village
                localStorage.setItem('currentVillage',scope.dashLink);
                localStorage.setItem('curr_village',scope.dashLink);
                localStorage.setItem('statType',scope.dashLink);



                ////printLog(scope.isSign);
                localStorage.setItem('curr_village',scope.dashLink);
                if(scope.statType && scope.statType !== undefined && scope.statType == "sign"){
                    localStorage.setItem('statType',"CommonStatus.Status_11");
                } else if(scope.statType && scope.statType !== undefined && scope.statType == "train"){
                    if(scope.dStatus == 4){
                        localStorage.setItem('statType',"CommonStatus.Status_5");
                    } else if(scope.dStatus == 5){
                        localStorage.setItem('statType',"CommonStatus.Status_26");
                    }
                } else if(scope.statType && scope.statType !== undefined && scope.statType == "propo"){
                    localStorage.setItem('statType',scope.dashLink);
                } else if(scope.statType && scope.statType !== undefined && scope.statType == "disbursements"){
                    localStorage.setItem('statType',scope.dashLink);
                } else if(scope.statType && scope.statType !== undefined && scope.statType == "transactions"){
                    localStorage.setItem('statType',scope.dashLink);
                } else if(scope.statType && scope.statType !== undefined && scope.statType == 'evalu'){
                    localStorage.setItem('togglEvals','eval');
                }

                // //printLog(localStorage.getItem('isSign'));
          //    e.preventDefault();
            })
        }
    }
});

myApp.directive('uiSelect', function(){
    return {
        restrict: 'A',
        require: 'ngModel',
        priority: 1,
        link: function(scope,elm,attrs,ngModel){

            var unbindWatcher = scope.$watch(attrs.ngModel, function(newValue, oldValue) {

                if (newValue!=null && (oldValue === undefined || oldValue == null)) {

                    elm.selectmenu('refresh',true);

                    //Force set colours
                    elm.parent().css('background-color','rgb(128, 198, 199)');
                    elm.parent().css('color','rgb(255, 255, 255)');
                    elm.parent().css('text-shadow','rgb(255, 255, 255) 0px 0px 0px');

                    unbindWatcher();
                }
            });

        }
    }
});
myApp.directive('selectRefresh', function(){
    return {
        restrict: 'A',
        require: 'ngModel',
        priority: 1,
        link: function(scope,elm,attrs,ngModel){


            var unbindWatcher = scope.$watch(attrs.ngModel, function(newValue, oldValue) {
                if (newValue!=null && newValue != oldValue) {

                    //printLog("refreshed "+newValue);
                    setTimeout(function(){
                        elm.selectmenu('refresh',true);
                        //Force set colours
                        elm.css('background-color','rgb(128, 198, 199)');
                        elm.css('color','rgb(255, 255, 255)');
                        elm.css('text-shadow','rgb(255, 255, 255) 0px 0px 0px');
                        elm.parent().parent().css('min-width','200px');
                        unbindWatcher();
                    },100);


                }
            });

        }
    }
});

myApp.directive('selectMenuRefresh', function($timeout) {
  return {

    restrict: 'A',
    link: function(scope, element, attrs) {

        var unbindInitializationWatch = scope.$watch(attrs.ngModel, function(newValue, oldValue) {

            // //printLog(oldValue);
            // //printLog(newValue);

            if (newValue && oldValue === undefined) {

                // element.selectmenu('refresh');
                // unbindInitializationWatch();
            } else if (newValue != oldValue) {
                // //printLog("initialising1");
                element.selectmenu();
                $timeout(function() {
                    // //printLog("initialising2");

                    element.parent().css('background-color','rgb(128, 198, 199)');
                    element.parent().css('color','rgb(255, 255, 255)');
                    element.parent().css('text-shadow','rgb(255, 255, 255) 0px 0px 0px');
                    unbindInitializationWatch();
                },300);
            }
      });

      var unbindUpdateWatch = scope.$watch(attrs.ngModel, function(newValue, oldValue) {
        if ((newValue && oldValue) && (newValue !== oldValue)) {

            //element.selectmenu('refresh');
        }
      });

      scope.$on('$destroy', function () {
        unbindUpdateWatch();
      });
    }
  };
});

myApp.directive('uiStatusSelect', function(){
    return {
        restrict: 'A',
        require: 'ngModel',
        priority: 1,
        link: function(scope,elm,attrs,ngModel){
            var unbindWatchertwo = scope.$watch(attrs.ngModel, function(newValue, oldValue) {
                if (newValue && oldValue === null) {
                    elm.selectmenu('refresh');
                    unbindWatchertwo();
                }
            });
        }
    }
});
myApp.directive('slideable', function () {
    return {
        restrict:'C',
        compile: function (element, attr) {
            // wrap tag
            var contents = element.html();
            element.html('<div class="slideable_content" style="margin:0 !important; padding:0 !important" >' + contents + '</div>');

            return function postLink(scope, element, attrs) {
                // default properties
                attrs.duration = (!attrs.duration) ? '1s' : attrs.duration;
                attrs.easing = (!attrs.easing) ? 'ease-in-out' : attrs.easing;
                element.css({
                    'overflow': 'hidden',
                    'height': '0px',
                    'transitionProperty': 'height',
                    'transitionDuration': attrs.duration,
                    'transitionTimingFunction': attrs.easing
                });
            };
        }
    };
});
myApp.directive('slideToggle', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var target = document.querySelector(attrs.slideToggle);
            attrs.expanded = false;
            element.bind('click', function() {
                var content = target.querySelector('.slideable_content');
                if(!attrs.expanded) {
                    content.style.border = '1px solid rgba(0,0,0,0)';
                    var y = content.clientHeight;
                    content.style.border = 0;
                    target.style.height = y + 'px';
                } else {
                    target.style.height = '0px';
                }
                attrs.expanded = !attrs.expanded;
            });
        }
    }
});
myApp.directive('cashonhandBg',function(){
    return {
        restrict: 'A',
        link: function(scope,elm,attrs) {

            var listener = scope.$watchGroup(['ttlcol','ttlcoled','ttlsave','ttlsaved'], function(newValue, oldValue,scope) {

                // //printLog(newValue[0]+"  "+oldValue[0]);
                // //printLog(newValue[1]+"  "+oldValue[1]);
                if(newValue[1] != null && newValue[0] > 0){

                    if(newValue[1] >= newValue[0] && newValue[3] >= newValue[2]){
                        elm.css('background-color','#96e596');
                    } else {
                        elm.css('background-color','#FFF');
                    }
                    listener();
                }
            });
        }
    }
});
myApp.directive('transCheck',function(){
    return {
        restrict: 'A',
        scope: {
            expected: '@',
            actual: '@',
            expobj: '@',
            actobj: '@',
            defaultcolor: '@',
            weight: '@',
            groupid: '@',
            type: '@',
            checknow: '='
        },
        link: function(scope,elm,attrs) {

            //Setting default
            scope.defaultcolor = angular.isDefined(scope.defaultcolor) ? scope.defaultcolor : '#000';
            scope.weight = angular.isDefined(scope.weight) ? scope.weight : '400';
            scope.type = angular.isDefined(scope.type) ? scope.type : 'text';
            scope.checknow = angular.isDefined(scope.checknow) ? scope.checknow : true;

            if('expobj' in attrs && 'actobj' in attrs){

                var listenera = scope.$watchGroup(['expobj','actobj','groupid','checknow'], function(newValue, oldValue,scope) {
                    var activecolor = scope.defaultcolor;
                    var activeweigtht = scope.weight;

                    if(newValue[3]) {
                        if(parseFloat(newValue[1]) > 0){

                            if(parseFloat(newValue[1]) >= parseFloat(newValue[0])){
                                activecolor = '#4DBD33';
                            } else {
                                //activecolor = '#ffa500';
                                activecolor = '#FF8A65';
                            }
                            activeweigtht = '600';
                        }
                    }
                    //SET COLOR
                    if(scope.type == "text"){
                        elm.css('color',activecolor);
                    } else {
                        elm.css('background-color',activecolor);
                    }
                    elm.css('font-weight',activeweigtht);

                    if(parseFloat(newValue[2]) != parseFloat(oldValue[2] && (newValue[3] == true)) ){
                        listenera();
                    }

                });
            }else if('expected' in attrs && 'actual' in attrs){

                var listener = scope.$watchGroup(['expected','actual','groupid','checknow'], function(newValue, oldValue,scope) {

                    var activecolor = scope.defaultcolor;
                    var activeweigtht = scope.weight;

                    //PREPARE DEFAULTS

                    // CHECK TO PROCESS OR NOT

                    if(newValue[3] == true) {
                        //IF ACTUAL > 0
                        // //printLog("expected "+newValue[0]);
                        // //printLog("actual "+newValue[1]);

                        if(parseFloat(newValue[1]) >= parseFloat(newValue[0])){
                            activecolor = '#4DBD33'; //GREEN
                        } else {
                            //Actual amount lesser than expected
                            //activecolor = '#ffa500';
                            activecolor = '#FF8A65'; //RED
                        }
                        activeweigtht = '600';
                        elm.css('color','white'); //DEFAUT TEXT COLOR - WHITE
                    }

                    //SET COLOR TO TEXT OR BACKGROUND OR FINAL (CASHONHAND)
                    if(scope.type == "text"){
                        elm.css('color',activecolor); // SET TEXT COLOR TO WHITE
                    } else if (scope.type == "dash" || scope.type == 'disb'){

                        var bgColor = "#FFF"; // BG - WHITE
                        var txtColor = "#607D8B"; // TEXT - GREY
                        //Actual >= Expected = More than or same as expected
                        if(newValue[3] == true){
                            if(parseFloat(newValue[1]) >= parseFloat(newValue[0])){
                                bgColor = "#4DBD33"; // BG- GREEN
                            } else {
                                //bgColor = "#ffa500";
                                bgColor = '#FF8A65'; // BG - RED
                                if(scope.type == 'disb') bgColor = '#546E7A';
                            }
                            txtColor = "white"; // TEXT - WHITE
                        }

                        elm.css('color',txtColor); // SET TEXT COLOR
                        elm.find('.box-body').css('color',txtColor); // SET TEXT COLOR
                        elm.find('.group-block-amt h1').css('color',txtColor); // SET TEXT COLOR
                        elm.css('background-color',bgColor); // SET BG COLOR
                        elm.find('.box-header').css('background-color','rgba(0,0,0,0.35)'); // SET DARKER HEADR COLOR

                    } else if(scope.type == 'final'){

                        // SET DARKER HEADER COLOR
                        elm.parent().find('thead tr th').css('background-color','rgba(0,0,0,0.35)');

                        if(newValue[3] == true){

                            // //printLog("val1 "+parseFloat(newValue[1]));
                            // //printLog("val0 "+parseFloat(newValue[0]));
                            // IF CASHONHAND > = EXPECTED
                            if(parseFloat(newValue[1]) >= parseFloat(newValue[0])){
                                activecolor = '#4DBD33'; // GREEN
                                elm.css('background-color',activecolor); //SET BG COLOR
                            } else {
                                elm.css('background-color',activecolor); //SET BG COLOR
                            }

                            elm.css('color','white'); // SET TEXT COLOR - WHITE
                            elm.find('.group-block-amt h1').css('color','white'); // SET TEXT COLOR - WHITE
                            elm.find('.group-block-amt').css('color','white'); // SET TEXT COLOR - WHITE
                            elm.find('.group-status').css('color','white'); // SET TEXT COLOR - WHITE

                        } else {
                            //IF NOT DONE, BG SET TO WHITE
                            elm.css('background-color',"#FFF");
                            elm.find('.group-block-amt h1').css('color','#78909C'); // SET TEXT COLOR - GREY
                            elm.find('.group-status').css('color','#78909C'); // SET TEXT COLOR - GREY
                        }
                    } else {

                        elm.css('background-color',activecolor);
                    }

                    //SET TEXT WEIGHT
                    elm.css('font-weight',activeweigtht);
                    //IF VALUE CHANGE, RERUN
                    ////printLog( " New "+newValue[1]+"  OLD "+oldValue[1]+" CHECK "+newValue[3]+" "+oldValue[3]);
                    if( (parseFloat(newValue[1]) != parseFloat(oldValue[1]) && (newValue[3] == true || oldValue[3] == true))  ){
                        callListener();
                    }

                }, true);

                function callListener(){
                    //listener();
                }

            }
        }
    }
});
(function($) {
    $.getDate = function(options){

        var newdate = "";

        var defDate = new Date();

        var gd = {
            options: $.extend({
                dateDelimeter: '/',
                date : defDate,
            }, options),
            getDMY: function(){
                //printLog(options);
                newdate = ("0"+gd.options.date.getDate()).slice(-2)+ gd.options.dateDelimeter +("0"+(gd.options.date.getMonth()+1)).slice(-2)+ gd.options.dateDelimeter +gd.options.date.getFullYear();
                return newdate;
            },
            getYMD: function(){
                newdate = gd.options.date.getFullYear()+ gd.options.dateDelimeter +("0"+(gd.options.date.getMonth()+1)).slice(-2)+ gd.options.dateDelimeter +("0"+gd.options.date.getDate()).slice(-2);
                return newdate;
            }
        }

        return {
            DMY: gd.getDMY,
            YMD: gd.getYMD,
        };

    }
})(jQuery);

var getDashDate = $.getDate({ dateDelimeter: '-'});
var getSlashDate = $.getDate({ dateDelimeter : '/' });

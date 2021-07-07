/******************************************
GLOBAL
******************************************/
var SEARCH_LIMIT = 5;

/******************************************
UI Tweaks - makes select box blue.
******************************************/
function init(){
initTemplate.load(1);
        $("select").each(function(){
        $(this).closest('.ui-btn').css('background-color','#80C6C7');
        $(this).closest('.ui-btn').css('color','#fff');
        $(this).closest('.ui-btn').css('text-shadow','0 0 0 #fff');
    });
}

/******************************************
Controller
******************************************/
//myApp = angular.module("myApp",[]);

myApp = angular.module("myApp",['pascalprecht.translate']);  //declare angular-translate as a dependency

myApp.config(function ($translateProvider) {

	$translateProvider.useStaticFilesLoader({
		prefix: "locales/locale-",
		suffix: ".json"
	});

    $translateProvider.preferredLanguage(ln.language.code);

});

//myApp.controller("ClientCtrl",function($scope){
myApp.controller("ClientCtrl",function($scope,$filter){

    //variables to manage search and paging
    $scope.currentPage = 0;
    $scope.TOTAL_RECORDS = 0;
    $scope.filteredClients = [],
    $scope.sf = []; //sf "search field" (filter parameters)
    $scope.branch=""; //important fields
    $scope.sf.CLT_FULL_NAME = "";
    $scope.sf.CLT_OTH_REG_NO = "";
    $scope.sf.CLT_STATUS = "";
    $scope.sf.CLT_VILLAGE = null;

    $scope.filter = [];
    $scope.filter.CLT_CENTER = null;
    $scope.filter.CLT_GROUP = null;


    $scope.loans = [];
    $scope.allreviews = [];
    $scope.togglEvals = null;

    if(localStorage.getItem('togglEvals') != null){
        $scope.togglEvals = localStorage.getItem('togglEvals');
        localStorage.setItem('togglEvals',null);
    }

    // myDB.execute("SELECT * FROM T_CLIENT_EVALUATION",function(res){
    //     //console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
    //     //console.log(res);
    // })

    console.log("starting");

    // $scope.$watch('sf.CLT_FULL_NAME', function(nVal, oVal) {
    //     if (nVal !== oVal) {
    //         $scope.runQuery(true,0);
    //     }
    // });

    // $scope.$watch('sf.CLT_OTH_REG_NO', function(nVal, oVal) {
    //     if (nVal !== oVal) {
    //         $scope.runQuery(true,0);
    //     }
    // });

    // $scope.$watch('sf.CLT_OTH_REG_NO', function(nVal, oVal) {
    //     if (nVal !== oVal) {
    //         $scope.runQuery(true,0);
    //     }
    // });

    //myDB.execute("UPDATE T_CLIENT_LOAN SET CLL_PK = 4296, CLL_STATUS = 59 WHERE CLL_PK = 59");

    $scope.$watchGroup(['sf.CLT_FULL_NAME','sf.CLT_OTH_REG_NO','sf.CLT_VILLAGE','sf.CLT_STATUS'], function(newValue, oldValue,$scope) {
        if(newValue[0] !== oldValue[0]||
            newValue[1] !== oldValue[1]||
            newValue[2] !== oldValue[2]||
            newValue[3] !== oldValue[3]){
                console.log("loading...");
                $scope.runQuery(true,0);

        }

    });

    $scope.updateVillage = function(obj){

        //console.log(obj);
        //console.log($scope.sf.CLT_VILLAGE); 
        $scope.sf.CLT_VILLAGE = obj;
        $scope.$apply();
        $('#village').selectmenu("refresh", true);
        refreshall('#village');

    }

    $scope.updateCenter = function(obj) {
        $scope.filter.CLT_CENTER = obj;
        $scope.$apply();
        refreshall('#centers');
    }

    $scope.updateGroup = function(obj) {
        $scope.filter.CLT_GROUP = obj;
        $scope.$apply();
        refreshall('#groups');
    }

    // var cmd = "UPDATE T_CLIENT_LOAN SET CLL_STATUS=19 WHERE CLL_CLT_PK=114";
    // myDB.execute(cmd);


    $scope.numPages = function(){return Math.ceil($scope.TOTAL_RECORDS/SEARCH_LIMIT);};
    $scope.getPages = function(){return new Array($scope.numPages());};
    $scope.changePage = function(i){
        console.log("changing page");
        $scope.currentPage = i;
        $scope.runQuery(false,i);
    };
    $scope.getResults = function(results){
        //console.log(results);
        var newdata = [];
        $.each(results,function(i,res){

            var val = [];
            for(var key in res){
                val[key] = res[key];
                if(typeof val[key] === 'string'){
                    val[key] = decodeURI(val[key]);
                }
            }

            val.hasReview = 0;
            val.PPI_complete = false;

            newdata.push(val);

        });

        $scope.$apply(function(){ $scope.filteredClients = newdata; });
        $scope.getReviewEligibity($scope.filteredClients);
        //console.log($scope.filteredClients);
    };

    $scope.getReviewEligibity = function(clients){
        console.log("getReviewEligibity");
        var isLast = false;
        $.each(clients,function(c,client){ 
            if(c == clients.length - 1) isLast = true;
            $scope.insertLoanStatus(client, isLast);
            if( client.CLL_STATUS == 19 || client.CLL_STATUS == 59) {
                $scope.insertPPIStatus(client, isLast);
            }
        });

    }

    $scope.insertPPIStatus = function(client, isLast) {
        var cmd = "SELECT PPIF_PK FROM T_PPI_FORM WHERE PPIF_CLL_PK = " + client.CLL_PK;
        // myDB.execute(cmd, function(res) {
        //     if( res.length > 0) {
        //         client.PPI_complete = true;
        //     }
        //     if( isLast ) {
        //         setTimeout( function() {
        //             $scope.$apply();
        //         }, 1);
        //     }
        // });
    }

    $scope.insertLoanStatus = function(client, isLast){

        var cmd = "SELECT CLL_STATUS FROM T_CLIENT_LOAN WHERE CLL_STATUS IN (13,17,19,59) AND CLL_CLT_PK="+client.CLT_PK;
        myDB.execute(cmd,function(res){ 
            client.hasReview = res.length;
            if( isLast ) {
                setTimeout( function() {
                    $scope.$apply();
                }, 1);
            }
        });

    }



    $scope.checkNull = function(text){

        var newtext = text;

        //console.log("line164 "+newtext);

        if(newtext == "NULL" || newtext == "" || newtext == null || newtext == "null"){
            newtext = "-";
        }


        return newtext;

    }


    $scope.generateQuery = function(){

        var ctrcmd= '';

        if($scope.filter.CLT_CENTER != null){
            ctrcmd = " AND CAST(CLT_CENTER_ID as INT) ="+$scope.filter.CLT_CENTER.value+" ";
        }

        cmd =   " FROM T_CLIENT,T_CLIENT_LOAN,T_VILLAGE_MASTER, T_TXN_STATUS,T_LOAN_TYPE ";
        cmd +=  " WHERE  CLT_PK = CLL_CLT_PK AND CLL_LTY_PK = LTY_PK AND VLM_PK=CLT_VILLAGE AND TST_PK=CLT_STATuS AND CLT_STATUS NOT IN (25,8) " + ctrcmd;

        var cmc = "";

        for(key in $scope.sf){
            if($scope.sf[key]!=="" && $scope.sf[key] != null){
                cmd+= " AND ";
                cmc+= " AND ";

                if(key=='CLL_STATUS'){
                    if([18,41].indexOf(parseInt($scope.sf[key]))!=-1){
                        cmd += key+" in (18,41)";
                        cmc += key+" in (18,41)";
                    }else if([20,42].indexOf(parseInt($scope.sf[key]))!=-1){
                        cmd += key+" in (20,42)";
                        cmc += key+" in (20,42)";
                    }else{
                        cmd += key+" = '"+$scope.sf[key]+"'";
                        cmc += key+" = '"+$scope.sf[key]+"'";
                    }
                } else if (key=='CLT_VILLAGE'){

                    if($scope.sf[key] && $scope.sf[key] != null){
                        cmd += key+" = "+$scope.sf[key].value+" ";
                        cmc += key+" = "+$scope.sf[key].value+" ";
                    }
                }else{
                    cmd += key+" LIKE '%"+$scope.sf[key]+"%'";
                    cmc += key+" LIKE '%"+$scope.sf[key]+"%'";
                }
            }
        }

        var ncmd = cmd;

        var evalcmd = "";
        var villcmd = ""; 

        if($scope.togglEvals != 'null' ){
            //evalcmd = " AND CLL_STATUS > 16 ";
            cmd += evalcmd;
            cmc += evalcmd;
        }
        
        // if($scope.sf.CLT_VILLAGE != null){
        //     villcmd = " AND CLT_VILLAGE ="+$scope.sf.CLT_VILLAGE.value+" ";
        // }
         
        var order = ' ORDER BY ( CASE CLL_STATUS WHEN 59 THEN 1 WHEN 17 THEN 2 WHEN 13 THEN 2 WHEN 19 THEN 3 ELSE 4 END ),CLT_FULL_NAME '; //requires order in the returned results
        var orderq = ' ORDER BY CLL_STATUS,CLT_FULL_NAME  '; //requires order in the returned results
        cmd += order;

        var cmdq = "SELECT COUNT(DISTINCT CLT_PK) as TOTAL_RECORDS FROM T_CLIENT_LOAN, T_CLIENT WHERE CLL_CLT_PK = CLT_PK AND CLT_STATUS NOT IN (25,8) " + cmc  + evalcmd  + villcmd + ctrcmd + orderq;

        console.log(cmdq)

        cmd = 'SELECT LTY_FIRST_REVIEW_WEEK, LTY_SECOND_REVIEW_WEEK,CLL_MOB_NEW,CLT_STATUS, CLT_PK, CLT_MOB_NEW, CLT_OTH_REG_NO, CLT_FULL_NAME, CLT_CLEINT_ID, CLT_IS_GROUP_LEADER, CLT_CENTER_ID, CLT_STREET_AREA_NM, CLT_DISTRICT, CLT_POSTAL_CD, CLT_MOB_NO_1, VLM_NAME, CLT_VILLAGE, CLL_PK, CLL_STATUS, TST_NAME STATUS_NAME, TST_KEY STATUS_KEY, CLL_LOAN_WEEKS,CLL_ORIGINAL_LOAN,CLL_DISBURSEMENT_DATE,CLT_GROUP_ID,CLL_IS_NEW_LOAN_APPLIED,CLL_PARENT_CLL_PK' + cmd;

        cmd = 'SELECT * FROM ('+cmd+') CLT LEFT OUTER JOIN (SELECT CCR_CLT_PK FROM T_CLIENT_CHANGE_REQUEST) CCR ON CLT.CLT_PK=CCR.CCR_CLT_PK GROUP BY CLT.CLT_PK ORDER BY ( CASE CLL_STATUS WHEN 59 THEN 1 WHEN 13 THEN 2 WHEN 17 THEN 2 WHEN 19 THEN 3 ELSE 4 END ),CLT_FULL_NAME LIMIT _SEARCH_LIMIT_ OFFSET _PAGE_OFFSET_';

        $scope.existingQuery||($scope.existingQuery={}); //saving the existing query to be used later
        $scope.existingQuery["QUERY"] = cmd;
        $scope.existingQuery["COUNT"] = cmdq;
    };

    $scope.runQuery = function(isNew,page){
        console.log("running query");

        if(isNew){ //if new query, generate new queries based on search fields. set current page to 0.
            $scope.generateQuery();
            $scope.currentPage = 0;
        }
        var cmd = $scope.existingQuery["QUERY"].replace(/_SEARCH_LIMIT_/g,SEARCH_LIMIT).replace(/_PAGE_OFFSET_/g,(page*SEARCH_LIMIT)); //set search limit and page offset
        //console.log("runQuery");
        myDB.execute(cmd,function(results){
            console.log("runQuery",cmd,results);
            $scope.getResults(results);
        }); //execute query and get results

        if(isNew){ //new query, update # of total records label.
            cmd = $scope.existingQuery["COUNT"].replace(/_SEARCH_LIMIT_/g,SEARCH_LIMIT).replace(/_PAGE_OFFSET_/g,(page*SEARCH_LIMIT));
            console.log(cmd);
            myDB.execute(cmd,function(results){
                console.log(results);
                $scope.TOTAL_RECORDS = results[0].TOTAL_RECORDS;
                ////console.log("TOTAL RECORDS UPDATED TO "+$scope.TOTAL_RECORDS);
                $scope.$apply();
            });
        }
    };

    setTimeout(function(){
        $scope.gotoreview();
    },100);

    //run the above queries at least once during load
    $scope.generateQuery();
    $scope.runQuery(true,0); //this is a new query, so update the query string.
                            //if user is only changing pages, we will run Query with (false, pg_number);
    setTimeout(function(){
        $('.aniview').AniView();
    },300);
/******************************************
Action - View, New Evaluations, Change Requests, New Loans
******************************************/
    //when user clicks on client's name or any of the action buttons
    $scope.view = function(ind,prev,CLT_PK){
        sessionStorage.setItem("LOAN_ID",ind);
        sessionStorage.setItem("PREV_LOAN_ID",prev);
        sessionStorage.setItem("CLIENT_ID",CLT_PK);
        window.location.href = "view_client.html";
    };
    //user clicks on evaluation button
    $scope.evaluate = function(CLT_PK,CLT_FULL_NAME){
        sessionStorage.setItem("CLIENT_ID",CLT_PK);
        sessionStorage.setItem("CLIENT_NAME",CLT_FULL_NAME);
        // if(CLL_STATUS==41||CLL_STATUS==42){
        //     sessionStorage.setItem("EVALMODE",true); //user is updating only
        // }else sessionStorage.setItem("EVALMODE",false);
        //window.location.href = "evaluation.html";
        $scope.detailview(1);
    };
    $scope.terminate = function(client){
        sessionStorage.setItem("CLIENT_ID",client.CLT_PK);
        sessionStorage.setItem("CLIENT_NAME",client.CLT_FULL_NAME);

        let countingMember = `
            SELECT 
                count(*) memberCount
            FROM 
                T_CLIENT
            WHERE 
                CLT_GROUP_ID='${client.CLT_GROUP_ID}' AND
                CLT_CENTER_ID='${client.CLT_CENTER_ID}' 
        ` 

        myDB.execute(countingMember,function(results) { 
            console.log(countingMember,results);
            let memberCount = results[0].memberCount

            // if client is group leader & he is not the last one
            // force his group to change group leader
            // else allow them go straight to termination
            if(client.CLT_IS_GROUP_LEADER == 'Y' & memberCount > 1){
                swal({
                    title: 'Please change group leader first',
                    text: '',
                }).then(
                function (confirm) {
                    sessionStorage.setItem("CLIENT_CTR_PK",parseInt(client.CLT_CENTER_ID) );
                    sessionStorage.setItem("CLIENT_GRP_ID",client.CLT_GROUP_ID);
                    if(confirm) window.location.href = "groupclients.html";
                },
                // handling the promise rejection
                function (dismiss) {
                    if (dismiss === 'timer') {
                    console.log('I was closed by the timer')
                    }
                });
                return false;
            } else {
                $scope.gotoTerminate()
            }
        })

    }

    //user clicks on change request button
    $scope.changeRequest = function(CLT_PK,CLT_GROUP_ID){

        sessionStorage.setItem("CLIENT_ID",CLT_PK);
        sessionStorage.setItem("GROUP_ID",CLT_GROUP_ID);
        window.location.href = "changerequest.html";
    }
    $scope.doPPI = function(CLT_PK, CLT_FULL_NAME) {
        sessionStorage.setItem("PPI_CLIENT_ID",CLT_PK); 
        sessionStorage.setItem("CLIENT_ID",CLT_PK);
        sessionStorage.setItem("CLIENT_NAME",CLT_FULL_NAME);
        window.location.href = "ppiform.html";
    }
    //user clicks on newloan button
    $scope.newLoanRequest = function(client){

        myDB.execute("SELECT CLL_STATUS FROM T_CLIENT_LOAN WHERE CLL_STATUS IN (13,17,19,59) AND CLL_CLT_PK="+client.CLT_PK,function(res){
            if(res.length>0){
                swal({
                    title: i18n.t("messages.Alert"),
                    text: i18n.t("messages.PendingReview"),
                    type: "warning",
                    confirmButtonColor: "#80C6C7",
                    confirmButtonText: "Ok",
                    closeOnConfirm: true
                },function(){
                    $scope.evaluate(client.CLT_PK,client.CLT_FULL_NAME);
                });
            } else {
                sessionStorage.setItem("CLIENT_ID",client.CLT_PK);
                sessionStorage.setItem("LOAN_ID",client.CLL_PK);
                window.location.href = "newloan.html";
            }
        });

        return false;


    }

    $scope.EvalLoan = function(loan){

        var loanweeks = 0;
        if(loan.CLL_LOAN_WEEKS != "null"){
            loanweeks = parseInt(loan.CLL_LOAN_WEEKS) + 1;
        }

        sessionStorage.setItem("LOAN_ID",loan.CLL_PK);
        sessionStorage.setItem("LOAN_STATUS",loan.CLL_STATUS);
        sessionStorage.setItem("LOAN_WEEKS",loanweeks); //synchrony with server's logic.
        sessionStorage.setItem("LOAN_ORIGINAL",loan.CLL_ORIGINAL_LOAN);
        sessionStorage.setItem("LOAN_DISDATE",loan.CLL_DISBURSEMENT_DATE);
        window.location.href = "evaluation.html";
    }

    $scope.allReviewsQ = function(){
        console.log("allReviewsQ");
        myDB.execute("SELECT COUNT(DISTINCT CLL_PK) as loancount, CLL_CLT_PK FROM T_CLIENT_LOAN,T_LOAN_TYPE WHERE CLL_LTY_PK = LTY_PK AND CLL_STATUS IN (13,17,19,59) AND LTY_CODE != '001.9999' GROUP BY CLL_CLT_PK",function(res){
            $scope.allreviews = res;
            console.log($scope.allreviews);
        }); 
    }

    $scope.allReviewsQ();

    $scope.loanReviewCount = function(cltpk){
        ////console.log(cltpk);

        var sum = 0;

        var loan = $filter('filter')($scope.allreviews, { CLL_CLT_PK: cltpk })[0];

        if(loan != undefined){
            sum = loan.loancount;
        }

        return sum;

    }

    $scope.terminateView = function(){

        $('.first-page').hide();
        $('.second-wrapper').hide();
        $('.second-page').hide();
        $('.third-wrapper').show();
        $('.third-page').fadeOut();
    }

    $scope.gotoTerminate = function(){
        // var loanweeks = 0;
        // if(loan.CLL_LOAN_WEEKS != "null"){
        //     loanweeks = parseInt(loan.CLL_LOAN_WEEKS) + 1;
        // }

        // sessionStorage.setItem("LOAN_ID",loan.CLL_PK);
        // sessionStorage.setItem("LOAN_STATUS",loan.CLL_STATUS);
        // sessionStorage.setItem("LOAN_WEEKS",loanweeks); //synchrony with server's logic.
        // sessionStorage.setItem("LOAN_ORIGINAL",loan.CLL_ORIGINAL_LOAN);
        // sessionStorage.setItem("LOAN_DISDATE",loan.CLL_DISBURSEMENT_DATE);
        window.location.href = "terminationform.html";
    }

    $scope.detailview = function(clientspage){

        if( clientspage == 0 ){
            $('.first-page').fadeIn();
            $('.second-page').hide();
            $('.second-wrapper').hide();
             $('.third-wrapper').hide();
            $('.third-page').fadeOut();
        } else if (clientspage == 1){
            $scope.getLoans();
            $('.first-page').hide();
            $('.third-wrapper').hide();
            $('.third-page').fadeOut();

            $('.second-wrapper').show();
            $('.second-page').fadeOut();
        } else {
            $scope.getLoans();
            $('.first-page').hide();
            $('.second-page').hide();
            $('.second-wrapper').hide();

            $('.third-wrapper').show();
            $('.third-page').fadeOut();
        }
    }

    $scope.gotoreview = function(){
        if(sessionStorage.getItem("GOTO") != undefined && sessionStorage.getItem("GOTO") != null && sessionStorage.getItem("GOTO") == "EVAL"){
            sessionStorage.setItem("GOTO",null);
            $scope.detailview(1);
        }
    }

    $scope.getLoans = function(){
        var clientpk = sessionStorage.getItem("CLIENT_ID");

        var cmd =   "SELECT * FROM T_CLIENT_LOAN,T_LOAN_TYPE ";
        cmd     +=  " WHERE CLL_LTY_PK = LTY_PK AND CLL_STATUS IN (13,17,19,59) AND CLL_CLT_PK ="+clientpk;
        var p = new Promise(function(suc, rej) {
            myDB.execute(cmd,function(res){
                //console.log(res);
                $scope.loans = [];
                $.each(res,function(i,loan){
                    $scope.loans.push(loan);
                    if(i == res.length -1 ) $scope.$apply();
                }); 
                suc($scope.loans);
            });
        })
        return p;
    }

    $scope.getClientName = function(){
        return sessionStorage.getItem("CLIENT_NAME");
    }

    $scope.evalCompleted = function(loan) {

        var resp = false;
        if(loan.CLL_STATUS == 41 || loan.CLL_STATUS == 42) resp = true;
        return resp;
    }

    $scope.loanEvalExp = function(group){
        return 0;
    }

    $scope.loanEvalAct = function(loan){

        var resp = 0;

        if(loan.CLL_STATUS == 41 || loan.CLL_STATUS == 42) resp = 1;
        //console.log(resp);
        return resp;
    }

    $scope.updateQuery = function(){
        console.log("changing village");
        $scope.runQuery(true,0)
    }

    $scope.toDoPPIform = function(client) {
        var todoPPI = false;
        // 19 Ready for Second Review
        // 59 Ready for Both Review
        if(client.hasReview > 0 && !client.PPI_complete && ( client.CLL_STATUS == 19 || client.CLL_STATUS == 59 )) {
            todoPPI = true;
        }
        return todoPPI;
    }

    $scope.isReviewDay = function(client){
        console.log(client);
        console.log("isReviewDay");
        var itstoday = false;
        // if(client.CRS_ACTUAL_WEEK_NO >= client.LTY_FIRST_REVIEW_WEEK && ( client.CLL_STATUS == 17 || client.CLL_STATUS == 19)) {
        //     itstoday = true;
        // }
        // if(  (client.CLL_STATUS == 17 && client.CRS_ACTUAL_WEEK_NO >= client.LTY_FIRST_REVIEW_WEEK) ||
        //     (client.CLL_STATUS == 19 && client.CRS_ACTUAL_WEEK_NO >= client.LTY_SECOND_REVIEW_WEEK) ){
        //     itstoday = true;
        // }
        // if(client.CLL_STATUS == 13 ||client.CLL_STATUS == 17 || client.CLL_STATUS == 19 || client.CLL_STATUS == 59){
        //     itstoday = true;
        // }
        //CLL_DISBURSEMENT_DATE
        var date = new Date();

        var dayOfWeek = date.getDay() + 1;

        var today = ("0"+date.getDate()).slice(-2)+"/"+("0"+(date.getMonth()+1)).slice(-2)+"/"+date.getFullYear();
        console.log(today);
        console.log(client.CLL_DISBURSEMENT_DATE)
        if(client.hasReview > 0 && today != client.CLL_DISBURSEMENT_DATE && client.CLL_STATUS == 17) {
            itstoday = true;
        }
        if(client.hasReview > 0 && client.PPI_complete && ( client.CLL_STATUS == 19 || client.CLL_STATUS == 59 )) {
            itstoday = true;
        }
        console.log(client.hasReview);
        console.log(today != client.CLL_DISBURSEMENT_DATE);
        console.log("itstoday " + itstoday);
        return itstoday;

    }
/******************************************
Load T_TXN_STATUS table for use on page
******************************************/

    var s = $scope;

    //save T_TXN_STATUS into a variable for use
    myDB.T_TXN_STATUS.get("TST_PK NOT IN (8,9,25)",function(results){ //8,9,25 not to be displayed
        //'TST_PK in (1,2,3,10,11,12,13,16,17,18,19,20,26,27,28,34,35,37,38)'
        console.log("T_TXN_STATUS");
        s.selectCodes || (s.selectCodes = []);
        s.selectCodes.push({'name': '','value': ''});
        $scope.sf.CLT_STATUS = '';
        $.each(results, function(ind, val){ //save these values into 'select codes'
            //var keypair = {'name': val.TST_NAME,'value': val.TST_PK}
			var keypair = {'name': val.TST_NAME,'value': val.TST_PK}
            s.selectCodes.push(keypair);
        });
        s.$apply(function() {s.selectCodes;}); //making sure the changes are noticed by angular, update properly.
    });


    var currVille = 0;

    if(localStorage.getItem('currentVillage') != null){
        currVille = localStorage.getItem('currentVillage'); 
    }

    $scope.loadGroups = function() {
        myDB.execute("SELECT * FROM T_CLIENT_GROUP WHERE CLG_CTR_PK="+$scope.filter.CLT_CENTER.pk, function(results) {
            s.selectGroup || (s.selectGroup = []); //init if null
            $.each(results, function(ind, val){
                var keypair = {'name': val.CLG_NAME,'value': val.CLG_PK};
                s.selectGroup.push(keypair);
            });
        })
    }

    $scope.loadCenters = function() {
        
        myDB.execute("SELECT * FROM T_CENTER_MASTER WHERE CTR_VLM_PK="+$scope.sf.CLT_VILLAGE.value, function(results) {
            s.selectCenter || (s.selectCenter = []); //init if null
            $.each(results, function(ind, val){
                var keypair = {'name': val.CTR_CENTER_NAME,'value': val.CTR_PK, 'pk': val.CTR_PK, 'id': val.CTR_CENTER_ID};
                s.selectCenter.push(keypair);
            });
            console.log('loading centers');
            console.log(s.selectCenter);
        })
    }

    
    $scope.loadVillages = function(){
        //save T_VILLAGE_MASTER's names
        myDB.execute("SELECT T_VILLAGE_MASTER.* FROM T_VILLAGE_MASTER WHERE VLM_PK IN (SELECT DISTINCT CLT_VILLAGE FROM T_CLIENT)",function(results){
        // myDB.T_VILLAGE_MASTER.get(null,function(results){
            console.log("getting villages..")
            console.log(results)
            s.selectVillage || (s.selectVillage = []); //init if null
            s.selectVillage.push({'name': '','value': ''}); 
            $.each(results, function(ind, val){
                    var keypair = {'name': val.VLM_NAME,'value': val.VLM_PK}
                    s.selectVillage.push(keypair);
                    if(currVille != 0 && currVille == val.VLM_PK){
                        //$scope.sf.CLT_VILLAGE = keypair; 
                        $scope.updateVillage(keypair);
                        $scope.loadCenters();
                    }
            });
            ////console.log($scope.sf);
            //alert(JSON.stringify($scope.sf.CLT_VILLAGE));
            //$scope.$apply();
            $('#villages').selectmenu("refresh", true);
            s.selectVillage; 
        });
    }




    $scope.loadVillages();
});
//end of controller

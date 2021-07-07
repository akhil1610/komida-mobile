function init(){

    initTemplate.load(1); //load header

}
/******************************************
// Controller
******************************************/
//myApp = angular.module("myApp", []);

var BRC_PK = sessionStorage.getItem("BRC_PK");
var USER_PK = sessionStorage.getItem("USER_PK");

myApp = angular.module("myApp",['pascalprecht.translate']);  //declare angular-translate as a dependency
/******************************************
// Header service
******************************************/

myApp.config(function ($translateProvider) {

    $translateProvider.useStaticFilesLoader({
        prefix: "locales/locale-",
        suffix: ".json"
    }); 
    $translateProvider.preferredLanguage(ln.language.code); 
});



myApp.controller("TodoCtrl", ['$scope','$timeout', function($scope,$timeout){

    var t = $scope;
/******************************************
// Time related display
******************************************/
    $scope.today = function(){ //displayed on TODO list

        var localLocale = moment();

        localLocale.locale(sessionStorage.LANGUAGE); // set this instance to use current language

        //return moment().format("dddd, MMMM Do YYYY h:mm a");
        //return localLocale.format("dddd, MMMM Do YYYY h:mm a");
        return localLocale.format("dddd, MMMM Do YYYY");

    };
    function dateTimer(){
        $scope.datetime = $scope.today();
    }
    dateTimer();
    setInterval(function(){dateTimer();},60*1000);
    //get today's date

    var anotherdate =  getDashDate.YMD();

    var date  = getSlashDate.DMY();


    myDB.execute("SELECT (SUM(CAST(CRS_EXP_CAPITAL_AMT AS UNSIGNED)) + SUM(CAST(CRS_EXP_PROFIT_AMT AS UNSIGNED))) AS TOTAL FROM T_CLIENT_REPAY_SCHEDULE,T_CLIENT WHERE CRS_CLT_PK = CLT_PK AND CLT_VILLAGE=57 AND CRS_LOAN_SAVING_FLAG='L' AND CRS_FLAG='C' AND CRS_DATE='"+date+"' ",function(res){
        //printLog("888");
        //printLog(res);
    });

    //printLog(JSON.parse(localStorage.getItem("loan_type")));

/******************************************
// Collection and disbursement functions
******************************************/
    $scope.currloc = 'RP ';
    // Initialise collected and disbursed amounts
    $scope.ttlcoled = 0;
    $scope.ttlcol = 0;
    $scope.ttlsave = 0;
    $scope.ttlsaved = 0;
    $scope.ttlinsurance = 0;
    $scope.ttlsaveclient = 0;
    $scope.ttlcolclient = 0;
    $scope.ttldis = 0; //Loan dispense
    $scope.ttldised = 0; //Loan dispense
    $scope.ttldisclient = 0;
    $scope.ttwthdis = 0; //Withdrawal dispense
    $scope.ttwthdised = 0; //Withdrawal dispense
    $scope.ttwthdisclient = 0;
    $scope.totalexpected = 0;
    $scope.villagelist = [];
    $scope.currentVillage = null;
    $scope.allDone = false;
    $scope.selectedCenter = null;
    $scope.centerList = [];
    $scope.tasks = {
        villages: [],
    };
    $scope.todayDay = null; $scope.todayDay = parseInt(moment().day()) + 1;
    $scope.todo = [];
    $scope.qtasks = {
        todo: false,
        eval: false,
        training: false,
        signbyapp: false,
        withdrawal: false,
        test: false,
        deposit:false,
        proposal:false
    };
    $scope.user_name = ''; 
    $scope.user_id = ''; 

    var datea = new Date();


    $scope.getVillages = function(){
        //Get Villages
        var cmd = "select vlm_name, vlm_pk from T_VILLAGE_MASTER, T_CENTER_MASTER WHERE VLM_PK = CTR_VLM_PK AND (CTR_FO_PK ="+USER_PK+" OR VLM_PK IN ( SELECT CLT_VILLAGE FROM T_CLIENT LEFT JOIN T_CLIENT_TRAINING_TMP ON (CTT_CLT_PK = CLT_PK) WHERE CTT_STATUS = 0 ))  GROUP BY VLM_PK ORDER BY VLM_NAME";
        printLog(cmd);
        console.log(cmd)
        myDB.execute(cmd, function(results){
            printLog("villages");
            printLog(results);
            console.log("villages"); 
            console.log(results)
            var vlm_pk = "";
            if(localStorage.getItem('currentVillage') && (localStorage.getItem('currentVillage') !== undefined || localStorage.getItem('currentVillage') !== ""))
                vlm_pk = localStorage.getItem('currentVillage');

            if(results.length===0) return false;

            for(var r in results){

                var vil = {
                    vlm_name: results[r].VLM_NAME,
                    vlm_pk: results[r].VLM_PK,
                    centers:[],
                    todo: [],
                    eval: [],
                    training: [],
                    signbyapp: [],
                    test: [],
                    withdraw: [],
                    deposit: [],
                    proposal:[],
                };
                
                $scope.tasks.villages.push(vil);

                var keypair = { 'name': results[r].VLM_NAME, 'value': results[r].VLM_PK};

                if($scope.villagelist.length === 0 && vlm_pk === ""){

                } else if(vlm_pk !== "" && vlm_pk === results[r].VLM_PK){ 
                    $scope.updateVillage(keypair);
                }

                $scope.villagelist.push(keypair);

            }
            $scope.$apply(function(){
                $scope.checkVillage();
            });
        });
    };

    $scope.loadCenters = function (){

        var cmd = "select CTR_PK, CTR_CENTER_NAME, CTR_VLM_PK, VLM_NAME FROM T_CENTER_MASTER LEFT JOIN T_VILLAGE_MASTER ON (CTR_VLM_PK = VLM_PK) WHERE CTR_FO_PK ="+USER_PK+" AND CTR_MEETING_DATE= "+$scope.todayDay+"  ORDER BY VLM_NAME, CTR_CENTER_NAME";
        myDB.execute(cmd, function(results){
              for(var r in results){
                  $scope.centerList.push(results[r]);
              }
              printLog($scope.centerList);
        });

    };

    $scope.loadCenters();
    $scope.getVillages();

    //calculate on-hand value
    $scope.onHand = function(){
        //printLog("dis "+parseFloat($scope.ttldis));
        //printLog("dissed "+parseFloat($scope.ttldised));
        //printLog("coled "+parseFloat($scope.ttlcoled));
        //printLog("saved "+parseFloat($scope.ttlsaved));
        //printLog("wthdis "+parseFloat($scope.ttwthdis));
        //printLog("wthdissed "+parseFloat($scope.ttwthdised));

        // //printLog(parseFloat($scope.ttldis)+"-"+parseFloat($scope.ttldised)+"+"+parseFloat($scope.ttlsaved)+"+"+parseFloat($scope.ttlcoled)+"+"+parseFloat($scope.ttwthdis)+"-"+parseFloat($scope.ttwthdised));

        $scope.onhand = parseFloat($scope.ttldis)-parseFloat($scope.ttldised)+parseFloat($scope.ttlsaved)+parseFloat($scope.ttlcoled)+parseFloat($scope.ttwthdis)-parseFloat($scope.ttwthdised);

        $scope.onhand = $scope.onhand.toFixed(2);

        //printLog("onhand "+$scope.onhand);

        return $scope.onhand;
    };

    //get CRF
    var crf = (100-sessionStorage.getItem('CLL_CRF_PERCENTAGE'))/100;

    //process the CRS records for today and display them
    $scope.setResults = function(results){

        if(results.length > 0 && results[0].CRS_FLAG === null) return false;

        $.each(results, function(i, record){

            if(record.completed != record.total_crs) $scope.allDone = false;

            var expected = (parseFloat(record.CRS_EXP_CAPITAL_AMT) +  parseFloat(record.CRS_EXP_PROFIT_AMT));

            var actual = (parseFloat(record.CRS_ACT_CAPITAL_AMT) +  parseFloat(record.CRS_ACT_PROFIT_AMT));

            if(record.CRS_ATTENDED === '') $scope.allDone = false;

            if(record.CRS_FLAG=='C'){ //collection record
                if(record.CRS_LOAN_SAVING_FLAG == 'S' || record.CRS_LOAN_SAVING_FLAG == 'X'){
                    $scope.ttlsave += parseFloat(expected);
                    $scope.ttlsaved += parseFloat(actual);

                } else if (record.CRS_LOAN_SAVING_FLAG == 'L'){
                    if ( record.CRS_REF_NO != 'REF'){
                        $scope.ttlcol += parseFloat(expected);
                    }
                    $scope.ttlcoled += parseFloat(actual);
                }
                $scope.ttlsaveclient = record.clientcount;
                $scope.ttlcolclient = record.clientcount;
            }else{
                var disamt = parseFloat(expected);
                var disamted = parseFloat(actual);
                if(record.CRS_FLAG=='D'){
                    $scope.ttldisclient = results.length;
                }

                $scope.ttldis += parseFloat(disamt);
                $scope.ttldised += parseFloat(disamted);
            }
        });

        $scope.totalexpected = parseFloat($scope.ttlsave)+parseFloat($scope.ttlcol);
    };

    $scope.setComSave = function(results){
        //printLog(results);
        var sum = 0;

        $.each(results,function(i,res){

            if(res.LSM_PRM_OPEN_BAL !== 0){
                var perc = res.LSM_PRM_OPEN_BAL;
                perc = perc.replace('%','');
                var exp = parseFloat(res.CLL_ACTUAL_LOAN) / 100  * parseFloat(perc); 
                sum = parseFloat(sum) + parseFloat(exp);
            }

        });

        $scope.ttlsave += sum;
        $scope.totalexpected = parseFloat($scope.ttlsave)+parseFloat($scope.ttlcol);
    };

    $scope.setRanSavings = function(results){
        //printLog("Line 221");
        //printLog(results);
        if(results[0].TTL_RAN_SAVINGS !== null) {
            console.log('ran savings');
            $.each(results,function(i,val){
                console.log(val);
                $scope.ttlsaved += parseFloat(val.TTL_RAN_SAVINGS);
                if(val.PRM_CODE == "22400000") {
                    $scope.ttlinsurance += parseFloat(val.TTL_RAN_SAVINGS);
                }
            });
        }
    };

    $scope.set_IC_Results = function(results){
        // //printLog("rest");
        // //printLog(results);
        var client_arra = [];

        $.each(results, function(i, record){

            //$scope.ttlsave += parseFloat(record.total_collection);
            $scope.ttlsave += 15000;
            if(record.CLT_STATUS == 26){
                //$scope.ttlsaved += parseFloat(record.total_collection);
                $scope.ttlsaved += 15000;
            }

            if(client_arra.length === 0) {
                client_arra.push(record.CLT_PK);
            } else {
                var exists = false;
                $.each(client_arra,function(c,client){
                    if(client === record.CLT_PK){
                        exists = true;
                    }
                });
                if(!exists){
                    client_arra.push(record.CLT_PK);
                }
            }
        });
        ////printLog(client_arra);
        $scope.totalexpected = parseFloat($scope.ttlsave)+parseFloat($scope.ttlcol);
        $scope.ttlsaveclient += client_arra.length;

    };

    $scope.set_W_Results = function(results){
        //printLog(results);
        $.each(results, function(i, record){

        });

    };

    $scope.getOpenBal = function(loan,product){

        var opn_bal = 0;
        ////printLog(product);
        if(product.indexOf('%') == -1){
            opn_bal = parseFloat(product);
        } else {
            var perc = product.replace('%', '');
            //printLog(perc);
            var opn_bal = parseFloat(loan ) * parseFloat(perc) / 100;
            //printLog(loan);
            //printLog(perc);
            //printLog(opn_bal);
        }

        return parseFloat(opn_bal);
    };

    $scope.updateVillage = function(obj){
        // //printLog(obj);
        // //printLog($scope.currentVillage);
        setTimeout(function(){
            $scope.currentVillage = obj;
            $scope.saveCurrent();
            $scope.$apply();
            //$('#currVille1').selectmenu('refresh',true);

        },0);
    };
     
    $scope.updateDashboard = function(){

        printLog("updating dashboard");
        printLog($scope.selectedCenter);
        $scope.resetDashboard();

    };

    $scope.resetDashboard = function(){

        $scope.ttlcoled = 0;
        $scope.ttlcol = 0;
        $scope.ttlsave = 0;
        $scope.ttlsaved = 0;
        $scope.ttlsaveclient = 0;
        $scope.ttlcolclient = 0;
        $scope.ttldis = 0; //Loan dispense
        $scope.ttldised = 0; //Loan dispense
        $scope.ttldisclient = 0;
        $scope.ttwthdis = 0; //Withdrawal dispense
        $scope.ttwthdised = 0; //Withdrawal dispense
        $scope.ttwthdisclient = 0;
        $scope.totalexpected = 0;
        $scope.villagelist = [];
        $scope.currentVillage = null;
        $scope.allDone = true;

        $scope.getC();
        $scope.getRanC();
        $scope.getIC();
        $scope.getD();
        $scope.getComSav();
        $scope.getHR();

        $scope.clientcount = 0;;

    };

    $scope.todaysCRS = localStorage.getItem("TODAYS_CRS_PKS");

    $scope.getC = function(){

        printLog($scope.selectedCenter);

        var centerFilter = "";
        if($scope.selectedCenter !== null){
            centerFilter = ' AND CAST(CLT_CENTER_ID AS INTEGER) = '+$scope.selectedCenter;
        }

        /**
         * 1. before repayment collection 
         * has to use MIN(CRS_COLLECTION_WEEK_NO 
         * To Select repayment client goint to pay.
         * 
         * When there is advanced payment, there will have two unpaid records have the same crs date
         * this is to prevent it getting the future
         * 
         * 
         * 2.  consider if user pay 2 week repayment, actual amount should show include the calculation
         */
        var cmd = `
        SELECT 
            CRS_LOAN_SAVING_FLAG,
            CRS_ACTUAL_WEEK_NO, 
            CRS_REF_NO, 
            CAST(CRS_EXP_CAPITAL_AMT AS UNSIGNED) as CRS_EXP_CAPITAL_AMT, 
            CAST(CRS_EXP_PROFIT_AMT AS UNSIGNED) as CRS_EXP_PROFIT_AMT, 
            CAST(CRS_ACT_CAPITAL_AMT AS UNSIGNED) as CRS_ACT_CAPITAL_AMT,
            CAST(CRS_ACT_PROFIT_AMT AS UNSIGNED) as CRS_ACT_PROFIT_AMT,
            CRS_FLAG,
            CRS_CLT_PK as clientcount,
            CASE CRS_ATTENDED WHEN "" THEN 0 ELSE 1 END  as completed,
            CRS_ATTENDED as total_crs,
            MIN(CRS_ACTUAL_WEEK_NO)
        FROM 
            T_CLIENT_REPAY_SCHEDULE 
        LEFT JOIN 
            T_CLIENT ON (CRS_CLT_PK = CLT_PK) 
        WHERE 
            CRS_FLAG = "C" 
            AND  CRS_DATE = '${date}'
            AND CRS_REF_NO!='REF'
            ${centerFilter}
        GROUP BY
            CRS_CLT_PK, CRS_PRM_LTY_PK
        `

        myDB.execute(cmd, results => {
            let repayLoanCollection = results.filter(a => { return a.CRS_LOAN_SAVING_FLAG === "L"; });
            let repaySavingCollection = results.filter(a => { return a.CRS_LOAN_SAVING_FLAG === "X" || a.CRS_LOAN_SAVING_FLAG === "S"; });
            let sumAllExpectedAmount = (total, current) => {
                var currentExpected = parseFloat(current.CRS_EXP_CAPITAL_AMT) + parseFloat(current.CRS_EXP_PROFIT_AMT);
                return total + currentExpected;
            }; 
            let expectedLoanAmount = repayLoanCollection.reduce(sumAllExpectedAmount, 0);
            let expectedSavingAmount = repaySavingCollection.reduce(sumAllExpectedAmount, 0);
            $scope.ttlcol= expectedLoanAmount
            $scope.ttlsave= expectedSavingAmount 
            });

        let queryAllPaidRepayment = `
        SELECT 
            CRS_LOAN_SAVING_FLAG,
            CRS_ACTUAL_WEEK_NO, 
            CRS_REF_NO, 
            CAST(CRS_EXP_CAPITAL_AMT AS UNSIGNED) as CRS_EXP_CAPITAL_AMT, 
            CAST(CRS_EXP_PROFIT_AMT AS UNSIGNED) as CRS_EXP_PROFIT_AMT, 
            CAST(CRS_ACT_CAPITAL_AMT AS UNSIGNED) as CRS_ACT_CAPITAL_AMT,
            CAST(CRS_ACT_PROFIT_AMT AS UNSIGNED) as CRS_ACT_PROFIT_AMT,
            CRS_FLAG,
            CRS_CLT_PK as clientcount,
            CASE CRS_ATTENDED WHEN "" THEN 0 ELSE 1 END  as completed,
            CRS_ATTENDED as total_crs
        FROM 
            T_CLIENT_REPAY_SCHEDULE 
        LEFT JOIN 
            T_CLIENT ON (CRS_CLT_PK = CLT_PK) 
        WHERE 
            CRS_FLAG = "C" 
            AND CRS_DATE = '${date}'
            AND CRS_ATTENDED!=''
        `

        myDB.execute(queryAllPaidRepayment, results => {
            let repayLoanCollection = results.filter(a => { return a.CRS_LOAN_SAVING_FLAG === "L"; });
            let repaySavingCollection = results.filter(a => { return a.CRS_LOAN_SAVING_FLAG === "X" || a.CRS_LOAN_SAVING_FLAG === "S"; });

            let sumAllActualAmount = (total, current) => {
                var currentActual =
                parseFloat(current.CRS_ACT_CAPITAL_AMT) +
                parseFloat(current.CRS_ACT_PROFIT_AMT);
                return total + currentActual;
            };

            $scope.ttlcoled= repayLoanCollection.reduce(sumAllActualAmount, 0);
            $scope.ttlsaved= repaySavingCollection.reduce(sumAllActualAmount, 0); 
        });

    };

    $scope.getRanC = function(){

        var centerFilter = "";
        if($scope.selectedCenter !== null){
            centerFilter = ' AND CAST(CLT_CENTER_ID AS INTEGER) = '+$scope.selectedCenter;
        }

        var cmd = 'SELECT SUM(CPT_TXN_AMOUNT) AS TTL_RAN_SAVINGS, CPT_PRM_PK, PRM_CODE FROM T_CLIENT_PRD_TXN LEFT JOIN T_CLIENT ON (CPT_CLT_PK = CLT_PK) LEFT JOIN T_PRODUCT_MASTER ON (CPT_PRM_PK = PRM_PK) WHERE DATE(CPT_DATETIME)="'+anotherdate+'" '+centerFilter+' AND CPT_FLAG="C" ';
        myDB.execute(cmd,function(res){
            t.setRanSavings(res);
        });
    };


    $scope.getIC = function(){

        var centerFilter = "";
        if($scope.selectedCenter !== null){
            centerFilter = ' AND CAST(CLT_CENTER_ID AS INTEGER) = '+$scope.selectedCenter;
        }

        var cmd =   ' SELECT CLT_STATUS, CLT_PK,CLL_STATUS '+
                    ' FROM T_CLIENT,T_CLIENT_LOAN '+
                    ' WHERE CLT_PK = CLL_CLT_PK AND CLT_STATUS IN (57,26)  '+
                    centerFilter +
                    ' AND DATE(CLT_TRANING_END_DATE) = "'+anotherdate+'" GROUP BY CLT_PK';

        console.log(cmd);
        myDB.execute(cmd, function(results){
            console.log("get res");
            console.log(results);
            $scope.$apply(function(){
                if(results.length > 0 && results[0].CLT_STATUS !== null){
                    t.set_IC_Results(results);
                }
            });
        });
    };


    $scope.getHR = function(){
        var centerFilter = "";
        if($scope.selectedCenter !== null){
            centerFilter = ' AND CAST(CLT_CENTER_ID AS INTEGER) = '+$scope.selectedCenter;
        }

        var cmd =   ' SELECT CPM_REPAY_PER_WEEK '+
                    ' FROM T_CLIENT '+
                    ' LEFT JOIN T_CLIENT_PRODUCT_MAPPING ON (CLT_PK = CPM_CLT_PK AND CPM_PRM_PK = 77) ' +
                    ' WHERE CLT_STATUS IN (57,26) AND CPM_CHKNEW = 1 '+
                    centerFilter +
                    ' AND DATE(CLT_TRANING_END_DATE) = "'+anotherdate+'" GROUP BY CLT_PK';
        
        myDB.execute(cmd, function(results){
            $scope.$apply(function(){
                console.log('HR');
                console.log(cmd);
                console.log(results);
                if(results.length > 0){
                    for (let p = 0; p < results.length; p++) {
                        const prd = results[p];
                        $scope.ttlsave += parseInt(prd.CPM_REPAY_PER_WEEK);
                        $scope.ttlsaved += parseInt(prd.CPM_REPAY_PER_WEEK);
                    }
                }
            });
        });
    }


    //on page load, run query to get today's collection and disbursements
    $scope.getD = function(){

        var centerFilter = "";
        if($scope.selectedCenter !== null){
            centerFilter = ' AND CAST(CLT_CENTER_ID AS INTEGER) = '+$scope.selectedCenter;
        }

        var cmd = 'SELECT CRS_EXP_CAPITAL_AMT, CRS_EXP_PROFIT_AMT, CRS_ACT_CAPITAL_AMT, CRS_ACT_PROFIT_AMT, CRS_FLAG, CLL_CRF_PERCENTAGE , SUM( CASE CRS_ATTENDED  WHEN   "" THEN 0 ELSE 1 END ) as completed , COUNT(CRS_ATTENDED) as total_crs FROM T_CLIENT LEFT JOIN T_CLIENT_LOAN ON (CLT_PK = CLL_CLT_PK) LEFT JOIN T_CLIENT_REPAY_SCHEDULE ON (CRS_CLL_PK = CLL_PK) WHERE CLL_STATUS IN (12,13,34) '+centerFilter+' AND  CRS_LOAN_SAVING_FLAG = "L" AND CRS_FLAG = "D" AND CRS_DATE = "'+date+'" GROUP BY CLL_PK';
        printLog("COMMAND");
        printLog(cmd);
        myDB.execute(cmd, function(results){
            console.log("line 368");
            console.log(results); 
            $scope.$apply(function(){
                $scope.setResults(results);
            });

        }); //process the results for display
    };
    

    $scope.getComSav = function(){

        var cmd =  'SELECT T_LOAN_SAVING_PRD_MAPPING.*, T_CLIENT_LOAN.CLL_ACTUAL_LOAN, T_CLIENT_LOAN.CLL_PK, T_PRODUCT_MASTER.PRM_DESCRIPTION FROM T_CLIENT_LOAN,T_CLIENT_REPAY_SCHEDULE,T_LOAN_TYPE,T_LOAN_SAVING_PRD_MAPPING,T_PRODUCT_MASTER WHERE LSM_LTY_PK = LTY_PK AND CLL_LTY_PK= LTY_PK AND CRS_CLL_PK = CLL_PK AND CLL_STATUS=13 AND CRS_LOAN_SAVING_FLAG = "L" AND LSM_PRM_PK = PRM_PK AND PRM_CODE != "002.0001" AND LSM_PRM_IS_MANDATORY = "Y" AND CRS_FLAG = "D" AND CRS_DATE = "'+date+'"';
        myDB.execute(cmd,function(results){
            //printLog("383");
            //printLog(results);
            $scope.$apply(function(){
                $scope.setComSave(results);
            });
        });

    };

    

    // $scope.getW = function(){

    //     var anotherdate = new Date();
    //     anotherdate = anotherdate.getFullYear()+"-"+("0"+(anotherdate.getMonth()+1)).slice(-2)+"-"+("0"+anotherdate.getDate()).slice(-2);

    //     var cmd = "SELECT CPT_TXN_AMOUNT FROM T_CLIENT_PRD_TXN WHERE DATE(CPT_DATETIME)='"+anotherdate+"'";

    //     myDB.execute(cmd,function(results){
    //         //printLog(results);
    //         $scope.$apply(function(){
    //             t.set_W(results);
    //         })
    //     })

    // }
    // $scope.getW();

    //get village names to show on TODO list 

    var cmdd = "SELECT CRS_ATTENDED, CRS_FLAG FROM T_CLIENT_REPAY_SCHEDULE,T_CLIENT WHERE CRS_CLT_PK = CLT_PK AND CRS_DATE='"+date+"'  GROUP BY CRS_FLAG,CLT_VILLAGE";

    myDB.execute(cmdd,function(res){});

    let cmd =` 
        Select 
            CLT_PK,
            VLM_NAME,
            VLM_NAME, 
            VLM_PK, 
            COUNT(DISTINCT CLT_PK) as FLAGS, 
            CRS_FLAG,
            CLT_VILLAGE, 
            CLL_STATUS 
        From (
            SELECT 
                *,
                MIN(crs_ACTUAL_WEEK_NO)
            FROM 
                T_CLIENT_REPAY_SCHEDULE
            Inner Join
                T_CLIENT
                On 
                CRS_CLT_PK=CLT_PK 
            Inner Join
                T_CLIENT_LOAN 
                On 
                CRS_CLL_PK=CLL_PK 
            Inner Join 
                T_VILLAGE_MASTER 
                ON 
                VLM_PK=CLT_VILLAGE 
            WHERE 
                CLL_STATUS NOT IN (8,9) 
                AND CRS_FLAG in ('C','D') 
                AND CRS_DATE = '${date}'
            Group by 
                CRS_CLT_PK,CRS_CLL_PK
            ) 
        Where 
            CRS_ATTENDED='' 
            GROUP BY CRS_FLAG, CLT_VILLAGE
    `
  	console.log(cmd);
    myDB.execute(cmd, function(results){
        //printLog(results);
        //printLog("LONE 404"); 
        console.log(results);
        console.log("LINE 404"); 
        $scope.qtasks.todo = true;
        $scope.$apply(function(){
            $scope.todo = results;
            console.log("todo");
            console.log($scope.todo);
        });
    }) 

    $scope.newClientCount = 0;
    myDB.execute("select count(clt_pk) as count from t_client where CLT_MOB_NEW = 1", function(res){
        $scope.newClientCount = res[0].count;
    })

    $scope.getFlag = function(flag){
        switch(flag){
            case 'C': return 'Collection(s)';
            case 'D': return "Disbursement(s)";
        }
    }

    $scope.getTasklist = function(){
        //Retrieve pending evaluations for today
        /*
        #############################################
            EVALUATION NO LONGER MANDATORY
        #############################################
        */
        var newcmd = "SELECT COUNT(DISTINCT CLL_PK) as EVALCOUNT, VLM_PK, VLM_NAME, CLL_CLT_PK, CLT_PK, CLT_VILLAGE   FROM T_CLIENT, T_CLIENT_LOAN, T_LOAN_TYPE, T_VILLAGE_MASTER WHERE CLL_LTY_PK = LTY_PK AND CLL_STATUS IN (13,17,19,59) AND CLL_CLT_PK=CLT_PK AND CLL_DISBURSEMENT_DATE != '"+date+"' AND CLT_VILLAGE=VLM_PK GROUP BY CLT_VILLAGE";
        myDB.execute(newcmd, function(results){
            //printLog(results);
            $scope.qtasks.eval = true;
            if(results.length==0) return false;
            $scope.eval = results;
            $scope.$apply(function(){$scope.eval;});
        });
        //Retrieve pending training completion for today

        t.training = [];
        var training = "SELECT COUNT(DISTINCT CLT_PK) as EVALCOUNT,VLM_PK, VLM_NAME, CLT_PK, CLT_STATUS, CLT_PK, CLT_VILLAGE FROM T_CLIENT, T_VILLAGE_MASTER, T_CLIENT_TRAINING_TMP WHERE CTT_CLT_PK = CLT_PK AND CLT_STATUS IN(4) AND CTT_STATUS=0 AND CLT_VILLAGE=VLM_PK AND DATE(CLT_TRANING_START_DATE) <= '"+anotherdate+"' AND DATE(CLT_TRANING_END_DATE) > '"+anotherdate+"' AND CLT_FO_FOR_TRAINING="+USER_PK+" GROUP BY CLT_VILLAGE";
        printLog(training);
        console.log(training);
        myDB.execute(training, function(results){  
            $scope.qtasks.training = true; 
            if(results.length==0) return false;
            $scope.training = results; 
            $scope.$apply(function(){$scope.training;});
        });

        t.test = [];
        var test = "SELECT COUNT(DISTINCT CLT_PK) as EVALCOUNT,VLM_PK, VLM_NAME, CLT_STATUS, CLT_VILLAGE FROM T_CLIENT, T_VILLAGE_MASTER WHERE CLT_STATUS IN(4) AND  CLT_VILLAGE=VLM_PK AND  DATE(CLT_TRANING_END_DATE) = '"+anotherdate+"' AND CLT_FO_FOR_TRAINING="+USER_PK+" GROUP BY CLT_VILLAGE";
        myDB.execute(test, function(results){
            $scope.qtasks.test = true;
            if(results.length==0) return false;
            $scope.test = results;
            $scope.$apply(function(){$scope.test;});
        });

        t.deposit = [];
        var deposit = "SELECT COUNT(DISTINCT CLT_PK) as EVALCOUNT,VLM_PK, VLM_NAME, CLT_STATUS, CLT_VILLAGE FROM T_CLIENT, T_CLIENT_LOAN, T_VILLAGE_MASTER WHERE CLT_STATUS IN (57,26) AND (CLL_STATUS=3) AND CLL_CLT_PK=CLT_PK AND CLT_VILLAGE=VLM_PK AND DATE(CLT_TRANING_END_DATE) = '"+anotherdate+"' GROUP BY CLT_VILLAGE";
        myDB.execute(deposit, function(results){
            $scope.qtasks.deposit = true;
            if(results.length==0) return false;
            $scope.deposit = results;
            $scope.$apply(function(){$scope.deposit;});
        });

        t.proposal = [];
        var proposal = "SELECT COUNT(DISTINCT CLT_PK) as EVALCOUNT,VLM_PK, VLM_NAME, CLT_STATUS, CLT_VILLAGE FROM T_CLIENT LEFT JOIN T_CLIENT_LOAN ON (CLT_PK == CLL_CLT_PK) LEFT JOIN T_VILLAGE_MASTER ON (CLT_VILLAGE == VLM_PK) WHERE (CLL_STATUS = 67 AND CLT_IS_GROUP_LEADER!='Y' AND DATE(CLT_TRANING_END_DATE) = '"+anotherdate+"') OR (CLL_STATUS IN (67) AND CLT_IS_GROUP_LEADER='Y' AND DATE(CLT_TRANING_END_DATE) != '"+anotherdate+"') AND ( CLL_CENTER_LEAD_PK = '' OR CLL_CENTER_LEAD_PK = 'null' OR CLL_CENTER_LEAD_PK = 0 OR CLL_GROUP_LEAD_PK = '' OR CLL_GROUP_LEAD_PK = 'null' OR CLL_GROUP_LEAD_PK = 0 ) GROUP BY CLT_VILLAGE";
        console.log(proposal);
        myDB.execute(proposal, function(results){
            console.log('proposal');
            console.log(results);
            $scope.qtasks.proposal = true; 
            if(results.length==0) return false;
            $scope.proposal = results;
            $scope.$apply(function(){$scope.proposal;});
        });

        //Retrieve pending confirmation from client for today
        function get_disburse_sign(){
            var deferred = $.Deferred();
            var signbyapp = "SELECT COUNT(DISTINCT CLT_PK) as EVALCOUNT,VLM_PK, VLM_NAME, CLL_CLT_PK, CLT_PK, CLT_VILLAGE,CLL_STATUS FROM T_CLIENT, T_CLIENT_LOAN, T_VILLAGE_MASTER WHERE (CLT_SIGNATURE is NULL OR CLT_SIGNATURE = '') AND  CLL_STATUS = 13 AND CLL_DISBURSEMENT_DATE = '"+date+"' AND CLL_CLT_PK=CLT_PK AND CLT_VILLAGE=VLM_PK GROUP BY CLT_VILLAGE";
            myDB.execute(signbyapp, function(results){
                //printLog("tosign");
                //printLog(signbyapp);
                    //printLog(results);
                if(results.length > 0) {
                    deferred.resolve(results);
                } else {
                    deferred.resolve(null);
                }
            });

            return deferred.promise();
        }

        function get_newclient_sign(){
            var deferred = $.Deferred();
            var signbyapp = "SELECT COUNT(DISTINCT CLT_PK) as EVALCOUNT,VLM_PK, VLM_NAME, DATE(CLT_TRANING_END_DATE) as CLT_DATE, CLL_CLT_PK, CLT_PK, CLT_VILLAGE,CLL_STATUS FROM T_CLIENT, T_CLIENT_LOAN, T_VILLAGE_MASTER WHERE CLT_SIGNATURE is NULL AND CLT_STATUS IN (26,57) AND CLL_STATUS IN (26,57) AND DATE(CLT_TRANING_END_DATE) ='"+anotherdate+"' AND CLL_CLT_PK=CLT_PK AND CLT_VILLAGE=VLM_PK GROUP BY CLT_VILLAGE";
            myDB.execute(signbyapp, function(results){
                //printLog("resta");
                //printLog(results);
                if(results.length > 0) {
                    deferred.resolve(results);
                } else {
                    deferred.resolve(null);
                }
            });
            return deferred.promise();
        }

        t.signbyapp = [];
        var signby_arr = [];

        var disburse_sign   = get_disburse_sign();
        var newclient_sign  = get_newclient_sign();

        $.when(newclient_sign,disburse_sign).done(function(nsr,dsr){

            //printLog("@@@");
            //printLog(nsr);
            //printLog(dsr);

            if(nsr != null){
                $.each(nsr,function(i,val){
                    signby_arr.push(val);
                })
            }
            if(dsr != null){
                $.each(dsr,function(i,val){
                    signby_arr.push(val);
                })
            }

            t.signbyapp = signby_arr;
            $scope.qtasks.signbyapp = true;

            $scope.$apply(function(){t.signbyapp;});

        }) ;


        t.withdrawal = [];

        var another_date =  getDashDate.YMD();

        var withdrawal = "SELECT COUNT(DISTINCT  CPT_PK) as FLAGS,  SUM(CAST(CPT_TXN_AMOUNT AS UNSIGNED)) AS CPT_TXN_AMOUNT, SUM(CAST(CPT_EXP_AMOUNT AS UNSIGNED)) AS CPT_EXP_AMOUNT, CPT_STATUS,CPT_DATETIME, CLT_VILLAGE FROM T_CLIENT_PRD_TXN, T_CLIENT WHERE CPT_CLT_PK = CLT_PK AND CPT_STATUS IN (47,48,58) and CPT_FLAG IN ('D','W') and DATE(CPT_DATETIME)='"+anotherdate+"' GROUP BY CLT_VILLAGE,CPT_STATUS ";
        myDB.execute(withdrawal, function(results){
            ////printLog(results);
            $scope.qtasks.withdrawal = true;
            if(results.length==0 || results[0].CPT_STATUS == null) return false;
            // t.withdrawal = results;

            for(w in t.withdrawal){
                if(t.withdrawal[w].CPT_TXN_AMOUNT == "") t.withdrawal[w].CPT_TXN_AMOUNT = 0;
                if(t.withdrawal[w].CPT_STATUS == 48){
                    t.ttwthdised += parseFloat(t.withdrawal[w].CPT_TXN_AMOUNT);
                } else {
                    t.ttwthdis += parseFloat(t.withdrawal[w].CPT_TXN_AMOUNT);
                }
                $scope.ttwthdisclient +=  parseInt(t.withdrawal[w].FLAGS);
            }

            var tdata = results;
            ////printLog(tdata);
            $scope.ttwthdisclient = 0;
            for(w in tdata){
                ////printLog(tdata[w]);
                if(tdata[w].CPT_TXN_AMOUNT == "") tdata[w].CPT_TXN_AMOUNT = 0;
                if(tdata[w].CPT_STATUS == 48 || tdata[w].CPT_STATUS == 58){
                    t.ttwthdised += parseFloat(tdata[w].CPT_TXN_AMOUNT);
                }
                if(tdata[w].CPT_STATUS != 58){
                    t.ttwthdis += parseFloat(tdata[w].CPT_EXP_AMOUNT);
                }

                $scope.ttwthdisclient +=  parseInt(tdata[w].FLAGS);
            }
            for(w in tdata){
                //tdata[w].FLAGS = $scope.ttwthdisclient;
            }

            t.withdrawal = tdata;

            $scope.$apply(function(){t.withdrawal;t.ttwthdis;t.ttwthdised;});
        });

        var acctclose = "SELECT COUNT (DISTINCT CLT_PK) AS FLAG , CPC_DISBURSE_AMT, CPC_STATUS, DATE(CPC_DISBURSE_DATE), CLT_VILLAGE FROM T_CLIENT_PRODUCT_CLOSE_INFO,T_CLIENT, T_CLIENT_LOAN WHERE CPC_CLL_PK = CLL_PK AND CLL_CLT_PK = CLT_PK AND CPC_STATUS NOT IN  (53,25) AND DATE(CPC_DISBURSE_DATE) = '"+another_date+"' GROUP BY CLT_VILLAGE";
        myDB.execute(acctclose, function(results){
            //printLog(results);
            $scope.qtasks.withdrawal = true;
            if(results.length == 0 ){
                return false;
            }

            var tdata = [];

            for(ac in results){
                t.ttwthdis += parseFloat(results[ac].CPC_DISBURSE_AMT);
                $scope.ttwthdisclient = parseInt($scope.ttwthdisclient) + 1;
                if(results[ac].CPC_STATUS==55){
                    t.ttwthdised += parseFloat(results[ac].CPC_DISBURSE_AMT);
                }

                var key = {
                    FLAGS : results[ac].FLAG,
                    CPT_TXN_AMOUNT : 0,
                    CPT_EXP_AMOUNT : 0,
                    CPT_STATUS: 0,
                    CPT_DATETIME : null,
                    CPC_STATUS : results[ac].CPC_STATUS,
                    CLT_VILLAGE : results[ac].CLT_VILLAGE
                }

                tdata.push(key);

            }

            t.withdrawal = tdata;

            $scope.$apply(function(){t.withdrawal;t.ttwthdis;t.ttwthdised;});
        });

    } 
    $scope.checkVillage = function(){
        //Watch for Tasks
        $scope.$watchGroup(['todo','eval','training','signbyapp', 'test','withdrawal','deposit','proposal'], function(newValues, oldValues, scope){
            var updTodo = false;
            var updEval = false;
            var updTrain = false;
            var updSign = false;
            var updTest = false;
            var updWithdraw = false;
            var updeposit = false;
            var updProposal = false;

            for(v in $scope.tasks.villages){
                //Collections

                var isNew = false;

                if(newValues[0] && newValues[0] != null){
                    updTodo = true;
                    var todos = newValues[0];
                    //printLog("todos");
                    //printLog(todos);
                    $scope.tasks.villages[v].todo = [];
                    for(to in todos){
                        var proceed = true;
                        if(todos[to].CRS_FLAG =='D'){
                            if(todos[to].CLL_STATUS != 12){
                                proceed = false; 
                            }
                        }
                         
                        if(proceed){ 
                            console.log("todo="+todos[to].VLM_PK+"  vlm_pk="+$scope.tasks.villages[v].vlm_pk)
                            if(todos[to].VLM_PK === $scope.tasks.villages[v].vlm_pk){
                                console.log("same")
                                $scope.tasks.villages[v].todo.push(todos[to]);
                                isNew = true;
                            }
                        }
                    }
                }
                //Evaluations
                if(newValues[1] && newValues[1] != null){
                    updEval = true;
                    var evals = newValues[1];
                    $scope.tasks.villages[v].eval = [];
                    for(e in evals){
                        if(evals[e].VLM_NAME === $scope.tasks.villages[v].vlm_name){
                            $scope.tasks.villages[v].eval.push(evals[e]);
                            isNew = true;
                        }
                    }
                } 
                //Training
                if(newValues[2] && newValues[2] != null){

                    updTrain = true;
                    var trainings = newValues[2];
                    $scope.tasks.villages[v].training = [];
                    for(t in trainings){
                        if(trainings[t].VLM_NAME === $scope.tasks.villages[v].vlm_name){
                            $scope.tasks.villages[v].training.push(trainings[t]);
                            isNew = true;
                        }
                    }
                }
                //Signing
                if(newValues[3] && newValues[3].length != 0){
                    updSign = true;
                    var signings = newValues[3];
                    $scope.tasks.villages[v].signbyapp = [];
                    for(s in signings){
                        if(signings[s].VLM_NAME === $scope.tasks.villages[v].vlm_name){
                            $scope.tasks.villages[v].signbyapp.push(signings[s]);
                            isNew = true;
                        }
                    }
                }
                //TEST
                if(newValues[4] && newValues[4].length != 0){
                    updSign = true;
                    var tests = newValues[4];
                    //printLog(tests);
                    //printLog("testt");
                    $scope.tasks.villages[v].test = [];
                    for(s in tests){
                        if(tests[s].VLM_NAME === $scope.tasks.villages[v].vlm_name){
                            $scope.tasks.villages[v].test.push(tests[s]);
                            isNew = true;
                        }
                    }
                }

                //WITHDRAW
                if(newValues[5] && newValues[5].length != 0){

                    updWithdraw = true;
                    var withdraw = newValues[5];

                    $scope.tasks.villages[v].withdraw = [];
                    for(s in withdraw){
                        //printLog(withdraw[s]);
                        if(withdraw[s].CLT_VILLAGE === $scope.tasks.villages[v].vlm_pk && withdraw[s].CPT_STATUS == 47){
                            $scope.tasks.villages[v].withdraw.push(withdraw[s]);
                            isNew = true;
                        }
                        if(withdraw[s].CLT_VILLAGE === $scope.tasks.villages[v].vlm_pk && withdraw[s].CPC_STATUS != undefined &&  withdraw[s].CPC_STATUS == 3){
                            $scope.tasks.villages[v].withdraw.push(withdraw[s]);
                            isNew = true;
                        }
                    }
                }

                //Deposit
                if(newValues[6] && newValues[6].length != 0){
                    updeposit = true;
                    var deposit = newValues[6];

                    $scope.tasks.villages[v].deposit = [];
                    for(s in deposit){
                        if(deposit[s].CLT_VILLAGE === $scope.tasks.villages[v].vlm_pk){
                            $scope.tasks.villages[v].deposit.push(deposit[s]);
                            isNew = true;
                        }
                    }
                }

                //Proposal
                if(newValues[7] && newValues[7].length != 0){
                    updProposal = true;
                    var proposal = newValues[7]; 

                    $scope.tasks.villages[v].proposal = [];
                    for(s in proposal){
                        if(proposal[s].CLT_VILLAGE === $scope.tasks.villages[v].vlm_pk){
                            $scope.tasks.villages[v].proposal.push(proposal[s]);
                            isNew = true;
                        }
                    }
                }

                // if(updTodo || updEval || updTrain || updSign){
                //     $timeout(function() {
                //         if($scope.currentVillage==null){
                //             var keypair = { 'name': $scope.tasks.villages[v].vlm_name, 'value': $scope.tasks.villages[v].vlm_pk};
                //             $scope.updateVillage(keypair);
                //         }
                //         $scope.$apply();
                //     }, 100);
                // }

                if(isNew && localStorage.getItem('currentVillage') == null){
                    localStorage.setItem('currentVillage',$scope.tasks.villages[v].vlm_pk);
                    localStorage.setItem('curr_village',$scope.tasks.villages[v].vlm_pk);
                }
            }
 
            if( newValues[0] != oldValues[0]||
                // newValues[1] != oldValues[1]||
                newValues[2] != oldValues[2]||
                newValues[3] != oldValues[3]||
                newValues[4] != oldValues[4]||
                newValues[5] != oldValues[5]||
                newValues[6] != oldValues[6]||
                newValues[7] != oldValues[7]){
                $scope.checkVillage();
            }
        });
    } 

    $scope.checkAllQs = function(){

        $scope.$watchGroup(['qtasks.todo','qtasks.eval','qtasks.training','qtasks.signbyapp','qtasks.withdrawal', 'qtasks.test', 'qtasks.deposit','qtasks.proposal'], function(newValues, oldValues, scope){
            if( newValues[0] != oldValues[0]||
                // newValues[1] != oldValues[1]||
                newValues[2] != oldValues[2]||
                newValues[3] != oldValues[3]||
                newValues[4] != oldValues[4]||
                newValues[5] != oldValues[5]||
                newValues[6] != oldValues[6]||
                newValues[7] != oldValues[7]){

                if( newValues[0] == true &&
                    // newValues[1] == true &&
                    newValues[2] == true &&
                    newValues[3] == true &&
                    newValues[4] == true &&
                    newValues[5] == true &&
                    newValues[6] == true &&
                    newValues[7] == true){

                    // if($scope.currentVillage==null){
                    //     var keypair = { 'name': $scope.tasks.villages[v].vlm_name, 'value': $scope.tasks.villages[v].vlm_pk};
                    //     $scope.updateVillage(keypair);
                    // }

                    $scope.checkIsTaskCompleted();
                } else {
                    $scope.checkAllQs();
                }
            }
        });
    }


    $scope.checkVilActivity = function(village){ 
        if(village.todo.length > 0 || village.proposal.length > 0 || village.eval.length > 0 || village.training.length > 0 || village.signbyapp.length > 0 || village.test.length > 0 || village.withdraw.length > 0 || village.deposit.length > 0){
            return true;
        } else {
            return false;
        }
    }

    $scope.checkIsTaskCompleted = function(){
        printLog("checking");
        var ville = $scope.tasks.villages;
        var allDone = true; 
        if(ville.length == 0){
            setTimeout(function(){
                $scope.allDone = allDone;
                $('.aniview').AniView();
                $scope.$apply();
            },150);
            return false;
        }

        $.each(ville, function(i, record){
            // printLog("857");
            // printLog(record);
            $.each(record,function(ind,tasks){
                if(/*ind=="eval"||*/ind=="training"||ind=="todo"||ind=="signbyapp"||ind=="test"||ind=="withdraw"||ind=="deposit"||ind=="proposal"){
                    printLog(ind+" "+tasks.length);
                    if(tasks.length > 0){
                        allDone = false;
                    }
                }

            });
        });

        setTimeout(function(){
            $scope.allDone = allDone;
            $('.aniview').AniView();
            $scope.$apply();
        },150);

        return allDone;
    }

    $scope.saveCurrent = function(){

        if($scope.currentVillage != "" || $scope.currentVillage != null){
            // Removed at Logout
            //printLog($scope.currentVillage);
            localStorage.setItem('currentVillage',$scope.currentVillage.value);
            localStorage.setItem('curr_village',$scope.currentVillage.value);
            localStorage.setItem('statType',$scope.currentVillage.value);

            localStorage.setItem('currentVillage_name',$scope.currentVillage.name);

            //printLog(localStorage.getItem('curr_village'));
        }
    } 

    $scope.getUserName = function () {
        myDB.execute(
            "SELECT user_id, user_name FROM t_user  WHERE user_pk = '" + USER_PK + "'",
            function(results) {
                if(results.length===0){
                    return 
                }
                console.log('getuser');
                console.log(results);
                $scope.user_id = results[0].USER_ID;
                $scope.user_name = results[0].USER_NAME; 
            }
        );
    }

    
    $scope.getC();
    $scope.getRanC();
    $scope.getIC();
    $scope.getHR();
    $scope.getD();
    $scope.getComSav();
    $scope.getTasklist();
    $scope.checkAllQs(); 
    $scope.getUserName();
}]);

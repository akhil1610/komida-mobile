/******************************************
//Prepare the  UI
******************************************/
function init(){

    initTemplate.load(1); //load header

    $("select").each(function(){ //change select menu
        $(this).closest('.ui-btn').css('background-color','#80C6C7');
        $(this).closest('.ui-btn').css('color','#fff');
        $(this).closest('.ui-btn').css('text-shadow','0 0 0 #fff');
    });

    $(".back").each(function(){ //append a back button for detailed group view page
        $(this).prepend('<a href="#page" style="margin-left:1em;" class="left ui-btn ui-btn-g ui-corner-all ui-icon-carat-l ui-btn-icon-left ui-btn-inline" data-i18n="buttons.Back">Back</a>');
    });
};

/******************************************
    //Global variables
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

var CMP_SMS_FORMAT      = sessionStorage.getItem("CMP_SMS_FORMAT");
var CMP_RECEIPT_FORMAT  = sessionStorage.getItem("CMP_RECEIPT_FORMAT");
var CMP_SMS_LABEL       = sessionStorage.getItem("CMP_SMS_LABEL");
var CMP_RECEIPT_LABEL   = sessionStorage.getItem("CMP_RECEIPT_LABEL");
var SMS_OR_RECEIPT      = sessionStorage.getItem("SMS_OR_RECEIPT");

var msg_separator       = '@@@@prodigy@@@@';

var SMS_RCP_CODE        = ['DT','FONM','FOID','BR','BRID','CLNM','CLID','INSTNO','AMT'];

//BEFORE PRODUCTION FIND AND REMOVE ALL LINES TAGGED WITH = !REMOVE

/******************************************
//Controller
******************************************/
//Temp modification;
//CMP_RECEIPT_FORMAT += ",CLNM , CLID, INSTNO, AMT, SAV"; //!remove in production



var myApp = angular.module('myApp',['ng-currency', 'pascalprecht.translate']);

myApp.config(function ($translateProvider) {

     $translateProvider.useStaticFilesLoader({
        prefix: "locales/locale-",
        suffix: ".json"
    });

    $translateProvider.preferredLanguage(ln.language.code);

});


angular.module('myApp').filter('ifEmpty', function() {
    return function(input, defaultValue) {
        if (angular.isUndefined(input) || input === null || input === '') {
            return defaultValue;
        }

        return input;
    }
});



myApp.controller('TransactionsCtrl', function($scope, $filter, $timeout, $compile){

    

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
        hasSigned: USER_SIGNED
    };


    $scope.centerlistControl = {};
    $scope.centers = [];
    $scope.selectedCenter = null;

    $scope.witnesses = [];

    $scope.MGR = {
        mgrpk: MGR_PK,
        mgrname: MGR_NAME,
        mgrhavesig: MGR_HAVE_SIG,
        hasSigned: MGR_SIGNED,
        Signature: MGR_SIG
    };
    $scope.ctr_lead = {
          ctr_lead_pk: null,
          ctr_lead_name: null,
          Signature: null,
          hasSigned : false,
          ctr_leaders: []
    };
  
    $scope.showSign = false;
    $scope.signingclientIndex = null;
    $scope.signinguser = null;

    $scope.clients = [];

    $scope.currentVillage= null;
    $scope.curr_village = null;
    $scope.selectVillage = [];

    $scope.groups = [];

    $scope.currloc = '';
    $scope.BRC_DISBURSE_NOTIFICATION = sessionStorage.getItem("SMS_OR_RECEIPT");
    $scope.bpmproducts=[];
    $scope.withdrawals = [];
    $scope.isLoanTable = true;
    $scope.isGroupSelected = false;
    $scope.maxPrdTxn_CPT_PK = 0;
    $scope.clientspage = 1;
    $scope.currentVillage = localStorage.getItem('currentVillage_name');
    $scope.groups = [];
    $scope.village = {
        groups: []
    };
 
    if(sessionStorage.getItem("MGR_PK") == 'null'){

        sessionStorage.setItem("redirect_page",'downpayment.html');

        alert(sessionStorage.getItem('redirect_page'));

        window.location.href = "managerlogin.html";
        return false;
    }
  
    $scope.updateVillage = function(obj){
        var keypair = { 'name': obj.value, 'value': obj.value  };
        
        $scope.currentVillage = obj.name;
        setTimeout(function(){
            $scope.$apply();
            $scope.loadGroup();
            $scope.taskUpd = 1;
        },100);

    }

    $scope.loadVillages = function(){
        /******************************************
         Display village names
        ******************************************/

        var currVille = 0;
        if(localStorage.getItem('currentVillage') != null){
            currVille = localStorage.getItem('currentVillage');
        }

        //console.log(currVille);

        myDB.execute("select * from T_VILLAGE_MASTER", function(results){

                $scope.user.selectVillage = [];
                for(var k in results){

                    var keypair = {'name': results[k].VLM_NAME,'value': results[k].VLM_PK};

                    $scope.selectVillage.push(keypair);

                    if(currVille!=null && currVille!= undefined && currVille == results[k].VLM_PK){
                        $scope.curr_village = keypair;
                        $scope.village = keypair;
                        $scope.village.groups = [];
                    }

                    var cnt = parseInt(k) + parseInt(1); 
                    if(results.length === cnt){
                        setTimeout(function(){
                            $scope.viilletotal();
                            $scope.loadGroup();
                        },50);
                    }

                }
        });
    }

    var date = new Date();
    date = ("0"+date.getDate()).slice(-2)+"/"+("0"+(date.getMonth()+1)).slice(-2)+"/"+date.getFullYear();

    var anotherdate = new Date();
    anotherdate = anotherdate.getFullYear()+"-"+("0"+(anotherdate.getMonth()+1)).slice(-2)+"-"+("0"+anotherdate.getDate()).slice(-2);


    $scope.loadGroup = function(){
        return false;
        console.log("loading group");
        //Translations dont seems to work with ng-repeat in html, thus resulted in this method

        $scope.request = i18n.t("messages.Request");
        $scope.expected = i18n.t("messages.Expected");
        $scope.loanamt = i18n.t("messages.LoanAmt");
        $scope.grouptext = i18n.t("messages.Group");
        $scope.weektext = i18n.t("messages.Week");
        $scope.weektext = i18n.t("messages.Week");
        $scope.producttext = i18n.t("messages.Product");
        $scope.deposittext = i18n.t("messages.DepositAmt");


        var date = new Date();
        date = date.getFullYear()+"-"+("0"+(date.getMonth()+1)).slice(-2)+"-"+("0"+date.getDate()).slice(-2);

        //RESET GROUPS DATA
        $scope.groups = [];
        $scope.village.groups = [];

        setTimeout(function(){
            // var cmd1 =  " SELECT distinct CLL_GROUP_ID,cll_clt_pk,clt_village,vlm_name ";
            //     cmd1 += " FROM T_CLIENT_LOAN,t_client,T_VILLAGE_MASTER ";
            //     cmd1 += " WHERE clt_traning_completed='Y' ";
            //     cmd1 += " and cll_status > 11";
            //     cmd1 += " and clt_pk = cll_clt_pk and CLL_IS_GROUP_LEADER='Y' ";
            //     cmd1 += " and vlm_pk = clt_village ";
            //     cmd1 += " and DATE(clt_traning_end_date) !='"+date+"'" ;
            //     cmd1 += " and clt_village="+$scope.curr_village.value;
 
            var cmd =   " SELECT distinct CLT_GROUP_ID,clt_village,vlm_name, COUNT( DISTINCT T_CLIENT.CLT_PK) as clientcount ";
                cmd +=  " FROM T_CLIENT,T_CLIENT_LOAN,T_VILLAGE_MASTER ";
                cmd +=  " WHERE CLT_STATUS IN (57,26) AND CLL_STATUS IN (57,26,64)";
                cmd +=  " AND clt_village = VLM_PK AND CLT_PK = CLL_CLT_PK ";
                cmd +=  " AND DATE(CLT_TRANING_END_DATE) = '"+anotherdate+"'";
                cmd +=  " AND clt_village="+$scope.curr_village.value;
                cmd +=  " GROUP BY CLT_GROUP_ID, CLT_PK ";

            //retrieve all the groups that are tagged to the user
            myDB.execute(cmd, function(results){
                console.log(results);
                if(results.length<=0) {

                }else{

                    for(k in results){
                        $scope.groups.push(results[k]);
                        var cnt = parseInt(k) + 1;
                        if(results.length === cnt){
                           $scope.$apply(function(){
                            $scope.groups;
                           })
                        }
                    }
                }
            });
        },0);
    }

    $scope.totalcliencount = 0;
    $scope.viilletotal = function(){


        var cmd =   " SELECT *, DATE(CLT_TRANING_END_DATE) as TEST_DATE FROM T_CLIENT, T_CENTER_MASTER ";
            cmd +=  " WHERE CLT_VILLAGE="+ $scope.curr_village.value;
            cmd +=  " AND CTR_PK = CLT_CENTER_ID AND CTR_VLM_PK = CLT_VILLAGE ";
            cmd +=  " AND DATE(CLT_TRANING_END_DATE) = '"+anotherdate+"'";

        myDB.execute(cmd, function(results){
            $scope.totalcliencount = results.length;
            // console.log("LINE 316");
            // console.log(results);
            if(results.length > 0) {
                $.each(results, function(ind,val){

                    var client = [];

                    for(key in val){
                        client[key] = val[key];
                        if(key == 'CLT_CENTER_ID'){
                            client['CLT_CENTER_ID'] = parseInt(val['CLT_CENTER_ID']);
                        }
                    }

                    if(client.CLT_STATUS == 4){
                        client.testpassed = false;
                    } else {
                        client.testpassed = true;
                    }

                    client.loans = [];
                    client.hasSigned = false;


                    var isLast = false;
                    var cnt = parseInt(ind) + 1;
                    if(results.length == cnt) isLast = true;

                    $scope.villetotaleSecond(client,isLast);

                });

            }
        });

    }
    $scope.villetotaleSecond = function(client,isLast){
        console.log("second ");
        var cmd1 =      " SELECT T_CLIENT_LOAN.* , T_LOAN_TYPE.LTY_DESCRIPTION ";
            cmd1 +=     " FROM T_CLIENT_LOAN, T_LOAN_TYPE ";
            cmd1 +=     " WHERE CLL_LTY_PK = LTY_PK AND CLL_CLT_PK ="+client.CLT_PK;
            cmd1 +=     " GROUP BY CLL_CLT_PK ";

        myDB.execute(cmd1, function(loans){
            //console.log(loans);
            $.each(loans,function(lidx,loan){
                loan.isOpen = false;
                client.loans.push(loan);
                var cnt = parseInt(lidx) + 1;
                if(loans.length === cnt){
                    $scope.villetotalethird(client,isLast);
                }
            });
        });
    }
    $scope.villetotalethird = function(client,isLast){

        console.log("client is "+client.CLT_FULL_NAME);
        client.products = [];

       var cmd1 =      " SELECT *, T_PRODUCT_MASTER.PRM_NAME, T_CLIENT_PRODUCT_MAPPING.CPM_PK ";
            cmd1 +=     " FROM T_PRODUCT_MASTER, T_CLIENT_PRODUCT_MAPPING,T_COMPANY ";
            cmd1 +=     " WHERE CPM_CLT_PK = "+client.CLT_PK;
            cmd1 +=     " AND PRM_CMP_PK = CMP_PK";
            cmd1 +=     " AND PRM_CODE IN ('002.0001','002.0003','002.0005') AND PRM_PK = CPM_PRM_PK ";
            //console.log(cmd1);
        myDB.execute(cmd1, function(results){
            //console.log("dddddddddddddddddd");
            //console.log(results);

            $.each(results,function(i,row){

                row.openingbal = $scope.getOpenBal(client,row);

                client.products.push(row);
                var acnt = parseInt(i) + 1;
                if( results.length == acnt){
                    //console.log('done'+" "+client.CLT_FULL_NAME);
                    $scope.addToCenter(client);
                    $scope.clients.push(client);
                    $scope.$apply();
                }
            }); 
        });
    }

    $scope.selectGroup = function(client){
        if($scope.witnesses.length == 0) {
            $scope.witnesses = $filter('filter')($scope.clients, { CLT_GROUP_ID: $scope.selectedGroup });
        } else {
            $scope.resetSelection();
        } 
    }

    $scope.resetSelection = function(){ 
        $scope.witnesses = [];
    };
 
    $scope.changeGroup = function(group){

        console.log(group);
        var keypair = { 'name': group.VLM_NAME, 'value': group.CLT_GROUP_ID, 'centerid': group.CLT_CENTER_ID} ;
        
        $scope.selectedGroup = group.CLT_GROUP_ID; 
        ////console.log( keypair );
        //$("html, body").animate({ scrollTop: 0 }, 600);
    }

    $scope.getClientCompleted = function(group){

        var completed = 0;
        var clients = $filter('filter')($scope.clients, { CLT_GROUP_ID: $scope.selectedGroup });
        $.each(clients,function(c,client){
            if(client.CLL_CRF_AMOUNT != 1){
                completed++;
            }
        });

        return completed;
    }

    $scope.loadClients = function(){

        $scope.request = i18n.t("messages.Request");
        $scope.expected = i18n.t("messages.Expected");
        $scope.actual = i18n.t("messages.Actual");
        $scope.grouptext = i18n.t("messages.Group");
        $scope.weektext = i18n.t("messages.Week");
        $scope.overviewtext = i18n.t("messages.Overview");

        var cmd = "SELECT * FROM T_CLIENT LEFT JOIN T_CLIENT_LOAN ON (CLT_PK = CLL_CLT_PK) LEFT JOIN T_LOAN_TYPE ON (CLL_LTY_PK = LTY_PK) LEFT JOIN T_CENTER_MASTER ON (CLT_CENTER_ID = CTR_PK) WHERE CLL_STATUS=13";
        myDB.execute(cmd,function(result){
            console.log(result);
            $.each(result,function(i,client){
                var center_exists = false;
                var group_exists = false;
                var ckey = { CTR_CENTER_NAME: client.CTR_CENTER_NAME, CTR_CENTER_ID: client.CLT_CENTER_ID, SELECTED: false, CTR_CENTER_CODE: client.CTR_CENTER_ID };
                var gkey = { CTR_CENTER_NAME: client.CTR_CENTER_NAME, CLT_GROUP_ID: client.CLT_GROUP_ID, CTR_CENTER_ID: client.CLT_CENTER_ID, clientcount: 1 };
                $.each($scope.centers, function(c,center){
                    if(center.CTR_CENTER_NAME == client.CTR_CENTER_NAME){
                        center_exists = true;
                    } 
                }); 
                $.each($scope.groups, function(g,group){
                    if(group.CLT_GROUP_ID == client.CLT_GROUP_ID){
                        group_exists = true;
                        group.clientcount++;
                    } 
                });
                if(!center_exists) {
                    if($scope.centers.length === 0) {
                        ckey.SELECTED = true;
                        $scope.selectedCenter = ckey;
                    } 
                    $scope.centers.push(ckey); 
                }
                if(!group_exists) {
                    if($scope.groups.length === 0) { 
                        $scope.selectedGroup = gkey;
                    } 
                    $scope.groups.push(gkey); 
                }
                $scope.clients.push(client);
            });
            $scope.$apply();
            console.log($scope.centers);
            console.log($scope.groups);
        });  
    }

    $scope.loadClients();

    $scope.detailview = function(back){

        if(back === undefined){
            back = 1;
        } else {
            back = -1;
        }

        $scope.clientspage = parseInt($scope.clientspage + back*1);
        if($scope.clientspage > 2) $scope.clientspage = 1;
        //console.log($scope.clientspage);

        if($scope.clientspage == 1){
            $('.first-page').fadeIn();
            $('.second-page').show();
            $('.third-page').hide();

            $('.second-wrapper').hide();
            $('.third-wrapper').show();

        } else if($scope.clientspage == 2) {

            $('.first-page').hide();
            $('.second-page').fadeOut();
            $('.third-page').hide();

            $('.second-wrapper').show();
            $('.third-wrapper').hide();


        } else if($scope.clientspage == 3) {

            $('.first-page').hide();
            $('.second-page').hide();
            $('.thir-page').fadeOut();

            $('.second-wrapper').hide();
            $('.third-wrapper').show();
        }
    }
 
    $scope.allDone = function(){
        var allDone = false;

        if($scope.clients.length == 0 || $scope.selectedGroup == null) return false;


        var group = $filter('filter')($scope.groups, { CLT_GROUP_ID: $scope.selectedGroup.value })[0];

        if(group.clientcount == $scope.getClientCompleted(group) ){
            allDone = true;
        }

        return allDone;
    }

    $scope.groupCompleted =function(group){

        var allDone = false;

        if(group.clientcount == $scope.getClientCompleted(group) ){
            allDone = true;
        }

        return allDone;
    }

    $scope.checkAllSigDone = function(group){

        var clients = $filter('filter')($scope.clients, { CLT_GROUP_ID: group.CLT_GROUP_ID});
        var done = true;
        $.each(clients,function(i,client){
            //console.log(client);
            if( (client.CLT_SIGNATURE == '' || client.CLT_SIGNATURE == null) && client.CLT_STATUS == 26) done = false;
        });

        return done;

    }
  
    $scope.showSignscreen = function(ind, type){

        console.log("showing signature pad "+ind + " type is "+type);

        type = typeof type !== 'undefined' ? type : null;

        var clients = $filter('filter')($scope.clients, { CLT_GROUP_ID: $scope.selectedGroup.value });

        if(!$scope.showSign){
            $scope.showSign = true;
            setTimeout(function(){
                if(type == null){
                    $scope.signingclientIndex = ind;
                    var client = clients[ind];
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
        } else if (type == 'ctr_lead') {
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
        } else if (type == 'ctr_lead'){
                var dsrc = atob($scope.ctr_lead.Signature);

                var img2 = new Image();
                img2.onload = (function(){
                    var canv = $('#the-canvas-'+$scope.ctr_lead.ctr_lead_pk)[0];
                    var cont = canv.getContext("2d");
                    cont.drawImage(img2,0,0,300,150);
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

        var clients = $filter('filter')($scope.clients, { CLT_GROUP_ID: $scope.selectedGroup.value });

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
                var client = clients[$scope.signingclientIndex];
                //console.log(client);
                var canv = $('#the-canvas-'+client.CLT_PK)[0];
                $scope.$apply(function(){
                    client.hasSigned = true;
                    client.CLT_SIGNATURE = blob;
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
            }   else if ($scope.signinguser === 'ctr_lead'){
                var canv = $('#the-canvas-ctr_lead')[0];
            
                var cmd1 = "UPDATE T_CLIENT SET CLT_SIGNATURE ='"+blob+"' WHERE CLT_PK = "+$scope.ctr_lead.ctr_lead_pk;
                myDB.execute(cmd1,function(res){
                    var cmd2 = "UPDATE "
                });

                $scope.$apply(function(){
                    $scope.ctr_lead.hasSigned = true;
                    $scope.ctr_lead.Signature = blob;
                })
            }

            $scope.clearSigPad();
            var cont = canv.getContext("2d");
            cont.drawImage(img2, 0, 0, 200, 100);

            $scope.showSign = false;

            $('html, body').animate({
                scrollTop: $("#client-signatures").offset().top - 90
            }, 500);

            $scope.checkAllDone();
            $scope.$apply();
        });

        img2.src = dsrc;
    }

    $scope.checkAllDone = function(){

        var alldone = false;
 

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

    $scope.getUserSignature();
    if($scope.MGR.Signature != null && $scope.MGR.Signature != ''){
        $scope.MGR.hasSigned = true;
        $scope.showSignature('mgr');
    }

    $scope.loadVillages(); 

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
/******************************************
// Load client's photograph
******************************************/
function loadNCADphoto(){

    $(".ncadPhoto").each(function(){
        $(this).width(250).height($(this).width()*1.25);
    });

    var loadcount = 0;
    var loadPicture = setInterval(function(){
        //console.log("Searching");
        loadcount++;
        if(!devtest&&window.requestFileSystem){ //clientid
            clearInterval(loadPicture);
                fileManager = new fm();
                    try{
                    var promise = fileManager.read("photo"+clientid+".dataurl");
                    promise.done(function(result){
                        $("#ncadPhoto").attr("src",result);
                    });
                    }catch(e){alert(e.message);};
        }
        if(loadcount>=5){
            clearInterval(loadPicture);
            //console.log("Giving up");
        }
    }, 1000);
}
$(document).ready(function(){
    $(this).on('click','.closepop i', function(){
        $('.coverwrap ').html('');
        $('.whitecover').fadeOut();
    });


    $(document).on('click','.mini-header', function(){

        var clicked = $(this);
        $('.mini-header').removeClass('selected');
        $('.mini-header .btm-bar').remove();
        clicked.addClass('selected');
        clicked.append('<div class="btm-bar"></div>');
        $('.mini-client-details').hide();
        $(clicked.attr('href')).fadeIn();

    });
});

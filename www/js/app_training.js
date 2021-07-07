/******************************************
//Prepare the  UI
******************************************/
$.fn.extend({
    animateCss: function (animationName) {
        var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
        this.addClass('animated ' + animationName).one(animationEnd, function() {
            $(this).removeClass('animated ' + animationName);
        });
    }
});
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
}



/******************************************
//Global variables
******************************************/

var USER_PK             = sessionStorage.getItem("USER_PK");
var USER_NAME           = sessionStorage.getItem("USER_NAME");
var USER_HAVE_SIG       = sessionStorage.getItem("USER_HAVE_SIG");
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
    };
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
        hasSigned: USER_SIGNED,
        currentVillage: null,
        Signature: null
    };

    $scope.grouptext = i18n.t("messages.Group");
    $scope.rescheduletrainingtext = i18n.t("messages.RescheduleTrainingCenter");
    $scope.request = i18n.t("messages.Request");
    $scope.expected = i18n.t("messages.Expected");
    $scope.loanamt = i18n.t("messages.LoanAmt");
    $scope.grouptext = i18n.t("messages.Group");
    $scope.weektext = i18n.t("messages.Week");
    $scope.weektext = i18n.t("messages.Week");
    $scope.producttext = i18n.t("messages.Product");
    $scope.deposittext = i18n.t("messages.DepositAmt");
    $scope.conductedtext = i18n.t("messages.Conducted");
    $scope.disbandtext = i18n.t("messages.Disband");
    $scope.passtext = i18n.t("messages.Pass");

    //console.log($scope.user.hasSigned);
    $scope.centers = [];
    $scope.selectedCenter = null;

    $scope.MGR = {
        mgrpk: MGR_PK,
        mgrname: MGR_NAME,
        mgrhavesig: MGR_HAVE_SIG,
        hasSigned: MGR_SIGNED,
        Signature: MGR_SIG
    };

    $scope.showSign = false;
    $scope.signingclientIndex = null;
    $scope.signinguser = null;

    $scope.selectedGroup = {
        name: null,
        value: null
    };

    $scope.clients = [];

    $scope.currentVillage= null;
    $scope.curr_village = null;
    $scope.selectVillage = [];

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

    $scope.updateVillage = function(obj){
        var keypair = { 'name': obj.value, 'value': obj.value  };
        //console.log(obj);
        //console.log($scope.currentVillage);
        //console.log(localStorage.getItem('currentVillage_name'));

        $scope.currentVillage = obj.name;
        setTimeout(function(){
            $scope.$apply();
            $scope.loadGroup();
            $scope.taskUpd = 1;
        },100);
    };

    $scope.loadVillages = function(){
        /******************************************
         Display village names
        ******************************************/

        var currVille = 0;
        if(localStorage.getItem('currentVillage') !== null){
            currVille = localStorage.getItem('currentVillage');
        }

        //console.log(currVille);

        myDB.execute("select * from T_VILLAGE_MASTER WHERE VLM_PK="+currVille, function(results){

                $scope.user.selectVillage = [];
                for(var k in results){

                    var keypair = {'name': results[k].VLM_NAME,'value': results[k].VLM_PK};

                    $scope.selectVillage.push(keypair);

                    if(currVille!==null && currVille!== undefined && currVille == results[k].VLM_PK){
                        $scope.curr_village = keypair;
                        $scope.village = keypair; 
                    }

                    var cnt = parseInt(k) + parseInt(1);
                    if(results.length === cnt){
                        setTimeout(function(){
                            $scope.loadCenters(currVille); 
                        },50);
                    }

                }
        });
    };

    $scope.loadCenters = function(currVille){

        var cmd = "SELECT * FROM T_CENTER_MASTER WHERE CTR_VLM_PK="+currVille;
        myDB.execute(cmd,function(results){ 
            for(var k in results){
                var center = results[k];
                center.hasTraining = false; 
                $scope.centers.push(center);

                var cnt = parseInt(k) + parseInt(1);
                if(results.length === cnt){
                    setTimeout(function(){ 
                        $scope.loadGroup();
                    },50);
                }
            }
        });
    }


    $scope.loadGroup = function(){
         
        //Translations dont seems to work with ng-repeat in html, thus resulted in this method
 
        var date = new Date();
        date = date.getFullYear()+"-"+("0"+(date.getMonth()+1)).slice(-2)+"-"+("0"+date.getDate()).slice(-2);

        //RESET GROUPS DATA
        $scope.groups = [];
        $scope.village.groups = [];

        setTimeout(function(){

            var cmd =   " SELECT distinct CLT_GROUP_ID, clt_village,vlm_name, CTR_CENTER_NAME, CTR_PK, COUNT(T_CLIENT.CLT_PK) as clientcount ";
                cmd +=  " FROM T_CLIENT,T_VILLAGE_MASTER,T_CENTER_MASTER ";
                cmd +=  " WHERE DATE(CLT_TRANING_START_DATE) <= '"+date+"'";
                cmd +=  " AND DATE(CLT_TRANING_END_DATE) > '"+date+"'";
                cmd +=  " AND CLT_VILLAGE = VLM_PK "; 
                cmd +=  " AND CTR_PK = CAST(CLT_CENTER_ID AS INTEGER) ";
                cmd +=  " AND CLT_STATUS IN (4,6) ";
                cmd +=  " AND clt_village="+$scope.curr_village.value;
                cmd +=  " GROUP BY CLT_GROUP_ID ";

            //retrieve all the groups that are tagged to the user
            myDB.execute(cmd, function(results){
                console.log(results);
                if(results.length<=0) {

                }else{

                    for(var k in results){ 
                        results[k].status = 'Pending';
                        $scope.groups.push(results[k]);
                        var cnt = parseInt(k) + 1;
                        if(results.length === cnt){
                            setTimeout(function(){
                                $scope.viilletotal();
                            },50);
                        }
                    }
                }
            });
        },0);
    };

    $scope.totalcliencount = 0;
    $scope.viilletotal = function(){
        $scope.$apply();
        var date = new Date();
        date = ("0"+date.getDate()).slice(-2)+"/"+("0"+(date.getMonth()+1)).slice(-2)+"/"+date.getFullYear();

        var anotherdate = new Date();
        anotherdate = anotherdate.getFullYear()+"-"+("0"+(anotherdate.getMonth()+1)).slice(-2)+"-"+("0"+anotherdate.getDate()).slice(-2);

        var cmd =   " SELECT * FROM T_CLIENT, T_CLIENT_TRAINING_TMP ";
            cmd +=  " WHERE CLT_VILLAGE="+ $scope.curr_village.value;
            cmd +=  " AND CLT_PK = CTT_CLT_PK ";
            cmd +=  " AND CLT_STATUS IN (4,6) ";

        myDB.execute(cmd, function(results){
            $scope.totalcliencount = results.length;
            //console.log(results);
            if(results.length > 0) {
          
                $.each(results, function(ind,client){

                    $.each($scope.centers,function(c,center){
                        if(center.CTR_PK == parseInt(client.CLT_CENTER_ID) ){
                            center.hasTraining = true;
                        }
                    })
                    $.each($scope.groups,function(g,group){
                        if(group.CLT_GROUP_ID == parseInt(client.CLT_GROUP_ID && (client.CLT_STATUS == 6 || client.CLT_STATUS == 66) ) ){
                            group.status = 'Disband';
                        }
                    })

                    client.CLT_TRAINING_ATTENDANCE; 
                    $scope.clients.push(client);
                    if($scope.clients.length === $scope.totalcliencount){
                        //console.log('done');
                        $scope.$apply();
                    }

                });

            }
        });

    };

    $scope.changeCenter = function(center,$event){
        var btn = $event.currentTarget;
        $(btn).animateCss('pulse');
        $.each($scope.centers,function(c,cc){
           if(center.CTR_CENTER_NAME == cc.CTR_CENTER_NAME){
              center.SELECTED = true;
              console.log(center);
              $scope.selectedCenter = center; 
           } else {
              cc.SELECTED = false;
           }
        });

    }

    $scope.groupPass = function(group) {



    }

    $scope.trainingCompleted = function(type,client){
 
        if(type == 'single'){ 
            myDB.execute("UPDATE T_CLIENT_TRAINING_TMP SET CTT_STATUS = 1 WHERE CTT_CLT_PK="+client.CLT_PK, function(){
                client.CTT_STATUS = 1;
                client.CLT_TRAINING_ATTENDANCE = "Y";
                myDB.execute("UPDATE T_CLIENT SET CLT_TRAINING_ATTENDANCE = '"+client.CLT_TRAINING_ATTENDANCE+"', CLT_STATUS = 4 WHERE  CLT_PK="+client.CLT_PK , function(){
                    $scope.$apply();        
                });
            });
        } else if (type == 'group'){
            var group = client; 
            group.status = 'Passed';
            myDB.execute("UPDATE T_CLIENT_TRAINING_TMP SET CTT_STATUS = 1 WHERE CTT_CLT_PK IN (SELECT DISTINCT CLT_PK FROM T_CLIENT WHERE CLT_GROUP_ID='"+group.CLT_GROUP_ID+"' AND CAST(CLT_CENTER_ID AS INTEGER) = "+group.CTR_PK+" )", function(){
                
                $.each($scope.clients,function(c,client){
                    if(client.CTT_STATUS != 1 && client.CLT_GROUP_ID == group.CLT_GROUP_ID && parseInt(client.CLT_CENTER_ID) == group.CTR_PK ){
                        client.CLT_TRAINING_ATTENDANCE = "Y";
                        client.CTT_STATUS = 1;
                        myDB.execute("UPDATE T_CLIENT SET CLT_TRAINING_ATTENDANCE = '"+client.CLT_TRAINING_ATTENDANCE+"', CLT_STATUS = 4 WHERE  CLT_PK="+client.CLT_PK , function(){
                             
                        });
                    }   
                });
                $scope.$apply();
            }); 
        }

    };

    $scope.rescheduleTrainingForCenter = function(){
        if($scope.selectedCenter !== null) {
            swal({
                title: i18n.t("messages.AreYouSureToReschedule"),
                text: "",
                type: 'warning',
                showCancelButton: true,  
                confirmButtonText: 'Yes!'
            }).then(function () { 
              
                var cmd = "UPDATE T_CLIENT SET CLT_STATUS=6 WHERE CAST(CLT_CENTER_ID as INTEGER) ="+$scope.selectedCenter.CTR_PK+" AND CLT_TRANING_COMPLETED !='Y' ";
                myDB.execute(cmd,function(res){ 
                    swal(
                        i18n.t("messages.Resheduled"),
                        i18n.t("messages.ResheduledByManager"),
                        'success'
                    ).then(function(){
                        location.reload();
                    })
                }); 
            }) 
        }
    }

    $scope.disbandGroup = function(group){
        if(group !== null){
            swal({
                title: i18n.t("messages.AreYouSureToDisband"),
                text: "",
                type: 'warning',
                showCancelButton: true,  
                confirmButtonText: 'Yes!'
            }).then(function () { 
         
                console.log(group); 
                var cmd = "UPDATE T_CLIENT SET CLT_STATUS=66 WHERE CLT_TRANING_COMPLETED != 'Y' AND CAST(CLT_CENTER_ID AS INTEGER) ="+group.CTR_PK+" AND CLT_GROUP_ID='"+group.value+"'";
                myDB.execute(cmd,function(res){
                    $.each($scope.groups,function(g,grp){
                        if(grp.value == group.value){
                            grp.status = 'Disband';
                        }
                    }) 
                    swal(
                        i18n.t("messages.Disband"),
                        i18n.t("messages.GroupDisbanded"),
                        'success'
                    )
                    location.reload();
                }); 
            }) 
        }
    }

    $scope.trainingAbsent = function(client){
    
        var titletxt = i18n.t("messages.IsClientAbsent");

        titletxt = titletxt.replace("@@Client@@",client.CLT_FULL_NAME);

        swal({
            text:'',
            title: titletxt,
            showCancelButton: true,
            cancelButtonText: 'No',
            confirmButtonText: 'Yes'
        }).then(function(confirm){
            if(confirm){
                myDB.execute("UPDATE T_CLIENT_TRAINING_TMP SET CTT_STATUS = 1 WHERE CTT_CLT_PK="+client.CLT_PK, function(){
                    
                    client.CLT_TRAINING_ATTENDANCE = "N";
                    client.CTT_STATUS = 1;
                    myDB.execute("UPDATE T_CLIENT SET CLT_TRAINING_ATTENDANCE = '"+client.CLT_TRAINING_ATTENDANCE+"', CLT_STATUS = 6 WHERE  CLT_PK="+client.CLT_PK , function(){
                        client.CLT_STATUS = 6;
                        $scope.$apply();        
                    });
                    
                }); 
            } else {
                swal.close();
            }
        });
    };

    $scope.trainingDone = function(group){

        var groupid = "";

        if(group === null || group === undefined){
            groupid = $scope.selectedGroup.value;
        } else {
            groupid = group.CLT_GROUP_ID;
        }
        console.log(group);
        var clients = $filter('filter')($scope.clients, { CLT_GROUP_ID: groupid });
        console.log(clients);
        var alldone = true;

        var passedno = 0;

        $.each(clients,function(i,client){
            if(client.CTT_STATUS == 0) alldone = false;
            if(client.CTT_STATUS == 1) passedno++;
        });

        if(group.clientcount == passedno) group.status = 'Conducted';

        return alldone;
    };

    $scope.actualTrainingDone = function(group){

        var groupid = group.CLT_GROUP_ID;


        var clients = $filter('filter')($scope.clients, { CLT_GROUP_ID: groupid, CTT_STATUS: 1, CLT_TRAINING_ATTENDANCE: 'Y' });

        return clients.length;

    };

    $scope.changeGroup = function(group){
 
        $scope.selectedGroup.CTR_PK = group.CTR_PK;
        $scope.selectedGroup.name = group.VLM_NAME;
        $scope.selectedGroup.value = group.CLT_GROUP_ID;


    };
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
    };


    $scope.allDone = function(){
        var allDone = true;

        if($scope.clients.length === 0) return false;

        $.each($scope.clients,function(i,client){
            if(client.CLT_STATUS != 26) allDone = false;
        });

        return allDone;
    };

    $scope.groupCompleted =function(group){

        var clients = $filter('filter')($scope.clients, { CLT_GROUP_ID: group.CLT_GROUP_ID});
        var done = true;
        $.each(clients,function(i,client){
            if(client.CLT_STATUS != 26) done = false;
        });

        return done;
    };

    $scope.clientPaid = function(client){
        if(client.CLT_STATUS === 26){
            return true;
        } else {
            return false;
        }
    };

    //PROCESSES

    $scope.loadVillages();

});

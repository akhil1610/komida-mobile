/******************************************
GLOBAL
******************************************/
$.fn.extend({
    animateCss: function (animationName) {
        var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
        this.addClass('animated ' + animationName).one(animationEnd, function() {
            $(this).removeClass('animated ' + animationName);
        });
    }
});
var SEARCH_LIMIT = 5; 
/******************************************
UI Tweaks - makes select box blue.
******************************************/ 
var feastsavingcode = '002.0007';
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
var MGR_HAVE_SIG        = sessionStorage.getItem("MGR_HAVE_SIG_LOAN_PROPOSAL");
var MGR_SIG             = sessionStorage.getItem("MGR_SIG");
var MGR_SIGNED          = (sessionStorage.getItem("MGR_HAVE_SIG_LOAN_PROPOSAL") == 'Y' ? true : false );

// window.addEventListener('online',  checkNetworkStatus());
// window.addEventListener('offline', checkNetworkStatus());

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

//myApp.controller("ClientCtrl",function($scope){
myApp.controller("ProposalCtrl",function($scope,$filter, ClientService, LoanService, SavingService, $rootScope){
        
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

    $scope.MGR = {
        mgrpk: MGR_PK,
        mgrname: MGR_NAME,
        mgrhavesig: MGR_HAVE_SIG,
        hasSigned: false,
        Signature: MGR_SIG
    };
    
    $scope.showSign = false;
    $scope.clients = [];
    $scope.witnesses = [];
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

    $scope.showSign = false;
    $scope.signingclientIndex = null;
    $scope.signinguser = null;

    $scope.village = {
        centers: []
    }
    $scope.selectVillage = [];
    $scope.currVille = 0;
    if(localStorage.getItem('currentVillage') !== null){
        $scope.currVille = localStorage.getItem('currentVillage');
    } else if(localStorage.getItem('statType') !== null){
        $scope.currVille = localStorage.getItem('statType');
    }  

    $scope.selectedClient = null;
    $scope.selectedClientProducts = [];
    $scope.selectedCenter = null;
    $scope.selectedGroup = null;
    $scope.selectedLoan = null;
    $scope.selectedLoans = [];
    $scope.witnesses = [
        { witness_pk: null, witness_name: null, Signature: null, hasSigned : null },
        { witness_pk: null, witness_name: null, Signature: null, hasSigned : null },
        { witness_pk: null, witness_name: null, Signature: null, hasSigned : null },
        { witness_pk: null, witness_name: null, Signature: null, hasSigned : null },
    ]
    
    $scope.selectedWitness = [];
    $scope.activeloan = null;
    $scope.allGroups = [];
    $scope.groupmembers = [];
    $scope.existingloans = [];
    $scope.existingloanStatus = [];

    $scope.loans = []; 
    $scope.isNewLoan = [];
    $scope.newloaninfo = [];
    $scope.existingLoanPks = [];
    $scope.loanpurpose = []; 

    $scope.loaded = false; 

    setTimeout(() => {
        $scope.grouptext = i18n.t("messages.Group");
        $scope.weektext = i18n.t("messages.Weeks");
        $scope.signtext = i18n.t("messages.Sign");
        $scope.groupleadertext = i18n.t("messages.GroupLeader");
        $scope.membertext = i18n.t("messages.Member");
        $scope.centerleadertext = i18n.t("messages.CenterLeader");
        $scope.fieldofficertext = i18n.t("messages.FieldOfficer");
        $scope.managertext = i18n.t("buttons.Manager");
        $scope.selectloantext = i18n.t("messages.SelectLoan");
        $scope.feastrepay = [
            {value: 3000, name: "3000 /"+$scope.weektext},
            {value: 5000, name: "5000 /"+$scope.weektext},
            {value: 7500, name: "7500 /"+$scope.weektext},
            {value: 10000, name: "10000 /"+$scope.weektext},
            {value: 12500, name: "12500 /"+$scope.weektext},
            {value: 15000, name: "15000 /"+$scope.weektext},
        ];
        $scope.$apply();
    }, 1000);

    $scope.getFeastRepay = function() {
        myDB.execute('', function(res) {
            console.log(res);
            for (let i = 0; i < res.length; i++) {
                const row = res[i];
                
            }
        })
    }

    $scope.loadVillage = function() { 
        
        myDB.execute("select VLM_PK,VLM_NAME from T_VILLAGE_MASTER WHERE VLM_PK="+$scope.currVille, function(results){

            $scope.selectVillage = [];
            for(var k in results){
                var keypair = {'name': results[k].VLM_NAME,'value': results[k].VLM_PK};

                $scope.selectVillage.push(keypair);
                $scope.user.curr_village = keypair;
                $scope.village = keypair;
                $scope.village.centers = [];
            } 
            $scope.getCenters();
        }); 
    }
 
    $scope.getCenters = function(){
        
        var cmd = "SELECT * FROM T_CENTER_MASTER WHERE CTR_VLM_PK ="+$scope.currVille;
        myDB.execute(cmd,function(res){
            console.log(res);
            $.each(res,function(c,ctr){
                ctr.groups = [];
                $scope.village.centers.push(ctr);
            });
            console.log($scope.village)
            $scope.getClients();
        });
    }

    //Status 64 for Proposal Signed         
    $scope.getClients = function(){
        var anotherdate =  getDashDate.YMD();
        var cmd = "SELECT * FROM T_CLIENT LEFT JOIN T_CLIENT_LOAN ON (CLT_PK == CLL_CLT_PK) LEFT JOIN T_LOAN_TYPE ON (LTY_PK == CLL_LTY_PK) WHERE CLL_STATUS IN (64,67) AND  ( (CLT_IS_GROUP_LEADER!='Y' AND DATE(CLT_TRANING_END_DATE) = '"+anotherdate+"') OR (CLL_STATUS IN (64, 67) AND CLT_IS_GROUP_LEADER='Y' AND DATE(CLT_TRANING_END_DATE) != '"+anotherdate+"')   ) AND CLT_VILLAGE ="+$scope.currVille+" GROUP BY CLL_PK ORDER BY CLT_CENTER_ID, CLT_GROUP_ID";
    
        var clientPks = [];
        console.log(cmd)
        myDB.execute(cmd,function(res){ 
            console.log(res)
            $.each(res,function(c,client){ //Loop Clients
                var client_witnesses = [];
                if(client.CLL_WITNESS1_PK !== "null") client_witnesses.push(client.CLL_WITNESS1_PK);
                if(client.CLL_WITNESS2_PK !== "null") client_witnesses.push(client.CLL_WITNESS2_PK);
                if(client.CLL_WITNESS3_PK !== "null") client_witnesses.push(client.CLL_WITNESS3_PK);
                if(client.CLL_WITNESS4_PK !== "null") client_witnesses.push(client.CLL_WITNESS4_PK);
                client.loansignatures = {
                    manager: client.CLL_MANAGER_PK,
                    groupleader: client.CLL_CENTER_LEAD_PK,
                    centerleader: client.CLL_GROUP_LEAD_PK,
                    witnesses : client_witnesses
                }
                console.log(client.CLL_CENTER_LEAD_PK+" # "+client.CLL_GROUP_LEAD_PK);
                client.matarray = []; 
                if(client.CLL_CENTER_LEAD_PK != '' && client.CLL_GROUP_LEAD_PK != '') client.hasSigned =true;
                if(client.LTY_TERM_OF_LOAN !== null){

                    if(client.LTY_TERM_OF_LOAN.indexOf(",") != -1){
                        var mat = client.LTY_TERM_OF_LOAN.split(",");
                        if(mat.length > 0){
                            $.each(mat,function(m,mata){
                                var key = {
                                    value : mata,
                                    name : mata
                                };
                                client.matarray.push(parseInt(mata));
                            });
                        }
                    } else {
                        var key = {
                                value : client.LTY_TERM_OF_LOAN,
                                name : client.LTY_TERM_OF_LOAN
                            };
                        client.matarray.push(key);
                    } 
                }

                $scope.clients.push(client); 
  
                $.each($scope.village.centers,function(i,ctr){  // Loop Villages 
                    if(ctr.CTR_PK == parseInt(client.CLT_CENTER_ID) ){ 
                        var exist = false; //Check if Group Exists
                        $.each(ctr.groups,function(g,grp){ // Loop Groups
                            
                            if(grp.GROUP_ID == client.CLT_GROUP_ID){
                                exist = true;
                                grp.clients.push(client);
                            } 
                        }); 
                        if(exist == false){ //If Group does not exist
                            var group = {
                                GROUP_ID: client.CLT_GROUP_ID,
                                clients: []
                            };
                            group.clients.push(client); 
                            ctr.groups.push(group); //Add new group 
                        }  

                    }
                });
            }); 
            console.log($scope.village);
            $scope.$apply();  
            refreshall('.sel-activeloanmat');
            $('.aniview').AniView(); 
        });
    }; 

    $scope.loadMaxCPM = function() {
        myDB.execute("SELECT MAX(CPM_PK) as mcpm_pk FROM T_CLIENT_PRODUCT_MAPPING", function(res) {
            console.log(res)
            $scope.CPM_PK = res[0].mcpm_pk;
        })
    }
    $scope.CPM_PK = 0;
    $scope.loadMaxCPM();

    $scope.loadVillage(); 

    $scope.selectClient = function(client){ 
        $scope.selectedWitness = [];
        $('.witness').prop('selectedIndex', -1);   
        $scope.refreshSelect('.witness'); 
        $scope.getGroupLeaders(client);
        var cmd = "SELECT * FROM T_CLIENT WHERE CLT_GROUP_ID='"+client.CLT_GROUP_ID+"' AND CLT_CENTER_ID="+client.CLT_CENTER_ID+" AND CLT_PK !="+ client.CLT_PK +"  GROUP BY CLT_PK ";
        
        myDB.execute(cmd,function(clients){
            $scope.groupmembers = [];
            $.each(clients,function(c,cc){
                $scope.groupmembers.push(cc);    
            }); 

            $scope.selectedClient = client;
            $scope.selectedGroup = client.CLT_GROUP_ID;
            $scope.selectedCenter = client.CLT_CENTER_ID;
            $scope.selectedLoan = client.CLL_PK;
            $scope.loadClientProducts(); // getting $scope.selectedClientProducts
 
            $scope.$apply();   
            $scope.detailview('proposal');
            $scope.getAllExistingLoans();
            // $('html, body').animate({
            //     scrollTop: $("#client-signatures").offset().top - 70
            // }, 500);

        }); 
    }

    $scope.loadClientProducts = function() {
        myDB.execute("SELECT * FROM T_CLIENT_PRODUCT_MAPPING, T_PRODUCT_MASTER WHERE CPM_PRM_PK = PRM_PK AND CPM_CLT_PK ="+$scope.selectedClient.CLT_PK,function(results){
            $scope.selectedClientProducts = [];
            if(results.length == 0){

            } else {
                $.each(results,function(i,res){
                    var key = {
                        PRM_CODE: res.PRM_CODE,
                        CPM_PRM_PK: res.CPM_PRM_PK,
                        CPM_PRM_BALANCE: res.CPM_PRM_BALANCE
                    };
                    $scope.selectedClientProducts.push(res);
                });
                $.each($scope.loans,function(l,loan){
                    $.each(loan.products,function(i,val){
                        $.each($scope.selectedClientProducts,function(p,prd){
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
    }

    $scope.changeCenter = function(center,$event){
        var btn = $event.currentTarget;
        $(btn).animateCss('pulse'); 
        $.each($scope.village.centers,function(c,cc){
            if(center.CTR_CENTER_NAME == cc.CTR_CENTER_NAME){
            center.SELECTED = true;
            $scope.selectedCenter = center; 
            } else {
            cc.SELECTED = false;
            }
        });

    }

    $scope.getGroupLeaders = function(client){

        var cmd = "SELECT CLT_PK, CLT_FULL_NAME, CLT_GROUP_ID FROM T_CLIENT WHERE CLT_IS_GROUP_LEADER='Y' AND CLT_CENTER_ID ="+client.CLT_CENTER_ID;
        
        myDB.execute(cmd, function(results){
            console.log(results); 
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

    $scope.updateCtrLeader = function(){

        $scope.ctr_lead.ctr_lead_pk = $scope.selectedCtrLeader.CLT_PK;
        $scope.ctr_lead.ctr_lead_name = $scope.selectedCtrLeader.CLT_FULL_NAME;

    };

    $scope.resetSelection = function(type){
        
        if(type == 'all'){
            $scope.selectedCenter = null;
            $scope.selectedGroup = null;
        }
        $scope.selectedLoan = null;
        $scope.witnesses = [];
        $scope.ctr_lead.hasSigned = false;
        setTimeout(function(){
            $scope.$apply();
        },1)
    };
    
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
            $('#signingperson').html('<h3><p>'+$scope.selectedClient.CLT_FULL_NAME+' '+ i18n.t("messages.SignHere") + '</p></h3>');
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
            scrollTop: $("#the-canvas").offset().top
        }, 1000);

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
                cont.clearRect(0,0, 300, 150);
                cont.drawImage(img2, 0, 0, 300, 150);
            });
            img2.src = dsrc;
        } else if (type == 'mgr'){
            // var dsrc = atob($scope.MGR.Signature);

            // var img2 = new Image();
            // img2.onload = (function(){
            //     var canv = $('#the-canvas-mgr')[0];
            //     var cont = canv.getContext("2d");
            //     cont.drawImage(img2, 0, 0, 300, 150);
            // });
            // img2.src = dsrc;
        } else if (type == 'client'){
            var dsrc = atob(c_sig);
            var img2 = new Image();
            img2.onload = (function(){
                var canv = $('#the-canvas-'+pk)[0];
                var cont = canv.getContext("2d");
                cont.clearRect(0,0, 300, 150);
                cont.drawImage(img2,0,0,200,100);
            });
            img2.src = dsrc;
        } else if (type == 'ctr_lead'){
            var dsrc = atob($scope.ctr_lead.Signature);

            var img2 = new Image();
            img2.onload = (function(){
                var canv = $('#the-canvas-'+$scope.ctr_lead.ctr_lead_pk)[0];
                var cont = canv.getContext("2d");
                cont.clearRect(0,0, 300, 150);
                cont.drawImage(img2,0,0,300,150);
            });
            img2.src = dsrc;
        } else if (type == 'grp_lead'){
            var dsrc = atob($scope.grp_lead.Signature);

            var img2 = new Image();
            img2.onload = (function(){
                var canv = $('#the-canvas-'+$scope.grp_lead.grp_lead_pk)[0];
                var cont = canv.getContext("2d");
                cont.clearRect(0,0, 300, 150);
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
                            cont.clearRect(0,0, 300, 150);
                            cont.drawImage(img2,0,0,300,150);

                        });
                        img2.src = dsrc;
                    }
                }
            })
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
                var canv = $('#the-canvas-'+$scope.selectedClient.CLT_PK)[0];
                scrollTo = '#the-canvas-'+$scope.selectedClient.CLT_PK;
                $scope.$apply(function(){
                    $scope.selectedClient.hasSigned = true;
                    $scope.selectedClient.CLT_SIGNATURE = blob;
                    var canv3 = $('#clients-canvas-'+ $scope.selectedClient.CLL_PK)[0];

                    var context = canv3.getContext("2d");
                    var img3 = new Image();
                    img3.onload = (function(){ 
                        context.drawImage(img3, 0, 0, 300, 150);
                    });
                    img3.src = atob(blob);;
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
                scrollTo = '#the-canvas-mgr';
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
                scrollTo = '#the-canvas-ctr_lead';
                var canv = $('#the-canvas-ctr_lead')[0];
                $scope.$apply(function(){
                    $scope.ctr_lead.hasSigned = true;
                    $scope.ctr_lead.Signature = blob;
                })
            } else if ($scope.signinguser === 'grp_lead'){
                scrollTo = '#the-canvas-grp_lead';
                var canv = $('#the-canvas-grp_lead')[0];
                $scope.$apply(function(){
                    $scope.grp_lead.hasSigned = true;
                    $scope.grp_lead.Signature = blob;
                })
            } else if ($scope.signinguser.indexOf("witness") > -1 ) {
                var idx = $scope.signinguser.split("witness")[1];
                scrollTo = '#the-canvas-'+$scope.witnesses[idx].witness_pk;
                var canv = $('#the-canvas-'+$scope.witnesses[idx].witness_pk)[0];
                $scope.$apply(function(){
                    $scope.witnesses[idx].hasSigned = true;
                    $scope.witnesses[idx].Signature = blob;
                    var iP = parseInt(idx)+1;
                    $scope.selectedClient['CLL_WITNESS'+iP+'_PK'] = $scope.witnesses[idx].witness_pk;
                })
            }
       
            if($scope.signingclientIndex != null || $scope.signinguser == 'grp_lead' || $scope.signinguser == 'ctr_lead' || $scope.signinguser.indexOf("witness") > -1){

                var SIG_CLT_PK = "";
                if($scope.signingclientIndex != null){
                    SIG_CLT_PK = $scope.selectedClient.CLT_PK;
                } else if ($scope.signinguser == 'grp_lead'){
                    SIG_CLT_PK = $scope.grp_lead.grp_lead_pk;
                } else if ($scope.signinguser == 'ctr_lead') {
                    SIG_CLT_PK = $scope.ctr_lead.ctr_lead_pk;
                } else if ($scope.signinguser.indexOf("witness") > -1) {
                    var idx = $scope.signinguser.split("witness")[1];
                    SIG_CLT_PK = $scope.witnesses[idx].witness_pk;
                }

                var cmd1 = "UPDATE T_CLIENT SET CLT_SIGNATURE ='"+blob+"' WHERE CLT_PK = "+SIG_CLT_PK;
                myDB.execute(cmd1, function(res){
                    if($scope.signingclientIndex !== null) $scope.signingclientIndex = null;
                });
            }

            $scope.clearSigPad();
            var cont = canv.getContext("2d");
            cont.clearRect(0, 0 , 300, 150);
            cont.drawImage(img2, 0, 0, 300, 150);
            $scope.showSign = false;

            // $('html, body').animate({
            //     scrollTop: $(scrollTo).offset().top - 50
            // }, 500);

            $scope.$apply();
        });

        img2.src = dsrc;
    }
    
    $scope.updateWitness = function(idx) {
        $scope.witnesses[idx].witness_pk = $scope.selectedWitness[idx].CLT_PK;
        $scope.witnesses[idx].witness_name = $scope.selectedWitness[idx].CLT_FULL_NAME;
        setTimeout(() => {
            refreshall('.witness');
        }, 1);
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
            console.log(results[0].USER_HAVE_SIGNATURE);
            if(results[0].USER_HAVE_SIGNATURE == 'Y') {
                $scope.user.hasSigned = true;
                $scope.showSignature('officer');
            }
        });
    }

    $scope.getManagerSignature = function(){
        myDB.execute("SELECT USER_SIGNATURE, USER_HAVE_SIGNATURE FROM T_USER WHERE USER_PK='"+ $scope.MGR.mgrpk +"'" ,function(results){

            $scope.user.Signature = (results[0].USER_SIGNATURE === null ? '' : results[0].USER_SIGNATURE);
            //console.log(results[0].USER_HAVE_SIGNATURE);
            if(results[0].USER_HAVE_SIGNATURE == 'Y') {
                $scope.MGR.hasSigned = true;
                $scope.showSignature('mgr');
            }
        });
    }

    //PROCESSES
    
    // if($scope.MGR.Signature != null && $scope.MGR.Signature != ''){
    //     $scope.MGR.hasSigned = true;
    //     $scope.showSignature('mgr');
    // }

    $scope.loadsign = function(){
        setTimeout(function(){
            $scope.loadSignaturePad();
        },500);
    }

    $scope.loadLoanPurpose = function(){
        myDB.execute("SELECT * FROM T_LOAN_PURPOSE WHERE LPU_LTY_PK",function(results){
            if(results.length > 0){
                $.each(results, function(i,val){

                    var key = { value: val.LPU_PK, name: val.LPU_NAME, code: val.LPU_CODE, loan: val.LPU_LTY_PK };
                    $scope.loanpurpose.push(key);
                });
            }
        });
    };
    
    $scope.loadLoanPurpose();

    $scope.loanSelected = function(loan,$event){
        console.log(loan);
        $event.preventDefault();
        $event.stopPropagation();
 
        loan.CLL_STATUS = 42;

        var proceed = true;
        $scope.selectedLoans = [];

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

        $.each(loan.products,function(i,prd) {
            console.log(prd);
            var canAdd = $scope.productAvailable(prd,'check');
            
            if(canAdd){
                if(prd.showMaturityOptions && prd.selectedMaturityOption == null && prd.isSelected == 'YES'){
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
        }
    };

    $scope.productAvailable = function(product,newp){

        var isActive = false;  
 
        $.each($scope.selectedClientProducts,function(p,prd){
            if(prd.PRM_CODE == product.PRM_CODE){
                if(newp == "check"){
                    if(product.PRM_CODE=='002.0004'){
                        var pension = product;
                        //var pen_mat = pension.CPM_PRM_MATURITY.replace("Year").trim();
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
        if(isActive){
            return false;
        }
        return true;
    }

    $scope.viewloanproducts = function(idx,$event){

        $('.loan-box').removeClass('selected');
         
        var tis = $event.currentTarget;

        $(tis).find('.loan-box').addClass('selected');

        $scope.activeloan = null;
        var loan = $scope.loans[idx];
        

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

        var purpose = $filter('filter')( $scope.loanpurpose, { loan: loan.LTY_PK })[0];
        
        if( loan.CLL_STATUS != 64) {
            loan.selecteddetails.loanamt = parseFloat(loan.LTY_MIN_LOAN_AMOUNT);
            loan.selecteddetails.loanmaturity = loan.maturityOptions[0];
            loan.selecteddetails.graceperiod = loan.graceOptions[0];
            loan.selecteddetails.loanpurpose = purpose;
            loan.selecteddetails.childname = loan.CLL_CHILD_NAME !== undefined ? loan.CLL_CHILD_NAME : '';
            loan.selecteddetails.childgender = loan.CLL_CHILD_GENDER !== undefined ? loan.CLL_CHILD_GENDER : '';
            loan.selecteddetails.childage = loan.CLL_CHILD_AGE !== undefined ? loan.CLL_CHILD_AGE : 0;
        }
        

        $scope.activeloan = loan;
        console.log($scope.activeloan);
   
        setTimeout(function(){
            $('#activeloanMaturity'+$scope.activeloan.LTY_PK).selectmenu("refresh", true);
            $('#activeloanPurpose'+$scope.activeloan.LTY_PK).selectmenu("refresh", true);
            refreshall('#activeloanGracePeriod'); 
            refreshall('.newprodmat');
            $scope.refreshSelect('.newprodmat');
        },300);
        // $('html, body').animate({
        //     scrollTop: $("#productmappingdetails").offset().top - 90
        // }, 1000); 
    };

    $scope.getAllExistingLoans = function(){
        $scope.witnesses = [
            { witness_pk: null, witness_name: null, Signature: null, hasSigned : null },
            { witness_pk: null, witness_name: null, Signature: null, hasSigned : null },
            { witness_pk: null, witness_name: null, Signature: null, hasSigned : null },
            { witness_pk: null, witness_name: null, Signature: null, hasSigned : null },
        ];
        var clientpk = $scope.selectedClient.CLT_PK;

        $.when(LoanService.getGeneralLoan(clientpk)).then(function(loantypes){
            
            var exist_loans = $scope.existingloans.join();
            if(loantypes != null){
                var loans = [];
                $scope.loans = []; 
                $.each(loantypes,function(ind,rec){
                    console.log(rec);
                    rec.products = [];
                    rec.isSelected = false;

                    var loanInt = rec.LTY_DEFAULT_LOAN_INTEREST.split(",")[0];
                    var childname = "";
                    var childage = "";
                    var childgender = "";

                    var loan_purpose = null;
                    if( rec.CLL_LPU_PK != null ) { 
                        $scope.loanpurpose.forEach(purpose => {
                            if (purpose.value == rec.CLL_LPU_PK) {
                                loan_purpose = purpose;
                            }
                        }); 
                    }
                    var loan_weeks = null;
                    if( rec.CLL_TOTAL_LOAN_WEEKS != null ) {
                        loan_weeks = { name: rec.CLL_TOTAL_LOAN_WEEKS, value: rec.CLL_TOTAL_LOAN_WEEKS};
                        console.log(loan_weeks);
                    }
                 
                    rec.selecteddetails = {
                        loanamt: rec.CLL_ORIGINAL_LOAN != null ? rec.CLL_ORIGINAL_LOAN :  rec.LTY_MIN_LOAN_AMOUNT,
                        loanmaturity: loan_weeks,
                        graceperiod: rec.CLL_GRACE_PERIOD_WEEKS != null ? { name: rec.CLL_GRACE_PERIOD_WEEKS, value: rec.CLL_GRACE_PERIOD_WEEKS} : null,
                        loanpurpose: loan_purpose,
                        loaninterest: loanInt, 
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
                    // Get Grace Period
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

                    if( rec.CLL_STATUS == 64 ) { // Loan Proposed 

                        rec.isSelected = true;
                        $scope.selectedClient.hasSigned = true;

                        $scope.getUserSignature();
                        $scope.getManagerSignature(); 
                        $scope.showSignature('witness', rec.CLL_CLT_PK); // show Client signature only after completed
                         
                        if( rec.CLL_WITNESS1_PK != null) {
                            $scope.getWitnessInfo(rec.CLL_WITNESS1_PK)
                                .then( clientname => { 
                                    $scope.witnesses[0].witness_name = clientname; 
                                    $scope.witnesses[0].witness_pk = rec.CLL_WITNESS1_PK;  
                                    $scope.witnesses[0].hasSigned = true;  
                                    $scope.$apply();
                                    $scope.showSignature('witness', rec.CLL_WITNESS1_PK);
                                })
                                .catch( err => {

                                })
                        }
                        if( rec.CLL_WITNESS2_PK != null) {
                            $scope.getWitnessInfo(rec.CLL_WITNESS2_PK)
                            .then( clientname => { 
                                $scope.witnesses[1].witness_name = clientname; 
                                $scope.witnesses[1].witness_pk = rec.CLL_WITNESS2_PK;  
                                $scope.witnesses[1].hasSigned = true;  
                                $scope.$apply();
                                $scope.showSignature('witness', rec.CLL_WITNESS2_PK);
                            })
                            .catch( err => {

                            })
                        }
                        
                        if( rec.CLL_WITNESS3_PK != null) {
                             
                            $scope.getWitnessInfo(rec.CLL_WITNESS3_PK)
                                .then( clientname => {
                                    $scope.witnesses[2].witness_name = clientname; 
                                    $scope.witnesses[2].witness_pk = rec.CLL_WITNESS3_PK;  
                                    $scope.witnesses[2].hasSigned = true;
                                    $scope.$apply();
                                    $scope.showSignature('witness', rec.CLL_WITNESS3_PK);
                                })
                                .catch( err => {

                                })
                        }
                        if( rec.CLL_WITNESS4_PK != null) {
                            $scope.getWitnessInfo(rec.CLL_WITNESS4_PK)
                                .then( clientname => { 
                                    $scope.witnesses[3].witness_name = clientname; 
                                    $scope.witnesses[3].witness_pk = rec.CLL_WITNESS4_PK;  
                                    $scope.witnesses[3].hasSigned = true;  
                                    $scope.$apply();
                                    $scope.showSignature('witness', rec.CLL_WITNESS4_PK);
                                })
                                .catch( err => {

                                })
                        }
                        
                        if( rec.CLL_GROUP_LEAD_PK != 'null' && rec.CLL_GROUP_LEAD_PK != '') {
                            $scope.getWitnessInfo(rec.CLL_GROUP_LEAD_PK)
                                .then( clientname => {
                                    $scope.grp_lead.grp_lead_pk = rec.CLL_GROUP_LEAD_PK;
                                    $scope.grp_lead.grp_lead_name = clientname;
                                    $scope.grp_lead.hasSigned = true; 
                                    $scope.showSignature('groupleader', rec.CLL_GROUP_LEAD_PK);
                                });
                        }

                        if( rec.CLL_CENTER_LEAD_PK != 'null' && rec.CLL_CENTER_LEAD_PK != '') {
                            $scope.getWitnessInfo(rec.CLL_CENTER_LEAD_PK)
                                .then( clientname => {
                                    $scope.ctr_lead.ctr_lead_pk = rec.CLL_CENTER_LEAD_PK;
                                    $scope.ctr_lead.ctr_lead_name = clientname;
                                    $scope.ctr_lead.hasSigned = true; 
                                    $scope.showSignature('centerleader', rec.CLL_CENTER_LEAD_PK);
                                });
                        }

                        $scope.clickLoan(rec.CLL_PK);
                    } 
                    
                    $scope.loans.push(rec); 

                });
                $scope.$apply();
            }
            
            $scope.loadNewProducts();
        });

    }

    $scope.clickLoan = function(CLL_PK) {
        setTimeout(() => {
            $('#loan'+CLL_PK).click();
        }, 1400);
    }
    
    $scope.getWitnessInfo = function(CLT_PK) {
        var p = new Promise(function(res,rej) {
            myDB.execute("SELECT CLT_FULL_NAME FROM T_CLIENT WHERE CLT_PK=" + CLT_PK, function(rows) {
                if(rows[0] != null) {
                    res(rows[0].CLT_FULL_NAME);
                } else {
                    rej('error');
                }
            })
        });
        return p;
        
    }

    $scope.loadproducts = function(){
        console.log($scope.loans);
        
        var loan = $scope.loans[0];
        $.when(SavingService.getAllMappedProducts(loan.LTY_PK,loan.CLL_CLT_PK)).done(function(prds){
            var products = [];
            console.log('1305')
            console.log(prds);
            if(prds !== null ){
                $scope.loans.products = [];
                for (let p = 0; p < prds.length; p++) {
                    const prd = prds[p];
                    var prdExists = false;
                    $.each($scope.newproducts, function(np, newproduct) {
                        console.log(newproduct);
                        if(prd.PRM_PK == newproduct.PRM_PK) {
                            prdExists = true;
                        }
                    }); 
                    console.log('product exists ' + prdExists);
                    console.log(loan.LTY_PK);
                    if(prd.LSM_LTY_PK == loan.LTY_PK && !prdExists){
                        console.log('product exists');
                        console.log(loan);
                        console.log(prd);
                        if(prd.LSM_PRM_IS_MANDATORY == 'Y'){
                            prd.isMandatory = 'Y';
                            prd.isSelected = 'YES';
                            
                        } else {
                            prd.isMandatory = 'N';
                        }

                        prd.showMaturityOptions = false;
                        prd.selectedMaturityOption = null;
                        var mat_arr = [];
                        mat_arr = prd.PRM_LOAN_MATURITY_OPTIONS.split(',');
                        if(mat_arr.length > 1) {
                            prd.showMaturityOptions = true;
                            prd.selectedMaturityOption = mat_arr[0];
                        }
                        prd.maturityOptions = mat_arr;
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
                console.log(loan);
                $scope.$apply(); 
            }
        });
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

        myDB.execute("SELECT * FROM T_PRODUCT_MASTER,T_CLIENT_PRODUCT_MAPPING WHERE CPM_PRM_PK = PRM_PK AND CPM_CHKNEW = 1 AND CPM_CLT_PK="+$scope.selectedClient.CLT_PK,function(res){
             
            if(res.length == 0) {
                 
            } else {
                // $.each(res,function(i,val){
                    // val.isMandatory = "Y";
                    // val.isSelected = "YES";
                    // val.selectedSavingperWeek = val.CPM_REPAY_PER_WEEK;
                    // $scope.newproducts.push(val); 
                // });
                for(let i=0; i<res.length; i++) {
                    const val = res[i];
                    val.isMandatory = "Y";
                    val.isSelected = "YES";
                    val.selectedSavingperWeek = val.CPM_REPAY_PER_WEEK; 
                    $scope.newproducts.push(val); 
                    $scope.$apply();
                }
                $scope.$apply();
                console.log($scope.newproducts);
                console.log('new products');
                
                
            }
            $scope.loadproducts();
        });

    };

    $scope.changeGroup = function(group){
        console.log(group);
        var keypair = { 'name': group.VLM_NAME, 'value': group.CLT_GROUP_ID, 'centerid': group.CLT_CENTER_ID} ;
        
        $scope.selectedGroup = group.GROUP_ID;
        setTimeout(function(){ 
            $scope.refreshSelect('.sel-activeloanmat');
            $.each($scope.clients,function(c,client){
                //if(client.hasSigned) $scope.showSignature('client',client.CLT_PK, client.CLT_SIGNATURE);
            });
        },100); 
    }

    $scope.clientDone = function(client){
        console.log(client.hasSigned);
        console.log(client.CLL_GROUP_LEAD_PK);
        console.log(client.CLL_CENTER_LEAD_PK);
        // console.log(client.CLL_WITNESS1_PK);
        // console.log(client.CLL_WITNESS2_PK);
        // console.log(client.CLL_WITNESS3_PK);
        // console.log(client.CLL_WITNESS4_PK);
        var done = false;
        if(
            client.hasSigned && 
            client.CLL_GROUP_LEAD_PK != 'null' && client.CLL_GROUP_LEAD_PK != '' && 
            client.CLL_CENTER_LEAD_PK != 'null' && client.CLL_CENTER_LEAD_PK != ''
            // client.CLL_WITNESS1_PK !== 'null' && client.CLL_WITNESS1_PK != '' && 
            // client.CLL_WITNESS2_PK !== 'null' && client.CLL_WITNESS2_PK != '' && 
            // client.CLL_WITNESS3_PK !== 'null' && client.CLL_WITNESS3_PK != '' && 
            // client.CLL_WITNESS4_PK !== 'null' && client.CLL_WITNESS4_PK != '' 
            ){
                done = true;
        }

        return done;
    }

    $scope.clientMandatoryDone = function(client){
        
        var done = false;
        if(
            client.hasSigned && 
            client.CLL_GROUP_LEAD_PK != 'null' && client.CLL_GROUP_LEAD_PK != '' && 
            client.CLL_CENTER_LEAD_PK != 'null' && client.CLL_CENTER_LEAD_PK != ''){
                done = true;
        }

        return done;
    }

    $scope.allProposalDone = function(group){

        var alldone = true;
        $.each(group.clients,function(c,client){

            if(client.CLL_CENTER_LEAD_PK == 'null' || client.CLL_CENTER_LEAD_PK ==='') alldone = false;
        });

        return alldone;

    }

    $scope.autoSelGroup = function(obj){ 
        console.log("selectedGroup");
        console.log(obj);
        console.log($scope.clients);
        $scope.selectedGroup = obj; 
    };

    $scope.loaded = false;

    $scope.detailview = function(page){
       
        if (page == 'centers') { 
            $('.second-cover').fadeIn();
            $('.third-cover').fadeIn();
            $('.second-page').hide(); 
            $('.third-page').hide(); 
            
            $('.first-page').show(); 
            $('.first-cover').fadeOut();
        } else if(page == 'clientlist'){
            $('.first-cover').fadeIn();
            $('.third-cover').fadeIn();
            $('.first-page').hide(); 
            $('.third-page').hide();
            
            $('.second-page').show();
            $('.second-cover').fadeOut();
            setTimeout(() => {
                $scope.loadClientSigs();
            }, 1000);
            
        } else if (page == 'proposal') { 
            $('.first-cover').fadeIn();
            $('.second-cover').fadeIn();
            $('.first-page').hide(); 
            $('.second-page').hide();
            
            $('.third-page').show();
            $('.third-cover').fadeOut();
        }
        $("html, body").animate({ scrollTop: 0 }, "fast"); 
    }

    $scope.loadClientSigs = function() {
        $scope.clients.forEach( function( client ) {
            if( client.loansignatures.witnesses.length > 0 ) {
                // proposal signed
                var signature = atob(client.CLT_SIGNATURE); 
                var canv = $('#clients-canvas-'+ client.CLL_PK)[0];
                var context = canv.getContext("2d");
                var img2 = new Image();
                img2.onload = (function(){ 
                    context.drawImage(img2, 0, 0, 300, 150);
                });
                img2.src = signature;
            }
        } )
    }

    setTimeout(() => {
        $scope.detailview('centers');
    }, 300);

    $scope.refreshSelect = function(idf){

        $(idf).each(function(i, element) {
            var selected = $(this).find('option:selected').text();
            if(selected !== null && selected !== ''){
                $(this).parent().find('span').html(selected);
            } else {
                $(this).parent().find('span').html('&nbsp;');
            }
        });
    };

    $scope.updateInterest = function(client){

        var TermArray = client.LTY_TERM_OF_LOAN.split(",");
        var InterestArray = client.LTY_DEFAULT_LOAN_INTEREST.split(",");
        console.log("TermArray "+TermArray);
        for(var i=0; i < TermArray.length; i++){ 
            if(parseInt(client.CLL_TOTAL_LOAN_WEEKS) == parseInt(TermArray[i]) ){
                client.CLL_LOAN_INTEREST = (parseInt(InterestArray[i])).toFixed(2);
                console.log("interest is " + client.CLL_LOAN_INTEREST );
            }
        }
        console.log(client);
    };

    $scope.checkCenterDone = function(center){

        var clientDone = 0;

        var clients = $filter('filter')($scope.clients, { CLT_CENTER_ID: center.CTR_PK });
        $.each(client,function(c,client){
            if(clients.CLL_CENTER_LEAD_PK != "" && client.CLL_GROUP_LEAD_PK != ""){ 
                clientDone++;
            } 
        });

        return clientDone;

    };

    $scope.checkGroupDone = function(group){ 
        var clientDone = 0;

        var clients = $filter('filter')($scope.clients, { CLT_GROUP_ID: group.GROUP_ID });
        $.each(clients,function(c,client){
            if($scope.clientDone(client)){ 
                clientDone++;
            } 
        });
        return clientDone; 
    }

    $scope.checkAllDone = function(client){

        console.log("checking all done "); 
        if (client.loansignatures.manager != null && client.loansignatures.manager != '' &&
            client.loansignatures.centerleader != null && client.loansignatures.centerleader != '' &&
            client.loansignatures.groupleader != null && client.loansignatures.groupleader != '' &&
            client.loansignatures.witnesses.length > 3) {
                console.log(client.CLT_PK + " completed");
                $scope.resetSelection('loan');
            }


        if(client.CLL_CENTER_LEAD_PK != "" && client.CLL_CENTER_LEAD_PK != 'null' && client.CLL_GROUP_LEAD_PK != "" && client.CLL_GROUP_LEAD_PK != "null" && $scope.user.hasSigned){
            swal("Loan Proposal completed for "+client.CLT_FULL_NAME);  
            $scope.updateLoanWitnesses(client);
            $scope.resetSelection('loan');
        } 

    } 

    $scope.loanProposal = function(client,status){

    }

    $scope.updateLoanWitnesses = function(client) {
        console.log("witnesses");
        console.log($scope.witnesses);
        var count = 0;
        if($scope.witnesses.length > 0){
            var cmd2 = "UPDATE T_CLIENT_LOAN SET "; 
            $.each($scope.witnesses,function(w,wit){
                if(client.CLL_CLT_PK != wit.CLT_PK){ 
                    count++;
                    if(count == 1) cmd2 += " CLL_WITNESS1_PK="+wit.CLT_PK;
                    if(count == 2) cmd2 += " , CLL_WITNESS2_PK="+wit.CLT_PK;
                    if(count == 3) cmd2 += " , CLL_WITNESS3_PK="+wit.CLT_PK;
                    if(count == 4) cmd2 += " , CLL_WITNESS4_PK="+wit.CLT_PK; 
                } 
            });
            cmd2 += " WHERE CLL_PK="+client.CLL_PK;
            console.log(cmd2);
            myDB.execute(cmd2,function(res){
                console.log("done updating witnesses");
            });
        } 
    } 

    $scope.saveloan = function() {
        
        if( !$scope.checkLoan() ) {

            swal(i18n.t("messages.ProposalMustSign"));

            return false;
        }
        var productquery = [];
        console.log('productss');
        console.log($scope.activeloan);
        $scope.activeloan.products.forEach(product => {
            console.log($scope.productAvailable(product,'check'))
            var enddate = null;
            var startdate = null;
            //if( product.isSelected == 'YES' && !$scope.activeloan.newloan && !(product.isMandatory=='Y' ||  !$scope.productAvailable(product,'check'))) {
            if( product.isSelected == 'YES' && !$scope.activeloan.newloan && $scope.productAvailable(product,'check')) {
                var prd_maturity = $scope.activeloan.selecteddetails.loanmaturity.value;
                if(product.selectedMaturityOption !== null){
                    prd_maturity = product.selectedMaturityOption;
                    if(product.PRM_CODE == '002.0004'){ //If Pension
                        if(prd_maturity.indexOf("year") != -1){ //Check if maturity is in years
                            
                        }
                    }
                }   else {
                    prd_maturity = $scope.activeloan.selecteddetails.loanmaturity.value + " Weeks";
                }

                var prdSavperWeek = null;
                var balance = 0;
                if(product.PRM_CODE == '002.0007'){
                    prdSavperWeek = product.selectedSavingperWeek;
                    balance = parseInt(prdSavperWeek) + parseInt(product.PRM_DEFAULT_AMOUNT);
                } 
                
                productquery.push("INSERT INTO T_CLIENT_PRODUCT_MAPPING VALUES(null, "+$scope.CPM_PK+", "+$scope.selectedClient.CLT_PK+", "+$scope.selectedLoan+", "+ product.PRM_PK +", '"+prd_maturity+"', '"+ balance +"', null, '"+moment().format('DD/MM/YYYY HH:mm:ss')+"', null, 1, '"+prdSavperWeek+"', '"+startdate+"','"+enddate+"', 1)");
                $scope.CPM_PK = $scope.CPM_PK + 1;

            }
        });
        console.log(productquery);
        myDB.dbShell.transaction(function(tx){ 
            for(e in productquery){tx.executeSql(productquery[e]);} 
        }, function(err){ 
            console.log(err);
        }, function(suc){
            console.log('successfull');
            console.log($scope.selectedLoan);
            myDB.execute("SELECT * FROM T_CLIENT_LOAN WHERE CLL_PK = " + $scope.selectedLoan, function(results){
                var loan = results[0];
                console.log(loan);

                $scope.activeloan.selecteddetails.loaninterest;
                $scope.activeloan.selecteddetails.loanmaturity.value
                
                $scope.activeloan.selecteddetails.graceperiod;

                var graceperiod = null;

                if($scope.activeloan.selecteddetails.hasOwnProperty("graceperiod")){
                    if($scope.activeloan.selecteddetails.graceperiod != undefined){
                        graceperiod = $scope.activeloan.selecteddetails.graceperiod.value;
                    }
                }
                var query = "UPDATE T_CLIENT_LOAN SET "+ 
                "CLL_ACTUAL_LOAN='"+ $scope.activeloan.selecteddetails.loanamt + "', " +
                "CLL_ORIGINAL_LOAN='"+ $scope.activeloan.selecteddetails.loanamt + "', " +
                "CLL_TOTAL_LOAN_WEEKS='" + $scope.activeloan.selecteddetails.loanmaturity.value + "', " +
                "CLL_LOAN_INTEREST='"+ $scope.activeloan.selecteddetails.loaninterest + "', " +
                "CLL_LPU_PK="+ $scope.activeloan.selecteddetails.loanpurpose.value + ", " +
                "CLL_GRACE_PERIOD_WEEKS='"+ graceperiod + "', ";

                if($scope.witnesses[0].hasSigned) query += "CLL_WITNESS1_PK='"+ $scope.witnesses[0].witness_pk + "', ";
                if($scope.witnesses[1].hasSigned) query += "CLL_WITNESS2_PK='"+ $scope.witnesses[1].witness_pk + "', ";
                if($scope.witnesses[2].hasSigned) query += "CLL_WITNESS3_PK='"+ $scope.witnesses[2].witness_pk + "', ";
                if($scope.witnesses[3].hasSigned) query += "CLL_WITNESS4_PK='"+ $scope.witnesses[3].witness_pk + "', ";

                if($scope.ctr_lead.hasSigned) query += "CLL_CENTER_LEAD_PK='"+ $scope.ctr_lead.ctr_lead_pk + "', ";
                if($scope.grp_lead.hasSigned) query += "CLL_GROUP_LEAD_PK='"+ $scope.grp_lead.grp_lead_pk + "' " ;
    
                query += ", CLL_STATUS=64 ";
                query += " WHERE CLL_PK=" + $scope.selectedLoan;
                console.log(query);
                myDB.execute(query, function(results) {
                    console.log(results);
                    $.each($scope.clients, (c,client) => {
                        if(client.CLT_PK == $scope.selectedClient.CLT_PK) {
                            $scope.clients[c].CLL_CENTER_LEAD_PK = $scope.ctr_lead.ctr_lead_pk;
                            $scope.clients[c].CLL_GROUP_LEAD_PK = $scope.grp_lead.grp_lead_pk;
                        }
                    })
                    
                    if($scope.clientDone($scope.selectedClient) == true) {
                        swal(i18n.t("messages.LoanProposalDone"));
                    } else {
                        swal(i18n.t("messages.StillMissingSignature"));
                    }
                    $scope.$apply();
                    setTimeout(() => {
                        $scope.detailview('clientlist')
                        //window.location.href= 'newloanproposal.html';
                    }, 1500);
                });

            });
            
        }); 
    }

    $scope.memeberFilter = function() {
        return $scope.groupmembers.filter( mem => {
            console.log($scope.witnesses);
            var exist = false;
            for (let w = 0; w < $scope.witnesses.length; w++) {
                const wit = $scope.witnesses[w];
                if ( wit.witness_pk == mem.CLT_PK && wit.hasSigned) {
                    exist = true;
                }
            }
            return !exist;
        })
    }

    $scope.checkLoan = function() {
        var proposalDone = true;
        if(!$scope.selectedClient.hasSigned) proposalDone = false;
        if(!$scope.grp_lead.hasSigned) proposalDone = false;
        //if(!$scope.MGR.hasSigned) proposalDone = false;
        if(!$scope.user.hasSigned)  proposalDone = false;
        return proposalDone;
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

    // $scope.updateClientToSign = function(idx, signee, type){
    //     $scope.signingclientIndex = idx;
    //     $scope.emitLoadSignature(signee, type);
    // }

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
                var canv = $('#the-canvas-'+$scope.selectedClient.CLT_PK)[0]; 
                $scope.$apply(function(){
                    $scope.selectedClient.hasSigned = true;
                    $scope.selectedClient.CLT_SIGNATURE = blob;
                    var canv3 = $('#clients-canvas-'+ $scope.selectedClient.CLL_PK)[0];

                    var context = canv3.getContext("2d");
                    var img3 = new Image();
                    img3.onload = (function(){ 
                        context.drawImage(img3, 0, 0, 300, 150);
                    });
                    img3.src = atob(blob);;
                })
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
            } else if (type === 'grp_lead'){
                var canv = $('#the-canvas-grp_lead')[0];
                $scope.$apply(function(){
                    $scope.grp_lead.hasSigned = true;
                    $scope.grp_lead.Signature = blob;
                })
            }

            if(type == 'client' || type == 'grp_lead' || type == 'ctr_lead'){

                var SIG_CLT_PK = "";
                if(type == 'client'){
                    SIG_CLT_PK = $scope.selectedClient.CLT_PK;
                } else if (type == 'grp_lead'){
                    SIG_CLT_PK = $scope.grp_lead.grp_lead_pk;
                } else if (type == 'ctr_lead') {
                    SIG_CLT_PK = $scope.ctr_lead.ctr_lead_pk;
                }

                var cmd1 = "UPDATE T_CLIENT SET CLT_SIGNATURE ='"+blob+"' WHERE CLT_PK = "+SIG_CLT_PK;
                console.log(cmd1);
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
//end of controller

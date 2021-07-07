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
  // function updateOnlineStatus()
  // {
  //     console.log("online");
  //     //document.getElementById("connection").innerHTML = "User is online";
  // }
  
  // function updateOfflineStatus()
  // {
  //     console.log("offline");
  //     //document.getElementById("connection").innerHTML = "User is offline";
  // }
  
  // function checkNetworkStatus(){
  //     if(navigator.onLine){
  //       updateOnlineStatus();
  //     } else {
  //       updateOfflineStatus();
  //     }
  // }
  
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
  
    //myApp.controller("ClientCtrl",function($scope){
    myApp.controller("ProposalCtrl",function($scope,$filter){
          
        $scope.user = {
            userPK:USER_PK,
            userName:USER_NAME,
            userHaveSig:USER_HAVE_SIG,
            branchPK:BRC_PK,
            branchName:BRC_NAME,
            companyName:CMP_NAME,    
            Signature: USER_SIG,
            hasSigned: USER_SIGNED
        };

        $scope.MGR = {
            mgrpk: MGR_PK,
            mgrname: MGR_NAME,
            mgrhavesig: MGR_HAVE_SIG,
            hasSigned: MGR_SIGNED,
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

        $scope.village = {
            centers: []
        }
        $scope.selectVillage = [];
        $scope.currVille = 0;
        if(localStorage.getItem('statType') !== null){
            $scope.currVille = localStorage.getItem('statType');
        } else  if(localStorage.getItem('currentVillage') !== null){
            $scope.currVille = localStorage.getItem('currentVillage');
        }

        $scope.selectedCenter = null;
        $scope.selectedGroup = null;
        $scope.selectedLoan = null;

        $scope.loaded = false; 

        setTimeout(() => {
            $scope.grouptext = i18n.t("messages.Group");
            $scope.signtext = i18n.t("messages.Sign");
            $scope.groupleadertext = i18n.t("messages.GroupLeader");
            $scope.membertext = i18n.t("messages.Member");
            $scope.centerleadertext = i18n.t("messages.CenterLeader");
            $scope.fieldofficertext = i18n.t("messages.FieldOfficer");
            $scope.managertext = i18n.t("buttons.Manager");
        }, 1000);

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
                $scope.getClients();
            });
        }
  
        //Status 64 for Proposal Signed         
        $scope.getClients = function(){
                var anotherdate =  getDashDate.YMD();
                var cmd = "SELECT * FROM T_CLIENT LEFT JOIN T_CLIENT_LOAN ON (CLT_PK == CLL_CLT_PK) LEFT JOIN T_LOAN_TYPE ON (LTY_PK == CLL_LTY_PK) WHERE CLL_STATUS=64 AND  ( (CLT_IS_GROUP_LEADER!='Y' AND DATE(CLT_TRANING_END_DATE) = '"+anotherdate+"') OR (CLL_STATUS IN (64) AND CLT_IS_GROUP_LEADER='Y' AND DATE(CLT_TRANING_END_DATE) != '"+anotherdate+"')   ) AND CLT_VILLAGE ="+$scope.currVille+" GROUP BY CLL_PK ORDER BY CLT_CENTER_ID, CLT_GROUP_ID";
            
                var clientPks = [];
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
  
        $scope.loadVillage(); 
  
   
        $scope.selectGroup = function(client){

            if($scope.witnesses.length == 0) {
                $scope.getGroupLeaders(client);
                var cmd = "SELECT * FROM T_CLIENT WHERE CLT_GROUP_ID='"+client.CLT_GROUP_ID+"' AND CLT_CENTER_ID="+client.CLT_CENTER_ID+" AND (CLT_PK = " + client.CLT_PK + " OR CLT_IS_GROUP_LEADER='Y') GROUP BY CLT_PK ";
                console.log(cmd);
                myDB.execute(cmd,function(clients){
                    $.each(clients,function(c,cc){
                            $scope.witnesses.push(cc);    
                    });
                    console.log($scope.witnesses);
                    $scope.selectedGroup = client.CLT_GROUP_ID;
                    $scope.selectedCenter = client.CLT_CENTER_ID;
                    $scope.selectedLoan = client.CLL_PK;
                    $scope.$apply(); 
                    $('html, body').animate({
                        scrollTop: $("#client-signatures").offset().top - 70
                    }, 500);

                });
            } else {
                $scope.resetSelection('loan');
            } 
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

            var cmd = "SELECT CLT_PK, CLT_FULL_NAME FROM T_CLIENT WHERE CLT_IS_GROUP_LEADER='Y' AND CLT_CENTER_ID ="+client.CLT_CENTER_ID;
            
            myDB.execute(cmd, function(results){
                console.log(results);
                for(var r in results){
                    $scope.ctr_lead.ctr_leaders.push(results[r]);
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
          
        $scope.showSignscreen = function(client, type){

            type = typeof type !== 'undefined' ? type : null;

            if(!$scope.showSign){
                $scope.showSign = true;
                setTimeout(function(){
                    if(type == null){
                        $scope.signingclientIndex = client.CLT_PK;  
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
  
        var $sigdiv = $("#signature");
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


            var signername = "";
            if(type == null){
                signername = client.CLT_FULL_NAME;
            } else if (type == 'officer') {
                signername = $scope.user.userName;
            } else if (type == 'mgr'){
                signername = $scope.MGR.mgrname;
            } else if (type == 'ctr_lead'){
                signername = $scope.ctr_lead.ctr_lead_name;
            }
            
            $('#signingperson').html('<h3><p>'+signername+' '+ i18n.t("messages.SignHere") +'</p></h3>');

            $('html, body').animate({
                scrollTop: $("#the-canvas").offset().top - 90
            }, 500);

        }
  
        $scope.clearSignature = function(ind, type){

            ind = typeof ind !== 'undefined' ? ind : null;

            $scope.clearSigPad();

            if( ind != null ){

                var client = $filter('filter')($scope.clients, { CLL_PK: $scope.selectedLoan })[0];
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
                sessionStorage.setItem("MGR_HAVE_SIG_LOAN_PROPOSAL","N");
                sessionStorage.setItem("MGR_SIG","");

                myDB.execute("UPDATE T_USER SET USER_SIGNATURE ='', USER_HAVE_SIGNATURE='N' WHERE USER_PK = '"+$scope.MGR.mgrpk+"'", function(res){

                });

            } else if (type == 'ctr_lead') {
                
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
                    var canv = $('#clients-canvas-'+pk)[0];
                    var cont = canv.getContext("2d");
                    cont.drawImage(img2,0,0,200,100);
                });
            } else if (type == 'ctr_lead'){
                var dsrc = atob(c_sig);

                var img2 = new Image();
                img2.onload = (function(){
                    var canv = $('#the-canvas-ctr_lead')[0];
                    var cont = canv.getContext("2d");
                    cont.drawImage(img2,0,0,200,100);
                });
            }

            img2.src = dsrc;
        }
  
        $scope.importImg = function(){


            var client = $filter('filter')($scope.clients, { CLL_PK: $scope.selectedLoan })[0];

            var data = $sigdiv.jSignature('getData', 'image');

            var dsrc = 'data:' + data[0] + ',' + data[1];
            var png = $sigdiv.jSignature('getData','base30');

            var blob = btoa(dsrc);
            var ratio = canvas.height / 250;

            ht = canvas.height / ratio;

            var img2 = new Image();
            img2.onload = (function(){
                console.log($scope.signingclientIndex);
                
                if($scope.signingclientIndex != null){   
                    var witness = $filter('filter')($scope.witnesses, { CLT_PK: $scope.signingclientIndex })[0];

                    console.log("client import");
                    console.log(client);
                    var canv = $('#the-canvas-'+witness.CLT_PK)[0];
                    if(witness.CLT_PK == client.CLT_PK){
                        var canv2 = $('#clients-canvas-'+client.CLL_PK)[0];
                    }
                    
                    $scope.$apply(function(){
                        
                        witness.hasSigned = true;
                        witness.CLT_SIGNATURE = blob;
                        if(witness.CLT_IS_GROUP_LEADER == 'Y'){ // Group Leader
                            
                            var cmd2 = "UPDATE T_CLIENT_LOAN SET CLL_TOTAL_LOAN_WEEKS="+client.CLL_TOTAL_LOAN_WEEKS+", CLL_ORIGINAL_LOAN='"+client.CLL_ORIGINAL_LOAN+"', CLL_GROUP_LEAD_PK="+witness.CLT_PK+" , CLL_MOB_NEW=3 WHERE CLL_PK="+client.CLL_PK;
                            myDB.execute(cmd2,function(res){
                                console.log("group leader signed");
                                client.loansignatures.groupleader = witness.CLT_PK;
                                client.CLL_GROUP_LEAD_PK = witness.CLT_PK;
                                $scope.checkAllDone(client);
                            });
                        } else { // Witnesses

                            var witnessId = parseInt(client.loansignatures.witnesses.length) + 1;
                            
                            var cmd2 = "UPDATE T_CLIENT_LOAN SET CLL_WITNESS"+witnessId+"_pk="+witness.CLT_PK+" , CLL_MOB_NEW=3 WHERE CLL_PK="+client.CLL_PK;
                            myDB.execute(cmd2,function(res){
                                console.log("witness " + witnessId + " has signed"); 
                                client.loansignatures.witnesses.push(withness.CLT_PK);
                                $scope.checkAllDone(client);
                            });
                        }
                        if(client.CLT_PK == witness.CLT_PK) {
                            client.hasSigned = true;
                            client.CLT_SIGNATURE = blob;
                            var cmd1 = "UPDATE T_CLIENT SET CLT_SIGNATURE ='"+blob+"' WHERE CLT_PK = "+client.CLT_PK;
                            myDB.execute(cmd1,function(res){
                                $scope.checkAllDone(client);
                            });
                        }
                    })

                    $scope.signingclientIndex = null;
                } else if($scope.signinguser === 'officer'){ // Loan Officer
                    var canv = $('#the-canvas-officer')[0];
                    $scope.$apply(function(){
                        $scope.user.hasSigned = true;
                        $scope.user.Signature = blob;
                        $scope.checkAllDone(client);
                    })

                    var cmd1 = "UPDATE T_USER SET USER_SIGNATURE ='"+blob+"' , USER_HAVE_SIGNATURE='Y' WHERE USER_PK = "+$scope.user.userPK;

                    myDB.execute(cmd1, function(res){
                    });

                } else if($scope.signinguser === 'mgr'){ // Manager
                    var canv = $('#the-canvas-mgr')[0];
                    $scope.$apply(function(){
                        $scope.MGR.hasSigned = true;
                        $scope.MGR.Signature = blob;
                        $scope.checkAllDone(client);
                    });

                    var cmd1 = "UPDATE T_USER SET USER_SIGNATURE ='"+blob+"' , USER_HAVE_SIGNATURE='Y' WHERE USER_PK = "+$scope.MGR.mgrpk;

                    myDB.execute(cmd1, function(res){
                        
                        sessionStorage.setItem("MGR_HAVE_SIG_LOAN_PROPOSAL","Y");
                        sessionStorage.setItem("MGR_HAVE_SIG","Y");
                        client.loansignatures.manager = $scope.MGR.mgrpk;
                        sessionStorage.setItem("MGR_SIG",blob);
                        $scope.checkAllDone(client);

                    });
                    var cmd2 = "UPDATE T_CLIENT_LOAN SET CLL_MANAGER_PK ="+$scope.MGR.mgrpk+" WHERE CLL_PK="+client.CLL_PK;

                    myDB.execute(cmd2, function(res){
  
                    });
                } else if ($scope.signinguser == 'ctr_lead'){ // Center Leader
                    var canv = $("#the-canvas-ctr_lead")[0];
                    $scope.$apply(function(){
                        $scope.ctr_lead.hasSigned = true;
                        $scope.ctr_lead.Signature = blob;
                        client.CLL_CENTER_LEAD_PK = $scope.ctr_lead.ctr_lead_pk;
                    });

                    var cmd1 = "UPDATE T_CLIENT SET CLT_SIGNATURE ='"+blob+"'  WHERE CLT_PK ="+$scope.ctr_lead.ctr_lead_pk;
                    myDB.execute(cmd1,function(res){
                        client.loansignatures.centerleader = $scope.ctr_lead.ctr_lead_pk;
                    });
                    var cmd2 = "UPDATE T_CLIENT_LOAN SET CLL_TOTAL_LOAN_WEEKS="+client.CLL_TOTAL_LOAN_WEEKS+", CLL_ORIGINAL_LOAN='"+client.CLL_ORIGINAL_LOAN+"',  CLL_CENTER_LEAD_PK="+$scope.ctr_lead.ctr_lead_pk+" , CLL_MOB_NEW=3 WHERE CLL_PK="+client.CLL_PK;
                    myDB.execute(cmd2,function(res){
                        console.log("center leader signed");
                        client.CLL_CENTER_LEAD_PK = $scope.ctr_lead.ctr_lead_pk;
                        $scope.checkAllDone(client);
                    });
                } 
                var cont = canv.getContext("2d");
                cont.drawImage(img2, 0, 0, 300, 150);
                if(canv2){
                    var cont2 = canv2.getContext("2d");
                    cont2.drawImage(img2, 0, 0, 300, 150); 
                }

                $scope.showSign = false;

                $('html, body').animate({
                    scrollTop: $("#client-signatures").offset().top - 90
                }, 500);

                
                $scope.clearSigPad();
                $scope.$apply();

            });

            img2.src = dsrc;
        }  
  
        $scope.changeGroup = function(group){
            console.log(group);
            var keypair = { 'name': group.VLM_NAME, 'value': group.CLT_GROUP_ID, 'centerid': group.CLT_CENTER_ID} ;
            
            $scope.selectedGroup = group.GROUP_ID;  
            ////console.log( keypair );
            //$("html, body").animate({ scrollTop: 0 }, 600); 
            setTimeout(function(){ 
                $scope.refreshSelect('.sel-activeloanmat');
                $.each($scope.clients,function(c,client){
                    if(client.hasSigned) $scope.showSignature('client',client.CLL_PK,client.CLT_SIGNATURE);
                });
            },100); 
        }

        $scope.clientDone = function(client){
            
            var done = false;
            if(client.hasSigned && client.CLL_GROUP_LEAD_PK != 'null' && client.CLL_GROUP_LEAD_PK != '' && client.CLL_CENTER_LEAD_PK != 'null' && client.CLL_CENTER_LEAD_PK != ''){
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

        $scope.detailview = function(){
            if($scope.clientspage)
                $scope.clientspage = false;
            else
                $scope.clientspage = true;

            if($scope.clientspage){
                $('.first-page').hide();
                $('.second-wrapper').show();
                $('.second-page').fadeOut();
            } else { 
                $('.first-page').fadeIn();
                $('.second-page').show();
                $('.second-wrapper').hide();
            }
            $("html, body").animate({ scrollTop: 0 }, "fast");
            //console.log($scope.user.village.group);
        }
        $scope.refreshSelect = function(idf){

            $(idf).each(function(i, element) {
                var selected = $(this).find('option:selected').text(); 
                if(selected !== null && selected !== ''){
                    $(this).parent().find('span').html(selected);
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
                console.log(client);
                if(client.CLL_CENTER_LEAD_PK != 0 && client.CLL_GROUP_LEAD_PK != 0){ 
                    clientDone++;
                } 
            });
            console.log(clientDone);
            return clientDone; 
        }
  
        $scope.checkAllDone = function(client){

            console.log("checking all done ");
            console.log($scope.selectedLoan);
            console.log(client);
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

        //POPUP-SIGNATURE
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
                    var client = $filter('filter')($scope.clients, { CLL_PK: $scope.selectedLoan })[0];
                    var witness = $filter('filter')($scope.witnesses, { CLT_PK: $scope.signingclientIndex })[0];
                    var canv = $('#the-canvas-'+witness.CLT_PK)[0];
                    if(witness.CLT_PK == client.CLT_PK){
                        var canv2 = $('#clients-canvas-'+client.CLL_PK)[0];
                    }
                    //console.log(client);
                    $scope.$apply(function(){
                        
                        witness.hasSigned = true;
                        witness.CLT_SIGNATURE = blob;
                        if(witness.CLT_IS_GROUP_LEADER == 'Y'){ // Group Leader
                            
                            var cmd2 = "UPDATE T_CLIENT_LOAN SET CLL_TOTAL_LOAN_WEEKS="+client.CLL_TOTAL_LOAN_WEEKS+", CLL_ORIGINAL_LOAN='"+client.CLL_ORIGINAL_LOAN+"', CLL_GROUP_LEAD_PK="+witness.CLT_PK+" , CLL_MOB_NEW=3 WHERE CLL_PK="+client.CLL_PK;
                            myDB.execute(cmd2,function(res){
                                console.log("group leader signed");
                                client.loansignatures.groupleader = witness.CLT_PK;
                                client.CLL_GROUP_LEAD_PK = witness.CLT_PK;
                                $scope.checkAllDone(client);
                            });
                        } else { // Witnesses

                            var witnessId = parseInt(client.loansignatures.witnesses.length) + 1;
                            
                            var cmd2 = "UPDATE T_CLIENT_LOAN SET CLL_WITNESS"+witnessId+"_pk="+witness.CLT_PK+" , CLL_MOB_NEW=3 WHERE CLL_PK="+client.CLL_PK;
                            myDB.execute(cmd2,function(res){
                                console.log("witness " + witnessId + " has signed"); 
                                client.loansignatures.witnesses.push(withness.CLT_PK);
                                $scope.checkAllDone(client);
                            });
                        }
                        if(client.CLT_PK == witness.CLT_PK) {
                            client.hasSigned = true;
                            client.CLT_SIGNATURE = blob;
                            var cmd1 = "UPDATE T_CLIENT SET CLT_SIGNATURE ='"+blob+"' WHERE CLT_PK = "+client.CLT_PK;
                            myDB.execute(cmd1,function(res){
                                $scope.checkAllDone(client);
                            });
                        }
                    })

                    $scope.signingclientIndex = null;
                } else if(type === 'officer'){
                    var canv = $('#the-canvas-officer')[0];
                    $scope.$apply(function(){
                        $scope.user.hasSigned = true;
                        $scope.user.Signature = blob;
                        $scope.checkAllDone(client);
                    })

                    var cmd1 = "UPDATE T_USER SET USER_SIGNATURE ='"+blob+"' , USER_HAVE_SIGNATURE='Y' WHERE USER_PK = "+$scope.user.userPK;

                    myDB.execute(cmd1, function(res){
                    });

                } else if(type === 'mgr'){
                    var canv = $('#the-canvas-mgr')[0];
                    $scope.$apply(function(){
                        $scope.MGR.hasSigned = true;
                        $scope.MGR.Signature = blob;
                        $scope.checkAllDone(client);
                    });

                    var cmd1 = "UPDATE T_USER SET USER_SIGNATURE ='"+blob+"' , USER_HAVE_SIGNATURE='Y' WHERE USER_PK = "+$scope.MGR.mgrpk;

                    myDB.execute(cmd1, function(res){
                        
                        sessionStorage.setItem("MGR_HAVE_SIG_LOAN_PROPOSAL","Y");
                        sessionStorage.setItem("MGR_HAVE_SIG","Y");
                        client.loansignatures.manager = $scope.MGR.mgrpk;
                        sessionStorage.setItem("MGR_SIG",blob);
                        $scope.checkAllDone(client);

                    });
                    var cmd2 = "UPDATE T_CLIENT_LOAN SET CLL_MANAGER_PK ="+$scope.MGR.mgrpk+" WHERE CLL_PK="+client.CLL_PK;

                    myDB.execute(cmd2, function(res){
  
                    });
                } else if (type === 'ctr_lead'){
                    var canv = $("#the-canvas-ctr_lead")[0];
                    $scope.$apply(function(){
                        $scope.ctr_lead.hasSigned = true;
                        $scope.ctr_lead.Signature = blob;
                        client.CLL_CENTER_LEAD_PK = $scope.ctr_lead.ctr_lead_pk;
                    });

                    var cmd1 = "UPDATE T_CLIENT SET CLT_SIGNATURE ='"+blob+"'  WHERE CLT_PK ="+$scope.ctr_lead.ctr_lead_pk;
                    myDB.execute(cmd1,function(res){
                        client.loansignatures.centerleader = $scope.ctr_lead.ctr_lead_pk;
                    });
                    var cmd2 = "UPDATE T_CLIENT_LOAN SET CLL_TOTAL_LOAN_WEEKS="+client.CLL_TOTAL_LOAN_WEEKS+", CLL_ORIGINAL_LOAN='"+client.CLL_ORIGINAL_LOAN+"',  CLL_CENTER_LEAD_PK="+$scope.ctr_lead.ctr_lead_pk+" , CLL_MOB_NEW=3 WHERE CLL_PK="+client.CLL_PK;
                    myDB.execute(cmd2,function(res){
                        console.log("center leader signed");
                        client.CLL_CENTER_LEAD_PK = $scope.ctr_lead.ctr_lead_pk;
                        $scope.checkAllDone(client);
                    });
                } 
                var cont = canv.getContext("2d");
                cont.drawImage(img2, 0, 0, 300, 150);
                if(canv2){
                    var cont2 = canv2.getContext("2d");
                    cont2.drawImage(img2, 0, 0, 300, 150); 
                } 
                $scope.showSign = false;
                $scope.$apply();
            });

            img2.src = dsrc;
        }
  });
  //end of controller
  
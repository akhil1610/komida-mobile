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

    // $('input').lc_switch('Pass','Fail');

    // $(document).on('click','.lcs_switch', function(){
    // 	if( $(this).hasClass('lcs_on') ) {
    // 		$(this).lcs_off();
    // 	} else {
    // 		$(this).lcs_on();
    // 	}
    // });
};


/******************************************
//Global variables
******************************************/

var USER_PK   = sessionStorage.getItem("USER_PK");
var USER_NAME = sessionStorage.getItem("USER_NAME");
var BRC_PK    = sessionStorage.getItem("BRC_PK");
var BRC_NAME  = sessionStorage.getItem("BRC_NAME");
var BRC_PHONE = sessionStorage.getItem("BRC_PHONE");
var CMP_NAME  = sessionStorage.getItem("CMP_NAME");

var BRC_BRANCH_ID = sessionStorage.getItem("BRC_BRANCH_ID");
var USER_ID       = sessionStorage.getItem("USER_ID");
var USER_CTR_ID       = sessionStorage.getItem("USER_CTR_ID");
var USER_CTR_NAME       = sessionStorage.getItem("USER_CTR_NAME");

var CMP_SMS_FORMAT     = sessionStorage.getItem("CMP_SMS_FORMAT");
var CMP_RECEIPT_FORMAT = sessionStorage.getItem("CMP_RECEIPT_FORMAT");
var SMS_OR_RECEIPT     = sessionStorage.getItem("SMS_OR_RECEIPT");

var msg_separator = '@@@@prodigy@@@@';

var PASS_STATUS = 57;
var FAIL_STATUS = 54;
var ABSENT_STATUS = 61;


//BEFORE PRODUCTION FIND AND REMOVE ALL LINES TAGGED WITH = !remove

/******************************************
//Controller
******************************************/
//Temp modification;
CMP_RECEIPT_FORMAT += ",CLNM , CLID, INSTNO, AMT, SAV"; //!remove in production

var myApp = angular.module('myApp',['ng-currency', 'pascalprecht.translate']);

myApp.config(function ($translateProvider) {

	 $translateProvider.useStaticFilesLoader({
		prefix: "locales/locale-",
		suffix: ".json"
	});

    $translateProvider.preferredLanguage(ln.language.code);

});

myApp.filter('moment', function () {
    return function (input, momentFn /*, param1, param2, ...param n */) {
        var args = Array.prototype.slice.call(arguments, 2),
            momentObj = moment(input);
        return momentObj[momentFn].apply(momentObj, args);
    };
});

myApp.directive('checkValue', function() {
    return {
        restrict: 'A',
        scope: {
            cvalue: '@',
            ctype: '@'
        },
        link: function(scope, element, attrs){

            // var verypoortxt = "sangat miskin";
            // var poortxt = "miskin";
            // var notpoortxt = "tidak miskin";
            var verypoortxt = i18n.t("messages.VeryPoor");
            var poortxt = i18n.t("messages.Poor");
            var notpoortxt = i18n.t("messages.NotPoor");

         	var status = "";

            if(scope.ctype == "housing"){
            	if(scope.cvalue < 15){
            		status = verypoortxt;
            	} else if (scope.cvalue >= 15 && scope.cvalue < 19){
            		status = poortxt;
            	} else if (scope.cvalue >= 20){
            		status = notpoortxt;
            	}

            } else if(scope.ctype == "income" ){
            	if(scope.cvalue < 1000000){
            		status = verypoortxt;
            	} else if (scope.cvalue > 1000000 && scope.cvalue < 2000000){
            		status = poortxt;
            	} else if (scope.cvalue > 2000000){
            		status = notpoortxt;
            	}

            } else if(scope.ctype == "asset"){
            	if(scope.cvalue < 4000000){
            		status = verypoortxt;
            	} else if (scope.cvalue > 4000000 && scope.cvalue < 10000000){
            		status = poortxt;
            	} else if (scope.cvalue > 10000000){
            		status = notpoortxt;
            	}
            }


            $(element).html(status);
            if(status == verypoortxt) {
        		$(element).attr('style','color:#FF8A65');
            } else if (status == poortxt){
            	$(element).attr('style','color:gold');
            } else if ( status == notpoortxt){
            	$(element).attr('style','color:green');
            }


        }
    }
});

myApp.directive('myEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.myEnter);
                });

                event.preventDefault();
            }
        });
    };
});

myApp.controller('ManagerCtrl', function($scope, $filter){

	$scope.user = {
		userPK:USER_PK,
		userName:USER_NAME,
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
		currentVillage: null

    };
    
    $scope.grouptxt = i18n.t("messages.Group");

	$scope.tested = null;

	$scope.MGR = {
		mgrpk:null,
		mgrname:null,
		mgrhavesig:'N',
	}

	$scope.testBool = false;

	$scope.allClients = {
		teststatus: null
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
	$scope.currentVillage = localStorage.getItem('currentVillage');
	$scope.groups = [];
    $scope.village = {
    	groups: []
    };
    $scope.completedClients = [];
    $scope.clientlist = [];

    $scope.allGrpDone = false;

    $scope.myFunct = function(keyEvent) {
	  if (keyEvent.which === 13)
	    $scope.login();
	}

    $scope.anotherdate =  getDashDate.YMD();

	$scope.login = function(){

		var username = $("#userid").val();
    	var password = $("#password").val();

    	if(username.length > 0 && password.length > 0){

    		myDB.execute("SELECT * FROM T_USER WHERE USER_ID='"+username+"' AND USER_PASSWORD='"+password+"' LIMIT 1",function(results){
    			//console.log(results);
    			if(results.length == 0){

    				swal({
    					title: i18n.t("messages.Alert"),
    					text: i18n.t("messages.InvalidLoginCredential"),
    					type: 'error',
    					confirmButtonColor: "#80C6C7",
			            confirmButtonText: "Ok",
			            closeOnConfirm: true
			        });

    				return false;
    			}
    			sessionStorage.setItem("MGR_PK",results[0].USER_PK);
                sessionStorage.setItem("MGR_ID",results[0].USER_ID);
                sessionStorage.setItem("MGR_NAME",results[0].USER_NAME);
                sessionStorage.setItem("MGR_HAVE_SIG",results[0].USER_HAVE_SIGNATURE);

                $scope.MGR = {
					mgrpk:results[0].USER_PK,
					mgrname:results[0].USER_NAME,
					mgrhavesig:results[0].USER_HAVE_SIGNATURE,
				};

				swal({
		            title: i18n.t("messages.AlertSuccess"),
		            text: i18n.t("messages.Welcome")+" "+$scope.MGR.mgrname+" !",
		            type: 'success',
		            confirmButtonColor: "#80C6C7",
		            confirmButtonText: "Ok",
		            closeOnConfirm: true
		        }).then(function(){

		        	$scope.detailview();

		        });
    		});
    	}
	}



	$scope.updateVillage = function(){

        myDB.execute("SELECT * FROM T_VILLAGE_MASTER WHERE VLM_PK="+localStorage.getItem('currentVillage'),function(res){

            var ville = res[0];
            var keypair = { 'name': ville.VLM_NAME, 'value': ville.VLM_PK  };
            $scope.currentVillage = keypair.name;

        });


		// //console.log(obj);
		// //console.log($scope.currentVillage);
		// //console.log(localStorage.getItem('currentVillage_name'));

		// $scope.currentVillage = obj.name;
		// setTimeout(function(){

		// 	$scope.loadGroup();
		// 	$scope.taskUpd = 1;

		// },100);
	}

    $scope.updateVillage();

    $scope.allUpdated = function(group){

        var clients = $filter('filter')( $scope.clients, { CLT_GROUP_ID: group.CLT_GROUP_ID });

        var allDone = true;

        $.each(clients, function(i,client){
            // alert(client.CLT_STATUS);
            if(client.CLT_STATUS != 61 && client.CLT_STATUS != FAIL_STATUS && client.CLT_STATUS != 57) allDone = false;
        });

        return allDone;
    }

	$scope.allClients = function(){
		myDB.execute("SELECT * FROM T_CLIENT WHERE CLT_STATUS IN (4,56,57) AND DATE(CLT_TRANING_END_DATE)="+$scope.anotherdate+" AND CLT_VILLAGE="+$scope.curr_village.value, function(results){
			$.each(results,function(ind,val){
				$scope.clientlist.push(val);
			});
			//console.log($scope.clientlist);
		});
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
            for(k in results){

                var keypair = {'name': results[k].VLM_NAME,'value': results[k].VLM_PK};

                $scope.selectVillage.push(keypair);

                if(currVille!=null && currVille!= undefined && currVille == results[k].VLM_PK){
                    $scope.curr_village = keypair;
                    $scope.village= keypair;
                    $scope.village.groups = [];
                }
                var cnt = parseInt(k) + parseInt(1);
                //console.log(results.length+"    "+cnt);
                if(results.length === cnt){
                	setTimeout(function(){
		                $scope.loadGroup();
		            },50)
                }
            }

        });
    }

	$scope.loadGroup = function(){

        //Translations dont seems to work with ng-repeat in html, thus resulted in this method

        $scope.request = i18n.t("messages.Request");
        $scope.expected = i18n.t("messages.Expected");
        $scope.grouptext = i18n.t("messages.Group");
        $scope.weektext = i18n.t("messages.Week");

        var date = new Date();
        date = date.getFullYear()+"-"+("0"+(date.getMonth()+1)).slice(-2)+"-"+("0"+date.getDate()).slice(-2);

        //RESET GROUPS DATA
        $scope.groups = [];
        $scope.village.groups = [];

        setTimeout(function(){

            var cmd = 	" SELECT distinct CLT_GROUP_ID,clt_village,vlm_name, CLT_STATUS, COUNT(T_CLIENT.CLT_PK) as clientcount, CTR_CENTER_NAME ";
            	cmd += 	" FROM T_CLIENT,T_VILLAGE_MASTER,T_CENTER_MASTER ";
            	cmd += 	" WHERE CLT_STATUS IN (4,"+ABSENT_STATUS+","+FAIL_STATUS+","+PASS_STATUS+") ";
                cmd +=  " AND DATE(CLT_TRANING_END_DATE)='"+$scope.anotherdate+"'";
            	cmd += 	" AND clt_village = VLM_PK ";
                cmd +=  " AND clt_center_id = CTR_PK ";
            	cmd += 	" AND clt_village="+$scope.curr_village.value;
                cmd +=  " GROUP BY CLT_GROUP_ID ";

        	//console.log(cmd);

            //retrieve all the groups that are tagged to the user
            myDB.execute(cmd, function(results){
                console.log(results);
                if(results.length<=0) {

                }else{

                    for(k in results){
                    	results[k].isDone = false;
                        $scope.groups.push(results[k]);

                        var cnt = parseInt(k) + parseInt(1);
                        if(results.length === cnt){
                        	setTimeout(function(){
			 					$scope.viilletotal();
			                },50);
                        }
                    }
                }
            });
        },0);
    }

    $scope.viilletotal = function(){

    	var date = new Date();
        date = ("0"+date.getDate()).slice(-2)+"/"+("0"+(date.getMonth()+1)).slice(-2)+"/"+date.getFullYear();

        var anotherdate = new Date();
        anotherdate = anotherdate.getFullYear()+"-"+("0"+(anotherdate.getMonth()+1)).slice(-2)+"-"+("0"+anotherdate.getDate()).slice(-2);


        var cmd = 	" SELECT * FROM T_CLIENT ";
        	cmd += 	" WHERE CLT_VILLAGE="+ $scope.curr_village.value;
        	cmd += 	" AND CLT_STATUS IN (4,"+ABSENT_STATUS+","+FAIL_STATUS+","+PASS_STATUS+") ";
            cmd +=  " AND DATE(CLT_TRANING_END_DATE)='"+$scope.anotherdate+"'";
        	// cmd +=  " AND CLT_TRANING_END_DATE ="+anotherdate;

        myDB.execute(cmd, function(results){
            //console.log(results);
            $scope.completedClients = []; //reset completed clients
            if(results.length > 0) {
            	$.each(results, function(i, val){

            		var client = [];

            		for(key in val){
                       	client[key] = val[key];
                    }

            		if(client.CLT_STATUS === ABSENT_STATUS){
            			client.teststatus = 'absent';
            		} else if(client.CLT_STATUS === FAIL_STATUS){
            			client.teststatus = 'fail';
            		} else if(client.CLT_STATUS === PASS_STATUS){
            			client.teststatus = 'pass';
            		} else {
            			client.teststatus = null;
            		}

 					if(client.teststatus != null){
 						$scope.completedClients.push(client);
 					}

            		client.loans = [];
            		$scope.villetotaleSecond(client);

            		var cnt = parseInt(i) + parseInt(1);
            		if(results.length === cnt){
            			setTimeout(function(){
            				$scope.allGroupCompleted();
            			},100);
            		}
            	});
            }
        });
    }
    $scope.villetotaleSecond = function(client){
		var cmd1 =	" SELECT * FROM T_CLIENT_LOAN ";
			cmd1 += 	" WHERE CLL_CLT_PK ="+client.CLT_PK;
			cmd1 += 	" AND CLL_STATUS = 3";

		myDB.execute(cmd1, function(loans){

			for(k in loans){
				client.loans.push(loans[k]);
			}

			$scope.clients.push(client);

			$scope.allClients.teststatus = null;
		});
    }

    $scope.changeGroup = function(group){
        var keypair = { 'name': group.VLM_NAME, 'value': group.CLT_GROUP_ID} ;
        $scope.selectedGroup = keypair;
        //$("html, body").animate({ scrollTop: 0 }, 600);
        return false;
    }

	$scope.detailview = function(back){

		if(back === undefined){
			back = 1;
		} else {
			back = -1;
		}

		$scope.clientspage = parseInt($scope.clientspage + back*1);

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

            $scope.allClients.teststatus = null;


		} else if($scope.clientspage == 3) {

			$('.first-page').hide();
			$('.second-page').hide();
			$('.thir-page').fadeOut();

			$('.second-wrapper').hide();
			$('.third-wrapper').show();
			setTimeout(function(){
				$.when($scope.$apply()).then(function(){
					$.each($scope.clients, function(ind,val){
			    		var client = val;
			    		//console.log(client.CLT_STATUS);
		    			if(client.CLT_STATUS != 57){
			    			client.testpassed = false;
			    			//$('#lcs_'+ind).lcs_off();
			    		} else {
			    			client.testpassed = true;
			    			//$('#lcs_'+ind).lcs_on();
			    		}
			    	});
				});
			},510);

		}
	}

	$scope.updateSAlltatus = function(type){

		$scope.allClients.teststatus = type;

        var clients = $filter('filter')( $scope.clients, { CLT_GROUP_ID: $scope.selectedGroup.value });

		$.each(clients, function(i,client){

			client.teststatus = type;

			if(type === 'fail'){
				client.CLT_STATUS = FAIL_STATUS;
				client.testpassed = false;
			} else if(type === 'pass') {
				client.CLT_STATUS = PASS_STATUS;
				client.testpassed = true;
			} else if(type === 'absent'){
				client.CLT_STATUS = ABSENT_STATUS;
				client.testpassed = false;
			} else {
				client.CLT_STATUS = 4;
				client.testpassed = false;
			}

			$scope.updateStatusDB(client);

		});
	}

    $scope.getTwoDecimal = function(val){

        return parseFloat(val).toFixed(2);

    }

	$scope.updateStatus = function(client,type,test, i){


		client.teststatus = type;

		if(type == 'fail'){
			client.CLT_STATUS = FAIL_STATUS;
			client.testpassed = false;
		} else if(type == 'pass') {
			client.CLT_STATUS = PASS_STATUS;
			client.testpassed = true;
		} else if(type == 'absent'){
			client.CLT_STATUS = ABSENT_STATUS;
			client.testpassed = false;
		} else {
			client.CLT_STATUS = 4;
			client.testpassed = false;
		}

		$scope.updateStatusDB(client);

	}

	$scope.updateStatusDB = function(client){

		var cmd = "UPDATE T_CLIENT SET CLT_MOB_NEW = 2 , CLT_STATUS ="+parseInt(client.CLT_STATUS)+" WHERE CLT_PK="+client.CLT_PK;
		myDB.execute(cmd,function(results){
			$scope.updateComletedClients(client);
		});

        var cmd1 = "UPDATE T_CLIENT_LOAN SET CLL_STATUS="+parseInt(client.CLT_STATUS)+", CLL_MANAGER_PK="+$scope.MGR.mgrpk+" WHERE CLL_CLT_PK="+client.CLT_PK;
        myDB.execute(cmd1,function(res){

        });
	}

    $scope.completedClientsByGroup = function(group){

        //console.log($scope.completedClients);

        var clientcount = $filter('filter')($scope.completedClients, { CLT_GROUP_ID: group.CLT_GROUP_ID });

        return clientcount.length;

        // if($scope.clients.length == clientcount.length){
        //     return true;
        // }

        // return false;

    }

    $scope.passedClientsByGroup = function(group){

        var clients = $filter('filter')($scope.clients, { CLT_GROUP_ID: group.CLT_GROUP_ID });

        clients = $filter('filter')(clients, { CLT_STATUS: 57 });

        return clients.length;

    }

    $scope.allCompleted  = function(group){
        if( group.clientcount == $scope.completedClientsByGroup(group)){
            return true;
        } else {
            return false;
        }
    }

 	$scope.updateComletedClients = function(client){
 		if(client.CLT_STATUS == 57){
			if($scope.completedClients.indexOf(client) == -1) $scope.completedClients.push(client);
		} else {
			for(var i = 0; i < $scope.completedClients.length; i++) {
			    var obj = $scope.completedClients[i];

			    if($scope.completedClients[i].CLT_PK == client.CLT_PK) {
			        $scope.completedClients.splice(i, 1);
			    }
			}
		}

		var allDone = true;
        var atleastonepass = false;
		$.each($scope.clients, function(i,client){
			// alert(client.CLT_STATUS);
			if(client.CLT_STATUS != ABSENT_STATUS && client.CLT_STATUS != FAIL_STATUS && client.CLT_STATUS != PASS_STATUS) allDone = false;
            if(client.CLT_STATUS == PASS_STATUS) atleastonepass = true;
			var cnt = parseInt(i) + 1;
			// alert(cnt +"  "+$scope.clients.length+"  "+allDone);
			if($scope.clients.length === cnt){
				if(allDone){
					swal({
			            title: '',
			            text: i18n.t("messages.TestComplete"),
			            type: 'success',
			            confirmButtonColor: "#80C6C7",
			            confirmButtonText: "Ok",
			            closeOnConfirm: true
			        }).then(function(){

			        	setTimeout(function(){
		        			$scope.detailview(0);
                            if(atleastonepass) $('.addclientdone').fadeIn();
		        		},100);
			        });
				}
			}
		});

		$scope.allGroupCompleted();
 	}


	$scope.getCompletedCount = function(group){

	 	//console.log(group);
	 	var sum = 0;
	 	$.each($scope.clientlist,function(i,client){
	 		if(client.CLT_GROUP_ID === group && client.CLT_STATUS == 57){
	 			sum = sum +1 ;
	 		}
	 	});

	 	return sum;
	};

	$scope.groupCompleted = function(group){

		var done = true;

		$.each($scope.clients, function(i,client){
			if(client.CLT_STATUS != FAIL_STATUS && client.CLT_STATUS != ABSENT_STATUS && client.CLT_STATUS != PASS_STATUS ) done = false;
		});

		return done;

	}



	$scope.allGroupCompleted = function(){
		var done = true;
		$.each($scope.groups,function(i,group){
			var clients = $filter('filter')($scope.clientlist, { CLT_GROUP_ID: group.CLT_GROUP_ID });
			$.each(clients, function(i,client){
				//console.log(client.CLT_STATUS);
				if(client.CLT_STATUS != FAIL_STATUS && client.CLT_STATUS != ABSENT_STATUS && client.CLT_STATUS != PASS_STATUS ){
					done = false;
					//console.log(done);
				}
			});
		})

		$scope.allGrpDone =  done;
		$scope.$apply();
	}



	//PROCESSES
	$scope.loadVillages();


});

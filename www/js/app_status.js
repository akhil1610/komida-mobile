/******************************************
- Initialise menus and select option boxes (UI)
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
- Controller
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

myApp.controller("ClientCtrl",function($scope){
    var t = this;

    //initialise
    $scope.clients= [];
    $scope.branch="";
    $scope.updates={};

/******************************************
- Load results and display them
******************************************/
    this.getResults = function(results){
        $.each(results, function(ind,clt){//initialise the checkbox for correct UI toggle at doSelectAll()
            $scope.updates[ind] = false;
        });

        $scope.$apply(function () {
            $scope.clients = results;
            $scope.updates;
        });
        $('.aniview').AniView();
    };

/******************************************
//This manually calls SQL and updates list of clients when user searches
******************************************/

    $scope.search = function(upStatus, fromVillage){ //user made changes to search fields, load list of clients to update

        var cmd = "";
        cmd = "SELECT * FROM T_CLIENT, T_CLIENT_LOAN, T_VILLAGE_MASTER WHERE ";

        switch(upStatus.value){ //upStatus is the status they want to update to
            case 5:
            case 6:
                cmd += '((CLT_STATUS=4 AND CLL_STATUS=3)) AND CLT_PK=CLL_CLT_PK';break;
            case 26:
                cmd += '((CLT_STATUS=5 AND CLL_STATUS=3) OR (CLT_STATUS=4 AND CLL_STATUS=3)) AND CLT_PK=CLL_CLT_PK';break;
            case 8:
                cmd += '((CLT_STATUS=4 AND CLL_STATUS=3) OR (CLT_STATUS=7 AND CLL_STATUS=10) OR (CLT_STATUS=7 AND CLL_STATUS=12)) AND CLT_PK=CLL_CLT_PK';break;// AND CLL_IS_GROUP_LEADER!="Y"
            case 11:
                cmd += 'CLT_STATUS=7 AND CLL_STATUS=10 AND CLT_PK=CLL_CLT_PK';break;
            default:
                {$scope.clients = [];return false;};
                break;
        }

        cmd += " AND CLT_VILLAGE="+fromVillage.value+" AND CLT_VILLAGE==VLM_PK";
        cmd+=" ORDER BY CLT_FULL_NAME"; //sorting the order so it's consistent
        //console.log(cmd);
        $scope.updates={}; //reset updates
        myDB.execute(cmd, function(results){
            t.getResults(results);
        });
    }

/******************************************
//Select all checkboxes when select all is selected
******************************************/
    $scope.doSelectAll = function(){
        var selectval = !$scope.selectAll; //usually the value updates before UI is updated, so this is a fix
        for(key in $scope.updates) $scope.updates[key] = selectval;
    }

/******************************************
//When user clicks on update status
******************************************/
    $scope.updateStatus = function(){
        var cmd = [];
        var status = $scope.selectTransactions.selectOption.value;

        //no updating as long as selected is group leader and is cancelling
        if(status==8){
            var client;
            var checked;
            for(key in $scope.updates){
                if($scope.updates[key]==true){
                    client = $scope.clients[key];
                    if(client.CLL_IS_GROUP_LEADER=='Y'){
                       // alert("Please change group leaders in the Groups page first before attempting to cancel existing group leaders.");
					    //alert(i18n.t("messages.ChangeGroupLeaderFirst"));
                        swal({
                            title: i18n.t("messages.Alert"),
                            text: i18n.t("messages.ChangeGroupLeaderFirst"),
                            type: "error",
                            confirmButtonColor: "#80C6C7",
                            confirmButtonText: "Ok",
                            closeOnConfirm: true
                        });
                        return false;
                    }
                }
            }
        }

        //if user is checked, update their status
        for(key in $scope.updates){
            var checked = $scope.updates[key];
            if(checked==true){
                //update this user into the database

                var v = $scope.clients[key];
                var clientPK = v.CLL_CLT_PK;
                var loanPK = v.CLL_PK;
                //console.log(status);
                switch(status){
                    case 5: //Status update from 4 Training Scheduled to 5 Training Completed
                    case 26: //Status update from 5 Training Completed to 26 Eligible for loan
                        cmd.push("UPDATE T_CLIENT SET CLT_TRANING_COMPLETED='Y' WHERE CLT_PK="+clientPK);
                    case 6: //Status update from 4 Training Scheduled to 6 Failed to attend...
                        cmd.push("UPDATE T_CLIENT SET CLT_STATUS="+status+" WHERE CLT_PK="+clientPK);
                        cmd.push("INSERT INTO T_STAT_UPDATE VALUES(null,"+clientPK+","+loanPK+","+status+")");
                        break;
                    case 8: //Status update from 10 - to 8
                    case 11: //Status update from 10 - to 11
                        cmd.push("UPDATE T_CLIENT_LOAN SET CLL_STATUS="+status+" WHERE CLL_PK="+loanPK);
                        cmd.push("INSERT INTO T_STAT_UPDATE VALUES(null,"+clientPK+","+loanPK+","+status+")");
                        break;
                }
            }
        }

        if(cmd.length==0) return false; //if no updates, return

        myDB.dbShell.transaction(function(tx){
            for(e in cmd) tx.executeSql(cmd[e]);
      //  }, function(err){alert("Error updating statuses.");return true;}, function(suc){
	    }, function(err){
            //alert(i18n.t("messages.UpdateStatusError"));
            swal({
                title: i18n.t("messages.Alert"),
                text: i18n.t("messages.UpdateStatusError"),
                type: "error",
                confirmButtonColor: "#80C6C7",
                confirmButtonText: "Ok",
                closeOnConfirm: true
            });
            return true;
        }, function(suc){
            //alert("All statuses updated.");
			//alert(i18n.t("messages.UpdateAllStatus"));
            swal({
                title: i18n.t("messages.AlertSuccess"),
                text: i18n.t("messages.UpdateAllStatus"),
                type: "success",
                confirmButtonColor: "#80C6C7",
                confirmButtonText: "Ok",
                closeOnConfirm: true
            },function(){
                   $scope.$apply(function () {
                    $scope.taskUpd = 1;
                    // $scope.selectTransactions.selectOption = $scope.selectTransactions.options['0'];
                    // $scope.selectedVillage = [];
                    // $('#updateStatus').parent().find('span').html('&nbsp;');
                    // $('#village').parent().find('span').html('&nbsp;');
                    $scope.clients = [];
                    $scope.selectAll = false;
                });
            });

        });
    };

/******************************************
// When user makes a change to village or update value
******************************************/
    $scope.$watchGroup(['selectTransactions.selectOption','selectedVillage'], function(){

        if($scope.selectTransactions.selectOption==null||$scope.selectedVillage=== undefined||$scope.selectedVillage==null){
            $scope.clients = [];
            return false;
        }
        //console.log('searching');
        ////console.log($scope.selectTransactions.selectOption);
        //do required search and display client results
        //console.log($scope.selectTransactions.selectOption.length);
        //console.log($scope.selectedVillage.length);
        if($scope.selectTransactions.selectOption != null && $scope.selectedVillage != null){
            $scope.search($scope.selectTransactions.selectOption, $scope.selectedVillage);
        }

    });

    // $scope.$watch('selectedVillage', function(newValue,oldValue){
    //     if(newValue && newValue!=null){
    //         //console.log(newValue.name);
    //         $scope.search($scope.selectTransactions.selectOption, newValue);
    //     }
    // })
    $scope.updateVillage = function(obj){

        //console.log(obj);
        //console.log($scope.selectedVillage);

        $scope.selectedVillage = obj;
        setTimeout(function(){
            $scope.$apply();
            $scope.taskUpd = 1;
        },100);
    }
/******************************************
// Populates the selectbox (update values)
******************************************/
    $scope.selectTransactions = {
        selectOption : null,
        showstatus:{},
        options: [],
        process : function(results){
            var keypair = {'name': '','value': ''};
            // $scope.selectTransactions.options.push(keypair); // empty record
            // $scope.selectTransactions.selectOption=$scope.selectTransactions.options[0];
            results.forEach(function(value,index){
                if(!(value.TST_PK==4||value.TST_PK==7)) //filter out
				{
					//here contains all the statuses in the select box
                    keypair = {'name': value.TST_NAME,'value': value.TST_PK};
                    $scope.selectTransactions.options.push(keypair);
				}
                $scope.selectTransactions.showstatus[value.TST_PK]=value;
                if(localStorage.getItem('statType') && localStorage.getItem('statType') == value.TST_KEY){
                    $scope.selectTransactions.selectOption=keypair
                    localStorage.removeItem('statType');
                }
            });

        },
        setTransactions : function(results){
            $scope.$apply(function() {
                $scope.selectTransactions.process(results);
            });
        },
        getTransactions : function(){
            var scope = this;
            myDB.T_TXN_STATUS.get("TST_PK in(4,5,6,7,26,8,11)",function(results){
                scope.setTransactions(results);
            });
        }
    };
    $scope.selectTransactions.getTransactions();

/******************************************
// Populates the selectbox (village values)
******************************************/

    myDB.T_VILLAGE_MASTER.get(null,function(results){
        //$scope.selectVillage || ($scope.selectVillage = []); //init if null
        $scope.selectVillage = [];
        $scope.selectVillage.push({'name': '','value': ''});
        // if(localStorage.getItem('curr_village') != null){
        //     $scope.sf.CLT_VILLAGE = localStorage.getItem('curr_village');
        //     //localStorage.removeItem('curr_village');
        // } else {
        //     $scope.sf.CLT_VILLAGE = '';
        // }
        $scope.selectedVillage = null;
        $scope.$apply(function(){
            //var cur_vill = localStorage.getItem('curr_village');

            var currVille = 0;
            if(localStorage.getItem('statType') != null){
                currVille = localStorage.getItem('statType');
            } else  if(localStorage.getItem('currentVillage') != null){
                currVille = localStorage.getItem('currentVillage');
            }

            $.each(results, function(ind, val){
                var keypair = {'name': val.VLM_NAME,'value': val.VLM_PK}
                $scope.selectVillage.push(keypair);
                if(currVille!=null && currVille!= undefined && currVille == val.VLM_PK){
                    var row = parseInt(ind+1);
                    $scope.selectedVillage = $scope.selectVillage[row];
                }
            });
            ////console.log($scope.selectedVillage);
            localStorage.removeItem('curr_village');
        });
    });

});

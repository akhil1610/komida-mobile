function init(){

    initTemplate.load(1); //load header

}
/******************************************
// Controller
******************************************/
//myApp = angular.module("myApp", []);

var myApp = angular.module('myApp',['ng-currency', 'pascalprecht.translate']);
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


myApp.controller("PDFCtrl", ['$scope','$timeout', function($scope,$timeout){


	var t = this;

    //initialise
    $scope.clients= [];
    $scope.branch="";
    $scope.updates={};

    $scope.curr_village = null;
    $scope.selectVillage = [];
    $scope.village = {
			            total:null
			        }
    $scope.groups = [];
    $scope.selectVillage = [];
    $scope.selectedGroup = {
            				value:null
        				};
	$scope.defaultGroup =  {
				            value:null
				        };
    $scope.selectClient = null;

    $scope.user = {
        curr_village:null,
        village:{
            total:null
        },
        selectVillage:[],
        groups:[],
        selectedGroup:{
            value:null
        },
        defaultGroup: {
            value:null
        },
        filteredGroups: {
            pending:[],
            completed:[]
        },
    };


    $scope.loadVillages = function(){
        /******************************************
         Display village names
        ******************************************/

        var currVille = 0;
        if(localStorage.getItem('statType') != null){
            currVille = localStorage.getItem('statType');
        } else  if(localStorage.getItem('currentVillage') != null){
            currVille = localStorage.getItem('currentVillage');
        }

        myDB.execute("select * from T_VILLAGE_MASTER", function(results){

                $scope.selectVillage = [];
                for(k in results){
                    var keypair = {'name': results[k].VLM_NAME,'value': results[k].VLM_PK};

                    $scope.selectVillage.push(keypair);


                    if(currVille!=null && currVille!= undefined && currVille == results[k].VLM_PK){
                        $scope.curr_village = keypair;
                        $scope.village= keypair;
                        $scope.village.groups = [];
                    }
                }
                //console.log($scope);
                setTimeout(function(){
                    $scope.$apply();
                    $scope.loadGroup();
                },50)
        });
    }

    $scope.loadVillages();

    $scope.loadGroup = function(){

        //Translations dont seems to work with ng-repeat in html, thus resulted in this method

        $scope.expected = i18n.t("messages.Expected");
        $scope.grouptext = i18n.t("messages.Group");
        $scope.weektext = i18n.t("messages.Week");

        var date = new Date();
        date = date.getFullYear()+"-"+("0"+(date.getMonth()+1)).slice(-2)+"-"+("0"+date.getDate()).slice(-2);

        //RESET GROUPS DATA
        $scope.groups = [];
        $scope.village.groups = [];

        setTimeout(function(){
            var cmd1 =  " SELECT distinct CLL_GROUP_ID,cll_clt_pk,clt_village,vlm_name ";
                cmd1 += " FROM T_CLIENT_LOAN,t_client,T_VILLAGE_MASTER ";
                cmd1 += " WHERE clt_traning_completed='Y' ";
                cmd1 += " and cll_status > 11";
                cmd1 += " and clt_pk = cll_clt_pk and CLL_IS_GROUP_LEADER='Y' ";
                cmd1 += " and vlm_pk = clt_village ";
                cmd1 += " and DATE(clt_traning_end_date) !='"+date+"'" ;
                //cmd1 += " AND CLL_BRC_PK="+ $scope.user.branchPK + " AND CLL_CENTER_ID='" + $scope.user.centreID + "'";
                cmd1 += " and clt_village="+$scope.curr_village.value;


            //retrieve all the groups that are tagged to the user
            myDB.execute(cmd1, function(results){

                if(results.length<=0) {

                }else{

                    for(k in results){
                        $scope.groups.push(results[k]);
                    }
                }

                setTimeout(function(){
                    //$scope.checkComplete();
                    $scope.viilletotal();


                },50);
            });
        },0);
    }

    $scope.viilletotal = function(){
    	//console.log('tada');

    	var cmd1 = "";
    	cmd1 += " SELECT CLL.CLL_GROUP_ID,clt_village,vlm_name, ";
    	cmd1 += " (COUNT(CLL.CLL_GROUP_ID)) as clientcount ";
    	cmd1 += " FROM T_CLIENT_LOAN CLL ";
        cmd1 += " LEFT JOIN t_client ON (clt_pk = CLL.cll_clt_pk AND CLT_PK=CLL.CLL_CLT_PK) ";
        cmd1 += " LEFT JOIN T_VILLAGE_MASTER ON vlm_pk = clt_village ";
        cmd1 += " WHERE clt_village="+$scope.curr_village.value;
        cmd1 += " GROUP BY CLL.CLL_GROUP_ID ";
        cmd1 += " ORDER BY 1";


        $scope.user.village.groups = [];
        myDB.execute(cmd1, function(results){
            //console.log(results);
            if(results.length==0){
                //console.log("no results");
                $scope.village.groups = null;
            } else {
                $scope.village.groups = results;
            }
            $scope.$apply();
        });

    	// var cmd = "";
     //    cmd =  "SELECT * ";
     //    cmd += "FROM T_CLIENT, T_CLIENT_LOAN, T_VILLAGE_MASTER WHERE ";
    	// cmd += "CLT_STATUS=7 AND CLL_STATUS=10 AND CLT_PK=CLL_CLT_PK ";
    	// cmd += "AND CLT_VILLAGE="+$scope.curr_village.value+" AND CLT_VILLAGE==VLM_PK ";

    	// myDB.execute(cmd,function(){

    	// });
    }

    $scope.selectGroup = function(){
    	//console.log("booyah");
    }

    $scope.changeGroup = function(group){
        var keypair = { 'name': group.VLM_NAME, 'value': group.CLL_GROUP_ID} ;
        $scope.autoSelGroup(keypair) ;
        //$("html, body").animate({ scrollTop: 0 }, 600);
        return false;
    }

    $scope.detailview = function(){
        if($scope.clientspage)
            $scope.clientspage = false;
        else
            $scope.clientspage = true;

        if($scope.clientspage){
        	$scope.loadClients();
            $('.first-page').hide();
            $('.second-wrapper').show();
            $('.second-page').fadeOut();
        } else {
            $('.first-page').fadeIn();
            $('.second-page').show();
            $('.second-wrapper').hide();
        }


    }

    $scope.autoSelGroup = function(obj){

        //console.log($scope.selectedGroup);
        $scope.selectedGroup = obj;
        //console.log($scope.selectedGroup);
        localStorage.removeItem('statType');

        $scope.selectGroup();
        $("#transgroupID").selectmenu("refresh", true);
    }

    this.getResults = function(results){
    	//console.log(results);
        $.each(results, function(ind,clt){//initialise the checkbox for correct UI toggle at doSelectAll()
            $scope.updates[ind] = false;
        });

        $scope.$apply(function () {
            $scope.clients = results;
            if($scope.clients.length > 0){
            	$scope.selectClient = $scope.clients[0];
            }
            $scope.updates;
        });
    };

    $scope.watchSelected = $scope.$watch('selectClient', function(newValue,oldValue) {
    	//console.log(newValue);
    	if(newValue != null){
    		loadForm();
    		loadSignaturePad();
    	}

    })

    $scope.loadClients = function(){

    	var cmd = "";
        cmd = "SELECT CLL_GROUP_ID,clt_village,vlm_name, * FROM T_CLIENT, T_CLIENT_LOAN, T_VILLAGE_MASTER WHERE ";
    	cmd += ' CLT_PK=CLL_CLT_PK';
    	cmd += " AND CLT_VILLAGE="+$scope.curr_village.value+" AND CLT_VILLAGE==VLM_PK";
        cmd+=" ORDER BY CLT_FULL_NAME"; //sorting the order so it's consistent
        //console.log(cmd);
        $scope.updates={}; //reset updates
        myDB.execute(cmd, function(results){
            t.getResults(results);
            $scope.$apply();
        });
    }

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
                cmd.push("UPDATE T_CLIENT_LOAN SET CLL_STATUS="+status+" WHERE CLL_PK="+loanPK);
                cmd.push("INSERT INTO T_STAT_UPDATE VALUES(null,"+clientPK+","+loanPK+","+status+")");
            }
        }

        if(cmd.length==0) return false; //if no updates, return

        myDB.dbShell.transaction(function(tx){
            for(e in cmd) tx.executeSql(cmd[e]);
	    }, function(err){
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
                    $scope.clients = [];
                    $scope.selectAll = false;
                });
            });

        });
    };

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

            results.forEach(function(value,index){
                if(!(value.TST_PK==4||value.TST_PK==7||value.TST_PK==26)) //filter out
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
            myDB.execute("SELECT * FROM T_TXN_STATUS WHERE TST_PK in(4,5,6,7,26,8,11)",function(results){
                scope.setTransactions(results);
            });
        }
    };
    $scope.selectTransactions.getTransactions();


    /******************************************
	// Populates the selectbox (village values)
	******************************************/

    myDB.execute("SELECT * FROM T_VILLAGE_MASTER",function(results){

        $scope.selectVillage = [];
        $scope.selectVillage.push({'name': '','value': ''});

        $scope.selectedVillage = null;
        $scope.$apply(function(){

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
            localStorage.removeItem('curr_village');
        });
    });

}]);

var $sigdiv = $("#signature")
var canvas = $('#the-canvas')[0];
var context = canvas.getContext("2d");

var imht = 0;
var imwt = 0;

var img2 = "";



function loadSignaturePad(){

	$('#sigbtn').fadeIn();

	if($('canvas.jSignature').length == 0){
		$sigdiv.jSignature({
			width:'50%',
			height:200,
			lineWidth:5,
			'border-bottom':'2px solid black',
			'background-color': 'transparent',
			'decor-color': 'transparent',
		});
	}
	$('#signature').jSignature('clear');
	$('.displayarea').html('');
	context.clearRect(0, 0, canvas.width, canvas.height);

	$('.jSignature').css('border-bottom','2px solid black');
	$('.jSignature').css('margin-bottom','50px');

}

function loadForm(){
	var $img = new Image();

    canvas.width = $(window).width();

    $img.onload = (function() {

    	var ratio = $img.naturalWidth / $(window).width();

    	var height = parseFloat($img.naturalHeight / ratio  );
    	canvas.height = height;

		var width = parseFloat($img.naturalWidth / ratio  );

		imht = height;
		imwt = width;



        context.drawImage($img, 0, 0,width,height);

        var name = $('#selectClient option:selected').text();


		ht = imht * 0.58;
		wt = imwt * 0.30;

		context.font = "bold 1.5em Arial";
		context.fillText(name,wt,ht);

    });

	$img.src = 'img/samplepdf.png';
}

$(document).on('click','#download',function(){
	downloadCanvas(this, 'the-canvas', 'somethinghere.png');
});

function downloadCanvas(link,canvas,filename){

	if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {

	   	//console.log('You are using a mobile device!');
	   	var fileTransfer = new FileTransfer();
	    var uri = encodeURI(url);
	    var filePath= "/sdcard/directory/file.extension";
	    fileTransfer.download(uri,filePath,
		    function(entry) {
		        //success
		    },
		    function(error) {
		        //failed
		    }
	    );
	}
	else
	{
	   	//console.log('You are not using a mobile device!');
	   	$(link).attr('href',$("#"+canvas)[0].toDataURL("image/png"));
		link.download = filename;
	}

}


function clearSignature(){
	$('#signature').jSignature('clear');
	$('.displayarea').html('');
	context.clearRect(0, 0, canvas.width, canvas.height);
	loadForm();
}


function importImg(sig){

	var data = sig.jSignature('getData', 'image');
	//console.log(data);
	var dsrc = 'data:' + data[0] + ',' + data[1];
	var png = sig.jSignature('getData','base30');


	var ht = imht
	var wt = imwt;

	ht = ht * 0.67;
	wt = wt * 0.22;


	var img2 = new Image();
    img2.onload = (function(){
    	 context.drawImage(img2, wt, ht, 250,100);
    });
    img2.src = dsrc;
}

function loadImage(src, onload) {
    // http://www.thefutureoftheweb.com/blog/image-onload-isnt-being-called
    var img = new Image();
    img.onload = onload;
    img.src = src;
    return img;
}

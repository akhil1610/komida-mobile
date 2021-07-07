//var window.serverURL = (localStorage.getItem("SYNC_SERVER")||$('#setip').val());
//var window.serverURL = 'http://192.168.88.88:5245/Prodigy/CommonBuildJSON';
//var window.serverURL = 'http://192.168.88.33:8080/MBK/CommonBuildJSON';
//var window.serverURL = 'http://192.168.88.103:8080/MBK/CommonBuildJSON';
// window.serverURL = 'http://192.168.88.235:8080/MBK/CommonBuildJSON';
//var window.serverURL = 'http://192.168.88.224:9080/MBK/CommonBuildJSON';
// window.serverURL = 'http://100.127.229.140:5245/Prodigy/CommonBuildJSON';
//var window.serverURL = 'http://prodigy.t-bop.com:5245/Prodigy/CommonBuildJSON';
window.serverURL   = 'http://komidauat.t-bop.com/Prodigy/CommonBuildJSON';
/******************************************
// Utility
******************************************/
window.SERVERS = {
	'http://101.127.229.140:5245/Prodigy/CommonBuildJSON': 'Backup',
	'http://komidauat.t-bop.com/Prodigy/CommonBuildJSON': 'komidauat.t-bop.com',
};
if (localStorage.hasOwnProperty('SYNC_SERVER')) {
	window.serverURL = localStorage.getItem('SYNC_SERVER');
}
var fouserid;
var fopassword;
var mgruserid;
var mgrpassword;
 
localStorage.setItem("DEVTEST", false)
document.addEventListener("deviceready", function() {
	//window.cache.clear( success, error );  
}, false);

function sanitize(text) {
	return encodeURIComponent((text+"").replace(/'/g, "%27")); //instead of replace ' with '' 
}
if(!devtest)$("#development").hide(); //if development hide the label in development tab
var timeAllowedToIdle = 15 * 1000;
var countingDown = timeAllowedToIdle; 
var refreshIntervalId = null;
var retrycounter = 3;//retry # of times before display error.
 
const sync = new Sync();
function setLanguage(language) {

    if(typeof(Storage) !== "undefined") {
        sessionStorage.LANGUAGE = language;
    } else {
        console.log("Sorry, your browser does not support web storage!");
    }

    i18n.setLng(language, function(t) {
        $('body').i18n();
    });
} 
 
function retryCountdown(){
    if(retrycounter > 0){
        countingDown -= 1000;
        if(countingDown <= 0){ 
            console.log("stopped"); 
            stopCountdown();
            promptRetry();
            retrycounter--; 
            return false;
        } else {
            console.log(countingDown);
        }
    } else {
        swal({
            title: i18n.t("messages.Alert"),
            text: i18n.t("messages.ContactItSupport"),
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#80C6C7",
            confirmButtonText: i18n.t("messages.Yes"),
        }).then(function(isConfirm){
            if(isConfirm){
                
            }
        },function(dismiss) {
    
        });
    } 
}

function startCountdown(){
    refreshIntervalId = setInterval(retryCountdown,1000);
}
function promptRetry(){
    $.mobile.loading("hide");
    swal({
        title: i18n.t("messages.Alert"),
        text: i18n.t("messages.SyncIdle"),
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#80C6C7",
        confirmButtonText: i18n.t("messages.Yes"),
    }).then(function(isConfirm){
        if(isConfirm){
            
        }
    },function(dismiss) {

    });
}
function stopCountdown(){
    clearInterval(refreshIntervalId);  
} 
function checkNull(value){
	if(value === null || value === '' || value.length === 0){
		return '';
	} else {
		return value;
	}
}
function nullToEmpty(val){
	for(var key in val){
		if(val[key] === null || val[key] === undefined || val[key].length===0 || val[key] === 'null' || val[key] == 'undefined'){
			val[key] = '';
		}
	}
	return val;
}
function nullTonullString(val){
	for(var key in val){
		if(val[key] === null || val[key] === undefined ||  (val[key] === '' && val[key] !== 0)  ){
			val[key] = 'null';
		}
	}
	return val;
}

function checkBothCreds() {
    if(mgruserid != undefined && localStorage.getItem("LOGIN_MANAGER")){
        $('.loginbtn').fadeIn(); 
        syncData();
    } 
}
function syncData(){ 
    swal({ 
        title: i18n.t("messages.DoYouWantPullData"),
        text: i18n.t("messages.TermsConditions6"), 
        showCancelButton: true,
        confirmButtonColor: '#0091EA',
        cancelButtonColor: '#EF5350',
        confirmButtonText: i18n.t("messages.pulldata")
    }).then((result) => {
        if (result.value) {
            sync.beginSync(2);
        }
    })  
}

function getPullCRED(){
 
	return [fouserid,fopassword,mgruserid,mgrpassword];
}
$('#syncbutton').on('click', function(){ 
    fouserid = $('#fouserid').val();
    fopassword = $('#fopassword').val(); 

    if(fouserid == '' || fopassword == ''){
        swal({
            type: 'error',
            title: 'Oops...',
            text: i18n.t("messages.MissingCreds"), 
        })
        return false;
    } 

    mgruserid = $('#mgruserid').val();
    mgrpassword = $('#mgrpassword').val(); 
    if(mgruserid == '' || mgrpassword == ''){
        swal({
            type: 'error',
            title: 'Oops...',
            text: i18n.t("messages.MissingCreds"), 
        })
        return false;
    } 

    fologin()
        .then(result =>{
            if(result) {
                fologinSuccess();
                return mgrlogin();
            }
        })
        .then( result => {
            if(result) {
                mgrloginSuccess();
                setTimeout(() => {
                    syncData(); 
                }, 1500); 
            }
        });

});
$('#fosyncbutton').on('click', function(){ 
    fologin() 
});

$('#mgrsyncbutton').on('click', function(){ 
    mgrlogin() 
});

function fologinSuccess() {
    $('#fologin').hide();
    $('.fotickcontainer').show();
    $('#fotrigger').show();
    $('#fotick').fadeIn();
    if(!$("#fotrigger").hasClass("drawn")){
        $("#fotrigger").addClass("drawn")
    }
}

function mgrloginSuccess() {
    $('#mgrlogin').hide();
    $('.mgrtickcontainer').show();
    $('#mgrtrigger').show();
    $('#mgrtick').fadeIn();
    if(!$("#mgrtrigger").hasClass("drawn")) {
        $("#mgrtrigger").addClass("drawn");
    }
    
}

function fologin(){ 

    fouserid = $('#fouserid').val();
    fopassword = $('#fopassword').val(); 

    if(fouserid == '' || fopassword == ''){
        swal({
            type: 'error',
            title: 'Oops...',
            text: i18n.t("messages.MissingCreds"), 
        })
        return false;
    } 
 
    var obj = [fouserid, fopassword ];
    var p = new Promise((res, rej) => {
        $.ajax({
            url: window.serverURL,
            cache: false,
            type: "POST",
            data: "strMode=FoLogin&cred="+JSON.stringify(obj),
            crossDomain: true,
            processData: false,
            success: function(result){ 
                console.log(result)
                if(result=="Success"){ 
                    swal(i18n.t("messages.loginsuccess"));  
                    localStorage.setItem("LOGIN_USERNAME",fouserid); 
                    //fologinSuccess()
                    //checkBothCreds()
                    res(true);
                    return false;
                    //window.location.href = "mgrlogin.html";
                } else if(result == "FO cannot Pull data again."){
                    swal({
                        type: 'error',
                        title: 'Oops...',
                        text: i18n.t("messages.FOCannotPullAgain"), 
                    })
                    $("#mgrtrigger").toggleClass("drawn")
                    $("#fotrigger").toggleClass("drawn")
                } else { 
                    swal({
                        type: 'error',
                        title: 'Oops...',
                        text: i18n.t("messages.CredsMismatch"), 
                    })
                    $("#mgrtrigger").toggleClass("drawn")
                    $("#fotrigger").toggleClass("drawn")
                }
                res(false);
            },
            error: function(jqXHR,textStatus,errorThrown){ 
                if(jqXHR.responseText == 'FO cannot Pull data again.'){ 
                    swal({
                        type: 'error',
                        title: 'Oops...',
                        text: i18n.t("messages.FOCannotPullAgain"), 
                    })
                } else {
                    swal({
                        type: 'error',
                        title: 'Oops...',
                        text: i18n.t("messages.loginfail"), 
                    })
                }
                // $("#mgrtrigger").toggleClass("drawn")
                // $("#fotrigger").toggleClass("drawn")
                res(false);
            }
        });
    })
    return p;
}

function mgrlogin(){ 
    mgruserid = $('#mgruserid').val();
    mgrpassword = $('#mgrpassword').val(); 
    if(mgruserid == '' || mgrpassword == ''){
        swal({
            type: 'error',
            title: 'Oops...',
            text: i18n.t("messages.MissingCreds"), 
        })
        return false;
    }
    
    var obj = [ mgruserid, mgrpassword ];
    var p = new Promise( (res,rej) => {
        $.ajax({
            url: window.serverURL,
            cache: false,
            type: "POST",
            data: "strMode=MgrLogin&cred="+JSON.stringify(obj),
            crossDomain: true,
            processData: false,
            success: function(result){ 
                swal.close();
                if(result=="Success"){ 
                    localStorage.setItem("LOGIN_MANAGER",mgruserid);
                    res(true);
                    return false;
                    // swal(i18n.t("messages.loginsuccess"));  
                    // mgrloginSuccess()
                    // checkBothCreds()  
                } else { 
                    swal({
                        type: 'error',
                        title: 'Oops...',
                        text: i18n.t("messages.CredsMismatch"), 
                    })
                }
                res(false);
            },
            error: function(jqXHR,textStatus,errorThrown){ 
                swal.close();
                swal({
                    type: 'error',
                    title: 'Oops...',
                    text: i18n.t("messages.loginfail"), 
                })
                res(false);
            }
        });
    });
    return p;
}

localStorage.setItem("SYNC_SERVER",window.serverURL);

function ResponseFO(type){

	if(type == 'Reset'){
		swal({
			title: i18n.t("messages.Alert"),
			text: i18n.t("messages.ConfirmReset"),
			type: "warning",
			showCancelButton: true,
			confirmButtonColor: "#80C6C7",
			confirmButtonText: i18n.t("messages.Yes"),
		}).then(function(isConfirm){
			if(isConfirm){
				ResponseFOSecond(type);
			}
		},function(dismiss) {

		});
	} else {
		ResponseFOSecond(type);
	}

}

function ResponseFOSecond(type){

	var typeStr = type;

	if(type == 'Reset'){
		typeStr = 'Post';
	} 
	myDB.execute("SELECT USER_PK FROM T_USER WHERE USER_ROLE=4 ",function(res){

		var USER_PK = res[0].USER_PK;
		var CRED_ARR = [];

		if(type == 'Reset'){
			CRED_ARR = getResetCRED();
		} else if (type =='Pull') {
            sync.s
			CRED_ARR = getPullCRED();
		} else if (type =='Push') {
			CRED_ARR = getPushCRED();
		}

		var obj = {
			DATA: [USER_PK,typeStr],
			CRED: CRED_ARR
		};

		$.ajax({
			url: window.serverURL,
			cache: false,
			type: "POST",
			data: "strMode=reset&data="+JSON.stringify(obj),
			crossDomain: true,
			processData: false,
			success: function(result){
		 
				if(result=="Success"){
					if(type=='Reset' || type == 'Push') {
						endSync(i18n.t("messages.FOResetSuccess"));
						myDB.reset();
						setTimeout(function(){
							localStorage.removeItem('TODAYS_CRS_PKS');
							location.reload();
						},500);
					} else if(type == 'Pull'){
					   //login(); //window.location.href = "advancecash.html";
                       myDB.addSurvey(); 
                       getTodaysCRS();
					   //updateCRS();
					}
				}else{
					//syncmgr.endsync("Client sync failed.");
					if(type=='RESET')endSync(i18n.t("messages.FOResetFail"));
					return true;
				}
			},
			error: function(jqXHR,textStatus,errorThrown){
				//syncmgr.endsync("Sync clients failed: "+jqXHR.responseText); 
				if(type == 'Pull'){
					updateCRS();
				} else if(type=='reset')endSync(i18n.t("messages.FOResetFail")+jqXHR.responseText);

			}
		});
	});
}

var AjaxSyncCheckVersion = null;

function closeSyncLog(){
	AjaxSyncCheckVersion.abort();
	$.mobile.loading("hide");

}

function Sync(){

	var date = new Date();

	var dayOfWeek = date.getDay() + 1;

	date = ("0"+date.getDate()).slice(-2)+"/"+("0"+(date.getMonth()+1)).slice(-2)+"/"+date.getFullYear();

	var anotherdate = new Date();
	anotherdate = anotherdate.getFullYear()+"-"+("0"+(anotherdate.getMonth()+1)).slice(-2)+"-"+("0"+anotherdate.getDate()).slice(-2);

	var syncmgr = this; //the sync manager singleton
    var synccounter = 0; //counts if any items are synced, if not -> "Nothing is synced"
 
	this.syncError = function(){
		//syncmgr.endsync("Sync has encountered an error.");
		syncmgr.endsync(i18n.t("messages.SyncError"));
	}; //declare sync error function

	this.orderSync = {}; //start orderSync "scheduler", runs different syncs in a sequence
  
	//to change the sequence sync is performed, just change the items on the list
	syncmgr.beginSync = function(syncmode){
		syncmgr.orderSync.syncfn_arr = [
            syncmgr.checkVersion,
            syncmgr.resetDB
        ]; //pull sync only needs to checkVersion

		syncmgr.orderSync.sync_fn(syncmgr.orderSync.syncfn_arr.shift(),syncmode); //start syncing
	};

	syncmgr.orderSync.sync_fn = function(fn,syncmode){ //this is looped
		var promise = fn(); //run the function that is passed as argument, get promise
		promise.done(function(){ //sync is done, do next
			if(syncmgr.orderSync.syncfn_arr.length>0) //if there are more functions, continue
				syncmgr.orderSync.sync_fn(syncmgr.orderSync.syncfn_arr.shift(),syncmode);
			else{ //sync is done
				if(syncmode==1) {
					syncmgr.endPushSync();
				} else {
                    console.log("pulling");
                    console.log(new Date())
					syncmgr.pullRequest();
				}             //else, call pull request
			}
		});
	};

	this.resetDB = function(){

		var promise = new $.Deferred(); //create promise
        console.log("reset");
        console.log(new Date());
		if(!devtest){ if(fileManager)fileManager.delete();}
		$.when(myDB.reset()).done(function(){
            console.log("reset done");
            console.log(new Date());
			promise.resolve();
		});

		return promise;
	};

	this.checkVersion = function(){

		//save username and password, //!Note: put this elsewhere
		localStorage.setItem("LOGIN_USERNAME",$("#syncuserid").val());
		localStorage.setItem("LOGIN_PASSWORD",$("#syncpassword").val());
		localStorage.setItem("LOGIN_MANAGER",$("#syncmgrid").val());
		$('#userid').val($("#syncuserid").val());
		$('#password').val($("#syncpassword").val());
		$('#syncmgrid').val($("#syncmgrid").val());

		var promise = new $.Deferred(); //create promise 
		syncmgr.synclog(i18n.t("messages.CheckServerVersion"));
         
		$.ajax({ //!Note: Probably refactor all ajax calls so we don't have multiples of the same declaration
			url: window.serverURL,
			type: "POST",
			async: true,
			cache: false,
			data: "strMode=checkversion",
			crossDomain: true,
			success:
			function(result){
				console.log(result);
				var currVersion = localStorage.getItem("DATABASE_VERSION"); //this value is set in initdb
				if(currVersion==result){ //check version here
					// syncmgr.synclog("Version check successful.");
					syncmgr.synclog(i18n.t("messages.VersionCheckSuccess"));
					promise.resolve();
				}else{
					//syncmgr.endsync("Your application version is "+currVersion+"\nServer version is "+result);
					syncmgr.endsync(i18n.t("messages.ApplicationVersion") + ' ' + currVersion + "\n" + i18n.t("messages.ServerVersion")+ ' ' + result + "\n" + i18n.t("messages.PleaseUpdateApp"));
				}
			},
			error: function(jqXHR,textStatus,errorThrown){
				//syncmgr.endsync("Check version failed: "+jqXHR.responseText);
				var err = eval("(" + jqXHR.responseText + ")");
				if(err !== undefined){
					syncmgr.endsync(i18n.t("messages.VersionCheckFail") + err.Message);
				}

			}
		});
		return promise;
	};
   
	/******************************************
	// End of syncing, report
	******************************************/
	this.endPushSync = function(){
	   // if(synccounter==0) syncmgr.endsync("No data to sync.");

	   ResponseFO('Push');
		if(synccounter === 0) {
			syncmgr.endsync(i18n.t("messages.NoDataToSync"));
		} else {
			syncmgr.endsync(i18n.t("messages.SyncSuccess"));

		}
	};

	/******************************************
	// Pull data
	******************************************/
	this.pullRequest = function(){

		var dt = new Date();
		var time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();
	 
		var cred = getPullCRED(); 
        var promise = $.Deferred(); 
        
        swal.queue([{
            title: i18n.t("messages.PullData"),  
            onOpen: () => {
                swal.showLoading();
            },
            showConfirmButton: false,
            allowOutsideClick: () => !this.$swal.isLoading()
        }]);    
        console.log("pulling");
        startCountdown();
        $.ajax({
            url: window.serverURL,
            type: "POST",
            cache: false,
            async: true,
            data: "strMode=pull&cred="+JSON.stringify(cred),
            crossDomain: true,
            dataType: 'json',
            success: function(result){
                console.log("pull done");
                console.log(new Date())
                //syncmgr.synclog("Pull success, initiating database");
                // syncmgr.synclog(i18n.t("messages.PullDataSuccess"));

                fologinSuccess();
                mgrloginSuccess();
                //console.log(result); 
                swal.getContent().get
                swal.getContent().textContent = i18n.t("messages.PullDataSuccess");
                promise.resolve(result);
                stopCountdown(); 
                //res(result);
                
            },
            error: function(jqXHR, textStatus, errorThrown){
                console.log(jqXHR.responseText);
                //syncmgr.endsync("Sync failed. Check username and password.");
                if(jqXHR.responseText == 'FO cannot Pull data again.'){
                    syncmgr.endsync(i18n.t("messages.FOCannotPullAgain"));
                } else if(jqXHR.responseText == 'NoRecordFoundInSync'){
                    syncmgr.endsync(i18n.t("messages.NoRecordFoundInSync"));
                } else if(jqXHR.responseText == 'UserNotMapped'){ 
                    syncmgr.endsync(i18n.t("messages.UserNotMappedToCenter"));
                } else {
                    syncmgr.endsync(i18n.t("messages.SyncFail"));
                } 
                stopCountdown();
                promise.reject();
                //rej(jqXHR.responseText)
                return false;
            }
        });
            
         
        
		promise.done(function(result){
            swal.hideLoading();
            console.log("promise done");
			var dt = new Date();
			var time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();
			console.log("received data - "+time);
            console.log(result); 
            console.log(result.T_CLIENT_REPAY_SCHEDULE);
			var preps = [];
			var commands = [];
			var cmdar = {
				prepared: null,
				values: [],
			}; 
			var cmd = "INSERT INTO T_COMPANY ( "+
						"CMP_PK,"+
						"CMP_NAME,"+
						"CMP_ID,"+
						"CMP_ADDRESS,"+
						"CMP_ZIP,"+
						"CMP_PHONE,"+
						"CMP_FAX,"+
						"CMP_CONTACT_NAME,"+
						"CMP_CONTACT_ADDRESS,"+
						"CMP_CONTACT_ZIP,"+
						"CMP_CONTACT_RPHONE,"+
						"CMP_CONTACT_HPHONE,"+
						"CMP_CONTACT_EMAIL,"+
						"CMP_CONTACT_FAX,"+
						"CMP_IS_ACTIVE,"+
						"CMP_SCHEDULE_BY_BRNET,"+
						// "CMP_DEFAULT_LOAN_INTEREST,"+
						// "CMP_DEFAULT_CRF_INTEREST,"+
						"CMP_SMS_FORMAT,"+
						"CMP_RECEIPT_FORMAT,"+
						"CMP_SMS_LABEL,"+
						"CMP_RECEIPT_LABEL,"+
						// "CMP_ARREARS_PERCENTAGE,"+
						"CMP_TRAINING_DAYS,"+
						"CMP_CREATED_BY,"+
						"CMP_CREATED_TIMESTAMP,"+
						"CMP_MODIFIED_BY,"+
						"CMP_MODIFIED_TIMESTAMP) "+
						" VALUES "+
						" (?,?,?,?,?,?,?,?,?,?,"+
						"  ?,?,?,?,?,?,?,?,?,?,"+
						"  ?,?,?,?,?) ";

			cmdar.prepared = cmd;
			var valu = nullTonullString(result.T_COMPANY);
			cmdar.values.push(valu);
			preps.push(cmdar);

			var cmdar2 = {
				prepared: null,
				values : [],
			};

			cmd = "INSERT INTO T_BRANCH ("+
					"BRC_PK,"+
					"BRC_CMP_PK,"+
					"BRC_NAME,"+
					"BRC_BRANCH_ID,"+
					"BRC_ADDRESS,"+
					"BRC_ZIP,"+
					"BRC_PHONE,"+
					"BRC_FAX,"+
					// "BRC_DEFAULT_LOAN_AMOUNT,"+
					"BRC_PR_CONTACT_NAME,"+
					"BRC_PR_CONTACT_ADDRESS,"+
					"BRC_PR_CONTACT_ZIP,"+
					"BRC_PR_CONTACT_RPHONE,"+
					"BRC_PR_CONTACT_HPHONE,"+
					"BRC_PR_CONTACT_EMAIL,"+
					"BRC_PR_CONTACT_FAX,"+
					"BRC_IS_ACTIVE,"+
					// "BRC_HOUSE_INDEX_CAP,"+
					// "BRC_INCOME_CAP,"+
					// "BRC_NO_OF_LOANS_FROM_OTHERBANKS,"+
					// "BRC_WELFARE_STATUS_CAP,"+
					"BRC_DISBURSE_NOTIFICATION,"+
					"BRC_CREATED_BY,"+
					"BRC_CREATED_TIMESTAMP,"+
					"BRC_MODIFIED_BY,"+
                    "BRC_MODIFIED_TIMESTAMP,"+
                    "BRC_NOOFCLIENTS_INGROUP)"+
					" VALUES "+
					" (?,?,?,?,?,?,?,?,?,?,"+
					"  ?,?,?,?,?,?,?,?,?,?,"+
					"  ?,?) ";

			cmdar2.prepared = cmd;
			var valu = nullTonullString(result.T_BRANCH);
			cmdar2.values.push(valu);
			preps.push(cmdar2);

			if(result.T_CODE && result.T_CODE.length > 0){

				var cmdarr = {
						prepared: null,
						values : [],
					};

				cmd = "INSERT INTO T_CODE ("+
						"CODE_PK,"+
						"CODE_TYPE_PK,"+
						"CODE_VALUE,"+
						"CODE_NAME,"+
						"CODE_DESC,"+
						"CODE_IS_ACTIVE,"+
						"CODE_CREATED_BY,"+
						"CODE_CREATED_DATE,"+
						"CODE_UPDATED_BY,"+
						"CODE_UPDATED_DATE)"+
						" VALUES "+
						" (?,?,?,?,?,?,?,?,?,?)";

				cmdarr.prepared = cmd;

				$.each(result.T_CODE, function(ind, val){
					var valu = nullTonullString(val);
					cmdarr.values.push(valu);
				});
				preps.push(cmdarr);

			}

			if(result.T_TXN_STATUS && result.T_TXN_STATUS.length > 0){

				var cmdarr = {
						prepared: null,
						values : [],
					};

				cmd = "INSERT INTO T_TXN_STATUS ("+
						"TST_PK,"+
						"TST_NAME,"+
						"TST_GIF_NAME,"+
						"TST_KEY)"+
						" VALUES "+
						" (?,?,?,?)";

				cmdarr.prepared = cmd;

				$.each(result.T_TXN_STATUS, function(ind, val){
					var valu = nullTonullString(val);
					cmdarr.values.push(valu);
				});
				preps.push(cmdarr);

			}

			if(result.T_USER && result.T_USER.length > 0){

				var cmdarr = {
						prepared: null,
						values : [],
					};

				cmd = "INSERT INTO T_USER ("+
						"USER_PK,"+
						"USER_ID,"+
						"USER_ROLE,"+
						"USER_CMP_PK,"+
						"USER_BRC_PK,"+
						// "USER_CTR_PK,"+
						// "USER_CTR_NAME,"+
						// "USER_CTR_ID,"+
						"USER_TITLE,"+
						"USER_NAME,"+
						"USER_GENDER,"+
						"USER_DOB,"+
						"USER_EMAIL,"+
						"USER_OFFICE_PH_NO,"+
						"USER_MOBILE_PH_NO,"+
						"USER_DEPARTMENT,"+
						"USER_OTH_DEPARTMENT,"+
						"USER_DESIGNATION,"+
						"USER_STATUS,"+
						"USER_INACTIVE_DATE,"+
						"USER_PASSWORD,"+
						"USER_PREV_PWD_1,"+
						"USER_PREV_PWD_2,"+
						"USER_PREV_PWD_3,"+
						"USER_UNIQUE_SALT,"+
						"USER_PWD_CHG_DATE,"+
						"USER_FAILED_ATTEMPTS,"+
						"USER_LOGIN_ACTIVE,"+
						"USER_LAST_ACCESS_DATE,"+
						"USER_EMAIL_SENT,"+
						"USER_GROUP_SEQUENCES,"+
						"USER_CREATED_BY,"+
						"USER_CREATED_DATE,"+
						"USER_UPDATED_BY,"+
						"USER_UPDATED_DATE, "+
						"USER_HAVE_SIGNATURE, "+
						"USER_SIGNATURE)"+
						" VALUES "+
						" (?,?,?,?,?,?,?,?,?,?,"+
						"  ?,?,?,?,?,?,?,?,?,?,"+
						"  ?,?,?,?,?,?,?,?,?,?,"+
						"  ?,?,?,null)";

				cmdarr.prepared = cmd;

				$.each(result.T_USER, function(ind, val){
					var valu = nullTonullString(val);
					cmdarr.values.push(valu);
				});
				preps.push(cmdarr);
			}

			if(result.T_CLIENT_ASSETS_LIST && result.T_CLIENT_ASSETS_LIST.length > 0){

				var cmdarr = {
						prepared: null,
						values : [],
					};

				cmd = "INSERT INTO T_CLIENT_ASSET_LIST ("+
						"CAL_PK,"+
						"CAL_CLT_PK,"+
						"CAL_CLL_PK,"+
						"CAL_ASSET_NAME,"+
                        "CAL_ASSET_VALUE,"+
                        "CAL_ASSET_CONDITION,"+
						"CAL_MOB_NEW) "+
						" VALUES "+
						" (?,?,?,?,?,?,0) ";

				cmdarr.prepared = cmd;

				 $.each(result.T_CLIENT_ASSETS_LIST, function(ind, val){
					var valu = nullTonullString(val);
					cmdarr.values.push(valu);
				});

				preps.push(cmdarr);
			}

			if(result.T_CHANGE_MEETING_DATE && result.T_CHANGE_MEETING_DATE.length > 0){

				var cmdarr = {
						prepared: null,
						values : [],
					};

					 
				cmd = "INSERT INTO T_CHANGE_MEETING_DATE ("+
						"CMD_PK,"+ 
						"CMD_CENTER_PK,"+
						"CMD_GROUP_ID,"+
						"CMD_CENTER_ID,"+
						"CMD_OLD_MEETING_DAY,"+
						"CMD_NEW_MEETING_DAY,"+
						"CMD_OLD_MEETING_TIME,"+ 
						"CMD_NEW_MEEETING_TIME,"+
						"CMD_STATUS,"+
						"CMD_CREATED_BY,"+
						"CMD_CREATED_DATE,"+ 
						"CMD_NEW) "+
						" VALUES "+
						" (?,?,?,?,?,?,?,?,?,?,"+
						"  ?,0) ";

				cmdarr.prepared = cmd;

				$.each(result.T_CHANGE_MEETING_DATE, function(ind, val){
					var valu = nullTonullString(val);
					cmdarr.values.push(valu);
				});
				preps.push(cmdarr); 

			}

			if(result.T_CLIENT_GROUP && result.T_CLIENT_GROUP.length > 0){

				var cmdarr = {
						prepared: null,
						values : [],
					};

				cmd = "INSERT INTO T_CLIENT_GROUP ("+
						"CLG_PK,"+
						"CLG_BRC_PK,"+
						"CLG_CTR_PK,"+
						"CLG_ID,"+
						"CLG_NAME,"+
						"CLG_MOB_NEW) "+
						" VALUES "+
						" (?,?,?,?,?,0) ";

				cmdarr.prepared = cmd;

				$.each(result.T_CLIENT_GROUP, function(ind, val){
					var valu = nullTonullString(val);
					cmdarr.values.push(valu);
				});
				preps.push(cmdarr);
			}

			//if there are clients
			if(result.T_CLIENT && result.T_CLIENT.length > 0){

				var cmdarr = {
					prepared: null,
					values : [],
				};

				cmd = "INSERT INTO T_CLIENT ("+
						"CLT_PK,"+
						"CLT_BRC_PK,"+
						"CLT_FULL_NAME,"+
						"CLT_NICK_NAME,"+
						"CLT_GENDER,"+
						"CLT_HB_NAME,"+
						"CLT_HB_ID,"+
						"CLT_HB_LIVE_IN_HOUSE,"+
						"CLT_FAMILY_CARD_NO,"+
						"CLT_CLEINT_ID,"+
						"CLT_OTH_REG_NO,"+ //10
						"CLT_DOB,"+
						"CLT_AGE,"+
						"CLT_HIGH_EDU,"+
						"CLT_HIGH_EDU_OTHER,"+
						"CLT_MARITAL_STATUS,"+
						"CLT_NUM_HOUSE_MEM,"+
						"CLT_NUM_CHILDREN,"+
						"CLT_HB_LIVE_PLACE,"+
						"CLT_HB_COME_HOUSE,"+
						"CLT_MOTHER_NM,"+ //20
						"CLT_MOTHER_DOB,"+
						"CLT_MOTHER_AGE,"+
						"CLT_BIZ,"+
						"CLT_BIZ_EQUIPT,"+
						"CLT_HB_BIZ,"+
						"CLT_HB_BIZ_EQUIPT,"+
						"CLT_BOTH_BIZ,"+
						"CLT_BOTH_BIZ_EQUIPT,"+
						"CLT_RT,"+
						"CLT_STREET_AREA_NM,"+ //30
						"CLT_VILLAGE,"+
						"CLT_SUB_DISTRICT,"+
						"CLT_DISTRICT,"+
						"CLT_PROVINCE,"+
						"CLT_POSTAL_CD,"+
						"CLT_LAND_MARK,"+
						"CLT_MOB_NO_1,"+
						"CLT_MOB_NO_2,"+
						"CLT_HUSB_MOB_NO,"+
						"CLT_BRNET_NO,"+ //40
						"CLT_CREDITS_NUMBER,"+
						"CLT_FO_FOR_TRAINING,"+
						"CLT_TRANING_START_DATE,"+
						"CLT_TRANING_END_DATE,"+
						"CLT_TRANING_COMPLETED,"+
						"CLT_PLACE_OF_BIRTH,"+
						"CLT_RESIDENCE_OF_PARENTS,"+
						"CLT_CREATED_BY,"+
						"CLT_CREATED_DATE,"+
						"CLT_STATUS,"+  //50
						"CLT_GROUP_ID,"+
						"CLT_IS_GROUP_LEADER,"+
						"CLT_CENTER_ID,"+
						"CLT_RW, "+
						"CLT_ATTENDANCE_PERCENTAGE, "+
						"CLT_INSTALMENT_PERCENTAGE, "+
						"CLT_TRAINING_ATTENDANCE, "+
						"CLT_APPROVED_MANAGER_PK, "+
						"CLT_RELATIVE, "+
						"CLT_RELATIVE_SIGNATURE, "+
						"CLT_CTR_LEADER_PK, "+
						"CLT_GRP_LEADER_PK, "+
						"CLT_HOME_ONWERSHIP, "+
						"CLT_NEW_MEMBER_TYPE, "+
						"CLT_MOB_NEW)"+
						
					" VALUES "+
					" (?,?,?,?,?,?,?,?,?,?,"+
					"  ?,?,?,?,?,?,?,?,?,?,"+
					"  ?,?,?,?,?,?,?,?,?,?,"+
					"  ?,?,?,?,?,?,?,?,?,?,"+
					"  ?,?,?,?,?,?,?,?,?,?,"+
					"  ?,?,?,?,?,?,?,?,?,?,"+
					"  ?,?,?,?,?,0)";

				cmdarr.prepared = cmd;    

				var date = new Date();
				date = ("0"+date.getDate()).slice(-2)+"/"+("0"+(date.getMonth()+1)).slice(-2)+"/"+date.getFullYear();
				var todate = new Date();

				$.each(result.T_CLIENT, function(ind, val){

					//console.log(val);
					var valu = [];
					valu[0] = val[0]; //CLT_PK
					valu[1] = val[1]; //CLT_BRC_PK
					valu[2] = val[2]; //CLT_FULL_NAME
					valu[3] = val[3]; //CLT_NICK_NAME
					valu[4] = val[10]; //CLT_GENDER  ----- WITH --- CLT
					valu[5] = val[4]; //CLT_CLT_HB_NAME
					valu[6] = val[5]; //CLT_HB_ID
					valu[7] = val[6]; //CLT_HB_LIVE_IN_HOUSE
					valu[8] = val[7]; //CLT_FAMILY_CARD_NO
					valu[9] = val[8]; //CLT_CLEINT_ID
					valu[10] = val[9]; //CLT_OTH_REG_NO                 //10
					valu[11] = val[11]; //CLT_DOB
					valu[12] = val[12]; //CLT_AGE
					valu[13] = val[13]; //CLT_HIGH_EDU
					valu[14] = val[14]; //CLT_HIGH_EDU_OTHER
					valu[15] = val[15]; //CLT_MARITAL_STATUS
					valu[16] = val[16]; //CLT_NUM_HOUSE_MEM
					valu[17] = val[17]; //CLT_NUM_CHILDREN
					valu[18] = val[18]; //CLT_HB_LIVE_PLACE
					valu[19] = val[19]; //CLT_HB_COME_HOUSE
					valu[20] = val[20];  //CLT_MOTHER_NM                 //20
					valu[21] = val[21]; //CLT_MOTHER_DOB
					valu[22] = val[22]; //CLT_MOTHER_AGE
					valu[23] = val[23]; //CLT_BIZ
					valu[24] = val[24];  //CLT_BIZ_EQUIPT
					valu[25] = val[25]; //CLT_HB_BIZ
					valu[26] = val[26]; //CLT_HB_BIZ_EQUIPT
					valu[27] = val[27]; //CLT_BOTH_BIZ_EQUIPT
					valu[28] = val[28];  //CLT_RT
					valu[29] = val[29]; //CLT_STREET_AREA_NM                 //30
					valu[30] = val[30];  //CLT_STREET_AREA_NM
					valu[31] = val[31];  //CLT_VILLAGE
					valu[32] = val[32];  //CLT_SUB_DISTRICT
					valu[33] = val[33];  //CLT_DISTRICT
					valu[34] = val[34];  //CLT_PROVINCE
					valu[35] = val[35];  //CLT_POSTAL_CD
					valu[36] = val[36];  //CLT_LAND_MARK
					valu[37] = val[37];  //CLT_MOB_NO_1
					valu[38] = val[38];  //CLT_MOB_NO_2
					valu[39] = val[39];  //CLT_HUSB_MOB_NO
					valu[40] = val[40];  //CLT_BRNET_NO                  //40
					valu[41] = val[41];  //CLT_CREDITS_NUMBER
					valu[42] = val[42];  //CLT_FO_FOR_TRAINING
					valu[43] = val[43];  //CLT_TRANING_START_DATE
					valu[44] = val[44];  //CLT_TRANING_END_DATE
					valu[45] = val[45];  //CLT_TRANING_COMPLETED
					valu[46] = val[46];  //CLT_PLACE_OF_BIRTH
					valu[47] = val[47];  //CLT_RESIDENCE_OF_PARENTS
					valu[48] = val[48];  //CLT_CREATED_BY
					valu[49] = val[49];  //CLT_CREATED_DATE
					valu[50] = val[51];  //CLT_STATUS                 //50
					valu[51] = val[52];  //CLT_GROUP_ID
					valu[52] = val[53];  //CLT_IS_GROUP_LEADER
					valu[53] = val[54];  //CLT_CENTER_ID
					valu[54] = val[55];  //CLT_RW
					valu[55] = val[56];  //CLT_ATTENDANCE_PERCENTAGE
					valu[56] = val[57];  //CLT_INSTALMENT_PERCENTAGE
					valu[57] = val[58]; //CLL_TRAINING_ATTENDANCE
					valu[58] = val[64]; //CLT_APPROVED_MANAGER_PK
					valu[59] = val[59]; //CLL_RELATIVE
					valu[60] = ""; //CLL_RELATIVE_SIGNATURE
					valu[61] = val[60]; //CLT_CTR_LEADER_PK
					valu[62] = val[61]; //CLT_GRP_LEADER_PK

					valu[63] = val[62]; //CLT_HOME_ONWERSHIP
					valu[64] = val[63]; //CLT_NEW_MEMBER_TYPE

 
					var valu2 = nullTonullString(valu);
					cmdarr.values.push(valu2);

					//#######################################
					//  CLIENT TRAINING
					//#######################################
					var startdate   = new Date(val[43]);
					var enddate     = new Date(val[44]);
				 
					if(startdate.getTime() < todate.getTime() && enddate.getTime() > todate.getTime()){

						var timeDiff = Math.abs(todate.getTime() - startdate.getTime());
						var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

						myDB.execute("INSERT INTO T_CLIENT_TRAINING_TMP VALUES(null,"+val[0]+","+diffDays+",0)",function(res){

						});
					}

					//always save val[NEXT LAST INTEGER] into photos
					if(!devtest) if(fileManager)fileManager.write("photo"+val[0]+".dataurl",  "data:image/jpg;base64,"+val[val.length-1]);
				});
				preps.push(cmdarr);
			}
			if(result.T_CLIENT_LOAN && result.T_CLIENT_LOAN.length > 0){

				var cmdarr = {
					prepared: null,
					values : [],
				};

				cmd = "INSERT INTO T_CLIENT_LOAN ("+
						"CLL_PK,"+
						"CLL_BRC_PK,"+
						"CLL_CLT_PK,"+
						"CLL_FO_ASSIGNED,"+
						"CLL_WELFARE_STATUS,"+
						"CLL_WORKING_CAPITAL,"+
						"CLL_HB_WORKING_CAPITAL,"+
						"CLL_HOUSE_TYP,"+
						"CLL_HOUSE_SIZE,"+
						"CLL_HOUSE_CONDITION,"+
						"CLL_ROOF_TYPE,"+ //Index 10
						"CLL_WALL_TYPE,"+
						"CLL_FLOOR_TYP,"+
						"CLL_ELETRICITY,"+
						"CLL_WATER_SRC,"+
						"CLL_HSE_INX,"+
						"CLL_TOTAL_LOAN_WEEKS,"+
						"CLL_ORIGINAL_LOAN,"+
						"CLL_ACTUAL_LOAN,"+
						"CLL_LOAN_INTEREST,"+
						"CLL_CRF_PERCENTAGE,"+ //Index 20
						"CLL_CRF_AMOUNT,"+
						"CLL_FORM_DISTRIBUTION_DATE,"+
						"CLL_DISBURSEMENT_DATE,"+
						"CLL_CAPITAL_REPAY_PER_WEEK,"+
						"CLL_PROFIT_REPAY_PER_WEEK,"+
						"CLL_SCHEDULD_LAST_PAY_DATE,"+
						"CLL_ACTUAL_LAST_PAY_DATE,"+
						"CLL_EXTRACTED_DATE,"+
						"CLL_CRF_DISBURSEMENT_DATE,"+
						"CLL_CRF_DISBURSEMENT_AMT,"+ //Index 30
						"CLL_IS_NEW_LOAN_APPLIED,"+
						"CLL_PARENT_CLL_PK,"+
						"CLL_CREATED_BY,"+
						"CLL_CREATED_DATE,"+
						"CLL_STATUS,"+
						"CLL_LTY_PK,"+
						"CLL_ACCOUNT_NUMBER,"+
						"CLL_LPU_PK, "+
						"CLL_TERMINATION_DATE, "+
						"CLL_FIRST_COLLECTION_DATE, "+ //Index 40
						"CLL_TOTAL_PRINCIPAL_PAID, "+
						"CLL_TOTAL_INTEREST_PAID, "+
						"CLL_OUTSTANDING, "+
						"CLL_REPAY_PER_WEEK, "+
						"CLL_LOAN_NUMBER, "+
						"CLL_INDEX_OF_INCOME,"+
						"CLL_INDEX_OF_ASSET,"+
						"CLL_TSUNAMI_AFFECT,"+
						"CLL_QUAKE_AFFECT,"+
						"CLL_LOAN_COOPERATE_EXISTS,"+ //Index 50
						"CLL_LOAN_BANK_EXISTS,"+
						"CLL_FINANCE_INSTITUTE_ACCESS,"+
						"CLL_SAVING_ACCOUNT_EXISTS,"+
						"CLL_INSURANCE_EXISTS,"+
						"CLL_PAST_MEMBERSHIP_EXISTS,"+
						"CLL_IS_FORM_PRINTED,"+
						"CLL_MANAGER_PK,"+
						"CLL_PDF_PATH,"+
						"CLL_WITNESS1_PK,"+
						"CLL_WITNESS2_PK,"+ //Index 60
						"CLL_WITNESS3_PK,"+
						"CLL_WITNESS4_PK,"+
						"CLL_TEST_RESULT_DATETIME,"+
						"CLL_TEST_PLACE,"+
						"CLL_TOTAL_INTEREST_AMT,"+
						"CLL_HOMELESS,"+
						"CLL_LOAN_WEEKS,"+
						"CLL_ROUNDING_OF_REPAYMENT, "+
						"CLL_GRACE_PERIOD_WEEKS, "+
						"CLL_GRACE_PERIOD_INTEREST, "+ //Index 70
						"CLL_CASH_OUT_BY, " +
						"CLL_LOAN_CYCLE, " +
						"CLL_CASHIER_BY, " +   // Index 73
						"CLL_CENTER_LEAD_PK, " +
						"CLL_GROUP_LEAD_PK, "+
						"CLL_THIRDPARTY_NAME, "+
						"CLL_CHILD_GENDER, "+
						"CLL_CHILD_AGE, "+
						"CLL_CHILD_NAME, "+ 
						"CLL_MEMBER_STUDENT_PROFILE, "+ //80 
						"CLL_THIRDPARTY_DISBURSEMENT_DATE, "+
						"CLL_THIRDPARTY_DISBURSED, "+ 
						"CLL_THIRDPARTY_ACC_NUMBER, "+
						"CLL_THIRDPARTY_ACCHOLDER_NAME, "+
						"CLL_THIRDPARTY_SIGNATURE, "+
						"CLL_TRANSFER_MODE, "+
						"CLL_ARTA_PRODUCTS, "+
						"CLL_THIRDPARTY_ADDRESS, "+  
						"CLL_MAIN_PLANT, "+
						"CLL_LAND_BLOCK_LOCATION, "+ // 90
						"CLL_TYPES_VARIETIES, "+
						"CLL_LAND_AREA, "+  
						"CLL_ORIGIN_OF_SEED, "+
						"CLL_LAND_TENURE, "+
						"CLL_OTHER_PLANTS, "+
						"CLL_LAND_QUALITY, "+
						"CLL_NOTE, "+
						"CLL_BUSINESS_RISK, "+ 
						"CLL_MOB_NEW)"+
						" VALUES "+
						" (?,?,?,?,?,?,?,?,?,?,"+
						"  ?,?,?,?,?,?,?,?,?,?,"+
						"  ?,?,?,?,?,?,?,?,?,?,"+
						"  ?,?,?,?,?,?,?,?,?,?,"+
						"  ?,?,?,?,?,?,?,?,?,?,"+
						"  ?,?,?,?,?,?,?,?,?,?,"+
						"  ?,?,?,?,?,?,?,?,?,?,"+
						"  ?,?,?,?,?,?,?,?,?,?,"+
						"  ?,?,?,?,?,?,'',?,?,?,"+
						"  ?,?,?,?,?,?,?,?,?,0) ";

				cmdarr.prepared = cmd;
				console.log("rescount");
				console.log(result.length);
				$.each(result.T_CLIENT_LOAN, function(ind, val){
					var valu = nullTonullString(val);
					cmdarr.values.push(valu);
				});
				preps.push(cmdarr);
			}

			if(result.T_LOAN_PURPOSE && result.T_LOAN_PURPOSE.length > 0){

				var cmdarr = {
					prepared: null,
					values : [],
				};

				cmd = "INSERT INTO T_LOAN_PURPOSE ("+
						"LPU_PK,"+
						"LPU_LTY_PK,"+
						"LPU_CMP_PK,"+
						"LPU_CODE,"+
						"LPU_NAME,"+
						"LPU_IS_ACTIVE )"+
						" VALUES "+
						" (?,?,?,?,?,?) ";

				cmdarr.prepared = cmd;

				$.each(result.T_LOAN_PURPOSE, function(ind, val){
					var valu = nullTonullString(val);
					cmdarr.values.push(valu);
				});
				preps.push(cmdarr);
			}

			if(result.T_CLIENT_FORM && result.T_CLIENT_FORM.length > 0){

				var cmdarr = {
					prepared: null,
					values : [],
				};

				cmd = "INSERT INTO T_CLIENT_FORM ("+
						"CLF_PK,"+
						"CLF_CMP_PK, "+
						"CLF_QUESTION,"+
						"CLF_OPTIONS,"+
						"CLF_SCORE,"+
						"CLF_TYPE,"+
						"CLF_DEPENDANT_QUES_PK,"+
						"CLF_DEPENDANT_ANSWER,"+
						"CLF_MOB_NEW)"+
						" VALUES "+
						" (?,?,?,?,?,?,?,?,0)";

				cmdarr.prepared = cmd;

				$.each(result.T_CLIENT_FORM, function(ind, val){
					var valu = nullTonullString(val);
					cmdarr.values.push(valu);
				});

				preps.push(cmdarr);
			}

			if(result.T_CLIENT_FORM_ANSWERS && result.T_CLIENT_FORM_ANSWERS.length > 0){

				var cmdarr = {
					prepared: null,
					values : [],
				};

				cmd = "INSERT INTO T_CLIENT_FORM_ANSWERS ("+
						"CFA_PK, "+
						"CFA_CLT_PK, "+
						"CFA_CLL_PK, "+
						"CLA_CLF_PK, "+
						"CLA_FO_PK, "+
						"CFA_CMP_PK, "+
						"CLF_ASNWER, "+
						"CLA_SCORE, "+
						"CLA_CREATED_BY, "+
						"CLA_CREATED_DATE, "+ 
						"CLA_MOB_NEW)"+
						" VALUES "+
						" (?,?,?,?,?,?,?,?,?,?,0)";

				cmdarr.prepared = cmd;

				$.each(result.T_CLIENT_FORM_ANSWERS, function(ind, val){
					var valu = nullTonullString(val);
					cmdarr.values.push(valu);
				});

				preps.push(cmdarr);
			}



			if(result.T_CENTER_MASTER && result.T_CENTER_MASTER.length > 0){

				var cmdarr = {
					prepared: null,
					values : [],
				};

				cmd = "INSERT INTO T_CENTER_MASTER ("+
						"CTR_PK,"+
						"CTR_BRC_PK,"+
						"CTR_CENTER_NAME,"+
						"CTR_CENTER_ID,"+
						"CTR_IS_ACTIVE,"+
						"CTR_FO_PK,"+
						"CTR_VLM_PK,"+
						"CTR_MEETING_DATE,"+
						"CTR_MEETING_TIME,"+
						"CTR_CREATED_BY,"+
						"CTR_CREATED_DATE,"+
						"CTR_MODIFIED_BY,"+
						"CTR_MODIFIED_DATE)"+
						" VALUES "+
						" (?,?,?,?,?,?,?,?,?,?,"+
						"  ?,?,?) ";

				cmdarr.prepared = cmd;

				$.each(result.T_CENTER_MASTER, function(ind, val){
					var valu = nullTonullString(val);
					cmdarr.values.push(valu);
				});
				preps.push(cmdarr);
			}

			if(result.T_DISTRICT_MASTER && result.T_DISTRICT_MASTER.length > 0){

				var cmdarr = {
					prepared: null,
					values : [],
				};

				cmd = "INSERT INTO T_DISTRICT_MASTER ("+
						"DSM_PK,"+
						"DSM_CMP_PK,"+
						"DSM_NAME,"+
						"DSM_CODE,"+
						"DSM_PROVINCE_CODE,"+
						"DSM_IS_ACTIVE,"+
						"DSM_CREATED_BY,"+
						"DSM_CREATED_DATE,"+
						"DSM_UPDATED_BY,"+
						"DSM_UPDATED_DATE) "+
						" VALUES "+
						" (?,?,?,?,?,?,?,?,?,?) ";

				cmdarr.prepared = cmd;

				$.each(result.T_DISTRICT_MASTER, function(ind, val){
					var valu = nullTonullString(val);
					cmdarr.values.push(valu);
				});
				preps.push(cmdarr);
			}

			if(result.T_SUB_DISTRICT_MASTER && result.T_SUB_DISTRICT_MASTER.length > 0){

				var cmdarr = {
					prepared: null,
					values : [],
				};

				cmd = "INSERT INTO T_SUB_DISTRICT_MASTER ("+
						"SDSM_PK,"+
						"SDSM_CMP_PK,"+
						"SDSM_DSM_PK, "+
						"SDSM_NAME,"+
						"SDSM_CODE,"+
						"SDSM_IS_ACTIVE,"+
						"SDSM_CREATED_BY,"+
						"SDSM_CREATED_DATE,"+
						"SDSM_UPDATED_BY,"+
						"SDSM_UPDATED_DATE)"+
						" VALUES "+
						" (?,?,?,?,?,?,?,?,?,?) ";

				cmdarr.prepared = cmd;

				$.each(result.T_SUB_DISTRICT_MASTER, function(ind, val){
					var valu = nullTonullString(val);
					cmdarr.values.push(valu);
				});
				preps.push(cmdarr);
			}

			if(result.T_CLIENT_BORROWED_FUNDS && result.T_CLIENT_BORROWED_FUNDS.length > 0){

				var cmdarr = {
					prepared: null,
					values : [],
				};

				cmd = "INSERT INTO T_CLIENT_BORROWED_FUNDS ("+
						"CEF_PK,"+
						"CEF_CLT_PK,"+
						"CEF_CLL_PK,"+
						"CEF_LOAN_FROM,"+
						"CEF_LOAN_FROM_NAME,"+
						"CEF_BORROWED_BY,"+
						"CEF_ORGINAL_AMT,"+
						"CEF_BALANCE_AMT,"+
						"CEF_REPAY_PER_WEEK,"+
						"CEF_REPAY_PER_MONTH,"+
						"CEF_LOAN_PAID_OFF,"+
						"CEF_MOB_NEW)"+
						" VALUES "+
						" (?,?,?,?,?,?,?,?,?,?,?,"+
						"  0)";
				cmdarr.prepared = cmd;

				$.each(result.T_CLIENT_BORROWED_FUNDS, function(ind, val){
					var valu = nullTonullString(val);
					cmdarr.values.push(valu);
				});
				preps.push(cmdarr);
			}
			if(result.T_CLIENT_INCOME && result.T_CLIENT_INCOME.length > 0){
				////console.log(result['T_CLIENT_INCOME'])
				var cmdarr = {
					prepared: null,
					values : [],
				};

				cmd = "INSERT INTO T_CLIENT_INCOME ("+
						"CLI_PK,"+
						"CLI_CLT_PK,"+
						"CLI_CLL_PK,"+
						"CLI_SOURCE,"+
						"CLI_SOURCE_DETAIL,"+
						"CLI_FIXED,"+
						"CLI_VARIABLE,"+
						"CLI_MOB_NEW)"+
						" VALUES "+
						" (?,?,?,?,?,?,?,0)";

				cmdarr.prepared = cmd;
				$.each(result.T_CLIENT_INCOME, function(ind, val){

					var valu = nullTonullString(val);
					cmdarr.values.push(valu);
				});
				preps.push(cmdarr);
			}
			if(result.T_VILLAGE_MASTER && result.T_VILLAGE_MASTER.length > 0){

				var cmdarr = {
					prepared: null,
					values : [],
				};

				cmd = "INSERT INTO T_VILLAGE_MASTER ("+
						"VLM_PK,"+
						"VLM_BRC_PK,"+
						"VLM_DSM_PK," +
						"VLM_SDSM_PK," +
						"VLM_NAME,"+
						"VLM_CODE,"+
						"VLM_CREATED_BY,"+
						"VLM_CREATED_DATE,"+
						"VLM_UPDATED_BY,"+
						"VLM_UPDATED_DATE)"+
						" VALUES "+
						" (?,?,?,?,?,?,?,?,?,?)";
				cmdarr.prepared = cmd;
				$.each(result.T_VILLAGE_MASTER, function(ind, val){
					var valu = nullTonullString(val);
					cmdarr.values.push(valu);
				});
				preps.push(cmdarr);
			}
			if(result.T_LOAN_TYPE && result.T_LOAN_TYPE.length > 0){

				var cmdarr = {
					prepared: null,
					values : [],
				};

				cmd = "INSERT INTO T_LOAN_TYPE ("+
						"LTY_PK,"+
						"LTY_CMP_PK,"+
						"LTY_CODE,"+
						"LTY_DESCRIPTION,"+
						"LTY_MIN_LOAN_AMOUNT,"+
						"LTY_MAX_LOAN_AMOUNT,"+
						"LTY_DEFAULT_LOAN_INTEREST,"+
						"LTY_DEFAULT_CRF_INTEREST,"+
						"LTY_HOUSE_INDEX_CAP,"+
						"LTY_INCOME_CAP,"+
						"LTY_NO_OF_LOANS_FROM_OTHERBANKS,"+
						"LTY_WELFARE_STATUS_CAP,"+
						"LTY_ARREARS_PERCENTAGE,"+
						"LTY_MIN_REPAY_WEEK,"+
						"LTY_MAX_REPAY_WEEK,"+
						"LTY_FIRST_REVIEW_WEEK,"+
						"LTY_SECOND_REVIEW_WEEK,"+
						"LTY_IS_ACTIVE,"+
						"LTY_CREATED_BY,"+
						"LTY_CREATED_TIMESTAMP,"+
						"LTY_MODIFIED_BY,"+
						"LTY_MODIFIED_TIMESTAMP,"+
						"LTY_MULTIPLE_LOAN_ALLOWED,"+
						"LTY_LOAN_ELIGIBILITY_WEEK,"+
						"LTY_TERM_OF_LOAN, "+
						"LTY_GRACE_PERIOD_WEEK, "+
						"LTY_ROUNDING_AMOUNT) "+
						" VALUES "+
						" (?,?,?,?,?,?,?,?,?,?,"+
						"  ?,?,?,?,?,?,?,?,?,?,"+
						"  ?,?,?,?,?,?,?)";
				cmdarr.prepared = cmd;

				$.each(result.T_LOAN_TYPE, function(ind, val){
					//var valu = nullTonullString(val);
					cmdarr.values.push(val);
				});

				preps.push(cmdarr);

			}

			if(result.T_CLIENT_FAMILY_LIST && result.T_CLIENT_FAMILY_LIST.length > 0){

				var cmdarr = {
					prepared: null,
					values : [],
				};

				cmd = "INSERT INTO T_CLIENT_FAMILY_LIST ("+
						"CFL_PK,"+
						"CFL_CMP_ID,"+
						"CFL_CLT_PK,"+
						"CFL_NAME,"+
						"CFL_PLACE_OF_BIRTH,"+
						"CFL_DOB,"+
						"CFL_WORK,"+
						"CFL_FAMILY_CODE, "+
						"CFL_EDU_CODE,"+
						"CFL_STILL_IN_SCHOOL,"+
						"CFL_STATUS, "+
						"CFL_GENDER, "+
						"CFL_EDU_INFORMATION, "+
						"CFL_MARITAL_STATUS )"+
						" VALUES "+
						" (?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
				cmdarr.prepared = cmd;

				$.each(result.T_CLIENT_FAMILY_LIST, function(ind, val){
					//var valu = nullTonullString(val);
					cmdarr.values.push(val);
				});

				preps.push(cmdarr);
			}

			if(result.T_PRODUCT_MASTER && result.T_PRODUCT_MASTER.length > 0){

				var cmdarr = {
					prepared: null,
					values : [],
				};

				cmd = "INSERT INTO T_PRODUCT_MASTER ("+
						"PRM_PK,"+
						"PRM_CMP_PK,"+
						"PRM_NAME,"+
						"PRM_CODE,"+
						"PRM_DESCRIPTION,"+
						"PRM_DEPOSIT_FREQUENCY,"+
						"PRM_DEPOSIT_AMOUNT_RANGE,"+
						"PRM_DEPOSIT_AMOUNT,"+
						"PRM_LOAN_MATURITY_OPTIONS,"+
						"PRM_CLOSING_CHARGES,"+
						"PRM_IS_ACTIVE,"+
						"PRM_LOAN_WITHDRAW_POLICY, "+
						"PRM_LOAN_CLOSING_POLICY, "+
						"PRM_LOAN_FLEXI_FIELD,"+
						"PRM_CREATED_BY,"+
						"PRM_CREATED_TIMESTAMP,"+
						"PRM_MODIFIED_BY,"+
						"PRM_MODIFIED_TIMESTAMP,"+
                        "PRM_DEFAULT_AMOUNT,"+
                        "PRM_LOCAL_NAME,"+
                        "PRM_IS_MANAGER_APPROVAL)"+
						" VALUES "+
						" (?,?,?,?,?,?,?,?,?,?,"+
						"  ?,?,?,?,?,?,?,?,?,?,?)";
				cmdarr.prepared = cmd;

				$.each(result.T_PRODUCT_MASTER, function(ind, val){
					//var valu = nullTonullString(val);
					cmdarr.values.push(val);
				});

				preps.push(cmdarr);
			}


			if(result.T_PRODUCT_MASTER_DETAILS && result.T_PRODUCT_MASTER_DETAILS.length > 0){

				var cmdarr = {
					prepared: null,
					values : [],
				};

				cmd = "INSERT INTO T_PRODUCT_MASTER_DETAILS ("+
						"PRD_PK,"+
						"PRD_PRM_PK,"+
						"PRD_LOAN_AMT_FROM,"+
						"PRD_LOAN_AMT_TO,"+
						"PRD_WEEKLY_DEPOSIT)"+
						" VALUES "+
						" (?,?,?,?,?)";

				cmdarr.prepared = cmd;

				$.each(result.T_PRODUCT_MASTER_DETAILS, function(ind, val){
					//var valu = nullTonullString(val);
					cmdarr.values.push(val);
				});

				preps.push(cmdarr);
			}

			if(result.T_CLIENT_PRODUCT_MAPPING && result.T_CLIENT_PRODUCT_MAPPING.length > 0){

				var cmdarr = {
					prepared: null,
					values : [],
				};

				cmd = "INSERT INTO T_CLIENT_PRODUCT_MAPPING ("+
						"CPM_PK,"+
						"CPM_CLT_PK,"+
						"CPM_CLL_PK,"+
						"CPM_PRM_PK,"+
						"CPM_PRM_MATURITY,"+
						"CPM_PRM_BALANCE,"+
						"CPM_PRM_ACC_NUMBER,"+
						"CPM_PRM_JOIN_DATE,"+
						"CPM_PRM_CLOSE_DATE,"+
						"CPM_STATUS_PK,"+
						"CPM_REPAY_PER_WEEK,"+
						"CPM_START_MATURITY_DATE,"+
						"CPM_END_MATURITY_DATE, "+
						"CPM_CHKNEW)"+
						" VALUES "+
						" (?,?,?,?,?,?,?,?,?,?,?,"+
						"  ?,?,0)";

				 cmdarr.prepared = cmd;

				$.each(result.T_CLIENT_PRODUCT_MAPPING, function(ind, val){
					var valu = nullTonullString(val);
					cmdarr.values.push(valu);
				});

				preps.push(cmdarr);

			}

			if(result.T_LOAN_SAVING_PRD_MAPPING && result.T_LOAN_SAVING_PRD_MAPPING.length > 0){

				var cmdarr = {
					prepared: null,
					values : [],
				};

				cmd = "INSERT INTO T_LOAN_SAVING_PRD_MAPPING ("+
						"LSM_PK, "+
						"LSM_LTY_PK, "+
						"LSM_PRM_PK, "+
						"LSM_PRM_OPEN_BAL, "+
						"LSM_PRM_IS_MANDATORY)"+
						" VALUES "+
						" (?,?,?,?,?) ";

				cmdarr.prepared = cmd;

				$.each(result.T_LOAN_SAVING_PRD_MAPPING, function(ind, val){
					//var valu = nullTonullString(val);
					cmdarr.values.push(val);
				});

				preps.push(cmdarr);
			}

			if(result.T_CLIENT_PRD_TXN && result.T_CLIENT_PRD_TXN.length > 0){

				var cmdarr = {
					prepared: null,
					values : [],
				};

				cmd = "INSERT INTO T_CLIENT_PRD_TXN ("+
							"CPT_PK,"+
							"CPT_CPM_PK,"+
							"CPT_CLT_PK,"+
							"CPT_PRM_PK,"+
							"CPT_FLAG,"+
							"CPT_TXN_AMOUNT,"+
							"CPT_DATETIME,"+
							"CPT_USER_PK,"+
							"CPT_REASON,"+
							"CPT_REMARK,"+
							"CPT_STATUS,"+
							"CPT_COLLECTION_WEEK_NO,"+
							"CPT_EXP_AMOUNT,"+
							"CPT_CHKNEW) VALUES"+
							"(?,?,?,?,?,?,?,?,?,?,?,?,?,0) ";

				cmdarr.prepared = cmd;

				$.each(result.T_CLIENT_PRD_TXN, function(ind, val){

					for(var i in val){
						if(val[i] === null||val[i] === "null")
							val[i] = "";
					}

					val[val.length] = val[5];

					var valu = nullTonullString(val);
					cmdarr.values.push(valu);

				});

				preps.push(cmdarr);
			}
	 
			if(result.T_CLIENT_REPAY_SCHEDULE && result.T_CLIENT_REPAY_SCHEDULE.length > 0){

				var cmdarr = {
					prepared: null,
					values : [],
				};

				var listlen = parseInt(result.T_CLIENT_REPAY_SCHEDULE.length - 1 );
 
				cmd = "INSERT INTO T_CLIENT_REPAY_SCHEDULE ("+
						"CRS_PK,"+
						"CRS_CLT_PK,"+
						"CRS_CLL_PK,"+
						"CRS_PRM_LTY_PK,"+
						"CRS_LOAN_SAVING_FLAG,"+
						"CRS_ACTUAL_WEEK_NO,"+
						"CRS_COLLECTION_WEEK_NO,"+
						"CRS_DATE,"+
						"CRS_FO,"+
						"CRS_FLAG,"+
						"CRS_ATTENDED,"+
						"CRS_EXP_CAPITAL_AMT,"+
						"CRS_EXP_PROFIT_AMT,"+
						"CRS_BALANCE_CAPITAL,"+
						"CRS_BALANCE_PROFIT,"+
						"CRS_PENALTY,"+
						"CRS_SMS_STATUS,"+
						"CRS_SMS_GROUP_STATUS,"+
						"CRS_RECP_STATUS,"+
						"CRS_RECP_GROUP_STATUS,"+
						"CRS_REASON,"+
						"CRS_ASSISTED,"+
						"CRS_ACT_CAPITAL_AMT,"+
						"CRS_ACT_PROFIT_AMT,"+
						"CRS_IS_VARY_FORECAST,"+
						"CRS_REF_NO,"+
						"CRS_EXT_STATUS,"+
						"CRS_FUP_PK,"+
						"CRS_RECON_FUP_PK,"+
						"CRS_CREATED_BY,"+
						"CRS_CREATED_DATE,"+
						"CRS_PAIDBY_PK) VALUES ("+
						" ?,?,?,?,?,?,?,?,?,?"+
						",?,?,?,?,?,?,?,?,?,?"+
						",?,?,?,?,?,?,?,?,?,?"+
						",?,?)";

				cmdarr.prepared = cmd;
				$.each(result.T_CLIENT_REPAY_SCHEDULE, function(ind, val){

					for(var i=0; i < 32; i++){
						if(val[i] === null || val[i] === undefined)
							val[i] = "";
					}

					//var valu = nullTonullString(val);
					// if(val[4] == 'L'){ //Temp remove all S records
					// 	cmdarr.values.push(val);
                    // }
                    cmdarr.values.push(val);


				});

				preps.push(cmdarr);

			}


			if(result.T_CLIENT_TRAINING && result.T_CLIENT_TRAINING.length > 0){

				var cmdarr = {
					prepared: null,
					values : [],
				};

				cmd = "INSERT INTO T_CLIENT_TRAINING ("+
						"CTR_PK,"+
						"CTR_CLT_PK,"+
						"CTR_FO_FOR_TRAINING,"+
						"CTR_TRANING_START_DATE,"+
						"CTR_TRANING_END_DATE,"+
						"CTR_CREATED_BY,"+
						"CTR_CREATED_DATE,"+
						"CTR_STATUS)"+
						" VALUES "+
						" (?,?,?,?,?,?,?,?)";

				cmdarr.prepared = cmd;

				$.each(result.T_CLIENT_TRAINING, function(ind, val){
					var valu = nullTonullString(val);
					cmdarr.values.push(valu);
				});

				preps.push(cmdarr);
			}

			if(result.T_CLIENT_PRODUCT_CLOSE_INFO && result.T_CLIENT_PRODUCT_CLOSE_INFO.length > 0) {

				var cmdarr = {
					prepared: null,
					values : [],
				};

				cmd = "INSERT INTO T_CLIENT_PRODUCT_CLOSE_INFO ("+
						"CPC_PK,"+
						"CPC_CLL_PK,"+
						"CPC_CPM_PK,"+
						"CPC_BALANCE_AMT,"+
						"CPC_CLOSING_FEE,"+
						"CPC_DISBURSE_AMT,"+
						"CPC_DISBURSE_DATE,"+
						"CPC_REASON,"+
						"CPC_MANAGER_REMARK,"+
						"CPC_MANAGER_PK,"+
						"CPC_STATUS,"+
						"CPC_CREATED_BY,"+
						"CPC_CREATED_DATE,"+
						"CPC_CHKNEW )"+
						" VALUES "+
						" (?,?,?,?,?,?,?,?,?,?,"+
						"  ?,?,?,0)";

				cmdarr.prepared = cmd;

				$.each(result.T_CLIENT_PRODUCT_CLOSE_INFO, function(ind, val){

					var valu = [];
					valu[0] = val[0];
					valu[1] = val[1];
					valu[2] = val[2];
					valu[3] = val[6];
					valu[4] = val[7];
					valu[5] = val[8];
					valu[6] = val[11];
					valu[7] = val[9];
					valu[8] = val[10];
					valu[9] = val[3];
					valu[10] = val[4];
					valu[11] = val[5];
					valu[12] = val[12];

					var valu2 = nullTonullString(valu);
					cmdarr.values.push(valu2);
 
				});

				preps.push(cmdarr);

			}
            var needEval = false;
			if(result.T_CLIENT_EVALUATION && result.T_CLIENT_EVALUATION.length > 0 && needEval){ //58 fields, instead of listing each of them, automate this with a loop //another method

				var cmdarr = {
					prepared: null,
					values : [],
				};

				cmd = "INSERT INTO T_CLIENT_EVALUATION ("+
						"CLE_PK,"+
						"CLE_CLT_PK,"+
						"CLE_CLL_PK,"+
						"CLE_REVIEW_CODE,"+
						"CLE_NO_OF_WEEK,"+
						"CLE_INTERVIEW_LOCATION,"+
						"CLE_IS_CLIENT_IN_BUSINESS,"+
						"CLE_NOTE,"+
						"CLE_IS_BUSINESS_WELL,"+
						"CLE_REASON,"+
						"CLE_SCHOOL_FEES_WORK_CAP,"+
						"CLE_HOUSE_REPAIR_WORK_CAP,"+
						"CLE_HOME_UTENSILS_WORK_CAP,"+
						"CLE_CLOTHES_SHOES_WORK_CAP,"+
						"CLE_MEDICAL_WORK_CAP,"+
						"CLE_FOOD_WORK_CAP,"+
						"CLE_CRF_WORK_CAP,"+
						"CLE_GIVE_LEND_WORK_CAP,"+
						"CLE_SAVE_WORK_CAP,"+
						"CLE_REPAY_DEBTS_WORK_CAP,"+
						"CLE_OTHER_USED_WORK_CAP,"+
						"CLE_OTHER_WORK_CAP,"+
						"CLE_SCHOOL_FEES_EXPENSES,"+
						"CLE_HOUSE_REPAIR_IMPROVEMENT,"+
						"CLE_HOME_UTENSILS_EQUIPMENT,"+
						"CLE_CLOTHES_SHOES,"+
						"CLE_MEDICAL,"+
						"CLE_FOOD,"+
						"CLE_CRF,"+
						"CLE_GIVE_LEND,"+
						"CLE_SAVE_FOR_EMERGENCY,"+
						"CLE_REPAY_DEBTS,"+
						"CLE_OTHER_USED,"+
						"CLE_OTHER,"+
						"CLE_OTHER_EXPENSES,"+
						"CLE_HOUSE_SIZE,"+
						"CLE_HOUSE_CONDITION,"+
						"CLE_ROOF_TYPE,"+
						"CLE_WALL_TYPE,"+
						"CLE_FLOOR_TYP,"+
						"CLE_ELETRICITY,"+
						"CLE_WATER_SRC,"+
						"CLE_HSE_INX,"+
						"CLE_CLIENT_MET_LOCATION,"+
						"CLE_WORKING_CAPITAL,"+
						"CLE_HB_WORKING_CAPITAL,"+
						"CLE_FO_REMARKS,"+
						"CLE_STATUS,"+
						"CLE_CREATED_BY,"+
                        "CLE_CREATED_DATE,"+
                        "CLE_OTHER_INSTITUITIONAL_FINANCING,"+
                        "CLE_OTHER_INSTITUITIONAL_NAME,"+
                        "CLE_AMOUNT_OF_FINANCING,"+
                        "CLE_PAID_OFF,"+
                        "CLE_FO_NOTE,"+
                        "CLE_REPAY_PER_WEEK,"+
						"CLE_MOB_NEW)"+
						" VALUES "+
						" (?,?,?,?,?,?,?,?,?,?,"+
						"  ?,?,?,?,?,?,?,?,?,?,"+
						"  ?,?,?,?,?,?,?,?,?,?,"+
						"  ?,?,?,?,?,?,?,?,?,?,"+
                        "  ?,?,?,?,?,?,?,?,?,?,"+
                        "  ?,?,?,?,?,?,"+
                        "  0)"; 

				cmdarr.prepared = cmd;

				$.each(result.T_CLIENT_EVALUATION, function(ind, val){
					var valu = nullTonullString(val);
					cmdarr.values.push(valu);
				});

				preps.push(cmdarr);
            }

            if(result.T_PPI_FORM && result.T_PPI_FORM.length > 0){
                // console.log("T_PPI_FORM");
                // console.log(result.T_PPI_FORM);
				var cmdarr = {
					prepared: null,
					values : [],
				};

				cmd = "INSERT INTO T_PPI_FORM ("+
                        "PPIF_PK,"+
                        "PPIF_CLT_PK,"+
                        "PPIF_CLL_PK,"+
						"PPIF_TOTAL_SCORE,"+
                        "PPIF_MEMBER_PK,"+
                        "PPIF_FO_PK,"+
                        "PPIF_WITNESS_PK,"+
                        "PPIF_MANAGER_PK,"+
                        "PPIF_CENTER_LEADER_PK,"+
						"PPIF_GROUP_LEADER_PK,"+
						"PPIF_FAMILY_MEMBER,"+
                        "PPIF_FAMILY_MEMBER_NAME,"+
                        "PPIF_FAMILY_SIGN,"+
                        "PPIF_CREATED_BY,"+ 
                        "PPIF_CREATED_DATE,"+ 
                        "PPIF_UPDATED_BY,"+ 
                        "PPIF_UPDATED_DATE,"+
                        "PPIF_CHKNEW)"+
						" VALUES "+
						" (?,?,?,?,?,?,0,?,?,?,"+
                        "  ?,?,'',?,?,?,?,0)";
                        
                cmdarr.prepared = cmd;
                
				$.each(result.T_PPI_FORM, function(ind, val){
					var valu = nullTonullString(val);
					cmdarr.values.push(valu);
				});

				preps.push(cmdarr);
			}
            
            if(result.T_PPI_QUESTION && result.T_PPI_QUESTION.length > 0){
                console.log("PPI_QUESTION");
                console.log(result.T_PPI_QUESTION);
				var cmdarr = {
					prepared: null,
					values : [],
				};

				cmd = "INSERT INTO T_PPI_QUESTION ("+
                        "PPIQ_PK,"+
                        "PPIQ_CODE_TYPE_PK,"+
                        "PPIQ_SECOND_LOAN,"+
						"PPIQ_QUESTION,"+
                        "PPIQ_NEED_ANSWER,"+
                        "PPIQ_QUESTION_ID,"+
                        "PPIQ_VERSION_NO,"+
                        "PPIQ_QUESTION_KEY,"+
						"PPIQ_CREATED_BY,"+
						"PPIQ_CREATED_DATE)"+
						" VALUES "+
						" (?,?,?,?,?,?,?,?,?,?)";

				cmdarr.prepared = cmd;

				$.each(result.T_PPI_QUESTION, function(ind, val){
					var valu = nullTonullString(val);
					cmdarr.values.push(valu);
				});

				preps.push(cmdarr);
			}
 
			if(result.T_LOAN_TYPE) //58 fields, instead of listing each of them, automate this with a loop //another method
				localStorage.setItem("loan_type", JSON.stringify(result.T_LOAN_TYPE));
			 
			var tables = [
				{name:'T_CLIENT_EVALUATION_BIZ', recs:8},
				{name:'T_CLIENT_EVAL_BORROWED_FUNDS', recs:12}
			];
			$.each(tables,function(tabid, tbl){
				if(result[tbl.name]){
					$.each(result[tbl.name], function(ind, val){
						var cmd = 'INSERT INTO '+tbl.name+' VALUES(null,';
						var noen = tbl.recs;
						for(var i=0;i<noen;i++){

							if(val[i] === null) val[i] = "";

							if(i==noen-1) cmd+= '"'+val[i]+'",0)';
							else cmd+= '"'+val[i]+'",';
						}
						commands.push(cmd);
					});
				}
			});

			tables = [
				{name:'T_HOUSE_INDEX', recs:7},
				{name:'T_FAMILY_WELFARE', recs:6}
			];
			$.each(tables,function(tabid, tbl){
				if(result[tbl.name]){
					$.each(result[tbl.name], function(ind, val){
						var cmd = 'INSERT INTO '+tbl.name+' VALUES(null,';
						var noen = tbl.recs;
						for(var i=0;i<noen;i++){
							if(i==noen-1) cmd+= '"'+val[i]+'")';
							else cmd+= '"'+val[i]+'",';
						}
						commands.push(cmd);
					});
				}
			});
			var dt = new Date();
			var time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();
            console.log("prepared scripts")
            console.log(dt);
			myDB.dbShell.transaction(function(tx){
				for(var c in commands){

					tx.executeSql(commands[c]);

				}
				for(var e in preps){
					for(var v in preps[e].values){
						// console.log(preps[e].prepared);
						// console.log(preps[e].values[v].length);
						tx.executeSql(
							preps[e].prepared,preps[e].values[v],  function(tx,data){/*console.log(data)*/},function(tx, err){
                            console.log('error '+err.message); 
                            syncmgr.endsync("Error : " + err.message  );
                        });
					}
				} 
			}, function(err){
                console.log("Error : " + err.message  );
                syncmgr.endsync("Error : " + err.message  );
				return false;
			}, function(suc){
                // syncmgr.endsync("Successfully synced.");
                syncmgr.synclog(i18n.t("messages.SyncSuccess"));
				var dt = new Date();
				var time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();
				console.log("done - "+time);
				if(devtest){
					//login();
					ResponseFO('Pull');
				} else {
					ResponseFO('Pull');
				} 
			});

		});
	};

	/******************************************
	// UI for sync box
	******************************************/

	//display messages in the box
	this.synclog = function(text){ 
        swal({
            type: 'success',
            title: text,
            showConfirmButton: false,
        })
	};

	//display messages with a button to close
	this.endsync = function(text){ 
        swal({
            type: 'error',
            title: text
        })
	};

	//close the spinning wheel
	this.closebox = function(){
		$.mobile.loading("hide");
	};

}
/******************************************
// UI
******************************************/
endSync = function(text){
 
};

//close the spinning wheel
closeBox = function(){
	$.mobile.loading("hide");
};

function init(){
 
	initTemplate.load();
	
} 

function pullData(){
    hideKeyboard();
    //Pull Data
    var test = fouserid;
    if(test !== undefined && test == 'User2'){

        swal({
            title: i18n.t("messages.Alert"),
            text: i18n.t("messages.ConfirmPullData"),
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#80C6C7",
            confirmButtonText: i18n.t("messages.Yes"),
        }).then(function(isConfirm){
            if(isConfirm){
                $.mobile.loading( "show", { html: "<div id='syncer'><span class='ui-icon ui-icon-loading'></span><div id='synclog' class='synclog center'>Syncing...</div></div>", text:"loading",textVisible :true });
                $( "#myPopupDialog" ).popup( "close" ); //closes sync login box
                setTimeout(function(){
                    //window.location.href = "advancecash.html";
                    psuedoLogin();
                },1000);
            }
        },function(dismiss) {

        });

        return false;
    }

    document.activeElement.blur();
    $(this).blur();
    $('body').trigger('click');
    hideKeyboard();

    swal({
        title: i18n.t("messages.Alert"),
        text: i18n.t("messages.ConfirmPullData"),
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#80C6C7",
        confirmButtonText: i18n.t("messages.Yes"),
    }).then(function(isConfirm){
        if(isConfirm) sync.beginSync(2);
    },function(dismiss) {

    });

}



//push data
$('#mgrsyncpassword_push').on("keydown",function(event){
    if (event.keyCode == 9) {
       //you got tab i.e "NEXT" Btn

    }
    if (event.keyCode == 13) {
        //you got enter i.e "GO" Btn
        pushData();
    }
});

//pull data
$('#mgrsyncpassword').on("keydown",function(event){
   if (event.keyCode == 9) {
       //you got tab i.e "NEXT" Btn
   }
   if (event.keyCode == 13) {
        //you got enter i.e "GO" Btn
       pullData();
   }
}); 

$("#pullData").on("click", function(){ 
    pullData(); 
});
 

if(devtest==false){$("#development").hide();}

$("#updateDev").on("click", function(){
    devtest = !devtest;
    localStorage.setItem("DEVTEST", devtest);
    if(devtest) $("#development").show();
    else $("#development").hide();
});

//fix height
var viewport = {
    width  : $(window).width(),
    height : $(window).height()
};
var headerHeight = $('[data-role="header"]').first().height();
$("#content").height(viewport.height);

//for demo purposes, special sql statements
$("#sendchange").on("click", function(){
    var date = new Date();
    date = ("0"+date.getDate()).slice(-2)+"/"+("0"+(date.getMonth()+1)).slice(-2)+"/"+date.getFullYear();
    //13691,13692,13693,13694,13695,13696
    myDB.execute("UPDATE T_CLIENT_REPAY_SCHEDULE SET crs_date = '"+date+"' WHERE crs_pk in(514,565,616,667,718,769,820,871,922,973,1021,1072,1123,1174,1225)", function(results){
       // alert("Changed date.");
        alert(i18n.t("messages.DateChanged"));
    });
});
$("#resetprint").on("click", function(){

    function resetClientRepay(){

        var d = $.Deferred();

        var date = new Date();
        date = ("0"+date.getDate()).slice(-2)+"/"+("0"+(date.getMonth()+1)).slice(-2)+"/"+date.getFullYear();
        var cmd1 =  "   update T_CLIENT_REPAY_SCHEDULE set CRS_TOTALPAID = '0.00' , CRS_ATTENDED = null , CRS_SMS_STATUS= null , ";
            cmd1 += "   crs_flexi_exp_1     = '0.00',   crs_flexi_exp_2    = '0.00',    crs_flexi_exp_3    = '0.00', ";
            cmd1 += "   crs_flexi_exp_4     = '0.00',   crs_flexi_exp_5    = '0.00',    crs_flexi_exp_6    = '0.00', ";
            cmd1 += "   crs_flexi_exp_7     = '0.00',   crs_flexi_exp_8    = '0.00',    crs_flexi_exp_9    = '0.00', ";
            cmd1 += "   crs_flexi_exp_10    = '0.00',   crs_flexi_exp_11   = '0.00',    crs_flexi_exp_12   = '0.00', ";
            cmd1 += "   crs_flexi_exp_13    = '0.00',   crs_flexi_exp_14   = '0.00',    crs_flexi_exp_15   = '0.00', ";
            cmd1 += "   crs_flexi_exp_16    = '0.00',   crs_flexi_exp_17   = '0.00',    crs_flexi_exp_18   = '0.00', ";
            cmd1 += "   crs_flexi_exp_19    = '0.00',   crs_flexi_exp_20   = '0.00',    ";//FLEXI EXP FIELDS
         
            cmd1 += "   CRS_SMS_GROUP_STATUS =null, CRS_RECP_STATUS= null, CRS_RECP_GROUP_STATUS =null, CRS_ASSISTED=null ";
            cmd1 += "   where crs_date ='"+date+"'";

        myDB.execute(cmd1, function(results){ 

            d.resolve(results);
        });


        return d.promise();

    }
 
    function deletePrdTxn (){

        var d = $.Deferred();

        var cmd2 = " DELETE FROM t_client_prd_txn where CPT_CHKNEW=1";
        myDB.execute(cmd2, function(results){ 
            d.resolve(results);
        });

        return d.promise();
    }

    $.when(resetClientRepay(),deletePrdTxn())
        .pipe(function(first,second){
            return $.extend(first, {second:second});
        })
        .done(function(first){
            ////console.log(first);
            swal(i18n.t("messages.PrintReset"));
    });

});

//when demo user sets client
$("#setipbutton").on("click", function(){
    localStorage.setItem("SYNC_SERVER",$('#setip').val());
    $( "#myIPAddress" ).popup( "close" ); //closes sync login box
});
 

function resetDevice(){

	swal({
		title: i18n.t("messages.Alert"),
		text: i18n.t("messages.ConfirmResetDevice"),
		type: "warning",
		showCancelButton: true,
		confirmButtonColor: "#80C6C7",
		confirmButtonText: i18n.t("messages.Yes"),
	}).then(function(isConfirm){
		if(isConfirm){
			$.mobile.loading( "show", { html: "<div id='syncer'><span class='ui-icon ui-icon-loading'></span><div id='synclog' class='synclog center'>"+i18n.t("messages.Resetting")+"...</div></div>", text:"loading",textVisible :true });
			setTimeout(function(){
				var cmd = "SELECT  USER_PK FROM T_USER WHERE USER_ROLE = 4";

				myDB.execute(cmd,function(res){

					var USER_PK = res[0].USER_PK;

					responseFO('Reset');
				});
			},1);
		}
	},function(dismiss) {

	});
}

function updateTotal(ttldis,ttldised,ttlsaved,ttlcoled,ttwthdis,ttwthdised){

	if(isNaN(ttldis)) ttldis = 0;
	if(isNaN(ttldised)) ttldised = 0;
	if(isNaN(ttlsaved)) ttlsaved = 0;
	if(isNaN(ttlcoled)) ttlcoled = 0;
	if(isNaN(ttwthdis)) ttwthdis = 0;
	if(isNaN(ttwthdised)) ttwthdised = 0;
 
	var total_amt =  parseFloat(ttldis)-parseFloat(ttldised)+parseFloat(ttlsaved)+parseFloat(ttlcoled)+parseFloat(ttwthdis)-parseFloat(ttwthdised);
	window.ttlact = total_amt;

	if(isNaN(total_amt)) total_amt = 0;

	var ttamt_text = parseFloat(total_amt).toFixed(0).toLocaleString('en');

	$('.cashier-total-amt').html('&nbsp;'+formatNumber(ttamt_text));
 
	checkVal();

}
function formatNumber (num) {
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
}
function updateTotalExp(ttlsave,ttlcol){

	if(isNaN(ttlsave)) ttlsave = 0;
	if(isNaN(ttlcol)) ttlcol = 0;

	var total_amt =  parseFloat(ttlsave)+parseFloat(ttlcol);
	window.ttlexp = total_amt;

	if(isNaN(total_amt)) total_amt = 0;

	var ttamt_text = parseFloat(total_amt).toFixed(0).toLocaleString('en', {maximumSignificantDigits : 21});
 
	$('.exp_val').html('<b>&nbsp;'+formatNumber(ttamt_text)+'</b>');

	checkVal();

}
function checkVal(){

	var ttlexp = window.ttlexp;
	var ttlact = window.ttlact;
 
	if(ttlexp > 0){
		$('.greenbackground').css('background-color','rgba(0,0,0,0.35)');
		$('.div-header').css('color','white');
		$('.exp-total-amt').css('color','white');
		if(ttlact >= ttlexp){
			$('.div-header').css('background-color','#4DBD33');
		} else {
			$('.div-header').css('background-color','#FF8A65');
		}
	}
}
/******************************************
// User login
******************************************/
function downloadDB(){

	var texts = "";
	var isLast = false;
	var lastTable = "";
	var text = '';
	myDB.execute(" SELECT tbl_name, sql from sqlite_master WHERE type = 'table' and tbl_name LIKE 'T_%' and tbl_name <> 'testtable' ",function(tables){
		$.each(tables,function(i,tbl){
			console.log("i "+i+" | tables.length "+tables.length);
			if(i == parseInt(tables.length -1)){
			   //isLast = true;
			}
			lastTable = tables[tables.length-1].tbl_name;
			console.log(lastTable);
			console.log(tbl.tbl_name);
			console.log("i = "+i+" and table is "+tables.length + "isLast ? "+ isLast);
			myDB.execute("SELECT * FROM "+tbl.tbl_name,function(res){
				//console.log('lastTable '+lastTable+' | tbl.tbl_name '+tbl.tbl_name);

				if(lastTable == tbl.tbl_name){
					isLast = true;
				}

				if(res.length != 0){
					var newtext = "";

					newtext += "var cmdar = {";
					newtext += "prepared: null,";
					newtext += "values: [],";
					newtext += "};\r\n";

					var cols = "";


					var tblflds = tbl.sql.substring(tbl.sql.indexOf('(')+1);

					tblflds = tblflds.substring(0,tblflds.lastIndexOf(')'));

					tblflds = tblflds.replace(/\,2/g,'');
					////console.log(tblflds);
					var fa = tblflds.split(',');
					var col = "";
					var vals = "";

					for(var i=1; i < fa.length; i++){
						fa[i] = fa[i].replace(/^ /, '');
						fa[i] = fa[i].split(" ")[0];

						if(i == fa.length-1){
							col += ''+fa[i]+')';
						}  else {
						   col += ''+fa[i]+',';
						}

						if(vals !== "") vals += ',';
						vals += '?';
					}

					vals = 'VALUES('+vals+')";\r\n';

					newtext += 'var cmd = "INSERT INTO '+tbl.tbl_name+' ( ';
						newtext += col;
						newtext += vals;

					newtext += 'cmdar.prepared = cmd;\r\n';


					if(lastTable == tbl.tbl_name){
						isLast = true;
					}

					$.each(res,function(r,rows){
						var thisrow = "";
						//thisrow += "myDB['"+tbl.tbl_name+"'].add(";
						var colTxt = "";
						$.each(rows,function(c,cols){

							if(c != "P_ID"){
								if(colTxt !== "") colTxt +=",";
								if($.isNumeric(cols) && Math.floor(cols) == cols) {
									colTxt += cols;
								} else {
									colTxt += '"'+cols+'"';
								}
							}

						});

						newtext += "cmdar.values.push(["+colTxt+"]);\r\n";

						//////console.log("r "+r+" | res.length "+res.length+" | isLast "+isLast);

					});
					newtext += 'preps.push(cmdar);\r\n';

					text += newtext; 

				}
				if(isLast){
					console.log("done load file");
					console.log(text);
					window.open("data:text/plain;charset=UTF-8," + encodeURIComponent(text));

					var element = document.createElement('a');
					  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
					  element.setAttribute('download', 'hello.txt');

					  element.style.display = 'none';
					  document.body.appendChild(element);

					  element.click();

					  document.body.removeChild(element);
				} 
			});
		});

	});
}


function psuedoLogin(){

	$.when(myDB.reset()).done(function(){
		var anotherdate = new Date();
		anotherdate = anotherdate.getFullYear()+"-"+("0"+(anotherdate.getMonth()+1)).slice(-2)+"-"+("0"+anotherdate.getDate()).slice(-2);

		var username = '01151/2013';
		var password = 'admin123';

		syncPsuedoData();
	});

}

function login(){
 
	var testsql = "SELECT  CMP_NAME,CMP_PK,CMP_SMS_FORMAT,CMP_RECEIPT_FORMAT,CMP_SMS_LABEL,CMP_RECEIPT_LABEL,USER_PK,USER_ID,USER_NAME,USER_HAVE_SIGNATURE,BRC_DISBURSE_NOTIFICATION,BRC_PK,BRC_NAME,BRC_PHONE,BRC_BRANCH_ID, USER_CTR_ID, USER_CTR_NAME FROM T_COMPANY,T_BRANCH,T_USER WHERE USER_ID='"+fouserid+"' AND USER_PASSWORD='"+fopassword+"' AND USER_BRC_PK=BRC_PK AND BRC_CMP_PK=CMP_PK AND USER_ROLE = 4";
 
	myDB.execute(testsql, function(results){
		if(results.length==1){
			if (typeof(Storage) != "undefined"){

				var save = results[0];

                console.log(save);
                
                //For Reset
                localStorage.setItem("RESET_USERID", $('#fouserid').val());
                localStorage.setItem("RESET_USERPW", $('#fopassword').val());
                localStorage.setItem("RESET_MGRID",  $('#mgruserid').val());
                localStorage.setItem("RESET_MGRPW", $('#mgrpassword').val());

                //storing other variables
                localStorage.setItem("LOGGEDIN","yes");

				localStorage.setItem("CMP_NAME",save.CMP_NAME);
				localStorage.setItem("CMP_PK",save.CMP_PK);

				localStorage.setItem("USER_PK",save.USER_PK);
				localStorage.setItem("USER_ID",save.USER_ID);
				localStorage.setItem("USER_NAME",save.USER_NAME);
				localStorage.setItem("USER_HAVE_SIG",save.USER_HAVE_SIGNATURE);

				localStorage.setItem("BRC_PK",save.BRC_PK);
				localStorage.setItem("BRC_BRANCH_ID",save.BRC_BRANCH_ID);

				localStorage.setItem("BRC_NAME",save.BRC_NAME);
				//localStorage.setItem("BRC_NAME",save["BRC_NAME"]);
				localStorage.setItem("BRC_PHONE",save.BRC_PHONE);
 
				localStorage.setItem("MGR_HAVE_SIG","N");
				localStorage.setItem("MGR_SIG","");
				localStorage.setItem("MGR_PK","");
				localStorage.setItem("MGR_ID","");
				localStorage.setItem("MGR_NAME","");
 
				localStorage.setItem("BRC_HOUSE_INDEX_CAP",save.BRC_HOUSE_INDEX_CAP);
				localStorage.setItem("BRC_INCOME_CAP",save.BRC_INCOME_CAP);
				localStorage.setItem("BRC_NO_OF_LOANS_FROM_OTHERBANKS",save.BRC_NO_OF_LOANS_FROM_OTHERBANKS);
				localStorage.setItem("BRC_WELFARE_STATUS_CAP",save.BRC_WELFARE_STATUS_CAP);

				localStorage.setItem("CMP_SMS_FORMAT",save.CMP_SMS_FORMAT);
				localStorage.setItem("CMP_RECEIPT_FORMAT",save.CMP_RECEIPT_FORMAT);
				localStorage.setItem("CMP_SMS_LABEL",save.CMP_SMS_LABEL);
				localStorage.setItem("CMP_RECEIPT_LABEL",save.CMP_RECEIPT_LABEL);
				localStorage.setItem("SMS_OR_RECEIPT",save.BRC_DISBURSE_NOTIFICATION);

				localStorage.setItem("USER_CTR_ID",save.USER_CTR_ID);
				localStorage.setItem("USER_CTR_NAME",save.USER_CTR_NAME);

				//localStorage.setItem("SESSIONTEST","SESSIONTEST");
				//localStorage.setItem("LOCALTEST","LOCALTEST");

                localStorage.setItem("LANGUAGE", i18n.lng());  //current language used
                
                setSessionStorage();

				//window.location.href = "terms.html";
				window.location.href = "advancecash.html";

			}
		}else{
			//alert("Your login credentials did not match.");
			alert(i18n.t("messages.InvalidLoginCredential"));
			$("#invalid").show();
		}
	});
}

function setSessionStorage(){
    //storing other variables
    sessionStorage.setItem("LOGGEDIN",localStorage.getItem("LOGGEDIN"));

    sessionStorage.setItem("CMP_NAME",localStorage.getItem("CMP_NAME"));
    sessionStorage.setItem("CMP_PK",localStorage.getItem("CMP_PK"));

    sessionStorage.setItem("USER_PK",localStorage.getItem("USER_PK"));
    sessionStorage.setItem("USER_ID",localStorage.getItem("USER_ID"));
    sessionStorage.setItem("USER_NAME",localStorage.getItem("USER_NAME"));
    sessionStorage.setItem("USER_HAVE_SIG",localStorage.getItem("USER_HAVE_SIG"));

    sessionStorage.setItem("BRC_PK",localStorage.getItem("BRC_PK"));
    sessionStorage.setItem("BRC_BRANCH_ID",localStorage.getItem("BRC_BRANCH_ID"));

    sessionStorage.setItem("BRC_NAME",localStorage.getItem("BRC_NAME"));
    //sessionStorage.setItem("BRC_NAME",save["BRC_NAME"]));
    sessionStorage.setItem("BRC_PHONE",localStorage.getItem("BRC_PHONE"));

    sessionStorage.setItem("MGR_HAVE_SIG",localStorage.getItem("MGR_HAVE_SIG"));
    sessionStorage.setItem("MGR_SIG",localStorage.getItem("MGR_SIG"));
    sessionStorage.setItem("MGR_PK",localStorage.getItem("MGR_PK"));
    sessionStorage.setItem("MGR_ID",localStorage.getItem("MGR_ID"));
    sessionStorage.setItem("MGR_NAME",localStorage.getItem("MGR_NAME"));

    sessionStorage.setItem("BRC_HOUSE_INDEX_CAP",localStorage.getItem("BRC_HOUSE_INDEX_CAP"));
    sessionStorage.setItem("BRC_INCOME_CAP",localStorage.getItem("BRC_INCOME_CAP"));
    sessionStorage.setItem("BRC_NO_OF_LOANS_FROM_OTHERBANKS",localStorage.getItem("BRC_NO_OF_LOANS_FROM_OTHERBANKS"));
    sessionStorage.setItem("BRC_WELFARE_STATUS_CAP",localStorage.getItem("BRC_WELFARE_STATUS_CAP"));

    sessionStorage.setItem("CMP_SMS_FORMAT",localStorage.getItem("CMP_SMS_FORMAT"));
    sessionStorage.setItem("CMP_RECEIPT_FORMAT",localStorage.getItem("CMP_RECEIPT_FORMAT"));
    sessionStorage.setItem("CMP_SMS_LABEL",localStorage.getItem("CMP_SMS_LABEL"));
    sessionStorage.setItem("CMP_RECEIPT_LABEL",localStorage.getItem("CMP_RECEIPT_LABEL"));
    sessionStorage.setItem("SMS_OR_RECEIPT",localStorage.getItem("SMS_OR_RECEIPT"));

    sessionStorage.setItem("USER_CTR_ID",localStorage.getItem("USER_CTR_ID"));
    sessionStorage.setItem("USER_CTR_NAME",localStorage.getItem("USER_CTR_NAME"));

    //sessionStorage.setItem("SESSIONTEST","SESSIONTEST"));
    //localStorage.setItem("LOCALTEST","LOCALTEST");

    sessionStorage.setItem("LANGUAGE", localStorage.getItem("LANGUAGE"));  //current language used
}

function getTodaysCRS() {

	myDB.execute("SELECT CRS_PK FROM T_CLIENT_REPAY_SCHEDULE WHERE CRS_ATTENDED = '' AND CRS_DATE='"+ date +"' GROUP BY CRS_CLT_PK",function(res){
		console.log(res);
		var crss = "";
		$.each(res,function(i,crs){
			if(crss !== "") crss += ",";
			crss += crs.CRS_PK;
		});

		localStorage.setItem("TODAYS_CRS_PKS",crss); 
		login();
	});

} 
function updateCRS(){
	
	var turnon = true;
	//SELECT CRS_EXP_CAPITAL_AMT FROM T_CLIENT_REPAY_SCHEDULE WHERE CRS_CLT_PK = 2563 AND CRS_LOAN_SAVING_FLAG = 'S'
	if(turnon){
	 
		var username = fouserid;
		var password = fopassword;
        var maxcrs = 0;

        var product_master = null;
 
		myDB.execute("SELECT MAX(CRS_PK) as maxcrs, USER_PK FROM T_CLIENT_REPAY_SCHEDULE,T_USER,T_COMPANY,T_BRANCH WHERE USER_ID='"+username+"' AND USER_PASSWORD='"+password+"' AND USER_BRC_PK=BRC_PK AND BRC_CMP_PK=CMP_PK AND USER_ROLE = 4 LIMIT 1",function(data){
			console.log(data);
			maxcrs = parseInt(data[0].maxcrs) + 1;
			var cdt = new Date();
			var cdt_date = cdt.getUTCDate();
			if(cdt_date.toString().length == 1) cdt_date = "0"+cdt_date.toString();

			var cdt_month = parseInt(cdt.getMonth()) + 1;
			if(cdt_month.toString().length == 1) cdt_month =  "0"+cdt_month.toString();

			var cdt_year = cdt.getFullYear();
			var CRS_DATE = cdt_date + "/" + cdt_month + "/" + cdt_year;
			var USER_PK = data[0].USER_PK;

			var date = new Date();

			var cmd_date_threshhold = moment().subtract(11,'days').format('YYYY-MM-DD');

			var dayOfWeek = date.getDay() + 1;
 
			var query = "SELECT c.CLT_PK, c.CLT_STATUS, loan.CLL_LTY_PK, loan.CLL_PK, loan.CLL_LOAN_INTEREST, loan.CLL_REPAY_PER_WEEK, loan.CLL_ACTUAL_LOAN, loan.loancount, " + //LOAN

					"CTR_MEETING_DATE, "+

					"CPM_COM.CPM_STATUS_PK as COM_CPM_STATUS_PK, CPM_COM.CPM_PRM_PK as COM_CPM_PRM_PK, CPM_COM.CPM_PRM_BALANCE as COM_CPM_PRM_BALANCE, " + //CPM_COM

					"CPM_FS.CPM_STATUS_PK as FS_CPM_STATUS_PK, CPM_FS.CPM_PRM_PK as FS_CPM_PRM_PK, CPM_FS.CPM_PRM_BALANCE as FS_CPM_PRM_BALANCE, CPM_FS.CPM_REPAY_PER_WEEK as FS_CPM_REPAY_PER_WEEK " + //CPM_COM

					" FROM T_CLIENT as c "+

					"LEFT JOIN T_CENTER_MASTER ON ( CAST(c.CLT_CENTER_ID AS INTEGER) = CTR_PK ) "+

					"LEFT JOIN T_CHANGE_MEETING_DATE ON (CTR_PK = CMD_CENTER_PK) "+

					"LEFT JOIN (SELECT COUNT(CLL_PK) as loancount, MAX(CLL_PK) as CLL_PK, CLL_STATUS, MAX(CLL_CLT_PK) as CLL_CLT_PK, MIN(CLL_LTY_PK) as CLL_LTY_PK, MAX(CLL_LOAN_INTEREST) as CLL_LOAN_INTEREST, MAX(CLL_REPAY_PER_WEEK) as CLL_REPAY_PER_WEEK, MAX(CLL_ACTUAL_LOAN) as CLL_ACTUAL_LOAN, CLL_FO_ASSIGNED  FROM T_CLIENT_LOAN WHERE CLL_STATUS NOT IN (8,12,26) GROUP BY CLL_CLT_PK ) as loan ON (CLT_PK = loan.CLL_CLT_PK) "+

					"LEFT JOIN T_CLIENT_PRODUCT_MAPPING CPM_COM ON (CLT_PK = CPM_COM.CPM_CLT_PK AND CPM_COM.CPM_PRM_PK=73   ) "+
					"LEFT JOIN T_CLIENT_PRODUCT_CLOSE_INFO CPC_COM ON (CPC_COM.CPC_CPM_PK = CPM_COM.CPM_PK) "+

					"LEFT JOIN T_CLIENT_PRODUCT_MAPPING CPM_FS ON (CLT_PK = CPM_FS.CPM_CLT_PK AND CPM_FS.CPM_PRM_PK=77) "+
					"LEFT JOIN T_CLIENT_PRODUCT_CLOSE_INFO CPC_FS ON (CPC_FS.CPC_CPM_PK = CPM_FS.CPM_PK) "+
					
					" WHERE c.CLT_STATUS NOT IN (26,9) AND loan.CLL_FO_ASSIGNED = "+USER_PK+" AND loan.CLL_STATUS NOT IN (8,12,26) AND ( CTR_MEETING_DATE= "+dayOfWeek+" OR ( CMD_NEW_MEETING_DAY="+dayOfWeek+" AND DATE(CMD_CREATED_DATE) > '"+cmd_date_threshhold+"' ) )"+
					
                    "  GROUP BY CLT_PK ORDER BY CLT_PK "; 
                     
            myDB.execute("SELECT * FROM T_PRODUCT_MASTER_DETAILS",function(data){
                var product_master = data;
                console.log("product_master_details");
                console.log(product_master);
                console.log(query);
                myDB.execute(query,function(clients){
                    console.log(clients);
                    console.log(clients.length);
                    if(clients.length === 0){
                        login();
                        return false;
                    }
                    var cmdarr = {
                        prepared: null,
                        values : [],
                    };
                    cmd = "INSERT INTO T_CLIENT_REPAY_SCHEDULE ("+
                            "CRS_PK,"+
                            "CRS_CLT_PK,"+
                            "CRS_CLL_PK,"+
                            "CRS_PRM_LTY_PK,"+
                            "CRS_LOAN_SAVING_FLAG,"+
                            "CRS_ACTUAL_WEEK_NO,"+
                            "CRS_COLLECTION_WEEK_NO,"+
                            "CRS_DATE,"+
                            "CRS_FO,"+
                            "CRS_FLAG,"+ //10
                            "CRS_ATTENDED,"+
                            "CRS_EXP_CAPITAL_AMT,"+
                            "CRS_EXP_PROFIT_AMT,"+
                            "CRS_BALANCE_CAPITAL,"+
                            "CRS_BALANCE_PROFIT,"+
                            "CRS_PENALTY,"+
                            "CRS_SMS_STATUS,"+
                            "CRS_SMS_GROUP_STATUS,"+
                            "CRS_RECP_STATUS,"+
                            "CRS_RECP_GROUP_STATUS,"+ //20
                            "CRS_REASON,"+
                            "CRS_ASSISTED,"+
                            "CRS_ACT_CAPITAL_AMT,"+
                            "CRS_ACT_PROFIT_AMT,"+
                            "CRS_IS_VARY_FORECAST,"+
                            "CRS_REF_NO,"+
                            "CRS_EXT_STATUS,"+
                            "CRS_FUP_PK,"+
                            "CRS_RECON_FUP_PK,"+
                            "CRS_CREATED_BY,"+ //30
                            "CRS_CREATED_DATE,"+
                            "CRS_PAIDBY_PK) VALUES ("+
                            " ?,?,?,?,?,?,?,?,?,?"+
                            ",?,?,?,?,?,?,?,?,?,?"+
                            ",?,?,?,?,?,?,?,?,?,?"+
                            ",?,?)";
                    cmdarr.prepared = cmd;
                    var count = 1;
                    $.each(clients,function(g,client){
                        console.log(client.CLT_PK);
                        console.log(client);
                        var canGen = false; //Cannot Generate CRS_S
                        //client.CRS_ACTUAL_WEEK_NO == 0 ||
                        if(client.CLT_STATUS == 7 || client.CLT_STATUS == 26) {
                            canGen = true;

                        }
                        if(client.COM_CPM_STATUS_PK == 56 && canGen){
                            var loanAmount = client.CLL_ACTUAL_LOAN;

                            var loantype = client.CLL_LTY_PK;
                            var repayperweek = 1000;
                            //console.log(loan.CLL_CLT_PK+" "+loanAmount+" "+loantype);

                            if(client.CPM_CPC_PK == null){

                                if(client.loancount > 0){

                                    product_master.forEach( function(pdet){
                                        console.log(pdet)
                                        if(pdet.PRD_PRM_PK == client.COM_CPM_PRM_PK){
                                            if(parseInt(loanAmount) >= pdet.PRD_LOAN_AMT_FROM && parseInt(loanAmount) <= pdet.PRD_LOAN_AMT_TO){
                                                repayperweek = pdet.PRD_WEEKLY_DEPOSIT;
                                            }
                                        }
                                    })
 
                                }
                            }

                            var loanPK = 0;
                            if(client.CLL_PK != null ) loanPK = client.CLL_PK;

                            var loanVal = [
                                maxcrs,
                                client.CLT_PK,
                                loanPK,
                                client.COM_CPM_PRM_PK,
                                'S',
                                1,
                                0,
                                CRS_DATE,
                                USER_PK,
                                'C', //10
                                '',
                                repayperweek,
                                0,
                                client.COM_CPM_PRM_BALANCE,
                                0,
                                0,
                                '',
                                '',
                                '',
                                '', //20
                                '',
                                '',
                                0,
                                0,
                                0,
                                null,
                                49,
                                null,
                                null,
                                '',
                                '', //30
                                null
                            ];
                            maxcrs = maxcrs + 1;
                            cmdarr.values.push(loanVal);
                        } else {
                            console.log(client.CLT_PK + " cannot make it ");
                            console.log("client.COM_CPM_STATUS_PK " + client.COM_CPM_STATUS_PK);
                        }

                        if(client.FS_CPM_STATUS_PK == 56 && canGen){

                            var repayperweek = client.FS_CPM_REPAY_PER_WEEK;
                            if(repayperweek === '') repayperweek = 1000; //Minimum

                            var loanPK = 0;
                            if(client.CLL_PK !== null ) loanPK = client.CLL_PK;

                            var loanVal = [
                                maxcrs,
                                client.CLT_PK,
                                loanPK,
                                client.FS_CPM_PRM_PK,
                                'S',
                                1,
                                0,
                                CRS_DATE,
                                sessionStorage.getItem("USER_PK"),
                                'C', //10
                                '',
                                repayperweek,
                                0,
                                client.FS_CPM_PRM_BALANCE,
                                0,
                                0,
                                '',
                                '',
                                '',
                                '', //20
                                '',
                                '',
                                0,
                                0,
                                0,
                                null,
                                49,
                                null,
                                null,
                                '',
                                '', //30
                                null
                            ];
                            maxcrs = maxcrs + 1;
                            cmdarr.values.push(loanVal);
                        } else {
                            console.log(client.CLT_PK + " cannot make it ");
                            console.log("client.FS_CPM_STATUS_PK " + client.FS_CPM_STATUS_PK);
                        }
                    });
                    myDB.dbShell.transaction(function(tx){
                        for(var v in cmdarr.values){
                            tx.executeSql(
                                cmdarr.prepared,cmdarr.values[v],  function(tx,data){
                                    console.log(tx);
                                    console.log(data);
                                },function(tx, err){
                            })
                        }
                    }, function(err){
                        console.log("Error : " + err.message  );
                        return false;
                    }, function(suc){
                        console.log("done");
                        var dt = new Date();
                        var time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();
                        
                        getTodaysCRS();
                    });
                });
            });
		});
	}  else {
        getTodaysCRS();
		//login();
	}
}

async function changeIPPop() {
	const {value: ip} = await Swal.fire({
		title: 'Select IP',
		text: 'Currrent Server : ' + window.SERVERS[window.window.serverURL],
		input: 'select',
		inputOptions: SERVERS,
		inputPlaceholder: 'Select IP',
		showCancelButton: true,
		inputValidator: (value) => {
		  	return new Promise((resolve) => {
				resolve();
			})
		}
	});
	console.log(ip);
	if (ip) {
		setIP(ip);
	}
}
function setIP(ip) {
	localStorage.setItem("SYNC_SERVER", ip);
	window.window.serverURL = ip;
}
$(document).ready(function(){
    console.log(localStorage.getItem("LOGGEDIN"));
    if(localStorage.getItem("LOGGEDIN") && localStorage.getItem("LOGGEDIN") == 'yes'){
        setSessionStorage();
        window.location.href = "dashboard.html";
        return false;
    }
    $('input').on('focusin', function(e){ 
        var name = $(this).attr('name');
        console.log(name);
        $("label[for='"+name+"']").toggleClass('show');
    })
    $('input').on('focusout', function(e){  
        $("label").removeClass('show');
    })
	var loadcount = 0;
	var loadPicture = setInterval(function(){
		////console.log("Searching for File Manager");
		loadcount++;
		if(!devtest&&window.requestFileSystem){
			clearInterval(loadPicture);
				fileManager = new fm();
		}
		if(loadcount>=5){
			clearInterval(loadPicture);
			////console.log("Giving up.");
		}
    }, 1000);
    setLanguage('id'); //Default Language
 
});

function hideKeyboard() {
  //this set timeout needed for case when hideKeyborad
  //is called inside of 'onfocus' event handler
  setTimeout(function() {

	//creating temp field
	var field = document.createElement('input');
	field.setAttribute('type', 'text');
	//hiding temp field from peoples eyes
	//-webkit-user-modify is nessesary for Android 4.x
	field.setAttribute('style', 'position:absolute; top: 0px; opacity: 0; -webkit-user-modify: read-write-plaintext-only; left:0px;');
	document.body.appendChild(field);

	//adding onfocus event handler for out temp field
	field.onfocus = function(){
	  //this timeout of 200ms is nessasary for Android 2.3.x
	  setTimeout(function() {

		field.setAttribute('style', 'display:none;');
		setTimeout(function() {
		  document.body.removeChild(field);
		  document.body.focus();
		}, 14);

	  }, 200);
	};
	//focusing it
	field.focus();

  }, 50);
}

$("#pulldetailsform").enterAsTab({ 'allowSubmit': true});
$("#resetdetailsform").enterAsTab({ 'allowSubmit': true});
$("#pushdetailsform").enterAsTab({ 'allowSubmit': true});
 
Offline.options = {
    // to check the connection status immediatly on page load.
    checkOnLoad: false,
  
    // to monitor AJAX requests to check connection.
    interceptRequests: true,
  
    // to automatically retest periodically when the connection is down (set to false to disable).
    reconnect: {
      // delay time in seconds to wait before rechecking.
      initialDelay: 3,
  
      // wait time in seconds between retries.
      delay: 10
    },
  
    // to store and attempt to remake requests which failed while the connection was down.
    requests: true,

    checks: {
        image: {
            url: function() {
                return 'http://esri.github.io/offline-editor-js/tiny-image.png?_='
                    + (Math.floor(Math.random() * 1000000000));
            }
        },
        active: 'image'
    }
}; 

var delay = 2000;

Offline.on('confirmed-down', function () {
    console.log('down');
});

Offline.on('confirmed-up', function () {
    console.log('up');
});

Offline.on('up', function(){
    console.log("Internet is up."); 
});

Offline.on('down',function(){
    console.log("Internet is down."); 
});
 
setInterval(() => { 
    Offline.check();
}, delay);
$('body').on('click', '.fa-eye', function(){ 
    $(this).parent().find('input').prop({type: 'text'});
    $(this).parent().addClass('show');
})

$('body').on('click', '.fa-eye-slash', function(){
    $(this).parent().find('input').prop({type: 'password'});
    $(this).parent().removeClass('show');
})
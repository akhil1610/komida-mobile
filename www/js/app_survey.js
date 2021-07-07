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
function updateOnlineStatus()
{
    console.log("online");
    //document.getElementById("connection").innerHTML = "User is online";
}

function updateOfflineStatus()
{
    console.log("offline");
    //document.getElementById("connection").innerHTML = "User is offline";
}

function checkNetworkStatus(){
    if(navigator.onLine){
      updateOnlineStatus();
    } else {
      updateOfflineStatus();
    }
}

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

window.addEventListener('online',  checkNetworkStatus());
window.addEventListener('offline', checkNetworkStatus());

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
        

    $scope.survey = [];
    $scope.hourlyqtn = [];
    $scope.answers = [];


    $scope.loadSurvey = function(){

            var cmd = "SELECT * FROM T_SURVEYQTN_MASTER ";
            myDB.execute(cmd,function(res){
                $.each(res,function(i,val){ 
                    var qtn = val; 
                    console.log(qtn);
                    if(qtn.SQM_QTN_TYPE == 'checkbox' || qtn.SQM_QTN_TYPE == 'radio'){
                        qtn.options = qtn.SQM_OPTIONS.split(',');
                    }
                    if(qtn.SQM_QTN_TYPE == 'hourly'){
                        qtn.hourly = [];
                        qtn.hrcols_before = 0;
                        qtn.hrcols_after = 0;
                    }
                    $scope.survey.push(val);
                });
                console.log($scope.survey);
                $scope.loadHourlyQtns();
            }); 
    }

    $scope.loadHourlyQtns = function(){
        var cmd1 = "SELECT * FROM T_SURVEYQTN_HOURLY_MASTER ";
        myDB.execute(cmd1,function(res){
            $.each(res,function(i,val){

                var qtn = val; 

                $scope.hourlyqtn.push(qtn);
            });
            $.each($scope.survey,function(q,qtn){
                $.each($scope.hourlyqtn,function(h,hourly){
                    if(hourly.SQH_SQM_NO == qtn.SQM_QTN_NO){
                        var bcols = 0;
                        var acols = 0;
                        if(hourly.SQH_AFTER_HAS_COST == 'Y') acols++;
                        if(hourly.SQH_AFTER_HAS_HOURS == 'Y') acols++;
                        if(hourly.SQH_AFTER_HAS_RATE == 'Y') acols++;
                        if(hourly.SQH_AFTER_HAS_TOTAL == 'Y') acols++;
                        if(hourly.SQH_AFTER_HAS_USAGE == 'Y') acols++; 
                        if(hourly.SQH_BEFORE_HAS_COST == 'Y') bcols++;
                        if(hourly.SQH_BEFORE_HAS_HOURS == 'Y') bcols++;
                        if(hourly.SQH_BEFORE_HAS_RATE == 'Y') bcols++;
                        if(hourly.SQH_BEFORE_HAS_TOTAL == 'Y') bcols++;
                        if(hourly.SQH_BEFORE_HAS_USAGE == 'Y') bcols++; 

                        qtn.hrcols_before = bcols;
                        qtn.hrcols_after = acols;
                        qtn.hourly.push(hourly);
                    } 
                });
            });
            $scope.$apply();
        });
    }


    $scope.loadSurvey();


});
//end of controller

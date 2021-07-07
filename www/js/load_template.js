//This function is added to every page to determine if the header used has navigation options or a plain header
//!Note: it is possible to refactor the code here by using angular templates

$.fn.extend({
    animateCss: function (animationName) {
        var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
        this.addClass('animated ' + animationName).one(animationEnd, function() {
            $(this).removeClass('animated ' + animationName);
        });
    }
});

var initTemplate = {
    header : '<img src="img/tbopnew.png"/><br class="clear"/>',
    headermenu :
        //'<a href="dashboard.html" data-ajax="false" class="mlogo" ><img src="img/tbopnew.png"/></a><a href="#mypanel" class="pmenu-icon" data-ajax="false" class="right"><i class=" right white fa fa-2x fa-bars"></i><i class="right hidden white fa fa-2x fa-chevron-left"></i><span class="right header-label"></span></a>'
        '<a href="dashboard.html" data-ajax="false" class="mlogo" ><img src="img/tbopnew.png"/></a><a href="#mypanel" class="pmenu-icon" data-ajax="false" class="right">'
        +'<div class="menu">'
            +'<div class="bit-1"></div>'
            +'<div class="bit-2"></div>'
            +'<div class="bit-3"></div>'
        +'</div>'
        +'<i class="right hide white fa fa-2x fa-chevron-left"></i><span class="right header-label"></span></a>'


       //  +'<div class="navbar" style="float:left;margin-left:1em;"><ul>'
       //  +'<li><a href="" id="todoTask" my-tasks data-ajax="false"></a></li>'
       //  +'<li><a href="dashboard.html" id="hdDashboard" data-ajax="false" data-prefetch data-i18n="buttons.Dashboard">Dashboard</a></li>'
       //  +'<li><a href="transactions.html" id="hdTransactions" data-ajax="false" data-i18n="buttons.Transaction">Transaction</a></li>'
       //   //+'<li><a href="collections.html" id="hdCollections" data-ajax="false" data-i18n="buttons.Collection">Collection</a></li>'
       //  +'<li><a href="withdrawals.html" id="hdWithdrawals" data-ajax="false" data-i18n="buttons.Withdrawal">Withdrawal</a></li>'
       //  //+'<li><a href="productmappings.html" id="hdProductmappings" data-ajax="false" ">Product Mappings</a></li>'
       //  +'<li><a href="disbursements.html" id="hdDisbursements" data-ajax="false" data-i18n="buttons.Disbursement">Disbursement</a></li>'
       //  +'<li><a href="client.html" id="hdClient" data-ajax="false" data-i18n="buttons.Client">Client</a></li>'
       // +'<li><a href="groupclients.html" id="hdGroup" data-ajax="false" data-i18n="buttons.Group">Group</a></li>'
       //  +'<li><a href="status.html" id="hdStatus" data-ajax="false" data-i18n="buttons.Status">Status</a></li>'
       //  +'<li><a href="#" onclick="initTemplate.logout()" id="hdLogout" data-ajax="false" data-i18n="buttons.Logout">Logout</a></li>'
       //  +'</ul>'

        +''
        +'</div><br class="clear"/>',
    simpleheader : '<img src="img/tbopnew.png"/><a href="#mypanel" class="pmenu-icon" data-ajax="false"  class="right"><i class="right hidden white fa fa-2x fa-chevron-left"></i></a>',
    footer : '<p style="float:right;padding-right:1.5em;font-size: 0.85em;" data-i18n="messages.AllRightReserved">2016-2018 TBOP© All Rights Reserved</p><br class="clear">',
    menulist : '<div class="menubar">'
        +'<div class="menu-head" drop-vill ><div class="cur_vi">Pucung</div><div class="menu-hbtn" drop-vill><i class="fa fa-chevron-down"></i></div></div>'
        +'<ul  >'
            +'<li><a href="#" id="todoTask" my-tasks data-ajax="false"><span><i class="fa fa-tasks"></i></span><span class="menu-desc" data-i18n="messages.Tasks">Tasks</span><div></div></a></li>'
            +'<li><a href="dashboard.html" id="hdDashboard" data-ajax="false" data-prefetch><span><i class="fa fa-home"></i></span><span class="menu-desc"  data-i18n="buttons.Dashboard">Dashboard</span></a></li>'
            +'<li><a href="transactions.html" id="hdTransactions" data-ajax="false"><span><i class="fa fa-share"></i></span><span class="menu-desc" data-i18n="buttons.Transaction">Transaction</span></a></li>'
             //+'<li><a href="collections.html" id="hdCollections" data-ajax="false" data-i18n="buttons.Collection">Collection</a></li>'
            // +'<li><a href="withdrawals.html" id="hdWithdrawals" data-ajax="false"><span><i class="fa fa-reply"></i></span><span class="menu-desc" data-i18n="buttons.Withdrawal">Withdrawal</span></a></li>'
            //+'<li><a href="productmappings.html" id="hdProductmappings" data-ajax="false" ">Product Mappings</a></li>'
            +'<li><a href="disbursements.html" id="hdDisbursements" data-ajax="false"><span><i class="fa fa-usd"></i></span><span class="menu-desc" data-i18n="buttons.Disbursement">Disbursement</span></a></li>'
            +'<li><a href="client.html" id="hdClient" data-ajax="false"><span><i class="fa fa-user"></i></span><span class="menu-desc" data-i18n="buttons.Client">Client</span></a></li>'
            +'<li><a href="groupclients.html" id="hdGroup" data-ajax="false"><span><i class="fa fa-users"></i></span><span class="menu-desc" data-i18n="buttons.Group">Group</span></a></li>'
            //+'<li><a href="status.html" id="hdStatus" data-ajax="false"><span><i class="fa fa-briefcase"></i></span><span class="menu-desc" data-i18n="buttons.Status">Status</span></a></li>'
            +'<li><a href="training.html" id="hdTraining" data-ajax="false"><span><i class="fa fa-book"></i></span><span class="menu-desc" data-i18n="messages.Taining">Training</span></a></li>'
            +'<li><a href="newloanproposal.html" id="hdProposal" data-ajax="false"><span><i class="fa fa-sticky-note"></i></span><span class="menu-desc" data-i18n="messages.LoanProposal">Loan Proposal</span></a></li>'
            +'<li><a href="downpayment.html" id="hdStatus" data-ajax="false"><span><i class="fa fa-briefcase"></i></span><span class="menu-desc" data-i18n="buttons.Deposit">Deposit</span></a></li>'
            +'<li><a href="changemeeting.html" id="hdMeeting" data-ajax="false"><span><i class="fa fa-calendar"></i></span><span class="menu-desc" data-i18n="buttons.Meeting">Meeting</span></a></li>'
            //+'<li><a href="forms.html" id="hdForms" data-ajax="false"><span><i class="fa fa-hand-pointer-o"></i></span><span class="menu-desc">Forms</span></a></li>'
            +'<li><a href="spotcheck.html" id="hdSpotcheck" data-ajax="false"><span><i class="fa fa-binoculars"></i></span><span class="menu-desc" data-i18n="buttons.Spotcheck">Spotcheck</span></a></li>'
            +'<li><a href="manager.html" id="hdManager" data-ajax="false"><span><i class="fa fa-black-tie"></i></span><span class="menu-desc" data-i18n="buttons.Manager">Manager</span></a></li>'
            +'<li><a href="#" onclick="initTemplate.logout()" id="hdLogout" data-ajax="false"><span><i class="fa fa-power-off"></i></span><span class="menu-desc" data-i18n="buttons.Logout">Logout</span></a></li>'
        +'</ul>',

    //load menu depending on argument
    load : function(withMenu){

        jQuery.getScript("js/sweetalert2.min.js", function(data, status, jqxhr) {
            // printLog(data); //data returned
            // printLog(textStatus); //success
            // printLog(jqxhr.status); //200
            printLog('Load was performed.');
        });
        $("body").append(function(){
            //$('body').append('<link rel="stylesheet" href="js/sweetalert.min.js" type="text/js" />');

            //$('body').append('<link rel="stylesheet" href="css/sweetalert2.min.css" type="text/css" />'); // - CSS
            $('body').append('<link rel="stylesheet" href="css/font-awesome.min.css" type="text/css" />'); // - CSS

            $('body').append('<link rel="stylesheet" href="css/anim.css" type="text/css" />'); // - JS
            $('body').append('<script type="text/javascript" src="js/app_anim.js"></script> '); // - JS
        });

        var into = this;
        var withMenu = withMenu;
        var current_path = window.location.pathname.split('/').pop();

        $(".header").each(function(){
            var h;
            switch(withMenu){
                case 1: h = $(into.headermenu);break;
                case 2: h = $(into.simpleheader);break;
                default: h = $(into.header);break;
            }
            h.parent().trigger("create");
            $(this).append(h);

            $('#mypanel').append($(into.menulist));

        }).promise().done(function(){
            $('.menubar ul li a').removeClass('selected');
            //$('#mypanel').after('<div class="menu-pop"></div>');
            $('.menubar ul li a').each(function(){
                var elea = $(this);
                var asrc = elea.attr('href');
                if(asrc == current_path){
                    elea.parent().addClass('selected');
                    var head = $('.menubar ul li.selected a span.menu-desc').html();
                    getHeaderName(head)
                }
            }); 

            if( current_path=='view_client.html' ||
                current_path=='terminationform.html' ||
                current_path=='change.html'||
                current_path=='evaluation.html'||
                current_path=='newclient.html'||
                current_path=='changerequest.html'||
                current_path=='newloan.html'){

                $('.pmenu-icon i').toggleClass('hidden');
                $('.pmenu-icon').attr('href','client.html');
            }
            var srcht = $(window).height() - 1;
            var srcmht = $(window).height() - 1;

            $("div.menubar").css("min-height",srcmht);
            $("div.menubar").css("height",srcht);
        });

        $(".footer").each(function(){
            var f = $(into.footer);
            $(this).append(f);
        });

        // $('.header .navbar ul li a').removeClass('selected');
        // $('.header .navbar ul li').each(function(){
        //     var elea = $(this).find('a');
        //     var asrc = elea.attr('href');
        //     printLog(asrc+" = "+current_path);
        //     if(asrc == current_path){
        //         elea.addClass('selected');
        //         $('.header .header-label').html(elea.html());
        //     }
        // });
    },
    //logout
    logout : function(){

        // var isLogOut = i18n.t("messages.DoYouWantToLogOut");
  //       // if(!confirm("Do you want to log out?")) return false;
     //    if(!confirm(isLogOut)) return false;
  //       sessionStorage.clear();
        // var logOut = i18n.t("messages.YouAreLogOut");
  //       //alert("You are logged out.");
        // alert(logOut);
  //       window.location.href = "index.html";
        var isLogOut = i18n.t("messages.DoYouWantToLogOut");
        var logOut = i18n.t("messages.YouAreLogOut");

        swal({
            title: i18n.t("messages.DoYouWantToLogOut"),
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes",
          }).then(function(confirm){
                //   sessionStorage.clear();
                //   localStorage.removeItem('currentVillage');
                //   localStorage.removeItem('curr_village');
                //   localStorage.removeItem('statType');
                if(confirm.value) {
                    swal(logOut);
                    window.location.href = "newlogout.html";
                }
        }) ;
        return false;
    }

};
 
$("body").on('DOMSubtreeModified', ".menubar ul li.selected a span.menu-desc", function() { 
    getHeaderName($(this).html())
});
function getHeaderName(type){ 
    $('.header span.header-label').html(type); 
}
function refreshChkBox(){

    printLog('check');
    setTimeout(function(){
        $('.ui-checkbox').each(function(){
            var text = $(this).find('label').html();
            if(text == 'YES'){
                $(this).find('label').removeClass('ui-checkbox-off');
                $(this).find('label').addClass('ui-checkbox-on');
            } else {
                $(this).find('label').removeClass('ui-checkbox-on');
                $(this).find('label').addClass('ui-checkbox-off');
            }
        });
    },100);
 }
function refreshthis(obj){
    var selected = $(obj).find('option:selected').text();
    if(selected != null && selected != ''){
        $(obj).parent().find('span').html(selected);
    }
}

function refreshall(obj){
    $(obj).each(function(){
        var selected = $(this).find('option:selected').text();
        if(selected != null && selected != ''){
            $(this).parent().find('span').html(selected);
        }
    })
}

function resetthis(obj,index){

    if(index == null || index == undefined) index = 0;

    $(obj).each(function(){
        $(this).val(index);
        var selected = $(this).find('option:selected').text();
        if(selected != null && selected != ''){
            $(this).parent().find('span').html(selected);
        }
    })
}
 
function closepops(){

    $( "#mypanel" ).panel({
        beforeclose: function( event, ui ) {
            if($('.menupop-wrapper').is(':visible')){
                $('.menupop-wrapper').fadeOut('fast');
            }
        }
    });
}
$(document).click(function(e) {

    if ($('#mypanel').is(':visible') && (e.target.id != undefined && e.target.id != 'mypanel') && $(e.target).parents('#mypanel').length == 0) {
        printLog($('.menupop-wrapper').is(':visible'));
        if(!$('.menupop-wrapper').is(':visible')){

            $("#mypanel").panel( "close" );

        }
    }

});
$(document).on('click','.menupop-wrapper',function(){
    $(this).fadeOut();
});
function sanitize(text) {
    return encodeURIComponent((text+"").replace(/'/g, "%27")); //instead of replace ' with ''
}

function printLog(info) {
    //console.log(info);
}

function getDateInFormat(date,type,format){

    var da = date.split('/');

    var todayDate = new Date(da[2],da[1],da[0]);


    var format ="AM";
    var hour=todayDate.getHours();
    var min=todayDate.getMinutes();
    var sec=todayDate.getSeconds();
    var month = ("0"+ (todayDate.getMonth())).slice(-2);
    var thedate =  ("0"+ todayDate.getDate()).slice(-2);
    printLog("start");
    printLog(date);
    printLog(thedate+" "+month+" "+todayDate.getFullYear());
    if(hour>11){format="PM";}
    if (hour   > 12) { hour = hour - 12; }
    if (hour   == 0) { hour = 12; }
    if (min < 10){min = "0" + min;}

    var sign = "";
    if(type == undefined || type == '-'){
        sign = "-";
    } else if(type == '/') {
        sign = "/";
    } else {
        sign = "-";
    }

    if(format == 'ymd'){
        var newtime = todayDate.getFullYear()+ sign + month + sign + thedate;
    } else if (format == 'mdy') {
        var newtime = month + sign + thedate + sign + todayDate.getFullYear();
    } else {
        var newtime = todayDate.getFullYear()+ sign + month + sign + thedate;
    }
    printLog(newtime);

    newtime = new Date(newtime);
    printLog(newtime);

    return newtime;
}
function getTheIndex(array,key,search){
    var ind = 0;
    array.forEach(function (val, i) {  // iterate over all elements of array
        if(eval(val[key]) == search) ind = i;            // take the found id as index for the
    });
    return ind;
}
(function($) {
    $.fn.enterAsTab = function(options) {
        var settings = $.extend({
            'allowSubmit': false
        }, options);
        $(this).find('input, select, textarea, button').on("keydown", {localSettings: settings}, function(event) {
            if (settings.allowSubmit) {
                var type = $(this).attr("type");
                if (type == "submit") {
                    return true;
                }
            }
            if (event.keyCode == 13) {
                var inputs = $(this).parents("form").eq(0).find(":input:visible:not(:disabled):not([readonly])");
                var idx = inputs.index(this);
                if (idx == inputs.length - 1) {
                    idx = -1;
                } else {
                    inputs[idx + 1].focus(); // handles submit buttons
                }
                try {
                    inputs[idx + 1].select();
                }
                catch (err) {
                    // handle objects not offering select
                }
                return false;
            }
        });
        return this;
    };
})(jQuery);

var feastrepay = [
    { value: 3000, name: '3000 /minggu'},
    { value: 5000, name: '5000 /minggu'},
    { value: 7500, name: '7500 /minggu'},
    { value: 10000, name: '10000 /minggu'},
    { value: 12500, name: '12500 /minggu'},
    { value: 15000, name: '15000 /minggu'},
];
var feastsavingcode = "002.0007";
var insurancecode   = "22400000";
var membersharecode = "002.0005";

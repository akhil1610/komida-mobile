//This function is added to every page to determine if the header used has navigation options or a plain header
//!Note: it is possible to refactor the code here by using angular templates



var initTemplate = {
    header : '<img src="img/tbopnew.png"/><br class="clear"/>',
    headermenu : 
        '<img src="img/tbopnew.png"/>'
        +'<div class="navbar" style="float:left;margin-left:1em;"><ul>'
        +'<li><a href="" id="todoTask" my-tasks data-ajax="false"></a></li>'
        +'<li><a href="dashboard.html" id="hdDashboard" data-ajax="false" data-prefetch data-i18n="buttons.Dashboard">Dashboard</a></li>'
        +'<li><a href="transactions.html" id="hdTransactions" data-ajax="false" data-i18n="buttons.Transaction">Transaction</a></li>'
         //+'<li><a href="collections.html" id="hdCollections" data-ajax="false" data-i18n="buttons.Collection">Collection</a></li>'
		+'<li><a href="withdrawals.html" id="hdWithdrawals" data-ajax="false" data-i18n="buttons.Withdrawal">Withdrawal</a></li>'
        //+'<li><a href="productmappings.html" id="hdProductmappings" data-ajax="false" ">Product Mappings</a></li>'
        +'<li><a href="disbursements.html" id="hdDisbursements" data-ajax="false" data-i18n="buttons.Disbursement">Disbursement</a></li>'
        +'<li><a href="client.html" id="hdClient" data-ajax="false" data-i18n="buttons.Client">Client</a></li>'
       +'<li><a href="groupclients.html" id="hdGroup" data-ajax="false" data-i18n="buttons.Group">Group</a></li>'
        +'<li><a href="status.html" id="hdStatus" data-ajax="false" data-i18n="buttons.Status">Status</a></li>'
        +'<li><a href="#" onclick="initTemplate.logout()" id="hdLogout" data-ajax="false" data-i18n="buttons.Logout">Logout</a></li>'
        +'</ul></div><br class="clear"/>',
    simpleheader : '<img src="img/tbopnew.png"/><br class="clear"/>',
    footer : '<p style="float:right;padding-right:1em;" data-i18n="messages.AllRightReserved">2016-2018 TBOP© All Rights Reserved</p><br class="clear">',
    


    //load menu depending on argument
    load : function(withMenu){
        var into = this;
        var withMenu = withMenu;
        $(".header").each(function(){
            var h;
            switch(withMenu){
                case 1: h = $(into.headermenu);break;
                case 2: h = $(into.simpleheader);break;
                default: h = $(into.header);break;
            }
            h.parent().trigger("create");
            $(this).append(h);
        });
        $(".footer").each(function(){
            var f = $(into.footer);
            $(this).append(f);
        });
        jQuery.getScript("js/sweetalert.min.js", function(data, status, jqxhr) {
            // console.log(data); //data returned
            // console.log(textStatus); //success
            // console.log(jqxhr.status); //200
            console.log('Load was performed.');
        });
        $("body").append(function(){
            //$('body').append('<link rel="stylesheet" href="js/sweetalert.min.js" type="text/js" />');
            $('body').append('<link rel="stylesheet" href="css/sweetalert.css" type="text/css" />');
        });

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
            title: isLogOut,     
            type: "warning",   
            showCancelButton: true,   
            confirmButtonColor: "#DD6B55",   
            confirmButtonText: "Yes",   
            closeOnConfirm: true }, function(){   
                sessionStorage.clear();
                localStorage.removeItem('currentVillage');
                localStorage.removeItem('curr_village');
                localStorage.removeItem('statType');
                swal(logOut);
                window.location.href = "index.html";
            }
        );
    }
    
};
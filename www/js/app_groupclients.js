/******************************************
Get system values
******************************************/
var FO_PK = sessionStorage.getItem("USER_PK");

/******************************************
Controller
******************************************/
//var myApp = angular.module("myApp", []);
var myApp = angular.module("myApp",['pascalprecht.translate','masonry']);

myApp.config(function ($translateProvider) {

	 $translateProvider.useStaticFilesLoader({
		prefix: "locales/locale-",
		suffix: ".json"
	 });
     $translateProvider.preferredLanguage(ln.language.code);
});

myApp.filter('reverseArray', function() {
    return function(items) {
        if (!angular.isArray(items)) return false;
        return items.slice().reverse();
    };
});
myApp.filter('groupFilter', function() { 
    return function(groups,centerid) { 
        var filtered = [];   
        if(centerid == undefined) {
            var $container = $('.grid');
            $container.masonry('reloadItems');
            $container.masonry();
            return groups;
        } else {
            angular.forEach(groups, function(item) {
                if(item.CENTER.value == centerid){
                    filtered.push(item);
                }
            });
            var $container = $('.grid');
            $container.masonry('reloadItems');
            $container.masonry();
        }
        
        return filtered;
    };
});
myApp.controller("GroupCtrl", function($scope,$filter){

    var colwid = $('.grid').width() / 2;

    $('.grid').masonry({
        itemSelector: '.grid-item',
    }); 

    //declaring variables
    $scope.maxgroupid = '001';
    $scope.currGrp = {};
    $scope.leader = null;
    $scope.available = [];
    $scope.savedGrps = [];
    $scope.centerLeader = 0;
    var colwid = $('.grid').width() / 2;

    $scope.maxMembers = 0;
    myDB.execute("SELECT BRC_NOOFCLIENTS_INGROUP FROM T_BRANCH", function(results){
        if(results.length > 0){
            if(results[0].BRC_MAX_GRP_CLIENT !== '' && results[0].BRC_MAX_GRP_CLIENT !== null) {
                $scope.maxMembers = results[0].BRC_MAX_GRP_CLIENT;
            }
        }
    });

    // $('.grid').masonry({
    //   itemSelector: '.grid-item',
    // });

    /*$scope.addMember = function(clientid){ //don't think this is used anymore
        if(!clientid || $scope.countMembers(group)>=$scope.maxMembers) return false;
        if(!haveMembers()){
            $scope.leader = $scope.available[clientid]; //make leader if first member added to group
            $scope.available[clientid]['CLL_IS_GROUP_LEADER']='Y';
        }else{
            $scope.available[clientid]['CLL_IS_GROUP_LEADER']='N';
        }

        $scope.currGrp[clientid] = $scope.available[clientid]; //move client from available list to current group
        delete $scope.available[clientid];
    };*/

/******************************************
Create a new group
******************************************/
    $scope.createNewGroup = function(){
        if($scope.createGroup=="undefined"||$scope.createGroup==undefined){ //!Note: createGroup holds the client's index we will be using
                                                                            //sorry for the bad naming convention
           // alert("No client selected.");
		    alert(i18n.t("messages.NoClientSelect"));
            return false;
        }
        $scope.getMaxGrpId();
    };
    $scope.createNewGroupSecond = function(){
        var client = $scope.available[$scope.createGroup]; //access the list of available clients with the client's index (client's index=createGroup)
        client.CLT_IS_GROUP_LEADER = 'Y'; //make group leader

        var BRC_PK = parseInt(sessionStorage.getItem("BRC_PK"));
        //console.log(client);

        var newID =  $scope.maxgroupid;
        var newName = "GROUP "+$scope.maxgroupid;

        if( $scope.centerLeader == 0) $scope.centerLeader = client.CLT_PK;

        var cmd  = "INSERT INTO T_CLIENT_GROUP VALUES (null, "+parseInt($scope.maxgroupid)+", "+client.CLT_BRC_PK+", "+client.CLT_CENTER_ID+", '"+newID+"', '"+newName+"', 1 )";
        var cltcmd = "UPDATE T_CLIENT SET CLT_GROUP_ID ='"+newName+"' WHERE CLT_PK="+client.CLT_PK;
        myDB.execute(cmd,function(results){

        });
        myDB.execute(cltcmd,function(results){
        });

        $scope.addClientToGroup($scope.createGroup,newID,client.CTR_CENTER_NAME);
    }


/******************************************
Add member to existing group
******************************************/
    $scope.addToExistingGroup = function(client){

        if($scope.createGroup=="undefined"||$scope.createGroup==undefined){
           // alert("No client selected.");
		    //alert(i18n.t("messages.NoClientSelect"));
            swal(i18n.t("messages.NoClientSelect"),"error");
            return false;
        }

        if($scope.currGroup=="undefined"||$scope.currGroup==undefined){
           // alert("No group selected.");
		    //alert(i18n.t("messages.NoGroupSelect"));
            swal(i18n.t("messages.NoGroupSelect"),"error");
            return false;
        }

        // //console.log($scope.currGroup);
        // //console.log($scope.createGroup);
        // //console.log($scope.getLeaderOf($scope.findGroup($scope.currGroup)).CLT_VILLAGE);

        // //console.log(client);
        // //console.log($scope.getLeaderOf($scope.currGroup));
 
        // if(parseInt(client.CLT_CENTER_ID) !=  $scope.currGroup.CENTER.value) {
        //     swal({
        //         title: i18n.t("messages.LdrDiffCenter")  ,
        //         type: "warning",
        //         confirmButtonColor: "#80C6C7",
        //         confirmButtonText: i18n.t("buttons.Ok"),
        //         closeOnConfirm: true
        //     });
        // } else {
        //     $scope.addClientToGroup($scope.createGroup,$scope.currGroup,client.CTR_CENTER_NAME);
        // }
        $scope.addClientToGroup($scope.createGroup,$scope.currGroup,client.CTR_CENTER_NAME);
        return false;

    }

    $scope.test = function(obj){
        $scope.currGroup = obj;
        refreshall('.selgroup')
    }

/******************************************
Checks if the member is in this group
******************************************/
    /*$scope.memInGroup = function(mem,grp){
        for(key in grp.MEMBERS){
            if(mem.CLT_PK==grp.MEMBERS[key].CLT_PK){
                return true;
            }
        }
        return false;
    }*/
    $scope.getMaxGrpId = function(){

        var client = $scope.available[$scope.createGroup];

        var centerid = client.CLT_CENTER_ID;

        ////console.log("SELECT CLG_CTR_PK, CLG_ID FROM T_CLIENT_GROUP WHERE CLG_CTR_PK='"+ centerid +"'  ORDER BY CLG_ID DESC LIMIT 1");
        myDB.execute("SELECT CLG_CTR_PK, CLG_ID FROM T_CLIENT_GROUP LEFT JOIN T_CENTER_MASTER WHERE CTR_PK = CLG_CTR_PK AND CTR_PK='"+ centerid +"'  ORDER BY CAST(CLG_ID AS INTEGER) DESC LIMIT 1",function(results){

            ////console.log(results.length);
            var groupid = "001";
            //console.log(results);
            if(results.length > 0){
                //console.log(results[0].CLG_ID);

                groupid = parseInt(results[0].CLG_ID) + 1;
                //console.log(groupid);
                //console.log(groupid.toString().length);
                var zcnt = "";
                for(var i=0; i < parseInt(3-groupid.toString().length); i++){
                    zcnt = zcnt.concat("0");
                }
                //console.log(zcnt);
                groupid = zcnt.concat(groupid);
                //console.log(groupid);
            }

            $scope.maxgroupid = groupid;
            $scope.createNewGroupSecond();
        });
    }

/******************************************
Count number of members in the group
******************************************/
    $scope.countMembers = function(group){
        var pk = [];
        var client;
        //console.log(group);
        for(key in group.MEMBERS){
            client = group.MEMBERS[key];
            if(pk.indexOf(client.CLT_PK)==-1){
                pk.push(client.CLT_PK); //client PK does not exist in our list yet
            }
        }
        return pk.length;
    }

/******************************************
Backend - add given client to chosen group
******************************************/
    $scope.addClientToGroup = function(clientid,grpid,centername){
        //perform check here

        var client = $scope.available[clientid];
        var grp = $scope.findGroup(grpid,client.CLT_CENTER_ID,centername);
        //console.log(grpid);
        //console.log(client.CLT_CENTER_ID);
        //console.log(centername);
        //console.log(grp);

        if($scope.createGroup=="undefined"||$scope.createGroup==undefined){
         //   alert("No client selected.");
			//swal(i18n.t("messages.NoClientSelect"));
            swal({
                title: i18n.t("messages.NoClientSelect"),
                type: "warning",
                confirmButtonColor: "#80C6C7",
                confirmButtonText: i18n.t("buttons.Ok"),
                closeOnConfirm: true
            });
            return false;
        } else if($scope.maxMembers > 0 && $scope.countMembers(grp)>=$scope.maxMembers){
           // alert("Group is full.");
		    //swal(i18n.t("messages.GroupFull"));
            swal({
                title: i18n.t("messages.GroupFull"),
                type: "warning",
                confirmButtonColor: "#80C6C7",
                confirmButtonText: i18n.t("buttons.Ok"),
                closeOnConfirm: true
            });
            return false;
        } else {

            var leader = $scope.getLeaderOf(grpid,client.CLT_CENTER_ID);
            //console.log(leader);
            if(!leader){
                //continue
            }else{
                if([40,21].indexOf(parseInt(leader.CLT_STATUS))!=-1){ //if leader has not applied for new loan
                   // alert("Group leader not yet applied for new loan.");
                    alert(i18n.t("messages.GroupLeaderHasNotApplyForNewLoan"));
                    return false;
                }
                if(leader.CLT_PK==client.CLT_PK)       //adding same client to group
                    client.CLT_IS_GROUP_LEADER = 'Y';   //set this new add as leader too. leader could be renewing loan
                else
                    client.CLT_IS_GROUP_LEADER = 'N';
            }

            client.CLT_GROUP_ID = grpid;         //set group ID
            grp.MEMBERS.push(client);            //add client to group
            $scope.available.splice(clientid,1); //and remove from list of available clients

            

            var cmd = "UPDATE T_CLIENT SET CLT_IS_GROUP_LEADER='"+client.CLT_IS_GROUP_LEADER+"', CLT_GROUP_ID='"+grpid+"', CLT_CTR_LEADER_PK="+$scope.centerLeader+", CLT_GRP_LEADER_PK="+leader.CLT_PK+" WHERE CLT_PK="+client.CLT_PK;
            myDB.dbShell.transaction(function(tx){
                tx.executeSql(cmd); //update database
            }, function(err){
                //alert("Error encountered saving into database.");
                alert(i18n.t("messages.SaveClientError"));
                window.location.href = "groupclients.html";
                return true;
            }, function(suc){});

            $scope.refreshUI(); //handle UI
        }


    };


    /*function haveMembers(){
        for(key in $scope.currGrp) return true;
        return false;
    };*/

    /******************************************
    //count number of clients in available list
    ******************************************/
    $scope.countAvailable = function(){
        var ttl = 0;
        for(key in $scope.available) ttl++;
        return ttl;
    };

    $scope.isitDone = function() {

        var ttl = 0;
        for(key in $scope.available) ttl++;

        if(ttl > 0){
            $('.addclientdone').hide();
        } else {
            $('.addclientdone').fadeIn();
        }

    }

    $scope.returnCall = function(ttl){

        return ttl;
    }

    /******************************************
    //Get leader of Group
    ******************************************/
    $scope.getLeaderOf = function(group,centerid){

        if(group == undefined || group == '' || group == null) return false;

        var leader = null;
        // //console.log($scope.savedGrps);
        // //console.log(group);
        // //console.log(centerid);
        $.each($scope.savedGrps,function(i,grp){
//            //console.log(grp.GROUP_ID+" "+group);
            if(grp.GROUP_ID == group && grp.CENTER.value == centerid){
                var members = grp.MEMBERS;
                for(memid in members){
  //                  //console.log(members[memid].CLT_IS_GROUP_LEADER);
                    if(members[memid].CLT_IS_GROUP_LEADER=='Y') {
                        // return members[memid];//.CLT_FULL_NAME
                        leader = members[memid];
                        return leader;
                    }
                }
            }
        });

        return leader;
    }
    /******************************************
    //Count number of new members in current group
    ******************************************/
    $scope.newInGrp = function(group){
        var count = 0;
        for(memid in group.MEMBERS){
            //if(group.MEMBERS[memid].CLL_MOB_NEW==1&&group.MEMBERS[memid].CLL_IS_GROUP_LEADER!="Y") count++;//.CLT_FULL_NAME
            if(group.MEMBERS[memid].CLT_MOB_NEW==1) count++;
        }
        return count;
    }

    /******************************************
    //Return only a list of unique clients in the group (so that multiple loans won't stack in the list)
    ******************************************/
    $scope.filterGroupNames = function(group){
        var filter = {};

        $.each(group, function(id,member){
            if(filter[member.CLT_PK]==null||member.CLT_MOB_NEW=="1"){

                if(member.CLT_IS_GROUP_LEADER != "Y"){
                    filter[member.CLT_PK] = member;
                }

            }
        });
        return filter;
    }

    /******************************************
    //Return only a list of unique clients in the group (so that multiple loans won't stack in the list)
    ******************************************/
    $scope.removeGroup = function(group){
        var cmd = [];
        var remove = [];
        $.each(group.MEMBERS,function(id, mem){
            if(mem.CLT_MOB_NEW=="1"&&mem.CLT_IS_GROUP_LEADER!="Y"){ //remove new members who are not leaders
                $scope.available.push(mem);         //add them to available list
                mem['CLT_IS_GROUP_LEADER'] = 'N';   //logically this should not happen but set to N anyway

                var c = "UPDATE T_CLIENT SET CLT_IS_GROUP_LEADER='N', CLT_GROUP_ID='' WHERE CLT_PK="+mem.CLT_PK;
                cmd.push(c);

                remove.push(id); //required to properly remove members below
            }  else if (mem.CLT_MOB_NEW=="1") {
                $scope.available.push(mem);         //add them to available list
                mem['CLT_IS_GROUP_LEADER'] = 'N';   //logically this should not happen but set to N anyway

                var c = "UPDATE T_CLIENT SET CLT_IS_GROUP_LEADER='N', CLT_CTR_LEADER_PK = '', CLT_GRP_LEADER_PK = '', CLT_GROUP_ID='' WHERE CLT_PK="+mem.CLT_PK;
                cmd.push(c);

                remove.push(id); //required to properly remove members below
            }
        });

        for(var i=remove.length-1;i>=0;i--){ group.MEMBERS.splice(remove[i],1); } //remove backwards

        //remove group if its empty
        if(group.MEMBERS.length<=0){

            $.each($scope.savedGrps,function(i,grp){
                if(grp.GROUP_ID == group.GROUP_ID && grp.CENTER.value == group.CENTER.value){
                    $scope.savedGrps.splice(i,1); //delete the whole group lol
                    return false;
                }
            });


            if($scope.savedGrps.length<=0){ //no more groups
                $("#addToGroup").parent().find('span').html("&nbsp;"); //reset UI
                $scope.currGroup = null;
            }
        }

        myDB.dbShell.transaction(function(tx){
            $.each(cmd, function(i,v){tx.executeSql(v);});
        }, function(err){
           // alert("Error encountered saving into database.");
		    swal(i18n.t("messages.SaveClientError"));
            //window.location.href = "groupclients.html";
            return true;
        }, function(suc){});

        $scope.refreshUI();

    };


    $scope.removeClient = function(group,mem){
        var cmd = [];

        //console.log(group);

        //var group = $scope.savedGrps[ind]; //given ID, take the group object
        var remove = [];

        if(mem.CLT_IS_GROUP_LEADER=="Y"){
            $scope.removeGroup(group);
        } else {

            var id = $.inArray(mem, group.MEMBERS);

            // var res = -1;
            // for(var i=0; i < group.MEMBERS.length; i++){
            //     if(group.MEMBERS[i].CLL_CLT_PK == mem.CLL_CLT_PK){
            //         res = i;
            //         break;
            //     }
            // }

            // //console.log(ind);
            // //console.log(mem);
            // //console.log(group.MEMBERS);
            // //console.log(id);
            // return false;

            if(mem.CLT_MOB_NEW=="1"&&mem.CLT_IS_GROUP_LEADER!="Y"){ //remove new members who are not leaders

                $scope.available.push(mem);         //add them to available list
                mem['CLT_IS_GROUP_LEADER'] = 'N';   //logically this should not happen but set to N anyway

                var c = "UPDATE T_CLIENT SET CLT_IS_GROUP_LEADER='N', CLT_CTR_LEADER_PK = '', CLT_GRP_LEADER_PK = '', CLT_GROUP_ID=null WHERE CLT_PK="+mem.CLT_PK;
                cmd.push(c);

                remove.push(id); //required to properly remove members below
            } else if (mem.CLT_MOB_NEW=="1") {
                $scope.available.push(mem);         //add them to available list
                mem['CLT_IS_GROUP_LEADER'] = 'N';   //logically this should not happen but set to N anyway

                var c = "UPDATE T_CLIENT SET CLT_IS_GROUP_LEADER='N',  CLT_CTR_LEADER_PK = '', CLT_GRP_LEADER_PK = '', CLT_GROUP_ID=null WHERE CLT_PK="+mem.CLT_PK;
                cmd.push(c);

                remove.push(id); //required to properly remove members below
            }


            group.MEMBERS.splice(id,1);
            //remove group if its empty
            if(group.MEMBERS.length<=0){
                var ind = $.inArray(mem, group.MEMBERS);
                $scope.savedGrps.splice(ind,1); //delete the whole group lol
                if($scope.savedGrps.length<=0){ //no more groups
                    $("#addToGroup").parent().find('span').html("&nbsp;"); //reset UI
                    $scope.currGroup = null;
                }
            }

            myDB.dbShell.transaction(function(tx){
                $.each(cmd, function(i,v){tx.executeSql(v);});
            }, function(err){
               // alert("Error encountered saving into database.");
                swal(i18n.t("messages.SaveClientError"));
                window.location.href = "groupclients.html";
                return true;
            }, function(suc){
                $scope.refreshUI();
            });



        }

    };

    /******************************************
    // Prepare data
    ******************************************/


    $scope.loadGroups = function(){
        var centerIds = [];
        var centerFilter = "";
        if (sessionStorage.getItem("CLIENT_CTR_PK") != undefined) {
            centerFilter = " AND CTR_PK =" + sessionStorage.getItem("CLIENT_CTR_PK");
            sessionStorage.removeItem("CLIENT_CTR_PK");
        }

        myDB.execute("SELECT CTR_PK, CTR_CENTER_NAME, CTR_CENTER_ID, CTR_CENTER_NAME, CLG_ID, CLG_NAME FROM T_CENTER_MASTER LEFT JOIN T_CLIENT_GROUP ON (CLG_CTR_PK = CTR_PK) WHERE CTR_PK IN(" + centerIds.join() +") ORDER BY CTR_CENTER_NAME", function(results){
            console.log(results);
            console.log("group list");
            if(results.length > 0) {
                $.each(results,function(ind, val){
                    var grp = $scope.findGroup(val.CLG_ID,val.CTR_PK,val.CTR_CENTER_NAME);
                });
            }
            var lg = "";
            lg += " SELECT CLT_MOB_NEW,CLT_FAMILY_CARD_NO, CLT_DOB,CLT_MOTHER_NM,CLT_MOTHER_DOB,CLT_STATUS,  CLT_PK, ";
            lg += " CLT_BRC_PK, CLT_FULL_NAME, CLT_OTH_REG_NO, CLT_GROUP_ID, CLT_IS_GROUP_LEADER, CAST(CLT_CENTER_ID as INTEGER) as CLT_CENTER_ID, CTR_CENTER_NAME";
            lg += "  FROM T_CLIENT, T_CENTER_MASTER WHERE CLT_CENTER_ID = CTR_PK " + centerFilter + " GROUP BY CLT_PK";

            myDB.execute(lg,function(results){
                //console.log(results);
                var res = [];
                $.each(results, function(ind,val){
                    var obj = {};
                    for(k in val){ obj[k] = val[k]; }
                    res.push(obj);
                }); //does a copy of the results, for some reason using results directly won't work

                results = res;

                $.each(results,function(ind, val){

                    if( centerIds.indexOf( val.CLT_CENTER_ID ) == -1 ) {
                        centerIds.push( val.CLT_CENTER_ID );
                    }

                    if(!val.CLT_GROUP_ID){ //if member is not in a group
                        $scope.available.push(val); //add to available
                    }else{
                        //add to existing groups
                        //var grp = $scope.findGroup(val.CLT_GROUP_ID);
                        var grp = $scope.findGroup(val.CLT_GROUP_ID,val.CLT_CENTER_ID,val.CTR_CENTER_NAME);
                        ////console.log(val);
                        grp.MEMBERS.push(val);
                    }
                }); 
                $.when($scope.$apply()).then(function(){ 
                    $scope.refreshUI();
                });
            });
            
        }); 

    };

    $scope.changeClient = function() {
        var client = $scope.available[$scope.createGroup];
        console.log($scope.savedGrps);
        console.log(client);
        console.log('change client');   
        $scope.defaultGroup();
    }

    $scope.defaultGroup = function() {
        
        var client = $scope.available[$scope.createGroup]; 
        
        if(client !== undefined) {
            $scope.getCenterLeader(client.CLT_CENTER_ID); 
            $.each($scope.savedGrps,function(ind, val){
                if( val.CENTER.value == client.CLT_CENTER_ID) {
                    $scope.currGroup = val.GROUP_ID; 
                    var grp = val;
                    $(".selgroup").parent().find('span').html(grp.CENTER.name + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;GROUP ' + grp.GROUP_ID); 
                    return false;
                }
            });
        }
    }

    /******************************************
    // Returns a new group object or an existing group given grp name
    ******************************************/
    $scope.findGroup = function(grpid,centerid,centername){
        //find the right group to put into
        var grp = null;
        var found = false;

        for(key in $scope.savedGrps){
            if($scope.savedGrps[key].GROUP_ID==grpid && parseInt($scope.savedGrps[key].CENTER.value) == parseInt(centerid)){
                grp = $scope.savedGrps[key];
                found = true;
            }
        }
        ////console.log($scope.savedGrps);
        if(!found){//if doesn't exist create the group

            var newgrp = {
                GROUP_ID:grpid,
                MEMBERS:[],
                CENTER: {
                    value: parseInt(centerid),
                    name: centername
                }
            };
            //console.log(newgrp);
            $scope.savedGrps.push(newgrp);
            return newgrp;

        } else {
            ////console.log(grp);
            return grp;
        }
    };

    /******************************************
    // Change leader (clicking on profile icon)
    ******************************************/
    var s = $scope;
    $scope.changeLeader = function(mem,group){
        var NEW_CLT_PK = mem.CLT_PK,
        members = group.MEMBERS,
        leader = $scope.getLeaderOf(group.GROUP_ID, group.CENTER.value);
        //console.log(leader);
        group_id = leader.CLT_GROUP_ID;

        if(mem.CLT_PK==leader.CLT_PK) return false; //no change to leader

        //  if(!confirm("Do you want to change group leader?")) return false; //confirmation
	    // if(!confirm(i18n.t("messages.ChangeGroupLeader"))) return false; //confirmation

     //    var reason = "";
     //    while(reason===""){ //reason is mandatory
     //        reason = sanitize(prompt("Please enter reason for changing group leader:"));
     //        if(reason==="null"){ //cancelled
     //            return false;
     //        }
     //    }

        swal({
            title: i18n.t("messages.ChangeGroupLeader"), 
            input: "text",
            showCancelButton: true,
            closeOnConfirm: false,
            animation: "slide-from-top",
            inputPlaceholder: "Reason",
            inputValidator: (value) => {
                return !value && 'You need to write something!'
              }
        }).then((data) => {
            var reason = data.value;
            console.log(reason);
            if (reason === false) return false;
            if (reason === "") {
                swal.showInputError("You need to give a reason!");
                return false
            } 

            for(var i=0;i<members.length;i++){
                if(members[i].CLT_IS_GROUP_LEADER=='Y') members[i].CLT_IS_GROUP_LEADER='N'; //set all leader's loans as not grp leader
                if(members[i].CLT_PK==NEW_CLT_PK) members[i].CLT_IS_GROUP_LEADER='Y';       //set all new leader's loans as leader
            }

            //existing client -> send client pk to server, else -> send unique fields so server can identify new leader
            var fields = [
                mem.CLT_OTH_REG_NO,
                mem.CLT_FAMILY_CARD_NO,
                mem.CLT_FULL_NAME,
                mem.CLT_DOB,
                mem.CLT_MOTHER_NM,
                mem.CLT_MOTHER_DOB
            ];
            var newLeaderPK = (mem.CLT_MOB_NEW==1)?sanitize(fields.join("_")):mem.CLT_PK;

            //make changes permanent, save into DB
            myDB.execute("SELECT COUNT(TGP_GROUP_ID) as numRecords,TGP_OLD_LEADER FROM T_TXN_GROUP WHERE TGP_GROUP_ID='"+group_id+"'", function(results){
                var date = moment().format('DD/MM/YYYY HH:mm:ss');
                var cmds = [];

                if(results[0].TGP_OLD_LEADER==mem.CLT_PK) //if change back to old leader again, remove the change request
                    cmds.push("DELETE FROM T_TXN_GROUP WHERE TGP_GROUP_ID='"+group_id+"'");
                else if(results[0].numRecords<=0) //insert new change leader request if none exists
                    cmds.push("INSERT INTO T_TXN_GROUP VALUES(null,'"+group_id+"',"+leader.CLT_PK+",'"+newLeaderPK+"','"+reason+"',"+FO_PK+",'"+date+"')");
                else //or update current one if a previous change was registered
                    cmds.push("UPDATE T_TXN_GROUP SET TGP_NEW_LEADER='"+newLeaderPK+"',TGP_CREATED_DATE='"+date+"' WHERE TGP_GROUP_ID='"+group_id+"'");

                //update the loans for current users
                //for leader -> for 1) loans of 2) this groupid set leader is_group_leader to "N"
                cmds.push("UPDATE T_CLIENT SET CLT_IS_GROUP_LEADER='N' WHERE CLT_GROUP_ID='"+group_id+"' AND CLT_PK="+leader.CLT_PK);
                //for member -> for 1) loans of 2) this groupid set leader is_group_leader to "Y"
                cmds.push("UPDATE T_CLIENT SET CLT_IS_GROUP_LEADER='Y' WHERE CLT_GROUP_ID='"+group_id+"' AND CLT_PK="+mem.CLT_PK);

                myDB.dbShell.transaction(function(tx){
                    for(e in cmds) tx.executeSql(cmds[e]);
               // }, function(err){alert("There was an error making change leader request.");return false;}, function(suc){
                }, function(err){alert(i18n.t("messages.ChangeLeaderError"));return false;}, function(suc){
                   // alert("Group leader changed.");
                    swal(i18n.t("messages.GroupLeaderChange"));
                    $scope.$apply();
                });
            });
        });



    };
    $scope.getCenterLeader = function(centerid){
        myDB.execute("SELECT CLT_PK FROM T_CLIENT WHERE CLT_IS_GROUP_LEADER= 'Y' AND CAST(CLT_CENTER_ID as INTEGER)="+centerid+" ORDER BY CLT_PK LIMIT 1", function(res){
              console.log(res);
              if(res.length > 0 && res[0].CLT_PK !== null){
                    $scope.centerLeader = res[0].CLT_PK;
              }
        })
    }
    /******************************************
    // Make sure UI is showing the right values, an angular/jquery mobile fix
    ******************************************/
    $scope.refreshUI = function(){

        $scope.grouptext = i18n.t("messages.Group");
        $scope.actiontext = i18n.t("messages.Action");

        if($scope.createGroup == null){
            $scope.createGroup = '0';
        } 
        if($scope.available[$scope.createGroup])
            $("#createGroup").parent().find('span').html($scope.available[$scope.createGroup].CLT_FULL_NAME); 
        
        $scope.changeClient($scope.createGroup);
        $scope.defaultGroup();

        setTimeout(function(){
            var $container = $('.grid');
            $container.masonry('reloadItems');
            $container.masonry();
            $scope.isitDone();
            $scope.$apply();
            // $scope.$apply().done(function(){
            //     // $("#addToGroup option:first").attr('selected','selected');
            //     // $('#addToGroup').selectmenu('refresh',true);
            // });
        },1);

    }

    /******************************************
    // search for clients to show on group page, autoload
    ******************************************/
    setTimeout(function(){
        $scope.loadGroups(); 
    },1)


});


(function() {
            var myApp = angular.module("myApp", []);
            myApp.controller("clientCtrl", function($scope){
                
                /******************************************
                - Applicant's Data
                ******************************************/
                //camera
                $scope.takePhoto = function(){
                    navigator.camera.getPicture($scope.onSuccess, $scope.onFail, {
                        quality: 50,
                        targetWidth: 400,
                        targetHeight: 514,
                        correctOrientation: true,
                        //destinationType: Camera.DestinationType.FILE_URI
                        destinationType: Camera.DestinationType.DATA_URL
                    });
                }
                $scope.onSuccess = function (imageData) {
                    //$("#ncadPhoto").attr("src",imageData);
                    //alert(imageData);
                    $scope.$apply(function () {
                        //$scope.clients = results;
                        //$scope.applicantdata.photo = imageData;
                        $scope.applicantdata.photo = "data:image/jpeg;base64," + imageData;
                        //$("#ncadPhoto").src = "data:image/jpeg;base64," + imageData;
                        //$("#ncadPhoto").attr("src",imageURI);
                    });
                }
                $scope.onFail = function (message) {alert('Failed because: ' + message);}

                $scope.applicantdata = {
                    photo:null,
                    filename:null,
                    fullname:null,
                    nickname:null,
                    familycardno:null,
                    otherreg:null,
                    dateofbirth:null,
                    age:null,
                    highested:null,
                    highestedothers:null,
                    clientidno:null,
                    groupno:null,
                    role:null,
                };
                $scope.apHighestEdOthers = function(){
                  return $scope.applicantdata.highested=="O";  
                };
                $scope.adCalcAge = function(){
                    //alert(moment().diff(moment($scope.applicantdata.dateofbirth),'years'));
                    $scope.applicantdata.age = moment().diff(moment($scope.applicantdata.dateofbirth),'years');
                    return $scope.applicantdata.age;   
                }
                /******************************************
                - Husband's Info
                ******************************************/
                
                $scope.husbandinfo = {
                    maritalstatus:"S",
                    husbandname:null,
                    husbandidno:null,
                    livesinhouse:true,
                    whereis:null,
                    howoften:null,
                };
                
                /******************************************
                - Household and Mother Info
                ******************************************/
                
                $scope.housemotherinfo = {
                    noofmembers:null,
                    noofchildren:null,
                    mothername:null,
                    motherdob:null,
                    motherage:null,
                };
                $scope.hmiCalcMotherAge = function(){
                    $scope.housemotherinfo.motherage = moment().diff(moment($scope.housemotherinfo.motherdob),"years"); 
                    return $scope.housemotherinfo.motherage;   
                }
                
                /******************************************
                - Welfare Status
                ******************************************/
                $scope.welfareStatus=1;
                $scope.selectWelfare = function(selection){
                    $scope.welfareStatus = selection;
                };
                $scope.checkWelfare = function(selection){
                    return selection===$scope.welfareStatus;
                };

                /******************************************
                - Business Info
                ******************************************/
                
                $scope.businessinfo = {
                    typeofbusiness:null,
                    busequipment:null,
                    jointbusiness:null,
                    jbequipment:null,
                    husbandbusiness:null,
                    hbequipment:null,
                };
                
                /******************************************
                - Address
                ******************************************/
                
                $scope.address = {
                    rtrw:null,
                    streetarea:null,
                    village:null,
                    subdistrict:null,
                    district:null,
                    province:null,
                    postcode:null,
                    landmark:null,
                    mobile1:null,
                    mobile2:null,
                    husbmobile:null,
                };
                
                /******************************************
                - Working Capital
                ******************************************/
                
                $scope.borrowedFunds = [];
                $scope.fundEntry = {};
                $scope.selectedfund = -1;
                $scope.workcap = {
                    app:0,
                    husband:0,
                    totalWorkCap : function(){
                    return $scope.workcap.app+$scope.workcap.husband;
                    },
                }
                //$scope.appWorkCap = 0;
                //$scope.husbandWorkCap = 0;
                /*$scope.totalWorkCap = function(){
                    return $scope.appWorkCap+$scope.husbandWorkCap;
                };*/
                
                $scope.addFund = function(){
                    $scope.borrowedFunds.push($scope.fundEntry);
                    $scope.fundEntry = {};
                };
                $scope.selectFund = function(newinfo){
                    $scope.selectedfund=newinfo;
                };
                $scope.isSelectedFund = function(newinfo){
                    return newinfo===$scope.selectedfund;
                };
                $scope.deleteFund = function(newinfo){
                    $scope.borrowedFunds.splice(newinfo,1);
                    $scope.selectedfund = -1;
                };

                /******************************************
                - House Income
                ******************************************/
                
                $scope.houseIncomes = [];
                $scope.incomeEntry = {};
                $scope.incomeEntry.capitalby = "Client";
                $scope.selectedEntry = -1;
                
                $scope.addEntry = function(){
                    $scope.houseIncomes.push($scope.incomeEntry);
                    $scope.incomeEntry = {};
                };
                $scope.selectEntry = function(newinfo){
                    $scope.selectedEntry=newinfo;
                };
                $scope.isSelectedEntry = function(newinfo){
                    return newinfo===$scope.selectedEntry;
                };
                $scope.deleteEntry = function(newinfo){
                    $scope.houseIncomes.splice(newinfo,1);
                    $scope.selectedEntry = -1;
                };

                /******************************************
                - House Type
                ******************************************/
                $scope.houseinfo={
                    housetype: 1,
                    total : function(){
                        var total = 0;
                      for(i in $scope.choices){
                          total += parseInt(i);
                      }
                        return total;
                    },
                };
				$scope.choices = ['0','0','0','0','0','0','0']; //getTotal() is more important

                        $scope.houseindices = [
							{label:"House Size",
								scoring: [
									{type:"Large (3)", score:"3"},
									{type:"Average (1)", score:"1"},
									{type:"Small (0)", score:"0"}
								]
							},
							{label:"House Condition",
								scoring: [
									{type:"Good (3)", score:"3"},
									{type:"Average (1)", score:"1"},
									{type:"Damaged (0)", score:"0"}
								]
							},
							{label:"Roof Type",
								scoring: [
									{type:"Special Tile (2)", score:"2"},
									{type:"Ordinary Tile/Asbestos/Aluminium Sheet (1)", score:"1"},
									{type:"Grass (0)", score:"0"}
								]
							},
							{label:"Wall Type",
								scoring: [
									{type:"Brick (2)", score:"2"},
									{type:"Half Brick Wall/Not Plastered (1)", score:"1"},
									{type:"Wood/bamboo/woven bamboo (0)", score:"0"}
								]
							},
							{label:"Floor Type",
								scoring: [
									{type:"Tiles (2)", score:"2"},
									{type:"<25% tiled/cement/broken tiles/traditional tile (1)", score:"1"},
									{type:"Earth/elevated floor (0)", score:"0"}
								]
							},
							{label:"Electricity",
								scoring: [
									{type:"Grid (2)", score:"2"},
									{type:"Connected to Neighbour (1)", score:"1"},
									{type:"None (0)", score:"0"}
								]
							},
							{label:"Water Source",
								scoring: [
									{type:"Piped (2)", score:"2"},
									{type:"Pumped/protected or indoor well (1)", score:"1"},
									{type:"Unprotected or outside well/None (0)", score:"0"}
								]
							}
						];
                        $scope.deleteFund = function(newinfo){
                            $scope.borrowedFunds.splice(newinfo,1);
                            $scope.selectedfund = -1;
                        };
						$scope.getTotal = function(){
							total = 0;
							for(var e in $scope.choices) total += +$scope.choices[e];
							return total;
						};
                /*$scope.finaldata = {
                        "applicantdata":$scope.applicantdata,
                        "husbandinfo":$scope.husbandinfo,
                        "housemotherinfo":$scope.housemotherinfo,
                        "welfarestatus":$scope.welfareStatus,
                        "businessinfo":$scope.businessinfo,
                        "address":$scope.address,
                        "borrowedfunds":$scope.borrowedFunds,
                        "workcap":$scope.workcap,
                        //"husbandworkcap":$scope.husbandWorkCap,
                        "houseincomes":$scope.houseIncomes,
                        "houseinfo":$scope.houseinfo,
                        "choices":$scope.choices,
                    };
                $scope.add_fake = function(){

                };*/
                $scope.actionSubmit = function(){
                    //var conf = confirm("Submit new client information?", "Confirm", "Cancel"); 
                    if(!confirm("Submit new client information?")) return;
                    //$scope.add_fake();
                    //save into database
                    //myDB.execute("SELECT MAX(P_ID) as maxpid FROM T_CLIENT", function(results){
                    //var query = "SELECT mclt_pk, mcll_pk FROM (SELECT MAX(CLT_PK) as mclt_pk FROM T_CLIENT) AS TC INNER JOIN (SELECT MAX(CLL_PK) as mcll_pk,MAX(CLL_CLT_PK) as mcll_clt_pk FROM T_CLIENT_LOAN) AS TCL";
                    //var query = "SELECT mclt_pk, mcll_pk, mcef_pk FROM (SELECT MAX(CLT_PK) as mclt_pk FROM T_CLIENT) AS TC INNER JOIN (SELECT MAX(CLL_PK) as mcll_pk FROM T_CLIENT_LOAN) AS TCL INNER JOIN (SELECT MAX(CEF_PK) as mcef_pk FROM T_CLIENT_BORROWED_FUNDS) AS TCEF";
                    var query = "SELECT * FROM (SELECT MAX(CLT_PK) as mclt_pk FROM T_CLIENT) AS TC INNER JOIN (SELECT MAX(CLL_PK) as mcll_pk FROM T_CLIENT_LOAN) AS TCL INNER JOIN (SELECT MAX(CEF_PK) as mcef_pk FROM T_CLIENT_BORROWED_FUNDS) AS TCEF INNER JOIN (SELECT MAX(CLI_PK) as mcli_pk FROM T_CLIENT_INCOME) AS TCLI";
                    var applicantdata = $scope.applicantdata;
                    var husbandinfo = $scope.husbandinfo;
                    var housemotherinfo = $scope.housemotherinfo;
                    var husbandinfo = $scope.husbandinfo;
                    var businessinfo = $scope.businessinfo;
                    var address = $scope.address;
                    var welfareStatus = $scope.welfareStatus;
                    var workcap = $scope.workcap;
                    var houseinfo = $scope.houseinfo;
                    var choices = $scope.choices;
                    var borrowedFunds = $scope.borrowedFunds;
                    var houseIncomes = $scope.houseIncomes;
                    
                    myDB.execute(query, function(results){
                        if(results.length<0) return;
                        var CLT_PK = results[0].mclt_pk+1;
                        var CLL_PK = results[0].mcll_pk+1;
                        var CEF_PK = results[0].mcef_pk+1;
                        var CLI_PK = results[0].mcli_pk+1;
                        //alert(CLT_PK+" "+CLL_PK);
                        //file name used in localstorage
                        applicantdata.filename = CLT_PK;
                        
                        var USER_PK = parseInt(sessionStorage.getItem("USER_PK"));
                        var BRC_PK = parseInt(sessionStorage.getItem("BRC_PK"));
                        var CLL_ORIGINAL_LOAN = sessionStorage.getItem("CLL_ORIGINAL_LOAN");
                        var CLL_LOAN_INTEREST = sessionStorage.getItem("CLL_LOAN_INTEREST");
                        var CLL_CRF_PERCENTAGE = sessionStorage.getItem("CLL_CRF_PERCENTAGE");
                        
                        if(!USER_PK||!BRC_PK||!CLL_ORIGINAL_LOAN||!CLL_LOAN_INTEREST||!CLL_CRF_PERCENTAGE){
                          alert("Please log in again.");
                          window.location.href = "index.html";
                        }
                        var CLL_CRF_AMOUNT = CLL_ORIGINAL_LOAN * CLL_CRF_PERCENTAGE;
                        var query1 = "INSERT INTO T_CLIENT VALUES(null,"+CLT_PK+",'"+BRC_PK+"','"+applicantdata.fullname+"','"+applicantdata.nickname+"','"+husbandinfo.husbandname+"','"+husbandinfo.husbandidno+"','"+husbandinfo.livesinhouse+"','"+applicantdata.familycardno+"',null,'"+applicantdata.otherreg+"','"+applicantdata.dateofbirth+"','"+applicantdata.age+"','"+applicantdata.highested+"','"+applicantdata.highestedothers+"','"+husbandinfo.maritalstatus+"','"+housemotherinfo.noofmembers+"','"+housemotherinfo.noofchildren+"','"+husbandinfo.whereis+"','"+husbandinfo.howoften+"','"+housemotherinfo.mothername+"','"+housemotherinfo.motherdob+"','"+housemotherinfo.motherage+"','"+businessinfo.typeofbusiness+"','"+businessinfo.busequipment+"','"+businessinfo.jointbusiness+"','"+businessinfo.jbequipment+"','"+businessinfo.husbandbusiness+"','"+businessinfo.hbequipment+"','"+address.rtrw+"','"+address.streetarea+"','"+address.village+"','"+address.subdistrict+"','"+address.district+"','"+address.province+"','"+address.postcode+"','"+address.landmark+"','"+address.mobile1+"','"+$scope.address.mobile2+"','"+address.husbmobile+"',null,null,'"+USER_PK+"',"+moment()+",1,'"+applicantdata.j+"',"+1+");";
                        var query2 = "INSERT INTO T_CLIENT_LOAN VALUES(null,"+CLL_PK+","+BRC_PK+","+CLT_PK+","+USER_PK+","+welfareStatus+","+workcap.app+","+workcap.husband+","+houseinfo.housetype+","+choices['0']+","+choices['1']+","+choices['2']+","+choices['3']+","+choices['4']+","+choices['5']+","+choices['6']+","+houseinfo.total()+",null,"+CLL_ORIGINAL_LOAN+",null,"+CLL_LOAN_INTEREST+","+CLL_CRF_PERCENTAGE+","+CLL_CRF_AMOUNT+",null,null,null,null,null,null,null,null,"+USER_PK+","+moment()+",null,0,1)";
                        var query3 = [];var query4 =[];
                        for(key in borrowedFunds){
                            query3.push("INSERT INTO T_CLIENT_BORROWED_FUNDS VALUES(null,"+CEF_PK+","+CLT_PK+","+CLL_PK+",'"+borrowedFunds[key].loanfrom+"','"+borrowedFunds[key].loanfromname+"','"+borrowedFunds[key].applicant+"',"+borrowedFunds[key].originalamt+","+borrowedFunds[key].balance+","+borrowedFunds[key].repaymentperwk+","+borrowedFunds[key].repaymentpermth+","+1+");");
                        }
                        for(key in houseIncomes){
                            query4.push("INSERT INTO T_CLIENT_INCOME VALUES(null,"+CLI_PK+","+CLT_PK+","+CLL_PK+",'"+houseIncomes[key].capitalby+"','"+houseIncomes[key].activity+"','"+houseIncomes[key].location+"',"+houseIncomes[key].owncapita+","+houseIncomes[key].revpermth+","+houseIncomes[key].exppermth+","+houseIncomes[key].profpermth+","+houseIncomes[key].totalinmth+","+houseIncomes[key].netrev+","+1+");");
                        }
                        //console.log("Test sql 1:"+query1);
                        //console.log("Test sql 2:"+query2);
                        //console.log("Test sql 3:"+query3);
                        //console.log("Test sql 4:"+query4);
                        //add new client into the database
                        alert("Saving picture");
                        var promise = fileManager.write("photo"+CLT_PK+".dataurl",applicantdata.photo);
                        $.when(promise).then(function(res){
                            //alert(res);
                                alert("Saving data");
                                myDB.dbShell.transaction(function(tx){
                                tx.executeSql(query1); 
                                tx.executeSql(query2); 
                                for(e in query3){tx.executeSql(query3[e]); }
                                for(e in query4){tx.executeSql(query4[e]);}
                                //save image
                                //localStorage.setItem("photo"+applicantdata.filename, applicantdata.photo);

                            }, function(err){throw(JSON.stringify(err));return true;}, function(suc){
                                alert("Successfully added client "+CLT_PK+":"+ $scope.applicantdata.fullname);
                                window.location.href = "client.html";
                                return true;
                            });
                        });
                        
                        
                        /*myDB.dbShell.transaction(function(tx){
                            tx.executeSql("SELECT COUNT(P_ID) FROM T_CLIENT;"); 
                        },null,null);*/
                        //console.log("Result:"+USER_PK+" "+BRC_PK+" "+CLL_ORIGINAL_LOAN+" "+CLL_LOAN_INTEREST+" "+CLL_CRF_PERCENTAGE+" "+CLL_CRF_AMOUNT);
                        //alert(JSON.stringify(results[0]));
                        //alert(parseInt(results[0].maxpid)+1);
                        //var newID = parseInt(results[0].maxpid)+1;
                        //$scope.applicantdata.clientidno
                        //myDB.T_CLIENT.add(newID,0,$scope.applicantdata.fullname,$scope.applicantdata.nickname,$scope.husbandinfo.husbandname,$scope.husbandinfo.husbandidno,$scope.husbandinfo.livesinhouse,$scope.applicantdata.familycardno,null,$scope.applicantdata.otherreg,moment($scope.applicantdata.dateofbirth),parseInt($scope.applicantdata.age),$scope.applicantdata.highested,$scope.applicantdata.highestedothers,$scope.husbandinfo.maritalstatus,parseInt($scope.housemotherinfo.noofmembers),parseInt($scope.housemotherinfo.noofchildren),$scope.husbandinfo.whereis,$scope.husbandinfo.howoften,$scope.housemotherinfo.mothername,moment($scope.housemotherinfo.motherdob),parseInt($scope.housemotherinfo.motherage),$scope.businessinfo.typeofbusiness,$scope.businessinfo.busequipment,$scope.businessinfo.jointbusiness,$scope.businessinfo.jbequipment,$scope.businessinfo.husbandbusiness,$scope.businessinfo.hbequipment,$scope.address.rtrw,$scope.address.streetarea,parseInt($scope.address.village),$scope.address.subdistrict,$scope.address.district,$scope.address.province,parseInt($scope.address.postcode),$scope.address.landmark,$scope.address.mobile1,$scope.address.mobile2,$scope.address.husbmobile,null,null,null,moment(),1);    
                        //myDB.T_CLIENT_LOAN.add(...);
                        //for-loop through borrowedFunds and for each do this:
                        //myDB.T_CLIENT_BORROWED_FUNDS.add(...);

                    });                    
                    //$scope.finaldata = {{null,null,$scope.applicantdata.fullname,$scope.applicantdata.nickname,$scope.husbandinfo.husbandname,$scope.husbandinfo.husbandidno,$scope.husbandinfo.livesinhouse,$scope.applicantdata.familycardno,$scope.applicantdata.clientidno,null,$scope.applicantdata.dateofbirth,$scope.applicantdata.age,$scope.applicantdata.highested,$scope.applicantdata.highestedothers,$scope.husbandinfo.maritalstatus,$scope.housemotherinfo.noofmembers,$scope.housemotherinfo.noofchildren,$scope.husbandinfo.whereis,$scope.husbandinfo.howoften,$scope.housemotherinfo.mothername,$scope.housemotherinfo.motherdob,null,$scope.businessinfo.typeofbusiness,$scope.businessinfo.busequipment,$scope.businessinfo.jointbusiness,$scope.businessinfo.jbequipment,$scope.businessinfo.husbandbusiness,$scope.businessinfo.hbequipment,$scope.address.rtrw,$scope.address.streetarea,$scope.address.village,$scope.address.subdistrict,$scope.address.district,$scope.address.province,$scope.address.postcode,$scope.address.landmark,$scope.address.mobile1,$scope.address.mobile2,$scope.address.husbmobile,null,null,null,null,null}};
                  //$scope.applicantdata.fullname = "submitted";
                    
                    //alert(JSON.stringify($scope.finaldata));
                    //$scope.finaldata = [{"applicantdata":{"photo":null,"fullname":"Miriana","nickname":"Mir","familycardno":"1234-5678-90A","dateofbirth":"1/1/1950","age":"23","highested":"O","highestedothers":"Not Syllabus","clientidno":"56789A","groupno":"56789","role":"member"},"husbandinfo":{"maritalstatus":"NA","husbandname":"Johan","husbandidno":"1234-5678-90","livesinhouse":null,"whereis":"Not at home","howoften":"once a week"},"housemotherinfo":{"noofmembers":4,"noofchildren":2,"mothername":"Milla","motherdob":"1970-02-01T16:00:00.000Z","motherage":"44 years ago"},"welfarestatus":1,"businessinfo":{"typeofbusiness":"Business1","busequipment":"Equipment1","jointbusiness":"Business2","jbequipment":"Equipment2","husbandbusiness":"Business3","hbequipment":"Equipment3"},"borrowedfunds":[{"loanfrom":"MFI1","applicant":"Applicant1","originalamt":40,"balance":20,"repaymentperwk":1,"repaymentpermth":28},{"loanfrom":"MFI2","applicant":"Applicant2","originalamt":50,"balance":50,"repaymentperwk":1,"repaymentpermth":28}],"appworkcap":0,"husbandworkcap":0,"houseincomes":[{"activity":"Activity1","location":"Loc1","owncapita":23,"revpermth":1,"exppermth":1,"profpermth":1,"totalinmth":28,"netrev":28},{"activity":"activity2","location":"loc2","owncapita":50,"revpermth":1,"exppermth":1,"profpermth":1,"totalinmth":28,"netrev":28}],"houseinfo":{"housetype":"1"},"choices":["3","0","0","1","1","2","1"]},
                    //    {"applicantdata":{"photo":null,"fullname":"Zirnia","nickname":"Zir","familycardno":"1234-5678-90A","dateofbirth":"2/2/1950","age":"23","highested":"O","highestedothers":"Not Syllabus","clientidno":"56789A","groupno":"56789","role":"member"},"husbandinfo":{"maritalstatus":"NA","husbandname":"Johan","husbandidno":"1234-5678-90","livesinhouse":null,"whereis":"Not at home","howoften":"once a week"},"housemotherinfo":{"noofmembers":4,"noofchildren":2,"mothername":"Milla","motherdob":"1970-02-01T16:00:00.000Z","motherage":"44 years ago"},"welfarestatus":1,"businessinfo":{"typeofbusiness":"Business1","busequipment":"Equipment1","jointbusiness":"Business2","jbequipment":"Equipment2","husbandbusiness":"Business3","hbequipment":"Equipment3"},"borrowedfunds":[{"loanfrom":"MFI1","applicant":"Applicant1","originalamt":40,"balance":20,"repaymentperwk":1,"repaymentpermth":28},{"loanfrom":"MFI2","applicant":"Applicant2","originalamt":50,"balance":50,"repaymentperwk":1,"repaymentpermth":28}],"appworkcap":0,"husbandworkcap":0,"houseincomes":[{"activity":"Activity1","location":"Loc1","owncapita":23,"revpermth":1,"exppermth":1,"profpermth":1,"totalinmth":28,"netrev":28},{"activity":"activity2","location":"loc2","owncapita":50,"revpermth":1,"exppermth":1,"profpermth":1,"totalinmth":28,"netrev":28}],"houseinfo":{"housetype":"1"},"choices":["3","0","0","1","1","2","1"]}];
                    //$scope.finaldata = [];
                    //$scope.finaldata.push({"applicantdata":{"photo":null,"fullname":"Miriana","nickname":"Mir","familycardno":"1234-5678-90A","dateofbirth":"1/1/1950","age":"23","highested":"O","highestedothers":"Not Syllabus","clientidno":"56789A","groupno":"56789","role":"member"},"husbandinfo":{"maritalstatus":"NA","husbandname":"Johan","husbandidno":"1234-5678-90","livesinhouse":null,"whereis":"Not at home","howoften":"once a week"},"housemotherinfo":{"noofmembers":4,"noofchildren":2,"mothername":"Milla","motherdob":"1970-02-01T16:00:00.000Z","motherage":"44 years ago"},"welfarestatus":1,"businessinfo":{"typeofbusiness":"Business1","busequipment":"Equipment1","jointbusiness":"Business2","jbequipment":"Equipment2","husbandbusiness":"Business3","hbequipment":"Equipment3"},"borrowedfunds":[{"loanfrom":"MFI1","applicant":"Applicant1","originalamt":40,"balance":20,"repaymentperwk":1,"repaymentpermth":28},{"loanfrom":"MFI2","applicant":"Applicant2","originalamt":50,"balance":50,"repaymentperwk":1,"repaymentpermth":28}],"appworkcap":0,"husbandworkcap":0,"houseincomes":[{"activity":"Activity1","location":"Loc1","owncapita":23,"revpermth":1,"exppermth":1,"profpermth":1,"totalinmth":28,"netrev":28},{"activity":"activity2","location":"loc2","owncapita":50,"revpermth":1,"exppermth":1,"profpermth":1,"totalinmth":28,"netrev":28}],"houseinfo":{"housetype":"1"},"choices":["3","0","0","1","1","2","1"]});
                    //$scope.finaldata.push({"applicantdata":{"photo":null,"fullname":"Zirnia","nickname":"Zir","familycardno":"1234-5678-90A","dateofbirth":"2/2/1950","age":"23","highested":"O","highestedothers":"Not Syllabus","clientidno":"56789A","groupno":"56789","role":"member"},"husbandinfo":{"maritalstatus":"NA","husbandname":"Johan","husbandidno":"1234-5678-90","livesinhouse":null,"whereis":"Not at home","howoften":"once a week"},"housemotherinfo":{"noofmembers":4,"noofchildren":2,"mothername":"Milla","motherdob":"1970-02-01T16:00:00.000Z","motherage":"44 years ago"},"welfarestatus":1,"businessinfo":{"typeofbusiness":"Business1","busequipment":"Equipment1","jointbusiness":"Business2","jbequipment":"Equipment2","husbandbusiness":"Business3","hbequipment":"Equipment3"},"borrowedfunds":[{"loanfrom":"MFI1","applicant":"Applicant1","originalamt":40,"balance":20,"repaymentperwk":1,"repaymentpermth":28},{"loanfrom":"MFI2","applicant":"Applicant2","originalamt":50,"balance":50,"repaymentperwk":1,"repaymentpermth":28}],"appworkcap":0,"husbandworkcap":0,"houseincomes":[{"activity":"Activity1","location":"Loc1","owncapita":23,"revpermth":1,"exppermth":1,"profpermth":1,"totalinmth":28,"netrev":28},{"activity":"activity2","location":"loc2","owncapita":50,"revpermth":1,"exppermth":1,"profpermth":1,"totalinmth":28,"netrev":28}],"houseinfo":{"housetype":"1"},"choices":["3","0","0","1","1","2","1"]});
                    //$scope.finaldata = ["123", "456"];
                    //$scope.finaldata = [{"data":"123"}, {"data":"456"}];
                    //var arr = new Array();
                    //arr.push("123");
                    //arr.push("456");
                    //arr[0] = "123";
                    //arr[1] = "345";
                    //$scope.finaldata = arr;
                    /*$.ajax({
                      url: "http://192.168.88.225:8080/MBK/CommonBuildJSON?strMode=push",
                      data: {"fullData":JSON.stringify($scope.finaldata)},//$scope.finaldata
                      type: "POST",
                      cache:false,
                      async:false,
                      crossDomain: true,
                      datatype: 'json',
                      success: function(result){alert("success"+result);},
                      error: function(error){alert("error"+JSON.stringify(error));},
                    });*/
                };

//grab values
                var t = this;
                $scope.selectCodes = {
                    //highested = null,
                    process : function(results){
                        //alert(JSON.stringify(results));
                        results.forEach(function(value,index){
                           //$scope.selectCodes[key] = value;
                            //alert("C:"+value.CODE_TYPE_PK);
                            $scope.selectCodes[value.CODE_TYPE_PK] || ($scope.selectCodes[value.CODE_TYPE_PK] = []); //init if null
                            var keypair = {'name': value.CODE_NAME,'value': value.CODE_VALUE}
                            $scope.selectCodes[value.CODE_TYPE_PK].push(keypair);
                        });
                        //alert(JSON.stringify($scope.selectCodes));
                    },
                };
                this.setCodes = function(results){ //setClientInfo
                    $scope.$apply(function () {$scope.selectCodes.process(results);});
                };
                myDB.T_CODE.get("CODE_TYPE_PK=1",function(results){
                    t.setCodes(results);
                    //alert(JSON.stringify(results));
                });
                
//Codes  before this line here
                    });
                })();

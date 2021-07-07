function init(){ 
    initTemplate.load(1); //load header
}

/******************************************
// Controller
******************************************/  
var USER_PK             = sessionStorage.getItem("USER_PK");
var USER_NAME           = sessionStorage.getItem("USER_NAME");
var USER_HAVE_SIG       = sessionStorage.getItem("USER_HAVE_SIG");
var USER_SIG            = (sessionStorage.getItem("USER_SIG") === null ? '' : sessionStorage.getItem("USER_SIG"));
var USER_SIGNED         = (sessionStorage.getItem("USER_HAVE_SIG") == 'Y' ? true : false );
var BRC_PK              = sessionStorage.getItem("BRC_PK");
var BRC_NAME            = sessionStorage.getItem("BRC_NAME");
var BRC_PHONE           = sessionStorage.getItem("BRC_PHONE");
var CMP_NAME            = sessionStorage.getItem("CMP_NAME");
 
var myApp = angular.module("myApp",['ng-currency', 'pascalprecht.translate']);
  
myApp.config(function ($translateProvider) {

    $translateProvider.useStaticFilesLoader({
        prefix: "locales/locale-",
        suffix: ".json"
    });
    $translateProvider.preferredLanguage(ln.language.code);
});

  
myApp.controller("ppiCtrl", function($scope,$filter,$timeout){

    $scope.maxPPIFormPk = 0;
    $scope.maxPPIAnsPk = 0;
    $scope.isPPIComplete = false;

    $scope.user = {
        userPK:USER_PK,
        userName:USER_NAME,
        userHaveSig:USER_HAVE_SIG,
        branchPK:BRC_PK,
        branchName:BRC_NAME,
        companyName:CMP_NAME,    
        Signature: USER_SIG,
        hasSigned: false
    };
    
    $scope.applicantdata = {
        fullname: '',
        hasSigned: false,
        CLT_SIGNATURE: null,
    }

    $scope.showSign = false;
    $scope.signingclientIndex = null;
    $scope.signinguser = null;

    $scope.groupmembers = [];

    $scope.ctr_lead = {
        ctr_lead_pk: null,
        ctr_lead_name: null,
        Signature: null,
        hasSigned : null,
        ctr_leaders: []
    };

    $scope.grp_lead = {
        grp_lead_pk: null,
        grp_lead_name: null,
        Signature: null,
        hasSigned: null
    };

    $scope.familyMember = {
        membertype: 'SUA',
        membername: '',
        hasSigned: false,
        Signature: null
    }

    $scope.witnesses = {
        hasSigned: false,
        witness_name: '',
        witness_pk: null
    };
    
    $scope.loadCodes = function(){
        myDB.execute("SELECT * FROM T_CODE",function(res){
            $scope.houseIncomes = [];
            $scope.memberTypes = [];
            $scope.homeOwnershipType = [];
            $scope.joblist = [];
            $.each(res,function(i,code){
                if(code.CODE_TYPE_PK == 20){ //Income Codes
                    var incomeSouce = {
                        source:code.CODE_NAME,
                        inctype:code.CODE_DESC,
                        fixed:0,
                        variable:0,
                        details:0,
                        detaildesc:null
                    };

                    $scope.houseIncomes.push(incomeSouce);
                } else if (code.CODE_TYPE_PK == 23){ //Member Types
                    var memberType = {
                        name:code.CODE_NAME,
                        value:code.CODE_VALUE, 
                    };

                    $scope.memberTypes.push(memberType);
                } else if (code.CODE_TYPE_PK == 22){ //Home Ownership
                    var ownershipType = {
                        name: code.CODE_NAME,
                        value:code.CODE_VALUE
                    }
                    $scope.homeOwnershipType.push(ownershipType);
                } else if (code.CODE_TYPE_PK == 24) {
                    var Job = {
                        name: code.CODE_NAME,
                        value: code.CODE_VALUE
                    }
                    $scope.joblist.push(Job);
                }
            })
            $scope.loadPPIQuestions()
        })
    }

    $scope.loadCodes();
    $scope.selectCodes = {
        process : function(results){
            results.forEach(function(value,index){
                $scope.selectCodes[value.CODE_TYPE_PK] = $scope.selectCodes[value.CODE_TYPE_PK] || [];
                var keypair = {'name': value.CODE_NAME,'value': value.CODE_VALUE, 'desc':value.CODE_DESC};
                $scope.selectCodes[value.CODE_TYPE_PK].push(keypair); 
            });
            $scope.$apply();
            refreshall('.famcode');
        },
    };
    this.setCodes = function(results){
        $scope.selectCodes.process(results);
    };
    var t = this;
    myDB.T_CODE.get("(CODE_TYPE_PK>=1 AND CODE_TYPE_PK<=3) OR CODE_TYPE_PK=6 OR CODE_TYPE_PK=21 OR (CODE_TYPE_PK>=9 AND CODE_TYPE_PK<=16)",function(results){
        console.log(results);
        t.setCodes(results);
    });

    $scope.ppiQuestions = [];
    $scope.loadPPIQuestions = function() {
        myDB.execute("SELECT * FROM T_PPI_QUESTION ORDER BY PPIQ_PK", function(questions) {
            console.log(questions)
            var ps = [];
            questions.forEach(function(qtn) {
                ps.push($scope.loadOptionsForQuestion(qtn));
            });

            Promise.all(ps).then(function(qtns) {
                qtns.forEach(function(qtn) {
                    $scope.ppiQuestions.push(qtn);
                });
                $scope.$apply();
            })

        })
    }

    $scope.isQtnType = function(qtn, type) {
        var canShow = false;
        if (type == 'text') {
            canShow =  (qtn.PPIQ_NEED_ANSWER == 'Y' && qtn.PPIQ_CODE_TYPE_PK === 'null');
        } if (type == 'select') {
            canShow =  (qtn.PPIQ_NEED_ANSWER == 'Y' && qtn.PPIQ_CODE_TYPE_PK !== 'null');
        }
        return canShow;
    }

    $scope.loadOptionsForQuestion = function(qtn) {
        qtn.answer = null;
        var p = new Promise(function(resp,rej) {
            myDB.execute("SELECT * FROM T_CODE WHERE CODE_TYPE_PK=" + qtn.PPIQ_CODE_TYPE_PK, function(res) {
                if(res.length > 0) {
                    qtn.options = res;
                    qtn.answer = null;
                }
                console.log(res.length);
                //$scope.ppiQuestions.push(qtn); 
                resp(qtn);
            })
        })  
        return p;
    }

    $scope.getTotalPPIScore = function(){
        var score = 0;
        $scope.ppiQuestions.forEach(function(qtn) {
            if(qtn.answer != null && qtn.PPIQ_CODE_TYPE_PK != 'null') {
                score += parseInt(qtn.answer.CODE_VALUE);
            }
        });
        return score;
    }

    $scope.showSignscreen = function(idx, t){

        var type = typeof t !== 'undefined' ? t : null; 
        if(!$scope.showSign){
            $scope.showSign = true;
            setTimeout(function(){
                $scope.signingclientIndex = null;
                $scope.signinguser = type;
                $scope.loadSignaturePad(null, type, null);
                $scope.signinguser = type;

            },100);

        } else {
            $scope.showSign = false;
        }
    }

    var $sigdiv = $("#ppisignature")
    var canvas = $('#the-ppicanvas')[0];
    var context = canvas.getContext("2d");

    var imht = 100;
    var imwt = 200;

    var img2 = "";

    $scope.loadSignaturePad = function(client, type, idx){

        client = typeof client !== 'undefined' ? client : null;

        $('#ppisigbtn').fadeIn();

        if($('canvas.jSignature').length == 0){
            $sigdiv.jSignature({
                width:'90%',
                height:250,
                lineWidth:4,
                'border-bottom':'2px solid black',
                'background-color': '#DDD',
                'decor-color': 'transparent',
            });
        }

        $('#ppisignature').jSignature('clear');
        $('.displayarea').html('');

        context.clearRect(0, 0, canvas.width, canvas.height);

        $('.jSignature').css('background-color','#DDD');
        $('.jSignature').css('border-bottom','2px solid black');
        $('.jSignature').css('margin-bottom','15px');
        
        var signingMsg = ''; 
        if(type == 'client'){
            signingMsg = $scope.applicantdata.fullname+' '+ i18n.t("messages.SignHere");
        } else if (type == 'officer') {
            signingMsg = $scope.user.userName+' '+ i18n.t("messages.SignHere");
        } else if (type == 'mgr'){
            signingMsg = $scope.MGR.mgrname+' '+ i18n.t("messages.SignHere");
        } else if (type == 'ctr_lead'){
            signingMsg = $scope.ctr_lead.ctr_lead_name+' '+ i18n.t("messages.SignHere");
        } else if (type == 'grp_lead'){
            signingMsg = $scope.grp_lead.grp_lead_name+' '+ i18n.t("messages.SignHere");
        } else if (type == 'witness') {
            signingMsg = $scope.witnesses.witness_name+' '+ i18n.t("messages.SignHere");
        } else if (type == 'family') {
            signingMsg = $scope.familyMember.membername+' '+ i18n.t("messages.SignHere");
        }

        $('#ppisigningperson').html('<h3><p>' + signingMsg + '</p></h3>');

        $('html, body').animate({
            scrollTop: $("#the-canvas").offset().top - 30
        }, 500);

    } 

    $scope.clearSigPad = function(){
        if($scope.showSign){
            $('#ppisignature').jSignature('clear');
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
            img2.src = dsrc;
        } else if (type == 'mgr'){
            var dsrc = atob($scope.MGR.Signature);

            var img2 = new Image();
            img2.onload = (function(){
                var canv = $('#the-canvas-mgr')[0];
                var cont = canv.getContext("2d");
                cont.drawImage(img2, 0, 0, 200, 100);
            });
            img2.src = dsrc;
        } else if (type == 'client'){
            var dsrc = atob(c_sig);
            var img2 = new Image();
            img2.onload = (function(){
                var canv = $('#the-canvas-client')[0];
                var cont = canv.getContext("2d");
                cont.drawImage(img2,0,0,200,100);
            });
            img2.src = dsrc;
        } else if (type == 'ctr_lead'){
            var dsrc = atob($scope.ctr_lead.Signature);

            var img2 = new Image();
            img2.onload = (function(){
                var canv = $('#the-canvas-'+$scope.ctr_lead.ctr_lead_pk)[0];
                var cont = canv.getContext("2d");
                cont.drawImage(img2,0,0,300,150);
            });
            img2.src = dsrc;
        } else if (type == 'grp_lead'){
            var dsrc = atob($scope.grp_lead.Signature);

            var img2 = new Image();
            img2.onload = (function(){
                var canv = $('#the-canvas-'+$scope.grp_lead.grp_lead_pk)[0];
                var cont = canv.getContext("2d");
                cont.drawImage(img2,0,0,300,150);
            });
            img2.src = dsrc;
        } else if (type == 'centerleader' || type == 'groupleader' || type == 'witness') {
            myDB.execute("SELECT CLT_SIGNATURE FROM T_CLIENT WHERE CLT_PK=" + pk, function(res) {
                if(res) {
                    if(res[0]) {
                        var dsrc = atob(res[0].CLT_SIGNATURE);

                        var img2 = new Image();
                        img2.onload = (function(){
                            if(type == 'centerleader') var canv = $('#the-canvas-ctr_lead')[0];
                            if(type == 'groupleader') var canv = $('#the-canvas-grp_lead')[0];
                            if(type == 'witness') {
                                var canv = $('#the-canvas-'+pk)[0];
                            }
                            
                            var cont = canv.getContext("2d");
                            cont.clearRect(0, 0, 300, 150);
                            cont.drawImage(img2,0,0,300,150);

                        });
                        img2.src = dsrc;
                    }
                }
            })
        } else if (type == 'family'){
            var dsrc = atob(c_sig);
            var img2 = new Image();
            img2.onload = (function(){
                var canv = $('#the-canvas-family')[0];
                var cont = canv.getContext("2d");
                cont.drawImage(img2,0,0,200,100);
            });
            img2.src = dsrc;
        }
    }

    $scope.importImg = function(){

        var data = $sigdiv.jSignature('getData', 'image');

        var dsrc = 'data:' + data[0] + ',' + data[1];
        var png = $sigdiv.jSignature('getData','base30');

        var blob = btoa(dsrc);
        var ratio = canvas.height / 200;

        ht = canvas.height / ratio;

        var img2 = new Image();
        img2.onload = (function(){
            var scrollTo = '#client-signatures'; 
            if($scope.signinguser == 'client'){
                var client = $scope.client;
                var canv = $('#the-canvas-client')[0];
                scrollTo = '#the-canvas-client';
                $scope.$apply(function(){
                    $scope.applicantdata.hasSigned = true;
                    $scope.applicantdata.CLT_SIGNATURE = blob;
                })
            } else if($scope.signinguser == 'officer'){
                scrollTo = '#the-canvas-officer';
                var canv = $('#the-canvas-officer')[0];
                $scope.$apply(function(){
                    $scope.user.hasSigned = true;
                    $scope.user.Signature = blob;
                });

                var cmd1 = "UPDATE T_USER SET USER_SIGNATURE ='"+blob+"' , USER_HAVE_SIGNATURE='Y' WHERE USER_PK = "+$scope.user.userPK;

                myDB.execute(cmd1, function(res){

                });

            } else if($scope.signinguser === 'mgr'){
                scrollTo = '#the-canvas-mgr';
                var canv = $('#the-canvas-mgr')[0];
                $scope.$apply(function(){
                    $scope.MGR.hasSigned = true;
                    $scope.MGR.Signature = blob;
                });
                var cmd1 = "UPDATE T_USER SET USER_SIGNATURE ='"+blob+"' , USER_HAVE_SIGNATURE='Y' WHERE USER_PK = "+$scope.MGR.mgrpk;

                myDB.execute(cmd1, function(res){

                    sessionStorage.setItem("MGR_HAVE_SIG","Y");
                    sessionStorage.setItem("MGR_SIG",blob);

                });
            } else if ($scope.signinguser === 'ctr_lead'){
                scrollTo = '#the-canvas-ctr_lead';
                var canv = $('#the-canvas-ctr_lead')[0];
                $scope.$apply(function(){
                    $scope.ctr_lead.hasSigned = true;
                    $scope.ctr_lead.Signature = blob;
                })
            } else if ($scope.signinguser === 'grp_lead'){
                scrollTo = '#the-canvas-grp_lead';
                var canv = $('#the-canvas-grp_lead')[0];
                $scope.$apply(function(){
                    $scope.grp_lead.hasSigned = true;
                    $scope.grp_lead.Signature = blob;
                })
            } else if ($scope.signinguser === 'witness') { 
                scrollTo = '#the-canvas-'+$scope.witnesses.witness_pk;
                var canv = $('#the-canvas-'+$scope.witnesses.witness_pk)[0];
                $scope.$apply(function(){
                    $scope.witnesses.hasSigned = true;
                    $scope.witnesses.Signature = blob;
                })
            } else if ($scope.signinguser === 'family') { 
                scrollTo = '#the-canvas-family';
                var canv = $('#the-canvas-family')[0];
                $scope.$apply(function(){
                    $scope.familyMember.hasSigned = true;
                    $scope.familyMember.Signature = blob;
                });
            }
       
            if($scope.signingclientIndex != null || $scope.signinguser == 'grp_lead' || $scope.signinguser == 'ctr_lead' || $scope.signinguser.indexOf("witness") > -1){

                var SIG_CLT_PK = "";
                if($scope.signingclientIndex != null){
                    SIG_CLT_PK = $scope.applicantdata.CLT_PK;
                } else if ($scope.signinguser == 'grp_lead'){
                    SIG_CLT_PK = $scope.grp_lead.grp_lead_pk;
                } else if ($scope.signinguser == 'ctr_lead') {
                    SIG_CLT_PK = $scope.ctr_lead.ctr_lead_pk;
                } else if ($scope.signinguser.indexOf("witness") > -1) {
                    var idx = $scope.signinguser.split("witness")[1];
                    SIG_CLT_PK = $scope.witnesses.witness_pk;
                }

                var cmd1 = "UPDATE T_CLIENT SET CLT_SIGNATURE ='"+blob+"' WHERE CLT_PK = "+SIG_CLT_PK;
                myDB.execute(cmd1, function(res){
                    if($scope.signingclientIndex !== null) $scope.signingclientIndex = null;
                });
            }

            $scope.clearSigPad();
            var cont = canv.getContext("2d");
            cont.drawImage(img2, 0, 0, 300, 150);
            $scope.showSign = false;

            $('html, body').animate({
                scrollTop: $(scrollTo).offset().top - 50
            }, 500);

            $scope.$apply();
        });

        img2.src = dsrc;
    }

    $scope.checkPPI = function() {
        var allSigned = true;
        var nonMandatoryNotSigned = '';
        var mandatoryNotSigned = '';
        if( !$scope.applicantdata.hasSigned) { //check client
            allSigned = false; 
            mandatoryNotSigned = i18n.t("messages.PPIClientNoSign");
        } else if (! $scope.grp_lead.hasSigned) { // check group leader
            allSigned = false;
            mandatoryNotSigned = i18n.t("messages.PPIGroupLeadNoSign");
        } else if (! $scope.user.hasSigned) { // check FO signature
            allSigned = false;
            mandatoryNotSigned = i18n.t("messages.PPIFONoSign");
        } 

        if( !$scope.familyMember.hasSigned) {
            nonMandatoryNotSigned += i18n.t("messages.PPIFamilyNoSign");
        }

        if( !$scope.ctr_lead.hasSigned) {
            if(nonMandatoryNotSigned !== '') nonMandatoryNotSigned += " " +i18n.t("messages.And")
            nonMandatoryNotSigned += " "+i18n.t("messages.PPICenterLeadNoSign");
        }
        
        if (! $scope.witnesses.hasSigned) { //check witness
            if(nonMandatoryNotSigned !== '') nonMandatoryNotSigned += " " +i18n.t("messages.And")
            nonMandatoryNotSigned += " "+i18n.t("messages.PPIWitnessNoSign");
        } 
        var allAnswered = true;
        $.each($scope.ppiQuestions, function(q, qtn){
            var answer = '';
            var score = '';
            if($scope.isQtnType(qtn, 'text')) {
                answer = qtn.answer;
                score = qtn.score;
            } else {
                if(qtn.answer != null) {
                    answer = qtn.answer.CODE_NAME;
                    score  = qtn.answer.CODE_VALUE;
                }
            }
            if(qtn.PPIQ_NEED_ANSWER !== 'D') {
                if(answer == '' || answer == undefined) {
                    allAnswered = false;
                }
            }
        });

        if(!allAnswered) {
            swal({
                title: i18n.t("messages.PleaseCompleteAllQuestions"), 
                type: "error",
                confirmButtonColor: "#80C6C7",
                confirmButtonText: "Ok", 
            });
            return false;
        }

        if(nonMandatoryNotSigned !== '') {
            swal({ 
                title: i18n.t("messages.PendingSignatures"),
                text: nonMandatoryNotSigned, 
                type: "info",
                showCancelButton: true,
                confirmButtonColor: '#0091EA',
                cancelButtonColor: '#EF5350',
                confirmButtonText: i18n.t("buttons.Proceed")
            }).then((result) => {
                if (result.value) {
                    $scope.savePPI();
                }
            })  
        } else {
            if(allSigned) {
                $scope.savePPI();
            } else {
                swal({
                    title: i18n.t("messages.PendingSignatures"),
                    text: mandatoryNotSigned,
                    type: "error",
                    confirmButtonColor: "#80C6C7",
                    confirmButtonText: "Ok", 
                });
            }
        }
    }

    $scope.savePPI = function() {
        var centerleader_pk = null;
        if( $scope.ctr_lead.hasSigned) {
            centerleader_pk = $scope.ctr_lead.ctr_lead_pk;
        }
        var familySignature = '';
        if( $scope.familyMember.hasSigned) {
            familySignature = $scope.familyMember.Signature;
        }
        var query = "INSERT INTO T_PPI_FORM VALUES (null, "+$scope.maxPPIFormPk+", "+$scope.applicantdata.CLT_PK+", null, "+ $scope.getTotalPPIScore()+", "+$scope.applicantdata.CLT_PK+", "+ $scope.user.userPK+", "+$scope.witnesses.witness_pk+", null, "+centerleader_pk+", " +$scope.grp_lead.grp_lead_pk+ ", '"+$scope.familyMember.membertype+"', '"+$scope.familyMember.membername+"', '"+familySignature+"', "+$scope.user.userPK+", '"+moment().format('DD/MM/YYYY HH:mm:ss')+"', "+$scope.user.userPK+", '"+moment().format('DD/MM/YYYY HH:mm:ss')+"', 2)";
        console.log(query)
        myDB.execute(query, function(save) {
            if(save) {
                console.log(save);
                var ppiQueries = [];
                
                $.each($scope.ppiQuestions, function(q, qtn){
                    var answer = '';
                    var score = '';
                    if(qtn.PPIQ_NEED_ANSWER !== 'D') {
                        if($scope.isQtnType(qtn, 'text')) {
                            answer = qtn.answer;
                            score = qtn.score;
                        } else {
                            answer = qtn.answer.CODE_NAME;
                            score  = qtn.answer.CODE_VALUE;
                        }
                        var qry = "INSERT INTO T_PPI_ANSWER VALUES (null, "+$scope.maxPPIAnsPk+", "+$scope.maxPPIFormPk+", "+ qtn.PPIQ_PK+", '"+ answer + "', '"+ score + "', "+$scope.user.userPK+", '"+moment().format('DD/MM/YYYY HH:mm:ss')+"', "+$scope.user.userPK+", '"+moment().format('DD/MM/YYYY HH:mm:ss')+"' )";
                        console.log(qry);
                        ppiQueries.push(qry);
                        $scope.maxPPIAnsPk  = parseInt($scope.maxPPIAnsPk) + 1;
                    }
                    
                });
                myDB.dbShell.transaction(function(tx){ 
                    for(e in ppiQueries){ tx.executeSql(ppiQueries[e]);} 
                }, function(err){ 
                    swal({
                        title: i18n.t("messages.Alert"),
                        text: i18n.t("messages.PPIFail"),
                        type: "error",
                        confirmButtonColor: "#80C6C7",
                        confirmButtonText: "Ok", 
                    });
                    return false;
                }, function(suc){ 
                    swal({
                        title: i18n.t("messages.PPISuccess"),
                        text: '',
                        type: "success",
                    });
                    setTimeout(() => { 
                        sessionStorage.setItem("GOTO","EVAL");
                        window.location.href = "client.html"; 
                    }, 2000);
                    // $scope.isPPIComplete = true;
                    // $scope.$apply();
                    // refreshall('.ppiqtns');
                    // $scope.isitDone();
                });
            }
        })
    }

    $scope.isitDone = function() {

        var ttl = 0;
        for(var key in $scope.available) ttl++;

        if(ttl > 0 || !$scope.isPPIComplete) {
            $('.addclientdone').hide();
        } else {
            $('.addclientdone').fadeIn();
        }
    };
    
    $scope.updateWitness = function(idx) {
        $scope.witnesses.witness_pk = $scope.selectedWitness.CLT_PK;
        $scope.witnesses.witness_name = $scope.selectedWitness.CLT_FULL_NAME;
        setTimeout(() => {
            refreshall('.witness');
        }, 1);
    }

    $scope.updateCtrLeader = function(){

        $scope.ctr_lead.ctr_lead_pk = $scope.selectedCtrLeader.CLT_PK;
        $scope.ctr_lead.ctr_lead_name = $scope.selectedCtrLeader.CLT_FULL_NAME;

    };

    $scope.b64toBlob = function (b64Data, contentType, sliceSize) {
        contentType = contentType || '';
        sliceSize = sliceSize || 512;

        var byteCharacters = atob(b64Data);
        var byteArrays = [];

        for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            var slice = byteCharacters.slice(offset, offset + sliceSize);

            var byteNumbers = new Array(slice.length);
            for (var i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            var byteArray = new Uint8Array(byteNumbers);

            byteArrays.push(byteArray);
        }

        var blob = new Blob(byteArrays, {type: contentType});
        return blob;
    }

    $scope.loadImage = function(src, onload) {
        // http://www.thefutureoftheweb.com/blog/image-onload-isnt-being-called
        var img = new Image();
        img.onload = onload;
        img.src = src;
        return img;
    }

    $scope.getUserSignature = function(){ 
        myDB.execute("SELECT USER_SIGNATURE, USER_HAVE_SIGNATURE FROM T_USER WHERE USER_PK='"+$scope.user.userPK+"'" ,function(results){

            $scope.user.Signature = (results[0].USER_SIGNATURE === null ? '' : results[0].USER_SIGNATURE);
            console.log(results[0].USER_HAVE_SIGNATURE);
            if(results[0].USER_HAVE_SIGNATURE == 'Y') {
                $scope.user.hasSigned = true;
                $scope.showSignature('officer');
            }
        });
    } 

    $scope.loadsign = function(){
        setTimeout(function(){
            $scope.loadSignaturePad();
        },500);
    } 

    $scope.getMaxPPIFormPk = function(){
        myDB.execute("SELECT MAX(PPIF_PK) as maxppi FROM T_PPI_FORM ", function(res) {
            var maxppi = res[0].maxppi == null ? 0 : res[0].maxppi;
            $scope.maxPPIFormPk = parseInt(maxppi) + 1;
            console.log("$scope.maxPPIFormPk " + $scope.maxPPIFormPk);
        });
    }
    $scope.getMaxPPIAnsPk = function(){
        myDB.execute("SELECT MAX(PPIA_PK) as maxppi FROM T_PPI_ANSWER ", function(res) {
            var maxppi = res[0].maxppi == null ? 0 : res[0].maxppi;
            $scope.maxPPIAnsPk = parseInt(maxppi) + 1;
            console.log("$scope.maxPPIAnsPk " + $scope.maxPPIAnsPk);
        });
    }

    $scope.loadClient = function() {
        console.log('loading client');
        myDB.execute("SELECT CLT_PK, CLT_FULL_NAME, CLT_SIGNATURE, CLT_VILLAGE, CLT_CENTER_ID, CLT_GROUP_ID, CLT_IS_GROUP_LEADER FROM T_CLIENT WHERE CLT_PK =" + sessionStorage.getItem("PPI_CLIENT_ID"), function(res) {
            console.log(res);
            $scope.client = res[0];
            $scope.applicantdata.CLT_PK = res[0].CLT_PK;
            $scope.applicantdata.fullname = res[0].CLT_FULL_NAME;
            $scope.applicantdata.CLT_SIGNATURE = res[0].CLT_SIGNATURE;
            if($scope.applicantdata.CLT_SIGNATURE != null ) {
                $scope.applicantdata.hasSigned = true;
            }

            $scope.loadGroupmembers();
            $scope.loadCenterLeaders();
        })
    }

    $scope.loadGroupmembers = function() { 
        var query = "SELECT CLT_PK, CLT_FULL_NAME, CLT_SIGNATURE, CLT_VILLAGE, CLT_CENTER_ID, CLT_GROUP_ID, CLT_IS_GROUP_LEADER FROM T_CLIENT WHERE ";
        query += " CLT_VILLAGE = " + $scope.client.CLT_VILLAGE;
        query += " AND CLT_CENTER_ID = '" + $scope.client.CLT_CENTER_ID + "'";
        query += " AND CLT_GROUP_ID = '" +$scope.client.CLT_GROUP_ID + "'";
        myDB.execute(query, function(res) {
            console.log(res);
            res.forEach(function(member) {
                $scope.groupmembers.push(member);
                if(member.CLT_IS_GROUP_LEADER == 'Y') {
                    $scope.grp_lead.grp_lead_pk = member.CLT_PK;
                    $scope.grp_lead.grp_lead_name = member.CLT_FULL_NAME;
                    $scope.grp_lead.hasSigned = false; 
                }
            });
            $scope.$apply();
        });
    }

    $scope.loadCenterLeaders = function() {
        var query = "SELECT CLT_PK, CLT_FULL_NAME, CLT_SIGNATURE, CLT_VILLAGE, CLT_CENTER_ID, CLT_GROUP_ID, CLT_IS_GROUP_LEADER FROM T_CLIENT WHERE ";
        query += " CLT_VILLAGE = " + $scope.client.CLT_VILLAGE;
        query += " AND CLT_CENTER_ID = " + $scope.client.CLT_CENTER_ID;
        query += " AND CLT_IS_GROUP_LEADER = 'Y' ";
        myDB.execute(query, function(res) {
            res.forEach(function(member) {
                $scope.ctr_lead.ctr_leaders.push(member);
            });
            $scope.$apply();
        })
    }

    $scope.loadClient(); 

    setTimeout(() => {
        $scope.getMaxPPIFormPk();
        $scope.getMaxPPIAnsPk();
    }, 1);
});
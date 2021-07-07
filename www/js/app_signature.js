//$('#signaturePops').load('signature.html').trigger("create"); // NEED TO INCLUDE THIS DIV
//===============================================================INCLUDE THIS ONE PARENT PAGE
//POPUP-SIGNATURE
// $scope.emitLoadSignature = function(signee, type){
//     console.log('emitting');
//     $rootScope.$emit('loadSignature', signee, type);
// }
// $rootScope.$on('signatureDone', function(event, data) {
//     console.log('signature done');
//     console.log(data);
//     $scope.udpateImg(data.signee, data.type, data.dsrc);
// });

// $scope.udpateImg = function(signee, type, dsrc){

//     console.log('updating img');
//     console.log(signee);
//     console.log(type);
//     console.log(dsrc);

//     var data = $sigdiv.jSignature('getData', 'image'); 

//     var blob = btoa(dsrc);
//     var ratio = canvas.height / 200;

//     ht = canvas.height / ratio;

//     var img2 = new Image();
//     img2.onload = (function(){
//         //console.log($scope.signingclientIndex);
//         if(type == null || type == 'client'){
//             var client = $scope.client;
//             //console.log(client);
//             var canv = $('#the-canvas-'+client.CLT_PK)[0];
//             $scope.$apply(function(){
//                 client.hasSigned = true;
//                 client.CLT_SIGNATURE = blob;
//             })

//             $scope.signingclientIndex = null;
//         } else if(type === 'officer'){
//             var canv = $('#the-canvas-officer')[0];
//             $scope.$apply(function(){
//                 $scope.user.hasSigned = true;
//                 $scope.user.Signature = blob;
//             });

//             var cmd1 = "UPDATE T_USER SET USER_SIGNATURE ='"+blob+"' , USER_HAVE_SIGNATURE='Y' WHERE USER_PK = "+$scope.user.userPK;

//             myDB.execute(cmd1, function(res){
//             });

//         } else if(type === 'mgr'){
//             var canv = $('#the-canvas-mgr')[0];
//             $scope.$apply(function(){
//                 $scope.MGR.hasSigned = true;
//                 $scope.MGR.Signature = blob;
//             });
//             var cmd1 = "UPDATE T_USER SET USER_SIGNATURE ='"+blob+"' , USER_HAVE_SIGNATURE='Y' WHERE USER_PK = "+$scope.MGR.mgrpk;

//             myDB.execute(cmd1, function(res){

//                 sessionStorage.setItem("MGR_HAVE_SIG","Y");
//                 sessionStorage.setItem("MGR_SIG",blob);

//             });
//         } else if (type === 'ctr_lead'){
//             var canv = $('#the-canvas-ctr_lead')[0];
//             $scope.$apply(function(){
//                 $scope.ctr_lead.hasSigned = true;
//                 $scope.ctr_lead.Signature = blob;
//             })
//         }

//         $scope.clearSigPad();
//         var cont = canv.getContext("2d");
//         cont.drawImage(img2, 0, 0, 300, 150);
//         $scope.showSign = false;
//         $scope.$apply();
//     });

//     img2.src = dsrc;
// }
//==================================================================================================
myApp.controller("signCtrl",function($scope, $filter, $rootScope){
    console.log('signCtrl loaded');
    $scope.signee = null;
    $scope.type = null;
    $scope.showCanvas = false;
    
    var $sigdiv = $("#popup-signature")
    var canvas = $('#popup-the-canvas')[0];
    var context = canvas.getContext("2d");

    
    $scope.signHereTxt = i18n.t("SIGNATURES.SignHere");
    console.log($scope.signHereTxt);

    var imht = 100;
    var imwt = 200;

    var img2 = "";
    
    $rootScope.$on('loadSignature', function(event, signee, type) {
        console.log(signee);
        console.log(type);
        $scope.assignData(signee, type);
        $scope.loadSignaturePad(signee, type);
    });

    $scope.assignData = function(signee, type){
        $scope.signee = signee;
        $scope.type = type;
    }

    $scope.loadSignaturePad = function(signee, type){
        console.log('loading signature'); 

        $('#popup-sigbtn').fadeIn();

        if($('canvas.jSignature').length == 0){
            $sigdiv.jSignature({
                width:'90%',
                height:250,
                lineWidth:4,
                'border-bottom':'2px solid black',
                'background': '#EEEEEE',
                'decor-color': 'transparent',
            });
        }

        $('#popup-signature').jSignature('clear');
        $('.popup-displayarea').html('');

        context.clearRect(0, 0, canvas.width, canvas.height);

        $('.jSignature').css('background','#EEE');
        $('.jSignature').css('border-bottom','2px solid black');
        $('.jSignature').css('margin-bottom','15px');

 
        if(type == null || type == 'client'){
            $('#popup-signingperson').html('<h3><p>'+signee.CLT_FULL_NAME+' ' + $scope.signHereTxt + '</p></h3>');
        } else if (type == 'officer') {
            $('#popup-signingperson').html('<h3><p>'+signee.userName+' ' + $scope.signHereTxt + '</p></h3>');
        } else if (type == 'mgr'){
            $('#popup-signingperson').html('<h3><p>'+signee.mgrname+' ' + $scope.signHereTxt + '</p></h3>');
        } else if (type == 'grp_lead') {
            $('#popup-signingperson').html('<h3><p>'+signee.grp_lead_name+' ' + $scope.signHereTxt + '</p></h3>');
        } else if (type == 'ctr_lead'){
            $('#popup-signingperson').html('<h3><p>'+signee.ctr_lead_name+' ' + $scope.signHereTxt + '</p></h3>');
        } else if (type == 'family'){
            $('#popup-signingperson').html('<h3><p>'+signee.membername+' ' + $scope.signHereTxt + '</p></h3>');
        } else if (type == 'witness') {
            $('#popup-signingperson').html('<h3><p>'+signee.witness_name+' ' + $scope.signHereTxt + '</p></h3>');
        } else if (type == 'newclient') {
            $('#popup-signingperson').html('<h3><p>'+signee.fullname+' ' + $scope.signHereTxt + '</p></h3>');
        }
    }

    $scope.clearSignature = function(ind, type){

        ind = typeof ind !== 'undefined' ? ind : null;

        $scope.clearSigPad();
        var cont = canv.getContext("2d");
        cont.clearRect(0, 0, 200, 100);
    }

    $scope.clearSigPad = function(){
        $('#popup-signature').jSignature('clear');
        context.clearRect(0, 0, canvas.width, canvas.height);
    }

    $scope.showSignature = function(type,pk,c_sig){
        var dsrc = atob(c_sig);

        var img2 = new Image();
        img2.onload = (function(){
            var canv = $('#popup-the-canvas')[0];
            var cont = canv.getContext("2d");
            cont.drawImage(img2,0,0,200,100);
        });

        img2.src = dsrc;
    }

    $scope.importImg = function(){
        
        var data = $sigdiv.jSignature('getData', 'image');

        var dsrc = 'data:' + data[0] + ',' + data[1];
        const dataToSend = {
            signee: $scope.signee, 
            type: $scope.type, 
            dsrc: dsrc
        };

        $rootScope.$emit('signatureDone', dataToSend);
        
        $scope.signee = null;
        $scope.type = null;
        $("#popupSign").popup("close");
    }


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
        var img = new Image();
        img.onload = onload;
        img.src = src;
        return img;
    }

});
//end of controller

//const serverURL = 'http://192.168.88.88:5245/Prodigy/CommonBuildJSON';
const serverURL = 'http://192.168.88.201:8080/MBK/CommonBuildJSON'
function init(){
 
    initTemplate.load();
    

}
$(document).ready(function(){ 
    initTemplate.load();
    const sync = new Sync();

    $('#syncbutton').on('click', function(){ 
        fologin()
    });

    function fologin(){
        var userid = $('#userid').val();
        var password = $('#password').val();

        if(userid == '' || password == ''){
            swal({
                type: 'error',
                title: 'Oops...',
                text: i18n.t("messages.MissingCreds"), 
            })
            return false;
        }

        var obj = [userid, password ];
        console.log(obj);
        $.ajax({
			url: serverURL,
			cache: false,
			type: "POST",
			data: "strMode=FoLogin&cred="+JSON.stringify(obj),
			crossDomain: true,
			processData: false,
			success: function(result){ 
                console.log(result)
				if(result=="Success"){ 
                    swal(i18n.t("messages.loginsuccess"));  
                    localStorage.setItem("LOGIN_USERNAME",userid); 
				    window.location.href = "mgrlogin.html";
				} else if(result == "FO cannot Pull data again."){
                    swal({
                        type: 'error',
                        title: 'Oops...',
                        text: i18n.t("messages.FOCannotPullAgain"), 
                    })
                } else { 
                    swal({
                        type: 'error',
                        title: 'Oops...',
                        text: i18n.t("messages.CredsMismatch"), 
                    })
                }
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
			}
		});
    }
});
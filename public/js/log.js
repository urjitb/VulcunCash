if (typeof $.cookie('token') === 'undefined'){
    //no cookie
   } else {
    window.location.replace("/dashboard");
   }
$("#submit2").click(function () {

    $.post("/login",
        {
            email: $('#loginName').val(),
            password: $('#loginPass').val()
        },
        function (data, status) {
            //https://developer.mozilla.org/docs/Web/HTTP/Headers/Set-Cookie/SameSite
            document.cookie = "token="+data.token +"; SameSite=Strict; Secure";
            
    
            window.location.replace("/dashboard");
        }).fail((data)=>{
                $("#header-content").after("<br><div class=\"alert alert-danger\">The username/email and password combination does not exist.</div>")
                    console.log(JSON.stringify(data))
        });
});
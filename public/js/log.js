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
        });
});
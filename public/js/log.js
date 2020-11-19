if (typeof $.cookie('token') === 'undefined'){
    //no cookie
   } else {
    window.location.replace("/dashboard");
   }
$("#submit").click(function () {
    $('#submit').html('<i class="fa fa-refresh fa-lg fa-spin" style="color: #ffffff;"></i>').prop('disabled', true);
   
    $.post("/login",
        {
            email: $('#loginName').val(),
            password: $('#loginPass').val()
        },
        function (data, status) {
            //https://developer.mozilla.org/docs/Web/HTTP/Headers/Set-Cookie/SameSite
            //createCookie("token",data.token,2)
            
            window.location.replace("/dashboard");
        }).fail((data)=>{
            $('#submit').html('Login').prop('disabled', false);
                $("#header-content").html("<br><div class=\"notification is-danger\">The email and password combination does not exist.</div>")
                    console.log(JSON.stringify(data))
        });
});
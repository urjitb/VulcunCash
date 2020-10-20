$("#submit").click(function () {

    $.post("/register",
        {
            username: $("[name='regu']").val(),
            password: $("[name='regp']").val(),
            email: $("[name='rege']").val()
        },
        function (data, status) {

            $('#logged-in').append("<b>" + JSON.stringify(data) + "</b></br>")
        });
});
$("#submit2").click(function () {

    $.post("/login",
        {
            email: $('#loginName').val(),
            password: $('#loginPass').val()
        },
        function (data, status) {
            //https://developer.mozilla.org/docs/Web/HTTP/Headers/Set-Cookie/SameSite
            document.cookie = "token="+data.token +"; SameSite=Strict; Secure";
            
    
            $('#result').append("<b>Logged user: " + JSON.stringify(data) + "</b></br>")
        });
});

$("#delete").click(function () {

    $.post("/delete",
        {
            name: $('#delname').val(),

        },
        function (data, status) {

            $('#result').append("<b>" + JSON.stringify(data) + "</b></br>")
        });
}); 
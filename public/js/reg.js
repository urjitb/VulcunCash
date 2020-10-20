if (typeof $.cookie('token') === 'undefined'){
    //no cookie
   } else {
    window.location.replace("/dashboard");
   }
$("#submit").click(function () {

    $.post("/register",
        {
            username: $("[name='regu']").val(),
            password: $("[name='regp']").val(),
            email: $("[name='rege']").val()
        },
        function (data, status) {

            window.location.replace("/dashboard");
        });
});
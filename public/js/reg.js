if (typeof $.cookie('token') === 'undefined'){
    //no cookie
   } else {
    window.location.replace("/dashboard");
   }
$("#submit").click(function () {

    $.post("/register",
        {
            username: $("[name='username']").val(),
            password: $("[name='password']").val(),
            email: $("[name='email']").val()
        },
        function (data, status) {

            window.location.replace("/dashboard");
        }).done(function() {
            alert( "second success" );
          })
          .fail(function(data) {
            data.responseJSON.errors.forEach(element => {
                $('#'+element.param).after("<br><div class=\"alert alert-danger\">"+element.msg+"</div>")
            });
           
          });
});
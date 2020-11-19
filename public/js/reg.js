if (typeof $.cookie('token') === 'undefined'){
    //no cookie
   } else {
    window.location.replace("/dashboard");
   }
$("#submit").click(function () {
    $('#submit').html('<i class="fa fa-refresh fa-lg fa-spin" style="color: #ffffff;"></i>').prop('disabled', true);
   
    $.post("/register",
        {   
            email: $("#email").val(),
            password: $("#password").val(),
            fname: $("#fname").val(),
            lname: $("#lname").val(),
            country: $("#country").val(),
            state: $("#state").val(),
            wfrom: $("#wfrom").val(),
            wexp: $("#wexp").val(),
            prefpayment: $("#prefpayment").val(),
        },
        function (data, status) {
            document.cookie = "token="+data.token +"; SameSite=Strict; Secure; HttpOnly";
            window.location.replace("/dashboard");
        }).done(function() {
          })
          .fail(function(data) {
            $('#submit').html('Register').prop('disabled', false);
            data.responseJSON.errors.forEach(element => {
                $('#header-content').html("<br><div class=\"notification is-danger\">"+element.msg+"</div>")
            });
          });
});
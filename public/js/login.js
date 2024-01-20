$(document).ready(() => {
    const passwordToggleButton = $("#password-toggle");
    const passwordIcon = $("#password-icon");
    
    passwordToggleButton.click(() => {
        const passwordInput = $("#password");

        if(passwordInput.attr("type") === "password") {
            passwordIcon.removeClass("fa-eye-slash");
            passwordIcon.addClass("fa-eye");
            passwordInput.attr("type", "text");
        } else {
            passwordIcon.removeClass("fa-eye");
            passwordIcon.addClass("fa-eye-slash");
            passwordInput.attr("type", "password");
        }
    });

    let requestProcessing = false;
    const submitButton = $(".submit-button");
    const passwordAlert = $(".password-match");

    submitButton.click((e) => {
        e.preventDefault();

        if(requestProcessing) {
            return;
        }

        requestProcessing = true;

        $.ajax({
            type: "POST",
            url: "/login",
            data: JSON.stringify({ username:  $("#username").val(), password: $("#password").val() }),
            contentType: "application/json; charset=utf-8",
            traditional: true,
            success: (data) => {
                console.log(data);
            },
            error: (data) => {
                requestProcessing = false;
                passwordAlert.html(data.responseText);
                passwordAlert.removeClass("opacity-zero");
            }
        });
    })
});
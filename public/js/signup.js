$(document).ready(() => {
    const passwordToggleButton = $("#password-toggle");
    const passwordIcon = $("#password-icon");

    const repasswordToggleButton = $("#repassword-toggle");
    const repasswordIcon = $("#repassword-icon");
    
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

    repasswordToggleButton.click(() => {
        const repasswordInput = $("#repassword");

        if(repasswordInput.attr("type") === "password") {
            repasswordIcon.removeClass("fa-eye-slash");
            repasswordIcon.addClass("fa-eye");
            repasswordInput.attr("type", "text");
        } else {
            repasswordIcon.removeClass("fa-eye");
            repasswordIcon.addClass("fa-eye-slash");
            repasswordInput.attr("type", "password");
        }
    });


    const form = $(".form-container");
    const submitButton = $(".submit-button");

    const repasswordInput = $("#repassword");
    const repasswordInputWrapper = $("#repassword-wrapper");

    const passwordInput = $("#password");
    const usernameInput = $("#username");

    const passwordAlert = $("#password-match");
    const usernameAlert = $("#username-match");

    let passwordMatching = false;

    usernameInput.on("input", (e) => {
        e.target.value = removeSpaces(e.target.value);
        usernameAlert.addClass("opacity-zero");
        usernameInput.removeClass("password-wrong");
    })

    passwordInput.on("input", (e) => {
        e.target.value = removeSpaces(e.target.value);
        if(e.target.value.length === 0) {
            repasswordInputWrapper.removeClass("password-wrong")
            passwordAlert.addClass("opacity-zero");
        }

        if($("#password").val() !== $("#repassword").val()) {
            passwordMatching = false;
        } else {
            passwordMatching = true;
        }
    })

    repasswordInput.on("input", (e) => {
        e.target.value = removeSpaces(e.target.value);
        if($("#password").val() !== $("#repassword").val()) {
            repasswordInputWrapper.addClass("password-wrong");
            passwordAlert.removeClass("opacity-zero");
            passwordMatching = false;
        } else {
            repasswordInputWrapper.removeClass("password-wrong")
            passwordAlert.addClass("opacity-zero");
            passwordMatching = true;
        }
    })

    submitButton.click((e) => {
        e.preventDefault();

        if($("#username").val().length === 0) {
            return;
        }

        $.ajax({
            type: "POST",
            url: "/usernameExists",
            data: JSON.stringify({ username:  $("#username").val() }),
            contentType: "application/json; charset=utf-8",
            traditional: true,
            success: (data) => {
                if(data.exists) {
                    usernameAlert.removeClass("opacity-zero");
                    usernameInput.addClass("password-wrong");
                    return;
                }
                if(passwordMatching) {
                    form.submit();
                }
            },
            error: (data) => {
                console.log("Error checking if username exists, try again later");
            }
        });
    });
});

function removeSpaces(str) {
    return str.replace(/ /g, "");
}
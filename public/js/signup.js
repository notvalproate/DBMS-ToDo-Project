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


    const form = $(".login-box");
    const submitButton = $(".submit-button");
    const repasswordInput = $("#repassword");
    const passwordInput = $("#password");

    let passwordMatching = false;

    passwordInput.on("input", (e) => {
        e.target.value = removeSpaces(e.target.value);
        if(e.target.value.length === 0) {
            repasswordInput.removeClass("password-wrong")
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
            repasswordInput.addClass("password-wrong");
            passwordMatching = false;
        } else {
            repasswordInput.removeClass("password-wrong")
            passwordMatching = true;
        }
    })

    submitButton.click((e) => {
        e.preventDefault();

        if(passwordMatching) {
            form.submit();
        }
    });
});

function removeSpaces(str) {
    return str.replace(/ /g, "");
}
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
});
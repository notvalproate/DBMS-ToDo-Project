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
});
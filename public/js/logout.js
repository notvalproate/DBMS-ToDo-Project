$(document).ready(() => {
    const logoutButton = $("#logout-button");

    logoutButton.click(() => {
        document.cookie = "ACT=null";
        window.location.replace("/login");
    });
});
$(document).ready(() => {
    const todaysMessages = $(".todays-messages");

    $.ajax({
        type: "POST",
        url: "/getTodaysMessages",
        contentType: "application/json; charset=utf-8",
        traditional: true,
        success: (messages) => {
            console.log(messages);

            if(messages.todaysMessages.length === 0) {
                todaysMessages.html(
                    `
                    <div class="no-messages">
                        No messages for today!
                    </div>
                    `
                );

                return;
            }
        },
    });
});
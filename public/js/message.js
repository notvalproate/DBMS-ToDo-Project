$(document).ready(() => {
    $.ajax({
        type: "POST",
        url: "/checkAuth",
        data: JSON.stringify({ date: $("#date").val() }),
        contentType: "application/json; charset=utf-8",
        traditional: true,
        success: (data) => {
            if (!data.authenticated) {
                window.location.href = "/login";
            }
        },
    });

    const todaysMessages = $(".todays-messages");

    $.ajax({
        type: "POST",
        url: "/getTodaysMessages",
        contentType: "application/json; charset=utf-8",
        traditional: true,
        success: (messages) => {
            console.log(messages);

            const msgs = messages.todaysMessages;

            if (msgs.length === 0) {
                todaysMessages.html(
                    `
                    <div class="no-messages">
                        No messages for today!
                    </div>
                    `
                );

                return;
            }

            for (let i = 0; i < msgs.length; i++) {
                todaysMessages.append(
                    `
                    <div class="each-entry">
                        <div class="message-title">
                            <p class="msg-subtitle">Message ${i + 1}:</p>
                        </div>
                        <p>${msgs[i].content}</p>
                    </div>
                    `
                );
            }
        },
    });
});

function formatDate(inputDate) {
    const dateObject = new Date(inputDate.substring(0, 10));

    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];

    const day = dateObject.getDate();
    const month = months[dateObject.getMonth()];
    const year = dateObject.getFullYear();

    const formattedDate = `${day} ${month}, ${year}`;

    return formattedDate;
}

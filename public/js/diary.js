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

    const submitButton = $(".submit-button");
    const moodRange = $(".mood-range");
    const enterDiary = $(".enter-diary");
    const oldDiaryContainer = $(".old");
    const diaryForm = $(".diary");

    $.ajax({
        type: "POST",
        url: "/getPast7Diaries",
        contentType: "application/json; charset=utf-8",
        traditional: true,
        success: (diaries) => {
            for (let i = 0; i < diaries.length; i++) {
                let moodValue = diaries[i].mood;

                let feeling = "";
                if (moodValue === 1) {
                    feeling = "Depressed";
                } else if (moodValue === 2) {
                    feeling = "Sad";
                } else if (moodValue === 3) {
                    feeling = "Okay";
                } else if (moodValue === 4) {
                    feeling = "Good";
                } else if (moodValue === 5) {
                    feeling = "Happy";
                }

                let date = formatDate(diaries[i].diary_date);

                oldDiaryContainer.prepend(
                    `
                    <div class="each-entry">
                        <div class="diary-title">
                            <p class="dater">${date}</p>
                            <p class="dater">Feeling: ${feeling}</p>
                        </div>
                        <p>${diaries[i].content}</p>
                    </div>
                    `
                );
            }
        },
    });

    submitButton.click(() => {
        const moodValue = parseInt(moodRange.val());
        let moodInt = 3;
        const diaryEntry = enterDiary.val();

        let feeling = "";
        if (moodValue >= 1 && moodValue <= 25) {
            feeling = "Depressed";
            moodInt = 1;
        } else if (moodValue >= 26 && moodValue <= 50) {
            feeling = "Sad";
            moodInt = 2;
        } else if (moodValue >= 51 && moodValue <= 75) {
            feeling = "Okay";
            moodInt = 3;
        } else if (moodValue >= 76 && moodValue <= 99) {
            feeling = "Good";
            moodInt = 4;
        } else if (moodValue === 101) {
            feeling = "Happy";
            moodInt = 5;
        }

        const dateObject = new Date();

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

        $.ajax({
            type: "POST",
            url: "/addDiaryEntry",
            data: JSON.stringify({ content: diaryEntry, mood: moodInt }),
            contentType: "application/json; charset=utf-8",
            traditional: true,
            success: () => {
                oldDiaryContainer.prepend(
                    `
                    <div class="each-entry">
                        <div class="diary-title">
                            <p class="dater">${formattedDate}</p>
                            <p class="dater">Feeling: ${feeling}</p>
                        </div>
                        <p>${diaryEntry}</p>
                    </div>
                    `
                );

                diaryForm.remove();
            },
        });
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

$(document).ready(() => {
    const submitButton = $('.submit-button');

    const todoSection = $('#todos');
    const diarySection = $('#diary');
    const messagesSection = $('#messages');

    const averageMoodWeek = $('#average-mood-week');
    const productivityWeek = $('#productivity-week');
    const averageMoodMonth = $('#average-mood-month');
    const productivityMonth = $('#productivity-month');

    $.ajax({
        type: "POST",
        url: "/getData",
        data: JSON.stringify({ date:  $("#date").val() }),
        contentType: "application/json; charset=utf-8",
        traditional: true,
        success: (data) => {
            averageMoodWeek.html(getFeelingFromMoodValue(Math.round(data.averageMoodWeek)));
            productivityWeek.html(`${(data.productivityWeek).toFixed(2)}%`);
            averageMoodMonth.html(getFeelingFromMoodValue(Math.round(data.averageMoodMonth)));
            productivityMonth.html(`${(data.productivityMonth).toFixed(2)}%`);
        },
    });

    submitButton.click((e) => {
        e.preventDefault();

        todoSection.html("");
        diarySection.html("");
        messagesSection.html("");

        $.ajax({
            type: "POST",
            url: "/getLogs",
            data: JSON.stringify({ date:  $("#date").val() }),
            contentType: "application/json; charset=utf-8",
            traditional: true,
            success: (data) => {

                // TODO SECTION
                const todos = data.todos;

                for(let i = 0; i < todos.length; i++) {
                    const completed = todos[i].completed.data[0];

                    todoSection.append(
                    `
                    <div>
                        <span class="${completed ? "complete" : "incomplete"}">
                            ${completed ? "Completed: " : "Incomplete: "}
                        </span>
                        <span class="task-content">${todos[i].task}</span>
                    </div>
                    `
                    );
                }

                // DIARY SECTION

                const diary = data.diary;
                const moodValue = diary.mood;

                let feeling = getFeelingFromMoodValue(moodValue);

                diarySection.append(
                `
                <p class="dater-two">Feeling: ${feeling}</p>
                ${diary.content}
                `);

                // MESSAGE SECTION

                const messages = data.messages;

                for(let i = 0; i < messages.length; i++) {

                    messagesSection.append(
                    `
                    <div>
                        <span class="complete">Message ${i + 1}: </span>
                        <span class="task-content">${messages[i].content}</span>
                    </div>
                    `
                    );
                }
            },
        });
    })
});

function getFeelingFromMoodValue(moodValue) {
    if (moodValue === 1) {
        return 'Depressed';
    } else if (moodValue === 2) {
        return 'Sad';
    } else if (moodValue === 3) {
        return 'Okay';
    } else if (moodValue === 4) {
        return 'Good';
    } else if (moodValue === 5) {
        return 'Happy';
    }
}
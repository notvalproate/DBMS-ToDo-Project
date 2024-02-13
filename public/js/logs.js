$(document).ready(() => {
    const submitButton = $('.submit-button');
    const todoSection = $('#todos');
    const diarySection = $('#diary');
    const messagesSection = $('#messages');

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

                let feeling = '';
                if (moodValue === 1) {
                    feeling = 'Depressed';
                } else if (moodValue === 2) {
                    feeling = 'Sad';
                } else if (moodValue === 3) {
                    feeling = 'Okay';
                } else if (moodValue === 4) {
                    feeling = 'Good';
                } else if (moodValue === 5) {
                    feeling = 'Happy';
                }

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
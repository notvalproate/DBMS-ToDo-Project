$(document).ready(() => {
    const submitButton = $('.submit-button');

    const todoSection = $('#todos');
    const diarySection = $('#diary');
    const messagesSection = $('#messages');

    const averageMoodWeek = $('#average-mood-week');
    const averageMoodMonth = $('#average-mood-month');

    $.ajax({
        type: "POST",
        url: "/getData",
        data: JSON.stringify({ date:  $("#date").val() }),
        contentType: "application/json; charset=utf-8",
        traditional: true,
        success: (data) => {
            averageMoodWeek.html(getFeelingFromMoodValue(Math.round(data.averageMoodWeek)));
            new numberRush('productivity-week', {
                maxNumber: Math.round(data.productivityWeek),
                speed: 15,
            });
            averageMoodMonth.html(getFeelingFromMoodValue(Math.round(data.averageMoodMonth)));
            new numberRush('productivity-month', {
                maxNumber: Math.round(data.productivityMonth),
                speed: 15,
            });

            // CHARTS

            // OPTIONS
            const options = {
                resposive: true,
                scales: {
                    x: {
                        ticks: {
                            font: {
                                family: 'Sofia Sans',
                            },
                            color: "#974dc5",
                        },
                        grid: {
                            color: "#d6bee7",
                        },
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            font: {
                                family: 'Sofia Sans',
                            },
                            color: "#974dc5",
                        },
                        grid: {
                            color: "#d6bee7",
                        },
                    },
                },
                plugins: {
                    legend: {
                        labels: {
                            font: {
                                family: 'Sofia Sans',
                            },
                            color: "#974dc5",
                        }
                    }
                },
            }

            // PRODUCITIVTY WEEK

            const productivityWeekChart = document.getElementById('productivityWeekChart');

            const taskDatesWeek = data.graphTotalTasks7.map(entry => entry.task_date.substring(5, 10));
            const taskSumsWeek = data.graphTotalTasks7.map(entry => entry.tasks_sum);
            const taskSumsWeekComplete = [];

            let j = 0;
            for(let i = 0; i < taskDatesWeek.length; i++) {
                if(taskDatesWeek[i] === (data.graphCompletedTasks7[j].task_date).substring(5, 10)) {
                    taskSumsWeekComplete.push(data.graphCompletedTasks7[j].tasks_sum);
                    j++;
                    continue;
                }

                taskSumsWeekComplete.push(0);
            }           

            const productivityWeekdata = {
                labels: taskDatesWeek,
                datasets: [
                    {
                        label: 'Total',
                        data: taskSumsWeek,
                        borderColor: '#a857da',
                        backgroundColor: '#a857da',
                        tension: 0.3
                    },
                    {
                        label: 'Completed',
                        data: taskSumsWeekComplete,
                        borderColor: '#caa7e1',
                        backgroundColor: '#caa7e1',
                        tension: 0.3
                    }
                ]
            };

            const productivityWeekconfig = {
                type: 'line',
                data: productivityWeekdata,
                options: options,
            };

            new Chart(productivityWeekChart, productivityWeekconfig);

            // Producitivty month

            const productivityMonthChart = document.getElementById('productivityMonthChart');

            const taskDatesMonth = data.graphTotalTasks30.map(entry => entry.task_date.substring(5, 10));
            const taskSumsMonth = data.graphTotalTasks30.map(entry => entry.tasks_sum);
            const taskSumsMonthComplete = [];

            j = 0;
            for(let i = 0; i < taskDatesMonth.length; i++) {
                if(taskDatesMonth[i] === (data.graphCompletedTasks30[j].task_date).substring(5, 10)) {
                    taskSumsMonthComplete.push(data.graphCompletedTasks30[j].tasks_sum);
                    j++;
                    continue;
                }

                taskSumsMonthComplete.push(0);
            }           

            const productivityMonthdata = {
                labels: taskDatesMonth,
                datasets: [
                    {
                        label: 'Total',
                        data: taskSumsMonth,
                        borderColor: '#a857da',
                        backgroundColor: '#a857da',
                        tension: 0.3
                    },
                    {
                        label: 'Completed',
                        data: taskSumsMonthComplete,
                        borderColor: '#caa7e1',
                        backgroundColor: '#caa7e1',
                        tension: 0.3
                    }
                ]
            };

            const productivityMonthconfig = {
                type: 'line',
                data: productivityMonthdata,
                options: options,
            };

            new Chart(productivityMonthChart, productivityMonthconfig);
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
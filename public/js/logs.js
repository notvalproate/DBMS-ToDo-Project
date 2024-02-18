$(document).ready(() => {
    AOS.init();

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
            setTimeout(() => {
                new numberRush('productivity-week', {
                    maxNumber: Math.round(data.productivityWeek),
                    speed: 15,
                });
            }, 200);
            averageMoodMonth.html(getFeelingFromMoodValue(Math.round(data.averageMoodMonth)));
            setTimeout(() => {
                new numberRush('productivity-month', {
                    maxNumber: Math.round(data.productivityMonth),
                    speed: 15,
                });
            }, 400);

            // CHARTS
            generateProductivityChart('productivityWeekChart', data.graphTotalTasks7, data.graphCompletedTasks7);
            generateProductivityChart('productivityMonthChart', data.graphTotalTasks30, data.graphCompletedTasks30);

            generateFeelingChart('moodWeekChart', data.moodPastWeek);
            generateFeelingChart('moodMonthChart', data.moodPastMonth);
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
                console.log(data);
                // TODO SECTION
                const todos = data.todos;

                let delay = 0;

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

                    delay += 50;
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

function generateProductivityChart(target, totalTasks, completedTasks) {
    const targetChart = document.getElementById(target);

    let dateLabels = [];
    let values1 = [];
    let values2 = [];

    if(totalTasks.length > 0) {
        dateLabels = totalTasks.map(entry => entry.task_date.substring(5, 10));
        values1 = totalTasks.map(entry => entry.tasks_sum);
    }


    j = 0;
    for(let i = 0; i < values1.length; i++) {
        if(j >= completedTasks.length) {
            values2.push(0);
            j++;
            continue;
        }

        if(dateLabels[i] === (completedTasks[j].task_date).substring(5, 10)) {
            values2.push(completedTasks[j].tasks_sum);
            j++;
            continue;
        }

        values2.push(0);
    }           
    

    const data = {
        labels: dateLabels,
        datasets: [
            {
                label: 'Total',
                data: values1,
                borderColor: '#a857da',
                backgroundColor: '#a857da',
                tension: 0.3
            },
            {
                label: 'Completed',
                data: values2,
                borderColor: '#caa7e1',
                backgroundColor: '#caa7e1',
                tension: 0.3
            }
        ]
    };

    const config = {
        type: 'line',
        data: data,
        options: prodChartOptions,
    };

    new Chart(targetChart, config);
}

function generateFeelingChart(target, moods) {
    const targetChart = document.getElementById(target);

    let dateLabels = [];
    let values = [];

    if(moods.length > 0) {
        dateLabels = moods.map(entry => entry.diary_date.substring(5, 10));
        values = moods.map(entry => entry.mood);
    }

    const data = {
        labels: dateLabels,
        datasets: [
            {
                label: 'Mood',
                data: values,
                borderColor: '#a857da',
                backgroundColor: '#a857da',
                tension: 0.3
            },
        ]
    };

    const config = {
        type: 'line',
        data: data,
        options: moodChartOptions,
    };

    new Chart(targetChart, config);
}

const prodChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
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

const moodChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
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
            suggestedMin: 1,
            suggestedMax: 5,
            ticks: {
                callback: ((context, index) => {
                    return getFeelingFromMoodValue(context);
                }),
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
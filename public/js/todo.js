$(document).ready(() => {
    const addButton = $('.fa-circle-plus');
    const todoInput = $('.todo-in');
    const checkerDiv = $('.checker');

    $.ajax({
        type: "POST",
        url: "/getTodaysTodos",
        contentType: "application/json; charset=utf-8",
        traditional: true,
        success: (todaysTodos) => {
            for(let i = 0; i < todaysTodos.length; i++) {
                let checked = "checked";

                if(!todaysTodos[i].completed.data[0]) {
                    checked = "";
                }

                checkerDiv.append(`
                    <div class="item-wrapper">
                        <label class="cr-wrapper" for="taskid${todaysTodos[i].taskid}">
                            <input type="checkbox" id="taskid${todaysTodos[i].taskid}" ${checked} />
                            <div class="cr-input"></div>
                            <span>${todaysTodos[i].task}</span>
                        </label>
                    </div>
                `);

                $(`#taskid${todaysTodos[i].taskid}`).click(() => {
                    console.log("added");
    
                    let checked = false;
                    
                    if ($(`#taskid${todaysTodos[i].taskid}`).is(':checked')) {
                        checked = true;
                    }
    
                    $.ajax({
                        type: "POST",
                        url: "/setTodo",
                        data: JSON.stringify({ taskid: todaysTodos[i].taskid, isCompleted: checked }),
                        contentType: "application/json; charset=utf-8",
                        traditional: true,
                        success: (data) => {
                            console.log(data);
                        },
                    });
                })
            }
        },
    });

    addButton.click(() => {
        const taskText = todoInput.val();

        $.ajax({
            type: "POST",
            url: "/addTodo",
            data: JSON.stringify({ taskText: taskText }),
            contentType: "application/json; charset=utf-8",
            traditional: true,
            success: (data) => {
                checkerDiv.append(`
                <div class="inner">
                    <input type="checkbox" class="check-it" id="taskid${data.taskid}">
                    <label for="taskid${data.taskid}">${taskText}</label>
                </div>
                `);

                $(`#taskid${data.taskid}`).click(() => {
                    console.log("added");

                    let checked = false;
                    
                    if ($(`#taskid${data.taskid}`).is(':checked')) {
                        checked = true;
                    }

                    $.ajax({
                        type: "POST",
                        url: "/setTodo",
                        data: JSON.stringify({ taskid: data.taskid, isCompleted: checked }),
                        contentType: "application/json; charset=utf-8",
                        traditional: true,
                        success: (data) => {
                            console.log(data);
                        },
                    });
                });
            },
        });
    })
});
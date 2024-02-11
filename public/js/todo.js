$(document).ready(() => {
    const addButton = $('.fa-circle-plus');
    const todoInput = $('.todo-in');
    const checkerDiv = $('.checker');

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
                })
            },
        });
    })
});
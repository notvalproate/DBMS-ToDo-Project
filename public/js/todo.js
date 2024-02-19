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

    AOS.init();

    window.addEventListener("load", AOS.refresh);

    const addButton = $(".fa-circle-plus");
    const todoInput = $(".todo-in");
    const checkerDiv = $(".checker");

    let currentDelay = 0;

    $.ajax({
        type: "POST",
        url: "/getTodaysTodos",
        contentType: "application/json; charset=utf-8",
        traditional: true,
        success: (todaysTodos) => {
            for (let i = 0; i < todaysTodos.length; i++) {
                let checked = "checked";

                if (!todaysTodos[i].completed.data[0]) {
                    checked = "";
                }

                checkerDiv.append(`
                    <div class="item-wrapper" id="wraptaskid${todaysTodos[i].taskid}">
                        <label class="cr-wrapper" for="taskid${todaysTodos[i].taskid}">
                            <input type="checkbox" id="taskid${todaysTodos[i].taskid}" ${checked} />
                            <div class="cr-input"></div>
                            <span>${todaysTodos[i].task}</span>
                        </label>
                        <div class="remove-item" id="remtaskid${todaysTodos[i].taskid}">
                            <i class="fa-solid fa-trash-can"></i>
                        </div>
                    </div>
                `);

                currentDelay += 150;

                $(`#taskid${todaysTodos[i].taskid}`).click(() => {
                    let checked = false;

                    if ($(`#taskid${todaysTodos[i].taskid}`).is(":checked")) {
                        checked = true;
                    }

                    $.ajax({
                        type: "POST",
                        url: "/setTodo",
                        data: JSON.stringify({
                            taskid: todaysTodos[i].taskid,
                            isCompleted: checked,
                        }),
                        contentType: "application/json; charset=utf-8",
                        traditional: true,
                        success: (data) => {
                            console.log(data);
                        },
                    });
                });

                $(`#remtaskid${todaysTodos[i].taskid}`).click(() => {
                    $.ajax({
                        type: "POST",
                        url: "/removeTodo",
                        data: JSON.stringify({ taskid: todaysTodos[i].taskid }),
                        contentType: "application/json; charset=utf-8",
                        traditional: true,
                        success: (data) => {
                            $(`#wraptaskid${todaysTodos[i].taskid}`).remove();
                        },
                    });
                });
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
                <div class="item-wrapper" id="jtaskid${data.taskid}">
                    <label class="cr-wrapper" for="taskid${data.taskid}">
                        <input type="checkbox" id="taskid${data.taskid}"/>
                        <div class="cr-input"></div>
                        <span>${taskText}</span>
                    </label>
                    <div class="remove-item" id="remtaskid${data.taskid}">
                        <i class="fa-solid fa-trash-can"></i>
                    </div>
                </div>
                `);

                $(`#taskid${data.taskid}`).click(() => {
                    console.log("added");

                    let checked = false;

                    if ($(`#taskid${data.taskid}`).is(":checked")) {
                        checked = true;
                    }

                    $.ajax({
                        type: "POST",
                        url: "/setTodo",
                        data: JSON.stringify({
                            taskid: data.taskid,
                            isCompleted: checked,
                        }),
                        contentType: "application/json; charset=utf-8",
                        traditional: true,
                        success: (data) => {
                            console.log(data);
                        },
                    });
                });

                $(`#remtaskid${data.taskid}`).click(() => {
                    $.ajax({
                        type: "POST",
                        url: "/removeTodo",
                        data: JSON.stringify({ taskid: data.taskid }),
                        contentType: "application/json; charset=utf-8",
                        traditional: true,
                        success: () => {
                            $(`#jtaskid${data.taskid}`).remove();
                        },
                    });
                });

                todoInput.val("");
            },
        });
    });
});

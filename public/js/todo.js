$(document).ready(() => {
    const addButton = $('.fa-circle-plus');
    const todoInput = $('.todo-in');
    const checkerDiv = $('.checker');

    addButton.click(() => {
        const taskText = todoInput.val();



        checkerDiv.append(`
        <div class="inner">
            <input type="checkbox" class="check-it">
            <label>${taskText}</label>
        </div>
        `);
    })
});
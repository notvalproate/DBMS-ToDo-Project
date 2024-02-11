document.addEventListener('DOMContentLoaded', function () {
    const addButton = document.querySelector('.fa-circle-plus');
    const todoInput = document.querySelector('.todo-in');
    const checkerDiv = document.querySelector('.checker');

    addButton.addEventListener('click', function () {
        const taskText = todoInput.value;

        const newTaskDiv = document.createElement('div');
        newTaskDiv.classList.add('inner');

        const newCheckbox = document.createElement('input');
        newCheckbox.type = 'checkbox';
        newCheckbox.classList.add('check-it');
        newCheckbox.name = 'checkbox';

        const newLabel = document.createElement('label');
        newLabel.textContent = taskText;

        newTaskDiv.appendChild(newCheckbox);
        newTaskDiv.appendChild(newLabel);
        checkerDiv.appendChild(newTaskDiv);

        todoInput.value = '';
    });
});

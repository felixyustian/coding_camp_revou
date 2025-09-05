// DOM Element Selectors
const todoForm = document.querySelector('.todo-form');
const todoInput = document.querySelector('.todo-input');
const todoDateInput = document.querySelector('.todo-date');
const todoList = document.querySelector('.todo-list');
const filterOption = document.querySelector('.filter-todos');
const deleteAllBtn = document.querySelector('.delete-all-btn');
const noTaskMessage = document.querySelector('.no-task-message');

// Event Listeners
document.addEventListener('DOMContentLoaded', getTodos); // Load todos from localStorage
todoForm.addEventListener('submit', addTodo);
todoList.addEventListener('click', handleTodoClick);
filterOption.addEventListener('change', filterTodos);
deleteAllBtn.addEventListener('click', deleteAllTodos);

// --- FUNCTIONS ---

/**
 * Adds a new todo item.
 * @param {Event} event - The form submission event.
 */
function addTodo(event) {
    event.preventDefault(); // Prevents the form from submitting and reloading the page

    // Validate Input: Check if the text input is empty [cite: 17]
    if (todoInput.value.trim() === '') {
        alert('Please enter a task description.');
        return;
    }

    // Create a new todo object
    const newTodo = {
        id: Date.now(), // Unique ID for the todo
        text: todoInput.value,
        date: todoDateInput.value,
        completed: false,
    };

    // Add the new todo to the DOM
    createTodoElement(newTodo);

    // Add todo to localStorage
    saveLocalTodos(newTodo);

    // Clear input fields
    todoInput.value = '';
    todoDateInput.value = '';

    // Update the visibility of the "No task found" message
    updateNoTaskMessage();
}

/**
 * Handles clicks inside the todo list (for completing or deleting a task).
 * @param {Event} event - The click event.
 */
function handleTodoClick(event) {
    const item = event.target;
    const todoItem = item.closest('.todo-item');

    if (!todoItem) return;

    // Handle Delete
    if (item.classList.contains('delete-btn')) {
        todoItem.classList.add('fall');
        // Remove from localStorage after animation
        removeLocalTodos(todoItem);
        todoItem.addEventListener('transitionend', () => {
            todoItem.remove();
            updateNoTaskMessage();
        });
    }

    // Handle Complete
    if (item.classList.contains('complete-btn')) {
        todoItem.classList.toggle('completed');
        updateLocalTodoStatus(todoItem);
    }
}

/**
 * Filters todos based on the selected option (All, Completed, Incomplete).
 */
function filterTodos() {
    const todos = todoList.childNodes;
    todos.forEach(function(todo) {
        // The check 'todo.nodeType === 1' ensures we only affect element nodes
        if (todo.nodeType === 1) {
            switch (filterOption.value) {
                case 'all':
                    todo.style.display = 'flex';
                    break;
                case 'completed':
                    if (todo.classList.contains('completed')) {
                        todo.style.display = 'flex';
                    } else {
                        todo.style.display = 'none';
                    }
                    break;
                case 'incomplete':
                    if (!todo.classList.contains('completed')) {
                        todo.style.display = 'flex';
                    } else {
                        todo.style.display = 'none';
                    }
                    break;
            }
        }
    });
}

/**
 * Deletes all todos from the list and from localStorage.
 */
function deleteAllTodos() {
    // A confirmation before deleting all is good practice
    if (confirm('Are you sure you want to delete all tasks?')) {
        while (todoList.firstChild) {
            todoList.removeChild(todoList.firstChild);
        }
        localStorage.removeItem('todos');
        updateNoTaskMessage();
    }
}

/**
 * Updates the visibility of the "No task found" message.
 */
function updateNoTaskMessage() {
    if (todoList.children.length === 0) {
        noTaskMessage.style.display = 'block';
    } else {
        noTaskMessage.style.display = 'none';
    }
}

// --- LOCAL STORAGE FUNCTIONS ---

/**
 * Retrieves todos from localStorage.
 * @returns {Array} An array of todo objects.
 */
function getTodosFromStorage() {
    return localStorage.getItem('todos') ? JSON.parse(localStorage.getItem('todos')) : [];
}

/**
 * Saves a new todo to localStorage.
 * @param {object} todo - The todo object to save.
 */
function saveLocalTodos(todo) {
    let todos = getTodosFromStorage();
    todos.push(todo);
    localStorage.setItem('todos', JSON.stringify(todos));
}

/**
 * Loads and displays todos from localStorage when the page loads.
 */
function getTodos() {
    let todos = getTodosFromStorage();
    todos.forEach(function(todo) {
        createTodoElement(todo);
    });
    updateNoTaskMessage();
}

/**
 * Removes a specific todo from localStorage.
 * @param {HTMLElement} todoElement - The HTML element of the todo to remove.
 */
function removeLocalTodos(todoElement) {
    let todos = getTodosFromStorage();
    const todoId = Number(todoElement.dataset.id);
    const updatedTodos = todos.filter(todo => todo.id !== todoId);
    localStorage.setItem('todos', JSON.stringify(updatedTodos));
}

/**
 * Updates the 'completed' status of a todo in localStorage.
 * @param {HTMLElement} todoElement - The HTML element of the todo to update.
 */
function updateLocalTodoStatus(todoElement) {
    let todos = getTodosFromStorage();
    const todoId = Number(todoElement.dataset.id);
    const todoIndex = todos.findIndex(todo => todo.id === todoId);
    if (todoIndex > -1) {
        todos[todoIndex].completed = !todos[todoIndex].completed;
        localStorage.setItem('todos', JSON.stringify(todos));
    }
}

/**
 * Creates the HTML element for a single todo item and appends it to the list.
 * @param {object} todo - The todo object containing id, text, date, and completed status.
 */
function createTodoElement(todo) {
    // Create LI element
    const todoItem = document.createElement('li');
    todoItem.classList.add('todo-item');
    if (todo.completed) {
        todoItem.classList.add('completed');
    }
    todoItem.dataset.id = todo.id; // Store ID in a data attribute

    // Create container for task text and date
    const taskDetails = document.createElement('div');
    taskDetails.classList.add('task-details');

    const taskText = document.createElement('span');
    taskText.classList.add('task-text');
    taskText.innerText = todo.text;
    taskDetails.appendChild(taskText);

    if (todo.date) {
        const taskDate = document.createElement('span');
        taskDate.classList.add('task-date');
        taskDate.innerText = `Due: ${todo.date}`;
        taskDetails.appendChild(taskDate);
    }

    todoItem.appendChild(taskDetails);

    // Create action buttons (Complete, Delete)
    const taskActions = document.createElement('div');
    taskActions.classList.add('task-actions');

    const completeButton = document.createElement('button');
    completeButton.innerHTML = '<i class="fas fa-check-circle"></i>';
    completeButton.classList.add('complete-btn');
    taskActions.appendChild(completeButton);

    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
    deleteButton.classList.add('delete-btn');
    taskActions.appendChild(deleteButton);

    todoItem.appendChild(taskActions);

    // Append the new item to the list
    todoList.appendChild(todoItem);
}
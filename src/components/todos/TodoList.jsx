import React, { useState } from 'react';
import './todoList.css';

function TodoList() {
  // State to hold tasks for each category
  const [tasks, setTasks] = useState({
    daily: [],
    weekly: [],
    monthly: [],
  });

  // State to manage the visibility of the add task modal
  const [showModal, setShowModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState('');
  const [newTask, setNewTask] = useState({
    name: '',
    urgent: false,
  });

  // Handle opening the modal
  const handleAddTask = (category) => {
    setCurrentCategory(category);
    setShowModal(true);
  };

  // Handle closing the modal
  const handleCloseModal = () => {
    setShowModal(false);
    setNewTask({ name: '', urgent: false });
  };

  // Handle input changes in the modal
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewTask((prevTask) => ({
      ...prevTask,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Handle submitting the new task
  const handleSubmit = (e) => {
    if (newTask.name.trim() === '') return;

    setTasks((prevTasks) => ({
      ...prevTasks,
      [currentCategory]: [...prevTasks[currentCategory], newTask],
    }));

    // Close the modal and reset newTask
    handleCloseModal();
  };

  // Render tasks for a category
  const renderTasks = (category) => {
    return tasks[category].map((task, index) => (
      <li
        key={index}
        className={`task-item ${task.urgent ? 'urgent' : ''}`}
      >
        {task.name}
      </li>
    ));
  };

  return (
    <div className="page-background">
      <div className="todo-container">
        <h1>My Todos</h1>
        <div className="todo-lists">
          {['daily', 'weekly', 'monthly'].map((category) => (
            <div
              key={category}
              className="todo-list"
              onMouseEnter={() => {}}
              onMouseLeave={() => {}}
            >
              <div className="todo-header">
                <h2>{category.charAt(0).toUpperCase() + category.slice(1)}</h2>
                <button
                  className="add-task-button"
                  onClick={() => handleAddTask(category)}
                >
                  +
                </button>
              </div>
              <ul>{renderTasks(category)}</ul>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Add Task to {currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1)}</h2>
            <div>
              <div className="form-group">
                <label htmlFor="taskName">Task Name:</label>
                <input
                  type="text"
                  id="taskName"
                  name="name"
                  value={newTask.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="urgent"
                    checked={newTask.urgent}
                    onChange={handleInputChange}
                  />
                  Mark as urgent
                </label>
              </div>
              <div className="modal-buttons">
                <button type="submit" className="submit-button" onClick={handleSubmit}>
                  Add Task
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TodoList;

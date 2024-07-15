import React, { useState, useEffect } from 'react';
import './EventsList.css';

const EventList = () => {
  const [tasks, setTasks] = useState([]);

  const fetchUserEvents = async () => {
    try {
      const response = await fetch('http://localhost:5000/getallevents', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTasks(data.events); // Assuming backend sends tasks with completion status
      } else {
        console.error('Failed to fetch user events:', response.statusText);
      }
    } catch (error) {
      console.error('Network error:', error.message);
    }
  };
  
  useEffect(() => {
    fetchUserEvents()
      .catch(error => {
        console.error('Error fetching user events:', error);
      });
  }, []);

  const handleTaskCompletion = async (taskId) => {
    try {
      const response = await fetch(`http://localhost:5000/userdata/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ completed: true }), // Send completion status to backend
      });

      if (response.ok) {
        console.log(await response.json())
        const updatedTasks = tasks.map(task =>
          task.id === taskId ? { ...task, completed: true } : task
        );
        setTasks(updatedTasks);
      } else {
        console.error('Failed to update task completion:', response.statusText);
      }
    } catch (error) {
      console.error('Network error:', error.message);
    }
  };

  const incompleteTasks = tasks.filter(task => !task.completed);
  const completeTasks = tasks.filter(task => task.completed);

  return (
    <div className="event-list-container">
      <div className="task-container">
        <h1>Incomplete Tasks</h1>
        <ul>
          {incompleteTasks.map(task => (
            <li key={task.id}>
              <div className='events'>
                <span>{task.name}</span>
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => handleTaskCompletion(task.id)}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="task-container">
        <h2>Complete Tasks</h2>
        <ul>
          {completeTasks.map(task => (
            <li key={task.id}>
              <div className='events'>
                <span>{task.name}</span>
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => handleTaskCompletion(task.id)}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default EventList;

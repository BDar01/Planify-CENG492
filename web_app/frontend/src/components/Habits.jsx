import React, { useState, useEffect } from 'react';
import HabitCard from './HabitCard';
import ButtonCard from './ButtonCard';

const Habits = () => {
  const [habits, setHabits] = useState([]);

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = () => {
    fetch('http://localhost:5000/habits',
    {method: "GET",
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`, // Include JWT token for authentication
    }},
    )
      .then(response => response.json())
      .then(data => {
        console.log(data);
        setHabits(data);
      })
      .catch(error => {
        console.error('Error fetching habits:', error);
      });
  };

  const addHabit = (title, description, time, frequency) => {
    const newHabit = {
      id: habits.length + 1,
      name: title,
      description: description,
      time: time,
      frequency: frequency,
      active: false
    };
    setHabits([...habits, newHabit]);
  };

  const deleteHabit = (habitualEventId) => {
    fetch(`http://localhost:5000/habitual_events/${habitualEventId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
    .then(response => {
      if (response.ok) {
        fetchHabits(); // Refresh habitual events after successful deletion
      } else {
        throw new Error('Failed to delete habitual event');
      }
    })
    .catch(error => {
      console.error('Error deleting habitual event:', error);
    });
  };
  

  const handleCheckboxChange = (habitId) => {
    const updatedHabits = habits.map(habit =>
      habit.id === habitId ? { ...habit, active: !habit.active } : habit
    );
    setHabits(updatedHabits);
  };

  return (
    <div>
      <h1 style={{fontFamily:'nunito', padding:'2%', fontSize: "xxx-large", fontWeight: 800, margin:'1%'}}>Your Habits</h1>

      <div style={{ display: 'flex', flexWrap: 'wrap',padding:'3%' , fontFamily:'nunito'}}>
        {habits.map(habit => (
          <HabitCard key={habit.id} habit={habit} onDelete={() => deleteHabit(habit.id)} />
        ))}

        <ButtonCard onAdd={addHabit} />
      </div>
    </div>
  );
};

export default Habits;

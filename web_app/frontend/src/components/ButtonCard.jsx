import React, { useState } from 'react';
import { Card, Form, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import './buttoncard.css'

const ButtonCard = ({ onAdd }) => {
  const [editable, setEditable] = useState(false);
  const [habitTitle, setHabitTitle] = useState('');
  const [habitDescription, setHabitDescription] = useState('');
  const [habitDuration, setHabitDuration] = useState('');
  const [habitFrequency, setHabitFrequency] = useState('daily'); // Default frequency
  const [energy, setEnergy] = useState('');
  const [priority, setPriority] = useState('');

  const handleCardClick = () => {
    setEditable(true);
  };

  const handleCancelClick = () => {
    setEditable(false);
    setHabitTitle('');
    setHabitDescription('');
    setHabitDuration('');
    setHabitFrequency('daily');
    setEnergy('');
    setPriority('');
  };

  const handleAddHabit = () => {
    const habitData = {
      habitTitle,
      habitDescription,
      habitDuration,
      habitFrequency,
      energy,
      priority,
    }
    fetch('http://localhost:5000/create_habit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`, // Include JWT token for authentication
      },
      body: JSON.stringify(habitData)
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log('Habit added successfully:', data);
        onAdd(habitTitle, habitDescription, habitDuration, habitFrequency);
        setEditable(false);
        setHabitTitle('');
        setHabitDescription('');
        setHabitDuration('');
        setHabitFrequency('daily'); // Reset frequency to default
      })
      .catch(error => {
        console.error('Error adding habit:', error);
      });
    setEditable(false);
    setHabitTitle('');
    setHabitDescription('');
    setHabitDuration('');
    setHabitFrequency('daily')
  };

  return (
    <Card
      style={{
        width: 'max-content',
        minWidth: '20rem',
        margin: '10px',
        padding: '20px',
        textAlign: 'center',
        backgroundColor: '#e1e1e1e1',
        border: '1px solid #ced4da',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        gap: '15px',
        cursor: editable ? 'auto' : 'pointer', // Disable pointer cursor when editable
      }}
      
      onClick={editable ? null : handleCardClick} // Disable click event when editable
    >
      {!editable && (
        <FontAwesomeIcon icon={faPlus} style={{ position: 'relative', transform: "scale(2)" }} />
      )}
      <Card.Text>Add Habit</Card.Text>
      {editable && (
        <div style={{display: "flex", flexDirection: "column", gap: "5px"}}>
          <Form.Control
            type="text"
            placeholder="Enter habit title"
            value={habitTitle}
            onChange={(e) => setHabitTitle(e.target.value)}
          />
          <Form.Control
            as="textarea"
            rows={2}
            placeholder="Enter habit description"
            value={habitDescription}
            onChange={(e) => setHabitDescription(e.target.value)}
          />
          <Form.Control
            type="text"
            placeholder="Enter duration"
            value={habitDuration}
            onChange={(e) => setHabitDuration(e.target.value)}
          />
          <Form.Group className='radio-group'>
            <Form.Check
              inline
              type="radio"
              label="Daily"
              name="habitFrequency"
              value="daily"
              id='daily'
              checked={habitFrequency === 'daily'}
              onChange={(e) => setHabitFrequency(e.target.value)}
            />
            <Form.Check
              inline
              type="radio"
              label="Weekly"
              name="habitFrequency"
              value="weekly"
              id='weekly'
              checked={habitFrequency === 'weekly'}
              onChange={(e) => setHabitFrequency(e.target.value)}
            />
            <Form.Check
              inline
              type="radio"
              label="Biweekly"
              name="habitFrequency"
              value="biweekly"
              id='biweekly'
              checked={habitFrequency === 'biweekly'}
              onChange={(e) => setHabitFrequency(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="energy">
        <Form.Label>Energy:</Form.Label>
        <div className="radio-group">
          <Form.Check
            type="radio"
            id="energy-low"
            name="energy"
            value="1"
            label="Low"
            checked={energy === "1"}
            onChange={(e) => setEnergy(e.target.value)}
          />
          <Form.Check
            type="radio"
            id="energy-medium"
            name="energy"
            value="2"
            label="Medium"
            checked={energy === "2"}
            onChange={(e) => setEnergy(e.target.value)}
          />
          <Form.Check
            type="radio"
            id="energy-high"
            name="energy"
            value="3"
            label="High"
            checked={energy === "3"}
            onChange={(e) => setEnergy(e.target.value)}
          />
        </div>
      </Form.Group>

      <Form.Group controlId="priority">
        <Form.Label>Priority:</Form.Label>
        <div className="radio-group">
          <Form.Check
            type="radio"
            id="priority-low"
            name="priority"
            value="1"
            label="Low"
            checked={priority === "1"}
            onChange={(e) => setPriority(e.target.value)}
          />
          <Form.Check
            type="radio"
            id="priority-medium"
            name="priority"
            value="2"
            label="Medium"
            checked={priority === "2"}
            onChange={(e) => setPriority(e.target.value)}
          />
          <Form.Check
            type="radio"
            id="priority-high"
            name="priority"
            value="3"
            label="High"
            checked={priority === "3"}
            onChange={(e) => setPriority(e.target.value)}
          />
        </div>
      </Form.Group>

          <Button variant="success" style={{backgroundColor:'#ff4700', border:'none'}} onClick={handleAddHabit}>Save</Button>{' '}
          <Button variant="secondary" onClick={handleCancelClick}>Cancel</Button>
        </div>
      )}
    </Card>
  );
};

export default ButtonCard;


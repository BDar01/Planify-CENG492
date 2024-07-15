import React, { useState } from 'react';
import './IncompleteEventsPopup.css';

const IncompleteEventsPopup = ({ events, onClose, onSubmit }) => {
  const [selectedEvents, setSelectedEvents] = useState([]);

  const handleCheckboxChange = (event) => {
    setSelectedEvents((prevSelected) => {
      if (prevSelected.some(selectedEvent => selectedEvent.id === event.id)) {
        // Event is already selected, so remove it from selectedEvents
        return prevSelected.filter(selectedEvent => selectedEvent.id !== event.id);
      } else {
        // Event is not selected, so add it to selectedEvents
        return [...prevSelected, event];
      }
    });
  };

  const handleSubmit = () => {
      const selectedEventIds = selectedEvents.map(event => event.id);
      const unselectedEvents = events.filter(event => !selectedEventIds.includes(event.id));
      console.log('selectedEvents value: ', selectedEvents)
    onSubmit(selectedEvents, unselectedEvents);
  };

  return (
    <div className='popup-overlay'>
      <div className="popup">
        <div className="popup-inner">
          <h2 className='select-complete'>Select Completed Events</h2>
          <h5 className='others-resc'>(others will be rescheduled)</h5>
          <ul>
            {events.map((event) => (
              <li key={event.id}>
                <label className='label-for-popup'>
                  <div>{event.name} - {event.fixedStart}</div>
                  <input
                    className='checkbox'
                    type="checkbox"
                    checked={selectedEvents.some(selectedEvent => selectedEvent.id === event.id)}
                    onChange={() => handleCheckboxChange(event)}
                  />
                </label>
              </li>
            ))}
          </ul>
          <button className="s-button" onClick={handleSubmit}>Submit</button>
          <button className="cancel-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default IncompleteEventsPopup;

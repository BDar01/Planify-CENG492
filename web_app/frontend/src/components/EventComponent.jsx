import React, { useState, useEffect } from 'react';

const primaryColors = [
  { r: 255, g: 71, b: 0 },   // #FF4700
  { r: 255, g: 87, b: 34 },  // #FF5722
  { r: 255, g: 99, b: 71 },  // #FF6347
  { r: 255, g: 112, b: 67 }  // #FF7043
];

const secondaryColors = [
  { r: 255, g: 204, b: 0 },   // Darker shade of yellow #FFCC00
  { r: 255, g: 194, b: 0 },   // Darker shade of yellow #FFC200
  { r: 255, g: 183, b: 0 },   // Darker shade of yellow #FFB700
  { r: 255, g: 170, b: 0 }    // Darker shade of yellow #FFAA00
];

const tertiaryColors = [
  { r: 0, g: 184, b: 255 },  // #00B8FF
  { r: 0, g: 170, b: 255 },  // #00AAFF
  { r: 0, g: 160, b: 240 },  // #00A0F0
  { r: 0, g: 200, b: 255 }   // #00C8FF
];

const getRandomColorFromSet = (colorSet) => {
  const randomIndex = Math.floor(Math.random() * colorSet.length);
  return colorSet[randomIndex];
};

const getCurrentWeekStartDate = () => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0: Sunday, 1: Monday, ..., 6: Saturday
  const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust to Monday if today is Sunday
  return new Date(today.setDate(diff));
};

const EventComponent = ({ event, setLoadData }) => {
  const [showReschedule, setShowReschedule] = useState(false);
  const [showAll, setShowAll] = useState(true);
  const [eventColor, setEventColor] = useState(getRandomColorFromSet(tertiaryColors));
  const [isClicked, setIsClicked] = useState(false);


  useEffect(() => {
    const storedColor = localStorage.getItem(`eventColor_${event.id}`);
    if (storedColor) {
      setEventColor(JSON.parse(storedColor));
    } else {
      let color;
      if (event.priority === 3) {
        color = getRandomColorFromSet(primaryColors);
      } else if (event.priority === 2) {
        color = getRandomColorFromSet(secondaryColors);
      } else {
        color = getRandomColorFromSet(tertiaryColors);
      }
      setEventColor(color);
      localStorage.setItem(`eventColor_${event.id}`, JSON.stringify(color));
    }
  }, [event]);

  const handleClick = () => {
    setIsClicked(!isClicked);
    setShowReschedule(!showReschedule);
  };

  const handleRescheduleClick = async () => {
    try {
      const response = await fetch('http://localhost:5000/reschedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Include JWT token for authentication
        },
        body: JSON.stringify(event)
      });
      if (response.ok) {
        setLoadData(true);
        console.log('Event rescheduled successfully!');
      } else {
        console.error('Failed to reschedule event:', response.statusText);
      }
    } catch (error) {
      console.error('Error while rescheduling event:', error);
    }
  };

  const startHour = new Date(event.fixedStart).getHours();
  const startDay = new Date(event.fixedStart).getDay();
  const endHour = new Date(event.fixedEnd).getHours();
  const endDay = new Date(event.fixedEnd).getDay();

  const numHours = (endDay - startDay) * 24 + (endHour - startHour) + 1;
  const widthPercentage = (numHours / 24) * 100;
  const topPercentage = ((startHour * 60) / 1440) * 100;

  const color = eventColor; // eventColor is guaranteed to be set
  const darkerColor = {
    r: Math.max(0, color.r - 20),
    g: Math.max(0, color.g - 20),
    b: Math.max(0, color.b - 20)
  };

  return (
    <>
      {showAll && (
        <div
          className="event-container"
          style={{
            position: 'relative',
            justifyContent: 'left',
            width: '100%',
            height: `${100 * event.duration}%`,
            top: `${(event.duration - 1) * 50}%`,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <div
            onClick={handleClick}
            className="event"
            style={{
              position: 'relative',
              minWidth: '100%',
              backgroundColor: `rgba(${color.r}, ${color.g}, ${color.b}, 0.3)`,
              borderRadius: "5px",
              borderLeft: `5px solid rgba(${darkerColor.r}, ${darkerColor.g}, ${darkerColor.b}, 1)`,
              padding: '10px',
              justifyContent: 'center',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              color: `rgba(${darkerColor.r}, ${darkerColor.g}, ${darkerColor.b}, 1)`,
              fontWeight: '500',
              fontSize: 'medium',
              boxShadow: isClicked ? 'rgb(97 97 97 / 44%) 3px 3px 10px 0px' : 'none',
              transition: 'box-shadow 0.3s ease',

            }}
          >
            {event.name}
          </div>
          {showReschedule && (
            <button
              className="reschedule-button"
              style={{
                position: 'relative',
                minWidth: '100%',
                backgroundColor: `rgba(${color.r+50}, ${color.g+50}, ${color.b+50},1)`,
                borderRadius: '6px',
                border: `2px solid rgba(${color.r}, ${color.g}, ${color.b}, 0.9)`,
                padding: '0px',
                justifyContent: 'center',
                display: 'flex',
                alignItems: 'center',
                top: '20%',
                right: '40%',
                zIndex: '9999',
                color: `rgba(${darkerColor.r}, ${darkerColor.g}, ${darkerColor.b}, 1)`
              }}
              onClick={(e) => {
                e.stopPropagation();
                console.log('clicked reschedule');
                setShowReschedule(false);
                setShowAll(false);
                handleRescheduleClick();
              }}
            >
              Reschedule
            </button>
          )}
        </div>
      )}
    </>
  );
};

export default EventComponent;

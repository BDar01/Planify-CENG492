import React from 'react';
import classNames from 'classnames';
import EventComponent from './EventComponent'; // Adjust this import to match your file structure

const TimeSlotGrid = ({ daysOfWeek, events, setLoadData, colStartClasses, getDay }) => {
  // Get active hours from local storage
  const activeHours = JSON.parse(localStorage.getItem('activeHours')) || { start: 7, end: 21 };

  const { start: activeStartHour, end: activeEndHour } = activeHours;

  return (
    <div className="grid grid-cols-8 text-sm">
      {/* Render time slots for each hour within the active hours */}
      {Array.from({ length: activeEndHour - activeStartHour + 1 }).map((_, hourIdx) => {
        const hour = activeStartHour + hourIdx;
        return (
          <React.Fragment key={hour}>
            {/* Render the hour label */}
            <div className="times flex items-center justify-center h-12">{hour}:00</div>
            {/* Render time slots for each day */}
            {daysOfWeek.map((day, dayIdx) => (
              <div
                key={`${dayIdx}-${hour}`}
                className={classNames(
                  'timeslots border-gray-200 flex items-center justify-center group h-12',
                  dayIdx === 0 && colStartClasses[getDay(day)],
                  `day-${dayIdx}-hour-${hour}`,
                )}
              >
                {events.map((event) => {
                  // Extract start hour from event start time
                  const startHour = new Date(event.fixedStart).getHours();
                  let startDay = new Date(event.fixedStart).getDay();
                  startDay = startDay === 0 ? 6 : startDay - 1;

                  // Check if start hour matches the current hour index
                  if (startHour === hour && startDay === dayIdx) {
                    return (
                      <EventComponent key={event.id} event={event} setLoadData={setLoadData} />
                    );
                  } else {
                    return null; // Render nothing if start hour doesn't match
                  }
                })}
              </div>
            ))}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default TimeSlotGrid;

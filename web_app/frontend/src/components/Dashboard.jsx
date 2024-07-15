import React, { useState, useEffect, useRef} from 'react';
import { Menu, Transition } from '@headlessui/react';
import { DotsVerticalIcon } from '@heroicons/react/outline';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/solid';
import { Card, Accordion, Button, CloseButton} from 'react-bootstrap';

import Sidebar from './Sidebar'; // Import the App component
import './indexsidebar.css'; // Import the CSS file


import {
  add,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isEqual,
  isSameDay,
  isSameMonth,
  isToday,
  parse,
  parseISO,
  startOfToday,
  addDays,
  startOfWeek,
  subWeeks,
  addWeeks,
  endOfWeek,
} from 'date-fns';
import { Fragment } from 'react';
import UserData from './UserData'; // Import the Test component
import { useNavigate } from 'react-router-dom';
import './eventscontainer.css';
import EventComponent from './EventComponent';
import updateGridWithEvents from './updateGrid';
import EventsList from './EventsList';
import TimeSlotGrid from './TImeSlotGrid';
import IncompleteEventsPopup from './IncompleteEventsPopup';

const meetings = [
  {
    id: 1,
    name: 'Leslie Alexander',
    imageUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    startDatetime: '2024-03-12T13:00',
    endDatetime: '2024-03-12T14:30',
  },
  {
    id: 2,
    name: 'Michael Foster',
    imageUrl:
      'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    startDatetime: '2024-03-12T09:00',
    endDatetime: '2022-05-20T11:30',
  },
  {
    id: 3,
    name: 'Dries Vincent',
    imageUrl:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    startDatetime: '2024-03-13T17:00',
    endDatetime: '2024-03-13T18:30',
  },
  {
    id: 4,
    name: 'Leslie Alexander',
    imageUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    startDatetime: '2024-03-25T13:00',
    endDatetime: '2024-03-25T14:30',
  },
  {
    id: 5,
    name: 'Michael Foster',
    imageUrl:
      'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    startDatetime: '2024-03-09T14:00',
    endDatetime: '2024-03-09T14:30',
  },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}



function AddEventForm({ onClose, onAddEvent, setLoadData }) {
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [deadline, setDeadline] = useState('');
  const [energy, setEnergy] = useState('');
  const [priority, setPriority] = useState('');
  const [fixedStartDate, setFixedStartDate] = useState('');
  const [fixedEndDate, setFixedEndDate] = useState('');
  const [eventType, setEventType] = useState('');
  const [dependency, setDependency] = useState('');
  const [flexible, setFlexible] = useState('');
  const [showOptional, setShowOptional] = useState(false);



  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    // Construct the event data object
    const eventData = {
      name,
      duration,
      energy,
      priority,
      deadline,
      fixed_start: fixedStartDate,
      fixed_end: fixedEndDate,
      event_type: eventType,
      dependency,
      flexible,
    };

    // Send a POST request to the server with the event data
    try {
      const response = await fetch('http://localhost:5000/addevent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Include JWT token for authentication
        },
        body: JSON.stringify(eventData),
      });

      if (response.ok) {
        const data = await response.json();
        // Handle successful response, e.g., show a success message
        console.log('Event added successfully:', data);
        
        const eventsJSON = JSON.stringify(data);

        // Store the JSON string in localStorage under a specific key, such as 'events'
        if (localStorage.getItem('events')) {
          // If the key exists, remove it to clear the events
          localStorage.removeItem('events');
        }
        localStorage.setItem('events', eventsJSON);
        setLoadData(true)
        resetForm();
        // set should load data
        //window.location.reload(); // remove this


      } else {
        // Handle error response
        console.error('Error adding event:', response.statusText);
      }
    } catch (error) {
      // Handle network error
      console.error('Network error:', error.message);
    }
  };
  // Function to handle form submission
  const resetForm = () => {
    setName('');
    setDuration('');
    setEnergy('');
    setPriority('');
    setDeadline('');
    setFixedStartDate('');
    setFixedEndDate('');
    setEventType('');
    setDependency('');
    setFlexible('');
  
    // Close the form
    onClose();
  };


  const toggleOptionalFields = () => {
    setShowOptional(!showOptional);
  };

  return (
    <div className="modal">
      <div className="modal-content">
      <CloseButton className='close' onClick={onClose} />
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name:</label>
            <input type="text" id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} required />
            <label htmlFor="duration">Duration (in hrs):</label>
            <input type="number" id="duration" name="duration" value={duration} onChange={(e) => setDuration(e.target.value)} required />
            <div>
              <label>Energy:</label>
              <div className="radio-group">
                <input type="radio" id="energy-low" name="energy" value="1" checked={energy === "1"} onChange={(e) => setEnergy(e.target.value)} />
                <label htmlFor="energy-low">Low</label>

                <input type="radio" id="energy-medium" name="energy" value="2" checked={energy === "2"} onChange={(e) => setEnergy(e.target.value)} />
                <label htmlFor="energy-medium">Medium</label>

                <input type="radio" id="energy-high" name="energy" value="3" checked={energy === "3"} onChange={(e) => setEnergy(e.target.value)} />
                <label htmlFor="energy-high">High</label>
              </div>
            </div>
            <div>
              <label>Priority:</label>
              <div className="radio-group">
                <input type="radio" id="priority-low" name="priority" value="1" checked={priority === "1"} onChange={(e) => setPriority(e.target.value)} />
                <label htmlFor="priority-low">Low</label>

                <input type="radio" id="priority-medium" name="priority" value="2" checked={priority === "2"} onChange={(e) => setPriority(e.target.value)} />
                <label htmlFor="priority-medium">Medium</label>

                <input type="radio" id="priority-high" name="priority" value="3" checked={priority === "3"} onChange={(e) => setPriority(e.target.value)} />
                <label htmlFor="priority-high">High</label>
              </div>
            </div>
            <div>
              <label htmlFor="flexible">Allow to be rescheduled as events added</label>
              <div className="radio-group">
                <input type="radio" id="flexible" name="flexible" value="True" checked={flexible === "True"} onChange={(e) => setFlexible(e.target.value)} />
                <label htmlFor="flexible">Yes</label>

                <input type="radio" id="nonflexible" name="nonflexible" value="False" checked={flexible === "False"} onChange={(e) => setFlexible(e.target.value)} />
                <label htmlFor="nonflexible">No</label>
              </div>
            </div>
            <Accordion>
           
                
                <Button variant='primary' className='optional-field-head' onClick={toggleOptionalFields}>
                    {showOptional ? 'Hide Optional Fields' : 'Show Optional Fields'}
                  </Button>
                <Card>
                {showOptional && (
                  <Card.Body>
                    <label htmlFor="deadline">Deadline:</label>
                    <input type="datetime-local" id="deadline" name="deadline" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
                    <label htmlFor="fixed_start">Fixed Start Date:</label>
                    <input type="datetime-local" id="fixed_start" name="fixed_start" value={fixedStartDate} onChange={(e) => setFixedStartDate(e.target.value)} />
                    <label htmlFor="fixed_end">Fixed End Date:</label>
                    <input type="datetime-local" id="fixed_end" name="fixed_end" value={fixedEndDate} onChange={(e) => setFixedEndDate(e.target.value)} />
                    <label htmlFor="event_type">Event Type:</label>
                    <input type="text" id="event_type" name="event_type" value={eventType} onChange={(e) => setEventType(e.target.value)} />
                    <label htmlFor="dependency">Dependency:</label>
                    <input type="text" id="dependency" name="dependency" value={dependency} onChange={(e) => setDependency(e.target.value)} />
                  </Card.Body>
                )}
              </Card>
            </Accordion>
          </div>
          <button type="submit">Add</button>
        </form>
      </div>
    </div>
  );
}


function MonthlySchedule({ days, selectedDay, setSelectedDay, handleDayClick, firstDayCurrentMonth}) {
  return (
    <div className="bg-white rounded-lg p-4 shadow-md ">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900">
          {format(firstDayCurrentMonth, 'MMMM yyyy')}
        </h2>
      </div>
      <div className="grid grid-cols-7 text-xs leading-6 text-center text-gray-500">
        <div>S</div>
        <div>M</div>
        <div>T</div>
        <div>W</div>
        <div>T</div>
        <div>F</div>
        <div>S</div>
      </div>
      <div className="grid grid-cols-7 mt-2 text-sm">
        {days.map((day, dayIdx) => (
          <div
          key={day.toString()}
          className={classNames(
            dayIdx === 0 && colStartClasses[getDay(day)],
            'py-1.5'
          )}
          >

          <button
            key={day.toString()}
            onClick={() =>  handleDayClick(day)}
            className={classNames(
              isEqual(day, selectedDay) && 'text-white bg-[#FF4700]',
              !isEqual(day, selectedDay) &&
                isToday(day) &&
                'text-red-500',
              !isEqual(day, selectedDay) &&
                !isToday(day) &&
                isSameMonth(day, firstDayCurrentMonth) &&
                'text-gray-900',
              // !isEqual(day, selectedDay) &&
              //   !isToday(day) &&
              //   !isSameMonth(day, days[0]) &&
              //   'text-gray-400',
              !isEqual(day, selectedDay) &&
              !isToday(day) &&
              !isSameMonth(day, firstDayCurrentMonth) &&
              'text-gray-400',
              isEqual(day, selectedDay) && isToday(day) && 'bg-[#ff4700]',
              isEqual(day, selectedDay) && !isToday(day) && 'bg-gray-900',
              !isEqual(day, selectedDay) && 'hover:bg-gray-200',
              (isEqual(day, selectedDay) || isToday(day)) && 'font-semibold',
              'h-8 w-8 flex items-center justify-center rounded-full'
            )}
          >
            {format(day, 'd')}
          </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Dashboard() {
  // Monthly Calendar State
  const [events, setEvents] = useState([]);
  const [incompleteEvents, setIncompleteEvents] = useState([]);

  const [viewMode, setViewMode] = useState('weekly');
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [isEventsModalOpen, setIsEventsModalOpen] = useState(false);
  const hasFetchedData = useRef(false);
	const navigate = useNavigate();
  const [loadData, setLoadData] = useState(true);
  const [showPopup, setShowPopup] = useState(false);


  const fetchUserEvents = async () => {
    try {
      // Calculate start and end dates of the selected week
      const startDate = fristDayOfCurrentWeek;
      const endDate = endOfWeek(startDate, { weekStartsOn: 1 });

      // Make a request to fetch user events from the backend
      const response = await fetch('http://localhost:5000/userdata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Include JWT token for authentication
        },
        body: JSON.stringify({
          startDate,
          endDate,
        }),
      });

      if (response.ok) {
        // If the request is successful, parse the response JSON
        const data = await response.json();
        console.log(data)
        // set events = data.events TODO
        // Update the events state with the fetched events
        setEvents(data.events);
        // updateGridWithEvents(data.events);
      } else {
        // Handle errors if the request fails
        console.error('Failed to fetch user events:', response.statusText);
      }
    } catch (error) {
      // Handle network errors
      console.error('Network error:', error.message);
    }
  };

 
  let today = startOfToday();
  let [selectedDay, setSelectedDay] = useState(today);
  let [currentMonth, setCurrentMonth] = useState(format(today, 'MMM-yyyy'));
  let [startDateCurrentWeek, setStartDateOfWeek] = useState(
    format(startOfWeek(today, {weekStartsOn: 1}), 'ddd-MMM-yyyy')
  );

  let fristDayOfCurrentWeek = parse(startDateCurrentWeek, 'ddd-MMM-yyyy', new Date());

  let firstDayCurrentMonth = parse(currentMonth, 'MMM-yyyy', new Date());
  let startDate = startOfWeek(fristDayOfCurrentWeek, {weekStartsOn: 1});
  let endDate = endOfWeek(fristDayOfCurrentWeek, {weekStartsOn: 1});
  let dayOfWeek = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });
  let [daysOfWeek, setDaysOfWeek] = useState(dayOfWeek);
  let days = eachDayOfInterval({
    start: startOfWeek(firstDayCurrentMonth),
    end: endOfWeek(endOfMonth(firstDayCurrentMonth)),
  });
  
  
  useEffect(() => {
    const hasShownPopup = localStorage.getItem('hasShownPopup');

    if (!hasShownPopup) {
      // Fetch incomplete events from the backend
      fetch('http://localhost:5000/incompleteEvents',
    {method: "GET",
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`, // Include JWT token for authentication
    }},
    )
        .then((response) => response.json())
        .then((data) => {
          if (data.events.length){
            setIncompleteEvents(data.events);
            setShowPopup(true);}
        });
    }
  }, []);

  const handleClosePopup = () => {
    setShowPopup(false);
    localStorage.setItem('hasShownPopup', 'true'); // Set the flag in local storage
  };

  const handleSubmitcompleteEvents = (selectedEvents, unselectedEvents) => {
    // Update events on the backend
    const request_body = {
      completed : selectedEvents,
      reschedule : unselectedEvents,
    }
    console.log(request_body)
    fetch('http://localhost:5000/update_all_completion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Include JWT token for authentication
        },
      body: JSON.stringify( request_body ),
    }).then((response) => {
      if (response.ok) {
        console.log(response.json())
        // Update the state to reflect the changes
        // setEvents((prevEvents) =>
        //   prevEvents.map((event) =>
        //     selectedEvents.includes(event.id)
        //       ? { ...event, status: 'rescheduled' }
        //       : { ...event, status: 'completed' }
        //   )
        // );
        setShowPopup(false);
        localStorage.setItem('hasShownPopup', 'true'); // Set the flag in local storage
        setLoadData(true);  
      }
    });
  };
  useEffect(() => {
    // Function to fetch user events from the backend
    if(loadData){
      
      fetchUserEvents();  
      hasFetchedData.current = true;
      setLoadData(false);
    
    }
  }, [loadData, startDateCurrentWeek]);
  

  useEffect(() => {
    // Retrieve token from local storage
    const token = localStorage.getItem('token');
    if (!token) {
      // If token is not found, redirect to login page
      navigate('/signin');
    } else {
     console.log(token)
    }
  }, []);
  const handleDayClick = (day) => {
    // Perform the first operation
    setSelectedDay(day);
    console.log(day);
    updateCurrentWeek(day);
    // Perform the second operation
    // Add more operations here as needed
  };
  function previousMonth() {
    let firstDayNextMonth = add(firstDayCurrentMonth, { months: -1 });
    setCurrentMonth(format(firstDayNextMonth, 'MMM-yyyy'));
  }

  function nextMonth() {
    let firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 });
    setCurrentMonth(format(firstDayNextMonth, 'MMM-yyyy'));
  }

  let selectedDayMeetings = meetings.filter((meeting) =>
    isSameDay(parseISO(meeting.startDatetime), selectedDay)
  );

  function updateCurrentWeek(day){
    let firstDayOfUpdatedWeek = startOfWeek(day, {weekStartsOn: 1});
    let lastDayOfUpdateWeek = endOfWeek(day, {weekStartsOn: 1});
    let dayOfUpdatedWeek = eachDayOfInterval({
      start: firstDayOfUpdatedWeek,
      end: lastDayOfUpdateWeek,
    });
    console.log(dayOfUpdatedWeek);
    setStartDateOfWeek(format(firstDayOfUpdatedWeek, 'ddd-MMM-yyyy'));
    setDaysOfWeek(dayOfUpdatedWeek);
    console.log(daysOfWeek);
  }
  function previousWeek() {
    let firstDayPrevWeek = add(fristDayOfCurrentWeek, {weekStartsOn: 1,  days: -7 });
    let lastDayPrevWeek = endOfWeek(firstDayPrevWeek, {weekStartsOn: 1});
    let dayOfPrevWeek = eachDayOfInterval({
      start: firstDayPrevWeek,
      end: lastDayPrevWeek,
    });
    setStartDateOfWeek(format(firstDayPrevWeek, 'ddd-MMM-yyyy'));
    setDaysOfWeek(dayOfPrevWeek);
    setLoadData(true);
  }

  // Function to navigate to next week
  function nextWeek() {
    console.log("clicked")
    let firstDayNextWeek = add(fristDayOfCurrentWeek, {weekStartsOn: 1,  days: 7 });
    let lastDayNextWeek = endOfWeek(firstDayNextWeek, {weekStartsOn: 1});
    let dayOfNextWeek = eachDayOfInterval({
      start: firstDayNextWeek,
      end: lastDayNextWeek,
    });
    setStartDateOfWeek(format(firstDayNextWeek, 'ddd-MMM-yyyy'));
    setDaysOfWeek(dayOfNextWeek);
    setLoadData(true);
  }

  const handleEventsButtonClick = () => {
    // Call navigate() when the button is clicked
    navigate('/EventsList'); // Replace '/new-page' with the path you want to navigate to
  };
  
  function handleAddEvent() {
    // Implement logic to open a modal or navigate to a new page for adding an event
    console.log("Add Event button clicked");
  }

  // Function to handle opening the Events modal
  function handleOpenEventsModal() {
    setIsEventsModalOpen(true);
  }
  
  return (
    <div className="mr-0">
       {/* Test component */}
       <div className="ml-auto">
          <UserData />
        </div>
        {showPopup && (
        <IncompleteEventsPopup
          events={incompleteEvents}
          onClose={handleClosePopup}
          onSubmit={handleSubmitcompleteEvents}
        />
      )}
      <div className="max-w-md px-4 mx-auto sm:px-7 md:max-w-4xl md:px-6 mt-8 grid gap-10" 
      style={{
        marginLeft: '0px',
        marginRight: '0px',
        gap: '40px',
        // width: 'max-content', // This line is commented out because 'max-content' needs to be a string
        display: 'grid',
        gridTemplateColumns: '4fr 1.3fr', // Two columns
        gridGap: '20px',
        maxWidth: '80em',
        padding: '0px',

      }}>
        


        {/* Events */}
        {/*<div className="events-container ml-auto">
          <h2 className="font-semibold text-gray-900">Events</h2>
          <div className="mt-4">
            {events.map((event, index) => (
              <div key={index} className="flex items-start justify-center space-x-2">
                <div className="font-semibold">{event.time}</div>
                <div>-</div>
                <div>{event.title}</div>
              </div>
            ))}
          </div>
            </div>*/}
        

        {/* Render the EventsModal component */}
        {isEventsModalOpen && (
          <EventsModal events={meetings} onClose={() => setIsEventsModalOpen(false)} />
        )}
   
        
        


        <div className="contain-cal">
        {/* Main schedules */}
        <div className="flex items-center">
          <button
            className={`${
              viewMode === 'monthly' ? 'bg-[#FF4700] text-white' : 'text-[#FF4700]'
            } px-4 py-2 rounded-l-md`}
            onClick={() => setViewMode('monthly')}
          >
            Monthly
          </button>
          <button
            className={`${
              viewMode === 'weekly' ? 'bg-[#FF4700] text-white' : 'text-[#FF4700]'
            } px-4 py-2 rounded-r-md`}
            onClick={() => {setViewMode('weekly'); fetchUserEvents()}}
          >
            Weekly
          </button>
          <button
            className={`${
              viewMode === 'daily' ? 'bg-[#FF4700] text-white' : 'text-[#FF4700]'
            } px-4 py-2 rounded-r-md`}
            onClick={() => setViewMode('daily')}
          >
            Daily
          </button>

          
        </div>
        
        

        {/* Monthly View */}
        {viewMode === 'monthly' && (
          <div>
            {/* Your existing monthly calendar code here */}
            <div className="md:pr-14">
              <div className="flex items-center">
                <h2 className="flex-auto font-semibold text-gray-900">
                  {format(firstDayCurrentMonth, 'MMMM yyyy')}
                </h2>
                <button
                  type="button"
                  onClick={previousMonth}
                  className="-my-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Previous month</span>
                  <ChevronLeftIcon className="w-5 h-5" aria-hidden="true" />
                </button>
                <button
                  onClick={nextMonth}
                  type="button"
                  className="-my-1.5 -mr-1.5 ml-2 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Next month</span>
                  <ChevronRightIcon className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>
              <div className="grid grid-cols-7 mt-10 text-xs leading-6 text-center text-gray-500">
                <div>S</div>
                <div>M</div>
                <div>T</div>
                <div>W</div>
                <div>T</div>
                <div>F</div>
                <div>S</div>
              </div>
              <div className="grid grid-cols-7 mt-2 text-sm">
                {days.map((day, dayIdx) => (
                  <div
                    key={day.toString()}
                    className={classNames(
                      dayIdx === 0 && colStartClasses[getDay(day)],
                      'py-1.5'
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => handleDayClick(day)}
                      className={classNames(
                        isEqual(day, selectedDay) && 'text-white',
                        !isEqual(day, selectedDay) &&
                          isToday(day) &&
                          'text-red-500',
                        !isEqual(day, selectedDay) &&
                          !isToday(day) &&
                          isSameMonth(day, firstDayCurrentMonth) &&
                          'text-gray-900',
                        !isEqual(day, selectedDay) &&
                          !isToday(day) &&
                          !isSameMonth(day, firstDayCurrentMonth) &&
                          'text-gray-400',
                        isEqual(day, selectedDay) && isToday(day) && 'bg-[#ff4700]',
                        isEqual(day, selectedDay) &&
                          !isToday(day) &&
                          'bg-gray-900',
                        !isEqual(day, selectedDay) && 'hover:bg-gray-200',
                        (isEqual(day, selectedDay) || isToday(day)) &&
                          'font-semibold',
                        'mx-auto flex h-8 w-8 items-center justify-center rounded-full'
                      )}
                    >
                      <time dateTime={format(day, 'yyyy-MM-dd')}>
                        {format(day, 'd')}
                      </time>
                    </button>

                    <div className="w-1 h-1 mx-auto mt-1">
                      {meetings.some((meeting) =>
                        isSameDay(parseISO(meeting.startDatetime), day)
                      ) && (
                        <div className="w-1 h-1 rounded-full bg-sky-500"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <section className="mt-12 md:mt-0 md:pl-14">
              <h2 className="font-semibold text-gray-900">
                Schedule for{' '}
                <time dateTime={format(selectedDay, 'yyyy-MM-dd')}>
                  {format(selectedDay, 'MMM dd, yyy')}
                </time>
              </h2>
              <ol className="mt-4 space-y-1 text-sm leading-6 text-gray-500">
                {selectedDayMeetings.length > 0 ? (
                  selectedDayMeetings.map((meeting) => (
                    <Meeting meeting={meeting} key={meeting.id} />
                  ))
                ) : (
                  <p>No meetings for today.</p>
                )}
              </ol>
            </section>
          </div>
        )}


        {/* Weekly View */}
{viewMode === 'weekly' && (
  <div className="weekly md:col-span-1">
    <div className="flex items-center">
      <h2 className="flex-auto font-semibold text-gray-900">
        {format(firstDayCurrentMonth, 'MMMM yyyy')}
      </h2>
      <button
        type="button"
        onClick={previousWeek}
        className="-my-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
      >
        <span className="sr-only">Previous week</span>
        <ChevronLeftIcon className="w-5 h-5" aria-hidden="true" />
      </button>
      <button
        onClick={nextWeek}
        type="button"
        className="-my-1.5 -mr-1.5 ml-2 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
      >
        <span className="sr-only">Next week</span>
        <ChevronRightIcon className="w-5 h-5" aria-hidden="true" />
      </button>
    </div>
    <div className="grid grid-cols-8 mt-10 text-xs leading-6 text-center text-gray-500">
      {/* hours */}
      <div></div>
      {/* Display days of the week */}
      {daysOfWeek.map((day, index) => (
        <div key={index}>
          <span>{format(day, 'EEE ')}</span>
          <span>{format(day, 'd')}</span>
        </div>
      ))}
    </div>

    {/* Render time slots */}
    < TimeSlotGrid 
        daysOfWeek={daysOfWeek}
        events={events}
        setLoadData={setLoadData}
        colStartClasses={colStartClasses}
        getDay={getDay} />
    
  </div>
)}




        {/*daily view*/}
        {viewMode === 'daily' && (
          <div className="md:col-span-1">
            <h2 className="font-semibold text-gray-900">{format(selectedDay, 'MMMM d, yyyy')}</h2>
            <o1 className="mt-4 space-y-1 text-sm leading-6 text-gray-500">
              {selectedDayMeetings.length > 0 ? (
                selectedDayMeetings.map((meeting) => (
                  <Meeting meeting={meeting} key={meeting.id} />
                ))
                
              ) : (
                <p>No meetings for today.</p>
              )}
            </o1>
          </div>
        )}
        </div>
        <div className='contain-events-addevent'>
          <div className="events-container ml-auto">
            <button
              className="bg-[#FF4700] text-white px-4 py-2 rounded-md mt-4 ml-auto"
              onClick={handleEventsButtonClick}
            >
              All Events
            </button>
          </div>
          

          {/* Add Event button */}
          <button
            className="bg-[#FF4700] text-white px-4 py-2 rounded-md mt-4 ml-auto"
            onClick={() => {setIsAddEventModalOpen(true); console.log('clicked!')}}
          >
            Add Event
          </button>

          {/* Render AddEventForm if modal is open */}
          {isAddEventModalOpen && (
            <AddEventForm onClose={() => setIsAddEventModalOpen(false)} onAddEvent={handleAddEvent}  setLoadData={setLoadData}/>
          )}

        {/* Monthly view little*/}
        <div className = "mr-auto py-3">
          <MonthlySchedule
            days = {days}
            selectedDay = {selectedDay}
            setSelectedDay={setSelectedDay}
            handleDayClick={handleDayClick}
            firstDayCurrentMonth={firstDayCurrentMonth}
            />    
        </div>

          



        </div>
      </div>
      
    </div>
  );
}

function Meeting({ meeting }) {
  let startDateTime = parseISO(meeting.startDatetime);
  let endDateTime = parseISO(meeting.endDatetime);

  return (
    <li className="flex items-center px-4 py-2 space-x-4 group rounded-xl focus-within:bg-gray-100 hover:bg-gray-100">
      <img
        src={meeting.imageUrl}
        alt=""
        className="flex-none w-10 h-10 rounded-full"
      />
      <div className="flex-auto">
        <p className="text-gray-900">{meeting.name}</p>
        <p className="mt-0.5">
          <time dateTime={meeting.startDatetime}>
            {format(startDateTime, 'h:mm a')}
          </time>{' '}
          -{' '}
          <time dateTime={meeting.endDatetime}>
            {format(endDateTime, 'h:mm a')}
          </time>
        </p>
      </div>
      <Menu
        as="div"
        className="relative opacity-0 focus-within:opacity-100 group-hover:opacity-100"
      >
        <div>
          <Menu.Button className="-m-2 flex items-center rounded-full p-1.5 text-gray-500 hover:text-gray-600">
            <span className="sr-only">Open options</span>
            <DotsVerticalIcon className="w-6 h-6" aria-hidden="true" />
          </Menu.Button>
        </div>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 z-10 mt-2 origin-top-right bg-white rounded-md shadow-lg w-36 ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">
              <Menu.Item>
                {({ active }) => (
                  <a
                    href="#"
                    className={classNames(
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                      'block px-4 py-2 text-sm'
                    )}
                  >
                    Edit
                  </a>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <a
                    href="#"
                    className={classNames(
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                      'block px-4 py-2 text-sm'
                    )}
                  >
                    Cancel
                  </a>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </li>
   
  );
}

let colStartClasses = [
  '',
  'col-start-2',
  'col-start-3',
  'col-start-4',
  'col-start-5',
  'col-start-6',
  'col-start-7',
];
export default Dashboard;

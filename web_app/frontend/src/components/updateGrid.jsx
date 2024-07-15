const getRandomColor = () => {
    // Generate random values for red, green, and blue components within a range suitable for pastel colors
    const red = Math.floor(Math.random() * 156) + 100; // Range: 100-255
    const green = Math.floor(Math.random() * 156) + 100; // Range: 100-255
    const blue = Math.floor(Math.random() * 156) + 100; // Range: 100-255
    
    // Construct the color string in hexadecimal notation
    const color = { r: red, g: green, b: blue }; // Return as an object with separate components
  
    return color;
};

const getCurrentWeekStartDate = () => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0: Sunday, 1: Monday, ..., 6: Saturday
  const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust to Monday if today is Sunday
  return new Date(today.setDate(diff));
};


const updateGridWithEvents = (events) => {
  
    if (events && events.length > 0) {
      events.forEach((event) => {
        console.log("fixed start ",event.fixedStart)
        const eventStartDate = new Date(event.fixedStart);
        const eventEndDate = new Date(event.fixedEnd);
        const currentWeekStartDate = getCurrentWeekStartDate();
        // Check if the event falls within the current week
        if (
          eventStartDate >= currentWeekStartDate &&
          eventStartDate < new Date(currentWeekStartDate).setDate(currentWeekStartDate.getDate() + 7)
        ){
        let startHour = new Date(event.fixedStart).getHours();
        let startDay = new Date(event.fixedStart).getDay();
        const endHour = new Date(event.fixedEnd).getHours();
        const endDay = new Date(event.fixedEnd).getDay();
        
        console.log("start day, hour  : ", startDay, " ", startHour);
        console.log("end day, hour  : ", endDay, " ", endHour);
        startDay = (startDay === 0) ? 6 : startDay - 1;

        const color = getRandomColor();
  
        const eventClass = `event${event.id}`;
        
        // Calculate the width of the event div to cover the appropriate number of hour slots
        const numHours = (endDay - startDay) * 24 + (endHour - startHour) + 1;
        const widthPercentage = (numHours / 24) * 100;
        const eventContainer = document.createElement('div');
        eventContainer.className = 'event-container';
        // Create the event div
        const newDiv = document.createElement('div');
        newDiv.className = eventClass;
        newDiv.textContent = event.name;
        newDiv.style.backgroundColor = `rgba(${color.r}, ${color.g}, ${color.b}, 0.5)`; // Set background color with alpha
        newDiv.style.borderRadius = '10px';
        newDiv.style.width = '100em';
        newDiv.style.height = `${100*event.duration}%`;
        newDiv.style.display = 'flex';
        newDiv.style.alignItems = 'center';
        newDiv.style.justifyContent = 'center';
        newDiv.style.position = 'relative';
        newDiv.style.top = `${(event.duration-1)*50}%`;
        newDiv.style.padding = "10px";
        newDiv.style.border = `2px solid rgba(${color.r}, ${color.g}, ${color.b}, 0.9)`; // Set border color without alpha
        eventContainer.appendChild(newDiv);

        // Append the container to the hour element
        
        const rescheduleButton = document.createElement('button');
        rescheduleButton.textContent = 'Reschedule';
        rescheduleButton.className = 'reschedule-button';
        rescheduleButton.style.position = 'relative';
        newDiv.addEventListener('click', (ee) => {
          ee.stopPropagation(); // Prevent the click event from bubbling up to the document
          console.log("clicked event");
        });
        // Add onClick event listener to the reschedule button
        rescheduleButton.addEventListener('click', (ee) => {
          ee.stopPropagation(); // Prevent the click event from bubbling up to the document
          console.log("clicked reschedule")
          // Remove the event element and the reschedule button
          eventContainer.remove();
        });
        eventContainer.style.position = 'relative';
        
        // Add position: absolute to the reschedule button
        rescheduleButton.style.position = 'relative';
        // Append the reschedule button to the container
        eventContainer.appendChild(rescheduleButton);
        
        // Find the hour element for the start hour
        const hourElement = document.querySelector(`.day-${startDay}-hour-${startHour}`);
        console.log("found hour element : ", hourElement);
        
        if (hourElement) {
          hourElement.appendChild(newDiv);
        }
      }
      });
    }
  };
  
  export default updateGridWithEvents;
  
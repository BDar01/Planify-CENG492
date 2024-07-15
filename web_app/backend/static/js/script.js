document.querySelectorAll('.event-chip').forEach(item => {
    item.addEventListener('click', event => {
        const day = item.dataset.day;
        const eventDetails = `You clicked on ${item.textContent} scheduled for ${day}.`;
        document.querySelector('.event-details').innerText = eventDetails;
        document.querySelector('.event-details').style.display = 'block'; // Show event details
    });
});

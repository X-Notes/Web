import './main.css';
import './main.scss';

particlesJS.load('particles-js', 'about/particles/config.json', function() {
    console.log('callback - particles.js config loaded');
});

function updateCurrentDate() {
    // Get the current date
    const currentDate = new Date();

    // Get the day, month, and year
    const day = currentDate.getDate();
    const month = currentDate.getMonth() + 1; // Month is 0-indexed, so add 1
    const year = currentDate.getFullYear();

    // Get the current time
    const hours = currentDate.getHours();
    const minutes = currentDate.getMinutes();
    const seconds = currentDate.getSeconds();

    // Format the date and time
    const formattedDate = day + "." + month + "." + year + " " + hours + ":" + minutes + ":" + seconds;

    // Update the content of the <p> element with id "currentDate"
    const el =  document.getElementById("footer-date");
    el.innerHTML = formattedDate;
    el.setAttribute('data-text', formattedDate);
}

setInterval(updateCurrentDate, 500);
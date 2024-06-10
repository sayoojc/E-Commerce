// Set the duration of the timer in seconds
const timerDiv = document.getElementById('timer');
const resendButton = document.getElementById('resendOtp');
const duration = 60;

function startTimer() {
  let seconds = duration;
  const timerInterval = setInterval(() => {
    timerDiv.textContent = `Time remaining ${seconds} seconds`; // Use `seconds` instead of `duration`
    seconds--;

    if (seconds < 0) {
      clearInterval(timerInterval);
      timerDiv.textContent = 'Time expired';
      resendButton.style.display = 'block'; // Show the button when timer expires
     
    }
  }, 1000);
}

window.onload = startTimer;
///////////event listener for starting the resend otp button//////////////////
resendButton.addEventListener('click',function(){
startTimer();
});
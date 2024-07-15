// Set the duration of the timer in seconds
const timerDiv = document.getElementById('timer');
const resendButton = document.getElementById('resendOtp');
const initialDuration = 60;
let remainingTime = localStorage.getItem('remainingTime') ? parseInt(localStorage.getItem('remainingTime')) : initialDuration;
resendButton.style.display= 'none';
function startTimer() {
  resendButton.style.display= 'none';
  document.getElementById('loaderOverlay').style.display = 'none';
  const timerInterval = setInterval(() => {
    timerDiv.textContent = `Time remaining ${remainingTime} seconds`;
    remainingTime--;
    localStorage.setItem('remainingTime', remainingTime); // Save the remaining time to localStorage

    if (remainingTime < 0) {
      clearInterval(timerInterval);
      timerDiv.textContent = 'Time expired';
      resendButton.style.display = 'block';
      localStorage.removeItem('remainingTime'); // Clear the localStorage when the timer expires
    }
  }, 1000);
}


window.onload = () => {
  if (remainingTime > 0) {
    startTimer();
  } else {
    timerDiv.textContent = 'Time expired';
    resendButton.style.display = 'block';
  }
};
///////////event listener for starting the resend otp button//////////////////
resendButton.addEventListener('click', function() {
  document.getElementById('loaderOverlay').style.display = 'flex';
});

document.getElementById('confirm').addEventListener('click',function(){
  document.getElementById('loaderOverlay').style.display = 'flex';
});


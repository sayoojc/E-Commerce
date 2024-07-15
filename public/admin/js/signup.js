function formValidation() {
    let name = document.forms['signupForm']['name'].value;
    let email = document.forms['signupForm']['email'].value;
    let password = document.forms['signupForm']['password'].value;
    let confirmPassword = document.forms['signupForm']['confirmPassword'].value;
 
    document.getElementById("userNameError").innerHTML = '';
    document.getElementById("emailError").innerHTML = '';
    document.getElementById("passwordError").innerHTML = '';
    document.getElementById("confirmPasswordError").innerHTML = '';
    
     
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(name === ''){
      document.getElementById("userNameError").innerHTML = 'Please enter a name';
      return false;
    }
    if(name.trim()!== name){
      document.getElementById('userNameError').innerHTML = 'No white space is not allowed before and after the name';
      return false;
    }
    if(email===''){
     document.getElementById('emailError').innerHTML = 'Please enter an email id to continue';
     return false;
    }
  
    if(!emailRegex.test(email)) {
      document.getElementById("emailError").innerHTML = 'please enter a valid email address';
      return false;
    }
    if(password === ''){
      document.getElementById('passwordError').innerHTML = 'please enter a password';
      return false;
    }
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if(!strongPasswordRegex.test(password)) {
      const passwordError = document.getElementById('passwordError');
      const passwordErrorDiv = document.getElementById('passwordErrorDiv');
      
      passwordErrorDiv.style.margin = '30px,30px';
      passwordErrorDiv.style.height = '50px' ;
      passwordError.innerHTML = 'password should contain At least one lowercase letter,one uppercase letter,one digit,one special character and Minimum length of 8 characters';

      return false;
    }
    if(confirmPassword === ''){
      document.getElementById('confirmPasswordError').innerHTML = 'Please re enter the password';
      return false;
    }
    if(password !== confirmPassword){
      document.getElementById('confirmPasswordError').innerHTML = 'Passwords doesnt match';
      return false;
    }
    document.getElementById('loaderOverlay').style.display = 'flex';
    return true;
 
    }

    document.getElementById('google-signin-button').addEventListener('click',function(){
      document.getElementById('loaderOverlay').style.display = 'flex';
     });
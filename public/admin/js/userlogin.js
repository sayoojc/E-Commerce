function formValidation() {

    document.getElementById('emailError').innerHTML = "";
    document.getElementById("passwordError").innerHTML = "";

    let email = document.forms['loginForm']['email'].value;
    let password = document.forms['loginForm']['password'].value;
    let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(!emailRegex.test(email)){
      document.getElementById('emailError').innerHTML = "Please enter a valid email address";
      return false;
    }

    if(password === ''){
      document.getElementById('passwordError').innerHTML = "please enter a password";
      return false;
    }
    
    return true;

   }